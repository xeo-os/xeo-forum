import { ThemeScript } from "@/components/theme-script";
import { Metadata } from "next";
import { headers } from "next/headers";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata(): Promise<Metadata> {
  // 获取当前路径
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  // 获取当前语言
  const lang =
    new URLSearchParams((await headersList.get("query")) || "").get("lang") ||
    "zh-CN";

  // 移除语言前缀
  const pathWithoutLocale =
    pathname.replace(
      /^\/(en-US|zh-CN|zh-TW|es-ES|fr-FR|ru-RU|ja-JP|de-DE|pt-BR|ko-KR)/,
      ""
    ) || "";

  // 生成一个siteURL
  const siteURL = `https://xeoos.net/${lang}${pathWithoutLocale}`;

  // 生成所有语言版本的链接
  const languages = {
    "en-US": `https://xeoos.net/en-US${pathWithoutLocale}`,
    "zh-CN": `https://xeoos.net/zh-CN${pathWithoutLocale}`,
    "zh-TW": `https://xeoos.net/zh-TW${pathWithoutLocale}`,
    "es-ES": `https://xeoos.net/es-ES${pathWithoutLocale}`,
    "fr-FR": `https://xeoos.net/fr-FR${pathWithoutLocale}`,
    "ru-RU": `https://xeoos.net/ru-RU${pathWithoutLocale}`,
    "ja-JP": `https://xeoos.net/ja-JP${pathWithoutLocale}`,
    "de-DE": `https://xeoos.net/de-DE${pathWithoutLocale}`,
    "pt-BR": `https://xeoos.net/pt-BR${pathWithoutLocale}`,
    "ko-KR": `https://xeoos.net/ko-KR${pathWithoutLocale}`,
  };

  return {
    metadataBase: new URL("https://xeoos.net/"),
    title: "XEO OS",
    description: "Xchange Everyone's Opinion",
    applicationName: "XEO OS",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#f0b100" },
      { media: "(prefers-color-scheme: dark)", color: "#f0b100" },
    ],
    colorScheme: "light dark",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    alternates: {
      canonical: siteURL,
      languages,
      types: {
        "application/rss+xml": [{ url: "feed.xml", title: "RSS" }],
      },
    },
    openGraph: {
      title: {
        template: "%s",
        default: "XEO OS",
      },
      url: siteURL,
      description: "Xchange Everyone's Opinion",
      siteName: "XEO OS",
      type: "website",
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
      card: "summary_large_image",
      title: {
        template: "%s",
        default: "XEO OS",
      },
      description: "Xchange Everyone's Opinion",
      creator: "@ravellohh",
      images: {
        url: `https://xeoos.net/api/dynamicImage/og?url=/${lang}${pathWithoutLocale}`,
        alt: "XEO OS - Xchange Everyone's Opinions",
        width: 1200,
        height: 630,
      },
    },
    facebook: {
      admins: ["100083650946305"],
    },
    appleWebApp: {
        capable: true,
        title: "XEO OS",
    }
  };
}

export default async function LocaleLayout({ children }: Props) {
  return (
    <html suppressHydrationWarning>
      <head></head>
      <body suppressHydrationWarning>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
