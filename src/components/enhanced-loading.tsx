'use client';

import { motion } from 'motion/react';
import { Loader2, FileText, MessageSquare, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
    type?: 'drafts' | 'posts' | 'replies' | 'general';
    message?: string;
    className?: string;
}

const iconMap = {
    drafts: Edit3,
    posts: FileText,
    replies: MessageSquare,
    general: Loader2
};

const defaultMessages = {
    drafts: '加载草稿中',
    posts: '加载帖子中',
    replies: '加载回复中',
    general: '加载中'
};

export function EnhancedLoading({ 
    type = 'general', 
    message, 
    className = '' 
}: EnhancedLoadingProps) {
    const Icon = iconMap[type];

    return (
        <motion.div 
            className={cn(
                "flex flex-col items-center justify-center py-12 space-y-4",
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* 简约加载图标 */}
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                
                {/* 类型图标 - 静态显示在右下角 */}
                <div className="absolute -bottom-1 -right-1 bg-background border rounded-full p-1">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
            </div>

            {/* 简约文本 */}
            <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {message || defaultMessages[type]}
            </motion.p>
        </motion.div>
    );
}

// 内容加载完成后的过渡动画组件
interface ContentTransitionProps {
    children: React.ReactNode;
    isLoading: boolean;
    className?: string;
}

export function ContentTransition({ children, isLoading, className = '' }: ContentTransitionProps) {
    if (isLoading) {
        return null;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            {children}
        </motion.div>
    );
}

// 列表项动画
export function ListItemTransition({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: Math.min(index * 0.05, 0.5), // 限制最大延迟
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            {children}
        </motion.div>
    );
}
