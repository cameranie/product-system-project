'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FieldDefDto = { key: string; label: string; classification: 'PUBLIC'|'SENSITIVE'|'CONFIDENTIAL'; selfEditable?: boolean };
type FieldSetDto = { name: string; description?: string; isSystem?: boolean };

export default function FieldAdminPage() {
  const [defs, setDefs] = useState<FieldDefDto[] | string[]>([]);
  const [sets, setSets] = useState<FieldSetDto[] | string[]>([]);
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
    } catch (e) {
      setErr(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  // 预设的“组”映射到字段key（与人员编辑页一致，可根据需要微调）
  const groupDefs: Array<{ name: string; keys: string[] }> = [
    {
      name: '基本信息',
      keys: ['name','department','contact_work_email','contact_phone','is_active']
    },
    {
      name: '工作信息',
      keys: [
        'employment_status','employee_type','sequence','reporting_manager','business_unit','business_unit_leader','position','tags',
        'company_join_date','intern_conversion_date','join_date','probation_months','regularization_date','first_work_date','seniority_base_date','seniority_years','tenure_years',
        'work_location','company_belong','onboarding_location'
      ]
    },
    {
      name: '个人信息',
      keys: [
        'english_name','gender','birth_date','age','height_cm','weight_kg','blood_type','medical_history',
        'nationality','ethnicity','political_status','native_place','household_type','household_province','household_city','household_register','id_card_address','current_address',
        'contact_wechat','contact_qq','contact_personal_email'
      ]
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">字段定义管理（分组）</h2>

        {/* 分组管理（组视角） */}
        <div className="space-y-6">
          {groupDefs.map(group => (
            <div key={group.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{group.name}</h3>
                <div className="text-xs text-muted-foreground">共 {group.keys.length} 项</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.keys.map(k => {
                  const def = (defs as FieldDefDto[]).find(d => (d as FieldDefDto).key === k) as FieldDefDto | undefined;
                  const label = def?.label || k;
                  const classification = def?.classification || 'PUBLIC';
                  const selfEditable = !!def?.selfEditable;
                  return (
                    <div key={k} className="p-3 rounded border space-y-2">
                      <div className="text-sm font-medium">{label} <span className="text-muted-foreground">({k})</span></div>
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div className="text-xs text-muted-foreground">分级</div>
                        <Select value={classification} onValueChange={async (v)=>{ await adminApi.upsertFieldDefinition({ key: k, label, classification: v, selfEditable }); await load(); }}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PUBLIC">公开</SelectItem>
                            <SelectItem value="SENSITIVE">敏感</SelectItem>
                            <SelectItem value="CONFIDENTIAL">保密</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground">自助可改</div>
                        <Select value={selfEditable ? 'true':'false'} onValueChange={async (v)=>{ await adminApi.upsertFieldDefinition({ key: k, label, classification, selfEditable: v==='true' }); await load(); }}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">否</SelectItem>
                            <SelectItem value="true">是</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 字段集（可选） */}
        <div className="space-y-4">
          <h3 className="font-medium">字段集（可选）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded border space-y-2">
              <div className="text-sm">新建/更新字段集</div>
              <Input placeholder="name" value={setForm.name} onChange={e=>setSetForm({...setForm, name:e.target.value})} />
              <Input placeholder="isSystem (true/false)" value={String(setForm.isSystem)} onChange={e=>setSetForm({...setForm, isSystem: e.target.value === 'true'})} />
              <Textarea placeholder="description" value={setForm.description} onChange={e=>setSetForm({...setForm, description:e.target.value})} />
              <Button onClick={async()=>{await adminApi.upsertFieldSet(setForm); await load();}}>保存字段集</Button>
            </div>
            <div className="p-3 rounded border space-y-2">
              <div className="text-sm">将字段关联到字段集</div>
              <Input placeholder="setName" value={assignForm.setName} onChange={e=>setAssignForm({...assignForm, setName:e.target.value})} />
              <Input placeholder="keys（逗号分隔）" value={assignForm.keys} onChange={e=>setAssignForm({...assignForm, keys:e.target.value})} />
              <Button onClick={async()=>{await adminApi.assignFieldsToSet(assignForm.setName, assignForm.keys.split(',').map(s=>s.trim()).filter(Boolean)); await load();}}>关联</Button>
            </div>
          </div>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          {loading && <div className="text-sm text-muted-foreground">加载中...</div>}
        </div>
      </div>
    </AppLayout>
  );
}


