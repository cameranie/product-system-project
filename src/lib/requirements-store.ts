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
    }
  },
  {
    id: '#3',
    title: '数据导出功能',
    type: '新功能',
    status: '开发中',
    priority: undefined,
    creator: mockUsers[2],
    project: mockProjects[2],
    description: '支持用户导出各种格式的数据，包括Excel、CSV、PDF等格式。',
    tags: ['导出', '数据', '功能'],
               createdAt: '2024-01-10 16:45',
           updatedAt: '2024-01-22 11:20',
    platforms: ['Web端', 'PC端', '移动端'],
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

export const useRequirementsStore = create<RequirementsStore>()(
  persist(
    (set, get) => ({
      requirements: initialRequirements,
      loading: false,
      error: null,

      getRequirements: () => {
        return get().requirements;
      },

      getRequirementById: (id: string) => {
        return get().requirements.find(req => req.id === id);
      },

      createRequirement: async (requirementData) => {
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

          set(state => ({
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

      updateRequirement: async (id: string, updates) => {
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
    }),
    {
      name: 'requirements-store',
      version: 2, // 增加版本号，强制使用新数据
      partialize: (state) => ({ requirements: state.requirements }),
      migrate: (persistedState: any, version: number) => {
        // 如果是旧版本，返回初始数据
        if (version < 2) {
          return {
            requirements: initialRequirements,
            loading: false,
            error: null
          };
        }
        return persistedState;
      }
    }
  )
); 