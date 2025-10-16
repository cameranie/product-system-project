/**
 * 预排期批量操作栏组件
 * 
 * 显示批量操作选项和已选择的需求数量
 * 
 * @module ScheduledBatchActionsBar
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X } from 'lucide-react';

/**
 * 组件属性
 */
interface ScheduledBatchActionsBarProps {
  /** 已选择的需求数量 */
  selectedCount: number;
  /** 版本列表 */
  versions: string[];
  /** 清空选择 */
  onClearSelection: () => void;
  /** 批量分配版本 */
  onBatchAssignVersion: (version: string) => void;
  /** 批量评审 */
  onBatchReview: (level: number, status: 'approved' | 'rejected') => void;
  /** 批量设置是否运营 */
  onBatchIsOperational: (value: 'yes' | 'no') => void;
}

/**
 * 预排期批量操作栏组件
 */
export function ScheduledBatchActionsBar({
  selectedCount,
  versions,
  onClearSelection,
  onBatchAssignVersion,
  onBatchReview,
  onBatchIsOperational,
}: ScheduledBatchActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            已选择 <span className="text-blue-600">{selectedCount}</span> 个需求
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onClearSelection}
          >
            <X className="h-3 w-3 mr-1" />
            取消选择
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 批量分配版本 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                批量分配版本
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {versions.map(version => (
                <DropdownMenuItem
                  key={version}
                  onClick={() => onBatchAssignVersion(version)}
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
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBatchReview(1, 'approved')}>
                一级评审通过
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBatchReview(1, 'rejected')}>
                一级评审不通过
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBatchReview(2, 'approved')}>
                二级评审通过
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBatchReview(2, 'rejected')}>
                二级评审不通过
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* 批量是否运营 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                批量是否运营
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBatchIsOperational('yes')}>
                设置为 是
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBatchIsOperational('no')}>
                设置为 否
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


