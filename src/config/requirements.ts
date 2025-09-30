/**
 * 需求管理系统配置文件
 * 统一管理各种配置项，避免重复定义
 */

// 需求类型配置
export const REQUIREMENT_TYPE_CONFIG = {
  '新功能': { 
    label: '新功能', 
    color: 'bg-green-100 text-green-800',
    icon: '✨'
  },
  '优化': { 
    label: '优化', 
    color: 'bg-blue-100 text-blue-800',
    icon: '⚡'
  },
  'BUG': { 
    label: 'BUG', 
    color: 'bg-red-100 text-red-800',
    icon: '🐛'
  },
  '用户反馈': { 
    label: '用户反馈', 
    color: 'bg-purple-100 text-purple-800',
    icon: '💬'
  },
  '商务需求': { 
    label: '商务需求', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: '💼'
  }
} as const;

// 优先级配置
export const PRIORITY_CONFIG = {
  '低': { 
    label: '低', 
    className: 'bg-green-100 text-green-800',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    order: 1
  },
  '中': { 
    label: '中', 
    className: 'bg-yellow-100 text-yellow-800',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    order: 2
  },
  '高': { 
    label: '高', 
    className: 'bg-orange-100 text-orange-800',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    order: 3
  },
  '紧急': { 
    label: '紧急', 
    className: 'bg-red-100 text-red-800',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    order: 4
  }
} as const;

// 是否要做配置
export const NEED_TO_DO_CONFIG = {
  '是': { 
    label: '是', 
    color: 'text-green-700', 
    bgColor: 'bg-green-50',
    className: 'bg-green-100 text-green-800'
  },
  '否': { 
    label: '否', 
    color: 'text-red-700', 
    bgColor: 'bg-red-50',
    className: 'bg-red-100 text-red-800'
  },
  '待定': { 
    label: '待定', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-50',
    className: 'bg-gray-100 text-gray-800'
  }
} as const;

// 平台配置
export const PLATFORM_CONFIG = {
  'Web端': { label: 'Web端', icon: '🌐' },
  '移动端': { label: '移动端', icon: '📱' },
  'PC端': { label: 'PC端', icon: '💻' },
  'API接口': { label: 'API接口', icon: '🔌' },
  '全端': { label: '全端', icon: '🌍' }
} as const;

// 状态配置
export const STATUS_CONFIG = {
  '待评审': { 
    label: '待评审', 
    color: 'bg-gray-100 text-gray-800',
    description: '需求已提交，等待评审'
  },
  '评审中': { 
    label: '评审中', 
    color: 'bg-blue-100 text-blue-800',
    description: '需求正在评审中'
  },
  '评审通过': { 
    label: '评审通过', 
    color: 'bg-green-100 text-green-800',
    description: '需求评审通过，可以开始开发'
  },
  '评审不通过': { 
    label: '评审不通过', 
    color: 'bg-red-100 text-red-800',
    description: '需求评审不通过，需要修改'
  },
  '已关闭': { 
    label: '已关闭', 
    color: 'bg-gray-100 text-gray-800',
    description: '需求已关闭'
  },
  '开发中': { 
    label: '开发中', 
    color: 'bg-yellow-100 text-yellow-800',
    description: '需求正在开发中'
  },
  '已完成': { 
    label: '已完成', 
    color: 'bg-green-100 text-green-800',
    description: '需求开发完成'
  },
  '设计中': { 
    label: '设计中', 
    color: 'bg-purple-100 text-purple-800',
    description: '需求正在设计中'
  }
} as const;

// 筛选操作符配置
export const FILTER_OPERATORS = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'starts_with', label: '开始于' },
  { value: 'ends_with', label: '结束于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
] as const;

// 可筛选的列定义
export const FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'creator', label: '创建人' },
  { value: 'endOwner', label: '端负责人' },
  { value: 'needToDo', label: '是否要做' },
  { value: 'platforms', label: '应用端' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' }
] as const;

// 默认隐藏的列
export const DEFAULT_HIDDEN_COLUMNS = ['createdAt', 'updatedAt'];

// 默认排序配置
export const DEFAULT_SORT_CONFIG = {
  field: 'updatedAt',
  direction: 'desc' as const
};

// 文件上传配置
export const FILE_UPLOAD_CONFIG = {
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
} as const;

// 分页配置
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
} as const;

// 工具函数
export function getRequirementTypeConfig(type: string) {
  return REQUIREMENT_TYPE_CONFIG[type as keyof typeof REQUIREMENT_TYPE_CONFIG];
}

export function getPriorityConfig(priority: string) {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
}

export function getNeedToDoConfig(needToDo: string) {
  return NEED_TO_DO_CONFIG[needToDo as keyof typeof NEED_TO_DO_CONFIG];
}

export function getPlatformConfig(platform: string) {
  return PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
} 