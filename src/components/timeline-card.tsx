import { Badge } from '@/components/ui/badge';
import lang from '@/lib/lang';
import { FileText, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';

type TimelineItem = {
    id: string;
    type: 'post' | 'reply' | 'like';
    createdAt: Date;
    content: any;
    originLang?: string;
    // 多语言标题字段
    titleENUS?: string;
    titleZHCN?: string;
    titleZHTW?: string;
    titleESES?: string;
    titleFRFR?: string;
    titleRURU?: string;
    titleJAJP?: string;
    titleKOKR?: string;
    titleDEDE?: string;
    titlePTBR?: string;
};

type Props = {
    item: TimelineItem;
    locale: string;
};

export function TimelineCard({ item, locale }: Props) {
    const getIcon = () => {
        switch (item.type) {
            case 'post':
                return <FileText className='h-5 w-5 text-blue-500' />;
            case 'reply':
                return <MessageSquare className='h-5 w-5 text-green-500' />;
            case 'like':
                return <Heart className='h-5 w-5 text-red-500 fill-current' />;
        }
    };

    const getTypeText = () => {
        switch (item.type) {
            case 'post':
                return lang(
                    {
                        'zh-CN': '发布了帖子',
                        'en-US': 'Posted a new topic',
                        'de-DE': 'Hat ein neues Thema veröffentlicht',
                        'es-ES': 'Publicó un nuevo tema',
                        'fr-FR': 'A publié un nouveau sujet',
                        'ja-JP': '新しいトピックを投稿しました',
                        'ko-KR': '새로운 주제를 게시했습니다',
                        'pt-BR': 'Postou um novo tópico',
                        'ru-RU': 'Опубликовал новую тему',
                        'zh-TW': '發佈了帖子',
                    },
                    locale,
                );
            case 'reply':
                return lang(
                    {
                        'zh-CN': '发表了回复',
                        'en-US': 'Posted a reply',
                        'de-DE': 'Hat geantwortet',
                        'es-ES': 'Publicó una respuesta',
                        'fr-FR': 'A publié une réponse',
                        'ja-JP': '返信を投稿しました',
                        'ko-KR': '답글을 게시했습니다',
                        'pt-BR': 'Postou uma resposta',
                        'ru-RU': 'Ответил',
                        'zh-TW': '發表了回覆',
                    },
                    locale,
                );
            case 'like':
                return lang(
                    {
                        'zh-CN': '点赞了',
                        'en-US': 'Liked',
                        'de-DE': 'Hat geliked',
                        'es-ES': 'Le gustó',
                        'fr-FR': 'A aimé',
                        'ja-JP': 'いいねしました',
                        'ko-KR': '좋아요를 눌렀습니다',
                        'pt-BR': 'Curtiu',
                        'ru-RU': 'Понравилось',
                        'zh-TW': '點讚了',
                    },
                    locale,
                );
        }
    };

    const getLocalizedTitle = (item: TimelineItem) => {
        if (!item.content?.title) return '';

        // 如果原始语言等于当前语言，返回原始标题
        if (item.originLang === locale) {
            return item.content.title;
        }

        // 根据locale获取对应的多语言标题
        const localeKey = locale.replace('-', '').toUpperCase();
        const titleField = `title${localeKey}` as keyof TimelineItem;

        return item[titleField] || item.content.title;
    };

    const getLocalizedContent = (content: any, originLang?: string) => {
        if (!content?.content) return '';

        // 如果原始语言等于当前语言，返回原始内容
        if (originLang === locale) {
            return content.content;
        }

        // 根据locale获取对应的多语言内容
        const localeKey = locale.replace('-', '').toUpperCase();
        const contentField = `content${localeKey}`;

        return content[contentField] || content.content;
    };

    const getLocalizedPostTitle = (post: any) => {
        if (!post?.title) return '';

        // 如果原始语言等于当前语言，返回原始标题
        if (post.originLang === locale) {
            return post.title;
        }

        // 根据locale获取对应的多语言标题
        const localeKey = locale.replace('-', '').toUpperCase();
        const titleField = `title${localeKey}`;

        return post[titleField] || post.title;
    };

    const getContent = () => {
        switch (item.type) {
            case 'post':
                return (
                    <div className='flex justify-between items-start gap-4'>
                        <div className='flex-1 min-w-0'>
                            <Link
                                href={`/${locale}/post/${item.content.id}/${item.titleENUS
                                    ?.toLowerCase()
                                    .replaceAll(' ', '-')
                                    .replace(/[^a-z-]/g, '')}`}
                                className='font-medium hover:underline'>
                                {getLocalizedTitle(item)}
                            </Link>
                            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                {item.content.origin}
                            </p>
                        </div>
                        <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                            <time className='text-xs text-muted-foreground/80'>
                                {getRelativeTime(new Date(item.createdAt))}
                            </time>
                            <div className='flex gap-4 text-xs text-muted-foreground'>
                                <span>
                                    {item.content._count.Reply}{' '}
                                    {lang(
                                        {
                                            'zh-CN': '回复',
                                            'en-US': 'replies',
                                            'de-DE': 'Antworten',
                                            'es-ES': 'respuestas',
                                            'fr-FR': 'réponses',
                                            'ja-JP': '返信',
                                            'ko-KR': '답글',
                                            'pt-BR': 'respostas',
                                            'ru-RU': 'ответов',
                                            'zh-TW': '回覆',
                                        },
                                        locale,
                                    )}
                                </span>
                                <span>
                                    {item.content._count.likes}{' '}
                                    {lang(
                                        {
                                            'zh-CN': '点赞',
                                            'en-US': 'likes',
                                            'de-DE': 'Likes',
                                            'es-ES': 'me gusta',
                                            'fr-FR': "j'aime",
                                            'ja-JP': 'いいね',
                                            'ko-KR': '좋아요',
                                            'pt-BR': 'curtidas',
                                            'ru-RU': 'лайков',
                                            'zh-TW': '點讚',
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            case 'reply':
                return (
                    <div className='flex justify-between items-start gap-4'>
                        <div className='flex-1 min-w-0'>
                            {item.content.post && (
                                <Link
                                    href={`/${locale}/post/${item.content.post.id}/${item.content.post.titleENUS
                                    ?.toLowerCase()
                                    .replaceAll(' ', '-')
                                    .replace(/[^a-z-]/g, '')}`}
                                    className='text-sm text-muted-foreground hover:underline'>
                                    {lang(
                                        {
                                            'zh-CN': '回复帖子',
                                            'en-US': 'Reply to post',
                                            'de-DE': 'Antwort auf Beitrag',
                                            'es-ES': 'Respuesta a la publicación',
                                            'fr-FR': 'Réponse au post',
                                            'ja-JP': '投稿への返信',
                                            'ko-KR': '게시물에 답글',
                                            'pt-BR': 'Resposta ao post',
                                            'ru-RU': 'Ответ на пост',
                                            'zh-TW': '回覆帖子',
                                        },
                                        locale,
                                    )}
                                    : {getLocalizedPostTitle(item.content.post)}
                                </Link>
                            )}
                            <p className='mt-1 line-clamp-3'>
                                {getLocalizedContent(item.content, item.originLang)}
                            </p>
                        </div>
                        <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                            <time className='text-xs text-muted-foreground/80'>
                                {getRelativeTime(new Date(item.createdAt))}
                            </time>
                            <div className='flex gap-4 text-xs text-muted-foreground'>
                                <span>
                                    {item.content._count.likes}{' '}
                                    {lang(
                                        {
                                            'zh-CN': '点赞',
                                            'en-US': 'likes',
                                            'de-DE': 'Likes',
                                            'es-ES': 'me gusta',
                                            'fr-FR': "j'aime",
                                            'ja-JP': 'いいね',
                                            'ko-KR': '좋아요',
                                            'pt-BR': 'curtidas',
                                            'ru-RU': 'лайков',
                                            'zh-TW': '點讚',
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            case 'like':
                return (
                    <div className='flex justify-between items-start gap-4'>
                        <div className='flex-1 min-w-0'>
                            {item.content.post && (
                                <Link
                                    href={`/${locale}/post/${item.content.post.id}`}
                                    className='hover:underline'>
                                    {getLocalizedPostTitle(item.content.post)}
                                </Link>
                            )}
                            {item.content.reply && (
                                <p className='line-clamp-2'>
                                    {getLocalizedContent(
                                        item.content.reply,
                                        item.content.reply.originLang,
                                    )}
                                </p>
                            )}
                        </div>
                        <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                            <time className='text-xs text-muted-foreground/80'>
                                {getRelativeTime(new Date(item.createdAt))}
                            </time>
                        </div>
                    </div>
                );
        }
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // 如果超过7天，返回绝对时间
        if (diffInDays >= 7) {
            return date.toLocaleString(locale);
        }

        // 相对时间显示
        if (diffInMinutes < 1) {
            return lang(
                {
                    'zh-CN': '刚刚',
                    'en-US': 'Just now',
                    'de-DE': 'Gerade eben',
                    'es-ES': 'Justo ahora',
                    'fr-FR': "À l'instant",
                    'ja-JP': 'たった今',
                    'ko-KR': '방금',
                    'pt-BR': 'Agora há pouco',
                    'ru-RU': 'Только что',
                    'zh-TW': '剛剛',
                },
                locale,
            );
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}${lang(
                {
                    'zh-CN': '分钟前',
                    'en-US': ' minutes ago',
                    'de-DE': ' Minuten her',
                    'es-ES': ' minutos atrás',
                    'fr-FR': ' minutes plus tôt',
                    'ja-JP': '分前',
                    'ko-KR': '분 전',
                    'pt-BR': ' minutos atrás',
                    'ru-RU': ' минут назад',
                    'zh-TW': '分鐘前',
                },
                locale,
            )}`;
        } else if (diffInHours < 24) {
            return `${diffInHours}${lang(
                {
                    'zh-CN': '小时前',
                    'en-US': ' hours ago',
                    'de-DE': ' Stunden her',
                    'es-ES': ' horas atrás',
                    'fr-FR': ' heures plus tôt',
                    'ja-JP': '時間前',
                    'ko-KR': '시간 전',
                    'pt-BR': ' horas atrás',
                    'ru-RU': ' часов назад',
                    'zh-TW': '小時前',
                },
                locale,
            )}`;
        } else {
            return `${diffInDays}${lang(
                {
                    'zh-CN': '天前',
                    'en-US': ' days ago',
                    'de-DE': ' Tage her',
                    'es-ES': ' días atrás',
                    'fr-FR': ' jours plus tôt',
                    'ja-JP': '日前',
                    'ko-KR': '일 전',
                    'pt-BR': ' dias atrás',
                    'ru-RU': ' дней назад',
                    'zh-TW': '天前',
                },
                locale,
            )}`;
        }
    };

    return (
        <div className='group relative pl-8 py-4 border-l-2 border-l-border hover:border-l-primary/60 transition-all duration-200'>
            <div className='absolute left-0 top-6 w-3 h-3 bg-background border-2 border-primary/40 rounded-full -translate-x-1/2 group-hover:border-primary transition-colors duration-200'></div>

            <div className='bg-card/50 rounded-xl p-4 border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200'>
                <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 rounded-lg bg-muted/50'>{getIcon()}</div>
                        <Badge variant='secondary' className='text-xs font-medium px-2 py-1'>
                            {getTypeText()}
                        </Badge>
                    </div>

                    <div>
                        {getContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
