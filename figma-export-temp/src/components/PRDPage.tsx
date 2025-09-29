import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { PRDListTable } from './PRDPageList';
import { PRDViewerUpdated } from './PRDViewerUpdated';
import { PRDEditorUpdated } from './PRDEditorUpdated';
import { 
  Plus, 
  List, 
  LayoutDashboard, 
  Edit, 
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  Send,
  History,
  FileText,
  Link,
  Upload,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Code,
  Image,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  List as ListIcon,
  Quote,
  Users,
  Calendar,
  Tag,
  Paperclip,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FolderOpen
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

interface RequirementRef {
  id: string;
  title: string;
  type: string;
}

interface TaskRef {
  id: string;
  title: string;
  status: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Version {
  id: string;
  version: string;
  content: string;
  createdAt: string;
  creator: User;
  comment?: string;
}

interface PRDItem {
  id: string;
  title: string;
  version: string;
  project: Project;
  status: 'draft' | 'published' | 'reviewing' | 'archived';
  creator: User;
  updatedAt: string;
  createdAt: string;
  content?: string;
  linkedRequirements?: RequirementRef[];
  attachments?: Attachment[];
  versions?: Version[];
  tags?: string[];
  reviewers?: User[]; // 保留旧字段兼容性
  reviewer1?: User; // 一级评审人员
  reviewer2?: User; // 二级评审人员
  isDraft?: boolean; // 是否为草稿箱中的项目
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected'; // 评审状态
  reviewer1Status?: 'pending' | 'approved' | 'rejected'; // 一级评审状态
  reviewer2Status?: 'pending' | 'approved' | 'rejected'; // 二级评审状态
  platform?: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' },
];

// 可选的应用端
const platforms = [
  'Web端', '移动端', '全平台', 'PC端', '小程序'
];

const mockRequirements: RequirementRef[] = [
  { id: '1', title: '用户注册流程优化', type: '功能需求' },
  { id: '2', title: '支付功能集成', type: '功能需求' },
  { id: '3', title: '数据导出功能', type: '产品建议' },
  { id: '4', title: '移动端适配优化', type: '技术需求' },
  { id: '5', title: 'K线图实时更新优化', type: '功能需求' },
  { id: '6', title: '行情推送服务升级', type: '技术需求' },
  { id: '7', title: '聊天室表情包功能', type: '产品建议' },
  { id: '8', title: '交易风控系统优化', type: '安全需求' },
];

const mockTasks: TaskRef[] = [
  { id: '1', title: '登录页面重构', status: '进行中' },
  { id: '2', title: '支付接口开发', status: '待开始' },
  { id: '3', title: 'UI设计稿', status: '已完成' },
];

// 格式化时间为 YYYY-MM-DD HH:mm
const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const mockPRDs: PRDItem[] = [
  {
    id: '1',
    title: '用户注册流程优化PRD',
    version: 'v2.1',
    project: mockProjects[0],
    platform: 'Web端',
    status: 'published',
    creator: mockUsers[0],
    updatedAt: '2024-01-20 14:30',
    createdAt: '2024-01-15 09:15',
    content: '# 用户中心PRD v2.1\\n\\n## 项目背景\\n用户中心是整个平台的核心模块...',
    linkedRequirements: [mockRequirements[0]],
    tags: ['用户体验', 'UI优化'],
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
  {
    id: '2',
    title: '支付功能集成PRD',
    version: 'v2.0',
    project: mockProjects[4],
    platform: '全平台',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-18 16:45',
    createdAt: '2024-01-10 11:20',
    content: '# 支付系统PRD v1.0\\n\\n## 项目背景\\n支付系统需要支持多种支付方式...',
    linkedRequirements: [mockRequirements[1]],
    tags: ['支付', '功能'],
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
  {
    id: '3',
    title: '数据导出功能PRD',
    version: 'v2.2',
    project: mockProjects[3],
    platform: 'PC端',
    status: 'reviewing',
    creator: mockUsers[3],
    updatedAt: '2024-01-16 10:22',
    createdAt: '2024-01-12 15:30',
    content: '# 数据导出功能PRD v2.2\\\\n\\\\n## 项目背景\\\\n支持用户导出各种格式的数据报表，包括Excel、PDF、CSV等格式。\\\\n\\\\n## 功能需求\\\\n1. 多格式导出\\\\n2. 批量导出\\\\n3. 导出权限管理\\n\\n## 项目背景\\n移动端用户占比逐渐增加...',
    tags: ['导出', '数据分析'],
    linkedRequirements: [mockRequirements[2]],
    reviewer1: mockUsers[0],
    reviewStatus: 'first_review',
    reviewer1Status: 'pending'
  },
  {
    id: '4',
    title: '移动端适配优化PRD',
    version: 'v1.8',
    project: mockProjects[3],
    platform: '移动端',
    status: 'archived',
    creator: mockUsers[1],
    updatedAt: '2024-01-14 13:15',
    createdAt: '2024-01-08 08:45',
    content: '# 移动端适配优化PRD v1.8\\\\n\\\\n## 项目背景\\\\n对移动端界面进行全面优化，提升用户在移动设备上的使用体验。\\\\n\\\\n## 功能需求\\\\n1. 响应式设计\\\\n2. 触控优化\\\\n3. 性能优化',
    linkedRequirements: [mockRequirements[3]],
    tags: ['移动端', '响应式'],
    reviewer1: mockUsers[2],
    reviewStatus: 'rejected',
    reviewer1Status: 'rejected'
  },
  {
    id: '5',
    title: 'K线图实时更新优化PRD',
    version: 'v2.3',
    project: mockProjects[0],
    platform: '全平台',
    status: 'published',
    creator: mockUsers[0],
    updatedAt: '2024-01-25 11:30',
    createdAt: '2024-01-20 16:45',
    content: '# K线图实时更新优化PRD v2.3\\\\n\\\\n## 项目背景\\\\n优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。\\\\n\\\\n## 功能需求\\\\n1. 实时数据更新\\\\n2. 性能优化\\\\n3. 技术指标计算',
    linkedRequirements: [mockRequirements[4]],
    tags: ['K线', '实时数据', '性能优化'],
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
  {
    id: '6',
    title: '行情推送服务升级PRD',
    version: 'v2.4',
    project: mockProjects[1],
    platform: 'Web端',
    status: 'reviewing',
    creator: mockUsers[2],
    updatedAt: '2024-01-26 09:15',
    createdAt: '2024-01-22 14:20',
    content: '# 行情推送服务升级PRD v2.4\\\\n\\\\n## 项目背景\\\\n升级行情推送服务架构，支持更高并发量的实时行情数据推送，降低延迟。\\\\n\\\\n## 功能需求\\\\n1. WebSocket优化\\\\n2. 高并发处理\\\\n3. 延迟优化',
    linkedRequirements: [mockRequirements[5]],
    tags: ['行情', 'WebSocket', '高并发'],
    reviewer1: mockUsers[4],
    reviewStatus: 'first_review',
    reviewer1Status: 'pending'
  },
  {
    id: '7',
    title: '聊天室表情包功能PRD',
    version: 'v2.0',
    project: mockProjects[2],
    platform: '小程序',
    status: 'published',
    creator: mockUsers[3],
    updatedAt: '2024-01-28 15:50',
    createdAt: '2024-01-05 12:30',
    content: '# 聊天室表情包功能PRD v2.0\\\\n\\\\n## 项目背景\\\\n在聊天室中添加表情包功能，支持自定义表情包上传和管理，提升用户交流体验。\\\\n\\\\n## 功能需求\\\\n1. 表情包管理\\\\n2. 自定义上传\\\\n3. 分类管理',
    linkedRequirements: [mockRequirements[6]],
    tags: ['聊天室', '表情包', '用户体验'],
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
  {
    id: '8',
    title: '交易风控系统优化PRD',
    version: 'v2.5',
    project: mockProjects[4],
    platform: 'PC端',
    status: 'reviewing',
    creator: mockUsers[4],
    updatedAt: '2024-01-24 17:20',
    createdAt: '2024-01-18 10:45',
    content: '# 交易风控系统优化PRD v2.5\\\\n\\\\n## 项目背景\\\\n完善交易风控系统，增加异常交易检测算法，提升系统安全性和风险防控能力。\\\\n\\\\n## 功能需求\\\\n1. 异常检测算法\\\\n2. 风险评估\\\\n3. 安全防控',
    linkedRequirements: [mockRequirements[7]],
    tags: ['风控', '安全', '算法'],
    reviewer1: mockUsers[2],
    reviewStatus: 'first_review',
    reviewer1Status: 'pending'
  }
];

// 草稿箱数据
const mockDraftPRDs: PRDItem[] = [
  {
    id: 'draft-1',
    title: '电商系统PRD草稿',
    version: 'v1.0',
    project: mockProjects[0],
    status: 'draft',
    creator: mockUsers[0],
    updatedAt: '2024-12-17 16:30',
    createdAt: '2024-12-17 16:30',
    content: '# 电商系统PRD\\\\n\\\\n## 草稿内容\\\\n这是一个草稿...',
    linkedRequirements: [],
    tags: ['电商', '草稿'],
    isDraft: true,
    reviewStatus: 'pending'
  }
];

const statusLabels = {
  draft: { label: '草稿', variant: 'secondary' as const, icon: Edit, color: 'text-gray-500' },
  reviewing: { label: '审核中', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-500' },
  published: { label: '已发布', variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
  archived: { label: '已归档', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-400' }
};

const reviewStatusLabels = {
  pending: { label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' },
  first_review: { label: '评审中', variant: 'outline' as const, color: 'text-blue-500' },
  second_review: { label: '评审中', variant: 'outline' as const, color: 'text-yellow-500' },
  approved: { label: '评审通过', variant: 'default' as const, color: 'text-green-500' },
  rejected: { label: '评审不通过', variant: 'destructive' as const, color: 'text-red-500' }
};

// 计算总评审状态的函数
const getOverallReviewStatus = (prd: PRDItem) => {
  const hasReviewer1 = !!prd.reviewer1;
  const hasReviewer2 = !!prd.reviewer2;
  
  // 如果没有设置任何评审人员，显示"-"
  if (!hasReviewer1 && !hasReviewer2) {
    return { status: 'none', label: '-', variant: 'outline' as const, color: 'text-gray-400' };
  }
  
  const reviewer1Status = prd.reviewer1Status || 'pending';
  const reviewer2Status = prd.reviewer2Status || 'pending';
  
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

interface PRDPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function PRDPage({ context, onNavigate }: PRDPageProps = {}) {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view' | 'drafts'>('list');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [selectedPRD, setSelectedPRD] = useState<PRDItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCreator, setFilterCreator] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [prds, setPrds] = useState<PRDItem[]>(mockPRDs);
  const [draftPrds, setDraftPrds] = useState<PRDItem[]>(mockDraftPRDs);
  
  // 隐藏列设置
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  
  // 可用列定义
  const availableColumns = [
    { key: 'title', label: 'PRD标题', required: true },
    { key: 'version', label: '版本' },
    { key: 'project', label: '所属项目' },
    { key: 'platform', label: '应用端' },
    { key: 'reviewStatus', label: '评审状态' },
    { key: 'reviewer1', label: '一级评审' },
    { key: 'reviewer2', label: '二级评审' },
    { key: 'creator', label: '创建人' },
    { key: 'updatedAt', label: '更新时间' }
  ];
  
  // 编辑器状态
  const [editingPRD, setEditingPRD] = useState<Partial<PRDItem>>({
    title: '',
    content: '',
    project: mockProjects[0],
    status: 'draft',
    linkedRequirements: [],
    attachments: [],
    tags: [],
    isDraft: true,
    reviewStatus: 'pending',
    reviewer1Status: 'pending',
    reviewer2Status: 'pending'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导航上下文
  useEffect(() => {
    if (context) {
      if (context.mode === 'create') {
        setCurrentView('edit');
        setEditingPRD({
          title: context.requirementTitle || '',
          content: '',
          project: mockProjects[0],
          status: 'draft',
          linkedRequirements: context.requirementId ? [{
            id: context.requirementId,
            title: context.requirementTitle || '',
            type: '功能需求'
          }] : [],
          attachments: [],
          tags: [],
          isDraft: true,
          reviewStatus: 'pending',
          reviewer1Status: 'pending',
          reviewer2Status: 'pending'
        });
      } else if (context.mode === 'edit' && context.prd) {
        // 从PRD管理页面进入编辑模式
        setCurrentView('edit');
        setEditingPRD(context.prd);
        setSelectedPRD(context.prd);
      } else if (context.mode === 'view' && context.prd) {
        // 从PRD管理页面进入查看模式
        setSelectedPRD(context.prd);
        setCurrentView('view');
      } else if (context.mode === 'view' && context.requirementId) {
        // 查找关联的PRD
        const relatedPRD = prds.find(p => p.linkedRequirements?.some(req => req.id === context.requirementId));
        if (relatedPRD) {
          setSelectedPRD(relatedPRD);
          setCurrentView('view');
        } else {
          // 如果没有找到关联PRD，进入创建模式
          setCurrentView('edit');
          setEditingPRD({
            title: context.requirementTitle || '',
            content: '',
            project: mockProjects[0],
            status: 'draft',
            linkedRequirements: [{
              id: context.requirementId,
              title: context.requirementTitle || '',
              type: '功能需求'
            }],
            attachments: [],
            tags: [],
            isDraft: true,
            reviewStatus: 'pending',
            reviewer1Status: 'pending',
            reviewer2Status: 'pending'
          });
        }
      }
    }
  }, [context, prds]);

  // 筛选和排序逻辑 - 草稿不出现在PRD列表上
  const currentDataSource = currentView === 'drafts' ? draftPrds : prds.filter(prd => prd.status !== 'draft' && !prd.isDraft);
  const filteredPRDs = currentDataSource.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prd.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || prd.project.id === filterProject;
    const matchesCreator = filterCreator === 'all' || prd.creator.id === filterCreator;
    
    return matchesSearch && matchesProject && matchesCreator;
  });

  const sortedPRDs = [...filteredPRDs].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'version':
        aValue = a.version;
        bValue = b.version;
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleCreatePRD = () => {
    setEditingPRD({
      title: '',
      content: '',
      project: mockProjects[0],
      status: 'draft',
      linkedRequirements: [],
      attachments: [],
      tags: [],
      reviewers: [],
      isDraft: true,
      reviewStatus: 'pending',
      reviewer1Status: 'pending', // 一级审核人员默认为审核中
      reviewer2Status: 'pending'  // 二级审核人员默认为待审核
    });
    setCurrentView('edit');
  };

  const handleEditPRD = (prd: PRDItem) => {
    setEditingPRD(prd);
    setSelectedPRD(prd);
    setCurrentView('edit');
  };

  const handleViewPRD = (prd: PRDItem) => {
    setSelectedPRD(prd);
    setCurrentView('view');
  };

  const handleSaveDraft = () => {
    if (editingPRD.id) {
      // 更新现有草稿
      if (editingPRD.isDraft) {
        setDraftPrds(draftPrds.map(p => p.id === editingPRD.id ? { 
          ...editingPRD as PRDItem, 
          updatedAt: formatDateTime(new Date()) 
        } : p));
      } else {
        setPrds(prds.map(p => p.id === editingPRD.id ? { 
          ...editingPRD as PRDItem, 
          updatedAt: new Date().toISOString().split('T')[0] 
        } : p));
      }
    } else {
      // 创建新草稿
      const newPRD: PRDItem = {
        ...editingPRD as PRDItem,
        id: `draft-${Date.now()}`,
        version: 'v1.0',
        creator: mockUsers[0], // 当前用户
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isDraft: true,
        reviewStatus: 'pending'
      };
      setDraftPrds([newPRD, ...draftPrds]);
    }
    setCurrentView('drafts');
  };

  const handleSubmitPRD = () => {
    // 检查是否设置了审核人员
    if (!editingPRD.reviewer1) {
      alert('请设置一级审核人员');
      return;
    }

    const submittedPRD: PRDItem = {
      ...editingPRD as PRDItem,
      id: editingPRD.id || `prd-${Date.now()}`,
      version: editingPRD.version || 'v1.0',
      creator: mockUsers[0], // 当前用户
      createdAt: editingPRD.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'reviewing',
      isDraft: false,
      reviewStatus: 'first_review',
      reviewer1Status: 'pending',
      reviewer2Status: 'pending'
    };

    // 模拟通知一级审核人员
    console.log(`通知 ${submittedPRD.reviewer1?.name} 进行一级审核: ${submittedPRD.title}`);

    // 如果是从草稿提交，需要从草稿箱移除
    if (editingPRD.isDraft && editingPRD.id) {
      setDraftPrds(draftPrds.filter(p => p.id !== editingPRD.id));
    }

    // 添加到正式PRD列表
    if (editingPRD.id && !editingPRD.isDraft) {
      setPrds(prds.map(p => p.id === editingPRD.id ? submittedPRD : p));
    } else {
      setPrds([submittedPRD, ...prds]);
    }
    
    // 根据来源决定返回位置
    if (context?.source === 'prd-management' && onNavigate) {
      onNavigate('prd', { source: 'prd-management' });
    } else {
      setCurrentView('list');
    }
  };

  // 处理一级审核
  const handleFirstReviewApprove = (prdId: string) => {
    setPrds(prds.map(p => {
      if (p.id === prdId) {
        const updatedPRD = {
          ...p,
          reviewer1Status: 'approved' as const,
          reviewStatus: p.reviewer2 ? 'second_review' as const : 'approved' as const,
          status: p.reviewer2 ? 'reviewing' as const : 'published' as const,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        // 如果有二级审核人员，通知二级审核
        if (p.reviewer2) {
          console.log(`一级审核通过，通知 ${p.reviewer2.name} 进行二级审核: ${p.title}`);
        } else {
          console.log(`审核完成，PRD已发布: ${p.title}`);
        }
        
        return updatedPRD;
      }
      return p;
    }));
  };

  // 处理二级审核
  const handleSecondReviewApprove = (prdId: string) => {
    setPrds(prds.map(p => {
      if (p.id === prdId) {
        const updatedPRD = {
          ...p,
          reviewer2Status: 'approved' as const,
          reviewStatus: 'approved' as const,
          status: 'published' as const,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        console.log(`二级审核通过，PRD已发布: ${p.title}`);
        return updatedPRD;
      }
      return p;
    }));
  };

  // 处理审核拒绝
  const handleReviewReject = (prdId: string, level: 'first' | 'second') => {
    setPrds(prds.map(p => {
      if (p.id === prdId) {
        const updatedPRD = {
          ...p,
          ...(level === 'first' 
            ? { reviewer1Status: 'rejected' as const }
            : { reviewer2Status: 'rejected' as const }
          ),
          reviewStatus: 'rejected' as const,
          status: 'draft' as const,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        console.log(`${level === 'first' ? '一级' : '二级'}审核被拒绝: ${p.title}`);
        return updatedPRD;
      }
      return p;
    }));
  };

  const handleCancel = () => {
    if (context?.source === 'prd-management' && onNavigate) {
      onNavigate('prd', { source: 'prd-management' });
    } else if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    } else {
      setCurrentView(editingPRD.isDraft ? 'drafts' : 'list');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setEditingPRD(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const removeAttachment = (id: string) => {
    setEditingPRD(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== id) || []
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !editingPRD.tags?.includes(tag)) {
      setEditingPRD(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEditingPRD(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleBack = () => {
    if (context?.source === 'prd-management' && onNavigate) {
      onNavigate('prd', { source: 'prd-management' });
    } else if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    } else {
      setCurrentView('list');
    }
  };

  // 处理项目修改
  const handleProjectChange = (prdId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const updatedPrds = prds.map(p => 
        p.id === prdId 
          ? { ...p, project, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      );
      setPrds(updatedPrds);
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (prdId: string, platform: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { ...p, platform, updatedAt }
        : p
    );
    setPrds(updatedPrds);
  };

  // 处理一级评审人员修改
  const handleReviewer1Change = (prdId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer1: user || undefined,
            reviewer1Status: user ? 'pending' as const : undefined,
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : p
    );
    setPrds(updatedPrds);
  };

  // 处理二级评审人员修改
  const handleReviewer2Change = (prdId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer2: user || undefined,
            reviewer2Status: user ? 'pending' as const : undefined,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : p
    );
    setPrds(updatedPrds);
  };

  // 处理一级评审状态修改
  const handleReviewer1StatusChange = (prdId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer1Status: status,
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : p
    );
    setPrds(updatedPrds);
  };

  // 处理二级评审状态修改
  const handleReviewer2StatusChange = (prdId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer2Status: status,
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : p
    );
    setPrds(updatedPrds);
  };

  if (currentView === 'edit') {
    return <PRDEditorUpdated 
      prd={editingPRD}
      setPrd={setEditingPRD}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmitPRD}
      onCancel={handleCancel}
      projects={mockProjects}
      users={mockUsers}
      requirements={mockRequirements}
      tasks={mockTasks}
      onProjectChange={(projectId) => {
        const project = mockProjects.find(p => p.id === projectId);
        if (project) {
          setEditingPRD(prev => ({ ...prev, project }));
        }
      }}
      onPlatformChange={(platform) => {
        setEditingPRD(prev => ({ ...prev, platform }));
      }}
      onReviewer1Change={(userId) => {
        const user = userId ? mockUsers.find(u => u.id === userId) : null;
        setEditingPRD(prev => ({ 
          ...prev, 
          reviewer1: user || undefined,
          reviewer1Status: user ? 'pending' as const : undefined
        }));
      }}
      onReviewer2Change={(userId) => {
        const user = userId ? mockUsers.find(u => u.id === userId) : null;
        setEditingPRD(prev => ({ 
          ...prev, 
          reviewer2: user || undefined,
          reviewer2Status: user ? 'pending' as const : undefined
        }));
      }}
      onFileUpload={handleFileUpload}
      onRemoveAttachment={removeAttachment}
      onAddTag={addTag}
      onRemoveTag={removeTag}
      fileInputRef={fileInputRef}
    />;
  }

  if (currentView === 'view' && selectedPRD) {
    return <PRDViewerUpdated 
      prd={selectedPRD}
      onEdit={() => handleEditPRD(selectedPRD)}
      onBack={handleBack}
      onFirstReviewApprove={() => handleFirstReviewApprove(selectedPRD.id)}
      onSecondReviewApprove={() => handleSecondReviewApprove(selectedPRD.id)} 
      onReviewReject={(level) => handleReviewReject(selectedPRD.id, level)}
      projects={mockProjects}
      users={mockUsers}
      requirements={mockRequirements}
      tasks={mockTasks}
      onProjectChange={(projectId) => handleProjectChange(selectedPRD.id, projectId)}
      onPlatformChange={(platform) => handlePlatformChange(selectedPRD.id, platform)}
      onReviewer1Change={(userId) => handleReviewer1Change(selectedPRD.id, userId)}
      onReviewer2Change={(userId) => handleReviewer2Change(selectedPRD.id, userId)}
      onReviewer1StatusChange={(status) => handleReviewer1StatusChange(selectedPRD.id, status)}
      onReviewer2StatusChange={(status) => handleReviewer2StatusChange(selectedPRD.id, status)}
    />;
  }

  // 默认返回列表视图或其他内容
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">PRD页面</h1>
          <p className="text-muted-foreground mt-1">产品需求文档管理</p>
        </div>
        <Button onClick={handleCreatePRD}>
          <Plus className="h-4 w-4 mr-2" />
          新建PRD
        </Button>
      </div>
      
      <PRDListTable
        prds={sortedPRDs}
        onSort={handleSortChange} 
        sortBy={sortBy}
        sortOrder={sortOrder}
        hiddenColumns={hiddenColumns}
        availableColumns={availableColumns}
        onToggleColumn={(column) => {
          if (hiddenColumns.includes(column)) {
            setHiddenColumns(hiddenColumns.filter(c => c !== column));
          } else {
            setHiddenColumns([...hiddenColumns, column]);
          }
        }}
        onViewPRD={handleViewPRD}
        onEditPRD={handleEditPRD}
        onProjectChange={handleProjectChange}
        onPlatformChange={handlePlatformChange}
        onReviewer1Change={handleReviewer1Change}
        onReviewer2Change={handleReviewer2Change}
        onReviewer1StatusChange={handleReviewer1StatusChange}
        onReviewer2StatusChange={handleReviewer2StatusChange}
        projects={mockProjects}
        users={mockUsers}
        getOverallReviewStatus={getOverallReviewStatus}
      />
    </div>
  );
}tEditingPRD}
      onBack={handleBack}
      onCancel={handleCancel}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmitPRD}
      onFileUpload={handleFileUpload}
      removeAttachment={removeAttachment}
      addTag={addTag}
      removeTag={removeTag}
      fileInputRef={fileInputRef}
    />;
  }

  if (currentView === 'view' && selectedPRD) {
    return <PRDViewer 
      prd={selectedPRD}
      onBack={handleBack}
      onEdit={() => handleEditPRD(selectedPRD)}
      onNavigate={onNavigate}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {context?.returnTo && (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回需求
            </Button>
          )}
          <div>
            <h1>PRD管理</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {currentView === 'drafts' ? '草稿箱' : '已发布'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                共 {sortedPRDs.length} 个{currentView === 'drafts' ? '草稿' : 'PRD'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setCurrentView(currentView === 'drafts' ? 'list' : 'drafts')}>
            <FolderOpen className="h-4 w-4 mr-2" />
            {currentView === 'drafts' ? '返回列表' : '草稿箱'}
            {currentView !== 'drafts' && draftPrds.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {draftPrds.length}
              </Badge>
            )}
          </Button>
          <Button onClick={handleCreatePRD}>
            <Plus className="h-4 w-4 mr-2" />
            新建PRD
          </Button>
        </div>
      </div>

      {/* 筛选和搜索栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索PRD标题或内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择项目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有项目</SelectItem>
            {mockProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCreator} onValueChange={setFilterCreator}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择创建人" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有创建人</SelectItem>
            {mockUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              排序
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange('updatedAt')}>
              <Clock className="h-4 w-4 mr-2" />
              按更新时间
              {sortBy === 'updatedAt' && (
                sortOrder === 'desc' ? <ArrowDown className="h-4 w-4 ml-2" /> : <ArrowUp className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('title')}>
              <FileText className="h-4 w-4 mr-2" />
              按标题
              {sortBy === 'title' && (
                sortOrder === 'desc' ? <ArrowDown className="h-4 w-4 ml-2" /> : <ArrowUp className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('version')}>
              <GitBranch className="h-4 w-4 mr-2" />
              按版本
              {sortBy === 'version' && (
                sortOrder === 'desc' ? <ArrowDown className="h-4 w-4 ml-2" /> : <ArrowUp className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}>
          {viewMode === 'list' ? <LayoutDashboard className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </Button>
      </div>

      {/* PRD列表 */}
      <PRDListTable
        prds={sortedPRDs}
        onViewPRD={handleViewPRD}
        onProjectChange={handleProjectChange}
        onReviewer1Change={handleReviewer1Change}
        onReviewer2Change={handleReviewer2Change}
        onReviewer1StatusChange={handleReviewer1StatusChange}
        onReviewer2StatusChange={handleReviewer2StatusChange}
        hiddenColumns={hiddenColumns}
        mockUsers={mockUsers}
        mockProjects={mockProjects}
      />
    </div>
  );
}