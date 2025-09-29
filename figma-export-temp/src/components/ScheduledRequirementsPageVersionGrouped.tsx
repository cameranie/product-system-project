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

// 可选的评审状态
const reviewStatuses = [
  { value: 'pending', label: '待评审' },
  { value: 'approved', label: '评审通过' },
  { value: 'rejected', label: '评审不通过' }
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
    title: '数据导出功能',
    type: '产品建议',
    status: '待评审',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '支持用户导出各种格式的数据报表，包括Excel、PDF、CSV等格式。',
    tags: ['导出', '数据分析'],
    createdAt: '2024-01-12 13:25',
    updatedAt: '2024-01-16 15:10',
    platform: 'Web端',
    plannedVersion: 'v2.2.0',
    isOpen: false,
    reviewer1: mockUsers[0],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
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
    createdAt: '2024-01-08 16:50',
    updatedAt: '2024-01-14 10:30',
    platform: '移动端',
    plannedVersion: 'v1.8.0',
    isOpen: false,
    reviewer1: mockUsers[2],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
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
    createdAt: '2024-01-22 08:45',
    updatedAt: '2024-01-26 12:15',
    platform: '全平台',
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
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
    createdAt: '2024-01-18 16:20',
    updatedAt: '2024-01-24 14:55',
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
  },
  {
    id: '7',
    title: '用户界面主题切换',
    type: '功能需求',
    status: '已完成',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[0],
    description: '增加深色模式和浅色模式切换功能，提升用户体验。',
    tags: ['UI', '主题', '用户体验'],
    createdAt: '2024-01-05 11:40',
    updatedAt: '2024-01-12 09:25',
    platform: 'Web端',
    plannedVersion: 'v2.0.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[2]
  },
  {
    id: '8',
    title: '搜索功能优化',
    type: '功能需求',
    status: '设计中',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '优化全局搜索功能，支持模糊搜索和高级筛选。',
    tags: ['搜索', '优化'],
    createdAt: '2024-01-07 15:20',
    updatedAt: '2024-01-15 13:45',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4]
  }
];

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

  // 检查需求是否通过评审
  const isApproved = (requirement: Requirement) => {
    const hasReviewer1 = !!requirement.reviewer1;
    const hasReviewer2 = !!requirement.reviewer2;
    const reviewer1Status = requirement.reviewer1Status || 'pending';
    const reviewer2Status = requirement.reviewer2Status || 'pending';
    
    if (!hasReviewer1 && !hasReviewer2) return false;
    if (hasReviewer1 && !hasReviewer2) return reviewer1Status === 'approved';
    if (hasReviewer1 && hasReviewer2) return reviewer1Status === 'approved' && reviewer2Status === 'approved';
    return false;
  };

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

  // 处理一级评审状态修改
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

  // 处理二级评审状态修改
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
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">预排期需求管理</h1>
          <p className="text-muted-foreground mt-1">
            按版本分组管理已分配版本的需求，包括评审状态跟踪和开发排期安排
          </p>
        </div>
      </div>

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
              {/* 固定表头 */}
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>创建人</TableHead>
                  <TableHead>项目</TableHead>
                  <TableHead>应用端</TableHead>
                  <TableHead>评审状态</TableHead>
                  <TableHead>一级评审</TableHead>
                  <TableHead>二级评审</TableHead>
                  <TableHead>预排期版本</TableHead>
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
                            <div className="flex items-center gap-2">
                              {/* 版本状态统计 */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {version === '未分配版本' ? (
                                  <>
                                    <span>
                                      {versionRequirements.filter(r => r.reviewStatus === 'pending').length} 待评审
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {versionRequirements.filter(r => r.reviewStatus === 'first_review' || r.reviewStatus === 'second_review').length} 评审中
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {versionRequirements.filter(r => r.reviewStatus === 'approved').length} 已评审
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      {versionRequirements.filter(r => r.reviewStatus === 'approved').length} 已评审
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {versionRequirements.filter(r => r.status === '开发中').length} 开发中
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {versionRequirements.filter(r => r.status === '已完成').length} 已完成
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* 版本下的需求列表 */}
                      {isExpanded && versionRequirements.map((requirement, index) => {
                        const isHighlighted = requirement.id === highlightRequirementId;
                        return (
                          <TableRow 
                            key={requirement.id} 
                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                              isHighlighted ? 'bg-green-50 hover:bg-green-100' : ''
                            }`}
                            onClick={() => handleRequirementClick(requirement)}
                          >
                            {/* 标题 */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div>{requirement.title}</div>
                                  {requirement.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {requirement.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs h-5">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            
                            {/* 类型 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`cursor-pointer hover:bg-muted ${
                                      requirement.type === '功能需求' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                      requirement.type === '技术需求' ? 'border-green-200 bg-green-50 text-green-700' :
                                      requirement.type === 'Bug' ? 'border-red-200 bg-red-50 text-red-700' :
                                      requirement.type === '产品建议' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                      'border-purple-200 bg-purple-50 text-purple-700'
                                    }`}
                                  >
                                    {requirement.type}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {requirementTypes.map(type => (
                                    <DropdownMenuItem
                                      key={type}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTypeChange(requirement.id, type);
                                      }}
                                    >
                                      {type}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            
                            {/* 优先级 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`cursor-pointer hover:bg-muted ${
                                      requirement.priority === '紧急' ? 'border-red-200 bg-red-50 text-red-700' :
                                      requirement.priority === '高' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                      requirement.priority === '中' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                      'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    {requirement.priority}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {priorities.map(priority => (
                                    <DropdownMenuItem
                                      key={priority}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePriorityChange(requirement.id, priority);
                                      }}
                                    >
                                      {priority}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            
                            {/* 创建人 */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={requirement.creator.avatar} />
                                  <AvatarFallback>{requirement.creator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{requirement.creator.name}</span>
                              </div>
                            </TableCell>
                            
                            {/* 项目 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-muted"
                                    style={{
                                      borderColor: requirement.project.color + '40',
                                      backgroundColor: requirement.project.color + '10',
                                      color: requirement.project.color
                                    }}
                                  >
                                    {requirement.project.name}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {projects.map(project => (
                                    <DropdownMenuItem
                                      key={project.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProjectChange(requirement.id, project.id);
                                      }}
                                    >
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: project.color }}
                                      />
                                      {project.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            
                            {/* 应用端 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`cursor-pointer hover:bg-muted ${
                                      requirement.platform === 'Web端' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                      requirement.platform === '移动端' ? 'border-green-200 bg-green-50 text-green-700' :
                                      requirement.platform === '全平台' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                      requirement.platform === 'PC端' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                      requirement.platform === '小程序' ? 'border-cyan-200 bg-cyan-50 text-cyan-700' :
                                      'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    {requirement.platform || '未设置'}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {platforms.map(platform => (
                                    <DropdownMenuItem
                                      key={platform}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlatformChange(requirement.id, platform);
                                      }}
                                    >
                                      {platform}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            
                            {/* 评审状态 */}
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  requirement.reviewStatus === 'approved' ? 'border-green-200 bg-green-50 text-green-700' :
                                  requirement.reviewStatus === 'rejected' ? 'border-red-200 bg-red-50 text-red-700' :
                                  requirement.reviewStatus === 'first_review' || requirement.reviewStatus === 'second_review' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                  'border-gray-200 bg-gray-50 text-gray-700'
                                }
                              >
                                {requirement.reviewStatus === 'pending' ? '待评审' :
                                 requirement.reviewStatus === 'first_review' ? '一级评审中' :
                                 requirement.reviewStatus === 'second_review' ? '二级评审中' :
                                 requirement.reviewStatus === 'approved' ? '评审通过' :
                                 requirement.reviewStatus === 'rejected' ? '评审不通过' : '未知状态'}
                              </Badge>
                            </TableCell>
                            
                            {/* 一级评审 */}
                            <TableCell>
                              {requirement.reviewer1 ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.reviewer1.avatar} />
                                    <AvatarFallback>{requirement.reviewer1.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge 
                                        variant="outline" 
                                        className={`cursor-pointer hover:bg-muted ${
                                          requirement.reviewer1Status === 'approved' ? 'border-green-200 bg-green-50 text-green-700' :
                                          requirement.reviewer1Status === 'rejected' ? 'border-red-200 bg-red-50 text-red-700' :
                                          'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                      >
                                        {requirement.reviewer1Status === 'approved' ? '已通过' :
                                         requirement.reviewer1Status === 'rejected' ? '未通过' : '待评审'}
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      {reviewStatuses.map(status => (
                                        <DropdownMenuItem
                                          key={status.value}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReviewer1StatusChange(requirement.id, status.value);
                                          }}
                                        >
                                          {status.label}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">未分配</span>
                              )}
                            </TableCell>
                            
                            {/* 二级评审 */}
                            <TableCell>
                              {requirement.reviewer2 ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.reviewer2.avatar} />
                                    <AvatarFallback>{requirement.reviewer2.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge 
                                        variant="outline" 
                                        className={`cursor-pointer hover:bg-muted ${
                                          requirement.reviewer2Status === 'approved' ? 'border-green-200 bg-green-50 text-green-700' :
                                          requirement.reviewer2Status === 'rejected' ? 'border-red-200 bg-red-50 text-red-700' :
                                          'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                      >
                                        {requirement.reviewer2Status === 'approved' ? '已通过' :
                                         requirement.reviewer2Status === 'rejected' ? '未通过' : '待评审'}
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      {reviewStatuses.map(status => (
                                        <DropdownMenuItem
                                          key={status.value}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReviewer2StatusChange(requirement.id, status.value);
                                          }}
                                        >
                                          {status.label}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">未分配</span>
                              )}
                            </TableCell>
                            
                            {/* 预排期版本 */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-muted border-blue-200 bg-blue-50 text-blue-700"
                                  >
                                    {requirement.plannedVersion || '未分配'}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {availableVersions.map(version => (
                                    <DropdownMenuItem
                                      key={version}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVersionSelect(requirement.id, version);
                                      }}
                                    >
                                      {version}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVersionSelect(requirement.id, 'unassigned');
                                    }}
                                  >
                                    未分配
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            
                            {/* 更新时间 */}
                            <TableCell className="text-sm text-muted-foreground">
                              {requirement.updatedAt}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}