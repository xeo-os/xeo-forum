import '@/app/globals.css';
import { Metadata } from 'next';
import lang from '@/lib/lang';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Globe } from 'lucide-react';
import Link from 'next/link';
import { RiGithubFill, RiMailFill } from '@remixicon/react';
import React from 'react';
import ContactForm from '@/components/contact-form';

type Props = {
    params: { locale: string };
};

export async function generateMetadata({
    params,
}: {
    params: { locale: string };
}): Promise<Metadata> {
    const locale = params.locale || 'en-US';

    const title = lang(
        {
            'zh-CN': '联系我们 | XEO OS - 交流每个人的观点',
            'en-US': "Contact Us | XEO OS - Exchange Everyone's Views",
            'ja-JP': 'お問い合わせ | XEO OS - みんなの意見を交換する',
            'ko-KR': '문의하기 | XEO OS - 모두의 의견을 교환하다',
            'fr-FR': 'Nous contacter | XEO OS - Échanger les opinions de chacun',
            'es-ES': 'Contáctanos | XEO OS - Intercambiar las opiniones de todos',
            'de-DE': 'Kontakt | XEO OS - Meinungen austauschen',
            'pt-BR': 'Entre em Contato | XEO OS - Trocar as Opiniões de Todos',
            'ru-RU': 'Связаться с нами | XEO OS - Обмен мнениями',
            'zh-TW': '聯絡我們 | XEO OS - 交流每個人的觀點',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '如有任何问题或建议，请通过以下方式联系 XEO OS 团队。我们很乐意听取您的意见。',
            'en-US':
                "If you have any questions or suggestions, please contact the XEO OS team through the following methods. We'd love to hear from you.",
            'ja-JP':
                'ご質問やご提案がございましたら、以下の方法でXEO OSチームにお気軽にお問い合わせください。',
            'ko-KR':
                '질문이나 제안이 있으시면 다음 방법을 통해 XEO OS 팀에 문의해 주세요. 여러분의 의견을 기다리고 있습니다.',
            'fr-FR':
                "Si vous avez des questions ou des suggestions, veuillez contacter l'équipe XEO OS par les méthodes suivantes.",
            'es-ES':
                'Si tiene alguna pregunta o sugerencia, póngase en contacto con el equipo de XEO OS a través de los siguientes métodos.',
            'de-DE':
                'Wenn Sie Fragen oder Vorschläge haben, kontaktieren Sie bitte das XEO OS-Team über die folgenden Methoden.',
            'pt-BR':
                'Se você tiver alguma pergunta ou sugestão, entre em contato com a equipe do XEO OS através dos seguintes métodos.',
            'ru-RU':
                'Если у вас есть вопросы или предложения, свяжитесь с командой XEO OS следующими способами.',
            'zh-TW': '如有任何問題或建議，請透過以下方式聯絡 XEO OS 團隊。我們很樂意聽取您的意見。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default function ContactPage({ params }: Props) {
    const locale = params.locale || 'en-US';

    return (
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
            <div className='space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Mail className='h-6 w-6' />
                            {lang(
                                {
                                    'zh-CN': '联系我们',
                                    'en-US': 'Contact Us',
                                    'ja-JP': 'お問い合わせ',
                                    'ko-KR': '문의하기',
                                    'fr-FR': 'Nous contacter',
                                    'es-ES': 'Contáctanos',
                                    'de-DE': 'Kontakt',
                                    'pt-BR': 'Entre em Contato',
                                    'ru-RU': 'Связаться с нами',
                                    'zh-TW': '聯絡我們',
                                },
                                locale,
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold'>
                                    {lang(
                                        {
                                            'zh-CN': '联系方式',
                                            'en-US': 'Contact Information',
                                            'ja-JP': '連絡先',
                                            'ko-KR': '연락처 정보',
                                            'fr-FR': 'Informations de contact',
                                            'es-ES': 'Información de contacto',
                                            'de-DE': 'Kontaktinformationen',
                                            'pt-BR': 'Informações de Contato',
                                            'ru-RU': 'Контактная информация',
                                            'zh-TW': '聯絡方式',
                                        },
                                        locale,
                                    )}
                                </h3>

                                <div className='space-y-3'>
                                    <div className='flex items-center gap-3'>
                                        <RiMailFill className='h-5 w-5 text-primary' />
                                        <div>
                                            <p className='font-medium'>
                                                {lang(
                                                    {
                                                        'zh-CN': '电子邮件',
                                                        'en-US': 'Email',
                                                        'ja-JP': 'メール',
                                                        'ko-KR': '이메일',
                                                        'fr-FR': 'Email',
                                                        'es-ES': 'Correo electrónico',
                                                        'de-DE': 'E-Mail',
                                                        'pt-BR': 'Email',
                                                        'ru-RU': 'Электронная почта',
                                                        'zh-TW': '電子郵件',
                                                    },
                                                    locale,
                                                )}
                                            </p>
                                            <Link
                                                href='mailto:contact@xeoos.com'
                                                className='text-primary hover:underline'
                                            >
                                                contact@xeoos.com
                                            </Link>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <MessageSquare className='h-5 w-5 text-primary' />
                                        <div>
                                            <p className='font-medium'>
                                                {lang(
                                                    {
                                                        'zh-CN': '管理员博客',
                                                        'en-US': 'Admin Blog',
                                                        'ja-JP': '管理者ブログ',
                                                        'ko-KR': '관리자 블로그',
                                                        'fr-FR': "Blog de l'admin",
                                                        'es-ES': 'Blog del administrador',
                                                        'de-DE': 'Admin-Blog',
                                                        'pt-BR': 'Blog do Admin',
                                                        'ru-RU': 'Блог администратора',
                                                        'zh-TW': '管理員博客',
                                                    },
                                                    locale,
                                                )}
                                            </p>
                                            <Link
                                                href='https://ravelloh.top'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-primary hover:underline'
                                            >
                                                {'ravelloh.top'}
                                            </Link>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <RiGithubFill className='h-5 w-5 text-primary' />
                                        <div>
                                            <p className='font-medium'>GitHub</p>
                                            <Link
                                                href='https://github.com/xeo-os'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-primary hover:underline'
                                            >
                                                github.com/xeo-os
                                            </Link>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <Globe className='h-5 w-5 text-primary' />
                                        <div>
                                            <p className='font-medium'>
                                                {lang(
                                                    {
                                                        'zh-CN': '官方网站',
                                                        'en-US': 'Official Website',
                                                        'ja-JP': '公式サイト',
                                                        'ko-KR': '공식 웹사이트',
                                                        'fr-FR': 'Site officiel',
                                                        'es-ES': 'Sitio web oficial',
                                                        'de-DE': 'Offizielle Website',
                                                        'pt-BR': 'Site Oficial',
                                                        'ru-RU': 'Официальный сайт',
                                                        'zh-TW': '官方網站',
                                                    },
                                                    locale,
                                                )}
                                            </p>
                                            <Link
                                                href='https://xeoos.net'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-primary hover:underline'
                                            >
                                                xeoos.com
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold'>
                                    {lang(
                                        {
                                            'zh-CN': '发送邮件',
                                            'en-US': 'Send Email',
                                            'ja-JP': 'メールを送信',
                                            'ko-KR': '이메일 보내기',
                                            'fr-FR': 'Envoyer un email',
                                            'es-ES': 'Enviar correo',
                                            'de-DE': 'E-Mail senden',
                                            'pt-BR': 'Enviar Email',
                                            'ru-RU': 'Отправить email',
                                            'zh-TW': '發送郵件',
                                        },
                                        locale,
                                    )}
                                </h3>

                                <ContactForm locale={locale} />
                            </div>
                        </div>

                        <div className='border-t pt-6'>
                            <p className='text-sm text-muted-foreground'>
                                {lang(
                                    {
                                        'zh-CN':
                                            '我们通常会在24小时内回复您的消息。感谢您对 XEO OS 的关注！',
                                        'en-US':
                                            'We usually reply to your message within 24 hours. Thank you for your interest in XEO OS!',
                                        'ja-JP':
                                            '通常24時間以内にメッセージにお返事いたします。XEO OSにご関心をお寄せいただき、ありがとうございます！',
                                        'ko-KR':
                                            '보통 24시간 이내에 메시지에 답변드립니다. XEO OS에 관심을 가져주셔서 감사합니다!',
                                        'fr-FR':
                                            'Nous répondons généralement à votre message dans les 24 heures. Merci de votre intérêt pour XEO OS !',
                                        'es-ES':
                                            'Normalmente respondemos a su mensaje dentro de las 24 horas. ¡Gracias por su interés en XEO OS!',
                                        'de-DE':
                                            'Wir antworten normalerweise innerhalb von 24 Stunden auf Ihre Nachricht. Vielen Dank für Ihr Interesse an XEO OS!',
                                        'pt-BR':
                                            'Geralmente respondemos à sua mensagem em até 24 horas. Obrigado pelo seu interesse no XEO OS!',
                                        'ru-RU':
                                            'Обычно мы отвечаем на ваше сообщение в течение 24 часов. Спасибо за ваш интерес к XEO OS!',
                                        'zh-TW':
                                            '我們通常會在24小時內回覆您的訊息。感謝您對 XEO OS 的關注！',
                                    },
                                    locale,
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
