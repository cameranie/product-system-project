import { useState, useMemo, useCallback } from 'react';
import { Requirement } from '@/lib/requirements-store';
import { safeGetItem, safeSetItem, arrayValidator, objectValidator } from '@/lib/storage-utils';
import { validateSearchTerm } from '@/lib/input-validation';
import { useDebouncedLocalStorageBatch } from './useDebouncedLocalStorage';
import { useTableSort, useTableSelection } from './useTableSelection';
import { CONFIG_VERSIONS, STORAGE_KEYS } from '@/config/storage';
import { arrayUtils, stringUtils } from '@/lib/common-utils';
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
interface UseRequirementFiltersProps {
  requirements: Requirement[];
}

/**
 * 配置版本号（使用统一的配置管理）
 */
const CONFIG_VERSION = CONFIG_VERSIONS.REQUIREMENTS_POOL;
const KEYS = STORAGE_KEYS.REQUIREMENTS_POOL;

/**
 * 默认配置
 * 注意：index 和 title 必须显示且固定在前两列
 */
const DEFAULT_HIDDEN_COLUMNS = ['id', 'platforms', 'creator', 'createdAt', 'updatedAt'];
const DEFAULT_COLUMN_ORDER = [
  'index', 'title', 'id', 'type', 'platforms', 'endOwner', 'needToDo', 'priority', 'creator', 'createdAt', 'updatedAt'
];

/**
 * 筛选条件验证器
 */
const filterValidator = (filters: FilterCondition[]): boolean => {
  return filters.every(filter => 
    filter.id && 
    filter.column && 
    filter.operator && 
    filter.value.trim() !== ''
  );
};

/**
 * 排序配置验证器
 */
const sortValidator = (sort: SortConfig): boolean => {
  return !!(sort.field && sort.direction && ['asc', 'desc'].includes(sort.direction));
};

/**
 * 列配置验证器
 */
const columnValidator = (columns: string[]): boolean => {
  return Array.isArray(columns) && columns.length > 0;
};

/**
 * 加载配置函数
 */
function loadConfig() {
  try {
    const configVersion = safeGetItem(KEYS.CONFIG_VERSION, '1.0');
    const customFilters = safeGetItem(KEYS.CUSTOM_FILTERS, [] as any[], arrayValidator());
    const hiddenColumns = safeGetItem(KEYS.HIDDEN_COLUMNS, DEFAULT_HIDDEN_COLUMNS, arrayValidator());
    const columnOrder = safeGetItem(KEYS.COLUMN_ORDER, DEFAULT_COLUMN_ORDER, arrayValidator());
    const sortConfig = safeGetItem(KEYS.SORT_CONFIG, { field: 'updatedAt', direction: 'desc' }, objectValidator());

    // 版本检测和数据验证
    if (configVersion !== CONFIG_VERSION) {
      logger.info('配置版本不匹配，使用默认配置', { configVersion, expectedVersion: CONFIG_VERSION });
      return {
        searchTerm: '',
        customFilters: [],
        hiddenColumns: DEFAULT_HIDDEN_COLUMNS,
        columnOrder: DEFAULT_COLUMN_ORDER,
        sortConfig: { field: 'updatedAt', direction: 'desc' as const },
      };
    }

    // 数据验证
    const validatedFilters = filterValidator(customFilters) ? customFilters : [];
    const validatedHiddenColumns = columnValidator(hiddenColumns) ? hiddenColumns : DEFAULT_HIDDEN_COLUMNS;
    const validatedColumnOrder = columnValidator(columnOrder) ? columnOrder : DEFAULT_COLUMN_ORDER;
    const validatedSortConfig = sortValidator(sortConfig) ? sortConfig : { field: 'updatedAt', direction: 'desc' as const };

    return {
      searchTerm: '',
      customFilters: validatedFilters,
      hiddenColumns: validatedHiddenColumns,
      columnOrder: validatedColumnOrder,
      sortConfig: validatedSortConfig,
    };
  } catch (error) {
    logger.error('加载配置失败，使用默认配置', error);
    return {
      searchTerm: '',
      customFilters: [],
      hiddenColumns: DEFAULT_HIDDEN_COLUMNS,
      columnOrder: DEFAULT_COLUMN_ORDER,
      sortConfig: { field: 'updatedAt', direction: 'desc' as const },
    };
  }
}

/**
 * 创建存储键
 */
function createStorageKey(key: string): string {
  return `requirements-pool-${key}`;
}

/**
 * 需求筛选Hook
 * 
 * 提供需求池页面的筛选、排序、列管理功能
 * 使用通用工具函数减少重复代码
 */
export function useRequirementFilters({ requirements }: UseRequirementFiltersProps) {
  // 从localStorage加载配置
  const initialConfig = loadConfig();
  
  const [searchTerm, setSearchTerm] = useState(initialConfig.searchTerm);
  const [statusFilter, setStatusFilter] = useState('全部');
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>(initialConfig.customFilters);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(initialConfig.hiddenColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialConfig.columnOrder);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialConfig.sortConfig);

  // 使用防抖优化 localStorage 写入
  useDebouncedLocalStorageBatch([
    { key: createStorageKey('config-version'), value: CONFIG_VERSION },
    { key: createStorageKey('custom-filters'), value: customFilters },
    { key: createStorageKey('hidden-columns'), value: hiddenColumns },
    { key: createStorageKey('column-order'), value: columnOrder },
    { key: createStorageKey('sort-config'), value: sortConfig },
  ], { delay: 500 });

  // 使用通用排序Hook
  const { sortedItems: sortedRequirements, handleSort } = useTableSort({
    items: requirements,
    defaultSortField: sortConfig.field as keyof Requirement,
    defaultSortDirection: sortConfig.direction,
  });

  // 筛选逻辑（提前计算，供选择Hook使用）
  const filteredRequirements = useMemo(() => {
    let filtered = sortedRequirements;

    // 搜索词筛选
    if (searchTerm.trim()) {
      const validation = validateSearchTerm(searchTerm);
      if (validation.valid) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(req => 
          req.title.toLowerCase().includes(searchLower) ||
          req.id.toLowerCase().includes(searchLower) ||
          req.creator.name.toLowerCase().includes(searchLower) ||
          req.description.toLowerCase().includes(searchLower)
        );
      }
    }

    // 自定义筛选条件
    const validFilters = customFilters.filter(f => f.column && f.operator && f.value.trim() !== '');
    if (validFilters.length > 0) {
      filtered = filtered.filter(req => {
        return validFilters.every(filter => {
          const value = (req as any)[filter.column];
          const filterValue = filter.value.toLowerCase();

          switch (filter.operator) {
            case 'contains':
              return String(value).toLowerCase().includes(filterValue);
            case 'equals':
              return String(value).toLowerCase() === filterValue;
            case 'not_equals':
              return String(value).toLowerCase() !== filterValue;
            case 'is_empty':
              return !value || String(value).trim() === '';
            case 'is_not_empty':
              return value && String(value).trim() !== '';
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [sortedRequirements, searchTerm, customFilters]);

  // 使用选择Hook（基于筛选后的结果）
  const {
    selectedItems: selectedRequirements,
    selectItem: handleRequirementSelect,
    selectAll: handleSelectAll,
  } = useTableSelection({
    items: filteredRequirements,
    getItemId: (req) => req.id,
  });

  // 列管理
  const visibleColumns = useMemo(() => {
    return columnOrder.filter(col => !hiddenColumns.includes(col));
  }, [columnOrder, hiddenColumns]);

  // 操作函数
  const addCustomFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: '',
      operator: 'contains',
      value: '',
    };
    setCustomFilters(prev => [...prev, newFilter]);
  }, []);

  const updateCustomFilter = useCallback((id: string, field: string, value: string) => {
    setCustomFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  }, []);

  const removeCustomFilter = useCallback((id: string) => {
    setCustomFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);

  const clearAllFilters = useCallback(() => {
    setCustomFilters([]);
  }, []);

  const toggleColumn = useCallback((column: string) => {
    setHiddenColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  }, []);

  const reorderColumns = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  const resetColumns = useCallback(() => {
    setHiddenColumns(DEFAULT_HIDDEN_COLUMNS);
    setColumnOrder(DEFAULT_COLUMN_ORDER);
  }, []);

  const updateSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
  }, []);

  const resetSort = useCallback(() => {
    setSortConfig({ field: 'updatedAt', direction: 'desc' });
  }, []);

  // 列排序处理
  const handleColumnSort = useCallback((field: string) => {
    handleSort(field);
    // 更新sortConfig以便保存到localStorage
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, [handleSort]);

  // 统计信息
  const stats = useMemo(() => {
    const total = requirements?.length || 0;
    const filtered = filteredRequirements?.length || 0;
    const hidden = hiddenColumns?.length || 0;
    const visible = visibleColumns?.length || 0;

    return {
      total,
      filtered,
      hidden,
      visible,
      hasFilters: searchTerm.trim() !== '' || customFilters.length > 0,
      hasHiddenColumns: hiddenColumns.length > 0,
    };
  }, [requirements?.length, filteredRequirements?.length, hiddenColumns?.length, visibleColumns?.length, searchTerm, customFilters.length]);

  return {
    // 状态
    searchTerm,
    statusFilter,
    customFilters,
    hiddenColumns,
    columnOrder,
    sortConfig,
    visibleColumns,
    selectedRequirements,
    filteredRequirements,
    
    // 操作函数
    setSearchTerm,
    setStatusFilter,
    addCustomFilter,
    updateCustomFilter,
    removeCustomFilter,
    clearAllFilters,
    toggleColumnVisibility: toggleColumn,
    handleColumnReorder: reorderColumns,
    resetColumns,
    updateSort,
    resetSort,
    handleColumnSort,
    handleRequirementSelect,
    handleSelectAll,
    
    // 统计信息
    stats,
  };
}