'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBroadcast } from '@/store/useBroadcast';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ChevronRight } from 'lucide-react';
import lang from '@/lib/lang';

interface NewPostsBannerTopicProps {
    locale: string;
    topicName: string; // 当前主题名称
}

export function NewPostsBannerTopic({ locale, topicName }: NewPostsBannerTopicProps) {
    const [newPostsCount, setNewPostsCount] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const { registerCallback, unregisterCallback } = useBroadcast();

    // 监听广播消息
    useEffect(() => {
        const handleMessage = (message: unknown) => {            const typedMessage = message as {
                action: string;
                data?: {
                    uuid?: string;
                    status?: string;
                    type?: string;
                    topic?: string;
                };
                type?: string;
            };// 检查是否是新帖子消息且属于当前主题
            if (
                typedMessage.action === 'broadcast' &&
                typedMessage.type === 'task' &&
                typedMessage.data?.type === 'post' &&
                typedMessage.data?.status === 'DONE' &&
                typedMessage.data?.topic === topicName.replaceAll('-', '_')
            ) {
                setNewPostsCount((prev) => prev + 1);
            }
        };

        registerCallback(handleMessage);
        return () => {
            unregisterCallback(handleMessage);
        };
    }, [registerCallback, unregisterCallback, topicName]);

    const handleClick = () => {
        setIsExiting(true);
        // 延迟清除计数，让退出动画完成
        setTimeout(() => {
            setNewPostsCount(0);
            setIsExiting(false);
        }, 300); // 和动画时长一致
    };

    if (newPostsCount === 0) return null;

    return (
        <AnimatePresence>
            {newPostsCount > 0 && !isExiting && (
                <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mb-4"
                >
                    <Link 
                        href={`/${locale}/topic/${topicName}`} 
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
                                                <Sparkles className="h-4 w-4 text-primary" />
                                            </motion.div>
                                            <span className="text-sm font-medium">
                                                {lang(
                                                    {
                                                        'zh-CN': `查看 ${newPostsCount} 个新的帖子`,
                                                        'en-US': `View ${newPostsCount} new ${newPostsCount === 1 ? 'post' : 'posts'}`,
                                                        'zh-TW': `查看 ${newPostsCount} 個新的帖子`,
                                                        'es-ES': `Ver ${newPostsCount} ${newPostsCount === 1 ? 'publicación nueva' : 'publicaciones nuevas'}`,
                                                        'fr-FR': `Voir ${newPostsCount} ${newPostsCount === 1 ? 'nouveau message' : 'nouveaux messages'}`,
                                                        'ru-RU': `Посмотреть ${newPostsCount} ${newPostsCount === 1 ? 'новое сообщение' : 'новые сообщения'}`,
                                                        'ja-JP': `${newPostsCount}つの新しい投稿を見る`,
                                                        'de-DE': `${newPostsCount} ${newPostsCount === 1 ? 'neuen Beitrag' : 'neue Beiträge'} anzeigen`,
                                                        'pt-BR': `Ver ${newPostsCount} ${newPostsCount === 1 ? 'postagem nova' : 'postagens novas'}`,
                                                        'ko-KR': `${newPostsCount}개의 새 게시물 보기`,
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
