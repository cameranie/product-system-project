import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Palette,
  Image,
  FileImage,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { DesignCreateForm } from './DesignCreateForm';

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

interface Design {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Sketch' | 'Adobe XD' | 'Photoshop' | 'Illustrator' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  designUrl: string;
  embedUrl?: string;
  creator: User;
  project?: Project;
  platform?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
  viewCount?: number;
  designType?: 'UI设计' | '视觉设计' | '图标设计' | '插画设计';
  requirementId?: string;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
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

const mockDesigns: Design[] = [
  {
    id: '1',
    title: '用户中心界面设计 v2.0',
    description: '用户中心页面的完整视觉设计，包含个人信息、设置页面等界面设计。',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    designUrl: 'https://www.figma.com/design/user-center-ui',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/design/user-center-ui',
    creator: mockUsers[2],
    project: mockProjects[0],
    platform: 'Web端',
    createdAt: '2024-12-10 09:30',
    updatedAt: '2024-12-16 15:45',
    tags: ['UI设计', '用户界面', '视觉设计'],
    isFavorite: true,
    viewCount: 32,
    designType: 'UI设计',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
  },
  {
    id: 'design-2',
    title: '支付功能集成 - UI设计稿',
    description: '基于需求"支付功能集成"的UI设计稿，包含支付宝、微信支付、银行卡支付等多种支付方式的界面设计',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    designUrl: 'https://www.figma.com/design/payment-integration-ui',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/design/payment-integration-ui',
    creator: mockUsers[2],
    project: mockProjects[4], // 交易项目
    platform: '全平台',
    createdAt: '2024-01-11 14:20',
    updatedAt: '2024-01-19 16:30',
    tags: ['支付', '界面设计', 'UI', '全平台'],
    isFavorite: true,
    viewCount: 28,
    designType: 'UI设计',
    requirementId: '2', // 关联支付功能集成需求
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
  },
  {
    id: '3',
    title: 'K线图图标设计',
    description: 'K线图功能相关的图标设计',
    tool: 'Adobe XD',
    status: '设计中',
    priority: '中',
    designUrl: 'https://xd.adobe.com/design/kline-icons',
    creator: mockUsers[2],
    project: mockProjects[0],
    platform: 'Web端',
    createdAt: '2024-12-08 16:45',
    updatedAt: '2024-12-14 10:15',
    tags: ['图标', 'K线', '视觉设计'],
    isFavorite: true,
    viewCount: 15,
    designType: '图标设计',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
  },
  {
    id: '4',
    title: '聊天室表情包设计',
    description: '聊天室专用表情包插画设计',
    tool: 'Illustrator',
    status: '评审中',
    priority: '低',
    designUrl: 'https://illustrator.adobe.com/design/emoji-pack',
    creator: mockUsers[3],
    project: mockProjects[2],
    platform: '移动端',
    createdAt: '2024-12-05 11:20',
    updatedAt: '2024-12-13 14:35',
    tags: ['插画', '表情包', '聊天室'],
    isFavorite: false,
    viewCount: 22,
    designType: '插画设计',
    reviewer1: mockUsers[6],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
  }
];

const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

const reviewerStatusLabels = {
  pending: { label: '待评审', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  approved: { label: '已通过', variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  rejected: { label: '已拒绝', variant: 'secondary' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: '设计名称' },
  { value: 'priority', label: '优先级' },
  { value: 'creator', label: '创建人' },
  { value: 'project', label: '项目' },
  { value: 'platform', label: '应用端' },
  { value: 'status', label: '状态' },
  { value: 'designType', label: '设计类型' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' }
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

export function DesignManagementPage({ context, onNavigate }: { 
  context?: any; 
  onNavigate?: (page: string, context?: any) => void; 
}) {
  const [designs, setDesigns] = useState<Design[]>(mockDesigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  // 处理创建模式
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDesign, setNewDesign] = useState<Partial<Design>>({
    title: '',
    description: '',
    tool: 'Figma',
    status: '设计中',
    priority: '中',
    designUrl: '',
    creator: mockUsers[0],
    project: mockProjects[0],
    platform: 'Web端',
    tags: [],
    designType: 'UI设计',
    requirementId: undefined
  });

  // 如果是创建模式，初始化新设计数据
  React.useEffect(() => {
    if (context?.mode === 'create') {
      setShowCreateForm(true);
      setNewDesign(prev => ({
        ...prev,
        title: context.requirementTitle ? `${context.requirementTitle} - UI设计稿` : '',
        description: context.requirementTitle ? `基于需求"${context.requirementTitle}"的UI设计稿` : '',
        requirementId: context.requirementId
      }));
    } else if (context?.mode === 'view' && context?.designId) {
      // 查看模式，找到对应的设计并显示详情（这里可以跳转到设计详情页）
      const design = mockDesigns.find(d => d.id === context.designId);
      if (design) {
        handleViewDesign(design);
      }
    }
  }, [context]);

  const handleBack = () => {
    if (showCreateForm) {
      // 如果在创建表单中，先关闭表单
      setShowCreateForm(false);
      if (context?.returnTo && context?.returnContext && onNavigate) {
        onNavigate(context.returnTo, context.returnContext);
      }
    } else if (context?.returnTo && context?.returnContext && onNavigate) {
      onNavigate(context.returnTo, context.returnContext);
    } else if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    }
  };

  const handleSaveNewDesign = (designData: Partial<Design>) => {
    if (!designData.title || !designData.designUrl) {
      alert('请填写设计名称和设计链接');
      return;
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const createdDesign: Design = {
      id: `design-${Date.now()}`,
      title: designData.title!,
      description: designData.description,
      tool: designData.tool as Design['tool'],
      status: designData.status as Design['status'],
      priority: designData.priority as Design['priority'],
      designUrl: designData.designUrl!,
      creator: designData.creator!,
      project: designData.project,
      platform: designData.platform,
      createdAt: timestamp,
      updatedAt: timestamp,
      tags: designData.tags || [],
      designType: designData.designType as Design['designType'],
      requirementId: designData.requirementId,
      viewCount: 0,
      isFavorite: false
    };

    setDesigns([createdDesign, ...designs]);
    setShowCreateForm(false);
    
    // 返回到指定页面
    if (context?.returnTo && context?.returnContext && onNavigate) {
      onNavigate(context.returnTo, context.returnContext);
    }
    
    console.log('创建新设计:', createdDesign);
  };

  const handleViewDesign = (design: Design) => {
    if (onNavigate) {
      onNavigate('design-detail', { designId: design.id });
    } else {
      console.log('View design:', design);
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
  const applyCustomFilters = (design: Design, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.column || !filter.operator) return true;
      
      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = design.title;
          break;
        case 'priority':
          fieldValue = design.priority;
          break;
        case 'creator':
          fieldValue = design.creator.name;
          break;
        case 'project':
          fieldValue = design.project?.name || '';
          break;
        case 'platform':
          fieldValue = design.platform || '';
          break;
        case 'status':
          fieldValue = design.status;
          break;
        case 'designType':
          fieldValue = design.designType || '';
          break;
        case 'createdAt':
          fieldValue = design.createdAt;
          break;
        case 'updatedAt':
          fieldValue = design.updatedAt;
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
  const handlePriorityChange = (designId: string, priority: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDesigns = designs.map(d => 
      d.id === designId 
        ? { ...d, priority: priority as '低' | '中' | '高' | '紧急', updatedAt }
        : d
    );
    setDesigns(updatedDesigns);
  };

  // 处理项目修改
  const handleProjectChange = (designId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const now = new Date();
      const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const updatedDesigns = designs.map(d => 
        d.id === designId 
          ? { ...d, project, updatedAt }
          : d
      );
      setDesigns(updatedDesigns);
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (designId: string, platform: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDesigns = designs.map(d => 
      d.id === designId 
        ? { ...d, platform, updatedAt }
        : d
    );
    setDesigns(updatedDesigns);
  };

  // 处理一级评审人员修改
  const handleReviewer1Change = (designId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDesigns = designs.map(d => 
      d.id === designId 
        ? { 
            ...d, 
            reviewer1: user || undefined,
            reviewer1Status: user ? 'pending' as const : undefined,
            updatedAt 
          }
        : d
    );
    setDesigns(updatedDesigns);
  };

  // 处理二级评审人员修改
  const handleReviewer2Change = (designId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDesigns = designs.map(d => 
      d.id === designId 
        ? { 
            ...d, 
            reviewer2: user || undefined,
            reviewer2Status: user ? 'pending' as const : undefined,
            updatedAt 
          }
        : d
    );
    setDesigns(updatedDesigns);
  };

  // 处理一级评审状态修改
  const handleReviewer1StatusChange = (designId: string, status: 'pending' | 'approved' | 'rejected') => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDesigns = designs.map(d => 
      d.id === designId 
        ? { 
            ...d, 
            reviewer1Status: status,
            updatedAt 
          }
        : d
    );
    setDesigns(updatedDesigns);
  };

  // 处理二级评审状态修改
  const handleReviewer2StatusChange = (designId: string, status: 'pending' | 'approved' | 'rejected') => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDesigns = designs.map(d => 
      d.id === designId 
        ? { 
            ...d, 
            reviewer2Status: status,
            updatedAt 
          }
        : d
    );
    setDesigns(updatedDesigns);
  };

  // 筛选逻辑
  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomFilters = applyCustomFilters(design, customFilters);
    
    return matchesSearch && matchesCustomFilters;
  });

  // 排序逻辑
  const sortedDesigns = React.useMemo(() => {
    if (!sortConfig) return filteredDesigns;
    
    return [...filteredDesigns].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortConfig.column) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'priority':
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'creator':
          aValue = a.creator.name;
          bValue = b.creator.name;
          break;
        case 'project':
          aValue = a.project?.name || '';
          bValue = b.project?.name || '';
          break;
        case 'platform':
          aValue = a.platform || '';
          bValue = b.platform || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'designType':
          aValue = a.designType || '';
          bValue = b.designType || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDesigns, sortConfig]);

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 返回按钮 */}
            {context && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-medium">设计图管理</h1>
              <p className="text-muted-foreground mt-1">管理视觉设计稿和评审流程</p>
            </div>
          </div>
          <Button onClick={() => onNavigate?.('design-edit', { isCreate: true })}>
            <Plus className="h-4 w-4 mr-2" />
            新建设计
          </Button>
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
                    placeholder="搜索设计..."
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
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('creator')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('creator')} />
                        创建人
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('project')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('project')} />
                        项目
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('platform')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('platform')} />
                        应用端
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('designType')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('designType')} />
                        设计类型
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewStatus')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewStatus')} />
                        评审状态
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer1')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer1')} />
                        一级评审
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('reviewer2')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('reviewer2')} />
                        二级评审
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleColumnVisibility('updatedAt')}>
                        <Checkbox className="mr-2" checked={!hiddenColumns.includes('updatedAt')} />
                        更新时间
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

        {/* 设计列表 */}
        <Card>
          <CardContent className="p-0">
            {sortedDesigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">暂无设计</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  还没有创建任何设计。点击"新建设计"按钮开始创建您的第一个设计。
                </p>
                <Button onClick={() => onNavigate?.('design-edit', { isCreate: true })}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建设计
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      {!hiddenColumns.includes('title') && <TableHead>设计名称</TableHead>}
                      {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                      {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                      {!hiddenColumns.includes('project') && <TableHead>项目</TableHead>}
                      {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
                      {!hiddenColumns.includes('designType') && <TableHead>设计类型</TableHead>}
                      {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
                      {!hiddenColumns.includes('reviewer1') && <TableHead>一级评审</TableHead>}
                      {!hiddenColumns.includes('reviewer2') && <TableHead>二级评审</TableHead>}
                      {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDesigns.map((design) => (
                      <TableRow key={design.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDesign(design)}>
                        {!hiddenColumns.includes('title') && (
                          <TableCell>
                            <div>
                              <div className="font-medium text-primary hover:underline">{design.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {design.description}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('priority') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant={priorityConfig[design.priority].variant}
                                  className={`cursor-pointer ${priorityConfig[design.priority].className}`}
                                >
                                  {design.priority}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {Object.keys(priorityConfig).map((priority) => (
                                  <DropdownMenuItem
                                    key={priority}
                                    onClick={() => handlePriorityChange(design.id, priority)}
                                  >
                                    {priority}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('creator') && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={design.creator.avatar} />
                                <AvatarFallback className="text-xs">
                                  {design.creator.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{design.creator.name}</span>
                            </div>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('project') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                  {design.project?.name || '未指定'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {mockProjects.map((project) => (
                                  <DropdownMenuItem
                                    key={project.id}
                                    onClick={() => handleProjectChange(design.id, project.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: project.color }}
                                      />
                                      {project.name}
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('platform') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                  {design.platform || '未指定'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {platforms.map((platform) => (
                                  <DropdownMenuItem
                                    key={platform}
                                    onClick={() => handlePlatformChange(design.id, platform)}
                                  >
                                    {platform}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}

                        {!hiddenColumns.includes('designType') && (
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {design.designType || '未指定'}
                            </Badge>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('reviewStatus') && (
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{design.status}</Badge>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('reviewer1') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-1">
                              {/* 一级评审人员 */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                    {design.reviewer1 ? design.reviewer1.name : '未指定'}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleReviewer1Change(design.id, null)}>
                                    未指定
                                  </DropdownMenuItem>
                                  {mockUsers.map((user) => (
                                    <DropdownMenuItem
                                      key={user.id}
                                      onClick={() => handleReviewer1Change(design.id, user.id)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={user.avatar} />
                                          <AvatarFallback className="text-xs">
                                            {user.name.slice(0, 1)}
                                          </AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              {/* 一级评审状态 */}
                              {design.reviewer1 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant={reviewerStatusLabels[design.reviewer1Status || 'pending'].variant}
                                      className={`cursor-pointer text-xs ${reviewerStatusLabels[design.reviewer1Status || 'pending'].className}`}
                                    >
                                      {reviewerStatusLabels[design.reviewer1Status || 'pending'].label}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewer1StatusChange(design.id, 'pending')}
                                    >
                                      <Clock className="h-3 w-3 mr-2" />
                                      待评审
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewer1StatusChange(design.id, 'approved')}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      已通过
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewer1StatusChange(design.id, 'rejected')}
                                    >
                                      <XCircle className="h-3 w-3 mr-2" />
                                      已拒绝
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('reviewer2') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-1">
                              {/* 二级评审人员 */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                    {design.reviewer2 ? design.reviewer2.name : '未指定'}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleReviewer2Change(design.id, null)}>
                                    未指定
                                  </DropdownMenuItem>
                                  {mockUsers.map((user) => (
                                    <DropdownMenuItem
                                      key={user.id}
                                      onClick={() => handleReviewer2Change(design.id, user.id)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={user.avatar} />
                                          <AvatarFallback className="text-xs">
                                            {user.name.slice(0, 1)}
                                          </AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              {/* 二级评审状态 */}
                              {design.reviewer2 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant={reviewerStatusLabels[design.reviewer2Status || 'pending'].variant}
                                      className={`cursor-pointer text-xs ${reviewerStatusLabels[design.reviewer2Status || 'pending'].className}`}
                                    >
                                      {reviewerStatusLabels[design.reviewer2Status || 'pending'].label}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewer2StatusChange(design.id, 'pending')}
                                    >
                                      <Clock className="h-3 w-3 mr-2" />
                                      待评审
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewer2StatusChange(design.id, 'approved')}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      已通过
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewer2StatusChange(design.id, 'rejected')}
                                    >
                                      <XCircle className="h-3 w-3 mr-2" />
                                      已拒绝
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        )}
                        
                        {!hiddenColumns.includes('updatedAt') && (
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {design.updatedAt}
                            </span>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}