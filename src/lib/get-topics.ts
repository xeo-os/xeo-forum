import prisma from '@/app/api/_utils/prisma';
import { unstable_cache } from 'next/cache';
import lang from '@/lib/lang';

interface TopicData {
    name: string;
    emoji: string;
    index: number;
    nameZHCN: string | null;
    nameENUS: string | null;
    nameZHTW: string | null;
    nameESES: string | null;
    nameFRFR: string | null;
    nameRURU: string | null;
    nameJAJP: string | null;
    nameDEDE: string | null;
    namePTBR: string | null;
    nameKOKR: string | null;
    classificationName: string;
}

interface ClassificationData {
    name: string;
    emoji: string;
    index: number;
    nameZHCN: string | null;
    nameENUS: string | null;
    nameZHTW: string | null;
    nameESES: string | null;
    nameFRFR: string | null;
    nameRURU: string | null;
    nameJAJP: string | null;
    nameDEDE: string | null;
    namePTBR: string | null;
    nameKOKR: string | null;
    topics: TopicData[];
}

async function fetchTopicsFromDatabase(): Promise<ClassificationData[]> {
    const classifications = await prisma.classification.findMany({
        include: {
            topics: {
                orderBy: {
                    index: 'asc',
                },
            },
        },
        orderBy: {
            index: 'asc',
        },
    });

    return classifications;
}

// 使用 Next.js 的 unstable_cache 来缓存数据，直到下次部署
export const getCachedTopics = unstable_cache(fetchTopicsFromDatabase, ['topics-data'], {
    tags: ['topics'],
    // 在开发环境下不缓存，生产环境缓存一年
    revalidate: process.env.NODE_ENV === 'development' ? false : 365 * 24 * 60 * 60,
});

export function transformTopicsData(
    classifications: ClassificationData[],
    locale: string,
): Array<{
    title: string;
    name: string;
    url: string;
    icon: string;
    isActive: boolean;
    items: Array<{
        title: string;
        name: string;
        url: string;
        icon: string;
    }>;
}> {
    return classifications.map((classification) => ({
        title:
            lang(
                {
                    'zh-CN': classification.nameZHCN || classification.name,
                    'zh-TW': classification.nameZHTW || classification.name,
                    'en-US': classification.nameENUS || classification.name,
                    'es-ES': classification.nameESES || classification.name,
                    'fr-FR': classification.nameFRFR || classification.name,
                    'ru-RU': classification.nameRURU || classification.name,
                    'ja-JP': classification.nameJAJP || classification.name,
                    'de-DE': classification.nameDEDE || classification.name,
                    'pt-BR': classification.namePTBR || classification.name,
                    'ko-KR': classification.nameKOKR || classification.name,
                },
                locale,
            ) || classification.name,
        url: '#',
        name: classification.name,
        icon: classification.emoji,
        isActive: true,
        items: classification.topics.map((topic) => ({
            title:
                lang(
                    {
                        'zh-CN': topic.nameZHCN || topic.name,
                        'zh-TW': topic.nameZHTW || topic.name,
                        'en-US': topic.nameENUS || topic.name,
                        'es-ES': topic.nameESES || topic.name,
                        'fr-FR': topic.nameFRFR || topic.name,
                        'ru-RU': topic.nameRURU || topic.name,
                        'ja-JP': topic.nameJAJP || topic.name,
                        'de-DE': topic.nameDEDE || topic.name,
                        'pt-BR': topic.namePTBR || topic.name,
                        'ko-KR': topic.nameKOKR || topic.name,
                    },
                    locale,
                ) || topic.name,
            url: '#',
            name: topic.name,
            icon: topic.emoji,
        })),
    }));
}
