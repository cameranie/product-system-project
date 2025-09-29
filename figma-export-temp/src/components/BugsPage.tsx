import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus,
  Search,
  Filter,
  SortAsc,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Bug,
  User,
  Calendar,
  Target,
  FileText,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Trash2,
  Settings
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
  { id: '1', name: 'K线', color: 'bg-blue-500' },
  { id: '2', name: '行情', color: 'bg-green-500' },
  { id: '3', name: '聊天室', color: 'bg-purple-500' },
  { id: '4', name: '系统', color: 'bg-orange-500' },
  { id: '5', name: '交易', color: 'bg-red-500' }
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
  },
  {
    id: '4',
    title: '数据导出功能偶现失败',
    description: '用户在导出大量数据时，偶尔会出现导出失败的情况',
    priority: '中',
    status: '待处理',
    assignee: mockUsers[1],
    reporter: mockUsers[5],
    project: mockProjects[2],
    requirement: mockRequirements[2],
    reproductionSteps: '1. 选择大量数据（超过1000条）\n2. 点击导出按钮\n3. 等待导出完成',
    expectedResult: '成功导出所有选中的数据',
    actualResult: '约30%的概率导出失败，提示"网络错误"',
    environment: 'Chrome 120.0, Windows 10, 分辨率1366x768',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
    tags: ['数据导出', '性能', '稳定性']
  }
];

const statusLabels = {
  '待处理': { label: '待处理', variant: 'secondary' as const, icon: Clock, color: 'text-gray-500' },
  '处理中': { label: '处理中', variant: 'default' as const, icon: Target, color: 'text-blue-500' },
  '待测试': { label: '待测试', variant: 'outline' as const, icon: CheckCircle, color: 'text-orange-500' },
  '已解决': { label: '已解决', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-500' },
  '已关闭': { label: '已关闭', variant: 'outline' as const, icon: XCircle, color: 'text-gray-400' },
  '重新打开': { label: '重新打开', variant: 'destructive' as const, icon: RotateCcw, color: 'text-red-500' }
};

const priorityConfig = {
  '低': { icon: ArrowDown, label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { icon: Minus, label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { icon: ArrowUp, label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { icon: AlertTriangle, label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

interface BugsPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function BugsPage({ context, onNavigate }: BugsPageProps = {}) {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'edit' | 'view'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterReporter, setFilterReporter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState('none');
  const [selectedBugs, setSelectedBugs] = useState<string[]>([]);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [editingBug, setEditingBug] = useState<Partial<Bug>>({
    title: '',
    description: '',
    priority: '中',
    status: '待处理',
    assignee: mockUsers[0],
    reporter: mockUsers[5],
    project: mockProjects[0],
    reproductionSteps: '',
    expectedResult: '',
    actualResult: '',
    environment: '',
    tags: []
  });
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导航上下文
  useEffect(() => {
    if (context?.filterRequirementId) {
      // 根据需求ID筛选相关的Bug
      const filteredByRequirement = bugs.filter(bug => 
        bug.requirement?.id === context.filterRequirementId
      );
      
      if (filteredByRequirement.length === 0) {
        // 如果没有相关Bug，显示空状态并预填充一个新Bug
        setEditingBug({
          title: `${context.requirementTitle || '需求'} - 测试问题`,
          description: '',
          priority: '中',
          status: '待处理',
          assignee: mockUsers[0],
          reporter: mockUsers[5],
          project: mockProjects[0],
          requirement: context.filterRequirementId ? { id: context.filterRequirementId, title: context.requirementTitle } : undefined,
          reproductionSteps: '',
          expectedResult: '',
          actualResult: '',
          environment: '',
          tags: []
        });
        setCurrentView('edit');
      }
    }
  }, [context, bugs]);

  // 筛选和排序逻辑
  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bug.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || bug.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || bug.assignee.id === filterAssignee;
    const matchesProject = filterProject === 'all' || bug.project.id === filterProject;
    const matchesReporter = filterReporter === 'all' || bug.reporter.id === filterReporter;
    const matchesRequirement = !context?.filterRequirementId || bug.requirement?.id === context.filterRequirementId;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesProject && matchesReporter && matchesRequirement;
  });

  const sortedBugs = [...filteredBugs].sort((a, b) => {
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
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 分组逻辑
  const groupedBugs = () => {
    if (groupBy === 'none') {
      return { '全部Bug': sortedBugs };
    }
    
    const groups: { [key: string]: Bug[] } = {};
    
    sortedBugs.forEach(bug => {
      let groupKey = '';
      switch (groupBy) {
        case 'status':
          groupKey = bug.status;
          break;
        case 'priority':
          groupKey = bug.priority;
          break;
        case 'project':
          groupKey = bug.project.name;
          break;
        case 'assignee':
          groupKey = bug.assignee.name;
          break;
        default:
          groupKey = '未分组';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(bug);
    });
    
    return groups;
  };
  
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleCreateBug = () => {
    setEditingBug({
      title: '',
      description: '',
      priority: '中',
      status: '待处理',
      assignee: mockUsers[0],
      reporter: mockUsers[5],
      project: mockProjects[0],
      reproductionSteps: '',
      expectedResult: '',
      actualResult: '',
      environment: '',
      tags: []
    });
    setCurrentView('edit');
  };

  const handleViewBug = (bug: Bug) => {
    setSelectedBug(bug);
    setCurrentView('view');
  };

  const handleEditBug = (bug: Bug) => {
    setEditingBug(bug);
    setCurrentView('edit');
  };

  const handleSaveBug = () => {
    if (editingBug.id) {
      // 更新现有Bug
      setBugs(bugs.map(b => b.id === editingBug.id ? { 
        ...editingBug as Bug, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : b));
    } else {
      // 创建新Bug
      const newBug: Bug = {
        ...editingBug as Bug,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setBugs([newBug, ...bugs]);
    }
    setCurrentView('list');
  };

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo);
    } else {
      setCurrentView('list');
    }
  };

  const addTag = (tag: string) => {
    if (editingBug.tags && !editingBug.tags.includes(tag)) {
      setEditingBug({ ...editingBug, tags: [...editingBug.tags, tag] });
    } else if (!editingBug.tags) {
      setEditingBug({ ...editingBug, tags: [tag] });
    }
  };

  const removeTag = (tag: string) => {
    if (editingBug.tags) {
      setEditingBug({ ...editingBug, tags: editingBug.tags.filter(t => t !== tag) });
    }
  };

  const handleSelectBug = (bugId: string, checked: boolean) => {
    if (checked) {
      setSelectedBugs([...selectedBugs, bugId]);
    } else {
      setSelectedBugs(selectedBugs.filter(id => id !== bugId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBugs(sortedBugs.map(bug => bug.id));
    } else {
      setSelectedBugs([]);
    }
  };

  if (currentView === 'edit') {
    return <BugEditor 
      bug={editingBug}
      setBug={setEditingBug}
      onBack={handleBack}
      onSave={handleSaveBug}
      addTag={addTag}
      removeTag={removeTag}
      fileInputRef={fileInputRef}
    />;
  }

  if (currentView === 'view' && selectedBug) {
    return <BugDetailPanel 
      bug={selectedBug}
      onBack={handleBack}
      onEdit={() => handleEditBug(selectedBug)}
      bugs={bugs}
      setBugs={setBugs}
      isOpen={true}
      onClose={handleBack}
    />;
  }

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
                    <SelectItem value="重���打开">重新打开</SelectItem>
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
                          <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="处理人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有处理人</SelectItem>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterReporter} onValueChange={setFilterReporter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="报告人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有报告人</SelectItem>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* 分组和排序 */}
              <div className="flex items-center gap-2">
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="分组" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不分组</SelectItem>
                    <SelectItem value="status">按状态</SelectItem>
                    <SelectItem value="priority">按优先级</SelectItem>
                    <SelectItem value="project">按项目</SelectItem>
                    <SelectItem value="assignee">按处理人</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="h-4 w-4 mr-2" />
                      排序
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSortChange('title')}>
                      Bug标题 {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('priority')}>
                      优先级 {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
                      创建时间 {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('updatedAt')}>
                      更新时间 {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 批量操作 */}
              {selectedBugs.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">已选择 {selectedBugs.length} 项</span>
                  <Button variant="outline" size="sm">批量分配</Button>
                  <Button variant="outline" size="sm">批量关闭</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bug列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {Object.entries(groupedBugs()).map(([groupName, groupBugs]) => (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <div className="bg-muted/50 px-4 py-2 border-b border-border">
                    <h3 className="font-medium">{groupName} ({groupBugs.length})</h3>
                  </div>
                )}
                <Table>
                  {(groupBy === 'none' || groupName === Object.keys(groupedBugs())[0]) && (
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedBugs.length === sortedBugs.length && sortedBugs.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
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
                  )}
                  <TableBody>
                    {groupBugs.map((bug) => (
                      <TooltipProvider key={bug.id}>
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <Checkbox
                              checked={selectedBugs.includes(bug.id)}
                              onCheckedChange={(checked) => handleSelectBug(bug.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Bug className="h-4 w-4 text-red-500" />
                                  <p className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewBug(bug)}>
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
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {bug.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{bug.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${bug.project.color}`}></div>
                              <span className="text-sm truncate max-w-20">{bug.project.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate max-w-20">
                              {bug.requirement?.title || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {React.createElement(statusLabels[bug.status].icon, { 
                                className: `h-3 w-3 ${statusLabels[bug.status].color}` 
                              })}
                              <Badge variant={statusLabels[bug.status].variant}>
                                {statusLabels[bug.status].label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${priorityConfig[bug.priority].bg} ${priorityConfig[bug.priority].border}`}>
                              {React.createElement(priorityConfig[bug.priority].icon, { 
                                className: `h-3 w-3 ${priorityConfig[bug.priority].color}` 
                              })}
                              <span className="text-sm">{bug.priority}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={bug.assignee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {bug.assignee.name.slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm truncate max-w-20">{bug.assignee.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <p className="font-medium">{bug.assignee.name}</p>
                                  <p className="text-xs text-muted-foreground">{bug.assignee.role}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={bug.reporter.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {bug.reporter.name.slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm truncate max-w-20">{bug.reporter.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <p className="font-medium">{bug.reporter.name}</p>
                                  <p className="text-xs text-muted-foreground">{bug.reporter.role}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-sm">{bug.createdAt}</TableCell>
                          <TableCell className="text-sm">{bug.updatedAt}</TableCell>
                        </TableRow>
                      </TooltipProvider>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
          
          {sortedBugs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无Bug数据</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.values({filterStatus, filterPriority, filterProject, filterAssignee, filterReporter}).some(f => f !== 'all') 
                  ? '请尝试调整筛选条件' 
                  : '点击右上角"新建Bug"按钮报告第一个问题'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>共 {sortedBugs.length} 个Bug</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              待处理: {bugs.filter(b => b.status === '待处理').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              处理中: {bugs.filter(b => b.status === '处理中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              待测试: {bugs.filter(b => b.status === '待测试').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              已解决: {bugs.filter(b => b.status === '已解决').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bug编辑器组件
function BugEditor({ 
  bug, 
  setBug, 
  onBack, 
  onSave, 
  addTag, 
  removeTag,
  fileInputRef 
}: {
  bug: Partial<Bug>;
  setBug: (bug: Partial<Bug>) => void;
  onBack: () => void;
  onSave: () => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {bug.id ? '编辑Bug' : '新建Bug'}
            </h1>
            <p className="text-muted-foreground">
              {bug.id ? `编辑 ${bug.title}` : '报告新的问题或缺陷'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要编辑区域 */}
        <div className="col-span-8 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Bug标题 *</Label>
                <Input
                  id="title"
                  value={bug.title || ''}
                  onChange={(e) => setBug({ ...bug, title: e.target.value })}
                  placeholder="简洁描述发现的问题"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Bug描述</Label>
                <Textarea
                  id="description"
                  value={bug.description || ''}
                  onChange={(e) => setBug({ ...bug, description: e.target.value })}
                  placeholder="详细描述问题现象和影响"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>所属项目 *</Label>
                  <Select 
                    value={bug.project?.id || ''} 
                    onValueChange={(value) => {
                      const project = mockProjects.find(p => p.id === value);
                      setBug({ ...bug, project });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择项目" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>所属需求</Label>
                  <Select 
                    value={bug.requirement?.id || ''} 
                    onValueChange={(value) => {
                      const requirement = mockRequirements.find(r => r.id === value);
                      setBug({ ...bug, requirement });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择相关需求" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">无关联需求</SelectItem>
                      {mockRequirements.map(requirement => (
                        <SelectItem key={requirement.id} value={requirement.id}>
                          {requirement.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>处理人 *</Label>
                  <Select 
                    value={bug.assignee?.id || ''} 
                    onValueChange={(value) => {
                      const assignee = mockUsers.find(u => u.id === value);
                      setBug({ ...bug, assignee });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择处理人" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>报告人 *</Label>
                  <Select 
                    value={bug.reporter?.id || ''} 
                    onValueChange={(value) => {
                      const reporter = mockUsers.find(u => u.id === value);
                      setBug({ ...bug, reporter });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择报告人" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>状态</Label>
                  <Select 
                    value={bug.status || '待处理'} 
                    onValueChange={(value: any) => setBug({ ...bug, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="待处理">待处理</SelectItem>
                      <SelectItem value="处理中">处理中</SelectItem>
                      <SelectItem value="待测试">待测试</SelectItem>
                      <SelectItem value="已解决">已解决</SelectItem>
                      <SelectItem value="已关闭">已关闭</SelectItem>
                      <SelectItem value="重新打开">重新打开</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>优先级</Label>
                  <Select 
                    value={bug.priority || '中'} 
                    onValueChange={(value: any) => setBug({ ...bug, priority: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="低">低</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="紧急">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 详细信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                详细信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reproductionSteps">复现步骤</Label>
                <Textarea
                  id="reproductionSteps"
                  value={bug.reproductionSteps || ''}
                  onChange={(e) => setBug({ ...bug, reproductionSteps: e.target.value })}
                  placeholder="请详细描述如何重现这个问题的步骤"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedResult">预期结果</Label>
                  <Textarea
                    id="expectedResult"
                    value={bug.expectedResult || ''}
                    onChange={(e) => setBug({ ...bug, expectedResult: e.target.value })}
                    placeholder="描述预期的正确行为"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="actualResult">实际结果</Label>
                  <Textarea
                    id="actualResult"
                    value={bug.actualResult || ''}
                    onChange={(e) => setBug({ ...bug, actualResult: e.target.value })}
                    placeholder="描述实际观察到的错误行为"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="environment">测试环境</Label>
                <Textarea
                  id="environment"
                  value={bug.environment || ''}
                  onChange={(e) => setBug({ ...bug, environment: e.target.value })}
                  placeholder="操作系统、浏览器、设备型号、版本等环境信息"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-6">
          {/* 标签管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {bug.tags && bug.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {bug.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 附件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">附件</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                上传截图或日志
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.txt,.log,.pdf"
                className="hidden"
                onChange={(e) => {
                  // 处理文件上传
                  console.log('上传文件:', e.target.files);
                }}
              />
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                设置为模板
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                设置到��时间
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}