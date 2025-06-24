'use client';

import { motion, AnimatePresence } from 'motion/react';

interface AnimatedBadgeNumberProps {
    value: number;
    className?: string;
}

export function AnimatedBadgeNumber({ value, className = '' }: AnimatedBadgeNumberProps) {
    const displayValue = value > 99 ? '99+' : value.toString();

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={displayValue}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{
                        duration: 0.15,
                        ease: 'easeInOut'
                    }}
                    className="block"
                >
                    {displayValue}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}
