"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  RiLockLine,
  RiMailLine,
  RiEyeLine,
  RiEyeOffLine,
} from "@remixicon/react";
import lang from "@/lib/lang";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import "@/app/globals.css";

// Extend the Window interface to include the turnstile property
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { [key: string]: unknown }
      ) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

interface TurnstileState {
  isVerified: boolean;
  isLoading: boolean;
  hasError: boolean;
  token: string | null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [locale, setLocale] = useState("en-US");
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [turnstileState, setTurnstileState] = useState<TurnstileState>({
    isVerified: false,
    isLoading: true,
    hasError: false,
    token: null,
  });
  const otpRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement | null>(null);

  // 使用 useCallback 来稳定 initializeTurnstile 函数
  const initializeTurnstile = useCallback(() => {
    if (turnstileRef.current && window.turnstile) {
      setTurnstileState((prev) => ({
        ...prev,
        isLoading: true,
        hasError: false,
      }));

      window.turnstile.render(turnstileRef.current, {
        sitekey: "0x4AAAAAABgaKMqrO8wRBpeA",
        callback: (token: string) => {
          setTurnstileState({
            isVerified: true,
            isLoading: false,
            hasError: false,
            token,
          });

          // 显示成功提示
          setTimeout(() => {
            toast.success(
              lang(
                {
                  "en-US": "Security verification passed!",
                  "zh-CN": "安全验证通过！",
                  "zh-TW": "安全驗證通過！",
                  "es-ES": "¡Verificación de seguridad aprobada!",
                  "fr-FR": "Vérification de sécurité réussie !",
                  "ru-RU": "Проверка безопасности пройдена!",
                  "ja-JP": "セキュリティ認証が成功しました！",
                  "de-DE": "Sicherheitsüberprüfung bestanden!",
                  "pt-BR": "Verificação de segurança aprovada!",
                  "ko-KR": "보안 인증이 통과되었습니다！",
                },
                locale
              )
            );
          }, 100);
        },
        "error-callback": () => {
          setTurnstileState({
            isVerified: false,
            isLoading: false,
            hasError: true,
            token: null,
          });
          setIsErrorDialogOpen(true);
        },
      });
    }
  }, [locale]); // 添加 locale 作为依赖

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang") || "en-US";
    setLocale(langParam);

    // 动态设置页面标题
    const title = lang(
      {
        "en-US": "Reset Password | XEO OS - Xchange Everyone's Opinions",
        "zh-CN": "重置密码 | XEO OS - 交流每个人的观点",
        "zh-TW": "重置密碼 | XEO OS - 交流每個人的觀點",
        "es-ES":
          "Restablecer contraseña | XEO OS - Intercambia las opiniones de todos",
        "fr-FR":
          "Réinitialiser le mot de passe | XEO OS - Échangez les opinions de chacun",
        "ru-RU": "Сбросить пароль | XEO OS - Обменивайтесь мнениями всех",
        "ja-JP": "パスワードリセット | XEO OS - みんなの意見を交換",
        "de-DE": "Passwort zurücksetzen | XEO OS - Teile die Meinungen aller",
        "pt-BR": "Redefinir senha | XEO OS - Troque as opiniões de todos",
        "ko-KR": "비밀번호 재설정 | XEO OS - 모두의 의견을 교환하세요",
      },
      langParam
    );
    document.title = title;

    // 动态加载Turnstile脚本
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // 脚本加载完成后立即开始验证
      if (step === "email") {
        initializeTurnstile();
      }
    };

    document.head.appendChild(script);

    return () => {
      // 清理脚本
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [initializeTurnstile]); // 移除locale依赖，避免重复设置

  // 添加单独的useEffect来监听locale变化并更新标题
  useEffect(() => {
    const title = lang(
      {
        "en-US": "Reset Password | XEO OS - Xchange Everyone's Opinions",
        "zh-CN": "重置密码 | XEO OS - 交流每个人的观点",
        "zh-TW": "重置密碼 | XEO OS - 交流每個人的觀點",
        "es-ES":
          "Restablecer contraseña | XEO OS - Intercambia las opiniones de todos",
        "fr-FR":
          "Réinitialiser le mot de passe | XEO OS - Échangez les opinions de chacun",
        "ru-RU": "Сбросить пароль | XEO OS - Обменивайтесь мнениями всех",
        "ja-JP": "パスワードリセット | XEO OS - みんなの意見を交換",
        "de-DE": "Passwort zurücksetzen | XEO OS - Teile die Meinungen aller",
        "pt-BR": "Redefinir senha | XEO OS - Troque as opiniões de todos",
        "ko-KR": "비밀번호 재설정 | XEO OS - 모두의 의견을 교환하세요",
      },
      locale
    );
    document.title = title;
  }, [locale]);

  const retryTurnstile = useCallback(() => {
    setIsErrorDialogOpen(false);
    if (window.turnstile) {
      window.turnstile.reset();
    }
    setTimeout(() => {
      initializeTurnstile();
    }, 100);
  }, [initializeTurnstile]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading || !turnstileState.isVerified) {
      if (!turnstileState.isVerified) {
        toast.error(
          lang(
            {
              "zh-CN": "请先完成安全验证",
              "zh-TW": "請先完成安全驗證",
              "en-US": "Please complete security verification first",
              "es-ES":
                "Por favor complete la verificación de seguridad primero",
              "fr-FR": "Veuillez d'abord compléter la vérification de sécurité",
              "ru-RU": "Сначала завершите проверку безопасности",
              "ja-JP": "まずセキュリティ認証を完了してください",
              "de-DE":
                "Bitte vervollständigen Sie zuerst die Sicherheitsüberprüfung",
              "pt-BR":
                "Por favor, complete a verificação de segurança primeiro",
              "ko-KR": "먼저 보안 인증을 완료해 주세요",
            },
            locale
          )
        );
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/password/reset/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          turnstileToken: turnstileState.token,
          lang: locale,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        toast.success(
          lang(
            {
              "zh-CN": "重置验证码已发送到您的邮箱",
              "zh-TW": "重置驗證碼已發送到您的電子郵件",
              "en-US": "Reset code has been sent to your email",
              "es-ES":
                "El código de restablecimiento ha sido enviado a tu correo",
              "fr-FR": "Le code de réinitialisation a été envoyé à votre email",
              "ru-RU": "Код сброса отправлен на вашу электронную почту",
              "ja-JP": "リセットコードがメールアドレスに送信されました",
              "de-DE": "Reset-Code wurde an Ihre E-Mail gesendet",
              "pt-BR": "Código de redefinição foi enviado para seu e-mail",
              "ko-KR": "재설정 코드가 이메일로 전송되었습니다",
            },
            locale
          )
        );
        setStep("verify");
      } else {
        setError(data.message);
        // 重置Turnstile状态
        setTurnstileState({
          isVerified: false,
          isLoading: true,
          hasError: false,
          token: null,
        });
        // 重新初始化Turnstile
        setTimeout(() => {
          initializeTurnstile();
        }, 100);
      }
    } catch {
      setError(
        lang(
          {
            "zh-CN": "网络错误，请稍后重试",
            "zh-TW": "網絡錯誤，請稍後重試",
            "en-US": "Network error, please try again later",
            "es-ES": "Error de red, inténtalo más tarde",
            "fr-FR": "Erreur réseau, veuillez réessayer plus tard",
            "ru-RU": "Сетевая ошибка, попробуйте позже",
            "ja-JP": "ネットワークエラー。後でもう一度お試しください",
            "de-DE": "Netzwerkfehler, bitte später versuchen",
            "pt-BR": "Erro de rede, tente novamente mais tarde",
            "ko-KR": "네트워크 오류입니다. 나중에 다시 시도하세요",
          },
          locale
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = useCallback(
    (val: string) => {
      setCode(val);
      setError(null);
      if (val.length === 6) {
        setStep("reset");
        // 进入重置密码步骤时重新初始化Turnstile
        setTurnstileState({
          isVerified: false,
          isLoading: true,
          hasError: false,
          token: null,
        });
        setTimeout(() => {
          initializeTurnstile();
        }, 100);
      }
    },
    [initializeTurnstile]
  );

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !password ||
      !confirmPassword ||
      loading ||
      !turnstileState.isVerified
    ) {
      if (!turnstileState.isVerified) {
        toast.error(
          lang(
            {
              "zh-CN": "请先完成安全验证",
              "zh-TW": "請先完成安全驗證",
              "en-US": "Please complete security verification first",
              "es-ES":
                "Por favor complete la verificación de seguridad primero",
              "fr-FR": "Veuillez d'abord compléter la vérification de sécurité",
              "ru-RU": "Сначала завершите проверку безопасности",
              "ja-JP": "まずセキュリティ認証を完了してください",
              "de-DE":
                "Bitte vervollständigen Sie zuerst die Sicherheitsüberprüfung",
              "pt-BR":
                "Por favor, complete a verificação de segurança primeiro",
              "ko-KR": "먼저 보안 인증을 완료해 주세요",
            },
            locale
          )
        );
      }
      return;
    }

    if (password !== confirmPassword) {
      setError(
        lang(
          {
            "zh-CN": "两次输入的密码不一致",
            "zh-TW": "兩次輸入的密碼不一致",
            "en-US": "Passwords do not match",
            "es-ES": "Las contraseñas no coinciden",
            "fr-FR": "Les mots de passe ne correspondent pas",
            "ru-RU": "Пароли не совпадают",
            "ja-JP": "パスワードが一致しません",
            "de-DE": "Passwörter stimmen nicht überein",
            "pt-BR": "As senhas não coincidem",
            "ko-KR": "비밀번호가 일치하지 않습니다",
          },
          locale
        )
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/password/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          code,
          turnstileToken: turnstileState.token,
          lang: locale,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        toast.success(
          lang(
            {
              "zh-CN": "密码重置成功！正在跳转...",
              "zh-TW": "密碼重置成功！正在跳轉...",
              "en-US": "Password reset successful! Redirecting...",
              "es-ES":
                "¡Restablecimiento de contraseña exitoso! Redirigiendo...",
              "fr-FR":
                "Réinitialisation du mot de passe réussie ! Redirection...",
              "ru-RU": "Пароль успешно сброшен! Перенаправление...",
              "ja-JP": "パスワードのリセットが成功しました！リダイレクト中...",
              "de-DE": "Passwort erfolgreich zurückgesetzt! Weiterleitung...",
              "pt-BR": "Redefinição de senha bem-sucedida! Redirecionando...",
              "ko-KR": "비밀번호 재설정이 성공했습니다！리디렉션 중...",
            },
            locale
          )
        );
        setTimeout(() => {
          router.replace(
            `/signin?email=${encodeURIComponent(email)}&reset=success&lang=${locale}`
          );
        }, 1500);
      } else {
        setError(data.message);
        // 重置Turnstile状态
        setTurnstileState({
          isVerified: false,
          isLoading: true,
          hasError: false,
          token: null,
        });
        // 重新初始化Turnstile
        setTimeout(() => {
          initializeTurnstile();
        }, 100);
      }
    } catch {
      setError(
        lang(
          {
            "zh-CN": "网络错误，请稍后重试",
            "zh-TW": "網絡錯誤，請稍後重試",
            "en-US": "Network error, please try again later",
            "es-ES": "Error de red, inténtalo más tarde",
            "fr-FR": "Erreur réseau, veuillez réessayer plus tard",
            "ru-RU": "Сетевая ошибка, попробуйте позже",
            "ja-JP": "ネットワークエラー。後でもう一度お試しください",
            "de-DE": "Netzwerkfehler, bitte später versuchen",
            "pt-BR": "Erro de rede, tente novamente mais tarde",
            "ko-KR": "네트워크 오류입니다. 나중에 다시 시도하세요",
          },
          locale
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = useCallback(() => {
    setStep("email");
    setCode("");
    setError(null);
    // 重新初始化Turnstile
    setTurnstileState({
      isVerified: false,
      isLoading: true,
      hasError: false,
      token: null,
    });
    setTimeout(() => {
      initializeTurnstile();
    }, 100);
  }, [initializeTurnstile]);

  const renderEmailStep = () => (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <RiLockLine className="h-12 w-12 text-primary mb-2" />
        </div>
        <CardTitle className="text-xl">
          {lang(
            {
              "zh-CN": "重置密码",
              "zh-TW": "重置密碼",
              "en-US": "Reset Password",
              "es-ES": "Restablecer Contraseña",
              "fr-FR": "Réinitialiser le Mot de Passe",
              "ru-RU": "Сбросить Пароль",
              "ja-JP": "パスワードリセット",
              "de-DE": "Passwort Zurücksetzen",
              "pt-BR": "Redefinir Senha",
              "ko-KR": "비밀번호 재설정",
            },
            locale
          )}
        </CardTitle>
        <CardDescription>
          {lang(
            {
              "zh-CN": "输入您的邮箱地址，我们将发送验证码到您的邮箱",
              "zh-TW": "輸入您的郵箱地址，我們將發送驗證碼到您的郵箱",
              "en-US":
                "Enter your email address and we'll send you a verification code",
              "es-ES":
                "Ingresa tu dirección de correo y te enviaremos un código de verificación",
              "fr-FR":
                "Entrez votre adresse e-mail et nous vous enverrons un code de vérification",
              "ru-RU":
                "Введите ваш адрес электронной почты, и мы отправим вам код подтверждения",
              "ja-JP": "メールアドレスを入力すると、認証コードを送信します",
              "de-DE":
                "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Bestätigungscode",
              "pt-BR":
                "Digite seu endereço de e-mail e enviaremos um código de verificação",
              "ko-KR": "이메일 주소를 입력하시면 인증 코드를 보내드립니다",
            },
            locale
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 隐藏的Turnstile容器，用于自动验证 */}
        <div ref={turnstileRef} className="hidden"></div>
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {lang(
                {
                  "zh-CN": "邮箱",
                  "zh-TW": "郵箱",
                  "en-US": "Email",
                  "es-ES": "Correo",
                  "fr-FR": "E-mail",
                  "ru-RU": "Электронная почта",
                  "ja-JP": "メール",
                  "de-DE": "E-Mail",
                  "pt-BR": "E-mail",
                  "ko-KR": "이메일",
                },
                locale
              )}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang(
                {
                  "zh-CN": "请输入您的邮箱",
                  "zh-TW": "請輸入您的郵箱",
                  "en-US": "Enter your email",
                  "es-ES": "Ingresa tu correo",
                  "fr-FR": "Entrez votre e-mail",
                  "ru-RU": "Введите вашу почту",
                  "ja-JP": "メールアドレスを入力",
                  "de-DE": "E-Mail eingeben",
                  "pt-BR": "Digite seu e-mail",
                  "ko-KR": "이메일을 입력하세요",
                },
                locale
              )}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              turnstileState.isLoading ||
              !turnstileState.isVerified ||
              !email
            }
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {lang(
                  {
                    "zh-CN": "发送中...",
                    "zh-TW": "發送中...",
                    "en-US": "Sending...",
                    "es-ES": "Enviando...",
                    "fr-FR": "Envoi...",
                    "ru-RU": "Отправка...",
                    "ja-JP": "送信中...",
                    "de-DE": "Senden...",
                    "pt-BR": "Enviando...",
                    "ko-KR": "전송 중...",
                  },
                  locale
                )}
              </>
            ) : turnstileState.isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {lang(
                  {
                    "en-US": "Verifying...",
                    "zh-CN": "验证中...",
                    "zh-TW": "驗證中...",
                    "es-ES": "Verificando...",
                    "fr-FR": "Vérification...",
                    "ru-RU": "Проверка...",
                    "ja-JP": "認証中...",
                    "de-DE": "Überprüfung...",
                    "pt-BR": "Verificando...",
                    "ko-KR": "인증 중...",
                  },
                  locale
                )}
              </>
            ) : (
              lang(
                {
                  "zh-CN": "发送验证码",
                  "zh-TW": "發送驗證碼",
                  "en-US": "Send Verification Code",
                  "es-ES": "Enviar Código de Verificación",
                  "fr-FR": "Envoyer le Code de Vérification",
                  "ru-RU": "Отправить Код Подтверждения",
                  "ja-JP": "認証コードを送信",
                  "de-DE": "Bestätigungscode Senden",
                  "pt-BR": "Enviar Código de Verificação",
                  "ko-KR": "인증 코드 전송",
                },
                locale
              )
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          onClick={() => router.push(`/signin?lang=${locale}`)}
          className="text-sm"
        >
          {lang(
            {
              "zh-CN": "返回登录",
              "zh-TW": "返回登入",
              "en-US": "Back to Sign In",
              "es-ES": "Volver al Inicio de Sesión",
              "fr-FR": "Retour à la Connexion",
              "ru-RU": "Вернуться к Входу",
              "ja-JP": "サインインに戻る",
              "de-DE": "Zurück zur Anmeldung",
              "pt-BR": "Voltar ao Login",
              "ko-KR": "로그인으로 돌아가기",
            },
            locale
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderVerifyStep = () => (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <RiMailLine className="h-12 w-12 text-primary mb-2" />
        </div>
        <CardTitle className="text-xl">
          {lang(
            {
              "zh-CN": "输入验证码",
              "zh-TW": "輸入驗證碼",
              "en-US": "Enter Verification Code",
              "es-ES": "Ingresa el Código de Verificación",
              "fr-FR": "Entrez le Code de Vérification",
              "ru-RU": "Введите Код Подтверждения",
              "ja-JP": "認証コードを入力",
              "de-DE": "Bestätigungscode Eingeben",
              "pt-BR": "Digite o Código de Verificação",
              "ko-KR": "인증 코드 입력",
            },
            locale
          )}
        </CardTitle>
        <CardDescription>
          {lang(
            {
              "zh-CN": `请输入发送到 ${email} 的6位验证码，验证码将在15分钟后过期`,
              "zh-TW": `請輸入發送到 ${email} 的6位驗證碼，驗證碼將在15分鐘後過期`,
              "en-US": `Please enter the 6-digit code sent to ${email}. Code expires in 15 minutes`,
              "es-ES": `Ingresa el código de 6 dígitos enviado a ${email}. El código expira en 15 minutos`,
              "fr-FR": `Entrez le code à 6 chiffres envoyé à ${email}. Le code expire dans 15 minutes`,
              "ru-RU": `Введите 6-значный код, отправленный на ${email}. Код истекает через 15 минут`,
              "ja-JP": `${email} に送信された6桁のコードを入力してください。コードは15分後に期限切れになります`,
              "de-DE": `Geben Sie den 6-stelligen Code ein, der an ${email} gesendet wurde. Code läuft in 15 Minuten ab`,
              "pt-BR": `Digite o código de 6 dígitos enviado para ${email}. O código expira em 15 minutos`,
              "ko-KR": `${email}로 전송된 6자리 코드를 입력하세요. 코드는 15분 후 만료됩니다`,
            },
            locale
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleVerifyCode}
            ref={otpRef}
            disabled={loading}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={handleBackToEmail} className="text-sm">
          {lang(
            {
              "zh-CN": "重新发送验证码",
              "zh-TW": "重新發送驗證碼",
              "en-US": "Resend Code",
              "es-ES": "Reenviar Código",
              "fr-FR": "Renvoyer le Code",
              "ru-RU": "Отправить Код Повторно",
              "ja-JP": "コードを再送信",
              "de-DE": "Code Erneut Senden",
              "pt-BR": "Reenviar Código",
              "ko-KR": "코드 재전송",
            },
            locale
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderResetStep = () => (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <RiLockLine className="h-12 w-12 text-primary mb-2" />
        </div>
        <CardTitle className="text-xl">
          {lang(
            {
              "zh-CN": "设置新密码",
              "zh-TW": "設置新密碼",
              "en-US": "Set New Password",
              "es-ES": "Establecer Nueva Contraseña",
              "fr-FR": "Définir un Nouveau Mot de Passe",
              "ru-RU": "Установить Новый Пароль",
              "ja-JP": "新しいパスワードを設定",
              "de-DE": "Neues Passwort Festlegen",
              "pt-BR": "Definir Nova Senha",
              "ko-KR": "새 비밀번호 설정",
            },
            locale
          )}
        </CardTitle>
        <CardDescription>
          {lang(
            {
              "zh-CN": "请输入您的新密码，密码长度应在6-50个字符之间",
              "zh-TW": "請輸入您的新密碼，密碼長度應在6-50個字符之間",
              "en-US": "Enter your new password, must be 6-50 characters long",
              "es-ES":
                "Ingresa tu nueva contraseña, debe tener entre 6-50 caracteres",
              "fr-FR":
                "Entrez votre nouveau mot de passe, doit contenir 6-50 caractères",
              "ru-RU": "Введите новый пароль, длина должна быть 6-50 символов",
              "ja-JP": "新しいパスワードを入力してください（6-50文字）",
              "de-DE":
                "Geben Sie Ihr neues Passwort ein, muss 6-50 Zeichen lang sein",
              "pt-BR": "Digite sua nova senha, deve ter 6-50 caracteres",
              "ko-KR": "새 비밀번호를 입력하세요 (6-50자)",
            },
            locale
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 隐藏的Turnstile容器，用于重置密码步骤验证 */}
        <div ref={turnstileRef} className="hidden"></div>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {lang(
                {
                  "zh-CN": "新密码",
                  "zh-TW": "新密碼",
                  "en-US": "New Password",
                  "es-ES": "Nueva Contraseña",
                  "fr-FR": "Nouveau Mot de Passe",
                  "ru-RU": "Новый Пароль",
                  "ja-JP": "新しいパスワード",
                  "de-DE": "Neues Passwort",
                  "pt-BR": "Nova Senha",
                  "ko-KR": "새 비밀번호",
                },
                locale
              )}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang(
                  {
                    "zh-CN": "请输入新密码",
                    "zh-TW": "請輸入新密碼",
                    "en-US": "Enter new password",
                    "es-ES": "Ingresa nueva contraseña",
                    "fr-FR": "Entrez le nouveau mot de passe",
                    "ru-RU": "Введите новый пароль",
                    "ja-JP": "新しいパスワードを入力",
                    "de-DE": "Neues Passwort eingeben",
                    "pt-BR": "Digite a nova senha",
                    "ko-KR": "새 비밀번호를 입력하세요",
                  },
                  locale
                )}
                required
                disabled={loading}
                minLength={6}
                maxLength={50}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <RiEyeOffLine className="h-4 w-4" />
                ) : (
                  <RiEyeLine className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {lang(
                {
                  "zh-CN": "确认新密码",
                  "zh-TW": "確認新密碼",
                  "en-US": "Confirm New Password",
                  "es-ES": "Confirmar Nueva Contraseña",
                  "fr-FR": "Confirmer le Nouveau Mot de Passe",
                  "ru-RU": "Подтвердите Новый Пароль",
                  "ja-JP": "新しいパスワードを確認",
                  "de-DE": "Neues Passwort Bestätigen",
                  "pt-BR": "Confirmar Nova Senha",
                  "ko-KR": "새 비밀번호 확인",
                },
                locale
              )}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={lang(
                  {
                    "zh-CN": "请再次输入新密码",
                    "zh-TW": "請再次輸入新密碼",
                    "en-US": "Enter new password again",
                    "es-ES": "Ingresa la nueva contraseña otra vez",
                    "fr-FR": "Entrez à nouveau le nouveau mot de passe",
                    "ru-RU": "Введите новый пароль еще раз",
                    "ja-JP": "新しいパスワードをもう一度入力",
                    "de-DE": "Neues Passwort erneut eingeben",
                    "pt-BR": "Digite a nova senha novamente",
                    "ko-KR": "새 비밀번호를 다시 입력하세요",
                  },
                  locale
                )}
                required
                disabled={loading}
                minLength={6}
                maxLength={50}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <RiEyeOffLine className="h-4 w-4" />
                ) : (
                  <RiEyeLine className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button
            type="submit"
            className="w-full"
            disabled={
              loading || turnstileState.isLoading || !turnstileState.isVerified
            }
          >
            {loading ? (
              lang(
                {
                  "zh-CN": "重置中...",
                  "zh-TW": "重置中...",
                  "en-US": "Resetting...",
                  "es-ES": "Restableciendo...",
                  "fr-FR": "Réinitialisation...",
                  "ru-RU": "Сброс...",
                  "ja-JP": "リセット中...",
                  "de-DE": "Zurücksetzen...",
                  "pt-BR": "Redefinindo...",
                  "ko-KR": "재설정 중...",
                },
                locale
              )
            ) : turnstileState.isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {lang(
                  {
                    "en-US": "Verifying...",
                    "zh-CN": "验证中...",
                    "zh-TW": "驗證中...",
                    "es-ES": "Verificando...",
                    "fr-FR": "Vérification...",
                    "ru-RU": "Проверка...",
                    "ja-JP": "認証中...",
                    "de-DE": "Überprüfung...",
                    "pt-BR": "Verificando...",
                    "ko-KR": "인증 중...",
                  },
                  locale
                )}
              </>
            ) : (
              lang(
                {
                  "zh-CN": "重置密码",
                  "zh-TW": "重置密碼",
                  "en-US": "Reset Password",
                  "es-ES": "Restablecer Contraseña",
                  "fr-FR": "Réinitialiser le Mot de Passe",
                  "ru-RU": "Сбросить Пароль",
                  "ja-JP": "パスワードをリセット",
                  "de-DE": "Passwort Zurücksetzen",
                  "pt-BR": "Redefinir Senha",
                  "ko-KR": "비밀번호 재설정",
                },
                locale
              )
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          onClick={() => setStep("verify")}
          className="text-sm"
        >
          {lang(
            {
              "zh-CN": "返回验证码输入",
              "zh-TW": "返回驗證碼輸入",
              "en-US": "Back to Code Input",
              "es-ES": "Volver al Código",
              "fr-FR": "Retour au Code",
              "ru-RU": "Вернуться к Коду",
              "ja-JP": "コード入力に戻る",
              "de-DE": "Zurück zur Code-Eingabe",
              "pt-BR": "Voltar ao Código",
              "ko-KR": "코드 입력으로 돌아가기",
            },
            locale
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background dark">
      <Toaster theme="dark" position="top-center" richColors />
      {step === "email" && renderEmailStep()}
      {step === "verify" && renderVerifyStep()}
      {step === "reset" && renderResetStep()}

      {/* Turnstile验证错误对话框 */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {lang(
                {
                  "en-US": "Verification Error",
                  "zh-CN": "验证错误",
                  "zh-TW": "驗證錯誤",
                  "es-ES": "Error de Verificación",
                  "fr-FR": "Erreur de Vérification",
                  "ru-RU": "Ошибка Проверки",
                  "ja-JP": "認証エラー",
                  "de-DE": "Überprüfungsfehler",
                  "pt-BR": "Erro de Verificação",
                  "ko-KR": "인증 오류",
                },
                locale
              )}
            </DialogTitle>
            <DialogDescription>
              {lang(
                {
                  "en-US":
                    "An error occurred during security verification. Please try again.",
                  "zh-CN": "安全验证过程中发生错误。请重试。",
                  "zh-TW": "安全驗證過程中發生錯誤。請重試。",
                  "es-ES":
                    "Ocurrió un error durante la verificación de seguridad. Por favor, inténtalo de nuevo.",
                  "fr-FR":
                    "Une erreur s'est produite lors de la vérification de sécurité. Veuillez réessayer.",
                  "ru-RU":
                    "Произошла ошибка во время проверки безопасности. Пожалуйста, попробуйте снова.",
                  "ja-JP":
                    "セキュリティ認証中にエラーが発生しました。再試行してください。",
                  "de-DE":
                    "Bei der Sicherheitsüberprüfung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
                  "pt-BR":
                    "Ocorreu um erro durante a verificação de segurança. Por favor, tente novamente.",
                  "ko-KR":
                    "보안 인증 중 오류가 발생했습니다. 다시 시도해 주세요.",
                },
                locale
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={retryTurnstile}>
              {lang(
                {
                  "en-US": "Retry Verification",
                  "zh-CN": "重试验证",
                  "zh-TW": "重試驗證",
                  "es-ES": "Reintentar Verificación",
                  "fr-FR": "Réessayer la Vérification",
                  "ru-RU": "Повторить Проверку",
                  "ja-JP": "認証を再試行",
                  "de-DE": "Überprüfung Wiederholen",
                  "pt-BR": "Tentar Verificação Novamente",
                  "ko-KR": "인증 재시도",
                },
                locale
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
