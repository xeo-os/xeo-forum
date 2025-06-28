import prisma from '@/app/api/_utils/prisma';

const locales = [
    'en-US',
    'zh-CN',
    'zh-TW',
    'es-ES',
    'fr-FR',
    'ru-RU',
    'ja-JP',
    'de-DE',
    'pt-BR',
    'ko-KR',
];

const BASE_URL = 'https://xeoos.net';

function getAlternateLinks(path: string) {
    return locales.map((locale) => ({
        hreflang: locale,
        href: `${BASE_URL}/${locale}${path}`,
    }));
}

function toSitemapEntry({
    url,
    lastModified,
    alternates,
}: {
    url: string;
    lastModified: Date;
    alternates: { hreflang: string; href: string }[];
}) {
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastModified.toISOString()}</lastmod>\n${alternates.map((a) => `    <xhtml:link rel=\"alternate\" hreflang=\"${a.hreflang}\" href=\"${a.href}\" />`).join('\n')}\n  </url>`;
}

export async function GET() {
    // 查询热门帖子（按点赞数排序，取前20条）
    const hotPosts = await prisma.post.findMany({
        where: { published: true },
        orderBy: [{ likes: { _count: 'desc' } }, { updatedAt: 'desc' }],
        take: 20,
        select: {
            id: true,
            updatedAt: true,
            titleENUS: true,
            title: true,
        },
    });
    await prisma.$disconnect();

    // 静态页面
    const staticPaths = ['', '/leaderboard', '/announcements', '/contact', '/policies/terms-of-service', '/about', '/policies/privacy-policy'];

    // 热门帖子详情页
    const postPaths = hotPosts.map((post) => {
        const rawTitle = post.titleENUS || post.title || '';
        const slug = rawTitle
            .toLowerCase()
            .replaceAll(' ', '-')
            .replace(/[^a-z-]/g, '');
        return {
            path: `/post/${post.id}/${slug}`,
            lastModified: post.updatedAt,
        };
    });

    const entries: string[] = [];
    // 静态页面
    for (const path of staticPaths) {
        for (const locale of locales) {
            const url = `${BASE_URL}/${locale}${path}`;
            const alternates = getAlternateLinks(path);
            entries.push(toSitemapEntry({ url, lastModified: new Date(), alternates }));
        }
    }
    // 热门帖子详情页
    for (const { path, lastModified } of postPaths) {
        for (const locale of locales) {
            const url = `${BASE_URL}/${locale}${path}`;
            const alternates = getAlternateLinks(path);
            entries.push(toSitemapEntry({ url, lastModified, alternates }));
        }
    }

    const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n${entries.join('\n')}\n</urlset>`;
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
