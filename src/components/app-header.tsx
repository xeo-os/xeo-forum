"use client";

import { SidebarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import lang from "@/lib/lang";

export function SiteHeader({ locale }: { locale?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background border-b w-full fixed top-0 z-50">
      <div className="flex h-14 w-full items-center gap-2 px-4 relative">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${locale || "/en-US"}`}
                className="font-bold text-primary hover:underline"
              >
                XEO OS
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {lang(
                  {
                    "en-US": "Forum",
                    "zh-CN": "论坛",
                    "zh-TW": "論壇",
                    "es-ES": "Foro",
                    "fr-FR": "Forum",
                    "ru-RU": "Форум",
                    "ja-JP": "フォーラム",
                    "de-DE": "Forum",
                    "pt-BR": "Fórum",
                    "ko-KR": "포럼",
                  },
                  locale
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <SearchForm
            locale={locale || "en-US"}
            className="w-40 sm:w-64 transition-all duration-300 ease-in-out focus-within:w-56 focus-within:sm:w-96"
          />
        </div>
        <Avatar className="ml-auto">
          <AvatarImage src="https://ravelloh.top/avatar.jpg" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
