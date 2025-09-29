import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Save,
  Send,
  Tag,
  Paperclip,
  Link,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MessageSquare,
  Users,
  ExternalLink,
  Figma,
  Monitor,
  Smartphone,
  Tablet,
  Play,
  Pause,
  RotateCcw,


} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

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

interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  position?: { x: number; y: number };
  resolved?: boolean;
}

interface PRDRef {
  id: string;
  title: string;
  version: string;
}

interface TaskRef {
  id: string;
  title: string;
  status: string;
}

interface PrototypeVersion {
  id: string;
  version: string;
  url: string;
  createdAt: string;
  creator: User;
  comment?: string;
}

interface Prototype {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Axure' | 'Sketch' | 'Adobe XD' | 'Principle' | 'Framer' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  prototypeUrl: string;
  embedUrl?: string;
  creator: User;
  project?: Project;
  relatedPRDs?: PRDRef[];
  relatedTasks?: TaskRef[];
  reviewers?: User[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  versions?: PrototypeVersion[];
  comments?: Comment[];
  isFavorite?: boolean;
  viewCount?: number;
  deviceType?: 'Web' | 'Mobile' | 'Tablet' | 'Desktop';
  requirementId?: string; // 关联的需求ID
  reviewer1?: User; // 一级评审人员
  reviewer2?: User; // 二级评审人员
  reviewer1Status?: 'pending' | 'approved' | 'rejected'; // 一级评审状态
  reviewer2Status?: 'pending' | 'approved' | 'rejected'; // 二级评审状态
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected'; // 整体评审状态
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

const mockPRDs: PRDRef[] = [
  { id: '1', title: '用户中心PRD v2.1', version: 'v2.1' },
  { id: '2', title: '支付系统PRD v1.0', version: 'v1.0' },
  { id: '3', title: '移动端适配PRD', version: 'v1.2' },
];

const mockTasks: TaskRef[] = [
  { id: '1', title: '登录页面重构', status: '进行中' },
  { id: '2', title: '支付接口开发', status: '待开始' },
  { id: '3', title: 'UI设计稿', status: '已完成' },
];

const mockPrototypes: Prototype[] = [
  {
    id: '1',
    title: '用户中心交互原型 v2.0',
    description: '用户中心的完整交互流程设计，包含登录、注册、个人信息管理等功能模块的原型设计。\\n\\n## 设计要点\\n1. 简化用户操作流程\\n2. 优化视觉层次\\n3. 提升用户体验\\n\\n## 包含页面\\n- 登录页\\n- 注册页\\n- 个人中心\\n- 设置页面',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    prototypeUrl: 'https://www.figma.com/proto/abc123',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/abc123',
    creator: mockUsers[2],
    project: mockProjects[0],
    relatedPRDs: [mockPRDs[0]],
    relatedTasks: [mockTasks[0]],
    reviewers: [mockUsers[5], mockUsers[3]],
    createdAt: '2024-12-10',
    updatedAt: '2024-12-16',
    tags: ['交互设计', '用户体验', '移动端'],
    isFavorite: true,
    viewCount: 25,
    deviceType: 'Web',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    comments: [
      {
        id: '1',
        author: mockUsers[5],
        content: '整体交互流程很清晰，建议在登录页增加第三方登录选项',
        createdAt: '2024-12-15',
        resolved: false
      },
      {
        id: '2',
        author: mockUsers[3],
        content: '技术实现上没有问题，可以进入开发阶段',
        createdAt: '2024-12-16',
        resolved: true
      }
    ]
  },
  {
    id: '2',
    title: '支付流程原型设计',
    description: '支付系统的完整流程设计，确保支付安全性和用户体验',
    tool: 'Axure',
    status: '待评审',
    priority: '紧急',
    prototypeUrl: 'https://axure.com/proto/payment-flow',
    creator: mockUsers[7],
    project: mockProjects[1],
    relatedPRDs: [mockPRDs[1]],
    relatedTasks: [mockTasks[1]],
    reviewers: [mockUsers[5], mockUsers[1]],
    createdAt: '2024-12-12',
    updatedAt: '2024-12-15',
    tags: ['支付', '安全', '流程设计'],
    isFavorite: false,
    viewCount: 12,
    deviceType: 'Mobile',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
    comments: []
  },
  {
    id: '3',
    title: '移动端App原型',
    description: '移动端应用的核心功能原型设计',
    tool: 'Figma',
    status: '设计中',
    priority: '中',
    prototypeUrl: 'https://www.figma.com/proto/mobile-app',
    creator: mockUsers[2],
    project: mockProjects[3],
    relatedPRDs: [mockPRDs[2]],
    relatedTasks: [],
    reviewers: [mockUsers[5]],
    createdAt: '2024-12-08',
    updatedAt: '2024-12-14',
    tags: ['移动端', 'App设计', '原生交互'],
    isFavorite: true,
    viewCount: 8,
    deviceType: 'Mobile',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
    comments: [
      {
        id: '3',
        author: mockUsers[5],
        content: '移动端的手势交互设计很棒，符合用户习惯',
        createdAt: '2024-12-14',
        resolved: false
      }
    ]
  },
  {
    id: '4',
    title: '管理后台界面原型',
    description: '后台管理系统的界面设计原型',
    tool: 'Sketch',
    status: '需修改',
    priority: '中',
    prototypeUrl: 'https://sketch.com/admin-dashboard',
    creator: mockUsers[7],
    project: mockProjects[2],
    relatedPRDs: [],
    relatedTasks: [mockTasks[2]],
    reviewers: [mockUsers[3], mockUsers[5]],
    createdAt: '2024-12-05',
    updatedAt: '2024-12-13',
    tags: ['后台管理', '数据可视化'],
    isFavorite: false,
    viewCount: 15,
    deviceType: 'Desktop',
    reviewer1: mockUsers[3],
    reviewer2: mockUsers[5],
    reviewer1Status: 'rejected',
    reviewer2Status: 'pending',
    reviewStatus: 'rejected',
    comments: [
      {
        id: '4',
        author: mockUsers[3],
        content: '表格的交互方式需要优化，建议参考成熟的管理系统',
        createdAt: '2024-12-13',
        resolved: false
      }
    ]
  }
];

const deviceIcons = {
  'Web': Monitor,
  'Mobile': Smartphone,
  'Tablet': Tablet,
  'Desktop': Monitor
};

// 计算总评审状态的函数
const getOverallReviewStatus = (prototype: Prototype) => {
  const hasReviewer1 = !!prototype.reviewer1;
  const hasReviewer2 = !!prototype.reviewer2;
  
  // 如果没有设置任何评审人员，显示"-"
  if (!hasReviewer1 && !hasReviewer2) {
    return { status: 'none', label: '-', variant: 'outline' as const, color: 'text-gray-400' };
  }
  
  const reviewer1Status = prototype.reviewer1Status || 'pending';
  const reviewer2Status = prototype.reviewer2Status || 'pending';
  
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

export function PrototypePage({ context, onNavigate }: { 
  context?: any; 
  onNavigate?: (page: string, context?: any) => void; 
}) {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view'>('list');
  const [prototypes, setPrototypes] = useState<Prototype[]>(mockPrototypes);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCreator, setFilterCreator] = useState('all');

  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 隐藏列设置
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  
  // 编辑状态
  const [editingPrototype, setEditingPrototype] = useState<Partial<Prototype>>({
    title: '',
    description: '',
    tool: 'Figma',
    status: '设计中',
    priority: '中',
    prototypeUrl: '',
    creator: mockUsers[0],
    project: mockProjects[0],
    relatedPRDs: [],
    relatedTasks: [],
    reviewers: [],
    tags: [],
    deviceType: 'Web'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导航上下文
  useEffect(() => {
    if (context) {
      if (context.mode === 'create' && context.requirementId) {
        // 从需求页面跳转过来创建新原型，自动关联需求
        setEditingPrototype(prev => ({
          ...prev,
          title: `需求${context.requirementId}的原型设计`,
          description: `为需求ID: ${context.requirementId} 创建的原型设计`,
          requirementId: context.requirementId
        }));
        setCurrentView('edit');
      } else if (context.mode === 'view' && context.prototypeId) {
        // 查看已有原型
        const prototype = prototypes.find(p => p.id === context.prototypeId);
        if (prototype) {
          setSelectedPrototype(prototype);
          setCurrentView('view');
        }
      }
    }
  }, [context, prototypes]);

  // 筛选和排序逻辑
  const filteredPrototypes = prototypes.filter(prototype => {
    const matchesSearch = prototype.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prototype.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || prototype.project?.id === filterProject;
    const matchesCreator = filterCreator === 'all' || prototype.creator.id === filterCreator;
    
    return matchesSearch && matchesProject && matchesCreator;
  });

  const sortedPrototypes = [...filteredPrototypes].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      case 'priority':
        const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
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

  const handleCreatePrototype = () => {
    setEditingPrototype({
      title: '',
      description: '',
      tool: 'Figma',
      status: '设计中',
      priority: '中',
      prototypeUrl: '',
      creator: mockUsers[0],
      project: mockProjects[0],
      relatedPRDs: [],
      relatedTasks: [],
      reviewers: [],
      tags: []
    });
    setCurrentView('edit');
  };

  const handleEditPrototype = (prototype: Prototype) => {
    setEditingPrototype(prototype);
    setSelectedPrototype(prototype);
    setCurrentView('edit');
  };

  const handleViewPrototype = (prototype: Prototype) => {
    setSelectedPrototype(prototype);
    setCurrentView('view');
  };

  const handleSavePrototype = () => {
    if (editingPrototype.id) {
      // 更新现有原型
      setPrototypes(prototypes.map(p => p.id === editingPrototype.id ? { 
        ...editingPrototype as Prototype, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : p));
    } else {
      // 创建新原型
      const newPrototype: Prototype = {
        ...editingPrototype as Prototype,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        comments: [],
        versions: []
      };
      setPrototypes([newPrototype, ...prototypes]);
    }
    handleBack();
  };

  const handleSubmitPrototype = () => {
    if (editingPrototype.id) {
      setPrototypes(prototypes.map(p => p.id === editingPrototype.id ? { 
        ...editingPrototype as Prototype, 
        status: '待评审',
        updatedAt: new Date().toISOString().split('T')[0] 
      } : p));
    }
    handleBack();
  };

  const addTag = (tag: string) => {
    if (tag && !editingPrototype.tags?.includes(tag)) {
      setEditingPrototype(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEditingPrototype(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedPrototypes.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    } else {
      setCurrentView('list');
    }
  };

  // 处理优先级修改
  const handlePriorityChange = (prototypeId: string, priority: string) => {
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { ...p, priority: priority as '低' | '中' | '高' | '紧急', updatedAt: new Date().toISOString().split('T')[0] }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 处理项目修改
  const handleProjectChange = (prototypeId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const updatedPrototypes = prototypes.map(p => 
        p.id === prototypeId 
          ? { ...p, project, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      );
      setPrototypes(updatedPrototypes);
    }
  };

  if (currentView === 'edit') {
    return <PrototypeEditor 
      prototype={editingPrototype}
      setPrototype={setEditingPrototype}
      onBack={handleBack}
      onSave={handleSavePrototype}
      onSubmit={handleSubmitPrototype}
      addTag={addTag}
      removeTag={removeTag}
    />;
  }

  if (currentView === 'view' && selectedPrototype) {
    return <PrototypeViewer 
      prototype={selectedPrototype}
      onBack={handleBack}
      onEdit={() => handleEditPrototype(selectedPrototype)}
      prototypes={prototypes}
      setPrototypes={setPrototypes}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 返回按钮 - 当从其他页面跳转过来时显示 */}
          {context && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (context?.requirementId && onNavigate) {
                  // 返回需求编辑页面，传递需求ID让需求页面知道要编辑哪个需求
                  onNavigate('requirements', { 
                    mode: 'edit', 
                    requirementId: context.requirementId 
                  });
                } else if (onNavigate) {
                  // 如果没有特定的需求ID，返回需求列表页
                  onNavigate('requirements');
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold">原型设计</h1>
            <p className="text-muted-foreground mt-1">原型和设计管理</p>
          </div>
        </div>
        <Button onClick={handleCreatePrototype}>
          <Plus className="h-4 w-4 mr-2" />
          新建原型
        </Button>
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
                  placeholder="搜索原型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 筛选器 */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选器
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                    <div>
                      <label className="text-xs font-medium mb-1 block">所属项目</label>
                      <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部项目</SelectItem>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">创建人</label>
                      <Select value={filterCreator} onValueChange={setFilterCreator}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部创建人</SelectItem>
                          {mockUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 排序 */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  排序
                  {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSortChange('title')}>
                    原型名称 {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
                    创建时间 {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('updatedAt')}>
                    更新时间 {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('priority')}>
                    优先级 {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 列设置 */}
              <Button variant="outline" size="sm" onClick={() => setShowColumnDialog(true)}>
                <EyeOff className="h-4 w-4 mr-2" />
                列设置
              </Button>
            </div>

            {/* 批量操作 */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">已选择 {selectedItems.length} 项</span>
                <Button variant="outline" size="sm">批量分享</Button>
                <Button variant="outline" size="sm">批量归档</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 原型列表 */}
      <Card>
        <CardContent className="p-0">
          {sortedPrototypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Monitor className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无原型</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                还没有创建任何原型。点击"新建原型"按钮开始创建您的第一个原型。
              </p>
              <Button onClick={handleCreatePrototype}>
                <Plus className="h-4 w-4 mr-2" />
                新建原型
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!hiddenColumns.includes('title') && <TableHead>原型名称</TableHead>}
                    {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                    {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                    {!hiddenColumns.includes('project') && <TableHead>项目</TableHead>}
                    {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
                    {!hiddenColumns.includes('reviewer1') && <TableHead>一级评审</TableHead>}
                    {!hiddenColumns.includes('reviewer2') && <TableHead>二级评审</TableHead>}
                    {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPrototypes.map((prototype) => (
                    <TableRow key={prototype.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewPrototype(prototype)}>
                      {!hiddenColumns.includes('title') && (
                        <TableCell>
                          <div>
                            <div className="font-medium text-primary hover:underline">{prototype.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {prototype.description}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge 
                                variant={
                                  prototype.priority === '紧急' ? 'destructive' :
                                  prototype.priority === '高' ? 'default' :
                                  prototype.priority === '中' ? 'secondary' : 'outline'
                                }
                                className="cursor-pointer hover:bg-muted text-xs"
                              >
                                {prototype.priority}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {['低', '中', '高', '紧急'].map((priority) => (
                                <DropdownMenuItem 
                                  key={priority} 
                                  onClick={() => handlePriorityChange(prototype.id, priority)}
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
                              <AvatarImage src={prototype.creator.avatar} />
                              <AvatarFallback>{prototype.creator.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{prototype.creator.name}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('project') && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs" style={{ borderColor: prototype.project?.color }}>
                                {prototype.project?.name || '未分配'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {mockProjects.map((project) => (
                                <DropdownMenuItem 
                                  key={project.id} 
                                  onClick={() => handleProjectChange(prototype.id, project.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: project.color }}></div>
                                    {project.name}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('reviewStatus') && (
                        <TableCell>
                          {(() => {
                            const status = getOverallReviewStatus(prototype);
                            return (
                              <Badge variant={status.variant} className={status.color}>
                                {status.label}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('reviewer1') && (
                        <TableCell>
                          {prototype.reviewer1 ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={prototype.reviewer1.avatar} />
                                <AvatarFallback>{prototype.reviewer1.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{prototype.reviewer1.name}</span>
                              <Badge 
                                variant={
                                  prototype.reviewer1Status === 'approved' ? 'default' :
                                  prototype.reviewer1Status === 'rejected' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {prototype.reviewer1Status === 'approved' ? '通过' :
                                 prototype.reviewer1Status === 'rejected' ? '拒绝' : '待审'}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">未设置</span>
                          )}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('reviewer2') && (
                        <TableCell>
                          {prototype.reviewer2 ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={prototype.reviewer2.avatar} />
                                <AvatarFallback>{prototype.reviewer2.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{prototype.reviewer2.name}</span>
                              <Badge 
                                variant={
                                  prototype.reviewer2Status === 'approved' ? 'default' :
                                  prototype.reviewer2Status === 'rejected' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {prototype.reviewer2Status === 'approved' ? '通过' :
                                 prototype.reviewer2Status === 'rejected' ? '拒绝' : '待审'}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">未设置</span>
                          )}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('updatedAt') && (
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{prototype.updatedAt}</span>
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
  );
}

// Placeholder components for editing and viewing
function PrototypeEditor({ prototype, setPrototype, onBack, onSave, onSubmit, addTag, removeTag }: any) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <h1 className="text-2xl font-semibold">编辑原型</h1>
      </div>
      <div className="max-w-4xl space-y-6">
        <div>
          <Label htmlFor="title">原型标题</Label>
          <Input
            id="title"
            value={prototype.title || ''}
            onChange={(e) => setPrototype(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={prototype.description || ''}
            onChange={(e) => setPrototype(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1"
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="url">原型链接</Label>
          <Input
            id="url"
            value={prototype.prototypeUrl || ''}
            onChange={(e) => setPrototype(prev => ({ ...prev, prototypeUrl: e.target.value }))}
            className="mt-1"
            placeholder="https://..."
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={onSave} variant="outline">
            保存草稿
          </Button>
          <Button onClick={onSubmit}>
            提交评审
          </Button>
        </div>
      </div>
    </div>
  );
}

function PrototypeViewer({ prototype, onBack, onEdit }: any) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{prototype.title}</h1>
          <p className="text-muted-foreground mt-1">{prototype.description}</p>
        </div>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          编辑
        </Button>
      </div>
      <div className="bg-muted rounded-lg p-8 text-center">
        <Monitor className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">原型预览区域</p>
        {prototype.prototypeUrl && (
          <a 
            href={prototype.prototypeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline mt-2 inline-block"
          >
            查看原型链接
          </a>
        )}
      </div>
    </div>
  );
}