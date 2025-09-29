import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner@2.0.3";
import { 
  Plus, 
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Archive,
  Edit3,
  Trash2,
  Send,
  MoreHorizontal
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

interface PRDItem {
  id: string;
  title: string;
  platform?: string;
  priority?: '低' | '中' | '高' | '紧急';
  status: 'draft' | 'published' | 'reviewing' | 'archived';
  creator: User;
  updatedAt: string;
  createdAt: string;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  isDraft?: boolean;
  requirementId?: string;
}

interface DraftPRD {
  id: string;
  title: string;
  content?: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
  requirementId?: string;
  requirementTitle?: string;
  platform?: string;
  priority?: '低' | '中' | '高' | '紧急';
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
  { id: '6', name: '王小明', avatar: '', role: '一级评审员' },
  { id: '7', name: '李晓红', avatar: '', role: '一级评审员' },
  { id: '8', name: '陈大华', avatar: '', role: '二级评审员' },
  { id: '9', name: '刘建国', avatar: '', role: '二级评审员' },
  { id: '10', name: '张志强', avatar: '', role: '二级评审员' },
  { id: '11', name: '杨丽娜', avatar: '', role: '二级评审员' },
  { id: '12', name: '赵军伟', avatar: '', role: '二级评审员' },
];

// 可选的应用端
const platforms = [
  'Web端', '移动端', '全平台', 'PC端', '小程序'
];

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 模拟草稿数据
const mockDrafts: DraftPRD[] = [
  {
    id: 'draft-1',
    title: '用户权限管理功能PRD',
    content: '## 概述\n\n本PRD旨在设计一个完善的用户权限管理系统...',
    creator: mockUsers[0], // 张三
    createdAt: '2024-12-15 10:30',
    updatedAt: '2024-12-16 14:20',
    requirementId: 'req-001',
    requirementTitle: '用户权限管理需求',
    platform: 'Web端',
    priority: '高'
  },
  {
    id: 'draft-2',
    title: '数据可视化大屏PRD',
    content: '## 背景\n\n为了更好地展示业务数据...',
    creator: mockUsers[0], // 张三
    createdAt: '2024-12-14 16:45',
    updatedAt: '2024-12-15 09:15',
    platform: '全平台',
    priority: '中'
  },
  {
    id: 'draft-3',
    title: '移动端性能优化PRD',
    creator: mockUsers[0], // 张三
    createdAt: '2024-12-13 11:20',
    updatedAt: '2024-12-13 11:20',
    platform: '移动端',
    priority: '高'
  }
];

const mockPRDs: PRDItem[] = [
  {
    id: 'prd-1',
    title: '用户注册流程优化PRD',
    platform: 'Web端',
    priority: '高',
    status: 'published',
    creator: mockUsers[0],
    updatedAt: '2024-01-20 14:30',
    createdAt: '2024-01-15 09:15',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[8],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    requirementId: '1'
  },
  {
    id: 'prd-2',
    title: '支付功能集成PRD',
    platform: '全平台',
    priority: '紧急',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-18 16:45',
    createdAt: '2024-01-10 11:20',
    reviewer1: mockUsers[6],
    reviewer2: mockUsers[9],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    requirementId: '2'
  },
  {
    id: 'prd-3',
    title: '数据导出功能PRD',
    platform: 'PC端',
    priority: '中',
    status: 'reviewing',
    creator: mockUsers[3],
    updatedAt: '2024-01-16 10:22',
    createdAt: '2024-01-12 15:30',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    requirementId: '3'
  },
  {
    id: 'prd-4',
    title: 'K线图实时更新优化PRD',
    platform: 'Web端',
    priority: '高',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-22 09:15',
    createdAt: '2024-01-18 14:20',
    reviewer1: mockUsers[6],
    reviewer2: mockUsers[10],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    requirementId: '4'
  },
  {
    id: 'prd-5',
    title: '系统监控面板PRD',
    platform: 'Web端',
    priority: '中',
    status: 'reviewing',
    creator: mockUsers[4],
    updatedAt: '2024-01-25 11:30',
    createdAt: '2024-01-20 16:45',
    reviewer1: mockUsers[5],
    reviewer1Status: 'rejected'
  }
];

// 评审状态配置
const reviewerStatusLabels = {
  pending: { label: '待评审' },
  approved: { label: '已通过' },
  rejected: { label: '已拒绝' }
};

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: 'PRD标题' },
  { value: 'priority', label: '优先级' },
  { value: 'platform', label: '应用端' },
  { value: 'reviewStatus', label: '总评审状态' },
  { value: 'reviewer1Status', label: '一级评审状态' },
  { value: 'reviewer2Status', label: '二级评审状态' },
  { value: 'creator', label: '创建人' },
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

interface PRDPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function PRDPage({ context, onNavigate }: PRDPageProps = {}) {
  const [prds, setPrds] = useState<PRDItem[]>(mockPRDs);
  const [drafts, setDrafts] = useState<DraftPRD[]>(mockDrafts);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeTab, setActiveTab] = useState('published'); // 'published' 或 'drafts'

  // 处理从草稿编辑页面返回时的草稿更新
  useEffect(() => {
    if (context?.updatedDraft && context?.source === 'draft-edit') {
      const updatedDraft = context.updatedDraft;
      
      // 更新草稿列表
      setDrafts(prevDrafts => {
        const existingIndex = prevDrafts.findIndex(d => d.id === updatedDraft.id);
        if (existingIndex >= 0) {
          // 更新现有草稿
          const newDrafts = [...prevDrafts];
          newDrafts[existingIndex] = updatedDraft;
          return newDrafts;
        } else {
          // 添加新草稿到列表开头
          return [updatedDraft, ...prevDrafts];
        }
      });
      
      // 切换到草稿标签页以显示更新后的草稿
      setActiveTab('drafts');
      
      // 显示保存成功提示
      toast.success('草稿保存成功');
    }
  }, [context]);

  // 根据一级和二级评审状态计算总评审状态
  const getReviewStatus = (prd: PRDItem): string => {
    const { reviewer1Status, reviewer2Status, reviewer1, reviewer2 } = prd;
    
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
  const applyCustomFilters = (prd: PRDItem, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.column || !filter.operator) return true;
      
      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = prd.title;
          break;
        case 'priority':
          fieldValue = prd.priority || '';
          break;
        case 'platform':
          fieldValue = prd.platform || '';
          break;
        case 'reviewStatus':
          fieldValue = getReviewStatus(prd);
          break;
        case 'reviewer1Status':
          fieldValue = prd.reviewer1Status ? reviewerStatusLabels[prd.reviewer1Status].label : '';
          break;
        case 'reviewer2Status':
          fieldValue = prd.reviewer2Status ? reviewerStatusLabels[prd.reviewer2Status].label : '';
          break;
        case 'creator':
          fieldValue = prd.creator.name;
          break;
        case 'createdAt':
          fieldValue = prd.createdAt;
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

  // 处理优先级修改
  const handlePriorityChange = (prdId: string, priority: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { ...p, priority: priority as '低' | '中' | '高' | '紧急', updatedAt }
        : p
    );
    setPrds(updatedPrds);
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

  // 处理一级评审状态修改
  const handleReviewer1StatusChange = (prdId: string, status: 'pending' | 'approved' | 'rejected') => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer1Status: status,
            updatedAt 
          }
        : p
    );
    setPrds(updatedPrds);
    toast.success('一级评审状态已更新');
  };

  // 处理二级评审状态修改
  const handleReviewer2StatusChange = (prdId: string, status: 'pending' | 'approved' | 'rejected') => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer2Status: status,
            updatedAt 
          }
        : p
    );
    setPrds(updatedPrds);
    toast.success('二级评审状态已更新');
  };

  const handleViewPRD = (prd: PRDItem) => {
    if (onNavigate) {
      onNavigate('prd-detail', { 
        prd: prd, 
        mode: 'view',
        source: 'prd-management'
      });
    }
  };

  const handleCreatePRD = () => {
    if (onNavigate) {
      onNavigate('prd-create', { 
        mode: 'create',
        source: 'prd-management',
        requirementId: context?.requirementId,
        returnTo: context?.returnTo,
        returnContext: context?.returnContext
      });
    }
  };

  // 处理从草稿创建PRD
  const handleCreatePRDFromDraft = (draft: any) => {
    // 将草稿转换为正式PRD
    const newPRD: PRDItem = {
      id: `prd-${Date.now()}`,
      title: draft.title,
      platform: draft.platform,
      priority: draft.priority,
      status: 'published',
      creator: draft.creator,
      updatedAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-'),
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-'),
      requirementId: draft.requirementId
    };

    // 添加到PRD列表
    setPrds(prev => [newPRD, ...prev]);
  };

  // 获取当前用户（模拟数据）
  const currentUser = { id: '1', name: '张三', avatar: '', role: '产品经理' };

  // 格式化时间显示
  const formatDateTime = (dateTimeStr: string): string => {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return dateTimeStr.split(' ')[0];
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case '低':
        return 'bg-green-100 text-green-800 border-green-200';
      case '中':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '高':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case '紧急':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 编辑草稿
  const handleEditDraft = (draft: DraftPRD) => {
    if (onNavigate) {
      onNavigate('prd', {
        mode: 'edit-draft',
        draftId: draft.id,
        draft: draft,
        returnTo: 'prd',
        returnContext: { source: 'draft-edit' }
      });
    }
  };

  // 发布草稿
  const handlePublishDraft = (draft: DraftPRD) => {
    // 将草稿转为正式PRD
    handleCreatePRDFromDraft(draft);
    
    // 从草稿箱中移除
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    
    toast.success(`草稿"${draft.title}"已发布为正式PRD`);
  };

  // 删除草稿
  const handleDeleteDraft = (draftId: string) => {
    if (window.confirm('确定要删除这个草稿吗？此操作无法撤销。')) {
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      toast.success('草稿已删除');
    }
  };

  // 创建新草稿
  const handleCreateNewDraft = () => {
    if (onNavigate) {
      onNavigate('prd-create', {
        mode: 'create-draft',
        returnTo: 'prd'
      });
    }
  };

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      if (context.returnTo === 'requirement-detail' && context.returnContext) {
        // 返回到需求详情页面
        onNavigate('requirement-detail', context.returnContext);
      } else {
        // 其他情况
        onNavigate(context.returnTo, context.returnContext);
      }
    }
  };

  // 筛选逻辑
  const filteredPRDs = prds.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomFilters = applyCustomFilters(prd, customFilters);
    
    // 如果从需求详情页面进入，只显示与该需求相关的PRD
    if (context?.requirementId) {
      return matchesSearch && matchesCustomFilters && prd.requirementId === context.requirementId;
    }
    
    return matchesSearch && matchesCustomFilters;
  });

  // 筛选草稿（只显示当前用户的草稿）
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.requirementTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const isCurrentUserDraft = draft.creator.id === currentUser.id;
    
    return matchesSearch && isCurrentUserDraft;
  });

  // 排序逻辑
  const sortedPRDs = React.useMemo(() => {
    if (!sortConfig) return filteredPRDs;
    
    return [...filteredPRDs].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortConfig.column) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'priority':
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'platform':
          aValue = a.platform || '';
          bValue = b.platform || '';
          break;
        case 'reviewStatus':
          aValue = getReviewStatus(a);
          bValue = getReviewStatus(b);
          break;
        case 'creator':
          aValue = a.creator.name;
          bValue = b.creator.name;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPRDs, sortConfig]);

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {context?.returnTo && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {context.returnTo === 'requirement-detail' ? '返回需求详情' : '返回'}
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-medium">PRD管理</h1>
              <p className="text-muted-foreground mt-1">
                {context?.requirementId ? 
                  `关联需求ID: ${context.requirementId} - 产品需求文档管理` : 
                  '产品需求文档管理'
                }
              </p>
            </div>
          </div>
          <Button onClick={handleCreatePRD}>
            <Plus className="h-4 w-4 mr-2" />
            {context?.requirementId ? '为该需求创建PRD' : '新建PRD'}
          </Button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* Tabs导航 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="published" className="flex items-center gap-2">
              已发布PRD
              <Badge variant="secondary" className="text-xs">
                {filteredPRDs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <Archive className="h-3 w-3" />
              我的草稿
              <Badge variant="secondary" className="text-xs">
                {filteredDrafts.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="space-y-6 mt-6">
            {/* 筛选和操作栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* 搜索 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'drafts' ? "搜索草稿..." : "搜索PRD..."}
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
                    <DropdownMenuItem onClick={() => toggleColumnVisibility('priority')}>
                      <Checkbox className="mr-2" checked={!hiddenColumns.includes('priority')} />
                      优先级
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility('platform')}>
                      <Checkbox className="mr-2" checked={!hiddenColumns.includes('platform')} />
                      应用端
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
                    <DropdownMenuItem onClick={() => toggleColumnVisibility('creator')}>
                      <Checkbox className="mr-2" checked={!hiddenColumns.includes('creator')} />
                      创建人
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
                        <Badge variant="secondary" className="ml-1 text-xs">
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
                        <Badge variant="secondary" className="ml-1 text-xs">
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
          </div>
        </CardContent>
      </Card>

      {/* PRD列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {!hiddenColumns.includes('title') && <TableHead>PRD标题</TableHead>}
                  {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                  {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
                  {!hiddenColumns.includes('reviewStatus') && <TableHead>总评审状态</TableHead>}
                  {!hiddenColumns.includes('reviewer1Status') && <TableHead>一级评审</TableHead>}
                  {!hiddenColumns.includes('reviewer2Status') && <TableHead>二级评审</TableHead>}
                  {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPRDs.map((prd) => (
                  <TableRow key={prd.id} className="hover:bg-muted/50">
                    {!hiddenColumns.includes('title') && (
                      <TableCell>
                        <button
                          onClick={() => handleViewPRD(prd)}
                          className="text-left hover:text-blue-600 transition-colors font-medium"
                        >
                          {prd.title}
                        </button>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('priority') && (
                      <TableCell>
                        {prd.priority ? (
                          <Badge className={priorityConfig[prd.priority].className}>
                            {prd.priority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('platform') && (
                      <TableCell>
                        {prd.platform ? (
                          <Badge variant="outline">{prd.platform}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('reviewStatus') && (
                      <TableCell>
                        <Badge className={getReviewStatusStyle(getReviewStatus(prd))}>
                          {getReviewStatus(prd)}
                        </Badge>
                      </TableCell>
                    )}
                    {!hiddenColumns.includes('reviewer1Status') && (
                      <TableCell>
                        {prd.reviewer1 ? (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              {prd.reviewer1.name}
                            </div>
                            <Select
                              value={prd.reviewer1Status || 'pending'}
                              onValueChange={(value: 'pending' | 'approved' | 'rejected') =>
                                handleReviewer1StatusChange(prd.id, value)
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
                      <TableCell>
                        {prd.reviewer2 ? (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              {prd.reviewer2.name}
                            </div>
                            <Select
                              value={prd.reviewer2Status || 'pending'}
                              onValueChange={(value: 'pending' | 'approved' | 'rejected') =>
                                handleReviewer2StatusChange(prd.id, value)
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
                    {!hiddenColumns.includes('creator') && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {prd.creator.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prd.creator.name}</span>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6 mt-6">
            {/* 草稿列表 */}
            <Card>
              <CardContent className="p-4">
                {filteredDrafts.length === 0 ? (
                  <div className="text-center py-12">
                    <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">暂无草稿</h3>
                    <p className="text-muted-foreground mb-4">
                      您还没有创建任何PRD草稿
                    </p>
                    <Button onClick={handleCreateNewDraft}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建草稿
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDrafts.map((draft) => (
                      <Card key={draft.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* 标题行 */}
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm truncate">
                                  {draft.title}
                                </h3>
                                {draft.priority && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityStyle(draft.priority)}`}
                                  >
                                    {draft.priority}
                                  </Badge>
                                )}
                                {draft.platform && (
                                  <Badge variant="secondary" className="text-xs">
                                    {draft.platform}
                                  </Badge>
                                )}
                              </div>

                              {/* 关联需求 */}
                              {draft.requirementTitle && (
                                <div className="text-xs text-muted-foreground">
                                  关联需求: {draft.requirementTitle}
                                </div>
                              )}

                              {/* 时间信息 */}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDateTime(draft.updatedAt)}更新
                                </div>
                                <div>
                                  创建于 {draft.createdAt.split(' ')[0]}
                                </div>
                              </div>
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDraft(draft)}
                                className="h-8 px-2"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                编辑
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handlePublishDraft(draft)}>
                                    <Send className="h-3 w-3 mr-2" />
                                    发布为正式PRD
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDraft(draft.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    删除草稿
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}