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
  PlusCircle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  estimatedDuration?: number; // 预估耗时（小时）
  actualStartDate?: string;
  actualEndDate?: string;
  actualDuration?: number; // 实际耗时（小时）
  status: '未开始' | '进行中' | '已完成' | '已暂停';
  delayStatus: '准时' | '延期' | '提前' | '未知'; // 延期状态
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
  status: '待原型设计' | '原型设计中' | '待UI设计' | 'UI设计中' | '待开发' | '开发中' | '待测试' | '测试中' | '待验收' | '验收中' | '已完成' | '已发布' | '已暂停';
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
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' }
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
  { id: '5', name: '测试部' }
];

const defaultSubtaskTypes = [
  '原型设计',
  '视觉设计', 
  '前端开发这是一个很长的任务名称用来测试是否会导致表格列错位的问题',
  '后端开发',
  '测试',
  '产品验收'
];

// 生成默认子任务
const generateDefaultSubtasks = (requirementId: string): Subtask[] => {
  return defaultSubtaskTypes.map((name, index) => ({
    id: `${requirementId}-subtask-${index + 1}`,
    name,
    type: 'predefined' as const,
    status: '未开始' as const,
    delayStatus: '未知' as const,
    estimatedDuration: 0,
    actualDuration: 0,
    // 分配默认部门
    department: index === 0 ? mockDepartments[1] : // 原型设计 -> 设计部
                index === 1 ? mockDepartments[1] : // 视觉设计 -> 设计部
                index === 2 ? mockDepartments[2] : // 前端开发 -> 前端开发部
                index === 3 ? mockDepartments[3] : // 后端开发 -> 后端开发部
                index === 4 ? mockDepartments[4] : // 测试 -> 测试部
                mockDepartments[0] // 产品验收 -> 产品部
  }));
};

// 创建带有自动计算状态的需求数据
const createMockRequirements = (): VersionRequirement[] => {
  // 先创建基础数据
  const baseRequirements = [
    {
      id: '1',
      title: 'AI智能分析引擎',
      type: 'K线' as const,
      version: 'v3.2.0',
      scheduledVersion: 'v3.2.0',
      status: '规划中' as const,
      priority: '高' as const,
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
      scheduleReviewLevel1: { status: '未开始' as const },
      scheduleReviewLevel2: { status: '未开始' as const },
      subtasks: generateDefaultSubtasks('1')
    },
    {
      id: '2',
      title: 'K线图优化升级',
      type: 'K线' as const,
      version: 'v3.1.0',
      scheduledVersion: 'v3.1.0',
      status: '待原型设计' as const,
      priority: '高' as const,
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
      scheduleReviewLevel1: { status: '已完成' as const, reviewer: mockUsers[3], reviewDate: '2024-03-20 11:30' },
      scheduleReviewLevel2: { status: '已完成' as const, reviewer: mockUsers[4], reviewDate: '2024-03-22 15:45' },
      subtasks: generateDefaultSubtasks('2').map((subtask, index) => ({
        ...subtask,
        // 设置不同阶段状态来展示状态自动计算 - 开发完成，测试未开始，应显示"待测试"
        status: index === 0 ? '已完成' as const : // 原型设计已完成
                index === 1 ? '已完成' as const : // 视觉设计已完成  
                index === 2 ? '已完成' as const : // 前端开发已完成
                index === 3 ? '已完成' as const : // 后端开发已完成
                index === 4 ? '未开始' as const : // 测试未开始 (应该显示"待测试")
                '未开始' as const, // 产品验收未开始
        estimatedStartDate: index === 2 ? '2024-04-15T09:00' : undefined,
        estimatedEndDate: index === 2 ? '2024-04-25T18:00' : undefined,
        actualStartDate: index === 2 ? '2024-04-16T09:30' : undefined,
        actualEndDate: index === 2 ? '2024-04-28T17:30' : undefined,
        // 预先计算耗时和延期状态（将在初始化时重新计算）
        estimatedDuration: index === 2 ? 0 : 0, // 将在初始化时计算
        actualDuration: index === 2 ? 0 : 0, // 将在初始化时计算
        executor: index === 2 ? mockUsers[0] : undefined
      }))
    },
    {
      id: '3',
      title: '聊天室实时消息优化',
      type: '聊天室' as const,
      version: 'v2.1.0',
      scheduledVersion: 'v2.1.0',
      status: '测试中' as const,
      priority: '中' as const,
      assignee: mockUsers[2],
      creator: mockUsers[4],
      productManager: mockUsers[5],
      project: mockProjects[2],
      platform: '移动端',
      description: '优化聊天室消息发送速度和稳定性',
      startDate: '2024-03-01',
      endDate: '2024-04-30',
      createdAt: '2024-02-15 10:30',
      updatedAt: '2024-03-25 14:20',
      tags: ['聊天', '实时', '性能'],
      isOpen: true,
      scheduleReviewLevel1: { status: '已完成' as const, reviewer: mockUsers[3], reviewDate: '2024-02-20 09:15' },
      scheduleReviewLevel2: { status: '已完成' as const, reviewer: mockUsers[4], reviewDate: '2024-02-22 16:30' },
      subtasks: generateDefaultSubtasks('3').map((subtask, index) => ({
        ...subtask,
        // 设置测试进行中状态 - 应显示"测试中"
        status: index <= 3 ? '已完成' as const : // 设计和开发已完成
                index === 4 ? '进行中' as const : // 测试进行中
                '未开始' as const, // 产品验收未开始
        executor: index === 4 ? mockUsers[2] : undefined
      }))
    },
    {
      id: '4',
      title: '交易系统风控优化',
      type: '交易' as const,
      version: 'v4.0.0',
      scheduledVersion: 'v4.0.0',
      status: 'UI设计中' as const,
      priority: '紧急' as const,
      assignee: mockUsers[3],
      creator: mockUsers[4],
      productManager: mockUsers[5],
      project: mockProjects[4],
      platform: 'PC端',
      description: '优化交易系统风控规则和用户体验',
      startDate: '2024-05-01',
      endDate: '2024-06-30',
      createdAt: '2024-04-10 09:15',
      updatedAt: '2024-04-25 11:40',
      tags: ['交易', '风控', '安全'],
      isOpen: false,
      scheduleReviewLevel1: { status: '已完成' as const, reviewer: mockUsers[3], reviewDate: '2024-04-12 14:20' },
      scheduleReviewLevel2: { status: '进行中' as const, reviewer: mockUsers[4] },
      subtasks: generateDefaultSubtasks('4').map((subtask, index) => ({
        ...subtask,
        // 设置原型完成，UI设计进行中状态 - 应显示"UI设计中"
        status: index === 0 ? '已完成' as const : // 原型设计已完成
                index === 1 ? '进行中' as const : // 视觉设计进行中
                '未开始' as const, // 其他未开始
        executor: index === 1 ? mockUsers[2] : undefined
      }))
    },
    {
      id: '5',
      title: '行情数据实时推送',
      type: '行情' as const,
      version: 'v1.5.0',
      scheduledVersion: 'v1.5.0',
      status: '原型设计中' as const,
      priority: '中' as const,
      assignee: mockUsers[0],
      creator: mockUsers[4],
      productManager: mockUsers[5],
      project: mockProjects[1],
      platform: '全平台',
      description: '实现实时行情数据推送和展示功能',
      startDate: '2024-06-01',
      endDate: '2024-07-31',
      createdAt: '2024-05-20 16:30',
      updatedAt: '2024-05-22 10:15',
      tags: ['行情', '实时', '数据'],
      isOpen: false,
      scheduleReviewLevel1: { status: '未开始' as const },
      scheduleReviewLevel2: { status: '未开始' as const },
      subtasks: generateDefaultSubtasks('5').map((subtask, index) => ({
        ...subtask,
        // 设置原型设计进行中状态 - 应显示"原型设计中"
        status: index === 0 ? '进行中' as const : // 原型设计进行中
                '未开始' as const, // 其他未开始
        executor: index === 0 ? mockUsers[3] : undefined
      }))
    }
  ];

  // 需要将calculateRequirementStatus函数移到这里使用，或者在组件内部处理
  return baseRequirements;
};

const mockVersionRequirements: VersionRequirement[] = createMockRequirements();

export function VersionRequirementsPageWithSubtasksTable({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set(['2']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [selectedVersion, setSelectedVersion] = useState('全部');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; requirementId: string; subtaskId: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ requirementId: string; subtaskId: string; field: string } | null>(null);

  // 计算耗时（小时）
  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  };

  // 计算延期状态
  const calculateDelayStatus = (estimatedEndDate: string, actualEndDate: string, status?: string): string => {
    if (!estimatedEndDate) return '未知';
    
    const estimated = new Date(estimatedEndDate);
    const now = new Date();
    
    // 如果有实际结束时间，比较实际和预估
    if (actualEndDate) {
      const actual = new Date(actualEndDate);
      if (actual > estimated) return '延期';
      if (actual < estimated) return '提前';
      return '准时';
    }
    
    // 如果任务已完成但没有实际结束时间，使用当前时间判断
    if (status === '已完成') {
      if (now > estimated) return '延期';
      if (now < estimated) return '提前';
      return '准时';
    }
    
    // 如果任务进行中且已超过预估结束时间
    if (status === '进行中' && now > estimated) {
      return '延期';
    }
    
    // 其他情况返回未知
    return '未知';
  };

  // 重新计算子任务的所有自动字段
  const recalculateSubtaskFields = (subtask: Subtask): Subtask => {
    const updated = { ...subtask };
    
    // 自动计算预估耗时
    if (updated.estimatedStartDate && updated.estimatedEndDate) {
      updated.estimatedDuration = calculateDuration(
        updated.estimatedStartDate, 
        updated.estimatedEndDate
      );
    } else {
      updated.estimatedDuration = 0;
    }
    
    // 自动计算实际耗时
    if (updated.actualStartDate && updated.actualEndDate) {
      updated.actualDuration = calculateDuration(
        updated.actualStartDate, 
        updated.actualEndDate
      );
    } else {
      updated.actualDuration = 0;
    }
    
    // 自动计算延期状态
    if (updated.estimatedEndDate) {
      updated.delayStatus = calculateDelayStatus(
        updated.estimatedEndDate, 
        updated.actualEndDate || '', 
        updated.status
      );
    } else {
      updated.delayStatus = '未知';
    }
    
    return updated;
  };

  // 根据子任务状态自动计算需求状态
  const calculateRequirementStatus = (subtasks: Subtask[]): string => {
    if (!subtasks || subtasks.length === 0) {
      return '待原型设计';
    }

    // 定义任务阶段映射 - 更精确的任务类型识别
    const getTaskPhase = (taskName: string): string => {
      if (taskName.includes('原型设计') || taskName === '原型设计') {
        return 'prototype';
      }
      if (taskName.includes('视觉设计') || taskName.includes('UI设计') || taskName === '视觉设计') {
        return 'ui';
      }
      if (taskName.includes('开发') || taskName.includes('前端') || taskName.includes('后端') || taskName.includes('数据')) {
        return 'development';
      }
      if (taskName.includes('测试')) {
        return 'testing';
      }
      if (taskName.includes('验收') || taskName.includes('产品验收')) {
        return 'acceptance';
      }
      return 'other';
    };

    // 统计各阶段状态
    const phaseStatus = {
      prototype: { completed: 0, inProgress: 0, total: 0, notStarted: 0 },
      ui: { completed: 0, inProgress: 0, total: 0, notStarted: 0 },
      development: { completed: 0, inProgress: 0, total: 0, notStarted: 0 },
      testing: { completed: 0, inProgress: 0, total: 0, notStarted: 0 },
      acceptance: { completed: 0, inProgress: 0, total: 0, notStarted: 0 }
    };

    // 分析所有子任务状态
    subtasks.forEach(subtask => {
      const phase = getTaskPhase(subtask.name);
      if (phaseStatus[phase]) {
        phaseStatus[phase].total++;
        if (subtask.status === '已完成') {
          phaseStatus[phase].completed++;
        } else if (subtask.status === '进行中') {
          phaseStatus[phase].inProgress++;
        } else if (subtask.status === '未开始') {
          phaseStatus[phase].notStarted++;
        }
      }
    });

    // 按阶段顺序判断状态
    
    // 1. 检查是否全部完成
    const allCompleted = subtasks.every(task => task.status === '已完成');
    if (allCompleted) {
      return '已完成';
    }

    // 2. 验收阶段
    if (phaseStatus.acceptance.total > 0) {
      if (phaseStatus.acceptance.inProgress > 0) {
        return '验收中';
      }
      // 如果测试全部完成且验收未开始，则为待验收
      if (phaseStatus.testing.total > 0 && 
          phaseStatus.testing.completed === phaseStatus.testing.total &&
          phaseStatus.acceptance.notStarted === phaseStatus.acceptance.total) {
        return '待验收';
      }
    }

    // 3. 测试阶段
    if (phaseStatus.testing.total > 0) {
      if (phaseStatus.testing.inProgress > 0) {
        return '测试中';
      }
      // 如果开发全部完成且测试未开始，则为待测试
      if (phaseStatus.development.total > 0 && 
          phaseStatus.development.completed === phaseStatus.development.total &&
          phaseStatus.testing.notStarted === phaseStatus.testing.total) {
        return '待测试';
      }
    }

    // 4. 开发阶段
    if (phaseStatus.development.total > 0) {
      if (phaseStatus.development.inProgress > 0) {
        return '开发中';
      }
      // 如果UI设计全部完成且开发未开始，则为待开发
      if (phaseStatus.ui.total > 0 && 
          phaseStatus.ui.completed === phaseStatus.ui.total &&
          phaseStatus.development.notStarted === phaseStatus.development.total) {
        return '待开发';
      }
    }

    // 5. UI设计阶段
    if (phaseStatus.ui.total > 0) {
      if (phaseStatus.ui.inProgress > 0) {
        return 'UI设计中';
      }
      // 如果原型设计全部完成且UI设计未开始，则为待UI设计
      if (phaseStatus.prototype.total > 0 && 
          phaseStatus.prototype.completed === phaseStatus.prototype.total &&
          phaseStatus.ui.notStarted === phaseStatus.ui.total) {
        return '待UI设计';
      }
    }

    // 6. 原型设计阶段
    if (phaseStatus.prototype.total > 0) {
      if (phaseStatus.prototype.inProgress > 0) {
        return '原型设计中';
      }
      if (phaseStatus.prototype.notStarted === phaseStatus.prototype.total) {
        return '待原型设计';
      }
    }

    // 默认状态 - 如果没有明确的阶段划分，根据整体进度判断
    const hasInProgress = subtasks.some(task => task.status === '进行中');
    const hasCompleted = subtasks.some(task => task.status === '已完成');
    
    if (hasInProgress) {
      // 如果有进行中的任务，尝试识别具体阶段
      const inProgressTasks = subtasks.filter(task => task.status === '进行中');
      const firstInProgressTask = inProgressTasks[0];
      const phase = getTaskPhase(firstInProgressTask.name);
      
      switch (phase) {
        case 'prototype': return '原型设计中';
        case 'ui': return 'UI设计中';
        case 'development': return '开发中';
        case 'testing': return '测试中';
        case 'acceptance': return '验收中';
        default: return '开发中'; // 默认为开发中
      }
    }

    // 如果有已完成的任务但没有进行中的，判断下一个应该开始的阶段
    if (hasCompleted) {
      // 简化逻辑：如果有任务已完成，默认处于开发阶段
      return '开发中';
    }

    // 完全没有开始，默认待原型设计
    return '待原型设计';
  };

  // 在组件初始化时计算所有需求的正确状态和子任务自动字段
  useEffect(() => {
    setRequirements(prev => 
      prev.map(req => {
        // 重新计算所有子任务的自动字段
        const recalculatedSubtasks = req.subtasks.map(subtask => recalculateSubtaskFields(subtask));
        
        return {
          ...req,
          subtasks: recalculatedSubtasks,
          status: calculateRequirementStatus(recalculatedSubtasks)
        };
      })
    );
  }, []);

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
  const getPriorityColor = (priority: string): string => {
    const colors = {
      '紧急': 'bg-red-100 text-red-800 border-red-200',
      '高': 'bg-orange-100 text-orange-800 border-orange-200',
      '中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '低': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 统一的状态颜色样式（需求状态和子任务状态使用相同样式）
  const getStatusColor = (status: string): string => {
    const colors = {
      // 子任务状态
      '未开始': 'bg-gray-100 text-gray-800 border-gray-200',
      '进行中': 'bg-blue-100 text-blue-800 border-blue-200',
      '已完成': 'bg-green-100 text-green-800 border-green-200',
      '已暂停': 'bg-red-100 text-red-800 border-red-200',
      
      // 需求总进度状态 - 设计阶段
      '待原型设计': 'bg-slate-100 text-slate-800 border-slate-200',
      '原型设计中': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '待UI设计': 'bg-slate-100 text-slate-800 border-slate-200',
      'UI设计中': 'bg-purple-100 text-purple-800 border-purple-200',
      
      // 需求总进度状态 - 开发阶段
      '待开发': 'bg-slate-100 text-slate-800 border-slate-200',
      '开发中': 'bg-blue-100 text-blue-800 border-blue-200',
      
      // 需求总进度状态 - 测试阶段
      '待测试': 'bg-slate-100 text-slate-800 border-slate-200',
      '测试中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      
      // 需求总进度状态 - 验收阶段
      '待验收': 'bg-slate-100 text-slate-800 border-slate-200',
      '验收中': 'bg-orange-100 text-orange-800 border-orange-200',
      
      // 需求总进度状态 - 完成状态
      '已发布': 'bg-emerald-100 text-emerald-800 border-emerald-200'
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

  // 格式化时间为datetime-local格式
  const formatDateTimeLocal = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  };

  // 格式化显示时间
  const formatDisplayTime = (dateString?: string): string => {
    if (!dateString) return '点击设置';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
    } catch (error) {
      return '点击设置';
    }
  };

  // 更新子任务字段
  const updateSubtaskField = (requirementId: string, subtaskId: string, field: string, value: any) => {
    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const updatedSubtasks = req.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              const updatedSubtask = { ...subtask, [field]: value };
              
              // 重新计算所有自动字段
              return recalculateSubtaskFields(updatedSubtask);
            }
            return subtask;
          });

          // 根据子任务状态自动更新需求状态
          const newRequirementStatus = calculateRequirementStatus(updatedSubtasks);

          return {
            ...req,
            subtasks: updatedSubtasks,
            status: newRequirementStatus,
            updatedAt: new Date().toLocaleString('zh-CN', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            }).replace(/\//g, '-')
          };
        }
        return req;
      })
    );
  };

  // 右键菜单处理
  const handleRightClick = (e: React.MouseEvent, requirementId: string, subtaskId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      requirementId,
      subtaskId
    });
  };

  // 添加子任务
  const handleAddSubtask = (requirementId: string, afterSubtaskId?: string) => {
    const newSubtaskId = `${requirementId}-subtask-${Date.now()}`;
    const newSubtask: Subtask = {
      id: newSubtaskId,
      name: '新子任务',
      type: 'custom',
      status: '未开始',
      delayStatus: '未知',
      estimatedDuration: 0,
      actualDuration: 0
    };

    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const updatedSubtasks = afterSubtaskId 
            ? req.subtasks.reduce((acc, subtask) => {
                acc.push(subtask);
                if (subtask.id === afterSubtaskId) {
                  acc.push(recalculateSubtaskFields(newSubtask));
                }
                return acc;
              }, [] as Subtask[])
            : [...req.subtasks, recalculateSubtaskFields(newSubtask)];

          return {
            ...req,
            subtasks: updatedSubtasks,
            status: calculateRequirementStatus(updatedSubtasks)
          };
        }
        return req;
      })
    );
  };

  // 创建时间输入组件
  const TimeInputCell = ({ 
    value, 
    onSave, 
    placeholder = '点击设置',
    className = '' 
  }: { 
    value?: string; 
    onSave: (value: string) => void; 
    placeholder?: string;
    className?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState('');
    
    const handleClick = () => {
      setTempValue(formatDateTimeLocal(value));
      setIsEditing(true);
    };

    const handleSave = () => {
      onSave(tempValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="datetime-local"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        </div>
      );
    }

    return (
      <div 
        className={`cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6 ${className}`}
        onClick={handleClick}
      >
        {value ? formatDisplayTime(value) : placeholder}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">版本需求管理</h1>
      </div>
      
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-4 items-center bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索需求标题、描述、标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="选择版本" />
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
            <SelectValue placeholder="需求类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部类型</SelectItem>
            <SelectItem value="K线">K线</SelectItem>
            <SelectItem value="行情">行情</SelectItem>
            <SelectItem value="聊天室">聊天室</SelectItem>
            <SelectItem value="系统">系统</SelectItem>
            <SelectItem value="交易">交易</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="总进度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部状态</SelectItem>
            <SelectItem value="待原型设计">待原型设计</SelectItem>
            <SelectItem value="原型设计中">原型设计中</SelectItem>
            <SelectItem value="待UI设计">待UI设计</SelectItem>
            <SelectItem value="UI设计中">UI设计中</SelectItem>
            <SelectItem value="待开发">待开发</SelectItem>
            <SelectItem value="开发中">开发中</SelectItem>
            <SelectItem value="待测试">待测试</SelectItem>
            <SelectItem value="测试中">测试中</SelectItem>
            <SelectItem value="待验收">待验收</SelectItem>
            <SelectItem value="验收中">验收中</SelectItem>
            <SelectItem value="已完成">已完成</SelectItem>
            <SelectItem value="已发布">已发布</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* 需求列表 */}
      <div className="space-y-4">
        {sortedVersions.map(version => (
          <Card key={version} className="shadow-sm">
            <div className="border-b border-border/50 bg-muted/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-medium">{version}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {groupedRequirements[version].length} 个需求
                  </Badge>
                </div>
              </div>
            </div>
            
            <CardContent className="p-0">
              {groupedRequirements[version].map((requirement) => (
                <div key={requirement.id} className="border-b border-border/30 last:border-b-0">
                  {/* 需求基本信息行 */}
                  <div className="px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* 展开/收起按钮 */}
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
                        
                        {/* 需求标题 - 修改为仅显示标题 */}
                        <div className="flex-1">
                          <div 
                            className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                            onClick={() => handleRequirementTitleClick(requirement)}
                          >
                            {requirement.title}
                          </div>
                        </div>
                        
                        {/* 右侧信息 */}
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(requirement.priority)}>
                            {requirement.priority}
                          </Badge>
                          
                          <Badge className={getStatusColor(requirement.status)}>
                            {requirement.status}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                {requirement.type}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'type', 'K线')}>
                                K线
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'type', '行情')}>
                                行情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'type', '聊天室')}>
                                聊天室
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'type', '系统')}>
                                系统
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'type', '交易')}>
                                交易
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                {requirement.platform || '未设置'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'platform', 'Web端')}>
                                Web端
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'platform', '移动端')}>
                                移动端
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'platform', '全平台')}>
                                全平台
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'platform', 'PC端')}>
                                PC端
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRequirementField(requirement.id, 'platform', '小程序')}>
                                小程序
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <div className="text-sm text-muted-foreground">
                            {requirement.assignee.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 子任务表格 */}
                  {expandedRequirements.has(requirement.id) && (
                    <div className="px-6 pb-4">
                      <div className="bg-muted/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">子任务列表</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddSubtask(requirement.id)}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            添加子任务
                          </Button>
                        </div>
                        
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-8"></TableHead>
                                <TableHead className="w-60">任务名称</TableHead>
                                <TableHead className="w-24">状态</TableHead>
                                <TableHead className="w-20">部门</TableHead>
                                <TableHead className="w-32">预估开始时间</TableHead>
                                <TableHead className="w-32">预估结束时间</TableHead>
                                <TableHead className="w-20">预估耗时(h)</TableHead>
                                <TableHead className="w-32">实际开始时间</TableHead>
                                <TableHead className="w-32">实际结束时间</TableHead>
                                <TableHead className="w-20">实际耗时(h)</TableHead>
                                <TableHead className="w-20">延期状态</TableHead>
                                <TableHead className="w-16">操作</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {requirement.subtasks.map((subtask, index) => (
                                <TableRow 
                                  key={subtask.id} 
                                  className="hover:bg-muted/30"
                                  onContextMenu={(e) => handleRightClick(e, requirement.id, subtask.id)}
                                >
                                  <TableCell className="text-center text-xs text-muted-foreground">
                                    {index + 1}
                                  </TableCell>
                                  
                                  <TableCell className="w-60">
                                    {editingCell?.requirementId === requirement.id && 
                                     editingCell?.subtaskId === subtask.id && 
                                     editingCell?.field === 'name' ? (
                                      <Input
                                        value={subtask.name}
                                        onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'name', e.target.value)}
                                        onBlur={() => setEditingCell(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') setEditingCell(null);
                                        }}
                                        className="h-8 w-full"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6 w-60 break-words whitespace-normal leading-relaxed"
                                        onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'name' })}
                                      >
                                        {subtask.name}
                                      </div>
                                    )}
                                  </TableCell>
                                  
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger>
                                        <Badge className={`cursor-pointer ${getStatusColor(subtask.status)}`}>
                                          {subtask.status}
                                        </Badge>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => updateSubtaskField(requirement.id, subtask.id, 'status', '未开始')}>
                                          未开始
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateSubtaskField(requirement.id, subtask.id, 'status', '进行中')}>
                                          进行中
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateSubtaskField(requirement.id, subtask.id, 'status', '已完成')}>
                                          已完成
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateSubtaskField(requirement.id, subtask.id, 'status', '已暂停')}>
                                          已暂停
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                  
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                          {subtask.department?.name || '未分配'}
                                        </Badge>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        {mockDepartments.map(dept => (
                                          <DropdownMenuItem 
                                            key={dept.id} 
                                            onClick={() => updateSubtaskField(requirement.id, subtask.id, 'department', dept)}
                                          >
                                            {dept.name}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                  
                                  <TableCell>
                                    <TimeInputCell
                                      value={subtask.estimatedStartDate}
                                      onSave={(value) => updateSubtaskField(requirement.id, subtask.id, 'estimatedStartDate', value)}
                                      placeholder="点击设置"
                                      className="text-xs"
                                    />
                                  </TableCell>
                                  
                                  <TableCell>
                                    <TimeInputCell
                                      value={subtask.estimatedEndDate}
                                      onSave={(value) => updateSubtaskField(requirement.id, subtask.id, 'estimatedEndDate', value)}
                                      placeholder="点击设置"
                                      className="text-xs"
                                    />
                                  </TableCell>
                                  
                                  <TableCell className="text-center text-xs">
                                    {subtask.estimatedDuration || 0}
                                  </TableCell>
                                  
                                  <TableCell>
                                    <TimeInputCell
                                      value={subtask.actualStartDate}
                                      onSave={(value) => updateSubtaskField(requirement.id, subtask.id, 'actualStartDate', value)}
                                      placeholder="点击设置"
                                      className="text-xs"
                                    />
                                  </TableCell>
                                  
                                  <TableCell>
                                    <TimeInputCell
                                      value={subtask.actualEndDate}
                                      onSave={(value) => updateSubtaskField(requirement.id, subtask.id, 'actualEndDate', value)}
                                      placeholder="点击设置"
                                      className="text-xs"
                                    />
                                  </TableCell>
                                  
                                  <TableCell className="text-center text-xs">
                                    {subtask.actualDuration || 0}
                                  </TableCell>
                                  
                                  <TableCell>
                                    <Badge className={`${getDelayStatusColor(subtask.delayStatus)} text-xs`}>
                                      {subtask.delayStatus}
                                    </Badge>
                                  </TableCell>
                                  
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleAddSubtask(requirement.id, subtask.id)}>
                                          <PlusCircle className="h-3 w-3 mr-2" />
                                          插入子任务
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredRequirements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无符合条件的需求</p>
        </div>
      )}
      
      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-32"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                handleAddSubtask(contextMenu.requirementId, contextMenu.subtaskId);
                setContextMenu(null);
              }}
            >
              <PlusCircle className="h-3 w-3" />
              在下方插入
            </button>
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                setContextMenu(null);
              }}
            >
              <Copy className="h-3 w-3" />
              复制行
            </button>
            <button
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
              onClick={() => {
                setContextMenu(null);
              }}
            >
              <Trash2 className="h-3 w-3" />
              删除行
            </button>
          </div>
        </>
      )}
    </div>
  );
}