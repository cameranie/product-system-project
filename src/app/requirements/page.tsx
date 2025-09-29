'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { useRequirementsStore } from '@/lib/requirements-store';
import { RequirementTable } from '@/components/requirements/RequirementTable';
import { FilterPanel } from '@/components/requirements/FilterPanel';
import { BatchOperations } from '@/components/requirements/BatchOperations';
import { useRequirementFilters } from '@/hooks/useRequirementFilters';
import { FILTERABLE_COLUMNS } from '@/config/requirements';

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

  // 处理需求更新 - 优化响应速度
  const handleNeedToDoChange = useCallback((requirementId: string, value: string) => {
    updateRequirement(requirementId, { needToDo: value as any });
  }, [updateRequirement]);

  const handlePriorityChange = useCallback((requirementId: string, value: string) => {
    updateRequirement(requirementId, { priority: value as any });
  }, [updateRequirement]);

  // 批量操作
  const handleBatchNeedToDoUpdate = useCallback(() => {
    if (batchNeedToDoValue && selectedRequirements.length > 0) {
      selectedRequirements.forEach(id => {
        updateRequirement(id, { needToDo: batchNeedToDoValue as any });
      });
      setBatchNeedToDoValue('');
    }
  }, [batchNeedToDoValue, selectedRequirements, updateRequirement]);



  const handleClearSelection = useCallback(() => {
    handleSelectAll(false);
  }, [handleSelectAll]);

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
          stats={stats}
          filterableColumns={FILTERABLE_COLUMNS}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCustomFilterAdd={addCustomFilter}
          onCustomFilterUpdate={updateCustomFilter}
          onCustomFilterRemove={removeCustomFilter}
          onCustomFiltersReset={clearAllFilters}
          onColumnToggle={toggleColumnVisibility}
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

        {/* 需求表格 */}
        <RequirementTable
          requirements={filteredRequirements}
          selectedRequirements={selectedRequirements}
          hiddenColumns={hiddenColumns}
          sortConfig={sortConfig}
          onRequirementSelect={handleRequirementSelect}
          onSelectAll={handleSelectAll}
          onNeedToDoChange={handleNeedToDoChange}
          onPriorityChange={handlePriorityChange}
          onColumnSort={handleColumnSort}
        />

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
