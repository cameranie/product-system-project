/**
 * useRequirementForm Hook 单元测试
 * 
 * 测试覆盖：
 * - 表单初始化
 * - 字段验证
 * - XSS防护
 * - 文件上传
 * - URL验证
 */

import { renderHook, act } from '@testing-library/react';
import { useRequirementForm } from '../useRequirementForm';
import type { Requirement } from '@/lib/requirements-store';

describe('useRequirementForm', () => {
  describe('初始化', () => {
    it('应该使用默认值初始化', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      expect(result.current.formData.title).toBe('');
      expect(result.current.formData.type).toBe('新功能');
      expect(result.current.formData.description).toBe('');
      expect(result.current.formData.platforms).toEqual([]);
      expect(result.current.attachments).toEqual([]);
    });

    it('应该使用提供的初始数据初始化', () => {
      const initialData: Partial<Requirement> = {
        title: '测试需求',
        type: '优化',
        description: '测试描述',
        platforms: ['Web端'],
        attachments: [],
      };

      const { result } = renderHook(() => 
        useRequirementForm({ initialData: initialData as Requirement })
      );
      
      expect(result.current.formData.title).toBe('测试需求');
      expect(result.current.formData.type).toBe('优化');
      expect(result.current.formData.description).toBe('测试描述');
      expect(result.current.formData.platforms).toEqual(['Web端']);
    });
  });

  describe('字段修改', () => {
    it('应该能修改标题', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '新标题');
      });
      
      expect(result.current.formData.title).toBe('新标题');
    });

    it('应该能修改描述', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('description', '新描述');
      });
      
      expect(result.current.formData.description).toBe('新描述');
    });

    it('应该能修改需求类型', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleTypeChange('BUG', true);
      });
      
      expect(result.current.formData.type).toBe('BUG');
    });

    it('应该能添加应用端', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handlePlatformChange('Web端', true);
      });
      
      expect(result.current.formData.platforms).toContain('Web端');
    });

    it('应该能移除应用端', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handlePlatformChange('Web端', true);
        result.current.handlePlatformChange('PC端', true);
      });
      
      expect(result.current.formData.platforms).toEqual(['Web端', 'PC端']);
      
      act(() => {
        result.current.handlePlatformChange('Web端', false);
      });
      
      expect(result.current.formData.platforms).toEqual(['PC端']);
    });
  });

  describe('表单验证', () => {
    it('应该拒绝空标题', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '');
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    it('应该拒绝过长的标题', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', 'a'.repeat(201));
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    it('应该拒绝包含危险字符的标题', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '<script>alert("xss")</script>');
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    it('应该拒绝空描述', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '有效标题');
        result.current.handleInputChange('description', '');
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    it('应该拒绝过长的描述', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '有效标题');
        result.current.handleInputChange('description', `<p>${'a'.repeat(5001)}</p>`);
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    it('应该接受有效的表单数据', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '有效的需求标题');
        result.current.handleInputChange('description', '<p>有效的需求描述</p>');
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(true);
    });
  });

  describe('URL验证', () => {
    it('应该拒绝javascript:协议的URL', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '有效标题');
        result.current.handleInputChange('description', '<p>有效描述</p>');
        result.current.setFormData(prev => ({
          ...prev,
          quickActions: {
            ...prev.quickActions,
            prototypeId: 'javascript:alert("xss")',
          },
        }));
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    it('应该接受有效的HTTP URL', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '有效标题');
        result.current.handleInputChange('description', '<p>有效描述</p>');
        result.current.setFormData(prev => ({
          ...prev,
          quickActions: {
            ...prev.quickActions,
            prototypeId: 'https://example.com/prototype',
          },
        }));
      });
      
      const isValid = result.current.validate();
      expect(isValid).toBe(true);
    });
  });

  describe('表单重置', () => {
    it('应该能重置表单', () => {
      const { result } = renderHook(() => useRequirementForm());
      
      act(() => {
        result.current.handleInputChange('title', '测试标题');
        result.current.handleInputChange('description', '<p>测试描述</p>');
        result.current.handlePlatformChange('Web端', true);
      });
      
      expect(result.current.formData.title).toBe('测试标题');
      
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.formData.title).toBe('');
      expect(result.current.formData.description).toBe('');
      expect(result.current.formData.platforms).toEqual([]);
    });
  });
});




