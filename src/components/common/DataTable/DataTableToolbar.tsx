'use client';

import { DataTableSearch } from './DataTableSearch';
import { DataTableFilters } from './DataTableFilters';
import { DataTableColumns } from './DataTableColumns';
import { FilterCondition, FilterableColumn, FilterOperator } from './types';

export interface DataTableToolbarProps {
  // 搜索相关
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;

  // 筛选相关
  filters?: FilterCondition[];
  filterableColumns?: FilterableColumn[];
  filterOperators?: FilterOperator[];
  onFilterAdd?: () => void;
  onFilterUpdate?: (id: string, field: string, value: string) => void;
  onFilterRemove?: (id: string) => void;
  onFiltersClear?: () => void;

  // 列控制相关
  columns?: string[];
  hiddenColumns?: string[];
  columnsConfig?: Record<string, { label: string }>;
  onColumnToggle?: (column: string) => void;
  onColumnsReorder?: (newOrder: string[]) => void;
  onColumnsReset?: () => void;
}

/**
 * 通用数据表格工具栏组件
 * 
 * 整合搜索、筛选、列控制功能
 * 可用于任何数据表格页面
 * 
 * @example
 * ```tsx
 * <DataTableToolbar
 *   searchValue={searchTerm}
 *   searchPlaceholder="搜索需求..."
 *   onSearchChange={setSearchTerm}
 *   filters={customFilters}
 *   filterableColumns={FILTERABLE_COLUMNS}
 *   onFilterAdd={addFilter}
 *   onFilterUpdate={updateFilter}
 *   onFilterRemove={removeFilter}
 *   onFiltersClear={clearAllFilters}
 *   columns={columnOrder}
 *   hiddenColumns={hiddenColumns}
 *   columnsConfig={COLUMNS_CONFIG}
 *   onColumnToggle={toggleColumn}
 *   onColumnsReorder={reorderColumns}
 *   onColumnsReset={resetColumns}
 * />
 * ```
 */
export function DataTableToolbar({
  searchValue,
  searchPlaceholder = '搜索...',
  onSearchChange,
  filters,
  filterableColumns,
  filterOperators,
  onFilterAdd,
  onFilterUpdate,
  onFilterRemove,
  onFiltersClear,
  columns,
  hiddenColumns,
  columnsConfig,
  onColumnToggle,
  onColumnsReorder,
  onColumnsReset,
}: DataTableToolbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-background">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <DataTableSearch
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={onSearchChange}
          />

          {/* 高级筛选 */}
          {filters && filterableColumns && (
            <DataTableFilters
              filters={filters}
              filterableColumns={filterableColumns}
              filterOperators={filterOperators}
              onAdd={onFilterAdd}
              onUpdate={onFilterUpdate}
              onRemove={onFilterRemove}
              onClearAll={onFiltersClear}
            />
          )}

          {/* 列显示控制 */}
          {columns && hiddenColumns && columnsConfig && (
            <DataTableColumns
              columns={columns}
              hiddenColumns={hiddenColumns}
              columnsConfig={columnsConfig}
              onToggle={onColumnToggle}
              onReorder={onColumnsReorder}
              onReset={onColumnsReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

