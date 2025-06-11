'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [nextPath, setNextPath] = useState<string | null>(null);

    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href]') as HTMLAnchorElement;

            if (!link) return;

            const href = link.getAttribute('href');
            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.includes('://')
            ) {
                return; // 忽略锚点、邮件、电话和外部链接
            }

            // 如果是当前页面，不需要动画
            if (href === pathname) return;

            e.preventDefault();
            setNextPath(href);
            setIsTransitioning(true);
        };

        document.addEventListener('click', handleLinkClick);
        return () => document.removeEventListener('click', handleLinkClick);
    }, [pathname]);

    // 渐出动画完成后导航
    const handleExitComplete = () => {
        if (nextPath && isTransitioning) {
            router.push(nextPath);
        }
    };

    // 路径变化时重置状态并滚动到顶部
    useEffect(() => {
        if (isTransitioning) {
            setIsTransitioning(false);
            setNextPath(null);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname, isTransitioning]);

    return (
        <AnimatePresence mode='wait' onExitComplete={handleExitComplete}>
            <motion.div
                key={isTransitioning ? 'exiting' : pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: isTransitioning ? 0 : 1,
                    y: isTransitioning ? 30 : 0,
                }}
                exit={{ opacity: 0, y: 30 }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
                style={{ minHeight: '100vh' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
