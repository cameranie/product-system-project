import { useState } from 'react';
import { 
  X, 
  Edit, 
  Calendar, 
  User, 
  Tag, 
  Paperclip, 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckSquare,
  MoreHorizontal,
  Bell,
  Download,
  Eye,
  Users,
  Hash,
  Link,
  Send,
  Smile,
  AtSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Task } from './TaskItem';

interface RightPanelProps {
  task: Task | null;
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  replies?: Comment[];
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface Activity {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'attachment' | 'subtask';
  author: string;
  content: string;
  timestamp: string;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: { name: '张三' },
    content: '设计稿已经完成了初版，请大家review一下',
    timestamp: '2024-12-16 14:30'
  },
  {
    id: '2',
    author: { name: '李四' },
    content: '整体设计很不错，建议在色彩搭配上再优化一下 @张三',
    timestamp: '2024-12-16 15:15'
  }
];

const mockAttachments: Attachment[] = [
  {
    id: '1',
    name: '设计规范.pdf',
    size: '2.3 MB',
    type: 'application/pdf',
    uploadedBy: '张三',
    uploadedAt: '2024-12-16 10:30'
  },
  {
    id: '2',
    name: '界面截图.png',
    size: '1.8 MB',
    type: 'image/png',
    uploadedBy: '李四',
    uploadedAt: '2024-12-16 11:45'
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'status_change',
    author: '张三',
    content: '将任务状态从"待处理"更改为"进行中"',
    timestamp: '2024-12-16 09:30'
  },
  {
    id: '2',
    type: 'comment',
    author: '李四',
    content: '添加了评论',
    timestamp: '2024-12-16 15:15'
  },
  {
    id: '3',
    type: 'attachment',
    author: '王五',
    content: '上传了文件"设计规范.pdf"',
    timestamp: '2024-12-16 10:30'
  }
];

export function RightPanel({ task, onClose, onTaskUpdate }: RightPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const handleSave = () => {
    if (editingTask) {
      onTaskUpdate(editingTask);
      setIsEditing(false);
      setEditingTask(null);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditingTask({ ...task });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTask(null);
  };

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

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'todo': return '待处理';
      case 'in-progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="fixed right-0 top-[60px] bottom-0 w-[400px] bg-background border-l border-border shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">任务详情</h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>保存</Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>取消</Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                编辑
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="details">详情</TabsTrigger>
              <TabsTrigger value="activity">动态</TabsTrigger>
              <TabsTrigger value="files">文件</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    {/* 任务标题 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">任务标题</label>
                      {isEditing ? (
                        <Input
                          value={editingTask?.title || ''}
                          onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                        />
                      ) : (
                        <p className="font-medium">{task.title}</p>
                      )}
                    </div>

                    {/* 任务描述 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">任务描述</label>
                      {isEditing ? (
                        <Textarea
                          value={editingTask?.description || ''}
                          onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                          rows={3}
                        />
                      ) : (
                        <p className="text-muted-foreground">{task.description || '无描述'}</p>
                      )}
                    </div>

                    {/* 状态和优先级 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">状态</label>
                        {isEditing ? (
                          <Select
                            value={editingTask?.status}
                            onValueChange={(value: Task['status']) => setEditingTask(prev => prev ? { ...prev, status: value } : null)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">待处理</SelectItem>
                              <SelectItem value="in-progress">进行中</SelectItem>
                              <SelectItem value="completed">已完成</SelectItem>
                              <SelectItem value="cancelled">已取消</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">优先级</label>
                        {isEditing ? (
                          <Select
                            value={editingTask?.priority}
                            onValueChange={(value: Task['priority']) => setEditingTask(prev => prev ? { ...prev, priority: value } : null)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">低</SelectItem>
                              <SelectItem value="medium">中</SelectItem>
                              <SelectItem value="high">高</SelectItem>
                              <SelectItem value="urgent">紧急</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getPriorityColor(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 进度 */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">进度</label>
                      <div className="space-y-2">
                        <Progress value={task.progress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>已完成 {task.progress}%</span>
                          <span>{task.progress === 100 ? '已完成' : '进行中'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 时间管理 */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      时间管理
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">创建时间</span>
                        <p>{new Date(task.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">更新时间</span>
                        <p>{new Date(task.updatedAt).toLocaleString('zh-CN')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">截止时间</span>
                        <p>{new Date(task.dueDate).toLocaleString('zh-CN')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">完成时间</span>
                        <p>{task.status === 'completed' ? new Date().toLocaleString('zh-CN') : '未完成'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 人员协作 */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      人员协作
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">负责人</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.assignee.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">参与人员</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">张</AvatarFallback>
                          </Avatar>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">李</AvatarFallback>
                          </Avatar>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 项目归属 */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      项目归属
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">所属项目</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: task.project.color }}
                          />
                          <span className="text-sm">{task.project.name}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">标签</span>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            添加标签
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 子任务 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        子任务 (2/3)
                      </h3>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                        <input type="checkbox" checked className="rounded" />
                        <span className="text-sm line-through text-muted-foreground">完成界面设计</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                        <input type="checkbox" checked className="rounded" />
                        <span className="text-sm line-through text-muted-foreground">完成交互设计</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">完成用户测试</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 m-0">
              <div className="flex flex-col h-full">
                {/* 评论输入 */}
                <div className="p-4 border-b border-border">
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">我</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="添加评论..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                            <AtSign className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button size="sm" disabled={!newComment.trim()}>
                          <Send className="h-4 w-4 mr-1" />
                          发送
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 活动流 */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* 评论 */}
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback className="text-xs">
                            {comment.author.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author.name}</span>
                              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 活动记录 */}
                    {mockActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.author}</span>{' '}
                            <span className="text-muted-foreground">{activity.content}</span>
                          </p>
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="files" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* 文件上传 */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">拖拽文件到此处或</p>
                    <Button variant="outline" size="sm">选择文件</Button>
                  </div>

                  {/* 附件列表 */}
                  <div className="space-y-2">
                    <h4 className="font-medium">附件 ({mockAttachments.length})</h4>
                    {mockAttachments.map((attachment) => (
                      <Card key={attachment.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                <Paperclip className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.size} • 由 {attachment.uploadedBy} 上传于 {attachment.uploadedAt}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 相关链接 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">相关链接</h4>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4 mr-1" />
                        添加链接
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                            <Link className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">设计规范文档</p>
                            <p className="text-xs text-muted-foreground">https://design.company.com/specs</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}