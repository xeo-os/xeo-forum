'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import lang from '@/lib/lang';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface SearchSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    locale?: string;
    initialQuery?: string;
    onQueryChange?: (query: string) => void;
    topics: {
        title: string;
        icon: string;
        name: string;
        items?: { title: string; url: string; icon: string; name: string }[];
    }[];
}

export function SearchSheet({
    open,
    onOpenChange,
    locale = 'en-US',
    initialQuery = '',
    onQueryChange,
    topics,
}: SearchSheetProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [topicsMap, setTopicsMap] = useState<Record<string, { title: string; icon: string }>>({});
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        if (!open) {
            setResults([]);
            setPage(1);
            setHasMore(false);
            setLoading(false);
            setTotal(0);
            setQuery('');
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleScroll = () => {
            const el = listRef.current;
            if (!el || loading || !hasMore) return;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
                loadMore();
            }
        };
        const el = listRef.current;
        if (el) el.addEventListener('scroll', handleScroll);
        return () => {
            if (el) el.removeEventListener('scroll', handleScroll);
        };
    }, [loading, hasMore, open]);

    const fetchResults = async (q: string, pageNum = 1, append = false) => {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pageNum}`);
            const data = await res.json();
            if (data.ok) {
                const hits = data.data.originalContent.hits || [];
                setResults((prev) => (append ? [...prev, ...hits] : hits));
                setHasMore(
                    (pageNum - 1) * 20 + hits.length < data.data.originalContent.estimatedTotalHits,
                );
                setTotal(data.data.originalContent.estimatedTotalHits || 0);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        onQueryChange?.(value);
    };

    const loadMore = () => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(query, nextPage, true);
    };

    // 高亮匹配关键词
    const highlight = (text: string, keyword: string) => {
        if (!text || !keyword) return text;
        const reg = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return (
            <span
                dangerouslySetInnerHTML={{
                    __html: text.replace(reg, '<span class="text-primary">$1</span>'),
                }}
            />
        );
    };

    // 获取当前语言字段
    const getLangField = (item: any, field: 'title' | 'content') => {
        const langMap: Record<string, string> = {
            'zh-CN': 'ZHCN',
            'zh-TW': 'ZHTW',
            'en-US': 'ENUS',
            'ja-JP': 'JAJP',
            'ko-KR': 'KOKR',
            'fr-FR': 'FRFR',
            'es-ES': 'ESES',
            'de-DE': 'DEDE',
            'pt-BR': 'PTBR',
            'ru-RU': 'RURU',
        };
        const suffix = langMap[locale] || 'ENUS';
        if (field === 'title') return item[`title${suffix}`] || item.title || '';
        if (field === 'content') return item[`content${suffix}`] || item.origin || '';
        return '';
    };

    // 输入后0.5s自动搜索
    useEffect(() => {
        if (!open) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        if (!query.trim()) {
            setResults([]);
            setTotal(0);
            setHasMore(false);
            return;
        }
        setDebounceTimer(
            setTimeout(() => {
                setPage(1);
                fetchResults(query, 1, false);
            }, 500),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, open]);

    useEffect(() => {
        // 用props.topics构建本地化话题映射
        const map: Record<string, { title: string; icon: string }> = {};
        topics.forEach((cls) => {
            (cls.items || []).forEach((topic) => {
                map[topic.name] = { title: topic.title, icon: topic.icon };
            });
        });
        setTopicsMap(map);
    }, [topics]);

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

    // 关闭Sheet的辅助函数
    const handleCloseSheet = () => {
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side='top'
                className='h-[80vh] flex justify-center items-center bg-background/95 shadow-xl border-b rounded-b-xl p-0'>
                <div className='w-full max-w-xl mx-auto h-full flex flex-col'>
                    {/* 顶部固定区域 */}
                    <div className='sticky top-0 z-10 bg-transparent border-b rounded-t-xl shadow-sm pt-2 pb-4 px-4'>
                        <SheetHeader>
                            <SheetTitle className='text-lg font-semibold'>
                                {texts.searchTitle}
                            </SheetTitle>
                            <SheetDescription className='text-muted-foreground text-sm'>
                                {texts.searchDescription}
                            </SheetDescription>
                        </SheetHeader>
                        <div className='flex gap-2 justify-center mt-4'>
                            <div className='relative flex-1'>
                                <Input
                                    placeholder={texts.searchPlaceholder}
                                    value={query}
                                    onChange={(e) => handleQueryChange(e.target.value)}
                                    className='pr-8 text-base h-12 rounded-lg shadow-xs border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring/30 transition-all'
                                    autoFocus
                                />
                                {query && (
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full'
                                        onClick={() => handleQueryChange('')}
                                        tabIndex={-1}>
                                        <X className='h-3 w-3' />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* 内容区域 */}
                    <div
                        ref={listRef}
                        className='flex-1 max-h-[60vh] overflow-y-auto p-3 bg-transparent rounded-b-xl shadow-inner mt-0'
                        style={{ minHeight: 160 }}>
                        {loading && results.length === 0 && (
                            <div className='flex items-center justify-center py-12'>
                                <span className='text-muted-foreground text-sm'>
                                    {lang(
                                        {
                                            'zh-CN': '加载中...',
                                            'en-US': 'Loading...',
                                            'ja-JP': '読み込み中...',
                                            'ko-KR': '로딩 중...',
                                            'fr-FR': 'Chargement...',
                                            'es-ES': 'Cargando...',
                                            'de-DE': 'Laden...',
                                            'pt-BR': 'Carregando...',
                                            'ru-RU': 'Загрузка...',
                                            'zh-TW': '載入中...',
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                        )}
                        {!loading && results.length === 0 && (
                            <div className='flex items-center justify-center py-12'>
                                <span className='text-muted-foreground text-sm'>
                                    {lang(
                                        {
                                            'zh-CN': '没有找到相关结果',
                                            'en-US': 'No results found',
                                            'ja-JP': '関連する結果が見つかりません',
                                            'ko-KR': '관련 결과가 없습니다',
                                            'fr-FR': 'Aucun résultat trouvé',
                                            'es-ES': 'No se encontraron resultados',
                                            'de-DE': 'Keine Ergebnisse gefunden',
                                            'pt-BR': 'Nenhum resultado encontrado',
                                            'ru-RU': 'Результаты не найдены',
                                            'zh-TW': '沒有找到相關結果',
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                        )}
                        {results.map((item, idx) => {
                            const avatar = item.avatar?.[0];
                            const nickname = item.nickname;
                            let avatarUrl = '';
                            if (avatar) {
                                avatarUrl = `/api/dynamicImage/emoji?emoji=${encodeURIComponent(avatar.emoji)}&background=${encodeURIComponent((avatar.background || '').replaceAll('%', '%25'))}`;
                            }
                            return (
                                <Card
                                    key={item.id || idx}
                                    className='mb-4 rounded-lg border shadow-xs hover:shadow-md transition-shadow bg-card'>
                                    <CardContent className='py-4 px-5'>
                                        <div className='font-semibold text-base mb-1 break-words text-foreground'>
                                            <Link href={`/${locale}/post/${item.id}`} className='hover:underline' onClick={handleCloseSheet}>
                                                {highlight(getLangField(item, 'title'), query)}
                                            </Link>
                                        </div>
                                        <div className='text-sm text-muted-foreground mb-2 break-words'>
                                            {highlight(getLangField(item, 'content'), query)}
                                        </div>
                                        <div className='text-xs text-muted-foreground flex flex-wrap gap-3 items-center'>
                                            {/* 头像和昵称放最左侧，添加跳转链接 */}
                                            {(avatarUrl || nickname) && (
                                                <Link href={`/${locale}/user/${item.userUid}`} className="flex items-center mr-2 group" onClick={handleCloseSheet}>
                                                    {avatarUrl && (
                                                        <Image
                                                            src={avatarUrl}
                                                            alt={nickname || 'avatar'}
                                                            width={20}
                                                            height={20}
                                                            className='w-5 h-5 rounded-full object-cover mr-1 group-hover:brightness-90 transition'
                                                            style={{ minWidth: 20, minHeight: 20 }}
                                                            unoptimized
                                                        />
                                                    )}
                                                    {nickname && (
                                                        <span className='text-xs text-muted-foreground group-hover:underline'>{nickname}</span>
                                                    )}
                                                </Link>
                                            )}
                                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                                            {item.topics?.length > 0 && (
                                                <span>
                                                    {lang(
                                                        {
                                                            'zh-CN': '话题',
                                                            'en-US': 'Topics',
                                                            'ja-JP': 'トピック',
                                                            'ko-KR': '주제',
                                                            'fr-FR': 'Sujets',
                                                            'es-ES': 'Temas',
                                                            'de-DE': 'Themen',
                                                            'pt-BR': 'Tópicos',
                                                            'ru-RU': 'Темы',
                                                            'zh-TW': '話題',
                                                        },
                                                        locale,
                                                    ) + ': '}
                                                    {item.topics.map((t: any) => {
                                                        const topicName = typeof t === 'string' ? t : t.name;
                                                        const topicInfo = topicsMap[topicName] || { title: topicName, icon: '' };
                                                        return (
                                                            <Link
                                                                key={topicName}
                                                                href={`/${locale}/topic/${topicName.replaceAll("_","-")}`}
                                                                className="inline-flex items-center mr-2 hover:underline"
                                                                onClick={handleCloseSheet}
                                                            >
                                                                {topicInfo.icon && <span className="mr-1">{topicInfo.icon}</span>}
                                                                <span>{topicInfo.title}</span>
                                                                {topicInfo.title === topicName && (
                                                                    <span className="text-red-500 ml-1">({topicName})</span>
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {hasMore && (
                            <div className='flex items-center justify-center py-4'>
                                <span className='text-muted-foreground text-xs'>
                                    {lang(
                                        {
                                            'zh-CN': '加载更多',
                                            'en-US': 'Load more',
                                            'ja-JP': 'もっと読み込む',
                                            'ko-KR': '더 불러오기',
                                            'fr-FR': 'Charger plus',
                                            'es-ES': 'Cargar más',
                                            'de-DE': 'Mehr laden',
                                            'pt-BR': 'Carregar mais',
                                            'ru-RU': 'Загрузить больше',
                                            'zh-TW': '載入更多',
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    {total > 0 && (
                        <div className='text-xs text-muted-foreground text-right mt-2 pr-2'>
                            {lang(
                                {
                                    'zh-CN': `共 ${total} 条结果`,
                                    'en-US': `Total ${total} results`,
                                    'ja-JP': `合計 ${total} 件の結果`,
                                    'ko-KR': `총 ${total}개의 결과`,
                                    'fr-FR': `Total ${total} résultats`,
                                    'es-ES': `Total ${total} resultados`,
                                    'de-DE': `Insgesamt ${total} Ergebnisse`,
                                    'pt-BR': `Total de ${total} resultados`,
                                    'ru-RU': `Всего ${total} результатов`,
                                    'zh-TW': `共 ${total} 條結果`,
                                },
                                locale,
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
