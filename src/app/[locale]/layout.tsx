import type { Metadata } from "next";
import lang from "@/lib/lang";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;

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

export default function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
