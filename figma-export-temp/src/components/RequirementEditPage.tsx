import React, { useState, useRef } from 'react';
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Paperclip,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  BarChart3,
  Bug,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { Separator } from './ui/separator';
import { RequirementComments } from './RequirementComments';
import { RequirementHistory } from './RequirementHistory';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Requirement {
  id?: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  description: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  attachments?: Attachment[];
  platforms?: string[];
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer3?: User;
  reviewer4?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewer3Status?: 'pending' | 'approved' | 'rejected';
  reviewer4Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'third_review' | 'fourth_review' | 'approved' | 'rejected';
  assignee?: User;
  prototypeId?: string;
}

interface RequirementEditPageProps {
  requirement?: Requirement;
  onSave?: (requirement: Requirement) => void;
  onCancel?: () => void;
  onNavigate?: (page: string, context?: any) => void;
  isEdit?: boolean;
  source?: string;
}

// 一级评审人员
const firstLevelReviewers: User[] = [
  { id: '1', name: '林嘉娜', avatar: '/avatars/linjianna.jpg', email: 'linjianna@example.com' },
  { id: '2', name: '叶裴锋', avatar: '/avatars/yepeifeng.jpg', email: 'yepeifeng@example.com' }
];

// 二级评审人员
const secondLevelReviewers: User[] = [
  { id: '3', name: '谢焰明', avatar: '/avatars/xieyanming.jpg', email: 'xieyanming@example.com' },
  { id: '4', name: '卢兆锋', avatar: '/avatars/luzhaofeng.jpg', email: 'luzhaofeng@example.com' },
  { id: '5', name: '陆柏良', avatar: '/avatars/lubailiang.jpg', email: 'lubailiang@example.com' },
  { id: '6', name: '杜韦志', avatar: '/avatars/duweizhi.jpg', email: 'duweizhi@example.com' },
  { id: '7', name: '温明震', avatar: '/avatars/wenmingzhen.jpg', email: 'wenmingzhen@example.com' }
];

// 所有评审人员（用于三级四级评审选择）
const allReviewers: User[] = [...firstLevelReviewers, ...secondLevelReviewers];

// 原mockUsers保留作为其他用途
const mockUsers: User[] = [...allReviewers];

// Bug统计数据类型
interface BugStatistics {
  total: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    closed: number;
  };
}

// 根据需求ID获取Bug统计数据（模拟数据）
const getBugStatistics = (requirementId: string): BugStatistics => {
  const mockStats: Record<string, BugStatistics> = {
    '1': {
      total: 8,
      byPriority: { high: 2, medium: 4, low: 2 },
      byStatus: { open: 5, closed: 3 }
    },
    '2': {
      total: 12,
      byPriority: { high: 3, medium: 6, low: 3 },
      byStatus: { open: 7, closed: 5 }
    },
    '3': {
      total: 5,
      byPriority: { high: 1, medium: 2, low: 2 },
      byStatus: { open: 3, closed: 2 }
    },
    '4': {
      total: 15,
      byPriority: { high: 4, medium: 8, low: 3 },
      byStatus: { open: 9, closed: 6 }
    },
    '5': {
      total: 6,
      byPriority: { high: 2, medium: 3, low: 1 },
      byStatus: { open: 4, closed: 2 }
    },
    '6': {
      total: 10,
      byPriority: { high: 3, medium: 5, low: 2 },
      byStatus: { open: 6, closed: 4 }
    },
    'new': {
      total: 0,
      byPriority: { high: 0, medium: 0, low: 0 },
      byStatus: { open: 0, closed: 0 }
    }
  };
  
  return mockStats[requirementId] || {
    total: 0,
    byPriority: { high: 0, medium: 0, low: 0 },
    byStatus: { open: 0, closed: 0 }
  };
};

const requirementTypes = ['新功能', '优化', 'BUG', '用户反馈', '商务需求'];
const priorities = ['低', '中', '高', '紧急'];
const platformOptions = ['web端', 'PC端', '移动端'];

export function RequirementEditPage({ 
  requirement, 
  onSave, 
  onCancel, 
  onNavigate,
  isEdit = false,
  source = 'requirements'
}: RequirementEditPageProps) {
  const [formData, setFormData] = useState<Requirement>({
    id: requirement?.id,
    title: requirement?.title || '',
    type: requirement?.type || '新功能',
    status: requirement?.status || '待评审',
    priority: requirement?.priority || '中',
    creator: requirement?.creator || mockUsers[0],
    description: requirement?.description || '',
    tags: requirement?.tags || [],
    attachments: requirement?.attachments || [],
    platforms: requirement?.platforms || [],
    isOpen: requirement?.isOpen ?? true,
    reviewStatus: requirement?.reviewStatus || 'pending',
    reviewer1Status: requirement?.reviewer1Status || 'pending',
    reviewer2Status: requirement?.reviewer2Status || 'pending',
    reviewer3Status: requirement?.reviewer3Status || 'pending',
    reviewer4Status: requirement?.reviewer4Status || 'pending',
    reviewer1: requirement?.reviewer1,
    reviewer2: requirement?.reviewer2,
    reviewer3: requirement?.reviewer3,
    reviewer4: requirement?.reviewer4,
    assignee: requirement?.assignee
  });

  // 控制评审级别
  const [reviewLevels, setReviewLevels] = useState(2); // 默认二级评审

  // 删除评审级别
  const handleRemoveReviewLevel = (level: number) => {
    if (level === 3) {
      // 删除三级评审
      setReviewLevels(2);
      handleInputChange('reviewer3', undefined);
      handleInputChange('reviewer3Status', 'pending');
    } else if (level === 4) {
      // 删除四级评审
      setReviewLevels(3);
      handleInputChange('reviewer4', undefined);
      handleInputChange('reviewer4Status', 'pending');
    }
  };

  // 获取Bug统计数据
  const bugStats = getBugStatistics(formData.id || 'new');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof Requirement, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => {
      const currentPlatforms = prev.platforms || [];
      if (checked) {
        // 添加平台（如果不存在）
        if (!currentPlatforms.includes(platform)) {
          return {
            ...prev,
            platforms: [...currentPlatforms, platform]
          };
        }
      } else {
        // 移除平台
        return {
          ...prev,
          platforms: currentPlatforms.filter(p => p !== platform)
        };
      }
      return prev;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments]
      }));
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== attachmentId) || []
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('请输入需求标题');
      return;
    }

    if (!formData.description.trim()) {
      alert('请输入需求描述');
      return;
    }

    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-');

    const savedRequirement: Requirement = {
      ...formData,
      id: formData.id || `req-${Date.now()}`,
      createdAt: formData.createdAt || now,
      updatedAt: now
    };

    if (onSave) {
      onSave(savedRequirement);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // 快速操作导航函数
  const handleNavigateToPRD = () => {
    if (onNavigate && formData.title.trim()) {
      // 为新建需求创建PRD
      onNavigate('prd', { 
        mode: 'create', 
        requirementId: formData.id || 'new',
        requirementTitle: formData.title,
        returnTo: 'requirement-edit'
      });
    }
  };

  const handleNavigateToPrototype = () => {
    if (onNavigate && formData.title.trim()) {
      // 为新建需求创建原型设计
      onNavigate('prototype', { 
        mode: 'create', 
        requirementId: formData.id || 'new',
        requirementTitle: formData.title,
        returnTo: 'requirement-edit'
      });
    }
  };

  const handleNavigateToBugs = () => {
    if (onNavigate && formData.title.trim()) {
      // 查看相关测试问题
      onNavigate('bugs', { 
        filterRequirementId: formData.id || 'new',
        requirementTitle: formData.title,
        returnTo: 'requirement-edit'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 - 与需求详情页一致 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {source === 'scheduled-requirements' ? '返回预排期需求' : '返回需求池'}
          </Button>
          <div className="flex items-center gap-2">
            <Badge 
              variant="default"
              className="text-xs"
            >
              {isEdit ? '编辑中' : '新建中'}
            </Badge>
            {formData.title ? (
              <h1 className="text-2xl font-semibold">{formData.title}</h1>
            ) : (
              <h1 className="text-2xl font-semibold text-muted-foreground">请输入需求标题</h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            提交
          </Button>
        </div>
      </div>

      {/* 布局 - 与需求详情页完全一致 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容 - 左侧 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 需求描述 */}
          <Card>
            <CardHeader>
              <CardTitle>需求描述</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">需求标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="请输入需求标题"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">需求描述 *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请详细描述需求内容、背景、目标等..."
                    className="mt-1 min-h-[200px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 附件 */}
          <Card>
            <CardHeader>
              <CardTitle>附件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    上传文件
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <span className="text-sm text-muted-foreground">
                    支持多种文件格式，单个文件不超过10MB
                  </span>
                </div>
                
                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 评论区 - 只在编辑已存在需求时显示 */}
          {isEdit && formData.id && (
            <RequirementComments 
              requirementId={formData.id} 
              currentUser={mockUsers[0]} 
            />
          )}

          {/* 创建修改记录 - 只在编辑已存在需求时显示 */}
          {isEdit && formData.id && (
            <RequirementHistory requirementId={formData.id} />
          )}
        </div>

        {/* 侧边信息 - 右侧 1/3 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">需求类型</Label>
                <div className="mt-1">
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requirementTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">优先级</Label>
                <div className="mt-1">
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: any) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
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
                <Label className="text-xs text-muted-foreground">应用端</Label>
                <div className="mt-2 flex flex-wrap gap-4">
                  {platformOptions.map(platform => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={formData.platforms?.includes(platform) || false}
                        onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`platform-${platform}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {/* 显示已选择的平台 */}
                {formData.platforms && formData.platforms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.platforms.map(platform => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 评审管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  评审管理
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReviewLevels(prev => Math.min(prev + 1, 4))}
                    disabled={reviewLevels >= 4}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {reviewLevels}级评审
                  </span>
                </div>
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                需求池评审流程管理
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 一级评审人 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <Label className="text-xs text-muted-foreground">一级评审人</Label>
                <div className="space-y-2 mt-1">
                  <Select 
                    value={formData.reviewer1?.id || 'none'} 
                    onValueChange={(value) => {
                      const reviewer = value === 'none' ? undefined : firstLevelReviewers.find(u => u.id === value);
                      handleInputChange('reviewer1', reviewer);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择一级评审人" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">不指定</SelectItem>
                      {firstLevelReviewers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* 一级评审状态 */}
                  {formData.reviewer1 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">一级评审状态</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reviewer1-approved"
                              checked={formData.reviewer1Status === 'approved'}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('reviewer1Status', 'approved');
                                } else {
                                  handleInputChange('reviewer1Status', 'pending');
                                }
                              }}
                            />
                            <Label htmlFor="reviewer1-approved" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              评审通过
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reviewer1-rejected"
                              checked={formData.reviewer1Status === 'rejected'}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('reviewer1Status', 'rejected');
                                } else {
                                  handleInputChange('reviewer1Status', 'pending');
                                }
                              }}
                            />
                            <Label htmlFor="reviewer1-rejected" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-500" />
                              评审不通过
                            </Label>
                          </div>
                        </div>
                        {formData.reviewer1Status === 'pending' && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <Clock className="h-3 w-3" />
                            待评审
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 二级评审人 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <Label className="text-xs text-muted-foreground">二级评审人</Label>
                <div className="space-y-2 mt-1">
                  <Select 
                    value={formData.reviewer2?.id || 'none'} 
                    onValueChange={(value) => {
                      const reviewer = value === 'none' ? undefined : secondLevelReviewers.find(u => u.id === value);
                      handleInputChange('reviewer2', reviewer);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择二级评审人" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">不指定</SelectItem>
                      {secondLevelReviewers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* 二级评审状态 */}
                  {formData.reviewer2 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">二级评审状态</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reviewer2-approved"
                              checked={formData.reviewer2Status === 'approved'}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('reviewer2Status', 'approved');
                                } else {
                                  handleInputChange('reviewer2Status', 'pending');
                                }
                              }}
                            />
                            <Label htmlFor="reviewer2-approved" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              评审通过
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reviewer2-rejected"
                              checked={formData.reviewer2Status === 'rejected'}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('reviewer2Status', 'rejected');
                                } else {
                                  handleInputChange('reviewer2Status', 'pending');
                                }
                              }}
                            />
                            <Label htmlFor="reviewer2-rejected" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-500" />
                              评审不通过
                            </Label>
                          </div>
                        </div>
                        {formData.reviewer2Status === 'pending' && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <Clock className="h-3 w-3" />
                            待评审
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 三级评审人 */}
              {reviewLevels >= 3 && (
                <div className="relative group p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  {/* 删除按钮 - 仅在hover时显示 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveReviewLevel(3)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <Label className="text-xs text-muted-foreground">三级评审人</Label>
                  <div className="space-y-2 mt-1">
                    <Select 
                      value={formData.reviewer3?.id || 'none'} 
                      onValueChange={(value) => {
                        const reviewer = value === 'none' ? undefined : allReviewers.find(u => u.id === value);
                        handleInputChange('reviewer3', reviewer);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择三级评审人" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不指定</SelectItem>
                        {allReviewers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* 三级评审状态 */}
                    {formData.reviewer3 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">三级评审状态</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="reviewer3-approved"
                                checked={formData.reviewer3Status === 'approved'}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('reviewer3Status', 'approved');
                                  } else {
                                    handleInputChange('reviewer3Status', 'pending');
                                  }
                                }}
                              />
                              <Label htmlFor="reviewer3-approved" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                评审通过
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="reviewer3-rejected"
                                checked={formData.reviewer3Status === 'rejected'}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('reviewer3Status', 'rejected');
                                  } else {
                                    handleInputChange('reviewer3Status', 'pending');
                                  }
                                }}
                              />
                              <Label htmlFor="reviewer3-rejected" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-500" />
                                评审不通过
                              </Label>
                            </div>
                          </div>
                          {formData.reviewer3Status === 'pending' && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <Clock className="h-3 w-3" />
                              待评审
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 四级评审人 */}
              {reviewLevels >= 4 && (
                <div className="relative group p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  {/* 删除按钮 - 仅在hover时显示 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveReviewLevel(4)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <Label className="text-xs text-muted-foreground">四级评审人</Label>
                  <div className="space-y-2 mt-1">
                    <Select 
                      value={formData.reviewer4?.id || 'none'} 
                      onValueChange={(value) => {
                        const reviewer = value === 'none' ? undefined : allReviewers.find(u => u.id === value);
                        handleInputChange('reviewer4', reviewer);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择四级评审人" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不指定</SelectItem>
                        {allReviewers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* 四级评审状态 */}
                    {formData.reviewer4 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">四级评审状态</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="reviewer4-approved"
                                checked={formData.reviewer4Status === 'approved'}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('reviewer4Status', 'approved');
                                  } else {
                                    handleInputChange('reviewer4Status', 'pending');
                                  }
                                }}
                              />
                              <Label htmlFor="reviewer4-approved" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                评审通过
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="reviewer4-rejected"
                                checked={formData.reviewer4Status === 'rejected'}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('reviewer4Status', 'rejected');
                                  } else {
                                    handleInputChange('reviewer4Status', 'pending');
                                  }
                                }}
                              />
                              <Label htmlFor="reviewer4-rejected" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-500" />
                                评审不通过
                              </Label>
                            </div>
                          </div>
                          {formData.reviewer4Status === 'pending' && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <Clock className="h-3 w-3" />
                              待评审
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPRD}
                disabled={!formData.title.trim()}
              >
                <FileText className="h-4 w-4 mr-2" />
                创建PRD文档
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPrototype}
                disabled={!formData.title.trim()}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                创建原型设计
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToBugs}
                disabled={!formData.title.trim()}
              >
                <Bug className="h-4 w-4 mr-2" />
                查看相关Bug
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}