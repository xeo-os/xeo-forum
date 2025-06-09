"use server";
import { headers } from "next/headers";
import { getThemeFromCookie} from "@/lib/theme-utils";

import { ThemeScript } from "@/components/theme-script";
import { ThemeSync } from "@/components/theme-sync";
import { PageTransition } from "@/components/page-transition";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children}: Props) {

  // 使用统一的主题处理逻辑
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const savedTheme = getThemeFromCookie(cookieHeader);

  return (
    <>
      <ThemeScript />
      <ThemeSync serverTheme={savedTheme} />
      <PageTransition>
        {children}
      </PageTransition>
    </>
  );
}
