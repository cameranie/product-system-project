/**
 * useComments Hook 单元测试
 * 
 * 测试覆盖：
 * - 评论添加
 * - 回复功能
 * - 编辑/删除
 * - 附件管理
 */

import { renderHook, act } from '@testing-library/react';
import { useComments } from '../useComments';
import type { User } from '@/lib/requirements-store';

const mockUser: User = {
  id: '1',
  name: '测试用户',
  avatar: '',
  email: 'test@example.com',
};

describe('useComments', () => {
  describe('初始化', () => {
    it('应该使用空评论列表初始化', () => {
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
        })
      );
      
      expect(result.current.comments).toEqual([]);
      expect(result.current.newComment).toBe('');
    });

    it('应该使用提供的初始评论初始化', () => {
      const initialComments = [
        {
          id: '1',
          content: '测试评论',
          author: mockUser,
          createdAt: '2024-01-01 10:00',
          attachments: [],
          replies: [],
        },
      ];

      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          initialComments,
        })
      );
      
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].content).toBe('测试评论');
    });
  });

  describe('添加评论', () => {
    it('应该能添加新评论', async () => {
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
        })
      );
      
      act(() => {
        result.current.setNewComment('新评论内容');
      });
      
      await act(async () => {
        await result.current.handleSubmitComment();
      });
      
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].content).toBe('新评论内容');
      expect(result.current.newComment).toBe(''); // 应该清空输入
    });

    it('应该拒绝空评论', async () => {
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
        })
      );
      
      act(() => {
        result.current.setNewComment('');
      });
      
      await act(async () => {
        await result.current.handleSubmitComment();
      });
      
      expect(result.current.comments).toHaveLength(0);
    });

    it('应该拒绝只包含空格的评论', async () => {
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
        })
      );
      
      act(() => {
        result.current.setNewComment('   ');
      });
      
      await act(async () => {
        await result.current.handleSubmitComment();
      });
      
      expect(result.current.comments).toHaveLength(0);
    });
  });

  describe('回复评论', () => {
    it('应该能回复评论', async () => {
      const initialComments = [
        {
          id: '1',
          content: '原评论',
          author: mockUser,
          createdAt: '2024-01-01 10:00',
          attachments: [],
          replies: [],
        },
      ];

      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          initialComments,
        })
      );
      
      act(() => {
        result.current.startReply('1');
      });
      
      expect(result.current.replyingTo).toBe('1');
      
      act(() => {
        result.current.setReplyContent('回复内容');
      });
      
      await act(async () => {
        await result.current.handleSubmitReply('1');
      });
      
      expect(result.current.comments[0].replies).toHaveLength(1);
      expect(result.current.comments[0].replies[0].content).toBe('回复内容');
      expect(result.current.replyingTo).toBeNull(); // 应该清空回复状态
    });

    it('应该能取消回复', () => {
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
        })
      );
      
      act(() => {
        result.current.startReply('1');
        result.current.setReplyContent('回复内容');
      });
      
      expect(result.current.replyingTo).toBe('1');
      
      act(() => {
        result.current.cancelReply();
      });
      
      expect(result.current.replyingTo).toBeNull();
      expect(result.current.replyContent).toBe('');
    });
  });

  describe('编辑评论', () => {
    it('应该能编辑评论', async () => {
      const initialComments = [
        {
          id: '1',
          content: '原始内容',
          author: mockUser,
          createdAt: '2024-01-01 10:00',
          attachments: [],
          replies: [],
        },
      ];

      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          initialComments,
        })
      );
      
      act(() => {
        result.current.startEditComment('1');
      });
      
      expect(result.current.editingComment).toBe('1');
      expect(result.current.editingContent).toBe('原始内容');
      
      act(() => {
        result.current.setEditingContent('修改后的内容');
      });
      
      await act(async () => {
        await result.current.handleSaveEditComment();
      });
      
      expect(result.current.comments[0].content).toBe('修改后的内容');
      expect(result.current.editingComment).toBeNull();
    });

    it('应该能取消编辑', () => {
      const initialComments = [
        {
          id: '1',
          content: '原始内容',
          author: mockUser,
          createdAt: '2024-01-01 10:00',
          attachments: [],
          replies: [],
        },
      ];

      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          initialComments,
        })
      );
      
      act(() => {
        result.current.startEditComment('1');
        result.current.setEditingContent('修改内容');
      });
      
      act(() => {
        result.current.cancelEditComment();
      });
      
      expect(result.current.editingComment).toBeNull();
      expect(result.current.editingContent).toBe('');
      expect(result.current.comments[0].content).toBe('原始内容'); // 原内容不变
    });
  });

  describe('删除评论', () => {
    it('应该能删除评论', () => {
      const initialComments = [
        {
          id: '1',
          content: '评论1',
          author: mockUser,
          createdAt: '2024-01-01 10:00',
          attachments: [],
          replies: [],
        },
        {
          id: '2',
          content: '评论2',
          author: mockUser,
          createdAt: '2024-01-01 11:00',
          attachments: [],
          replies: [],
        },
      ];

      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          initialComments,
        })
      );
      
      expect(result.current.comments).toHaveLength(2);
      
      act(() => {
        result.current.handleDeleteComment('1');
      });
      
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].id).toBe('2');
    });
  });

  describe('回调函数', () => {
    it('添加评论时应该调用onCommentAdded', async () => {
      const onCommentAdded = jest.fn();
      
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          onCommentAdded,
        })
      );
      
      act(() => {
        result.current.setNewComment('新评论');
      });
      
      await act(async () => {
        await result.current.handleSubmitComment();
      });
      
      expect(onCommentAdded).toHaveBeenCalledTimes(1);
      expect(onCommentAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '新评论',
        })
      );
    });

    it('评论变化时应该调用onCommentsChange', async () => {
      const onCommentsChange = jest.fn();
      
      const { result } = renderHook(() => 
        useComments({
          requirementId: '#1',
          currentUser: mockUser,
          onCommentsChange,
        })
      );
      
      act(() => {
        result.current.setNewComment('新评论');
      });
      
      await act(async () => {
        await result.current.handleSubmitComment();
      });
      
      expect(onCommentsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: '新评论',
          }),
        ])
      );
    });
  });
});




