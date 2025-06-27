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
        const { postId } = body;

        if (!postId) {
            return response(400, {
                error: 'missing_post_id',
                message: lang(
                    {
                        'zh-CN': '缺少帖子ID',
                        'zh-TW': '缺少帖子ID',
                        'en-US': 'Missing post ID',
                        'es-ES': 'Falta ID de publicación',
                        'fr-FR': 'ID de publication manquant',
                        'ru-RU': 'Отсутствует ID поста',
                        'ja-JP': '投稿IDが不足しています',
                        'de-DE': 'Fehlende Beitrags-ID',
                        'pt-BR': 'ID da postagem ausente',
                        'ko-KR': '게시물 ID가 없습니다',
                    },
                    locale,
                ),
            });
        }

        // 检查帖子是否存在
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true }
        });

        if (!post) {
            return response(404, {
                error: 'post_not_found',
                message: lang(
                    {
                        'zh-CN': '帖子不存在',
                        'zh-TW': '帖子不存在',
                        'en-US': 'Post not found',
                        'es-ES': 'Publicación no encontrada',
                        'fr-FR': 'Publication introuvable',
                        'ru-RU': 'Пост не найден',
                        'ja-JP': '投稿が見つかりません',
                        'de-DE': 'Beitrag nicht gefunden',
                        'pt-BR': 'Postagem não encontrada',
                        'ko-KR': '게시물을 찾을 수 없습니다',
                    },
                    locale,
                ),
            });
        }

        // 获取该帖子的所有回复ID
        const replies = await prisma.reply.findMany({
            where: { belongPostid: postId },
            select: { id: true }
        });

        const replyIds = replies.map(reply => reply.id);

        // 检查用户对帖子和所有回复的点赞状态
        const userLikes = await prisma.like.findMany({
            where: {
                userUid: user.uid,
                OR: [
                    { postId: postId },
                    { replyId: { in: replyIds } }
                ]
            },
            select: {
                postId: true,
                replyId: true
            }
        });

        await prisma.$disconnect();

        // 构建返回数据
        const postLiked = userLikes.some(like => like.postId === postId);
        const replyLikes: Record<string, boolean> = {};
        
        replyIds.forEach(replyId => {
            replyLikes[replyId] = userLikes.some(like => like.replyId === replyId);
        });

        await limitControl.update(request);

        return response(200, {
            ok: true,
            data: {
                postId: postId,
                postLiked: postLiked,
                replyLikes: replyLikes
            }
        });
    } catch (error) {
        console.error('Check like status error:', error);
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