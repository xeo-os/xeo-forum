'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBroadcast } from '@/store/useBroadcast';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ChevronRight } from 'lucide-react';
import lang from '@/lib/lang';

interface NewRepliesBannerProps {
    locale: string;
    postId: string; // 当前帖子ID
    totalPages: number; // 总页数
    postSlug?: string; // 帖子slug，用于生成链接
}

export function NewRepliesBanner({ 
    locale, 
    postId, 
    totalPages,
    postSlug = '' 
}: NewRepliesBannerProps) {
    const [newRepliesCount, setNewRepliesCount] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const { registerCallback, unregisterCallback } = useBroadcast();

    // 监听广播消息
    useEffect(() => {
        const handleMessage = (message: unknown) => {
            const typedMessage = message as {
                action: string;
                data?: {
                    message?: {
                        content?: {
                            uuid: string;
                            status: string;
                            type: string;
                            postId: string;
                        };
                    };
                };
                type?: string;
            };

            // 检查是否是新回复消息且属于当前帖子
            if (
                typedMessage.action === 'message.create' &&
                typedMessage.data?.message?.content?.type === 'reply' &&
                typedMessage.data?.message?.content?.status === 'DONE' &&
                typedMessage.data?.message?.content?.postId === postId
            ) {
                setNewRepliesCount((prev) => prev + 1);
            }
        };

        registerCallback(handleMessage);
        return () => {
            unregisterCallback(handleMessage);
        };
    }, [registerCallback, unregisterCallback, postId]);

    const handleClick = () => {
        setIsExiting(true);
        // 延迟清除计数，让退出动画完成
        setTimeout(() => {
            setNewRepliesCount(0);
            setIsExiting(false);
        }, 300); // 和动画时长一致
    };

    if (newRepliesCount === 0) return null;

    // 生成跳转到最后一页的链接
    const getLastPageLink = () => {
        const basePath = `/${locale}/post/${postId}/${postSlug}`;
        if (totalPages <= 1) {
            return basePath;
        }
        return `${basePath}/page/${totalPages}`;
    };

    return (
        <AnimatePresence>
            {newRepliesCount > 0 && !isExiting && (
                <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mb-4"
                >
                    <Link 
                        href={getLastPageLink()} 
                        onClick={handleClick}
                        className="block"
                    >
                        <motion.div whileTap={{ scale: 0.98 }}>
                            <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
                                <CardContent className="py-2 px-4">
                                    <div className="flex items-center justify-between w-full group">
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                initial={{ scale: 0.8, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ duration: 0.4, ease: 'backOut' }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <MessageCircle className="h-4 w-4 text-primary" />
                                            </motion.div>
                                            <span className="text-sm font-medium">
                                                {lang(
                                                    {
                                                        'zh-CN': `查看 ${newRepliesCount} 个新的回复`,
                                                        'en-US': `View ${newRepliesCount} new ${newRepliesCount === 1 ? 'reply' : 'replies'}`,
                                                        'zh-TW': `查看 ${newRepliesCount} 個新的回復`,
                                                        'es-ES': `Ver ${newRepliesCount} ${newRepliesCount === 1 ? 'respuesta nueva' : 'respuestas nuevas'}`,
                                                        'fr-FR': `Voir ${newRepliesCount} ${newRepliesCount === 1 ? 'nouvelle réponse' : 'nouvelles réponses'}`,
                                                        'ru-RU': `Посмотреть ${newRepliesCount} ${newRepliesCount === 1 ? 'новый ответ' : 'новые ответы'}`,
                                                        'ja-JP': `${newRepliesCount}つの新しい返信を見る`,
                                                        'de-DE': `${newRepliesCount} ${newRepliesCount === 1 ? 'neue Antwort' : 'neue Antworten'} anzeigen`,
                                                        'pt-BR': `Ver ${newRepliesCount} ${newRepliesCount === 1 ? 'resposta nova' : 'respostas novas'}`,
                                                        'ko-KR': `${newRepliesCount}개의 새 답글 보기`,
                                                    },
                                                    locale,
                                                )}
                                            </span>
                                        </div>
                                        <motion.div whileTap={{ scale: 0.9, x: 2 }}>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
