import limitControl from '../../../../_utils/limit';
import response from '../../../../_utils/response';
import prisma from '../../../../_utils/prisma';
import argon2 from 'argon2';
import shuffler from '../../../../_utils/shuffler';
import langs from '@/lib/lang';

async function encrypt(password: string): Promise<string> {
    const options = {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 8,
        hashLength: 32,
    };
    const hashedPassword = await argon2.hash(shuffler(password), options);
    return hashedPassword;
}

function isCodeExpired(codeWithTimestamp: string): boolean {
    const parts = codeWithTimestamp.split('+');
    if (parts.length !== 2) return true;

    const timestamp = parseInt(parts[1]);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const fifteenMinutes = 15 * 60; // 15分钟 = 900秒

    return currentTimestamp - timestamp > fifteenMinutes;
}

function extractCode(codeWithTimestamp: string): string {
    return codeWithTimestamp.split('+')[0];
}

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password, code, turnstileToken, lang = 'en-US' } = body;

    if (!email || !password || !code || !turnstileToken) {
        return response(400, {
            message: langs(
                {
                    'zh-CN': '邮箱、密码、验证码和验证令牌不能为空',
                    'en-US': 'Email, password, verification code and token cannot be empty',
                    'zh-TW': '電子郵件、密碼、驗證碼和驗證令牌不能為空',
                    'ja-JP': 'メールアドレス、パスワード、認証コード、認証トークンは空にできません',
                    'ko-KR': '이메일, 비밀번호, 인증 코드, 인증 토큰은 비워둘 수 없습니다',
                    'es-ES':
                        'El correo, contraseña, código y token de verificación no pueden estar vacíos',
                    'fr-FR':
                        "L'email, mot de passe, code et token de vérification ne peuvent pas être vides",
                    'ru-RU':
                        'Электронная почта, пароль, код и токен подтверждения не могут быть пустыми',
                    'de-DE':
                        'E-Mail, Passwort, Code und Verifizierungstoken dürfen nicht leer sein',
                    'pt-BR': 'E-mail, senha, código e token de verificação não podem estar vazios',
                },
                lang,
            ),
        });
    }

    // 验证Turnstile（防止暴力破解）
    try {
        const turnstileResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET_KEY as string,
                    response: turnstileToken,
                }),
            },
        );

        const turnstileResult = await turnstileResponse.json();

        if (!turnstileResult.success) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '验证失败，请重试',
                        'zh-TW': '驗證失敗，請重試',
                        'en-US': 'Verification failed, please try again',
                        'es-ES': 'Verificación fallida, inténtalo de nuevo',
                        'fr-FR': 'Échec de la vérification, veuillez réessayer',
                        'ru-RU': 'Проверка не удалась, попробуйте еще раз',
                        'ja-JP': '認証に失敗しました。再度お試しください',
                        'de-DE': 'Verifizierung fehlgeschlagen, bitte erneut versuchen',
                        'pt-BR': 'Verificação falhou, tente novamente',
                        'ko-KR': '인증에 실패했습니다. 다시 시도해 주세요',
                    },
                    lang,
                ),
            });
        }
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return response(500, {
            message: langs(
                {
                    'zh-CN': '验证服务异常',
                    'zh-TW': '驗證服務異常',
                    'en-US': 'Verification service error',
                    'es-ES': 'Error del servicio de verificación',
                    'fr-FR': 'Erreur du service de vérification',
                    'ru-RU': 'Ошибка службы проверки',
                    'ja-JP': '認証サービスエラー',
                    'de-DE': 'Verifizierungsdienst-Fehler',
                    'pt-BR': 'Erro do serviço de verificação',
                    'ko-KR': '인증 서비스 오류',
                },
                lang,
            ),
        });
    }

    // 检查密码长度
    if (password.length < 6 || password.length > 50) {
        return response(400, {
            message: langs(
                {
                    'zh-CN': '密码长度必须在6到50个字符之间',
                    'zh-TW': '密碼長度必須在6到50個字符之間',
                    'en-US': 'Password must be between 6 and 50 characters',
                    'es-ES': 'La contraseña debe tener entre 6 y 50 caracteres',
                    'fr-FR': 'Le mot de passe doit contenir entre 6 et 50 caractères',
                    'ru-RU': 'Пароль должен содержать от 6 до 50 символов',
                    'ja-JP': 'パスワードは6文字以上50文字以下である必要があります',
                    'de-DE': 'Passwort muss zwischen 6 und 50 Zeichen lang sein',
                    'pt-BR': 'Senha deve ter entre 6 e 50 caracteres',
                    'ko-KR': '비밀번호는 6자에서 50자 사이여야 합니다',
                },
                lang,
            ),
        });
    }

    // 速率限制
    try {
        const isAllowed = await limitControl.check(request);

        if (!isAllowed) {
            return response(429, {
                message: langs(
                    {
                        'zh-CN': '请求过于频繁，请稍后再试',
                        'zh-TW': '請求過於頻繁，請稍後再試',
                        'en-US': 'Too many requests, please try again later',
                        'es-ES': 'Demasiadas solicitudes, inténtalo más tarde',
                        'fr-FR': 'Trop de demandes, veuillez réessayer plus tard',
                        'ru-RU': 'Слишком много запросов, попробуйте позже',
                        'ja-JP': 'リクエストが多すぎます。後でもう一度お試しください',
                        'de-DE': 'Zu viele Anfragen, bitte später versuchen',
                        'pt-BR': 'Muitas solicitações, tente novamente mais tarde',
                        'ko-KR': '요청이 너무 많습니다. 나중에 다시 시도해 주세요',
                    },
                    lang,
                ),
            });
        }

        const result = await main();

        await limitControl.update(request);

        return result;
    } catch (error) {
        console.error('Rate limit check error:', error);
        return response(500, {
            message: langs(
                {
                    'zh-CN': '服务器错误，请稍后再试',
                    'zh-TW': '伺服器錯誤，請稍後再試',
                    'en-US': 'Server error, please try again later',
                    'es-ES': 'Error del servidor, inténtalo más tarde',
                    'fr-FR': 'Erreur du serveur, veuillez réessayer plus tard',
                    'ru-RU': 'Ошибка сервера, попробуйте позже',
                    'ja-JP': 'サーバーエラー。後でもう一度お試しください',
                    'de-DE': 'Server-Fehler, bitte später versuchen',
                    'pt-BR': 'Erro do servidor, tente novamente mais tarde',
                    'ko-KR': '서버 오류입니다. 나중에 다시 시도해 주세요',
                },
                lang,
            ),
        });
    }

    async function main() {
        // 检查用户是否存在并获取验证码
        const user = await prisma.user.findUnique({
            where: { email },
            select: { uid: true, emailVerifyCode: true },
        });

        if (!user) {
            return response(404, {
                message: langs(
                    {
                        'zh-CN': '用户不存在',
                        'zh-TW': '使用者不存在',
                        'en-US': 'User does not exist',
                        'es-ES': 'El usuario no existe',
                        'fr-FR': "L'utilisateur n'existe pas",
                        'ru-RU': 'Пользователь не существует',
                        'ja-JP': 'ユーザーが存在しません',
                        'de-DE': 'Benutzer existiert nicht',
                        'pt-BR': 'Usuário não existe',
                        'ko-KR': '사용자가 존재하지 않습니다',
                    },
                    lang,
                ),
            });
        }

        // 检查验证码
        if (!user.emailVerifyCode) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '验证码已过期或不存在，请重新获取',
                        'zh-TW': '驗證碼已過期或不存在，請重新獲取',
                        'en-US':
                            'Verification code expired or does not exist, please request a new one',
                        'es-ES': 'Código de verificación expirado o no existe, solicita uno nuevo',
                        'fr-FR':
                            'Code de vérification expiré ou inexistant, veuillez en demander un nouveau',
                        'ru-RU': 'Код подтверждения истек или не существует, запросите новый',
                        'ja-JP':
                            '認証コードが期限切れまたは存在しません。新しいコードをリクエストしてください',
                        'de-DE':
                            'Bestätigungscode abgelaufen oder existiert nicht, bitte einen neuen anfordern',
                        'pt-BR': 'Código de verificação expirado ou não existe, solicite um novo',
                        'ko-KR': '인증 코드가 만료되었거나 존재하지 않습니다. 새 코드를 요청하세요',
                    },
                    lang,
                ),
            });
        }

        // 检查验证码是否过期
        if (isCodeExpired(user.emailVerifyCode)) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '验证码已过期，请重新获取',
                        'zh-TW': '驗證碼已過期，請重新獲取',
                        'en-US': 'Verification code has expired, please request a new one',
                        'es-ES': 'El código de verificación ha expirado, solicita uno nuevo',
                        'fr-FR':
                            'Le code de vérification a expiré, veuillez en demander un nouveau',
                        'ru-RU': 'Код подтверждения истек, запросите новый',
                        'ja-JP': '認証コードが期限切れです。新しいコードをリクエストしてください',
                        'de-DE': 'Bestätigungscode ist abgelaufen, bitte einen neuen anfordern',
                        'pt-BR': 'Código de verificação expirou, solicite um novo',
                        'ko-KR': '인증 코드가 만료되었습니다. 새 코드를 요청하세요',
                    },
                    lang,
                ),
            });
        }

        // 验证验证码
        const storedCode = extractCode(user.emailVerifyCode);
        if (storedCode !== code) {
            return response(400, {
                message: langs(
                    {
                        'zh-CN': '验证码错误',
                        'zh-TW': '驗證碼錯誤',
                        'en-US': 'Invalid verification code',
                        'es-ES': 'Código de verificación incorrecto',
                        'fr-FR': 'Code de vérification incorrect',
                        'ru-RU': 'Неверный код подтверждения',
                        'ja-JP': '認証コードが正しくありません',
                        'de-DE': 'Ungültiger Bestätigungscode',
                        'pt-BR': 'Código de verificação inválido',
                        'ko-KR': '잘못된 인증 코드입니다',
                    },
                    lang,
                ),
            });
        }

        // 重置密码
        try {
            await prisma.user.update({
                where: { email },
                data: {
                    password: await encrypt(password),
                    emailVerifyCode: null, // 清除验证码
                },
            });

            await prisma.$disconnect();

            return response(200, {
                ok: true,
                message: langs(
                    {
                        'zh-CN': '密码重置成功',
                        'zh-TW': '密碼重置成功',
                        'en-US': 'Password reset successful',
                        'es-ES': 'Restablecimiento de contraseña exitoso',
                        'fr-FR': 'Réinitialisation du mot de passe réussie',
                        'ru-RU': 'Пароль успешно сброшен',
                        'ja-JP': 'パスワードのリセットが成功しました',
                        'de-DE': 'Passwort erfolgreich zurückgesetzt',
                        'pt-BR': 'Redefinição de senha bem-sucedida',
                        'ko-KR': '비밀번호 재설정이 성공했습니다',
                    },
                    lang,
                ),
            });
        } catch (error) {
            console.error('Password reset error:', error);
            return response(500, {
                message: langs(
                    {
                        'zh-CN': '密码重置失败，请稍后再试',
                        'zh-TW': '密碼重置失敗，請稍後再試',
                        'en-US': 'Password reset failed, please try again later',
                        'es-ES': 'Error al restablecer contraseña, inténtalo más tarde',
                        'fr-FR':
                            'Échec de la réinitialisation du mot de passe, veuillez réessayer plus tard',
                        'ru-RU': 'Не удалось сбросить пароль, попробуйте позже',
                        'ja-JP': 'パスワードのリセットに失敗しました。後でもう一度お試しください',
                        'de-DE': 'Passwort-Reset fehlgeschlagen, bitte später versuchen',
                        'pt-BR': 'Falha na redefinição de senha, tente novamente mais tarde',
                        'ko-KR': '비밀번호 재설정에 실패했습니다. 나중에 다시 시도해 주세요',
                    },
                    lang,
                ),
            });
        }
    }
}
