import langs from '@/lib/lang';
import response from '../../_utils/response';
import prisma from '../../_utils/prisma';
import * as argon2 from 'argon2';
import shuffler from '../../_utils/shuffler';
import limitControl from '../../_utils/limit';
import token from '../../_utils/token';
import pack, { type PackedUserInfo } from '../../_utils/pack';
import * as Ably from 'ably';

let startTime: number;

async function updateTime(uid: number, time: number) {
    await prisma.user.update({
        where: {
            uid: uid,
        },
        data: {
            lastUseAt: new Date(time),
        },
    });
}

async function generateAblyToken(clientId: string) {
    try {
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY || '' });
        const channel = "user-" + clientId;
        const tokenDetails = await ably.auth.requestToken({
            clientId: clientId,
            ttl: 60 * 60 * 2,
            capability: {
                'broadcast': ['subscribe'],
                [channel]: ['subscribe'],
            },
        })
        return tokenDetails.token;
    } catch (error) {
        console.error('Error generating Ably token:', error);
        return null;
    }
}

export async function POST(request: Request) {
    startTime = Date.now();

    try {
        const body = await request.json();
        const { email, password, lang = 'en-US', token: refreshToken, expiredTime } = body || {};

        // 检查速率限制
        if (!(await limitControl.check(request))) {
            return response(429, {
                message: langs(
                    {
                        'zh-CN': '已触发速率限制',
                        'zh-TW': '已觸發速率限制',
                        'en-US': 'Rate limit exceeded',
                        'es-ES': 'Límite de velocidad excedido',
                        'fr-FR': 'Limite de débit dépassée',
                        'ru-RU': 'Превышен лимит скорости',
                        'ja-JP': 'レート制限を超えました',
                        'de-DE': 'Ratenlimit überschritten',
                        'pt-BR': 'Limite de taxa excedido',
                        'ko-KR': '속도 제한 초과',
                    },
                    lang,
                ),
            });
        }

        if (refreshToken) {
            // JWT 刷新登录
            let tokenInfo: PackedUserInfo | null = null;
            try {
                const verifiedToken = token.verify(refreshToken);
                if (
                    typeof verifiedToken === 'object' &&
                    verifiedToken !== null &&
                    'uid' in verifiedToken &&
                    'lastUseAt' in verifiedToken
                ) {
                    tokenInfo = verifiedToken as PackedUserInfo;
                } else {
                    tokenInfo = null;
                }
            } catch (err: unknown) {
                if ((err as Error).name === 'TokenExpiredError') {
                    return response(410, {
                        message: langs(
                            {
                                'zh-CN': 'TOKEN已过期，请重新登录',
                                'zh-TW': 'TOKEN已過期，請重新登入',
                                'en-US': 'Token expired, please login again',
                                'es-ES': 'Token expirado, por favor inicie sesión nuevamente',
                                'fr-FR': 'Token expiré, veuillez vous reconnecter',
                                'ru-RU': 'Токен истек, пожалуйста, войдите снова',
                                'ja-JP': 'トークンが期限切れです。再度ログインしてください',
                                'de-DE': 'Token abgelaufen, bitte erneut anmelden',
                                'pt-BR': 'Token expirado, faça login novamente',
                                'ko-KR': '토큰이 만료되었습니다. 다시 로그인하세요',
                            },
                            lang,
                        ),
                    });
                } else {
                    return response(400, {
                        message: langs(
                            {
                                'zh-CN': 'TOKEN无效',
                                'zh-TW': 'TOKEN無效',
                                'en-US': 'Invalid token',
                                'es-ES': 'Token inválido',
                                'fr-FR': 'Token invalide',
                                'ru-RU': 'Недействительный токен',
                                'ja-JP': '無効なトークン',
                                'de-DE': 'Ungültiger Token',
                                'pt-BR': 'Token inválido',
                                'ko-KR': '유효하지 않은 토큰',
                            },
                            lang,
                        ),
                    });
                }
            }

            // TOKEN有效，刷新TOKEN
            if (tokenInfo) {
                const result = await prisma.user.findUnique({
                    where: { uid: tokenInfo.uid },
                    include: {
                        avatar: true,
                    },
                });

                if (!result) {
                    return response(400, {
                        message: langs(
                            {
                                'zh-CN': '用户不存在',
                                'zh-TW': '用戶不存在',
                                'en-US': 'User not found',
                                'es-ES': 'Usuario no encontrado',
                                'fr-FR': 'Utilisateur non trouvé',
                                'ru-RU': 'Пользователь не найден',
                                'ja-JP': 'ユーザーが見つかりません',
                                'de-DE': 'Benutzer nicht gefunden',
                                'pt-BR': 'Usuário não encontrado',
                                'ko-KR': '사용자를 찾을 수 없습니다',
                            },
                            lang,
                        ),
                    });
                }

                if (result) {
                    await updateTime(result.uid, startTime);
                    const ablyToken = await generateAblyToken('user-' + result.uid);
                    
                    return response(200, {
                        ok: true,
                        message: langs(
                            {
                                'zh-CN': '登录成功',
                                'zh-TW': '登入成功',
                                'en-US': 'Login successful',
                                'es-ES': 'Inicio de sesión exitoso',
                                'fr-FR': 'Connexion réussie',
                                'ru-RU': 'Вход выполнен успешно',
                                'ja-JP': 'ログイン成功',
                                'de-DE': 'Anmeldung erfolgreich',
                                'pt-BR': 'Login bem-sucedido',
                                'ko-KR': '로그인 성공',
                            },
                            lang,
                        ),
                        // @ts-expect-error ass
                        user: pack(result, startTime),
                        // @ts-expect-error ass
                        jwt: token.sign({
                            inner: pack(result, startTime),
                            ablyToken: ablyToken || undefined,
                            expired: expiredTime || '7d',
                            
                        }),
                    });
                } else {
                    return response(420, {
                        message: langs(
                            {
                                'zh-CN': 'TOKEN未处于激活状态',
                                'zh-TW': 'TOKEN未處於激活狀態',
                                'en-US': 'Token is not active',
                                'es-ES': 'El token no está activo',
                                'fr-FR': "Le token n'est pas actif",
                                'ru-RU': 'Токен не активен',
                                'ja-JP': 'トークンがアクティブではありません',
                                'de-DE': 'Token ist nicht aktiv',
                                'pt-BR': 'Token não está ativo',
                                'ko-KR': '토큰이 활성 상태가 아닙니다',
                            },
                            lang,
                        ),
                    });
                }
            }
        } else if (email && password) {
            // 密码登录
            if (typeof email !== 'string' || typeof password !== 'string') {
                return response(400, {
                    message: langs(
                        {
                            'zh-CN': '邮箱和密码不能为空',
                            'zh-TW': '電子郵件和密碼不能為空',
                            'en-US': 'Email and password cannot be empty',
                            'es-ES': 'El correo electrónico y la contraseña no pueden estar vacíos',
                            'fr-FR': "L'email et le mot de passe ne peuvent pas être vides",
                            'ru-RU': 'Электронная почта и пароль не могут быть пустыми',
                            'ja-JP': 'メールアドレスとパスワードは空にできません',
                            'de-DE': 'E-Mail und Passwort dürfen nicht leer sein',
                            'pt-BR': 'O e-mail e a senha não podem estar vazios',
                            'ko-KR': '이메일과 비밀번호는 비워둘 수 없습니다',
                        },
                        lang,
                    ),
                });
            }

            // 验证密码长度
            if (password.length < 5) {
                return response(400, {
                    message: langs(
                        {
                            'zh-CN': '密码格式错误',
                            'zh-TW': '密碼格式錯誤',
                            'en-US': 'Invalid password format',
                            'es-ES': 'Formato de contraseña inválido',
                            'fr-FR': 'Format de mot de passe invalide',
                            'ru-RU': 'Неверный формат пароля',
                            'ja-JP': 'パスワード形式が無効です',
                            'de-DE': 'Ungültiges Passwort-Format',
                            'pt-BR': 'Formato de senha inválido',
                            'ko-KR': '잘못된 비밀번호 형식',
                        },
                        lang,
                    ),
                });
            }

            // 查询用户
            const result = await prisma.user.findFirst({
                where: {
                    OR: [{ email: email }, { username: email }],
                },
                include: {
                    avatar: true,
                },
            });

            if (!result) {
                return response(400, {
                    message: langs(
                        {
                            'zh-CN': '未找到此账号，请先注册',
                            'zh-TW': '未找到此帳號，請先註冊',
                            'en-US': 'Account not found, please register first',
                            'es-ES': 'Cuenta no encontrada, regístrese primero',
                            'fr-FR': "Compte non trouvé, veuillez vous inscrire d'abord",
                            'ru-RU': 'Аккаунт не найден, сначала зарегистрируйтесь',
                            'ja-JP': 'アカウントが見つかりません。まず登録してください',
                            'de-DE': 'Konto nicht gefunden, bitte zuerst registrieren',
                            'pt-BR': 'Conta não encontrada, registre-se primeiro',
                            'ko-KR': '계정을 찾을 수 없습니다. 먼저 등록하세요',
                        },
                        lang,
                    ),
                });
            }

            // 验证密码
            const shufflerPassword = shuffler(password);
            try {
                const passwordValidate = await argon2.verify(result.password, shufflerPassword);

                if (passwordValidate) {
                    await updateTime(result.uid, startTime);
                    limitControl.update(request);
                    const ablyToken = await generateAblyToken('user-' + result.uid);

                    return response(200, {
                        ok: true,
                        message: langs(
                            {
                                'zh-CN': '登录成功',
                                'zh-TW': '登入成功',
                                'en-US': 'Login successful',
                                'es-ES': 'Inicio de sesión exitoso',
                                'fr-FR': 'Connexion réussie',
                                'ru-RU': 'Вход выполнен успешно',
                                'ja-JP': 'ログイン成功',
                                'de-DE': 'Anmeldung erfolgreich',
                                'pt-BR': 'Login bem-sucedido',
                                'ko-KR': '로그인 성공',
                            },
                            lang,
                        ),
                        // @ts-expect-error fuckass
                        user: pack(result, startTime),
                        // @ts-expect-error fuckass
                        jwt: token.sign({
                            inner: pack(result, startTime),
                            ablyToken: ablyToken || undefined,
                            expired: expiredTime || '7d',
                            
                        }),
                    });
                } else {
                    return response(400, {
                        message: langs(
                            {
                                'zh-CN': '密码错误',
                                'zh-TW': '密碼錯誤',
                                'en-US': 'Incorrect password',
                                'es-ES': 'Contraseña incorrecta',
                                'fr-FR': 'Mot de passe incorrect',
                                'ru-RU': 'Неверный пароль',
                                'ja-JP': 'パスワードが間違っています',
                                'de-DE': 'Falsches Passwort',
                                'pt-BR': 'Senha incorreta',
                                'ko-KR': '잘못된 비밀번호',
                            },
                            lang,
                        ),
                    });
                }
            } catch (verifyError) {
                console.error('Password verification error:', verifyError);
                return response(400, {
                    message: langs(
                        {
                            'zh-CN': '密码验证失败',
                            'zh-TW': '密碼驗證失敗',
                            'en-US': 'Password verification failed',
                            'es-ES': 'Verificación de contraseña fallida',
                            'fr-FR': 'Échec de la vérification du mot de passe',
                            'ru-RU': 'Ошибка проверки пароля',
                            'ja-JP': 'パスワード検証に失敗しました',
                            'de-DE': 'Passwort-Verifizierung fehlgeschlagen',
                            'pt-BR': 'Falha na verificação da senha',
                            'ko-KR': '비밀번호 검증 실패',
                        },
                        lang,
                    ),
                });
            }
        } else {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '缺少必要的参数',
                        'zh-TW': '缺少必要的參數',
                        'en-US': 'Missing required parameters',
                        'es-ES': 'Faltan parámetros requeridos',
                        'fr-FR': 'Paramètres requis manquants',
                        'ru-RU': 'Отсутствуют обязательные параметры',
                        'ja-JP': '必要なパラメータが不足しています',
                        'de-DE': 'Erforderliche Parameter fehlen',
                        'pt-BR': 'Parâmetros obrigatórios ausentes',
                        'ko-KR': '필수 매개변수가 누락되었습니다',
                    },
                    lang,
                ),
            });
        }
    } catch (error) {
        console.error(error);
        const lang = 'en-US';
        return response(500, {
            message: langs(
                {
                    'zh-CN': '服务器内部错误',
                    'zh-TW': '伺服器內部錯誤',
                    'en-US': 'Internal server error',
                    'es-ES': 'Error interno del servidor',
                    'fr-FR': 'Erreur interne du serveur',
                    'ru-RU': 'Внутренняя ошибка сервера',
                    'ja-JP': 'サーバー内部エラー',
                    'de-DE': 'Interner Serverfehler',
                    'pt-BR': 'Erro interno do servidor',
                    'ko-KR': '내부 서버 오류',
                },
                lang,
            ),
            error: error,
        });
    }
}
