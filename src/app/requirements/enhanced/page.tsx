'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  EyeOff,
  Settings,
  MoreHorizontal,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRequirementsStore, type Requirement } from '@/lib/requirements-store';

// 配置数据
const requirementTypeConfig = {
  '新功能': { label: '新功能', color: 'bg-green-100 text-green-800' },
  '优化': { label: '优化', color: 'bg-blue-100 text-blue-800' },
  'BUG': { label: 'bug', color: 'bg-red-100 text-red-800' },
  '用户反馈': { label: '用户反馈', color: 'bg-purple-100 text-purple-800' },
  '商务需求': { label: '商务需求', color: 'bg-yellow-100 text-yellow-800' }
};

const priorityConfig = {
  '低': { label: '低', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' },
  '中': { label: '中', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
  '高': { label: '高', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  '紧急': { label: '紧急', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
};

const needToDoConfig = {
  '是': { label: '是', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
  '否': { label: '否', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  undefined: { label: '未设置', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' }
};

type RequirementPoolStatus = '全部' | '开放中' | '已关闭';
type SortField = 'id' | 'title' | 'type' | 'priority' | 'status' | 'creator' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function RequirementsPoolPage() {
  // 使用全局状态
  const { requirements, getRequirements, updateRequirement, loading: storeLoading } = useRequirementsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequirementPoolStatus>('开放中');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(['createdAt', 'updatedAt']);
  const [batchNeedToDoValue, setBatchNeedToDoValue] = useState<'是' | '否' | undefined>(undefined);
  const [customFilters, setCustomFilters] = useState<Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
  }>>([]);

  // 筛选和排序逻辑
  const getFilteredAndSortedRequirements = () => {
    let filtered = requirements;

    // 状态筛选
    if (statusFilter === '开放中') {
      filtered = filtered.filter(req => req.isOpen);
    } else if (statusFilter === '已关闭') {
      filtered = filtered.filter(req => !req.isOpen);
    }

    // 搜索筛选
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.id.toLowerCase().includes(searchLower) ||
        req.title.toLowerCase().includes(searchLower) ||
        req.creator.name.toLowerCase().includes(searchLower) ||
        req.platforms.some(platform => platform.toLowerCase().includes(searchLower)) ||
        req.type.toLowerCase().includes(searchLower)
      );
    }

    // 自定义筛选条件
    customFilters.forEach(filter => {
      if (!filter.value.trim()) return;
      
      filtered = filtered.filter(req => {
        let fieldValue = '';
        switch (filter.field) {
          case 'title':
            fieldValue = req.title.toLowerCase();
            break;
          case 'type':
            fieldValue = req.type.toLowerCase();
            break;
          case 'priority':
            fieldValue = req.priority.toLowerCase();
            break;
          case 'creator':
            fieldValue = req.creator.name.toLowerCase();
            break;
          case 'status':
            fieldValue = req.status.toLowerCase();
            break;
          default:
            return true;
        }
        
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.operator) {
          case 'contains':
            return fieldValue.includes(filterValue);
          case 'equals':
            return fieldValue === filterValue;
          case 'not_contains':
            return !fieldValue.includes(filterValue);
          case 'not_equals':
            return fieldValue !== filterValue;
          default:
            return true;
        }
      });
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortConfig.field] as string | number;
      let bValue: string | number = b[sortConfig.field] as string | number;

      if (sortConfig.field === 'creator') {
        aValue = a.creator.name;
        bValue = b.creator.name;
      } else if (sortConfig.field === 'id') {
        aValue = a.id;
        bValue = b.id;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  };

  const filteredRequirements = getFilteredAndSortedRequirements();

  // 统计数据
  const stats = {
    total: requirements.length,
    open: requirements.filter(req => req.isOpen).length,
    closed: requirements.filter(req => !req.isOpen).length,
    filtered: filteredRequirements.length
  };

  // 处理排序
  const handleColumnSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(filteredRequirements.map(req => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  // 处理单个选择
  const handleSelectRequirement = (requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements(prev => [...prev, requirementId]);
    } else {
      setSelectedRequirements(prev => prev.filter(id => id !== requirementId));
    }
  };

  // 处理是否要做状态更新
  const handleNeedToDoChange = async (requirementId: string, value: '是' | '否' | undefined) => {
    try {
      await updateRequirement(requirementId, { needToDo: value });
      const statusText = value === undefined ? '未设置' : value;
      toast.success(`已将需求"是否要做"状态更新为: ${statusText}`);
    } catch (error) {
      toast.error('更新失败，请重试');
    }
  };

  // 处理优先级更新
  const handlePriorityChange = async (requirementId: string, priority: '低' | '中' | '高' | '紧急') => {
    try {
      await updateRequirement(requirementId, { priority });
      toast.success(`已将需求优先级更新为: ${priority}`);
    } catch (error) {
      toast.error('更新失败，请重试');
    }
  };

  // 批量更新是否要做
  const handleBatchNeedToDoUpdate = async () => {
    if (selectedRequirements.length === 0) {
      toast.error('请先选择需求');
      return;
    }
    if (batchNeedToDoValue === undefined) {
      toast.error('请选择是否要做状态');
      return;
    }

    try {
      await Promise.all(
        selectedRequirements.map(id => 
          updateRequirement(id, { needToDo: batchNeedToDoValue })
        )
      );
      const statusText = batchNeedToDoValue;
      toast.success(`已批量更新 ${selectedRequirements.length} 个需求的"是否要做"状态为: ${statusText}`);
      setSelectedRequirements([]);
      setBatchNeedToDoValue(undefined);
    } catch (error) {
      toast.error('批量更新失败，请重试');
    }
  };

  // 列显示控制
  const filterableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: '需求类型' },
    { key: 'platform', label: '应用端' },
    { key: 'needToDo', label: '是否要做' },
    { key: 'priority', label: '优先级' },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间' },
    { key: 'updatedAt', label: '更新时间' }
  ];

  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 搜索和筛选区域 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索需求ID、标题、创建人、应用端、类型等..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className={customFilters.filter(f => f.value.trim()).length > 0 ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : ""}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {customFilters.filter(f => f.value.trim()).length > 0 
                    ? `${customFilters.filter(f => f.value.trim()).length} 筛选设置`
                    : "筛选设置"
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[480px] p-4">
                <div className="space-y-4">
                  {customFilters.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      暂无筛选条件，点击"添加条件"开始设置
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {customFilters.map((filter, index) => (
                        <div key={filter.id} className="flex items-center gap-2 p-2 border rounded-lg">
                          <Select
                            value={filter.field}
                            onValueChange={(value) => {
                              setCustomFilters(prev => prev.map(f => 
                                f.id === filter.id ? { ...f, field: value } : f
                              ));
                            }}
                          >
                            <SelectTrigger className="w-24 h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="title">标题</SelectItem>
                              <SelectItem value="type">类型</SelectItem>
                              <SelectItem value="priority">优先级</SelectItem>
                              <SelectItem value="creator">创建人</SelectItem>
                              <SelectItem value="status">状态</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => {
                              setCustomFilters(prev => prev.map(f => 
                                f.id === filter.id ? { ...f, operator: value } : f
                              ));
                            }}
                          >
                            <SelectTrigger className="w-20 h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">包含</SelectItem>
                              <SelectItem value="equals">等于</SelectItem>
                              <SelectItem value="not_contains">不包含</SelectItem>
                              <SelectItem value="not_equals">不等于</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Input
                            placeholder="筛选值"
                            value={filter.value}
                            onChange={(e) => {
                              setCustomFilters(prev => prev.map(f => 
                                f.id === filter.id ? { ...f, value: e.target.value } : f
                              ));
                            }}
                            className="w-[200px] h-7"
                          />
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCustomFilters(prev => prev.filter(f => f.id !== filter.id));
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newFilter = {
                            id: Date.now().toString(),
                            field: 'title',
                            operator: 'contains',
                            value: ''
                          };
                          setCustomFilters(prev => [...prev, newFilter]);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        添加条件
                      </Button>
                      {customFilters.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCustomFilters([])}
                        >
                          清空条件
                        </Button>
                      )}
                    </div>
                    {customFilters.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {customFilters.filter(f => f.value.trim()).length} 个有效条件
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className={hiddenColumns.length > 0 ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : ""}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {hiddenColumns.length > 0 
                    ? `${hiddenColumns.length} 列隐藏`
                    : "列隐藏"
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>隐藏列</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterableColumns.map(column => (
                  <DropdownMenuItem
                    key={column.key}
                    onClick={() => toggleColumnVisibility(column.key)}
                    className="flex items-center gap-2"
                  >
                    {hiddenColumns.includes(column.key) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {column.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* 开放中 */}
            <button
              onClick={() => setStatusFilter('开放中')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === '开放中'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              开放中 {stats.open}
            </button>
            
            {/* 已关闭 */}
            <button
              onClick={() => setStatusFilter('已关闭')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === '已关闭'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              已关闭 {stats.closed}
            </button>
            
            {/* 全部 */}
            <button
              onClick={() => setStatusFilter('全部')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === '全部'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              全部 {stats.total}
            </button>

            <Link href="/requirements/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新建需求
              </Button>
            </Link>
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedRequirements.length > 0 && (
          <Card>
            <CardContent className="py-2 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedRequirements.length} 项
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">批量设置是否要做:</span>
                    <Select value={batchNeedToDoValue} onValueChange={(value: '是' | '否' | undefined) => setBatchNeedToDoValue(value)}>
                      <SelectTrigger className={`w-28 h-7 ${
                        batchNeedToDoValue ? needToDoConfig[batchNeedToDoValue].bgColor + ' ' + needToDoConfig[batchNeedToDoValue].textColor + ' ' + needToDoConfig[batchNeedToDoValue].borderColor : ''
                      }`}>
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="是" className="bg-green-50 text-green-700">是</SelectItem>
                        <SelectItem value="否" className="bg-red-50 text-red-700">否</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleBatchNeedToDoUpdate}>
                      应用
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequirements([])}
                >
                  取消选择
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 需求表格 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {!hiddenColumns.includes('id') && (
                    <TableHead className="w-[8%] min-w-[80px] px-2">
                      <Button variant="ghost" onClick={() => handleColumnSort('id')} className="h-auto p-0 font-medium">
                        ID
                        {sortConfig.field === 'id' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                  <TableHead className="w-[35%] min-w-[200px] px-3">
                    <Button variant="ghost" onClick={() => handleColumnSort('title')} className="h-auto p-0 font-medium">
                      需求标题
                      {sortConfig.field === 'title' && (
                        sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  {!hiddenColumns.includes('type') && (
                    <TableHead className="w-[10%] min-w-[90px] px-2">
                      <Button variant="ghost" onClick={() => handleColumnSort('type')} className="h-auto p-0 font-medium">
                        需求类型
                        {sortConfig.field === 'type' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('platform') && (
                    <TableHead className="w-[12%] min-w-[100px] px-2">应用端</TableHead>
                  )}
                  {!hiddenColumns.includes('needToDo') && (
                    <TableHead className="w-[10%] min-w-[90px] px-2">是否要做</TableHead>
                  )}
                  {!hiddenColumns.includes('priority') && (
                    <TableHead className="w-[8%] min-w-[80px] px-2">
                      <Button variant="ghost" onClick={() => handleColumnSort('priority')} className="h-auto p-0 font-medium">
                        优先级
                        {sortConfig.field === 'priority' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('creator') && (
                    <TableHead className="w-[10%] min-w-[90px] px-2">
                      <Button variant="ghost" onClick={() => handleColumnSort('creator')} className="h-auto p-0 font-medium">
                        创建人
                        {sortConfig.field === 'creator' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('createdAt') && (
                    <TableHead className="w-[12%] min-w-[100px] px-2">
                      <Button variant="ghost" onClick={() => handleColumnSort('createdAt')} className="h-auto p-0 font-medium">
                        创建时间
                        {sortConfig.field === 'createdAt' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('updatedAt') && (
                    <TableHead className="w-[12%] min-w-[100px] px-2">
                      <Button variant="ghost" onClick={() => handleColumnSort('updatedAt')} className="h-auto p-0 font-medium">
                        更新时间
                        {sortConfig.field === 'updatedAt' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      暂无符合条件的需求
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequirements.map((requirement) => (
                    <TableRow key={requirement.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRequirements.includes(requirement.id)}
                          onCheckedChange={(checked) => handleSelectRequirement(requirement.id, checked as boolean)}
                        />
                      </TableCell>
                      {!hiddenColumns.includes('id') && (
                        <TableCell className="font-mono text-xs px-2">
                          {requirement.id.slice(0, 8)}
                        </TableCell>
                      )}
                      <TableCell className="px-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              href={`/requirements/${requirement.id}`}
                              className="font-medium hover:text-blue-600 cursor-pointer break-words line-clamp-2"
                            >
                              {requirement.title}
                            </Link>
                            <span className="text-xs text-gray-400 font-normal whitespace-nowrap">
                              {requirement.isOpen ? 'open' : 'closed'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {!hiddenColumns.includes('type') && (
                        <TableCell className="px-2">
                          <span className="text-sm">{requirementTypeConfig[requirement.type]?.label || requirement.type}</span>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('platform') && (
                        <TableCell className="px-2">
                          <div className="flex flex-wrap gap-1">
                            {requirement.platforms.map(platform => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('needToDo') && (
                        <TableCell className="px-2">
                          <Select 
                            value={requirement.needToDo || 'undefined'} 
                            onValueChange={(value) => handleNeedToDoChange(requirement.id, value === 'undefined' ? undefined : value as '是' | '否')}
                          >
                            <SelectTrigger className={`w-20 h-7 text-xs ${
                              requirement.needToDo ? needToDoConfig[requirement.needToDo].bgColor + ' ' + needToDoConfig[requirement.needToDo].textColor + ' ' + needToDoConfig[requirement.needToDo].borderColor : needToDoConfig.undefined.bgColor + ' ' + needToDoConfig.undefined.textColor + ' ' + needToDoConfig.undefined.borderColor
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="是" className="bg-green-50 text-green-700">是</SelectItem>
                              <SelectItem value="否" className="bg-red-50 text-red-700">否</SelectItem>
                              <SelectItem value="undefined" className="bg-gray-50 text-gray-600">未设置</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <TableCell className="px-2">
                          <Select 
                            value={requirement.priority} 
                            onValueChange={(value) => handlePriorityChange(requirement.id, value as '低' | '中' | '高' | '紧急')}
                          >
                            <SelectTrigger className={`w-16 h-7 text-xs ${priorityConfig[requirement.priority].bgColor} ${priorityConfig[requirement.priority].textColor} ${priorityConfig[requirement.priority].borderColor}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="低" className="bg-gray-50 text-gray-600">低</SelectItem>
                              <SelectItem value="中" className="bg-yellow-50 text-yellow-700">中</SelectItem>
                              <SelectItem value="高" className="bg-orange-50 text-orange-700">高</SelectItem>
                              <SelectItem value="紧急" className="bg-red-50 text-red-700">紧急</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('creator') && (
                        <TableCell className="px-2">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">{requirement.creator.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate">{requirement.creator.name}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('createdAt') && (
                        <TableCell className="text-sm text-muted-foreground px-2">
                          {requirement.createdAt}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('updatedAt') && (
                        <TableCell className="text-sm text-muted-foreground px-2">
                          {requirement.updatedAt}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 