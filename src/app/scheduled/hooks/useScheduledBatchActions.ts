import { useCallback } from 'react';
import { useRequirementsStore } from '@/lib/requirements-store';
import { executeSyncBatchOperationWithProgress } from '@/lib/batch-operations-ui';
import { toast } from 'sonner';

/**
 * 预排期批量操作 Hook
 * 
 * 处理批量分配版本、批量评审、批量设置运营等操作
 */
export function useScheduledBatchActions(selectedIds: string[]) {
  const { updateRequirement } = useRequirementsStore();
  const allRequirements = useRequirementsStore(state => state.requirements);

  // 批量分配版本
  const assignVersion = useCallback((version: string) => {
    if (selectedIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    if (!version) {
      toast.error('请选择版本');
      return;
    }

    executeSyncBatchOperationWithProgress(
      selectedIds,
      (id) => {
        updateRequirement(id, { plannedVersion: version });
      },
      {
        operationName: `批量分配版本到 ${version}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }, [selectedIds, updateRequirement]);

  // 批量评审
  const review = useCallback((level: number, status: 'approved' | 'rejected') => {
    if (selectedIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const levelName = level === 1 ? '一' : '二';
    const statusText = status === 'approved' ? '通过' : '不通过';

    executeSyncBatchOperationWithProgress(
      selectedIds,
      (id) => {
        const requirement = allRequirements.find(r => r.id === id);
        if (!requirement || !requirement.scheduledReview) {
          throw new Error('需求未找到或未配置评审流程');
        }

        const updatedReviewLevels = requirement.scheduledReview.reviewLevels.map(l => {
          if (l.level === level) {
            return {
              ...l,
              status,
              reviewedAt: new Date().toISOString(),
            };
          }
          return l;
        });

        updateRequirement(id, {
          scheduledReview: {
            ...requirement.scheduledReview,
            reviewLevels: updatedReviewLevels,
          },
        });
      },
      {
        operationName: `批量${levelName}级评审${statusText}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }, [selectedIds, allRequirements, updateRequirement]);

  // 批量设置是否运营
  const setOperational = useCallback((value: 'yes' | 'no') => {
    if (selectedIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const labelMap = {
      'yes': '是',
      'no': '否'
    };

    executeSyncBatchOperationWithProgress(
      selectedIds,
      (id) => {
        updateRequirement(id, { isOperational: value });
      },
      {
        operationName: `批量设置是否运营为 ${labelMap[value]}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }, [selectedIds, updateRequirement]);

  return {
    assignVersion,
    review,
    setOperational,
  };
}

