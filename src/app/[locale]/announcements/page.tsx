'use client';

import '@/app/globals.css';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import lang from '@/lib/lang';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pin, Calendar, AlertCircle, Megaphone, Info, Settings, ChevronDown, Hash, BarChart3 } from 'lucide-react';
import {
    getSortedAnnouncements,
    getAnnouncementTitle,
    getAnnouncementContent,
    formatAnnouncementContent,
    formatPublishDate,
    getAnnouncementStats,
    type Announcement,
} from '@/utils/announcements';

function getAnnouncementIcon(type: string) {
    switch (type) {
        case 'important':
            return <AlertCircle className="h-5 w-5 text-red-500" />;
        case 'update':
            return <Megaphone className="h-5 w-5 text-blue-500" />;
        case 'info':
            return <Info className="h-5 w-5 text-green-500" />;
        case 'event':
            return <Calendar className="h-5 w-5 text-purple-500" />;
        case 'maintenance':
            return <Settings className="h-5 w-5 text-orange-500" />;
        default:
            return <Info className="h-5 w-5 text-gray-500" />;
    }
}

function getAnnouncementBadgeColor(type: string) {
    switch (type) {
        case 'important':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'update':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'info':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'event':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'maintenance':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

function AnnouncementCard({ 
    announcement, 
    title, 
    content, 
    typeLabel, 
    locale 
}: {
    announcement: Announcement;
    title: string;
    content: string;
    typeLabel: string;
    locale: string;
}) {
    const [isExpanded, setIsExpanded] = useState(!announcement.expired);

    return (
        <motion.div 
            id={`announcement-${announcement.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                announcement.pinned 
                    ? 'bg-card border-l-4 border-primary' 
                    : 'bg-card'
            } ${announcement.expired ? 'opacity-75' : ''}`}
        >
            {/* 标题行 */}
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                    {announcement.pinned && (
                        <Pin className="inline h-4 w-4 mr-2 text-blue-500" />
                    )}
                    {title}
                    {announcement.expired && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {lang(
                                {
                                    'zh-CN': '已过期',
                                    'en-US': 'Expired',
                                    'ja-JP': '期限切れ',
                                    'ko-KR': '만료됨',
                                    'fr-FR': 'Expiré',
                                    'es-ES': 'Expirado',
                                    'de-DE': 'Abgelaufen',
                                    'pt-BR': 'Expirado',
                                    'ru-RU': 'Устарел',
                                    'zh-TW': '已過期',
                                },
                                locale,
                            )}
                        </Badge>
                    )}
                </h3>
            </div>

            {/* 类型和时间行 */}
            <div className="flex items-center gap-3 mb-4">
                {getAnnouncementIcon(announcement.type)}
                <Badge 
                    variant="secondary" 
                    className={getAnnouncementBadgeColor(announcement.type)}
                >
                    {typeLabel}
                </Badge>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatPublishDate(announcement.publishedAt, locale)}
                </div>
                {announcement.expired && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-auto text-xs"
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-3 w-3 mr-1" />
                        </motion.div>
                        {lang(
                            {
                                'zh-CN': isExpanded ? '收起' : '展开',
                                'en-US': isExpanded ? 'Collapse' : 'Expand',
                                'ja-JP': isExpanded ? '折りたたむ' : '展開',
                                'ko-KR': isExpanded ? '접기' : '펼치기',
                                'fr-FR': isExpanded ? 'Réduire' : 'Développer',
                                'es-ES': isExpanded ? 'Contraer' : 'Expandir',
                                'de-DE': isExpanded ? 'Einklappen' : 'Ausklappen',
                                'pt-BR': isExpanded ? 'Recolher' : 'Expandir',
                                'ru-RU': isExpanded ? 'Свернуть' : 'Развернуть',
                                'zh-TW': isExpanded ? '收起' : '展開',
                            },
                            locale,
                        )}
                    </Button>
                )}
            </div>

            {/* 内容区域 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="prose prose-gray dark:prose-invert max-w-none overflow-hidden"
                    >
                        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                            {formatAnnouncementContent(content)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// 计数器动画组件
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            
            const currentValue = Math.floor(progress * value);
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animateCount);
            }
        };

        animationFrame = requestAnimationFrame(animateCount);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [value, duration]);

    return <span>{displayValue}</span>;
}

export default function AnnouncementsPage() {
    const params = useParams();
    const locale = params.locale as string;
    
    // 获取排序后的公告
    const sortedAnnouncements = getSortedAnnouncements();
    const stats = getAnnouncementStats();

    const pageTitle = lang(
        {
            'zh-CN': '公告',
            'en-US': 'Announcements',
            'ja-JP': 'お知らせ',
            'ko-KR': '공지사항',
            'fr-FR': 'Annonces',
            'es-ES': 'Anuncios',
            'de-DE': 'Ankündigungen',
            'pt-BR': 'Anúncios',
            'ru-RU': 'Объявления',
            'zh-TW': '公告',
        },
        locale,
    );

    const pageDescription = lang(
        {
            'zh-CN': '获取最新的更新、重要通知和活动信息',
            'en-US': 'Get the latest updates, important notifications and event information',
            'ja-JP': '最新のアップデート、重要な通知、イベント情報を取得',
            'ko-KR': '최신 업데이트, 중요한 알림 및 이벤트 정보를 확인하세요',
            'fr-FR': 'Obtenez les dernières mises à jour, notifications importantes et informations sur les événements',
            'es-ES': 'Obtén las últimas actualizaciones, notificaciones importantes e información de eventos',
            'de-DE': 'Erhalten Sie die neuesten Updates, wichtige Benachrichtigungen und Veranstaltungsinformationen',
            'pt-BR': 'Obtenha as últimas atualizações, notificações importantes e informações de eventos',
            'ru-RU': 'Получайте последние обновления, важные уведомления и информацию о событиях',
            'zh-TW': '取得最新的更新、重要通知和活動資訊',
        },
        locale,
    );

    const typeLabels = {
        important: lang(
            {
                'zh-CN': '重要',
                'en-US': 'Important',
                'ja-JP': '重要',
                'ko-KR': '중요',
                'fr-FR': 'Important',
                'es-ES': 'Importante',
                'de-DE': 'Wichtig',
                'pt-BR': 'Importante',
                'ru-RU': 'Важно',
                'zh-TW': '重要',
            },
            locale,
        ),
        update: lang(
            {
                'zh-CN': '更新',
                'en-US': 'Update',
                'ja-JP': 'アップデート',
                'ko-KR': '업데이트',
                'fr-FR': 'Mise à jour',
                'es-ES': 'Actualización',
                'de-DE': 'Update',
                'pt-BR': 'Atualização',
                'ru-RU': 'Обновление',
                'zh-TW': '更新',
            },
            locale,
        ),
        info: lang(
            {
                'zh-CN': '信息',
                'en-US': 'Info',
                'ja-JP': '情報',
                'ko-KR': '정보',
                'fr-FR': 'Info',
                'es-ES': 'Info',
                'de-DE': 'Info',
                'pt-BR': 'Info',
                'ru-RU': 'Информация',
                'zh-TW': '資訊',
            },
            locale,
        ),
        event: lang(
            {
                'zh-CN': '活动',
                'en-US': 'Event',
                'ja-JP': 'イベント',
                'ko-KR': '이벤트',
                'fr-FR': 'Événement',
                'es-ES': 'Evento',
                'de-DE': 'Veranstaltung',
                'pt-BR': 'Evento',
                'ru-RU': 'Событие',
                'zh-TW': '活動',
            },
            locale,
        ),
        maintenance: lang(
            {
                'zh-CN': '维护',
                'en-US': 'Maintenance',
                'ja-JP': 'メンテナンス',
                'ko-KR': '유지보수',
                'fr-FR': 'Maintenance',
                'es-ES': 'Mantenimiento',
                'de-DE': 'Wartung',
                'pt-BR': 'Manutenção',
                'ru-RU': 'Техобслуживание',
                'zh-TW': '維護',
            },
            locale,
        ),
    };

    return (
        <div className="mx-auto px-4 py-6 max-w-7xl">
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">{pageTitle}</h1>
                <p className="text-sm text-muted-foreground">
                    {pageDescription}
                </p>
            </div>

            <div className="flex gap-6">
                {/* 主要内容区域 */}                <div className="flex-1">
                    {/* 公告列表 */}
                    <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {sortedAnnouncements.map((announcement, index) => {
                            const title = getAnnouncementTitle(announcement, locale);
                            const content = getAnnouncementContent(announcement, locale);
                            const typeLabel = typeLabels[announcement.type as keyof typeof typeLabels] || announcement.type;

                            return (
                                <motion.div
                                    key={announcement.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        duration: 0.4,
                                        delay: index * 0.1 
                                    }}
                                >
                                    <AnnouncementCard 
                                        announcement={announcement}
                                        title={title}
                                        content={content}
                                        typeLabel={typeLabel}
                                        locale={locale}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* 空状态 */}
                    {sortedAnnouncements.length === 0 && (
                        <div className="text-center py-12">
                            <Megaphone className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {lang(
                                    {
                                        'zh-CN': '暂无公告',
                                        'en-US': 'No announcements',
                                        'ja-JP': 'お知らせがありません',
                                        'ko-KR': '공지사항이 없습니다',
                                        'fr-FR': 'Aucune annonce',
                                        'es-ES': 'No hay anuncios',
                                        'de-DE': 'Keine Ankündigungen',
                                        'pt-BR': 'Nenhum anúncio',
                                        'ru-RU': 'Нет объявлений',
                                        'zh-TW': '暫無公告',
                                    },
                                    locale,
                                )}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {lang(
                                    {
                                        'zh-CN': '目前没有公告信息，请稍后查看。',
                                        'en-US': 'There are no announcements at the moment, please check back later.',
                                        'ja-JP': '現在お知らせはありません。後ほどご確認ください。',
                                        'ko-KR': '현재 공지사항이 없습니다. 나중에 다시 확인해주세요.',
                                        'fr-FR': 'Il n\'y a pas d\'annonces pour le moment, veuillez revenir plus tard.',
                                        'es-ES': 'No hay anuncios en este momento, por favor vuelve más tarde.',
                                        'de-DE': 'Es gibt derzeit keine Ankündigungen, bitte schauen Sie später noch einmal vorbei.',
                                        'pt-BR': 'Não há anúncios no momento, por favor volte mais tarde.',
                                        'ru-RU': 'В настоящее время нет объявлений, пожалуйста, проверьте позже.',
                                        'zh-TW': '目前沒有公告資訊，請稍後查看。',
                                    },
                                    locale,
                                )}
                            </p>
                        </div>
                    )}
                </div>                {/* 右侧统计区域 */}
                <motion.div 
                    className="hidden xl:block w-80 space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* 统计信息 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1] 
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 4
                                    }}
                                >
                                    <BarChart3 className="h-5 w-5" />
                                </motion.div>
                                {lang(
                                    {
                                        'zh-CN': '公告统计',
                                        'en-US': 'Announcement Statistics',
                                        'ja-JP': 'お知らせ統計',
                                        'ko-KR': '공지사항 통계',
                                        'fr-FR': 'Statistiques des annonces',
                                        'es-ES': 'Estadísticas de anuncios',
                                        'de-DE': 'Ankündigungsstatistiken',
                                        'pt-BR': 'Estatísticas de anúncios',
                                        'ru-RU': 'Статистика объявлений',
                                        'zh-TW': '公告統計',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                                        <Pin className="h-4 w-4" />
                                    </div>                                    <div className="text-2xl font-bold text-primary">
                                        <AnimatedCounter value={stats.pinned} duration={1.2} />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {lang(
                                            {
                                                'zh-CN': '置顶公告',
                                                'en-US': 'Pinned',
                                                'ja-JP': 'ピン留め',
                                                'ko-KR': '고정된',
                                                'fr-FR': 'Épinglées',
                                                'es-ES': 'Fijados',
                                                'de-DE': 'Angeheftet',
                                                'pt-BR': 'Fixados',
                                                'ru-RU': 'Закреплённые',
                                                'zh-TW': '置頂公告',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                                <div className="text-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                                        <Info className="h-4 w-4" />
                                    </div>                                    <div className="text-2xl font-bold text-primary">
                                        <AnimatedCounter value={stats.active} duration={1.4} />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {lang(
                                            {
                                                'zh-CN': '生效中',
                                                'en-US': 'Active',
                                                'ja-JP': '有効',
                                                'ko-KR': '활성',
                                                'fr-FR': 'Actives',
                                                'es-ES': 'Activos',
                                                'de-DE': 'Aktiv',
                                                'pt-BR': 'Ativos',
                                                'ru-RU': 'Активные',
                                                'zh-TW': '生效中',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                                <div className="text-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                                        <Calendar className="h-4 w-4" />
                                    </div>                                    <div className="text-2xl font-bold text-primary">
                                        <AnimatedCounter value={stats.expired} duration={1.6} />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {lang(
                                            {
                                                'zh-CN': '过时公告',
                                                'en-US': 'Expired',
                                                'ja-JP': '期限切れ',
                                                'ko-KR': '만료된',
                                                'fr-FR': 'Expirées',
                                                'es-ES': 'Expirados',
                                                'de-DE': 'Abgelaufen',
                                                'pt-BR': 'Expirados',
                                                'ru-RU': 'Устаревшие',
                                                'zh-TW': '過時公告',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                                <div className="text-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                                        <Hash className="h-4 w-4" />
                                    </div>                                    <div className="text-2xl font-bold text-primary">
                                        <AnimatedCounter value={stats.total} duration={1.8} />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {lang(
                                            {
                                                'zh-CN': '总数',
                                                'en-US': 'Total',
                                                'ja-JP': '合計',
                                                'ko-KR': '총계',
                                                'fr-FR': 'Total',
                                                'es-ES': 'Total',
                                                'de-DE': 'Gesamt',
                                                'pt-BR': 'Total',
                                                'ru-RU': 'Всего',
                                                'zh-TW': '總數',
                                            },
                                            locale,
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 目录 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Hash className="h-5 w-5" />
                                {lang(
                                    {
                                        'zh-CN': '公告目录',
                                        'en-US': 'Table of Contents',
                                        'ja-JP': 'お知らせ目次',
                                        'ko-KR': '공지사항 목차',
                                        'fr-FR': 'Table des matières',
                                        'es-ES': 'Tabla de contenidos',
                                        'de-DE': 'Inhaltsverzeichnis',
                                        'pt-BR': 'Índice',
                                        'ru-RU': 'Содержание',
                                        'zh-TW': '公告目錄',
                                    },
                                    locale,
                                )}
                            </CardTitle>
                        </CardHeader>                        <CardContent className="space-y-2">
                            {sortedAnnouncements.map((announcement, index) => {
                                const title = getAnnouncementTitle(announcement, locale);
                                
                                const handleScrollToAnnouncement = (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    const element = document.getElementById(`announcement-${announcement.id}`);
                                    if (element) {
                                        element.scrollIntoView({ 
                                            behavior: 'smooth', 
                                            block: 'start',
                                            inline: 'nearest' 
                                        });
                                    }
                                };

                                return (
                                    <motion.a
                                        key={announcement.id}
                                        href={`#announcement-${announcement.id}`}
                                        onClick={handleScrollToAnnouncement}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ 
                                            duration: 0.3,
                                            delay: index * 0.1 
                                        }}
                                        whileHover={{ 
                                            x: 4,
                                            transition: { duration: 0.2 }
                                        }}
                                        className="block text-sm hover:text-primary transition-all duration-200 p-2 rounded-md hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                {getAnnouncementIcon(announcement.type)}
                                            </motion.div>
                                            <span className="flex-1 truncate">
                                                {announcement.pinned && (
                                                    <motion.span
                                                        animate={{ 
                                                            rotate: [0, 10, -10, 0],
                                                            scale: [1, 1.1, 1] 
                                                        }}
                                                        transition={{ 
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            repeatDelay: 3
                                                        }}
                                                        className="inline-block mr-1"
                                                    >
                                                        <Pin className="h-3 w-3 text-blue-500" />
                                                    </motion.span>
                                                )}
                                                {title}
                                            </span>
                                            {announcement.expired && (
                                                <motion.span 
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="text-xs text-orange-500"
                                                >
                                                    {lang(
                                                        {
                                                            'zh-CN': '过期',
                                                            'en-US': 'Expired',
                                                            'ja-JP': '期限切れ',
                                                            'ko-KR': '만료',
                                                            'fr-FR': 'Expiré',
                                                            'es-ES': 'Expirado',
                                                            'de-DE': 'Abgelaufen',
                                                            'pt-BR': 'Expirado',
                                                            'ru-RU': 'Устарел',
                                                            'zh-TW': '過期',
                                                        },
                                                        locale,
                                                    )}
                                                </motion.span>                                            )}
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
