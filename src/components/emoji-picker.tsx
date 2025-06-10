"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiEmotionLine } from "@remixicon/react";
import lang from "@/lib/lang";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  locale?: string;
}

export function EmojiPicker({ onEmojiSelect, locale = "en-US" }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const emojiCategories = {
    smileys: {
      name: "😀",
      label: lang({
        "zh-CN": "笑脸与表情",
        "zh-TW": "笑臉與表情",
        "en-US": "Smileys & Emotion",
        "es-ES": "Caritas y Emociones",
        "fr-FR": "Sourires et Émotions",
        "ru-RU": "Смайлы и Эмоции",
        "ja-JP": "スマイリーと感情",
        "de-DE": "Smileys & Emotionen",
        "pt-BR": "Sorrisos e Emoções",
        "ko-KR": "스마일리 및 감정",
      }, locale),
      emojis: [
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
        "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
        "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
        "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
        "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬"
      ]
    },
    animals: {
      name: "🐶",
      label: lang({
        "zh-CN": "动物与自然",
        "zh-TW": "動物與自然",
        "en-US": "Animals & Nature",
        "es-ES": "Animales y Naturaleza",
        "fr-FR": "Animaux et Nature",
        "ru-RU": "Животные и Природа",
        "ja-JP": "動物と自然",
        "de-DE": "Tiere & Natur",
        "pt-BR": "Animais e Natureza",
        "ko-KR": "동물 및 자연",
      }, locale),
      emojis: [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
        "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
        "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦢", "🦅", "🦉",
        "🦚", "🦜", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌"
      ]
    },
    food: {
      name: "🍎",
      label: lang({
        "zh-CN": "食物与饮料",
        "zh-TW": "食物與飲料",
        "en-US": "Food & Drink",
        "es-ES": "Comida y Bebida",
        "fr-FR": "Nourriture et Boisson",
        "ru-RU": "Еда и Напитки",
        "ja-JP": "食べ物と飲み物",
        "de-DE": "Essen & Trinken",
        "pt-BR": "Comida e Bebida",
        "ko-KR": "음식 및 음료",
      }, locale),
      emojis: [
        "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
        "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
        "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔",
        "🍠", "🥐", "🥖", "🍞", "🥨", "🥯", "🧀", "🥚", "🍳", "🧈"
      ]
    },
    activities: {
      name: "⚽",
      label: lang({
        "zh-CN": "活动与运动",
        "zh-TW": "活動與運動",
        "en-US": "Activities & Sports",
        "es-ES": "Actividades y Deportes",
        "fr-FR": "Activités et Sports",
        "ru-RU": "Активности и Спорт",
        "ja-JP": "活動とスポーツ",
        "de-DE": "Aktivitäten & Sport",
        "pt-BR": "Atividades e Esportes",
        "ko-KR": "활동 및 스포츠",
      }, locale),
      emojis: [
        "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
        "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
        "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️",
        "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️", "🤺"
      ]
    },
    objects: {
      name: "📱",
      label: lang({
        "zh-CN": "物品与工具",
        "zh-TW": "物品與工具",
        "en-US": "Objects & Tools",
        "es-ES": "Objetos y Herramientas",
        "fr-FR": "Objets et Outils",
        "ru-RU": "Объекты и Инструменты",
        "ja-JP": "オブジェクトとツール",
        "de-DE": "Objekte & Werkzeuge",
        "pt-BR": "Objetos e Ferramentas",
        "ko-KR": "물체 및 도구",
      }, locale),
      emojis: [
        "📱", "💻", "🖥️", "🖨️", "⌨️", "🖱️", "🖲️", "💽", "💾", "💿",
        "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️",
        "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️",
        "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️"
      ]
    },
    symbols: {
      name: "❤️",
      label: lang({
        "zh-CN": "符号与标志",
        "zh-TW": "符號與標誌",
        "en-US": "Symbols & Flags",
        "es-ES": "Símbolos y Banderas",
        "fr-FR": "Symboles et Drapeaux",
        "ru-RU": "Символы и Флаги",
        "ja-JP": "シンボルと旗",
        "de-DE": "Symbole & Flaggen",
        "pt-BR": "Símbolos e Bandeiras",
        "ko-KR": "기호 및 깃발",
      }, locale),
      emojis: [
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
        "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
        "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
        "⭐", "🌟", "✨", "⚡", "☄️", "💫", "🌀", "🌈", "☀️", "🌤️"
      ]
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 w-9 p-0 border-dashed border-2 hover:border-[#f0b100] hover:bg-[#f0b100]/10 hover:text-[#f0b100] transition-all duration-200 rounded-md"
          title={lang({
            "zh-CN": "添加表情符号",
            "zh-TW": "添加表情符號",
            "en-US": "Add emoji",
            "es-ES": "Agregar emoji",
            "fr-FR": "Ajouter un emoji",
            "ru-RU": "Добавить эмодзи",
            "ja-JP": "絵文字を追加",
            "de-DE": "Emoji hinzufügen",
            "pt-BR": "Adicionar emoji",
            "ko-KR": "이모지 추가",
          }, locale)}
        >
          <RiEmotionLine className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">
            {lang({
              "zh-CN": "选择表情符号",
              "zh-TW": "選擇表情符號",
              "en-US": "Choose an emoji",
              "es-ES": "Elige un emoji",
              "fr-FR": "Choisissez un emoji",
              "ru-RU": "Выберите эмодзи",
              "ja-JP": "絵文字を選択",
              "de-DE": "Wählen Sie ein Emoji",
              "pt-BR": "Escolha um emoji",
              "ko-KR": "이모지를 선택하세요",
            }, locale)}
          </h4>
        </div>
        
        <Tabs defaultValue="smileys" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-muted/30 m-2 rounded-lg">
            {Object.entries(emojiCategories).map(([key, category]) => (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="text-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#f0b100]"
                title={category.label}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(emojiCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="m-0">
              <ScrollArea className="h-56 p-3">
                <div className="grid grid-cols-8 gap-1">
                  {category.emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-xl hover:bg-[#f0b100]/10 hover:scale-110 transition-all duration-200 rounded-lg"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
