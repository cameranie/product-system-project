/**
 * 应用统一配置
 * 
 * 集中管理所有配置项，避免分散和重复
 * 
 * @module app-config
 */

/**
 * 配置版本管理
 * 用于检测配置更新，自动清除旧配置
 */
export const CONFIG_VERSIONS = {
  /** 需求池配置版本 */
  REQUIREMENTS_POOL: '2.0',
  /** 预排期配置版本 */
  SCHEDULED: '2.0',
  /** 版本管理配置版本 */
  VERSIONS: '1.0',
  /** 看板配置版本 */
  KANBAN: '1.0',
  /** 问题管理配置版本 */
  ISSUES: '1.0',
  /** 人员管理配置版本 */
  PERSONNEL: '1.0',
} as const;

/**
 * localStorage 键名管理
 * 统一管理所有 localStorage 键名，避免冲突和重复
 */
export const STORAGE_KEYS = {
  /** 需求池相关 */
  REQUIREMENTS_POOL: {
    CONFIG_VERSION: 'requirements-config-version',
    CUSTOM_FILTERS: 'requirements-custom-filters',
    HIDDEN_COLUMNS: 'requirements-hidden-columns',
    COLUMN_ORDER: 'requirements-column-order',
    SORT_CONFIG: 'requirements-sort-config',
    VIEW_MODE: 'requirements-view-mode',
  },
  /** 预排期相关 */
  SCHEDULED: {
    CONFIG_VERSION: 'scheduled-config-version',
    CUSTOM_FILTERS: 'scheduled-custom-filters',
    HIDDEN_COLUMNS: 'scheduled-hidden-columns',
    COLUMN_ORDER: 'scheduled-column-order',
    SORT_CONFIG: 'scheduled-sort-config',
  },
  /** 版本管理相关 */
  VERSIONS: {
    DATA: 'version_management_versions',
    CUSTOM_PLATFORMS: 'version_management_custom_platforms',
  },
  /** 用户偏好设置 */
  USER_PREFERENCES: {
    THEME: 'user-theme',
    LANGUAGE: 'user-language',
    SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  },
  /** 认证相关 */
  AUTH: {
    TOKEN: 'auth-token',
    USER: 'auth-user',
    REFRESH_TOKEN: 'auth-refresh-token',
  },
} as const;

/**
 * API 配置
 */
export const API_CONFIG = {
  /** API 基础 URL */
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  /** API 超时时间（毫秒） */
  TIMEOUT: 30000,
  /** 重试次数 */
  RETRY_TIMES: 3,
  /** 重试延迟（毫秒） */
  RETRY_DELAY: 1000,
} as const;

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  /** 默认每页数量 */
  DEFAULT_PAGE_SIZE: 20,
  /** 每页数量选项 */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  /** 虚拟滚动阈值 */
  VIRTUALIZATION_THRESHOLD: 100,
} as const;

/**
 * UI 配置
 */
export const UI_CONFIG = {
  /** 表格配置 */
  TABLE: {
    /** 默认行高（像素） */
    ROW_HEIGHT: 64,
    /** 表格最小宽度（像素） */
    MIN_WIDTH: 1000,
    /** 虚拟滚动 overscan */
    VIRTUAL_OVERSCAN: 5,
  },
  /** 动画配置 */
  ANIMATION: {
    /** 过渡时间（毫秒） */
    TRANSITION_DURATION: 150,
    /** 缓动函数 */
    TIMING_FUNCTION: 'ease-in-out',
  },
  /** Toast 通知配置 */
  TOAST: {
    /** 默认显示时间（毫秒） */
    DURATION: 3000,
    /** 最大显示数量 */
    MAX_TOASTS: 3,
  },
  /** 防抖延迟 */
  DEBOUNCE: {
    /** 搜索防抖（毫秒） */
    SEARCH: 300,
    /** localStorage 写入防抖（毫秒） */
    STORAGE: 500,
    /** 输入防抖（毫秒） */
    INPUT: 300,
  },
} as const;

/**
 * 业务规则配置
 */
export const BUSINESS_RULES = {
  /** 批量操作限制 */
  BATCH_OPERATION: {
    /** 最大批量操作数量 */
    MAX_COUNT: 100,
    /** 批量操作超时（毫秒） */
    TIMEOUT: 60000,
  },
  /** 文件上传限制 */
  FILE_UPLOAD: {
    /** 最大文件大小（字节） */
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    /** 最大文件数量 */
    MAX_FILES: 5,
    /** 允许的文件类型 */
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
  },
  /** 输入长度限制 */
  INPUT_LIMITS: {
    /** 搜索框最大长度 */
    SEARCH: 200,
    /** 标题最大长度 */
    TITLE: 100,
    /** 描述最大长度 */
    DESCRIPTION: 5000,
    /** 评审意见最大长度 */
    REVIEW_OPINION: 1000,
    /** 筛选值最大长度 */
    FILTER_VALUE: 500,
    /** ID 最大长度 */
    ID: 50,
  },
} as const;

/**
 * 功能开关
 * 用于控制功能的启用/禁用
 */
export const FEATURE_FLAGS = {
  /** 启用虚拟滚动 */
  ENABLE_VIRTUALIZATION: true,
  /** 启用键盘快捷键 */
  ENABLE_SHORTCUTS: true,
  /** 启用离线模式 */
  ENABLE_OFFLINE: false,
  /** 启用性能监控 */
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development',
  /** 启用调试模式 */
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  /** 启用 Sentry 错误监控 */
  ENABLE_SENTRY: process.env.NODE_ENV === 'production',
} as const;

/**
 * 环境变量
 */
export const ENV = {
  /** 当前环境 */
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  /** 是否为开发环境 */
  IS_DEV: process.env.NODE_ENV === 'development',
  /** 是否为生产环境 */
  IS_PROD: process.env.NODE_ENV === 'production',
  /** 是否为测试环境 */
  IS_TEST: process.env.NODE_ENV === 'test',
  /** API URL */
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  /** Sentry DSN */
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  /** 应用版本 */
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
} as const;

/**
 * 应用元数据
 */
export const APP_METADATA = {
  /** 应用名称 */
  NAME: '产品需求管理系统',
  /** 应用简称 */
  SHORT_NAME: '需求管理',
  /** 应用描述 */
  DESCRIPTION: '高效的产品需求管理和协作平台',
  /** 应用版本 */
  VERSION: ENV.APP_VERSION,
  /** 作者 */
  AUTHOR: 'Product Team',
  /** 版权信息 */
  COPYRIGHT: `© ${new Date().getFullYear()} Product Team. All rights reserved.`,
} as const;

/**
 * 导出所有配置
 */
export default {
  CONFIG_VERSIONS,
  STORAGE_KEYS,
  API_CONFIG,
  PAGINATION_CONFIG,
  UI_CONFIG,
  BUSINESS_RULES,
  FEATURE_FLAGS,
  ENV,
  APP_METADATA,
} as const;

