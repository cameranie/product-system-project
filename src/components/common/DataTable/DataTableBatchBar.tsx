'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

export interface DataTableBatchBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children?: ReactNode;
  className?: string;
}

/**
 * 通用批量操作栏组件
 * 
 * 显示选择数量，提供取消选择按钮
 * 子组件可以放置自定义的批量操作按钮
 * 
 * @example
 * ```tsx
 * <DataTableBatchBar
 *   selectedCount={selectedIds.length}
 *   onClearSelection={clearSelection}
 * >
 *   <Button onClick={handleBatchDelete}>批量删除</Button>
 *   <Button onClick={handleBatchUpdate}>批量更新</Button>
 * </DataTableBatchBar>
 * ```
 */
export function DataTableBatchBar({
  selectedCount,
  onClearSelection,
  children,
  className = '',
}: DataTableBatchBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`px-4 pb-3 relative z-[110] ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              已选择 <span className="text-blue-600">{selectedCount}</span> 项
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onClearSelection}
              aria-label="取消选择"
            >
              <X className="h-3 w-3 mr-1" />
              取消选择
            </Button>
          </div>

          {/* 自定义批量操作按钮 */}
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

