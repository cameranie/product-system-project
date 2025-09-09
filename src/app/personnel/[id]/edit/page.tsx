'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userApi } from '@/lib/api';

export default function EditUserPage() {
  const { id } = useParams();
  const userId = id as string;
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', departmentId: '', isActive: 'true' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await userApi.getUser(userId);
        const u = res.user;
        setForm({ name: u.name ?? '', phone: u.phone ?? '', departmentId: u.department?.id ?? '', isActive: u.isActive ? 'true' : 'false' });
      } catch (e: any) {
        setErr(e?.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    if (userId) run();
  }, [userId]);

  const save = async () => {
    try {
      setSaving(true); setErr(null);
      await userApi.updateUser(userId, {
        name: form.name || undefined,
        phone: form.phone || undefined,
        departmentId: form.departmentId || undefined,
        isActive: form.isActive === 'true',
      });
      router.push(`/personnel/${userId}`);
    } catch (e: any) {
      setErr(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-semibold">编辑人员</h2>
        {loading ? (
          <div>加载中…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="姓名" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
              <Input placeholder="手机号" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
              <Select value={form.departmentId} onValueChange={(v)=>setForm({...form, departmentId:v})}>
                <SelectTrigger>
                  <SelectValue placeholder="部门（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不选择</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.isActive} onValueChange={(v)=>setForm({...form, isActive:v})}>
                <SelectTrigger>
                  <SelectValue placeholder="账号状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">激活</SelectItem>
                  <SelectItem value="false">未激活</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
              {err && <div className="text-red-600 text-sm">{err}</div>}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}


