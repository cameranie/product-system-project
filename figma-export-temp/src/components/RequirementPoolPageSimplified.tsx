import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from "sonner@2.0.3";
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  X,
  EyeOff
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface Requirement {
  id: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通��' | '评审不通过' | '已关闭' | '开发中' | '已完成';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  platform: string[];
  isOpen: boolean;
  needToDo?: '是' | '否';
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 需求类型选项
const requirementTypes = [
  '新功能', '优化', 'BUG', '用户反馈', '商务需求'
];

// 应用端选项
const platforms = [
  'PC端', '移动端', 'web端'
];

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: '用户注册流程优化',
    type: '新功能',
    status: '待评审',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。',
    tags: ['用户体验', 'UI优化', '移动端'],
    createdAt: '2024-01-15 14:30',
    platform: ['web端'],
    isOpen: true,
    needToDo: '是'
  },
  {
    id: '2',
    title: '支付功能集成',
    type: '新功能',
    status: '开发中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[4],
    description: '集成多种支付方式，包括支付宝、微信支付、银行卡支付等，提供安全可靠的支付体验。',
    tags: ['支付', '功能'],
    createdAt: '2024-01-10 09:15',
    platform: ['全平台'],
    isOpen: true,
    needToDo: '是'
  },
  {
    id: '3',
    title: '数据导出功能',
    type: '用户反馈',
    status: '设计中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[3],
    description: '支持用户导出各种格式的数据报表，包括Excel、PDF、CSV等格式。',
    tags: ['导出', '数据分析'],
    createdAt: '2024-01-12 13:25',
    platform: ['web端'],
    isOpen: false
    // needToDo 留空，待评估
  },
  {
    id: '4',
    title: 'K线图实时更新优化',
    type: '优化',
    status: '已完成',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。',
    tags: ['K线', '实时数据', '性能优化'],
    createdAt: '2024-01-20 10:00',
    platform: ['web端'],
    isOpen: true,
    needToDo: '是'
  },
  {
    id: '5',
    title: '行情推送服务升级',
    type: '优化',
    status: '评审通过',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[1],
    description: '升级行情推送服务架构，支持更高并发量的实时行情数据推送，降低延迟。',
    tags: ['行情', 'WebSocket', '高并发'],
    createdAt: '2024-01-22 08:45',
    platform: ['全平台'],
    isOpen: true,
    needToDo: '是'
  },
  {
    id: '6',
    title: '交易风控系统优化',
    type: 'BUG',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[4],
    description: '完善交易风控系统，增加异常交易检测算法，提升系统安全性和风险防控能力。',
    tags: ['风控', '安全', '算法'],
    createdAt: '2024-01-18 16:20',
    platform: ['全平台'],
    isOpen: true,
    needToDo: '否'
  },
  {
    id: '7',
    title: '移动端消息推送功能',
    type: '新功能',
    status: '设计中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[3],
    description: '为移动端用户提供消息推送功能，包括交易提醒、行情变动通知、系统公告等。',
    tags: ['移动端', '推送', '消息'],
    createdAt: '2024-01-28 10:30',
    platform: ['移动端'],
    isOpen: true
    // needToDo 留空，待产品评估
  }
];

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'platform', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'needToDo', label: '是否要做' },
  { value: 'createdAt', label: '创建时间' }
];

// 可排序的列
const sortableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'platform', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'needToDo', label: '是否要做' }
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

interface RequirementPoolPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function RequirementPoolPageSimplified({ context, onNavigate }: RequirementPoolPageProps = {}) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'全部' | '开放中' | '已关闭'>('开放中');

  // 监听选择状态变化
  useEffect(() => {
    setShowBatchActions(selectedRequirements.length > 0);
  }, [selectedRequirements]);

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
  };

  // 切换列显示/隐藏
  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

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
          fieldValue = requirement.type;
          break;
        case 'priority':
          fieldValue = requirement.priority;
          break;
        case 'platform':
          fieldValue = requirement.platform.join(', ');
          break;
        case 'creator':
          fieldValue = requirement.creator.name;
          break;
        case 'needToDo':
          fieldValue = requirement.needToDo || '';
          break;
        case 'createdAt':
          fieldValue = requirement.createdAt;
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

  // 创建需求
  const handleCreateRequirement = () => {
    if (onNavigate) {
      onNavigate('requirement-create', { 
        source: 'requirement-pool' 
      });
    }
  };

  // 查看需求详情
  const handleViewRequirement = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', { 
        requirementId: requirement.id, 
        source: 'requirement-pool' 
      });
    }
  };

  // 需求是否要做字段更新
  const handleNeedToDoChange = (requirementId: string, needToDo: '是' | '否' | undefined) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, needToDo }
          : req
      )
    );
    const statusText = needToDo === undefined ? '未设置' : needToDo;
    toast.success(`已将需求"是否要做"状态更新为: ${statusText}`);
  };

  // 批量更新是否要做
  const handleBatchNeedToDoUpdate = (needToDo: string) => {
    if (selectedRequirements.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    const needToDoValue = needToDo === '是' ? '是' : needToDo === '否' ? '否' : needToDo === 'unset' ? undefined : undefined;
    
    setRequirements(prev => 
      prev.map(req => 
        selectedRequirements.includes(req.id)
          ? { ...req, needToDo: needToDoValue }
          : req
      )
    );
    
    const statusText = needToDoValue === undefined ? '未设置' : needToDoValue;
    toast.success(`已批量将 ${selectedRequirements.length} 个需求的"是否要做"状态更新为: ${statusText}`);
    // 清空选择
    setSelectedRequirements([]);
  };

  // 排序功能
  const handleColumnSort = (column: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.column === column) {
        if (prevConfig.direction === 'asc') {
          return { column, direction: 'desc' };
        } else {
          return null; // 取消排序
        }
      } else {
        return { column, direction: 'asc' };
      }
    });
  };

  // 获取排序图标
  const getSortIcon = (column: string) => {
    if (sortConfig?.column !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // 选择单个需求
  const handleSelectRequirement = (requirementId: string, checked: boolean) => {
    setSelectedRequirements(prev => 
      checked 
        ? [...prev, requirementId]
        : prev.filter(id => id !== requirementId)
    );
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setSelectedRequirements(
      checked ? sortedRequirements.map(req => req.id) : []
    );
  };

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = !searchTerm || 
      requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCustomFilters = applyCustomFilters(requirement, customFilters);
    
    // 状态筛选逻辑
    const matchesStatusFilter = statusFilter === '全部' || 
      (statusFilter === '开放中' && requirement.isOpen) ||
      (statusFilter === '已关闭' && !requirement.isOpen);
    
    return matchesSearch && matchesCustomFilters && matchesStatusFilter;
  });

  // 排序逻辑  
  const sortedRequirements = React.useMemo(() => {
    if (!sortConfig) return filteredRequirements;
    
    return [...filteredRequirements].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortConfig.column) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'priority':
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'platform':
          aValue = a.platform.join(', ');
          bValue = b.platform.join(', ');
          break;
        case 'creator':
          aValue = a.creator.name;
          bValue = b.creator.name;
          break;
        case 'needToDo':
          // 处理可能的空值，空值排在最后
          aValue = a.needToDo || 'zzz';
          bValue = b.needToDo || 'zzz';
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRequirements, sortConfig]);

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1>需求池</h1>
              <p className="text-muted-foreground mt-1">
                管理和追踪未排期的产品需求，支持智能筛选和高级管理功能
              </p>
            </div>
          </div>
          <Button onClick={handleCreateRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            新建需求
          </Button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 搜索和筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* 搜索 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索需求..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* 功能按钮组 */}
                <div className="flex items-center gap-2">
                  {/* 隐藏列 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <EyeOff className="h-4 w-4 mr-2" />
                        隐藏列
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('type')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('type')} />
                        需求类型
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('priority')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('priority')} />
                        优先级
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('platform')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('platform')} />
                        应用端
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('creator')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('creator')} />
                        创建人
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 筛选设置 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-4 w-4 mr-2" />
                        筛选设置
                        {customFilters.length > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {customFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-4" align="start">
                      <div className="space-y-4">
                        <div className="text-sm font-medium">筛选设置</div>
                        
                        {customFilters.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            暂无筛选条件
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {customFilters.map((filter) => (
                              <div key={filter.id} className="space-y-2 p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={filter.column}
                                    onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
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
                                    <SelectTrigger className="h-7 text-xs">
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

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomFilter(filter.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                                  <Input
                                    placeholder="筛选值..."
                                    value={filter.value}
                                    onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                                    className="h-7 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={addCustomFilter}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            添加条件
                          </Button>
                          
                          {customFilters.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={clearAllFilters}
                              className="h-7 text-xs"
                            >
                              清除全部
                            </Button>
                          )}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 状态筛选 */}
              <div className="flex gap-1 bg-muted p-1 rounded-md">
                <button
                  onClick={() => setStatusFilter('全部')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    statusFilter === '全部'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setStatusFilter('开放中')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    statusFilter === '开放中'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  开放中
                </button>
                <button
                  onClick={() => setStatusFilter('已关闭')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    statusFilter === '已关闭'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  已关闭
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 批量操作栏 */}
        {showBatchActions && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
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
                  <span className="text-sm text-muted-foreground">批量操作:</span>
                  <Select onValueChange={handleBatchNeedToDoUpdate}>
                    <SelectTrigger className="w-36 h-8">
                      <SelectValue placeholder="是否要做" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">设为：未设置</SelectItem>
                      <SelectItem value="是">设为：是</SelectItem>
                      <SelectItem value="否">设为：否</SelectItem>
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
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedRequirements.length === sortedRequirements.length && sortedRequirements.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
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
                  {!hiddenColumns.includes('creator') && (
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleColumnSort('creator')}
                    >
                      <div className="flex items-center">
                        创建人
                        {getSortIcon('creator')}
                      </div>
                    </TableHead>
                  )}
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleColumnSort('needToDo')}
                  >
                    <div className="flex items-center">
                      是否要做
                      {getSortIcon('needToDo')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((requirement) => (
                  <TableRow key={requirement.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequirements.includes(requirement.id)}
                        onCheckedChange={(checked) => handleSelectRequirement(requirement.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div>
                        <div 
                          className="hover:underline cursor-pointer"
                          onClick={() => handleViewRequirement(requirement)}
                        >
                          {requirement.title}
                        </div>
                      </div>
                    </TableCell>
                    {!hiddenColumns.includes('type') && (
                      <TableCell>
                        <Badge variant="outline">{requirement.type}</Badge>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('priority') && (
                      <TableCell>
                        <Badge 
                          className={priorityConfig[requirement.priority].className}
                        >
                          {requirement.priority}
                        </Badge>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('platform') && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {requirement.platform.map((p, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('creator') && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={requirement.creator.avatar} />
                            <AvatarFallback className="text-xs">
                              {requirement.creator.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{requirement.creator.name}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Select
                        value={requirement.needToDo || "unset"}
                        onValueChange={(value) => handleNeedToDoChange(requirement.id, value === "unset" ? undefined : value as '是' | '否')}
                      >
                        <SelectTrigger className="h-8 text-sm w-24">
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unset">未设置</SelectItem>
                          <SelectItem value="是">是</SelectItem>
                          <SelectItem value="否">否</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}