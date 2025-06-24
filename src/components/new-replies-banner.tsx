'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    const [userTaskIds, setUserTaskIds] = useState<Set<string>>(new Set());
    const processedTaskIdsRef = useRef<Set<string>>(new Set()); // 使用ref避免竞态条件
    const { registerCallback, unregisterCallback } = useBroadcast();

    // 从sessionStorage加载用户taskId列表
    useEffect(() => {
        const stored = sessionStorage.getItem(`userReplyTasks_${postId}`);
        if (stored) {
            try {
                const taskIds = JSON.parse(stored);
                setUserTaskIds(new Set(taskIds));
            } catch (e) {
                console.error('Error loading user task IDs:', e);
            }
        }
    }, [postId]);    // 保存用户taskId列表到sessionStorage
    const saveUserTaskIds = useCallback((newTaskIds: Set<string>) => {
        setUserTaskIds(newTaskIds);
        sessionStorage.setItem(`userReplyTasks_${postId}`, JSON.stringify([...newTaskIds]));
    }, [postId]);    // 监听用户自己发出的回复，记录taskId（仅PENDING状态）
    useEffect(() => {
        const handleUserReply = (message: unknown) => {
            const typedMessage = message as {
                action: string;
                data?: {
                    uuid?: string;
                    status?: string;
                    type?: string;
                    postId?: string;
                };
                type?: string;
            };

            // 当用户发送回复时，只记录PENDING状态的taskId
            if (
                typedMessage.action === 'broadcast' &&
                typedMessage.type === 'task' &&
                typedMessage.data?.type === 'reply' &&
                typedMessage.data?.postId === postId &&
                typedMessage.data?.status === 'PENDING'
            ) {
                const taskId = typedMessage.data.uuid;
                if (taskId) {
                    const newTaskIds = new Set([...userTaskIds, taskId]);
                    saveUserTaskIds(newTaskIds);
                }
            }
        };

        registerCallback(handleUserReply);
        return () => {
            unregisterCallback(handleUserReply);
        };
    }, [registerCallback, unregisterCallback, postId, userTaskIds, saveUserTaskIds]);// 监听广播消息，过滤新回复并清理用户taskId
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
                    uuid?: string;
                    status?: string;
                    type?: string;
                    postId?: string;
                };
                type?: string;
            };            let messageTaskId: string | undefined;
            let isValidReply = false;

            // 检查message.create格式（新格式）
            if (
                typedMessage.action === 'message.create' &&
                typedMessage.data?.message?.content?.type === 'reply' &&
                typedMessage.data?.message?.content?.status === 'DONE' &&
                typedMessage.data?.message?.content?.postId === postId
            ) {
                messageTaskId = typedMessage.data.message.content.uuid;
                isValidReply = true;
            }
            
            // 检查broadcast格式（旧格式）
            else if (
                typedMessage.action === 'broadcast' &&
                typedMessage.type === 'task' &&
                typedMessage.data?.type === 'reply' &&
                typedMessage.data?.status === 'DONE' &&
                typedMessage.data?.postId === postId
            ) {
                messageTaskId = typedMessage.data.uuid;
                isValidReply = true;
            }

            // 如果是有效的回复且有taskId
            if (isValidReply && messageTaskId) {
                // 检查是否已经处理过这个taskId
                if (processedTaskIdsRef.current.has(messageTaskId)) {
                    return;
                }

                // 立即标记为已处理（使用ref避免竞态条件）
                processedTaskIdsRef.current.add(messageTaskId);

                // 如果是用户自己的回复完成，从列表中移除taskId
                if (userTaskIds.has(messageTaskId)) {
                    const newTaskIds = new Set(userTaskIds);
                    newTaskIds.delete(messageTaskId);
                    saveUserTaskIds(newTaskIds);
                } else {
                    // 如果不是用户自己的回复，显示横幅
                    setNewRepliesCount((prev) => prev + 1);
                }
            }
        };        registerCallback(handleMessage);
        return () => {
            unregisterCallback(handleMessage);
        };
    }, [registerCallback, unregisterCallback, postId, userTaskIds, saveUserTaskIds]);    const handleClick = () => {
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
