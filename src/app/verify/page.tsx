'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RiMailLine } from '@remixicon/react';
import lang from '@/lib/lang';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import '@/app/globals.css';


export default function VerifyPage() {
    const router = useRouter();
    const [locale, setLocale] = useState('zh-CN');
    const [email, setEmail] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        const langParam = params.get('lang') || 'en-US';
        setLocale(langParam);
        setEmail(emailParam);

        if (!emailParam) {
            router.replace(`/signin&email=${encodeURIComponent(emailParam || '')}`);
            return;
        }
    }, [router]);

    // 添加单独的useEffect来设置页面标题
    useEffect(() => {
        const title = lang(
            {
                'en-US': "Verify Email | XEO OS - Xchange Everyone's Opinions",
                'zh-CN': '验证邮箱 | XEO OS - 交流每个人的观点',
                'zh-TW': '驗證郵箱 | XEO OS - 交流每個人的觀點',
                'es-ES': 'Verificar correo | XEO OS - Intercambia las opiniones de todos',
                'fr-FR': "Vérifier l'email | XEO OS - Échangez les opinions de chacun",
                'ru-RU': 'Подтвердить почту | XEO OS - Обменивайтесь мнениями всех',
                'ja-JP': 'メールを確認 | XEO OS - みんなの意見を交換',
                'de-DE': 'E-Mail bestätigen | XEO OS - Teile die Meinungen aller',
                'pt-BR': 'Verificar email | XEO OS - Troque as opiniões de todos',
                'ko-KR': '이메일 확인 | XEO OS - 모두의 의견을 교환하세요',
            },
            locale,
        );
        document.title = title;
    }, [locale]);

    const handleChange = (val: string) => {
        setCode(val);
        setError(null);
    };

    const handleComplete = async (val: string) => {
        if (!email) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/user/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: val, lang: locale }),
            });
            const data = await res.json();
            if (res.ok && data?.message?.includes('邮箱验证成功')) {
                router.replace(`/signin`);
            } else {
                setError(data.message);
                setCode('');
                (otpRef.current as unknown as HTMLInputElement)?.focus?.();
            }
        } catch {
            setError(
                lang(
                    {
                        'zh-CN': '网络错误，请稍后重试。',
                        'zh-TW': '網絡錯誤，請稍後重試。',
                        'en-US': 'Network error, please try again later.',
                        'es-ES': 'Error de red, inténtalo más tarde.',
                        'fr-FR': 'Erreur réseau, veuillez réessayer plus tard.',
                        'ru-RU': 'Сетевая ошибка, попробуйте позже.',
                        'ja-JP': 'ネットワークエラー。後でもう一度お試しください。',
                        'de-DE': 'Netzwerkfehler, bitte später versuchen.',
                        'pt-BR': 'Erro de rede, tente novamente mais tarde.',
                        'ko-KR': '네트워크 오류입니다. 나중에 다시 시도하세요.',
                    },
                    locale,
                ),
            );
            setCode('');
            otpRef.current?.focus?.();
        } finally {
            setLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-background dark'>
            <Card className='w-full max-w-md mx-auto shadow-lg'>
                <CardHeader className='text-center'>
                    <div className='mb-4 flex justify-center'>
                        <RiMailLine className='h-12 w-12 text-primary mb-2' />
                    </div>
                    <CardTitle className='text-xl'>
                        {lang(
                            {
                                'zh-CN': '邮箱验证',
                                'zh-TW': '郵箱驗證',
                                'en-US': 'Email Verification',
                                'es-ES': 'Verificación de Correo',
                                'fr-FR': "Vérification de l'e-mail",
                                'ru-RU': 'Подтверждение почты',
                                'ja-JP': 'メール認証',
                                'de-DE': 'E-Mail-Verifizierung',
                                'pt-BR': 'Verificação de E-mail',
                                'ko-KR': '이메일 인증',
                            },
                            locale,
                        )}
                    </CardTitle>
                    <CardDescription>
                        {lang(
                            {
                                'zh-CN': `请输入发送到您的邮箱 ${email} 的6位验证码。`,
                                'zh-TW': `請輸入發送到您的郵箱 ${email} 的6位驗證碼。`,
                                'en-US': `Please enter the 6-digit code sent to your email ${email}.`,
                                'es-ES': `Por favor, introduce el código de 6 dígitos enviado a tu correo ${email}.`,
                                'fr-FR': `Veuillez saisir le code à 6 chiffres envoyé à votre e-mail ${email}.`,
                                'ru-RU': `Пожалуйста, введите 6-значный код, отправленный на вашу почту ${email}.`,
                                'ja-JP': `メール ${email} に送信された6桁のコードを入力してください。`,
                                'de-DE': `Bitte geben Sie den 6-stelligen Code ein, der an Ihre E-Mail ${email} gesendet wurde.`,
                                'pt-BR': `Digite o código de 6 dígitos enviado para seu e-mail ${email}.`,
                                'ko-KR': `${email}로 전송된 6자리 코드를 입력하세요.`,
                            },
                            locale,
                        )}
                        <br />
                        {lang(
                            {
                                'zh-CN': '验证邮件的发件人是: noreply@xeoos.net',
                                'zh-TW': '驗證郵件的發件人是: noreply@xeoos.net',
                                'en-US':
                                    'The sender of the verification email is: noreply@xeoos.net',
                                'es-ES':
                                    'El remitente del correo de verificación es: noreply@xeoos.net',
                                'fr-FR':
                                    "L'expéditeur de l'e-mail de vérification est: noreply@xeoos.net",
                                'ru-RU': 'Отправитель проверочного письма: noreply@xeoos.net',
                                'ja-JP': '確認メールの送信者は: noreply@xeoos.net',
                                'de-DE':
                                    'Der Absender der Bestätigungs-E-Mail ist: noreply@xeoos.net',
                                'pt-BR':
                                    'O remetente do e-mail de verificação é: noreply@xeoos.net',
                                'ko-KR': '확인 이메일의 발신자는: noreply@xeoos.net',
                            },
                            locale,
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <Separator />
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (code.length === 6) handleComplete(code);
                        }}
                        className='flex flex-col items-center gap-4'
                    >
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={handleChange}
                            onComplete={handleComplete}
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
                            <div className='text-destructive text-sm text-center'>{error}</div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className='flex flex-col gap-2'>
                    <div className='text-xs text-muted-foreground text-center'>
                        {lang(
                            {
                                'zh-CN': '未收到验证码？请检查垃圾邮件或稍后重试。',
                                'zh-TW': '未收到驗證碼？請檢查垃圾郵件或稍後重試。',
                                'en-US':
                                    "Didn't receive the code? Check your spam or try again later.",
                                'es-ES':
                                    '¿No recibiste el código? Revisa tu spam o inténtalo más tarde.',
                                'fr-FR':
                                    "Vous n'avez pas reçu le code ? Vérifiez vos spams ou réessayez plus tard.",
                                'ru-RU': 'Не получили код? Проверьте спам или попробуйте позже.',
                                'ja-JP':
                                    'コードが届かない場合は迷惑メールを確認するか、後でもう一度お試しください。',
                                'de-DE':
                                    'Code nicht erhalten? Prüfen Sie Ihren Spam oder versuchen Sie es später erneut.',
                                'pt-BR':
                                    'Não recebeu o código? Verifique o spam ou tente novamente mais tarde.',
                                'ko-KR':
                                    '코드를 받지 못하셨나요? 스팸함을 확인하거나 나중에 다시 시도하세요.',
                            },
                            locale,
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
