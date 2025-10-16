/**
 * 系统限制配置
 * 
 * 统一管理所有系统限制参数,避免魔法数字散落在代码中
 * 
 * @module config/limits
 */

/**
 * 系统限制常量
 */
export const SYSTEM_LIMITS = {
  /** 批量操作最大数量 */
  BATCH_OPERATION_MAX: 100,
  
  /** 单个函数推荐最大行数 */
  FUNCTION_MAX_LINES: 50,
  
  /** 单个类/组件推荐最大行数 */
  CLASS_MAX_LINES: 500,
  
  /** 需求列表虚拟滚动阈值 (超过此数量启用虚拟滚动) */
  VIRTUALIZATION_THRESHOLD: 100,
  
  /** 筛选防抖延迟 (ms) */
  FILTER_DEBOUNCE_DELAY: 300,
  
  /** localStorage 保存防抖延迟 (ms) */
  STORAGE_DEBOUNCE_DELAY: 500,
  
  /** API 请求超时 (ms) */
  API_TIMEOUT: 30000,
  
  /** 评审意见最大长度 */
  REVIEW_OPINION_MAX_LENGTH: 1000,
  
  /** 加载状态最小显示时间 (ms) - 避免闪烁 */
  LOADING_MIN_DISPLAY_TIME: 100,
  
  /** 模拟 API 调用延迟 (ms) - 开发环境 */
  MOCK_API_DELAY: 1000,
  
  /** 批量操作背景更新延迟 (ms) */
  BACKGROUND_UPDATE_DELAY: 100,
  
  /** 删除操作 API 延迟 (ms) */
  DELETE_API_DELAY: 500,
} as const;

/**
 * 表格相关限制
 */
export const TABLE_LIMITS = {
  /** 表格最小宽度 (px) */
  MIN_WIDTH: 1000,
  
  /** 表格默认最大高度 */
  MAX_HEIGHT: 'calc(100vh - 200px)',
  
  /** 预排期表格最大高度 */
  SCHEDULED_MAX_HEIGHT: 'calc(100vh - 250px)',
  
  /** 版本管理表格最大高度 */
  VERSION_MAX_HEIGHT: 'calc(100vh - 200px)',
} as const;

/**
 * 时间相关常量
 */
export const TIME_CONSTANTS = {
  /** 一天的毫秒数 */
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  
  /** 一周的毫秒数 */
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  
  /** PRD 开发周期 (工作日) */
  PRD_DURATION_DAYS: 3,
  
  /** 原型设计周期 (工作日) */
  PROTOTYPE_DURATION_DAYS: 5,
  
  /** 开发周期 (工作日) */
  DEV_DURATION_DAYS: 10,
  
  /** 上线前周数 (PRD 开始时间) */
  PRD_START_WEEKS_BEFORE: 4,
  
  /** 上线前周数 (原型开始时间) */
  PROTOTYPE_START_WEEKS_BEFORE: 3,
  
  /** 上线前周数 (开发开始时间) */
  DEV_START_WEEKS_BEFORE: 2,
} as const;

/**
 * 存储相关常量
 */
export const STORAGE_KEYS = {
  /** 需求池配置版本 */
  REQUIREMENTS_CONFIG_VERSION: 'requirements-config-version',
  
  /** 需求池隐藏列 */
  REQUIREMENTS_HIDDEN_COLUMNS: 'requirements-hidden-columns',
  
  /** 需求池列顺序 */
  REQUIREMENTS_COLUMN_ORDER: 'requirements-column-order',
  
  /** 需求池自定义筛选 */
  REQUIREMENTS_CUSTOM_FILTERS: 'requirements-custom-filters',
  
  /** 预排期配置版本 */
  SCHEDULED_CONFIG_VERSION: 'scheduled-config-version',
  
  /** 预排期隐藏列 */
  SCHEDULED_HIDDEN_COLUMNS: 'scheduled-hidden-columns',
  
  /** 预排期列顺序 */
  SCHEDULED_COLUMN_ORDER: 'scheduled-column-order',
  
  /** 预排期自定义筛选 */
  SCHEDULED_CUSTOM_FILTERS: 'scheduled-custom-filters',
  
  /** 版本管理数据 */
  VERSION_MANAGEMENT_VERSIONS: 'version_management_versions',
  
  /** 版本管理自定义平台 */
  VERSION_MANAGEMENT_CUSTOM_PLATFORMS: 'version_management_custom_platforms',
} as const;

/**
 * 配置版本号
 * 当配置结构发生变化时更新版本号,触发配置重置
 */
export const CONFIG_VERSIONS = {
  /** 需求池配置版本 */
  REQUIREMENTS: '2.0',
  
  /** 预排期配置版本 */
  SCHEDULED: '6.1',
  
  /** 版本管理配置版本 */
  VERSION: '1.0',
} as const;

/**
 * 优先级排序顺序
 */
export const PRIORITY_ORDER = {
  '低': 1,
  '中': 2,
  '高': 3,
  '紧急': 4,
} as const;

/**
 * 周几映射 (用于计算周一、周三、周五)
 */
export const WEEK_DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * 列宽度配置 (像素)
 * 确保表头和内容对齐
 */
export const COLUMN_WIDTHS = {
  /** 序号列 */
  INDEX: 80,
  
  /** ID列 */
  ID: 96,
  
  /** 标题列 */
  TITLE: 256,
  
  /** 类型列 */
  TYPE: 112,
  
  /** 应用端列 */
  PLATFORMS: 144,
  
  /** 优先级列 */
  PRIORITY: 96,
  
  /** 版本号列 */
  VERSION: 128,
  
  /** 总评审状态列 */
  OVERALL_REVIEW_STATUS: 144,
  
  /** 评审人列 */
  REVIEWER: 128,
  
  /** 评审状态列 */
  REVIEW_STATUS: 112,
  
  /** 评审意见列 */
  REVIEW_OPINION: 128,
  
  /** 是否运营列 */
  IS_OPERATIONAL: 96,
  
  /** 创建人列 */
  CREATOR: 128,
  
  /** 时间列 */
  TIMESTAMP: 180,
  
  /** 版本管理 - 版本号 */
  VERSION_NUMBER: 200,
  
  /** 版本管理 - 上线时间 */
  RELEASE_DATE: 150,
  
  /** 版本管理 - 时间节点 */
  SCHEDULE_ITEM: 200,
  
  /** 版本管理 - 操作 */
  ACTIONS: 120,
} as const;


