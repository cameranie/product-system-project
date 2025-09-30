'use client';

import React, { useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Requirement } from '@/lib/requirements-store';
import { 
  getRequirementTypeConfig,
  getPriorityConfig,
  getNeedToDoConfig,
  NEED_TO_DO_CONFIG,
  PRIORITY_CONFIG,
  UI_SIZES
} from '@/config/requirements';

interface RequirementTableProps {
  requirements: Requirement[];
  selectedRequirements: string[];
  hiddenColumns: string[];
  columnOrder: string[];
  sortConfig: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onRequirementSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onNeedToDoChange: (id: string, value: string) => void;
  onPriorityChange: (id: string, value: string) => void;
  onColumnSort: (field: string) => void;
}

export const RequirementTable = memo(function RequirementTable({
  requirements,
  selectedRequirements,
  hiddenColumns,
  columnOrder,
  sortConfig,
  onRequirementSelect,
  onSelectAll,
  onNeedToDoChange,
  onPriorityChange,
  onColumnSort
}: RequirementTableProps) {
  const isColumnVisible = useCallback((column: string) => !hiddenColumns.includes(column), [hiddenColumns]);

  /**
   * 渲染排序按钮
   * 使用配置化的尺寸，便于全局调整
   */
  const renderSortButton = useCallback((field: string) => (
    <Button
      variant="ghost"
      size="sm"
      className={`${UI_SIZES.BUTTON.ICON_SMALL} ml-1`}
      onClick={() => onColumnSort(field)}
    >
      {sortConfig.field === field ? (
        sortConfig.direction === 'asc' ? (
          <ArrowUp className={UI_SIZES.ICON.SMALL} />
        ) : (
          <ArrowDown className={UI_SIZES.ICON.SMALL} />
        )
      ) : (
        <ArrowUpDown className={UI_SIZES.ICON.SMALL} />
      )}
    </Button>
  ), [sortConfig, onColumnSort]);

  /**
   * 列配置映射
   * 
   * 性能优化：使用 useMemo 缓存，避免每次渲染都重新创建配置对象
   * 可维护性：使用配置化的列宽，便于统一调整
   */
  const columnConfig = useMemo(() => ({
    id: {
      header: () => (
        <TableHead className={`${UI_SIZES.TABLE.COLUMN_WIDTHS.ID} px-2`}>
          <div className="flex items-center">
            ID
            {renderSortButton('id')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-2 py-3 font-mono text-sm">
          {requirement.id}
        </TableCell>
      )
    },
    title: {
      header: () => (
        <TableHead className="px-3 w-[35%] sm:w-[40%] lg:w-[35%] xl:w-[30%]">
          <div className="flex items-center">
            标题
            {renderSortButton('title')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/requirements/${encodeURIComponent(requirement.id)}`}
                className="font-medium hover:underline line-clamp-2 min-w-0 flex-1 break-words overflow-hidden"
                title={requirement.title}
              >
                {requirement.title}
              </Link>
            </div>
          </div>
        </TableCell>
      )
    },
    type: {
      header: () => (
        <TableHead className="px-3 w-[10%] sm:w-[12%] lg:w-[10%]">需求类型</TableHead>
      ),
      cell: (requirement: Requirement) => {
        const typeConfig = getRequirementTypeConfig(requirement.type);
        return (
          <TableCell className="px-3 py-3">
            <span className="text-sm truncate block" title={typeConfig?.label || requirement.type}>
              {typeConfig?.label || requirement.type}
            </span>
          </TableCell>
        );
      }
    },
    platforms: {
      header: () => (
        <TableHead className="px-3 w-[10%] sm:w-[12%] lg:w-[10%]">应用端</TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3">
          {requirement.platforms && requirement.platforms.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {requirement.platforms.map((platform, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {platform}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
      )
    },
    endOwner: {
      header: () => (
        <TableHead className="px-3 w-[12%] sm:w-[14%] lg:w-[12%]">
          <div className="flex items-center">
            端负责人
            {renderSortButton('endOwner')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3">
          {requirement.endOwnerOpinion?.owner ? (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage 
                  src={requirement.endOwnerOpinion.owner.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.endOwnerOpinion.owner.name}`}
                />
                <AvatarFallback className="text-xs">
                  {requirement.endOwnerOpinion.owner.name?.slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm truncate min-w-0" title={requirement.endOwnerOpinion.owner.name}>
                {requirement.endOwnerOpinion.owner.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
      )
    },
    needToDo: {
      header: () => (
        <TableHead className="px-3 w-[10%] sm:w-[12%] lg:w-[10%]">是否要做</TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 py-1 text-xs rounded-md border-0 ${requirement.needToDo ? (getNeedToDoConfig(requirement.needToDo)?.className || 'bg-gray-100 text-gray-800') : 'bg-gray-50 text-gray-400'} hover:opacity-80 transition-opacity duration-150 whitespace-nowrap`}
              >
                {requirement.needToDo ? (getNeedToDoConfig(requirement.needToDo)?.label || requirement.needToDo) : '-'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-20">
              {Object.entries(NEED_TO_DO_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onNeedToDoChange(requirement.id, key)}
                  className="cursor-pointer"
                >
                  <div className={`px-2 py-1 rounded text-sm ${config.color} ${config.bgColor} w-full text-center`}>
                    {config.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )
    },
    priority: {
      header: () => (
        <TableHead className="px-3 w-[8%] sm:w-[10%] lg:w-[8%]">
          <div className="flex items-center">
            优先级
            {renderSortButton('priority')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 py-1 text-xs rounded-md border-0 ${requirement.priority ? (getPriorityConfig(requirement.priority)?.className || 'bg-gray-100 text-gray-800') : 'bg-gray-50 text-gray-400'} hover:opacity-80 transition-opacity duration-150 whitespace-nowrap`}
              >
                {requirement.priority || '-'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-16">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onPriorityChange(requirement.id, key)}
                  className="cursor-pointer"
                >
                  <div className={`px-2 py-1 rounded text-sm ${config.className} w-full text-center`}>
                    {config.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )
    },
    creator: {
      header: () => (
        <TableHead className="px-3 w-[12%] sm:w-[14%] lg:w-[12%]">
          <div className="flex items-center">
            创建人
            {renderSortButton('creator')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage 
                src={requirement.creator?.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.creator?.name}`} 
              />
              <AvatarFallback className="text-xs">
                {requirement.creator?.name?.slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate min-w-0" title={requirement.creator?.name || '未知用户'}>
              {requirement.creator?.name || '未知用户'}
            </span>
          </div>
        </TableCell>
      )
    },
    createdAt: {
      header: () => (
        <TableHead className="px-3 w-[12%] sm:w-[14%] lg:w-[12%]">
          <div className="flex items-center">
            创建时间
            {renderSortButton('createdAt')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {requirement.createdAt}
        </TableCell>
      )
    },
    updatedAt: {
      header: () => (
        <TableHead className="px-3 w-[12%] sm:w-[14%] lg:w-[12%]">
          <div className="flex items-center">
            更新时间
            {renderSortButton('updatedAt')}
          </div>
        </TableHead>
      ),
      cell: (requirement: Requirement) => (
        <TableCell className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {requirement.updatedAt}
        </TableCell>
      )
    }
  }), [renderSortButton, onNeedToDoChange, onPriorityChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll(checked);
  }, [onSelectAll]);

  const isAllSelected = requirements.length > 0 && selectedRequirements.length === requirements.length;

  // 根据columnOrder和hiddenColumns获取可见的有序列
  const visibleColumns = useMemo(() => {
    return columnOrder.filter(col => isColumnVisible(col));
  }, [columnOrder, isColumnVisible]);

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table 
          className="w-full table-fixed" 
          style={{ minWidth: `${UI_SIZES.TABLE.MIN_WIDTH}px` }}
        >
          <TableHeader>
            <TableRow>
              <TableHead className={`${UI_SIZES.TABLE.COLUMN_WIDTHS.CHECKBOX} px-2`}>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {visibleColumns.map(columnId => {
                const config = columnConfig[columnId as keyof typeof columnConfig];
                return config ? <React.Fragment key={columnId}>{config.header()}</React.Fragment> : null;
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.map((requirement) => (
              <TableRow key={requirement.id} className="hover:bg-muted/50">
                <TableCell className="px-2 py-3">
                  <Checkbox
                    checked={selectedRequirements.includes(requirement.id)}
                    onCheckedChange={(checked) => onRequirementSelect(requirement.id, checked as boolean)}
                  />
                </TableCell>
                {visibleColumns.map(columnId => {
                  const config = columnConfig[columnId as keyof typeof columnConfig];
                  return config ? <React.Fragment key={columnId}>{config.cell(requirement)}</React.Fragment> : null;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}); 