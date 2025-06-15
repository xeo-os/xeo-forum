import prisma from "@/app/api/_utils/prisma";
import { unstable_cache } from 'next/cache';

export interface GlobalStats {
    userCount: number;
    translationCount: number;
}

export interface LeaderboardUser {
    uid: number;
    nickname: string;
    username: string;
    profileEmoji: string | null;
    avatar: {
        emoji: string;
        background: string;
    }[];
    _count: {
        post: number;
        reply: number;
        likes: number;
        following: number;
        followed: number;
    };
}

export interface LeaderboardPost {
    id: number;
    title: string;
    titleENUS: string | null;
    titleZHCN: string | null;
    titleZHTW: string | null;
    titleESES: string | null;
    titleFRFR: string | null;
    titleRURU: string | null;
    titleJAJP: string | null;
    titleDEDE: string | null;
    titlePTBR: string | null;
    titleKOKR: string | null;
    originLang: string | null;
    createdAt: Date;
    user: {
        uid: number;
        nickname: string;
        username: string;
        avatar: {
            emoji: string;
            background: string;
        }[];
    };
    _count: {
        likes: number;
        Reply: number;
    };
}

// 缓存时间：1小时
const CACHE_DURATION = 3600;

// 获取时间范围的开始时间
function getDateRange(period: 'today' | 'week' | 'year' | 'all'): Date | null {
    const now = new Date();
    switch (period) {
        case 'today':
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            return today;
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            return weekStart;
        case 'year':
            const yearStart = new Date(now);
            yearStart.setFullYear(now.getFullYear() - 1);
            return yearStart;
        case 'all':
            return null;
        default:
            return null;
    }
}

// 带缓存的帖子排行榜函数
export const getTopPostsByScore = unstable_cache(
    async (period: 'today' | 'week' | 'year' | 'all', limit: number = 10): Promise<LeaderboardPost[]> => {
        const dateFrom = getDateRange(period);
        
        const whereClause = {
            published: true,
            originLang: { not: null },
            ...(dateFrom && { createdAt: { gte: dateFrom } }),
        };

        const posts = await prisma.post.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                titleENUS: true,
                titleZHCN: true,
                titleZHTW: true,
                titleESES: true,
                titleFRFR: true,
                titleRURU: true,
                titleJAJP: true,
                titleDEDE: true,
                titlePTBR: true,
                titleKOKR: true,
                originLang: true,
                createdAt: true,
                User: {
                    select: {
                        uid: true,
                        nickname: true,
                        username: true,
                        avatar: {
                            select: {
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
            },
            take: limit * 3, // 取更多数据以便排序
        });

        // 计算综合得分 (回复数 + 点赞数)
        const postsWithScore = posts.map(post => ({
            ...post,
            user: post.User,
            score: post._count.likes + post._count.Reply,
        }));

        // 按得分排序并取前N个
        return postsWithScore
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },
    [`posts-leaderboard`],
    {
        revalidate: CACHE_DURATION,
        tags: ['posts-leaderboard'],
    }
);

// 带缓存的用户排行榜函数
export const getTopUsersByPosts = unstable_cache(
    async (limit: number = 10): Promise<LeaderboardUser[]> => {
        const users = await prisma.user.findMany({
            select: {
                uid: true,
                nickname: true,
                username: true,
                profileEmoji: true,
                avatar: {
                    select: {
                        emoji: true,
                        background: true,
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        post: true,
                        reply: true,
                    },
                },
            },
            orderBy: {
                post: {
                    _count: 'desc',
                },
            },
            take: limit,
        });

        return users;
    },
    [`users-posts-leaderboard`],
    {
        revalidate: CACHE_DURATION,
        tags: ['users-leaderboard'],
    }
);

export const getTopUsersByReplies = unstable_cache(
    async (limit: number = 10): Promise<LeaderboardUser[]> => {
        const users = await prisma.user.findMany({
            select: {
                uid: true,
                nickname: true,
                username: true,
                profileEmoji: true,
                avatar: {
                    select: {
                        emoji: true,
                        background: true,
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        post: true,
                        reply: true,
                    },
                },
            },
            orderBy: {
                reply: {
                    _count: 'desc',
                },
            },
            take: limit,
        });

        return users;
    },
    [`users-replies-leaderboard`],
    {
        revalidate: CACHE_DURATION,
        tags: ['users-leaderboard'],
    }
);

// 获取排行榜统计数据用于图表展示
export const getLeaderboardStats = unstable_cache(
    async () => {
        const [todayPosts, weekPosts, yearPosts, allPosts] = await Promise.all([
            getTopPostsByScore('today', 5),
            getTopPostsByScore('week', 5),
            getTopPostsByScore('year', 5),
            getTopPostsByScore('all', 5),
        ]);

        return {
            today: todayPosts,
            week: weekPosts,
            year: yearPosts,
            all: allPosts,
        };
    },
    [`leaderboard-stats`],
    {
        revalidate: CACHE_DURATION,
        tags: ['leaderboard-stats'],
    }
);

export async function getGlobalStats(): Promise<GlobalStats> {
    const [userCount, translationCount] = await Promise.all([
        await prisma.user.count(),
        await prisma.task.count()
    ]);

    return {
        userCount,
        translationCount
    };
}

export async function getTopPostsByLikes(limit: number = 10): Promise<LeaderboardPost[]> {
    const posts = await prisma.post.findMany({
        where: {
            published: true,
            originLang: { not: null },
        },
        select: {
            id: true,
            title: true,
            titleENUS: true,
            titleZHCN: true,
            titleZHTW: true,
            titleESES: true,
            titleFRFR: true,
            titleRURU: true,
            titleJAJP: true,
            titleDEDE: true,
            titlePTBR: true,
            titleKOKR: true,
            originLang: true,
            createdAt: true,
            User: {
                select: {
                    uid: true,
                    nickname: true,
                    username: true,
                    avatar: {
                        select: {
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
        },
        orderBy: {
            likes: {
                _count: 'desc',
            },
        },
        take: limit,
    });

    return posts.map(post => ({
        ...post,
        user: post.User,
    }));
}

export async function getTopPostsByReplies(limit: number = 10): Promise<LeaderboardPost[]> {
    const posts = await prisma.post.findMany({
        where: {
            published: true,
            originLang: { not: null },
        },
        select: {
            id: true,
            title: true,
            titleENUS: true,
            titleZHCN: true,
            titleZHTW: true,
            titleESES: true,
            titleFRFR: true,
            titleRURU: true,
            titleJAJP: true,
            titleDEDE: true,
            titlePTBR: true,
            titleKOKR: true,
            originLang: true,
            createdAt: true,
            User: {
                select: {
                    uid: true,
                    nickname: true,
                    username: true,
                    avatar: {
                        select: {
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
        },
        orderBy: {
            Reply: {
                _count: 'desc',
            },
        },
        take: limit,
    });

    return posts.map(post => ({
        ...post,
        user: post.User,
    }));
}

export function formatCount(count: number): string {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}
