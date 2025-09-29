import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitBranch,
  Users,
  Calendar,
  User,
  FileText,
  ArrowLeft,
  Save,
  Send,
  Tag,
  Paperclip,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Target,
  FileBarChart,
  Palette,
  Code,
  TestTube,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  PlayCircle,
  PauseCircle,
  Settings,
  EyeOff,
  Upload
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

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

interface SubTask {
  id: string;
  name: string;
  type: 'PRD' | '原型图' | '设计图' | '开发' | '测试' | '验收';
  status: '未开始' | '进行中' | '已完成' | '已暂停' | '有问题';
  assignee: User;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface VersionRequirement {
  id: string;
  title: string;
  version: string;
  scheduledVersion?: string; // 新增：预排期版本
  status: '规划中' | '开发中' | '测试中' | '已完成' | '已发布' | '已暂停';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  project: Project;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subTasks: SubTask[];
  isOpen: boolean; // 新增：是否开放中
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' }
];

const mockProjects: Project[] = [
  { id: '1', name: '用户中心', color: 'bg-blue-500' },
  { id: '2', name: '支付系统', color: 'bg-green-500' },
  { id: '3', name: '数据分析', color: 'bg-purple-500' },
  { id: '4', name: '移动端应用', color: 'bg-orange-500' }
];

const statusConfig = {
  '规划中': { label: '规划中', variant: 'secondary' as const, icon: Target, color: 'text-gray-500' },
  '开发中': { label: '开发中', variant: 'default' as const, icon: Code, color: 'text-blue-500' },
  '测试中': { label: '测试中', variant: 'outline' as const, icon: TestTube, color: 'text-orange-500' },
  '已完成': { label: '已完成', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-500' },
  '已发布': { label: '已发布', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-600' },
  '已暂停': { label: '已暂停', variant: 'destructive' as const, icon: PauseCircle, color: 'text-red-500' }
};

const subTaskStatusConfig = {
  '未开始': { label: '未开始', variant: 'secondary' as const, color: 'text-gray-500' },
  '进行中': { label: '进行中', variant: 'default' as const, color: 'text-blue-500' },
  '已完成': { label: '已完成', variant: 'outline' as const, color: 'text-green-500' },
  '已暂停': { label: '已暂停', variant: 'destructive' as const, color: 'text-red-500' },
  '有问题': { label: '有问题', variant: 'destructive' as const, color: 'text-red-600' }
};

const subTaskTypeConfig = {
  'PRD': { label: 'PRD', icon: FileBarChart, color: 'text-blue-500' },
  '原型图': { label: '原型图', icon: Palette, color: 'text-orange-500' },
  '设计图': { label: '设计图', icon: Palette, color: 'text-purple-500' },
  '开发': { label: '开发', icon: Code, color: 'text-green-500' },
  '测试': { label: '测试', icon: TestTube, color: 'text-yellow-500' },
  '验收': { label: '验收', icon: Eye, color: 'text-indigo-500' }
};

const priorityConfig = {
  '低': { label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

const mockVersionRequirements: VersionRequirement[] = [
  {
    id: '1',
    title: '用户中心2.0版本',
    version: 'v2.0.0',
    scheduledVersion: 'v2.1.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    project: mockProjects[0],
    description: '用户中心2.0版本的核心功能升级，包括用户资料完善、安全设置增强、第三方账号绑定等功能',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-16',
    tags: ['用户体验', '安全', '核心功能'],
    isOpen: true,
    subTasks: [
      {
        id: 's1-1',
        name: '用户中心PRD文档',
        type: 'PRD',
        status: '已完成',
        assignee: mockUsers[5],
        estimatedHours: 16,
        actualHours: 18,
        progress: 100,
        startDate: '2024-01-15',
        endDate: '2024-01-18',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-18'
      },
      {
        id: 's1-2',
        name: '用户界面原型设计',
        type: '原型图',
        status: '已完成',
        assignee: mockUsers[7],
        estimatedHours: 24,
        actualHours: 26,
        progress: 100,
        startDate: '2024-01-19',
        endDate: '2024-01-24',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-24'
      },
      {
        id: 's1-3',
        name: 'UI设计稿制作',
        type: '设计图',
        status: '进行中',
        assignee: mockUsers[2],
        estimatedHours: 32,
        actualHours: 28,
        progress: 85,
        startDate: '2024-01-25',
        endDate: '2024-02-05',
        createdAt: '2024-01-25',
        updatedAt: '2024-02-03'
      },
      {
        id: 's1-4',
        name: '前端开发',
        type: '开发',
        status: '进行中',
        assignee: mockUsers[0],
        estimatedHours: 80,
        actualHours: 45,
        progress: 60,
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
      },
      {
        id: 's1-5',
        name: '后端开发',
        type: '开发',
        status: '进行中',
        assignee: mockUsers[1],
        estimatedHours: 64,
        actualHours: 38,
        progress: 65,
        startDate: '2024-02-01',
        endDate: '2024-02-25',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
      },
      {
        id: 's1-6',
        name: '功能测试',
        type: '测试',
        status: '未开始',
        assignee: mockUsers[6],
        estimatedHours: 40,
        actualHours: 0,
        progress: 0,
        startDate: '2024-02-26',
        endDate: '2024-03-10',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 's1-7',
        name: '产品验收',
        type: '验收',
        status: '未开始',
        assignee: mockUsers[5],
        estimatedHours: 16,
        actualHours: 0,
        progress: 0,
        startDate: '2024-03-11',
        endDate: '2024-03-15',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      }
    ]
  },
  {
    id: '2',
    title: '支付系统优化',
    version: 'v1.5.0',
    scheduledVersion: 'v1.6.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    project: mockProjects[1],
    description: '支付流程优化，支持更多支付方式，提升支付成功率',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    tags: ['支付', '优化'],
    isOpen: false,
    subTasks: [
      {
        id: 's2-1',
        name: '支付优化需求文档',
        type: 'PRD',
        status: '进行中',
        assignee: mockUsers[5],
        estimatedHours: 12,
        actualHours: 8,
        progress: 70,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-03'
      }
    ]
  }
];

export function VersionRequirementsPage() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'edit' | 'view'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusFilter, setStatusFilter] = useState('开放中'); // 新增状态筛选类型
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('version');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<VersionRequirement | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Partial<VersionRequirement>>({
    title: '',
    version: '',
    scheduledVersion: '',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    project: mockProjects[0],
    description: '',
    startDate: '',
    endDate: '',
    tags: [],
    subTasks: [],
    isOpen: true
  });
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 筛选和排序逻辑
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 开放状态筛选逻辑
    let matchesStatusFilter = true;
    if (statusFilter === '开放中') {
      matchesStatusFilter = req.isOpen;
    } else if (statusFilter === '已关闭') {
      matchesStatusFilter = !req.isOpen;
    } // 全部则不过滤
    
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesVersion = filterVersion === 'all' || req.version === filterVersion;
    const matchesProject = filterProject === 'all' || req.project.id === filterProject;
    
    return matchesSearch && matchesStatusFilter && matchesStatus && matchesPriority && matchesVersion && matchesProject;
  });

  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'version':
        aValue = a.version;
        bValue = b.version;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'endDate':
        aValue = new Date(a.endDate);
        bValue = new Date(b.endDate);
        break;
      default:
        aValue = a.version;
        bValue = b.version;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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
      version: '',
      scheduledVersion: '',
      status: '规划中',
      priority: '中',
      assignee: mockUsers[0],
      creator: mockUsers[5],
      project: mockProjects[0],
      description: '',
      startDate: '',
      endDate: '',
      tags: [],
      subTasks: [],
      isOpen: true
    });
    setCurrentView('edit');
  };

  const handleViewRequirement = (requirement: VersionRequirement) => {
    setSelectedRequirement(requirement);
    setCurrentView('view');
  };

  const handleEditRequirement = (requirement: VersionRequirement) => {
    setEditingRequirement(requirement);
    setCurrentView('edit');
  };

  const handleSaveRequirement = () => {
    if (editingRequirement.id) {
      // 更新现有需求
      setRequirements(requirements.map(r => r.id === editingRequirement.id ? { 
        ...editingRequirement as VersionRequirement, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : r));
    } else {
      // 创建新需求
      const newRequirement: VersionRequirement = {
        ...editingRequirement as VersionRequirement,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        subTasks: []
      };
      setRequirements([newRequirement, ...requirements]);
    }
    setCurrentView('list');
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const getOverallProgress = (subTasks: SubTask[]) => {
    if (subTasks.length === 0) return 0;
    const totalProgress = subTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / subTasks.length);
  };

  const addSubTask = (requirementId: string, type: SubTask['type']) => {
    const newSubTask: SubTask = {
      id: `st-${Date.now()}`,
      name: `新${subTaskTypeConfig[type].label}任务`,
      type,
      status: '未开始',
      assignee: mockUsers[0],
      estimatedHours: 8,
      actualHours: 0,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, subTasks: [...req.subTasks, newSubTask] }
          : req
      )
    );
  };

  const deleteSubTask = (requirementId: string, subTaskId: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, subTasks: req.subTasks.filter(task => task.id !== subTaskId) }
          : req
      )
    );
  };

  const toggleColumnVisibility = (column: string) => {
    setHiddenColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const availableColumns = [
    { key: 'version', label: '版本号' },
    { key: 'scheduledVersion', label: '预排期版本' },
    { key: 'project', label: '所属项目' },
    { key: 'status', label: '状态' },
    { key: 'priority', label: '优先级' },
    { key: 'assignee', label: '负责人' },
    { key: 'progress', label: '进度' },
    { key: 'endDate', label: '截止时间' }
  ];

  if (currentView === 'edit') {
    return <RequirementEditor 
      requirement={editingRequirement}
      setRequirement={setEditingRequirement}
      onBack={() => setCurrentView('list')}
      onSave={handleSaveRequirement}
      fileInputRef={fileInputRef}
    />;
  }

  if (currentView === 'view' && selectedRequirement) {
    return <RequirementDetailView
      requirement={selectedRequirement}
      onBack={() => setCurrentView('list')}
      onEdit={() => handleEditRequirement(selectedRequirement)}
      requirements={requirements}
      setRequirements={setRequirements}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">版本需求管理</h1>
          <p className="text-muted-foreground mt-1">按版本管理需求，跟踪各阶段子任务进度</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 开放状态筛选 */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={statusFilter === '开放中' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('开放中')}
              className="h-8"
            >
              开放中
            </Button>
            <Button
              variant={statusFilter === '已关闭' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('已关闭')}
              className="h-8"
            >
              已关闭
            </Button>
            <Button
              variant={statusFilter === '全部' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('全部')}
              className="h-8"
            >
              全部
            </Button>
          </div>
          <Button onClick={handleCreateRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            新建版本需求
          </Button>
        </div>
      </div>

      {/* 筛选和搜索栏 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 状态快捷筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">显示类型：</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={statusFilter === '开放中' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('开放中')}
                >
                  开放中
                </Button>
                <Button
                  variant={statusFilter === '已关闭' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('已关闭')}
                >
                  已关闭
                </Button>
                <Button
                  variant={statusFilter === '全部' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('全部')}
                >
                  全部
                </Button>
              </div>
            </div>

            {/* 搜索 */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索版本、标题、描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>

            {/* 筛选器 */}
            <div className="flex items-center gap-4">
              <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    设置��选条件
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>筛选条件设置</DialogTitle>
                    <DialogDescription>
                      设置版本需求列表的筛选条件，只显示符合条件的需求
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">状态</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有状态</SelectItem>
                            <SelectItem value="规划中">规划中</SelectItem>
                            <SelectItem value="开发中">开发中</SelectItem>
                            <SelectItem value="测试中">测试中</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                            <SelectItem value="已发布">已发布</SelectItem>
                            <SelectItem value="已暂停">已暂停</SelectItem>
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
                            <SelectItem value="all">所有优先级</SelectItem>
                            <SelectItem value="紧急">紧急</SelectItem>
                            <SelectItem value="高">高</SelectItem>
                            <SelectItem value="中">中</SelectItem>
                            <SelectItem value="低">低</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">项目</label>
                        <Select value={filterProject} onValueChange={setFilterProject}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有项目</SelectItem>
                            {mockProjects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                                  {project.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setFilterStatus('all');
                      setFilterPriority('all');
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
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>排序条件设置</DialogTitle>
                    <DialogDescription>
                      设置版本需求列表的排序方式和排序方向
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
                          <SelectItem value="version">版本号</SelectItem>
                          <SelectItem value="title">标题</SelectItem>
                          <SelectItem value="endDate">截止时间</SelectItem>
                          <SelectItem value="createdAt">创建时间</SelectItem>
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
                      选择要在版本需求列表中显示的列，隐藏的列不会显示在表格中
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

              <Separator orientation="vertical" className="h-6" />

              {/* 导出 */}
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 版本需求列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="min-w-[300px]">版本需求</TableHead>
                  <TableHead className="w-32">版本号</TableHead>
                  {!hiddenColumns.includes('scheduledVersion') && (
                    <TableHead className="w-32">预排期版本</TableHead>
                  )}
                  {!hiddenColumns.includes('project') && (
                    <TableHead className="w-32">所属项目</TableHead>
                  )}
                  {!hiddenColumns.includes('status') && (
                    <TableHead className="w-32">状态</TableHead>
                  )}
                  {!hiddenColumns.includes('priority') && (
                    <TableHead className="w-32">优先级</TableHead>
                  )}
                  {!hiddenColumns.includes('assignee') && (
                    <TableHead className="w-32">负责人</TableHead>
                  )}
                  {!hiddenColumns.includes('progress') && (
                    <TableHead className="w-32">进度</TableHead>
                  )}
                  {!hiddenColumns.includes('endDate') && (
                    <TableHead className="w-32">截止时间</TableHead>
                  )}
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((requirement) => (
                  <React.Fragment key={requirement.id}>
                    <TableRow className="hover:bg-muted/30">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(requirement.id)}
                        >
                          {expandedRows.includes(requirement.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-purple-500" />
                              <p className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewRequirement(requirement)}>
                                {requirement.title}
                              </p>
                            </div>
                            {requirement.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
                                {requirement.description}
                              </p>
                            )}
                            {requirement.tags && requirement.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {requirement.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {requirement.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{requirement.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{requirement.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${requirement.project.color}`}></div>
                          <span className="text-sm">{requirement.project.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {React.createElement(statusConfig[requirement.status].icon, { 
                            className: `h-3 w-3 ${statusConfig[requirement.status].color}` 
                          })}
                          <Badge variant={statusConfig[requirement.status].variant}>
                            {statusConfig[requirement.status].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${priorityConfig[requirement.priority].bg} ${priorityConfig[requirement.priority].border}`}>
                          <ArrowUp className={`h-3 w-3 ${priorityConfig[requirement.priority].color}`} />
                          <span className="text-sm">{requirement.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
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
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>总进度</span>
                            <span>{getOverallProgress(requirement.subTasks)}%</span>
                          </div>
                          <Progress value={getOverallProgress(requirement.subTasks)} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{requirement.endDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleViewRequirement(requirement)}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditRequirement(requirement)}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    
                    {/* 子任务展开行 */}
                    {expandedRows.includes(requirement.id) && (
                      <TableRow>
                        <TableCell colSpan={10} className="p-0">
                          <div className="bg-muted/20 p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">子任务列表</h4>
                              <div className="flex gap-2">
                                {(['PRD', '原型图', '设计图', '开发', '测试', '验收'] as const).map(type => (
                                  <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSubTask(requirement.id, type)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {subTaskTypeConfig[type].label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {requirement.subTasks.map((subTask) => (
                                <div key={subTask.id} className="flex items-center gap-4 p-3 bg-background rounded border">
                                  <div className="flex items-center gap-2 min-w-[120px]">
                                    {React.createElement(subTaskTypeConfig[subTask.type].icon, {
                                      className: `h-4 w-4 ${subTaskTypeConfig[subTask.type].color}`
                                    })}
                                    <Badge variant="outline" className="text-xs">
                                      {subTaskTypeConfig[subTask.type].label}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{subTask.name}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={subTask.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {subTask.assignee.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{subTask.assignee.name}</span>
                                  </div>
                                  
                                  <Badge 
                                    variant={subTaskStatusConfig[subTask.status].variant}
                                    className="min-w-[60px] justify-center"
                                  >
                                    {subTaskStatusConfig[subTask.status].label}
                                  </Badge>
                                  
                                  <div className="min-w-[100px]">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>进度</span>
                                      <span>{subTask.progress}%</span>
                                    </div>
                                    <Progress value={subTask.progress} className="h-1" />
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground min-w-[80px]">
                                    <div>预估: {subTask.estimatedHours}h</div>
                                    <div>实际: {subTask.actualHours}h</div>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSubTask(requirement.id, subTask.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              
                              {requirement.subTasks.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  <p>暂无子任务</p>
                                  <p className="text-xs mt-1">点击上方按钮添加子任务</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sortedRequirements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无版本需求数据</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all'
                  ? '请尝试调整筛选条件' 
                  : '点击右上角"新建版本需求"按钮创建第一个版本需求'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>共 {sortedRequirements.length} 个版本需求</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              规划中: {requirements.filter(r => r.status === '规划中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              开发中: {requirements.filter(r => r.status === '开发中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              测试中: {requirements.filter(r => r.status === '测试中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              已完成: {requirements.filter(r => r.status === '已完成').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 版本需求编辑器组件
function RequirementEditor({ 
  requirement, 
  setRequirement, 
  onBack, 
  onSave,
  fileInputRef 
}: {
  requirement: Partial<VersionRequirement>;
  setRequirement: (requirement: Partial<VersionRequirement>) => void;
  onBack: () => void;
  onSave: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [newTag, setNewTag] = useState('');
  
  const addTag = (tag: string) => {
    if (requirement.tags && !requirement.tags.includes(tag)) {
      setRequirement({ ...requirement, tags: [...requirement.tags, tag] });
    } else if (!requirement.tags) {
      setRequirement({ ...requirement, tags: [tag] });
    }
  };

  const removeTag = (tag: string) => {
    if (requirement.tags) {
      setRequirement({ ...requirement, tags: requirement.tags.filter(t => t !== tag) });
    }
  };
  
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
              {requirement.id ? '编辑版本需求' : '新建版本需求'}
            </h1>
            <p className="text-muted-foreground">
              {requirement.id ? `编辑 ${requirement.title}` : '创建新的版本需求'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要编辑区域 */}
        <div className="col-span-8 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">需求标题 *</Label>
                  <Input
                    id="title"
                    value={requirement.title || ''}
                    onChange={(e) => setRequirement({ ...requirement, title: e.target.value })}
                    placeholder="输入版本需求标题"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="version">版本号 *</Label>
                  <Input
                    id="version"
                    value={requirement.version || ''}
                    onChange={(e) => setRequirement({ ...requirement, version: e.target.value })}
                    placeholder="如：v2.0.0"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">需求描述</Label>
                <Textarea
                  id="description"
                  value={requirement.description || ''}
                  onChange={(e) => setRequirement({ ...requirement, description: e.target.value })}
                  placeholder="详细描述版本需求的目标和范围"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>所属项目 *</Label>
                  <Select 
                    value={requirement.project?.id || ''} 
                    onValueChange={(value) => {
                      const project = mockProjects.find(p => p.id === value);
                      setRequirement({ ...requirement, project });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择项���" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>负责人 *</Label>
                  <Select 
                    value={requirement.assignee?.id || ''} 
                    onValueChange={(value) => {
                      const assignee = mockUsers.find(u => u.id === value);
                      setRequirement({ ...requirement, assignee });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择负责人" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>创建人</Label>
                  <Select 
                    value={requirement.creator?.id || ''} 
                    onValueChange={(value) => {
                      const creator = mockUsers.find(u => u.id === value);
                      setRequirement({ ...requirement, creator });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择创建人" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>状态</Label>
                  <Select 
                    value={requirement.status || '规划中'} 
                    onValueChange={(value: any) => setRequirement({ ...requirement, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="规划中">规划中</SelectItem>
                      <SelectItem value="开发中">开发中</SelectItem>
                      <SelectItem value="测试中">测试中</SelectItem>
                      <SelectItem value="已完成">已完成</SelectItem>
                      <SelectItem value="已发布">已发布</SelectItem>
                      <SelectItem value="已暂停">已暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>优先级</Label>
                  <Select 
                    value={requirement.priority || '中'} 
                    onValueChange={(value: any) => setRequirement({ ...requirement, priority: value })}
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
                  <Label htmlFor="startDate">开始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={requirement.startDate || ''}
                    onChange={(e) => setRequirement({ ...requirement, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">截止日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={requirement.endDate || ''}
                    onChange={(e) => setRequirement({ ...requirement, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-6">
          {/* 标签管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {requirement.tags && requirement.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                设置为模板
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                设置里程碑
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 版本需求详情视图组件
function RequirementDetailView({
  requirement,
  onBack,
  onEdit,
  requirements,
  setRequirements
}: {
  requirement: VersionRequirement;
  onBack: () => void;
  onEdit: () => void;
  requirements: VersionRequirement[];
  setRequirements: (requirements: VersionRequirement[]) => void;
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const getOverallProgress = (subTasks: SubTask[]) => {
    if (subTasks.length === 0) return 0;
    const totalProgress = subTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / subTasks.length);
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
            <div className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-purple-500" />
              <h1 className="text-2xl font-semibold">{requirement.title}</h1>
              <Badge variant="outline">{requirement.version}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              版本需求详情和子任务管理
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要内容区域 */}
        <div className="col-span-8">
          {/* 标签页 */}
          <div className="flex items-center gap-1 border-b mb-6">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              需求概览
            </Button>
            <Button
              variant={activeTab === 'subtasks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('subtasks')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              子任务管理
            </Button>
          </div>

          {/* 标签页内容 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 需求描述 */}
              <Card>
                <CardHeader>
                  <CardTitle>需求描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{requirement.description || '暂无详细描述'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 进度概览 */}
              <Card>
                <CardHeader>
                  <CardTitle>进度概览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>总体进度</span>
                      <span className="font-medium">{getOverallProgress(requirement.subTasks)}%</span>
                    </div>
                    <Progress value={getOverallProgress(requirement.subTasks)} className="h-3" />
                    
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{requirement.subTasks.length}</div>
                        <div className="text-sm text-muted-foreground">总任务数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {requirement.subTasks.filter(t => t.status === '已完成').length}
                        </div>
                        <div className="text-sm text-muted-foreground">已完成</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {requirement.subTasks.filter(t => t.status === '进行中').length}
                        </div>
                        <div className="text-sm text-muted-foreground">进行中</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'subtasks' && (
            <Card>
              <CardHeader>
                <CardTitle>子任务管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirement.subTasks.map((subTask) => (
                    <div key={subTask.id} className="flex items-center gap-4 p-4 border rounded">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        {React.createElement(subTaskTypeConfig[subTask.type].icon, {
                          className: `h-4 w-4 ${subTaskTypeConfig[subTask.type].color}`
                        })}
                        <Badge variant="outline">
                          {subTaskTypeConfig[subTask.type].label}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">{subTask.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {subTask.startDate} ~ {subTask.endDate}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={subTask.assignee.avatar} />
                          <AvatarFallback>
                            {subTask.assignee.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{subTask.assignee.name}</p>
                          <p className="text-xs text-muted-foreground">{subTask.assignee.role}</p>
                        </div>
                      </div>
                      
                      <Badge variant={subTaskStatusConfig[subTask.status].variant}>
                        {subTaskStatusConfig[subTask.status].label}
                      </Badge>
                      
                      <div className="min-w-[120px]">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>进度</span>
                          <span>{subTask.progress}%</span>
                        </div>
                        <Progress value={subTask.progress} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-muted-foreground min-w-[100px]">
                        <div>预估: {subTask.estimatedHours}h</div>
                        <div>实际: {subTask.actualHours}h</div>
                      </div>
                    </div>
                  ))}
                  
                  {requirement.subTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>暂无子任务</p>
                      <p className="text-xs mt-1">需要在列表页面展开行添加子任务</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">状态</span>
                <Badge variant={statusConfig[requirement.status].variant}>
                  {statusConfig[requirement.status].label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">优先级</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${priorityConfig[requirement.priority].bg} ${priorityConfig[requirement.priority].border}`}>
                  <ArrowUp className={`h-3 w-3 ${priorityConfig[requirement.priority].color}`} />
                  <span className="text-sm">{requirement.priority}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">负责人</span>
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

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">所属项目</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${requirement.project.color}`}></div>
                  <span className="text-sm">{requirement.project.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">开始日期</span>
                <span className="text-sm">{requirement.startDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">截止日期</span>
                <span className="text-sm">{requirement.endDate}</span>
              </div>

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
                <div className="flex gap-1 flex-wrap">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                <PlayCircle className="h-4 w-4 mr-2" />
                开始开发
              </Button>
              <Button variant="outline" className="w-full">
                <PauseCircle className="h-4 w-4 mr-2" />
                暂停项目
              </Button>
              <Button variant="outline" className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                标记完成
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}