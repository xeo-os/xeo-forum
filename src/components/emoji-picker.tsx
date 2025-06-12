'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import lang from '@/lib/lang';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  locale: string;
}

export function EmojiPicker({ onEmojiSelect, locale }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const emojiCategories = [
    {
      name: lang({
        'zh-CN': '笑脸',
        'en-US': 'Smileys',
        'zh-TW': '笑臉',
        'es-ES': 'Caritas sonrientes',
        'fr-FR': 'Émoticônes',
        'ru-RU': 'Смайлики',
        'ja-JP': 'スマイリー',
        'de-DE': 'Smileys',
        'pt-BR': 'Sorrisos',
        'ko-KR': '웃는 얼굴',
      }, locale),
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸'],
    },
    {
      name: lang({
        'zh-CN': '手势',
        'en-US': 'Gestures',
        'zh-TW': '手勢',
        'es-ES': 'Gestos',
        'fr-FR': 'Gestes',
        'ru-RU': 'Жесты',
        'ja-JP': 'ジェスチャー',
        'de-DE': 'Gesten',
        'pt-BR': 'Gestos',
        'ko-KR': '손짓',
      }, locale),
      emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    },
    {
      name: lang({
        'zh-CN': '心形',
        'en-US': 'Hearts',
        'zh-TW': '心形',
        'es-ES': 'Corazones',
        'fr-FR': 'Cœurs',
        'ru-RU': 'Сердца',
        'ja-JP': 'ハート',
        'de-DE': 'Herzen',
        'pt-BR': 'Corações',
        'ko-KR': '하트',
      }, locale),
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    },
    {
      name: lang({
        'zh-CN': '其他',
        'en-US': 'Others',
        'zh-TW': '其他',
        'es-ES': 'Otros',
        'fr-FR': 'Autres',
        'ru-RU': 'Другие',
        'ja-JP': 'その他',
        'de-DE': 'Andere',
        'pt-BR': 'Outros',
        'ko-KR': '기타',
      }, locale),
      emojis: ['🔥', '✨', '💫', '⭐', '🌟', '💥', '💯', '💢', '💨', '💦', '💤', '🎉', '🎊', '🎈', '🎀', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️', '🎫', '🎪'],
    },
  ];

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="max-h-64 overflow-y-auto">
          {emojiCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="p-3 border-b last:border-b-0">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {category.name}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji, emojiIndex) => (
                  <button
                    key={emojiIndex}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
