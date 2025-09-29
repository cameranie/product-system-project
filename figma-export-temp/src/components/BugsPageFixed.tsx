import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Bug,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { BugDetailPanel } from './BugDetailPanel';

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

interface Requirement {
  id: string;
  title: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Bug {
  id: string;
  title: string;
  description?: string;
  priority: '低' | '中' | '高' | '紧急';
  status: '待处理' | '处理中' | '待测试' | '已解决' | '已关闭' | '重新打开';
  assignee: User;
  reporter: User;
  project: Project;
  requirement?: Requirement;
  reproductionSteps?: string;
  expectedResult?: string;
  actualResult?: string;
  environment?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: Attachment[];
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '测试员A', avatar: '', role: '测试工程师' },
  { id: '7', name: '测试员B', avatar: '', role: '测试工程师' },
  { id: '8', name: '产品经理', avatar: '', role: '产品经理' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

const mockRequirements: Requirement[] = [
  { id: '1', title: '用户登录功能' },
  { id: '2', title: '支付流程优化' },
  { id: '3', title: '数据看板设计' },
  { id: '4', title: '移动端适配' }
];

const mockBugs: Bug[] = [
  {
    id: '1',
    title: '登录页面在Safari浏览器下出现白屏',
    description: '用户在Safari浏览器中访问登录页面时，页面显示空白，无法正常使用',
    priority: '紧急',
    status: '处理中',
    assignee: mockUsers[0],
    reporter: mockUsers[5],
    project: mockProjects[0],
    requirement: mockRequirements[0],
    reproductionSteps: '1. 使用Safari浏览器打开登录页面\n2. 输入正确的用户名和密码\n3. 点击登录按钮\n4. 页面变为白屏',
    expectedResult: '成功登录并跳转到主页面',
    actualResult: '页面显示空白，控制台显示JavaScript错误',
    environment: 'Safari 16.0, macOS Ventura 13.0, 分辨率1440x900',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
    tags: ['浏览器兼容', '登录', '紧急修复']
  },
  {
    id: '2',
    title: '支付金额显示精度错误',
    description: '在支付页面，当金额包含小数点时，显示的金额与实际应付金额不符',
    priority: '高',
    status: '待测试',
    assignee: mockUsers[1],
    reporter: mockUsers[6],
    project: mockProjects[1],
    requirement: mockRequirements[1],
    reproductionSteps: '1. 添加商品到购物车，确保总金额有小数\n2. 进入支付页面\n3. 查看显示的支付金额',
    expectedResult: '显示准确的支付金额，精确到分',
    actualResult: '金额显示四舍五入到元，丢失了分的精度',
    environment: 'Chrome 120.0, Windows 11, 分辨率1920x1080',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16',
    tags: ['支付', '数据精度', '计算错误']
  },
  {
    id: '3',
    title: '移动端按钮样式偏移问题',
    description: '在移动设备上，主要操作按钮位置偏移，影响用户体验',
    priority: '中',
    status: '已解决',
    assignee: mockUsers[2],
    reporter: mockUsers[6],
    project: mockProjects[3],
    requirement: mockRequirements[3],
    reproductionSteps: '1. 使用手机浏览器访问应用\n2. 进入任意功能页面\n3. 观察页面底部的操作按钮',
    expectedResult: '按钮应该居中显示，与页面边距一致',
    actualResult: '按钮向右偏移约10px，与设计不符',
    environment: 'iPhone 14 Pro, iOS 16.0, Safari移动版',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15',
    tags: ['移动端', 'UI样式', '响应式']
  }
];

// 状态配置 - 参照需求池样式
const statusLabels = {
  '待处理': { label: '待处理', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
  '处理中': { label: '处理中', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  '待测试': { label: '待测试', variant: 'outline' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  '已解决': { label: '已解决', variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' },
  '已关闭': { label: '已关闭', variant: 'outline' as const, className: 'bg-slate-100 text-slate-800 border-slate-200' },
  '重新打开': { label: '重新打开', variant: 'outline' as const, className: 'bg-red-100 text-red-800 border-red-200' }
};

// 优先级配置 - 参照需求池样式
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

interface BugsPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function BugsPage({ context, onNavigate }: BugsPageProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    }
  };

  const handleCreateBug = () => {
    console.log('Create new bug');
  };

  const handleViewBug = (bug: Bug) => {
    console.log('View bug:', bug);
  };

  // 筛选逻辑
  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bug.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || bug.priority === filterPriority;
    const matchesProject = filterProject === 'all' || bug.project.id === filterProject;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {context?.returnTo && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-medium">
                {context?.filterRequirementId ? `${context.requirementTitle || '需求'} - 相关问题` : 'Bug追踪'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {context?.filterRequirementId ? '管理该需求相关的测试问题和缺陷' : '管理和跟踪项目中的问题和缺陷'}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateBug}>
            <Plus className="h-4 w-4 mr-2" />
            新建Bug
          </Button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 筛选和操作栏 */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 搜索 */}
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索Bug标题、描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>

              {/* 筛选器 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="待处理">待处理</SelectItem>
                      <SelectItem value="处理中">处理中</SelectItem>
                      <SelectItem value="待测试">待测试</SelectItem>
                      <SelectItem value="已解决">已解决</SelectItem>
                      <SelectItem value="已关闭">已关闭</SelectItem>
                      <SelectItem value="重新打开">重新打开</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="优先级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有优先级</SelectItem>
                      <SelectItem value="紧急">紧急</SelectItem>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="低">低</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="项目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有项目</SelectItem>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bug列表 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="min-w-[300px]">Bug标题</TableHead>
                    <TableHead className="w-32">所属项目</TableHead>
                    <TableHead className="w-28">所属需求</TableHead>
                    <TableHead className="w-32">状态</TableHead>
                    <TableHead className="w-32">优先级</TableHead>
                    <TableHead className="w-36">处理人</TableHead>
                    <TableHead className="w-36">报告人</TableHead>
                    <TableHead className="w-28">创建时间</TableHead>
                    <TableHead className="w-28">更新时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBugs.map((bug) => (
                    <TableRow key={bug.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleViewBug(bug)}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Bug className="h-4 w-4 text-red-500" />
                              <p className="font-medium text-primary hover:underline">
                                {bug.title}
                              </p>
                            </div>
                            {bug.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
                                {bug.description.split('\n')[0]}
                              </p>
                            )}
                            {bug.tags && bug.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {bug.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                                    {tag}
                                  </Badge>
                                ))}
                                {bug.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                                    +{bug.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                          <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: bug.project.color }}></div>
                          {bug.project.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-20">
                          {bug.requirement?.title || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusLabels[bug.status].variant}
                          className={`text-xs ${statusLabels[bug.status].className}`}
                        >
                          {statusLabels[bug.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={priorityConfig[bug.priority].variant}
                          className={`text-xs ${priorityConfig[bug.priority].className}`}
                        >
                          {bug.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={bug.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {bug.assignee.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-20">{bug.assignee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={bug.reporter.avatar} />
                            <AvatarFallback className="text-xs">
                              {bug.reporter.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-20">{bug.reporter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{bug.createdAt}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{bug.updatedAt}</span>
                      </TableCell>
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