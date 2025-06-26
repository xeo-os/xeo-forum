'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/app-header';
import { Loading } from '@/components/loading';
import { useBroadcast } from '@/store/useBroadcast';

interface ClientLayoutProps {
    children: React.ReactNode;
    locale: string;
    savedTheme: string;
    topics: {
        title: string;
        icon: string;
        name: string;
        items?: { title: string; url: string; icon: string; name: string }[];
    }[];
}

export function ClientLayout({ children, locale, topics, savedTheme }: ClientLayoutProps) {
    const [showLoading, setShowLoading] = useState(true);

    const { registerCallback, unregisterCallback } = useBroadcast();

    useEffect(() => {
        const handleMessage = (message: unknown) => {
            if ((message as { action: string }).action === 'loadingComplete') {
                // 加载完成，添加动画
            }
        };
        registerCallback(handleMessage);
        return () => {
            unregisterCallback(handleMessage);
        };
    }, [registerCallback, unregisterCallback]);

    const handleLoadComplete = () => {
        setShowLoading(false);
    };

    return (
        <>
            {showLoading && (
                <Loading theme={savedTheme} onLoadComplete={handleLoadComplete} locale={locale} />
            )}
            <div className='[--header-height:calc(var(--spacing)*14)]'>
                <SidebarProvider>
                    <SiteHeader locale={locale} topics={topics}/>
                    <div className='flex flex-1' style={{ marginTop: 'var(--header-height)' }}>
                        <AppSidebar locale={locale} currentTheme={savedTheme} topics={topics} />
                        <SidebarInset>
                            <main className='flex flex-1 flex-col p-4'>{children}</main>
                        </SidebarInset>
                    </div>
                </SidebarProvider>
            </div>
        </>
    );
}
