type LocaleKey =
  | "en-US"
  | "zh-CN"
  | "zh-TW"
  | "es-ES"
  | "fr-FR"
  | "ru-RU"
  | "ja-JP"
  | "de-DE"
  | "pt-BR"
  | "ko-KR";

type LangTexts = Record<LocaleKey, string>;

// 缓存当前语言以避免重复解析
let cachedLocale: string | null = null;
let lastPathname: string | null = null;

function getCurrentLocale(): string {
  // 服务端渲染时总是返回默认语言，避免hydration不匹配
  if (typeof window === "undefined") return "en-US";

  const currentPathname = window.location.pathname;

  // 如果路径没有变化，直接返回缓存的语言
  if (currentPathname === lastPathname && cachedLocale) {
    return cachedLocale;
  }

  // 更新缓存
  lastPathname = currentPathname;
  cachedLocale = currentPathname.split("/")[1] || "en-US";

  return cachedLocale;
}

export default function lang(langs: LangTexts, locale?: string): string {
  // 如果提供了locale参数，直接使用（用于服务端组件）
  if (locale) {
    return langs[locale as LocaleKey] || langs["en-US"];
  }

  // 服务端渲染时总是返回英语，避免hydration错误
  if (typeof window === "undefined") {
    return langs["en-US"];
  }

  // 获取当前语言代码（使用缓存）
  const currentLocale = getCurrentLocale();

  // 类型安全的语言匹配
  return langs[currentLocale as LocaleKey] || langs["en-US"];
}

// 服务端安全的钩子函数
export function useLang(): string {
  if (typeof window === "undefined") return "en-US";
  return getCurrentLocale();
}

// 清除缓存的函数（在路由变化时调用）
export function clearLocaleCache(): void {
  cachedLocale = null;
  lastPathname = null;
}

// 预设语言，避免每次都重新创建对象
export function createLangTemplate(): LangTexts {
  return {
    "en-US": "",
    "zh-CN": "",
    "zh-TW": "",
    "es-ES": "",
    "fr-FR": "",
    "ru-RU": "",
    "ja-JP": "",
    "de-DE": "",
    "pt-BR": "",
    "ko-KR": "",
  };
}

export function langList(): LocaleKey[] {
  return [
    "en-US",
    "zh-CN",
    "zh-TW",
    "es-ES",
    "fr-FR",
    "ru-RU",
    "ja-JP",
    "de-DE",
    "pt-BR",
    "ko-KR",
  ];
}

export function langName(locale: string): string {
  const names: Record<LocaleKey, string> = {
    "en-US": "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁体中文",
    "es-ES": "Español",
    "fr-FR": "Français",
    "ru-RU": "Русский",
    "ja-JP": "日本語",
    "de-DE": "Deutsch ",
    "pt-BR": "Português",
    "ko-KR": "한국어",
  };

  return names[locale as LocaleKey] || names["en-US"];
}

/* eg:

lang({
    'en-US': '',
    'zh-CN': '',
    'zh-TW': '',
    'es-ES': '',
    'fr-FR': '',
    'ru-RU': '',
    'ja-JP': '',
    'de-DE': '',
    'pt-BR': '',
    'ko-KR': ''
})

*/
