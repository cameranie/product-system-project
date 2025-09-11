'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { authApi, userApi, visibilityApi, adminApi } from '@/lib/api';
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

// 可见性等级的中文映射
const CLASSIFICATION_LABELS = {
  PUBLIC: '公开',
  INTERNAL: '内部',
  SENSITIVE: '敏感',
  HIGHLY_SENSITIVE: '高度敏感'
} as const;

export default function EditUserPage() {
  const { id } = useParams();
  const userId = id as string;
  const router = useRouter();

  // 基本信息状态
  const [form, setForm] = useState({
    name: '',
    phone: '',
    departmentId: 'none',
    isActive: 'true',
    email: '',
  });

  // EAV 字段值
  const [fieldValues, setFieldValues] = useState<Record<string, string | number | Date | unknown>>({});
  
  // 多明细状态
  type Education = { id?: string; userId?: string; degree?: string; school?: string; enrollDate?: string; graduateDate?: string; major?: string; studyForm?: string; schoolingYears?: number; degreeName?: string; awardingCountry?: string; awardingInstitution?: string; awardingDate?: string; languageLevel?: string };
  type WorkExp = { id?: string; userId?: string; company?: string; department?: string; position?: string; startDate?: string; endDate?: string };
  type EmergencyContact = { id?: string; userId?: string; name?: string; relationship?: string; phone?: string; address?: string };
  type FamilyMember = { id?: string; userId?: string; name?: string; relationship?: string; organization?: string; contact?: string };
  type Contract = { id?: string; userId?: string; contractNo?: string; company?: string; contractType?: string; startDate?: string; endDate?: string; actualEndDate?: string; signedTimes?: number };
  type DocumentT = { id?: string; userId?: string; docType?: string; docNumber?: string; validUntil?: string; remainingDays?: string };
  type BankAccount = { id?: string; userId?: string; accountName?: string; bankName?: string; bankBranch?: string; accountNumber?: string };
  type AttachmentRef = { id: string; filename?: string; fileUrl?: string; attachmentType?: string; attachment?: { filename?: string; fileUrl?: string } };

  const [educations, setEducations] = useState<Education[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExp[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<DocumentT[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [attachments, setAttachments] = useState<AttachmentRef[]>([]);
  const ATTACHMENT_TYPE_OPTIONS = [
    { key: 'ID_CARD', label: '身份证' },
    { key: 'CMB_BANK_CARD', label: '招商银行卡' },
    { key: 'HOUSEHOLD_MAIN', label: '户口本首页' },
    { key: 'HOUSEHOLD_SELF', label: '户口本本人页' },
    { key: 'EDU_DIPLOMA', label: '学历证书' },
    { key: 'EDU_DEGREE', label: '学位证书' },
    { key: 'RESIGNATION_CERT', label: '离职证明' },
    { key: 'MEDICAL_REPORT', label: '体检报告' },
    { key: 'ORIGINAL_RESUME', label: '原始简历' },
    { key: 'ONBOARD_FORM', label: '入职登记表' },
    { key: 'STUDENT_ID', label: '学生证' },
    { key: 'PERSONALITY_TEST', label: '性格测试' },
  ];
  const [attachmentType, setAttachmentType] = useState<string>('ID_CARD');

  // 折叠状态 - 参考任务看板风格
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicInfo: false,
    workInfo: true,
    personalInfo: false,
    educations: true,
    workExperiences: true,
    emergencyContacts: true,
    familyMembers: true,
    contracts: true,
    documents: true,
    bankAccounts: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; roles: string[]; permissions?: string[] } | null>(null);
  const [fieldDefs, setFieldDefs] = useState<Record<string, { label?: string; classification?: string; selfEditable?: boolean }>>({});
  const [onlyEditable, setOnlyEditable] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [userRes, keysRes, meRes, defsRes] = await Promise.all([
          userApi.getUser(userId),
          visibilityApi.visibleFieldKeys({ resource: 'user', targetUserId: userId }),
          authApi.me(),
          adminApi.fieldDefinitions().catch(() => null),
        ]);

        const u = userRes.user;
        setForm({
          name: u.name ?? '',
          phone: u.phone ?? '',
          departmentId: u.department?.id ?? 'none',
          isActive: u.isActive ? 'true' : 'false',
          email: u.email ?? '',
        });

        // 解析 EAV 字段值
        const fieldValuesMap: Record<string, string | number | Date | unknown> = {};
        (u.fieldValues || []).forEach((fv: { fieldKey: string; valueString?: string; valueNumber?: number; valueDate?: string; valueJson?: unknown }) => {
          const value = fv.valueString ?? fv.valueNumber ?? fv.valueDate ?? fv.valueJson;
          fieldValuesMap[fv.fieldKey] = value;
        });
        setFieldValues(fieldValuesMap);

        // 设置多明细
        setEducations(Array.isArray(u.educations) ? u.educations : []);
        setWorkExperiences(Array.isArray(u.workExperiences) ? u.workExperiences : []);
        setEmergencyContacts(Array.isArray(u.emergencyContacts) ? u.emergencyContacts : []);
        setFamilyMembers(Array.isArray(u.familyMembers) ? u.familyMembers : []);
        setContracts(Array.isArray(u.contracts) ? u.contracts : []);
        setDocuments(Array.isArray(u.documents) ? u.documents : []);
        setBankAccounts(Array.isArray(u.bankAccounts) ? u.bankAccounts : []);
        setAttachments(Array.isArray((u as { attachments?: AttachmentRef[] }).attachments) ? (u as { attachments?: AttachmentRef[] }).attachments! : []);

        setVisibleKeys(keysRes.visibleFieldKeys || []);
        setCurrentUser(meRes?.me ? { id: meRes.me.id, roles: meRes.me.roles || [], permissions: meRes.me.permissions || [] } : null);

        const defsRaw = (defsRes as unknown as { fieldDefinitions?: unknown })?.fieldDefinitions;
        if (defsRaw) {
          const parsed = typeof defsRaw === 'string' ? JSON.parse(defsRaw) : defsRaw;
          const map: Record<string, { label?: string; classification?: string; selfEditable?: boolean }> = {};
          (parsed as Array<{ key: string; label: string; classification: string; selfEditable?: boolean }> | undefined)?.forEach((d) => {
            map[d.key] = { label: d.label, classification: d.classification, selfEditable: d.selfEditable };
          });
          setFieldDefs(map);
        }
      } catch (error) {
        setErr(error instanceof Error ? error.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      run();
    }
  }, [userId]);

  function isEditable(key: string) {
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');
    const isSelf = currentUser?.id === userId;
    const hasUserUpdate = currentUser?.permissions?.some(p => p.includes('user:update'));
    
    if (isSuperAdmin) return true;
    const selfEditable = ['name', 'contact_phone', 'personal_email', 'address'];
    if (isSelf && selfEditable.includes(key)) return true;
    return hasUserUpdate;
  }

  function getFieldSensitivity(fieldKey: string): string {
    const fieldInfo = fieldDefs[fieldKey];
    if (fieldInfo?.classification) return fieldInfo.classification;
    
    const sensitive = ['base_salary', 'id_number', 'bank_account', 'social_security_number'];
    const internal = ['birthday', 'emergency_contact', 'personal_email'];
    
    if (sensitive.includes(fieldKey)) return 'SENSITIVE';
    if (internal.includes(fieldKey)) return 'INTERNAL';
    return 'PUBLIC';
  }

  // 切换折叠状态 - 参考任务看板的实现
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const updateFieldValue = useCallback((fieldKey: string, value: string | number | Date | unknown) => {
    setFieldValues(prev => ({ ...prev, [fieldKey]: value }));
  }, []);

  // 稳定的更新函数用于各个明细项
  const updateEducation = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setEducations(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  const updateWorkExperience = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setWorkExperiences(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  const updateEmergencyContact = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setEmergencyContacts(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  const updateFamilyMember = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setFamilyMembers(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  const updateContract = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setContracts(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  const updateDocument = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setDocuments(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  const updateBankAccount = useCallback((index: number, field: string, value: string | number | Date | unknown) => {
    setBankAccounts(prev => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  }, []);

  // 附件：本地列表仅用于展示与删除；上传走独立流程
  const addAttachmentLocal = (att: AttachmentRef) => setAttachments(prev => [att, ...prev]);
  const removeAttachmentLocal = (id: string) => setAttachments(prev => prev.filter((a) => a.id !== id));

  // 看板风格的区域标题组件
  const SectionHeader = ({ title, sectionKey, badge, actions }: {
    title: string;
    sectionKey: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
  }) => (
    <div className="flex items-center py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center gap-2 text-sm font-medium p-0 h-auto hover:bg-transparent"
      >
        <span className="text-lg font-semibold">{title}</span>
        {badge}
        {collapsedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </Button>
      {actions && (
        <div className="ml-4">
          {actions}
        </div>
      )}
    </div>
  );

  // 统一的表单字段组件 - 确保标题和input之间有间距
  const FieldGroup = ({ label, badge, children, required = false }: {
    label: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {badge}
      </div>
      {children}
    </div>
  );

  // 优化的EAV字段渲染 - 使用日期选择器
  const renderEAVField = (fieldKey: string, label: string) => {
    if (!visibleKeys.includes(fieldKey)) return null;
    if (onlyEditable && !isEditable(fieldKey)) return null;

    const value = (fieldValues[fieldKey] ?? '') as string | number | Date;
    const sensitivity = getFieldSensitivity(fieldKey);
    const editable = isEditable(fieldKey);
    const classificationLabel = CLASSIFICATION_LABELS[sensitivity as keyof typeof CLASSIFICATION_LABELS] || sensitivity;

    // 日期字段使用DatePicker
    if (fieldKey.includes('date') || fieldKey === 'birth_date') {
      const dateValue = value ? new Date(value) : undefined;
      return (
        <FieldGroup
          key={fieldKey}
          label={label}
          badge={<Badge variant="secondary" className="text-xs">{classificationLabel}</Badge>}
        >
          <DatePicker
            date={dateValue}
            onDateChange={(date) => updateFieldValue(fieldKey, date?.toISOString().split('T')[0] || '')}
            placeholder={`选择${label}`}
            className="h-10 text-sm"
          />
        </FieldGroup>
      );
    }

    // 数字字段
    if (fieldKey.includes('years') || fieldKey.includes('times') || fieldKey.includes('months')) {
      return (
        <FieldGroup
          key={fieldKey}
          label={label}
          badge={<Badge variant="secondary" className="text-xs">{classificationLabel}</Badge>}
        >
          <Input
            type="number"
            value={typeof value === 'number' ? String(value) : String(value ?? '')}
            onChange={e => updateFieldValue(fieldKey, e.target.value === '' ? '' : Number(e.target.value))}
            disabled={!editable}
            className="h-10"
            placeholder={`请输入${label}`}
          />
        </FieldGroup>
      );
    }

    // 性别字段
    if (fieldKey === 'gender') {
      const genderValue = typeof value === 'string' ? value : '';
      return (
        <FieldGroup
          key={fieldKey}
          label={label}
          badge={<Badge variant="secondary" className="text-xs">{classificationLabel}</Badge>}
        >
          <Select value={genderValue} onValueChange={v => updateFieldValue(fieldKey, v)} disabled={!editable}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="请选择性别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="男">男</SelectItem>
              <SelectItem value="女">女</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      );
    }

    // 默认文本字段
    return (
      <FieldGroup
        key={fieldKey}
        label={label}
        badge={<Badge variant="secondary" className="text-xs">{classificationLabel}</Badge>}
      >
        <Input
          placeholder={`请输入${label}`}
          value={typeof value === 'string' ? value : String(value ?? '')}
          onChange={e => updateFieldValue(fieldKey, e.target.value)}
          disabled={!editable}
          className="h-10"
        />
      </FieldGroup>
    );
  };

  const saveBasicInfo = async () => {
    try {
      setSaving(true);
      setErr(null);

      // 保存基本信息
      const basicData = {
        name: form.name,
        phone: form.phone,
        departmentId: form.departmentId === 'none' ? undefined : form.departmentId,
        isActive: form.isActive === 'true',
      };

      await userApi.updateUser(userId, basicData);

      // 保存EAV字段
      const fieldValueEntries = Object.entries(fieldValues).map(([key, value]) => ({
        fieldKey: key,
        value: value
      }));

      if (fieldValueEntries.length > 0) {
        await userApi.updateUserFieldValues(userId, fieldValueEntries);
      }

      alert('保存成功！');
    } catch (error) {
      setErr(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-8">加载中…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部操作区 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyEditable}
                onChange={e => setOnlyEditable(e.target.checked)}
              />
              只看可编辑字段
            </label>
          </div>
          <div className="flex items-center gap-3">
            {err && <div className="text-red-600 text-sm mr-2">{err}</div>}
            <Button onClick={saveBasicInfo} disabled={saving} size="default">
              {saving ? '保存中…' : '保存'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/personnel/${userId}`)}
              disabled={saving}
              size="default"
            >
              取消
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* 基本信息 */}
          <div>
            <SectionHeader title="基本信息" sectionKey="basicInfo" />
            
            {!collapsedSections.basicInfo && (
              <div className="pl-6 space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldGroup 
                    label="姓名" 
                    required
                    badge={<Badge variant="secondary" className="text-xs">公开</Badge>}
                  >
                    <Input
                      placeholder="请输入姓名"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      disabled={!isEditable('name')}
                      className="h-10"
                    />
                  </FieldGroup>

                  <FieldGroup 
                    label="手机号码"
                    badge={<Badge variant="secondary" className="text-xs">内部</Badge>}
                  >
                    <Input
                      placeholder="请输入手机号码"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      disabled={!isEditable('contact_phone')}
                      className="h-10"
                    />
                  </FieldGroup>

                  <FieldGroup 
                    label="工作邮箱"
                    badge={<Badge variant="secondary" className="text-xs">公开</Badge>}
                  >
                    <Input value={form.email} disabled className="h-10" />
                  </FieldGroup>

                  <FieldGroup 
                    label="所属部门"
                    badge={<Badge variant="secondary" className="text-xs">公开</Badge>}
                  >
                    <Select 
                      value={form.departmentId} 
                      onValueChange={v => setForm({ ...form, departmentId: v })}
                      disabled={!isEditable('department')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="不选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不选择部门</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup 
                    label="入职状态"
                    badge={<Badge variant="secondary" className="text-xs">内部</Badge>}
                  >
                    <Select 
                      value={form.isActive} 
                      onValueChange={v => setForm({ ...form, isActive: v })}
                      disabled={!isEditable('is_active')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">在岗</SelectItem>
                        <SelectItem value="false">离岗</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>
              </div>
            )}
          </div>

          {/* 工作信息（EAV 字段） */}
          <div>
            <SectionHeader title="工作信息" sectionKey="workInfo" />
            
            {!collapsedSections.workInfo && (
              <div className="pl-6 space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 基本工作信息 */}
                  {renderEAVField('employee_no', '工号')}
                  {renderEAVField('employee_status', '人员状态')}
                  {renderEAVField('employee_type', '人员类型')}
                  {renderEAVField('sequence', '序列')}
                  {renderEAVField('direct_supervisor', '直属上级')}
                  {renderEAVField('business_unit', '事业部')}
                  {renderEAVField('business_unit_leader', '事业部负责人')}
                  {renderEAVField('position_title', '职务')}
                  {renderEAVField('tags', '标签')}
                  
                  {/* 入职相关 */}
                  {renderEAVField('company_join_date', '加入公司日期')}
                  {renderEAVField('internship_to_regular_date', '实习转正日期')}
                  {renderEAVField('join_date', '入职日期')}
                  {renderEAVField('probation_months', '试用期(月)')}
                  {renderEAVField('regular_date', '转正日期')}
                  
                  {/* 社保公积金 */}
                  {renderEAVField('social_security_no', '社保账号')}
                  {renderEAVField('housing_fund_no', '个人公积金账号')}
                  {renderEAVField('join_work_status', '入职时社保状况')}
                  
                  {/* 工龄相关 */}
                  {renderEAVField('first_work_date', '首次参加工作日期')}
                  {renderEAVField('seniority_calc_date', '工龄计算使用日期')}
                  {renderEAVField('work_years', '工龄')}
                  {renderEAVField('company_years', '司龄')}
                  
                  {/* 工作地点信息 */}
                  {renderEAVField('work_location', '工作地点')}
                  {renderEAVField('company_name', '所属公司')}
                  {renderEAVField('onboard_location', '入职办理地点')}
                </div>
              </div>
            )}
          </div>

          {/* 个人信息（EAV 字段） */}
          <div>
            <SectionHeader title="个人信息" sectionKey="personalInfo" />
            
            {!collapsedSections.personalInfo && (
              <div className="pl-6 space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 个人基础信息 */}
                  {renderEAVField('english_name', '英文名')}
                  {renderEAVField('gender', '性别')}
                  {renderEAVField('birth_date', '出生日期')}
                  {renderEAVField('age', '年龄')}
                  {renderEAVField('height', '身高(cm)')}
                  {renderEAVField('weight', '体重(kg)')}
                  {renderEAVField('blood_type', '血型')}
                  {renderEAVField('medical_history', '以往病史')}
                  
                  {/* 身份信息 */}
                  {renderEAVField('nationality', '国籍')}
                  {renderEAVField('ethnicity', '民族')}
                  {renderEAVField('political_status', '政治面貌')}
                  {renderEAVField('birthplace', '籍贯(省市)')}
                  
                  {/* 户籍信息 */}
                  {renderEAVField('household_type', '户籍类型')}
                  {renderEAVField('household_province', '户籍-省')}
                  {renderEAVField('household_city', '户籍-市')}
                  {renderEAVField('household_address', '户籍(户口所在地)')}
                  {renderEAVField('id_card_address', '身份证地址')}
                  {renderEAVField('current_address', '现居住地址')}
                  
                  {/* 联系方式 */}
                  {renderEAVField('qq', 'QQ')}
                  {renderEAVField('wechat', '微信')}
                  {renderEAVField('personal_email', '个人邮箱')}
                </div>
              </div>
            )}
          </div>

          {/* 教育经历 */}
          <div>
            <SectionHeader 
              title="教育经历" 
              sectionKey="educations"
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('education_degree')} onClick={() => {
                  setEducations(prev => [
                    ...prev,
                    { id: undefined, userId, school: '', degree: '', major: '', startDate: '', endDate: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.educations && (
              <div className="pl-6 space-y-4 pt-4">
                {educations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无教育经历</p>
                ) : (
                  educations.map((edu, index) => (
                    <div key={edu.id || `edu-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">教育经历 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async () => {
                            await userApi.upsertUserEducation({
                              id: edu.id,
                              userId,
                              school: edu.school,
                              degree: edu.degree,
                              major: edu.major,
                              enrollDate: (edu as {startDate?: string; enrollDate?: string}).startDate || (edu as {enrollDate?: string}).enrollDate,
                              graduateDate: (edu as {endDate?: string; graduateDate?: string}).endDate || (edu as {graduateDate?: string}).graduateDate
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (edu.id) {
                              await userApi.deleteUserEducation(edu.id);
                            }
                            setEducations(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="学历">
                          <Select 
                            value={edu.degree || ''} 
                            onValueChange={v => updateEducation(index, 'degree', v)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="请选择学历" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="大专">大专</SelectItem>
                              <SelectItem value="本科">本科</SelectItem>
                              <SelectItem value="硕士">硕士</SelectItem>
                              <SelectItem value="博士">博士</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                        <FieldGroup label="学校">
                          <Input 
                            value={edu.school || ''} 
                            onChange={e => updateEducation(index, 'school', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="入学日期">
                          <DatePicker 
                            date={edu.enrollDate ? new Date(edu.enrollDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateEducation(index, 'enrollDate', val);
                            }}
                            placeholder="选择入学日期"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="毕业日期">
                          <DatePicker 
                            date={edu.graduateDate ? new Date(edu.graduateDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateEducation(index, 'graduateDate', val);
                            }}
                            placeholder="选择毕业日期"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="所学专业">
                          <Input 
                            value={edu.major || ''} 
                            onChange={e => updateEducation(index, 'major', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="学习形式">
                          <Select 
                            value={edu.studyForm || ''} 
                            onValueChange={v => updateEducation(index, 'studyForm', v)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="请选择学习形式" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="全日制">全日制</SelectItem>
                              <SelectItem value="非全日制">非全日制</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                        <FieldGroup label="学制(年)">
                          <Input 
                            type="number"
                            value={edu.schoolingYears || ''} 
                            onChange={e => updateEducation(index, 'schoolingYears', parseInt(e.target.value) || 0)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="学位">
                          <Input 
                            value={edu.degreeName || ''} 
                            onChange={e => updateEducation(index, 'degreeName', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="学位授予国家">
                          <Input 
                            value={edu.awardingCountry || ''} 
                            onChange={e => updateEducation(index, 'awardingCountry', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="学位授予单位">
                          <Input 
                            value={edu.awardingInstitution || ''} 
                            onChange={e => updateEducation(index, 'awardingInstitution', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="学位授予日期">
                          <DatePicker 
                            date={edu.awardingDate ? new Date(edu.awardingDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateEducation(index, 'awardingDate', val);
                            }}
                            placeholder="选择学位授予日期"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="外语级别">
                          <Input 
                            value={edu.languageLevel || ''} 
                            onChange={e => updateEducation(index, 'languageLevel', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 工作经历 */}
          <div>
            <SectionHeader 
              title="工作经历" 
              sectionKey="workExperiences"
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('workexp_company')} onClick={() => {
                  setWorkExperiences(prev => [
                    ...prev,
                    { id: undefined, userId, company: '', position: '', startDate: '', endDate: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.workExperiences && (
              <div className="pl-6 space-y-4 pt-4">
                {workExperiences.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无工作经历</p>
                ) : (
                  workExperiences.map((work, index) => (
                    <div key={work.id || `work-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">工作经历 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async () => {
                            await userApi.upsertUserWorkExperience({
                              id: work.id,
                              userId,
                              company: work.company,
                              position: work.position,
                              startDate: work.startDate,
                              endDate: work.endDate
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (work.id) {
                              await userApi.deleteUserWorkExperience(work.id);
                            }
                            setWorkExperiences(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="公司">
                          <Input 
                            value={work.company || ''} 
                            onChange={e => updateWorkExperience(index, 'company', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="部门">
                          <Input 
                            value={work.department || ''} 
                            onChange={e => updateWorkExperience(index, 'department', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="职务">
                          <Input 
                            value={work.position || ''} 
                            onChange={e => updateWorkExperience(index, 'position', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="开始时间">
                          <DatePicker 
                            date={work.startDate ? new Date(work.startDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateWorkExperience(index, 'startDate', val);
                            }}
                            placeholder="选择开始时间"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="结束时间">
                          <DatePicker 
                            date={work.endDate ? new Date(work.endDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateWorkExperience(index, 'endDate', val);
                            }}
                            placeholder="选择结束时间"
                            className="h-10"
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 紧急联系人 */}
          <div>
            <SectionHeader 
              title="紧急联系人" 
              sectionKey="emergencyContacts"
              badge={<Badge variant="destructive" className="text-xs">敏感</Badge>}
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('emergency_name')} onClick={() => {
                  setEmergencyContacts(prev => [
                    ...prev,
                    { id: undefined, userId, name: '', relationship: '', phone: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.emergencyContacts && (
              <div className="pl-6 space-y-4 pt-4">
                {emergencyContacts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无紧急联系人</p>
                ) : (
                  emergencyContacts.map((contact, index) => (
                    <div key={contact.id || `contact-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">紧急联系人 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async ()=>{
                            await userApi.upsertUserEmergencyContact({
                              id: contact.id,
                              userId,
                              name: contact.name || '',
                              phone: contact.phone || '',
                              relation: contact.relationship || ''
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async ()=>{
                            if (contact.id) {
                              await userApi.deleteUserEmergencyContact(contact.id);
                            }
                            setEmergencyContacts(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="姓名">
                          <Input 
                            value={contact.name || ''} 
                            onChange={e => updateEmergencyContact(index, 'name', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="关系">
                          <Input 
                            value={contact.relationship || ''} 
                            onChange={e => updateEmergencyContact(index, 'relationship', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="联系电话">
                          <Input 
                            value={contact.phone || ''} 
                            onChange={e => updateEmergencyContact(index, 'phone', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="住址">
                          <Input 
                            value={contact.address || ''} 
                            onChange={e => updateEmergencyContact(index, 'address', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 家庭成员 */}
          <div>
            <SectionHeader 
              title="家庭成员" 
              sectionKey="familyMembers"
              badge={<Badge variant="destructive" className="text-xs">敏感</Badge>}
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('family_name')} onClick={() => {
                  setFamilyMembers(prev => [
                    ...prev,
                    { id: undefined, userId, name: '', relationship: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.familyMembers && (
              <div className="pl-6 space-y-4 pt-4">
                {familyMembers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无家庭成员</p>
                ) : (
                  familyMembers.map((member, index) => (
                    <div key={member.id || `member-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">家庭成员 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async ()=>{
                            await userApi.upsertUserFamilyMember({
                              id: member.id,
                              userId,
                              name: member.name || '',
                              relation: member.relationship || ''
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async ()=>{
                            if (member.id) {
                              await userApi.deleteUserFamilyMember(member.id);
                            }
                            setFamilyMembers(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="姓名">
                          <Input 
                            value={member.name || ''} 
                            onChange={e => updateFamilyMember(index, 'name', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="关系">
                          <Input 
                            value={member.relationship || ''} 
                            onChange={e => updateFamilyMember(index, 'relationship', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="工作单位">
                          <Input 
                            value={member.organization || ''} 
                            onChange={e => updateFamilyMember(index, 'organization', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="联系方式">
                          <Input 
                            value={member.contact || ''} 
                            onChange={e => updateFamilyMember(index, 'contact', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 合同信息 */}
          <div>
            <SectionHeader 
              title="合同信息" 
              sectionKey="contracts"
              badge={<Badge variant="secondary" className="text-xs">内部</Badge>}
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('contract_no')} onClick={() => {
                  setContracts(prev => [
                    ...prev,
                    { id: undefined, userId, contractNo: '', contractType: '', company: '', startDate: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.contracts && (
              <div className="pl-6 space-y-4 pt-4">
                {contracts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无合同信息</p>
                ) : (
                  contracts.map((contract, index) => (
                    <div key={contract.id || `contract-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">合同 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async ()=>{
                            await userApi.upsertUserContract({
                              id: contract.id,
                              userId,
                              contractNo: contract.contractNo,
                              company: contract.company,
                              contractType: contract.contractType,
                              startDate: contract.startDate,
                              endDate: contract.endDate
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async ()=>{
                            if (contract.id) {
                              await userApi.deleteUserContract(contract.id);
                            }
                            setContracts(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="合同编号">
                          <Input 
                            value={contract.contractNo || ''} 
                            onChange={e => updateContract(index, 'contractNo', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="合同公司">
                          <Input 
                            value={contract.company || ''} 
                            onChange={e => updateContract(index, 'company', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="合同类型">
                          <Input 
                            value={contract.contractType || ''} 
                            onChange={e => updateContract(index, 'contractType', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="合同开始时间">
                          <DatePicker 
                            date={contract.startDate ? new Date(contract.startDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateContract(index, 'startDate', val);
                            }}
                            placeholder="选择合同开始时间"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="合同结束时间">
                          <DatePicker 
                            date={contract.endDate ? new Date(contract.endDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateContract(index, 'endDate', val);
                            }}
                            placeholder="选择合同结束时间"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="合同实际结束时间">
                          <DatePicker 
                            date={contract.actualEndDate ? new Date(contract.actualEndDate) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateContract(index, 'actualEndDate', val);
                            }}
                            placeholder="选择实际结束时间"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="合同签订次数">
                          <Input 
                            type="number"
                            value={contract.signedTimes || ''} 
                            onChange={e => updateContract(index, 'signedTimes', parseInt(e.target.value) || 0)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 证件信息 */}
          <div>
            <SectionHeader 
              title="证件信息" 
              sectionKey="documents"
              badge={<Badge variant="destructive" className="text-xs">高度敏感</Badge>}
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('id_type')} onClick={() => {
                  setDocuments(prev => [
                    ...prev,
                    { id: undefined, userId, docType: '', docNumber: '', validUntil: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.documents && (
              <div className="pl-6 space-y-4 pt-4">
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无证件信息</p>
                ) : (
                  documents.map((doc, index) => (
                    <div key={doc.id || `doc-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">证件 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async ()=>{
                            await userApi.upsertUserDocument({
                              id: doc.id,
                              userId,
                              docType: doc.docType || '',
                              docNumber: doc.docNumber || '',
                              validUntil: doc.validUntil || undefined
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async ()=>{
                            if (doc.id) {
                              await userApi.deleteUserDocument(doc.id);
                            }
                            setDocuments(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="证件类型">
                          <Select 
                            value={doc.docType || ''} 
                            onValueChange={v => updateDocument(index, 'docType', v)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="请选择证件类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="身份证">身份证</SelectItem>
                              <SelectItem value="护照">护照</SelectItem>
                              <SelectItem value="港澳居民来往内地通行证">港澳居民来往内地通行证</SelectItem>
                              <SelectItem value="台湾居民来往大陆通行证">台湾居民来往大陆通行证</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                        <FieldGroup label="证件号码">
                          <Input 
                            value={doc.docNumber || ''} 
                            onChange={e => updateDocument(index, 'docNumber', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="有效期至">
                          <DatePicker 
                            date={doc.validUntil ? new Date(doc.validUntil) : undefined}
                            onDateChange={(d) => {
                              const val = d ? d.toISOString().slice(0,10) : '';
                              updateDocument(index, 'validUntil', val);
                            }}
                            placeholder="选择有效期"
                            className="h-10"
                          />
                        </FieldGroup>
                        <FieldGroup label="到期剩余">
                          <Input 
                            value={doc.remainingDays || ''} 
                            onChange={e => updateDocument(index, 'remainingDays', e.target.value)} 
                            className="h-10" 
                            placeholder="自动计算或手动输入"
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 银行账户 */}
          <div>
            <SectionHeader 
              title="银行账户" 
              sectionKey="bankAccounts"
              badge={<Badge variant="destructive" className="text-xs">高度敏感</Badge>}
              actions={
                <Button variant="outline" size="sm" disabled={!isEditable('bank_account_name')} onClick={() => {
                  setBankAccounts(prev => [
                    ...prev,
                    { id: undefined, userId, accountName: '', bankName: '', bankBranch: '', accountNumber: '' }
                  ]);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </Button>
              }
            />
            
            {!collapsedSections.bankAccounts && (
              <div className="pl-6 space-y-4 pt-4">
                {bankAccounts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无银行账户</p>
                ) : (
                  bankAccounts.map((account, index) => (
                    <div key={account.id || `account-${index}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-left">银行账户 {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async ()=>{
                            await userApi.upsertUserBankAccount({
                              id: account.id,
                              userId,
                              accountName: account.accountName,
                              bankName: account.bankName,
                              bankBranch: account.bankBranch,
                              accountNumber: account.accountNumber
                            });
                          }}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async ()=>{
                            if (account.id) {
                              await userApi.deleteUserBankAccount(account.id);
                            }
                            setBankAccounts(prev => prev.filter((_, i) => i !== index));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldGroup label="开户人姓名">
                          <Input 
                            value={account.accountName || ''} 
                            onChange={e => updateBankAccount(index, 'accountName', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="开户支行">
                          <Input 
                            value={account.bankBranch || ''} 
                            onChange={e => updateBankAccount(index, 'bankBranch', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                        <FieldGroup label="银行卡号">
                          <Input 
                            value={account.accountNumber || ''} 
                            onChange={e => updateBankAccount(index, 'accountNumber', e.target.value)} 
                            className="h-10" 
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 资料附件（极敏感） */}
          <div>
            <SectionHeader 
              title="资料附件" 
              sectionKey="attachments"
              badge={<Badge variant="destructive" className="text-xs">高度敏感</Badge>}
              actions={
                <div className="flex items-center gap-2">
                  <Select value={attachmentType} onValueChange={setAttachmentType}>
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTACHMENT_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" disabled={!isEditable('attachments_upload')} onClick={async () => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*,application/pdf';
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    try {
                      // 1) 获取直传URL（后端可能未配置存储，若报错则回退到临时URL方案）
                      const up = await userApi.createAttachmentUploadUrl({ userId, attachmentType, filename: file.name }).catch(() => null);
                      if (up && up.createAttachmentUploadUrl) {
                        const [objectPath, signedUrl] = String(up.createAttachmentUploadUrl).split('|');
                        // 2) 直传到 Storage
                        await fetch(signedUrl, {
                          method: 'PUT',
                          headers: { 'Content-Type': file.type },
                          body: file,
                        });
                        // 3) 登记附件记录（fileUrl先存objectPath，下载用签名URL获取）
                        await userApi.createUserAttachment({
                          userId,
                          attachmentType,
                          filename: file.name,
                          fileUrl: objectPath,
                          mimeType: file.type,
                          fileSize: file.size,
                        });
                        addAttachmentLocal({ id: 'temp-'+Date.now(), filename: file.name, fileUrl: objectPath, attachmentType });
                      } else {
                        // 回退：使用本地URL（仅开发演示）
                        const tempUrl = URL.createObjectURL(file);
                        await userApi.createUserAttachment({
                          userId,
                          attachmentType,
                          filename: file.name,
                          fileUrl: tempUrl,
                          mimeType: file.type,
                          fileSize: file.size,
                        });
                        addAttachmentLocal({ id: 'temp-'+Date.now(), filename: file.name, fileUrl: tempUrl, attachmentType });
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  };
                  input.click();
                }}>
                    <Plus className="h-4 w-4 mr-1" />
                    上传
                  </Button>
                </div>
              }
            />
            {!collapsedSections.attachments && (
              <div className="pl-6 space-y-4 pt-4">
                {attachments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无附件</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((att: AttachmentRef & { filename?: string }) => (
                      <div key={att.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <Button variant="ghost" className="px-0 text-sm underline" onClick={async ()=>{
                          const path = att.attachment?.fileUrl || att.fileUrl;
                          if (!path) return;
                          // 若是objectPath，获取签名下载URL；否则直接打开
                          if (typeof path === 'string' && !path.startsWith('http')) {
                            const res = await userApi.createAttachmentDownloadUrl(path).catch(()=>null);
                            const url = res?.createAttachmentDownloadUrl || '';
                            if (url) window.open(url, '_blank');
                          } else {
                            window.open(path, '_blank');
                          }
                        }}>
                          {(ATTACHMENT_TYPE_OPTIONS.find(o=>o.key===att.attachmentType)?.label || att.attachmentType || '')} · {(att.attachment?.filename || att.filename)}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={async ()=>{
                          if (att.id && !String(att.id).startsWith('temp-')) {
                            await userApi.deleteUserAttachment(att.id);
                          }
                          removeAttachmentLocal(att.id);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}