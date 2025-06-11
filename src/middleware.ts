import { NextRequest, NextResponse } from 'next/server';

const locales = [
    'en-US', // 英语（美国）
    'zh-CN', // 简体中文（中国）
    'zh-TW', // 繁体中文（台湾）
    'es-ES', // 西班牙语（西班牙）
    'fr-FR', // 法语（法国）
    'ru-RU', // 俄语（俄罗斯）
    'ja-JP', // 日语（日本）
    'de-DE', // 德语（德国）
    'pt-BR', // 葡萄牙语（巴西）
    'ko-KR', // 韩语（韩国）
];

const countryToLocale: Record<string, string> = {
    // 中文（简体） - 中国大陆
    CN: 'zh-CN',

    // 中文（繁体） - 台湾、香港、澳门
    TW: 'zh-TW',
    HK: 'zh-TW',
    MO: 'zh-TW',

    // 英语 - 美国、英国、加拿大（默认）、澳大利亚、新西兰、印度、新加坡等
    US: 'en-US',
    GB: 'en-US',
    CA: 'en-US', // 默认英语，魁北克省用户除外
    AU: 'en-US',
    NZ: 'en-US',
    IN: 'en-US',
    SG: 'en-US',
    IE: 'en-US',
    ZA: 'en-US',
    PH: 'en-US',
    MY: 'en-US',

    // 西班牙语 - 西班牙及大多数拉美国家
    ES: 'es-ES',
    MX: 'es-ES',
    AR: 'es-ES',
    CO: 'es-ES',
    PE: 'es-ES',
    VE: 'es-ES',
    CL: 'es-ES',
    EC: 'es-ES',
    GT: 'es-ES',
    CU: 'es-ES',
    DO: 'es-ES',
    HN: 'es-ES',
    PY: 'es-ES',
    SV: 'es-ES',
    NI: 'es-ES',
    CR: 'es-ES',
    BO: 'es-ES',
    UY: 'es-ES',
    PA: 'es-ES',

    // 法语 - 法国、比利时、瑞士、加拿大（部分）
    FR: 'fr-FR',
    BE: 'fr-FR',
    CH: 'fr-FR', // 德语为主，但保留法语
    LU: 'fr-FR', // 卢森堡
    MC: 'fr-FR',

    // 俄语 - 俄罗斯、独联体国家
    RU: 'ru-RU',
    BY: 'ru-RU',
    KZ: 'ru-RU',
    KG: 'ru-RU',
    UA: 'ru-RU', // 许多地区讲俄语

    // 日语 - 日本
    JP: 'ja-JP',

    // 德语 - 德国、奥地利、瑞士
    DE: 'de-DE',
    AT: 'de-DE',

    // 葡萄牙语 - 巴西、葡萄牙
    BR: 'pt-BR',
    PT: 'pt-BR', // 或使用 "pt-PT"，取决于你是否支持两个变体

    // 韩语 - 韩国
    KR: 'ko-KR',

    // 荷兰语 - 荷兰、比利时部分地区
    NL: 'nl-NL',
};

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): string | null {
    if (!acceptLanguage) return null;

    const languages = acceptLanguage
        .split(',')
        .map((lang) => {
            const [locale, quality = '1'] = lang.trim().split(';q=');
            return { locale: locale.toLowerCase(), quality: parseFloat(quality) };
        })
        .sort((a, b) => b.quality - a.quality);

    for (const { locale } of languages) {
        // 精确匹配（转换为大写格式）
        const normalizedLocale = locale.toUpperCase();
        const matchedLocale = locales.find((l) => l.toUpperCase() === normalizedLocale);
        if (matchedLocale) {
            return matchedLocale;
        }

        // 处理中文的特殊情况
        if (locale.startsWith('zh')) {
            if (locale.includes('cn') || locale.includes('hans') || locale === 'zh') {
                return 'zh-CN';
            }
            if (locale.includes('hk') || locale.includes('tw') || locale.includes('hant')) {
                return 'zh-TW';
            }
        }

        // 语言代码匹配（如 'es' -> 'es-ES'）
        const langCode = locale.split('-')[0];
        const matchedByLangCode = locales.find((l) => l.toLowerCase().startsWith(langCode + '-'));
        if (matchedByLangCode) {
            return matchedByLangCode;
        }
    }

    return null;
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 检查路径是否已经包含语言前缀或包含 "lang=" 参数
    const pathnameHasLocale =
        locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) ||
        request.nextUrl.searchParams.has('lang');

    if (pathnameHasLocale) {
        // 如果已经有语言前缀，添加路径信息到 headers 并继续
        const response = NextResponse.next();
        response.headers.set('x-pathname', request.nextUrl.pathname);
        return response;
    }

    // 优先使用浏览器的Accept-Language头
    const acceptLanguage = request.headers.get('accept-language');
    let locale = getLocaleFromAcceptLanguage(acceptLanguage);

    // 如果Accept-Language没有匹配的语言，则使用地理位置
    if (!locale) {
        const country = request.headers.get('cf-ipcountry');
        locale = countryToLocale[country || ''] || 'en-US';
    }

    // 特殊页面，重定向时保留原有的query参数并添加lang参数
    if (config.specialPages.includes(pathname)) {
        const redirectUrl = new URL(pathname, request.url);
        redirectUrl.search = request.nextUrl.search;
        redirectUrl.searchParams.set('lang', locale);
        const response = NextResponse.redirect(redirectUrl);
        response.headers.set('x-pathname', pathname);
        return response;
    }

    // 重定向到相应的语言路径
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('x-pathname', `/${locale}${pathname}`);
    return response;
}

export const config = {
    matcher: [
        // 匹配所有路径，但排除以下路径：
        // - _next/static (静态文件)
        // - _next/image (图片优化)
        // - favicon.ico (网站图标)
        // - 其他静态资源
        '/((?!_next/static|_next/image|icon|favicon.ico|manifest.webmanifest|api|example|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2|ttf|otf)).*)',
    ],
    specialPages: ['/signin', '/signup', '/verify', '/reset-password', '/policies', '/contact'],
};
