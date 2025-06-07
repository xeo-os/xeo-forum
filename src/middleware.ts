import { NextRequest, NextResponse } from "next/server";

// 定义支持的语言和对应的国家
const locales = ["en", "zh", "ja", "ko"];
const countryToLocale: Record<string, string> = {
  CN: "zh", // 中国
  TW: "zh", // 台湾
  HK: "zh", // 香港
  MO: "zh", // 澳门
  SG: "zh", // 新加坡（华语用户）
  JP: "ja", // 日本
  KR: "ko", // 韩国
  // 其他国家默认使用英语
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查路径是否已经包含语言前缀
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // 获取用户的国家信息
  const country = request.geo?.country || request.headers.get("cf-ipcountry");

  // 根据国家确定语言
  const locale = countryToLocale[country || ""] || "en";

  // 重定向到相应的语言路径
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    // 跳过内部路径 (_next)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
