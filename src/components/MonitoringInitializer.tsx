/**
 * 监控初始化组件
 * 
 * 客户端组件，用于在浏览器环境初始化监控系统
 */

'use client';

import { useEffect } from 'react';
import { initMonitoring } from '@/lib/monitoring';

export function MonitoringInitializer() {
  useEffect(() => {
    // 仅在浏览器环境初始化一次
    initMonitoring();
  }, []);

  // 不渲染任何内容
  return null;
}

