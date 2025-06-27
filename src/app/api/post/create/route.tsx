import langs from '@/lib/lang';
import response from '../../_utils/response';
import auth from '../../_utils/auth';
import limitControl from '../../_utils/limit';
import prisma from '../../_utils/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    const JWT = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { lang = 'en-US', title, content, topic, draft } = await request.json();

    if (!JWT) {
        return response(401, {
            message: langs(
                {
                    'zh-CN': '请登陆后再创建帖子',
                    'en-US': 'Please log in to create a post',
                    'de-DE': 'Bitte melden Sie sich an, um einen Beitrag zu erstellen',
                    'es-ES': 'Por favor, inicia sesión para crear una publicación',
                    'fr-FR': 'Veuillez vous connecter pour créer un post',
                    'ja-JP': '投稿するにはログインしてください',
                    'ko-KR': '게시물을 작성하려면 로그인하세요',
                    'pt-BR': 'Por favor, faça login para criar uma postagem',
                    'ru-RU': 'Пожалуйста, войдите в систему, чтобы создать пост',
                    'zh-TW': '請登入後再創建帖子',
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
            if (draft) {
                try {
                    await prisma.post.create({
                        data: {
                            title,
                            origin: content,
                            topics: {
                                connect: { name: topic },
                            },
                            published: false,
                            userUid: token.uid,
                        },
                    });

                    return response(200, {
                        message: langs(
                            {
                                'zh-CN': '草稿已保存',
                                'en-US': 'Draft saved successfully',
                                'de-DE': 'Entwurf erfolgreich gespeichert',
                                'es-ES': 'Borrador guardado con éxito',
                                'fr-FR': 'Brouillon enregistré avec succès',
                                'ja-JP': 'ドラフトが正常に保存されました',
                                'ko-KR': '초안이 성공적으로 저장되었습니다',
                                'pt-BR': 'Rascunho salvo com sucesso',
                                'ru-RU': 'Черновик успешно сохранен',
                                'zh-TW': '草稿已保存',
                            },
                            lang,
                        ),
                        ok: true,
                    });
                } catch (error) {
                    console.error('Error saving draft:', error);
                    return response(500, {
                        message: langs(
                            {
                                'zh-CN': '保存草稿失败，请稍后再试',
                                'en-US': 'Failed to save draft, please try again later',
                                'de-DE':
                                    'Fehler beim Speichern des Entwurfs, bitte später erneut versuchen',
                                'es-ES':
                                    'Error al guardar el borrador, por favor inténtalo de nuevo más tarde',
                                'fr-FR':
                                    "Échec de l'enregistrement du brouillon, veuillez réessayer plus tard",
                                'ja-JP': 'ドラフトの保存に失敗しました。後でもう一度お試しください',
                                'ko-KR': '초안 저장에 실패했습니다. 나중에 다시 시도하세요',
                                'pt-BR': 'Falha ao salvar rascunho, tente novamente mais tarde',
                                'ru-RU':
                                    'Не удалось сохранить черновик, пожалуйста, попробуйте позже',
                                'zh-TW': '保存草稿失敗，請稍後再試',
                            },
                            lang,
                        ),
                    });
                }
            } else {
                // 正式发布
                const post = await prisma.post.create({
                    data: {
                        title,
                        origin: content,
                        topics: {
                            connect: { name: topic },
                        },
                        published: true,
                        userUid: token.uid,
                    },
                });
                // 创建翻译Task
                const task = await prisma.task.create({
                    data: {
                        postId: post.id,
                        userUid: token.uid,
                    },
                });

                await prisma.$disconnect();
                // 开始翻译Task
                await fetch(process.env.TRANSLATE_WORKER as string, {
                    method: 'POST',
                    body: JSON.stringify({
                        password: process.env.TRANSLATE_WORKER_PASSWORD,
                        task: task.id,
                    }),
                });
                revalidatePath('/[locale]/page');
                revalidatePath(`/[locale]/topic/${topic.replace('_', '-')}/page`);
                revalidatePath(`/[locale]/post/${post.id}`);
                revalidatePath(`/[locale]/user/${token.uid}}`);
                return response(200, { message: task.id, ok: true });
            }
        } catch (error) {
            console.error('Error creating post:', error);
            return response(500, {
                message: langs(
                    {
                        'zh-CN': '创建帖子失败，请稍后再试',
                        'en-US': 'Failed to create post, please try again later',
                        'de-DE': 'Beitragserstellung fehlgeschlagen, bitte später erneut versuchen',
                        'es-ES':
                            'Error al crear la publicación, por favor inténtalo de nuevo más tarde',
                        'fr-FR': 'Échec de la création du post, veuillez réessayer plus tard',
                        'ja-JP': '投稿の作成に失敗しました。後でもう一度お試しください',
                        'ko-KR': '게시물 생성에 실패했습니다. 나중에 다시 시도하세요',
                        'pt-BR': 'Falha ao criar postagem, tente novamente mais tarde',
                        'ru-RU': 'Не удалось создать пост, пожалуйста, попробуйте позже',
                        'zh-TW': '創建帖子失敗，請稍後再試',
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
