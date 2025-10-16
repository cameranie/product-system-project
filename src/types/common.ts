/**
 * 通用类型定义
 * 
 * 减少 any 类型使用，提高类型安全
 */

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 优先级类型
 */
export type Priority = '低' | '中' | '高' | '紧急';

/**
 * 是否要做类型
 */
export type NeedToDo = '是' | '否';

/**
 * 是否运营类型
 */
export type IsOperational = 'yes' | 'no';

/**
 * 评审状态类型
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * 总评审状态类型
 */
export type OverallReviewStatus = 
  | 'pending' 
  | 'level1_approved' 
  | 'level1_rejected' 
  | 'level2_rejected' 
  | 'approved';

/**
 * 排序方向类型
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 筛选操作符类型
 */
export type FilterOperator = 
  | 'contains'
  | 'equals'
  | 'not_equals'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

/**
 * 用户角色类型
 */
export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'hr_manager' 
  | 'product_manager' 
  | 'developer' 
  | 'tester' 
  | 'user';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles?: { name: UserRole }[];
}

/**
 * 通用选项接口
 */
export interface Option<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * 通用配置接口
 */
export interface Config<T = any> {
  label: string;
  value?: T;
  className?: string;
  color?: string;
  icon?: string | React.ReactNode;
  description?: string;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
}

/**
 * 表单验证错误接口
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 操作结果接口
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 环境类型
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 语言类型
 */
export type Language = 'zh-CN' | 'en-US';

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * 异步事件处理器类型
 */
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

/**
 * 值或Promise类型
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * 可选Promise类型（值可以为undefined）
 */
export type MaybeAsync<T> = T | Promise<T | undefined>;

/**
 * 深度部分类型
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/**
 * 提取Promise返回值类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * 提取数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * 对象键值类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 必需属性类型
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 可选属性类型
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 非空类型
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * 函数参数类型
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * 函数返回值类型
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

/**
 * 构造函数参数类型
 */
export type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;

/**
 * 实例类型
 */
export type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : never;

