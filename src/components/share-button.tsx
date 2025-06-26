'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Share2, Copy, Check, QrCode, ExternalLink, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import lang from '@/lib/lang';
import QRCode from 'qrcode';

interface ShareButtonProps {
  postId: string;
  slug: string;
  title: string;
  locale: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  url?: string; // 新增
}

export function ShareButton({ postId, slug, title, locale, isOpen: externalOpen, onOpenChange, url }: ShareButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [ogImageLoaded, setOgImageLoaded] = useState(false);

  // 生成永久链接
  const permanentUrl = url || `https://xeoos.net/post/${postId}/${slug}`;
  const ogImageUrl = url ? `/api/dynamicImage/og?url=${new URL(url).pathname}` : `/api/dynamicImage/og?url=/${locale}/post/${postId}/${slug}`;
  // 生成 QR 码
  useEffect(() => {
    QRCode.toDataURL(permanentUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000',
        light: '#fff',
      },
    }).then((url) => {
      setQrCodeUrl(url);
    }).catch(console.error);
  }, [permanentUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(permanentUrl);
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
          'pt-BR': 'Falha ao copiar',          'ko-KR': '복사 실패',
        }, locale)
      );
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      setInternalOpen(true);
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(permanentUrl);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'line':
        shareUrl = `https://line.me/R/msg/text/?${encodedTitle}%20${encodedUrl}`;
        break;
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
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
      <Dialog open={isOpen} onOpenChange={open => {
        if (onOpenChange) {
          onOpenChange(open);
        } else {
          setInternalOpen(open);
        }
      }}>
        <DialogContent className="max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
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
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            {/* 永久链接 - 单独一行 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang({
                  'zh-CN': '永久链接',
                  'en-US': 'Permanent Link',
                  'zh-TW': '永久鏈接',
                  'es-ES': 'Enlace permanente',
                  'fr-FR': 'Lien permanent',
                  'ru-RU': 'Постоянная ссылка',
                  'ja-JP': '恒久リンク',
                  'de-DE': 'Permanenter Link',
                  'pt-BR': 'Link permanente',
                  'ko-KR': '영구 링크',
                }, locale)}
              </label>
              <div className="flex gap-2">
                <Input
                  value={permanentUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copied}
                  className="flex items-center gap-2 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline">
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
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline">
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
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* OG图片预览 - 单独一行 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang({
                  'zh-CN': '预览图片',
                  'en-US': 'Preview Image',
                  'zh-TW': '預覽圖片',
                  'es-ES': 'Imagen de vista previa',
                  'fr-FR': 'Image d\'aperçu',
                  'ru-RU': 'Изображение предварительного просмотра',
                  'ja-JP': 'プレビュー画像',
                  'de-DE': 'Vorschaubild',
                  'pt-BR': 'Imagem de visualização',
                  'ko-KR': '미리보기 이미지',
                }, locale)}
              </label>
              <div className="border rounded-lg overflow-hidden bg-muted">
                {!ogImageLoaded && (
                  <Skeleton className="w-full aspect-[1200/630]" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogImageUrl}
                  alt="Post preview"
                  className={`w-full aspect-[1200/630] object-cover transition-opacity duration-300 ${
                    ogImageLoaded ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                  onLoad={() => setOgImageLoaded(true)}
                  onError={() => setOgImageLoaded(true)}
                />
              </div>
            </div>

            {/* 二维码 - 仅在桌面端显示 */}
            <div className="hidden md:block">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                {lang({
                  'zh-CN': '二维码',
                  'en-US': 'QR Code',
                  'zh-TW': '二維碼',
                  'es-ES': 'Código QR',
                  'fr-FR': 'Code QR',
                  'ru-RU': 'QR-код',
                  'ja-JP': 'QRコード',
                  'de-DE': 'QR-Code',
                  'pt-BR': 'Código QR',
                  'ko-KR': 'QR 코드',
                }, locale)}
              </label>
              <div className="flex justify-center">
                {qrCodeUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="border rounded-lg"
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* 社交媒体分享按钮 */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                {lang({
                  'zh-CN': '分享到社交媒体',
                  'en-US': 'Share to Social Media',
                  'zh-TW': '分享到社交媒體',
                  'es-ES': 'Compartir en redes sociales',
                  'fr-FR': 'Partager sur les réseaux sociaux',
                  'ru-RU': 'Поделиться в социальных сетях',
                  'ja-JP': 'ソーシャルメディアで共有',
                  'de-DE': 'In sozialen Medien teilen',
                  'pt-BR': 'Compartilhar nas redes sociais',
                  'ko-KR': '소셜 미디어에 공유',
                }, locale)}
              </label>              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-1 md:gap-2 justify-start text-xs md:text-sm"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="truncate">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center gap-1 md:gap-2 justify-start text-xs md:text-sm"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="truncate">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('telegram')}
                  className="flex items-center gap-1 md:gap-2 justify-start text-xs md:text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="truncate">Telegram</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center gap-1 md:gap-2 justify-start text-xs md:text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="truncate">WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('weibo')}
                  className="flex items-center gap-1 md:gap-2 justify-start text-xs md:text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="truncate">
                    {lang({
                      'zh-CN': '微博',
                      'en-US': 'Weibo',
                      'zh-TW': '微博',
                      'es-ES': 'Weibo',
                      'fr-FR': 'Weibo',
                      'ru-RU': 'Weibo',
                      'ja-JP': 'Weibo',
                      'de-DE': 'Weibo',
                      'pt-BR': 'Weibo',
                      'ko-KR': 'Weibo',
                    }, locale)}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('line')}
                  className="flex items-center gap-1 md:gap-2 justify-start text-xs md:text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="truncate">LINE</span>
                </Button>
              </div>
            </div>

            <div className="text-xs md:text-sm text-muted-foreground text-center mt-4">
              {lang({
                'zh-CN': '扫描二维码或复制链接分享给朋友',
                'en-US': 'Scan the QR code or copy the link to share with friends',
                'zh-TW': '掃描二維碼或複製鏈接分享給朋友',
                'es-ES': 'Escanea el código QR o copia el enlace para compartir con amigos',
                'fr-FR': 'Scannez le code QR ou copiez le lien pour partager avec des amis',
                'ru-RU': 'Отсканируйте QR-код или скопируйте ссылку, чтобы поделиться с друзьями',
                'ja-JP': 'QRコードをスキャンするか、リンクをコピーして友達と共有してください',
                'de-DE': 'Scannen Sie den QR-Code oder kopieren Sie den Link, um ihn mit Freunden zu teilen',
                'pt-BR': 'Escaneie o código QR ou copie o link para compartilhar com amigos',
                'ko-KR': 'QR 코드를 스캔하거나 링크를 복사하여 친구들과 공유하세요',
              }, locale)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
