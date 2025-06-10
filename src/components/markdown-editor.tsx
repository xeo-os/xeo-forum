"use client";

import { Button } from "@/components/ui/button";
import { 
  RiBold, 
  RiItalic, 
  RiLinkM, 
  RiH1, 
  RiH2, 
  RiH3,
  RiDoubleQuotesL,
  RiCodeSSlashLine,
  RiListUnordered,
  RiListOrdered
} from "@remixicon/react";
import lang from "@/lib/lang";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  locale: string;
}

export function MarkdownEditor({ value, onChange, locale }: MarkdownEditorProps) {
  const insertMarkdown = (before: string, after: string = "", placeholder?: string) => {
    const textarea = document.querySelector('#content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = selectedText || placeholder || "";
    
    const newValue = 
      value.substring(0, start) + 
      before + 
      replacement + 
      after + 
      value.substring(end);
    
    onChange(newValue);
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + replacement.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const tools = [
    {
      name: lang({
        "zh-CN": "粗体",
        "zh-TW": "粗體",
        "en-US": "Bold",
        "es-ES": "Negrita",
        "fr-FR": "Gras",
        "ru-RU": "Жирный",
        "ja-JP": "太字",
        "de-DE": "Fett",
        "pt-BR": "Negrito",
        "ko-KR": "굵게",
      }, locale),
      icon: RiBold,
      action: () => insertMarkdown("**", "**", lang({
        "zh-CN": "粗体文字",
        "zh-TW": "粗體文字",
        "en-US": "bold text",
        "es-ES": "texto en negrita",
        "fr-FR": "texte en gras",
        "ru-RU": "жирный текст",
        "ja-JP": "太字テキスト",
        "de-DE": "fetter Text",
        "pt-BR": "texto em negrito",
        "ko-KR": "굵은 텍스트",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "斜体",
        "zh-TW": "斜體",
        "en-US": "Italic",
        "es-ES": "Cursiva",
        "fr-FR": "Italique",
        "ru-RU": "Курсив",
        "ja-JP": "斜体",
        "de-DE": "Kursiv",
        "pt-BR": "Itálico",
        "ko-KR": "기울임",
      }, locale),
      icon: RiItalic,
      action: () => insertMarkdown("*", "*", lang({
        "zh-CN": "斜体文字",
        "zh-TW": "斜體文字",
        "en-US": "italic text",
        "es-ES": "texto en cursiva",
        "fr-FR": "texte en italique",
        "ru-RU": "курсивный текст",
        "ja-JP": "斜体テキスト",
        "de-DE": "kursiver Text",
        "pt-BR": "texto em itálico",
        "ko-KR": "기울임 텍스트",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "一级标题",
        "zh-TW": "一級標題",
        "en-US": "Heading 1",
        "es-ES": "Encabezado 1",
        "fr-FR": "Titre 1",
        "ru-RU": "Заголовок 1",
        "ja-JP": "見出し1",
        "de-DE": "Überschrift 1",
        "pt-BR": "Cabeçalho 1",
        "ko-KR": "제목 1",
      }, locale),
      icon: RiH1,
      action: () => insertMarkdown("# ", "", lang({
        "zh-CN": "标题",
        "zh-TW": "標題",
        "en-US": "heading",
        "es-ES": "encabezado",
        "fr-FR": "titre",
        "ru-RU": "заголовок",
        "ja-JP": "見出し",
        "de-DE": "Überschrift",
        "pt-BR": "cabeçalho",
        "ko-KR": "제목",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "二级标题",
        "zh-TW": "二級標題",
        "en-US": "Heading 2",
        "es-ES": "Encabezado 2",
        "fr-FR": "Titre 2",
        "ru-RU": "Заголовок 2",
        "ja-JP": "見出し2",
        "de-DE": "Überschrift 2",
        "pt-BR": "Cabeçalho 2",
        "ko-KR": "제목 2",
      }, locale),
      icon: RiH2,
      action: () => insertMarkdown("## ", "", lang({
        "zh-CN": "标题",
        "zh-TW": "標題",
        "en-US": "heading",
        "es-ES": "encabezado",
        "fr-FR": "titre",
        "ru-RU": "заголовок",
        "ja-JP": "見出し",
        "de-DE": "Überschrift",
        "pt-BR": "cabeçalho",
        "ko-KR": "제목",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "三级标题",
        "zh-TW": "三級標題",
        "en-US": "Heading 3",
        "es-ES": "Encabezado 3",
        "fr-FR": "Titre 3",
        "ru-RU": "Заголовок 3",
        "ja-JP": "見出し3",
        "de-DE": "Überschrift 3",
        "pt-BR": "Cabeçalho 3",
        "ko-KR": "제목 3",
      }, locale),
      icon: RiH3,
      action: () => insertMarkdown("### ", "", lang({
        "zh-CN": "标题",
        "zh-TW": "標題",
        "en-US": "heading",
        "es-ES": "encabezado",
        "fr-FR": "titre",
        "ru-RU": "заголовок",
        "ja-JP": "見出し",
        "de-DE": "Überschrift",
        "pt-BR": "cabeçalho",
        "ko-KR": "제목",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "链接",
        "zh-TW": "鏈接",
        "en-US": "Link",
        "es-ES": "Enlace",
        "fr-FR": "Lien",
        "ru-RU": "Ссылка",
        "ja-JP": "リンク",
        "de-DE": "Link",
        "pt-BR": "Link",
        "ko-KR": "링크",
      }, locale),
      icon: RiLinkM,
      action: () => insertMarkdown("[", "](https://)", lang({
        "zh-CN": "链接文字",
        "zh-TW": "鏈接文字",
        "en-US": "link text",
        "es-ES": "texto del enlace",
        "fr-FR": "texte du lien",
        "ru-RU": "текст ссылки",
        "ja-JP": "リンクテキスト",
        "de-DE": "Link-Text",
        "pt-BR": "texto do link",
        "ko-KR": "링크 텍스트",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "引用",
        "zh-TW": "引用",
        "en-US": "Quote",
        "es-ES": "Cita",
        "fr-FR": "Citation",
        "ru-RU": "Цитата",
        "ja-JP": "引用",
        "de-DE": "Zitat",
        "pt-BR": "Citação",
        "ko-KR": "인용",
      }, locale),
      icon: RiDoubleQuotesL,
      action: () => insertMarkdown("> ", "", lang({
        "zh-CN": "引用内容",
        "zh-TW": "引用內容",
        "en-US": "quoted text",
        "es-ES": "texto citado",
        "fr-FR": "texte cité",
        "ru-RU": "цитируемый текст",
        "ja-JP": "引用テキスト",
        "de-DE": "zitierter Text",
        "pt-BR": "texto citado",
        "ko-KR": "인용 텍스트",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "代码",
        "zh-TW": "代碼",
        "en-US": "Code",
        "es-ES": "Código",
        "fr-FR": "Code",
        "ru-RU": "Код",
        "ja-JP": "コード",
        "de-DE": "Code",
        "pt-BR": "Código",
        "ko-KR": "코드",
      }, locale),
      icon: RiCodeSSlashLine,
      action: () => insertMarkdown("`", "`", lang({
        "zh-CN": "代码",
        "zh-TW": "代碼",
        "en-US": "code",
        "es-ES": "código",
        "fr-FR": "code",
        "ru-RU": "код",
        "ja-JP": "コード",
        "de-DE": "Code",
        "pt-BR": "código",
        "ko-KR": "코드",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "无序列表",
        "zh-TW": "無序列表",
        "en-US": "Unordered List",
        "es-ES": "Lista Sin Orden",
        "fr-FR": "Liste Non Ordonnée",
        "ru-RU": "Неупорядоченный Список",
        "ja-JP": "順序なしリスト",
        "de-DE": "Ungeordnete Liste",
        "pt-BR": "Lista Não Ordenada",
        "ko-KR": "순서 없는 목록",
      }, locale),
      icon: RiListUnordered,
      action: () => insertMarkdown("- ", "", lang({
        "zh-CN": "列表项",
        "zh-TW": "列表項",
        "en-US": "list item",
        "es-ES": "elemento de lista",
        "fr-FR": "élément de liste",
        "ru-RU": "элемент списка",
        "ja-JP": "リスト項目",
        "de-DE": "Listenelement",
        "pt-BR": "item da lista",
        "ko-KR": "목록 항목",
      }, locale)),
    },
    {
      name: lang({
        "zh-CN": "有序列表",
        "zh-TW": "有序列表",
        "en-US": "Ordered List",
        "es-ES": "Lista Ordenada",
        "fr-FR": "Liste Ordonnée",
        "ru-RU": "Упорядоченный Список",
        "ja-JP": "순서付きリスト",
        "de-DE": "Geordnete Liste",
        "pt-BR": "Lista Ordenada",
        "ko-KR": "순서 있는 목록",
      }, locale),
      icon: RiListOrdered,
      action: () => insertMarkdown("1. ", "", lang({
        "zh-CN": "列表项",
        "zh-TW": "列表項",
        "en-US": "list item",
        "es-ES": "elemento de lista",
        "fr-FR": "élément de liste",
        "ru-RU": "элемент списка",
        "ja-JP": "リスト項目",
        "de-DE": "Listenelement",
        "pt-BR": "item da lista",
        "ko-KR": "목록 항목",
      }, locale)),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-3 border rounded-lg bg-muted/20 backdrop-blur-sm">
      {tools.map((tool) => (
        <Button
          key={tool.name}
          variant="ghost"
          size="sm"
          onClick={tool.action}
          title={tool.name}
          className="h-8 w-8 p-0 hover:bg-[#f0b100]/10 hover:text-[#f0b100] transition-all duration-200 rounded-md"
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
