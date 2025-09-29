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
  Send
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

interface BugCreatePageProps {
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

export function BugCreatePage({ context, onNavigate }: BugCreatePageProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '中' as '低' | '中' | '高' | '紧急',
    status: '待处理' as '待处理' | '处理中' | '待测试' | '已解决',
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
  const [attachments, setAttachments] = useState<File[]>([]);

  // 初始化表单数据
  useEffect(() => {
    if (context?.relatedRequirementId) {
      // 如果是从需求详情页创建，自动关联需求
      setFormData(prev => ({
        ...prev,
        requirementId: context.relatedRequirementId
      }));
    }
  }, [context]);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo, context.returnContext);
    } else if (onNavigate) {
      onNavigate('bugs');
    }
  };

  const handleSave = () => {
    // 验证必填字段
    if (!formData.title.trim()) {
      alert('请输入Bug标题');
      return;
    }
    if (!formData.assigneeId) {
      alert('请选择处理人');
      return;
    }
    if (!formData.testerId) {
      alert('请选择测试人');
      return;
    }

    // 这里应该调用API保存Bug
    console.log('创建Bug:', formData);
    console.log('附件:', attachments);
    
    // 创建成功后导航到Bug列表
    if (onNavigate) {
      onNavigate('bugs');
    }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <h1 className="text-2xl font-semibold">创建Bug</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              提交新的Bug报告
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBack}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            创建
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
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  选择文件
                </Button>
              </div>

              {/* 已上传的附件列表 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>已上传附件</Label>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
    </div>
  );
}