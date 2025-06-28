import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/signup', '/signin', '/reset-password', '/verify'],
        },
        sitemap: 'https://xeoos.net/sitemap.xml',
    };
}
