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
  MoreVertical,
  Archive
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
  status: '已上线'; // 归档的需求都是已上线状态
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
  archivedAt: string; // 归档时间
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

interface ArchivePageProps {
  onNavigate?: (page: string, context?: any) => void;
  type?: 'all' | 'version-requirements';
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

// 模拟归档的版本需求数据（已上线状态的需求）
const archivedVersionRequirements: VersionRequirement[] = [
  {
    id: 'arch-req-001',
    title: '图表设计',
    type: 'K线',
    version: 'v3.1.0',
    status: '已上线',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web',
    description: '完善K线图表的交互设计和视觉效果',
    startDate: '2024-04-01 09:00',
    endDate: '2024-04-30 18:00',
    createdAt: '2024-03-25 10:00',
    updatedAt: '2024-04-30 18:00',
    archivedAt: '2024-05-01 09:00',
    isOpen: false,
    scheduleReviewLevel1: { status: '已上线' },
    scheduleReviewLevel2: { status: '已上线' },
    subtasks: [
      {
        id: 'st-001',
        name: '原型设计',
        type: 'predefined',
        executor: mockUsers[8],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-01 09:00',
        estimatedEndDate: '2024-04-08 18:00',
        estimatedDuration: 56, // 7天 * 8小时
        actualStartDate: '2024-04-01 09:00',
        actualEndDate: '2024-04-07 16:30',
        actualDuration: 52, // 实际用时
        status: '已完成',
        delayStatus: '提前'
      },
      {
        id: 'st-002',
        name: '视觉设计',
        type: 'predefined',
        executor: mockUsers[2],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-08 09:00',
        estimatedEndDate: '2024-04-15 18:00',
        estimatedDuration: 56, // 7天 * 8小时
        actualStartDate: '2024-04-08 09:00',
        actualEndDate: '2024-04-15 17:45',
        actualDuration: 56, // 实际用时
        status: '已完成',
        delayStatus: '准时'
      },
      {
        id: 'st-003',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0],
        department: mockDepartments[2],
        estimatedStartDate: '2024-04-15 09:00',
        estimatedEndDate: '2024-04-25 18:00',
        estimatedDuration: 80, // 10天 * 8小时
        actualStartDate: '2024-04-15 09:00',
        actualEndDate: '2024-04-24 15:20',
        actualDuration: 76, // 实际用时
        status: '已完成',
        delayStatus: '提前'
      }
    ]
  },
  {
    id: 'arch-req-002',
    title: '硬盘设计',
    type: '行情',
    version: 'v3.1.0',
    status: '已上线',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: 'Mobile',
    description: '优化行情数据的存储和读取性能',
    startDate: '2024-04-06 09:00',
    endDate: '2024-04-19 18:00',
    createdAt: '2024-04-01 10:00',
    updatedAt: '2024-04-19 18:00',
    archivedAt: '2024-04-20 09:00',
    isOpen: false,
    scheduleReviewLevel1: { status: '已上线' },
    scheduleReviewLevel2: { status: '已上线' },
    subtasks: [
      {
        id: 'st-004',
        name: '后端开发',
        type: 'predefined',
        executor: mockUsers[1],
        department: mockDepartments[3],
        estimatedStartDate: '2024-04-06 09:00',
        estimatedEndDate: '2024-04-16 18:00',
        estimatedDuration: 80, // 10天 * 8小时
        actualStartDate: '2024-04-06 09:00',
        actualEndDate: '2024-04-16 18:00',
        actualDuration: 80, // 实际用时
        status: '已完成',
        delayStatus: '准时'
      },
      {
        id: 'st-005',
        name: '测试',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-04-16 09:00',
        estimatedEndDate: '2024-04-19 18:00',
        estimatedDuration: 24, // 3天 * 8小时
        actualStartDate: '2024-04-16 09:00',
        actualEndDate: '2024-04-19 17:30',
        actualDuration: 24, // 实际用时
        status: '已完成',
        delayStatus: '准时'
      }
    ]
  },
  {
    id: 'arch-req-003',
    title: '商务设计',
    type: '聊天室',
    version: 'v3.1.0',
    status: '已上线',
    priority: '低',
    assignee: mockUsers[2],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[2],
    platform: 'Web',
    description: '聊天室商务功能模块设计和实现',
    startDate: '2024-04-13 09:00',
    endDate: '2024-05-16 18:00',
    createdAt: '2024-04-10 10:00',
    updatedAt: '2024-05-16 18:00',
    archivedAt: '2024-05-17 09:00',
    isOpen: false,
    scheduleReviewLevel1: { status: '已上线' },
    scheduleReviewLevel2: { status: '已上线' },
    subtasks: [
      {
        id: 'st-006',
        name: '需求分析',
        type: 'custom',
        executor: mockUsers[5],
        department: mockDepartments[0],
        estimatedStartDate: '2024-04-13 09:00',
        estimatedEndDate: '2024-04-20 18:00',
        estimatedDuration: 56, // 7天 * 8小时
        actualStartDate: '2024-04-13 09:00',
        actualEndDate: '2024-04-22 18:00',
        actualDuration: 72, // 延期，实际用时更长
        status: '已完成',
        delayStatus: '延期'
      },
      {
        id: 'st-007',
        name: '界面设计',
        type: 'predefined',
        executor: mockUsers[2],
        department: mockDepartments[1],
        estimatedStartDate: '2024-04-20 09:00',
        estimatedEndDate: '2024-05-05 18:00',
        estimatedDuration: 120, // 15天 * 8小时
        actualStartDate: '2024-04-23 09:00',
        actualEndDate: '2024-05-06 18:00',
        actualDuration: 104, // 延期，但实际工时较少
        status: '已完成',
        delayStatus: '延期'
      }
    ]
  },
  {
    id: 'arch-req-004',
    title: '测试设计',
    type: '系统',
    version: 'v3.1.0',
    status: '已上线',
    priority: '紧急',
    assignee: mockUsers[6],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[3],
    platform: 'All',
    description: '系统测试流程设计和自动化测试',
    startDate: '2024-05-01 09:00',
    endDate: '2024-05-31 18:00',
    createdAt: '2024-04-25 10:00',
    updatedAt: '2024-05-31 18:00',
    archivedAt: '2024-06-01 09:00',
    isOpen: false,
    scheduleReviewLevel1: { status: '已上线' },
    scheduleReviewLevel2: { status: '已上线' },
    subtasks: [
      {
        id: 'st-008',
        name: '测试计划',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-05-01 09:00',
        estimatedEndDate: '2024-05-10 18:00',
        estimatedDuration: 72, // 9天 * 8小时
        actualStartDate: '2024-05-01 09:00',
        actualEndDate: '2024-05-09 18:00',
        actualDuration: 64, // 提前完成
        status: '已完成',
        delayStatus: '提前'
      }
    ]
  },
  {
    id: 'arch-req-005',
    title: '消息开发',
    type: '交易',
    version: 'v3.1.0',
    status: '已上线',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: 'Mobile',
    description: '交易消息推送和通知系统开发',
    startDate: '2024-05-05 09:00',
    endDate: '2024-06-19 18:00',
    createdAt: '2024-05-01 10:00',
    updatedAt: '2024-06-19 18:00',
    archivedAt: '2024-06-20 09:00',
    isOpen: false,
    scheduleReviewLevel1: { status: '已上线' },
    scheduleReviewLevel2: { status: '已���线' },
    subtasks: [
      {
        id: 'st-009',
        name: '消息服务开发',
        type: 'predefined',
        executor: mockUsers[1],
        department: mockDepartments[3],
        estimatedStartDate: '2024-05-05 09:00',
        estimatedEndDate: '2024-06-01 18:00',
        estimatedDuration: 216, // 27天 * 8小时
        actualStartDate: '2024-05-05 09:00',
        actualEndDate: '2024-06-01 18:00',
        actualDuration: 216, // 准时完成
        status: '已完成',
        delayStatus: '准时'
      },
      {
        id: 'st-010',
        name: '集成测试',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-06-01 09:00',
        estimatedEndDate: '2024-06-15 18:00',
        estimatedDuration: 112, // 14天 * 8小时
        actualStartDate: '2024-06-01 09:00',
        actualEndDate: '2024-06-14 18:00',
        actualDuration: 104, // 提前完成
        status: '已完成',
        delayStatus: '提前'
      }
    ]
  }
];

// 通用归档项目数据
const generalArchivedProjects = [
  {
    id: 'arch-001',
    name: 'K线图表性能优化',
    version: 'v2.1.0',
    type: 'K线',
    status: '已上线',
    assignee: { id: '1', name: '张开发', avatar: '', role: '开发工程师' },
    priority: '高',
    description: '优化K线图表渲染性能，支持更大数据量',
    startDate: '2024-08-15 09:00',
    endDate: '2024-09-10 18:00',
    completedDate: '2024-09-08 16:30',
    archivedDate: '2024-09-15 10:00'
  },
  {
    id: 'arch-002',
    name: '行情数据实时推送',
    version: 'v2.0.5',
    type: '行情',
    status: '已上线',
    assignee: { id: '2', name: '李前端', avatar: '', role: '前端工程师' },
    priority: '高',
    description: '实现行情数据的实时推送功能',
    startDate: '2024-07-20 09:00',
    endDate: '2024-08-25 18:00',
    completedDate: '2024-08-23 15:45',
    archivedDate: '2024-08-30 09:00'
  }
];

const priorityConfig = {
  '低': { className: 'bg-gray-100 text-gray-800 border-gray-200', sort: 1 },
  '中': { className: 'bg-blue-100 text-blue-800 border-blue-200', sort: 2 },
  '高': { className: 'bg-orange-100 text-orange-800 border-orange-200', sort: 3 },
  '紧急': { className: 'bg-red-100 text-red-800 border-red-200', sort: 4 }
};

// 筛选选项
const filterableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '需求类型' },
  { value: 'status', label: '状态' },
  { value: 'priority', label: '优先级' },
  { value: 'assignee', label: '执行人' },
  { value: 'productManager', label: '产品负责人' },
  { value: 'creator', label: '创建人' }
];

const sortableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '类型' },
  { value: 'status', label: '状态' },
  { value: 'priority', label: '优先级' },
  { value: 'assignee', label: '执行人' },
  { value: 'productManager', label: '产品负责人' },
  { value: 'creator', label: '创建人' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'archivedAt', label: '归档时间' }
];

export function ArchivePage({ onNavigate, type = 'all' }: ArchivePageProps) {
  
  // 根据type决定使用哪种数据和UI
  if (type === 'version-requirements') {
    return <VersionRequirementsArchive onNavigate={onNavigate} />;
  }

  // 通用归档页面的逻辑保持不变
  return <GeneralArchive onNavigate={onNavigate} />;
}

// 版本需求归档组件
function VersionRequirementsArchive({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [requirements, setRequirements] = useState<VersionRequirement[]>(archivedVersionRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});
  const [expandedRequirements, setExpandedRequirements] = useState(new Set<string>());
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null);

  // 根据搜索词和筛选条件过滤需求
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      // 搜索词过滤
      const matchesSearch = searchTerm === '' || 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.productManager.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 自定义筛选条件
      const matchesFilters = customFilters.every(filter => {
        const value = getFilterValue(req, filter.column);
        switch (filter.operator) {
          case 'contains':
            return value.toLowerCase().includes(filter.value.toLowerCase());
          case 'equals':
            return value === filter.value;
          case 'not_equals':
            return value !== filter.value;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
  }, [requirements, searchTerm, customFilters]);

  // 获取筛选值
  const getFilterValue = (req: VersionRequirement, column: string): string => {
    switch (column) {
      case 'title': return req.title;
      case 'type': return req.type;
      case 'status': return req.status;
      case 'priority': return req.priority;
      case 'assignee': return req.assignee.name;
      case 'productManager': return req.productManager.name;
      case 'creator': return req.creator.name;
      default: return '';
    }
  };

  // 按版本分组
  const groupedByVersion = useMemo(() => {
    const grouped = filteredRequirements.reduce((acc, req) => {
      if (!acc[req.version]) {
        acc[req.version] = [];
      }
      acc[req.version].push(req);
      return acc;
    }, {} as Record<string, VersionRequirement[]>);

    // 对每个版本内的需求进行排序
    Object.keys(grouped).forEach(version => {
      grouped[version].sort((a, b) => {
        if (!sortConfig) {
          return new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime();
        }

        let aValue: any;
        let bValue: any;

        switch (sortConfig.column) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'priority':
            aValue = priorityConfig[a.priority].sort;
            bValue = priorityConfig[b.priority].sort;
            break;
          case 'assignee':
            aValue = a.assignee.name;
            bValue = b.assignee.name;
            break;
          case 'productManager':
            aValue = a.productManager.name;
            bValue = b.productManager.name;
            break;
          case 'creator':
            aValue = a.creator.name;
            bValue = b.creator.name;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          case 'archivedAt':
            aValue = new Date(a.archivedAt);
            bValue = new Date(b.archivedAt);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    });

    return grouped;
  }, [filteredRequirements, sortConfig]);

  // 获取排序后的版本列表
  const sortedVersions = useMemo(() => {
    return Object.keys(groupedByVersion).sort((a, b) => {
      // 按版本号降序排列（最新版本在前）
      return b.localeCompare(a, undefined, { numeric: true });
    });
  }, [groupedByVersion]);

  // 初始化展开状态 - 默认展开前3个版本
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    sortedVersions.slice(0, 3).forEach((version, index) => {
      initialExpanded[version] = true;
    });
    setExpandedVersions(initialExpanded);
  }, [sortedVersions]);

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

  // 更新筛选条件
  const updateCustomFilter = (id: string, field: string, value: string) => {
    setCustomFilters(customFilters.map(filter => 
      filter.id === id ? { ...filter, [field]: value } : filter
    ));
  };

  // 删除筛选条件
  const removeCustomFilter = (id: string) => {
    setCustomFilters(customFilters.filter(filter => filter.id !== id));
  };

  // 清除所有筛选条件
  const clearAllFilters = () => {
    setCustomFilters([]);
    setSearchTerm('');
  };

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
        source: 'archive-version-requirements'
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
    // 归档的需求都是已上线状态
    return 'bg-green-100 text-green-800 border-green-200';
  };

  // 批量操作功能
  const handleBatchAction = (action: string) => {
    switch (action) {
      case 'restore':
        toast.success(`已将 ${selectedRequirements.length} 个需求恢复到版本需求管理`);
        break;
      case 'export':
        toast.success(`已导出 ${selectedRequirements.length} 个需求`);
        break;

      default:
        break;
    }
    setSelectedRequirements([]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                留档 - 版本需求
              </h1>
              <p className="text-muted-foreground mt-1">
                版本需求管理中已上线需求的存档，共 {requirements.length} 个需求
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                系统每天自动将版本需求管理中"已上线"状态的需求移动到此处存档
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleBatchAction('export')}
              disabled={selectedRequirements.length === 0}
            >
              导出数据
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBatchAction('restore')}
              disabled={selectedRequirements.length === 0}
            >
              恢复到版本需求
            </Button>

          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* 归档信息提示 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">
                  自动归档完成
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  昨天 23:00 系统自动将 5 个版本需求中已上线的项目移动到版本需求留档
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

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
                                <SelectItem value="contains">包含</SelectItem>
                                <SelectItem value="equals">等于</SelectItem>
                                <SelectItem value="not_equals">不等于</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input
                              placeholder="筛选值"
                              value={filter.value}
                              onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                              className="flex-1"
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomFilter(filter.id)}
                              className="p-1 h-auto"
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
                </div>
              </div>

              {/* 批量操作 */}
              {selectedRequirements.length > 0 && (
                <div className="flex items-center gap-2">
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
                      <DropdownMenuItem onSelect={() => handleBatchAction('restore')}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        恢复到版本需求
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleBatchAction('export')}>
                        <Copy className="h-4 w-4 mr-2" />
                        导出选中项
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onSelect={() => handleBatchAction('delete')}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        永久删除
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
                              {groupedByVersion[version].length} 个需求（已上线归档）
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          已上线: {groupedByVersion[version].length}
                        </Badge>
                        
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
                        <TableRow className="hover:bg-transparent table-header-unified">
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
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleColumnSort('assignee')}
                          >
                            <div className="flex items-center">
                              执行人
                              {getSortIcon('assignee')}
                            </div>
                          </TableHead>
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
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleColumnSort('archivedAt')}
                          >
                            <div className="flex items-center">
                              归档时间
                              {getSortIcon('archivedAt')}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByVersion[version].map((requirement) => (
                          <React.Fragment key={requirement.id}>
                            {/* 主需求行 */}
                            <TableRow className="group table-content-unified">
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
                                    className="p-1 h-auto"
                                    onClick={() => toggleRequirementExpansion(requirement.id)}
                                  >
                                    {expandedRequirements.has(requirement.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <div 
                                    className="cursor-pointer hover:text-blue-600"
                                    onClick={() => handleRequirementTitleClick(requirement)}
                                  >
                                    <div className="font-medium">{requirement.title}</div>

                                  </div>
                                </div>
                              </TableCell>
                              {!hiddenColumns.includes('status') && (
                                <TableCell>
                                  <Badge 
                                    variant="secondary" 
                                    className={`badge-unified ${getStatusColor(requirement.status)}`}
                                  >
                                    {requirement.status}
                                  </Badge>
                                </TableCell>
                              )}
                              {!hiddenColumns.includes('priority') && (
                                <TableCell>
                                  <Badge 
                                    variant="secondary" 
                                    className={`badge-unified ${getPriorityColor(requirement.priority)}`}
                                  >
                                    {requirement.priority}
                                  </Badge>
                                </TableCell>
                              )}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.assignee.avatar} />
                                    <AvatarFallback>
                                      {requirement.assignee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{requirement.assignee.name}</span>
                                </div>
                              </TableCell>
                              {!hiddenColumns.includes('productManager') && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={requirement.productManager.avatar} />
                                      <AvatarFallback>
                                        {requirement.productManager.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{requirement.productManager.name}</span>
                                  </div>
                                </TableCell>
                              )}
                              {!hiddenColumns.includes('creator') && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={requirement.creator.avatar} />
                                      <AvatarFallback>
                                        {requirement.creator.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{requirement.creator.name}</span>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell className="table-helper-text-unified">
                                {formatDateTime(requirement.archivedAt)}
                              </TableCell>
                            </TableRow>

                            {/* 子任务行 */}
                            {expandedRequirements.has(requirement.id) && (
                              <TableRow>
                                <TableCell colSpan={8} className="p-0 border-b-0">
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
                                            .filter(st => st.actualDuration)
                                            .reduce((sum, st) => sum + (st.actualDuration || 0), 0);
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
                                        >
                                          <div className="grid grid-cols-20 gap-4 items-center">
                                            {/* 子任务名称 */}
                                            <div className="col-span-3">
                                              <span className="font-medium text-sm">
                                                {subtask.name}
                                              </span>
                                            </div>

                                            {/* 负责人 */}
                                            <div className="col-span-2">
                                              {subtask.executor && (
                                                <div className="flex items-center gap-2">
                                                  <Avatar className="h-5 w-5">
                                                    <AvatarImage src={subtask.executor.avatar} />
                                                    <AvatarFallback>
                                                      {subtask.executor.name.charAt(0)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-xs">{subtask.executor.name}</span>
                                                </div>
                                              )}
                                            </div>

                                            {/* 状态 */}
                                            <div className="col-span-2">
                                              <Badge 
                                                variant="outline" 
                                                className={`badge-unified text-xs ${
                                                  subtask.status === '已完成' ? 'bg-green-100 text-green-800 border-green-200' :
                                                  subtask.status === '进行中' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                  'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}
                                              >
                                                {subtask.status}
                                              </Badge>
                                            </div>

                                            {/* 预估开始时间 */}
                                            <div className="col-span-2">
                                              <span className="text-xs text-gray-600">
                                                {formatDateTime(subtask.estimatedStartDate)}
                                              </span>
                                            </div>

                                            {/* 预估结束时间 */}
                                            <div className="col-span-2">
                                              <span className="text-xs text-gray-600">
                                                {formatDateTime(subtask.estimatedEndDate)}
                                              </span>
                                            </div>

                                            {/* 预估工期 */}
                                            <div className="col-span-1">
                                              <span className="text-xs text-gray-600">
                                                {subtask.estimatedDuration ? `${subtask.estimatedDuration}h` : '-'}
                                              </span>
                                            </div>

                                            {/* 实际开始 */}
                                            <div className="col-span-2">
                                              <span className="text-xs text-gray-600">
                                                {formatDateTime(subtask.actualStartDate)}
                                              </span>
                                            </div>

                                            {/* 实际结束 */}
                                            <div className="col-span-2">
                                              <span className="text-xs text-gray-600">
                                                {formatDateTime(subtask.actualEndDate)}
                                              </span>
                                            </div>

                                            {/* 实际工期 */}
                                            <div className="col-span-1">
                                              <span className="text-xs text-gray-600">
                                                {subtask.actualDuration ? `${subtask.actualDuration}h` : '-'}
                                              </span>
                                            </div>

                                            {/* 延期状态 */}
                                            <div className="col-span-1">
                                              <Badge 
                                                variant="outline" 
                                                className={`badge-unified text-xs ${
                                                  subtask.delayStatus === '延期' ? 'bg-red-100 text-red-800 border-red-200' :
                                                  subtask.delayStatus === '提前' ? 'bg-green-100 text-green-800 border-green-200' :
                                                  subtask.delayStatus === '准时' ? 'bg-blue-100 text-blue-800 border-blue-200' :
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {filteredRequirements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无版本需求留档</h3>
              <p className="text-muted-foreground">
                {searchTerm || customFilters.length > 0
                  ? '没有符合筛选条件的归档需求'
                  : '还没有任何已归档的版本需求'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// 通用归档页面组件（保持原有功能不变）
function GeneralArchive({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [versionFilter, setVersionFilter] = useState<string>('全部版本');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('全部成员');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof generalArchivedProjects[0] | 'assigneeName';
    direction: 'asc' | 'desc';
  }>({ key: 'archivedDate', direction: 'desc' });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    type: true,
    version: true,
    assignee: true,
    priority: true,
    completedDate: true,
    archivedDate: true,
    description: true
  });

  const typeColors = {
    'K线': 'bg-blue-100 text-blue-800',
    '行情': 'bg-green-100 text-green-800',
    '聊天室': 'bg-purple-100 text-purple-800',
    '系统': 'bg-gray-100 text-gray-800',
    '交易': 'bg-orange-100 text-orange-800'
  };

  const priorityColors = {
    '高': 'bg-red-100 text-red-800',
    '中': 'bg-yellow-100 text-yellow-800',
    '低': 'bg-green-100 text-green-800'
  };

  // 获取所有版本列表
  const versions = useMemo(() => {
    const versionSet = new Set(generalArchivedProjects.map(p => p.version));
    return Array.from(versionSet).sort();
  }, []);

  // 获取所有成员列表
  const assignees = useMemo(() => {
    const assigneeMap = new Map();
    generalArchivedProjects.forEach(p => {
      assigneeMap.set(p.assignee.id, p.assignee.name);
    });
    return Array.from(assigneeMap.values()).sort();
  }, []);

  // 筛选和排序数据
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = generalArchivedProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === '全部' || project.type === typeFilter;
      const matchesVersion = versionFilter === '全部版本' || project.version === versionFilter;
      const matchesAssignee = assigneeFilter === '全部成员' || project.assignee.name === assigneeFilter;
      
      return matchesSearch && matchesType && matchesVersion && matchesAssignee;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'assigneeName') {
        aValue = a.assignee.name;
        bValue = b.assignee.name;
      } else {
        aValue = a[sortConfig.key as keyof typeof a];
        bValue = b[sortConfig.key as keyof typeof b];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [searchTerm, typeFilter, versionFilter, assigneeFilter, sortConfig]);

  const handleSort = (key: keyof typeof generalArchivedProjects[0] | 'assigneeName') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects(current =>
      current.includes(projectId)
        ? current.filter(id => id !== projectId)
        : [...current, projectId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProjects(
      selectedProjects.length === filteredAndSortedProjects.length
        ? []
        : filteredAndSortedProjects.map(p => p.id)
    );
  };



  const handleBatchExport = () => {
    if (selectedProjects.length === 0) return;
    
    toast.success(`已导出 ${selectedProjects.length} 个留档项目`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('全部');
    setVersionFilter('全部版本');
    setAssigneeFilter('全部成员');
  };

  const getSortIcon = (columnKey: keyof typeof generalArchivedProjects[0] | 'assigneeName') => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-foreground" />
      : <ArrowDown className="h-4 w-4 text-foreground" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Archive className="h-8 w-8 text-gray-600" />
            留档
          </h1>
          <p className="text-muted-foreground mt-1">
            已上线需求的存档管理，共 {generalArchivedProjects.length} 个项目
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            系统每天自动将版本需求管理中"已上线"状态的需求移动到此处存档
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleBatchExport}
            disabled={selectedProjects.length === 0}
          >
            导出数据
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (selectedProjects.length === 0) return;
              toast.success(`已将 ${selectedProjects.length} 个项目恢复到版本需求管理`);
              setSelectedProjects([]);
            }}
            disabled={selectedProjects.length === 0}
          >
            恢复到版本需求
          </Button>

        </div>
      </div>

      {/* 最近归档提示 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                自动归档完成
              </div>
              <div className="text-xs text-blue-700 mt-1">
                昨天 23:00 系统自动将 3 个已上线需求移动到留档："交易风控升级"、"K线指标算法优化"、"聊天室表情包功能"
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-800"
              onClick={() => toast.info('下次自动归档时间：今天 23:00')}
            >
              查看详情
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索项目名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="项目类型" />
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
            <Select value={versionFilter} onValueChange={setVersionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="版本" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部版本">全部版本</SelectItem>
                {versions.map(version => (
                  <SelectItem key={version} value={version}>{version}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="负责人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部成员">全部成员</SelectItem>
                {assignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" />
              重置
            </Button>
            
            {/* 列显示控制 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <EyeOff className="h-4 w-4 mr-1" />
                  列显示
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {Object.entries(visibleColumns).map(([key, visible]) => (
                  <div key={key} className="flex items-center space-x-2 px-2 py-1">
                    <Checkbox
                      id={key}
                      checked={visible}
                      onCheckedChange={(checked) => 
                        setVisibleColumns(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={key} className="flex-1 text-sm">
                      {key === 'name' && '项目名称'}
                      {key === 'type' && '类型'}
                      {key === 'version' && '版本'}
                      {key === 'assignee' && '负责人'}
                      {key === 'priority' && '优先级'}
                      {key === 'completedDate' && '完成时间'}
                      {key === 'archivedDate' && '归档时间'}
                      {key === 'description' && '描述'}
                    </Label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作提示 */}
      {selectedProjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-blue-800">
            已选择 {selectedProjects.length} 个项目
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProjects([])}
          >
            取消选择
          </Button>
        </div>
      )}

      {/* 数据表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="table-header-unified">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProjects.length === filteredAndSortedProjects.length && filteredAndSortedProjects.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      项目名称
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.type && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-2">
                      类型
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.version && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center gap-2">
                      版本
                      {getSortIcon('version')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.assignee && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('assigneeName')}
                  >
                    <div className="flex items-center gap-2">
                      负责人
                      {getSortIcon('assigneeName')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.priority && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      优先级
                      {getSortIcon('priority')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.completedDate && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('completedDate')}
                  >
                    <div className="flex items-center gap-2">
                      完成时间
                      {getSortIcon('completedDate')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.archivedDate && (
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('archivedDate')}
                  >
                    <div className="flex items-center gap-2">
                      归档时间
                      {getSortIcon('archivedDate')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.description && (
                  <TableHead>描述</TableHead>
                )}
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.map((project) => (
                <TableRow key={project.id} className="table-content-unified">
                  <TableCell>
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => handleSelectProject(project.id)}
                    />
                  </TableCell>
                  {visibleColumns.name && (
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                    </TableCell>
                  )}
                  {visibleColumns.type && (
                    <TableCell>
                      <Badge variant="secondary" className={`badge-unified ${typeColors[project.type as keyof typeof typeColors]}`}>
                        {project.type}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.version && (
                    <TableCell>
                      <Badge variant="outline" className="badge-unified">
                        {project.version}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.assignee && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project.assignee.avatar} />
                          <AvatarFallback>{project.assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{project.assignee.name}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.priority && (
                    <TableCell>
                      <Badge variant="secondary" className={`badge-unified ${priorityColors[project.priority as keyof typeof priorityColors]}`}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.completedDate && (
                    <TableCell className="table-helper-text-unified">
                      {project.completedDate}
                    </TableCell>
                  )}
                  {visibleColumns.archivedDate && (
                    <TableCell className="table-helper-text-unified">
                      {project.archivedDate}
                    </TableCell>
                  )}
                  {visibleColumns.description && (
                    <TableCell className="max-w-xs">
                      <div className="truncate table-helper-text-unified" title={project.description}>
                        {project.description}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onNavigate?.('requirement-detail', { requirementId: project.id })}>
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toast.success(`已将"${project.name}"恢复到版本需求管理`);
                        }}>
                          恢复到版本需求
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          导出项目
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => {
                          toast.success(`已删除"${project.name}"`);
                        }}>
                          永久删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAndSortedProjects.length === 0 && (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无留档项目</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== '全部' || versionFilter !== '全部版本' || assigneeFilter !== '全部成员'
                  ? '没有符合筛选条件的项目'
                  : '还没有任何已归档的项目'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}