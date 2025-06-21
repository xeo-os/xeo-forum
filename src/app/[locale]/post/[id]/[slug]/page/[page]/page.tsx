import '@/app/globals.css';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import lang from '@/lib/lang';
import prisma from '@/app/api/_utils/prisma';
import { PostDetailClient } from '@/components/post-detail-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Pin, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { markdownToHtml } from '@/lib/markdown-utils';
import { cache } from 'react';

type Props = {
    params: { locale: string; id: string; slug: string; page: string };
};

const REPLIES_PER_PAGE = 20;

// 定义类型
type Topic = {
    name: string;
    emoji: string;
    nameZHCN: string | null;
    nameENUS: string | null;
    nameZHTW: string | null;
    nameESES: string | null;
    nameFRFR: string | null;
    nameRURU: string | null;
    nameJAJP: string | null;
    nameDEDE: string | null;
    namePTBR: string | null;
    nameKOKR: string | null;
};

type PostForMetadata = {
    title: string;
    titleZHCN: string | null;
    titleENUS: string | null;
    titleZHTW: string | null;
    titleESES: string | null;
    titleFRFR: string | null;
    titleRURU: string | null;
    titleJAJP: string | null;
    titleDEDE: string | null;
    titlePTBR: string | null;
    titleKOKR: string | null;
    origin: string;
    contentZHCN: string | null;
    contentENUS: string | null;
    contentZHTW: string | null;
    contentESES: string | null;
    contentFRFR: string | null;
    contentRURU: string | null;
    contentJAJP: string | null;
    contentDEDE: string | null;
    contentPTBR: string | null;
    contentKOKR: string | null;
};

// 缓存获取帖子基本信息的函数（用于生成 metadata）
const getPostForMetadata = cache(async (postId: number): Promise<PostForMetadata | null> => {
    return await prisma.post.findUnique({
        where: { id: postId },
        select: {
            title: true,
            titleZHCN: true,
            titleENUS: true,
            titleZHTW: true,
            titleESES: true,
            titleFRFR: true,
            titleRURU: true,
            titleJAJP: true,
            titleDEDE: true,
            titlePTBR: true,
            titleKOKR: true,
            origin: true,
            contentZHCN: true,
            contentENUS: true,
            contentZHTW: true,
            contentESES: true,
            contentFRFR: true,
            contentRURU: true,
            contentJAJP: true,
            contentDEDE: true,
            contentPTBR: true,
            contentKOKR: true,
        },
    });
});

// 缓存获取完整帖子数据的函数
const getPostWithReplies = cache(async (postId: number, page: number) => {
    const skip = (page - 1) * REPLIES_PER_PAGE;

    return await Promise.all([
        prisma.post.findUnique({
            where: {
                id: postId,
                published: true,
            },
            include: {
                User: {
                    select: {
                        uid: true,
                        nickname: true,
                        username: true,
                        profileEmoji: true,
                        avatar: {
                            select: {
                                id: true,
                                emoji: true,
                                background: true,
                            },
                            take: 1,
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        Reply: true,
                    },
                },
                topics: {
                    select: {
                        name: true,
                        emoji: true,
                        nameZHCN: true,
                        nameENUS: true,
                        nameZHTW: true,
                        nameESES: true,
                        nameFRFR: true,
                        nameRURU: true,
                        nameJAJP: true,
                        nameDEDE: true,
                        namePTBR: true,
                        nameKOKR: true,
                    },
                },
            },
        }),
        prisma.reply.findMany({
            where: {
                belongPostid: postId,
                NOT: {
                    originLang: null,
                },
            },
            include: {
                user: {
                    select: {
                        uid: true,
                        nickname: true,
                        username: true,
                        profileEmoji: true,
                        avatar: {
                            select: {
                                id: true,
                                emoji: true,
                                background: true,
                            },
                            take: 1,
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        replies: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        }),
        prisma.reply.count({
            where: {
                belongPostid: postId,
                commentUid: null,
            },
        }),
    ]);
});

// 获取用户点赞状态的函数
const getUserLikeStatus = cache(async (postId: number, userUid?: number) => {
    if (!userUid) {
        return { postLiked: false, replyLikes: {} };
    }

    try {
        // 获取帖子的点赞状态
        const postLike = await prisma.like.findFirst({
            where: {
                userUid: userUid,
                postId: postId,
            },
        });

        // 获取该帖子下所有回复的ID
        const replies = await prisma.reply.findMany({
            where: {
                belongPostid: postId,
            },
            select: {
                id: true,
            },
        });

        const replyIds = replies.map(reply => reply.id);

        // 获取用户对这些回复的点赞状态
        const replyLikes = await prisma.like.findMany({
            where: {
                userUid: userUid,
                replyId: {
                    in: replyIds,
                },
            },
            select: {
                replyId: true,
            },
        });

        // 构建回复点赞状态映射
        const replyLikesMap: Record<string, boolean> = {};
        replyLikes.forEach(like => {
            if (like.replyId) {
                replyLikesMap[like.replyId] = true;
            }
        });

        return {
            postLiked: !!postLike,
            replyLikes: replyLikesMap,
        };
    } catch (error) {
        console.error('Error getting user like status:', error);
        return { postLiked: false, replyLikes: {} };
    }
});

// 获取本地化标题
function getLocalizedTitle(post: PostForMetadata, locale: string): string {
    const titleMap: Record<string, string | null> = {
        'zh-CN': post.titleZHCN,
        'en-US': post.titleENUS,
        'zh-TW': post.titleZHTW,
        'es-ES': post.titleESES,
        'fr-FR': post.titleFRFR,
        'ru-RU': post.titleRURU,
        'ja-JP': post.titleJAJP,
        'de-DE': post.titleDEDE,
        'pt-BR': post.titlePTBR,
        'ko-KR': post.titleKOKR,
    };
    return titleMap[locale] || post.title;
}

// 获取本地化内容
function getLocalizedContent(post: any, locale: string): string {
    const contentMap: Record<string, string | null> = {
        'zh-CN': post.contentZHCN || post.origin || post.content,
        'en-US': post.contentENUS || post.origin || post.content,
        'zh-TW': post.contentZHTW || post.origin || post.content,
        'es-ES': post.contentESES || post.origin || post.content,
        'fr-FR': post.contentFRFR || post.origin || post.content,
        'ru-RU': post.contentRURU || post.origin || post.content,
        'ja-JP': post.contentJAJP || post.origin || post.content,
        'de-DE': post.contentDEDE || post.origin || post.content,
        'pt-BR': post.contentPTBR || post.origin || post.content,
        'ko-KR': post.contentKOKR || post.origin || post.content,
    };
    return contentMap[locale] || post.origin;
}

// 获取本地化主题名称
function getLocalizedTopicName(topic: Topic, locale: string): string {
    const nameMap: Record<string, string | null | undefined> = {
        'zh-CN': topic.nameZHCN,
        'en-US': topic.nameENUS,
        'zh-TW': topic.nameZHTW,
        'es-ES': topic.nameESES,
        'fr-FR': topic.nameFRFR,
        'ru-RU': topic.nameRURU,
        'ja-JP': topic.nameJAJP,
        'de-DE': topic.nameDEDE,
        'pt-BR': topic.namePTBR,
        'ko-KR': topic.nameKOKR,
    };
    return nameMap[locale] || topic.name;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
        return { title: 'Post Not Found' };
    }

    // 使用缓存的函数获取帖子数据
    const post = await getPostForMetadata(postId);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    const title = getLocalizedTitle(post, locale);
    const content = getLocalizedContent(post, locale);

    return {
        title: `${title} | XEO OS`,
        description: content.substring(0, 160) + '...',
    };
}

export default async function PostDetailPage({ params }: Props) {
    const { locale, id, page: pageParam } = await params;
    const postId = parseInt(id);
    const page = parseInt(pageParam) || 1;

    if (isNaN(postId)) {
        notFound();
    }

    // 获取帖子详情和回复
    const [post, allReplies, totalReplies] = await getPostWithReplies(postId, page);

    if (!post) {
        notFound();
    }

    // 获取用户点赞状态 - 这里需要从 cookie 或 header 中获取用户信息
    // 简化处理，先设置为空，在客户端通过 API 获取
    const likeStatus = { postLiked: false, replyLikes: {} };

    const totalPages = Math.ceil(totalReplies / REPLIES_PER_PAGE);
    const title = getLocalizedTitle(post, locale);
    const content = getLocalizedContent(post, locale);

    // 格式化时间函数需要传入locale参数
    const formatTime = (date: Date) => formatRelativeTime(date, locale);

    // 重新组织回复的层级关系
    const organizeReplies = (replies: any[]) => {
        const replyMap = new Map();
        const rootReplies: any[] = [];

        // 首先处理所有回复，添加到 map 中
        replies.forEach(reply => {
            const processedReply = {
                ...reply,
                content: getLocalizedContent(reply, locale),
                formattedTime: formatTime(reply.createdAt),
                replies: [],
            };
            replyMap.set(reply.id, processedReply);
        });

        // 然后建立父子关系
        replies.forEach(reply => {
            const processedReply = replyMap.get(reply.id);
            if (reply.commentUid && replyMap.has(reply.commentUid)) {
                // 这是一个子回复
                const parentReply = replyMap.get(reply.commentUid);
                parentReply.replies.push(processedReply);
            } else {
                // 这是一个顶级回复
                rootReplies.push(processedReply);
            }
        });

        return rootReplies;
    };

    const processedReplies = organizeReplies(allReplies);

    // 递归处理所有子回复的时间格式化
    const processRepliesRecursively = (replies: any[]): any[] => {
        return replies.map(reply => ({
            ...reply,
            formattedTime: formatTime(reply.createdAt),
            replies: reply.replies ? processRepliesRecursively(reply.replies) : []
        }));
    };

    const finalReplies = processRepliesRecursively(processedReplies);

    return (
        <div className='container mx-auto px-4 py-6 max-w-4xl'>
            {/* 帖子内容 */}
            <Card className='mb-6'>
                <CardHeader className='pb-4'>
                    <div className='flex items-start gap-4'>
                        <Link
                            href={`/${locale}/user/${post.User?.uid}`}
                            className='flex-shrink-0 hover:opacity-80 transition-opacity'>
                            <Avatar className='h-12 w-12'>
                                <AvatarImage
                                    src={
                                        post.User?.avatar[0]?.id
                                            ? `/api/dynamicImage/emoji/?emoji=${post.User.avatar[0].emoji}&background=${encodeURIComponent(
                                                  post.User.avatar[0].background.replaceAll(
                                                      '%',
                                                      '%25',
                                                  ),
                                              )}`
                                            : undefined
                                    }
                                    alt={post.User?.nickname || 'User Avatar'}
                                />
                                <AvatarFallback
                                    style={{
                                        backgroundColor:
                                            post.User?.avatar[0]?.background || '#e5e7eb',
                                    }}>
                                    {post.User?.avatar[0]?.emoji ||
                                        post.User?.profileEmoji ||
                                        post.User?.nickname?.charAt(0) ||
                                        'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Link>

                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2'>
                                <h1 className='text-2xl font-bold flex-1'>{title}</h1>
                                {post.pin && <Pin className='h-5 w-5 text-primary' />}
                            </div>

                            <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3'>
                                <Link
                                    href={`/${locale}/user/${post.User?.uid}`}
                                    className='hover:text-primary transition-colors'>
                                    @{post.User?.nickname || 'Anonymous'}
                                </Link>
                                <span>•</span>
                                <div className='flex items-center gap-1'>
                                    <Calendar className='h-4 w-4' />
                                    <time dateTime={post.createdAt.toISOString()}>
                                        {formatRelativeTime(post.createdAt, locale)}
                                    </time>
                                </div>
                                {post.topics.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <div className='flex flex-wrap gap-1'>
                                            {post.topics.map((topic) => (
                                                <Link
                                                    key={topic.name}
                                                    href={`/${locale}/topic/${topic.name}`}
                                                    className='hover:opacity-80 transition-opacity'>
                                                    <Badge variant='secondary' className='text-xs'>
                                                        <span className='mr-1'>{topic.emoji}</span>
                                                        {getLocalizedTopicName(topic, locale)}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                <div className='flex items-center gap-1'>
                                    <Heart className='h-4 w-4' />
                                    <span>{post._count.likes}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <MessageCircle className='h-4 w-4' />
                                    <span>{post._count.Reply}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Eye className='h-4 w-4' />
                                    <span>
                                        {lang(
                                            {
                                                'zh-CN': '浏览',
                                                'en-US': 'views',
                                                'zh-TW': '瀏覽',
                                                'es-ES': 'vistas',
                                                'fr-FR': 'vues',
                                                'ru-RU': 'просмотры',
                                                'ja-JP': '閲覧',
                                                'de-DE': 'Ansichten',
                                                'pt-BR': 'visualizações',
                                                'ko-KR': '조회',
                                            },
                                            locale,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div
                        className='prose prose-base prose-slate dark:prose-invert max-w-none
                     prose-headings:font-bold prose-headings:text-foreground
                     prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                     prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
                     prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                     prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
                     prose-strong:text-foreground prose-strong:font-semibold
                     prose-ul:my-4 prose-ul:pl-6 prose-li:my-2 prose-li:text-foreground
                     prose-ol:my-4 prose-ol:pl-6
                     prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-blockquote:italic'
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                    />
                </CardContent>
            </Card>            {/* 交互按钮和回复区域 */}
            <PostDetailClient
                post={{
                    id: post.id,
                    title,
                    likes: post._count.likes,
                    replies: post._count.Reply,
                }}
                replies={finalReplies}
                locale={locale}
                currentPage={page}
                totalPages={totalPages}
                initialLikeStatus={likeStatus}
            />
        </div>
    );
}

// 将 formatRelativeTime 函数移到组件外部，并且不传递给客户端组件
function formatRelativeTime(date: Date, locale: string) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
        return lang(
            {
                'zh-CN': '刚刚',
                'en-US': 'just now',
                'zh-TW': '剛剛',
                'es-ES': 'ahora mismo',
                'fr-FR': "à l'instant",
                'ru-RU': 'только что',
                'ja-JP': 'たった今',
                'de-DE': 'gerade eben',
                'pt-BR': 'agora mesmo',
                'ko-KR': '방금',
            },
            locale,
        );
    } else if (diffMins < 60) {
        return lang(
            {
                'zh-CN': `${diffMins}分钟前`,
                'en-US': `${diffMins}m ago`,
                'zh-TW': `${diffMins}分鐘前`,
                'es-ES': `hace ${diffMins}m`,
                'fr-FR': `il y a ${diffMins}m`,
                'ru-RU': `${diffMins}м назад`,
                'ja-JP': `${diffMins}分前`,
                'de-DE': `vor ${diffMins}m`,
                'pt-BR': `há ${diffMins}m`,
                'ko-KR': `${diffMins}분 전`,
            },
            locale,
        );
    } else if (diffHours < 24) {
        return lang(
            {
                'zh-CN': `${diffHours}小时前`,
                'en-US': `${diffHours}h ago`,
                'zh-TW': `${diffHours}小時前`,
                'es-ES': `hace ${diffHours}h`,
                'fr-FR': `il y a ${diffHours}h`,
                'ru-RU': `${diffHours}ч назад`,
                'ja-JP': `${diffHours}時間前`,
                'de-DE': `vor ${diffHours}h`,
                'pt-BR': `há ${diffHours}h`,
                'ko-KR': `${diffHours}시간 전`,
            },
            locale,
        );
    } else if (diffDays < 30) {
        return lang(
            {
                'zh-CN': `${diffDays}天前`,
                'en-US': `${diffDays}d ago`,
                'zh-TW': `${diffDays}天前`,
                'es-ES': `hace ${diffDays}d`,
                'fr-FR': `il y a ${diffDays}j`,
                'ru-RU': `${diffDays}д назад`,
                'ja-JP': `${diffDays}日前`,
                'de-DE': `vor ${diffDays}T`,
                'pt-BR': `há ${diffDays}d`,
                'ko-KR': `${diffDays}일 전`,
            },
            locale,
        );
    } else {
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}