'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 带固定列的表格组件
 * 
 * 功能：
 * - 支持左侧列固定（ID、标题等）
 * - 横向滚动时固定列保持可见
 * - 自动添加阴影效果
 * - 响应式设计
 * 
 * 使用场景：
 * - 需求池表格（固定ID和标题）
 * - 预排期表格（固定ID和标题）
 * - 其他多列表格
 * 
 * CSS 实现方式：
 * - 使用 position: sticky 实现列固定
 * - 使用 box-shadow 实现滚动阴影
 * - 使用 z-index 控制层级
 * 
 * @example
 * <StickyTable>
 *   <StickyTableHeader>
 *     <StickyTableRow>
 *       <StickyTableHead sticky className="w-12">
 *         <Checkbox />
 *       </StickyTableHead>
 *       <StickyTableHead sticky className="w-24">ID</StickyTableHead>
 *       <StickyTableHead sticky className="w-64">标题</StickyTableHead>
 *       <StickyTableHead>其他列</StickyTableHead>
 *     </StickyTableRow>
 *   </StickyTableHeader>
 * </StickyTable>
 */

interface StickyTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大高度（用于纵向滚动） */
  maxHeight?: string;
}

/**
 * 表格容器（带横向和纵向滚动）
 */
export function StickyTable({ 
  children, 
  minWidth = 1200,
  maxHeight = 'calc(100vh - 250px)',
  className,
  ...props 
}: StickyTableProps) {
  return (
    <div 
      className={cn(
        "rounded-md border overflow-x-auto overflow-y-auto relative",
        className
      )}
      style={{ maxHeight }}
      {...props}
    >
      <table 
        className="w-full border-collapse table-fixed"
        style={{ minWidth: `${minWidth}px` }}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * 表头（支持纵向滚动固定）
 */
export function StickyTableHeader({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("sticky top-0 z-[100] bg-muted/50", className)} {...props}>
      {children}
    </thead>
  );
}

/**
 * 表体
 */
export function StickyTableBody({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

/**
 * 表格行
 */
export function StickyTableRow({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b hover:bg-accent/50", className)} {...props}>
      {children}
    </tr>
  );
}

interface StickyTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** 是否固定列 */
  sticky?: boolean;
  /** 固定位置（从左侧开始的偏移量，单位px） */
  stickyLeft?: number;
  /** 是否显示右侧阴影（滚动时） */
  showShadow?: boolean;
}

/**
 * 表头单元格
 */
export function StickyTableHead({ 
  children,
  sticky = false,
  stickyLeft = 0,
  showShadow = false,
  className,
  style,
  ...props 
}: StickyTableCellProps & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-sm text-muted-foreground bg-muted/50",
        sticky && "sticky z-40",
        showShadow && sticky && "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
        className
      )}
      style={{
        ...style,
        ...(sticky && { left: `${stickyLeft}px` }),
      }}
      {...props}
    >
      {children}
    </th>
  );
}

/**
 * 表格单元格
 */
export function StickyTableCell({ 
  children,
  sticky = false,
  stickyLeft = 0,
  showShadow = false,
  className,
  style,
  ...props 
}: StickyTableCellProps) {
  return (
    <td
      className={cn(
        "p-2 align-middle",
        sticky && "sticky z-10 bg-background",
        showShadow && sticky && "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
        className
      )}
      style={{
        ...style,
        ...(sticky && { left: `${stickyLeft}px` }),
      }}
      {...props}
    >
      {children}
    </td>
  );
}

/**
 * 计算累积的左侧偏移量
 * 
 * 用于多个固定列的场景
 * 
 * @example
 * const offsets = calculateStickyOffsets([48, 96, 256]); // [0, 48, 144]
 */
export function calculateStickyOffsets(widths: number[]): number[] {
  const offsets: number[] = [];
  let accumulated = 0;
  
  for (const width of widths) {
    offsets.push(accumulated);
    accumulated += width;
  }
  
  return offsets;
}

/**
 * 固定列配置
 */
export interface StickyColumnConfig {
  /** 列ID */
  id: string;
  /** 列宽（单位：px） */
  width: number;
  /** 是否固定 */
  sticky: boolean;
}

/**
 * 根据配置计算固定列的偏移量
 */
export function computeStickyColumns(configs: StickyColumnConfig[]) {
  let offset = 0;
  
  return configs.map((config) => {
    const result = {
      ...config,
      stickyLeft: offset,
      // 最后一个固定列显示阴影
      showShadow: false,
    };
    
    if (config.sticky) {
      offset += config.width;
    }
    
    return result;
  }).map((item, index, array) => {
    // 找到最后一个固定列
    const lastStickyIndex = array.map(c => c.sticky).lastIndexOf(true);
    return {
      ...item,
      showShadow: item.sticky && index === lastStickyIndex,
    };
  });
}




