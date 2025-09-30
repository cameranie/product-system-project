import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { User, Attachment } from '@/lib/requirements-store';

/**
 * 评论接口
 */
export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
  replies: Reply[];
}

/**
 * 回复接口
 */
export interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
}

/**
 * Hook 配置选项
 */
interface UseCommentsOptions {
  requirementId: string;
  currentUser: User;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onReplyAdded?: (commentId: string, reply: Reply) => void;
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
  onReplyAdded
}: UseCommentsOptions) {
  // 状态管理
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [newCommentFiles, setNewCommentFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  
  // Refs
  const commentFileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  /**
   * 处理评论提交
   */
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    try {
      const { formatDateTime, FileURLManager, generateSecureId } = await import('@/lib/file-upload-utils');
      const timeString = formatDateTime();
      
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: currentUser,
        createdAt: timeString,
        attachments: await Promise.all(newCommentFiles.map(async (file) => ({
          id: generateSecureId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: FileURLManager.createObjectURL(file)
        }))),
        replies: []
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');
      setNewCommentFiles([]);
      toast.success('评论已发布');
      
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('评论提交失败:', error);
      toast.error('评论提交失败，请重试');
    }
  }, [newComment, newCommentFiles, currentUser, onCommentAdded]);

  /**
   * 处理回复提交
   */
  const handleSubmitReply = useCallback(async (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    try {
      const { formatDateTime, FileURLManager, generateSecureId } = await import('@/lib/file-upload-utils');
      const timeString = formatDateTime();
      
      const reply: Reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: currentUser,
        createdAt: timeString,
        attachments: await Promise.all(replyFiles.map(async (file) => ({
          id: generateSecureId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: FileURLManager.createObjectURL(file)
        })))
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
      
      onReplyAdded?.(commentId, reply);
    } catch (error) {
      console.error('回复提交失败:', error);
      toast.error('回复提交失败，请重试');
    }
  }, [replyContent, replyFiles, currentUser, onReplyAdded]);

  /**
   * 处理评论文件上传
   */
  const handleCommentFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewCommentFiles(prev => [...prev, ...files]);
  }, []);

  /**
   * 处理回复文件上传
   */
  const handleReplyFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReplyFiles(prev => [...prev, ...files]);
  }, []);

  /**
   * 移除评论文件
   */
  const removeCommentFile = useCallback((index: number) => {
    setNewCommentFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 移除回复文件
   */
  const removeReplyFile = useCallback((index: number) => {
    setReplyFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 开始回复某条评论
   */
  const startReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
    setReplyFiles([]);
  }, []);

  /**
   * 取消回复
   */
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent('');
    setReplyFiles([]);
  }, []);

  return {
    // 状态
    comments,
    newComment,
    newCommentFiles,
    replyingTo,
    replyContent,
    replyFiles,
    
    // Refs
    commentFileRef,
    replyFileRef,
    
    // 评论操作
    setNewComment,
    handleSubmitComment,
    handleCommentFileUpload,
    removeCommentFile,
    
    // 回复操作
    setReplyContent,
    handleSubmitReply,
    handleReplyFileUpload,
    removeReplyFile,
    startReply,
    cancelReply
  };
} 