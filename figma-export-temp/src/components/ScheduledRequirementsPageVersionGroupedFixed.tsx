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
  AlertTriangle,
  XCircle,
  Clock,
  Edit,
  X,
  EyeOff,
  MoreHorizontal,
  GitBranch,
  ChevronRight,
  ChevronDown
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
  type: '功能需求' | '技术需求' | 'Bug' | '产品建议' | '安全需求';
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

// 可选的项目
const projects = mockProjects;

// 可选的应用端
const platforms = [
  'Web端', '移动端', '全平台', 'PC端', '小程序'
];

// 预排期需求数据
const mockScheduledRequirements: Requirement[] = [
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
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-20 16:45',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[0]
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
    createdAt: '2024-01-10 09:15',
    updatedAt: '2024-01-18 11:20',
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
    title: 'K线图实时更新优化',
    type: '功能需求',
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

export function ScheduledRequirementsPageVersionGrouped({ onNavigate, context }: ScheduledRequirementsPageProps) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockScheduledRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    // 默认展开所有版本
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockScheduledRequirements.map(r => r.plannedVersion || '未分配版本'))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });
  const [showMessage, setShowMessage] = useState(false);
  const [highlightRequirementId, setHighlightRequirementId] = useState<string>('');

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

  // 筛选逻辑
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesProject = filterProject === 'all' || req.project.id === filterProject;
    const matchesVersion = filterVersion === 'all' || req.plannedVersion === filterVersion;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesProject && matchesVersion;
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

  // 版本排序 - 未分配版本在前，然后按版本号倒序
  const sortedVersions = Object.keys(groupedByVersion).sort((a, b) => {
    // 未分配版本组永远在最前面
    if (a === '未分配版本') return -1;
    if (b === '未分配版本') return 1;
    
    // 其他版本按版本号倒序排列
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

  // 默认展开所有版本
  React.useEffect(() => {
    const initialExpanded = sortedVersions.reduce((acc, version) => {
      acc[version] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedVersions(initialExpanded);
  }, [sortedVersions.join(',')]);

  // 处理导航上下文中的消息提示
  React.useEffect(() => {
    if (context?.message) {
      setShowMessage(true);
      // 3秒后自动隐藏消息
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      
      if (context?.highlightRequirementId) {
        setHighlightRequirementId(context.highlightRequirementId);
        // 5秒后移除高亮
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

                {/* 快速筛选 */}
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="需求类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有类型</SelectItem>
                      {requirementTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="优先级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有优先级</SelectItem>
                      {priorities.map(priority => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="项目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有项目</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterVersion} onValueChange={setFilterVersion}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="版本" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有版本</SelectItem>
                      {availableVersions.map(version => (
                        <SelectItem key={version} value={version}>{version}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                    <TableHead>标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>创建人</TableHead>
                    <TableHead>项目</TableHead>
                    <TableHead>应用端</TableHead>
                    <TableHead>预排期版本</TableHead>
                    <TableHead>一级评审</TableHead>
                    <TableHead>二级评审</TableHead>
                    <TableHead>评审状态</TableHead>
                    <TableHead>更新时间</TableHead>
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
                          <TableCell colSpan={11} className="py-3">
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

                            {/* 优先级 - 可编辑 */}
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

                            {/* 创建人 */}
                            <TableCell onClick={() => handleRequirementClick(requirement)} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={requirement.creator.avatar} />
                                  <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{requirement.creator.name}</span>
                              </div>
                            </TableCell>

                            {/* 项目 - 可编辑 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                    {requirement.project.name}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {projects.map((project) => (
                                    <DropdownMenuItem 
                                      key={project.id} 
                                      onClick={() => handleProjectChange(requirement.id, project.id)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }}></div>
                                        {project.name}
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>

                            {/* 应用端 - 可编辑 */}
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

                            {/* 预排期版本 - 可编辑 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                    {requirement.plannedVersion || '未分配'}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => handleVersionSelect(requirement.id, 'unassigned')}>
                                    未分配
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

                            {/* 更新时间 */}
                            <TableCell onClick={() => handleRequirementClick(requirement)} className="cursor-pointer">
                              <span className="text-sm text-muted-foreground">{requirement.updatedAt}</span>
                            </TableCell>
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