import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { DesignLinkedRequirements } from './DesignLinkedRequirementsSimplified';
import { DesignComments } from './DesignComments';
import { DesignHistory } from './DesignHistory';
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



interface Design {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Sketch' | 'Adobe XD' | 'Photoshop' | 'Illustrator' | 'Principle' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  designUrl: string;
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
  designType?: 'UI设计稿' | '图标设计' | '插画设计' | '品牌设计' | 'APP界面' | 'Web界面';
  platform?: string;
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



const mockDesigns: Design[] = [
  {
    id: '1',
    title: '用户中心UI设计稿 v2.0',
    description: '用户中心的完整UI界面设计，包含登录、注册、个人信息管理等功能模块的设计稿。支持用户信息编辑、头像上传、密码修改、账户安全设置等完整功能。',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    designUrl: 'https://www.figma.com/design/abc123',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/design/abc123',
    creator: mockUsers[2],
    createdAt: '2024-12-10 14:30',
    updatedAt: '2024-12-16 09:15',
    tags: ['UI设计', '用户体验', '移动端'],
    isFavorite: true,
    viewCount: 25,
    deviceType: 'Web',
    requirementId: 'req-001',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    designType: 'UI设计稿',
    platform: 'Web端',
  },
];

const deviceOptions = [
  { value: 'Web', label: 'Web端', icon: Monitor },
  { value: 'Mobile', label: '移动端', icon: Smartphone },
  { value: 'Tablet', label: '平板端', icon: Tablet },
  { value: 'Desktop', label: '桌面端', icon: Monitor }
];

const toolOptions = ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Principle', 'Other'];
const statusOptions = ['设计中', '待评审', '评审中', '评审通过', '需修改', '已上线'];
const priorityOptions = ['低', '中', '高', '紧急'];
const designTypeOptions = ['UI设计稿', '图标设计', '插画设计', '品牌设计', 'APP界面', 'Web界面'];
const platforms = ['Web端', '移动端', '全平台', 'PC端', '小程序'];

const reviewerStatusOptions = [
  { value: 'pending', label: '待评审', icon: Clock },
  { value: 'approved', label: '已通过', icon: CheckCircle },
  { value: 'rejected', label: '已拒绝', icon: XCircle }
];

interface DesignEditPageProps {
  designId?: string;
  isCreate?: boolean;
  requirementId?: string; // 新增：关联的需求ID
  requirementTitle?: string; // 新增：需求标题
  returnTo?: string; // 新增：返回页面
  returnContext?: any; // 新增：返回时的上下文
  onNavigate?: (page: string, context?: any) => void;
}

export function DesignEditPage({ 
  designId, 
  isCreate, 
  requirementId,
  requirementTitle,
  returnTo,
  returnContext,
  onNavigate 
}: DesignEditPageProps) {
  // 查找设计稿或创建新设计稿
  const initialDesign = isCreate 
    ? {
        id: '',
        title: requirementTitle ? `${requirementTitle} - UI设计稿` : '',
        description: requirementTitle ? `基于需求"${requirementTitle}"的UI设计稿` : '',
        tool: 'Figma' as const,
        status: '设计中' as const,
        priority: '中' as const,
        designUrl: '',
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
        designType: 'UI设计稿' as const,
        platform: 'Web端',
      }
    : mockDesigns.find(d => d.id === designId) || mockDesigns[0];

  const [design, setDesign] = useState<Partial<Design>>(initialDesign);
  
  // 当前用户（模拟数据）
  const currentUser = mockUsers[0]; // 张三作为当前用户

  const handleBack = () => {
    if (returnTo && returnContext) {
      // 返回到指定页面
      onNavigate?.(returnTo, returnContext);
    } else if (isCreate) {
      onNavigate?.('design-management');
    } else {
      onNavigate?.('design-detail', { designId: design.id });
    }
  };

  const handleSave = () => {
    // 保存逻辑
    console.log('保存设计稿:', design);
    
    if (isCreate) {
      // 创建新设计稿
      const newDesign = {
        ...design,
        id: `design-${Date.now()}`,
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
      console.log('创建新设计稿:', newDesign);
      
      // 如果有返回页面，则返回指定页面，否则返回设计稿管理页面
      if (returnTo && returnContext) {
        onNavigate?.(returnTo, returnContext);
      } else {
        onNavigate?.('design-management');
      }
    } else {
      // 更新现有设计稿
      const updatedDesign = {
        ...design,
        updatedAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-'),
      };
      console.log('更新设计稿:', updatedDesign);
      
      // 如果有返回页面，则返回指定页面，否则返回设计稿详情页
      if (returnTo && returnContext) {
        onNavigate?.(returnTo, returnContext);
      } else {
        onNavigate?.('design-detail', { designId: design.id });
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
                  {isCreate ? '新建设计稿' : '编辑设计稿'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isCreate ? '创建新的设计稿' : '修改设计稿信息和设置'}
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
                    <Label htmlFor="title">设计标题 *</Label>
                    <Input
                      id="title"
                      value={design.title}
                      onChange={(e) => setDesign(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="请输入设计标题"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">设计描述</Label>
                    <Textarea
                      id="description"
                      value={design.description}
                      onChange={(e) => setDesign(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="请输入设计描述"
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="designUrl">设计链接 *</Label>
                    <Input
                      id="designUrl"
                      value={design.designUrl}
                      onChange={(e) => setDesign(prev => ({ ...prev, designUrl: e.target.value }))}
                      placeholder="https://www.figma.com/design/..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="designType">设计类型</Label>
                    <Select 
                      value={design.designType} 
                      onValueChange={(value) => setDesign(prev => ({ ...prev, designType: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择设计类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {designTypeOptions.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 设计讨论评论区 */}
            <DesignComments 
              designId={design.id || 'new'} 
              currentUser={currentUser} 
            />

            {/* 修改记录 */}
            <DesignHistory designId={design.id || 'new'} />
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
                      value={design.deviceType} 
                      onValueChange={(value) => setDesign(prev => ({ ...prev, deviceType: value as any }))}
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
                      value={design.priority} 
                      onValueChange={(value) => setDesign(prev => ({ ...prev, priority: value as any }))}
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
                      value={design.tool} 
                      onValueChange={(value) => setDesign(prev => ({ ...prev, tool: value as any }))}
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

                <div>
                  <Label className="text-xs text-muted-foreground">平台</Label>
                  <div className="mt-1">
                    <Select 
                      value={design.platform} 
                      onValueChange={(value) => setDesign(prev => ({ ...prev, platform: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择平台" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(platform => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
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
                    value={design.reviewer1?.id || undefined} 
                    onValueChange={(value) => {
                      const reviewer = mockUsers.find(u => u.id === value);
                      setDesign(prev => ({ ...prev, reviewer1: reviewer }));
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
                  
                  {design.reviewer1 && (
                    <div>
                      <Label htmlFor="reviewer1Status">一级评审状态</Label>
                      <Select 
                        value={design.reviewer1Status || 'pending'} 
                        onValueChange={(value) => {
                          setDesign(prev => ({ ...prev, reviewer1Status: value as 'pending' | 'approved' | 'rejected' }));
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
                    value={design.reviewer2?.id || 'none'} 
                    onValueChange={(value) => {
                      const reviewer = value !== 'none' ? mockUsers.find(u => u.id === value) : undefined;
                      setDesign(prev => ({ ...prev, reviewer2: reviewer }));
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
                  
                  {design.reviewer2 && (
                    <div>
                      <Label htmlFor="reviewer2Status">二级评审状态</Label>
                      <Select 
                        value={design.reviewer2Status || 'pending'} 
                        onValueChange={(value) => {
                          setDesign(prev => ({ ...prev, reviewer2Status: value as 'pending' | 'approved' | 'rejected' }));
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
            <DesignLinkedRequirements 
              linkedRequirement={design.requirementId}
              onLinkRequirement={(requirementId) => {
                setDesign(prev => ({ ...prev, requirementId }));
              }}
              onUnlinkRequirement={() => {
                setDesign(prev => ({ ...prev, requirementId: undefined }));
              }}
              onNavigateToRequirement={(requirementId) => {
                onNavigate?.('requirement-detail', {
                  requirementId: requirementId,
                  source: 'design-edit'
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