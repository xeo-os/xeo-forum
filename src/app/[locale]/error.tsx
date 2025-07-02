'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw, AlertTriangle, Home, Contact } from 'lucide-react';
import Link from 'next/link';
import lang from '@/lib/lang';
import '@/app/globals.css';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string; code?: string };
    reset: () => void;
}) {
    const [locale, setLocale] = useState('zh-CN');
    
    // 检查是否是数据库相关错误
    const isDatabaseError = 
        error.message?.includes('P2028') || 
        error.message?.includes('Transaction not found') ||
        error.message?.includes('Transaction ID is invalid') ||
        error.code === 'P2028';

    useEffect(() => {
        // 简化语言检测逻辑
        const pathname = window.location.pathname;
        const pathLocale = pathname.split('/')[1];
        const supportedLocales = [
            'en-US',
            'zh-CN',
            'zh-TW',
            'es-ES',
            'fr-FR',
            'ru-RU',
            'ja-JP',
            'de-DE',
            'pt-BR',
            'ko-KR',
        ];
        if (supportedLocales.includes(pathLocale)) {
            setLocale(pathLocale);
        }

        console.error(error);
    }, [error]);

    const errorTitle = lang(
        {
            'zh-CN': '出现了错误',
            'zh-TW': '出現了錯誤',
            'en-US': 'Something went wrong!',
            'es-ES': '¡Algo salió mal!',
            'fr-FR': "Quelque chose s'est mal passé !",
            'ru-RU': 'Что-то пошло не так!',
            'ja-JP': 'エラーが発生しました！',
            'de-DE': 'Etwas ist schief gelaufen!',
            'pt-BR': 'Algo deu errado!',
            'ko-KR': '문제가 발생했습니다!',
        },
        locale,
    );

    const errorDescription = lang(
        {
            'zh-CN': isDatabaseError 
                ? '数据库连接暂时不可用，这通常是由于服务器维护或网络问题导致的。请稍等片刻后重试。'
                : '页面加载时遇到了意外错误。请尝试刷新页面，如果问题持续存在，请联系我们。',
            'zh-TW': isDatabaseError
                ? '資料庫連接暫時不可用，這通常是由於伺服器維護或網路問題導致的。請稍等片刻後重試。'
                : '頁面載入時遇到了意外錯誤。請嘗試重新整理頁面，如果問題持續存在，請聯絡我們。',
            'en-US': isDatabaseError
                ? 'Database connection is temporarily unavailable, usually due to server maintenance or network issues. Please wait a moment and try again.'
                : 'An unexpected error occurred while loading the page. Please try refreshing the page, and if the problem persists, contact us.',
            'es-ES': isDatabaseError
                ? 'La conexión a la base de datos no está disponible temporalmente, generalmente debido al mantenimiento del servidor o problemas de red. Espere un momento y vuelva a intentarlo.'
                : 'Ocurrió un error inesperado al cargar la página. Intenta actualizar la página, y si el problema persiste, contáctanos.',
            'fr-FR': isDatabaseError
                ? 'La connexion à la base de données est temporairement indisponible, généralement en raison de la maintenance du serveur ou de problèmes de réseau. Veuillez attendre un moment et réessayer.'
                : "Une erreur inattendue s'est produite lors du chargement de la page. Veuillez essayer de rafraîchir la page, et si le problème persiste, contactez-nous.",
            'ru-RU': isDatabaseError
                ? 'Соединение с базой данных временно недоступно, обычно из-за обслуживания сервера или проблем с сетью. Подождите немного и попробуйте снова.'
                : 'При загрузке страницы произошла неожиданная ошибка. Попробуйте обновить страницу, и если проблема не исчезнет, свяжитесь с нами.',
            'ja-JP': isDatabaseError
                ? 'データベース接続が一時的に利用できません。通常、サーバーメンテナンスやネットワークの問題が原因です。しばらく待ってから再試行してください。'
                : 'ページの読み込み中に予期しないエラーが発生しました。ページを更新してみてください。問題が続く場合は、お問い合わせください。',
            'de-DE': isDatabaseError
                ? 'Datenbankverbindung ist vorübergehend nicht verfügbar, normalerweise aufgrund von Serverwartung oder Netzwerkproblemen. Bitte warten Sie einen Moment und versuchen Sie es erneut.'
                : 'Beim Laden der Seite ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie, die Seite zu aktualisieren. Falls das Problem weiterhin besteht, kontaktieren Sie uns.',
            'pt-BR': isDatabaseError
                ? 'A conexão com o banco de dados está temporariamente indisponível, geralmente devido à manutenção do servidor ou problemas de rede. Aguarde um momento e tente novamente.'
                : 'Ocorreu um erro inesperado ao carregar a página. Tente atualizar a página e, se o problema persistir, entre em contato conosco.',
            'ko-KR': isDatabaseError
                ? '데이터베이스 연결이 일시적으로 사용할 수 없습니다. 일반적으로 서버 유지 관리나 네트워크 문제로 인한 것입니다. 잠시 기다린 후 다시 시도해 주세요.'
                : '페이지를 로드하는 동안 예상치 못한 오류가 발생했습니다. 페이지를 새로 고침해보시고, 문제가 계속되면 저희에게 연락해 주세요.',
        },
        locale,
    );

    const tryAgainText = lang(
        {
            'zh-CN': '重试',
            'zh-TW': '重試',
            'en-US': 'Try again',
            'es-ES': 'Intentar de nuevo',
            'fr-FR': 'Réessayer',
            'ru-RU': 'Попробовать снова',
            'ja-JP': '再試行',
            'de-DE': 'Erneut versuchen',
            'pt-BR': 'Tentar novamente',
            'ko-KR': '다시 시도',
        },
        locale,
    );
    const contactUsText = lang(
        {
            'zh-CN': '联系我们',
            'zh-TW': '聯絡我們',
            'en-US': 'Contact us',
            'es-ES': 'Contáctanos',
            'fr-FR': 'Contactez-nous',
            'ru-RU': 'Свяжитесь с нами',
            'ja-JP': 'お問い合わせ',
            'de-DE': 'Kontaktieren Sie uns',
            'pt-BR': 'Entre em contato conosco',
            'ko-KR': '문의하기',
        },
        locale,
    );
    const goHomeText = lang(
        {
            'zh-CN': '返回首页',
            'zh-TW': '返回首頁',
            'en-US': 'Go Home',
            'es-ES': 'Ir al inicio',
            'fr-FR': "Aller à l'accueil",
            'ru-RU': 'На главную',
            'ja-JP': 'ホームに戻る',
            'de-DE': 'Zur Startseite',
            'pt-BR': 'Ir para o início',
            'ko-KR': '홈으로 가기',
        },
        locale,
    );

    return (
        <div className='h-full flex items-center justify-center p-4 bg-background'>
            <Card className='w-full max-w-md mx-auto shadow-lg'>
                <CardHeader className='text-center'>
                    <div className='mb-4 flex justify-center'>
                        <AlertTriangle className='h-16 w-16 text-destructive' />
                    </div>
                    <CardTitle className='text-xl font-bold text-destructive'>
                        {errorTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <Alert variant='destructive'>
                        <AlertDescription>{errorDescription}</AlertDescription>
                    </Alert>

                    {process.env.NODE_ENV === 'development' && (
                        <Alert>
                            <AlertDescription className='text-xs font-mono'>
                                {error.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='flex flex-col gap-3'>
                        <Button
                            onClick={() => {
                                if (isDatabaseError) {
                                    // 对于数据库错误，等待更长时间再重试
                                    setTimeout(() => window.location.reload(), 2000);
                                } else {
                                    window.location.reload();
                                }
                            }}
                            className='w-full'
                            variant='default'
                        >
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            {tryAgainText}
                        </Button>

                        <Button asChild variant='outline' className='w-full'>
                            <Link href={`/${locale}`}>
                                <Home className='mr-2 h-4 w-4' />
                                {goHomeText}
                            </Link>
                        </Button>

                        <Button asChild variant='outline' className='w-full'>
                            <Link href={`/${locale}/contact`}>
                                <Contact className='mr-2 h-4 w-4' />
                                {contactUsText}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
