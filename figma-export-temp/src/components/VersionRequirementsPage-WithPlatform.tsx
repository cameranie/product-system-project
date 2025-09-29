import React, { useState, useRef } from 'react';
import { 
  Search, 
  Plus,
  GitBranch,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
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

interface ReviewStatus {
  status: '未开始' | '进行中' | '已完成' | '已暂停' | '有问题';
  reviewer?: User;
  reviewDate?: string;
}

interface VersionRequirement {
  id: string;
  title: string;
  type: '功能需求' | '技术需求' | 'Bug' | '产品建议' | '安全需求';
  version: string;
  scheduledVersion?: string;
  status: '规划中' | '开发中' | '测试中' | '已完成' | '已发布' | '已暂停';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  productManager: User;
  project: Project;
  platform?: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isOpen: boolean;
  scheduleReviewLevel1: ReviewStatus;
  scheduleReviewLevel2: ReviewStatus;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

const mockVersionRequirements: VersionRequirement[] = [
  // v2.0.0 版本需求
  {
    id: '1',
    title: 'K线图优化升级',
    type: '技术需求',
    version: 'v2.0.0',
    scheduledVersion: 'v2.0.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[4],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web端',
    description: '优化K线图渲染性能，支持更多技术指标和自定义样式',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2023-12-15 16:40',
    updatedAt: '2024-01-20 09:25',
    tags: ['K线', '图表', '性能优化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-12-20 11:30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-12-22 15:45' }
  },
  {
    id: '2',
    title: '行情数据推送优化',
    type: 'Bug',
    version: 'v2.0.0',
    scheduledVersion: 'v2.0.0',
    status: '测试中',
    priority: '紧急',
    assignee: mockUsers[2],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: '全平台',
    description: '修复行情数据推送延迟问题，提升数据实时性和准确性',
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    createdAt: '2024-01-28 13:15',
    updatedAt: '2024-02-10 16:20',
    tags: ['行情', '推送', '性能'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-29 10:00' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-30 14:30' }
  },
  {
    id: '3',
    title: '交易下单流程优化',
    type: '功能需求',
    version: 'v2.0.0',
    scheduledVersion: 'v2.0.0',
    status: '已完成',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[2],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: '移动端',
    description: '简化交易下单流程，提升用户操作体验和交易效率',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    createdAt: '2024-01-10 10:30',
    updatedAt: '2024-02-25 14:20',
    tags: ['交易', '下单', '用户体验'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-12 09:15' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-15 16:30' }
  },
  // v3.0.0 版本需求
  {
    id: '7',
    title: '聊天室消息过滤',
    type: '安全需求',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[4],
    creator: mockUsers[2],
    productManager: mockUsers[5],
    project: mockProjects[2],
    platform: '小程序',
    description: '增强聊天室消息过滤功能，防止恶意信息传播和垃圾消息',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    createdAt: '2024-02-20 09:30',
    updatedAt: '2024-03-05 11:45',
    tags: ['聊天室', '安全', '过滤'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-02-22 15:20' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[1], reviewDate: '2024-02-25 10:10' }
  },
  {
    id: '8',
    title: '聊天室表情包系统',
    type: '功能需求',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[3],
    productManager: mockUsers[5],
    project: mockProjects[2],
    platform: 'PC端',
    description: '为聊天室添加表情包功能，提升用户互动体验',
    startDate: '2024-04-01',
    endDate: '2024-05-15',
    createdAt: '2024-03-10 16:20',
    updatedAt: '2024-03-15 09:30',
    tags: ['聊天室', '表情包', '互动'],
    isOpen: true,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[4] },
    scheduleReviewLevel2: { status: '未开始' }
  }
];

export function VersionRequirementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockVersionRequirements.map(r => r.version || '未分配版本'))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });

  // 版本选项
  const versionOptions = [
    'v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0', 'v1.4.0', 'v1.5.0', 'v1.6.0',
    'v2.0.0', 'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0',
    'v3.0.0', 'v3.1.0', 'v3.2.0', 'v3.3.0', 'v3.4.0', 'v3.5.0', 'v3.6.0', 'v3.7.0', 'v3.8.0',
    'v4.0.0', 'v4.1.0', 'v4.2.0', 'v4.3.0', 'v4.4.0', 'v4.5.0',
    'v5.0.0', 'v5.1.0', 'v5.2.0',
    'v6.0.0', 'v6.1.0'
  ];

  // 类型选项
  const typeOptions = ['功能需求', '技术需求', 'Bug', '产品建议', '安全需求'];

  // 优先级选项
  const priorityOptions = ['低', '中', '高', '紧急'];

  // 可选的应用端
  const platforms = [
    'Web端', '移动端', '全平台', 'PC端', '小程序'
  ];

  // 处理类型修改
  const handleTypeChange = (requirementId: string, type: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, type, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理优先级修改
  const handlePriorityChange = (requirementId: string, priority: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, priority, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理版本选择
  const handleVersionSelect = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, version: version === 'unassigned' ? '未分配版本' : version, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理产品负责人修改
  const handleProductManagerChange = (requirementId: string, userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      const updatedRequirements = requirements.map(r => 
        r.id === requirementId 
          ? { ...r, productManager: user, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : r
      );
      setRequirements(updatedRequirements);
    }
  };

  // 处理项目修改
  const handleProjectChange = (requirementId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const updatedRequirements = requirements.map(r => 
        r.id === requirementId 
          ? { ...r, project, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : r
      );
      setRequirements(updatedRequirements);
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (requirementId: string, platform: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, platform, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 筛选逻辑
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (req.description && req.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || req.type === filterType;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesVersion = filterVersion === 'all' || req.version === filterVersion;
    const matchesProject = filterProject === 'all' || req.project.id === filterProject;
    
    return matchesSearch && matchesType && matchesPriority && matchesVersion && matchesProject;
  });

  // 按版本分组
  const groupedByVersion = filteredRequirements.reduce((groups, requirement) => {
    const version = requirement.version || '未分配版本';
    
    if (!groups[version]) {
      groups[version] = [];
    }
    groups[version].push(requirement);
    return groups;
  }, {} as Record<string, VersionRequirement[]>);

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

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">版本需求管理</h1>
          <p className="text-muted-foreground mt-1">
            按版本分组管理需求，跟踪各阶段子任务进度和评审状态
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新建版本需求
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
                  placeholder="搜索版本需求..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 快速筛选 */}
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="功能需求">功能需求</SelectItem>
                    <SelectItem value="技术需求">技术需求</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="产品建议">产品建议</SelectItem>
                    <SelectItem value="安全需求">安全需求</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有优先级</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="紧急">紧急</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有项目</SelectItem>
                    {mockProjects.map(project => (
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
                    {versionOptions.map(version => (
                      <SelectItem key={version} value={version}>{version}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                共 {filteredRequirements.length} 个版本需求
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 版本需求列表 - 按版本分组 */}
      {sortedVersions.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无版本需求</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                还没有任何版本需求，请先创建版本需求。
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
                  <TableHead className="min-w-[200px]">标题</TableHead>
                  <TableHead className="w-24">类型</TableHead>
                  <TableHead className="w-20">优先级</TableHead>
                  <TableHead className="w-24">版本号</TableHead>
                  <TableHead className="w-24">创建人</TableHead>
                  <TableHead className="w-24">产品负责人</TableHead>
                  <TableHead className="w-24">项目</TableHead>
                  <TableHead className="w-24">应用端</TableHead>
                  <TableHead className="w-32">更新时间</TableHead>
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
                        <TableCell colSpan={9} className="py-3">
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
                      
                      {/* 版本下的需求列表 */}
                      {isExpanded && versionRequirements.map((requirement) => (
                        <TableRow key={requirement.id} className="hover:bg-muted/50">
                          {/* 标题 */}
                          <TableCell className="min-w-[200px]">
                            <div>
                              <div className="font-medium">{requirement.title}</div>
                              {requirement.description && (
                                <div className="text-sm text-muted-foreground mt-1 truncate max-w-[250px]">
                                  {requirement.description}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* 类型 - 可编辑 */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                  {requirement.type}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {typeOptions.map((type) => (
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
                                  variant={
                                    requirement.priority === '紧急' ? 'destructive' :
                                    requirement.priority === '高' ? 'default' :
                                    requirement.priority === '中' ? 'secondary' : 'outline'
                                  }
                                  className="cursor-pointer hover:bg-muted text-xs"
                                >
                                  {requirement.priority}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {priorityOptions.map((priority) => (
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

                          {/* 版本号 - 可编辑 */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-muted text-xs">
                                  {requirement.version}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {versionOptions.map((version) => (
                                  <DropdownMenuItem 
                                    key={version} 
                                    onClick={() => handleVersionSelect(requirement.id, version)}
                                  >
                                    {version}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => handleVersionSelect(requirement.id, 'unassigned')}>
                                  未分配版本
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                          {/* 创建人 */}
                          <TableCell>
                            <span className="text-sm">{requirement.creator.name}</span>
                          </TableCell>

                          {/* 产品负责人 - 可编辑 */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                  {requirement.productManager.name}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {mockUsers.map((user) => (
                                  <DropdownMenuItem 
                                    key={user.id} 
                                    onClick={() => handleProductManagerChange(requirement.id, user.id)}
                                  >
                                    {user.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                          {/* 项目 - 可编辑 */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="secondary" 
                                  style={{ backgroundColor: requirement.project.color + '20', color: requirement.project.color }}
                                  className="cursor-pointer hover:bg-muted text-xs"
                                >
                                  {requirement.project.name}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {mockProjects.map((project) => (
                                  <DropdownMenuItem 
                                    key={project.id} 
                                    onClick={() => handleProjectChange(requirement.id, project.id)}
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

                          {/* 应用端 - 可编辑 */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                  {requirement.platform || '未指定'}
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

                          {/* 更新时间 */}
                          <TableCell>
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
  );
}