'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    RiAddLine,
    RiSendPlaneLine,
    RiDraftLine,
    RiArrowDownSLine,
    RiCheckLine,
    RiEditLine,
    RiSearchLine,
} from '@remixicon/react';
import { motion, useDragControls } from 'motion/react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { MarkdownEditor } from '@/components/markdown-editor';
import { EmojiPicker } from '@/components/emoji-picker';
import { markdownToHtml } from '@/lib/markdown-utils';
import token from '@/utils/userToken';
import { useBroadcast } from '@/store/useBroadcast';

interface NewPostButtonProps {
    locale: string;
    topics: Array<{
        title: string;
        items?: Array<{
            icon: string;
            title: string;
            name: string;
        }>;
    }>;
    onExposeHandlers?: (handlers: { showNewPostSheet: () => void }) => void;
}

interface PostDraft {
    title: string;
    content: string;
    topic: string;
    topicName: string; // 添加topicName字段
}

export function NewPostButton({ locale, topics, onExposeHandlers }: NewPostButtonProps) {
    const [open, setOpen] = useState(false);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState(''); // 添加选中主题的name
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('edit');
    const [sheetHeight, setSheetHeight] = useState(85);
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);
    const [topicSearchQuery, setTopicSearchQuery] = useState('');
    const [hasDraft, setHasDraft] = useState(false);
    const [hasShownDraftToast, setHasShownDraftToast] = useState(false);

    const dragControls = useDragControls();
    const sheetRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { registerCallback, unregisterCallback } = useBroadcast();

    const STORAGE_KEY = 'xeo-forum-draft';

    // 检查是否有草稿内容
    const checkHasDraft = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const draft: PostDraft = JSON.parse(stored);
                const hasContent = draft.title?.trim() || draft.content?.trim() || draft.topic;
                setHasDraft(!!hasContent);
                return !!hasContent;
            }
            setHasDraft(false);
            return false;
        } catch (error) {
            console.error('Failed to check draft:', error);
            setHasDraft(false);
            return false;
        }
    }, []);

    // 从localStorage加载草稿
    const loadDraft = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const draft: PostDraft = JSON.parse(stored);
                setTitle(draft.title || '');
                setContent(draft.content || '');
                setSelectedTopic(draft.topic || '');
                setSelectedTopicName(draft.topicName || '');
                // 确保hasDraft状态也被正确设置
                const hasContent = draft.title?.trim() || draft.content?.trim() || draft.topic;
                setHasDraft(!!hasContent);
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
    }, []);

    // 保存草稿到localStorage
    const saveDraft = useCallback(() => {
        try {
            if (title.trim() || content.trim()) {
                const draft: PostDraft = {
                    title: title.trim(),
                    content: content.trim(),
                    topic: selectedTopic,
                    topicName: selectedTopicName,
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
                setHasDraft(true);
            } else {
                localStorage.removeItem(STORAGE_KEY);
                setHasDraft(false);
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    }, [title, content, selectedTopic, selectedTopicName]);

    // 清除草稿
    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setTitle('');
        setContent('');
        setSelectedTopic('');
        setSelectedTopicName('');
        setHasDraft(false);
        setHasShownDraftToast(false);
    }, []);

    // 处理Sheet关闭
    const handleSheetOpenChange = (isOpen: boolean) => {
        // 管理滚动锁定状态
        if (isOpen) {
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            document.body.removeAttribute('data-scroll-locked');
            if (title.trim() || content.trim()) {
                // 关闭时有内容，保存草稿并提示
                saveDraft();
                toast.success(
                    lang(
                        {
                            'zh-CN': '已将您的草稿保存在本地',
                            'zh-TW': '已將您的草稿保存在本地',
                            'en-US': 'Your draft has been saved locally',
                            'es-ES': 'Su borrador ha sido guardado localmente',
                            'fr-FR': 'Votre brouillon a été sauvegardé localement',
                            'ru-RU': 'Ваш черновик был сохранен локально',
                            'ja-JP': '下書きがローカルに保存されました',
                            'de-DE': 'Ihr Entwurf wurde lokal gespeichert',
                            'pt-BR': 'Seu rascunho foi salvo localmente',
                            'ko-KR': '초안이 로컬에 저장되었습니다',
                        },
                        locale,
                    ),
                );
            }
        }
        setOpen(isOpen);
    };

    // 打开Sheet并加载草稿
    const openSheetWithDraft = () => {
        document.body.setAttribute('data-scroll-locked', 'true');
        loadDraft();
        setOpen(true);
    };

    // 组件初始化时加载草稿和检查提示状态
    useEffect(() => {
        // 先加载草稿
        loadDraft();

        // 检查是否有草稿且当前会话是否已显示过提示
        const hasExistingDraft = checkHasDraft();

        if (hasExistingDraft && !hasShownDraftToast) {
            // 显示草稿提醒toast
            toast(
                lang(
                    {
                        'zh-CN': '本地有尚未编辑完成的草稿',
                        'zh-TW': '本地有尚未編輯完成的草稿',
                        'en-US': 'You have an unfinished draft locally',
                        'es-ES': 'Tienes un borrador sin terminar localmente',
                        'fr-FR': 'Vous avez un brouillon inachevé localement',
                        'ru-RU': 'У вас есть незавершенный черновик локально',
                        'ja-JP': 'ローカルに未完成の下書きがあります',
                        'de-DE': 'Sie haben einen unvollendeten Entwurf lokal',
                        'pt-BR': 'Você tem um rascunho inacabado localmente',
                        'ko-KR': '로컬에 완성되지 않은 초안이 있습니다',
                    },
                    locale,
                ),
                {
                    action: {
                        label: lang(
                            {
                                'zh-CN': '打开',
                                'zh-TW': '打開',
                                'en-US': 'Open',
                                'es-ES': 'Abrir',
                                'fr-FR': 'Ouvrir',
                                'ru-RU': 'Открыть',
                                'ja-JP': '開く',
                                'de-DE': 'Öffnen',
                                'pt-BR': 'Abrir',
                                'ko-KR': '열기',
                            },
                            locale,
                        ),
                        onClick: openSheetWithDraft,
                    },
                    duration: 5000,
                },
            );

            // 标记当前会话已显示过提示
            setHasShownDraftToast(true);
        }
    }, []);

    // 自动保存草稿
    useEffect(() => {
        const timer = setTimeout(() => {
            saveDraft();
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content, selectedTopic, selectedTopicName, saveDraft]);

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

    // 验证表单
    const validateForm = () => {
        if (!title.trim()) {
            toast.error(
                lang(
                    {
                        'zh-CN': '请输入标题',
                        'zh-TW': '請輸入標題',
                        'en-US': 'Please enter a title',
                        'es-ES': 'Por favor ingrese un título',
                        'fr-FR': 'Veuillez saisir un titre',
                        'ru-RU': 'Пожалуйста, введите заголовок',
                        'ja-JP': 'タイトルを入力してください',
                        'de-DE': 'Bitte geben Sie einen Titel ein',
                        'pt-BR': 'Por favor, insira um título',
                        'ko-KR': '제목을 입력해주세요',
                    },
                    locale,
                ),
            );
            return false;
        }

        if (title.length > 50) {
            toast.error(
                lang(
                    {
                        'zh-CN': '标题不能超过50个字符',
                        'zh-TW': '標題不能超過50個字符',
                        'en-US': 'Title cannot exceed 50 characters',
                        'es-ES': 'El título no puede exceder 50 caracteres',
                        'fr-FR': 'Le titre ne peut pas dépasser 50 caractères',
                        'ru-RU': 'Заголовок не может превышать 50 символов',
                        'ja-JP': 'タイトルは50文字を超えることはできません',
                        'de-DE': 'Der Titel darf 50 Zeichen nicht überschreiten',
                        'pt-BR': 'O título não pode exceder 50 caracteres',
                        'ko-KR': '제목은 50자를 초과할 수 없습니다',
                    },
                    locale,
                ),
            );
            return false;
        }

        if (!content.trim()) {
            toast.error(
                lang(
                    {
                        'zh-CN': '请输入内容',
                        'zh-TW': '請輸入內容',
                        'en-US': 'Please enter content',
                        'es-ES': 'Por favor ingrese contenido',
                        'fr-FR': 'Veuillez saisir le contenu',
                        'ru-RU': 'Пожалуйста, введите содержание',
                        'ja-JP': '内容を入力してください',
                        'de-DE': 'Bitte geben Sie Inhalt ein',
                        'pt-BR': 'Por favor, insira o conteúdo',
                        'ko-KR': '내용을 입력해주세요',
                    },
                    locale,
                ),
            );
            return false;
        }

        if (content.length > 200) {
            toast.error(
                lang(
                    {
                        'zh-CN': '内容不能超过200个字符',
                        'zh-TW': '內容不能超過200個字符',
                        'en-US': 'Content cannot exceed 200 characters',
                        'es-ES': 'El contenido no puede exceder 200 caracteres',
                        'fr-FR': 'Le contenu ne peut pas dépasser 200 caractères',
                        'ru-RU': 'Содержание не может превышать 200 символов',
                        'ja-JP': '内容は200文字を超えることはできません',
                        'de-DE': 'Der Inhalt darf 200 Zeichen nicht überschreiten',
                        'pt-BR': 'O conteúdo não pode exceder 200 caracteres',
                        'ko-KR': '내용은 200자를 초과할 수 없습니다',
                    },
                    locale,
                ),
            );
            return false;
        }

        if (!selectedTopicName) {
            toast.error(
                lang(
                    {
                        'zh-CN': '请选择主题',
                        'zh-TW': '請選擇主題',
                        'en-US': 'Please select a topic',
                        'es-ES': 'Por favor seleccione un tema',
                        'fr-FR': 'Veuillez sélectionner un sujet',
                        'ru-RU': 'Пожалуйста, выберите тему',
                        'ja-JP': 'トピックを選択してください',
                        'de-DE': 'Bitte wählen Sie ein Thema',
                        'pt-BR': 'Por favor, selecione um tópico',
                        'ko-KR': '주제를 선택해주세요',
                    },
                    locale,
                ),
            );
            return false;
        }

        return true;
    };

    // 提交帖子
    const submitPost = async (isDraft: boolean) => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/post/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.get(),
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    topic: selectedTopicName,
                    draft: isDraft,
                    lang: locale,
                }),
            });

            const result = await response.json();

            if (result.ok) {
                toast.success(
                    lang(
                        {
                            'zh-CN': isDraft ? '草稿已保存' : '帖子发布成功',
                            'zh-TW': isDraft ? '草稿已保存' : '帖子發布成功',
                            'en-US': isDraft ? 'Draft saved' : 'Post published successfully',
                            'es-ES': isDraft ? 'Borrador guardado' : 'Publicación exitosa',
                            'fr-FR': isDraft ? 'Brouillon sauvegardé' : 'Publication réussie',
                            'ru-RU': isDraft ? 'Черновик сохранен' : 'Пост успешно опубликован',
                            'ja-JP': isDraft
                                ? '下書きが保存されました'
                                : '投稿が正常に公開されました',
                            'de-DE': isDraft
                                ? 'Entwurf gespeichert'
                                : 'Beitrag erfolgreich veröffentlicht',
                            'pt-BR': isDraft ? 'Rascunho salvo' : 'Post publicado com sucesso',
                            'ko-KR': isDraft
                                ? '초안이 저장되었습니다'
                                : '게시물이 성공적으로 게시되었습니다',
                        },
                        locale,
                    ),
                );

                clearDraft();
                setOpen(false);
            } else {
                throw new Error('Failed to submit post');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '提交失败，请重试',
                        'zh-TW': '提交失敗，請重試',
                        'en-US': 'Submit failed, please try again',
                        'es-ES': 'Error al enviar, por favor intente de nuevo',
                        'fr-FR': 'Échec de la soumission, veuillez réessayer',
                        'ru-RU': 'Ошибка отправки, попробуйте еще раз',
                        'ja-JP': '送信に失敗しました。もう一度お試しください',
                        'de-DE': 'Senden fehlgeschlagen, bitte versuchen Sie es erneut',
                        'pt-BR': 'Falha no envio, tente novamente',
                        'ko-KR': '제출 실패, 다시 시도해주세요',
                    },
                    locale,
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // 插入表情符号
    const insertEmoji = (emoji: string) => {
        setContent((prev) => prev + emoji);
    };

    // 处理拖拽调整高度
    const handleDrag = useCallback((_: unknown, info: { point: { y: number } }) => {
        if (sheetRef.current) {
            const windowHeight = window.innerHeight;
            const currentY = info.point.y;
            const newHeight = Math.min(
                85,
                Math.max(30, ((windowHeight - currentY) / windowHeight) * 100),
            );
            setSheetHeight(newHeight);
        }
    }, []);

    // 处理按钮点击
    const handleButtonClick = () => {
        if (!token.get()) {
            // 未登录，显示登录提示
            setLoginPromptOpen(true);
            return;
        }

        // 已登录，正常打开编辑器
        if (!open) {
            document.body.setAttribute('data-scroll-locked', 'true');
            loadDraft();
        }
        setOpen(true);
    };

    // 暴露新建帖子相关的处理函数给父组件
    useEffect(() => {
        if (onExposeHandlers) {
            onExposeHandlers({
                showNewPostSheet: () => {
                    if (!token.get()) {
                        setLoginPromptOpen(true);
                    } else {
                        if (!open) {
                            document.body.setAttribute('data-scroll-locked', 'true');
                            loadDraft();
                        }
                        setOpen(true);
                    }
                },
            });
        }
    }, [onExposeHandlers, open, loadDraft]);

    // 添加广播消息处理
    useEffect(() => {
        const handleBroadcastMessage = (message: unknown) => {
            if (typeof message === 'object' && message !== null && 'action' in message) {
                const typedMessage = message as { action: string };
                if (typedMessage.action === 'SHOW_NEW_POST') {
                    if (!token.get()) {
                        setLoginPromptOpen(true);
                    } else {
                        if (!open) {
                            document.body.setAttribute('data-scroll-locked', 'true');
                            loadDraft();
                        }
                        setOpen(true);
                    }
                }
            }
        };

        registerCallback(handleBroadcastMessage);
        return () => {
            unregisterCallback(handleBroadcastMessage);
        };
    }, [registerCallback, unregisterCallback, open, loadDraft]);

    // 组件卸载时清理滚动锁定状态
    useEffect(() => {
        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, []);

    return (
        <>
            {/* 浮动按钮 */}
            <motion.div
                className='fixed bottom-6 right-6 z-40'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    size='lg'
                    style={{ backgroundColor: '#f0b100' }}
                    className='h-14 w-14 rounded-full shadow-xl hover:shadow-2xl border-0 text-white hover:opacity-90 transition-all duration-200'
                    onClick={handleButtonClick}
                >
                    {hasDraft ? (
                        <RiEditLine className='h-6 w-6' />
                    ) : (
                        <RiAddLine className='h-6 w-6' />
                    )}
                </Button>

                {/* 登录提示 Sheet */}
                <Sheet open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
                    <SheetContent side='bottom' className='h-[40vh] p-0 border-t-0 shadow-2xl'>
                        <div className='h-full flex flex-col justify-center items-center px-6 text-center space-y-6'>
                            <div className='space-y-3'>
                                <div className='text-4xl'>👋</div>
                                <h2 className='text-xl font-semibold'>
                                    {lang(
                                        {
                                            'zh-CN': '欢迎来到社区！',
                                            'zh-TW': '歡迎來到社區！',
                                            'en-US': 'Welcome to the Community!',
                                            'es-ES': '¡Bienvenido a la Comunidad!',
                                            'fr-FR': 'Bienvenue dans la Communauté !',
                                            'ru-RU': 'Добро пожаловать в сообщество!',
                                            'ja-JP': 'コミュニティへようこそ！',
                                            'de-DE': 'Willkommen in der Community!',
                                            'pt-BR': 'Bem-vindo à Comunidade!',
                                            'ko-KR': '커뮤니티에 오신 것을 환영합니다!',
                                        },
                                        locale,
                                    )}
                                </h2>
                                <p className='text-muted-foreground'>
                                    {lang(
                                        {
                                            'zh-CN': '请先登录或注册账号，然后就可以发布帖子啦！',
                                            'zh-TW': '請先登錄或註冊賬號，然後就可以發布帖子啦！',
                                            'en-US':
                                                'Please sign in or create an account to start posting!',
                                            'es-ES':
                                                '¡Por favor inicia sesión o crea una cuenta para comenzar a publicar!',
                                            'fr-FR':
                                                'Veuillez vous connecter ou créer un compte pour commencer à publier !',
                                            'ru-RU':
                                                'Пожалуйста, войдите или создайте учетную запись, чтобы начать публиковать!',
                                            'ja-JP':
                                                '投稿を開始するには、サインインまたはアカウントを作成してください！',
                                            'de-DE':
                                                'Bitte melden Sie sich an oder erstellen Sie ein Konto, um mit dem Posten zu beginnen!',
                                            'pt-BR':
                                                'Por favor, faça login ou crie uma conta para começar a postar!',
                                            'ko-KR':
                                                '게시물을 작성하려면 로그인하거나 계정을 만드세요!',
                                        },
                                        locale,
                                    )}
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-3 w-full max-w-sm'>
                                <Button
                                    asChild
                                    className='flex-1'
                                    style={{ backgroundColor: '#f0b100' }}
                                >
                                    <Link href={`/signin?url=${encodeURIComponent(pathname)}`}>
                                        {lang(
                                            {
                                                'zh-CN': '登录',
                                                'zh-TW': '登錄',
                                                'en-US': 'Sign In',
                                                'es-ES': 'Iniciar Sesión',
                                                'fr-FR': 'Se Connecter',
                                                'ru-RU': 'Войти',
                                                'ja-JP': 'サインイン',
                                                'de-DE': 'Anmelden',
                                                'pt-BR': 'Entrar',
                                                'ko-KR': '로그인',
                                            },
                                            locale,
                                        )}
                                    </Link>
                                </Button>
                                <Button asChild variant='outline' className='flex-1'>
                                    <Link href={`/signup?url=${encodeURIComponent(pathname)}`}>
                                        {lang(
                                            {
                                                'zh-CN': '注册',
                                                'zh-TW': '註冊',
                                                'en-US': 'Sign Up',
                                                'es-ES': 'Registrarse',
                                                'fr-FR': "S'inscrire",
                                                'ru-RU': 'Регистрация',
                                                'ja-JP': 'サインアップ',
                                                'de-DE': 'Registrieren',
                                                'pt-BR': 'Cadastrar',
                                                'ko-KR': '회원가입',
                                            },
                                            locale,
                                        )}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* 原有的创建帖子 Sheet */}
                <Sheet open={open} onOpenChange={handleSheetOpenChange}>
                    <SheetContent
                        side='bottom'
                        className='p-0 border-t-0 shadow-2xl'
                        style={{ height: `${sheetHeight}vh` }}
                        ref={sheetRef}
                    >
                        {/* 拖拽手柄 */}
                        <motion.div
                            className='w-full h-6 flex items-center justify-center cursor-row-resize bg-background/80 backdrop-blur-sm relative group'
                            drag='y'
                            dragControls={dragControls}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0}
                            onDrag={handleDrag}
                        >
                            <div className='w-12 h-1 bg-muted-foreground/20 group-hover:bg-[#f0b100]/50 rounded-full transition-colors duration-300' />
                        </motion.div>

                        {/* 可滚动的主内容区域 */}
                        <div className='h-[calc(100%-24px)] overflow-y-auto'>
                            <div className='w-full max-w-7xl mx-auto flex flex-col px-4 md:px-6 pb-4 md:pb-6'>
                                <SheetHeader className='py-3 md:py-4 flex-shrink-0'>
                                    <SheetTitle className='text-lg md:text-xl font-semibold text-center'>
                                        {lang(
                                            {
                                                'zh-CN': '创建新帖子',
                                                'zh-TW': '創建新帖子',
                                                'en-US': 'Create New Post',
                                                'es-ES': 'Crear Nueva Publicación',
                                                'fr-FR': 'Créer un Nouveau Message',
                                                'ru-RU': 'Создать Новый Пост',
                                                'ja-JP': '新しい投稿を作成',
                                                'de-DE': 'Neuen Beitrag Erstellen',
                                                'pt-BR': 'Criar Nova Postagem',
                                                'ko-KR': '새 게시물 만들기',
                                            },
                                            locale,
                                        )}
                                    </SheetTitle>
                                </SheetHeader>

                                <div className='space-y-4 md:space-y-6'>
                                    {/* 标题和主题行 - 移动版改为纵向布局 */}
                                    <div className='grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 lg:gap-6'>
                                        <div className='space-y-2 md:space-y-3'>
                                            <Label
                                                htmlFor='title'
                                                className='text-sm font-medium flex items-center gap-2 h-5 md:h-6'
                                            >
                                                {lang(
                                                    {
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
                                                    },
                                                    locale,
                                                )}
                                                <Badge
                                                    variant={
                                                        title.length > 40
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className='text-xs'
                                                >
                                                    {title.length}/50
                                                </Badge>
                                            </Label>
                                            <Input
                                                id='title'
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder={lang(
                                                    {
                                                        'zh-CN': '输入一个吸引人的标题...',
                                                        'zh-TW': '輸入一個吸引人的標題...',
                                                        'en-US': 'Enter an engaging title...',
                                                        'es-ES': 'Ingrese un título atractivo...',
                                                        'fr-FR': 'Saisissez un titre engageant...',
                                                        'ru-RU':
                                                            'Введите привлекательный заголовок...',
                                                        'ja-JP': '魅力的なタイトルを入力...',
                                                        'de-DE':
                                                            'Geben Sie einen ansprechenden Titel ein...',
                                                        'pt-BR': 'Digite um título atraente...',
                                                        'ko-KR': '매력적인 제목을 입력하세요...',
                                                    },
                                                    locale,
                                                )}
                                                maxLength={50}
                                                className='h-10 md:h-12 text-sm md:text-base border-2 focus:border-[#f0b100] transition-colors'
                                            />
                                        </div>

                                        <div className='space-y-2 md:space-y-3'>
                                            <Label className='text-sm font-medium h-5 md:h-6 flex items-center'>
                                                {lang(
                                                    {
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
                                                    },
                                                    locale,
                                                )}
                                            </Label>
                                            <div className='relative'>
                                                <Input
                                                    readOnly
                                                    value={selectedTopic}
                                                    placeholder={lang(
                                                        {
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
                                                        },
                                                        locale,
                                                    )}
                                                    className='h-10 md:h-12 text-sm md:text-base border-2 focus:border-[#f0b100] transition-colors cursor-pointer pr-10'
                                                    onClick={() => setTopicDialogOpen(true)}
                                                />
                                                <RiArrowDownSLine className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
                                            </div>

                                            {/* 主题选择 Dialog */}
                                            <Dialog
                                                open={topicDialogOpen}
                                                onOpenChange={setTopicDialogOpen}
                                            >
                                                <DialogContent className='max-w-md max-h-[80vh] flex flex-col'>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {lang(
                                                                {
                                                                    'zh-CN': '选择主题分类',
                                                                    'zh-TW': '選擇主題分類',
                                                                    'en-US':
                                                                        'Select Topic Category',
                                                                    'es-ES':
                                                                        'Seleccionar Categoría del Tema',
                                                                    'fr-FR':
                                                                        'Sélectionner la Catégorie du Sujet',
                                                                    'ru-RU':
                                                                        'Выберите Категорию Темы',
                                                                    'ja-JP':
                                                                        'トピックカテゴリを選択',
                                                                    'de-DE':
                                                                        'Themenkategorie Auswählen',
                                                                    'pt-BR':
                                                                        'Selecionar Categoria do Tópico',
                                                                    'ko-KR': '주제 카테고리 선택',
                                                                },
                                                                locale,
                                                            )}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    {/* 搜索框 */}
                                                    <div className='relative mb-4'>
                                                        <RiSearchLine className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                                        <Input
                                                            value={topicSearchQuery}
                                                            onChange={(e) =>
                                                                setTopicSearchQuery(e.target.value)
                                                            }
                                                            placeholder={lang(
                                                                {
                                                                    'zh-CN': '搜索主题...',
                                                                    'zh-TW': '搜索主題...',
                                                                    'en-US': 'Search topics...',
                                                                    'es-ES': 'Buscar temas...',
                                                                    'fr-FR':
                                                                        'Rechercher des sujets...',
                                                                    'ru-RU': 'Поиск тем...',
                                                                    'ja-JP': 'トピックを検索...',
                                                                    'de-DE': 'Themen suchen...',
                                                                    'pt-BR': 'Buscar tópicos...',
                                                                    'ko-KR': '주제 검색...',
                                                                },
                                                                locale,
                                                            )}
                                                            className='pl-10'
                                                        />
                                                    </div>

                                                    {/* 主题列表 */}
                                                    <div className='flex-1 overflow-y-auto space-y-1 pr-2'>
                                                        {getFilteredTopics().length > 0 ? (
                                                            getFilteredTopics().map((topic) => (
                                                                <div
                                                                    key={topic.name}
                                                                    onClick={() =>
                                                                        handleTopicSelect(
                                                                            topic.name,
                                                                            topic.display,
                                                                        )
                                                                    }
                                                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                                                                        selectedTopicName ===
                                                                        topic.name
                                                                            ? 'bg-[#f0b100]/10 border border-[#f0b100]'
                                                                            : 'border border-transparent'
                                                                    }`}
                                                                >
                                                                    <span className='text-sm'>
                                                                        {topic.display}
                                                                    </span>
                                                                    {selectedTopicName ===
                                                                        topic.name && (
                                                                        <RiCheckLine className='h-4 w-4 text-[#f0b100]' />
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className='text-center py-8 text-muted-foreground'>
                                                                <div className='text-2xl mb-2'>
                                                                    🔍
                                                                </div>
                                                                <p className='text-sm'>
                                                                    {lang(
                                                                        {
                                                                            'zh-CN':
                                                                                '未找到匹配的主题',
                                                                            'zh-TW':
                                                                                '未找到匹配的主題',
                                                                            'en-US':
                                                                                'No matching topics found',
                                                                            'es-ES':
                                                                                'No se encontraron temas coincidentes',
                                                                            'fr-FR':
                                                                                'Aucun sujet correspondant trouvé',
                                                                            'ru-RU':
                                                                                'Подходящие темы не найдены',
                                                                            'ja-JP':
                                                                                '一致するトピックが見つかりません',
                                                                            'de-DE':
                                                                                'Keine passenden Themen gefunden',
                                                                            'pt-BR':
                                                                                'Nenhum tópico correspondente encontrado',
                                                                            'ko-KR':
                                                                                '일치하는 주제를 찾을 수 없습니다',
                                                                        },
                                                                        locale,
                                                                    )}
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
                                                            {lang(
                                                                {
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
                                                                },
                                                                locale,
                                                            )}
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
                                                {lang(
                                                    {
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
                                                    },
                                                    locale,
                                                )}
                                                <Badge
                                                    variant={
                                                        content.length > 150
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className='text-xs'
                                                >
                                                    {content.length}/200
                                                </Badge>
                                            </Label>
                                            <EmojiPicker
                                                onEmojiSelect={insertEmoji}
                                                locale={locale}
                                            />
                                        </div>

                                        {/* Markdown 工具栏 */}
                                        <MarkdownEditor
                                            value={content}
                                            onChange={setContent}
                                            locale={locale}
                                        />

                                        <div
                                            className='border-2 rounded-lg overflow-hidden bg-background transition-colors'
                                            style={{ height: '350px' }}
                                        >
                                            <Tabs
                                                value={activeTab}
                                                onValueChange={setActiveTab}
                                                className='h-full flex flex-col'
                                            >
                                                <div className='border-b bg-muted/30 flex-shrink-0'>
                                                    <TabsList className='grid w-full grid-cols-2 bg-transparent border-0 p-1 h-10'>
                                                        <TabsTrigger
                                                            value='edit'
                                                            className='data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100] text-sm'
                                                        >
                                                            {lang(
                                                                {
                                                                    'zh-CN': '编辑',
                                                                    'zh-TW': '編輯',
                                                                    'en-US': 'Edit',
                                                                    'es-ES': 'Editar',
                                                                    'fr-FR': 'Modifier',
                                                                    'ru-RU': 'Редактировать',
                                                                    'ja-JP': '編集',
                                                                    'de-DE': 'Bearbeiten',
                                                                    'pt-BR': 'Editar',
                                                                    'ko-KR': '편집',
                                                                },
                                                                locale,
                                                            )}
                                                        </TabsTrigger>
                                                        <TabsTrigger
                                                            value='preview'
                                                            className='data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100] text-sm'
                                                        >
                                                            {lang(
                                                                {
                                                                    'zh-CN': '预览',
                                                                    'zh-TW': '預覽',
                                                                    'en-US': 'Preview',
                                                                    'es-ES': 'Vista Previa',
                                                                    'fr-FR': 'Aperçu',
                                                                    'ru-RU': 'Предпросмотр',
                                                                    'ja-JP': 'プレビュー',
                                                                    'de-DE': 'Vorschau',
                                                                    'pt-BR': 'Visualizar',
                                                                    'ko-KR': '미리보기',
                                                                },
                                                                locale,
                                                            )}
                                                        </TabsTrigger>
                                                    </TabsList>
                                                </div>

                                                <TabsContent
                                                    value='edit'
                                                    className='flex-1 p-3 md:p-4 m-0 overflow-hidden'
                                                >
                                                    <Textarea
                                                        id='content-textarea'
                                                        value={content}
                                                        onChange={(e) => setContent(e.target.value)}
                                                        placeholder={lang(
                                                            {
                                                                'zh-CN':
                                                                    '分享你的想法，支持 Markdown 格式...',
                                                                'zh-TW':
                                                                    '分享你的想法，支持 Markdown 格式...',
                                                                'en-US':
                                                                    'Share your thoughts, Markdown supported...',
                                                                'es-ES':
                                                                    'Comparte tus pensamientos, Markdown compatible...',
                                                                'fr-FR':
                                                                    'Partagez vos pensées, Markdown pris en charge...',
                                                                'ru-RU':
                                                                    'Поделитесь своими мыслями, поддерживается Markdown...',
                                                                'ja-JP':
                                                                    'あなたの考えを共有してください、Markdown対応...',
                                                                'de-DE':
                                                                    'Teilen Sie Ihre Gedanken mit, Markdown unterstützt...',
                                                                'pt-BR':
                                                                    'Compartilhe seus pensamentos, Markdown suportado...',
                                                                'ko-KR':
                                                                    '생각을 공유하세요, 마크다운 지원...',
                                                            },
                                                            locale,
                                                        )}
                                                        className='h-full resize-none border-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-sm md:text-base leading-relaxed'
                                                        maxLength={200}
                                                    />
                                                </TabsContent>

                                                <TabsContent
                                                    value='preview'
                                                    className='flex-1 p-3 md:p-4 m-0 overflow-y-auto'
                                                >
                                                    {content ? (
                                                        <div
                                                            className='prose prose-sm max-w-none dark:prose-invert'
                                                            dangerouslySetInnerHTML={{
                                                                __html: markdownToHtml(content),
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className='h-full flex items-center justify-center text-muted-foreground'>
                                                            <div className='text-center'>
                                                                <div className='text-2xl md:text-4xl mb-2 md:mb-4'>
                                                                    📝
                                                                </div>
                                                                <p className='text-sm md:text-base'>
                                                                    {lang(
                                                                        {
                                                                            'zh-CN':
                                                                                '在编辑选项卡中输入内容以查看预览',
                                                                            'zh-TW':
                                                                                '在編輯選項卡中輸入內容以查看預覽',
                                                                            'en-US':
                                                                                'Enter content in the edit tab to see preview',
                                                                            'es-ES':
                                                                                'Ingrese contenido en la pestaña de edición para ver la vista previa',
                                                                            'fr-FR':
                                                                                "Saisissez le contenu dans l'onglet d'édition pour voir l'aperçu",
                                                                            'ru-RU':
                                                                                'Введите содержимое во вкладке редактирования для предпросмотра',
                                                                            'ja-JP':
                                                                                '編集タブでコンテンツを入力してプレビューを表示',
                                                                            'de-DE':
                                                                                'Geben Sie Inhalt im Bearbeitungstab ein, um die Vorschau zu sehen',
                                                                            'pt-BR':
                                                                                'Digite o conteúdo na aba de edição para ver a visualização',
                                                                            'ko-KR':
                                                                                '미리보기를 보려면 편집 탭에서 내용을 입력하세요',
                                                                        },
                                                                        locale,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>

                                    <Separator className='my-3 md:my-4' />

                                    {/* 操作按钮 */}
                                    <div className='flex justify-end items-center'>
                                        <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto'>
                                            <Button
                                                variant='outline'
                                                onClick={() => submitPost(true)}
                                                disabled={isSubmitting}
                                                className='px-4 md:px-6 border-2 hover:border-[#f0b100] hover:text-[#f0b100] h-10 md:h-auto text-sm md:text-base'
                                            >
                                                <RiDraftLine className='h-4 w-4 mr-2' />
                                                {lang(
                                                    {
                                                        'zh-CN': '保存草稿',
                                                        'zh-TW': '保存草稿',
                                                        'en-US': 'Save Draft',
                                                        'es-ES': 'Guardar Borrador',
                                                        'fr-FR': 'Sauvegarder le Brouillon',
                                                        'ru-RU': 'Сохранить Черновик',
                                                        'ja-JP': '下書きを保存',
                                                        'de-DE': 'Entwurf Speichern',
                                                        'pt-BR': 'Salvar Rascunho',
                                                        'ko-KR': '초안 저장',
                                                    },
                                                    locale,
                                                )}
                                            </Button>

                                            <Button
                                                onClick={() => submitPost(false)}
                                                disabled={isSubmitting}
                                                style={{ backgroundColor: '#f0b100' }}
                                                className='px-6 md:px-8 text-white hover:opacity-90 transition-opacity shadow-lg h-10 md:h-auto text-sm md:text-base'
                                            >
                                                <RiSendPlaneLine className='h-4 w-4 mr-2' />
                                                {isSubmitting
                                                    ? lang(
                                                          {
                                                              'zh-CN': '发布中...',
                                                              'zh-TW': '發布中...',
                                                              'en-US': 'Publishing...',
                                                              'es-ES': 'Publicando...',
                                                              'fr-FR': 'Publication...',
                                                              'ru-RU': 'Публикация...',
                                                              'ja-JP': '公開中...',
                                                              'de-DE': 'Veröffentlichen...',
                                                              'pt-BR': 'Publicando...',
                                                              'ko-KR': '게시 중...',
                                                          },
                                                          locale,
                                                      )
                                                    : lang(
                                                          {
                                                              'zh-CN': '发布帖子',
                                                              'zh-TW': '發布帖子',
                                                              'en-US': 'Publish Post',
                                                              'es-ES': 'Publicar Post',
                                                              'fr-FR': 'Publier le Message',
                                                              'ru-RU': 'Опубликовать Пост',
                                                              'ja-JP': '投稿を公開',
                                                              'de-DE': 'Beitrag Veröffentlichen',
                                                              'pt-BR': 'Publicar Post',
                                                              'ko-KR': '게시물 게시',
                                                          },
                                                          locale,
                                                      )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </motion.div>
        </>
    );
}
