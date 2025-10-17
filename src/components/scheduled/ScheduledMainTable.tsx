/**
 * 预排期主表格组件
 * 
 * 包含所有版本分组的表格
 * 
 * @module ScheduledMainTable
 */

import { useState } from 'react';
import { Requirement } from '@/lib/requirements-store';
import { ScheduledVersionGroup } from './ScheduledVersionGroup';

/**
 * 组件属性
 */
interface ScheduledMainTableProps {
  /** 按版本分组的需求数据 */
  groupedRequirements: Record<string, Requirement[]>;
  /** 版本选项 */
  versionOptions: string[];
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
 * 预排期主表格组件
 */
export function ScheduledMainTable({
  groupedRequirements,
  versionOptions,
  onUpdateRequirement,
  onOpenReviewDialog,
  onSelectRequirement,
  onSelectAll,
  selectedRequirements,
}: ScheduledMainTableProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  const handleSelectAllInVersion = (version: string, checked: boolean) => {
    const requirements = groupedRequirements[version] || [];
    requirements.forEach(req => {
      onSelectRequirement(req.id, checked);
    });
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedRequirements).map(([version, requirements]) => (
        <ScheduledVersionGroup
          key={version}
          version={version}
          requirements={requirements}
          versionOptions={versionOptions}
          isExpanded={expandedVersions.has(version)}
          onToggleExpanded={() => toggleVersionExpanded(version)}
          onUpdateRequirement={onUpdateRequirement}
          onOpenReviewDialog={onOpenReviewDialog}
          onSelectRequirement={onSelectRequirement}
          onSelectAll={(checked) => handleSelectAllInVersion(version, checked)}
          selectedRequirements={selectedRequirements}
        />
      ))}
    </div>
  );
}






