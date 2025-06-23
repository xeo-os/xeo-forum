'use client';

// import { useState } from "react";
import { ContextMenu } from '@/components/context-menu';

interface ContextMenuProviderProps {
    children: React.ReactNode;
    locale?: string;
}

export function ContextMenuProvider({ children, locale = 'en-US' }: ContextMenuProviderProps) {
    return (
        <ContextMenu locale={locale}>
            <div className='min-h-screen w-full'>{children}</div>
        </ContextMenu>
    );
}
