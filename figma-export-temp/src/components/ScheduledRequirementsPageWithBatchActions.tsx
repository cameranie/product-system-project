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
  'PC端', '移动端', 'web端'
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
  { value: 'is_not_empty', label: '不为空' }
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
    platform: 'web端',
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
    platform: 'web端',
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
    platform: 'PC端',
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
    platform: 'web端',
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
    platform: 'web端',
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
    platform: 'PC端',
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
    platform: 'PC端',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
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

export function ScheduledRequirementsPageWithBatchActions({ onNavigate, context }: ScheduledRequirementsPageProps) {
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

  // 根据一级和二级评审状态计算总评审状态
  const getReviewStatus = (requirement: Requirement): string => {
    const { reviewer1Status, reviewer2Status, reviewer1, reviewer2 } = requirement;
    
    // 如果一级评审未通过，直接返回评审不通过
    if (reviewer1Status === 'rejected') {
      return '评审不通过';
    }
    
    // 如果只有一级评审人员
    if (reviewer1 && !reviewer2) {
      if (reviewer1Status === 'approved') return '评审通过';
      if (reviewer1Status === 'pending') return '一级评审中';
      return '待评审';
    }
    
    // 如果有两级评审人员
    if (reviewer1 && reviewer2) {
      if (reviewer1Status === 'approved' && reviewer2Status === 'approved') {
        return '评审通过';
      }
      if (reviewer1Status === 'approved' && reviewer2Status === 'pending') {
        return '二级评审中';
      }
      if (reviewer1Status === 'pending') {
        return '一级评审中';
      }
    }
    
    return '待评审';
  };

  // 批量选择相关函数
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRequirements([]);
      setIsAllSelected(false);
    } else {
      const allIds = filteredRequirements.map(req => req.id);
      setSelectedRequirements(allIds);
      setIsAllSelected(true);
    }
  };

  const handleSelectRequirement = (requirementId: string) => {
    setSelectedRequirements(prev => {
      const newSelected = prev.includes(requirementId)
        ? prev.filter(id => id !== requirementId)
        : [...prev, requirementId];
      
      setIsAllSelected(newSelected.length === filteredRequirements.length);
      return newSelected;
    });
  };

  // 批量移动到版本需求管理
  const handleMoveToVersionManagement = () => {
    if (selectedRequirements.length === 0) return;
    
    // 移除已选择的需求
    setRequirements(prev => prev.filter(req => !selectedRequirements.includes(req.id)));
    
    // 清空选择
    setSelectedRequirements([]);
    setIsAllSelected(false);
    
    // 导航到版本需求管理页面，并显示成功消息
    if (onNavigate) {
      onNavigate('version-requirements', {
        message: `已成功移动 ${selectedRequirements.length} 个需求到版本需求管理`,
        movedRequirementIds: selectedRequirements
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
          fieldValue = getReviewStatus(requirement);
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

  // 更新全选状态
  React.useEffect(() => {
    setIsAllSelected(selectedRequirements.length > 0 && selectedRequirements.length === filteredRequirements.length);
  }, [selectedRequirements, filteredRequirements]);

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

  const handleRequirementClick = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', {
        requirementId: requirement.id,
        source: 'scheduled-requirements'
      });
    }
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
    <div className="h-screen flex flex-col bg-background">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>预排期需求管理</h1>
            <p className="text-muted-foreground text-sm mt-1">
              预排期需求管理和评审跟踪
            </p>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto">
        {/* 消息提示 */}
        {showMessage && context?.message && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-green-800">{context.message}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMessage(false)}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* 筛选和操作栏 */}
        <div className="bg-background border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索需求..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 h-8"
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
                        <Badge variant="secondary" className="ml-2">
                          {customFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-4" align="start">
                      <div className="space-y-4">
                        <div className="text-sm font-medium">筛选设置</div>
                        
                        {customFilters.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            暂无筛选条件
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {customFilters.map((filter) => (
                              <div key={filter.id} className="space-y-2 p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={filter.column}
                                    onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filterableColumns.map((col) => (
                                        <SelectItem key={col.value} value={col.value}>
                                          {col.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={filter.operator}
                                    onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
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

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomFilter(filter.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                                  <Input
                                    placeholder="筛选值..."
                                    value={filter.value}
                                    onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                                    className="h-7 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <DropdownMenuSeparator />
                        <div className="flex items-center gap-2">
                          <Button onClick={addCustomFilter} variant="outline" size="sm" className="h-7 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            添加条件
                          </Button>
                          {customFilters.length > 0 && (
                            <Button onClick={clearAllFilters} variant="ghost" size="sm" className="h-7 text-xs">
                              清除全部
                            </Button>
                          )}
                        </div>
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
                        <Badge variant="secondary" className="ml-2">
                          1
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {filterableColumns.map((col) => (
                        <React.Fragment key={col.value}>
                          <DropdownMenuItem onClick={() => handleSort(col.value, 'asc')}>
                            <ArrowUp className="h-3 w-3 mr-2" />
                            {col.label} ↑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort(col.value, 'desc')}>
                            <ArrowDown className="h-3 w-3 mr-2" />
                            {col.label} ↓
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                      {sortConfig && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSort('', undefined)}>
                            <X className="h-3 w-3 mr-2" />
                            清除排序
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </div>

            {/* 批量操作按钮 */}
            {selectedRequirements.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  已选择 {selectedRequirements.length} 项
                </span>
                <Button 
                  onClick={handleMoveToVersionManagement}
                  className="h-8"
                >
                  <Move className="h-4 w-4 mr-2" />
                  移到版本需求管理({selectedRequirements.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 需求列表 */}
        <div className="bg-background">
          {sortedVersions.map((version) => (
            <div key={version}>
              <Collapsible 
                open={expandedVersions[version]}
                onOpenChange={() => toggleVersionExpanded(version)}
              >
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer hover:bg-muted/50 transition-colors px-6 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedVersions[version] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex items-center gap-3">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h3>{version}</h3>
                            <p className="text-muted-foreground">
                              {groupedByVersion[version].length} 个需求
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {groupedByVersion[version].length}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="h-10">
                          <TableHead className="w-10 text-center">
                            <Checkbox
                              className="h-4 w-4"
                              checked={groupedByVersion[version].every(req => selectedRequirements.includes(req.id))}
                              onCheckedChange={(checked) => {
                                const versionRequirementIds = groupedByVersion[version].map(req => req.id);
                                if (checked) {
                                  setSelectedRequirements(prev => [...new Set([...prev, ...versionRequirementIds])]);
                                } else {
                                  setSelectedRequirements(prev => prev.filter(id => !versionRequirementIds.includes(id)));
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="px-4">标题</TableHead>
                          {!hiddenColumns.includes('type') && <TableHead className="w-20">类型</TableHead>}
                          {!hiddenColumns.includes('priority') && <TableHead className="w-20">优先级</TableHead>}
                          {!hiddenColumns.includes('creator') && <TableHead className="w-24">创建人</TableHead>}
                          {!hiddenColumns.includes('platform') && <TableHead className="w-20">应用端</TableHead>}
                          {!hiddenColumns.includes('reviewer1') && <TableHead className="w-24">一级评审</TableHead>}
                          {!hiddenColumns.includes('reviewer2') && <TableHead className="w-24">二级评审</TableHead>}
                          {!hiddenColumns.includes('reviewStatus') && <TableHead className="w-24">评审状态</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByVersion[version].map((requirement) => (
                          <TableRow 
                            key={requirement.id}
                            className={`cursor-pointer hover:bg-muted/50 h-12 ${
                              highlightRequirementId === requirement.id ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                className="h-4 w-4"
                                checked={selectedRequirements.includes(requirement.id)}
                                onCheckedChange={() => handleSelectRequirement(requirement.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell className="px-4" onClick={() => handleRequirementClick(requirement)}>
                              <div className="flex items-start gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                                  style={{ backgroundColor: requirement.project.color }}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{requirement.title}</div>
                                  <div className="text-muted-foreground truncate mt-0.5">
                                    {requirement.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            {!hiddenColumns.includes('type') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                <Badge variant="outline">
                                  {requirement.type}
                                </Badge>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('priority') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                <Badge 
                                  className={`text-xs px-2 py-1 ${
                                    requirement.priority === '紧急' ? 'bg-red-100 text-red-800' :
                                    requirement.priority === '高' ? 'bg-orange-100 text-orange-800' :
                                    requirement.priority === '中' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {requirement.priority}
                                </Badge>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('creator') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.creator.avatar} />
                                    <AvatarFallback>
                                      {requirement.creator.name.slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{requirement.creator.name}</span>
                                </div>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('platform') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                <Badge variant="outline">
                                  {requirement.platform}
                                </Badge>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewer1') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                {requirement.reviewer1 ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={requirement.reviewer1.avatar} />
                                      <AvatarFallback>
                                        {requirement.reviewer1.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div>{requirement.reviewer1.name}</div>
                                      {requirement.reviewer1Status && (
                                        <Badge 
                                          className={`mt-0.5 ${
                                            requirement.reviewer1Status === 'approved' ? 'bg-green-100 text-green-800' :
                                            requirement.reviewer1Status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          {reviewerStatusLabels[requirement.reviewer1Status].label}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">未分配</span>
                                )}
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewer2') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                {requirement.reviewer2 ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={requirement.reviewer2.avatar} />
                                      <AvatarFallback>
                                        {requirement.reviewer2.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div>{requirement.reviewer2.name}</div>
                                      {requirement.reviewer2Status && (
                                        <Badge 
                                          className={`mt-0.5 ${
                                            requirement.reviewer2Status === 'approved' ? 'bg-green-100 text-green-800' :
                                            requirement.reviewer2Status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          {reviewerStatusLabels[requirement.reviewer2Status].label}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">未分配</span>
                                )}
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewStatus') && (
                              <TableCell onClick={() => handleRequirementClick(requirement)}>
                                <Badge 
                                  className={`text-xs px-2 py-1 ${
                                    getReviewStatus(requirement) === '评审通过' ? 'bg-green-100 text-green-800' :
                                    getReviewStatus(requirement) === '评审不通过' ? 'bg-red-100 text-red-800' :
                                    getReviewStatus(requirement).includes('评审中') ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {getReviewStatus(requirement)}
                                </Badge>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>

        {filteredRequirements.length === 0 && (
          <div className="bg-background p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">暂无预排期需求</h3>
            <p className="text-muted-foreground">
              当前没有符合筛选条件的预排期需求
            </p>
          </div>
        )}
      </div>
    </div>
  );
}