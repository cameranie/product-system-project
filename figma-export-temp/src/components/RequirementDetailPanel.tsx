import { useState, useEffect } from 'react';
import { 
  X, 
  Edit,
  MessageSquare,
  Paperclip,
  Clock,
  User,
  Tag,
  Send,
  AtSign,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface RequirementDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: any;
  onUpdate?: (requirement: any) => void;
}

const mockComments = [
  {
    id: '1',
    user: '产品经理',
    time: '2024-01-16 14:30',
    content: '这个需求的优先级需要提升，建议本周内完成。',
    mentions: []
  },
  {
    id: '2', 
    user: '张三',
    time: '2024-01-16 15:45',
    content: '收到，正在分析技术方案，预计明天给出详细评估。',
    mentions: []
  }
];

const operationLogs = [
  {
    id: '1',
    user: '产品经理',
    time: '2024-01-15 09:00',
    action: '创建了需求',
    details: ''
  },
  {
    id: '2',
    user: '产品经理', 
    time: '2024-01-15 10:30',
    action: '分配给',
    details: '张三'
  },
  {
    id: '3',
    user: '张三',
    time: '2024-01-16 11:15', 
    action: '状态变更',
    details: '待处理 → 处理中'
  }
];

export function RequirementDetailPanel({ isOpen, onClose, requirement, onUpdate }: RequirementDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(requirement || {});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);

  // 当requirement变化时更新editData
  useEffect(() => {
    if (requirement) {
      setEditData(requirement);
    }
  }, [requirement]);

  if (!isOpen || !requirement) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    const updatedRequirement = { ...editData, status: newStatus };
    setEditData(updatedRequirement);
    if (onUpdate) {
      onUpdate(updatedRequirement);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        user: '当前用户',
        time: new Date().toLocaleString(),
        content: newComment,
        mentions: []
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleConvertToTask = () => {
    console.log('转为任务');
  };

  const handleConvertToBug = () => {
    console.log('转为Bug');
  };

  const handleClose = () => {
    console.log('关闭需求');
  };

  const handleDelete = () => {
    console.log('删除需求');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '功能需求': return 'bg-blue-100 text-blue-800';
      case 'Bug': return 'bg-red-100 text-red-800';
      case '产品建议': return 'bg-green-100 text-green-800';
      case '技术需求': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '待处理': return 'bg-gray-100 text-gray-800';
      case '处理中': return 'bg-yellow-100 text-yellow-800';
      case '已解决': return 'bg-green-100 text-green-800';
      case '已拒绝': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '低': return 'bg-gray-100 text-gray-600';
      case '中': return 'bg-blue-100 text-blue-600';
      case '高': return 'bg-orange-100 text-orange-600';
      case '紧急': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed right-0 top-[60px] bottom-0 w-[500px] bg-background border-l border-border shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-medium">需求详情</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📋 基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>需求标题</Label>
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>类型</Label>
                        <Select value={editData.type} onValueChange={(value) => setEditData({...editData, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="功能需求">功能需求</SelectItem>
                            <SelectItem value="Bug">Bug</SelectItem>
                            <SelectItem value="产品建议">产品建议</SelectItem>
                            <SelectItem value="技术需求">技术需求</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>优先级</Label>
                        <Select value={editData.priority} onValueChange={(value) => setEditData({...editData, priority: value})}>
                          <SelectTrigger>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>状态</Label>
                        <Select value={editData.status} onValueChange={handleStatusChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="待处理">待处理</SelectItem>
                            <SelectItem value="处理中">处理中</SelectItem>
                            <SelectItem value="已解决">已解决</SelectItem>
                            <SelectItem value="已拒绝">已拒绝</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>处理人</Label>
                        <Select value={editData.assignee} onValueChange={(value) => setEditData({...editData, assignee: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="张三">张三</SelectItem>
                            <SelectItem value="李四">李四</SelectItem>
                            <SelectItem value="王五">王五</SelectItem>
                            <SelectItem value="赵六">赵六</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>描述</Label>
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave}>保存</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>取消</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">标题：</span>
                      <p className="mt-1">{requirement.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">类型：</span>
                        <div className="mt-1">
                          <Badge className={getTypeColor(requirement.type)}>
                            {requirement.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">优先级：</span>
                        <div className="mt-1">
                          <Badge className={getPriorityColor(requirement.priority)}>
                            {requirement.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">状态：</span>
                        <div className="mt-1">
                          <Badge className={getStatusColor(requirement.status)}>
                            {requirement.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">处理人：</span>
                        <div className="mt-1 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{requirement.assignee}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">创建信息：</span>
                      <p className="text-sm mt-1">
                        由 {requirement.creator} 创建于 {requirement.createdAt}
                      </p>
                    </div>

                    {requirement.description && (
                      <div>
                        <span className="text-sm text-muted-foreground">描述：</span>
                        <p className="mt-1 text-sm leading-relaxed">{requirement.description}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 评论区 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-medium">评论 ({comments.length})</h3>
              </div>
              
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* 新增评论 */}
              <div className="mt-4 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="输入评论内容，使用 @ 提及成员..."
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    发送
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* 操作日志 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" />
                <h3 className="font-medium">操作日志</h3>
              </div>
              
              <div className="space-y-3">
                {operationLogs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <span className="font-medium">{log.user}</span>
                    <span className="mx-2">{log.action}</span>
                    {log.details && <span className="text-muted-foreground">{log.details}</span>}
                    <div className="text-xs text-muted-foreground mt-1">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* 底部操作按钮 */}
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConvertToTask} variant="outline">
              转为任务
            </Button>
            <Button onClick={handleConvertToBug} variant="outline">
              转为Bug
            </Button>
            <Button onClick={handleClose} variant="outline">
              关闭
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  删除需求
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}