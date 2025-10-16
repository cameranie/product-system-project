'use client';

import React, { useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  StickyTable, 
  StickyTableHeader, 
  StickyTableBody, 
  StickyTableRow, 
  StickyTableHead,
  StickyTableCell 
} from '@/components/ui/sticky-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  batchMode?: boolean;
  onBatchModeChange?: (enabled: boolean) => void;
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
  batchMode = false,
  onBatchModeChange,
  onRequirementSelect,
  onSelectAll,
  onNeedToDoChange,
  onPriorityChange,
  onColumnSort
}: RequirementTableProps) {
  const isColumnVisible = useCallback((column: string) => !hiddenColumns.includes(column), [hiddenColumns]);

  const handleSelectAll = useCallback((checked: boolean) => {
    // 进入/退出批量模式
    if (onBatchModeChange) {
      onBatchModeChange(checked);
    }
    // 全选/取消全选
    onSelectAll(checked);
  }, [onSelectAll, onBatchModeChange]);

  const isAllSelected = requirements.length > 0 && selectedRequirements.length === requirements.length;

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
    index: {
      header: (props?: any) => (
        <StickyTableHead className="w-[80px] min-w-[80px] max-w-[80px] px-2 border-r !z-50" {...props}>
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => {
        const isSelected = selectedRequirements.includes(requirement.id);
        return (
          <StickyTableCell className="w-[80px] min-w-[80px] max-w-[80px] px-2 py-3 text-xs text-center text-muted-foreground border-r" {...props}>
            {batchMode ? (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onRequirementSelect(requirement.id, checked as boolean)}
              />
            ) : (
              index + 1
            )}
          </StickyTableCell>
        );
      }
    },
    id: {
      header: (props?: any) => (
        <StickyTableHead className="w-[96px] min-w-[96px] max-w-[96px] px-2 border-r" {...props}>
          <div className="flex items-center whitespace-nowrap">
            ID
            {renderSortButton('id')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[96px] min-w-[96px] max-w-[96px] px-2 py-3 font-mono text-xs border-r" {...props}>
          {requirement.id}
        </StickyTableCell>
      )
    },
    title: {
      header: (props?: any) => (
        <StickyTableHead className="w-[300px] min-w-[300px] max-w-[300px] px-3 border-r z-40" {...props}>
          <div className="flex items-center whitespace-nowrap">
            标题
            {renderSortButton('title')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[300px] min-w-[300px] max-w-[300px] px-3 py-3 border-r" {...props}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/requirements/${encodeURIComponent(requirement.id)}`}
                className="font-normal hover:underline line-clamp-2 min-w-0 flex-1 break-words overflow-hidden text-xs"
                title={requirement.title}
              >
                {requirement.title}
              </Link>
            </div>
          </div>
        </StickyTableCell>
      )
    },
    type: {
      header: (props?: any) => (
        <StickyTableHead className="w-[120px] min-w-[120px] max-w-[120px] px-3 border-r" {...props}>
          <div className="whitespace-nowrap">需求类型</div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => {
        const typeConfig = getRequirementTypeConfig(requirement.type);
        return (
          <StickyTableCell className="w-[120px] min-w-[120px] max-w-[120px] px-3 py-3 border-r" {...props}>
            <span className="text-xs truncate block" title={typeConfig?.label || requirement.type}>
              {typeConfig?.label || requirement.type}
            </span>
          </StickyTableCell>
        );
      }
    },
    platforms: {
      header: (props?: any) => (
        <StickyTableHead className="w-[150px] min-w-[150px] max-w-[150px] px-3 border-r" {...props}>
          <div className="whitespace-nowrap">应用端</div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[150px] min-w-[150px] max-w-[150px] px-3 py-3 border-r" {...props}>
          {requirement.platforms && requirement.platforms.length > 0 ? (
            <span className="text-xs truncate block" title={requirement.platforms.join(', ')}>
              {requirement.platforms.join(', ')}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </StickyTableCell>
      )
    },
    endOwner: {
      header: (props?: any) => (
        <StickyTableHead className="w-[150px] min-w-[150px] max-w-[150px] px-3 border-r" {...props}>
          <div className="flex items-center whitespace-nowrap">
            端负责人
            {renderSortButton('endOwner')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[150px] min-w-[150px] max-w-[150px] px-3 py-3 border-r" {...props}>
          {requirement.endOwnerOpinion?.owner ? (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage 
                  src={requirement.endOwnerOpinion.owner.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.endOwnerOpinion.owner.name}`}
                />
                <AvatarFallback className="text-xs">
                  {requirement.endOwnerOpinion.owner.name?.slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs truncate min-w-0" title={requirement.endOwnerOpinion.owner.name}>
                {requirement.endOwnerOpinion.owner.name}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </StickyTableCell>
      )
    },
    needToDo: {
      header: (props?: any) => (
        <StickyTableHead className="w-[120px] min-w-[120px] max-w-[120px] px-3 border-r" {...props}>
          <div className="whitespace-nowrap">是否要做</div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => {
        const currentValue = requirement.needToDo;
        const config = currentValue ? getNeedToDoConfig(currentValue) : null;
        return (
          <StickyTableCell className="w-[120px] min-w-[120px] max-w-[120px] px-3 py-3 border-r" {...props}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-6 px-2 py-1 text-xs rounded-md ${config?.className || 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity duration-150 cursor-pointer inline-flex items-center`}
                >
                  {config?.label || '-'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-20">
                {Object.entries(NEED_TO_DO_CONFIG).map(([key, config]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => {
                      // 如果点击的是当前选中项，则取消选择（设为空）
                      if (currentValue === key) {
                        onNeedToDoChange(requirement.id, '');
                      } else {
                        onNeedToDoChange(requirement.id, key);
                      }
                    }}
                    className={`cursor-pointer ${currentValue === key ? 'bg-accent' : ''}`}
                  >
                    <span className={`px-2 py-1 rounded text-xs ${config.className} inline-block`}>
                      {config.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </StickyTableCell>
        );
      }
    },
    priority: {
      header: (props?: any) => (
        <StickyTableHead className="w-[110px] min-w-[110px] max-w-[110px] px-3 border-r" {...props}>
          <div className="flex items-center whitespace-nowrap">
            优先级
            {renderSortButton('priority')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => {
        const currentValue = requirement.priority;
        const config = currentValue ? getPriorityConfig(currentValue) : null;
        // 按优先级从高到低排序：紧急 > 高 > 中 > 低
        const priorityOrder = ['紧急', '高', '中', '低'];
        return (
          <StickyTableCell className="w-[110px] min-w-[110px] max-w-[110px] px-3 py-3 border-r" {...props}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-6 px-2 py-1 text-xs rounded-md ${config?.className || 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity duration-150 cursor-pointer inline-flex items-center`}
                >
                  {config?.label || '-'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-20">
                {priorityOrder.map(key => {
                  const config = PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG];
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => {
                        // 如果点击的是当前选中项，则取消选择（设为空）
                        if (currentValue === key) {
                          onPriorityChange(requirement.id, '');
                        } else {
                          onPriorityChange(requirement.id, key);
                        }
                      }}
                      className={`cursor-pointer ${currentValue === key ? 'bg-accent' : ''}`}
                    >
                      <span className={`px-2 py-1 rounded text-xs ${config.className} inline-block`}>
                        {config.label}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </StickyTableCell>
        );
      }
    },
    creator: {
      header: (props?: any) => (
        <StickyTableHead className="w-[130px] min-w-[130px] max-w-[130px] px-3 border-r" {...props}>
          <div className="flex items-center whitespace-nowrap">
            创建人
            {renderSortButton('creator')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[130px] min-w-[130px] max-w-[130px] px-3 py-3 border-r" {...props}>
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarImage 
                src={requirement.creator?.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.creator?.name}`} 
              />
              <AvatarFallback className="text-xs">
                {requirement.creator?.name?.slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs truncate min-w-0" title={requirement.creator?.name || '未知用户'}>
              {requirement.creator?.name || '未知用户'}
            </span>
          </div>
        </StickyTableCell>
      )
    },
    createdAt: {
      header: (props?: any) => (
        <StickyTableHead className="w-[160px] min-w-[160px] max-w-[160px] px-3 border-r" {...props}>
          <div className="flex items-center whitespace-nowrap">
            创建时间
            {renderSortButton('createdAt')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[160px] min-w-[160px] max-w-[160px] px-3 py-3 text-xs text-muted-foreground whitespace-nowrap border-r" {...props}>
          {requirement.createdAt}
        </StickyTableCell>
      )
    },
    updatedAt: {
      header: (props?: any) => (
        <StickyTableHead className="w-[160px] min-w-[160px] max-w-[160px] px-3 border-r" {...props}>
          <div className="flex items-center whitespace-nowrap">
            更新时间
            {renderSortButton('updatedAt')}
          </div>
        </StickyTableHead>
      ),
      cell: (requirement: Requirement, index: number, props?: any) => (
        <StickyTableCell className="w-[160px] min-w-[160px] max-w-[160px] px-3 py-3 text-xs text-muted-foreground whitespace-nowrap border-r" {...props}>
          {requirement.updatedAt}
        </StickyTableCell>
      )
    }
  }), [renderSortButton, onNeedToDoChange, onPriorityChange, handleSelectAll, isAllSelected]);

  // 根据columnOrder和hiddenColumns获取可见的有序列
  const visibleColumns = useMemo(() => {
    return columnOrder.filter(col => isColumnVisible(col));
  }, [columnOrder, isColumnVisible]);

  // 计算固定列的偏移量
  const stickyOffsets = useMemo(() => {
    const indexWidth = 80; // 序号列宽度
    const titleWidth = 300; // 标题列宽度
    
    return {
      index: 0,
      title: indexWidth,
    };
  }, []);

  return (
    <StickyTable minWidth={UI_SIZES.TABLE.MIN_WIDTH}>
      <StickyTableHeader>
        <StickyTableRow>
          {visibleColumns.map((columnId) => {
            const config = columnConfig[columnId as keyof typeof columnConfig];
            if (!config) return null;
            
            // index 和 title 列固定
            const isSticky = columnId === 'index' || columnId === 'title';
            const stickyLeft = columnId === 'index' ? stickyOffsets.index : 
                             columnId === 'title' ? stickyOffsets.title : 0;
            const showShadow = columnId === 'title'; // 最后一个固定列显示阴影
            
            return (
              <React.Fragment key={columnId}>
                {React.cloneElement(config.header() as React.ReactElement, {
                  sticky: isSticky,
                  stickyLeft,
                  showShadow,
                  style: {
                    ...(columnId === 'index' && { zIndex: 150 }),
                    ...(columnId === 'title' && { zIndex: 140 }),
                  }
                } as any)}
              </React.Fragment>
            );
          })}
        </StickyTableRow>
      </StickyTableHeader>
      <StickyTableBody>
        {requirements.map((requirement, reqIndex) => (
          <StickyTableRow key={requirement.id}>
            {visibleColumns.map((columnId) => {
              const config = columnConfig[columnId as keyof typeof columnConfig];
              if (!config) return null;
              
              // index 和 title 列固定
              const isSticky = columnId === 'index' || columnId === 'title';
              const stickyLeft = columnId === 'index' ? stickyOffsets.index : 
                               columnId === 'title' ? stickyOffsets.title : 0;
              const showShadow = columnId === 'title';
              
            return (
              <React.Fragment key={columnId}>
                {React.cloneElement(config.cell(requirement, reqIndex) as React.ReactElement, {
                  sticky: isSticky,
                  stickyLeft,
                  showShadow,
                } as any)}
              </React.Fragment>
            );
            })}
          </StickyTableRow>
        ))}
      </StickyTableBody>
    </StickyTable>
  );
}); 