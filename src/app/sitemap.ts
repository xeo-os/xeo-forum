import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // 返回：类别 标签 热门文章 最新文章
    {
      url: 'https://xeoos.net',
      lastModified: new Date(),
      alternates: {
        languages: {
          es: 'https://acme.com/en-US',
          de: 'https://acme.com/zh-CN',
        },
      },
    },
   
  ]
}