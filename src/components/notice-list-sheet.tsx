'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import token from '@/utils/userToken';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Bell, Mail, MailOpen, ExternalLink } from 'lucide-react';
import { useBroadcast } from '@/store/useBroadcast';
import { SheetLoading, SheetContentTransition, SheetListItemTransition } from '@/components/sheet-loading';
import lang from '@/lib/lang';

interface Notice {
    id: string;
    content: string;
    createdAt: string;
    link: string | null;
    isRead: boolean;
}

interface NoticeListSheetProps {
    children: React.ReactNode;
    onUnreadCountChange?: (count: number) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    externalUnreadCount?: number;
}

export default function NoticeListSheet({ 
    children, 
    onUnreadCountChange,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
    externalUnreadCount 
}: NoticeListSheetProps) {const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
    
    // 使用外部传入的open状态，如果没有则使用内部状态
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOnOpenChange || setInternalOpen;
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { registerCallback, unregisterCallback } = useBroadcast();

    useEffect(() => {
        const handleBroadcastMessage = (message: unknown) => {
            if (typeof message === 'object' && message !== null && 'action' in message) {
                const msg = message as { action: string; data?: { type: string } };
                if (msg.action === 'broadcast') {
                    const messageData = msg.data;
                    if (!messageData) return;
                    if (messageData.type === 'message') {
                        // 刷新消息列表
                        if (open) {
                            fetchNotices(1, false);
                        }
                    }
                }
            }
        };

        registerCallback(handleBroadcastMessage);
        return () => {
            unregisterCallback(handleBroadcastMessage);
        };
    }, [registerCallback, unregisterCallback, open]);

    const fetchNotices = async (pageNum: number = 1, append: boolean = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await fetch('/api/message/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({ page: pageNum }),
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '获取消息列表失败',
                            'en-US': 'Failed to fetch message list',
                            'de-DE': 'Fehler beim Abrufen der Nachrichtenliste',
                            'es-ES': 'Error al obtener la lista de mensajes',
                            'fr-FR': 'Échec de la récupération de la liste des messages',
                            'ja-JP': 'メッセージリストの取得に失敗しました',
                            'ko-KR': '메시지 목록을 가져오는 데 실패했습니다',
                            'pt-BR': 'Falha ao buscar lista de mensagens',
                            'ru-RU': 'Не удалось получить список сообщений',
                            'zh-TW': '獲取消息列表失敗',
                        }),
                );
                return;
            }
            if (append) {
                setNotices((prev) => [...prev, ...(data.messages || [])]);
            } else {
                setNotices(data.messages || []);
            }

            setHasMore(data.hasMore || false);            // 通知未读数量变化 - 直接使用服务器返回的未读数量
            if (onUnreadCountChange && data.unreadCount !== undefined) {
                onUnreadCountChange(data.unreadCount);
            }
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }; // 加载更多消息
    const loadMoreNotices = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;

        try {
            const response = await fetch('/api/message/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({ page: nextPage }),
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '获取消息列表失败',
                            'en-US': 'Failed to fetch message list',
                            'de-DE': 'Fehler beim Abrufen der Nachrichtenliste',
                            'es-ES': 'Error al obtener la lista de mensajes',
                            'fr-FR': 'Échec de la récupération de la liste des messages',
                            'ja-JP': 'メッセージリストの取得に失敗しました',
                            'ko-KR': '메시지 목록을 가져오는 데 실패했습니다',
                            'pt-BR': 'Falha ao buscar lista de mensagens',
                            'ru-RU': 'Не удалось получить список сообщений',
                            'zh-TW': '獲取消息列表失敗',
                        }),
                );
                return;
            }

            setNotices((prev) => [...prev, ...(data.messages || [])]);
            setHasMore(data.hasMore || false);
            setPage(nextPage);
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error fetching notices:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, page]); // 处理滚动事件
    useEffect(() => {
        if (!open) return;

        const scrollElement = scrollAreaRef.current;
        if (!scrollElement) return;

        const viewport =
            scrollElement.querySelector('[data-radix-scroll-area-viewport]') ||
            scrollElement.querySelector('.scroll-area-viewport') ||
            scrollElement.firstElementChild;

        if (!viewport) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = viewport as Element;

            if (scrollHeight <= clientHeight) return;

            const scrollProgress = (scrollTop + clientHeight) / scrollHeight;

            if (scrollProgress > 0.8 && hasMore && !loadingMore) {
                loadMoreNotices();
            }
        };

        viewport.addEventListener('scroll', handleScroll, { passive: true });

        const checkInitialLoad = () => {
            const { scrollHeight, clientHeight } = viewport as Element;
            if (scrollHeight <= clientHeight && hasMore && !loadingMore && notices.length > 0) {
                loadMoreNotices();
            }
        };

        const timer = setTimeout(checkInitialLoad, 100);

        return () => {
            viewport.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [open, hasMore, loadingMore, notices.length, loadMoreNotices]);

    const markAsRead = async (noticeId: string) => {
        setMarkingAsRead(noticeId);
        try {
            const response = await fetch('/api/message/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({ id: noticeId }),
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '标记为已读失败',
                            'en-US': 'Failed to mark as read',
                            'de-DE': 'Fehler beim Markieren als gelesen',
                            'es-ES': 'Error al marcar como leído',
                            'fr-FR': 'Échec du marquage comme lu',
                            'ja-JP': '既読にできませんでした',
                            'ko-KR': '읽음으로 표시하는 데 실패했습니다',
                            'pt-BR': 'Falha ao marcar como lido',
                            'ru-RU': 'Не удалось отметить как прочитанное',
                            'zh-TW': '標記為已讀失敗',
                        }),
                );
                return;
            } // 更新消息状态为已读
            setNotices((prevNotices) =>
                prevNotices.map((notice) =>
                    notice.id === noticeId ? { ...notice, isRead: true } : notice,
                ),
            );            // 通知未读数量变化 - 使用服务器API重新获取准确数量
            if (onUnreadCountChange) {
                // 使用API重新获取准确的未读数量
                try {
                    const countResponse = await fetch('/api/message/unread-count', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token.get()}`,
                        },
                    });
                    const countData = await countResponse.json();
                    if (countData.ok) {
                        onUnreadCountChange(countData.unreadCount || 0);
                    }
                } catch (error) {
                    console.error('Error fetching unread count:', error);
                }
            }

            toast.success(
                lang({
                    'zh-CN': '已标记为已读',
                    'en-US': 'Marked as read',
                    'de-DE': 'Als gelesen markiert',
                    'es-ES': 'Marcado como leído',
                    'fr-FR': 'Marqué comme lu',
                    'ja-JP': '既読にしました',
                    'ko-KR': '읽음으로 표시했습니다',
                    'pt-BR': 'Marcado como lido',
                    'ru-RU': 'Отмечено как прочитанное',
                    'zh-TW': '已標記為已讀',
                }),
            );
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error marking as read:', error);
        } finally {
            setMarkingAsRead(null);
        }
    };

    const markAllAsRead = async () => {
        setMarkingAllAsRead(true);
        try {
            const response = await fetch('/api/message/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
            });

            const data = await response.json();

            if (!data.ok) {
                toast.error(
                    data.message ||
                        lang({
                            'zh-CN': '全部标记为已读失败',
                            'en-US': 'Failed to mark all as read',
                            'de-DE': 'Fehler beim Markieren aller als gelesen',
                            'es-ES': 'Error al marcar todo como leído',
                            'fr-FR': 'Échec du marquage de tout comme lu',
                            'ja-JP': 'すべてを既読にできませんでした',
                            'ko-KR': '모두 읽음으로 표시하는 데 실패했습니다',
                            'pt-BR': 'Falha ao marcar tudo como lido',
                            'ru-RU': 'Не удалось отметить все как прочитанное',
                            'zh-TW': '全部標記為已讀失敗',
                        }),
                );
                return;
            }

            // 更新所有消息状态为已读
            setNotices((prevNotices) => prevNotices.map((notice) => ({ ...notice, isRead: true })));

            // 通知未读数量变化
            if (onUnreadCountChange) {
                onUnreadCountChange(0);
            }

            toast.success(
                lang({
                    'zh-CN': '所有消息已标记为已读',
                    'en-US': 'All messages marked as read',
                    'de-DE': 'Alle Nachrichten als gelesen markiert',
                    'es-ES': 'Todos los mensajes marcados como leídos',
                    'fr-FR': 'Tous les messages marqués comme lus',
                    'ja-JP': 'すべてのメッセージを既読にしました',
                    'ko-KR': '모든 메시지가 읽음으로 표시되었습니다',
                    'pt-BR': 'Todas as mensagens marcadas como lidas',
                    'ru-RU': 'Все сообщения отмечены как прочитанные',
                    'zh-TW': '所有消息已標記為已讀',
                }),
            );
        } catch (error) {
            toast.error(
                lang({
                    'zh-CN': '网络错误，请稍后重试',
                    'en-US': 'Network error, please try again later',
                    'de-DE': 'Netzwerkfehler, bitte versuchen Sie es später erneut',
                    'es-ES': 'Error de red, inténtelo más tarde',
                    'fr-FR': 'Erreur réseau, veuillez réessayer plus tard',
                    'ja-JP': 'ネットワークエラーです。後でもう一度お試しください',
                    'ko-KR': '네트워크 오류, 나중에 다시 시도해주세요',
                    'pt-BR': 'Erro de rede, tente novamente mais tarde',
                    'ru-RU': 'Ошибка сети, попробуйте позже',
                    'zh-TW': '網路錯誤，請稍後重試',
                }),
            );
            console.error('Error marking all as read:', error);
        } finally {
            setMarkingAllAsRead(false);
        }
    };
    const handleNoticeClick = (notice: Notice) => {
        // 如果未读，先标记为已读
        if (!notice.isRead) {
            markAsRead(notice.id);
        }

        // 如果有链接，跳转到对应页面
        if (notice.link) {
            const linkElement = document.createElement('a');
            linkElement.href = notice.link;
            document.body.appendChild(linkElement);
            linkElement.click();
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const locale = navigator.language.startsWith('zh') ? zhCN : enUS;
        return formatDistanceToNow(date, { addSuffix: true, locale });
    };    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);

        if (newOpen) {
            document.body.setAttribute('data-scroll-locked', 'true');
            setPage(1);
            setHasMore(true);
            fetchNotices(1, false);
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }
    };

    useEffect(() => {
        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, []);

    const unreadCount = externalUnreadCount !== undefined 
        ? externalUnreadCount 
        : notices.filter((notice) => !notice.isRead).length;

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
                <SheetHeader>
                    <SheetTitle className='flex items-center gap-2'>
                        <Bell className='h-5 w-5' />
                        {lang({
                            'zh-CN': '消息通知',
                            'en-US': 'Notifications',
                            'de-DE': 'Benachrichtigungen',
                            'es-ES': 'Notificaciones',
                            'fr-FR': 'Notifications',
                            'ja-JP': '通知',
                            'ko-KR': '알림',
                            'pt-BR': 'Notificações',
                            'ru-RU': 'Уведомления',
                            'zh-TW': '消息通知',
                        })}
                        {unreadCount > 0 && (
                            <Badge variant='destructive' className='ml-2'>
                                {unreadCount}
                            </Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        {lang({
                            'zh-CN': '查看您的所有消息通知和系统提醒',
                            'en-US': 'View all your message notifications and system alerts',
                            'de-DE': 'Alle Ihre Nachrichten und Systembenachrichtigungen anzeigen',
                            'es-ES':
                                'Ver todas sus notificaciones de mensajes y alertas del sistema',
                            'fr-FR': 'Voir toutes vos notifications de messages et alertes système',
                            'ja-JP': 'すべてのメッセージ通知とシステムアラートを表示',
                            'ko-KR': '모든 메시지 알림 및 시스템 경고 보기',
                            'pt-BR':
                                'Ver todas as suas notificações de mensagens e alertas do sistema',
                            'ru-RU':
                                'Просмотр всех уведомлений о сообщениях и системных оповещений',
                            'zh-TW': '查看您的所有消息通知和系統提醒',
                        })}
                    </SheetDescription>
                </SheetHeader>                <div className='mt-6'>
                    {loading ? (
                        <SheetLoading type="notifications" />
                    ) : (
                        <SheetContentTransition isLoading={loading}>
                            <ScrollArea ref={scrollAreaRef} className='h-[calc(100vh-200px)]'>
                            {notices.length === 0 ? (
                                <div className='text-center text-muted-foreground py-12'>
                                    <Bell className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                    <p>
                                        {lang({
                                            'zh-CN': '暂无消息',
                                            'en-US': 'No messages',
                                            'de-DE': 'Keine Nachrichten',
                                            'es-ES': 'Sin mensajes',
                                            'fr-FR': 'Aucun message',
                                            'ja-JP': 'メッセージなし',
                                            'ko-KR': '메시지 없음',
                                            'pt-BR': 'Nenhuma mensagem',
                                            'ru-RU': 'Нет сообщений',
                                            'zh-TW': '暫無消息',
                                        })}
                                    </p>
                                </div>
                            ) : (                                <div className='divide-y divide-border'>
                                    {notices.map((notice, index) => (
                                        <SheetListItemTransition key={notice.id} index={index}>
                                            <div
                                                className={`py-4 px-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                                                    !notice.isRead ? 'bg-muted/30' : ''
                                                }`}
                                                onClick={() => handleNoticeClick(notice)}>
                                            {/* 消息状态和时间行 */}
                                            <div className='flex items-center gap-3 mb-3'>
                                                {notice.isRead ? (
                                                    <MailOpen className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                                                ) : (
                                                    <Mail className='h-4 w-4 text-blue-500 flex-shrink-0' />
                                                )}
                                                <Badge
                                                    variant={
                                                        !notice.isRead ? 'default' : 'secondary'
                                                    }
                                                    className='text-xs'>
                                                    {!notice.isRead
                                                        ? lang({
                                                              'zh-CN': '未读',
                                                              'en-US': 'Unread',
                                                              'de-DE': 'Ungelesen',
                                                              'es-ES': 'No leído',
                                                              'fr-FR': 'Non lu',
                                                              'ja-JP': '未読',
                                                              'ko-KR': '읽지 않음',
                                                              'pt-BR': 'Não lido',
                                                              'ru-RU': 'Не прочитано',
                                                              'zh-TW': '未讀',
                                                          })
                                                        : lang({
                                                              'zh-CN': '已读',
                                                              'en-US': 'Read',
                                                              'de-DE': 'Gelesen',
                                                              'es-ES': 'Leído',
                                                              'fr-FR': 'Lu',
                                                              'ja-JP': '既読',
                                                              'ko-KR': '읽음',
                                                              'pt-BR': 'Lido',
                                                              'ru-RU': 'Прочитано',
                                                              'zh-TW': '已讀',
                                                          })}
                                                </Badge>
                                                <span className='text-xs text-muted-foreground'>
                                                    {formatTime(notice.createdAt)}
                                                </span>
                                                {notice.link && (
                                                    <ExternalLink className='h-3 w-3 text-muted-foreground ml-auto' />
                                                )}
                                            </div>

                                            {/* 消息内容 */}
                                            <div className='ml-7 mb-3 pr-2'>
                                                <p className='text-sm leading-relaxed line-clamp-3'>
                                                    {notice.content}
                                                </p>
                                            </div>

                                            {/* 操作按钮 */}
                                            {!notice.isRead && (
                                                <div className='ml-7 mr-2'>
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        className='h-6 px-2 text-xs'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notice.id);
                                                        }}
                                                        disabled={markingAsRead === notice.id}>
                                                        {markingAsRead === notice.id
                                                            ? lang({
                                                                  'zh-CN': '标记中...',
                                                                  'en-US': 'Marking...',
                                                                  'de-DE': 'Markieren...',
                                                                  'es-ES': 'Marcando...',
                                                                  'fr-FR': 'Marquage...',
                                                                  'ja-JP': 'マーク中...',
                                                                  'ko-KR': '표시 중...',
                                                                  'pt-BR': 'Marcando...',
                                                                  'ru-RU': 'Отметка...',
                                                                  'zh-TW': '標記中...',
                                                              })
                                                            : lang({
                                                                  'zh-CN': '标记为已读',
                                                                  'en-US': 'Mark as read',
                                                                  'de-DE': 'Als gelesen markieren',
                                                                  'es-ES': 'Marcar como leído',
                                                                  'fr-FR': 'Marquer comme lu',
                                                                  'ja-JP': '既読にする',
                                                                  'ko-KR': '읽음으로 표시',
                                                                  'pt-BR': 'Marcar como lido',
                                                                  'ru-RU':
                                                                      'Отметить как прочитанное',
                                                                  'zh-TW': '標記為已讀',
                                                              })}
                                                    </Button>
                                                </div>                                            )}
                                        </div>
                                        </SheetListItemTransition>
                                    ))}

                                    {/* 加载更多指示器 */}
                                    {loadingMore && (
                                        <div className='flex items-center justify-center py-4'>
                                            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                                            <span className='ml-2 text-sm text-muted-foreground'>
                                                {lang({
                                                    'zh-CN': '加载更多...',
                                                    'en-US': 'Loading more...',
                                                    'de-DE': 'Mehr laden...',
                                                    'es-ES': 'Cargando más...',
                                                    'fr-FR': 'Chargement...',
                                                    'ja-JP': 'さらに読み込み中...',
                                                    'ko-KR': '더 불러오는 중...',
                                                    'pt-BR': 'Carregando mais...',
                                                    'ru-RU': 'Загрузка...',
                                                    'zh-TW': '載入更多...',
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {/* 没有更多数据提示 */}
                                    {!hasMore && notices.length > 0 && (
                                        <div className='text-center py-4 text-sm text-muted-foreground'>
                                            {lang({
                                                'zh-CN': '没有更多消息了',
                                                'en-US': 'No more messages',
                                                'de-DE': 'Keine weiteren Nachrichten',
                                                'es-ES': 'No hay más mensajes',
                                                'fr-FR': 'Aucun autre message',
                                                'ja-JP': 'これ以上のメッセージはありません',
                                                'ko-KR': '더 이상 메시지가 없습니다',
                                                'pt-BR': 'Não há mais mensagens',
                                                'ru-RU': 'Больше сообщений нет',
                                                'zh-TW': '沒有更多消息了',
                                            })}
                                        </div>
                                    )}
                                </div>                            )}
                        </ScrollArea>
                        </SheetContentTransition>
                    )}
                </div>{' '}
                {/* 底部操作按钮 */}
                <div className='absolute bottom-6 right-6 flex gap-2'>
                    {unreadCount > 0 && (
                        <Button
                            variant='secondary'
                            size='sm'
                            onClick={markAllAsRead}
                            disabled={markingAllAsRead}>
                            {markingAllAsRead
                                ? lang({
                                      'zh-CN': '标记中...',
                                      'en-US': 'Marking...',
                                      'de-DE': 'Markieren...',
                                      'es-ES': 'Marcando...',
                                      'fr-FR': 'Marquage...',
                                      'ja-JP': 'マーク中...',
                                      'ko-KR': '표시 중...',
                                      'pt-BR': 'Marcando...',
                                      'ru-RU': 'Отметка...',
                                      'zh-TW': '標記中...',
                                  })
                                : lang({
                                      'zh-CN': '全部已读',
                                      'en-US': 'Mark all read',
                                      'de-DE': 'Alle gelesen',
                                      'es-ES': 'Todo leído',
                                      'fr-FR': 'Tout lu',
                                      'ja-JP': 'すべて既読',
                                      'ko-KR': '모두 읽음',
                                      'pt-BR': 'Tudo lido',
                                      'ru-RU': 'Все прочитано',
                                      'zh-TW': '全部已讀',
                                  })}
                        </Button>
                    )}
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                            setPage(1);
                            setHasMore(true);
                            fetchNotices(1, false);
                        }}
                        disabled={loading}>
                        {lang({
                            'zh-CN': '刷新',
                            'en-US': 'Refresh',
                            'de-DE': 'Aktualisieren',
                            'es-ES': 'Actualizar',
                            'fr-FR': 'Actualiser',
                            'ja-JP': '更新',
                            'ko-KR': '새로고침',
                            'pt-BR': 'Atualizar',
                            'ru-RU': 'Обновить',
                            'zh-TW': '刷新',
                        })}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
