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
  },

  // v3.1.0 版本需求（5个）
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
        executor: mockUsers[0],
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
        estimatedEndDate: '2024-05-20T18:00',
        estimatedDuration: 280,
        status: '未开始',
        delayStatus: '未知'
      },
      {
        id: '6-subtask-5',
        name: '测试',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-05-21T09:00',
        estimatedEndDate: '2024-05-31T18:00',
        estimatedDuration: 96,
        status: '未开始',
        delayStatus: '未知'
      }
    ]
  },
  {
    id: '7',
    title: '行情数据推送优化',
    type: '行情',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '测试中',
    priority: '紧急',
    assignee: mockUsers[2],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: '全平台',
    description: '修复行情数据推送延迟问题，提升数据实时性和准确性',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    createdAt: '2024-03-28 13:15',
    updatedAt: '2024-04-10 16:20',
    tags: ['行情', '推送', '性能'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-29 10:00' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-30 14:30' },
    subtasks: generateDefaultSubtasks('7')
  },
  {
    id: '8',
    title: '交易下单流程优化',
    type: '交易',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '已完成',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[2],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: '移动端',
    description: '简化交易下单流程，提升用户操作体验和交易效率',
    startDate: '2024-03-15',
    endDate: '2024-04-28',
    createdAt: '2024-03-10 10:30',
    updatedAt: '2024-04-25 14:20',
    tags: ['交易', '下单', '用户体验'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-12 09:15' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-15 16:30' },
    subtasks: generateDefaultSubtasks('8')
  },
  {
    id: '9',
    title: '聊天室消息加密功能',
    type: '聊天室',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '开发中',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[3],
    productManager: mockUsers[5],
    project: mockProjects[2],
    platform: '全平台',
    description: '实现聊天室端到端加密，保障用户隐私和消息安全',
    startDate: '2024-04-01',
    endDate: '2024-05-30',
    createdAt: '2024-03-15 14:20',
    updatedAt: '2024-04-20 10:15',
    tags: ['安全', '加密', '聊天室'],
    isOpen: false,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[3], reviewDate: '2024-03-18 15:00' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('9')
  },
  {
    id: '10',
    title: '系统监控升级',
    type: '系统',
    version: 'v3.1.0',
    scheduledVersion: 'v3.1.0',
    status: '开发中',
    priority: '中',
    assignee: mockUsers[3],
    creator: mockUsers[1],
    productManager: mockUsers[5],
    project: mockProjects[3],
    platform: 'PC端',
    description: '升级系统监控体系，增强故障预警和性能分析能力',
    startDate: '2024-04-15',
    endDate: '2024-05-31',
    createdAt: '2024-03-20 09:30',
    updatedAt: '2024-04-25 16:45',
    tags: ['监控', '运维', '系统'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-25 14:30' },
    scheduleReviewLevel2: { status: '未开始' },
    subtasks: generateDefaultSubtasks('10')
  },

  // v3.0.0 版本需求（5个）
  {
    id: '11',
    title: 'K线图新增技术指标',
    type: 'K线',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '已发布',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web端',
    description: '新增MACD、RSI、布林带等技术指标，丰富分析工具',
    startDate: '2024-01-01',
    endDate: '2024-02-29',
    createdAt: '2023-12-01 11:20',
    updatedAt: '2024-03-05 14:30',
    tags: ['K线', '技术指标', '分析'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-12-05 16:20' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-12-08 12:15' },
    subtasks: generateDefaultSubtasks('11')
  },
  {
    id: '12',
    title: '移动端交易界面重构',
    type: '交易',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '已发布',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[2],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: '移动端',
    description: '重构移动端交易界面，提升用户体验和操作便捷性',
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    createdAt: '2023-12-15 10:30',
    updatedAt: '2024-03-05 16:20',
    tags: ['交易', '移动端', '重构'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-12-20 14:00' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-12-25 10:30' },
    subtasks: generateDefaultSubtasks('12')
  },
  {
    id: '13',
    title: '行情数据缓存优化',
    type: '行情',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '已发布',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[3],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: '全平台',
    description: '优化行情数据缓存策略，减少网络请求和提升响应速度',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    createdAt: '2024-01-20 09:15',
    updatedAt: '2024-03-01 11:45',
    tags: ['行情', '缓存', '性能'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-25 15:30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-30 09:00' },
    subtasks: generateDefaultSubtasks('13')
  },
  {
    id: '14',
    title: '聊天室表情包功能',
    type: '聊天室',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '已发布',
    priority: '低',
    assignee: mockUsers[2],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[2],
    platform: '移动端',
    description: '在聊天室中添加表情包功能，增强用户互动体验',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    createdAt: '2024-01-01 14:45',
    updatedAt: '2024-03-02 10:20',
    tags: ['聊天室', '表情包', '用户体验'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-05 16:15' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-10 13:30' },
    subtasks: generateDefaultSubtasks('14')
  },
  {
    id: '15',
    title: '系统日志分析工具',
    type: '系统',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '已发布',
    priority: '中',
    assignee: mockUsers[3],
    creator: mockUsers[4],
    productManager: mockUsers[5],
    project: mockProjects[3],
    platform: 'PC端',
    description: '开发系统日志分析工具，便于运维团队快速定位问题',
    startDate: '2024-01-15',
    endDate: '2024-02-29',
    createdAt: '2024-01-01 08:30',
    updatedAt: '2024-03-05 15:10',
    tags: ['系统', '日志', '运维'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-08 11:20' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-12 14:45' },
    subtasks: generateDefaultSubtasks('15')
  }
];

export function VersionRequirementsPageWithSubtasksTable({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set(['6']));
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

  // 获取样式函数（移除颜色）
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

  const getSubtaskStatusColor = (status: string): string => {
    const colors = {
      '未开始': 'bg-gray-100 text-gray-800 border-gray-200',
      '进行中': 'bg-blue-100 text-blue-800 border-blue-200',
      '已完成': 'bg-green-100 text-green-800 border-green-200',
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

  // 开始编辑
  const startEditing = (requirementId: string, subtaskId: string, field: string, currentValue: string) => {
    setEditingSubtask({ requirementId, subtaskId, field });
    setEditingValue(currentValue);
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editingSubtask) return;
    
    const { requirementId, subtaskId, field } = editingSubtask;
    
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.map(subtask => {
                if (subtask.id === subtaskId) {
                  const updatedSubtask = { ...subtask, [field]: editingValue };
                  
                  // 自动计算时长
                  if (field === 'estimatedStartDate' || field === 'estimatedEndDate') {
                    if (updatedSubtask.estimatedStartDate && updatedSubtask.estimatedEndDate) {
                      const startTime = new Date(updatedSubtask.estimatedStartDate).getTime();
                      const endTime = new Date(updatedSubtask.estimatedEndDate).getTime();
                      updatedSubtask.estimatedDuration = Math.round((endTime - startTime) / (1000 * 60 * 60));
                    }
                  }
                  
                  if (field === 'actualStartDate' || field === 'actualEndDate') {
                    if (updatedSubtask.actualStartDate && updatedSubtask.actualEndDate) {
                      const startTime = new Date(updatedSubtask.actualStartDate).getTime();
                      const endTime = new Date(updatedSubtask.actualEndDate).getTime();
                      updatedSubtask.actualDuration = Math.round((endTime - startTime) / (1000 * 60 * 60));
                    }
                  }
                  
                  // 重新计算延期状态
                  updatedSubtask.delayStatus = calculateDelayStatus(updatedSubtask);
                  
                  return updatedSubtask;
                }
                return subtask;
              })
            }
          : req
      )
    );
    
    setEditingSubtask(null);
    setEditingValue('');
  };

  // 键盘事件处理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingSubtask(null);
      setEditingValue('');
    }
  };

  // 更新子任务状态
  const updateSubtaskStatus = (requirementId: string, subtaskId: string, newStatus: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.map(subtask => 
                subtask.id === subtaskId 
                  ? { ...subtask, status: newStatus as any }
                  : subtask
              )
            }
          : req
      )
    );
  };

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

  // 定义选项数据
  const typeOptions = ['K线', '行情', '聊天室', '系统', '交易'];
  const priorityOptions = ['低', '中', '高', '紧急'];
  const platformOptions = ['Web端', '移动端', '全平台', 'PC端', '小程序'];

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, requirementId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      requirementId
    });
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 页面头部 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">版本需求管理</h1>
            <p className="text-sm text-gray-600 mt-1">管理产品版本需求和子任���执行详情</p>
          </div>

        </div>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索需求标题、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
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
              <SelectItem value="功能需求">功能需求</SelectItem>
              <SelectItem value="技术需求">技术需求</SelectItem>
              <SelectItem value="Bug">Bug</SelectItem>
              <SelectItem value="产品建议">产品建议</SelectItem>
              <SelectItem value="安全需求">安全需求</SelectItem>
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

      {/* 需求表格 */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="min-w-[200px]">需求标题</TableHead>
                  <TableHead className="w-24">类型</TableHead>
                  <TableHead className="w-24">优先级</TableHead>
                  <TableHead className="w-32">产品负责人</TableHead>
                  <TableHead className="w-24">项目</TableHead>
                  <TableHead className="w-24">应用端</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-32">任务执行人</TableHead>
                  <TableHead className="w-24">部门</TableHead>
                  <TableHead className="w-40">预估时间</TableHead>
                  <TableHead className="w-40">实际时间</TableHead>
                  <TableHead className="w-24">延期状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVersions.map(version => (
                  <React.Fragment key={version}>
                    {/* 版本分组行 */}
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableCell colSpan={13} className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-gray-900">{version}</div>
                          <Badge variant="secondary" className="text-xs">
                            {groupedRequirements[version].length} 个需求
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* 版本下的需求 */}
                    {groupedRequirements[version].map(requirement => {
                      const isExpanded = expandedRequirements.has(requirement.id);
                      
                      return (
                        <React.Fragment key={requirement.id}>
                          {/* 主需求行 */}
                          <TableRow 
                            className="hover:bg-gray-50"
                            onContextMenu={(e) => handleContextMenu(e, requirement.id)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRequirementExpansion(requirement.id)}
                                className="p-1 h-6 w-6"
                              >
                                {isExpanded ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div 
                                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                                onClick={() => handleRequirementTitleClick(requirement)}
                              >
                                {requirement.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {requirement.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(requirement.priority)}>
                                {requirement.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={requirement.productManager.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {requirement.productManager.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{requirement.productManager.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {requirement.project.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {requirement.platform}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(requirement.status)}>
                                {requirement.status}
                              </Badge>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                          </TableRow>

                          {/* 子任务行 */}
                          {isExpanded && requirement.subtasks.map(subtask => (
                            <TableRow key={subtask.id} className="bg-gray-50/50 hover:bg-gray-100/50">
                              <TableCell></TableCell>
                              <TableCell>
                                <div className="pl-4 flex items-center gap-2">
                                  <div className="w-4 h-4"></div>
                                  {editingSubtask?.requirementId === requirement.id && 
                                   editingSubtask?.subtaskId === subtask.id && 
                                   editingSubtask?.field === 'name' ? (
                                    <Input
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      onBlur={saveEdit}
                                      onKeyDown={handleKeyPress}
                                      className="text-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="text-sm cursor-pointer hover:bg-gray-200 px-1 py-0.5 rounded"
                                      onClick={() => startEditing(requirement.id, subtask.id, 'name', subtask.name)}
                                    >
                                      {subtask.name}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {requirement.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-xs ${getPriorityColor(requirement.priority)}`}>
                                  {requirement.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={requirement.productManager.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {requirement.productManager.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">{requirement.productManager.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {requirement.project.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {requirement.platform}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge className={`cursor-pointer text-xs ${getSubtaskStatusColor(subtask.status)}`}>
                                      {subtask.status}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => updateSubtaskStatus(requirement.id, subtask.id, '未开始')}>
                                      未开始
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSubtaskStatus(requirement.id, subtask.id, '进行中')}>
                                      进行中
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSubtaskStatus(requirement.id, subtask.id, '已完成')}>
                                      已完成
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSubtaskStatus(requirement.id, subtask.id, '已暂停')}>
                                      已暂停
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                              <TableCell>
                                {subtask.executor ? (
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage src={subtask.executor.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {subtask.executor.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{subtask.executor.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">未分配</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {subtask.department && (
                                  <Badge variant="outline" className="text-xs">
                                    {subtask.department.name}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-gray-600">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="w-8 text-gray-500">开始:</span>
                                    {editingSubtask?.requirementId === requirement.id && 
                                     editingSubtask?.subtaskId === subtask.id && 
                                     editingSubtask?.field === 'estimatedStartDate' ? (
                                      <Input
                                        type="datetime-local"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={handleKeyPress}
                                        className="text-xs h-6 w-32"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="cursor-pointer hover:bg-gray-200 px-1 py-0.5 rounded flex-1"
                                        onClick={() => startEditing(requirement.id, subtask.id, 'estimatedStartDate', subtask.estimatedStartDate || '')}
                                      >
                                        {subtask.estimatedStartDate ? formatDateTime(subtask.estimatedStartDate) : '点击设置'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-8 text-gray-500">结束:</span>
                                    {editingSubtask?.requirementId === requirement.id && 
                                     editingSubtask?.subtaskId === subtask.id && 
                                     editingSubtask?.field === 'estimatedEndDate' ? (
                                      <Input
                                        type="datetime-local"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={handleKeyPress}
                                        className="text-xs h-6 w-32"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="cursor-pointer hover:bg-gray-200 px-1 py-0.5 rounded flex-1"
                                        onClick={() => startEditing(requirement.id, subtask.id, 'estimatedEndDate', subtask.estimatedEndDate || '')}
                                      >
                                        {subtask.estimatedEndDate ? formatDateTime(subtask.estimatedEndDate) : '点击设置'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-8 text-gray-500">时长:</span>
                                    <span className="text-blue-600">
                                      {subtask.estimatedStartDate && subtask.estimatedEndDate ? 
                                        `${Math.round((new Date(subtask.estimatedEndDate).getTime() - new Date(subtask.estimatedStartDate).getTime()) / (1000 * 60 * 60))}h` : 
                                        '-'}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-gray-600">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="w-8 text-gray-500">开始:</span>
                                    {editingSubtask?.requirementId === requirement.id && 
                                     editingSubtask?.subtaskId === subtask.id && 
                                     editingSubtask?.field === 'actualStartDate' ? (
                                      <Input
                                        type="datetime-local"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={handleKeyPress}
                                        className="text-xs h-6 w-32"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="cursor-pointer hover:bg-gray-200 px-1 py-0.5 rounded flex-1"
                                        onClick={() => startEditing(requirement.id, subtask.id, 'actualStartDate', subtask.actualStartDate || '')}
                                      >
                                        {subtask.actualStartDate ? formatDateTime(subtask.actualStartDate) : '点击设置'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-8 text-gray-500">结束:</span>
                                    {editingSubtask?.requirementId === requirement.id && 
                                     editingSubtask?.subtaskId === subtask.id && 
                                     editingSubtask?.field === 'actualEndDate' ? (
                                      <Input
                                        type="datetime-local"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={handleKeyPress}
                                        className="text-xs h-6 w-32"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="cursor-pointer hover:bg-gray-200 px-1 py-0.5 rounded flex-1"
                                        onClick={() => startEditing(requirement.id, subtask.id, 'actualEndDate', subtask.actualEndDate || '')}
                                      >
                                        {subtask.actualEndDate ? formatDateTime(subtask.actualEndDate) : '点击设置'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-8 text-gray-500">时长:</span>
                                    <span className="text-green-600">
                                      {subtask.actualStartDate && subtask.actualEndDate ? 
                                        `${Math.round((new Date(subtask.actualEndDate).getTime() - new Date(subtask.actualStartDate).getTime()) / (1000 * 60 * 60))}h` : 
                                        '-'}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-xs ${getDelayStatusColor(subtask.delayStatus)}`}>
                                  {subtask.delayStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-lg shadow-lg border py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b">操作选项</div>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            复制需求
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            添加子任务
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" />
            删除需求
          </button>
        </div>
      )}
    </div>
  );
}