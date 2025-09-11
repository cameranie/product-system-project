'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';

export default function VisibilityAdminPage() {
  const [uForm, setUForm] = useState({ userId: '', hidden: '', viewScope: '' });
  const [dForm, setDForm] = useState({ departmentId: '', leaderUserIds: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitUserVisibility = async () => {
    setLoading(true); setMsg(null); setErr(null);
    try {
      await adminApi.setUserVisibility({
        userId: uForm.userId,
        hidden: uForm.hidden === '' ? undefined : uForm.hidden === 'true',
        viewScope: uForm.viewScope || undefined,
      });
      setMsg('用户可见性已更新');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const submitDeptLeaders = async () => {
    setLoading(true); setMsg(null); setErr(null);
    try {
      const ids = dForm.leaderUserIds.split(',').map(s=>s.trim()).filter(Boolean);
      await adminApi.updateDepartmentLeaders({ departmentId: dForm.departmentId, leaderUserIds: ids });
      setMsg('部门负责人已更新');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">可见性管理（管理员）</h2>

        <div className="space-y-3">
          <h3 className="font-medium">用户可见性</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-3xl">
            <Input placeholder="userId" value={uForm.userId} onChange={e=>setUForm({...uForm, userId: e.target.value})} />
            <Input placeholder="hidden（留空/true/false）" value={uForm.hidden} onChange={e=>setUForm({...uForm, hidden: e.target.value})} />
            <Input placeholder="viewScope（可选）" value={uForm.viewScope} onChange={e=>setUForm({...uForm, viewScope: e.target.value})} />
          </div>
          <Button onClick={submitUserVisibility} disabled={loading || !uForm.userId}>保存</Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">部门负责人</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-3xl">
            <Input placeholder="departmentId" value={dForm.departmentId} onChange={e=>setDForm({...dForm, departmentId: e.target.value})} />
            <Input placeholder="leaderUserIds（逗号分隔）" value={dForm.leaderUserIds} onChange={e=>setDForm({...dForm, leaderUserIds: e.target.value})} />
          </div>
          <Button onClick={submitDeptLeaders} disabled={loading || !dForm.departmentId}>保存</Button>
        </div>

        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </div>
    </AppLayout>
  );
}


