import '@/app/globals.css';
import { Metadata } from 'next';
import lang from '@/lib/lang';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmojiAvatar } from '@/components/emoji-avatar';
import {
    Trophy,
    Users,
    FileText,
    MessageSquare,
    Heart,
    TrendingUp,
    Calendar,
    BarChart3,
    Activity,
} from 'lucide-react';
import Link from 'next/link';
import {
    getTopUsersByPosts,
    getTopUsersByReplies,
    getTopPostsByScore,
    formatCount,
    type LeaderboardUser,
    type LeaderboardPost,
} from '@/lib/stats';

export const revalidate = 600;

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    const title = lang(
        {
            'zh-CN': '排行榜 | XEO OS - 交流每个人的观点',
            'en-US': 'Leaderboard | XEO OS - Xchange Everyone\'s Opinions',
            'zh-TW': '排行榜 | XEO OS - 交流每個人的觀點',
            'es-ES': 'Tabla de Clasificación | XEO OS - Intercambia las opiniones de todos',
            'fr-FR': 'Classement | XEO OS - Échangez les opinions de chacun',
            'ru-RU': 'Таблица Лидеров | XEO OS - Обменивайтесь мнениями всех',
            'ja-JP': 'ランキング | XEO OS - みんなの意見を交換',
            'de-DE': 'Rangliste | XEO OS - Teile die Meinungen aller',
            'pt-BR': 'Classificação | XEO OS - Troque as opiniões de todos',
            'ko-KR': '리더보드 | XEO OS - 모두의 의견을 교환하세요',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '查看 XEO OS 社区的活跃用户和热门内容排行榜。发现最受欢迎的帖子、最活跃的用户以及社区统计数据。',
            'en-US': 'View the leaderboard of active users and popular content in the XEO OS community. Discover the most popular posts, active users, and community statistics.',
            'zh-TW': '查看 XEO OS 社群的活躍用戶和熱門內容排行榜。發現最受歡迎的帖子、最活躍的用戶以及社群統計數據。',
            'es-ES': 'Ve la tabla de clasificación de usuarios activos y contenido popular en la comunidad XEO OS. Descubre las publicaciones más populares, usuarios activos y estadísticas de la comunidad.',
            'fr-FR': 'Consultez le classement des utilisateurs actifs et du contenu populaire dans la communauté XEO OS. Découvrez les publications les plus populaires, les utilisateurs actifs et les statistiques de la communauté.',
            'ru-RU': 'Просмотрите таблицу лидеров активных пользователей и популярного контента в сообществе XEO OS. Откройте для себя самые популярные посты, активных пользователей и статистику сообщества.',
            'ja-JP': 'XEO OS コミュニティのアクティブユーザーと人気コンテンツのランキングを表示します。最も人気のある投稿、アクティブなユーザー、コミュニティ統計を発見してください。',
            'de-DE': 'Sehen Sie sich die Rangliste der aktiven Benutzer und beliebten Inhalte in der XEO OS-Community an. Entdecken Sie die beliebtesten Beiträge, aktive Benutzer und Community-Statistiken.',
            'pt-BR': 'Veja a classificação de usuários ativos e conteúdo popular na comunidade XEO OS. Descubra as postagens mais populares, usuários ativos e estatísticas da comunidade.',
            'ko-KR': 'XEO OS 커뮤니티의 활성 사용자와 인기 콘텐츠 리더보드를 확인하세요. 가장 인기 있는 게시물, 활성 사용자 및 커뮤니티 통계를 발견하세요。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

function getRankIcon(index: number) {
    switch (index) {
        case 0:
            return <span className="text-2xl">🥇</span>;
        case 1:
            return <span className="text-2xl">🥈</span>;
        case 2:
            return <span className="text-2xl">🥉</span>;
        default:
            return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
}

function getLocalizedTitle(post: LeaderboardPost, locale: string): string {
    const titleMap: Record<string, string | null> = {
        "zh-CN": post.titleZHCN,
        "en-US": post.titleENUS,
        "zh-TW": post.titleZHTW,
        "es-ES": post.titleESES,
        "fr-FR": post.titleFRFR,
        "ru-RU": post.titleRURU,
        "ja-JP": post.titleJAJP,
        "de-DE": post.titleDEDE,
        "pt-BR": post.titlePTBR,
        "ko-KR": post.titleKOKR,
    };

    return titleMap[locale] || post.title;
}

function UserCard({ user, index, locale, type }: { user: LeaderboardUser; index: number; locale: string; type: 'posts' | 'replies' }) {
    const userAvatar = user.avatar[0] || { emoji: '', background: '' };

    return (
        <Card className="hover:shadow-md transition-all">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 flex justify-center">
                        {getRankIcon(index)}
                    </div>
                    
                    <Link
                        href={`/${locale}/user/${user.uid}`}
                        className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                        title={user.nickname}
                        rel="noopener"
                    >
                        <EmojiAvatar
                            className="h-12 w-12"
                            emoji={userAvatar.emoji}
                            background={userAvatar.background}
                            fallbackText={user.profileEmoji || user.nickname.charAt(0) || 'U'}
                            title={user.nickname}
                        />
                        
                        <div className="flex-1">
                            <div className="font-semibold">{user.nickname}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                    </Link>

                    <div className="text-right">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {formatCount(type === 'posts' ? user._count.post : user._count.reply)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {type === 'posts' 
                                    ? lang({
                                        'zh-CN': '发帖',
                                        'en-US': 'Posts',
                                        'zh-TW': '發文',
                                        'es-ES': 'Posts',
                                        'fr-FR': 'Posts',
                                        'ru-RU': 'Посты',
                                        'ja-JP': '投稿',
                                        'de-DE': 'Posts',
                                        'pt-BR': 'Posts',
                                        'ko-KR': '게시물',
                                    }, locale)
                                    : lang({
                                        'zh-CN': '回复',
                                        'en-US': 'Replies',
                                        'zh-TW': '回覆',
                                        'es-ES': 'Respuestas',
                                        'fr-FR': 'Réponses',
                                        'ru-RU': 'Ответы',
                                        'ja-JP': '返信',
                                        'de-DE': 'Antworten',
                                        'pt-BR': 'Respostas',
                                        'ko-KR': '답글',
                                    }, locale)
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CompactPostItem({ post, index, locale }: { post: LeaderboardPost; index: number; locale: string }) {
    const userAvatar = post.user.avatar[0] || { emoji: '', background: '' };
      // 计算 score（如果 post 有 score 属性就使用，否则计算）
    const score = 'score' in post ? (post as LeaderboardPost & { score: number }).score : (post._count.likes + post._count.belongReplies);

    return (
        <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-8 flex justify-center">
                {index < 3 ? (
                    getRankIcon(index)
                ) : (
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <Link
                    href={`/${locale}/post/${post.id}/${(post.titleENUS || post.title)?.toLowerCase().replaceAll(" ", "-").replace(/[^a-z-]/g, '') || ''}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                    title={getLocalizedTitle(post, locale)}
                    rel="noopener"
                >
                    {getLocalizedTitle(post, locale)}
                </Link>
                
                <div className="flex items-center gap-2 mt-1">
                    <Link
                        href={`/${locale}/user/${post.user.uid}`}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                        title={post.user.nickname}
                        rel="noopener"
                    >
                        <EmojiAvatar
                            className="h-4 w-4"
                            fallbackClassName="text-xs"
                            emoji={userAvatar.emoji}
                            background={userAvatar.background}
                            fallbackText={post.user.nickname.charAt(0)}
                            title={post.user.nickname}
                        />
                        <span className="text-xs text-muted-foreground">{post.user.nickname}</span>
                    </Link>
                    
                    <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString(locale)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>{post._count.belongReplies}</span>
                </div>
                <div className="text-primary font-bold">
                    {formatCount(score)}
                </div>
            </div>
        </div>
    );
}

export default async function LeaderboardPage({ params }: Props) {
    const { locale } = await params;

    // 并行获取所有排行榜数据
    const [
        topUsersByPosts,
        topUsersByReplies,
        todayPosts,
        weekPosts,
        yearPosts,
        allPosts,
    ] = await Promise.all([
        getTopUsersByPosts(10),
        getTopUsersByReplies(10),
        getTopPostsByScore('today', 10),
        getTopPostsByScore('week', 10),
        getTopPostsByScore('year', 10),
        getTopPostsByScore('all', 10),
    ]);

    const labels = {
        userTabs: {
            posts: lang({
                'zh-CN': '发帖数',
                'en-US': 'Posts',
                'zh-TW': '發文數',
                'es-ES': 'Publicaciones',
                'fr-FR': 'Publications',
                'ru-RU': 'Посты',
                'ja-JP': '投稿数',
                'de-DE': 'Beiträge',
                'pt-BR': 'Postagens',
                'ko-KR': '게시물',
            }, locale),
            replies: lang({
                'zh-CN': '回复数',
                'en-US': 'Replies',
                'zh-TW': '回覆數',
                'es-ES': 'Respuestas',
                'fr-FR': 'Réponses',
                'ru-RU': 'Ответы',
                'ja-JP': '返信数',
                'de-DE': 'Antworten',
                'pt-BR': 'Respostas',
                'ko-KR': '답글',
            }, locale),
        },
        postTabs: {
            today: lang({
                'zh-CN': '最近24小时热门',
                'en-US': 'Last 24 Hours',
                'zh-TW': '最近24小時熱門',
                'es-ES': 'Últimas 24 Horas',
                'fr-FR': 'Dernières 24 Heures',
                'ru-RU': 'Последние 24 Часа',
                'ja-JP': '過去24時間',
                'de-DE': 'Letzte 24 Stunden',
                'pt-BR': 'Últimas 24 Horas',
                'ko-KR': '최근 24시간',
            }, locale),
            week: lang({
                'zh-CN': '本周热门',
                'en-US': 'This Week',
                'zh-TW': '本週熱門',
                'es-ES': 'Esta Semana',
                'fr-FR': 'Cette Semaine',
                'ru-RU': 'На Этой Неделе',
                'ja-JP': '今週',
                'de-DE': 'Diese Woche',
                'pt-BR': 'Esta Semana',
                'ko-KR': '이번 주',
            }, locale),
            year: lang({
                'zh-CN': '本年热门',
                'en-US': 'This Year',
                'zh-TW': '本年熱門',
                'es-ES': 'Este Año',
                'fr-FR': 'Cette Année',
                'ru-RU': 'В Этом Году',
                'ja-JP': '今年',
                'de-DE': 'Dieses Jahr',
                'pt-BR': 'Este Ano',
                'ko-KR': '올해',
            }, locale),
            all: lang({
                'zh-CN': '历史总榜',
                'en-US': 'All Time',
                'zh-TW': '歷史總榜',
                'es-ES': 'Todos los Tiempos',
                'fr-FR': 'Tous les Temps',
                'ru-RU': 'За Все Время',
                'ja-JP': '全期間',
                'de-DE': 'Alle Zeiten',
                'pt-BR': 'Todos os Tempos',
                'ko-KR': '전체 기간',
            }, locale),
        },
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="text-6xl">
                            🏆
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold">
                        {lang({
                            'zh-CN': '社区排行榜',
                            'en-US': 'Community Leaderboard',
                            'zh-TW': '社群排行榜',
                            'es-ES': 'Tabla de Clasificación de la Comunidad',
                            'fr-FR': 'Classement de la Communauté',
                            'ru-RU': 'Рейтинг Сообщества',
                            'ja-JP': 'コミュニティランキング',
                            'de-DE': 'Community-Rangliste',
                            'pt-BR': 'Classificação da Comunidade',
                            'ko-KR': '커뮤니티 리더보드',
                        }, locale)}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {lang({
                            'zh-CN': '发现社区中最受欢迎的内容和最活跃的用户。排名基于帖子的点赞数和回复数综合计算。',
                            'en-US': 'Discover the most popular content and active users in our community. Rankings are calculated based on combined likes and replies.',
                            'zh-TW': '發現社群中最受歡迎的內容和最活躍的用戶。排名基於帖子的按讚數和回覆數綜合計算。',
                            'es-ES': 'Descubre el contenido más popular y los usuarios más activos de nuestra comunidad. Las clasificaciones se calculan en base a me gusta and respuestas combinadas.',
                            'fr-FR': 'Découvrez le contenu le plus populaire et les utilisateurs les plus actifs de notre communauté. Les classements sont calculés sur la base des j\'aime and réponses combinés.',
                            'ru-RU': 'Откройте для себя самый популярный контент и активных пользователей в нашем сообществе. Рейтинги рассчитываются на основе совокупных лайков и ответов.',
                            'ja-JP': 'コミュニティで最も人気のあるコンテンツとアクティブなユーザーを発見してください。ランキングはいいねと返信の合計で計算されます。',
                            'de-DE': 'Entdecken Sie die beliebtesten Inhalte und aktivsten Benutzer in unserer Community. Rankings werden basierend на kombinierten Gefällt mir und Antworten berechnet.',
                            'pt-BR': 'Descubra o conteúdo mais popular e usuários mais ativos em nossa comunidade. As classificações são calculadas com base em curtidas e respostas combinadas.',
                            'ko-KR': '커뮤니티에서 가장 인기 있는 콘텐츠와 활발한 사용자를 발견하세요. 순위는 좋아요와 답글을 합산하여 계산됩니다.',
                        }, locale)}
                    </p>
                </div>

                {/* Post Rankings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-6 w-6" />
                            {lang({
                                'zh-CN': '热门内容排行',
                                'en-US': 'Popular Content Rankings',
                                'zh-TW': '熱門內容排行',
                                'es-ES': 'Clasificación de Contenido Popular',
                                'fr-FR': 'Classement du Contenu Populaire',
                                'ru-RU': 'Рейтинг Популярного Контента',
                                'ja-JP': '人気コンテンツランキング',
                                'de-DE': 'Beliebte Inhalte Rangliste',
                                'pt-BR': 'Classificação de Conteúdo Popular',
                                'ko-KR': '인기 콘텐츠 순위',
                            }, locale)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="today" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="today" className="flex items-center gap-2 transition-all duration-300">
                                    <Activity className="h-4 w-4" />
                                    <span className="hidden sm:inline">{labels.postTabs.today}</span>
                                </TabsTrigger>
                                <TabsTrigger value="week" className="flex items-center gap-2 transition-all duration-300">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="hidden sm:inline">{labels.postTabs.week}</span>
                                </TabsTrigger>
                                <TabsTrigger value="year" className="flex items-center gap-2 transition-all duration-300">
                                    <Calendar className="h-4 w-4" />
                                    <span className="hidden sm:inline">{labels.postTabs.year}</span>
                                </TabsTrigger>
                                <TabsTrigger value="all" className="flex items-center gap-2 transition-all duration-300">
                                    <Trophy className="h-4 w-4" />
                                    <span className="hidden sm:inline">{labels.postTabs.all}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="today" className="space-y-6 mt-6 animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    {todayPosts.map((post, index) => (
                                        <CompactPostItem key={post.id} post={post} index={index} locale={locale} />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="week" className="space-y-6 mt-6 animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    {weekPosts.map((post, index) => (
                                        <CompactPostItem key={post.id} post={post} index={index} locale={locale} />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="year" className="space-y-6 mt-6 animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    {yearPosts.map((post, index) => (
                                        <CompactPostItem key={post.id} post={post} index={index} locale={locale} />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="all" className="space-y-6 mt-6 animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    {allPosts.map((post, index) => (
                                        <CompactPostItem key={post.id} post={post} index={index} locale={locale} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* User Rankings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            {lang({
                                'zh-CN': '活跃用户排行',
                                'en-US': 'Active User Rankings',
                                'zh-TW': '活躍用戶排行',
                                'es-ES': 'Clasificación de Usuarios Activos',
                                'fr-FR': 'Classement des Utilisateurs Actifs',
                                'ru-RU': 'Рейтинг Активных Пользователей',
                                'ja-JP': 'アクティブユーザーランキング',
                                'de-DE': 'Aktive Benutzer Rangliste',
                                'pt-BR': 'Classificação de Usuários Ativos',
                                'ko-KR': '활성 사용자 순위',
                            }, locale)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="posts" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="posts" className="flex items-center gap-2 transition-all duration-300">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">{labels.userTabs.posts}</span>
                                </TabsTrigger>
                                <TabsTrigger value="replies" className="flex items-center gap-2 transition-all duration-300">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="hidden sm:inline">{labels.userTabs.replies}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="posts" className="space-y-4 mt-6 animate-in fade-in duration-500">
                                {topUsersByPosts.map((user, index) => (
                                    <UserCard key={user.uid} user={user} index={index} locale={locale} type="posts" />
                                ))}
                            </TabsContent>

                            <TabsContent value="replies" className="space-y-4 mt-6 animate-in fade-in duration-500">
                                {topUsersByReplies.map((user, index) => (
                                    <UserCard key={user.uid} user={user} index={index} locale={locale} type="replies" />
                                ))}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Footer note */}
                <Card className="bg-muted/50">
                    <CardContent className="p-6 text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {lang({
                                'zh-CN': '排行榜数据每小时更新一次，综合得分 = 点赞数 + 回复数。',
                                'en-US': 'Leaderboard data updates hourly. Total score = Likes + Replies.',
                                'zh-TW': '排行榜數據每小時更新一次，綜合得分 = 按讚數 + 回覆數。',
                                'es-ES': 'Los datos de la clasificación se actualizan cada hora. Puntuación total = Me gusta + Respuestas.',
                                'fr-FR': 'Les données du classement sont mises à jour toutes les heures. Score total = J\'aime + Réponses.',
                                'ru-RU': 'Данные рейтинга обновляются каждый час. Общий счет = Лайки + Ответы.',
                                'ja-JP': 'ランキングデータは1時間ごとに更新されます。総合スコア = いいね + 返信。',
                                'de-DE': 'Ranglisten-Daten werden stündlich aktualisiert. Gesamtpunktzahl = Gefällt mir + Antworten.',
                                'pt-BR': 'Os dados da classificação são atualizados a cada hora. Pontuação total = Curtidas + Respostas.',
                                'ko-KR': '리더보드 데이터는 매시간 업데이트됩니다. 총점 = 좋아요 + 답글.',
                            }, locale)}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
