'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
    Bold, 
    Italic, 
    Code, 
    Link, 
    List, 
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Strikethrough,
    Quote,
    Code2,
    Eye,
    Edit3,
    LucideIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import lang from '@/lib/lang';
import { EmojiPicker } from '@/components/emoji-picker';
import { markdownToHtmlSync } from '@/lib/markdown-utils';

type ToolbarButton = {
    icon: LucideIcon;
    label: string;
    action: () => void;
} | {
    type: 'separator';
};

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    locale: string;
    placeholder?: string;
    maxLength?: number;
    className?: string;
}

export function MarkdownEditor({ 
    value, 
    onChange, 
    locale, 
    placeholder,
    maxLength = 200,
    className = ''
}: MarkdownEditorProps) {
    const [editMode, setEditMode] = useState<'markdown' | 'visual'>('markdown');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 插入文本到光标位置 - 使用原生方法保持撤销历史
    const insertText = useCallback((before: string, after: string = '', placeholderText: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // 获取当前选择
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const textToInsert = selectedText || placeholderText;
        const newText = before + textToInsert + after;

        // 使用浏览器原生API来保持撤销历史
        textarea.focus();
        
        // 如果浏览器支持execCommand，使用它来保持撤销历史
        if (document.execCommand) {
            // 选中要替换的文本
            textarea.setSelectionRange(start, end);
            
            // 使用execCommand插入文本，这样可以保持撤销历史
            document.execCommand('insertText', false, newText);
            
            // 设置新的光标位置
            const newCursorPos = start + before.length + textToInsert.length;
            setTimeout(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        } else {
            // 如果不支持execCommand，使用现代API
            const newValue = value.substring(0, start) + newText + value.substring(end);
            
            // 创建一个输入事件来模拟用户输入，保持撤销历史
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: newText
            });
            
            // 更新值
            onChange(newValue);
            
            // 触发输入事件
            textarea.dispatchEvent(inputEvent);
            
            // 设置新的光标位置
            setTimeout(() => {
                const newCursorPos = start + before.length + textToInsert.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
            }, 0);
        }
    }, [value, onChange]);

    // 工具栏按钮配置
    const toolbarButtons: ToolbarButton[] = [
        {
            icon: Heading1,
            label: lang({
                'zh-CN': '标题1',
                'zh-TW': '標題1',
                'en-US': 'Heading 1',
                'es-ES': 'Encabezado 1',
                'fr-FR': 'Titre 1',
                'ru-RU': 'Заголовок 1',
                'ja-JP': '見出し1',
                'de-DE': 'Überschrift 1',
                'pt-BR': 'Título 1',
                'ko-KR': '제목 1'
            }, locale),
            action: () => insertText('# ', '', lang({
                'zh-CN': '标题',
                'zh-TW': '標題',
                'en-US': 'Heading',
                'es-ES': 'Encabezado',
                'fr-FR': 'Titre',
                'ru-RU': 'Заголовок',
                'ja-JP': '見出し',
                'de-DE': 'Überschrift',
                'pt-BR': 'Título',
                'ko-KR': '제목'
            }, locale))
        },
        {
            icon: Heading2,
            label: lang({
                'zh-CN': '标题2',
                'zh-TW': '標題2',
                'en-US': 'Heading 2',
                'es-ES': 'Encabezado 2',
                'fr-FR': 'Titre 2',
                'ru-RU': 'Заголовок 2',
                'ja-JP': '見出し2',
                'de-DE': 'Überschrift 2',
                'pt-BR': 'Título 2',
                'ko-KR': '제목 2'
            }, locale),
            action: () => insertText('## ', '', lang({
                'zh-CN': '子标题',
                'zh-TW': '子標題',
                'en-US': 'Subheading',
                'es-ES': 'Subtítulo',
                'fr-FR': 'Sous-titre',
                'ru-RU': 'Подзаголовок',
                'ja-JP': 'サブ見出し',
                'de-DE': 'Untertitel',
                'pt-BR': 'Subtítulo',
                'ko-KR': '부제목'
            }, locale))
        },
        { type: 'separator' },
        {
            icon: Bold,
            label: lang({
                'zh-CN': '粗体',
                'zh-TW': '粗體',
                'en-US': 'Bold',
                'es-ES': 'Negrita',
                'fr-FR': 'Gras',
                'ru-RU': 'Жирный',
                'ja-JP': '太字',
                'de-DE': 'Fett',
                'pt-BR': 'Negrito',
                'ko-KR': '굵게'
            }, locale),
            action: () => insertText('**', '**', lang({
                'zh-CN': '粗体文本',
                'zh-TW': '粗體文本',
                'en-US': 'bold text',
                'es-ES': 'texto en negrita',
                'fr-FR': 'texte en gras',
                'ru-RU': 'жирный текст',
                'ja-JP': '太字テキスト',
                'de-DE': 'fetter Text',
                'pt-BR': 'texto em negrito',
                'ko-KR': '굵은 텍스트'
            }, locale))
        },
        {
            icon: Italic,
            label: lang({
                'zh-CN': '斜体',
                'zh-TW': '斜體',
                'en-US': 'Italic',
                'es-ES': 'Cursiva',
                'fr-FR': 'Italique',
                'ru-RU': 'Курсив',
                'ja-JP': '斜体',
                'de-DE': 'Kursiv',
                'pt-BR': 'Itálico',
                'ko-KR': '기울임'
            }, locale),
            action: () => insertText('*', '*', lang({
                'zh-CN': '斜体文本',
                'zh-TW': '斜體文本',
                'en-US': 'italic text',
                'es-ES': 'texto en cursiva',
                'fr-FR': 'texte en italique',
                'ru-RU': 'курсивный текст',
                'ja-JP': '斜体テキスト',
                'de-DE': 'kursiver Text',
                'pt-BR': 'texto em itálico',
                'ko-KR': '기울임 텍스트'
            }, locale))
        },
        {
            icon: Strikethrough,
            label: lang({
                'zh-CN': '删除线',
                'zh-TW': '刪除線',
                'en-US': 'Strikethrough',
                'es-ES': 'Tachado',
                'fr-FR': 'Barré',
                'ru-RU': 'Зачеркнутый',
                'ja-JP': '取り消し線',
                'de-DE': 'Durchgestrichen',
                'pt-BR': 'Riscado',
                'ko-KR': '취소선'
            }, locale),
            action: () => insertText('~~', '~~', lang({
                'zh-CN': '删除的文本',
                'zh-TW': '刪除的文本',
                'en-US': 'deleted text',
                'es-ES': 'texto eliminado',
                'fr-FR': 'texte supprimé',
                'ru-RU': 'удаленный текст',
                'ja-JP': '削除されたテキスト',
                'de-DE': 'gelöschter Text',
                'pt-BR': 'texto excluído',
                'ko-KR': '삭제된 텍스트'
            }, locale))
        },
        { type: 'separator' },
        {
            icon: Link,
            label: lang({
                'zh-CN': '链接',
                'zh-TW': '鏈接',
                'en-US': 'Link',
                'es-ES': 'Enlace',
                'fr-FR': 'Lien',
                'ru-RU': 'Ссылка',
                'ja-JP': 'リンク',
                'de-DE': 'Link',
                'pt-BR': 'Link',
                'ko-KR': '링크'
            }, locale),
            action: () => insertText('[', '](https://)', lang({
                'zh-CN': '链接文本',
                'zh-TW': '鏈接文本',
                'en-US': 'link text',
                'es-ES': 'texto del enlace',
                'fr-FR': 'texte du lien',
                'ru-RU': 'текст ссылки',
                'ja-JP': 'リンクテキスト',
                'de-DE': 'Link-Text',
                'pt-BR': 'texto do link',
                'ko-KR': '링크 텍스트'
            }, locale))
        },
        {
            icon: Code,
            label: lang({
                'zh-CN': '行内代码',
                'zh-TW': '行內代碼',
                'en-US': 'Inline Code',
                'es-ES': 'Código en línea',
                'fr-FR': 'Code en ligne',
                'ru-RU': 'Встроенный код',
                'ja-JP': 'インラインコード',
                'de-DE': 'Inline-Code',
                'pt-BR': 'Código inline',
                'ko-KR': '인라인 코드'
            }, locale),
            action: () => insertText('`', '`', lang({
                'zh-CN': '代码',
                'zh-TW': '代碼',
                'en-US': 'code',
                'es-ES': 'código',
                'fr-FR': 'code',
                'ru-RU': 'код',
                'ja-JP': 'コード',
                'de-DE': 'Code',
                'pt-BR': 'código',
                'ko-KR': '코드'
            }, locale))
        },
        {
            icon: Code2,
            label: lang({
                'zh-CN': '代码块',
                'zh-TW': '代碼塊',
                'en-US': 'Code Block',
                'es-ES': 'Bloque de código',
                'fr-FR': 'Bloc de code',
                'ru-RU': 'Блок кода',
                'ja-JP': 'コードブロック',
                'de-DE': 'Code-Block',
                'pt-BR': 'Bloco de código',
                'ko-KR': '코드 블록'
            }, locale),
            action: () => insertText('```\n', '\n```', lang({
                'zh-CN': '在这里输入代码',
                'zh-TW': '在這裡輸入代碼',
                'en-US': 'enter your code here',
                'es-ES': 'ingrese su código aquí',
                'fr-FR': 'entrez votre code ici',
                'ru-RU': 'введите ваш код здесь',
                'ja-JP': 'ここにコードを入力',
                'de-DE': 'geben Sie hier Ihren Code ein',
                'pt-BR': 'digite seu código aqui',
                'ko-KR': '여기에 코드를 입력하세요'
            }, locale))
        },
        { type: 'separator' },
        {
            icon: List,
            label: lang({
                'zh-CN': '无序列表',
                'zh-TW': '無序列表',
                'en-US': 'Bullet List',
                'es-ES': 'Lista con viñetas',
                'fr-FR': 'Liste à puces',
                'ru-RU': 'Маркированный список',
                'ja-JP': '箇条書きリスト',
                'de-DE': 'Aufzählungsliste',
                'pt-BR': 'Lista com marcadores',
                'ko-KR': '글머리 기호 목록'
            }, locale),
            action: () => insertText('- ', '', lang({
                'zh-CN': '列表项',
                'zh-TW': '列表項',
                'en-US': 'list item',
                'es-ES': 'elemento de lista',
                'fr-FR': 'élément de liste',
                'ru-RU': 'элемент списка',
                'ja-JP': 'リスト項目',
                'de-DE': 'Listenelement',
                'pt-BR': 'item da lista',
                'ko-KR': '목록 항목'
            }, locale))
        },
        {
            icon: ListOrdered,
            label: lang({
                'zh-CN': '有序列表',
                'zh-TW': '有序列表',
                'en-US': 'Numbered List',
                'es-ES': 'Lista numerada',
                'fr-FR': 'Liste numérotée',
                'ru-RU': 'Нумерованный список',
                'ja-JP': '番号付きリスト',
                'de-DE': 'Nummerierte Liste',
                'pt-BR': 'Lista numerada',
                'ko-KR': '번호 매기기 목록'
            }, locale),
            action: () => insertText('1. ', '', lang({
                'zh-CN': '列表项',
                'zh-TW': '列表項',
                'en-US': 'list item',
                'es-ES': 'elemento de lista',
                'fr-FR': 'élément de liste',
                'ru-RU': 'элемент списка',
                'ja-JP': 'リスト項目',
                'de-DE': 'Listenelement',
                'pt-BR': 'item da lista',
                'ko-KR': '목록 항목'
            }, locale))
        },
        {
            icon: Quote,
            label: lang({
                'zh-CN': '引用',
                'zh-TW': '引用',
                'en-US': 'Quote',
                'es-ES': 'Cita',
                'fr-FR': 'Citation',
                'ru-RU': 'Цитата',
                'ja-JP': '引用',
                'de-DE': 'Zitat',
                'pt-BR': 'Citação',
                'ko-KR': '인용'
            }, locale),
            action: () => insertText('> ', '', lang({
                'zh-CN': '引用文本',
                'zh-TW': '引用文本',
                'en-US': 'quoted text',
                'es-ES': 'texto citado',
                'fr-FR': 'texte cité',
                'ru-RU': 'цитируемый текст',
                'ja-JP': '引用テキスト',
                'de-DE': 'zitierter Text',
                'pt-BR': 'texto citado',
                'ko-KR': '인용된 텍스트'
            }, locale))
        }
    ];

    // 插入表情符号 - 同样使用原生方法
    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        textarea.focus();
        
        if (document.execCommand) {
            // 选中当前位置
            textarea.setSelectionRange(start, end);
            // 使用execCommand插入emoji
            document.execCommand('insertText', false, emoji);
        } else {
            // 现代API方法
            const newValue = value.substring(0, start) + emoji + value.substring(end);
            
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: emoji
            });
            
            onChange(newValue);
            textarea.dispatchEvent(inputEvent);
            
            setTimeout(() => {
                const newCursorPos = start + emoji.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
            }, 0);
        }
    };

    return (
        <div className={`border-2 rounded-lg overflow-hidden bg-background transition-colors ${className}`}>
            {/* 模式切换标签 - 移到顶部 */}
            <div className="border-b bg-muted/30 flex-shrink-0 relative">
                <div className="flex w-full">
                    <motion.div 
                        className="flex-1 relative"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditMode('markdown')}
                            className={`w-full h-12 rounded-none transition-all duration-200 ${
                                editMode === 'markdown'
                                    ? 'text-[#f0b100] bg-background/50 font-medium'
                                    : 'text-muted-foreground hover:text-[#f0b100] hover:bg-background/30'
                            }`}
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            {lang({
                                'zh-CN': '编辑',
                                'zh-TW': '編輯',
                                'en-US': 'Edit',
                                'es-ES': 'Editar',
                                'fr-FR': 'Modifier',
                                'ru-RU': 'Редактировать',
                                'ja-JP': '編集',
                                'de-DE': 'Bearbeiten',
                                'pt-BR': 'Editar',
                                'ko-KR': '편집'
                            }, locale)}
                        </Button>
                    </motion.div>
                    
                    <motion.div 
                        className="flex-1 relative"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditMode('visual')}
                            className={`w-full h-12 rounded-none transition-all duration-200 ${
                                editMode === 'visual'
                                    ? 'text-[#f0b100] bg-background/50 font-medium'
                                    : 'text-muted-foreground hover:text-[#f0b100] hover:bg-background/30'
                            }`}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {lang({
                                'zh-CN': '预览',
                                'zh-TW': '預覽',
                                'en-US': 'Preview',
                                'es-ES': 'Vista Previa',
                                'fr-FR': 'Aperçu',
                                'ru-RU': 'Предпросмотр',
                                'ja-JP': 'プレビュー',
                                'de-DE': 'Vorschau',
                                'pt-BR': 'Visualizar',
                                'ko-KR': '미리보기'
                            }, locale)}
                        </Button>
                    </motion.div>
                </div>
                
                {/* 滑动指示器 */}
                <motion.div
                    className="absolute bottom-0 h-0.5 bg-[#f0b100]"
                    initial={false}
                    animate={{
                        x: editMode === 'markdown' ? '0%' : '100%',
                        width: '50%'
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* 工具栏 - 只在编辑模式下显示 */}
            <motion.div
                initial={false}
                animate={{
                    height: editMode === 'markdown' ? 'auto' : 0,
                    opacity: editMode === 'markdown' ? 1 : 0
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                }}
                className="overflow-hidden border-b bg-muted/30"
            >
                <div className="p-2">
                    <div className="flex flex-wrap items-center gap-1">
                        {toolbarButtons.map((button, index) => {
                            if ('type' in button && button.type === 'separator') {
                                return <Separator key={index} orientation="vertical" className="h-6 mx-1" />;
                            }
                            
                            // Type assertion since we know this is not a separator
                            const iconButton = button as { icon: LucideIcon; label: string; action: () => void };
                            const IconComponent = iconButton.icon;
                            return (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={iconButton.action}
                                        className="h-8 w-8 p-0 hover:bg-[#f0b100]/10 hover:text-[#f0b100] transition-colors"
                                        title={iconButton.label}
                                    >
                                        <IconComponent className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            );
                        })}
                        
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        
                        {/* Emoji Picker */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <EmojiPicker
                                onEmojiSelect={insertEmoji}
                                locale={locale}
                                className="h-8 w-8 hover:bg-[#f0b100]/10 hover:text-[#f0b100] transition-colors"
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* 内容区域 */}
            <div className="h-[350px] flex flex-col relative overflow-hidden">
                <motion.div
                    key="markdown"
                    initial={false}
                    animate={{
                        x: editMode === 'markdown' ? '0%' : '-100%',
                        opacity: editMode === 'markdown' ? 1 : 0
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 flex flex-col"
                >
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder || lang({
                            'zh-CN': '分享你的想法，支持 Markdown 格式...',
                            'zh-TW': '分享你的想法，支持 Markdown 格式...',
                            'en-US': 'Share your thoughts, Markdown supported...',
                            'es-ES': 'Comparte tus pensamientos, Markdown compatible...',
                            'fr-FR': 'Partagez vos pensées, Markdown pris en charge...',
                            'ru-RU': 'Поделитесь своими мыслями, поддерживается Markdown...',
                            'ja-JP': 'あなたの考えを共有してください、Markdown対応...',
                            'de-DE': 'Teilen Sie Ihre Gedanken mit, Markdown unterstützt...',
                            'pt-BR': 'Compartilhe seus pensamentos, Markdown suportado...',
                            'ko-KR': '생각을 공유하세요, 마크다운 지원...'
                        }, locale)}
                        className="h-full resize-none border-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-sm md:text-base leading-relaxed p-4"
                        maxLength={maxLength}
                    />
                </motion.div>

                <motion.div
                    key="visual"
                    initial={false}
                    animate={{
                        x: editMode === 'visual' ? '0%' : '100%',
                        opacity: editMode === 'visual' ? 1 : 0
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 overflow-y-auto p-4"
                >
                    {value ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                delay: 0.1,
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{
                                __html: markdownToHtmlSync(value)
                            }}
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                delay: 0.1,
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
                            className="h-full flex items-center justify-center text-muted-foreground"
                        >
                            <div className="text-center">
                                <motion.div 
                                    className="text-2xl md:text-4xl mb-2 md:mb-4"
                                    animate={{ 
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                        ease: "easeInOut"
                                    }}
                                >
                                    📝
                                </motion.div>
                                <p className="text-sm md:text-base">
                                    {lang({
                                        'zh-CN': '在编辑模式中输入内容以查看预览',
                                        'zh-TW': '在編輯模式中輸入內容以查看預覽',
                                        'en-US': 'Enter content in edit mode to see preview',
                                        'es-ES': 'Ingrese contenido en modo de edición para ver la vista previa',
                                        'fr-FR': "Saisissez le contenu en mode d'édition pour voir l'aperçu",
                                        'ru-RU': 'Введите содержимое в режиме редактирования для предпросмотра',
                                        'ja-JP': '編集モードでコンテンツを入力してプレビューを表示',
                                        'de-DE': 'Geben Sie Inhalt im Bearbeitungsmodus ein, um die Vorschau zu sehen',
                                        'pt-BR': 'Digite o conteúdo no modo de edição para ver a visualização',
                                        'ko-KR': '미리보기를 보려면 편집 모드에서 내용을 입력하세요'
                                    }, locale)}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}