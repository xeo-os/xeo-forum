'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { ReplyList } from '@/components/reply-list';
import token from '@/utils/userToken';
import { Card, CardContent } from '@/components/ui/card';

export interface PostDetailClientProps {
  post: {
    id: number;
    title: string;
    likes: number;
    replies: number;
  };
  replies: any[];
  locale: string;
  currentPage: number;
  totalPages: number;
  initialLikeStatus?: {
    postLiked: boolean;
    replyLikes: Record<string, boolean>;
  };
}

export function PostDetailClient({
  post,
  replies,
  locale,
  currentPage,
  totalPages,
  initialLikeStatus,
}: PostDetailClientProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isReplying, setIsReplying] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);  const [replyLikes, setReplyLikes] = useState<Record<string, boolean>>({});
  const [likeStatusLoaded, setLikeStatusLoaded] = useState(false);  // 监控replyLikes状态变化
  useEffect(() => {
    console.log('PostDetailClient - replyLikes updated:', replyLikes);
    console.log('PostDetailClient - likeStatusLoaded:', likeStatusLoaded);
  }, [replyLikes, likeStatusLoaded]);

  // 处理回复点赞状态变化
  const handleReplyLikeChange = (replyId: string, isLiked: boolean) => {
    setReplyLikes(prev => ({
      ...prev,
      [replyId]: isLiked
    }));
    console.log('Updated reply like status:', replyId, isLiked);
  };

  // 获取用户点赞状态
  useEffect(() => {
    const fetchLikeStatus = async () => {
      const userToken = token.get();
      if (!userToken) {
        console.log('No user token found, setting likeStatusLoaded to true');
        setLikeStatusLoaded(true);
        return;
      }

      try {
        console.log('Fetching like status for post:', post.id);
        const response = await fetch(`/api/like/status?postId=${post.id}&locale=${locale}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Like status API response:', result);
        
        if (result.ok && result.data) {
          console.log('Setting post liked:', result.data.postLiked);
          console.log('Setting reply likes:', result.data.replyLikes);
          setIsLiked(result.data.postLiked);
          setReplyLikes(result.data.replyLikes);
        } else {
          console.error('API response not ok or missing data:', result);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      } finally {
        console.log('Setting likeStatusLoaded to true');
        setLikeStatusLoaded(true);
      }
    };

    fetchLikeStatus();
  }, [post.id, locale]);

  const handleLike = async () => {
    if (isLiking || !likeStatusLoaded) return;

    const userToken = token.get();
    if (!userToken) {
      toast.error(
        lang({
          'zh-CN': '请先登录',
          'zh-TW': '請先登入',
          'en-US': 'Please login first',
          'es-ES': 'Por favor inicia sesión primero',
          'fr-FR': 'Veuillez vous connecter d\'abord',
          'ru-RU': 'Пожалуйста, сначала войдите в систему',
          'ja-JP': 'まずログインしてください',
          'de-DE': 'Bitte melden Sie sich zuerst an',
          'pt-BR': 'Por favor, faça login primeiro',
          'ko-KR': '먼저 로그인해주세요',
        }, locale),
      );
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          postId: post.id,
          action: !isLiked,
          locale: locale,
          post: window.location.pathname.split('/')[3],
        }),
      });

      const result = await response.json();
      if (result.ok || result.message?.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      } else {
        toast.error(
          result.message ||
            lang({
              'zh-CN': '操作失败',
              'zh-TW': '操作失敗',
              'en-US': 'Operation failed',
              'es-ES': 'Operación falló',
              'fr-FR': 'Opération échouée',
              'ru-RU': 'Операция не удалась',
              'ja-JP': '操作に失敗しました',
              'de-DE': 'Operation fehlgeschlagen',
              'pt-BR': 'Operação falhou',
              'ko-KR': '작업 실패',
            }, locale),
        );
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error(
        lang({
          'zh-CN': '网络错误，请重试',
          'zh-TW': '網路錯誤，請重試',
          'en-US': 'Network error, please try again',
          'es-ES': 'Error de red, por favor intente de nuevo',
          'fr-FR': 'Erreur réseau, veuillez réessayer',
          'ru-RU': 'Ошибка сети, попробуйте еще раз',
          'ja-JP': 'ネットワークエラー、もう一度お試しください',
          'de-DE': 'Netzwerkfehler, bitte versuchen Sie es erneut',
          'pt-BR': 'Erro de rede, tente novamente',
          'ko-KR': '네트워크 오류, 다시 시도해주세요',
        }, locale),
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          lang({
            'zh-CN': '链接已复制到剪贴板',
            'zh-TW': '連結已複製到剪貼簿',
            'en-US': 'Link copied to clipboard',
            'es-ES': 'Enlace copiado al portapapeles',
            'fr-FR': 'Lien copié dans le presse-papiers',
            'ru-RU': 'Ссылка скопирована в буфер обмена',
            'ja-JP': 'リンクがクリップボードにコピーされました',
            'de-DE': 'Link in die Zwischenablage kopiert',
            'pt-BR': 'Link copiado para a área de transferência',
            'ko-KR': '링크가 클립보드에 복사되었습니다',
          }, locale),
        );
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const submitReply = async () => {
    if (!content.trim()) return;

    const userToken = token.get();
    if (!userToken) {
      toast.error(
        lang({
          'zh-CN': '请先登录',
          'zh-TW': '請先登入',
          'en-US': 'Please login first',
          'es-ES': 'Por favor inicia sesión primero',
          'fr-FR': 'Veuillez vous connecter d\'abord',
          'ru-RU': 'Пожалуйста, сначала войдите в систему',
          'ja-JP': 'まずログインしてください',
          'de-DE': 'Bitte melden Sie sich zuerst an',
          'pt-BR': 'Por favor, faça login primeiro',
          'ko-KR': '먼저 로그인해주세요',
        }, locale),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reply/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          postid: post.id,
          lang: locale,
        }),
      });

      const result = await response.json();
      if (result.ok) {
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
        setContent('');
        setIsReplying(false);
        // 可以在这里刷新页面或者添加回复到列表
        window.location.reload();
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
    <div className='space-y-6'>
      {/* 交互按钮 */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleLike}
              disabled={isLiking || !likeStatusLoaded}
              className={`transition-colors ${
                isLiked ? 'text-red-500 border-red-500' : ''
              }`}
            >
              {isLiking || !likeStatusLoaded ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              )}
              {likeCount}
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageCircle className='h-4 w-4 mr-2' />
              {post.replies}
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleShare}
            >
              <Share2 className='h-4 w-4 mr-2' />
              {lang(
                {
                  'zh-CN': '分享',
                  'zh-TW': '分享',
                  'en-US': 'Share',
                  'es-ES': 'Compartir',
                  'fr-FR': 'Partager',
                  'ru-RU': 'Поделиться',
                  'ja-JP': 'シェア',
                  'de-DE': 'Teilen',
                  'pt-BR': 'Compartilhar',
                  'ko-KR': '공유',
                },
                locale,
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 回复输入框 */}
      {isReplying && (
        <Card>
          <CardContent className='p-4'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>
                {lang(
                  {
                    'zh-CN': '写回复',
                    'zh-TW': '寫回覆',
                    'en-US': 'Write a reply',
                    'es-ES': 'Escribir una respuesta',
                    'fr-FR': 'Écrire une réponse',
                    'ru-RU': 'Написать ответ',
                    'ja-JP': '返信を書く',
                    'de-DE': 'Eine Antwort schreiben',
                    'pt-BR': 'Escrever uma resposta',
                    'ko-KR': '답글 작성',
                  },
                  locale,
                )}
              </h3>              <div className="mb-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={lang({
                    'zh-CN': '分享你的想法...',
                    'zh-TW': '分享你的想法...',
                    'en-US': 'Share your thoughts...',
                    'es-ES': 'Comparte tus pensamientos...',
                    'fr-FR': 'Partagez vos pensées...',
                    'ru-RU': 'Поделитесь своими мыслями...',
                    'ja-JP': 'あなたの考えを共有してください...',
                    'de-DE': 'Teilen Sie Ihre Gedanken...',
                    'pt-BR': 'Compartilhe seus pensamentos...',
                    'ko-KR': '당신의 생각을 공유하세요...',
                  }, locale)}
                  className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  rows={4}
                  maxLength={200}
                />
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  {content.length}/200
                </span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsReplying(false);
                      setContent('');
                    }}
                  >
                    {lang(
                      {
                        'zh-CN': '取消',
                        'zh-TW': '取消',
                        'en-US': 'Cancel',
                        'es-ES': 'Cancelar',
                        'fr-FR': 'Annuler',
                        'ru-RU': 'Отмена',
                        'ja-JP': 'キャンセル',
                        'de-DE': 'Abbrechen',
                        'pt-BR': 'Cancelar',
                        'ko-KR': '취소',
                      },
                      locale,
                    )}
                  </Button>
                  <Button
                    onClick={submitReply}
                    disabled={isSubmitting || !content.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        {lang(
                          {
                            'zh-CN': '发送中...',
                            'zh-TW': '發送中...',
                            'en-US': 'Sending...',
                            'es-ES': 'Enviando...',
                            'fr-FR': 'Envoi...',
                            'ru-RU': 'Отправка...',
                            'ja-JP': '送信中...',
                            'de-DE': 'Senden...',
                            'pt-BR': 'Enviando...',
                            'ko-KR': '전송 중...',
                          },
                          locale,
                        )}
                      </>
                    ) : (
                      lang(
                        {
                          'zh-CN': '发布回复',
                          'zh-TW': '發布回覆',
                          'en-US': 'Post Reply',
                          'es-ES': 'Publicar Respuesta',
                          'fr-FR': 'Publier la Réponse',
                          'ru-RU': 'Опубликовать Ответ',
                          'ja-JP': '返信を投稿',
                          'de-DE': 'Antwort Posten',
                          'pt-BR': 'Postar Resposta',
                          'ko-KR': '답글 게시',
                        },
                        locale,
                      )
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}      {/* 回复列表 */}
      <ReplyList 
        replies={replies} 
        locale={locale} 
        replyLikes={replyLikes}
        onReplyLikeChange={handleReplyLikeChange}
      />
    </div>
  );
}
