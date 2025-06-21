import lang from '@/lib/lang';
import * as Ably from 'ably';
import { Resend } from 'resend';
import { generateEmailTemplate, type Lang } from './email-template';
import prisma from './prisma';

type Message = {
    type: 'message';
    title: string;
    content: string;
    link: string;
    locale: string;
};

function htmlToText(html: string): string {
    // Remove HTML tags and decode HTML entities
    return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace ampersands
        .replace(/&lt;/g, '<') // Replace less than
        .replace(/&gt;/g, '>') // Replace greater than
        .replace(/&quot;/g, '"') // Replace quotes
        .replace(/&#39;/g, "'") // Replace apostrophes
        .trim();
}

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
    const party = ably.channels.get('broadcast');
    const presence = await party.presence.get();
    const isOnline = presence.items.some(
        (member: { clientId: string }) => member.clientId === user.uid.toString(),
    );
    let id;
    try {
        const result = await prisma.notice.create({
            data: {
                userId: Number(user.uid),
                content: htmlToText(message.content),
                link: message.link,
            },
        });
        id = result.id;
    } catch (error) {
        console.error('Error saving message to database:', error);
        return {
            ok: false,
            error: 'Failed to save message to database',
        };
    }

    if (isOnline) {
        // socket notification
        try {
            await channel.publish('new-message', {
                message: {
                    title: message.title,
                    content: htmlToText(message.content),
                    link: message.link,
                    locale: message.locale || 'en-US',
                    type: message.type || 'message',
                    id: id,
                }
            });
            return {
                ok: true,
                method: 'socket',
            };
        } catch (error) {
            console.error('Error publishing socket message:', error);
        }
    } else {
        // email notification
        try {
            const userMessageSetting = await prisma.user.findUnique({
                where: { uid: Number(user.uid) },
                select: { emailNotice: true },
            });
            if (!userMessageSetting?.emailNotice) {
                return {
                    ok: false,
                    error: 'User has disabled email notifications',
                };
            }
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
}
