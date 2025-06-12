'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RiSendPlaneLine } from '@remixicon/react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import token from '@/utils/userToken';
import { MarkdownEditor } from '@/components/markdown-editor';
import { EmojiPicker } from '@/components/emoji-picker';
import { markdownToHtml } from '@/lib/markdown-utils';

interface ReplyEditorProps {
  postId?: number;
  replyId?: string;
  locale: string;
  onSuccess: () => void;
  onCancel: () => void;
  placeholder?: string;
}

export function ReplyEditor({
  postId,
  replyId,
  locale,
  onSuccess,
  onCancel,
  placeholder,
}: ReplyEditorProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  // 插入表情符号
  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  // 提交回复
  const handleSubmit = async () => {
    if (!token.get()) {
      toast.error(
        lang({
          'zh-CN': '请先登录',
          'en-US': 'Please login first',
          'zh-TW': '請先登錄',
          'es-ES': 'Por favor inicia sesión primero',
          'fr-FR': 'Veuillez vous connecter d\'abord',
          'ru-RU': 'Пожалуйста, сначала войдите',
          'ja-JP': '最初にログインしてください',
          'de-DE': 'Bitte melden Sie sich zuerst an',
          'pt-BR': 'Por favor, faça login primeiro',
          'ko-KR': '먼저 로그인해주세요',
        }, locale)
      );
      return;
    }

    if (!content.trim()) {
      toast.error(
        lang({
          'zh-CN': '请输入回复内容',
          'en-US': 'Please enter reply content',
          'zh-TW': '請輸入回覆內容',
          'es-ES': 'Por favor ingrese el contenido de la respuesta',
          'fr-FR': 'Veuillez saisir le contenu de la réponse',
          'ru-RU': 'Пожалуйста, введите содержание ответа',
          'ja-JP': '返信内容を入力してください',
          'de-DE': 'Bitte geben Sie den Antwortinhalt ein',
          'pt-BR': 'Por favor, insira o conteúdo da resposta',
          'ko-KR': '답글 내용을 입력해주세요',
        }, locale)
      );
      return;
    }

    if (content.length >200) {
      toast.error(
        lang({
          'zh-CN': '回复内容不能超过200个字符',
          'en-US': 'Reply content cannot exceed 200 characters',
          'zh-TW': '回覆內容不能超過200個字符',
          'es-ES': 'El contenido de la respuesta no puede exceder 200 caracteres',
          'fr-FR': 'Le contenu de la réponse ne peut pas dépasser 1000 caractères',
          'ru-RU': 'Содержание ответа не может превышать 200 символов',
          'ja-JP': '返信内容は200文字を超えることはできません',
          'de-DE': 'Der Antwortinhalt darf 200 Zeichen nicht überschreiten',
          'pt-BR': 'O conteúdo da resposta não pode exceder 200 caracteres',
          'ko-KR': '답글 내용은 200자를 초과할 수 없습니다',
        }, locale)
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const body: any = {
        content: content.trim(),
        lang: locale,
      };

      if (postId) {
        body.postid = postId;
      } else if (replyId) {
        body.replyid = replyId;
      }

      const response = await fetch('/api/reply/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.get(),
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success(
          lang({
            'zh-CN': '回复发布成功',
            'en-US': 'Reply posted successfully',
            'zh-TW': '回覆發布成功',
            'es-ES': 'Respuesta publicada exitosamente',
            'fr-FR': 'Réponse publiée avec succès',
            'ru-RU': 'Ответ опубликован успешно',
            'ja-JP': '返信が正常に投稿されました',
            'de-DE': 'Antwort erfolgreich veröffentlicht',
            'pt-BR': 'Resposta publicada com sucesso',
            'ko-KR': '답글이 성공적으로 게시되었습니다',
          }, locale)
        );
        setContent('');
        onSuccess();
      } else {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(
        lang({
          'zh-CN': '发布失败，请重试',
          'en-US': 'Post failed, please try again',
          'zh-TW': '發布失敗，請重試',
          'es-ES': 'Publicación falló, por favor intente de nuevo',
          'fr-FR': 'Publication échouée, veuillez réessayer',
          'ru-RU': 'Публикация не удалась, попробуйте еще раз',
          'ja-JP': '投稿に失敗しました。もう一度お試しください',
          'de-DE': 'Veröffentlichung fehlgeschlagen, bitte versuchen Sie es erneut',
          'pt-BR': 'Publicação falhou, tente novamente',
          'ko-KR': '게시 실패, 다시 시도해주세요',
        }, locale)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 内容编辑器 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {lang({
                'zh-CN': '内容',
                'en-US': 'Content',
                'zh-TW': '內容',
                'es-ES': 'Contenido',
                'fr-FR': 'Contenu',
                'ru-RU': 'Содержание',
                'ja-JP': '内容',
                'de-DE': 'Inhalt',
                'pt-BR': 'Conteúdo',
                'ko-KR': '내용',
              }, locale)}
            </span>
            <Badge
              variant={content.length > 150 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {content.length}/200
            </Badge>
          </div>
          <EmojiPicker onEmojiSelect={insertEmoji} locale={locale} />
        </div>

        {/* Markdown 工具栏 */}
        <MarkdownEditor value={content} onChange={setContent} locale={locale} />

        <div
          className="border-2 rounded-lg overflow-hidden bg-background transition-colors"
          style={{ height: '350px' }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="border-b bg-muted/30 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-transparent border-0 p-1 h-8">
                <TabsTrigger
                  value="edit"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100] text-sm"
                >
                  {lang({
                    'zh-CN': '编辑',
                    'en-US': 'Edit',
                    'zh-TW': '編輯',
                    'es-ES': 'Editar',
                    'fr-FR': 'Modifier',
                    'ru-RU': 'Редактировать',
                    'ja-JP': '編集',
                    'de-DE': 'Bearbeiten',
                    'pt-BR': 'Editar',
                    'ko-KR': '편집',
                  }, locale)}
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100] text-sm"
                >
                  {lang({
                    'zh-CN': '预览',
                    'en-US': 'Preview',
                    'zh-TW': '預覽',
                    'es-ES': 'Vista Previa',
                    'fr-FR': 'Aperçu',
                    'ru-RU': 'Предпросмотр',
                    'ja-JP': 'プレビュー',
                    'de-DE': 'Vorschau',
                    'pt-BR': 'Visualizar',
                    'ko-KR': '미리보기',
                  }, locale)}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 p-3 m-0 overflow-hidden">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder || lang({
                  'zh-CN': '分享你的想法，支持 Markdown 格式...',
                  'en-US': 'Share your thoughts, Markdown supported...',
                  'zh-TW': '分享你的想法，支持 Markdown 格式...',
                  'es-ES': 'Comparte tus pensamientos, Markdown compatible...',
                  'fr-FR': 'Partagez vos pensées, Markdown pris en charge...',
                  'ru-RU': 'Поделитесь своими мыслями, поддерживается Markdown...',
                  'ja-JP': 'あなたの考えを共有してください、Markdown対応...',
                  'de-DE': 'Teilen Sie Ihre Gedanken mit, Markdown unterstützt...',
                  'pt-BR': 'Compartilhe seus pensamentos, Markdown suportado...',
                  'ko-KR': '생각을 공유하세요, 마크다운 지원...',
                }, locale)}
                className="h-full resize-none border-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-sm leading-relaxed"
                maxLength={200}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-3 m-0 overflow-y-auto">
              {content ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(content),
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm">
                      {lang({
                        'zh-CN': '在编辑选项卡中输入内容以查看预览',
                        'en-US': 'Enter content in the edit tab to see preview',
                        'zh-TW': '在編輯選項卡中輸入內容以查看預覽',
                        'es-ES': 'Ingrese contenido en la pestaña de edición para ver la vista previa',
                        'fr-FR': 'Saisissez le contenu dans l\'onglet d\'édition pour voir l\'aperçu',
                        'ru-RU': 'Введите содержимое во вкладке редактирования для предпросмотра',
                        'ja-JP': '編集タブでコンテンツを入力してプレビューを表示',
                        'de-DE': 'Geben Sie Inhalt im Bearbeitungstab ein, um die Vorschau zu sehen',
                        'pt-BR': 'Digite o conteúdo na aba de edição para ver a visualização',
                        'ko-KR': '미리보기를 보려면 편집 탭에서 내용을 입력하세요',
                      }, locale)}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end items-center gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {lang({
            'zh-CN': '取消',
            'en-US': 'Cancel',
            'zh-TW': '取消',
            'es-ES': 'Cancelar',
            'fr-FR': 'Annuler',
            'ru-RU': 'Отмена',
            'ja-JP': 'キャンセル',
            'de-DE': 'Abbrechen',
            'pt-BR': 'Cancelar',
            'ko-KR': '취소',
          }, locale)}
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          style={{ backgroundColor: '#f0b100' }}
          className="text-white hover:opacity-90 transition-opacity"
        >
          <RiSendPlaneLine className="h-4 w-4 mr-2" />
          {isSubmitting
            ? lang({
                'zh-CN': '发布中...',
                'en-US': 'Posting...',
                'zh-TW': '發布中...',
                'es-ES': 'Publicando...',
                'fr-FR': 'Publication...',
                'ru-RU': 'Публикация...',
                'ja-JP': '投稿中...',
                'de-DE': 'Veröffentlichen...',
                'pt-BR': 'Publicando...',
                'ko-KR': '게시 중...',
              }, locale)
            : lang({
                'zh-CN': '发布回复',
                'en-US': 'Post Reply',
                'zh-TW': '發布回覆',
                'es-ES': 'Publicar respuesta',
                'fr-FR': 'Publier la réponse',
                'ru-RU': 'Опубликовать ответ',
                'ja-JP': '返信を投稿',
                'de-DE': 'Antwort veröffentlichen',
                'pt-BR': 'Publicar resposta',
                'ko-KR': '답글 게시',
              }, locale)}
        </Button>
      </div>
    </div>
  );
}
