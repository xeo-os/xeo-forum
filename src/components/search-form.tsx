import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import lang from "@/lib/lang";
export function SearchForm({ locale, ...props }: React.ComponentProps<"form"> & { locale: string }) {
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder={lang({
            "en-US": "Search...",
            "zh-CN": "搜索...",
            "zh-TW": "搜尋...",
            "es-ES": "Buscar...",
            "fr-FR": "Rechercher...",
            "ru-RU": "Поиск...",
            "ja-JP": "検索...",
            "de-DE": "Suche...",
            "pt-BR": "Pesquisar...",
            "ko-KR": "검색...",
          }, locale)}
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  );
}
