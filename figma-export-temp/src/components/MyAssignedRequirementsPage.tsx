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
  estimatedStartDate?: string; // YYYY-MM-DD HH:mm 格式
  estimatedEndDate?: string;   // YYYY-MM-DD HH:mm 格式
  estimatedDuration?: number; // 小时
  actualStartDate?: string;    // YYYY-MM-DD HH:mm 格式
  actualEndDate?: string;      // YYYY-MM-DD HH:mm 格式
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

// 状态选项
const statusOptions = ['待开始', '待原型设计', '原型设计中', '待UI设计', 'UI设计中', '待开发', '开发中', '待测试', '测试中', '待验收', '验收中', '待上线', '已上线'];

// 优先级选项
const priorityOptions = ['低', '中', '高', '紧急'];

// 版本选项
const versionOptions = ['v3.0.0', 'v3.1.0', 'v3.2.0', 'v3.3.0', 'v4.0.0'];

// 子任务状态选项
const subtaskStatusOptions = ['待开始', '进行中', '已完成'];

// 可筛选的列
const filterableColumns = [
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

// 计算时长（小时）
const calculateDuration = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate.replace(' ', 'T'));
  const end = new Date(endDate.replace(' ', 'T'));
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60)); // 转为小时
};

// 计算延期状态
const calculateDelayStatus = (subtask: Subtask): string => {
  if (!subtask.estimatedEndDate) return '-';
  
  const now = new Date();
  const estimatedEnd = new Date(subtask.estimatedEndDate.replace(' ', 'T'));
  
  if (isNaN(estimatedEnd.getTime())) return '-';
  
  if (subtask.status === '已完成') {
    if (subtask.actualEndDate) {
      const actualEnd = new Date(subtask.actualEndDate.replace(' ', 'T'));
      if (!isNaN(actualEnd.getTime())) {
        return actualEnd <= estimatedEnd ? '准时' : '延期';
      }
    }
    return '准时';
  }
  
  // 进行中或未开始的任务
  return now > estimatedEnd ? '延期' : '准时';
};

// 计算当前正在进行任务的时长
const calculateCurrentDuration = (startDate: string): number => {
  const start = new Date(startDate.replace(' ', 'T'));
  const now = new Date();
  
  if (isNaN(start.getTime())) return 0;
  
  const diffMs = now.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60)); // 转为小时
};

// 生成默认子任务
const generateDefaultSubtasks = (requirementId: string): Subtask[] => {
  return defaultSubtaskTypes.map((name, index) => ({
    id: `${requirementId}-subtask-${index + 1}`,
    name,
    type: 'predefined' as const,
    status: '待开始' as const,
    delayStatus: '-' as const,
    estimatedDuration: 0,
    actualDuration: 0,
    department: index === 0 ? mockDepartments[1] :
                index === 1 ? mockDepartments[1] :
                index === 2 ? mockDepartments[2] :
                index === 3 ? mockDepartments[3] :
                index === 4 ? mockDepartments[4] :
                mockDepartments[0]
  }));
};

// 创建张三负责的需求数据 - 筛选出张三作为产品负责人或子任务执行人的需求
const createMyRequirements = (): VersionRequirement[] => {
  const zhangsan = mockUsers[0]; // 张三
  
  const allRequirements: VersionRequirement[] = [
    {
      id: '1',
      title: 'AI智能分析引擎',
      type: 'K线' as const,
      version: 'v3.2.0',
      scheduledVersion: 'v3.2.0',
      status: '开发中' as const,
      priority: '高' as const,
      assignee: zhangsan, // 张三作为需求负责人
      creator: mockUsers[4],
      productManager: zhangsan, // 张三作为产品负责人
      project: mockProjects[0],
      platform: 'Web端',
      description: '基于机器学习的K线趋势预测和智能分析功能',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      createdAt: '2024-05-15 14:30',
      updatedAt: '2024-05-20 16:45',
      tags: ['AI', '智能分析', '机器学习'],
      isOpen: true,
      scheduleReviewLevel1: { status: '已上线' as const, reviewer: mockUsers[3], reviewDate: '2024-05-16 10:30' },
      scheduleReviewLevel2: { status: '已上线' as const, reviewer: mockUsers[4], reviewDate: '2024-05-17 14:20' },
      subtasks: generateDefaultSubtasks('1').map((subtask, index) => ({
        ...subtask,
        status: index === 0 ? '已完成' as const :
                index === 1 ? '已完成' as const :
                index === 2 ? '进行中' as const : // 前端开发进行中，张三执行
                '待开始' as const,
        executor: index === 2 ? zhangsan : undefined, // 张三执行前端开发
        estimatedStartDate: index === 2 ? '2024-06-10 09:00' : undefined,
        estimatedEndDate: index === 2 ? '2024-07-10 18:00' : undefined,
        actualStartDate: index === 2 ? '2024-06-12 09:30' : undefined
      }))
    },
    {
      id: '2',
      title: '用户界面优化升级',
      type: '系统' as const,
      version: 'v2.8.0',
      scheduledVersion: 'v2.8.0',
      status: '开发中' as const,
      priority: '中' as const,
      assignee: mockUsers[1],
      creator: mockUsers[4],
      productManager: zhangsan, // 张三作为产品负责人
      project: mockProjects[3],
      platform: '全平台',
      description: '优化用户界面交互体验，提升操作效率',
      startDate: '2024-05-01',
      endDate: '2024-07-15',
      createdAt: '2024-04-20 11:15',
      updatedAt: '2024-05-25 09:40',
      tags: ['UI', '用户体验', '界面优化'],
      isOpen: true,
      scheduleReviewLevel1: { status: '已上线' as const, reviewer: mockUsers[3], reviewDate: '2024-04-22 15:30' },
      scheduleReviewLevel2: { status: '已上线' as const, reviewer: mockUsers[4], reviewDate: '2024-04-24 10:15' },
      subtasks: generateDefaultSubtasks('2').map((subtask, index) => ({
        ...subtask,
        status: index === 0 ? '已完成' as const :
                index === 1 ? '已完成' as const :
                index === 2 ? '进行中' as const : // 前端开发进行中，张三执行
                index === 3 ? '待开始' as const :
                '待开始' as const,
        executor: index === 2 ? zhangsan : // 张三执行前端开发
                  index === 4 ? zhangsan : undefined, // 张三也负责测试
        estimatedStartDate: index === 2 ? '2024-05-15 09:00' : 
                            index === 4 ? '2024-06-01 09:00' : undefined,
        estimatedEndDate: index === 2 ? '2024-06-15 18:00' : 
                          index === 4 ? '2024-06-10 18:00' : undefined,
        actualStartDate: index === 2 ? '2024-05-16 10:00' : undefined
      }))
    },
    {
      id: '3',
      title: '移动端适配优化',
      type: '聊天室' as const,
      version: 'v1.9.0',
      scheduledVersion: 'v1.9.0',
      status: '测试中' as const,
      priority: '高' as const,
      assignee: mockUsers[2],
      creator: mockUsers[4],
      productManager: mockUsers[5], // 其他人作为产品负责人
      project: mockProjects[2],
      platform: '移动端',
      description: '优化移动端聊天室功能和性能',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      createdAt: '2024-03-20 16:20',
      updatedAt: '2024-05-28 14:35',
      tags: ['移动端', '聊天室', '适配'],
      isOpen: true,
      scheduleReviewLevel1: { status: '已上线' as const, reviewer: mockUsers[3], reviewDate: '2024-03-22 09:45' },
      scheduleReviewLevel2: { status: '已上线' as const, reviewer: mockUsers[4], reviewDate: '2024-03-25 11:20' },
      subtasks: generateDefaultSubtasks('3').map((subtask, index) => ({
        ...subtask,
        status: index <= 3 ? '已完成' as const :
                index === 4 ? '进行中' as const : // 测试进行中，张三执行
                '待开始' as const,
        executor: index === 4 ? zhangsan : undefined, // 张三执行测试
        estimatedStartDate: index === 4 ? '2024-05-20 09:00' : undefined,
        estimatedEndDate: index === 4 ? '2024-06-05 18:00' : undefined,
        actualStartDate: index === 4 ? '2024-05-22 09:15' : undefined
      }))
    },
    {
      id: '4',
      title: '数据安全加密升级',
      type: '系统' as const,
      version: 'v3.0.0',
      scheduledVersion: 'v3.0.0',
      status: '待原型设计' as const,
      priority: '紧急' as const,
      assignee: zhangsan, // 张三作为需求负责人
      creator: mockUsers[4],
      productManager: zhangsan, // 张三作为产品负责人
      project: mockProjects[3],
      platform: '全平台',
      description: '升级数据加密算法，提升系统安全性',
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      createdAt: '2024-06-10 13:45',
      updatedAt: '2024-06-12 10:20',
      tags: ['安全', '加密', '数据保护'],
      isOpen: true,
      scheduleReviewLevel1: { status: '待开始' as const },
      scheduleReviewLevel2: { status: '待开始' as const },
      subtasks: generateDefaultSubtasks('4')
    },
    {
      id: '5',
      title: '交易流程优化',
      type: '交易' as const,
      version: 'v2.5.0',
      scheduledVersion: 'v2.5.0',
      status: '验收中' as const,
      priority: '中' as const,
      assignee: mockUsers[1],
      creator: mockUsers[4],
      productManager: mockUsers[5], // 其他人作为产品负责人
      project: mockProjects[4],
      platform: 'Web端',
      description: '优化交易流程，提升用户交易体验',
      startDate: '2024-03-01',
      endDate: '2024-06-15',
      createdAt: '2024-02-20 09:30',
      updatedAt: '2024-06-01 16:15',
      tags: ['交易', '流程优化', '用户体验'],
      isOpen: true,
      scheduleReviewLevel1: { status: '已上线' as const, reviewer: mockUsers[3], reviewDate: '2024-02-22 14:30' },
      scheduleReviewLevel2: { status: '已上线' as const, reviewer: mockUsers[4], reviewDate: '2024-02-24 11:45' },
      subtasks: generateDefaultSubtasks('5').map((subtask, index) => ({
        ...subtask,
        status: index <= 4 ? '已完成' as const :
                index === 5 ? '进行中' as const : // 产品验收进行中，张三执行
                '待开始' as const,
        executor: index === 5 ? zhangsan : undefined, // 张三执行产品验收
        estimatedStartDate: index === 5 ? '2024-06-01 09:00' : undefined,
        estimatedEndDate: index === 5 ? '2024-06-10 18:00' : undefined,
        actualStartDate: index === 5 ? '2024-06-02 10:00' : undefined
      }))
    }
  ];

  // 筛选出张三负责的需求：张三作为产品负责人 或者 有子任务的执行人是张三
  return allRequirements.filter(req => {
    // 张三是产品负责人
    const isProductManager = req.productManager.id === zhangsan.id;
    
    // 张三是某个子任务的执行人
    const hasSubtaskExecutor = req.subtasks.some(subtask => subtask.executor?.id === zhangsan.id);
    
    return isProductManager || hasSubtaskExecutor;
  });
};

const mockMyRequirements: VersionRequirement[] = createMyRequirements();

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 状态配置
const statusConfig = {
  '待开始': { color: 'bg-gray-100 text-gray-800 border-gray-200' },
  '待原型设计': { color: 'bg-orange-100 text-orange-800 border-orange-200' },
  '原型设计中': { color: 'bg-orange-100 text-orange-800 border-orange-200' },
  '待UI设计': { color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'UI设计中': { color: 'bg-purple-100 text-purple-800 border-purple-200' },
  '待开发': { color: 'bg-blue-100 text-blue-800 border-blue-200' },
  '开发中': { color: 'bg-blue-100 text-blue-800 border-blue-200' },
  '待测试': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  '测试中': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  '待验收': { color: 'bg-green-100 text-green-800 border-green-200' },
  '验收中': { color: 'bg-green-100 text-green-800 border-green-200' },
  '待上线': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  '已上线': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
};

interface MyAssignedRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

export function MyAssignedRequirementsPage({ onNavigate }: MyAssignedRequirementsPageProps) {
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockMyRequirements);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set(['1']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockMyRequirements.map(r => r.version))];
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 列可见性控制
  const toggleColumnVisibility = (column: string) => {
    setHiddenColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  // 排序
  const handleColumnSort = (column: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.column === column) {
        if (prevConfig.direction === 'asc') {
          return { column, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return null; // 取消排序
        }
      }
      return { column, direction: 'asc' };
    });
  };

  // 获取排序图标
  const getSortIcon = (column: string) => {
    if (sortConfig?.column === column) {
      return sortConfig.direction === 'asc' ? 
        <ArrowUp className="h-3 w-3" /> : 
        <ArrowDown className="h-3 w-3" />;
    }
    return null;
  };

  // 自定义筛选应用逻辑
  const applyCustomFilters = (requirement: VersionRequirement, filters: FilterCondition[]): boolean => {
    if (filters.length === 0) return true;
    
    return filters.every(filter => {
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
        case 'type':
          fieldValue = requirement.type;
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

  // 展开/收起版本组
  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  // 展开/收起需求
  const toggleRequirementExpansion = (requirementId: string) => {
    setExpandedRequirements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requirementId)) {
        newSet.delete(requirementId);
      } else {
        newSet.add(requirementId);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(sortedRequirements.map(req => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  // 单选
  const handleSelectRequirement = (requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements(prev => [...prev, requirementId]);
    } else {
      setSelectedRequirements(prev => prev.filter(id => id !== requirementId));
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

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 获取我的角色显示
  const getMyRole = (requirement: VersionRequirement): string => {
    const zhangsan = mockUsers[0];
    const roles = [];
    
    if (requirement.productManager.id === zhangsan.id) {
      roles.push('产品负责人');
    }
    
    const executingSubtasks = requirement.subtasks.filter(subtask => subtask.executor?.id === zhangsan.id);
    if (executingSubtasks.length > 0) {
      roles.push(`子任务执行人`);
    }
    
    return roles.join(', ');
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
        source: 'my-assigned'
      });
    }
  };

  const handleRequirementTitleClick = (requirement: VersionRequirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', {
        requirementId: requirement.id,
        source: 'my-assigned'
      });
    }
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

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1>我负责的</h1>
              <p className="text-muted-foreground mt-1">
                我作为产品负责人或子任务执行人的所有需求和子任务，支持智能筛选和高级管理功能
              </p>
            </div>
          </div>

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
                        { key: 'creator', label: '创建人' },
                        { key: 'version', label: '版本号' }
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
                          <Label className="cursor-pointer flex-1">{column.label}</Label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 筛选设置 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-4 w-4 mr-2" />
                        筛选设置
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
                      {[
                        { value: 'title', label: '需求标题' },
                        { value: 'status', label: '状态' },
                        { value: 'priority', label: '优先级' },
                        { value: 'productManager', label: '产品负责人' },
                        { value: 'creator', label: '创建人' },
                        { value: 'version', label: '版本' }
                      ].map((column) => (
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
                              className={`badge-unified ${getStatusColor(status)}`}
                            >
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                        
                        <Badge variant="outline" className="badge-unified text-blue-600 border-blue-200">
                          {version}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="p-0 border-t">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                groupedByVersion[version].length > 0 &&
                                groupedByVersion[version].every(req => selectedRequirements.includes(req.id))
                              }
                              onCheckedChange={(checked) => {
                                const versionRequirementIds = groupedByVersion[version].map(req => req.id);
                                if (checked) {
                                  setSelectedRequirements(prev => [
                                    ...prev.filter(id => !versionRequirementIds.includes(id)),
                                    ...versionRequirementIds
                                  ]);
                                } else {
                                  setSelectedRequirements(prev => 
                                    prev.filter(id => !versionRequirementIds.includes(id))
                                  );
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
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
                                                    <span className={`text-xs ${isInProgress ? 'text-blue-600' : 'text-gray-600'}`}>
                                                      {currentDuration}h{isInProgress ? ' (进行中)' : ''}
                                                    </span>
                                                  );
                                                }
                                                return <span className="text-xs text-gray-400">-</span>;
                                              })()}
                                            </div>

                                            {/* 延期状态 */}
                                            <div className="col-span-1">
                                              <Badge 
                                                variant="outline" 
                                                className={`text-xs ${
                                                  subtask.delayStatus === '延期' ? 'bg-red-100 text-red-800 border-red-200' :
                                                  subtask.delayStatus === '准时' ? 'bg-green-100 text-green-800 border-green-200' :
                                                  subtask.delayStatus === '提前' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                  'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}
                                              >
                                                {subtask.delayStatus}
                                              </Badge>
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
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="px-2 py-1.5 text-sm font-semibold">子任务操作</div>
          <div className="h-px bg-border" />
          <button
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setContextMenu(null)}
          >
            在上方插入行
          </button>
          <button
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setContextMenu(null)}
          >
            在下方插入行
          </button>
          <button
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setContextMenu(null)}
          >
            复制行
          </button>
          <div className="h-px bg-border" />
          <button
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-destructive"
            onClick={() => setContextMenu(null)}
          >
            删除行
          </button>
        </div>
      )}
    </div>
  );
}