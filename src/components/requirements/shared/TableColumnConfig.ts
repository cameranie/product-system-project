/**
 * 表格列配置统一接口
 * 
 * 用于需求池和预排期表格的列配置
 * 避免代码重复，提高复用性
 */

import { Requirement } from '@/lib/requirements-store';
import { ReactElement } from 'react';

/**
 * 列渲染函数类型
 */
export type CellRenderer<T = Requirement> = (
  item: T,
  index: number,
  props?: any
) => ReactElement;

/**
 * 表头渲染函数类型
 */
export type HeaderRenderer = (props?: any) => ReactElement;

/**
 * 列配置接口
 */
export interface ColumnConfig<T = Requirement> {
  /** 列ID */
  id: string;
  /** 列标签 */
  label: string;
  /** 列宽度（像素或Tailwind类） */
  width?: number | string;
  /** 最小宽度 */
  minWidth?: number | string;
  /** 最大宽度 */
  maxWidth?: number | string;
  /** 是否固定列 */
  sticky?: boolean;
  /** 固定列的left偏移量 */
  stickyLeft?: number;
  /** 是否显示阴影（最后一个固定列） */
  showShadow?: boolean;
  /** 是否可排序 */
  sortable?: boolean;
  /** 排序字段名（如果与id不同） */
  sortField?: string;
  /** 表头渲染函数 */
  renderHeader?: HeaderRenderer;
  /** 单元格渲染函数 */
  renderCell: CellRenderer<T>;
  /** 是否默认显示 */
  defaultVisible?: boolean;
}

/**
 * 表格配置接口
 */
export interface TableConfig<T = Requirement> {
  /** 列配置列表 */
  columns: ColumnConfig<T>[];
  /** 默认隐藏的列ID */
  defaultHiddenColumns?: string[];
  /** 默认列顺序 */
  defaultColumnOrder?: string[];
  /** 是否启用虚拟滚动 */
  enableVirtualization?: boolean;
  /** 虚拟滚动阈值（数据量超过此值时启用） */
  virtualizationThreshold?: number;
  /** 表格最小宽度 */
  minWidth?: number;
  /** 行高（像素） */
  rowHeight?: number;
}

/**
 * 标准列宽度配置
 */
export const STANDARD_COLUMN_WIDTHS = {
  CHECKBOX: 48,      // 复选框列
  INDEX: 80,         // 序号列
  ID: 96,            // ID列
  TITLE: 300,        // 标题列
  TYPE: 120,         // 类型列
  PRIORITY: 110,     // 优先级列
  PLATFORMS: 150,    // 应用端列
  OWNER: 150,        // 负责人列
  DATE: 160,         // 日期列
  STATUS: 120,       // 状态列
  SMALL: 100,        // 小列
  MEDIUM: 128,       // 中等列
  LARGE: 200,        // 大列
} as const;

/**
 * 获取列宽度样式类
 */
export function getColumnWidthClass(width: number | string): string {
  if (typeof width === 'number') {
    return `w-[${width}px] min-w-[${width}px] max-w-[${width}px]`;
  }
  return width;
}

/**
 * 获取列宽度样式对象
 */
export function getColumnWidthStyle(width: number | string): React.CSSProperties {
  if (typeof width === 'number') {
    return {
      width: `${width}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`,
    };
  }
  return {};
}

/**
 * 计算固定列偏移量
 */
export function calculateStickyOffsets(
  columns: ColumnConfig[],
  columnOrder: string[]
): Record<string, number> {
  const offsets: Record<string, number> = {};
  let currentOffset = 0;

  for (const columnId of columnOrder) {
    const column = columns.find(c => c.id === columnId);
    if (!column) continue;

    if (column.sticky) {
      offsets[columnId] = currentOffset;
      
      // 计算下一个偏移量
      const width = typeof column.width === 'number' 
        ? column.width 
        : STANDARD_COLUMN_WIDTHS.MEDIUM;
      currentOffset += width;
    } else {
      // 非固定列后面不再有固定列
      break;
    }
  }

  return offsets;
}

/**
 * 过滤可见列
 */
export function getVisibleColumns<T = Requirement>(
  columns: ColumnConfig<T>[],
  columnOrder: string[],
  hiddenColumns: string[]
): ColumnConfig<T>[] {
  return columnOrder
    .filter(id => !hiddenColumns.includes(id))
    .map(id => columns.find(c => c.id === id))
    .filter(Boolean) as ColumnConfig<T>[];
}

