import prisma from '../../_utils/prisma';
import auth from '../../_utils/auth';
import response from '../../_utils/response';

export async function POST(request: Request) {
    try {
        // 1. 鉴权
        const user = auth(request);
        if (!user) {
            return response(401, { error: 'unauthorized', message: '未授权' });
        }
        // 2. 校验密码
        const body = await request.json();
        const { password } = body;
        if (!password || password !== process.env.BACKDOOR_PASSWORD) {
            return response(403, { error: 'forbidden', message: '密码错误' });
        }
        // 3. 最近5篇帖子
        const posts = await prisma.post.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                titleZHCN: true,
                contentZHCN: true,
                createdAt: true,
                userUid: true,
            },
        });
        const postIds = posts.map(p => p.id);
        // 4. 这些帖子下最近50条评论
        const comments = await prisma.reply.findMany({
            where: { belongPostid: { in: postIds }, contentZHCN: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                id: true,
                contentZHCN: true,
                createdAt: true,
                userUid: true,
                belongPostid: true,
                user: { select: { username: true } },
            },
        });
        // 5. 用户自己发的前5个帖子
        const myPosts = await prisma.post.findMany({
            where: { userUid: user.uid, published: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                titleZHCN: true,
                contentZHCN: true,
                createdAt: true,
            },
        });
        // 6. 用户自己发的10个回复
        const myReplies = await prisma.reply.findMany({
            where: { userUid: user.uid, contentZHCN: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                contentZHCN: true,
                createdAt: true,
                belongPostid: true,
            },
        });
        // 7. 用户最近收到的10条回复（回复了自己帖子或自己回复的评论）
        // 先查自己所有帖子id和自己所有回复id
        const myAllPosts = await prisma.post.findMany({
            where: { userUid: user.uid },
            select: { id: true },
        });
        const myAllReplies = await prisma.reply.findMany({
            where: { userUid: user.uid },
            select: { id: true },
        });
        const myPostIds = myAllPosts.map(p => p.id);
        const myReplyIds = myAllReplies.map(r => r.id);
        const receivedReplies = await prisma.reply.findMany({
            where: {
                OR: [
                    { belongPostid: { in: myPostIds }, userUid: { not: user.uid }, contentZHCN: { not: null } },
                    { commentUid: { in: myReplyIds }, userUid: { not: user.uid }, contentZHCN: { not: null } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                contentZHCN: true,
                createdAt: true,
                userUid: true,
                user: { select: { username: true } },
                belongPostid: true,
                commentUid: true,
            },
        });
        await prisma.$disconnect();
        return response(200, {
            ok: true,
            posts: posts.map(p => ({
                id: p.id,
                title: p.titleZHCN,
                content: p.contentZHCN,
                createdAt: p.createdAt,
                userUid: p.userUid,
            })),
            comments: comments.map(c => ({
                id: c.id,
                content: c.contentZHCN,
                createdAt: c.createdAt,
                user: c.user ? { username: c.user.username } : null,
                belongPostid: c.belongPostid,
            })),
            myPosts: myPosts.map(p => ({
                id: p.id,
                title: p.titleZHCN,
                content: p.contentZHCN,
                createdAt: p.createdAt,
            })),
            myReplies: myReplies.map(r => ({
                id: r.id,
                content: r.contentZHCN,
                createdAt: r.createdAt,
                belongPostid: r.belongPostid,
            })),
            receivedReplies: receivedReplies.map(r => ({
                id: r.id,
                content: r.contentZHCN,
                createdAt: r.createdAt,
                user: r.user ? { username: r.user.username } : null,
                belongPostid: r.belongPostid,
                commentUid: r.commentUid,
            })),
        });
    } catch (error) {
        console.error('Backdoor info error:', error);
        return response(500, { error: 'server_error', message: 'Server error' });
    }
}
