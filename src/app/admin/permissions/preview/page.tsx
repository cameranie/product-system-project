'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { visibilityApi, adminApi } from '@/lib/api';
import { Shield, User, Eye, Save, RefreshCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
}

interface PermissionItem { resource: string; action: string }

interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  permissions?: PermissionItem[];
}

function PermissionsPreviewContent() {
  const searchParams = useSearchParams();
  const [targetUserId, setTargetUserId] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});
  const [isDeptLeader, setIsDeptLeader] = useState(false);
  
  // 权限编辑相关状态
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const run = async (userId?: string) => {
    setLoading(true); setErr(null);
    try {
      const targetId = userId || targetUserId;
      // 并行刷新：预览数据 + 目标用户权限
      const [preview] = await Promise.all([
        visibilityApi.accessPreview({ resource: 'user', targetUserId: targetId || undefined }),
      ]);
      const data = preview;
      if (typeof data.accessPreview === 'string') {
        const parsed = JSON.parse(data.accessPreview);
        setResult(parsed);
      } else {
        setResult(data.accessPreview);
      }
      if (targetId) {
        const res = await adminApi.getUserPermissions(targetId);
        setSelectedUser(res.user);
        setSelectedRoles(res.user.roles.map((r: Role) => r.name));
      }
    } catch (e: unknown) {
      console.error('权限预览错误:', e);
      let errorMessage = '加载失败';
      if (e instanceof Error && e.message) errorMessage = e.message;
      setErr(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 加载角色列表
  const loadRoles = async () => {
    try {
      const response = await adminApi.getRoles();
      setRoles(response.roles || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      toast.error('加载角色列表失败');
    }
  };

  // 加载用户权限信息
  const loadUserPermissions = async (userId: string) => {
    try {
      setLoading(true);
      const response = await adminApi.getUserPermissions(userId);
      const user = response.user;
      setSelectedUser(user);
      setSelectedRoles(user.roles.map((role: Role) => role.name));
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      toast.error('加载用户权限失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存用户角色
  const saveUserRoles = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await adminApi.setUserRoles(selectedUser.id, selectedRoles);
      await loadUserPermissions(selectedUser.id);
      toast.success('用户权限更新成功');
    } catch (error) {
      console.error('Failed to save user roles:', error);
      toast.error('保存用户权限失败');
    } finally {
      setSaving(false);
    }
  };

  // 处理角色切换
  const handleRoleToggle = (roleName: string, checked: boolean) => {
    setSelectedRoles(prev => (checked ? [...prev, roleName] : prev.filter(r => r !== roleName)));
  };

  // 是否有未保存的更改
  const hasChanges =
    selectedUser &&
    JSON.stringify([...selectedRoles].sort()) !== JSON.stringify(selectedUser.roles.map(r => r.name).sort());

  useEffect(() => {
    const id = searchParams.get('targetUserId') || '';
    setTargetUserId(id);
    // 加载初始数据
    loadRoles();
    if (id) {
      loadUserPermissions(id);
    }
    // 自动触发查询（无论是否有用户ID）
    run(id);
    // 载入字段定义与部门负责人标记
    (async () => {
      try {
        const defs = await adminApi.fieldDefinitions().catch(() => null);
        const map: Record<string, string> = {};
        const arr = (defs as unknown as { fieldDefinitions?: Array<{ key: string; label: string }> })?.fieldDefinitions || [];
        arr.forEach(d => { map[d.key] = d.label; });
        setFieldLabels(map);
      } catch {}
      try {
        if (id) {
          const depts = await adminApi.departments().catch(() => null);
          const list = (depts as unknown as { departments?: Array<{ leaderUserIds?: string[] }> })?.departments || [];
          const leader = list.some(d => Array.isArray(d.leaderUserIds) && d.leaderUserIds!.includes(id));
          setIsDeptLeader(leader);
        } else {
          setIsDeptLeader(false);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* 错误提示 */}
        {err && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h4 className="font-medium text-red-800 mb-2">请求失败</h4>
            <p className="text-red-600 text-sm">{err}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-500">调试信息</summary>
              <p className="text-xs text-red-400 mt-1">
                请求参数: resource=user, targetUserId={targetUserId || '(空)'}
              </p>
            </details>
          </div>
        )}

        {/* 角色分配区域 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">角色分配</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>当前:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedUser?.roles?.length ? (
                    selectedUser.roles.map(role => {
                      const roleNameMap: Record<string, string> = {
                        'admin': '管理员',
                        'hr_manager': 'HR管理员', 
                        'member': '成员',
                        'project_manager': '主管',
                        'super_admin': '超级管理员'
                      };
                      return (
                        <Badge key={role.id} variant="outline" className="text-xs">
                          {roleNameMap[role.name] || role.name}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">未分配</span>
                  )}
                  {isDeptLeader && (
                    <Badge variant="default" className="text-xs">部门负责人</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveUserRoles} disabled={!hasChanges || saving} size="sm">
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> 保存权限
                  </>
                )}
              </Button>
              <Button onClick={() => run()} disabled={loading} variant="outline" size="sm">
                {loading ? '加载中...' : '刷新权限信息'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {(() => {
                // 按权限从大到小排序：super_admin > admin > hr_manager > project_manager > member
                const roleOrder = ['super_admin', 'admin', 'hr_manager', 'project_manager', 'member'];
                const sortedRoles = roles.sort((a, b) => {
                  const indexA = roleOrder.indexOf(a.name);
                  const indexB = roleOrder.indexOf(b.name);
                  return indexA - indexB;
                });

                const roleNameMap: Record<string, string> = {
                  'admin': '管理员',
                  'hr_manager': 'HR管理员', 
                  'member': '成员',
                  'project_manager': '主管',
                  'super_admin': '超级管理员'
                };

                return sortedRoles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={(checked) => handleRoleToggle(role.name, checked as boolean)}
                    />
                    <label htmlFor={role.id} className="text-sm font-medium cursor-pointer">
                      {roleNameMap[role.name] || role.name}
                    </label>
                  </div>
                ));
              })()}
            </div>
            
            {/* 权限描述 */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">超级管理员：</span>
                <span>拥有任何权限；唯一能授予/回收管理员权限的人</span>
              </div>
              <div>
                <span className="font-medium">管理员：</span>
                <span>默认无权；通过&quot;权限包&quot;获得具体功能权限与数据范围；不可自我提权</span>
              </div>
              <div>
                <span className="font-medium">HR管理员：</span>
                <span>专门用于HR敏感资料管理，具有敏感字段访问权限</span>
              </div>
              <div>
                <span className="font-medium">主管：</span>
                <span>负责项目和任务管理，具有部门级数据访问权限</span>
              </div>
              <div>
                <span className="font-medium">成员：</span>
                <span>基础的项目参与权限，只能查看公开信息和自己的信息</span>
              </div>
            </div>
          </div>

          {hasChanges && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">注意：当前有未保存的权限更改</div>
          )}
        </div>

        {/* 系统权限 - 横向表格 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">系统权限</h4>
          </div>
          {/* 使用目标用户的权限集合 */}
          {selectedUser && (
            (() => {
              // 定义权限结构，与文档中的矩阵保持一致
              const permissionStructure = [
                {
                  category: '用户管理',
                  permissions: [
                    { key: 'user:create', name: '创建用户' },
                    { key: 'user:read', name: '查看用户' },
                    { key: 'user:update', name: '更新用户' },
                    { key: 'user:delete', name: '删除用户' }
                  ]
                },
                {
                  category: '项目管理',
                  permissions: [
                    { key: 'project:create', name: '创建项目' },
                    { key: 'project:read', name: '查看项目' },
                    { key: 'project:update', name: '更新项目' },
                    { key: 'project:delete', name: '删除项目' }
                  ]
                },
                {
                  category: '任务管理',
                  permissions: [
                    { key: 'task:create', name: '创建任务' },
                    { key: 'task:read', name: '查看任务' },
                    { key: 'task:update', name: '更新任务' },
                    { key: 'task:delete', name: '删除任务' },
                    { key: 'task:assign', name: '分配任务' }
                  ]
                },
                {
                  category: '团队管理',
                  permissions: [
                    { key: 'team:create', name: '创建团队' },
                    { key: 'team:read', name: '查看团队' },
                    { key: 'team:update', name: '更新团队' },
                    { key: 'team:delete', name: '删除团队' }
                  ]
                },
                {
                  category: '工时记录',
                  permissions: [
                    { key: 'timelog:create', name: '记录工时' },
                    { key: 'timelog:read', name: '查看工时' },
                    { key: 'timelog:update', name: '更新工时' },
                    { key: 'timelog:delete', name: '删除工时' }
                  ]
                },
                {
                  category: '敏感数据访问',
                  permissions: [
                    { key: 'contact:read', name: '查看联系方式' },
                    { key: 'user_sensitive:read', name: '查看敏感字段' },
                    { key: 'user_highly_sensitive:read', name: '查看极敏感字段' },
                    { key: 'export:sensitive', name: '导出敏感字段' },
                    { key: 'export:highly_sensitive', name: '导出极敏感字段' }
                  ]
                },
                {
                  category: '系统配置',
                  permissions: [
                    { key: 'org_visibility:configure', name: '配置组织可见性' }
                  ]
                }
              ];

              const userPermissions = new Set(
                (selectedUser.permissions || []).map(p => `${p.resource}:${p.action}`)
              );

              return (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px] sticky left-0 bg-background border-r">权限分类</TableHead>
                        {permissionStructure.map((category) => 
                          category.permissions.map((permission) => (
                            <TableHead key={permission.key} className="text-center min-w-[80px]">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-medium">{permission.name}</span>
                              </div>
                            </TableHead>
                          ))
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissionStructure.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell className="font-medium text-primary sticky left-0 bg-background border-r">
                            {category.category}
                          </TableCell>
                          {permissionStructure.map((cat) =>
                            cat.permissions.map((permission) => (
                              <TableCell key={permission.key} className="text-center">
                                {category.category === cat.category ? (
                                  userPermissions.has(permission.key) ? (
                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </TableCell>
                            ))
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })()
          )}
        </div>

        {/* 可见字段 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">可见字段</h4>
          </div>
          {result !== null && (
            (() => {
              try {
                const data = typeof result === 'string' ? JSON.parse(result) : result;
                return (
                  <div>
                    {data.visibleFieldKeys && data.visibleFieldKeys.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {data.visibleFieldKeys.map((fieldKey: string, index: number) => {
                          const fieldName = fieldLabels[fieldKey] || fieldKey;
                          
                          const getSensitivityLevel = (key: string) => {
                            const sensitive = ['salary', 'id_number', 'birthday'];
                            const internal = ['phone', 'contact_phone', 'emergency_contact', 'address'];
                            if (sensitive.includes(key)) return { level: '敏感', variant: 'destructive' as const };
                            if (internal.includes(key)) return { level: '内部', variant: 'default' as const };
                            return { level: '公开', variant: 'secondary' as const };
                          };
                          
                          const sensitivity = getSensitivityLevel(fieldKey);
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm font-medium">{fieldName}</span>
                              <Badge variant={sensitivity.variant} className="text-xs">
                                {sensitivity.level}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        无可见字段
                      </div>
                    )}
                  </div>
                );
              } catch {
                return (
                  <div className="text-center">
                    <p className="text-destructive font-medium">数据解析错误</p>
                  </div>
                );
              }
            })()
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function PermissionsPreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionsPreviewContent />
    </Suspense>
  );
}
