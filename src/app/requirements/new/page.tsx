'use client';

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRequirementsStore, mockUsers, type Requirement } from '@/lib/requirements-store';
import { REQUIREMENT_TYPES, PLATFORM_OPTIONS } from '@/config/requirements';
import { 
  ScheduledReviewCard,
  EndOwnerOpinionCard, 
  AttachmentsSection,
  QuickActionsCard
} from '@/components/requirements';
import { useRequirementForm } from '@/hooks/requirements/useRequirementForm';

/**
 * 新建需求页面
 * 
 * 提供表单让用户创建新的需求，包括：
 * - 基本信息（标题、类型、描述、应用端）
 * - 附件上传
 * - 端负责人意见
 * - 预排期评审
 * - 快捷操作
 */
export default function CreateRequirementPage() {
  const router = useRouter();
  const { createRequirement, loading } = useRequirementsStore();
  
  // 使用自定义表单Hook
  const {
    formData,
    attachments,
    setFormData,
    handleInputChange,
    handleTypeChange,
    handlePlatformChange,
    handleFileUpload,
    handleFileRemove,
    validate
  } = useRequirementForm();
  
  // 组件卸载时清理文件URL
  useEffect(() => {
    return () => {
      import('@/lib/file-upload-utils').then(({ FileURLManager }) => {
        FileURLManager.revokeAllURLs();
      });
    };
  }, []);

  /**
   * 处理保存需求
   * 验证表单数据后创建新需求并跳转到详情页
   */
  const handleSave = async () => {
    // 使用 Hook 提供的验证方法
    if (!validate()) {
      return;
    }

    try {
      const { formatDateTime, generateRequirementId } = await import('@/lib/file-upload-utils');
      const now = formatDateTime();

      // 创建新需求
      const newRequirement: Requirement = {
        id: generateRequirementId(),
        title: formData.title,
        type: formData.type,
        description: formData.description,
        status: '待评审',
        isOpen: true,
        creator: mockUsers[0], // 当前用户
        project: { id: '1', name: '默认项目', color: '#3b82f6' },
        createdAt: now,
        updatedAt: now,
        tags: [],
        platforms: formData.platforms,
        attachments: attachments,
        needToDo: formData.endOwnerOpinion.needToDo,
        priority: formData.endOwnerOpinion.priority,
        endOwnerOpinion: formData.endOwnerOpinion,
        scheduledReview: formData.scheduledReview,
        prototypeId: formData.quickActions.prototypeId,
        prdId: formData.quickActions.prdId
      };

      createRequirement(newRequirement);
      toast.success('需求创建成功');
      router.push(`/requirements/${encodeURIComponent(newRequirement.id)}`);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">新建需求</h1>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            提交需求
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">需求标题 <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="请输入需求标题"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                {/* 需求类型 */}
                <div className="space-y-2">
                  <Label>需求类型</Label>
                  <div className="flex flex-wrap gap-4">
                    {REQUIREMENT_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={formData.type === type}
                          onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 应用端 */}
                <div className="space-y-2">
                  <Label>应用端</Label>
                  <div className="flex flex-wrap gap-4">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={`platform-${platform}`}
                          checked={formData.platforms.includes(platform)}
                          onCheckedChange={(checked) => handlePlatformChange(platform, !!checked)}
                        />
                        <Label htmlFor={`platform-${platform}`} className="text-sm font-normal cursor-pointer">
                          {platform}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 需求描述 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">需求描述 <span className="text-red-500">*</span></CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="请详细描述需求内容、目标和预期效果..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>

            {/* 附件 - 使用共享组件 */}
            <AttachmentsSection
              attachments={attachments}
              onUpload={handleFileUpload}
              onRemove={handleFileRemove}
              editable={true}
            />
          </div>

          {/* 右侧：附加信息 */}
          <div className="space-y-6">
            {/* 端负责人意见 - 使用共享组件 */}
            <EndOwnerOpinionCard
              opinion={formData.endOwnerOpinion}
              availableOwners={mockUsers}
              currentUser={mockUsers[0]}
              editable={true}
              onChange={(opinion) => setFormData(prev => ({ ...prev, endOwnerOpinion: opinion }))}
            />

            {/* 预排期评审 - 使用共享组件 */}
            <ScheduledReviewCard
              initialLevels={formData.scheduledReview.reviewLevels}
              availableReviewers={mockUsers}
              currentUser={mockUsers[0]}
              editable={true}
              onChange={(levels) => setFormData(prev => ({
                ...prev,
                scheduledReview: { reviewLevels: levels }
              }))}
            />

            {/* 快捷操作 - 使用共享组件 */}
            <QuickActionsCard
              requirementId="新建中"
              requirementTitle={formData.title || '未命名需求'}
              actions={formData.quickActions}
              editable={true}
              onChange={(actions) => setFormData(prev => ({ ...prev, quickActions: actions }))}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
