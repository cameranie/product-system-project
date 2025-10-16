import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { User, Attachment, Comment, Reply } from '@/lib/requirements-store';

// 重新导出类型供外部使用
export type { Comment, Reply, User, Attachment } from '@/lib/requirements-store';

/**
 * Hook 配置选项
 */
interface UseCommentsOptions {
  requirementId: string;
  currentUser: User;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onReplyAdded?: (commentId: string, reply: Reply) => void;
  onCommentsChange?: (comments: Comment[]) => void;
}

/**
 * 评论管理 Hook
 * 
 * 功能：
 * - 评论列表管理
 * - 添加评论
 * - 添加回复
 * - 文件附件上传
 * 
 * @example
 * const { comments, handleSubmitComment, handleSubmitReply } = useComments({
 *   requirementId: '#1',
 *   currentUser: mockUsers[0],
 *   initialComments: mockComments
 * });
 */
export function useComments({
  requirementId,
  currentUser,
  initialComments = [],
  onCommentAdded,
  onReplyAdded,
  onCommentsChange
}: UseCommentsOptions) {
  // 状态管理
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [newCommentAttachments, setNewCommentAttachments] = useState<Attachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingAttachments, setEditingAttachments] = useState<Attachment[]>([]);

  /**
   * 处理评论提交
   */
  const handleSubmitComment = useCallback(async () => {
    // 从富文本中提取纯文本内容进行验证
    const getPlainText = (html: string): string => {
      if (typeof window === 'undefined') return html;
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    };
    
    const plainText = getPlainText(newComment).trim();
    
    if (!plainText) {
      toast.error('请输入评论内容');
      return;
    }

    try {
      const { formatDateTime } = await import('@/lib/file-upload-utils');
      const timeString = formatDateTime();
      
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: currentUser,
        createdAt: timeString,
        attachments: newCommentAttachments,
        replies: []
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      setNewComment('');
      setNewCommentAttachments([]);
      toast.success('评论已发布');
      
      onCommentAdded?.(comment);
      onCommentsChange?.(updatedComments);
    } catch (error) {
      console.error('评论提交失败:', error);
      toast.error('评论提交失败，请重试');
    }
  }, [newComment, newCommentAttachments, currentUser, comments, onCommentAdded, onCommentsChange]);

  /**
   * 处理回复提交
   */
  const handleSubmitReply = useCallback(async (commentId: string) => {
    // 从富文本中提取纯文本内容进行验证
    const getPlainText = (html: string): string => {
      if (typeof window === 'undefined') return html;
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    };
    
    const plainText = getPlainText(replyContent).trim();
    
    if (!plainText) {
      toast.error('请输入回复内容');
      return;
    }

    try {
      const { formatDateTime } = await import('@/lib/file-upload-utils');
      const timeString = formatDateTime();
      
      const reply: Reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: currentUser,
        createdAt: timeString,
        attachments: replyAttachments
      };

      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      );
      setComments(updatedComments);

      setReplyContent('');
      setReplyAttachments([]);
      setReplyingTo(null);
      toast.success('回复已发布');
      
      onReplyAdded?.(commentId, reply);
      onCommentsChange?.(updatedComments);
    } catch (error) {
      console.error('回复提交失败:', error);
      toast.error('回复提交失败，请重试');
    }
  }, [replyContent, replyAttachments, currentUser, comments, onReplyAdded, onCommentsChange]);

  /**
   * 处理评论附件变更
   */
  const handleCommentAttachmentsChange = useCallback((attachments: Attachment[]) => {
    setNewCommentAttachments(attachments);
  }, []);

  /**
   * 处理回复附件变更
   */
  const handleReplyAttachmentsChange = useCallback((attachments: Attachment[]) => {
    setReplyAttachments(attachments);
  }, []);

  /**
   * 开始回复某条评论
   */
  const startReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
    setReplyAttachments([]);
  }, []);

  /**
   * 取消回复
   */
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent('');
    setReplyAttachments([]);
  }, []);

  /**
   * 开始编辑评论
   */
  const startEditComment = useCallback((commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditingContent(comment.content);
      setEditingAttachments(comment.attachments);
    }
  }, [comments]);

  /**
   * 取消编辑评论
   */
  const cancelEditComment = useCallback(() => {
    setEditingComment(null);
    setEditingContent('');
    setEditingAttachments([]);
  }, []);

  /**
   * 保存编辑的评论
   */
  const handleSaveEditComment = useCallback(async () => {
    // 从富文本中提取纯文本内容进行验证
    const getPlainText = (html: string): string => {
      if (typeof window === 'undefined') return html;
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    };
    
    const plainText = getPlainText(editingContent).trim();
    
    if (!plainText) {
      toast.error('请输入评论内容');
      return;
    }

    try {
      const updatedComments = comments.map(comment =>
        comment.id === editingComment
          ? { ...comment, content: editingContent, attachments: editingAttachments }
          : comment
      );
      setComments(updatedComments);
      setEditingComment(null);
      setEditingContent('');
      setEditingAttachments([]);
      toast.success('评论已更新');
      onCommentsChange?.(updatedComments);
    } catch (error) {
      console.error('评论更新失败:', error);
      toast.error('评论更新失败，请重试');
    }
  }, [editingComment, editingContent, editingAttachments, comments, onCommentsChange]);

  /**
   * 删除评论
   */
  const handleDeleteComment = useCallback((commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    toast.success('评论已删除');
    onCommentsChange?.(updatedComments);
  }, [comments, onCommentsChange]);

  /**
   * 处理编辑评论的附件变更
   */
  const handleEditAttachmentsChange = useCallback((attachments: Attachment[]) => {
    setEditingAttachments(attachments);
  }, []);

  return {
    // 状态
    comments,
    newComment,
    newCommentAttachments,
    replyingTo,
    replyContent,
    replyAttachments,
    editingComment,
    editingContent,
    editingAttachments,
    
    // 评论操作
    setNewComment,
    handleSubmitComment,
    handleCommentAttachmentsChange,
    startEditComment,
    cancelEditComment,
    setEditingContent,
    handleSaveEditComment,
    handleDeleteComment,
    handleEditAttachmentsChange,
    
    // 回复操作
    setReplyContent,
    handleSubmitReply,
    handleReplyAttachmentsChange,
    startReply,
    cancelReply
  };
} 