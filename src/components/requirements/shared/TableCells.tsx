'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Requirement } from '@/lib/requirements-store';
import {
  getRequirementTypeConfig,
  getPriorityConfig,
  getNeedToDoConfig,
  NEED_TO_DO_CONFIG,
  PRIORITY_CONFIG,
} from '@/config/requirements';
import { UserAvatar } from '@/components/common/UserAvatar';

/**
 * 共享的表格单元格组件
 * 
 * 用于需求池和预排期页面的表格单元格渲染
 * 减少代码重复，提高可维护性
 */

interface CellProps {
  requirement: Requirement;
  className?: string;
}

interface EditableCellProps extends CellProps {
  onUpdate: (id: string, value: string) => void;
}

/**
 * ID 单元格
 */
export function IdCell({ requirement, className = '' }: CellProps) {
  return (
    <td className={`px-2 py-3 font-mono text-xs ${className}`}>
      {requirement.id}
    </td>
  );
}

/**
 * 标题单元格（带链接）
 */
export function TitleCell({ 
  requirement, 
  className = '',
  linkPrefix = '/requirements'
}: CellProps & { linkPrefix?: string }) {
  return (
    <td className={`px-3 py-3 ${className}`}>
      <Link
        href={`${linkPrefix}/${encodeURIComponent(requirement.id)}`}
        className="font-normal hover:underline line-clamp-2 min-w-0 flex-1 break-words overflow-hidden text-xs"
        title={requirement.title}
      >
        {requirement.title}
      </Link>
    </td>
  );
}

/**
 * 需求类型单元格
 */
export function TypeCell({ requirement, className = '' }: CellProps) {
  const typeConfig = getRequirementTypeConfig(requirement.type);
  
  return (
    <td className={`px-3 py-3 ${className}`}>
      <span className="text-xs truncate block" title={typeConfig?.label || requirement.type}>
        {typeConfig?.label || requirement.type}
      </span>
    </td>
  );
}

/**
 * 应用端单元格
 */
export function PlatformsCell({ requirement, className = '' }: CellProps) {
  return (
    <td className={`px-3 py-3 ${className}`}>
      {requirement.platforms && requirement.platforms.length > 0 ? (
        <span className="text-xs truncate block" title={requirement.platforms.join(', ')}>
          {requirement.platforms.join(', ')}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )}
    </td>
  );
}

/**
 * 优先级单元格（可编辑）
 */
export function PriorityCell({ requirement, onUpdate, className = '' }: EditableCellProps) {
  const currentValue = requirement.priority;
  const config = currentValue ? getPriorityConfig(currentValue) : null;
  const priorityOrder = ['紧急', '高', '中', '低'];

  return (
    <td className={`px-3 py-3 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`h-6 px-2 py-1 text-xs rounded-md ${
              config?.className || 'bg-gray-100 text-gray-600'
            } hover:opacity-80 transition-opacity duration-150 cursor-pointer inline-flex items-center`}
          >
            {config?.label || '-'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-20">
          {priorityOrder.map((key) => {
            const itemConfig = PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG];
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => {
                  if (currentValue === key) {
                    onUpdate(requirement.id, '');
                    toast.success('已取消优先级');
                  } else {
                    onUpdate(requirement.id, key);
                    toast.success('优先级已更新');
                  }
                }}
                className={`cursor-pointer ${currentValue === key ? 'bg-accent' : ''}`}
              >
                <span className={`px-2 py-1 rounded text-xs ${itemConfig.className} inline-block`}>
                  {itemConfig.label}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}

/**
 * 是否要做单元格（可编辑）
 */
export function NeedToDoCell({ requirement, onUpdate, className = '' }: EditableCellProps) {
  const currentValue = requirement.needToDo;
  const config = currentValue ? getNeedToDoConfig(currentValue) : null;

  return (
    <td className={`px-3 py-3 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`h-6 px-2 py-1 text-xs rounded-md ${
              config?.className || 'bg-gray-100 text-gray-600'
            } hover:opacity-80 transition-opacity duration-150 cursor-pointer inline-flex items-center`}
          >
            {config?.label || '-'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-20">
          {Object.entries(NEED_TO_DO_CONFIG).map(([key, itemConfig]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => {
                if (currentValue === key) {
                  onUpdate(requirement.id, '');
                } else {
                  onUpdate(requirement.id, key);
                }
              }}
              className={`cursor-pointer ${currentValue === key ? 'bg-accent' : ''}`}
            >
              <span className={`px-2 py-1 rounded text-xs ${itemConfig.className} inline-block`}>
                {itemConfig.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}

/**
 * 创建人单元格
 */
export function CreatorCell({ requirement, className = '' }: CellProps) {
  return (
    <td className={`px-3 py-3 ${className}`}>
      <UserAvatar user={requirement.creator} size="sm" showName={false} />
    </td>
  );
}

/**
 * 端负责人单元格
 */
export function EndOwnerCell({ requirement, className = '' }: CellProps) {
  return (
    <td className={`px-3 py-3 ${className}`}>
      {requirement.endOwnerOpinion?.owner ? (
        <UserAvatar user={requirement.endOwnerOpinion.owner} size="sm" showName={false} />
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )}
    </td>
  );
}

/**
 * 创建时间单元格
 */
export function CreatedAtCell({ requirement, className = '' }: CellProps) {
  return (
    <td className={`px-3 py-3 text-xs text-muted-foreground whitespace-nowrap ${className}`}>
      {requirement.createdAt}
    </td>
  );
}

/**
 * 更新时间单元格
 */
export function UpdatedAtCell({ requirement, className = '' }: CellProps) {
  return (
    <td className={`px-3 py-3 text-xs text-muted-foreground whitespace-nowrap ${className}`}>
      {requirement.updatedAt}
    </td>
  );
}





