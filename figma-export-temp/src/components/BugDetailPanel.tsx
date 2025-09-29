import React, { useState } from 'react';
import { 
  X, 
  CheckCircle,
  XCircle,
  Paperclip,
  MessageSquare,
  ArrowLeft,
  Edit,
  Bug,
  Target,
  Flag,
  History,
  Send,
  Download,
  RotateCcw,
  Trash2,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
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

interface BugDetailPanelProps {
  bug: Bug;
  onBack: () => void;
  onEdit: () => void;
  bugs: Bug[];
  setBugs: (bugs: Bug[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const mockComments = [
  {
    id: '1',
    author: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    time: '2024-01-16 09:30',
    content: '发现问题并提交，已添加相关截图和日志'
  },
  {
    id: '2', 
    author: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    time: '2024-01-16 10:15',
    content: '已确认问题，正在排查Safari兼容性问题，预计今天下午修复'
  },
  {
    id: '3',
    author: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    time: '2024-01-16 15:20',
    content: '修复后已通过测试，Safari浏览器下登录功能正常'
  }
];

const mockOperationLogs = [
  {
    id: '1',
    user: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    action: '创建了Bug',
    detail: 'Bug"登录页面在Safari浏览器下出现白屏"已创建',
    time: '2024-01-16 09:00'
  },
  {
    id: '2',
    user: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    action: '更新了状态',
    detail: '从"待处理"更改为"处理中"',
    time: '2024-01-16 10:00'
  },
  {
    id: '3',
    user: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    action: '更新了状态',
    detail: '从"处理中"更改为"待测试"',
    time: '2024-01-16 14:30'
  },
  {
    id: '4',
    user: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    action: '更新了状态',
    detail: '从"待测试"更改为"已解决"',
    time: '2024-01-16 15:30'
  }
];

const statusLabels = {
  '待处理': { label: '待处理', variant: 'secondary' as const, color: 'text-gray-500' },
  '处理中': { label: '处理中', variant: 'default' as const, color: 'text-blue-500' },
  '待测试': { label: '待测试', variant: 'outline' as const, color: 'text-orange-500' },
  '已解决': { label: '已解决', variant: 'outline' as const, color: 'text-green-500' },
  '已关闭': { label: '已关闭', variant: 'outline' as const, color: 'text-gray-400' },
  '重新打开': { label: '重新打开', variant: 'destructive' as const, color: 'text-red-500' }
};

const priorityConfig = {
  '低': { label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

export function BugDetailPanel({ bug, onBack, onEdit, bugs, setBugs, isOpen, onClose }: BugDetailPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !bug) return null;

  const handleStatusChange = (newStatus: string) => {
    const updatedBug = { ...bug, status: newStatus as any, updatedAt: new Date().toISOString().split('T')[0] };
    setBugs(bugs.map(b => b.id === bug.id ? updatedBug : b));
  };

  const handleResolveBug = () => {
    handleStatusChange('已解决');
  };

  const handleCloseBug = () => {
    handleStatusChange('已关闭');
  };

  const handleReopenBug = () => {
    handleStatusChange('重新打开');
  };

  const handleDeleteBug = () => {
    setBugs(bugs.filter(b => b.id !== bug.id));
    onBack();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
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
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-semibold">{bug.title}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Bug详情和处理记录
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button onClick={handleResolveBug} disabled={bug.status === '已解决'}>
            <CheckCircle className="h-4 w-4 mr-2" />
            标记解决
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
              Bug详情
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
              {/* Bug描述 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Bug描述
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{bug.description || '暂无详细描述'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 复现步骤 */}
              {bug.reproductionSteps && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5" />
                      复现步骤
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{bug.reproductionSteps}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 预期结果和实际结果 */}
              <div className="grid grid-cols-2 gap-4">
                {bug.expectedResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        预期结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{bug.expectedResult}</p>
                    </CardContent>
                  </Card>
                )}

                {bug.actualResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        实际结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{bug.actualResult}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 测试环境 */}
              {bug.environment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      测试环境
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{bug.environment}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 附件 */}
              {bug.attachments && bug.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      附件 ({bug.attachments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {bug.attachments.map((attachment) => (
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
                  <Badge variant={statusLabels[bug.status].variant}>
                    {statusLabels[bug.status].label}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">优先级</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${priorityConfig[bug.priority].bg} ${priorityConfig[bug.priority].border}`}>
                  <Flag className={`h-3 w-3 ${priorityConfig[bug.priority].color}`} />
                  <span className="text-sm">{bug.priority}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">处理人</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={bug.assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {bug.assignee.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{bug.assignee.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{bug.assignee.name}</p>
                        <p className="text-xs text-muted-foreground">{bug.assignee.role}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">报告人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={bug.reporter.avatar} />
                    <AvatarFallback className="text-xs">
                      {bug.reporter.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{bug.reporter.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">所属项目</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${bug.project.color}`}></div>
                  <span className="text-sm">{bug.project.name}</span>
                </div>
              </div>

              {bug.requirement && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">关联需求</span>
                  <span className="text-sm">{bug.requirement.title}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建时间</span>
                <span className="text-sm">{bug.createdAt}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">更新时间</span>
                <span className="text-sm">{bug.updatedAt}</span>
              </div>
            </CardContent>
          </Card>

          {/* 标签 */}
          {bug.tags && bug.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 flex-wrap">
                  {bug.tags.map(tag => (
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
                onClick={handleResolveBug}
                disabled={bug.status === '已解决'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                标记解决
              </Button>
              <Button variant="outline" className="w-full" onClick={handleCloseBug}>
                <XCircle className="h-4 w-4 mr-2" />
                关闭Bug
              </Button>
              <Button variant="outline" className="w-full" onClick={handleReopenBug}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重新打开
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleDeleteBug}>
                <Trash2 className="h-4 w-4 mr-2" />
                删除Bug
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}