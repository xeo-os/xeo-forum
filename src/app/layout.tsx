import { ThemeScript } from '@/components/theme-script';
import { TokenManager } from '@/components/token-manager';
import Message from '@/components/message';
import { Metadata } from 'next';
import { headers } from 'next/headers';

type Props = {
    children: React.ReactNode;
    params: { locale: string };
};

export async function generateMetadata(): Promise<Metadata> {
    // 获取当前路径
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';

    // 从URL路径中提取语言
    const localeMatch = pathname.match(/^\/([a-z]{2}-[A-Z]{2})/);
    const lang = localeMatch ? localeMatch[1] : 'zh-CN';

    // 移除语言前缀
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '') || '/';

    // 生成一个siteURL
    const siteURL = `https://xeoos.net/${lang}${pathWithoutLocale}`;

    // 生成所有语言版本的链接
    const languages = {
        'en-US': `https://xeoos.net/en-US${pathWithoutLocale}`,
        'zh-CN': `https://xeoos.net/zh-CN${pathWithoutLocale}`,
        'zh-TW': `https://xeoos.net/zh-TW${pathWithoutLocale}`,
        'es-ES': `https://xeoos.net/es-ES${pathWithoutLocale}`,
        'fr-FR': `https://xeoos.net/fr-FR${pathWithoutLocale}`,
        'ru-RU': `https://xeoos.net/ru-RU${pathWithoutLocale}`,
        'ja-JP': `https://xeoos.net/ja-JP${pathWithoutLocale}`,
        'de-DE': `https://xeoos.net/de-DE${pathWithoutLocale}`,
        'pt-BR': `https://xeoos.net/pt-BR${pathWithoutLocale}`,
        'ko-KR': `https://xeoos.net/ko-KR${pathWithoutLocale}`,
    };

    return {
        metadataBase: new URL('https://xeoos.net/'),
        title: 'XEO OS',
        description: "Xchange Everyone's Opinion",
        applicationName: 'XEO OS',
        generator: 'Next.js',
        referrer: 'origin-when-cross-origin',
        alternates: {
            canonical: siteURL,
            languages,
            types: {
                'application/rss+xml': [{ url: 'feed.xml', title: 'RSS' }],
            },
        },
        openGraph: {
            title: {
                template: '%s',
                default: 'XEO OS',
            },
            url: siteURL,
            description: "Xchange Everyone's Opinion",
            siteName: 'XEO OS',
            type: 'website',
            images: [
                {
                    url: `https://xeoos.net/api/dynamicImage/og?url=/${lang}${pathWithoutLocale}`,
                    width: 1200,
                    height: 630,
                    alt: "XEO OS - Xchange Everyone's Opinions",
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: {
                template: '%s',
                default: 'XEO OS',
            },
            description: "Xchange Everyone's Opinion",
            creator: '@ravellohh',
            images: {
                url: `https://xeoos.net/api/dynamicImage/og?url=/${lang}${pathWithoutLocale}`,
                alt: "XEO OS - Xchange Everyone's Opinions",
                width: 1200,
                height: 630,
            },
        },
        facebook: {
            admins: ['100083650946305'],
        },
        appleWebApp: {
            capable: true,
            title: 'XEO OS',
        },
    };
}

// 单独导出 viewport
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
    userScalable: false,
};

export default async function LocaleLayout({ children }: Props) {
    return (
        <>
            <ThemeScript />
            <TokenManager />
            <Message />
            {children}
        </>
    );
}
