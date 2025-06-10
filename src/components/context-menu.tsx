"use client";

import { useState, useEffect } from "react";
import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
} from "lucide-react";
import { toast } from "sonner";
import lang from "@/lib/lang";

interface ContextMenuProps {
  children: React.ReactNode;
  locale?: string;
  onSearch?: (query: string) => void;
}

export function ContextMenu({ children, locale = "en-US", onSearch }: ContextMenuProps) {
  const [selectedText, setSelectedText] = useState("");
  const [contextUrl, setContextUrl] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      setSelectedText(selection?.toString() || "");
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A") {
        setContextUrl((target as HTMLAnchorElement).href);
      } else {
        setContextUrl("");
      }
      
      setCanGoBack(window.history.length > 1);
      setCanGoForward(false);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

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

  const handleCopy = async () => {
    try {
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        toast.success(lang({
          "zh-CN": "已复制到剪贴板",
          "en-US": "Copied to clipboard",
          "ja-JP": "クリップボードにコピーしました",
          "ko-KR": "클립보드에 복사됨",
          "fr-FR": "Copié dans le presse-papiers",
          "es-ES": "Copiado al portapapeles",
          "de-DE": "In die Zwischenablage kopiert",
          "pt-BR": "Copiado para a área de transferência",
          "ru-RU": "Скопировано в буфер обмена",
          "zh-TW": "已複製到剪貼簿",
        }, locale));
      }
    } catch (error) {
        console.error("Failed to copy text:", error);
      toast.error(lang({
        "zh-CN": "复制失败",
        "en-US": "Failed to copy",
        "ja-JP": "コピーに失敗しました",
        "ko-KR": "복사 실패",
        "fr-FR": "Échec de la copie",
        "es-ES": "Error al copiar",
        "de-DE": "Kopieren fehlgeschlagen",
        "pt-BR": "Falha ao copiar",
        "ru-RU": "Не удалось скопировать",
        "zh-TW": "複製失敗",
      }, locale));
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        const value = activeElement.value;
        activeElement.value = value.slice(0, start) + text + value.slice(end);
        activeElement.setSelectionRange(start + text.length, start + text.length);
      }
    } catch (error) {
        console.error("Failed to paste text:", error);
      toast.error(lang({
        "zh-CN": "粘贴失败",
        "en-US": "Failed to paste",
        "ja-JP": "貼り付けに失敗しました",
        "ko-KR": "붙여넣기 실패",
        "fr-FR": "Échec du collage",
        "es-ES": "Error al pegar",
        "de-DE": "Einfügen fehlgeschlagen",
        "pt-BR": "Falha ao colar",
        "ru-RU": "Не удалось вставить",
        "zh-TW": "貼上失敗",
      }, locale));
    }
  };

  const handleSearch = () => {
    if (selectedText && onSearch) {
      onSearch(selectedText);
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
    window.location.href = `/${locale}/create`;
  };

  const handleShareUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(lang({
          "zh-CN": "链接已复制到剪贴板",
          "en-US": "Link copied to clipboard",
          "ja-JP": "リンクをクリップボードにコピーしました",
          "ko-KR": "링크가 클립보드에 복사됨",
          "fr-FR": "Lien copié dans le presse-papiers",
          "es-ES": "Enlace copiado al portapapeles",
          "de-DE": "Link in die Zwischenablage kopiert",
          "pt-BR": "Link copiado para a área de transferência",
          "ru-RU": "Ссылка скопирована в буфер обмена",
          "zh-TW": "連結已複製到剪貼簿",
        }, locale));
      }
    } catch (error) {
      // 处理错误
      console.error("Failed to share URL:", error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
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

  const handleHome = () => {
    window.location.href = `/${locale}`;
  };

  // 添加分享选中文本的处理函数
  const handleShareText = async () => {
    try {
      if (navigator.share && selectedText) {
        await navigator.share({
          text: selectedText,
        });
      } else if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        toast.success(lang({
          "zh-CN": "文本已复制到剪贴板",
          "en-US": "Text copied to clipboard",
          "ja-JP": "テキストをクリップボードにコピーしました",
          "ko-KR": "텍스트가 클립보드에 복사됨",
          "fr-FR": "Texte copié dans le presse-papiers",
          "es-ES": "Texto copiado al portapapeles",
          "de-DE": "Text in die Zwischenablage kopiert",
          "pt-BR": "Texto copiado para a área de transferência",
          "ru-RU": "Текст скопирован в буфер обмена",
          "zh-TW": "文本已複製到剪貼簿",
        }, locale));
      }
    } catch (error) {
        console.error("Failed to share text:", error);
      // 处理错误
    }
  };

  const texts = {
    copy: lang({
      "zh-CN": "复制",
      "en-US": "Copy",
      "ja-JP": "コピー",
      "ko-KR": "복사",
      "fr-FR": "Copier",
      "es-ES": "Copiar",
      "de-DE": "Kopieren",
      "pt-BR": "Copiar",
      "ru-RU": "Копировать",
      "zh-TW": "複製",
    }, locale),
    paste: lang({
      "zh-CN": "粘贴",
      "en-US": "Paste",
      "ja-JP": "貼り付け",
      "ko-KR": "붙여넣기",
      "fr-FR": "Coller",
      "es-ES": "Pegar",
      "de-DE": "Einfügen",
      "pt-BR": "Colar",
      "ru-RU": "Вставить",
      "zh-TW": "貼上",
    }, locale),
    searchText: lang({
      "zh-CN": "搜索",
      "en-US": "Search for",
      "ja-JP": "検索",
      "ko-KR": "검색",
      "fr-FR": "Rechercher",
      "es-ES": "Buscar",
      "de-DE": "Suchen nach",
      "pt-BR": "Pesquisar",
      "ru-RU": "Искать",
      "zh-TW": "搜尋",
    }, locale),
    openLink: lang({
      "zh-CN": "打开链接",
      "en-US": "Open link",
      "ja-JP": "リンクを開く",
      "ko-KR": "링크 열기",
      "fr-FR": "Ouvrir le lien",
      "es-ES": "Abrir enlace",
      "de-DE": "Link öffnen",
      "pt-BR": "Abrir link",
      "ru-RU": "Открыть ссылку",
      "zh-TW": "開啟連結",
    }, locale),
    openInNewTab: lang({
      "zh-CN": "在新标签页中打开",
      "en-US": "Open in new tab",
      "ja-JP": "新しいタブで開く",
      "ko-KR": "새 탭에서 열기",
      "fr-FR": "Ouvrir dans un nouvel onglet",
      "es-ES": "Abrir en nueva pestaña",
      "de-DE": "In neuem Tab öffnen",
      "pt-BR": "Abrir em nova aba",
      "ru-RU": "Открыть в новой вкладке",
      "zh-TW": "在新分頁中開啟",
    }, locale),
    createPost: lang({
      "zh-CN": "创建新帖子",
      "en-US": "Create new post",
      "ja-JP": "新しい投稿を作成",
      "ko-KR": "새 게시물 만들기",
      "fr-FR": "Créer un nouveau post",
      "es-ES": "Crear nueva publicación",
      "de-DE": "Neuen Beitrag erstellen",
      "pt-BR": "Criar nova postagem",
      "ru-RU": "Создать новый пост",
      "zh-TW": "建立新帖子",
    }, locale),
    shareUrl: lang({
      "zh-CN": "分享页面链接",
      "en-US": "Share page URL",
      "ja-JP": "ページURLを共有",
      "ko-KR": "페이지 URL 공유",
      "fr-FR": "Partager l'URL de la page",
      "es-ES": "Compartir URL de la página",
      "de-DE": "Seiten-URL teilen",
      "pt-BR": "Compartilhar URL da página",
      "ru-RU": "Поделиться URL страницы",
      "zh-TW": "分享頁面連結",
    }, locale),
    shareText: lang({
      "zh-CN": "分享选中文本",
      "en-US": "Share selected text",
      "ja-JP": "選択したテキストを共有",
      "ko-KR": "선택한 텍스트 공유",
      "fr-FR": "Partager le texte sélectionné",
      "es-ES": "Compartir texto seleccionado",
      "de-DE": "Ausgewählten Text teilen",
      "pt-BR": "Compartilhar texto selecionado",
      "ru-RU": "Поделиться выделенным текстом",
      "zh-TW": "分享選中文字",
    }, locale),
    refresh: lang({
      "zh-CN": "刷新",
      "en-US": "Refresh",
      "ja-JP": "更新",
      "ko-KR": "새로고침",
      "fr-FR": "Actualiser",
      "es-ES": "Actualizar",
      "de-DE": "Aktualisieren",
      "pt-BR": "Atualizar",
      "ru-RU": "Обновить",
      "zh-TW": "重新整理",
    }, locale),
    back: lang({
      "zh-CN": "后退",
      "en-US": "Back",
      "ja-JP": "戻る",
      "ko-KR": "뒤로",
      "fr-FR": "Retour",
      "es-ES": "Atrás",
      "de-DE": "Zurück",
      "pt-BR": "Voltar",
      "ru-RU": "Назад",
      "zh-TW": "返回",
    }, locale),
    forward: lang({
      "zh-CN": "前进",
      "en-US": "Forward",
      "ja-JP": "進む",
      "ko-KR": "앞으로",
      "fr-FR": "Suivant",
      "es-ES": "Adelante",
      "de-DE": "Vorwärts",
      "pt-BR": "Avançar",
      "ru-RU": "Вперед",
      "zh-TW": "前進",
    }, locale),
    home: lang({
      "zh-CN": "首页",
      "en-US": "Home",
      "ja-JP": "ホーム",
      "ko-KR": "홈",
      "fr-FR": "Accueil",
      "es-ES": "Inicio",
      "de-DE": "Startseite",
      "pt-BR": "Início",
      "ru-RU": "Главная",
      "zh-TW": "首頁",
    }, locale),
    bookmark: lang({
      "zh-CN": "添加书签",
      "en-US": "Add bookmark",
      "ja-JP": "ブックマークを追加",
      "ko-KR": "북마크 추가",
      "fr-FR": "Ajouter un signet",
      "es-ES": "Añadir marcador",
      "de-DE": "Lesezeichen hinzufügen",
      "pt-BR": "Adicionar favorito",
      "ru-RU": "Добавить закладку",
      "zh-TW": "加入書籤",
    }, locale),
  };

  return (
    <ShadcnContextMenu onOpenChange={setIsMenuOpen}>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* 导航相关 */}
        <ContextMenuItem onClick={handleBack} disabled={!canGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {texts.back}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleForward} disabled={!canGoForward}>
          <ArrowRight className="mr-2 h-4 w-4" />
          {texts.forward}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {texts.refresh}
          <ContextMenuShortcut>F5</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleHome}>
          <Home className="mr-2 h-4 w-4" />
          {texts.home}
        </ContextMenuItem>
        
        <ContextMenuSeparator />

        {/* 编辑相关 */}
        {selectedText && (
          <ContextMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            {texts.copy}
            <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={handlePaste}>
          <ClipboardPaste className="mr-2 h-4 w-4" />
          {texts.paste}
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>

        {/* 搜索相关 */}
        {selectedText && (
          <ContextMenuItem onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            {texts.searchText} &quot;{selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}&quot;
          </ContextMenuItem>
        )}

        {/* 链接相关 */}
        {contextUrl && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleOpenLink}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {texts.openLink}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleOpenInNewTab}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {texts.openInNewTab}
              <ContextMenuShortcut>Ctrl+Click</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />

        {/* 功能相关 */}
        <ContextMenuItem onClick={handleCreatePost}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          {texts.createPost}
        </ContextMenuItem>

        {/* 分享功能 - 使用普通菜单项而非子菜单 */}
        <ContextMenuItem onClick={handleShareUrl}>
          <Share2 className="mr-2 h-4 w-4" />
          {texts.shareUrl}
        </ContextMenuItem>

        {selectedText && (
          <ContextMenuItem onClick={handleShareText}>
            <Share2 className="mr-2 h-4 w-4" />
            {texts.shareText}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ShadcnContextMenu>
  );
}
