"use client"

import { useEffect } from "react";

export function ThemeScript() {
  useEffect(() => {
    // 检查是否已有主题设置
    const existingTheme = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('theme='))
      ?.split('=')[1];

    // 如果没有主题设置，根据系统偏好自动设置
    if (!existingTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const autoTheme = systemPrefersDark ? 'dark' : 'light';
      
      // 设置 Cookie
      document.cookie = `theme=${autoTheme}; path=/; max-age=${60 * 60 * 24 * 365}`;
      
      // 应用到 DOM
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      if (autoTheme === 'dark') {
        root.classList.add('dark');
      }
      
      // 刷新页面以同步服务端渲染
      window.location.reload();
    }
  }, []);

  return null;
}
