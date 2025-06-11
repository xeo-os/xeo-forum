'use client';

// import { useState } from "react";
import { ContextMenu } from '@/components/context-menu';

interface ContextMenuProviderProps {
    children: React.ReactNode;
    locale?: string;
}

export function ContextMenuProvider({ children, locale = 'en-US' }: ContextMenuProviderProps) {
    //   const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        // 直接跳转到搜索页面，而不是打开Sheet
        // 这样避免与app-header中的SearchSheet冲突
        if (query.trim()) {
            window.location.href = `/${locale}/search?q=${encodeURIComponent(query)}`;
        }
    };

    return (
        <ContextMenu locale={locale} onSearch={handleSearch}>
            <div className='min-h-screen w-full'>{children}</div>
        </ContextMenu>
    );
}
