'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';

// 动态导入 emoji-mart 组件以避免卡顿
const Picker = dynamic(() => import('@emoji-mart/react'), {
    loading: () => (
        <div className='w-[300px] h-[350px] p-4'>
            <Skeleton className='w-full h-8 mb-4' />
            <div className='grid grid-cols-8 gap-2'>
                {Array.from({ length: 40 }).map((_, i) => (
                    <Skeleton key={i} className='w-8 h-8' />
                ))}
            </div>
        </div>
    ),
    ssr: false,
});

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    locale: string;
    trigger?: React.ReactNode;
    className?: string;
}

export function EmojiPicker({ onEmojiSelect, locale, trigger, className }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<any>(null);
    const [i18n, setI18n] = useState<any>(null);

    // 动态加载 emoji 数据和多语言支持
    useEffect(() => {
        const loadEmojiData = async () => {
            try {
                // 加载基础数据
                const emojiData = await import('@emoji-mart/data');
                setData(emojiData.default);

                // 根据语言加载对应的翻译文件
                const emojiMartLocale = getEmojiMartLocale(locale);
                if (emojiMartLocale !== 'en') {
                    try {
                        let i18nData;
                        switch (emojiMartLocale) {
                            case 'zh':
                                i18nData = await import('@emoji-mart/data/i18n/zh.json');
                                break;
                            case 'es':
                                i18nData = await import('@emoji-mart/data/i18n/es.json');
                                break;
                            case 'fr':
                                i18nData = await import('@emoji-mart/data/i18n/fr.json');
                                break;
                            case 'ru':
                                i18nData = await import('@emoji-mart/data/i18n/ru.json');
                                break;
                            case 'ja':
                                i18nData = await import('@emoji-mart/data/i18n/ja.json');
                                break;
                            case 'de':
                                i18nData = await import('@emoji-mart/data/i18n/de.json');
                                break;
                            case 'pt':
                                i18nData = await import('@emoji-mart/data/i18n/pt.json');
                                break;
                            case 'ko':
                                i18nData = await import('@emoji-mart/data/i18n/ko.json');
                                break;
                            default:
                                break;
                        }
                        if (i18nData) {
                            setI18n(i18nData.default);
                        }
                    } catch (error) {
                        console.warn('Failed to load emoji i18n data:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to load emoji data:', error);
            }
        };

        loadEmojiData();
    }, [locale]);

    // 语言映射
    const getEmojiMartLocale = (locale: string) => {
        const localeMap: Record<string, string> = {
            'zh-CN': 'zh',
            'zh-TW': 'zh',
            'en-US': 'en',
            'es-ES': 'es',
            'fr-FR': 'fr',
            'ru-RU': 'ru',
            'ja-JP': 'ja',
            'de-DE': 'de',
            'pt-BR': 'pt',
            'ko-KR': 'ko',
        };
        return localeMap[locale] || 'en';
    };

    const handleEmojiSelect = (emoji: any) => {
        onEmojiSelect(emoji.native);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant='ghost' size='sm' className={`h-8 w-8 p-0 ${className}`}>
                        <Smile className='h-4 w-4' />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                className='w-auto p-0 shadow-lg border bg-background'
                align='end'
                sideOffset={5}>
                {data ? (
                    <Picker
                        data={data}
                        i18n={i18n}
                        onEmojiSelect={handleEmojiSelect}
                        locale={getEmojiMartLocale(locale)}
                        autoFocus={true}
                        theme='auto'
                        searchPosition='sticky'
                        perLine={8}
                        emojiSize={20}
                        emojiButtonSize={28}
                        maxFrequentRows={2}
                        navPosition='bottom'
                        noResultsEmoji='😢'
                        set='native'
                        previewPosition='none'
                        skinTonePosition='search'
                        // 优化工具栏使用的样式
                        style={{
                            width: '300px',
                            height: '350px',
                        }}
                    />
                ) : (
                    <div className='w-[300px] h-[350px] p-4'>
                        <Skeleton className='w-full h-8 mb-4' />
                        <div className='grid grid-cols-8 gap-2'>
                            {Array.from({ length: 40 }).map((_, i) => (
                                <Skeleton key={i} className='w-8 h-8' />
                            ))}
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
