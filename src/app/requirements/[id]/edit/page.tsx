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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  BarChart3,
  FileText,
  MousePointer,
  Palette,
  Bug,
  Send,
  Reply
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRequirementsStore, mockUsers, mockProjects } from '@/lib/requirements-store';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
}

interface HistoryRecord {
  id: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  user: User;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface EndOwnerOpinion {
  needToDo?: boolean;
  priority?: '高' | '中' | '低';
  opinion?: string;
  owner?: User;
}

interface ScheduledReviewLevel {
  id: string;
  level: number;
  levelName: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: User;
  reviewedAt?: string;
  opinion?: string;
}

interface ScheduledReviewData {
  reviewLevels: ScheduledReviewLevel[];
}

interface RequirementFormData {
  id?: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  description: string;
  tags: string[];
  attachments: Attachment[];
  platforms: string[];
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status: 'pending' | 'approved' | 'rejected';
  reviewer2Status: 'pending' | 'approved' | 'rejected';
  reviewStatus: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  assignee?: User;
  endOwnerOpinion: EndOwnerOpinion;
  scheduledReview: ScheduledReviewData;
  createdAt?: string;
  updatedAt?: string;
}

// 使用全局的 mockUsers 数据

const requirementTypes = ['新功能', '优化', 'BUG', '用户反馈', '商务需求'];
const platformOptions = ['Web端', 'PC端', '移动端'];

// 模拟现有需求数据
const mockExistingRequirement: RequirementFormData = {
  id: 'REQ-001',
  title: '用户登录功能优化',
  type: '优化',
  status: '评审中',
  priority: '高',
  creator: mockUsers[0],
  description: '优化用户登录流程，提升用户体验。包括：\n1. 简化登录表单\n2. 增加记住密码功能\n3. 优化错误提示\n4. 支持第三方登录',
  tags: ['用户体验', '登录', '优化'],
  attachments: [
    { id: '1', name: '登录流程图.png', size: 1024000, type: 'image/png', url: '' },
    { id: '2', name: '需求文档.docx', size: 512000, type: 'application/docx', url: '' }
  ],
  platforms: ['Web端', 'PC端'],
  isOpen: true,
  reviewStatus: 'second_review',
  reviewer1Status: 'approved',
  reviewer2Status: 'pending',
  reviewer1: mockUsers[1],
  reviewer2: mockUsers[2],
  endOwnerOpinion: {
    needToDo: true,
    priority: '高',
    opinion: '这个功能很重要，建议优先处理',
    owner: mockUsers[3]
  },
  scheduledReview: {
    reviewLevels: [
      {
        id: '1',
        level: 1,
        levelName: '一级评审',
        status: 'approved',
        reviewer: mockUsers[1],
        opinion: '功能设计合理，同意开发'
      },
      {
        id: '2',
        level: 2,
        levelName: '二级评审',
        status: 'pending',
        reviewer: mockUsers[2],
        opinion: ''
      }
    ]
  },
  createdAt: '2024-01-15 10:30',
  updatedAt: '2024-01-20 14:25'
};

export default function RequirementEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getRequirementById, updateRequirement } = useRequirementsStore();
  const [formData, setFormData] = useState<RequirementFormData>(mockExistingRequirement);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 评论相关状态
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentFiles, setNewCommentFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);

  // 文件上传引用
  const commentFileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  // 模拟评论数据
  const mockComments: Comment[] = [
    {
      id: '1',
      author: mockUsers[1],
      content: '这个需求很有价值，建议优先处理。需要考虑用户体验的细节。',
      createdAt: '2024-01-16 10:30',
      attachments: [
        { id: '1', name: '用户反馈截图.png', size: 256000, type: 'image/png', url: '' }
      ],
      replies: [
        {
          id: '1-1',
          author: mockUsers[0],
          content: '同意，我会在下个版本中优先实现这个功能。',
          createdAt: '2024-01-16 14:20',
          attachments: []
        }
      ]
    },
    {
      id: '2',
      author: mockUsers[2],
      content: '建议增加A/B测试来验证效果。',
      createdAt: '2024-01-17 09:15',
      attachments: [],
      replies: []
    }
  ];

  // 模拟历史记录数据
  const historyRecords: HistoryRecord[] = [
    {
      id: '1',
      user: mockUsers[0],
      action: '创建了需求',
      field: '',
      oldValue: '',
      newValue: '',
      timestamp: '2024-01-15 10:30'
    },
    {
      id: '2',
      user: mockUsers[1],
      action: '修改了',
      field: '优先级',
      oldValue: '中',
      newValue: '高',
      timestamp: '2024-01-16 14:20'
    },
    {
      id: '3',
      user: mockUsers[2],
      action: '修改了',
      field: '状态',
      oldValue: '待评审',
      newValue: '评审中',
      timestamp: '2024-01-18 09:15'
    },
    {
      id: '4',
      user: mockUsers[0],
      action: '添加了评论',
      field: '',
      oldValue: '',
      newValue: '',
      timestamp: '2024-01-20 16:45'
    }
  ];

  useEffect(() => {
    // 从全局状态加载需求数据
    setLoading(true);
    const requirement = getRequirementById(params.id);
    if (requirement) {
      setFormData({
        id: requirement.id,
        title: requirement.title,
        type: requirement.type,
        status: requirement.status,
        priority: requirement.priority,
        creator: requirement.creator,
        project: requirement.project,
        description: requirement.description,
        tags: requirement.tags,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
        platforms: requirement.platforms,
        plannedVersion: requirement.plannedVersion,
        isOpen: requirement.isOpen,
        needToDo: requirement.needToDo,
        reviewer1: requirement.reviewer1,
        reviewer2: requirement.reviewer2,
        reviewer1Status: requirement.reviewer1Status,
        reviewer2Status: requirement.reviewer2Status,
        reviewStatus: requirement.reviewStatus,
        assignee: requirement.assignee,
        prototypeId: requirement.prototypeId,
        prdId: requirement.prdId,
        attachments: requirement.attachments,
        endOwnerOpinion: requirement.endOwnerOpinion,
        scheduledReview: requirement.scheduledReview
      });
      setComments(mockComments);
    }
    setLoading(false);
  }, [params.id, getRequirementById]);

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

  const handleEndOwnerOpinionChange = (field: keyof EndOwnerOpinion, value: any) => {
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
    const newReviewLevel: ScheduledReviewLevel = {
      id: Date.now().toString(),
      level: newLevel,
      levelName: `${newLevel}级评审`,
      status: 'pending'
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
  const updateReviewLevel = (levelId: string, field: keyof ScheduledReviewLevel, value: any) => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const handleBack = () => {
    if (window.confirm('确定要离开吗？未保存的修改将丢失。')) {
      window.location.href = `/requirements/${params.id}`;
    }
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

    setSaving(true);
    try {
      await updateRequirement(params.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        platforms: formData.platforms,
        endOwnerOpinion: formData.endOwnerOpinion,
        scheduledReview: formData.scheduledReview,
        attachments: formData.attachments
      });
      
      toast.success('需求更新成功！');
      
      // 跳转到需求详情页
      router.push(`/requirements/${params.id}`);
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 快捷操作处理函数
  const handleNavigateToPRD = () => {
    toast.info('PRD功能开发中，敬请期待！');
  };

  const handleNavigateToPrototype = () => {
    toast.info('交互原型功能开发中，敬请期待！');
  };

  const handleNavigateToDesign = () => {
    toast.info('UI设计稿功能开发中，敬请期待！');
  };

  const handleNavigateToBugs = () => {
    toast.info('问题追踪功能开发中，敬请期待！');
  };

  // 处理评论提交
  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: mockUsers[0], // 当前用户
      createdAt: timeString,
      attachments: newCommentFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      })),
      replies: []
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setNewCommentFiles([]);
    toast.success('评论已发布');
  };

  // 处理回复提交
  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const reply: Reply = {
      id: Date.now().toString(),
      content: replyContent,
      author: mockUsers[0], // 当前用户
      createdAt: timeString,
      attachments: replyFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyContent('');
    setReplyFiles([]);
    setReplyingTo(null);
    toast.success('回复已发布');
  };

  // 处理文件上传
  const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewCommentFiles(prev => [...prev, ...files]);
  };

  const handleReplyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReplyFiles(prev => [...prev, ...files]);
  };

  // 移除文件
  const removeCommentFile = (index: number) => {
    setNewCommentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeReplyFile = (index: number) => {
    setReplyFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">加载中...</div>
            <div className="text-sm text-muted-foreground mt-2">正在加载需求信息</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">编辑需求</h1>
              <p className="text-sm text-muted-foreground">
                需求ID: {formData.id} • 最后更新: {formData.updatedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '保存'}
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

            {/* 评论 */}
            <Card>
              <CardHeader>
                <CardTitle>评论 ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 评论列表 */}
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                        </div>
                        <div className="text-sm leading-relaxed">{comment.content}</div>

                        {/* 评论附件 */}
                        {comment.attachments.length > 0 && (
                          <div className="space-y-1">
                            {comment.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.name}</span>
                                <span>({(attachment.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(comment.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          回复
                        </Button>
                      </div>
                    </div>

                    {/* 回复列表 */}
                    {comment.replies.length > 0 && (
                      <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{reply.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{reply.author.name}</span>
                                <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                              </div>
                              <div className="text-xs leading-relaxed">{reply.content}</div>

                              {/* 回复附件 */}
                              {reply.attachments.length > 0 && (
                                <div className="space-y-1">
                                  {reply.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Paperclip className="h-3 w-3" />
                                      <span>{attachment.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 回复输入框 */}
                    {replyingTo === comment.id && (
                      <div className="ml-11 space-y-3 border-l-2 border-blue-200 pl-4">
                        <Textarea
                          placeholder="输入回复内容..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[80px]"
                        />

                        {/* 回复附件 */}
                        {replyFiles.length > 0 && (
                          <div className="space-y-2">
                            {replyFiles.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <Paperclip className="h-3 w-3" />
                                <span className="text-xs flex-1">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeReplyFile(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => replyFileRef.current?.click()}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            附件
                          </Button>
                          <input
                            ref={replyFileRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleReplyFileUpload}
                          />
                          <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                            <Send className="h-3 w-3 mr-1" />
                            回复
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator />
                  </div>
                ))}

                {/* 新评论输入 */}
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="添加评论..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />

                  {/* 评论附件 */}
                  {newCommentFiles.length > 0 && (
                    <div className="space-y-2">
                      {newCommentFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Paperclip className="h-3 w-3" />
                          <span className="text-sm flex-1">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCommentFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => commentFileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      添加附件
                    </Button>
                    <input
                      ref={commentFileRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleCommentFileUpload}
                    />
                    <Button onClick={handleSubmitComment}>
                      <Send className="h-4 w-4 mr-2" />
                      发布评论
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 修改记录 */}
            <Card>
              <CardHeader>
                <CardTitle>修改记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historyRecords.map((record) => (
                    <div key={record.id} className="flex items-center gap-3 py-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{record.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{record.user.name}</span>
                        <span className="text-muted-foreground ml-1">
                          {record.action}
                          {record.field && (
                            <>
                              <span className="font-medium mx-1">{record.field}</span>
                              {record.oldValue && record.newValue && (
                                <>
                                  从 <span className="font-medium">{record.oldValue}</span> 改为 <span className="font-medium">{record.newValue}</span>
                                </>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{record.timestamp}</span>
                    </div>
                  ))}
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
                        checked={formData.endOwnerOpinion?.needToDo === true}
                        onCheckedChange={(checked) => {
                          const currentUser = mockUsers[0];
                          if (currentUser.id === formData.endOwnerOpinion?.owner?.id) {
                            handleEndOwnerOpinionChange('needToDo', checked ? true : undefined);
                          } else {
                            toast.error('只有端负责人才能修改此信息');
                          }
                        }}
                        disabled={mockUsers[0].id !== formData.endOwnerOpinion?.owner?.id}
                      />
                      <Label htmlFor="needToDo-yes" className="text-sm font-normal cursor-pointer">
                        是
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needToDo-no"
                        checked={formData.endOwnerOpinion?.needToDo === false}
                        onCheckedChange={(checked) => {
                          const currentUser = mockUsers[0];
                          if (currentUser.id === formData.endOwnerOpinion?.owner?.id) {
                            handleEndOwnerOpinionChange('needToDo', checked ? false : undefined);
                          } else {
                            toast.error('只有端负责人才能修改此信息');
                          }
                        }}
                        disabled={mockUsers[0].id !== formData.endOwnerOpinion?.owner?.id}
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
                  <div className="flex gap-4">
                    {['高', '中', '低'].map(priority => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={formData.endOwnerOpinion?.priority === priority}
                          onCheckedChange={(checked) => {
                            const currentUser = mockUsers[0];
                            if (currentUser.id === formData.endOwnerOpinion?.owner?.id) {
                              handleEndOwnerOpinionChange('priority', checked ? priority : undefined);
                            } else {
                              toast.error('只有端负责人才能修改此信息');
                            }
                          }}
                          disabled={mockUsers[0].id !== formData.endOwnerOpinion?.owner?.id}
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
                    onChange={(e) => {
                      const currentUser = mockUsers[0];
                      if (currentUser.id === formData.endOwnerOpinion?.owner?.id) {
                        handleEndOwnerOpinionChange('opinion', e.target.value);
                      } else {
                        toast.error('只有端负责人才能修改此信息');
                      }
                    }}
                    placeholder="请输入端负责人意见..."
                    className="min-h-[80px]"
                    disabled={mockUsers[0].id !== formData.endOwnerOpinion?.owner?.id}
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
                              const currentUser = mockUsers[0];
                              if (currentUser.id === level.reviewer?.id) {
                                if (checked) {
                                  updateReviewLevel(level.id, 'status', 'approved');
                                } else {
                                  updateReviewLevel(level.id, 'status', 'pending');
                                }
                              } else {
                                toast.error('只有评审人员才能修改评审状态');
                              }
                            }}
                            disabled={mockUsers[0].id !== level.reviewer?.id}
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
                              const currentUser = mockUsers[0];
                              if (currentUser.id === level.reviewer?.id) {
                                if (checked) {
                                  updateReviewLevel(level.id, 'status', 'rejected');
                                } else {
                                  updateReviewLevel(level.id, 'status', 'pending');
                                }
                              } else {
                                toast.error('只有评审人员才能修改评审状态');
                              }
                            }}
                            disabled={mockUsers[0].id !== level.reviewer?.id}
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
                        onChange={(e) => {
                          const currentUser = mockUsers[0];
                          if (currentUser.id === level.reviewer?.id) {
                            updateReviewLevel(level.id, 'opinion', e.target.value);
                          } else {
                            toast.error('只有评审人员才能填写评审意见');
                          }
                        }}
                        placeholder="请输入评审意见..."
                        className="min-h-[60px] text-sm"
                        disabled={mockUsers[0].id !== level.reviewer?.id}
                      />
                    </div>
                  </div>
                ))}

                {formData.scheduledReview.reviewLevels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                  快速访问相关文档和功能
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