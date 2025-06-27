import response from '../../_utils/response';
import limitControl from '../../_utils/limit';
import langs from '@/lib/lang';
import prisma from '../../_utils/prisma';
import auth from '../../_utils/auth';

export async function POST(request: Request) {
    const locale = (await request.headers.get('Accept-Language')) || 'en-US';
    try {
        const isAllowed = await limitControl.check(request);

        if (!isAllowed) {
            return response(429, {
                error: 'rate_limit_exceeded',
                message: langs(
                    {
                        'zh-CN': '请求过于频繁，请稍后再试',
                        'zh-TW': '請求過於頻繁，請稍後再試',
                        'en-US': 'Too many requests, please try again later',
                        'es-ES': 'Demasiadas solicitudes, inténtalo más tarde',
                        'fr-FR': 'Trop de demandes, veuillez réessayer plus tard',
                        'ru-RU': 'Слишком много запросов, попробуйте позже',
                        'ja-JP': 'リクエストが多すぎます。後でもう一度お試しください',
                        'de-DE': 'Zu viele Anfragen, bitte später versuchen',
                        'pt-BR': 'Muitas solicitações, tente novamente mais tarde',
                        'ko-KR': '요청이 너무 많습니다. 나중에 다시 시도해 주세요',
                    },
                    locale,
                ),
            });
        }

        const user = await auth(request);
        if (!user) {
            return response(401, {
                message: langs(
                    {
                        'zh-CN': '未授权访问',
                        'zh-TW': '未授權訪問',
                        'en-US': 'Unauthorized access',
                        'es-ES': 'Acceso no autorizado',
                        'fr-FR': 'Accès non autorisé',
                        'ru-RU': 'Неавторизованный доступ',
                        'ja-JP': '認証されていないアクセスです',
                        'de-DE': 'Unbefugter Zugriff',
                        'pt-BR': 'Acesso não autorizado',
                        'ko-KR': '인증되지 않은 접근입니다',
                    },
                    locale,
                ),
            });
        }

        // 解析请求体获取分页参数
        const body = await request.json().catch(() => ({}));
        const page = Math.max(1, parseInt(body.page) || 1);
        const limit = 20; // 固定每页20个任务
        const skip = (page - 1) * limit;

        // 获取所有状态不为DONE的任务
        const nonDoneTasks = await prisma.task.findMany({
            where: {
                userUid: user.uid,
                status: {
                    not: 'DONE',
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                post: {
                    select: {
                        title: true,
                        id: true,
                    },
                },
                reply: {
                    select: {
                        content: true,
                        postUid: true,
                    },
                },
            },
        });

        // 获取DONE状态的任务
        const doneTasks = await prisma.task.findMany({
            where: {
                userUid: user.uid,
                status: 'DONE',
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                post: {
                    select: {
                        title: true,
                        id: true,
                    },
                },
                reply: {
                    select: {
                        content: true,
                        postUid: true,
                    },
                },
            },
        });
        await prisma.$disconnect();

        // 合并所有任务并按创建时间排序
        const allTasks = [...nonDoneTasks, ...doneTasks]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // 应用分页
        const paginatedTasks = allTasks
            .slice(skip, skip + limit)
            .map(task => ({
                ...task,
                reply: task.reply ? {
                    ...task.reply,
                    content: task.reply.content.substring(0, 20)
                } : task.reply
            }));

        const hasMore = skip + limit < allTasks.length;

        return response(200, {
            ok: true,
            tasks: paginatedTasks,
            hasMore,
            total: allTasks.length,
        });
    } catch (error) {
        console.error('Rate limit check error:', error);
        return response(500, {
            error: 'server_error',
            message: langs(
                {
                    'zh-CN': '服务器错误，请稍后再试',
                    'zh-TW': '伺服器錯誤，請稍後再試',
                    'en-US': 'Server error, please try again later',
                    'es-ES': 'Error del servidor, inténtalo más tarde',
                    'fr-FR': 'Erreur du serveur, veuillez réessayer plus tard',
                    'ru-RU': 'Ошибка сервера, попробуйте позже',
                    'ja-JP': 'サーバーエラー。後でもう一度お試しください',
                    'de-DE': 'Server-Fehler, bitte später versuchen',
                    'pt-BR': 'Erro do servidor, tente novamente mais tarde',
                    'ko-KR': '서버 오류입니다. 나중에 다시 시도해 주세요',
                },
                locale,
            ),
        });
    }
}
