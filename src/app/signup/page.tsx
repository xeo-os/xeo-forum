import '@/app/globals.css';
import { SignUpForm } from '@/components/signup-form';
import { Metadata } from 'next';
import lang from '@/lib/lang';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const params = await searchParams;
    const locale = (params?.lang as string) || 'en-US';

    const langURL = {
        'en-US': 'https://xeoos.net/signup?lang=en-US',
        'zh-CN': 'https://xeoos.net/signup?lang=zh-CN',
        'zh-TW': 'https://xeoos.net/signup?lang=zh-TW',
        'en-ES': 'https://xeoos.net/signup?lang=en-US',
        'fr-FR': 'https://xeoos.net/signup?lang=fr-FR',
        'ru-RU': 'https://xeoos.net/signup?lang=ru-RU',
        'ja-JP': 'https://xeoos.net/signup?lang=ja-JP',
        'de-DE': 'https://xeoos.net/signup?lang=de-DE',
        'pt-BR': 'https://xeoos.net/signup?lang=pt-BR',
        'ko-KR': 'https://xeoos.net/signup?lang=ko-KR',
    };

    const title = lang(
        {
            'en-US': "Sign up | XEO OS - Xchange Everyone's Opinions",
            'zh-CN': '注册 | XEO OS - 交流每个人的观点',
            'zh-TW': '註冊 | XEO OS - 交流每個人的觀點',
            'es-ES': 'Registrarse | XEO OS - Intercambia las opiniones de todos',
            'fr-FR': "S'inscrire | XEO OS - Échangez les opinions de chacun",
            'ru-RU': 'Зарегистрироваться | XEO OS - Обменивайтесь мнениями всех',
            'ja-JP': 'サインアップ | XEO OS - みんなの意見を交換',
            'de-DE': 'Registrieren | XEO OS - Teile die Meinungen aller',
            'pt-BR': 'Registrar | XEO OS - Troque as opiniões de todos',
            'ko-KR': '회원가입 | XEO OS - 모두의 의견을 교환하세요',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '交流每个人的观点，仅使用你的语言。',
            'zh-TW': '交流每個人的觀點，僅使用你的語言。',
            'en-US': "Xchange everyone's opinions, using only your language.",
            'es-ES': 'Intercambia las opiniones de todos, usando solo tu idioma.',
            'fr-FR': 'Échangez les opinions de chacun, en utilisant uniquement votre langue.',
            'ru-RU': 'Обменивайтесь мнениями всех, используя только ваш язык.',
            'ja-JP': 'みんなの意見を交換、あなたの言語だけで。',
            'de-DE': 'Teile die Meinungen aller, nur in deiner Sprache.',
            'pt-BR': 'Troque as opiniões de todos, usando apenas seu idioma.',
            'ko-KR': '모두의 의견을 교환하세요, 당신의 언어만 사용하여.',
        },
        locale,
    );

    return {
        title,
        description,
        alternates: {
            languages: langURL,
        },
    };
}

export default function LoginPage() {
    return (
        <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
            <div className='w-full max-w-sm md:max-w-3xl'>
                <SignUpForm />
            </div>
        </div>
    );
}
