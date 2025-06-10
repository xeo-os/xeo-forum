"use client";

import { useState } from "react";
import { ContextMenu } from "@/components/context-menu";
import { SearchSheet } from "@/components/search-sheet";

interface ContextMenuProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function ContextMenuProvider({ children, locale = "en-US" }: ContextMenuProviderProps) {
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchSheet(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setShowSearchSheet(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  return (
    <>
      <ContextMenu locale={locale} onSearch={handleSearch}>
        <div className="min-h-screen w-full">
          {children}
        </div>
      </ContextMenu>
      
      <SearchSheet
        open={showSearchSheet}
        onOpenChange={handleSheetOpenChange}
        locale={locale}
        initialQuery={searchQuery}
        onQueryChange={setSearchQuery}
      />
    </>
  );
}
