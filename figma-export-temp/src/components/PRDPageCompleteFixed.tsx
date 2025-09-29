import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Plus, 
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
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
  version: string;
  project: Project;
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
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  isDraft?: boolean;
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

// 优先级配置 - 与预排期需求管理页面保持一致
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

const mockPRDs: PRDItem[] = [
  {
    id: '1',
    title: '用户注册流程优化PRD',
    version: 'v2.1',
    project: mockProjects[0],
    platform: 'Web端',
    priority: '高',
    status: 'published',
    creator: mockUsers[0],
    updatedAt: '2024-01-20 14:30',
    createdAt: '2024-01-15 09:15',
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
    priority: '紧急',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-18 16:45',
    createdAt: '2024-01-10 11:20',
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
    priority: '中',
    status: 'reviewing',
    creator: mockUsers[3],
    updatedAt: '2024-01-16 10:22',
    createdAt: '2024-01-12 15:30',
    reviewer1: mockUsers[0],
    reviewStatus: 'first_review',
    reviewer1Status: 'pending'
  },
];

// 评审总状态配置 - 改为无颜色样式
const statusLabels = {
  draft: { label: '草稿', variant: 'outline' as const, icon: XCircle, color: 'text-gray-500' },
  reviewing: { label: '评审中', variant: 'outline' as const, icon: AlertCircle, color: 'text-gray-500' },
  published: { label: '已发布', variant: 'outline' as const, icon: CheckCircle, color: 'text-gray-500' },
  archived: { label: '已归档', variant: 'outline' as const, icon: XCircle, color: 'text-gray-500' }
};

// 评审状态配置 - 与预排期需求管理页面保持一致
const reviewerStatusLabels = {
  pending: { label: '待评审', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  approved: { label: '已通过', variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  rejected: { label: '已拒绝', variant: 'secondary' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

interface PRDPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function PRDPage({ context, onNavigate }: PRDPageProps = {}) {
  const [prds, setPrds] = useState<PRDItem[]>(mockPRDs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [hiddenColumns] = useState<string[]>([]);

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

  // 处理项目修改
  const handleProjectChange = (prdId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const now = new Date();
      const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const updatedPrds = prds.map(p => 
        p.id === prdId 
          ? { ...p, project, updatedAt }
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
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer1: user || undefined,
            reviewer1Status: user ? 'pending' as const : undefined,
            updatedAt 
          }
        : p
    );
    setPrds(updatedPrds);
  };

  // 处理二级评审人员修改
  const handleReviewer2Change = (prdId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    const now = new Date();
    const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedPrds = prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer2: user || undefined,
            reviewer2Status: user ? 'pending' as const : undefined,
            updatedAt 
          }
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
        source: 'prd-management'
      });
    }
  };

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    }
  };

  // 筛选逻辑
  const filteredPRDs = prds.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || prd.project.id === filterProject;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {context?.returnTo && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回需求
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-medium">PRD管理</h1>
              <p className="text-muted-foreground mt-1">产品需求文档管理</p>
            </div>
          </div>
          <Button onClick={handleCreatePRD}>
            <Plus className="h-4 w-4 mr-2" />
            新建PRD
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
                  placeholder="搜索PRD..."
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

      {/* PRD列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {!hiddenColumns.includes('title') && <TableHead>PRD标题</TableHead>}
                  {!hiddenColumns.includes('priority') && <TableHead>优先级</TableHead>}
                  {!hiddenColumns.includes('version') && <TableHead>版本</TableHead>}
                  {!hiddenColumns.includes('project') && <TableHead>所属项目</TableHead>}
                  {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
                  {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
                  {!hiddenColumns.includes('reviewer1') && <TableHead>一级评审</TableHead>}
                  {!hiddenColumns.includes('reviewer2') && <TableHead>二级评审</TableHead>}
                  {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
                  {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPRDs.map((prd) => (
                  <TableRow key={prd.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewPRD(prd)}>
                    {!hiddenColumns.includes('title') && (
                      <TableCell>
                        <div className="font-medium text-primary hover:underline">
                          {prd.title}
                        </div>
                      </TableCell>
                    )}
                    
                    {!hiddenColumns.includes('priority') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {prd.priority ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge 
                                variant={priorityConfig[prd.priority].variant}
                                className={`cursor-pointer text-xs ${priorityConfig[prd.priority].className}`}
                              >
                                {prd.priority}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {Object.keys(priorityConfig).map((priority) => (
                                <DropdownMenuItem
                                  key={priority}
                                  onClick={() => handlePriorityChange(prd.id, priority)}
                                >
                                  {priority}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                未指定
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {Object.keys(priorityConfig).map((priority) => (
                                <DropdownMenuItem
                                  key={priority}
                                  onClick={() => handlePriorityChange(prd.id, priority)}
                                >
                                  {priority}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                    
                    {!hiddenColumns.includes('version') && (
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{prd.version}</Badge>
                      </TableCell>
                    )}
                    
                    {/* 所属项目 - 移除颜色 */}
                    {!hiddenColumns.includes('project') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                              {prd.project.name}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {mockProjects.map((project) => (
                              <DropdownMenuItem
                                key={project.id}
                                onClick={() => handleProjectChange(prd.id, project.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
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
                              {prd.platform || '未指定'}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {platforms.map((platform) => (
                              <DropdownMenuItem 
                                key={platform} 
                                onClick={() => handlePlatformChange(prd.id, platform)}
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
                        <Badge variant={statusLabels[prd.status]?.variant || 'outline'} className="text-xs">
                          {statusLabels[prd.status]?.label || prd.status}
                        </Badge>
                      </TableCell>
                    )}
                    
                    {/* 一级评审 - 使用一致的颜色配置 */}
                    {!hiddenColumns.includes('reviewer1') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* 一级评审人员 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {prd.reviewer1 ? prd.reviewer1.name : '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleReviewer1Change(prd.id, null)}>
                                未指定
                              </DropdownMenuItem>
                              {mockUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => handleReviewer1Change(prd.id, user.id)}
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
                          {prd.reviewer1 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant={reviewerStatusLabels[prd.reviewer1Status || 'pending'].variant}
                                  className={`cursor-pointer text-xs ${reviewerStatusLabels[prd.reviewer1Status || 'pending'].className}`}
                                >
                                  {reviewerStatusLabels[prd.reviewer1Status || 'pending'].label}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewer1StatusChange(prd.id, 'pending')}
                                >
                                  <Clock className="h-3 w-3 mr-2" />
                                  待评审
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewer1StatusChange(prd.id, 'approved')}
                                >
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  已通过
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewer1StatusChange(prd.id, 'rejected')}
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
                    
                    {/* 二级评审 - 使用一致的颜色配置 */}
                    {!hiddenColumns.includes('reviewer2') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* 二级评审人员 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {prd.reviewer2 ? prd.reviewer2.name : '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleReviewer2Change(prd.id, null)}>
                                未指定
                              </DropdownMenuItem>
                              {mockUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => handleReviewer2Change(prd.id, user.id)}
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
                          {prd.reviewer2 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant={reviewerStatusLabels[prd.reviewer2Status || 'pending'].variant}
                                  className={`cursor-pointer text-xs ${reviewerStatusLabels[prd.reviewer2Status || 'pending'].className}`}
                                >
                                  {reviewerStatusLabels[prd.reviewer2Status || 'pending'].label}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewer2StatusChange(prd.id, 'pending')}
                                >
                                  <Clock className="h-3 w-3 mr-2" />
                                  待评审
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewer2StatusChange(prd.id, 'approved')}
                                >
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  已通过
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewer2StatusChange(prd.id, 'rejected')}
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
                    
                    {!hiddenColumns.includes('creator') && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prd.creator.avatar} />
                            <AvatarFallback className="text-xs">
                              {prd.creator.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prd.creator.name}</span>
                        </div>
                      </TableCell>
                    )}
                    
                    {!hiddenColumns.includes('updatedAt') && (
                      <TableCell className="text-muted-foreground text-sm">
                        {prd.updatedAt}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}