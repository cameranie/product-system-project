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
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

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
  platform?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
  viewCount?: number;
  deviceType?: 'Web' | 'Mobile' | 'Tablet' | 'Desktop';
  requirementId?: string;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
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

const mockPrototypes: Prototype[] = [
  {
    id: '1',
    title: '用户中心交互原型 v2.0',
    description: '用户中心的完整交互流程设计，包含登录、注册、个人信息管理等功能模块的原型设计。',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    prototypeUrl: 'https://www.figma.com/proto/abc123',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/abc123',
    creator: mockUsers[2],
    project: mockProjects[0],
    platform: 'Web端',
    createdAt: '2024-12-10 09:30',
    updatedAt: '2024-12-16 15:45',
    tags: ['交互设计', '用户体验', '移动端'],
    isFavorite: true,
    viewCount: 25,
    deviceType: 'Web',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
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
    platform: '移动端',
    createdAt: '2024-12-12 14:20',
    updatedAt: '2024-12-15 11:30',
    tags: ['支付', '安全', '流程设计'],
    isFavorite: false,
    viewCount: 12,
    deviceType: 'Mobile',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
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
    platform: '全平台',
    createdAt: '2024-12-08 16:45',
    updatedAt: '2024-12-14 10:15',
    tags: ['移动端', 'App设计', '原生交互'],
    isFavorite: true,
    viewCount: 8,
    deviceType: 'Mobile',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
  },
];

const deviceIcons = {
  'Web': Monitor,
  'Mobile': Smartphone,
  'Tablet': Tablet,
  'Desktop': Monitor
};

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

export function PrototypePage({ context, onNavigate }: { 
  context?: any; 
  onNavigate?: (page: string, context?: any) => void; 
}) {
  const [prototypes, setPrototypes] = useState<Prototype[]>(mockPrototypes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [hiddenColumns] = useState<string[]>([]);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    }
  };

  const handleViewPrototype = (prototype: Prototype) => {
    if (onNavigate) {
      onNavigate('prototype-detail', { prototypeId: prototype.id });
    } else {
      console.log('View prototype:', prototype);
    }
  };

  // 处理优先级修改
  const handlePriorityChange = (prototypeId: string, priority: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { ...p, priority: priority as '低' | '中' | '高' | '紧急', updatedAt }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 处理项目修改
  const handleProjectChange = (prototypeId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const now = new Date();
      const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const updatedPrototypes = prototypes.map(p => 
        p.id === prototypeId 
          ? { ...p, project, updatedAt }
          : p
      );
      setPrototypes(updatedPrototypes);
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (prototypeId: string, platform: string) => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { ...p, platform, updatedAt }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 处理一级评审人员修改
  const handleReviewer1Change = (prototypeId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { 
            ...p, 
            reviewer1: user || undefined,
            reviewer1Status: user ? 'pending' as const : undefined,
            updatedAt 
          }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 处理二级评审人员修改
  const handleReviewer2Change = (prototypeId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { 
            ...p, 
            reviewer2: user || undefined,
            reviewer2Status: user ? 'pending' as const : undefined,
            updatedAt 
          }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 处理一级评审状态修改
  const handleReviewer1StatusChange = (prototypeId: string, status: 'pending' | 'approved' | 'rejected') => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { 
            ...p, 
            reviewer1Status: status,
            updatedAt 
          }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 处理二级评审状态修改
  const handleReviewer2StatusChange = (prototypeId: string, status: 'pending' | 'approved' | 'rejected') => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrototypes = prototypes.map(p => 
      p.id === prototypeId 
        ? { 
            ...p, 
            reviewer2Status: status,
            updatedAt 
          }
        : p
    );
    setPrototypes(updatedPrototypes);
  };

  // 筛选逻辑
  const filteredPrototypes = prototypes.filter(prototype => {
    const matchesSearch = prototype.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prototype.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || prototype.project?.id === filterProject;
    
    return matchesSearch && matchesProject;
  });

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
              <h1 className="text-2xl font-medium">原型设计管理</h1>
              <p className="text-muted-foreground mt-1">原型和设计管理</p>
            </div>
          </div>
          <Button onClick={() => onNavigate?.('prototype-edit', { isCreate: true })}>
            <Plus className="h-4 w-4 mr-2" />
            新建原型
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
                  <div className="p-3 space-y-3">
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
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 原型列表 */}
      <Card>
        <CardContent className="p-0">
          {filteredPrototypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Monitor className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无原型</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                还没有创建任何原型。点击"新建原型"按钮开始创建您的第一个原型。
              </p>
              <Button onClick={() => onNavigate?.('prototype-edit', { isCreate: true })}>
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
                    {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
                    {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
                    {!hiddenColumns.includes('reviewer1') && <TableHead>一级评审</TableHead>}
                    {!hiddenColumns.includes('reviewer2') && <TableHead>二级评审</TableHead>}
                    {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrototypes.map((prototype) => (
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
                                variant={priorityConfig[prototype.priority].variant}
                                className={`cursor-pointer ${priorityConfig[prototype.priority].className}`}
                              >
                                {prototype.priority}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {Object.keys(priorityConfig).map((priority) => (
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
                              <AvatarFallback className="text-xs">
                                {prototype.creator.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{prototype.creator.name}</span>
                          </div>
                        </TableCell>
                      )}
                      
                      {!hiddenColumns.includes('project') && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                {prototype.project?.name || '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {mockProjects.map((project) => (
                                <DropdownMenuItem
                                  key={project.id}
                                  onClick={() => handleProjectChange(prototype.id, project.id)}
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
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                {prototype.platform || '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {platforms.map((platform) => (
                                <DropdownMenuItem
                                  key={platform}
                                  onClick={() => handlePlatformChange(prototype.id, platform)}
                                >
                                  {platform}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                      
                      {!hiddenColumns.includes('reviewStatus') && (
                        <TableCell>
                          <Badge variant="outline">{prototype.status}</Badge>
                        </TableCell>
                      )}
                      
                      {!hiddenColumns.includes('reviewer1') && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            {/* 一级评审人员 */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                  {prototype.reviewer1 ? prototype.reviewer1.name : '未指定'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleReviewer1Change(prototype.id, null)}>
                                  未指定
                                </DropdownMenuItem>
                                {mockUsers.map((user) => (
                                  <DropdownMenuItem
                                    key={user.id}
                                    onClick={() => handleReviewer1Change(prototype.id, user.id)}
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
                            {prototype.reviewer1 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant={reviewerStatusLabels[prototype.reviewer1Status || 'pending'].variant}
                                    className={`cursor-pointer text-xs ${reviewerStatusLabels[prototype.reviewer1Status || 'pending'].className}`}
                                  >
                                    {reviewerStatusLabels[prototype.reviewer1Status || 'pending'].label}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewer1StatusChange(prototype.id, 'pending')}
                                  >
                                    <Clock className="h-3 w-3 mr-2" />
                                    待评审
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewer1StatusChange(prototype.id, 'approved')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-2" />
                                    已通过
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewer1StatusChange(prototype.id, 'rejected')}
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
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                  {prototype.reviewer2 ? prototype.reviewer2.name : '未指定'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleReviewer2Change(prototype.id, null)}>
                                  未指定
                                </DropdownMenuItem>
                                {mockUsers.map((user) => (
                                  <DropdownMenuItem
                                    key={user.id}
                                    onClick={() => handleReviewer2Change(prototype.id, user.id)}
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
                            {prototype.reviewer2 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge 
                                    variant={reviewerStatusLabels[prototype.reviewer2Status || 'pending'].variant}
                                    className={`cursor-pointer text-xs ${reviewerStatusLabels[prototype.reviewer2Status || 'pending'].className}`}
                                  >
                                    {reviewerStatusLabels[prototype.reviewer2Status || 'pending'].label}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewer2StatusChange(prototype.id, 'pending')}
                                  >
                                    <Clock className="h-3 w-3 mr-2" />
                                    待评审
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewer2StatusChange(prototype.id, 'approved')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-2" />
                                    已通过
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewer2StatusChange(prototype.id, 'rejected')}
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
                        <TableCell className="text-muted-foreground text-sm">
                          {prototype.updatedAt}
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