import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus,
  GitBranch,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

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

interface Department {
  id: string;
  name: string;
}

interface Subtask {
  id: string;
  name: string;
  type: 'predefined' | 'custom';
  executor?: User;
  department?: Department;
  estimatedStartDate?: string; // YYYY-MM-DDTHH:mm 格式
  estimatedEndDate?: string;   // YYYY-MM-DDTHH:mm 格式
  estimatedDuration?: number; // 小时
  actualStartDate?: string;    // YYYY-MM-DDTHH:mm 格式
  actualEndDate?: string;      // YYYY-MM-DDTHH:mm 格式
  actualDuration?: number; // 小时
  status: '未开始' | '进行中' | '已完成' | '已暂停';
  delayStatus: '准时' | '延期' | '提前' | '未知';
}

interface ReviewStatus {
  status: '未开始' | '进行中' | '已完成' | '已暂停' | '有问题';
  reviewer?: User;
  reviewDate?: string;
}

interface VersionRequirement {
  id: string;
  title: string;
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  version: string;
  scheduledVersion?: string;
  status: '规划中' | '开发中' | '测试中' | '已完成' | '已发布' | '已暂停';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  productManager: User;
  project: Project;
  platform?: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isOpen: boolean;
  scheduleReviewLevel1: ReviewStatus;
  scheduleReviewLevel2: ReviewStatus;
  subtasks: Subtask[];
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
  { id: '9', name: '原型师', avatar: '', role: '原型设计' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

const mockDepartments: Department[] = [
  { id: '1', name: '产品部' },
  { id: '2', name: '设计部' },
  { id: '3', name: '前端开发部' },
  { id: '4', name: '后端开发部' },
  { id: '5', name: '测试部' },
  { id: '6', name: '运营部' }
];

const defaultSubtaskTypes = [
  '原型设计',
  '视觉设计',
  '前端开发',
  '后端开发',
  '测试',
  '产品验收',
  '需求提出者验收'
];

// 格式化时间显示
const formatDateTime = (dateTimeStr?: string) => {
  if (!dateTimeStr) return '-';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 计算延期状态
const calculateDelayStatus = (subtask: Subtask): string => {
  if (!subtask.estimatedEndDate) return '未知';
  
  const estimatedEnd = new Date(subtask.estimatedEndDate);
  const now = new Date();
  
  if (subtask.status === '已完成' && subtask.actualEndDate) {
    const actualEnd = new Date(subtask.actualEndDate);
    if (actualEnd <= estimatedEnd) return '准时';
    return '延期';
  }
  
  if (subtask.status === '进行中') {
    if (now > estimatedEnd) return '延期';
    return '准时';
  }
  
  return '未知';
};

// 生成默认子任务
const generateDefaultSubtasks = (requirementId: string): Subtask[] => {
  return defaultSubtaskTypes.map((name, index) => ({
    id: `${requirementId}-subtask-${index + 1}`,
    name,
    type: 'predefined' as const,
    status: '未开始' as const,
    delayStatus: '未知' as const
  }));
};

const mockVersionRequirements: VersionRequirement[] = [
  // v3.2.0 版本需求（5个）
  {
    id: '1',
    title: 'AI智能分析引擎',
    type: 'K线',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '规划中',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[4],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web端',
    description: '基于机器学习的K线趋势预测和智能分析功能',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    createdAt: '2024-05-15 14:30',
    updatedAt: '2024-05-20 16:45',
    tags: ['AI', '智能分析', '机器学习'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('1')
  },
  {
    id: '2',
    title: '多币种实时汇率系统',
    type: '行情',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[2],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: '全平台',
    description: '支持全球主要货币的实时汇率获取和转换',
    startDate: '2024-06-15',
    endDate: '2024-07-30',
    createdAt: '2024-05-18 10:20',
    updatedAt: '2024-05-22 11:15',
    tags: ['汇率', '货币', '国际化'],
    isOpen: false,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('2')
  },
  {
    id: '3',
    title: '社交化聊天室2.0',
    type: '聊天室',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[2],
    productManager: mockUsers[5],
    project: mockProjects[2],
    platform: '移动端',
    description: '增加用户关注、私信、朋友圈等社交功能',
    startDate: '2024-07-01',
    endDate: '2024-08-15',
    createdAt: '2024-05-20 09:30',
    updatedAt: '2024-05-25 14:20',
    tags: ['社交', '聊天', '用户体验'],
    isOpen: false,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('3')
  },
  {
    id: '4',
    title: '高频交易优化',
    type: '交易',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '规划中',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[3],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: 'PC端',
    description: '优化交易系统性能，支持毫秒级高频交易',
    startDate: '2024-06-01',
    endDate: '2024-07-31',
    createdAt: '2024-05-16 11:45',
    updatedAt: '2024-05-23 16:30',
    tags: ['高频交易', '性能优化', '低延迟'],
    isOpen: false,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('4')
  },
  {
    id: '5',
    title: '系统安全防护升级',
    type: '系统',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '规划中',
    priority: '紧急',
    assignee: mockUsers[3],
    creator: mockUsers[1],
    productManager: mockUsers[5],
    project: mockProjects[3],
    platform: '全平台',
    description: '加强系统安全防护，防范DDoS攻击和数据泄露',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    createdAt: '2024-05-14 15:20',
    updatedAt: '2024-05-24 10:15',
    tags: ['安全', '防护', 'DDoS'],
    isOpen: false,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('5')
  }
];

export function VersionRequirementsPageWithSubtasksTable({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set(['1']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [selectedVersion, setSelectedVersion] = useState('全部');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; requirementId: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  
  // 编辑相关状态
  const [editingSubtask, setEditingSubtask] = useState<{
    requirementId: string;
    subtaskId: string;
    field: string;
  } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // 获取独特版本列表
  const versions = Array.from(new Set(requirements.map(req => req.version))).sort().reverse();

  // 根据选择的版本过滤需求
  const filteredRequirements = requirements.filter(req => {
    const matchesVersion = selectedVersion === '全部' || req.version === selectedVersion;
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === '全部' || req.type === selectedType;
    const matchesStatus = selectedStatus === '全部' || req.status === selectedStatus;
    
    return matchesVersion && matchesSearch && matchesType && matchesStatus;
  });

  // 按版本分组需求
  const groupedRequirements = filteredRequirements.reduce((groups, req) => {
    const version = req.version;
    if (!groups[version]) {
      groups[version] = [];
    }
    groups[version].push(req);
    return groups;
  }, {} as Record<string, VersionRequirement[]>);

  // 按版本号排序
  const sortedVersions = Object.keys(groupedRequirements).sort().reverse();

  // 需求标题点击事件
  const handleRequirementTitleClick = (requirement: VersionRequirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', {
        requirementId: requirement.id,
        source: 'version-requirements'
      });
    }
  };

  // 切换需求展开状态
  const toggleRequirementExpansion = (requirementId: string) => {
    const newExpanded = new Set(expandedRequirements);
    if (newExpanded.has(requirementId)) {
      newExpanded.delete(requirementId);
    } else {
      newExpanded.add(requirementId);
    }
    setExpandedRequirements(newExpanded);
  };

  // 获取样式函数
  const getTypeColor = (type: string): string => {
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      '紧急': 'bg-red-100 text-red-800 border-red-200',
      '高': 'bg-orange-100 text-orange-800 border-orange-200',
      '中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '低': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      '规划中': 'bg-gray-100 text-gray-800 border-gray-200',
      '开发中': 'bg-blue-100 text-blue-800 border-blue-200',
      '测试中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '已完成': 'bg-green-100 text-green-800 border-green-200',
      '已发布': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      '已暂停': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDelayStatusColor = (delayStatus: string): string => {
    const colors = {
      '准时': 'bg-green-100 text-green-800 border-green-200',
      '延期': 'bg-red-100 text-red-800 border-red-200',
      '提前': 'bg-blue-100 text-blue-800 border-blue-200',
      '未知': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[delayStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 定义选项数据
  const typeOptions = ['K线', '行情', '聊天室', '系统', '交易'];
  const priorityOptions = ['低', '中', '高', '紧急'];
  const platformOptions = ['Web端', '移动端', '全平台', 'PC端', '小程序'];

  // 更新需求字段
  const updateRequirementField = (requirementId: string, field: string, value: any) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              [field]: value,
              updatedAt: new Date().toLocaleString('zh-CN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              }).replace(/\//g, '-')
            }
          : req
      )
    );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 页面头部 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">版本需求管理</h1>
            <p className="text-sm text-gray-600 mt-1">管理产品版本需求和子任务执行详情</p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              新建需求
            </Button>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索需求标题、描述、标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部版本</SelectItem>
              {versions.map(version => (
                <SelectItem key={version} value={version}>{version}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部类型</SelectItem>
              {typeOptions.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部状态</SelectItem>
              <SelectItem value="规划中">规划中</SelectItem>
              <SelectItem value="开发中">开发中</SelectItem>
              <SelectItem value="测试中">测试中</SelectItem>
              <SelectItem value="已完成">已完成</SelectItem>
              <SelectItem value="已发布">已发布</SelectItem>
              <SelectItem value="已暂停">已暂停</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {sortedVersions.map(version => (
            <Card key={version} className="overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{version}</h2>
                    <Badge variant="outline" className="text-sm">
                      {groupedRequirements[version].length} 个需求
                    </Badge>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-1/3">需求标题</TableHead>
                      <TableHead className="w-20">类型</TableHead>
                      <TableHead className="w-20">优先级</TableHead>
                      <TableHead className="w-20">状态</TableHead>
                      <TableHead className="w-24">应用端</TableHead>
                      <TableHead className="w-32">计划日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedRequirements[version].map((requirement) => (
                      <React.Fragment key={requirement.id}>
                        {/* 需求主行 */}
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRequirementExpansion(requirement.id)}
                              className="w-8 h-8 p-0"
                            >
                              {expandedRequirements.has(requirement.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <button
                                onClick={() => handleRequirementTitleClick(requirement)}
                                className="text-left hover:text-blue-600 transition-colors"
                              >
                                <div className="font-medium text-gray-900">{requirement.title}</div>
                                {requirement.description && (
                                  <div className="text-sm text-gray-500 line-clamp-2">
                                    {requirement.description}
                                  </div>
                                )}
                              </button>
                              {requirement.tags && requirement.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {requirement.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                  <Badge variant="outline" className={`cursor-pointer ${getTypeColor(requirement.type)}`}>
                                    {requirement.type}
                                  </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {typeOptions.map(type => (
                                  <DropdownMenuItem 
                                    key={type}
                                    onClick={() => updateRequirementField(requirement.id, 'type', type)}
                                  >
                                    {type}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                  <Badge variant="outline" className={`cursor-pointer ${getPriorityColor(requirement.priority)}`}>
                                    {requirement.priority}
                                  </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {priorityOptions.map(priority => (
                                  <DropdownMenuItem 
                                    key={priority}
                                    onClick={() => updateRequirementField(requirement.id, 'priority', priority)}
                                  >
                                    {priority}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(requirement.status)}>
                              {requirement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                  <Badge variant="outline" className="cursor-pointer">
                                    {requirement.platform || '未设置'}
                                  </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {platformOptions.map(platform => (
                                  <DropdownMenuItem 
                                    key={platform}
                                    onClick={() => updateRequirementField(requirement.id, 'platform', platform)}
                                  >
                                    {platform}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {requirement.startDate} 至 {requirement.endDate}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* 子任务展开区域 - 已去掉负责人列 */}
                        {expandedRequirements.has(requirement.id) && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-0">
                              <div className="p-4 border-t">
                                <div className="flex items-center gap-2 mb-3">
                                  <FolderOpen className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">子任务执行详情</span>
                                  <Badge variant="outline" className="text-xs">
                                    {requirement.subtasks.length} 个子任务
                                  </Badge>
                                </div>
                                
                                <div className="bg-white rounded-lg border overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gray-50">
                                        <TableHead className="w-32">子任务</TableHead>
                                        <TableHead className="w-24">部门</TableHead>
                                        <TableHead className="w-32">预计开始</TableHead>
                                        <TableHead className="w-32">预计完成</TableHead>
                                        <TableHead className="w-20">预计时长</TableHead>
                                        <TableHead className="w-32">实际开始</TableHead>
                                        <TableHead className="w-32">实际完成</TableHead>
                                        <TableHead className="w-20">实际时长</TableHead>
                                        <TableHead className="w-20">状态</TableHead>
                                        <TableHead className="w-20">延期状态</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {requirement.subtasks.map((subtask) => (
                                        <TableRow key={subtask.id} className="hover:bg-gray-50">
                                          <TableCell className="font-medium">{subtask.name}</TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {subtask.department?.name || '-'}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {formatDateTime(subtask.estimatedStartDate)}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {formatDateTime(subtask.estimatedEndDate)}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {subtask.estimatedDuration ? `${subtask.estimatedDuration}h` : '-'}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {formatDateTime(subtask.actualStartDate)}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {formatDateTime(subtask.actualEndDate)}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {subtask.actualDuration ? `${subtask.actualDuration}h` : '-'}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className={getStatusColor(subtask.status)}>
                                              {subtask.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className={getDelayStatusColor(subtask.delayStatus)}>
                                              {subtask.delayStatus}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}