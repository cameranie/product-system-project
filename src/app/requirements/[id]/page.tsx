'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ExternalLink,
  Edit,
  Send
} from 'lucide-react';
import type { 
  Requirement, 
  RequirementStatus, 
  RequirementType, 
  ApplicationPlatform,
  Priority,
  User,
  RequirementComment
} from '@/types/issue';

// 配置对象（复用之前的配置）
const requirementTypeConfig = {
  NEW_FEATURE: { label: '新功能', color: 'bg-blue-100 text-blue-800' },
  BUG: { label: 'Bug修复', color: 'bg-red-100 text-red-800' },
  ENHANCEMENT: { label: '功能增强', color: 'bg-green-100 text-green-800' },
  OPTIMIZATION: { label: '优化改进', color: 'bg-purple-100 text-purple-800' },
};

const platformConfig = {
  WEB: { label: 'Web端' },
  MOBILE: { label: '移动端' },
  DESKTOP: { label: '桌面端' },
  API: { label: 'API接口' },
  ALL: { label: '全端' },
};

const priorityConfig = {
  LOW: { label: '低', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: '高', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: '紧急', color: 'bg-red-100 text-red-800' },
};

const statusConfig = {
  PENDING: { label: '待审核', color: 'bg-gray-100 text-gray-800', icon: Clock },
  APPROVED: { label: '审核通过', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: '审核不通过', color: 'bg-red-100 text-red-800', icon: XCircle },
  SCHEDULED: { label: '已排期', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  IN_DEVELOPMENT: { label: '开发中', color: 'bg-purple-100 text-purple-800', icon: Clock },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function RequirementDetailPage() {
  const params = useParams();
  const requirementId = params.id as string;
  
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [comments, setComments] = useState<RequirementComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    const loadRequirement = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟需求详情数据
        const mockRequirement: Requirement = {
          id: requirementId,
          title: '用户头像上传功能优化',
          description: `
            <h3>需求背景</h3>
            <p>当前用户头像上传功能存在以下问题：</p>
            <ul>
              <li>上传速度较慢，用户等待时间长</li>
              <li>不支持图片预览和裁剪</li>
              <li>文件大小限制不够明确</li>
              <li>上传失败后没有明确的错误提示</li>
            </ul>
            
            <h3>目标用户</h3>
            <p>所有需要设置个人头像的用户，特别是新注册用户和需要更新头像的活跃用户。</p>
            
            <h3>功能需求</h3>
            <ol>
              <li><strong>图片压缩优化</strong>：前端自动压缩图片，减少上传时间</li>
              <li><strong>实时预览</strong>：支持上传前预览和简单裁剪</li>
              <li><strong>进度显示</strong>：显示上传进度条</li>
              <li><strong>错误处理</strong>：明确的错误提示和重试机制</li>
              <li><strong>多格式支持</strong>：支持 JPG、PNG、WebP 格式</li>
            </ol>
            
            <h3>期望效果</h3>
            <ul>
              <li>上传时间缩短 50% 以上</li>
              <li>用户体验评分提升</li>
              <li>减少客服关于头像上传的咨询</li>
            </ul>
          `,
          type: 'ENHANCEMENT' as RequirementType,
          platform: 'WEB' as ApplicationPlatform,
          priority: 'HIGH' as Priority,
          status: 'APPROVED' as RequirementStatus,
          submitter: {
            id: 'user-1',
            name: '张三',
            email: 'zhangsan@company.com',
            username: 'zhangsan'
          } as User,
          reviewer: {
            id: 'user-3',
            name: '王五',
            email: 'wangwu@company.com',
            username: 'wangwu'
          } as User,
          assignee: {
            id: 'user-5',
            name: '孙七',
            email: 'sunqi@company.com',
            username: 'sunqi'
          } as User,
          expectedVersion: 'v2.1.0',
          businessValue: '提升用户满意度，减少用户流失率，特别是新用户的首次使用体验。预计可以提升用户留存率 3-5%。',
          userImpact: '影响所有需要上传头像的用户，预计每日约 500-800 次上传操作将受益。',
          technicalRisk: '风险较低。主要涉及前端图片处理和后端接口优化，不涉及核心业务逻辑变更。需要注意不同浏览器的兼容性。',
          attachments: [
            'https://example.com/prototype-v1.figma',
            'https://example.com/user-feedback-analysis.pdf'
          ],
          relatedRequirements: ['req-007', 'req-012'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
          submittedAt: '2024-01-15T10:35:00Z',
          reviewedAt: '2024-01-16T14:20:00Z',
          scheduledAt: '2024-01-16T14:25:00Z',
        };
        
        // 模拟评论数据
        const mockComments: RequirementComment[] = [
          {
            id: 'comment-1',
            content: '这个需求很有价值，用户反馈确实比较多。建议优先处理图片压缩功能。',
            createdAt: '2024-01-15T15:30:00Z',
            author: {
              id: 'user-3',
              name: '王五',
              email: 'wangwu@company.com',
              username: 'wangwu'
            } as User,
            requirementId: requirementId,
          },
          {
            id: 'comment-2',
            content: '技术实现上建议使用 Canvas API 进行图片压缩，WebP 格式可以考虑渐进式支持。',
            createdAt: '2024-01-16T09:15:00Z',
            author: {
              id: 'user-5',
              name: '孙七',
              email: 'sunqi@company.com',
              username: 'sunqi'
            } as User,
            requirementId: requirementId,
          },
        ];
        
        setRequirement(mockRequirement);
        setComments(mockComments);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load requirement:', err);
      } finally {
        setLoading(false);
      }
    };

    if (requirementId) {
      loadRequirement();
    }
  }, [requirementId]);

  const handleBack = () => {
    window.history.back();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comment: RequirementComment = {
        id: `comment-${Date.now()}`,
        content: newComment,
        createdAt: new Date().toISOString(),
        author: {
          id: 'current-user',
          name: '当前用户',
          email: 'current@company.com',
          username: 'current'
        } as User,
        requirementId: requirementId,
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('添加评论失败，请重试');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleStatusChange = async (newStatus: RequirementStatus) => {
    if (!requirement) return;

    try {
      // 这里应该调用API更新状态
      console.log('更新需求状态:', newStatus);
      
      setRequirement(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'APPROVED' && { reviewedAt: new Date().toISOString() }),
        ...(newStatus === 'SCHEDULED' && { scheduledAt: new Date().toISOString() }),
      } : null);
      
      alert('状态更新成功');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('状态更新失败，请重试');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载需求详情中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !requirement) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">加载失败: {error || '需求不存在'}</p>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const StatusIcon = statusConfig[requirement.status].icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold">{requirement.title}</h1>
                <Badge variant="outline" className={statusConfig[requirement.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[requirement.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                需求ID: {requirement.id} • 
                创建于 {new Date(requirement.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              编辑需求
            </Button>
            
            {/* 状态操作 */}
            {requirement.status === 'PENDING' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('REJECTED')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  审核不通过
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleStatusChange('APPROVED')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  审核通过
                </Button>
              </>
            )}
            
            {requirement.status === 'APPROVED' && (
              <Button 
                size="sm"
                onClick={() => handleStatusChange('SCHEDULED')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                加入排期
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 - 占2列 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 需求详情 */}
            <Card>
              <CardHeader>
                <CardTitle>需求详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: requirement.description }}
                />
              </CardContent>
            </Card>

            {/* 商业价值 */}
            {requirement.businessValue && (
              <Card>
                <CardHeader>
                  <CardTitle>商业价值</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{requirement.businessValue}</p>
                </CardContent>
              </Card>
            )}

            {/* 用户影响 */}
            {requirement.userImpact && (
              <Card>
                <CardHeader>
                  <CardTitle>用户影响</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{requirement.userImpact}</p>
                </CardContent>
              </Card>
            )}

            {/* 技术风险 */}
            {requirement.technicalRisk && (
              <Card>
                <CardHeader>
                  <CardTitle>技术风险评估</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{requirement.technicalRisk}</p>
                </CardContent>
              </Card>
            )}

            {/* 评论区 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  讨论与评论 ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 现有评论 */}
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${comment.author.username}`} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}

                {/* 添加评论 */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="添加评论..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isCommenting}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isCommenting ? '发送中...' : '发送评论'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧信息面板 - 占1列 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">需求类型</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={requirementTypeConfig[requirement.type].color}>
                      {requirementTypeConfig[requirement.type].label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">应用端</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {platformConfig[requirement.platform].label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">优先级</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={priorityConfig[requirement.priority].color}>
                      {priorityConfig[requirement.priority].label}
                    </Badge>
                  </div>
                </div>

                {requirement.expectedVersion && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">预期版本</label>
                    <div className="mt-1 text-sm">{requirement.expectedVersion}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 相关人员 */}
            <Card>
              <CardHeader>
                <CardTitle>相关人员</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">需求提出者</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.submitter.username}`} />
                      <AvatarFallback>{requirement.submitter.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{requirement.submitter.name}</span>
                  </div>
                </div>

                {requirement.reviewer && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">审核人</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.reviewer.username}`} />
                        <AvatarFallback>{requirement.reviewer.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{requirement.reviewer.name}</span>
                    </div>
                  </div>
                )}

                {requirement.assignee && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">负责人</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.assignee.username}`} />
                        <AvatarFallback>{requirement.assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{requirement.assignee.name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 附件 */}
            {requirement.attachments && requirement.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>附件资料</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {requirement.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 break-all"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{attachment}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 时间线 */}
            <Card>
              <CardHeader>
                <CardTitle>处理时间线</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-medium">需求创建</div>
                    <div className="text-muted-foreground">
                      {new Date(requirement.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>

                {requirement.submittedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <div className="font-medium">提交审核</div>
                      <div className="text-muted-foreground">
                        {new Date(requirement.submittedAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                )}

                {requirement.reviewedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      requirement.status === 'APPROVED' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <div className="font-medium">
                        {requirement.status === 'APPROVED' ? '审核通过' : '审核不通过'}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(requirement.reviewedAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                )}

                {requirement.scheduledAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div>
                      <div className="font-medium">加入排期</div>
                      <div className="text-muted-foreground">
                        {new Date(requirement.scheduledAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
