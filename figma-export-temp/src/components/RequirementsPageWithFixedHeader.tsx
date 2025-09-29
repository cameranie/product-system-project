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
  { id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '/avatars/lisi.jpg', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '/avatars/wangwu.jpg', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '/avatars/zhaoliu.jpg', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '/avatars/sunqi.jpg', email: 'sunqi@example.com' }
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

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 模拟需求数据
const mockRequirements: Requirement[] = [
  {
    id: '8',
    title: '用户权限管理优化',
    type: '功能需求',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '优化用户权限管理系统，支持更细粒度的权限控制，提升系统安全性和管理效率。',
    tags: ['权限', '安全', '管理'],
    createdAt: '2024-01-25 10:15',
    updatedAt: '2024-01-28 09:30',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
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
    createdAt: '2024-01-20 14:45',
    updatedAt: '2024-01-26 16:20',
    platform: '全平台',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[0]
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
    createdAt: '2024-01-12 11:00',
    updatedAt: '2024-01-15 13:25',
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
    createdAt: '2024-01-28 15:40',
    updatedAt: '2024-01-29 08:15',
    platform: '全平台',
    isOpen: true,
    reviewer1: mockUsers[3],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[2]
  },
  {
    id: '12',
    title: '数据统计图表优化',
    type: '功能需求',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '优化现有数据统计图表的展示效果和交互体验。',
    tags: ['图表', '数据', '优化'],
    createdAt: '2024-01-22 11:20',
    updatedAt: '2024-01-30 14:15',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[3]
  }
];

interface RequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
  context?: any;
}

export function RequirementsPageWithInlineEdit({ onNavigate, context }: RequirementsPageProps = {}) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [filterOpenStatus, setFilterOpenStatus] = useState('open');

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

  // 处理预排期版本修改
  const handleVersionChange = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, plannedVersion: version === 'unassigned' ? undefined : version, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
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

  const handleCreateRequirement = () => {
    if (onNavigate) {
      onNavigate('requirement-edit', { 
        requirement: null, 
        isEdit: false,
        source: 'requirements'
      });
    }
  };

  const handleViewRequirement = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', { requirementId: requirement.id, source: 'requirements' });
    }
  };

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = !searchTerm || 
      requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || requirement.type === filterType;
    const matchesPriority = filterPriority === 'all' || requirement.priority === filterPriority;
    const matchesOpenStatus = filterOpenStatus === 'all' || 
      (filterOpenStatus === 'open' && requirement.isOpen) ||
      (filterOpenStatus === 'closed' && !requirement.isOpen);

    return matchesSearch && matchesType && matchesPriority && matchesOpenStatus;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">需求池</h1>
            <p className="text-muted-foreground mt-1">
              管理和追踪未排期的产品需求，包括功能需求、Bug修复、产品建议等
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 开放状态筛选按钮 */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={filterOpenStatus === 'open' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterOpenStatus('open')}
                className="h-8 rounded-r-none border-r"
              >
                开放中
              </Button>
              <Button
                variant={filterOpenStatus === 'closed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterOpenStatus('closed')}
                className="h-8 rounded-none border-r"
              >
                已关闭
              </Button>
              <Button
                variant={filterOpenStatus === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterOpenStatus('all')}
                className="h-8 rounded-l-none"
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
            {filteredRequirements.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无需求</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
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
                    <TableHead>标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>创建人</TableHead>
                    <TableHead>应用端</TableHead>
                    <TableHead>一级评审</TableHead>
                    <TableHead>二级评审</TableHead>
                    <TableHead>评审状态</TableHead>
                    <TableHead>预排期版本</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((requirement) => (
                    <TableRow key={requirement.id} className="hover:bg-muted/50">
                      {/* 标题 */}
                      <TableCell onClick={() => handleViewRequirement(requirement)} className="cursor-pointer">
                        <div className="font-medium text-primary hover:underline">{requirement.title}</div>
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
                      <TableCell onClick={() => handleViewRequirement(requirement)} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={requirement.creator.avatar} />
                            <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{requirement.creator.name}</span>
                        </div>
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

                      {/* 预排期版本 - 仅评审通过后可编辑 */}
                      <TableCell>
                        {requirement.reviewStatus === 'approved' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {requirement.plannedVersion || '未分配'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handleVersionChange(requirement.id, 'unassigned')}>
                                未分配
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {availableVersions.map((version) => (
                                <DropdownMenuItem 
                                  key={version} 
                                  onClick={() => handleVersionChange(requirement.id, version)}
                                >
                                  {version}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground cursor-not-allowed opacity-50">
                            待评审通过
                          </Badge>
                        )}
                      </TableCell>

                      {/* 一级评审 */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* 一级评审人员 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {requirement.reviewer1 ? requirement.reviewer1.name : '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => console.log('设置一级评审人员为未指定')}>
                                未指定
                              </DropdownMenuItem>
                              {mockUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => console.log('设置一级评审人员:', user.name)}
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
                          {requirement.reviewer1 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="secondary"
                                  className={`cursor-pointer text-xs ${
                                    requirement.reviewer1Status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' :
                                    requirement.reviewer1Status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80'
                                  }`}
                                >
                                  {requirement.reviewer1Status === 'approved' ? '已通过' :
                                   requirement.reviewer1Status === 'rejected' ? '已拒绝' : '待评审'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => console.log('设置一级评审状态为待评审')}>
                                  <Clock className="h-3 w-3 mr-2" />
                                  待评审
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置一级评审状态为已通过')}>
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  已通过
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置一级评审状态为已拒绝')}>
                                  <XCircle className="h-3 w-3 mr-2" />
                                  已拒绝
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>

                      {/* 二级评审 */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* 二级评审人员 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {requirement.reviewer2 ? requirement.reviewer2.name : '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => console.log('设置二级评审人员为未指定')}>
                                未指定
                              </DropdownMenuItem>
                              {mockUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => console.log('设置二级评审人员:', user.name)}
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
                          {requirement.reviewer2 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="secondary"
                                  className={`cursor-pointer text-xs ${
                                    requirement.reviewer2Status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' :
                                    requirement.reviewer2Status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80'
                                  }`}
                                >
                                  {requirement.reviewer2Status === 'approved' ? '已通过' :
                                   requirement.reviewer2Status === 'rejected' ? '已拒绝' : '待评审'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => console.log('设置二级评审状态为待评审')}>
                                  <Clock className="h-3 w-3 mr-2" />
                                  待评审
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置二级评审状态为已通过')}>
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  已通过
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置二级评审状态为已拒绝')}>
                                  <XCircle className="h-3 w-3 mr-2" />
                                  已拒绝
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>

                      {/* 评审状态 */}
                      <TableCell onClick={() => handleViewRequirement(requirement)} className="cursor-pointer">
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {requirement.reviewStatus === 'approved' ? '评审通过' :
                           requirement.reviewStatus === 'rejected' ? '评审拒绝' :
                           requirement.reviewStatus === 'second_review' ? '二级评审中' :
                           requirement.reviewStatus === 'first_review' ? '一级评审中' :
                           '待评审'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}