'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, EyeOff, Settings, Trash2, GripVertical } from 'lucide-react';
import { UI_SIZES } from '@/config/requirements';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface SortableColumnItemProps {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (columnId: string) => void;
}

function SortableColumnItem({ id, label, isVisible, onToggle }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DropdownMenuItem
      ref={setNodeRef}
      style={style}
      onSelect={(e) => e.preventDefault()}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={isVisible}
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span className="flex-1">{label}</span>
    </DropdownMenuItem>
  );
}

interface FilterableColumn {
  value: string;
  label: string;
}

interface FilterPanelProps {
  searchTerm: string;
  statusFilter: string;
  customFilters: FilterCondition[];
  hiddenColumns: string[];
  columnOrder: string[];
  stats: {
    total: number;
    open: number;
    closed: number;
  };
  filterableColumns: FilterableColumn[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: string) => void;
  onCustomFilterAdd: () => void;
  onCustomFilterUpdate: (id: string, field: string, value: string) => void;
  onCustomFilterRemove: (id: string) => void;
  onCustomFiltersReset: () => void;
  onColumnToggle: (column: string) => void;
  onColumnReorder: (newOrder: string[]) => void;
  onResetColumns?: () => void;
  onCreateNew: () => void;
}

const filterOperators = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'starts_with', label: '开始于' },
  { value: 'ends_with', label: '结束于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
];

export function FilterPanel({
  searchTerm,
  statusFilter,
  customFilters,
  hiddenColumns,
  columnOrder,
  stats,
  filterableColumns,
  onSearchChange,
  onStatusFilterChange,
  onCustomFilterAdd,
  onCustomFilterUpdate,
  onCustomFilterRemove,
  onCustomFiltersReset,
  onColumnToggle,
  onColumnReorder,
  onResetColumns,
  onCreateNew
}: FilterPanelProps) {
  // 验证筛选条件是否完整和有效
  const isValidFilter = (filter: FilterCondition): boolean => {
    return !!(filter.column && filter.operator && filter.value.trim() !== '');
  };

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      onColumnReorder(newOrder);
    }
  };

  // 根据排序获取有序的列
  const orderedColumns = columnOrder
    .map(id => filterableColumns.find(col => col.value === id))
    .filter(Boolean) as FilterableColumn[];

  // 获取有效的筛选条件
  const validCustomFilters = customFilters.filter(isValidFilter);
  return (
    <div className="space-y-4">
      {/* 搜索和操作栏 */}
      <div className="flex items-center gap-4">
        {/* 搜索框 - 固定宽度 */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索标题、创建人、ID、应用端..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
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
          <DropdownMenuContent align="start" className="w-[600px] ml-0" sideOffset={4}>
            <DropdownMenuSeparator />
            {customFilters.map((filter) => (
              <div key={filter.id} className="p-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={filter.column}
                    onValueChange={(value) => onCustomFilterUpdate(filter.id, 'column', value)}
                  >
                    <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.MEDIUM}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterableColumns.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => onCustomFilterUpdate(filter.id, 'operator', value)}
                  >
                    <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.SMALL}`}>
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
                  
                  <Input
                    placeholder="筛选值"
                    value={filter.value}
                    onChange={(e) => onCustomFilterUpdate(filter.id, 'value', e.target.value)}
                    className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} flex-1 ${UI_SIZES.INPUT.MIN_WIDTH}`}
                    style={{ minWidth: '120px' }}
                    disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCustomFilterRemove(filter.id)}
                    className={UI_SIZES.BUTTON.ICON_MEDIUM}
                  >
                    <Trash2 className={UI_SIZES.ICON.SMALL} />
                  </Button>
                </div>
              </div>
            ))}
            
            <DropdownMenuSeparator />
            <div className="p-2 flex gap-2">
              <Button onClick={onCustomFilterAdd} variant="outline" size="sm" className="flex-1">
                <Plus className="h-3 w-3 mr-1" />
                添加条件
              </Button>
              {validCustomFilters.length > 0 && (
                <Button onClick={onCustomFiltersReset} variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" />
                  清空条件
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
              // 防止鼠标还在下拉菜单内时关闭
              const target = e.target as HTMLElement;
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget && target.contains(relatedTarget)) {
                e.preventDefault();
              }
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columnOrder}
                strategy={verticalListSortingStrategy}
              >
                {orderedColumns.map((col) => (
                  <SortableColumnItem
                    key={col.value}
                    id={col.value}
                    label={col.label}
                    isVisible={!hiddenColumns.includes(col.value)}
                    onToggle={onColumnToggle}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {onResetColumns && (
              <>
                <DropdownMenuSeparator />
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1"></div>

        {/* 状态筛选 */}
        <div className="flex">
          <Button
            variant="outline"
            onClick={() => onStatusFilterChange('开放中')}
            className={`rounded-r-none border-r-0 ${
              statusFilter === '开放中' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
            }`}
          >
            开放中 {stats.open}
          </Button>
          <Button
            variant="outline"
            onClick={() => onStatusFilterChange('已关闭')}
            className={`rounded-none border-r-0 ${
              statusFilter === '已关闭' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
            }`}
          >
            已关闭 {stats.closed}
          </Button>
          <Button
            variant="outline"
            onClick={() => onStatusFilterChange('全部')}
            className={`rounded-l-none ${
              statusFilter === '全部' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
            }`}
          >
            全部 {stats.total}
          </Button>
        </div>

        {/* 新建需求按钮 */}
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          新建需求
        </Button>
      </div>


    </div>
  );
} 