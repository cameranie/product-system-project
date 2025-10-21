import { useState, useCallback, useEffect } from 'react';
import { safeGetItem, safeSetItem, arrayValidator } from '@/lib/storage-utils';
import {
  DEFAULT_SCHEDULED_COLUMN_ORDER,
  DEFAULT_SCHEDULED_VISIBLE_COLUMNS,
  SCHEDULED_CONFIG_VERSION,
  SCHEDULED_FILTERABLE_COLUMNS,
} from '@/config/scheduled-requirements';

/**
 * 预排期列配置管理 Hook
 * 
 * 管理列的显示/隐藏、排序、重置等功能
 * 配置会保存到 localStorage
 */
export function useScheduledColumns() {
  // 从 localStorage 加载配置
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => {
    const savedVersion = safeGetItem('scheduled-config-version', '') as string;
    const defaultHidden = DEFAULT_SCHEDULED_COLUMN_ORDER.filter(
      col => !DEFAULT_SCHEDULED_VISIBLE_COLUMNS.includes(col as any)
    );

    // 版本不匹配，强制重置
    if (savedVersion !== SCHEDULED_CONFIG_VERSION) {
      safeSetItem('scheduled-config-version', SCHEDULED_CONFIG_VERSION);
      safeSetItem('scheduled-hidden-columns', defaultHidden);
      return defaultHidden;
    }

    // 即使版本匹配，也验证数据的正确性
    const loadedHidden = safeGetItem(
      'scheduled-hidden-columns',
      defaultHidden,
      arrayValidator((item): item is string => typeof item === 'string')
    );

    // 验证：应该隐藏的列必须包含id和type
    const mustHideColumns = ['id', 'type'];
    const isValid = mustHideColumns.every(col => loadedHidden.includes(col));

    if (!isValid) {
      // 数据不正确，强制重置
      console.warn('检测到hiddenColumns数据异常，强制重置');
      safeSetItem('scheduled-hidden-columns', defaultHidden);
      return defaultHidden;
    }

    return loadedHidden;
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

  // 列配置对象（用于DataTableColumns组件）
  const columnsConfig = SCHEDULED_FILTERABLE_COLUMNS.reduce((acc, col) => {
    acc[col.value] = { label: col.label };
    return acc;
  }, {} as Record<string, { label: string }>);

  return {
    // 状态
    columnOrder,
    hiddenColumns,
    columnsConfig,
    
    // 方法
    isColumnVisible,
    
    // 操作方法（用于组件props）
    columnActions: {
      toggle: toggleColumnVisibility,
      reorder: handleColumnReorder,
      reset: resetColumns,
    },
  };
}

