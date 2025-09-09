'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api';

export default function FieldAdminPage() {
  const [defs, setDefs] = useState<string[]>([]);
  const [sets, setSets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // forms
  const [defForm, setDefForm] = useState({ key: '', label: '', classification: 'PUBLIC', selfEditable: false });
  const [setForm, setSetForm] = useState({ name: '', description: '', isSystem: false });
  const [assignForm, setAssignForm] = useState({ setName: '', keys: '' });

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const [d, s] = await Promise.all([adminApi.fieldDefinitions(), adminApi.fieldSets()]);
      setDefs(d.fieldDefinitions ?? []);
      setSets(s.fieldSets ?? []);
    } catch (e: any) {
      setErr(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">字段定义 / 字段集（管理员）</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium">字段定义</h3>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto h-48">{JSON.stringify(defs, null, 2)}</pre>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="key" value={defForm.key} onChange={e=>setDefForm({...defForm, key:e.target.value})} />
              <Input placeholder="label" value={defForm.label} onChange={e=>setDefForm({...defForm, label:e.target.value})} />
              <Input placeholder="classification (PUBLIC/INTERNAL/SENSITIVE/HIGHLY_SENSITIVE)" className="col-span-2" value={defForm.classification} onChange={e=>setDefForm({...defForm, classification:e.target.value})} />
              <Button onClick={async()=>{await adminApi.upsertFieldDefinition(defForm as any); await load();}}>保存字段定义</Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">字段集</h3>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto h-48">{JSON.stringify(sets, null, 2)}</pre>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="name" value={setForm.name} onChange={e=>setSetForm({...setForm, name:e.target.value})} />
              <Input placeholder="isSystem (true/false)" value={String(setForm.isSystem)} onChange={e=>setSetForm({...setForm, isSystem: e.target.value === 'true'})} />
              <Textarea placeholder="description" className="col-span-2" value={setForm.description} onChange={e=>setSetForm({...setForm, description:e.target.value})} />
              <Button onClick={async()=>{await adminApi.upsertFieldSet(setForm as any); await load();}}>保存字段集</Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">关联字段到字段集</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Input placeholder="setName" value={assignForm.setName} onChange={e=>setAssignForm({...assignForm, setName:e.target.value})} />
            <Input placeholder="keys（逗号分隔）" value={assignForm.keys} onChange={e=>setAssignForm({...assignForm, keys:e.target.value})} />
            <Button onClick={async()=>{await adminApi.assignFieldsToSet(assignForm.setName, assignForm.keys.split(',').map(s=>s.trim()).filter(Boolean)); await load();}}>关联</Button>
          </div>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          {loading && <div className="text-sm text-muted-foreground">加载中...</div>}
        </div>
      </div>
    </AppLayout>
  );
}


