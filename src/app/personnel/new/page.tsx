'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', username: '', name: '', password: '', departmentId: 'none', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true); setErr(null);
    try {
      await userApi.createUser({
        email: form.email,
        username: form.username,
        name: form.name,
        password: form.password || '12345678',
        departmentId: form.departmentId === 'none' ? undefined : form.departmentId,
        phone: form.phone || undefined,
      });
      router.push('/personnel');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-semibold">新建人员</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
            <Input 
              id="name"
              placeholder="请输入姓名" 
              value={form.name} 
              onChange={e=>setForm({...form, name:e.target.value})} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址 <span className="text-red-500">*</span></Label>
            <Input 
              id="email"
              type="email"
              placeholder="请输入邮箱地址" 
              value={form.email} 
              onChange={e=>setForm({...form, email:e.target.value})} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">用户名 <span className="text-red-500">*</span></Label>
            <Input 
              id="username"
              placeholder="请输入用户名" 
              value={form.username} 
              onChange={e=>setForm({...form, username:e.target.value})} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">登录密码</Label>
            <Input 
              id="password"
              type="password"
              placeholder="请输入密码（留空则为 12345678）" 
              value={form.password} 
              onChange={e=>setForm({...form, password:e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">手机号码</Label>
            <Input 
              id="phone"
              placeholder="请输入手机号码" 
              value={form.phone} 
              onChange={e=>setForm({...form, phone:e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">所属部门</Label>
            <Select value={form.departmentId} onValueChange={(v)=>setForm({...form, departmentId:v})}>
              <SelectTrigger id="department">
                <SelectValue placeholder="请选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不选择部门</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-3 pt-4">
          <Button 
            onClick={submit} 
            disabled={loading || !form.name || !form.email || !form.username}
            className="min-w-[80px]"
          >
            {loading ? '创建中…' : '创建'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/personnel')}
            disabled={loading}
          >
            取消
          </Button>
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>
      </div>
    </AppLayout>
  );
}


