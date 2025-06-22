'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
    Heart,
    Reply as ReplyIcon,
    ArrowUp,
    Focus,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { MarkdownEditor } from '@/components/markdown-editor';
import { markdownToHtml } from '@/lib/markdown-utils';
import token from '@/utils/userToken';
import { motion, AnimatePresence } from 'motion/react';
import { useBroadcast } from '@/store/useBroadcast';
import { EmojiPicker } from '@/components/emoji-picker';

interface ReplyEditorProps {
    replyId: string;
    locale: string;
    onSuccess: (newReplyData?: any) => void;
    onCancel: () => void;
    placeholder: string;
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
    highlightedReplyId?: string | null; // 新增：当前高亮的回复ID
    onHighlightChange?: (replyId: string | null) => void; // 新增：高亮变化回调
    isLastChild?: boolean; // 新增：是否是最后一个子元素
    childrenStatus?: boolean[]; // 新增：子层级的连接状态
    replyLikes?: Record<string, boolean>; // 新增：回复点赞状态
    onReplyLikeChange?: (replyId: string, isLiked: boolean) => void; // 新增：回复点赞状态变化回调
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
    focusedReplyId,
    highlightedReplyId,
    onHighlightChange,
    isLastChild = false,
    childrenStatus = [],
    replyLikes = {},
    onReplyLikeChange,
}: SingleReplyProps) {
    const [isLiked, setIsLiked] = useState(replyLikes[reply.id] || false);
    const [isLiking, setIsLiking] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [likeCount, setLikeCount] = useState(reply._count?.likes || 0);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false); // 移动版更多操作
    const [translationProgress, setTranslationProgress] = useState<{
        uuid: string;
        toastId: string;
    } | null>(null);

    const { registerCallback, unregisterCallback, broadcast } = useBroadcast();
    // 更新点赞状态当外部状态变化时
    useEffect(() => {
        console.log(
            'SingleReply - replyLikes updated:',
            replyLikes,
            'reply.id:',
            reply.id,
            'isLiked:',
            replyLikes[reply.id],
        ); // 调试日志
        setIsLiked(replyLikes[reply.id] || false);
    }, [replyLikes, reply.id]);
    // 检测移动设备
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 添加广播消息处理
    useEffect(() => {
        const handleBroadcastMessage = (message: unknown) => {
            if (typeof message === 'object' && message !== null && 'action' in message) {
                const typedMessage = message as {
                    action: string;
                    data?: { uuid?: string; status?: string; type?: string };
                };

                // 处理翻译状态更新
                if (
                    typedMessage.action === 'broadcast' &&
                    typedMessage.data &&
                    translationProgress
                ) {
                    console.log('Received broadcast data:', typedMessage.data);
                    console.log('Current translation progress:', translationProgress);

                    // 检查是否是任务状态更新且uuid匹配
                    if (
                        typedMessage.data.uuid === translationProgress.uuid &&
                        typedMessage.data.type === 'reply'
                    ) {
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
                                ),
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
                                                    body: JSON.stringify({
                                                        id: translationProgress.uuid,
                                                    }),
                                                });

                                                const result = await response.json();
                                                if (result.ok) {
                                                    // 重试成功，重新显示进度toast
                                                    const newToastId = toast(
                                                        <div className='flex items-center space-x-2'>
                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                            <span>
                                                                {lang(
                                                                    {
                                                                        'zh-CN':
                                                                            '正在重新翻译回复...',
                                                                        'zh-TW':
                                                                            '正在重新翻譯回覆...',
                                                                        'en-US':
                                                                            'Retranslating reply...',
                                                                        'es-ES':
                                                                            'Retraduciendo respuesta...',
                                                                        'fr-FR':
                                                                            'Retraduction de la réponse...',
                                                                        'ru-RU':
                                                                            'Повторный перевод ответа...',
                                                                        'ja-JP':
                                                                            '返信を再翻訳中...',
                                                                        'de-DE':
                                                                            'Antwort erneut übersetzen...',
                                                                        'pt-BR':
                                                                            'Retraduzindo resposta...',
                                                                        'ko-KR':
                                                                            '답글 재번역 중...',
                                                                    },
                                                                    locale,
                                                                )}
                                                            </span>
                                                        </div>,
                                                        {
                                                            duration: Infinity,
                                                            dismissible: false,
                                                        },
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
                                                                'en-US':
                                                                    'Retry failed, please try again later',
                                                                'es-ES':
                                                                    'Reintento falló, por favor intente de nuevo más tarde',
                                                                'fr-FR':
                                                                    'Échec de la nouvelle tentative, veuillez réessayer plus tard',
                                                                'ru-RU':
                                                                    'Повтор не удался, попробуйте позже',
                                                                'ja-JP':
                                                                    '再試行に失敗しました。後でもう一度お試しください',
                                                                'de-DE':
                                                                    'Wiederholung fehlgeschlagen, bitte versuchen Sie es später erneut',
                                                                'pt-BR':
                                                                    'Falha na nova tentativa, tente novamente mais tarde',
                                                                'ko-KR':
                                                                    '재시도 실패, 나중에 다시 시도하세요',
                                                            },
                                                            locale,
                                                        ),
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
                                                            'fr-FR':
                                                                'Échec de la demande de nouvelle tentative',
                                                            'ru-RU': 'Запрос на повтор не удался',
                                                            'ja-JP':
                                                                '再試行リクエストが失敗しました',
                                                            'de-DE':
                                                                'Wiederholungsanfrage fehlgeschlagen',
                                                            'pt-BR':
                                                                'Falha na solicitação de nova tentativa',
                                                            'ko-KR': '재시도 요청 실패',
                                                        },
                                                        locale,
                                                    ),
                                                );
                                            }
                                        },
                                    },
                                    duration: 10000,
                                },
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
    }, [registerCallback, unregisterCallback, translationProgress, locale]);

    const isTranslated = reply.originLang !== locale;
    const maxLevel = 8;
    // 确保 parentPath 是数组
    const safeParentPath = Array.isArray(parentPath) ? parentPath : [];
    const currentPath = [...safeParentPath, reply.id];

    // Git tree 风格的连接线渲染 - 移动版不再使用
    const renderTreeLines = () => {
        return null; // 移动版不显示连接线
    };

    // 移动版计算缩进 - 移动版不再缩进
    const getMobileIndent = () => {
        return 0; // 移动版不缩进
    };

    // 桌面版缩进样式
    const getDesktopIndentStyle = () => {
        if (isMobile || level === 0) return {};
        const indentSize = 3;
        return { paddingLeft: `${indentSize}%` };
    };

    // 桌面版连接线样式
    const getDesktopConnectionLineStyle = () => {
        if (isMobile || level === 0) return '';
        return 'absolute left-0 top-0 bottom-0 w-0.5 bg-muted/60';
    };

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

    // 检查当前回复是否被高亮
    const isHighlighted = highlightedReplyId === reply.id;

    // 滚动到指定回复
    const scrollToReply = (replyId: string) => {
        const element = document.getElementById(`reply-${replyId}`);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
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

    // 获取子回复总数（递归计算）
    const getTotalChildrenCount = (replies: any[]): number => {
        let count = 0;
        for (const reply of replies) {
            count += 1; // 当前回复
            if (reply.replies && reply.replies.length > 0) {
                count += getTotalChildrenCount(reply.replies); // 递归计算子回复
            }
        }
        return count;
    };

    const totalChildrenCount = hasChildReplies() ? getTotalChildrenCount(reply.replies) : 0;

    // 处理鼠标悬停
    const handleMouseEnter = () => {
        onHover?.(reply.id, currentPath);
        // 如果当前回复被高亮，hover时清除高亮
        if (highlightedReplyId === reply.id) {
            onHighlightChange?.(null);
        }
    };

    const handleMouseLeave = () => {
        onHover?.(null, []);
    };
    // 处理点赞
    const handleLike = async () => {
        if (isLiking) return;
        let result;

        setIsLiking(true);
        try {
            const response = await fetch('/api/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.get(),
                },
                body: JSON.stringify({
                    replyId: reply.id,
                    post: window.location.pathname.split('/')[3],
                    action: !isLiked,
                    locale: locale,
                }),
            });

            result = await response.json();
            if (result.ok || result.message?.ok) {
                const newLikedState = !isLiked;
                setIsLiked(newLikedState);
                setLikeCount((prev: number) => (isLiked ? prev - 1 : prev + 1));

                // 通知父组件更新点赞状态
                if (onReplyLikeChange) {
                    onReplyLikeChange(reply.id, newLikedState);
                }
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error(result?.message || 'Like failed');
        } finally {
            setIsLiking(false);
        }
    };

    // 获取显示内容
    const getDisplayContent = () => {
        if (!isTranslated || showOriginal) {
            return reply.content;
        }
        const translatedFieldName = `content${locale.replace('-', '').toUpperCase()}`;
        return reply[translatedFieldName] || reply.content;
    };
    // 处理回复
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
                const replyUuid = result.data?.taskId;

                // 显示翻译进度 toast
                const toastId = toast(
                    <div className='flex items-center space-x-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
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
                    },
                );

                // 保存翻译进度状态
                setTranslationProgress({
                    uuid: replyUuid,
                    toastId: toastId as string,
                });

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

                onReplySuccess(
                    {
                        id: result.data?.id || `temp-${Date.now()}`,
                        content: content.trim(),
                        originLang: locale,
                    },
                    reply.id,
                );
                setIsReplying(false);
                setContent('');
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

    // 高亮指定回复 - 修复版本
    const highlightParentReply = (replyId: string) => {
        // 清除之前的高亮
        onHighlightChange?.(null);

        // 设置新的高亮
        setTimeout(() => {
            onHighlightChange?.(replyId);
        }, 50); // 短暂延迟确保状态更新
    };

    // 移动版操作按钮组件
    const MobileActionButtons = () => (
        <div className='flex items-center gap-1'>
            {/* 主要操作按钮 */}
            <Button
                variant='ghost'
                size='sm'
                onClick={handleLike}
                disabled={isLiking}
                className='h-6 px-2 text-xs hover:bg-muted/50'>
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                <span className='ml-1 text-xs'>{likeCount}</span>
            </Button>

            {level < maxLevel && (
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsReplying(!isReplying)}
                    className='h-6 px-2 text-xs hover:bg-muted/50'>
                    <ReplyIcon className='h-3 w-3' />
                </Button>
            )}

            {/* 更多操作按钮 */}
            <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowMoreActions(!showMoreActions)}
                className='h-6 px-1 text-xs hover:bg-muted/50'>
                <MoreHorizontal className='h-3 w-3' />
            </Button>
        </div>
    );

    // 桌面版操作按钮组件
    const DesktopActionButtons = () => (
        <div className='flex items-center gap-1 flex-wrap'>
            {isTranslated && (
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowOriginal(!showOriginal)}
                    className='h-5 px-1.5 text-xs hover:bg-muted/50'>
                    {showOriginal
                        ? lang(
                              {
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
                              },
                              locale,
                          )
                        : lang(
                              {
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
                              },
                              locale,
                          )}
                </Button>
            )}

            <Button
                variant='ghost'
                size='sm'
                onClick={handleLike}
                disabled={isLiking}
                className='h-5 px-1.5 text-xs hover:bg-muted/50'>
                <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                {likeCount}
            </Button>

            {level < maxLevel && (
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsReplying(!isReplying)}
                    className='h-5 px-1.5 text-xs hover:bg-muted/50'>
                    <ReplyIcon className='h-3 w-3 mr-1' />
                    {lang(
                        {
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
                        },
                        locale,
                    )}
                </Button>
            )}
        </div>
    );

    return (
        <div
            id={`reply-${reply.id}`}
            style={isMobile ? {} : getDesktopIndentStyle()}
            className={`relative ${level > 0 && !isMobile ? 'border-l-2 border-transparent' : ''} transition-all duration-300 ${
                isHighlighted ? 'bg-primary/10 border-primary/20 rounded-lg' : ''
            } ${isMobile ? 'border-none' : ''}`} // 移动版去除边框
            onMouseEnter={!isMobile ? handleMouseEnter : undefined}
            onMouseLeave={!isMobile ? handleMouseLeave : undefined}>
            {/* 移动版不显示 Git tree 连接线 */}
            {!isMobile && renderTreeLines()}

            {/* 桌面版连接线 */}
            {level > 0 && !isMobile && <div className={getDesktopConnectionLineStyle()} />}

            <div
                className={`flex gap-2 py-2 relative ${isMobile ? 'px-0' : ''}`} // 移动版去除padding
                style={isMobile ? {} : {}} // 移动版不使用任何缩进样式
            >
                {/* 头像 */}
                <div className='flex-shrink-0'>
                    <Link
                        href={`/${locale}/user/${reply.user.uid}`}
                        className='hover:opacity-80 transition-opacity block'>
                        <Avatar className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}>
                            <AvatarImage
                                src={
                                    reply.user.avatar[0]?.id
                                        ? `/api/dynamicImage/emoji/?emoji=${reply.user.avatar[0].emoji}&background=${encodeURIComponent(
                                              reply.user.avatar[0].background.replaceAll(
                                                  '%',
                                                  '%25',
                                              ),
                                          )}`
                                        : undefined
                                }
                                alt={reply.user.nickname || 'User Avatar'}
                            />
                            <AvatarFallback
                                style={{
                                    backgroundColor: reply.user.avatar[0]?.background || '#e5e7eb',
                                }}>
                                {reply.user.avatar[0]?.emoji ||
                                    reply.user.profileEmoji ||
                                    reply.user.nickname?.charAt(0) ||
                                    'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>

                <div className='flex-1 min-w-0'>
                    {/* 用户信息和时间 */}
                    <div className='flex items-center gap-2 mb-1 flex-wrap'>
                        <Link
                            href={`/${locale}/user/${reply.user.uid}`}
                            className={`font-medium hover:text-primary transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {reply.user.nickname || 'Anonymous'}
                        </Link>
                        <span
                            className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            {reply.formattedTime}
                        </span>
                        {/* 移动版显示层级指示器 */}
                        {isMobile && level > 0 && (
                            <span className='text-muted-foreground text-xs bg-muted/30 px-1.5 py-0.5 rounded-full'>
                                L{level}
                            </span>
                        )}
                        {level > 0 && (
                            <span
                                className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                #{reply.id.slice(-6)}
                            </span>
                        )}

                        {/* 桌面版的额外信息 */}
                        {!isMobile && (
                            <>
                                {/* 层级指示器 */}
                                {level > 0 && (
                                    <span
                                        className={`text-muted-foreground text-xs transition-all duration-300 ${
                                            isCurrentHovered()
                                                ? 'opacity-100 text-primary font-medium'
                                                : isInHoverPath()
                                                  ? 'opacity-80 text-primary'
                                                  : 'opacity-50'
                                        }`}>
                                        L{level}
                                    </span>
                                )}

                                {/* 折叠按钮 */}
                                {hasChildReplies() && (
                                    <button
                                        onClick={() => setIsCollapsed(!isCollapsed)}
                                        className='text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs'>
                                        <motion.div
                                            animate={{ rotate: isCollapsed ? 0 : 90 }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}>
                                            <ChevronRight className='h-3 w-3' />
                                        </motion.div>
                                        <span className='text-xs'>
                                            {isCollapsed
                                                ? lang(
                                                      {
                                                          'zh-CN': `展开 ${totalChildrenCount} 条回复`,
                                                          'en-US': `Expand ${totalChildrenCount} replies`,
                                                          'zh-TW': `展開 ${totalChildrenCount} 條回覆`,
                                                          'es-ES': `Expandir ${totalChildrenCount} respuestas`,
                                                          'fr-FR': `Développer ${totalChildrenCount} réponses`,
                                                          'ru-RU': `Развернуть ${totalChildrenCount} ответов`,
                                                          'ja-JP': `${totalChildrenCount} 件の返信を展開`,
                                                          'de-DE': `${totalChildrenCount} Antworten erweitern`,
                                                          'pt-BR': `Expandir ${totalChildrenCount} respostas`,
                                                          'ko-KR': `${totalChildrenCount}개 답글 펼치기`,
                                                      },
                                                      locale,
                                                  )
                                                : lang(
                                                      {
                                                          'zh-CN': '折叠',
                                                          'en-US': 'Collapse',
                                                          'zh-TW': '折疊',
                                                          'es-ES': 'Colapsar',
                                                          'fr-FR': 'Réduire',
                                                          'ru-RU': 'Свернуть',
                                                          'ja-JP': '折りたたみ',
                                                          'de-DE': 'Einklappen',
                                                          'pt-BR': 'Recolher',
                                                          'ko-KR': '접기',
                                                      },
                                                      locale,
                                                  )}
                                        </span>
                                    </button>
                                )}

                                {/* 其他桌面版专用按钮 */}
                                {isCurrentHovered() && getParentReplyId() && (
                                    <button
                                        onClick={() => highlightParentReply(getParentReplyId()!)}
                                        className='text-blue-500 text-xs font-medium hover:text-blue-600 transition-colors flex items-center gap-1'
                                        style={{
                                            animation: 'fadeIn 0.2s ease-out',
                                        }}>
                                        <ArrowUp className='h-3 w-3' />
                                        {lang(
                                            {
                                                'zh-CN': '高亮原回复',
                                                'en-US': 'Highlight original',
                                                'zh-TW': '高亮原回覆',
                                                'es-ES': 'Resaltar original',
                                                'fr-FR': 'Surligner original',
                                                'ru-RU': 'Выделить оригинал',
                                                'ja-JP': '元をハイライト',
                                                'de-DE': 'Original hervorheben',
                                                'pt-BR': 'Destacar original',
                                                'ko-KR': '원본 강조',
                                            },
                                            locale,
                                        )}
                                    </button>
                                )}

                                {isCurrentHovered() && hasChildReplies() && (
                                    <button
                                        onClick={() => onFocusReply?.(reply.id)}
                                        className='text-green-500 text-xs font-medium hover:text-green-600 transition-colors flex items-center gap-1'
                                        style={{
                                            animation: 'fadeIn 0.2s ease-out',
                                        }}>
                                        <Focus className='h-3 w-3' />
                                        {lang(
                                            {
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
                                            },
                                            locale,
                                        )}
                                    </button>
                                )}

                                {isDirectParent() && (
                                    <span className='text-orange-500 text-xs font-medium animate-pulse'>
                                        ↳{' '}
                                        {lang(
                                            {
                                                'zh-CN': '原回复',
                                                'en-US': 'Original',
                                                'zh-TW': '原回覆',
                                                'es-ES': 'Original',
                                                'fr-FR': 'Original',
                                                'ru-RU': 'Оригинал',
                                                'ja-JP': '元',
                                                'de-DE': 'Original',
                                                'pt-BR': 'Original',
                                                'ko-KR': '원본',
                                            },
                                            locale,
                                        )}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* 移动版折叠按钮 - 显示为小徽章 */}
                    {isMobile && hasChildReplies() && (
                        <div className='mb-2'>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className='text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs bg-muted/20 px-2 py-1 rounded-full'>
                                <motion.div
                                    animate={{ rotate: isCollapsed ? 0 : 90 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}>
                                    <ChevronRight className='h-3 w-3' />
                                </motion.div>
                                <span className='text-xs'>
                                    {isCollapsed
                                        ? `${totalChildrenCount} ${lang(
                                              {
                                                  'zh-CN': '条回复',
                                                  'en-US': 'replies',
                                                  'zh-TW': '條回覆',
                                                  'es-ES': 'respuestas',
                                                  'fr-FR': 'réponses',
                                                  'ru-RU': 'ответов',
                                                  'ja-JP': '件の返信',
                                                  'de-DE': 'Antworten',
                                                  'pt-BR': 'respostas',
                                                  'ko-KR': '개 답글',
                                              },
                                              locale,
                                          )}`
                                        : lang(
                                              {
                                                  'zh-CN': '折叠',
                                                  'en-US': 'Collapse',
                                                  'zh-TW': '折疊',
                                                  'es-ES': 'Colapsar',
                                                  'fr-FR': 'Réduire',
                                                  'ru-RU': 'Свернуть',
                                                  'ja-JP': '折りたたみ',
                                                  'de-DE': 'Einklappen',
                                                  'pt-BR': 'Recolher',
                                                  'ko-KR': '접기',
                                              },
                                              locale,
                                          )}
                                </span>
                            </button>
                        </div>
                    )}

                    {/* 回复内容 */}
                    <div
                        className={`prose prose-sm max-w-none dark:prose-invert mb-2
                       prose-p:my-1 prose-p:leading-relaxed prose-p:text-sm
                       prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:text-sm
                       prose-strong:text-sm prose-em:text-sm prose-li:text-sm
                       ${isMobile ? 'text-xs' : 'text-sm'}`}
                        dangerouslySetInnerHTML={{
                            __html: markdownToHtml(getDisplayContent()),
                        }}
                    />

                    {/* 操作按钮 */}
                    {isMobile ? <MobileActionButtons /> : <DesktopActionButtons />}

                    {/* 移动版更多操作面板 */}
                    {isMobile && showMoreActions && (
                        <div className='mt-2 p-2 bg-muted/20 rounded border'>
                            <div className='flex flex-wrap gap-2'>
                                {isTranslated && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            setShowOriginal(!showOriginal);
                                            setShowMoreActions(false);
                                        }}
                                        className='h-6 px-2 text-xs'>
                                        {showOriginal
                                            ? lang(
                                                  {
                                                      'zh-CN': '显示译文',
                                                      'en-US': 'Show translation',
                                                      'zh-TW': '顯示譯文',
                                                      'es-ES': 'Mostrar traducción',
                                                      'fr-FR': 'Afficher la traduction',
                                                      'ru-RU': 'Показать перевод',
                                                      'ja-JP': '翻訳を表示',
                                                      'de-DE': 'Übersetzung anzeigen',
                                                      'pt-BR': 'Mostrar tradução',
                                                      'ko-KR': '번역 보기',
                                                  },
                                                  locale,
                                              )
                                            : lang(
                                                  {
                                                      'zh-CN': '显示原文',
                                                      'en-US': 'Show original',
                                                      'zh-TW': '顯示原文',
                                                      'es-ES': 'Mostrar original',
                                                      'fr-FR': "Afficher l'original",
                                                      'ru-RU': 'Показать оригинал',
                                                      'ja-JP': '原文を表示',
                                                      'de-DE': 'Original anzeigen',
                                                      'pt-BR': 'Mostrar original',
                                                      'ko-KR': '원문 보기',
                                                  },
                                                  locale,
                                              )}
                                    </Button>
                                )}

                                {/* 高亮原回复按钮 - 移动版新增 */}
                                {getParentReplyId() && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            highlightParentReply(getParentReplyId()!);
                                            setShowMoreActions(false);
                                        }}
                                        className='h-6 px-2 text-xs'>
                                        <ArrowUp className='h-3 w-3 mr-1' />
                                        {lang(
                                            {
                                                'zh-CN': '高亮原回复',
                                                'en-US': 'Highlight original',
                                                'zh-TW': '高亮原回覆',
                                                'es-ES': 'Resaltar original',
                                                'fr-FR': 'Surligner original',
                                                'ru-RU': 'Выделить оригинал',
                                                'ja-JP': '元をハイライト',
                                                'de-DE': 'Original hervorheben',
                                                'pt-BR': 'Destacar original',
                                                'ko-KR': '원본 강조',
                                            },
                                            locale,
                                        )}
                                    </Button>
                                )}

                                {hasChildReplies() && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            onFocusReply?.(reply.id);
                                            setShowMoreActions(false);
                                        }}
                                        className='h-6 px-2 text-xs'>
                                        <Focus className='h-3 w-3 mr-1' />
                                        {lang(
                                            {
                                                'zh-CN': '聚焦',
                                                'en-US': 'Focus',
                                                'zh-TW': '聚焦',
                                                'es-ES': 'Enfocar',
                                                'fr-FR': 'Focus',
                                                'ru-RU': 'Фокус',
                                                'ja-JP': 'フォーカス',
                                                'de-DE': 'Fokus',
                                                'pt-BR': 'Foco',
                                                'ko-KR': '포커스',
                                            },
                                            locale,
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 回复编辑器 */}
                    <AnimatePresence mode='wait'>
                        {isReplying && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{
                                    height: 'auto',
                                    opacity: 1,
                                    marginTop: 8,
                                    transition: {
                                        duration: 0.3,
                                        ease: 'easeInOut',
                                        opacity: { duration: 0.15, delay: 0.15 },
                                    },
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                    marginTop: 0,
                                    transition: {
                                        duration: 0.3,
                                        ease: 'easeInOut',
                                        opacity: { duration: 0.15 },
                                    },
                                }}
                                style={{ overflow: 'hidden' }}
                                className='flex gap-2 py-2'>
                                {/* 头像 */}
                                <div className='flex-shrink-0'>
                                    <Avatar className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}>
                                        <AvatarImage
                                            src={
                                                token.getObject()?.avatar
                                                    ? `/api/dynamicImage/emoji/?emoji=${token.getObject()?.avatar.emoji}&background=${encodeURIComponent(
                                                          token
                                                              .getObject()
                                                              ?.avatar?.background?.replaceAll(
                                                                  '%',
                                                                  '%25',
                                                              ) || '',
                                                      )}`
                                                    : undefined
                                            }
                                            alt='Your Avatar'
                                        />
                                        <AvatarFallback
                                            style={{
                                                backgroundColor:
                                                    token.getObject()?.avatar?.background ||
                                                    '#e5e7eb',
                                            }}>
                                            {token.getObject()?.avatar?.emoji ||
                                                token.getObject()?.nickname?.charAt(0) ||
                                                'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className='flex-1 min-w-0'>
                                    {/* 用户信息 */}
                                    <div className='flex items-center gap-2 mb-1'>
                                        <span
                                            className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                            {token.getObject()?.nickname || 'Anonymous'}
                                        </span>
                                        <span
                                            className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                            {lang(
                                                {
                                                    'zh-CN': '正在回复...',
                                                    'en-US': 'Replying...',
                                                    'zh-TW': '正在回覆...',
                                                    'es-ES': 'Respondiendo...',
                                                    'fr-FR': 'En cours de réponse...',
                                                    'ru-RU': 'Отвечаю...',
                                                    'ja-JP': '返信中...',
                                                    'de-DE': 'Antworten...',
                                                    'pt-BR': 'Respondendo...',
                                                    'ko-KR': '답글 작성 중...',
                                                },
                                                locale,
                                            )}
                                        </span>
                                    </div>

                                    {/* 回复内容输入区 */}
                                    <div className='mb-2'>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder={lang(
                                                {
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
                                                },
                                                locale,
                                            )}
                                            className={`w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-background ${
                                                isMobile ? 'text-xs' : 'text-sm'
                                            }`}
                                            rows={isMobile ? 2 : 3}
                                            maxLength={200}
                                        />
                                    </div>

                                    {/* 工具栏 */}
                                    <div className='flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <EmojiPicker
                                                onEmojiSelect={(emoji) =>
                                                    setContent((prev) => prev + emoji)
                                                }
                                                locale={locale}
                                                className={isMobile ? 'h-6 w-6' : 'h-7 w-7'}
                                            />
                                            <span
                                                className={`text-muted-foreground ${
                                                    content.length > 180 ? 'text-destructive' : ''
                                                } ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                                {content.length}/200
                                            </span>
                                        </div>
                                        <div className='flex gap-1'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => {
                                                    setIsReplying(false);
                                                    setContent('');
                                                }}
                                                className={`px-2 ${isMobile ? 'h-6 text-xs' : 'h-7 text-xs'}`}>
                                                {lang(
                                                    {
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
                                                    },
                                                    locale,
                                                )}
                                            </Button>
                                            <Button
                                                onClick={submitReply}
                                                disabled={
                                                    isSubmitting ||
                                                    !content.trim() ||
                                                    content.length > 200
                                                }
                                                size='sm'
                                                className={`px-2 ${isMobile ? 'h-6 text-xs' : 'h-7 text-xs'}`}>
                                                {isSubmitting
                                                    ? lang(
                                                          {
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
                                                          },
                                                          locale,
                                                      )
                                                    : lang(
                                                          {
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
                                                          },
                                                          locale,
                                                      )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 子回复 - 移动版平铺显示 */}
            <AnimatePresence initial={false}>
                {reply.replies && reply.replies.length > 0 && !isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                                height: { duration: 0.3, ease: 'easeInOut' },
                                opacity: { duration: 0.2, delay: 0.1 },
                            },
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                                height: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
                                opacity: { duration: 0.2 },
                            },
                        }}
                        style={{ overflow: 'hidden' }}
                        className={`space-y-0 ${isMobile ? 'ml-0 pl-0' : ''}`} // 移动版去除左边距
                    >
                        {reply.replies.map((subReply: any, index: number) => {
                            // 移动版不需要连接状态
                            const newChildrenStatus = isMobile ? [] : [...childrenStatus];
                            if (!isMobile && level >= 0) {
                                newChildrenStatus[level] = index < reply.replies.length - 1;
                            }

                            return (
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
                                    highlightedReplyId={highlightedReplyId}
                                    onHighlightChange={onHighlightChange}
                                    isLastChild={index === reply.replies.length - 1}
                                    childrenStatus={newChildrenStatus}
                                    replyLikes={replyLikes}
                                    onReplyLikeChange={onReplyLikeChange}
                                />
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// 回复列表组件
interface ReplyListProps {
    replies: any[];
    locale: string;
    onRepliesUpdate?: (replies: any[]) => void;
    replyLikes?: Record<string, boolean>; // 新增：回复点赞状态
    onReplyLikeChange?: (replyId: string, isLiked: boolean) => void; // 新增：回复点赞状态变化回调
}

export function ReplyList({
    replies,
    locale,
    onRepliesUpdate,
    replyLikes = {},
    onReplyLikeChange,
}: ReplyListProps) {
    console.log('ReplyList received replyLikes:', replyLikes); // 调试日志
    const [localReplies, setLocalReplies] = useState(replies);
    const [hoveredReplyPath, setHoveredReplyPath] = useState<string[] | null>(null);
    const [focusedReplyId, setFocusedReplyId] = useState<string | null>(null);
    const [focusedReplies, setFocusedReplies] = useState<any | null>(null);
    const [highlightedReplyId, setHighlightedReplyId] = useState<string | null>(null);

    // 处理高亮变化
    const handleHighlightChange = (replyId: string | null) => {
        setHighlightedReplyId(replyId);
    };

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
            [`content${locale.replace('-', '').toUpperCase()}`]: newReplyData.content,
            createdAt: new Date().toISOString(),
            formattedTime: lang(
                {
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
                },
                locale,
            ),
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
            return replies.map((reply) => {
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
            <Card className='overflow-hidden'>
                <CardContent className='p-4'>
                    {' '}
                    {/* 从 p-3 改为 p-4 */}
                    {/* 聚焦模式头部 */}
                    <div className='mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Focus className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium text-primary'>
                                    {lang(
                                        {
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
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={exitFocusMode}
                                className='h-7 px-2 text-xs'>
                                {lang(
                                    {
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
                                    },
                                    locale,
                                )}
                            </Button>
                        </div>
                    </div>{' '}
                    {/* 聚焦的回复 - 包含该回复及其所有子回复 */}
                    <div className='space-y-0'>
                        {' '}
                        <SingleReply
                            key={focusedReplies.id}
                            reply={focusedReplies}
                            locale={locale}
                            level={0}
                            onReplySuccess={handleReplySuccess}
                            hoveredReplyPath={hoveredReplyPath || undefined}
                            onHover={handleHover}
                            parentPath={[]}
                            onFocusReply={handleFocusReply}
                            focusedReplyId={focusedReplyId}
                            highlightedReplyId={highlightedReplyId}
                            onHighlightChange={handleHighlightChange}
                            replyLikes={replyLikes}
                            onReplyLikeChange={onReplyLikeChange}
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (localReplies.length === 0) {
        return (
            <div className='text-center py-12 text-muted-foreground'>
                <div className='text-4xl mb-4'>💬</div>
                <p className='text-lg'>
                    {lang(
                        {
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
                        },
                        locale,
                    )}
                </p>
                <p className='text-sm mt-2'>
                    {lang(
                        {
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
                        },
                        locale,
                    )}
                </p>
            </div>
        );
    }

    return (
        <Card className='overflow-hidden'>
            <CardContent className='p-6'>
                <div className='space-y-0'>
                    {localReplies.map((reply) => (
                        <SingleReply
                            key={reply.id}
                            reply={reply}
                            locale={locale}
                            level={0}
                            onReplySuccess={handleReplySuccess}
                            hoveredReplyPath={hoveredReplyPath || undefined}
                            onHover={handleHover}
                            parentPath={[]}
                            onFocusReply={handleFocusReply}
                            focusedReplyId={focusedReplyId}
                            highlightedReplyId={highlightedReplyId}
                            onHighlightChange={handleHighlightChange}
                            replyLikes={replyLikes}
                            onReplyLikeChange={onReplyLikeChange}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
