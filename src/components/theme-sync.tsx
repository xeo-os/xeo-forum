'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ThemeSyncProps {
  serverTheme: string;
}

export function ThemeSync({ serverTheme }: ThemeSyncProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 获取当前 cookie 中的主题
    const getCookieTheme = () => {
      const themeCookie = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('theme='));
      
      if (!themeCookie) return 'dark';
      
      const themeValue = themeCookie
        .split('=')[1]
        .trim()
        .replace(/['"]/g, '');
      
      return themeValue === 'light' ? 'light' : 'dark';
    };

    // 应用主题到 html 元素
    const applyTheme = (theme: string) => {
      const html = document.documentElement;
      if (theme === 'light') {
        html.classList.remove('dark');
      } else {
        html.classList.add('dark');
      }
    };

    // 路径变化时同步主题
    const currentTheme = getCookieTheme();
    applyTheme(currentTheme);

    // 监听主题变化事件
    const handleThemeChange = () => {
      const newTheme = getCookieTheme();
      applyTheme(newTheme);
    };

    // 监听存储变化（其他标签页的主题更改）
    window.addEventListener('storage', handleThemeChange);
    
    // 监听自定义主题变化事件
    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, [pathname, serverTheme]);

  return null;
}
