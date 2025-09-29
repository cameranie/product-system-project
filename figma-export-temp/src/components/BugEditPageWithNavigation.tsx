import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Paperclip,
  Upload,
  Search,
  Bug,
  MessageSquare,
  History,
  Send,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { CheckIcon } from 'lucide-react';
import { Separator } from './ui/separator';

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

interface Bug {
  id: string;
  title: string;
  description?: string;
  priority: '低' | '中' | '高' | '紧急';
  status: '待处理' | '处理中' | '待测试' | '已解决';
  assignee: User;
  tester: User;

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
  closed?: boolean; // 新增：标识bug是否关闭

}

interface BugEditPageProps {
  bugId?: string;
  isCreate?: boolean;
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

// Mock数据
const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '前端开发' },
  { id: '3', name: '王五', avatar: '', role: '后端开发' },
  { id: '4', name: '赵六', avatar: '', role: '后端开发' },
  { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
  { id: '6', name: '测试员B', avatar: '', role: '测试工程师' }
];

const mockProductOwners: ProductOwner[] = [
  { id: 'po1', name: '王小明', avatar: '' },
  { id: 'po2', name: '李晓红', avatar: '' }
];



const mockRequirements: Requirement[] = [
  { id: 'req1', title: '用户登录功能优化' },
  { id: 'req2', title: 'K线图性能优化' },
  { id: 'req3', title: '聊天室消息推送' },
  { id: 'req4', title: '交易下单流程' },
  { id: 'req5', title: '系统监控告警' }
];

const mockBugs: Bug[] = [
  {
    id: '1',
    title: '登录页面在Safari浏览器下出现白屏',
    description: '用户在Safari浏览器（版本14.1.2）下访问登录页面时，页面完全空白，无法显示任何内容。在Chrome和Firefox下正常显示。',
    priority: '高',
    status: '已解决',
    assignee: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    tester: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
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
    closed: true
  }
];

const priorityOptions = [
  { value: '低', label: '低', color: 'text-green-600' },
  { value: '中', label: '中', color: 'text-yellow-600' },
  { value: '高', label: '高', color: 'text-red-600' },
  { value: '紧急', label: '紧急', color: 'text-red-800' }
];

const statusOptions = [
  { value: '待处理', label: '待处理' },
  { value: '处理中', label: '处理中' },
  { value: '待测试', label: '待测试' },
  { value: '已解决', label: '已解决' }
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
    detail: 'Bug\"登录页面在Safari浏览器下出现白屏\"已创建',
    time: '2024-01-16 09:00'
  },
  {
    id: '2',
    user: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    action: '更新了状态',
    detail: '从\"待处理\"更改为\"处理中\"',
    time: '2024-01-16 10:00'
  },
  {
    id: '3',
    user: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    action: '更新了状态',
    detail: '从\"处理中\"更改为\"待测试\"',
    time: '2024-01-16 14:30'
  },
  {
    id: '4',
    user: { id: '5', name: '测试员A', avatar: '', role: '测试工程师' },
    action: '更新了状态',
    detail: '从\"待测试\"更改为\"已解决\"',
    time: '2024-01-16 15:30'
  }
];

export function BugEditPageWithNavigation({ bugId, isCreate = false, context, onNavigate }: BugEditPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '中' as const,
    status: '待处理' as const,
    assigneeId: '',
    testerId: '',
    requirementId: '',
    productOwnerId: '',
    reproductionSteps: '',
    expectedResult: '',
    actualResult: '',
    environment: '',
    testVersion: '',
    testDevice: ''
  });
  const [requirementSearchOpen, setRequirementSearchOpen] = useState(false);
  const [assigneeSearchOpen, setAssigneeSearchOpen] = useState(false);
  const [testerSearchOpen, setTesterSearchOpen] = useState(false);
  const [productOwnerSearchOpen, setProductOwnerSearchOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // 获取当前bug数据
  const currentBug = !isCreate && bugId ? mockBugs.find(b => b.id === bugId) : null;
  const [bugClosed, setBugClosed] = useState(currentBug?.closed || false);

  // 初始化表单数据
  useEffect(() => {
    if (!isCreate && bugId) {
      const bug = mockBugs.find(b => b.id === bugId);
      if (bug) {
        setFormData({
          title: bug.title,
          description: bug.description || '',
          priority: bug.priority,
          status: bug.status,
          assigneeId: bug.assignee.id,
          testerId: bug.tester.id,
          requirementId: bug.requirement?.id || '',
          productOwnerId: bug.productOwner?.id || '',
          reproductionSteps: bug.reproductionSteps || '',
          expectedResult: bug.expectedResult || '',
          actualResult: bug.actualResult || '',
          environment: bug.environment || '',
          testVersion: bug.testVersion || '',
          testDevice: bug.testDevice || ''
        });
        setBugClosed(bug.closed || false);
      }
    } else if (isCreate && context?.relatedRequirementId) {
      // 如果是从需求详情页创建，自动关联需求
      setFormData(prev => ({
        ...prev,
        requirementId: context.relatedRequirementId
      }));
    }
  }, [bugId, isCreate, context]);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo, context.returnContext);
    } else if (onNavigate) {
      onNavigate(isCreate ? 'bugs' : 'bug-detail', isCreate ? undefined : { bugId });
    }
  };

  const handleSave = () => {
    // 这里应该调用API保存Bug
    console.log('保存Bug:', formData);
    
    // 保存成功后导航
    if (isCreate) {
      // 创建成功后导航到Bug列表或详情页
      if (onNavigate) {
        onNavigate('bugs');
      }
    } else {
      // 编辑成功后返回详情页
      if (onNavigate && bugId) {
        onNavigate('bug-detail', { 
          bugId,
          returnTo: context?.returnTo,
          returnContext: context?.returnContext
        });
      }
    }
  };

  const handleCloseBug = () => {
    // 关闭Bug
    console.log('关闭Bug:', bugId);
    // 这里应该调用API更新Bug的关闭状态
    // 暂时更新本地状态（实际应用中应该通过API更新后重新获取数据）
    setBugClosed(true);
  };

  const handleReopenBug = () => {
    // 重新开放Bug
    console.log('重新开放Bug:', bugId);
    // 这里应该调用API更新Bug的关闭状态
    // 暂时更新本地状态（实际应用中应该通过API更新后重新获取数据）
    setBugClosed(false);
  };

  const getSelectedUser = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };



  const getSelectedRequirement = (requirementId: string) => {
    return mockRequirements.find(r => r.id === requirementId);
  };

  const getSelectedProductOwner = (productOwnerId: string) => {
    return mockProductOwners.find(po => po.id === productOwnerId);
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
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-semibold">
                {isCreate ? '创建Bug' : '编辑Bug'}
              </h1>
              {!isCreate && bugClosed && (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                  <Lock className="h-3 w-3 mr-1" />
                  已关闭
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {isCreate ? '提交新的Bug报告' : '修改Bug信息和状态'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCreate && (
            bugClosed ? (
              <Button variant="outline" onClick={handleReopenBug}>
                <Unlock className="h-4 w-4 mr-2" />
                重新开放
              </Button>
            ) : (
              <Button variant="outline" onClick={handleCloseBug}>
                <Lock className="h-4 w-4 mr-2" />
                关闭Bug
              </Button>
            )
          )}
          <Button variant="outline" onClick={handleBack}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {isCreate ? '创建' : '保存'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 主要内容区域 */}
        <div className="col-span-8 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bug标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">Bug标题 *</Label>
                <Input
                  id="title"
                  placeholder="请输入Bug标题"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Bug描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">Bug描述</Label>
                <Textarea
                  id="description"
                  placeholder="请详细描述Bug的现象和影响"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>


            </CardContent>
          </Card>

          {/* 技术细节 */}
          <Card>
            <CardHeader>
              <CardTitle>技术细节</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 复现步骤 */}
              <div className="space-y-2">
                <Label htmlFor="reproductionSteps">复现步骤</Label>
                <Textarea
                  id="reproductionSteps"
                  placeholder="请详细描述如何复现这个Bug"
                  rows={4}
                  value={formData.reproductionSteps}
                  onChange={(e) => setFormData(prev => ({ ...prev, reproductionSteps: e.target.value }))}
                />
              </div>

              {/* 预期结果和实际结果 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedResult">预期结果</Label>
                  <Textarea
                    id="expectedResult"
                    placeholder="期望的正确行为"
                    rows={3}
                    value={formData.expectedResult}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualResult">实际结果</Label>
                  <Textarea
                    id="actualResult"
                    placeholder="实际观察到的错误行为"
                    rows={3}
                    value={formData.actualResult}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualResult: e.target.value }))}
                  />
                </div>
              </div>

              {/* 测试环境 */}
              <div className="space-y-2">
                <Label htmlFor="environment">测试环境</Label>
                <Textarea
                  id="environment"
                  placeholder="操作系统、浏览器版本、设备信息等"
                  rows={3}
                  value={formData.environment}
                  onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                />
              </div>

              {/* 版本和设备 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testVersion">测试版本</Label>
                  <Input
                    id="testVersion"
                    placeholder="如：v2.1.0"
                    value={formData.testVersion}
                    onChange={(e) => setFormData(prev => ({ ...prev, testVersion: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testDevice">测试设备</Label>
                  <Input
                    id="testDevice"
                    placeholder="如：iPhone 12 Pro"
                    value={formData.testDevice}
                    onChange={(e) => setFormData(prev => ({ ...prev, testDevice: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 附件上传 */}
          <Card>
            <CardHeader>
              <CardTitle>附件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  点击上传或拖拽文件到此处
                </p>
                <p className="text-xs text-muted-foreground">
                  支持图片、文档等格式，单个文件不超过10MB
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Paperclip className="h-4 w-4 mr-2" />
                  选择文件
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="col-span-4 space-y-6">
          {/* 任务信息 */}
          <Card>
            <CardHeader>
              <CardTitle>任务信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 优先级 */}
              <div className="space-y-2">
                <Label>优先级 *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 状态 */}
              <div className="space-y-2">
                <Label>状态 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 关联需求 */}
              <div className="space-y-2">
                <Label>关联需求</Label>
                <Popover open={requirementSearchOpen} onOpenChange={setRequirementSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={requirementSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.requirementId
                        ? getSelectedRequirement(formData.requirementId)?.title
                        : "选择关联需求"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="搜索需求..." />
                      <CommandList>
                        <CommandEmpty>未找到相关需求</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, requirementId: '' }));
                              setRequirementSearchOpen(false);
                            }}
                          >
                            无关联需求
                          </CommandItem>
                          {mockRequirements.map((requirement) => (
                            <CommandItem
                              key={requirement.id}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, requirementId: requirement.id }));
                                setRequirementSearchOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={`mr-2 h-4 w-4 ${
                                  formData.requirementId === requirement.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {requirement.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* 人员分配 */}
          <Card>
            <CardHeader>
              <CardTitle>人员分配</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 处理人 */}
              <div className="space-y-2">
                <Label>处理人 *</Label>
                <Popover open={assigneeSearchOpen} onOpenChange={setAssigneeSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assigneeSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.assigneeId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={getSelectedUser(formData.assigneeId)?.avatar} />
                            <AvatarFallback className="text-xs">
                              {getSelectedUser(formData.assigneeId)?.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          {getSelectedUser(formData.assigneeId)?.name}
                        </div>
                      ) : (
                        "选择处理人"
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="搜索成员..." />
                      <CommandList>
                        <CommandEmpty>未找到相关成员</CommandEmpty>
                        <CommandGroup>
                          {mockUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, assigneeId: user.id }));
                                setAssigneeSearchOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={`mr-2 h-4 w-4 ${
                                  formData.assigneeId === user.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {user.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">{user.role}</div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 测试人 */}
              <div className="space-y-2">
                <Label>测试人 *</Label>
                <Popover open={testerSearchOpen} onOpenChange={setTesterSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={testerSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.testerId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={getSelectedUser(formData.testerId)?.avatar} />
                            <AvatarFallback className="text-xs">
                              {getSelectedUser(formData.testerId)?.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          {getSelectedUser(formData.testerId)?.name}
                        </div>
                      ) : (
                        "选择测试人"
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="搜索测试人员..." />
                      <CommandList>
                        <CommandEmpty>未找到相关成员</CommandEmpty>
                        <CommandGroup>
                          {mockUsers.filter(u => u.role?.includes('测试')).map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, testerId: user.id }));
                                setTesterSearchOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={`mr-2 h-4 w-4 ${
                                  formData.testerId === user.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {user.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">{user.role}</div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 产品负责人 */}
              <div className="space-y-2">
                <Label>产品负责人</Label>
                <Popover open={productOwnerSearchOpen} onOpenChange={setProductOwnerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={productOwnerSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.productOwnerId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={getSelectedProductOwner(formData.productOwnerId)?.avatar} />
                            <AvatarFallback className="text-xs">
                              {getSelectedProductOwner(formData.productOwnerId)?.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          {getSelectedProductOwner(formData.productOwnerId)?.name}
                        </div>
                      ) : (
                        "选择产品负责人"
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="搜索产品负责人..." />
                      <CommandList>
                        <CommandEmpty>未找到相关成员</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, productOwnerId: '' }));
                              setProductOwnerSearchOpen(false);
                            }}
                          >
                            无产品负责人
                          </CommandItem>
                          {mockProductOwners.map((productOwner) => (
                            <CommandItem
                              key={productOwner.id}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, productOwnerId: productOwner.id }));
                                setProductOwnerSearchOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={`mr-2 h-4 w-4 ${
                                  formData.productOwnerId === productOwner.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={productOwner.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {productOwner.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                {productOwner.name}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 附件和评论区域 - 仅在编辑模式下显示 */}
      {!isCreate && (
        <div className="space-y-6">

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
      )}
    </div>
  );
}