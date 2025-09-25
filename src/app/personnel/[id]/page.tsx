'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { userApi, visibilityApi, adminApi, authApi } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

import { 
  ArrowLeft, 
  Edit,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  EyeOff,
  Calendar,
  User,
  CreditCard,
  FileText,
  GraduationCap,
  Users,
  AlertTriangle
} from 'lucide-react';

const maskValue = (value: string | null | undefined, visible: boolean): string => {
  if (!value) return '';
  if (visible) return value;
  if (value.length <= 3) return '***';
  if (value.length <= 6) return '****';
  return '******';
};

type AttachmentRef = { id: string; attachmentType?: string; attachment?: { fileUrl?: string }; fileUrl?: string };
type DetailUser = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  avatar?: string | null;
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
    relation: string;
    phone?: string;
  }>;
  familyMembers?: Array<{
    id: string;
    name: string;
    relation: string;
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

export default function PersonnelDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<DetailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isHRorSuper, setIsHRorSuper] = useState<boolean>(false);
  const [fieldDefs, setFieldDefs] = useState<Record<string, { label?: string; classification?: string; selfEditable?: boolean }>>({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const [userRes, keysRes, fieldDefsRes, meRes] = await Promise.all([
          userApi.getUser(userId),
          visibilityApi.visibleFieldKeys({ resource: 'user', targetUserId: userId }),
          adminApi.fieldDefinitions(),
          authApi.me().catch(()=>null),
        ]);
        setUser(userRes.user as unknown as DetailUser);
        setVisibleKeys(keysRes.visibleFieldKeys || []);
        type MeRoleObj = { name: string };
        type MeResult = { me?: { roles?: Array<string | MeRoleObj> } } | null | undefined;
        const rolesMixed = (meRes as MeResult)?.me?.roles || [];
        const roleNames = rolesMixed.map((r: string | MeRoleObj) => (typeof r === 'string' ? r : r?.name)).filter(Boolean) as string[];
        setIsSuperAdmin(roleNames.includes('super_admin'));
        setIsHRorSuper(roleNames.includes('super_admin') || roleNames.includes('hr_manager'));
        const defsArray = (fieldDefsRes as unknown as { fieldDefinitions?: Array<{ key: string; label: string; classification: string; selfEditable?: boolean }> })?.fieldDefinitions;
        if (defsArray) {
          const map: Record<string, { label?: string; classification?: string; selfEditable?: boolean }> = {};
          defsArray.forEach((d) => {
            map[d.key] = { label: d.label, classification: d.classification, selfEditable: d.selfEditable };
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

  const shouldShowField = (fieldKey: string) => {
    if (isHRorSuper) return true;
    return visibleKeys.includes(fieldKey);
  };

  const isSectionVisible = (sectionKey: string) => {
    if (isHRorSuper) return true;
    return visibleKeys.includes(sectionKey);
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

  const renderFieldValue = (fieldKey: string, value: unknown): string => {
    const visible = isHRorSuper ? true : visibleKeys.includes(fieldKey);
    
    if (typeof value === 'string') {
      return maskValue(value, visible);
    } else if (typeof value === 'number') {
      return visible ? value.toString() : '***';
    } else if (value instanceof Date) {
      return visible ? value.toLocaleDateString('zh-CN') : '****/**/**';
    } else if (typeof value === 'string' && value.includes('T')) {
      return visible ? new Date(value).toLocaleDateString('zh-CN') : '****/**/**';
    }
    return visible ? String(value || '') : '***';
  };

  const renderFieldWithLabel = (fieldKey: string, value: unknown, icon?: React.ReactNode) => {
    const visible = visibleKeys.includes(fieldKey);
    
    return (
      <div className="flex items-center gap-3 text-sm">
        {icon}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span>{renderFieldValue(fieldKey, value)}</span>
            {!visible && !isHRorSuper && <EyeOff className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
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
          </div>
          
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
            {isSuperAdmin && (
              <Button 
                size="sm"
                variant="secondary"
                asChild
              >
                <Link href={`/admin/permissions/preview?targetUserId=${user.id}`}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  权限管理
                </Link>
              </Button>
            )}
            {isHRorSuper && (
              <Button
                size="sm"
                variant="destructive"
                disabled={deleting}
                onClick={async ()=>{
                  if (!confirm('确认删除该用户？此操作不可恢复。')) return;
                  try {
                    setDeleting(true);
                    const res = await userApi.deleteUser(user.id);
                    if (res?.deleteUser?.success) {
                      toast.success('已删除');
                      window.location.href = '/personnel';
                    } else {
                      toast.error(res?.deleteUser?.message || '删除失败');
                    }
                  } catch (e: unknown) {
                    toast.error('删除失败：' + (e instanceof Error ? e.message : String(e)));
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? '删除中...' : '删除'}
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username}`} />
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

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    全部字段
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const defKeys = Object.keys(fieldDefs || {});
                      const byLabel = (a:string,b:string) => ((fieldDefs[a]?.label || a).localeCompare(fieldDefs[b]?.label || b));
                      const exitLabels = new Set(['离职时间','离职类型','离职原因分类','离职具体原因']);
                      const normal = defKeys.filter(k => !exitLabels.has(fieldDefs[k]?.label || k)).sort(byLabel);
                      const exits = defKeys.filter(k => exitLabels.has(fieldDefs[k]?.label || k));
                      const ordered = [...normal, ...exits];
                      return ordered.map((key) => {
                        const label = fieldDefs[key]?.label || key;
                        if (!shouldShowField(key) && !isHRorSuper) return null;
                        const fv = (user.fieldValues || []).find(f => f.fieldKey === key);
                        const value = fv?.valueString || fv?.valueNumber || fv?.valueDate || fv?.valueJson || '';
                        const visible = visibleKeys.includes(key) || isHRorSuper;
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-muted-foreground">{label}</label>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm">{renderFieldValue(key, value)}</p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {isSectionVisible('educations') && user.educations && user.educations.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      教育经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.educations.map((edu) => {
                        const visible = isSuperAdmin || visibleKeys.includes('educations');
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

              {isSectionVisible('work_experiences') && user.workExperiences && user.workExperiences.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      工作经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.workExperiences.map((work) => {
                        const visible = isSuperAdmin || visibleKeys.includes('work_experiences');
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

              {isSectionVisible('emergency_contacts') && user.emergencyContacts && user.emergencyContacts.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      紧急联系人
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.emergencyContacts.map((contact) => {
                        const visible = isSuperAdmin || visibleKeys.includes('emergency_contacts');
                        return (
                          <div key={contact.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {maskValue(contact.name, visible)}
                                  {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                                </p>
                                <p className="text-sm text-muted-foreground">{maskValue(contact.relation, visible)}</p>
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

              {isSectionVisible('family_members') && user.familyMembers && user.familyMembers.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      家庭成员
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.familyMembers.map((member) => {
                        const visible = isSuperAdmin || visibleKeys.includes('family_members');
                        return (
                          <div key={member.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{maskValue(member.name, visible)}</p>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{maskValue(member.relation, visible)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isSectionVisible('contracts') && user.contracts && user.contracts.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      合同信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.contracts.map((contract) => {
                        const visible = isSuperAdmin || visibleKeys.includes('contracts');
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

              {isSectionVisible('documents') && user.documents && user.documents.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      证件信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.documents.map((doc) => {
                        const visible = isSuperAdmin || visibleKeys.includes('documents');
                        return (
                          <div key={doc.id} className="flex items-center justify-between py-3">
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

              {isSectionVisible('attachments') && (user as unknown as { attachments?: Array<AttachmentRef> }).attachments && (user as unknown as { attachments?: Array<AttachmentRef> }).attachments!.length > 0 && (
                <Card className="mt-6">
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}