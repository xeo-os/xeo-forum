'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import lang from '@/lib/lang';
import { useSearchParams } from 'next/navigation';
import { EmojiArea } from './emoji-area';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import token from '@/utils/userToken';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const searchParams = useSearchParams();
    const locale = searchParams?.get('lang') || 'en-US';

    const [isLoading, setIsLoading] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (token.get()) {
        window.location.href = '/';
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // 基本验证
        if (!email || !password) {
            toast.error(
                lang(
                    {
                        'en-US': 'Please fill in all fields',
                        'zh-CN': '请填写所有字段',
                        'zh-TW': '請填寫所有字段',
                        'es-ES': 'Por favor, complete todos los campos',
                        'fr-FR': 'Veuillez remplir tous les champs',
                        'ru-RU': 'Пожалуйста, заполните все поля',
                        'ja-JP': 'すべてのフィールドを入力してください',
                        'de-DE': 'Bitte füllen Sie alle Felder aus',
                        'pt-BR': 'Por favor, preencha todos os campos',
                        'ko-KR': '모든 필드를 입력해 주세요',
                    },
                    locale,
                ),
            );
            return;
        }

        // 锁定登录按钮
        setIsLoading(true);

        try {
            const response = await fetch('/api/user/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    lang: locale,
                }),
            });

            const data = await response.json();

            if (data.ok && data.jwt) {
                // 登录成功
                console.log('JWT Token:', data.jwt);
                token.write(data.jwt, 7 * 24 * 60 * 60);

                toast.success(
                    lang(
                        {
                            'en-US': 'Login successful! Redirecting...',
                            'zh-CN': '登录成功！正在跳转...',
                            'zh-TW': '登入成功！正在跳轉...',
                            'es-ES': '¡Inicio de sesión exitoso! Redirigiendo...',
                            'fr-FR': 'Connexion réussie ! Redirection...',
                            'ru-RU': 'Вход выполнен успешно! Перенаправление...',
                            'ja-JP': 'ログイン成功！リダイレクト中...',
                            'de-DE': 'Anmeldung erfolgreich! Weiterleitung...',
                            'pt-BR': 'Login bem-sucedido! Redirecionando...',
                            'ko-KR': '로그인 성공! 리디렉션 중...',
                        },
                        locale,
                    ),
                );

                // 延迟跳转
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                // 显示API错误信息
                setErrorMessage(
                    data.message ||
                        lang(
                            {
                                'en-US': 'Login failed. Please check your credentials.',
                                'zh-CN': '登录失败，请检查您的凭据。',
                                'zh-TW': '登入失敗，請檢查您的憑據。',
                                'es-ES': 'Error de inicio de sesión. Verifique sus credenciales.',
                                'fr-FR': 'Échec de la connexion. Vérifiez vos identifiants.',
                                'ru-RU': 'Ошибка входа. Проверьте ваши учетные данные.',
                                'ja-JP': 'ログインに失敗しました。認証情報を確認してください。',
                                'de-DE':
                                    'Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.',
                                'pt-BR': 'Falha no login. Verifique suas credenciais.',
                                'ko-KR': '로그인 실패. 자격 증명을 확인해 주세요.',
                            },
                            locale,
                        ),
                );
                setIsErrorDialogOpen(true);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error during login:', error);

            // 显示网络错误
            setErrorMessage(
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
            setIsErrorDialogOpen(true);
            setIsLoading(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
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
                                    disabled={isLoading}
                                />
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
                                    <Link
                                        href='/reset-password'
                                        className='ml-auto text-sm underline-offset-2 hover:underline'
                                    >
                                        {lang(
                                            {
                                                'en-US': 'Forgot password?',
                                                'zh-CN': '忘记密码？',
                                                'zh-TW': '忘記密碼？',
                                                'es-ES': '¿Olvidaste tu contraseña?',
                                                'fr-FR': 'Mot de passe oublié ?',
                                                'ru-RU': 'Забыли пароль?',
                                                'ja-JP': 'パスワードを忘れましたか？',
                                                'de-DE': 'Passwort vergessen?',
                                                'pt-BR': 'Esqueci minha senha',
                                                'ko-KR': '비밀번호를 잊으셨나요?',
                                            },
                                            locale,
                                        )}
                                    </Link>
                                </div>
                                <Input
                                    id='password'
                                    name='password'
                                    type='password'
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type='submit' className='w-full' disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                        {lang(
                                            {
                                                'en-US': 'Signing in...',
                                                'zh-CN': '登录中...',
                                                'zh-TW': '登入中...',
                                                'es-ES': 'Iniciando sesión...',
                                                'fr-FR': 'Connexion...',
                                                'ru-RU': 'Вход...',
                                                'ja-JP': 'ログイン中...',
                                                'de-DE': 'Anmeldung...',
                                                'pt-BR': 'Entrando...',
                                                'ko-KR': '로그인 중...',
                                            },
                                            locale,
                                        )}
                                    </>
                                ) : (
                                    lang(
                                        {
                                            'en-US': 'Login',
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
                                    )
                                )}
                            </Button>
                            <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
                                <span className='bg-card text-muted-foreground relative z-10 px-2'>
                                    {lang(
                                        {
                                            'en-US': 'Or continue with',
                                            'zh-CN': '或使用以下方式继续',
                                            'zh-TW': '或使用以下方式繼續',
                                            'es-ES': 'O continúa con',
                                            'fr-FR': 'Ou continuez avec',
                                            'ru-RU': 'Или продолжите с помощью',
                                            'ja-JP': 'または次の方法で続行',
                                            'de-DE': 'Oder fortfahren mit',
                                            'pt-BR': 'Ou continue com',
                                            'ko-KR': '또는 다음으로 계속',
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
                            </div>
                            <div className='text-center text-sm'>
                                {lang(
                                    {
                                        'en-US': "Don't have an account?",
                                        'zh-CN': '还没有账号？',
                                        'zh-TW': '還沒有帳號？',
                                        'es-ES': '¿No tienes una cuenta?',
                                        'fr-FR': "Vous n'avez pas de compte ?",
                                        'ru-RU': 'Нет аккаунта?',
                                        'ja-JP': 'アカウントをお持ちでないですか？',
                                        'de-DE': 'Kein Konto?',
                                        'pt-BR': 'Não tem uma conta?',
                                        'ko-KR': '계정이 없으신가요?',
                                    },
                                    locale,
                                )}{' '}
                                <Link href='/signup' className='underline underline-offset-4'>
                                    {lang(
                                        {
                                            'en-US': 'Sign up',
                                            'zh-CN': '注册',
                                            'zh-TW': '註冊',
                                            'es-ES': 'Regístrate',
                                            'fr-FR': "S'inscrire",
                                            'ru-RU': 'Зарегистрироваться',
                                            'ja-JP': 'サインアップ',
                                            'de-DE': 'Registrieren',
                                            'pt-BR': 'Registrar-se',
                                            'ko-KR': '회원가입',
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

            {/* 错误对话框 */}
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-red-600'>
                            {lang(
                                {
                                    'en-US': 'Login Error',
                                    'zh-CN': '登录错误',
                                    'zh-TW': '登入錯誤',
                                    'es-ES': 'Error de Inicio de Sesión',
                                    'fr-FR': 'Erreur de Connexion',
                                    'ru-RU': 'Ошибка Входа',
                                    'ja-JP': 'ログインエラー',
                                    'de-DE': 'Anmeldungsfehler',
                                    'pt-BR': 'Erro de Login',
                                    'ko-KR': '로그인 오류',
                                },
                                locale,
                            )}
                        </DialogTitle>
                        <DialogDescription>{errorMessage}</DialogDescription>
                    </DialogHeader>
                    <div className='flex justify-center pt-4'>
                        <Button onClick={() => setIsErrorDialogOpen(false)}>
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
