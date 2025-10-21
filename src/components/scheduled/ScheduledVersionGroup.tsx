/**
 * 版本分组组件
 * 
 * 显示按版本分组的预排期需求
 * 
 * @module ScheduledVersionGroup
 */

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Requirement } from '@/lib/requirements-store';
import { cn } from '@/lib/utils';
import {
  IndexCell,
  IdCell,
  TitleCell,
  TypeCell,
  PriorityCell,
  VersionCell,
  ReviewerCell,
  ReviewStatusCell,
  ReviewOpinionCell,
  IsOperationalCell,
} from './cells';

/**
 * 组件属性
 */
interface ScheduledVersionGroupProps {
  /** 版本号 */
  version: string;
  /** 该版本的需求列表 */
  requirements: Requirement[];
  /** 版本选项 */
  versionOptions: string[];
  /** 是否展开 */
  isExpanded: boolean;
  /** 切换展开状态 */
  onToggleExpanded: () => void;
  /** 更新需求 */
  onUpdateRequirement: (id: string, updates: Partial<Requirement>) => void;
  /** 打开评审对话框 */
  onOpenReviewDialog: (requirement: Requirement, level: number) => void;
  /** 选择需求 */
  onSelectRequirement: (id: string, checked: boolean) => void;
  /** 全选/取消全选 */
  onSelectAll: (checked: boolean) => void;
  /** 已选择的需求ID列表 */
  selectedRequirements: string[];
  /** 隐藏的列 */
  hiddenColumns?: string[];
  /** 可见列数量 */
  visibleColumnCount: number;
}

/**
 * 版本分组组件
 * 现在只渲染版本标题行和数据行，不包含表头
 * 支持批量选择模式（类似需求池）
 */
export function ScheduledVersionGroup({
  version,
  requirements,
  versionOptions,
  isExpanded,
  onToggleExpanded,
  onUpdateRequirement,
  onOpenReviewDialog,
  onSelectRequirement,
  onSelectAll,
  selectedRequirements,
  hiddenColumns = [],
  visibleColumnCount,
}: ScheduledVersionGroupProps) {
  // 计算该版本下已选择的需求数量
  const selectedCount = requirements.filter(req => selectedRequirements.includes(req.id)).length;
  const isAllSelected = selectedCount === requirements.length && requirements.length > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < requirements.length;
  
  // 批量选择模式状态 - 基于选择状态计算，而非独立状态
  const batchMode = selectedCount > 0;

  // 检查列是否可见
  const isColumnVisible = (columnId: string) => !hiddenColumns.includes(columnId);

  // 处理版本级别的全选复选框
  const handleVersionCheckbox = (checked: boolean) => {
    onSelectAll(checked);
  };

  return (
    <>
      {/* 版本标题行 */}
      <tr className="bg-muted/50 hover:bg-muted/70 border-t-2 border-b">
        {/* 第一列：复选框 - 横向固定在左侧 */}
        <td 
          className="px-2 py-3 border-r sticky z-20 bg-muted/50"
          style={{
            width: '80px',
            minWidth: '80px',
            maxWidth: '80px',
            left: '0px',
            boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
          }}
        >
          <div 
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
              onCheckedChange={handleVersionCheckbox}
              title={isAllSelected ? '取消选择该版本' : '选择该版本所有需求'}
            />
          </div>
        </td>
        
        {/* 第二列：版本信息 - 横向固定 */}
        <td 
          className="p-0 border-r sticky z-20 bg-muted/50 cursor-pointer"
          style={{
            width: '256px',
            minWidth: '256px',
            maxWidth: '256px',
            left: '80px',
            boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
          }}
          onClick={onToggleExpanded}
        >
          <div className="flex items-center gap-3 p-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-700 truncate">
                {version}
              </h3>
              <span className="text-sm text-slate-500 flex-shrink-0">
                ({requirements.length}个需求)
              </span>
            </div>
          </div>
        </td>
        
        {/* 剩余列：占位 */}
        <td 
          colSpan={visibleColumnCount} 
          className="p-0 bg-muted/50"
        >
          {/* 占位空间 */}
        </td>
      </tr>

      {/* 数据行 - 只在展开时显示 */}
      {isExpanded && requirements.map((requirement, index) => (
        <tr key={requirement.id} className="hover:bg-muted/50 border-b transition-colors">
          <IndexCell
            index={index}
            isSelectable={batchMode}
            isSelected={selectedRequirements.includes(requirement.id)}
            onSelect={(checked) => onSelectRequirement(requirement.id, checked)}
          />
          <TitleCell requirement={requirement} />
          {isColumnVisible('id') && <IdCell requirement={requirement} />}
          {isColumnVisible('type') && <TypeCell requirement={requirement} />}
          {isColumnVisible('priority') && (
            <PriorityCell
              requirement={requirement}
              onUpdate={onUpdateRequirement}
            />
          )}
          {isColumnVisible('version') && (
            <VersionCell
              requirement={requirement}
              versionOptions={versionOptions}
              onUpdate={onUpdateRequirement}
            />
          )}
          {isColumnVisible('level1Reviewer') && (
            <ReviewerCell
              requirement={requirement}
              level={1}
            />
          )}
          {isColumnVisible('level1Status') && (
            <ReviewStatusCell
              requirement={requirement}
              level={1}
              onUpdate={onUpdateRequirement}
            />
          )}
          {isColumnVisible('level1Opinion') && (
            <ReviewOpinionCell
              requirement={requirement}
              level={1}
              onOpenReviewDialog={onOpenReviewDialog}
            />
          )}
          {isColumnVisible('level2Reviewer') && (
            <ReviewerCell
              requirement={requirement}
              level={2}
            />
          )}
          {isColumnVisible('level2Status') && (
            <ReviewStatusCell
              requirement={requirement}
              level={2}
              onUpdate={onUpdateRequirement}
            />
          )}
          {isColumnVisible('level2Opinion') && (
            <ReviewOpinionCell
              requirement={requirement}
              level={2}
              onOpenReviewDialog={onOpenReviewDialog}
            />
          )}
          {isColumnVisible('isOperational') && (
            <IsOperationalCell
              requirement={requirement}
              onUpdate={onUpdateRequirement}
            />
          )}
          {isColumnVisible('creator') && (
            <td className="p-2 text-sm text-center border-r">
              {requirement.creator?.name || '-'}
            </td>
          )}
          {isColumnVisible('createdAt') && (
            <td className="p-2 text-sm text-center border-r">
              {requirement.createdAt ? new Date(requirement.createdAt).toLocaleDateString('zh-CN') : '-'}
            </td>
          )}
          {isColumnVisible('updatedAt') && (
            <td className="p-2 text-sm text-center border-r">
              {requirement.updatedAt ? new Date(requirement.updatedAt).toLocaleDateString('zh-CN') : '-'}
            </td>
          )}
        </tr>
      ))}
    </>
  );
}


