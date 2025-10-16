'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Reply as ReplyIcon, Edit, Trash2, Save, X as XIcon } from 'lucide-react';
import { UI_SIZES } from '@/config/requirements';
import { useComments, type Comment } from '@/hooks/requirements/useComments';
import type { User } from '@/lib/requirements-store';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface CommentSectionProps {
  requirementId: string;
  currentUser: User;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onCommentsChange?: (comments: Comment[]) => void;
  readOnly?: boolean;
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
  onCommentAdded,
  onCommentsChange,
  readOnly = false
}: CommentSectionProps) {
  const {
    comments,
    newComment,
    newCommentAttachments,
    replyingTo,
    replyContent,
    replyAttachments,
    editingComment,
    editingContent,
    editingAttachments,
    setNewComment,
    handleSubmitComment,
    handleCommentAttachmentsChange,
    setReplyContent,
    handleSubmitReply,
    handleReplyAttachmentsChange,
    startReply,
    cancelReply,
    startEditComment,
    cancelEditComment,
    setEditingContent,
    handleSaveEditComment,
    handleDeleteComment,
    handleEditAttachmentsChange
  } = useComments({
    requirementId,
    currentUser,
    initialComments,
    onCommentAdded,
    onCommentsChange
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                    </div>
                    {!readOnly && comment.author.id === currentUser.id && editingComment !== comment.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditComment(comment.id)}
                          className="h-7 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <RichTextEditor
                        placeholder="编辑评论..."
                        value={editingContent}
                        onChange={setEditingContent}
                        compact={true}
                        attachments={editingAttachments}
                        onAttachmentsChange={handleEditAttachmentsChange}
                        showAttachments={true}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEditComment}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditComment}
                        >
                          <XIcon className="h-4 w-4 mr-1" />
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm">
                        <RichTextEditor
                          value={comment.content}
                          onChange={() => {}}
                          readOnly={true}
                          attachments={comment.attachments}
                          showAttachments={true}
                        />
                      </div>
                      
                      {/* 回复按钮 */}
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startReply(comment.id)}
                          className="h-7 text-xs"
                        >
                          <ReplyIcon className="h-3 w-3 mr-1" />
                          回复
                        </Button>
                      )}
                    </>
                  )}
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
                        <div className="text-sm">
                          <RichTextEditor
                            value={reply.content}
                            onChange={() => {}}
                            readOnly={true}
                            attachments={reply.attachments}
                            showAttachments={true}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 回复表单 */}
              {replyingTo === comment.id && (
                <div className="ml-11 space-y-2 border-l-2 border-primary pl-4">
                  <RichTextEditor
                    placeholder="输入回复内容..."
                    value={replyContent}
                    onChange={setReplyContent}
                    compact={true}
                    attachments={replyAttachments}
                    onAttachmentsChange={handleReplyAttachmentsChange}
                    showAttachments={true}
                  />
                  
                  <div className="flex gap-2">
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
        {!readOnly && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex gap-3">
              <Avatar className={UI_SIZES.AVATAR.MEDIUM}>
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <RichTextEditor
                  placeholder="发表评论..."
                  value={newComment}
                  onChange={setNewComment}
                  compact={true}
                  attachments={newCommentAttachments}
                  onAttachmentsChange={handleCommentAttachmentsChange}
                  showAttachments={true}
                />
                
                <div className="flex gap-2">
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
        )}
      </CardContent>
    </Card>
  );
} 