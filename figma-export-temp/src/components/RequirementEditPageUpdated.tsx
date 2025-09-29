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
  GitBranch,
  MousePointer,
  Palette
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
import { RequirementCommentsCompact } from './RequirementCommentsCompact';
import { RequirementHistoryCompact } from './RequirementHistoryCompact';
import { ScheduledReviewSection, ScheduledReviewData } from './ScheduledReviewSection';

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

// 端负责人意见接口
interface EndOwnerOpinion {
  needToDo?: boolean; // 是否要做
  priority?: '高' | '中' | '低'; // 优先级
  opinion?: string; // 意见
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
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  assignee?: User;
  prototypeId?: string;
  designId?: string; // 新增：UI设计稿ID
  endOwnerOpinion?: EndOwnerOpinion; // 新增：端负责人意见
  scheduledReview?: ScheduledReviewData; // 新增：预排期评审数据
}

interface RequirementEditPageProps {
  requirement?: Requirement;
  onSave?: (requirement: Requirement) => void;
  onCancel?: () => void;
  onNavigate?: (page: string, context?: any) => void;
  isEdit?: boolean;
  source?: string;
}

// 评审人员数据 - 与PRD页面保持一致
const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '', email: 'sunqi@example.com' },
];

// Bug统计数据类型
interface BugStatistics {
  total: number;
  byPriorityAndStatus: {
    high: { open: number; closed: number; };
    medium: { open: number; closed: number; };
    low: { open: number; closed: number; };
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
      byPriorityAndStatus: { 
        high: { open: 2, closed: 3 }, 
        medium: { open: 2, closed: 1 }, 
        low: { open: 0, closed: 0 } 
      },
      byStatus: { open: 4, closed: 4 }
    },
    '2': {
      total: 12,
      byPriorityAndStatus: { 
        high: { open: 3, closed: 2 }, 
        medium: { open: 3, closed: 2 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 7, closed: 5 }
    },
    '3': {
      total: 5,
      byPriorityAndStatus: { 
        high: { open: 1, closed: 0 }, 
        medium: { open: 1, closed: 1 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 3, closed: 2 }
    },
    '4': {
      total: 15,
      byPriorityAndStatus: { 
        high: { open: 4, closed: 2 }, 
        medium: { open: 4, closed: 3 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 9, closed: 6 }
    },
    '5': {
      total: 6,
      byPriorityAndStatus: { 
        high: { open: 2, closed: 1 }, 
        medium: { open: 1, closed: 1 }, 
        low: { open: 1, closed: 0 } 
      },
      byStatus: { open: 4, closed: 2 }
    },
    '6': {
      total: 10,
      byPriorityAndStatus: { 
        high: { open: 2, closed: 1 }, 
        medium: { open: 3, closed: 2 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 6, closed: 4 }
    },
    'new': {
      total: 0,
      byPriorityAndStatus: { 
        high: { open: 0, closed: 0 }, 
        medium: { open: 0, closed: 0 }, 
        low: { open: 0, closed: 0 } 
      },
      byStatus: { open: 0, closed: 0 }
    }
  };
  
  return mockStats[requirementId] || {
    total: 0,
    byPriorityAndStatus: { 
      high: { open: 0, closed: 0 }, 
      medium: { open: 0, closed: 0 }, 
      low: { open: 0, closed: 0 } 
    },
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
    reviewer1: requirement?.reviewer1,
    reviewer2: requirement?.reviewer2,
    assignee: requirement?.assignee,
    endOwnerOpinion: requirement?.endOwnerOpinion || {
      needToDo: undefined, // 默认不勾选
      priority: undefined, // 默认不勾选
      opinion: '' // 默认空字符串
    },
    scheduledReview: requirement?.scheduledReview || {
      reviewLevels: [
        {
          id: '1',
          level: 1,
          levelName: '一级评审',
          status: 'pending'
        },
        {
          id: '2',
          level: 2,
          levelName: '二级评审',
          status: 'pending'
        }
      ]
    }
  });



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

  // 处理端负责人意见变更
  const handleEndOwnerOpinionChange = (field: keyof EndOwnerOpinion, value: any) => {
    setFormData(prev => ({
      ...prev,
      endOwnerOpinion: {
        ...prev.endOwnerOpinion,
        [field]: value
      }
    }));
  };

  // 处理预排期评审数据变更
  const handleScheduledReviewChange = (reviewData: ScheduledReviewData) => {
    setFormData(prev => ({
      ...prev,
      scheduledReview: reviewData
    }));
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
    if (!formData.title.trim()) {
      alert('请先输入需求标题再创建PRD');
      return;
    }
    
    if (!isEdit && !formData.id) {
      alert('请先保存需求再创建PRD');
      return;
    }
    
    if (onNavigate) {
      // 为新建需求创建PRD
      onNavigate('prd', { 
        mode: 'create', 
        requirementId: formData.id,
        requirementTitle: formData.title,
        returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
        returnContext: {
          requirementId: formData.id,
          source: source
        }
      });
    }
  };

  const handleNavigateToPrototype = () => {
    if (!formData.title.trim()) {
      alert('请先输入需求标题再创建原型');
      return;
    }
    
    if (!isEdit && !formData.id) {
      alert('请先保存需求再创建原型');
      return;
    }
    
    if (onNavigate) {
      // 检查是否已有关联的交互原型
      const hasPrototype = formData.prototypeId;
      if (hasPrototype) {
        // 已有原型，跳转到原型详情页
        onNavigate('prototype', { 
          mode: 'view', 
          prototypeId: formData.prototypeId,
          requirementId: formData.id,
          requirementTitle: formData.title,
          returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
          returnContext: {
            requirementId: formData.id,
            source: source
          }
        });
      } else {
        // 没有原型，跳转到创建原型页面并自动关联需求
        onNavigate('prototype', { 
          mode: 'create', 
          requirementId: formData.id,
          requirementTitle: formData.title,
          returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
          returnContext: {
            requirementId: formData.id,
            source: source
          }
        });
      }
    }
  };

  const handleNavigateToDesign = () => {
    if (!formData.title.trim()) {
      alert('请先输入需求标题再创建设计稿');
      return;
    }
    
    if (!isEdit && !formData.id) {
      alert('请先保存需求再创建设计稿');
      return;
    }
    
    if (onNavigate) {
      // 检查是否已有关联的UI设计稿
      const hasDesign = formData.designId;
      if (hasDesign) {
        // 已有设计稿，跳转到设计详情页
        onNavigate('design-detail', { 
          designId: formData.designId,
          requirementId: formData.id,
          requirementTitle: formData.title,
          returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
          returnContext: {
            requirementId: formData.id,
            source: source
          }
        });
      } else {
        // 没有设计稿，跳转到创建设计页面并自动关联需求
        onNavigate('design-management', { 
          mode: 'create', 
          requirementId: formData.id,
          requirementTitle: formData.title,
          returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
          returnContext: {
            requirementId: formData.id,
            source: source
          }
        });
      }
    }
  };

  const handleNavigateToBugs = () => {
    if (!formData.title.trim()) {
      alert('请先输入需求标题再提交问题');
      return;
    }
    
    if (!isEdit && !formData.id) {
      alert('请先保存需求再提交问题');
      return;
    }
    
    if (onNavigate) {
      if (bugStats.total > 0) {
        // 已有问题，跳转到问题列表页面
        onNavigate('bugs', { 
          filterRequirementId: formData.id,
          requirementTitle: formData.title,
          returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
          returnContext: {
            requirementId: formData.id,
            source: source
          }
        });
      } else {
        // 还没有问题，跳转到问题创建页面并自动关联需求
        onNavigate('bug-create', {
          mode: 'create',
          relatedRequirementId: formData.id || 'new',
          relatedRequirementTitle: formData.title,
          returnTo: isEdit ? 'requirement-edit' : 'requirement-detail',
          returnContext: {
            requirementId: formData.id,
            source: source
          }
        });
      }
    }
  };

  const handleNavigateToCreateBug = () => {
    // 这个函数现在与handleNavigateToBugs合并了
    handleNavigateToBugs();
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
            <RequirementCommentsCompact 
              requirementId={formData.id} 
              currentUser={mockUsers[0]} 
            />
          )}

          {/* 创建修改记录 - 只在编辑已存在需求时显示 */}
          {isEdit && formData.id && (
            <RequirementHistoryCompact requirementId={formData.id} />
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



          {/* 端负责人意见 */}
          <Card>
            <CardHeader>
              <CardTitle>端负责人意见</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 是否要做 */}
              <div className="space-y-3">
                <Label>是否要做</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needToDo-yes"
                      checked={formData.endOwnerOpinion?.needToDo === true}
                      onCheckedChange={(checked) => 
                        handleEndOwnerOpinionChange('needToDo', checked ? true : undefined)
                      }
                    />
                    <Label htmlFor="needToDo-yes" className="text-sm font-normal cursor-pointer">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needToDo-no"
                      checked={formData.endOwnerOpinion?.needToDo === false}
                      onCheckedChange={(checked) => 
                        handleEndOwnerOpinionChange('needToDo', checked ? false : undefined)
                      }
                    />
                    <Label htmlFor="needToDo-no" className="text-sm font-normal cursor-pointer">
                      否
                    </Label>
                  </div>
                </div>
              </div>

              {/* 优先级 */}
              <div className="space-y-3">
                <Label>优先级</Label>
                <div className="flex gap-4">
                  {['高', '中', '低'].map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={formData.endOwnerOpinion?.priority === priority}
                        onCheckedChange={(checked) => 
                          handleEndOwnerOpinionChange('priority', checked ? priority : undefined)
                        }
                      />
                      <Label htmlFor={`priority-${priority}`} className="text-sm font-normal cursor-pointer">
                        {priority}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 意见 */}
              <div className="space-y-3">
                <Label htmlFor="opinion">意见</Label>
                <Textarea
                  id="opinion"
                  value={formData.endOwnerOpinion?.opinion || ''}
                  onChange={(e) => handleEndOwnerOpinionChange('opinion', e.target.value)}
                  placeholder="请输入端负责人的意见和建议..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 预排期评审 */}
          <ScheduledReviewSection
            data={formData.scheduledReview}
            onChange={handleScheduledReviewChange}
            isEditable={true}
            showTitle={true}
          />

          {/* 快捷操作卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                快捷操作
              </CardTitle>
              <div className="text-xs text-muted-foreground">
{!isEdit && !formData.id ? '保存需求后可使用快捷操作' : '快速访问相关文档和功能'}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* PRD快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">产品需求文档</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToPRD}
                    disabled={!isEdit && !formData.id && !formData.title.trim()}
                  >
                    创建PRD
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  为该需求创建详细的产品需求文档
                </div>
              </div>

              {/* 交互原型快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">交互原型</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToPrototype}
                    disabled={!isEdit && !formData.id && !formData.title.trim()}
                  >
                    创建原型
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  创建可点击的交互原型和逻辑流程
                </div>
              </div>

              {/* UI设计稿快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">UI设计稿</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToDesign}
                    disabled={!isEdit && !formData.id && !formData.title.trim()}
                  >
                    创建设计稿
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  创建精美的UI设计稿和视觉规范
                </div>
              </div>

              {/* Bug追踪快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">问题追踪</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToBugs}
                    disabled={!isEdit && !formData.id && !formData.title.trim()}
                  >
                    {bugStats.total > 0 ? '查看问题' : '提交问题'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {bugStats.total > 0 ? `该需求相关的 ${bugStats.total} 个问题` : '为该需求提交问题反馈'}
                </div>
                
                {/* Bug统计信息 - 只在有Bug时显示 */}
                {bugStats.total > 0 && (
                  <div className="mt-3 space-y-2">
                    <Separator />
                    
                    {/* 优先级统计 */}
                    <div className="space-y-2">
                      {/* 高优先级 */}
                      {(bugStats.byPriorityAndStatus.high.open + bugStats.byPriorityAndStatus.high.closed) > 0 && (
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive" className="text-xs">高</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>开发中: {bugStats.byPriorityAndStatus.high.open}</span>
                            <span>已关闭: {bugStats.byPriorityAndStatus.high.closed}</span>
                            <span>全部: {bugStats.byPriorityAndStatus.high.open + bugStats.byPriorityAndStatus.high.closed}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* 中优先级 */}
                      {(bugStats.byPriorityAndStatus.medium.open + bugStats.byPriorityAndStatus.medium.closed) > 0 && (
                        <div className="flex items-center justify-between">
                          <Badge variant="default" className="text-xs bg-orange-500 hover:bg-orange-600">中</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>开发中: {bugStats.byPriorityAndStatus.medium.open}</span>
                            <span>已关闭: {bugStats.byPriorityAndStatus.medium.closed}</span>
                            <span>全部: {bugStats.byPriorityAndStatus.medium.open + bugStats.byPriorityAndStatus.medium.closed}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* 低优先级 */}
                      {(bugStats.byPriorityAndStatus.low.open + bugStats.byPriorityAndStatus.low.closed) > 0 && (
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">低</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>开发中: {bugStats.byPriorityAndStatus.low.open}</span>
                            <span>已关闭: {bugStats.byPriorityAndStatus.low.closed}</span>
                            <span>全部: {bugStats.byPriorityAndStatus.low.open + bugStats.byPriorityAndStatus.low.closed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* 总体统计 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">总计</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>开发中: {bugStats.byStatus.open}</span>
                        <span>已关闭: {bugStats.byStatus.closed}</span>
                        <span>全部: {bugStats.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}