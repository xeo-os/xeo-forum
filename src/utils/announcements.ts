import announcements from '@/data/announcements.json';

export type AnnouncementType = 'important' | 'update' | 'info' | 'event' | 'maintenance';

export interface Announcement {
    id: number;
    priority: number;
    pinned: boolean;
    expired: boolean;
    type: AnnouncementType;
    publishedAt: string;
    title: Record<string, string>;
    content: Record<string, string>;
}

/**
 * 获取排序后的公告列表
 * 排序规则：置顶的在前，非过期的在前，然后按优先级排序，最后按发布时间排序
 */
export function getSortedAnnouncements(): Announcement[] {
    return (announcements as Announcement[])
        .sort((a, b) => {
            // 先按置顶排序
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            // 然后按过期状态排序（非过期的在前）
            if (!a.expired && b.expired) return -1;
            if (a.expired && !b.expired) return 1;
            
            // 然后按优先级排序
            if (a.priority !== b.priority) return b.priority - a.priority;
            
            // 最后按发布时间排序
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
}

/**
 * 根据语言获取公告的标题
 */
export function getAnnouncementTitle(announcement: Announcement, locale: string): string {
    return announcement.title[locale] || announcement.title['en-US'] || '';
}

/**
 * 根据语言获取公告的内容
 */
export function getAnnouncementContent(announcement: Announcement, locale: string): string {
    return announcement.content[locale] || announcement.content['en-US'] || '';
}

/**
 * 格式化公告内容（处理换行符）
 */
export function formatAnnouncementContent(content: string): string {
    return content.replace(/\\n/g, '\n');
}

/**
 * 格式化发布时间
 */
export function formatPublishDate(dateString: string, locale: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * 获取公告类型的图标名称
 */
export function getAnnouncementIconType(type: AnnouncementType): string {
    switch (type) {
        case 'important':
            return 'alert-circle';
        case 'update':
            return 'megaphone';
        case 'info':
            return 'info';
        case 'event':
            return 'calendar';
        case 'maintenance':
            return 'settings';
        default:
            return 'info';
    }
}

/**
 * 获取公告类型的颜色类名
 */
export function getAnnouncementTypeColor(type: AnnouncementType): string {
    switch (type) {
        case 'important':
            return 'red';
        case 'update':
            return 'blue';
        case 'info':
            return 'green';
        case 'event':
            return 'purple';
        case 'maintenance':
            return 'orange';
        default:
            return 'gray';
    }
}

/**
 * 获取公告统计信息
 */
export function getAnnouncementStats(): {
    pinned: number;
    active: number;
    expired: number;
    total: number;
} {
    const allAnnouncements = announcements as Announcement[];
    
    return {
        pinned: allAnnouncements.filter(a => a.pinned).length,
        active: allAnnouncements.filter(a => !a.expired).length,
        expired: allAnnouncements.filter(a => a.expired).length,
        total: allAnnouncements.length,
    };
}
