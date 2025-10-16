'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';

interface TableSkeletonProps {
  /** 显示的行数 */
  rows?: number;
  /** 显示的列数 */
  columns?: number;
  /** 是否显示复选框列 */
  showCheckbox?: boolean;
  /** 自定义列宽配置 */
  columnWidths?: string[];
}

/**
 * 表格骨架屏组件
 * 
 * 用于表格数据加载时的占位显示
 * 
 * 功能：
 * - 模拟真实表格结构
 * - 支持自定义行数、列数
 * - 支持复选框列
 * - 支持自定义列宽
 * 
 * 使用场景：
 * - 需求池列表加载
 * - 预排期列表加载
 * - 其他数据表格加载
 * 
 * @example
 * // 基础使用
 * <TableSkeleton rows={10} columns={8} showCheckbox />
 * 
 * // 自定义列宽
 * <TableSkeleton 
 *   rows={5} 
 *   columns={4}
 *   columnWidths={['w-20', 'w-64', 'w-32', 'w-48']}
 * />
 */
export function TableSkeleton({
  rows = 10,
  columns = 8,
  showCheckbox = true,
  columnWidths = []
}: TableSkeletonProps) {
  // 生成默认列宽
  const getColumnWidth = (index: number) => {
    if (columnWidths[index]) return columnWidths[index];
    // 默认列宽配置
    if (index === 0) return 'w-24'; // ID列
    if (index === 1) return 'w-64'; // 标题列
    return 'w-32'; // 其他列
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && (
              <TableHead className="w-12 px-2">
                <Skeleton className="h-4 w-4" />
              </TableHead>
            )}
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index} className={`px-3 ${getColumnWidth(index)}`}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {showCheckbox && (
                <TableCell className="px-2 py-3">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="px-3 py-3">
                  {/* 不同列使用不同的骨架宽度，更真实 */}
                  <Skeleton 
                    className={`h-4 ${
                      colIndex === 0 ? 'w-16' : // ID
                      colIndex === 1 ? 'w-full' : // 标题
                      colIndex % 3 === 0 ? 'w-20' : // 短内容
                      colIndex % 3 === 1 ? 'w-24' : // 中等内容
                      'w-28' // 长内容
                    }`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * 需求池表格骨架屏
 * 
 * 预配置的需求池专用骨架屏
 */
export function RequirementTableSkeleton() {
  return (
    <TableSkeleton
      rows={10}
      columns={9}
      showCheckbox
      columnWidths={[
        'w-24',  // ID
        'w-64',  // 标题
        'w-28',  // 需求类型
        'w-36',  // 应用端
        'w-32',  // 端负责人
        'w-24',  // 是否要做
        'w-24',  // 优先级
        'w-32',  // 创建人
        'w-36',  // 创建时间
      ]}
    />
  );
}

/**
 * 预排期表格骨架屏
 * 
 * 预配置的预排期专用骨架屏
 */
export function ScheduledTableSkeleton() {
  return (
    <TableSkeleton
      rows={8}
      columns={13}
      showCheckbox
      columnWidths={[
        'w-24',  // ID
        'w-64',  // 标题
        'w-28',  // 类型
        'w-24',  // 优先级
        'w-32',  // 版本号
        'w-36',  // 总评审状态
        'w-32',  // 一级评审人
        'w-28',  // 一级评审状态
        'w-32',  // 一级评审意见
        'w-32',  // 二级评审人
        'w-28',  // 二级评审状态
        'w-32',  // 二级评审意见
        'w-24',  // 是否运营
      ]}
    />
  );
}

/**
 * 简单的列表骨架屏
 * 
 * 用于简单列表或卡片布局的加载状态
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}




