type Lang =
    | 'en-US'
    | 'zh-CN'
    | 'zh-TW'
    | 'es-ES'
    | 'fr-FR'
    | 'ru-RU'
    | 'ja-JP'
    | 'de-DE'
    | 'pt-BR'
    | 'ko-KR';

const translations: Record<Lang, { subject: string; text: string; intro: string; outro: string }> =
    {
        'en-US': {
            subject: 'XEO OS Verification Code',
            text: 'Your verification code is',
            intro: 'Welcome to XEO OS',
            outro: 'If you didn’t request this, please ignore this email.',
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
            outro: 'Si vous n’avez pas demandé cela, ignorez cet e-mail.',
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

    const html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XEO OS Verification</title>
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#0d1117;color:#e6edf3;line-height:1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:20px;">
          <tr>
            <td align="center">
              <table style="max-width:600px;width:100%;background:linear-gradient(135deg, #161b22 0%, #1c2128 100%);border-radius:16px;padding:40px;border:1px solid #30363d;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
                <tr>
                  <td style="text-align:center;">
                    <!-- Header -->
                    <div style="margin-bottom:32px;">
                      <h1 style="margin:0;font-size:32px;font-weight:700;color:#f0b100;text-shadow:0 2px 4px rgba(240,177,0,0.3);">XEO OS</h1>
                      <p style="margin:8px 0 0;font-size:14px;color:#7d8590;font-weight:500;letter-spacing:0.5px;">Xchange Everyone's Option</p>
                      <div style="width:60px;height:3px;background:linear-gradient(90deg, #f0b100, #ffd700);margin:16px auto;border-radius:2px;"></div>
                    </div>
                    
                    <!-- Content -->
                    <div style="margin:32px 0;">
                      <h2 style="font-size:22px;margin:0 0 20px;color:#e6edf3;font-weight:600;">${t.intro}</h2>
                      <div style="background:#21262d;border:1px solid #30363d;border-radius:12px;padding:24px;margin:20px 0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);">
                        <p style="font-size:16px;margin:0 0 16px;color:#e6edf3;">${t.text}</p>
                        <div style="font-size:36px;font-weight:700;color:#f0b100;letter-spacing:6px;text-shadow:0 2px 4px rgba(240,177,0,0.3);margin:16px 0;">${code}</div>
                      </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="margin-top:48px;padding-top:24px;border-top:1px solid #30363d;">
                      <p style="font-size:14px;color:#7d8590;margin:16px 0;">${t.outro}</p>
                      <p style="font-size:12px;color:#7d8590;margin:8px 0;">
                        <span style="color:#6e7681;">noreply@xeoos.net</span> · 
                        <a href="https://xeoos.net" style="color:#f0b100;text-decoration:none;font-weight:500;">xeoos.net</a>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    return {
        subject: t.subject,
        html,
    };
}
