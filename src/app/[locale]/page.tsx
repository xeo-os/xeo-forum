type Props = {
  params: { locale: string };
};

const messages = {
  en: {
    welcome: "Welcome to Xeo Forum",
    description: "Connect with people around the world"
  },
  zh: {
    welcome: "欢迎来到 Xeo 论坛",
    description: "与世界各地的人们建立联系"
  },
  ja: {
    welcome: "Xeo フォーラムへようこそ",
    description: "世界中の人々とつながりましょう"
  },
  ko: {
    welcome: "Xeo 포럼에 오신 것을 환영합니다",
    description: "전 세계 사람들과 소통하세요"
  }
};

export default function HomePage({ params }: Props) {
  const { locale } = params;
  const content = messages[locale as keyof typeof messages] || messages.en;

  return (
    <main>
      <h1>{content.welcome}</h1>
      <p>{content.description}</p>
    </main>
  );
}
