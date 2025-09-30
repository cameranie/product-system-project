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
export default function RequirementEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { getRequirementById, updateRequirement, loading } = useRequirementsStore();
  
  // 当前用户（模拟）
  const currentUser = mockUsers[0];

  // 解码 URL 中的 ID 并获取需求数据
  const decodedId = decodeURIComponent(id);
  const originalRequirement = getRequirementById(decodedId);

  // 使用自定义表单Hook，传入原始数据进行初始化
  const {
    formData,
    attachments,
    setFormData,
    handleInputChange,
    handleTypeChange,
    handlePlatformChange,
    handleFileUpload,
    handleFileRemove,
    validate,
    setAttachments
  } = useRequirementForm({ initialData: originalRequirement });

  // 组件卸载时清理文件URL
  useEffect(() => {
    return () => {
      import('@/lib/file-upload-utils').then(({ FileURLManager }) => {
        FileURLManager.revokeAllURLs();
      });
    };
  }, []);

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
      router.push(`/requirements/${encodeURIComponent(originalRequirement.id)}`);
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

            {/* 评论 - 使用共享组件 */}
            <CommentSection
              requirementId={originalRequirement.id}
              currentUser={currentUser}
              initialComments={[]}
              onCommentAdded={() => {
                toast.success('评论已添加');
              }}
            />

            {/* 修改记录 - 使用共享组件 */}
            <HistorySection
              records={historyRecords}
              compact={true}
            />
          </div>

          {/* 右侧：附加信息 */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 