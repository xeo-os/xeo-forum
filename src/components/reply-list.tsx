'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent} from '@/components/ui/card';
import { Heart, Reply as ReplyIcon, ArrowUp, Focus } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { MarkdownEditor } from '@/components/markdown-editor';
import { markdownToHtml } from '@/lib/markdown-utils';
import token from '@/utils/userToken';

interface ReplyEditorProps {
  replyId: string;
  locale: string;
  onSuccess: (newReplyData?: any) => void;
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
    <div className="mt-3 pl-4 border-l-2 border-muted">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
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

        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={submitReply}
              disabled={isSubmitting || !content.trim()}
              size="sm"
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
    </div>
  );
}

// 单个回复组件
interface SingleReplyProps {
  reply: any;
  locale: string;
  level: number;
  onReplySuccess: (newReplyData: any, parentId: string) => void;
  hoveredReplyPath?: string[]; // 从根到当前hover回复的路径
  onHover?: (replyId: string | null, parentPath: string[]) => void;
  parentPath: string[]; // 从根到当前回复的路径
  onFocusReply?: (replyId: string) => void; // 新增：聚焦回复的回调
  focusedReplyId?: string | null; // 新增：当前聚焦的回复ID
}

function SingleReply({ 
  reply, 
  locale, 
  level, 
  onReplySuccess, 
  hoveredReplyPath, 
  onHover, 
  parentPath,
  onFocusReply,
  focusedReplyId
}: SingleReplyProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [likeCount, setLikeCount] = useState(reply._count?.likes || 0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTranslated = reply.originLang !== locale;
  const maxLevel = 8;
  // 确保 parentPath 是数组
  const safeParentPath = Array.isArray(parentPath) ? parentPath : [];
  const currentPath = [...safeParentPath, reply.id];

  // 检查当前回复是否在hover路径中
  const isInHoverPath = () => {
    return hoveredReplyPath && hoveredReplyPath.includes(reply.id);
  };

  // 检查是否是当前hover的回复
  const isCurrentHovered = () => {
    return hoveredReplyPath && hoveredReplyPath[hoveredReplyPath.length - 1] === reply.id;
  };

  // 检查是否是hover回复的直接父回复
  const isDirectParent = () => {
    if (!hoveredReplyPath || hoveredReplyPath.length < 2) return false;
    const hoveredId = hoveredReplyPath[hoveredReplyPath.length - 1];
    const parentId = hoveredReplyPath[hoveredReplyPath.length - 2];
    return reply.id === parentId;
  };

  // 获取父回复ID
  const getParentReplyId = () => {
    if (safeParentPath.length === 0) return null;
    return safeParentPath[safeParentPath.length - 1];
  };

  // 滚动到指定回复
  const scrollToReply = (replyId: string) => {
    const element = document.getElementById(`reply-${replyId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // 添加临时高亮效果
      element.classList.add('bg-primary/10');
      setTimeout(() => {
        element.classList.remove('bg-primary/10');
      }, 2000);
    }
  };

  // 检查是否有子回复
  const hasChildReplies = () => {
    return reply.replies && reply.replies.length > 0;
  };

  // 处理鼠标悬停
  const handleMouseEnter = () => {
    onHover?.(reply.id, currentPath);
  };

  const handleMouseLeave = () => {
    onHover?.(null, []);
  };

  // 处理点赞
  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch('/api/reply/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.get(),
        },
        body: JSON.stringify({
          replyId: reply.id,
          like: !isLiked,
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error(lang({
        'zh-CN': '操作失败，请重试',
        'en-US': 'Action failed, please try again',
        'zh-TW': '操作失敗，請重試',
        'es-ES': 'Acción fallida, por favor intente de nuevo',
        'fr-FR': 'Échec de l\'action, veuillez réessayer',
        'ru-RU': 'Ошибка действия, попробуйте еще раз',
        'ja-JP': '操作に失敗しました。もう一度お試しください',
        'de-DE': 'Aktion fehlgeschlagen, bitte versuchen Sie es erneut',
        'pt-BR': 'Ação falhou, por favor tente novamente',
        'ko-KR': '작업 실패, 다시 시도해주세요',
      }, locale));
    } finally {
      setIsLiking(false);
    }
  };

  // 获取显示内容
  const getDisplayContent = () => {
    if (!isTranslated || showOriginal) {
      return reply.content;
    }
    const translatedFieldName = `content${locale.replace("-","").toUpperCase()}`;
    return reply[translatedFieldName] || reply.content;
  };

  // 计算缩进样式 - 使用更小的缩进
  const getIndentStyle = () => {
    if (level === 0) return {};
    const indentSize = 4;
    return { paddingLeft: `${indentSize}%` };
  };

  // 获取连接线样式 - 简化为统一样式
  const getConnectionLineStyle = () => {
    if (level === 0) return '';
    
    // 统一的连接线样式，不再有高亮效果
    return 'absolute left-0 top-0 bottom-0 w-0.5 bg-muted/60';
  };

  // 提交回复逻辑
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
          replyid: reply.id,
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

        onReplySuccess({
          id: result.data?.id || `temp-${Date.now()}`,
          content: content.trim(),
          originLang: locale,
        }, reply.id);
        setIsReplying(false);
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

  // 高亮指定回复
  const highlightParentReply = (replyId: string) => {
    const element = document.getElementById(`reply-${replyId}`);
    if (element) {
      // 清除之前的高亮
      const previousHighlighted = document.querySelector('.reply-highlighted');
      if (previousHighlighted) {
        previousHighlighted.classList.remove('reply-highlighted');
      }
      
      // 添加高亮类
      element.classList.add('reply-highlighted');
      
      // 滚动到视图中心
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // 3秒后移除高亮
      setTimeout(() => {
        element.classList.remove('reply-highlighted');
      }, 3000);
    }
  };

  return (
    <div 
      id={`reply-${reply.id}`}
      style={getIndentStyle()} 
      className={`relative ${level > 0 ? 'border-l-2 border-transparent' : ''} transition-colors duration-300`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 连接线 - 统一样式，无高亮 */}
      {level > 0 && (
        <div className={getConnectionLineStyle()} />
      )}
      
      <div className="flex gap-2 py-2 relative">
        {/* 头像 - 统一大小为 32px (h-8 w-8) */}
        <div className="flex-shrink-0">
          <Link
            href={`/${locale}/user/${reply.user.uid}`}
            className="hover:opacity-80 transition-opacity block"
          >
            <Avatar className="h-8 w-8">
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
        </div>

        <div className="flex-1 min-w-0">
          {/* 用户信息和时间 */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/${locale}/user/${reply.user.uid}`}
              className="font-medium hover:text-primary transition-colors text-sm"
            >
              {reply.user.nickname || 'Anonymous'}
            </Link>
            <span className="text-muted-foreground text-xs">
              {reply.formattedTime}
            </span>
            {level > 0 && (
              <span className="text-muted-foreground text-xs">
                #{reply.id.slice(-6)}
              </span>
            )}
            {/* 层级指示器 - hover时高亮 */}
            {level > 0 && (
              <span className={`text-muted-foreground text-xs transition-all duration-300 ${
                isCurrentHovered() 
                  ? 'opacity-100 text-primary font-medium' 
                  : isInHoverPath() 
                    ? 'opacity-80 text-primary' 
                    : 'opacity-50'
              }`}>
                L{level}
              </span>
            )}
            
            {/* 父回复高亮按钮 - 只在hover且有父回复时显示 */}
            {isCurrentHovered() && getParentReplyId() && (
              <button
                onClick={() => highlightParentReply(getParentReplyId()!)}
                className="text-blue-500 text-xs font-medium hover:text-blue-600 transition-colors flex items-center gap-1"
                style={{
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <ArrowUp className="h-3 w-3" />
                {lang({
                  'zh-CN': '高亮父回复',
                  'en-US': 'Highlight parent',
                  'zh-TW': '高亮父回覆',
                  'es-ES': 'Resaltar padre',
                  'fr-FR': 'Surligner parent',
                  'ru-RU': 'Выделить родителя',
                  'ja-JP': '親をハイライト',
                  'de-DE': 'Eltern hervorheben',
                  'pt-BR': 'Destacar pai',
                  'ko-KR': '부모 강조',
                }, locale)}
              </button>
            )}

            {/* 聚焦此回复按钮 - 只在hover且有子回复时显示 */}
            {isCurrentHovered() && hasChildReplies() && (
              <button
                onClick={() => onFocusReply?.(reply.id)}
                className="text-green-500 text-xs font-medium hover:text-green-600 transition-colors flex items-center gap-1"
                style={{
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <Focus className="h-3 w-3" />
                {lang({
                  'zh-CN': `聚焦此回复(${reply.replies.length})`,
                  'en-US': `Focus reply(${reply.replies.length})`,
                  'zh-TW': `聚焦此回覆(${reply.replies.length})`,
                  'es-ES': `Enfocar(${reply.replies.length})`,
                  'fr-FR': `Focus(${reply.replies.length})`,
                  'ru-RU': `Фокус(${reply.replies.length})`,
                  'ja-JP': `フォーカス(${reply.replies.length})`,
                  'de-DE': `Fokus(${reply.replies.length})`,
                  'pt-BR': `Foco(${reply.replies.length})`,
                  'ko-KR': `포커스(${reply.replies.length})`,
                }, locale)}
              </button>
            )}

            {/* 父回复指示 - 只在hover时显示 */}
            {isDirectParent() && (
              <span className="text-orange-500 text-xs font-medium animate-pulse">
                ↳ {lang({
                  'zh-CN': '父回复',
                  'en-US': 'Parent',
                  'zh-TW': '父回覆',
                  'es-ES': 'Padre',
                  'fr-FR': 'Parent',
                  'ru-RU': 'Родитель',
                  'ja-JP': '親',
                  'de-DE': 'Eltern',
                  'pt-BR': 'Pai',
                  'ko-KR': '부모',
                }, locale)}
              </span>
            )}
          </div>

          {/* 回复内容 */}
          <div
            className="prose prose-sm max-w-none dark:prose-invert mb-2
                       prose-p:my-1 prose-p:leading-relaxed prose-p:text-sm
                       prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:text-sm
                       prose-strong:text-sm prose-em:text-sm prose-li:text-sm
                       text-sm"
            dangerouslySetInnerHTML={{ 
              __html: markdownToHtml(getDisplayContent()) 
            }}
          />

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 flex-wrap">
            {isTranslated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
                className="h-5 px-1.5 text-xs hover:bg-muted/50"
              >
                {showOriginal ? 
                  lang({
                    'zh-CN': '译文',
                    'en-US': 'Trans',
                    'zh-TW': '譯文',
                    'es-ES': 'Trad',
                    'fr-FR': 'Trad',
                    'ru-RU': 'Пер',
                    'ja-JP': '翻訳',
                    'de-DE': 'Übers',
                    'pt-BR': 'Trad',
                    'ko-KR': '번역',
                  }, locale) :
                  lang({
                    'zh-CN': '原文',
                    'en-US': 'Orig',
                    'zh-TW': '原文',
                    'es-ES': 'Orig',
                    'fr-FR': 'Orig',
                    'ru-RU': 'Ориг',
                    'ja-JP': '原文',
                    'de-DE': 'Orig',
                    'pt-BR': 'Orig',
                    'ko-KR': '원문',
                  }, locale)
                }
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="h-5 px-1.5 text-xs hover:bg-muted/50"
            >
              <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              {likeCount}
            </Button>

            {level < maxLevel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-5 px-1.5 text-xs hover:bg-muted/50"
              >
                <ReplyIcon className="h-3 w-3 mr-1" />
                {lang({
                  'zh-CN': '回复',
                  'en-US': 'Reply',
                  'zh-TW': '回覆',
                  'es-ES': 'Resp',
                  'fr-FR': 'Rép',
                  'ru-RU': 'Отв',
                  'ja-JP': '返信',
                  'de-DE': 'Antw',
                  'pt-BR': 'Resp',
                  'ko-KR': '답글',
                }, locale)}
              </Button>
            )}
          </div>

          {/* 回复编辑器 - 更紧凑的设计 */}
          {isReplying && (
            <div className="mt-2 p-2 bg-muted/20 rounded-md border border-muted/50">
              <div className="flex gap-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
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

                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
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
                      className="w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-ring text-sm bg-background"
                      rows={2}
                      maxLength={200}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {content.length}/200
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsReplying(false);
                          setContent('');
                        }}
                        className="h-6 px-2 text-xs"
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
                        className="h-6 px-2 text-xs"
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
          )}
        </div>
      </div>

      {/* 子回复 */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="space-y-0">
          {reply.replies.map((subReply: any) => (
            <SingleReply
              key={subReply.id}
              reply={subReply}
              locale={locale}
              level={level + 1}
              onReplySuccess={onReplySuccess}
              hoveredReplyPath={hoveredReplyPath}
              onHover={onHover}
              parentPath={currentPath}
              onFocusReply={onFocusReply}
              focusedReplyId={focusedReplyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 回复列表组件
interface ReplyListProps {
  replies: any[];
  locale: string;
  onRepliesUpdate?: (replies: any[]) => void;
}

export function ReplyList({ replies, locale, onRepliesUpdate }: ReplyListProps) {
  const [localReplies, setLocalReplies] = useState(replies);
  const [hoveredReplyPath, setHoveredReplyPath] = useState<string[] | null>(null);
  const [focusedReplyId, setFocusedReplyId] = useState<string | null>(null);
  const [focusedReplies, setFocusedReplies] = useState<any[] | null>(null);

  // 处理hover事件
  const handleHover = (replyId: string | null, parentPath: string[]) => {
    if (replyId) {
      // 确保 parentPath 是数组
      const safePath = Array.isArray(parentPath) ? parentPath : [];
      setHoveredReplyPath(safePath);
    } else {
      setHoveredReplyPath(null);
    }
  };

  // 处理聚焦回复
  const handleFocusReply = (replyId: string) => {
    // 找到对应的回复
    const findReplyAndChildren = (replies: any[], targetId: string): any | null => {
      for (const reply of replies) {
        if (reply.id === targetId) {
          return reply;
        }
        if (reply.replies && reply.replies.length > 0) {
          const found = findReplyAndChildren(reply.replies, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const targetReply = findReplyAndChildren(localReplies, replyId);
    if (targetReply) {
      setFocusedReplyId(replyId);
      // 只保存被聚焦的回复本身，它已经包含了所有子回复
      setFocusedReplies(targetReply);
    }
  };

  // 退出聚焦模式
  const exitFocusMode = () => {
    setFocusedReplyId(null);
    setFocusedReplies(null);
  };

  // 处理新回复成功
  const handleReplySuccess = (newReplyData: any, parentId: string) => {
    if (!newReplyData) return;

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
        'es-ES': 'hace un momento',
        'fr-FR': 'à l’instant',
        'ru-RU': 'только что',
        'ja-JP': '今すぐ',
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

    // 递归添加回复到对应的父回复中
    const addReplyToParent = (replies: any[]): any[] => {
      return replies.map(reply => {
        if (reply.id === parentId) {
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
            replies: addReplyToParent(reply.replies),
          };
        }
        return reply;
      });
    };

    const updatedReplies = addReplyToParent(localReplies);
    setLocalReplies(updatedReplies);
    
    if (onRepliesUpdate) {
      onRepliesUpdate(updatedReplies);
    }
  };

  // 如果处于聚焦模式，显示聚焦的回复
  if (focusedReplies) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          {/* 聚焦模式头部 */}
          <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Focus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {lang({
                    'zh-CN': `聚焦模式 - 显示回复 #${focusedReplyId?.slice(-6)} 及其子回复`,
                    'en-US': `Focus Mode - Showing reply #${focusedReplyId?.slice(-6)} and its replies`,
                    'zh-TW': `聚焦模式 - 顯示回覆 #${focusedReplyId?.slice(-6)} 及其子回覆`,
                    'es-ES': `Modo Enfoque - Mostrando respuesta #${focusedReplyId?.slice(-6)} y sus respuestas`,
                    'fr-FR': `Mode Focus - Affichage de la réponse #${focusedReplyId?.slice(-6)} et ses réponses`,
                    'ru-RU': `Режим фокуса - Показ ответа #${focusedReplyId?.slice(-6)} и его ответов`,
                    'ja-JP': `フォーカスモード - 返信 #${focusedReplyId?.slice(-6)} とその返信を表示`,
                    'de-DE': `Fokus-Modus - Antwort #${focusedReplyId?.slice(-6)} und ihre Antworten anzeigen`,
                    'pt-BR': `Modo Foco - Mostrando resposta #${focusedReplyId?.slice(-6)} e suas respostas`,
                    'ko-KR': `포커스 모드 - 답글 #${focusedReplyId?.slice(-6)} 및 하위 답글 표시`,
                  }, locale)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exitFocusMode}
                className="h-7 px-2 text-xs"
              >
                {lang({
                  'zh-CN': '退出聚焦',
                  'en-US': 'Exit Focus',
                  'zh-TW': '退出聚焦',
                  'es-ES': 'Salir del Enfoque',
                  'fr-FR': 'Sortir du Focus',
                  'ru-RU': 'Выйти из фокуса',
                  'ja-JP': 'フォーカス終了',
                  'de-DE': 'Fokus verlassen',
                  'pt-BR': 'Sair do Foco',
                  'ko-KR': '포커스 종료',
                }, locale)}
              </Button>
            </div>
          </div>

          {/* 聚焦的回复 - 包含该回复及其所有子回复 */}
          <div className="space-y-0">
            <SingleReply
              key={focusedReplies.id}
              reply={focusedReplies}
              locale={locale}
              level={0}
              onReplySuccess={handleReplySuccess}
              hoveredReplyPath={hoveredReplyPath}
              onHover={handleHover}
              parentPath={[]}
              onFocusReply={handleFocusReply}
              focusedReplyId={focusedReplyId}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (localReplies.length === 0) {
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
      <CardContent className="p-3">
        <div className="space-y-0">
          {localReplies.map((reply) => (
            <SingleReply
              key={reply.id}
              reply={reply}
              locale={locale}
              level={0}
              onReplySuccess={handleReplySuccess}
              hoveredReplyPath={hoveredReplyPath}
              onHover={handleHover}
              parentPath={[]}
              onFocusReply={handleFocusReply}
              focusedReplyId={focusedReplyId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}