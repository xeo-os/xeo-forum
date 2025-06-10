"use server";

import type { Metadata } from "next";
import lang from "@/lib/lang";
import { headers } from "next/headers";
import { getThemeFromCookie, getHtmlClassName } from "@/lib/theme-utils";

import { ThemeScript } from "@/components/theme-script";
import { ClientLayout } from "@/components/client-layout";
import { ThemeSync } from "@/components/theme-sync";
import { PageTransition } from "@/components/page-transition";
import { ContextMenuProvider } from "@/components/context-menu-provider";
import { NewPostButton } from "@/components/new-post-button";

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
  const { locale } = await params;
  
  // 使用统一的主题处理逻辑
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') || '';
  const savedTheme = getThemeFromCookie(cookieHeader);
  const htmlClassName = getHtmlClassName(savedTheme);

  // 从sidebar-inner获取真实的主题数据，保持一致性，之后会从数据库获取
  const topics = [
    {
      title: lang({
        "zh-CN": "综合类",
        "zh-TW": "綜合類",
        "en-US": "General",
        "es-ES": "General",
        "fr-FR": "Général",
        "ru-RU": "Общий",
        "ja-JP": "総合",
        "de-DE": "Allgemein",
        "pt-BR": "Geral",
        "ko-KR": "종합",
      }, locale),
      items: [
        { title: lang({
          "zh-CN": "时事热点",
          "zh-TW": "時事熱點",
          "en-US": "Current Events",
          "es-ES": "Actualidad",
          "fr-FR": "Actualités",
          "ru-RU": "Актуальные События",
          "ja-JP": "時事",
          "de-DE": "Aktuelle Ereignisse",
          "pt-BR": "Eventos Atuais",
          "ko-KR": "시사",
        }, locale) },
        { title: lang({
          "zh-CN": "灌水闲聊",
          "zh-TW": "灌水閒聊",
          "en-US": "Casual Chat",
          "es-ES": "Charla Casual",
          "fr-FR": "Discussion Décontractée",
          "ru-RU": "Свободное Общение",
          "ja-JP": "雑談",
          "de-DE": "Lockerer Chat",
          "pt-BR": "Bate-papo Casual",
          "ko-KR": "자유 대화",
        }, locale) },
        { title: lang({
          "zh-CN": "新人报到",
          "zh-TW": "新人報到",
          "en-US": "New Member Introduction",
          "es-ES": "Presentación de Nuevos Miembros",
          "fr-FR": "Présentation des Nouveaux Membres",
          "ru-RU": "Знакомство Новых Участников",
          "ja-JP": "新人紹介",
          "de-DE": "Vorstellung Neuer Mitglieder",
          "pt-BR": "Apresentação de Novos Membros",
          "ko-KR": "신규 회원 소개",
        }, locale) },
      ],
    },
    {
      title: lang({
        "zh-CN": "学习与教育",
        "zh-TW": "學習與教育",
        "en-US": "Learning & Education",
        "es-ES": "Aprendizaje y Educación",
        "fr-FR": "Apprentissage et Éducation",
        "ru-RU": "Обучение и Образование",
        "ja-JP": "学習と教育",
        "de-DE": "Lernen & Bildung",
        "pt-BR": "Aprendizado e Educação",
        "ko-KR": "학습 및 교육",
      }, locale),
      items: [
        { title: lang({
          "zh-CN": "学术交流",
          "zh-TW": "學術交流",
          "en-US": "Academic Exchange",
          "es-ES": "Intercambio Académico",
          "fr-FR": "Échange Académique",
          "ru-RU": "Академический Обмен",
          "ja-JP": "学術交流",
          "de-DE": "Akademischer Austausch",
          "pt-BR": "Intercâmbio Acadêmico",
          "ko-KR": "학술 교류",
        }, locale) },
        { title: lang({
          "zh-CN": "学习技巧",
          "zh-TW": "學習技巧",
          "en-US": "Study Skills",
          "es-ES": "Técnicas de Estudio",
          "fr-FR": "Techniques d'Étude",
          "ru-RU": "Навыки Обучения",
          "ja-JP": "学習スキル",
          "de-DE": "Lerntechniken",
          "pt-BR": "Técnicas de Estudo",
          "ko-KR": "학습 기법",
        }, locale) },
        { title: lang({
          "zh-CN": "编程与开发",
          "zh-TW": "編程與開發",
          "en-US": "Programming & Development",
          "es-ES": "Programación y Desarrollo",
          "fr-FR": "Programmation et Développement",
          "ru-RU": "Программирование и Разработка",
          "ja-JP": "プログラミングと開発",
          "de-DE": "Programmierung & Entwicklung",
          "pt-BR": "Programação e Desenvolvimento",
          "ko-KR": "프로그래밍 및 개발",
        }, locale) },
        { title: lang({
          "zh-CN": "科学探讨",
          "zh-TW": "科學探討",
          "en-US": "Scientific Discussion",
          "es-ES": "Discusión Científica",
          "fr-FR": "Discussion Scientifique",
          "ru-RU": "Научная Дискуссия",
          "ja-JP": "科学的議論",
          "de-DE": "Wissenschaftliche Diskussion",
          "pt-BR": "Discussão Científica",
          "ko-KR": "과학 토론",
        }, locale) },
        { title: lang({
          "zh-CN": "语言学习",
          "zh-TW": "語言學習",
          "en-US": "Language Learning",
          "es-ES": "Aprendizaje de Idiomas",
          "fr-FR": "Apprentissage des Langues",
          "ru-RU": "Изучение Языков",
          "ja-JP": "言語学習",
          "de-DE": "Sprachenlernen",
          "pt-BR": "Aprendizado de Idiomas",
          "ko-KR": "언어 학습",
        }, locale) },
      ],
    },
    {
      title: lang({
        "zh-CN": "娱乐休闲",
        "zh-TW": "娛樂休閒",
        "en-US": "Entertainment & Leisure",
        "es-ES": "Entretenimiento y Ocio",
        "fr-FR": "Divertissement et Loisirs",
        "ru-RU": "Развлечения и Досуг",
        "ja-JP": "エンターテイメントとレジャー",
        "de-DE": "Unterhaltung & Freizeit",
        "pt-BR": "Entretenimento e Lazer",
        "ko-KR": "엔터테인먼트 및 레저",
      }, locale),
      items: [
        { title: lang({
          "zh-CN": "游戏讨论",
          "zh-TW": "遊戲討論",
          "en-US": "Gaming Discussion",
          "es-ES": "Discusión de Juegos",
          "fr-FR": "Discussion Jeux",
          "ru-RU": "Обсуждение Игр",
          "ja-JP": "ゲーム議論",
          "de-DE": "Spiele-Diskussion",
          "pt-BR": "Discussão de Jogos",
          "ko-KR": "게임 토론",
        }, locale) },
        { title: lang({
          "zh-CN": "影视剧集",
          "zh-TW": "影視劇集",
          "en-US": "Movies & TV Shows",
          "es-ES": "Películas y Series",
          "fr-FR": "Films et Séries",
          "ru-RU": "Фильмы и Сериалы",
          "ja-JP": "映画とテレビ番組",
          "de-DE": "Filme & TV-Shows",
          "pt-BR": "Filmes e Séries",
          "ko-KR": "영화 및 TV 프로그램",
        }, locale) },
        { title: lang({
          "zh-CN": "音乐分享",
          "zh-TW": "音樂分享",
          "en-US": "Music Sharing",
          "es-ES": "Compartir Música",
          "fr-FR": "Partage Musical",
          "ru-RU": "Музыкальный Обмен",
          "ja-JP": "音楽シェア",
          "de-DE": "Musik-Sharing",
          "pt-BR": "Compartilhamento Musical",
          "ko-KR": "음악 공유",
        }, locale) },
        { title: lang({
          "zh-CN": "摄影交流",
          "zh-TW": "攝影交流",
          "en-US": "Photography Exchange",
          "es-ES": "Intercambio Fotográfico",
          "fr-FR": "Échange Photographique",
          "ru-RU": "Фотографический Обмен",
          "ja-JP": "写真交流",
          "de-DE": "Fotografie-Austausch",
          "pt-BR": "Intercâmbio Fotográfico",
          "ko-KR": "사진 교류",
        }, locale) },
        { title: lang({
          "zh-CN": "小说漫画",
          "zh-TW": "小說漫畫",
          "en-US": "Novels & Comics",
          "es-ES": "Novelas y Cómics",
          "fr-FR": "Romans et BD",
          "ru-RU": "Романы и Комиксы",
          "ja-JP": "小説と漫画",
          "de-DE": "Romane & Comics",
          "pt-BR": "Romances e Quadrinhos",
          "ko-KR": "소설 및 만화",
        }, locale) },
        { title: lang({
          "zh-CN": "二次元天地",
          "zh-TW": "二次元天地",
          "en-US": "Anime & Manga World",
          "es-ES": "Mundo del Anime y Manga",
          "fr-FR": "Monde de l'Anime et du Manga",
          "ru-RU": "Мир Аниме и Манги",
          "ja-JP": "アニメとマンガの世界",
          "de-DE": "Anime & Manga Welt",
          "pt-BR": "Mundo do Anime e Mangá",
          "ko-KR": "애니메이션 및 만화 세계",
        }, locale) },
      ],
    },
    {
      title: lang({
        "zh-CN": "生活方式",
        "zh-TW": "生活方式",
        "en-US": "Lifestyle",
        "es-ES": "Estilo de Vida",
        "fr-FR": "Style de Vie",
        "ru-RU": "Образ Жизни",
        "ja-JP": "ライフスタイル",
        "de-DE": "Lebensstil",
        "pt-BR": "Estilo de Vida",
        "ko-KR": "라이프스타일",
      }, locale),
      items: [
        { title: lang({
          "zh-CN": "旅游分享",
          "zh-TW": "旅遊分享",
          "en-US": "Travel Sharing",
          "es-ES": "Compartir Viajes",
          "fr-FR": "Partage de Voyage",
          "ru-RU": "Путешествия",
          "ja-JP": "旅行シェア",
          "de-DE": "Reise-Sharing",
          "pt-BR": "Compartilhamento de Viagem",
          "ko-KR": "여행 공유",
        }, locale) },
        { title: lang({
          "zh-CN": "美食天地",
          "zh-TW": "美食天地",
          "en-US": "Food Paradise",
          "es-ES": "Paraíso Gastronómico",
          "fr-FR": "Paradis Culinaire",
          "ru-RU": "Кулинарный Рай",
          "ja-JP": "グルメパラダイス",
          "de-DE": "Kulinarisches Paradies",
          "pt-BR": "Paraíso Gastronômico",
          "ko-KR": "음식 천국",
        }, locale) },
        { title: lang({
          "zh-CN": "健身与健康",
          "zh-TW": "健身與健康",
          "en-US": "Fitness & Health",
          "es-ES": "Fitness y Salud",
          "fr-FR": "Fitness et Santé",
          "ru-RU": "Фитнес и Здоровье",
          "ja-JP": "フィットネスと健康",
          "de-DE": "Fitness & Gesundheit",
          "pt-BR": "Fitness e Saúde",
          "ko-KR": "피트니스 및 건강",
        }, locale) },
        { title: lang({
          "zh-CN": "家居与装修",
          "zh-TW": "家居與裝修",
          "en-US": "Home & Decoration",
          "es-ES": "Hogar y Decoración",
          "fr-FR": "Maison et Décoration",
          "ru-RU": "Дом и Декор",
          "ja-JP": "ホームと装飾",
          "de-DE": "Zuhause & Dekoration",
          "pt-BR": "Casa e Decoração",
          "ko-KR": "홈 및 인테리어",
        }, locale) },
        { title: lang({
          "zh-CN": "宠物天地",
          "zh-TW": "寵物天地",
          "en-US": "Pet World",
          "es-ES": "Mundo de Mascotas",
          "fr-FR": "Monde des Animaux",
          "ru-RU": "Мир Домашних Животных",
          "ja-JP": "ペットの世界",
          "de-DE": "Haustier-Welt",
          "pt-BR": "Mundo dos Pets",
          "ko-KR": "반려동물 세계",
        }, locale) },
        { title: lang({
          "zh-CN": "穿搭与美妆",
          "zh-TW": "穿搭與美妝",
          "en-US": "Fashion & Beauty",
          "es-ES": "Moda y Belleza",
          "fr-FR": "Mode et Beauté",
          "ru-RU": "Мода и Красота",
          "ja-JP": "ファッションと美容",
          "de-DE": "Mode & Schönheit",
          "pt-BR": "Moda e Beleza",
          "ko-KR": "패션 및 뷰티",
        }, locale) },
      ],
    },
    {
      title: lang({
        "zh-CN": "职业发展",
        "zh-TW": "職業發展",
        "en-US": "Career Development",
        "es-ES": "Desarrollo Profesional",
        "fr-FR": "Développement de Carrière",
        "ru-RU": "Карьерное Развитие",
        "ja-JP": "キャリア開発",
        "de-DE": "Karriereentwicklung",
        "pt-BR": "Desenvolvimento Profissional",
        "ko-KR": "경력 개발",
      }, locale),
      items: [
        { title: lang({
          "zh-CN": "求职与职场",
          "zh-TW": "求職與職場",
          "en-US": "Job Search & Workplace",
          "es-ES": "Búsqueda de Empleo y Lugar de Trabajo",
          "fr-FR": "Recherche d'Emploi et Lieu de Travail",
          "ru-RU": "Поиск Работы и Рабочее Место",
          "ja-JP": "就職活動と職場",
          "de-DE": "Jobsuche & Arbeitsplatz",
          "pt-BR": "Busca de Emprego e Local de Trabalho",
          "ko-KR": "구직 및 직장",
        }, locale) },
        { title: lang({
          "zh-CN": "理财投资",
          "zh-TW": "理財投資",
          "en-US": "Finance & Investment",
          "es-ES": "Finanzas e Inversión",
          "fr-FR": "Finance et Investissement",
          "ru-RU": "Финансы и Инвестиции",
          "ja-JP": "金融と投資",
          "de-DE": "Finanzen & Investment",
          "pt-BR": "Finanças e Investimento",
          "ko-KR": "금융 및 투자",
        }, locale) },
        { title: lang({
          "zh-CN": "留学与移民",
          "zh-TW": "留學與移民",
          "en-US": "Study Abroad & Immigration",
          "es-ES": "Estudiar en el Extranjero e Inmigración",
          "fr-FR": "Études à l'Étranger et Immigration",
          "ru-RU": "Обучение за Рубежом и Иммиграция",
          "ja-JP": "留学と移民",
          "de-DE": "Auslandsstudium & Immigration",
          "pt-BR": "Estudar no Exterior e Imigração",
          "ko-KR": "유학 및 이민",
        }, locale) },
        { title: lang({
          "zh-CN": "创业交流",
          "zh-TW": "創業交流",
          "en-US": "Entrepreneurship Exchange",
          "es-ES": "Intercambio de Emprendimiento",
          "fr-FR": "Échange d'Entrepreneuriat",
          "ru-RU": "Предпринимательский Обмен",
          "ja-JP": "起業交流",
          "de-DE": "Unternehmertum-Austausch",
          "pt-BR": "Intercâmbio de Empreendedorismo",
          "ko-KR": "창업 교류",
        }, locale) },
      ],
    },
    {
      title: lang({
        "zh-CN": "技术与创作",
        "zh-TW": "技術與創作",
        "en-US": "Technology & Creation",
        "es-ES": "Tecnología y Creación",
        "fr-FR": "Technologie et Création",
        "ru-RU": "Технологии и Творчество",
        "ja-JP": "テクノロジーと創作",
        "de-DE": "Technologie & Kreation",
        "pt-BR": "Tecnologia e Criação",
        "ko-KR": "기술 및 창작",
      }, locale),
      items: [
        { title: lang({
          "zh-CN": "数码硬件",
          "zh-TW": "數碼硬件",
          "en-US": "Digital Hardware",
          "es-ES": "Hardware Digital",
          "fr-FR": "Matériel Numérique",
          "ru-RU": "Цифровое Оборудование",
          "ja-JP": "デジタルハードウェア",
          "de-DE": "Digitale Hardware",
          "pt-BR": "Hardware Digital",
          "ko-KR": "디지털 하드웨어",
        }, locale) },
        { title: lang({
          "zh-CN": "手机与APP",
          "zh-TW": "手機與APP",
          "en-US": "Mobile & Apps",
          "es-ES": "Móvil y Aplicaciones",
          "fr-FR": "Mobile et Applications",
          "ru-RU": "Мобильные устройства и Приложения",
          "ja-JP": "モバイルとアプリ",
          "de-DE": "Mobil & Apps",
          "pt-BR": "Mobile e Apps",
          "ko-KR": "모바일 및 앱",
        }, locale) },
        { title: lang({
          "zh-CN": "网站开发",
          "zh-TW": "網站開發",
          "en-US": "Web Development",
          "es-ES": "Desarrollo Web",
          "fr-FR": "Développement Web",
          "ru-RU": "Веб-разработка",
          "ja-JP": "ウェブ開発",
          "de-DE": "Webentwicklung",
          "pt-BR": "Desenvolvimento Web",
          "ko-KR": "웹 개발",
        }, locale) },
        { title: lang({
          "zh-CN": "原创写作",
          "zh-TW": "原創寫作",
          "en-US": "Original Writing",
          "es-ES": "Escritura Original",
          "fr-FR": "Écriture Originale",
          "ru-RU": "Оригинальное Письмо",
          "ja-JP": "オリジナル執筆",
          "de-DE": "Originales Schreiben",
          "pt-BR": "Escrita Original",
          "ko-KR": "창작 글쓰기",
        }, locale) },
        { title: lang({
          "zh-CN": "设计与绘画",
          "zh-TW": "設計與繪畫",
          "en-US": "Design & Painting",
          "es-ES": "Diseño y Pintura",
          "fr-FR": "Design et Peinture",
          "ru-RU": "Дизайн и Живопись",
          "ja-JP": "デザインと絵画",
          "de-DE": "Design & Malerei",
          "pt-BR": "Design e Pintura",
          "ko-KR": "디자인 및 그림",
        }, locale) },
        { title: lang({
          "zh-CN": "DIY 与创客",
          "zh-TW": "DIY 與創客",
          "en-US": "DIY & Makers",
          "es-ES": "DIY y Creadores",
          "fr-FR": "DIY et Créateurs",
          "ru-RU": "DIY и Создатели",
          "ja-JP": "DIYとメーカー",
          "de-DE": "DIY & Maker",
          "pt-BR": "DIY e Criadores",
          "ko-KR": "DIY 및 메이커",
        }, locale) },
      ],
    },
  ];

  return (
    <html lang={locale} className={`${htmlClassName} scrollbar-gutter-stable`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeScript />
        <ThemeSync serverTheme={savedTheme} />
        <ContextMenuProvider locale={locale}>
          <ClientLayout locale={locale} savedTheme={savedTheme}>
            <PageTransition>
              {children}
            </PageTransition>
            <NewPostButton locale={locale} topics={topics} />
          </ClientLayout>
        </ContextMenuProvider>
      </body>
    </html>
  );
}
