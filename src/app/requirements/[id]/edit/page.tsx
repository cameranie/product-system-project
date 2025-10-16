'use client';

import React, { useEffect } from 'react';
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
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useRequirementsStore, mockUsers, type User } from '@/lib/requirements-store';
import { REQUIREMENT_TYPES, PLATFORM_OPTIONS } from '@/config/requirements';
import {
  CommentSection,
  ScheduledReviewCard,
  EndOwnerOpinionCard,
  AttachmentsSection,
  HistorySection,
  QuickActionsCard,
  type HistoryRecord
} from '@/components/requirements';
import { useRequirementForm } from '@/hooks/requirements/useRequirementForm';
import { ErrorBoundary } from '@/components/error-boundary';
import { validateRequirementId, validateFromParam } from '@/lib/validation-utils';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionDenied } from '@/components/PermissionDenied';

/**
 * 需求编辑页面
 * 
 * 允许用户修改已存在的需求信息，包括：
 * - 基本信息
 * - 附件管理
 * - 端负责人意见
 * - 预排期评审
 * - 快捷操作
 * - 评论和历史记录
 */
export default function RequirementEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEditRequirement, hasPermission } = usePermissions();
  
  // 验证URL参数
  const rawFromSource = searchParams?.get('from');
  const fromSource = validateFromParam(rawFromSource);
  
  // 使用selector只订阅需要的数据，优化性能
  const validatedId = validateRequirementId(id);
  const originalRequirement = useRequirementsStore(
    state => validatedId ? state.requirements.find(req => req.id === validatedId) : undefined
  );
  const updateRequirement = useRequirementsStore(state => state.updateRequirement);
  const loading = useRequirementsStore(state => state.loading);
  
  // 当前用户（模拟）
  const currentUser = mockUsers[0];

  // 使用自定义表单Hook，传入原始数据进行初始化
  const {
    formData,
    attachments,
    setFormData,
    handleInputChange,
    handleTypeChange,
    handlePlatformChange,
    setAttachments,
    validate
  } = useRequirementForm({ initialData: originalRequirement });

  // 当需求ID变化时，更新表单数据
  // 
  // 为什么只依赖ID而不依赖updatedAt？
  // 场景：用户A正在编辑需求，用户B同时也更新了这个需求
  // - 如果依赖updatedAt，用户A的输入会被用户B的更新覆盖
  // - 只依赖ID，用户A可以继续编辑，保存时会触发版本冲突检测
  // - 这样既保护了用户输入，又通过冲突检测保证了数据一致性
  // 
  // 何时会触发此effect？
  // - 首次加载页面
  // - 用户在编辑页切换到另一个需求
  useEffect(() => {
    if (!originalRequirement) return;
    
    setFormData({
      title: originalRequirement.title,
      type: originalRequirement.type,
      description: originalRequirement.description,
      platforms: originalRequirement.platforms || [],
      endOwnerOpinion: originalRequirement.endOwnerOpinion || {
        needToDo: undefined,
        priority: undefined,
        opinion: '',
        owner: undefined
      },
      scheduledReview: {
        reviewLevels: originalRequirement.scheduledReview?.reviewLevels || []
      },
      quickActions: {
        prototypeId: originalRequirement.prototypeId || '',
        prdId: originalRequirement.prdId || '',
        uiDesignId: '',
        bugTrackingId: ''
      }
    });
    setAttachments(originalRequirement.attachments || []);
  }, [originalRequirement?.id]); // 只依赖ID，不依赖updatedAt

  // 组件卸载时清理文件URL
  useEffect(() => {
    return () => {
      import('@/lib/file-upload-utils').then(({ FileURLManager }) => {
        FileURLManager.revokeAllURLs();
      });
    };
  }, []);

  // 验证ID和权限
  useEffect(() => {
    if (!validatedId) {
      toast.error('无效的需求ID');
      router.push('/requirements');
      return;
    }
    
    if (originalRequirement && !canEditRequirement(originalRequirement)) {
      toast.error('您没有权限编辑此需求');
      router.push(`/requirements/${encodeURIComponent(validatedId)}`);
    }
  }, [validatedId, originalRequirement, canEditRequirement, router]);

  // 权限检查（基础查看权限）
  if (!hasPermission('requirement:view')) {
    return <PermissionDenied />;
  }

  // 权限检查（编辑权限）
  if (originalRequirement && !canEditRequirement(originalRequirement)) {
    return <PermissionDenied />;
  }

  // 模拟历史记录数据
  const historyRecords: HistoryRecord[] = [
    {
      id: '1',
      action: '创建',
      field: '需求',
      oldValue: '',
      newValue: '创建了需求',
      user: mockUsers[0],
      timestamp: originalRequirement?.createdAt || '2024-01-15 10:30'
    },
    {
      id: '2',
      action: '修改',
      field: '优先级',
      oldValue: '中',
      newValue: '高',
      user: mockUsers[1],
      timestamp: originalRequirement?.updatedAt || '2024-01-16 14:20'
    }
  ];

  /**
   * 处理保存需求
   * 验证表单数据后更新需求并跳转回详情页
   */
  const handleSave = async () => {
    if (!originalRequirement) {
      toast.error('需求不存在');
      return;
    }

    // 使用 Hook 提供的验证方法
    if (!validate()) {
      return;
    }

    try {
      const { formatDateTime } = await import('@/lib/file-upload-utils');
      const now = formatDateTime();

      // 更新需求
      await updateRequirement(originalRequirement.id, {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        updatedAt: now,
        platforms: formData.platforms,
        attachments: attachments,
        needToDo: formData.endOwnerOpinion.needToDo,
        priority: formData.endOwnerOpinion.priority,
        endOwnerOpinion: formData.endOwnerOpinion,
        scheduledReview: formData.scheduledReview,
        prototypeId: formData.quickActions.prototypeId,
        prdId: formData.quickActions.prdId
      });

      toast.success('需求更新成功');
      const detailUrl = `/requirements/${encodeURIComponent(originalRequirement.id)}${fromSource ? `?from=${fromSource}` : ''}`;
      router.push(detailUrl);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  if (loading || !originalRequirement) {
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
          <div>
            <h1 className="text-2xl font-bold">编辑需求</h1>
            <p className="text-sm text-muted-foreground mt-1">
              创建时间: {originalRequirement.createdAt} by {originalRequirement.creator?.name || '未知用户'}
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            保存需求
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
                currentUser={currentUser}
                editable={true}
                onChange={(opinion) => setFormData(prev => ({ ...prev, endOwnerOpinion: opinion }))}
              />

              {/* 预排期评审 - 使用共享组件 */}
              <ScheduledReviewCard
                initialLevels={formData.scheduledReview.reviewLevels}
                availableReviewers={mockUsers}
                currentUser={currentUser}
                editable={true}
                onChange={(levels) => setFormData(prev => ({
                  ...prev,
                  scheduledReview: { reviewLevels: levels }
                }))}
              />

              {/* 快捷操作 - 使用共享组件 */}
              <QuickActionsCard
                requirementId={originalRequirement.id}
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

          {/* 评论 - 使用共享组件 */}
          <CommentSection
            requirementId={originalRequirement.id}
            currentUser={currentUser}
            initialComments={originalRequirement.comments || []}
            onCommentsChange={(comments) => {
              updateRequirement(originalRequirement.id, { comments });
            }}
          />

          {/* 修改记录 - 使用共享组件 */}
          <HistorySection
            records={historyRecords}
            compact={true}
          />
        </CollapsibleSidebar>
      </div>
    </AppLayout>
    </ErrorBoundary>
  );
} 