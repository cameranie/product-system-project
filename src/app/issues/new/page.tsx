'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TagSelector } from '@/components/ui/tag-selector';
import { DatePicker } from '@/components/ui/date-picker';
import { FormField, FormFieldGroup } from '@/components/ui/form-field';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save,
  Send
} from 'lucide-react';
import Image from 'next/image';

// 模拟数据
const mockProjects = [
  { id: '1', name: '项目管理系统', key: 'PMS' },
  { id: '2', name: '用户中心', key: 'UC' },
  { id: '3', name: '数据分析平台', key: 'DAP' },
];

const mockVersions = [
  { id: '1', name: 'v1.0.0', description: '初始版本' },
  { id: '2', name: 'v1.1.0', description: '功能增强' },
  { id: '3', name: 'v2.0.0', description: '重大更新' },
];

const mockRelatedIssues = [
  { id: 'ISS-001', title: '用户登录优化' },
  { id: 'ISS-002', title: '数据导出功能' },
  { id: 'ISS-003', title: '权限管理重构' },
];

const mockUsers = [
  { id: '1', name: '张三', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=zhang', role: '前端开发' },
  { id: '2', name: '李四', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=li', role: '后端开发' },
  { id: '3', name: '王五', avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=wang', role: '产品经理' },
];

const mockDepartments = [
  { id: '1', name: '产品部', color: '#3B82F6' },
  { id: '2', name: '技术部', color: '#10B981' },
  { id: '3', name: '设计部', color: '#F59E0B' },
  { id: '4', name: '运营部', color: '#EF4444' },
];

// 配置对象
const issueTypeConfig = {
  FEATURE: { label: '新功能', color: '#10B981' },
  ENHANCEMENT: { label: '功能增强', color: '#3B82F6' },
  BUG_FIX: { label: 'Bug修复', color: '#EF4444' },
  TECHNICAL_DEBT: { label: '技术债务', color: '#F59E0B' },
  RESEARCH: { label: '技术调研', color: '#8B5CF6' },
};

const priorityConfig = {
  LOW: { label: '低', color: '#6B7280' },
  MEDIUM: { label: '中', color: '#F59E0B' },
  HIGH: { label: '高', color: '#EF4444' },
  URGENT: { label: '紧急', color: '#DC2626' },
};

interface Department {
  id: string;
  name: string;
  color: string;
}

interface IssueFormData {
  title: string;
  projectId: string;
  versionId: string;
  relatedIssueIds: string[];
  description: string;
  assigneeId: string;
  reviewerId: string;
  startDate?: Date;
  endDate?: Date;
  departments: Department[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  issueType: 'FEATURE' | 'ENHANCEMENT' | 'BUG_FIX' | 'TECHNICAL_DEBT' | 'RESEARCH';
}

export default function CreateIssuePage() {
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    projectId: '',
    versionId: '',
    relatedIssueIds: [],
    description: '',
    assigneeId: '',
    reviewerId: '',
    departments: [],
    priority: 'MEDIUM',
    issueType: 'FEATURE',
  });

  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleSave = async (isDraft: boolean = false) => {
    setSaving(true);
    try {
      // 模拟保存逻辑
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('保存Issue:', { ...formData, isDraft });
      // 这里应该调用API保存数据
      alert(isDraft ? '草稿保存成功！' : 'Issue创建成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDepartmentsChange = (departments: Department[]) => {
    setFormData({...formData, departments});
  };

  const getDepartmentValue = (dept: Department) => dept.id;
  const getDepartmentLabel = (dept: Department) => dept.name;
  const createDepartment = (name: string): Department => ({
    id: `dept_${Date.now()}`,
    name,
    color: '#6B7280'
  });

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
              <h1 className="text-xl font-semibold">新建 Issue</h1>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => handleSave(true)}
              disabled={saving}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              保存草稿
            </Button>
            
            <Button 
              onClick={() => handleSave(false)}
              disabled={saving || !formData.title}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {saving ? '提交中...' : '提交Issue'}
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 主要内容区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧主要信息 - 占2列 */}
              <div className="lg:col-span-2">
                <FormFieldGroup>
                  {/* 标题 */}
                  <FormField label="标题" required>
                    <Input
                      placeholder="简洁描述这个Issue"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </FormField>

                  {/* 项目信息行：所属项目、所属版本、Issue类型 */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="所属项目">
                      <Select 
                        value={formData.projectId} 
                        onValueChange={(value) => setFormData({...formData, projectId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择项目" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name} ({project.key})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="所属版本">
                      <Select 
                        value={formData.versionId} 
                        onValueChange={(value) => setFormData({...formData, versionId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择版本" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockVersions.map(version => (
                            <SelectItem key={version.id} value={version.id}>
                              {version.name} - {version.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Issue类型">
                      <Select 
                        value={formData.issueType} 
                        onValueChange={(value) => setFormData({...formData, issueType: value as IssueFormData['issueType']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(issueTypeConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* 相关Issue - 使用TagSelector */}
                  <FormField label="相关 Issue">
                    <TagSelector
                      availableTags={mockRelatedIssues}
                      selectedTags={formData.relatedIssueIds.map(id => mockRelatedIssues.find(issue => issue.id === id)!).filter(Boolean)}
                      onChange={(selected) => setFormData({
                        ...formData, 
                        relatedIssueIds: selected.map(issue => issue.id)
                      })}
                      getValue={(issue) => issue.id}
                      getLabel={(issue) => issue.title}
                      createTag={(inputValue: string) => ({ id: `ISS-${Date.now()}`, title: inputValue })}
                      className="w-full"
                    />
                  </FormField>

                  {/* 描述 - 使用所见即所得编辑器 */}
                  <FormField label="描述">
                    <WysiwygEditor
                      value={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                      placeholder="详细描述需求背景、商业价值、功能规格、用户场景等..."
                      minHeight="300px"
                      showHelpText={false}
                    />
                  </FormField>
                </FormFieldGroup>
              </div>

              {/* 右侧其他信息卡片 - 占1列 */}
              <div className="lg:col-span-1">
                <Card className="border border-border shadow-none py-0">
                  <CardContent className="p-6" style={{ padding: '24px' }}>
                    <FormFieldGroup>
                      {/* 涉及部门 */}
                      <FormField label="涉及部门">
                        <TagSelector
                          availableTags={mockDepartments}
                          selectedTags={formData.departments}
                          onChange={handleDepartmentsChange}
                          getValue={getDepartmentValue}
                          getLabel={getDepartmentLabel}
                          createTag={createDepartment}
                          className="w-full"
                        />
                      </FormField>

                      {/* 执行人 */}
                      <FormField label="执行人 (Assignee)">
                        <Select 
                          value={formData.assigneeId} 
                          onValueChange={(value) => setFormData({...formData, assigneeId: value})}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="选择执行人" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Image src={user.avatar} alt={user.name} width={20} height={20} className="w-5 h-5 rounded-full" />
                                  <span>{user.name}</span>
                                  <span className="text-xs text-muted-foreground">({user.role})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      {/* 审核人 */}
                      <FormField label="审核人 (Reviewer)">
                        <Select 
                          value={formData.reviewerId} 
                          onValueChange={(value) => setFormData({...formData, reviewerId: value})}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="选择审核人" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Image src={user.avatar} alt={user.name} width={20} height={20} className="w-5 h-5 rounded-full" />
                                  <span>{user.name}</span>
                                  <span className="text-xs text-muted-foreground">({user.role})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      {/* 优先级 */}
                      <FormField label="优先级">
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value) => setFormData({...formData, priority: value as IssueFormData['priority']})}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(priorityConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: config.color }}
                                  />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      {/* 预计开始日期 */}
                      <FormField label="预计开始日期">
                        <DatePicker
                          date={formData.startDate}
                          onDateChange={(date) => setFormData({...formData, startDate: date})}
                          placeholder="选择开始日期"
                          className="h-9 text-sm"
                        />
                      </FormField>

                      {/* 预计结束日期 */}
                      <FormField label="预计结束日期">
                        <DatePicker
                          date={formData.endDate}
                          onDateChange={(date) => setFormData({...formData, endDate: date})}
                          placeholder="选择结束日期"
                          className="h-9 text-sm"
                        />
                      </FormField>
                    </FormFieldGroup>
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}