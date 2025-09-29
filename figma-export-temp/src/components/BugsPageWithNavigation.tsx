import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Bug,
  ArrowLeft,
  X,
  Link,
  Eye,
  EyeOff,
  Settings,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from './ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';

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
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface Bug {
  id: string;
  title: string;
  description?: string;
  priority: '低' | '中' | '高' | '紧急';
  status: '待处理' | '处理中' | '待测试' | '已解决';
  assignee: User;
  tester: User;
  requirement?: Requirement;
  productOwner?: User;
  reproductionSteps?: string;
  expectedResult?: string;
  actualResult?: string;
  environment?: string;
  testVersion?: string;
  testDevice?: string;
  tags?: string[];
  attachments?: Attachment[];
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '测试员A', avatar: '', role: '测试工程师' },
  { id: '7', name: '测试员B', avatar: '', role: '测试工程师' },
  { id: '8', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '9', name: '李晓红', avatar: '', role: '产品负责人' },
  { id: '10', name: '王小明', avatar: '', role: '产品负责人' },
  { id: '11', name: '陈大华', avatar: '', role: '产品负责人' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

const mockRequirements: Requirement[] = [
  { id: '1', title: '用户注册流程优化' },
  { id: '2', title: '支付功能集成' },
  { id: '3', title: '数据导出功能' },
  { id: '4', title: 'K线图实时更新优化' },
  { id: '5', title: '行情推送服务升级' },
  { id: '6', title: '交易风控系统优化' },
  { id: '7', title: '移动端消息推送功能' }
];

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: 'Bug标题' },
  { value: 'status', label: '状态' },
  { value: 'priority', label: '优先级' },
  { value: 'assignee', label: '处理人' },
  { value: 'tester', label: '测试人' },
  { value: 'requirement', label: '所属需求' },
  { value: 'productOwner', label: '产品负责人' }
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

const mockBugs: Bug[] = [
  // 需求1的bugs
  {
    id: '1',
    title: '登录页面在Safari浏览器下出现白屏',
    description: '用户在Safari浏览器中访问登录页面时，页面显示空白，无法正常使用',
    priority: '紧急',
    status: '处理中',
    assignee: mockUsers[0],
    tester: mockUsers[5],
    requirement: { id: '1', title: '用户注册流程优化' },
    productOwner: mockUsers[8],
    tags: ['浏览器兼容', '登录', '紧急修复']
  },
  {
    id: '4',
    title: '注册表单验证逻辑错误',
    description: '用户注册时，邮箱验证规则过于严格，导致部分合法邮箱无法注册',
    priority: '高',
    status: '待处理',
    assignee: mockUsers[1],
    tester: mockUsers[6],
    requirement: { id: '1', title: '用户注册流程优化' },
    productOwner: mockUsers[8],
    tags: ['注册', '表单验证', '邮箱']
  },
  {
    id: '5',
    title: '第三方登录回调失败',
    description: '使用微信登录时，回调处理失败导致无法正常完成登录流程',
    priority: '中',
    status: '已解决',
    assignee: mockUsers[2],
    tester: mockUsers[5],
    requirement: { id: '1', title: '用户注册流程优化' },
    productOwner: mockUsers[8],
    tags: ['第三方登录', '微信', '���调']
  },
  // 需求2的bugs
  {
    id: '2',
    title: '支付金额显示精度错误',
    description: '在支付页面，当金额包含小数点时，显示的金额与实际应付金额不符',
    priority: '高',
    status: '待测试',
    assignee: mockUsers[1],
    tester: mockUsers[6],
    requirement: { id: '2', title: '支付功能集成' },
    productOwner: mockUsers[9],
    tags: ['支付', '数据精度', '计算错误']
  },
  {
    id: '6',
    title: '微信支付回调处理异常',
    description: '微信支付成功后，回调处理失败，导致订单状态不更新',
    priority: '紧急',
    status: '处理中',
    assignee: mockUsers[2],
    tester: mockUsers[5],
    requirement: { id: '2', title: '支付功能集成' },
    productOwner: mockUsers[9],
    tags: ['支付', '微信支付', '回调']
  },
  // 需求4的bugs
  {
    id: '3',
    title: '移动端按钮样式偏移问题',
    description: '在移动设备上，主要操作按钮位置偏移，影响用户体验',
    priority: '中',
    status: '已解决',
    assignee: mockUsers[2],
    tester: mockUsers[6],
    requirement: { id: '4', title: 'K线图实时更新优化' },
    productOwner: mockUsers[10],
    tags: ['移动端', 'UI样式', '响应式']
  },
  {
    id: '7',
    title: 'K线图数据延迟显示',
    description: 'K线图实时数据更新存在明显延迟，影响交易决策',
    priority: '高',
    status: '已解决',
    assignee: mockUsers[0],
    tester: mockUsers[7],
    requirement: { id: '4', title: 'K线图实时更新优化' },
    productOwner: mockUsers[10],
    tags: ['K线', '实时数据', '性能']
  },
  {
    id: '8',
    title: '技术指标计算错误',
    description: '部分技术指标计算结果与标准算法不符',
    priority: '中',
    status: '待处理',
    assignee: mockUsers[3],
    tester: mockUsers[7],
    requirement: { id: '4', title: 'K线图实时更新优化' },
    productOwner: mockUsers[10],
    tags: ['技术指标', '计算', 'MACD']
  }
];

// 状态配置
const statusLabels = {
  '待处理': { label: '待处理', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
  '处理中': { label: '处理中', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  '待测试': { label: '待测试', variant: 'outline' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  '已解决': { label: '已解决', variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' }
};

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};



interface BugsPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function BugsPageWithNavigation({ context, onNavigate }: BugsPageProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [statusFilter, setStatusFilter] = useState<'全部' | '开放中' | '已关闭'>('开放中');

  


  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  
  // 列显示状态
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    requirement: true,
    productOwner: true,
    status: true,
    priority: true,
    assignee: true,
    tester: true
  });
  
  // 排序状态
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({
    key: '',
    direction: null
  });
  
  // Bug创建表单状态
  const [showCreateForm, setShowCreateForm] = useState(context?.mode === 'create');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '中' as const,
    status: '待处理' as const,
    assigneeId: '',
    testerId: '6', // 默认选择测试员A
    requirementId: context?.relatedRequirementId || '',
    reproductionSteps: '',
    expectedResult: '',
    actualResult: '',
    environment: '',
    testVersion: '',
    testDevice: '',
    tags: [] as string[]
  });

  // 关联需求相关状态
  const [requirementSearchTerm, setRequirementSearchTerm] = useState('');
  const [showRequirementSearch, setShowRequirementSearch] = useState(false);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      // 如果是从需求详情页面跳转过来的，需要传递更多上下文信息
      if (context.returnTo === 'requirement-detail' && context.returnContext) {
        onNavigate(context.returnTo, context.returnContext);
      } else {
        onNavigate(context.returnTo);
      }
    }
  };

  const handleCreateBug = () => {
    if (onNavigate) {
      onNavigate('bug-create', {
        returnTo: 'bugs',
        returnContext: context
      });
    }
  };

  const handleSaveBug = () => {
    // 表单验证
    if (!formData.title.trim()) {
      alert('请输入Bug标题');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('请输入Bug描述');
      return;
    }
    
    if (!formData.assigneeId) {
      alert('请选择处理人');
      return;
    }
    
    if (!formData.testerId) {
      alert('请选择测试人员');
      return;
    }

    const newBug: Bug = {
      id: (bugs.length + 1).toString(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      assignee: mockUsers.find(u => u.id === formData.assigneeId) || mockUsers[0],
      tester: mockUsers.find(u => u.id === formData.testerId) || mockUsers[5], // 使用选择的测试人员
      requirement: formData.requirementId ? 
        mockRequirements.find(r => r.id === formData.requirementId) || 
        { id: formData.requirementId, title: context?.relatedRequirementTitle || '未知需求' } 
        : undefined,
      reproductionSteps: formData.reproductionSteps,
      expectedResult: formData.expectedResult,
      actualResult: formData.actualResult,
      environment: formData.environment,
      testVersion: formData.testVersion,
      testDevice: formData.testDevice,
      tags: formData.tags
    };

    setBugs([...bugs, newBug]);
    setShowCreateForm(false);
    
    // 重置表单
    setFormData({
      title: '',
      description: '',
      priority: '中',
      status: '待处理',
      assigneeId: '',
      testerId: '6', // 默认选择测试员A
      requirementId: context?.relatedRequirementId || '',
      reproductionSteps: '',
      expectedResult: '',
      actualResult: '',
      environment: '',
      testVersion: '',
      testDevice: '',
      tags: []
    });

    // 重置关联需求相关状态
    setRequirementSearchTerm('');
    setShowRequirementSearch(false);

    // 如果是从需求详情页跳转过来创建的，创建完成后返回需求详情页
    if (context?.mode === 'create' && context?.returnTo && onNavigate) {
      if (context.returnTo === 'requirement-detail' && context.returnContext) {
        onNavigate(context.returnTo, context.returnContext);
      }
    }
  };



  const handleViewBug = (bug: Bug) => {
    if (onNavigate) {
      onNavigate('bug-detail', {
        bugId: bug.id,
        returnTo: 'bugs',
        returnContext: context
      });
    }
  };

  const handleStatusChange = (bugId: string, newStatus: Bug['status']) => {
    setBugs(bugs.map(bug => 
      bug.id === bugId 
        ? { ...bug, status: newStatus }
        : bug
    ));
  };

  // 处理关联需求
  const handleSelectRequirement = (requirement: Requirement) => {
    setFormData({ ...formData, requirementId: requirement.id });
    setShowRequirementSearch(false);
    setRequirementSearchTerm('');
  };

  const handleRemoveRequirement = () => {
    setFormData({ ...formData, requirementId: '' });
  };

  // 处理搜索输入框的键盘事件
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowRequirementSearch(false);
      setRequirementSearchTerm('');
    } else if (e.key === 'Enter' && filteredRequirements.length === 1) {
      handleSelectRequirement(filteredRequirements[0]);
    }
  };

  // 筛选需求列表
  const filteredRequirements = mockRequirements.filter(req => 
    req.title.toLowerCase().includes(requirementSearchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(requirementSearchTerm.toLowerCase())
  );

  // 获取当前关联的需求
  const getLinkedRequirement = () => {
    if (!formData.requirementId) return null;
    
    // 如果是从需求详情页跳转过来的，优先使用context中的信息
    if (context?.relatedRequirementId === formData.requirementId && context?.relatedRequirementTitle) {
      return { id: formData.requirementId, title: context.relatedRequirementTitle };
    }
    
    // 否则从mockRequirements中查找
    return mockRequirements.find(req => req.id === formData.requirementId) || null;
  };

  // 应用自定义筛选条件
  const applyCustomFilters = (bug: Bug, filters: FilterCondition[]): boolean => {
    return filters.every(filter => {
      if (!filter.value && !['is_empty', 'is_not_empty'].includes(filter.operator)) {
        return true; // 如果没有设置值，跳过该筛选条件
      }

      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = bug.title;
          break;
        case 'status':
          fieldValue = bug.status;
          break;
        case 'priority':
          fieldValue = bug.priority;
          break;
        case 'assignee':
          fieldValue = bug.assignee.name;
          break;
        case 'tester':
          fieldValue = bug.tester.name;
          break;
        case 'requirement':
          fieldValue = bug.requirement?.title || '';
          break;
        case 'productOwner':
          fieldValue = bug.productOwner?.name || '';
          break;
        default:
          return true;
      }

      const value = filter.value.toLowerCase();
      const field = fieldValue.toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return field === value;
        case 'not_equals':
          return field !== value;
        case 'contains':
          return field.includes(value);
        case 'not_contains':
          return !field.includes(value);
        case 'is_empty':
          return fieldValue === '';
        case 'is_not_empty':
          return fieldValue !== '';
        default:
          return true;
      }
    });
  };

  // 筛选逻辑
  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = !searchTerm || 
                          bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 如果从需求详情页跳转过来，只显示该需求相关��bugs
    const matchesRequirement = !context?.filterRequirementId || 
                               bug.requirement?.id === context.filterRequirementId;
    
    // 应用自定义筛选条件
    const matchesCustomFilters = applyCustomFilters(bug, customFilters);
    
    // 应用状态筛选 - 开放中包括：待处理、处理中、待测试；已关闭包括：已解决
    const matchesStatusFilter = statusFilter === '全部' || 
      (statusFilter === '开放中' && ['待处理', '处理中', '待测试'].includes(bug.status)) ||
      (statusFilter === '已关闭' && ['已解决'].includes(bug.status));
    
    return matchesSearch && matchesRequirement && matchesCustomFilters && matchesStatusFilter;
  });

  // 排序逻辑
  const sortedBugs = [...filteredBugs].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    let aValue: any = '';
    let bValue: any = '';
    
    switch (sortConfig.key) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'priority':
        const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'assignee':
        aValue = a.assignee.name;
        bValue = b.assignee.name;
        break;
      case 'tester':
        aValue = a.tester.name;
        bValue = b.tester.name;
        break;
      case 'requirement':
        aValue = a.requirement?.title || '';
        bValue = b.requirement?.title || '';
        break;
      case 'productOwner':
        aValue = a.productOwner?.name || '';
        bValue = b.productOwner?.name || '';
        break;
      default:
        return 0;
    }
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 排序处理函数
  const handleSort = (key: string, direction?: 'asc' | 'desc') => {
    if (direction) {
      // 如果指定了方向，直接设置
      setSortConfig({ key, direction });
    } else {
      // 如果没有指定方向，按照原有逻辑切换
      setSortConfig(prevConfig => {
        if (prevConfig.key === key) {
          // 同一列：无排序 -> 升序 -> 降序 -> 无排序
          if (prevConfig.direction === null) {
            return { key, direction: 'asc' };
          } else if (prevConfig.direction === 'asc') {
            return { key, direction: 'desc' };
          } else {
            return { key: '', direction: null };
          }
        } else {
          // 不同列：直接设置为升序
          return { key, direction: 'asc' };
        }
      });
    }
  };





  // 列切换处理函数
  const handleColumnToggle = (columnKey: string) => {
    // Bug标题列不允许隐藏
    if (columnKey === 'title') return;
    
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof typeof prev]
    }));
  };

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



  // 如果是创建模式且显示表单，显示Bug创建表单
  if (showCreateForm) {
    return (
      <div className="p-6 space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancelCreate}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {context?.returnTo === 'requirement-detail' ? '返回需求详情' : '返回'}
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                提交中
              </Badge>
              {formData.title ? (
                <h1 className="text-2xl font-semibold">{formData.title}</h1>
              ) : (
                <h1 className="text-2xl font-semibold text-muted-foreground">请输入问题标题</h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancelCreate}>
              取消
            </Button>
            <Button 
              onClick={handleSaveBug} 
              disabled={!formData.title.trim() || !formData.description.trim() || !formData.assigneeId}
            >
              提交问题
            </Button>
          </div>
        </div>

        {/* 左右布局 - 与需求编辑页面一致 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 - 左侧 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 问题描述 */}
            <Card>
              <CardHeader>
                <CardTitle>问题描述</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">问题标题 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="请输入问题标题"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">问题描述 *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="请详细描述遇到的问题..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 问题详情 */}
            <Card>
              <CardHeader>
                <CardTitle>问题详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reproductionSteps">重现步骤</Label>
                    <Textarea
                      id="reproductionSteps"
                      value={formData.reproductionSteps}
                      onChange={(e) => setFormData({ ...formData, reproductionSteps: e.target.value })}
                      placeholder="请输入重现问题的详细步骤..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedResult">期望结果</Label>
                      <Textarea
                        id="expectedResult"
                        value={formData.expectedResult}
                        onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                        placeholder="请输入期望的正确结果..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="actualResult">实际结果</Label>
                      <Textarea
                        id="actualResult"
                        value={formData.actualResult}
                        onChange={(e) => setFormData({ ...formData, actualResult: e.target.value })}
                        placeholder="请输入实际出现的结果..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="testVersion">测试版本</Label>
                      <Input
                        id="testVersion"
                        value={formData.testVersion || ''}
                        onChange={(e) => setFormData({ ...formData, testVersion: e.target.value })}
                        placeholder="如���v2.1.0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="testDevice">测试设备</Label>
                      <Input
                        id="testDevice"
                        value={formData.testDevice || ''}
                        onChange={(e) => setFormData({ ...formData, testDevice: e.target.value })}
                        placeholder="如：iPhone 14, Chrome浏览器"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="environment">测试环境</Label>
                    <Textarea
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      placeholder="请输入测试环境信息（操作系统、浏览器版本、网络环境等）..."
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边信息 - 右侧 1/3 */}
          <div className="space-y-6">
            {/* 关联需求 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  关联需求
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getLinkedRequirement() ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          已关联
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleRemoveRequirement}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          title="移除关联"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium line-clamp-2">
                          {getLinkedRequirement()?.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {getLinkedRequirement()?.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      该问题会与关联的需求一起展示和管理
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showRequirementSearch ? (
                      <>
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="搜索需求标题或ID..."
                              value={requirementSearchTerm}
                              onChange={(e) => setRequirementSearchTerm(e.target.value)}
                              onKeyDown={handleSearchKeyDown}
                              className="pl-10"
                              autoFocus
                            />
                          </div>
                          {filteredRequirements.length > 1 && requirementSearchTerm && (
                            <div className="text-xs text-muted-foreground px-1">
                              找到 {filteredRequirements.length} 个匹���的需求
                            </div>
                          )}
                          {filteredRequirements.length === 1 && requirementSearchTerm && (
                            <div className="text-xs text-muted-foreground px-1">
                              按 Enter 键快速选择
                            </div>
                          )}
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {filteredRequirements.length > 0 ? (
                            filteredRequirements.map(requirement => (
                              <div
                                key={requirement.id}
                                className="p-3 border rounded-lg hover:bg-muted/50 hover:border-muted-foreground/30 cursor-pointer transition-all duration-200 group"
                                onClick={() => handleSelectRequirement(requirement)}
                              >
                                <div className="text-sm font-medium line-clamp-2 group-hover:text-foreground transition-colors">
                                  {requirement.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">
                                  ID: {requirement.id}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                              {requirementSearchTerm ? '未找到匹配的需求' : '输入关键词搜索需求'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setShowRequirementSearch(false);
                              setRequirementSearchTerm('');
                            }}
                            className="flex-1"
                          >
                            取消
                          </Button>
                          <div className="text-xs text-muted-foreground">
                            按 Esc 取消
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-sm text-muted-foreground mb-3">
                          暂未关联任何需求
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowRequirementSearch(true)}
                          className="w-full"
                        >
                          <Link className="h-4 w-4 mr-2" />
                          关联需求
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">优先级</Label>
                  <div className="mt-1">
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="低">
                          <Badge 
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80"
                          >
                            低
                          </Badge>
                        </SelectItem>
                        <SelectItem value="中">
                          <Badge 
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80"
                          >
                            中
                          </Badge>
                        </SelectItem>
                        <SelectItem value="高">
                          <Badge 
                            variant="outline"
                            className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80"
                          >
                            高
                          </Badge>
                        </SelectItem>
                        <SelectItem value="紧急">
                          <Badge 
                            variant="destructive"
                            className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80"
                          >
                            紧急
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">指派给 *</Label>
                  <div className="mt-1">
                    <Select 
                      value={formData.assigneeId} 
                      onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择处理人" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {user.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.role}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">状态</Label>
                  <div className="mt-1">
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="待处理">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            待处理
                          </Badge>
                        </SelectItem>
                        <SelectItem value="处理中">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            处理中
                          </Badge>
                        </SelectItem>
                        <SelectItem value="待测试">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            待测试
                          </Badge>
                        </SelectItem>
                        <SelectItem value="已解决">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            已解决
                          </Badge>
                        </SelectItem>

                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">测试人员 *</Label>
                  <div className="mt-1">
                    <Select 
                      value={formData.testerId} 
                      onValueChange={(value) => setFormData({ ...formData, testerId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择测试人员" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.filter(user => user.role === '测试工程师').map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {user.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.role}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {context?.returnTo && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {context.returnTo === 'requirement-detail' ? '返回需求详情' : '返回'}
              </Button>
            )}
            <div>
              <h1>
                {context?.filterRequirementId ? `${context.requirementTitle || '需求'} - 相关问题` : 'Bug追踪'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {context?.filterRequirementId ? '管理该需求相关的测试问题和缺陷' : '管理和跟踪项目中的问题和缺陷'}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateBug}>
            <Plus className="h-4 w-4 mr-2" />
            新建Bug
          </Button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 筛选提示 */}
        {context?.filterRequirementId && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bug className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  正在显示需求 "<span className="font-medium">{context.requirementTitle}</span>" 的相关问题
                </span>
                <Badge variant="secondary" className="text-xs">
                  {sortedBugs.length} 个问题
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 筛选和操作栏 */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 搜索和工具栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索Bug标题、描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  
                  {/* 隐藏列 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <EyeOff className="h-4 w-4 mr-2" />
                        隐藏列
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem className="opacity-50 cursor-not-allowed">
                        <Checkbox className="mr-2" checked={visibleColumns.title} disabled />
                        Bug标题
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleColumnToggle('requirement')}>
                        <Checkbox className="mr-2" checked={visibleColumns.requirement} />
                        所属需求
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleColumnToggle('productOwner')}>
                        <Checkbox className="mr-2" checked={visibleColumns.productOwner} />
                        产品负责人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleColumnToggle('status')}>
                        <Checkbox className="mr-2" checked={visibleColumns.status} />
                        状态
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleColumnToggle('priority')}>
                        <Checkbox className="mr-2" checked={visibleColumns.priority} />
                        优先级
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleColumnToggle('assignee')}>
                        <Checkbox className="mr-2" checked={visibleColumns.assignee} />
                        处理人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleColumnToggle('tester')}>
                        <Checkbox className="mr-2" checked={visibleColumns.tester} />
                        测试人
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
                          <Badge variant="secondary" className="ml-2">
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
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-muted-foreground">筛选条件</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeCustomFilter(filter.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {/* 列选择 */}
                                <Select
                                  value={filter.column}
                                  onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filterableColumns.map((column) => (
                                      <SelectItem key={column.value} value={column.value}>
                                        {column.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {/* 操作符选择 */}
                                <Select
                                  value={filter.operator}
                                  onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filterOperators.map((operator) => (
                                      <SelectItem key={operator.value} value={operator.value}>
                                        {operator.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {/* 值输入 */}
                                {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                                  <Input
                                    placeholder="筛选值"
                                    value={filter.value}
                                    onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addCustomFilter}
                            className="h-8 flex-1"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            添加条件
                          </Button>
                          {customFilters.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-8"
                            >
                              清除全部
                            </Button>
                          )}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 排序 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        排序
                        {sortConfig && sortConfig.direction && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            1
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleSort('title', 'asc')}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        Bug标题 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('title', 'desc')}>
                        <ArrowDown className="h-3 w-3 mr-2" />
                        Bug标题 ↓
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('priority', 'asc')}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        优先级 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('priority', 'desc')}>
                        <ArrowDown className="h-3 w-3 mr-2" />
                        优先级 ↓
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('status', 'asc')}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        状态 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('status', 'desc')}>
                        <ArrowDown className="h-3 w-3 mr-2" />
                        状态 ↓
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('productOwner', 'asc')}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        产品负责人 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('productOwner', 'desc')}>
                        <ArrowDown className="h-3 w-3 mr-2" />
                        产品负责人 ↓
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('assignee', 'asc')}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        处理人 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('assignee', 'desc')}>
                        <ArrowDown className="h-3 w-3 mr-2" />
                        处理人 ↓
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('tester', 'asc')}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        测试人 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('tester', 'desc')}>
                        <ArrowDown className="h-3 w-3 mr-2" />
                        测试人 ↓
                      </DropdownMenuItem>
                      {sortConfig && sortConfig.direction && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSortConfig({ key: '', direction: null })}>
                            <X className="h-3 w-3 mr-2" />
                            清除排序
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* 状态Tab筛选器 */}
                <div className="flex items-center">
                  <div className="flex items-center bg-muted rounded-lg p-1">
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
              </div>

              {/* 筛选器 */}
              <div className="flex items-center gap-4">

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bug列表 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {visibleColumns.title && (
                      <TableHead className="min-w-[300px]">
                        <button 
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Bug标题
                          {sortConfig.key === 'title' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'title' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'title' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.requirement && (
                      <TableHead className="w-28">
                        <button 
                          onClick={() => handleSort('requirement')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          所属需求
                          {sortConfig.key === 'requirement' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'requirement' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'requirement' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.productOwner && (
                      <TableHead className="w-28">
                        <button 
                          onClick={() => handleSort('productOwner')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          产品负责人
                          {sortConfig.key === 'productOwner' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'productOwner' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'productOwner' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="w-32">
                        <button 
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          状态
                          {sortConfig.key === 'status' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'status' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'status' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.priority && (
                      <TableHead className="w-32">
                        <button 
                          onClick={() => handleSort('priority')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          优先级
                          {sortConfig.key === 'priority' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'priority' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'priority' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.assignee && (
                      <TableHead className="w-36">
                        <button 
                          onClick={() => handleSort('assignee')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          处理人
                          {sortConfig.key === 'assignee' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'assignee' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'assignee' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.tester && (
                      <TableHead className="w-36">
                        <button 
                          onClick={() => handleSort('tester')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          测试人
                          {sortConfig.key === 'tester' && sortConfig.direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                          {sortConfig.key === 'tester' && sortConfig.direction === 'desc' && <ArrowDown className="h-4 w-4" />}
                          {(sortConfig.key !== 'tester' || !sortConfig.direction) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                        </button>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBugs.length > 0 ? (
                    sortedBugs.map((bug) => (
                      <TableRow key={bug.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleViewBug(bug)}>
                        {visibleColumns.title && (
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Bug className="h-4 w-4 text-red-500" />
                                  <p className="font-medium text-primary hover:underline">
                                    {bug.title}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.requirement && (
                          <TableCell>
                            <span className="text-sm truncate max-w-20">
                              {bug.requirement?.title || '-'}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.productOwner && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={bug.productOwner?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {bug.productOwner?.name?.charAt(0) || 'N'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate max-w-20">
                                {bug.productOwner?.name || '-'}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Select
                              value={bug.status}
                              onValueChange={(value: Bug['status']) => handleStatusChange(bug.id, value)}
                            >
                              <SelectTrigger className="h-6 border-0 p-1 w-auto min-w-20 bg-transparent hover:bg-muted/50 focus:ring-1">
                                <Badge 
                                  variant={statusLabels[bug.status].variant}
                                  className={`text-xs pointer-events-none ${statusLabels[bug.status].className}`}
                                >
                                  {statusLabels[bug.status].label}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="待处理">
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                    待处理
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="处理中">
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                    处理中
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="待测试">
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                                    待测试
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="已解决">
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    已解决
                                  </Badge>
                                </SelectItem>

                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                        {visibleColumns.priority && (
                          <TableCell>
                            <Badge 
                              variant={priorityConfig[bug.priority].variant}
                              className={`text-xs ${priorityConfig[bug.priority].className}`}
                            >
                              {bug.priority}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.assignee && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={bug.assignee.avatar} />
                                <AvatarFallback className="text-xs">
                                  {bug.assignee.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate max-w-20">{bug.assignee.name}</span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.tester && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={bug.tester.avatar} />
                                <AvatarFallback className="text-xs">
                                  {bug.tester.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate max-w-20">{bug.tester.name}</span>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {context?.filterRequirementId ? 
                            '该需求暂无相关问题' : 
                            (searchTerm ? '未找到匹配的问题' : '暂无问题数据')
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}