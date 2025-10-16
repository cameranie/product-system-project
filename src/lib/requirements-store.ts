import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface EndOwnerOpinion {
  needToDo?: '是' | '否';
  priority?: '低' | '中' | '高' | '紧急';
  opinion?: string;
  owner?: User;
}

export interface ScheduledReviewLevel {
  id: string;
  level: number;
  levelName: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: User;
  reviewedAt?: string;
  opinion?: string;
}

export interface ScheduledReviewData {
  reviewLevels: ScheduledReviewLevel[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
  replies: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
}

export interface Requirement {
  id: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';
  priority?: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  platforms: string[];
  plannedVersion?: string;
  isOpen: boolean;
  needToDo?: '是' | '否';
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  assignee?: User;
  prototypeId?: string;
  prdId?: string;
  attachments: Attachment[];
  endOwnerOpinion: EndOwnerOpinion;
  scheduledReview: ScheduledReviewData;
  delayTag?: string; // 延期标签，如 "PC 8.25 延版本"
  isOperational?: 'yes' | 'no'; // 是否运营性需求
  comments?: Comment[]; // 评论列表
}

// 模拟用户数据
export const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '', email: 'sunqi@example.com' },
];

// 模拟项目数据
export const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' },
];

// 初始模拟数据
const initialRequirements: Requirement[] = [
  {
    id: '#1',
    title: '用户登录功能优化',
    type: '优化',
    status: '评审中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化用户登录流程，提升用户体验。包括：\n1. 简化登录表单\n2. 增加记住密码功能\n3. 优化错误提示\n4. 支持第三方登录',
    tags: ['用户体验', '登录', '优化'],
               createdAt: '2024-01-15 10:30',
           updatedAt: '2024-01-20 14:25',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[3],
    attachments: [
      { id: '1', name: '登录流程图.png', size: 1024000, type: 'image/png', url: '' },
      { id: '2', name: '需求文档.docx', size: 512000, type: 'application/docx', url: '' }
    ],
    endOwnerOpinion: {
      needToDo: '是',
      priority: '高',
      opinion: '这个功能很重要，建议优先处理',
      owner: mockUsers[3]
    },
    scheduledReview: {
      reviewLevels: [
        {
          id: '1',
          level: 1,
          levelName: '一级评审',
          status: 'approved',
          reviewer: mockUsers[1],
          opinion: '功能设计合理，同意开发'
        },
        {
          id: '2',
          level: 2,
          levelName: '二级评审',
          status: 'pending',
          reviewer: mockUsers[2],
          opinion: ''
        }
      ]
    }
  },
  {
    id: '#2',
    title: '移动端界面适配',
    type: '新功能',
    status: '待评审',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[1],
    description: '为移动端用户提供更好的界面体验，包括响应式设计和触摸优化。',
    tags: ['移动端', '界面', '适配'],
               createdAt: '2024-01-18 09:15',
           updatedAt: '2024-01-18 09:15',
    platforms: ['移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    attachments: [],
    endOwnerOpinion: {
      needToDo: undefined,
      priority: undefined,
      opinion: '',
      owner: undefined
    },
    scheduledReview: {
      reviewLevels: [
        {
          id: '3',
          level: 1,
          levelName: '一级评审',
          status: 'pending'
        }
      ]
    },
    delayTag: '移动端 8.15 延版本',
    isOperational: 'yes'
  },
  {
    id: '#3',
    title: '数据导出功能',
    type: '新功能',
    status: '开发中',
    priority: '高',
    creator: mockUsers[2],
    project: mockProjects[2],
    description: '支持用户导出各种格式的数据，包括Excel、CSV、PDF等格式。',
    tags: ['导出', '数据', '功能'],
               createdAt: '2024-01-10 16:45',
           updatedAt: '2024-01-22 11:20',
    platforms: ['Web端', 'PC端', '移动端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewer1: mockUsers[3],
    reviewer2: mockUsers[4],
    assignee: mockUsers[0],
    attachments: [],
    endOwnerOpinion: {
      needToDo: '是',
      priority: '低',
      opinion: '功能有用但不紧急',
      owner: mockUsers[4]
    },
    scheduledReview: {
      reviewLevels: [
        {
          id: '4',
          level: 1,
          levelName: '一级评审',
          status: 'approved',
          reviewer: mockUsers[3],
          opinion: '功能实用，同意开发'
        },
        {
          id: '5',
          level: 2,
          levelName: '二级评审',
          status: 'approved',
          reviewer: mockUsers[4],
          opinion: '技术方案可行'
        }
      ]
    }
  },
  // v1.2.0 版本 - 新增需求
  {
    id: '#4',
    title: '性能监控面板',
    type: '新功能',
    status: '待评审',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '实时监控系统性能指标',
    tags: ['性能', '监控'],
    createdAt: '2024-01-16 10:00',
    updatedAt: '2024-01-16 10:00',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '6', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#5',
    title: '用户权限管理优化',
    type: '优化',
    status: '评审中',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[0],
    description: '优化用户权限管理功能',
    tags: ['权限', '管理'],
    createdAt: '2024-01-17 11:30',
    updatedAt: '2024-01-17 14:20',
    platforms: ['Web端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'first_review',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '中', opinion: '需要优化', owner: mockUsers[2] },
    scheduledReview: {
      reviewLevels: [
        { id: '7', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[2], opinion: '同意' },
        { id: '8', level: 2, levelName: '二级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#6',
    title: '数据统计报表',
    type: '新功能',
    status: '待评审',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '提供数据统计和分析报表',
    tags: ['统计', '报表'],
    createdAt: '2024-01-18 09:00',
    updatedAt: '2024-01-18 09:00',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '9', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#7',
    title: '消息推送功能',
    type: '新功能',
    status: '评审中',
    priority: '高',
    creator: mockUsers[3],
    project: mockProjects[0],
    description: '实现站内消息推送',
    tags: ['消息', '推送'],
    createdAt: '2024-01-19 10:30',
    updatedAt: '2024-01-19 15:45',
    platforms: ['Web端', '移动端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'approved',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '高', opinion: '重要功能', owner: mockUsers[1] },
    scheduledReview: {
      reviewLevels: [
        { id: '10', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[1], opinion: '同意开发' },
        { id: '11', level: 2, levelName: '二级评审', status: 'approved', reviewer: mockUsers[2], opinion: '技术可行' }
      ]
    }
  },
  {
    id: '#8',
    title: '文件上传优化',
    type: '优化',
    status: '待评审',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[2],
    description: '提升文件上传速度和稳定性',
    tags: ['文件', '上传', '优化'],
    createdAt: '2024-01-20 14:00',
    updatedAt: '2024-01-20 14:00',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '12', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#9',
    title: '搜索功能增强',
    type: '优化',
    status: '评审中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[1],
    description: '增强搜索功能，支持更多搜索条件',
    tags: ['搜索', '优化'],
    createdAt: '2024-01-21 09:30',
    updatedAt: '2024-01-21 11:20',
    platforms: ['Web端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'first_review',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '中', opinion: '可以优化', owner: mockUsers[3] },
    scheduledReview: {
      reviewLevels: [
        { id: '13', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[3], opinion: '同意' },
        { id: '14', level: 2, levelName: '二级评审', status: 'pending' }
      ]
    },
    isOperational: 'no'
  },
  {
    id: '#10',
    title: '用户反馈模块',
    type: '新功能',
    status: '待评审',
    priority: '低',
    creator: mockUsers[1],
    project: mockProjects[0],
    description: '收集用户反馈和建议',
    tags: ['反馈', '用户'],
    createdAt: '2024-01-22 10:00',
    updatedAt: '2024-01-22 10:00',
    platforms: ['Web端', '移动端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '15', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#11',
    title: '系统日志查询',
    type: '新功能',
    status: '评审中',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[2],
    description: '提供系统日志查询功能',
    tags: ['日志', '查询'],
    createdAt: '2024-01-23 11:00',
    updatedAt: '2024-01-23 14:30',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.2.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'second_review',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '中', opinion: '有必要', owner: mockUsers[4] },
    scheduledReview: {
      reviewLevels: [
        { id: '16', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[4], opinion: '同意' },
        { id: '17', level: 2, levelName: '二级评审', status: 'pending', reviewer: mockUsers[1] }
      ]
    }
  },
  // v1.3.0 版本 - 新增需求
  {
    id: '#12',
    title: '移动端首页改版',
    type: '优化',
    status: '待评审',
    priority: '高',
    creator: mockUsers[3],
    project: mockProjects[1],
    description: '重新设计移动端首页布局',
    tags: ['移动端', '首页', '改版'],
    createdAt: '2024-01-24 09:00',
    updatedAt: '2024-01-24 09:00',
    platforms: ['移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '18', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#13',
    title: '在线客服系统',
    type: '新功能',
    status: '评审中',
    priority: '中',
    creator: mockUsers[4],
    project: mockProjects[0],
    description: '集成在线客服功能',
    tags: ['客服', '在线'],
    createdAt: '2024-01-25 10:30',
    updatedAt: '2024-01-25 13:45',
    platforms: ['Web端', '移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'first_review',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '中', opinion: '可以接入', owner: mockUsers[0] },
    scheduledReview: {
      reviewLevels: [
        { id: '19', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[0], opinion: '同意' },
        { id: '20', level: 2, levelName: '二级评审', status: 'pending' }
      ]
    },
    isOperational: 'yes'
  },
  {
    id: '#14',
    title: '图片压缩功能',
    type: '新功能',
    status: '待评审',
    priority: '低',
    creator: mockUsers[0],
    project: mockProjects[2],
    description: '自动压缩上传的图片',
    tags: ['图片', '压缩'],
    createdAt: '2024-01-26 14:00',
    updatedAt: '2024-01-26 14:00',
    platforms: ['Web端', 'PC端', '移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '21', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#15',
    title: '多语言支持',
    type: '新功能',
    status: '评审中',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[1],
    description: '支持中英文切换',
    tags: ['国际化', '多语言'],
    createdAt: '2024-01-27 09:30',
    updatedAt: '2024-01-27 16:20',
    platforms: ['Web端', 'PC端', '移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'approved',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '高', opinion: '国际化需求', owner: mockUsers[2] },
    scheduledReview: {
      reviewLevels: [
        { id: '22', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[2], opinion: '同意开发' },
        { id: '23', level: 2, levelName: '二级评审', status: 'approved', reviewer: mockUsers[3], opinion: '技术方案OK' }
      ]
    }
  },
  {
    id: '#16',
    title: '主题切换功能',
    type: '新功能',
    status: '待评审',
    priority: '低',
    creator: mockUsers[2],
    project: mockProjects[0],
    description: '支持明暗主题切换',
    tags: ['主题', '界面'],
    createdAt: '2024-01-28 10:00',
    updatedAt: '2024-01-28 10:00',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '24', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#17',
    title: '数据备份功能',
    type: '新功能',
    status: '评审中',
    priority: '高',
    creator: mockUsers[3],
    project: mockProjects[2],
    description: '定期自动备份数据',
    tags: ['备份', '数据'],
    createdAt: '2024-01-29 11:30',
    updatedAt: '2024-01-29 15:20',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'second_review',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '高', opinion: '安全需求', owner: mockUsers[1] },
    scheduledReview: {
      reviewLevels: [
        { id: '25', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[1], opinion: '必要功能' },
        { id: '26', level: 2, levelName: '二级评审', status: 'pending', reviewer: mockUsers[4] }
      ]
    }
  },
  {
    id: '#18',
    title: '操作日志记录',
    type: '新功能',
    status: '待评审',
    priority: '中',
    creator: mockUsers[4],
    project: mockProjects[1],
    description: '记录用户关键操作',
    tags: ['日志', '审计'],
    createdAt: '2024-01-30 09:00',
    updatedAt: '2024-01-30 09:00',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '27', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#19',
    title: 'API接口优化',
    type: '优化',
    status: '评审中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化API响应速度',
    tags: ['API', '性能', '优化'],
    createdAt: '2024-01-31 10:30',
    updatedAt: '2024-01-31 14:15',
    platforms: ['Web端', 'PC端', '移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'first_review',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '中', opinion: '性能优化', owner: mockUsers[3] },
    scheduledReview: {
      reviewLevels: [
        { id: '28', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[3], opinion: '同意优化' },
        { id: '29', level: 2, levelName: '二级评审', status: 'pending' }
      ]
    },
    isOperational: 'no'
  },
  {
    id: '#20',
    title: '通知中心',
    type: '新功能',
    status: '待评审',
    priority: '低',
    creator: mockUsers[1],
    project: mockProjects[2],
    description: '集中管理所有通知消息',
    tags: ['通知', '消息'],
    createdAt: '2024-02-01 11:00',
    updatedAt: '2024-02-01 11:00',
    platforms: ['Web端', '移动端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'pending',
    attachments: [],
    endOwnerOpinion: { needToDo: undefined, priority: undefined, opinion: '', owner: undefined },
    scheduledReview: {
      reviewLevels: [
        { id: '30', level: 1, levelName: '一级评审', status: 'pending' }
      ]
    }
  },
  {
    id: '#21',
    title: '数据可视化图表',
    type: '新功能',
    status: '评审中',
    priority: '高',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '提供丰富的数据可视化图表',
    tags: ['可视化', '图表', '数据'],
    createdAt: '2024-02-02 09:30',
    updatedAt: '2024-02-02 16:45',
    platforms: ['Web端', 'PC端'],
    plannedVersion: 'v1.3.0',
    isOpen: true,
    needToDo: '是',
    reviewStatus: 'approved',
    attachments: [],
    endOwnerOpinion: { needToDo: '是', priority: '高', opinion: '数据分析需要', owner: mockUsers[4] },
    scheduledReview: {
      reviewLevels: [
        { id: '31', level: 1, levelName: '一级评审', status: 'approved', reviewer: mockUsers[4], opinion: '同意开发' },
        { id: '32', level: 2, levelName: '二级评审', status: 'approved', reviewer: mockUsers[0], opinion: '技术可行' }
      ]
    }
  }
];

interface RequirementsStore {
  requirements: Requirement[];
  loading: boolean;
  error: string | null;
  
  // 获取所有需求
  getRequirements: () => Requirement[];
  
  // 根据ID获取需求
  getRequirementById: (id: string) => Requirement | undefined;
  
  // 创建需求
  createRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Requirement>;
  
  // 更新需求
  updateRequirement: (id: string, updates: Partial<Requirement>) => Promise<Requirement>;
  
  // 删除需求
  deleteRequirement: (id: string) => Promise<void>;
  
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  
  // 设置错误信息
  setError: (error: string | null) => void;
}

// 临时禁用持久化，确保数据更新
const enablePersistence = false; // 改为 true 可重新启用持久化

const storeConfig = (set: any, get: any) => ({
      requirements: initialRequirements,
      loading: false,
      error: null,

      getRequirements: () => {
        return get().requirements;
      },

      getRequirementById: (id: string) => {
        return get().requirements.find((req: Requirement) => req.id === id);
      },

      createRequirement: async (requirementData: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        
        try {
          // 模拟API调用延迟（毫秒）
          const MOCK_API_DELAY_MS = 1000;
          await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY_MS));
          
          const { formatDateTime, generateSecureId } = await import('@/lib/file-upload-utils');
          const timeString = formatDateTime();
          
          const newRequirement: Requirement = {
            ...requirementData,
            id: `#${get().requirements.length + 1}`,
            createdAt: timeString,
            updatedAt: timeString,
          };

          set((state: RequirementsStore) => ({
            requirements: [...state.requirements, newRequirement],
            loading: false
          }));

          return newRequirement;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '创建失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateRequirement: async (id: string, updates: Partial<Requirement>) => {
        const { formatDateTime } = await import('@/lib/file-upload-utils');
        const { AppError } = await import('@/lib/error-handler');
        
        const existingRequirement = get().requirements.find(req => req.id === id);
        if (!existingRequirement) {
          const error = new AppError(`需求 ${id} 不存在`, 'REQUIREMENT_NOT_FOUND', { id });
          set({ error: error.message });
          throw error;
        }
        
        const updatedRequirement = {
          ...existingRequirement,
          ...updates,
          updatedAt: formatDateTime(),
        };

        // 立即更新UI，无延迟
        set(state => ({
          requirements: state.requirements.map(req => 
            req.id === id ? updatedRequirement : req
          ),
          loading: false
        }));

        // 模拟后台API调用（不影响UI）
        try {
          const BACKGROUND_UPDATE_DELAY_MS = 100;
          await new Promise(resolve => setTimeout(resolve, BACKGROUND_UPDATE_DELAY_MS));
          return updatedRequirement;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '更新失败';
          set({ error: errorMessage });
          throw error;
        }
      },

      deleteRequirement: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          // 模拟API调用延迟（毫秒）
          const DELETE_API_DELAY_MS = 500;
          await new Promise(resolve => setTimeout(resolve, DELETE_API_DELAY_MS));
          
          set(state => ({
            requirements: state.requirements.filter(req => req.id !== id),
            loading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '删除失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    });

// 根据配置决定是否启用持久化
export const useRequirementsStore = enablePersistence 
  ? create<RequirementsStore>()(
      persist(storeConfig, {
        name: 'requirements-store',
        version: 4,
        partialize: (state) => ({ requirements: state.requirements }),
        migrate: (persistedState: any, version: number) => {
          if (version < 4) {
            console.log('Migrating to version 4, using fresh data with 22 requirements');
            return {
              requirements: initialRequirements,
              loading: false,
              error: null
            };
          }
          return persistedState;
        },
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error('Error rehydrating store:', error);
            } else if (state) {
              console.log('Store rehydrated with', state.requirements.length, 'requirements');
            }
          };
        }
      })
    )
  : create<RequirementsStore>()(storeConfig); 