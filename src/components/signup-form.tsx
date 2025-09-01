'use client';

// Extend the Window interface to include the turnstile property
declare global {
    interface Window {
        turnstile?: {
            render: (element: HTMLElement, options: { [key: string]: unknown }) => void;
            reset: (widgetId?: string) => void;
        };
    }
}

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import lang from '@/lib/lang';
import { useSearchParams } from 'next/navigation';
import { EmojiArea } from './emoji-area';
import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import token from '@/utils/userToken';
import { toast, Toaster } from 'sonner';

interface ValidationState {
    username: { valid: boolean; message: string; isChecking?: boolean };
    email: { valid: boolean; message: string };
    password: { valid: boolean; message: string };
}

interface TurnstileState {
    isVerified: boolean;
    isLoading: boolean;
    hasError: boolean;
    token: string | null;
}

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
    const searchParams = useSearchParams();
    const locale = searchParams?.get('lang') || 'en-US';

    const [validation, setValidation] = useState<ValidationState>({
        username: { valid: true, message: '', isChecking: false },
        email: { valid: true, message: '' },
        password: { valid: true, message: '' },
    });

    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [isApiErrorDialogOpen, setIsApiErrorDialogOpen] = useState(false);
    const [apiErrorMessage, setApiErrorMessage] = useState('');
    const [turnstileState, setTurnstileState] = useState<TurnstileState>({
        isVerified: false,
        isLoading: true,
        hasError: false,
        token: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 移动token检查到useEffect中，避免阻止组件渲染
    useEffect(() => {
        if (token.get()) {
            window.location.href = '/';
            return;
        }
    }, []);

    const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const turnstileRef = useRef<HTMLDivElement | null>(null);

    const validateUsername = useCallback(
        async (value: string) => {
            if (!value) {
                setValidation((prev) => ({
                    ...prev,
                    username: { valid: true, message: '', isChecking: false },
                }));
                return;
            }

            // 开始检查，设置loading状态
            setValidation((prev) => ({
                ...prev,
                username: { valid: true, message: '', isChecking: true },
            }));

            // 格式检查
            if (value.length < 3 || value.length > 20) {
                setValidation((prev) => ({
                    ...prev,
                    username: {
                        valid: false,
                        isChecking: false,
                        message: lang(
                            {
                                'en-US': 'Username must be 3-20 characters',
                                'zh-CN': '用户名必须为3-20个字符',
                                'zh-TW': '用戶名必須為3-20個字符',
                                'es-ES': 'El nombre de usuario debe tener entre 3 y 20 caracteres',
                                'fr-FR':
                                    "Le nom d'utilisateur doit comporter entre 3 et 20 caractères",
                                'ru-RU': 'Имя пользователя должно быть от 3 до 20 символов',
                                'ja-JP': 'ユーザー名は3〜20文字でなければなりません',
                                'de-DE': 'Der Benutzername muss 3-20 Zeichen lang sein',
                                'pt-BR': 'O nome de usuário deve ter entre 3 e 20 caracteres',
                                'ko-KR': '사용자 이름은 3-20자여야 합니다',
                            },
                            locale,
                        ),
                    },
                }));
                return;
            }

            if (!/^[a-z0-9_]+$/.test(value)) {
                setValidation((prev) => ({
                    ...prev,
                    username: {
                        valid: false,
                        isChecking: false,
                        message: lang(
                            {
                                'en-US':
                                    'Username can only contain lowercase letters, numbers, and underscores',
                                'zh-CN': '用户名只能包含小写字母、数字和下划线',
                                'zh-TW': '用戶名只能包含小寫字母、數字和下劃線',
                                'es-ES':
                                    'El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos',
                                'fr-FR':
                                    "Le nom d'utilisateur ne peut contenir que des lettres minuscules, des chiffres et des tirets bas",
                                'ru-RU':
                                    'Имя пользователя может содержать только строчные буквы, цифры и подчеркивания',
                                'ja-JP':
                                    'ユーザー名は小文字のアルファベット、数字、アンダースコアのみを含むことができます',
                                'de-DE':
                                    'Der Benutzername darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten',
                                'pt-BR':
                                    'O nome de usuário só pode conter letras minúsculas, números e sublinhados',
                                'ko-KR': '사용자 이름은 소문자, 숫자 및 밑줄만 포함할 수 있습니다',
                            },
                            locale,
                        ),
                    },
                }));
                return;
            }

            // 检查重复
            try {
                const response = await fetch('/api/user/check?username=' + value, {
                    method: 'GET',
                });
                const result = await response.json();

                setValidation((prev) => ({
                    ...prev,
                    username: {
                        valid: result.ok,
                        isChecking: false,
                        message: result.ok
                            ? ''
                            : lang(
                                  {
                                      'en-US': 'Username already exists',
                                      'zh-CN': '用户名已存在',
                                      'zh-TW': '用戶名已存在',
                                      'es-ES': 'El nombre de usuario ya existe',
                                      'fr-FR': "Le nom d'utilisateur existe déjà",
                                      'ru-RU': 'Имя пользователя уже существует',
                                      'ja-JP': 'ユーザー名は既に存在します',
                                      'de-DE': 'Der Benutzername existiert bereits',
                                      'pt-BR': 'O nome de usuário já existe',
                                      'ko-KR': '사용자 이름이 이미 존재합니다',
                                  },
                                  locale,
                              ),
                    },
                }));
            } catch {
                setValidation((prev) => ({
                    ...prev,
                    username: {
                        valid: false,
                        isChecking: false,
                        message: lang(
                            {
                                'en-US': 'Failed to check username',
                                'zh-CN': '检查用户名失败',
                                'zh-TW': '檢查用戶名失敗',
                                'es-ES': 'Error al verificar el nombre de usuario',
                                'fr-FR': "Échec de la vérification du nom d'utilisateur",
                                'ru-RU': 'Не удалось проверить имя пользователя',
                                'ja-JP': 'ユーザー名の確認に失敗しました',
                                'de-DE': 'Benutzername konnte nicht überprüft werden',
                                'pt-BR': 'Falha ao verificar o nome de usuário',
                                'ko-KR': '사용자 이름 확인 실패',
                            },
                            locale,
                        ),
                    },
                }));
            }
        },
        [locale],
    );

    const validateEmail = useCallback(
        (value: string) => {
            if (!value) {
                setValidation((prev) => ({
                    ...prev,
                    email: { valid: true, message: '' },
                }));
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailRegex.test(value);

            setValidation((prev) => ({
                ...prev,
                email: {
                    valid: isValid,
                    message: isValid
                        ? ''
                        : lang(
                              {
                                  'en-US': 'Please enter a valid email address',
                                  'zh-CN': '请输入有效的邮箱地址',
                                  'zh-TW': '請輸入有效的郵箱地址',
                                  'es-ES':
                                      'Por favor, introduce una dirección de correo electrónico válida',
                                  'fr-FR': 'Veuillez entrer une adresse e-mail valide',
                                  'ru-RU':
                                      'Пожалуйста, введите действительный адрес электронной почты',
                                  'ja-JP': '有効なメールアドレスを入力してください',
                                  'de-DE': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                                  'pt-BR': 'Por favor, insira um endereço de e-mail válido',
                                  'ko-KR': '유효한 이메일 주소를 입력하세요',
                              },
                              locale,
                          ),
                },
            }));
        },
        [locale],
    );

    const validatePassword = useCallback(
        (value: string) => {
            if (!value) {
                setValidation((prev) => ({
                    ...prev,
                    password: { valid: true, message: '' },
                }));
                return;
            }

            const isValid = value.length >= 5 && value.length <= 50;

            setValidation((prev) => ({
                ...prev,
                password: {
                    valid: isValid,
                    message: isValid
                        ? ''
                        : lang(
                              {
                                  'en-US': 'Password must be 5-50 characters',
                                  'zh-CN': '密码必须为5-50个字符',
                                  'zh-TW': '密碼必須為5-50個字符',
                                  'es-ES': 'La contraseña debe tener entre 5 y 50 caracteres',
                                  'fr-FR':
                                      'Le mot de passe doit comporter entre 5 et 50 caractères',
                                  'ru-RU': 'Пароль должен быть от 5 до 50 символов',
                                  'ja-JP': 'パスワードは5〜50文字でなければなりません',
                                  'de-DE': 'Das Passwort muss zwischen 5 und 50 Zeichen lang sein',
                                  'pt-BR': 'A senha deve ter entre 5 e 50 caracteres',
                                  'ko-KR': '비밀번호는 5-50자여야 합니다',
                              },
                              locale,
                          ),
                },
            }));
        },
        [locale],
    );

    const handleInputChange = (field: string, value: string) => {
        // 清除之前的定时器
        if (timeoutRefs.current[field]) {
            clearTimeout(timeoutRefs.current[field]);
        }

        // 设置新的定时器
        timeoutRefs.current[field] = setTimeout(() => {
            switch (field) {
                case 'username':
                    validateUsername(value);
                    break;
                case 'email':
                    validateEmail(value);
                    break;
                case 'password':
                    validatePassword(value);
                    break;
            }
        }, 1000);
    };

    const highlightInvalidField = (fieldName: string) => {
        const input = inputRefs.current[fieldName];
        if (input) {
            input.classList.add('animate-pulse', 'border-red-500');
            setTimeout(() => {
                input.classList.remove('animate-pulse');
            }, 1000);
        }
    };

    useEffect(() => {
        // 动态设置页面标题
        const title = lang(
            {
                'en-US': "Sign up | XEO OS - Xchange Everyone's Opinions",
                'zh-CN': '注册 | XEO OS - 交流每个人的观点',
                'zh-TW': '註冊 | XEO OS - 交流每個人的觀點',
                'es-ES': 'Registrarse | XEO OS - Intercambia las opiniones de todos',
                'fr-FR': "S'inscrire | XEO OS - Échangez les opinions de chacun",
                'ru-RU': 'Зарегистрироваться | XEO OS - Обменивайтесь мнениями всех',
                'ja-JP': 'サインアップ | XEO OS - みんなの意見を交換',
                'de-DE': 'Registrieren | XEO OS - Teile die Meinungen aller',
                'pt-BR': 'Registrar | XEO OS - Troque as opiniões de todos',
                'ko-KR': '회원가입 | XEO OS - 모두의 의견을 교환하세요',
            },
            locale,
        );
        document.title = title;

        // 动态加载Turnstile脚本
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // 脚本加载完成后立即开始验证
            initializeTurnstile();
        };

        document.head.appendChild(script);

        return () => {
            // 清理脚本
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [locale]); // 添加locale作为依赖

    const initializeTurnstile = () => {
        if (turnstileRef.current && window.turnstile) {
            setTurnstileState((prev) => ({
                ...prev,
                isLoading: true,
                hasError: false,
            }));

            window.turnstile.render(turnstileRef.current, {
                sitekey: '0x4AAAAAABgaKMqrO8wRBpeA',
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
                                    'en-US': 'Security verification passed!',
                                    'zh-CN': '安全验证通过！',
                                    'zh-TW': '安全驗證通過！',
                                    'es-ES': '¡Verificación de seguridad aprobada!',
                                    'fr-FR': 'Vérification de sécurité réussie !',
                                    'ru-RU': 'Проверка безопасности пройдена!',
                                    'ja-JP': 'セキュリティ認証が成功しました！',
                                    'de-DE': 'Sicherheitsüberprüfung bestanden!',
                                    'pt-BR': 'Verificação de segurança aprovada!',
                                    'ko-KR': '보안 인증이 통과되었습니다！',
                                },
                                locale,
                            ),
                        );
                    }, 100);
                },
                'error-callback': () => {
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
    };

    const retryTurnstile = () => {
        setIsErrorDialogOpen(false);
        if (window.turnstile) {
            window.turnstile.reset();
        }
        setTimeout(() => {
            initializeTurnstile();
        }, 100);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // 检查所有字段是否有效
        const allValid =
            validation.username.valid &&
            validation.email.valid &&
            validation.password.valid &&
            username &&
            email &&
            password;

        if (!allValid) {
            // 高亮无效字段
            if (!validation.username.valid || !username) highlightInvalidField('username');
            if (!validation.email.valid || !email) highlightInvalidField('email');
            if (!validation.password.valid || !password) highlightInvalidField('password');
            return;
        }

        // 检查Turnstile验证状态
        if (!turnstileState.isVerified) {
            toast.error(
                lang(
                    {
                        'en-US': 'Please complete security verification first',
                        'zh-CN': '请先完成安全验证',
                        'zh-TW': '請先完成安全驗證',
                        'es-ES': 'Por favor complete la verificación de seguridad primero',
                        'fr-FR': "Veuillez d'abord compléter la vérification de sécurité",
                        'ru-RU': 'Сначала завершите проверку безопасности',
                        'ja-JP': 'まずセキュリティ認証を完了してください',
                        'de-DE': 'Bitte vervollständigen Sie zuerst die Sicherheitsüberprüfung',
                        'pt-BR': 'Por favor, complete a verificação de segurança primeiro',
                        'ko-KR': '먼저 보안 인증을 완료해 주세요',
                    },
                    locale,
                ),
            );
            return;
        }

        // 如果验证成功，直接执行注册
        setIsSubmitting(true);
        executeSignup(username, email, password, turnstileState.token!);
    };

    function executeSignup(
        username: string,
        email: string,
        password: string,
        turnstileToken: string,
    ) {
        // 注册逻辑
        console.log('Signing up:', { username, email, password });
        // 锁住注册按钮
        const signupButton = document.querySelector("button[type='submit']");
        if (signupButton) {
            (signupButton as HTMLButtonElement).disabled = true;
            signupButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
        // 注册请求
        fetch('/api/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
                turnstileToken,
                lang: locale,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setIsSubmitting(false);
                if (data.ok) {
                    // 注册成功，显示成功提示
                    toast.success(
                        lang(
                            {
                                'en-US': 'Registration successful! Redirecting...',
                                'zh-CN': '注册成功！正在跳转...',
                                'zh-TW': '註冊成功！正在跳轉...',
                                'es-ES': '¡Registro exitoso! Redirigiendo...',
                                'fr-FR': 'Inscription réussie ! Redirection...',
                                'ru-RU': 'Регистрация успешна! Перенаправление...',
                                'ja-JP': '登録成功！リダイレクト中...',
                                'de-DE': 'Registrierung erfolgreich! Weiterleitung...',
                                'pt-BR': 'Registro bem-sucedido! Redirecionando...',
                                'ko-KR': '등록 성공! 리디렉션 중...',
                            },
                            locale,
                        ),
                    );

                    // 延迟跳转
                    setTimeout(() => {
                        window.location.href = '/verify?email=' + email;
                    }, 1500);
                } else {
                    // 显示API错误信息
                    setApiErrorMessage(
                        data.message ||
                            lang(
                                {
                                    'en-US': 'Registration failed',
                                    'zh-CN': '注册失败',
                                    'zh-TW': '註冊失敗',
                                    'es-ES': 'Error en el registro',
                                    'fr-FR': "Échec de l'inscription",
                                    'ru-RU': 'Ошибка регистрации',
                                    'ja-JP': '登録に失敗しました',
                                    'de-DE': 'Registrierung fehlgeschlagen',
                                    'pt-BR': 'Falha no registro',
                                    'ko-KR': '등록 실패',
                                },
                                locale,
                            ),
                    );
                    setIsApiErrorDialogOpen(true);

                    // 解锁注册按钮
                    if (signupButton) {
                        (signupButton as HTMLButtonElement).disabled = false;
                        signupButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                }
            })
            .catch((error) => {
                setIsSubmitting(false);
                console.error('Error during signup:', error);

                // 显示网络错误
                setApiErrorMessage(
                    lang(
                        {
                            'en-US': 'Network error occurred. Please try again.',
                            'zh-CN': '发生网络错误，请重试。',
                            'zh-TW': '發生網路錯誤，請重試。',
                            'es-ES': 'Ocurrió un error de red. Por favor, inténtalo de nuevo.',
                            'fr-FR': "Une erreur réseau s'est produite. Veuillez réessayer.",
                            'ru-RU': 'Произошла сетевая ошибка. Пожалуйста, попробуйте снова.',
                            'ja-JP': 'ネットワークエラーが発生しました。再試行してください。',
                            'de-DE':
                                'Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es erneut.',
                            'pt-BR': 'Ocorreu um erro de rede. Por favor, tente novamente.',
                            'ko-KR': '네트워크 오류가 발생했습니다. 다시 시도해 주세요.',
                        },
                        locale,
                    ),
                );
                setIsApiErrorDialogOpen(true);

                // 解锁注册按钮
                if (signupButton) {
                    (signupButton as HTMLButtonElement).disabled = false;
                    signupButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            {/* 隐藏的Turnstile容器，用于初始验证 */}
            <div ref={turnstileRef} className='hidden'></div>
            <Toaster theme='dark' position='top-center' richColors />
            <Card className='overflow-hidden p-0'>
                <CardContent className='grid p-0 md:grid-cols-2'>
                    <form className='p-6 md:p-8' onSubmit={handleSubmit}>
                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-col items-center text-center'>
                                <h1 className='text-4xl font-bold'>XEO OS</h1>
                                <p className='text-muted-foreground text-balance'>
                                    {lang(
                                        {
                                            'en-US':
                                                "Xchange everyone's opinions, using only your language.",
                                            'zh-CN': '交流每个人的观点，仅使用你的语言。',
                                            'zh-TW': '交流每個人的觀點，僅使用你的語言。',
                                            'es-ES':
                                                'Intercambia las opiniones de todos, usando solo tu idioma.',
                                            'fr-FR':
                                                'Échangez les opinions de chacun, en utilisant uniquement votre langue.',
                                            'ru-RU':
                                                'Обменивайтесь мнениями всех, используя только ваш язык.',
                                            'ja-JP': 'みんなの意見を交換、あなたの言語だけで。',
                                            'de-DE':
                                                'Teile die Meinungen aller, nur in deiner Sprache.',
                                            'pt-BR':
                                                'Troque as opiniões de todos, usando apenas seu idioma.',
                                            'ko-KR':
                                                '모두의 의견을 교환하세요, 당신의 언어만 사용하여。',
                                        },
                                        locale,
                                    )}
                                </p>
                            </div>
                            <div className='grid gap-3'>
                                <Label htmlFor='username'>
                                    {lang(
                                        {
                                            'en-US': 'Username',
                                            'zh-CN': '用户名',
                                            'zh-TW': '用戶名',
                                            'es-ES': 'Nombre de usuario',
                                            'fr-FR': "Nom d'utilisateur",
                                            'ru-RU': 'Имя пользователя',
                                            'ja-JP': 'ユーザー名',
                                            'de-DE': 'Benutzername',
                                            'pt-BR': 'Nome de usuário',
                                            'ko-KR': '사용자 이름',
                                        },
                                        locale,
                                    )}
                                </Label>
                                <div className='relative'>
                                    <Input
                                        id='username'
                                        name='username'
                                        type='text'
                                        required
                                        ref={(el) => {
                                            inputRefs.current.username = el;
                                        }}
                                        className={cn(
                                            !validation.username.valid &&
                                                validation.username.message &&
                                                'border-red-500',
                                            (validation.username.isChecking ||
                                                (validation.username.valid &&
                                                    validation.username.message === '' &&
                                                    inputRefs.current.username?.value)) &&
                                                'pr-10',
                                        )}
                                        onChange={(e) =>
                                            handleInputChange('username', e.target.value)
                                        }
                                    />
                                    {inputRefs.current.username?.value && (
                                        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                            {validation.username.isChecking ? (
                                                <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent' />
                                            ) : validation.username.valid &&
                                              validation.username.message === '' ? (
                                                <svg
                                                    className='h-5 w-5 text-green-500'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M5 13l4 4L19 7'
                                                    />
                                                </svg>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {!validation.username.valid && validation.username.message && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: 'easeInOut',
                                                opacity: { duration: 0.2 },
                                            }}
                                            className='overflow-hidden'
                                        >
                                            <p className='text-sm text-red-500 pt-1'>
                                                {validation.username.message}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className='grid gap-3'>
                                <Label htmlFor='email'>
                                    {lang(
                                        {
                                            'en-US': 'Email',
                                            'zh-CN': '电子邮件',
                                            'zh-TW': '電子郵件',
                                            'es-ES': 'Correo electrónico',
                                            'fr-FR': 'E-mail',
                                            'ru-RU': 'Электронная почта',
                                            'ja-JP': 'メールアドレス',
                                            'de-DE': 'E-Mail',
                                            'pt-BR': 'E-mail',
                                            'ko-KR': '이메일',
                                        },
                                        locale,
                                    )}
                                </Label>
                                <Input
                                    id='email'
                                    name='email'
                                    type='email'
                                    placeholder='user@xeoos.net'
                                    required
                                    ref={(el) => {
                                        inputRefs.current.email = el;
                                    }}
                                    className={cn(
                                        !validation.email.valid &&
                                            validation.email.message &&
                                            'border-red-500',
                                    )}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                                <AnimatePresence>
                                    {!validation.email.valid && validation.email.message && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: 'easeInOut',
                                                opacity: { duration: 0.2 },
                                            }}
                                            className='overflow-hidden'
                                        >
                                            <p className='text-sm text-red-500 pt-1'>
                                                {validation.email.message}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className='grid gap-3'>
                                <div className='flex items-center'>
                                    <Label htmlFor='password'>
                                        {lang(
                                            {
                                                'en-US': 'Password',
                                                'zh-CN': '密码',
                                                'zh-TW': '密碼',
                                                'es-ES': 'Contraseña',
                                                'fr-FR': 'Mot de passe',
                                                'ru-RU': 'Пароль',
                                                'ja-JP': 'パスワード',
                                                'de-DE': 'Passwort',
                                                'pt-BR': 'Senha',
                                                'ko-KR': '비밀번호',
                                            },
                                            locale,
                                        )}
                                    </Label>
                                </div>
                                <Input
                                    id='password'
                                    name='password'
                                    type='password'
                                    required
                                    ref={(el) => {
                                        inputRefs.current.password = el;
                                    }}
                                    className={cn(
                                        !validation.password.valid &&
                                            validation.password.message &&
                                            'border-red-500',
                                    )}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                />
                                <AnimatePresence>
                                    {!validation.password.valid && validation.password.message && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: 'easeInOut',
                                                opacity: { duration: 0.2 },
                                            }}
                                            className='overflow-hidden'
                                        >
                                            <p className='text-sm text-red-500 pt-1'>
                                                {validation.password.message}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Button
                                type='submit'
                                className='w-full'
                                disabled={turnstileState.isLoading || isSubmitting}
                            >
                                {(turnstileState.isLoading || isSubmitting) ? (
                                    <>
                                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                        {lang(
                                            {
                                                'en-US': isSubmitting ? 'Registering...' : 'Verifying...',
                                                'zh-CN': isSubmitting ? '注册中...' : '验证中...',
                                                'zh-TW': isSubmitting ? '註冊中...' : '驗證中...',
                                                'es-ES': isSubmitting ? 'Registrando...' : 'Verificando...',
                                                'fr-FR': isSubmitting ? "Inscription..." : 'Vérification...',
                                                'ru-RU': isSubmitting ? 'Регистрация...' : 'Проверка...',
                                                'ja-JP': isSubmitting ? '登録中...' : '認証中...',
                                                'de-DE': isSubmitting ? 'Registrieren...' : 'Überprüfung...',
                                                'pt-BR': isSubmitting ? 'Registrando...' : 'Verificando...',
                                                'ko-KR': isSubmitting ? '회원가입 중...' : '인증 중...',
                                            },
                                            locale,
                                        )}
                                    </>
                                ) : (
                                    lang(
                                        {
                                            'en-US': 'Sign up',
                                            'zh-CN': '注册',
                                            'zh-TW': '註冊',
                                            'es-ES': 'Registrarse',
                                            'fr-FR': "S'inscrire",
                                            'ru-RU': 'Зарегистрироваться',
                                            'ja-JP': 'サインアップ',
                                            'de-DE': 'Registrieren',
                                            'pt-BR': 'Registrar-se',
                                            'ko-KR': '회원가입',
                                        },
                                        locale,
                                    )
                                )}
                            </Button>
                            {/* <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
                                <span className='bg-card text-muted-foreground relative z-10 px-2'>
                                    {lang(
                                        {
                                            'en-US': 'Or start with',
                                            'zh-CN': '或使用以下方式开始',
                                            'zh-TW': '或使用以下方式開始',
                                            'es-ES': 'O comienza con',
                                            'fr-FR': 'Ou commencez avec',
                                            'ru-RU': 'Или начните с',
                                            'ja-JP': 'または、以下から始める',
                                            'de-DE': 'Oder starte mit',
                                            'pt-BR': 'Ou comece com',
                                            'ko-KR': '또는 다음으로 시작하세요',
                                        },
                                        locale,
                                    )}
                                </span>
                            </div>
                            <div className='grid grid-cols-3 gap-4'>
                                <Button variant='outline' type='button' className='w-full'>
                                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                                        <path
                                            d='M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701'
                                            fill='currentColor'
                                        />
                                    </svg>
                                    <span className='sr-only'>Login with Apple</span>
                                </Button>
                                <Button variant='outline' type='button' className='w-full'>
                                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                                        <path
                                            d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                                            fill='currentColor'
                                        />
                                    </svg>
                                    <span className='sr-only'>Login with Google</span>
                                </Button>
                                <Button variant='outline' type='button' className='w-full'>
                                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                                        <path
                                            d='M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z'
                                            fill='currentColor'
                                        />
                                    </svg>
                                    <span className='sr-only'>Login with Meta</span>
                                </Button>
                            </div> */}
                            <div className='text-center text-sm'>
                                {lang(
                                    {
                                        'en-US': 'Already have an account?',
                                        'zh-CN': '已经有账号了？',
                                        'zh-TW': '已經有帳號了？',
                                        'es-ES': '¿Ya tienes una cuenta?',
                                        'fr-FR': 'Vous avez déjà un compte ?',
                                        'ru-RU': 'Уже есть аккаунт?',
                                        'ja-JP': 'すでにアカウントをお持ちですか？',
                                        'de-DE': 'Hast du bereits ein Konto?',
                                        'pt-BR': 'Já tem uma conta?',
                                        'ko-KR': '이미 계정이 있으신가요?',
                                    },
                                    locale,
                                )}{' '}
                                <Link href='/signin' className='underline underline-offset-4'>
                                    {lang(
                                        {
                                            'en-US': 'Sign in',
                                            'zh-CN': '登录',
                                            'zh-TW': '登入',
                                            'es-ES': 'Iniciar sesión',
                                            'fr-FR': 'Se connecter',
                                            'ru-RU': 'Войти',
                                            'ja-JP': 'ログイン',
                                            'de-DE': 'Anmelden',
                                            'pt-BR': 'Entrar',
                                            'ko-KR': '로그인',
                                        },
                                        locale,
                                    )}
                                </Link>
                            </div>
                        </div>
                    </form>

                    {useIsMobile() ? null : <EmojiArea />}
                </CardContent>
            </Card>

            {/* Turnstile验证错误对话框 */}
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-red-600'>
                            {lang(
                                {
                                    'en-US': 'Verification Error',
                                    'zh-CN': '验证错误',
                                    'zh-TW': '驗證錯誤',
                                    'es-ES': 'Error de Verificación',
                                    'fr-FR': 'Erreur de Vérification',
                                    'ru-RU': 'Ошибка Проверки',
                                    'ja-JP': '認証エラー',
                                    'de-DE': 'Überprüfungsfehler',
                                    'pt-BR': 'Erro de Verificação',
                                    'ko-KR': '인증 오류',
                                },
                                locale,
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {lang(
                                {
                                    'en-US':
                                        'An error occurred during security verification. Please try again.',
                                    'zh-CN': '安全验证过程中发生错误。请重试。',
                                    'zh-TW': '安全驗證過程中發生錯誤。請重試。',
                                    'es-ES':
                                        'Ocurrió un error durante la verificación de seguridad. Por favor, inténtalo de nuevo.',
                                    'fr-FR':
                                        "Une erreur s'est produite lors de la vérification de sécurité. Veuillez réessayer.",
                                    'ru-RU':
                                        'Произошла ошибка во время проверки безопасности. Пожалуйста, попробуйте снова.',
                                    'ja-JP':
                                        'セキュリティ認証中にエラーが発生しました。再試行してください。',
                                    'de-DE':
                                        'Bei der Sicherheitsüberprüfung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                                    'pt-BR':
                                        'Ocorreu um erro durante a verificação de segurança. Por favor, tente novamente.',
                                    'ko-KR':
                                        '보안 인증 중 오류가 발생했습니다. 다시 시도해 주세요.',
                                },
                                locale,
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex justify-center pt-4'>
                        <Button onClick={retryTurnstile}>
                            {lang(
                                {
                                    'en-US': 'Retry Verification',
                                    'zh-CN': '重试验证',
                                    'zh-TW': '重試驗證',
                                    'es-ES': 'Reintentar Verificación',
                                    'fr-FR': 'Réessayer la Vérification',
                                    'ru-RU': 'Повторить Проверку',
                                    'ja-JP': '認証を再試行',
                                    'de-DE': 'Überprüfung Wiederholen',
                                    'pt-BR': 'Tentar Verificação Novamente',
                                    'ko-KR': '인증 재시도',
                                },
                                locale,
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* API错误对话框 */}
            <Dialog open={isApiErrorDialogOpen} onOpenChange={setIsApiErrorDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-red-600'>
                            {lang(
                                {
                                    'en-US': 'Registration Error',
                                    'zh-CN': '注册错误',
                                    'zh-TW': '註冊錯誤',
                                    'es-ES': 'Error de Registro',
                                    'fr-FR': "Erreur d'Inscription",
                                    'ru-RU': 'Ошибка Регистрации',
                                    'ja-JP': '登録エラー',
                                    'de-DE': 'Registrierungsfehler',
                                    'pt-BR': 'Erro de Registro',
                                    'ko-KR': '등록 오류',
                                },
                                locale,
                            )}
                        </DialogTitle>
                        <DialogDescription>{apiErrorMessage}</DialogDescription>
                    </DialogHeader>
                    <div className='flex justify-center pt-4'>
                        <Button onClick={() => setIsApiErrorDialogOpen(false)}>
                            {lang(
                                {
                                    'en-US': 'OK',
                                    'zh-CN': '确定',
                                    'zh-TW': '確定',
                                    'es-ES': 'OK',
                                    'fr-FR': 'OK',
                                    'ru-RU': 'ОК',
                                    'ja-JP': 'OK',
                                    'de-DE': 'OK',
                                    'pt-BR': 'OK',
                                    'ko-KR': '확인',
                                },
                                locale,
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
                {lang(
                    {
                        'en-US': 'By clicking continue, you agree to our',
                        'zh-CN': '点击继续，即表示您同意我们的',
                        'zh-TW': '點擊繼續，即表示您同意我們的',
                        'es-ES': 'Al hacer clic en continuar, aceptas nuestros',
                        'fr-FR': 'En cliquant sur continuer, vous acceptez nos',
                        'ru-RU': 'Нажимая продолжить, вы соглашаетесь с нашими',
                        'ja-JP': '続行をクリックすると、当社の',
                        'de-DE': 'Durch Klicken auf Weiter stimmen Sie unseren',
                        'pt-BR': 'Ao clicar em continuar, você concorda com nossos',
                        'ko-KR': '계속을 클릭하면 당사의',
                    },
                    locale,
                )}{' '}
                <Link href='/policies/terms-of-service'>
                    {lang(
                        {
                            'en-US': 'Terms of Service',
                            'zh-CN': '服务条款',
                            'zh-TW': '服務條款',
                            'es-ES': 'Términos de servicio',
                            'fr-FR': "Conditions d'utilisation",
                            'ru-RU': 'Условия обслуживания',
                            'ja-JP': '利用規約',
                            'de-DE': 'Nutzungsbedingungen',
                            'pt-BR': 'Termos de serviço',
                            'ko-KR': '서비스 약관',
                        },
                        locale,
                    )}
                </Link>{' '}
                {lang(
                    {
                        'en-US': 'and',
                        'zh-CN': '和',
                        'zh-TW': '和',
                        'es-ES': 'y',
                        'fr-FR': 'et',
                        'ru-RU': 'и',
                        'ja-JP': 'と',
                        'de-DE': 'und',
                        'pt-BR': 'e',
                        'ko-KR': '및',
                    },
                    locale,
                )}{' '}
                <Link href='/policies/privacy-policy'>
                    {lang(
                        {
                            'en-US': 'Privacy Policy',
                            'zh-CN': '隐私政策',
                            'zh-TW': '隱私政策',
                            'es-ES': 'Política de privacidad',
                            'fr-FR': 'Politique de confidentialité',
                            'ru-RU': 'Политика конфиденциальности',
                            'ja-JP': 'プライバシーポリシー',
                            'de-DE': 'Datenschutzrichtlinie',
                            'pt-BR': 'Política de privacidade',
                            'ko-KR': '개인정보 처리방침',
                        },
                        locale,
                    )}
                </Link>
                .
            </div>
        </div>
    );
}
