'use client';

import React, { useEffect, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { CollapsibleSidebar } from '@/components/layout/collapsible-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor, getPlainTextFromHtml } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequirementsStore, mockUsers, type Requirement } from '@/lib/requirements-store';
import { REQUIREMENT_TYPES, PLATFORM_OPTIONS } from '@/config/requirements';
import { 
  ScheduledReviewCard,
  EndOwnerOpinionCard, 
  AttachmentsSection,
  QuickActionsCard
} from '@/components/requirements';
import { useRequirementForm } from '@/hooks/requirements/useRequirementForm';
import { ErrorBoundary } from '@/components/error-boundary';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionDenied } from '@/components/PermissionDenied';

import type { RequirementNewPageProps } from '@/types/page-props';

/**
 * 新建需求页面内部组件
 * 
 * 提供表单让用户创建新的需求，包括：
 * - 基本信息（标题、类型、描述、应用端）
 * - 附件上传
 * - 端负责人意见
 * - 预排期评审
 * - 快捷操作
 * 
 * 权限控制：
 * - 需要requirement:create权限
 * 
 * 表单验证：
 * - 标题：必填，1-200字符
 * - 描述：必填，1-5000字符
 * - XSS防护：自动清理危险字符
 * - URL验证：快捷操作链接需要有效URL
 */
function CreateRequirementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createRequirement, loading } = useRequirementsStore();
  const { hasPermission } = usePermissions();
  
  // 使用自定义表单Hook（必须在条件检查之前）
  const {
    formData,
    attachments,
    setFormData,
    handleInputChange,
    handleTypeChange,
    handlePlatformChange,
    setAttachments,
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

  // 权限检查
  if (!hasPermission('requirement:create')) {
    return <PermissionDenied />;
  }

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
      const { formatDateTime } = await import('@/lib/common-utils');
      const now = formatDateTime();

      // 创建新需求数据（不包含 id, createdAt, updatedAt，这些由 store 生成）
      const requirementData = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        status: '待评审' as const,
        isOpen: true,
        creator: mockUsers[0], // 当前用户
        project: { id: '1', name: '默认项目', color: '#3b82f6' },
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

      // 调用 createRequirement 并等待返回，获取真实的需求对象（包含 store 生成的 ID）
      const createdRequirement = await createRequirement(requirementData);
      
      toast.success('需求创建成功');
      
      // 使用 store 返回的 ID 跳转到详情页
      router.push(`/requirements/${encodeURIComponent(createdRequirement.id)}`);
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
    <ErrorBoundary>
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

        <CollapsibleSidebar
          sidebarTitle="需求附加信息"
          sidebar={
            <>
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
            </>
          }
        >
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

          {/* 需求描述 + 附件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">需求描述 <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                placeholder="请详细描述需求内容、目标和预期效果..."
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                showAttachments={true}
              />
            </CardContent>
          </Card>
        </CollapsibleSidebar>
      </div>
    </AppLayout>
    </ErrorBoundary>
  );
}

/**
 * 新建需求页面
 * 使用 Suspense 包裹以支持 useSearchParams()
 */
export default function CreateRequirementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateRequirementPageContent />
    </Suspense>
  );
}
