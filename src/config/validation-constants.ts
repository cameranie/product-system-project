/**
 * 验证相关常量配置
 * 
 * 统一管理所有验证规则中的Magic Number
 */

// ==================== 时间相关常量 ====================

/**
 * 时间间隔常量（毫秒）
 */
export const TIME_INTERVALS = {
  /** 防抖默认延迟 */
  DEBOUNCE_DEFAULT: 500,
  /** 搜索防抖延迟 */
  DEBOUNCE_SEARCH: 300,
  /** 保存防抖延迟 */
  DEBOUNCE_SAVE: 1000,
  /** 节流默认间隔 */
  THROTTLE_DEFAULT: 500,
  /** 滚动节流间隔 */
  THROTTLE_SCROLL: 200,
  /** API请求超时 */
  API_TIMEOUT: 30000, // 30秒
} as const;

/**
 * 创建者编辑权限时间限制（小时）
 * 创建需求后，创建者在此时间内可以编辑自己的需求
 */
export const CREATOR_EDIT_WINDOW_HOURS = 24;

// ==================== 文件上传常量 ====================

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  /** 默认最大文件大小 - 100MB */
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  /** 图片最大大小 - 10MB */
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  /** 视频最大大小 - 500MB */
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,
  /** 文档最大大小 - 50MB */
  MAX_DOCUMENT_SIZE: 50 * 1024 * 1024,
} as const;

/**
 * 文件数量限制
 */
export const FILE_COUNT_LIMITS = {
  /** 单次最多上传文件数 */
  MAX_FILES_PER_UPLOAD: 10,
  /** 单个需求最多附件数 */
  MAX_ATTACHMENTS_PER_REQUIREMENT: 20,
  /** 单个评论最多附件数 */
  MAX_ATTACHMENTS_PER_COMMENT: 5,
} as const;

/**
 * 文件名长度限制
 */
export const FILENAME_MAX_LENGTH = 255;

// ==================== 输入长度限制 ====================

/**
 * 文本输入长度限制
 */
export const INPUT_LENGTH_LIMITS = {
  /** 需求标题最小长度 */
  TITLE_MIN_LENGTH: 1,
  /** 需求标题最大长度 */
  TITLE_MAX_LENGTH: 200,
  /** 需求描述最小长度 */
  DESCRIPTION_MIN_LENGTH: 1,
  /** 需求描述最大长度 */
  DESCRIPTION_MAX_LENGTH: 5000,
  /** 评论最小长度 */
  COMMENT_MIN_LENGTH: 1,
  /** 评论最大长度 */
  COMMENT_MAX_LENGTH: 1000,
  /** 搜索关键词最大长度 */
  SEARCH_MAX_LENGTH: 100,
  /** 评审意见最大长度 */
  REVIEW_OPINION_MAX_LENGTH: 500,
  /** URL最大长度 */
  URL_MAX_LENGTH: 2048,
} as const;

// ==================== 批量操作限制 ====================

/**
 * 批量操作数量限制
 */
export const BATCH_OPERATION_LIMITS = {
  /** 批量选择最多需求数 */
  MAX_BATCH_SELECTION: 100,
  /** 批量编辑最多需求数 */
  MAX_BATCH_EDIT: 50,
  /** 批量删除最多需求数 */
  MAX_BATCH_DELETE: 20,
  /** 批量导出最多需求数 */
  MAX_BATCH_EXPORT: 1000,
} as const;

// ==================== 分页相关常量 ====================

/**
 * 分页配置
 */
export const PAGINATION_DEFAULTS = {
  /** 默认每页大小 */
  DEFAULT_PAGE_SIZE: 20,
  /** 最小每页大小 */
  MIN_PAGE_SIZE: 10,
  /** 最大每页大小 */
  MAX_PAGE_SIZE: 100,
  /** 虚拟列表每项估计高度（像素） */
  VIRTUAL_ITEM_HEIGHT: 100,
  /** 虚拟列表预渲染数量 */
  VIRTUAL_OVERSCAN: 5,
} as const;

// ==================== UI相关常量 ====================

/**
 * Toast提示持续时间（毫秒）
 */
export const TOAST_DURATION = {
  /** 默认持续时间 */
  DEFAULT: 3000,
  /** 成功提示 */
  SUCCESS: 2000,
  /** 错误提示 */
  ERROR: 5000,
  /** 警告提示 */
  WARNING: 4000,
  /** 信息提示 */
  INFO: 3000,
} as const;

/**
 * 加载状态相关
 */
export const LOADING_DELAYS = {
  /** 显示加载状态的延迟（避免闪烁） */
  SHOW_LOADING_DELAY: 200,
  /** 最小加载显示时间（避免一闪而过） */
  MIN_LOADING_TIME: 500,
} as const;

// ==================== 验证正则表达式 ====================

/**
 * 危险字符和脚本检测模式
 */
export const SECURITY_PATTERNS = {
  /** XSS危险字符检测 */
  DANGEROUS_CHARS: /<script|<iframe|javascript:|onerror=|onload=/i,
  /** 危险脚本标签检测 */
  DANGEROUS_SCRIPTS: /<script[\s\S]*?>[\s\S]*?<\/script>|<iframe[\s\S]*?>|javascript:|onerror\s*=|onload\s*=/i,
  /** SQL注入检测 */
  SQL_INJECTION: /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/i,
  /** 需求ID格式 */
  REQUIREMENT_ID: /^#\d+$/,
  /** 文件名非法字符 */
  INVALID_FILENAME_CHARS: /[<>:"/\\|?*\x00-\x1f]/,
  /** 路径遍历攻击 */
  PATH_TRAVERSAL: /\.\.[/\\]/,
} as const;

/**
 * 危险URL协议列表
 */
export const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
] as const;

/**
 * 允许的URL协议列表
 */
export const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
] as const;

// ==================== 导出便捷函数 ====================

/**
 * 获取文件大小限制（字节）
 * @param type - 文件类型
 */
export function getFileSizeLimit(type?: string): number {
  if (!type) return FILE_SIZE_LIMITS.MAX_FILE_SIZE;
  
  if (type.startsWith('image/')) {
    return FILE_SIZE_LIMITS.MAX_IMAGE_SIZE;
  } else if (type.startsWith('video/')) {
    return FILE_SIZE_LIMITS.MAX_VIDEO_SIZE;
  } else if (
    type.includes('document') || 
    type.includes('pdf') || 
    type.includes('word') || 
    type.includes('excel')
  ) {
    return FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE;
  }
  
  return FILE_SIZE_LIMITS.MAX_FILE_SIZE;
}

/**
 * 格式化文件大小为可读字符串
 * @param bytes - 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}




