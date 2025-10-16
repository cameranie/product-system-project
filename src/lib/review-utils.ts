/**
 * 评审状态管理工具库
 * 
 * P2 代码质量优化：抽取重复的评审状态更新代码
 * 
 * 提供统一的评审状态计算和更新函数，避免代码重复
 * 
 * @module review-utils
 */

import { Requirement } from '@/lib/requirements-store';

/**
 * 评审状态类型
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * 评审级别信息
 */
export interface ReviewLevelInfo {
  level: number;
  reviewer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: ReviewStatus;
  opinion: string;
  reviewedAt?: string;
}

/**
 * 获取需求的某个评审级别信息
 * 
 * P2: 抽取重复代码为公共函数
 * 
 * @param requirement - 需求对象
 * @param level - 评审级别（1 或 2）
 * @returns 评审级别信息，如果不存在则返回 null
 */
export function getReviewLevelInfo(
  requirement: Requirement,
  level: number
): ReviewLevelInfo | null {
  const reviewLevel = requirement.scheduledReview?.reviewLevels?.find(
    (l) => l.level === level
  );

  if (!reviewLevel) {
    return null;
  }

  return {
    level: reviewLevel.level,
    reviewer: reviewLevel.reviewer,
    status: reviewLevel.status || 'pending',
    opinion: reviewLevel.opinion || '',
    reviewedAt: reviewLevel.reviewedAt,
  };
}

/**
 * 计算总评审状态
 * 
 * P2: 抽取重复代码为公共函数
 * 
 * 根据一级和二级评审状态，计算总体评审进度：
 * - 一级待评审 -> 'pending'
 * - 一级不通过 -> 'level1_rejected'
 * - 一级通过，二级待评审 -> 'level1_approved'
 * - 二级不通过 -> 'level2_rejected'
 * - 二级通过 -> 'approved'
 * 
 * @param requirement - 需求对象
 * @returns 总评审状态字符串
 */
export function getOverallReviewStatus(requirement: Requirement): string {
  const level1Info = getReviewLevelInfo(requirement, 1);
  const level2Info = getReviewLevelInfo(requirement, 2);

  // 如果没有评审配置，返回待一级评审
  if (!level1Info) {
    return 'pending';
  }

  // 一级评审状态
  if (level1Info.status === 'rejected') {
    return 'level1_rejected';
  }

  if (level1Info.status === 'pending') {
    return 'pending';
  }

  // 一级通过，检查二级
  if (!level2Info) {
    return 'level1_approved';
  }

  // 二级评审状态
  if (level2Info.status === 'rejected') {
    return 'level2_rejected';
  }

  if (level2Info.status === 'pending') {
    return 'level1_approved'; // 待二级评审
  }

  // 二级通过
  return 'approved';
}

/**
 * 更新评审级别的状态
 * 
 * P2: 抽取重复代码为公共函数
 * 
 * @param requirement - 需求对象
 * @param level - 评审级别（1 或 2）
 * @param status - 新的评审状态
 * @param opinion - 评审意见（可选）
 * @returns 更新后的需求对象（部分字段）
 */
export function updateReviewLevelStatus(
  requirement: Requirement,
  level: number,
  status: ReviewStatus,
  opinion?: string
): Partial<Requirement> {
  if (!requirement.scheduledReview) {
    console.warn('Requirement does not have scheduled review:', requirement.id);
    return {};
  }

  // 更新指定级别的评审状态
  const updatedLevels = requirement.scheduledReview.reviewLevels.map((l) => {
    if (l.level === level) {
      return {
        ...l,
        status,
        opinion: opinion !== undefined ? opinion : l.opinion,
        reviewedAt: new Date().toISOString(),
      };
    }
    return l;
  });

  return {
    scheduledReview: {
      ...requirement.scheduledReview,
      reviewLevels: updatedLevels,
    },
  };
}

/**
 * 更新评审级别的意见
 * 
 * P2: 抽取重复代码为公共函数
 * 
 * @param requirement - 需求对象
 * @param level - 评审级别（1 或 2）
 * @param opinion - 评审意见
 * @returns 更新后的需求对象（部分字段）
 */
export function updateReviewLevelOpinion(
  requirement: Requirement,
  level: number,
  opinion: string
): Partial<Requirement> {
  if (!requirement.scheduledReview) {
    console.warn('Requirement does not have scheduled review:', requirement.id);
    return {};
  }

  // 更新指定级别的评审意见
  const updatedLevels = requirement.scheduledReview.reviewLevels.map((l) => {
    if (l.level === level) {
      return {
        ...l,
        opinion,
      };
    }
    return l;
  });

  return {
    scheduledReview: {
      ...requirement.scheduledReview,
      reviewLevels: updatedLevels,
    },
  };
}

/**
 * 批量更新评审状态
 * 
 * P2: 统一批量操作逻辑
 * 
 * @param requirements - 需求数组
 * @param level - 评审级别（1 或 2）
 * @param status - 新的评审状态
 * @returns 更新后的需求数组（包含 ID 和更新字段）
 */
export function batchUpdateReviewStatus(
  requirements: Requirement[],
  level: number,
  status: ReviewStatus
): Array<{ id: string; updates: Partial<Requirement> }> {
  return requirements.map((requirement) => ({
    id: requirement.id,
    updates: updateReviewLevelStatus(requirement, level, status),
  }));
}

/**
 * 验证评审状态转换是否合法
 * 
 * P1: 添加状态转换验证
 * 
 * @param currentStatus - 当前状态
 * @param newStatus - 新状态
 * @returns 是否允许转换
 */
export function isValidStatusTransition(
  currentStatus: ReviewStatus,
  newStatus: ReviewStatus
): boolean {
  // 允许的状态转换矩阵
  const transitions: Record<ReviewStatus, ReviewStatus[]> = {
    pending: ['approved', 'rejected'],
    approved: ['rejected'], // 允许从通过改为不通过
    rejected: ['approved', 'pending'], // 允许从不通过改为通过或待评审
  };

  return transitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * 获取评审状态的描述文本
 * 
 * @param status - 评审状态
 * @returns 状态描述
 */
export function getReviewStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    pending: '待评审',
    approved: '通过',
    rejected: '不通过',
  };

  return labels[status] || '未知';
}

/**
 * 获取总评审状态的描述文本
 * 
 * @param overallStatus - 总评审状态
 * @returns 状态描述
 */
export function getOverallReviewStatusLabel(overallStatus: string): string {
  const labels: Record<string, string> = {
    pending: '待一级评审',
    level1_approved: '待二级评审',
    level1_rejected: '一级评审不通过',
    level2_rejected: '二级评审不通过',
    approved: '二级评审通过',
  };

  return labels[overallStatus] || '待一级评审';
}

/**
 * 检查需求是否需要某个级别的评审
 * 
 * @param requirement - 需求对象
 * @param level - 评审级别
 * @returns 是否需要该级别评审
 */
export function requiresReviewLevel(
  requirement: Requirement,
  level: number
): boolean {
  return !!requirement.scheduledReview?.reviewLevels?.some((l) => l.level === level);
}

/**
 * 获取需求的所有评审人
 * 
 * @param requirement - 需求对象
 * @returns 评审人数组
 */
export function getAllReviewers(requirement: Requirement): Array<{ id: string; name: string; avatar?: string }> {
  if (!requirement.scheduledReview?.reviewLevels) {
    return [];
  }

  return requirement.scheduledReview.reviewLevels
    .filter((l) => l.reviewer)
    .map((l) => l.reviewer!)
    .filter((reviewer, index, self) => 
      // 去重
      index === self.findIndex((r) => r.id === reviewer.id)
    );
}

