'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useBroadcast } from '@/store/useBroadcast';
import lang from '@/lib/lang';

interface LoadingProps {
    theme: string;
    onLoadComplete: () => void;
    locale: string;
}

export function Loading({ theme, onLoadComplete, locale }: LoadingProps) {
    const { broadcast } = useBroadcast();
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState(
        lang(
            {
                'zh-CN': '正在加载...',
                'zh-TW': '正在載入...',
                'en-US': 'Loading...',
                'es-ES': 'Cargando...',
                'fr-FR': 'Chargement...',
                'ru-RU': 'Загрузка...',
                'ja-JP': '読み込み中...',
                'de-DE': 'Laden...',
                'pt-BR': 'Carregando...',
                'ko-KR': '로딩 중...',
            },
            locale,
        ),
    );

    useEffect(() => {
        // 模拟进度条加载
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    // 先更新文字，然后设置加载状态
                    setLoadingText('加载完成');
                    broadcast({ action: 'loadingComplete' });
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 300); // 给文字切换动画一些时间
                    // 等待退出动画完成后调用回调，延长到1.8秒
                    setTimeout(onLoadComplete, 1800);
                    return 100;
                }
                return Math.min(prev + Math.random() * 15 + 5, 100); // 随机增长5-20%
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, [onLoadComplete]);

    if (!isLoading) {
        return (
            <motion.div
                className={`fixed inset-0 z-50 flex items-center justify-center ${
                    theme === 'dark' ? 'bg-black' : 'bg-white'
                }`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
                <motion.div
                    className='text-center'
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                >
                    <motion.h1
                        className={`text-6xl font-bold mb-4 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                        }`}
                        initial={{ y: 0 }}
                        animate={{ y: -30 }}
                        transition={{ duration: 1.0, ease: 'easeInOut' }}
                    >
                        XEO OS
                    </motion.h1>
                    <motion.div
                        className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}
                        key='completed'
                        suppressHydrationWarning
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {lang({
                            'zh-CN': '加载完成',
                            'zh-TW': '載入完成',
                            'en-US': 'Loading Complete',
                            'es-ES': 'Carga Completa',
                            'fr-FR': 'Chargement Terminé',
                            'ru-RU': 'Загрузка Завершена',
                            'ja-JP': '読み込み完了',
                            'de-DE': 'Laden Abgeschlossen',
                            'pt-BR': 'Carregamento Completo',
                            'ko-KR': '로딩 완료',
                        })}
                    </motion.div>
                    <motion.div
                        className='mt-6 w-64'
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.0, delay: 0.2, ease: 'easeInOut' }}
                    >
                        <Progress value={100} className='w-full' />
                        <motion.div
                            className={`text-sm mt-2 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                        >
                            100%
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${
                theme === 'dark' ? 'bg-black' : 'bg-white'
            }`}
        >
            <div className='text-center'>
                <motion.h1
                    className={`text-6xl font-bold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    XEO OS
                </motion.h1>
                <AnimatePresence mode='wait'>
                    <motion.div
                        className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-black'}`}
                        key={loadingText}
                        suppressHydrationWarning
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {loadingText}
                    </motion.div>
                </AnimatePresence>
                <motion.div
                    className='mt-6 w-64'
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0 }}
                >
                    <Progress value={progress} className='w-full' />
                    <motion.div
                        className={`text-sm mt-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0 }}
                    >
                        {Math.round(progress)}%
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
