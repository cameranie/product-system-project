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
  MoreHorizontal
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

const mockVersionRequirements: VersionRequirement[] = [
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
    description: '优化K线图渲染��能，支持更多技术指标和自定义样式',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    createdAt: '2024-03-15 16:40',
    updatedAt: '2024-04-20 09:25',
    tags: ['K线', '图表', '性能优化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-20 11:30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-22 15:45' },
    subtasks: generateDefaultSubtasks('2').map(subtask => ({
      ...subtask,
      // 为第二个需求的子任务添加一些示例数据
      estimatedStartDate: subtask.name === '前端开发' ? '2024-04-15T09:00' : undefined,
      estimatedEndDate: subtask.name === '前端开发' ? '2024-04-25T18:00' : undefined,
      actualStartDate: subtask.name === '前端开发' ? '2024-04-16T09:30' : undefined,
      actualEndDate: subtask.name === '前端开发' ? '2024-04-28T17:30' : undefined,
      status: subtask.name === '前端开发' ? '已完成' : '未开始',
      executor: subtask.name === '前端开发' ? mockUsers[0] : undefined
    }))
  }
];

// 右键菜单组件
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddTask: () => void;
  onCopyTask: () => void;
  onDeleteTask: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAddTask, onCopyTask, onDeleteTask }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-background border rounded-md shadow-lg py-1 z-50"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => { onAddTask(); onClose(); }}
        className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        新增子任务
      </button>
      <button
        onClick={() => { onCopyTask(); onClose(); }}
        className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        复制子任务
      </button>
      <button
        onClick={() => { onDeleteTask(); onClose(); }}
        className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-destructive flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        删除子任务
      </button>
    </div>
  );
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

  // 计算耗时（天数转小时，一天按8小时计算）
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
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.map(subtask => {
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
              }),
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
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: afterSubtaskId 
                ? req.subtasks.reduce((acc, subtask) => {
                    acc.push(subtask);
                    if (subtask.id === afterSubtaskId) {
                      acc.push(newSubtask);
                    }
                    return acc;
                  }, [] as Subtask[])
                : [...req.subtasks, newSubtask]
            }
          : req
      )
    );
  };

  // 复制子任务
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
        prev.map(req => 
          req.id === requirementId 
            ? {
                ...req,
                subtasks: req.subtasks.reduce((acc, st) => {
                  acc.push(st);
                  if (st.id === subtaskId) {
                    acc.push(copiedSubtask);
                  }
                  return acc;
                }, [] as Subtask[])
              }
            : req
        )
      );
    }
  };

  // 删除子任务
  const handleDeleteSubtask = (requirementId: string, subtaskId: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? {
              ...req,
              subtasks: req.subtasks.filter(subtask => subtask.id !== subtaskId)
            }
          : req
      )
    );
  };

  // 内联编辑组件
  const EditableCell = ({ 
    value, 
    type = 'text', 
    options = [], 
    onChange, 
    onSave 
  }: {
    value: any;
    type?: 'text' | 'number' | 'select' | 'datetime-local';
    options?: { value: any; label: string }[];
    onChange: (value: any) => void;
    onSave: () => void;
  }) => {
    const [tempValue, setTempValue] = useState(value);
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onChange(tempValue);
        onSave();
      } else if (e.key === 'Escape') {
        setTempValue(value);
        onSave();
      }
    };

    const handleBlur = () => {
      onChange(tempValue);
      onSave();
    };

    if (type === 'select') {
      return (
        <Select value={tempValue} onValueChange={(val) => { onChange(val); onSave(); }}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'datetime-local') {
      // 处理datetime-local格式转换
      const formatDatetimeLocal = (dateString: string) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          // 调整为本地时区
          const offset = date.getTimezoneOffset() * 60000;
          const localDate = new Date(date.getTime() - offset);
          return localDate.toISOString().slice(0, 16);
        } catch (e) {
          return '';
        }
      };

      const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (inputValue) {
          // 将datetime-local格式转换为ISO字符串
          const date = new Date(inputValue);
          setTempValue(date.toISOString());
        } else {
          setTempValue('');
        }
      };

      return (
        <input
          type="datetime-local"
          value={formatDatetimeLocal(tempValue)}
          onChange={handleDatetimeChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-8 text-xs w-full px-2 py-1 border border-input rounded-md bg-background"
          autoFocus
        />
      );
    }

    return (
      <Input
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-8 text-xs"
        autoFocus
      />
    );
  };

  // 定义选项数据
  const typeOptions = ['K线', '行情', '聊天室', '系统', '交易'];
  const priorityOptions = ['低', '中', '高', '紧急'];
  const platformOptions = ['Web端', '移动端', '全平台', 'PC端', '小程序'];
  const statusOptions = ['未开始', '进行中', '已完成', '已暂停'];
  const delayStatusOptions = ['准时', '延期', '提前', '未知'];

  // 格式化日期时间显示
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">版本需求管理</h1>
            <p className="text-muted-foreground mt-1">
              管理产品版本需求和子任务执行详情，支持右键操作、内联编辑和自动计算耗时
            </p>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索需求..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 筛选器 */}
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="版本" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部版本</SelectItem>
                  {versions.map(version => (
                    <SelectItem key={version} value={version}>{version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部类型</SelectItem>
                  {typeOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="状态" />
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
          </CardContent>
        </Card>

        {/* 需求列表 */}
        <Card>
          <CardContent className="p-0">
            {sortedVersions.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无版本需求</h3>
                <p className="text-muted-foreground">
                  还没有任何版本需求数据
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>需求标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>产品负责人</TableHead>
                    <TableHead>项目</TableHead>
                    <TableHead>应用端</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>更新时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVersions.map((version) => {
                    const versionRequirements = groupedRequirements[version];
                    
                    return (
                      <React.Fragment key={version}>
                        {/* 版本分组头 */}
                        <TableRow className="bg-muted/30 hover:bg-muted/50 border-t-2 border-border">
                          <TableCell colSpan={10} className="py-3">
                            <div className="flex items-center gap-3">
                              <GitBranch className="h-4 w-4 text-primary" />
                              <span className="font-medium">{version}</span>
                              <span className="text-sm text-muted-foreground">
                                {versionRequirements.length} 个需求
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* 版本需求列表 */}
                        {versionRequirements.map((requirement) => (
                          <React.Fragment key={requirement.id}>
                            <TableRow className="hover:bg-muted/50">
                              {/* 需求标题 */}
                              <TableCell onClick={() => handleRequirementTitleClick(requirement)} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRequirementExpansion(requirement.id);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    {expandedRequirements.has(requirement.id) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <div>
                                    <div className="font-medium text-primary hover:underline">{requirement.title}</div>
                                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                      {requirement.description}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>

                              {/* 类型 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.type}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {typeOptions.map((type) => (
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

                              {/* 优先级 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className={`cursor-pointer hover:bg-accent text-xs ${getPriorityColor(requirement.priority)}`}
                                    >
                                      {requirement.priority}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {priorityOptions.map((priority) => (
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

                              {/* 状态 */}
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(requirement.status)}`}
                                >
                                  {requirement.status}
                                </Badge>
                              </TableCell>

                              {/* 负责人 */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.assignee.avatar} />
                                    <AvatarFallback>{requirement.assignee.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{requirement.assignee.name}</span>
                                </div>
                              </TableCell>

                              {/* 产品负责人 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.productManager.name}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {mockUsers.map((user) => (
                                      <DropdownMenuItem 
                                        key={user.id} 
                                        onClick={() => updateRequirementField(requirement.id, 'productManager', user)}
                                      >
                                        {user.name}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 项目 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.project.name}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {mockProjects.map((project) => (
                                      <DropdownMenuItem 
                                        key={project.id} 
                                        onClick={() => updateRequirementField(requirement.id, 'project', project)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }}></div>
                                          {project.name}
                                        </div>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 应用端 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.platform}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {platformOptions.map((platform) => (
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

                              {/* 版本号 */}
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {requirement.version}
                                </Badge>
                              </TableCell>

                              {/* 更新时间 */}
                              <TableCell>
                                <span className="text-sm text-muted-foreground">{requirement.updatedAt}</span>
                              </TableCell>
                            </TableRow>

                            {/* 子任务详情 */}
                            {expandedRequirements.has(requirement.id) && requirement.subtasks && requirement.subtasks.length > 0 && (
                              <TableRow>
                                <TableCell colSpan={10} className="p-0 bg-muted/20">
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-medium">子任务执行情况</h4>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddSubtask(requirement.id)}
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        新增子任务
                                      </Button>
                                    </div>
                                    
                                    {/* 固定表格布局 */}
                                    <div className="overflow-x-auto">
                                      <table className="w-full table-fixed border-collapse">
                                        <thead>
                                          <tr className="border-b">
                                            <th className="text-left text-xs font-medium p-2 w-48">任务名称</th>
                                            <th className="text-left text-xs font-medium p-2 w-28">执行人</th>
                                            <th className="text-left text-xs font-medium p-2 w-24">部门</th>
                                            <th className="text-left text-xs font-medium p-2 w-20">状态</th>
                                            <th className="text-left text-xs font-medium p-2 w-36">预计开始</th>
                                            <th className="text-left text-xs font-medium p-2 w-36">预计结束</th>
                                            <th className="text-left text-xs font-medium p-2 w-20">预估耗时(h)</th>
                                            <th className="text-left text-xs font-medium p-2 w-36">实际开始</th>
                                            <th className="text-left text-xs font-medium p-2 w-36">实际结束</th>
                                            <th className="text-left text-xs font-medium p-2 w-20">实际耗时(h)</th>
                                            <th className="text-left text-xs font-medium p-2 w-20">延期状态</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {requirement.subtasks.map((subtask) => (
                                            <tr 
                                              key={subtask.id} 
                                              className="border-b hover:bg-muted/30"
                                              onContextMenu={(e) => handleRightClick(e, requirement.id, subtask.id)}
                                            >
                                              {/* 任务名称 - 可编辑，固定宽度，自动换行 */}
                                              <td className="p-2 w-48">
                                                <div 
                                                  className="cursor-pointer hover:bg-accent px-2 py-1 rounded text-xs break-words min-h-[2rem]"
                                                  onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'name' })}
                                                >
                                                  {editingCell?.requirementId === requirement.id && 
                                                   editingCell?.subtaskId === subtask.id && 
                                                   editingCell?.field === 'name' ? (
                                                    <EditableCell
                                                      value={subtask.name}
                                                      onChange={(value) => updateSubtaskField(requirement.id, subtask.id, 'name', value)}
                                                      onSave={() => setEditingCell(null)}
                                                    />
                                                  ) : (
                                                    <span className="block w-full">{subtask.name}</span>
                                                  )}
                                                </div>
                                              </td>

                                              {/* 执行人 - 可编辑 */}
                                              <td className="p-2 w-28">
                                                {subtask.executor ? (
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <div className="flex items-center gap-1 cursor-pointer hover:bg-accent px-2 py-1 rounded text-xs">
                                                        <Avatar className="h-4 w-4 flex-shrink-0">
                                                          <AvatarFallback className="text-xs">{subtask.executor.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate flex-1">{subtask.executor.name}</span>
                                                      </div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                      <DropdownMenuItem onClick={() => updateSubtaskField(requirement.id, subtask.id, 'executor', undefined)}>
                                                        未分配
                                                      </DropdownMenuItem>
                                                      {mockUsers.map((user) => (
                                                        <DropdownMenuItem 
                                                          key={user.id}
                                                          onClick={() => updateSubtaskField(requirement.id, subtask.id, 'executor', user)}
                                                        >
                                                          {user.name}
                                                        </DropdownMenuItem>
                                                      ))}
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                ) : (
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <span className="text-xs text-muted-foreground cursor-pointer hover:bg-accent px-2 py-1 rounded block text-center">未分配</span>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                      {mockUsers.map((user) => (
                                                        <DropdownMenuItem 
                                                          key={user.id}
                                                          onClick={() => updateSubtaskField(requirement.id, subtask.id, 'executor', user)}
                                                        >
                                                          {user.name}
                                                        </DropdownMenuItem>
                                                      ))}
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                )}
                                              </td>

                                              {/* 部门 - 可编辑 */}
                                              <td className="p-2 w-24">
                                                {subtask.department ? (
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent w-full justify-center">
                                                        {subtask.department.name.replace('开发部', '').replace('部', '')}
                                                      </Badge>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                      <DropdownMenuItem onClick={() => updateSubtaskField(requirement.id, subtask.id, 'department', undefined)}>
                                                        未分配
                                                      </DropdownMenuItem>
                                                      {mockDepartments.map((dept) => (
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
                                                      <span className="text-xs text-muted-foreground cursor-pointer hover:bg-accent px-2 py-1 rounded block text-center">未分配</span>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                      {mockDepartments.map((dept) => (
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
                                              </td>

                                              {/* 状态 - 可编辑 */}
                                              <td className="p-2 w-20">
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Badge 
                                                      variant="outline" 
                                                      className="text-xs bg-blue-100 text-blue-800 border-blue-200 cursor-pointer w-full justify-center"
                                                    >
                                                      {subtask.status === '未开始' ? '未开始' : 
                                                       subtask.status === '进行中' ? '进行' : 
                                                       subtask.status === '已完成' ? '完成' : 
                                                       subtask.status === '已暂停' ? '暂停' : subtask.status}
                                                    </Badge>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent>
                                                    {statusOptions.map((status) => (
                                                      <DropdownMenuItem 
                                                        key={status}
                                                        onClick={() => updateSubtaskField(requirement.id, subtask.id, 'status', status)}
                                                      >
                                                        {status}
                                                      </DropdownMenuItem>
                                                    ))}
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </td>

                                              {/* 预计开始 - 可编辑 */}
                                              <td className="p-2 w-36">
                                                <div 
                                                  className="cursor-pointer hover:bg-accent px-2 py-1 rounded text-xs text-muted-foreground"
                                                  onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'estimatedStartDate' })}
                                                >
                                                  {editingCell?.requirementId === requirement.id && 
                                                   editingCell?.subtaskId === subtask.id && 
                                                   editingCell?.field === 'estimatedStartDate' ? (
                                                    <EditableCell
                                                      value={subtask.estimatedStartDate || ''}
                                                      type="datetime-local"
                                                      onChange={(value) => updateSubtaskField(requirement.id, subtask.id, 'estimatedStartDate', value)}
                                                      onSave={() => setEditingCell(null)}
                                                    />
                                                  ) : (
                                                    formatDateTime(subtask.estimatedStartDate)
                                                  )}
                                                </div>
                                              </td>

                                              {/* 预计结束 - 可编辑 */}
                                              <td className="p-2 w-36">
                                                <div 
                                                  className="cursor-pointer hover:bg-accent px-2 py-1 rounded text-xs text-muted-foreground"
                                                  onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'estimatedEndDate' })}
                                                >
                                                  {editingCell?.requirementId === requirement.id && 
                                                   editingCell?.subtaskId === subtask.id && 
                                                   editingCell?.field === 'estimatedEndDate' ? (
                                                    <EditableCell
                                                      value={subtask.estimatedEndDate || ''}
                                                      type="datetime-local"
                                                      onChange={(value) => updateSubtaskField(requirement.id, subtask.id, 'estimatedEndDate', value)}
                                                      onSave={() => setEditingCell(null)}
                                                    />
                                                  ) : (
                                                    formatDateTime(subtask.estimatedEndDate)
                                                  )}
                                                </div>
                                              </td>

                                              {/* 预估耗时 - 自动计算显示 */}
                                              <td className="p-2 w-20 text-center">
                                                <span className="text-xs text-muted-foreground">
                                                  {subtask.estimatedDuration || 0}
                                                </span>
                                              </td>

                                              {/* 实际开始 - 可编辑 */}
                                              <td className="p-2 w-36">
                                                <div 
                                                  className="cursor-pointer hover:bg-accent px-2 py-1 rounded text-xs text-muted-foreground"
                                                  onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'actualStartDate' })}
                                                >
                                                  {editingCell?.requirementId === requirement.id && 
                                                   editingCell?.subtaskId === subtask.id && 
                                                   editingCell?.field === 'actualStartDate' ? (
                                                    <EditableCell
                                                      value={subtask.actualStartDate || ''}
                                                      type="datetime-local"
                                                      onChange={(value) => updateSubtaskField(requirement.id, subtask.id, 'actualStartDate', value)}
                                                      onSave={() => setEditingCell(null)}
                                                    />
                                                  ) : (
                                                    formatDateTime(subtask.actualStartDate)
                                                  )}
                                                </div>
                                              </td>

                                              {/* 实际结束 - 可编辑 */}
                                              <td className="p-2 w-36">
                                                <div 
                                                  className="cursor-pointer hover:bg-accent px-2 py-1 rounded text-xs text-muted-foreground"
                                                  onClick={() => setEditingCell({ requirementId: requirement.id, subtaskId: subtask.id, field: 'actualEndDate' })}
                                                >
                                                  {editingCell?.requirementId === requirement.id && 
                                                   editingCell?.subtaskId === subtask.id && 
                                                   editingCell?.field === 'actualEndDate' ? (
                                                    <EditableCell
                                                      value={subtask.actualEndDate || ''}
                                                      type="datetime-local"
                                                      onChange={(value) => updateSubtaskField(requirement.id, subtask.id, 'actualEndDate', value)}
                                                      onSave={() => setEditingCell(null)}
                                                    />
                                                  ) : (
                                                    formatDateTime(subtask.actualEndDate)
                                                  )}
                                                </div>
                                              </td>

                                              {/* 实际耗时 - 自动计算显示 */}
                                              <td className="p-2 w-20 text-center">
                                                <span className="text-xs text-muted-foreground">
                                                  {subtask.actualDuration || 0}
                                                </span>
                                              </td>

                                              {/* 延期状态 - 自动计算显示 */}
                                              <td className="p-2 w-20 text-center">
                                                <Badge 
                                                  variant="outline" 
                                                  className={`text-xs ${getDelayStatusColor(subtask.delayStatus)} w-full justify-center`}
                                                >
                                                  {subtask.delayStatus}
                                                </Badge>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAddTask={() => handleAddSubtask(contextMenu.requirementId, contextMenu.subtaskId)}
          onCopyTask={() => handleCopySubtask(contextMenu.requirementId, contextMenu.subtaskId)}
          onDeleteTask={() => handleDeleteSubtask(contextMenu.requirementId, contextMenu.subtaskId)}
        />
      )}
    </div>
  );
}