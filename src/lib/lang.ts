type LocaleKey = 'en-US' | 'zh-CN' | 'zh-TW' | 'es-ES' | 'fr-FR' | 'ru-RU' | 'ja-JP' | 'de-DE' | 'pt-BR' | 'ko-KR';

type LangTexts = Record<LocaleKey, string>;

export default function lang(langs: LangTexts, locale?: string): string {
  // 服务端渲染兼容性检查
  if (typeof window === 'undefined' && !locale) {
    return langs['en-US'];
  }
  
  // 获取当前语言代码
  const currentLocale = locale || (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en-US');
  
  // 类型安全的语言匹配
  return langs[currentLocale as LocaleKey] || langs['en-US'];
}

// 便捷的钩子函数用于React组件
export function useLang() {
  if (typeof window === 'undefined') return 'en-US';
  return window.location.pathname.split('/')[1] || 'en-US';
}

/* eg:

lang({
    'en-US':
    'zh-CN':
    'zh-TW':
    'es-ES':
    'fr-FR':
    'ru-RU':
    'ja-JP':
    'de-DE':
    'pt-BR':
    'ko-KR':
})

*/