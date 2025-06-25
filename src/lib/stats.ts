import prisma from '@/app/api/_utils/prisma';
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
        belongReplies: number;
    };
}

// 缓存时间：1小时
const CACHE_DURATION = 3600;

// 通用的帖子查询函数 - 一次性获取所有需要的帖子数据（带缓存）
const getAllPostsWithStats = unstable_cache(
    async (dateFrom?: Date): Promise<LeaderboardPost[]> => {
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
                    belongReplies: true,
                },
            },
        },        });

        return posts
            .filter((post) => post.User !== null)
            .map((post) => ({
                ...post,
                user: post.User!,
            }));
    },
    ['all-posts-with-stats'],
    {
        revalidate: CACHE_DURATION,
        tags: ['posts-data'],
    },
);

// 通用的用户查询函数（带缓存）
const getAllUsersWithStats = unstable_cache(
    async (): Promise<LeaderboardUser[]> => {
        return await prisma.user.findMany({
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
                        likes: true,
                        following: true,
                        followed: true,
                    },
                },
            },
        });
    },
    ['all-users-with-stats'],
    {
        revalidate: CACHE_DURATION,
        tags: ['users-data'],
    },
);

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

// 带缓存的帖子排行榜函数 - 使用优化的查询
export const getTopPostsByScore = unstable_cache(
    async (
        period: 'today' | 'week' | 'year' | 'all',
        limit: number = 10,
    ): Promise<LeaderboardPost[]> => {        const dateFrom = getDateRange(period);
        const posts = await getAllPostsWithStats(dateFrom || undefined);

        // 计算综合得分并排序
        const postsWithScore = posts.map((post) => ({
            ...post,
            score: post._count.likes + post._count.belongReplies,
        }));

        return postsWithScore.sort((a, b) => b.score - a.score).slice(0, limit);
    },
    [`posts-leaderboard`],
    {
        revalidate: CACHE_DURATION,
        tags: ['posts-leaderboard'],
    },
);

// 带缓存的用户排行榜函数 - 使用优化的查询
export const getTopUsersByPosts = unstable_cache(
    async (limit: number = 10): Promise<LeaderboardUser[]> => {
        const users = await getAllUsersWithStats();
        return users.sort((a, b) => b._count.post - a._count.post).slice(0, limit);
    },
    [`users-posts-leaderboard`],
    {
        revalidate: CACHE_DURATION,
        tags: ['users-leaderboard'],
    },
);

export const getTopUsersByReplies = unstable_cache(
    async (limit: number = 10): Promise<LeaderboardUser[]> => {
        const users = await getAllUsersWithStats();
        return users.sort((a, b) => b._count.reply - a._count.reply).slice(0, limit);
    },
    [`users-replies-leaderboard`],
    {
        revalidate: CACHE_DURATION,
        tags: ['users-leaderboard'],
    },
);

// 获取排行榜统计数据用于图表展示 - 优化版本，减少重复查询
export const getLeaderboardStats = unstable_cache(
    async () => {
        // 一次性获取所有帖子数据，然后在内存中按不同时间段过滤和排序
        const allPosts = await getAllPostsWithStats();
        
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        
        const yearStart = new Date(now);
        yearStart.setFullYear(now.getFullYear() - 1);        // 在内存中过滤和排序，避免多次数据库查询
        // 这种方法对于中等规模的数据集(< 10万条)更高效
        // 因为避免了4次独立的数据库查询和网络往返
        const getTopByPeriod = (posts: LeaderboardPost[], dateFrom?: Date) => {
            const filtered = dateFrom 
                ? posts.filter(post => post.createdAt >= dateFrom)
                : posts;
            
            return filtered
                .map(post => ({
                    ...post,
                    score: post._count.likes + post._count.belongReplies,
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
        };

        return {
            today: getTopByPeriod(allPosts, today),
            week: getTopByPeriod(allPosts, weekStart),
            year: getTopByPeriod(allPosts, yearStart),
            all: getTopByPeriod(allPosts),
        };
    },
    [`leaderboard-stats`],
    {
        revalidate: CACHE_DURATION,
        tags: ['leaderboard-stats'],
    },
);

export async function getGlobalStats(): Promise<GlobalStats> {
    const [userCount, translationCount] = await Promise.all([
        await prisma.user.count(),
        await prisma.task.count(),
    ]);

    return {
        userCount,
        translationCount,
    };
}

export async function getTopPostsByLikes(limit: number = 10): Promise<LeaderboardPost[]> {
    const posts = await getAllPostsWithStats();
    return posts
        .sort((a, b) => b._count.likes - a._count.likes)
        .slice(0, limit);
}

export async function getTopPostsByReplies(limit: number = 10): Promise<LeaderboardPost[]> {
    const posts = await getAllPostsWithStats();
    return posts
        .sort((a, b) => b._count.belongReplies - a._count.belongReplies)
        .slice(0, limit);
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
