'use client';

import { Homepage } from '@/components/homepage';
import { authApi } from '@/lib/api';

export default function Page() {
  const handleLogin = async (email: string, password: string) => {
    await authApi.login(email, password);
    // 可选：获取当前用户，做前端入口显示控制
    try { await authApi.me(); } catch (_) {}
    window.location.href = '/personnel';
  };

  return <Homepage onLogin={handleLogin} />;
}