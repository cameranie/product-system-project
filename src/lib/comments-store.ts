// 评论和历史记录的统一数据管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatDateTime, generateSecureId } from './file-upload-utils';
import { mockUsers } from './requirements-store';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  createdAt: string;
  attachments: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  createdAt: string;
  attachments: Attachment[];
  replies: Reply[];
  requirementId: string;
}

export interface HistoryRecord {
  id: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  timestamp: string;
  requirementId: string;
}

interface CommentsStore {
  comments: Comment[];
  historyRecords: HistoryRecord[];
  loading: boolean;
  error: string | null;

  // 评论相关操作
  getCommentsByRequirementId: (requirementId: string) => Comment[];
  addComment: (requirementId: string, content: string, attachments?: File[]) => Promise<Comment>;
  addReply: (commentId: string, content: string, attachments?: File[]) => Promise<Reply>;
  deleteComment: (commentId: string) => Promise<void>;
  deleteReply: (commentId: string, replyId: string) => Promise<void>;

  // 历史记录相关操作
  getHistoryByRequirementId: (requirementId: string) => HistoryRecord[];
  addHistoryRecord: (requirementId: string, action: string, field: string, oldValue: string, newValue: string) => Promise<HistoryRecord>;

  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// 初始模拟数据
const initialComments: Comment[] = [
  {
    id: 'comment-1',
    content: '这个需求很重要，建议优先处理。需要考虑用户体验的优化。',
    author: mockUsers[1],
    createdAt: '2024-01-16 15:30',
    attachments: [
      { id: 'att-1', name: '用户调研报告.pdf', size: 2048000, type: 'application/pdf', url: '' }
    ],
    replies: [
      {
        id: 'reply-1-1',
        content: '同意，我们可以先做一个原型来验证方案。',
        author: mockUsers[2],
        createdAt: '2024-01-16 16:45',
        attachments: []
      }
    ],
    requirementId: '#1'
  },
  {
    id: 'comment-2',
    content: '技术实现上需要注意性能问题，建议分阶段实现。',
    author: mockUsers[3],
    createdAt: '2024-01-17 10:20',
    attachments: [],
    replies: [],
    requirementId: '#1'
  }
];

const initialHistoryRecords: HistoryRecord[] = [
  {
    id: 'history-1',
    action: '创建需求',
    field: '状态',
    oldValue: '',
    newValue: '待评审',
    user: mockUsers[0],
    timestamp: '2024-01-15 10:30',
    requirementId: '#1'
  },
  {
    id: 'history-2',
    action: '修改优先级',
    field: '优先级',
    oldValue: '中',
    newValue: '高',
    user: mockUsers[1],
    timestamp: '2024-01-16 14:20',
    requirementId: '#1'
  },
  {
    id: 'history-3',
    action: '分配评审人',
    field: '评审人',
    oldValue: '',
    newValue: '李四',
    user: mockUsers[0],
    timestamp: '2024-01-17 09:15',
    requirementId: '#1'
  }
];

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      comments: initialComments,
      historyRecords: initialHistoryRecords,
      loading: false,
      error: null,

      getCommentsByRequirementId: (requirementId: string) => {
        return get().comments.filter(comment => comment.requirementId === requirementId);
      },

      addComment: async (requirementId: string, content: string, attachments: File[] = []) => {
        set({ loading: true, error: null });
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { FileURLManager } = await import('./file-upload-utils');
          
          const attachmentData: Attachment[] = await Promise.all(
            attachments.map(async (file) => ({
              id: generateSecureId(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: FileURLManager.createObjectURL(file)
            }))
          );

          const newComment: Comment = {
            id: generateSecureId(),
            content,
            author: mockUsers[0], // 当前用户
            createdAt: formatDateTime(),
            attachments: attachmentData,
            replies: [],
            requirementId
          };

          set(state => ({
            comments: [...state.comments, newComment],
            loading: false
          }));

          return newComment;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '添加评论失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      addReply: async (commentId: string, content: string, attachments: File[] = []) => {
        set({ loading: true, error: null });
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const { FileURLManager } = await import('./file-upload-utils');
          
          const attachmentData: Attachment[] = await Promise.all(
            attachments.map(async (file) => ({
              id: generateSecureId(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: FileURLManager.createObjectURL(file)
            }))
          );

          const newReply: Reply = {
            id: generateSecureId(),
            content,
            author: mockUsers[0], // 当前用户
            createdAt: formatDateTime(),
            attachments: attachmentData
          };

          set(state => ({
            comments: state.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, replies: [...comment.replies, newReply] }
                : comment
            ),
            loading: false
          }));

          return newReply;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '添加回复失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteComment: async (commentId: string) => {
        set({ loading: true, error: null });
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set(state => ({
            comments: state.comments.filter(comment => comment.id !== commentId),
            loading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '删除评论失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteReply: async (commentId: string, replyId: string) => {
        set({ loading: true, error: null });
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set(state => ({
            comments: state.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, replies: comment.replies.filter(reply => reply.id !== replyId) }
                : comment
            ),
            loading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '删除回复失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      getHistoryByRequirementId: (requirementId: string) => {
        return get().historyRecords
          .filter(record => record.requirementId === requirementId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      addHistoryRecord: async (requirementId: string, action: string, field: string, oldValue: string, newValue: string) => {
        try {
          const newRecord: HistoryRecord = {
            id: generateSecureId(),
            action,
            field,
            oldValue,
            newValue,
            user: mockUsers[0], // 当前用户
            timestamp: formatDateTime(),
            requirementId
          };

          set(state => ({
            historyRecords: [...state.historyRecords, newRecord]
          }));

          return newRecord;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '添加历史记录失败';
          set({ error: errorMessage });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'comments-store',
      version: 1,
      partialize: (state) => ({ 
        comments: state.comments, 
        historyRecords: state.historyRecords 
      }),
    }
  )
); 