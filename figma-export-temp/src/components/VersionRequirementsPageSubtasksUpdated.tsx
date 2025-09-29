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
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
    // 分配默认执行人和部门
    executor: index === 0 ? mockUsers[2] : // 原型设计 -> 王五(UI设计师)
              index === 1 ? mockUsers[2] : // 视觉设计 -> 王五(UI设计师)
              index === 2 ? mockUsers[0] : // 前端开发 -> 张三(前端开发)
              index === 3 ? mockUsers[1] : // 后端开发 -> 李四(后端开发)
              index === 4 ? mockUsers[4] : // 测试 -> 孙七(前端开发)
              mockUsers[5], // 产品验收 -> 产品经理
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
        estimatedDuration: index === 2 ? 0 : 0, // 将在初始化时计算
        actualDuration: index === 2 ? 0 : 0, // 将在初始化时计算
      }))
    }
  ];

  return baseRequirements;
};

const mockVersionRequirements: VersionRequirement[] = createMockRequirements();

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

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

    // 定义任务阶段映射
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

    return '待原型设计';
  };

  // 在组件初始化时计算所有需求的正确状态和子任务自动字段
  useEffect(() => {
    setRequirements(prev => 
      prev.map(req => {
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

  // 过滤需求
  const filteredRequirements = requirements.filter(req => {
    const matchesVersion = selectedVersion === '全部' || req.version === selectedVersion;
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase());
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

  // 切换版本展开状态
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockVersionRequirements.map(r => r.version))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });

  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  // 获取样式函数
  const getPriorityColor = (priority: string): string => {
    return priorityConfig[priority]?.className || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 统一的状态颜色样式
  const getStatusColor = (status: string): string => {
    const colors = {
      '未开始': 'bg-gray-100 text-gray-800 border-gray-200',
      '进行中': 'bg-blue-100 text-blue-800 border-blue-200',
      '已完成': 'bg-green-100 text-green-800 border-green-200',
      '已暂停': 'bg-red-100 text-red-800 border-red-200',
      '待原型设计': 'bg-slate-100 text-slate-800 border-slate-200',
      '原型设计中': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '待UI设计': 'bg-slate-100 text-slate-800 border-slate-200',
      'UI设计中': 'bg-purple-100 text-purple-800 border-purple-200',
      '待开发': 'bg-slate-100 text-slate-800 border-slate-200',
      '开发中': 'bg-blue-100 text-blue-800 border-blue-200',
      '待测试': 'bg-slate-100 text-slate-800 border-slate-200',
      '测试中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '待验收': 'bg-slate-100 text-slate-800 border-slate-200',
      '验收中': 'bg-orange-100 text-orange-800 border-orange-200',
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
              return recalculateSubtaskFields(updatedSubtask);
            }
            return subtask;
          });

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
    setContextMenu(null);
  };

  // 复制子任务行
  const handleCopySubtask = (requirementId: string, subtaskId: string) => {
    const requirement = requirements.find(req => req.id === requirementId);
    const subtask = requirement?.subtasks.find(sub => sub.id === subtaskId);
    
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
            const subtaskIndex = req.subtasks.findIndex(sub => sub.id === subtaskId);
            const updatedSubtasks = [...req.subtasks];
            updatedSubtasks.splice(subtaskIndex + 1, 0, recalculateSubtaskFields(copiedSubtask));

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
    setContextMenu(null);
  };

  // 删除子任务行
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
    setContextMenu(null);
  };

  // 处理子任务名称编辑
  const handleSubtaskNameEdit = (requirementId: string, subtaskId: string) => {
    setEditingCell({ requirementId, subtaskId, field: 'name' });
  };

  // 处理子任务名称保存
  const handleSubtaskNameSave = (requirementId: string, subtaskId: string, newValue: string) => {
    updateSubtaskField(requirementId, subtaskId, 'name', newValue.trim() || '新子任务');
    setEditingCell(null);
  };

  // 关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">版本需求管理</h1>
            <p className="text-muted-foreground mt-1">版本需求计划和子任务进度跟踪</p>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索需求..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
                  <SelectValue />
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
                  <SelectValue />
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 版本需求列表 */}
        <div className="space-y-6">
          {sortedVersions.map(version => (
            <Card key={version} className="overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleVersionExpanded(version)}
                    >
                      {expandedVersions[version] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">{version}</h3>
                    <Badge variant="outline" className="ml-2">
                      {groupedRequirements[version].length} 个需求
                    </Badge>
                  </div>
                </div>
              </div>

              {expandedVersions[version] && (
                <div className="p-4 space-y-4">
                  {groupedRequirements[version].map(requirement => (
                    <Card key={requirement.id} className="border border-border/50">
                      <div className="p-4">
                        {/* 需求主信息行 */}
                        <div className="flex items-center gap-3 mb-3">
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

                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FolderOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="font-medium text-primary cursor-pointer hover:underline truncate"
                                onClick={() => handleRequirementTitleClick(requirement)}
                                title={requirement.title}
                              >
                                {requirement.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant="outline"
                                className={getStatusColor(requirement.status)}
                              >
                                {requirement.status}
                              </Badge>

                              <Badge 
                                variant="outline"
                                className={getPriorityColor(requirement.priority)}
                              >
                                {requirement.priority}
                              </Badge>

                              <Badge variant="outline">
                                {requirement.type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* 子任务表格 */}
                        {expandedRequirements.has(requirement.id) && (
                          <div className="mt-4 border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="min-w-[200px] flex-1">子任务名称</TableHead>
                                  <TableHead className="w-[120px]">任务执行人</TableHead>
                                  <TableHead className="w-[100px]">部门</TableHead>
                                  <TableHead className="w-[80px]">状态</TableHead>
                                  <TableHead className="w-[160px]">预估开始时间</TableHead>
                                  <TableHead className="w-[160px]">预估结束时间</TableHead>
                                  <TableHead className="w-[80px]">预估耗时</TableHead>
                                  <TableHead className="w-[160px]">实际开始时间</TableHead>
                                  <TableHead className="w-[160px]">实际结束时间</TableHead>
                                  <TableHead className="w-[80px]">实际耗时</TableHead>
                                  <TableHead className="w-[80px]">延期状态</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {requirement.subtasks.map((subtask, index) => (
                                  <TableRow 
                                    key={subtask.id} 
                                    className="hover:bg-muted/50"
                                    onContextMenu={(e) => handleRightClick(e, requirement.id, subtask.id)}
                                  >
                                    {/* 子任务名称 - 可点击编辑，自适应宽度，自动换行 */}
                                    <TableCell className="min-w-[200px] flex-1">
                                      {editingCell?.requirementId === requirement.id && 
                                       editingCell?.subtaskId === subtask.id && 
                                       editingCell?.field === 'name' ? (
                                        <Input
                                          defaultValue={subtask.name}
                                          className="h-8"
                                          autoFocus
                                          onBlur={(e) => handleSubtaskNameSave(requirement.id, subtask.id, e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleSubtaskNameSave(requirement.id, subtask.id, e.currentTarget.value);
                                            } else if (e.key === 'Escape') {
                                              setEditingCell(null);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div 
                                          className="cursor-pointer hover:bg-muted/50 p-1 rounded text-sm break-words"
                                          onClick={() => handleSubtaskNameEdit(requirement.id, subtask.id)}
                                          style={{ 
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            lineHeight: '1.4'
                                          }}
                                        >
                                          {subtask.name}
                                        </div>
                                      )}
                                    </TableCell>

                                    {/* 任务执行人 - 显示默认分配 */}
                                    <TableCell className="w-[120px]">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-xs">
                                            {subtask.executor?.name?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm truncate">
                                          {subtask.executor?.name || '未分配'}
                                        </span>
                                      </div>
                                    </TableCell>

                                    {/* 部门 */}
                                    <TableCell className="w-[100px]">
                                      <span className="text-sm text-muted-foreground">
                                        {subtask.department?.name || '-'}
                                      </span>
                                    </TableCell>

                                    {/* 状态 */}
                                    <TableCell className="w-[80px]">
                                      <Select 
                                        value={subtask.status} 
                                        onValueChange={(value) => updateSubtaskField(requirement.id, subtask.id, 'status', value)}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="未开始">未开始</SelectItem>
                                          <SelectItem value="进行中">进行中</SelectItem>
                                          <SelectItem value="已完成">已完成</SelectItem>
                                          <SelectItem value="已暂停">已暂停</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>

                                    {/* 预估开始时间 - 直接点击选择 */}
                                    <TableCell className="w-[160px]">
                                      <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(subtask.estimatedStartDate)}
                                        onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'estimatedStartDate', e.target.value)}
                                        className="w-[155px] h-8 px-2 text-xs border rounded hover:border-primary/50 focus:border-primary focus:outline-none"
                                        placeholder="点击设置"
                                      />
                                    </TableCell>

                                    {/* 预估结束时间 - 直接点击选择 */}
                                    <TableCell className="w-[160px]">
                                      <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(subtask.estimatedEndDate)}
                                        onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'estimatedEndDate', e.target.value)}
                                        className="w-[155px] h-8 px-2 text-xs border rounded hover:border-primary/50 focus:border-primary focus:outline-none"
                                        placeholder="点击设置"
                                      />
                                    </TableCell>

                                    {/* 预估耗时 - 自动计算 */}
                                    <TableCell className="w-[80px]">
                                      <span className="text-sm text-muted-foreground">
                                        {subtask.estimatedDuration || 0}h
                                      </span>
                                    </TableCell>

                                    {/* 实际开始时间 - 直接点击选择 */}
                                    <TableCell className="w-[160px]">
                                      <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(subtask.actualStartDate)}
                                        onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'actualStartDate', e.target.value)}
                                        className="w-[155px] h-8 px-2 text-xs border rounded hover:border-primary/50 focus:border-primary focus:outline-none"
                                        placeholder="点击设置"
                                      />
                                    </TableCell>

                                    {/* 实际结束时间 - 直接点击选择 */}
                                    <TableCell className="w-[160px]">
                                      <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(subtask.actualEndDate)}
                                        onChange={(e) => updateSubtaskField(requirement.id, subtask.id, 'actualEndDate', e.target.value)}
                                        className="w-[155px] h-8 px-2 text-xs border rounded hover:border-primary/50 focus:border-primary focus:outline-none"
                                        placeholder="点击设置"
                                      />
                                    </TableCell>

                                    {/* 实际耗时 - 自动计算 */}
                                    <TableCell className="w-[80px]">
                                      <span className="text-sm text-muted-foreground">
                                        {subtask.actualDuration || 0}h
                                      </span>
                                    </TableCell>

                                    {/* 延期状态 - 自动计算 */}
                                    <TableCell className="w-[80px]">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getDelayStatusColor(subtask.delayStatus)}`}
                                      >
                                        {subtask.delayStatus}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* 右键上下文菜单 */}
      {contextMenu && (
        <div 
          className="fixed bg-white border rounded-md shadow-lg z-50 py-1"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y,
            minWidth: '150px'
          }}
        >
          <div 
            onClick={() => handleAddSubtask(contextMenu.requirementId, contextMenu.subtaskId)}
            className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            插入行
          </div>
          <div 
            onClick={() => handleCopySubtask(contextMenu.requirementId, contextMenu.subtaskId)}
            className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            复制行
          </div>
          <div 
            onClick={() => handleDeleteSubtask(contextMenu.requirementId, contextMenu.subtaskId)}
            className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            删除行
          </div>
        </div>
      )}
    </div>
  );
}