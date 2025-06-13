import lang from '@/lib/lang';
import response from '../../_utils/response';
import auth from '../../_utils/auth';
import prisma from '../../_utils/prisma';
import limitControl from '../../_utils/limit';

export async function POST(request: Request) {
    const { id } = await request.json();
    const locale = request.headers.get('Accept-Language')?.split(',')[0] || 'en-US';
    console.log(locale);
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
                        'zh-CN': '任务ID不能为空',
                        'en-US': 'Task ID cannot be empty',
                        'de-DE': 'Aufgaben-ID darf nicht leer sein',
                        'es-ES': 'El ID de la tarea no puede estar vacío',
                        'fr-FR': "L'ID de la tâche ne peut pas être vide",
                        'ja-JP': 'タスクIDは空にできません',
                        'ko-KR': '작업 ID는 비워둘 수 없습니다',
                        'pt-BR': 'O ID da tarefa não pode estar vazio',
                        'ru-RU': 'ID задачи не может быть пустым',
                        'zh-TW': '任務ID不能為空',
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
                        'de-DE': 'Nicht autorisiert',
                        'es-ES': 'No autorizado',
                        'fr-FR': 'Non autorisé',
                        'ja-JP': '認証されていません',
                        'ko-KR': '인증되지 않음',
                        'pt-BR': 'Não autorizado',
                        'ru-RU': 'Не авторизован',
                        'zh-TW': '未授權',
                    },
                    locale,
                ),
            });
        }
        const taskInfo = await prisma.task.findUnique({
            where: {
                id: id,
                status: 'FAIL',
            },
            select: {
                id: true,
                user: {
                    select: {
                        uid: true,
                    },
                },
            },
        });
        if (!taskInfo) {
            return response(404, {
                message: lang(
                    {
                        'zh-CN': '任务不存在或不是失败状态',
                        'en-US': 'Task does not exist or is not in failed status',
                        'de-DE':
                            "Aufgabe existiert nicht oder ist nicht im Status 'Fehlgeschlagen'",
                        'es-ES': 'La tarea no existe o no está en estado fallido',
                        'fr-FR': "La tâche n'existe pas ou n'est pas dans un état d'échec",
                        'ja-JP': 'タスクが存在しないか、失敗状態ではありません',
                        'ko-KR': '작업이 존재하지 않거나 실패 상태가 아닙니다',
                        'pt-BR': 'A tarefa não existe ou não está no status de falha',
                        'ru-RU': 'Задача не существует или не находится в состоянии сбоя',
                        'zh-TW': '任務不存在或不是失敗狀態',
                    },
                    locale,
                ),
            });
        }
        if (!taskInfo.user || taskInfo?.user.uid !== user.uid) {
            return response(403, {
                message: lang(
                    {
                        'zh-CN': '无权重试该任务',
                        'en-US': 'No permission to retry this task',
                        'de-DE': 'Keine Berechtigung, diese Aufgabe erneut zu versuchen',
                        'es-ES': 'No tienes permiso para reintentar esta tarea',
                        'fr-FR': 'Aucune autorisation pour réessayer cette tâche',
                        'ja-JP': 'このタスクを再試行する権限がありません',
                        'ko-KR': '이 작업을 다시 시도할 권한이 없습니다',
                        'pt-BR': 'Sem permissão para tentar novamente esta tarefa',
                        'ru-RU': 'Нет разрешения на повторную попытку этой задачи',
                        'zh-TW': '無權重試該任務',
                    },
                    locale,
                ),
            });
        }

        await prisma.task.update({
            where: {
                id: id,
            },
            data: {
                status: 'PENDING',
            },
        });

        await fetch(process.env.TRANSLATE_WORKER as string, {
            method: 'POST',
            body: JSON.stringify({
                password: process.env.TRANSLATE_WORKER_PASSWORD,
                task: taskInfo.id,
            }),
        });

        await limitControl.update(request);

        return response(200, {
            ok: true,
        });
    } catch (error) {
        console.error('Rate limit check error:', error);
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
