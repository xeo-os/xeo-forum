"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, AlertTriangle, Home, Contact } from "lucide-react";
import Link from "next/link";
import lang from "@/lib/lang";
import "@/app/globals.css";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState("zh-CN");

  useEffect(() => {
    // 简化语言检测逻辑
    const pathname = window.location.pathname;
    const pathLocale = pathname.split("/")[1];
    const supportedLocales = [
      "en-US",
      "zh-CN",
      "zh-TW",
      "es-ES",
      "fr-FR",
      "ru-RU",
      "ja-JP",
      "de-DE",
      "pt-BR",
      "ko-KR",
    ];
    if (supportedLocales.includes(pathLocale)) {
      setLocale(pathLocale);
    }

    console.error(error);
  }, [error]);

  const errorTitle = lang(
    {
      "zh-CN": "出现了错误",
      "zh-TW": "出現了錯誤",
      "en-US": "Something went wrong!",
      "es-ES": "¡Algo salió mal!",
      "fr-FR": "Quelque chose s'est mal passé !",
      "ru-RU": "Что-то пошло не так!",
      "ja-JP": "エラーが発生しました！",
      "de-DE": "Etwas ist schief gelaufen!",
      "pt-BR": "Algo deu errado!",
      "ko-KR": "문제가 발생했습니다!",
    },
    locale
  );

  const errorDescription = lang(
    {
      "zh-CN":
        "页面加载时遇到了意外错误。请尝试刷新页面，如果问题持续存在，请联系我们。",
      "zh-TW":
        "頁面載入時遇到了意外錯誤。請嘗試重新整理頁面，如果問題持續存在，請聯絡我們。",
      "en-US":
        "An unexpected error occurred while loading the page. Please try refreshing the page, and if the problem persists, contact us.",
      "es-ES":
        "Ocurrió un error inesperado al cargar la página. Intenta actualizar la página, y si el problema persiste, contáctanos.",
      "fr-FR":
        "Une erreur inattendue s'est produite lors du chargement de la page. Veuillez essayer de rafraîchir la page, et si le problème persiste, contactez-nous.",
      "ru-RU":
        "При загрузке страницы произошла неожиданная ошибка. Попробуйте обновить страницу, и если проблема не исчезнет, свяжитесь с нами.",
      "ja-JP":
        "ページの読み込み中に予期しないエラーが発生しました。ページを更新してみてください。問題が続く場合は、お問い合わせください。",
      "de-DE":
        "Beim Laden der Seite ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie, die Seite zu aktualisieren. Falls das Problem weiterhin besteht, kontaktieren Sie uns.",
      "pt-BR":
        "Ocorreu um erro inesperado ao carregar a página. Tente atualizar a página e, se o problema persistir, entre em contato conosco.",
      "ko-KR":
        "페이지를 로드하는 동안 예상치 못한 오류가 발생했습니다. 페이지를 새로 고침해보시고, 문제가 계속되면 저희에게 연락해 주세요.",
    },
    locale
  );

  const tryAgainText = lang(
    {
      "zh-CN": "重试",
      "zh-TW": "重試",
      "en-US": "Try again",
      "es-ES": "Intentar de nuevo",
      "fr-FR": "Réessayer",
      "ru-RU": "Попробовать снова",
      "ja-JP": "再試行",
      "de-DE": "Erneut versuchen",
      "pt-BR": "Tentar novamente",
      "ko-KR": "다시 시도",
    },
    locale
  );
  const contactUsText = lang(
    {
      "zh-CN": "联系我们",
      "zh-TW": "聯絡我們",
      "en-US": "Contact us",
      "es-ES": "Contáctanos",
      "fr-FR": "Contactez-nous",
      "ru-RU": "Свяжитесь с нами",
      "ja-JP": "お問い合わせ",
      "de-DE": "Kontaktieren Sie uns",
      "pt-BR": "Entre em contato conosco",
      "ko-KR": "문의하기",
    },
    locale
  );
  const goHomeText = lang(
    {
      "zh-CN": "返回首页",
      "zh-TW": "返回首頁",
      "en-US": "Go Home",
      "es-ES": "Ir al inicio",
      "fr-FR": "Aller à l'accueil",
      "ru-RU": "На главную",
      "ja-JP": "ホームに戻る",
      "de-DE": "Zur Startseite",
      "pt-BR": "Ir para o início",
      "ko-KR": "홈으로 가기",
    },
    locale
  );

  return (
    <div className="h-full flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold text-destructive">
            {errorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{errorDescription}</AlertDescription>
          </Alert>

          {process.env.NODE_ENV === "development" && (
            <Alert>
              <AlertDescription className="text-xs font-mono">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={window.location.reload}
              className="w-full"
              variant="default"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {tryAgainText}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/${locale}`}>
                <Home className="mr-2 h-4 w-4" />
                {goHomeText}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/${locale}/contact`}>
                <Contact className="mr-2 h-4 w-4" />
                {contactUsText}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
