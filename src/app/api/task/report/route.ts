import lang from '@/lib/lang';
import broadcast from '../../_utils/broadcast';
import messager from '../../_utils/messager';
import prisma from '../../_utils/prisma';
import response from '../../_utils/response';

// 添加字符串截断函数
function truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export async function POST(request: Request) {
    const { password, taskUuid, status } = await request.json();
    let task, taskDetails;

    if (password !== process.env.TRANSLATE_WORKER_PASSWORD) {
        return response(401, {
            message: 'Unauthorized',
        });
    }

    if (!taskUuid || !status) {
        return response(400, {
            message: 'Missing taskUuid or status',
        });
    }

    try {
        // 查询task信息
        // reply的话，给对方发送通知
        if (status == 'DONE') {
            task = await prisma.task.findUnique({
                where: { id: taskUuid },
                select: {
                    id: true,
                    user: {
                        select: {
                            nickname: true,
                        },
                    },
                    reply: {
                        select: {
                            belongPost: {
                                select: {
                                    User: {
                                        select: {
                                            uid: true,
                                            nickname: true,
                                            email: true,
                                            emailNoticeLang: true,
                                        },
                                    },
                                    id: true,
                                },
                            },
                            parentReply: {
                                select: {
                                    user: {
                                        select: {
                                            uid: true,
                                            nickname: true,
                                            email: true,
                                            emailNoticeLang: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    post: {
                        select: {
                            topics: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!task) {
                return response(404, {
                    message: lang({
                        'zh-CN': '任务未找到',
                        'en-US': 'Task not found',
                        'zh-TW': '任務未找到',
                        'de-DE': 'Aufgabe nicht gefunden',
                        'fr-FR': 'Tâche non trouvée',
                        'es-ES': 'Tarea no encontrada',
                        'ru-RU': 'Задача не найдена',
                        'ja-JP': 'タスクが見つかりません',
                        'pt-BR': 'Tarefa não encontrada',
                        'ko-KR': '작업을 찾을 수 없습니다.',
                    }),
                });
            }

            // post任务，不发messager通知，只broadcast
            if (!task.reply) {
                console.log('Post task completed, skipping messager notification');
                await broadcast({
                    type: 'task',
                    content: {
                        uuid: taskUuid,
                        status: status,
                        type: 'post',
                        topic: task.post?.topics?.map((t) => t.name).join(', ') || '',
                    },
                    title: '',
                    link: '',
                });
                return response(200, {
                    message: 'Task report broadcasted successfully',
                });
            } else {
                // reply任务，发送messager通知
                console.log(task);
                const user = task?.reply?.belongPost?.User || task?.reply?.parentReply?.user;

                if (user) {
                    // 查询相应语言的详细信息
                    const langSuffix =
                        user.emailNoticeLang?.replace('-', '').toUpperCase() || 'ENUS';
                    taskDetails = await prisma.task.findUnique({
                        where: { id: taskUuid },
                        select: {
                            reply: {
                                select: {
                                    content: true,
                                    [`content${langSuffix}`]: true,
                                    belongPost: {
                                        select: {
                                            title: true,
                                            [`title${langSuffix}`]: true,
                                        },
                                    },
                                    parentReply: {
                                        select: {
                                            content: true,
                                            [`content${langSuffix}`]: true,
                                        },
                                    },
                                    belongPostid: true,
                                },
                            },
                        },
                    });
                    const langSuffixForContent =
                        user.emailNoticeLang?.replace('-', '').toUpperCase() || 'ENUS'; // 获取原始内容并截断
                    const originalContent =
                        (taskDetails?.reply?.belongPost as unknown as Record<string, string>)?.[
                            `title${langSuffixForContent}`
                        ] ||
                        (taskDetails?.reply?.belongPost as unknown as Record<string, string>)
                            ?.title ||
                        (taskDetails?.reply?.parentReply as unknown as Record<string, string>)?.[
                            `content${langSuffixForContent}`
                        ] ||
                        (taskDetails?.reply?.parentReply as unknown as Record<string, string>)
                            ?.content ||
                        '';

                    const replyContent =
                        (taskDetails?.reply as unknown as Record<string, string>)?.[
                            `content${langSuffixForContent}`
                        ] ||
                        (taskDetails?.reply as unknown as Record<string, string>)?.content ||
                        '';

                    const truncatedOriginalContent = truncateText(originalContent, 50);
                    const truncatedReplyContent = truncateText(replyContent, 50);

                    await messager(
                        {
                            title: lang(
                                {
                                    'zh-CN': `您的${task.reply?.parentReply ? '回复' : '帖子'}被 ${task.user?.nickname} 回复了。`,
                                    'en-US': `Your ${task.reply?.parentReply ? 'reply' : 'post'} has been replied by ${task.user?.nickname}.`,
                                    'zh-TW': `您的${task.reply?.parentReply ? '回覆' : '文章'}被 ${task.user?.nickname} 回覆了。`,
                                    'de-DE': `Ihre ${task.reply?.parentReply ? 'Antwort' : 'Beitrag'} wurde von ${task.user?.nickname} beantwortet.`,
                                    'fr-FR': `Votre ${task.reply?.parentReply ? 'réponse' : 'post'} a été répondu par ${task.user?.nickname}.`,
                                    'es-ES': `Su ${task.reply?.parentReply ? 'respuesta' : 'publicación'} ha sido respondida por ${task.user?.nickname}.`,
                                    'ru-RU': `Ваш ${task.reply?.parentReply ? 'ответ' : 'пост'} был отвечен ${task.user?.nickname}.`,
                                    'ja-JP': `あなたの${task.reply?.parentReply ? '返信' : '投稿'}が ${task.user?.nickname} によって返信されました。`,
                                    'pt-BR': `Sua ${task.reply?.parentReply ? 'resposta' : 'postagem'} foi respondida por ${task.user?.nickname}.`,
                                    'ko-KR': `당신의 ${task.reply?.parentReply ? '답글' : '게시물'}이 ${task.user?.nickname}에 의해 답변되었습니다.`,
                                },
                                user?.emailNoticeLang || 'en-US',
                            ),
                            content: lang(
                                {
                                    'zh-CN':
                                        `您的<strong>${task.reply?.parentReply ? '回复' : '帖子'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `被 <strong>${task.user?.nickname}</strong> 回复了:<br>` +
                                        `${truncatedReplyContent}`,
                                    'en-US':
                                        `Your <strong>${task.reply?.parentReply ? 'reply' : 'post'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `has been replied by <strong>${task.user?.nickname}</strong>:<br>` +
                                        `${truncatedReplyContent}`,
                                    'zh-TW':
                                        `您的<strong>${task.reply?.parentReply ? '回覆' : '文章'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `被 <strong>${task.user?.nickname}</strong> 回覆了:<br>` +
                                        `${truncatedReplyContent}`,
                                    'de-DE':
                                        `Ihre <strong>${task.reply?.parentReply ? 'Antwort' : 'Beitrag'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `wurde von <strong>${task.user?.nickname}</strong> beantwortet:<br>` +
                                        `${truncatedReplyContent}`,
                                    'fr-FR':
                                        `Votre <strong>${task.reply?.parentReply ? 'réponse' : 'post'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `a été répondu par <strong>${task.user?.nickname}</strong>:<br>` +
                                        `${truncatedReplyContent}`,
                                    'es-ES':
                                        `Su <strong>${task.reply?.parentReply ? 'respuesta' : 'publicación'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `ha sido respondida por <strong>${task.user?.nickname}</strong>:<br>` +
                                        `${truncatedReplyContent}`,
                                    'ru-RU':
                                        `Ваш <strong>${task.reply?.parentReply ? 'ответ' : 'пост'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `был отвечен <strong>${task.user?.nickname}</strong>:<br>` +
                                        `${truncatedReplyContent}`,
                                    'ja-JP':
                                        `あなたの<strong>${task.reply?.parentReply ? '返信' : '投稿'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `が <strong>${task.user?.nickname}</strong> によって返信されました:<br>` +
                                        `${truncatedReplyContent}`,
                                    'pt-BR':
                                        `Sua <strong>${task.reply?.parentReply ? 'resposta' : 'postagem'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `foi respondida por <strong>${task.user?.nickname}</strong>:<br>` +
                                        `${truncatedReplyContent}`,
                                    'ko-KR':
                                        `당신의 <strong>${task.reply?.parentReply ? '답글' : '게시물'}</strong>:<br>` +
                                        `<em>${truncatedOriginalContent}</em><br><br>` +
                                        `이 <strong>${task.user?.nickname}</strong>에 의해 답변되었습니다:<br>` +
                                        `${truncatedReplyContent}`,
                                },
                                user?.emailNoticeLang || 'en-US',
                            ),
                            link: task.reply
                                ? `https://xeoos.net/post/${taskDetails?.reply?.belongPostid}`
                                : `https://xeoos.net/post/${(task?.reply as unknown as Record<string, Record<string, number>>)?.belongPost?.id}`,
                            locale: user?.emailNoticeLang || 'en-US',
                            type: 'message',
                        },
                        {
                            uid: user?.uid.toString(),
                            nickname: user?.nickname,
                            email: user?.email,
                        },
                    );
                }
            }
            await broadcast({
                type: 'task',
                content: {
                    uuid: taskUuid,
                    status: status,
                    type: 'reply',
                    postId: task.reply?.belongPost?.id.toString() || '',
                },
                title: '',
                link: '',
            });
            return response(200, {
                message: 'Task report broadcasted successfully',
            });
        }
    } catch (e) {
        console.error('Error broadcasting task report:', e);
        return response(500, {
            message: 'Failed to broadcast task report',
        });
    }
}
