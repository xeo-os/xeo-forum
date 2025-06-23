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
                        'zh-CN': '回复ID不能为空',
                        'zh-TW': '回覆ID不能為空',
                        'en-US': 'Reply ID cannot be empty',
                        'es-ES': 'El ID de respuesta no puede estar vacío',
                        'fr-FR': "L'ID de réponse ne peut pas être vide",
                        'ru-RU': 'ID ответа не может быть пустым',
                        'ja-JP': '返信IDは空にできません',
                        'de-DE': 'Antwort-ID darf nicht leer sein',
                        'pt-BR': 'ID da resposta não pode estar vazio',
                        'ko-KR': '답글 ID는 비어있을 수 없습니다',
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
        const post = await prisma.reply.findUnique({
            where: { id: id },
            select: {                id: true,
                userUid: true,
                belongPost: {
                    select: {
                        id: true,
                        topics: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!post) {
            return response(404, {
                message: lang(
                    {
                        'zh-CN': '回复不存在',
                        'zh-TW': '回覆不存在',
                        'en-US': 'Reply not found',
                        'es-ES': 'Respuesta no encontrada',
                        'fr-FR': 'Réponse introuvable',
                        'ru-RU': 'Ответ не найден',
                        'ja-JP': '返信が見つかりません',
                        'de-DE': 'Antwort nicht gefunden',
                        'pt-BR': 'Resposta não encontrada',
                        'ko-KR': '답글을 찾을 수 없습니다',
                    },
                    locale,
                ),
            });
        }

        if (post.userUid !== user.uid) {
            return response(403, {
                message: lang(
                    {
                        'zh-CN': '无权删除该回复',
                        'zh-TW': '無權刪除該回覆',
                        'en-US': 'No permission to delete this reply',
                        'es-ES': 'Sin permisos para eliminar esta respuesta',
                        'fr-FR': "Pas d'autorisation pour supprimer cette réponse",
                        'ru-RU': 'Нет разрешения на удаление этого ответа',
                        'ja-JP': 'この返信を削除する権限がありません',
                        'de-DE': 'Keine Berechtigung, diese Antwort zu löschen',
                        'pt-BR': 'Sem permissão para excluir esta resposta',
                        'ko-KR': '이 답글을 삭제할 권한이 없습니다',
                    },
                    locale,
                ),
            });
        }

        // 删除帖子（级联删除相关的回复、点赞等）
        await prisma.reply.delete({
            where: { id: id },
        });

        // 重新验证相关页面
        revalidatePath('/[locale]/page');
        post.belongPost?.topics.forEach((topic: { name: string }) => {
            revalidatePath(`/[locale]/topic/${topic.name.replace('_', '-')}/page`);
        });
        revalidatePath(`/[locale]/user/${user.uid}`);

        await limitControl.update(request);

        return response(200, {
            ok: true,
            message: lang(
                {
                    'zh-CN': '回复删除成功',
                    'zh-TW': '回覆刪除成功',
                    'en-US': 'Reply deleted successfully',
                    'es-ES': 'Respuesta eliminada exitosamente',
                    'fr-FR': 'Réponse supprimée avec succès',
                    'ru-RU': 'Ответ успешно удален',
                    'ja-JP': '返信が正常に削除されました',
                    'de-DE': 'Antwort erfolgreich gelöscht',
                    'pt-BR': 'Resposta excluída com sucesso',
                    'ko-KR': '답글이 성공적으로 삭제되었습니다',
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
