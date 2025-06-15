import { generateEmailTemplate, type Lang } from './email-template';

const translations: Record<Lang, { subject: string; text: string; intro: string; outro: string }> =
    {
        'en-US': {
            subject: 'XEO OS Verification Code',
            text: 'Your verification code is',
            intro: 'Welcome to XEO OS',
            outro: 'If you didn\'t request this, please ignore this email.',
        },
        'zh-CN': {
            subject: 'XEO OS 注册验证码',
            text: '您的验证码是',
            intro: '欢迎使用 XEO OS',
            outro: '如果您没有请求验证码，请忽略此邮件。',
        },
        'zh-TW': {
            subject: 'XEO OS 註冊驗證碼',
            text: '您的驗證碼是',
            intro: '歡迎使用 XEO OS',
            outro: '如果您未請求驗證碼，請忽略此郵件。',
        },
        'es-ES': {
            subject: 'Código de verificación de XEO OS',
            text: 'Tu código de verificación es',
            intro: 'Bienvenido a XEO OS',
            outro: 'Si no solicitaste esto, ignora este correo.',
        },
        'fr-FR': {
            subject: 'Code de vérification XEO OS',
            text: 'Votre code de vérification est',
            intro: 'Bienvenue sur XEO OS',
            outro: 'Si vous n\'avez pas demandé cela, ignorez cet e-mail.',
        },
        'ru-RU': {
            subject: 'Код подтверждения XEO OS',
            text: 'Ваш код подтверждения',
            intro: 'Добро пожаловать в XEO OS',
            outro: 'Если вы не запрашивали это, просто проигнорируйте письмо.',
        },
        'ja-JP': {
            subject: 'XEO OS 認証コード',
            text: 'あなたの認証コードは',
            intro: 'XEO OS へようこそ',
            outro: 'このメールに心当たりがない場合は無視してください。',
        },
        'de-DE': {
            subject: 'XEO OS Bestätigungscode',
            text: 'Dein Bestätigungscode ist',
            intro: 'Willkommen bei XEO OS',
            outro: 'Wenn du das nicht angefordert hast, ignoriere diese E-Mail.',
        },
        'pt-BR': {
            subject: 'Código de verificação XEO OS',
            text: 'Seu código de verificação é',
            intro: 'Bem-vindo ao XEO OS',
            outro: 'Se você não solicitou isso, ignore este e-mail.',
        },
        'ko-KR': {
            subject: 'XEO OS 인증 코드',
            text: '인증 코드는 다음과 같습니다',
            intro: 'XEO OS에 오신 것을 환영합니다',
            outro: '요청하지 않았다면 이 이메일을 무시하세요.',
        },
    };

export default function generateVerificationEmail(lang: Lang, code: string) {
    const t = translations[lang];

    const emailContent = generateEmailTemplate({
        title: 'XEO OS Verification',
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