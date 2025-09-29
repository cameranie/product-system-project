import React, { useState, useRef, useEffect } from 'react';
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
  AlertTriangle,
  XCircle,
  Clock,
  Edit,
  X,
  EyeOff,
  MoreHorizontal,
  GitBranch
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

interface Requirement {
  id: string;
  title: string;
  type: '功能需求' | 'Bug' | '产品建议' | '技术需求' | '安全需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  platform?: string;
  plannedVersion?: string;
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  prototypeId?: string;
  assignee?: User;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// 计算总评审状态的函数
const getOverallReviewStatus = (requirement: Requirement) => {
  const hasReviewer1 = !!requirement.reviewer1;
  const hasReviewer2 = !!requirement.reviewer2;
  
  if (!hasReviewer1 && !hasReviewer2) {
    return { status: 'none', label: '-', variant: 'outline' as const, color: 'text-gray-400' };
  }
  
  const reviewer1Status = requirement.reviewer1Status || 'pending';
  const reviewer2Status = requirement.reviewer2Status || 'pending';
  
  if ((hasReviewer1 && reviewer1Status === 'rejected') || (hasReviewer2 && reviewer2Status === 'rejected')) {
    return { status: 'rejected', label: '评审不通过', variant: 'destructive' as const, color: 'text-red-500' };
  }
  
  if (hasReviewer1 && !hasReviewer2) {
    if (reviewer1Status === 'approved') {
      return { status: 'approved', label: '评审通过', variant: 'default' as const, color: 'text-green-500' };
    } else if (reviewer1Status === 'pending') {
      return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
    } else {
      return { status: 'reviewing', label: '评审中', variant: 'outline' as const, color: 'text-blue-500' };
    }
  }
  
  if (hasReviewer1 && hasReviewer2) {
    if (reviewer1Status === 'approved' && reviewer2Status === 'approved') {
      return { status: 'approved', label: '评审通过', variant: 'default' as const, color: 'text-green-500' };
    } else if (reviewer1Status === 'pending' && reviewer2Status === 'pending') {
      return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
    } else {
      return { status: 'reviewing', label: '评审中', variant: 'outline' as const, color: 'text-blue-500' };
    }
  }
  
  return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
};

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '/avatars/user1.jpg', email: 'zhangsan@company.com' },
  { id: '2', name: '李四', avatar: '/avatars/user2.jpg', email: 'lisi@company.com' },
  { id: '3', name: '王五', avatar: '/avatars/user3.jpg', email: 'wangwu@company.com' },
  { id: '4', name: '赵六', avatar: '/avatars/user4.jpg', email: 'zhaoliu@company.com' },
  { id: '5', name: '孙七', avatar: '/avatars/user5.jpg', email: 'sunqi@company.com' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 可选的版本列表
const availableVersions = [
  'v1.8.0', 'v2.0.0', 'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0', 'v3.0.0'
];

// 来自需求池的需求数据（这些需求有 plannedVersion）
const requirementsPoolData: Requirement[] = [
  {
    id: '1',
    title: '用户注册流程优化',
    type: '功能需求',
    status: '待评审',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。',
    tags: ['用户体验', 'UI优化'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0],
    attachments: [
      { id: '1', name: '注册流程图.png', size: 2048, type: 'image/png', url: '/files/flow.png' }
    ]
  },
  {
    id: '2',
    title: '支付功能集成',
    type: '功能需求',
    status: '评审通过',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[2],
    description: '集成多种支付方式，包括支付宝、微信支付、银行卡支付等，提供安全可靠的支付体验。',
    tags: ['支付', '功能'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    platform: '全平台',
    plannedVersion: 'v2.0.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  {
    id: '3',
    title: '数据导出功能',
    type: '产品建议',
    status: '待评审',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '支持用户导出各种格式的数据报表，包括Excel、PDF、CSV等格式。',
    tags: ['导出', '数据分析'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-16',
    platform: 'Web端',
    plannedVersion: 'v2.2.0',
    isOpen: false,
    reviewer1: mockUsers[0],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[2]
  },
  {
    id: '4',
    title: '移动端适配优化',
    type: '技术需求',
    status: '评审不通过',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[4],
    description: '对移动端界面进行全面优化，提升用户在移动设备上的使用体验。',
    tags: ['移动端', '响应式'],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14',
    platform: '移动端',
    plannedVersion: 'v1.8.0',
    isOpen: false,
    reviewer1: mockUsers[2],
    reviewer1Status: 'rejected',
    reviewStatus: 'rejected',
    assignee: mockUsers[3]
  },
  {
    id: '5',
    title: 'K线图实时更新优化',
    type: '功能需求',
    status: '开发中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。',
    tags: ['K线', '实时数据', '性能优化'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25',
    platform: 'Web端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4],
    attachments: [
      { id: '2', name: 'K线优化方案.pdf', size: 1024, type: 'application/pdf', url: '/files/kline-plan.pdf' }
    ]
  },
  {
    id: '6',
    title: '行情推送服务升级',
    type: '技术需求',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '升级行情推送服务架构，支持更高并发量的实时行情数据推送，降低延迟。',
    tags: ['行情', 'WebSocket', '高并发'],
    createdAt: '2024-01-22',
    updatedAt: '2024-01-26',
    platform: '全平台',
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0]
  }
];

// 预排期需求数据 - 包含来自需求池的需求以及专门在预排期管理中创建的需求
const mockScheduledRequirements: Requirement[] = [
  ...requirementsPoolData, // 包含需求池中有 plannedVersion 的需求
  // 以下是专门在预排期管理中创建的需求，具有独立的评审状态
  {
    id: 'scheduled-1',
    title: '交易风控系统优化',
    type: '安全需求',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[4],
    project: mockProjects[4],
    description: '完善交易风控系统，增加异常交易检测算法，提升系统安全性和风险防控能力。',
    tags: ['风控', '安全', '算法'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-24',
    platform: '全平台',
    plannedVersion: 'v2.5.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[0],
    reviewer1Status: 'pending',  // 预排期独立评审状态
    reviewer2Status: 'pending',  // 预排期独立评审状态
    reviewStatus: 'pending',
    assignee: mockUsers[3],
    attachments: [
      { id: '3', name: '风控需求文档.docx', size: 3072, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '/files/risk-control.docx' }
    ]
  }
];

interface ScheduledRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
  context?: any;
}

export function ScheduledRequirementsPage({ onNavigate, context }: ScheduledRequirementsPageProps) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockScheduledRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [sortBy, setSortBy] = useState('plannedVersion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 隐藏列设置
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showColumnDialog, setShowColumnDialog] = useState(false);

  // 筛选逻辑
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesProject = filterProject === 'all' || req.project.id === filterProject;
    const matchesVersion = filterVersion === 'all' || req.plannedVersion === filterVersion;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesProject && matchesVersion;
  });

  // 排序逻辑
  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'plannedVersion':
        // 版本号排序 - 将版本号转换为数字进行比较
        const versionToNumber = (version: string) => {
          const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
          }
          return 0;
        };
        aValue = versionToNumber(a.plannedVersion || '');
        bValue = versionToNumber(b.plannedVersion || '');
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        aValue = a.plannedVersion;
        bValue = b.plannedVersion;
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
      setSortOrder('asc');
    }
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

  const handleVersionChange = (requirementId: string, newVersion: string) => {
    setRequirements(requirements.map(req => 
      req.id === requirementId 
        ? { ...req, plannedVersion: newVersion, updatedAt: new Date().toISOString().split('T')[0] }
        : req
    ));
  };

  const handleRequirementClick = (requirement: Requirement) => {
    // 点击需求标题，进入需求详情页
    if (onNavigate) {
      onNavigate('requirement-detail', {
        requirementId: requirement.id,
        source: 'scheduled-requirements'
      });
    }
  };

  const handleReviewerStatusChange = (requirementId: string, reviewerType: 'reviewer1' | 'reviewer2', status: 'pending' | 'approved' | 'rejected') => {
    setRequirements(requirements.map(req => {
      if (req.id === requirementId) {
        const updatedReq = {
          ...req,
          [`${reviewerType}Status`]: status,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        return updatedReq;
      }
      return req;
    }));
  };

  const typeIcons = {
    '功能需求': <Lightbulb className="h-4 w-4 text-yellow-500" />,
    'Bug': <Bug className="h-4 w-4 text-red-500" />,
    '产品建议': <Zap className="h-4 w-4 text-blue-500" />,
    '技术需求': <Settings className="h-4 w-4 text-purple-500" />,
    '安全需求': <AlertTriangle className="h-4 w-4 text-orange-500" />,
  };

  const priorityColors = {
    '低': 'bg-gray-100 text-gray-700 border-gray-200',
    '中': 'bg-blue-100 text-blue-700 border-blue-200',
    '高': 'bg-orange-100 text-orange-700 border-orange-200',
    '紧急': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">预排期需求管理</h1>
          <p className="text-muted-foreground mt-1">预排期需求管理，用于排期评审</p>

        </div>
      </div>

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
                  className="pl-10"
                />
              </div>

              {/* 筛选器 */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选器
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                    <div>
                      <label className="text-xs font-medium mb-1 block">需求类型</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部类型</SelectItem>
                          <SelectItem value="功能需求">功能需求</SelectItem>
                          <SelectItem value="Bug">Bug</SelectItem>
                          <SelectItem value="产品建议">产品建议</SelectItem>
                          <SelectItem value="技术需求">技术需求</SelectItem>
                          <SelectItem value="安全需求">安全需求</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">状态</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部状态</SelectItem>
                          <SelectItem value="待评审">待评审</SelectItem>
                          <SelectItem value="评审中">评审中</SelectItem>
                          <SelectItem value="评审通过">评审通过</SelectItem>
                          <SelectItem value="评审不通过">评审不通过</SelectItem>
                          <SelectItem value="开发中">开发中</SelectItem>
                          <SelectItem value="设计中">设计中</SelectItem>
                          <SelectItem value="已完成">已完成</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">优先级</label>
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部优先级</SelectItem>
                          <SelectItem value="紧急">紧急</SelectItem>
                          <SelectItem value="高">高</SelectItem>
                          <SelectItem value="中">中</SelectItem>
                          <SelectItem value="低">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">所属项目</label>
                      <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger className="h-8">
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
                    <div>
                      <label className="text-xs font-medium mb-1 block">预排期版本</label>
                      <Select value={filterVersion} onValueChange={setFilterVersion}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部版本</SelectItem>
                          {availableVersions.map(version => (
                            <SelectItem key={version} value={version}>
                              {version}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 排序 */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  排序
                  {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSortChange('plannedVersion')}>
                    版本号 {sortBy === 'plannedVersion' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('title')}>
                    需求标题 {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('priority')}>
                    优先级 {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
                    创建时间 {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('updatedAt')}>
                    更新时间 {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 列设置 */}
              <Button variant="outline" size="sm" onClick={() => setShowColumnDialog(true)}>
                <EyeOff className="h-4 w-4 mr-2" />
                列设置
              </Button>
            </div>

            {/* 批量操作 */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">已选择 {selectedItems.length} 项</span>
                <Button variant="outline" size="sm">批量调整版本</Button>
                <Button variant="outline" size="sm">批量分配</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 需求列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === sortedRequirements.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {!hiddenColumns.includes('title') && <TableHead className="min-w-[300px]">需求标题</TableHead>}
                  {!hiddenColumns.includes('type') && <TableHead className="w-24">类型</TableHead>}
                  {!hiddenColumns.includes('priority') && <TableHead className="w-24">优先级</TableHead>}
                  {!hiddenColumns.includes('creator') && <TableHead className="w-36">创建人</TableHead>}
                  {!hiddenColumns.includes('project') && <TableHead className="w-32">项目</TableHead>}
                  {!hiddenColumns.includes('reviewStatus') && <TableHead className="w-32">评审状态</TableHead>}
                  {!hiddenColumns.includes('reviewer1') && <TableHead className="w-32">一级评审</TableHead>}
                  {!hiddenColumns.includes('reviewer2') && <TableHead className="w-32">二级评审</TableHead>}
                  {!hiddenColumns.includes('plannedVersion') && <TableHead className="w-32">版本号</TableHead>}
                  {!hiddenColumns.includes('updatedAt') && <TableHead className="w-28">更新时间</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((requirement) => (
                  <TooltipProvider key={requirement.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(requirement.id)}
                          onCheckedChange={(checked) => handleSelectItem(requirement.id, checked as boolean)}
                        />
                      </TableCell>
                      {!hiddenColumns.includes('title') && (
                        <TableCell>
                          <div className="cursor-pointer" onClick={() => handleRequirementClick(requirement)}>
                            <div className="font-medium text-primary hover:underline">{requirement.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {requirement.description}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('type') && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {typeIcons[requirement.type]}
                            <span className="text-xs">{requirement.type}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <TableCell>
                          <Badge 
                            variant={
                              requirement.priority === '紧急' ? 'destructive' :
                              requirement.priority === '高' ? 'default' :
                              requirement.priority === '中' ? 'secondary' : 'outline'
                            }
                          >
                            {requirement.priority}
                          </Badge>
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
                      {!hiddenColumns.includes('project') && (
                        <TableCell>
                          <Badge variant="outline" style={{ borderColor: requirement.project.color }}>
                            {requirement.project.name}
                          </Badge>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('reviewStatus') && (
                        <TableCell>
                          {(() => {
                            const reviewStatus = getOverallReviewStatus(requirement);
                            return (
                              <Badge variant={reviewStatus.variant} className="text-xs">
                                {reviewStatus.label}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('reviewer1') && (
                        <TableCell>
                          {requirement.reviewer1 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={requirement.reviewer1.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {requirement.reviewer1.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{requirement.reviewer1.name}</span>
                              </div>
                              <Select 
                                value={requirement.reviewer1Status || 'pending'} 
                                onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                                  handleReviewerStatusChange(requirement.id, 'reviewer1', value)
                                }
                              >
                                <SelectTrigger className="h-6 w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">待评审</SelectItem>
                                  <SelectItem value="approved">通过</SelectItem>
                                  <SelectItem value="rejected">不通过</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">未设置</span>
                          )}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('reviewer2') && (
                        <TableCell>
                          {requirement.reviewer2 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={requirement.reviewer2.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {requirement.reviewer2.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{requirement.reviewer2.name}</span>
                              </div>
                              <Select 
                                value={requirement.reviewer2Status || 'pending'} 
                                onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                                  handleReviewerStatusChange(requirement.id, 'reviewer2', value)
                                }
                              >
                                <SelectTrigger className="h-6 w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">待评审</SelectItem>
                                  <SelectItem value="approved">通过</SelectItem>
                                  <SelectItem value="rejected">不通过</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">无需审核</span>
                          )}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('plannedVersion') && (
                        <TableCell>
                          <Select 
                            value={requirement.plannedVersion || ''} 
                            onValueChange={(newVersion) => handleVersionChange(requirement.id, newVersion)}
                          >
                            <SelectTrigger className="h-8 min-w-[100px]">
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                <SelectValue placeholder="选择版本" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {availableVersions.map(version => (
                                <SelectItem key={version} value={version}>
                                  {version}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('updatedAt') && (
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{requirement.updatedAt}</span>
                        </TableCell>
                      )}
                    </TableRow>
                  </TooltipProvider>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sortedRequirements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无预排期需求数据</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.values({filterType, filterStatus, filterPriority, filterProject, filterVersion}).some(f => f !== 'all') 
                  ? '请尝试调整筛选条件' 
                  : '所有需求都需要在需求池中设置预排期版本后才会出现在这里'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>共 {sortedRequirements.length} 个预排期需求</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {availableVersions.slice(0, 4).map((version, index) => {
              const count = requirements.filter(req => req.plannedVersion === version).length;
              if (count > 0) {
                return (
                  <span key={version} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                    }`}></div>
                    {version}: {count}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* 列设置对话框 */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>列显示设置</DialogTitle>
            <DialogDescription>选择要隐藏的列</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { key: 'title', label: '需求标题' },
              { key: 'type', label: '类型' },
              { key: 'priority', label: '优先级' },
              { key: 'creator', label: '创建人' },
              { key: 'project', label: '项目' },
              { key: 'reviewStatus', label: '评审状态' },
              { key: 'reviewer1', label: '一级评审' },
              { key: 'reviewer2', label: '二级评审' },
              { key: 'plannedVersion', label: '版本号' },
              { key: 'updatedAt', label: '更新时间' }
            ].map(column => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={!hiddenColumns.includes(column.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setHiddenColumns(hiddenColumns.filter(col => col !== column.key));
                    } else {
                      if (column.key !== 'title') { // 标题列不能隐藏
                        setHiddenColumns([...hiddenColumns, column.key]);
                      }
                    }
                  }}
                  disabled={column.key === 'title'}
                />
                <Label htmlFor={column.key} className={column.key === 'title' ? 'text-muted-foreground' : ''}>
                  {column.label} {column.key === 'title' && '(必显示)'}
                </Label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}