import { useState, useCallback } from 'react';
import type { User } from '@/lib/requirements-store';

/**
 * 评审级别接口
 */
export interface ScheduledReviewLevel {
  id: string;
  level: number;
  levelName: string;
  reviewer?: User;
  status: 'pending' | 'approved' | 'rejected';
  opinion?: string;
}

/**
 * Hook 配置选项
 */
interface UseScheduledReviewOptions {
  initialLevels?: ScheduledReviewLevel[];
  onChange?: (levels: ScheduledReviewLevel[]) => void;
}

/**
 * 预排期评审管理 Hook
 * 
 * 功能：
 * - 评审级别管理
 * - 添加/删除评审级别
 * - 更新评审信息
 * - 评审人选择
 * 
 * @example
 * const { reviewLevels, addReviewLevel, removeReviewLevel, updateReviewLevel } = 
 *   useScheduledReview({ initialLevels: mockLevels });
 */
export function useScheduledReview({
  initialLevels = [],
  onChange
}: UseScheduledReviewOptions = {}) {
  const [reviewLevels, setReviewLevels] = useState<ScheduledReviewLevel[]>(initialLevels);

  /**
   * 添加评审级别
   */
  const addReviewLevel = useCallback(() => {
    const newLevel: ScheduledReviewLevel = {
      id: Date.now().toString(),
      level: reviewLevels.length + 1,
      levelName: `${reviewLevels.length + 1}级评审`,
      status: 'pending'
    };
    
    const updatedLevels = [...reviewLevels, newLevel];
    setReviewLevels(updatedLevels);
    onChange?.(updatedLevels);
  }, [reviewLevels, onChange]);

  /**
   * 删除评审级别
   */
  const removeReviewLevel = useCallback((id: string) => {
    const updatedLevels = reviewLevels
      .filter(level => level.id !== id)
      .map((level, index) => ({
        ...level,
        level: index + 1,
        levelName: `${index + 1}级评审`
      }));
    
    setReviewLevels(updatedLevels);
    onChange?.(updatedLevels);
  }, [reviewLevels, onChange]);

  /**
   * 更新评审级别
   */
  const updateReviewLevel = useCallback((
    id: string, 
    updates: Partial<ScheduledReviewLevel>
  ) => {
    const updatedLevels = reviewLevels.map(level =>
      level.id === id ? { ...level, ...updates } : level
    );
    
    setReviewLevels(updatedLevels);
    onChange?.(updatedLevels);
  }, [reviewLevels, onChange]);

  /**
   * 更新评审人
   */
  const updateReviewer = useCallback((id: string, reviewer: User) => {
    updateReviewLevel(id, { reviewer });
  }, [updateReviewLevel]);

  /**
   * 更新评审状态
   */
  const updateReviewStatus = useCallback((
    id: string, 
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    updateReviewLevel(id, { status });
  }, [updateReviewLevel]);

  /**
   * 更新评审意见
   */
  const updateReviewOpinion = useCallback((id: string, opinion: string) => {
    updateReviewLevel(id, { opinion });
  }, [updateReviewLevel]);

  /**
   * 重置所有评审级别
   */
  const resetReviewLevels = useCallback((levels: ScheduledReviewLevel[]) => {
    setReviewLevels(levels);
    onChange?.(levels);
  }, [onChange]);

  return {
    reviewLevels,
    addReviewLevel,
    removeReviewLevel,
    updateReviewLevel,
    updateReviewer,
    updateReviewStatus,
    updateReviewOpinion,
    resetReviewLevels
  };
} 