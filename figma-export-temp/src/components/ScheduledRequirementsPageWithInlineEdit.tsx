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
  GitBranch
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

// 可选的评审状态
const reviewStatuses = [
  { value: 'pending', label: '待评审' },
  { value: 'approved', label: '评审通过' },
  { value: 'rejected', label: '评审不通过' }
];

// 可选的项目
const projects = mockProjects;

// 预排期需求数据 - 包含来自需求池的需求以及专门在预排期管理中创建的需求
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
    type: '功能需求',
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
    id: 'scheduled-1',
    title: '交易风控系统优化',
    type: '安全需求',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[4],
    project: mockProjects[4],
    description: '完善交易风控系统，增加异常交易检测算法，提升系统安全性和风险防控能力。',
    tags: ['风控', '安全', '算法'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-24',
    platform: '全平台',
    plannedVersion: 'v2.5.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[0],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[3],
    attachments: [
      { id: '3', name: '风控需求文档.docx', size: 3072, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '/files/risk-control.docx' }
    ]
  }
];

interface ScheduledRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
  context?: any;
}

export function ScheduledRequirementsPageWithInlineEdit({ onNavigate, context }: ScheduledRequirementsPageProps) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockScheduledRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [sortBy, setSortBy] = useState('plannedVersion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // 排序逻辑
  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'plannedVersion':
        const versionToNumber = (version: string) => {
          const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
          }
          return 0;
        };
        aValue = versionToNumber(a.plannedVersion || '');
        bValue = versionToNumber(b.plannedVersion || '');
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        aValue = a.plannedVersion;
        bValue = b.plannedVersion;
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
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">预排期需求管理</h1>
          <p className="text-muted-foreground mt-1">
            管理已分配版本的需求，包括评审状态跟踪和开发排期安排
          </p>
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

      {/* 需求列表 */}
      <Card>
        <CardContent className="p-0">
          {sortedRequirements.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无预排期需求</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                还没有任何预排期需求。请先在需求池中评审通过需求并分配版本。
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>创建人</TableHead>
                  <TableHead>项目</TableHead>
                  <TableHead>评审状态</TableHead>
                  <TableHead>一级审核</TableHead>
                  <TableHead>二级审核</TableHead>
                  <TableHead>预排期版本</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((requirement) => (
                  <TableRow key={requirement.id} className="hover:bg-muted/50">
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
                      <Select
                        value={requirement.type}
                        onValueChange={(value) => handleTypeChange(requirement.id, value)}
                      >
                        <SelectTrigger className="h-8 w-28 border-none shadow-none">
                          <Badge variant="outline">
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

                    {/* 优先级 - 可编辑 */}
                    <TableCell>
                      <Select
                        value={requirement.priority}
                        onValueChange={(value) => handlePriorityChange(requirement.id, value)}
                      >
                        <SelectTrigger className="h-8 w-20 border-none shadow-none">
                          <Badge 
                            variant={
                              requirement.priority === '紧急' ? 'destructive' :
                              requirement.priority === '高' ? 'default' :
                              requirement.priority === '中' ? 'secondary' : 'outline'
                            }
                          >
                            {requirement.priority}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              <Badge 
                                variant={
                                  priority === '紧急' ? 'destructive' :
                                  priority === '高' ? 'default' :
                                  priority === '中' ? 'secondary' : 'outline'
                                }
                              >
                                {priority}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        value={requirement.project.id}
                        onValueChange={(value) => handleProjectChange(requirement.id, value)}
                      >
                        <SelectTrigger className="h-8 w-20 border-none shadow-none">
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: requirement.project.color + '20', color: requirement.project.color }}
                          >
                            {requirement.project.name}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: project.color + '20', color: project.color }}
                              >
                                {project.name}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* 评审状态 */}
                    <TableCell onClick={() => handleRequirementClick(requirement)} className="cursor-pointer">
                      <Badge 
                        variant={
                          requirement.reviewStatus === 'approved' ? 'default' : 
                          requirement.reviewStatus === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {requirement.reviewStatus === 'approved' ? '评审通过' : 
                         requirement.reviewStatus === 'rejected' ? '评审不通过' : 
                         requirement.reviewStatus === 'second_review' ? '二级评审中' :
                         requirement.reviewStatus === 'first_review' ? '一级评审中' :
                         '待评审'}
                      </Badge>
                    </TableCell>

                    {/* 一级审核 - 可编辑状态 */}
                    <TableCell>
                      {requirement.reviewer1 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={requirement.reviewer1.avatar} />
                              <AvatarFallback>
                                {requirement.reviewer1.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{requirement.reviewer1.name}</span>
                          </div>
                          <Select
                            value={requirement.reviewer1Status || 'pending'}
                            onValueChange={(value) => handleReviewer1StatusChange(requirement.id, value)}
                          >
                            <SelectTrigger className="h-6 w-20 text-xs border-none shadow-none">
                              <Badge 
                                variant={
                                  requirement.reviewer1Status === 'approved' ? 'default' : 
                                  requirement.reviewer1Status === 'rejected' ? 'destructive' : 
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {requirement.reviewer1Status === 'approved' ? '通过' : 
                                 requirement.reviewer1Status === 'rejected' ? '不通过' : 
                                 '待审'}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {reviewStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">未设置</span>
                      )}
                    </TableCell>

                    {/* 二级审核 - 可编辑状态 */}
                    <TableCell>
                      {requirement.reviewer2 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={requirement.reviewer2.avatar} />
                              <AvatarFallback>
                                {requirement.reviewer2.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{requirement.reviewer2.name}</span>
                          </div>
                          <Select
                            value={requirement.reviewer2Status || 'pending'}
                            onValueChange={(value) => handleReviewer2StatusChange(requirement.id, value)}
                          >
                            <SelectTrigger className="h-6 w-20 text-xs border-none shadow-none">
                              <Badge 
                                variant={
                                  requirement.reviewer2Status === 'approved' ? 'default' : 
                                  requirement.reviewer2Status === 'rejected' ? 'destructive' : 
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {requirement.reviewer2Status === 'approved' ? '通过' : 
                                 requirement.reviewer2Status === 'rejected' ? '不通过' : 
                                 '待审'}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {reviewStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">无需审核</span>
                      )}
                    </TableCell>

                    {/* 预排期版本 - 可编辑 */}
                    <TableCell>
                      <Select
                        value={requirement.plannedVersion || ''}
                        onValueChange={(version) => handleVersionSelect(requirement.id, version)}
                      >
                        <SelectTrigger className="h-8 w-24 border-none shadow-none">
                          <Badge variant="secondary">
                            {requirement.plannedVersion}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {availableVersions.map((version) => (
                            <SelectItem key={version} value={version}>
                              {version}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* 更新时间 */}
                    <TableCell className="text-sm text-muted-foreground" onClick={() => handleRequirementClick(requirement)}>
                      {requirement.updatedAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}