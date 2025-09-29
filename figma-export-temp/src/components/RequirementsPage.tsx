import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  BarChart3, 
  FolderOpen, 
  Upload, 
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Flame,
  Zap,
  Bug,
  Lightbulb,
  Settings,
  Users,
  Calendar,
  User,
  FileText,
  ArrowRight,
  ArrowLeft,
  Tag,
  Paperclip,
  Link,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Edit,
  X,
  EyeOff,
  MoreHorizontal,
  FileBarChart,
  CheckSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RequirementDetailPanel } from './RequirementDetailPanel';

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

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Requirement {
  id: string;
  title: string;
  type: '功能需求' | 'Bug' | '产品建议' | '技术需求';
  status: '待审核' | '审核中' | '审核通过' | '审核不通过' | '已关闭';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  project?: Project;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
  attachments?: Attachment[];
  platform?: 'Web端' | 'iOS端' | 'Android端' | '小程序' | '全平台';
  plannedVersion?: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: 'bg-blue-500' },
  { id: '2', name: '行情', color: 'bg-green-500' },
  { id: '3', name: '聊天室', color: 'bg-purple-500' },
  { id: '4', name: '系统', color: 'bg-orange-500' },
  { id: '5', name: '交易', color: 'bg-red-500' },
];

const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: '用户登录优化',
    type: '功能需求',
    status: '待审核',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    project: mockProjects[0],
    createdAt: '2024-12-15',
    updatedAt: '2024-12-16',
    description: '优化用户登录流程，提升用户体验\\n\\n## 需求背景\\n当前用户登录流程存在以下问题：\\n1. 登录步骤繁琐\\n2. 密码找回功能不够便捷\\n3. 多设备登录体验不一致\\n\\n## 期望目标\\n1. 简化登录流程，减少用户操作步骤\\n2. 优化密码找回功能\\n3. 统一多设备登录体验',
    tags: ['UI优化', '用户体验'],
    platform: 'Web端',
    plannedVersion: 'v1.1.0'
  },
  {
    id: '2',
    title: '支付流程Bug修复',
    type: 'Bug',
    status: '审核中',
    priority: '紧急',
    assignee: mockUsers[1],
    creator: mockUsers[6],
    project: mockProjects[1],
    createdAt: '2024-12-14',
    updatedAt: '2024-12-16',
    description: '支付过程中出现异常，需要紧急修复\\n\\n## 问题描述\\n用户在完成支付时，系统偶尔出现支付状态不同步的问题，导致用户重复扣费。\\n\\n## 复现步骤\\n1. 用户选择商品加入购物车\\n2. 进入支付页面\\n3. 选择支付方式并完成支付\\n4. 系统显示支付失败，但实际已扣费',
    tags: ['Bug', '紧急'],
    platform: '全平台',
    plannedVersion: 'v1.0.0'
  },
  {
    id: '3',
    title: '界面美化建议',
    type: '产品建议',
    status: '审核通过',
    priority: '中',
    assignee: mockUsers[2],
    creator: mockUsers[7],
    project: mockProjects[0],
    createdAt: '2024-12-13',
    updatedAt: '2024-12-15',
    description: '建议对主界面进行美化处理\\n\\n## 建议内容\\n1. 更新主色调，使用更现代的配色方案\\n2. 优化图标设计，统一视觉风格\\n3. 改进布局，提高信息密度\\n4. 增加动效，提升交互体验',
    tags: ['UI优化', '设计'],
    platform: 'iOS端',
    plannedVersion: 'v1.2.0'
  },
  {
    id: '4',
    title: '数据库性能优化',
    type: '技术需求',
    status: '待审核',
    priority: '高',
    assignee: mockUsers[3],
    creator: mockUsers[3],
    project: mockProjects[2],
    createdAt: '2024-12-12',
    updatedAt: '2024-12-14',
    description: '优化数据库查询性能，提升系统响应速度\\n\\n## 当前问题\\n1. 大表查询速度慢\\n2. 缺少合适的索引\\n3. SQL语句需要优化\\n\\n## 优化方案\\n1. 添加必要的索引\\n2. 优化慢查询SQL\\n3. 实施数据分区策略',
    tags: ['性能', '后端'],
    platform: 'Web端',
    plannedVersion: 'v2.0.0'
  },
  {
    id: '5',
    title: '移动端适配',
    type: '功能需求',
    status: '审核中',
    priority: '中',
    assignee: mockUsers[4],
    creator: mockUsers[5],
    project: mockProjects[3],
    createdAt: '2024-12-11',
    updatedAt: '2024-12-13',
    description: '完善移动端页面适配\\n\\n## 需求说明\\n随着移动端用户增长，需要优化移动端使用体验。\\n\\n## 具体要求\\n1. 响应式布局适配\\n2. 触摸交互优化\\n3. 加载性能优化',
    tags: ['移动端', '响应式'],
    platform: 'Android端',
    plannedVersion: 'v1.1.0'
  },
  {
    id: '6',
    title: '数据导出功能',
    type: '功能需求',
    status: '审核不通过',
    priority: '低',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    project: mockProjects[2],
    createdAt: '2024-12-10',
    updatedAt: '2024-12-12',
    description: '增加数据导出Excel功能',
    tags: ['功能', '导出'],
    platform: '小程序',
    plannedVersion: 'v1.0.0'
  }
];

const statusLabels = {
  '待审核': { label: '待审核', variant: 'secondary' as const, icon: Clock, color: 'text-gray-500' },
  '审核中': { label: '审核中', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-500' },
  '审核通过': { label: '审核通过', variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
  '审核不通过': { label: '审核不通过', variant: 'destructive' as const, icon: XCircle, color: 'text-red-500' },
  '已关闭': { label: '已关闭', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-400' }
};

interface RequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

export function RequirementsPage({ onNavigate }: RequirementsPageProps = {}) {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view'>('list');
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 默认显示全部类型
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterCreator, setFilterCreator] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState<string>('none');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  
  // 编辑状态
  const [editingRequirement, setEditingRequirement] = useState<Partial<Requirement>>({
    title: '',
    type: '功能需求',
    status: '待审核',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '',
    tags: [],
    attachments: [],
    platform: 'Web端',
    plannedVersion: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeIcon = (type: Requirement['type']) => {
    switch (type) {
      case '功能需求': return <FileText className="h-4 w-4" />;
      case 'Bug': return <Bug className="h-4 w-4" />;
      case '产品建议': return <Lightbulb className="h-4 w-4" />;
      case '技术需求': return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Requirement['type']) => {
    switch (type) {
      case '功能需求': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bug': return 'bg-red-100 text-red-800 border-red-200';
      case '产品建议': return 'bg-green-100 text-green-800 border-green-200';
      case '技术需求': return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getPriorityIcon = (priority: Requirement['priority']) => {
    switch (priority) {
      case '低': return <ArrowDown className="h-3 w-3" />;
      case '中': return <ArrowUpDown className="h-3 w-3" />;
      case '高': return <ArrowUp className="h-3 w-3" />;
      case '紧急': return <Flame className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: Requirement['priority']) => {
    switch (priority) {
      case '低': return 'bg-gray-100 text-gray-600 border-gray-200';
      case '中': return 'bg-blue-100 text-blue-600 border-blue-200';
      case '高': return 'bg-orange-100 text-orange-600 border-orange-200';
      case '紧急': return 'bg-red-100 text-red-600 border-red-200';
    }
  };

  const getPlatformColor = (platform: Requirement['platform']) => {
    switch (platform) {
      case 'Web端': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'iOS端': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Android端': return 'bg-green-100 text-green-700 border-green-200';
      case '小程序': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case '全平台': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // 筛选和排序逻辑
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    
    // 状态筛选逻辑：开放中包括待审核、审核中、审核通过；已关闭只有已关闭状态
    let matchesStatus = true;
    if (filterStatus === '开放中') {
      matchesStatus = ['待审核', '审核中', '审核通过'].includes(req.status);
    } else if (filterStatus === '已关闭') {
      matchesStatus = req.status === '已关闭';
    } else if (filterStatus === 'all') {
      matchesStatus = true;
    } else {
      matchesStatus = req.status === filterStatus;
    }
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || req.assignee.id === filterAssignee;
    const matchesCreator = filterCreator === 'all' || req.creator.id === filterCreator;
    const matchesProject = filterProject === 'all' || req.project?.id === filterProject;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && 
           matchesAssignee && matchesCreator && matchesProject;
  });

  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      case 'priority':
        const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'assignee':
        aValue = a.assignee.name.toLowerCase();
        bValue = b.assignee.name.toLowerCase();
        break;
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 分组逻辑
  const groupedRequirements = () => {
    if (groupBy === 'none') {
      return { '全部': sortedRequirements };
    }
    
    const groups: Record<string, Requirement[]> = {};
    sortedRequirements.forEach(req => {
      let key: string;
      switch (groupBy) {
        case 'assignee':
          key = req.assignee.name;
          break;
        case 'creator':
          key = req.creator.name;
          break;
        case 'project':
          key = req.project?.name || '未分配项目';
          break;
        default:
          key = req[groupBy as keyof Requirement] as string;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(req);
    });
    
    return groups;
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleCreateRequirement = () => {
    setEditingRequirement({
      title: '',
      type: '功能需求',
      status: '待审核',
      priority: '中',
      assignee: mockUsers[0],
      creator: mockUsers[5], // 默认当前用户为产品经理
      project: mockProjects[0],
      description: '',
      tags: [],
      attachments: [],
      platform: 'Web端',
      plannedVersion: ''
    });
    setCurrentView('edit');
  };

  const handleEditRequirement = (req: Requirement) => {
    setEditingRequirement(req);
    setSelectedRequirement(req);
    setCurrentView('edit');
  };

  const handleViewRequirement = (req: Requirement) => {
    setSelectedRequirement(req);
    setCurrentView('view');
  };

  const handleSaveRequirement = () => {
    if (editingRequirement.id) {
      // 更新现有需求
      setRequirements(requirements.map(r => r.id === editingRequirement.id ? { 
        ...editingRequirement as Requirement, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : r));
    } else {
      // 创建新需求 - 保存为草稿状态
      const newRequirement: Requirement = {
        ...editingRequirement as Requirement,
        id: Date.now().toString(),
        status: '待审核',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setRequirements([newRequirement, ...requirements]);
    }
    setCurrentView('list');
  };

  const handleSubmitRequirement = () => {
    if (editingRequirement.id) {
      // 更新现有需求为审核中状态
      setRequirements(requirements.map(r => r.id === editingRequirement.id ? { 
        ...editingRequirement as Requirement, 
        status: '审核中',
        updatedAt: new Date().toISOString().split('T')[0] 
      } : r));
    } else {
      // 创建新需求并直接提交
      const newRequirement: Requirement = {
        ...editingRequirement as Requirement,
        id: Date.now().toString(),
        status: '待审核',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setRequirements([newRequirement, ...requirements]);
    }
    setCurrentView('list');
  };

  const handleCloseRequirement = (req: Requirement) => {
    const updatedRequirement = { 
      ...req, 
      status: '已关闭' as const,
      updatedAt: new Date().toISOString().split('T')[0] 
    };
    setRequirements(requirements.map(r => r.id === req.id ? updatedRequirement : r));
    setSelectedRequirement(updatedRequirement);
  };

  const handleReopenRequirement = (req: Requirement) => {
    const updatedRequirement = { 
      ...req, 
      status: '待审核' as const, // 重新开启后设置为待审核状态
      updatedAt: new Date().toISOString().split('T')[0] 
    };
    setRequirements(requirements.map(r => r.id === req.id ? updatedRequirement : r));
    setSelectedRequirement(updatedRequirement);
  };

  const toggleColumnVisibility = (column: string) => {
    setHiddenColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const availableColumns = [
    { key: 'type', label: '需求类型' },
    { key: 'status', label: '状态' },
    { key: 'priority', label: '优先级' },
    { key: 'assignee', label: '指派人' },
    { key: 'creator', label: '创建人' },
    { key: 'project', label: '项目' },
    { key: 'platform', label: '应用端' },
    { key: 'plannedVersion', label: '预排期版本' },
    { key: 'createdAt', label: '创建时间' },
    { key: 'updatedAt', label: '更新时间' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setEditingRequirement(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const removeAttachment = (id: string) => {
    setEditingRequirement(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== id) || []
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !editingRequirement.tags?.includes(tag)) {
      setEditingRequirement(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEditingRequirement(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedRequirements.map(req => req.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleUpdateRequirement = (updatedRequirement: Requirement) => {
    setRequirements(requirements.map(r => 
      r.id === updatedRequirement.id ? updatedRequirement : r
    ));
    setSelectedRequirement(updatedRequirement);
  };

  if (currentView === 'edit') {
    return <RequirementEditor 
      requirement={editingRequirement}
      setRequirement={setEditingRequirement}
      onBack={() => setCurrentView('list')}
      onSubmit={handleSubmitRequirement}
      onFileUpload={handleFileUpload}
      removeAttachment={removeAttachment}
      addTag={addTag}
      removeTag={removeTag}
      fileInputRef={fileInputRef}
      onNavigate={onNavigate}
    />;
  }

  if (currentView === 'view' && selectedRequirement) {
    return <RequirementViewer 
      requirement={selectedRequirement}
      onBack={() => setCurrentView('list')}
      onEdit={() => handleEditRequirement(selectedRequirement)}
      onClose={handleCloseRequirement}
      onReopen={handleReopenRequirement}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">需求池</h1>
          <p className="text-muted-foreground mt-1">收集和管理所有产品需求</p>
        </div>
        <Button onClick={handleCreateRequirement}>
          <Plus className="h-4 w-4 mr-2" />
          新建需求
        </Button>
      </div>

      {/* 筛选和操作栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* 状态快捷筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">显示类型：</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={filterStatus === '开放中' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('开放中')}
                >
                  开放中
                </Button>
                <Button
                  variant={filterStatus === '已关闭' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('已关闭')}
                >
                  已关闭
                </Button>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  全部
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* 搜索 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索需求..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 筛选器 */}
                <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      设置筛选条件
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>筛选条件设置</DialogTitle>
                      <DialogDescription>
                        设置需求列表的筛选条件，只显示符合条件的需求
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">需求类型</label>
                          <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部类型</SelectItem>
                              <SelectItem value="功能需求">功能需求</SelectItem>
                              <SelectItem value="Bug">Bug</SelectItem>
                              <SelectItem value="产品建议">产品建议</SelectItem>
                              <SelectItem value="技术需求">技术需求</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">状态</label>
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部状态</SelectItem>
                              <SelectItem value="待审核">待审核</SelectItem>
                              <SelectItem value="审核中">审核中</SelectItem>
                              <SelectItem value="审核通过">审核通过</SelectItem>
                              <SelectItem value="审核不通过">审核不通过</SelectItem>
                              <SelectItem value="已关闭">已关闭</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">优先级</label>
                          <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部优先级</SelectItem>
                              <SelectItem value="低">低</SelectItem>
                              <SelectItem value="中">中</SelectItem>
                              <SelectItem value="高">高</SelectItem>
                              <SelectItem value="���急">紧急</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">指派人</label>
                          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部指派人</SelectItem>
                              {mockUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">创建人</label>
                          <Select value={filterCreator} onValueChange={setFilterCreator}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部创建人</SelectItem>
                              {mockUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">所属项目</label>
                          <Select value={filterProject} onValueChange={setFilterProject}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部项目</SelectItem>
                              {mockProjects.map(project => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setFilterType('all');
                        setFilterStatus('all');
                        setFilterPriority('all');
                        setFilterAssignee('all');
                        setFilterCreator('all');
                        setFilterProject('all');
                      }}>
                        重置
                      </Button>
                      <Button onClick={() => setShowFilterDialog(false)}>
                        确定
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* 排序 */}
                <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      设置排序条件
                      {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>排序条件设置</DialogTitle>
                      <DialogDescription>
                        设置需求列表的排序方式和排序方向
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">排序字段</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="title">需求标题</SelectItem>
                            <SelectItem value="createdAt">创建时间</SelectItem>
                            <SelectItem value="updatedAt">更新时间</SelectItem>
                            <SelectItem value="priority">优先级</SelectItem>
                            <SelectItem value="status">状态</SelectItem>
                            <SelectItem value="assignee">指派人</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">排序方向</label>
                        <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">降序 (从大到小)</SelectItem>
                            <SelectItem value="asc">升序 (从小到大)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowSortDialog(false)}>
                        取消
                      </Button>
                      <Button onClick={() => setShowSortDialog(false)}>
                        确定
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* 分组 */}
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="w-36">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不分组</SelectItem>
                    <SelectItem value="status">按状态分组</SelectItem>
                    <SelectItem value="type">按类型分组</SelectItem>
                    <SelectItem value="priority">按优先级分组</SelectItem>
                    <SelectItem value="assignee">按指派人分组</SelectItem>
                    <SelectItem value="creator">按创建人分组</SelectItem>
                    <SelectItem value="project">按项目分组</SelectItem>
                  </SelectContent>
                </Select>

                {/* 隐藏列功能 */}
                <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <EyeOff className="h-4 w-4 mr-2" />
                      隐藏列
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>设置显示列</DialogTitle>
                      <DialogDescription>
                        选择要在需求列表中显示的列，隐藏的列不会显示在表格中
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-3">
                        {availableColumns.map(column => (
                          <div key={column.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={column.key}
                              checked={!hiddenColumns.includes(column.key)}
                              onCheckedChange={() => toggleColumnVisibility(column.key)}
                            />
                            <Label htmlFor={column.key} className="flex-1">
                              {column.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setHiddenColumns([])}>
                        显示全部
                      </Button>
                      <Button onClick={() => setShowColumnDialog(false)}>
                        确定
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* 导出 */}
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </div>

              {/* 批量操作 */}
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">已选择 {selectedItems.length} 项</span>
                  <Button variant="outline" size="sm">批量编辑</Button>
                  <Button variant="outline" size="sm">批量归档</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 需求列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {Object.entries(groupedRequirements()).map(([groupName, groupRequirements]) => (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <div className="bg-muted/50 px-4 py-2 border-b border-border">
                    <h3 className="font-medium">{groupName} ({groupRequirements.length})</h3>
                  </div>
                )}
                <Table>
                  {(groupBy === 'none' || groupName === Object.keys(groupedRequirements())[0]) && (
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedItems.length === sortedRequirements.length && sortedRequirements.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="min-w-[300px]">需求标题</TableHead>
                        {!hiddenColumns.includes('type') && <TableHead className="w-32">需求类型</TableHead>}
                        {!hiddenColumns.includes('status') && <TableHead className="w-32">状态</TableHead>}
                        {!hiddenColumns.includes('priority') && <TableHead className="w-32">优先级</TableHead>}
                        {!hiddenColumns.includes('assignee') && <TableHead className="w-36">指派人</TableHead>}
                        {!hiddenColumns.includes('creator') && <TableHead className="w-36">创建人</TableHead>}
                        {!hiddenColumns.includes('project') && <TableHead className="w-32">项目</TableHead>}
                        {!hiddenColumns.includes('platform') && <TableHead className="w-28">应用端</TableHead>}
                        {!hiddenColumns.includes('plannedVersion') && <TableHead className="w-32">预排期版本</TableHead>}
                        {!hiddenColumns.includes('createdAt') && <TableHead className="w-28">创建时间</TableHead>}
                        {!hiddenColumns.includes('updatedAt') && <TableHead className="w-28">更新时间</TableHead>}
                      </TableRow>
                    </TableHeader>
                  )}
                  <TableBody>
                    {groupRequirements.map((requirement) => (
                      <TooltipProvider key={requirement.id}>
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(requirement.id)}
                              onCheckedChange={(checked) => handleSelectItem(requirement.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewRequirement(requirement)}>
                                {requirement.title}
                              </p>
                              {requirement.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
                                  {requirement.description.split('\\n')[0]}
                                </p>
                              )}
                              {requirement.tags && requirement.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {requirement.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {requirement.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{requirement.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {!hiddenColumns.includes('type') && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${getTypeColor(requirement.type)}`}>
                                  {getTypeIcon(requirement.type)}
                                  <span className="text-sm">{requirement.type}</span>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('status') && (
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {React.createElement(statusLabels[requirement.status].icon, { 
                                  className: `h-3 w-3 ${statusLabels[requirement.status].color}` 
                                })}
                                <Badge variant={statusLabels[requirement.status].variant}>
                                  {statusLabels[requirement.status].label}
                                </Badge>
                              </div>
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('priority') && (
                            <TableCell>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${getPriorityColor(requirement.priority)}`}>
                                {getPriorityIcon(requirement.priority)}
                                <span className="text-sm">{requirement.priority}</span>
                              </div>
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('assignee') && (
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2 cursor-pointer">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={requirement.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {requirement.assignee.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm truncate max-w-20">{requirement.assignee.name}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <p className="font-medium">{requirement.assignee.name}</p>
                                    <p className="text-xs text-muted-foreground">{requirement.assignee.role}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('creator') && (
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2 cursor-pointer">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={requirement.creator.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {requirement.creator.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm truncate max-w-20">{requirement.creator.name}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <p className="font-medium">{requirement.creator.name}</p>
                                    <p className="text-xs text-muted-foreground">{requirement.creator.role}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('project') && (
                            <TableCell>
                              {requirement.project && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${requirement.project.color}`}></div>
                                  <span className="text-sm truncate max-w-20">{requirement.project.name}</span>
                                </div>
                              )}
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('platform') && (
                            <TableCell>
                              {requirement.platform && (
                                <Badge variant="outline" className={getPlatformColor(requirement.platform)}>
                                  {requirement.platform}
                                </Badge>
                              )}
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('plannedVersion') && (
                            <TableCell>
                              {requirement.plannedVersion && (
                                <Badge variant="outline" className="text-xs">
                                  {requirement.plannedVersion}
                                </Badge>
                              )}
                            </TableCell>
                          )}
                          {!hiddenColumns.includes('createdAt') && (
                            <TableCell className="text-sm">{requirement.createdAt}</TableCell>
                          )}
                          {!hiddenColumns.includes('updatedAt') && (
                            <TableCell className="text-sm">{requirement.updatedAt}</TableCell>
                          )}
                        </TableRow>
                      </TooltipProvider>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
          
          {sortedRequirements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无需求数据</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.values({filterType, filterStatus, filterPriority, filterAssignee, filterCreator, filterProject}).some(f => f !== 'all') 
                  ? '请尝试调整筛选条件' 
                  : '点击右上角"新建需求"按钮创建第一个需求'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>共 {sortedRequirements.length} 个需求</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              待审核: {requirements.filter(r => r.status === '待审核').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              审核中: {requirements.filter(r => r.status === '审核中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              审核通过: {requirements.filter(r => r.status === '审核通过').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              审核不通过: {requirements.filter(r => r.status === '审核不通过').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              已关闭: {requirements.filter(r => r.status === '已关闭').length}
            </span>
          </div>
        </div>
      </div>

      {/* 详情面板 */}
      {showDetailPanel && selectedRequirement && (
        <RequirementDetailPanel
          requirement={selectedRequirement}
          onClose={() => setShowDetailPanel(false)}
          onUpdate={handleUpdateRequirement}
        />
      )}
    </div>
  );
}

// 需求编辑器组件
function RequirementEditor({ 
  requirement, 
  setRequirement, 
  onBack, 
  onSubmit, 
  onFileUpload, 
  removeAttachment, 
  addTag, 
  removeTag,
  fileInputRef,
  onNavigate
}: {
  requirement: Partial<Requirement>;
  setRequirement: (req: Partial<Requirement>) => void;
  onBack: () => void;
  onSubmit: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (id: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onNavigate?: (page: string) => void;
}) {
  const [newTag, setNewTag] = useState('');
  const predefinedTags = ['UI优化', '性能', '安全', '用户体验', '移动端', '数据分析', 'Bug', '紧急', '功能', '导出'];
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {requirement.id ? '编辑需求' : '新建需求'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {requirement.id ? '修改需求信息和内容' : '创建新的产品需求'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          <Button onClick={onSubmit}>
            提交
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要内容区域 */}
        <div className="col-span-8 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">需求标题 *</Label>
                <Input
                  id="title"
                  value={requirement.title || ''}
                  onChange={(e) => setRequirement({...requirement, title: e.target.value})}
                  placeholder="请输入需求标题"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">需求类型 *</Label>
                  <Select 
                    value={requirement.type} 
                    onValueChange={(value: Requirement['type']) => setRequirement({...requirement, type: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="功能需求">功能需求</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="��品建议">产品建议</SelectItem>
                      <SelectItem value="技术需求">技术需求</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">优先级 *</Label>
                  <Select 
                    value={requirement.priority} 
                    onValueChange={(value: Requirement['priority']) => setRequirement({...requirement, priority: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="低">低</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="紧急">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignee">指派人 *</Label>
                  <Select 
                    value={requirement.assignee?.id} 
                    onValueChange={(value) => {
                      const user = mockUsers.find(u => u.id === value);
                      if (user) setRequirement({...requirement, assignee: user});
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project">所属项目</Label>
                  <Select 
                    value={requirement.project?.id} 
                    onValueChange={(value) => {
                      const project = mockProjects.find(p => p.id === value);
                      if (project) setRequirement({...requirement, project});
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">应用端</Label>
                  <Select 
                    value={requirement.platform} 
                    onValueChange={(value: Requirement['platform']) => setRequirement({...requirement, platform: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web端">Web端</SelectItem>
                      <SelectItem value="iOS端">iOS端</SelectItem>
                      <SelectItem value="Android端">Android端</SelectItem>
                      <SelectItem value="小程序">小程序</SelectItem>
                      <SelectItem value="全平台">全平台</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plannedVersion">预排期版本</Label>
                  <Select 
                    value={requirement.plannedVersion} 
                    onValueChange={(value) => setRequirement({...requirement, plannedVersion: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择版本" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1.0.0">v1.0.0 (开发中)</SelectItem>
                      <SelectItem value="v1.1.0">v1.1.0 (规划中)</SelectItem>
                      <SelectItem value="v1.2.0">v1.2.0 (规划中)</SelectItem>
                      <SelectItem value="v2.0.0">v2.0.0 (规划中)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 需求描述 */}
          <Card>
            <CardHeader>
              <CardTitle>需求描述</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={requirement.description || ''}
                onChange={(e) => setRequirement({...requirement, description: e.target.value})}
                placeholder="请详细描述需求内容、背景、目标等信息..."
                rows={10}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-4">
          {/* 标签管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 当前标签 */}
              {requirement.tags && requirement.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 添加标签 */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="新增标签"
                  className="h-8 text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                  <Tag className="h-3 w-3" />
                </Button>
              </div>

              {/* 预设标签 */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">常用标签：</p>
                <div className="flex flex-wrap gap-1">
                  {predefinedTags.map(tag => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addTag(tag)}
                      disabled={requirement.tags?.includes(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 相关文档和问题 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">相关文档和问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onNavigate?.('prd')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  编写PRD文档
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onNavigate?.('bugs')}
                >
                  <Bug className="h-4 w-4 mr-2" />
                  提交测试问题
                </Button>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">快速跳转：</p>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 text-xs"
                    onClick={() => onNavigate?.('version-requirements')}
                  >
                    <FileBarChart className="h-3 w-3 mr-2" />
                    需求管理
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 text-xs"
                    onClick={() => onNavigate?.('tasks')}
                  >
                    <CheckSquare className="h-3 w-3 mr-2" />
                    任务管理
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 附件管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">附件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                添加附件
              </Button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={onFileUpload}
                className="hidden"
                accept="*/*"
              />

              {requirement.attachments && requirement.attachments.length > 0 && (
                <div className="space-y-2">
                  {requirement.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(1)}KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 需求查看器组件
function RequirementViewer({ requirement, onBack, onEdit, onClose, onReopen }: {
  requirement: Requirement;
  onBack: () => void;
  onEdit: () => void;
  onClose: (req: Requirement) => void;
  onReopen?: (req: Requirement) => void;
}) {
  const handleClose = () => {
    onClose(requirement);
  };

  const handleReopen = () => {
    if (onReopen) {
      onReopen(requirement);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{requirement.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>类型：{requirement.type}</span>
              <span>优先级：{requirement.priority}</span>
              <span>创建人：{requirement.creator.name}</span>
              <span>更新时间：{requirement.updatedAt}</span>
              {requirement.platform && <span>应用端：{requirement.platform}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {requirement.status === '已关闭' ? (
            <Button variant="outline" onClick={handleReopen}>
              <CheckCircle className="h-4 w-4 mr-2" />
              重新开启需求
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              关闭需求
            </Button>
          )}
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要内容区域 */}
        <div className="col-span-8">
          <Card>
            <CardContent className="p-6">
              {/* 需求内容 */}
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {requirement.description || '暂无内容'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-4">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">需求信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">状态</span>
                <div className="flex items-center gap-1">
                  {React.createElement(statusLabels[requirement.status].icon, { 
                    className: `h-3 w-3 ${statusLabels[requirement.status].color}` 
                  })}
                  <Badge variant={statusLabels[requirement.status].variant}>
                    {statusLabels[requirement.status].label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">类型</span>
                <Badge variant="outline">{requirement.type}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">优先级</span>
                <Badge variant="outline">{requirement.priority}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">指派人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={requirement.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {requirement.assignee.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{requirement.assignee.name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={requirement.creator.avatar} />
                    <AvatarFallback className="text-xs">
                      {requirement.creator.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{requirement.creator.name}</span>
                </div>
              </div>
              
              {requirement.project && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">所属项目</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${requirement.project.color}`}></div>
                    <span className="text-sm">{requirement.project.name}</span>
                  </div>
                </div>
              )}
              
              {requirement.platform && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">应用端</span>
                  <Badge variant="outline">{requirement.platform}</Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建时间</span>
                <span className="text-sm">{requirement.createdAt}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">更新时间</span>
                <span className="text-sm">{requirement.updatedAt}</span>
              </div>
            </CardContent>
          </Card>

          {/* 标签 */}
          {requirement.tags && requirement.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 附件 */}
          {requirement.attachments && requirement.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">附件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {requirement.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={attachment.url} download={attachment.name}>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}