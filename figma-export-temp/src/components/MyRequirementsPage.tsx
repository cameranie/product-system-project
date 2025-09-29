import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus,
  GitBranch,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  AlertCircle,
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  Trash2,
  PlusCircle,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  EyeOff,
  Target,
  CheckSquare,
  Move,
  MoreVertical
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from "sonner@2.0.3";

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
  status: '待开始' | '进行中' | '已完成';
  delayStatus: '准时' | '延期' | '提前' | '-';
}

interface ReviewStatus {
  status: '待开始' | '待原型设计' | '原型设计中' | '待UI设计' | 'UI设计中' | '待开发' | '开发中' | '待测试' | '测试中' | '待验收' | '验收中' | '待上线' | '已上线' | '有问题';
  reviewer?: User;
  reviewDate?: string;
}

interface VersionRequirement {
  id: string;
  title: string;
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  version: string;
  scheduledVersion?: string;
  status: '待开始' | '待原型设计' | '原型设计中' | '待UI设计' | 'UI设计中' | '待开发' | '开发中' | '待测试' | '测试中' | '待验收' | '验收中' | '待上线' | '已上线';
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

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
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
  if (!dateTimeStr) return '';
  // 处理 YYYY-MM-DD HH:mm 格式
  if (dateTimeStr.includes(' ')) {
    return dateTimeStr;
  }
  // 处理其他格式
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');
};

// 生成默认子任务
const generateDefaultSubtasks = (requirementId: string): Subtask[] => {
  return defaultSubtaskTypes.map((name, index) => ({
    id: `${requirementId}-subtask-${index + 1}`,
    name,
    type: 'predefined' as const,
    status: '待开始' as const,
    delayStatus: '-' as const
  }));
};

// 扩展的mock数据，更多与张三相关的需求
const mockVersionRequirements: VersionRequirement[] = [
  // v3.2.0 版本需求
  {
    id: '1',
    title: 'AI智能分析引擎',
    type: 'K线',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '待开始',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[4],
    productManager: mockUsers[0], // 张三作为产品负责人
    project: mockProjects[0],
    platform: 'Web端',
    description: '基于机器学习的K线趋势预测和智能分析功能',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    createdAt: '2024-05-15 14:30',
    updatedAt: '2024-05-20 16:45',
    tags: ['AI', '智能分析', '机器学习'],
    isOpen: true,
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: generateDefaultSubtasks('1')
  },
  {
    id: '2',
    title: '多币种实时汇率系统',
    type: '行情',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '待原型设计',
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
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
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
    assignee: mockUsers[0], // 张三作为需求负责人
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
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: generateDefaultSubtasks('3')
  },
  {
    id: '4',
    title: '高频交易优化',
    type: '交易',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '原型设计中',
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
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: generateDefaultSubtasks('4')
  },
  // v3.1.0 版本需求 - 张三作为前端开发执行人
  {
    id: '6',
    title: 'K线图优化升级',
    type: 'K线',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[4],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web端',
    description: '优化K线图渲染性能，支持更多技术指标和自定义样式',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    createdAt: '2024-03-15 16:40',
    updatedAt: '2024-04-20 09:25',
    tags: ['K线', '图表', '性能优化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-20 11:30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-22 15:45' },
    subtasks: [
      {
        id: '6-subtask-1',
        name: '原型设计',
        type: 'predefined',
        executor: mockUsers[8],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-01T09:00',
        estimatedEndDate: '2024-04-05T18:00',
        estimatedDuration: 32,
        actualStartDate: '2024-04-01T09:00',
        actualEndDate: '2024-04-04T17:30',
        actualDuration: 28,
        status: '已完成',
        delayStatus: '提前'
      },
      {
        id: '6-subtask-2',
        name: '视觉设计',
        type: 'predefined',
        executor: mockUsers[2],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-06T09:00',
        estimatedEndDate: '2024-04-12T18:00',
        estimatedDuration: 48,
        actualStartDate: '2024-04-05T10:00',
        actualEndDate: '2024-04-14T16:30',
        actualDuration: 52,
        status: '已完成',
        delayStatus: '延期'
      },
      {
        id: '6-subtask-3',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0], // 张三作为前端开发执行人
        department: mockDepartments[2],
        estimatedStartDate: '2024-04-13T09:00',
        estimatedEndDate: '2024-05-15T18:00',
        estimatedDuration: 240,
        actualStartDate: '2024-04-15T09:30',
        status: '进行中',
        delayStatus: '准时'
      },
      {
        id: '6-subtask-4',
        name: '后端开发',
        type: 'predefined',
        executor: mockUsers[1],
        department: mockDepartments[3],
        estimatedStartDate: '2024-04-13T09:00',
        estimatedEndDate: '2024-05-10T18:00',
        estimatedDuration: 200,
        actualStartDate: '2024-04-15T10:00',
        status: '进行中',
        delayStatus: '准时'
      },
      {
        id: '6-subtask-5',
        name: '测试',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-05-11T09:00',
        estimatedEndDate: '2024-05-25T18:00',
        estimatedDuration: 100,
        status: '待开始',
        delayStatus: '-'
      }
    ]
  },
  // 更多张三相关的需求
  {
    id: '7',
    title: '移动端交易界面重构',
    type: '交易',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[0], // 张三作为需求负责人
    creator: mockUsers[1],
    productManager: mockUsers[0], // 张三同时是产品负责人
    project: mockProjects[4],
    platform: '移动端',
    description: '重构移动端交易界面，提升用户体验和操作流畅度',
    startDate: '2024-04-15',
    endDate: '2024-06-30',
    createdAt: '2024-04-01 14:20',
    updatedAt: '2024-04-25 10:15',
    tags: ['移动端', '交易', '用户体验'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-04-05 16:30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-04-08 11:20' },
    subtasks: [
      {
        id: '7-subtask-1',
        name: '原型设计',
        type: 'predefined',
        executor: mockUsers[8],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-15T09:00',
        estimatedEndDate: '2024-04-22T18:00',
        estimatedDuration: 40,
        actualStartDate: '2024-04-15T09:00',
        actualEndDate: '2024-04-21T17:00',
        actualDuration: 36,
        status: '已完成',
        delayStatus: '提前'
      },
      {
        id: '7-subtask-2',
        name: '视觉设计',
        type: 'predefined',
        executor: mockUsers[2],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-23T09:00',
        estimatedEndDate: '2024-05-03T18:00',
        estimatedDuration: 64,
        actualStartDate: '2024-04-22T10:00',
        actualEndDate: '2024-05-05T16:00',
        actualDuration: 68,
        status: '已完成',
        delayStatus: '延期'
      },
      {
        id: '7-subtask-3',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0], // 张三作为前端开发执行人
        department: mockDepartments[2],
        estimatedStartDate: '2024-05-06T09:00',
        estimatedEndDate: '2024-06-15T18:00',
        estimatedDuration: 280,
        actualStartDate: '2024-05-06T09:30',
        status: '进行中',
        delayStatus: '准时'
      }
    ]
  },
  // 其他需求（张三不相关的）
  {
    id: '8',
    title: '后台管理系统升级',
    type: '系统',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '待开始',
    priority: '中',
    assignee: mockUsers[3],
    creator: mockUsers[1],
    productManager: mockUsers[5],
    project: mockProjects[3],
    platform: 'Web端',
    description: '后台管理系统功能升级和界面优化',
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    createdAt: '2024-06-15 09:20',
    updatedAt: '2024-06-20 14:30',
    tags: ['后台', '管理系统', '升级'],
    isOpen: false,
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: generateDefaultSubtasks('8')
  }
];

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    '待开始': 'bg-gray-100 text-gray-700',
    '待原型设计': 'bg-purple-100 text-purple-700',
    '原型设计中': 'bg-purple-100 text-purple-700',
    '待UI设计': 'bg-blue-100 text-blue-700',
    'UI设计中': 'bg-blue-100 text-blue-700',
    '待开发': 'bg-yellow-100 text-yellow-700',
    '开发中': 'bg-yellow-100 text-yellow-700',
    '待测试': 'bg-orange-100 text-orange-700',
    '测试中': 'bg-orange-100 text-orange-700',
    '待验收': 'bg-red-100 text-red-700',
    '验收中': 'bg-red-100 text-red-700',
    '待上线': 'bg-indigo-100 text-indigo-700',
    '已上线': 'bg-green-100 text-green-700',
    '规划中': 'bg-gray-100 text-gray-700'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
};

const getPriorityColor = (priority: string) => {
  const colorMap: { [key: string]: string } = {
    '低': 'bg-green-100 text-green-700',
    '中': 'bg-yellow-100 text-yellow-700',
    '高': 'bg-orange-100 text-orange-700',
    '紧急': 'bg-red-100 text-red-700'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-700';
};

const getTypeColor = (type: string) => {
  const colorMap: { [key: string]: string } = {
    'K线': 'bg-blue-100 text-blue-700',
    '行情': 'bg-green-100 text-green-700',
    '聊天室': 'bg-orange-100 text-orange-700',
    '系统': 'bg-red-100 text-red-700',
    '交易': 'bg-purple-100 text-purple-700'
  };
  return colorMap[type] || 'bg-gray-100 text-gray-700';
};

interface MyRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

const MyRequirementsPage: React.FC<MyRequirementsPageProps> = ({ onNavigate }) => {
  const currentUser = '张三'; // 当前用户

  // 筛选出张三相关的需求：作为产品负责人或者子任务执行人
  const myRequirements = useMemo(() => {
    return mockVersionRequirements.filter(req => {
      // 张三作为产品负责人
      if (req.productManager.name === currentUser) {
        return true;
      }
      
      // 张三作为需求负责人
      if (req.assignee.name === currentUser) {
        return true;
      }
      
      // 张三作为子任务执行人
      const hasSubtaskWithZhangSan = req.subtasks.some(subtask => 
        subtask.executor?.name === currentUser
      );
      
      return hasSubtaskWithZhangSan;
    });
  }, [currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [priorityFilter, setPriorityFilter] = useState('全部');
  const [versionFilter, setVersionFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('全部');

  // 应用筛选条件
  const filteredRequirements = useMemo(() => {
    return myRequirements.filter(req => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === '全部' || req.status === statusFilter;
      const matchesPriority = priorityFilter === '全部' || req.priority === priorityFilter;
      const matchesVersion = versionFilter === '全部' || req.version === versionFilter;
      const matchesType = typeFilter === '全部' || req.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesVersion && matchesType;
    });
  }, [myRequirements, searchTerm, statusFilter, priorityFilter, versionFilter, typeFilter]);

  // 获取所有可能的筛选值
  const allStatuses = Array.from(new Set(myRequirements.map(req => req.status)));
  const allPriorities = Array.from(new Set(myRequirements.map(req => req.priority)));
  const allVersions = Array.from(new Set(myRequirements.map(req => req.version)));
  const allTypes = Array.from(new Set(myRequirements.map(req => req.type)));

  const handleRequirementClick = (requirement: VersionRequirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', {
        requirementId: requirement.id,
        source: 'my-requirements'
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">我负责的需求</h1>
            <p className="text-sm text-gray-600 mt-1">
              显示您作为产品负责人或子任务执行人的需求 ({filteredRequirements.length} 个)
            </p>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索需求标题、描述或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部状态</SelectItem>
              {allStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部优先级</SelectItem>
              {allPriorities.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={versionFilter} onValueChange={setVersionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="版本" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部版本</SelectItem>
              {allVersions.map(version => (
                <SelectItem key={version} value={version}>{version}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部类型</SelectItem>
              {allTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 表格内容 */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="border-b border-gray-200">
                <TableHead className="table-header-unified w-[300px]">需求信息</TableHead>
                <TableHead className="table-header-unified w-[120px]">类型</TableHead>
                <TableHead className="table-header-unified w-[100px]">版本</TableHead>
                <TableHead className="table-header-unified w-[120px]">状态</TableHead>
                <TableHead className="table-header-unified w-[80px]">优先级</TableHead>
                <TableHead className="table-header-unified w-[120px]">需求负责人</TableHead>
                <TableHead className="table-header-unified w-[120px]">产品负责人</TableHead>
                <TableHead className="table-header-unified w-[100px]">平台</TableHead>
                <TableHead className="table-header-unified w-[140px]">开始/结束时间</TableHead>
                <TableHead className="table-header-unified w-[120px]">我的角色</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequirements.map((requirement) => {
                // 确定张三在这个需求中的角色
                const roles = [];
                if (requirement.productManager.name === currentUser) {
                  roles.push('产品负责人');
                }
                if (requirement.assignee.name === currentUser) {
                  roles.push('需求负责人');
                }
                const hasSubtask = requirement.subtasks.some(subtask => 
                  subtask.executor?.name === currentUser
                );
                if (hasSubtask) {
                  const subtaskNames = requirement.subtasks
                    .filter(subtask => subtask.executor?.name === currentUser)
                    .map(subtask => subtask.name);
                  roles.push(`执行人(${subtaskNames.join(', ')})`);
                }

                return (
                  <TableRow 
                    key={requirement.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRequirementClick(requirement)}
                  >
                    <TableCell className="table-content-unified">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {requirement.title}
                        </div>
                        {requirement.description && (
                          <div className="table-helper-text-unified line-clamp-2">
                            {requirement.description}
                          </div>
                        )}
                        {requirement.tags && requirement.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {requirement.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="badge-unified">
                                {tag}
                              </Badge>
                            ))}
                            {requirement.tags.length > 3 && (
                              <Badge variant="outline" className="badge-unified">
                                +{requirement.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <Badge className={`badge-unified ${getTypeColor(requirement.type)}`}>
                        {requirement.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <Badge variant="outline" className="badge-unified">
                        {requirement.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <Badge className={`badge-unified ${getStatusColor(requirement.status)}`}>
                        {requirement.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <Badge className={`badge-unified ${getPriorityColor(requirement.priority)}`}>
                        {requirement.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={requirement.assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {requirement.assignee.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{requirement.assignee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={requirement.productManager.avatar} />
                          <AvatarFallback className="text-xs">
                            {requirement.productManager.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{requirement.productManager.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      {requirement.platform}
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <div className="space-y-1">
                        <div className="table-helper-text-unified">
                          开始: {requirement.startDate}
                        </div>
                        <div className="table-helper-text-unified">
                          结束: {requirement.endDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="table-content-unified">
                      <div className="space-y-1">
                        {roles.map((role, index) => (
                          <Badge key={index} variant="secondary" className="badge-unified block mb-1">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredRequirements.length === 0 && (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到相关需求</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? '请尝试修改搜索条件' : '暂时没有您负责的需求'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { MyRequirementsPage };