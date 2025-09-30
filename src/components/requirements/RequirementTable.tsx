'use client';

import React, { useCallback, memo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Requirement } from '@/lib/requirements-store';
import { 
  REQUIREMENT_TYPE_CONFIG, 
  PRIORITY_CONFIG, 
  NEED_TO_DO_CONFIG,
  getRequirementTypeConfig,
  getPriorityConfig,
  getNeedToDoConfig
} from '@/config/requirements';

interface RequirementTableProps {
  requirements: Requirement[];
  selectedRequirements: string[];
  hiddenColumns: string[];
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

// 优化：使用memo包装单个需求行组件
const RequirementRow = memo(({ 
  requirement, 
  isSelected, 
  hiddenColumns, 
  onSelect, 
  onNeedToDoChange, 
  onPriorityChange 
}: {
  requirement: Requirement;
  isSelected: boolean;
  hiddenColumns: string[];
  onSelect: (id: string, checked: boolean) => void;
  onNeedToDoChange: (id: string, value: string) => void;
  onPriorityChange: (id: string, value: string) => void;
}) => {
  const isColumnVisible = useCallback((column: string) => !hiddenColumns.includes(column), [hiddenColumns]);

  const handleSelectChange = useCallback((checked: boolean) => {
    onSelect(requirement.id, checked);
  }, [requirement.id, onSelect]);

  const handleNeedToDoChange = useCallback((value: string) => {
    // 立即更新UI反馈，优化响应速度
    onNeedToDoChange(requirement.id, value);
  }, [requirement.id, onNeedToDoChange]);

  const handlePriorityChange = useCallback((value: string) => {
    // 立即更新UI反馈，优化响应速度
    onPriorityChange(requirement.id, value);
  }, [requirement.id, onPriorityChange]);

  const typeConfig = getRequirementTypeConfig(requirement.type);
  const priorityConfig = getPriorityConfig(requirement.priority);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="px-2 py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelectChange}
        />
      </TableCell>
      {isColumnVisible('id') && (
        <TableCell className="px-2 py-3 font-mono text-sm">
          {requirement.id}
        </TableCell>
      )}
      <TableCell className="px-3 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/requirements/${encodeURIComponent(requirement.id)}`}
              className="font-medium hover:underline line-clamp-2 min-w-0 flex-1 break-words"
            >
              {requirement.title}
            </Link>
          </div>
        </div>
      </TableCell>
      {isColumnVisible('type') && (
        <TableCell className="px-3 py-3">
          <span className="text-sm whitespace-nowrap">
            {typeConfig?.label || requirement.type}
          </span>
        </TableCell>
      )}
      {isColumnVisible('needToDo') && (
        <TableCell className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 py-1 text-xs rounded-md border-0 ${getNeedToDoConfig(requirement.needToDo || '待定')?.className || 'bg-gray-100 text-gray-800'} hover:opacity-80 transition-opacity duration-150 whitespace-nowrap`}
              >
                {getNeedToDoConfig(requirement.needToDo || '待定')?.label || '待定'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-20">
              {Object.entries(NEED_TO_DO_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleNeedToDoChange(key)}
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
      )}
      {isColumnVisible('priority') && (
        <TableCell className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 py-1 text-xs rounded-md border-0 ${getPriorityConfig(requirement.priority)?.className || 'bg-gray-100 text-gray-800'} hover:opacity-80 transition-opacity duration-150 whitespace-nowrap`}
              >
{requirement.priority}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-16">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handlePriorityChange(key)}
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
      )}
      {isColumnVisible('creator') && (
        <TableCell className="px-3 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage 
                src={requirement.creator?.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.creator?.name}`} 
              />
              <AvatarFallback className="text-xs">
                {requirement.creator?.name?.slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate min-w-0">{requirement.creator?.name || '未知用户'}</span>
          </div>
        </TableCell>
      )}
      {isColumnVisible('createdAt') && (
        <TableCell className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {requirement.createdAt}
        </TableCell>
      )}
      {isColumnVisible('updatedAt') && (
        <TableCell className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {requirement.updatedAt}
        </TableCell>
      )}
    </TableRow>
  );
});

RequirementRow.displayName = 'RequirementRow';

export const RequirementTable = memo(function RequirementTable({
  requirements,
  selectedRequirements,
  hiddenColumns,
  sortConfig,
  onRequirementSelect,
  onSelectAll,
  onNeedToDoChange,
  onPriorityChange,
  onColumnSort
}: RequirementTableProps) {
  const isColumnVisible = useCallback((column: string) => !hiddenColumns.includes(column), [hiddenColumns]);

  const renderSortButton = useCallback((field: string) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onColumnSort(field)}
      className="h-6 w-6 p-0 ml-1"
    >
      {sortConfig.field === field ? (
        sortConfig.direction === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUp className="h-3 w-3 opacity-50" />
      )}
    </Button>
  ), [sortConfig, onColumnSort]);

  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll(checked);
  }, [onSelectAll]);

  const isAllSelected = requirements.length > 0 && selectedRequirements.length === requirements.length;

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
          <TableRow>
            <TableHead className="w-12 px-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            {isColumnVisible('id') && (
              <TableHead className="w-16 px-2">
                <div className="flex items-center">
                  ID
                  {renderSortButton('id')}
                </div>
              </TableHead>
            )}
            <TableHead className="px-3 min-w-0 w-auto">
              <div className="flex items-center">
                标题
                {renderSortButton('title')}
              </div>
            </TableHead>
            {isColumnVisible('type') && (
              <TableHead className="w-24 px-3">需求类型</TableHead>
            )}
            {isColumnVisible('needToDo') && (
              <TableHead className="w-24 px-3">是否要做</TableHead>
            )}
            {isColumnVisible('priority') && (
              <TableHead className="w-20 px-3">
                <div className="flex items-center">
                  优先级
                  {renderSortButton('priority')}
                </div>
              </TableHead>
            )}
            {isColumnVisible('creator') && (
              <TableHead className="w-28 px-3">
                <div className="flex items-center">
                  创建人
                  {renderSortButton('creator')}
                </div>
              </TableHead>
            )}
            {isColumnVisible('createdAt') && (
              <TableHead className="w-36 px-3">
                <div className="flex items-center">
                  创建时间
                  {renderSortButton('createdAt')}
                </div>
              </TableHead>
            )}
            {isColumnVisible('updatedAt') && (
              <TableHead className="w-36 px-3">
                <div className="flex items-center">
                  更新时间
                  {renderSortButton('updatedAt')}
                </div>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((requirement) => (
            <RequirementRow
              key={requirement.id}
              requirement={requirement}
              isSelected={selectedRequirements.includes(requirement.id)}
              hiddenColumns={hiddenColumns}
              onSelect={onRequirementSelect}
              onNeedToDoChange={onNeedToDoChange}
              onPriorityChange={onPriorityChange}
            />
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}); 