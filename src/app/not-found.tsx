'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RiHomeLine, RiMailLine, RiTimeLine, RiRouterLine } from '@remixicon/react';
import '@/app/globals.css';
import lang from '@/lib/lang';

export default function NotFound() {
    const pathname = usePathname();

    // 从路径中提取语言代码，默认为中文
    const locale = pathname?.split('/')[1] || 'zh-CN';

    const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    });

    const reportEmail = `mailto:report@xeoos.net?subject=${encodeURIComponent(
        lang(
            {
                'zh-CN': '404 页面报告',
                'zh-TW': '404 頁面報告',
                'en-US': '404 Page Report',
                'es-ES': 'Reporte de Página 404',
                'fr-FR': 'Rapport de Page 404',
                'ru-RU': 'Отчет о Странице 404',
                'ja-JP': '404ページレポート',
                'de-DE': '404-Seiten-Bericht',
                'pt-BR': 'Relatório de Página 404',
                'ko-KR': '404 페이지 보고서',
            },
            locale,
        ),
    )}&body=${encodeURIComponent(
        lang(
            {
                'zh-CN': `请求时间: ${currentTime}\n请求路径: ${pathname}\n\n请描述您遇到的问题:\n`,
                'zh-TW': `請求時間: ${currentTime}\n請求路徑: ${pathname}\n\n請描述您遇到的問題:\n`,
                'en-US': `Request Time: ${currentTime}\nRequest Path: ${pathname}\n\nPlease describe the issue you encountered:\n`,
                'es-ES': `Hora de Solicitud: ${currentTime}\nRuta de Solicitud: ${pathname}\n\nPor favor describe el problema que encontraste:\n`,
                'fr-FR': `Heure de Demande: ${currentTime}\nChemin de Demande: ${pathname}\n\nVeuillez décrire le problème que vous avez rencontré:\n`,
                'ru-RU': `Время Запроса: ${currentTime}\nПуть Запроса: ${pathname}\n\nПожалуйста, опишите проблему, с которой вы столкнулись:\n`,
                'ja-JP': `リクエスト時刻: ${currentTime}\nリクエストパス: ${pathname}\n\n遭遇した問題を説明してください:\n`,
                'de-DE': `Anfrage-Zeit: ${currentTime}\nAnfrage-Pfad: ${pathname}\n\nBitte beschreiben Sie das Problem, auf das Sie gestoßen sind:\n`,
                'pt-BR': `Horário da Solicitação: ${currentTime}\nCaminho da Solicitação: ${pathname}\n\nPor favor, descreva o problema que você encontrou:\n`,
                'ko-KR': `요청 시간: ${currentTime}\n요청 경로: ${pathname}\n\n발생한 문제를 설명해 주세요:\n`,
            },
            locale,
        ),
    )}`;

    return (
        <html lang={locale} className='scrollbar-gutter-stable'>
            <body suppressHydrationWarning>
                <div className='min-h-screen flex items-center justify-center p-4 bg-background dark'>
                    <Card className='w-full max-w-md mx-auto shadow-lg'>
                        <CardHeader className='text-center'>
                            <div className='mb-4'>
                                <div className='text-6xl font-bold text-muted-foreground mb-2'>
                                    404
                                </div>
                                <Badge variant='destructive' className='text-sm'>
                                    {lang(
                                        {
                                            'zh-CN': '页面未找到',
                                            'zh-TW': '頁面未找到',
                                            'en-US': 'Page Not Found',
                                            'es-ES': 'Página No Encontrada',
                                            'fr-FR': 'Page Non Trouvée',
                                            'ru-RU': 'Страница Не Найдена',
                                            'ja-JP': 'ページが見つかりません',
                                            'de-DE': 'Seite Nicht Gefunden',
                                            'pt-BR': 'Página Não Encontrada',
                                            'ko-KR': '페이지를 찾을 수 없습니다',
                                        },
                                        locale,
                                    )}
                                </Badge>
                            </div>
                            <CardTitle className='text-xl'>
                                {lang(
                                    {
                                        'zh-CN': '抱歉，页面不存在',
                                        'zh-TW': '抱歉，頁面不存在',
                                        'en-US': 'Sorry, the page does not exist',
                                        'es-ES': 'Lo sentimos, la página no existe',
                                        'fr-FR': "Désolé, la page n'existe pas",
                                        'ru-RU': 'Извините, страница не найдена',
                                        'ja-JP': '申し訳ありませんが、ページは存在しません',
                                        'de-DE': 'Entschuldigung, die Seite existiert nicht',
                                        'pt-BR': 'Desculpe, a página não existe',
                                        'ko-KR': '죄송합니다, 페이지가 존재하지 않습니다',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                            <CardDescription>
                                {lang(
                                    {
                                        'zh-CN': '您访问的页面可能已被移动、删除或从未存在过',
                                        'zh-TW': '您訪問的頁面可能已被移動、刪除或從未存在過',
                                        'en-US':
                                            'The page you are looking for might have been moved, deleted, or never existed',
                                        'es-ES':
                                            'La página que buscas puede haber sido movida, eliminada o nunca existió',
                                        'fr-FR':
                                            "La page que vous recherchez a peut-être été déplacée, supprimée ou n'a jamais existé",
                                        'ru-RU':
                                            'Страница, которую вы ищете, могла быть перемещена, удалена или никогда не существовала',
                                        'ja-JP':
                                            'お探しのページは移動、削除されたか、存在しない可能性があります',
                                        'de-DE':
                                            'Die Seite, die Sie suchen, wurde möglicherweise verschoben, gelöscht oder hat nie existiert',
                                        'pt-BR':
                                            'A página que você está procurando pode ter sido movida, excluída ou nunca existiu',
                                        'ko-KR':
                                            '찾고 있는 페이지는 이동되었거나 삭제되었거나 존재하지 않을 수 있습니다',
                                    },
                                    locale,
                                )}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='space-y-4'>
                            <Separator />

                            <div className='space-y-3 text-sm'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <RiTimeLine className='h-4 w-4' />
                                    <span className='font-medium'>
                                        {lang(
                                            {
                                                'zh-CN': '请求时间:',
                                                'zh-TW': '請求時間:',
                                                'en-US': 'Request Time:',
                                                'es-ES': 'Hora de Solicitud:',
                                                'fr-FR': 'Heure de Demande:',
                                                'ru-RU': 'Время Запроса:',
                                                'ja-JP': 'リクエスト時刻:',
                                                'de-DE': 'Anfrage-Zeit:',
                                                'pt-BR': 'Horário da Solicitação:',
                                                'ko-KR': '요청 시간:',
                                            },
                                            locale,
                                        )}
                                    </span>
                                </div>
                                <div className='pl-6 text-foreground font-mono text-xs bg-muted p-2 rounded'>
                                    {currentTime}
                                </div>

                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <RiRouterLine className='h-4 w-4' />
                                    <span className='font-medium'>
                                        {lang(
                                            {
                                                'zh-CN': '请求路径:',
                                                'zh-TW': '請求路徑:',
                                                'en-US': 'Request Path:',
                                                'es-ES': 'Ruta de Solicitud:',
                                                'fr-FR': 'Chemin de Demande:',
                                                'ru-RU': 'Путь Запроса:',
                                                'ja-JP': 'リクエストパス:',
                                                'de-DE': 'Anfrage-Pfad:',
                                                'pt-BR': 'Caminho da Solicitação:',
                                                'ko-KR': '요청 경로:',
                                            },
                                            locale,
                                        )}
                                    </span>
                                </div>
                                <div className='pl-6 text-foreground font-mono text-xs bg-muted p-2 rounded break-all'>
                                    {pathname}
                                </div>
                            </div>

                            <Separator />

                            <div className='text-center text-sm text-muted-foreground'>
                                {lang(
                                    {
                                        'zh-CN': '如果您认为这是一个错误，请联系我们',
                                        'zh-TW': '如果您認為這是一個錯誤，請聯繫我們',
                                        'en-US': 'If you think this is an error, please contact us',
                                        'es-ES':
                                            'Si crees que esto es un error, por favor contáctanos',
                                        'fr-FR':
                                            "Si vous pensez que c'est une erreur, veuillez nous contacter",
                                        'ru-RU':
                                            'Если вы считаете, что это ошибка, пожалуйста, свяжитесь с нами',
                                        'ja-JP':
                                            'これがエラーだと思われる場合は、お問い合わせください',
                                        'de-DE':
                                            'Wenn Sie denken, dass dies ein Fehler ist, kontaktieren Sie uns bitte',
                                        'pt-BR':
                                            'Se você acha que isso é um erro, entre em contato conosco',
                                        'ko-KR':
                                            '이것이 오류라고 생각되시면 저희에게 연락해 주세요',
                                    },
                                    locale,
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className='flex flex-col gap-3'>
                            <div className='flex gap-2 w-full'>
                                <Button asChild variant='default' className='flex-1'>
                                    <Link href={`/${locale}`} className='flex items-center gap-2'>
                                        <RiHomeLine className='h-4 w-4' />
                                        <b>
                                            {lang(
                                                {
                                                    'zh-CN': '返回首页',
                                                    'zh-TW': '返回首頁',
                                                    'en-US': 'Go Home',
                                                    'es-ES': 'Ir al Inicio',
                                                    'fr-FR': "Aller à l'Accueil",
                                                    'ru-RU': 'На Главную',
                                                    'ja-JP': 'ホームに戻る',
                                                    'de-DE': 'Zur startseite',
                                                    'pt-BR': 'Ir para Casa',
                                                    'ko-KR': '홈으로 가기',
                                                },
                                                locale,
                                            )}
                                        </b>
                                    </Link>
                                </Button>

                                <Button asChild variant='outline' className='flex-1'>
                                    <a href={reportEmail} className='flex items-center gap-2'>
                                        <RiMailLine className='h-4 w-4' />
                                        {lang(
                                            {
                                                'zh-CN': '报告问题',
                                                'zh-TW': '報告問題',
                                                'en-US': 'Report Issue',
                                                'es-ES': 'Reportar Problema',
                                                'fr-FR': 'Signaler un Problème',
                                                'ru-RU': 'Сообщить о Проблеме',
                                                'ja-JP': '問題を報告',
                                                'de-DE': 'Problem Melden',
                                                'pt-BR': 'Relatar Problema',
                                                'ko-KR': '문제 신고',
                                            },
                                            locale,
                                        )}
                                    </a>
                                </Button>
                            </div>

                            <div className='text-xs text-muted-foreground text-center'>
                                {lang(
                                    {
                                        'zh-CN': '或发送邮件至',
                                        'zh-TW': '或發送郵件至',
                                        'en-US': 'or send email to',
                                        'es-ES': 'o envía un correo a',
                                        'fr-FR': 'ou envoyez un email à',
                                        'ru-RU': 'или отправьте письмо на',
                                        'ja-JP': 'またはメールを送信',
                                        'de-DE': 'oder senden Sie eine E-Mail an',
                                        'pt-BR': 'ou envie um email para',
                                        'ko-KR': '또는 이메일 보내기',
                                    },
                                    locale,
                                )}{' '}
                                <span className='font-mono'>report@xeoos.net</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </body>
        </html>
    );
}
