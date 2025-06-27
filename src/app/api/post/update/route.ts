import langs from '@/lib/lang';
import response from '../../_utils/response';
import auth from '../../_utils/auth';
import limitControl from '../../_utils/limit';
import prisma from '../../_utils/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    const JWT = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { lang = 'en-US', id, title, content, topic, published } = await request.json();

    if (!JWT) {
        return response(401, {
            message: langs(
                {
                    'zh-CN': '请登录后再修改帖子',
                    'en-US': 'Please log in to update post',
                    'de-DE': 'Bitte melden Sie sich an, um den Beitrag zu bearbeiten',
                    'es-ES': 'Por favor, inicia sesión para modificar la publicación',
                    'fr-FR': 'Veuillez vous connecter pour modifier le post',
                    'ja-JP': '投稿を更新するにはログインしてください',
                    'ko-KR': '게시물을 수정하려면 로그인하세요',
                    'pt-BR': 'Por favor, faça login para atualizar a postagem',
                    'ru-RU': 'Пожалуйста, войдите в систему, чтобы обновить пост',
                    'zh-TW': '請登入後再修改帖子',
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

    if (!token) {
        return response(401, {
            message: langs(
                {
                    'zh-CN': '请登录后再修改帖子',
                    'zh-TW': '請登入後再修改帖子',
                    'en-US': 'Please log in to update post',
                    'es-ES': 'Por favor, inicia sesión para modificar la publicación',
                    'fr-FR': 'Veuillez vous connecter pour modifier le post',
                    'ru-RU': 'Пожалуйста, войдите в систему, чтобы обновить пост',
                    'ja-JP': '投稿を更新するにはログインしてください',
                    'de-DE': 'Bitte melden Sie sich an, um den Beitrag zu bearbeiten',
                    'pt-BR': 'Por favor, faça login para atualizar a postagem',
                    'ko-KR': '게시물을 수정하려면 로그인하세요',
                },
                lang,
            ),
        });
    }

    if (!id) {
        return response(400, {
            message: langs(
                {
                    'zh-CN': '缺少帖子ID',
                    'zh-TW': '缺少帖子ID',
                    'en-US': 'Missing post ID',
                    'es-ES': 'Falta ID de la publicación',
                    'fr-FR': 'ID du post manquant',
                    'ru-RU': 'Отсутствует ID поста',
                    'ja-JP': '投稿IDが不足しています',
                    'de-DE': 'Beitrags-ID fehlt',
                    'pt-BR': 'ID da postagem ausente',
                    'ko-KR': '게시물 ID가 누락되었습니다',
                },
                lang,
            ),
        });
    }

    try {
        // 检查帖子是否存在且用户有权限修改
        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: { topics: true },
        });

        if (!existingPost) {
            return response(404, {
                message: langs(
                    {
                        'zh-CN': '帖子不存在',
                        'zh-TW': '帖子不存在',
                        'en-US': 'Post not found',
                        'es-ES': 'Publicación no encontrada',
                        'fr-FR': 'Post non trouvé',
                        'ru-RU': 'Пост не найден',
                        'ja-JP': '投稿が見つかりません',
                        'de-DE': 'Beitrag nicht gefunden',
                        'pt-BR': 'Postagem não encontrada',
                        'ko-KR': '게시물을 찾을 수 없습니다',
                    },
                    lang,
                ),
            });
        }

        // 检查用户权限（只有作者或管理员可以修改）
        if (existingPost.userUid !== token.uid && token.role !== 'ADMIN') {
            return response(403, {
                message: langs(
                    {
                        'zh-CN': '您没有权限修改此帖子',
                        'zh-TW': '您沒有權限修改此帖子',
                        'en-US': 'You do not have permission to modify this post',
                        'es-ES': 'No tienes permiso para modificar esta publicación',
                        'fr-FR': "Vous n'avez pas l'autorisation de modifier ce post",
                        'ru-RU': 'У вас нет разрешения на изменение этого поста',
                        'ja-JP': 'この投稿を変更する権限がありません',
                        'de-DE': 'Sie haben keine Berechtigung, diesen Beitrag zu ändern',
                        'pt-BR': 'Você não tem permissão para modificar esta postagem',
                        'ko-KR': '이 게시물을 수정할 권한이 없습니다',
                    },
                    lang,
                ),
            });
        }

        // 准备更新数据
        const updateData: any = {
            updatedAt: new Date(),
            lastReplyAt: new Date(),
        };

        if (title !== undefined) {
            updateData.title = title;
        }

        if (content !== undefined) {
            updateData.origin = content;
        }

        if (published !== undefined) {
            updateData.published = published;
        }

        // 处理主题更新
        if (topic && topic !== existingPost.topics[0]?.name) {
            updateData.topics = {
                disconnect: existingPost.topics.map(t => ({ name: t.name })),
                connect: { name: topic },
            };
        }

        // 更新帖子
        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { topics: true },
        });

        // 如果从草稿发布为正式帖子，创建翻译任务
        if (!existingPost.published && published === true) {
            try {
                const task = await prisma.task.create({
                    data: {
                        postId: updatedPost.id,
                        userUid: token.uid,
                    },
                });

                // 触发翻译工作流
                await fetch(process.env.TRANSLATE_WORKER as string, {
                    method: 'POST',
                    body: JSON.stringify({
                        password: process.env.TRANSLATE_WORKER_PASSWORD,
                        task: task.id,
                    }),
                });
            } catch (error) {
                console.error('Error creating translation task:', error);
                // 即使翻译任务创建失败，帖子更新仍然成功
            }
        }

        // 重新验证相关页面缓存
        await prisma.$disconnect();
        revalidatePath('/[locale]');
        if (updatedPost.topics[0]) {
            revalidatePath(`/[locale]/topic/${updatedPost.topics[0].name.replace('_', '-')}`);
        }
        revalidatePath(`/[locale]/post/${updatedPost.id}`);
        revalidatePath(`/[locale]/user/${token.uid}`);
        revalidatePath('/[locale]/user/draft');
        revalidatePath('/[locale]/user/post');

        return response(200, {
            message: langs(
                {
                    'zh-CN': published === false ? '草稿保存成功' : (published === true && !existingPost.published) ? '发布成功' : '帖子更新成功',
                    'zh-TW': published === false ? '草稿保存成功' : (published === true && !existingPost.published) ? '發布成功' : '帖子更新成功',
                    'en-US': published === false ? 'Draft saved successfully' : (published === true && !existingPost.published) ? 'Published successfully' : 'Post updated successfully',
                    'es-ES': published === false ? 'Borrador guardado con éxito' : (published === true && !existingPost.published) ? 'Publicado con éxito' : 'Publicación actualizada con éxito',
                    'fr-FR': published === false ? 'Brouillon enregistré avec succès' : (published === true && !existingPost.published) ? 'Publié avec succès' : 'Post mis à jour avec succès',
                    'ru-RU': published === false ? 'Черновик успешно сохранен' : (published === true && !existingPost.published) ? 'Успешно опубликовано' : 'Пост успешно обновлен',
                    'ja-JP': published === false ? 'ドラフトが正常に保存されました' : (published === true && !existingPost.published) ? '正常に公開されました' : '投稿が正常に更新されました',
                    'de-DE': published === false ? 'Entwurf erfolgreich gespeichert' : (published === true && !existingPost.published) ? 'Erfolgreich veröffentlicht' : 'Beitrag erfolgreich aktualisiert',
                    'pt-BR': published === false ? 'Rascunho salvo com sucesso' : (published === true && !existingPost.published) ? 'Publicado com sucesso' : 'Postagem atualizada com sucesso',
                    'ko-KR': published === false ? '초안이 성공적으로 저장되었습니다' : (published === true && !existingPost.published) ? '성공적으로 게시되었습니다' : '게시물이 성공적으로 업데이트되었습니다',
                },
                lang,
            ),
            ok: true,
        });

    } catch (error) {
        console.error('Error updating post:', error);
        return response(500, {
            message: langs(
                {
                    'zh-CN': '更新帖子失败，请稍后再试',
                    'zh-TW': '更新帖子失敗，請稍後再試',
                    'en-US': 'Failed to update post, please try again later',
                    'es-ES': 'Error al actualizar la publicación, por favor inténtalo de nuevo más tarde',
                    'fr-FR': 'Échec de la mise à jour du post, veuillez réessayer plus tard',
                    'ru-RU': 'Не удалось обновить пост, пожалуйста, попробуйте позже',
                    'ja-JP': '投稿の更新に失敗しました。後でもう一度お試しください',
                    'de-DE': 'Fehler beim Aktualisieren des Beitrags, bitte später erneut versuchen',
                    'pt-BR': 'Falha ao atualizar postagem, tente novamente mais tarde',
                    'ko-KR': '게시물 업데이트에 실패했습니다. 나중에 다시 시도하세요',
                },
                lang,
            ),
        });
    }
}
