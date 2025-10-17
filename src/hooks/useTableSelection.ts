/**
 * 通用表格Hook
 * 
 * 提供表格的通用功能：选择、排序、分页等
 * 
 * @module useTableSelection
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * 表格选择Hook的配置
 */
interface UseTableSelectionConfig<T> {
  /** 数据项列表 */
  items: T[];
  /** 获取项目ID的函数 */
  getItemId: (item: T) => string;
  /** 是否启用多选 */
  multiSelect?: boolean;
  /** 最大选择数量 */
  maxSelection?: number;
}

/**
 * 表格选择Hook的返回值
 */
interface UseTableSelectionReturn<T> {
  /** 已选择的项目ID列表 */
  selectedIds: string[];
  /** 已选择的项目列表 */
  selectedItems: T[];
  /** 是否全选 */
  isAllSelected: boolean;
  /** 是否部分选择 */
  isIndeterminate: boolean;
  /** 选择项目 */
  selectItem: (id: string, selected?: boolean) => void;
  /** 全选/取消全选 */
  selectAll: (selected?: boolean) => void;
  /** 清空选择 */
  clearSelection: () => void;
  /** 检查项目是否被选择 */
  isSelected: (id: string) => boolean;
  /** 获取选择数量 */
  getSelectionCount: () => number;
}

/**
 * 通用表格选择Hook
 * 
 * @param config 配置选项
 * @returns 选择相关的状态和方法
 */
export function useTableSelection<T>({
  items,
  getItemId,
  multiSelect = true,
  maxSelection = 1000,
}: UseTableSelectionConfig<T>): UseTableSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 计算已选择的项目
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  // 计算选择状态
  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.length === items.length;
  }, [items.length, selectedIds.length]);

  const isIndeterminate = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < items.length;
  }, [selectedIds.length, items.length]);

  // 选择单个项目
  const selectItem = useCallback((id: string, selected?: boolean) => {
    setSelectedIds(prev => {
      const isCurrentlySelected = prev.includes(id);
      const shouldSelect = selected !== undefined ? selected : !isCurrentlySelected;

      if (shouldSelect) {
        if (!multiSelect) {
          return [id];
        }
        if (prev.length >= maxSelection) {
          console.warn(`已达到最大选择数量限制: ${maxSelection}`);
          return prev;
        }
        return [...prev, id];
      } else {
        return prev.filter(selectedId => selectedId !== id);
      }
    });
  }, [multiSelect, maxSelection]);

  // 全选/取消全选
  const selectAll = useCallback((selected?: boolean) => {
    const shouldSelect = selected !== undefined ? selected : !isAllSelected;
    
    if (shouldSelect) {
      const allIds = items.map(getItemId);
      if (allIds.length > maxSelection) {
        console.warn(`数据量超过最大选择数量限制: ${maxSelection}`);
        return;
      }
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  }, [items, getItemId, isAllSelected, maxSelection]);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // 检查项目是否被选择
  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  // 获取选择数量
  const getSelectionCount = useCallback(() => {
    return selectedIds.length;
  }, [selectedIds.length]);

  return {
    selectedIds,
    selectedItems,
    isAllSelected,
    isIndeterminate,
    selectItem,
    selectAll,
    clearSelection,
    isSelected,
    getSelectionCount,
  };
}

/**
 * 表格排序Hook的配置
 */
interface UseTableSortConfig<T> {
  /** 数据项列表 */
  items: T[];
  /** 默认排序字段 */
  defaultSortField?: keyof T;
  /** 默认排序方向 */
  defaultSortDirection?: 'asc' | 'desc';
}

/**
 * 表格排序Hook的返回值
 */
interface UseTableSortReturn<T> {
  /** 排序字段 */
  sortField: keyof T | null;
  /** 排序方向 */
  sortDirection: 'asc' | 'desc';
  /** 排序后的数据 */
  sortedItems: T[];
  /** 设置排序 */
  setSort: (field: keyof T, direction?: 'asc' | 'desc') => void;
  /** 切换排序方向 */
  toggleSort: (field: keyof T) => void;
  /** 重置排序 */
  resetSort: () => void;
}

/**
 * 通用表格排序Hook
 * 
 * @param config 配置选项
 * @returns 排序相关的状态和方法
 */
export function useTableSort<T>({
  items,
  defaultSortField,
  defaultSortDirection = 'asc',
}: UseTableSortConfig<T>): UseTableSortReturn<T> {
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  // 排序后的数据
  const sortedItems = useMemo(() => {
    if (!sortField) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // 处理null/undefined值
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // 处理字符串
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? result : -result;
      }

      // 处理数字
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue;
        return sortDirection === 'asc' ? result : -result;
      }

      // 处理日期
      if (aValue instanceof Date && bValue instanceof Date) {
        const result = aValue.getTime() - bValue.getTime();
        return sortDirection === 'asc' ? result : -result;
      }

      // 处理字符串格式的日期
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          const result = aDate.getTime() - bDate.getTime();
          return sortDirection === 'asc' ? result : -result;
        }
      }

      // 默认比较
      const aStr = String(aValue);
      const bStr = String(bValue);
      const result = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? result : -result;
    });
  }, [items, sortField, sortDirection]);

  // 设置排序
  const setSort = useCallback((field: keyof T, direction?: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction || 'asc');
  }, []);

  // 切换排序方向
  const toggleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // 重置排序
  const resetSort = useCallback(() => {
    setSortField(defaultSortField || null);
    setSortDirection(defaultSortDirection);
  }, [defaultSortField, defaultSortDirection]);

  return {
    sortField,
    sortDirection,
    sortedItems,
    setSort,
    toggleSort,
    resetSort,
  };
}

/**
 * 表格分页Hook的配置
 */
interface UseTablePaginationConfig {
  /** 每页显示数量 */
  pageSize?: number;
  /** 默认页码 */
  defaultPage?: number;
}

/**
 * 表格分页Hook的返回值
 */
interface UseTablePaginationReturn {
  /** 当前页码 */
  currentPage: number;
  /** 每页显示数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
  /** 分页后的数据 */
  paginatedItems: any[];
  /** 设置页码 */
  setPage: (page: number) => void;
  /** 设置每页数量 */
  setPageSize: (size: number) => void;
  /** 下一页 */
  nextPage: () => void;
  /** 上一页 */
  prevPage: () => void;
  /** 跳转到第一页 */
  goToFirstPage: () => void;
  /** 跳转到最后一页 */
  goToLastPage: () => void;
}

/**
 * 通用表格分页Hook
 * 
 * @param items 数据项列表
 * @param config 配置选项
 * @returns 分页相关的状态和方法
 */
export function useTablePagination<T>(
  items: T[],
  config: UseTablePaginationConfig = {}
): UseTablePaginationReturn {
  const { pageSize: initialPageSize = 20, defaultPage = 1 } = config;
  
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / pageSize);
  }, [items.length, pageSize]);

  // 分页后的数据
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  // 设置页码
  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  // 设置每页数量
  const setPageSizeCallback = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 重置到第一页
  }, []);

  // 下一页
  const nextPage = useCallback(() => {
    setPage(currentPage + 1);
  }, [currentPage, setPage]);

  // 上一页
  const prevPage = useCallback(() => {
    setPage(currentPage - 1);
  }, [currentPage, setPage]);

  // 跳转到第一页
  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  // 跳转到最后一页
  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages, setPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    setPage,
    setPageSize: setPageSizeCallback,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
  };
}






