import lang from '@/lib/lang';
import response from '../../_utils/response';
import auth from '../../_utils/auth';
import limitControl from '../../_utils/limit';
import prisma from '../../_utils/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    const { id } = await request.json();
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

        if (!id) {
            return response(400, {
                message: lang(
                    {
                        'zh-CN': '帖子ID不能为空',
                        'en-US': 'Post ID cannot be empty',
                        'zh-TW': '帖子ID不能為空',
                        'es-ES': 'El ID del post no puede estar vacío',
                        'fr-FR': "L'ID du post ne peut pas être vide",
                        'ru-RU': 'ID поста не может быть пустым',
                        'ja-JP': '投稿IDは空にできません',
                        'de-DE': 'Post-ID darf nicht leer sein',
                        'pt-BR': 'O ID do post não pode estar vazio',
                        'ko-KR': '게시물 ID는 비워둘 수 없습니다',
                    },
                    locale,
                ),
            });
        }

        const user = auth(request);
        if (!user) {
            return response(401, {
                message: lang(
                    {
                        'zh-CN': '未授权',
                        'en-US': 'Unauthorized',
                        'zh-TW': '未授權',
                        'es-ES': 'No autorizado',
                        'fr-FR': 'Non autorisé',
                        'ru-RU': 'Не авторизован',
                        'ja-JP': '認証されていません',
                        'de-DE': 'Nicht autorisiert',
                        'pt-BR': 'Não autorizado',
                        'ko-KR': '인증되지 않음',
                    },
                    locale,
                ),
            });
        }

        // 查找帖子并验证所有权
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                userUid: true,
                title: true,
                topics: {
                    select: { name: true }
                }
            },
        });

        if (!post) {
            return response(404, {
                message: lang(
                    {
                        'zh-CN': '帖子不存在',
                        'en-US': 'Post not found',
                        'zh-TW': '帖子不存在',
                        'es-ES': 'Post no encontrado',
                        'fr-FR': 'Post non trouvé',
                        'ru-RU': 'Пост не найден',
                        'ja-JP': '投稿が見つかりません',
                        'de-DE': 'Post nicht gefunden',
                        'pt-BR': 'Post não encontrado',
                        'ko-KR': '게시물을 찾을 수 없습니다',
                    },
                    locale,
                ),
            });
        }

        if (post.userUid !== user.uid) {
            return response(403, {
                message: lang(
                    {
                        'zh-CN': '无权删除该帖子',
                        'en-US': 'No permission to delete this post',
                        'zh-TW': '無權刪除該帖子',
                        'es-ES': 'No tienes permiso para eliminar este post',
                        'fr-FR': "Aucune autorisation pour supprimer ce post",
                        'ru-RU': 'Нет разрешения на удаление этого поста',
                        'ja-JP': 'この投稿を削除する権限がありません',
                        'de-DE': 'Keine Berechtigung, diesen Post zu löschen',
                        'pt-BR': 'Sem permissão para deletar este post',
                        'ko-KR': '이 게시물을 삭제할 권한이 없습니다',
                    },
                    locale,
                ),
            });
        }

        // 删除帖子（级联删除相关的回复、点赞等）
        await prisma.post.delete({
            where: { id: parseInt(id) },
        });

        await prisma.$disconnect();

        // 重新验证相关页面
        revalidatePath('/[locale]/page');
        post.topics.forEach(topic => {
            revalidatePath(`/[locale]/topic/${topic.name.replace('_', '-')}/page`);
        });
        revalidatePath(`/[locale]/user/${user.uid}`);

        await limitControl.update(request);

        return response(200, {
            ok: true,
            message: lang(
                {
                    'zh-CN': '帖子删除成功',
                    'en-US': 'Post deleted successfully',
                    'zh-TW': '帖子刪除成功',
                    'es-ES': 'Post eliminado exitosamente',
                    'fr-FR': 'Post supprimé avec succès',
                    'ru-RU': 'Пост успешно удален',
                    'ja-JP': '投稿が正常に削除されました',
                    'de-DE': 'Post erfolgreich gelöscht',
                    'pt-BR': 'Post deletado com sucesso',
                    'ko-KR': '게시물이 성공적으로 삭제되었습니다',
                },
                locale,
            ),
        });
    } catch (error) {
        console.error('Delete post error:', error);
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
