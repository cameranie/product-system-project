import { useMemo, useEffect } from 'react';
import { useRequirementsStore, Requirement } from '@/lib/requirements-store';
import { useVersionStore } from '@/lib/version-store';
import { useScheduledFilters } from '@/hooks/useScheduledFilters';
import {
  DEFAULT_SCHEDULED_COLUMN_ORDER,
  DEFAULT_SCHEDULED_VISIBLE_COLUMNS,
  SCHEDULED_CONFIG_VERSION,
} from '@/config/scheduled-requirements';

/**
 * 预排期表格数据管理 Hook
 * 
 * 整合数据获取、筛选、排序、分组、选择等功能
 * 这是预排期页面的核心Hook
 */
export function useScheduledTable() {
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
    selectedRequirements,
    handleRequirementSelect,
    handleSelectAll,
    clearSelection,
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
    // 加载状态
    loading,
    
    // 数据
    requirements: scheduledRequirements,
    filteredRequirements,
    groupedRequirements,
    versions,
    
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
    selectedIds: selectedRequirements,
    selectionActions: {
      toggle: handleRequirementSelect,
      toggleAll: handleSelectAll,
      clear: clearSelection,
    },
  };
}

