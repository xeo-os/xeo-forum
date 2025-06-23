'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import { markdownToHtml } from '@/lib/markdown-utils';

interface PostContentProps {
    initialContent: string;
    postId: number;
    locale: string;
}

export function PostContent({ 
    initialContent, 
    postId,
    locale
}: PostContentProps) {const [showOriginal, setShowOriginal] = useState(false);
    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);    // 发送状态更新事件到 PostDetailClient
    const sendStatusUpdate = useCallback(() => {
        const event = new CustomEvent(`post-status-update-${postId}`, {
            detail: {
                showingOriginal: showOriginal,
                hasOriginal: !!originalContent,
                loading: isLoadingOriginal
            }
        });
        window.dispatchEvent(event);
    }, [postId, showOriginal, originalContent, isLoadingOriginal]);    // 当状态变化时发送更新
    useEffect(() => {
        sendStatusUpdate();
    }, [sendStatusUpdate]);    // 获取原文内容
    const fetchOriginalContent = useCallback(async () => {
        if (originalContent) {
            // 如果已经有原文内容，直接切换
            setShowOriginal(!showOriginal);
            return;
        }

        setIsLoadingOriginal(true);
        try {
            const response = await fetch(`/api/origin?type=post&id=${postId}`);
            if (response.ok) {                const data = await response.json();
                if (data.ok && data.data?.originalContent) {
                    // 将原文 Markdown 转换为 HTML，以保持与初始内容相同的格式
                    const htmlContent = await markdownToHtml(data.data.originalContent);
                    setOriginalContent(htmlContent);
                    // 添加短暂延迟，让动画效果更明显
                    setTimeout(() => {
                        setShowOriginal(true);
                    }, 100);
                } else {
                    toast.error(
                        lang(
                            {
                                'zh-CN': '获取原文失败',
                                'en-US': 'Failed to get original content',
                                'zh-TW': '獲取原文失敗',
                                'es-ES': 'Error al obtener contenido original',
                                'fr-FR': 'Échec de la récupération du contenu original',
                                'ru-RU': 'Не удалось получить оригинальный контент',
                                'ja-JP': '原文の取得に失敗しました',
                                'de-DE': 'Originalinhalt konnte nicht abgerufen werden',
                                'pt-BR': 'Falha ao obter conteúdo original',
                                'ko-KR': '원문 가져오기 실패',
                            },
                            locale,
                        ),
                    );
                }
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('Error fetching original content:', error);
            toast.error(
                lang(
                    {
                        'zh-CN': '网络错误，请重试',
                        'en-US': 'Network error, please try again',
                        'zh-TW': '網路錯誤，請重試',
                        'es-ES': 'Error de red, por favor intente de nuevo',
                        'fr-FR': 'Erreur réseau, veuillez réessayer',
                        'ru-RU': 'Сетевая ошибка, попробуйте еще раз',
                        'ja-JP': 'ネットワークエラー、もう一度お試しください',
                        'de-DE': 'Netzwerkfehler, bitte versuchen Sie es erneut',
                        'pt-BR': 'Erro de rede, tente novamente',
                        'ko-KR': '네트워크 오류, 다시 시도하세요',
                    },
                    locale,
                ),            );        } finally {
            setIsLoadingOriginal(false);
        }
    }, [originalContent, showOriginal, postId, locale]);

    // 监听来自 PostDetailClient 的原文切换事件
    useEffect(() => {
        const handleOriginalToggle = () => {
            fetchOriginalContent();
        };

        window.addEventListener(`post-original-toggle-${postId}`, handleOriginalToggle);
        
        return () => {
            window.removeEventListener(`post-original-toggle-${postId}`, handleOriginalToggle);
        };
    }, [fetchOriginalContent, postId]);

    // 获取显示内容
    const getDisplayContent = () => {
        if (showOriginal && originalContent) {
            return originalContent;
        }
        return initialContent;
    };

    return (
        <div>
            {/* 帖子内容 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`content-${showOriginal}-${originalContent ? 'orig' : 'trans'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { duration: 0.3, ease: 'easeOut' }
                    }}
                    exit={{ 
                        opacity: 0, 
                        y: -10,
                        transition: { duration: 0.2, ease: 'easeIn' }
                    }}
                    className='prose prose-base prose-slate dark:prose-invert max-w-none
                     prose-headings:font-bold prose-headings:text-foreground
                     prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                     prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
                     prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                     prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
                     prose-strong:text-foreground prose-strong:font-semibold
                     prose-ul:my-4 prose-ul:pl-6 prose-li:my-2 prose-li:text-foreground
                     prose-ol:my-4 prose-ol:pl-6
                     prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-blockquote:italic'
                    dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
                />
            </AnimatePresence>
        </div>
    );
}
