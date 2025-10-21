# 预排期页面重构方案

## 📋 目标

将 `src/app/scheduled/page.tsx`（2203行）拆分为多个职责清晰的模块，提升代码可维护性和可测试性。

## 🗂️ 新文件结构

```
src/app/scheduled/
├── page.tsx                              # 主入口 (~150行)
├── hooks/
│   ├── useScheduledData.ts              # 数据获取和筛选 (~200行)
│   ├── useScheduledSelection.ts         # 选择管理 (~150行)
│   ├── useScheduledBatchActions.ts      # 批量操作 (~200行)
│   ├── useScheduledColumns.ts           # 列配置管理 (~120行)
│   └── useScheduledReview.ts            # 评审对话框 (~100行)
├── components/
│   ├── ScheduledHeader.tsx              # 页面头部 (~100行)
│   ├── ScheduledFilters/
│   │   ├── index.tsx                    # 筛选栏主组件 (~150行)
│   │   ├── SearchInput.tsx              # 搜索框 (~50行)
│   │   ├── FilterSettings.tsx           # 筛选设置 (~150行)
│   │   └── ColumnSettings.tsx           # 列设置 (~150行)
│   ├── ScheduledTable/
│   │   ├── index.tsx                    # 表格主组件 (~150行)
│   │   ├── TableHeader.tsx              # 表头 (~200行)
│   │   ├── VersionGroup.tsx             # 版本分组 (~150行)
│   │   ├── TableRow.tsx                 # 表格行 (~100行)
│   │   └── cells/                       # 单元格组件（已存在）
│   │       └── index.tsx
│   ├── BatchActionsBar.tsx              # 批量操作栏 (~150行)
│   └── ReviewDialog.tsx                 # 评审对话框（已存在）
└── utils/
    ├── scheduled-helpers.ts             # 辅助函数 (~150行)
    └── table-renderer.ts                # 表格渲染工具 (~100行)
```

## 📝 详细拆分方案

### 1️⃣ 主入口文件 `page.tsx` (~150行)

**职责**：组合各个组件，协调数据流

```tsx
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ScheduledTableSkeleton } from '@/components/ui/table-skeleton';
import { ScheduledHeader } from './components/ScheduledHeader';
import { ScheduledFilters } from './components/ScheduledFilters';
import { ScheduledTable } from './components/ScheduledTable';
import { BatchActionsBar } from './components/BatchActionsBar';
import { ReviewDialog } from './components/ReviewDialog';
import { useScheduledData } from './hooks/useScheduledData';
import { useScheduledSelection } from './hooks/useScheduledSelection';
import { useScheduledBatchActions } from './hooks/useScheduledBatchActions';
import { useScheduledColumns } from './hooks/useScheduledColumns';
import { useScheduledReview } from './hooks/useScheduledReview';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

/**
 * 预排期需求管理页面
 */
export default function ScheduledRequirementsPage() {
  // 数据管理
  const {
    loading,
    requirements,
    filteredRequirements,
    groupedRequirements,
    versions,
    filters,
    sortConfig,
    expandedVersions,
    handleSearch,
    handleFilterChange,
    handleSort,
    toggleVersion,
    clearAllFilters,
  } = useScheduledData();

  // 选择管理
  const {
    selectedRequirements,
    selectedIndexes,
    versionBatchModes,
    hasSelection,
    selectionCount,
    handleSelectRequirement,
    handleSelectAll,
    toggleVersionBatchMode,
    clearSelection,
  } = useScheduledSelection(groupedRequirements);

  // 批量操作
  const {
    handleBatchAssignVersion,
    handleBatchReview,
    handleBatchIsOperational,
  } = useScheduledBatchActions(selectedRequirements, selectedIndexes, clearSelection);

  // 列配置
  const {
    columnOrder,
    hiddenColumns,
    isColumnVisible,
    toggleColumnVisibility,
    handleColumnReorder,
    resetColumns,
  } = useScheduledColumns();

  // 评审对话框
  const {
    reviewDialogOpen,
    currentReviewRequirement,
    reviewLevel,
    reviewOpinion,
    openReviewDialog,
    closeReviewDialog,
    handleSubmitReview,
  } = useScheduledReview();

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      key: COMMON_SHORTCUTS.SEARCH,
      description: '聚焦搜索框',
      action: () => document.querySelector<HTMLInputElement>('input[placeholder*="搜索"]')?.focus(),
    },
    {
      key: COMMON_SHORTCUTS.CANCEL,
      description: '清空选择',
      action: clearSelection,
      enabled: hasSelection,
    },
  ]);

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 pt-4 space-y-4">
          <ScheduledTableSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 页面头部 */}
      <ScheduledHeader
        totalCount={requirements.length}
        filteredCount={filteredRequirements.length}
      />

      {/* 筛选栏 */}
      <ScheduledFilters
        searchTerm={filters.searchTerm}
        customFilters={filters.customFilters}
        columnOrder={columnOrder}
        hiddenColumns={hiddenColumns}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        onToggleColumn={toggleColumnVisibility}
        onColumnReorder={handleColumnReorder}
        onResetColumns={resetColumns}
      />

      {/* 批量操作栏 */}
      {hasSelection && (
        <BatchActionsBar
          selectionCount={selectionCount}
          versions={versions}
          onClearSelection={clearSelection}
          onBatchAssignVersion={handleBatchAssignVersion}
          onBatchReview={handleBatchReview}
          onBatchIsOperational={handleBatchIsOperational}
        />
      )}

      {/* 数据表格 */}
      <ScheduledTable
        groupedRequirements={groupedRequirements}
        expandedVersions={expandedVersions}
        selectedRequirements={selectedRequirements}
        selectedIndexes={selectedIndexes}
        versionBatchModes={versionBatchModes}
        columnOrder={columnOrder}
        hiddenColumns={hiddenColumns}
        sortConfig={sortConfig}
        onToggleVersion={toggleVersion}
        onSelectRequirement={handleSelectRequirement}
        onSelectAll={handleSelectAll}
        onToggleVersionBatchMode={toggleVersionBatchMode}
        onOpenReviewDialog={openReviewDialog}
        onSort={handleSort}
        isColumnVisible={isColumnVisible}
      />

      {/* 评审对话框 */}
      <ReviewDialog
        open={reviewDialogOpen}
        requirement={currentReviewRequirement}
        level={reviewLevel}
        opinion={reviewOpinion}
        onClose={closeReviewDialog}
        onSubmit={handleSubmitReview}
      />
    </AppLayout>
  );
}
```

---

### 2️⃣ 数据管理 Hook `hooks/useScheduledData.ts` (~200行)

**职责**：获取数据、筛选、排序、分组

```tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRequirementsStore, Requirement } from '@/lib/requirements-store';
import { useVersionStore } from '@/lib/version-store';
import { useScheduledFilters } from '@/hooks/useScheduledFilters';
import {
  DEFAULT_SCHEDULED_COLUMN_ORDER,
  DEFAULT_SCHEDULED_VISIBLE_COLUMNS,
  SCHEDULED_CONFIG_VERSION,
} from '@/config/scheduled-requirements';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 预排期数据管理 Hook
 */
export function useScheduledData() {
  const { loading, setLoading } = useRequirementsStore();
  const allRequirements = useRequirementsStore(state => state.requirements);
  const { getVersionNumbers, initFromStorage } = useVersionStore();

  // 初始化版本数据
  useEffect(() => {
    initFromStorage();
    setLoading(false);
  }, [initFromStorage, setLoading]);

  // 获取预排期需求（needToDo为'是'的需求）
  const scheduledRequirements = useMemo(() => {
    return allRequirements.filter(req => req.needToDo === '是');
  }, [allRequirements]);

  // 使用筛选 Hook
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
    expandedVersions,
    toggleVersion,
    filteredRequirements,
  } = useScheduledFilters({
    requirements: scheduledRequirements,
    configVersion: SCHEDULED_CONFIG_VERSION,
    defaultHiddenColumns: DEFAULT_SCHEDULED_COLUMN_ORDER.filter(
      col => !DEFAULT_SCHEDULED_VISIBLE_COLUMNS.includes(col as any)
    ),
    defaultColumnOrder: DEFAULT_SCHEDULED_COLUMN_ORDER,
    defaultVisibleColumns: DEFAULT_SCHEDULED_VISIBLE_COLUMNS,
  });

  // 按版本分组
  const groupedRequirements = useMemo(() => {
    const groups: Record<string, Requirement[]> = {};

    filteredRequirements.forEach(req => {
      const version = req.plannedVersion || '未分配版本';
      if (!groups[version]) {
        groups[version] = [];
      }
      groups[version].push(req);
    });

    // 对每个版本内的需求排序
    Object.keys(groups).forEach(version => {
      groups[version].sort((a, b) => {
        const { field, direction } = sortConfig;
        let aValue: any = a[field as keyof Requirement];
        let bValue: any = b[field as keyof Requirement];

        // 处理优先级排序
        if (field === 'priority') {
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority || '低'];
          bValue = priorityOrder[b.priority || '低'];
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    });

    return groups;
  }, [filteredRequirements, sortConfig]);

  // 获取所有版本列表
  const versions = useMemo(() => {
    return Array.from(new Set(
      scheduledRequirements
        .map(req => req.plannedVersion)
        .filter(Boolean)
    )).sort().reverse();
  }, [scheduledRequirements]);

  return {
    loading,
    requirements: scheduledRequirements,
    filteredRequirements,
    groupedRequirements,
    versions,
    filters: {
      searchTerm,
      customFilters,
    },
    sortConfig,
    expandedVersions,
    handleSearch: setSearchTerm,
    handleFilterChange: {
      add: addCustomFilter,
      update: updateCustomFilter,
      remove: removeCustomFilter,
    },
    handleSort: handleColumnSort,
    toggleVersion,
    clearAllFilters,
  };
}
```

---

### 3️⃣ 选择管理 Hook `hooks/useScheduledSelection.ts` (~150行)

**职责**：管理需求选择状态

```tsx
import { useState, useCallback, useMemo } from 'react';
import { Requirement } from '@/lib/requirements-store';

/**
 * 预排期选择管理 Hook
 */
export function useScheduledSelection(
  groupedRequirements: Record<string, Requirement[]>
) {
  // 复选框选择
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  
  // 序号列批量选择
  const [selectedIndexes, setSelectedIndexes] = useState<string[]>([]);
  
  // 版本批量模式
  const [versionBatchModes, setVersionBatchModes] = useState<Record<string, boolean>>({});

  // 是否有选择
  const hasSelection = useMemo(() => {
    return selectedRequirements.length > 0 || selectedIndexes.length > 0;
  }, [selectedRequirements, selectedIndexes]);

  // 选择数量
  const selectionCount = useMemo(() => {
    return selectedIndexes.length > 0 ? selectedIndexes.length : selectedRequirements.length;
  }, [selectedIndexes, selectedRequirements]);

  // 处理单个需求选择
  const handleSelectRequirement = useCallback((requirementId: string, checked: boolean) => {
    setSelectedRequirements(prev => {
      if (checked) {
        return [...prev, requirementId];
      } else {
        return prev.filter(id => id !== requirementId);
      }
    });
  }, []);

  // 处理版本全选
  const handleSelectAll = useCallback((version: string, checked: boolean) => {
    const versionRequirements = groupedRequirements[version] || [];
    const versionRequirementIds = versionRequirements.map(r => r.id);

    setSelectedRequirements(prev => {
      if (checked) {
        const newIds = versionRequirementIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      } else {
        return prev.filter(id => !versionRequirementIds.includes(id));
      }
    });
  }, [groupedRequirements]);

  // 切换版本批量模式
  const toggleVersionBatchMode = useCallback((version: string, enabled: boolean) => {
    const newModes = { ...versionBatchModes };
    const versionRequirements = groupedRequirements[version] || [];
    const versionRequirementIds = versionRequirements.map(r => r.id);

    if (enabled) {
      newModes[version] = true;
      // 进入批量模式时，默认全选该版本下的所有需求
      setSelectedIndexes(prev => {
        const newSelected = new Set([...prev, ...versionRequirementIds]);
        return Array.from(newSelected);
      });
    } else {
      newModes[version] = false;
      // 退出批量模式时，取消该版本下所有需求的选择
      setSelectedIndexes(prev => 
        prev.filter(id => !versionRequirementIds.includes(id))
      );
    }

    setVersionBatchModes(newModes);
  }, [versionBatchModes, groupedRequirements]);

  // 处理序号列选择
  const handleIndexSelect = useCallback((requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedIndexes(prev => [...prev, requirementId]);
    } else {
      setSelectedIndexes(prev => prev.filter(id => id !== requirementId));
    }
  }, []);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedRequirements([]);
    setSelectedIndexes([]);
    setVersionBatchModes({});
  }, []);

  return {
    selectedRequirements,
    selectedIndexes,
    versionBatchModes,
    hasSelection,
    selectionCount,
    handleSelectRequirement,
    handleSelectAll,
    toggleVersionBatchMode,
    handleIndexSelect,
    clearSelection,
  };
}
```

---

### 4️⃣ 批量操作 Hook `hooks/useScheduledBatchActions.ts` (~200行)

**职责**：处理批量分配版本、批量评审、批量设置运营

```tsx
import { useCallback } from 'react';
import { useRequirementsStore, Requirement } from '@/lib/requirements-store';
import { executeSyncBatchOperationWithProgress } from '@/lib/batch-operations-ui';
import { toast } from 'sonner';

/**
 * 预排期批量操作 Hook
 */
export function useScheduledBatchActions(
  selectedRequirements: string[],
  selectedIndexes: string[],
  clearSelection: () => void
) {
  const { updateRequirement } = useRequirementsStore();
  const allRequirements = useRequirementsStore(state => state.requirements);

  // 获取目标ID列表
  const getTargetIds = useCallback(() => {
    return selectedIndexes.length > 0 ? selectedIndexes : selectedRequirements;
  }, [selectedIndexes, selectedRequirements]);

  // 批量分配版本
  const handleBatchAssignVersion = useCallback((version: string) => {
    const targetIds = getTargetIds();

    if (targetIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    if (!version) {
      toast.error('请选择版本');
      return;
    }

    executeSyncBatchOperationWithProgress(
      targetIds,
      (id) => {
        updateRequirement(id, { plannedVersion: version });
      },
      {
        operationName: `批量分配版本到 ${version}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }, [getTargetIds, updateRequirement]);

  // 批量评审
  const handleBatchReview = useCallback((
    level: number,
    status: 'approved' | 'rejected'
  ) => {
    const targetIds = getTargetIds();

    if (targetIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const levelName = level === 1 ? '一' : '二';
    const statusText = status === 'approved' ? '通过' : '不通过';

    executeSyncBatchOperationWithProgress(
      targetIds,
      (id) => {
        const requirement = allRequirements.find(r => r.id === id);
        if (!requirement || !requirement.scheduledReview) {
          throw new Error('需求未找到或未配置评审流程');
        }

        const updatedReviewLevels = requirement.scheduledReview.reviewLevels.map(l => {
          if (l.level === level) {
            return {
              ...l,
              status,
              reviewedAt: new Date().toISOString(),
            };
          }
          return l;
        });

        updateRequirement(id, {
          scheduledReview: {
            ...requirement.scheduledReview,
            reviewLevels: updatedReviewLevels,
          },
        });
      },
      {
        operationName: `批量${levelName}级评审${statusText}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }, [getTargetIds, allRequirements, updateRequirement]);

  // 批量设置是否运营
  const handleBatchIsOperational = useCallback((value: 'yes' | 'no') => {
    const targetIds = getTargetIds();

    if (targetIds.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const labelMap = {
      'yes': '是',
      'no': '否'
    };

    executeSyncBatchOperationWithProgress(
      targetIds,
      (id) => {
        updateRequirement(id, { isOperational: value });
      },
      {
        operationName: `批量设置是否运营为 ${labelMap[value]}`,
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }, [getTargetIds, updateRequirement]);

  return {
    handleBatchAssignVersion,
    handleBatchReview,
    handleBatchIsOperational,
  };
}
```

---

### 5️⃣ 列配置管理 Hook `hooks/useScheduledColumns.ts` (~120行)

**职责**：管理列显示、隐藏、排序

```tsx
import { useState, useCallback, useEffect } from 'react';
import { safeGetItem, safeSetItem, arrayValidator } from '@/lib/storage-utils';
import {
  DEFAULT_SCHEDULED_COLUMN_ORDER,
  DEFAULT_SCHEDULED_VISIBLE_COLUMNS,
  SCHEDULED_CONFIG_VERSION,
} from '@/config/scheduled-requirements';

/**
 * 预排期列配置管理 Hook
 */
export function useScheduledColumns() {
  // 从 localStorage 加载配置
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => {
    const savedVersion = safeGetItem('scheduled-config-version', '') as string;
    const defaultHidden = DEFAULT_SCHEDULED_COLUMN_ORDER.filter(
      col => !DEFAULT_SCHEDULED_VISIBLE_COLUMNS.includes(col as any)
    );

    if (savedVersion !== SCHEDULED_CONFIG_VERSION) {
      safeSetItem('scheduled-config-version', SCHEDULED_CONFIG_VERSION);
      safeSetItem('scheduled-hidden-columns', defaultHidden);
      return defaultHidden;
    }

    return safeGetItem(
      'scheduled-hidden-columns',
      defaultHidden,
      arrayValidator((item): item is string => typeof item === 'string')
    );
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const savedVersion = safeGetItem('scheduled-config-version', '') as string;
    if (savedVersion !== SCHEDULED_CONFIG_VERSION) {
      safeSetItem('scheduled-column-order', DEFAULT_SCHEDULED_COLUMN_ORDER);
      return DEFAULT_SCHEDULED_COLUMN_ORDER;
    }

    return safeGetItem(
      'scheduled-column-order',
      DEFAULT_SCHEDULED_COLUMN_ORDER,
      arrayValidator((item): item is string => typeof item === 'string')
    );
  });

  // 保存到 localStorage
  useEffect(() => {
    safeSetItem('scheduled-hidden-columns', hiddenColumns);
  }, [hiddenColumns]);

  useEffect(() => {
    safeSetItem('scheduled-column-order', columnOrder);
  }, [columnOrder]);

  // 判断列是否可见
  const isColumnVisible = useCallback((columnId: string) => {
    // 序号和标题始终可见
    if (columnId === 'index' || columnId === 'title') {
      return true;
    }
    return !hiddenColumns.includes(columnId);
  }, [hiddenColumns]);

  // 切换列显示/隐藏
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setHiddenColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(col => col !== columnId)
        : [...prev, columnId]
    );
  }, []);

  // 处理列重新排序
  const handleColumnReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  // 重置列配置
  const resetColumns = useCallback(() => {
    const defaultHidden = DEFAULT_SCHEDULED_COLUMN_ORDER.filter(
      col => !DEFAULT_SCHEDULED_VISIBLE_COLUMNS.includes(col as any)
    );
    setHiddenColumns(defaultHidden);
    setColumnOrder(DEFAULT_SCHEDULED_COLUMN_ORDER);
  }, []);

  return {
    columnOrder,
    hiddenColumns,
    isColumnVisible,
    toggleColumnVisibility,
    handleColumnReorder,
    resetColumns,
  };
}
```

---

### 6️⃣ 评审对话框 Hook `hooks/useScheduledReview.ts` (~100行)

**职责**：管理评审对话框状态

```tsx
import { useState, useCallback } from 'react';
import { useRequirementsStore, Requirement, mockUsers } from '@/lib/requirements-store';
import { toast } from 'sonner';

/**
 * 预排期评审对话框 Hook
 */
export function useScheduledReview() {
  const { updateRequirement } = useRequirementsStore();

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentReviewRequirement, setCurrentReviewRequirement] = useState<Requirement | null>(null);
  const [reviewLevel, setReviewLevel] = useState<number>(1);
  const [reviewOpinion, setReviewOpinion] = useState('');

  // 打开评审对话框
  const openReviewDialog = useCallback((requirement: Requirement, level: number) => {
    setCurrentReviewRequirement(requirement);
    setReviewLevel(level);

    // 如果已有评审意见，预填到输入框
    const existingReview = requirement.scheduledReview?.reviewLevels?.find(
      r => r.level === level
    );
    setReviewOpinion(existingReview?.opinion || '');

    setReviewDialogOpen(true);
  }, []);

  // 关闭评审对话框
  const closeReviewDialog = useCallback(() => {
    setReviewDialogOpen(false);
    setReviewOpinion('');
  }, []);

  // 提交评审
  const handleSubmitReview = useCallback(async (status: 'approved' | 'rejected') => {
    if (!currentReviewRequirement || !currentReviewRequirement.scheduledReview) {
      return;
    }

    const updatedReviewLevels = currentReviewRequirement.scheduledReview.reviewLevels.map(
      level => {
        if (level.level === reviewLevel) {
          return {
            ...level,
            status,
            opinion: reviewOpinion,
            reviewer: mockUsers[0], // 模拟当前用户
            reviewedAt: new Date().toISOString(),
          };
        }
        return level;
      }
    );

    try {
      await updateRequirement(currentReviewRequirement.id, {
        scheduledReview: {
          ...currentReviewRequirement.scheduledReview,
          reviewLevels: updatedReviewLevels,
        },
      });

      toast.success(
        `${reviewLevel === 1 ? '一' : '二'}级评审${status === 'approved' ? '通过' : '不通过'}成功`
      );
      closeReviewDialog();
    } catch (error) {
      toast.error('评审提交失败');
      console.error(error);
    }
  }, [currentReviewRequirement, reviewLevel, reviewOpinion, updateRequirement, closeReviewDialog]);

  return {
    reviewDialogOpen,
    currentReviewRequirement,
    reviewLevel,
    reviewOpinion,
    openReviewDialog,
    closeReviewDialog,
    handleSubmitReview,
    setReviewOpinion,
  };
}
```

---

## 🔄 迁移步骤

### 步骤 1：创建新的 Hook 文件

1. 创建 `hooks/` 目录
2. 按顺序创建各个 Hook 文件：
   - `useScheduledColumns.ts` （最独立）
   - `useScheduledSelection.ts`
   - `useScheduledReview.ts`
   - `useScheduledBatchActions.ts`
   - `useScheduledData.ts` （依赖最多）

### 步骤 2：创建组件文件

1. 创建 `components/` 目录
2. 按顺序创建各个组件：
   - `ScheduledHeader.tsx`
   - `BatchActionsBar.tsx`
   - `ScheduledFilters/` 目录和组件
   - `ScheduledTable/` 目录和组件

### 步骤 3：重构主文件

1. 在 `page.tsx` 中导入新的 Hooks 和组件
2. 逐步替换原有代码
3. 测试每个功能是否正常

### 步骤 4：测试和优化

1. 运行应用，确保所有功能正常
2. 检查性能是否有提升
3. 添加单元测试
4. 删除旧代码

---

## 📊 预期收益

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 主文件行数 | 2203行 | ~150行 | 93% ↓ |
| 最长文件行数 | 2203行 | ~200行 | 91% ↓ |
| 文件数量 | 1个 | 15个 | - |
| 代码复用性 | 低 | 高 | - |
| 可测试性 | 低 | 高 | - |
| 可维护性 | 中 | 优秀 | - |

---

## ✅ 验收标准

- [ ] 主文件 `page.tsx` ≤ 200行
- [ ] 每个 Hook 文件 ≤ 250行
- [ ] 每个组件文件 ≤ 200行
- [ ] 所有功能正常运行
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 添加单元测试覆盖率 > 60%

---

## 📅 时间估算

- **步骤 1**：创建 Hooks - 2-3天
- **步骤 2**：创建组件 - 2-3天
- **步骤 3**：重构主文件 - 1-2天
- **步骤 4**：测试优化 - 1-2天

**总计：6-10天**

