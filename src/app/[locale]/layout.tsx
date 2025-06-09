"use server";

import type { Metadata } from "next";
import lang from "@/lib/lang";
import { headers } from "next/headers";

import { ThemeScript } from "@/components/theme-script";
import { ClientLayout } from "@/components/client-layout";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title = lang(
    {
      "en-US": "XEO OS - Xchange Everyone's Opinions",
      "zh-CN": "XEO OS - 交流每个人的观点",
      "zh-TW": "XEO OS - 交流每個人的觀點",
      "es-ES": "XEO OS - Intercambia las opiniones de todos",
      "fr-FR": "XEO OS - Échangez les opinions de chacun",
      "ru-RU": "XEO OS - Обменивайтесь мнениями всех",
      "ja-JP": "XEO OS - みんなの意見を交換",
      "de-DE": "XEO OS - Teile die Meinungen aller",
      "pt-BR": "XEO OS - Troque as opiniões de todos",
      "ko-KR": "XEO OS - 모두의 의견을 교환하세요",
    },
    locale
  );

  const description = lang(
    {
      "zh-CN": "交流每个人的观点，仅使用你的语言。",
      "zh-TW": "交流每個人的觀點，僅使用你的語言。",
      "en-US": "Xchange everyone's opinions, using only your language.",
      "es-ES": "Intercambia las opiniones de todos, usando solo tu idioma.",
      "fr-FR":
        "Échangez les opinions de chacun, en utilisant uniquement votre langue.",
      "ru-RU": "Обменивайтесь мнениями всех, используя только ваш язык.",
      "ja-JP": "みんなの意見を交換、あなたの言語だけで。",
      "de-DE": "Teile die Meinungen aller, nur in deiner Sprache.",
      "pt-BR": "Troque as opiniões de todos, usando apenas seu idioma.",
      "ko-KR": "모두의 의견을 교환하세요, 당신의 언어만 사용하여.",
    },
    locale
  );

  return {
    title,
    description,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const awaitedParams = await Promise.resolve(params); // Ensure params is awaited
  const { locale } = awaitedParams;
  
  // 从 Cookie 中读取主题设置
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') || '';
  const themeCookie = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('theme='));
  
  const savedTheme = themeCookie ? themeCookie.split('=')[1] : 'dark'; // 默认暗色
  
  // 直接根据主题设置决定是否添加 dark 类
  const htmlClassName = savedTheme === 'dark' ? 'dark' : '';

  return (
    <html lang={locale} className={htmlClassName} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeScript />
        <ClientLayout locale={locale} savedTheme={savedTheme}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
