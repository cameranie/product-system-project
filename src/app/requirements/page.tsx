'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRequirementsStore, type Requirement } from '@/lib/requirements-store';
import { RequirementTable } from '@/components/requirements/RequirementTable';
import { FilterPanel } from '@/components/requirements/FilterPanel';
import { useRequirementFilters } from '@/hooks/useRequirementFilters';
import { 
  FILTERABLE_COLUMNS, 
  NEED_TO_DO_CONFIG,
  PRIORITY_CONFIG 
} from '@/config/requirements';

// 导入类型定义
import type { 
  RequirementStatus, 
  RequirementType, 
  ApplicationPlatform,
  Priority,
  SortConfig,
  RequirementPoolStatus,
  FilterCondition,
  FilterableColumn
} from '@/types/issue';

// 配置数据 - 修复类型匹配问题
const requirementTypeConfig = {
  '新功能': { label: '新功能', color: 'bg-green-100 text-green-800' },
  '优化': { label: '优化', color: 'bg-blue-100 text-blue-800' },
  'BUG': { label: 'BUG', color: 'bg-red-100 text-red-800' },
  '用户反馈': { label: '用户反馈', color: 'bg-purple-100 text-purple-800' },
  '商务需求': { label: '商务需求', color: 'bg-yellow-100 text-yellow-800' }
} as const;

const platformConfig = {
  'Web端': { label: 'Web端' },
  '移动端': { label: '移动端' },
  'PC端': { label: 'PC端' },
  'API接口': { label: 'API接口' },
  '全端': { label: '全端' },
} as const;

const priorityConfig = {
  '低': { label: '低', className: 'bg-green-100 text-green-800' },
  '中': { label: '中', className: 'bg-yellow-100 text-yellow-800' },
  '高': { label: '高', className: 'bg-orange-100 text-orange-800' },
  '紧急': { label: '紧急', className: 'bg-red-100 text-red-800' },
} as const;

// 可筛选的列定义 - 移除标题，因为标题是必须显示的
const filterableColumns: FilterableColumn[] = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '需求类型' },
  { value: 'platform', label: '应用端' },
  { value: 'priority', label: '优先级' },
  { value: 'submitter', label: '创建人' },
  { value: 'needToDo', label: '是否要做' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' }
];

// 筛选操作符
const filterOperators = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
];

export default function RequirementsPage() {
  // 使用全局状态
  const { requirements, updateRequirement } = useRequirementsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据加载状态
  useEffect(() => {
    // 模拟数据加载完成
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 新增状态
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequirementPoolStatus>('开放中');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // 第三阶段新增状态
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(['createdAt', 'updatedAt']);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [batchNeedToDoValue, setBatchNeedToDoValue] = useState<string>("");

  // 应用自定义筛选条件
  const applyCustomFilters = (requirement: Requirement, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.value && filter.operator !== 'is_empty' && filter.operator !== 'is_not_empty') {
        return true;
      }

      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = requirement.title;
          break;
        case 'id':
          fieldValue = requirement.id;
          break;
        case 'type':
          fieldValue = requirementTypeConfig[requirement.type]?.label || '';
          break;
        case 'priority':
          fieldValue = priorityConfig[requirement.priority]?.label || '';
          break;
        case 'platform':
          fieldValue = (requirement.platforms || []).map(p => platformConfig[p as keyof typeof platformConfig]?.label).join(', ');
          break;
        case 'submitter':
          fieldValue = requirement.creator?.name || '';
          break;
        case 'needToDo':
          fieldValue = requirement.needToDo || '';
          break;
        case 'createdAt':
          fieldValue = requirement.createdAt;
          break;
        case 'updatedAt':
          fieldValue = requirement.updatedAt;
          break;
        default:
          return true;
      }

      const filterValue = filter.value.toLowerCase();
      const targetValue = fieldValue.toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return targetValue === filterValue;
        case 'not_equals':
          return targetValue !== filterValue;
        case 'contains':
          return targetValue.includes(filterValue);
        case 'not_contains':
          return !targetValue.includes(filterValue);
        case 'is_empty':
          return !fieldValue || fieldValue.trim() === '';
        case 'is_not_empty':
          return fieldValue && fieldValue.trim() !== '';
        default:
          return true;
      }
    });
  };

  // 过滤和排序逻辑
  const getFilteredAndSortedRequirements = () => {
    let filtered = requirements;

    // 状态筛选
    if (statusFilter === '开放中') {
      filtered = filtered.filter(req => req.isOpen === true);
    } else if (statusFilter === '已关闭') {
      filtered = filtered.filter(req => req.isOpen === false);
    }

    // 增强搜索筛选 - 支持多字段搜索（包括ID）
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.id.toLowerCase().includes(searchLower) ||
        req.title.toLowerCase().includes(searchLower) ||
        req.description.toLowerCase().includes(searchLower) ||
        req.creator?.name?.toLowerCase().includes(searchLower) ||
        requirementTypeConfig[req.type]?.label.toLowerCase().includes(searchLower) ||
        priorityConfig[req.priority]?.label.toLowerCase().includes(searchLower) ||
        (req.platforms || []).some(p => platformConfig[p as keyof typeof platformConfig]?.label.toLowerCase().includes(searchLower)) ||
        (req.project?.name.toLowerCase().includes(searchLower)) ||
        (req.tags?.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // 应用自定义筛选
    if (customFilters.length > 0) {
      filtered = filtered.filter(req => applyCustomFilters(req, customFilters));
    }

    // 排序
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        switch (sortConfig.column) {
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'priority':
            const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
            bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        } else {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const sortedRequirements = getFilteredAndSortedRequirements();

  // 添加自定义筛选条件
  const addCustomFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: 'title',
      operator: 'contains',
      value: ''
    };
    setCustomFilters([...customFilters, newFilter]);
  };

  // 删除自定义筛选条件
  const removeCustomFilter = (filterId: string) => {
    setCustomFilters(customFilters.filter(f => f.id !== filterId));
  };

  // 更新自定义筛选条件
  const updateCustomFilter = (filterId: string, field: string, value: string) => {
    setCustomFilters(customFilters.map(f => 
      f.id === filterId ? { ...f, [field]: value } : f
    ));
  };

  // 清除所有筛选条件
  const clearAllFilters = () => {
    setCustomFilters([]);
    setSearchTerm('');
    toast.success('已清除所有筛选条件');
  };

  // 切换列显示/隐藏
  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => {
      const newHidden = prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey];
      
      const action = prev.includes(columnKey) ? '显示' : '隐藏';
      const columnLabel = filterableColumns.find(col => col.value === columnKey)?.label || columnKey;
      toast.success(`已${action}列: ${columnLabel}`);
      
      return newHidden;
    });
  };

  // 处理排序
  const handleColumnSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        if (prev.direction === 'asc') {
          return { column, direction: 'desc' };
        } else {
          return null;
        }
      } else {
        return { column, direction: 'asc' };
      }
    });
  };

  // 获取排序图标
  const getSortIcon = (column: string) => {
    if (sortConfig?.column !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // 选择处理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(sortedRequirements.map(req => req.id));
      toast.success(`已选择 ${sortedRequirements.length} 个需求`);
    } else {
      setSelectedRequirements([]);
      toast.success('已取消所有选择');
    }
  };

  const handleSelectRequirement = (requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements(prev => [...prev, requirementId]);
    } else {
      setSelectedRequirements(prev => prev.filter(id => id !== requirementId));
    }
  };

  // 批量更新"是否要做"
  const handleBatchNeedToDoUpdate = (needToDo: string) => {
    if (selectedRequirements.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const needToDoValue = needToDo === '是' ? '是' : needToDo === '否' ? '否' : undefined;
    
    selectedRequirements.forEach(id => {
      updateRequirement(id, { needToDo: needToDoValue });
    });
    
    const statusText = needToDoValue === undefined ? '未设置' : needToDoValue;
    toast.success(`已批量将 ${selectedRequirements.length} 个需求的"是否要做"状态更新为: ${statusText}`);
    setBatchNeedToDoValue(needToDo);
    setSelectedRequirements([]);
  };

  // 处理优先级变更
  const handlePriorityChange = (requirementId: string, newPriority: Priority) => {
    updateRequirement(requirementId, { priority: newPriority });
    toast.success(`已更新优先级为: ${priorityConfig[newPriority].label}`);
  };

  // 处理是否要做变更
  const handleNeedToDoChange = (requirementId: string, value: '是' | '否' | undefined) => {
    updateRequirement(requirementId, { needToDo: value });
    const statusText = value === undefined ? '未设置' : value;
    toast.success(`已将需求"是否要做"状态更新为: ${statusText}`);
  };

  // 统计数据
  const stats = {
    total: requirements.length,
    open: requirements.filter(req => req.isOpen === true).length,
    closed: requirements.filter(req => req.isOpen === false).length,
    needToDo: requirements.filter(req => req.needToDo === '是').length,
    notToDo: requirements.filter(req => req.needToDo === '否').length,
    filtered: sortedRequirements.length
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载需求池数据中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">加载失败: {error}</p>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 筛选和搜索区域 - 去掉外框 */}
        <div className="space-y-4">
          {/* 搜索框和操作按钮 - 重新布局 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="搜索需求ID、标题、创建人、应用端、类型等..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* 筛选设置 - 改为下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className={customFilters.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {customFilters.length > 0 ? `${customFilters.length} 筛选设置` : '筛选设置'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[600px]">
                <DropdownMenuSeparator />
                
                {customFilters.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    暂无筛选条件
                  </div>
                )}
                
                {customFilters.map((filter, index) => (
                  <div key={filter.id} className="p-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={filter.column}
                        onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filterableColumns.map((col) => (
                            <SelectItem key={col.value} value={col.value}>
                              {col.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                      >
                        <SelectTrigger className="h-8 w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        placeholder="筛选值"
                        value={filter.value}
                        onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                        className="h-8 flex-1 min-w-[120px]"
                        style={{ minWidth: '120px' }}
                        disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomFilter(filter.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <DropdownMenuSeparator />
                <div className="p-2 flex gap-2">
                  <Button onClick={addCustomFilter} variant="outline" size="sm" className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    添加条件
                  </Button>
                  {customFilters.length > 0 && (
                    <Button onClick={clearAllFilters} variant="outline" size="sm" className="flex-1">
                      <X className="h-3 w-3 mr-1" />
                      清空条件
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 列隐藏控制 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className={hiddenColumns.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {hiddenColumns.length > 0 ? `${hiddenColumns.length} 列隐藏` : '列隐藏'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>显示/隐藏列</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterableColumns.map((col) => (
                  <DropdownMenuItem
                    key={col.value}
                    onClick={() => toggleColumnVisibility(col.value)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={!hiddenColumns.includes(col.value)}
                      className="pointer-events-none"
                    />
                    <span className="flex-1">{col.label}</span>
                    {!hiddenColumns.includes(col.value) ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setHiddenColumns([]);
                    toast.success('已显示所有列');
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  显示所有列
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 使用 flex-1 来推送右侧元素到最右边 */}
            <div className="flex-1"></div>

            {/* 状态筛选 - 参照列隐藏样式 */}
            <div className="flex">
              {/* 开放中 */}
              <Button
                variant="outline"
                onClick={() => setStatusFilter('开放中')}
                className={`rounded-r-none border-r-0 ${
                  statusFilter === '开放中' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
                }`}
              >
                开放中 {stats.open}
              </Button>
              {/* 已关闭 */}
              <Button
                variant="outline"
                onClick={() => setStatusFilter('已关闭')}
                className={`rounded-none border-r-0 ${
                  statusFilter === '已关闭' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
                }`}
              >
                已关闭 {stats.closed}
              </Button>
              {/* 全部 */}
              <Button
                variant="outline"
                onClick={() => setStatusFilter('全部')}
                className={`rounded-l-none ${
                  statusFilter === '全部' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''
                }`}
              >
                全部 {stats.total}
              </Button>
            </div>

            {/* 新建需求按钮 - 移到最右侧 */}
            <Button asChild>
              <Link href="/requirements/new">
                <Plus className="h-4 w-4 mr-2" />
                新建需求
              </Link>
            </Button>
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedRequirements.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-1.5 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-700">
                    已选择 {selectedRequirements.length} 个需求
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedRequirements([])}
                  >
                    取消选择
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">批量操作:</span>
                  <Select value={batchNeedToDoValue} onValueChange={handleBatchNeedToDoUpdate}>
                    <SelectTrigger className={`w-28 h-8 ${
                      batchNeedToDoValue === '是' ? 'bg-green-50 text-green-700 border-green-200' :
                      batchNeedToDoValue === '否' ? 'bg-red-50 text-red-700 border-red-200' :
                      batchNeedToDoValue === 'unset' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                      ''
                    }`}>
                      <SelectValue placeholder="是否要做" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset" className="bg-gray-50 text-gray-600">
                        <span className="font-medium">设为：未设置</span>
                      </SelectItem>
                      <SelectItem value="是" className="bg-green-50 text-green-700">
                        <span className="font-medium">设为：是</span>
                      </SelectItem>
                      <SelectItem value="否" className="bg-red-50 text-red-700">
                        <span className="font-medium">设为：否</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <TableHead className="w-[8%] px-2">
                    <Checkbox
                      checked={selectedRequirements.length === sortedRequirements.length && sortedRequirements.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {!hiddenColumns.includes('id') && (
                    <TableHead className="w-[8%] px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 font-medium"
                        onClick={() => handleColumnSort('id')}
                      >
                        ID
                        {getSortIcon('id')}
                      </Button>
                    </TableHead>
                  )}
                  <TableHead className="w-[35%] px-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-medium"
                      onClick={() => handleColumnSort('title')}
                    >
                      标题
                      {getSortIcon('title')}
                    </Button>
                  </TableHead>
                  {!hiddenColumns.includes('type') && (
                    <TableHead className="w-[10%] px-2">需求类型</TableHead>
                  )}
                  {!hiddenColumns.includes('platform') && (
                    <TableHead className="w-[10%] px-2">应用端</TableHead>
                  )}
                  {!hiddenColumns.includes('needToDo') && (
                    <TableHead className="w-[8%] px-2">是否要做</TableHead>
                  )}
                  {!hiddenColumns.includes('priority') && (
                    <TableHead className="w-[8%] px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 font-medium"
                        onClick={() => handleColumnSort('priority')}
                      >
                        优先级
                        {getSortIcon('priority')}
                      </Button>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('submitter') && (
                    <TableHead className="w-[8%] px-2">创建人</TableHead>
                  )}
                  {!hiddenColumns.includes('createdAt') && (
                    <TableHead className="w-[10%] px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 font-medium"
                        onClick={() => handleColumnSort('createdAt')}
                      >
                        创建时间
                        {getSortIcon('createdAt')}
                      </Button>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('updatedAt') && (
                    <TableHead className="w-[10%] px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 font-medium"
                        onClick={() => handleColumnSort('updatedAt')}
                      >
                        更新时间
                        {getSortIcon('updatedAt')}
                      </Button>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.length > 0 ? (
                  sortedRequirements.map((requirement) => (
                    <TableRow key={requirement.id} className="hover:bg-muted/50">
                      <TableCell className="px-2">
                        <Checkbox
                          checked={selectedRequirements.includes(requirement.id)}
                          onCheckedChange={(checked) => handleSelectRequirement(requirement.id, checked as boolean)}
                        />
                      </TableCell>
                      {!hiddenColumns.includes('id') && (
                        <TableCell className="px-2 font-mono text-xs text-muted-foreground">
                          {requirement.id}
                        </TableCell>
                      )}
                      <TableCell className="px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/requirements/${requirement.id}`}
                              className="font-medium hover:text-blue-600 cursor-pointer line-clamp-2"
                            >
                              {requirement.title}
                            </Link>
                            <Badge variant={requirement.isOpen ? "default" : "secondary"} className="text-xs">
                              {requirement.isOpen ? 'Open' : 'Closed'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      {!hiddenColumns.includes('type') && (
                        <TableCell className="px-2">
                          <span className="text-sm">
                            {requirementTypeConfig[requirement.type]?.label || requirement.type}
                          </span>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('platform') && (
                        <TableCell className="px-2">
                          <div className="flex flex-wrap gap-1">
                            {(requirement.platforms || []).map((p, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {platformConfig[p as keyof typeof platformConfig]?.label || p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('needToDo') && (
                        <TableCell className="px-2">
                          <Select
                            value={requirement.needToDo || "unset"}
                            onValueChange={(value) => handleNeedToDoChange(requirement.id, value === "unset" ? undefined : value as '是' | '否')}
                          >
                            <SelectTrigger className={`h-8 text-sm w-20 ${
                              requirement.needToDo === '是' ? 'bg-green-50 text-green-700 border-green-200' :
                              requirement.needToDo === '否' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              <SelectValue placeholder="请选择" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unset" className="bg-gray-50 text-gray-600">
                                <span className="font-medium">未设置</span>
                              </SelectItem>
                              <SelectItem value="是" className="bg-green-50 text-green-700">
                                <span className="font-medium">是</span>
                              </SelectItem>
                              <SelectItem value="否" className="bg-red-50 text-red-700">
                                <span className="font-medium">否</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <TableCell className="px-2">
                          <Select
                            value={requirement.priority}
                            onValueChange={(value) => handlePriorityChange(requirement.id, value as Priority)}
                          >
                            <SelectTrigger className={`h-8 text-sm w-16 ${priorityConfig[requirement.priority]?.className.replace('text-', 'bg-').replace('-800', '-50')} ${priorityConfig[requirement.priority]?.className.replace('-800', '-700')} border-${priorityConfig[requirement.priority]?.className.split('-')[1]}-200`}>
                              <SelectValue placeholder="请选择" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(priorityConfig).map(([key, value]) => (
                                <SelectItem 
                                  key={key} 
                                  value={key}
                                  className={`${value.className.replace('text-', 'bg-').replace('-800', '-50')} ${value.className}`}
                                >
                                  <span className="font-medium">{value.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('submitter') && (
                        <TableCell className="px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={requirement.creator?.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.creator?.name}`} />
                              <AvatarFallback className="text-xs">
                                {requirement.creator?.name?.slice(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{requirement.creator?.name || '未知用户'}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('createdAt') && (
                        <TableCell className="px-2 text-sm">
                          {requirement.createdAt}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('updatedAt') && (
                        <TableCell className="px-2 text-sm">
                          {requirement.updatedAt}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {searchTerm || customFilters.length > 0 || statusFilter !== '全部' 
                        ? '没有找到符合条件的需求' 
                        : '暂无需求数据'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
