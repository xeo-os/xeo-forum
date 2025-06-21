'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import lang from '@/lib/lang';
import { useBroadcast } from '@/store/useBroadcast';
import token from '@/utils/userToken';

interface MessageNotification {
    id: string;
    title: string;
    content: string;
    link?: string;
    timestamp: number;
}

export default function MessageNotificationToast() {
    const [notifications, setNotifications] = useState<MessageNotification[]>([]);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const [dismissingStates, setDismissingStates] = useState<{ [key: string]: boolean }>({});
    const { registerCallback, unregisterCallback, broadcast } = useBroadcast();

    useEffect(() => {
        const handleBroadcastMessage = (message: unknown) => {
            if (typeof message === 'object' && message !== null && 'action' in message) {
                const msg = message as {
                    action: string;
                    data?: {
                        type: string;
                        message?: {
                            title: string;
                            content: string;
                            link: string;
                            locale: string;
                            type: string;
                            id: string;
                        };
                    };
                };

                if (
                    msg.action === 'broadcast' &&
                    msg.data?.type === 'message' &&
                    msg.data.message
                ) {
                    const messageData = msg.data.message;
                    const newNotification: MessageNotification = {
                        id: messageData.id,
                        title: messageData.title,
                        content: messageData.content,
                        link: messageData.link,
                        timestamp: Date.now(),
                    };

                    setNotifications((prev) => [newNotification, ...prev.slice(0, 2)]); // 最多显示6个通知
                }
            }
        };

        registerCallback(handleBroadcastMessage);
        return () => {
            unregisterCallback(handleBroadcastMessage);
        };
    }, [registerCallback, unregisterCallback]);    const handleNotificationClick = async (notification: MessageNotification) => {
        // 设置加载状态
        setLoadingStates((prev) => ({ ...prev, [notification.id]: true }));

        try {
            // 先标记当前消息为已读
            const response = await fetch('/api/message/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.get()}`,
                },
                body: JSON.stringify({
                    id: notification.id,
                }),
            });

            if (response.ok) {
                // 通知其他组件刷新未读计数
                broadcast({
                    action: 'REFRESH_UNREAD_COUNT',
                });
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        } finally {
            // 清除加载状态
            setLoadingStates((prev) => ({ ...prev, [notification.id]: false }));
        }

        // 设置消失动画状态
        setDismissingStates((prev) => ({ ...prev, [notification.id]: true }));

        // 延迟移除通知，等待动画完成
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
            setDismissingStates((prev) => ({ ...prev, [notification.id]: false }));
        }, 300);

        // 如果有链接，跳转到相应页面
        if (notification.link) {
            const linkElement = document.createElement('a');
            linkElement.href = notification.link;
            document.body.appendChild(linkElement);
            linkElement.click();
        }
    };

    const handleDismiss = (notificationId: string) => {
        // 设置消失动画状态
        setDismissingStates((prev) => ({ ...prev, [notificationId]: true }));

        // 延迟移除通知，等待动画完成
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            setDismissingStates((prev) => ({ ...prev, [notificationId]: false }));
        }, 300);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (notifications.length === 0) {
        return null;
    }
    return (
        // 移动端左右各留4单位边距，占满屏幕；桌面端保持原有右侧定位和固定宽度
        <div className='fixed top-16 left-4 right-4 md:right-4 md:left-auto z-[40] space-y-3 w-auto md:w-[480px]'>
            {notifications.map((notification, index) => (                <Card
                    key={notification.id}
                    className={`
                        border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-all duration-300
                        ${index === 0 ? 'animate-in slide-in-from-right-5 duration-400' : ''}
                        ${index > 0 ? 'transform translate-y-2' : ''}
                        ${dismissingStates[notification.id] ? 'animate-out slide-out-to-right-5 fade-out duration-300' : ''}
                    `}
                    style={{
                        zIndex: 40 - index,
                        position: 'absolute',
                        width: '100%',
                        top: index === 0 ? 0 : index === 1 ? 20 : 50,
                        transform:
                            index > 0
                                ? `translateY(8px) scale(${(100 - 5 * index) / 100})`
                                : undefined,
                    }}
                    onMouseEnter={() => {
                        const cards = document.querySelectorAll('[data-notification-card]');
                        cards.forEach((card, cardIndex) => {
                            (card as HTMLElement).style.transform =
                                `translateY(${cardIndex * 100}px) scale(1)`;
                        });
                    }}
                    onMouseLeave={() => {
                        const cards = document.querySelectorAll('[data-notification-card]');
                        cards.forEach((card, cardIndex) => {
                            if (cardIndex > 0) {
                                (card as HTMLElement).style.transform =
                                    `translateY(8px) scale(${(100 - 5 * cardIndex) / 100})`;
                            } else {
                                (card as HTMLElement).style.transform = '';
                            }
                        });
                    }}
                    data-notification-card>
                    <CardContent className='p-3'>
                        {/* 头部信息 */}
                        <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center justify-center w-6 h-6 bg-primary-foreground rounded-full'>
                                    <Bell className='w-3 h-3 text-primary' />
                                </div>
                                <Badge variant='secondary' className='text-xs'>
                                    {lang({
                                        'zh-CN': '新消息',
                                        'en-US': 'New Message',
                                        'de-DE': 'Neue Nachricht',
                                        'es-ES': 'Nuevo Mensaje',
                                        'fr-FR': 'Nouveau Message',
                                        'ru-RU': 'Новое сообщение',
                                        'ja-JP': '新しいメッセージ',
                                        'pt-BR': 'Nova Mensagem',
                                        'ko-KR': '새 메시지',
                                        'zh-TW': '新消息',
                                    })}
                                </Badge>
                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                    <Clock className='w-3 h-3' />
                                    {formatTime(notification.timestamp)}
                                </div>
                            </div>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='w-5 h-5 hover:bg-destructive/10 hover:text-destructive'
                                onClick={() => handleDismiss(notification.id)}>
                                <X className='w-3 h-3' />
                            </Button>
                        </div>

                        <Separator className='mb-2' />

                        {/* 消息内容 */}
                        <div className='flex items-center justify-between'>
                            <div className='flex-1 min-w-0 mr-3'>
                                <h4 className='font-medium text-sm mb-1 line-clamp-1'>
                                    {notification.title}
                                </h4>
                                <p className='text-xs text-muted-foreground line-clamp-1'>
                                    {notification.content}
                                </p>
                            </div>

                            {/* 操作按钮 */}
                            <Button
                                size='sm'
                                onClick={() => handleNotificationClick(notification)}
                                disabled={loadingStates[notification.id]}
                                className={`${loadingStates[notification.id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loadingStates[notification.id] ? (
                                    <>
                                        <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                                        {lang({
                                            'zh-CN': '加载中...',
                                            'en-US': 'Loading...',
                                            'de-DE': 'Laden...',
                                            'es-ES': 'Cargando...',
                                            'fr-FR': 'Chargement...',
                                            'ru-RU': 'Загрузка...',
                                            'ja-JP': '読み込み中...',
                                            'pt-BR': 'Carregando...',
                                            'ko-KR': '로딩 중...',
                                            'zh-TW': '載入中...',
                                        })}
                                    </>
                                ) : (
                                    lang({
                                        'zh-CN': '查看',
                                        'en-US': 'View',
                                        'de-DE': 'Anzeigen',
                                        'es-ES': 'Ver',
                                        'fr-FR': 'Voir',
                                        'ru-RU': 'Просмотр',
                                        'ja-JP': '表示',
                                        'pt-BR': 'Ver',
                                        'ko-KR': '보기',
                                        'zh-TW': '查看',
                                    })
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
