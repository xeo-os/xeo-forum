'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EmojiParticle {
    id: string;
    emoji: string;
    x: number;
    y: number;
    delay: number;
}

export function AnimatedEmojiBackground() {
    const [particles, setParticles] = useState<EmojiParticle[]>([]);

    // 可能出现的emoji列表 - 主要是沟通和技术相关的
    const emojis = [
        '🌍',
        '🌎',
        '🌏',
        '🌐',
        '💬',
        '💭',
        '🗣️',
        '👥',
        '🤝',
        '❤️',
        '💫',
        '✨',
        '⭐',
        '🌟',
        '💖',
        '💕',
        '🔗',
        '🌈',
        '🎯',
        '🚀',
        '💡',
        '🧠',
        '👁️',
        '📱',
        '💻',
        '⚡',
        '🎨',
        '🎵',
        '🎪',
        '🎭',
        '🔥',
        '💝',
        '🎉',
        '🎊',
        '🌸',
        '🌺',
        '🌻',
        '🌷',
        '🌹',
        '🌼',
    ];

    // 生成随机emoji粒子
    const generateParticle = (): EmojiParticle => {
        return {
            id: Math.random().toString(36).substr(2, 9),
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: Math.random() * 100, // 0-100% 位置
            y: Math.random() * 100, // 0-100% 位置
            delay: Math.random() * 1.5, // 0-1.5秒延迟
        };
    };

    useEffect(() => {
        // 初始化粒子
        const initialParticles = Array.from({ length: 2 }, generateParticle);
        setParticles(initialParticles);

        // 定期添加新粒子
        const interval = setInterval(
            () => {
                setParticles((current) => {
                    const newParticle = generateParticle();
                    // 保持最多4个粒子
                    const updated = [...current, newParticle];
                    return updated.slice(-4);
                });
            },
            4000 + Math.random() * 3000,
        ); // 4-7秒间隔

        return () => clearInterval(interval);
    }, []);

    // 移除已完成动画的粒子
    const handleAnimationComplete = (particleId: string) => {
        setParticles((current) => current.filter((p) => p.id !== particleId));
    };

    return (
        <div className='absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-primary/90 overflow-hidden'>
            {/* 基础渐变背景 */}
            <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10' />

            {/* 动画emoji粒子 */}
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className='absolute pointer-events-none select-none'
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            fontSize: '2.5rem',
                            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                        }}
                        initial={{
                            scale: 0,
                            opacity: 0,
                            rotate: -180,
                        }}
                        animate={{
                            scale: [0, 1.4, 1.1, 1.3, 1],
                            opacity: [0, 1, 1, 1, 0],
                            rotate: [0, 20, -10, 15, 0],
                        }}
                        exit={{
                            scale: 0,
                            opacity: 0,
                            rotate: 180,
                        }}
                        transition={{
                            duration: 5,
                            delay: particle.delay,
                            times: [0, 0.2, 0.4, 0.7, 1],
                            ease: [0.68, -0.55, 0.265, 1.55], // 弹性缓动
                        }}
                        onAnimationComplete={() => handleAnimationComplete(particle.id)}
                    >
                        {particle.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* 微妙的光晕效果 */}
            <div className='absolute inset-0 bg-gradient-radial from-white/8 via-transparent to-transparent' />
        </div>
    );
}
