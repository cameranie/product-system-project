'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRequirementsStore } from '@/lib/requirements-store';
import { RequirementTable } from '@/components/requirements/RequirementTable';
import { VirtualizedRequirementTable } from '@/components/requirements/VirtualizedRequirementTable';
import { FilterPanel } from '@/components/requirements/FilterPanel';
import { useRequirementFilters } from '@/hooks/useRequirementFilters';
import { FILTERABLE_COLUMNS } from '@/config/requirements';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X } from 'lucide-react';
import { validateNeedToDo, validatePriority, validateRequirementIds } from '@/lib/input-validation';
import { executeSyncBatchOperation } from '@/lib/batch-operations';
import { RequirementTableSkeleton } from '@/components/ui/table-skeleton';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

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
  
  // 批量选择模式
  const [batchMode, setBatchMode] = useState(false);
  
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
    resetColumns,
    handleRequirementSelect,
    handleSelectAll
  } = useRequirementFilters({ requirements });

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
   * P1: 添加输入验证和错误处理
   * 
   * @param requirementId - 需求ID
   * @param value - 新的"是否要做"值（'是' | '否' | ''）
   */
  const handleNeedToDoChange = useCallback((requirementId: string, value: string) => {
    // P0: 输入验证
    const validationResult = validateNeedToDo(value);
    if (!validationResult.valid) {
      console.error('Invalid needToDo value:', value);
      toast.error(validationResult.error || '无效的选项值');
      return;
    }
    
    try {
      // 如果验证通过的值为 undefined，说明是取消选择
      updateRequirement(requirementId, { needToDo: validationResult.value });
    } catch (error: unknown) {
      console.error('更新失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试';
      toast.error(errorMessage);
    }
  }, [updateRequirement]);

  /**
   * 处理优先级变更
   * 
   * 性能优化：使用 useCallback 包装，避免子组件不必要的重渲染
   * P1: 添加输入验证和错误处理
   * 
   * @param requirementId - 需求ID
   * @param value - 新的优先级值（'低' | '中' | '高' | '紧急' | ''）
   */
  const handlePriorityChange = useCallback((requirementId: string, value: string) => {
    // P0: 输入验证
    const validationResult = validatePriority(value);
    if (!validationResult.valid) {
      console.error('Invalid priority value:', value);
      toast.error(validationResult.error || '无效的优先级');
      return;
    }
    
    try {
      // 如果验证通过的值为 undefined，说明是取消选择
      updateRequirement(requirementId, { priority: validationResult.value });
    } catch (error: unknown) {
      console.error('更新失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试';
      toast.error(errorMessage);
    }
  }, [updateRequirement]);

  /**
   * 批量操作 - 批量更新"是否要做"字段
   * 
   * P1 功能稳定性修复：
   * - ✅ 添加输入验证
   * - ✅ 添加批量操作限制
   * - ✅ 统一错误处理
   * - ✅ 记录失败项
   */
  const handleBatchNeedToDo = useCallback((value: '是' | '否') => {
    // P0: 输入验证
    const validationResult = validateNeedToDo(value);
    if (!validationResult.valid) {
      toast.error(validationResult.error || '无效的选项值');
      return;
    }

    // P1: 批量操作ID验证（包括数量限制）
    const idsValidation = validateRequirementIds(selectedRequirements.map(r => r.id), 100);
    if (!idsValidation.valid) {
      toast.error(idsValidation.error || '无效的需求选择');
      return;
    }
    
    // P1: 使用统一的批量操作工具
    executeSyncBatchOperation(
      selectedRequirements.map(r => r.id),
      (id) => {
        updateRequirement(id, { needToDo: value });
      },
      {
        operationName: `批量设置是否要做为 ${value}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
    
    // 清空选择
    handleSelectAll(false);
  }, [selectedRequirements, updateRequirement, handleSelectAll]);



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

  /**
   * 聚焦搜索框
   */
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  /**
   * 配置键盘快捷键
   */
  useKeyboardShortcuts([
    {
      key: COMMON_SHORTCUTS.SEARCH,
      description: '聚焦搜索框',
      action: focusSearch,
    },
    {
      key: COMMON_SHORTCUTS.NEW,
      description: '新建需求',
      action: handleCreateNew,
    },
    {
      key: COMMON_SHORTCUTS.CANCEL,
      description: '清空选择',
      action: handleClearSelection,
      enabled: selectedRequirements.length > 0,
    },
    {
      key: COMMON_SHORTCUTS.SELECT_ALL,
      description: '全选',
      action: () => handleSelectAll(true),
      preventDefault: true,
    },
  ]);

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-10 w-80 bg-muted animate-pulse rounded-md"></div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
          </div>
          <RequirementTableSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 固定区域：搜索栏和批量操作 */}
      <div className="sticky top-0 z-20 bg-background">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <FilterPanel
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            customFilters={customFilters}
            hiddenColumns={hiddenColumns}
            columnOrder={columnOrder}
            stats={{
              total: requirements.length,
              open: requirements.filter(r => r.status !== '已关闭').length,
              closed: requirements.filter(r => r.status === '已关闭').length,
            }}
            filterableColumns={FILTERABLE_COLUMNS as unknown as FilterableColumn[]}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onCustomFilterAdd={addCustomFilter}
            onCustomFilterUpdate={updateCustomFilter}
            onCustomFilterRemove={removeCustomFilter}
            onCustomFiltersReset={clearAllFilters}
            onColumnToggle={toggleColumnVisibility}
            onColumnReorder={handleColumnReorder}
            onResetColumns={() => {
              resetColumns();
              toast.success('已恢复默认列设置');
            }}
            onCreateNew={handleCreateNew}
          />

          {/* 批量操作栏 */}
          {selectedRequirements.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    已选择 <span className="text-blue-600">{selectedRequirements.length}</span> 个需求
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearSelection}
                  >
                    <X className="h-3 w-3 mr-1" />
                    取消选择
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        批量是否要做
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[200]">
                      <DropdownMenuItem onClick={() => handleBatchNeedToDo('是')}>
                        设置为 是
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchNeedToDo('否')}>
                        设置为 否
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 pt-4 pb-4">
        {/* 需求表格 - 自动切换虚拟滚动 */}
        {filteredRequirements.length > 100 ? (
          // 大数据量：使用虚拟滚动
          <VirtualizedRequirementTable
            requirements={filteredRequirements}
            selectedRequirements={selectedRequirements.map(r => r.id)}
            hiddenColumns={hiddenColumns}
            columnOrder={columnOrder}
            sortConfig={sortConfig}
            batchMode={batchMode}
            onBatchModeChange={setBatchMode}
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
            selectedRequirements={selectedRequirements.map(r => r.id)}
            hiddenColumns={hiddenColumns}
            columnOrder={columnOrder}
            sortConfig={sortConfig}
            batchMode={batchMode}
            onBatchModeChange={setBatchMode}
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
