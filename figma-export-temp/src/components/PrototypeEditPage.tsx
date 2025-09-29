import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PrototypeComments } from './PrototypeComments';
import { PrototypeHistory } from './PrototypeHistory';
import { PrototypeLinkedRequirements } from './PrototypeLinkedRequirementsSimplified';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Paperclip,
  Tag,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Calendar,
  User,
  Target
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}



interface Requirement {
  id: string;
  title: string;
  description?: string;
  status: '设计中' | '待开发' | '开发中' | '待测试' | '测试中' | '待上线' | '已上线' | '已关闭';
  priority: '低' | '中' | '高' | '紧急';
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  creator: User;
  assignee?: User;
  plannedVersion?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  progress?: number;
}

interface Prototype {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Axure' | 'Sketch' | 'Adobe XD' | 'Principle' | 'Framer' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  prototypeUrl: string;
  embedUrl?: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
  viewCount?: number;
  deviceType?: 'Web' | 'Mobile' | 'Tablet' | 'Desktop';
  requirementId?: string;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' },
];



const mockRequirements: Requirement[] = [
  {
    id: 'req-001',
    title: '用户中心交互原型 v2.0',
    description: '基于用户中心交互原型设计，实现用户注册登录流程，提升用户体验，增加第三方登录支持',
    status: '开发中',
    priority: '高',
    type: '系统',
    creator: mockUsers[5],
    assignee: mockUsers[0],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-10 10:30',
    updatedAt: '2024-12-15 14:20',
    dueDate: '2024-12-25',
    progress: 75
  },
  {
    id: 'req-002',
    title: '商品详情页交互优化',
    description: '优化商品详情页的用户交互体验，提升购买转化率',
    status: '待开发',
    priority: '中',
    type: '系统',
    creator: mockUsers[5],
    assignee: mockUsers[1],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-12 09:15',
    updatedAt: '2024-12-16 11:30',
    dueDate: '2024-12-30',
    progress: 0
  },
  {
    id: 'req-003',
    title: '订单管理功能升级',
    description: '完善订单管理功能，支持批量操作和状态筛选',
    status: '待开发',
    priority: '中',
    type: '系统',
    creator: mockUsers[5],
    plannedVersion: 'v2.2.0',
    createdAt: '2024-12-14 16:45',
    updatedAt: '2024-12-16 09:20',
    dueDate: '2025-01-10',
    progress: 0
  },
  {
    id: 'req-004',
    title: '支付流程原型设计',
    description: '基于支付流程原型设计，升级支付安全机制，增加风险检测和防护措施',
    status: '待开发',
    priority: '紧急',
    type: '交易',
    creator: mockUsers[5],
    assignee: mockUsers[3],
    plannedVersion: 'v2.0.5',
    createdAt: '2024-12-08 14:20',
    updatedAt: '2024-12-16 10:15',
    dueDate: '2024-12-22',
    progress: 45
  },
  {
    id: 'req-005',
    title: 'K线图表性能优化',
    description: '优化K线图表渲染性能，支持更大数据量展示',
    status: '测试中',
    priority: '高',
    type: 'K线',
    creator: mockUsers[5],
    assignee: mockUsers[2],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-05 11:30',
    updatedAt: '2024-12-16 15:40',
    dueDate: '2024-12-28',
    progress: 85
  }
];

const mockPrototypes: Prototype[] = [
  {
    id: '1',
    title: '用户中心交互原型 v2.0',
    description: '用户中心的完整交互流程设计，包含登录、注册、个人信息管理等功能模块的原型设计。支持用户信息编辑、头像上传、密码修改、账户安全设置等完整功能。',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    prototypeUrl: 'https://www.figma.com/proto/abc123',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/abc123',
    creator: mockUsers[2],
    createdAt: '2024-12-10 14:30',
    updatedAt: '2024-12-16 09:15',
    tags: ['交互设计', '用户体验', '移动端'],
    isFavorite: true,
    viewCount: 25,
    deviceType: 'Web',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
  },
];

const deviceOptions = [
  { value: 'Web', label: 'Web端', icon: Monitor },
  { value: 'Mobile', label: '移动端', icon: Smartphone },
  { value: 'Tablet', label: '平板端', icon: Tablet },
  { value: 'Desktop', label: '桌面端', icon: Monitor }
];

const toolOptions = ['Figma', 'Axure', 'Sketch', 'Adobe XD', 'Principle', 'Framer', 'Other'];
const statusOptions = ['设计中', '待评审', '评审中', '评审通过', '需修改', '已上线'];
const priorityOptions = ['低', '中', '高', '紧急'];

const reviewerStatusOptions = [
  { value: 'pending', label: '待评审', icon: Clock },
  { value: 'approved', label: '已通过', icon: CheckCircle },
  { value: 'rejected', label: '已拒绝', icon: XCircle }
];

const requirementStatusConfig = {
  '设计中': { icon: Target, color: 'text-blue-500', variant: 'secondary' as const },
  '待开发': { icon: Clock, color: 'text-gray-500', variant: 'secondary' as const },
  '开发中': { icon: Target, color: 'text-blue-500', variant: 'default' as const },
  '待测试': { icon: Clock, color: 'text-yellow-500', variant: 'outline' as const },
  '测试中': { icon: Target, color: 'text-orange-500', variant: 'outline' as const },
  '待上线': { icon: Clock, color: 'text-purple-500', variant: 'outline' as const },
  '已上线': { icon: CheckCircle, color: 'text-green-500', variant: 'default' as const },
  '已关闭': { icon: XCircle, color: 'text-red-500', variant: 'destructive' as const }
};

const typeColors = {
  'K线': '#3b82f6',
  '行情': '#10b981', 
  '聊天室': '#f59e0b',
  '系统': '#ef4444',
  '交易': '#8b5cf6'
};

interface PrototypeEditPageProps {
  prototypeId?: string;
  isCreate?: boolean;
  requirementId?: string; // 新增：关联的需求ID
  requirementTitle?: string; // 新增：需求标题
  returnTo?: string; // 新增：返回页面
  returnContext?: any; // 新增：返回时的上下文
  onNavigate?: (page: string, context?: any) => void;
}

export function PrototypeEditPage({ 
  prototypeId, 
  isCreate, 
  requirementId,
  requirementTitle,
  returnTo,
  returnContext,
  onNavigate 
}: PrototypeEditPageProps) {
  // 查找原型或创建新原型
  const initialPrototype = isCreate 
    ? {
        id: '',
        title: requirementTitle ? `${requirementTitle} - 交互原型` : '',
        description: requirementTitle ? `基于需求"${requirementTitle}"的交互原型设计` : '',
        tool: 'Figma' as const,
        status: '设计中' as const,
        priority: '中' as const,
        prototypeUrl: '',
        embedUrl: '',
        creator: mockUsers[0],
        createdAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-'),
        updatedAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-'),
        tags: [],
        deviceType: 'Web' as const,
        requirementId: requirementId, // 自动关联需求
      }
    : mockPrototypes.find(p => p.id === prototypeId) || mockPrototypes[0];

  const [prototype, setPrototype] = useState<Partial<Prototype>>(initialPrototype);
  const [selectedRequirement, setSelectedRequirement] = useState<string>('');

  const handleBack = () => {
    if (returnTo && returnContext) {
      // 返回到指定页面
      onNavigate?.(returnTo, returnContext);
    } else if (isCreate) {
      onNavigate?.('prototype');
    } else {
      onNavigate?.('prototype-detail', { prototypeId: prototype.id });
    }
  };

  const handleSave = () => {
    // 保存逻辑
    console.log('保存原型:', prototype);
    
    if (isCreate) {
      // 创建新原型
      const newPrototype = {
        ...prototype,
        id: `prototype-${Date.now()}`,
        createdAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-'),
        updatedAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-'),
      };
      console.log('创建新原型:', newPrototype);
      
      // 如果有返回页面，则返回指定页面，否则返回原型管理页面
      if (returnTo && returnContext) {
        onNavigate?.(returnTo, returnContext);
      } else {
        onNavigate?.('prototype');
      }
    } else {
      // 更新现有原型
      const updatedPrototype = {
        ...prototype,
        updatedAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-'),
      };
      console.log('更新原型:', updatedPrototype);
      
      // 如果有返回页面，则返回指定页面，否则返回原型详情页
      if (returnTo && returnContext) {
        onNavigate?.(returnTo, returnContext);
      } else {
        onNavigate?.('prototype-detail', { prototypeId: prototype.id });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">
                  {isCreate ? '新建原型' : '编辑原型'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isCreate ? '创建新的原型设计' : '修改原型信息和设置'}
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
                提交
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">原型标题 *</Label>
                    <Input
                      id="title"
                      value={prototype.title}
                      onChange={(e) => setPrototype(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="请输入原型标题"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">原型描述</Label>
                    <Textarea
                      id="description"
                      value={prototype.description}
                      onChange={(e) => setPrototype(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="请输入原型描述"
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prototypeUrl">原型链接 *</Label>
                    <Input
                      id="prototypeUrl"
                      value={prototype.prototypeUrl}
                      onChange={(e) => setPrototype(prev => ({ ...prev, prototypeUrl: e.target.value }))}
                      placeholder="https://www.figma.com/proto/..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 原型讨论评论区 - 只在编辑已存在原型时显示 */}
            {prototype.id && (
              <PrototypeComments 
                prototypeId={prototype.id} 
                currentUser={{ id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg' }} 
              />
            )}

            {/* 创建修改记录 - 只在编辑已存在原型时显示 */}
            {prototype.id && (
              <PrototypeHistory prototypeId={prototype.id} />
            )}
          </div>

          {/* 右侧信息面板 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">应用端</Label>
                  <div className="mt-1">
                    <Select 
                      value={prototype.deviceType} 
                      onValueChange={(value) => setPrototype(prev => ({ ...prev, deviceType: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择应用端" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceOptions.map(device => {
                          const Icon = device.icon;
                          return (
                            <SelectItem key={device.value} value={device.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {device.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>



                <div>
                  <Label className="text-xs text-muted-foreground">优先级</Label>
                  <div className="mt-1">
                    <Select 
                      value={prototype.priority} 
                      onValueChange={(value) => setPrototype(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择优先级" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            <Badge 
                              variant={
                                priority === '紧急' ? 'destructive' :
                                priority === '高' ? 'default' :
                                priority === '中' ? 'secondary' : 'outline'
                              }
                            >
                              {priority}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">设计工具</Label>
                  <div className="mt-1">
                    <Select 
                      value={prototype.tool} 
                      onValueChange={(value) => setPrototype(prev => ({ ...prev, tool: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择设计工具" />
                      </SelectTrigger>
                      <SelectContent>
                        {toolOptions.map(tool => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 评审设置 */}
            <Card>
              <CardHeader>
                <CardTitle>评审设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="reviewer1">一级评审人员</Label>
                  <Select 
                    value={prototype.reviewer1?.id || undefined} 
                    onValueChange={(value) => {
                      const reviewer = mockUsers.find(u => u.id === value);
                      setPrototype(prev => ({ ...prev, reviewer1: reviewer }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择一级评审人员" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {prototype.reviewer1 && (
                    <div>
                      <Label htmlFor="reviewer1Status">一级评审状态</Label>
                      <Select 
                        value={prototype.reviewer1Status || 'pending'} 
                        onValueChange={(value) => {
                          setPrototype(prev => ({ ...prev, reviewer1Status: value as 'pending' | 'approved' | 'rejected' }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择评审状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">待评审</SelectItem>
                          <SelectItem value="approved">已通过</SelectItem>
                          <SelectItem value="rejected">已拒绝</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="reviewer2">二级评审人员（可选）</Label>
                  <Select 
                    value={prototype.reviewer2?.id || 'none'} 
                    onValueChange={(value) => {
                      const reviewer = value !== 'none' ? mockUsers.find(u => u.id === value) : undefined;
                      setPrototype(prev => ({ ...prev, reviewer2: reviewer }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择二级评审人员" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {prototype.reviewer2 && (
                    <div>
                      <Label htmlFor="reviewer2Status">二级评审状态</Label>
                      <Select 
                        value={prototype.reviewer2Status || 'pending'} 
                        onValueChange={(value) => {
                          setPrototype(prev => ({ ...prev, reviewer2Status: value as 'pending' | 'approved' | 'rejected' }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择评审状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">待评审</SelectItem>
                          <SelectItem value="approved">已通过</SelectItem>
                          <SelectItem value="rejected">已拒绝</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 关联需求 */}
            <PrototypeLinkedRequirements 
              linkedRequirement={prototype.requirementId}
              onLinkRequirement={(requirementId) => {
                setPrototype(prev => ({ ...prev, requirementId }));
              }}
              onUnlinkRequirement={() => {
                setPrototype(prev => ({ ...prev, requirementId: undefined }));
              }}
              onNavigateToRequirement={(requirementId) => {
                onNavigate?.('requirement-detail', {
                  requirementId: requirementId,
                  source: 'prototype-edit'
                });
              }}
              isEditable={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}