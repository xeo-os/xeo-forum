import response from '../_utils/response';
import limitControl from '../_utils/limit';
import langs from '@/lib/lang';
import prisma from '../_utils/prisma';
import auth from '../_utils/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    // 解析请求体获取消息ID
    const body = await request.json().catch(() => ({}));
    const { action, postId, replyId, locale, post } = body;
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
        }        if (action === undefined || action === null || (!postId && !replyId)) {
            return response(400, {
                error: 'missing_id',
                message: langs(
                    {
                        'zh-CN': '缺少参数',
                        'zh-TW': '缺少參數',
                        'en-US': 'Missing parameters',
                        'es-ES': 'Faltan parámetros',
                        'fr-FR': 'Paramètres manquants',
                        'ru-RU': 'Отсутствуют параметры',
                        'ja-JP': 'パラメータが不足しています',
                        'de-DE': 'Fehlende Parameter',
                        'pt-BR': 'Parâmetros ausentes',
                        'ko-KR': '매개변수가 누락되었습니다',
                    },
                    locale,
                ),
            });
        }
        // 点赞
        if (action === true) {
            // 检查是否已经点赞
            const existingLike = await prisma.like.findFirst({
                where: {
                    userUid: user.uid,
                    ...(postId ? { postId: postId } : { replyId: replyId }),
                },
            });
            await prisma.$disconnect();

            if (existingLike) {
                return response(400, {
                    error: 'already_liked',
                    message: langs(
                        {
                            'zh-CN': '您已经点过赞了',
                            'zh-TW': '您已經點過讚了',
                            'en-US': 'You have already liked this',
                            'es-ES': 'Ya has dado me gusta a esto',
                            'fr-FR': 'Vous avez déjà aimé ceci',
                            'ru-RU': 'Вы уже поставили лайк',
                            'ja-JP': 'すでにいいねしています',
                            'de-DE': 'Sie haben dies bereits geliked',
                            'pt-BR': 'Você já curtiu isso',
                            'ko-KR': '이미 좋아요를 눌렀습니다',
                        },
                        locale,
                    ),
                });
            }

            // 创建点赞记录
            await prisma.like.create({
                data: {
                    userUid: user.uid,
                    ...(postId ? { postId: postId } : { replyId: replyId }),
                },
            });
            await prisma.$disconnect();

            revalidatePath(`/[locale]/post/${post}`);
            revalidatePath(`/[locale]/page/`);


            return response(200, {
                message: {
                    ok: true,
                },
            });
        }
        // 取消点赞
        else if (action === false) {
            // 查找现有的点赞记录
            const existingLike = await prisma.like.findFirst({
                where: {
                    userUid: user.uid,
                    ...(postId ? { postId: postId } : { replyId: replyId }),
                },
            });
            await prisma.$disconnect();

            if (!existingLike) {
                return response(400, {
                    error: 'not_liked',
                    message: langs(
                        {
                            'zh-CN': '您还没有点赞',
                            'zh-TW': '您還沒有點讚',
                            'en-US': 'You have not liked this yet',
                            'es-ES': 'Aún no has dado me gusta a esto',
                            'fr-FR': "Vous n'avez pas encore aimé ceci",
                            'ru-RU': 'Вы еще не поставили лайк',
                            'ja-JP': 'まだいいねしていません',
                            'de-DE': 'Sie haben dies noch nicht geliked',
                            'pt-BR': 'Você ainda não curtiu isso',
                            'ko-KR': '아직 좋아요를 누르지 않았습니다',
                        },
                        locale,
                    ),
                });
            }

            // 删除点赞记录
            await prisma.like.delete({
                where: {
                    uuid: existingLike.uuid,
                },
            });
            await prisma.$disconnect();

            revalidatePath(`/[locale]/post/${post}`);
            revalidatePath(`/[locale]/page/`);


            return response(200, {
                message: {
                    ok: true,
                },
            });
        } else {
            return response(400, {
                error: 'invalid_action',
                message: langs(
                    {
                        'zh-CN': '无效的操作',
                        'zh-TW': '無效的操作',
                        'en-US': 'Invalid action',
                        'es-ES': 'Acción inválida',
                        'fr-FR': 'Action invalide',
                        'ru-RU': 'Недопустимое действие',
                        'ja-JP': '無効なアクションです',
                        'de-DE': 'Ungültige Aktion',
                        'pt-BR': 'Ação inválida',
                        'ko-KR': '잘못된 작업입니다',
                    },
                    locale,
                ),
            });
        }
    } catch (error) {
        console.error('Like action error:', error);
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
