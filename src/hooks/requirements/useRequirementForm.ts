import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Requirement, Attachment } from '@/lib/requirements-store';
import type { EndOwnerOpinionData, QuickActionsData } from '@/components/requirements';
import type { ScheduledReviewLevel } from './useScheduledReview';

/**
 * 需求表单数据类型
 */
export interface RequirementFormData {
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  description: string;
  platforms: string[];
  endOwnerOpinion: EndOwnerOpinionData;
  scheduledReview: {
    reviewLevels: ScheduledReviewLevel[];
  };
  quickActions: QuickActionsData;
}

/**
 * useRequirementForm Hook 的配置选项
 */
interface UseRequirementFormOptions {
  /** 初始化的需求数据（编辑模式时提供） */
  initialData?: Requirement;
}

/**
 * 获取默认的表单数据
 */
function getDefaultFormData(): RequirementFormData {
  return {
    title: '',
    type: '新功能',
    description: '',
    platforms: [],
    endOwnerOpinion: {
      needToDo: undefined,
      priority: undefined,
      opinion: '',
      owner: undefined
    },
    scheduledReview: {
      reviewLevels: [
        {
          id: '1',
          level: 1,
          levelName: '一级评审',
          status: 'pending'
        },
        {
          id: '2',
          level: 2,
          levelName: '二级评审',
          status: 'pending'
        }
      ]
    },
    quickActions: {
      prototypeId: '',
      prdId: '',
      uiDesignId: '',
      bugTrackingId: ''
    }
  };
}

/**
 * 将 Requirement 对象转换为表单数据
 */
function mapRequirementToFormData(requirement: Requirement): RequirementFormData {
  return {
    title: requirement.title,
    type: requirement.type,
    description: requirement.description,
    platforms: requirement.platforms || [],
    endOwnerOpinion: requirement.endOwnerOpinion || {
      needToDo: undefined,
      priority: undefined,
      opinion: '',
      owner: undefined
    },
    scheduledReview: {
      reviewLevels: requirement.scheduledReview?.reviewLevels || []
    },
    quickActions: {
      prototypeId: requirement.prototypeId || '',
      prdId: requirement.prdId || '',
      uiDesignId: '',
      bugTrackingId: ''
    }
  };
}

/**
 * 需求表单管理 Hook
 * 
 * 统一管理新建和编辑页面的表单逻辑，包括：
 * - 表单状态管理
 * - 需求类型选择
 * - 应用端选择
 * - 附件上传
 * - 表单验证
 * 
 * @param options - Hook 配置选项
 * @returns 表单状态和操作方法
 * 
 * @example
 * ```tsx
 * // 新建模式
 * const { formData, attachments, handleTypeChange, validate } = useRequirementForm();
 * 
 * // 编辑模式
 * const { formData, attachments, handleTypeChange, validate } = useRequirementForm({
 *   initialData: requirement
 * });
 * ```
 */
export function useRequirementForm(options: UseRequirementFormOptions = {}) {
  const { initialData } = options;

  // 表单数据状态
  const [formData, setFormData] = useState<RequirementFormData>(() => 
    initialData ? mapRequirementToFormData(initialData) : getDefaultFormData()
  );

  // 附件状态
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialData?.attachments || []
  );

  /**
   * 处理基本信息字段变化
   */
  const handleInputChange = useCallback((field: keyof RequirementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * 处理需求类型勾选
   * 支持多选，但当前只允许选中一个
   */
  const handleTypeChange = useCallback((type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        type: type as RequirementFormData['type'] 
      }));
    }
  }, []);

  /**
   * 处理应用端勾选
   * 支持多选
   */
  const handlePlatformChange = useCallback((platform: string, checked: boolean) => {
    setFormData(prev => {
      const currentPlatforms = prev.platforms || [];
      if (checked) {
        // 添加平台
        if (!currentPlatforms.includes(platform)) {
          return {
            ...prev,
            platforms: [...currentPlatforms, platform]
          };
        }
      } else {
        // 移除平台
        return {
          ...prev,
          platforms: currentPlatforms.filter(p => p !== platform)
        };
      }
      return prev;
    });
  }, []);

    /**
   * 处理附件上传
   * 包含文件验证和安全检查（增强版：包含文件签名验证）
   */
  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      // 验证文件大小
      const invalidFiles = files.filter(file => file.size > maxSize);
      if (invalidFiles.length > 0) {
        toast.error(`文件大小不能超过 100MB，请重新选择`);
        return;
      }

      const { FileURLManager, generateSecureId } = await import('@/lib/file-upload-utils');

      // 创建附件对象
      const newAttachments: Attachment[] = files.map(file => ({
        id: generateSecureId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: FileURLManager.createObjectURL(file)
      }));

      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`已添加 ${files.length} 个文件`);
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败，请重试');
    }
  }, []);

  /**
   * 处理附件删除
   */
  const handleFileRemove = useCallback((attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  /**
   * 验证表单数据
   * 
   * 增强版验证，包括：
   * - 必填字段检查
   * - 长度限制
   * - 危险字符检测
   * - 格式验证
   * 
   * @returns 是否通过验证
   */
  const validate = useCallback((): boolean => {
    // ===== 标题验证 =====
    
    // 1. 必填检查
    if (!formData.title.trim()) {
      toast.error('请输入需求标题');
      return false;
    }

    // 2. 长度限制（1-200字符）
    if (formData.title.length < 1) {
      toast.error('需求标题不能为空');
      return false;
    }
    
    if (formData.title.length > 200) {
      toast.error('需求标题不能超过200个字符');
      return false;
    }

    // 3. 危险字符检测（防止XSS）
    const dangerousCharsPattern = /<script|<iframe|javascript:|onerror=|onload=/i;
    if (dangerousCharsPattern.test(formData.title)) {
      toast.error('标题包含不允许的字符');
      return false;
    }

    // ===== 描述验证 =====
    
    // 提取富文本的纯文本内容进行验证
    const getPlainText = (html: string): string => {
      if (typeof window === 'undefined') return html;
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    };
    
    const plainDescription = getPlainText(formData.description).trim();
    
    // 1. 必填检查（检查纯文本内容）
    if (!plainDescription) {
      toast.error('请输入需求描述');
      return false;
    }

    // 2. 长度限制（检查纯文本内容，1-5000字符）
    if (plainDescription.length < 1) {
      toast.error('需求描述不能为空');
      return false;
    }
    
    if (plainDescription.length > 5000) {
      toast.error('需求描述不能超过5000个字符');
      return false;
    }

    // 3. 危险脚本检测（检查是否包含危险的脚本标签）
    const dangerousScriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>|<iframe[\s\S]*?>|javascript:|onerror\s*=|onload\s*=/i;
    if (dangerousScriptPattern.test(formData.description)) {
      toast.error('描述包含不允许的脚本内容');
      return false;
    }

    // ===== 快捷操作URL验证 =====
    
    // 验证原型链接URL（如果提供）
    if (formData.quickActions.prototypeId) {
      if (!isValidURL(formData.quickActions.prototypeId)) {
        toast.error('原型链接格式不正确');
        return false;
      }
    }

    // 验证PRD链接URL（如果提供）
    if (formData.quickActions.prdId) {
      if (!isValidURL(formData.quickActions.prdId)) {
        toast.error('PRD链接格式不正确');
        return false;
      }
    }

    return true;
  }, [formData]);

  /**
   * 验证URL格式
   * 
   * 检查URL是否为有效格式，防止javascript:等危险协议
   * 
   * @param url - 待验证的URL
   * @returns 是否为有效URL
   */
  const isValidURL = (url: string): boolean => {
    // 空URL视为有效（可选字段）
    if (!url || !url.trim()) {
      return true;
    }

    // 危险协议列表
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const urlLower = url.toLowerCase().trim();

    // 检查危险协议
    for (const protocol of dangerousProtocols) {
      if (urlLower.startsWith(protocol)) {
        return false;
      }
    }

    // 检查是否为合法URL格式
    try {
      // 尝试解析URL
      new URL(url);
      return true;
    } catch {
      // 如果不是完整URL，检查是否为相对路径
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('#');
    }
  };

  /**
   * 重置表单为默认状态
   */
  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setAttachments([]);
  }, []);

  return {
    // 状态
    formData,
    attachments,
    
    // 基本操作
    setFormData,
    handleInputChange,
    
    // 类型和平台
    handleTypeChange,
    handlePlatformChange,
    
    // 附件管理
    handleFileUpload,
    handleFileRemove,
    setAttachments,
    
    // 表单验证
    validate,
    resetForm
  };
} 