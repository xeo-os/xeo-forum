'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const EMOJI_FONT_FAMILY =
    'system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

type EmojiAvatarProps = {
    emoji?: string | null;
    background?: string | null;
    fallbackText?: string | null;
    className?: string;
    fallbackClassName?: string;
    title?: string;
};

export function EmojiAvatar({
    emoji,
    background,
    fallbackText,
    className,
    fallbackClassName,
    title,
}: EmojiAvatarProps) {
    const displayText = emoji || fallbackText || 'U';

    return (
        <Avatar className={className} title={title}>
            <AvatarFallback
                className={cn('leading-none', fallbackClassName)}
                style={{
                    background: background || '#e5e7eb',
                    fontFamily: EMOJI_FONT_FAMILY,
                    lineHeight: 1,
                }}>
                {displayText}
            </AvatarFallback>
        </Avatar>
    );
}
