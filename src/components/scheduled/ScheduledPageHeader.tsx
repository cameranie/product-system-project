/**
 * 预排期页面头部组件
 * 
 * 包含搜索栏、筛选设置、列管理等功能
 * 
 * @module ScheduledPageHeader
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Settings,
  EyeOff,
  Trash2,
  Plus,
} from 'lucide-react';
import { UI_SIZES } from '@/config/requirements';
import { SCHEDULED_FILTERABLE_COLUMNS } from '@/config/scheduled-requirements';

/**
 * 筛选条件接口
 */
interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

/**
 * 筛选操作符
 */
const FILTER_OPERATORS = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
];

/**
 * 组件属性
 */
interface ScheduledPageHeaderProps {
  /** 搜索词 */
  searchTerm: string;
  /** 搜索词变更回调 */
  onSearchChange: (term: string) => void;
  /** 自定义筛选条件 */
  customFilters: FilterCondition[];
  /** 添加筛选条件 */
  onAddCustomFilter: () => void;
  /** 更新筛选条件 */
  onUpdateCustomFilter: (id: string, field: string, value: string) => void;
  /** 删除筛选条件 */
  onRemoveCustomFilter: (id: string) => void;
  /** 清空所有筛选 */
  onClearAllFilters: () => void;
  /** 隐藏的列 */
  hiddenColumns: string[];
  /** 列顺序 */
  columnOrder: string[];
  /** 切换列显示 */
  onToggleColumn: (column: string) => void;
  /** 列重新排序 */
  onColumnReorder: (newOrder: string[]) => void;
  /** 重置列设置 */
  onResetColumns: () => void;
}

/**
 * 预排期页面头部组件
 */
export function ScheduledPageHeader({
  searchTerm,
  onSearchChange,
  customFilters,
  onAddCustomFilter,
  onUpdateCustomFilter,
  onRemoveCustomFilter,
  onClearAllFilters,
  hiddenColumns,
  columnOrder,
  onToggleColumn,
  onColumnReorder,
  onResetColumns,
}: ScheduledPageHeaderProps) {
  // 获取有效的筛选条件
  const validCustomFilters = customFilters.filter(f => f.column && f.operator && f.value.trim() !== '');

  return (
    <div className="flex items-center gap-3">
      {/* 搜索框 */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索需求标题、ID、创建人..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 筛选设置 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            className={validCustomFilters.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
          >
            <Settings className="h-4 w-4 mr-2" />
            {validCustomFilters.length > 0 ? `${validCustomFilters.length} 筛选设置` : '筛选设置'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[600px]" sideOffset={4}>
          {customFilters.map((filter) => (
            <div key={filter.id} className="p-2">
              <div className="flex items-center gap-2">
                <Select
                  value={filter.column}
                  onValueChange={(value) => onUpdateCustomFilter(filter.id, 'column', value)}
                >
                  <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.MEDIUM}`}>
                    <SelectValue placeholder="选择列" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULED_FILTERABLE_COLUMNS.map((col) => (
                      <SelectItem key={col.value} value={col.value}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filter.operator}
                  onValueChange={(value) => onUpdateCustomFilter(filter.id, 'operator', value)}
                >
                  <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.SMALL}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="筛选值"
                  value={filter.value}
                  onChange={(e) => onUpdateCustomFilter(filter.id, 'value', e.target.value)}
                  className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} flex-1`}
                  disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCustomFilter(filter.id)}
                  className={UI_SIZES.BUTTON.ICON_MEDIUM}
                >
                  <Trash2 className={UI_SIZES.ICON.SMALL} />
                </Button>
              </div>
            </div>
          ))}
          
          <DropdownMenuSeparator />
          <div className="p-2 flex gap-2">
            <Button onClick={onAddCustomFilter} variant="outline" size="sm" className="flex-1">
              <Plus className="h-3 w-3 mr-1" />
              添加条件
            </Button>
            {validCustomFilters.length > 0 && (
              <Button onClick={onClearAllFilters} variant="outline" size="sm" className="flex-1">
                <Trash2 className="h-3 w-3 mr-1" />
                清空所有
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 列隐藏控制 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            className={hiddenColumns.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            {hiddenColumns.length > 0 ? `${hiddenColumns.length} 列隐藏` : '列隐藏'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64"
          onPointerLeave={(e) => {
            const target = e.target as HTMLElement;
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (relatedTarget && target.contains(relatedTarget)) {
              e.preventDefault();
            }
          }}
        >
          {/* TODO: 这里需要集成拖拽排序功能 */}
          <div className="p-2">
            <Button 
              onClick={onResetColumns} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              恢复默认
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}






