'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButton } from '@/components/share-button';
import { Heart, MessageCircle, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { ReplyList } from '@/components/reply-list';
import { EmojiPicker } from '@/components/emoji-picker';
import token from '@/utils/userToken';
import { useBroadcast } from '@/store/useBroadcast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface PostDetailClientProps {
    post: {
        id: number;
        title: string;
        likes: number;
        replies: number;
        isTranslated?: boolean;
        authorUid?: number; // 添加作者uid
    };
    replies: unknown[];
    locale: string;
    currentPage: number;
    totalPages: number;
    slug: string; // 添加 slug 参数
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
    slug,
}: PostDetailClientProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [showReplyEditor, setShowReplyEditor] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyLikes, setReplyLikes] = useState<Record<string, boolean>>({});
    const [likeStatusLoaded, setLikeStatusLoaded] = useState(false);
    const [localReplies, setLocalReplies] = useState(replies); // 添加本地回复状态
    const [translationProgress, setTranslationProgress] = useState<{
        uuid: string;
        toastId: string;
    } | null>(null);

    const { registerCallback, unregisterCallback } = useBroadcast(); // 原文相关状态 - 只用于按钮显示
    const [showOriginal, setShowOriginal] = useState(false);
    const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);
    const [hasOriginalContent, setHasOriginalContent] = useState(false);

    // 监听来自 PostContent 的状态更新
    useEffect(() => {
        const handleStatusUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { showingOriginal, hasOriginal, loading } = customEvent.detail;
            setShowOriginal(showingOriginal);
            setHasOriginalContent(hasOriginal);
            setIsLoadingOriginal(loading);
        };

        window.addEventListener(`post-status-update-${post.id}`, handleStatusUpdate);

        return () => {
            window.removeEventListener(`post-status-update-${post.id}`, handleStatusUpdate);
        };
    }, [post.id]);

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

    const pathname = usePathname(); // 生成分页链接
    const generatePageUrl = (page: number) => {
        const pathParts = pathname.split('/');
        // 检查当前URL是否已经包含 /page/ 结构
        const pageIndex = pathParts.findIndex((part) => part === 'page');

        if (pageIndex !== -1 && pageIndex < pathParts.length - 1) {
            // 如果已经有 /page/ 结构，替换页码
            pathParts[pageIndex + 1] = page.toString();
        } else {
            // 如果没有 /page/ 结构，添加 /page/X
            pathParts.push('page', page.toString());
        }

        return pathParts.join('/');
    };

    // 分页组件
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // 调整起始页，确保显示足够的页面
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <>
                <div className='flex items-center justify-center gap-2'>
                    {/* 上一页按钮 */}
                    {currentPage > 1 && (
                        <Link href={generatePageUrl(currentPage - 1)}>
                            <Button variant='outline' size='sm' className='flex items-center gap-1'>
                                <ChevronLeft className='h-4 w-4' />
                                {lang(
                                    {
                                        'zh-CN': '上一页',
                                        'zh-TW': '上一頁',
                                        'en-US': 'Previous',
                                        'es-ES': 'Anterior',
                                        'fr-FR': 'Précédent',
                                        'ru-RU': 'Назад',
                                        'ja-JP': '前へ',
                                        'de-DE': 'Zurück',
                                        'pt-BR': 'Anterior',
                                        'ko-KR': '이전',
                                    },
                                    locale,
                                )}
                            </Button>
                        </Link>
                    )}

                    {/* 第一页和省略号 */}
                    {startPage > 1 && (
                        <>
                            <Link href={generatePageUrl(1)}>
                                <Button variant='outline' size='sm'>
                                    1
                                </Button>
                            </Link>
                            {startPage > 2 && <span className='text-muted-foreground'>...</span>}
                        </>
                    )}

                    {/* 页码按钮 */}
                    {pages.map((page) => (
                        <Link key={page} href={generatePageUrl(page)}>
                            <Button
                                variant={page === currentPage ? 'default' : 'outline'}
                                size='sm'
                                className={page === currentPage ? 'pointer-events-none' : ''}>
                                {page}
                            </Button>
                        </Link>
                    ))}

                    {/* 最后一页和省略号 */}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <span className='text-muted-foreground'>...</span>
                            )}
                            <Link href={generatePageUrl(totalPages)}>
                                <Button variant='outline' size='sm'>
                                    {totalPages}
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* 下一页按钮 */}
                    {currentPage < totalPages && (
                        <Link href={generatePageUrl(currentPage + 1)}>
                            <Button variant='outline' size='sm' className='flex items-center gap-1'>
                                {lang(
                                    {
                                        'zh-CN': '下一页',
                                        'zh-TW': '下一頁',
                                        'en-US': 'Next',
                                        'es-ES': 'Siguiente',
                                        'fr-FR': 'Suivant',
                                        'ru-RU': 'Далее',
                                        'ja-JP': '次へ',
                                        'de-DE': 'Weiter',
                                        'pt-BR': 'Próximo',
                                        'ko-KR': '다음',
                                    },
                                    locale,
                                )}
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </Link>
                    )}
                </div>

                {/* 页面信息 */}
                <div className='text-center text-sm text-muted-foreground mt-2'>
                    {lang(
                        {
                            'zh-CN': `第 ${currentPage} 页，共 ${totalPages} 页`,
                            'zh-TW': `第 ${currentPage} 頁，共 ${totalPages} 頁`,
                            'en-US': `Page ${currentPage} of ${totalPages}`,
                            'es-ES': `Página ${currentPage} de ${totalPages}`,
                            'fr-FR': `Page ${currentPage} sur ${totalPages}`,
                            'ru-RU': `Страница ${currentPage} из ${totalPages}`,
                            'ja-JP': `${currentPage} / ${totalPages} ページ`,
                            'de-DE': `Seite ${currentPage} von ${totalPages}`,
                            'pt-BR': `Página ${currentPage} de ${totalPages}`,
                            'ko-KR': `${currentPage} / ${totalPages} 페이지`,
                        },
                        locale,
                    )}
                </div>
            </>
        );
    };

    const MAX_REPLY_LENGTH = 200;
    const editorVariants = {
        hidden: {
            height: 0,
            opacity: 0,
            marginTop: 0,
            transition: {
                duration: 0.3,
                opacity: { duration: 0.15 },
            },
        },
        visible: {
            height: 'auto',
            opacity: 1,
            marginTop: 24, // 对应 mt-6 (1.5rem = 24px)
            transition: {
                duration: 0.3,
                opacity: { duration: 0.15, delay: 0.15 },
            },
        },
    };

    // 监控replyLikes状态变化
    useEffect(() => {
        console.log('PostDetailClient - replyLikes updated:', replyLikes);
        console.log('PostDetailClient - likeStatusLoaded:', likeStatusLoaded);
    }, [replyLikes, likeStatusLoaded]);

    // 处理回复点赞状态变化
    const handleReplyLikeChange = (replyId: string, isLiked: boolean) => {
        setReplyLikes((prev) => ({
            ...prev,
            [replyId]: isLiked,
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
                const response = await fetch(
                    `/api/like/status?postId=${post.id}&locale=${locale}`,
                    {
                        headers: {
                            Authorization: `Bearer ${userToken}`,
                        },
                    },
                );

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
                lang(
                    {
                        'zh-CN': '请先登录',
                        'zh-TW': '請先登入',
                        'en-US': 'Please login first',
                        'es-ES': 'Por favor inicia sesión primero',
                        'fr-FR': "Veuillez vous connecter d'abord",
                        'ru-RU': 'Пожалуйста, сначала войдите в систему',
                        'ja-JP': 'まずログインしてください',
                        'de-DE': 'Bitte melden Sie sich zuerst an',
                        'pt-BR': 'Por favor, faça login primeiro',
                        'ko-KR': '먼저 로그인해주세요',
                    },
                    locale,
                ),
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
                        lang(
                            {
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
                            },
                            locale,
                        ),
                );
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error(
                lang(
                    {
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
                    },
                    locale,
                ),
            );
        } finally {
            setIsLiking(false);
        }
    }; // 获取原文内容 - 改为触发事件
    const fetchOriginalContent = async () => {
        // 触发 PostContent 组件的原文切换事件
        window.dispatchEvent(new Event(`post-original-toggle-${post.id}`));
    };

    const submitReply = async () => {
        if (!replyContent.trim()) return;

        const userToken = token.get();
        if (!userToken) {
            toast.error(
                lang(
                    {
                        'zh-CN': '请先登录',
                        'zh-TW': '請先登入',
                        'en-US': 'Please login first',
                        'es-ES': 'Por favor inicia sesión primero',
                        'fr-FR': "Veuillez vous connecter d'abord",
                        'ru-RU': 'Пожалуйста, сначала войдите в систему',
                        'ja-JP': 'まずログインしてください',
                        'de-DE': 'Bitte melden Sie sich zuerst an',
                        'pt-BR': 'Por favor, faça login primeiro',
                        'ko-KR': '먼저 로그인해주세요',
                    },
                    locale,
                ),
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
                    content: replyContent.trim(),
                    postid: post.id,
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
                            'ko-KR': '답글이 成功적으로 등록되었습니다',
                        },
                        locale,
                    ),
                );
                // 创建新回复对象
                const newReply = {
                    id: result.data?.id ? String(result.data.id) : `temp-${Date.now()}`,
                    content: replyContent.trim(),
                    originLang: locale,
                    [`content${locale.replace('-', '').toUpperCase()}`]: replyContent.trim(),
                    createdAt: new Date().toISOString(),
                    formattedTime: lang(
                        {
                            'zh-CN': '刚刚',
                            'en-US': 'just now',
                            'zh-TW': '剛剛',
                            'es-ES': 'hace un momento',
                            'fr-FR': "à l'instant",
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
                }; // 添加新回复到本地状态
                setLocalReplies((prev) => [newReply, ...prev]);
                setReplyContent('');
                setShowReplyEditor(false);
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

    const handleEmojiSelect = (emoji: string) => {
        setReplyContent((prev) => prev + emoji);
    };
    return (
        <div className='space-y-6'>
            {/* 交互按钮卡片 */}
            <Card>
                <CardContent className='p-4'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleLike}
                            disabled={isLiking || !likeStatusLoaded}
                            className={`transition-colors ${isLiked ? 'text-red-500 border-red-500' : ''}`}>
                            {isLiking || !likeStatusLoaded ? (
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            ) : (
                                <Heart
                                    className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`}
                                />
                            )}
                            {likeCount}
                        </Button>{' '}
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setShowReplyEditor(!showReplyEditor)}>
                            <MessageCircle className='h-4 w-4 mr-2' />
                            {post.replies}
                        </Button>{' '}
                        {/* 分享按钮 */}
                        <ShareButton
                            postId={post.id.toString()}
                            slug={slug}
                            title={post.title}
                            locale={locale}
                        />
                        {/* 查看原文按钮 - 仅在有翻译时显示 */}
                        {post.isTranslated && (
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={fetchOriginalContent}
                                disabled={isLoadingOriginal}
                                className='text-xs'>
                                {isLoadingOriginal ? (
                                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                ) : (
                                    <FileText className='h-4 w-4 mr-2' />
                                )}
                                {showOriginal && hasOriginalContent
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
                                              'zh-CN': '查看原文',
                                              'en-US': 'Show original',
                                              'zh-TW': '查看原文',
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
                    </div>
                </CardContent>
            </Card>
            {/* 回复编辑器 */}
            <AnimatePresence mode='wait'>
                {showReplyEditor && (
                    <motion.div
                        initial='hidden'
                        animate='visible'
                        exit='hidden'
                        variants={editorVariants}
                        style={{ overflow: 'hidden' }}
                        layout>
                        <Card>
                            <CardContent className='p-4'>
                                <div className='space-y-4'>
                                    <Textarea
                                        placeholder={lang(
                                            {
                                                'zh-CN': '写下你的回复...',
                                                'en-US': 'Write your reply...',
                                                'zh-TW': '寫下你的回覆...',
                                                'es-ES': 'Escribe tu respuesta...',
                                                'fr-FR': 'Écrivez votre réponse...',
                                                'ru-RU': 'Напишите ваш ответ...',
                                                'ja-JP': '返信を書いてください...',
                                                'de-DE': 'Schreiben Sie Ihre Antwort...',
                                                'pt-BR': 'Escreva sua resposta...',
                                                'ko-KR': '답글을 작성하세요...',
                                            },
                                            locale,
                                        )}
                                        value={replyContent}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            if (newValue.length <= MAX_REPLY_LENGTH) {
                                                setReplyContent(newValue);
                                            }
                                        }}
                                        className='min-h-[100px] resize-none'
                                        maxLength={MAX_REPLY_LENGTH}
                                    />
                                    <div className='flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <EmojiPicker
                                                onEmojiSelect={handleEmojiSelect}
                                                locale={locale}
                                            />
                                            <div
                                                className={`text-xs ${
                                                    replyContent.length > MAX_REPLY_LENGTH * 0.9
                                                        ? 'text-destructive'
                                                        : 'text-muted-foreground'
                                                }`}>
                                                {replyContent.length}/{MAX_REPLY_LENGTH}
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => setShowReplyEditor(false)}>
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
                                                size='sm'
                                                onClick={submitReply}
                                                disabled={
                                                    isSubmitting ||
                                                    !replyContent.trim() ||
                                                    replyContent.length > MAX_REPLY_LENGTH
                                                }>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                                        {lang(
                                                            {
                                                                'zh-CN': '发送中...',
                                                                'zh-TW': '發送中...',
                                                                'en-US': 'Sending...',
                                                                'es-ES': 'Enviando...',
                                                                'fr-FR': 'Envoyer...',
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
                    </motion.div>
                )}
            </AnimatePresence>{' '}            {/* 回复列表 */}{' '}
            <ReplyList
                replies={localReplies}
                locale={locale}
                replyLikes={replyLikes}
                onReplyLikeChange={handleReplyLikeChange}
                postAuthorUid={post.authorUid} // 传递帖子作者uid
            />
            {/* 分页控件 */}
            <PaginationControls />
        </div>
    );
}
