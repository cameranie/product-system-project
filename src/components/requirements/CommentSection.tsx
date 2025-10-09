'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Send, Reply as ReplyIcon, Upload, X, Paperclip } from 'lucide-react';
import { UI_SIZES } from '@/config/requirements';
import { useComments, type Comment } from '@/hooks/requirements/useComments';
import type { User } from '@/lib/requirements-store';

interface CommentSectionProps {
  requirementId: string;
  currentUser: User;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

/**
 * 评论区组件
 * 
 * 功能：
 * - 显示评论列表
 * - 添加新评论
 * - 回复评论
 * - 支持附件上传
 * 
 * @example
 * <CommentSection 
 *   requirementId="#1"
 *   currentUser={mockUsers[0]}
 *   initialComments={mockComments}
 * />
 */
export function CommentSection({
  requirementId,
  currentUser,
  initialComments = [],
  onCommentAdded
}: CommentSectionProps) {
  const {
    comments,
    newComment,
    newCommentFiles,
    replyingTo,
    replyContent,
    replyFiles,
    commentFileRef,
    replyFileRef,
    setNewComment,
    handleSubmitComment,
    handleCommentFileUpload,
    removeCommentFile,
    setReplyContent,
    handleSubmitReply,
    handleReplyFileUpload,
    removeReplyFile,
    startReply,
    cancelReply
  } = useComments({
    requirementId,
    currentUser,
    initialComments,
    onCommentAdded
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">评论</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 评论列表 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* 评论主体 */}
              <div className="flex gap-3">
                <Avatar className={UI_SIZES.AVATAR.MEDIUM}>
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                  
                  {/* 评论附件 */}
                  {comment.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {comment.attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                          <Paperclip className="h-3 w-3" />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 回复按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startReply(comment.id)}
                    className="h-7 text-xs"
                  >
                    <ReplyIcon className="h-3 w-3 mr-1" />
                    回复
                  </Button>
                </div>
              </div>

              {/* 回复列表 */}
              {comment.replies.length > 0 && (
                <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={reply.author.avatar} />
                        <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
                        
                        {/* 回复附件 */}
                        {reply.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {reply.attachments.map((file) => (
                              <div key={file.id} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                                <Paperclip className="h-3 w-3" />
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 回复表单 */}
              {replyingTo === comment.id && (
                <div className="ml-11 space-y-2 border-l-2 border-primary pl-4">
                  <Textarea
                    placeholder="输入回复内容..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  
                  {/* 回复附件 */}
                  {replyFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {replyFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
                          <Paperclip className="h-3 w-3" />
                          <span>{file.name}</span>
                          <button
                            onClick={() => removeReplyFile(index)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      ref={replyFileRef}
                      type="file"
                      multiple
                      onChange={handleReplyFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => replyFileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      附件
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      发送
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelReply}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 新评论表单 */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex gap-3">
            <Avatar className={UI_SIZES.AVATAR.MEDIUM}>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="发表评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              
              {/* 评论附件 */}
              {newCommentFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newCommentFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
                      <Paperclip className="h-3 w-3" />
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeCommentFile(index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  ref={commentFileRef}
                  type="file"
                  multiple
                  onChange={handleCommentFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => commentFileRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  附件
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                >
                  <Send className="h-4 w-4 mr-1" />
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 