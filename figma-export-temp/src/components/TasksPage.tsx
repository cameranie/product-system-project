import React, { useState, useRef } from 'react';
import { 
  List, 
  LayoutDashboard, 
  BarChart3, 
  Calendar, 
  Plus,
  Search,
  Filter,
  SortAsc,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Tag,
  Paperclip,
  AlertTriangle,
  Target,
  FileText,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { TaskDetailPanel } from './TaskDetailPanel';

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

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: User;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: '待开始' | '进行中' | '已完成' | '已取消';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  project: Project;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  tags?: string[];
  attachments?: Attachment[];
  subTasks?: SubTask[];
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: 'bg-blue-500' },
  { id: '2', name: '行情', color: 'bg-green-500' },
  { id: '3', name: '聊天室', color: 'bg-purple-500' },
  { id: '4', name: '系统', color: 'bg-orange-500' },
  { id: '5', name: '交易', color: 'bg-red-500' }
];

const mockTasks: TaskItem[] = [
  {
    id: '1',
    title: '用户登录页面开发',
    description: '开发用户登录页面，包括账号密码登录、短信验证码登录、第三方登录等功能',
    status: '进行中',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    project: mockProjects[0],
    dueDate: '2024-01-20',
    createdAt: '2024-01-15 09:30',
    updatedAt: '2024-01-16 14:45',
    progress: 60,
    tags: ['前端', 'React', '登录'],
    subTasks: [
      { id: 's1', title: '设计登录界面', completed: true, assignee: mockUsers[2] },
      { id: 's2', title: '实现账号密码登录', completed: true, assignee: mockUsers[0] },
      { id: 's3', title: '实现验证码登录', completed: false, assignee: mockUsers[0] },
      { id: 's4', title: '接入第三方登录', completed: false, assignee: mockUsers[0] }
    ]
  },
  {
    id: '2',
    title: '支付接口对接',
    description: '对接微信支付、支付宝支付接口，实现订单支付功能',
    status: '待开始',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    project: mockProjects[1],
    dueDate: '2024-01-25',
    createdAt: '2024-01-14 16:20',
    updatedAt: '2024-01-15 11:15',
    progress: 0,
    tags: ['后端', '支付', 'API'],
    subTasks: [
      { id: 's5', title: '接入微信支付', completed: false, assignee: mockUsers[1] },
      { id: 's6', title: '接入支付宝支付', completed: false, assignee: mockUsers[1] },
      { id: 's7', title: '支付回调处理', completed: false, assignee: mockUsers[1] }
    ]
  },
  {
    id: '3',
    title: '数据库设计',
    description: '设计用户系统相关数据库表结构',
    status: '已完成',
    priority: '高',
    assignee: mockUsers[3],
    creator: mockUsers[5],
    project: mockProjects[0],
    dueDate: '2024-01-18',
    createdAt: '2024-01-10 08:00',
    updatedAt: '2024-01-18 17:30',
    progress: 100,
    tags: ['数据库', '设计', 'MySQL'],
    subTasks: [
      { id: 's8', title: '用户表设计', completed: true, assignee: mockUsers[3] },
      { id: 's9', title: '权限表设计', completed: true, assignee: mockUsers[3] },
      { id: 's10', title: '日志表设计', completed: true, assignee: mockUsers[3] }
    ]
  },
  {
    id: '4',
    title: 'UI组件库开发',
    description: '开发公共UI组件库，提供统一的设计规范和组件',
    status: '进行中',
    priority: '中',
    assignee: mockUsers[2],
    creator: mockUsers[5],
    project: mockProjects[0],
    dueDate: '2024-02-01',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-16',
    progress: 30,
    tags: ['UI', '组件', 'Design System']
  }
];

const statusLabels = {
  '待开始': { label: '待开始', variant: 'secondary' as const, icon: Clock, color: 'text-gray-500' },
  '进行中': { label: '进行中', variant: 'default' as const, icon: Target, color: 'text-blue-500' },
  '已完成': { label: '已完成', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-500' },
  '已取消': { label: '已取消', variant: 'destructive' as const, icon: XCircle, color: 'text-red-500' }
};

const priorityConfig = {
  '低': { icon: ArrowDown, label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { icon: Minus, label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { icon: ArrowUp, label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { icon: AlertTriangle, label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

export function TasksPage() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'edit' | 'view'
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'gantt' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState('none');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<TaskItem>>({
    title: '',
    description: '',
    status: '待开始',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    project: mockProjects[0],
    dueDate: '',
    tags: [],
    subTasks: []
  });
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 筛选和排序逻辑
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.project.id === filterProject;
    const matchesAssignee = filterAssignee === 'all' || task.assignee.id === filterAssignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'dueDate':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
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
        aValue = a.dueDate;
        bValue = b.dueDate;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 分组逻辑
  const groupedTasks = () => {
    if (groupBy === 'none') {
      return { '全部任务': sortedTasks };
    }
    
    const groups: { [key: string]: TaskItem[] } = {};
    
    sortedTasks.forEach(task => {
      let groupKey = '';
      switch (groupBy) {
        case 'status':
          groupKey = task.status;
          break;
        case 'priority':
          groupKey = task.priority;
          break;
        case 'project':
          groupKey = task.project.name;
          break;
        case 'assignee':
          groupKey = task.assignee.name;
          break;
        default:
          groupKey = '未分组';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
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

  const handleCreateTask = () => {
    setEditingTask({
      title: '',
      description: '',
      status: '待开始',
      priority: '中',
      assignee: mockUsers[0],
      creator: mockUsers[5],
      project: mockProjects[0],
      dueDate: '',
      tags: [],
      subTasks: []
    });
    setCurrentView('edit');
  };

  const handleViewTask = (task: TaskItem) => {
    setSelectedTask(task);
    setCurrentView('view');
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setCurrentView('edit');
  };

  const handleSaveTask = () => {
    if (editingTask.id) {
      // 更新现有任务
      setTasks(tasks.map(t => t.id === editingTask.id ? { 
        ...editingTask as TaskItem, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : t));
    } else {
      // 创建新任务
      const newTask: TaskItem = {
        ...editingTask as TaskItem,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        progress: 0,
        subTasks: editingTask.subTasks || []
      };
      setTasks([newTask, ...tasks]);
    }
    setCurrentView('list');
  };

  const addTag = (tag: string) => {
    if (editingTask.tags && !editingTask.tags.includes(tag)) {
      setEditingTask({ ...editingTask, tags: [...editingTask.tags, tag] });
    } else if (!editingTask.tags) {
      setEditingTask({ ...editingTask, tags: [tag] });
    }
  };

  const removeTag = (tag: string) => {
    if (editingTask.tags) {
      setEditingTask({ ...editingTask, tags: editingTask.tags.filter(t => t !== tag) });
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(sortedTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  if (currentView === 'edit') {
    return <TaskEditor 
      task={editingTask}
      setTask={setEditingTask}
      onBack={() => setCurrentView('list')}
      onSave={handleSaveTask}
      addTag={addTag}
      removeTag={removeTag}
      fileInputRef={fileInputRef}
    />;
  }

  if (currentView === 'view' && selectedTask) {
    return <TaskDetailPanel 
      task={selectedTask}
      onBack={() => setCurrentView('list')}
      onEdit={() => handleEditTask(selectedTask)}
      tasks={tasks}
      setTasks={setTasks}
      isOpen={true}
      onClose={() => setCurrentView('list')}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">任务管理</h1>
          <p className="text-muted-foreground mt-1">管理项目任务和跟踪进度</p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          新建任务
        </Button>
      </div>

      {/* 筛选和操作栏 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 视图切换和工具栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  列表
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('board')}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  看板
                </Button>
                <Button
                  variant={viewMode === 'gantt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('gantt')}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  甘特图
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  日历
                </Button>
              </div>

              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索任务标题、描述..."
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
                    <SelectItem value="待开始">待开始</SelectItem>
                    <SelectItem value="进行中">进行中</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                    <SelectItem value="已取消">已取消</SelectItem>
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
                    <SelectValue placeholder="负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有人员</SelectItem>
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
                    <SelectItem value="assignee">按负责人</SelectItem>
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
                      任务标题 {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('dueDate')}>
                      截止时间 {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
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
              {selectedTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">已选择 {selectedTasks.length} 项</span>
                  <Button variant="outline" size="sm">批量编辑</Button>
                  <Button variant="outline" size="sm">移动项目</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 任务列表 */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              {Object.entries(groupedTasks()).map(([groupName, groupTasks]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && (
                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                      <h3 className="font-medium">{groupName} ({groupTasks.length})</h3>
                    </div>
                  )}
                  <Table>
                    {(groupBy === 'none' || groupName === Object.keys(groupedTasks())[0]) && (
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedTasks.length === sortedTasks.length && sortedTasks.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="min-w-[300px]">任务标题</TableHead>
                          <TableHead className="w-32">所属项目</TableHead>
                          <TableHead className="w-32">状态</TableHead>
                          <TableHead className="w-32">优先级</TableHead>
                          <TableHead className="w-36">负责人</TableHead>
                          <TableHead className="w-36">创建人</TableHead>
                          <TableHead className="w-28">截止时间</TableHead>
                          <TableHead className="w-28">创建时间</TableHead>
                          <TableHead className="w-28">更新时间</TableHead>
                        </TableRow>
                      </TableHeader>
                    )}
                    <TableBody>
                      {groupTasks.map((task) => (
                        <TooltipProvider key={task.id}>
                          <TableRow className="hover:bg-muted/30">
                            <TableCell>
                              <Checkbox
                                checked={selectedTasks.includes(task.id)}
                                onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewTask(task)}>
                                      {task.title}
                                    </p>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
                                      {task.description.split('\n')[0]}
                                    </p>
                                  )}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {task.tags.slice(0, 2).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {task.tags.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{task.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Progress value={task.progress} className="flex-1 h-2 max-w-20" />
                                    <span className="text-xs text-muted-foreground">
                                      {task.progress}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${task.project.color}`}></div>
                                <span className="text-sm truncate max-w-20">{task.project.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {React.createElement(statusLabels[task.status].icon, { 
                                  className: `h-3 w-3 ${statusLabels[task.status].color}` 
                                })}
                                <Badge variant={statusLabels[task.status].variant}>
                                  {statusLabels[task.status].label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].border}`}>
                                {React.createElement(priorityConfig[task.priority].icon, { 
                                  className: `h-3 w-3 ${priorityConfig[task.priority].color}` 
                                })}
                                <span className="text-sm">{task.priority}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2 cursor-pointer">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {task.assignee.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm truncate max-w-20">{task.assignee.name}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <p className="font-medium">{task.assignee.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.assignee.role}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2 cursor-pointer">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={task.creator.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {task.creator.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm truncate max-w-20">{task.creator.name}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <p className="font-medium">{task.creator.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.creator.role}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-sm">{task.dueDate}</TableCell>
                            <TableCell className="text-sm">{task.createdAt}</TableCell>
                            <TableCell className="text-sm">{task.updatedAt}</TableCell>
                          </TableRow>
                        </TooltipProvider>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          
          {sortedTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无任务数据</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.values({filterStatus, filterPriority, filterProject, filterAssignee}).some(f => f !== 'all') 
                  ? '请尝试调整筛选条件' 
                  : '点击右上角"新建任务"按钮创建第一个任务'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>共 {sortedTasks.length} 个任务</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              待开始: {tasks.filter(t => t.status === '待开始').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              进行中: {tasks.filter(t => t.status === '进行中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              已完成: {tasks.filter(t => t.status === '已完成').length}
            </span>
          </div>
        </div>
      </div>

      {/* 其他视图模式 */}
      <Card style={{ display: viewMode === 'list' ? 'none' : 'block' }}>
        <CardContent className="p-6">
          {viewMode === 'board' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-6">
                {/* 待开始列 */}
                <div>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                    <span className="font-medium">待开始</span>
                  </div>
                  <div className="space-y-3">
                    <div 
                      className="p-4 bg-white border border-border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewTask(tasks[1])}
                    >
                      <h4 className="font-medium mb-2">支付接口对接</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">李四</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">李四</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span className="text-sm">01-25</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">中</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 进行中列 */}
                <div>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span className="font-medium">进行中</span>
                  </div>
                  <div className="space-y-3">
                    <div 
                      className="p-4 bg-white border border-border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewTask(tasks[0])}
                    >
                      <h4 className="font-medium mb-2">用户登录开发</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">张三</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">张三</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span className="text-sm">01-20</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">高</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 已完成列 */}
                <div>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="font-medium">已完成</span>
                  </div>
                  <div className="space-y-3">
                    <div 
                      className="p-4 bg-white border border-border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewTask(tasks[2])}
                    >
                      <h4 className="font-medium mb-2">数据库设计</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">王五</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">王五</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">01-18</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">高</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 已取消列 */}
                <div>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="font-medium">已取消</span>
                  </div>
                  <div className="space-y-3">
                    <div 
                      className="p-4 bg-white border border-border rounded-lg shadow-sm opacity-60 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => console.log('Cancelled task clicked')}
                    >
                      <h4 className="font-medium mb-2">旧功能重构</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">赵六</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">赵六</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">已取消</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">低</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'gantt' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* 甘特图表头 */}
                  <div className="flex border-b border-border">
                    <div className="w-48 p-3 font-medium bg-gray-50">任务名称</div>
                    <div className="flex-1 flex">
                      <div className="flex-1 p-3 text-center font-medium bg-gray-50 border-l border-border">1月15日</div>
                      <div className="flex-1 p-3 text-center font-medium bg-gray-50 border-l border-border">1月20日</div>
                      <div className="flex-1 p-3 text-center font-medium bg-gray-50 border-l border-border">1月25日</div>
                      <div className="flex-1 p-3 text-center font-medium bg-gray-50 border-l border-border">1月30日</div>
                    </div>
                  </div>

                  {/* 甘特图内容 */}
                  <div className="space-y-0">
                    {/* 需求分析 */}
                    <div className="flex border-b border-border hover:bg-gray-50">
                      <div className="w-48 p-3">需求分析</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-2 bg-blue-500 rounded"></div>
                        </div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                      </div>
                    </div>

                    {/* 原型设计 */}
                    <div className="flex border-b border-border hover:bg-gray-50">
                      <div className="w-48 p-3">原型设计</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-2 bg-green-500 rounded"></div>
                        </div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-green-500 rounded"></div>
                        </div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                      </div>
                    </div>

                    {/* UI设计 */}
                    <div className="flex border-b border-border hover:bg-gray-50">
                      <div className="w-48 p-3">UI设计</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-2 bg-orange-500 rounded"></div>
                        </div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                      </div>
                    </div>

                    {/* 前端开发 */}
                    <div className="flex border-b border-border hover:bg-gray-50">
                      <div className="w-48 p-3">前端开发</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-2 bg-purple-500 rounded"></div>
                        </div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                      </div>
                    </div>

                    {/* 后端开发 */}
                    <div className="flex border-b border-border hover:bg-gray-50">
                      <div className="w-48 p-3">后端开发</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-6 h-2 bg-indigo-500 rounded"></div>
                        </div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-indigo-500 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* 测试 */}
                    <div className="flex border-b border-border hover:bg-gray-50">
                      <div className="w-48 p-3">测试</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-2 bg-red-500 rounded"></div>
                          <div className="absolute left-10 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-red-500 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* 上线部署 */}
                    <div className="flex hover:bg-gray-50">
                      <div className="w-48 p-3">上线部署</div>
                      <div className="flex-1 flex relative">
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border"></div>
                        <div className="flex-1 p-3 border-l border-border relative">
                          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-2 bg-cyan-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="text-center py-8 text-muted-foreground">
              <p>日历视图开发中...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 任务编辑器组件
function TaskEditor({ 
  task, 
  setTask, 
  onBack, 
  onSave, 
  addTag, 
  removeTag,
  fileInputRef 
}: {
  task: Partial<TaskItem>;
  setTask: (task: Partial<TaskItem>) => void;
  onBack: () => void;
  onSave: () => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [newTag, setNewTag] = useState('');
  const [newSubTask, setNewSubTask] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      const subTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTask.trim(),
        completed: false,
        assignee: task.assignee
      };
      setTask({ 
        ...task, 
        subTasks: [...(task.subTasks || []), subTask] 
      });
      setNewSubTask('');
    }
  };

  const handleRemoveSubTask = (subTaskId: string) => {
    setTask({ 
      ...task, 
      subTasks: task.subTasks?.filter(st => st.id !== subTaskId) || [] 
    });
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
              {task.id ? '编辑任务' : '新建任务'}
            </h1>
            <p className="text-muted-foreground">
              {task.id ? `编辑 ${task.title}` : '创建新的开发任务'}
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
                <Target className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">任务标题 *</Label>
                <Input
                  id="title"
                  value={task.title || ''}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  placeholder="输入任务标题"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">任务描述</Label>
                <Textarea
                  id="description"
                  value={task.description || ''}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  placeholder="详细描述任务内容、要求和验收标准"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>所属项目 *</Label>
                  <Select 
                    value={task.project?.id || ''} 
                    onValueChange={(value) => {
                      const project = mockProjects.find(p => p.id === value);
                      setTask({ ...task, project });
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
                  <Label>负责人 *</Label>
                  <Select 
                    value={task.assignee?.id || ''} 
                    onValueChange={(value) => {
                      const assignee = mockUsers.find(u => u.id === value);
                      setTask({ ...task, assignee });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择负责人" />
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>状态</Label>
                  <Select 
                    value={task.status || '待开始'} 
                    onValueChange={(value: any) => setTask({ ...task, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="待开始">待开始</SelectItem>
                      <SelectItem value="进行中">进行中</SelectItem>
                      <SelectItem value="已完成">已完成</SelectItem>
                      <SelectItem value="已取消">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>优先级</Label>
                  <Select 
                    value={task.priority || '中'} 
                    onValueChange={(value: any) => setTask({ ...task, priority: value })}
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
                
                <div>
                  <Label>截止时间</Label>
                  <Input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 子任务管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                子任务
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  placeholder="输入子任务标题"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                />
                <Button onClick={handleAddSubTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {task.subTasks && task.subTasks.length > 0 && (
                <div className="space-y-2">
                  {task.subTasks.map(subTask => (
                    <div key={subTask.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={subTask.completed}
                        onCheckedChange={(checked) => {
                          setTask({
                            ...task,
                            subTasks: task.subTasks?.map(st => 
                              st.id === subTask.id ? { ...st, completed: checked as boolean } : st
                            )
                          });
                        }}
                      />
                      <span className={`flex-1 ${subTask.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subTask.title}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveSubTask(subTask.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map(tag => (
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
                <Paperclip className="h-4 w-4 mr-2" />
                上传附件
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  // 处理文件上传
                  console.log('上传文件:', e.target.files);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}