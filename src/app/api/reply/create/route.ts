import langs from '@/lib/lang';
import response from '../../_utils/response';
import auth from '../../_utils/auth';
import limitControl from '../../_utils/limit';
import prisma from '../../_utils/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    const JWT = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { lang = 'en-US', content, postid, replyid } = await request.json();

    if (!JWT) {
        return response(401, {
            message: langs(
                {
                    'zh-CN': '请登陆后再回复',
                    'zh-TW': '請登入後再回覆',
                    'en-US': 'Please log in to reply',
                    'es-ES': 'Por favor, inicia sesión para responder',
                    'fr-FR': 'Veuillez vous connecter pour répondre',
                    'ru-RU': 'Пожалуйста, войдите в систему, чтобы ответить',
                    'ja-JP': '返信するにはログインしてください',
                    'de-DE': 'Bitte melden Sie sich an, um zu antworten',
                    'pt-BR': 'Por favor, faça login para responder',
                    'ko-KR': '댓글을 달려면 로그인하세요',
                },
                lang,
            ),
        });
    }
    if (!(await limitControl.check(request))) {
        return response(429, {
            message: langs(
                {
                    'zh-CN': '已触发速率限制',
                    'zh-TW': '已觸發速率限制',
                    'en-US': 'Rate limit exceeded',
                    'es-ES': 'Límite de velocidad excedido',
                    'fr-FR': 'Limite de débit dépassée',
                    'ru-RU': 'Превышен лимит скорости',
                    'ja-JP': 'レート制限を超えました',
                    'de-DE': 'Ratenlimit überschritten',
                    'pt-BR': 'Limite de taxa excedido',
                    'ko-KR': '속도 제한 초과',
                },
                lang,
            ),
        });
    }

    const token = await auth(request);

    if (token) {
        try {
            let result, fatherReply, post, calculatedBelongReply;
            if (postid) {
                // post 评论 - 计算属于第几个回复
                const existingRepliesCount = await prisma.reply.count({
                    where: {
                        postUid: postid,
                    },
                });
                calculatedBelongReply = existingRepliesCount + 1;

                result = await prisma.reply.create({
                    data: {
                        content,
                        postUid: postid,
                        userUid: token.uid,
                        belongPostid: postid,
                        belongReply: calculatedBelongReply,
                        originLang: lang,
                    },
                });
                post = await prisma.post.findUnique({
                    where: {
                        id: postid,
                    },
                    select: {
                        topics: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            } else if (replyid) {
                // 回复的回复 - 继承父回复的 belongReply
                fatherReply = await prisma.reply.findUnique({
                    where: {
                        id: replyid,
                    },
                });

                if (!fatherReply) {
                    return response(404, {
                        message: langs(
                            {
                                'zh-CN': '父回复不存在',
                                'en-US': 'Parent reply does not exist',
                                'de-DE': 'Elternantwort existiert nicht',
                                'es-ES': 'La respuesta padre no existe',
                                'fr-FR': "La réponse parente n'existe pas",
                                'ja-JP': '親返信が存在しません',
                                'ko-KR': '부모 답글이 존재하지 않습니다',
                                'pt-BR': 'Resposta pai não existe',
                                'ru-RU': 'Родительский ответ не существует',
                                'zh-TW': '父回覆不存在',
                            },
                            lang,
                        ),
                    });
                }
                post = await prisma.post.findUnique({
                    where: {
                        id: fatherReply.belongPostid || undefined,
                    },
                    select: {
                        topics: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
                result = await prisma.reply.create({
                    data: {
                        content,
                        userUid: token.uid,
                        belongPostid: fatherReply?.belongPostid,
                        belongReply: fatherReply?.belongReply || calculatedBelongReply,
                        commentUid: replyid,
                        childReplay: true,
                        originLang: lang,
                    },
                });
            }
            // 并发更新文章的lastReplyAt和创建翻译Task
            const [_, task] = await Promise.all([
                prisma.post.update({
                    where: {
                        id: postid || fatherReply?.belongPostid,
                    },
                    data: {
                        lastReplyAt: new Date(),
                    },
                }),
                prisma.task.create({
                    data: {
                        replyId: result?.id,
                        userUid: token.uid,
                    },
                }),
            ]);
            await prisma.$disconnect();
            // 开始翻译Task
            await fetch(process.env.TRANSLATE_WORKER as string, {
                method: 'POST',
                body: JSON.stringify({
                    password: process.env.TRANSLATE_WORKER_PASSWORD,
                    task: task.id,
                }),
            });
            // 并发 revalidatePath
            await Promise.all([
                revalidatePath('/[locale]/page'),
                revalidatePath(`/[locale]/topic/${post?.topics[0]?.name.replace('_', '-')}/page`),
                revalidatePath(`/[locale]/post/${fatherReply?.belongPostid}`),
                revalidatePath(`/[locale]/user/${token.uid}}`),
            ]);
            return response(200, {
                message: 'Reply created successfully',
                ok: true,
                data: {
                    id: result?.id,
                    taskId: task.id,
                },
            });
        } catch (error) {
            console.error('Error creating reply:', error);
            return response(500, {
                message: langs(
                    {
                        'zh-CN': '创建失败，请稍后再试',
                        'zh-TW': '創建失敗，請稍後再試',
                        'en-US': 'Failed to create, please try again later',
                        'es-ES': 'Error al crear, por favor intenta de nuevo más tarde',
                        'fr-FR': 'Échec de la création, veuillez réessayer plus tard',
                        'ru-RU': 'Ошибка создания, пожалуйста, попробуйте позже',
                        'ja-JP': '作成に失敗しました。後でもう一度お試しください',
                        'de-DE': 'Erstellung fehlgeschlagen, bitte später erneut versuchen',
                        'pt-BR': 'Falha ao criar, por favor tente novamente mais tarde',
                        'ko-KR': '생성에 실패했습니다. 나중에 다시 시도하세요',
                    },
                    lang,
                ),
            });
        }
    } else {
        return response(401, {
            message: langs(
                {
                    'zh-CN': '请登陆后再回复',
                    'zh-TW': '請登入後再回覆',
                    'en-US': 'Please log in to reply',
                    'es-ES': 'Por favor, inicia sesión para responder',
                    'fr-FR': 'Veuillez vous connecter pour répondre',
                    'ru-RU': 'Пожалуйста, войдите в систему, чтобы ответить',
                    'ja-JP': '返信するにはログインしてください',
                    'de-DE': 'Bitte melden Sie sich an, um zu antworten',
                    'pt-BR': 'Por favor, faça login para responder',
                    'ko-KR': '댓글을 달려면 로그인하세요',
                },
                lang,
            ),
        });
    }
}
