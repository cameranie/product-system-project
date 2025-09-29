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
                index === 2 ? '已完成' as const : // 前端��发已完成
                index === 3 ? '已完成' as const : // 后端开发已完成
                index === 4 ? '未开始' as const : // 测试未开始 (应该显示"待测试")
                '未开始' as const, // 产品验收未开始
        estimatedStartDate: index === 2 ? '2024-04-15T09:00' : undefined,
        estimatedEndDate: index === 2 ? '2024-04-25T18:00' : undefined,
        actualStartDate: index === 2 ? '2024-04-16T09:30' : undefined,
        actualEndDate: index === 2 ? '2024-04-28T17:30' : undefined,
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

  // 在组件初始化时计算所有需求的正确状态
  useEffect(() => {
    setRequirements(prev => 
      prev.map(req => ({
        ...req,
        status: calculateRequirementStatus(req.subtasks)
      }))
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
  const calculateDelayStatus = (estimatedEndDate: string, actualEndDate: string): string => {
    if (!estimatedEndDate) return '未知';
    if (!actualEndDate) return '未知';
    
    const estimated = new Date(estimatedEndDate);
    const actual = new Date(actualEndDate);
    
    if (actual > estimated) return '延期';
    if (actual < estimated) return '提前';
    return '准时';
  };

  // 更新子任务字段
  const updateSubtaskField = (requirementId: string, subtaskId: string, field: string, value: any) => {
    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const updatedSubtasks = req.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              const updatedSubtask = { ...subtask, [field]: value };
              
              // 自动计算预估耗时
              if (field === 'estimatedStartDate' || field === 'estimatedEndDate') {
                if (updatedSubtask.estimatedStartDate && updatedSubtask.estimatedEndDate) {
                  updatedSubtask.estimatedDuration = calculateDuration(
                    updatedSubtask.estimatedStartDate, 
                    updatedSubtask.estimatedEndDate
                  );
                }
              }
              
              // 自动计算实际耗时
              if (field === 'actualStartDate' || field === 'actualEndDate') {
                if (updatedSubtask.actualStartDate && updatedSubtask.actualEndDate) {
                  updatedSubtask.actualDuration = calculateDuration(
                    updatedSubtask.actualStartDate, 
                    updatedSubtask.actualEndDate
                  );
                }
              }
              
              // 自动计算延期状态
              if (field === 'estimatedEndDate' || field === 'actualEndDate') {
                if (updatedSubtask.estimatedEndDate && updatedSubtask.actualEndDate) {
                  updatedSubtask.delayStatus = calculateDelayStatus(
                    updatedSubtask.estimatedEndDate, 
                    updatedSubtask.actualEndDate
                  );
                }
              }
              
              return updatedSubtask;
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
                  acc.push(newSubtask);
                }
                return acc;
              }, [] as Subtask[])
            : [...req.subtasks, newSubtask];

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

  // 复制子任务行
  const handleCopySubtask = (requirementId: string, subtaskId: string) => {
    const requirement = requirements.find(req => req.id === requirementId);
    const subtask = requirement?.subtasks.find(st => st.id === subtaskId);
    
    if (subtask) {
      const newSubtaskId = `${requirementId}-subtask-${Date.now()}`;
      const copiedSubtask: Subtask = {
        ...subtask,
        id: newSubtaskId,
        name: `${subtask.name} (副本)`,
        type: 'custom'
      };

      setRequirements(prev => 
        prev.map(req => {
          if (req.id === requirementId) {
            const updatedSubtasks = req.subtasks.reduce((acc, st) => {
              acc.push(st);
              if (st.id === subtaskId) {
                acc.push(copiedSubtask);
              }
              return acc;
            }, [] as Subtask[]);

            return {
              ...req,
              subtasks: updatedSubtasks,
              status: calculateRequirementStatus(updatedSubtasks)
            };
          }
          return req;
        })
      );
    }
  };

  // 在指定位置插入新行
  const handleInsertSubtask = (requirementId: string, targetSubtaskId: string, position: 'above' | 'below') => {
    const newSubtaskId = `${requirementId}-subtask-${Date.now()}`;
    const newSubtask: Subtask = {
      id: newSubtaskId,
      name: '新插入任务',
      type: 'custom',
      status: '未开始',
      delayStatus: '未知',
      estimatedDuration: 0,
      actualDuration: 0
    };

    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const updatedSubtasks = req.subtasks.reduce((acc, subtask) => {
            if (position === 'above' && subtask.id === targetSubtaskId) {
              acc.push(newSubtask);
              acc.push(subtask);
            } else if (position === 'below' && subtask.id === targetSubtaskId) {
              acc.push(subtask);
              acc.push(newSubtask);
            } else {
              acc.push(subtask);
            }
            return acc;
          }, [] as Subtask[]);

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

  // 删除子任务
  const handleDeleteSubtask = (requirementId: string, subtaskId: string) => {
    setRequirements(prev => 
      prev.map(req => {
        if (req.id === requirementId) {
          const updatedSubtasks = req.subtasks.filter(subtask => subtask.id !== subtaskId);
          
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

  // 点击空白处关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setEditingCell(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 页面标题栏 */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">版本需求管理</h1>
            <p className="text-sm text-muted-foreground">管理版本计划中的产品需求</p>
          </div>
        </div>
        <Button onClick={() => console.log('新建需求')} className="gap-2">
          <Plus className="h-4 w-4" />
          新建需求
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索需求标题、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="w-40">
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
              <SelectValue placeholder="选择类型" />
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择状态" />
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
          
          <div className="text-sm text-muted-foreground">
            共 {filteredRequirements.length} 个需求
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto">
        {sortedVersions.map(version => (
          <div key={version} className="border-b border-border">
            <div className="sticky top-0 bg-muted/50 p-4 border-b border-border backdrop-blur-sm">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                版本 {version}
                <span className="text-sm text-muted-foreground">({groupedRequirements[version].length} 个需求)</span>
              </h2>
            </div>

            <Card className="m-4 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="min-w-80">需求标题</TableHead>
                      <TableHead className="w-24">类型</TableHead>
                      <TableHead className="w-24">优先级</TableHead>
                      <TableHead className="w-32">总进度状态</TableHead>
                      <TableHead className="w-32">产品负责人</TableHead>
                      <TableHead className="w-32">应用端</TableHead>
                      <TableHead className="w-40">计划日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedRequirements[version].map((requirement) => (
                      <React.Fragment key={requirement.id}>
                        {/* 需求主行 */}
                        <TableRow className="hover:bg-muted/50 group">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRequirementExpansion(requirement.id)}
                              className="h-6 w-6 p-0"
                            >
                              {expandedRequirements.has(requirement.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div 
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleRequirementTitleClick(requirement)}
                              >
                                {requirement.title}
                              </div>
                              {requirement.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {requirement.description}
                                </p>
                              )}
                              {requirement.tags && requirement.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {requirement.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
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
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-muted"
                                >
                                  {requirement.type}
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {['K线', '行情', '聊天室', '系统', '交易'].map(type => (
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
                                <Badge 
                                  variant="outline" 
                                  className={`cursor-pointer hover:bg-muted ${getPriorityColor(requirement.priority)}`}
                                >
                                  {requirement.priority}
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {['低', '中', '高', '紧急'].map(priority => (
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
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(requirement.status)}
                            >
                              {requirement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.productManager.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {requirement.productManager.name.slice(-2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{requirement.productManager.name}</span>
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {mockUsers.map(user => (
                                  <DropdownMenuItem 
                                    key={user.id}
                                    onClick={() => updateRequirementField(requirement.id, 'productManager', user)}
                                  >
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {user.name.slice(-2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-muted"
                                >
                                  {requirement.platform || 'Web端'}
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {['Web端', '移动端', '全平台', 'PC端', '小程序'].map(platform => (
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
                            <div className="text-sm">
                              <div>{requirement.startDate}</div>
                              <div className="text-muted-foreground">至 {requirement.endDate}</div>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* 子任务表格 */}
                        {expandedRequirements.has(requirement.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <div className="bg-muted/20 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-foreground">子任务</h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddSubtask(requirement.id)}
                                    className="gap-1"
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                    添加子任务
                                  </Button>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="w-8"></TableHead>
                                      <TableHead className="min-w-60">任务名称</TableHead>
                                      <TableHead className="w-24">状态</TableHead>
                                      <TableHead className="w-24">任务执行人</TableHead>
                                      <TableHead className="w-32">所属部门</TableHead>
                                      <TableHead className="w-40">预估开始时间</TableHead>
                                      <TableHead className="w-40">预估结束时间</TableHead>
                                      <TableHead className="w-24">预估耗时</TableHead>
                                      <TableHead className="w-40">实际开始时间</TableHead>
                                      <TableHead className="w-40">实际结束时间</TableHead>
                                      <TableHead className="w-24">实际耗时</TableHead>
                                      <TableHead className="w-24">延期状态</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {requirement.subtasks.map((subtask, subtaskIndex) => (
                                      <TableRow 
                                        key={subtask.id}
                                        className="hover:bg-muted/30"
                                        onContextMenu={(e) => handleRightClick(e, requirement.id, subtask.id)}
                                      >
                                        <TableCell className="text-center text-xs text-muted-foreground">
                                          {subtaskIndex + 1}
                                        </TableCell>
                                        <TableCell>
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
                                              className="h-8"
                                              autoFocus
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6"
                                              onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'name' })}
                                            >
                                              {subtask.name}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Badge 
                                                variant="outline" 
                                                className={`cursor-pointer hover:bg-muted ${getStatusColor(subtask.status)}`}
                                              >
                                                {subtask.status}
                                                <ChevronDown className="ml-1 h-3 w-3" />
                                              </Badge>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                              {['未开始', '进行中', '已完成', '已暂停'].map(status => (
                                                <DropdownMenuItem 
                                                  key={status}
                                                  onClick={() => updateSubtaskField(requirement.id, subtask.id, 'status', status)}
                                                >
                                                  {status}
                                                </DropdownMenuItem>
                                              ))}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                        <TableCell>
                                          {subtask.executor ? (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                                                  <Avatar className="h-6 w-6">
                                                    <AvatarImage src={subtask.executor.avatar} />
                                                    <AvatarFallback className="text-xs">
                                                      {subtask.executor.name.slice(-2)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-sm">{subtask.executor.name}</span>
                                                  <ChevronDown className="h-3 w-3" />
                                                </div>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent>
                                                <DropdownMenuItem 
                                                  onClick={() => updateSubtaskField(requirement.id, subtask.id, 'executor', undefined)}
                                                >
                                                  <span className="text-muted-foreground">未分配</span>
                                                </DropdownMenuItem>
                                                {mockUsers.map(user => (
                                                  <DropdownMenuItem 
                                                    key={user.id}
                                                    onClick={() => updateSubtaskField(requirement.id, subtask.id, 'executor', user)}
                                                  >
                                                    <Avatar className="h-6 w-6 mr-2">
                                                      <AvatarImage src={user.avatar} />
                                                      <AvatarFallback className="text-xs">
                                                        {user.name.slice(-2)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    {user.name}
                                                  </DropdownMenuItem>
                                                ))}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          ) : (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                                                  未分配
                                                  <ChevronDown className="ml-1 h-3 w-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent>
                                                {mockUsers.map(user => (
                                                  <DropdownMenuItem 
                                                    key={user.id}
                                                    onClick={() => updateSubtaskField(requirement.id, subtask.id, 'executor', user)}
                                                  >
                                                    <Avatar className="h-6 w-6 mr-2">
                                                      <AvatarImage src={user.avatar} />
                                                      <AvatarFallback className="text-xs">
                                                        {user.name.slice(-2)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    {user.name}
                                                  </DropdownMenuItem>
                                                ))}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {subtask.department ? (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                                  {subtask.department.name}
                                                  <ChevronDown className="ml-1 h-3 w-3" />
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
                                          ) : (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                                                  未分配
                                                  <ChevronDown className="ml-1 h-3 w-3" />
                                                </Button>
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
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingCell?.requirementId === requirement.id && 
                                           editingCell?.subtaskId === subtask.id && 
                                           editingCell?.field === 'estimatedStartDate' ? (
                                            <Input
                                              type="datetime-local"
                                              value={subtask.estimatedStartDate ? subtask.estimatedStartDate.slice(0, 16) : ''}
                                              onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'estimatedStartDate', e.target.value)}
                                              onBlur={() => setEditingCell(null)}
                                              className="h-8 w-full"
                                              autoFocus
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6 text-sm"
                                              onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'estimatedStartDate' })}
                                            >
                                              {subtask.estimatedStartDate ? 
                                                new Date(subtask.estimatedStartDate).toLocaleString('zh-CN', {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                }).replace(/\//g, '-') : 
                                                '点击设置'
                                              }
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingCell?.requirementId === requirement.id && 
                                           editingCell?.subtaskId === subtask.id && 
                                           editingCell?.field === 'estimatedEndDate' ? (
                                            <Input
                                              type="datetime-local"
                                              value={subtask.estimatedEndDate ? subtask.estimatedEndDate.slice(0, 16) : ''}
                                              onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'estimatedEndDate', e.target.value)}
                                              onBlur={() => setEditingCell(null)}
                                              className="h-8 w-full"
                                              autoFocus
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6 text-sm"
                                              onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'estimatedEndDate' })}
                                            >
                                              {subtask.estimatedEndDate ? 
                                                new Date(subtask.estimatedEndDate).toLocaleString('zh-CN', {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                }).replace(/\//g, '-') : 
                                                '点击设置'
                                              }
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-sm text-center">
                                          {subtask.estimatedDuration || 0}h
                                        </TableCell>
                                        <TableCell>
                                          {editingCell?.requirementId === requirement.id && 
                                           editingCell?.subtaskId === subtask.id && 
                                           editingCell?.field === 'actualStartDate' ? (
                                            <Input
                                              type="datetime-local"
                                              value={subtask.actualStartDate ? subtask.actualStartDate.slice(0, 16) : ''}
                                              onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'actualStartDate', e.target.value)}
                                              onBlur={() => setEditingCell(null)}
                                              className="h-8 w-full"
                                              autoFocus
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6 text-sm"
                                              onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'actualStartDate' })}
                                            >
                                              {subtask.actualStartDate ? 
                                                new Date(subtask.actualStartDate).toLocaleString('zh-CN', {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                }).replace(/\//g, '-') : 
                                                '点击设置'
                                              }
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingCell?.requirementId === requirement.id && 
                                           editingCell?.subtaskId === subtask.id && 
                                           editingCell?.field === 'actualEndDate' ? (
                                            <Input
                                              type="datetime-local"
                                              value={subtask.actualEndDate ? subtask.actualEndDate.slice(0, 16) : ''}
                                              onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'actualEndDate', e.target.value)}
                                              onBlur={() => setEditingCell(null)}
                                              className="h-8 w-full"
                                              autoFocus
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-6 text-sm"
                                              onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'actualEndDate' })}
                                            >
                                              {subtask.actualEndDate ? 
                                                new Date(subtask.actualEndDate).toLocaleString('zh-CN', {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                }).replace(/\//g, '-') : 
                                                '点击设置'
                                              }
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-sm text-center">
                                          {subtask.actualDuration || 0}h
                                        </TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant="outline" 
                                            className={getDelayStatusColor(subtask.delayStatus)}
                                          >
                                            {subtask.delayStatus}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
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
          </div>
        ))}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div 
          className="fixed bg-popover border border-border rounded-md shadow-md py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            className="block w-full text-left px-3 py-1 text-sm hover:bg-muted"
            onClick={() => {
              handleInsertSubtask(contextMenu.requirementId, contextMenu.subtaskId, 'above');
              setContextMenu(null);
            }}
          >
            在上方插入行
          </button>
          <button 
            className="block w-full text-left px-3 py-1 text-sm hover:bg-muted"
            onClick={() => {
              handleInsertSubtask(contextMenu.requirementId, contextMenu.subtaskId, 'below');
              setContextMenu(null);
            }}
          >
            在下方插入行
          </button>
          <button 
            className="block w-full text-left px-3 py-1 text-sm hover:bg-muted"
            onClick={() => {
              handleCopySubtask(contextMenu.requirementId, contextMenu.subtaskId);
              setContextMenu(null);
            }}
          >
            复制行
          </button>
          <button 
            className="block w-full text-left px-3 py-1 text-sm hover:bg-muted text-destructive"
            onClick={() => {
              handleDeleteSubtask(contextMenu.requirementId, contextMenu.subtaskId);
              setContextMenu(null);
            }}
          >
            删除行
          </button>
        </div>
      )}
    </div>
  );
}