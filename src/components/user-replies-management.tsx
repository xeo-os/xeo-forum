'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Trash2, Calendar, FileText, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import token from '@/utils/userToken';
import lang from '@/lib/lang';

type Reply = {
    id: number;
    content: string;
    createdAt: string;
    _count: {
        likes: number;
    };
    post: {
        id: number;
        title: string;
        titleENUS: string | null;
        titleZHCN: string | null;
        titleZHTW: string | null;
        titleDEDE: string | null;
        titleESES: string | null;
        titleFRFR: string | null;
        titleRURU: string | null;
        titleJAJP: string | null;
        titlePTBR: string | null;
        titleKOKR: string | null;
    } | null;
};

interface UserPostsManagementProps {
    locale: string;
}

export function UserRepliesManagement({ locale }: UserPostsManagementProps) {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Reply | null>(null);
    const [deletingPosts, setDeletingPosts] = useState<Set<number>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastPostRef = useRef<HTMLDivElement>(null);

    const getLocalizedTitle = (reply: Reply): string => {
        if (!reply.post) {
            return lang({
                'zh-CN': '未知帖子',
                'en-US': 'Unknown Post',
                'zh-TW': '未知帖子',
                'es-ES': 'Publicación Desconocida',
                'fr-FR': 'Publication Inconnue',
                'ru-RU': 'Неизвестный Пост',
                'ja-JP': '不明な投稿',
                'de-DE': 'Unbekannter Beitrag',
                'pt-BR': 'Postagem Desconhecida',
                'ko-KR': '알 수 없는 게시물',
            }, locale);
        }

        const titleMap: Record<string, string | null | undefined> = {
            'zh-CN': reply.post.titleZHCN,
            'en-US': reply.post.titleENUS,
            'zh-TW': reply.post.titleZHTW,
            'es-ES': reply.post.titleESES,
            'fr-FR': reply.post.titleFRFR,
            'ru-RU': reply.post.titleRURU,
            'ja-JP': reply.post.titleJAJP,
            'de-DE': reply.post.titleDEDE,
            'pt-BR': reply.post.titlePTBR,
            'ko-KR': reply.post.titleKOKR,
        };
        return titleMap[locale] || reply.post.title;
    };

    const getReplyTitle = (reply: Reply): string => {
        const postTitle = getLocalizedTitle(reply);
        const replyPrefix = lang({
            'zh-CN': '回复：',
            'en-US': 'Reply: ',
            'zh-TW': '回覆：',
            'es-ES': 'Respuesta: ',
            'fr-FR': 'Réponse : ',
            'ru-RU': 'Ответ: ',
            'ja-JP': '返信：',
            'de-DE': 'Antwort: ',
            'pt-BR': 'Resposta: ',
            'ko-KR': '답글: ',
        }, locale);
        return `${replyPrefix}${postTitle}`;
    };

    const fetchReplies = useCallback(
        async (page: number, isLoadMore = false) => {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const response = await fetch('/api/user/replies', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token.get(),
                        'Accept-Language': locale,
                    },
                    body: JSON.stringify({ page }),
                });

                const result = await response.json();
                console.log(result);

                if (result.ok) {
                    if (isLoadMore) {
                        setReplies((prev) => [...prev, ...result.reply]);
                    } else {
                        setReplies(result.reply);
                    }
                    setHasMore(result.hasMore);
                    setCurrentPage(page);
                } else {
                    toast.error(
                        result.message ||
                            lang(
                                {
                                    'zh-CN': '获取回复失败',
                                    'en-US': 'Failed to fetch replies',
                                    'zh-TW': '獲取回覆失敗',
                                    'es-ES': 'Error al obtener respuestas',
                                    'fr-FR': 'Échec de la récupération des réponses',
                                    'ru-RU': 'Не удалось получить ответы',
                                    'ja-JP': '返信の取得に失敗しました',
                                    'de-DE': 'Abrufen der Antworten fehlgeschlagen',
                                    'pt-BR': 'Falha ao buscar respostas',
                                    'ko-KR': '답변 가져오기 실패',
                                },
                                locale,
                            ),
                    );
                }
            } catch (error) {
                console.error('Fetch posts error:', error);
                toast.error(
                    lang(
                        {
                            'zh-CN': '网络错误，请重试',
                            'en-US': 'Network error, please try again',
                            'zh-TW': '網絡錯誤，請重試',
                            'es-ES': 'Error de red, inténtalo de nuevo',
                            'fr-FR': 'Erreur réseau, veuillez réessayer',
                            'ru-RU': 'Сетевая ошибка, попробуйте еще раз',
                            'ja-JP': 'ネットワークエラー、もう一度お試しください',
                            'de-DE': 'Netzwerkfehler, bitte versuchen Sie es erneut',
                            'pt-BR': 'Erro de rede, tente novamente',
                            'ko-KR': '네트워크 오류, 다시 시도해주세요',
                        },
                        locale,
                    ),
                );
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [locale],
    );

    const handleDeletePost = async (post: Reply) => {
        setDeletingPosts((prev) => new Set(prev).add(post.id));

        try {
            const response = await fetch('/api/reply/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.get(),
                    'Accept-Language': locale,
                },
                body: JSON.stringify({ id: post.id }),
            });

            const result = await response.json();

            if (result.ok) {
                setReplies((prev) => prev.filter((p) => p.id !== post.id));
                toast.success(
                    result.message ||
                        lang(
                            {
                                'zh-CN': '回复删除成功',
                                'en-US': 'Reply deleted successfully',
                                'zh-TW': '回覆刪除成功',
                                'es-ES': 'Respuesta eliminada con éxito',
                                'fr-FR': 'Réponse supprimée avec succès',
                                'ru-RU': 'Ответ успешно удален',
                                'ja-JP': '返信が正常に削除されました',
                                'de-DE': 'Antwort erfolgreich gelöscht',
                                'pt-BR': 'Resposta excluída com sucesso',
                                'ko-KR': '답변이 성공적으로 삭제되었습니다',
                            },
                            locale,
                        ),
                );
            } else {
                toast.error(
                    result.message ||
                        lang(
                            {
                                'zh-CN': '删除失败，请重试',
                                'en-US': 'Delete failed, please try again',
                                'zh-TW': '刪除失敗，請重試',
                                'es-ES': 'Error al eliminar, inténtalo de nuevo',
                                'fr-FR': 'Échec de la suppression, veuillez réessayer',
                                'ru-RU': 'Ошибка удаления, попробуйте еще раз',
                                'ja-JP': '削除に失敗しました。もう一度お試しください',
                                'de-DE': 'Löschen fehlgeschlagen, bitte versuchen Sie es erneut',
                                'pt-BR': 'Falha ao deletar, tente novamente',
                                'ko-KR': '삭제 실패, 다시 시도해주세요',
                            },
                            locale,
                        ),
                );
            }
        } catch (error) {
            console.error('Delete post error:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '网络错误，请重试',
                        'en-US': 'Network error, please try again',
                        'zh-TW': '網絡錯誤，請重試',
                        'es-ES': 'Error de red, inténtalo de nuevo',
                        'fr-FR': 'Erreur réseau, veuillez réessayer',
                        'ru-RU': 'Сетевая ошибка, попробуйте еще раз',
                        'ja-JP': 'ネットワークエラー、もう一度お試しください',
                        'de-DE': 'Netzwerkfehler, bitte versuchen Sie es erneut',
                        'pt-BR': 'Erro de rede, tente novamente',
                        'ko-KR': '네트워크 오류, 다시 시도해주세요',
                    },
                    locale,
                ),
            );
        } finally {
            setDeletingPosts((prev) => {
                const newSet = new Set(prev);
                newSet.delete(post.id);
                return newSet;
            });
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) {
            return lang(
                {
                    'zh-CN': '刚刚',
                    'en-US': 'just now',
                    'zh-TW': '剛剛',
                    'es-ES': 'ahora mismo',
                    'fr-FR': "à l'instant",
                    'ru-RU': 'только что',
                    'ja-JP': 'たった今',
                    'de-DE': 'gerade eben',
                    'pt-BR': 'agora mesmo',
                    'ko-KR': '방금',
                },
                locale,
            );
        } else if (diffMins < 60) {
            return lang(
                {
                    'zh-CN': `${diffMins}分钟前`,
                    'en-US': `${diffMins}m ago`,
                    'zh-TW': `${diffMins}分鐘前`,
                    'es-ES': `hace ${diffMins}m`,
                    'fr-FR': `il y a ${diffMins}m`,
                    'ru-RU': `${diffMins}м назад`,
                    'ja-JP': `${diffMins}分前`,
                    'de-DE': `vor ${diffMins}m`,
                    'pt-BR': `há ${diffMins}m`,
                    'ko-KR': `${diffMins}분 전`,
                },
                locale,
            );
        } else if (diffHours < 24) {
            return lang(
                {
                    'zh-CN': `${diffHours}小时前`,
                    'en-US': `${diffHours}h ago`,
                    'zh-TW': `${diffHours}小時前`,
                    'es-ES': `hace ${diffHours}h`,
                    'fr-FR': `il y a ${diffHours}h`,
                    'ru-RU': `${diffHours}ч назад`,
                    'ja-JP': `${diffHours}時間前`,
                    'de-DE': `vor ${diffHours}h`,
                    'pt-BR': `há ${diffHours}h`,
                    'ko-KR': `${diffHours}시간 전`,
                },
                locale,
            );
        } else if (diffDays < 30) {
            return lang(
                {
                    'zh-CN': `${diffDays}天前`,
                    'en-US': `${diffDays}d ago`,
                    'zh-TW': `${diffDays}天前`,
                    'es-ES': `hace ${diffDays}d`,
                    'fr-FR': `il y a ${diffDays}j`,
                    'ru-RU': `${diffDays}д назад`,
                    'ja-JP': `${diffDays}日前`,
                    'de-DE': `vor ${diffDays}T`,
                    'pt-BR': `há ${diffDays}d`,
                    'ko-KR': `${diffDays}일 전`,
                },
                locale,
            );
        } else {
            return date.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    // 无限滚动逻辑
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchReplies(currentPage + 1, true);
                }
            },
            { threshold: 0.1 },
        );

        if (lastPostRef.current) {
            observerRef.current.observe(lastPostRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, loading, currentPage, fetchReplies]);

    // 初始加载
    useEffect(() => {
        fetchReplies(1);
    }, [fetchReplies]);

    if (loading) {
        return (
            <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    <h2 className='text-xl font-semibold'>
                        {lang(
                            {
                                'zh-CN': '我的回复',
                                'en-US': 'My Replies',
                                'zh-TW': '我的回覆',
                                'es-ES': 'Mis Respuestas',
                                'fr-FR': 'Mes Réponses',
                                'ru-RU': 'Мои Ответы',
                                'ja-JP': '私の返信',
                                'de-DE': 'Meine Antworten',
                                'pt-BR': 'Minhas Respostas',
                                'ko-KR': '내 답변',
                            },
                            locale,
                        )}
                    </h2>
                </div>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={() => fetchReplies(1)}
                    disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {lang(
                        {
                            'zh-CN': '刷新',
                            'en-US': 'Refresh',
                            'zh-TW': '刷新',
                            'es-ES': 'Actualizar',
                            'fr-FR': 'Actualiser',
                            'ru-RU': 'Обновить',
                            'ja-JP': '更新',
                            'de-DE': 'Aktualisieren',
                            'pt-BR': 'Atualizar',
                            'ko-KR': '새로고침',
                        },
                        locale,
                    )}
                </Button>
            </div>

            {replies.length === 0 ? (
                <Card>
                    <CardContent className='py-12 text-center'>
                        <FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                        <p className='text-lg font-medium text-muted-foreground mb-2'>
                            {lang(
                                {
                                    'zh-CN': '暂无回复',
                                    'en-US': 'No replies yet',
                                    'zh-TW': '暫無回覆',
                                    'es-ES': 'Aún no hay respuestas',
                                    'fr-FR': 'Aucune réponse pour le moment',
                                    'ru-RU': 'Пока нет ответов',
                                    'ja-JP': 'まだ返信はありません',
                                    'de-DE': 'Noch keine Antworten',
                                    'pt-BR': 'Ainda sem respostas',
                                    'ko-KR': '아직 답변이 없습니다',
                                },
                                locale,
                            )}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                            {lang(
                                {
                                    'zh-CN': '发布您的第一个回复来开始交流吧',
                                    'en-US': 'Start engaging by posting your first reply',
                                    'zh-TW': '發佈您的第一個回覆來開始交流吧',
                                    'es-ES':
                                        'Comienza a participar publicando tu primera respuesta',
                                    'fr-FR':
                                        'Commencez à interagir en publiant votre première réponse',
                                    'ru-RU':
                                        'Начните взаимодействовать, опубликовав свой первый ответ',
                                    'ja-JP': '最初の返信を投稿して交流を始めましょう',
                                    'de-DE':
                                        'Beginnen Sie mit der Interaktion, indem Sie Ihre erste Antwort veröffentlichen',
                                    'pt-BR': 'Comece a interagir postando sua primeira resposta',
                                    'ko-KR': '첫 번째 답변을 게시하여 참여를 시작하세요',
                                },
                                locale,
                            )}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className='space-y-4'>
                    {replies.map((reply, index) => (
                        <Card
                            key={reply.id}
                            ref={index === replies.length - 1 ? lastPostRef : null}
                            className='hover:shadow-md transition-shadow'>
                            <CardHeader className='pb-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='font-medium text-lg mb-2 line-clamp-2'>
                                            {reply.post ? (
                                                <Link
                                                    href={`/${locale}/post/${reply.post.id}/${reply.post.titleENUS?.toLowerCase().replaceAll(" ","-").replace(/[^a-z-]/g, '')}`}
                                                    className='hover:text-primary transition-colors'
                                                    rel="noopener"
                                                >
                                                    {getReplyTitle(reply)}
                                                </Link>
                                            ) : (
                                                <span className='text-muted-foreground'>
                                                    {getReplyTitle(reply)}
                                                </span>
                                            )}
                                        </h3>

                                        <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
                                            <div className='flex items-center gap-1'>
                                                <Calendar className='h-4 w-4' />
                                                <time dateTime={reply.createdAt}>
                                                    {formatTime(reply.createdAt)}
                                                </time>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                            <div className='flex items-center gap-1'>
                                                <Heart className='h-4 w-4' />
                                                <span>{reply._count.likes}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            setPostToDelete(reply);
                                            setDeleteDialogOpen(true);
                                        }}
                                        disabled={deletingPosts.has(reply.id)}
                                        className='ml-4 text-destructive hover:text-destructive'>
                                        {deletingPosts.has(reply.id) ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        ) : (
                                            <Trash2 className='h-4 w-4' />
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className='pt-0'>
                                <p className='text-sm text-muted-foreground line-clamp-3'>
                                    {reply.content.substring(0, 200)}
                                    {reply.content.length > 200 && '...'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}

                    {loadingMore && (
                        <div className='flex items-center justify-center py-8'>
                            <Loader2 className='h-6 w-6 animate-spin' />
                            <span className='ml-2 text-sm text-muted-foreground'>
                                {lang(
                                    {
                                        'zh-CN': '加载更多...',
                                        'en-US': 'Loading more...',
                                        'zh-TW': '載入更多...',
                                        'es-ES': 'Cargando más...',
                                        'fr-FR': 'Chargement...',
                                        'ru-RU': 'Загрузка...',
                                        'ja-JP': '読み込み中...',
                                        'de-DE': 'Lade mehr...',
                                        'pt-BR': 'Carregando mais...',
                                        'ko-KR': '더 불러오는 중...',
                                    },
                                    locale,
                                )}
                            </span>
                        </div>
                    )}

                    {!hasMore && replies.length > 0 && (
                        <div className='text-center py-8'>
                            <p className='text-sm text-muted-foreground'>
                                {lang(
                                    {
                                        'zh-CN': '没有更多帖子了',
                                        'en-US': 'No more posts',
                                        'zh-TW': '沒有更多帖子了',
                                        'es-ES': 'No hay más publicaciones',
                                        'fr-FR': 'Aucun autre post',
                                        'ru-RU': 'Больше постов нет',
                                        'ja-JP': 'これ以上投稿はありません',
                                        'de-DE': 'Keine weiteren Beiträge',
                                        'pt-BR': 'Não há mais postagens',
                                        'ko-KR': '더 이상 게시물이 없습니다',
                                    },
                                    locale,
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {lang(
                                {
                                    'zh-CN': '确认删除',
                                    'en-US': 'Confirm Delete',
                                    'zh-TW': '確認刪除',
                                    'es-ES': 'Confirmar eliminación',
                                    'fr-FR': 'Confirmer la suppression',
                                    'ru-RU': 'Подтвердить удаление',
                                    'ja-JP': '削除の確認',
                                    'de-DE': 'Löschen bestätigen',
                                    'pt-BR': 'Confirmar exclusão',
                                    'ko-KR': '삭제 확인',
                                },
                                locale,
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {lang(
                                {
                                    'zh-CN': '您确定要删除这条回复吗？此操作无法撤销。',
                                    'en-US':
                                        'Are you sure you want to delete this reply? This action cannot be undone.',
                                    'zh-TW': '您確定要刪除這條回覆嗎？此操作無法撤銷。',
                                    'es-ES':
                                        '¿Estás seguro de que quieres eliminar esta respuesta? Esta acción no se puede deshacer.',
                                    'fr-FR':
                                        'Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action ne peut pas être annulée.',
                                    'ru-RU':
                                        'Вы уверены, что хотите удалить этот ответ? Это действие нельзя отменить.',
                                    'ja-JP':
                                        'この返信を削除してもよろしいですか？この操作は元に戻せません。',
                                    'de-DE':
                                        'Sind Sie sicher, dass Sie diese Antwort löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
                                    'pt-BR':
                                        'Tem certeza de que deseja excluir esta resposta? Esta ação não pode ser desfeita.',
                                    'ko-KR':
                                        '이 답글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                                },
                                locale,
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {postToDelete && (
                        <div className='py-4'>
                            <p className='font-medium'>{getReplyTitle(postToDelete)}</p>
                            <p className='text-sm text-muted-foreground mt-1'>
                                {postToDelete.content.substring(0, 100)}
                                {postToDelete.content.length > 100 && '...'}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setPostToDelete(null);
                            }}>
                            {lang(
                                {
                                    'zh-CN': '取消',
                                    'en-US': 'Cancel',
                                    'zh-TW': '取消',
                                    'es-ES': 'Cancelar',
                                    'fr-FR': 'Annuler',
                                    'ru-RU': 'Отменить',
                                    'ja-JP': 'キャンセル',
                                    'de-DE': 'Abbrechen',
                                    'pt-BR': 'Cancelar',
                                    'ko-KR': '취소',
                                },
                                locale,
                            )}
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={() => postToDelete && handleDeletePost(postToDelete)}
                            disabled={deletingPosts.has(postToDelete?.id || 0)}>
                            {deletingPosts.has(postToDelete?.id || 0) ? (
                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            ) : (
                                <Trash2 className='h-4 w-4 mr-2' />
                            )}
                            {lang(
                                {
                                    'zh-CN': '删除',
                                    'en-US': 'Delete',
                                    'zh-TW': '刪除',
                                    'es-ES': 'Eliminar',
                                    'fr-FR': 'Supprimer',
                                    'ru-RU': 'Удалить',
                                    'ja-JP': '削除',
                                    'de-DE': 'Löschen',
                                    'pt-BR': 'Excluir',
                                    'ko-KR': '삭제',
                                },
                                locale,
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
