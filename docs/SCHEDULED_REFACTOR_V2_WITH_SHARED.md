# 预排期页面重构方案 V2 - 基于通用组件架构

## 🎯 更新说明

本方案是 V1 版本的升级，**优先使用通用组件**，最大化代码复用，确保与需求池等页面保持一致的用户体验。

## 📊 新旧方案对比

| 维度 | V1方案 | V2方案（推荐）| 优势 |
|------|--------|--------------|------|
| **代码复用率** | 0% | 60-70% | ✅ 大幅提升 |
| **开发时间** | 6-10天 | 5-7天 | ✅ 减少30% |
| **维护成本** | 中等 | 低 | ✅ 统一维护 |
| **用户体验** | 不一致 | 一致 | ✅ 体验统一 |
| **扩展性** | 中等 | 优秀 | ✅ 易扩展 |

---

## 🗂️ V2 文件结构（基于通用组件）

```
src/app/scheduled/
├── page.tsx                              # 主入口 (~120行，比V1更简洁)
│
├── hooks/
│   ├── useScheduledTable.ts              # 整合Hook (~200行)
│   ├── useScheduledBatchActions.ts       # 批量操作 (~150行)
│   └── useScheduledReview.ts             # 评审对话框 (~100行)
│
├── components/
│   ├── ScheduledBatchActions.tsx         # 预排期批量操作按钮 (~100行)
│   ├── ScheduledTable/                   # 表格组件
│   │   ├── index.tsx                     # 主表格 (~150行)
│   │   ├── VersionGroup.tsx              # 版本分组 (~150行)
│   │   └── TableRow.tsx                  # 表格行 (~80行)
│   └── ReviewDialog.tsx                  # 评审对话框 (~100行)
│
└── utils/
    └── scheduled-helpers.ts              # 辅助函数 (~100行)

# 复用的通用组件（无需创建）
src/components/common/DataTable/
├── DataTableToolbar.tsx                  # ✅ 复用：工具栏
├── DataTableSearch.tsx                   # ✅ 复用：搜索框
├── DataTableFilters.tsx                  # ✅ 复用：高级筛选
├── DataTableColumns.tsx                  # ✅ 复用：列控制
└── DataTableBatchBar.tsx                 # ✅ 复用：批量操作栏框架

# 复用的共享组件
src/components/requirements/shared/
└── TableCells.tsx                        # ✅ 复用：基础单元格组件
```

---

## 🚀 V2 实施步骤（5-7天）

### 第0步：前置准备（如果通用组件未创建）⏰ 2天

如果通用组件库尚未创建，需要先完成：

1. **创建通用数据表格组件** (1天)
   - `DataTableToolbar`
   - `DataTableSearch`
   - `DataTableFilters`
   - `DataTableColumns`
   - `DataTableBatchBar`

2. **创建通用Hooks** (1天)
   - 优化 `useTableFilters`
   - 优化 `useTableSelection`
   - 创建 `useTableColumns`

👉 详见：[通用组件架构文档](./SHARED_COMPONENTS_ARCHITECTURE.md)

---

### 第1步：创建预排期专用Hooks ⏰ 1天

#### 1.1 `useScheduledTable.ts` - 整合数据管理

**职责**：整合筛选、排序、分组、选择等功能

```tsx
import { useMemo } from 'react';
import { useRequirementsStore } from '@/lib/requirements-store';
import { useScheduledFilters } from '@/hooks/useScheduledFilters';
import { useTableSelection } from '@/hooks/common/useTableSelection';

/**
 * 预排期表格Hook（整合版）
 */
export function useScheduledTable() {
  const allRequirements = useRequirementsStore(state => state.requirements);
  
  // 获取预排期需求
  const scheduledRequirements = useMemo(
    () => allRequirements.filter(req => req.needToDo === '是'),
    [allRequirements]
  );

  // 使用通用筛选Hook
  const {
    searchTerm,
    setSearchTerm,
    customFilters,
    addCustomFilter,
    updateCustomFilter,
    removeCustomFilter,
    clearAllFilters,
    sortConfig,
    handleColumnSort,
    filteredRequirements,
    expandedVersions,
    toggleVersion,
  } = useScheduledFilters({
    requirements: scheduledRequirements,
    // ... 配置
  });

  // 按版本分组
  const groupedRequirements = useMemo(() => {
    const groups: Record<string, Requirement[]> = {};
    filteredRequirements.forEach(req => {
      const version = req.plannedVersion || '未分配版本';
      if (!groups[version]) groups[version] = [];
      groups[version].push(req);
    });
    return groups;
  }, [filteredRequirements]);

  // 使用通用选择Hook
  const selection = useTableSelection({
    items: filteredRequirements,
  });

  return {
    // 数据
    requirements: scheduledRequirements,
    filteredRequirements,
    groupedRequirements,
    
    // 搜索和筛选
    searchTerm,
    setSearchTerm,
    customFilters,
    filterActions: {
      add: addCustomFilter,
      update: updateCustomFilter,
      remove: removeCustomFilter,
      clear: clearAllFilters,
    },
    
    // 排序
    sortConfig,
    onSort: handleColumnSort,
    
    // 版本展开
    expandedVersions,
    toggleVersion,
    
    // 选择
    selectedIds: selection.selectedIds,
    selectionActions: selection.actions,
  };
}
```

#### 1.2 `useScheduledBatchActions.ts` - 批量操作

```tsx
import { useCallback } from 'react';
import { useRequirementsStore } from '@/lib/requirements-store';
import { executeSyncBatchOperationWithProgress } from '@/lib/batch-operations-ui';
import { toast } from 'sonner';

/**
 * 预排期批量操作Hook
 */
export function useScheduledBatchActions(selectedIds: string[]) {
  const { updateRequirement } = useRequirementsStore();
  const allRequirements = useRequirementsStore(state => state.requirements);

  // 批量分配版本
  const assignVersion = useCallback((version: string) => {
    if (selectedIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    executeSyncBatchOperationWithProgress(
      selectedIds,
      (id) => updateRequirement(id, { plannedVersion: version }),
      {
        operationName: `批量分配版本到 ${version}`,
        showSuccessToast: true,
      }
    );
  }, [selectedIds, updateRequirement]);

  // 批量评审
  const review = useCallback((level: number, status: 'approved' | 'rejected') => {
    if (selectedIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const levelName = level === 1 ? '一' : '二';
    const statusText = status === 'approved' ? '通过' : '不通过';

    executeSyncBatchOperationWithProgress(
      selectedIds,
      (id) => {
        const requirement = allRequirements.find(r => r.id === id);
        if (!requirement?.scheduledReview) {
          throw new Error('需求未配置评审流程');
        }

        const updatedLevels = requirement.scheduledReview.reviewLevels.map(l =>
          l.level === level
            ? { ...l, status, reviewedAt: new Date().toISOString() }
            : l
        );

        updateRequirement(id, {
          scheduledReview: {
            ...requirement.scheduledReview,
            reviewLevels: updatedLevels,
          },
        });
      },
      {
        operationName: `批量${levelName}级评审${statusText}`,
        showSuccessToast: true,
      }
    );
  }, [selectedIds, allRequirements, updateRequirement]);

  // 批量设置运营
  const setOperational = useCallback((value: 'yes' | 'no') => {
    if (selectedIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const label = value === 'yes' ? '是' : '否';
    executeSyncBatchOperationWithProgress(
      selectedIds,
      (id) => updateRequirement(id, { isOperational: value }),
      {
        operationName: `批量设置是否运营为 ${label}`,
        showSuccessToast: true,
      }
    );
  }, [selectedIds, updateRequirement]);

  return {
    assignVersion,
    review,
    setOperational,
  };
}
```

---

### 第2步：创建预排期专用组件 ⏰ 2天

#### 2.1 `ScheduledBatchActions.tsx` - 批量操作按钮

```tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScheduledBatchActionsProps {
  versions: string[];
  onAssignVersion: (version: string) => void;
  onReview: (level: number, status: 'approved' | 'rejected') => void;
  onSetOperational: (value: 'yes' | 'no') => void;
}

/**
 * 预排期批量操作按钮组
 * 
 * 配合通用的 DataTableBatchBar 使用
 */
export function ScheduledBatchActions({
  versions,
  onAssignVersion,
  onReview,
  onSetOperational,
}: ScheduledBatchActionsProps) {
  return (
    <>
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
              onClick={() => onAssignVersion(version)}
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
          <DropdownMenuItem onClick={() => onReview(1, 'approved')}>
            一级评审通过
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReview(1, 'rejected')}>
            一级评审不通过
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReview(2, 'approved')}>
            二级评审通过
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReview(2, 'rejected')}>
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
          <DropdownMenuItem onClick={() => onSetOperational('yes')}>
            设置为 是
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSetOperational('no')}>
            设置为 否
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
```

#### 2.2 `ScheduledTable` - 预排期表格

这部分主要是版本分组和评审相关的UI，保持原有逻辑即可。

---

### 第3步：重构主页面（使用通用组件）⏰ 1天

**文件**：`src/app/scheduled/page.tsx`

```tsx
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ScheduledTableSkeleton } from '@/components/ui/table-skeleton';

// ✅ 使用通用组件
import { DataTableToolbar } from '@/components/common/DataTable/DataTableToolbar';
import { DataTableBatchBar } from '@/components/common/DataTable/DataTableBatchBar';

// ✅ 使用预排期专用组件
import { ScheduledBatchActions } from './components/ScheduledBatchActions';
import { ScheduledTable } from './components/ScheduledTable';
import { ReviewDialog } from './components/ReviewDialog';

// ✅ 使用整合的Hooks
import { useScheduledTable } from './hooks/useScheduledTable';
import { useScheduledBatchActions } from './hooks/useScheduledBatchActions';
import { useScheduledReview } from './hooks/useScheduledReview';
import { useScheduledColumns } from './hooks/useScheduledColumns';

import { 
  SCHEDULED_FILTERABLE_COLUMNS,
  SCHEDULED_CONFIG_VERSION,
} from '@/config/scheduled-requirements';

/**
 * 预排期需求管理页面 V2
 * 
 * 核心变化：
 * - ✅ 使用通用DataTable组件（工具栏、搜索、筛选、列控制）
 * - ✅ 使用通用DataTableBatchBar组件
 * - ✅ 保留预排期专用功能（版本分组、评审流程）
 * - ✅ 代码从2203行减少到~120行（94%↓）
 */
export default function ScheduledRequirementsPage() {
  // 数据和筛选
  const {
    requirements,
    groupedRequirements,
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
    columns,
    hiddenColumns,
    columnsConfig,
    columnActions,
  } = useScheduledColumns();

  // 批量操作
  const batchActions = useScheduledBatchActions(selectedIds);
  
  // 评审对话框
  const reviewDialog = useScheduledReview();

  // 版本列表
  const versions = Object.keys(groupedRequirements);

  if (requirements.length === 0) {
    return (
      <AppLayout>
        <ScheduledTableSkeleton />
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
        filterableColumns={SCHEDULED_FILTERABLE_COLUMNS}
        onFilterAdd={filterActions.add}
        onFilterUpdate={filterActions.update}
        onFilterRemove={filterActions.remove}
        onFiltersClear={filterActions.clear}
        columns={columns}
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
          versions={versions}
          onAssignVersion={batchActions.assignVersion}
          onReview={batchActions.review}
          onSetOperational={batchActions.setOperational}
        />
      </DataTableBatchBar>

      {/* ✅ 预排期专用表格（版本分组 + 评审） */}
      <ScheduledTable
        groupedRequirements={groupedRequirements}
        expandedVersions={expandedVersions}
        selectedIds={selectedIds}
        columns={columns}
        hiddenColumns={hiddenColumns}
        sortConfig={sortConfig}
        onToggleVersion={toggleVersion}
        onSelect={selectionActions.toggle}
        onSelectAll={selectionActions.toggleAll}
        onOpenReview={reviewDialog.open}
        onSort={onSort}
      />

      {/* ✅ 评审对话框 */}
      <ReviewDialog
        open={reviewDialog.isOpen}
        requirement={reviewDialog.requirement}
        level={reviewDialog.level}
        onClose={reviewDialog.close}
        onSubmit={reviewDialog.submit}
      />
    </AppLayout>
  );
}
```

---

## 📊 V2 vs V1 对比

| 维度 | V1方案 | V2方案 | 优势 |
|------|--------|--------|------|
| **文件数量** | 17个 | 11个 | ✅ 减少35% |
| **代码行数** | ~2320行 | ~1100行 | ✅ 减少53% |
| **通用组件复用** | 0个 | 5个 | ✅ 高复用 |
| **开发时间** | 6-10天 | 5-7天 | ✅ 更快 |
| **维护成本** | 中等 | 低 | ✅ 统一维护 |
| **扩展性** | 中等 | 优秀 | ✅ 易扩展 |
| **与需求池一致性** | 低 | 高 | ✅ 体验统一 |

---

## ✅ V2 优势总结

### 1. 代码复用率大幅提升

```
通用组件复用情况：

DataTableToolbar        需求池 ✅  预排期 ✅  看板 ✅
DataTableBatchBar       需求池 ✅  预排期 ✅  看板 ✅
DataTableSearch         需求池 ✅  预排期 ✅  其他 ✅
DataTableFilters        需求池 ✅  预排期 ✅  其他 ✅
DataTableColumns        需求池 ✅  预排期 ✅  其他 ✅

复用率：60-70%
```

### 2. 用户体验统一

- ✅ 搜索框：位置、样式、交互一致
- ✅ 筛选面板：布局、操作、逻辑一致
- ✅ 列控制：拖拽、显隐、重置一致
- ✅ 批量操作：选择、提示、按钮一致

### 3. 开发效率提升

```
新增列表页开发时间：

V1方案（无复用）:  
  搜索 + 筛选 + 列控制 + 批量操作 = 2天

V2方案（高复用）:  
  导入通用组件 + 专用逻辑 = 0.5天

效率提升：4倍
```

### 4. 维护成本降低

```
修改一个功能：

V1方案:
  需求池 → 修改 FilterPanel
  预排期 → 修改 ScheduledFilters
  看板   → 修改 KanbanFilters
  耗时: 3个地方 × 1小时 = 3小时

V2方案:
  通用   → 修改 DataTableFilters
  耗时: 1个地方 × 1小时 = 1小时

效率提升：3倍
```

---

## 🎯 推荐实施路径

### 路径A：通用组件已完成 ✅

如果通用组件库已创建，直接开始：

```
第1天: 创建预排期Hooks (useScheduledTable等)
第2天: 创建预排期专用组件 (ScheduledBatchActions等)
第3天: 重构主页面，集成通用组件
第4天: 测试、优化、文档
```

**总时间**: 4天

---

### 路径B：通用组件未完成 ⚠️

需要先创建通用组件：

```
第1-2天: 创建通用DataTable组件库
第3-4天: 优化通用Hooks
第5天:   创建预排期Hooks
第6天:   创建预排期专用组件
第7天:   重构主页面，测试验证
```

**总时间**: 7天

**建议**: 优先路径B，一次性完成基础设施建设

---

## 📚 相关文档

- 📐 [通用组件架构设计](./SHARED_COMPONENTS_ARCHITECTURE.md) ⭐ 必读
- 📄 [V1重构方案](./SCHEDULED_REFACTOR_PLAN.md) - 参考对比
- 💻 [代码示例](./SCHEDULED_REFACTOR_EXAMPLES.md)
- ⚡ [快速实施指南](./SCHEDULED_REFACTOR_QUICKSTART.md)

---

## 🎉 最终效果

```tsx
// 重构后的主页面 - 仅120行！

export default function ScheduledRequirementsPage() {
  const tableData = useScheduledTable();
  const columns = useScheduledColumns();
  const batchActions = useScheduledBatchActions(tableData.selectedIds);
  const reviewDialog = useScheduledReview();

  return (
    <AppLayout>
      {/* ✅ 通用工具栏 */}
      <DataTableToolbar {...tableData} {...columns} />
      
      {/* ✅ 通用批量栏 + 专用按钮 */}
      <DataTableBatchBar {...tableData.selection}>
        <ScheduledBatchActions {...batchActions} />
      </DataTableBatchBar>
      
      {/* ✅ 专用表格 */}
      <ScheduledTable {...tableData} {...columns} />
      
      {/* ✅ 专用对话框 */}
      <ReviewDialog {...reviewDialog} />
    </AppLayout>
  );
}
```

**简洁、清晰、易维护！** 🎊

