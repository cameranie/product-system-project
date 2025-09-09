'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';

export default function TemporaryGrantsPage() {
  const [form, setForm] = useState({
    granteeId: '',
    fieldKey: 'contact_phone',
    resource: 'user',
    action: 'read',
    startAt: '',
    endAt: '',
    allowCrossBoundary: false,
    scopeDepartmentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true); setMsg(null); setErr(null);
    try {
      await adminApi.createTemporaryAccessGrant({
        granteeId: form.granteeId,
        resource: form.resource,
        fieldKey: form.fieldKey,
        action: form.action,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        allowCrossBoundary: form.allowCrossBoundary || undefined,
        scopeDepartmentId: form.scopeDepartmentId || undefined,
      });
      setMsg(`临时授权已生效至 ${form.endAt}`);
    } catch (e: any) {
      setErr(e?.message || '提交失败（可能无权限）');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">临时授权</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
          <Input placeholder="被授权用户ID" value={form.granteeId}
            onChange={(e) => setForm({ ...form, granteeId: e.target.value })} />
          <Input placeholder="字段Key（如 contact_phone）" value={form.fieldKey}
            onChange={(e) => setForm({ ...form, fieldKey: e.target.value })} />
          <Input placeholder="资源（固定 user）" value={form.resource}
            onChange={(e) => setForm({ ...form, resource: e.target.value })} />
          <Input placeholder="动作（固定 read）" value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })} />
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm text-muted-foreground">开始时间</label>
            <Input type="datetime-local" value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm text-muted-foreground">结束时间</label>
            <Input type="datetime-local" value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="acb"
              type="checkbox"
              checked={form.allowCrossBoundary}
              onChange={(e) => setForm({ ...form, allowCrossBoundary: e.target.checked })}
            />
            <label htmlFor="acb" className="text-sm">允许跨边界</label>
          </div>
          <Input placeholder="限定部门ID（可选）" value={form.scopeDepartmentId}
            onChange={(e) => setForm({ ...form, scopeDepartmentId: e.target.value })} />
        </div>

        <Button onClick={submit} disabled={loading || !form.granteeId || !form.startAt || !form.endAt}>
          {loading ? '提交中...' : '创建授权'}
        </Button>

        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </div>
    </AppLayout>
  );
}


