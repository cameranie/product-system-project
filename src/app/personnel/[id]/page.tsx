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
  Phone,
  Briefcase,
  EyeOff,
  User
} from 'lucide-react';

const maskValue = (value: string | null | undefined, visible: boolean): string => {
  if (!value) return '';
  if (visible) return value;
  if (value.length <= 3) return '***';
  if (value.length <= 6) return '****';
  return '******';
};

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
};

export default function PersonnelDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<DetailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
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
            {/* 权限管理入口已移除至人员列表页 */}
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
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">电话</span>
                      <span>{user.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">所在部门</span>
                      <span>{user.department?.name || '-'}</span>
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
                    详细信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      // 按照人员导入模板 (4).csv 的字段顺序排列
                      const csvOrder = [
                        '姓名', '员工编码', '状态', '员工类别', '序列', '直属领导', '事业部', '事业部负责人', '部门', '岗位', '标签',
                        '加入公司日期', '实习试用期（月）', '实习转正日期', '入职日期', '试用期（月）', '转正日期',
                        '主身份标识', '身份证/护照号码', '证件有效期', '到期剩余', '银行账号', '开户行', '社保电脑号', '个人公积金账号',
                        '性别', '出生日期', '年龄', '身高cm', '体重kg', '血型', '以往病史', '国籍', '民族', '籍贯-省市', '政治面貌',
                        '首次参加工作日期', '工龄计算使用日期', '工龄', '户籍类型', '户籍-省', '户籍-市', '户籍（户口所在地）', '身份证地址',
                        '联系电话', 'QQ', '微信', 'Email', '现居住地址（门牌号）', '紧急联系人姓名', '关系', '紧急联系人电话', '紧急联系人住址',
                        '学历', '入学日期', '所学专业', '学习形式', '学制(年)', '学位授予国家', '学位授予单位', '学位授予日期', '毕业学校', '毕业日期', '外语级别',
                        '婚姻状况', '婚假情况', '婚假日期', '配偶姓名', '配偶电话', '配偶任职单位', '配偶岗位',
                        '入职次数', '前次入职时间', '前次离职时间', '前次任职企业', '竞业协议',
                        '合同类型', '签订次数', '最新合同起始', '最新合同终止', '合同剩余天数',
                        '离职时间', '离职类型', '离职原因分类', '离职具体原因', '备注'
                      ];
                      
                      // 通过字段定义找到对应的key
                      const labelToKey = new Map<string, string>();
                      Object.entries(fieldDefs || {}).forEach(([key, def]) => {
                        if (def.label) labelToKey.set(def.label, key);
                      });
                      
                      // 按CSV顺序排列字段
                      const orderedKeys: string[] = [];
                      csvOrder.forEach(label => {
                        const key = labelToKey.get(label);
                        if (key && shouldShowField(key)) {
                          orderedKeys.push(key);
                        }
                      });
                      
                      // 添加未在CSV模板中的其他字段
                      Object.keys(fieldDefs || {}).forEach(key => {
                        if (!orderedKeys.includes(key) && shouldShowField(key)) {
                          orderedKeys.push(key);
                        }
                      });
                      
                      return orderedKeys.map((key) => {
                        const label = fieldDefs[key]?.label || key;
                        const fv = (user.fieldValues || []).find(f => f.fieldKey === key);
                        const value = fv?.valueString || fv?.valueNumber || fv?.valueDate || fv?.valueJson || '';
                        const visible = visibleKeys.includes(key) || isHRorSuper;
                        const displayValue = value ? renderFieldValue(key, value) : '-';
                        
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-muted-foreground">{label}</label>
                              {!visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm">{displayValue}</p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* 详情页不再分分类板块，全部字段已在上方展示 */}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}