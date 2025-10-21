'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScheduledBatchActionsProps {
  versions: string[];
  onAssignVersion: (version: string) => void;
  onReview: (level: number, status: 'approved' | 'rejected') => void;
  onSetOperational: (value: 'yes' | 'no') => void;
}

/**
 * 预排期批量操作按钮组件
 * 
 * 提供批量分配版本、批量评审、批量设置运营等操作按钮
 * 配合通用的 DataTableBatchBar 组件使用
 * 
 * @example
 * ```tsx
 * <DataTableBatchBar selectedCount={10} onClearSelection={clear}>
 *   <ScheduledBatchActions
 *     versions={['v1.0.0', 'v1.1.0']}
 *     onAssignVersion={handleAssignVersion}
 *     onReview={handleReview}
 *     onSetOperational={handleSetOperational}
 *   />
 * </DataTableBatchBar>
 * ```
 */
export function ScheduledBatchActions({
  versions,
  onAssignVersion,
  onReview,
  onSetOperational,
}: ScheduledBatchActionsProps) {
  return (
    <>
      {/* 批量分配版本 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            批量分配版本
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[200]">
          {versions.map(version => (
            <DropdownMenuItem
              key={version}
              onClick={() => onAssignVersion(version)}
            >
              {version}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 批量评审 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            批量评审
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[200]">
          <DropdownMenuItem onClick={() => onReview(1, 'approved')}>
            一级评审通过
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReview(1, 'rejected')}>
            一级评审不通过
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReview(2, 'approved')}>
            二级评审通过
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReview(2, 'rejected')}>
            二级评审不通过
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 批量设置运营 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            批量是否运营
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[200]">
          <DropdownMenuItem onClick={() => onSetOperational('yes')}>
            设置为 是
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSetOperational('no')}>
            设置为 否
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

