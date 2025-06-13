'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent} from '@/components/ui/card';
import {
  Heart,
  Reply as ReplyIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { MarkdownEditor } from '@/components/markdown-editor';
import { markdownToHtml } from '@/lib/markdown-utils';
import token from '@/utils/userToken';
import { useBroadcast } from '@/store/useBroadcast';

interface ReplyEditorProps {
  replyId: string;
  locale: string;
  onSuccess: () => void;
  onCancel: () => void;
  placeholder: string;
}

function ReplyEditor({ replyId, locale, onSuccess, placeholder }: ReplyEditorProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交回复
  const submitReply = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reply/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.get(),
        },
        body: JSON.stringify({
          content: content.trim(),
          replyid: replyId,
          lang: locale,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success(
          lang(
            {
              'zh-CN': '回复成功',
              'zh-TW': '回覆成功',
              'en-US': 'Reply successful',
              'es-ES': 'Respuesta exitosa',
              'fr-FR': 'Réponse réussie',
              'ru-RU': 'Ответ успешно отправлен',
              'ja-JP': '返信が成功しました',
              'de-DE': 'Antwort erfolgreich',
              'pt-BR': 'Resposta bem-sucedida',
              'ko-KR': '답글이 성공적으로 등록되었습니다',
            },
            locale,
          ),
        );

        setContent('');
        // 传递新回复数据给父组件
        onSuccess({
          id: result.data?.id || `temp-${Date.now()}`,
          content: content.trim(),
          originLang: locale,
        });
      } else {
        throw new Error('Failed to submit reply');
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      toast.error(
        lang(
          {
            'zh-CN': '回复失败，请重试',
            'zh-TW': '回覆失敗，請重試',
            'en-US': 'Reply failed, please try again',
            'es-ES': 'Error al responder, por favor intente de nuevo',
            'fr-FR': 'Échec de la réponse, veuillez réessayer',
            'ru-RU': 'Ошибка отправки ответа, попробуйте еще раз',
            'ja-JP': '返信に失敗しました。もう一度お試しください',
            'de-DE': 'Antwort fehlgeschlagen, bitte versuchen Sie es erneut',
            'pt-BR': 'Falha ao responder, tente novamente',
            'ko-KR': '답글 실패, 다시 시도해주세요',
          },
          locale,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={
              token.getObject()?.avatar
                ? `/api/dynamicImage/emoji/?emoji=${token.getObject()?.avatar.emoji}&background=${encodeURIComponent(
                    token.getObject()?.avatar?.background?.replaceAll('%', '%25') || ''
                  )}`
                : undefined
            }
            alt="Your Avatar"
          />
          <AvatarFallback
            style={{
              backgroundColor: token.getObject()?.avatar?.background || '#e5e7eb',
            }}
          >
            {token.getObject()?.avatar?.emoji ||
              token.getObject()?.nickname?.charAt(0) ||
              'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={`/${locale}/user/${token.getObject()?.uid}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {token.getObject()?.nickname || 'Anonymous'}
          </Link>
          <span className="text-xs text-muted-foreground">
            {lang(
              {
                'zh-CN': '刚刚',
                'en-US': 'just now',
                'zh-TW': '剛剛',
                'es-ES': 'ahora mismo',
                'fr-FR': 'à l\'instant',
                'ru-RU': 'только что',
                'ja-JP': 'たった今',
                'de-DE': 'gerade eben',
                'pt-BR': 'agora mesmo',
                'ko-KR': '방금',
              },
              locale,
            )}
          </span>
        </div>

        <div className="mb-4">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            locale={locale}
            placeholder={placeholder}
          />
          {/* 添加实际的文本输入框 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full mt-2 p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm"
            rows={4}
            maxLength={200}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={submitReply}
            disabled={isSubmitting}
            className="flex-shrink-0 h-10 px-4 text-sm"
          >
            {isSubmitting
              ? lang(
                  {
                    'zh-CN': '提交中...',
                    'zh-TW': '提交中...',
                    'en-US': 'Submitting...',
                    'es-ES': 'Enviando...',
                    'fr-FR': 'Envoi...',
                    'ru-RU': 'Отправка...',
                    'ja-JP': '送信中...',
                    'de-DE': 'Senden...',
                    'pt-BR': 'Enviando...',
                    'ko-KR': '제출 중...',
                  },
                  locale,
                )
              : lang(
                  {
                    'zh-CN': '回复',
                    'zh-TW': '回覆',
                    'en-US': 'Reply',
                    'es-ES': 'Responder',
                    'fr-FR': 'Répondre',
                    'ru-RU': 'Ответить',
                    'ja-JP': '返信',
                    'de-DE': 'Antworten',
                    'pt-BR': 'Responder',
                    'ko-KR': '답글',
                  },
                  locale,
                )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ReplyListProps {
  replies: any[];
  locale: string;
  onRepliesUpdate?: (replies: any[]) => void;
}

export function ReplyList({ replies, locale, onRepliesUpdate }: ReplyListProps) {
  // const pathname = usePathname();
  // const { registerCallback, unregisterCallback } = useBroadcast();

  const likedReplies = new Set<string>();
  const [likingReplies, setLikingReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [localReplies, setLocalReplies] = useState(replies);
  const [showOriginalText, setShowOriginalText] = useState<Set<string>>(new Set());

  // 处理回复成功 - 本地添加数据
  const handleReplySuccess = (newReplyData?: any, parentReplyId?: string) => {
    setReplyingTo(null);
    
    if (newReplyData) {
      // 创建新回复对象
      const newReply = {
        id: newReplyData.id || `temp-${Date.now()}`,
        content: newReplyData.content,
        originLang: locale,
        [`content${locale.replace("-","").toUpperCase()}`]: newReplyData.content,
        createdAt: new Date().toISOString(),
        formattedTime: lang({
          'zh-CN': '刚刚',
          'en-US': 'just now',
          'zh-TW': '剛剛',
          'es-ES': 'ahora mismo',
          'fr-FR': 'à l\'instant',
          'ru-RU': 'только что',
          'ja-JP': 'たった今',
          'de-DE': 'gerade eben',
          'pt-BR': 'agora mesmo',
          'ko-KR': '방금',
        }, locale),
        user: {
          uid: token.getObject()?.uid,
          nickname: token.getObject()?.nickname || 'Anonymous',
          avatar: token.getObject()?.avatar ? [token.getObject()?.avatar] : [],
        },
        _count: {
          likes: 0,
          replies: 0,
        },
        replies: [],
      };

      const updatedReplies = [...localReplies];
      
      if (parentReplyId) {
        // 添加到父回复的子回复中
        const addToParent = (replies: any[]): any[] => {
          return replies.map(reply => {
            if (reply.id === parentReplyId) {
              return {
                ...reply,
                replies: [...reply.replies, newReply],
                _count: {
                  ...reply._count,
                  replies: reply._count.replies + 1,
                },
              };
            }
            if (reply.replies && reply.replies.length > 0) {
              return {
                ...reply,
                replies: addToParent(reply.replies),
              };
            }
            return reply;
          });
        };
        setLocalReplies(addToParent(updatedReplies));
      } else {
        // 添加为顶级回复
        updatedReplies.push(newReply);
        setLocalReplies(updatedReplies);
      }
      
      // 通知父组件更新
      if (onRepliesUpdate) {
        onRepliesUpdate(updatedReplies);
      }
    }
  };

  // 切换原文显示
  const toggleOriginalText = (replyId: string) => {
    setShowOriginalText(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  };

  // 处理点赞
  const handleReplyLike = async (replyId: string, isLiked: boolean) => {
    setLikingReplies((prev) => new Set(prev).add(replyId));

    try {
      const response = await fetch('/api/reply/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.get(),
        },
        body: JSON.stringify({
          replyId,
          like: !isLiked,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        if (isLiked) {
          likedReplies.delete(replyId);
        } else {
          likedReplies.add(replyId);
        }
      } else {
        throw new Error('Failed to like reply');
      }
    } catch (error) {
      console.error('Like reply error:', error);
      toast.error(
        lang(
          {
            'zh-CN': '操作失败，请重试',
            'zh-TW': '操作失敗，請重試',
            'en-US': 'Action failed, please try again',
            'es-ES': 'Acción fallida, por favor intente de nuevo',
            'fr-FR': 'Action échouée, veuillez réessayer',
            'ru-RU': 'Ошибка действия, попробуйте еще раз',
            'ja-JP': 'アクションに失敗しました。もう一度お試しください',
            'de-DE': 'Aktion fehlgeschlagen, bitte versuchen Sie es erneut',
            'pt-BR': 'Ação falhou, tente novamente',
            'ko-KR': '작업 실패, 다시 시도해주세요',
          },
          locale,
        ),
      );
    } finally {
      setLikingReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(replyId);
        return newSet;
      });
    }
  };

  // 扁平化处理所有回复
  const flattenReplies = (replies: any[]): any[] => {
    const result: any[] = [];
    
    const processReply = (reply: any, level: number = 0) => {
      // 添加当前回复到结果中
      result.push({ ...reply, level });
      
      // 递归处理子回复
      if (reply.replies && reply.replies.length > 0) {
        reply.replies.forEach((subReply: any) => {
          processReply(subReply, level + 1);
        });
      }
    };
    
    // 处理所有顶级回复
    replies.forEach(reply => processReply(reply));
    return result;
  };

  const allReplies = flattenReplies(localReplies);

  if (allReplies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-lg">
          {lang({
            'zh-CN': '暂无回复',
            'en-US': 'No replies yet',
            'zh-TW': '暫無回覆',
            'es-ES': 'Aún no hay respuestas',
            'fr-FR': 'Pas encore de réponses',
            'ru-RU': 'Пока нет ответов',
            'ja-JP': 'まだ返信はありません',
            'de-DE': 'Noch keine Antworten',
            'pt-BR': 'Ainda não há respostas',
            'ko-KR': '아직 답글이 없습니다',
          }, locale)}
        </p>
        <p className="text-sm mt-2">
          {lang({
            'zh-CN': '成为第一个回复的人吧！',
            'en-US': 'Be the first to reply!',
            'zh-TW': '成為第一個回覆的人吧！',
            'es-ES': '¡Sé el primero en responder!',
            'fr-FR': 'Soyez le premier à répondre !',
            'ru-RU': 'Будьте первым, кто ответит !',
            'ja-JP': '最初に返信してください！',
            'de-DE': 'Seien Sie der Erste, der antwortet!',
            'pt-BR': 'Seja o primeiro a responder!',
            'ko-KR': '첫 번째로 답글을 작성해보세요!',
          }, locale)}
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          {allReplies.map((reply) => {
            const isLiked = likedReplies.has(reply.id);
            const showOriginal = showOriginalText.has(reply.id);
            const isTranslated = reply.originLang !== locale;
            
            return (
              <div 
                key={reply.id} 
                className={`flex gap-3 ${
                  reply.level > 0 
                    ? `ml-${Math.min(reply.level * 4, 16)} pl-4 border-l-2 border-muted` 
                    : ''
                }`}
              >
                <Link
                  href={`/${locale}/user/${reply.user.uid}`}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar className={reply.level > 0 ? "h-8 w-8" : "h-10 w-10"}>
                    <AvatarImage
                      src={
                        reply.user.avatar[0]?.id
                          ? `/api/dynamicImage/emoji/?emoji=${reply.user.avatar[0].emoji}&background=${encodeURIComponent(
                              reply.user.avatar[0].background.replaceAll('%', '%25')
                            )}`
                          : undefined
                      }
                      alt={reply.user.nickname || 'User Avatar'}
                    />
                    <AvatarFallback
                      style={{
                        backgroundColor: reply.user.avatar[0]?.background || '#e5e7eb',
                      }}
                    >
                      {reply.user.avatar[0]?.emoji ||
                        reply.user.profileEmoji ||
                        reply.user.nickname?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1 min-w-0 relative">
                  {/* 右上角按钮 */}
                  <div className="absolute top-0 right-0 flex items-center gap-1">
                    {isTranslated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOriginalText(reply.id)}
                        className="h-6 px-2 text-xs"
                      >
                        {showOriginal ? 
                          lang({
                            'zh-CN': '查看译文',
                            'en-US': 'View Translation',
                            'zh-TW': '查看譯文',
                            'es-ES': 'Ver traducción',
                            'fr-FR': 'Voir la traduction',
                            'ru-RU': 'Посмотреть перевод',
                            'ja-JP': '翻訳を見る',
                            'de-DE': 'Übersetzung anzeigen',
                            'pt-BR': 'Ver tradução',
                            'ko-KR': '번역 보기',
                          }, locale) :
                          lang({
                            'zh-CN': '查看原文',
                            'en-US': 'View Original',
                            'zh-TW': '查看原文',
                            'es-ES': 'Ver original',
                            'fr-FR': 'Voir l\'original',
                            'ru-RU': 'Посмотреть оригинал',
                            'ja-JP': '原文を見る',
                            'de-DE': 'Original anzeigen',
                            'pt-BR': 'Ver original',
                            'ko-KR': '원문 보기',
                          }, locale)
                        }
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReplyLike(reply.id, isLiked)}
                      disabled={likingReplies.has(reply.id)}
                      className="h-6 px-2 text-xs"
                    >
                      <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                      {reply._count.likes + (isLiked ? 1 : 0)}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                      className="h-6 px-2 text-xs"
                    >
                      <ReplyIcon className="h-3 w-3 mr-1" />
                      {lang({
                        'zh-CN': '回复',
                        'en-US': 'Reply',
                        'zh-TW': '回覆',
                        'es-ES': 'Responder',
                        'fr-FR': 'Répondre',
                        'ru-RU': 'Ответить',
                        'ja-JP': '返信',
                        'de-DE': 'Antworten',
                        'pt-BR': 'Responder',
                        'ko-KR': '답글',
                      }, locale)}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pr-24">
                    <Link
                      href={`/${locale}/user/${reply.user.uid}`}
                      className={`font-medium hover:text-primary transition-colors ${reply.level > 0 ? 'text-sm' : ''}`}
                    >
                      {reply.user.nickname || 'Anonymous'}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {reply.formattedTime}
                    </span>
                    <span className="text-xs text-muted-foreground">#{reply.id.slice(-8)}</span>
                    {reply.level > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {lang({
                          'zh-CN': '回复',
                          'en-US': 'Reply',
                          'zh-TW': '回覆',
                          'es-ES': 'Respuesta',
                          'fr-FR': 'Réponse',
                          'ru-RU': 'Ответ',
                          'ja-JP': '返信',
                          'de-DE': 'Antwort',
                          'pt-BR': 'Resposta',
                          'ko-KR': '답글',
                        }, locale)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`prose prose-sm max-w-none dark:prose-invert mb-3 pr-24
                             prose-p:my-2 prose-p:leading-relaxed
                             prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                             prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                             ${reply.level > 0 ? 'prose-xs' : ''}`}
                    dangerouslySetInnerHTML={{ 
                      __html: markdownToHtml(
                        (() => {
                          if (!isTranslated) {
                            // 如果原语言就是当前语言，直接显示原内容
                            return reply.content;
                          }
                          
                          if (showOriginal) {
                            // 显示原文
                            return reply.content;
                          } else {
                            // 显示译文
                            const translatedFieldName = `content${locale.replace("-","").toUpperCase()}`;
                            return reply[translatedFieldName] || reply.content;
                          }
                        })()
                      ) 
                    }}
                  />

                  {/* 回复编辑器 */}
                  {replyingTo === reply.id && (
                    <div className="mt-4">
                      <ReplyEditor
                        replyId={reply.id}
                        locale={locale}
                        onSuccess={(newReplyData) => handleReplySuccess(newReplyData, reply.id)}
                        onCancel={() => setReplyingTo(null)}
                        placeholder={lang({
                          'zh-CN': `回复 @${reply.user.nickname || 'Anonymous'}...`,
                          'en-US': `Reply to @${reply.user.nickname || 'Anonymous'}...`,
                          'zh-TW': `回覆 @${reply.user.nickname || 'Anonymous'}...`,
                          'es-ES': `Responder a @${reply.user.nickname || 'Anonymous'}...`,
                          'fr-FR': `Répondre à @${reply.user.nickname || 'Anonymous'}...`,
                          'ru-RU': `Ответить @${reply.user.nickname || 'Anonymous'}...`,
                          'ja-JP': `@${reply.user.nickname || 'Anonymous'}に返信...`,
                          'de-DE': `Antworten @${reply.user.nickname || 'Anonymous'}...`,
                          'pt-BR': `Responder a @${reply.user.nickname || 'Anonymous'}...`,
                          'ko-KR': `@${reply.user.nickname || 'Anonymous'}에게 답글...`,
                        }, locale)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}