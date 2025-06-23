'use server';

import { headers } from 'next/headers';

import { ThemeScript } from '@/components/theme-script';

type Props = {
    children: React.ReactNode;
};

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
