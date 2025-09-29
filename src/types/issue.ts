// Issue相关类型定义，对应后端GraphQL schema

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface IssueComment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  replies?: IssueComment[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: string;
  dueDate?: string;
  estimatedHours: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
}

export interface PRD {
  id: string;
  title: string;
  status: string;
  author: User;
}

// Issue状态枚举 - 对应后端定义
export enum IssueStatus {
  OPEN = 'OPEN',
  IN_DISCUSSION = 'IN_DISCUSSION', 
  APPROVED = 'APPROVED',
  IN_PRD = 'IN_PRD',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  IN_TESTING = 'IN_TESTING',
  IN_ACCEPTANCE = 'IN_ACCEPTANCE',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// 优先级枚举
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// 输入源枚举
export enum InputSource {
  USER_FEEDBACK = 'USER_FEEDBACK',
  INTERNAL = 'INTERNAL',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  STRATEGY = 'STRATEGY'
}

// Issue类型枚举
export enum IssueType {
  FEATURE = 'FEATURE',
  ENHANCEMENT = 'ENHANCEMENT',
  BUG_FIX = 'BUG_FIX',
  TECHNICAL_DEBT = 'TECHNICAL_DEBT',
  RESEARCH = 'RESEARCH'
}

// 主要的Issue接口
export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: Priority;
  inputSource: InputSource;
  issueType: IssueType;
  businessValue?: string;
  userImpact?: string;
  technicalRisk?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  creator: User;
  assignee?: User;
  project: Project;
  comments: IssueComment[];
  tasks: Task[];
  prds: PRD[];
}

// API响应类型
export interface IssueConnection {
  issues: Issue[];
  total: number;
  hasMore: boolean;
}

export interface IssueStats {
  total: number;
  byStatus: Array<{ status: IssueStatus; count: number }>;
  byPriority: Array<{ priority: Priority; count: number }>;
  byInputSource: Array<{ inputSource: InputSource; count: number }>;
  completionRate: number;
}

// 表单输入类型
export interface CreateIssueInput {
  title: string;
  description?: string;
  priority: Priority;
  inputSource: InputSource;
  issueType: IssueType;
  projectId: string;
  assigneeId?: string;
  businessValue?: string;
  userImpact?: string;
  technicalRisk?: string;
  dueDate?: string;
}

// 筛选条件类型
export interface IssueFilters {
  projectId?: string;
  status?: IssueStatus[];
  priority?: Priority[];
  inputSource?: InputSource[];
  issueType?: IssueType[];
  assigneeId?: string;
  creatorId?: string;
  keyword?: string;
}

// 分页类型
export interface Pagination {
  skip?: number;
  take?: number;
}

// 需求池相关类型定义
export enum RequirementStatus {
  PENDING = 'PENDING',           // 待审核
  APPROVED = 'APPROVED',         // 审核通过
  REJECTED = 'REJECTED',         // 审核不通过
  SCHEDULED = 'SCHEDULED',       // 已排期
  IN_DEVELOPMENT = 'IN_DEVELOPMENT', // 开发中
  COMPLETED = 'COMPLETED'        // 已完成
}

export enum RequirementType {
  NEW_FEATURE = 'NEW_FEATURE',           // 新功能
  OPTIMIZATION = 'OPTIMIZATION',         // 优化
  BUG = 'BUG',                          // bug
  USER_FEEDBACK = 'USER_FEEDBACK',       // 用户反馈
  BUSINESS_REQUIREMENT = 'BUSINESS_REQUIREMENT'  // 商务需求
}

export enum ApplicationPlatform {
  WEB = 'WEB',                   // Web端
  MOBILE = 'MOBILE',             // 移动端
  DESKTOP = 'DESKTOP',           // 桌面端
  API = 'API',                   // API接口
  ALL = 'ALL'                    // 全端
}

export interface Requirement {
  id: string;
  title: string;                 // 需求名称
  description: string;           // 需求描述
  type: RequirementType;         // 需求类型
  platform: ApplicationPlatform[]; // 应用端 - 改为数组支持多平台
  priority: Priority;            // 优先级
  status: RequirementStatus;     // 状态
  submitter: User;               // 需求提出者
  reviewer?: User;               // 审核人
  assignee?: User;               // 负责人
  expectedVersion?: string;      // 预期版本号
  businessValue?: string;        // 商业价值
  userImpact?: string;          // 用户影响
  technicalRisk?: string;       // 技术风险
  attachments?: string[];       // 附件链接
  relatedRequirements?: string[]; // 关联需求ID列表
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;         // 提交审核时间
  reviewedAt?: string;          // 审核时间
  scheduledAt?: string;         // 排期时间
  dueDate?: string;             // 预期完成时间
  // 新增字段
  needToDo?: '是' | '否';        // 是否要做 - 产品评估决策
  isOpen?: boolean;             // 需求是否开放
  project?: Project;            // 关联项目信息
  tags?: string[];              // 标签
}

export interface RequirementComment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  requirementId: string;
}

// 需求创建输入类型
export interface CreateRequirementInput {
  title: string;
  description: string;
  type: RequirementType;
  platform: ApplicationPlatform;
  priority: Priority;
  businessValue?: string;
  userImpact?: string;
  technicalRisk?: string;
  attachments?: string[];
  relatedRequirements?: string[];
}

// 需求筛选条件
export interface RequirementFilters {
  status?: RequirementStatus[];
  type?: RequirementType[];
  platform?: ApplicationPlatform[];
  priority?: Priority[];
  submitterId?: string;
  reviewerId?: string;
  assigneeId?: string;
  keyword?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// 需求统计
export interface RequirementStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  scheduled: number;
  byType: Array<{ type: RequirementType; count: number }>;
  byPlatform: Array<{ platform: ApplicationPlatform; count: number }>;
  byPriority: Array<{ priority: Priority; count: number }>;
}

// 高级筛选条件
export interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
  value: string;
}

// 排序配置
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// 可筛选的列配置
export interface FilterableColumn {
  value: string;
  label: string;
}

// 需求池页面状态
export type RequirementPoolStatus = '全部' | '开放中' | '已关闭';

// 需求池扩展筛选条件
export interface RequirementPoolFilters extends RequirementFilters {
  needToDo?: ('是' | '否' | undefined)[];
  isOpen?: boolean;
  customFilters?: FilterCondition[];
}

