import { Metadata } from "next";
import lang from "@/lib/lang";

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const locale = (searchParams?.lang as string) || "en-US";

  const langURL = {
    "en-US": "https://xeoos.net/signin?lang=en-US",
    "zh-CN": "https://xeoos.net/signin?lang=zh-CN",
    "zh-TW": "https://xeoos.net/signin?lang=zh-TW",
    "en-ES": "https://xeoos.net/signin?lang=en-US",
    "fr-FR": "https://xeoos.net/signin?lang=fr-FR",
    "ru-RU": "https://xeoos.net/signin?lang=ru-RU",
    "ja-JP": "https://xeoos.net/signin?lang=ja-JP",
    "de-DE": "https://xeoos.net/signin?lang=de-DE",
    "pt-BR": "https://xeoos.net/signin?lang=pt-BR",
    "ko-KR": "https://xeoos.net/signin?lang=ko-KR",
  }


  const title = lang(
    {
      "en-US": "Sign in | XEO OS - Xchange Everyone's Opinions",
      "zh-CN": "登录 | XEO OS - 交流每个人的观点",
      "zh-TW": "登入 | XEO OS - 交流每個人的觀點",
      "es-ES": "Iniciar sesión | XEO OS - Intercambia las opiniones de todos",
      "fr-FR": "Se connecter | XEO OS - Échangez les opinions de chacun",
      "ru-RU": "Войти | XEO OS - Обменивайтесь мнениями всех",
      "ja-JP": "ログイン | XEO OS - みんなの意見を交換",
      "de-DE": "Anmelden | XEO OS - Teile die Meinungen aller",
      "pt-BR": "Entrar | XEO OS - Troque as opiniões de todos",
      "ko-KR": "로그인 | XEO OS - 모두의 의견을 교환하세요",
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