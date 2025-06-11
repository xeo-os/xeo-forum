import prisma from '@/app/api/_utils/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { TimelineCard } from '@/components/timeline-card';
import { PaginationControls } from '@/components/pagination-controls';
import { Metadata } from 'next';
import lang from '@/lib/lang';
import EmojiBackground from '@/components/EmojiBackground';

import '@/app/globals.css';

type Props = {
    params: { locale: string; uid: string };
    searchParams: { page?: string };
};

type User = {
    uid: number;
    username: string;
    nickname: string;
    bio: string | null;
    birth: string | null;
    country: string | null;
    role: string;
    createdAt: Date;
    lastUseAt: Date | null;
    profileEmoji: string | null;
    gender: string | null;
    exp: number;
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
};

type TimelineItem = {
    id: string;
    type: 'post' | 'reply' | 'like';
    createdAt: Date;
    content: {
        id?: string;
        title?: string;
        origin?: string;
        createdAt?: Date;
        _count?: {
            Reply?: number;
            likes?: number;
        };
        post?: {
            id: string;
            title: string;
        };
        reply?: {
            id: string;
            content: string;
        };
    };
};

const ITEMS_PER_PAGE = 10;

export async function generateMetadata({
    params,
}: {
    params: { locale: string; uid: string };
}): Promise<Metadata> {
    const locale = params.locale || 'en-US';

    // 获取用户信息用于生成标题
    const user = await prisma.user.findUnique({
        where: { uid: parseInt(params.uid) },
        select: { username: true, nickname: true },
    });

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
            'zh-CN': `查看${user.nickname}在XEO论坛的个人资料、帖子和活动。`,
            'en-US': `View ${user.nickname}'s profile, posts and activities on XEO forum.`,
            'ja-JP': `XEOフォーラムでの${user.nickname}のプロフィール、投稿、アクティビティを表示。`,
            'ko-KR': `XEO 포럼에서 ${user.nickname}의 프로필, 게시물 및 활동을 확인하세요.`,
            'fr-FR': `Voir le profil, les publications et les activités de ${user.nickname} sur le forum XEO.`,
            'es-ES': `Ver el perfil, publicaciones y actividades de ${user.nickname} en el foro XEO.`,
            'de-DE': `Sehen Sie sich ${user.nickname}s Profil, Beiträge und Aktivitäten im XEO-Forum an.`,
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

export default async function UserPage({ params, searchParams }: Props) {
    const page = Number(searchParams.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const locale = params.locale || 'en-US';

    // 获取用户信息
    const user: User | null = await prisma.user.findUnique({
        where: {
            uid: parseInt(params.uid),
        },
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
    });

    if (!user) {
        notFound();
    }

    // 获取用户的第一个头像或使用默认值
    const userAvatar = user.avatar[0] || { emoji: '', background: '' };

    // 获取用户活动时间线
    const [posts, replies, likes, totalCount] = await Promise.all([
        prisma.post.findMany({
            where: { userUid: user.uid },
            select: {
                id: true,
                title: true,
                origin: true,
                createdAt: true,
                _count: { select: { Reply: true, likes: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: ITEMS_PER_PAGE,
        }),
        prisma.reply.findMany({
            where: { userUid: user.uid },
            select: {
                id: true,
                content: true,
                createdAt: true,
                post: { select: { id: true, title: true } },
                _count: { select: { likes: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: ITEMS_PER_PAGE,
        }),
        prisma.like.findMany({
            where: { userUid: user.uid },
            select: {
                uuid: true,
                createdAt: true,
                post: { select: { id: true, title: true } },
                reply: { select: { id: true, content: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: ITEMS_PER_PAGE,
        }),
        prisma.user.findUnique({
            where: { uid: user.uid },
            select: {
                _count: {
                    select: {
                        post: true,
                        reply: true,
                        likes: true,
                    },
                },
            },
        }),
    ]);

    // 合并并排序时间线项目
    const timelineItems: TimelineItem[] = [
        ...posts.map((post) => ({
            id: `post-${post.id}`,
            type: 'post' as const,
            createdAt: post.createdAt,
            content: {
                ...post,
                id: post.id.toString(),
            },
        })),
        ...replies.map((reply) => ({
            id: `reply-${reply.id}`,
            type: 'reply' as const,
            createdAt: reply.createdAt,
            content: {
                ...reply,
                post: reply.post
                    ? { id: reply.post.id.toString(), title: reply.post.title }
                    : undefined,
            },
        })),
        ...likes.map((like) => ({
            id: `like-${like.uuid}`,
            type: 'like' as const,
            createdAt: like.createdAt,
            content: {
                post: like.post
                    ? { id: like.post.id.toString(), title: like.post.title }
                    : undefined,
                reply: like.reply ? { id: like.reply.id, content: like.reply.content } : undefined,
            },
        })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalItems =
        (totalCount?._count.post || 0) +
        (totalCount?._count.reply || 0) +
        (totalCount?._count.likes || 0);
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
                                className='bg-white/20 text-white border-white/30'
                            >
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='relative z-10'>
                    {user.bio && (
                        <p className='text-base mb-4 text-white drop-shadow-sm'>{user.bio}</p>
                    )}

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
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
                    <CardTitle>{texts.timeline}</CardTitle>
                </CardHeader>
                <CardContent>
                    {timelineItems.length === 0 ? (
                        <p className='text-muted-foreground text-center py-8'>{texts.noActivity}</p>
                    ) : (
                        <div className='space-y-4'>
                            {timelineItems.map((item) => (
                                <TimelineCard key={item.id} item={item} locale={params.locale} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className='mt-8'>
                            <PaginationControls
                                currentPage={page}
                                totalPages={totalPages}
                                basePath={`/${params.locale}/user/${params.uid}`}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
