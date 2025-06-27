import prisma from '@/app/api/_utils/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CalendarDays,
    MapPin,
    Users,
    Clock,
    ChevronLeft,
    ChevronRight,
    FileText,
    MessageSquare,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { TimelineCard } from '@/components/timeline-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { cache } from 'react';
import lang from '@/lib/lang';
import EmojiBackground from '@/components/emoji-background';

import '@/app/globals.css';

export const revalidate = 31536000;

type Props = {
    params: Promise<{ locale: string; uid: string; page: string }>;
};

type TimelineItem = {
    id: string;
    type: 'post' | 'reply' | 'like';
    createdAt: Date;
    originLang?: string;
    title: string; // 添加 title 字段
    content: {
        id?: string;
        title?: string;
        origin?: string;
        createdAt?: Date;
        originLang?: string;
        _count?: {
            Reply?: number;
            likes?: number;
        };
        post?: {
            id: string;
            title: string;
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
        reply?: {
            id: string;
            content: string;
            originLang?: string;
            // 多语言内容字段
            contentENUS?: string;
            contentZHCN?: string;
            contentZHTW?: string;
            contentESES?: string;
            contentFRFR?: string;
            contentRURU?: string;
            contentJAJP?: string;
            contentKOKR?: string;
            contentDEDE?: string;
            contentPTBR?: string;
        };
        // 多语言内容字段（用于reply类型）
        contentENUS?: string;
        contentZHCN?: string;
        contentZHTW?: string;
        contentESES?: string;
        contentFRFR?: string;
        contentRURU?: string;
        contentJAJP?: string;
        contentKOKR?: string;
        contentDEDE?: string;
        contentPTBR?: string;
    };
    // 多语言标题字段（用于post类型）
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

// 轻量级用户查询，仅用于 metadata
const getUserForMetadata = cache(async (uid: number) => {
    return prisma.user.findUnique({
        where: { uid },
        select: { username: true, nickname: true },
    });
});

// 主要的用户页面数据查询函数 - 将所有查询合并为一次并行查询
const getUserPageData = cache(async (uid: number, skip: number, take: number) => {
    return Promise.all([
        // 用户完整信息
        prisma.user.findUnique({
            where: { uid },
            select: {
                uid: true,
                username: true,
                nickname: true,
                bio: true,
                birth: true,
                country: true,
                role: true,
                createdAt: true,
                lastUseAt: true,
                profileEmoji: true,
                gender: true,
                exp: true,
                avatar: {
                    select: {
                        emoji: true,
                        background: true,
                    },
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
        }),
        // 用户的帖子
        prisma.post.findMany({
            where: { userUid: uid, published: true },
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
            orderBy: { id: 'desc' },
            skip,
            take,
        }),
        // 用户的回复
        prisma.reply.findMany({
            where: { userUid: uid },
            select: {
                id: true,
                content: true,
                createdAt: true,
                originLang: true,
                contentENUS: true,
                contentZHCN: true,
                contentZHTW: true,
                contentESES: true,
                contentFRFR: true,
                contentRURU: true,
                contentJAJP: true,
                contentKOKR: true,
                contentDEDE: true,
                contentPTBR: true,
                belongPost: {
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
                        titleKOKR: true,
                        titleDEDE: true,
                        titlePTBR: true,
                        originLang: true,
                    },
                },
                _count: { select: { likes: true } },
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take,
        }),
        // 用户的点赞
        prisma.like.findMany({
            where: { userUid: uid },
            select: {
                uuid: true,
                createdAt: true,
                post: {
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
                        titleKOKR: true,
                        titleDEDE: true,
                        titlePTBR: true,
                        originLang: true,
                    },
                },
                reply: {
                    select: {
                        id: true,
                        content: true,
                        contentENUS: true,
                        contentZHCN: true,
                        contentZHTW: true,
                        contentESES: true,
                        contentFRFR: true,
                        contentRURU: true,
                        contentJAJP: true,
                        contentKOKR: true,
                        contentDEDE: true,
                        contentPTBR: true,
                        originLang: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        }),
        // 计算用户获得的总点赞数 (来自帖子和回复的点赞)
        prisma.like.count({
            where: {
                OR: [
                    {
                        post: {
                            userUid: uid
                        }
                    },
                    {
                        reply: {
                            userUid: uid
                        }
                    }
                ]
            }
        }),
    ]);
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; uid: string }>;
}): Promise<Metadata> {
    const { locale, uid } = await params;

    // 使用轻量级查询获取用户信息用于生成标题
    const user = await getUserForMetadata(parseInt(uid));

    if (!user) {
        return {
            title: '用户不存在 | XEO',
            description: '该用户不存在或已被删除。',
        };
    }

    const title = lang(
        {
            'zh-CN': `${user.nickname}的主页 | XEO`,
            'en-US': `${user.nickname}'s Profile | XEO`,
            'ja-JP': `${user.nickname}のプロフィール | XEO`,
            'ko-KR': `${user.nickname}의 프로필 | XEO`,
            'fr-FR': `Profil de ${user.nickname} | XEO`,
            'es-ES': `Perfil de ${user.nickname} | XEO`,
            'de-DE': `${user.nickname}s Profil | XEO`,
            'pt-BR': `Perfil de ${user.nickname} | XEO`,
            'ru-RU': `Профиль ${user.nickname} | XEO`,
            'zh-TW': `${user.nickname}的主頁 | XEO`,
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': `查看${user.nickname}在XEO OS的个人资料、帖子和活动。`,
            'en-US': `View ${user.nickname}'s profile, posts and activities on XEO OS.`,
            'ja-JP': `XEOフォーラムでの${user.nickname}のプロフィール、投稿、アクティビティを表示。`,
            'ko-KR': `XEO 포럼에서 ${user.nickname}의 프로필, 게시물 및 활동을 확인하세요.`,
            'fr-FR': `Voir le profil, les publications et les activités de ${user.nickname} sur le XEO OS.`,
            'es-ES': `Ver el perfil, publicaciones y actividades de ${user.nickname} en el foro XEO.`,
            'de-DE': `Sehen Sie sich ${user.nickname}s Profil, Beiträge und Aktivitäten im XEO-OS an.`,
            'pt-BR': `Veja o perfil, postagens e atividades de ${user.nickname} no fórum XEO.`,
            'ru-RU': `Просмотрите профиль, посты и активность ${user.nickname} на форуме XEO.`,
            'zh-TW': `查看${user.nickname}在XEO論壇的個人資料、帖子和活動。`,
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default async function UserPage({ params }: Props) {
    const { page: pageParam, locale, uid } = await params;
    const page = Number(pageParam) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // 使用合并的查询函数获取所有数据
    const [user, posts, replies, likes, totalLikesReceived] = await getUserPageData(
        parseInt(uid),
        skip,
        ITEMS_PER_PAGE
    );

    if (!user) {
        notFound();
    }

    // 获取用户的第一个头像或使用默认值
    const userAvatar = user.avatar[0] || { emoji: '', background: '' };

    // 合并并排序时间线项目
    const timelineItems: TimelineItem[] = [
        ...posts.map((post) => ({
            id: `post-${post.id}`,
            type: 'post' as const,
            createdAt: post.createdAt,
            originLang: post.originLang || undefined,
            title: post.title, // 添加 title 字段
            content: {
                ...post,
                id: post.id.toString(),
                originLang: post.originLang || undefined,
            },
            // 添加多语言标题字段
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
        })),
        ...replies.map((reply) => ({
            id: `reply-${reply.id}`,
            type: 'reply' as const,
            createdAt: reply.createdAt,
            originLang: reply.originLang || undefined,
            title: reply.belongPost?.title || '', // 使用帖子标题作为 title
            content: {
                ...reply,
                originLang: reply.originLang || undefined,
                post: reply.belongPost
                    ? {
                          ...reply.belongPost, // 包含所有字段
                          id: reply.belongPost.id.toString(), // 确保 id 是字符串类型
                          originLang: reply.belongPost.originLang || undefined,
                          titleENUS: reply.belongPost.titleENUS || undefined,
                          titleZHCN: reply.belongPost.titleZHCN || undefined,
                          titleZHTW: reply.belongPost.titleZHTW || undefined,
                          titleESES: reply.belongPost.titleESES || undefined,
                          titleFRFR: reply.belongPost.titleFRFR || undefined,
                          titleRURU: reply.belongPost.titleRURU || undefined,
                          titleJAJP: reply.belongPost.titleJAJP || undefined,
                          titleKOKR: reply.belongPost.titleKOKR || undefined,
                          titleDEDE: reply.belongPost.titleDEDE || undefined,
                          titlePTBR: reply.belongPost.titlePTBR || undefined,
                      }
                    : undefined,
                // 添加多语言内容字段
                contentENUS: reply.contentENUS || undefined,
                contentZHCN: reply.contentZHCN || undefined,
                contentZHTW: reply.contentZHTW || undefined,
                contentESES: reply.contentESES || undefined,
                contentFRFR: reply.contentFRFR || undefined,
                contentRURU: reply.contentRURU || undefined,
                contentJAJP: reply.contentJAJP || undefined,
                contentKOKR: reply.contentKOKR || undefined,
                contentDEDE: reply.contentDEDE || undefined,
                contentPTBR: reply.contentPTBR || undefined,
            },
            // 为回复添加多语言标题字段（来自帖子）
            titleENUS: reply.belongPost?.titleENUS || undefined,
            titleZHCN: reply.belongPost?.titleZHCN || undefined,
            titleZHTW: reply.belongPost?.titleZHTW || undefined,
            titleESES: reply.belongPost?.titleESES || undefined,
            titleFRFR: reply.belongPost?.titleFRFR || undefined,
            titleRURU: reply.belongPost?.titleRURU || undefined,
            titleJAJP: reply.belongPost?.titleJAJP || undefined,
            titleKOKR: reply.belongPost?.titleKOKR || undefined,
            titleDEDE: reply.belongPost?.titleDEDE || undefined,
            titlePTBR: reply.belongPost?.titlePTBR || undefined,
        })),
        ...likes.map((like) => ({
            id: `like-${like.uuid}`,
            type: 'like' as const,
            createdAt: like.createdAt,
            title: like.post?.title || like.reply?.content || '', // 使用帖子标题或回复内容作为 title
            content: {
                post: like.post
                    ? {
                          ...like.post, // 包含所有字段
                          id: like.post.id.toString(), // 确保 id 是字符串类型
                          originLang: like.post.originLang || undefined,
                          titleENUS: like.post.titleENUS || undefined,
                          titleZHCN: like.post.titleZHCN || undefined,
                          titleZHTW: like.post.titleZHTW || undefined,
                          titleESES: like.post.titleESES || undefined,
                          titleFRFR: like.post.titleFRFR || undefined,
                          titleRURU: like.post.titleRURU || undefined,
                          titleJAJP: like.post.titleJAJP || undefined,
                          titleKOKR: like.post.titleKOKR || undefined,
                          titleDEDE: like.post.titleDEDE || undefined,
                          titlePTBR: like.post.titlePTBR || undefined,
                      }
                    : undefined,
                reply: like.reply
                    ? {
                          ...like.reply, // 包含所有字段
                          originLang: like.reply.originLang || undefined,
                          contentENUS: like.reply.contentENUS || undefined,
                          contentZHCN: like.reply.contentZHCN || undefined,
                          contentZHTW: like.reply.contentZHTW || undefined,
                          contentESES: like.reply.contentESES || undefined,
                          contentFRFR: like.reply.contentFRFR || undefined,
                          contentRURU: like.reply.contentRURU || undefined,
                          contentJAJP: like.reply.contentJAJP || undefined,
                          contentKOKR: like.reply.contentKOKR || undefined,
                          contentDEDE: like.reply.contentDEDE || undefined,
                          contentPTBR: like.reply.contentPTBR || undefined,
                      }
                    : undefined,
            },
            // 为点赞添加多语言标题字段（来自帖子）
            titleENUS: like.post?.titleENUS || undefined,
            titleZHCN: like.post?.titleZHCN || undefined,
            titleZHTW: like.post?.titleZHTW || undefined,
            titleESES: like.post?.titleESES || undefined,
            titleFRFR: like.post?.titleFRFR || undefined,
            titleRURU: like.post?.titleRURU || undefined,
            titleJAJP: like.post?.titleJAJP || undefined,
            titleKOKR: like.post?.titleKOKR || undefined,
            titleDEDE: like.post?.titleDEDE || undefined,
            titlePTBR: like.post?.titlePTBR || undefined,
        })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalItems =
        (user._count.post || 0) +
        (user._count.reply || 0) +
        (user._count.likes || 0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // 多语言文本
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
        replies: lang(
            {
                'zh-CN': '回复',
                'en-US': 'Replies',
                'ja-JP': '返信',
                'ko-KR': '답글',
                'fr-FR': 'Réponses',
                'es-ES': 'Respuestas',
                'de-DE': 'Antworten',
                'pt-BR': 'Respostas',
                'ru-RU': 'Ответы',
                'zh-TW': '回復',
            },
            locale,
        ),
        likes: lang(
            {
                'zh-CN': '获赞',
                'en-US': 'Likes',
                'ja-JP': 'いいね',
                'ko-KR': '좋아요',
                'fr-FR': 'J\'aime',
                'es-ES': 'Me gusta',
                'de-DE': 'Gefällt mir',
                'pt-BR': 'Curtidas',
                'ru-RU': 'Лайки',
                'zh-TW': '獲讚',
            },
            locale,
        ),
        following: lang(
            {
                'zh-CN': '关注',
                'en-US': 'Following',
                'ja-JP': 'フォロー中',
                'ko-KR': '팔로잉',
                'fr-FR': 'Suivi',
                'es-ES': 'Siguiendo',
                'de-DE': 'Folgt',
                'pt-BR': 'Seguindo',
                'ru-RU': 'Подписки',
                'zh-TW': '關注',
            },
            locale,
        ),
        followers: lang(
            {
                'zh-CN': '粉丝',
                'en-US': 'Followers',
                'ja-JP': 'フォロワー',
                'ko-KR': '팔로워',
                'fr-FR': 'Abonnés',
                'es-ES': 'Seguidores',
                'de-DE': 'Follower',
                'pt-BR': 'Seguidores',
                'ru-RU': 'Подписчики',
                'zh-TW': '粉絲',
            },
            locale,
        ),
        joinedAt: lang(
            {
                'zh-CN': '加入于',
                'en-US': 'Joined',
                'ja-JP': '参加日',
                'ko-KR': '가입일',
                'fr-FR': 'Inscrit le',
                'es-ES': 'Se unió el',
                'de-DE': 'Beigetreten am',
                'pt-BR': 'Ingressou em',
                'ru-RU': 'Присоединился',
                'zh-TW': '加入於',
            },
            locale,
        ),
        lastActive: lang(
            {
                'zh-CN': '最后活跃',
                'en-US': 'Last active',
                'ja-JP': '最終アクティブ',
                'ko-KR': '마지막 활동',
                'fr-FR': 'Dernière activité',
                'es-ES': 'Última actividad',
                'de-DE': 'Zuletzt aktiv',
                'pt-BR': 'Última atividade',
                'ru-RU': 'Последняя активность',
                'zh-TW': '最後活躍',
            },
            locale,
        ),
        timeline: lang(
            {
                'zh-CN': '活动时间线',
                'en-US': 'Activity Timeline',
                'ja-JP': 'アクティビティタイムライン',
                'ko-KR': '활동 타임라인',
                'fr-FR': "Chronologie d'activité",
                'es-ES': 'Línea de tiempo de actividad',
                'de-DE': 'Aktivitätszeitlinie',
                'pt-BR': 'Linha do tempo de atividades',
                'ru-RU': 'Лента активности',
                'zh-TW': '活動時間線',
            },
            locale,
        ),
        allActivities: lang(
            {
                'zh-CN': '全部活动',
                'en-US': 'All Activities',
                'ja-JP': '全てのアクティビティ',
                'ko-KR': '모든 활동',
                'fr-FR': 'Toutes les activités',
                'es-ES': 'Todas las actividades',
                'de-DE': 'Alle Aktivitäten',
                'pt-BR': 'Todas as atividades',
                'ru-RU': 'Вся активность',
                'zh-TW': '全部活動',
            },
            locale,
        ),
        postsOnly: lang(
            {
                'zh-CN': '仅帖子',
                'en-US': 'Posts Only',
                'ja-JP': '投稿のみ',
                'ko-KR': '게시물만',
                'fr-FR': 'Publications uniquement',
                'es-ES': 'Solo publicaciones',
                'de-DE': 'Nur Beiträge',
                'pt-BR': 'Apenas postagens',
                'ru-RU': 'Только посты',
                'zh-TW': '僅帖子',
            },
            locale,
        ),
        repliesOnly: lang(
            {
                'zh-CN': '仅回复',
                'en-US': 'Replies Only',
                'ja-JP': '返信のみ',
                'ko-KR': '답글만',
                'fr-FR': 'Réponses uniquement',
                'es-ES': 'Solo respuestas',
                'de-DE': 'Nur Antworten',
                'pt-BR': 'Apenas respostas',
                'ru-RU': 'Только ответы',
                'zh-TW': '僅回復',
            },
            locale,
        ),
        noActivity: lang(
            {
                'zh-CN': '暂无活动记录',
                'en-US': 'No activity records',
                'ja-JP': 'アクティビティ記録がありません',
                'ko-KR': '활동 기록이 없습니다',
                'fr-FR': "Aucun enregistrement d'activité",
                'es-ES': 'Sin registros de actividad',
                'de-DE': 'Keine Aktivitätsaufzeichnungen',
                'pt-BR': 'Nenhum registro de atividade',
                'ru-RU': 'Нет записей активности',
                'zh-TW': '暫無活動記錄',
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

    return (
        <main className='container mx-auto px-4 py-8 max-w-4xl'>
            {/* 用户信息卡片 */}
            <Card className='mb-8 relative overflow-hidden'>
                <EmojiBackground primaryColor='#f0b100' userEmojis={user.profileEmoji} />
                <CardHeader className='relative z-10'>
                    <div className='flex items-center space-x-4'>
                        <Avatar className='h-20 w-20 border-2 border-white/20'>
                            <AvatarImage
                                src={`/api/dynamicImage/emoji?emoji=${encodeURIComponent(
                                    userAvatar.emoji || '',
                                )}&background=${encodeURIComponent(
                                    userAvatar.background?.replaceAll('%', '%25') || '',
                                )}`}
                            />
                            <AvatarFallback className='text-2xl bg-white/20 text-white'>
                                {user.profileEmoji
                                    ? user.profileEmoji.split(' ')[0] ||
                                      user.username.charAt(0).toUpperCase()
                                    : user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                            <CardTitle className='text-2xl mb-2 text-white drop-shadow-lg'>
                                {user.nickname}
                            </CardTitle>
                            <p className='text-white/90 mb-2 drop-shadow-sm'>@{user.username}</p>
                            <Badge
                                variant={
                                    user.role === 'ADMIN'
                                        ? 'destructive'
                                        : user.role === 'MODERATOR'
                                          ? 'secondary'
                                          : 'default'
                                }
                                className='bg-white/20 text-white border-white/30'>
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='relative z-10'>
                    {user.bio && (
                        <p className='text-base mb-4 text-white drop-shadow-sm'>{user.bio}</p>
                    )}

                    <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-4'>
                        <div className='text-center text-white'>
                            <div className='text-2xl font-bold drop-shadow-lg'>
                                {user._count.post}
                            </div>
                            <div className='text-sm text-white/80 drop-shadow-sm'>
                                {texts.posts}
                            </div>
                        </div>
                        <div className='text-center text-white'>
                            <div className='text-2xl font-bold drop-shadow-lg'>
                                {user._count.reply}
                            </div>
                            <div className='text-sm text-white/80 drop-shadow-sm'>
                                {texts.replies}
                            </div>
                        </div>
                        <div className='text-center text-white'>
                            <div className='text-2xl font-bold drop-shadow-lg'>
                                {totalLikesReceived}
                            </div>
                            <div className='text-sm text-white/80 drop-shadow-sm'>
                                {texts.likes}
                            </div>
                        </div>
                        <div className='text-center text-white'>
                            <div className='text-2xl font-bold drop-shadow-lg'>
                                {user._count.following}
                            </div>
                            <div className='text-sm text-white/80 drop-shadow-sm'>
                                {texts.following}
                            </div>
                        </div>
                        <div className='text-center text-white'>
                            <div className='text-2xl font-bold drop-shadow-lg'>
                                {user._count.followed}
                            </div>
                            <div className='text-sm text-white/80 drop-shadow-sm'>
                                {texts.followers}
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-wrap gap-4 text-sm text-white/90'>
                        {user.country && (
                            <div className='flex items-center gap-1 drop-shadow-sm'>
                                <MapPin className='h-4 w-4' />
                                {user.country}
                            </div>
                        )}
                        {user.birth && (
                            <div className='flex items-center gap-1 drop-shadow-sm'>
                                <CalendarDays className='h-4 w-4' />
                                {user.birth}
                            </div>
                        )}
                        <div className='flex items-center gap-1 drop-shadow-sm'>
                            <Users className='h-4 w-4' />
                            {texts.joinedAt} {new Date(user.createdAt).toLocaleDateString(locale)}
                        </div>
                        {user.lastUseAt && (
                            <div className='flex items-center gap-1 drop-shadow-sm'>
                                <Clock className='h-4 w-4' />
                                {texts.lastActive}{' '}
                                {new Date(user.lastUseAt).toLocaleDateString(locale)}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 活动时间线 */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle>{texts.timeline}</CardTitle>
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' asChild>
                                <Link href={`/${locale}/user/${uid}/post/page/1`}>
                                    <FileText className='h-4 w-4 mr-1' />
                                    {texts.postsOnly} ({user._count.post})
                                </Link>
                            </Button>
                            <Button variant='outline' size='sm' asChild>
                                <Link href={`/${locale}/user/${uid}/reply/page/1`}>
                                    <MessageSquare className='h-4 w-4 mr-1' />
                                    {texts.repliesOnly} ({user._count.reply})
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {timelineItems.length === 0 ? (
                        <p className='text-muted-foreground text-center py-8'>{texts.noActivity}</p>
                    ) : (
                        <div className='space-y-4'>
                            {timelineItems.map((item) => (
                                <TimelineCard key={item.id} item={item} locale={locale} />
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
                                                ? `/${locale}/user/${uid}`
                                                : `/${locale}/user/${uid}/page/${page - 1}`
                                        }
                                        title={`${texts.previous} - ${lang(
                                            {
                                                'zh-CN': '第',
                                                'en-US': 'Page',
                                                'zh-TW': '第',
                                                'es-ES': 'Página',
                                                'fr-FR': 'Page',
                                                'ru-RU': 'Страница',
                                                'ja-JP': 'ページ',
                                                'de-DE': 'Seite',
                                                'pt-BR': 'Página',
                                                'ko-KR': '페이지',
                                            },
                                            locale,
                                        )} ${page - 1}`}
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
                                                href={
                                                    pageNum == 1
                                                        ? `/${locale}/user/${uid}`
                                                        : `/${locale}/user/${uid}/page/${pageNum}`
                                                }
                                                title={`${lang(
                                                    {
                                                        'zh-CN': '第',
                                                        'en-US': 'Page',
                                                        'zh-TW': '第',
                                                        'es-ES': 'Página',
                                                        'fr-FR': 'Page',
                                                        'ru-RU': 'Страница',
                                                        'ja-JP': 'ページ',
                                                        'de-DE': 'Seite',
                                                        'pt-BR': 'Página',
                                                        'ko-KR': '페이지',
                                                    },
                                                    locale,
                                                )} ${pageNum}`}
                                                rel={pageNum === page ? 'canonical' : 'noopener'}
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
                                        href={`/${locale}/user/${uid}/page/${page + 1}`}
                                        title={`${texts.next} - ${lang(
                                            {
                                                'zh-CN': '第',
                                                'en-US': 'Page',
                                                'zh-TW': '第',
                                                'es-ES': 'Página',
                                                'fr-FR': 'Page',
                                                'ru-RU': 'Страница',
                                                'ja-JP': 'ページ',
                                                'de-DE': 'Seite',
                                                'pt-BR': 'Página',
                                                'ko-KR': '페이지',
                                            },
                                            locale,
                                        )} ${page + 1}`}
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
