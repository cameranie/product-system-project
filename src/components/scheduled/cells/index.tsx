/**
 * 预排期表格单元格组件
 * 
 * 包含各种类型的表格单元格组件
 * 
 * @module ScheduledTableCells
 */

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Requirement } from '@/lib/requirements-store';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getRequirementTypeConfig, getPriorityConfig, PRIORITY_CONFIG } from '@/config/requirements';
import { COLUMN_WIDTHS } from '@/config/limits';

/**
 * 序号单元格组件
 */
interface IndexCellProps {
  index: number;
  isSelectable: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export function IndexCell({ index, isSelectable, isSelected, onSelect }: IndexCellProps) {
  const width = COLUMN_WIDTHS.INDEX;
  const stickyStyle = {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    left: '0px',
    backgroundColor: 'var(--background)',
    boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
  };

  return (
    <td 
      className="sticky z-20 p-2 align-middle border-r font-mono text-xs text-center text-muted-foreground"
      style={stickyStyle}
    >
      {isSelectable ? (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      ) : (
        index + 1
      )}
    </td>
  );
}

/**
 * ID单元格组件
 */
interface IdCellProps {
  requirement: Requirement;
}

export function IdCell({ requirement }: IdCellProps) {
  const width = COLUMN_WIDTHS.ID;
  const stickyStyle = {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    left: `${COLUMN_WIDTHS.INDEX}px`,
    backgroundColor: 'var(--background)',
    boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
  };

  return (
    <td className="sticky z-20 p-2 align-middle border-r font-mono text-xs" style={stickyStyle}>
      {requirement.id}
    </td>
  );
}

/**
 * 标题单元格组件
 */
interface TitleCellProps {
  requirement: Requirement;
}

export function TitleCell({ requirement }: TitleCellProps) {
  const width = COLUMN_WIDTHS.TITLE;
  const stickyStyle = {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    left: `${COLUMN_WIDTHS.INDEX + COLUMN_WIDTHS.ID}px`,
    backgroundColor: 'var(--background)',
    boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
  };

  return (
    <td className="sticky z-20 p-2 align-middle border-r" style={stickyStyle}>
      <div className="space-y-1">
        <Link
          href={`/requirements/${encodeURIComponent(requirement.id)}?from=scheduled`}
          className="hover:underline font-normal block truncate text-xs"
          title={requirement.title}
        >
          {requirement.title}
        </Link>
        <div className="flex items-center gap-2">
          {requirement.delayTag && (
            <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border-red-200">
              <Clock className="h-3 w-3 mr-1" />
              {requirement.delayTag}
            </span>
          )}
        </div>
      </div>
    </td>
  );
}

/**
 * 类型单元格组件
 */
interface TypeCellProps {
  requirement: Requirement;
}

export function TypeCell({ requirement }: TypeCellProps) {
  const width = COLUMN_WIDTHS.TYPE;
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };

  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
      <span className="text-xs truncate block" title={getRequirementTypeConfig(requirement.type)?.label || requirement.type}>
        {getRequirementTypeConfig(requirement.type)?.label || requirement.type}
      </span>
    </td>
  );
}

/**
 * 优先级单元格组件
 */
interface PriorityCellProps {
  requirement: Requirement;
  onUpdate: (id: string, updates: Partial<Requirement>) => void;
}

export function PriorityCell({ requirement, onUpdate }: PriorityCellProps) {
  const width = COLUMN_WIDTHS.PRIORITY;
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
  
  const currentPriority = requirement.priority;
  const priorityConfig = currentPriority ? getPriorityConfig(currentPriority) : null;
  const priorityOrder = ['紧急', '高', '中', '低'];

  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
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
                onClick={() => {
                  if (currentPriority === key) {
                    onUpdate(requirement.id, { priority: undefined });
                  } else {
                    onUpdate(requirement.id, { priority: key as any });
                  }
                }}
                className={`cursor-pointer ${currentPriority === key ? 'bg-accent' : ''}`}
              >
                <span className={`px-2 py-1 rounded text-xs ${config.className} inline-block`}>
                  {config.label}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}

/**
 * 版本号单元格组件
 */
interface VersionCellProps {
  requirement: Requirement;
  versionOptions: string[];
  onUpdate: (id: string, updates: Partial<Requirement>) => void;
}

export function VersionCell({ requirement, versionOptions, onUpdate }: VersionCellProps) {
  const width = COLUMN_WIDTHS.VERSION;
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
  
  const currentVersion = requirement.plannedVersion || '暂无版本号';

  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
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
          {versionOptions.map(version => (
            <DropdownMenuItem
              key={version}
              onClick={() => {
                onUpdate(requirement.id, { plannedVersion: version === '暂无版本号' ? undefined : version });
              }}
              className={currentVersion === version ? 'bg-accent' : ''}
            >
              {version}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}

/**
 * 评审状态单元格组件
 */
interface ReviewStatusCellProps {
  requirement: Requirement;
  level: number;
  onUpdate: (id: string, updates: Partial<Requirement>) => void;
}

export function ReviewStatusCell({ requirement, level, onUpdate }: ReviewStatusCellProps) {
  const width = COLUMN_WIDTHS.REVIEW_STATUS;
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
  
  const reviewLevel = requirement.scheduledReview?.reviewLevels?.find(r => r.level === level);
  const status = reviewLevel?.status || 'pending';
  
  const statusConfig = {
    pending: { label: '待评审', className: 'bg-gray-50 text-gray-600 border-gray-200' },
    approved: { label: '通过', className: 'bg-green-50 text-green-700 border-green-200' },
    rejected: { label: '不通过', className: 'bg-red-50 text-red-700 border-red-200' },
  }[status];

  const statusOptions = [
    { value: 'pending', label: '待评审', className: 'bg-gray-50 text-gray-600 border-gray-200' },
    { value: 'approved', label: '通过', className: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'rejected', label: '不通过', className: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
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
          {statusOptions.map(option => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                if (!requirement.scheduledReview) return;
                const updatedLevels = requirement.scheduledReview.reviewLevels.map(l =>
                  l.level === level ? { ...l, status: option.value as any, reviewedAt: new Date().toISOString() } : l
                );
                onUpdate(requirement.id, {
                  scheduledReview: { ...requirement.scheduledReview, reviewLevels: updatedLevels }
                });
              }}
              className={status === option.value ? 'bg-accent' : ''}
            >
              <span className={`${option.className}`}>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}

/**
 * 评审意见单元格组件
 */
interface ReviewOpinionCellProps {
  requirement: Requirement;
  level: number;
  onOpenReviewDialog: (requirement: Requirement, level: number) => void;
}

export function ReviewOpinionCell({ requirement, level, onOpenReviewDialog }: ReviewOpinionCellProps) {
  const width = COLUMN_WIDTHS.REVIEW_OPINION;
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
  
  const reviewLevel = requirement.scheduledReview?.reviewLevels?.find(r => r.level === level);

  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 font-normal"
        onClick={() => onOpenReviewDialog(requirement, level)}
        title={reviewLevel?.opinion || `点击填写${level === 1 ? '一' : '二'}级评审意见`}
      >
        {reviewLevel?.opinion ? (
          <span className="text-xs truncate max-w-[100px]">
            {reviewLevel.opinion}
          </span>
        ) : (
          <span className="text-xs text-gray-400">填写意见</span>
        )}
      </Button>
    </td>
  );
}

/**
 * 是否运营单元格组件
 */
interface IsOperationalCellProps {
  requirement: Requirement;
  onUpdate: (id: string, updates: Partial<Requirement>) => void;
}

export function IsOperationalCell({ requirement, onUpdate }: IsOperationalCellProps) {
  const width = COLUMN_WIDTHS.IS_OPERATIONAL;
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
  
  const operationalOptions = [
    { value: 'unset', label: '未填写', className: 'text-gray-400' },
    { value: 'yes', label: '是', className: 'text-purple-700' },
    { value: 'no', label: '否', className: 'text-gray-700' }
  ];
  
  const currentOperational = requirement.isOperational || 'unset';
  const operationalConfig = operationalOptions.find(o => o.value === currentOperational);

  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
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
              onClick={() => {
                onUpdate(requirement.id, { 
                  isOperational: option.value === 'unset' ? undefined : option.value as 'yes' | 'no' 
                });
              }}
              className={currentOperational === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}


