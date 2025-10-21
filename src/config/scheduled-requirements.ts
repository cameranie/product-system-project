/**
 * 预排期需求管理配置
 * 
 * P3 代码质量优化：抽取魔法字符串和魔法数字为常量
 * 
 * 集中管理预排期页面的所有配置项，包括：
 * - 列宽度配置
 * - 版本选项
 * - 评审状态选项
 * - 是否运营选项
 * - 筛选操作符
 * 
 * @module scheduled-requirements
 */

/**
 * 列固定宽度配置
 * 
 * 用于表格列的固定宽度布局，确保所有行对齐
 */
export const SCHEDULED_COLUMN_WIDTHS = {
  id: 'w-24',
  title: 'w-64',
  type: 'w-28',
  platforms: 'w-36',
  priority: 'w-24',
  version: 'w-32',
  overallReviewStatus: 'w-36',
  level1Reviewer: 'w-32',
  level1Status: 'w-28',
  level1Opinion: 'w-32',
  level2Reviewer: 'w-32',
  level2Status: 'w-28',
  level2Opinion: 'w-32',
  isOperational: 'w-24',
  creator: 'w-32',
  createdAt: 'w-36',
  updatedAt: 'w-36',
} as const;

/**
 * 默认列顺序
 * ID列放在标题后面
 */
export const DEFAULT_SCHEDULED_COLUMN_ORDER = [
  'title',
  'id',
  'type',
  'platforms',
  'priority',
  'version',
  'overallReviewStatus',
  'level1Reviewer',
  'level1Status',
  'level1Opinion',
  'level2Reviewer',
  'level2Status',
  'level2Opinion',
  'isOperational',
  'creator',
  'createdAt',
  'updatedAt',
] as const;

/**
 * 默认可见列
 * 默认隐藏：id、type、creator、createdAt、updatedAt
 */
export const DEFAULT_SCHEDULED_VISIBLE_COLUMNS = [
  'title',
  'priority',
  'version',
  'overallReviewStatus',
  'level1Reviewer',
  'level1Status',
  'level1Opinion',
  'level2Reviewer',
  'level2Status',
  'level2Opinion',
  'isOperational',
] as const;

/**
 * 版本选项配置
 */
export const VERSION_OPTIONS = [
  '暂无版本号',
  'v1.0.0',
  'v1.1.0',
  'v1.2.0',
  'v1.3.0',
  'v2.0.0',
  'v2.1.0',
] as const;

/**
 * 评审状态选项配置
 */
export const REVIEW_STATUS_OPTIONS = [
  { 
    value: 'pending', 
    label: '待评审', 
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    color: 'gray'
  },
  { 
    value: 'approved', 
    label: '通过', 
    className: 'bg-green-50 text-green-700 border-green-200',
    color: 'green'
  },
  { 
    value: 'rejected', 
    label: '不通过', 
    className: 'bg-red-50 text-red-700 border-red-200',
    color: 'red'
  },
] as const;

/**
 * 总评审状态选项配置
 */
export const OVERALL_REVIEW_STATUS_OPTIONS = [
  { 
    value: 'pending', 
    label: '待一级评审', 
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    color: 'gray'
  },
  { 
    value: 'level1_approved', 
    label: '待二级评审', 
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    color: 'blue'
  },
  { 
    value: 'level1_rejected', 
    label: '一级评审不通过', 
    className: 'bg-red-50 text-red-700 border-red-200',
    color: 'red'
  },
  { 
    value: 'level2_rejected', 
    label: '二级评审不通过', 
    className: 'bg-red-50 text-red-700 border-red-200',
    color: 'red'
  },
  { 
    value: 'approved', 
    label: '二级评审通过', 
    className: 'bg-green-50 text-green-700 border-green-200',
    color: 'green'
  },
] as const;

/**
 * 是否运营选项配置
 */
export const OPERATIONAL_OPTIONS = [
  { 
    value: 'unset', 
    label: '未填写', 
    className: 'text-muted-foreground',
    color: 'muted'
  },
  { 
    value: 'yes', 
    label: '是', 
    className: 'text-purple-700',
    color: 'purple'
  },
  { 
    value: 'no', 
    label: '否', 
    className: 'text-gray-700',
    color: 'gray'
  },
] as const;

/**
 * 筛选操作符配置
 */
export const SCHEDULED_FILTER_OPERATORS = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'starts_with', label: '开始于' },
  { value: 'ends_with', label: '结束于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
] as const;

/**
 * 可筛选列配置
 */
/**
 * 可在列控制面板中显示的所有列配置
 * 注意：这个列表要包含所有可能出现在表格中的列
 */
export const SCHEDULED_FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '类型' },
  { value: 'platforms', label: '应用端' },
  { value: 'priority', label: '优先级' },
  { value: 'version', label: '版本号' },
  { value: 'overallReviewStatus', label: '总评审状态' },
  { value: 'level1Reviewer', label: '一级评审人' },
  { value: 'level1Status', label: '一级评审' },
  { value: 'level1Opinion', label: '一级意见' },
  { value: 'level2Reviewer', label: '二级评审人' },
  { value: 'level2Status', label: '二级评审' },
  { value: 'level2Opinion', label: '二级意见' },
  { value: 'isOperational', label: '是否运营' },
  { value: 'creator', label: '创建人' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' },
] as const;

/**
 * 列配置版本号
 * 
 * 当列配置结构发生变化时，递增此版本号以清除旧配置
 * v6.5: 强制重置hiddenColumns - 确保6个默认隐藏列
 */
export const SCHEDULED_CONFIG_VERSION = '6.5';

/**
 * localStorage 键名常量
 */
export const SCHEDULED_STORAGE_KEYS = {
  CONFIG_VERSION: 'scheduled-config-version',
  CUSTOM_FILTERS: 'scheduled-custom-filters',
  HIDDEN_COLUMNS: 'scheduled-hidden-columns',
  COLUMN_ORDER: 'scheduled-column-order',
} as const;

/**
 * UI 配置常量
 */
export const SCHEDULED_UI_CONFIG = {
  /** 批量操作最大数量限制 */
  BATCH_OPERATION_MAX_COUNT: 100,
  
  /** 搜索防抖延迟（毫秒） */
  SEARCH_DEBOUNCE_DELAY: 300,
  
  /** localStorage 写入防抖延迟（毫秒） */
  STORAGE_DEBOUNCE_DELAY: 500,
  
  /** 版本分组标题最小高度（像素） */
  VERSION_GROUP_MIN_HEIGHT: 32,
  
  /** 表格行高度（像素） */
  TABLE_ROW_HEIGHT: 48,
  
  /** 表格最小宽度（像素） */
  TABLE_MIN_WIDTH: 1400,
} as const;

/**
 * 评审级别常量
 */
export const REVIEW_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
} as const;

/**
 * 类型定义
 */
export type ScheduledColumnId = keyof typeof SCHEDULED_COLUMN_WIDTHS;
export type VersionOption = typeof VERSION_OPTIONS[number];
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type OverallReviewStatus = 'pending' | 'level1_approved' | 'level1_rejected' | 'level2_rejected' | 'approved';
export type OperationalValue = 'unset' | 'yes' | 'no';
export type FilterOperator = typeof SCHEDULED_FILTER_OPERATORS[number]['value'];

/**
 * 辅助函数：根据值获取评审状态配置
 */
export function getReviewStatusConfig(status: ReviewStatus) {
  return REVIEW_STATUS_OPTIONS.find(option => option.value === status);
}

/**
 * 辅助函数：根据值获取总评审状态配置
 */
export function getOverallReviewStatusConfig(status: OverallReviewStatus) {
  return OVERALL_REVIEW_STATUS_OPTIONS.find(option => option.value === status);
}

/**
 * 辅助函数：根据值获取运营状态配置
 */
export function getOperationalConfig(value: OperationalValue) {
  return OPERATIONAL_OPTIONS.find(option => option.value === value);
}

/**
 * 辅助函数：检查是否为有效的版本选项
 */
export function isValidVersion(version: string): version is VersionOption {
  return VERSION_OPTIONS.includes(version as VersionOption);
}

/**
 * 辅助函数：获取默认隐藏的列
 */
export function getDefaultHiddenColumns(): string[] {
  return DEFAULT_SCHEDULED_COLUMN_ORDER.filter(
    col => !DEFAULT_SCHEDULED_VISIBLE_COLUMNS.includes(col as any)
  );
}

