// Issue相关类型定义，对应后端GraphQL schema

export interface User {
  id: string;
  name: string;
  email: string;
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
  status: string;
  assignee?: User;
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

