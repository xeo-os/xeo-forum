import lang from '@/lib/lang';
import prisma from '../../../../../api/_utils/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Separator } from "@/components/ui/separator";
import {
    Heart,
    MessageCircle,
    Pin,
    ChevronLeft,
    ChevronRight,
    Users,
    FileText,
    ThumbsUp,
    MessageSquare,
    TrendingUp,
    Calendar,
    AlertTriangle,
    Home,
    Search,
} from 'lucide-react';

import '@/app/globals.css';
import type { Topic } from '@/generated/prisma';

type Props = {
    params: { locale: string; page?: number; topic: string };
    searchParams: { page?: string };
};

type Post = {
    id: number;
    title: string;
    origin: string;
    createdAt: Date;
    published: boolean;
    pin: boolean;
    originLang: string | null;
    titleDEDE: string | null;
    titleENUS: string | null;
    titleESES: string | null;
    titleFRFR: string | null;
    titleJAJP: string | null;
    titleKOKR: string | null;
    titlePTBR: string | null;
    titleRURU: string | null;
    titleZHCN: string | null;
    titleZHTW: string | null;
    User: {
        uid: number;
        nickname: string;
        username: string;
        profileEmoji: string | null;
        avatar: { id: string; emoji: string; background: string }[];
    } | null;
    _count: {
        likes: number;
        Reply: number;
    };
};

const POSTS_PER_PAGE = 50;

export async function generateStaticParams() {
    const pages = Array.from({ length: 1 }, (_, i) => ({
        page: (i + 1).toString(),
    }));
    return pages;
}
export const revalidate = 365 * 24 * 60 * 60;

function getLocalizedTitle(post: Post, locale: string): string {
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

export default async function Topic({ params }: Props) {
    const { locale, page: pageParam = 1, topic } = await params;
    const page = Number(pageParam); // 确保页码是数字类型
    const skip = (page - 1) * POSTS_PER_PAGE;

    const [posts, totalPosts, totalUsers, totalReplies, totalLikes, topicObject]: [
        Post[],
        number,
        number,
        number,
        number,
        Topic | null,
    ] = await Promise.all([
        prisma.post.findMany({
            where: {
                published: true,
                originLang: {
                    not: null,
                },
                topics: {
                    some: {
                        name: topic.replaceAll('-', '_'),
                    },
                },
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
                    take: 3,
                },
            },
            orderBy: [{ pin: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: POSTS_PER_PAGE,
        }),
        prisma.post.count({
            where: {
                published: true,
                originLang: {
                    not: null,
                },
            },
        }),
        prisma.user.count(),
        prisma.reply.count(),
        prisma.like.count(),
        prisma.topic.findUnique({
            where: {
                name: topic.replaceAll('-', '_'),
            },
        }),
    ]);

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    if (topicObject === null) {
        return (
            <div className='h-full flex items-center justify-center p-4 bg-background'>
                <Card className='w-full max-w-md mx-auto shadow-lg'>
                    <CardHeader className='text-center'>
                        <div className='mb-4 flex justify-center'>
                            <AlertTriangle className='h-16 w-16 text-destructive' />
                        </div>
                        <CardTitle className='text-xl font-bold text-destructive'>
                            {lang(
                                {
                                    'zh-CN': '主题不存在',
                                    'en-US': 'Topic Not Found',
                                    'zh-TW': '主題不存在',
                                    'es-ES': 'Tema no encontrado',
                                    'fr-FR': 'Sujet non trouvé',
                                    'ru-RU': 'Тема не найдена',
                                    'ja-JP': 'トピックが見つかりません',
                                    'de-DE': 'Thema nicht gefunden',
                                    'pt-BR': 'Tópico não encontrado',
                                    'ko-KR': '주제를 찾을 수 없습니다',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Alert variant='destructive'>
                            <AlertDescription>
                                {lang(
                                    {
                                        'zh-CN': `没有找到名为 "${topic}" 的主题。该主题可能已被删除或不存在，请检查主题名称是否正确。`,
                                        'en-US': `No topic found with the name "${topic}". The topic may have been deleted or doesn't exist. Please check if the topic name is correct.`,
                                        'zh-TW': `沒有找到名為 "${topic}" 的主題。該主題可能已被刪除或不存在，請檢查主題名稱是否正確。`,
                                        'es-ES': `No se encontró ningún tema con el nombre "${topic}". El tema puede haber sido eliminado o no existe. Verifique si el nombre del tema es correcto.`,
                                        'fr-FR': `Aucun sujet trouvé avec le nom "${topic}". Le sujet peut avoir été supprimé ou n'existe pas. Veuillez vérifier si le nom du sujet est correct.`,
                                        'ru-RU': `Тема с именем "${topic}" не найдена. Тема могла быть удалена или не существует. Проверьте правильность названия темы.`,
                                        'ja-JP': `"${topic}" という名前のトピックが見つかりませんでした。トピックが削除されたか存在しない可能性があります。トピック名が正しいか確認してください。`,
                                        'de-DE': `Kein Thema mit dem Namen "${topic}" gefunden. Das Thema wurde möglicherweise gelöscht oder existiert nicht. Bitte überprüfen Sie, ob der Themenname korrekt ist.`,
                                        'pt-BR': `Nenhum tópico encontrado com o nome "${topic}". O tópico pode ter sido excluído ou não existe. Verifique se o nome do tópico está correto.`,
                                        'ko-KR': `"${topic}"라는 이름의 주제를 찾을 수 없습니다. 주제가 삭제되었거나 존재하지 않을 수 있습니다. 주제 이름이 올바른지 확인해 주세요.`,
                                    },
                                    locale,
                                )}
                            </AlertDescription>
                        </Alert>

                        <div className='flex flex-col gap-3'>
                            <Button asChild variant='default' className='w-full'>
                                <Link href={`/${locale}`}>
                                    <Home className='mr-2 h-4 w-4' />
                                    {lang(
                                        {
                                            'zh-CN': '返回首页',
                                            'zh-TW': '返回首頁',
                                            'en-US': 'Go Home',
                                            'es-ES': 'Ir al inicio',
                                            'fr-FR': "Aller à l'accueil",
                                            'ru-RU': 'На главную',
                                            'ja-JP': 'ホームに戻る',
                                            'de-DE': 'Zur Startseite',
                                            'pt-BR': 'Ir para o início',
                                            'ko-KR': '홈으로 가기',
                                        },
                                        locale,
                                    )}
                                </Link>
                            </Button>

                            <Button asChild variant='outline' className='w-full'>
                                <Link href={`/${locale}/topics`}>
                                    <Search className='mr-2 h-4 w-4' />
                                    {lang(
                                        {
                                            'zh-CN': '浏览所有主题',
                                            'zh-TW': '瀏覽所有主題',
                                            'en-US': 'Browse All Topics',
                                            'es-ES': 'Explorar todos los temas',
                                            'fr-FR': 'Parcourir tous les sujets',
                                            'ru-RU': 'Просмотреть все темы',
                                            'ja-JP': 'すべてのトピックを見る',
                                            'de-DE': 'Alle Themen durchsuchen',
                                            'pt-BR': 'Explorar todos os tópicos',
                                            'ko-KR': '모든 주제 찾아보기',
                                        },
                                        locale,
                                    )}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 统计当前页面数据
    const currentPageStats = {
        // 发帖最多的用户
        topPosters: posts.reduce(
            (acc, post) => {
                if (post.User) {
                    const key = post.User.uid;
                    acc[key] = {
                        user: post.User,
                        count: (acc[key]?.count || 0) + 1,
                    };
                }
                return acc;
            },
            {} as Record<number, { user: Post['User']; count: number }>,
        ),

        // 最多帖子的主题
        topTopics: posts
            .flatMap(() => topicObject)
            .reduce(
                (acc, topic) => {
                    const key = topic.name;
                    acc[key] = {
                        topic,
                        count: (acc[key]?.count || 0) + 1,
                    };
                    return acc;
                },
                {} as Record<string, { topic: Topic; count: number }>,
            ),

        // 点赞最多的帖子
        topLikedPosts: posts.sort((a, b) => b._count.likes - a._count.likes).slice(0, 3),

        // 回复最多的帖子
        topRepliedPosts: posts.sort((a, b) => b._count.Reply - a._count.Reply).slice(0, 3),

        // 时间分布（柱状图数据）
        timeDistribution: (() => {
            if (posts.length === 0) return [];

            const times = posts.map((post) => new Date(post.createdAt).getTime());
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            // const now = Date.now();

            // 如果所有帖子时间相同，返回单个桶
            if (minTime === maxTime) {
                return [
                    {
                        startTime: minTime,
                        endTime: maxTime,
                        count: posts.length,
                    },
                ];
            }

            const timeRange = maxTime - minTime;
            const bucketSize = timeRange / 10;
            const buckets = Array(10).fill(0);

            posts.forEach((post) => {
                const time = new Date(post.createdAt).getTime();
                const bucketIndex = Math.min(9, Math.floor((time - minTime) / bucketSize));
                buckets[bucketIndex]++;
            });

            return buckets.map((count, index) => ({
                startTime: minTime + index * bucketSize,
                endTime: minTime + (index + 1) * bucketSize,
                count,
            }));
        })(),
    };

    // 格式化相对时间
    const formatRelativeTime = (timestamp: number, locale: string) => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        // const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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

    // 格式化帖子时间
    const formatPostTime = (createdAt: Date, locale: string) => {
        const timestamp = createdAt.getTime();
        const now = Date.now();
        const diffHours = (now - timestamp) / (1000 * 60 * 60);

        // 如果在24小时内，显示相对时间
        if (diffHours < 24) {
            return formatRelativeTime(timestamp, locale);
        }

        // 超过24小时，显示日期
        return new Date(createdAt).toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
            year:
                new Date(createdAt).getFullYear() !== new Date().getFullYear()
                    ? 'numeric'
                    : undefined,
        });
    };

    const topPostersArray = Object.values(currentPageStats.topPosters)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const labels = {
        title: lang(
            {
                'zh-CN': 'XEO OS - 交流每个人的观点',
                'en-US': "XEO OS - Xchange Everyone's Opinions",
                'zh-TW': 'XEO OS - 交流每個人的觀點',
                'es-ES': 'XEO OS - Intercambia las opiniones de todos',
                'fr-FR': 'XEO OS - Échangez les opinions de chacun',
                'ru-RU': 'XEO OS - Обменивайтесь мнениями всех',
                'ja-JP': 'XEO OS - みんなの意見を交換',
                'de-DE': 'XEO OS - Teile die Meinungen aller',
                'pt-BR': 'XEO OS - Troque as opiniões de todos',
                'ko-KR': 'XEO OS - 모두의 의견을 교환하세요',
            },
            locale,
        ),
        latestPosts: lang(
            {
                'zh-CN': `主题: ${getLocalizedTopicName(topicObject, locale)}`,
                'en-US': `Topic: ${getLocalizedTopicName(topicObject, locale)}`,
                'zh-TW': `主題: ${getLocalizedTopicName(topicObject, locale)}`,
                'es-ES': `Tema: ${getLocalizedTopicName(topicObject, locale)}`,
                'fr-FR': `Sujet: ${getLocalizedTopicName(topicObject, locale)}`,
                'ru-RU': `Тема: ${getLocalizedTopicName(topicObject, locale)}`,
                'ja-JP': `トピック: ${getLocalizedTopicName(topicObject, locale)}`,
                'de-DE': `Thema: ${getLocalizedTopicName(topicObject, locale)}`,
                'pt-BR': `Tópico: ${getLocalizedTopicName(topicObject, locale)}`,
                'ko-KR': `주제: ${getLocalizedTopicName(topicObject, locale)}`,
            },
            locale,
        ),
        replies: lang(
            {
                'zh-CN': '回复',
                'en-US': 'replies',
                'zh-TW': '回覆',
                'es-ES': 'respuestas',
                'fr-FR': 'réponses',
                'ru-RU': 'ответы',
                'ja-JP': '返信',
                'de-DE': 'Antworten',
                'pt-BR': 'respostas',
                'ko-KR': '답글',
            },
            locale,
        ),
        likes: lang(
            {
                'zh-CN': '点赞',
                'en-US': 'likes',
                'zh-TW': '按讚',
                'es-ES': 'me gusta',
                'fr-FR': "j'aime",
                'ru-RU': 'лайки',
                'ja-JP': 'いいね',
                'de-DE': 'Gefällt mir',
                'pt-BR': 'curtidas',
                'ko-KR': '좋아요',
            },
            locale,
        ),
        previous: lang(
            {
                'zh-CN': '上一页',
                'en-US': 'Previous',
                'zh-TW': '上一頁',
                'es-ES': 'Anterior',
                'fr-FR': 'Précédent',
                'ru-RU': 'Предыдущая',
                'ja-JP': '前へ',
                'de-DE': 'Vorherige',
                'pt-BR': 'Anterior',
                'ko-KR': '이전',
            },
            locale,
        ),
        next: lang(
            {
                'zh-CN': '下一页',
                'en-US': 'Next',
                'zh-TW': '下一頁',
                'es-ES': 'Siguiente',
                'fr-FR': 'Suivant',
                'ru-RU': 'Следующая',
                'ja-JP': '次へ',
                'de-DE': 'Nächste',
                'pt-BR': 'Próximo',
                'ko-KR': '다음',
            },
            locale,
        ),
    };

    return (
        <div className='mx-auto px-4 py-6 max-w-7xl'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold mb-1'>{labels.latestPosts}</h1>
                <p className='text-sm text-muted-foreground'>
                    {lang(
                        {
                            'zh-CN': `第 ${page} 页，共 ${totalPages} 页`,
                            'en-US': `Page ${page} of ${totalPages}`,
                            'zh-TW': `第 ${page} 頁，共 ${totalPages} 頁`,
                            'es-ES': `Página ${page} de ${totalPages}`,
                            'fr-FR': `Page ${page} sur ${totalPages}`,
                            'ru-RU': `Страница ${page} из ${totalPages}`,
                            'ja-JP': `${totalPages}ページ中${page}ページ`,
                            'de-DE': `Seite ${page} von ${totalPages}`,
                            'pt-BR': `Página ${page} de ${totalPages}`,
                            'ko-KR': `${totalPages}페이지 중 ${page}페이지`,
                        },
                        locale,
                    )}
                </p>
            </div>

            <div className='flex gap-6'>
                {/* 主要内容区域 - 使用 Page 组件包裹，参与动画 */}
                <div className='flex-1'>
                    <Card>
                        <CardContent className='p-2 sm:p-5'>
                            <div className='divide-y'>
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className='p-2 sm:p-3 hover:bg-muted/50 transition-colors'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Link
                                                href={`/${locale}/user/${post.User?.uid}`}
                                                className='flex-shrink-0 hover:opacity-80 transition-opacity'
                                                title={post.User?.nickname || 'Anonymous'}
                                                rel='noopener'
                                            >
                                                <Avatar className='h-7 w-7 flex-shrink-0'>
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
                                                        alt={
                                                            post.User?.nickname ||
                                                            post.User?.username ||
                                                            'User Avatar'
                                                        }
                                                    />
                                                    <AvatarFallback
                                                        style={{
                                                            backgroundColor:
                                                                post.User?.avatar[0]?.background ||
                                                                '#e5e7eb',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        {post.User?.avatar[0]?.emoji ||
                                                            post.User?.profileEmoji ||
                                                            post.User?.nickname?.charAt(0) ||
                                                            'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Link>

                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-2'>
                                                    <Link
                                                        href={`/${locale}/post/${post.id}`}
                                                        className='font-medium hover:text-primary transition-colors truncate text-sm'
                                                        title={getLocalizedTitle(post, locale)}
                                                        rel='noopener'
                                                    >
                                                        {getLocalizedTitle(post, locale)}
                                                    </Link>
                                                    {post.pin && (
                                                        <Pin className='h-3 w-3 text-primary flex-shrink-0' />
                                                    )}
                                                </div>

                                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                                    <div className='flex items-center gap-1 flex-1 min-w-0'>
                                                        <Link
                                                            key={topicObject.name}
                                                            href={`/${locale}/topic/${topicObject.name}`}
                                                            className='hover:opacity-80 transition-opacity'
                                                            title={`${lang(
                                                                {
                                                                    'zh-CN': '主题',
                                                                    'en-US': 'Topic',
                                                                    'zh-TW': '主題',
                                                                    'es-ES': 'Tema',
                                                                    'fr-FR': 'Sujet',
                                                                    'ru-RU': 'Тема',
                                                                    'ja-JP': 'トピック',
                                                                    'de-DE': 'Thema',
                                                                    'pt-BR': 'Tópico',
                                                                    'ko-KR': '주제',
                                                                },
                                                                locale,
                                                            )}: ${getLocalizedTopicName(topicObject, locale)}`}
                                                            rel='noopener'
                                                        >
                                                            <Badge
                                                                variant='secondary'
                                                                className='text-xs px-1 py-0.5 h-auto flex-shrink-0'
                                                            >
                                                                <span className='mr-0.5'>
                                                                    {topicObject.emoji}
                                                                </span>
                                                                <span className='hidden sm:inline text-xs'>
                                                                    {getLocalizedTopicName(
                                                                        topicObject,
                                                                        locale,
                                                                    )}
                                                                </span>
                                                            </Badge>
                                                        </Link>
                                                        <span className='flex-shrink-0'>•</span>
                                                        <Link
                                                            href={`/${locale}/user/${post.User?.uid}`}
                                                            className='truncate max-w-20 flex-shrink-0 hover:text-primary transition-colors'
                                                            title={`${lang(
                                                                {
                                                                    'zh-CN': '用户',
                                                                    'en-US': 'User',
                                                                    'zh-TW': '用戶',
                                                                    'es-ES': 'Usuario',
                                                                    'fr-FR': 'Utilisateur',
                                                                    'ru-RU': 'Пользователь',
                                                                    'ja-JP': 'ユーザー',
                                                                    'de-DE': 'Benutzer',
                                                                    'pt-BR': 'Usuário',
                                                                    'ko-KR': '사용자',
                                                                },
                                                                locale,
                                                            )}: ${post.User?.nickname || 'Anonymous'}`}
                                                            rel='noopener'
                                                        >
                                                            @{post.User?.nickname || 'Anonymous'}
                                                        </Link>
                                                        <span className='flex-shrink-0'>•</span>
                                                        <time
                                                            className='flex-shrink-0'
                                                            dateTime={post.createdAt.toISOString()}
                                                        >
                                                            {formatPostTime(post.createdAt, locale)}
                                                        </time>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0'>
                                                <div className='flex items-center gap-1'>
                                                    <Heart className='h-3 w-3' />
                                                    <span>{post._count.likes}</span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <MessageCircle className='h-3 w-3' />
                                                    <span>{post._count.Reply}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='flex items-center justify-center gap-2 mt-6'>
                            {page > 1 && (
                                <Button variant='outline' size='sm' asChild>
                                    <Link
                                        href={`/${locale}/page/${page - 1}#`}
                                        title={`${labels.previous} - ${lang(
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
                                        rel='prev'
                                    >
                                        <ChevronLeft className='h-4 w-4 mr-1' />
                                        {labels.previous}
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
                                            className='w-8 h-8 p-0'
                                        >
                                            <Link
                                                href={`/${locale}/page/${pageNum}#`}
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
                                                aria-current={pageNum === page ? 'page' : undefined}
                                            >
                                                {pageNum}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </div>

                            {page < totalPages && (
                                <Button variant='outline' size='sm' asChild>
                                    <Link
                                        href={`/${locale}/page/${page + 1}#`}
                                        title={`${labels.next} - ${lang(
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
                                        rel='next'
                                    >
                                        {labels.next}
                                        <ChevronRight className='h-4 w-4 ml-1' />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* 右侧统计区域 - 不使用 Page 包裹，不参与动画 */}
                <div className='hidden xl:block w-80 space-y-4'>
                    {/* 总体统计 */}
                    <Card>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5' />
                                {lang(
                                    {
                                        'zh-CN': '总体统计',
                                        'en-US': 'Overall Stats',
                                        'zh-TW': '總體統計',
                                        'es-ES': 'Estadísticas generales',
                                        'fr-FR': 'Statistiques générales',
                                        'ru-RU': 'Общая статистика',
                                        'ja-JP': '全体統計',
                                        'de-DE': 'Gesamtstatistik',
                                        'pt-BR': 'Estatísticas gerais',
                                        'ko-KR': '전체 통계',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='text-center p-3 rounded-lg hover:bg-primary/5 transition-colors'>
                                    <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                                        <FileText className='h-4 w-4' />
                                    </div>
                                    <div className='text-2xl font-bold text-primary'>
                                        {totalPosts.toLocaleString()}
                                    </div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        {lang(
                                            {
                                                'zh-CN': '总帖子',
                                                'en-US': 'Total Posts',
                                                'zh-TW': '總貼文',
                                                'es-ES': 'Total de publicaciones',
                                                'fr-FR': 'Total des messages',
                                                'ru-RU': 'Всего сообщений',
                                                'ja-JP': '総投稿数',
                                                'de-DE': 'Gesamte Beiträge',
                                                'pt-BR': 'Total de postagens',
                                                'ko-KR': '총 게시물',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                                <div className='text-center p-3 rounded-lg hover:bg-primary/5 transition-colors'>
                                    <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                                        <Users className='h-4 w-4' />
                                    </div>
                                    <div className='text-2xl font-bold text-primary'>
                                        {totalUsers.toLocaleString()}
                                    </div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        {lang(
                                            {
                                                'zh-CN': '总用户',
                                                'en-US': 'Total Users',
                                                'zh-TW': '總用戶',
                                                'es-ES': 'Total de usuarios',
                                                'fr-FR': 'Total des utilisateurs',
                                                'ru-RU': 'Всего пользователей',
                                                'ja-JP': '総ユーザー数',
                                                'de-DE': 'Gesamte Benutzer',
                                                'pt-BR': 'Total de usuários',
                                                'ko-KR': '총 사용자',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                                <div className='text-center p-3 rounded-lg hover:bg-primary/5 transition-colors'>
                                    <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                                        <MessageSquare className='h-4 w-4' />
                                    </div>
                                    <div className='text-2xl font-bold text-primary'>
                                        {totalReplies.toLocaleString()}
                                    </div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        {lang(
                                            {
                                                'zh-CN': '总回复',
                                                'en-US': 'Total Replies',
                                                'zh-TW': '總回覆',
                                                'es-ES': 'Total de respuestas',
                                                'fr-FR': 'Total des réponses',
                                                'ru-RU': 'Всего ответов',
                                                'ja-JP': '総返信数',
                                                'de-DE': 'Gesamte Antworten',
                                                'pt-BR': 'Total de respostas',
                                                'ko-KR': '총 답글',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                                <div className='text-center p-3 rounded-lg hover:bg-primary/5 transition-colors'>
                                    <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                                        <ThumbsUp className='h-4 w-4' />
                                    </div>
                                    <div className='text-2xl font-bold text-primary'>
                                        {totalLikes.toLocaleString()}
                                    </div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        {lang(
                                            {
                                                'zh-CN': '总点赞',
                                                'en-US': 'Total Likes',
                                                'zh-TW': '總按讚',
                                                'es-ES': 'Total de me gusta',
                                                'fr-FR': "Total des j'aime",
                                                'ru-RU': 'Всего лайков',
                                                'ja-JP': '総いいね数',
                                                'de-DE': 'Gesamte Gefällt mir',
                                                'pt-BR': 'Total de curtidas',
                                                'ko-KR': '총 좋아요',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 当前页面活跃用户排行 */}
                    {topPostersArray.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Users className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '本页活跃用户',
                                            'en-US': 'Active Users',
                                            'zh-TW': '本頁活躍用戶',
                                            'es-ES': 'Usuarios activos',
                                            'fr-FR': 'Utilisateurs actifs',
                                            'ru-RU': 'Активные пользователи',
                                            'ja-JP': 'アクティブユーザー',
                                            'de-DE': 'Aktive Benutzer',
                                            'pt-BR': 'Usuários ativos',
                                            'ko-KR': '활성 사용자',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                {topPostersArray.map(({ user, count }) => {
                                    const maxCount = Math.max(
                                        ...topPostersArray.map((p) => p.count),
                                    );
                                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                    return (
                                        <div key={user?.uid} className='space-y-2'>
                                            <div className='flex items-center gap-3'>
                                                <Link
                                                    href={`/${locale}/user/${user?.uid}`}
                                                    className='hover:opacity-80 transition-opacity'
                                                    title={`${lang(
                                                        {
                                                            'zh-CN': '查看用户资料',
                                                            'en-US': 'View user profile',
                                                            'zh-TW': '查看用戶資料',
                                                            'es-ES': 'Ver perfil de usuario',
                                                            'fr-FR': 'Voir le profil utilisateur',
                                                            'ru-RU':
                                                                'Посмотреть профиль пользователя',
                                                            'ja-JP': 'ユーザープロフィールを表示',
                                                            'de-DE': 'Benutzerprofil anzeigen',
                                                            'pt-BR': 'Ver perfil do usuário',
                                                            'ko-KR': '사용자 프로필 보기',
                                                        },
                                                        locale,
                                                    )}: ${user?.nickname || 'Anonymous'}`}
                                                    rel='noopener'
                                                >
                                                    <Avatar className='h-8 w-8'>
                                                        <AvatarImage
                                                            src={
                                                                user?.avatar[0]?.id
                                                                    ? `/api/dynamicImage/emoji/?emoji=${user.avatar[0].emoji}&background=${encodeURIComponent(user.avatar[0].background.replaceAll('%', '%25'))}`
                                                                    : undefined
                                                            }
                                                        />
                                                        <AvatarFallback
                                                            style={{
                                                                backgroundColor:
                                                                    user?.avatar[0]?.background ||
                                                                    '#e5e7eb',
                                                            }}
                                                        >
                                                            {user?.avatar[0]?.emoji ||
                                                                user?.profileEmoji ||
                                                                user?.nickname?.charAt(0) ||
                                                                'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </Link>

                                                <div className='flex-1 min-w-0'>
                                                    <div className='text-sm font-medium truncate'>
                                                        <Link
                                                            href={`/${locale}/user/${user?.uid}`}
                                                            className='hover:text-primary transition-colors'
                                                            title={`${lang(
                                                                {
                                                                    'zh-CN': '查看用户资料',
                                                                    'en-US': 'View user profile',
                                                                    'zh-TW': '查看用戶資料',
                                                                    'es-ES':
                                                                        'Ver perfil de usuario',
                                                                    'fr-FR':
                                                                        'Voir le profil utilisateur',
                                                                    'ru-RU':
                                                                        'Посмотреть профиль пользователя',
                                                                    'ja-JP':
                                                                        'ユーザープロフィールを表示',
                                                                    'de-DE':
                                                                        'Benutzerprofil anzeigen',
                                                                    'pt-BR':
                                                                        'Ver perfil do usuário',
                                                                    'ko-KR': '사용자 프로필 보기',
                                                                },
                                                                locale,
                                                            )}: ${user?.nickname || 'Anonymous'}`}
                                                            rel='noopener'
                                                        >
                                                            {user?.nickname || 'Anonymous'}
                                                        </Link>
                                                    </div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        {count}{' '}
                                                        {lang(
                                                            {
                                                                'zh-CN': '篇帖子',
                                                                'en-US': 'posts',
                                                                'zh-TW': '篇貼文',
                                                                'es-ES': 'publicaciones',
                                                                'fr-FR': 'messages',
                                                                'ru-RU': 'сообщений',
                                                                'ja-JP': '投稿',
                                                                'de-DE': 'Beiträge',
                                                                'pt-BR': 'postagens',
                                                                'ko-KR': '게시물',
                                                            },
                                                            locale,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Progress value={percentage} className='h-2' />
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* 点赞最多的帖子 */}
                    {currentPageStats.topLikedPosts.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Heart className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '点赞最多帖子',
                                            'en-US': 'Most Liked Posts',
                                            'zh-TW': '按讚最多貼文',
                                            'es-ES': 'Publicaciones más gustadas',
                                            'fr-FR': 'Messages les plus aimés',
                                            'ru-RU': 'Самые популярные сообщения',
                                            'ja-JP': '最もいいねされた投稿',
                                            'de-DE': 'Beliebteste Beiträge',
                                            'pt-BR': 'Postagens mais curtidas',
                                            'ko-KR': '가장 좋아요 받은 게시물',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                {currentPageStats.topLikedPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className='flex items-center justify-between'
                                    >
                                        <Link
                                            href={`/${locale}/post/${post.id}`}
                                            className='text-xs hover:text-primary transition-colors truncate flex-1 mr-2'
                                            title={`${lang(
                                                {
                                                    'zh-CN': '查看帖子',
                                                    'en-US': 'View post',
                                                    'zh-TW': '查看貼文',
                                                    'es-ES': 'Ver publicación',
                                                    'fr-FR': 'Voir le message',
                                                    'ru-RU': 'Посмотреть сообщение',
                                                    'ja-JP': '投稿を表示',
                                                    'de-DE': 'Beitrag anzeigen',
                                                    'pt-BR': 'Ver postagem',
                                                    'ko-KR': '게시물 보기',
                                                },
                                                locale,
                                            )}: ${getLocalizedTitle(post, locale)}`}
                                            rel='noopener'
                                        >
                                            {getLocalizedTitle(post, locale)}
                                        </Link>
                                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <Heart className='h-3 w-3' />
                                            {post._count.likes}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* 回复最多的帖子 */}
                    {currentPageStats.topRepliedPosts.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <MessageCircle className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '回复最多帖子',
                                            'en-US': 'Most Replied Posts',
                                            'zh-TW': '回覆最多貼文',
                                            'es-ES': 'Publicaciones más respondidas',
                                            'fr-FR': 'Messages les plus commentés',
                                            'ru-RU': 'Самые обсуждаемые сообщения',
                                            'ja-JP': '最も返信された投稿',
                                            'de-DE': 'Meistdiskutierte Beiträge',
                                            'pt-BR': 'Postagens mais respondidas',
                                            'ko-KR': '가장 많이 답글 받은 게시물',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                {currentPageStats.topRepliedPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className='flex items-center justify-between'
                                    >
                                        <Link
                                            href={`/${locale}/post/${post.id}`}
                                            className='text-xs hover:text-primary transition-colors truncate flex-1 mr-2'
                                            title={`${lang(
                                                {
                                                    'zh-CN': '查看帖子',
                                                    'en-US': 'View post',
                                                    'zh-TW': '查看貼文',
                                                    'es-ES': 'Ver publicación',
                                                    'fr-FR': 'Voir le message',
                                                    'ru-RU': 'Посмотреть сообщение',
                                                    'ja-JP': '投稿を表示',
                                                    'de-DE': 'Beitrag anzeigen',
                                                    'pt-BR': 'Ver postagem',
                                                    'ko-KR': '게시물 보기',
                                                },
                                                locale,
                                            )}: ${getLocalizedTitle(post, locale)}`}
                                            rel='noopener'
                                        >
                                            {getLocalizedTitle(post, locale)}
                                        </Link>
                                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <MessageCircle className='h-3 w-3' />
                                            {post._count.Reply}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* 时间分布柱状图 */}
                    {currentPageStats.timeDistribution.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Calendar className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '发帖时间分布',
                                            'en-US': 'Post Time Distribution',
                                            'zh-TW': '發帖時間分佈',
                                            'es-ES': 'Distribución de tiempo de publicación',
                                            'fr-FR': 'Distribution du temps de publication',
                                            'ru-RU': 'Распределение времени публикации',
                                            'ja-JP': '投稿時間の分布',
                                            'de-DE': 'Verteilung der Beitragszeit',
                                            'pt-BR': 'Distribuição do tempo de postagem',
                                            'ko-KR': '게시 시간 분포',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3'>
                                    <div className='flex items-end justify-between h-32 gap-1 border-b border-border'>
                                        {currentPageStats.timeDistribution.map((bucket, index) => {
                                            const maxCount = Math.max(
                                                ...currentPageStats.timeDistribution.map(
                                                    (b) => b.count,
                                                ),
                                            );
                                            const percentage =
                                                maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
                                            const heightPx = Math.max(
                                                percentage * 1.2,
                                                bucket.count > 0 ? 12 : 4,
                                            ); // 至少12px高度，有数据时
                                            return (
                                                <div
                                                    key={index}
                                                    className='flex-1 flex flex-col justify-end items-center'
                                                >
                                                    <div
                                                        className='w-full bg-primary/60 rounded-t-sm min-h-[4px] flex items-end justify-center transition-all'
                                                        style={{ height: `${heightPx}px` }}
                                                        title={`${bucket.count} ${lang(
                                                            {
                                                                'zh-CN': '个帖子',
                                                                'en-US': 'posts',
                                                                'zh-TW': '個貼文',
                                                                'es-ES': 'publicaciones',
                                                                'fr-FR': 'messages',
                                                                'ru-RU': 'сообщений',
                                                                'ja-JP': '投稿',
                                                                'de-DE': 'Beiträge',
                                                                'pt-BR': 'postagens',
                                                                'ko-KR': '게시물',
                                                            },
                                                            locale,
                                                        )}`}
                                                    >
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
                                            {formatRelativeTime(
                                                currentPageStats.timeDistribution[0]?.startTime ||
                                                    Date.now(),
                                                locale,
                                            )}
                                        </span>
                                        <span>
                                            {formatRelativeTime(
                                                currentPageStats.timeDistribution[
                                                    currentPageStats.timeDistribution.length - 1
                                                ]?.endTime || Date.now(),
                                                locale,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
