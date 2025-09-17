'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { visibilityApi } from '@/lib/api';
import { PermissionEditor } from '@/components/permissions/permission-editor';
import { Shield, User, Eye, ChevronDown, ChevronRight, Settings } from 'lucide-react';

export default function PermissionsPreviewPage() {
  const searchParams = useSearchParams();
  const [targetUserId, setTargetUserId] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  const run = async (userId?: string) => {
    setLoading(true); setErr(null);
    try {
      const targetId = userId || targetUserId;
      
      // 检查认证状态
      const token = localStorage.getItem('auth_token');
      console.log('当前认证 Token:', token ? '已存在' : '未找到');
      
      console.log('权限预览请求参数:', { 
        resource: 'user', 
        targetUserId: targetId || null 
      });
      
      const data = await visibilityApi.accessPreview({
        resource: 'user',
        targetUserId: targetId || undefined,
      });
      
      console.log('权限预览响应:', data);
      
      // 处理响应数据
      if (typeof data.accessPreview === 'string') {
        const parsed = JSON.parse(data.accessPreview);
        setResult(parsed);
      } else {
        setResult(data.accessPreview);
      }
    } catch (e: unknown) {
      console.error('权限预览错误:', e);
      
      // 显示详细的错误信息
      let errorMessage = '加载失败';
      if (e instanceof Error && e.message) {
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('targetUserId') || '';
    if (id) {
      setTargetUserId(id);
      // 自动触发查询
      run(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleUserSelect = (userId: string) => {
    setTargetUserId(userId);
    // 自动触发权限预览查询
    run(userId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-bold">权限管理</h1>
          </div>
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              权限编辑
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              权限预览
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <PermissionEditor onUserSelect={handleUserSelect} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  权限预览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 max-w-xl">
                  <Input
                    placeholder="目标用户ID（留空查看自己的权限）"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  />
                  <Button onClick={() => run()} disabled={loading}>
                    {loading ? '加载中...' : '查询'}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {targetUserId ? `查看用户 ${targetUserId} 的权限` : '查看当前登录用户的权限'}
                </div>
              </CardContent>
            </Card>
            
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
        
            {result !== null && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-medium mb-6">权限预览结果</h3>
                {(() => {
                  try {
                    const data = typeof result === 'string' ? JSON.parse(result) : result;
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 用户角色卡片 */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">用户角色</h4>
                        </div>
                        <div className="space-y-3">
                          {data.roles && data.roles.length > 0 ? (
                            data.roles.map((role: string, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                  <div className="font-medium">
                                    {role === 'super_admin' ? '超级管理员' : 
                                     role === 'admin' ? '管理员' : 
                                     role === 'manager' ? '经理' : 
                                     role === 'user' ? '普通用户' : role}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {role === 'super_admin' ? '拥有所有系统权限' : 
                                     role === 'admin' ? '管理系统配置和用户' : 
                                     role === 'manager' ? '管理部门和团队' : 
                                     role === 'user' ? '基础用户权限' : '自定义角色'}
                                  </div>
                                </div>
                                <Badge variant="outline">{role}</Badge>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              未分配角色
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 系统权限卡片 */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">系统权限</h4>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-auto">
                          {(() => {
                            // 定义所有权限模块和对应的操作
                            const permissionModules = {
                              'user': {
                                name: '用户管理',
                                actions: ['create', 'read', 'update', 'delete']
                              },
                              'project': {
                                name: '项目管理',
                                actions: ['create', 'read', 'update', 'delete']
                              },
                              'task': {
                                name: '任务管理',
                                actions: ['create', 'read', 'update', 'delete', 'assign']
                              },
                              'team': {
                                name: '团队管理',
                                actions: ['create', 'read', 'update', 'delete']
                              },
                              'contact': {
                                name: '联系信息',
                                actions: ['read']
                              },
                              'user_sensitive': {
                                name: '敏感信息',
                                actions: ['read']
                              },
                              'user_highly_sensitive': {
                                name: '高敏感信息',
                                actions: ['read']
                              },
                              'org_visibility': {
                                name: '组织可见性',
                                actions: ['configure']
                              }
                            };

                            const actionNames = {
                              'create': '创建',
                              'read': '查看',
                              'update': '编辑',
                              'delete': '删除',
                              'assign': '分配',
                              'configure': '配置'
                            };

                            // 解析用户已有的权限
                            const userPermissions = new Set(data.permissions || []);

                            return Object.entries(permissionModules).map(([resource, moduleInfo]) => (
                              <div key={resource} className="border rounded-lg p-3">
                                <div className="font-medium text-sm mb-2">{moduleInfo.name}</div>
                                <div className="flex flex-wrap gap-1">
                                  {moduleInfo.actions.map((action) => {
                                    const permissionKey = `${resource}:${action}`;
                                    const hasPermission = userPermissions.has(permissionKey);
                                    
                                    return (
                                      <Badge
                                        key={action}
                                        variant={hasPermission ? "default" : "outline"}
                                        className={`text-xs ${
                                          hasPermission 
                                            ? action === 'delete' 
                                              ? 'bg-destructive text-destructive-foreground' 
                                              : '' 
                                            : 'text-muted-foreground opacity-60'
                                        }`}
                                      >
                                        {actionNames[action as keyof typeof actionNames]}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 可见字段卡片 - 跨两列 */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Eye className="h-5 w-5 text-muted-foreground" />
                            <h4 className="font-medium">可见字段</h4>
                          </div>
                          {data.visibleFieldKeys && data.visibleFieldKeys.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {data.visibleFieldKeys.map((fieldKey: string, index: number) => {
                                const fieldName = {
                                  'name': '姓名',
                                  'email': '邮箱',
                                  'phone': '手机号',
                                  'contact_phone': '联系电话',
                                  'contact_work_email': '工作邮箱',
                                  'department': '部门',
                                  'position': '职位',
                                  'employee_no': '工号',
                                  'employment_status': '在职状态',
                                  'join_date': '入职日期',
                                  'birthday': '生日',
                                  'address': '地址',
                                  'emergency_contact': '紧急联系人',
                                  'salary': '薪资',
                                  'id_number': '身份证号'
                                }[fieldKey] || fieldKey;
                                
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
                        </CardContent>
                      </Card>
                    </div>

                    {/* 原始数据卡片 - 跨两列 */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardContent className="p-6">
                          <Button
                            variant="ghost"
                            onClick={() => setShowRawData(!showRawData)}
                            className="flex items-center gap-2 w-full justify-start p-0 h-auto font-medium hover:bg-transparent"
                          >
                            {showRawData ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            查看原始数据
                          </Button>
                          {showRawData && (
                            <div className="mt-4">
                              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64 font-mono">
                                {JSON.stringify(data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              } catch {
                return (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-destructive font-medium">数据解析错误</p>
                        <pre className="mt-4 text-xs text-muted-foreground overflow-auto bg-muted p-3 rounded">
                          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}


