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
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  EyeOff,
  Target,
  FolderOpen
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
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  platform: string[];
  assignee?: User;
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  scheduledVersion?: string; // 预排期版本号
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
  { id: '6', name: '林嘉娜', avatar: '', role: '一级评审员' },
  { id: '7', name: '叶裴锋', avatar: '', role: '一级评审员' },
  { id: '8', name: '谢焰明', avatar: '', role: '二级评审员' },
  { id: '9', name: '卢兆锋', avatar: '', role: '二级评审员' },
  { id: '10', name: '陆柏良', avatar: '', role: '二级评审员' },
  { id: '11', name: '杜韦志', avatar: '', role: '二级评审员' },
  { id: '12', name: '温明震', avatar: '', role: '二级评审员' },
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

// 评审状态配置
const reviewerStatusLabels = {
  pending: { label: '待评审', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  approved: { label: '已通过', variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  rejected: { label: '已拒绝', variant: 'secondary' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: '用户权限管理优化',
    type: '新功能',
    status: '待评审',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[3],
    description: '优化用户权限管理系统，支持更细粒度的权限控制，提升系统安全性和管理效率。',
    tags: ['权限', '安全', '管理'],
    createdAt: '2024-01-25 10:15',
    updatedAt: '2024-01-28 09:30',
    platform: ['PC端', 'web端'],
    isOpen: true,
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    assignee: mockUsers[1],
    scheduledVersion: 'v2.3.0'
  },
  {
    id: '2',
    title: '数据备份恢复功能',
    type: '新功能',
    status: '评审中',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '增加自动数据备份和恢复功能，确保重要数据的安全性，支持定时备份和手动备份。',
    tags: ['备份', '恢复', '数据安全'],
    createdAt: '2024-01-20 14:45',
    updatedAt: '2024-01-26 16:20',
    platform: ['PC端', '移动端', 'web端'],
    isOpen: true,
    reviewer1: mockUsers[6],
    reviewer2: mockUsers[8],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    assignee: mockUsers[0],
    scheduledVersion: 'v2.4.0'
  },
  {
    id: '3',
    title: 'K线图实时更新异常修复',
    type: 'BUG',
    status: '评审通过',
    priority: '紧急',
    creator: mockUsers[2],
    project: mockProjects[0],
    description: 'K线图在高频交易时段出现实时更新延迟和数据错乱问题，需要紧急修复。',
    tags: ['K线', '实时更新', '性能'],
    createdAt: '2024-01-28 15:40',
    updatedAt: '2024-01-29 08:15',
    platform: ['PC端', 'web端'],
    isOpen: true,
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[9],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    assignee: mockUsers[2],
    scheduledVersion: 'v2.2.1'
  },
  {
    id: '4',
    title: '聊天室消息推送优化',
    type: '优化',
    status: '开发中',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[2],
    description: '优化聊天室消息推送机制，减少延迟，提升用户体验。',
    tags: ['聊天', '推送', '性能优化'],
    createdAt: '2024-01-18 12:30',
    updatedAt: '2024-01-23 17:45',
    platform: ['移动端', 'web端'],
    isOpen: true,
    reviewer1: mockUsers[6],
    reviewer1Status: 'approved',
    assignee: mockUsers[3],
    scheduledVersion: 'v2.3.0'
  },
  {
    id: '5',
    title: '移动端交易界面改进建议',
    type: '用户反馈',
    status: '待评审',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[4],
    description: '用户反馈移动端交易界面操作不够便捷，建议改进布局和交互方式。',
    tags: ['移动端', '交易界面', '用户体验'],
    createdAt: '2024-01-26 13:50',
    updatedAt: '2024-01-27 11:10',
    platform: ['移动端'],
    isOpen: true,
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending'
  },
  {
    id: '6',
    title: '合规报告生成功能',
    type: '商务需求',
    status: '评审中',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '为满足监管要求，需要新增合规报告自动生成功能，支持多种报告格式。',
    tags: ['合规', '报告', '监管'],
    createdAt: '2024-01-21 09:40',
    updatedAt: '2024-01-25 14:20',
    platform: ['PC端', 'web端'],
    isOpen: true,
    reviewer1: mockUsers[6],
    reviewer2: mockUsers[10],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    assignee: mockUsers[2],
    scheduledVersion: 'v2.4.0'
  }
];

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'status', label: '状态' },
  { value: 'platform', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'reviewer1Status', label: '一级评审状态' },
  { value: 'reviewer2Status', label: '二级评审状态' },
  { value: 'scheduledVersion', label: '预排期版本号' },
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

interface RequirementPoolPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function RequirementPoolPage({ context, onNavigate }: RequirementPoolPageProps = {}) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  // 根据一级和二级评审状态计算总评审状态
  const getReviewStatus = (requirement: Requirement): string => {
    const { reviewer1Status, reviewer2Status, reviewer1, reviewer2 } = requirement;
    
    // 如果一级评审未通过，直接返回评审不通过
    if (reviewer1Status === 'rejected') {
      return '评审不通过';
    }
    
    // 如果只有一级评审人员
    if (reviewer1 && !reviewer2) {
      if (reviewer1Status === 'approved') return '评审通过';
      if (reviewer1Status === 'pending') return '一级评审中';
      return '待评审';
    }
    
    // 如果有两级评审人员
    if (reviewer1 && reviewer2) {
      if (reviewer1Status === 'approved' && reviewer2Status === 'approved') {
        return '评审通过';
      }
      if (reviewer1Status === 'approved' && reviewer2Status === 'pending') {
        return '二级评审中';
      }
      if (reviewer1Status === 'pending') {
        return '一级评审中';
      }
    }
    
    return '待评审';
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

  // 切换列显示/隐藏
  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  // 排序处理
  const handleSort = (column: string, direction?: 'asc' | 'desc') => {
    if (direction) {
      setSortConfig({ column, direction });
    } else {
      setSortConfig(null);
    }
  };

  // 应用自定义筛选逻辑
  const applyCustomFilters = (requirement: Requirement, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.column || !filter.operator) return true;
      
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
        case 'status':
          fieldValue = requirement.status;
          break;
        case 'platform':
          fieldValue = requirement.platform.join(', ');
          break;
        case 'creator':
          fieldValue = requirement.creator.name;
          break;
        case 'reviewer1Status':
          fieldValue = requirement.reviewer1Status ? reviewerStatusLabels[requirement.reviewer1Status].label : '';
          break;
        case 'reviewer2Status':
          fieldValue = requirement.reviewer2Status ? reviewerStatusLabels[requirement.reviewer2Status].label : '';
          break;
        case 'scheduledVersion':
          fieldValue = requirement.scheduledVersion || '';
          break;
        case 'createdAt':
          fieldValue = requirement.createdAt;
          break;
        default:
          return true;
      }

      const filterValue = filter.value.toLowerCase();
      const fieldValueLower = fieldValue.toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return fieldValueLower === filterValue;
        case 'not_equals':
          return fieldValueLower !== filterValue;
        case 'contains':
          return fieldValueLower.includes(filterValue);
        case 'not_contains':
          return !fieldValueLower.includes(filterValue);
        case 'is_empty':
          return fieldValue === '';
        case 'is_not_empty':
          return fieldValue !== '';
        default:
          return true;
      }
    });
  };

  // 处理需求类型修改
  const handleTypeChange = (requirementId: string, type: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, type: type as any, updatedAt }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理优先级修改
  const handlePriorityChange = (requirementId: string, priority: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, priority: priority as '低' | '中' | '高' | '紧急', updatedAt }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理项目修改
  const handleProjectChange = (requirementId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const now = new Date();
      const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const updatedRequirements = requirements.map(r => 
        r.id === requirementId 
          ? { ...r, project, updatedAt }
          : r
      );
      setRequirements(updatedRequirements);
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (requirementId: string, platform: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, platform: [platform], updatedAt }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理负责人修改
  const handleAssigneeChange = (requirementId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, assignee: user || undefined, updatedAt }
        : r
    );
    setRequirements(updatedRequirements);
  };

  const handleCreateRequirement = () => {
    if (onNavigate) {
      onNavigate('requirement-edit', { 
        requirement: null, 
        isEdit: false,
        source: 'requirement-pool'
      });
    }
  };

  const handleViewRequirement = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', { 
        requirementId: requirement.id, 
        source: 'requirement-pool' 
      });
    }
  };

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = requirement.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomFilters = applyCustomFilters(requirement, customFilters);
    
    return matchesSearch && matchesCustomFilters;
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
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'platform':
          aValue = a.platform.join(', ');
          bValue = b.platform.join(', ');
          break;
        case 'creator':
          aValue = a.creator.name;
          bValue = b.creator.name;
          break;
        case 'reviewer1Status':
          aValue = a.reviewer1Status ? reviewerStatusLabels[a.reviewer1Status].label : '';
          bValue = b.reviewer1Status ? reviewerStatusLabels[b.reviewer1Status].label : '';
          break;
        case 'reviewer2Status':
          aValue = a.reviewer2Status ? reviewerStatusLabels[a.reviewer2Status].label : '';
          bValue = b.reviewer2Status ? reviewerStatusLabels[b.reviewer2Status].label : '';
          break;
        case 'scheduledVersion':
          aValue = a.scheduledVersion || '';
          bValue = b.scheduledVersion || '';
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
  }, [filteredRequirements, sortConfig]);

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-medium">需求池</h1>
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

        {/* 筛选和操作栏 */}
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
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('status')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('status')} />
                        状态
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('project')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('project')} />
                        项目类型
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('platform')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('platform')} />
                        应用端
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('creator')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('creator')} />
                        创建人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('assignee')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('assignee')} />
                        负责人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('updatedAt')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('updatedAt')} />
                        更新时间
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
                        <div className="flex items-center gap-2">
                          <Button onClick={addCustomFilter} variant="outline" size="sm" className="h-7 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            添加条件
                          </Button>
                          {customFilters.length > 0 && (
                            <Button onClick={clearAllFilters} variant="ghost" size="sm" className="h-7 text-xs">
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
                        {sortConfig && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            1
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {filterableColumns.map((col) => (
                        <div key={col.value}>
                          <DropdownMenuItem onClick={() => handleSort(col.value, 'asc')}>
                            <ArrowUp className="h-3 w-3 mr-2" />
                            {col.label} ↑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort(col.value, 'desc')}>
                            <ArrowDown className="h-3 w-3 mr-2" />
                            {col.label} ↓
                          </DropdownMenuItem>
                        </div>
                      ))}
                      {sortConfig && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSort('', undefined)}>
                            <X className="h-3 w-3 mr-2" />
                            清除排序
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  共 {filteredRequirements.length} 个需求
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 需求列表 */}
        <Card>
          <CardContent className="p-0">
            {sortedRequirements.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无需求</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  还没有创建任何需求。点击"新建需求"按钮开始创建您的第一个需求。
                </p>
                <Button onClick={handleCreateRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  新���需求
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!hiddenColumns.includes('title') && <TableHead>需求标题</TableHead>}
                      {!hiddenColumns.includes('type') && <TableHead>需求类型</TableHead>}
                      {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                      {!hiddenColumns.includes('status') && <TableHead>状态</TableHead>}
                      {!hiddenColumns.includes('project') && <TableHead>项目类型</TableHead>}
                      {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
                      {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                      {!hiddenColumns.includes('assignee') && <TableHead>负责人</TableHead>}
                      {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRequirements.map((requirement) => (
                      <TableRow key={requirement.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewRequirement(requirement)}>
                        {!hiddenColumns.includes('title') && (
                          <TableCell>
                            <div className="font-medium text-primary hover:underline">
                              {requirement.title}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {requirement.description}
                            </div>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('type') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                  {requirement.type}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {requirementTypes.map((type) => (
                                  <DropdownMenuItem 
                                    key={type} 
                                    onClick={() => handleTypeChange(requirement.id, type)}
                                  >
                                    {type}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('priority') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant={priorityConfig[requirement.priority].variant}
                                  className={`cursor-pointer text-xs ${priorityConfig[requirement.priority].className}`}
                                >
                                  {requirement.priority}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {Object.keys(priorityConfig).map((priority) => (
                                  <DropdownMenuItem 
                                    key={priority} 
                                    onClick={() => handlePriorityChange(requirement.id, priority)}
                                  >
                                    {priority}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('status') && (
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {requirement.status}
                            </Badge>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('project') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                  {requirement.project.name}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {mockProjects.map((project) => (
                                  <DropdownMenuItem 
                                    key={project.id} 
                                    onClick={() => handleProjectChange(requirement.id, project.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: project.color }}></div>
                                      {project.name}
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('platform') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1">
                              {requirement.platform.map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
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
                                <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{requirement.creator.name}</span>
                            </div>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('assignee') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                                  {requirement.assignee ? (
                                    <>
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={requirement.assignee.avatar} />
                                        <AvatarFallback>{requirement.assignee.name[0]}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">{requirement.assignee.name}</span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">未指派</span>
                                  )}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleAssigneeChange(requirement.id, null)}>
                                  未指派
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {mockUsers.map((user) => (
                                  <DropdownMenuItem 
                                    key={user.id} 
                                    onClick={() => handleAssigneeChange(requirement.id, user.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                      </Avatar>
                                      {user.name}
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('updatedAt') && (
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {requirement.updatedAt}
                            </span>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}