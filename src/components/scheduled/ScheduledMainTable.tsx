/**
 * 预排期主表格组件
 * 
 * 包含所有版本分组的表格，统一的表头固定在顶部
 * 
 * @module ScheduledMainTable
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Requirement } from '@/lib/requirements-store';
import { ScheduledVersionGroup } from './ScheduledVersionGroup';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  /** 排序配置 */
  sortConfig?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** 排序处理 */
  onSort?: (field: string) => void;
  /** 隐藏的列 */
  hiddenColumns?: string[];
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
  sortConfig,
  onSort,
  hiddenColumns = [],
}: ScheduledMainTableProps) {
  // 默认展开所有版本
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(() => {
    return new Set(Object.keys(groupedRequirements));
  });

  // 当版本列表变化时，确保新版本也展开
  useEffect(() => {
    const currentVersions = Object.keys(groupedRequirements);
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      currentVersions.forEach(version => newSet.add(version));
      return newSet;
    });
  }, [groupedRequirements]);

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

  // 计算所有需求的总数和已选数量
  const allRequirements = useMemo(() => {
    return Object.values(groupedRequirements).flat();
  }, [groupedRequirements]);

  const totalCount = allRequirements.length;
  const selectedCount = allRequirements.filter(req => selectedRequirements.includes(req.id)).length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  const handleSelectAll = (checked: boolean) => {
    allRequirements.forEach(req => {
      onSelectRequirement(req.id, checked);
    });
  };

  // 渲染排序按钮
  const renderSortButton = useCallback((field: string) => {
    if (!onSort || !sortConfig) return null;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 ml-1"
        onClick={() => onSort(field)}
      >
        {sortConfig.field === field ? (
          sortConfig.direction === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </Button>
    );
  }, [sortConfig, onSort]);

  // 列配置
  const columnConfig = useMemo(() => [
    { id: 'id', label: 'ID', sortable: true, width: 'w-[96px]' },
    { id: 'type', label: '类型', sortable: false, width: 'w-[100px]' },
    { id: 'priority', label: '优先级', sortable: true, width: 'w-[100px]' },
    { id: 'version', label: '版本号', sortable: false, width: 'w-[120px]' },
    { id: 'level1Reviewer', label: '一级评审人', sortable: false, width: 'w-[128px]' },
    { id: 'level1Status', label: '一级评审', sortable: false, width: 'w-[112px]' },
    { id: 'level1Opinion', label: '一级意见', sortable: false, width: 'w-[120px]' },
    { id: 'level2Reviewer', label: '二级评审人', sortable: false, width: 'w-[128px]' },
    { id: 'level2Status', label: '二级评审', sortable: false, width: 'w-[112px]' },
    { id: 'level2Opinion', label: '二级意见', sortable: false, width: 'w-[120px]' },
    { id: 'isOperational', label: '是否运营', sortable: false, width: 'w-[110px]' },
    { id: 'creator', label: '创建人', sortable: true, width: 'w-[100px]' },
    { id: 'createdAt', label: '创建时间', sortable: true, width: 'w-[120px]' },
    { id: 'updatedAt', label: '更新时间', sortable: true, width: 'w-[120px]' },
  ], []);

  // 过滤可见列
  const visibleColumns = useMemo(() => 
    columnConfig.filter(col => !hiddenColumns.includes(col.id)),
    [columnConfig, hiddenColumns]
  );

  return (
    <div className="rounded-md border overflow-auto relative" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <table className="w-full caption-bottom text-sm">
        {/* 固定在顶部的统一表头 - 参照需求池样式 */}
        <thead className="sticky top-0 z-[100] bg-muted/50 border-b">
          <tr>
            {/* 序号列 - 始终显示，横向固定在左侧 */}
            <th 
              className="h-10 px-2 text-center align-middle font-medium text-sm text-muted-foreground bg-muted/50 border-r sticky z-[110]"
              style={{
                width: '80px',
                minWidth: '80px',
                maxWidth: '80px',
                left: '0px',
                boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
              }}
            >
              {/* 留空，不显示文字 */}
            </th>
            
            {/* 标题列 - 始终显示，横向固定在左侧 */}
            <th 
              className="h-10 px-2 text-left align-middle font-medium text-sm text-muted-foreground bg-muted/50 border-r sticky z-[110]"
              style={{
                width: '256px',
                minWidth: '256px',
                maxWidth: '256px',
                left: '80px',
                boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)'
              }}
            >
              <div className="flex items-center">
                标题
                {renderSortButton('title')}
              </div>
            </th>
            
            {/* 动态列 - 根据hiddenColumns显示 */}
            {visibleColumns.map(col => (
              <th 
                key={col.id}
                className={cn(
                  "h-10 px-2 text-center align-middle font-medium text-sm text-muted-foreground bg-muted/50 border-r whitespace-nowrap",
                  col.width
                )}
              >
                <div className="flex items-center justify-center">
                  {col.label}
                  {col.sortable && renderSortButton(col.id)}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* 按版本分组的数据 */}
        <tbody>
          {Object.keys(groupedRequirements).length === 0 ? (
            <tr>
              <td 
                colSpan={visibleColumns.length + 2} 
                className="p-12 text-center"
              >
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <svg 
                    className="h-16 w-16 text-muted-foreground/40" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-base font-medium">暂无预排期需求</p>
                    <p className="text-sm">当前没有需要预排期的需求</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            Object.entries(groupedRequirements).map(([version, requirements]) => (
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
                hiddenColumns={hiddenColumns}
                visibleColumnCount={visibleColumns.length}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}






