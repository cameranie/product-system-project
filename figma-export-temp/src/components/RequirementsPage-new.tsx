import React, { useState, useRef, useEffect } from 'react';
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
  XCircle,
  Clock,
  Edit,
  X,
  EyeOff,
  MoreHorizontal
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

interface Requirement {
  id: string;
  title: string;
  type: '功能需求' | 'Bug' | '产品建议' | '技术需求' | '安全需求';
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
  isOpen: boolean; // 新增：是否开放中
  reviewer1?: User; // 一级评审人员
  reviewer2?: User; // 二级评审人员
  reviewer1Status?: 'pending' | 'approved' | 'rejected'; // 一级评审状态
  reviewer2Status?: 'pending' | 'approved' | 'rejected'; // 二级评审状态
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected'; // 整体评审状态
  prototypeId?: string; // 关联的原型设计ID
  assignee?: User; // 指派人员
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

// 计算总评审状态的函数
const getOverallReviewStatus = (requirement: Requirement) => {
  const hasReviewer1 = !!requirement.reviewer1;
  const hasReviewer2 = !!requirement.reviewer2;
  
  // 如果没有设置任何评审人员，显示"-"
  if (!hasReviewer1 && !hasReviewer2) {
    return { status: 'none', label: '-', variant: 'outline' as const, color: 'text-gray-400' };
  }
  
  const reviewer1Status = requirement.reviewer1Status || 'pending';
  const reviewer2Status = requirement.reviewer2Status || 'pending';
  
  // 如果有任何评审被拒绝，整体状态为拒绝
  if ((hasReviewer1 && reviewer1Status === 'rejected') || (hasReviewer2 && reviewer2Status === 'rejected')) {
    return { status: 'rejected', label: '评审不通过', variant: 'destructive' as const, color: 'text-red-500' };
  }
  
  // 如果只有一级评审人员
  if (hasReviewer1 && !hasReviewer2) {
    if (reviewer1Status === 'approved') {
      return { status: 'approved', label: '评审通过', variant: 'default' as const, color: 'text-green-500' };
    } else if (reviewer1Status === 'pending') {
      return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
    } else {
      return { status: 'reviewing', label: '评审中', variant: 'outline' as const, color: 'text-blue-500' };
    }
  }
  
  // 如果有两级评审人员
  if (hasReviewer1 && hasReviewer2) {
    if (reviewer1Status === 'approved' && reviewer2Status === 'approved') {
      return { status: 'approved', label: '评审通过', variant: 'default' as const, color: 'text-green-500' };
    } else if (reviewer1Status === 'pending' && reviewer2Status === 'pending') {
      return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
    } else {
      return { status: 'reviewing', label: '评审中', variant: 'outline' as const, color: 'text-blue-500' };
    }
  }
  
  return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
};

// Mock data
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

// 可选的版本列表
const availableVersions = [
  'v1.8.0', 'v2.0.0', 'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0', 'v3.0.0'
];

// 可选的需求类型
const requirementTypes = [
  '功能需求', '技术需求', 'Bug', '产品建议', '安全需求'
];

// 可选的优先级
const priorities = [
  '低', '中', '高', '紧急'
];

// 可选的评审状态
const reviewStatuses = [
  'pending', 'approved', 'rejected'
];

// 可选的项目
const projects = mockProjects;

const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: '用户注册流程优化',
    type: '功能需求',
    status: '待评审',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。',
    tags: ['用户体验', 'UI优化'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0],
    attachments: [
      { id: '1', name: '注册流程图.png', size: 2048, type: 'image/png', url: '/files/flow.png' }
    ]
  },
  {
    id: '2',
    title: '支付功能集成',
    type: '功能需求',
    status: '评审通过',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[2],
    description: '集成多种支付方式，包括支付宝、微信支付、银行卡支付等，提供安全可靠的支付体验。',
    tags: ['支付', '功能'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    platform: '全平台',
    plannedVersion: 'v2.0.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  {
    id: '3',
    title: '数据导出功能',
    type: '产品建议',
    status: '待评审',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '支持用户导出各种格式的数据报表，包括Excel、PDF、CSV等格式。',
    tags: ['导出', '数据分析'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-16',
    platform: 'Web端',
    plannedVersion: 'v2.2.0',
    isOpen: false,
    reviewer1: mockUsers[0],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[2]
  },
  {
    id: '4',
    title: '移动端适配优化',
    type: '技术需求',
    status: '评审不通过',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[4],
    description: '对移动端界面进行全面优化，提升用户在移动设备上的使用体验。',
    tags: ['移动端', '响应式'],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14',
    platform: '移动端',
    plannedVersion: 'v1.8.0',
    isOpen: false,
    reviewer1: mockUsers[2],
    reviewer1Status: 'rejected',
    reviewStatus: 'rejected',
    assignee: mockUsers[3]
  },
  {
    id: '5',
    title: 'K线图实时更新优化',
    type: '功能需��',
    status: '开发中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。',
    tags: ['K线', '实时数据', '性能优化'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25',
    platform: 'Web端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4],
    attachments: [
      { id: '2', name: 'K线优化方案.pdf', size: 1024, type: 'application/pdf', url: '/files/kline-plan.pdf' }
    ]
  },
  {
    id: '6',
    title: '行情推送服务升级',
    type: '技术需求',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '升级行情推送服务架构，支持更高并发量的实时行情数据推送，降低延迟。',
    tags: ['行情', 'WebSocket', '高并发'],
    createdAt: '2024-01-22',
    updatedAt: '2024-01-26',
    platform: '全平台',
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0]
  },
  {
    id: '7',
    title: '聊天室表情包功能',
    type: '产品建议',
    status: '已完成',
    priority: '低',
    creator: mockUsers[3],
    project: mockProjects[2],
    description: '在聊天室中添加表情包功能，支持自定义表情包上传和管理，提升用户交流体验。',
    tags: ['聊天室', '表情包', '用户体验'],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-28',
    platform: '全平台',
    plannedVersion: 'v2.0.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  // 以下是没有预排期版本的需求，只显示在需求池中
  {
    id: '8',
    title: '用户权限管理优化',
    type: '功能需求',
    status: '待评审',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '优化用户权限管理系统，支持更细粒度的权限控制，提升系统安全性和管理效率。',
    tags: ['权限', '安全', '管理'],
    createdAt: '2024-01-25',
    updatedAt: '2024-01-28',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[1]
  },
  {
    id: '9',
    title: '数据备份恢复功能',
    type: '技术需求',
    status: '评审中',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '增加自动数据备份和恢复功能，确保重要数据的安全性，支持定时备份和手动备份。',
    tags: ['备份', '恢复', '数据安全'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-26',
    platform: '全平台',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[0],
    attachments: [
      { id: '4', name: '备份方案设计.pdf', size: 1536, type: 'application/pdf', url: '/files/backup-plan.pdf' }
    ]
  },
  {
    id: '10',
    title: '实时通知系统',
    type: '功能需求',
    status: '已关闭',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[2],
    description: '实现实时通知推送功能，支持邮件、短信、应用内通知等多种方式，提升用户体验。',
    tags: ['通知', '推送', '用户体验'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15',
    platform: '全平台',
    isOpen: false,
    reviewer1: mockUsers[1],
    reviewer1Status: 'rejected',
    reviewStatus: 'rejected',
    assignee: mockUsers[3]
  },
  {
    id: '11',
    title: 'API性能监控',
    type: 'Bug',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[1],
    description: 'API响应时间异常，需要增加性能监控和告警机制，及时发现和解决性能问题。',
    tags: ['性能', '监控', 'API'],
    createdAt: '2024-01-28',
    updatedAt: '2024-01-29',
    platform: '全平台',
    isOpen: true,
    reviewer1: mockUsers[3],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[2]
  },
  {
    id: '12',
    title: '界面国际化支持',
    type: '产品建议',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[0],
    description: '添加多语言支持功能，支持中文、英文等多种语言切换，扩大用户群体。',
    tags: ['国际化', '多语言', 'i18n'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-23',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer2: mockUsers[1],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[3]
  },
  {
    id: '13',
    title: '搜索功能优化',
    type: '功能需求',
    status: '开发中',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[4],
    description: '优化全局搜索功能，支持模糊搜索、关键词高亮、搜索历史等功能，提升搜索体验。',
    tags: ['搜索', '优化', '用户体验'],
    createdAt: '2024-01-14',
    updatedAt: '2024-01-22',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4]
  },
  {
    id: '14',
    title: '文件上传限制调整',
    type: 'Bug',
    status: '待评审',
    priority: '低',
    creator: mockUsers[3],
    project: mockProjects[2],
    description: '文件上传大小限制过小，用户反馈无法上传较大的附件，需要调整上传限制配置。',
    tags: ['文件上传', '配置', '用户反馈'],
    createdAt: '2024-01-26',
    updatedAt: '2024-01-27',
    platform: '全平台',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer1Status: 'pending',
    reviewStatus: 'pending'
  },
  {
    id: '15',
    title: '数据可视化图表增强',
    type: '产品建议',
    status: '评审中',
    priority: '高',
    creator: mockUsers[4],
    project: mockProjects[1],
    description: '增强数据可视化功能，添加更多图表类型，支持自定义图表配置和数据导出。',
    tags: ['可视化', '图表', '数据分析'],
    createdAt: '2024-01-21',
    updatedAt: '2024-01-25',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[0],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[2],
    attachments: [
      { id: '5', name: '图表需求规格.docx', size: 2560, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '/files/chart-spec.docx' }
    ]
  }
];

interface RequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
  context?: any;
}

export function RequirementsPage({ onNavigate, context }: RequirementsPageProps = {}) {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view'>('list');
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterReviewStatus, setFilterReviewStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [filterCreator, setFilterCreator] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterOpenStatus, setFilterOpenStatus] = useState('open'); // 新增：开放状态筛选，默认显示开放中
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  
  // 编辑状态
  const [editingRequirement, setEditingRequirement] = useState<Partial<Requirement>>({
    title: '',
    type: '功能需求',
    status: '待评审',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '',
    tags: [],
    attachments: [],
    platform: 'Web端',
    plannedVersion: '',
    isOpen: true,
    reviewStatus: 'pending',
    reviewer1Status: 'pending',
    reviewer2Status: 'pending'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理从其他页面返回时的上下文
  useEffect(() => {
    if (context?.mode === 'edit' && context?.requirementId) {
      const requirement = requirements.find(r => r.id === context.requirementId);
      if (requirement) {
        handleEditRequirement(requirement);
      }
    }
  }, [context]);

  const handleSubmitRequirement = () => {
    if (editingRequirement.id) {
      // 更新现有需求
      setRequirements(requirements.map(r => 
        r.id === editingRequirement.id ? { ...r, ...editingRequirement } as Requirement : r
      ));
    } else {
      // 新建需求
      const newRequirement: Requirement = {
        ...editingRequirement,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      } as Requirement;
      setRequirements([...requirements, newRequirement]);
    }
    setCurrentView('list');
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setCurrentView('edit');
  };

  const handleViewRequirement = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setCurrentView('view');
  };

  const handleCreateRequirement = () => {
    setEditingRequirement({
      title: '',
      type: '功能需求',
      status: '待评审',
      priority: '中',
      creator: mockUsers[0],
      project: mockProjects[0],
      description: '',
      tags: [],
      attachments: [],
      platform: 'Web端',
      plannedVersion: '',
      isOpen: true,
      reviewStatus: 'pending',
      reviewer1Status: 'pending', // 一级评审人员默认为评审中
      reviewer2Status: 'pending'  // 二级评审人员默认为待评审
    });
    setCurrentView('edit');
  };

  const handleToggleRequirementStatus = (requirement: Requirement) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirement.id 
        ? { ...r, isOpen: !r.isOpen, status: !r.isOpen ? '待审核' : '已关闭' }
        : r
    );
    setRequirements(updatedRequirements);
    if (selectedRequirement?.id === requirement.id) {
      setSelectedRequirement({ ...requirement, isOpen: !requirement.isOpen, status: !requirement.isOpen ? '待审核' : '已关闭' });
    }
  };

  // 处理版本选择
  const handleVersionSelect = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, plannedVersion: version, updatedAt: new Date().toISOString().split('T')[0] }
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

  // 处理项目修改
  const handleProjectChange = (requirementId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedRequirements = requirements.map(r => 
        r.id === requirementId 
          ? { ...r, project, updatedAt: new Date().toISOString().split('T')[0] }
          : r
      );
      setRequirements(updatedRequirements);
    }
  };

  // 处理一级审核状态修改
  const handleReviewer1StatusChange = (requirementId: string, status: string) => {
    const updatedRequirements = requirements.map(r => {
      if (r.id === requirementId) {
        const newReq = { ...r, reviewer1Status: status, updatedAt: new Date().toISOString().split('T')[0] };
        
        // 更新总体评审状态
        if (status === 'rejected') {
          newReq.reviewStatus = 'rejected';
        } else if (status === 'approved') {
          if (!r.reviewer2) {
            newReq.reviewStatus = 'approved';
          } else if (r.reviewer2Status === 'approved') {
            newReq.reviewStatus = 'approved';
          } else {
            newReq.reviewStatus = 'second_review';
          }
        } else {
          newReq.reviewStatus = 'first_review';
        }
        
        return newReq;
      }
      return r;
    });
    setRequirements(updatedRequirements);
  };

  // 处理二级审核状态修改
  const handleReviewer2StatusChange = (requirementId: string, status: string) => {
    const updatedRequirements = requirements.map(r => {
      if (r.id === requirementId) {
        const newReq = { ...r, reviewer2Status: status, updatedAt: new Date().toISOString().split('T')[0] };
        
        // 更新总体评审状态
        if (status === 'rejected') {
          newReq.reviewStatus = 'rejected';
        } else if (status === 'approved' && r.reviewer1Status === 'approved') {
          newReq.reviewStatus = 'approved';
        } else {
          newReq.reviewStatus = 'second_review';
        }
        
        return newReq;
      }
      return r;
    });
    setRequirements(updatedRequirements);
  };

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    // 过滤掉已有预排期版本的需求（这些需求应该在预排期需求管理中显示）
    if (requirement.plannedVersion) return false;
    
    // 开放状态筛选
    if (filterOpenStatus === 'open' && !requirement.isOpen) return false;
    if (filterOpenStatus === 'closed' && requirement.isOpen) return false;
    // 其他筛选条件...
    if (searchTerm && !requirement.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterType !== 'all' && requirement.type !== filterType) return false;
    if (filterReviewStatus !== 'all') {
      const reviewStatus = getOverallReviewStatus(requirement);
      if (reviewStatus.status !== filterReviewStatus) return false;
    }
    if (filterPriority !== 'all' && requirement.priority !== filterPriority) return false;

    if (filterCreator !== 'all' && requirement.creator.id !== filterCreator) return false;
    if (filterProject !== 'all' && requirement.project.id !== filterProject) return false;
    return true;
  });

  // 排序逻辑
  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'priority':
        const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'plannedVersion':
        aValue = a.plannedVersion || '未排期';
        bValue = b.plannedVersion || '未排期';
        break;
      case 'updatedAt':
      default:
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (currentView === 'edit') {
    return <RequirementEditor 
      requirement={editingRequirement}
      setRequirement={setEditingRequirement}
      onBack={() => setCurrentView('list')}
      onSubmit={handleSubmitRequirement}
      onFileUpload={() => {}}
      removeAttachment={() => {}}
      addTag={(tag: string) => {
        const tags = editingRequirement.tags || [];
        if (!tags.includes(tag)) {
          setEditingRequirement({...editingRequirement, tags: [...tags, tag]});
        }
      }}
      removeTag={(tag: string) => {
        const tags = editingRequirement.tags || [];
        setEditingRequirement({...editingRequirement, tags: tags.filter(t => t !== tag)});
      }}
      fileInputRef={fileInputRef}
      onNavigate={onNavigate}
    />;
  }

  if (currentView === 'view' && selectedRequirement) {
    return <RequirementDetailView 
      requirement={selectedRequirement}
      onBack={() => setCurrentView('list')}
      onEdit={() => {
        setEditingRequirement(selectedRequirement);
        setCurrentView('edit');
      }}
      onToggleStatus={() => handleToggleRequirementStatus(selectedRequirement)}
      onNavigate={onNavigate}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">需求池</h1>
          <p className="text-muted-foreground mt-1">需求收集管理</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 开放状态筛选 */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={filterOpenStatus === 'open' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterOpenStatus('open')}
              className="h-8"
            >
              开放中
            </Button>
            <Button
              variant={filterOpenStatus === 'closed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterOpenStatus('closed')}
              className="h-8"
            >
              已关闭
            </Button>
            <Button
              variant={filterOpenStatus === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterOpenStatus('all')}
              className="h-8"
            >
              全部
            </Button>
          </div>
          <Button onClick={handleCreateRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            新建需求
          </Button>
        </div>
      </div>

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
                  className="pl-10"
                />
              </div>
              
              {/* 筛选器 */}
              <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
                <Filter className="h-4 w-4 mr-2" />
                筛选器
              </Button>
              
              {/* 排序 */}
              <Button variant="outline" size="sm" onClick={() => setShowSortDialog(true)}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                排序
              </Button>
              
              {/* 列设置 */}
              <Button variant="outline" size="sm" onClick={() => setShowColumnDialog(true)}>
                <EyeOff className="h-4 w-4 mr-2" />
                列设置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 需求列表 */}
      <Card>
        <CardContent className="p-0">
          {sortedRequirements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无需求</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                还没有创建任何需求。点击"新建需求"按钮开始创建您的第一个需求。
              </p>
              <Button onClick={handleCreateRequirement}>
                <Plus className="h-4 w-4 mr-2" />
                新建需求
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {!hiddenColumns.includes('title') && <TableHead>标题</TableHead>}
                  {!hiddenColumns.includes('type') && <TableHead>类型</TableHead>}
                  {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                  {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                  {!hiddenColumns.includes('project') && <TableHead>项目</TableHead>}
                  {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
                  {!hiddenColumns.includes('reviewer1') && <TableHead>一级审核</TableHead>}
                  {!hiddenColumns.includes('reviewer2') && <TableHead>二级审核</TableHead>}
                  {!hiddenColumns.includes('plannedVersion') && <TableHead>预排期版本</TableHead>}
                  {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((requirement) => (
                  <TableRow key={requirement.id} className="cursor-pointer hover:bg-muted/50">
                    {!hiddenColumns.includes('title') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        <div>
                          <div className="font-medium text-primary hover:underline">{requirement.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {requirement.description}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('type') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        <Select
                           value={requirement.type}
                           onValueChange={(value) => handleTypeChange(requirement.id, value)}
                         >
                           <SelectTrigger className="h-8 w-32">
                             <Badge variant="outline" className="border-none bg-transparent">
                               {requirement.type}
                             </Badge>
                           </SelectTrigger>
                           <SelectContent>
                             {requirementTypes.map((type) => (
                               <SelectItem key={type} value={type}>
                                 {type}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('priority') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        <Badge 
                          variant={
                            requirement.priority === '紧急' ? 'destructive' :
                            requirement.priority === '高' ? 'default' :
                            requirement.priority === '中' ? 'secondary' : 'outline'
                          }
                        >
                          {requirement.priority}
                        </Badge>
                      </TableCell>
                    )}

                    {!hiddenColumns.includes('creator') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={requirement.creator.avatar} />
                            <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{requirement.creator.name}</span>
                        </div>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('project') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        <Badge variant="outline" style={{ borderColor: requirement.project.color }}>
                          {requirement.project.name}
                        </Badge>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('reviewStatus') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        {(() => {
                          const reviewStatus = getOverallReviewStatus(requirement);
                          return (
                            <Badge variant={reviewStatus.variant} className="text-xs">
                              {reviewStatus.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('reviewer1') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        {requirement.reviewer1 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={requirement.reviewer1.avatar} />
                                <AvatarFallback className="text-xs">
                                  {requirement.reviewer1.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{requirement.reviewer1.name}</span>
                            </div>
                            <Badge 
                              variant={
                                requirement.reviewer1Status === 'approved' ? 'default' : 
                                requirement.reviewer1Status === 'rejected' ? 'destructive' : 
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {requirement.reviewer1Status === 'approved' ? '评审通过' : 
                               requirement.reviewer1Status === 'rejected' ? '评审不通过' : 
                               '待评审'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">未设置</span>
                        )}
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('reviewer2') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
                        {requirement.reviewer2 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={requirement.reviewer2.avatar} />
                                <AvatarFallback className="text-xs">
                                  {requirement.reviewer2.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{requirement.reviewer2.name}</span>
                            </div>
                            <Badge 
                              variant={
                                requirement.reviewer2Status === 'approved' ? 'default' : 
                                requirement.reviewer2Status === 'rejected' ? 'destructive' : 
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {requirement.reviewer2Status === 'approved' ? '评审通过' : 
                               requirement.reviewer2Status === 'rejected' ? '评审不通过' : 
                               '待评审'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">无需审核</span>
                        )}
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('plannedVersion') && (
                      <TableCell onClick={() => handleViewRequirement(requirement)}>
{(() => {
                          // 检查审核是否完全通过
                          const hasReviewer1 = !!requirement.reviewer1;
                          const hasReviewer2 = !!requirement.reviewer2;
                          const reviewer1Status = requirement.reviewer1Status || 'pending';
                          const reviewer2Status = requirement.reviewer2Status || 'pending';
                          
                          const isFullyApproved = (() => {
                            if (!hasReviewer1 && !hasReviewer2) return false; // 没有审核人员
                            if (hasReviewer1 && !hasReviewer2) return reviewer1Status === 'approved';
                            if (hasReviewer1 && hasReviewer2) return reviewer1Status === 'approved' && reviewer2Status === 'approved';
                            return false;
                          })();

                          if (!isFullyApproved) {
                            return <span className="text-muted-foreground text-sm">-</span>;
                          }

                          if (requirement.plannedVersion) {
                            return (
                              <Badge variant="secondary">
                                {requirement.plannedVersion}
                              </Badge>
                            );
                          } else {
                            return (
                              <Select
                                value=""
                                onValueChange={(version) => handleVersionSelect(requirement.id, version)}
                              >
                                <SelectTrigger className="h-8 w-24 text-sm">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableVersions.map((version) => (
                                    <SelectItem key={version} value={version}>
                                      {version}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }
                        })()}
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('updatedAt') && (
                      <TableCell className="text-sm text-muted-foreground" onClick={() => handleViewRequirement(requirement)}>
                        {requirement.updatedAt}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 筛选对话框 */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>设置筛选条件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>需求类型</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="功能需求">功能需求</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="产品建议">产品建议</SelectItem>
                  <SelectItem value="技术需求">技术需求</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>评审状态</Label>
              <Select value={filterReviewStatus} onValueChange={setFilterReviewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待评审</SelectItem>
                  <SelectItem value="reviewing">评审中</SelectItem>
                  <SelectItem value="approved">评审通过</SelectItem>
                  <SelectItem value="rejected">评审不通过</SelectItem>
                  <SelectItem value="none">未设置评审</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>优先级</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部优先级</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="紧急">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>所属项目</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部项目</SelectItem>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 排序对话框 */}
      <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>设置排序条件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>排序字段</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">更新时间</SelectItem>
                  <SelectItem value="createdAt">创建时间</SelectItem>
                  <SelectItem value="title">标题</SelectItem>
                  <SelectItem value="priority">优先级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>排序方向</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降序（新到旧/高到低）</SelectItem>
                  <SelectItem value="asc">升序（旧到新/低到高）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 列设置对话框 */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>列显示设置</DialogTitle>
            <DialogDescription>选择要隐藏的列</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { key: 'title', label: '标题' },
              { key: 'type', label: '类型' },
              { key: 'priority', label: '优先级' },
              { key: 'creator', label: '创建人' },
              { key: 'project', label: '项目' },
              { key: 'reviewStatus', label: '评审状态' },
              { key: 'reviewer1', label: '一级评审' },
              { key: 'reviewer2', label: '二级评审' },
              { key: 'plannedVersion', label: '预排期版本' },
              { key: 'updatedAt', label: '更新时间' }
            ].map(column => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={!hiddenColumns.includes(column.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setHiddenColumns(hiddenColumns.filter(col => col !== column.key));
                    } else {
                      if (column.key !== 'title') { // 标题列不能隐藏
                        setHiddenColumns([...hiddenColumns, column.key]);
                      }
                    }
                  }}
                  disabled={column.key === 'title'}
                />
                <Label htmlFor={column.key} className={column.key === 'title' ? 'text-muted-foreground' : ''}>
                  {column.label} {column.key === 'title' && '(必显示)'}
                </Label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 需求编辑器组件
function RequirementEditor({ 
  requirement, 
  setRequirement, 
  onBack, 
  onSubmit, 
  onFileUpload, 
  removeAttachment, 
  addTag, 
  removeTag,
  fileInputRef,
  onNavigate
}: {
  requirement: Partial<Requirement>;
  setRequirement: (req: Partial<Requirement>) => void;
  onBack: () => void;
  onSubmit: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (id: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onNavigate?: (page: string, context?: any) => void;
}) {
  const [newTag, setNewTag] = useState('');
  const predefinedTags = ['UI优化', '性能', '安全', '用户体验', '移动端', '数据分析', 'Bug', '紧急', '功能', '导出'];
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleNavigateToPRD = () => {
    if (onNavigate) {
      // 检查是否已有PRD（这里用模拟逻辑）
      const hasPRD = requirement.id && Math.random() > 0.5; // 模拟数据
      if (hasPRD) {
        onNavigate('prd', { mode: 'view', requirementId: requirement.id, returnTo: 'requirements' });
      } else {
        onNavigate('prd', { mode: 'create', requirementId: requirement.id, returnTo: 'requirements' });
      }
    }
  };

  const handleNavigateToBugs = () => {
    if (onNavigate) {
      onNavigate('bugs', { 
        filterRequirementId: requirement.id,
        requirementTitle: requirement.title,
        returnTo: 'requirements'
      });
    }
  };

  const handleNavigateToPrototype = () => {
    if (onNavigate) {
      // 检查是否已有关联的原型设计
      const hasPrototype = requirement.prototypeId;
      if (hasPrototype) {
        onNavigate('prototype', { mode: 'view', prototypeId: requirement.prototypeId, returnTo: 'requirements' });
      } else {
        onNavigate('prototype', { mode: 'create', requirementId: requirement.id, returnTo: 'requirements' });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <h1 className="text-2xl font-semibold">
            {requirement.id ? '编辑需求' : '新建需求'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          <Button onClick={onSubmit}>
            {requirement.id ? '保存' : '创建'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧表单 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">需求标题</Label>
                <Input
                  id="title"
                  value={requirement.title || ''}
                  onChange={(e) => setRequirement({ ...requirement, title: e.target.value })}
                  placeholder="请输入需求标题"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>需求类型</Label>
                  <Select 
                    value={requirement.type || '功能需求'} 
                    onValueChange={(value: '功能需求' | 'Bug' | '产品建议' | '技术需求' | '安全需求') => 
                      setRequirement({ ...requirement, type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="功能需求">功能需求</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="产品建议">产品建议</SelectItem>
                      <SelectItem value="技术需求">技术需求</SelectItem>
                      <SelectItem value="安全需求">安全需求</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>优先级</Label>
                  <Select 
                    value={requirement.priority || '中'} 
                    onValueChange={(value: '低' | '中' | '高' | '紧急') => 
                      setRequirement({ ...requirement, priority: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="低">低</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="紧急">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>所属项目</Label>
                  <Select 
                    value={requirement.project?.id || mockProjects[0].id} 
                    onValueChange={(value) => {
                      const project = mockProjects.find(p => p.id === value);
                      if (project) {
                        setRequirement({ ...requirement, project });
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>平台</Label>
                  <Select 
                    value={requirement.platform || 'Web端'} 
                    onValueChange={(value) => setRequirement({ ...requirement, platform: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web端">Web端</SelectItem>
                      <SelectItem value="移动端">移动端</SelectItem>
                      <SelectItem value="全平台">全平台</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">需求描述</Label>
                <Textarea
                  id="description"
                  value={requirement.description || ''}
                  onChange={(e) => setRequirement({ ...requirement, description: e.target.value })}
                  placeholder="请详细描述需求内容..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 标签管理 */}
          <Card>
            <CardHeader>
              <CardTitle>标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>常用标签</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedTags.map(tag => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      disabled={(requirement.tags || []).includes(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>自定义标签</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入标签名称"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                    添加
                  </Button>
                </div>
              </div>

              {requirement.tags && requirement.tags.length > 0 && (
                <div>
                  <Label>已添加标签</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {requirement.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPRD}
                disabled={!requirement.id}
              >
                <FileText className="h-4 w-4 mr-2" />
                {requirement.id && Math.random() > 0.5 ? '查看PRD文档' : '创建PRD文档'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPrototype}
                disabled={!requirement.id}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {requirement.prototypeId ? '查看原型设计' : '创建原型设计'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToBugs}
                disabled={!requirement.id}
              >
                <Bug className="h-4 w-4 mr-2" />
                查看相关Bug
              </Button>
            </CardContent>
          </Card>

          {/* 附件上传 */}
          <Card>
            <CardHeader>
              <CardTitle>附件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={onFileUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  上传附件
                </Button>
              </div>

              {requirement.attachments && requirement.attachments.length > 0 && (
                <div className="space-y-2">
                  {requirement.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 需求详情查看组件
function RequirementDetailView({ 
  requirement, 
  onBack, 
  onEdit, 
  onToggleStatus,
  onNavigate
}: {
  requirement: Requirement;
  onBack: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onNavigate?: (page: string, context?: any) => void;
}) {
  const handleNavigateToPRD = () => {
    if (onNavigate) {
      // 检查是否已有PRD（这里用模拟逻辑）
      const hasPRD = Math.random() > 0.5; // 模拟数据
      if (hasPRD) {
        onNavigate('prd', { mode: 'view', requirementId: requirement.id, returnTo: 'requirements' });
      } else {
        onNavigate('prd', { mode: 'create', requirementId: requirement.id, returnTo: 'requirements' });
      }
    }
  };

  const handleNavigateToBugs = () => {
    if (onNavigate) {
      onNavigate('bugs', { 
        filterRequirementId: requirement.id,
        requirementTitle: requirement.title,
        returnTo: 'requirements'
      });
    }
  };

  const handleNavigateToPrototype = () => {
    if (onNavigate) {
      // ���查是否已有关联的原型设计
      const hasPrototype = requirement.prototypeId;
      if (hasPrototype) {
        onNavigate('prototype', { mode: 'view', prototypeId: requirement.prototypeId, returnTo: 'requirements' });
      } else {
        onNavigate('prototype', { mode: 'create', requirementId: requirement.id, returnTo: 'requirements' });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div className="flex items-center gap-2">
            <Badge 
              variant={requirement.isOpen ? 'default' : 'secondary'}
              className="text-xs"
            >
              {requirement.isOpen ? '开放中' : '已���闭'}
            </Badge>
            <h1 className="text-2xl font-semibold">{requirement.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onToggleStatus}
            className="text-xs"
          >
            {requirement.isOpen ? '关闭需求' : '重新开放'}
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>需求描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {requirement.description}
              </p>
            </CardContent>
          </Card>

          {requirement.attachments && requirement.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>附件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requirement.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 侧边信息 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">需求类型</Label>
                <div className="mt-1">
                  <Badge variant="outline">{requirement.type}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">优先级</Label>
                <div className="mt-1">
                  <Badge 
                    variant={
                      requirement.priority === '紧急' ? 'destructive' :
                      requirement.priority === '高' ? 'default' :
                      requirement.priority === '中' ? 'secondary' : 'outline'
                    }
                  >
                    {requirement.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">所属项目</Label>
                <div className="mt-1">
                  <Badge variant="outline" style={{ borderColor: requirement.project.color }}>
                    {requirement.project.name}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">平台</Label>
                <div className="mt-1 text-sm">{requirement.platform}</div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">创建人</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={requirement.creator.avatar} />
                    <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{requirement.creator.name}</span>
                </div>
              </div>

              {requirement.assignee && (
                <div>
                  <Label className="text-xs text-muted-foreground">指派人员</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={requirement.assignee.avatar} />
                      <AvatarFallback>{requirement.assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{requirement.assignee.name}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">创建时间</Label>
                <div className="mt-1 text-sm">{requirement.createdAt}</div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">更新时间</Label>
                <div className="mt-1 text-sm">{requirement.updatedAt}</div>
              </div>
            </CardContent>
          </Card>

          {requirement.tags && requirement.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPRD}
              >
                <FileText className="h-4 w-4 mr-2" />
                {Math.random() > 0.5 ? '查看PRD文档' : '创建PRD文档'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPrototype}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {requirement.prototypeId ? '查看原型设计' : '创建原型设计'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToBugs}
              >
                <Bug className="h-4 w-4 mr-2" />
                查看相关Bug
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}