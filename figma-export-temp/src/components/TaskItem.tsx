import { MoreHorizontal, User, Calendar, Tag, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    name: string;
    avatar?: string;
  };
  project: {
    name: string;
    color: string;
  };
  dueDate: string;
  progress: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskItemProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (taskId: string) => void;
}

export function TaskItem({ task, onStatusChange, onEdit, onDelete, onClick }: TaskItemProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '紧急';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-blue-600 fill-blue-100" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className="group border-b border-border hover:bg-accent/30 transition-colors cursor-pointer"
      onClick={() => onClick?.(task.id)}
    >
      <div className="p-4 flex items-center gap-4">
        {/* 状态复选框 */}
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange?.(task.id, task.status === 'completed' ? 'todo' : 'completed');
          }}
        >
          {getStatusIcon(task.status)}
        </Button>

        {/* 任务内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h3>
            {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {task.description}
            </p>
          )}
          
          {/* 标签 */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 进度条 */}
          {task.progress > 0 && (
            <div className="mb-2">
              <Progress value={task.progress} className="h-1" />
            </div>
          )}
        </div>

        {/* 优先级 */}
        <Badge className={`${getPriorityColor(task.priority)} border-none`}>
          {getPriorityLabel(task.priority)}
        </Badge>

        {/* 项目 */}
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: task.project.color }}
          />
          <span className="text-sm text-muted-foreground truncate max-w-[100px]">
            {task.project.name}
          </span>
        </div>

        {/* 负责人 */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="text-xs">
              {task.assignee.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground hidden lg:inline">
            {task.assignee.name}
          </span>
        </div>

        {/* 截止日期 */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className={`whitespace-nowrap ${isOverdue ? 'text-red-500' : ''}`}>
            {new Date(task.dueDate).toLocaleDateString('zh-CN', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* 更多操作 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task.id);
            }}>
              编辑任务
            </DropdownMenuItem>
            <DropdownMenuItem>
              分配给他人
            </DropdownMenuItem>
            <DropdownMenuItem>
              复制任务
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
            >
              删除任务
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}