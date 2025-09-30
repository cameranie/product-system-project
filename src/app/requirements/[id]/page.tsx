'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Edit,
  FileText,
  BarChart3,
  Bug,
  Link,
  Paperclip,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  MousePointer,
  Palette,
  Send,
  Reply,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRequirementsStore, mockUsers, type User, type Project, type Attachment } from '@/lib/requirements-store';
import { PRIORITY_CONFIG, getPriorityConfig } from '@/config/requirements';

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
  user: User;
  timestamp: string;
}

export default function RequirementDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getRequirementById, updateRequirement } = useRequirementsStore();
  const [requirement, setRequirement] = useState<any>(null); // TODO: 使用正确的Requirement类型
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentFiles, setNewCommentFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const commentFileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  // 模拟历史记录数据
  const historyRecords: HistoryRecord[] = [
    {
      id: '1',
      action: '创建',
      field: '需求',
      oldValue: '',
      newValue: '创建了需求',
      user: mockUsers[0],
      timestamp: '2024-01-15 10:30'
    },
    {
      id: '2',
      action: '修改',
      field: '优先级',
      oldValue: '中',
      newValue: '高',
      user: mockUsers[1],
      timestamp: '2024-01-16 14:20'
    },
    {
      id: '3',
      action: '修改',
      field: '状态',
      oldValue: '待评审',
      newValue: '评审中',
      user: mockUsers[2],
      timestamp: '2024-01-18 09:15'
    }
  ];

  // 模拟评论数据
  const mockComments: Comment[] = [
    {
      id: '1',
      content: '这个需求很重要，建议优先处理。需要考虑用户体验的优化。',
      author: mockUsers[1],
      createdAt: '2024-01-16 15:30',
      attachments: [
        { id: '1', name: '用户调研报告.pdf', size: 2048000, type: 'application/pdf', url: '' }
      ],
      replies: [
        {
          id: '1-1',
          content: '同意，我们可以先做一个原型来验证方案。',
          author: mockUsers[2],
          createdAt: '2024-01-16 16:45',
          attachments: []
        }
      ]
    },
    {
      id: '2',
      content: '技术实现上需要注意性能问题，建议分阶段实现。',
      author: mockUsers[3],
      createdAt: '2024-01-17 10:20',
      attachments: [],
      replies: []
    }
  ];

  useEffect(() => {
    const decodedId = decodeURIComponent(params.id);
    const req = getRequirementById(decodedId);
    if (req) {
      setRequirement(req);
      setComments(mockComments);
    }
  }, [params.id, getRequirementById]);

  if (!requirement) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold">需求不存在</h2>
            <p className="text-muted-foreground">找不到指定的需求信息</p>
          </div>
        </div>
      </AppLayout>
    );
  }



  const handleEdit = () => {
    router.push(`/requirements/${params.id}/edit`);
  };

  const handleToggleStatus = async () => {
    if (!requirement) return;
    
    try {
      const newStatus = requirement.isOpen ? false : true;
      await updateRequirement(requirement.id, { isOpen: newStatus });
      
      // 重新获取需求数据以更新UI
      const decodedId = decodeURIComponent(params.id);
      const updatedRequirement = getRequirementById(decodedId);
      if (updatedRequirement) {
        setRequirement(updatedRequirement);
      }
      
      toast.success(newStatus ? '需求已重启' : '需求已关闭');
    } catch (error) {
      toast.error('操作失败，请重试');
    }
  };

  // 处理评论提交
  const handleSubmitComment = async () => {
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
      attachments: await Promise.all(newCommentFiles.map(async (file) => {
        const { FileURLManager, generateSecureId } = await import('@/lib/file-upload-utils');
        return {
          id: generateSecureId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: FileURLManager.createObjectURL(file)
        };
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

  // 状态配置
  const statusConfig = {
    '待评审': { color: 'bg-yellow-100 text-yellow-800' },
    '评审中': { color: 'bg-blue-100 text-blue-800' },
    '评审通过': { color: 'bg-green-100 text-green-800' },
    '评审不通过': { color: 'bg-red-100 text-red-800' },
    '已关闭': { color: 'bg-gray-100 text-gray-800' },
    '开发中': { color: 'bg-purple-100 text-purple-800' },
    '已完成': { color: 'bg-green-100 text-green-800' },
    '设计中': { color: 'bg-orange-100 text-orange-800' }
  };

  const priorityConfig = {
    '低': { color: 'bg-gray-100 text-gray-800' },
    '中': { color: 'bg-yellow-100 text-yellow-800' },
    '高': { color: 'bg-orange-100 text-orange-800' },
    '紧急': { color: 'bg-red-100 text-red-800' }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{requirement.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Badge variant={requirement.isOpen ? "default" : "secondary"} className="text-xs">
                {requirement.isOpen ? 'Open' : 'Closed'}
              </Badge>
              <span>创建时间: {requirement.createdAt}</span>
              <span>by {requirement.creator.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={requirement.isOpen ? "destructive" : "default"}
              onClick={handleToggleStatus}
            >
              {requirement.isOpen ? '关闭需求' : '重启需求'}
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
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
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {requirement.description}
                </div>
              </CardContent>
            </Card>

            {/* 附件 */}
            {requirement.attachments && requirement.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>附件</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {requirement.attachments.map((attachment: Attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          下载
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 评论区 */}
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
                <div className="space-y-2">
                  {historyRecords.map((record) => (
                    <div key={record.id} className="flex items-center gap-3 py-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{record.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium">{record.user.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {record.action}了{record.field}
                          {record.oldValue && record.newValue && (
                            <>：从 "{record.oldValue}" 改为 "{record.newValue}"</>
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
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">需求类型</span>
                  <span className="text-sm">{requirement.type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">优先级</span>
                  <Badge className={`text-xs ${getPriorityConfig(requirement.priority)?.className || 'bg-gray-100 text-gray-800'}`}>
                    {requirement.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">应用端</span>
                  <div className="flex flex-wrap gap-1">
                    {requirement.platforms.map((platform: string) => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
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
              <CardContent className="space-y-4">
                {/* 端负责人选择 */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">端负责人</Label>
                  <Select 
                    value={requirement.endOwnerOpinion?.owner?.id || ''} 
                    onValueChange={(value) => {
                      const selectedUser = mockUsers.find(user => user.id === value);
                      // 这里应该调用更新接口
                      toast.info('端负责人更新功能开发中');
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
                        checked={requirement.endOwnerOpinion?.needToDo === true}
                        onCheckedChange={(checked) => {
                          const currentUser = mockUsers[0];
                          if (currentUser.id === requirement.endOwnerOpinion?.owner?.id) {
                            // 这里应该调用更新接口
                            toast.info('是否要做更新功能开发中');
                          } else {
                            toast.error('只有端负责人才能修改此信息');
                          }
                        }}
                        disabled={mockUsers[0].id !== requirement.endOwnerOpinion?.owner?.id}
                      />
                      <Label htmlFor="needToDo-yes" className="text-sm font-normal cursor-pointer">
                        是
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needToDo-no"
                        checked={requirement.endOwnerOpinion?.needToDo === false}
                        onCheckedChange={(checked) => {
                          const currentUser = mockUsers[0];
                          if (currentUser.id === requirement.endOwnerOpinion?.owner?.id) {
                            // 这里应该调用更新接口
                            toast.info('是否要做更新功能开发中');
                          } else {
                            toast.error('只有端负责人才能修改此信息');
                          }
                        }}
                        disabled={mockUsers[0].id !== requirement.endOwnerOpinion?.owner?.id}
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
                          checked={requirement.endOwnerOpinion?.priority === priority}
                          onCheckedChange={(checked) => {
                            const currentUser = mockUsers[0];
                            if (currentUser.id === requirement.endOwnerOpinion?.owner?.id) {
                              // 这里应该调用更新接口
                              toast.info('优先级更新功能开发中');
                            } else {
                              toast.error('只有端负责人才能修改此信息');
                            }
                          }}
                          disabled={mockUsers[0].id !== requirement.endOwnerOpinion?.owner?.id}
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
                    value={requirement.endOwnerOpinion?.opinion || ''}
                    onChange={(e) => {
                      const currentUser = mockUsers[0];
                      if (currentUser.id === requirement.endOwnerOpinion?.owner?.id) {
                        // 这里应该调用更新接口
                        toast.info('意见更新功能开发中');
                      } else {
                        toast.error('只有端负责人才能修改此信息');
                      }
                    }}
                    placeholder="请输入端负责人意见..."
                    className="min-h-[80px]"
                    disabled={mockUsers[0].id !== requirement.endOwnerOpinion?.owner?.id}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 预排期评审 */}
            <Card>
              <CardHeader>
                <CardTitle>预排期评审</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requirement.scheduledReview?.reviewLevels?.map((level, index) => (
                  <div key={level.id} className="space-y-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{level.levelName}</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">评审人</Label>
                      <Select 
                        value={level.reviewer?.id || ''} 
                        onValueChange={(value) => {
                          const selectedUser = mockUsers.find(user => user.id === value);
                          // 这里应该调用更新接口
                          toast.info('评审人更新功能开发中');
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
                                // 这里应该调用更新接口
                                toast.info('评审状态更新功能开发中');
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
                                // 这里应该调用更新接口
                                toast.info('评审状态更新功能开发中');
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
                            // 这里应该调用更新接口
                            toast.info('评审意见更新功能开发中');
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

                {(!requirement.scheduledReview?.reviewLevels || requirement.scheduledReview.reviewLevels.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">暂无评审级别配置</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  快捷操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* PRD快捷操作 */}
                <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">产品需求文档</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNavigateToPRD}>
                      查看PRD
                    </Button>
                  </div>
                </div>

                {/* 交互原型快捷操作 */}
                <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">交互原型</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNavigateToPrototype}>
                      查看原型
                    </Button>
                  </div>
                </div>

                {/* UI设计稿快捷操作 */}
                <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">UI设计稿</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNavigateToDesign}>
                      查看设计稿
                    </Button>
                  </div>
                </div>

                {/* Bug追踪快捷操作 */}
                <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">问题追踪</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNavigateToBugs}>
                      查看问题
                    </Button>
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
