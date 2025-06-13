import lang from '@/lib/lang';
import * as Ably from 'ably';
import { Resend } from 'resend';
type Message = {
    type: 'message';
    title: string;
    content: string;
    link: string;
    locale: string;
};

function getHTMLEmailContent(message: Message) {
    return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XEO OS Notification</title>
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
                      <h2 style="font-size:22px;margin:0 0 20px;color:#e6edf3;font-weight:600;">${message.title}</h2>
                      <div style="background:#21262d;border:1px solid #30363d;border-radius:12px;padding:24px;margin:20px 0;text-align:left;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);">
                        <div style="font-size:16px;color:#e6edf3;word-wrap:break-word;line-height:1.6;">${message.content}</div>
                      </div>
                    </div>
                    
                    <!-- Action Button -->
                    <div style="margin:32px 0;">
                      <a href="${message.link}" style="display:inline-block;background:linear-gradient(135deg, #f0b100 0%, #ffd700 100%);color:#0d1117;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(240,177,0,0.3);transition:all 0.3s ease;">
                        ${lang(
                            {
                                'zh-CN': '查看消息',
                                'en-US': 'View Message',
                                'ko-KR': '메시지 보기',
                                'de-DE': 'Nachricht anzeigen',
                                'fr-FR': 'Voir le message',
                                'es-ES': 'Ver mensaje',
                                'ru-RU': 'Просмотреть сообщение',
                                'ja-JP': 'メッセージを見る',
                                'pt-BR': 'Ver mensagem',
                                'zh-TW': '查看消息',
                            },
                            message.locale || 'en-US',
                        )}
                      </a>
                    </div>
                    
                    <!-- Footer -->
                    <div style="margin-top:48px;padding-top:24px;border-top:1px solid #30363d;">
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
}

export default async function messager(
    message: Message,
    user: {
        uid: string;
        nickname: string;
        email: string;
    },
) {
    const ably = new Ably.Rest(process.env.ABLY_API_KEY || '');
    const channel = ably.channels.get('user-' + user.uid);
    const presence = await channel.presence.get();
    const isOnline = presence.items.some(
        (member: { clientId: string }) => member.clientId === user.uid.toString(),
    );

    if (isOnline) {
        try {
            await channel.publish('new-message', {
                message,
            });
            return {
                ok: true,
                method: 'socket',
            };
        } catch (error) {
            console.error('Error publishing socket message:', error);
        }
    }

    // Send email if user is offline or socket message failed
    try {
        const resend = new Resend(process.env.RESEND_API_KEY as string);

        await resend.emails.send({
            from: process.env.VERIFY_EMAIL_FROM as string,
            to: user.email,
            subject: message.title,
            html: getHTMLEmailContent(message),
        });

        return {
            ok: true,
            method: 'email',
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            ok: false,
            error: 'Failed to send notification',
        };
    }
}
