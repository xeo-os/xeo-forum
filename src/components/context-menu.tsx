"use client";

import { useState, useEffect } from "react";
import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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
  BookmarkPlus,
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

  const texts = {
    copy: lang({ "zh-CN": "复制", "en-US": "Copy" }, locale),
    paste: lang({ "zh-CN": "粘贴", "en-US": "Paste" }, locale),
    searchText: lang({ "zh-CN": "搜索", "en-US": "Search for" }, locale),
    openLink: lang({ "zh-CN": "打开链接", "en-US": "Open link" }, locale),
    openInNewTab: lang({ "zh-CN": "在新标签页中打开", "en-US": "Open in new tab" }, locale),
    createPost: lang({ "zh-CN": "创建新帖子", "en-US": "Create new post" }, locale),
    share: lang({ "zh-CN": "分享", "en-US": "Share" }, locale),
    shareUrl: lang({ "zh-CN": "分享页面链接", "en-US": "Share page URL" }, locale),
    refresh: lang({ "zh-CN": "刷新", "en-US": "Refresh" }, locale),
    back: lang({ "zh-CN": "后退", "en-US": "Back" }, locale),
    forward: lang({ "zh-CN": "前进", "en-US": "Forward" }, locale),
    home: lang({ "zh-CN": "首页", "en-US": "Home" }, locale),
    bookmark: lang({ "zh-CN": "添加书签", "en-US": "Add bookmark" }, locale),
  };

  return (
    <ShadcnContextMenu>
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
            {texts.searchText} "{selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}"
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

        <ContextMenuItem onClick={() => {
          try {
            (window as any).external?.AddFavorite?.(window.location.href, document.title);
          } catch {
            toast.info(lang({
              "zh-CN": "请使用 Ctrl+D 添加书签",
              "en-US": "Please use Ctrl+D to add bookmark",
            }, locale));
          }
        }}>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          {texts.bookmark}
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ShadcnContextMenu>
  );
}
