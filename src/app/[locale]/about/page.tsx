import '@/app/globals.css';
import { Metadata } from 'next';
import lang from '@/lib/lang';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Globe,
    Shield,
    MessageSquare,
    Heart,
    ExternalLink,
    Zap,
    Clock,
    Star,
    Rocket,
    Code,
    Coffee,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';
import EmojiBackground from '@/components/EmojiBackground';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({
    params,
}: {
    params: { locale: string };
}): Promise<Metadata> {
    const locale = params.locale || 'en-US';

    const title = lang(
        {
            'zh-CN': '关于我们 | XEO OS - 交流每个人的观点',
            'en-US': "About Us | XEO OS - Exchange Everyone's Views",
            'ja-JP': '私たちについて | XEO OS - みんなの意見を交換する',
            'ko-KR': '公司 소개 | XEO OS - 모두의 의견을 교환하다',
            'fr-FR': 'À propos de nous | XEO OS - Échanger les opinions de chacun',
            'es-ES': 'Acerca de nosotros | XEO OS - Intercambiar las opiniones de todos',
            'de-DE': 'Über uns | XEO OS - Meinungen austauschen',
            'pt-BR': 'Sobre Nós | XEO OS - Trocar as Opiniões de Todos',
            'ru-RU': 'О нас | XEO OS - Обмен мнениями',
            'zh-TW': '關於我們 | XEO OS - 交流每個人的觀點',
        },
        locale,
    );
    const description = lang(
        {
            'zh-CN':
                '了解 XEO OS 的使命、愿景和价值观。我们致力于打造一个开放、包容、安全的交流平台。',
            'en-US':
                "Learn about XEO OS's mission, vision, and values. We are committed to creating an open, inclusive, and secure communication platform.",
            'ja-JP':
                'XEO OSの使命、ビジョン、価値観について学びましょう。私たちはオープンで包括的で安全なコミュニケーションプラットフォームの構築に取り組んでいます。',
            'ko-KR':
                'XEO OS의 사명, 비전, 가치관에 대해 알아보세요. 우리는 열린, 포용적이고 안전한 소통 플랫폼을 만들기 위해 노력하고 있습니다.',
            'fr-FR':
                'Découvrez la mission, la vision et les valeurs de XEO OS. Nous nous engageons à créer une plateforme de communication ouverte, inclusive et sécurisée.',
            'es-ES':
                'Conozca la misión, visión y valores de XEO OS. Estamos comprometidos a crear una plataforma de comunicación abierta, inclusiva y segura.',
            'de-DE':
                "Erfahren Sie mehr über XEO OS's Mission, Vision und Werte. Wir sind der Schaffung einer offenen, inklusiven und sicheren Kommunikationsplattform verpflichtet.",
            'pt-BR':
                'Conheça a missão, visão e valores do XEO OS. Estamos comprometidos em criar uma plataforma de comunicação aberta, inclusiva e segura.',
            'ru-RU':
                'Узнайте о миссии, видении и ценностях XEO OS. Мы стремимся создать открытую, инклюзивную и безопасную платформу для общения.',
            'zh-TW':
                '了解 XEO OS 的使命、願景和價值觀。我們致力於打造一個開放、包容、安全的交流平台。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default function AboutPage({ params }: Props) {
    const locale = params.locale || 'en-US';

    const features = [
        {
            icon: <Globe className='h-6 w-6' />,
            title: lang(
                {
                    'zh-CN': 'AI 智能翻译',
                    'en-US': 'AI-Powered Translation',
                    'ja-JP': 'AI翻訳',
                    'ko-KR': 'AI 번역',
                    'fr-FR': 'Traduction IA',
                    'es-ES': 'Traducción IA',
                    'de-DE': 'KI-Übersetzung',
                    'pt-BR': 'Tradução por IA',
                    'ru-RU': 'ИИ-перевод',
                    'zh-TW': 'AI 智慧翻譯',
                },
                locale,
            ),
            description: lang(
                {
                    'zh-CN': '每个帖子和回复都会自动翻译成您的母语，让全球交流变得无障碍',
                    'en-US':
                        'Every post and reply is automatically translated into your native language, making global communication barrier-free',
                    'ja-JP':
                        'すべての投稿と返信が自動的にあなたの母国語に翻訳され、グローバルなコミュニケーションを障壁なく実現',
                    'ko-KR':
                        '모든 게시물과 댓글이 자동으로 모국어로 번역되어 전 세계 소통을 원활하게 합니다',
                    'fr-FR':
                        'Chaque publication et réponse est automatiquement traduite dans votre langue maternelle, rendant la communication mondiale sans barrières',
                    'es-ES':
                        'Cada publicación y respuesta se traduce automáticamente a su idioma nativo, haciendo que la comunicación global sea sin barreras',
                    'de-DE':
                        'Jeder Beitrag und jede Antwort wird automatisch in Ihre Muttersprache übersetzt, wodurch globale Kommunikation barrierefrei wird',
                    'pt-BR':
                        'Cada postagem e resposta é automaticamente traduzida para seu idioma nativo, tornando a comunicação global sem barreiras',
                    'ru-RU':
                        'Каждый пост и ответ автоматически переводится на ваш родной язык, делая глобальное общение беспрепятственным',
                    'zh-TW': '每個帖子和回覆都會自動翻譯成您的母語，讓全球交流變得無障礙',
                },
                locale,
            ),
        },
        {
            icon: <Users className='h-6 w-6' />,
            title: lang(
                {
                    'zh-CN': '纯净体验',
                    'en-US': 'Clean Experience',
                    'ja-JP': 'クリーンな体験',
                    'ko-KR': '깔끔한 경험',
                    'fr-FR': 'Expérience pure',
                    'es-ES': 'Experiencia limpia',
                    'de-DE': 'Saubere Erfahrung',
                    'pt-BR': 'Experiência Limpa',
                    'ru-RU': 'Чистый опыт',
                    'zh-TW': '純淨體驗',
                },
                locale,
            ),
            description: lang(
                {
                    'zh-CN': '承诺永远不添加广告，不使用算法推荐，只为您提供纯粹的交流环境',
                    'en-US':
                        'We promise never to add advertisements or use algorithmic recommendations, providing you with a pure communication environment',
                    'ja-JP':
                        '広告を一切追加せず、アルゴリズム推薦も使用しない、純粹なコミュニケーション環境を提供することをお約束します',
                    'ko-KR':
                        '광고를 절대 추가하지 않고 알고리즘 추천도 사용하지 않아 순수한 소통 환경을 제공합니다',
                    'fr-FR':
                        "Nous promettons de ne jamais ajouter de publicités ni d'utiliser de recommandations algorithmiques, vous offrant un environnement de communication pur",
                    'es-ES':
                        'Prometemos nunca agregar anuncios ni usar recomendaciones algorítmicas, proporcionándole un entorno de comunicación puro',
                    'de-DE':
                        'Wir versprechen, niemals Werbung hinzuzufügen oder algorithmische Empfehlungen zu verwenden, und bieten Ihnen eine reine Kommunikationsumgebung',
                    'pt-BR':
                        'Prometemos nunca adicionar anúncios ou usar recomendações algorítmicas, fornecendo um ambiente de comunicação puro',
                    'ru-RU':
                        'Мы обещаем никогда не добавлять рекламу и не использовать алгоритмические рекомендации, предоставляя вам чистую среду общения',
                    'zh-TW': '承諾永遠不添加廣告，不使用演算法推薦，只為您提供純粹的交流環境',
                },
                locale,
            ),
        },
        {
            icon: <Shield className='h-6 w-6' />,
            title: lang(
                {
                    'zh-CN': '专注文字',
                    'en-US': 'Text-Focused',
                    'ja-JP': 'テキスト重視',
                    'ko-KR': '텍스트 중심',
                    'fr-FR': 'Axé sur le texte',
                    'es-ES': 'Enfocado en texto',
                    'de-DE': 'Textfokussiert',
                    'pt-BR': 'Focado em Texto',
                    'ru-RU': 'Ориентированность на текст',
                    'zh-TW': '專注文字',
                },
                locale,
            ),
            description: lang(
                {
                    'zh-CN': '专注于文字内容交流，创造更深度的思想碰撞和观点交换',
                    'en-US':
                        'Focus on text-based communication to create deeper intellectual exchanges and perspective sharing',
                    'ja-JP':
                        'テキストベースのコミュニケーションに焦点を当て、より深い知的交流と視点の共有を実現',
                    'ko-KR':
                        '텍스트 기반 소통에 집중하여 더 깊은 지적 교류와 관점 공유를 만들어갑니다',
                    'fr-FR':
                        'Se concentrer sur la communication textuelle pour créer des échanges intellectuels plus profonds et un partage de perspectives',
                    'es-ES':
                        'Enfocarse en la comunicación basada en texto para crear intercambios intelectuales más profundos y compartir perspectivas',
                    'de-DE':
                        'Fokus auf textbasierte Kommunikation, um tiefere intellektuelle Austausche und Perspektivenaustausch zu schaffen',
                    'pt-BR':
                        'Foco na comunicação baseada em texto para criar trocas intelectuais mais profundas e compartilhamento de perspectivas',
                    'ru-RU':
                        'Сосредоточенность на текстовом общении для создания более глубокого интеллектуального обмена и обмена мнениями',
                    'zh-TW': '專注於文字內容交流，創造更深度的思想碰撞和觀點交換',
                },
                locale,
            ),
        },
    ];

    const stats = [
        {
            icon: <Users className='h-8 w-8' />,
            value: '50K+',
            label: lang(
                {
                    'zh-CN': '全球用户',
                    'en-US': 'Global Users',
                    'ja-JP': 'グローバルユーザー',
                    'ko-KR': '글로벌 사용자',
                    'fr-FR': 'Utilisateurs mondiaux',
                    'es-ES': 'Usuarios globales',
                    'de-DE': 'Globale Nutzer',
                    'pt-BR': 'Usuários Globais',
                    'ru-RU': 'Глобальные пользователи',
                    'zh-TW': '全球用戶',
                },
                locale,
            ),
        },
        {
            icon: <Globe className='h-8 w-8' />,
            value: '100+',
            label: lang(
                {
                    'zh-CN': '支持语言',
                    'en-US': 'Languages Supported',
                    'ja-JP': 'サポート言語',
                    'ko-KR': '지원 언어',
                    'fr-FR': 'Langues prises en charge',
                    'es-ES': 'Idiomas compatibles',
                    'de-DE': 'Unterstützte Sprachen',
                    'pt-BR': 'Idiomas Suportados',
                    'ru-RU': 'Поддерживаемые языки',
                    'zh-TW': '支援語言',
                },
                locale,
            ),
        },
        {
            icon: <MessageSquare className='h-8 w-8' />,
            value: '1M+',
            label: lang(
                {
                    'zh-CN': '消息翻译',
                    'en-US': 'Messages Translated',
                    'ja-JP': '翻訳されたメッセージ',
                    'ko-KR': '번역된 메시지',
                    'fr-FR': 'Messages traduits',
                    'es-ES': 'Mensajes traducidos',
                    'de-DE': 'Übersetzte Nachrichten',
                    'pt-BR': 'Mensagens Traduzidas',
                    'ru-RU': 'Переведенные сообщения',
                    'zh-TW': '訊息翻譯',
                },
                locale,
            ),
        },
        {
            icon: <Clock className='h-8 w-8' />,
            value: '24/7',
            label: lang(
                {
                    'zh-CN': '在线服务',
                    'en-US': 'Online Service',
                    'ja-JP': 'オンラインサービス',
                    'ko-KR': '온라인 서비스',
                    'fr-FR': 'Service en ligne',
                    'es-ES': 'Servicio en línea',
                    'de-DE': 'Online-Service',
                    'pt-BR': 'Serviço Online',
                    'ru-RU': 'Онлайн сервис',
                    'zh-TW': '線上服務',
                },
                locale,
            ),
        },
    ];

    const timeline = [
        {
            year: '2025',
            title: lang(
                {
                    'zh-CN': 'XEO OS 诞生',
                    'en-US': 'XEO OS Launch',
                    'ja-JP': 'XEO OS 誕生',
                    'ko-KR': 'XEO OS 출시',
                    'fr-FR': 'Lancement de XEO OS',
                    'es-ES': 'Lanzamiento de XEO OS',
                    'de-DE': 'XEO OS Start',
                    'pt-BR': 'Lançamento do XEO OS',
                    'ru-RU': 'Запуск XEO OS',
                    'zh-TW': 'XEO OS 誕生',
                },
                locale,
            ),
            description: lang(
                {
                    'zh-CN': '开始构建全球首个AI驱动的多语言论坛平台',
                    'en-US':
                        "Started building the world's first AI-driven multilingual forum platform",
                    'ja-JP': '世界初のAI駆動多言語フォーラムプラットフォームの構築を開始',
                    'ko-KR': '세계 최초의 AI 기반 다국어 포럼 플랫폼 구축 시작',
                    'fr-FR':
                        "Début de la construction de la première plateforme de forum multilingue pilotée par l'IA au monde",
                    'es-ES':
                        'Comenzó a construir la primera plataforma de foro multilingüe impulsada por IA del mundo',
                    'de-DE':
                        'Begann mit dem Aufbau der weltweit ersten KI-gesteuerten mehrsprachigen Forumsplattform',
                    'pt-BR':
                        'Começou a construir a primeira plataforma de fórum multilíngue orientada por IA do mundo',
                    'ru-RU':
                        'Начали создание первой в мире многоязычной форумной платформы на основе ИИ',
                    'zh-TW': '開始構建全球首個AI驅動的多語言論壇平台',
                },
                locale,
            ),
        },
    ];

    const technologies = [
        {
            name: 'Next.js',
            icon: <Code className='h-6 w-6' />,
            description: lang(
                {
                    'zh-CN': '现代化的React框架',
                    'en-US': 'Modern React Framework',
                    'ja-JP': 'モダンなReactフレームワーク',
                    'ko-KR': '현대적인 React 프레임워크',
                    'fr-FR': 'Framework React moderne',
                    'es-ES': 'Framework React moderno',
                    'de-DE': 'Modernes React Framework',
                    'pt-BR': 'Framework React Moderno',
                    'ru-RU': 'Современный React фреймворк',
                    'zh-TW': '現代化的React框架',
                },
                locale,
            ),
        },
        {
            name: 'AI Translation',
            icon: <Zap className='h-6 w-6' />,
            description: lang(
                {
                    'zh-CN': '智能翻译引擎',
                    'en-US': 'Intelligent Translation Engine',
                    'ja-JP': 'インテリジェント翻訳エンジン',
                    'ko-KR': '지능형 번역 엔진',
                    'fr-FR': 'Moteur de traduction intelligent',
                    'es-ES': 'Motor de traducción inteligente',
                    'de-DE': 'Intelligente Übersetzungsmaschine',
                    'pt-BR': 'Motor de Tradução Inteligente',
                    'ru-RU': 'Интеллектуальный движок перевода',
                    'zh-TW': '智慧翻譯引擎',
                },
                locale,
            ),
        },
        {
            name: 'TypeScript',
            icon: <Shield className='h-6 w-6' />,
            description: lang(
                {
                    'zh-CN': '类型安全的开发',
                    'en-US': 'Type-safe Development',
                    'ja-JP': '型安全な開発',
                    'ko-KR': '타입 안전한 개발',
                    'fr-FR': 'Développement type-safe',
                    'es-ES': 'Desarrollo type-safe',
                    'de-DE': 'Typsichere Entwicklung',
                    'pt-BR': 'Desenvolvimento Type-safe',
                    'ru-RU': 'Типобезопасная разработка',
                    'zh-TW': '類型安全的開發',
                },
                locale,
            ),
        },
    ];

    return (
        <div className='container mx-auto px-4 py-8 max-w-6xl'>
            <div className='space-y-8'>
                <div className='relative overflow-hidden shadow-xl rounded-lg h-[200px]'>
                    <EmojiBackground primaryColor='#f0b100' />
                    <div className='absolute inset-0 flex items-center justify-center z-10'>
                        <div className='text-center space-y-2'>
                            <h1 className='text-4xl font-bold text-white drop-shadow-lg'>
                                {lang(
                                    {
                                        'zh-CN': 'XEO OS',
                                        'en-US': 'XEO OS',
                                        'ja-JP': 'XEO OS',
                                        'ko-KR': 'XEO OS',
                                        'fr-FR': 'XEO OS',
                                        'es-ES': 'XEO OS',
                                        'de-DE': 'XEO OS',
                                        'pt-BR': 'XEO OS',
                                        'ru-RU': 'XEO OS',
                                        'zh-TW': 'XEO OS',
                                    },
                                    locale,
                                )}
                            </h1>
                            <p className='text-lg text-white/90 drop-shadow'>
                                {lang(
                                    {
                                        'zh-CN': '交流每个人的观点',
                                        'en-US': "Exchange Everyone's Views",
                                        'ja-JP': 'みんなの意見を交換する',
                                        'ko-KR': '모두의 의견을 교환하다',
                                        'fr-FR': 'Échanger les opinions de chacun',
                                        'es-ES': 'Intercambiar las opiniones de todos',
                                        'de-DE': 'Meinungen austauschen',
                                        'pt-BR': 'Trocar as Opiniões de Todos',
                                        'ru-RU': 'Обмен мнениями',
                                        'zh-TW': '交流每個人的觀點',
                                    },
                                    locale,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {stats.map((stat, index) => (
                        <Card
                            key={index}
                            className='text-center p-6 hover:shadow-lg transition-all hover:scale-105'
                        >
                            <CardContent className='space-y-2 p-0'>
                                <div className='flex justify-center text-primary mb-2'>
                                    {stat.icon}
                                </div>
                                <div className='text-3xl font-bold text-primary'>{stat.value}</div>
                                <div className='text-sm text-muted-foreground'>{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main About Card */}
                <Card className='shadow-lg'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-2xl'>
                            <Heart className='h-7 w-7' />
                            {lang(
                                {
                                    'zh-CN': '关于 XEO OS',
                                    'en-US': 'About XEO OS',
                                    'ja-JP': 'XEO OSについて',
                                    'ko-KR': 'XEO OS 소개',
                                    'fr-FR': 'À propos de XEO OS',
                                    'es-ES': 'Acerca de XEO OS',
                                    'de-DE': 'Über XEO OS',
                                    'pt-BR': 'Sobre o XEO OS',
                                    'ru-RU': 'О XEO OS',
                                    'zh-TW': '關於 XEO OS',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* ...existing prose content... */}
                        <div className='prose prose-base prose-slate dark:prose-invert max-w-none'>
                            <p className='text text-muted-foreground leading-relaxed'>
                                {lang(
                                    {
                                        'zh-CN':
                                            "XEO OS（Xchange Everyone's Opinion）是一个 AI 驱动的全球性综合论坛平台。我们的使命是通过先进的人工智能翻译技术，打破语言障碍，让世界各地的人们都能用母语自由地表达观点、分享想法。",
                                        'en-US':
                                            "XEO OS (Xchange Everyone's Opinion) is an AI-driven global comprehensive forum platform. Our mission is to break down language barriers through advanced artificial intelligence translation technology, allowing people from around the world to freely express opinions and share ideas in their native language.",
                                        'ja-JP':
                                            "XEO OS（Xchange Everyone's Opinion）は、AI駆動のグローバル総合フォーラムプラットフォームです。先進的な人工知能翻訳技術により言語の壁を打ち破り、世界中の人々が母国語で自由に意見を表現し、アイデアを共有できるようにすることが私たちの使命です。",
                                        'ko-KR':
                                            "XEO OS (Xchange Everyone's Opinion)는 AI 기반의 글로벌 종합 포럼 플랫폼입니다. 첨단 인공지능 번역 기술을 통해 언어 장벽을 허물고, 전 세계 사람들이 모국어로 자유롭게 의견을 표현하고 아이디어를 공유할 수 있도록 하는 것이 우리의 사명입니다.",
                                        'fr-FR':
                                            "XEO OS (Xchange Everyone's Opinion) est une plateforme de forum global complète alimentée par l'IA. Notre mission est de briser les barrières linguistiques grâce à une technologie de traduction par intelligence artificielle avancée, permettant aux gens du monde entier d'exprimer librement leurs opinions et de partager des idées dans leur langue maternelle.",
                                        'es-ES':
                                            "XEO OS (Xchange Everyone's Opinion) es una plataforma de foro global integral impulsada por IA. Nuestra misión es derribar las barreras del idioma a través de tecnología avanzada de traducción de inteligencia artificial, permitiendo que las personas de todo el mundo expresen libremente opiniones и compartan ideas en su idioma nativo.",
                                        'de-DE':
                                            "XEO OS (Xchange Everyone's Opinion) ist eine KI-gesteuerte globale umfassende Forumsplattform. Unsere Mission ist es, Sprachbarrieren durch fortschrittliche KI-Übersetzungstechnologie zu durchbrechen und Menschen aus aller Welt zu ermöglichen, frei Meinungen auszudrücken und Ideen in ihrer Muttersprache zu teilen.",
                                        'pt-BR':
                                            "XEO OS (Xchange Everyone's Opinion) é uma plataforma de fórum global abrangente alimentada por IA. Nossa missão é quebrar barreiras linguísticas através de tecnologia avançada de tradução por inteligência artificial, permitindo que pessoas de todo o mundo expressem livremente opiniões e compartilhem ideias em seu idioma nativo.",
                                        'ru-RU':
                                            "XEO OS (Xchange Everyone's Opinion) - это глобальная комплексная форумная платформа на основе ИИ. Наша миссия - разрушить языковые барьеры с помощью передовой технологии перевода искусственного интеллекта, позволяя людям со всего мира свободно выражать мнения и делиться идеями на своем родном языке.",
                                        'zh-TW':
                                            "XEO OS（Xchange Everyone's Opinion）是一個 AI 驅動的全球性綜合論壇平台。我們的使命是透過先進的人工智慧翻譯技術，打破語言障礙，讓世界各地的人們都能用母語自由地表達觀點、分享想法。",
                                    },
                                    locale,
                                )}
                            </p>

                            <p className='text-muted-foreground leading-relaxed'>
                                {lang(
                                    {
                                        'zh-CN':
                                            '在 XEO OS，每一个帖子和回复都会被自动翻译成其他用户的语言，确保每个人都能用最熟悉的语言阅读和理解来自全球的内容。我们专注于文字交流，相信深度的思想交流胜过浮躁的图像刷屏。',
                                        'en-US':
                                            "At XEO OS, every post and reply is automatically translated into other users' languages, ensuring everyone can read and understand global content in their most familiar language. We focus on text communication, believing that deep intellectual exchange is better than superficial image scrolling.",
                                        'ja-JP':
                                            'XEO OSでは、すべての投稿と返信が他のユーザーの言語に自動翻訳され、誰もが最も慣れ親しんだ言語でグローバルなコンテンツを読み理解できるようになります。私たちはテキストコミュニケーションに焦点を当て、深い知的交流が表面的な画像スクロールよりも優れていると信じています。',
                                        'ko-KR':
                                            'XEO OS에서는 모든 게시물과 댓글이 다른 사용자의 언어로 자동 번역되어, 모든 사람이 가장 친숙한 언어로 전 세계 콘텐츠를 읽고 이해할 수 있습니다. 우리는 텍스트 소통에 집중하며, 깊이 있는 지적 교류가 피상적인 이미지 스크롤보다 낫다고 믿습니다.',
                                        'fr-FR':
                                            "Chez XEO OS, chaque publication et réponse est automatiquement traduite dans les langues des autres utilisateurs, garantissant que chacun puisse lire et comprendre le contenu global dans sa langue la plus familière. Nous nous concentrons sur la communication textuelle, croyant que l'échange intellectuel profond est meilleur que le défilement superficiel d'images.",
                                        'es-ES':
                                            'En XEO OS, cada publicación y respuesta se traduce automáticamente a los idiomas de otros usuarios, asegurando que todos puedan leer y entender el contenido global en su idioma más familiar. Nos enfocamos en la comunicación textual, creyendo que el intercambio intelectual profundo es mejor que el desplazamiento superficial de imágenes.',
                                        'de-DE':
                                            'Bei XEO OS wird jeder Beitrag und jede Antwort automatisch in die Sprachen anderer Benutzer übersetzt, um sicherzustellen, dass jeder globale Inhalte in seiner vertrautesten Sprache lesen und verstehen kann. Wir konzentrieren uns auf Textkommunikation und glauben, dass tiefer intellektueller Austausch besser ist als oberflächliches Bildscrollen.',
                                        'pt-BR':
                                            'No XEO OS, cada postagem e resposta é automaticamente traduzida para os idiomas de outros usuários, garantindo que todos possam ler e entender conteúdo global em seu idioma mais familiar. Focamos na comunicação textual, acreditando que o intercâmbio intelectual profundo é melhor que o rolamento superficial de imagens.',
                                        'ru-RU':
                                            'В XEO OS каждый пост и ответ автоматически переводится на языки других пользователей, гарантируя, что каждый может читать и понимать глобальный контент на своем наиболее знакомом языке. Мы сосредоточены на текстовом общении, полагая, что глубокий интеллектуальный обмен лучше поверхностной прокрутки изображений.',
                                        'zh-TW':
                                            '在 XEO OS，每一個帖子和回覆都會被自動翻譯成其他用戶的語言，確保每個人都能用最熟悉的語言閱讀和理解來自全球的內容。我們專注於文字交流，相信深度的思想交流勝過浮躁的圖像刷屏。',
                                    },
                                    locale,
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Grid */}
                <Card className='shadow-lg'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl'>
                            <Star className='h-6 w-6' />
                            {lang(
                                {
                                    'zh-CN': '核心特性',
                                    'en-US': 'Core Features',
                                    'ja-JP': 'コア機能',
                                    'ko-KR': '핵심 기능',
                                    'fr-FR': 'Fonctionnalités principales',
                                    'es-ES': 'Características principales',
                                    'de-DE': 'Kernfunktionen',
                                    'pt-BR': 'Recursos Principais',
                                    'ru-RU': 'Основные функции',
                                    'zh-TW': '核心特性',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {features.map((feature, index) => (
                                <Card
                                    key={index}
                                    className='border-muted hover:shadow-md transition-all hover:scale-105'
                                >
                                    <CardContent className='p-6 text-center space-y-4'>
                                        <div className='flex justify-center text-primary'>
                                            {feature.icon}
                                        </div>
                                        <h3 className='font-semibold text-lg'>{feature.title}</h3>
                                        <p className='text-sm text-muted-foreground leading-relaxed'>
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Technology Stack */}
                <Card className='shadow-lg'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl'>
                            <Rocket className='h-6 w-6' />
                            {lang(
                                {
                                    'zh-CN': '技术栈',
                                    'en-US': 'Technology Stack',
                                    'ja-JP': '技術スタック',
                                    'ko-KR': '기술 스택',
                                    'fr-FR': 'Stack technologique',
                                    'es-ES': 'Stack tecnológico',
                                    'de-DE': 'Technologie-Stack',
                                    'pt-BR': 'Stack de Tecnologia',
                                    'ru-RU': 'Технологический стек',
                                    'zh-TW': '技術棧',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            {technologies.map((tech, index) => (
                                <div
                                    key={index}
                                    className='flex items-center space-x-3 p-4 bg-muted/50 rounded-lg'
                                >
                                    <div className='text-primary'>{tech.icon}</div>
                                    <div>
                                        <h4 className='font-semibold'>{tech.name}</h4>
                                        <p className='text-sm text-muted-foreground'>
                                            {tech.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <Card className='shadow-lg'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl'>
                            <Calendar className='h-6 w-6' />
                            {lang(
                                {
                                    'zh-CN': '发展历程',
                                    'en-US': 'Timeline',
                                    'ja-JP': 'タイムライン',
                                    'ko-KR': '타임라인',
                                    'fr-FR': 'Chronologie',
                                    'es-ES': 'Cronología',
                                    'de-DE': 'Zeitlinie',
                                    'pt-BR': 'Linha do Tempo',
                                    'ru-RU': 'Временная шкала',
                                    'zh-TW': '發展歷程',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {timeline.map((item, index) => (
                                <div
                                    key={index}
                                    className='flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-4 border-primary'
                                >
                                    <Badge variant='secondary' className='text-lg px-3 py-1'>
                                        {item.year}
                                    </Badge>
                                    <div>
                                        <h4 className='font-semibold text-lg'>{item.title}</h4>
                                        <p className='text-muted-foreground'>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Developer & Contact Section */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Card className='shadow-lg'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Coffee className='h-6 w-6' />
                                {lang(
                                    {
                                        'zh-CN': '开发者信息',
                                        'en-US': 'Developer Information',
                                        'ja-JP': '開発者情報',
                                        'ko-KR': '개발자 정보',
                                        'fr-FR': 'Informations sur le développeur',
                                        'es-ES': 'Información del desarrollador',
                                        'de-DE': 'Entwicklerinformationen',
                                        'pt-BR': 'Informações do Desenvolvedor',
                                        'ru-RU': 'Информация о разработчике',
                                        'zh-TW': '開發者資訊',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4 flex flex-col h-full'>
                            <p className='text-sm text-muted-foreground flex-grow'>
                                {lang(
                                    {
                                        'zh-CN':
                                            'XEO OS 由开发者 @RavelloH 独立开发和维护。您可以通过他的个人博客了解更多技术细节和开发动态。',
                                        'en-US':
                                            'XEO OS is independently developed and maintained by developer @RavelloH. You can learn more about technical details and development updates through his personal blog.',
                                        'ja-JP':
                                            'XEO OSは開発者@RavelloHによって独立して開発・維持されています。彼の個人ブログで技術的な詳細や開発の最新情報をご覧いただけます。',
                                        'ko-KR':
                                            'XEO OS는 개발자 @RavelloH가 독립적으로 개발하고 유지관리합니다. 그의 개인 블로그를 통해 기술적 세부사항과 개발 업데이트를 확인할 수 있습니다.',
                                        'fr-FR':
                                            'XEO OS est développé et maintenu de manière indépendante par le développeur @RavelloH. Vous pouvez en apprendre davantage sur les détails techniques et les mises à jour de développement via son blog personnel.',
                                        'es-ES':
                                            'XEO OS es desarrollado y mantenido independientemente por el desarrollador @RavelloH. Puedes conocer más detalles técnicos y actualizaciones de desarrollo a través de su blog personal.',
                                        'de-DE':
                                            'XEO OS wird unabhängig vom Entwickler @RavelloH entwickelt und gepflegt. Sie können mehr über technische Details и Entwicklungsupdates über seinen persönlichen Blog erfahren.',
                                        'pt-BR':
                                            'XEO OS é desenvolvido e mantido independentemente pelo desenvolvedor @RavelloH. Você pode aprender mais sobre detalhes técnicos e atualizações de desenvolvimento através de seu blog pessoal.',
                                        'ru-RU':
                                            'XEO OS независимо разрабатывается и поддерживается разработчиком @RavelloH. Вы можете узнать больше о технических деталях и обновлениях разработки через его личный блог.',
                                        'zh-TW':
                                            'XEO OS 由開發者 @RavelloH 獨立開發和維護。您可以透過他的個人博客了解更多技術細節和開發動態。',
                                    },
                                    locale,
                                )}
                            </p>
                            <div className='mt-auto'>
                                <Button variant='outline' asChild className='w-full'>
                                    <Link
                                        href='https://ravelloh.top'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        <ExternalLink className='mr-2 h-4 w-4' />
                                        {lang(
                                            {
                                                'zh-CN': '访问开发者博客',
                                                'en-US': 'Visit Developer Blog',
                                                'ja-JP': '開発者ブログを訪問',
                                                'ko-KR': '개발자 블로그 방문',
                                                'fr-FR': 'Visiter le blog du développeur',
                                                'es-ES': 'Visitar blog del desarrollador',
                                                'de-DE': 'Entwickler-Blog besuchen',
                                                'pt-BR': 'Visitar Blog do Desenvolvedor',
                                                'ru-RU': 'Посетить блог разработчика',
                                                'zh-TW': '造訪開發者博客',
                                            },
                                            locale,
                                        )}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='shadow-lg'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <MessageSquare className='h-6 w-6' />
                                {lang(
                                    {
                                        'zh-CN': '联系我们',
                                        'en-US': 'Contact Us',
                                        'ja-JP': 'お問い合わせ',
                                        'ko-KR': '문의하기',
                                        'fr-FR': 'Nous contacter',
                                        'es-ES': 'Contáctanos',
                                        'de-DE': 'Kontakt',
                                        'pt-BR': 'Entre em Contato',
                                        'ru-RU': 'Связаться с нами',
                                        'zh-TW': '聯絡我們',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4 flex flex-col h-full'>
                            <p className='text-sm text-muted-foreground flex-grow'>
                                {lang(
                                    {
                                        'zh-CN':
                                            '有任何问题或建议？我们很乐意听到您的声音。通过联系页面与我们取得联系。',
                                        'en-US':
                                            "Have any questions or suggestions? We'd love to hear from you. Get in touch through our contact page.",
                                        'ja-JP':
                                            'ご質問やご提案はありますか？ぜひお聞かせください。お問い合わせページからご連絡ください。',
                                        'ko-KR':
                                            '질문이나 제안이 있으신가요? 여러분의 의견을 듣고 싶습니다. 연락 페이지를 통해 연락해 주세요.',
                                        'fr-FR':
                                            'Avez-vous des questions ou des suggestions ? Nous aimerions avoir de vos nouvelles. Contactez-nous via notre page de contact.',
                                        'es-ES':
                                            '¿Tienes alguna pregunta o sugerencia? Nos encantaría saber de ti. Ponte en contacto a través de nuestra página de contacto.',
                                        'de-DE':
                                            'Haben Sie Fragen oder Vorschläge? Wir würden gerne von Ihnen hören. Kontaktieren Sie uns über unsere Kontaktseite.',
                                        'pt-BR':
                                            'Tem alguma pergunta ou sugestão? Adoraríamos ouvir de você. Entre em contato através da nossa página de contato.',
                                        'ru-RU':
                                            'Есть вопросы или предложения? Мы будем рады услышать от вас. Свяжитесь с нами через страницу контактов.',
                                        'zh-TW':
                                            '有任何問題或建議？我們很樂意聽到您的聲音。透過聯絡頁面與我們取得聯繫。',
                                    },
                                    locale,
                                )}
                            </p>
                            <div className='mt-auto'>
                                <Button asChild className='w-full'>
                                    <Link href={`/${locale}/contact`}>
                                        <MessageSquare className='mr-2 h-4 w-4' />
                                        {lang(
                                            {
                                                'zh-CN': '联系我们',
                                                'en-US': 'Contact Us',
                                                'ja-JP': 'お問い合わせ',
                                                'ko-KR': '문의하기',
                                                'fr-FR': 'Nous contacter',
                                                'es-ES': 'Contáctanos',
                                                'de-DE': 'Kontakt',
                                                'pt-BR': 'Contato',
                                                'ru-RU': 'Связаться',
                                                'zh-TW': '聯絡我們',
                                            },
                                            locale,
                                        )}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
