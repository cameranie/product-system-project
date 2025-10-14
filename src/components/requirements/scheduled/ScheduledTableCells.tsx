/**
 * 预排期表格单元格渲染组件
 * 
 * P2 代码质量优化：拆分超长 renderTableCell 函数
 * 
 * 将每个列的渲染逻辑独立为单独的组件，提高可维护性和可读性
 * 
 * @module ScheduledTableCells
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Requirement } from '@/lib/requirements-store';
import {
  getRequirementTypeConfig,
  getPriorityConfig,
  PRIORITY_CONFIG,
} from '@/config/requirements';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 列固定宽度配置
 */
const COLUMN_WIDTHS: Record<string, string> = {
  id: 'w-24',
  title: 'w-64',
  type: 'w-28',
  platforms: 'w-36',
  priority: 'w-24',
  version: 'w-32',
  overallReviewStatus: 'w-36',
  level1Reviewer: 'w-32',
  level1Status: 'w-28',
  level1Opinion: 'w-32',
  level2Reviewer: 'w-32',
  level2Status: 'w-28',
  level2Opinion: 'w-32',
  isOperational: 'w-24',
  creator: 'w-32',
  createdAt: 'w-36',
  updatedAt: 'w-36',
};

/**
 * 评审状态选项
 */
const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: '待评审', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  { value: 'approved', label: '通过', className: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'rejected', label: '不通过', className: 'bg-red-50 text-red-700 border-red-200' },
];

/**
 * 总评审状态选项
 */
const OVERALL_REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: '待一级评审', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  { value: 'level1_approved', label: '待二级评审', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'level1_rejected', label: '一级评审不通过', className: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'level2_rejected', label: '二级评审不通过', className: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'approved', label: '二级评审通过', className: 'bg-green-50 text-green-700 border-green-200' },
];

/**
 * 版本选项
 */
const VERSION_OPTIONS = ['暂无版本号', 'v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0', 'v2.0.0', 'v2.1.0'];

/**
 * 单元格组件的通用 Props
 */
interface BaseCellProps {
  requirement: Requirement;
  onUpdate: (id: string, updates: Partial<Requirement>) => void;
}

/**
 * ID 列
 * 
 * P3: 使用 React.memo 优化性能，避免不必要的重渲染
 */
export const IDCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.id;
  return (
    <td key="id" className={`${widthClass} p-2 align-middle flex-shrink-0 font-mono text-sm`}>
      {requirement.id}
    </td>
  );
});

/**
 * 标题列（带延期标签）
 * 
 * P3: 使用 React.memo 优化性能
 */
export const TitleCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.title;
  return (
    <td key="title" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <div className="space-y-1">
        <Link
          href={`/requirements/${encodeURIComponent(requirement.id)}?from=scheduled`}
          className="hover:underline font-medium block truncate"
          title={requirement.title}
        >
          {requirement.title}
        </Link>
        {requirement.delayTag && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border-red-200">
              <Clock className="h-3 w-3 mr-1" />
              {requirement.delayTag}
            </span>
          </div>
        )}
      </div>
    </td>
  );
});

/**
 * 类型列
 * 
 * P3: 使用 React.memo 优化性能
 */
export const TypeCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.type;
  const typeLabel = getRequirementTypeConfig(requirement.type)?.label || requirement.type;
  return (
    <td key="type" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <span className="text-sm truncate block" title={typeLabel}>
        {typeLabel}
      </span>
    </td>
  );
});

/**
 * 应用端列
 * 
 * P3: 使用 React.memo 优化性能
 */
export const PlatformsCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.platforms;
  const platforms = requirement.platforms || [];
  return (
    <td key="platforms" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <span className="text-sm truncate block" title={platforms.join(', ')}>
        {platforms.join(', ') || '-'}
      </span>
    </td>
  );
});

/**
 * 优先级列（可编辑）
 * 
 * P3: 使用 React.memo 优化性能
 */
export const PriorityCell = React.memo<BaseCellProps>(({ requirement, onUpdate }) => {
  const widthClass = COLUMN_WIDTHS.priority;
  const currentPriority = requirement.priority;
  const priorityConfig = currentPriority ? getPriorityConfig(currentPriority) : null;
  const priorityOrder = ['紧急', '高', '中', '低'];

  const handlePriorityChange = useCallback((key: string) => {
    if (currentPriority === key) {
      onUpdate(requirement.id, { priority: undefined });
      toast.success('已取消优先级');
    } else {
      onUpdate(requirement.id, { priority: key as any });
      toast.success('优先级已更新');
    }
  }, [currentPriority, requirement.id, onUpdate]);

  return (
    <td key="priority" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`h-6 px-2 py-1 text-xs rounded-md ${priorityConfig?.className || 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center`}
          >
            {priorityConfig?.label || '-'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-20">
          {priorityOrder.map(key => {
            const config = PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG];
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => handlePriorityChange(key)}
                className={`cursor-pointer ${currentPriority === key ? 'bg-accent' : ''}`}
              >
                <span className={`px-2 py-1 rounded text-sm ${config.className} inline-block`}>
                  {config.label}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
});

/**
 * 版本号列（可编辑）
 * 
 * P3: 使用 React.memo 优化性能
 */
export const VersionCell = React.memo<BaseCellProps>(({ requirement, onUpdate }) => {
  const widthClass = COLUMN_WIDTHS.version;
  const currentVersion = requirement.plannedVersion || '暂无版本号';

  const handleVersionChange = useCallback((version: string) => {
    onUpdate(requirement.id, { plannedVersion: version === '暂无版本号' ? undefined : version });
    toast.success('版本号已更新');
  }, [requirement.id, onUpdate]);

  return (
    <td key="version" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-normal hover:bg-accent hover:text-accent-foreground"
          >
            {currentVersion}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          {VERSION_OPTIONS.map(version => (
            <DropdownMenuItem
              key={version}
              onClick={() => handleVersionChange(version)}
              className={currentVersion === version ? 'bg-accent' : ''}
            >
              {version}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
});

/**
 * 总评审状态列（只读，自动计算）
 * 
 * P3: 使用 React.memo 优化性能
 */
interface OverallReviewStatusCellProps extends BaseCellProps {
  getOverallReviewStatus: (requirement: Requirement) => string;
}

export const OverallReviewStatusCell = React.memo<OverallReviewStatusCellProps>(({
  requirement,
  getOverallReviewStatus,
}) => {
  const widthClass = COLUMN_WIDTHS.overallReviewStatus;
  const overallStatus = getOverallReviewStatus(requirement);
  const statusConfig = OVERALL_REVIEW_STATUS_OPTIONS.find(s => s.value === overallStatus);

  return (
    <td key="overallReviewStatus" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusConfig?.className || ''} truncate`}
        title={statusConfig?.label}
      >
        {statusConfig?.label || '待一级评审'}
      </span>
    </td>
  );
});

/**
 * 评审人列（一级或二级）
 * 
 * P3: 使用 React.memo 优化性能
 */
interface ReviewerCellProps extends BaseCellProps {
  level: number;
  getReviewLevelInfo: (requirement: Requirement, level: number) => any;
}

export const ReviewerCell = React.memo<ReviewerCellProps>(({
  requirement,
  level,
  getReviewLevelInfo,
}) => {
  const widthClass = level === 1 ? COLUMN_WIDTHS.level1Reviewer : COLUMN_WIDTHS.level2Reviewer;
  const levelInfo = getReviewLevelInfo(requirement, level);
  const columnKey = level === 1 ? 'level1Reviewer' : 'level2Reviewer';

  return (
    <td key={columnKey} className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      {levelInfo?.reviewer ? (
        <UserAvatar user={levelInfo.reviewer} size="sm" showName />
      ) : (
        <span className="text-sm text-muted-foreground">未分配</span>
      )}
    </td>
  );
});

/**
 * 评审状态列（一级或二级，可编辑）
 * 
 * P3: 使用 React.memo 优化性能
 */
interface ReviewStatusCellProps extends BaseCellProps {
  level: number;
  getReviewLevelInfo: (requirement: Requirement, level: number) => any;
}

export const ReviewStatusCell = React.memo<ReviewStatusCellProps>(({
  requirement,
  level,
  getReviewLevelInfo,
  onUpdate,
}) => {
  const widthClass = level === 1 ? COLUMN_WIDTHS.level1Status : COLUMN_WIDTHS.level2Status;
  const columnKey = level === 1 ? 'level1Status' : 'level2Status';
  const levelInfo = getReviewLevelInfo(requirement, level);
  const statusConfig = REVIEW_STATUS_OPTIONS.find(s => s.value === (levelInfo?.status || 'pending'));

  const handleStatusChange = useCallback((status: string) => {
    if (!requirement.scheduledReview) return;
    
    const updatedLevels = requirement.scheduledReview.reviewLevels.map(l =>
      l.level === level ? { ...l, status: status as any, reviewedAt: new Date().toISOString() } : l
    );
    
    onUpdate(requirement.id, {
      scheduledReview: { ...requirement.scheduledReview, reviewLevels: updatedLevels }
    });
    
    toast.success(`${level === 1 ? '一' : '二'}级评审状态已更新`);
  }, [requirement, level, onUpdate]);

  return (
    <td key={columnKey} className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-xs font-normal ${statusConfig?.className || ''}`}
          >
            {statusConfig?.label || '待评审'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28">
          {REVIEW_STATUS_OPTIONS.map(status => (
            <DropdownMenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={levelInfo?.status === status.value ? 'bg-accent' : ''}
            >
              <span className={`${status.className}`}>{status.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
});

/**
 * 评审意见列（一级或二级，可点击填写）
 * 
 * P3: 使用 React.memo 优化性能
 */
interface ReviewOpinionCellProps extends BaseCellProps {
  level: number;
  getReviewLevelInfo: (requirement: Requirement, level: number) => any;
  onOpenReviewDialog: (requirement: Requirement, level: number) => void;
}

export const ReviewOpinionCell = React.memo<ReviewOpinionCellProps>(({
  requirement,
  level,
  getReviewLevelInfo,
  onOpenReviewDialog,
}) => {
  const widthClass = level === 1 ? COLUMN_WIDTHS.level1Opinion : COLUMN_WIDTHS.level2Opinion;
  const columnKey = level === 1 ? 'level1Opinion' : 'level2Opinion';
  const levelInfo = getReviewLevelInfo(requirement, level);

  return (
    <td key={columnKey} className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onOpenReviewDialog(requirement, level)}
        title={levelInfo?.opinion || `点击填写${level === 1 ? '一' : '二'}级评审意见`}
      >
        {levelInfo?.opinion ? (
          <span className="text-sm truncate max-w-[100px]">
            {levelInfo.opinion}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">填写意见</span>
        )}
      </Button>
    </td>
  );
});

/**
 * 是否运营列（可编辑）
 * 
 * P3: 使用 React.memo 优化性能
 */
export const IsOperationalCell = React.memo<BaseCellProps>(({ requirement, onUpdate }) => {
  const widthClass = COLUMN_WIDTHS.isOperational;
  const operationalOptions = [
    { value: 'unset', label: '未填写', className: 'text-muted-foreground' },
    { value: 'yes', label: '是', className: 'text-purple-700' },
    { value: 'no', label: '否', className: 'text-gray-700' }
  ];
  const currentOperational = requirement.isOperational || 'unset';
  const operationalConfig = operationalOptions.find(o => o.value === currentOperational);

  const handleOperationalChange = useCallback((value: string) => {
    onUpdate(requirement.id, { 
      isOperational: value === 'unset' ? undefined : value as 'yes' | 'no' 
    });
    toast.success('是否运营已更新');
  }, [requirement.id, onUpdate]);

  return (
    <td key="isOperational" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-xs font-normal ${operationalConfig?.className || ''}`}
          >
            {operationalConfig?.label || '未填写'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-24">
          {operationalOptions.map(option => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleOperationalChange(option.value)}
              className={currentOperational === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
});

/**
 * 创建人列
 * 
 * P3: 使用 React.memo 优化性能
 */
export const CreatorCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.creator;
  return (
    <td key="creator" className={`${widthClass} p-2 align-middle flex-shrink-0`}>
      <UserAvatar user={requirement.creator} size="sm" showName />
    </td>
  );
});

/**
 * 创建时间列
 * 
 * P3: 使用 React.memo 优化性能
 */
export const CreatedAtCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.createdAt;
  return (
    <td key="createdAt" className={`${widthClass} p-2 align-middle flex-shrink-0 text-sm`}>
      {requirement.createdAt}
    </td>
  );
});

/**
 * 更新时间列
 * 
 * P3: 使用 React.memo 优化性能
 */
export const UpdatedAtCell = React.memo<BaseCellProps>(({ requirement }) => {
  const widthClass = COLUMN_WIDTHS.updatedAt;
  return (
    <td key="updatedAt" className={`${widthClass} p-2 align-middle flex-shrink-0 text-sm`}>
      {requirement.updatedAt}
    </td>
  );
});

