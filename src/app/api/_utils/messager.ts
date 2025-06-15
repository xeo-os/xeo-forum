import lang from '@/lib/lang';
import * as Ably from 'ably';
import { Resend } from 'resend';
import { generateEmailTemplate, type Lang } from './email-template';

type Message = {
    type: 'message';
    title: string;
    content: string;
    link: string;
    locale: string;
};

function getEmailContent(message: Message) {
    const buttonText = lang(
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
    );

    return generateEmailTemplate(
        {
            title: 'XEO OS Notification',
            heading: message.title,
            content: message.content,
            actionButton: {
                text: buttonText,
                url: message.link,
            },
        },
        (message.locale || 'en-US') as Lang,
    );
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
        const emailContent = getEmailContent(message);

        await resend.emails.send({
            from: process.env.VERIFY_EMAIL_FROM as string,
            to: user.email,
            subject: message.title,
            html: emailContent.html,
            text: emailContent.text,
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
