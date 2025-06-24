'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBroadcast } from '@/store/useBroadcast';

interface AnimatedCounterTopicProps {
    initialCount: number;
    topicName: string; // 当前主题名称
}

interface DigitProps {
    digit: string;
    isComma?: boolean;
    position: number;
}

// 单个数字位组件
function AnimatedDigit({ digit, isComma = false, position }: DigitProps) {
    if (isComma) {
        return <span className="inline-block text-2xl font-bold text-primary px-1">{digit}</span>;
    }

    return (
        <div className="relative inline-flex overflow-hidden h-8 w-4 items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.span
                    key={digit}
                    initial={{ y: 30, opacity: 0, scale: 0.8 }}
                    animate={{ 
                        y: 0, 
                        opacity: 1, 
                        scale: 1,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            delay: position * 0.05,
                        }
                    }}
                    exit={{ 
                        y: -30, 
                        opacity: 0, 
                        scale: 0.8,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn"
                        }
                    }}
                    className="absolute text-2xl font-bold text-primary"
                >
                    {digit}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

export function AnimatedCounterTopic({ initialCount, topicName }: AnimatedCounterTopicProps) {
    const [count, setCount] = useState(initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const { registerCallback, unregisterCallback } = useBroadcast();

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
            };            // 检查是否是新帖子消息且属于当前主题
            if (
                typedMessage.action === 'broadcast' &&
                typedMessage.type === 'task' &&
                typedMessage.data?.type === 'post' &&
                typedMessage.data?.status === 'DONE' &&
                typedMessage.data?.topic === topicName.replaceAll('-', '_')
            ) {
                setIsAnimating(true);
                setCount((prev) => prev + 1);
                // 重置动画状态
                setTimeout(() => setIsAnimating(false), 800);
            }
        };

        registerCallback(handleMessage);
        return () => {
            unregisterCallback(handleMessage);
        };
    }, [registerCallback, unregisterCallback, topicName]);

    // 分解数字为字符数组，包含逗号，从右到左编号
    const formattedDigits = useMemo(() => {
        const formatted = count.toLocaleString();
        const chars = formatted.split('');
        return chars.map((char, index) => ({
            char,
            isComma: char === ',',
            position: chars.length - 1 - index,
            key: `${char}-${index}-${count}`
        }));
    }, [count]);

    return (
        <motion.div
            className="inline-flex items-center justify-center"
            animate={isAnimating ? {
                scale: [1, 1.1, 1],
                filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
            } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {formattedDigits.map(({ char, isComma, position, key }) => (
                <AnimatedDigit 
                    key={key} 
                    digit={char} 
                    isComma={isComma} 
                    position={position}
                />
            ))}
        </motion.div>
    );
}
