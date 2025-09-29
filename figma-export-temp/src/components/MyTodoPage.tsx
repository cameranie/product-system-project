import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Filter,
  User,
  Flag,
  ChevronRight,
  TrendingUp,
  Target,
  Timer,
  ChevronDown,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Input } from './ui/input';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Subtask {
  id: string;
  title: string;
  type: string;
  assignee?: User;
  status: '待开始' | '进行中' | '已完成';
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  startDate?: string;
  completedAt?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  priority: '低' | '中' | '高' | '紧急';
  status: '待开始' | '进行中' | '已上线';
  assignee: User;
  dueDate: string;
  createdAt: string;
  tags: string[];
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: Subtask[];
}

interface MyTodoPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

type FilterType = '全部' | '待完成' | '已完成' | '已逾期';

const mockUser: User = {
  id: 'current-user',
  name: '张三',
  avatar: '/avatars/zhangsan.jpg',
  email: 'zhangsan@example.com'
};

const mockTasks: Task[] = [
  // 今天的任务 - 对应版本需求管理中的数据
  {
    id: '1',
    title: '修复登录页面显示BUG',
    description: '修复登录页面在Safari浏览器下的显示异常，包括样式错位、按钮失效等问题。需要进行全面的兼容性测试。',
    type: '系统',
    priority: '紧急',
    status: '进行中',
    assignee: mockUser,
    dueDate: '2025-01-16',
    createdAt: '2025-01-15',
    tags: ['BUG修复', '前端', '兼容性'],
    estimatedHours: 17,
    actualHours: 8.25,
    subtasks: [
      {
        id: '1-subtask-1',
        title: '原型设计',
        type: '原型设计',
        status: '已完成',
        estimatedHours: 3,
        actualHours: 2.5,
        dueDate: '2025-01-15 12:00'
      },
      {
        id: '1-subtask-2',
        title: '视觉设计',
        type: '视觉设计',
        status: '已完成',
        estimatedHours: 3,
        actualHours: 2.75,
        dueDate: '2025-01-15 16:00'
      },
      {
        id: '1-subtask-3',
        title: '前端开发',
        type: '前端开发',
        assignee: mockUser,
        status: '进行中',
        estimatedHours: 5,
        actualHours: 3,
        dueDate: '2025-01-16 14:00'
      },
      {
        id: '1-subtask-4',
        title: '后端开发',
        type: '后端开发',
        status: '待开始',
        estimatedHours: 3,
        dueDate: '2025-01-16 13:00'
      },
      {
        id: '1-subtask-5',
        title: '测试',
        type: '测试',
        status: '待开始',
        estimatedHours: 2,
        dueDate: '2025-01-16 16:00'
      },
      {
        id: '1-subtask-6',
        title: '产品验收',
        type: '产品验收',
        status: '待开始',
        estimatedHours: 1,
        dueDate: '2025-01-16 17:00'
      }
    ]
  },
  {
    id: '2',
    title: 'K线图性能优化',
    description: '优化K线图组件的渲染性能，提升用户体验，减少大数据量下的卡顿现象。',
    type: 'K线',
    priority: '高',
    status: '待开始',
    assignee: mockUser,
    dueDate: '2025-01-16',
    createdAt: '2025-01-15',
    tags: ['性能优化', '前端', 'K线'],
    estimatedHours: 18,
    subtasks: [
      {
        id: '2-subtask-1',
        title: '原型设计',
        type: '原型设计',
        status: '待开始',
        estimatedHours: 2,
        dueDate: '2025-01-16 11:00'
      },
      {
        id: '2-subtask-2',
        title: '视觉设计',
        type: '视觉设计',
        status: '待开始',
        estimatedHours: 3,
        dueDate: '2025-01-16 15:00'
      },
      {
        id: '2-subtask-3',
        title: '前端开发',
        type: '前端开发',
        assignee: mockUser,
        status: '待开始',
        estimatedHours: 8,
        dueDate: '2025-01-16 17:00'
      }
    ]
  },
  // 已逾期任务
  {
    id: '3',
    title: '行情推送系统升级',
    description: '升级实时行情推送系统，支持更多数据源和更快的推送速度。',
    type: '行情',
    priority: '紧急',
    status: '进行中',
    assignee: mockUser,
    dueDate: '2025-01-14',
    createdAt: '2025-01-10',
    tags: ['系统升级', '实时数据', '性能'],
    estimatedHours: 20,
    actualHours: 8,
    subtasks: [
      {
        id: '3-subtask-1',
        title: '需求分析',
        type: '需求分析',
        status: '已完成',
        estimatedHours: 3,
        actualHours: 3,
        dueDate: '2025-01-12 17:00'
      },
      {
        id: '3-subtask-2',
        title: '架构设计',
        type: '架构设计',
        status: '已完成',
        estimatedHours: 4,
        actualHours: 5,
        dueDate: '2025-01-13 18:00'
      },
      {
        id: '3-subtask-3',
        title: '后端开发',
        type: '后端开发',
        assignee: mockUser,
        status: '进行中',
        estimatedHours: 8,
        actualHours: 3,
        dueDate: '2025-01-15 17:00'
      },
      {
        id: '3-subtask-4',
        title: '性能测试',
        type: '测试',
        status: '待开始',
        estimatedHours: 3,
        dueDate: '2025-01-15 15:00'
      },
      {
        id: '3-subtask-5',
        title: '部署上线',
        type: '部署',
        status: '待开始',
        estimatedHours: 2,
        dueDate: '2025-01-15 20:00'
      }
    ]
  },
  {
    id: '4',
    title: '交易风控算法优化',
    description: '完善交易风控算法，提升异常交易检测的准确性和实时性。',
    type: '交易',
    priority: '高',
    status: '进行中',
    assignee: mockUser,
    dueDate: '2025-01-13',
    createdAt: '2025-01-08',
    tags: ['风控', '算法', '安全'],
    estimatedHours: 15,
    actualHours: 6,
    subtasks: [
      {
        id: '4-subtask-1',
        title: '算法研究',
        type: '算法研究',
        status: '已完成',
        estimatedHours: 4,
        actualHours: 6,
        dueDate: '2025-01-11 18:00'
      },
      {
        id: '4-subtask-2',
        title: '模型训练',
        type: '模型训练',
        assignee: mockUser,
        status: '进行中',
        estimatedHours: 6,
        actualHours: 3,
        dueDate: '2025-01-14 16:00'
      },
      {
        id: '4-subtask-3',
        title: '集成测试',
        type: '测试',
        assignee: mockUser,
        status: '待开始',
        estimatedHours: 3,
        dueDate: '2025-01-15 14:00'
      },
      {
        id: '4-subtask-4',
        title: '上线部署',
        type: '部署',
        status: '待开始',
        estimatedHours: 2,
        dueDate: '2025-01-15 18:00'
      }
    ]
  },
  // 明天的任务
  {
    id: '5',
    title: '聊天室功能扩展',
    description: '为聊天室添加文件分享、@提醒等功能，提升用户体验。',
    type: '聊天室',
    priority: '中',
    status: '待开始',
    assignee: mockUser,
    dueDate: '2025-01-17',
    createdAt: '2025-01-16',
    tags: ['功能扩展', '用户体验'],
    estimatedHours: 12,
    subtasks: [
      {
        id: '5-subtask-1',
        title: '原型设计',
        type: '原型设计',
        status: '待开始',
        estimatedHours: 2,
        dueDate: '2025-01-17 10:00'
      },
      {
        id: '5-subtask-2',
        title: '前端开发',
        type: '前端开发',
        status: '待开始',
        estimatedHours: 6,
        dueDate: '2025-01-17 16:00'
      },
      {
        id: '5-subtask-3',
        title: '后端开发',
        type: '后端开发',
        status: '待开始',
        estimatedHours: 4,
        dueDate: '2025-01-17 18:00'
      }
    ]
  },
  // 本周任务
  {
    id: '6',
    title: '用户权限管理重构',
    description: '重构用户权限管理模块，支持更细粒度的权限控制。',
    type: '系统',
    priority: '中',
    status: '待开始',
    assignee: mockUser,
    dueDate: '2025-01-18',
    createdAt: '2025-01-16',
    tags: ['重构', '权限', '安全'],
    estimatedHours: 16,
    subtasks: [
      {
        id: '6-subtask-1',
        title: '需求梳理',
        type: '需求分析',
        status: '待开始',
        estimatedHours: 3,
        dueDate: '2025-01-18 10:00'
      },
      {
        id: '6-subtask-2',
        title: '数据库设计',
        type: '数据库设计',
        status: '待开始',
        estimatedHours: 4,
        dueDate: '2025-01-18 14:00'
      },
      {
        id: '6-subtask-3',
        title: '后端开发',
        type: '后端开发',
        assignee: mockUser,
        status: '待开始',
        estimatedHours: 8,
        dueDate: '2025-01-18 18:00'
      },
      {
        id: '6-subtask-4',
        title: '测试验收',
        type: '测试',
        status: '待开始',
        estimatedHours: 1,
        dueDate: '2025-01-18 19:00'
      }
    ]
  },
  // 待安排时间任务
  {
    id: '7',
    title: '移动端适配优化',
    description: '优化移动端页面显示效果，提升移动端用户体验。',
    type: '系统',
    priority: '低',
    status: '待开始',
    assignee: mockUser,
    dueDate: '2025-01-25',
    createdAt: '2025-01-16',
    tags: ['移动端', '适配', '优化'],
    estimatedHours: 14,
    subtasks: [
      {
        id: '7-subtask-1',
        title: '页面适配调研',
        type: '调研',
        status: '待开始',
        estimatedHours: 3,
        dueDate: '2025-01-25 16:00'
      },
      {
        id: '7-subtask-2',
        title: 'UI设计调整',
        type: '视觉设计',
        status: '待开始',
        estimatedHours: 4,
        dueDate: '2025-01-25 18:00'
      },
      {
        id: '7-subtask-3',
        title: '前端实现',
        type: '前端开发',
        assignee: mockUser,
        status: '待开始',
        estimatedHours: 6,
        dueDate: '2025-01-25 20:00'
      },
      {
        id: '7-subtask-4',
        title: '兼容性测试',
        type: '测试',
        status: '待开始',
        estimatedHours: 1,
        dueDate: '2025-01-25 21:00'
      }
    ]
  },
  {
    id: '8',
    title: '数据报表功能开发',
    description: '开发用户数据分析报表功能，支持多维度数据展示。',
    type: '系统',
    priority: '低',
    status: '待开始',
    assignee: mockUser,
    dueDate: '2025-02-01',
    createdAt: '2025-01-16',
    tags: ['报表', '数据分析', '可视化'],
    estimatedHours: 20,
    subtasks: [
      {
        id: '8-subtask-1',
        title: '需求分析',
        type: '需求分析',
        status: '待开始',
        estimatedHours: 4,
        dueDate: '2025-02-01 12:00'
      },
      {
        id: '8-subtask-2',
        title: '图表组件开发',
        type: '前端开发',
        assignee: mockUser,
        status: '待开始',
        estimatedHours: 8,
        dueDate: '2025-02-01 16:00'
      },
      {
        id: '8-subtask-3',
        title: '数据接口开发',
        type: '后端开发',
        assignee: mockUser,
        status: '待开始',
        estimatedHours: 6,
        dueDate: '2025-02-01 18:00'
      },
      {
        id: '8-subtask-4',
        title: '功能测试',
        type: '测试',
        status: '待开始',
        estimatedHours: 2,
        dueDate: '2025-02-01 20:00'
      }
    ]
  }
];

const TaskCard: React.FC<{ 
  task: Task; 
  onNavigate?: (page: string, context?: any) => void;
  compact?: boolean;
}> = ({ task, onNavigate, compact = false }) => {
  const today = '2025-01-16';
  const handleClick = () => {
    if (onNavigate) {
      onNavigate('requirement-with-subtasks', { 
        taskId: task.id,
        task: task,
        source: 'my-todo' 
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
      case '聊天室': return 'bg-orange-500';
      case '系统': return 'bg-red-500';
      case '交易': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // 基于子任务的最早截止时间来判断
  const unfinishedSubtasks = task.subtasks.filter(s => s.status !== '已完成');
  const earliestSubtask = unfinishedSubtasks.length > 0 ? 
    unfinishedSubtasks.reduce((earliest, current) => {
      return current.dueDate < earliest.dueDate ? current : earliest;
    }) : null;
  
  const earliestDate = earliestSubtask ? earliestSubtask.dueDate.split(' ')[0] : task.dueDate;
  const isOverdue = earliestDate < '2025-01-16' && unfinishedSubtasks.length > 0;
  const isToday = earliestDate === '2025-01-16';
  const progress = task.actualHours && task.estimatedHours ? 
    Math.min((task.actualHours / task.estimatedHours) * 100, 100) : 0;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${compact ? 'mb-2' : 'mb-3'} ${
        unfinishedSubtasks.length === 0 ? 'opacity-75' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="space-y-2">
          {/* 标题行 */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              {task.status === '已完���' && (
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              <h4 className={`${compact ? 'text-sm' : 'text-sm'} font-medium leading-tight line-clamp-2 ${
                task.status === '已完成' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h4>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <div 
                className={`w-2 h-2 rounded-full ${getTypeColor(task.type)}`}
                title={task.type}
              />
              {isOverdue && <AlertCircle className="h-3 w-3 text-red-500" />}
            </div>
          </div>

          {/* 优先级和子任务信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                {task.priority}
              </Badge>
              {task.subtasks.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {(() => {
                    const mySubtasks = task.subtasks.filter(s => s.assignee?.name === '张三');
                    const completedMySubtasks = mySubtasks.filter(s => s.status === '已完成');
                    return `${completedMySubtasks.length}/${mySubtasks.length} 我的子任务`;
                  })()}
                </Badge>
              )}
            </div>
          </div>



          {/* 标签 */}
          {!compact && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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

          {/* 底部信息 */}

        </div>
      </CardContent>
    </Card>
  );
};

const TimeSection: React.FC<{
  title: string;
  tasks: Task[];
  onNavigate?: (page: string, context?: any) => void;
  icon: React.ReactNode;
  color: string;
}> = ({ title, tasks, onNavigate, icon, color }) => {
  const today = '2025-01-16';
  
  // 过滤出当前用户相关的任务
  const userTasks = tasks.filter(task => 
    task.assignee.name === '张三' || 
    task.subtasks.some(subtask => subtask.assignee?.name === '张三')
  );
  
  // 获取当前用户的所有子任务
  const mySubtasks = userTasks.flatMap(task => 
    task.subtasks.filter(subtask => subtask.assignee?.name === '张三')
  );
  
  // 计算子任务统计
  const pendingSubtasks = mySubtasks.filter(subtask => 
    subtask.status !== '已完成' && subtask.dueDate >= today
  );
  const completedSubtasks = mySubtasks.filter(subtask => subtask.status === '已完成');
  const overdueSubtasks = mySubtasks.filter(subtask => 
    subtask.status !== '已完成' && subtask.dueDate < today
  );
  
  // 任务级别的统计（用于完成率）
  const completedTasks = userTasks.filter(t => t.subtasks.filter(s => s.status !== '已完成').length === 0);
  const pendingTasks = userTasks.filter(t => t.subtasks.filter(s => s.status !== '已完成').length > 0);
  const overdueTasks = userTasks.filter(t => {
    const unfinishedSubtasks = t.subtasks.filter(s => s.status !== '已完成');
    if (unfinishedSubtasks.length === 0) return false;
    const earliestSubtask = unfinishedSubtasks.reduce((earliest, current) => {
      return current.dueDate < earliest.dueDate ? current : earliest;
    });
    const earliestDate = earliestSubtask.dueDate.split(' ')[0];
    return earliestDate < '2025-01-16';
  });
  
  const completionRate = userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0;
  const totalEstimatedHours = userTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const totalActualHours = userTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}>
              {icon}
            </div>
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {userTasks.length}
          </Badge>
        </div>
        
        {/* 统计信息 */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">完成率</Label>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={completionRate} className="h-2 flex-1" />
                <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-sm font-medium text-blue-600">{pendingSubtasks.length}</div>
              <div className="text-xs text-blue-600">待完成</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-sm font-medium text-green-600">{completedSubtasks.length}</div>
              <div className="text-xs text-green-600">已完成</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <div className="text-sm font-medium text-red-600">{overdueSubtasks.length}</div>
              <div className="text-xs text-red-600">已逾期</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">暂无任务</div>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onNavigate={onNavigate}
                compact={true}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function MyTodoPage({ onNavigate }: MyTodoPageProps) {
  const [tasks] = useState<Task[]>(mockTasks);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const today = '2025-01-16';
  const tomorrow = '2025-01-17';
  const thisWeekStart = '2025-01-13'; // 本周一
  const thisWeekEnd = '2025-01-19';   // 本周日

  // 根据子任务预估时间来划分任务
  const getTaskTimeCategory = (task: Task) => {
    const unfinishedSubtasks = task.subtasks.filter(s => s.status !== '已完成');
    if (unfinishedSubtasks.length === 0) return 'completed';
    
    // 找到最早需要完成的子任务
    const earliestSubtask = unfinishedSubtasks.reduce((earliest, current) => {
      return current.dueDate < earliest.dueDate ? current : earliest;
    });
    
    const earliestDate = earliestSubtask.dueDate.split(' ')[0]; // 获取日期部分
    
    // 已逾期：最早截止时间在今天之前
    if (earliestDate < today) return 'overdue';
    
    if (earliestDate === today) return 'today';
    if (earliestDate === tomorrow) return 'tomorrow';
    if (earliestDate >= thisWeekStart && earliestDate <= thisWeekEnd) return 'thisWeek';
    
    // 待安排时间：截止时间在下周之后（距离较远）
    const nextWeekStart = '2025-01-20';
    if (earliestDate >= nextWeekStart) return 'unscheduled';
    
    return 'later';
  };

  // 筛选和搜索函数
  const filterAndSearchTasks = (taskList: Task[]) => {
    let filteredTasks = taskList;
    
    // 应用筛选条件
    if (currentFilter !== '全部') {
      if (currentFilter === '待完成') {
        filteredTasks = filteredTasks.filter(task => task.subtasks.filter(s => s.status !== '已完成').length > 0);
      } else if (currentFilter === '已完成') {
        filteredTasks = filteredTasks.filter(task => task.subtasks.filter(s => s.status !== '已完成').length === 0);
      } else if (currentFilter === '已逾期') {
        filteredTasks = filteredTasks.filter(task => {
          const unfinishedSubtasks = task.subtasks.filter(s => s.status !== '已完成');
          if (unfinishedSubtasks.length === 0) return false;
          const earliestSubtask = unfinishedSubtasks.reduce((earliest, current) => {
            return current.dueDate < earliest.dueDate ? current : earliest;
          });
          const earliestDate = earliestSubtask.dueDate.split(' ')[0];
          return earliestDate < today;
        });
      }
    }
    
    // 应用搜索条件
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query)) ||
        task.subtasks.some(subtask => subtask.title.toLowerCase().includes(query))
      );
    }
    
    return filteredTasks;
  };

  const allOverdueTasks = tasks.filter(task => getTaskTimeCategory(task) === 'overdue');
  const allTodayTasks = tasks.filter(task => getTaskTimeCategory(task) === 'today');
  const allTomorrowTasks = tasks.filter(task => getTaskTimeCategory(task) === 'tomorrow');
  const allThisWeekTasks = tasks.filter(task => getTaskTimeCategory(task) === 'thisWeek');
  const allUnscheduledTasks = tasks.filter(task => getTaskTimeCategory(task) === 'unscheduled');

  const overdueTasks = filterAndSearchTasks(allOverdueTasks);
  const todayTasks = filterAndSearchTasks(allTodayTasks);
  const tomorrowTasks = filterAndSearchTasks(allTomorrowTasks);
  const thisWeekTasks = filterAndSearchTasks(allThisWeekTasks);
  const unscheduledTasks = filterAndSearchTasks(allUnscheduledTasks);

  const getOverallStats = () => {
    const filteredTasks = filterAndSearchTasks(tasks);
    const completedTasks = filteredTasks.filter(t => t.subtasks.filter(s => s.status !== '已完成').length === 0);
    const overdueTasks = filteredTasks.filter(t => {
      const unfinishedSubtasks = t.subtasks.filter(s => s.status !== '已完成');
      if (unfinishedSubtasks.length === 0) return false;
      const earliestSubtask = unfinishedSubtasks.reduce((earliest, current) => {
        return current.dueDate < earliest.dueDate ? current : earliest;
      });
      const earliestDate = earliestSubtask.dueDate.split(' ')[0];
      return earliestDate < today;
    });
    const inProgressTasks = filteredTasks.filter(t => 
      t.subtasks.some(s => s.status === '进行中') || t.status === '进行中'
    );
    
    return {
      total: filteredTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      inProgress: inProgressTasks.length
    };
  };

  const stats = getOverallStats();

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的 TO DO</h1>
          <p className="text-muted-foreground mt-1">
            按时间维度管理我的任务清单
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务标题、描述、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* 筛选下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选: {currentFilter}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={() => setCurrentFilter('全部')}
                className={currentFilter === '全部' ? 'bg-accent' : ''}
              >
                全部
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCurrentFilter('待完成')}
                className={currentFilter === '待完成' ? 'bg-accent' : ''}
              >
                待完成
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCurrentFilter('已完成')}
                className={currentFilter === '已完成' ? 'bg-accent' : ''}
              >
                已完成
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCurrentFilter('已逾期')}
                className={currentFilter === '已逾期' ? 'bg-accent' : ''}
              >
                已逾期
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 总体统计卡片 */}


      {/* 时间维度的任务面板 */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <div className="flex-shrink-0 w-80">
          <TimeSection
            title="已逾期"
            tasks={overdueTasks}
            onNavigate={onNavigate}
            icon={<AlertCircle className="h-4 w-4 text-white" />}
            color="bg-red-500"
          />
        </div>
        
        <div className="flex-shrink-0 w-80">
          <TimeSection
            title="今天"
            tasks={todayTasks}
            onNavigate={onNavigate}
            icon={<AlertCircle className="h-4 w-4 text-white" />}
            color="bg-red-500"
          />
        </div>
        
        <div className="flex-shrink-0 w-80">
          <TimeSection
            title="明天"
            tasks={tomorrowTasks}
            onNavigate={onNavigate}
            icon={<Calendar className="h-4 w-4 text-white" />}
            color="bg-red-500"
          />
        </div>
        
        <div className="flex-shrink-0 w-80">
          <TimeSection
            title="本周"
            tasks={thisWeekTasks}
            onNavigate={onNavigate}
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            color="bg-red-500"
          />
        </div>
        
        <div className="flex-shrink-0 w-80">
          <TimeSection
            title="待安排时间"
            tasks={unscheduledTasks}
            onNavigate={onNavigate}
            icon={<Clock className="h-4 w-4 text-white" />}
            color="bg-red-500"
          />
        </div>
      </div>
    </div>
  );
}