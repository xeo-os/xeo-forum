import response from '../../_utils/response';
import limitControl from '../../_utils/limit';
import lang from '@/lib/lang';
import prisma from '../../_utils/prisma';
import auth from '../../_utils/auth';

export async function POST(request: Request) {
    const locale = request.headers.get('Accept-Language')?.split(',')[0] || 'en-US';
    
    try {
        const isAllowed = await limitControl.check(request);

        if (!isAllowed) {
            return response(429, {
                error: 'rate_limit_exceeded',
                message: lang(
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
                message: lang(
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

        const body = await request.json().catch(() => ({}));
        const page = Math.max(1, parseInt(body.page) || 1);
        const limit = 20;
        const skip = (page - 1) * limit;

        const drafts = await prisma.post.findMany({
            where: {
                userUid: user.uid,
                published: false, // 只获取未发布的草稿
            },
            orderBy: {
                updatedAt: 'desc', // 按最后修改时间排序
            },
            select: {
                id: true,
                title: true,
                titleENUS: true,
                titleZHCN: true,
                titleZHTW: true,
                titleESES: true,
                titleFRFR: true,
                titleRURU: true,
                titleJAJP: true,
                titleKOKR: true,
                titleDEDE: true,
                titlePTBR: true,
                origin: true,
                createdAt: true,
                updatedAt: true,
                published: true,
                pin: true,
                originLang: true,
                topics: {
                    select: {
                        name: true,
                        emoji: true,
                        nameZHCN: true,
                        nameENUS: true,
                        nameZHTW: true,
                        nameESES: true,
                        nameFRFR: true,
                        nameRURU: true,
                        nameJAJP: true,
                        nameDEDE: true,
                        namePTBR: true,
                        nameKOKR: true,
                    },
                },
            },
            skip,
            take: limit,
        });

        const hasMore = drafts.length === limit;
        const totalDrafts = await prisma.post.count({
            where: {
                userUid: user.uid,
                published: false,
            },
        });
        await prisma.$disconnect();

        await limitControl.update(request);

        return response(200, {
            ok: true,
            drafts,
            hasMore,
            total: totalDrafts,
            currentPage: page,
        });
    } catch (error) {
        console.error('Get user drafts error:', error);
        return response(500, {
            error: 'server_error',
            message: lang(
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
