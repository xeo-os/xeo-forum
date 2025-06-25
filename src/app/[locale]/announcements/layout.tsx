import { Metadata } from 'next';
import lang from '@/lib/lang';

type Props = {
    params: Promise<{ locale: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    const title = lang(
        {
            'zh-CN': '公告 | XEO OS - 交流每个人的观点',
            'en-US': 'Announcements | XEO OS - Exchange Everyone\'s Views',
            'ja-JP': 'お知らせ | XEO OS - みんなの意見を交換する',
            'ko-KR': '공지사항 | XEO OS - 모두의 의견을 교환하다',
            'fr-FR': 'Annonces | XEO OS - Échanger les opinions de chacun',
            'es-ES': 'Anuncios | XEO OS - Intercambiar las opiniones de todos',
            'de-DE': 'Ankündigungen | XEO OS - Meinungen austauschen',
            'pt-BR': 'Anúncios | XEO OS - Trocar as Opiniões de Todos',
            'ru-RU': 'Объявления | XEO OS - Обмен мнениями',
            'zh-TW': '公告 | XEO OS - 交流每個人的觀點',
        },
        locale,
    );

    const description = lang(
        {
            'zh-CN': '查看 XEO OS 平台的最新公告、更新和重要通知。了解平台的新功能、活动信息和维护计划。',
            'en-US': 'View the latest announcements, updates, and important notices from XEO OS platform. Learn about new features, event information, and maintenance schedules.',
            'ja-JP': 'XEO OS プラットフォームの最新のお知らせ、アップデート、重要な通知をご覧ください。新機能、イベント情報、メンテナンススケジュールについて学びましょう。',
            'ko-KR': 'XEO OS 플랫폼의 최신 공지사항, 업데이트 및 중요한 알림을 확인하세요. 새로운 기능, 이벤트 정보 및 유지 관리 일정에 대해 알아보세요.',
            'fr-FR': 'Consultez les dernières annonces, mises à jour et notifications importantes de la plateforme XEO OS. Découvrez les nouvelles fonctionnalités, les informations sur les événements et les plannings de maintenance.',
            'es-ES': 'Vea los últimos anuncios, actualizaciones y avisos importantes de la plataforma XEO OS. Conozca las nuevas características, información de eventos y horarios de mantenimiento.',
            'de-DE': 'Sehen Sie sich die neuesten Ankündigungen, Updates und wichtigen Benachrichtigungen der XEO OS-Plattform an. Erfahren Sie mehr über neue Funktionen, Veranstaltungsinformationen und Wartungspläne.',
            'pt-BR': 'Veja os últimos anúncios, atualizações e avisos importantes da plataforma XEO OS. Saiba sobre novos recursos, informações de eventos e cronogramas de manutenção.',
            'ru-RU': 'Просматривайте последние объявления, обновления и важные уведомления платформы XEO OS. Узнайте о новых функциях, информации о событиях и графиках обслуживания.',
            'zh-TW': '查看 XEO OS 平台的最新公告、更新和重要通知。了解平台的新功能、活動資訊和維護計劃。',
        },
        locale,
    );

    return {
        title,
        description,
    };
}

export default async function AnnouncementsLayout({ children }: Props) {
    return <>{children}</>;
}
