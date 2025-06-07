import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XEO OS',
    short_name: 'XEO',
    description: 'Xchange Everyone\'s Opinions',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  }
}