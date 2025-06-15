'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Settings, User } from 'lucide-react';
import lang from '@/lib/lang';
import token from '@/utils/userToken';
import '@/app/globals.css';

export default function WelcomePage(props: { params: Promise<{ locale: string }> }) {
    const params = use(props.params);
    const { locale } = params;
    const router = useRouter();

    useEffect(() => {
        // 检查用户是否已登录
        const userToken = token.get();
        if (!userToken) {
            router.push(`/${locale}/signin`);
        }
    }, [locale, router]);

    const texts = {
        welcome: lang(
            {
                'zh-CN': '欢迎加入！',
                'en-US': 'Welcome!',
                'zh-TW': '歡迎加入！',
                'es-ES': '¡Bienvenido!',
                'fr-FR': 'Bienvenue !',
                'ru-RU': 'Добро пожаловать!',
                'ja-JP': 'ようこそ！',
                'de-DE': 'Willkommen!',
                'pt-BR': 'Bem-vindo!',
                'ko-KR': '환영합니다!',
            },
            locale,
        ),
        subtitle: lang(
            {
                'zh-CN': '您已成功注册账户',
                'en-US': 'You have successfully registered your account',
                'zh-TW': '您已成功註冊帳戶',
                'es-ES': 'Has registrado exitosamente tu cuenta',
                'fr-FR': 'Vous avez enregistré votre compte avec succès',
                'ru-RU': 'Вы успешно зарегистрировали свой аккаунт',
                'ja-JP': 'アカウントの登録が完了しました',
                'de-DE': 'Sie haben Ihr Konto erfolgreich registriert',
                'pt-BR': 'Você registrou sua conta com sucesso',
                'ko-KR': '계정 등록이 완료되었습니다',
            },
            locale,
        ),
        nextSteps: lang(
            {
                'zh-CN': '接下来您可以：',
                'en-US': 'Next, you can:',
                'zh-TW': '接下來您可以：',
                'es-ES': 'A continuación, puedes:',
                'fr-FR': 'Ensuite, vous pouvez :',
                'ru-RU': 'Далее вы можете:',
                'ja-JP': '次に、以下のことができます：',
                'de-DE': 'Als nächstes können Sie:',
                'pt-BR': 'Em seguida, você pode:',
                'ko-KR': '다음으로 할 수 있습니다:',
            },
            locale,
        ),
        setupProfile: lang(
            {
                'zh-CN': '设置个人资料',
                'en-US': 'Set up your profile',
                'zh-TW': '設置個人資料',
                'es-ES': 'Configurar tu perfil',
                'fr-FR': 'Configurer votre profil',
                'ru-RU': 'Настроить профиль',
                'ja-JP': 'プロフィールを設定',
                'de-DE': 'Profil einrichten',
                'pt-BR': 'Configurar seu perfil',
                'ko-KR': '프로필 설정',
            },
            locale,
        ),
        exploreForums: lang(
            {
                'zh-CN': '开始探索论坛',
                'en-US': 'Start exploring forums',
                'zh-TW': '開始探索論壇',
                'es-ES': 'Comenzar a explorar foros',
                'fr-FR': 'Commencer à explorer les forums',
                'ru-RU': 'Начать изучение форумов',
                'ja-JP': 'フォーラムを探索',
                'de-DE': 'Foren erkunden',
                'pt-BR': 'Começar a explorar fóruns',
                'ko-KR': '포럼 둘러보기',
            },
            locale,
        ),
        profileDescription: lang(
            {
                'zh-CN': '添加头像、个人简介等信息，让其他用户更好地了解您',
                'en-US':
                    'Add avatar, bio and other information to help others get to know you better',
                'zh-TW': '添加頭像、個人簡介等資訊，讓其他用戶更好地了解您',
                'es-ES':
                    'Agrega avatar, biografía y otra información para ayudar a otros a conocerte mejor',
                'fr-FR':
                    "Ajoutez un avatar, une bio et d'autres informations pour aider les autres à mieux vous connaître",
                'ru-RU':
                    'Добавьте аватар, биографию и другую информацию, чтобы помочь другим лучше узнать вас',
                'ja-JP':
                    'アバターや自己紹介などの情報を追加して、他のユーザーにあなたをより良く知ってもらいましょう',
                'de-DE':
                    'Fügen Sie Avatar, Bio und andere Informationen hinzu, damit andere Sie besser kennenlernen können',
                'pt-BR':
                    'Adicione avatar, bio e outras informações para ajudar outros a conhecê-lo melhor',
                'ko-KR':
                    '아바타, 자기소개 등의 정보를 추가하여 다른 사용자들이 당신을 더 잘 알 수 있도록 하세요',
            },
            locale,
        ),
        forumDescription: lang(
            {
                'zh-CN': '发现有趣的话题，参与讨论，结识志同道合的朋友',
                'en-US':
                    'Discover interesting topics, join discussions, and meet like-minded friends',
                'zh-TW': '發現有趣的話題，參與討論，結識志同道合的朋友',
                'es-ES': 'Descubre temas interesantes, únete a discusiones y conoce amigos afines',
                'fr-FR':
                    'Découvrez des sujets intéressants, participez aux discussions et rencontrez des amis partageant les mêmes idées',
                'ru-RU':
                    'Откройте для себя интересные темы, участвуйте в обсуждениях и знакомьтесь с единомышленниками',
                'ja-JP':
                    '興味深いトピックを発見し、ディスカッションに参加し、同じ志を持つ友達と出会いましょう',
                'de-DE':
                    'Entdecken Sie interessante Themen, nehmen Sie an Diskussionen teil und lernen Sie Gleichgesinnte kennen',
                'pt-BR':
                    'Descubra tópicos interessantes, participe de discussões e conheça amigos com ideias semelhantes',
                'ko-KR': '흥미로운 주제를 발견하고, 토론에 참여하며, 뜻이 맞는 친구들을 만나보세요',
            },
            locale,
        ),
        goToSettings: lang(
            {
                'zh-CN': '前往设置',
                'en-US': 'Go to Settings',
                'zh-TW': '前往設置',
                'es-ES': 'Ir a Configuración',
                'fr-FR': 'Aller aux Paramètres',
                'ru-RU': 'Перейти к Настройкам',
                'ja-JP': '設定に移動',
                'de-DE': 'Zu den Einstellungen',
                'pt-BR': 'Ir para Configurações',
                'ko-KR': '설정으로 이동',
            },
            locale,
        ),
        exploreForum: lang(
            {
                'zh-CN': '探索论坛',
                'en-US': 'Explore Forum',
                'zh-TW': '探索論壇',
                'es-ES': 'Explorar Foro',
                'fr-FR': 'Explorer le Forum',
                'ru-RU': 'Исследовать Форум',
                'ja-JP': 'フォーラムを探索',
                'de-DE': 'Forum Erkunden',
                'pt-BR': 'Explorar Fórum',
                'ko-KR': '포럼 탐색',
            },
            locale,
        ),
    };

    return (
            <div className='container mx-auto px-4 py-8 max-w-2xl'>
                <div className='text-center mb-8'>
                    <div className='flex justify-center mb-4'>
                        <CheckCircle className='h-16 w-16 text-green-500' />
                    </div>
                    <h1 className='text-3xl font-bold mb-2'>{texts.welcome}</h1>
                    <p className='text-muted-foreground'>{texts.subtitle}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{texts.nextSteps}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <div className='space-y-4'>
                            <div className='flex items-start space-x-4 p-4 border rounded-lg'>
                                <Settings className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                                <div className='flex-1'>
                                    <h3 className='font-semibold mb-2'>{texts.setupProfile}</h3>
                                    <p className='text-sm text-muted-foreground mb-3'>
                                        {texts.profileDescription}
                                    </p>
                                    <Link 
                                        href={`/${locale}/setting`}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                    >
                                        {texts.goToSettings}
                                        <ArrowRight className='h-4 w-4 ml-2' />
                                    </Link>
                                </div>
                            </div>

                            <div className='flex items-start space-x-4 p-4 border rounded-lg'>
                                <User className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                                <div className='flex-1'>
                                    <h3 className='font-semibold mb-2'>{texts.exploreForums}</h3>
                                    <p className='text-sm text-muted-foreground mb-3'>
                                        {texts.forumDescription}
                                    </p>
                                    <Link
                                        href={`/${locale}`}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                    >
                                        {texts.exploreForum}
                                        <ArrowRight className='h-4 w-4 ml-2' />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
    );
}
