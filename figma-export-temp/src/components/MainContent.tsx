import { useState } from 'react';
import { 
  List, 
  Kanban, 
  Calendar, 
  BarChart3, 
  Filter, 
  SortAsc, 
  MoreHorizontal,
  Plus,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { TaskItem, Task } from './TaskItem';
import { RightPanel } from './RightPanel';

// 模拟数据
const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成用户界面设计',
    description: '设计新版本的用户界面，包括主页和个人中心页面',
    status: 'in-progress',
    priority: 'high',
    assignee: { name: '张三', avatar: undefined },
    project: { name: '移动端应用开发', color: '#3b82f6' },
    dueDate: '2024-12-20',
    progress: 75,
    tags: ['设计', 'UI'],
    createdAt: '2024-12-10',
    updatedAt: '2024-12-15'
  },
  {
    id: '2',
    title: '后端API开发',
    description: '开发用户管理相关的API接口',
    status: 'todo',
    priority: 'medium',
    assignee: { name: '李四', avatar: undefined },
    project: { name: '网站重构项目', color: '#10b981' },
    dueDate: '2024-12-25',
    progress: 0,
    tags: ['开发', 'API'],
    createdAt: '2024-12-12',
    updatedAt: '2024-12-12'
  },
  {
    id: '3',
    title: '数据库优化',
    description: '优化查询性能，添加必要的索引',
    status: 'completed',
    priority: 'urgent',
    assignee: { name: '王五', avatar: undefined },
    project: { name: '系统性能优化', color: '#f59e0b' },
    dueDate: '2024-12-18',
    progress: 100,
    tags: ['数据库', '性能'],
    createdAt: '2024-12-08',
    updatedAt: '2024-12-18'
  },
  {
    id: '4',
    title: '用户反馈收集',
    description: '收集并整理用户反馈，制定改进计划',
    status: 'todo',
    priority: 'low',
    assignee: { name: '赵六', avatar: undefined },
    project: { name: '用户体验优化', color: '#8b5cf6' },
    dueDate: '2024-12-15',
    progress: 25,
    tags: ['用户体验', '反馈'],
    createdAt: '2024-12-05',
    updatedAt: '2024-12-14'
  },
  {
    id: '5',
    title: '测试用例编写',
    description: '为新功能编写完整的测试用例',
    status: 'in-progress',
    priority: 'medium',
    assignee: { name: '孙七', avatar: undefined },
    project: { name: '移动端应用开发', color: '#3b82f6' },
    dueDate: '2024-12-22',
    progress: 40,
    tags: ['测试', '质量保证'],
    createdAt: '2024-12-11',
    updatedAt: '2024-12-16'
  }
];

export function MainContent() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentView, setCurrentView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 过滤和排序任务
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status, progress: status === 'completed' ? 100 : task.progress } : task
    ));
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
  };

  const handleCloseRightPanel = () => {
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${selectedTask ? 'mr-[400px]' : ''}`}>
        <div className="p-6">
        {/* 页面标题和操作区域 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">我的任务</h1>
            <p className="text-muted-foreground">
              共 {filteredTasks.length} 个任务，{filteredTasks.filter(t => t.status === 'completed').length} 个已完成
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            创建任务
          </Button>
        </div>

        {/* 视图切换和工具栏 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* 视图切换 */}
          <Tabs value={currentView} onValueChange={setCurrentView} className="w-full lg:w-auto">
            <TabsList className="grid w-full lg:w-auto grid-cols-4">
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">列表</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <Kanban className="h-4 w-4" />
                <span className="hidden sm:inline">看板</span>
              </TabsTrigger>
              <TabsTrigger value="gantt" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">甘特图</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">日历</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 搜索和筛选工具栏 */}
          <div className="flex flex-1 gap-2">
            {/* 搜索 */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛选 */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="todo">待处理</SelectItem>
                <SelectItem value="in-progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>

            {/* 优先级筛选 */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有优先级</SelectItem>
                <SelectItem value="urgent">紧急</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>

            {/* 排序 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">截止日期</SelectItem>
                <SelectItem value="priority">优先级</SelectItem>
                <SelectItem value="title">标题</SelectItem>
              </SelectContent>
            </Select>

            {/* 更多操作 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>批量编辑</DropdownMenuItem>
                <DropdownMenuItem>导出任务</DropdownMenuItem>
                <DropdownMenuItem>列设置</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="bg-card rounded-lg border shadow-sm">
          {/* 表头 */}
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="w-6"></div> {/* 复选框占位 */}
              <div className="flex-1">任务名称</div>
              <div className="w-16">优先级</div>
              <div className="w-24">项目</div>
              <div className="w-20">负责人</div>
              <div className="w-20">截止日期</div>
              <div className="w-10"></div> {/* 操作按钮占位 */}
            </div>
          </div>

          {/* 任务列表内容 */}
          <div>
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="mb-2">暂无任务</div>
                <p className="text-sm">尝试调整筛选条件或创建新任务</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onClick={handleEditTask}
                />
              ))
            )}
          </div>
          </div>
        </div>
      </div>
      
      {/* 右侧详情面板 */}
      <RightPanel 
        task={selectedTask}
        onClose={handleCloseRightPanel}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}