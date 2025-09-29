'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// 配置数据
const requirementTypeConfig = {
  '新功能': { label: '新功能', color: 'bg-green-100 text-green-800' },
  '优化': { label: '优化', color: 'bg-blue-100 text-blue-800' },
  'BUG': { label: 'BUG', color: 'bg-red-100 text-red-800' },
  '用户反馈': { label: '用户反馈', color: 'bg-purple-100 text-purple-800' },
  '商务需求': { label: '商务需求', color: 'bg-yellow-100 text-yellow-800' }
} as const;

const priorityConfig = {
  '低': { label: '低', className: 'bg-green-100 text-green-800' },
  '中': { label: '中', className: 'bg-yellow-100 text-yellow-800' },
  '高': { label: '高', className: 'bg-orange-100 text-orange-800' },
  '紧急': { label: '紧急', className: 'bg-red-100 text-red-800' },
} as const;

const needToDoConfig = {
  '是': { label: '是', color: 'text-green-700', bgColor: 'bg-green-50' },
  '否': { label: '否', color: 'text-red-700', bgColor: 'bg-red-50' },
  '待定': { label: '待定', color: 'text-gray-700', bgColor: 'bg-gray-50' }
};

export function RequirementTable({
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
  const isColumnVisible = (column: string) => !hiddenColumns.includes(column);

  const renderSortButton = (field: string) => (
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
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedRequirements.length === requirements.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            {isColumnVisible('id') && (
              <TableHead className="w-[8%] px-2">
                <div className="flex items-center">
                  ID
                  {renderSortButton('id')}
                </div>
              </TableHead>
            )}
            <TableHead className="w-[35%] px-3">
              <div className="flex items-center">
                标题
                {renderSortButton('title')}
              </div>
            </TableHead>
            {isColumnVisible('type') && (
              <TableHead className="w-[10%] px-2">需求类型</TableHead>
            )}
            {isColumnVisible('needToDo') && (
              <TableHead className="w-[10%] px-2">是否要做</TableHead>
            )}
            {isColumnVisible('priority') && (
              <TableHead className="w-[8%] px-2">
                <div className="flex items-center">
                  优先级
                  {renderSortButton('priority')}
                </div>
              </TableHead>
            )}
            {isColumnVisible('creator') && (
              <TableHead className="w-[10%] px-2">
                <div className="flex items-center">
                  创建人
                  {renderSortButton('creator')}
                </div>
              </TableHead>
            )}
            {isColumnVisible('createdAt') && (
              <TableHead className="w-[12%] px-2">
                <div className="flex items-center">
                  创建时间
                  {renderSortButton('createdAt')}
                </div>
              </TableHead>
            )}
            {isColumnVisible('updatedAt') && (
              <TableHead className="w-[12%] px-2">
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
            <TableRow key={requirement.id}>
              <TableCell>
                <Checkbox
                  checked={selectedRequirements.includes(requirement.id)}
                  onCheckedChange={(checked) => 
                    onRequirementSelect(requirement.id, checked as boolean)
                  }
                />
              </TableCell>
              {isColumnVisible('id') && (
                <TableCell className="px-2 font-mono text-sm">
                  {requirement.id}
                </TableCell>
              )}
              <TableCell className="px-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/requirements/${requirement.id}`}
                      className="font-medium hover:underline line-clamp-2"
                    >
                      {requirement.title}
                    </Link>
                    <Badge 
                      variant={requirement.isOpen ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {requirement.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              {isColumnVisible('type') && (
                <TableCell className="px-2">
                  <span className="text-sm">
                    {requirementTypeConfig[requirement.type]?.label || requirement.type}
                  </span>
                </TableCell>
              )}
              {isColumnVisible('needToDo') && (
                <TableCell className="px-2">
                  <Select
                    value={requirement.needToDo || '待定'}
                    onValueChange={(value) => onNeedToDoChange(requirement.id, value)}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(needToDoConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className={`px-2 py-1 rounded text-sm ${config.color} ${config.bgColor}`}>
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              {isColumnVisible('priority') && (
                <TableCell className="px-2">
                  <Select
                    value={requirement.priority}
                    onValueChange={(value) => onPriorityChange(requirement.id, value)}
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className={`px-2 py-1 rounded text-sm ${config.className}`}>
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              {isColumnVisible('creator') && (
                <TableCell className="px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={requirement.creator?.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.creator?.name}`} 
                      />
                      <AvatarFallback className="text-xs">
                        {requirement.creator?.name?.slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{requirement.creator?.name || '未知用户'}</span>
                  </div>
                </TableCell>
              )}
              {isColumnVisible('createdAt') && (
                <TableCell className="px-2 text-sm text-muted-foreground">
                  {requirement.createdAt}
                </TableCell>
              )}
              {isColumnVisible('updatedAt') && (
                <TableCell className="px-2 text-sm text-muted-foreground">
                  {requirement.updatedAt}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 