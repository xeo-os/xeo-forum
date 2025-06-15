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

const emailSettingsTranslations: Record<Lang, string> = {
    'en-US': 'Email Settings',
    'zh-CN': '邮件设置',
    'zh-TW': '郵件設定',
    'es-ES': 'Configuración de correo',
    'fr-FR': 'Paramètres email',
    'ru-RU': 'Настройки почты',
    'ja-JP': 'メール設定',
    'de-DE': 'E-Mail-Einstellungen',
    'pt-BR': 'Configurações de email',
    'ko-KR': '이메일 설정',
};

interface EmailTemplateData {
    title: string;
    heading: string;
    content: string;
    footer?: string;
    actionButton?: {
        text: string;
        url: string;
    };
    code?: string;
}

function generateHTMLTemplate(data: EmailTemplateData, lang: Lang): string {
    const emailSettings = emailSettingsTranslations[lang];
    
    return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
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
                      <h2 style="font-size:22px;margin:0 0 20px;color:#e6edf3;font-weight:600;">${data.heading}</h2>
                      <div style="background:#21262d;border:1px solid #30363d;border-radius:12px;padding:24px;margin:20px 0;${data.actionButton ? 'text-align:left;' : ''}box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);">
                        ${data.content ? `<div style="font-size:16px;color:#e6edf3;word-wrap:break-word;line-height:1.6;${data.code ? 'margin:0 0 16px;' : ''}">${data.content}</div>` : ''}
                        ${data.code ? `<div style="font-size:36px;font-weight:700;color:#f0b100;letter-spacing:6px;text-shadow:0 2px 4px rgba(240,177,0,0.3);margin:16px 0;text-align:center;">${data.code}</div>` : ''}
                      </div>
                    </div>
                    
                    ${data.actionButton ? `
                    <!-- Action Button -->
                    <div style="margin:32px 0;">
                      <a href="${data.actionButton.url}" style="display:inline-block;background:linear-gradient(135deg, #f0b100 0%, #ffd700 100%);color:#0d1117;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(240,177,0,0.3);transition:all 0.3s ease;">
                        ${data.actionButton.text}
                      </a>
                    </div>
                    ` : ''}
                    
                    <!-- Footer -->
                    <div style="margin-top:48px;padding-top:24px;border-top:1px solid #30363d;">
                      ${data.footer ? `<p style="font-size:14px;color:#7d8590;margin:16px 0;">${data.footer}</p>` : ''}
                      <p style="font-size:12px;color:#7d8590;margin:8px 0;">
                        <span style="color:#6e7681;">noreply@xeoos.net</span> · 
                        <a href="https://xeoos.net" style="color:#f0b100;text-decoration:none;font-weight:500;">xeoos.net</a>
                      </p>
                      <p style="font-size:12px;color:#7d8590;margin:8px 0;">
                        <a href="https://xeoos.net/setting" style="color:#7d8590;text-decoration:none;">${emailSettings}</a>
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
}

function generateTextTemplate(data: EmailTemplateData, lang: Lang): string {
    const emailSettings = emailSettingsTranslations[lang];
    
    let text = `XEO OS - Xchange Everyone's Option\n\n`;
    text += `${data.heading}\n`;
    text += `${'='.repeat(data.heading.length)}\n\n`;
    
    if (data.content) {
        text += `${data.content}\n\n`;
    }
    
    if (data.code) {
        text += `${data.code}\n\n`;
    }
    
    if (data.actionButton) {
        text += `${data.actionButton.text}: ${data.actionButton.url}\n\n`;
    }
    
    if (data.footer) {
        text += `${data.footer}\n\n`;
    }
    
    text += `---\n`;
    text += `noreply@xeoos.net | xeoos.net\n`;
    text += `${emailSettings}: https://xeoos.net/setting\n`;
    
    return text;
}

export function generateEmailTemplate(data: EmailTemplateData, lang: Lang) {
    return {
        html: generateHTMLTemplate(data, lang),
        text: generateTextTemplate(data, lang)
    };
}

export type { Lang, EmailTemplateData };
