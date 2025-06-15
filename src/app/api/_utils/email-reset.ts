import { generateEmailTemplate, type Lang } from './email-template';

const translations: Record<Lang, { subject: string; text: string; intro: string; outro: string }> =
    {
        'en-US': {
            subject: 'XEO OS Password Reset Code',
            text: 'Your password reset code is',
            intro: 'Reset your XEO OS password',
            outro: "If you didn't request this, please ignore this email. This code will expire in 15 minutes.",
        },
        'zh-CN': {
            subject: 'XEO OS 密码重置验证码',
            text: '您的密码重置验证码是',
            intro: '重置您的 XEO OS 密码',
            outro: '如果您没有请求密码重置，请忽略此邮件。此验证码将在15分钟后过期。',
        },
        'zh-TW': {
            subject: 'XEO OS 密碼重置驗證碼',
            text: '您的密碼重置驗證碼是',
            intro: '重置您的 XEO OS 密碼',
            outro: '如果您未請求密碼重置，請忽略此郵件。此驗證碼將在15分鐘後過期。',
        },
        'es-ES': {
            subject: 'Código de restablecimiento de contraseña XEO OS',
            text: 'Tu código de restablecimiento de contraseña es',
            intro: 'Restablecer tu contraseña de XEO OS',
            outro: 'Si no solicitaste esto, ignora este correo. Este código expirará en 15 minutos.',
        },
        'fr-FR': {
            subject: 'Code de réinitialisation de mot de passe XEO OS',
            text: 'Votre code de réinitialisation de mot de passe est',
            intro: 'Réinitialiser votre mot de passe XEO OS',
            outro: "Si vous n'avez pas demandé cela, ignorez cet e-mail. Ce code expirera dans 15 minutes.",
        },
        'ru-RU': {
            subject: 'Код сброса пароля XEO OS',
            text: 'Ваш код сброса пароля',
            intro: 'Сброс пароля XEO OS',
            outro: 'Если вы не запрашивали это, просто проигнорируйте письмо. Код истечет через 15 минут.',
        },
        'ja-JP': {
            subject: 'XEO OS パスワードリセットコード',
            text: 'あなたのパスワードリセットコードは',
            intro: 'XEO OS パスワードをリセット',
            outro: 'このメールに心当たりがない場合は無視してください。このコードは15分後に期限切れになります。',
        },
        'de-DE': {
            subject: 'XEO OS Passwort-Reset-Code',
            text: 'Dein Passwort-Reset-Code ist',
            intro: 'XEO OS Passwort zurücksetzen',
            outro: 'Wenn du das nicht angefordert hast, ignoriere diese E-Mail. Dieser Code läuft in 15 Minuten ab.',
        },
        'pt-BR': {
            subject: 'Código de redefinição de senha XEO OS',
            text: 'Seu código de redefinição de senha é',
            intro: 'Redefinir sua senha XEO OS',
            outro: 'Se você não solicitou isso, ignore este e-mail. Este código expirará em 15 minutos.',
        },
        'ko-KR': {
            subject: 'XEO OS 비밀번호 재설정 코드',
            text: '비밀번호 재설정 코드는 다음과 같습니다',
            intro: 'XEO OS 비밀번호 재설정',
            outro: '요청하지 않았다면 이 이메일을 무시하세요. 이 코드는 15분 후 만료됩니다.',
        },
    };

export default function generatePasswordResetEmail(lang: Lang, code: string) {
    const t = translations[lang];

    const emailContent = generateEmailTemplate({
        title: 'XEO OS Password Reset',
        heading: t.intro,
        content: t.text,
        code: code,
        footer: t.outro
    }, lang);

    return {
        subject: t.subject,
        html: emailContent.html,
        text: emailContent.text,
    };
}