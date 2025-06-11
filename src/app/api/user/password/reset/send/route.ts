import limitControl from '../../../../_utils/limit';
import response from '../../../../_utils/response';
import prisma from '../../../../_utils/prisma';
import { Resend } from 'resend';
import generatePasswordResetEmail from '../../../../_utils/email-reset';
import langs from '@/lib/lang';

const resend = new Resend(process.env.RESEND_API_KEY as string);

function generateCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const timestamp = Math.floor(Date.now() / 1000);
    return `${code}+${timestamp}`;
}

function extractCode(codeWithTimestamp: string): string {
    return codeWithTimestamp.split('+')[0];
}

export async function POST(request: Request) {
    const body = await request.json();
    const { email, turnstileToken, lang = 'en-US' } = body;

    if (!email || !turnstileToken) {
        return response(400, {
            message: langs(
                {
                    'zh-CN': '邮箱和验证令牌不能为空',
                    'en-US': 'Email and verification token cannot be empty',
                    'zh-TW': '電子郵件和驗證令牌不能為空',
                    'ja-JP': 'メールアドレスと認証トークンは空にできません',
                    'ko-KR': '이메일과 인증 토큰은 비워둘 수 없습니다',
                    'es-ES':
                        'El correo electrónico y el token de verificación no pueden estar vacíos',
                    'fr-FR': "L'email et le token de vérification ne peuvent pas être vides",
                    'ru-RU': 'Электронная почта и токен подтверждения не могут быть пустыми',
                    'de-DE': 'E-Mail und Verifizierungstoken dürfen nicht leer sein',
                    'pt-BR': 'O e-mail e o token de verificação não podem estar vazios',
                },
                lang,
            ),
        });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return response(400, {
            message: langs(
                {
                    'zh-CN': '邮箱格式不正确',
                    'zh-TW': '電子郵件格式不正確',
                    'en-US': 'Invalid email format',
                    'es-ES': 'Formato de correo electrónico inválido',
                    'fr-FR': "Format d'email invalide",
                    'ru-RU': 'Неверный формат электронной почты',
                    'ja-JP': 'メールアドレスの形式が正しくありません',
                    'de-DE': 'Ungültiges E-Mail-Format',
                    'pt-BR': 'Formato de e-mail inválido',
                    'ko-KR': '잘못된 이메일 형식입니다',
                },
                lang,
            ),
        });
    }

    // 验证Turnstile
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
        // 检查用户是否存在
        const user = await prisma.user.findUnique({
            where: { email },
            select: { uid: true },
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

        try {
            const resetCode = generateCode();

            await prisma.user.update({
                where: { email },
                data: { emailVerifyCode: resetCode },
            });

            const emailContent = generatePasswordResetEmail(lang, extractCode(resetCode));
            const resendConfig = {
                ...emailContent,
                from: process.env.VERIFY_EMAIL_FROM as string,
                to: email,
            };

            await resend.emails.send(resendConfig);

            return response(200, {
                ok: true,
                message: langs(
                    {
                        'zh-CN': '重置验证码已发送到您的邮箱',
                        'zh-TW': '重置驗證碼已發送到您的電子郵件',
                        'en-US': 'Reset code has been sent to your email',
                        'es-ES': 'El código de restablecimiento ha sido enviado a tu correo',
                        'fr-FR': 'Le code de réinitialisation a été envoyé à votre email',
                        'ru-RU': 'Код сброса отправлен на вашу электронную почту',
                        'ja-JP': 'リセットコードがメールアドレスに送信されました',
                        'de-DE': 'Reset-Code wurde an Ihre E-Mail gesendet',
                        'pt-BR': 'Código de redefinição foi enviado para seu e-mail',
                        'ko-KR': '재설정 코드가 이메일로 전송되었습니다',
                    },
                    lang,
                ),
            });
        } catch (error) {
            console.error('Send reset email error:', error);
            return response(500, {
                message: langs(
                    {
                        'zh-CN': '发送邮件失败，请稍后再试',
                        'zh-TW': '發送郵件失敗，請稍後再試',
                        'en-US': 'Failed to send email, please try again later',
                        'es-ES': 'Error al enviar correo, inténtalo más tarde',
                        'fr-FR': "Échec de l'envoi de l'email, veuillez réessayer plus tard",
                        'ru-RU': 'Не удалось отправить письмо, попробуйте позже',
                        'ja-JP': 'メールの送信に失敗しました。後でもう一度お試しください',
                        'de-DE': 'E-Mail senden fehlgeschlagen, bitte später versuchen',
                        'pt-BR': 'Falha ao enviar e-mail, tente novamente mais tarde',
                        'ko-KR': '이메일 전송에 실패했습니다. 나중에 다시 시도해 주세요',
                    },
                    lang,
                ),
            });
        }
    }
}
