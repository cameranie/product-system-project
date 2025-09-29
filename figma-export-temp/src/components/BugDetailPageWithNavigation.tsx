import React, { useState } from 'react';
import { 
  X, 
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
  Settings,
  ListOrdered,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
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



interface Requirement {
  id: string;
  title: string;
}

interface ProductOwner {
  id: string;
  name: string;
  avatar?: string;
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
  status: '待处理' | '处理中' | '待测试' | '已解决';
  assignee: User;
  tester: User;
  reporter: User;
  requirement?: Requirement;
  productOwner?: ProductOwner;
  reproductionSteps?: string;
  expectedResult?: string;
  actualResult?: string;
  environment?: string;
  testVersion?: string;
  testDevice?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  closed?: boolean; // 新增：标识bug是否关闭
}

interface BugDetailPageProps {
  bugId?: string;
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

// Mock数据
const mockBugs: Bug[] = [
  {
    id: '1',
    title: '登录页面在Safari浏览器下出现白屏',
    description: '用户在Safari浏览器（版本14.1.2）下访问登录页面时，页面完全空白，无法显示任何内容。在Chrome和Firefox下正常显示。',
    priority: '高',
    status: '已解决',
    assignee: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    tester: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    reporter: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    project: { id: 'proj1', name: 'K线', color: 'bg-blue-500' },
    requirement: { id: 'req1', title: '用户登录功能优化' },
    productOwner: { id: 'po1', name: '王小明', avatar: '' },
    reproductionSteps: `1. 打开Safari浏览器（版本14.1.2）
2. 访问登录页面 https://example.com/login
3. 观察页面显示情况`,
    expectedResult: '页面正常显示登录表单，包括用户名输入框、密码输入框和登录按钮',
    actualResult: '页面完全空白，控制台显示JavaScript错误',
    environment: `操作系统：macOS Big Sur 11.6
浏览器：Safari 14.1.2
设备：MacBook Pro 2020`,
    testVersion: 'v2.1.0',
    testDevice: 'MacBook Pro',
    createdAt: '2024-01-16 09:00',
    updatedAt: '2024-01-16 15:30',
    tags: ['前端', 'Safari', '兼容性'],
    closed: true,
    attachments: [
      {
        id: '1',
        name: 'safari-error-screenshot.png',
        size: 1024000,
        type: 'image/png',
        url: ''
      },
      {
        id: '2',
        name: 'console-error-log.txt',
        size: 2048,
        type: 'text/plain',
        url: ''
      }
    ]
  },
  {
    id: '2',
    title: 'K线图在移动端滚动时出现卡顿',
    description: '在移动设备上查看K线图时，进行滑动操作会出现明显的卡顿现象，影响用户体验。',
    priority: '中',
    status: '处理中',
    assignee: { id: '2', name: '李四', avatar: '', role: '前端开发' },
    tester: { id: '6', name: '测试员B', avatar: '', role: '测试工程师' },
    reporter: { id: '6', name: '测试员B', avatar: '', role: '测试工程师' },
    project: { id: 'proj1', name: 'K线', color: 'bg-blue-500' },
    requirement: { id: 'req2', title: 'K线图性能优化' },
    productOwner: { id: 'po2', name: '李晓红', avatar: '' },
    reproductionSteps: `1. 使用移动设备打开K线图页面
2. 尝试左右滑动查看历史数据
3. 观察滑动的流畅度`,
    expectedResult: '滑动操作流畅，无明显卡顿',
    actualResult: '滑动时出现卡顿，帧率明显下降',
    environment: `设备：iPhone 12 Pro
系统：iOS 15.0
浏览器：Safari Mobile`,
    testVersion: 'v2.0.8',
    testDevice: 'iPhone 12 Pro',
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-16 10:15',
    tags: ['性能', '移动端', 'K线图'],
    closed: false
  }
];

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
  '待处理': { label: '待处理', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
  '处理中': { label: '处理中', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  '待测试': { label: '待测试', variant: 'outline' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  '已解决': { label: '已解决', variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' }
};

const priorityConfig = {
  '低': { label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

export function BugDetailPageWithNavigation({ bugId, context, onNavigate }: BugDetailPageProps) {
  const [newComment, setNewComment] = useState('');
  
  // 获取bug数据
  const initialBug = mockBugs.find(b => b.id === bugId) || mockBugs[0];
  const [bug, setBug] = useState(initialBug);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo, context.returnContext);
    } else if (onNavigate) {
      onNavigate('bugs');
    }
  };

  const handleEdit = () => {
    if (onNavigate) {
      onNavigate('bug-edit', {
        bugId: bug.id,
        returnTo: 'bug-detail',
        returnContext: { bugId: bug.id, returnTo: context?.returnTo, returnContext: context?.returnContext }
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    // 这里应该调用API更新状态
    console.log('更新状态:', newStatus);
    // 暂时更新本地状态（实际应用中应该通过API更新后重新获取数据）
    // 由于这是详情页，我们只是记录操作，实际的状态更新应该在父组件中处理
  };

  const handleCloseBug = () => {
    // 关闭Bug
    console.log('关闭Bug:', bug.id);
    // 这里应该调用API更新Bug的关闭状态
    // 暂时更新本地状态（实际应用中应该通过API更新后重新获取数据）
    setBug(prev => ({ ...prev, closed: true }));
  };

  const handleReopenBug = () => {
    // 重新开放Bug
    console.log('重新开放Bug:', bug.id);
    // 这里应该调用API更新Bug的关闭状态
    // 暂时更新本地状态（实际应用中应该通过API更新后重新获取数据）
    setBug(prev => ({ ...prev, closed: false }));
  };







  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('添加评论:', newComment);
      setNewComment('');
    }
  };

  if (!bug) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Bug不存在</h1>
          <p className="text-muted-foreground mt-2">未找到指定的Bug信息</p>
          <Button className="mt-4" onClick={handleBack}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          
          <div>
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-semibold">{bug.title}</h1>
              {bug.closed && (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                  <Lock className="h-3 w-3 mr-1" />
                  已关闭
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Bug详情和处理记录
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {bug.closed ? (
            <Button variant="outline" onClick={handleReopenBug}>
              <Unlock className="h-4 w-4 mr-2" />
              重新开放
            </Button>
          ) : (
            <Button variant="outline" onClick={handleCloseBug}>
              <Lock className="h-4 w-4 mr-2" />
              关闭Bug
            </Button>
          )}
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要内容区域 */}
        <div className="col-span-8 space-y-6">
          {/* Bug详情 */}
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
                    <ListOrdered className="h-5 w-5" />
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
                      <Target className="h-5 w-5" />
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

          {/* 评论讨论 */}
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
                  placeholder="输入评论内容，支持@成��..."
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

          {/* 修改记录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                修改记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOperationLogs.map((log, index) => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={log.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {log.user.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.user.name}</span>
                        <span className="text-sm text-muted-foreground">{log.action}</span>
                        <span className="text-sm text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground">{log.detail}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1 hover:bg-muted/50">
                      <Badge 
                        variant={statusLabels[bug.status].variant}
                        className={`${statusLabels[bug.status].className} cursor-pointer hover:opacity-80`}
                      >
                        {statusLabels[bug.status].label}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(statusLabels).map(([status, config]) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="cursor-pointer"
                      >
                        <Badge 
                          variant={config.variant}
                          className={config.className}
                        >
                          {config.label}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <span className="text-sm text-muted-foreground">测试人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={bug.tester.avatar} />
                    <AvatarFallback className="text-xs">
                      {bug.tester.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{bug.tester.name}</span>
                </div>
              </div>

              {bug.productOwner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">产品负责人</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={bug.productOwner.avatar} />
                      <AvatarFallback className="text-xs">
                        {bug.productOwner.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{bug.productOwner.name}</span>
                  </div>
                </div>
              )}



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




        </div>
      </div>
    </div>
  );
}