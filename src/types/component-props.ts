/**
 * 组件 Props 类型定义
 * 
 * 统一管理可复用组件的Props类型
 */

import type { 
  Attachment, 
  EndOwnerOpinion, 
  ScheduledReviewData,
  Comment 
} from '@/lib/requirements-store';

/**
 * 基础组件Props
 */
export interface BaseComponentProps {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 终端Owner意见卡片Props
 */
export interface EndOwnerOpinionCardProps {
  /** 意见数据 */
  opinion?: EndOwnerOpinion;
  /** 是否只读 */
  readOnly?: boolean;
  /** 变更回调 */
  onChange?: (opinion: EndOwnerOpinion) => void;
}

/**
 * 排期评审卡片Props
 */
export interface ScheduledReviewCardProps {
  /** 评审数据 */
  data?: ScheduledReviewData;
  /** 是否只读 */
  readOnly?: boolean;
  /** 变更回调 */
  onChange?: (data: ScheduledReviewData) => void;
}

/**
 * 快捷操作卡片Props
 */
export interface QuickActionsCardProps {
  /** 原型ID */
  prototypeId?: string;
  /** PRD ID */
  prdId?: string;
  /** UI设计ID */
  uiDesignId?: string;
  /** Bug追踪ID */
  bugTrackingId?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 变更回调 */
  onChange?: (data: {
    prototypeId?: string;
    prdId?: string;
    uiDesignId?: string;
    bugTrackingId?: string;
  }) => void;
}

/**
 * 附件区域Props
 */
export interface AttachmentsSectionProps {
  /** 附件列表 */
  attachments: Attachment[];
  /** 是否可编辑 */
  editable?: boolean;
  /** 附件变更回调 */
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  /** 自定义标题 */
  title?: string;
}

/**
 * 评论区Props
 */
export interface CommentSectionProps {
  /** 评论列表 */
  comments?: Comment[];
  /** 是否只读 */
  readOnly?: boolean;
  /** 评论添加回调 */
  onCommentAdded?: (comment: Comment) => void;
  /** 回复添加回调 */
  onReplyAdded?: (commentId: string, reply: Comment) => void;
  /** 评论列表变更回调 */
  onCommentsChange?: (comments: Comment[]) => void;
}

/**
 * 历史记录区Props
 */
export interface HistorySectionProps {
  /** 需求ID */
  requirementId: string;
  /** 是否折叠显示 */
  collapsed?: boolean;
}

/**
 * 需求表单Props
 */
export interface RequirementFormProps {
  /** 表单数据 */
  formData: {
    title: string;
    type: string;
    description: string;
    platforms: string[];
    endOwnerOpinion?: EndOwnerOpinion;
    scheduledReview?: ScheduledReviewData;
    quickActions?: {
      prototypeId?: string;
      prdId?: string;
      uiDesignId?: string;
      bugTrackingId?: string;
    };
  };
  /** 附件列表 */
  attachments: Attachment[];
  /** 表单错误 */
  errors?: Record<string, string>;
  /** 是否只读 */
  readOnly?: boolean;
  /** 输入变更回调 */
  onInputChange: (field: string, value: any) => void;
  /** 类型变更回调 */
  onTypeChange: (type: string, checked: boolean) => void;
  /** 平台变更回调 */
  onPlatformChange: (platform: string, checked: boolean) => void;
  /** 附件变更回调 */
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

/**
 * 权限拒绝组件Props
 */
export interface PermissionDeniedProps {
  /** 自定义消息 */
  message?: string;
  /** 显示返回按钮 */
  showBackButton?: boolean;
}

/**
 * 错误边界Props
 */
export interface ErrorBoundaryProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 后备UI */
  fallback?: React.ReactNode;
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}




