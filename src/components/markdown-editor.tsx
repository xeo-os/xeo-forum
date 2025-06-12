'use client';

import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import lang from '@/lib/lang';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  locale: string;
}

export function MarkdownEditor({ value, onChange, locale }: MarkdownEditorProps) {
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const text = selectedText || placeholder;
    
    const newValue = value.substring(0, start) + before + text + after + value.substring(end);
    onChange(newValue);
    
    // 重新设置光标位置
    setTimeout(() => {
      const newStart = start + before.length;
      const newEnd = newStart + text.length;
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const tools = [
    {
      icon: Heading1,
      label: lang({
        'zh-CN': '一级标题',
        'en-US': 'Heading 1',
        'zh-TW': '一級標題',
        'es-ES': 'Encabezado 1',
        'fr-FR': 'Titre 1',
        'ru-RU': 'Заголовок 1',
        'ja-JP': '見出し1',
        'de-DE': 'Überschrift 1',
        'pt-BR': 'Título 1',
        'ko-KR': '제목 1',
      }, locale),
      action: () => insertMarkdown('# ', '', '标题'),
    },
    {
      icon: Heading2,
      label: lang({
        'zh-CN': '二级标题',
        'en-US': 'Heading 2',
        'zh-TW': '二級標題',
        'es-ES': 'Encabezado 2',
        'fr-FR': 'Titre 2',
        'ru-RU': 'Заголовок 2',
        'ja-JP': '見出し2',
        'de-DE': 'Überschrift 2',
        'pt-BR': 'Título 2',
        'ko-KR': '제목 2',
      }, locale),
      action: () => insertMarkdown('## ', '', '标题'),
    },
    {
      icon: Heading3,
      label: lang({
        'zh-CN': '三级标题',
        'en-US': 'Heading 3',
        'zh-TW': '三級標題',
        'es-ES': 'Encabezado 3',
        'fr-FR': 'Titre 3',
        'ru-RU': 'Заголовок 3',
        'ja-JP': '見出し3',
        'de-DE': 'Überschrift 3',
        'pt-BR': 'Título 3',
        'ko-KR': '제목 3',
      }, locale),
      action: () => insertMarkdown('### ', '', '标题'),
    },
    {
      icon: Bold,
      label: lang({
        'zh-CN': '粗体',
        'en-US': 'Bold',
        'zh-TW': '粗體',
        'es-ES': 'Negrita',
        'fr-FR': 'Gras',
        'ru-RU': 'Жирный',
        'ja-JP': '太字',
        'de-DE': 'Fett',
        'pt-BR': 'Negrito',
        'ko-KR': '굵게',
      }, locale),
      action: () => insertMarkdown('**', '**', '粗体文字'),
    },
    {
      icon: Italic,
      label: lang({
        'zh-CN': '斜体',
        'en-US': 'Italic',
        'zh-TW': '斜體',
        'es-ES': 'Cursiva',
        'fr-FR': 'Italique',
        'ru-RU': 'Курсив',
        'ja-JP': '斜体',
        'de-DE': 'Kursiv',
        'pt-BR': 'Itálico',
        'ko-KR': '기울임',
      }, locale),
      action: () => insertMarkdown('*', '*', '斜体文字'),
    },
    {
      icon: Code,
      label: lang({
        'zh-CN': '代码',
        'en-US': 'Code',
        'zh-TW': '代碼',
        'es-ES': 'Código',
        'fr-FR': 'Code',
        'ru-RU': 'Код',
        'ja-JP': 'コード',
        'de-DE': 'Code',
        'pt-BR': 'Código',
        'ko-KR': '코드',
      }, locale),
      action: () => insertMarkdown('`', '`', '代码'),
    },
    {
      icon: Quote,
      label: lang({
        'zh-CN': '引用',
        'en-US': 'Quote',
        'zh-TW': '引用',
        'es-ES': 'Cita',
        'fr-FR': 'Citation',
        'ru-RU': 'Цитата',
        'ja-JP': '引用',
        'de-DE': 'Zitat',
        'pt-BR': 'Citação',
        'ko-KR': '인용',
      }, locale),
      action: () => insertMarkdown('> ', '', '引用文字'),
    },
    {
      icon: List,
      label: lang({
        'zh-CN': '无序列表',
        'en-US': 'Bullet List',
        'zh-TW': '無序列表',
        'es-ES': 'Lista con viñetas',
        'fr-FR': 'Liste à puces',
        'ru-RU': 'Маркированный список',
        'ja-JP': '箇条書きリスト',
        'de-DE': 'Aufzählungsliste',
        'pt-BR': 'Lista com marcadores',
        'ko-KR': '글머리 기호 목록',
      }, locale),
      action: () => insertMarkdown('- ', '', '列表项'),
    },
    {
      icon: ListOrdered,
      label: lang({
        'zh-CN': '有序列表',
        'en-US': 'Numbered List',
        'zh-TW': '有序列表',
        'es-ES': 'Lista numerada',
        'fr-FR': 'Liste numérotée',
        'ru-RU': 'Нумерованный список',
        'ja-JP': '番号付きリスト',
        'de-DE': 'Nummerierte Liste',
        'pt-BR': 'Lista numerada',
        'ko-KR': '번호 매기기 목록',
      }, locale),
      action: () => insertMarkdown('1. ', '', '列表项'),
    },
    {
      icon: Link,
      label: lang({
        'zh-CN': '链接',
        'en-US': 'Link',
        'zh-TW': '鏈接',
        'es-ES': 'Enlace',
        'fr-FR': 'Lien',
        'ru-RU': 'Ссылка',
        'ja-JP': 'リンク',
        'de-DE': 'Link',
        'pt-BR': 'Link',
        'ko-KR': '링크',
      }, locale),
      action: () => insertMarkdown('[', '](https://example.com)', '链接文字'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/30">
      {tools.map((tool, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={tool.action}
          className="h-8 w-8 p-0"
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
