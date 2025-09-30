'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRequirementsStore, mockUsers, type User, type Requirement } from '@/lib/requirements-store';
import { REQUIREMENT_TYPE_CONFIG } from '@/config/requirements';
import {
  CommentSection,
  ScheduledReviewCard,
  EndOwnerOpinionCard,
  AttachmentsSection,
  HistorySection,
  QuickActionsCard,
  type EndOwnerOpinionData,
  type QuickActionsData,
  type HistoryRecord
} from '@/components/requirements';
import type { ScheduledReviewLevel } from '@/hooks/requirements/useScheduledReview';

export default function RequirementDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { getRequirementById, updateRequirement } = useRequirementsStore();
  const [isToggling, setIsToggling] = useState(false);

  // 当前用户（模拟）
  const currentUser = mockUsers[0];

  // 解码 URL 中的 ID
  const decodedId = decodeURIComponent(id);
  const requirement = getRequirementById(decodedId);

  useEffect(() => {
    if (!requirement) {
      toast.error('需求不存在');
      router.push('/requirements');
    }
  }, [requirement, router]);

  // 模拟历史记录数据
  const historyRecords: HistoryRecord[] = [
    {
      id: '1',
      action: '创建',
      field: '需求',
      oldValue: '',
      newValue: '创建了需求',
      user: mockUsers[0],
      timestamp: requirement?.createdAt || '2024-01-15 10:30'
    },
    {
      id: '2',
      action: '修改',
      field: '优先级',
      oldValue: '中',
      newValue: '高',
      user: mockUsers[1],
      timestamp: requirement?.updatedAt || '2024-01-16 14:20'
    }
  ];

  // 处理状态切换
  const handleToggleStatus = async () => {
    if (!requirement) return;
    
    setIsToggling(true);
    try {
      const newStatus = requirement.isOpen ? '已关闭' : '待评审';
      const newIsOpen = !requirement.isOpen;
      
      await updateRequirement(requirement.id, {
        isOpen: newIsOpen,
        status: newStatus
      });
      
      toast.success(newIsOpen ? '需求已重启' : '需求已关闭');
    } catch (error) {
      console.error('切换状态失败:', error);
      toast.error('操作失败，请重试');
    } finally {
      setIsToggling(false);
    }
  };

  // 处理端负责人意见更新
  const handleEndOwnerOpinionChange = async (opinion: EndOwnerOpinionData) => {
    if (!requirement) return;
    
    try {
      await updateRequirement(requirement.id, {
        endOwnerOpinion: opinion,
        needToDo: opinion.needToDo,
        priority: opinion.priority
      });
      
      toast.success('端负责人意见已更新');
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  // 处理预排期评审更新
  const handleScheduledReviewChange = async (levels: ScheduledReviewLevel[]) => {
    if (!requirement) return;
    
    try {
      await updateRequirement(requirement.id, {
        scheduledReview: { reviewLevels: levels }
      });
      
      toast.success('预排期评审已更新');
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  // 处理快捷操作更新
  const handleQuickActionsChange = async (actions: QuickActionsData) => {
    if (!requirement) return;
    
    try {
      await updateRequirement(requirement.id, {
        prototypeId: actions.prototypeId,
        prdId: actions.prdId
      });
      
      toast.success('快捷操作已更新');
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  if (!requirement) {
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

  const requirementTypeConfig = REQUIREMENT_TYPE_CONFIG[requirement.type as keyof typeof REQUIREMENT_TYPE_CONFIG];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{requirement.title}</h1>
              <Badge variant={requirement.isOpen ? 'default' : 'secondary'} className="text-xs">
                {requirement.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {requirement.createdAt} by {requirement.creator?.name || '未知用户'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {requirement.isOpen && (
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                disabled={isToggling}
              >
                {isToggling ? '处理中...' : '关闭需求'}
              </Button>
            )}
            {!requirement.isOpen && (
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                disabled={isToggling}
              >
                {isToggling ? '处理中...' : '重启需求'}
              </Button>
            )}
            <Button onClick={() => router.push(`/requirements/${encodeURIComponent(requirement.id)}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-24">需求类型</span>
                  <span className="text-sm">{requirement.type}</span>
                </div>
                {requirement.platforms && requirement.platforms.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-24">应用端</span>
                    <div className="flex flex-wrap gap-1">
                      {requirement.platforms.map((platform: string) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 需求描述 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">需求描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{requirement.description}</p>
              </CardContent>
            </Card>

            {/* 附件 - 使用共享组件 */}
            <AttachmentsSection
              attachments={requirement.attachments || []}
              onUpload={async () => {}}
              onRemove={async () => {}}
              editable={false}
            />

            {/* 评论 - 使用共享组件 */}
            <CommentSection
              requirementId={requirement.id}
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
              opinion={requirement.endOwnerOpinion || {}}
              availableOwners={mockUsers}
              currentUser={currentUser}
              editable={true}
              onChange={handleEndOwnerOpinionChange}
            />

            {/* 预排期评审 - 使用共享组件 */}
            <ScheduledReviewCard
              initialLevels={requirement.scheduledReview?.reviewLevels || []}
              availableReviewers={mockUsers}
              currentUser={currentUser}
              editable={true}
              onChange={handleScheduledReviewChange}
            />

            {/* 快捷操作 - 使用共享组件 */}
            <QuickActionsCard
              requirementId={requirement.id}
              requirementTitle={requirement.title}
              actions={{
                prototypeId: requirement.prototypeId || '',
                prdId: requirement.prdId || '',
                uiDesignId: '',
                bugTrackingId: ''
              }}
              editable={true}
              onChange={handleQuickActionsChange}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
