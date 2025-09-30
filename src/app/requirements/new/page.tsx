'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Save,
  X,
  Upload,
  Paperclip,
  Plus,
  Trash2,
  BarChart3,
  FileText,
  MousePointer,
  Palette,
  Bug
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRequirementsStore, mockUsers, mockProjects, type User, type Project, type Requirement } from '@/lib/requirements-store';
import { validateFiles } from '@/lib/file-upload-utils';

// 模拟版本数据
const mockVersions = [
  { id: '1', name: 'v1.0.0', status: '规划中' },
  { id: '2', name: 'v1.1.0', status: '开发中' },
  { id: '3', name: 'v1.2.0', status: '规划中' },
  { id: '4', name: 'v2.0.0', status: '规划中' },
];

// 预定义标签
const predefinedTags = ['UI优化', '性能', '安全', '用户体验', '移动端', '数据分析'];

const requirementTypes = ['新功能', '优化', 'BUG', '用户反馈', '商务需求'];
const platformOptions = ['Web端', 'PC端', '移动端'];

interface RequirementFormData {
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  description: string;
  tags: string[];
  attachments: File[];
  platforms: string[];
  endOwnerOpinion: {
    needToDo?: '是' | '否';
    priority?: '低' | '中' | '高' | '紧急';
    opinion?: string;
    owner?: User;
  };
  scheduledReview: {
    reviewLevels: Array<{
      id: string;
      level: number;
      levelName: string;
      status: 'pending' | 'approved' | 'rejected';
      reviewer?: User;
      opinion?: string;
    }>;
  };
}

export default function CreateRequirementPage() {
  const router = useRouter();
  const { createRequirement, loading } = useRequirementsStore();
  
  // 组件卸载时清理文件URL
  useEffect(() => {
    return () => {
      import('@/lib/file-upload-utils').then(({ FileURLManager }) => {
        FileURLManager.revokeAllURLs();
      });
    };
  }, []);
  
  const [formData, setFormData] = useState<RequirementFormData>({
    title: '',
    type: '新功能',
    description: '',
    tags: [],
    attachments: [],
    platforms: [],
    endOwnerOpinion: {
      needToDo: undefined,
      priority: undefined,
      opinion: '',
      owner: undefined
    },
    scheduledReview: {
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

  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof RequirementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => {
      const currentPlatforms = prev.platforms || [];
      if (checked) {
        if (!currentPlatforms.includes(platform)) {
          return {
            ...prev,
            platforms: [...currentPlatforms, platform]
          };
        }
      } else {
        return {
          ...prev,
          platforms: currentPlatforms.filter(p => p !== platform)
        };
      }
      return prev;
    });
  };

  const handleEndOwnerOpinionChange = (field: string, value: string | boolean | User | undefined) => {
    setFormData(prev => ({
      ...prev,
      endOwnerOpinion: {
        ...prev.endOwnerOpinion,
        [field]: value
      }
    }));
  };

  // 添加评审级别
  const addReviewLevel = () => {
    const newLevel = formData.scheduledReview.reviewLevels.length + 1;
    const newReviewLevel = {
      id: Date.now().toString(),
      level: newLevel,
      levelName: `${newLevel}级评审`,
      status: 'pending' as const
    };
    
    setFormData(prev => ({
      ...prev,
      scheduledReview: {
        ...prev.scheduledReview,
        reviewLevels: [...prev.scheduledReview.reviewLevels, newReviewLevel]
      }
    }));
  };

  // 删除评审级别
  const removeReviewLevel = (levelId: string) => {
    setFormData(prev => {
      const updatedLevels = prev.scheduledReview.reviewLevels
        .filter(level => level.id !== levelId)
        .map((level, index) => ({
          ...level,
          level: index + 1,
          levelName: `${index + 1}级评审`
        }));
      
      return {
        ...prev,
        scheduledReview: {
          ...prev.scheduledReview,
          reviewLevels: updatedLevels
        }
      };
    });
  };

  // 更新评审级别信息
  const updateReviewLevel = (levelId: string, field: string, value: string | User | undefined) => {
    setFormData(prev => ({
      ...prev,
      scheduledReview: {
        ...prev.scheduledReview,
        reviewLevels: prev.scheduledReview.reviewLevels.map(level =>
          level.id === levelId ? { ...level, [field]: value } : level
        )
      }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    try {
      // 动态导入文件验证函数
      const { validateFiles } = await import('@/lib/file-upload-utils');
      const { validFiles, errors } = validateFiles(files, formData.attachments.length);
      
      if (errors.length > 0) {
        toast.error(errors.join(', '));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
      
      if (validFiles.length > 0) {
        toast.success(`成功上传 ${validFiles.length} 个文件`);
      }
    } catch (error) {
      console.error('文件验证失败:', error);
      toast.error('文件验证失败，请重试');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };



  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入需求标题');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('请输入需求描述');
      return;
    }

    try {
      // 转换文件为附件格式
      const { FileURLManager, generateSecureId } = await import('@/lib/file-upload-utils');
      const attachments = formData.attachments.map(file => ({
        id: generateSecureId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: FileURLManager.createObjectURL(file)
      }));

      const requirementData: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        type: formData.type,
        status: '待评审',
        priority: '中',
        creator: mockUsers[0], // 当前用户
        project: mockProjects[0], // 默认项目
        description: formData.description,
        tags: formData.tags,
        platforms: formData.platforms,
        plannedVersion: 'v1.2.0',
        isOpen: true,
        needToDo: formData.endOwnerOpinion.needToDo, // 直接使用，已经是 '是' | '否' 类型
        reviewStatus: 'pending',
        reviewer1Status: 'pending',
        reviewer2Status: 'pending',
        attachments,
        endOwnerOpinion: formData.endOwnerOpinion,
        scheduledReview: formData.scheduledReview
      };
      
      const newRequirement = await createRequirement(requirementData);
      toast.success('需求创建成功！');
      
      // 跳转到需求详情页
      router.push(`/requirements/${newRequirement.id}`);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  // 快捷操作处理函数
  const handleNavigateToPRD = () => {
    if (!formData.title.trim()) {
      toast.error('请先输入需求标题再创建PRD');
      return;
    }
    toast.info('PRD功能开发中，敬请期待！');
  };

  const handleNavigateToPrototype = () => {
    if (!formData.title.trim()) {
      toast.error('请先输入需求标题再创建原型');
      return;
    }
    toast.info('交互原型功能开发中，敬请期待！');
  };

  const handleNavigateToDesign = () => {
    if (!formData.title.trim()) {
      toast.error('请先输入需求标题再创建设计稿');
      return;
    }
    toast.info('UI设计稿功能开发中，敬请期待！');
  };

  const handleNavigateToBugs = () => {
    if (!formData.title.trim()) {
      toast.error('请先输入需求标题再提交问题');
      return;
    }
    toast.info('问题追踪功能开发中，敬请期待！');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">新建需求</h1>
            <p className="text-sm text-muted-foreground">
              填写需求的基本信息，创建后将通知相关处理人员
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? '保存中...' : '提交'}
            </Button>
          </div>
        </div>

        {/* 布局 - 左右分栏 */}
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
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveAttachment(index)}
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
                  <div className="mt-2 flex flex-wrap gap-4">
                    {requirementTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={formData.type === type}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange('type', type);
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`type-${type}`} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
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
                </div>
              </CardContent>
            </Card>

            {/* 端负责人意见 */}
            <Card>
              <CardHeader>
                <CardTitle>端负责人意见</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 端负责人选择 */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">端负责人</Label>
                  <Select 
                    value={formData.endOwnerOpinion?.owner?.id || ''} 
                    onValueChange={(value) => {
                      const selectedUser = mockUsers.find(user => user.id === value);
                      handleEndOwnerOpinionChange('owner', selectedUser);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择端负责人" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 是否要做 */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">是否要做</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needToDo-yes"
                        checked={formData.endOwnerOpinion?.needToDo === '是'}
                        onCheckedChange={(checked) => 
                          handleEndOwnerOpinionChange('needToDo', checked ? '是' : undefined)
                        }
                      />
                      <Label htmlFor="needToDo-yes" className="text-sm font-normal cursor-pointer">
                        是
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needToDo-no"
                        checked={formData.endOwnerOpinion?.needToDo === '否'}
                        onCheckedChange={(checked) => 
                          handleEndOwnerOpinionChange('needToDo', checked ? '否' : undefined)
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
                  <Label className="text-xs text-muted-foreground">优先级</Label>
                  <div className="flex gap-4 flex-wrap">
                    {['低', '中', '高', '紧急'].map(priority => (
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
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">意见</Label>
                  <Textarea
                    value={formData.endOwnerOpinion?.opinion || ''}
                    onChange={(e) => handleEndOwnerOpinionChange('opinion', e.target.value)}
                    placeholder="请输入端负责人意见..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 预排期评审管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    预排期评审管理
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addReviewLevel}
                    className="h-7 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加级别
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.scheduledReview.reviewLevels.map((level, index) => (
                  <div key={level.id} className="space-y-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{level.levelName}</span>
                      {formData.scheduledReview.reviewLevels.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReviewLevel(level.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">评审人</Label>
                      <Select 
                        value={level.reviewer?.id || ''} 
                        onValueChange={(value) => {
                          const selectedUser = mockUsers.find(user => user.id === value);
                          updateReviewLevel(level.id, 'reviewer', selectedUser);
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="选择评审人员" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">评审状态</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`review-approved-${level.id}`}
                            checked={level.status === 'approved'}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateReviewLevel(level.id, 'status', 'approved');
                              } else {
                                updateReviewLevel(level.id, 'status', 'pending');
                              }
                            }}
                          />
                          <Label htmlFor={`review-approved-${level.id}`} className="text-sm font-normal cursor-pointer">
                            评审通过
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`review-rejected-${level.id}`}
                            checked={level.status === 'rejected'}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateReviewLevel(level.id, 'status', 'rejected');
                              } else {
                                updateReviewLevel(level.id, 'status', 'pending');
                              }
                            }}
                          />
                          <Label htmlFor={`review-rejected-${level.id}`} className="text-sm font-normal cursor-pointer">
                            评审不通过
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">评审意见</Label>
                      <Textarea
                        value={level.opinion || ''}
                        onChange={(e) => updateReviewLevel(level.id, 'opinion', e.target.value)}
                        placeholder="请输入评审意见（可不填）..."
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                ))}

                {formData.scheduledReview.reviewLevels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">暂无评审级别，点击"添加级别"开始配置</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快捷操作卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  快捷操作
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  保存需求后可使用快捷操作
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
                      disabled={!formData.title.trim()}
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
                      disabled={!formData.title.trim()}
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
                      disabled={!formData.title.trim()}
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
                      disabled={!formData.title.trim()}
                    >
                      提交问题
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    为该需求提交问题反馈
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
