import lang from '@/lib/lang';
import prisma from '../../../api/_utils/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
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
    Hash,
} from 'lucide-react';

import '@/app/globals.css';

type Props = {
    params: { locale: string; page?: number };
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
    topics: {
        name: string;
        emoji: string;
        nameZHCN?: string | null;
        nameENUS?: string | null;
        nameZHTW?: string | null;
        nameESES?: string | null;
        nameFRFR?: string | null;
        nameRURU?: string | null;
        nameJAJP?: string | null;
        nameDEDE?: string | null;
        namePTBR?: string | null;
        nameKOKR?: string | null;
    }[];
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

function getLocalizedTopicName(topic: Post['topics'][0], locale: string): string {
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

export default async function HomePage({ params }: Props) {
    const { locale, page: pageParam = 1 } = await params;
    const page = Number(pageParam); // 确保页码是数字类型
    const skip = (page - 1) * POSTS_PER_PAGE;

    const [posts, totalPosts, totalUsers, totalReplies, totalLikes]: [
        Post[],
        number,
        number,
        number,
        number,
    ] = await Promise.all([
        prisma.post.findMany({
            where: {
                published: true,
                originLang: {
                    not: null,
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
    ]);

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

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
            .flatMap((post) => post.topics)
            .reduce(
                (acc, topic) => {
                    const key = topic.name;
                    acc[key] = {
                        topic,
                        count: (acc[key]?.count || 0) + 1,
                    };
                    return acc;
                },
                {} as Record<string, { topic: Post['topics'][0]; count: number }>,
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

    const topTopicsArray = Object.values(currentPageStats.topTopics)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

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
                'zh-CN': '最新帖子',
                'en-US': 'Latest Posts',
                'zh-TW': '最新貼文',
                'es-ES': 'Últimas publicaciones',
                'fr-FR': 'Derniers messages',
                'ru-RU': 'Последние сообщения',
                'ja-JP': '最新の投稿',
                'de-DE': 'Neueste Beiträge',
                'pt-BR': 'Postagens mais recentes',
                'ko-KR': '최신 게시물',
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
            {/* 页面顶部横排Card */}
            {/* 桌面版：使用原有的grid布局 */}
            <div className='hidden lg:grid lg:grid-cols-4 gap-4 mb-6'>
                {/* 页面介绍 - 50% 宽度 */}
                <Card className='lg:col-span-2 bg-primary'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-xl font-bold'>
                            {"XEO OS - Xchange Everyone's Opinion"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-sm text-white leading-relaxed'>
                            {lang(
                                {
                                    'zh-CN':
                                        '🌍✨XEO OS 致力于打破语言壁垒！🚧💬 借助尖端AI技术，我们实时翻译每篇内容，支持多语言互译，让全球用户都能用最熟悉的母语畅快交流～🌐💖',
                                    'en-US':
                                        '🌎✨XEO OS smashes language barriers! ⚡🤖 Using cutting-edge AI, we instantly translate every post into multiple languages, empowering global conversations in your native tongue! 💬🌍',
                                    'zh-TW':
                                        '🌏✨XEO OS 全力擊破語言高牆！🚀💬 運用頂尖AI技術，即時翻譯每篇內容，讓全球用戶用最熟悉的母語無障礙交流～💫❤️',
                                    'es-ES':
                                        '🌎✨¡XEO OS rompe las barreras idiomáticas! ⚡🤖 Con IA de vanguardia, traducimos al instante todo a múltiples idiomas para conversaciones globales en tu lengua materna. 💬💫',
                                    'fr-FR':
                                        '🌍✨XEO OS brise les barrières linguistiques ! ⚡🤖 Grâce à une IA de pointe, nous traduisons instantanément chaque contenu en plusieurs langues pour des échanges mondiaux dans votre langue ! 💬✨',
                                    'ru-RU':
                                        '🌍✨XEO OS разрушает языковые барьеры! ⚡🤖 С помощью передового ИИ мгновенно переводим любой контент, открывая глобальное общение на родном языке! 💬🚀',
                                    'ja-JP':
                                        '🌏✨XEO OSが言語の壁を打破！⚡🤖 最先端AIで全コンテンツを多言語翻訳。母国語で世界と繋がるグローバルコミュニケーションを実現💬🌸',
                                    'de-DE':
                                        '🌍✨XEO OS durchbricht Sprachbarrieren! ⚡🤖 Mit modernster KI übersetzen wir alle Inhalte in Echtzeit – für weltweite Gespräche in deiner Muttersprache! 💬🚀',
                                    'pt-BR':
                                        '🌎✨XEO OS quebra barreiras linguísticas! ⚡🤖 Com IA avançada, traduzimos instantaneamente para múltiplos idiomas, conectando o mundo na sua língua materna! 💬💫',
                                    'ko-KR':
                                        '🌏✨XEO OS, 언어 장벽을 허물다! ⚡🤖 최첨단 AI로 모든 콘텐츠를 실시간 번역, 모국어로 전 세계와 소통하세요! 💬✨',
                                },
                                locale,
                            )}
                            <br />
                            <Link
                                href={`/${locale}/about`}
                                className='text-white hover:text-white/80 hover:underline transition-all duration-200'
                            >
                                {lang(
                                    {
                                        'zh-CN': '> 关于我们',
                                        'en-US': '> About Us',
                                        'zh-TW': '> 關於我們',
                                        'es-ES': '> Acerca de nosotros',
                                        'fr-FR': '> À propos de nous',
                                        'ru-RU': '> О нас',
                                        'ja-JP': '> 私たちについて',
                                        'de-DE': '> Über uns',
                                        'pt-BR': '> Sobre nós',
                                        'ko-KR': '> 소개',
                                    },
                                    locale,
                                )}
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* 公告1 - 25% 宽度 */}
                <Card className='lg:col-span-1'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            📢{' '}
                            {lang(
                                {
                                    'zh-CN': '我们所倡导的',
                                    'en-US': 'What We Advocate',
                                    'zh-TW': '我們所倡導的',
                                    'es-ES': 'Lo que defendemos',
                                    'fr-FR': 'Ce que nous prônons',
                                    'ru-RU': 'То, что мы защищаем',
                                    'ja-JP': '私たちが提唱すること',
                                    'de-DE': 'Was wir befürworten',
                                    'pt-BR': 'O que defendemos',
                                    'ko-KR': '우리가 지지하는 것',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-sm text-muted-foreground'>
                            {lang(
                                {
                                    'zh-CN':
                                        '💡💬 我们鼓励用Emoji与文字（而非图片）表达观点——它们是跨越文化的通用符号！✨',
                                    'en-US':
                                        '💡✍️ Express ideas through Emojis & text (not images) – the universal language of digital culture! ✨',
                                    'zh-TW':
                                        '💡💬 擁抱Emoji與文字（非圖片）表達觀點——跨文化的數位共通語！✨',
                                    'es-ES':
                                        '💡✍️ ¡Expresa ideas con Emojis y texto (no imágenes), el lenguaje universal digital! ✨',
                                    'fr-FR':
                                        "💡✍️ Exprimez-vous par Emojis & texte (pas d'images) – le langage universel numérique ! ✨",
                                    'ru-RU':
                                        '💡✍️ Выражайте идеи через Emoji и текст (не картинки) – универсальный цифровой язык! ✨',
                                    'ja-JP':
                                        '💡✍️ 画像ではなく絵文字＆テキストで表現——デジタル時代の共通言語！ ✨',
                                    'de-DE':
                                        '💡✍️ Drücke Ideen durch Emojis & Text aus (keine Bilder) – die universelle Sprache der Digitalkultur! ✨',
                                    'pt-BR':
                                        '💡✍️ Expresse ideias com Emojis & texto (não imagens) – a linguagem universal digital! ✨',
                                    'ko-KR':
                                        '💡✍️ 이모지와 텍스트(이미지 제외)로 아이디어 표현하기——디지털 문화의 보편적 언어! ✨',
                                },
                                locale,
                            )}
                        </p>
                    </CardContent>
                </Card>

                {/* 2 - 25% 宽度 */}
                <Card className='lg:col-span-1'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            📋{' '}
                            {lang(
                                {
                                    'zh-CN': '服务条款更新',
                                    'en-US': 'Terms of Service Update',
                                    'zh-TW': '服務條款更新',
                                    'es-ES': 'Actualización de Términos de Servicio',
                                    'fr-FR': 'Mise à jour des Conditions de Service',
                                    'ru-RU': 'Обновление Условий Обслуживания',
                                    'ja-JP': 'サービス利用規約更新',
                                    'de-DE': 'Aktualisierung der Nutzungsbedingungen',
                                    'pt-BR': 'Atualização dos Termos de Serviço',
                                    'ko-KR': '서비스 약관 업데이트',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-sm text-muted-foreground'>
                            {lang(
                                {
                                    'zh-CN': `我们于2025年6月10日更改了服务条款与隐私策略。`,
                                    'en-US':
                                        'We updated our Terms of Service and Privacy Policy on June 10, 2025.',
                                    'zh-TW': '我們於2025年6月10日更改了服務條款與隱私策略。',
                                    'es-ES':
                                        'Actualizamos nuestros Términos de Servicio y Política de Privacidad el 10 de junio de 2025.',
                                    'fr-FR':
                                        'Nous avons mis à jour nos Conditions de Service et notre Politique de Confidentialité le 10 juin 2025.',
                                    'ru-RU':
                                        'Мы обновили наши Условия Обслуживания и Политику Конфиденциальности 10 июня 2025 года.',
                                    'ja-JP':
                                        '2025年6月10日にサービス利用規約とプライバシーポリシーを更新しました。',
                                    'de-DE':
                                        'Wir haben unsere Nutzungsbedingungen und Datenschutzrichtlinien am 10. Juni 2025 aktualisiert.',
                                    'pt-BR':
                                        'Atualizamos nossos Termos de Serviço e Política de Privacidade em 10 de junho de 2025.',
                                    'ko-KR':
                                        '2025년 6월 10일에 서비스 약관과 개인정보 처리방침을 업데이트했습니다.',
                                },
                                locale,
                            )}{' '}
                            <br />
                            <Link
                                href={`/${locale}/policies/privacy-policy`}
                                className='text-primary hover:text-primary/80 hover:underline transition-all duration-200'
                            >
                                {lang(
                                    {
                                        'zh-CN': '> 查看',
                                        'en-US': '> View',
                                        'zh-TW': '> 查看',
                                        'es-ES': '> Ver',
                                        'fr-FR': '> Voir',
                                        'ru-RU': '> Посмотреть',
                                        'ja-JP': '> 表示',
                                        'de-DE': '> Anzeigen',
                                        'pt-BR': '> Visualizar',
                                        'ko-KR': '> 보기',
                                    },
                                    locale,
                                )}
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 移动版：使用Carousel */}
            <div className='block lg:hidden mb-6'>
                <Carousel className='w-full'>
                    <CarouselContent className='-ml-2 md:-ml-4'>
                        {/* 页面介绍 */}
                        <CarouselItem className='pl-2 md:pl-4 basis-[85%] sm:basis-[90%]'>
                            <Card className='bg-primary h-full'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg sm:text-xl font-bold'>
                                        {"XEO OS - Xchange Everyone's Opinion"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-sm text-white leading-relaxed'>
                                        {lang(
                                            {
                                                'zh-CN':
                                                    '🌍✨XEO OS 致力于打破语言壁垒！🚧💬 借助尖端AI技术，我们实时翻译每篇内容，支持多语言互译，让全球用户都能用最熟悉的母语畅快交流～🌐💖',
                                                'en-US':
                                                    '🌎✨XEO OS smashes language barriers! ⚡🤖 Using cutting-edge AI, we instantly translate every post into multiple languages, empowering global conversations in your native tongue! 💬🌍',
                                                'zh-TW':
                                                    '🌏✨XEO OS 全力擊破語言高牆！🚀💬 運用頂尖AI技術，即時翻譯每篇內容，讓全球用戶用最熟悉的母語無障礙交流～💫❤️',
                                                'es-ES':
                                                    '🌎✨¡XEO OS rompe las barreras idiomáticas! ⚡🤖 Con IA de vanguardia, traducimos al instante todo a múltiples idiomas para conversaciones globales en tu lengua materna. 💬💫',
                                                'fr-FR':
                                                    '🌍✨XEO OS brise les barrières linguistiques ! ⚡🤖 Grâce à une IA de pointe, nous traduisons instantanément chaque contenu en plusieurs langues pour des échanges mondiaux dans votre langue ! 💬✨',
                                                'ru-RU':
                                                    '🌍✨XEO OS разрушает языковые барьеры! ⚡🤖 С помощью передового ИИ мгновенно переводим любой контент, открывая глобальное общение на родном языке! 💬🚀',
                                                'ja-JP':
                                                    '🌏✨XEO OSが言語の壁を打破！⚡🤖 最先端AIで全コンテンツを多言語翻訳。母国語で世界と繋がるグローバルコミュニケーションを実現💬🌸',
                                                'de-DE':
                                                    '🌍✨XEO OS durchbricht Sprachbarrieren! ⚡🤖 Mit modernster KI übersetzen wir alle Inhalte in Echtzeit – für weltweite Gespräche in deiner Muttersprache! 💬🚀',
                                                'pt-BR':
                                                    '🌎✨XEO OS quebra barreiras linguísticas! ⚡🤖 Com IA avançada, traduzimos instantaneamente para múltiplos idiomas, conectando o mundo na sua língua materna! 💬💫',
                                                'ko-KR':
                                                    '🌏✨XEO OS, 언어 장벽을 허물다! ⚡🤖 최첨단 AI로 모든 콘텐츠를 실시간 번역, 모국어로 전 세계와 소통하세요! 💬✨',
                                            },
                                            locale,
                                        )}
                                        <br />
                                        <Link
                                            href={`/${locale}/about`}
                                            className='text-white hover:text-white/80 hover:underline transition-all duration-200'
                                        >
                                            {lang(
                                                {
                                                    'zh-CN': '> 关于我们',
                                                    'en-US': '> About Us',
                                                    'zh-TW': '> 關於我們',
                                                    'es-ES': '> Acerca de nosotros',
                                                    'fr-FR': '> À propos de nous',
                                                    'ru-RU': '> О нас',
                                                    'ja-JP': '> 私たちについて',
                                                    'de-DE': '> Über uns',
                                                    'pt-BR': '> Sobre nós',
                                                    'ko-KR': '> 소개',
                                                },
                                                locale,
                                            )}
                                        </Link>
                                    </p>
                                </CardContent>
                            </Card>
                        </CarouselItem>

                        {/* 我们所倡导的 */}
                        <CarouselItem className='pl-2 md:pl-4 basis-[85%] sm:basis-[90%]'>
                            <Card className='h-full'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        📢{' '}
                                        {lang(
                                            {
                                                'zh-CN': '我们所倡导的',
                                                'en-US': 'What We Advocate',
                                                'zh-TW': '我們所倡導的',
                                                'es-ES': 'Lo que defendemos',
                                                'fr-FR': 'Ce que nous prônons',
                                                'ru-RU': 'То, что мы защищаем',
                                                'ja-JP': '私たちが提唱すること',
                                                'de-DE': 'Was wir befürworten',
                                                'pt-BR': 'O que defendemos',
                                                'ko-KR': '우리가 지지하는 것',
                                            },
                                            locale,
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-sm text-muted-foreground'>
                                        {lang(
                                            {
                                                'zh-CN':
                                                    '💡💬 我们鼓励用Emoji与文字（而非图片）表达观点——它们是跨越文化的通用符号！✨',
                                                'en-US':
                                                    '💡✍️ Express ideas through Emojis & text (not images) – the universal language of digital culture! ✨',
                                                'zh-TW':
                                                    '💡💬 擁抱Emoji與文字（非圖片）表達觀點——跨文化的數位共通語！✨',
                                                'es-ES':
                                                    '💡✍️ ¡Expresa ideas con Emojis y texto (no imágenes), el lenguaje universal digital! ✨',
                                                'fr-FR':
                                                    "💡✍️ Exprimez-vous par Emojis & texte (pas d'images) – le langage universel numérique ! ✨",
                                                'ru-RU':
                                                    '💡✍️ Выражайте идеи через Emoji и текст (не картинки) – универсальный цифровой язык! ✨',
                                                'ja-JP':
                                                    '💡✍️ 画像ではなく絵文字＆テキストで表現——デジタル時代の共通言語！ ✨',
                                                'de-DE':
                                                    '💡✍️ Drücke Ideen durch Emojis & Text aus (keine Bilder) – die universelle Sprache der Digitalkultur! ✨',
                                                'pt-BR':
                                                    '💡✍️ Expresse ideias com Emojis & texto (não imagens) – a linguagem universal digital! ✨',
                                                'ko-KR':
                                                    '💡✍️ 이모지와 텍스트(이미지 제외)로 아이디어 표현하기——디지털 문화의 보편적 언어! ✨',
                                            },
                                            locale,
                                        )}
                                    </p>
                                </CardContent>
                            </Card>
                        </CarouselItem>

                        {/* 服务条款更新 */}
                        <CarouselItem className='pl-2 md:pl-4 basis-[85%] sm:basis-[90%]'>
                            <Card className='h-full'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        📋{' '}
                                        {lang(
                                            {
                                                'zh-CN': '服务条款更新',
                                                'en-US': 'Terms of Service Update',
                                                'zh-TW': '服務條款更新',
                                                'es-ES': 'Actualización de Términos de Servicio',
                                                'fr-FR': 'Mise à jour des Conditions de Service',
                                                'ru-RU': 'Обновление Условий Обслуживания',
                                                'ja-JP': 'サービス利用規約更新',
                                                'de-DE': 'Aktualisierung der Nutzungsbedingungen',
                                                'pt-BR': 'Atualização dos Termos de Serviço',
                                                'ko-KR': '서비스 약관 업데이트',
                                            },
                                            locale,
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-sm text-muted-foreground'>
                                        {lang(
                                            {
                                                'zh-CN': `我们于2025年6月10日更改了服务条款与隐私策略。`,
                                                'en-US':
                                                    'We updated our Terms of Service and Privacy Policy on June 10, 2025.',
                                                'zh-TW':
                                                    '我們於2025年6月10日更改了服務條款與隱私策略。',
                                                'es-ES':
                                                    'Actualizamos nuestros Términos de Servicio y Política de Privacidad el 10 de junio de 2025.',
                                                'fr-FR':
                                                    'Nous avons mis à jour nos Conditions de Service et notre Politique de Confidentialité le 10 juin 2025.',
                                                'ru-RU':
                                                    'Мы обновили наши Условия Обслуживания и Политику Конфиденциальности 10 июня 2025 года.',
                                                'ja-JP':
                                                    '2025年6月10日にサービス利用規約とプライバシーポリシーを更新しました。',
                                                'de-DE':
                                                    'Wir haben unsere Nutzungsbedingungen und Datenschutzrichtlinien am 10. Juni 2025 aktualisiert.',
                                                'pt-BR':
                                                    'Atualizamos nossos Termos de Serviço e Política de Privacidade em 10 de junho de 2025.',
                                                'ko-KR':
                                                    '2025년 6월 10일에 서비스 약관과 개인정보 처리방침을 업데이트했습니다.',
                                            },
                                            locale,
                                        )}{' '}
                                        <br />
                                        <Link
                                            href={`/${locale}/policies/privacy-policy`}
                                            className='text-primary hover:text-primary/80 hover:underline transition-all duration-200'
                                        >
                                            {lang(
                                                {
                                                    'zh-CN': '> 查看',
                                                    'en-US': '> View',
                                                    'zh-TW': '> 查看',
                                                    'es-ES': '> Ver',
                                                    'fr-FR': '> Voir',
                                                    'ru-RU': '> Посмотреть',
                                                    'ja-JP': '> 表示',
                                                    'de-DE': '> Anzeigen',
                                                    'pt-BR': '> Visualizar',
                                                    'ko-KR': '> 보기',
                                                },
                                                locale,
                                            )}
                                        </Link>
                                    </p>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className='left-2' />
                    <CarouselNext className='right-2' />
                </Carousel>
            </div>

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
                                                        {post.topics.length > 0 && (
                                                            <>
                                                                {post.topics
                                                                    .slice(0, 2)
                                                                    .map((topic) => (
                                                                        <Link
                                                                            key={topic.name}
                                                                            href={`/${locale}/topic/${topic.name}`}
                                                                            className='hover:opacity-80 transition-opacity'
                                                                            title={`${lang(
                                                                                {
                                                                                    'zh-CN': '主题',
                                                                                    'en-US':
                                                                                        'Topic',
                                                                                    'zh-TW': '主題',
                                                                                    'es-ES': 'Tema',
                                                                                    'fr-FR':
                                                                                        'Sujet',
                                                                                    'ru-RU': 'Тема',
                                                                                    'ja-JP':
                                                                                        'トピック',
                                                                                    'de-DE':
                                                                                        'Thema',
                                                                                    'pt-BR':
                                                                                        'Tópico',
                                                                                    'ko-KR': '주제',
                                                                                },
                                                                                locale,
                                                                            )}: ${getLocalizedTopicName(topic, locale)}`}
                                                                            rel='noopener'
                                                                        >
                                                                            <Badge
                                                                                variant='secondary'
                                                                                className='text-xs px-1 py-0.5 h-auto flex-shrink-0'
                                                                            >
                                                                                <span className='mr-0.5'>
                                                                                    {topic.emoji}
                                                                                </span>
                                                                                <span className='hidden sm:inline text-xs'>
                                                                                    {getLocalizedTopicName(
                                                                                        topic,
                                                                                        locale,
                                                                                    )}
                                                                                </span>
                                                                            </Badge>
                                                                        </Link>
                                                                    ))}
                                                                {post.topics.length > 2 && (
                                                                    <span className='text-xs text-muted-foreground flex-shrink-0'>
                                                                        +{post.topics.length - 2}
                                                                    </span>
                                                                )}
                                                                <span className='flex-shrink-0'>
                                                                    •
                                                                </span>
                                                            </>
                                                        )}
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

                    {/* 热门主题 */}
                    {topTopicsArray.length > 0 && (
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Hash className='h-5 w-5' />
                                    {lang(
                                        {
                                            'zh-CN': '本页热门主题',
                                            'en-US': 'Popular Topics',
                                            'zh-TW': '本頁熱門主題',
                                            'es-ES': 'Temas populares',
                                            'fr-FR': 'Sujets populaires',
                                            'ru-RU': 'Популярные темы',
                                            'ja-JP': '人気のトピック',
                                            'de-DE': 'Beliebte Themen',
                                            'pt-BR': 'Tópicos populares',
                                            'ko-KR': '인기 주제',
                                        },
                                        locale,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                {topTopicsArray.map(({ topic, count }) => (
                                    <div
                                        key={topic.name}
                                        className='flex items-center justify-between'
                                    >
                                        <Link
                                            href={`/${locale}/topic/${topic.name}`}
                                            className='hover:opacity-80 transition-opacity'
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
                                            )}: ${getLocalizedTopicName(topic, locale)}`}
                                            rel='noopener'
                                        >
                                            <Badge
                                                variant='secondary'
                                                className='flex items-center gap-1'
                                            >
                                                <span>{topic.emoji}</span>
                                                <span className='text-xs'>
                                                    {getLocalizedTopicName(topic, locale)}
                                                </span>
                                            </Badge>
                                        </Link>
                                        <span className='text-xs text-muted-foreground'>
                                            {count}
                                        </span>
                                    </div>
                                ))}
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
