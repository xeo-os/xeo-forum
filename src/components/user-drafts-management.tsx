'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle 
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
    Edit, 
    Trash2, 
    Calendar, 
    FileText, 
    Loader2, 
    RefreshCw,
    Save,
    Send,
    X
} from 'lucide-react';
import {
    RiArrowDownSLine,
    RiCheckLine,
    RiSearchLine,
} from '@remixicon/react';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/markdown-editor';
import { EnhancedLoading, ContentTransition, ListItemTransition } from '@/components/enhanced-loading';
import token from '@/utils/userToken';
import lang from '@/lib/lang';

type Draft = {
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
    updatedAt: string;
    published: boolean;
    pin: boolean;
    originLang: string | null;
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

interface UserDraftsManagementProps {
    locale: string;
}

export function UserDraftsManagement({ locale }: UserDraftsManagementProps) {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null);
    const [draftToEdit, setDraftToEdit] = useState<Draft | null>(null);
    const [deletingDrafts, setDeletingDrafts] = useState<Set<number>>(new Set());
    const [savingDraft, setSavingDraft] = useState(false);
    const [publishingDraft, setPublishingDraft] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastDraftRef = useRef<HTMLDivElement>(null);
    
    // 编辑表单状态
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);
    const [topicSearchQuery, setTopicSearchQuery] = useState('');

    // 模拟主题数据 - 实际项目中应该从 API 获取
    const topics = [
        {
            title: '技术讨论',
            items: [
                { icon: '💻', title: '编程技术', name: 'programming' },
                { icon: '🔧', title: '工具软件', name: 'tools' },
                { icon: '🌐', title: '网络技术', name: 'network' },
            ]
        },
        {
            title: '生活分享',
            items: [
                { icon: '🎮', title: '游戏娱乐', name: 'gaming' },
                { icon: '📚', title: '学习心得', name: 'learning' },
                { icon: '🎨', title: '创意设计', name: 'design' },
            ]
        }
    ];

    // 获取所有主题选项
    const getAllTopics = () => {
        const allTopics: Array<{ display: string; name: string }> = [];
        topics.forEach((topic) => {
            if (topic.items) {
                topic.items.forEach((item) => {
                    allTopics.push({
                        display: item.icon + ' ' + item.title,
                        name: item.name,
                    });
                });
            }
        });
        return allTopics;
    };

    // 过滤主题选项
    const getFilteredTopics = () => {
        const allTopics = getAllTopics();
        if (!topicSearchQuery.trim()) {
            return allTopics;
        }
        return allTopics.filter((topic) =>
            topic.display.toLowerCase().includes(topicSearchQuery.toLowerCase()),
        );
    };

    // 选择主题
    const handleTopicSelect = (topicName: string, topicDisplay: string) => {
        setSelectedTopic(topicDisplay);
        setSelectedTopicName(topicName);
        setTopicDialogOpen(false);
        setTopicSearchQuery('');
    };

    const getLocalizedTitle = (draft: Draft): string => {
        const titleMap: Record<string, string | null | undefined> = {
            'zh-CN': draft.titleZHCN,
            'en-US': draft.titleENUS,
            'zh-TW': draft.titleZHTW,
            'es-ES': draft.titleESES,
            'fr-FR': draft.titleFRFR,
            'ru-RU': draft.titleRURU,
            'ja-JP': draft.titleJAJP,
            'de-DE': draft.titleDEDE,
            'pt-BR': draft.titlePTBR,
            'ko-KR': draft.titleKOKR,
        };
        return titleMap[locale] || draft.title;
    };

    const getLocalizedTopicName = (topic: Draft['topics'][0]): string => {
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

    const fetchDrafts = useCallback(async (page: number, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch('/api/user/drafts', {
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
                    setDrafts(prev => [...prev, ...result.drafts]);
                } else {
                    setDrafts(result.drafts);
                }
                setHasMore(result.hasMore);
                setCurrentPage(page);
            } else {
                toast.error(result.message || lang({
                    'zh-CN': '获取草稿失败',
                    'en-US': 'Failed to fetch drafts',
                    'zh-TW': '獲取草稿失敗',
                    'es-ES': 'Error al obtener los borradores',
                    'fr-FR': 'Échec de la récupération des brouillons',
                    'ru-RU': 'Не удалось получить черновики',
                    'ja-JP': '下書きの取得に失敗しました',
                    'de-DE': 'Fehler beim Abrufen der Entwürfe',
                    'pt-BR': 'Falha ao buscar rascunhos',
                    'ko-KR': '초안 가져오기 실패',
                }, locale));
            }
        } catch (error) {
            console.error('Fetch drafts error:', error);
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

    const handleDeleteDraft = async (draft: Draft) => {
        setDeletingDrafts(prev => new Set(prev).add(draft.id));

        try {
            const response = await fetch('/api/post/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.get(),
                    'Accept-Language': locale,
                },
                body: JSON.stringify({ id: draft.id }),
            });

            const result = await response.json();

            if (result.ok) {
                setDrafts(prev => prev.filter(d => d.id !== draft.id));
                toast.success(result.message || lang({
                    'zh-CN': '草稿删除成功',
                    'en-US': 'Draft deleted successfully',
                    'zh-TW': '草稿刪除成功',
                    'es-ES': 'Borrador eliminado exitosamente',
                    'fr-FR': 'Brouillon supprimé avec succès',
                    'ru-RU': 'Черновик успешно удален',
                    'ja-JP': '下書きが正常に削除されました',
                    'de-DE': 'Entwurf erfolgreich gelöscht',
                    'pt-BR': 'Rascunho deletado com sucesso',
                    'ko-KR': '초안이 성공적으로 삭제되었습니다',
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
            console.error('Delete draft error:', error);
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
            setDeletingDrafts(prev => {
                const newSet = new Set(prev);
                newSet.delete(draft.id);
                return newSet;
            });
            setDeleteDialogOpen(false);
            setDraftToDelete(null);
        }
    };

    const handleEditDraft = (draft: Draft) => {
        setDraftToEdit(draft);
        setEditTitle(getLocalizedTitle(draft));
        setEditContent(draft.origin);
        
        // 设置已选择的主题
        if (draft.topics.length > 0) {
            const topic = draft.topics[0];
            const topicDisplay = topic.emoji + ' ' + getLocalizedTopicName(topic);
            setSelectedTopic(topicDisplay);
            setSelectedTopicName(topic.name);
        } else {
            setSelectedTopic('');
            setSelectedTopicName('');
        }
        
        setEditDialogOpen(true);
    };

    // 插入表情符号
    const insertEmoji = (emoji: string) => {
        setEditContent((prev) => prev + emoji);
    };

    const handleSaveDraft = async () => {
        if (!draftToEdit || !editTitle.trim() || !editContent.trim()) {
            toast.error(lang({
                'zh-CN': '标题和内容不能为空',
                'en-US': 'Title and content cannot be empty',
                'zh-TW': '標題和內容不能為空',
                'es-ES': 'El título y el contenido no pueden estar vacíos',
                'fr-FR': 'Le titre et le contenu ne peuvent pas être vides',
                'ru-RU': 'Заголовок и содержание не могут быть пустыми',
                'ja-JP': 'タイトルと内容は空にできません',
                'de-DE': 'Titel und Inhalt dürfen nicht leer sein',
                'pt-BR': 'Título e conteúdo não podem estar vazios',
                'ko-KR': '제목과 내용은 비워둘 수 없습니다',
            }, locale));
            return;
        }

        setSavingDraft(true);

        try {
            const response = await fetch('/api/post/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.get(),
                    'Accept-Language': locale,
                },
                body: JSON.stringify({
                    id: draftToEdit.id,
                    title: editTitle,
                    content: editContent,
                    topic: selectedTopicName || (draftToEdit.topics[0]?.name),
                    published: false,
                }),
            });

            const result = await response.json();

            if (result.ok) {
                toast.success(lang({
                    'zh-CN': '草稿保存成功',
                    'en-US': 'Draft saved successfully',
                    'zh-TW': '草稿保存成功',
                    'es-ES': 'Borrador guardado exitosamente',
                    'fr-FR': 'Brouillon sauvegardé avec succès',
                    'ru-RU': 'Черновик успешно сохранен',
                    'ja-JP': '下書きが正常に保存されました',
                    'de-DE': 'Entwurf erfolgreich gespeichert',
                    'pt-BR': 'Rascunho salvo com sucesso',
                    'ko-KR': '초안이 성공적으로 저장되었습니다',
                }, locale));
                setEditDialogOpen(false);
                fetchDrafts(1); // 刷新列表
            } else {
                toast.error(result.message || lang({
                    'zh-CN': '保存失败，请重试',
                    'en-US': 'Save failed, please try again',
                    'zh-TW': '保存失敗，請重試',
                    'es-ES': 'Error al guardar, inténtalo de nuevo',
                    'fr-FR': 'Échec de la sauvegarde, veuillez réessayer',
                    'ru-RU': 'Ошибка сохранения, попробуйте еще раз',
                    'ja-JP': '保存に失敗しました。もう一度お試しください',
                    'de-DE': 'Speichern fehlgeschlagen, bitte versuchen Sie es erneut',
                    'pt-BR': 'Falha ao salvar, tente novamente',
                    'ko-KR': '저장 실패, 다시 시도해주세요',
                }, locale));
            }
        } catch (error) {
            console.error('Save draft error:', error);
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
            setSavingDraft(false);
        }
    };

    const handlePublishDraft = async () => {
        if (!draftToEdit || !editTitle.trim() || !editContent.trim()) {
            toast.error(lang({
                'zh-CN': '标题和内容不能为空',
                'en-US': 'Title and content cannot be empty',
                'zh-TW': '標題和內容不能為空',
                'es-ES': 'El título y el contenido no pueden estar vacíos',
                'fr-FR': 'Le titre et le contenu ne peuvent pas être vides',
                'ru-RU': 'Заголовок и содержание не могут быть пустыми',
                'ja-JP': 'タイトルと内容は空にできません',
                'de-DE': 'Titel und Inhalt dürfen nicht leer sein',
                'pt-BR': 'Título e conteúdo não podem estar vazios',
                'ko-KR': '제목과 내용은 비워둘 수 없습니다',
            }, locale));
            return;
        }

        setPublishingDraft(true);

        try {
            const response = await fetch('/api/post/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.get(),
                    'Accept-Language': locale,
                },
                body: JSON.stringify({
                    id: draftToEdit.id,
                    title: editTitle,
                    content: editContent,
                    topic: selectedTopicName || (draftToEdit.topics[0]?.name),
                    published: true,
                }),
            });

            const result = await response.json();

            if (result.ok) {
                toast.success(lang({
                    'zh-CN': '发布成功',
                    'en-US': 'Published successfully',
                    'zh-TW': '發布成功',
                    'es-ES': 'Publicado exitosamente',
                    'fr-FR': 'Publié avec succès',
                    'ru-RU': 'Успешно опубликовано',
                    'ja-JP': '正常に公開されました',
                    'de-DE': 'Erfolgreich veröffentlicht',
                    'pt-BR': 'Publicado com sucesso',
                    'ko-KR': '성공적으로 게시되었습니다',
                }, locale));
                setEditDialogOpen(false);
                fetchDrafts(1); // 刷新列表
            } else {
                toast.error(result.message || lang({
                    'zh-CN': '发布失败，请重试',
                    'en-US': 'Publish failed, please try again',
                    'zh-TW': '發布失敗，請重試',
                    'es-ES': 'Error al publicar, inténtalo de nuevo',
                    'fr-FR': 'Échec de la publication, veuillez réessayer',
                    'ru-RU': 'Ошибка публикации, попробуйте еще раз',
                    'ja-JP': '公開に失敗しました。もう一度お試しください',
                    'de-DE': 'Veröffentlichung fehlgeschlagen, bitte versuchen Sie es erneut',
                    'pt-BR': 'Falha ao publicar, tente novamente',
                    'ko-KR': '게시 실패, 다시 시도해주세요',
                }, locale));
            }
        } catch (error) {
            console.error('Publish draft error:', error);
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
            setPublishingDraft(false);
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
                    fetchDrafts(currentPage + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        if (lastDraftRef.current) {
            observerRef.current.observe(lastDraftRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, loading, currentPage, fetchDrafts]);

    // 初始加载
    useEffect(() => {
        fetchDrafts(1);
    }, [fetchDrafts]);    if (loading) {
        return <EnhancedLoading type="drafts" />;
    }    return (
        <ContentTransition isLoading={loading}>
            <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">
                        {lang({
                            'zh-CN': '我的草稿',
                            'en-US': 'My Drafts',
                            'zh-TW': '我的草稿',
                            'es-ES': 'Mis Borradores',
                            'fr-FR': 'Mes Brouillons',
                            'ru-RU': 'Мои Черновики',
                            'ja-JP': '私の下書き',
                            'de-DE': 'Meine Entwürfe',
                            'pt-BR': 'Meus Rascunhos',
                            'ko-KR': '내 초안',
                        }, locale)}
                    </h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDrafts(1)}
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

            {drafts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted-foreground mb-2">
                            {lang({
                                'zh-CN': '暂无草稿',
                                'en-US': 'No drafts yet',
                                'zh-TW': '暫無草稿',
                                'es-ES': 'Aún no hay borradores',
                                'fr-FR': 'Aucun brouillon pour l\'instant',
                                'ru-RU': 'Пока нет черновиков',
                                'ja-JP': 'まだ下書きがありません',
                                'de-DE': 'Noch keine Entwürfe',
                                'pt-BR': 'Ainda não há rascunhos',
                                'ko-KR': '아직 초안이 없습니다',
                            }, locale)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {lang({
                                'zh-CN': '开始创建您的第一篇草稿吧',
                                'en-US': 'Start creating your first draft',
                                'zh-TW': '開始創建您的第一篇草稿吧',
                                'es-ES': 'Comienza creando tu primer borrador',
                                'fr-FR': 'Commencez à créer votre premier brouillon',
                                'ru-RU': 'Начните создавать свой первый черновик',
                                'ja-JP': '最初の下書きを作成しましょう',
                                'de-DE': 'Beginnen Sie mit der Erstellung Ihres ersten Entwurfs',
                                'pt-BR': 'Comece criando seu primeiro rascunho',
                                'ko-KR': '첫 번째 초안을 만들어 보세요',
                            }, locale)}
                        </p>
                    </CardContent>
                </Card>
            ) : (                <div className="space-y-4">
                    {drafts.map((draft, index) => (
                        <ListItemTransition key={draft.id} index={index}>
                            <Card 
                                ref={index === drafts.length - 1 ? lastDraftRef : null}
                                className="hover:shadow-md transition-shadow"
                            >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg leading-tight break-words">
                                                {getLocalizedTitle(draft)}
                                            </h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {lang({
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

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {lang({
                                                        'zh-CN': '更新于',
                                                        'en-US': 'Updated',
                                                        'zh-TW': '更新於',
                                                        'es-ES': 'Actualizado',
                                                        'fr-FR': 'Mis à jour',
                                                        'ru-RU': 'Обновлено',
                                                        'ja-JP': '更新',
                                                        'de-DE': 'Aktualisiert',
                                                        'pt-BR': 'Atualizado',
                                                        'ko-KR': '업데이트됨',
                                                    }, locale)} {formatTime(draft.updatedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {draft.topics.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {draft.topics.map((topic) => (
                                                    <Badge key={topic.name} variant="outline" className="text-xs">
                                                        <span className="mr-1">{topic.emoji}</span>
                                                        {getLocalizedTopicName(topic)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditDraft(draft)}
                                            className="text-primary hover:text-primary"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setDraftToDelete(draft);
                                                setDeleteDialogOpen(true);
                                            }}
                                            disabled={deletingDrafts.has(draft.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            {deletingDrafts.has(draft.id) ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {draft.origin.substring(0, 200)}
                                    {draft.origin.length > 200 && '...'}
                                </p>                            </CardContent>
                        </Card>
                        </ListItemTransition>
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

                    {!hasMore && drafts.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {lang({
                                    'zh-CN': '没有更多草稿了',
                                    'en-US': 'No more drafts',
                                    'zh-TW': '沒有更多草稿了',
                                    'es-ES': 'No hay más borradores',
                                    'fr-FR': 'Aucun autre brouillon',
                                    'ru-RU': 'Больше черновиков нет',
                                    'ja-JP': 'これ以上下書きはありません',
                                    'de-DE': 'Keine weiteren Entwürfe',
                                    'pt-BR': 'Não há mais rascunhos',
                                    'ko-KR': '더 이상 초안이 없습니다',
                                }, locale)}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* 编辑 Sheet */}
            <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <SheetContent 
                    side="bottom" 
                    className="h-[85vh] p-0 border-t-0 shadow-2xl"
                >
                    {/* 拖拽手柄 */}
                    <div className='w-full h-6 flex items-center justify-center bg-background/80 backdrop-blur-sm relative group'>
                        <div className='w-12 h-1 bg-muted-foreground/20 group-hover:bg-[#f0b100]/50 rounded-full transition-colors duration-300' />
                    </div>

                    {/* 可滚动的主内容区域 */}
                    <div className='h-[calc(100%-24px)] overflow-y-auto'>
                        <div className='w-full max-w-7xl mx-auto flex flex-col px-4 md:px-6 pb-4 md:pb-6'>
                            <SheetHeader className='py-3 md:py-4 flex-shrink-0'>
                                <SheetTitle className='text-lg md:text-xl font-semibold text-center'>
                                    {lang({
                                        'zh-CN': '编辑草稿',
                                        'en-US': 'Edit Draft',
                                        'zh-TW': '編輯草稿',
                                        'es-ES': 'Editar Borrador',
                                        'fr-FR': 'Modifier le Brouillon',
                                        'ru-RU': 'Редактировать Черновик',
                                        'ja-JP': '下書きを編集',
                                        'de-DE': 'Entwurf Bearbeiten',
                                        'pt-BR': 'Editar Rascunho',
                                        'ko-KR': '초안 편집',
                                    }, locale)}
                                </SheetTitle>
                            </SheetHeader>

                            <div className='space-y-4 md:space-y-6'>
                                {/* 标题和主题行 */}
                                <div className='grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 lg:gap-6'>
                                    <div className='space-y-2 md:space-y-3'>
                                        <Label
                                            htmlFor='edit-title'
                                            className='text-sm font-medium flex items-center gap-2 h-5 md:h-6'
                                        >
                                            {lang({
                                                'zh-CN': '标题',
                                                'zh-TW': '標題',
                                                'en-US': 'Title',
                                                'es-ES': 'Título',
                                                'fr-FR': 'Titre',
                                                'ru-RU': 'Заголовок',
                                                'ja-JP': 'タイトル',
                                                'de-DE': 'Titel',
                                                'pt-BR': 'Título',
                                                'ko-KR': '제목',
                                            }, locale)}
                                            <Badge
                                                variant={
                                                    editTitle.length > 40
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                                className='text-xs'
                                            >
                                                {editTitle.length}/50
                                            </Badge>
                                        </Label>
                                        <Input
                                            id='edit-title'
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder={lang({
                                                'zh-CN': '输入一个吸引人的标题...',
                                                'zh-TW': '輸入一個吸引人的標題...',
                                                'en-US': 'Enter an engaging title...',
                                                'es-ES': 'Ingrese un título atractivo...',
                                                'fr-FR': 'Saisissez un titre engageant...',
                                                'ru-RU': 'Введите привлекательный заголовок...',
                                                'ja-JP': '魅力的なタイトルを入力...',
                                                'de-DE': 'Geben Sie einen ansprechenden Titel ein...',
                                                'pt-BR': 'Digite um título atraente...',
                                                'ko-KR': '매력적인 제목을 입력하세요...',
                                            }, locale)}
                                            maxLength={50}
                                            className='h-10 md:h-12 text-sm md:text-base border-2 focus:border-[#f0b100] transition-colors'
                                        />
                                    </div>

                                    <div className='space-y-2 md:space-y-3'>
                                        <Label className='text-sm font-medium h-5 md:h-6 flex items-center'>
                                            {lang({
                                                'zh-CN': '主题分类',
                                                'zh-TW': '主題分類',
                                                'en-US': 'Topic Category',
                                                'es-ES': 'Categoría del Tema',
                                                'fr-FR': 'Catégorie du Sujet',
                                                'ru-RU': 'Категория Темы',
                                                'ja-JP': 'トピックカテゴリ',
                                                'de-DE': 'Themenkategorie',
                                                'pt-BR': 'Categoria do Tópico',
                                                'ko-KR': '주제 카테고리',
                                            }, locale)}
                                        </Label>
                                        <div className='relative'>
                                            <Input
                                                readOnly
                                                value={selectedTopic}
                                                placeholder={lang({
                                                    'zh-CN': '选择一个主题...',
                                                    'zh-TW': '選擇一個主題...',
                                                    'en-US': 'Select a topic...',
                                                    'es-ES': 'Selecciona un tema...',
                                                    'fr-FR': 'Sélectionnez un sujet...',
                                                    'ru-RU': 'Выберите тему...',
                                                    'ja-JP': 'トピックを選択...',
                                                    'de-DE': 'Wählen Sie ein Thema...',
                                                    'pt-BR': 'Selecione um tópico...',
                                                    'ko-KR': '주제를 선택하세요...',
                                                }, locale)}
                                                className='h-10 md:h-12 text-sm md:text-base border-2 focus:border-[#f0b100] transition-colors cursor-pointer pr-10'
                                                onClick={() => setTopicDialogOpen(true)}
                                            />
                                            <RiArrowDownSLine className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
                                        </div>

                                        {/* 主题选择 Dialog */}
                                        <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                                            <DialogContent className='max-w-md max-h-[80vh] flex flex-col'>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {lang({
                                                            'zh-CN': '选择主题分类',
                                                            'zh-TW': '選擇主題分類',
                                                            'en-US': 'Select Topic Category',
                                                            'es-ES': 'Seleccionar Categoría del Tema',
                                                            'fr-FR': 'Sélectionner la Catégorie du Sujet',
                                                            'ru-RU': 'Выберите Категорию Темы',
                                                            'ja-JP': 'トピックカテゴリを選択',
                                                            'de-DE': 'Themenkategorie Auswählen',
                                                            'pt-BR': 'Selecionar Categoria do Tópico',
                                                            'ko-KR': '주제 카테고리 선택',
                                                        }, locale)}
                                                    </DialogTitle>
                                                </DialogHeader>

                                                {/* 搜索框 */}
                                                <div className='relative mb-4'>
                                                    <RiSearchLine className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                                    <Input
                                                        value={topicSearchQuery}
                                                        onChange={(e) => setTopicSearchQuery(e.target.value)}
                                                        placeholder={lang({
                                                            'zh-CN': '搜索主题...',
                                                            'zh-TW': '搜索主題...',
                                                            'en-US': 'Search topics...',
                                                            'es-ES': 'Buscar temas...',
                                                            'fr-FR': 'Rechercher des sujets...',
                                                            'ru-RU': 'Поиск тем...',
                                                            'ja-JP': 'トピックを検索...',
                                                            'de-DE': 'Themen suchen...',
                                                            'pt-BR': 'Buscar tópicos...',
                                                            'ko-KR': '주제 검색...',
                                                        }, locale)}
                                                        className='pl-10'
                                                    />
                                                </div>

                                                {/* 主题列表 */}
                                                <div className='flex-1 overflow-y-auto space-y-1 pr-2'>
                                                    {getFilteredTopics().length > 0 ? (
                                                        getFilteredTopics().map((topic) => (
                                                            <div
                                                                key={topic.name}
                                                                onClick={() => handleTopicSelect(topic.name, topic.display)}
                                                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                                                                    selectedTopicName === topic.name
                                                                        ? 'bg-[#f0b100]/10 border border-[#f0b100]'
                                                                        : 'border border-transparent'
                                                                }`}
                                                            >
                                                                <span className='text-sm'>{topic.display}</span>
                                                                {selectedTopicName === topic.name && (
                                                                    <RiCheckLine className='h-4 w-4 text-[#f0b100]' />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className='text-center py-8 text-muted-foreground'>
                                                            <div className='text-2xl mb-2'>🔍</div>
                                                            <p className='text-sm'>
                                                                {lang({
                                                                    'zh-CN': '未找到匹配的主题',
                                                                    'zh-TW': '未找到匹配的主題',
                                                                    'en-US': 'No matching topics found',
                                                                    'es-ES': 'No se encontraron temas coincidentes',
                                                                    'fr-FR': 'Aucun sujet correspondant trouvé',
                                                                    'ru-RU': 'Подходящие темы не найдены',
                                                                    'ja-JP': '一致するトピックが見つかりません',
                                                                    'de-DE': 'Keine passenden Themen gefunden',
                                                                    'pt-BR': 'Nenhum tópico correspondente encontrado',
                                                                    'ko-KR': '일치하는 주제를 찾을 수 없습니다',
                                                                }, locale)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 底部按钮 */}
                                                <div className='flex justify-end pt-4 border-t'>
                                                    <Button
                                                        variant='outline'
                                                        onClick={() => {
                                                            setTopicDialogOpen(false);
                                                            setTopicSearchQuery('');
                                                        }}
                                                    >
                                                        {lang({
                                                            'zh-CN': '取消',
                                                            'zh-TW': '取消',
                                                            'en-US': 'Cancel',
                                                            'es-ES': 'Cancelar',
                                                            'fr-FR': 'Annuler',
                                                            'ru-RU': 'Отмена',
                                                            'ja-JP': 'キャンセル',
                                                            'de-DE': 'Abbrechen',
                                                            'pt-BR': 'Cancelar',
                                                            'ko-KR': '취소',
                                                        }, locale)}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>

                                {/* 内容编辑器 */}
                                <div className='space-y-3 md:space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <Label className='text-sm font-medium flex items-center gap-2'>
                                            {lang({
                                                'zh-CN': '内容',
                                                'zh-TW': '內容',
                                                'en-US': 'Content',
                                                'es-ES': 'Contenido',
                                                'fr-FR': 'Contenu',
                                                'ru-RU': 'Содержание',
                                                'ja-JP': '内容',
                                                'de-DE': 'Inhalt',
                                                'pt-BR': 'Conteúdo',
                                                'ko-KR': '내용',
                                            }, locale)}
                                            <Badge
                                                variant={
                                                    editContent.length > 150 ? 'destructive' : 'secondary'
                                                }
                                                className='text-xs'
                                            >
                                                {editContent.length}/200
                                            </Badge>
                                        </Label>
                                    </div>

                                    {/* 使用新的 MarkdownEditor 组件 */}
                                    <MarkdownEditor
                                        value={editContent}
                                        onChange={setEditContent}
                                        locale={locale}
                                        maxLength={200}
                                    />
                                </div>

                                <Separator className='my-3 md:my-4' />

                                {/* 操作按钮 */}
                                <div className='flex justify-end items-center'>
                                    <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto'>
                                        <Button
                                            variant='outline'
                                            onClick={() => setEditDialogOpen(false)}
                                            className='px-4 md:px-6 border-2 h-10 md:h-auto text-sm md:text-base'
                                        >
                                            <X className='h-4 w-4 mr-2' />
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
                                            variant='outline'
                                            onClick={handleSaveDraft}
                                            disabled={savingDraft}
                                            className='px-4 md:px-6 border-2 hover:border-[#f0b100] hover:text-[#f0b100] h-10 md:h-auto text-sm md:text-base'
                                        >
                                            {savingDraft ? (
                                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                            ) : (
                                                <Save className='h-4 w-4 mr-2' />
                                            )}
                                            {lang({
                                                'zh-CN': '保存草稿',
                                                'en-US': 'Save Draft',
                                                'zh-TW': '保存草稿',
                                                'es-ES': 'Guardar Borrador',
                                                'fr-FR': 'Sauvegarder le Brouillon',
                                                'ru-RU': 'Сохранить Черновик',
                                                'ja-JP': '下書きを保存',
                                                'de-DE': 'Entwurf Speichern',
                                                'pt-BR': 'Salvar Rascunho',
                                                'ko-KR': '초안 저장',
                                            }, locale)}
                                        </Button>

                                        <Button
                                            onClick={handlePublishDraft}
                                            disabled={publishingDraft}
                                            style={{ backgroundColor: '#f0b100' }}
                                            className='px-6 md:px-8 text-white hover:opacity-90 transition-opacity shadow-lg h-10 md:h-auto text-sm md:text-base'
                                        >
                                            {publishingDraft ? (
                                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                            ) : (
                                                <Send className='h-4 w-4 mr-2' />
                                            )}
                                            {lang({
                                                'zh-CN': '发布',
                                                'en-US': 'Publish',
                                                'zh-TW': '發布',
                                                'es-ES': 'Publicar',
                                                'fr-FR': 'Publier',
                                                'ru-RU': 'Опубликовать',
                                                'ja-JP': '公開',
                                                'de-DE': 'Veröffentlichen',
                                                'pt-BR': 'Publicar',
                                                'ko-KR': '게시',
                                            }, locale)}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

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
                                'zh-CN': '您确定要删除这个草稿吗？此操作无法撤销。',
                                'en-US': 'Are you sure you want to delete this draft? This action cannot be undone.',
                                'zh-TW': '您確定要刪除這個草稿嗎？此操作無法撤銷。',
                                'es-ES': '¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer.',
                                'fr-FR': 'Êtes-vous sûr de vouloir supprimer ce brouillon ? Cette action ne peut pas être annulée.',
                                'ru-RU': 'Вы уверены, что хотите удалить этот черновик? Это действие нельзя отменить.',
                                'ja-JP': 'この下書きを削除してもよろしいですか？この操作は元に戻せません。',
                                'de-DE': 'Sind Sie sicher, dass Sie diesen Entwurf löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
                                'pt-BR': 'Tem certeza de que deseja excluir este rascunho? Esta ação não pode ser desfeita.',
                                'ko-KR': '이 초안을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                            }, locale)}
                        </DialogDescription>
                    </DialogHeader>
                    {draftToDelete && (
                        <div className="py-4">
                            <p className="font-medium">{getLocalizedTitle(draftToDelete)}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {draftToDelete.origin.substring(0, 100)}
                                {draftToDelete.origin.length > 100 && '...'}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setDraftToDelete(null);
                            }}
                        >
                            {lang({
                                'zh-CN': '取消',
                                'en-US': 'Cancel',
                                'zh-TW': '取消',
                                'es-ES': 'Cancelar',
                                'fr-FR': 'Annuler',
                                'ru-RU': 'Отмена',
                                'ja-JP': 'キャンセル',
                                'de-DE': 'Abbrechen',
                                'pt-BR': 'Cancelar',
                                'ko-KR': '취소',
                            }, locale)}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => draftToDelete && handleDeleteDraft(draftToDelete)}
                            disabled={deletingDrafts.has(draftToDelete?.id || 0)}
                        >
                            {deletingDrafts.has(draftToDelete?.id || 0) ? (
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
                    </DialogFooter>                </DialogContent>
            </Dialog>
            </div>
        </ContentTransition>
    );
}
