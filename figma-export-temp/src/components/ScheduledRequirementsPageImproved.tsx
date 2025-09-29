import React, { useState, useRef, useEffect } from 'react';
import { useVersions } from './VersionContext';
import { 
  Search, 
  Filter, 
  BarChart3, 
  FolderOpen, 
  Upload, 
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Flame,
  Zap,
  Bug,
  Lightbulb,
  Settings,
  Users,
  Calendar,
  User,
  FileText,
  ArrowRight,
  ArrowLeft,
  Tag,
  Paperclip,
  Link,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Edit,
  X,
  EyeOff,
  MoreHorizontal,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Move
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface Requirement {
  id: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  platform?: string;
  plannedVersion?: string;
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  prototypeId?: string;
  assignee?: User;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '/avatars/user1.jpg', email: 'zhangsan@company.com' },
  { id: '2', name: '李四', avatar: '/avatars/user2.jpg', email: 'lisi@company.com' },
  { id: '3', name: '王五', avatar: '/avatars/user3.jpg', email: 'wangwu@company.com' },
  { id: '4', name: '赵六', avatar: '/avatars/user4.jpg', email: 'zhaoliu@company.com' },
  { id: '5', name: '孙七', avatar: '/avatars/user5.jpg', email: 'sunqi@company.com' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 版本列表现在从 VersionContext 获取

// 可选的需求类型
const requirementTypes = [
  '新功能', '优化', 'BUG', '用户反馈', '商务需求'
];

// 可选的优先级
const priorities = [
  '低', '中', '高', '紧急'
];

// 可选的应用端
const platforms = [
  'Web端', '移动端', '全平台', 'PC端', '小程序'
];

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: '标题' },
  { value: 'type', label: '类型' },
  { value: 'priority', label: '优先级' },
  { value: 'creator', label: '创建人' },
  { value: 'platform', label: '应用端' },
  { value: 'plannedVersion', label: '预排期版本' },
  { value: 'reviewStatus', label: '评审状态' },
  { value: 'createdAt', label: '创建时间' }
];

// 筛选操作符
const filterOperators = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
  { value: 'is_duplicate', label: '重复' }
];

// 预排期需求数据
const mockScheduledRequirements: Requirement[] = [
  // v2.1.0 版本需求 (5个)
  {
    id: '1',
    title: '用户注册流程优化',
    type: '优化',
    status: '待评审',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。',
    tags: ['用户体验', 'UI优化'],
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-20 16:45',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0]
  },
  {
    id: '2',
    title: '个人中心界面重构',
    type: '优化',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '重构个人中心界面，提供更好的用户信息管理和个性化设置功能。',
    tags: ['UI重构', '个人中心'],
    createdAt: '2024-01-12 10:15',
    updatedAt: '2024-01-19 14:20',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[2]
  },
  {
    id: '3',
    title: '消息推送系统优化',
    type: '新功能',
    status: '开发中',
    priority: '高',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '优化消息推送系统，支持多渠道推送和个性化推送设置。',
    tags: ['消息推送', '通知'],
    createdAt: '2024-01-14 09:00',
    updatedAt: '2024-01-21 11:30',
    platform: '全平台',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4]
  },
  {
    id: '4',
    title: '用户反馈收集机制',
    type: '用户反馈',
    status: '评审中',
    priority: '中',
    creator: mockUsers[4],
    project: mockProjects[3],
    description: '建立完善的用户反馈收集机制，包括问题反馈、建议收集和满意度调查。',
    tags: ['用户反馈', '满意度'],
    createdAt: '2024-01-16 15:45',
    updatedAt: '2024-01-22 09:15',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[0]
  },
  {
    id: '5',
    title: 'K线图交互体验优化',
    type: 'BUG',
    status: '已完成',
    priority: '低',
    creator: mockUsers[2],
    project: mockProjects[0],
    description: '修复K线图在移动端的交互问题，优化缩放和滑动体验。',
    tags: ['K线图', '移动端', '交互'],
    createdAt: '2024-01-18 13:20',
    updatedAt: '2024-01-24 16:30',
    platform: '移动端',
    plannedVersion: 'v2.1.0',
    isOpen: false,
    reviewer1: mockUsers[3],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },

  // v2.2.0 版本需求 (5个)
  {
    id: '6',
    title: '数据分析功能增强',
    type: '商务需求',
    status: '评审中',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '增强数据分析功能，提供更详细的用户行为分析和业务洞察。',
    tags: ['数据分析', '用户行为'],
    createdAt: '2024-01-18 09:30',
    updatedAt: '2024-01-22 14:15',
    platform: 'Web端',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[3]
  },
  {
    id: '7',
    title: '行情数据实时同步',
    type: '新功能',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[1],
    description: '实现行情数据的实时同步功能，确保数据的及时性和准确性。',
    tags: ['行情数据', '实时同步'],
    createdAt: '2024-01-20 08:45',
    updatedAt: '2024-01-25 12:00',
    platform: '全平台',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[2],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[4]
  },
  {
    id: '8',
    title: '聊天室表情包功能',
    type: '新功能',
    status: '评审通过',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[2],
    description: '在聊天室中添加表情包功能，提升用户互动体验。',
    tags: ['聊天室', '表情包', '互动'],
    createdAt: '2024-01-22 11:15',
    updatedAt: '2024-01-26 15:40',
    platform: '移动端',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  {
    id: '9',
    title: '系统性能监控优化',
    type: '优化',
    status: '开发中',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '优化系统性能监控机制，提供实时性能指标和告警功能。',
    tags: ['性能监控', '系统优化'],
    createdAt: '2024-01-24 14:20',
    updatedAt: '2024-01-28 10:35',
    platform: 'PC端',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[0]
  },
  {
    id: '10',
    title: '交易模块安全增强',
    type: 'BUG',
    status: '评审中',
    priority: '紧急',
    creator: mockUsers[3],
    project: mockProjects[4],
    description: '修复交易模块的安全漏洞，增强数据加密和权限验证。',
    tags: ['交易安全', '数据加密'],
    createdAt: '2024-01-26 16:50',
    updatedAt: '2024-01-29 13:25',
    platform: '全平台',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[2]
  },

  // v2.3.0 版本需求 (5个)
  {
    id: '11',
    title: 'K线图实时更新优化',
    type: '优化',
    status: '开发中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。',
    tags: ['K线', '实时数据', '性能优化'],
    createdAt: '2024-01-20 10:00',
    updatedAt: '2024-01-25 17:30',
    platform: 'Web端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4]
  },
  {
    id: '12',
    title: '多语言国际化支持',
    type: '新功能',
    status: '待评审',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[3],
    description: '添加多语言国际化支持，支持英文、繁体中文等多种语言。',
    tags: ['国际化', '多语言'],
    createdAt: '2024-01-28 09:30',
    updatedAt: '2024-02-01 14:45',
    platform: '全平台',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[4],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[1]
  },
  {
    id: '13',
    title: '数据导出功能扩展',
    type: '商务需求',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[4],
    project: mockProjects[1],
    description: '扩展数据导出功能，支持多种格式导出和批量导出操作。',
    tags: ['数据导出', '批量操作'],
    createdAt: '2024-01-30 11:20',
    updatedAt: '2024-02-03 16:15',
    platform: 'Web端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[0]
  },
  {
    id: '14',
    title: '聊天室文件传输功能',
    type: '用户反馈',
    status: '设计中',
    priority: '低',
    creator: mockUsers[1],
    project: mockProjects[2],
    description: '根据用户反馈，在聊天室中添加文件传输功能，支持图片、文档等文件类型。',
    tags: ['聊天室', '文件传输'],
    createdAt: '2024-02-01 15:40',
    updatedAt: '2024-02-04 12:30',
    platform: '移动端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[3]
  },
  {
    id: '15',
    title: '交易历史记录查询优化',
    type: 'BUG',
    status: '已完成',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[4],
    description: '修复交易历史记录查询的性能问题，优化查询速度和结果展示。',
    tags: ['交易历史', '查询优化'],
    createdAt: '2024-02-02 13:15',
    updatedAt: '2024-02-05 09:45',
    platform: 'PC端',
    plannedVersion: 'v2.3.0',
    isOpen: false,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[2]
  }
];

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 评审状态配置
const reviewerStatusLabels = {
  pending: { label: '待评审', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  approved: { label: '已通过', variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  rejected: { label: '已拒绝', variant: 'secondary' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

interface ScheduledRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
  context?: any;
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

export function ScheduledRequirementsPageWithReview({ onNavigate, context }: ScheduledRequirementsPageProps) {
  // 获取版本号数据
  const { getAllVersionNumbers } = useVersions();
  const availableVersions = getAllVersionNumbers();
  
  const [requirements, setRequirements] = useState<Requirement[]>(mockScheduledRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockScheduledRequirements.map(r => r.plannedVersion || '未分配版本'))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });
  const [showMessage, setShowMessage] = useState(false);
  const [highlightRequirementId, setHighlightRequirementId] = useState<string>('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 处理版本选择
  const handleVersionSelect = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, plannedVersion: version === 'unassigned' ? undefined : version, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理类型修改
  const handleTypeChange = (requirementId: string, type: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, type, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理优先级修改
  const handlePriorityChange = (requirementId: string, priority: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, priority, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理应用端修改
  const handlePlatformChange = (requirementId: string, platform: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, platform, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  const handleRequirementClick = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', {
        requirementId: requirement.id,
        source: 'scheduled-requirements'
      });
    }
  };

  // 处理单个需求选择
  const handleRequirementSelect = (requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements(prev => [...prev, requirementId]);
    } else {
      setSelectedRequirements(prev => prev.filter(id => id !== requirementId));
      setIsAllSelected(false);
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      setSelectedRequirements(filteredRequirements.map(req => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  // 批量移动到版本需求管理
  const handleBatchMoveToVersionRequirements = () => {
    if (selectedRequirements.length === 0) return;
    
    // 这里可以添加实际的移动逻辑
    console.log('批量移动需求到版本需求管理:', selectedRequirements);
    
    // 清空选择
    setSelectedRequirements([]);
    setIsAllSelected(false);
    
    // 导航到版本需求管理页面
    if (onNavigate) {
      onNavigate('version-requirements', {
        message: `成功移动 ${selectedRequirements.length} 个需求到版本需求管理`,
        movedRequirements: selectedRequirements
      });
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

  // 切换列显示/隐藏
  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  // 排序处理
  const handleSort = (column: string, direction?: 'asc' | 'desc') => {
    if (direction) {
      setSortConfig({ column, direction });
    } else {
      setSortConfig(null);
    }
  };

  // 应用自定义筛选逻辑
  const applyCustomFilters = (requirement: Requirement, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.column || !filter.operator) return true;
      
      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = requirement.title;
          break;
        case 'type':
          fieldValue = requirement.type;
          break;
        case 'priority':
          fieldValue = requirement.priority;
          break;
        case 'creator':
          fieldValue = requirement.creator.name;
          break;
        case 'platform':
          fieldValue = requirement.platform || '';
          break;
        case 'plannedVersion':
          fieldValue = requirement.plannedVersion || '';
          break;
        case 'reviewStatus':
          fieldValue = requirement.reviewStatus === 'approved' ? '评审通过' :
                     requirement.reviewStatus === 'rejected' ? '评审拒绝' :
                     requirement.reviewStatus === 'second_review' ? '二级评审中' :
                     requirement.reviewStatus === 'first_review' ? '一级评审中' :
                     '待评审';
          break;
        case 'createdAt':
          fieldValue = requirement.createdAt;
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
        case 'is_duplicate':
          // 检查是否有其他记录的该字段值相同
          return requirements.some(r => 
            r.id !== requirement.id && 
            (r as any)[filter.column]?.toString().toLowerCase() === fieldValueLower
          );
        default:
          return true;
      }
    });
  };

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = !searchTerm || 
      requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCustomFilters = applyCustomFilters(requirement, customFilters);

    return matchesSearch && matchesCustomFilters;
  });

  // 按预排期版本分组
  const groupedByVersion = filteredRequirements.reduce((groups, requirement) => {
    const version = requirement.plannedVersion || '未分配版本';
    
    if (!groups[version]) {
      groups[version] = [];
    }
    groups[version].push(requirement);
    return groups;
  }, {} as Record<string, Requirement[]>);

  // 版本排序
  const sortedVersions = Object.keys(groupedByVersion).sort((a, b) => {
    if (a === '未分配版本') return -1;
    if (b === '未分配版本') return 1;
    
    const versionToNumber = (version: string) => {
      const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
      }
      return 0;
    };
    
    return versionToNumber(b) - versionToNumber(a);
  });

  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  // 计算可见列数
  const getVisibleColumnCount = () => {
    const allColumns = ['type', 'priority', 'creator', 'platform', 'plannedVersion', 'reviewer1', 'reviewer2', 'reviewStatus'];
    const visibleColumns = allColumns.filter(col => !hiddenColumns.includes(col));
    return visibleColumns.length + 2; // +2 for checkbox and title columns
  };

  // 处理导航上下文中的消息提示
  React.useEffect(() => {
    if (context?.message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      
      if (context?.highlightRequirementId) {
        setHighlightRequirementId(context.highlightRequirementId);
        const highlightTimer = setTimeout(() => {
          setHighlightRequirementId('');
        }, 5000);
        return () => {
          clearTimeout(timer);
          clearTimeout(highlightTimer);
        };
      }
      
      return () => clearTimeout(timer);
    }
  }, [context]);

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">预排期需求管理</h1>
            <p className="text-muted-foreground mt-1">
              预排期需求管理和评审跟踪
            </p>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 消息提示 */}
        {showMessage && context?.message && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-green-800">{context.message}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowMessage(false)}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

                {/* 新功能按钮组 */}
                <div className="flex items-center gap-2">
                  {/* 隐藏列 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <EyeOff className="h-4 w-4 mr-2" />
                        隐藏列
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('type')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('type')} />
                        类型
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('priority')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('priority')} />
                        优先级
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('creator')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('creator')} />
                        创建人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('platform')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('platform')} />
                        应用端
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('plannedVersion')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('plannedVersion')} />
                        预排期版本
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer1')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer1')} />
                        一级评审
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer2')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer2')} />
                        二级评审
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewStatus')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewStatus')} />
                        评审状态
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 筛选设置 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-4 w-4 mr-2" />
                        筛选设置
                        {customFilters.length > 0 && (
                          <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                            {customFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80">
                      {/* 自定义筛选 */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">自定义筛选</h4>
                          <Button variant="ghost" size="sm" onClick={addCustomFilter} className="h-6 px-2">
                            <Plus className="h-3 w-3 mr-1" />
                            添加
                          </Button>
                        </div>
                        
                        {customFilters.length === 0 ? (
                          <p className="text-xs text-muted-foreground">暂无自定义筛选条件</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {customFilters.map((filter) => (
                              <div key={filter.id} className="border rounded p-2 space-y-2 bg-muted/30">
                                <div className="flex items-center gap-2">
                                  <Select 
                                    value={filter.column} 
                                    onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                                  >
                                    <SelectTrigger className="h-6 text-xs flex-1">
                                      <SelectValue placeholder="选择列" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filterableColumns.map(col => (
                                        <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeCustomFilter(filter.id)}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <Select 
                                  value={filter.operator} 
                                  onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                                >
                                  <SelectTrigger className="h-6 text-xs">
                                    <SelectValue placeholder="选择条件" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filterOperators.map(op => (
                                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {!['is_empty', 'is_not_empty', 'is_duplicate'].includes(filter.operator) && (
                                  <Input
                                    placeholder="输入筛选值"
                                    value={filter.value}
                                    onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                                    className="h-6 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenuSeparator />
                      <div className="p-3">
                        <Button variant="ghost" size="sm" className="w-full h-7" onClick={clearAllFilters}>
                          <X className="h-3 w-3 mr-2" />
                          清除所有筛选
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
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleSort('title', 'asc')}>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        标题 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('title', 'desc')}>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        标题 ↓
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSort('priority', 'asc')}>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        优先级 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('priority', 'desc')}>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        优先级 ↓
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSort('createdAt', 'desc')}>
                        <Clock className="h-4 w-4 mr-2" />
                        创建时间（最新）
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('createdAt', 'asc')}>
                        <Clock className="h-4 w-4 mr-2" />
                        创建时间（最早）
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSort('', 'asc')}>
                        <X className="h-4 w-4 mr-2" />
                        清除排序
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedRequirements.length > 0 && (
                  <Button 
                    onClick={handleBatchMoveToVersionRequirements}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Move className="h-4 w-4 mr-2" />
                    移动到版本需求管理 ({selectedRequirements.length})
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  共 {filteredRequirements.length} 个需求
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 需求列表 - 按版本分组 */}
        {sortedVersions.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无预排期需求</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  还没有任何预排期需求，请先在需求池中评审通过需求并分配版本。
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>标题</TableHead>
                    {!hiddenColumns.includes('type') && <TableHead>类型</TableHead>}
                    {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                    {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                    {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
                    {!hiddenColumns.includes('plannedVersion') && <TableHead>预排期版本</TableHead>}
                    {!hiddenColumns.includes('reviewer1') && <TableHead>一级评审</TableHead>}
                    {!hiddenColumns.includes('reviewer2') && <TableHead>二级评审</TableHead>}
                    {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVersions.map((version) => {
                    const versionRequirements = groupedByVersion[version];
                    const isExpanded = expandedVersions[version];
                    
                    return (
                      <React.Fragment key={version}>
                        {/* 版本分组头 */}
                        <TableRow 
                          className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-t-2 border-border"
                          onClick={() => toggleVersionExpanded(version)}
                        >
                          <TableCell colSpan={getVisibleColumnCount()} className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div className="flex items-center gap-3">
                                  {version === '未分配版本' ? (
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <GitBranch className="h-4 w-4 text-primary" />
                                  )}
                                  <div>
                                    <span className="font-medium">{version}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {versionRequirements.length} 个需求
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* 版本需求列表 */}
                        {isExpanded && versionRequirements.map((requirement) => (
                          <TableRow 
                            key={requirement.id} 
                            className={`hover:bg-muted/50 ${highlightRequirementId === requirement.id ? 'bg-yellow-50' : ''}`}
                          >
                            {/* 选择框 */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedRequirements.includes(requirement.id)}
                                onCheckedChange={(checked) => handleRequirementSelect(requirement.id, checked as boolean)}
                              />
                            </TableCell>

                            {/* 标题 */}
                            <TableCell onClick={() => handleRequirementClick(requirement)} className="cursor-pointer">
                              <div>
                                <div className="font-medium text-primary hover:underline">{requirement.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                  {requirement.description}
                                </div>
                              </div>
                            </TableCell>

                            {/* 类型 - 可编辑 */}
                            {!hiddenColumns.includes('type') && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.type}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {requirementTypes.map((type) => (
                                      <DropdownMenuItem 
                                        key={type} 
                                        onClick={() => handleTypeChange(requirement.id, type)}
                                      >
                                        {type}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}

                            {/* 优先级 - 可编辑 */}
                            {!hiddenColumns.includes('priority') && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant={priorityConfig[requirement.priority].variant}
                                      className={`cursor-pointer text-xs ${priorityConfig[requirement.priority].className}`}
                                    >
                                      {requirement.priority}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {Object.keys(priorityConfig).map((priority) => (
                                      <DropdownMenuItem 
                                        key={priority} 
                                        onClick={() => handlePriorityChange(requirement.id, priority)}
                                      >
                                        {priority}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}

                            {/* 创建人 */}
                            {!hiddenColumns.includes('creator') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.creator.avatar} />
                                    <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{requirement.creator.name}</span>
                                </div>
                              </TableCell>
                            )}

                            {/* 应用端 - 可编辑 */}
                            {!hiddenColumns.includes('platform') && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.platform}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {platforms.map((platform) => (
                                      <DropdownMenuItem 
                                        key={platform} 
                                        onClick={() => handlePlatformChange(requirement.id, platform)}
                                      >
                                        {platform}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}

                            {/* 预排期版本 - 可编辑 */}
                            {!hiddenColumns.includes('plannedVersion') && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                      {requirement.plannedVersion || '未分配'}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleVersionSelect(requirement.id, 'unassigned')}>
                                      未分配版本
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {availableVersions.map((version) => (
                                      <DropdownMenuItem 
                                        key={version} 
                                        onClick={() => handleVersionSelect(requirement.id, version)}
                                      >
                                        {version}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}

                            {/* 一级评审 */}
                            {!hiddenColumns.includes('reviewer1') && (
                              <TableCell>
                                {requirement.reviewer1 ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={requirement.reviewer1.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {requirement.reviewer1.name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <Badge 
                                      variant={reviewerStatusLabels[requirement.reviewer1Status || 'pending'].variant}
                                      className={`text-xs ${reviewerStatusLabels[requirement.reviewer1Status || 'pending'].className}`}
                                    >
                                      {reviewerStatusLabels[requirement.reviewer1Status || 'pending'].label}
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">未指定</span>
                                )}
                              </TableCell>
                            )}

                            {/* 二级评审 */}
                            {!hiddenColumns.includes('reviewer2') && (
                              <TableCell>
                                {requirement.reviewer2 ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={requirement.reviewer2.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {requirement.reviewer2.name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <Badge 
                                      variant={reviewerStatusLabels[requirement.reviewer2Status || 'pending'].variant}
                                      className={`text-xs ${reviewerStatusLabels[requirement.reviewer2Status || 'pending'].className}`}
                                    >
                                      {reviewerStatusLabels[requirement.reviewer2Status || 'pending'].label}
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">未指定</span>
                                )}
                              </TableCell>
                            )}

                            {/* 评审状态 */}
                            {!hiddenColumns.includes('reviewStatus') && (
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    requirement.reviewStatus === 'approved' 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : requirement.reviewStatus === 'rejected'
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }`}
                                >
                                  {requirement.reviewStatus === 'approved' ? '已通过' :
                                   requirement.reviewStatus === 'rejected' ? '已拒绝' :
                                   requirement.reviewStatus === 'first_review' ? '一级评审中' :
                                   requirement.reviewStatus === 'second_review' ? '二级评审中' : '待评审'}
                                </Badge>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}