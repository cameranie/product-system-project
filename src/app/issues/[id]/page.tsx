'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { FormField, FormFieldGroup } from '@/components/ui/form-field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KanbanCard } from '@/components/ui/kanban';
import { issueApi, userApi } from '@/lib/api';
import type { Issue, User } from '@/types/issue';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus,
  Save,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';




// 任务类型配置
const taskTypeConfig = {
  frontend: { label: '前端开发', color: '#3B82F6', icon: '💻' },
  backend: { label: '后端开发', color: '#10B981', icon: '⚙️' },
  design: { label: 'UI设计', color: '#F59E0B', icon: '🎨' },
  testing: { label: '测试', color: '#8B5CF6', icon: '🧪' },
  pm: { label: '产品管理', color: '#EF4444', icon: '📋' },
  other: { label: '其他', color: '#6B7280', icon: '📝' },
};

const priorityConfig = {
  LOW: { label: '低', color: '#6B7280' },
  MEDIUM: { label: '中', color: '#F59E0B' },
  HIGH: { label: '高', color: '#EF4444' },
  URGENT: { label: '紧急', color: '#DC2626' },
};

// 状态配置 - Issue和Task使用相同状态
const statusConfig = {
  TODO: { label: '待办', color: '#6B7280' },
  IN_PROGRESS: { label: '进行中', color: '#F59E0B' },
  DONE: { label: '已完成', color: '#10B981' },
  CANCELLED: { label: '已取消', color: '#EF4444' },
};



interface Task {
  id: string;
  title: string;
  description: string;
  type: keyof typeof taskTypeConfig;
  priority: keyof typeof priorityConfig;
  status: keyof typeof statusConfig;
  assigneeId: string;
  estimatedHours: number;
  startDate?: Date;
  endDate?: Date;
  dependencies: string[];
}

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id as string;
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: '',
    estimatedHours: 8,
  });

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [issueResponse, usersResponse] = await Promise.all([
          issueApi.getIssue(issueId),
          userApi.getUsers()
        ]);
        
        setIssue(issueResponse.issue);
        // 暂时使用空数组，等后端支持issueId筛选后再启用
        setTasks([]);
        setUsers(usersResponse.users.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (issueId) {
      loadData();
    }
  }, [issueId]);

  const handleBack = () => {
    window.history.back();
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assigneeId) {
      alert('请填写任务标题和指派人员');
      return;
    }

    const task: Task = {
      id: `TASK-${String(Date.now()).slice(-6)}`,
      title: newTask.title!,
      description: newTask.description || '',
      type: newTask.type!,
      priority: newTask.priority!,
      status: newTask.status!,
      assigneeId: newTask.assigneeId!,
      estimatedHours: newTask.estimatedHours || 8,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      dependencies: newTask.dependencies || []
    };

    setTasks(prev => [...prev, task]);
    
    // 重置表单
    setNewTask({
      title: '',
      description: '',
      type: 'frontend',
      priority: 'MEDIUM',
      status: 'TODO',
      assigneeId: '',
      estimatedHours: 8,
      dependencies: []
    });
    
    setShowTaskForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getTotalEstimatedHours = () => {
    return tasks.reduce((total, task) => total + task.estimatedHours, 0);
  };

  const getAssigneeDistribution = () => {
    const distribution = tasks.reduce((acc, task) => {
      const user = users.find(u => u.id === task.assigneeId);
      const key = user?.name || '未分配';
      acc[key] = (acc[key] || 0) + task.estimatedHours;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">加载中...</div>
            <div className="text-sm text-muted-foreground mt-2">正在加载Issue详情</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !issue) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600">加载失败</div>
            <div className="text-sm text-muted-foreground mt-2">{error || 'Issue不存在'}</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">相关任务</h1>
            </div>
          </div>
          
          {/* 添加任务按钮 */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowTaskForm(!showTaskForm)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：相关任务 */}
            <div className="lg:col-span-2">
              <FormFieldGroup>

                {/* 任务创建表单 */}
                {showTaskForm && (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <FormFieldGroup>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="任务标题" required>
                            <Input
                              placeholder="描述具体的开发任务"
                              value={newTask.title || ''}
                              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            />
                          </FormField>

                          <FormField label="任务类型">
                            <Select 
                              value={newTask.type} 
                              onValueChange={(value) => setNewTask({...newTask, type: value as Task['type']})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(taskTypeConfig).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <span>{config.icon}</span>
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormField>
                        </div>

                        <FormField label="任务描述">
                          <Input
                            placeholder="详细描述任务内容和要求"
                            value={newTask.description || ''}
                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField label="指派给" required>
                            <Select 
                              value={newTask.assigneeId} 
                              onValueChange={(value) => setNewTask({...newTask, assigneeId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择人员" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username}`} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                      </Avatar>
                                      <span>{user.name}</span>
                                      <span className="text-xs text-muted-foreground">({user.email})</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormField>

                          <FormField label="优先级">
                            <Select 
                              value={newTask.priority} 
                              onValueChange={(value) => setNewTask({...newTask, priority: value as Task['priority']})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(priorityConfig).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: config.color }}
                                      />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormField>

                          <FormField label="预估工时(小时)">
                            <Input
                              type="number"
                              min="1"
                              max="200"
                              value={newTask.estimatedHours || 8}
                              onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 8})}
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="开始日期">
                            <DatePicker
                              date={newTask.startDate}
                              onDateChange={(date) => setNewTask({...newTask, startDate: date})}
                              placeholder="选择开始日期"
                            />
                          </FormField>

                          <FormField label="结束日期">
                            <DatePicker
                              date={newTask.endDate}
                              onDateChange={(date) => setNewTask({...newTask, endDate: date})}
                              placeholder="选择结束日期"
                            />
                          </FormField>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <Button onClick={handleAddTask}>
                            <Save className="h-4 w-4 mr-2" />
                            添加任务
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowTaskForm(false)}
                          >
                            取消
                          </Button>
                        </div>
                      </FormFieldGroup>
                    </CardContent>
                  </Card>
                )}

                {/* 任务列表 */}
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>还没有创建任务</p>
                    <p className="text-sm">点击右上角&ldquo;添加&rdquo;按钮开始拆分这个Issue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <KanbanCard
                        key={task.id}
                        id={task.id}
                        name={task.title}
                        index={0}
                        parent="tasks"
                        className="cursor-default"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {task.id}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className="text-xs"
                              >
                                {taskTypeConfig[task.type].icon} {taskTypeConfig[task.type].label}
                              </Badge>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: priorityConfig[task.priority as keyof typeof priorityConfig].color, color: 'white' }}
                              >
                                {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {statusConfig[task.status as keyof typeof statusConfig].label}
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            
                            {/* 基本信息始终显示 */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${users.find(u => u.id === task.assigneeId)?.username}`} />
                                  <AvatarFallback className="text-xs">
                                    {users.find(u => u.id === task.assigneeId)?.name?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{users.find(u => u.id === task.assigneeId)?.name || '未分配'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimatedHours}h
                              </div>
                            </div>

                            {/* 展开的详细信息 */}
                            {expandedTasks[task.id] && (
                              <div className="space-y-2 pt-2 border-t border-border">
                                {task.description && (
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-1">描述</div>
                                    <p className="text-xs text-muted-foreground">{task.description}</p>
                                  </div>
                                )}
                                
                                {(task.startDate || task.endDate) && (
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-1">时间安排</div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      {task.startDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          开始: {task.startDate.toLocaleDateString()}
                                        </div>
                                      )}
                                      {task.endDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          结束: {task.endDate.toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* 操作按钮 */}
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleTaskExpanded(task.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              {expandedTasks[task.id] ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </KanbanCard>
                    ))}
                  </div>
                )}
              </FormFieldGroup>
            </div>

            {/* 右侧：Issue信息卡片 */}
            <div className="lg:col-span-1">
              <Card className="border border-border shadow-none py-0">
                <CardContent className="p-6">
                  <FormFieldGroup>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Issue 标题</div>
                      <h2 className="font-medium text-sm mb-3">{issue.title}</h2>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Issue ID</div>
                      <Badge variant="outline">{issue.id}</Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">状态</div>
                      <Badge variant="outline">{issue.status}</Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">优先级</div>
                      <Badge variant="outline" className="text-xs">
                        {issue.priority}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">所属项目</div>
                      <div className="text-sm">
                        {issue.project?.name} ({issue.project?.key})
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Issue类型</div>
                      <Badge variant="outline" className="text-xs">
                        {issue.issueType}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">输入源</div>
                      <Badge variant="outline" className="text-xs">
                        {issue.inputSource}
                      </Badge>
                    </div>

                    {issue.assignee && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">负责人</div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${issue.assignee.username}`} />
                            <AvatarFallback>{issue.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{issue.assignee.name}</span>
                        </div>
                      </div>
                    )}

                    {issue.businessValue && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">商业价值</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.businessValue}
                        </div>
                      </div>
                    )}

                    {issue.userImpact && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">用户影响</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.userImpact}
                        </div>
                      </div>
                    )}

                    {issue.technicalRisk && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">技术风险</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.technicalRisk}
                        </div>
                      </div>
                    )}

                    {issue.dueDate && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">预期完成时间</div>
                        <div className="text-sm">
                          {new Date(issue.dueDate).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">创建时间</div>
                      <div className="text-sm">
                        {new Date(issue.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>

                    {issue.description && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">描述</div>
                        <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {issue.description}
                        </div>
                      </div>
                    )}

                    {/* 统计信息 */}
                    {tasks.length > 0 && (
                      <>
                        <hr className="my-4" />
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-3">统计信息</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">总任务数</span>
                              <span className="font-medium">{tasks.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">总工时</span>
                              <span className="font-medium">{getTotalEstimatedHours()}h</span>
                            </div>
                            
                            <div>
                              <div className="text-sm text-muted-foreground mb-2">人员分配</div>
                              {getAssigneeDistribution().map(([name, hours]) => (
                                <div key={name} className="flex items-center justify-between text-sm">
                                  <span>{name}</span>
                                  <span>{hours}h</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </FormFieldGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}