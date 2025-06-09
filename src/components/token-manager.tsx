'use client';

import { useEffect } from 'react';
import token from '@/utils/userToken';

export function TokenManager() {
  useEffect(() => {
    // 检查是否有 token
    const currentToken = token.get();
    if (currentToken) {
      // 启动自动刷新
      token.startRefresh();
    }

    // 清理函数：组件卸载时停止刷新
    return () => {
      token.stopRefresh();
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
