import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  MessageSquare,
  Send,
  Reply,
  MoreVertical,
  Edit,
  Trash,
  Flag,
  Quote,
  Calendar,
  User
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  parentId?: string; // 父评论ID，用于回复
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
  }[];
}

interface DesignCommentsProps {
  designId: string;
  currentUser: User;
}

const mockComments: Comment[] = [
  {
    id: '1',
    content: '设计稿整体效果很好，用户体验流程清晰明了。建议优化一下按钮的视觉层次，主要操作按钮可以更突出一些。',
    author: { id: '2', name: '李四', avatar: '', role: '产品经理' },
    createdAt: '2024-12-15 14:30'
  },
  {
    id: '2',
    content: '同意李四的建议，另外色彩搭配很棒，符合品牌调性。',
    author: { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
    createdAt: '2024-12-15 15:20',
    parentId: '1'
  },
  {
    id: '3',
    content: '从技术实现角度看，这个设计是可行的。不过需要确认一下交互动效的具体需求。',
    author: { id: '1', name: '张三', avatar: '', role: '前端开发' },
    createdAt: '2024-12-15 16:45'
  },
  {
    id: '4',
    content: '移动端适配需要考虑一下，特别是小屏幕设备上的显示效果。建议增加响应式设计的详细说明。',
    author: { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
    createdAt: '2024-12-16 09:10'
  }
];

export function DesignComments({ designId, currentUser }: DesignCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: currentUser,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content: replyContent,
      author: currentUser,
      parentId,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    };

    setComments(prev => [reply, ...prev]);
    setReplyContent('');
    setReplyTo(null);
  };

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return;

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            content: editContent,
            isEdited: true,
            updatedAt: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\//g, '-')
          }
        : comment
    ));
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  // 获取顶级评论和回复
  const topLevelComments = comments.filter(comment => !comment.parentId);
  const getReplies = (parentId: string) => comments.filter(comment => comment.parentId === parentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          讨论区 ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 添加评论 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="分享你的想法..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  发布评论
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>还没有评论，快来抢沙发吧！</p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* 主评论 */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      {comment.author.role && (
                        <Badge variant="outline" className="text-xs">
                          {comment.author.role}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                      {comment.isEdited && (
                        <span className="text-xs text-muted-foreground">(已编辑)</span>
                      )}
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEditComment(comment.id)}
                          >
                            保存
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        {comment.content}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-4">
                      {/* 回复按钮 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(comment.id)}
                        className="h-7 px-2 text-xs"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        回复
                      </Button>

                      {/* 更多操作 */}
                      {comment.author.id === currentUser.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditContent(comment.content);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive"
                            >
                              <Trash className="h-3 w-3 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* 回复输入框 */}
                    {replyTo === comment.id && (
                      <div className="flex items-start gap-3 pt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback className="text-xs">{currentUser.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder={`回复 ${comment.author.name}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] resize-none"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim()}
                            >
                              回复
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setReplyTo(null);
                                setReplyContent('');
                              }}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 回复列表 */}
                {getReplies(comment.id).map((reply) => (
                  <div key={reply.id} className="ml-11 flex items-start gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.author.avatar} />
                      <AvatarFallback className="text-xs">{reply.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{reply.author.name}</span>
                        {reply.author.role && (
                          <Badge variant="outline" className="text-xs">
                            {reply.author.role}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                      </div>
                      <div className="text-xs leading-relaxed">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}