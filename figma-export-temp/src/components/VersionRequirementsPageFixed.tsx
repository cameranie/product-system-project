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

// 转换为datetime-local格式
const toDateTimeLocal = (dateTimeStr?: string) => {
  if (!dateTimeStr) return '';
  
  // 如果是 YYYY-MM-DD HH:mm 格式，转换为 YYYY-MM-DDTHH:mm
  if (dateTimeStr.includes(' ')) {
    return dateTimeStr.replace(' ', 'T');
  }
  
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return '';
  
  // 转换为 YYYY-MM-DDTHH:mm 格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 从datetime-local格式转换为显示格式
const fromDateTimeLocal = (dateTimeLocalStr: string) => {
  if (!dateTimeLocalStr) return '';
  // 将 YYYY-MM-DDTHH:mm 转换为 YYYY-MM-DD HH:mm
  return dateTimeLocalStr.replace('T', ' ');
};

// 计算工期（小时）
const calculateDuration = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
};

// 计算进行中任务的当前已用时间
const calculateCurrentDuration = (startDate?: string): number => {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  
  if (isNaN(start.getTime())) return 0;
  
  return Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60));
};

// 计算延期状态
const calculateDelayStatus = (subtask: Subtask): string => {
  // 如果没有预估结束时间，返回 -
  if (!subtask.estimatedEndDate) return '-';
  
  const estimatedEnd = new Date(subtask.estimatedEndDate);
  const now = new Date();
  
  // 已完成的任务：比较实际结束时间和预估结束时间
  if (subtask.status === '已完成' && subtask.actualEndDate) {
    const actualEnd = new Date(subtask.actualEndDate);
    const daysDiff = Math.ceil((actualEnd.getTime() - estimatedEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) return '延期';
    if (daysDiff < -1) return '提前'; // 提前1天以上才算提前
    return '准时';
  }
  
  // 进行中的任务：比较当前时间和预估结束时间
  if (subtask.status === '进行中') {
    const daysDiff = Math.ceil((now.getTime() - estimatedEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) return '延期';
    return '准时';
  }
  
  // 等待开始的任务：检查是否已经过了预估开始时间或结束时间
  if (subtask.status === '待开始') {
    const daysDiff = Math.ceil((now.getTime() - estimatedEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) return '延期';
    return '准时';
  }
  
  // 已完成状态处理（重复处理，但保持完整性）
  if (subtask.status === '已完成' && subtask.actualEndDate) {
    const actualEnd = new Date(subtask.actualEndDate);
    const daysDiff = Math.ceil((actualEnd.getTime() - estimatedEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) return '延期';
    if (daysDiff < -1) return '提前'; // 提前1天以上才算提前
    return '准时';
  }
  
  return '-';
};

// 计算工期差异状态
const calculateDurationVariance = (estimatedDuration?: number, actualDuration?: number): {
  variance: number;
  status: '准时' | '延时' | '提前' | '未知';
  color: string;
} => {
  if (!estimatedDuration || !actualDuration) {
    return { variance: 0, status: '未知', color: 'text-gray-600' };
  }
  
  const variance = actualDuration - estimatedDuration;
  const percentageVariance = (variance / estimatedDuration) * 100;
  
  if (Math.abs(percentageVariance) <= 5) {
    return { variance, status: '准时', color: 'text-green-600' };
  } else if (variance > 0) {
    return { variance, status: '延时', color: 'text-red-600' };
  } else {
    return { variance, status: '提前', color: 'text-blue-600' };
  }
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

const mockVersionRequirements: VersionRequirement[] = [
  // v3.2.0 版本需求（5个）
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
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
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
        status: '待开始',
        delayStatus: '-'
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
        status: '待开始',
        delayStatus: '-'
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
    subtasks: [
      {
        id: '8-subtask-1',
        name: '原型设计',
        type: 'predefined',
        executor: mockUsers[8],
        department: mockDepartments[1],
        estimatedStartDate: '2024-03-15T09:00',
        estimatedEndDate: '2024-03-18T18:00',
        estimatedDuration: 24,
        actualStartDate: '2024-03-15T09:00',
        actualEndDate: '2024-03-17T16:00',
        actualDuration: 20,
        status: '已完成',
        delayStatus: '提前'
      },
      {
        id: '8-subtask-2',
        name: '视觉设计',
        type: 'predefined',
        executor: mockUsers[2],
        department: mockDepartments[1],
        estimatedStartDate: '2024-03-18T09:00',
        estimatedEndDate: '2024-03-22T18:00',
        estimatedDuration: 32,
        actualStartDate: '2024-03-17T10:00',
        actualEndDate: '2024-03-23T17:30',
        actualDuration: 35,
        status: '已完成',
        delayStatus: '延期'
      },
      {
        id: '8-subtask-3',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0],
        department: mockDepartments[2],
        estimatedStartDate: '2024-03-23T09:00',
        estimatedEndDate: '2024-04-15T18:00',
        estimatedDuration: 160,
        actualStartDate: '2024-03-23T09:00',
        actualEndDate: '2024-04-12T18:00',
        actualDuration: 145,
        status: '已完成',
        delayStatus: '提前'
      },
      {
        id: '8-subtask-4',
        name: '后端开发',
        type: 'predefined',
        executor: mockUsers[1],
        department: mockDepartments[3],
        estimatedStartDate: '2024-03-23T09:00',
        estimatedEndDate: '2024-04-18T18:00',
        estimatedDuration: 180,
        actualStartDate: '2024-03-23T09:00',
        actualEndDate: '2024-04-20T15:00',
        actualDuration: 190,
        status: '已完成',
        delayStatus: '延期'
      },
      {
        id: '8-subtask-5',
        name: '测试',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-04-19T09:00',
        estimatedEndDate: '2024-04-25T18:00',
        estimatedDuration: 48,
        actualStartDate: '2024-04-21T09:00',
        actualEndDate: '2024-04-26T17:00',
        actualDuration: 40,
        status: '已完成',
        delayStatus: '准时'
      }
    ]
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
    scheduleReviewLevel2: { status: '待开始' },
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
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: generateDefaultSubtasks('10')
  }
];

// 可筛选的列（移除项目类型和应用端）
const filterableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'status', label: '状态' },
  { value: 'priority', label: '优先级' },
  { value: 'productManager', label: '产品负责人' },
  { value: 'creator', label: '创建人' },
  { value: 'version', label: '版本' }
];

// 可排序的列（移除开始时间和结束时间）
const sortableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'status', label: '状态' },
  { value: 'priority', label: '优先级' },
  { value: 'productManager', label: '产品负责人' },
  { value: 'creator', label: '创建人' },
  { value: 'version', label: '版本' }
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

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 状态选项
const statusOptions = ['待开始', '待原型设计', '原型设计中', '待UI设计', 'UI设计中', '待开发', '开发中', '待测试', '测试中', '待验收', '验收中', '待上线', '已上线'];

// 优先级选项
const priorityOptions = ['低', '中', '高', '紧急'];

// 版本选项
const versionOptions = ['v3.0.0', 'v3.1.0', 'v3.2.0', 'v3.3.0', 'v4.0.0'];

// 子任务状态选项
const subtaskStatusOptions = ['待开始', '进行中', '已完成'];

interface VersionRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

export function VersionRequirementsPageFixed({ onNavigate }: VersionRequirementsPageProps) {
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set(['6']));
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockVersionRequirements.map(r => r.version))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });

  // 编辑相关状态
  const [editingSubtask, setEditingSubtask] = useState<{
    requirementId: string;
    subtaskId: string;
    field: string;
  } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    subtaskId: string;
    requirementId: string;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 监听选择状态变化
  useEffect(() => {
    setShowBatchActions(selectedRequirements.length > 0);
  }, [selectedRequirements]);

  // 右键菜单事件处理
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

  // 定期更新延期状态（每分钟检查一次）
  useEffect(() => {
    const updateDelayStatus = () => {
      setRequirements(prev => 
        prev.map(req => ({
          ...req,
          subtasks: req.subtasks.map(subtask => {
            // 只更新正在进行中或未开始的任务的延期状态
            if (subtask.status === '进行中' || subtask.status === '待开始') {
              const newDelayStatus = calculateDelayStatus(subtask);
              if (newDelayStatus !== subtask.delayStatus) {
                return { ...subtask, delayStatus: newDelayStatus };
              }
            }
            return subtask;
          })
        }))
      );
    };

    // 立即执行一次
    updateDelayStatus();
    
    // 设置定时器，每分钟更新一次
    const interval = setInterval(updateDelayStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

  // 应用自定义筛选逻辑
  const applyCustomFilters = (requirement: VersionRequirement, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.column || !filter.operator) return true;
      
      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = requirement.title;
          break;
        case 'status':
          fieldValue = requirement.status;
          break;
        case 'priority':
          fieldValue = requirement.priority;
          break;
        case 'productManager':
          fieldValue = requirement.productManager.name;
          break;
        case 'creator':
          fieldValue = requirement.creator.name;
          break;
        case 'version':
          fieldValue = requirement.version;
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

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = !searchTerm || 
      requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCustomFilters = applyCustomFilters(requirement, customFilters);
    
    return matchesSearch && matchesCustomFilters;
  });

  // 排序逻辑  
  const sortedRequirements = useMemo(() => {
    if (!sortConfig) return filteredRequirements;
    
    return [...filteredRequirements].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortConfig.column) {
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
        case 'productManager':
          aValue = a.productManager.name;
          bValue = b.productManager.name;
          break;
        case 'creator':
          aValue = a.creator.name;
          bValue = b.creator.name;
          break;
        case 'version':
          aValue = a.version;
          bValue = b.version;
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

  // 按版本分组
  const groupedByVersion = useMemo(() => {
    return sortedRequirements.reduce((groups, requirement) => {
      const version = requirement.version;
      
      if (!groups[version]) {
        groups[version] = [];
      }
      groups[version].push(requirement);
      return groups;
    }, {} as Record<string, VersionRequirement[]>);
  }, [sortedRequirements]);

  // 版本排序
  const sortedVersions = useMemo(() => {
    return Object.keys(groupedByVersion).sort((a, b) => {
      const versionToNumber = (version: string) => {
        const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
        if (match) {
          return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
        }
        return 0;
      };
      
      return versionToNumber(b) - versionToNumber(a);
    });
  }, [groupedByVersion]);

  // 处理批量选择
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(filteredRequirements.map(r => r.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  const handleSelectRequirement = (requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements([...selectedRequirements, requirementId]);
    } else {
      setSelectedRequirements(selectedRequirements.filter(id => id !== requirementId));
    }
  };

  // 切换列显示/隐藏
  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  // 处理列头排序点击
  const handleColumnSort = (column: string) => {
    if (!sortableColumns.find(col => col.value === column)) return;
    
    if (!sortConfig || sortConfig.column !== column) {
      setSortConfig({ column, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ column, direction: 'desc' });
    } else {
      setSortConfig(null);
    }
  };

  // 获取列的排序图标
  const getSortIcon = (column: string) => {
    if (!sortableColumns.find(col => col.value === column)) return null;
    
    const isActiveColumn = sortConfig && sortConfig.column === column;
    const isAsc = isActiveColumn && sortConfig.direction === 'asc';
    const isDesc = isActiveColumn && sortConfig.direction === 'desc';
    
    return (
      <div className="flex flex-col items-center justify-center ml-1">
        <ChevronUp className={`h-3 w-3 ${isAsc ? 'text-primary' : 'text-gray-400'}`} />
        <ChevronDown className={`h-3 w-3 -mt-1 ${isDesc ? 'text-primary' : 'text-gray-400'}`} />
      </div>
    );
  };

  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

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
  const getPriorityColor = (priority: string): string => {
    return priorityConfig[priority as keyof typeof priorityConfig]?.className || 'bg-gray-100 text-gray-800 border-gray-200';
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
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSubtaskStatusColor = (status: string): string => {
    const colors = {
      '待开始': 'bg-gray-100 text-gray-800 border-gray-200',
      '进行中': 'bg-blue-100 text-blue-800 border-blue-200',
      '已完成': 'bg-green-100 text-green-800 border-green-200',
      '已暂停': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDelayStatusColor = (delayStatus: string): string => {
    const colors = {
      '准时': 'bg-green-100 text-green-800 border-green-200',
      '延期': 'bg-red-100 text-red-800 border-red-200',
      '提前': 'bg-blue-100 text-blue-800 border-blue-200',
      '-': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[delayStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 开始编辑
  const startEditing = (requirementId: string, subtaskId: string, field: string, currentValue: string) => {
    setEditingSubtask({ requirementId, subtaskId, field });
    if (field === 'estimatedStartDate' || field === 'estimatedEndDate' || 
        field === 'actualStartDate' || field === 'actualEndDate') {
      setEditingValue(toDateTimeLocal(currentValue));
    } else {
      setEditingValue(currentValue);
    }
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editingSubtask) return;
    
    const { requirementId, subtaskId, field } = editingSubtask;
    let finalValue = editingValue;
    
    // 如果是时间字段，转换格式
    if (field === 'estimatedStartDate' || field === 'estimatedEndDate' || 
        field === 'actualStartDate' || field === 'actualEndDate') {
      finalValue = fromDateTimeLocal(editingValue);
    }
    
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.map(subtask => {
                if (subtask.id === subtaskId) {
                  const updatedSubtask = { ...subtask, [field]: finalValue };
                  
                  // 自动计算时长
                  if (field === 'estimatedStartDate' || field === 'estimatedEndDate') {
                    if (updatedSubtask.estimatedStartDate && updatedSubtask.estimatedEndDate) {
                      updatedSubtask.estimatedDuration = calculateDuration(
                        updatedSubtask.estimatedStartDate, 
                        updatedSubtask.estimatedEndDate
                      );
                    }
                  }
                  
                  if (field === 'actualStartDate' || field === 'actualEndDate') {
                    if (updatedSubtask.actualStartDate && updatedSubtask.actualEndDate) {
                      updatedSubtask.actualDuration = calculateDuration(
                        updatedSubtask.actualStartDate, 
                        updatedSubtask.actualEndDate
                      );
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
              subtasks: req.subtasks.map(subtask => {
                if (subtask.id === subtaskId) {
                  const updatedSubtask = { ...subtask, status: newStatus as any };
                  
                  // 自动处理状态变化
                  if (newStatus === '进行中' && !updatedSubtask.actualStartDate) {
                    // 开始进行时自动设置实际开始时间
                    const now = new Date();
                    updatedSubtask.actualStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  }
                  
                  if (newStatus === '已完成' && !updatedSubtask.actualEndDate) {
                    // 完成时自动设置实际结束时间
                    const now = new Date();
                    updatedSubtask.actualEndDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    
                    // 自动计算实际工期
                    if (updatedSubtask.actualStartDate && updatedSubtask.actualEndDate) {
                      updatedSubtask.actualDuration = calculateDuration(
                        updatedSubtask.actualStartDate, 
                        updatedSubtask.actualEndDate
                      );
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
    
    // 显示提示信息
    if (newStatus === '进行中') {
      toast.success('任务已开始，自动记录开始时间');
    } else if (newStatus === '已完成') {
      toast.success('任务已完成，自动记录结束时间并计算实际工期');
    }
  };

  // 更新子任务负责人
  const updateSubtaskExecutor = (requirementId: string, subtaskId: string, executorId: string) => {
    const executor = mockUsers.find(user => user.id === executorId);
    if (!executor) return;

    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.map(subtask => 
                subtask.id === subtaskId 
                  ? { ...subtask, executor }
                  : subtask
              )
            }
          : req
      )
    );
  };

  // 更新需求状态
  const updateRequirementStatus = (requirementId: string, newStatus: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, status: newStatus as any }
          : req
      )
    );
  };

  // 更新需求优先级
  const updateRequirementPriority = (requirementId: string, newPriority: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, priority: newPriority as any }
          : req
      )
    );
  };

  // 更新需求产品负责人
  const updateRequirementProductManager = (requirementId: string, newProductManagerId: string) => {
    const newProductManager = mockUsers.find(user => user.id === newProductManagerId);
    if (!newProductManager) return;

    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, productManager: newProductManager }
          : req
      )
    );
  };

  // 更新需求版本号
  const updateRequirementVersion = (requirementId: string, newVersion: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, version: newVersion, scheduledVersion: newVersion }
          : req
      )
    );
  };

  // 右键菜单操作
  const handleSubtaskContextMenu = (e: React.MouseEvent, requirementId: string, subtaskId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      requirementId,
      subtaskId
    });
  };

  // 插入子任务行
  const insertSubtaskRow = (requirementId: string, subtaskId: string) => {
    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const subtaskIndex = req.subtasks.findIndex(st => st.id === subtaskId);
          const newSubtask: Subtask = {
            id: `${requirementId}-subtask-${Date.now()}`,
            name: '新子任务',
            type: 'custom',
            status: '待开始',
            delayStatus: '-'
          };
          
          const newSubtasks = [...req.subtasks];
          newSubtasks.splice(subtaskIndex + 1, 0, newSubtask);
          
          return { ...req, subtasks: newSubtasks };
        }
        return req;
      })
    );
    setContextMenu(null);
    toast.success('已插入新的子任务行');
  };

  // 复制子任务行
  const copySubtaskRow = (requirementId: string, subtaskId: string) => {
    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const subtaskIndex = req.subtasks.findIndex(st => st.id === subtaskId);
          const originalSubtask = req.subtasks[subtaskIndex];
          
          const copiedSubtask: Subtask = {
            ...originalSubtask,
            id: `${requirementId}-subtask-${Date.now()}`,
            name: `${originalSubtask.name} - 副本`,
            actualStartDate: undefined,
            actualEndDate: undefined,
            actualDuration: undefined,
            status: '待开始',
            delayStatus: '-'
          };
          
          const newSubtasks = [...req.subtasks];
          newSubtasks.splice(subtaskIndex + 1, 0, copiedSubtask);
          
          return { ...req, subtasks: newSubtasks };
        }
        return req;
      })
    );
    setContextMenu(null);
    toast.success('已复制子任务行');
  };

  // 删除子任务行
  const deleteSubtaskRow = (requirementId: string, subtaskId: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.filter(st => st.id !== subtaskId)
            }
          : req
      )
    );
    setContextMenu(null);
    toast.success('已删除子任务行');
  };

  // 批量操作功能
  const handleBatchAction = (action: string) => {
    switch (action) {
      case 'export':
        toast.success(`已导出 ${selectedRequirements.length} 个需求`);
        break;
      case 'archive':
        toast.success(`已归档 ${selectedRequirements.length} 个需求`);
        break;
      case 'delete':
        setRequirements(prev => prev.filter(req => !selectedRequirements.includes(req.id)));
        toast.success(`已删除 ${selectedRequirements.length} 个需求`);
        break;
      default:
        break;
    }
    setSelectedRequirements([]);
  };

  const handleCreateRequirement = () => {
    if (onNavigate) {
      onNavigate('requirement-edit', { 
        requirement: null, 
        isEdit: false,
        source: 'version-requirements'
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1>版本需求管理</h1>
              <p className="text-muted-foreground mt-1">
                管理产品版本需求和子任务执行详情，支持智能筛选和高级管理功能
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
                    <DropdownMenuContent align="end" className="w-48">
                      {[
                        { key: 'status', label: '状态' },
                        { key: 'priority', label: '优先级' },
                        { key: 'productManager', label: '产品负责人' },
                        { key: 'creator', label: '创建人' }
                      ].map((column) => (
                        <DropdownMenuItem
                          key={column.key}
                          className="flex items-center gap-2"
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleColumnVisibility(column.key);
                          }}
                        >
                          <Checkbox
                            checked={!hiddenColumns.includes(column.key)}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <span>{column.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 高级筛选 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-4 w-4 mr-2" />
                        高级筛选
                        {customFilters.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                            {customFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">筛选条件</h4>
                          {customFilters.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-auto p-1 text-xs"
                            >
                              清除所有
                            </Button>
                          )}
                        </div>
                        
                        {customFilters.map((filter) => (
                          <div key={filter.id} className="flex items-center gap-2">
                            <Select
                              value={filter.column}
                              onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                            >
                              <SelectTrigger className="w-28">
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
                            
                            <Select
                              value={filter.operator}
                              onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                            >
                              <SelectTrigger className="w-20">
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
                              placeholder="值"
                              value={filter.value}
                              onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                              className="flex-1"
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomFilter(filter.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addCustomFilter}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          添加筛选条件
                        </Button>
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
                          <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                            1
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {sortableColumns.map((column) => (
                        <DropdownMenuItem
                          key={column.value}
                          className="flex items-center justify-between"
                          onSelect={() => handleColumnSort(column.value)}
                        >
                          <span>{column.label}</span>
                          {getSortIcon(column.value)}
                        </DropdownMenuItem>
                      ))}
                      {sortConfig && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setSortConfig(null)}>
                            清除排序
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 批量操作 */}
              {showBatchActions && (
                <div className="flex items-center gap-2 pl-4 border-l">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedRequirements.length} 项
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        批量操作
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleBatchAction('export')}>
                        <Copy className="h-4 w-4 mr-2" />
                        导出选中项
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleBatchAction('archive')}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        归档选中项
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onSelect={() => handleBatchAction('delete')}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除选中项
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 版本分组内容 */}
        <div className="space-y-6">
          {sortedVersions.map((version) => (
            <Card key={version}>
              <Collapsible
                open={expandedVersions[version]}
                onOpenChange={() => toggleVersionExpanded(version)}
              >
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedVersions[version] ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                        <div className="flex items-center gap-3">
                          <GitBranch className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{version}</h3>
                            <p className="text-sm text-gray-600">
                              {groupedByVersion[version].length} 个需求
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {Object.entries(
                            groupedByVersion[version].reduce((acc, req) => {
                              acc[req.status] = (acc[req.status] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([status, count]) => (
                            <Badge
                              key={status}
                              variant="secondary"
                              className={getStatusColor(status)}
                            >
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                        
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {version}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-8">
                            <Checkbox
                              checked={
                                groupedByVersion[version].every(req => 
                                  selectedRequirements.includes(req.id)
                                ) && groupedByVersion[version].length > 0
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRequirements(prev => [
                                    ...prev, 
                                    ...groupedByVersion[version]
                                      .filter(req => !prev.includes(req.id))
                                      .map(req => req.id)
                                  ]);
                                } else {
                                  setSelectedRequirements(prev => 
                                    prev.filter(id => 
                                      !groupedByVersion[version].some(req => req.id === id)
                                    )
                                  );
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleColumnSort('title')}
                          >
                            <div className="flex items-center">
                              需求标题
                              {getSortIcon('title')}
                            </div>
                          </TableHead>
                          {!hiddenColumns.includes('status') && (
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleColumnSort('status')}
                            >
                              <div className="flex items-center">
                                状态
                                {getSortIcon('status')}
                              </div>
                            </TableHead>
                          )}
                          {!hiddenColumns.includes('priority') && (
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleColumnSort('priority')}
                            >
                              <div className="flex items-center">
                                优先级
                                {getSortIcon('priority')}
                              </div>
                            </TableHead>
                          )}
                          {!hiddenColumns.includes('productManager') && (
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleColumnSort('productManager')}
                            >
                              <div className="flex items-center">
                                产品负责人
                                {getSortIcon('productManager')}
                              </div>
                            </TableHead>
                          )}
                          {!hiddenColumns.includes('creator') && (
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleColumnSort('creator')}
                            >
                              <div className="flex items-center">
                                创建人
                                {getSortIcon('creator')}
                              </div>
                            </TableHead>
                          )}
                          {!hiddenColumns.includes('version') && (
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleColumnSort('version')}
                            >
                              <div className="flex items-center">
                                版本号
                                {getSortIcon('version')}
                              </div>
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByVersion[version].map((requirement) => (
                          <React.Fragment key={requirement.id}>
                            {/* 主需求行 */}
                            <TableRow className="hover:bg-gray-50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedRequirements.includes(requirement.id)}
                                  onCheckedChange={(checked) => 
                                    handleSelectRequirement(requirement.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => toggleRequirementExpansion(requirement.id)}
                                  >
                                    {expandedRequirements.has(requirement.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <button
                                    onClick={() => handleRequirementTitleClick(requirement)}
                                    className="text-left hover:text-blue-600 transition-colors"
                                  >
                                    {requirement.title}
                                  </button>
                                </div>
                              </TableCell>
                              {!hiddenColumns.includes('status') && (
                                <TableCell>
                                  <Select
                                    value={requirement.status}
                                    onValueChange={(value) => updateRequirementStatus(requirement.id, value)}
                                  >
                                    <SelectTrigger className="w-28 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                          {status}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                              {!hiddenColumns.includes('priority') && (
                                <TableCell>
                                  <Select
                                    value={requirement.priority}
                                    onValueChange={(value) => updateRequirementPriority(requirement.id, value)}
                                  >
                                    <SelectTrigger className="w-20 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {priorityOptions.map((priority) => (
                                        <SelectItem key={priority} value={priority}>
                                          {priority}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                              {!hiddenColumns.includes('productManager') && (
                                <TableCell>
                                  <Select
                                    value={requirement.productManager.id}
                                    onValueChange={(value) => updateRequirementProductManager(requirement.id, value)}
                                  >
                                    <SelectTrigger className="w-32 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                              {!hiddenColumns.includes('creator') && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {requirement.creator.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{requirement.creator.name}</span>
                                  </div>
                                </TableCell>
                              )}
                              {!hiddenColumns.includes('version') && (
                                <TableCell>
                                  <Select
                                    value={requirement.version}
                                    onValueChange={(value) => updateRequirementVersion(requirement.id, value)}
                                  >
                                    <SelectTrigger className="w-24 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {versionOptions.map((version) => (
                                        <SelectItem key={version} value={version}>
                                          {version}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                            </TableRow>

                            {/* 子任务行 */}
                            {expandedRequirements.has(requirement.id) && (
                              <TableRow>
                                <TableCell colSpan={13} className="p-0 border-b-0">
                                  <div className="bg-gray-50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-sm">子任务详情</span>
                                      </div>
                                      
                                      {/* 工期统计 */}
                                      <div className="flex items-center gap-4 text-xs text-gray-600">
                                        {(() => {
                                          const totalEstimated = requirement.subtasks
                                            .filter(st => st.estimatedDuration)
                                            .reduce((sum, st) => sum + (st.estimatedDuration || 0), 0);
                                          const totalActual = requirement.subtasks
                                            .reduce((sum, st) => {
                                              let duration = st.actualDuration || 0;
                                              // 如果任务正在进行中且有开始时间，计算当前已用时间
                                              if (st.status === '进行中' && st.actualStartDate && !st.actualDuration) {
                                                duration = calculateCurrentDuration(st.actualStartDate);
                                              }
                                              return sum + duration;
                                            }, 0);
                                          const completedTasks = requirement.subtasks.filter(st => st.status === '已完成').length;
                                          const totalTasks = requirement.subtasks.length;
                                          
                                          return (
                                            <>
                                              <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>预估: {totalEstimated}h</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                <span>实际: {totalActual}h</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Target className="h-3 w-3" />
                                                <span>完成: {completedTasks}/{totalTasks}</span>
                                              </div>
                                              {totalEstimated > 0 && totalActual > 0 && (
                                                <div className={`flex items-center gap-1 ${totalActual > totalEstimated ? 'text-red-600' : totalActual < totalEstimated ? 'text-blue-600' : 'text-green-600'}`}>
                                                  <AlertTriangle className="h-3 w-3" />
                                                  <span>
                                                    {totalActual > totalEstimated ? '+' : ''}{totalActual - totalEstimated}h
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                    
                                    {/* 子任务标题栏 */}
                                    <div className="bg-white rounded-lg border border-gray-200 mb-2">
                                      <div className="grid grid-cols-20 gap-4 items-center p-3 bg-gray-100 rounded-t-lg border-b">
                                        <div className="col-span-3 font-medium text-sm text-gray-700">子任务名称</div>
                                        <div className="col-span-2 font-medium text-sm text-gray-700">负责人</div>
                                        <div className="col-span-2 font-medium text-sm text-gray-700">状态</div>
                                        <div className="col-span-2 font-medium text-sm text-gray-700">预估开始时间</div>
                                        <div className="col-span-2 font-medium text-sm text-gray-700">预估结束时间</div>
                                        <div className="col-span-1 font-medium text-sm text-gray-700">预估工期</div>
                                        <div className="col-span-2 font-medium text-sm text-gray-700">实际开始</div>
                                        <div className="col-span-2 font-medium text-sm text-gray-700">实际结束</div>
                                        <div className="col-span-1 font-medium text-sm text-gray-700">实际工期</div>
                                        <div className="col-span-1 font-medium text-sm text-gray-700">延期状态</div>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      {requirement.subtasks.map((subtask) => (
                                        <div
                                          key={subtask.id}
                                          className="bg-white rounded-lg p-3 border"
                                          onContextMenu={(e) => handleSubtaskContextMenu(e, requirement.id, subtask.id)}
                                        >
                                          <div className="grid grid-cols-20 gap-4 items-center">
                                            {/* 子任务名称 */}
                                            <div className="col-span-3">
                                              {editingSubtask?.subtaskId === subtask.id && editingSubtask?.field === 'name' ? (
                                                <Input
                                                  value={editingValue}
                                                  onChange={(e) => setEditingValue(e.target.value)}
                                                  onKeyDown={handleKeyPress}
                                                  onBlur={saveEdit}
                                                  autoFocus
                                                  className="h-8"
                                                />
                                              ) : (
                                                <span 
                                                  className="font-medium text-sm cursor-pointer hover:text-blue-600"
                                                  onClick={() => startEditing(requirement.id, subtask.id, 'name', subtask.name)}
                                                >
                                                  {subtask.name}
                                                </span>
                                              )}
                                            </div>

                                            {/* 负责人 */}
                                            <div className="col-span-2">
                                              <Select
                                                value={subtask.executor?.id || ''}
                                                onValueChange={(value) => updateSubtaskExecutor(requirement.id, subtask.id, value)}
                                              >
                                                <SelectTrigger className="h-8 text-xs min-w-[120px]">
                                                  <SelectValue placeholder="选择负责人" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {mockUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                      {user.name}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            {/* 状态 */}
                                            <div className="col-span-2">
                                              <Select
                                                value={subtask.status}
                                                onValueChange={(value) => updateSubtaskStatus(requirement.id, subtask.id, value)}
                                              >
                                                <SelectTrigger className="h-8 text-xs min-w-[100px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {subtaskStatusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                      {status}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            {/* 预估开始时间 */}
                                            <div className="col-span-2">
                                              {editingSubtask?.subtaskId === subtask.id && editingSubtask?.field === 'estimatedStartDate' ? (
                                                <Input
                                                  type="datetime-local"
                                                  value={editingValue}
                                                  onChange={(e) => setEditingValue(e.target.value)}
                                                  onKeyDown={handleKeyPress}
                                                  onBlur={saveEdit}
                                                  autoFocus
                                                  className="h-8 text-xs"
                                                />
                                              ) : (
                                                <span 
                                                  className="text-xs cursor-pointer hover:text-blue-600"
                                                  onClick={() => startEditing(requirement.id, subtask.id, 'estimatedStartDate', subtask.estimatedStartDate || '')}
                                                >
                                                  {formatDateTime(subtask.estimatedStartDate) || '点击设置'}
                                                </span>
                                              )}
                                            </div>

                                            {/* 预估结束时间 */}
                                            <div className="col-span-2">
                                              {editingSubtask?.subtaskId === subtask.id && editingSubtask?.field === 'estimatedEndDate' ? (
                                                <Input
                                                  type="datetime-local"
                                                  value={editingValue}
                                                  onChange={(e) => setEditingValue(e.target.value)}
                                                  onKeyDown={handleKeyPress}
                                                  onBlur={saveEdit}
                                                  autoFocus
                                                  className="h-8 text-xs"
                                                />
                                              ) : (
                                                <span 
                                                  className="text-xs cursor-pointer hover:text-blue-600"
                                                  onClick={() => startEditing(requirement.id, subtask.id, 'estimatedEndDate', subtask.estimatedEndDate || '')}
                                                >
                                                  {formatDateTime(subtask.estimatedEndDate) || '点击设置'}
                                                </span>
                                              )}
                                            </div>

                                            {/* 预估工期 */}
                                            <div className="col-span-1">
                                              <span className="text-xs text-gray-600">
                                                {subtask.estimatedDuration ? `${subtask.estimatedDuration}h` : '-'}
                                              </span>
                                            </div>

                                            {/* 实际开始时间 */}
                                            <div className="col-span-2">
                                              {editingSubtask?.subtaskId === subtask.id && editingSubtask?.field === 'actualStartDate' ? (
                                                <Input
                                                  type="datetime-local"
                                                  value={editingValue}
                                                  onChange={(e) => setEditingValue(e.target.value)}
                                                  onKeyDown={handleKeyPress}
                                                  onBlur={saveEdit}
                                                  autoFocus
                                                  className="h-8 text-xs"
                                                />
                                              ) : (
                                                <span 
                                                  className="text-xs cursor-pointer hover:text-blue-600"
                                                  onClick={() => startEditing(requirement.id, subtask.id, 'actualStartDate', subtask.actualStartDate || '')}
                                                >
                                                  {formatDateTime(subtask.actualStartDate) || '点击设置'}
                                                </span>
                                              )}
                                            </div>

                                            {/* 实际结束时间 */}
                                            <div className="col-span-2">
                                              {editingSubtask?.subtaskId === subtask.id && editingSubtask?.field === 'actualEndDate' ? (
                                                <Input
                                                  type="datetime-local"
                                                  value={editingValue}
                                                  onChange={(e) => setEditingValue(e.target.value)}
                                                  onKeyDown={handleKeyPress}
                                                  onBlur={saveEdit}
                                                  autoFocus
                                                  className="h-8 text-xs"
                                                />
                                              ) : (
                                                <span 
                                                  className="text-xs cursor-pointer hover:text-blue-600"
                                                  onClick={() => startEditing(requirement.id, subtask.id, 'actualEndDate', subtask.actualEndDate || '')}
                                                >
                                                  {formatDateTime(subtask.actualEndDate) || '点击设置'}
                                                </span>
                                              )}
                                            </div>

                                            {/* 实际工期 */}
                                            <div className="col-span-1">
                                              {(() => {
                                                let currentDuration = subtask.actualDuration;
                                                let isInProgress = false;
                                                
                                                // 如果任务正在进行中且有开始时间，计算当前已用时间
                                                if (subtask.status === '进行中' && subtask.actualStartDate && !subtask.actualDuration) {
                                                  currentDuration = calculateCurrentDuration(subtask.actualStartDate);
                                                  isInProgress = true;
                                                }
                                                
                                                if (currentDuration) {
                                                  return (
                                                    <div className="flex flex-col">
                                                      <span className={`text-xs font-medium ${isInProgress ? 'text-blue-600' : 'text-gray-800'}`}>
                                                        {currentDuration}h{isInProgress ? '*' : ''}
                                                      </span>
                                                      {subtask.estimatedDuration && (
                                                        <span className={`text-xs ${calculateDurationVariance(subtask.estimatedDuration, currentDuration).color}`}>
                                                          {(() => {
                                                            const variance = calculateDurationVariance(subtask.estimatedDuration, currentDuration);
                                                            if (variance.status === '准时') return isInProgress ? '进行中' : '≈预估';
                                                            const sign = variance.variance > 0 ? '+' : '';
                                                            return `${sign}${variance.variance}h`;
                                                          })()}
                                                        </span>
                                                      )}
                                                    </div>
                                                  );
                                                } else {
                                                  return <span className="text-xs text-gray-600">-</span>;
                                                }
                                              })()}
                                            </div>

                                            {/* 延期状态 */}
                                            <div className="col-span-1">
                                              {(() => {
                                                const delayStatus = calculateDelayStatus(subtask);
                                                return (
                                                  <Badge 
                                                    variant="secondary" 
                                                    className={getDelayStatusColor(delayStatus)}
                                                  >
                                                    {delayStatus}
                                                  </Badge>
                                                );
                                              })()}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
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
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {sortedVersions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gray-100 p-6">
                  <GitBranch className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无版本需求</h3>
                  <p className="text-gray-600 mb-4">
                    当前没有找到匹配的版本需求，请尝试调整筛选条件
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    清除筛选条件
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => insertSubtaskRow(contextMenu.requirementId, contextMenu.subtaskId)}
          >
            <PlusCircle className="h-4 w-4" />
            插入行
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={() => copySubtaskRow(contextMenu.requirementId, contextMenu.subtaskId)}
          >
            <Copy className="h-4 w-4" />
            复制行
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
            onClick={() => deleteSubtaskRow(contextMenu.requirementId, contextMenu.subtaskId)}
          >
            <Trash2 className="h-4 w-4" />
            删除行
          </button>
        </div>
      )}
    </div>
  );
}