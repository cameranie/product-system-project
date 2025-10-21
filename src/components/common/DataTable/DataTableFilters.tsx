'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { FilterCondition, FilterableColumn, FilterOperator } from './types';

export interface DataTableFiltersProps {
  filters: FilterCondition[];
  filterableColumns: FilterableColumn[];
  filterOperators?: FilterOperator[];
  onAdd?: () => void;
  onUpdate?: (id: string, field: string, value: string) => void;
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
}

const DEFAULT_OPERATORS: FilterOperator[] = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'starts_with', label: '开始于' },
  { value: 'ends_with', label: '结束于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
];

/**
 * 通用数据表格筛选组件
 * 
 * 提供高级筛选功能，支持多个筛选条件的添加、编辑、删除
 * 
 * @example
 * ```tsx
 * <DataTableFilters
 *   filters={customFilters}
 *   filterableColumns={FILTERABLE_COLUMNS}
 *   onAdd={addFilter}
 *   onUpdate={updateFilter}
 *   onRemove={removeFilter}
 *   onClearAll={clearAllFilters}
 * />
 * ```
 */
export function DataTableFilters({
  filters,
  filterableColumns,
  filterOperators = DEFAULT_OPERATORS,
  onAdd,
  onUpdate,
  onRemove,
  onClearAll,
}: DataTableFiltersProps) {
  // 有效的筛选条件数量（列、操作符、值都不为空）
  const validFilterCount = filters.filter(
    f => f.column && f.operator && f.value.trim() !== ''
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={validFilterCount > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
          aria-label={validFilterCount > 0 ? `${validFilterCount} 个筛选条件` : '筛选设置'}
        >
          <Settings className="h-4 w-4 mr-2" />
          {validFilterCount > 0 ? `${validFilterCount} 筛选设置` : '筛选设置'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[600px] z-[200]" sideOffset={4}>
        {/* 筛选条件列表 */}
        {filters.map((filter) => (
          <div key={filter.id} className="p-2">
            <div className="flex items-center gap-2">
              {/* 列选择 */}
              <Select
                value={filter.column}
                onValueChange={(value) => onUpdate?.(filter.id, 'column', value)}
              >
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="选择列" />
                </SelectTrigger>
                <SelectContent>
                  {filterableColumns.map((col) => (
                    <SelectItem key={col.value} value={col.value}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 操作符选择 */}
              <Select
                value={filter.operator}
                onValueChange={(value) => onUpdate?.(filter.id, 'operator', value)}
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOperators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 筛选值输入 */}
              <Input
                placeholder="筛选值"
                value={filter.value}
                onChange={(e) => onUpdate?.(filter.id, 'value', e.target.value)}
                className="h-9 flex-1"
                disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
              />

              {/* 删除按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove?.(filter.id)}
                className="h-9 w-9 p-0"
                aria-label="删除筛选条件"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <DropdownMenuSeparator />

        {/* 操作按钮 */}
        <div className="p-2 flex gap-2">
          <Button 
            onClick={onAdd} 
            variant="outline" 
            size="sm" 
            className="flex-1"
            aria-label="添加筛选条件"
          >
            <Plus className="h-3 w-3 mr-1" />
            添加条件
          </Button>
          {validFilterCount > 0 && (
            <Button 
              onClick={onClearAll} 
              variant="outline" 
              size="sm" 
              className="flex-1"
              aria-label="清空所有筛选条件"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              清空所有
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

