import response from '../../_utils/response';
import langs from '@/lib/lang';
import prisma from '../../_utils/prisma';
import auth from '../../_utils/auth';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    const locale = url.searchParams.get('locale') || 'en-US';

    try {
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

        if (!postId) {
            return response(400, {
                error: 'missing_post_id',
                message: langs(
                    {
                        'zh-CN': '缺少帖子ID',
                        'zh-TW': '缺少帖子ID',
                        'en-US': 'Missing post ID',
                        'es-ES': 'Falta ID de publicación',
                        'fr-FR': 'ID de publication manquant',
                        'ru-RU': 'Отсутствует ID поста',
                        'ja-JP': '投稿IDが不足しています',
                        'de-DE': 'Fehlende Post-ID',
                        'pt-BR': 'ID do post ausente',
                        'ko-KR': '게시물 ID가 누락되었습니다',
                    },
                    locale,
                ),
            });
        }

        const postIdInt = parseInt(postId);
        if (isNaN(postIdInt)) {
            return response(400, {
                error: 'invalid_post_id',
                message: langs(
                    {
                        'zh-CN': '无效的帖子ID',
                        'zh-TW': '無效的帖子ID',
                        'en-US': 'Invalid post ID',
                        'es-ES': 'ID de publicación inválido',
                        'fr-FR': 'ID de publication invalide',
                        'ru-RU': 'Недопустимый ID поста',
                        'ja-JP': '無効な投稿IDです',
                        'de-DE': 'Ungültige Post-ID',
                        'pt-BR': 'ID do post inválido',
                        'ko-KR': '잘못된 게시물 ID입니다',
                    },
                    locale,
                ),
            });
        }

        // 获取帖子的点赞状态
        const postLike = await prisma.like.findFirst({
            where: {
                userUid: user.uid,
                postId: postIdInt,
            },
        });

        // 获取该帖子下所有回复的ID
        const replies = await prisma.reply.findMany({
            where: {
                belongPostid: postIdInt,
            },
            select: {
                id: true,
            },
        });

        const replyIds = replies.map(reply => reply.id);

        // 获取用户对这些回复的点赞状态
        const replyLikes = await prisma.like.findMany({
            where: {
                userUid: user.uid,
                replyId: {
                    in: replyIds,
                },
            },
            select: {
                replyId: true,
            },
        });
        await prisma.$disconnect();

        // 构建回复点赞状态映射
        const replyLikesMap: Record<string, boolean> = {};
        replyLikes.forEach(like => {
            if (like.replyId) {
                replyLikesMap[like.replyId] = true;
            }
        });        return response(200, {
            ok: true,
            data: {
                postLiked: !!postLike,
                replyLikes: replyLikesMap,
            },
        });

    } catch (error) {
        console.error('Get like status error:', error);
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