'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FieldDef = { key: string; label: string; classification: 'PUBLIC' | 'CONFIDENTIAL'; selfEditable?: boolean };

export default function FieldVisibilityPage() {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await adminApi.fieldDefinitions();
      const list: FieldDef[] = res.fieldDefinitions || [];
      setFields(list);
    })();
  }, []);

  const setField = (idx: number, patch: Partial<FieldDef>) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  };

  const saveOne = async (f: FieldDef) => {
    try {
      setSaving(true);
      await adminApi.upsertFieldDefinition({
        key: f.key,
        label: f.label,
        classification: f.classification,
        selfEditable: f.selfEditable,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">字段配置</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f, idx) => (
            <div key={f.key} className="rounded-md border p-4 space-y-3">
              <div className="text-sm text-muted-foreground">Key: {f.key}</div>
              <input
                className="w-full h-9 px-2 rounded-md border bg-background"
                value={f.label}
                onChange={e => setField(idx, { label: e.target.value })}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm">可见性</span>
                <Select value={f.classification} onValueChange={(v: 'PUBLIC' | 'CONFIDENTIAL') => setField(idx, { classification: v })}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">公开</SelectItem>
                    <SelectItem value="CONFIDENTIAL">保密</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" disabled={saving} onClick={()=>saveOne(f)}>{saving ? '保存中…' : '保存'}</Button>
                <Button variant="destructive" size="sm" onClick={async ()=>{
                  if (!confirm(`确定删除字段 ${f.label}?`)) return;
                  await adminApi.deleteFieldDefinition(f.key).catch(()=>null);
                  setFields(prev => prev.filter((_,i)=>i!==idx));
                }}>删除</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}


