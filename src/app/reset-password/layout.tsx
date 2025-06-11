'use server';

import { headers } from 'next/headers';
import { Metadata } from 'next';

import { ThemeScript } from '@/components/theme-script';
import lang from '@/lib/lang';

type Props = {
    children: React.ReactNode;
};

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const locale = (resolvedSearchParams?.lang as string) || 'en-US';

    const title = lang(
        {
            'en-US': "Reset Password | XEO OS - Xchange Everyone's Opinions",
            'zh-CN': '重置密码 | XEO OS - 交流每个人的观点',
            'zh-TW': '重置密碼 | XEO OS - 交流每個人的觀點',
            'es-ES': 'Restablecer contraseña | XEO OS - Intercambia las opiniones de todos',
            'fr-FR': 'Réinitialiser le mot de passe | XEO OS - Échangez les opinions de chacun',
            'ru-RU': 'Сбросить пароль | XEO OS - Обменивайтесь мнениями всех',
            'ja-JP': 'パスワードリセット | XEO OS - みんなの意見を交換',
            'de-DE': 'Passwort zurücksetzen | XEO OS - Teile die Meinungen aller',
            'pt-BR': 'Redefinir senha | XEO OS - Troque as opiniões de todos',
            'ko-KR': '비밀번호 재설정 | XEO OS - 모두의 의견을 교환하세요',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '重置您的XEO OS账户密码。',
            'zh-TW': '重置您的XEO OS帳戶密碼。',
            'en-US': 'Reset your XEO OS account password.',
            'es-ES': 'Restablece la contraseña de tu cuenta XEO OS.',
            'fr-FR': 'Réinitialisez le mot de passe de votre compte XEO OS.',
            'ru-RU': 'Сбросьте пароль вашей учетной записи XEO OS.',
            'ja-JP': 'XEO OSアカウントのパスワードをリセットします。',
            'de-DE': 'Setzen Sie Ihr XEO OS-Kontopasswort zurück.',
            'pt-BR': 'Redefina a senha da sua conta XEO OS.',
            'ko-KR': 'XEO OS 계정 비밀번호를 재설정하세요.',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default async function LocaleLayout({ children }: Props) {
    const locale = new URLSearchParams((await headers()).get('query') || '').get('lang') || 'zh-CN';

    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    const themeCookie = cookieHeader.split(';').find((c) => c.trim().startsWith('theme='));

    const savedTheme = themeCookie ? themeCookie.split('=')[1] : 'dark';

    const htmlClassName = savedTheme === 'dark' ? 'dark' : '';

    return (
        <html lang={locale} className={htmlClassName} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ThemeScript />
                {children}
            </body>
        </html>
    );
}
