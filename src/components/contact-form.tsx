'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import lang from '@/lib/lang';

export default function ContactForm({ locale }: { locale: string }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const nickname = formData.get('nickname') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        const mailtoSubject = encodeURIComponent(
            subject ||
                lang(
                    {
                        'zh-CN': '来自 XEO OS 论坛的消息',
                        'en-US': 'Message from XEO OS Forum',
                        'ja-JP': 'XEO OS フォーラムからのメッセージ',
                        'ko-KR': 'XEO OS 포럼에서 온 메시지',
                        'fr-FR': 'Message du forum XEO OS',
                        'es-ES': 'Mensaje del foro XEO OS',
                        'de-DE': 'Nachricht vom XEO OS Forum',
                        'pt-BR': 'Mensagem do Fórum XEO OS',
                        'ru-RU': 'Сообщение с форума XEO OS',
                        'zh-TW': '來自 XEO OS 論壇的訊息',
                    },
                    locale,
                ),
        );

        const mailtoBody = encodeURIComponent(`${lang(
            {
                'zh-CN': '昵称',
                'en-US': 'Nickname',
                'ja-JP': 'ニックネーム',
                'ko-KR': '닉네임',
                'fr-FR': 'Pseudo',
                'es-ES': 'Apodo',
                'de-DE': 'Spitzname',
                'pt-BR': 'Apelido',
                'ru-RU': 'Никнейм',
                'zh-TW': '暱稱',
            },
            locale,
        )}: ${nickname}
${lang(
    {
        'zh-CN': '邮箱',
        'en-US': 'Email',
        'ja-JP': 'メール',
        'ko-KR': '이메일',
        'fr-FR': 'Email',
        'es-ES': 'Correo',
        'de-DE': 'E-Mail',
        'pt-BR': 'Email',
        'ru-RU': 'Email',
        'zh-TW': '信箱',
    },
    locale,
)}: ${email}

${lang(
    {
        'zh-CN': '消息内容',
        'en-US': 'Message',
        'ja-JP': 'メッセージ',
        'ko-KR': '메시지',
        'fr-FR': 'Message',
        'es-ES': 'Mensaje',
        'de-DE': 'Nachricht',
        'pt-BR': 'Mensagem',
        'ru-RU': 'Сообщение',
        'zh-TW': '訊息內容',
    },
    locale,
)}:
${message}`);

        window.location.href = `mailto:contact@xeoos.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    };

    return (
        <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
                <Input
                    name='nickname'
                    placeholder={lang(
                        {
                            'zh-CN': '您的昵称',
                            'en-US': 'Your Nickname',
                            'ja-JP': 'ニックネーム',
                            'ko-KR': '닉네임',
                            'fr-FR': 'Votre pseudo',
                            'es-ES': 'Su apodo',
                            'de-DE': 'Ihr Spitzname',
                            'pt-BR': 'Seu Apelido',
                            'ru-RU': 'Ваш никнейм',
                            'zh-TW': '您的暱稱',
                        },
                        locale,
                    )}
                    required
                />
            </div>
            <div>
                <Input
                    type='email'
                    name='email'
                    placeholder={lang(
                        {
                            'zh-CN': '您的邮箱',
                            'en-US': 'Your Email',
                            'ja-JP': 'メールアドレス',
                            'ko-KR': '이메일',
                            'fr-FR': 'Votre email',
                            'es-ES': 'Su correo electrónico',
                            'de-DE': 'Ihre E-Mail',
                            'pt-BR': 'Seu Email',
                            'ru-RU': 'Ваш email',
                            'zh-TW': '您的信箱',
                        },
                        locale,
                    )}
                    required
                />
            </div>
            <div>
                <Input
                    name='subject'
                    placeholder={lang(
                        {
                            'zh-CN': '主题',
                            'en-US': 'Subject',
                            'ja-JP': '件名',
                            'ko-KR': '제목',
                            'fr-FR': 'Sujet',
                            'es-ES': 'Asunto',
                            'de-DE': 'Betreff',
                            'pt-BR': 'Assunto',
                            'ru-RU': 'Тема',
                            'zh-TW': '主題',
                        },
                        locale,
                    )}
                />
            </div>
            <div>
                <Textarea
                    name='message'
                    placeholder={lang(
                        {
                            'zh-CN': '您的消息...',
                            'en-US': 'Your message...',
                            'ja-JP': 'メッセージをお書きください...',
                            'ko-KR': '메시지를 입력하세요...',
                            'fr-FR': 'Votre message...',
                            'es-ES': 'Su mensaje...',
                            'de-DE': 'Ihre Nachricht...',
                            'pt-BR': 'Sua mensagem...',
                            'ru-RU': 'Ваше сообщение...',
                            'zh-TW': '您的訊息...',
                        },
                        locale,
                    )}
                    rows={5}
                    required
                />
            </div>
            <Button type='submit' className='w-full'>
                {lang(
                    {
                        'zh-CN': '发送邮件',
                        'en-US': 'Send Email',
                        'ja-JP': 'メールを送信',
                        'ko-KR': '이메일 보내기',
                        'fr-FR': "Envoyer l'email",
                        'es-ES': 'Enviar correo',
                        'de-DE': 'E-Mail senden',
                        'pt-BR': 'Enviar Email',
                        'ru-RU': 'Отправить email',
                        'zh-TW': '發送郵件',
                    },
                    locale,
                )}
            </Button>
        </form>
    );
}
