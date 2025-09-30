'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRequirementsStore } from '@/lib/requirements-store';
import { RequirementTable } from '@/components/requirements/RequirementTable';
import { VirtualizedRequirementTable } from '@/components/requirements/VirtualizedRequirementTable';
import { FilterPanel } from '@/components/requirements/FilterPanel';
import { BatchOperations } from '@/components/requirements/BatchOperations';
import { useRequirementFilters } from '@/hooks/useRequirementFilters';
import { FILTERABLE_COLUMNS } from '@/config/requirements';

/**
 * 筛选列配置类型（避免 readonly 类型冲突）
 */
type FilterableColumn = {
  value: string;
  label: string;
};

/**
 * 需求池页面
 * 
 * 主要功能：
 * - 需求列表展示（支持表格视图）
 * - 多维度筛选（状态、搜索、自定义条件）
 * - 多字段排序
 * - 批量操作
 * - 列显示/隐藏控制
 * - 列顺序自定义（拖拽）
 * 
 * 性能优化：
 * - 使用自定义 Hook 管理筛选和排序逻辑
 * - 所有事件处理函数使用 useCallback 包装
 * - 表格组件使用 React.memo 防止不必要渲染
 * - 筛选和排序结果使用 useMemo 缓存
 */
export default function RequirementsPage() {
  const router = useRouter();
  const { getRequirements, updateRequirement, loading, setLoading } = useRequirementsStore();
  const requirements = getRequirements();
  
  // 使用自定义hook管理筛选和排序
  const {
    searchTerm,
    statusFilter,
    customFilters,
    sortConfig,
    hiddenColumns,
    columnOrder,
    selectedRequirements,
    stats,
    filteredRequirements,
    setSearchTerm,
    setStatusFilter,
    addCustomFilter,
    updateCustomFilter,
    removeCustomFilter,
    clearAllFilters,
    handleColumnSort,
    toggleColumnVisibility,
    handleColumnReorder,
    handleRequirementSelect,
    handleSelectAll
  } = useRequirementFilters({ requirements });

  // 批量操作状态
  const [batchNeedToDoValue, setBatchNeedToDoValue] = useState<string>('');
  
  // 加载状态
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, [setLoading]);

  /**
   * 处理"是否要做"字段变更
   * 
   * 性能优化：使用 useCallback 包装，避免子组件不必要的重渲染
   * 
   * @param requirementId - 需求ID
   * @param value - 新的"是否要做"值（'是' | '否'）
   */
  const handleNeedToDoChange = useCallback((requirementId: string, value: string) => {
    // 类型安全检查：确保值在允许的范围内
    if (!['是', '否'].includes(value)) {
      console.error('Invalid needToDo value:', value);
      toast.error('无效的选项值');
      return;
    }
    
    try {
      updateRequirement(requirementId, { needToDo: value as '是' | '否' });
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    }
  }, [updateRequirement]);

  /**
   * 处理优先级变更
   * 
   * 性能优化：使用 useCallback 包装，避免子组件不必要的重渲染
   * 
   * @param requirementId - 需求ID
   * @param value - 新的优先级值（'低' | '中' | '高' | '紧急'）
   */
  const handlePriorityChange = useCallback((requirementId: string, value: string) => {
    // 类型安全检查：确保值在允许的范围内
    if (!['低', '中', '高', '紧急'].includes(value)) {
      console.error('Invalid priority value:', value);
      toast.error('无效的优先级');
      return;
    }
    
    try {
      updateRequirement(requirementId, { priority: value as '低' | '中' | '高' | '紧急' });
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    }
  }, [updateRequirement]);

  /**
   * 批量操作 - 批量更新"是否要做"字段
   * 
   * 性能优化：使用 for...of 替代 forEach
   * - 更清晰的迭代语义
   - 更好的性能（避免函数调用开销）
   - 支持 break/continue（虽然这里不需要）
   */
  const handleBatchNeedToDoUpdate = useCallback(() => {
    if (batchNeedToDoValue && selectedRequirements.length > 0) {
      // 类型安全检查
      if (!['是', '否'].includes(batchNeedToDoValue)) {
        console.error('Invalid batch needToDo value:', batchNeedToDoValue);
        toast.error('无效的批量操作值');
        return;
      }
      
      // 使用 for...of 代替 forEach，性能更好且代码更清晰
      for (const id of selectedRequirements) {
        updateRequirement(id, { needToDo: batchNeedToDoValue as '是' | '否' });
      }
      
      setBatchNeedToDoValue('');
      toast.success(`已批量更新 ${selectedRequirements.length} 条需求`);
    }
  }, [batchNeedToDoValue, selectedRequirements, updateRequirement]);



  /**
   * 清空选择
   * 取消所有已选中的需求
   */
  const handleClearSelection = useCallback(() => {
    handleSelectAll(false);
  }, [handleSelectAll]);

  /**
   * 创建新需求
   * 跳转到新建需求页面
   */
  const handleCreateNew = useCallback(() => {
    router.push('/requirements/new');
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* 筛选面板 */}
        <FilterPanel
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          customFilters={customFilters}
          hiddenColumns={hiddenColumns}
          columnOrder={columnOrder}
          stats={stats}
          filterableColumns={FILTERABLE_COLUMNS as unknown as FilterableColumn[]}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCustomFilterAdd={addCustomFilter}
          onCustomFilterUpdate={updateCustomFilter}
          onCustomFilterRemove={removeCustomFilter}
          onCustomFiltersReset={clearAllFilters}
          onColumnToggle={toggleColumnVisibility}
          onColumnReorder={handleColumnReorder}
          onCreateNew={handleCreateNew}
        />

        {/* 批量操作 */}
        <BatchOperations
          selectedCount={selectedRequirements.length}
          batchNeedToDoValue={batchNeedToDoValue}
          onBatchNeedToDoChange={setBatchNeedToDoValue}
          onBatchNeedToDoUpdate={handleBatchNeedToDoUpdate}
          onClearSelection={handleClearSelection}
        />

        {/* 需求表格 - 自动切换虚拟滚动 */}
        {filteredRequirements.length > 100 ? (
          // 大数据量：使用虚拟滚动
          <VirtualizedRequirementTable
            requirements={filteredRequirements}
            selectedRequirements={selectedRequirements}
            hiddenColumns={hiddenColumns}
            columnOrder={columnOrder}
            sortConfig={sortConfig}
            onRequirementSelect={handleRequirementSelect}
            onSelectAll={handleSelectAll}
            onNeedToDoChange={handleNeedToDoChange}
            onPriorityChange={handlePriorityChange}
            onColumnSort={handleColumnSort}
          />
        ) : (
          // 小数据量：使用普通表格
          <RequirementTable
            requirements={filteredRequirements}
            selectedRequirements={selectedRequirements}
            hiddenColumns={hiddenColumns}
            columnOrder={columnOrder}
            sortConfig={sortConfig}
            onRequirementSelect={handleRequirementSelect}
            onSelectAll={handleSelectAll}
            onNeedToDoChange={handleNeedToDoChange}
            onPriorityChange={handlePriorityChange}
            onColumnSort={handleColumnSort}
          />
        )}

        {/* 空状态 */}
        {filteredRequirements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || customFilters.length > 0 || statusFilter !== '全部' 
                ? '没有找到符合条件的需求' 
                : '暂无需求数据'
              }
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
