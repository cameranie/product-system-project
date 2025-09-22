'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox'; // 已移除主管可见功能
import { authApi, userApi, visibilityApi, adminApi } from '@/lib/api';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

// 可见性等级的中文映射
const CLASSIFICATION_LABELS = {
  PUBLIC: '公开',
  SENSITIVE: '敏感',
  CONFIDENTIAL: '保密'
} as const;

// 统一旧枚举到三档模型
function normalizeClassification(input?: string): 'PUBLIC' | 'SENSITIVE' | 'CONFIDENTIAL' {
  if (!input) return 'PUBLIC';
  if (input === 'INTERNAL') return 'PUBLIC';
  if (input === 'HIGHLY_SENSITIVE') return 'CONFIDENTIAL';
  if (input === 'PUBLIC' || input === 'SENSITIVE' || input === 'CONFIDENTIAL') return input;
  return 'PUBLIC';
}

// 顶层定义，保持组件类型稳定，避免每次渲染导致子输入控件被卸载而失焦
function FieldGroup({ label, badge, children, required = false }: {
  label: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
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
}

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

  // 组织选择（事业部/部门/负责人）
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; parentId?: string | null; leaderUserIds?: string[] }>>([]);
  const [businessUnitId, setBusinessUnitId] = useState<string>('none');
  const [deptLeader, setDeptLeader] = useState<string | null>(null);
  const [supervisor, setSupervisor] = useState<string>('');

  // EAV 字段值
  const [fieldValues, setFieldValues] = useState<Record<string, string | number | Date | unknown>>({});
  
  // 多明细状态
  type Education = { id?: string; userId?: string; degree?: string; school?: string; enrollDate?: string; graduateDate?: string; major?: string; studyForm?: string; schoolingYears?: number; degreeName?: string; awardingCountry?: string; awardingInstitution?: string; awardingDate?: string; languageLevel?: string };
  type WorkExp = { id?: string; userId?: string; company?: string; department?: string; position?: string; startDate?: string; endDate?: string };
  type EmergencyContact = { id?: string; userId?: string; name?: string; relation?: string; phone?: string; address?: string };
  type FamilyMember = { id?: string; userId?: string; name?: string; relation?: string; organization?: string; contact?: string };
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

  // 字段定义和模块可见性
  const [fieldDefs, setFieldDefs] = useState<Record<string, { classification: string }>>({});
  const [moduleVisibilities] = useState<Record<string, { classification: string; allowManagerVisible: boolean }>>({});
  
  // 分组到字段集的映射
  const GROUP_TO_FIELDSET_MAP = {
    'basicInfo': '企业内展示集',
    'workInfo': '组织信息集', 
    'personalInfo': '个人信息集',
    'educations': '教育经历集',
    'workExperiences': '工作经历集',
    'emergencyContacts': '紧急联系人集（敏感）',
    'familyMembers': '家庭成员集（敏感）',
    'contracts': '合同信息集（敏感）',
    'documents': '证件信息集（极敏感）',
    'bankAccounts': '银行卡信息集（极敏感）',
    'attachments': '资料附件集（极敏感）'
  } as const;

  // 模块到模块键的映射
  const MODULE_KEY_MAP = {
    'educations': 'education',
    'workExperiences': 'work_experience', 
    'emergencyContacts': 'emergency_contacts',
    'familyMembers': 'family_members',
    'contracts': 'contracts',
    'documents': 'documents',
    'bankAccounts': 'bank_accounts',
    'attachments': 'attachments'
  } as const;

  // 折叠状态 - 默认全部收起
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    workInfo: true,
    personalInfo: true,
    educations: true,
    workExperiences: true,
    emergencyContacts: true,
    familyMembers: true,
    contracts: true,
    documents: true,
    bankAccounts: true,
    attachments: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; roles: string[]; permissions?: string[] } | null>(null);
  const [fieldDefsOld, setFieldDefsOld] = useState<Record<string, { label?: string; classification?: string; selfEditable?: boolean }>>({});
  const [onlyEditable, setOnlyEditable] = useState(false);

  // 安全的日期创建函数
  const safeCreateDate = (value: string | Date | null | undefined): Date | undefined => {
    if (!value || value === '') return undefined;
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d : undefined;
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [userRes, keysRes, meRes, defsRes, depsRes] = await Promise.all([
          userApi.getUser(userId),
          visibilityApi.visibleFieldKeys({ resource: 'user', targetUserId: userId }),
          authApi.me(),
          adminApi.fieldDefinitions().catch(() => null),
          adminApi.departments().catch(() => ({ departments: [] })),
        ]);
        
        // 加载可见性配置
        await loadVisibilityConfig();

        const u = userRes.user;
        setForm({
          name: u.name ?? '',
          phone: u.phone ?? '',
          departmentId: u.department?.id ?? 'none',
          isActive: u.isActive ? 'true' : 'false',
          email: u.email ?? '',
        });

        // 部门/事业部初始化
        const depRows = (depsRes as unknown as { departments?: Array<{ id: string; name: string; parentId?: string | null; leaderUserIds?: string[] }> })?.departments || [];
        setDepartments(depRows);
        const currentDeptId: string | undefined = u.department?.id || undefined;
        if (currentDeptId) {
          const currentDept = depRows.find(d => d.id === currentDeptId);
          if (currentDept) {
            if (currentDept.parentId) {
              setBusinessUnitId(currentDept.parentId);
              setForm(prev => ({ ...prev, departmentId: currentDept.id }));
            } else {
              setBusinessUnitId(currentDept.id);
              setForm(prev => ({ ...prev, departmentId: 'none' }));
            }
          }
        }

        // 解析 EAV 字段值
        const fieldValuesMap: Record<string, string | number | Date | unknown> = {};
        (u.fieldValues || []).forEach((fv: { fieldKey: string; valueString?: string; valueNumber?: number; valueDate?: string; valueJson?: unknown }) => {
          const value = fv.valueString ?? fv.valueNumber ?? fv.valueDate ?? fv.valueJson;
          const key = fv.fieldKey === 'direct_supervisor' ? 'reporting_manager' : fv.fieldKey;
          fieldValuesMap[key] = value;
        });
        setFieldValues(fieldValuesMap);

        // 初始化“直属上级”显示值
        const initialSupervisor = (fieldValuesMap['reporting_manager'] as string) || '';
        setSupervisor(typeof initialSupervisor === 'string' ? initialSupervisor : '');

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
          (parsed as Array<{ key: string; label: string; classification: string; selfEditable?: boolean }> | undefined)?.forEach((d: { key: string; label: string; classification: string; selfEditable?: boolean }) => {
            map[d.key] = { label: d.label, classification: d.classification, selfEditable: d.selfEditable };
          });
          setFieldDefsOld(map);
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

  // 根据所选部门/事业部，计算负责人并可一键填充
  useEffect(() => {
    (async () => {
      try {
        if (!departments || departments.length === 0) { setDeptLeader(null); return; }
        const dep = (form.departmentId && form.departmentId !== 'none') ? departments.find(x => x.id === form.departmentId) : undefined;
        const bu = (businessUnitId && businessUnitId !== 'none') ? departments.find(x => x.id === businessUnitId) : undefined;
        let leaderIds: string[] | undefined = dep?.leaderUserIds;
        if (!leaderIds || leaderIds.length === 0) leaderIds = bu?.leaderUserIds;
        if (leaderIds && leaderIds.length > 0) {
          const u = await userApi.getUser(leaderIds[0]).catch(() => null);
          const name = (u && typeof u === 'object' && 'user' in u) ? (u as { user?: { name?: string } }).user?.name ?? null : null;
          setDeptLeader(name);
        } else {
          setDeptLeader(null);
        }
      } catch {
        setDeptLeader(null);
      }
    })();
  }, [form.departmentId, businessUnitId, departments]);

  const isEditable = useCallback((key: string) => {
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');
    const isSelf = currentUser?.id === userId;
    const hasUserUpdate = currentUser?.permissions?.some(p => p.includes('user:update'));
    
    if (isSuperAdmin) return true;
    const selfEditable = ['name', 'contact_phone', 'personal_email', 'address'];
    if (isSelf && selfEditable.includes(key)) return true;
    return hasUserUpdate;
  }, [currentUser, userId]);

  const getFieldSensitivity = useCallback((fieldKey: string): string => {
    const fieldInfo = fieldDefsOld[fieldKey];
    if (fieldInfo?.classification) return normalizeClassification(fieldInfo.classification);
    
    const sensitive = ['base_salary', 'id_number', 'bank_account', 'social_security_number'];
    const internal = ['birthday', 'emergency_contact', 'personal_email'];
    
    if (sensitive.includes(fieldKey)) return 'SENSITIVE';
    if (internal.includes(fieldKey)) return 'PUBLIC';
    return 'PUBLIC';
  }, [fieldDefsOld]);

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

  // 仅当字段可见/可渲染时，才生成网格单元，避免出现“半行空白”
  // 注意：此函数依赖 renderEAVField，需放在其定义之后或通过函数提升处理。
  let renderCell: (fieldKey: string, label: string) => React.ReactNode = () => null;

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

  // 加载字段定义和模块可见性
  const loadVisibilityConfig = useCallback(async () => {
    try {
      // 加载字段定义
      const fieldDefsResponse = await adminApi.fieldDefinitions();
      const fieldDefsMap: Record<string, { classification: string }> = {};
      fieldDefsResponse.fieldDefinitions?.forEach((field: { key: string; classification: string }) => {
        fieldDefsMap[field.key] = {
          classification: field.classification || 'PUBLIC'
        };
      });
      setFieldDefs(fieldDefsMap);

      // 加载模块可见性 (暂时注释掉，等待后端API)
      // const moduleVisResponse = await adminApi.moduleVisibilities();
      // const moduleVisMap: Record<string, { classification: string; allowManagerVisible: boolean }> = {};
      // moduleVisResponse.moduleVisibilities?.forEach((module: any) => {
      //   moduleVisMap[module.moduleKey] = {
      //     classification: module.classification || 'PUBLIC',
      //     allowManagerVisible: module.allowManagerVisible || false
      //   };
      // });
      // setModuleVisibilities(moduleVisMap);
    } catch (error) {
      console.error('Failed to load visibility config:', error);
    }
  }, []);

  // 应用分组可见性
  const applyGroupVisibility = async (sectionKey: string, classification: string) => {
    try {
      const setName = GROUP_TO_FIELDSET_MAP[sectionKey as keyof typeof GROUP_TO_FIELDSET_MAP];
      if (!setName) return;
      
      await adminApi.applyGroupVisibility(setName, classification);
      // 重新加载配置
      await loadVisibilityConfig();
    } catch (error) {
      console.error('Failed to apply group visibility:', error);
    }
  };

  // 更新模块可见性
  const updateModuleVisibility = async (sectionKey: string, classification: string) => {
    try {
      const moduleKey = MODULE_KEY_MAP[sectionKey as keyof typeof MODULE_KEY_MAP];
      if (!moduleKey) return;
      
      await adminApi.upsertModuleVisibility({ moduleKey, classification });
      // 重新加载配置
      await loadVisibilityConfig();
    } catch (error) {
      console.error('Failed to update module visibility:', error);
    }
  };

  // 可见性控件组件
  const VisibilityControls = ({ sectionKey, isModule = false }: { 
    sectionKey: string; 
    isModule?: boolean;
  }) => {
    const currentConfig = isModule 
      ? moduleVisibilities[MODULE_KEY_MAP[sectionKey as keyof typeof MODULE_KEY_MAP] || ''] 
      : null; // 简化：仅展示选择，不读取组级初始值

    const [localClassification, setLocalClassification] = useState(currentConfig?.classification || 'PUBLIC');

    // 当配置更新时同步本地状态
    useEffect(() => {
      if (currentConfig) {
        setLocalClassification(currentConfig.classification);
      }
    }, [currentConfig]);

    const handleApply = async () => {
      if (isModule) {
        await updateModuleVisibility(sectionKey, localClassification);
      } else {
        await applyGroupVisibility(sectionKey, localClassification);
      }
    };

    return (
      <div className="flex items-center gap-2 text-xs">
        <Settings className="h-3 w-3 text-gray-500" />
        <Select value={localClassification} onValueChange={setLocalClassification}>
          <SelectTrigger className="h-7 w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">公开</SelectItem>
            <SelectItem value="CONFIDENTIAL">保密</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleApply}
          className="h-6 px-2 text-xs"
        >
          应用到{isModule ? '模块' : '本组'}
        </Button>
      </div>
    );
  };

  // 看板风格的区域标题组件
  const SectionHeader = ({ title, sectionKey, badge, actions }: {
    title: string;
    sectionKey: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
  }) => {
    const isMultiDetailModule = ['educations', 'workExperiences', 'emergencyContacts', 'familyMembers', 'contracts', 'documents', 'bankAccounts', 'attachments'].includes(sectionKey);
    
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
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
        
        {/* 可见性控件 */}
        <VisibilityControls sectionKey={sectionKey} isModule={isMultiDetailModule} />
      </div>
    );
  };


  // 优化的EAV字段渲染 - 使用日期选择器
  const renderEAVField = useCallback((fieldKey: string, label: string) => {
    if (!visibleKeys.includes(fieldKey)) return null;
    if (onlyEditable && !isEditable(fieldKey)) return null;

    const value = (fieldValues[fieldKey] ?? '') as string | number | Date;
    const sensitivity = getFieldSensitivity(fieldKey);
    const editable = isEditable(fieldKey);
    const classificationLabel = CLASSIFICATION_LABELS[normalizeClassification(sensitivity) as keyof typeof CLASSIFICATION_LABELS];

    // 日期字段使用DatePicker
    if (fieldKey.includes('date') || fieldKey === 'birth_date') {
      const dateValue = safeCreateDate(value as string);
      return (
        <FieldGroup
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
          label={label}
          badge={<Badge variant="secondary" className="text-xs">{classificationLabel}</Badge>}
        >
          <Input
            type="number"
            value={String(value ?? '')}
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
        label={label}
        badge={<Badge variant="secondary" className="text-xs">{classificationLabel}</Badge>}
      >
        <Input
          placeholder={`请输入${label}`}
          value={String(value ?? '')}
          onChange={e => updateFieldValue(fieldKey, e.target.value)}
          disabled={!editable}
          className="h-10"
        />
      </FieldGroup>
    );
  }, [visibleKeys, onlyEditable, fieldValues, updateFieldValue, getFieldSensitivity, isEditable]);

  // 现在绑定 renderCell，确保不触发“使用前定义”问题
  renderCell = useCallback((fieldKey: string, label: string) => {
    const node = renderEAVField(fieldKey, label);
    if (!node) return null;
    return <div key={fieldKey}>{node}</div>;
  }, [renderEAVField]);

  const saveBasicInfo = async () => {
    try {
      setSaving(true);
      setErr(null);

      // 保存基本信息
      const computedDepartmentId = form.departmentId !== 'none'
        ? form.departmentId
        : (businessUnitId !== 'none' ? businessUnitId : undefined);

      const basicData = {
        name: form.name,
        phone: form.phone,
        departmentId: computedDepartmentId,
        isActive: form.isActive === 'true',
      };

      await userApi.updateUser(userId, basicData);

      // 自动同步EAV：事业部/事业部负责人/直属上级
      const buName = (businessUnitId !== 'none') ? (departments.find(d => d.id === businessUnitId)?.name || '') : '';
      const fvToSave: Record<string, unknown> = { ...fieldValues };
      delete (fvToSave as Record<string, unknown>)['direct_supervisor'];
      if (supervisor && typeof supervisor === 'string') fvToSave['reporting_manager'] = supervisor;
      if (buName) fvToSave['business_unit'] = buName;
      if (deptLeader) fvToSave['business_unit_leader'] = deptLeader;

      // 保存EAV字段
      const fieldValueEntries = Object.entries(fvToSave).map(([key, value]) => ({
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
                    badge={<Badge variant="secondary" className="text-xs">{CLASSIFICATION_LABELS[normalizeClassification(getFieldSensitivity('contact_phone')) as keyof typeof CLASSIFICATION_LABELS]}</Badge>}
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

                  {/* 原“所属部门”移动到“工作信息”分组 */}

                  <FieldGroup 
                    label="入职状态"
                    badge={<Badge variant="secondary" className="text-xs">{CLASSIFICATION_LABELS[normalizeClassification(getFieldSensitivity('employment_status')) as keyof typeof CLASSIFICATION_LABELS]}</Badge>}
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
                  {/* 事业部/部门/负责人（选择区） */}
                  <FieldGroup label="所属事业部" badge={<Badge variant="secondary" className="text-xs">公开</Badge>}>
                    <Select value={businessUnitId} onValueChange={(v) => { setBusinessUnitId(v); setForm(prev => ({ ...prev, departmentId: 'none' })); }} disabled={!isEditable('department')}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="请选择事业部" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.filter(d => !d.parentId).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="所属部门" badge={<Badge variant="secondary" className="text-xs">公开</Badge>}>
                    <Select value={form.departmentId} onValueChange={(v) => setForm(prev => ({ ...prev, departmentId: v }))} disabled={!isEditable('department') || businessUnitId === 'none'}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="请选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不选择部门</SelectItem>
                        {departments.filter(d => d.parentId === (businessUnitId !== 'none' ? businessUnitId : null)).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="直属上级（主管）" badge={<Badge variant="secondary" className="text-xs">公开</Badge>}>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="请选择部门后自动带出负责人" 
                        value={supervisor}
                        onChange={() => {}}
                        disabled={form.departmentId === 'none' || !isEditable('department')}
                        className="h-10"
                      />
                      {deptLeader && (
                        <Button variant="outline" size="sm" onClick={() => setSupervisor(deptLeader || '')}>
                          使用部门负责人：{deptLeader}
                        </Button>
                      )}
                    </div>
                  </FieldGroup>

                  {/* 基本工作信息 */}
                  {renderCell('employee_status', '人员状态')}
                  {renderCell('employee_type', '人员类型')}
                  {renderCell('sequence', '序列')}
                  {/* 由上方选择区统一维护：reporting_manager/business_unit/business_unit_leader */}
                  {renderCell('position_title', '职务')}
                  {renderCell('tags', '标签')}
                  
                  {/* 入职相关 */}
                  {renderCell('company_join_date', '加入公司日期')}
                  {renderCell('internship_to_regular_date', '实习转正日期')}
                  {renderCell('join_date', '入职日期')}
                  {renderCell('probation_months', '试用期(月)')}
                  {renderCell('regular_date', '转正日期')}
                  
                  {/* 社保公积金 */}
                  {renderCell('social_security_no', '社保账号')}
                  {renderCell('housing_fund_no', '个人公积金账号')}
                  {renderCell('join_work_status', '入职时社保状况')}
                  
                  {/* 工龄相关 */}
                  {renderCell('first_work_date', '首次参加工作日期')}
                  {renderCell('seniority_calc_date', '工龄计算使用日期')}
                  {renderCell('work_years', '工龄')}
                  {renderCell('company_years', '司龄')}
                  
                  {/* 工作地点信息 */}
                  {renderCell('work_location', '工作地点')}
                  {renderCell('company_name', '所属公司')}
                  {renderCell('onboard_location', '入职办理地点')}
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
                  {renderCell('english_name', '英文名')}
                  {renderCell('gender', '性别')}
                  {renderCell('birth_date', '出生日期')}
                  {renderCell('age', '年龄')}
                  {renderCell('height', '身高(cm)')}
                  {renderCell('weight', '体重(kg)')}
                  {renderCell('blood_type', '血型')}
                  {renderCell('medical_history', '以往病史')}
                  
                  {/* 身份信息 */}
                  {renderCell('id_number', '身份证号码')}
                  {renderCell('nationality', '国籍')}
                  {renderCell('ethnicity', '民族')}
                  {renderCell('political_status', '政治面貌')}
                  {renderCell('birthplace', '籍贯(省市)')}
                  
                  {/* 户籍信息 */}
                  {renderCell('household_type', '户籍类型')}
                  {renderCell('household_province', '户籍-省')}
                  {renderCell('household_city', '户籍-市')}
                  {renderCell('household_address', '户籍(户口所在地)')}
                  {renderCell('id_card_address', '身份证地址')}
                  {renderCell('current_address', '现居住地址')}
                  
                  {/* 联系方式 */}
                  {renderCell('qq', 'QQ')}
                  {renderCell('wechat', '微信')}
                  {renderCell('personal_email', '个人邮箱')}
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
                            date={safeCreateDate(edu.enrollDate)}
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
                            date={safeCreateDate(edu.graduateDate)}
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
                            date={safeCreateDate(edu.awardingDate)}
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
                            date={safeCreateDate(work.startDate)}
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
                            date={safeCreateDate(work.endDate)}
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
                    { id: undefined, userId, name: '', relation: '', phone: '' }
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
                              relation: contact.relation || ''
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
                            value={contact.relation || ''} 
                            onChange={e => updateEmergencyContact(index, 'relation', e.target.value)} 
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
                    { id: undefined, userId, name: '', relation: '' }
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
                              relation: member.relation || ''
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
                            value={member.relation || ''} 
                            onChange={e => updateFamilyMember(index, 'relation', e.target.value)} 
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
              badge={<Badge variant="destructive" className="text-xs">敏感</Badge>}
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
                            date={safeCreateDate(contract.startDate)}
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
                            date={safeCreateDate(contract.endDate)}
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
                            date={safeCreateDate(contract.actualEndDate)}
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
              badge={<Badge variant="destructive" className="text-xs">保密</Badge>}
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
                            date={safeCreateDate(doc.validUntil)}
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
              badge={<Badge variant="destructive" className="text-xs">保密</Badge>}
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
              badge={<Badge variant="destructive" className="text-xs">保密</Badge>}
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