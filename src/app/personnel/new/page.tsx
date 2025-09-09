'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', username: '', name: '', password: '', departmentId: '', phone: '',
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
        departmentId: form.departmentId || undefined,
        phone: form.phone || undefined,
      });
      router.push('/personnel');
    } catch (e: any) {
      setErr(e?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-semibold">新建人员</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="姓名" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <Input placeholder="邮箱" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          <Input placeholder="用户名" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
          <Input placeholder="初始密码（默认 12345678）" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          <Input placeholder="手机号（可选）" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          <Select value={form.departmentId} onValueChange={(v)=>setForm({...form, departmentId:v})}>
            <SelectTrigger>
              <SelectValue placeholder="部门（可选）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">不选择</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={loading || !form.name || !form.email || !form.username}>{loading ? '创建中…' : '创建'}</Button>
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>
      </div>
    </AppLayout>
  );
}


