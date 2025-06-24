'use client';

import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetLoadingProps {
    className?: string;
}

export function SheetLoading({ 
    className = '' 
}: SheetLoadingProps) {
        return (
        <motion.div 
            className={cn(
                "flex flex-col items-center justify-center py-16 space-y-6",
                className
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* 动画点 */}
            <motion.div
                className="flex justify-center space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1 h-1 bg-muted-foreground rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}

// Sheet内容的过渡动画组件
interface SheetContentTransitionProps {
    children: React.ReactNode;
    isLoading: boolean;
    className?: string;
}

export function SheetContentTransition({ 
    children, 
    isLoading, 
    className = '' 
}: SheetContentTransitionProps) {
    if (isLoading) {
        return null;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            {children}
        </motion.div>
    );
}

// Sheet列表项的过渡动画
export function SheetListItemTransition({ 
    children, 
    index = 0 
}: { 
    children: React.ReactNode; 
    index?: number 
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                duration: 0.2,
                delay: Math.min(index * 0.03, 0.3), // 限制最大延迟
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            {children}
        </motion.div>
    );
}
