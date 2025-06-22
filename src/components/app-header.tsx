'use client';

import TaskListSheet from '@/components/task-list-sheet';
import NoticeListSheet from '@/components/notice-list-sheet';
import MessageNotificationToast from '@/components/message-notification-toast';
import '@/styles/animations.css';
import {
    Settings,
    LogOut,
    Bell,
    FileText,
    List,
    Home,
    UserPlus,
    LogIn,
    Search,
    Edit,
    Award,
    Reply,
    SidebarIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchForm } from '@/components/search-form';
import { SearchSheet } from '@/components/search-sheet';
import '@/styles/animations.css';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import lang from '@/lib/lang';
import token from '@/utils/userToken';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBroadcast } from '@/store/useBroadcast';

export function SiteHeader({
    locale,
    onExposeSearchHandlers,
}: {
    locale?: string;
    onExposeSearchHandlers?: (handlers: {
        showSearchSheet: () => void;
        setSearchQuery: (query: string) => void;
    }) => void;
}) {
    const { toggleSidebar } = useSidebar();
    const isMobile = useIsMobile();
    const isLoggedIn = token.get();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showSearchSheet, setShowSearchSheet] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAvatarShaking, setIsAvatarShaking] = useState(false);
    const [noticeListOpen, setNoticeListOpen] = useState(false);
    const [taskListOpen, setTaskListOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { registerCallback, unregisterCallback } = useBroadcast();

    const userData = token.getObject() || {
        nickname: 'Guest',
        email: 'guest@xeoos.net',
        username: '@xeo',
        userExp: 0,
        uid: 0,
        avatar: {
            emoji: null,
            background: null,
        },
    };

    const expProgress = userData.userExp % 100;

    // 定期检查未读消息
    useEffect(() => {
        if (!isLoggedIn) {
            setUnreadCount(0);
            return;
        }

        const checkUnreadCount = async () => {
            try {
                const response = await fetch('/api/message/unread-count', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.get()}`,
                    },
                });

                const data = await response.json();
                if (data.ok) {
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (error) {
                console.error('Error checking unread count:', error);
            }
        };

        // 立即检查一次
        checkUnreadCount();

        // 每600秒检查一次
        const interval = setInterval(checkUnreadCount, 600000);

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    const handleLogout = () => {
        token.clear();
        window.location.reload();
    };

    const handleSearchClick = () => {
        setShowSearchSheet(true);
    };

    const handleSearchFocus = () => {
        setSearchFocused(true);
        setShowSearchSheet(true);
    };

    const handleSearchBlur = () => {
        // 延迟重置焦点状态，避免与sheet打开冲突
        setTimeout(() => {
            if (!showSearchSheet) {
                setSearchFocused(false);
            }
        }, 100);
    };

    const handleSheetOpenChange = (open: boolean) => {
        setShowSearchSheet(open);
        if (!open) {
            setSearchFocused(false);
            if (searchInputRef.current) {
                searchInputRef.current.blur();
            }
        }
    };

    // 使用data属性控制滚动锁定，而不是直接修改样式
    useEffect(() => {
        if (showSearchSheet) {
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }

        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, [showSearchSheet]);

    useEffect(() => {
        if (showLogoutDialog) {
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }

        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, [showLogoutDialog]);

    // 暴露搜索相关的处理函数给父组件
    useEffect(() => {
        if (onExposeSearchHandlers) {
            onExposeSearchHandlers({
                showSearchSheet: () => setShowSearchSheet(true),
                setSearchQuery: (query: string) => setSearchQuery(query),
            });
        }
    }, [onExposeSearchHandlers]);

    // 添加广播消息处理
    useEffect(() => {
        const handleBroadcastMessage = (message: unknown) => {
            if (typeof message === 'object' && message !== null && 'action' in message) {
                const msg = message as {
                    action: string;
                    query?: string;
                    data?: {
                        type: string;
                        message?: {
                            title: string;
                            content: string;
                            link: string;
                            locale: string;
                            type: string;
                        };
                    };
                };

                if (msg.action === 'SHOW_SEARCH') {
                    setShowSearchSheet(true);
                }
                if (msg.action === 'SET_SEARCH_QUERY' && msg.query) {
                    setSearchQuery(msg.query);
                    setShowSearchSheet(true);
                }
                if (msg.action === 'OPEN_NOTICE_LIST') {
                    setNoticeListOpen(true);
                }
                if (msg.action === 'OPEN_TASK_QUEUE') {
                    setTaskListOpen(true);
                }
                if (msg.action === 'REFRESH_UNREAD_COUNT') {
                    // 刷新未读消息计数
                    if (isLoggedIn) {
                        fetch('/api/message/unread-count', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token.get()}`,
                            },
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.ok) {
                                    setUnreadCount(data.unreadCount || 0);
                                }
                            })
                            .catch((error) => console.error('Error checking unread count:', error));
                    }
                }
                if (msg.action === 'broadcast') {
                    const messageData = msg.data;
                    if (!messageData) return;

                    if (messageData.type === 'task') {
                        // 任务状态更新已在TaskListSheet中处理
                        console.log('Task status updated:', messageData);
                    }
                    if (messageData.type === 'message') {
                        // 收到新消息时的处理
                        if (isLoggedIn) {
                            // 触发头像抖动
                            setIsAvatarShaking(true);
                            setTimeout(() => setIsAvatarShaking(false), 600);

                            // 延迟一下再刷新，确保数据库更新完成
                            setTimeout(() => {
                                fetch('/api/message/unread-count', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token.get()}`,
                                    },
                                })
                                    .then((response) => response.json())
                                    .then((data) => {
                                        if (data.ok) {
                                            setUnreadCount(data.unreadCount || 0);
                                        }
                                    })
                                    .catch((error) =>
                                        console.error('Error checking unread count:', error),
                                    );
                            }, 1000);
                        }
                    }
                    if (messageData.type === 'post') {
                    }
                }
            }
        };

        registerCallback(handleBroadcastMessage);
        return () => {
            unregisterCallback(handleBroadcastMessage);
        };
    }, [registerCallback, unregisterCallback, isLoggedIn]);

    return (
        <>
            {/* 消息通知组件 */}
            <MessageNotificationToast />

            <header className='bg-background border-b w-full fixed top-0 z-50'>
                <div className='flex h-14 w-full items-center gap-2 px-4 relative'>
                    <Button className='h-8 w-8' variant='ghost' size='icon' onClick={toggleSidebar}>
                        <SidebarIcon />
                    </Button>
                    <Separator orientation='vertical' className='mr-2 h-4' />
                    <Breadcrumb className='hidden sm:block'>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href={`/${locale || '/en-US'}`}
                                    className='font-bold text-primary hover:underline'>
                                    XEO OS
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {lang(
                                        {
                                            'en-US': 'Forum',
                                            'zh-CN': '论坛',
                                            'zh-TW': '論壇',
                                            'es-ES': 'Foro',
                                            'fr-FR': 'Forum',
                                            'ru-RU': 'Форум',
                                            'ja-JP': 'フォーラム',
                                            'de-DE': 'Forum',
                                            'pt-BR': 'Fórum',
                                            'ko-KR': '포럼',
                                        },
                                        locale,
                                    )}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    {isMobile ? (
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={handleSearchClick}
                            className='h-8 w-8 ml-2'>
                            <Search className='h-4 w-4' />
                        </Button>
                    ) : (
                        <div
                            className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-200 ${searchFocused ? 'z-[60]' : 'z-10'}`}>
                            <div onClick={handleSearchClick} className='cursor-pointer'>
                                <SearchForm
                                    // @ts-expect-error wtf
                                    ref={searchInputRef}
                                    locale={locale || 'en-US'}
                                    className='w-40 sm:w-64 transition-all duration-300 ease-in-out focus-within:w-56 focus-within:sm:w-96'
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery((event.target as HTMLInputElement).value)
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <div className='ml-auto flex items-center gap-2'>
                        {!isLoggedIn && (
                            <>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        window.location.href = '/signup';
                                    }}
                                    className='transition-transform transform hover:scale-105 active:scale-95'>
                                    <UserPlus className='h-4 w-4 mr-1' />
                                    {!isMobile &&
                                        lang(
                                            {
                                                'en-US': 'Sign Up',
                                                'zh-CN': '注册',
                                                'zh-TW': '註冊',
                                                'es-ES': 'Registrarse',
                                                'fr-FR': "S'inscrire",
                                                'ru-RU': 'Регистрация',
                                                'ja-JP': '登録',
                                                'de-DE': 'Registrieren',
                                                'pt-BR': 'Cadastrar',
                                                'ko-KR': '가입',
                                            },
                                            locale,
                                        )}
                                </Button>
                                <Button
                                    size='sm'
                                    onClick={() => {
                                        window.location.href = '/signin';
                                    }}
                                    className='transition-transform transform hover:scale-105 active:scale-95'>
                                    <LogIn className='h-4 w-4 mr-1' />
                                    {!isMobile &&
                                        lang(
                                            {
                                                'en-US': 'Login',
                                                'zh-CN': '登录',
                                                'zh-TW': '登入',
                                                'es-ES': 'Iniciar sesión',
                                                'fr-FR': 'Se connecter',
                                                'ru-RU': 'Войти',
                                                'ja-JP': 'ログイン',
                                                'de-DE': 'Anmelden',
                                                'pt-BR': 'Entrar',
                                                'ko-KR': '로그인',
                                            },
                                            locale,
                                        )}
                                </Button>
                            </>
                        )}

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <div className='relative'>
                                    <Avatar
                                        className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                            isAvatarShaking ? 'animate-shake-rotate' : ''
                                        }`}>
                                        {isLoggedIn ? (
                                            <AvatarImage
                                                src={`/api/dynamicImage/emoji?emoji=${encodeURIComponent(
                                                    userData.avatar?.emoji || '',
                                                )}&background=${encodeURIComponent(
                                                    userData.avatar?.background?.replaceAll(
                                                        '%',
                                                        '%25',
                                                    ) || '',
                                                )}`}
                                            />
                                        ) : (
                                            <AvatarImage src='/api/dynamicImage/emoji' />
                                        )}

                                        <AvatarFallback>
                                            {isLoggedIn
                                                ? userData.nickname
                                                    ? userData.nickname.charAt(0)
                                                    : 'U'
                                                : 'G'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* 未读消息红点 */}
                                    {isLoggedIn && unreadCount > 0 && (
                                        <div className='absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background flex items-center justify-center animate-pulse'>
                                            <span className='sr-only'>
                                                {unreadCount} unread messages
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-64' align='end' sideOffset={5}>
                                {isLoggedIn ? (
                                    <>
                                        <DropdownMenuLabel>
                                            <div className='flex flex-col space-y-1'>
                                                <p className='text-sm font-medium leading-none'>
                                                    {userData.nickname || 'Unknown User'}
                                                </p>
                                                <p className='text-xs leading-none text-muted-foreground'>
                                                    {userData.email || ''}
                                                </p>
                                                <p className='text-xs leading-none text-muted-foreground'>
                                                    @{userData.username || 'unknown'}
                                                </p>
                                                <div className='flex items-center gap-2 mt-2'>
                                                    <span className='text-xs'>
                                                        Lv.
                                                        {Math.floor((userData.userExp || 0) / 100)}
                                                    </span>
                                                    <Progress
                                                        value={expProgress}
                                                        className='flex-1 h-1'
                                                    />
                                                    <span className='text-xs'>
                                                        {userData.userExp || 0}/100
                                                    </span>
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <Link href={`/${locale || 'en-US'}/user/${userData.uid}`}>
                                            <DropdownMenuItem>
                                                <Home className='mr-2 h-4 w-4' />

                                                {lang(
                                                    {
                                                        'en-US': 'Profile',
                                                        'zh-CN': '个人主页',
                                                        'zh-TW': '個人主頁',
                                                        'es-ES': 'Perfil',
                                                        'fr-FR': 'Profil',
                                                        'ru-RU': 'Профиль',
                                                        'ja-JP': 'プロフィール',
                                                        'de-DE': 'Profil',
                                                        'pt-BR': 'Perfil',
                                                        'ko-KR': '프로필',
                                                    },
                                                    locale,
                                                )}
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href={`/${locale || 'en-US'}/user/post`}>
                                            <DropdownMenuItem>
                                                <FileText className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'en-US': 'My Posts',
                                                        'zh-CN': '我的贴子',
                                                        'zh-TW': '我的貼子',
                                                        'es-ES': 'Mis publicaciones',
                                                        'fr-FR': 'Mes publications',
                                                        'ru-RU': 'Мои сообщения',
                                                        'ja-JP': '投稿',
                                                        'de-DE': 'Meine Beiträge',
                                                        'pt-BR': 'Minhas postagens',
                                                        'ko-KR': '내 게시물',
                                                    },
                                                    locale,
                                                )}
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href={`/${locale || 'en-US'}/user/reply`}>
                                            <DropdownMenuItem>
                                                <Reply className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'zh-CN': '我的回复',
                                                        'zh-TW': '我的回覆',
                                                        'en-US': 'My Replies',
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
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href={`/${locale || 'en-US'}/user/level`}>
                                            <DropdownMenuItem>
                                                <Award className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'en-US': 'My Level',
                                                        'zh-CN': '我的等级',
                                                        'zh-TW': '我的等級',
                                                        'es-ES': 'Mi nivel',
                                                        'fr-FR': 'Mon niveau',
                                                        'ru-RU': 'Мой уровень',
                                                        'ja-JP': '私のレベル',
                                                        'de-DE': 'Mein Level',
                                                        'pt-BR': 'Meu nível',
                                                        'ko-KR': '내 레벨',
                                                    },
                                                    locale,
                                                )}
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href={`/${locale || 'en-US'}/user/draft`}>
                                            <DropdownMenuItem>
                                                <Edit className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'zh-CN': '草稿箱',
                                                        'zh-TW': '草稿箱',
                                                        'en-US': 'Drafts',
                                                        'es-ES': 'Borradores',
                                                        'fr-FR': 'Brouillons',
                                                        'ru-RU': 'Черновики',
                                                        'ja-JP': '下書き',
                                                        'de-DE': 'Entwürfe',
                                                        'pt-BR': 'Rascunhos',
                                                        'ko-KR': '임시 저장',
                                                    },
                                                    locale,
                                                )}
                                            </DropdownMenuItem>
                                        </Link>
                                        <NoticeListSheet
                                            open={noticeListOpen}
                                            onOpenChange={setNoticeListOpen}
                                            onUnreadCountChange={setUnreadCount}
                                            externalUnreadCount={unreadCount}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Bell className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'en-US': 'Notifications',
                                                        'zh-CN': '消息通知',
                                                        'zh-TW': '消息通知',
                                                        'es-ES': 'Notificaciones',
                                                        'fr-FR': 'Notifications',
                                                        'ru-RU': 'Уведомления',
                                                        'ja-JP': '通知',
                                                        'de-DE': 'Benachrichtigungen',
                                                        'pt-BR': 'Notificações',
                                                        'ko-KR': '알림',
                                                    },
                                                    locale,
                                                )}
                                                {unreadCount > 0 && (
                                                    <span className='ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] h-[18px] text-center flex items-center justify-center text-[10px] leading-none'>
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
                                            </DropdownMenuItem>
                                        </NoticeListSheet>
                                        <TaskListSheet
                                            open={taskListOpen}
                                            onOpenChange={setTaskListOpen}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <List className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'en-US': 'Task Queue',
                                                        'zh-CN': '任务队列',
                                                        'zh-TW': '任務隊列',
                                                        'es-ES': 'Cola de tareas',
                                                        'fr-FR': "File d'attente",
                                                        'ru-RU': 'Очередь задач',
                                                        'ja-JP': 'タスクキュー',
                                                        'de-DE': 'Aufgabenwarteschlange',
                                                        'pt-BR': 'Fila de tarefas',
                                                        'ko-KR': '작업 대기열',
                                                    },
                                                    locale,
                                                )}
                                            </DropdownMenuItem>
                                        </TaskListSheet>
                                        <DropdownMenuSeparator />
                                        <Link href={`/${locale || 'en-US'}/setting`}>
                                            <DropdownMenuItem>
                                                <Settings className='mr-2 h-4 w-4' />
                                                {lang(
                                                    {
                                                        'en-US': 'Settings',
                                                        'zh-CN': '设置',
                                                        'zh-TW': '設置',
                                                        'es-ES': 'Configuración',
                                                        'fr-FR': 'Paramètres',
                                                        'ru-RU': 'Настройки',
                                                        'ja-JP': '設定',
                                                        'de-DE': 'Einstellungen',
                                                        'pt-BR': 'Configurações',
                                                        'ko-KR': '설정',
                                                    },
                                                    locale,
                                                )}
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                                            <LogOut className='mr-2 h-4 w-4' />
                                            {lang(
                                                {
                                                    'en-US': 'Logout',
                                                    'zh-CN': '退出登录',
                                                    'zh-TW': '退出登入',
                                                    'es-ES': 'Cerrar sesión',
                                                    'fr-FR': 'Se déconnecter',
                                                    'ru-RU': 'Выйти',
                                                    'ja-JP': 'ログアウト',
                                                    'de-DE': 'Abmelden',
                                                    'pt-BR': 'Sair',
                                                    'ko-KR': '로그아웃',
                                                },
                                                locale,
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuLabel>
                                            <div className='flex flex-col space-y-1'>
                                                <p className='text-sm font-medium leading-none'>
                                                    {lang(
                                                        {
                                                            'en-US': 'Guest',
                                                            'zh-CN': '游客',
                                                            'zh-TW': '訪客',
                                                            'es-ES': 'Invitado',
                                                            'fr-FR': 'Invité',
                                                            'ru-RU': 'Гость',
                                                            'ja-JP': 'ゲスト',
                                                            'de-DE': 'Gast',
                                                            'pt-BR': 'Visitante',
                                                            'ko-KR': '게스트',
                                                        },
                                                        locale,
                                                    )}
                                                </p>
                                                <p className='text-xs leading-none text-muted-foreground'>
                                                    {lang(
                                                        {
                                                            'en-US':
                                                                'Please login to access more features',
                                                            'zh-CN': '请登录以访问更多功能',
                                                            'zh-TW': '請登入以訪問更多功能',
                                                            'es-ES':
                                                                'Inicia sesión para acceder a más funciones',
                                                            'fr-FR':
                                                                'Connectez-vous pour accéder à plus de fonctionnalités',
                                                            'ru-RU':
                                                                'Войдите для доступа к дополнительным функциям',
                                                            'ja-JP':
                                                                'より多くの機能にアクセスするにはログインしてください',
                                                            'de-DE':
                                                                'Melden Sie sich an, um auf weitere Funktionen zuzugreifen',
                                                            'pt-BR':
                                                                'Faça login para acessar mais recursos',
                                                            'ko-KR':
                                                                '더 많은 기능에 액세스하려면 로그인하세요',
                                                        },
                                                        locale,
                                                    )}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => {
                                                window.location.href = '/signin';
                                            }}>
                                            <LogIn className='mr-2 h-4 w-4' />
                                            {lang(
                                                {
                                                    'en-US': 'Login',
                                                    'zh-CN': '登录',
                                                    'zh-TW': '登入',
                                                    'es-ES': 'Iniciar sesión',
                                                    'fr-FR': 'Se connecter',
                                                    'ru-RU': 'Войти',
                                                    'ja-JP': 'ログイン',
                                                    'de-DE': 'Anmelden',
                                                    'pt-BR': 'Entrar',
                                                    'ko-KR': '로그인',
                                                },
                                                locale,
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                window.location.href = '/signup';
                                            }}>
                                            <UserPlus className='mr-2 h-4 w-4' />
                                            {lang(
                                                {
                                                    'en-US': 'Sign Up',
                                                    'zh-CN': '注册',
                                                    'zh-TW': '註冊',
                                                    'es-ES': 'Registrarse',
                                                    'fr-FR': "S'inscrire",
                                                    'ru-RU': 'Регистрация',
                                                    'ja-JP': '登録',
                                                    'de-DE': 'Registrieren',
                                                    'pt-BR': 'Cadastrar',
                                                    'ko-KR': '가입',
                                                },
                                                locale,
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* 搜索Sheet */}
            <SearchSheet
                open={showSearchSheet}
                onOpenChange={handleSheetOpenChange}
                locale={locale}
                initialQuery={searchQuery}
                onQueryChange={setSearchQuery}
            />

            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {lang(
                                {
                                    'en-US': 'Confirm Logout',
                                    'zh-CN': '确认退出登录',
                                    'zh-TW': '確認退出登入',
                                    'es-ES': 'Confirmar cierre de sesión',
                                    'fr-FR': 'Confirmer la déconnexion',
                                    'ru-RU': 'Подтвердить выход',
                                    'ja-JP': 'ログアウトの確認',
                                    'de-DE': 'Abmeldung bestätigen',
                                    'pt-BR': 'Confirmar logout',
                                    'ko-KR': '로그아웃 확인',
                                },
                                locale,
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {lang(
                                {
                                    'en-US':
                                        'Are you sure you want to logout? You will need to login again to access your account.',
                                    'zh-CN': '您确定要退出登录吗？您需要重新登录才能访问您的账户。',
                                    'zh-TW': '您確定要退出登入嗎？您需要重新登入才能訪問您的帳戶。',
                                    'es-ES':
                                        '¿Estás seguro de que quieres cerrar sesión? Necesitarás iniciar sesión nuevamente para acceder a tu cuenta.',
                                    'fr-FR':
                                        'Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.',
                                    'ru-RU':
                                        'Вы уверены, что хотите выйти? Вам нужно будет снова войти в систему для доступа к аккаунту.',
                                    'ja-JP':
                                        '本当にログアウトしますか？アカウントにアクセスするには再度ログインする必要があります。',
                                    'de-DE':
                                        'Sind Sie sicher, dass Sie sich abmelden möchten? Sie müssen sich erneut anmelden, um auf Ihr Konto zuzugreifen.',
                                    'pt-BR':
                                        'Tem certeza de que deseja sair? Você precisará fazer login novamente para acessar sua conta.',
                                    'ko-KR':
                                        '정말 로그아웃하시겠습니까? 계정에 다시 액세스하려면 다시 로그인해야 합니다.',
                                },
                                locale,
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setShowLogoutDialog(false)}>
                            {lang(
                                {
                                    'en-US': 'Cancel',
                                    'zh-CN': '取消',
                                    'zh-TW': '取消',
                                    'es-ES': 'Cancelar',
                                    'fr-FR': 'Annuler',
                                    'ru-RU': 'Отмена',
                                    'ja-JP': 'キャンセル',
                                    'de-DE': 'Abbrechen',
                                    'pt-BR': 'Cancelar',
                                    'ko-KR': '취소',
                                },
                                locale,
                            )}
                        </Button>
                        <Button onClick={handleLogout}>
                            {lang(
                                {
                                    'en-US': 'Logout',
                                    'zh-CN': '退出登录',
                                    'zh-TW': '退出登入',
                                    'es-ES': 'Cerrar sesión',
                                    'fr-FR': 'Se déconnecter',
                                    'ru-RU': 'Выйти',
                                    'ja-JP': 'ログアウト',
                                    'de-DE': 'Abmelden',
                                    'pt-BR': 'Sair',
                                    'ko-KR': '로그아웃',
                                },
                                locale,
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
