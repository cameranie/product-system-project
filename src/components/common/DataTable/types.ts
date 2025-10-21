/**
 * 通用数据表格类型定义
 */

/**
 * 筛选条件
 */
export interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

/**
 * 可筛选的列配置
 */
export interface FilterableColumn {
  value: string;
  label: string;
}

/**
 * 筛选操作符
 */
export interface FilterOperator {
  value: string;
  label: string;
}

/**
 * 列配置
 */
export interface ColumnConfig {
  value: string;
  label: string;
  width?: string | number;
}

/**
 * 排序配置
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 选择状态
 */
export interface SelectionState {
  selectedIds: string[];
  isAllSelected: boolean;
  isSomeSelected: boolean;
}

