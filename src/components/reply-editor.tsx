'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import token from '@/utils/userToken';
import { useBroadcast } from '@/store/useBroadcast';

interface ReplyEditorProps {
  postId: string;
  locale: string;
  onSuccess: (newReplyData?: any) => void;
  onCancel: () => void;
  placeholder: string;
}

export function ReplyEditor({ 
  postId, 
  locale, 
  onSuccess, 
  onCancel, 
  placeholder,
}: ReplyEditorProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{uuid: string; toastId: string} | null>(null);

  const { registerCallback, unregisterCallback } = useBroadcast();

  // 添加广播消息处理
  useEffect(() => {
    const handleBroadcastMessage = (message: unknown) => {
      if (typeof message === 'object' && message !== null && 'action' in message) {
        const typedMessage = message as { action: string; data?: { uuid?: string; status?: string; type?: string } };
        
        // 处理翻译状态更新
        if (typedMessage.action === 'broadcast' && typedMessage.data && translationProgress) {
          console.log('Received broadcast data:', typedMessage.data);
          console.log('Current translation progress:', translationProgress);
          
          // 检查是否是任务状态更新且uuid匹配
          if (typedMessage.data.uuid === translationProgress.uuid && typedMessage.data.type === 'reply') {
            const status = typedMessage.data.status;
            console.log('Task status update for matching UUID:', status);
            
            if (status === 'DONE') {
              // 关闭翻译进度toast
              toast.dismiss(translationProgress.toastId);
              
              // 显示完成提示
              toast.success(
                lang(
                  {
                    'zh-CN': '回复翻译完成',
                    'zh-TW': '回覆翻譯完成',
                    'en-US': 'Reply translation completed',
                    'es-ES': 'Traducción de respuesta completada',
                    'fr-FR': 'Traduction de la réponse terminée',
                    'ru-RU': 'Перевод ответа завершен',
                    'ja-JP': '返信の翻訳完了',
                    'de-DE': 'Antwortübersetzung abgeschlossen',
                    'pt-BR': 'Tradução da resposta concluída',
                    'ko-KR': '답글 번역 완료',
                  },
                  locale,
                )
              );
              setTranslationProgress(null);
            } else if (status === 'FAIL') {
              // 翻译失败，显示重试按钮
              toast.error(
                lang(
                  {
                    'zh-CN': '回复翻译失败',
                    'zh-TW': '回覆翻譯失敗',
                    'en-US': 'Reply translation failed',
                    'es-ES': 'Traducción de respuesta falló',
                    'fr-FR': 'Échec de la traduction de la réponse',
                    'ru-RU': 'Перевод ответа не удался',
                    'ja-JP': '返信の翻訳に失敗しました',
                    'de-DE': 'Antwortübersetzung fehlgeschlagen',
                    'pt-BR': 'Tradução da resposta falhou',
                    'ko-KR': '답글 번역 실패',
                  },
                  locale,
                ),
                {
                  action: {
                    label: lang(
                      {
                        'zh-CN': '重试',
                        'zh-TW': '重試',
                        'en-US': 'Retry',
                        'es-ES': 'Reintentar',
                        'fr-FR': 'Réessayer',
                        'ru-RU': 'Повторить',
                        'ja-JP': '再試行',
                        'de-DE': 'Wiederholen',
                        'pt-BR': 'Tentar novamente',
                        'ko-KR': '재시도',
                      },
                      locale,
                    ),
                    onClick: async () => {
                      try {
                        const response = await fetch('/api/task/retry', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token.get()}`,
                          },
                          body: JSON.stringify({ id: translationProgress.uuid }),
                        });

                        const result = await response.json();
                        if (result.ok) {
                          // 重试成功，重新显示进度toast
                          const newToastId = toast(
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>
                                {lang(
                                  {
                                    'zh-CN': '正在重新翻译回复...',
                                    'zh-TW': '正在重新翻譯回覆...',
                                    'en-US': 'Retranslating reply...',
                                    'es-ES': 'Retraduciendo respuesta...',
                                    'fr-FR': 'Retraduction de la réponse...',
                                    'ru-RU': 'Повторный перевод ответа...',
                                    'ja-JP': '返信を再翻訳中...',
                                    'de-DE': 'Antwort erneut übersetzen...',
                                    'pt-BR': 'Retraduzindo resposta...',
                                    'ko-KR': '답글 재번역 중...',
                                  },
                                  locale,
                                )}
                              </span>
                            </div>,
                            {
                              duration: Infinity,
                              dismissible: false,
                            }
                          );

                          // 更新翻译进度状态
                          setTranslationProgress({
                            uuid: translationProgress.uuid,
                            toastId: newToastId as string,
                          });
                        } else {
                          toast.error(
                            lang(
                              {
                                'zh-CN': '重试失败，请稍后再试',
                                'zh-TW': '重試失敗，請稍後再試',
                                'en-US': 'Retry failed, please try again later',
                                'es-ES': 'Reintento falló, por favor intente de nuevo más tarde',
                                'fr-FR': 'Échec de la nouvelle tentative, veuillez réessayer plus tard',
                                'ru-RU': 'Повтор не удался, попробуйте позже',
                                'ja-JP': '再試行に失敗しました。後でもう一度お試しください',
                                'de-DE': 'Wiederholung fehlgeschlagen, bitte versuchen Sie es später erneut',
                                'pt-BR': 'Falha na nova tentativa, tente novamente mais tarde',
                                'ko-KR': '재시도 실패, 나중에 다시 시도하세요',
                              },
                              locale,
                            )
                          );
                        }
                      } catch (error) {
                        console.error('Retry error:', error);
                        toast.error(
                          lang(
                            {
                              'zh-CN': '重试请求失败',
                              'zh-TW': '重試請求失敗',
                              'en-US': 'Retry request failed',
                              'es-ES': 'Solicitud de reintento falló',
                              'fr-FR': 'Échec de la demande de nouvelle tentative',
                              'ru-RU': 'Запрос на повтор не удался',
                              'ja-JP': '再試行リクエストが失敗しました',
                              'de-DE': 'Wiederholungsanfrage fehlgeschlagen',
                              'pt-BR': 'Falha na solicitação de nova tentativa',
                              'ko-KR': '재시도 요청 실패',
                            },
                            locale,
                          )
                        );
                      }
                    },
                  },
                  duration: 10000,
                }
              );
              // 关闭翻译进度toast
              toast.dismiss(translationProgress.toastId);
              setTranslationProgress(null);
            }
          }
        }
      }
    };

    registerCallback(handleBroadcastMessage);
    return () => {
      unregisterCallback(handleBroadcastMessage);
    };
  }, [registerCallback, unregisterCallback, translationProgress, locale]);  // 提交回复
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
          postid: postId,
          lang: locale,
        }),
      });

      const result = await response.json();      if (result.ok) {
        const replyUuid = result.data?.taskId;
        
        // 显示翻译进度 toast
        const toastId = toast(
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {lang(
                {
                  'zh-CN': '正在翻译回复...',
                  'zh-TW': '正在翻譯回覆...',
                  'en-US': 'Translating reply...',
                  'es-ES': 'Traduciendo respuesta...',
                  'fr-FR': 'Traduction de la réponse...',
                  'ru-RU': 'Перевод ответа...',
                  'ja-JP': '返信を翻訳中...',
                  'de-DE': 'Antwort übersetzen...',
                  'pt-BR': 'Traduzindo resposta...',
                  'ko-KR': '답글 번역 중...',
                },
                locale,
              )}
            </span>
          </div>,
          {
            duration: Infinity,
            dismissible: false,
          }
        );

        // 保存翻译进度状态
        setTranslationProgress({
          uuid: replyUuid,
          toastId: toastId as string,
        });

        toast.success(
          lang({
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
          }, locale),
        );

        onSuccess({
          id: result.data?.id || `temp-${Date.now()}`,
          content: content.trim(),
          originLang: locale,
        });
        setContent('');
      } else {
        throw new Error('Failed to submit reply');
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      toast.error(
        lang({
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
        }, locale),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/20 rounded-lg p-4 border border-muted/50">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={
              token.getObject()?.avatar
                ? `/api/dynamicImage/emoji?emoji=${token.getObject()?.avatar.emoji}&background=${encodeURIComponent(
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

        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs">
              {content.length}/200
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="px-3 h-8 text-sm"
              >
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
                onClick={submitReply}
                disabled={isSubmitting || !content.trim()}
                size="sm"
                className="px-4 h-8 text-sm"
              >
                {isSubmitting ? 
                  lang({
                    'zh-CN': '发送中...',
                    'en-US': 'Sending...',
                    'zh-TW': '發送中...',
                    'es-ES': 'Enviando...',
                    'fr-FR': 'Envoi...',
                    'ru-RU': 'Отправка...',
                    'ja-JP': '送信中...',
                    'de-DE': 'Senden...',
                    'pt-BR': 'Enviando...',
                    'ko-KR': '전송 중...',
                  }, locale) :
                  lang({
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
                  }, locale)
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
