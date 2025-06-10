"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RiAddLine, RiSendPlaneLine, RiDraftLine, RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { motion, useDragControls } from "motion/react";
import { toast } from "sonner";
import lang from "@/lib/lang";
import { MarkdownEditor } from "@/components/markdown-editor";
import { EmojiPicker } from "@/components/emoji-picker";
import { markdownToHtml } from "@/lib/markdown-utils";

interface NewPostButtonProps {
  locale: string;
  topics: Array<{
    title: string;
    items?: Array<{
      title: string;
    }>;
  }>;
}

interface PostDraft {
  title: string;
  content: string;
  topic: string;
}

export function NewPostButton({ locale, topics }: NewPostButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [sheetHeight, setSheetHeight] = useState(80);
  const [isDragging, setIsDragging] = useState(false);
  const [topicPopoverOpen, setTopicPopoverOpen] = useState(false);
  
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = "xeo-forum-draft";

  // 从localStorage加载草稿
  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft: PostDraft = JSON.parse(stored);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setSelectedTopic(draft.topic || "");
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
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
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [title, content, selectedTopic]);

  // 清除草稿
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTitle("");
    setContent("");
    setSelectedTopic("");
  }, []);

  // 检查是否有草稿
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // 自动保存草稿
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, selectedTopic, saveDraft]);

  // 获取所有主题选项
  const getAllTopics = () => {
    const allTopics: string[] = [];
    topics.forEach((topic) => {
      if (topic.items) {
        topic.items.forEach((item) => {
          allTopics.push(item.title);
        });
      }
    });
    return allTopics;
  };

  // 验证表单
  const validateForm = () => {
    if (!title.trim()) {
      toast.error(lang({
        "zh-CN": "请输入标题",
        "zh-TW": "請輸入標題",
        "en-US": "Please enter a title",
        "es-ES": "Por favor ingrese un título",
        "fr-FR": "Veuillez saisir un titre",
        "ru-RU": "Пожалуйста, введите заголовок",
        "ja-JP": "タイトルを入力してください",
        "de-DE": "Bitte geben Sie einen Titel ein",
        "pt-BR": "Por favor, insira um título",
        "ko-KR": "제목을 입력해주세요",
      }, locale));
      return false;
    }

    if (title.length > 50) {
      toast.error(lang({
        "zh-CN": "标题不能超过50个字符",
        "zh-TW": "標題不能超過50個字符",
        "en-US": "Title cannot exceed 50 characters",
        "es-ES": "El título no puede exceder 50 caracteres",
        "fr-FR": "Le titre ne peut pas dépasser 50 caractères",
        "ru-RU": "Заголовок не может превышать 50 символов",
        "ja-JP": "タイトルは50文字を超えることはできません",
        "de-DE": "Der Titel darf 50 Zeichen nicht überschreiten",
        "pt-BR": "O título não pode exceder 50 caracteres",
        "ko-KR": "제목은 50자를 초과할 수 없습니다",
      }, locale));
      return false;
    }

    if (!content.trim()) {
      toast.error(lang({
        "zh-CN": "请输入内容",
        "zh-TW": "請輸入內容",
        "en-US": "Please enter content",
        "es-ES": "Por favor ingrese contenido",
        "fr-FR": "Veuillez saisir le contenu",
        "ru-RU": "Пожалуйста, введите содержание",
        "ja-JP": "内容を入力してください",
        "de-DE": "Bitte geben Sie Inhalt ein",
        "pt-BR": "Por favor, insira o conteúdo",
        "ko-KR": "내용을 입력해주세요",
      }, locale));
      return false;
    }

    if (content.length > 1000) {
      toast.error(lang({
        "zh-CN": "内容不能超过1000个字符",
        "zh-TW": "內容不能超過1000個字符",
        "en-US": "Content cannot exceed 1000 characters",
        "es-ES": "El contenido no puede exceder 1000 caracteres",
        "fr-FR": "Le contenu ne peut pas dépasser 1000 caractères",
        "ru-RU": "Содержание не может превышать 1000 символов",
        "ja-JP": "内容は1000文字を超えることはできません",
        "de-DE": "Der Inhalt darf 1000 Zeichen nicht überschreiten",
        "pt-BR": "O conteúdo não pode exceder 1000 caracteres",
        "ko-KR": "내용은 1000자를 초과할 수 없습니다",
      }, locale));
      return false;
    }

    if (!selectedTopic) {
      toast.error(lang({
        "zh-CN": "请选择主题",
        "zh-TW": "請選擇主題",
        "en-US": "Please select a topic",
        "es-ES": "Por favor seleccione un tema",
        "fr-FR": "Veuillez sélectionner un sujet",
        "ru-RU": "Пожалуйста, выберите тему",
        "ja-JP": "トピックを選択してください",
        "de-DE": "Bitte wählen Sie ein Thema",
        "pt-BR": "Por favor, selecione um tópico",
        "ko-KR": "주제를 선택해주세요",
      }, locale));
      return false;
    }

    return true;
  };

  // 提交帖子
  const submitPost = async (isDraft: boolean) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          draft: isDraft,
          lang: locale,
        }),
      });

      const result = await response.json();

      if (result.message === "ok") {
        toast.success(lang({
          "zh-CN": isDraft ? "草稿已保存" : "帖子发布成功",
          "zh-TW": isDraft ? "草稿已保存" : "帖子發布成功",
          "en-US": isDraft ? "Draft saved" : "Post published successfully",
          "es-ES": isDraft ? "Borrador guardado" : "Publicación exitosa",
          "fr-FR": isDraft ? "Brouillon sauvegardé" : "Publication réussie",
          "ru-RU": isDraft ? "Черновик сохранен" : "Пост успешно опубликован",
          "ja-JP": isDraft ? "下書きが保存されました" : "投稿が正常に公開されました",
          "de-DE": isDraft ? "Entwurf gespeichert" : "Beitrag erfolgreich veröffentlicht",
          "pt-BR": isDraft ? "Rascunho salvo" : "Post publicado com sucesso",
          "ko-KR": isDraft ? "초안이 저장되었습니다" : "게시물이 성공적으로 게시되었습니다",
        }, locale));
        
        clearDraft();
        setOpen(false);
      } else {
        throw new Error("Failed to submit post");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(lang({
        "zh-CN": "提交失败，请重试",
        "zh-TW": "提交失敗，請重試",
        "en-US": "Submit failed, please try again",
        "es-ES": "Error al enviar, por favor intente de nuevo",
        "fr-FR": "Échec de la soumission, veuillez réessayer",
        "ru-RU": "Ошибка отправки, попробуйте еще раз",
        "ja-JP": "送信に失敗しました。もう一度お試しください",
        "de-DE": "Senden fehlgeschlagen, bitte versuchen Sie es erneut",
        "pt-BR": "Falha no envio, tente novamente",
        "ko-KR": "제출 실패, 다시 시도해주세요",
      }, locale));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 插入表情符号
  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  // 处理拖拽调整高度
  const handleDrag = useCallback((event: any, info: any) => {
    if (sheetRef.current) {
      const windowHeight = window.innerHeight;
      const currentY = info.point.y;
      const newHeight = Math.min(85, Math.max(30, ((windowHeight - currentY) / windowHeight) * 100));
      setSheetHeight(newHeight);
    }
  }, []);

  return (
    <>
      {/* 浮动按钮 */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              style={{ backgroundColor: '#f0b100' }}
              className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl border-0 text-white hover:opacity-90 transition-all duration-300"
              onClick={() => {
                if (!open) loadDraft();
              }}
            >
              <RiAddLine className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="p-0 border-t-0 shadow-2xl scroll-auto"
            style={{ height: `${sheetHeight}vh` }}
            ref={sheetRef}
          >
            {/* 拖拽手柄 */}
            <motion.div
              className="w-full h-6 flex items-center justify-center cursor-row-resize bg-background/80 backdrop-blur-sm relative group"
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0}
              onDrag={handleDrag}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            >
              <div className="w-12 h-1 bg-muted-foreground/20 group-hover:bg-[#f0b100]/50 rounded-full transition-colors duration-200" />
            </motion.div>

            <div className="w-full max-w-7xl mx-auto h-full flex flex-col px-6 pb-6 overflow-hidden">
              <SheetHeader className="py-4 flex-shrink-0">
                <SheetTitle className="text-xl font-semibold text-center">
                  {lang({
                    "zh-CN": "创建新帖子",
                    "zh-TW": "創建新帖子",
                    "en-US": "Create New Post",
                    "es-ES": "Crear Nueva Publicación",
                    "fr-FR": "Créer un Nouveau Message",
                    "ru-RU": "Создать Новый Пост",
                    "ja-JP": "新しい投稿を作成",
                    "de-DE": "Neuen Beitrag Erstellen",
                    "pt-BR": "Criar Nova Postagem",
                    "ko-KR": "새 게시물 만들기",
                  }, locale)}
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
                {/* 标题和主题行 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2 h-6">
                      {lang({
                        "zh-CN": "标题",
                        "zh-TW": "標題",
                        "en-US": "Title",
                        "es-ES": "Título",
                        "fr-FR": "Titre",
                        "ru-RU": "Заголовок",
                        "ja-JP": "タイトル",
                        "de-DE": "Titel",
                        "pt-BR": "Título",
                        "ko-KR": "제목",
                      }, locale)}
                      <Badge variant={title.length > 40 ? "destructive" : "secondary"} className="text-xs">
                        {title.length}/50
                      </Badge>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={lang({
                        "zh-CN": "输入一个吸引人的标题...",
                        "zh-TW": "輸入一個吸引人的標題...",
                        "en-US": "Enter an engaging title...",
                        "es-ES": "Ingrese un título atractivo...",
                        "fr-FR": "Saisissez un titre engageant...",
                        "ru-RU": "Введите привлекательный заголовок...",
                        "ja-JP": "魅力的なタイトルを入力...",
                        "de-DE": "Geben Sie einen ansprechenden Titel ein...",
                        "pt-BR": "Digite um título atraente...",
                        "ko-KR": "매력적인 제목을 입력하세요...",
                      }, locale)}
                      maxLength={50}
                      className="h-12 text-base border-2 focus:border-[#f0b100] transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium h-6 flex items-center">
                      {lang({
                        "zh-CN": "主题分类",
                        "zh-TW": "主題分類",
                        "en-US": "Topic Category",
                        "es-ES": "Categoría del Tema",
                        "fr-FR": "Catégorie du Sujet",
                        "ru-RU": "Категория Темы",
                        "ja-JP": "トピックカテゴリ",
                        "de-DE": "Themenkategorie",
                        "pt-BR": "Categoria do Tópico",
                        "ko-KR": "주제 카테고리",
                      }, locale)}
                    </Label>
                    <Popover open={topicPopoverOpen} onOpenChange={setTopicPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            readOnly
                            value={selectedTopic}
                            placeholder={lang({
                              "zh-CN": "选择一个主题...",
                              "zh-TW": "選擇一個主題...",
                              "en-US": "Select a topic...",
                              "es-ES": "Selecciona un tema...",
                              "fr-FR": "Sélectionnez un sujet...",
                              "ru-RU": "Выберите тему...",
                              "ja-JP": "トピックを選択...",
                              "de-DE": "Wählen Sie ein Thema...",
                              "pt-BR": "Selecione um tópico...",
                              "ko-KR": "주제를 선택하세요...",
                            }, locale)}
                            className="h-12 text-base border-2 focus:border-[#f0b100] transition-colors cursor-pointer pr-10"
                            onClick={() => setTopicPopoverOpen(true)}
                          />
                          <RiArrowDownSLine className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder={lang({
                              "zh-CN": "搜索主题...",
                              "zh-TW": "搜索主題...",
                              "en-US": "Search topics...",
                              "es-ES": "Buscar temas...",
                              "fr-FR": "Rechercher des sujets...",
                              "ru-RU": "Поиск тем...",
                              "ja-JP": "トピックを検索...",
                              "de-DE": "Themen suchen...",
                              "pt-BR": "Buscar tópicos...",
                              "ko-KR": "주제 검색...",
                            }, locale)}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {lang({
                                "zh-CN": "未找到主题",
                                "zh-TW": "未找到主題",
                                "en-US": "No topics found",
                                "es-ES": "No se encontraron temas",
                                "fr-FR": "Aucun sujet trouvé",
                                "ru-RU": "Темы не найдены",
                                "ja-JP": "トピックが見つかりません",
                                "de-DE": "Keine Themen gefunden",
                                "pt-BR": "Nenhum tópico encontrado",
                                "ko-KR": "주제를 찾을 수 없습니다",
                              }, locale)}
                            </CommandEmpty>
                            <CommandGroup>
                              {getAllTopics().map((topic) => (
                                <CommandItem
                                  key={topic}
                                  value={topic}
                                  onSelect={() => {
                                    setSelectedTopic(topic);
                                    setTopicPopoverOpen(false);
                                  }}
                                  className="flex items-center justify-between"
                                >
                                  <span>{topic}</span>
                                  {selectedTopic === topic && <RiCheckLine className="h-4 w-4" />}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* 内容编辑器 */}
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      {lang({
                        "zh-CN": "内容",
                        "zh-TW": "內容",
                        "en-US": "Content",
                        "es-ES": "Contenido",
                        "fr-FR": "Contenu",
                        "ru-RU": "Содержание",
                        "ja-JP": "内容",
                        "de-DE": "Inhalt",
                        "pt-BR": "Conteúdo",
                        "ko-KR": "내용",
                      }, locale)}
                      <Badge variant={content.length > 800 ? "destructive" : "secondary"} className="text-xs">
                        {content.length}/1000
                      </Badge>
                    </Label>
                    <EmojiPicker onEmojiSelect={insertEmoji} locale={locale} />
                  </div>

                  <div className="flex-1 border-2 rounded-lg overflow-hidden bg-background transition-colors">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <div className="border-b bg-muted/30 flex-shrink-0">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent border-0 p-1">
                          <TabsTrigger 
                            value="edit" 
                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100]"
                          >
                            {lang({
                              "zh-CN": "编辑",
                              "zh-TW": "編輯",
                              "en-US": "Edit",
                              "es-ES": "Editar",
                              "fr-FR": "Modifier",
                              "ru-RU": "Редактировать",
                              "ja-JP": "編集",
                              "de-DE": "Bearbeiten",
                              "pt-BR": "Editar",
                              "ko-KR": "편집",
                            }, locale)}
                          </TabsTrigger>
                          <TabsTrigger 
                            value="preview"
                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100]"
                          >
                            {lang({
                              "zh-CN": "预览",
                              "zh-TW": "預覽",
                              "en-US": "Preview",
                              "es-ES": "Vista Previa",
                              "fr-FR": "Aperçu",
                              "ru-RU": "Предпросмотр",
                              "ja-JP": "プレビュー",
                              "de-DE": "Vorschau",
                              "pt-BR": "Visualizar",
                              "ko-KR": "미리보기",
                            }, locale)}
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="edit" className="flex-1 p-4 space-y-3 m-0 overflow-hidden flex flex-col">
                        <MarkdownEditor
                          value={content}
                          onChange={setContent}
                          locale={locale}
                        />
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder={lang({
                            "zh-CN": "分享你的想法，支持 Markdown 格式...",
                            "zh-TW": "分享你的想法，支持 Markdown 格式...",
                            "en-US": "Share your thoughts, Markdown supported...",
                            "es-ES": "Comparte tus pensamientos, Markdown compatible...",
                            "fr-FR": "Partagez vos pensées, Markdown pris en charge...",
                            "ru-RU": "Поделитесь своими мыслями, поддерживается Markdown...",
                            "ja-JP": "あなたの考えを共有してください、Markdown対応...",
                            "de-DE": "Teilen Sie Ihre Gedanken mit, Markdown unterstützt...",
                            "pt-BR": "Compartilhe seus pensamentos, Markdown suportado...",
                            "ko-KR": "생각을 공유하세요, 마크다운 지원...",
                          }, locale)}
                          className="flex-1 resize-none border-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-base leading-relaxed overflow-y-auto"
                          maxLength={1000}
                        />
                      </TabsContent>

                      <TabsContent value="preview" className="flex-1 p-4 m-0 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                          {content ? (
                            <div 
                              className="prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <div className="text-4xl mb-4">📝</div>
                                <p>
                                  {lang({
                                    "zh-CN": "在编辑选项卡中输入内容以查看预览",
                                    "zh-TW": "在編輯選項卡中輸入內容以查看預覽",
                                    "en-US": "Enter content in the edit tab to see preview",
                                    "es-ES": "Ingrese contenido en la pestaña de edición para ver la vista previa",
                                    "fr-FR": "Saisissez le contenu dans l'onglet d'édition pour voir l'aperçu",
                                    "ru-RU": "Введите содержимое во вкладке редактирования для предпросмотра",
                                    "ja-JP": "編集タブでコンテンツを入力してプレビューを表示",
                                    "de-DE": "Geben Sie Inhalt im Bearbeitungstab ein, um die Vorschau zu sehen",
                                    "pt-BR": "Digite o conteúdo na aba de edição para ver a visualização",
                                    "ko-KR": "미리보기를 보려면 편집 탭에서 내용을 입력하세요",
                                  }, locale)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              <Separator className="my-4 flex-shrink-0" />

              {/* 操作按钮 */}
              <div className="flex justify-end items-center flex-shrink-0">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => submitPost(true)}
                    disabled={isSubmitting}
                    className="px-6 border-2 hover:border-[#f0b100] hover:text-[#f0b100]"
                  >
                    <RiDraftLine className="h-4 w-4 mr-2" />
                    {lang({
                      "zh-CN": "保存草稿",
                      "zh-TW": "保存草稿",
                      "en-US": "Save Draft",
                      "es-ES": "Guardar Borrador",
                      "fr-FR": "Sauvegarder le Brouillon",
                      "ru-RU": "Сохранить Черновик",
                      "ja-JP": "下書きを保存",
                      "de-DE": "Entwurf Speichern",
                      "pt-BR": "Salvar Rascunho",
                      "ko-KR": "초안 저장",
                    }, locale)}
                  </Button>

                  <Button
                    onClick={() => submitPost(false)}
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#f0b100' }}
                    className="px-8 text-white hover:opacity-90 transition-opacity shadow-lg"
                  >
                    <RiSendPlaneLine className="h-4 w-4 mr-2" />
                    {isSubmitting 
                      ? lang({
                          "zh-CN": "发布中...",
                          "zh-TW": "發布中...",
                          "en-US": "Publishing...",
                          "es-ES": "Publicando...",
                          "fr-FR": "Publication...",
                          "ru-RU": "Публикация...",
                          "ja-JP": "公開中...",
                          "de-DE": "Veröffentlichen...",
                          "pt-BR": "Publicando...",
                          "ko-KR": "게시 중...",
                        }, locale)
                      : lang({
                          "zh-CN": "发布帖子",
                          "zh-TW": "發布帖子",
                          "en-US": "Publish Post",
                          "es-ES": "Publicar Post",
                          "fr-FR": "Publier le Message",
                          "ru-RU": "Опубликовать Пост",
                          "ja-JP": "投稿を公開",
                          "de-DE": "Beitrag Veröffentlichen",
                          "pt-BR": "Publicar Post",
                          "ko-KR": "게시물 게시",
                        }, locale)
                    }
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </>
  );
}
