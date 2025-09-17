'use client';

import { Homepage } from '@/components/homepage';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Page() {
  const handleLogin = async (email: string, password: string) => {
    try {
      await authApi.login(email, password);
      // 可选：获取当前用户，做前端入口显示控制
      try { await authApi.me(); } catch (_) {}
      toast.success('登录成功！');
      window.location.href = '/personnel';
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      toast.error(errorMessage);
    }
  };

  return <Homepage onLogin={handleLogin} />;
}