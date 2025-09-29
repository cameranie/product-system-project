import React, { useState, useEffect, useMemo } from 'react';
import { useVersions } from './VersionContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from "sonner@2.0.3";
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
  EyeOff,
  Target,
  CheckSquare,
  Clock,
  CheckCircle,
  Move,
  MessageSquare,
  Edit3
} from 'lucide-react';

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

interface Requirement {
  id: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  platform: string[];
  plannedVersion?: string;
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewer1Opinion?: string; // 一级评审意见
  reviewer2Opinion?: string; // 二级评审意见
  isOperational?: 'yes' | 'no';
  delayTag?: string; // 延期标签，如 "PC 8.25 延版本"
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
  { id: '6', name: '林嘉娜', avatar: '', role: '一级评审员' },
  { id: '7', name: '叶裴锋', avatar: '', role: '一级评审员' },
  { id: '8', name: '谢焰明', avatar: '', role: '二级评审员' },
  { id: '9', name: '卢兆锋', avatar: '', role: '二级评审员' },
  { id: '10', name: '陆柏良', avatar: '', role: '二级评审员' },
  { id: '11', name: '杜韦志', avatar: '', role: '二级评审员' },
  { id: '12', name: '温明震', avatar: '', role: '二级评审员' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 需求类型选项
const requirementTypes = [
  '新功能', '优化', 'BUG', '用户反馈', '商务需求'
];

// 应用端选项
const platforms = [
  'PC端', '移动端', 'web端'
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

const mockRequirements: Requirement[] = [
  // v2.1.0 版本需求
  {
    id: '1',
    title: '用户注册流程优化',
    type: '新功能',
    status: '待评审',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。',
    tags: ['用户体验', 'UI优化'],
    createdAt: '2024-01-15 14:30',
    platform: ['web端'],
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[8],
    reviewer2: mockUsers[9],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewer1Opinion: '',
    reviewer2Opinion: '',
    isOperational: 'yes'
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
    platform: ['web端'],
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewer1Opinion: '个人中心重构方案合理，建议优先实现基础功能。',
    reviewer2Opinion: '界面设计符合规范，同意进入开发阶段。',
    isOperational: 'no'
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
    platform: ['PC端'],
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewer1Opinion: '消息推送方案技术可行，建议按计划实施。',
    reviewer2Opinion: '推送策略合理，支持进入开发阶段。'
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
    platform: ['web端'],
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewer1Opinion: '用户反馈机制确实有必要建立，建议分阶段实施。',
    reviewer2Opinion: '',
    isOperational: 'yes'
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
    platform: ['移动端'],
    plannedVersion: 'v2.1.0',
    isOpen: false,
    reviewer1: mockUsers[3],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewer1Opinion: 'Bug修复及时，交互体验明显提升。',
    reviewer2Opinion: '测试通过，可以发布上线。'
  },

  // v2.2.0 版本需求
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
    platform: ['web端'],
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewer1Opinion: '数据分析方案可行，建议细化用户画像功能。',
    reviewer2Opinion: ''
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
    platform: ['PC端'],
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[2],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewer1Opinion: '',
    reviewer2Opinion: ''
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
    platform: ['移动端'],
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewer1Opinion: '表情包功能有助于提升用户体验，同意开发。',
    reviewer2Opinion: '功能简单易实现，审核通过。'
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
    platform: ['PC端'],
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewer1Opinion: '性能监控优化很有必要，方案合理。',
    reviewer2Opinion: '监控指标设计完善，同意实施。'
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
    platform: ['PC端'],
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewer1Opinion: '',
    reviewer2Opinion: ''
  },

  // 暂无版本的需求
  {
     id: '11',
     title: '用户界面暗色主题',
     type: '新功能',
     status: '待评审',
     priority: '中',
     creator: mockUsers[3],
     project: mockProjects[3],
     description: '为用户界面添加暗色主题支持，提升夜间使用体验。',
     tags: ['UI主题', '用户体验'],
     createdAt: '2024-01-28 10:30',
     platform: ['web端', '移动端'],
     isOpen: true,
     reviewer1: mockUsers[6],
     reviewer2: mockUsers[7],
     reviewer1Status: 'pending',
     reviewer2Status: 'pending',
     reviewer1Opinion: '',
     reviewer2Opinion: '',
     isOperational: 'no',
     delayTag: 'PC 8.25 延版本'
   },
   {
     id: '12',
     title: 'K线图新增技术指标',
     type: '优化',
     status: '评审中',
     priority: '高',
     creator: mockUsers[1],
     project: mockProjects[0],
     description: '在K线图中新增MACD、RSI等技术指标，提供更专业的分析工具。',
     tags: ['K线图', '技术指标', '分析工具'],
     createdAt: '2024-01-29 14:15',
     platform: ['PC端'],
     isOpen: true,
     reviewer1: mockUsers[8],
     reviewer2: mockUsers[9],
     reviewer1Status: 'approved',
     reviewer2Status: 'pending',
     reviewer1Opinion: 'MACD和RSI指标确实有必要，技术方案可行。',
     reviewer2Opinion: '',
     delayTag: 'Web 9.01 延版本'
   },
   {
     id: '13',
     title: '行情数据导出功能',
     type: '用户反馈',
     status: '待评审',
     priority: '低',
     creator: mockUsers[4],
     project: mockProjects[1],
     description: '根据用户反馈，添加行情数据导出功能，支持CSV和Excel格式。',
     tags: ['数据导出', '用户需求'],
     createdAt: '2024-01-30 09:20',
     platform: ['PC端', 'web端'],
     isOpen: true,
     reviewer1: mockUsers[10],
     reviewer2: mockUsers[11],
     reviewer1Status: 'pending',
     reviewer2Status: 'pending',
     reviewer1Opinion: '',
     reviewer2Opinion: '',
     isOperational: 'yes'
   },
   {
     id: '14',
     title: '聊天室管理员权限优化',
     type: 'BUG',
     status: '评审通过',
     priority: '中',
     creator: mockUsers[2],
     project: mockProjects[2],
     description: '修复聊天室管理员权限控制问题，完善权限分级管理。',
     tags: ['聊天室', '权限管理'],
     createdAt: '2024-01-31 11:45',
     platform: ['移动端', 'web端'],
     isOpen: true,
     reviewer1: mockUsers[6],
     reviewer2: mockUsers[8],
     reviewer1Status: 'approved',
     reviewer2Status: 'approved',
     reviewer1Opinion: '管理员权限问题确实需要修复，方案合理。',
     reviewer2Opinion: '权限分级管理设计完善，审核通过。'
   },
   {
     id: '15',
     title: '交易订单撤销流程简化',
     type: '商务需求',
     status: '开发中',
     priority: '高',
     creator: mockUsers[0],
     project: mockProjects[4],
     description: '简化交易订单撤销流程，减少用户操作步骤，提升交易体验。',
     tags: ['交易流程', '用户体验'],
     createdAt: '2024-02-01 08:30',
     platform: ['PC端', '移动端'],
     isOpen: true,
     reviewer1: mockUsers[7],
     reviewer2: mockUsers[9],
     reviewer1Status: 'approved',
     reviewer2Status: 'approved',
     reviewer1Opinion: '订单撤销流程确实可以优化，建议分步实施。',
     reviewer2Opinion: '流程简化方案可行，同意开发。',
     isOperational: 'no'
   }
];

// 可筛选的列（移除了创建时间）
const filterableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'platform', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'plannedVersion', label: '预排期版本号' },
  { value: 'reviewStatus', label: '总评审状态' },
  { value: 'reviewer1Status', label: '一级评审状态' },
  { value: 'reviewer2Status', label: '二级评审状态' },
  { value: 'isOperational', label: '是否运营' }
];

// 可排序的列
const sortableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'platform', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'plannedVersion', label: '预排期版本号' },
  { value: 'reviewStatus', label: '总评审状态' },
  { value: 'reviewer1', label: '一级评审' },
  { value: 'reviewer2', label: '二级评审' },
  { value: 'isOperational', label: '是否运营' }
];

// 版本号选项
const versionOptions = [
  'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0', 'v3.0.0'
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

interface ScheduledRequirementsPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function ScheduledRequirementsPageUpdated({ context, onNavigate }: ScheduledRequirementsPageProps = {}) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(['type', 'platform', 'creator']);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  
  // 评审意见编辑状态
  const [editingOpinion, setEditingOpinion] = useState<{
    requirementId: string;
    level: 'reviewer1' | 'reviewer2';
    opinion: string;
  } | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockRequirements.map(r => r.plannedVersion || '未分配版本'))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });

  // 监听选择状态变化
  useEffect(() => {
    setShowBatchActions(selectedRequirements.length > 0);
  }, [selectedRequirements]);

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
        case 'platform':
          fieldValue = requirement.platform.join(', ');
          break;
        case 'reviewStatus':
          fieldValue = getReviewStatus(requirement);
          break;
        case 'reviewer1Status':
          fieldValue = requirement.reviewer1Status ? reviewerStatusLabels[requirement.reviewer1Status].label : '';
          break;
        case 'reviewer2Status':
          fieldValue = requirement.reviewer2Status ? reviewerStatusLabels[requirement.reviewer2Status].label : '';
          break;
        case 'plannedVersion':
          fieldValue = requirement.plannedVersion || '';
          break;
        case 'creator':
          fieldValue = requirement.creator.name;
          break;
        case 'isOperational':
          fieldValue = requirement.isOperational ? (requirement.isOperational === 'yes' ? '是' : '否') : '';
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

  // 批量评审（合并后的功能）
  const handleBatchReview = (reviewLevel: '1' | '2') => {
    if (reviewLevel === '1') {
      const eligibleRequirements = requirements.filter(r => 
        selectedRequirements.includes(r.id) && 
        r.reviewer1 && 
        r.reviewer1Status !== 'approved'
      );
      
      if (eligibleRequirements.length === 0) {
        toast.error('所选需求中没有可以通过一级评审的需求');
        return;
      }

      const updatedRequirements = requirements.map(r => {
        if (selectedRequirements.includes(r.id) && r.reviewer1 && r.reviewer1Status !== 'approved') {
          return { ...r, reviewer1Status: 'approved' as const };
        }
        return r;
      });
      setRequirements(updatedRequirements);
      setSelectedRequirements([]);
      toast.success(`已批量通过 ${eligibleRequirements.length} 个需求的一级评审`);
    } else {
      const eligibleRequirements = requirements.filter(r => 
        selectedRequirements.includes(r.id) && 
        r.reviewer2 && 
        r.reviewer1Status === 'approved' && 
        r.reviewer2Status !== 'approved'
      );
      
      if (eligibleRequirements.length === 0) {
        toast.error('所选需求中没有可以通过二级评审的需求（需要先通过一级评审）');
        return;
      }

      const updatedRequirements = requirements.map(r => {
        if (selectedRequirements.includes(r.id) && 
            r.reviewer2 && 
            r.reviewer1Status === 'approved' && 
            r.reviewer2Status !== 'approved') {
          return { ...r, reviewer2Status: 'approved' as const };
        }
        return r;
      });
      setRequirements(updatedRequirements);
      setSelectedRequirements([]);
      toast.success(`已批量通过 ${eligibleRequirements.length} 个需求的二级评审`);
    }
  };

  // 处理评审意见编辑
  const handleEditOpinion = (requirementId: string, level: 'reviewer1' | 'reviewer2') => {
    const requirement = requirements.find(r => r.id === requirementId);
    if (!requirement) return;

    const currentOpinion = level === 'reviewer1' ? requirement.reviewer1Opinion || '' : requirement.reviewer2Opinion || '';
    setEditingOpinion({
      requirementId,
      level,
      opinion: currentOpinion
    });
  };

  // 保存评审意见
  const handleSaveOpinion = () => {
    if (!editingOpinion) return;

    const updatedRequirements = requirements.map(r => {
      if (r.id === editingOpinion.requirementId) {
        if (editingOpinion.level === 'reviewer1') {
          return { ...r, reviewer1Opinion: editingOpinion.opinion };
        } else {
          return { ...r, reviewer2Opinion: editingOpinion.opinion };
        }
      }
      return r;
    });

    setRequirements(updatedRequirements);
    setEditingOpinion(null);
    toast.success('评审意见已保存');
  };

  // 一键移动到版本需求管理
  const handleBatchMoveToVersionRequirements = () => {
    // 筛选出已通过评审且有版本号的需求
    const eligibleRequirements = requirements.filter(r => 
      selectedRequirements.includes(r.id) && 
      r.plannedVersion &&
      getReviewStatus(r) === '评审通过'
    );
    
    if (eligibleRequirements.length === 0) {
      toast.error('所选需求中没有可以移动到版本需求管理的需求（需要评审通过且有版本号）');
      return;
    }

    // 这里实际上应该调用API将需求移动到版本需求管理页面
    // 目前只是显示提示信息
    toast.success(`已将 ${eligibleRequirements.length} 个需求移动到版本需求管理`);
    setSelectedRequirements([]);
    
    // 如果有导航函数，可以导航到版本需求管理页面
    if (onNavigate) {
      onNavigate('version-requirements', {
        movedRequirements: eligibleRequirements.map(r => r.id)
      });
    }
  };

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
      if (reviewer2Status === 'rejected') {
        return '评审不通过';
      }
    }
    
    return '待评审';
  };

  // 获取总评审状态的样式
  const getReviewStatusStyle = (status: string) => {
    switch (status) {
      case '评审通过':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80';
      case '评审不通过':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80';
      case '一级评审中':
      case '二级评审中':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80';
    }
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

  // 排序逻辑  
  const sortedRequirements = React.useMemo(() => {
    if (!sortConfig) return filteredRequirements;
    
    return [...filteredRequirements].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortConfig.column) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'priority':
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'platform':
          aValue = a.platform.join(', ');
          bValue = b.platform.join(', ');
          break;
        case 'creator':
          aValue = a.creator.name;
          bValue = b.creator.name;
          break;
        case 'reviewStatus':
          aValue = getReviewStatus(a);
          bValue = getReviewStatus(b);
          break;
        case 'reviewer1':
          aValue = a.reviewer1 ? a.reviewer1.name : '';
          bValue = b.reviewer1 ? b.reviewer1.name : '';
          break;
        case 'reviewer2':
          aValue = a.reviewer2 ? a.reviewer2.name : '';
          bValue = b.reviewer2 ? b.reviewer2.name : '';
          break;
        case 'plannedVersion':
          aValue = a.plannedVersion || '';
          bValue = b.plannedVersion || '';
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

  // 处理一级评审状态修改
  const handleReviewer1StatusChange = (requirementId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, reviewer1Status: status }
        : r
    );
    setRequirements(updatedRequirements);
    toast.success('一级评审状态已更新');
  };

  // 处理二级评审状态修改
  const handleReviewer2StatusChange = (requirementId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, reviewer2Status: status }
        : r
    );
    setRequirements(updatedRequirements);
    toast.success('二级评审状态已更新');
  };

  // 处理版本号修改
  const handleVersionChange = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, plannedVersion: version === 'clear' || version === 'none' ? undefined : version }
        : r
    );
    setRequirements(updatedRequirements);
    
    if (version === 'clear' || version === 'none') {
      toast.success('版本号已清除');
    } else {
      toast.success(`版本号已更新为: ${version}`);
    }
  };

  // 处理是否运营状态修改
  const handleOperationalStatusChange = (requirementId: string, status: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, isOperational: status === 'none' ? undefined : status as 'yes' | 'no' }
        : r
    );
    setRequirements(updatedRequirements);
    
    if (status === 'none') {
      toast.success('是否运营已清除');
    } else {
      const statusText = status === 'yes' ? '是' : '否';
      toast.success(`是否运营已更新为: ${statusText}`);
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

  // 获取列的��序图标
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

  const handleCreateRequirement = () => {
    if (onNavigate) {
      onNavigate('requirement-edit', { 
        requirement: null, 
        isEdit: false,
        source: 'scheduled-requirements'
      });
    }
  };

  const handleViewRequirement = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', { 
        requirementId: requirement.id, 
        source: 'scheduled-requirements' 
      });
    }
  };

  // 按预排期版本分组
  const groupedByVersion = useMemo(() => {
    return sortedRequirements.reduce((groups, requirement) => {
      const version = requirement.plannedVersion || '未分配版本';
      
      if (!groups[version]) {
        groups[version] = [];
      }
      groups[version].push(requirement);
      return groups;
    }, {} as Record<string, Requirement[]>);
  }, [sortedRequirements]);

  // 版本排序
  const sortedVersions = useMemo(() => {
    return Object.keys(groupedByVersion).sort((a, b) => {
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
  }, [groupedByVersion]);

  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1>预排期需求管理</h1>
              <p className="text-muted-foreground mt-1">
                管理和追踪预排期的产品需求，支持智能筛选和高级管理功能
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
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('type')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('type')} />
                        需求类型
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('priority')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('priority')} />
                        优先级
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('platform')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('platform')} />
                        应用端
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('creator')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('creator')} />
                        创建人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('plannedVersion')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('plannedVersion')} />
                        预排期版本号
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewStatus')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewStatus')} />
                        总评审状态
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer1Status')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer1Status')} />
                        一级评审状态
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer2Status')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer2Status')} />
                        二级评审状态
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer1Opinion')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer1Opinion')} />
                        一级评审意见
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer2Opinion')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer2Opinion')} />
                        二级评审意见
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('isOperational')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('isOperational')} />
                        是否运营
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
                                <div className="flex items-center justify-between">
                                  <Select
                                    value={filter.column}
                                    onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="选择列" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filterableColumns.map(col => (
                                        <SelectItem key={col.value} value={col.value}>
                                          {col.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeCustomFilter(filter.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Select
                                  value={filter.operator}
                                  onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="选择操作符" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filterOperators.map(op => (
                                      <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="输入值"
                                  value={filter.value}
                                  onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addCustomFilter} className="flex-1">
                            添加条件
                          </Button>
                          {customFilters.length > 0 && (
                            <Button size="sm" variant="outline" onClick={clearAllFilters}>
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
                          <Badge variant="secondary" className="ml-1 text-xs">
                            1
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {sortableColumns.map((col) => (
                        <React.Fragment key={col.value}>
                          <DropdownMenuItem onClick={() => handleColumnSort(col.value)}>
                            <ArrowUp className="h-3 w-3 mr-2" />
                            {col.label} ↑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleColumnSort(col.value)}>
                            <ArrowDown className="h-3 w-3 mr-2" />
                            {col.label} ↓
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                      {sortConfig && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSortConfig(null)}>
                            <X className="h-3 w-3 mr-2" />
                            清除排序
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 批量操作栏 */}
        {showBatchActions && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    已选择 {selectedRequirements.length} 个需求
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* 批量评审按钮（合并后的单个按钮） */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        批量评审
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBatchReview('1')}>
                        一级评审通过
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchReview('2')}>
                        二级评审通过
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button size="sm" variant="outline" onClick={handleBatchMoveToVersionRequirements}>
                    <Move className="h-4 w-4 mr-2" />
                    移动到版本管理
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedRequirements([])}>
                    <X className="h-4 w-4 mr-2" />
                    取消选择
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 按版本分组的需求列表 */}
        <div className="space-y-4">
          {sortedVersions.map(version => (
            <Card key={version} className="overflow-hidden">
              <Collapsible
                open={expandedVersions[version]}
                onOpenChange={() => toggleVersionExpanded(version)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedVersions[version] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-2 py-1">
                          {version}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({groupedByVersion[version]?.length || 0} 个需求)
                        </span>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t">
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={groupedByVersion[version]?.every(req => selectedRequirements.includes(req.id)) || false}
                              onCheckedChange={(checked) => {
                                const versionRequirements = groupedByVersion[version] || [];
                                if (checked) {
                                  const newSelected = [...new Set([...selectedRequirements, ...versionRequirements.map(r => r.id)])];
                                  setSelectedRequirements(newSelected);
                                } else {
                                  const versionIds = versionRequirements.map(r => r.id);
                                  setSelectedRequirements(selectedRequirements.filter(id => !versionIds.includes(id)));
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="w-[300px]">需求标题</TableHead>
                          {!hiddenColumns.includes('type') && <TableHead className="w-[100px]">类型</TableHead>}
                          {!hiddenColumns.includes('priority') && <TableHead className="w-[80px]">优先级</TableHead>}
                          {!hiddenColumns.includes('platform') && <TableHead className="w-[120px]">应用端</TableHead>}
                          {!hiddenColumns.includes('creator') && <TableHead className="w-[120px]">创建人</TableHead>}
                          {!hiddenColumns.includes('plannedVersion') && <TableHead className="w-[140px]">版本号</TableHead>}
                          {!hiddenColumns.includes('reviewStatus') && <TableHead className="w-[120px]">总评审状态</TableHead>}
                          {!hiddenColumns.includes('reviewer1Status') && <TableHead className="w-[140px]">一级评审</TableHead>}
                          {!hiddenColumns.includes('reviewer2Status') && <TableHead className="w-[140px]">二级评审</TableHead>}
                          {!hiddenColumns.includes('reviewer1Opinion') && <TableHead className="w-[120px]">一级评审意见</TableHead>}
                          {!hiddenColumns.includes('reviewer2Opinion') && <TableHead className="w-[120px]">二级评审意见</TableHead>}
                          {!hiddenColumns.includes('isOperational') && <TableHead className="w-[100px]">是否运营</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(groupedByVersion[version] || []).map((requirement) => (
                          <TableRow key={requirement.id} className="hover:bg-muted/50">
                            <TableCell className="w-[50px]">
                              <Checkbox
                                checked={selectedRequirements.includes(requirement.id)}
                                onCheckedChange={(checked) => handleSelectRequirement(requirement.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="w-[300px]">
                              <button
                                onClick={() => handleViewRequirement(requirement)}
                                className="text-left hover:text-blue-600 transition-colors"
                              >
                                <div className="font-medium">{requirement.title}</div>
                              </button>
                            </TableCell>
                            {!hiddenColumns.includes('type') && (
                              <TableCell className="w-[100px]">
                                <Badge variant="secondary">{requirement.type}</Badge>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('priority') && (
                              <TableCell className="w-[80px]">
                                <Badge className={priorityConfig[requirement.priority].className}>
                                  {requirement.priority}
                                </Badge>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('platform') && (
                              <TableCell className="w-[120px]">
                                <div className="flex gap-1 flex-wrap">
                                  {requirement.platform.map((platform, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('creator') && (
                              <TableCell className="w-[120px]">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {requirement.creator.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{requirement.creator.name}</span>
                                </div>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('plannedVersion') && (
                              <TableCell className="w-[140px]">
                                <Select
                                  value={requirement.plannedVersion || 'none'}
                                  onValueChange={(value) => handleVersionChange(requirement.id, value)}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">选择版本</SelectItem>
                                    {versionOptions.map(version => (
                                      <SelectItem key={version} value={version}>
                                        {version}
                                      </SelectItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <SelectItem value="clear">清除版本</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewStatus') && (
                              <TableCell className="w-[120px]">
                                <Badge className={getReviewStatusStyle(getReviewStatus(requirement))}>
                                  {getReviewStatus(requirement)}
                                </Badge>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewer1Status') && (
                              <TableCell className="w-[140px]">
                                {requirement.reviewer1 ? (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                      {requirement.reviewer1.name}
                                    </div>
                                    <Select
                                      value={requirement.reviewer1Status || 'pending'}
                                      onValueChange={(value: 'pending' | 'approved' | 'rejected') =>
                                        handleReviewer1StatusChange(requirement.id, value)
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">待评审</SelectItem>
                                        <SelectItem value="approved">已通过</SelectItem>
                                        <SelectItem value="rejected">已拒绝</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">未分配</span>
                                )}
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewer2Status') && (
                              <TableCell className="w-[140px]">
                                {requirement.reviewer2 ? (
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                      {requirement.reviewer2.name}
                                    </div>
                                    <Select
                                      value={requirement.reviewer2Status || 'pending'}
                                      onValueChange={(value: 'pending' | 'approved' | 'rejected') =>
                                        handleReviewer2StatusChange(requirement.id, value)
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">待评审</SelectItem>
                                        <SelectItem value="approved">已通过</SelectItem>
                                        <SelectItem value="rejected">已拒绝</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">未分配</span>
                                )}
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewer1Opinion') && (
                              <TableCell className="w-[120px]">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                        onClick={() => handleEditOpinion(requirement.id, 'reviewer1')}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[300px]">
                                      <p className="text-sm">
                                        {requirement.reviewer1Opinion ? requirement.reviewer1Opinion : '点击编辑一级评审意见'}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('reviewer2Opinion') && (
                              <TableCell className="w-[120px]">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                        onClick={() => handleEditOpinion(requirement.id, 'reviewer2')}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[300px]">
                                      <p className="text-sm">
                                        {requirement.reviewer2Opinion ? requirement.reviewer2Opinion : '点击编辑二级评审意见'}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )}
                            {!hiddenColumns.includes('isOperational') && (
                              <TableCell className="w-[100px]">
                                <Select
                                  value={requirement.isOperational || 'none'}
                                  onValueChange={(value) => handleOperationalStatusChange(requirement.id, value)}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">未设置</SelectItem>
                                    <SelectItem value="yes">是</SelectItem>
                                    <SelectItem value="no">否</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>

      {/* 评审意见编辑弹窗 */}
      <Dialog 
        open={!!editingOpinion} 
        onOpenChange={(open) => !open && setEditingOpinion(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              编辑{editingOpinion?.level === 'reviewer1' ? '一级' : '二级'}评审意见
            </DialogTitle>
            <DialogDescription>
              请输入详细的评审意见，以便其他团队成员了解评审结果和建议。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="opinion" className="text-sm font-medium">
                评审意见
              </Label>
              <Textarea
                id="opinion"
                value={editingOpinion?.opinion || ''}
                onChange={(e) => 
                  setEditingOpinion(prev => 
                    prev ? { ...prev, opinion: e.target.value } : null
                  )
                }
                placeholder="请输入评审意见..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingOpinion(null)}
              >
                取消
              </Button>
              <Button onClick={handleSaveOpinion}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}