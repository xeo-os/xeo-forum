"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { RiExpandUpDownLine } from "@remixicon/react";

import lang, { langName, langList } from "@/lib/lang";

import { Separator } from "@/components/ui/separator";

import { useState, useEffect } from "react";
import { SidebarInner } from "./sidebar-inner";
import { useRouter, usePathname } from "next/navigation";

export function AppSidebar({
  locale,
  currentTheme,
  topics,
}: {
  locale: string;
  currentTheme: string;
  topics: {
    title: string;
    icon: string;
    name: string;
    items?: { title: string; url: string; icon: string; name: string }[];
  }[];
}) {
  const [theme, setTheme] = useState<string>(currentTheme);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);

    // 直接设置 Cookie
    document.cookie = `theme=${newTheme}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // 立即应用主题到 DOM
    const root = document.documentElement;
    root.classList.remove("dark", "light");

    if (newTheme === "dark") {
      root.classList.add("dark");
    }

    // 刷新页面以确保服务端渲染的 HTML 类名正确
    router.refresh();
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      default:
        return "☀️"; // 默认亮色
    }
  };

  const getThemeLabel = () => {
    const labels = {
      light: {
        "zh-CN": "亮色主题",
        "de-DE": "Helles Thema",
        "en-US": "Light Theme",
        "es-ES": "Tema Claro",
        "fr-FR": "Thème Clair",
        "ja-JP": "ライトテーマ",
        "ko-KR": "라이트 테마",
        "pt-BR": "Tema Claro",
        "ru-RU": "Светлая Тема",
        "zh-TW": "亮色主題",
      },
      dark: {
        "zh-CN": "暗色主题",
        "de-DE": "Dunkles Thema",
        "en-US": "Dark Theme",
        "es-ES": "Tema Oscuro",
        "fr-FR": "Thème Sombre",
        "ja-JP": "ダークテーマ",
        "ko-KR": "다크 테마",
        "pt-BR": "Tema Escuro",
        "ru-RU": "Темная Тема",
        "zh-TW": "暗色主題",
      },
    };
    return lang(labels[theme as keyof typeof labels] || labels.light, locale);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarInner locale={locale} topics={topics} />
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {getThemeIcon()} {getThemeLabel()}
                  <RiExpandUpDownLine className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-full">
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <DropdownMenuRadioItem value="light">
                    ☀️
                    {lang(
                      {
                        "zh-CN": "亮色主题",
                        "de-DE": "Helles Thema",
                        "en-US": "Light Theme",
                        "es-ES": "Tema Claro",
                        "fr-FR": "Thème Clair",
                        "ja-JP": "ライトテーマ",
                        "ko-KR": "라이트 테마",
                        "pt-BR": "Tema Claro",
                        "ru-RU": "Светлая Тема",
                        "zh-TW": "亮色主題",
                      },
                      locale
                    )}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    🌙{" "}
                    {lang(
                      {
                        "zh-CN": "暗色主题",
                        "de-DE": "Dunkles Thema",
                        "en-US": "Dark Theme",
                        "es-ES": "Tema Oscuro",
                        "fr-FR": "Thème Sombre",
                        "ja-JP": "ダークテーマ",
                        "ko-KR": "다크 테마",
                        "pt-BR": "Tema Escuro",
                        "ru-RU": "Темная Тема",
                        "zh-TW": "暗色主題",
                      },
                      locale
                    )}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  🌏 {langName(locale)}
                  <RiExpandUpDownLine className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-full">
                {langList().map((lang) => (
                  <DropdownMenuItem key={lang}>
                    <a
                      href={`/${lang}${pathname.replace(`/${locale}`, "")}`}
                      className="block w-full text-center"
                    >
                      {langName(lang)}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
