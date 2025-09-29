import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Reply,
  MoreHorizontal,
  Edit2,
  Trash2,
  Pin
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';

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
  updatedAt?: string;
  replies?: Comment[];
  isPinned?: boolean;
  isEdited?: boolean;
}

interface RequirementCommentsProps {
  requirementId: string;
  currentUser: User;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '/avatars/lisi.jpg', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '/avatars/wangwu.jpg', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '/avatars/zhaoliu.jpg', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '/avatars/sunqi.jpg', email: 'sunqi@example.com' }
];

const mockComments: Comment[] = [
  {
    id: '1',
    content: '这个需求的优先级建议调整为高，因为用户反馈较多，影响用户体验。',
    author: mockUsers[1],
    createdAt: '2024-01-20 14:30',
    isPinned: true,
    replies: [
      {
        id: '1-1', 
        content: '赞同，我这边也收到了类似的用户反馈',
        author: mockUsers[2],
        createdAt: '2024-01-20 15:45'
      }
    ]
  },
  {
    id: '2',
    content: '需要考虑兼容性问题，特别是在移动端的表现。',
    author: mockUsers[2],
    createdAt: '2024-01-21 09:15',
    updatedAt: '2024-01-21 10:20',
    isEdited: true
  },
  {
    id: '3',
    content: '技术方案已经确认，预计开发周期为2周。',
    author: mockUsers[3],
    createdAt: '2024-01-21 16:20'
  }
];

function formatDateTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return dateTimeStr;
  }
}

export function RequirementCommentsCompact({ requirementId, currentUser }: RequirementCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment,
      author: currentUser,
      createdAt: timeStr
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      content: replyContent,
      author: currentUser,
      createdAt: timeStr
    };

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: editContent,
          updatedAt: timeStr,
          isEdited: true
        };
      }
      return comment;
    }));

    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('确定要删除这条评论吗？')) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  const handleTogglePin = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isPinned: !comment.isPinned };
      }
      return comment;
    }));
  };

  const renderComment = (comment: Comment, isReply: boolean = false, parentId?: string) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 pl-3 border-l-2 border-muted' : ''}`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                已编辑
              </Badge>
            )}
            {comment.isPinned && !isReply && (
              <Pin className="h-3 w-3 text-orange-500" />
            )}
          </div>
          
          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveEdit(comment.id)} className="h-7 text-xs">
                  保存
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="h-7 text-xs"
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {comment.content}
              </p>
              
              <div className="flex items-center gap-3 mt-2">
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setReplyingTo(replyingTo === comment.id ? null : comment.id);
                      setReplyContent('');
                    }}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    回复
                  </Button>
                )}

                {comment.author.id === currentUser.id && editingComment !== comment.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-1">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleEditComment(comment.id)}>
                        <Edit2 className="h-3 w-3 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      {!isReply && (
                        <DropdownMenuItem onClick={() => handleTogglePin(comment.id)}>
                          <Pin className="h-3 w-3 mr-2" />
                          {comment.isPinned ? '取消置顶' : '置顶'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}

          {replyingTo === comment.id && (
            <div className="space-y-2 mt-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`回复 ${comment.author.name}...`}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAddReply(comment.id)} className="h-7 text-xs">
                  <Send className="h-3 w-3 mr-1" />
                  回复
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="h-7 text-xs"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
  );

  // 排序：置顶评论在前，然后按时间倒序
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          评论 ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 添加评论 - 压缩版本 */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="text-xs">{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm" className="h-7 text-xs">
              <Send className="h-3 w-3 mr-1" />
              发表评论
            </Button>
          </div>
        </div>

        {/* 评论列表 - 压缩版本 */}
        {sortedComments.length > 0 ? (
          <div className="space-y-4">
            {sortedComments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <div className="text-sm">暂无评论</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}