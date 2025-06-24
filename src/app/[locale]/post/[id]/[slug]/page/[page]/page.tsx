import '@/app/globals.css';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import lang from '@/lib/lang';
import prisma from '@/app/api/_utils/prisma';
import { PostDetailClient } from '@/components/post-detail-client';
import { PostContent } from '@/components/post-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmojiBackground from '@/components/emoji-background';
import {
    Pin,
    Calendar,
    Globe,
    Type,
    Users,
    Hash,
    MessageCircle,
    TrendingUp,
    BarChart3,
    Languages,
    Heart,
} from 'lucide-react';
import Link from 'next/link';
import { markdownToHtml } from '@/lib/markdown-utils';
import { cache } from 'react';

type Props = {
    params: Promise<{ locale: string; id: string; slug: string; page: string }>;
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

type User = {
    uid: number;
    nickname: string;
    username: string;
    profileEmoji: string | null;
    avatar: {
        id: string;
        emoji: string;
        background: string;
    }[];
};

type ReplyData = {
    id: string;
    content: string;
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
    createdAt: Date;
    belongPostid: number | null;
    commentUid: string | null;
    originLang: string | null;
    user: User;
    _count: {
        likes: number;
        replies: number;
    };
};

type ProcessedReply = ReplyData & {
    formattedTime: string;
    replies: ProcessedReply[];
    level?: number;
    isCollapsed?: boolean;
    belongReply?: number;
};

type ContentWithLocalization = {
    content?: string;
    contentZHCN?: string | null;
    contentENUS?: string | null;
    contentZHTW?: string | null;
    contentESES?: string | null;
    contentFRFR?: string | null;
    contentRURU?: string | null;
    contentJAJP?: string | null;
    contentDEDE?: string | null;
    contentPTBR?: string | null;
    contentKOKR?: string | null;
    origin?: string;
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

// 缓存获取帖子基本信息的函数
const getPost = cache(async (postId: number) => {
    return await prisma.post.findUnique({
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
                    bio: true,
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
                    belongReplies: true,
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
            likes: {
                select: {
                    user: {
                        select: {
                            uid: true,
                            nickname: true,
                            avatar: {
                                select: {
                                    emoji: true,
                                    background: true,
                                },
                            },
                        },
                    },
                },
            },
            belongReplies: {
                select: {
                    user: {
                        select: {
                            uid: true,
                            nickname: true,
                            avatar: {
                                select: {
                                    emoji: true,
                                    background: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
});

// 缓存获取分页回复的函数
const getPaginatedReplies = cache(async (postId: number, page: number) => {
    // 首先获取顶级回复的总数来计算分页
    const topLevelRepliesCount = await prisma.reply.count({
        where: {
            belongPostid: postId,
            commentUid: null, // 只计算顶级回复
            NOT: {
                originLang: null,
            },
        },
    });

    // 计算分页参数
    const skip = (page - 1) * REPLIES_PER_PAGE;

    // 获取当前页的顶级回复
    const topLevelReplies = await prisma.reply.findMany({
        where: {
            belongPostid: postId,
            commentUid: null, // 只获取顶级回复
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
        skip,
        take: REPLIES_PER_PAGE,
    });

    // 获取这些顶级回复的所有子回复
    const topLevelReplyIds = topLevelReplies.map((reply) => reply.id);
    const childReplies =
        topLevelReplyIds.length > 0
            ? await prisma.reply.findMany({
                  where: {
                      belongPostid: postId,
                      commentUid: {
                          in: topLevelReplyIds,
                      },
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
              })
            : [];

    // 递归获取更深层的子回复
    const getAllNestedReplies = async (parentIds: string[]): Promise<ReplyData[]> => {
        if (parentIds.length === 0) return [];

        const replies = await prisma.reply.findMany({
            where: {
                belongPostid: postId,
                commentUid: {
                    in: parentIds,
                },
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
        });

        if (replies.length === 0) return [];

        const nestedReplies = await getAllNestedReplies(replies.map((r) => r.id));
        return [...replies, ...nestedReplies];
    };

    const nestedReplies = await getAllNestedReplies(childReplies.map((r) => r.id));
    const allReplies = [...topLevelReplies, ...childReplies, ...nestedReplies];

    return {
        replies: allReplies,
        totalPages: Math.ceil(topLevelRepliesCount / REPLIES_PER_PAGE),
    };
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
function getLocalizedContent(post: ContentWithLocalization, locale: string): string {
    const contentMap: Record<string, string | null | undefined> = {
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
    return contentMap[locale] || post.origin || post.content || '';
}

// 获取回复的本地化内容
function getLocalizedReplyContent(reply: ReplyData, locale: string): string {
    const contentMap: Record<string, string | null | undefined> = {
        'zh-CN': reply.contentZHCN || reply.content,
        'en-US': reply.contentENUS || reply.content,
        'zh-TW': reply.contentZHTW || reply.content,
        'es-ES': reply.contentESES || reply.content,
        'fr-FR': reply.contentFRFR || reply.content,
        'ru-RU': reply.contentRURU || reply.content,
        'ja-JP': reply.contentJAJP || reply.content,
        'de-DE': reply.contentDEDE || reply.content,
        'pt-BR': reply.contentPTBR || reply.content,
        'ko-KR': reply.contentKOKR || reply.content,
    };
    return contentMap[locale] || reply.content || '';
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

// 获取人类可读的语言名称
function getLanguageName(languageCode: string | null, locale: string): string {
    if (!languageCode) return 'N/A';

    const languageNames: Record<string, Record<string, string>> = {
        'zh-CN': {
            'zh-CN': '简体中文',
            'zh-TW': '繁体中文',
            'en-US': '英语',
            'es-ES': '西班牙语',
            'fr-FR': '法语',
            'ru-RU': '俄语',
            'ja-JP': '日语',
            'de-DE': '德语',
            'pt-BR': '葡萄牙语',
            'ko-KR': '韩语',
        },
        'en-US': {
            'zh-CN': 'Simplified Chinese',
            'zh-TW': 'Traditional Chinese',
            'en-US': 'English',
            'es-ES': 'Spanish',
            'fr-FR': 'French',
            'ru-RU': 'Russian',
            'ja-JP': 'Japanese',
            'de-DE': 'German',
            'pt-BR': 'Portuguese',
            'ko-KR': 'Korean',
        },
        'zh-TW': {
            'zh-CN': '簡體中文',
            'zh-TW': '繁體中文',
            'en-US': '英語',
            'es-ES': '西班牙語',
            'fr-FR': '法語',
            'ru-RU': '俄語',
            'ja-JP': '日語',
            'de-DE': '德語',
            'pt-BR': '葡萄牙語',
            'ko-KR': '韓語',
        },
        'es-ES': {
            'zh-CN': 'Chino simplificado',
            'zh-TW': 'Chino tradicional',
            'en-US': 'Inglés',
            'es-ES': 'Español',
            'fr-FR': 'Francés',
            'ru-RU': 'Ruso',
            'ja-JP': 'Japonés',
            'de-DE': 'Alemán',
            'pt-BR': 'Portugués',
            'ko-KR': 'Coreano',
        },
        'fr-FR': {
            'zh-CN': 'Chinois simplifié',
            'zh-TW': 'Chinois traditionnel',
            'en-US': 'Anglais',
            'es-ES': 'Espagnol',
            'fr-FR': 'Français',
            'ru-RU': 'Russe',
            'ja-JP': 'Japonais',
            'de-DE': 'Allemand',
            'pt-BR': 'Portugais',
            'ko-KR': 'Coréen',
        },
        'ru-RU': {
            'zh-CN': 'Упрощенный китайский',
            'zh-TW': 'Традиционный китайский',
            'en-US': 'Английский',
            'es-ES': 'Испанский',
            'fr-FR': 'Французский',
            'ru-RU': 'Русский',
            'ja-JP': 'Японский',
            'de-DE': 'Немецкий',
            'pt-BR': 'Португальский',
            'ko-KR': 'Корейский',
        },
        'ja-JP': {
            'zh-CN': '簡体字中国語',
            'zh-TW': '繁体字中国語',
            'en-US': '英語',
            'es-ES': 'スペイン語',
            'fr-FR': 'フランス語',
            'ru-RU': 'ロシア語',
            'ja-JP': '日本語',
            'de-DE': 'ドイツ語',
            'pt-BR': 'ポルトガル語',
            'ko-KR': '韓国語',
        },
        'de-DE': {
            'zh-CN': 'Vereinfachtes Chinesisch',
            'zh-TW': 'Traditionelles Chinesisch',
            'en-US': 'Englisch',
            'es-ES': 'Spanisch',
            'fr-FR': 'Französisch',
            'ru-RU': 'Russisch',
            'ja-JP': 'Japanisch',
            'de-DE': 'Deutsch',
            'pt-BR': 'Portugiesisch',
            'ko-KR': 'Koreanisch',
        },
        'pt-BR': {
            'zh-CN': 'Chinês simplificado',
            'zh-TW': 'Chinês tradicional',
            'en-US': 'Inglês',
            'es-ES': 'Espanhol',
            'fr-FR': 'Francês',
            'ru-RU': 'Russo',
            'ja-JP': 'Japonês',
            'de-DE': 'Alemão',
            'pt-BR': 'Português',
            'ko-KR': 'Coreano',
        },
        'ko-KR': {
            'zh-CN': '중국어 간체',
            'zh-TW': '중국어 번체',
            'en-US': '영어',
            'es-ES': '스페인어',
            'fr-FR': '프랑스어',
            'ru-RU': '러시아어',
            'ja-JP': '일본어',
            'de-DE': '독일어',
            'pt-BR': '포르투갈어',
            'ko-KR': '한국어',
        },
    };

    return languageNames[locale]?.[languageCode] || languageCode.toUpperCase();
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
    const { locale, id, slug, page: pageParam } = await params;
    const postId = parseInt(id);
    const page = parseInt(pageParam) || 1;

    if (isNaN(postId)) {
        notFound();
    }

    // 获取帖子详情和分页回复
    const [post, paginatedData] = await Promise.all([
        getPost(postId),
        getPaginatedReplies(postId, page),
    ]);

    if (!post) {
        notFound();
    }

    // 获取用户点赞状态 - 这里需要从 cookie 或 header 中获取用户信息
    // 简化处理，先设置为空，在客户端通过 API 获取
    const likeStatus = { postLiked: false, replyLikes: {} };
    const title = getLocalizedTitle(post, locale);
    const contentMarkdown = getLocalizedContent(post, locale);
    const content = await markdownToHtml(contentMarkdown);

    // 格式化时间函数需要传入locale参数
    const formatTime = (date: Date) => formatRelativeTime(date, locale);

    // 重新组织回复的层级关系，并设置belongReply编号
    const organizeReplies = (replies: ReplyData[], page: number): ProcessedReply[] => {
        const replyMap = new Map<string, ProcessedReply>();
        const rootReplies: ProcessedReply[] = [];

        // 首先处理所有回复，添加到 map 中
        replies.forEach((reply) => {
            const processedReply: ProcessedReply = {
                ...reply,
                content: getLocalizedReplyContent(reply, locale),
                formattedTime: formatTime(reply.createdAt),
                replies: [],
                level: 0, // 初始设为0，后面会更新
                isCollapsed: false, // 初始设为false，后面会根据层级更新
                belongReply: 0, // 初始设为0，后面会更新
            };
            replyMap.set(reply.id, processedReply);
        });

        // 然后建立父子关系
        replies.forEach((reply) => {
            const processedReply = replyMap.get(reply.id);
            if (processedReply && reply.commentUid && replyMap.has(reply.commentUid)) {
                // 这是一个子回复
                const parentReply = replyMap.get(reply.commentUid);
                if (parentReply) {
                    parentReply.replies.push(processedReply);
                }
            } else if (processedReply) {
                // 这是一个顶级回复
                rootReplies.push(processedReply);
            }
        });

        // 为当前页的顶级回复分配 belongReply 编号
        rootReplies.forEach((reply, index) => {
            reply.belongReply = (page - 1) * REPLIES_PER_PAGE + index + 1;
        });

        // 递归设置层级、折叠状态和 belongReply
        const setLevelsAndCollapse = (
            replies: ProcessedReply[],
            currentLevel: number,
            parentBelongReply?: number,
        ) => {
            replies.forEach((reply) => {
                reply.level = currentLevel;
                // 8层以后的回复默认折叠
                reply.isCollapsed = currentLevel >= 8;

                // 设置子回复的 belongReply，继承父回复的 belongReply
                if (currentLevel > 0 && parentBelongReply !== undefined) {
                    reply.belongReply = parentBelongReply;
                }

                // 调试日志
                if (currentLevel >= 8) {
                    // console.log(`Auto-collapsing reply at level ${currentLevel}:`, reply.id.slice(-6));
                }

                if (reply.replies.length > 0) {
                    setLevelsAndCollapse(reply.replies, currentLevel + 1, reply.belongReply);
                }
            });
        };

        setLevelsAndCollapse(rootReplies, 0);
        return rootReplies;
    };

    const processedReplies = organizeReplies(paginatedData.replies, page);

    // 递归处理所有子回复的时间格式化
    const processRepliesRecursively = (replies: ProcessedReply[]): ProcessedReply[] => {
        return replies.map((reply) => ({
            ...reply,
            formattedTime: formatTime(reply.createdAt),
            replies: reply.replies ? processRepliesRecursively(reply.replies) : [],
        }));
    };
    const finalReplies = processRepliesRecursively(processedReplies);

    // 计算字数（原文和本地化文）
    const originalWordCount = (post.origin || contentMarkdown).length;
    const localizedWordCount = contentMarkdown.length;

    // 去重处理点赞者
    const uniqueLikers = post.likes
        ? Array.from(new Map(post.likes.map((like) => [like.user.uid, like.user])).values())
        : [];

    // 去重处理评论者
    const uniqueRepliers = post.belongReplies
        ? Array.from(
              new Map(post.belongReplies.map((reply) => [reply.user.uid, reply.user])).values(),
          )
        : [];

    // 计算回复参与人数
    const replyParticipants = uniqueRepliers.length;

    // 计算回复数趋势 (时间分布)
    const replyTimeDistribution = (() => {
        if (paginatedData.replies.length === 0) return [];

        const times = paginatedData.replies.map((reply) => new Date(reply.createdAt).getTime());
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        if (minTime === maxTime) {
            return [
                {
                    startTime: minTime,
                    endTime: maxTime,
                    count: paginatedData.replies.length,
                },
            ];
        }

        const timeRange = maxTime - minTime;
        const bucketSize = timeRange / 10;
        const buckets = Array(10).fill(0);

        paginatedData.replies.forEach((reply) => {
            const time = new Date(reply.createdAt).getTime();
            const bucketIndex = Math.min(9, Math.floor((time - minTime) / bucketSize));
            buckets[bucketIndex]++;
        });

        return buckets.map((count, index) => ({
            startTime: minTime + index * bucketSize,
            endTime: minTime + (index + 1) * bucketSize,
            count,
        }));
    })();

    // 格式化相对时间
    const formatRelativeTime2 = (timestamp: number, locale: string) => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

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
        } else {
            return new Date(timestamp).toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric',
                year:
                    new Date(timestamp).getFullYear() !== new Date().getFullYear()
                        ? 'numeric'
                        : undefined,
            });
        }
    };

    return (
        <div className='mx-auto px-4 py-6 max-w-7xl'>
            <div className='flex gap-6'>
                {/* 主要内容区域 */}
                <div className='flex-1 max-w-4xl'>
                    {/* 帖子详情卡片 */}
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
                                    {' '}
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
                                                            href={`/${locale}/topic/${topic.name.replaceAll('_', '-')}`}
                                                            className='hover:opacity-80 transition-opacity'>
                                                            <Badge
                                                                variant='secondary'
                                                                className='text-xs'>
                                                                <span className='mr-1'>
                                                                    {topic.emoji}
                                                                </span>
                                                                {getLocalizedTopicName(
                                                                    topic,
                                                                    locale,
                                                                )}
                                                            </Badge>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <PostContent
                                initialContent={content}
                                postId={post.id}
                                locale={locale}
                            />
                        </CardContent>
                    </Card>{' '}
                    <PostDetailClient
                        post={{
                            id: post.id,
                            title,
                            likes: post._count.likes,
                            replies: post._count.belongReplies,
                            isTranslated: post.originLang !== locale,
                        }}
                        replies={finalReplies}
                        locale={locale}
                        currentPage={page}
                        totalPages={paginatedData.totalPages}
                        slug={slug}
                        initialLikeStatus={likeStatus}
                    />
                </div>{' '}
                {/* 右侧统计区域 */}
                <div className='hidden xl:block w-80 space-y-4'>
                    {/* 作者信息卡片 */}
                    {post.User && (
                        <Card className='relative overflow-hidden'>
                            <EmojiBackground
                                primaryColor='#f0b100'
                                userEmojis={post.User.profileEmoji}
                            />
                            <CardHeader className='relative z-10'>
                                <div className='flex items-center space-x-3'>
                                    <Avatar className='h-16 w-16 border-2 border-white/20'>
                                        <AvatarImage
                                            src={
                                                post.User.avatar[0]
                                                    ? `/api/dynamicImage/emoji?emoji=${encodeURIComponent(
                                                          post.User.avatar[0].emoji || '',
                                                      )}&background=${encodeURIComponent(
                                                          post.User.avatar[0].background?.replaceAll(
                                                              '%',
                                                              '%25',
                                                          ) || '',
                                                      )}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback className='text-lg bg-white/20 text-white'>
                                            {post.User.profileEmoji
                                                ? post.User.profileEmoji.split(' ')[0] ||
                                                  post.User.username.charAt(0).toUpperCase()
                                                : post.User.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex-1'>
                                        <Link
                                            href={`/${locale}/user/${post.User.uid}`}
                                            className='block hover:opacity-80 transition-opacity'>
                                            <h3 className='text-lg font-semibold mb-1 text-white drop-shadow-lg'>
                                                {post.User.nickname}
                                            </h3>
                                            <p className='text-sm text-white/90 drop-shadow-sm'>
                                                @{post.User.username}
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>{' '}
                            {post.User.bio && (
                                <CardContent className='relative z-10 pt-0'>
                                    <p className='text-sm text-white/90 drop-shadow-sm overflow-hidden text-ellipsis'>
                                        {post.User.bio}
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    )}
                    {/* 帖子基本信息 */}
                    <Card>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5' />
                                {lang(
                                    {
                                        'zh-CN': '帖子信息',
                                        'en-US': 'Post Information',
                                        'zh-TW': '貼文資訊',
                                        'es-ES': 'Información de la publicación',
                                        'fr-FR': 'Informations sur le message',
                                        'ru-RU': 'Информация о сообщении',
                                        'ja-JP': '投稿情報',
                                        'de-DE': 'Beitragsinformationen',
                                        'pt-BR': 'Informações da postagem',
                                        'ko-KR': '게시물 정보',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {' '}
                                {/* 源语言 */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Languages className='h-4 w-4' />
                                        {lang(
                                            {
                                                'zh-CN': '源语言',
                                                'en-US': 'Original Language',
                                                'zh-TW': '源語言',
                                                'es-ES': 'Idioma original',
                                                'fr-FR': 'Langue originale',
                                                'ru-RU': 'Исходный язык',
                                                'ja-JP': '元の言語',
                                                'de-DE': 'Originalsprache',
                                                'pt-BR': 'Idioma original',
                                                'ko-KR': '원본 언어',
                                            },
                                            locale,
                                        )}
                                    </div>
                                    <span className='text-sm font-medium'>
                                        {getLanguageName(post.originLang, locale)}
                                    </span>
                                </div>
                                {/* 字数统计 */}
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                            <Type className='h-4 w-4' />
                                            {lang(
                                                {
                                                    'zh-CN': '当前语言字数',
                                                    'en-US': 'Current Language Length',
                                                    'zh-TW': '當前語言字數',
                                                    'es-ES': 'Longitud en idioma actual',
                                                    'fr-FR': 'Longueur en langue actuelle',
                                                    'ru-RU': 'Длина на текущем языке',
                                                    'ja-JP': '現在の言語の文字数',
                                                    'de-DE': 'Aktuelle Sprachlänge',
                                                    'pt-BR': 'Comprimento no idioma atual',
                                                    'ko-KR': '현재 언어 문자 수',
                                                },
                                                locale,
                                            )}
                                        </div>
                                        <span className='text-sm font-medium'>
                                            {localizedWordCount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                            <Globe className='h-4 w-4' />
                                            {lang(
                                                {
                                                    'zh-CN': '源语言字数',
                                                    'en-US': 'Original Language Length',
                                                    'zh-TW': '源語言字數',
                                                    'es-ES': 'Longitud en idioma original',
                                                    'fr-FR': 'Longueur en langue originale',
                                                    'ru-RU': 'Длина на исходном языке',
                                                    'ja-JP': '元の言語の文字数',
                                                    'de-DE': 'Originalsprachlänge',
                                                    'pt-BR': 'Comprimento no idioma original',
                                                    'ko-KR': '원본 언어 문자 수',
                                                },
                                                locale,
                                            )}
                                        </div>
                                        <span className='text-sm font-medium'>
                                            {originalWordCount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {/* 回复参与人数 */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Users className='h-4 w-4' />
                                        {lang(
                                            {
                                                'zh-CN': '回复参与人数',
                                                'en-US': 'Reply Participants',
                                                'zh-TW': '回覆參與人數',
                                                'es-ES': 'Participantes en respuestas',
                                                'fr-FR': 'Participants aux réponses',
                                                'ru-RU': 'Участники ответов',
                                                'ja-JP': '返信参加者数',
                                                'de-DE': 'Antwort-Teilnehmer',
                                                'pt-BR': 'Participantes das respostas',
                                                'ko-KR': '답글 참여자 수',
                                            },
                                            locale,
                                        )}
                                    </div>
                                    <span className='text-sm font-medium'>
                                        {replyParticipants.toLocaleString()}
                                    </span>
                                </div>
                                {/* 创建时间 */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Calendar className='h-4 w-4' />
                                        {lang(
                                            {
                                                'zh-CN': '创建时间',
                                                'en-US': 'Created At',
                                                'zh-TW': '建立時間',
                                                'es-ES': 'Creado en',
                                                'fr-FR': 'Créé le',
                                                'ru-RU': 'Создано',
                                                'ja-JP': '作成日時',
                                                'de-DE': 'Erstellt am',
                                                'pt-BR': 'Criado em',
                                                'ko-KR': '생성 시간',
                                            },
                                            locale,
                                        )}
                                    </div>
                                    <span className='text-sm font-medium'>
                                        {post.createdAt.toLocaleDateString(locale, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>{' '}
                    {/* 帖子主题 */}
                    {post.topics.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Hash className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '帖子主题',
                                            'en-US': 'Post Topic',
                                            'zh-TW': '貼文主題',
                                            'es-ES': 'Tema de la publicación',
                                            'fr-FR': 'Sujet du message',
                                            'ru-RU': 'Тема сообщения',
                                            'ja-JP': '投稿トピック',
                                            'de-DE': 'Beitragsthema',
                                            'pt-BR': 'Tópico da postagem',
                                            'ko-KR': '게시물 주제',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {post.topics.map((topic) => (
                                    <Link
                                        key={topic.name}
                                        href={`/${locale}/topic/${topic.name.replaceAll('_', '-')}`}
                                        className='block hover:opacity-80 transition-opacity group'
                                        title={`${lang(
                                            {
                                                'zh-CN': '查看主题',
                                                'en-US': 'View topic',
                                                'zh-TW': '查看主題',
                                                'es-ES': 'Ver tema',
                                                'fr-FR': 'Voir le sujet',
                                                'ru-RU': 'Посмотреть тему',
                                                'ja-JP': 'トピックを表示',
                                                'de-DE': 'Thema anzeigen',
                                                'pt-BR': 'Ver tópico',
                                                'ko-KR': '주제 보기',
                                            },
                                            locale,
                                        )}: ${getLocalizedTopicName(topic, locale)}`}>
                                        <div className='flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-muted group-hover:border-primary/50 transition-colors'>
                                            <div className='text-center'>
                                                <div className='text-4xl mb-3'>{topic.emoji}</div>
                                                <div className='text-xl font-semibold mb-1 group-hover:text-primary transition-colors'>
                                                    {getLocalizedTopicName(topic, locale)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}{' '}
                            </CardContent>
                        </Card>
                    )}{' '}
                    {/* 点赞者头像 */}
                    {uniqueLikers.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Heart className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '点赞用户',
                                            'en-US': 'Liked by',
                                            'zh-TW': '按讚用戶',
                                            'es-ES': 'Les gustó a',
                                            'fr-FR': 'Aimé par',
                                            'ru-RU': 'Понравилось',
                                            'ja-JP': 'いいねしたユーザー',
                                            'de-DE': 'Gefällt',
                                            'pt-BR': 'Curtido por',
                                            'ko-KR': '좋아요한 사용자',
                                        },
                                        locale,
                                    )}
                                    <span className='text-sm font-normal text-muted-foreground'>
                                        ({uniqueLikers.length})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-wrap gap-2'>
                                    {uniqueLikers.slice(0, 20).map((user, index) => (
                                        <Link
                                            key={`${user.uid}-${index}`}
                                            href={`/${locale}/user/${user.uid}`}
                                            className='hover:opacity-80 transition-opacity'
                                            title={user.nickname || 'Anonymous'}>
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage
                                                    src={
                                                        user.avatar[0]
                                                            ? `/api/dynamicImage/emoji?emoji=${encodeURIComponent(
                                                                  user.avatar[0].emoji || '',
                                                              )}&background=${encodeURIComponent(
                                                                  user.avatar[0].background?.replaceAll(
                                                                      '%',
                                                                      '%25',
                                                                  ) || '',
                                                              )}`
                                                            : undefined
                                                    }
                                                />
                                                <AvatarFallback
                                                    className='text-xs'
                                                    style={{
                                                        backgroundColor:
                                                            user.avatar[0]?.background || '#e5e7eb',
                                                    }}>
                                                    {user.avatar[0]?.emoji ||
                                                        user.nickname?.charAt(0) ||
                                                        'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    ))}
                                    {uniqueLikers.length > 20 && (
                                        <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                                            +{uniqueLikers.length - 20}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}{' '}
                    {/* 评论者头像 */}
                    {uniqueRepliers.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <MessageCircle className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '回复用户',
                                            'en-US': 'Replied by',
                                            'zh-TW': '回覆用戶',
                                            'es-ES': 'Respondido por',
                                            'fr-FR': 'Répondu par',
                                            'ru-RU': 'Ответил',
                                            'ja-JP': '返信したユーザー',
                                            'de-DE': 'Antwortet von',
                                            'pt-BR': 'Respondido por',
                                            'ko-KR': '답글 작성자',
                                        },
                                        locale,
                                    )}
                                    <span className='text-sm font-normal text-muted-foreground'>
                                        ({uniqueRepliers.length})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-wrap gap-2'>
                                    {uniqueRepliers.slice(0, 20).map((user, index) => (
                                        <Link
                                            key={`${user.uid}-${index}`}
                                            href={`/${locale}/user/${user.uid}`}
                                            className='hover:opacity-80 transition-opacity'
                                            title={user.nickname || 'Anonymous'}>
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage
                                                    src={
                                                        user.avatar[0]
                                                            ? `/api/dynamicImage/emoji?emoji=${encodeURIComponent(
                                                                  user.avatar[0].emoji || '',
                                                              )}&background=${encodeURIComponent(
                                                                  user.avatar[0].background?.replaceAll(
                                                                      '%',
                                                                      '%25',
                                                                  ) || '',
                                                              )}`
                                                            : undefined
                                                    }
                                                />
                                                <AvatarFallback
                                                    className='text-xs'
                                                    style={{
                                                        backgroundColor:
                                                            user.avatar[0]?.background || '#e5e7eb',
                                                    }}>
                                                    {user.avatar[0]?.emoji ||
                                                        user.nickname?.charAt(0) ||
                                                        'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    ))}
                                    {uniqueRepliers.length > 20 && (
                                        <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                                            +{uniqueRepliers.length - 20}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {/* 回复数趋势图 */}
                    {replyTimeDistribution.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <BarChart3 className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '回复时间分布',
                                            'en-US': 'Reply Time Distribution',
                                            'zh-TW': '回覆時間分佈',
                                            'es-ES': 'Distribución temporal de respuestas',
                                            'fr-FR': 'Distribution temporelle des réponses',
                                            'ru-RU': 'Временное распределение ответов',
                                            'ja-JP': '返信時間の分布',
                                            'de-DE': 'Zeitverteilung der Antworten',
                                            'pt-BR': 'Distribuição temporal das respostas',
                                            'ko-KR': '답글 시간 분포',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3'>
                                    <div className='flex items-end justify-between h-32 gap-1 border-b border-border'>
                                        {replyTimeDistribution.map((bucket, index) => {
                                            const maxCount = Math.max(
                                                ...replyTimeDistribution.map((b) => b.count),
                                            );
                                            const percentage =
                                                maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
                                            const heightPx = Math.max(
                                                percentage * 1.2,
                                                bucket.count > 0 ? 12 : 4,
                                            );
                                            return (
                                                <div
                                                    key={index}
                                                    className='flex-1 flex flex-col justify-end items-center'>
                                                    <div
                                                        className='w-full bg-primary/60 rounded-t-sm min-h-[4px] flex items-end justify-center transition-all'
                                                        style={{ height: `${heightPx}px` }}
                                                        title={`${bucket.count} ${lang(
                                                            {
                                                                'zh-CN': '条回复',
                                                                'en-US': 'replies',
                                                                'zh-TW': '條回覆',
                                                                'es-ES': 'respuestas',
                                                                'fr-FR': 'réponses',
                                                                'ru-RU': 'ответов',
                                                                'ja-JP': '返信',
                                                                'de-DE': 'Antworten',
                                                                'pt-BR': 'respostas',
                                                                'ko-KR': '답글',
                                                            },
                                                            locale,
                                                        )}`}>
                                                        {bucket.count > 0 && maxCount <= 10 && (
                                                            <span className='text-xs text-white font-medium pb-0.5'>
                                                                {bucket.count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className='flex justify-between text-xs text-muted-foreground'>
                                        <span>
                                            {formatRelativeTime2(
                                                replyTimeDistribution[0]?.startTime || Date.now(),
                                                locale,
                                            )}
                                        </span>
                                        <span>
                                            {formatRelativeTime2(
                                                replyTimeDistribution[
                                                    replyTimeDistribution.length - 1
                                                ]?.endTime || Date.now(),
                                                locale,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>{' '}
                        </Card>
                    )}
                </div>
            </div>
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
