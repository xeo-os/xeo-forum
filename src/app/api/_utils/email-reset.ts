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

    const html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XEO OS Password Reset</title>
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
