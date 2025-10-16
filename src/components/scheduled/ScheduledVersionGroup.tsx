/**
 * 版本分组组件
 * 
 * 显示按版本分组的预排期需求
 * 
 * @module ScheduledVersionGroup
 */

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Requirement } from '@/lib/requirements-store';
import { COLUMN_WIDTHS } from '@/config/limits';
import {
  IndexCell,
  IdCell,
  TitleCell,
  TypeCell,
  PriorityCell,
  VersionCell,
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
}

/**
 * 版本分组组件
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
}: ScheduledVersionGroupProps) {
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  
  // 计算该版本下已选择的需求数量
  const selectedCount = requirements.filter(req => selectedRequirements.includes(req.id)).length;
  const isAllSelected = selectedCount === requirements.length && requirements.length > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < requirements.length;

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAllChecked(checked);
    onSelectAll(checked);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 cursor-pointer border-b">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <h3 className="text-base font-bold text-slate-700 flex items-center">
              {version}
              <span className="mx-2 text-slate-400 font-normal">•</span>
              <span className="text-sm font-normal text-slate-500">
                {requirements.length}个需求
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <Badge variant="outline" className="text-xs">
                已选择 {selectedCount}
              </Badge>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center font-mono text-sm">
                  ID
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  标题
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  类型
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  优先级
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  版本号
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  一级评审
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  一级意见
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  二级评审
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  二级意见
                </TableHead>
                <TableHead className="sticky z-30 top-0 bg-background border-r p-2 text-center">
                  是否运营
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((requirement, index) => (
                <TableRow key={requirement.id} className="hover:bg-muted/50">
                  <IndexCell
                    index={index}
                    isSelectable={true}
                    isSelected={selectedRequirements.includes(requirement.id)}
                    onSelect={(checked) => onSelectRequirement(requirement.id, checked)}
                  />
                  <IdCell requirement={requirement} />
                  <TitleCell requirement={requirement} />
                  <TypeCell requirement={requirement} />
                  <PriorityCell
                    requirement={requirement}
                    onUpdate={onUpdateRequirement}
                  />
                  <VersionCell
                    requirement={requirement}
                    versionOptions={versionOptions}
                    onUpdate={onUpdateRequirement}
                  />
                  <ReviewStatusCell
                    requirement={requirement}
                    level={1}
                    onUpdate={onUpdateRequirement}
                  />
                  <ReviewOpinionCell
                    requirement={requirement}
                    level={1}
                    onOpenReviewDialog={onOpenReviewDialog}
                  />
                  <ReviewStatusCell
                    requirement={requirement}
                    level={2}
                    onUpdate={onUpdateRequirement}
                  />
                  <ReviewOpinionCell
                    requirement={requirement}
                    level={2}
                    onOpenReviewDialog={onOpenReviewDialog}
                  />
                  <IsOperationalCell
                    requirement={requirement}
                    onUpdate={onUpdateRequirement}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}


