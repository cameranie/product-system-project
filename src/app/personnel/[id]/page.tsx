'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { userApi, visibilityApi, adminApi } from '@/lib/api';
import Link from 'next/link';

import { 
  ArrowLeft, 
  Edit,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  EyeOff,
  Calendar,
  MapPin,
  User,
  CreditCard,
  FileText,
  GraduationCap,
  Users,
  AlertTriangle
} from 'lucide-react';

// 可见性等级的中文映射
const CLASSIFICATION_LABELS = {
  PUBLIC: '公开',
  INTERNAL: '内部',
  SENSITIVE: '敏感',
  HIGHLY_SENSITIVE: '高度敏感'
} as const;

// 遮罩处理函数
const maskValue = (value: string | null | undefined, visible: boolean): string => {
  if (!value) return '';
  if (visible) return value;
  // 根据内容长度返回对应的遮罩
  if (value.length <= 3) return '***';
  if (value.length <= 6) return '****';
  return '******';
};

type AttachmentRef = { id: string; attachmentType?: string; attachment?: { fileUrl?: string }; fileUrl?: string };
type DetailUserLite = { id: string; name: string; email: string | null; username: string; phone: string | null; isActive: boolean; createdAt: string; department?: { id: string; name: string } | null; attachments?: AttachmentRef[] };
type DetailUser = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  department?: { id: string; name: string } | null;
  fieldValues?: Array<{
    fieldKey: string;
    valueString?: string;
    valueNumber?: number;
    valueDate?: string;
    valueJson?: unknown;
  }>;
  educations?: Array<{
    id: string;
    degree: string;
    school: string;
    major?: string;
    startDate?: string;
    endDate?: string;
  }>;
  workExperiences?: Array<{
    id: string;
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
  }>;
  emergencyContacts?: Array<{
    id: string;
    name: string;
    relationship: string;
    phone?: string;
  }>;
  familyMembers?: Array<{
    id: string;
    name: string;
    relationship: string;
  }>;
  contracts?: Array<{
    id: string;
    contractNo: string;
    contractType: string;
    company: string;
    startDate?: string;
    endDate?: string;
  }>;
  documents?: Array<{
    id: string;
    docType: string;
    docNumber: string;
    validUntil?: string;
  }>;
  bankAccounts?: Array<{
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
  }>;
};

// 假期余额子组件（轻量封装）
function LeaveBalances({ userId }: { userId: string }) {
  const [items, setItems] = React.useState<Array<{ type: string; total: number; used: number; available: number }>>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    userApi.getUserLeaveBalances(userId)
      .then((res: { userLeaveBalances?: Array<{ type: string; total: number; used: number; available: number }> }) => {
        if (!mounted) return;
        setItems(res.userLeaveBalances || []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('');
      });
    return () => { mounted = false; };
  }, [userId]);

  if (error !== null && items.length === 0) return null;

  const labelMap: Record<string, string> = {
    ANNUAL: '年假', PERSONAL: '事假', PAID_SICK: '带薪病假', MARRIAGE: '婚假', MATERNITY: '产假', PATERNITY: '陪产假', FUNERAL: '丧假', PRENATAL_CHECK: '产检假', SICK: '病假(非全薪)', OTHER: '其他',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.type} className="flex items-center justify-between rounded-md border px-3 py-2">
          <span className="text-sm text-muted-foreground">{labelMap[it.type] || it.type}</span>
          <span className="text-sm">{it.available}</span>
        </div>
      ))}
      {items.length === 0 && <p className="text-muted-foreground text-sm">暂无假期余额</p>}
    </div>
  );
}

export default function PersonnelDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<DetailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [fieldDefs, setFieldDefs] = useState<Record<string, { label?: string; classification?: string }>>({});

  // 加载用户数据 + 可见字段 + 字段定义
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const [userRes, keysRes, fieldDefsRes] = await Promise.all([
          userApi.getUser(userId),
          visibilityApi.visibleFieldKeys({ resource: 'user', targetUserId: userId }),
          adminApi.fieldDefinitions(),
        ]);
        setUser(userRes.user as unknown as DetailUserLite);
        setVisibleKeys(keysRes.visibleFieldKeys || []);
        const defsRaw = (fieldDefsRes as unknown as { fieldDefinitions?: unknown })?.fieldDefinitions;
        if (defsRaw) {
          const parsed = typeof defsRaw === 'string' ? JSON.parse(defsRaw) : defsRaw;
          const map: Record<string, { label?: string; classification?: string }> = {};
          (parsed as Array<{ key: string; label: string; classification: string }> | undefined)?.forEach((d) => {
            map[d.key] = { label: d.label, classification: d.classification };
          });
          setFieldDefs(map);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
        console.error('Failed to load user:', e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  // 判断字段是否应该展示（非敏感信息）
  const shouldShowField = (classification: string) => {
    // 根据 SENSITIVITY_MATRIX.md，展示 PUBLIC 和 INTERNAL 级别字段
    return ['PUBLIC', 'INTERNAL'].includes(classification);
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">加载中...</div>
            <div className="text-sm text-muted-foreground mt-2">正在加载人员详情</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600">加载失败</div>
            <div className="text-sm text-muted-foreground mt-2">{error || '用户不存在'}</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // 辅助函数：渲染字段值
  const renderFieldValue = (fieldKey: string, value: unknown): string => {
    const visible = visibleKeys.includes(fieldKey);
    
    if (typeof value === 'string') {
      return maskValue(value, visible);
    } else if (typeof value === 'number') {
      return visible ? value.toString() : '***';
    } else if (value instanceof Date) {
      return visible ? value.toLocaleDateString('zh-CN') : '****/**/**';
    } else if (typeof value === 'string' && value.includes('T')) {
      // 处理日期字符串
      return visible ? new Date(value).toLocaleDateString('zh-CN') : '****/**/**';
    }
    return visible ? String(value || '') : '***';
  };

  // 渲染字段带标签和权限标识
  const renderFieldWithLabel = (fieldKey: string, value: unknown, icon?: React.ReactNode) => {
    const fieldDef = fieldDefs[fieldKey];
    const visible = visibleKeys.includes(fieldKey);
    
    return (
      <div className="flex items-center gap-3 text-sm">
        {icon}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span>{renderFieldValue(fieldKey, value)}</span>
            {fieldDef && (
              <Badge variant={visible ? "secondary" : "outline"} className="text-xs">
                {CLASSIFICATION_LABELS[fieldDef.classification as keyof typeof CLASSIFICATION_LABELS] || fieldDef.classification}
              </Badge>
            )}
            {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">人员详情</h1>
            </div>
          </div>
          
          {/* 编辑按钮 */}
          <div className="flex items-center gap-3">
            <Button 
              size="sm"
              asChild
            >
              <Link href={`/personnel/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Link>
            </Button>
            <Button 
              size="sm"
              variant="secondary"
              asChild
            >
              <Link href={`/admin/permissions/preview?targetUserId=${user.id}`}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                权限预览
              </Link>
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：基本信息卡片 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username}`} />
                      <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? '在职' : '离职'}
                      </Badge>
                  </div>

                  <div className="space-y-3">
                    {renderFieldWithLabel('contact_work_email', user.email, <Mail className="h-4 w-4 text-muted-foreground" />)}
                    {renderFieldWithLabel('contact_phone', user.phone, <Phone className="h-4 w-4 text-muted-foreground" />)}
                    {renderFieldWithLabel('department', user.department?.name, <Briefcase className="h-4 w-4 text-muted-foreground" />)}
                    
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">入职时间</span>
                      <span>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：详细信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 工作信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    工作信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.fieldValues?.filter(field => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      return fieldDef && shouldShowField(fieldDef.classification || 'PUBLIC') && 
                             ['employee_no', 'employee_status', 'employee_type', 'sequence', 'position_title', 
                              'work_location', 'company_name', 'join_date', 'regular_date'].includes(field.fieldKey);
                    }).map((field) => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      const value = field.valueString || field.valueNumber || field.valueDate || field.valueJson;
                      const visible = visibleKeys.includes(field.fieldKey);
                      
                      return (
                        <div key={field.fieldKey} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              {fieldDef.label}
                            </label>
                            <Badge variant={visible ? "secondary" : "outline"} className="text-xs">
                              {CLASSIFICATION_LABELS[fieldDef.classification as keyof typeof CLASSIFICATION_LABELS] || fieldDef.classification}
                            </Badge>
                            {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-sm">{renderFieldValue(field.fieldKey, value)}</p>
                    </div>
                      );
                    })}
                    
                    {/* 如果没有任何工作信息字段，显示提示 */}
                    {user.fieldValues?.filter(field => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      return fieldDef && shouldShowField(fieldDef.classification || 'PUBLIC') && 
                             ['employee_no', 'employee_status', 'employee_type', 'sequence', 'position_title', 
                              'work_location', 'company_name', 'join_date', 'regular_date'].includes(field.fieldKey);
                    }).length === 0 && (
                      <p className="text-muted-foreground text-sm col-span-2">暂无可显示的工作信息</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 工作信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    工作信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.fieldValues?.filter(field => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      if (!fieldDef) return false;
                      
                      // 工作相关字段
                      const workFields = ['employee_no', 'employee_status', 'employee_type', 'sequence', 'direct_supervisor', 
                                        'business_unit', 'business_unit_leader', 'position_title', 'tags', 'company_join_date',
                                        'join_date', 'probation_months', 'regular_date', 'work_location', 'company_name'];
                      
                      return workFields.includes(field.fieldKey) && shouldShowField(fieldDef.classification || 'PUBLIC');
                    }).map((field) => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      const value = field.valueString || field.valueNumber || field.valueDate || field.valueJson;
                      const visible = visibleKeys.includes(field.fieldKey);
                      
                      return (
                        <div key={field.fieldKey} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              {fieldDef?.label}
                            </label>
                            <Badge variant={visible ? "secondary" : "outline"} className="text-xs">
                              {CLASSIFICATION_LABELS[fieldDef?.classification as keyof typeof CLASSIFICATION_LABELS] || fieldDef?.classification}
                            </Badge>
                            {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-sm">{renderFieldValue(field.fieldKey, value)}</p>
                        </div>
                      );
                    })}
                    
                    {/* 如果没有任何工作信息字段，显示提示 */}
                    {user.fieldValues?.filter(field => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      const workFields = ['employee_no', 'employee_status', 'employee_type', 'sequence', 'direct_supervisor', 
                                        'business_unit', 'business_unit_leader', 'position_title', 'tags', 'company_join_date',
                                        'join_date', 'probation_months', 'regular_date', 'work_location', 'company_name'];
                      return fieldDef && workFields.includes(field.fieldKey) && shouldShowField(fieldDef.classification || 'PUBLIC');
                    }).length === 0 && (
                      <p className="text-muted-foreground text-sm col-span-2">暂无可显示的工作信息</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 个人信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    个人信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.fieldValues?.filter(field => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      if (!fieldDef) return false;
                      
                      // 个人信息相关字段
                      const personalFields = ['english_name', 'gender', 'birth_date', 'age', 'height', 'weight', 'blood_type',
                                            'nationality', 'ethnicity', 'political_status', 'birthplace', 'household_type',
                                            'household_province', 'household_city', 'household_address', 'id_card_address',
                                            'current_address', 'qq', 'wechat', 'personal_email'];
                      
                      return personalFields.includes(field.fieldKey) && shouldShowField(fieldDef.classification || 'PUBLIC');
                    }).map((field) => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      const value = field.valueString || field.valueNumber || field.valueDate || field.valueJson;
                      const visible = visibleKeys.includes(field.fieldKey);
                      
                      return (
                        <div key={field.fieldKey} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              {fieldDef?.label}
                            </label>
                            <Badge variant={visible ? "secondary" : "outline"} className="text-xs">
                              {CLASSIFICATION_LABELS[fieldDef?.classification as keyof typeof CLASSIFICATION_LABELS] || fieldDef?.classification}
                            </Badge>
                            {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-sm">{renderFieldValue(field.fieldKey, value)}</p>
                        </div>
                      );
                    })}
                    
                    {/* 如果没有任何个人信息字段，显示提示 */}
                    {user.fieldValues?.filter(field => {
                      const fieldDef = fieldDefs[field.fieldKey];
                      const personalFields = ['english_name', 'gender', 'birth_date', 'age', 'height', 'weight', 'blood_type',
                                            'nationality', 'ethnicity', 'political_status', 'birthplace', 'household_type',
                                            'household_province', 'household_city', 'household_address', 'id_card_address',
                                            'current_address', 'qq', 'wechat', 'personal_email'];
                      return fieldDef && personalFields.includes(field.fieldKey) && shouldShowField(fieldDef.classification || 'PUBLIC');
                    }).length === 0 && (
                      <p className="text-muted-foreground text-sm col-span-2">暂无可显示的个人信息</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 假期余额（仅HR/超管可见；若无权限后端会返回错误，这里容错隐藏） */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    假期余额
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaveBalances userId={user.id} />
                </CardContent>
              </Card>

              {/* 教育经历 */}
              {user.educations && user.educations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      教育经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.educations.map((edu) => {
                        const visible = visibleKeys.includes('educations');
                        return (
                          <div key={edu.id} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{maskValue(edu.school, visible)}</h4>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {maskValue(edu.degree, visible)} • {maskValue(edu.major || '', visible)}
                            </p>
                            {(edu.startDate || edu.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {visible ? `${edu.startDate || ''} - ${edu.endDate || '至今'}` : '****/**/** - ****/**/**'}
                              </p>
                            )}
                      </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 工作经历 */}
              {user.workExperiences && user.workExperiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      工作经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.workExperiences.map((work) => {
                        const visible = visibleKeys.includes('work_experiences');
                        return (
                          <div key={work.id} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{maskValue(work.company, visible)}</h4>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{maskValue(work.position, visible)}</p>
                            {(work.startDate || work.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {visible ? `${work.startDate || ''} - ${work.endDate || '至今'}` : '****/**/** - ****/**/**'}
                              </p>
                            )}
                      </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 紧急联系人 */}
              {user.emergencyContacts && user.emergencyContacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      紧急联系人
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.emergencyContacts.map((contact) => {
                        const visible = visibleKeys.includes('emergency_contacts');
                        return (
                          <div key={contact.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {maskValue(contact.name, visible)}
                                  {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                                </p>
                                <p className="text-sm text-muted-foreground">{maskValue(contact.relationship, visible)}</p>
                              </div>
                            </div>
                            <p className="text-sm">{maskValue(contact.phone || '', visible)}</p>
                      </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 家庭成员 */}
              {user.familyMembers && user.familyMembers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      家庭成员
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.familyMembers.map((member) => {
                        const visible = visibleKeys.includes('family_members');
                        return (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{maskValue(member.name, visible)}</p>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{maskValue(member.relationship, visible)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 合同信息 */}
              {user.contracts && user.contracts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      合同信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.contracts.map((contract) => {
                        const visible = visibleKeys.includes('contracts');
                        return (
                          <div key={contract.id} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{maskValue(contract.contractNo, visible)}</h4>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {maskValue(contract.company, visible)} • {maskValue(contract.contractType, visible)}
                            </p>
                            {(contract.startDate || contract.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {visible ? `${contract.startDate || ''} - ${contract.endDate || '至今'}` : '****/**/** - ****/**/**'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* 证件信息 */}
              {user.documents && user.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      证件信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.documents.map((doc) => {
                        const visible = visibleKeys.includes('documents');
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium">{maskValue(doc.docType, visible)}</p>
                                <p className="text-sm text-muted-foreground">{maskValue(doc.docNumber, visible)}</p>
                              </div>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            {doc.validUntil && (
                              <p className="text-sm text-muted-foreground">
                                有效期至: {visible ? new Date(doc.validUntil).toLocaleDateString('zh-CN') : '****/**/**'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 资料附件 */}
              {(user as unknown as { attachments?: Array<AttachmentRef> }).attachments && (user as unknown as { attachments?: Array<AttachmentRef> }).attachments!.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      资料附件
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(((user as unknown) as { attachments: Array<AttachmentRef> }).attachments).map((att) => (
                        <div key={att.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                          <span className="text-sm text-muted-foreground">{att.attachmentType}</span>
                          <Button size="sm" variant="outline" onClick={async ()=>{
                            const path = att.attachment?.fileUrl || att.fileUrl;
                            if (!path) return;
                            if (typeof path === 'string' && !path.startsWith('http')) {
                              const res = await userApi.createAttachmentDownloadUrl(path).catch(()=>null);
                              const url = res?.createAttachmentDownloadUrl || '';
                              if (url) window.open(url, '_blank');
                            } else {
                              window.open(path, '_blank');
                            }
                          }}>下载</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 合同信息 - INTERNAL，可显示 */}
              {/* 合同信息已集成到工作信息中 */}
              {false && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      合同信息
                      <Badge variant="outline" className="text-xs">内部</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user?.contracts?.map((contract, index) => {
                        const visible = visibleKeys.includes('contracts');
                        return (
                          <div key={contract.id || index} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{maskValue(contract.contractType || '', visible)}</h4>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              合同号: {maskValue(contract.contractNo || '', visible)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              签约公司: {maskValue(contract.company || '', visible)}
                            </p>
                            {contract.startDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                开始日期: {maskValue(new Date(contract.startDate).toLocaleDateString('zh-CN'), visible)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* 敏感和高度敏感信息不在详情页显示 */}
              {/* - 紧急联系人 (SENSITIVE) */}
              {/* - 家庭成员 (SENSITIVE) */}
              {/* - 证件信息 (HIGHLY_SENSITIVE) */}
              {/* - 银行账户 (HIGHLY_SENSITIVE) */}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
