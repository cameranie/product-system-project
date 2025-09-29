import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  Pause,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
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
  estimatedDuration?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  actualDuration?: number;
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

interface RequirementWithSubtasksPageProps {
  taskId?: string;
  task?: any; // 保持兼容性，但会使用版本需求管理的数据
  onNavigate?: (page: string, context?: any) => void;
}

// 导入版本需求管理的mock数据
const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: 'product' },
  { id: '6', name: '产品经理', avatar: '', role: 'product' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' },
  { id: '9', name: '原型师', avatar: '', role: '原型设计' },
  { id: '10', name: '周八', avatar: '', role: 'product' },
  { id: '11', name: '吴九', avatar: '', role: 'product' }
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

// 版本需求管理的完整数据
const mockVersionRequirements: VersionRequirement[] = [
  // 与MyTodoPage中的任务ID '1' 对应
  {
    id: '1',
    title: '修复登录页面显示BUG',
    type: '系统',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '开发中',
    priority: '紧急',
    assignee: mockUsers[0],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[3],
    platform: 'Web端',
    description: '修复登录页面在Safari浏览器下的显示异常，包括样式错位、按钮失效等问题。需要进行全面的兼容性测试。',
    startDate: '2025-01-15',
    endDate: '2025-01-16',
    createdAt: '2025-01-15 14:30',
    updatedAt: '2025-01-16 09:45',
    tags: ['BUG修复', '前端', '兼容性'],
    isOpen: true,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[3], reviewDate: '2025-01-15 15:00' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: [
      {
        id: '1-subtask-1',
        name: '原型设计',
        type: 'predefined',
        status: '已完成',
        delayStatus: '准时',
        estimatedStartDate: '2025-01-15T09:00',
        estimatedEndDate: '2025-01-15T12:00',
        actualStartDate: '2025-01-15T09:00',
        actualEndDate: '2025-01-15T11:30',
        estimatedDuration: 3,
        actualDuration: 2.5
      },
      {
        id: '1-subtask-2',
        name: '视觉设计',
        type: 'predefined',
        status: '已完成',
        delayStatus: '准时',
        estimatedStartDate: '2025-01-15T13:00',
        estimatedEndDate: '2025-01-15T16:00',
        actualStartDate: '2025-01-15T13:00',
        actualEndDate: '2025-01-15T15:45',
        estimatedDuration: 3,
        actualDuration: 2.75
      },
      {
        id: '1-subtask-3',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0],
        department: mockDepartments[2],
        status: '进行中',
        delayStatus: '准时',
        estimatedStartDate: '2025-01-16T09:00',
        estimatedEndDate: '2025-01-16T14:00',
        actualStartDate: '2025-01-16T09:00',
        estimatedDuration: 5,
        actualDuration: 3
      },
      {
        id: '1-subtask-4',
        name: '后端开发',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-16T10:00',
        estimatedEndDate: '2025-01-16T13:00',
        estimatedDuration: 3
      },
      {
        id: '1-subtask-5',
        name: '测试',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-16T14:00',
        estimatedEndDate: '2025-01-16T16:00',
        estimatedDuration: 2
      },
      {
        id: '1-subtask-6',
        name: '产品验收',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-16T16:00',
        estimatedEndDate: '2025-01-16T17:00',
        estimatedDuration: 1
      },
      {
        id: '1-subtask-7',
        name: '需求提出者验收',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-16T17:00',
        estimatedEndDate: '2025-01-16T18:00',
        estimatedDuration: 1
      }
    ]
  },
  // 对应MyTodoPage中的任务ID '2'
  {
    id: '2',
    title: 'K线图性能优化',
    type: 'K线',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '待开始',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web端',
    description: '优化K线图组件的渲染性能，提升用户体验，减少大数据量下的卡顿现象。',
    startDate: '2025-01-16',
    endDate: '2025-01-17',
    createdAt: '2025-01-15 14:30',
    updatedAt: '2025-01-15 16:45',
    tags: ['性能优化', '前端', 'K线'],
    isOpen: true,
    scheduleReviewLevel1: { status: '待开始' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: [
      {
        id: '2-subtask-1',
        name: '原型设计',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-16T09:00',
        estimatedEndDate: '2025-01-16T12:00',
        estimatedDuration: 3
      },
      {
        id: '2-subtask-2',
        name: '视觉设计',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-16T13:00',
        estimatedEndDate: '2025-01-16T16:00',
        estimatedDuration: 3
      },
      {
        id: '2-subtask-3',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0], // 张三
        department: mockDepartments[2],
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-17T09:00',
        estimatedEndDate: '2025-01-17T17:00',
        estimatedDuration: 8
      },
      {
        id: '2-subtask-4',
        name: '后端开发',
        type: 'predefined',
        executor: mockUsers[1], // 李四
        department: mockDepartments[3],
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-17T09:00',
        estimatedEndDate: '2025-01-17T17:00',
        estimatedDuration: 8
      },
      {
        id: '2-subtask-5',
        name: '测试',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-18T09:00',
        estimatedEndDate: '2025-01-18T17:00',
        estimatedDuration: 8
      },
      {
        id: '2-subtask-6',
        name: '产品验收',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-19T09:00',
        estimatedEndDate: '2025-01-19T12:00',
        estimatedDuration: 3
      },
      {
        id: '2-subtask-7',
        name: '需求提出者验收',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-19T13:00',
        estimatedEndDate: '2025-01-19T15:00',
        estimatedDuration: 2
      }
    ]
  },
  // 对应MyTodoPage中的任务ID '3'
  {
    id: '3',
    title: '行情推送系统升级',
    type: '行情',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '开发中',
    priority: '紧急',
    assignee: mockUsers[0],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: 'Web端',
    description: '升级实时行情推送系统，支持更多数据源和更快的推送速度。',
    startDate: '2025-01-10',
    endDate: '2025-01-14',
    createdAt: '2025-01-10 14:30',
    updatedAt: '2025-01-16 09:45',
    tags: ['系统升级', '实时数据', '性能'],
    isOpen: true,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[3], reviewDate: '2025-01-10 15:00' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: [
      {
        id: '3-subtask-1',
        name: '需求分析',
        type: 'predefined',
        status: '已完成',
        delayStatus: '准时',
        estimatedStartDate: '2025-01-10T09:00',
        estimatedEndDate: '2025-01-12T17:00',
        actualStartDate: '2025-01-10T09:00',
        actualEndDate: '2025-01-12T17:00',
        estimatedDuration: 3,
        actualDuration: 3
      },
      {
        id: '3-subtask-2',
        name: '架构设计',
        type: 'predefined',
        status: '已完成',
        delayStatus: '延期',
        estimatedStartDate: '2025-01-12T09:00',
        estimatedEndDate: '2025-01-13T18:00',
        actualStartDate: '2025-01-12T09:00',
        actualEndDate: '2025-01-13T19:00',
        estimatedDuration: 4,
        actualDuration: 5
      },
      {
        id: '3-subtask-3',
        name: '后端开发',
        type: 'predefined',
        executor: mockUsers[0], // 张三
        department: mockDepartments[3],
        status: '进行中',
        delayStatus: '-',
        estimatedStartDate: '2025-01-13T09:00',
        estimatedEndDate: '2025-01-15T17:00',
        actualStartDate: '2025-01-13T09:00',
        estimatedDuration: 8,
        actualDuration: 3
      },
      {
        id: '3-subtask-4',
        name: '性能测试',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-15T09:00',
        estimatedEndDate: '2025-01-15T15:00',
        estimatedDuration: 3
      },
      {
        id: '3-subtask-5',
        name: '部署上线',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-15T16:00',
        estimatedEndDate: '2025-01-15T20:00',
        estimatedDuration: 2
      }
    ]
  },
  // 对应MyTodoPage中的任务ID '4'
  {
    id: '4',
    title: '交易风控算法优化',
    type: '交易',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: 'Web端',
    description: '完善交易风控算法，提升异常交易检测的准确性和实时性。',
    startDate: '2025-01-08',
    endDate: '2025-01-13',
    createdAt: '2025-01-08 14:30',
    updatedAt: '2025-01-16 09:45',
    tags: ['风控', '算法', '安全'],
    isOpen: true,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[3], reviewDate: '2025-01-08 15:00' },
    scheduleReviewLevel2: { status: '待开始' },
    subtasks: [
      {
        id: '4-subtask-1',
        name: '算法研究',
        type: 'predefined',
        status: '已完成',
        delayStatus: '延期',
        estimatedStartDate: '2025-01-08T09:00',
        estimatedEndDate: '2025-01-11T18:00',
        actualStartDate: '2025-01-08T09:00',
        actualEndDate: '2025-01-11T19:00',
        estimatedDuration: 4,
        actualDuration: 6
      },
      {
        id: '4-subtask-2',
        name: '模型训练',
        type: 'predefined',
        executor: mockUsers[0], // 张三
        department: mockDepartments[3],
        status: '进行中',
        delayStatus: '-',
        estimatedStartDate: '2025-01-12T09:00',
        estimatedEndDate: '2025-01-14T16:00',
        actualStartDate: '2025-01-12T09:00',
        estimatedDuration: 6,
        actualDuration: 3
      },
      {
        id: '4-subtask-3',
        name: '集成测试',
        type: 'predefined',
        executor: mockUsers[0], // 张三
        department: mockDepartments[4],
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-14T09:00',
        estimatedEndDate: '2025-01-15T14:00',
        estimatedDuration: 3
      },
      {
        id: '4-subtask-4',
        name: '上线部署',
        type: 'predefined',
        status: '待开始',
        delayStatus: '-',
        estimatedStartDate: '2025-01-15T15:00',
        estimatedEndDate: '2025-01-15T18:00',
        estimatedDuration: 2
      }
    ]
  }
];

// 状态选项
const statusOptions = ['待开始', '待原型设计', '原型设计中', '待UI设计', 'UI设计中', '待开发', '开发中', '待测试', '测试中', '待验收', '验收中', '待上线', '已上线'];

// 子任务状态选项
const subtaskStatusOptions = ['待开始', '进行中', '已完成'];

export function RequirementWithSubtasksPage({ taskId, task, onNavigate }: RequirementWithSubtasksPageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [requirement, setRequirement] = useState<VersionRequirement | null>(null);
  const [editingTime, setEditingTime] = useState<{
    subtaskId: string;
    field: 'estimatedStartDate' | 'estimatedEndDate' | 'actualStartDate' | 'actualEndDate';
  } | null>(null);
  
  // 当前用户（张三）
  const currentUser = mockUsers[0]; // 张三
  
  // 根据taskId获取对应的版本需求数据
  useEffect(() => {
    const targetId = taskId || task?.id;
    const foundRequirement = mockVersionRequirements.find(req => req.id === targetId);
    setRequirement(foundRequirement || mockVersionRequirements[0]);
  }, [taskId, task]);

  if (!requirement) {
    return <div className="p-6">Loading...</div>;
  }

  // 过滤与当前用户相关的子任务
  const filteredSubtasks = requirement.subtasks.filter(subtask => 
    subtask.executor?.id === currentUser.id
  );

  // 更新子任务状态
  const updateSubtaskStatus = (subtaskId: string, newStatus: string) => {
    if (!requirement) return;
    
    setRequirement(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        subtasks: prev.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, status: newStatus as any }
            : subtask
        )
      };
    });
  };

  // 更新子任务负责人
  const updateSubtaskExecutor = (subtaskId: string, executorId: string) => {
    const executor = mockUsers.find(user => user.id === executorId);
    if (!executor || !requirement) return;

    setRequirement(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        subtasks: prev.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, executor }
            : subtask
        )
      };
    });
  };

  // 更新子任务时间
  const updateSubtaskTime = (
    subtaskId: string, 
    field: 'estimatedStartDate' | 'estimatedEndDate' | 'actualStartDate' | 'actualEndDate',
    value: string
  ) => {
    if (!requirement) return;
    
    setRequirement(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        subtasks: prev.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, [field]: value }
            : subtask
        )
      };
    });
  };

  // 格式化日期时间显示
  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '点击设置';
    return dateTime.replace('T', ' ').substring(0, 16);
  };

  // 格式化日期时间为input值
  const formatDateTimeForInput = (dateTime?: string) => {
    if (!dateTime) return '';
    return dateTime.substring(0, 16);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'K线': return 'bg-blue-500';
      case '行情': return 'bg-green-500';
      case '聊天室': return 'bg-orange-500';
      case '系统': return 'bg-red-500';
      case '交易': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '紧急': return 'destructive';
      case '高': return 'default';
      case '中': return 'secondary';
      case '低': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return 'text-green-600 bg-green-50';
      case '进行中': return 'text-blue-600 bg-blue-50';
      case '待开始': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已完成': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case '进行中': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case '待开始': return <Pause className="h-4 w-4 text-gray-600" />;
      default: return <Pause className="h-4 w-4 text-gray-600" />;
    }
  };

  const completedSubtasks = requirement.subtasks.filter(s => s.status === '已完成').length;
  const totalSubtasks = requirement.subtasks.length;
  const completionRate = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const totalEstimatedHours = requirement.subtasks.reduce((sum, subtask) => sum + (subtask.estimatedDuration || 0), 0);
  const totalActualHours = requirement.subtasks.reduce((sum, subtask) => sum + (subtask.actualDuration || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate?.('my-todo')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回 TO DO
        </Button>
      </div>

      {/* 需求标题和基本信息 */}
      <Card>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="space-y-2">
                {/* 表格标题行 */}
                <div className="grid grid-cols-6 gap-4 text-xs text-muted-foreground px-1">
                  <div>需求标题</div>
                  <div>状态</div>
                  <div>优先级</div>
                  <div>产品负责人</div>
                  <div>创建人</div>
                  <div className="flex justify-between items-center">
                    <span>版本号</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                
                {/* 内容行 */}
                <div className="grid grid-cols-6 gap-4 items-center py-2">
                  <div 
                    className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors"
                    onClick={() => {
                      onNavigate('requirement-detail', {
                        requirementId: requirement.id,
                        source: 'requirement-with-subtasks'
                      });
                    }}
                  >
                    {requirement.title}
                  </div>
                  
                  <div>
                    <Select
                      value={requirement.status}
                      onValueChange={(value) => {
                        setRequirement(prev => prev ? { ...prev, status: value } : prev);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm border-none shadow-none hover:bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="待开始">待开始</SelectItem>
                        <SelectItem value="进行中">进行中</SelectItem>
                        <SelectItem value="待评审">待评审</SelectItem>
                        <SelectItem value="评审中">评审中</SelectItem>
                        <SelectItem value="待开�����">待开发</SelectItem>
                        <SelectItem value="开发中">开发中</SelectItem>
                        <SelectItem value="待测试">待测试</SelectItem>
                        <SelectItem value="测试中">测试中</SelectItem>
                        <SelectItem value="待上线">待上线</SelectItem>
                        <SelectItem value="已上线">已上线</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select
                      value={requirement.priority}
                      onValueChange={(value) => {
                        setRequirement(prev => prev ? { ...prev, priority: value } : prev);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm border-none shadow-none hover:bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高">高</SelectItem>
                        <SelectItem value="中">中</SelectItem>
                        <SelectItem value="低">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select
                      value={requirement.productManager.id}
                      onValueChange={(value) => {
                        const newProductManager = mockUsers.find(user => user.id === value);
                        if (newProductManager) {
                          setRequirement(prev => prev ? { ...prev, productManager: newProductManager } : prev);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm border-none shadow-none hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {requirement.productManager.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{requirement.productManager.name}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.filter(user => user.role === 'product').map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {requirement.creator.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{requirement.creator.name}</span>
                  </div>
                  
                  <div>
                    <Select
                      value={requirement.version}
                      onValueChange={(value) => {
                        setRequirement(prev => prev ? { ...prev, version: value } : prev);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm border-none shadow-none hover:bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v3.2.0">v3.2.0</SelectItem>
                        <SelectItem value="v3.1.0">v3.1.0</SelectItem>
                        <SelectItem value="v3.0.0">v3.0.0</SelectItem>
                        <SelectItem value="v2.9.0">v2.9.0</SelectItem>
                        <SelectItem value="v2.8.0">v2.8.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>

          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* 子任务详情 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">子任务详情</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32">子任务名称</TableHead>
                <TableHead className="w-24">负责人</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-28">预估���始时间</TableHead>
                <TableHead className="w-28">预估结束时间</TableHead>
                <TableHead className="w-28">实际开始时间</TableHead>
                <TableHead className="w-28">实际结束时间</TableHead>
                <TableHead className="w-28">延期状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubtasks.length > 0 ? filteredSubtasks.map((subtask) => (
                <TableRow key={subtask.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{subtask.name}</TableCell>
                  <TableCell>
                    <Select 
                      value={subtask.executor?.id || ""} 
                      onValueChange={(value) => updateSubtaskExecutor(subtask.id, value)}
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
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
                  </TableCell>
                  <TableCell>
                    <Select
                      value={subtask.status}
                      onValueChange={(value) => updateSubtaskStatus(subtask.id, value)}
                    >
                      <SelectTrigger className="w-16 h-7 text-xs">
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
                  </TableCell>
                  <TableCell className="text-xs">
                    {editingTime?.subtaskId === subtask.id && editingTime?.field === 'estimatedStartDate' ? (
                      <Input
                        type="datetime-local"
                        value={formatDateTimeForInput(subtask.estimatedStartDate)}
                        onChange={(e) => updateSubtaskTime(subtask.id, 'estimatedStartDate', e.target.value)}
                        onBlur={() => setEditingTime(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingTime(null);
                          }
                        }}
                        className="w-40 h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        className="text-left hover:bg-gray-100 px-2 py-1 rounded text-xs w-full"
                        onClick={() => setEditingTime({ subtaskId: subtask.id, field: 'estimatedStartDate' })}
                      >
                        {formatDateTime(subtask.estimatedStartDate)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {editingTime?.subtaskId === subtask.id && editingTime?.field === 'estimatedEndDate' ? (
                      <Input
                        type="datetime-local"
                        value={formatDateTimeForInput(subtask.estimatedEndDate)}
                        onChange={(e) => updateSubtaskTime(subtask.id, 'estimatedEndDate', e.target.value)}
                        onBlur={() => setEditingTime(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingTime(null);
                          }
                        }}
                        className="w-40 h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        className="text-left hover:bg-gray-100 px-2 py-1 rounded text-xs w-full"
                        onClick={() => setEditingTime({ subtaskId: subtask.id, field: 'estimatedEndDate' })}
                      >
                        {formatDateTime(subtask.estimatedEndDate)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {editingTime?.subtaskId === subtask.id && editingTime?.field === 'actualStartDate' ? (
                      <Input
                        type="datetime-local"
                        value={formatDateTimeForInput(subtask.actualStartDate)}
                        onChange={(e) => updateSubtaskTime(subtask.id, 'actualStartDate', e.target.value)}
                        onBlur={() => setEditingTime(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingTime(null);
                          }
                        }}
                        className="w-40 h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        className="text-left hover:bg-gray-100 px-2 py-1 rounded text-xs w-full"
                        onClick={() => setEditingTime({ subtaskId: subtask.id, field: 'actualStartDate' })}
                      >
                        {formatDateTime(subtask.actualStartDate)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {editingTime?.subtaskId === subtask.id && editingTime?.field === 'actualEndDate' ? (
                      <Input
                        type="datetime-local"
                        value={formatDateTimeForInput(subtask.actualEndDate)}
                        onChange={(e) => updateSubtaskTime(subtask.id, 'actualEndDate', e.target.value)}
                        onBlur={() => setEditingTime(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingTime(null);
                          }
                        }}
                        className="w-40 h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        className="text-left hover:bg-gray-100 px-2 py-1 rounded text-xs w-full"
                        onClick={() => setEditingTime({ subtaskId: subtask.id, field: 'actualEndDate' })}
                      >
                        {formatDateTime(subtask.actualEndDate)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subtask.delayStatus === '延期' ? 'bg-red-100 text-red-800' :
                      subtask.delayStatus === '提前' ? 'bg-green-100 text-green-800' :
                      subtask.delayStatus === '准时' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {subtask.delayStatus}
                    </span>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暂无分配给我的子任务
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}