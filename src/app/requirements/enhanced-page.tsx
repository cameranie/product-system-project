'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  X,
  Settings,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRequirementsStore, type Requirement, type User, type Project } from '@/lib/requirements-store';

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

// 配置数据
const requirementTypeConfig = {
  NEW_FEATURE: { label: '新功能', color: 'bg-green-100 text-green-800' },
  OPTIMIZATION: { label: '优化', color: 'bg-blue-100 text-blue-800' },
  BUG: { label: 'bug', color: 'bg-red-100 text-red-800' },
  USER_FEEDBACK: { label: '用户反馈', color: 'bg-purple-100 text-purple-800' },
  BUSINESS_REQUIREMENT: { label: '商务需求', color: 'bg-yellow-100 text-yellow-800' }
};

const platformConfig = {
  WEB: { label: 'Web端' },
  MOBILE: { label: '移动端' },
  DESKTOP: { label: '桌面端' },
  API: { label: 'API接口' },
  ALL: { label: '全端' },
};

const priorityConfig = {
  LOW: { label: '低', className: 'bg-green-100 text-green-800' },
  MEDIUM: { label: '中', className: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: '高', className: 'bg-orange-100 text-orange-800' },
  URGENT: { label: '紧急', className: 'bg-red-100 text-red-800' },
};

// 可筛选的列定义 - 移除标题，因为标题是必须显示的
const filterableColumns: FilterableColumn[] = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '需求类型' },
  { value: 'platform', label: '应用端' },
  { value: 'priority', label: '优先级' },
  { value: 'submitter', label: '创建人' },
  { value: 'needToDo', label: '是否要做' },
  { value: 'createdAt', label: '创建时间' }
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

export default function EnhancedRequirementsPage() {
  // 使用全局状态
  const { requirements, getRequirements, updateRequirement, loading: storeLoading } = useRequirementsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 新增状态
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequirementPoolStatus>('开放中');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // 第三阶段新增状态
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [batchNeedToDoValue, setBatchNeedToDoValue] = useState<string>("");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    const loadRequirements = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockRequirements: Requirement[] = [
          {
            id: 'req-001',
            title: '用户头像上传功能优化',
            description: '当前用户头像上传速度较慢，需要优化压缩算法和上传流程',
            type: 'ENHANCEMENT' as RequirementType,
            platform: ['WEB'] as ApplicationPlatform[],
            priority: 'HIGH' as Priority,
            status: 'PENDING' as RequirementStatus,
            submitter: mockUsers[0],
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            needToDo: '是',
            isOpen: true,
            project: mockProjects[0],
            tags: ['用户体验', 'UI优化']
          },
          {
            id: 'req-002',
            title: '移动端消息推送功能',
            description: '为移动端用户提供实时消息推送功能',
            type: 'NEW_FEATURE' as RequirementType,
            platform: ['MOBILE'] as ApplicationPlatform[],
            priority: 'MEDIUM' as Priority,
            status: 'APPROVED' as RequirementStatus,
            submitter: mockUsers[1],
            createdAt: '2024-01-12T14:20:00Z',
            updatedAt: '2024-01-14T09:15:00Z',
            needToDo: '是',
            isOpen: true,
            project: mockProjects[1],
            tags: ['移动端', '推送']
          },
          {
            id: 'req-003',
            title: '数据导出功能异常修复',
            description: '用户反馈Excel导出功能在大数据量时会超时',
            type: 'BUG' as RequirementType,
            platform: ['WEB'] as ApplicationPlatform[],
            priority: 'URGENT' as Priority,
            status: 'SCHEDULED' as RequirementStatus,
            submitter: mockUsers[2],
            createdAt: '2024-01-10T16:45:00Z',
            updatedAt: '2024-01-13T11:30:00Z',
            needToDo: '是',
            isOpen: true,
            project: mockProjects[2],
            tags: ['Bug修复', '数据导出']
          },
          {
            id: 'req-004',
            title: '用户权限管理增强',
            description: '现有权限管理功能较为简单，需要支持更细粒度的权限控制',
            type: 'NEW_FEATURE' as RequirementType,
            platform: ['WEB'] as ApplicationPlatform[],
            priority: 'LOW' as Priority,
            status: 'REJECTED' as RequirementStatus,
            submitter: mockUsers[3],
            createdAt: '2024-01-05T10:10:00Z',
            updatedAt: '2024-01-07T15:45:00Z',
            needToDo: '否',
            isOpen: false,
            project: mockProjects[3],
            tags: ['权限管理', '安全']
          },
          {
            id: 'req-005',
            title: '多语言国际化支持',
            description: '为产品添加多语言支持，包括中文、英文、日文等主要语言',
            type: 'NEW_FEATURE' as RequirementType,
            platform: ['WEB', 'MOBILE'] as ApplicationPlatform[],
            priority: 'MEDIUM' as Priority,
            status: 'APPROVED' as RequirementStatus,
            submitter: mockUsers[4],
            createdAt: '2024-01-03T09:00:00Z',
            updatedAt: '2024-01-06T16:30:00Z',
            needToDo: '是',
            isOpen: true,
            project: mockProjects[4],
            tags: ['国际化', '多语言']
          },
          {
            id: 'req-006',
            title: '搜索性能优化',
            description: '全局搜索功能响应速度慢，需要优化搜索算法和建立索引',
            type: 'OPTIMIZATION' as RequirementType,
            platform: ['ALL'] as ApplicationPlatform[],
            priority: 'HIGH' as Priority,
            status: 'PENDING' as RequirementStatus,
            submitter: mockUsers[0],
            createdAt: '2024-01-08T13:20:00Z',
            updatedAt: '2024-01-08T13:20:00Z',
            isOpen: true,
            project: mockProjects[0],
            tags: ['性能优化', '搜索']
          }
        ];
        
        setRequirements(mockRequirements);
      } catch (err) {
        console.error('Failed to load requirements:', err);
        toast.error('加载需求数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, []);

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
        case 'type':
          fieldValue = requirementTypeConfig[requirement.type]?.label || '';
          break;
        case 'priority':
          fieldValue = priorityConfig[requirement.priority]?.label || '';
          break;
        case 'platform':
          fieldValue = requirement.platform.map(p => platformConfig[p]?.label).join(', ');
          break;
        case 'submitter':
          fieldValue = requirement.submitter.name;
          break;
        case 'needToDo':
          fieldValue = requirement.needToDo || '';
          break;
        case 'createdAt':
          fieldValue = new Date(requirement.createdAt).toLocaleDateString('zh-CN');
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
        req.submitter.name.toLowerCase().includes(searchLower) ||
        requirementTypeConfig[req.type]?.label.toLowerCase().includes(searchLower) ||
        priorityConfig[req.priority]?.label.toLowerCase().includes(searchLower) ||
        req.platform.some(p => platformConfig[p]?.label.toLowerCase().includes(searchLower)) ||
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
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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
    
    setRequirements(prev => 
      prev.map(req => 
        selectedRequirements.includes(req.id)
          ? { ...req, needToDo: needToDoValue }
          : req
      )
    );
    
    const statusText = needToDoValue === undefined ? '未设置' : needToDoValue;
    toast.success(`已批量将 ${selectedRequirements.length} 个需求的"是否要做"状态更新为: ${statusText}`);
    setBatchNeedToDoValue(needToDo);
    setSelectedRequirements([]);
  };

  // 处理优先级变更
  const handlePriorityChange = (requirementId: string, newPriority: Priority) => {
    // 这里应该调用API更新优先级
    console.log(`更新需求 ${requirementId} 的优先级为: ${newPriority}`);
    toast.success(`已更新优先级为: ${priorityConfig[newPriority].label}`);
  };

  // 处理是否要做变更
  const handleNeedToDoChange = (requirementId: string, value: '是' | '否' | undefined) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId ? { ...req, needToDo: value } : req
      )
    );
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
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选设置
                  {customFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {customFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>筛选条件设置</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {customFilters.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    暂无筛选条件
                  </div>
                )}
                
                {customFilters.map((filter, index) => (
                  <div key={filter.id} className="p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">条件 {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomFilter(filter.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Select
                        value={filter.column}
                        onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                      >
                        <SelectTrigger className="h-8">
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
                        <SelectTrigger className="h-8">
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
                        className="h-8"
                        disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
                      />
                    </div>
                    {index < customFilters.length - 1 && <DropdownMenuSeparator />}
                  </div>
                ))}
                
                <DropdownMenuSeparator />
                <div className="p-2 flex gap-2">
                  <Button onClick={addCustomFilter} variant="outline" size="sm" className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    添加条件
                  </Button>
                  {customFilters.length > 0 && (
                    <Button onClick={clearAllFilters} variant="ghost" size="sm">
                      <X className="h-3 w-3 mr-1" />
                      清除
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 列显示控制 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <EyeOff className="h-4 w-4 mr-2" />
                  列显示
                  {hiddenColumns.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filterableColumns.length - hiddenColumns.length}/{filterableColumns.length}
                    </Badge>
                  )}
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

            {/* 状态筛选 - 重新排序并添加数量 */}
            <div className="flex bg-muted p-1 rounded-md">
              {/* 开放中 */}
              <button
                onClick={() => setStatusFilter('开放中')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  statusFilter === '开放中'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                开放中 {stats.open}
              </button>
              {/* 已关闭 */}
              <button
                onClick={() => setStatusFilter('已关闭')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  statusFilter === '已关闭'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                已关闭 {stats.closed}
              </button>
              {/* 全部 */}
              <button
                onClick={() => setStatusFilter('全部')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  statusFilter === '全部'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                全部 {stats.total}
              </button>
            </div>

            {/* 新建需求按钮 - 移到最右侧 */}
            <Button asChild>
              <Link href="/requirements/new">
                <Plus className="h-4 w-4 mr-2" />
                新建需求
              </Link>
            </Button>
          </div>

          {/* 去掉筛选状态提示 */}
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
                    <SelectTrigger className={`w-36 h-8 ${
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRequirements.length === sortedRequirements.length && sortedRequirements.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleColumnSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon('id')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleColumnSort('title')}
                  >
                    <div className="flex items-center">
                      需求标题
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  {!hiddenColumns.includes('type') && (
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleColumnSort('type')}
                    >
                      <div className="flex items-center">
                        需求类型
                        {getSortIcon('type')}
                      </div>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('platform') && (
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleColumnSort('platform')}
                    >
                      <div className="flex items-center">
                        应用端
                        {getSortIcon('platform')}
                      </div>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('needToDo') && (
                    <TableHead>是否要做</TableHead>
                  )}
                  {!hiddenColumns.includes('priority') && (
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleColumnSort('priority')}
                    >
                      <div className="flex items-center">
                        优先级
                        {getSortIcon('priority')}
                      </div>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('submitter') && (
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleColumnSort('submitter')}
                    >
                      <div className="flex items-center">
                        创建人
                        {getSortIcon('submitter')}
                      </div>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('createdAt') && (
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleColumnSort('createdAt')}
                    >
                      <div className="flex items-center">
                        创建时间
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.length > 0 ? (
                  sortedRequirements.map((requirement) => (
                    <TableRow key={requirement.id} className="hover:bg-muted/50">
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedRequirements.includes(requirement.id)}
                          onCheckedChange={(checked) => handleSelectRequirement(requirement.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {requirement.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{requirement.title}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${requirement.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {requirement.isOpen ? '开放中' : '已关闭'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      {!hiddenColumns.includes('type') && (
                        <TableCell>
                          <span className="text-sm">
                            {requirementTypeConfig[requirement.type]?.label || requirement.type}
                          </span>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('platform') && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {requirement.platform.map((p, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {platformConfig[p]?.label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('needToDo') && (
                        <TableCell>
                                                     <Select
                             value={requirement.needToDo || "unset"}
                             onValueChange={(value) => handleNeedToDoChange(requirement.id, value === "unset" ? undefined : value as '是' | '否')}
                           >
                             <SelectTrigger className={`h-8 text-sm w-24 ${
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
                        <TableCell>
                          <Select
                            value={requirement.priority}
                            onValueChange={(value) => handlePriorityChange(requirement.id, value as Priority)}
                          >
                            <SelectTrigger className={`h-8 text-sm w-24 ${priorityConfig[requirement.priority]?.className.replace('text-', 'bg-').replace('-800', '-50')} ${priorityConfig[requirement.priority]?.className.replace('-800', '-700')} border-${priorityConfig[requirement.priority]?.className.split('-')[1]}-200`}>
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.submitter.username}`} />
                              <AvatarFallback className="text-xs">
                                {requirement.submitter.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{requirement.submitter.name}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('createdAt') && (
                        <TableCell className="text-sm">
                          {new Date(requirement.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                      )}
                      {/* 去掉操作列 */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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