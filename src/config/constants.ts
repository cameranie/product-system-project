// 应用常量配置

// 时间相关常量
export const TIME_CONFIG = {
  API_TIMEOUT: 10000, // 10秒
  RETRY_DELAY: 1000, // 1秒
  DEBOUNCE_DELAY: 300, // 300毫秒
  LOADING_DELAY: 100, // 100毫秒
  COMMENT_SUBMIT_DELAY: 500, // 评论提交延迟
  REPLY_SUBMIT_DELAY: 300, // 回复提交延迟
} as const;

// 文件上传相关常量
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  ALLOWED_SPREADSHEET_TYPES: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  ALLOWED_ARCHIVE_TYPES: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ]
} as const;

// 分页相关常量
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// 用户界面相关常量
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // 3秒
  MODAL_ANIMATION_DURATION: 200, // 200毫秒
  TABLE_ROW_HEIGHT: 60, // 60px
  SIDEBAR_WIDTH: 280, // 280px
  HEADER_HEIGHT: 64, // 64px
} as const;

// 验证相关常量
export const VALIDATION_CONFIG = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 1,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TAG_LENGTH: 50,
  MAX_TAGS_COUNT: 10,
  MAX_FILENAME_LENGTH: 255,
} as const;

// 权限相关常量
export const PERMISSION_CONFIG = {
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    DEVELOPER: 'developer',
    REVIEWER: 'reviewer',
    USER: 'user'
  },
  ACTIONS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    APPROVE: 'approve',
    ASSIGN: 'assign'
  }
} as const;

// API相关常量
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  ENDPOINTS: {
    REQUIREMENTS: '/requirements',
    COMMENTS: '/comments',
    USERS: '/users',
    PROJECTS: '/projects',
    UPLOAD: '/upload',
    AUTH: '/auth'
  },
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION: 'Authorization'
  }
} as const;

// 错误码常量
export const ERROR_CODES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  REQUEST_ERROR: 'REQUEST_ERROR',
  
  // 文件错误
  FILE_ACCESS_DENIED: 'FILE_ACCESS_DENIED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  
  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // 业务错误
  REQUIREMENT_NOT_FOUND: 'REQUIREMENT_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // 系统错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

// 状态常量
export const STATUS_CONFIG = {
  REQUIREMENT_STATUS: {
    PENDING: '待评审',
    REVIEWING: '评审中',
    APPROVED: '评审通过',
    REJECTED: '评审不通过',
    CLOSED: '已关闭',
    DEVELOPING: '开发中',
    COMPLETED: '已完成',
    DESIGNING: '设计中'
  },
  REVIEW_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  PRIORITY_LEVELS: {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    URGENT: '紧急'
  },
  NEED_TO_DO: {
    YES: '是',
    NO: '否'
  }
} as const;

// 默认值常量
export const DEFAULT_VALUES = {
  REQUIREMENT: {
    STATUS: STATUS_CONFIG.REQUIREMENT_STATUS.PENDING,
    PRIORITY: STATUS_CONFIG.PRIORITY_LEVELS.MEDIUM,
    VERSION: 'v1.0.0',
    IS_OPEN: true
  },
  USER: {
    AVATAR: '/default-avatar.png',
    ROLE: PERMISSION_CONFIG.ROLES.USER
  },
  PROJECT: {
    COLOR: '#3b82f6'
  }
} as const;

// 正则表达式常量
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  ID_NUMBER: /^\d{15}|\d{18}$/,
  UNSAFE_FILENAME: /[<>:"/\\|?*\x00-\x1f]/,
  PATH_TRAVERSAL: /\.\.[\/\\]/,
  VERSION: /^v?\d+\.\d+\.\d+$/
} as const;

// 本地存储键名常量
export const STORAGE_KEYS = {
  REQUIREMENTS_STORE: 'requirements-store',
  COMMENTS_STORE: 'comments-store',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

// 路由常量
export const ROUTES = {
  HOME: '/',
  REQUIREMENTS: '/requirements',
  REQUIREMENT_NEW: '/requirements/new',
  REQUIREMENT_DETAIL: (id: string) => `/requirements/${encodeURIComponent(id)}`,
  REQUIREMENT_EDIT: (id: string) => `/requirements/${encodeURIComponent(id)}/edit`,
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings'
} as const; 