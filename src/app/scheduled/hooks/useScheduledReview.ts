import { useState, useCallback } from 'react';
import { useRequirementsStore, Requirement, mockUsers } from '@/lib/requirements-store';
import { toast } from 'sonner';

/**
 * 预排期评审对话框 Hook
 * 
 * 管理评审对话框的状态和评审提交逻辑
 */
export function useScheduledReview() {
  const { updateRequirement } = useRequirementsStore();

  const [isOpen, setIsOpen] = useState(false);
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [opinion, setOpinion] = useState('');

  // 打开评审对话框
  const open = useCallback((req: Requirement, reviewLevel: number) => {
    setRequirement(req);
    setLevel(reviewLevel);

    // 如果已有评审意见，预填到输入框
    const existingReview = req.scheduledReview?.reviewLevels?.find(
      r => r.level === reviewLevel
    );
    setOpinion(existingReview?.opinion || '');

    setIsOpen(true);
  }, []);

  // 关闭评审对话框
  const close = useCallback(() => {
    setIsOpen(false);
    setOpinion('');
  }, []);

  // 提交评审
  const submit = useCallback(async (status: 'approved' | 'rejected') => {
    if (!requirement || !requirement.scheduledReview) {
      return;
    }

    const updatedReviewLevels = requirement.scheduledReview.reviewLevels.map(
      l => {
        if (l.level === level) {
          return {
            ...l,
            status,
            opinion,
            reviewer: mockUsers[0], // 模拟当前用户
            reviewedAt: new Date().toISOString(),
          };
        }
        return l;
      }
    );

    try {
      await updateRequirement(requirement.id, {
        scheduledReview: {
          ...requirement.scheduledReview,
          reviewLevels: updatedReviewLevels,
        },
      });

      toast.success(
        `${level === 1 ? '一' : '二'}级评审${status === 'approved' ? '通过' : '不通过'}成功`
      );
      close();
    } catch (error) {
      toast.error('评审提交失败');
      console.error(error);
    }
  }, [requirement, level, opinion, updateRequirement, close]);

  return {
    // 状态
    isOpen,
    requirement,
    level,
    opinion,
    
    // 方法
    open,
    close,
    submit,
    setOpinion,
  };
}

