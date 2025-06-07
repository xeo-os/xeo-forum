import lang from "@/lib/lang";

import "@/app/globals.css";
type Props = {
  params: { locale: string };
};

export default function HomePage({ params }: Props) {
  const { locale } = params;
  
  const welcomeText = lang({
    "en-US": "Welcome to Xeo OS",
    "zh-CN": "欢迎来到 Xeo OS",
    "zh-TW": "歡迎來到 Xeo OS",
    "es-ES": "Bienvenido a Xeo OS",
    "fr-FR": "Bienvenue sur Xeo OS",
    "ru-RU": "Добро пожаловать в Xeo OS",
    "ja-JP": "Xeo OS へようこそ",
    "de-DE": "Willkommen bei Xeo OS",
    "pt-BR": "Bem-vindo ao Xeo OS",
    "ko-KR": "Xeo OS에 오신 것을 환영합니다",
  }, locale);

  return (
    <main>
      <h1>{welcomeText}</h1>
    </main>
  );
}
