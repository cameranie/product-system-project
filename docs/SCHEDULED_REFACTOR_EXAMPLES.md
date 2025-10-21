# 预排期页面重构 - 代码示例

## 📁 完整代码示例

以下是各个拆分文件的完整实现代码。

---

## 1. 筛选栏组件 `components/ScheduledFilters/index.tsx`

```tsx
'use client';

import { SearchInput } from './SearchInput';
import { FilterSettings } from './FilterSettings';
import { ColumnSettings } from './ColumnSettings';

interface ScheduledFiltersProps {
  searchTerm: string;
  customFilters: Array<{
    id: string;
    column: string;
    operator: string;
    value: string;
  }>;
  columnOrder: string[];
  hiddenColumns: string[];
  onSearch: (term: string) => void;
  onFilterChange: {
    add: () => void;
    update: (id: string, field: string, value: string) => void;
    remove: (id: string) => void;
  };
  onClearFilters: () => void;
  onToggleColumn: (column: string) => void;
  onColumnReorder: (newOrder: string[]) => void;
  onResetColumns: () => void;
}

/**
 * 预排期筛选栏
 */
export function ScheduledFilters({
  searchTerm,
  customFilters,
  columnOrder,
  hiddenColumns,
  onSearch,
  onFilterChange,
  onClearFilters,
  onToggleColumn,
  onColumnReorder,
  onResetColumns,
}: ScheduledFiltersProps) {
  // 有效的筛选条件数量
  const validFilterCount = customFilters.filter(
    f => f.column && f.operator && f.value.trim() !== ''
  ).length;

  return (
    <div className="sticky top-0 z-20 bg-background">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <SearchInput value={searchTerm} onChange={onSearch} />

          {/* 筛选设置 */}
          <FilterSettings
            filters={customFilters}
            validCount={validFilterCount}
            onAdd={onFilterChange.add}
            onUpdate={onFilterChange.update}
            onRemove={onFilterChange.remove}
            onClearAll={onClearFilters}
          />

          {/* 列设置 */}
          <ColumnSettings
            columnOrder={columnOrder}
            hiddenColumns={hiddenColumns}
            onToggleColumn={onToggleColumn}
            onReorder={onColumnReorder}
            onReset={onResetColumns}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 2. 搜索框组件 `components/ScheduledFilters/SearchInput.tsx`

```tsx
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 搜索输入框
 */
export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="搜索需求标题、ID、创建人..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
```

---

## 3. 筛选设置组件 `components/ScheduledFilters/FilterSettings.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  SCHEDULED_FILTERABLE_COLUMNS,
  SCHEDULED_FILTER_OPERATORS,
} from '@/config/scheduled-requirements';
import { UI_SIZES } from '@/config/requirements';

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface FilterSettingsProps {
  filters: FilterCondition[];
  validCount: number;
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

/**
 * 高级筛选设置
 */
export function FilterSettings({
  filters,
  validCount,
  onAdd,
  onUpdate,
  onRemove,
  onClearAll,
}: FilterSettingsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={validCount > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
        >
          <Settings className="h-4 w-4 mr-2" />
          {validCount > 0 ? `${validCount} 筛选设置` : '筛选设置'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[600px]" sideOffset={4}>
        {filters.map((filter) => (
          <div key={filter.id} className="p-2">
            <div className="flex items-center gap-2">
              {/* 列选择 */}
              <Select
                value={filter.column}
                onValueChange={(value) => onUpdate(filter.id, 'column', value)}
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

              {/* 操作符选择 */}
              <Select
                value={filter.operator}
                onValueChange={(value) => onUpdate(filter.id, 'operator', value)}
              >
                <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.SMALL}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULED_FILTER_OPERATORS.map((op) => (
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
                onChange={(e) => onUpdate(filter.id, 'value', e.target.value)}
                className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} flex-1`}
                disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
              />

              {/* 删除按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(filter.id)}
                className={UI_SIZES.BUTTON.ICON_MEDIUM}
              >
                <Trash2 className={UI_SIZES.ICON.SMALL} />
              </Button>
            </div>
          </div>
        ))}

        <DropdownMenuSeparator />
        
        <div className="p-2 flex gap-2">
          <Button onClick={onAdd} variant="outline" size="sm" className="flex-1">
            <Plus className="h-3 w-3 mr-1" />
            添加条件
          </Button>
          {validCount > 0 && (
            <Button onClick={onClearAll} variant="outline" size="sm" className="flex-1">
              <Trash2 className="h-3 w-3 mr-1" />
              清空所有
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 4. 列设置组件 `components/ScheduledFilters/ColumnSettings.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EyeOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SCHEDULED_FILTERABLE_COLUMNS } from '@/config/scheduled-requirements';

interface ColumnSettingsProps {
  columnOrder: string[];
  hiddenColumns: string[];
  onToggleColumn: (column: string) => void;
  onReorder: (newOrder: string[]) => void;
  onReset: () => void;
}

/**
 * 可排序的列项
 */
interface SortableColumnItemProps {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (columnId: string) => void;
}

function SortableColumnItem({ id, label, isVisible, onToggle }: SortableColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

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

/**
 * 列显示/隐藏设置
 */
export function ColumnSettings({
  columnOrder,
  hiddenColumns,
  onToggleColumn,
  onReorder,
  onReset,
}: ColumnSettingsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  // 有序的列配置
  const orderedColumns = columnOrder
    .map(id => SCHEDULED_FILTERABLE_COLUMNS.find(col => col.value === id))
    .filter(Boolean) as typeof SCHEDULED_FILTERABLE_COLUMNS;

  return (
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
      <DropdownMenuContent align="end" className="w-64">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
            {orderedColumns.map((col) => (
              <SortableColumnItem
                key={col.value}
                id={col.value}
                label={col.label}
                isVisible={!hiddenColumns.includes(col.value)}
                onToggle={onToggleColumn}
              />
            ))}
          </SortableContext>
        </DndContext>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            onClick={() => {
              onReset();
              toast.success('已恢复默认列设置');
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            恢复默认
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 5. 批量操作栏 `components/BatchActionsBar.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X } from 'lucide-react';

interface BatchActionsBarProps {
  selectionCount: number;
  versions: string[];
  onClearSelection: () => void;
  onBatchAssignVersion: (version: string) => void;
  onBatchReview: (level: number, status: 'approved' | 'rejected') => void;
  onBatchIsOperational: (value: 'yes' | 'no') => void;
}

/**
 * 批量操作栏
 */
export function BatchActionsBar({
  selectionCount,
  versions,
  onClearSelection,
  onBatchAssignVersion,
  onBatchReview,
  onBatchIsOperational,
}: BatchActionsBarProps) {
  return (
    <div className="px-4 pb-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              已选择 <span className="text-blue-600">{selectionCount}</span> 个需求
            </span>
            <Button size="sm" variant="outline" onClick={onClearSelection}>
              <X className="h-3 w-3 mr-1" />
              取消选择
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* 批量分配版本 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  批量分配版本
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {versions.map(version => (
                  <DropdownMenuItem
                    key={version}
                    onClick={() => onBatchAssignVersion(version)}
                  >
                    {version}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 批量评审 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  批量评审
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBatchReview(1, 'approved')}>
                  一级评审通过
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchReview(1, 'rejected')}>
                  一级评审不通过
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchReview(2, 'approved')}>
                  二级评审通过
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchReview(2, 'rejected')}>
                  二级评审不通过
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 批量设置运营 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  批量是否运营
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBatchIsOperational('yes')}>
                  设置为 是
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchIsOperational('no')}>
                  设置为 否
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. 表格主组件 `components/ScheduledTable/index.tsx`

```tsx
'use client';

import { Requirement } from '@/lib/requirements-store';
import { TableHeader } from './TableHeader';
import { VersionGroup } from './VersionGroup';
import { AlertCircle } from 'lucide-react';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface ScheduledTableProps {
  groupedRequirements: Record<string, Requirement[]>;
  expandedVersions: Set<string>;
  selectedRequirements: string[];
  selectedIndexes: string[];
  versionBatchModes: Record<string, boolean>;
  columnOrder: string[];
  hiddenColumns: string[];
  sortConfig: SortConfig;
  onToggleVersion: (version: string) => void;
  onSelectRequirement: (id: string, checked: boolean) => void;
  onSelectAll: (version: string, checked: boolean) => void;
  onToggleVersionBatchMode: (version: string, enabled: boolean) => void;
  onOpenReviewDialog: (requirement: Requirement, level: number) => void;
  onSort: (field: string) => void;
  isColumnVisible: (column: string) => boolean;
}

/**
 * 预排期主表格
 */
export function ScheduledTable({
  groupedRequirements,
  expandedVersions,
  selectedRequirements,
  selectedIndexes,
  versionBatchModes,
  columnOrder,
  hiddenColumns,
  sortConfig,
  onToggleVersion,
  onSelectRequirement,
  onSelectAll,
  onToggleVersionBatchMode,
  onOpenReviewDialog,
  onSort,
  isColumnVisible,
}: ScheduledTableProps) {
  const hasData = Object.keys(groupedRequirements).length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>没有找到预排期需求</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <div className="border rounded-lg overflow-hidden" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <div style={{ minWidth: '1400px' }}>
            {/* 固定表头 */}
            <TableHeader
              columnOrder={columnOrder}
              sortConfig={sortConfig}
              isColumnVisible={isColumnVisible}
              onSort={onSort}
            />

            {/* 版本分组列表 */}
            <div className="space-y-0">
              {Object.entries(groupedRequirements).map(([version, requirements]) => (
                <VersionGroup
                  key={version}
                  version={version}
                  requirements={requirements}
                  isExpanded={expandedVersions.has(version)}
                  isBatchMode={versionBatchModes[version] || false}
                  selectedRequirements={selectedRequirements}
                  selectedIndexes={selectedIndexes}
                  columnOrder={columnOrder}
                  onToggleExpand={() => onToggleVersion(version)}
                  onSelectRequirement={onSelectRequirement}
                  onSelectAll={(checked) => onSelectAll(version, checked)}
                  onToggleBatchMode={(enabled) => onToggleVersionBatchMode(version, enabled)}
                  onOpenReviewDialog={onOpenReviewDialog}
                  isColumnVisible={isColumnVisible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. 表格头部 `components/ScheduledTable/TableHeader.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SCHEDULED_COLUMN_WIDTHS } from '@/config/scheduled-requirements';
import { UI_SIZES } from '@/config/requirements';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface TableHeaderProps {
  columnOrder: string[];
  sortConfig: SortConfig;
  isColumnVisible: (column: string) => boolean;
  onSort: (field: string) => void;
}

/**
 * 表格头部
 */
export function TableHeader({
  columnOrder,
  sortConfig,
  isColumnVisible,
  onSort,
}: TableHeaderProps) {
  const renderSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className={UI_SIZES.ICON.SMALL} />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className={UI_SIZES.ICON.SMALL} />
    ) : (
      <ArrowDown className={UI_SIZES.ICON.SMALL} />
    );
  };

  const renderHeaderCell = (columnId: string) => {
    if (!isColumnVisible(columnId)) return null;

    const width = SCHEDULED_COLUMN_WIDTHS[columnId] || 128;
    const baseStyle = {
      width: `${width}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`,
    };

    let stickyClass = 'h-10 px-2 text-left align-middle font-medium text-sm text-muted-foreground border-r';
    let stickyStyle: React.CSSProperties = baseStyle;

    // 处理sticky列
    if (columnId === 'index') {
      stickyClass += ' sticky z-50';
      stickyStyle = {
        ...baseStyle,
        left: '0px',
        backgroundColor: 'hsl(var(--muted) / 0.5)',
        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)',
      };
    } else if (columnId === 'title') {
      const indexWidth = SCHEDULED_COLUMN_WIDTHS['index'] || 80;
      stickyClass += ' sticky z-50';
      stickyStyle = {
        ...baseStyle,
        left: `${indexWidth}px`,
        backgroundColor: 'hsl(var(--muted) / 0.5)',
        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)',
      };
    }

    // 根据列类型渲染
    switch (columnId) {
      case 'index':
        return (
          <th key={columnId} className={stickyClass} style={stickyStyle}>
            <div className="flex items-center justify-center text-center w-full" />
          </th>
        );

      case 'id':
        return (
          <th key={columnId} className={`${stickyClass} whitespace-nowrap`} style={stickyStyle}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSort('id')}
              className="hover:bg-transparent whitespace-nowrap"
            >
              ID
              {renderSortIcon('id')}
            </Button>
          </th>
        );

      case 'title':
        return (
          <th key={columnId} className={stickyClass} style={stickyStyle}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSort('title')}
              className="hover:bg-transparent whitespace-nowrap"
            >
              标题
              {renderSortIcon('title')}
            </Button>
          </th>
        );

      case 'priority':
        return (
          <th key={columnId} className={`${stickyClass} whitespace-nowrap`} style={stickyStyle}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSort('priority')}
              className="hover:bg-transparent whitespace-nowrap"
            >
              优先级
              {renderSortIcon('priority')}
            </Button>
          </th>
        );

      // 其他列...
      default:
        return (
          <th key={columnId} className={`${stickyClass} whitespace-nowrap`} style={stickyStyle}>
            {columnId}
          </th>
        );
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {columnOrder.map(columnId => renderHeaderCell(columnId))}
          </tr>
        </thead>
      </table>
    </div>
  );
}
```

---

## 8. 工具函数 `utils/scheduled-helpers.ts`

```tsx
import { Requirement } from '@/lib/requirements-store';

/**
 * 计算总评审状态
 */
export function getOverallReviewStatus(requirement: Requirement): string {
  if (!requirement.scheduledReview || !requirement.scheduledReview.reviewLevels) {
    return 'pending';
  }

  const level1 = requirement.scheduledReview.reviewLevels.find(r => r.level === 1);
  const level2 = requirement.scheduledReview.reviewLevels.find(r => r.level === 2);

  // 一级评审不通过
  if (level1?.status === 'rejected') {
    return 'level1_rejected';
  }

  // 一级评审通过，但二级评审不通过
  if (level1?.status === 'approved' && level2?.status === 'rejected') {
    return 'level2_rejected';
  }

  // 两级都通过
  if (level1?.status === 'approved' && level2?.status === 'approved') {
    return 'approved';
  }

  // 一级评审通过，二级待评审
  if (level1?.status === 'approved' && (!level2 || level2?.status === 'pending')) {
    return 'level1_approved';
  }

  // 默认：待一级评审
  return 'pending';
}

/**
 * 获取评审级别信息
 */
export function getReviewLevelInfo(requirement: Requirement, level: number) {
  if (!requirement.scheduledReview || !requirement.scheduledReview.reviewLevels) {
    return null;
  }
  return requirement.scheduledReview.reviewLevels.find(r => r.level === level);
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 计算版本的选择状态
 */
export function getVersionSelectionState(
  requirements: Requirement[],
  selectedIds: string[]
): {
  allSelected: boolean;
  someSelected: boolean;
  noneSelected: boolean;
} {
  const requirementIds = requirements.map(r => r.id);
  const selectedCount = requirementIds.filter(id => selectedIds.includes(id)).length;

  return {
    allSelected: selectedCount === requirementIds.length && requirementIds.length > 0,
    someSelected: selectedCount > 0 && selectedCount < requirementIds.length,
    noneSelected: selectedCount === 0,
  };
}
```

---

## 🔄 迁移流程图

```
┌─────────────────────────────────────────────┐
│ 当前状态: page.tsx (2203行)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 步骤1: 创建 Hooks (独立功能)                  │
│ - useScheduledColumns.ts                    │
│ - useScheduledSelection.ts                  │
│ - useScheduledReview.ts                     │
│ - useScheduledBatchActions.ts               │
│ - useScheduledData.ts                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 步骤2: 创建组件 (UI层)                        │
│ - ScheduledFilters/                         │
│   ├── SearchInput.tsx                       │
│   ├── FilterSettings.tsx                    │
│   └── ColumnSettings.tsx                    │
│ - BatchActionsBar.tsx                       │
│ - ScheduledTable/                           │
│   ├── TableHeader.tsx                       │
│   ├── VersionGroup.tsx                      │
│   └── TableRow.tsx                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 步骤3: 重构主文件                             │
│ - 导入新的 Hooks 和组件                       │
│ - 替换原有代码                               │
│ - 删除已迁移的代码                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 最终状态: page.tsx (~150行)                  │
│ + 5个 Hooks (~770行)                        │
│ + 10个组件 (~1200行)                        │
│ + 2个工具文件 (~200行)                      │
│ = 总计 ~2320行 (分布在17个文件中)            │
└─────────────────────────────────────────────┘
```

---

## ✅ 验证清单

每完成一个步骤后，请验证：

### Hook 创建完成后
- [ ] 所有 Hook 都有正确的类型定义
- [ ] 没有 TypeScript 错误
- [ ] 可以独立导入使用
- [ ] 有清晰的注释说明

### 组件创建完成后
- [ ] 所有组件都有 props 接口定义
- [ ] UI 渲染正确
- [ ] 事件处理正常
- [ ] 样式与原页面一致

### 主文件重构后
- [ ] 所有功能正常工作
- [ ] 没有控制台错误
- [ ] 性能没有下降
- [ ] 代码行数 < 200行

### 最终验收
- [ ] 通过所有功能测试
- [ ] 没有 ESLint 警告
- [ ] 代码可读性提升
- [ ] 便于后续维护

---

## 📚 参考资料

- [React Hook 最佳实践](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [组件拆分原则](https://react.dev/learn/thinking-in-react)
- [状态管理模式](https://react.dev/learn/managing-state)

