'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import lang from '@/lib/lang';

interface SearchSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    locale?: string;
    initialQuery?: string;
    onQueryChange?: (query: string) => void;
}

export function SearchSheet({
    open,
    onOpenChange,
    locale = 'en-US',
    initialQuery = '',
    onQueryChange,
}: SearchSheetProps) {
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const handleSearch = () => {
        if (query.trim()) {
            // 跳转到搜索结果页面
            window.location.href = `/${locale}/search?q=${encodeURIComponent(query)}`;
            onOpenChange(false);
        }
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        onQueryChange?.(value);
    };

    const texts = {
        searchTitle: lang(
            {
                'zh-CN': '全站搜索',
                'en-US': 'Global Search',
                'ja-JP': 'サイト内検索',
                'ko-KR': '전체 검색',
                'fr-FR': 'Recherche globale',
                'es-ES': 'Búsqueda global',
                'de-DE': 'Globale Suche',
                'pt-BR': 'Busca global',
                'ru-RU': 'Глобальный поиск',
                'zh-TW': '全站搜尋',
            },
            locale,
        ),
        searchDescription: lang(
            {
                'zh-CN': '在整个论坛中搜索帖子、用户和内容',
                'en-US': 'Search for posts, users and content across the entire forum',
                'ja-JP': 'フォーラム全体で投稿、ユーザー、コンテンツを検索',
                'ko-KR': '전체 포럼에서 게시물, 사용자 및 콘텐츠 검색',
                'fr-FR': 'Rechercher des publications, utilisateurs et contenu dans tout le forum',
                'es-ES': 'Buscar publicaciones, usuarios y contenido en todo el foro',
                'de-DE': 'Beiträge, Benutzer und Inhalte im gesamten Forum suchen',
                'pt-BR': 'Pesquisar postagens, usuários e conteúdo em todo o fórum',
                'ru-RU': 'Поиск постов, пользователей и контента по всему форуму',
                'zh-TW': '在整個論壇中搜尋帖子、用戶和內容',
            },
            locale,
        ),
        searchPlaceholder: lang(
            {
                'zh-CN': '输入搜索关键词...',
                'en-US': 'Enter search keywords...',
                'ja-JP': '検索キーワードを入力...',
                'ko-KR': '검색 키워드 입력...',
                'fr-FR': 'Entrez les mots-clés...',
                'es-ES': 'Ingrese palabras clave...',
                'de-DE': 'Suchbegriffe eingeben...',
                'pt-BR': 'Digite palavras-chave...',
                'ru-RU': 'Введите ключевые слова...',
                'zh-TW': '輸入搜尋關鍵詞...',
            },
            locale,
        ),
        searchButton: lang(
            {
                'zh-CN': '搜索',
                'en-US': 'Search',
                'ja-JP': '検索',
                'ko-KR': '검색',
                'fr-FR': 'Rechercher',
                'es-ES': 'Buscar',
                'de-DE': 'Suchen',
                'pt-BR': 'Pesquisar',
                'ru-RU': 'Поиск',
                'zh-TW': '搜尋',
            },
            locale,
        ),
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side='top' className='h-auto'>
                <SheetHeader>
                    <SheetTitle>{texts.searchTitle}</SheetTitle>
                    <SheetDescription>{texts.searchDescription}</SheetDescription>
                </SheetHeader>
                <div className='mt-6 space-y-4'>
                    <div className='flex gap-2'>
                        <div className='relative flex-1'>
                            <Input
                                placeholder={texts.searchPlaceholder}
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                className='pr-8'
                                autoFocus
                            />
                            {query && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0'
                                    onClick={() => handleQueryChange('')}
                                >
                                    <X className='h-3 w-3' />
                                </Button>
                            )}
                        </div>
                        <Button onClick={handleSearch} disabled={!query.trim()}>
                            <Search className='h-4 w-4 mr-2' />
                            {texts.searchButton}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
