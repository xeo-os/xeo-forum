import response from '../_utils/response';
import limitControl from '../_utils/limit';
import lang from '@/lib/lang';
import prisma from '../_utils/prisma';

export async function GET(request: Request) {
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

        const url = new URL(request.url);
        const type = url.searchParams.get('type');
        const id = url.searchParams.get('id');

        if (!type || !id) {
            return response(400, {
                error: 'missing_parameters',
                message: lang(
                    {
                        'zh-CN': '缺少必要参数',
                        'zh-TW': '缺少必要參數',
                        'en-US': 'Missing required parameters',
                        'es-ES': 'Faltan parámetros requeridos',
                        'fr-FR': 'Paramètres requis manquants',
                        'ru-RU': 'Отсутствуют обязательные параметры',
                        'ja-JP': '必須パラメータが不足しています',
                        'de-DE': 'Erforderliche Parameter fehlen',
                        'pt-BR': 'Parâmetros obrigatórios ausentes',
                        'ko-KR': '필수 매개변수가 없습니다',
                    },
                    locale,
                ),
            });
        }

        if (type !== 'reply' && type !== 'post') {
            return response(400, {
                error: 'invalid_type',
                message: lang(
                    {
                        'zh-CN': '无效的类型参数',
                        'zh-TW': '無效的類型參數',
                        'en-US': 'Invalid type parameter',
                        'es-ES': 'Parámetro de tipo inválido',
                        'fr-FR': 'Paramètre de type invalide',
                        'ru-RU': 'Недопустимый параметр типа',
                        'ja-JP': '無効なタイプパラメータです',
                        'de-DE': 'Ungültiger Typ-Parameter',
                        'pt-BR': 'Parâmetro de tipo inválido',
                        'ko-KR': '잘못된 유형 매개변수입니다',
                    },
                    locale,
                ),
            });
        }

        let originalContent = '';

        if (type === 'reply') {
            // 获取回复的原文
            const reply = await prisma.reply.findUnique({
                where: { id: id },
                select: { 
                    content: true,
                    originLang: true
                }
            });

            if (!reply) {
                return response(404, {
                    error: 'reply_not_found',
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

            originalContent = reply.content;
        } else if (type === 'post') {
            // 获取帖子的原文
            const post = await prisma.post.findUnique({
                where: { id: parseInt(id) },
                select: { 
                    origin: true,
                    originLang: true
                }
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

            originalContent = post.origin;
        }

        await limitControl.update(request);

        return response(200, {
            ok: true,
            data: {
                originalContent: originalContent
            }
        });

    } catch (error) {
        console.error('Get original content error:', error);
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
