/**
 * 通用表格筛选 Hook
 * 
 * 统一管理表格的筛选、排序、列控制、选择等功能
 * 适用于需求池、预排期等所有表格场景
 * 
 * @module useTableFilters
 */

import { useState, useMemo, useCallback } from 'react';
import { safeGetItem, arrayValidator, objectValidator } from '@/lib/storage-utils';
import { validateSearchTerm } from '@/lib/input-validation';
import { useDebouncedLocalStorageBatch } from './useDebouncedLocalStorage';
import logger from '@/lib/logger-util';

/**
 * 筛选条件接口
 */
export interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

/**
 * 排序配置接口
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Hook 配置接口
 */
export interface UseTableFiltersConfig<T> {
  /** 数据源 */
  data: T[];
  /** 存储键名前缀 */
  storageKey: string;
  /** 配置版本号 */
  configVersion?: string;
  /** 默认隐藏列 */
  defaultHiddenColumns?: string[];
  /** 默认列顺序 */
  defaultColumnOrder?: string[];
  /** 默认排序配置 */
  defaultSortConfig?: SortConfig;
  /** 默认状态筛选值 */
  defaultStatusFilter?: string;
  /** 搜索字段提取器 */
  searchFields?: (item: T) => string[];
  /** 状态筛选器 */
  statusFilter?: (item: T, status: string) => boolean;
  /** 自定义筛选器 */
  customFilterer?: (item: T, filter: FilterCondition) => boolean;
  /** 排序比较器 */
  sorter?: (a: T, b: T, config: SortConfig) => number;
}

/**
 * 筛选条件验证器
 */
const filterValidator = objectValidator<FilterCondition>(['id', 'column', 'operator', 'value']);

/**
 * 通用表格筛选 Hook
 * 
 * @param config - Hook 配置
 * @returns 筛选状态和操作方法
 */
export function useTableFilters<T = any>(config: UseTableFiltersConfig<T>) {
  const {
    data,
    storageKey,
    configVersion = '1.0',
    defaultHiddenColumns = [],
    defaultColumnOrder = [],
    defaultSortConfig = { field: 'updatedAt', direction: 'desc' } as SortConfig,
    defaultStatusFilter = '全部',
    searchFields,
    statusFilter,
    customFilterer,
    sorter,
  } = config;

  // ==================== 状态管理 ====================

  // 从 localStorage 加载配置
  const loadConfig = useCallback(<TValue,>(
    key: string,
    defaultValue: TValue,
    validator?: any
  ): TValue => {
    const savedVersion = safeGetItem(`${storageKey}-config-version`, '');
    if (savedVersion !== configVersion) {
      return defaultValue;
    }
    return safeGetItem(`${storageKey}-${key}`, defaultValue, validator);
  }, [storageKey, configVersion]);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilterValue, setStatusFilterValue] = useState(defaultStatusFilter);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>(() =>
    loadConfig('custom-filters', [], arrayValidator(filterValidator.validate))
  );

  // 排序状态
  const [sortConfig, setSortConfig] = useState<SortConfig>(() =>
    loadConfig('sort-config', defaultSortConfig)
  );

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

  // 选择状态
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 保存配置到 localStorage
  useDebouncedLocalStorageBatch([
    { key: `${storageKey}-config-version`, value: configVersion },
    { key: `${storageKey}-custom-filters`, value: customFilters },
    { key: `${storageKey}-hidden-columns`, value: hiddenColumns },
    { key: `${storageKey}-column-order`, value: columnOrder },
    { key: `${storageKey}-sort-config`, value: sortConfig },
  ], { delay: 500 });

  // ==================== 筛选逻辑 ====================

  /**
   * 应用搜索筛选
   */
  const applySearchFilter = useCallback((items: T[], search: string): T[] => {
    if (!search || !search.trim()) return items;

    const validationResult = validateSearchTerm(search);
    if (!validationResult.valid) {
      logger.warn('Invalid search term:', validationResult.error);
      return items;
    }

    const searchLower = search.toLowerCase();

    return items.filter(item => {
      try {
        // 使用自定义搜索字段提取器
        if (searchFields) {
          const fields = searchFields(item);
          return fields.some(field => 
            field?.toLowerCase().includes(searchLower)
          );
        }

        // 默认搜索所有字符串字段
        return Object.values(item as any).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      } catch (error) {
        logger.error('Error in search filter:', error);
        return false;
      }
    });
  }, [searchFields]);

  /**
   * 应用状态筛选
   */
  const applyStatusFilter = useCallback((items: T[], status: string): T[] => {
    if (status === '全部' || !statusFilter) return items;
    
    try {
      return items.filter(item => statusFilter(item, status));
    } catch (error) {
      logger.error('Error in status filter:', error);
      return items;
    }
  }, [statusFilter]);

  /**
   * 应用自定义筛选
   */
  const applyCustomFilters = useCallback((items: T[], filters: FilterCondition[]): T[] => {
    if (!filters || filters.length === 0) return items;

    return items.filter(item => {
      return filters.every(filter => {
        if (!filter || !filter.column || !filter.operator) return true;

        try {
          if (customFilterer) {
            return customFilterer(item, filter);
          }
          return true;
        } catch (error) {
          logger.error('Error in custom filter:', error);
          return false;
        }
      });
    });
  }, [customFilterer]);

  /**
   * 应用排序
   */
  const applySorting = useCallback((items: T[], config: SortConfig): T[] => {
    if (!config || !config.field) return items;

    try {
      return [...items].sort((a, b) => {
        try {
          if (sorter) {
            return sorter(a, b, config);
          }
          return 0;
        } catch (error) {
          logger.error('Error in sorter:', error);
          return 0;
        }
      });
    } catch (error) {
      logger.error('Error in sorting:', error);
      return items;
    }
  }, [sorter]);

  /**
   * 计算筛选后的数据
   */
  const filteredData = useMemo(() => {
    let result = data;
    
    result = applySearchFilter(result, searchTerm);
    result = applyStatusFilter(result, statusFilterValue);
    result = applyCustomFilters(result, customFilters);
    result = applySorting(result, sortConfig);
    
    return result;
  }, [data, searchTerm, statusFilterValue, customFilters, sortConfig, 
      applySearchFilter, applyStatusFilter, applyCustomFilters, applySorting]);

  // ==================== 操作方法 ====================

  /**
   * 筛选条件管理
   */
  const addCustomFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: '',
      operator: 'contains',
      value: '',
    };
    setCustomFilters(prev => [...prev, newFilter]);
  }, []);

  const updateCustomFilter = useCallback((id: string, field: keyof FilterCondition, value: string) => {
    setCustomFilters(prev =>
      prev.map(filter => (filter.id === id ? { ...filter, [field]: value } : filter))
    );
  }, []);

  const removeCustomFilter = useCallback((id: string) => {
    setCustomFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);

  const clearAllFilters = useCallback(() => {
    setCustomFilters([]);
    setSearchTerm('');
    setStatusFilterValue(defaultStatusFilter);
  }, [defaultStatusFilter]);

  /**
   * 排序管理
   */
  const handleColumnSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  /**
   * 列显示管理
   */
  const isColumnVisible = useCallback(
    (columnId: string) => !hiddenColumns.includes(columnId),
    [hiddenColumns]
  );

  const toggleColumnVisibility = useCallback((column: string) => {
    setHiddenColumns(prev =>
      prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]
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
   * 选择管理
   */
  const handleItemSelect = useCallback((id: string, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedItems(
      checked ? filteredData.map((item: any) => item.id) : []
    );
  }, [filteredData]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // ==================== 返回值 ====================

  return {
    // 搜索和筛选状态
    searchTerm,
    setSearchTerm,
    statusFilter: statusFilterValue,
    setStatusFilter: setStatusFilterValue,
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

    // 选择状态
    selectedItems,
    handleItemSelect,
    handleSelectAll,
    clearSelection,

    // 计算结果
    filteredData,

    // 统计信息
    stats: {
      total: data.length,
      filtered: filteredData.length,
      selected: selectedItems.length,
    },
  };
}

