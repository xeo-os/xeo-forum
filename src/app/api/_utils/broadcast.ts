import * as Ably from 'ably';
type Message = {
    title: string;
    content: string;
    link: string;
    locale: string;
};

export default async function broadcast(
    message: Message,
) {
    const ably = new Ably.Rest(process.env.ABLY_API_KEY || '');
    const channel = ably.channels.get('broadcast');
    await channel.publish('new-message', {
        message,
    });
    return {
        ok: true,
        method: 'socket',
    };
}
