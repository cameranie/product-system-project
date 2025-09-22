'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userApi, adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', username: '', name: '', password: '', businessUnitId: 'none', departmentId: 'none', phone: '',
  });
  const [supervisor, setSupervisor] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Array<{id:string; name:string; parentId?:string|null; leaderUserIds?:string[]}>>([]);
  const [deptLeader, setDeptLeader] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.departments();
        setDepartments((res.departments || []) as { id: string; name: string; parentId?: string | null; leaderUserIds?: string[]; }[]);
      } catch {}
    })();
  }, []);

  // 当部门变化时，尝试预填“部门负责人”为直属上级（必须已选择部门）
  useEffect(() => {
    (async () => {
      try {
        if (!form.departmentId || form.departmentId === 'none') { setDeptLeader(null); setSupervisor(''); return; }
        const dep = (departments || []).find(x => x.id === form.departmentId);
        const bu  = (departments || []).find(x => x.id === form.businessUnitId);
        let leaderIds: string[] | undefined = dep?.leaderUserIds;
        if (!leaderIds || leaderIds.length === 0) leaderIds = bu?.leaderUserIds;
        if (leaderIds && leaderIds.length > 0) {
          const u = await userApi.getUser(leaderIds[0]);
          const name = u.user?.name || null;
          setDeptLeader(name);
          setSupervisor(name || '');
        } else { setDeptLeader(null); setSupervisor(''); }
      } catch { setDeptLeader(null); setSupervisor(''); }
    })();
  }, [form.departmentId, form.businessUnitId, departments]);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true); setErr(null);
    try {
      await userApi.createUser({
        email: form.email,
        name: form.name,
        password: form.password || '12345678',
        departmentId: (form.departmentId !== 'none' ? form.departmentId : (form.businessUnitId !== 'none' ? form.businessUnitId : undefined)),
        phone: form.phone || undefined,
      });
      // 补充直属上级（EAV：direct_supervisor）
      try {
        // 重新获取刚创建的用户ID：用邮箱查询列表（服务端支持模糊搜索）。
        const list = await userApi.getUsers({ filters: { search: form.email }, take: 1 });
        const newUser = list.users?.users?.[0];
        if (newUser && supervisor.trim()) {
          await userApi.updateUserFieldValues(newUser.id, [{ fieldKey: 'reporting_manager', valueString: supervisor.trim() }]);
        } else if (newUser && !supervisor.trim() && deptLeader) {
          await userApi.updateUserFieldValues(newUser.id, [{ fieldKey: 'reporting_manager', valueString: deptLeader }]);
        }
      } catch {}
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
          
          {/* 用户名字段不再必填；默认使用邮箱前缀作为用户名，可在编辑页再改 */}
          
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
            <Label htmlFor="bu">所属事业部</Label>
            <Select value={form.businessUnitId} onValueChange={(v)=>setForm({...form, businessUnitId:v, departmentId:'none'})}>
              <SelectTrigger id="bu">
                <SelectValue placeholder="请选择事业部" />
              </SelectTrigger>
              <SelectContent>
                {departments.filter(d=>!d.parentId).map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">所属部门</Label>
            <Select value={form.departmentId} onValueChange={(v)=>setForm({...form, departmentId:v})} disabled={form.businessUnitId === 'none'}>
              <SelectTrigger id="department">
                <SelectValue placeholder="请选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不选择部门</SelectItem>
                {departments.filter(d=> d.parentId === (form.businessUnitId !== 'none' ? form.businessUnitId : null)).map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="supervisor">直属上级（主管）</Label>
              {deptLeader && (
                <Button variant="outline" size="sm" onClick={()=>setSupervisor(deptLeader || '')}>
                  使用部门负责人：{deptLeader}
                </Button>
              )}
            </div>
            <Input 
              id="supervisor"
              placeholder="请选择部门后自动带出负责人" 
              value={supervisor} 
              onChange={()=>{}} 
              disabled={form.departmentId === 'none'}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 pt-4">
          <Button 
            onClick={submit} 
            disabled={loading || !form.name || !form.email || form.businessUnitId === 'none'}
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


