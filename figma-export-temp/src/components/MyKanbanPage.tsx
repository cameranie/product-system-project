import React, { useState } from 'react';
import { 
  Plus,
  MoreHorizontal,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Code,
  TestTube,
  Palette,
  ClipboardCheck,
  GripVertical
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner@2.0.3";

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  dueDate: string;
  project: {
    id: string;
    name: string;
    color: string;
  };
  tags: string[];
  // 不同身份对应的状态
  reviewStatus: '待评审' | '评审通过' | '评审不通过';
  developStatus: '待开发' | '开发中' | '已完成';
  testStatus: '待测试' | '测试中' | '测试通过' | '测试不通过';
  designStatus: '待设计' | '设计中' | '设计完成';
}

interface MyKanbanPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

type RoleType = 'reviewer' | 'developer' | 'tester' | 'designer';

const mockUser: User = {
  id: 'current-user',
  name: '张三',
  avatar: '/avatars/zhangsan.jpg',
  email: 'zhangsan@example.com'
};

const mockProjects = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'K线图实时更新优化',
    description: '优化K线图的实时数据更新机制，提升响应速度',
    type: 'K线',
    priority: '高',
    assignee: mockUser,
    dueDate: '2024-01-25',
    project: mockProjects[0],
    tags: ['性能优化', '前端'],
    reviewStatus: '待评审',
    developStatus: '开发中',
    testStatus: '待测试',
    designStatus: '设计完成'
  },
  {
    id: '2',
    title: '行情推送服务升级',
    description: '升级行情推送服务架构，支持更高并发量',
    type: '行情',
    priority: '高',
    assignee: mockUser,
    dueDate: '2024-01-30',
    project: mockProjects[1],
    tags: ['架构', '后端'],
    reviewStatus: '评审通过',
    developStatus: '已完成',
    testStatus: '测试中',
    designStatus: '设计完成'
  },
  {
    id: '3',
    title: '聊天室表情包功能',
    description: '为聊天室添加表情包功能，提升用户体验',
    type: '聊天室',
    priority: '中',
    assignee: mockUser,
    dueDate: '2024-02-05',
    project: mockProjects[2],
    tags: ['用户体验', '功能'],
    reviewStatus: '待评审',
    developStatus: '待开发',
    testStatus: '待测试',
    designStatus: '待设计'
  },
  {
    id: '4',
    title: '系统权限管理优化',
    description: '优化系统权限管理模块，增强安全性',
    type: '系统',
    priority: '高',
    assignee: mockUser,
    dueDate: '2024-02-01',
    project: mockProjects[3],
    tags: ['权限', '安全'],
    reviewStatus: '评审通过',
    developStatus: '已完成',
    testStatus: '测试通过',
    designStatus: '设计完成'
  },
  {
    id: '5',
    title: '交易界面重构',
    description: '重构交易界面，提升用户操作体验',
    type: '交易',
    priority: '紧急',
    assignee: mockUser,
    dueDate: '2024-01-28',
    project: mockProjects[4],
    tags: ['UI重构', '交互'],
    reviewStatus: '评审不通过',
    developStatus: '待开发',
    testStatus: '待测试',
    designStatus: '设计中'
  },
  {
    id: '6',
    title: '移动端适配优化',
    description: '优化移动端页面适配效果',
    type: 'K线',
    priority: '中',
    assignee: mockUser,
    dueDate: '2024-02-10',
    project: mockProjects[0],
    tags: ['移动端', '响应式'],
    reviewStatus: '待评审',
    developStatus: '开发中',
    testStatus: '待测试',
    designStatus: '设计完成'
  }
];

// 角色配置
const roleConfigs: Record<RoleType, {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  statusField: keyof Task;
  columns: ColumnType[];
}> = {
  reviewer: {
    title: '评审人员',
    icon: ClipboardCheck,
    statusField: 'reviewStatus',
    columns: [
      { id: 'pending', title: '待评审', status: '待评审', color: 'bg-yellow-50 border-yellow-200' },
      { id: 'approved', title: '评审通过', status: '评审通过', color: 'bg-green-50 border-green-200' },
      { id: 'rejected', title: '评审不通过', status: '评审不通过', color: 'bg-red-50 border-red-200' }
    ]
  },
  developer: {
    title: '技术人员',
    icon: Code,
    statusField: 'developStatus',
    columns: [
      { id: 'todo', title: '待开发', status: '待开发', color: 'bg-gray-50 border-gray-200' },
      { id: 'developing', title: '开发中', status: '开发中', color: 'bg-blue-50 border-blue-200' },
      { id: 'completed', title: '已完成', status: '已完成', color: 'bg-green-50 border-green-200' }
    ]
  },
  tester: {
    title: '测试人员',
    icon: TestTube,
    statusField: 'testStatus',
    columns: [
      { id: 'pending', title: '待测试', status: '待测试', color: 'bg-gray-50 border-gray-200' },
      { id: 'testing', title: '测试中', status: '测试中', color: 'bg-blue-50 border-blue-200' },
      { id: 'passed', title: '测试通过', status: '测试通过', color: 'bg-green-50 border-green-200' },
      { id: 'failed', title: '测试不通过', status: '测试不通过', color: 'bg-red-50 border-red-200' }
    ]
  },
  designer: {
    title: '设计师',
    icon: Palette,
    statusField: 'designStatus',
    columns: [
      { id: 'pending', title: '待设计', status: '待设计', color: 'bg-gray-50 border-gray-200' },
      { id: 'designing', title: '设计中', status: '设计中', color: 'bg-blue-50 border-blue-200' },
      { id: 'completed', title: '设计完成', status: '设计完成', color: 'bg-green-50 border-green-200' }
    ]
  }
};

// Helper function for checking completed status - defined outside component to avoid re-creation
const isCompletedStatus = (task: Task, role: RoleType) => {
  const config = roleConfigs[role];
  const status = task[config.statusField] as string;
  const completedStatuses = ['评审通过', '已完成', '测试通过', '设计完成'];
  return completedStatuses.includes(status);
};

const TaskCard: React.FC<{ 
  task: Task; 
  role: RoleType;
  onNavigate?: (page: string, context?: any) => void;
  onStatusChange?: (taskId: string, newStatus: string, role: RoleType) => void;
}> = ({ task, role, onNavigate, onStatusChange }) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate('requirement-detail', { 
        requirementId: task.id,
        source: 'my-kanban' 
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '紧急': return 'destructive';
      case '高': return 'default';
      case '中': return 'secondary';
      case '低': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'K线': return 'bg-blue-500';
      case '行情': return 'bg-green-500';
      case '聊天室': return 'bg-yellow-500';
      case '系统': return 'bg-red-500';
      case '交易': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !isCompletedStatus(task, role);

  // 拖拽配置
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, task, role },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={drag}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow mb-3 border"
        onClick={handleClick}
      >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 标题和优先级 */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium leading-tight line-clamp-2 flex-1">
              {task.title}
            </h4>
            <Badge variant={getPriorityColor(task.priority)} className="text-xs flex-shrink-0">
              {task.priority}
            </Badge>
          </div>




        </div>
      </CardContent>
    </Card>
    </div>
  );
};

interface ColumnType {
  id: string;
  title: string;
  status: string;
  color: string;
}

const KanbanColumn: React.FC<{ 
  column: ColumnType; 
  tasks: Task[];
  role: RoleType;
  onNavigate?: (page: string, context?: any) => void;
  onStatusChange?: (taskId: string, newStatus: string, role: RoleType) => void;
}> = ({ column, tasks, role, onNavigate, onStatusChange }) => {
  // 拖拽放置配置
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string; task: Task; role: RoleType }) => {
      if (item.role === role && onStatusChange) {
        onStatusChange(item.id, column.status, role);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex-1 min-w-0">
      <div 
        ref={drop}
        className={`h-full transition-all duration-200 ${
          isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        }`}
      >
        <Card 
          className={`h-full border-2 transition-all duration-200 ${column.color} ${
            isOver ? 'border-blue-400 bg-blue-50 shadow-lg' : ''
          }`}
        >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {column.title}
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                role={role} 
                onNavigate={onNavigate}
                onStatusChange={onStatusChange} 
              />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">暂无任务</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

const RoleKanban: React.FC<{
  role: RoleType;
  tasks: Task[];
  onNavigate?: (page: string, context?: any) => void;
  onStatusChange?: (taskId: string, newStatus: string, role: RoleType) => void;
}> = ({ role, tasks, onNavigate, onStatusChange }) => {
  const config = roleConfigs[role];
  
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task[config.statusField] === status);
  };

  const getStatusStats = () => {
    const stats: Record<string, number> = {};
    config.columns.forEach(column => {
      stats[column.id] = getTasksByStatus(column.status).length;
    });
    stats.total = tasks.length;
    stats.overdue = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && 
      !['评审通过', '已完成', '测试通过', '设计完成'].includes(t[config.statusField] as string)
    ).length;
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <Label className="text-xs text-muted-foreground">总任务</Label>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>

        {config.columns.slice(0, 4).map((column, index) => (
          <Card key={column.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${column.color.includes('red') ? 'bg-red-500' : 
                  column.color.includes('green') ? 'bg-green-500' :
                  column.color.includes('blue') ? 'bg-blue-500' :
                  column.color.includes('yellow') ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                <Label className="text-xs text-muted-foreground">{column.title}</Label>
              </div>
              <div className="text-2xl font-bold mt-1">{stats[column.id] || 0}</div>
            </CardContent>
          </Card>
        ))}


      </div>

      {/* 看板列 */}
      <div className="flex gap-6 h-[calc(100vh-350px)] overflow-x-auto">
        {config.columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.status)}
            role={role}
            onNavigate={onNavigate}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export function MyKanbanPage({ onNavigate }: MyKanbanPageProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentRole, setCurrentRole] = useState<RoleType>('reviewer');

  // 处理状态变更
  const handleStatusChange = (taskId: string, newStatus: string, role: RoleType) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const config = roleConfigs[role];
          return {
            ...task,
            [config.statusField]: newStatus
          };
        }
        return task;
      })
    );
    
    // 显示成功提示
    toast.success(`任务状态已更新为: ${newStatus}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的看板</h1>
          <p className="text-muted-foreground mt-1">
            按照不同身份查看相关任务的看板视图
          </p>
        </div>
        <div className="flex items-center gap-2">

        </div>
      </div>

      {/* 我负责的按钮 */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => onNavigate?.('my-assigned')}>
          <User className="h-4 w-4 mr-2" />
          我负责的
        </Button>
      </div>

      {/* 身份切换标签 */}
      <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as RoleType)}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(roleConfigs).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {config.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(roleConfigs).map(([key]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <RoleKanban
              role={key as RoleType}
              tasks={tasks}
              onNavigate={onNavigate}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </DndProvider>
  );
}