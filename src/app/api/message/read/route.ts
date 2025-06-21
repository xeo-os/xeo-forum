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

        // 解析请求体获取消息ID
        const body = await request.json().catch(() => ({}));
        const { id } = body;

        if (!id) {
            return response(400, {
                error: 'missing_id',
                message: langs(
                    {
                        'zh-CN': '缺少消息ID',
                        'zh-TW': '缺少消息ID',
                        'en-US': 'Missing message ID',
                        'es-ES': 'Falta el ID del mensaje',
                        'fr-FR': 'ID de message manquant',
                        'ru-RU': 'Отсутствует ID сообщения',
                        'ja-JP': 'メッセージIDがありません',
                        'de-DE': 'Nachrichten-ID fehlt',
                        'pt-BR': 'ID da mensagem ausente',
                        'ko-KR': '메시지 ID가 없습니다',
                    },
                    locale,
                ),
            });
        }

        // 验证消息是否存在且属于当前用户
        const notice = await prisma.notice.findFirst({
            where: {
                id: id,
                userId: user.uid,
            },
        });

        if (!notice) {
            return response(404, {
                error: 'notice_not_found',
                message: langs(
                    {
                        'zh-CN': '消息不存在',
                        'zh-TW': '消息不存在',
                        'en-US': 'Message not found',
                        'es-ES': 'Mensaje no encontrado',
                        'fr-FR': 'Message non trouvé',
                        'ru-RU': 'Сообщение не найдено',
                        'ja-JP': 'メッセージが見つかりません',
                        'de-DE': 'Nachricht nicht gefunden',
                        'pt-BR': 'Mensagem não encontrada',
                        'ko-KR': '메시지를 찾을 수 없습니다',
                    },
                    locale,
                ),
            });
        }

        // 标记消息为已读
        await prisma.notice.update({
            where: {
                id: id,
            },
            data: {
                isRead: true,
            },
        });

        return response(200, {
            ok: true,
            message: langs(
                {
                    'zh-CN': '消息已标记为已读',
                    'zh-TW': '消息已標記為已讀',
                    'en-US': 'Message marked as read',
                    'es-ES': 'Mensaje marcado como leído',
                    'fr-FR': 'Message marqué comme lu',
                    'ru-RU': 'Сообщение отмечено как прочитанное',
                    'ja-JP': 'メッセージを既読にしました',
                    'de-DE': 'Nachricht als gelesen markiert',
                    'pt-BR': 'Mensagem marcada como lida',
                    'ko-KR': '메시지가 읽음으로 표시되었습니다',
                },
                locale,
            ),
        });
    } catch (error) {
        console.error('Mark as read error:', error);
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