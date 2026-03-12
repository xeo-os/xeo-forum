import prisma from '@/app/api/_utils/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmojiAvatar } from '@/components/emoji-avatar';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    ArrowLeft,
    MessageSquare,
    Heart,
    Clock,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import lang from '@/lib/lang';

import '@/app/globals.css';

export const revalidate = 31536000;

// 优化的数据获取函数 - 使用关联查询一次性获取用户信息和帖子
async function getUserWithPosts(uid: number, page: number, itemsPerPage: number) {
    const skip = (page - 1) * itemsPerPage;
    
    // 使用单个查询通过关联获取用户和帖子信息
    const user = await prisma.user.findUnique({
        where: { uid },
        select: {
            uid: true,
            username: true,
            nickname: true,
            avatar: {
                select: {
                    emoji: true,
                    background: true,
                },
            },
            _count: {
                select: {
                    post: true,
                },
            },
            post: {
                select: {
                    id: true,
                    title: true,
                    origin: true,
                    createdAt: true,
                    originLang: true,
                    titleENUS: true,
                    titleZHCN: true,
                    titleZHTW: true,
                    titleESES: true,
                    titleFRFR: true,
                    titleRURU: true,
                    titleJAJP: true,
                    titleKOKR: true,
                    titleDEDE: true,
                    titlePTBR: true,
                    _count: { select: { belongReplies: true, likes: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: itemsPerPage,
            }
        },
    });
    await prisma.$disconnect();

    if (!user) {
        return { user: null, posts: [] };
    }

    // 解构出帖子数据，其余作为用户信息
    const { post: posts, ...userInfo } = user;
    
    return { user: userInfo, posts };
}

type Props = {
    params: Promise<{ locale: string; uid: string; page: string }>;
};

type TimelineItem = {
    id: string;
    type: 'post';
    createdAt: Date;
    originLang?: string;
    content: {
        id?: string;
        title?: string;
        origin?: string;
        createdAt?: Date;
        originLang?: string;
        _count?: {
            belongReplies?: number;
            likes?: number;
        };
    };
    title: string;
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

const ITEMS_PER_PAGE = 10;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; uid: string }>;
}): Promise<Metadata> {
    const { locale, uid } = await params;

    // 只查询metadata所需的最少信息
    const user = await prisma.user.findUnique({
        where: { uid: parseInt(uid) },
        select: { username: true, nickname: true },
    });
    await prisma.$disconnect();

    if (!user) {
        return {
            title: '用户不存在 | XEO',
            description: '该用户不存在或已被删除。',
        };
    }

    const title = lang(
        {
            'zh-CN': `${user.nickname}的帖子 | XEO`,
            'en-US': `${user.nickname}'s Posts | XEO`,
            'ja-JP': `${user.nickname}の投稿 | XEO`,
            'ko-KR': `${user.nickname}의 게시물 | XEO`,
            'fr-FR': `Publications de ${user.nickname} | XEO`,
            'es-ES': `Publicaciones de ${user.nickname} | XEO`,
            'de-DE': `${user.nickname}s Beiträge | XEO`,
            'pt-BR': `Postagens de ${user.nickname} | XEO`,
            'ru-RU': `Посты ${user.nickname} | XEO`,
            'zh-TW': `${user.nickname}的帖子 | XEO`,
        },
        locale,
    );

    return { title };
}

export default async function UserPostsPage({ params }: Props) {
    const { page: pageParam, locale, uid } = await params;
    const page = Number(pageParam) || 1;

    // 使用优化的单次查询获取所有需要的数据
    const { user, posts } = await getUserWithPosts(parseInt(uid), page, ITEMS_PER_PAGE);

    if (!user) {
        notFound();
    }

    const userAvatar = user.avatar[0] || { emoji: '', background: '' };

    const timelineItems: TimelineItem[] = posts.map((post) => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        createdAt: post.createdAt,
        originLang: post.originLang || undefined,
        content: {
            ...post,
            id: post.id.toString(),
            originLang: post.originLang || undefined,
        },
        title: post.title || '',
        titleENUS: post.titleENUS || undefined,
        titleZHCN: post.titleZHCN || undefined,
        titleZHTW: post.titleZHTW || undefined,
        titleESES: post.titleESES || undefined,
        titleFRFR: post.titleFRFR || undefined,
        titleRURU: post.titleRURU || undefined,
        titleJAJP: post.titleJAJP || undefined,
        titleKOKR: post.titleKOKR || undefined,
        titleDEDE: post.titleDEDE || undefined,
        titlePTBR: post.titlePTBR || undefined,
    }));

    const totalPages = Math.ceil(user._count.post / ITEMS_PER_PAGE);

    const texts = {
        posts: lang(
            {
                'zh-CN': '帖子',
                'en-US': 'Posts',
                'ja-JP': '投稿',
                'ko-KR': '게시물',
                'fr-FR': 'Publications',
                'es-ES': 'Publicaciones',
                'de-DE': 'Beiträge',
                'pt-BR': 'Postagens',
                'ru-RU': 'Посты',
                'zh-TW': '帖子',
            },
            locale,
        ),
        backToProfile: lang(
            {
                'zh-CN': '返回个人资料',
                'en-US': 'Back to Profile',
                'ja-JP': 'プロフィールに戻る',
                'ko-KR': '프로필로 돌아가기',
                'fr-FR': 'Retour au profil',
                'es-ES': 'Volver al perfil',
                'de-DE': 'Zurück zum Profil',
                'pt-BR': 'Voltar ao perfil',
                'ru-RU': 'Назад к профилю',
                'zh-TW': '返回個人資料',
            },
            locale,
        ),
        previous: lang(
            {
                'zh-CN': '上一页',
                'en-US': 'Previous',
                'ja-JP': '前へ',
                'ko-KR': '이전',
                'fr-FR': 'Précédent',
                'es-ES': 'Anterior',
                'de-DE': 'Zurück',
                'pt-BR': 'Anterior',
                'ru-RU': 'Назад',
                'zh-TW': '上一頁',
            },
            locale,
        ),
        next: lang(
            {
                'zh-CN': '下一页',
                'en-US': 'Next',
                'ja-JP': '次へ',
                'ko-KR': '다음',
                'fr-FR': 'Suivant',
                'es-ES': 'Siguiente',
                'de-DE': 'Weiter',
                'pt-BR': 'Próximo',
                'ru-RU': 'Далее',
                'zh-TW': '下一頁',
            },
            locale,
        ),
    };

    const getLocalizedTitle = (item: TimelineItem) => {
        // 根据locale获取对应的多语言标题
        const localeKey = locale.replace('-', '').toUpperCase();
        const titleField = `title${localeKey}` as keyof TimelineItem;

        // 如果有对应语言的标题，使用它
        if (item[titleField]) {
            return item[titleField] as string;
        }

        // 如果原始语言等于当前语言，或者没有对应翻译，返回原始标题
        return item.content.title || '';
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
        <main className='container mx-auto px-4 py-8 max-w-4xl'>
            {/* 用户简介 */}
            <Card className='mb-8'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                            <EmojiAvatar
                                className='h-12 w-12'
                                fallbackClassName='text-lg'
                                emoji={userAvatar.emoji}
                                background={userAvatar.background}
                                fallbackText={user.username.charAt(0).toUpperCase()}
                            />
                            <div>
                                <CardTitle className='text-xl'>{user.nickname}</CardTitle>
                                <p className='text-muted-foreground'>@{user.username}</p>
                            </div>
                        </div>
                        <Button variant='outline' size='sm' asChild>
                            <Link href={`/${locale}/user/${uid}`}>
                                <ArrowLeft className='h-4 w-4 mr-1' />
                                {texts.backToProfile}
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* 帖子列表 */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        {texts.posts}
                        <Badge variant='secondary' className='ml-2'>
                            {user._count.post}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {timelineItems.length === 0 ? (
                        <div className='text-center py-12 text-muted-foreground'>
                            <div className='text-4xl mb-4'>📝</div>
                            <p className='text-lg'>
                                {lang(
                                    {
                                        'zh-CN': '暂无帖子',
                                        'en-US': 'No posts yet',
                                        'zh-TW': '暫無帖子',
                                        'es-ES': 'Aún no hay publicaciones',
                                        'fr-FR': 'Aucune publication pour le moment',
                                        'ru-RU': 'Пока нет постов',
                                        'ja-JP': 'まだ投稿がありません',
                                        'de-DE': 'Noch keine Beiträge',
                                        'pt-BR': 'Ainda não há postagens',
                                        'ko-KR': '아직 게시물이 없습니다',
                                    },
                                    locale,
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-6'>
                            {timelineItems.map((item) => (
                                <div
                                    key={item.id}
                                    className='border-b border-border pb-6 last:border-b-0'>
                                    <div className='flex items-start gap-3'>
                                        <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20'>
                                            <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='mb-2'>
                                                <Link
                                                    href={`/${locale}/post/${item.content.id}/${(item.titleENUS || item.title)
                                                        ?.toLowerCase()
                                                        .replaceAll(' ', '-')
                                                        .replace(/[^a-z-]/g, '')}`}
                                                    className='font-medium hover:underline text-lg'>
                                                    {getLocalizedTitle(item)}
                                                </Link>
                                            </div>
                                            {item.content.origin && (
                                                <div className='text-sm text-muted-foreground mb-3 line-clamp-2'>
                                                    {item.content.origin}
                                                </div>
                                            )}
                                            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                                <div className='flex items-center gap-1'>
                                                    <Clock className='h-3 w-3' />
                                                    {getRelativeTime(new Date(item.createdAt))}
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <MessageSquare className='h-3 w-3' />
                                                    {item.content._count?.belongReplies || 0}{' '}
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
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <Heart className='h-3 w-3' />
                                                    {item.content._count?.likes || 0}{' '}
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='flex items-center justify-center gap-2 mt-6'>
                            {page > 1 && (
                                <Button variant='outline' size='sm' asChild>
                                    <Link
                                        href={
                                            page == 2
                                                ? `/${locale}/user/${uid}/post/page/1`
                                                : `/${locale}/user/${uid}/post/page/${page - 1}`
                                        }
                                        rel='prev'>
                                        <ChevronLeft className='h-4 w-4 mr-1' />
                                        {texts.previous}
                                    </Link>
                                </Button>
                            )}

                            <div className='flex items-center gap-1'>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === page ? 'default' : 'outline'}
                                            size='sm'
                                            asChild
                                            className='w-8 h-8 p-0'>
                                            <Link
                                                href={`/${locale}/user/${uid}/post/page/${pageNum}`}
                                                aria-current={
                                                    pageNum === page ? 'page' : undefined
                                                }>
                                                {pageNum}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </div>

                            {page < totalPages && (
                                <Button variant='outline' size='sm' asChild>
                                    <Link
                                        href={`/${locale}/user/${uid}/post/page/${page + 1}`}
                                        rel='next'>
                                        {texts.next}
                                        <ChevronRight className='h-4 w-4 ml-1' />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
