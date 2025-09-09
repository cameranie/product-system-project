'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  Send,
  Upload,
  X
} from 'lucide-react';
import { userApi } from '@/lib/api';
import type { 
  RequirementType, 
  ApplicationPlatform, 
  Priority,
  CreateRequirementInput,
  User
} from '@/types/issue';

// 需求类型配置
const requirementTypeConfig = {
  NEW_FEATURE: { label: '新功能', description: '全新的功能特性' },
  ENHANCEMENT: { label: '功能增强', description: '现有功能的改进优化' },
  BUG: { label: 'Bug修复', description: '系统缺陷和问题修复' },
  OPTIMIZATION: { label: '优化改进', description: '性能优化和体验提升' },
};

// 应用端配置
const platformConfig = {
  WEB: { label: 'Web端', description: '网页版应用' },
  MOBILE: { label: '移动端', description: 'iOS/Android应用' },
  DESKTOP: { label: '桌面端', description: '桌面客户端应用' },
  API: { label: 'API接口', description: '后端接口和服务' },
  ALL: { label: '全端', description: '涉及多个平台' },
};

// 优先级配置
const priorityConfig = {
  LOW: { label: '低', description: '可以延后处理', color: '#6B7280' },
  MEDIUM: { label: '中', description: '正常优先级', color: '#F59E0B' },
  HIGH: { label: '高', description: '需要尽快处理', color: '#EF4444' },
  URGENT: { label: '紧急', description: '立即处理', color: '#DC2626' },
};

interface RequirementFormData {
  title: string;
  description: string;
  type: RequirementType;
  platform: ApplicationPlatform;
  priority: Priority;
  businessValue: string;
  userImpact: string;
  technicalRisk: string;
  attachments: string[];
}

export default function CreateRequirementPage() {
  const [formData, setFormData] = useState<RequirementFormData>({
    title: '',
    description: '',
    type: 'NEW_FEATURE' as RequirementType,
    platform: 'WEB' as ApplicationPlatform,
    priority: 'MEDIUM' as Priority,
    businessValue: '',
    userImpact: '',
    technicalRisk: '',
    attachments: [],
  });

  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载用户数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const usersResponse = await userApi.getUsers();
        setUsers(usersResponse.users.users);
      } catch (error) {
        console.error('Failed to load data:', error);
        alert('加载数据失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => {
    if (window.confirm('确定要离开吗？未保存的内容将丢失。')) {
      window.history.back();
    }
  };

  const handleSave = async (isDraft = false) => {
    if (!formData.title || !formData.description) {
      alert('请填写需求名称和描述');
      return;
    }

    setSaving(true);
    try {
      // 这里应该调用API创建需求
      const requirementData: CreateRequirementInput = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        platform: formData.platform,
        priority: formData.priority,
        businessValue: formData.businessValue || undefined,
        userImpact: formData.userImpact || undefined,
        technicalRisk: formData.technicalRisk || undefined,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
      };

      console.log('创建需求:', requirementData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isDraft) {
        alert('需求草稿保存成功！');
      } else {
        alert('需求提交成功！将转至需求池页面。');
        // 跳转到需求池页面
        window.location.href = '/requirements';
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 添加附件
  const handleAddAttachment = () => {
    const url = prompt('请输入附件链接:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, url.trim()]
      }));
    }
  };

  // 删除附件
  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">加载中...</div>
            <div className="text-sm text-muted-foreground mt-2">正在加载数据</div>
          </div>
        </div>
      </AppLayout>
    );
  }

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
              <h1 className="text-xl font-semibold">提交需求</h1>
              <p className="text-sm text-muted-foreground">
                详细描述您的需求，帮助我们更好地理解和评估
              </p>
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
              disabled={saving || !formData.title || !formData.description}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {saving ? '提交中...' : '提交需求'}
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧主要信息 - 占2列 */}
            <div className="lg:col-span-2">
              <FormFieldGroup>
                {/* 需求名称 */}
                <FormField label="需求名称" required>
                  <Input
                    placeholder="简洁明确地描述需求"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </FormField>

                {/* 第一行：需求类型、应用端 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="需求类型" required>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({...formData, type: value as RequirementType})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(requirementTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span>{config.label}</span>
                              <span className="text-xs text-muted-foreground">{config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="应用端" required>
                    <Select 
                      value={formData.platform} 
                      onValueChange={(value) => setFormData({...formData, platform: value as ApplicationPlatform})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(platformConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span>{config.label}</span>
                              <span className="text-xs text-muted-foreground">{config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* 需求描述 */}
                <FormField label="需求描述" required>
                  <WysiwygEditor
                    value={formData.description}
                    onChange={(value) => setFormData({...formData, description: value})}
                    placeholder="详细描述您的需求，包括：

• 需求背景：为什么需要这个功能？
• 目标用户：主要面向哪些用户？
• 功能描述：期望实现什么功能？
• 使用场景：在什么情况下使用？
• 期望效果：希望达到什么效果？

您也可以附上截图、原型图或参考链接。"
                    minHeight="300px"
                    showHelpText={false}
                  />
                </FormField>

                {/* 商业价值 */}
                <FormField label="商业价值" help="描述这个需求能带来的商业价值和收益">
                  <WysiwygEditor
                    value={formData.businessValue}
                    onChange={(value) => setFormData({...formData, businessValue: value})}
                    placeholder="例如：提升用户满意度、增加收入、降低成本、提高效率等"
                    minHeight="150px"
                    showHelpText={false}
                  />
                </FormField>

                {/* 用户影响 */}
                <FormField label="用户影响" help="描述对用户的影响范围和程度">
                  <WysiwygEditor
                    value={formData.userImpact}
                    onChange={(value) => setFormData({...formData, userImpact: value})}
                    placeholder="例如：影响所有用户、仅影响VIP用户、影响管理员等"
                    minHeight="150px"
                    showHelpText={false}
                  />
                </FormField>

                {/* 技术风险 */}
                <FormField label="技术风险评估" help="如果了解，可以描述可能的技术实现难点">
                  <WysiwygEditor
                    value={formData.technicalRisk}
                    onChange={(value) => setFormData({...formData, technicalRisk: value})}
                    placeholder="例如：涉及第三方系统集成、需要大量数据迁移、可能影响系统性能等"
                    minHeight="150px"
                    showHelpText={false}
                  />
                </FormField>
              </FormFieldGroup>
            </div>

            {/* 右侧信息卡片 - 占1列 */}
            <div className="lg:col-span-1">
              <Card className="border border-border shadow-none py-0">
                <CardContent className="p-6">
                  <FormFieldGroup>
                    {/* 优先级 */}
                    <FormField label="优先级" required>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => setFormData({...formData, priority: value as Priority})}
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
                                <div className="flex flex-col">
                                  <span>{config.label}</span>
                                  <span className="text-xs text-muted-foreground">{config.description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    {/* 附件上传 */}
                    <FormField label="附件链接" help="可以添加截图、文档、原型图等相关资料的链接">
                      <div className="space-y-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={handleAddAttachment}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          添加附件链接
                        </Button>
                        
                        {formData.attachments.length > 0 && (
                          <div className="space-y-2">
                            {formData.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <span className="text-sm flex-1 truncate">{attachment}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAttachment(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormField>

                    {/* 提示信息 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="font-medium text-blue-900 mb-2">💡 提交提示</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• 需求将提交至需求池等待审核</p>
                        <p>• 审核通过后会进入排期流程</p>
                        <p>• 您可以随时查看需求处理进度</p>
                        <p>• 如有疑问可联系产品经理</p>
                      </div>
                    </div>
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
