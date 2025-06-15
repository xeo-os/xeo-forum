'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    Heart, 
    MessageCircle, 
    Pin, 
    Trash2, 
    Calendar, 
    FileText, 
    Loader2, 
    RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import token from '@/utils/userToken';
import lang from '@/lib/lang';

type Post = {
    id: number;
    title: string;
    titleENUS?: string | null;
    titleZHCN?: string | null;
    titleZHTW?: string | null;
    titleESES?: string | null;
    titleFRFR?: string | null;
    titleRURU?: string | null;
    titleJAJP?: string | null;
    titleKOKR?: string | null;
    titleDEDE?: string | null;
    titlePTBR?: string | null;
    origin: string;
    createdAt: string;
    published: boolean;
    pin: boolean;
    originLang: string | null;
    _count: {
        likes: number;
        Reply: number;
    };
    topics: {
        name: string;
        emoji: string;
        nameZHCN?: string | null;
        nameENUS?: string | null;
        nameZHTW?: string | null;
        nameESES?: string | null;
        nameFRFR?: string | null;
        nameRURU?: string | null;
        nameJAJP?: string | null;
        nameDEDE?: string | null;
        namePTBR?: string | null;
        nameKOKR?: string | null;
    }[];
};

interface UserPostsManagementProps {
    locale: string;
}

export function UserPostsManagement({ locale }: UserPostsManagementProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [deletingPosts, setDeletingPosts] = useState<Set<number>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastPostRef = useRef<HTMLDivElement>(null);

    const getLocalizedTitle = (post: Post): string => {
        const titleMap: Record<string, string | null | undefined> = {
            'zh-CN': post.titleZHCN,
            'en-US': post.titleENUS,
            'zh-TW': post.titleZHTW,
            'es-ES': post.titleESES,
            'fr-FR': post.titleFRFR,
            'ru-RU': post.titleRURU,
            'ja-JP': post.titleJAJP,
            'de-DE': post.titleDEDE,
            'pt-BR': post.titlePTBR,
            'ko-KR': post.titleKOKR,
        };
        return titleMap[locale] || post.title;
    };

    const getLocalizedTopicName = (topic: Post['topics'][0]): string => {
        const nameMap: Record<string, string | null | undefined> = {
            'zh-CN': topic.nameZHCN,
            'en-US': topic.nameENUS,
            'zh-TW': topic.nameZHTW,
            'es-ES': topic.nameESES,
            'fr-FR': topic.nameFRFR,
            'ru-RU': topic.nameRURU,
            'ja-JP': topic.nameJAJP,
            'de-DE': topic.nameDEDE,
            'pt-BR': topic.namePTBR,
            'ko-KR': topic.nameKOKR,
        };
        return nameMap[locale] || topic.name;
    };

    const fetchPosts = useCallback(async (page: number, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch('/api/user/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.get(),
                    'Accept-Language': locale,
                },
                body: JSON.stringify({ page }),
            });

            const result = await response.json();

            if (result.ok) {
                if (isLoadMore) {
                    setPosts(prev => [...prev, ...result.posts]);
                } else {
                    setPosts(result.posts);
                }
                setHasMore(result.hasMore);
                setCurrentPage(page);
            } else {
                toast.error(result.message || lang({
                    'zh-CN': '获取帖子失败',
                    'en-US': 'Failed to fetch posts',
                    'zh-TW': '獲取帖子失敗',
                    'es-ES': 'Error al obtener las publicaciones',
                    'fr-FR': 'Échec de la récupération des posts',
                    'ru-RU': 'Не удалось получить посты',
                    'ja-JP': '投稿の取得に失敗しました',
                    'de-DE': 'Fehler beim Abrufen der Beiträge',
                    'pt-BR': 'Falha ao buscar postagens',
                    'ko-KR': '게시물 가져오기 실패',
                }, locale));
            }
        } catch (error) {
            console.error('Fetch posts error:', error);
            toast.error(lang({
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
            }, locale));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [locale]);

    const handleDeletePost = async (post: Post) => {
        setDeletingPosts(prev => new Set(prev).add(post.id));

        try {
            const response = await fetch('/api/post/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.get(),
                    'Accept-Language': locale,
                },
                body: JSON.stringify({ id: post.id }),
            });

            const result = await response.json();

            if (result.ok) {
                setPosts(prev => prev.filter(p => p.id !== post.id));
                toast.success(result.message || lang({
                    'zh-CN': '帖子删除成功',
                    'en-US': 'Post deleted successfully',
                    'zh-TW': '帖子刪除成功',
                    'es-ES': 'Post eliminado exitosamente',
                    'fr-FR': 'Post supprimé avec succès',
                    'ru-RU': 'Пост успешно удален',
                    'ja-JP': '投稿が正常に削除されました',
                    'de-DE': 'Post erfolgreich gelöscht',
                    'pt-BR': 'Post deletado com sucesso',
                    'ko-KR': '게시물이 성공적으로 삭제되었습니다',
                }, locale));
            } else {
                toast.error(result.message || lang({
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
                }, locale));
            }
        } catch (error) {
            console.error('Delete post error:', error);
            toast.error(lang({
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
            }, locale));
        } finally {
            setDeletingPosts(prev => {
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
            return lang({
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
            }, locale);
        } else if (diffMins < 60) {
            return lang({
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
            }, locale);
        } else if (diffHours < 24) {
            return lang({
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
            }, locale);
        } else if (diffDays < 30) {
            return lang({
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
            }, locale);
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
                    fetchPosts(currentPage + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        if (lastPostRef.current) {
            observerRef.current.observe(lastPostRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, loading, currentPage, fetchPosts]);

    // 初始加载
    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">
                        {lang({
                            'zh-CN': '我的帖子',
                            'en-US': 'My Posts',
                            'zh-TW': '我的帖子',
                            'es-ES': 'Mis Publicaciones',
                            'fr-FR': 'Mes Messages',
                            'ru-RU': 'Мои Посты',
                            'ja-JP': '私の投稿',
                            'de-DE': 'Meine Beiträge',
                            'pt-BR': 'Minhas Postagens',
                            'ko-KR': '내 게시물',
                        }, locale)}
                    </h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPosts(1)}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {lang({
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
                    }, locale)}
                </Button>
            </div>

            {posts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted-foreground mb-2">
                            {lang({
                                'zh-CN': '暂无帖子',
                                'en-US': 'No posts yet',
                                'zh-TW': '暫無帖子',
                                'es-ES': 'Aún no hay publicaciones',
                                'fr-FR': 'Aucun post pour l\'instant',
                                'ru-RU': 'Пока нет постов',
                                'ja-JP': 'まだ投稿がありません',
                                'de-DE': 'Noch keine Beiträge',
                                'pt-BR': 'Ainda não há postagens',
                                'ko-KR': '아직 게시물이 없습니다',
                            }, locale)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {lang({
                                'zh-CN': '发布您的第一篇帖子来开始交流吧',
                                'en-US': 'Share your first post to start the conversation',
                                'zh-TW': '發布您的第一篇帖子來開始交流吧',
                                'es-ES': 'Comparte tu primera publicación para comenzar la conversación',
                                'fr-FR': 'Partagez votre premier post pour commencer la conversation',
                                'ru-RU': 'Поделитесь своим первым постом, чтобы начать общение',
                                'ja-JP': '最初の投稿を共有して会話を始めましょう',
                                'de-DE': 'Teilen Sie Ihren ersten Beitrag, um das Gespräch zu beginnen',
                                'pt-BR': 'Compartilhe sua primeira postagem para iniciar a conversa',
                                'ko-KR': '첫 번째 게시물을 공유하여 대화를 시작하세요',
                            }, locale)}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {posts.map((post, index) => (
                        <Card 
                            key={post.id} 
                            ref={index === posts.length - 1 ? lastPostRef : null}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Link
                                                href={`/${locale}/post/${post.id}/${post.titleENUS?.toLowerCase().replaceAll(" ","-").replace(/[^a-z-]/g, '')}`}
                                                className="font-semibold hover:text-primary transition-colors text-lg leading-tight break-words"
                                            >
                                                {getLocalizedTitle(post)}
                                            </Link>
                                            {post.pin && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <time dateTime={post.createdAt}>
                                                    {formatTime(post.createdAt)}
                                                </time>
                                            </div>
                                            <span>•</span>
                                            <Badge 
                                                variant={post.published ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {post.published ? lang({
                                                    'zh-CN': '已发布',
                                                    'en-US': 'Published',
                                                    'zh-TW': '已發布',
                                                    'es-ES': 'Publicado',
                                                    'fr-FR': 'Publié',
                                                    'ru-RU': 'Опубликовано',
                                                    'ja-JP': '公開済み',
                                                    'de-DE': 'Veröffentlicht',
                                                    'pt-BR': 'Publicado',
                                                    'ko-KR': '게시됨',
                                                }, locale) : lang({
                                                    'zh-CN': '草稿',
                                                    'en-US': 'Draft',
                                                    'zh-TW': '草稿',
                                                    'es-ES': 'Borrador',
                                                    'fr-FR': 'Brouillon',
                                                    'ru-RU': 'Черновик',
                                                    'ja-JP': '下書き',
                                                    'de-DE': 'Entwurf',
                                                    'pt-BR': 'Rascunho',
                                                    'ko-KR': '초안',
                                                }, locale)}
                                            </Badge>
                                        </div>

                                        {post.topics.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {post.topics.map((topic) => (
                                                    <Link
                                                        key={topic.name}
                                                        href={`/${locale}/topic/${topic.name}`}
                                                        className="hover:opacity-80 transition-opacity"
                                                    >
                                                        <Badge variant="outline" className="text-xs">
                                                            <span className="mr-1">{topic.emoji}</span>
                                                            {getLocalizedTopicName(topic)}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-4 w-4" />
                                                <span>{post._count.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{post._count.Reply}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPostToDelete(post);
                                            setDeleteDialogOpen(true);
                                        }}
                                        disabled={deletingPosts.has(post.id)}
                                        className="ml-4 text-destructive hover:text-destructive"
                                    >
                                        {deletingPosts.has(post.id) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {post.origin.substring(0, 200)}
                                    {post.origin.length > 200 && '...'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}

                    {loadingMore && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2 text-sm text-muted-foreground">
                                {lang({
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
                                }, locale)}
                            </span>
                        </div>
                    )}

                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {lang({
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
                                }, locale)}
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
                            {lang({
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
                            }, locale)}
                        </DialogTitle>
                        <DialogDescription>
                            {lang({
                                'zh-CN': '您确定要删除这篇帖子吗？此操作无法撤销。',
                                'en-US': 'Are you sure you want to delete this post? This action cannot be undone.',
                                'zh-TW': '您確定要刪除這篇帖子嗎？此操作無法撤銷。',
                                'es-ES': '¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.',
                                'fr-FR': 'Êtes-vous sûr de vouloir supprimer ce post ? Cette action ne peut pas être annulée.',
                                'ru-RU': 'Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.',
                                'ja-JP': 'この投稿を削除してもよろしいですか？この操作は元に戻せません。',
                                'de-DE': 'Sind Sie sicher, dass Sie diesen Beitrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
                                'pt-BR': 'Tem certeza de que deseja excluir esta postagem? Esta ação não pode ser desfeita.',
                                'ko-KR': '이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                            }, locale)}
                        </DialogDescription>
                    </DialogHeader>
                    {postToDelete && (
                        <div className="py-4">
                            <p className="font-medium">{getLocalizedTitle(postToDelete)}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {postToDelete.origin.substring(0, 100)}
                                {postToDelete.origin.length > 100 && '...'}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setPostToDelete(null);
                            }}
                        >
                            {lang({
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
                            }, locale)}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => postToDelete && handleDeletePost(postToDelete)}
                            disabled={deletingPosts.has(postToDelete?.id || 0)}
                        >
                            {deletingPosts.has(postToDelete?.id || 0) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {lang({
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
                            }, locale)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
