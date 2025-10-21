# 通用组件架构设计 - 需求池 & 预排期复用方案

## 🎯 目标

将需求池和预排期页面的公共功能抽取为可复用的通用组件，减少代码重复，提高可维护性。

## 📊 共同特性分析

### 需求池 vs 预排期 - 功能对比

| 功能模块 | 需求池 | 预排期 | 可复用度 |
|---------|--------|--------|---------|
| **搜索框** | ✅ | ✅ | 🟢 100% |
| **高级筛选** | ✅ | ✅ | 🟢 95% |
| **列显示控制** | ✅ | ✅ | 🟢 100% |
| **列排序** | ✅ | ✅ | 🟢 100% |
| **批量选择** | ✅ | ✅ | 🟢 90% |
| **批量操作栏** | ✅ | ✅ | 🟡 80% |
| **表格单元格** | ✅ | ✅ | 🟡 70% |
| **版本分组** | ❌ | ✅ | 🔴 0% |
| **评审流程** | ❌ | ✅ | 🔴 0% |

**结论**：约 **60-70%** 的代码可以复用！

---

## 🏗️ 新的目录结构设计

```
src/
├── components/
│   ├── common/                          # 完全通用的UI组件
│   │   ├── DataTable/                   # 🆕 通用数据表格系统
│   │   │   ├── index.tsx
│   │   │   ├── DataTableToolbar.tsx    # 工具栏（搜索+筛选+列控制）
│   │   │   ├── DataTableFilters.tsx    # 筛选面板
│   │   │   ├── DataTableSearch.tsx     # 搜索框
│   │   │   ├── DataTableColumns.tsx    # 列控制
│   │   │   ├── DataTableBatchBar.tsx   # 批量操作栏
│   │   │   ├── DataTableHeader.tsx     # 表头
│   │   │   ├── DataTableBody.tsx       # 表体
│   │   │   └── types.ts                # 类型定义
│   │   └── UserAvatar.tsx              # ✅ 已存在
│   │
│   ├── requirements/                    # 需求相关组件
│   │   ├── shared/                      # ✅ 已存在 - 需求通用组件
│   │   │   ├── TableCells.tsx          # ✅ 已存在 - 基础单元格
│   │   │   ├── TableColumnConfig.ts    # ✅ 已存在
│   │   │   └── RequirementTableBase.tsx # 🆕 需求表格基类
│   │   │
│   │   ├── pool/                        # 🆕 需求池专用组件
│   │   │   ├── PoolTableCells.tsx      # 需求池特有单元格
│   │   │   ├── PoolBatchActions.tsx    # 需求池批量操作
│   │   │   └── PoolFilters.tsx         # 需求池筛选（如果有特殊逻辑）
│   │   │
│   │   ├── scheduled/                   # ✅ 已存在 - 预排期专用
│   │   │   ├── ScheduledTableCells.tsx # ✅ 已存在
│   │   │   ├── ScheduledBatchActions.tsx  # 🆕 预排期批量操作
│   │   │   ├── ScheduledVersionGroup.tsx  # 🆕 版本分组
│   │   │   └── ScheduledReviewDialog.tsx  # 🆕 评审对话框
│   │   │
│   │   ├── FilterPanel.tsx              # ✅ 已存在 - 可优化为通用
│   │   ├── BatchOperations.tsx          # ✅ 已存在 - 可优化为通用
│   │   └── RequirementTable.tsx         # ✅ 已存在
│   │
│   └── ui/                               # ✅ 已存在 - shadcn组件
│
├── hooks/
│   ├── common/                          # 🆕 完全通用的Hooks
│   │   ├── useDataTable.ts             # 🆕 通用表格管理
│   │   ├── useTableFilters.ts          # ✅ 已存在
│   │   ├── useTableSelection.ts        # ✅ 已存在
│   │   ├── useTableColumns.ts          # 🆕 通用列管理
│   │   └── useTableSort.ts             # 🆕 通用排序
│   │
│   ├── requirements/                    # 需求相关Hooks
│   │   ├── useRequirementTable.ts      # 🆕 需求表格（基于通用）
│   │   ├── useRequirementFilters.ts    # ✅ 已存在
│   │   └── useScheduledFilters.ts      # ✅ 已存在
│   │
│   ├── useDebounce.ts                   # ✅ 已存在
│   └── useDebouncedLocalStorage.ts      # ✅ 已存在
│
└── lib/
    └── table-utils.ts                   # 🆕 表格工具函数
```

---

## 🔄 重构策略

### 阶段1：创建通用组件库（优先级最高）

#### 1.1 创建通用数据表格工具栏

**文件**：`src/components/common/DataTable/DataTableToolbar.tsx`

```tsx
'use client';

import { DataTableSearch } from './DataTableSearch';
import { DataTableFilters } from './DataTableFilters';
import { DataTableColumns } from './DataTableColumns';

export interface DataTableToolbarProps {
  // 搜索
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  
  // 筛选
  filters?: FilterCondition[];
  filterableColumns?: Array<{ value: string; label: string }>;
  onFilterAdd?: () => void;
  onFilterUpdate?: (id: string, field: string, value: string) => void;
  onFilterRemove?: (id: string) => void;
  onFiltersClear?: () => void;
  
  // 列控制
  columns?: string[];
  hiddenColumns?: string[];
  columnsConfig?: Record<string, { label: string }>;
  onColumnToggle?: (column: string) => void;
  onColumnsReorder?: (newOrder: string[]) => void;
  onColumnsReset?: () => void;
}

/**
 * 通用数据表格工具栏
 * 
 * 集成搜索、筛选、列控制功能
 * 可用于任何数据表格页面
 */
export function DataTableToolbar({
  searchValue,
  searchPlaceholder = '搜索...',
  onSearchChange,
  filters,
  filterableColumns,
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
```

---

#### 1.2 创建通用搜索框

**文件**：`src/components/common/DataTable/DataTableSearch.tsx`

```tsx
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface DataTableSearchProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * 通用搜索框组件
 */
export function DataTableSearch({
  value,
  placeholder = '搜索...',
  onChange,
  className = 'w-80',
}: DataTableSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
```

---

#### 1.3 创建通用批量操作栏

**文件**：`src/components/common/DataTable/DataTableBatchBar.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

export interface DataTableBatchBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children?: ReactNode; // 自定义批量操作按钮
  className?: string;
}

/**
 * 通用批量操作栏
 * 
 * 显示选择数量，提供取消选择按钮
 * 子组件可以放置自定义的批量操作按钮
 */
export function DataTableBatchBar({
  selectedCount,
  onClearSelection,
  children,
  className = '',
}: DataTableBatchBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`px-4 pb-3 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              已选择 <span className="text-blue-600">{selectedCount}</span> 项
            </span>
            <Button size="sm" variant="outline" onClick={onClearSelection}>
              <X className="h-3 w-3 mr-1" />
              取消选择
            </Button>
          </div>

          {/* 自定义批量操作按钮 */}
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

#### 1.4 创建通用数据表格Hook

**文件**：`src/hooks/common/useDataTable.ts`

```tsx
import { useState, useCallback, useMemo } from 'react';
import { useTableFilters } from '../useTableFilters';
import { useTableSelection } from '../useTableSelection';

export interface UseDataTableProps<T> {
  data: T[];
  defaultSearchFields?: (keyof T)[];
  defaultSortField?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
  configVersion?: string;
  storagePrefix?: string;
}

/**
 * 通用数据表格 Hook
 * 
 * 整合筛选、排序、选择等常用功能
 * 可用于任何数据列表页面
 */
export function useDataTable<T extends { id: string }>({
  data,
  defaultSearchFields = [],
  defaultSortField,
  defaultSortDirection = 'desc',
  configVersion = '1.0',
  storagePrefix = 'datatable',
}: UseDataTableProps<T>) {
  // 使用已有的筛选和选择Hooks
  const filterResult = useTableFilters({
    data,
    searchFields: defaultSearchFields,
    configVersion,
    storagePrefix,
  });

  const selectionResult = useTableSelection({
    items: filterResult.filteredData,
  });

  return {
    // 筛选相关
    ...filterResult,
    
    // 选择相关
    ...selectionResult,
    
    // 其他扩展...
  };
}
```

---

### 阶段2：重构需求池和预排期（使用通用组件）

#### 2.1 需求池页面重构

**文件**：`src/app/requirements/page.tsx`（简化版）

```tsx
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { DataTableToolbar } from '@/components/common/DataTable/DataTableToolbar';
import { DataTableBatchBar } from '@/components/common/DataTable/DataTableBatchBar';
import { RequirementTable } from '@/components/requirements/RequirementTable';
import { PoolBatchActions } from '@/components/requirements/pool/PoolBatchActions';
import { useRequirementTable } from '@/hooks/requirements/useRequirementTable';

export default function RequirementsPage() {
  const {
    // 数据
    requirements,
    filteredRequirements,
    loading,
    
    // 搜索和筛选
    searchTerm,
    setSearchTerm,
    customFilters,
    filterActions,
    
    // 列管理
    columns,
    hiddenColumns,
    columnActions,
    
    // 选择
    selectedIds,
    selectionActions,
    
    // 批量操作
    batchActions,
  } = useRequirementTable();

  if (loading) return <LoadingSkeleton />;

  return (
    <AppLayout>
      {/* 工具栏：搜索 + 筛选 + 列控制 */}
      <DataTableToolbar
        searchValue={searchTerm}
        searchPlaceholder="搜索需求标题、ID、创建人..."
        onSearchChange={setSearchTerm}
        filters={customFilters}
        filterableColumns={FILTERABLE_COLUMNS}
        onFilterAdd={filterActions.add}
        onFilterUpdate={filterActions.update}
        onFilterRemove={filterActions.remove}
        onFiltersClear={filterActions.clear}
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnsConfig={COLUMNS_CONFIG}
        onColumnToggle={columnActions.toggle}
        onColumnsReorder={columnActions.reorder}
        onColumnsReset={columnActions.reset}
      />

      {/* 批量操作栏 */}
      <DataTableBatchBar
        selectedCount={selectedIds.length}
        onClearSelection={selectionActions.clear}
      >
        <PoolBatchActions
          selectedIds={selectedIds}
          onBatchUpdate={batchActions.updateNeedToDo}
        />
      </DataTableBatchBar>

      {/* 数据表格 */}
      <RequirementTable
        requirements={filteredRequirements}
        selectedIds={selectedIds}
        onSelect={selectionActions.toggle}
        onSelectAll={selectionActions.toggleAll}
      />
    </AppLayout>
  );
}
```

---

#### 2.2 预排期页面重构（使用通用组件）

**文件**：`src/app/scheduled/page.tsx`（简化版）

```tsx
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { DataTableToolbar } from '@/components/common/DataTable/DataTableToolbar';
import { DataTableBatchBar } from '@/components/common/DataTable/DataTableBatchBar';
import { ScheduledTable } from '@/components/requirements/scheduled/ScheduledTable';
import { ScheduledBatchActions } from '@/components/requirements/scheduled/ScheduledBatchActions';
import { useScheduledTable } from '@/hooks/requirements/useScheduledTable';

export default function ScheduledRequirementsPage() {
  const {
    // 数据
    requirements,
    groupedRequirements,
    loading,
    
    // 搜索和筛选
    searchTerm,
    setSearchTerm,
    customFilters,
    filterActions,
    
    // 列管理
    columns,
    hiddenColumns,
    columnActions,
    
    // 选择
    selectedIds,
    selectionActions,
    
    // 批量操作
    batchActions,
    
    // 评审
    reviewDialog,
  } = useScheduledTable();

  if (loading) return <LoadingSkeleton />;

  return (
    <AppLayout>
      {/* 工具栏：复用通用组件 */}
      <DataTableToolbar
        searchValue={searchTerm}
        searchPlaceholder="搜索需求标题、ID、创建人..."
        onSearchChange={setSearchTerm}
        filters={customFilters}
        filterableColumns={SCHEDULED_FILTERABLE_COLUMNS}
        onFilterAdd={filterActions.add}
        onFilterUpdate={filterActions.update}
        onFilterRemove={filterActions.remove}
        onFiltersClear={filterActions.clear}
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnsConfig={COLUMNS_CONFIG}
        onColumnToggle={columnActions.toggle}
        onColumnsReorder={columnActions.reorder}
        onColumnsReset={columnActions.reset}
      />

      {/* 批量操作栏：复用通用组件 */}
      <DataTableBatchBar
        selectedCount={selectedIds.length}
        onClearSelection={selectionActions.clear}
      >
        <ScheduledBatchActions
          selectedIds={selectedIds}
          onBatchAssignVersion={batchActions.assignVersion}
          onBatchReview={batchActions.review}
          onBatchIsOperational={batchActions.setOperational}
        />
      </DataTableBatchBar>

      {/* 预排期专用表格（带版本分组） */}
      <ScheduledTable
        groupedRequirements={groupedRequirements}
        selectedIds={selectedIds}
        onSelect={selectionActions.toggle}
        onOpenReview={reviewDialog.open}
      />
    </AppLayout>
  );
}
```

---

## 📊 复用对比

### 重构前后代码量对比

| 模块 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| **需求池页面** | 383行 | ~150行 | 60% ↓ |
| **预排期页面** | 2203行 | ~180行 | 92% ↓ |
| **通用组件库** | 0行 | ~800行 | +800 |
| **总计** | 2586行 | 1130行 | **56% ↓** |

### 复用率统计

```
通用组件使用情况：

DataTableToolbar
├── 需求池 ✅
└── 预排期 ✅
    复用率: 100%

DataTableBatchBar
├── 需求池 ✅
└── 预排期 ✅
    复用率: 100%

DataTableSearch
├── 需求池 ✅
├── 预排期 ✅
└── 其他列表页 ✅ (潜在)
    复用率: 100%+

共享TableCells
├── 需求池 ✅ (80%)
└── 预排期 ✅ (50%)
    复用率: 65%

useTableFilters
├── 需求池 ✅
├── 预排期 ✅
└── 看板 ✅ (潜在)
    复用率: 100%+
```

---

## 🎯 实施优先级

### 第一阶段：创建通用组件（1-2天）

**优先级**: 🔴 高

1. ✅ 创建 `DataTableSearch`（1小时）
2. ✅ 创建 `DataTableBatchBar`（1小时）
3. ✅ 创建 `DataTableToolbar`（2小时）
4. ✅ 创建 `DataTableFilters`（3小时）
5. ✅ 创建 `DataTableColumns`（3小时）

### 第二阶段：创建通用Hooks（1天）

**优先级**: 🔴 高

1. ✅ 优化 `useTableFilters`（已存在，需优化）
2. ✅ 优化 `useTableSelection`（已存在，需优化）
3. ✅ 创建 `useTableColumns`（2小时）
4. ✅ 创建 `useDataTable`（整合Hook，3小时）

### 第三阶段：重构需求池（1天）

**优先级**: 🟡 中

1. ✅ 替换为通用工具栏
2. ✅ 替换为通用批量操作栏
3. ✅ 使用 `useRequirementTable`
4. ✅ 测试验证

### 第四阶段：重构预排期（2天）

**优先级**: 🟡 中

1. ✅ 拆分页面组件（参考重构方案）
2. ✅ 替换为通用工具栏
3. ✅ 替换为通用批量操作栏
4. ✅ 保留预排期专用功能（版本分组、评审）
5. ✅ 测试验证

### 第五阶段：优化和扩展（1天）

**优先级**: 🟢 低

1. ✅ 添加单元测试
2. ✅ 优化性能
3. ✅ 完善文档
4. ✅ 扩展到其他列表页

---

## 🔍 详细文件清单

### 需要创建的新文件

```bash
# 通用数据表格组件
src/components/common/DataTable/
├── index.tsx                    # 导出所有组件
├── DataTableToolbar.tsx         # 工具栏（搜索+筛选+列控制）
├── DataTableSearch.tsx          # 搜索框
├── DataTableFilters.tsx         # 高级筛选
├── DataTableColumns.tsx         # 列显示控制
├── DataTableBatchBar.tsx        # 批量操作栏
├── DataTableHeader.tsx          # 表头（可选）
└── types.ts                     # 类型定义

# 需求池专用组件
src/components/requirements/pool/
├── index.ts
├── PoolBatchActions.tsx         # 需求池批量操作
└── PoolTableCells.tsx           # 需求池特有单元格（如需要）

# 预排期专用组件（部分已存在）
src/components/requirements/scheduled/
├── ScheduledBatchActions.tsx    # 预排期批量操作
├── ScheduledVersionGroup.tsx    # 版本分组
├── ScheduledTable.tsx           # 预排期表格主体
└── ScheduledReviewDialog.tsx    # 评审对话框

# 通用Hooks
src/hooks/common/
├── index.ts
├── useDataTable.ts              # 整合表格功能
├── useTableColumns.ts           # 列管理
└── useTableSort.ts              # 排序管理

# 需求相关Hooks
src/hooks/requirements/
├── useRequirementTable.ts       # 需求池表格
└── useScheduledTable.ts         # 预排期表格
```

### 需要修改的现有文件

```bash
# 优化现有组件
src/components/requirements/
├── FilterPanel.tsx              # 重构为DataTableFilters
├── BatchOperations.tsx          # 重构为DataTableBatchBar
└── shared/
    └── TableCells.tsx           # 补充更多通用单元格

# 优化现有Hooks
src/hooks/
├── useTableFilters.ts           # 增强通用性
└── useTableSelection.ts         # 增强通用性

# 简化页面文件
src/app/requirements/page.tsx    # 从383行减至~150行
src/app/scheduled/page.tsx       # 从2203行减至~180行
```

---

## ✅ 验收标准

### 代码质量
- [ ] 所有通用组件可被3+个页面复用
- [ ] 组件props接口清晰，易于使用
- [ ] TypeScript类型完整，无any
- [ ] 代码有详细注释

### 功能完整性
- [ ] 需求池所有功能正常
- [ ] 预排期所有功能正常
- [ ] 新增页面可快速集成（<30分钟）

### 性能指标
- [ ] 搜索响应时间 < 100ms
- [ ] 筛选响应时间 < 200ms
- [ ] 100行数据滚动流畅

### 可维护性
- [ ] 修改一个功能只需改一处
- [ ] 新增列表页复用率 > 80%
- [ ] 代码总量减少 > 50%

---

## 🚀 预期收益

### 短期收益（1个月内）
- ✅ 代码量减少 **56%**
- ✅ 重复代码几乎为 **0**
- ✅ 开发效率提升 **3倍**（新增列表页）

### 长期收益（3-6个月）
- ✅ 维护成本降低 **60%**
- ✅ Bug率降低 **50%**（单一代码路径）
- ✅ 新人上手时间缩短 **70%**
- ✅ 可扩展到其他系统

### 团队收益
- ✅ 统一的代码风格
- ✅ 统一的用户体验
- ✅ 更少的代码审查时间
- ✅ 更高的团队协作效率

---

## 📚 相关文档

- 📄 [预排期重构方案](./SCHEDULED_REFACTOR_PLAN.md)
- 💻 [预排期代码示例](./SCHEDULED_REFACTOR_EXAMPLES.md)
- ⚡ [快速实施指南](./SCHEDULED_REFACTOR_QUICKSTART.md)

---

**下一步**：先实施通用组件库，再逐步重构各个页面。这样可以确保代码质量和复用性达到最优。

