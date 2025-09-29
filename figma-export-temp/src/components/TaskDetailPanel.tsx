import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Calendar, 
  Download,
  Send,
  CheckCircle,
  Circle,
  ArrowLeft,
  Target,
  User,
  Clock,
  Flag,
  MessageSquare,
  Paperclip,
  History,
  Trash2,
  RotateCcw,
  Bug
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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

interface TaskDetailPanelProps {
  task: TaskItem;
  onBack: () => void;
  onEdit: () => void;
  tasks: TaskItem[];
  setTasks: (tasks: TaskItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const mockComments = [
  {
    id: '1',
    author: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    time: '2024-01-16 10:30',
    content: '登录接口已完成对接，正在进行单元测试'
  },
  {
    id: '2', 
    author: { id: '2', name: '李四', avatar: '', role: '后端开发' },
    time: '2024-01-16 14:20',
    content: '@张三 记得处理错误提示，特别是网络超时的情况'
  },
  {
    id: '3',
    author: { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
    time: '2024-01-16 16:45',
    content: '界面样式需要和设计稿保持一致，注意移动端适配'
  }
];

const mockOperationLogs = [
  {
    id: '1',
    user: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    action: '更新了任务状态',
    detail: '从"待开始"更改为"进行中"',
    time: '2024-01-16 09:00'
  },
  {
    id: '2',
    user: { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
    action: '修改了优先级',
    detail: '从"中"更改为"高"',
    time: '2024-01-15 16:30'
  },
  {
    id: '3',
    user: { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
    action: '创建了任务',
    detail: '任务"用户登录页面开发"已创建',
    time: '2024-01-15 14:20'
  }
];

const statusLabels = {
  '待开始': { label: '待开始', variant: 'secondary' as const, color: 'text-gray-500' },
  '进行中': { label: '进行中', variant: 'default' as const, color: 'text-blue-500' },
  '已完成': { label: '已完成', variant: 'outline' as const, color: 'text-green-500' },
  '已取消': { label: '已取消', variant: 'destructive' as const, color: 'text-red-500' }
};

const priorityConfig = {
  '低': { label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

export function TaskDetailPanel({ task, onBack, onEdit, tasks, setTasks, isOpen, onClose }: TaskDetailPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !task) return null;

  const completedSubTasks = task.subTasks?.filter(st => st.completed).length || 0;
  const totalSubTasks = task.subTasks?.length || 0;

  const handleStatusChange = (newStatus: string) => {
    const updatedTask = { ...task, status: newStatus as any, updatedAt: new Date().toISOString().split('T')[0] };
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
  };

  const handleCompleteTask = () => {
    handleStatusChange('已完成');
  };

  const handleConvertToBug = () => {
    // 这里可以实现转为Bug的逻辑
    console.log('转为Bug');
  };

  const handleDeleteTask = () => {
    setTasks(tasks.filter(t => t.id !== task.id));
    onBack();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // 这里可以实现添加评论的逻辑
      console.log('添加评论:', newComment);
      setNewComment('');
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
            <h1 className="text-2xl font-semibold">{task.title}</h1>
            <p className="text-muted-foreground mt-1">
              任务详情和协作信息
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button onClick={handleCompleteTask} disabled={task.status === '已完成'}>
            <CheckCircle className="h-4 w-4 mr-2" />
            标记完成
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要内容区域 */}
        <div className="col-span-8">
          {/* 标签页 */}
          <div className="flex items-center gap-1 border-b mb-6">
            <Button
              variant={activeTab === 'details' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('details')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              任务详情
            </Button>
            <Button
              variant={activeTab === 'comments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('comments')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              评论讨论
            </Button>
            <Button
              variant={activeTab === 'logs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('logs')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              操作日志
            </Button>
          </div>

          {/* 标签页内容 */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* 任务描述 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    任务描述
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{task.description || '暂无描述'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 子任务 */}
              {task.subTasks && task.subTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      子任务 ({completedSubTasks}/{totalSubTasks})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {task.subTasks.map((subTask) => (
                        <div key={subTask.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center">
                            {subTask.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`${subTask.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {subTask.title}
                            </p>
                          </div>
                          {subTask.assignee && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={subTask.assignee.avatar} />
                                <AvatarFallback className="text-xs">
                                  {subTask.assignee.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{subTask.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">完成进度</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((completedSubTasks / totalSubTasks) * 100)}%
                        </span>
                      </div>
                      <Progress value={(completedSubTasks / totalSubTasks) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 附件 */}
              {task.attachments && task.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      附件 ({task.attachments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {task.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-3 p-2 border rounded">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  评论讨论
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {comment.author.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="输入评论内容，支持@成员..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      添加附件
                    </Button>
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      发送评论
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'logs' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  操作日志
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOperationLogs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {log.user.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{log.user.name}</span>
                          <span className="text-sm text-muted-foreground">{log.action}</span>
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">状态</span>
                <div className="flex items-center gap-1">
                  <Badge variant={statusLabels[task.status].variant}>
                    {statusLabels[task.status].label}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">优先级</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].border}`}>
                  <Flag className={`h-3 w-3 ${priorityConfig[task.priority].color}`} />
                  <span className="text-sm">{task.priority}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">负责人</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assignee.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{task.assignee.name}</p>
                        <p className="text-xs text-muted-foreground">{task.assignee.role}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.creator.avatar} />
                    <AvatarFallback className="text-xs">
                      {task.creator.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.creator.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">所属项目</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${task.project.color}`}></div>
                  <span className="text-sm">{task.project.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">截止时间</span>
                <span className="text-sm">{task.dueDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建时间</span>
                <span className="text-sm">{task.createdAt}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">更新时间</span>
                <span className="text-sm">{task.updatedAt}</span>
              </div>
            </CardContent>
          </Card>

          {/* 进度 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">任务进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">整体进度</span>
                  <span className="text-sm font-medium">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
                {totalSubTasks > 0 && (
                  <>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-muted-foreground">子任务进度</span>
                      <span className="text-sm font-medium">{completedSubTasks}/{totalSubTasks}</span>
                    </div>
                    <Progress value={(completedSubTasks / totalSubTasks) * 100} className="h-2" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 标签 */}
          {task.tags && task.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleCompleteTask}
                disabled={task.status === '已完成'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                标记完成
              </Button>
              <Button variant="outline" className="w-full" onClick={handleConvertToBug}>
                <Bug className="h-4 w-4 mr-2" />
                转为Bug
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4 mr-2" />
                删除任务
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}