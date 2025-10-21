'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface DataTableSearchProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * 通用数据表格搜索框组件
 * 
 * 可用于需求池、预排期、看板等所有列表页面
 * 
 * @example
 * ```tsx
 * <DataTableSearch
 *   value={searchTerm}
 *   placeholder="搜索需求..."
 *   onChange={setSearchTerm}
 * />
 * ```
 */
export function DataTableSearch({
  value,
  placeholder = '搜索...',
  onChange,
  className = 'w-80',
}: DataTableSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}

