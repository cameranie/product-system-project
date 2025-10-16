/**
 * 预排期需求筛选和管理 Hook
 * 
 * P2 代码质量优化：整合分散的状态管理
 * 
 * 将预排期页面的多个独立状态整合到一个 Hook 中，
 * 提高代码组织性和可维护性
 * 
 * @module useScheduledFilters
 */

import { useState, useMemo, useCallback } from 'react';
import { Requirement } from '@/lib/requirements-store';
import { 
  safeGetItem, 
  arrayValidator, 
  objectValidator 
} from '@/lib/storage-utils';
import { useDebouncedLocalStorageBatch } from './useDebouncedLocalStorage';
import { validateSearchTerm } from '@/lib/input-validation';
import logger from '@/lib/logger-util';

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
 * 排序配置接口
 */
interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Hook 参数接口
 */
interface UseScheduledFiltersProps {
  requirements: Requirement[];
  configVersion?: string;
  defaultHiddenColumns?: string[];
  defaultColumnOrder?: string[];
  defaultVisibleColumns?: string[];
}

/**
 * localStorage 键名前缀
 */
const STORAGE_PREFIX = 'scheduled';

/**
 * 创建 localStorage 键名
 */
function createStorageKey(key: string): string {
  return `${STORAGE_PREFIX}-${key}`;
}

/**
 * 筛选条件验证器
 */
const filterValidator = objectValidator<FilterCondition>(['id', 'column', 'operator', 'value']);

/**
 * 预排期需求筛选和管理 Hook
 * 
 * P2: 整合分散的状态管理，使用单一 Hook 管理所有筛选相关状态
 * 
 * @param props - Hook 参数
 * @returns 筛选状态和操作方法
 */
export function useScheduledFilters({
  requirements,
  configVersion = '1.0',
  defaultHiddenColumns = [],
  defaultColumnOrder = [],
  defaultVisibleColumns = [],
}: UseScheduledFiltersProps) {
  // ==================== 初始化状态 ====================
  
  // 从 localStorage 加载配置（带版本检测）
  const loadConfig = useCallback(<T,>(
    key: string,
    defaultValue: T,
    validator?: any
  ): T => {
    const savedVersion = safeGetItem(createStorageKey('config-version'), '');
    if (savedVersion !== configVersion) {
      // 版本不匹配，使用默认值
      return defaultValue;
    }
    return safeGetItem(createStorageKey(key), defaultValue, validator);
  }, [configVersion]);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>(() =>
    loadConfig('custom-filters', [], arrayValidator(filterValidator.validate))
  );

  // 排序状态
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'updatedAt',
    direction: 'desc',
  });

  // 列管理状态
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() =>
    loadConfig(
      'hidden-columns',
      defaultHiddenColumns,
      arrayValidator((item): item is string => typeof item === 'string')
    )
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    loadConfig(
      'column-order',
      defaultColumnOrder,
      arrayValidator((item): item is string => typeof item === 'string')
    )
  );

  // UI 状态
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [batchAssignVersion, setBatchAssignVersion] = useState('');

  // P2: 使用防抖优化 localStorage 写入
  useDebouncedLocalStorageBatch([
    { key: createStorageKey('config-version'), value: configVersion },
    { key: createStorageKey('custom-filters'), value: customFilters },
    { key: createStorageKey('hidden-columns'), value: hiddenColumns },
    { key: createStorageKey('column-order'), value: columnOrder },
  ], { delay: 500 });

  // ==================== 筛选逻辑 ====================

  /**
   * 应用搜索筛选
   */
  const applySearchFilter = useCallback((reqs: Requirement[], search: string) => {
    if (!search || !search.trim()) return reqs;

    const validationResult = validateSearchTerm(search);
    if (!validationResult.valid) {
      logger.warn('Invalid search term:', validationResult.error);
      return reqs;
    }

    const searchLower = search.toLowerCase();

    return reqs.filter((req) => {
      try {
        return (
          req.id?.toLowerCase().includes(searchLower) ||
          req.title?.toLowerCase().includes(searchLower) ||
          req.description?.toLowerCase().includes(searchLower) ||
          req.creator?.name?.toLowerCase().includes(searchLower) ||
          req.type?.toLowerCase().includes(searchLower) ||
          (req.platforms || []).some((p) => p?.toLowerCase().includes(searchLower))
        );
      } catch (error) {
        logger.error('Error filtering requirement:', req.id, error);
        return false;
      }
    });
  }, []);

  /**
   * 应用自定义筛选
   */
  const applyCustomFilters = useCallback(
    (reqs: Requirement[], filters: FilterCondition[]) => {
      if (!filters || filters.length === 0) return reqs;

      return reqs.filter((requirement) => {
        return filters.every((filter) => {
          if (!filter || !filter.column || !filter.operator) return true;

          try {
            let fieldValue: string;

            // 根据列名获取字段值
            switch (filter.column) {
              case 'id':
                fieldValue = requirement.id || '';
                break;
              case 'title':
                fieldValue = requirement.title || '';
                break;
              case 'type':
                fieldValue = requirement.type || '';
                break;
              case 'priority':
                fieldValue = requirement.priority || '';
                break;
              case 'version':
                fieldValue = requirement.plannedVersion || '';
                break;
              case 'platforms':
                fieldValue = (requirement.platforms || []).join(', ');
                break;
              default:
                return true;
            }

            const filterValue = (filter.value || '').toLowerCase();
            const fieldValueLower = fieldValue.toLowerCase();

            // 应用操作符
            switch (filter.operator) {
              case 'contains':
                return fieldValueLower.includes(filterValue);
              case 'equals':
                return fieldValueLower === filterValue;
              case 'not_equals':
                return fieldValueLower !== filterValue;
              case 'starts_with':
                return fieldValueLower.startsWith(filterValue);
              case 'ends_with':
                return fieldValueLower.endsWith(filterValue);
              case 'is_empty':
                return !fieldValue.trim();
              case 'is_not_empty':
                return !!fieldValue.trim();
              default:
                return true;
            }
          } catch (error) {
            logger.error('Error applying filter:', filter, error);
            return false;
          }
        });
      });
    },
    []
  );

  /**
   * 应用排序
   */
  const applySorting = useCallback((reqs: Requirement[], config: SortConfig) => {
    if (!config || !config.field) return reqs;

    try {
      return [...reqs].sort((a, b) => {
        try {
          let aValue: string | number | Date;
          let bValue: string | number | Date;

          switch (config.field) {
            case 'id':
              const aId = a.id?.replace('#', '') || '0';
              const bId = b.id?.replace('#', '') || '0';
              aValue = parseInt(aId) || 0;
              bValue = parseInt(bId) || 0;
              break;
            case 'title':
              aValue = a.title || '';
              bValue = b.title || '';
              break;
            case 'priority':
              const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
              aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
              bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
              break;
            case 'creator':
              aValue = a.creator?.name || '';
              bValue = b.creator?.name || '';
              break;
            case 'createdAt':
            case 'updatedAt':
              aValue = new Date(a[config.field] || 0);
              bValue = new Date(b[config.field] || 0);
              break;
            default:
              return 0;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;

          return config.direction === 'desc' ? -comparison : comparison;
        } catch (error) {
          logger.error('Error comparing requirements:', error);
          return 0;
        }
      });
    } catch (error) {
      logger.error('Error sorting requirements:', error);
      return reqs;
    }
  }, []);

  /**
   * 计算筛选后的需求列表
   */
  const filteredRequirements = useMemo(() => {
    let result = requirements;

    // 应用各种筛选
    result = applySearchFilter(result, searchTerm);
    result = applyCustomFilters(result, customFilters);
    result = applySorting(result, sortConfig);

    return result;
  }, [requirements, searchTerm, customFilters, sortConfig, applySearchFilter, applyCustomFilters, applySorting]);

  // ==================== 操作方法 ====================

  /**
   * 筛选条件管理
   */
  const addCustomFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: 'title',
      operator: 'contains',
      value: '',
    };
    setCustomFilters((prev) => [...prev, newFilter]);
  }, []);

  const updateCustomFilter = useCallback((id: string, field: string, value: string) => {
    setCustomFilters((prev) =>
      prev.map((filter) => (filter.id === id ? { ...filter, [field]: value } : filter))
    );
  }, []);

  const removeCustomFilter = useCallback((id: string) => {
    setCustomFilters((prev) => prev.filter((filter) => filter.id !== id));
  }, []);

  const clearAllFilters = useCallback(() => {
    setCustomFilters([]);
  }, []);

  /**
   * 排序管理
   */
  const handleColumnSort = useCallback((field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  /**
   * 列显示管理
   */
  const isColumnVisible = useCallback(
    (columnId: string) => {
      return !hiddenColumns.includes(columnId);
    },
    [hiddenColumns]
  );

  const toggleColumnVisibility = useCallback((column: string) => {
    setHiddenColumns((prev) =>
      prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
    );
  }, []);

  const handleColumnReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  const resetColumns = useCallback(() => {
    setHiddenColumns(defaultHiddenColumns);
    setColumnOrder(defaultColumnOrder);
  }, [defaultHiddenColumns, defaultColumnOrder]);

  /**
   * 版本展开管理
   */
  const toggleVersion = useCallback((version: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  }, []);

  /**
   * 需求选择管理
   */
  const handleRequirementSelect = useCallback((id: string, checked: boolean) => {
    setSelectedRequirements((prev) =>
      checked ? [...prev, id] : prev.filter((reqId) => reqId !== id)
    );
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedRequirements(checked ? filteredRequirements.map((req) => req.id) : []);
    },
    [filteredRequirements]
  );

  const clearSelection = useCallback(() => {
    setSelectedRequirements([]);
  }, []);

  // ==================== 返回值 ====================

  return {
    // 搜索和筛选状态
    searchTerm,
    setSearchTerm,
    customFilters,
    addCustomFilter,
    updateCustomFilter,
    removeCustomFilter,
    clearAllFilters,

    // 排序状态
    sortConfig,
    handleColumnSort,

    // 列管理状态
    hiddenColumns,
    columnOrder,
    isColumnVisible,
    toggleColumnVisibility,
    handleColumnReorder,
    resetColumns,

    // UI 状态
    expandedVersions,
    toggleVersion,
    selectedRequirements,
    handleRequirementSelect,
    handleSelectAll,
    clearSelection,
    batchAssignVersion,
    setBatchAssignVersion,

    // 计算结果
    filteredRequirements,
  };
}

