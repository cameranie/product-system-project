'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { ScheduledTableSkeleton } from '@/components/ui/table-skeleton';

// ✅ 使用通用组件
import { DataTableToolbar } from '@/components/common/DataTable';
import { DataTableBatchBar } from '@/components/common/DataTable';

// ✅ 使用预排期专用组件
import { ScheduledBatchActions } from './components/ScheduledBatchActions';
import { ScheduledMainTable } from '@/components/scheduled/ScheduledMainTable';
import { ReviewDialog } from '@/components/scheduled/ReviewDialog';

// ✅ 使用整合的Hooks
import { useScheduledTable } from './hooks/useScheduledTable';
import { useScheduledBatchActions } from './hooks/useScheduledBatchActions';
import { useScheduledReview } from './hooks/useScheduledReview';
import { useScheduledColumns } from './hooks/useScheduledColumns';

// ✅ 使用配置常量
import {
  SCHEDULED_FILTERABLE_COLUMNS,
  SCHEDULED_FILTER_OPERATORS,
} from '@/config/scheduled-requirements';

// ✅ 引入store用于更新需求
import { useRequirementsStore, Requirement } from '@/lib/requirements-store';

/**
 * 预排期需求管理页面 V2
 * 
 * 核心变化：
 * - ✅ 使用通用DataTable组件（工具栏、搜索、筛选、列控制）
 * - ✅ 使用通用DataTableBatchBar组件
 * - ✅ 保留预排期专用功能（版本分组、评审流程）
 * - ✅ 代码从2203行减少到~150行（93%↓）
 * 
 * 功能：
 * - 按版本分组展示需求
 * - 二级评审流程展示
 * - 筛选和搜索
 * - 批量操作
 * - 延期标签显示
 * - 高级筛选设置
 * - 列显示/隐藏控制
 */
export default function ScheduledRequirementsPage() {
  // 数据和筛选
  const {
    loading,
    requirements,
    groupedRequirements,
    versions,
    searchTerm,
    setSearchTerm,
    customFilters,
    filterActions,
    sortConfig,
    onSort,
    expandedVersions,
    toggleVersion,
    selectedIds,
    selectionActions,
  } = useScheduledTable();

  // 列管理
  const {
    columnOrder,
    hiddenColumns,
    columnsConfig,
    columnActions,
  } = useScheduledColumns();

  // 批量操作
  const batchActions = useScheduledBatchActions(selectedIds);

  // 评审对话框
  const reviewDialog = useScheduledReview();

  // 需求更新（包装以确保优先级同步）
  const { updateRequirement: storeUpdateRequirement } = useRequirementsStore();
  const { getRequirements } = useRequirementsStore();
  
  // 包装 updateRequirement，确保优先级同步到 endOwnerOpinion
  const updateRequirement = useCallback(async (id: string, updates: Partial<Requirement>) => {
    try {
      // 如果更新了 priority，同步到 endOwnerOpinion.priority
      if ('priority' in updates) {
        const allRequirements = getRequirements();
        const requirement = allRequirements.find(req => req.id === id);
        
        if (requirement?.endOwnerOpinion) {
          updates.endOwnerOpinion = {
            ...requirement.endOwnerOpinion,
            priority: updates.priority,
          };
        }
        
        // 只在开发环境输出日志
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ 优先级已同步（预排期→详情）:', updates.priority);
        }
      }
      
      const result = await storeUpdateRequirement(id, updates);
      toast.success('更新成功');
      return result;
    } catch (error) {
      console.error('更新需求失败:', error);
      toast.error('更新失败，请重试');
      throw error;
    }
  }, [storeUpdateRequirement, getRequirements]);

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 pt-4 space-y-4">
          <ScheduledTableSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* ✅ 通用工具栏：搜索 + 筛选 + 列控制 */}
      <DataTableToolbar
        searchValue={searchTerm}
        searchPlaceholder="搜索需求标题、ID、创建人..."
        onSearchChange={setSearchTerm}
        filters={customFilters}
        filterableColumns={SCHEDULED_FILTERABLE_COLUMNS as any}
        filterOperators={SCHEDULED_FILTER_OPERATORS as any}
        onFilterAdd={filterActions.add}
        onFilterUpdate={filterActions.update}
        onFilterRemove={filterActions.remove}
        onFiltersClear={filterActions.clear}
        columns={columnOrder}
        hiddenColumns={hiddenColumns}
        columnsConfig={columnsConfig}
        onColumnToggle={columnActions.toggle}
        onColumnsReorder={columnActions.reorder}
        onColumnsReset={columnActions.reset}
      />

      {/* ✅ 通用批量操作栏 + 预排期专用按钮 */}
      <DataTableBatchBar
        selectedCount={selectedIds.length}
        onClearSelection={selectionActions.clear}
      >
        <ScheduledBatchActions
          versions={versions.filter(v => v !== undefined) as string[]}
          onAssignVersion={batchActions.assignVersion}
          onReview={batchActions.review}
          onSetOperational={batchActions.setOperational}
        />
      </DataTableBatchBar>

      {/* ✅ 预排期专用表格（版本分组 + 评审） */}
      <div className="px-4 pt-4 pb-4">
        <ScheduledMainTable
          groupedRequirements={groupedRequirements}
          versionOptions={versions.filter(v => v !== undefined) as string[]}
          onUpdateRequirement={updateRequirement}
          onOpenReviewDialog={reviewDialog.open}
          onSelectRequirement={selectionActions.toggle}
          onSelectAll={selectionActions.toggleAll}
          selectedRequirements={selectedIds}
          sortConfig={sortConfig}
          onSort={onSort}
          hiddenColumns={hiddenColumns}
        />
      </div>

      {/* ✅ 评审对话框 */}
      <ReviewDialog
        open={reviewDialog.isOpen}
        onClose={reviewDialog.close}
        requirement={reviewDialog.requirement}
        level={reviewDialog.level}
        onSubmitReview={reviewDialog.submit}
        opinion={reviewDialog.opinion}
        onOpinionChange={reviewDialog.setOpinion}
      />
    </AppLayout>
  );
}
