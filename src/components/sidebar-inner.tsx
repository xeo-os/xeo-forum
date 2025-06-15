'use client';

import React from 'react';
import lang from '@/lib/lang';
import emojiIcon from '@/lib/emoji-icon';

import { RiArrowDownSLine } from '@remixicon/react';
import { motion, AnimatePresence } from 'motion/react';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useBroadcast } from '@/store/useBroadcast';
import Link from 'next/link';

export function SidebarInner({
    locale,
    topics,
}: {
    locale: string;
    topics: {
        title: string;
        icon: string;
        items?: { title: string; url: string; icon: string; name: string }[];
    }[];
}) {
    // 初始化话题展开状态
    const [openTopics, setOpenTopics] = useState<Set<string>>(() => {
        // 如果是服务端渲染，返回空集合
        if (typeof window === 'undefined') {
            return new Set<string>();
        }

        const stored = localStorage.getItem('sidebar-open-topics');
        if (stored) {
            // 如果localStorage中有数据，使用保存的状态
            try {
                const parsed = JSON.parse(stored);
                return new Set(parsed);
            } catch {
                // 解析失败，返回空集合
                return new Set<string>();
            }
        }

        // 第一次访问，默认全部展开
        const allTopicTitles = new Set<string>();
        topics.forEach((topic) => {
            allTopicTitles.add(topic.title);
        });
        return allTopicTitles;
    });

    // 记录是否已经初始化过localStorage
    const [hasInitialized, setHasInitialized] = useState(false);

    const { registerCallback, unregisterCallback } = useBroadcast();

    const topic: {
        title: string;
        icon: React.ComponentType;
        items?: {
            title: string;
            url: string;
            icon: React.ComponentType;
            name: string;
        }[];
    }[] = topics.map((item) => ({
        title: item.title,
        icon: emojiIcon(item.icon),
        items: item.items?.map((i) => ({
            title: i.title,
            url: i.url,
            name: i.name,
            icon: emojiIcon(i.icon),
        })),
    }));

    useEffect(() => {
        const handleMessage = (message: unknown) => {
            const typedMessage = message as { action: string };
            if (typedMessage.action == 'loadingComplete') {
                // 页面初始化完成后，如果localStorage中没有数据，则展开所有话题
                setTimeout(() => {
                    const stored = localStorage.getItem('sidebar-open-topics');
                    if (!stored && !hasInitialized) {
                        const allTopicTitles = new Set<string>();
                        topics.forEach((topic) => {
                            allTopicTitles.add(topic.title);
                        });
                        setOpenTopics(allTopicTitles);
                        setHasInitialized(true);
                    }
                }, 1000);
            }
        };
        registerCallback(handleMessage);
        return () => {
            unregisterCallback(handleMessage);
        };
    }, [registerCallback, unregisterCallback, topics, hasInitialized]);

    // 保存状态到localStorage
    const saveToLocalStorage = (newOpenTopics: Set<string>) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-open-topics', JSON.stringify(Array.from(newOpenTopics)));
        }
    };

    const toggleTopic = (title: string) => {
        const newOpenTopics = new Set(openTopics);
        if (newOpenTopics.has(title)) {
            newOpenTopics.delete(title);
        } else {
            newOpenTopics.add(title);
        }
        setOpenTopics(newOpenTopics);
        // 保存到localStorage
        saveToLocalStorage(newOpenTopics);
    };

    const mainItems = [
        {
            title: lang(
                {
                    'en-US': 'Home',
                    'zh-CN': '主页',
                    'zh-TW': '主頁',
                    'es-ES': 'Inicio',
                    'fr-FR': 'Accueil',
                    'ru-RU': 'Главная',
                    'ja-JP': 'ホーム',
                    'de-DE': 'Startseite',
                    'pt-BR': 'Início',
                    'ko-KR': '홈',
                },
                locale,
            ),
            url: '/' + locale,
            icon: emojiIcon('🏠'),
        },
        {
            title: lang(
                {
                    'zh-CN': '公告',
                    'zh-TW': '公告',
                    'en-US': 'Announcements',
                    'es-ES': 'Anuncios',
                    'fr-FR': 'Annonces',
                    'ru-RU': 'Объявления',
                    'ja-JP': 'お知らせ',
                    'de-DE': 'Ankündigungen',
                    'pt-BR': 'Anúncios',
                    'ko-KR': '공지사항',
                },
                locale,
            ),
            url: '/' + locale + '/announcements',
            icon: emojiIcon('📢'),
        },
        {
            title: lang(
                {
                    'zh-CN': '排行榜',
                    'zh-TW': '排行榜',
                    'en-US': 'Leaderboard',
                    'es-ES': 'Tabla de Clasificación',
                    'fr-FR': 'Classement',
                    'ru-RU': 'Таблица Лидеров',
                    'ja-JP': 'ランキング',
                    'de-DE': 'Rangliste',
                    'pt-BR': 'Classificação',
                    'ko-KR': '리더보드',
                },
                locale,
            ),
            url: '/' + locale + '/leaderboard',
            icon: emojiIcon('🏆'),
        },
    ];

    const miscList = [
        {
            title: lang(
                {
                    'zh-CN': '服务条款',
                    'zh-TW': '服務條款',
                    'en-US': 'Terms of Service',
                    'es-ES': 'Términos de Servicio',
                    'fr-FR': 'Conditions de Service',
                    'ru-RU': 'Условия Обслуживания',
                    'ja-JP': '利用規約',
                    'de-DE': 'Nutzungsbedingungen',
                    'pt-BR': 'Termos de Serviço',
                    'ko-KR': '서비스 약관',
                },
                locale,
            ),
            url: '/' + locale + '/policies/terms-of-service',
            icon: emojiIcon('📜'),
        },
        {
            title: lang(
                {
                    'zh-CN': '隐私政策',
                    'zh-TW': '隱私政策',
                    'en-US': 'Privacy Policy',
                    'es-ES': 'Política de Privacidad',
                    'fr-FR': 'Politique de Confidentialité',
                    'ru-RU': 'Политика Конфиденциальности',
                    'ja-JP': 'プライバシーポリシー',
                    'de-DE': 'Datenschutzrichtlinie',
                    'pt-BR': 'Política de Privacidade',
                    'ko-KR': '개인정보 보호정책',
                },
                locale,
            ),
            url: '/' + locale + '/policies/privacy-policy',
            icon: emojiIcon('🔒'),
        },
        {
            title: lang(
                {
                    'zh-CN': '关于我们',
                    'zh-TW': '關於我們',
                    'en-US': 'About Us',
                    'es-ES': 'Sobre Nosotros',
                    'fr-FR': 'À Propos de Nous',
                    'ru-RU': 'О Нас',
                    'ja-JP': '私たちについて',
                    'de-DE': 'Über Uns',
                    'pt-BR': 'Sobre Nós',
                    'ko-KR': '회사 소개',
                },
                locale,
            ),
            url: '/' + locale + '/about',
            icon: emojiIcon('ℹ️'),
        },
        {
            title: lang(
                {
                    'zh-CN': '联系我们',
                    'zh-TW': '聯繫我們',
                    'en-US': 'Contact Us',
                    'es-ES': 'Contáctenos',
                    'fr-FR': 'Contactez-Nous',
                    'ru-RU': 'Свяжитесь с Нами',
                    'ja-JP': 'お問い合わせ',
                    'de-DE': 'Kontaktieren Sie Uns',
                    'pt-BR': 'Fale Conosco',
                    'ko-KR': '문의하기',
                },
                locale,
            ),
            url: '/' + locale + '/contact',
            icon: emojiIcon('📧'),
        },
    ];

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {mainItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <motion.div
                                whileHover={{ scale: 1.02, x: 4 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            >
                                <SidebarMenuButton
                                    asChild
                                    className='transition-all duration-200 hover:bg-primary/10 hover:text-primary'
                                >
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </motion.div>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <br />
                <Separator />
                <br />
                <SidebarMenu>
                    {topic.map((topic) => (
                        <motion.div
                            key={topic.title}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <SidebarMenuItem>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                >
                                    <SidebarMenuButton
                                        className='w-full transition-all duration-200 hover:bg-primary/10 hover:text-primary'
                                        onClick={() => toggleTopic(topic.title)}
                                    >
                                        <topic.icon />
                                        <span>{topic.title}</span>
                                        <motion.div
                                            animate={{
                                                rotate: openTopics.has(topic.title) ? 180 : 0,
                                            }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className='ml-auto'
                                        >
                                            <RiArrowDownSLine className='h-4 w-4' />
                                        </motion.div>
                                    </SidebarMenuButton>
                                </motion.div>
                            </SidebarMenuItem>
                            <AnimatePresence>
                                {openTopics.has(topic.title) && (
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
                                        <SidebarMenu>
                                            {topic.items?.map((subItem, index) => (
                                                <motion.div
                                                    key={subItem.title}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: index * 0.05,
                                                        ease: 'easeOut',
                                                    }}
                                                >
                                                    <SidebarMenuItem>
                                                        <motion.div
                                                            whileHover={{ scale: 1.02, x: 8 }}
                                                            transition={{
                                                                duration: 0.2,
                                                                ease: 'easeOut',
                                                            }}
                                                        >
                                                            <SidebarMenuButton
                                                                asChild
                                                                className='pl-8 transition-all duration-200 hover:bg-primary/10 hover:text-primary'
                                                            >
                                                                <Link
                                                                    href={
                                                                        '/' +
                                                                        locale +
                                                                        '/topic/' +
                                                                        subItem.name
                                                                            .toLowerCase()
                                                                            .replaceAll('_', '-')
                                                                    }
                                                                >
                                                                    <subItem.icon />
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </motion.div>
                                                    </SidebarMenuItem>
                                                </motion.div>
                                            ))}
                                        </SidebarMenu>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                    <br />
                    <Separator />
                    <br />
                    {miscList.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <motion.div
                                whileHover={{ scale: 1.02, x: 4 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            >
                                <SidebarMenuButton
                                    asChild
                                    className='transition-all duration-200 hover:bg-primary/10 hover:text-primary'
                                >
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </motion.div>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
