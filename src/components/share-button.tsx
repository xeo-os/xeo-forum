'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';

interface ShareButtonProps {
  title: string;
  locale: string;
}

export function ShareButton({ title, locale }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success(
        lang({
          'zh-CN': '链接已复制到剪贴板',
          'en-US': 'Link copied to clipboard',
          'zh-TW': '鏈接已複製到剪貼板',
          'es-ES': 'Enlace copiado al portapapeles',
          'fr-FR': 'Lien copié dans le presse-papiers',
          'ru-RU': 'Ссылка скопирована в буфер обмена',
          'ja-JP': 'リンクがクリップボードにコピーされました',
          'de-DE': 'Link in die Zwischenablage kopiert',
          'pt-BR': 'Link copiado para a área de transferência',
          'ko-KR': '링크가 클립보드에 복사되었습니다',
        }, locale)
      );
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(
        lang({
          'zh-CN': '复制失败',
          'en-US': 'Failed to copy',
          'zh-TW': '複製失敗',
          'es-ES': 'Error al copiar',
          'fr-FR': 'Échec de la copie',
          'ru-RU': 'Не удалось скопировать',
          'ja-JP': 'コピーに失敗しました',
          'de-DE': 'Kopieren fehlgeschlagen',
          'pt-BR': 'Falha ao copiar',
          'ko-KR': '복사 실패',
        }, locale)
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: currentUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        {lang({
          'zh-CN': '分享',
          'en-US': 'Share',
          'zh-TW': '分享',
          'es-ES': 'Compartir',
          'fr-FR': 'Partager',
          'ru-RU': 'Поделиться',
          'ja-JP': '共有',
          'de-DE': 'Teilen',
          'pt-BR': 'Compartilhar',
          'ko-KR': '공유',
        }, locale)}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {lang({
                'zh-CN': '分享帖子',
                'en-US': 'Share Post',
                'zh-TW': '分享貼文',
                'es-ES': 'Compartir publicación',
                'fr-FR': 'Partager le message',
                'ru-RU': 'Поделиться сообщением',
                'ja-JP': '投稿を共有',
                'de-DE': 'Beitrag teilen',
                'pt-BR': 'Compartilhar postagem',
                'ko-KR': '게시물 공유',
              }, locale)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang({
                  'zh-CN': '帖子链接',
                  'en-US': 'Post Link',
                  'zh-TW': '貼文鏈接',
                  'es-ES': 'Enlace de la publicación',
                  'fr-FR': 'Lien du message',
                  'ru-RU': 'Ссылка на сообщение',
                  'ja-JP': '投稿リンク',
                  'de-DE': 'Beitragslink',
                  'pt-BR': 'Link da postagem',
                  'ko-KR': '게시물 링크',
                }, locale)}
              </label>
              <div className="flex gap-2">
                <Input
                  value={currentUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copied}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {lang({
                        'zh-CN': '已复制',
                        'en-US': 'Copied',
                        'zh-TW': '已複製',
                        'es-ES': 'Copiado',
                        'fr-FR': 'Copié',
                        'ru-RU': 'Скопировано',
                        'ja-JP': 'コピー済み',
                        'de-DE': 'Kopiert',
                        'pt-BR': 'Copiado',
                        'ko-KR': '복사됨',
                      }, locale)}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {lang({
                        'zh-CN': '复制',
                        'en-US': 'Copy',
                        'zh-TW': '複製',
                        'es-ES': 'Copiar',
                        'fr-FR': 'Copier',
                        'ru-RU': 'Копировать',
                        'ja-JP': 'コピー',
                        'de-DE': 'Kopieren',
                        'pt-BR': 'Copiar',
                        'ko-KR': '복사',
                      }, locale)}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {lang({
                'zh-CN': '复制链接并分享给您的朋友',
                'en-US': 'Copy the link and share it with your friends',
                'zh-TW': '複製鏈接並分享給您的朋友',
                'es-ES': 'Copia el enlace y compártelo con tus amigos',
                'fr-FR': 'Copiez le lien et partagez-le avec vos amis',
                'ru-RU': 'Скопируйте ссылку и поделитесь с друзьями',
                'ja-JP': 'リンクをコピーして友達と共有してください',
                'de-DE': 'Kopieren Sie den Link und teilen Sie ihn mit Ihren Freunden',
                'pt-BR': 'Copie o link e compartilhe com seus amigos',
                'ko-KR': '링크를 복사하여 친구들과 공유하세요',
              }, locale)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
