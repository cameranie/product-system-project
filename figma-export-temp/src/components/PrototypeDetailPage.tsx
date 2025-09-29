import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  Share,
  Download,
  Edit,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  User,
  Tag,
  CheckCircle,
  AlertCircle,
  XCircle,
  Link,
  Plus,
  FileText,
  Calendar,
  Target
} from 'lucide-react';
import { Label } from './ui/label';
import { PrototypeComments } from './PrototypeComments';
import { PrototypeHistory } from './PrototypeHistory';
import { PrototypeLinkedRequirements } from './PrototypeLinkedRequirementsSimplified';

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
  project?: Project;
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

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' },
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
    description: '用户中心的完整交互流程��计���包含登录、注册、个人信息管理等功能模块的原型设计。支持用户信息编辑、头像上传、密码修改、账户安全设置等完整功能。',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    prototypeUrl: 'https://www.figma.com/proto/abc123',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/abc123',
    creator: mockUsers[2],
    project: mockProjects[0],
    createdAt: '2024-12-10 14:30',
    updatedAt: '2024-12-16 09:15',
    tags: ['交互设计', '用户体验', '移动端'],
    isFavorite: true,
    viewCount: 25,
    deviceType: 'Web',
    requirementId: 'req-001',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
  },
  {
    id: '2',
    title: '支付流程原型设计',
    description: '支付系统的完整流程设计，确保支付安全性和用户体验',
    tool: 'Axure',
    status: '待评审',
    priority: '紧急',
    prototypeUrl: 'https://axure.com/proto/payment-flow',
    creator: mockUsers[7],
    project: mockProjects[1],
    createdAt: '2024-12-12 10:22',
    updatedAt: '2024-12-15 16:45',
    tags: ['支付', '安全', '流程设计'],
    isFavorite: false,
    viewCount: 12,
    deviceType: 'Mobile',
    requirementId: 'req-004',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
  },
];

const deviceIcons = {
  'Web': Monitor,
  'Mobile': Smartphone,
  'Tablet': Tablet,
  'Desktop': Monitor
};

const deviceOptions = [
  { value: 'Web', label: 'Web端', icon: Monitor },
  { value: 'Mobile', label: '移动端', icon: Smartphone },
  { value: 'Tablet', label: '平板端', icon: Tablet },
  { value: 'Desktop', label: '桌面端', icon: Monitor }
];

const priorityConfig = {
  '低': { color: 'text-green-600', variant: 'outline' as const },
  '中': { color: 'text-yellow-600', variant: 'secondary' as const },
  '高': { color: 'text-red-600', variant: 'default' as const },
  '紧急': { color: 'text-red-800', variant: 'destructive' as const }
};

const statusConfig = {
  '设计中': { icon: Edit, color: 'text-blue-500', variant: 'secondary' as const },
  '待评审': { icon: Clock, color: 'text-yellow-500', variant: 'outline' as const },
  '评审中': { icon: AlertCircle, color: 'text-blue-500', variant: 'outline' as const },
  '评审通过': { icon: CheckCircle, color: 'text-green-500', variant: 'default' as const },
  '需修改': { icon: XCircle, color: 'text-red-500', variant: 'destructive' as const },
  '已上线': { icon: CheckCircle, color: 'text-green-600', variant: 'default' as const }
};

const requirementStatusConfig = {
  '设计中': { icon: Edit, color: 'text-blue-500', variant: 'secondary' as const },
  '待开发': { icon: Clock, color: 'text-gray-500', variant: 'secondary' as const },
  '开发中': { icon: Target, color: 'text-blue-500', variant: 'default' as const },
  '待测试': { icon: AlertCircle, color: 'text-yellow-500', variant: 'outline' as const },
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

interface PrototypeDetailPageProps {
  prototypeId?: string;
  onNavigate?: (page: string, context?: any) => void;
}

export function PrototypeDetailPage({ prototypeId, onNavigate }: PrototypeDetailPageProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string>('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  
  // 根据ID查找原型，如果没有找到则使用第一个作为示例
  const prototype = mockPrototypes.find(p => p.id === prototypeId) || mockPrototypes[0];
  
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('prototype');
    }
  };

  const handleEdit = () => {
    if (onNavigate) {
      onNavigate('prototype-edit', { prototypeId: prototype.id });
    }
  };

  const handleShare = () => {
    // 分享原型逻辑
    console.log('分享原型:', prototype);
  };

  const handleViewPrototype = () => {
    // 在新窗口打开原型
    window.open(prototype.prototypeUrl, '_blank');
  };

  const handleLinkRequirement = () => {
    // 关联选中的需求
    console.log('关联需求:', selectedRequirement);
    setIsLinkDialogOpen(false);
    setSelectedRequirement('');
  };

  const handleUnlinkRequirement = () => {
    // 取消关联需求
    console.log('取消关联需求:', prototype.requirementId);
  };

  const DeviceIcon = deviceIcons[prototype.deviceType || 'Web'];
  const StatusIcon = statusConfig[prototype.status].icon;

  // 计算总评审状态
  const getOverallReviewStatus = () => {
    if (!prototype.reviewer1 && !prototype.reviewer2) {
      return { status: '无需评审', variant: 'secondary' as const };
    }

    const hasReviewer1 = !!prototype.reviewer1;
    const hasReviewer2 = !!prototype.reviewer2;
    const reviewer1Status = prototype.reviewer1Status || 'pending';
    const reviewer2Status = prototype.reviewer2Status || 'pending';

    // 如果有任何一个评审被拒绝
    if (reviewer1Status === 'rejected' || reviewer2Status === 'rejected') {
      return { status: '评审拒绝', variant: 'destructive' as const };
    }

    // 如果都需要评审且都通过了
    if (hasReviewer1 && hasReviewer2 && reviewer1Status === 'approved' && reviewer2Status === 'approved') {
      return { status: '评审通过', variant: 'default' as const };
    }

    // 如果只有一级评审且通过了
    if (hasReviewer1 && !hasReviewer2 && reviewer1Status === 'approved') {
      return { status: '评审通过', variant: 'default' as const };
    }

    // 如果只有二级评审且通过了
    if (!hasReviewer1 && hasReviewer2 && reviewer2Status === 'approved') {
      return { status: '评审通过', variant: 'default' as const };
    }

    // 其他情况都是待评审或评审中
    return { status: '评审中', variant: 'secondary' as const };
  };

  const overallReviewStatus = getOverallReviewStatus();

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
                <h1 className="text-2xl font-semibold">{prototype.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {prototype.creator.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {prototype.viewCount || 0} 次查看
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    更新于 {prototype.updatedAt}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左���主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 原型预览 */}
            <Card>
              <CardHeader>
                <CardTitle>原型预览</CardTitle>
              </CardHeader>
              <CardContent>
                {prototype.embedUrl ? (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src={prototype.embedUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        无法嵌入预览，请点击查看原型链接
                      </p>
                      <Button onClick={handleViewPrototype}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        打开原型
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 原型讨论评论区 */}
            <PrototypeComments 
              prototypeId={prototype.id} 
              currentUser={{ id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg' }} 
            />

            {/* 创建修改记录 */}
            <PrototypeHistory prototypeId={prototype.id} />
          </div>

          {/* 右侧信息面板 */}
          <div className="space-y-6">
            {/* 评审信息 */}
            {(prototype.reviewer1 || prototype.reviewer2) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    评审管理
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    原型评审流程管理
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 评审总状态 */}
                  <div>
                    <Label className="text-xs text-muted-foreground">当前评审状态</Label>
                    <div className="mt-1 flex items-center gap-2">
                      {(() => {
                        let overallStatus = 'pending';
                        let icon = Clock;
                        let iconColor = 'text-orange-500';
                        
                        if (prototype.reviewer2) {
                          // 有二级评审：需要两级都通过才算通过
                          if (prototype.reviewer1Status === 'approved' && prototype.reviewer2Status === 'approved') {
                            overallStatus = 'approved';
                            icon = CheckCircle;
                            iconColor = 'text-green-500';
                          } else if (prototype.reviewer1Status === 'rejected' || prototype.reviewer2Status === 'rejected') {
                            overallStatus = 'rejected';
                            icon = XCircle;
                            iconColor = 'text-red-500';
                          }
                        } else if (prototype.reviewer1) {
                          // 只有一级评审：总状态等于一级状态
                          if (prototype.reviewer1Status === 'approved') {
                            overallStatus = 'approved';
                            icon = CheckCircle;
                            iconColor = 'text-green-500';
                          } else if (prototype.reviewer1Status === 'rejected') {
                            overallStatus = 'rejected';
                            icon = XCircle;
                            iconColor = 'text-red-500';
                          }
                        }
                        
                        const StatusIcon = icon;
                        
                        return (
                          <>
                            <StatusIcon className={`h-4 w-4 ${iconColor}`} />
                            <Badge variant={
                              overallStatus === 'approved' ? 'default' : 
                              overallStatus === 'rejected' ? 'destructive' : 
                              'secondary'
                            }>
                              {overallStatus === 'approved' ? '评审通过' : 
                               overallStatus === 'rejected' ? '评审不通过' : 
                               prototype.reviewer2 && prototype.reviewer1Status === 'approved' ? '二级评审中' :
                               prototype.reviewer1Status === 'pending' ? '一级评审中' : '待评审'}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <Separator />

                  {/* 一级评审 */}
                  {prototype.reviewer1 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">一级评审人</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prototype.reviewer1.avatar} />
                            <AvatarFallback>{prototype.reviewer1.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prototype.reviewer1.name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            {prototype.reviewer1Status === 'approved' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : prototype.reviewer1Status === 'rejected' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {prototype.reviewer1Status === 'approved' ? '已通过' : 
                               prototype.reviewer1Status === 'rejected' ? '不通过' : 
                               '待评审'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 二级评审 */}
                  {prototype.reviewer2 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">二级评审人</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prototype.reviewer2.avatar} />
                            <AvatarFallback>{prototype.reviewer2.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prototype.reviewer2.name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            {prototype.reviewer2Status === 'approved' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : prototype.reviewer2Status === 'rejected' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {prototype.reviewer2Status === 'approved' ? '已通过' : 
                               prototype.reviewer2Status === 'rejected' ? '不通过' : 
                               '待评审'}
                            </span>
                          </div>
                        </div>
                        {prototype.reviewer1Status !== 'approved' && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <AlertCircle className="h-3 w-3" />
                            需等待一级评审通过
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 如果没有评审人 */}
                  {!prototype.reviewer1 && !prototype.reviewer2 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">暂未指定评审人</div>
                      <div className="text-xs">请联系管理员配置评审人员</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">应用端</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {deviceOptions.find(d => d.value === prototype.deviceType)?.label || 'Web端'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">所属项目</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: prototype.project?.color || '#3b82f6' }}
                    />
                    <span className="text-sm">{prototype.project?.name || '未指定'}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">优先级</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        prototype.priority === '紧急' ? 'destructive' :
                        prototype.priority === '高' ? 'default' :
                        prototype.priority === '中' ? 'secondary' : 'outline'
                      }
                    >
                      {prototype.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">设计工具</Label>
                  <div className="mt-1">
                    <span className="text-sm">{prototype.tool}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">创建人</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={prototype.creator.avatar} />
                      <AvatarFallback>{prototype.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{prototype.creator.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>






            {/* 关联需求 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    关联需求
                  </CardTitle>
                  {!prototype.requirementId && (
                    <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          关联需求
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>选择关联需求</DialogTitle>
                          <p className="text-sm text-muted-foreground">
                            为原型"{prototype.title}"选择一个关联的需求文档
                          </p>
                        </DialogHeader>
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {mockRequirements
                              .filter(req => req.id !== prototype.requirementId)
                              .map(requirement => {
                                const statusConfig = requirementStatusConfig[requirement.status] || requirementStatusConfig['待开发'];
                                const StatusIcon = statusConfig.icon;
                                const isSelected = selectedRequirement === requirement.id;
                                
                                return (
                                  <div
                                    key={requirement.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                      isSelected 
                                        ? 'border-primary bg-primary/5 shadow-sm' 
                                        : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                                    }`}
                                    onClick={() => {
                                      setSelectedRequirement(isSelected ? '' : requirement.id);
                                    }}
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className={`mt-1 w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                      }`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />}
                                      </div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Badge
                                            variant="secondary"
                                            style={{ 
                                              backgroundColor: typeColors[requirement.type] + '20', 
                                              color: typeColors[requirement.type] 
                                            }}
                                            className="text-xs px-2 py-1"
                                          >
                                            {requirement.type}
                                          </Badge>
                                          <Badge variant={statusConfig.variant} className="text-xs px-2 py-1">
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {requirement.status}
                                          </Badge>
                                          {requirement.priority === '紧急' && (
                                            <Badge variant="destructive" className="text-xs px-2 py-1">
                                              {requirement.priority}
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        <h4 className="font-medium text-base leading-tight mb-2">
                                          {requirement.title}
                                        </h4>
                                        
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {requirement.description}
                                        </p>
                                        
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                          {requirement.assignee && (
                                            <div className="flex items-center gap-1.5">
                                              <User className="h-3.5 w-3.5" />
                                              {requirement.assignee.name}
                                            </div>
                                          )}
                                          {requirement.plannedVersion && (
                                            <div className="flex items-center gap-1.5">
                                              <Tag className="h-3.5 w-3.5" />
                                              {requirement.plannedVersion}
                                            </div>
                                          )}
                                          {requirement.dueDate && (
                                            <div className="flex items-center gap-1.5">
                                              <Calendar className="h-3.5 w-3.5" />
                                              {requirement.dueDate}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsLinkDialogOpen(false)}
                          >
                            取消
                          </Button>
                          <Button 
                            onClick={handleLinkRequirement}
                            disabled={!selectedRequirement}
                          >
                            确认关联
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const relatedRequirement = prototype.requirementId 
                    ? mockRequirements.find(req => req.id === prototype.requirementId)
                    : null;
                  
                  if (!relatedRequirement) {
                    return (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium mb-2">暂无关联需求</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          为原型关联一个需求文档，建立设计与需求的追溯关系
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => setIsLinkDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          关联需求
                        </Button>
                      </div>
                    );
                  }
                  
                  const statusConfig = requirementStatusConfig[relatedRequirement.status] || requirementStatusConfig['待开发'];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <h4 
                          className="font-medium text-primary hover:underline cursor-pointer"
                          onClick={() => onNavigate?.('requirement-detail', { 
                            requirementId: relatedRequirement.id,
                            source: 'prototype-detail'
                          })}
                        >
                          {relatedRequirement.title}
                        </h4>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleUnlinkRequirement()}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsLinkDialogOpen(true)}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          更换关联需求
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* 版本历史 */}


            {/* 评审信息 */}


            {/* 时间信息 */}

          </div>
        </div>
      </div>
    </div>
  );
}