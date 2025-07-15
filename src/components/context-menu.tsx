'use client';

import { useState, useEffect } from 'react';
import {
    ContextMenu as ShadcnContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    Copy,
    ClipboardPaste,
    Search,
    ExternalLink,
    Share2,
    MessageSquarePlus,
    RefreshCw,
    ArrowLeft,
    ArrowRight,
    Home,
    Link,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { useBroadcast } from '@/store/useBroadcast';
import { ShareButton } from '@/components/share-button';

interface ContextMenuProps {
    children: React.ReactNode;
    locale?: string;
}

export function ContextMenu({ children, locale = 'en-US' }: ContextMenuProps) {
    const [selectedText, setSelectedText] = useState('');
    const [contextUrl, setContextUrl] = useState('');
    const [contextLinkText, setContextLinkText] = useState('');
    const [contextImageUrl, setContextImageUrl] = useState('');
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [url, setUrl] = useState('/');
    const [title, setTitle] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    const { broadcast } = useBroadcast();

    useEffect(() => {
        // 检测是否为移动设备
        const checkIsMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
            const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            
            return isMobileUA || (isTouchDevice && isSmallScreen);
        };

        setIsMobile(checkIsMobile());

        const handleSelectionChange = () => {
            if (isMobile) return; // 移动设备上不处理文本选择
            const selection = window.getSelection();
            setSelectedText(selection?.toString() || '');
        };

        const handleContextMenu = (e: MouseEvent) => {
            if (isMobile) {
                // 移动设备上阻止自定义右键菜单
                e.preventDefault();
                return;
            }

            const target = e.target as HTMLElement;

            // 检查是否是链接
            if (target.tagName === 'A') {
                setContextUrl((target as HTMLAnchorElement).href);
                setContextLinkText((target as HTMLAnchorElement).textContent || '');
            } else {
                setContextUrl('');
                setContextLinkText('');
            }

            // 检查是否是图片
            if (target.tagName === 'IMG') {
                setContextImageUrl((target as HTMLImageElement).src);
            } else {
                setContextImageUrl('');
            }

            setCanGoBack(window.history.length > 1);
            setCanGoForward(false);
        };

        if (!isMobile) {
            document.addEventListener('selectionchange', handleSelectionChange);
        }
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [isMobile]);

    // 当右键菜单打开时锁定滚动
    useEffect(() => {
        if (isMenuOpen) {
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            document.body.removeAttribute('data-scroll-locked');
        }

        return () => {
            document.body.removeAttribute('data-scroll-locked');
        };
    }, [isMenuOpen]);

    useEffect(() => {
        // 只在客户端设置 url 和 title
        if (typeof window !== 'undefined') {
            setUrl(window.location.href || '/');
            setTitle(document.title);
        }
    }, []);

    const handleCopy = async () => {
        try {
            if (selectedText) {
                await navigator.clipboard.writeText(selectedText);
                toast.success(
                    lang(
                        {
                            'zh-CN': '已复制到剪贴板',
                            'en-US': 'Copied to clipboard',
                            'ja-JP': 'クリップボードにコピーしました',
                            'ko-KR': '클립보드에 복사됨',
                            'fr-FR': 'Copié dans le presse-papiers',
                            'es-ES': 'Copiado al portapapeles',
                            'de-DE': 'In die Zwischenablage kopiert',
                            'pt-BR': 'Copiado para a área de transferência',
                            'ru-RU': 'Скопировано в буфер обмена',
                            'zh-TW': '已複製到剪貼簿',
                        },
                        locale,
                    ),
                );
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '复制失败',
                        'en-US': 'Failed to copy',
                        'ja-JP': 'コピーに失敗しました',
                        'ko-KR': '복사 실패',
                        'fr-FR': 'Échec de la copie',
                        'es-ES': 'Error al copiar',
                        'de-DE': 'Kopieren fehlgeschlagen',
                        'pt-BR': 'Falha ao copiar',
                        'ru-RU': 'Не удалось скопировать',
                        'zh-TW': '複製失敗',
                    },
                    locale,
                ),
            );
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
            if (
                activeElement &&
                (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
            ) {
                const start = activeElement.selectionStart || 0;
                const end = activeElement.selectionEnd || 0;
                const value = activeElement.value;
                activeElement.value = value.slice(0, start) + text + value.slice(end);
                activeElement.setSelectionRange(start + text.length, start + text.length);
            }
        } catch (error) {
            console.error('Failed to paste text:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '粘贴失败',
                        'en-US': 'Failed to paste',
                        'ja-JP': '貼り付けに失敗しました',
                        'ko-KR': '붙여넣기 실패',
                        'fr-FR': 'Échec du collage',
                        'es-ES': 'Error al pegar',
                        'de-DE': 'Einfügen fehlgeschlagen',
                        'pt-BR': 'Falha ao colar',
                        'ru-RU': 'Не удалось вставить',
                        'zh-TW': '貼上失敗',
                    },
                    locale,
                ),
            );
        }
    };

    const handleSearch = () => {
        if (selectedText) {
            // 使用广播设置搜索查询并打开搜索Sheet
            broadcast({ action: 'SET_SEARCH_QUERY', query: selectedText });
        } else {
            // 如果没有选中文本，直接打开搜索Sheet
            broadcast({ action: 'SHOW_SEARCH' });
        }
    };

    const handleOpenLink = () => {
        if (contextUrl) {
            window.location.href = contextUrl;
        }
    };

    const handleOpenInNewTab = () => {
        if (contextUrl) {
            window.open(contextUrl, '_blank');
        }
    };

    const handleCreatePost = () => {
        // 使用广播触发新建帖子
        broadcast({ action: 'SHOW_NEW_POST' });
    };

    const handleShareText = async () => {
        try {
            if (navigator.share && selectedText) {
                await navigator.share({
                    text: selectedText,
                });
            } else if (selectedText) {
                await navigator.clipboard.writeText(selectedText);
                toast.success(
                    lang(
                        {
                            'zh-CN': '文本已复制到剪贴板',
                            'en-US': 'Text copied to clipboard',
                            'ja-JP': 'テキストをクリップボードにコピーしました',
                            'ko-KR': '텍스트가 클립보드에 복사됨',
                            'fr-FR': 'Texte copié dans le presse-papiers',
                            'es-ES': 'Texto copiado al portapapeles',
                            'de-DE': 'Text in die Zwischenablage kopiert',
                            'pt-BR': 'Texto copiado para a área de transferência',
                            'ru-RU': 'Текст скопирован в буфер обмена',
                            'zh-TW': '文本已複製到剪貼簿',
                        },
                        locale,
                    ),
                );
            }
        } catch (error) {
            console.error('Failed to share text:', error);
            // 处理错误
        }
    };

    const handleCopyLink = async () => {
        try {
            if (contextUrl) {
                await navigator.clipboard.writeText(contextUrl);
                toast.success(
                    lang(
                        {
                            'zh-CN': '链接已复制到剪贴板',
                            'en-US': 'Link copied to clipboard',
                            'ja-JP': 'リンクをクリップボードにコピーしました',
                            'ko-KR': '링크가 클립보드에 복사됨',
                            'fr-FR': 'Lien copié dans le presse-papiers',
                            'es-ES': 'Enlace copiado al portapapeles',
                            'de-DE': 'Link in die Zwischenablage kopiert',
                            'pt-BR': 'Link copiado para a área de transferência',
                            'ru-RU': 'Ссылка скопирована в буфер обмена',
                            'zh-TW': '連結已複製到剪貼簿',
                        },
                        locale,
                    ),
                );
            }
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '复制链接失败',
                        'en-US': 'Failed to copy link',
                        'ja-JP': 'リンクのコピーに失敗しました',
                        'ko-KR': '링크 복사 실패',
                        'fr-FR': 'Échec de la copie du lien',
                        'es-ES': 'Error al copiar enlace',
                        'de-DE': 'Link kopieren fehlgeschlagen',
                        'pt-BR': 'Falha ao copiar link',
                        'ru-RU': 'Не удалось скопировать ссылку',
                        'zh-TW': '複製連結失敗',
                    },
                    locale,
                ),
            );
        }
    };

    const handleCopyLinkText = async () => {
        try {
            if (contextLinkText) {
                await navigator.clipboard.writeText(contextLinkText);
                toast.success(
                    lang(
                        {
                            'zh-CN': '链接文字已复制到剪贴板',
                            'en-US': 'Link text copied to clipboard',
                            'ja-JP': 'リンクテキストをクリップボードにコピーしました',
                            'ko-KR': '링크 텍스트가 클립보드에 복사됨',
                            'fr-FR': 'Texte du lien copié dans le presse-papiers',
                            'es-ES': 'Texto del enlace copiado al portapapeles',
                            'de-DE': 'Link-Text in die Zwischenablage kopiert',
                            'pt-BR': 'Texto do link copiado para a área de transferência',
                            'ru-RU': 'Текст ссылки скопирован в буфер обмена',
                            'zh-TW': '連結文字已複製到剪貼簿',
                        },
                        locale,
                    ),
                );
            }
        } catch (error) {
            console.error('Failed to copy link text:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '复制链接文字失败',
                        'en-US': 'Failed to copy link text',
                        'ja-JP': 'リンクテキストのコピーに失敗しました',
                        'ko-KR': '링크 텍스트 복사 실패',
                        'fr-FR': 'Échec de la copie du texte du lien',
                        'es-ES': 'Error al copiar texto del enlace',
                        'de-DE': 'Link-Text kopieren fehlgeschlagen',
                        'pt-BR': 'Falha ao copiar texto do link',
                        'ru-RU': 'Не удалось скопировать текст ссылки',
                        'zh-TW': '複製連結文字失敗',
                    },
                    locale,
                ),
            );
        }
    };

    const handleViewImage = () => {
        if (contextImageUrl) {
            window.open(contextImageUrl, '_blank');
        }
    };

    const texts = {
        copy: lang(
            {
                'zh-CN': '复制',
                'en-US': 'Copy',
                'ja-JP': 'コピー',
                'ko-KR': '복사',
                'fr-FR': 'Copier',
                'es-ES': 'Copiar',
                'de-DE': 'Kopieren',
                'pt-BR': 'Copiar',
                'ru-RU': 'Копировать',
                'zh-TW': '複製',
            },
            locale,
        ),
        paste: lang(
            {
                'zh-CN': '粘贴',
                'en-US': 'Paste',
                'ja-JP': '貼り付け',
                'ko-KR': '붙여넣기',
                'fr-FR': 'Coller',
                'es-ES': 'Pegar',
                'de-DE': 'Einfügen',
                'pt-BR': 'Colar',
                'ru-RU': 'Вставить',
                'zh-TW': '貼上',
            },
            locale,
        ),
        searchText: lang(
            {
                'zh-CN': '搜索',
                'en-US': 'Search for',
                'ja-JP': '検索',
                'ko-KR': '검색',
                'fr-FR': 'Rechercher',
                'es-ES': 'Buscar',
                'de-DE': 'Suchen nach',
                'pt-BR': 'Pesquisar',
                'ru-RU': 'Искать',
                'zh-TW': '搜尋',
            },
            locale,
        ),
        openLink: lang(
            {
                'zh-CN': '打开链接',
                'en-US': 'Open link',
                'ja-JP': 'リンクを開く',
                'ko-KR': '링크 열기',
                'fr-FR': 'Ouvrir le lien',
                'es-ES': 'Abrir enlace',
                'de-DE': 'Link öffnen',
                'pt-BR': 'Abrir link',
                'ru-RU': 'Открыть ссылку',
                'zh-TW': '開啟連結',
            },
            locale,
        ),
        openInNewTab: lang(
            {
                'zh-CN': '在新标签页中打开',
                'en-US': 'Open in new tab',
                'ja-JP': '新しいタブで開く',
                'ko-KR': '새 탭에서 열기',
                'fr-FR': 'Ouvrir dans un nouvel onglet',
                'es-ES': 'Abrir en nueva pestaña',
                'de-DE': 'In neuem Tab öffnen',
                'pt-BR': 'Abrir em nova aba',
                'ru-RU': 'Открыть в новой вкладке',
                'zh-TW': '在新分頁中開啟',
            },
            locale,
        ),
        createPost: lang(
            {
                'zh-CN': '创建新帖子',
                'en-US': 'Create new post',
                'ja-JP': '新しい投稿を作成',
                'ko-KR': '새 게시물 만들기',
                'fr-FR': 'Créer un nouveau post',
                'es-ES': 'Crear nueva publicación',
                'de-DE': 'Neuen Beitrag erstellen',
                'pt-BR': 'Criar nova postagem',
                'ru-RU': 'Создать новый пост',
                'zh-TW': '建立新帖子',
            },
            locale,
        ),
        shareUrl: lang(
            {
                'zh-CN': '分享当前页面',
                'en-US': 'Share current page',
                'ja-JP': '現在のページを共有',
                'ko-KR': '현재 페이지 공유',
                'fr-FR': 'Partager la page actuelle',
                'es-ES': 'Compartir página actual',
                'de-DE': 'Aktuelle Seite teilen',
                'pt-BR': 'Compartilhar página atual',
                'ru-RU': 'Поделиться текущей страницей',
                'zh-TW': '分享當前頁面',
            },
            locale,
        ),
        shareText: lang(
            {
                'zh-CN': '分享选中文本',
                'en-US': 'Share selected text',
                'ja-JP': '選択したテキストを共有',
                'ko-KR': '선택한 텍스트 공유',
                'fr-FR': 'Partager le texte sélectionné',
                'es-ES': 'Compartir texto seleccionado',
                'de-DE': 'Ausgewählten Text teilen',
                'pt-BR': 'Compartilhar texto selecionado',
                'ru-RU': 'Поделиться выделенным текстом',
                'zh-TW': '分享選中文字',
            },
            locale,
        ),
        refresh: lang(
            {
                'zh-CN': '刷新',
                'en-US': 'Refresh',
                'ja-JP': '更新',
                'ko-KR': '새로고침',
                'fr-FR': 'Actualiser',
                'es-ES': 'Actualizar',
                'de-DE': 'Aktualisieren',
                'pt-BR': 'Atualizar',
                'ru-RU': 'Обновить',
                'zh-TW': '重新整理',
            },
            locale,
        ),
        back: lang(
            {
                'zh-CN': '后退',
                'en-US': 'Back',
                'ja-JP': '戻る',
                'ko-KR': '뒤로',
                'fr-FR': 'Retour',
                'es-ES': 'Atrás',
                'de-DE': 'Zurück',
                'pt-BR': 'Voltar',
                'ru-RU': 'Назад',
                'zh-TW': '返回',
            },
            locale,
        ),
        forward: lang(
            {
                'zh-CN': '前进',
                'en-US': 'Forward',
                'ja-JP': '進む',
                'ko-KR': '앞으로',
                'fr-FR': 'Suivant',
                'es-ES': 'Adelante',
                'de-DE': 'Vorwärts',
                'pt-BR': 'Avançar',
                'ru-RU': 'Вперед',
                'zh-TW': '前進',
            },
            locale,
        ),
        home: lang(
            {
                'zh-CN': '首页',
                'en-US': 'Home',
                'ja-JP': 'ホーム',
                'ko-KR': '홈',
                'fr-FR': 'Accueil',
                'es-ES': 'Inicio',
                'de-DE': 'Startseite',
                'pt-BR': 'Início',
                'ru-RU': 'Главная',
                'zh-TW': '首頁',
            },
            locale,
        ),
        bookmark: lang(
            {
                'zh-CN': '添加书签',
                'en-US': 'Add bookmark',
                'ja-JP': 'ブックマークを追加',
                'ko-KR': '북마크 추가',
                'fr-FR': 'Ajouter un signet',
                'es-ES': 'Añadir marcador',
                'de-DE': 'Lesezeichen hinzufügen',
                'pt-BR': 'Adicionar favorito',
                'ru-RU': 'Добавить закладку',
                'zh-TW': '加入書籤',
            },
            locale,
        ),
        copyLink: lang(
            {
                'zh-CN': '复制链接',
                'en-US': 'Copy link',
                'ja-JP': 'リンクをコピー',
                'ko-KR': '링크 복사',
                'fr-FR': 'Copier le lien',
                'es-ES': 'Copiar enlace',
                'de-DE': 'Link kopieren',
                'pt-BR': 'Copiar link',
                'ru-RU': 'Копировать ссылку',
                'zh-TW': '複製連結',
            },
            locale,
        ),
        copyLinkText: lang(
            {
                'zh-CN': '复制链接文字',
                'en-US': 'Copy link text',
                'ja-JP': 'リンクテキストをコピー',
                'ko-KR': '링크 텍스트 복사',
                'fr-FR': 'Copier le texte du lien',
                'es-ES': 'Copiar texto del enlace',
                'de-DE': 'Link-Text kopieren',
                'pt-BR': 'Copiar texto do link',
                'ru-RU': 'Копировать текст ссылки',
                'zh-TW': '複製連結文字',
            },
            locale,
        ),
        viewImage: lang(
            {
                'zh-CN': '查看图片',
                'en-US': 'View image',
                'ja-JP': '画像を表示',
                'ko-KR': '이미지 보기',
                'fr-FR': "Voir l'image",
                'es-ES': 'Ver imagen',
                'de-DE': 'Bild anzeigen',
                'pt-BR': 'Ver imagem',
                'ru-RU': 'Просмотреть изображение',
                'zh-TW': '檢視圖片',
            },
            locale,
        ),
    };

    const handleBack = () => {
        if (canGoBack) {
            window.history.back();
        }
    };

    const handleForward = () => {
        if (canGoForward) {
            window.history.forward();
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    // 添加 handleHome
    const handleHome = () => {
        window.location.href = `/${locale}`;
    };

    return (
        <>
            {isMobile ? (
                // 移动设备上直接返回子组件，不包装右键菜单
                children
            ) : (
                <ShadcnContextMenu onOpenChange={setIsMenuOpen}>
                    <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                    <ContextMenuContent className='w-64'>
                        {/* 导航相关 */}
                        <ContextMenuItem onClick={handleBack} disabled={!canGoBack}>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            {texts.back}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleForward} disabled={!canGoForward}>
                            <ArrowRight className='mr-2 h-4 w-4' />
                            {texts.forward}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleRefresh}>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            {texts.refresh}
                            <ContextMenuShortcut>F5</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleHome}>
                            <Home className='mr-2 h-4 w-4' />
                            {texts.home}
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        {/* 编辑相关 */}
                        {selectedText && (
                            <ContextMenuItem onClick={handleCopy}>
                                <Copy className='mr-2 h-4 w-4' />
                                {texts.copy}
                                <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                            </ContextMenuItem>
                        )}

                        <ContextMenuItem onClick={handlePaste}>
                            <ClipboardPaste className='mr-2 h-4 w-4' />
                            {texts.paste}
                            <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
                        </ContextMenuItem>

                        {/* 搜索相关 */}
                        <ContextMenuItem onClick={handleSearch}>
                            <Search className='mr-2 h-4 w-4' />
                            {selectedText
                                ? `${texts.searchText} "${selectedText.slice(0, 20)}${selectedText.length > 20 ? '...' : ''}"`
                                : texts.searchText}
                        </ContextMenuItem>

                        {/* 链接相关 */}
                        {contextUrl && (
                            <>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={handleOpenLink}>
                                    <ExternalLink className='mr-2 h-4 w-4' />
                                    {texts.openLink}
                                </ContextMenuItem>
                                <ContextMenuItem onClick={handleOpenInNewTab}>
                                    <ExternalLink className='mr-2 h-4 w-4' />
                                    {texts.openInNewTab}
                                    <ContextMenuShortcut>Ctrl+Click</ContextMenuShortcut>
                                </ContextMenuItem>
                                <ContextMenuItem onClick={handleCopyLink}>
                                    <Link className='mr-2 h-4 w-4' />
                                    {texts.copyLink}
                                </ContextMenuItem>
                                {contextLinkText && (
                                    <ContextMenuItem onClick={handleCopyLinkText}>
                                        <Copy className='mr-2 h-4 w-4' />
                                        {texts.copyLinkText}
                                    </ContextMenuItem>
                                )}
                            </>
                        )}

                        {/* 图片相关 */}
                        {contextImageUrl && (
                            <>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={handleViewImage}>
                                    <Eye className='mr-2 h-4 w-4' />
                                    {texts.viewImage}
                                </ContextMenuItem>
                            </>
                        )}

                        <ContextMenuSeparator />

                        {/* 功能相关 */}
                        <ContextMenuItem onClick={handleCreatePost}>
                            <MessageSquarePlus className='mr-2 h-4 w-4' />
                            {texts.createPost}
                        </ContextMenuItem>

                        {/* 分享功能 - 使用普通菜单项而非子菜单 */}
                        <ContextMenuItem onClick={() => setShowShareDialog(true)}>
                            <Share2 className='mr-2 h-4 w-4' />
                            {texts.shareUrl}
                        </ContextMenuItem>

                        {selectedText && (
                            <ContextMenuItem onClick={handleShareText}>
                                <Share2 className='mr-2 h-4 w-4' />
                                {texts.shareText}
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ShadcnContextMenu>
            )}
            {/* 分享弹窗 */}
            {showShareDialog && (
                <ShareButton
                    postId=''
                    slug=''
                    title={title}
                    locale={locale}
                    // 新增 url 属性
                    url={url}
                    onOpenChange={(open) => setShowShareDialog(open)}
                    isOpen={showShareDialog}
                />
            )}
        </>
    );
}
