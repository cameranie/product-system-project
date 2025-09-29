import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitBranch,
  Users,
  Calendar,
  User,
  FileText,
  ArrowLeft,
  Save,
  Send,
  Tag,
  Paperclip,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Target,
  FileBarChart,
  Palette,
  Code,
  TestTube,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  PlayCircle,
  PauseCircle,
  Settings,
  EyeOff,
  Upload,
  GripVertical,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface ReviewStatus {
  status: '未开始' | '进行中' | '已完成' | '已暂停' | '有问题';
  reviewer?: User;
  reviewDate?: string;
}

interface SubTask {
  id: string;
  name: string;
  type: 'PRD' | '原型图' | '设计图' | '开发' | '测试' | '验收';
  status: '未开始' | '进行中' | '已完成' | '已暂停' | '有问题';
  assignee: User;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface VersionRequirement {
  id: string;
  title: string;
  version: string;
  scheduledVersion?: string; // 预排期版本号
  status: '规划中' | '开发中' | '测试中' | '已完成' | '已发布' | '已暂停';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  productManager: User; // 产品经理
  project: Project;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subTasks: SubTask[];
  isOpen: boolean;
  // 各阶段评审状态
  scheduleReviewLevel1: ReviewStatus; // 排期评审状态（一级）
  scheduleReviewLevel2: ReviewStatus; // 排期评审状态（二级）
  prdReviewStatus: ReviewStatus; // PRD评审状态
  prototypeReviewStatus: ReviewStatus; // 原型图评审状态
  designReviewStatus: ReviewStatus; // 设计图评审状态
  developmentStatus: ReviewStatus; // 开发状态
  testStatus: ReviewStatus; // 测试状态
  acceptanceStatus: ReviewStatus; // 验收状态
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' }
];

const mockProjects: Project[] = [
  { id: '1', name: '用户中心', color: 'bg-blue-500' },
  { id: '2', name: '支付系统', color: 'bg-green-500' },
  { id: '3', name: '数据分析', color: 'bg-purple-500' },
  { id: '4', name: '移动端应用', color: 'bg-orange-500' }
];

const statusConfig = {
  '规划中': { label: '规划中', variant: 'secondary' as const, icon: Target, color: 'text-gray-500' },
  '开发中': { label: '开发中', variant: 'default' as const, icon: Code, color: 'text-blue-500' },
  '测试中': { label: '测试中', variant: 'outline' as const, icon: TestTube, color: 'text-orange-500' },
  '已完成': { label: '已完成', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-500' },
  '已发布': { label: '已发布', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-600' },
  '已暂停': { label: '已暂停', variant: 'destructive' as const, icon: PauseCircle, color: 'text-red-500' }
};

const subTaskStatusConfig = {
  '未开始': { label: '未开始', variant: 'secondary' as const, color: 'text-gray-500' },
  '进行中': { label: '进行中', variant: 'default' as const, color: 'text-blue-500' },
  '已完成': { label: '已完成', variant: 'outline' as const, color: 'text-green-500' },
  '已暂停': { label: '已暂停', variant: 'destructive' as const, color: 'text-red-500' },
  '有问题': { label: '有问题', variant: 'destructive' as const, color: 'text-red-600' }
};

const subTaskTypeConfig = {
  'PRD': { label: 'PRD', icon: FileBarChart, color: 'text-blue-500' },
  '原型图': { label: '原型图', icon: Palette, color: 'text-orange-500' },
  '设计图': { label: '设计图', icon: Palette, color: 'text-purple-500' },
  '开发': { label: '开发', icon: Code, color: 'text-green-500' },
  '测试': { label: '测试', icon: TestTube, color: 'text-yellow-500' },
  '验收': { label: '验收', icon: Eye, color: 'text-indigo-500' }
};

const priorityConfig = {
  '低': { label: '低', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  '中': { label: '中', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  '高': { label: '高', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  '紧急': { label: '紧急', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' }
};

const mockVersionRequirements: VersionRequirement[] = [
  // v1.0.0 版本需求
  {
    id: '1',
    title: '用户登录注册功能',
    version: 'v1.0.0',
    scheduledVersion: 'v1.0.0',
    status: '已完成',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '实现基础的用户登录注册功能，支持邮箱和手机号注册',
    startDate: '2023-10-01',
    endDate: '2023-11-15',
    createdAt: '2023-09-20',
    updatedAt: '2023-11-15',
    tags: ['登录', '注册', '基础功能'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-09-22' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-09-25' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-10-02' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2023-10-05' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2023-10-08' },
    developmentStatus: { status: '已完成' },
    testStatus: { status: '已完成', reviewer: mockUsers[6] },
    acceptanceStatus: { status: '已完成', reviewer: mockUsers[5] },
    subTasks: [
      {
        id: 's1-1',
        name: '登录注册PRD文档',
        type: 'PRD',
        status: '已完成',
        assignee: mockUsers[5],
        estimatedHours: 12,
        actualHours: 14,
        progress: 100,
        startDate: '2023-10-01',
        endDate: '2023-10-03',
        createdAt: '2023-10-01',
        updatedAt: '2023-10-03'
      },
      {
        id: 's1-2',
        name: '登录注册页面原型',
        type: '原型图',
        status: '已完成',
        assignee: mockUsers[7],
        estimatedHours: 16,
        actualHours: 18,
        progress: 100,
        startDate: '2023-10-04',
        endDate: '2023-10-06',
        createdAt: '2023-10-04',
        updatedAt: '2023-10-06'
      }
    ]
  },
  {
    id: '2',
    title: '基础权限管理',
    version: 'v1.0.0',
    scheduledVersion: 'v1.0.0',
    status: '已完成',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '实现基础的用户权限管理，支持角色分配',
    startDate: '2023-11-16',
    endDate: '2023-12-15',
    createdAt: '2023-11-10',
    updatedAt: '2023-12-15',
    tags: ['权限', '角色', '管理'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-11-12' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-11-14' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-11-18' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2023-11-22' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2023-11-25' },
    developmentStatus: { status: '已完成' },
    testStatus: { status: '已完成', reviewer: mockUsers[6] },
    acceptanceStatus: { status: '已完成', reviewer: mockUsers[5] },
    subTasks: []
  },
  // v1.5.0 版本需求
  {
    id: '3',
    title: '支付系统基础功能',
    version: 'v1.5.0',
    scheduledVersion: 'v1.6.0',
    status: '已完成',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[1],
    description: '支付流程基础功能，支持微信、支付宝支付',
    startDate: '2024-01-01',
    endDate: '2024-02-15',
    createdAt: '2023-12-20',
    updatedAt: '2024-02-15',
    tags: ['支付', '微信', '支付宝'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-12-22' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-12-25' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-03' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-01-08' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2024-01-12' },
    developmentStatus: { status: '已完成' },
    testStatus: { status: '已完成', reviewer: mockUsers[6] },
    acceptanceStatus: { status: '已完成', reviewer: mockUsers[5] },
    subTasks: []
  },
  {
    id: '4',
    title: '支付系统优化升级',
    version: 'v1.5.0',
    scheduledVersion: 'v1.6.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[1],
    description: '支付流程优化，支持更多支付方式，提升支付成功率',
    startDate: '2024-02-16',
    endDate: '2024-04-01',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    tags: ['支付', '优化', '成功率'],
    isOpen: true,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[4] },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '进行中', reviewer: mockUsers[5] },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: [
      {
        id: 's4-1',
        name: '支付优化需求文档',
        type: 'PRD',
        status: '进行中',
        assignee: mockUsers[5],
        estimatedHours: 12,
        actualHours: 8,
        progress: 70,
        startDate: '2024-02-16',
        endDate: '2024-02-20',
        createdAt: '2024-02-16',
        updatedAt: '2024-02-18'
      }
    ]
  },
  // v2.0.0 版本需求
  {
    id: '5',
    title: '用户中心2.0版本',
    version: 'v2.0.0',
    scheduledVersion: 'v2.1.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '用户中心2.0版本的核心功能升级，包括用户资料完善、安全设置增强、第三方账号绑定等功能',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-16',
    tags: ['用户体验', '安全', '核心功能'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-12' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-14' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-18' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-01-25' },
    designReviewStatus: { status: '进行中', reviewer: mockUsers[2], reviewDate: undefined },
    developmentStatus: { status: '进行中' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: [
      {
        id: 's1-1',
        name: '用户中心PRD文档',
        type: 'PRD',
        status: '已完成',
        assignee: mockUsers[5],
        estimatedHours: 16,
        actualHours: 18,
        progress: 100,
        startDate: '2024-01-15',
        endDate: '2024-01-18',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-18'
      },
      {
        id: 's1-2',
        name: '���户界面原型设计',
        type: '原型图',
        status: '已完成',
        assignee: mockUsers[7],
        estimatedHours: 24,
        actualHours: 26,
        progress: 100,
        startDate: '2024-01-19',
        endDate: '2024-01-24',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-24'
      },
      {
        id: 's1-3',
        name: 'UI设计稿制作',
        type: '设计图',
        status: '进行中',
        assignee: mockUsers[2],
        estimatedHours: 32,
        actualHours: 28,
        progress: 85,
        startDate: '2024-01-25',
        endDate: '2024-02-05',
        createdAt: '2024-01-25',
        updatedAt: '2024-02-03'
      },
      {
        id: 's1-4',
        name: '前端开发',
        type: '开发',
        status: '进行中',
        assignee: mockUsers[0],
        estimatedHours: 80,
        actualHours: 45,
        progress: 60,
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
      },
      {
        id: 's1-5',
        name: '后端开发',
        type: '开发',
        status: '进行中',
        assignee: mockUsers[1],
        estimatedHours: 64,
        actualHours: 38,
        progress: 65,
        startDate: '2024-02-01',
        endDate: '2024-02-25',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15'
      },
      {
        id: 's1-6',
        name: '功能测试',
        type: '测试',
        status: '未开始',
        assignee: mockUsers[6],
        estimatedHours: 40,
        actualHours: 0,
        progress: 0,
        startDate: '2024-02-26',
        endDate: '2024-03-10',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 's1-7',
        name: '产品验收',
        type: '验收',
        status: '未开始',
        assignee: mockUsers[5],
        estimatedHours: 16,
        actualHours: 0,
        progress: 0,
        startDate: '2024-03-11',
        endDate: '2024-03-15',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      }
    ]
  },
  {
    id: '2',
    title: '支付系统优化',
    version: 'v1.5.0',
    scheduledVersion: 'v1.6.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[1],
    description: '支付流程优化，支持更多支付方式，提升支付成功率',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    tags: ['支付', '优化'],
    isOpen: false,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[4] },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '进行中', reviewer: mockUsers[5] },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: [
      {
        id: 's2-1',
        name: '支付优化需求文档',
        type: 'PRD',
        status: '进行中',
        assignee: mockUsers[5],
        estimatedHours: 12,
        actualHours: 8,
        progress: 70,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-03'
      }
    ]
  },
  {
    id: '6',
    title: '用户个人资料增强',
    version: 'v2.0.0',
    scheduledVersion: 'v2.1.0',
    status: '开发中',
    priority: '中',
    assignee: mockUsers[2],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '用户个人资料页面增强，支持头像上传、个性化设置等',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    createdAt: '2024-01-25',
    updatedAt: '2024-02-15',
    tags: ['个人资料', '头像', '个性化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-27' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-29' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-02-02' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-02-08' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2024-02-12' },
    developmentStatus: { status: '进行中' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  // v2.5.0 版本需求
  {
    id: '7',
    title: '数据分析仪表板',
    version: 'v2.5.0',
    scheduledVersion: 'v2.5.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[3],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[2],
    description: '用户行为数据分析仪表板，提供详细的数据报表和可视化图表',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
    tags: ['数据分析', '仪表板', '可视化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '8',
    title: '高级报表功能',
    version: 'v2.5.0',
    scheduledVersion: 'v2.5.0',
    status: '规划中',
    priority: '低',
    assignee: mockUsers[4],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[2],
    description: '高级报表生成功能，支持自定义报表模板和定时发送',
    startDate: '2024-05-01',
    endDate: '2024-07-15',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    tags: ['报表', '自定义', '定时发送'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  // v3.0.0 版本需求
  {
    id: '9',
    title: '移动端应用全新设计',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '测试中',
    priority: '紧急',
    assignee: mockUsers[2],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[3],
    description: '移动端应用全新UI设计，提升用户体验，支持更多设备型号',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-15',
    tags: ['移动端', '全新设计', 'UX'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-22' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-25' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-02-02' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-02-15' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2024-02-28' },
    developmentStatus: { status: '已完成' },
    testStatus: { status: '进行中', reviewer: mockUsers[6] },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '10',
    title: '移动端性能优化',
    version: 'v3.0.0',
    scheduledVersion: 'v3.0.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[3],
    description: '移动端应用性能深度优化，加载速度提升50%，内存占用降低30%',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-10',
    tags: ['移动端', '性能优化', '加载速度'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-02-22' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-02-25' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-02' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-03-05' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2024-03-08' },
    developmentStatus: { status: '进行中' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  // 只有预排期版本的需求（排期评审未完成）
  {
    id: '11',
    title: '智能推荐系统',
    version: '待定',
    scheduledVersion: 'v4.0.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[3],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[2],
    description: '基于用户行为的智能推荐系统，提升用户体验和产品粘性',
    startDate: '2024-05-01',
    endDate: '2024-08-30',
    createdAt: '2024-04-10',
    updatedAt: '2024-04-10',
    tags: ['智能推荐', 'AI', '用户体验'],
    isOpen: true,
    scheduleReviewLevel1: { status: '进行中', reviewer: mockUsers[4] },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '12',
    title: '社交分享功能',
    version: '待定',
    scheduledVersion: 'v3.5.0',
    status: '规划中',
    priority: '低',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '用户可以将内容分享到各种社交平台，增加产品传播力',
    startDate: '2024-06-01',
    endDate: '2024-07-15',
    createdAt: '2024-04-15',
    updatedAt: '2024-04-15',
    tags: ['社交', '分享', '传播'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '13',
    title: '多语言国际化支持',
    version: '未确定',
    scheduledVersion: 'v4.5.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '支持多语言切换，为产品国际化做准备，初期支持英文、日文、韩文',
    startDate: '2024-08-01',
    endDate: '2024-10-30',
    createdAt: '2024-04-20',
    updatedAt: '2024-04-20',
    tags: ['国际化', '多语言', 'i18n'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '14',
    title: '深色主题支持',
    version: 'v3.2.0',
    scheduledVersion: 'v3.2.0',
    status: '开发中',
    priority: '低',
    assignee: mockUsers[2],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '为应用添加深色主题模式，提升夜间使用体验',
    startDate: '2024-04-01',
    endDate: '2024-05-15',
    createdAt: '2024-03-25',
    updatedAt: '2024-04-12',
    tags: ['主题', '深色模式', '用户体验'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-27' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-29' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-04-02' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-04-06' },
    designReviewStatus: { status: '进行中', reviewer: mockUsers[2] },
    developmentStatus: { status: '进行中' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: [
      {
        id: 's14-1',
        name: '深色主题设计规范',
        type: 'PRD',
        status: '已完成',
        assignee: mockUsers[5],
        estimatedHours: 8,
        actualHours: 10,
        progress: 100,
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        createdAt: '2024-04-01',
        updatedAt: '2024-04-03'
      },
      {
        id: 's14-2',
        name: '深色主题UI设计',
        type: '设计图',
        status: '进行中',
        assignee: mockUsers[2],
        estimatedHours: 24,
        actualHours: 18,
        progress: 75,
        startDate: '2024-04-04',
        endDate: '2024-04-12',
        createdAt: '2024-04-04',
        updatedAt: '2024-04-11'
      }
    ]
  },
  {
    id: '15',
    title: '高级数据导出功能',
    version: 'TBD',
    scheduledVersion: 'v5.0.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[3],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[2],
    description: '支持多种格式的数据导出，包括Excel、PDF、CSV等，满足企业用户需求',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    createdAt: '2024-04-25',
    updatedAt: '2024-04-25',
    tags: ['数据导出', '企业需求', '报表'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-04-26' },
    scheduleReviewLevel2: { status: '进行中', reviewer: mockUsers[3] },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '16',
    title: '实时消息推送',
    version: '待定',
    scheduledVersion: 'v3.8.0',
    status: '已暂停',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '实时消息推送系统，支持站内信、邮件、短信等多种推送方式',
    startDate: '2024-03-15',
    endDate: '2024-05-30',
    createdAt: '2024-03-10',
    updatedAt: '2024-04-15',
    tags: ['消息推送', '实时通信', '多渠道'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-12' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-03-14' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-03-18' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-03-25' },
    designReviewStatus: { status: '已暂停', reviewer: mockUsers[2] },
    developmentStatus: { status: '已暂停' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: [
      {
        id: 's16-1',
        name: '消息推送PRD文档',
        type: 'PRD',
        status: '已完成',
        assignee: mockUsers[5],
        estimatedHours: 16,
        actualHours: 18,
        progress: 100,
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        createdAt: '2024-03-15',
        updatedAt: '2024-03-20'
      },
      {
        id: 's16-2',
        name: '推送系统原型设计',
        type: '原型图',
        status: '已完成',
        assignee: mockUsers[7],
        estimatedHours: 20,
        actualHours: 22,
        progress: 100,
        startDate: '2024-03-21',
        endDate: '2024-03-28',
        createdAt: '2024-03-21',
        updatedAt: '2024-03-28'
      },
      {
        id: 's16-3',
        name: '推送界面设计',
        type: '设计图',
        status: '已暂停',
        assignee: mockUsers[2],
        estimatedHours: 24,
        actualHours: 12,
        progress: 50,
        startDate: '2024-03-29',
        endDate: '2024-04-10',
        createdAt: '2024-03-29',
        updatedAt: '2024-04-05'
      }
    ]
  },
  {
    id: '17',
    title: '音视频通话功能',
    version: '规划中',
    scheduledVersion: 'v6.0.0',
    status: '规划中',
    priority: '紧急',
    assignee: mockUsers[4],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '集成音视频通话功能，支持一对一和群组通话，提升用户沟通体验',
    startDate: '2024-12-01',
    endDate: '2025-03-31',
    createdAt: '2024-04-30',
    updatedAt: '2024-04-30',
    tags: ['音视频', '通话', '实时通信'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '18',
    title: '离线模式支持',
    version: '未定义',
    scheduledVersion: 'v4.2.0',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[1],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[3],
    description: '支持离线使用模式，在无网络环境下也能使用基础功能',
    startDate: '2024-07-01',
    endDate: '2024-09-15',
    createdAt: '2024-05-05',
    updatedAt: '2024-05-05',
    tags: ['离线', '移动端', '体验优化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '19',
    title: '企业级权限管理',
    version: '待排期',
    scheduledVersion: 'v5.2.0',
    status: '规划中',
    priority: '高',
    assignee: mockUsers[3],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '企业级精细化权限管理系统，支持部门、角色、资源等多维度权限控制',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    createdAt: '2024-05-10',
    updatedAt: '2024-05-10',
    tags: ['权限管理', '企业级', '安全'],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: []
  },
  {
    id: '20',
    title: '语音输入功能',
    version: '暂未定',
    scheduledVersion: 'v3.6.0',
    status: '开发中',
    priority: '低',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '集成语音识别技术，支持语音输入文字，提升输入效率',
    startDate: '2024-05-01',
    endDate: '2024-06-30',
    createdAt: '2024-04-28',
    updatedAt: '2024-05-12',
    tags: ['语音识别', '输入优化', '智能功能'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-04-30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-05-02' },
    prdReviewStatus: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-05-05' },
    prototypeReviewStatus: { status: '已完成', reviewer: mockUsers[5], reviewDate: '2024-05-08' },
    designReviewStatus: { status: '已完成', reviewer: mockUsers[2], reviewDate: '2024-05-10' },
    developmentStatus: { status: '进行中' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' },
    subTasks: [
      {
        id: 's20-1',
        name: '语音输入技术调研',
        type: 'PRD',
        status: '已完成',
        assignee: mockUsers[5],
        estimatedHours: 16,
        actualHours: 20,
        progress: 100,
        startDate: '2024-05-01',
        endDate: '2024-05-06',
        createdAt: '2024-05-01',
        updatedAt: '2024-05-06'
      },
      {
        id: 's20-2',
        name: '语音输入功能开发',
        type: '开发',
        status: '进行中',
        assignee: mockUsers[0],
        estimatedHours: 40,
        actualHours: 28,
        progress: 70,
        startDate: '2024-05-07',
        endDate: '2024-05-25',
        createdAt: '2024-05-07',
        updatedAt: '2024-05-15'
      }
    ]
  }
];

export function VersionRequirementsPage() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'edit' | 'view'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusFilter, setStatusFilter] = useState('开放中'); // 新增状态筛选类型
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('version');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<VersionRequirement | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Partial<VersionRequirement>>({
    title: '',
    version: '',
    scheduledVersion: '',
    status: '规划中',
    priority: '中',
    assignee: mockUsers[0],
    creator: mockUsers[5],
    productManager: mockUsers[5],
    project: mockProjects[0],
    description: '',
    startDate: '',
    endDate: '',
    tags: [],
    subTasks: [],
    isOpen: true,
    scheduleReviewLevel1: { status: '未开始' },
    scheduleReviewLevel2: { status: '未开始' },
    prdReviewStatus: { status: '未开始' },
    prototypeReviewStatus: { status: '未开始' },
    designReviewStatus: { status: '未开始' },
    developmentStatus: { status: '未开始' },
    testStatus: { status: '未开始' },
    acceptanceStatus: { status: '未开始' }
  });
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [editingScheduledVersion, setEditingScheduledVersion] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 版本选项
  const versionOptions = [
    'v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0', 'v1.4.0', 'v1.5.0', 'v1.6.0',
    'v2.0.0', 'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0',
    'v3.0.0', 'v3.1.0', 'v3.2.0', 'v3.3.0', 'v3.4.0', 'v3.5.0', 'v3.6.0', 'v3.7.0', 'v3.8.0',
    'v4.0.0', 'v4.1.0', 'v4.2.0', 'v4.3.0', 'v4.4.0', 'v4.5.0',
    'v5.0.0', 'v5.1.0', 'v5.2.0',
    'v6.0.0', 'v6.1.0'
  ];

  const pendingVersionOptions = [
    '待定', '未确定', 'TBD', '规划中', '待排期', '暂未定', '未定义'
  ];

  // 检查排期评审是否通过
  const isScheduleReviewPassed = (requirement: VersionRequirement) => {
    return requirement.scheduleReviewLevel1.status === '已完成' && 
           requirement.scheduleReviewLevel2.status === '已完成';
  };

  // 获取显示的版本号
  const getDisplayVersion = (requirement: VersionRequirement) => {
    if (isScheduleReviewPassed(requirement)) {
      return requirement.version || '待定';
    } else {
      // 如果排期评审未通过，显示待定状态或空
      return requirement.version && !versionOptions.includes(requirement.version) 
        ? requirement.version 
        : '待定';
    }
  };

  // 更新版本号
  const updateVersion = (requirementId: string, newVersion: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, version: newVersion, updatedAt: new Date().toISOString().split('T')[0] }
          : req
      )
    );
    setEditingVersion(null);
  };

  // 更新预排期版本
  const updateScheduledVersion = (requirementId: string, newScheduledVersion: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, scheduledVersion: newScheduledVersion, updatedAt: new Date().toISOString().split('T')[0] }
          : req
      )
    );
    setEditingScheduledVersion(null);
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingVersion(null);
    setEditingScheduledVersion(null);
  };

  // 筛选和排序逻辑
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 开放状态筛选逻辑
    let matchesStatusFilter = true;
    if (statusFilter === '开放中') {
      matchesStatusFilter = req.isOpen;
    } else if (statusFilter === '已关闭') {
      matchesStatusFilter = !req.isOpen;
    } // 全部则不过滤
    
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesVersion = filterVersion === 'all' || req.version === filterVersion;
    const matchesProject = filterProject === 'all' || req.project.id === filterProject;
    
    return matchesSearch && matchesStatusFilter && matchesStatus && matchesPriority && matchesVersion && matchesProject;
  });

  // 版本号排序辅助函数
  const parseVersion = (version: string) => {
    // 如果是非版本号格式（如"待定"、"未确定"等），返回很小的值排在后面
    if (!version || !version.match(/^v?\d+\.\d+(\.\d+)?$/)) {
      return -1;
    }
    const parts = version.replace(/^v/, '').split('.').map(Number);
    return parts[0] * 10000 + parts[1] * 100 + (parts[2] || 0);
  };

  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        // 先按版本号排序，然后按标题排序
        const versionDiff = parseVersion(b.version) - parseVersion(a.version);
        if (versionDiff !== 0) return versionDiff;
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'version':
        aValue = parseVersion(a.version);
        bValue = parseVersion(b.version);
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'endDate':
        aValue = new Date(a.endDate);
        bValue = new Date(b.endDate);
        break;
      default:
        // 默认按版本号降序排序（新版本在前）
        aValue = parseVersion(a.version);
        bValue = parseVersion(b.version);
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleCreateRequirement = () => {
    setEditingRequirement({
      title: '',
      version: '',
      scheduledVersion: '',
      status: '规划中',
      priority: '中',
      assignee: mockUsers[0],
      creator: mockUsers[5],
      productManager: mockUsers[5],
      project: mockProjects[0],
      description: '',
      startDate: '',
      endDate: '',
      tags: [],
      subTasks: [],
      isOpen: true,
      scheduleReviewLevel1: { status: '未开始' },
      scheduleReviewLevel2: { status: '未开始' },
      prdReviewStatus: { status: '未开始' },
      prototypeReviewStatus: { status: '未开始' },
      designReviewStatus: { status: '未开始' },
      developmentStatus: { status: '未开始' },
      testStatus: { status: '未开始' },
      acceptanceStatus: { status: '未开始' }
    });
    setCurrentView('edit');
  };

  const handleViewRequirement = (requirement: VersionRequirement) => {
    setSelectedRequirement(requirement);
    setCurrentView('view');
  };

  const handleEditRequirement = (requirement: VersionRequirement) => {
    setEditingRequirement(requirement);
    setCurrentView('edit');
  };

  const handleSaveRequirement = () => {
    if (editingRequirement.id) {
      // 更新现有需求
      setRequirements(requirements.map(r => r.id === editingRequirement.id ? { 
        ...editingRequirement as VersionRequirement, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : r));
    } else {
      // 创建新需求
      const newRequirement: VersionRequirement = {
        ...editingRequirement as VersionRequirement,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        subTasks: []
      };
      setRequirements([newRequirement, ...requirements]);
    }
    setCurrentView('list');
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const getOverallProgress = (subTasks: SubTask[]) => {
    if (subTasks.length === 0) return 0;
    const totalProgress = subTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / subTasks.length);
  };

  const renderReviewStatus = (reviewStatus: ReviewStatus, isMultiLevel = false) => {
    const config = {
      '未开始': { variant: 'secondary' as const, color: 'text-gray-500' },
      '进行中': { variant: 'default' as const, color: 'text-blue-500' },
      '已完成': { variant: 'outline' as const, color: 'text-green-500' },
      '已暂停': { variant: 'destructive' as const, color: 'text-red-500' },
      '有问题': { variant: 'destructive' as const, color: 'text-red-600' }
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={config[reviewStatus.status].variant}
              className={`${config[reviewStatus.status].color} text-xs`}
            >
              {reviewStatus.status}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div>状态: {reviewStatus.status}</div>
              {reviewStatus.reviewer && (
                <div>评审人: {reviewStatus.reviewer.name}</div>
              )}
              {reviewStatus.reviewDate && (
                <div>评审时间: {reviewStatus.reviewDate}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderScheduleReview = (level1: ReviewStatus, level2: ReviewStatus) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">一级:</span>
          {renderReviewStatus(level1)}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">二级:</span>
          {renderReviewStatus(level2)}
        </div>
      </div>
    );
  };

  const addSubTask = (requirementId: string, type: SubTask['type']) => {
    const newSubTask: SubTask = {
      id: `st-${Date.now()}`,
      name: `新${subTaskTypeConfig[type].label}任务`,
      type,
      status: '未开始',
      assignee: mockUsers[0],
      estimatedHours: 8,
      actualHours: 0,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, subTasks: [...req.subTasks, newSubTask] }
          : req
      )
    );
  };

  const deleteSubTask = (requirementId: string, subTaskId: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === requirementId 
          ? { ...req, subTasks: req.subTasks.filter(task => task.id !== subTaskId) }
          : req
      )
    );
  };

  const toggleColumnVisibility = (column: string) => {
    setHiddenColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const availableColumns = [
    { key: 'version', label: '版本号' },
    { key: 'scheduledVersion', label: '预排期版本' },
    { key: 'project', label: '所属项目' },
    { key: 'priority', label: '优先级' },
    { key: 'productManager', label: '产品经理' },
    { key: 'scheduleReview', label: '排期评审' },
    { key: 'prdReview', label: 'PRD评审' },
    { key: 'prototypeReview', label: '原型图评审' },
    { key: 'designReview', label: '设计图评审' },
    { key: 'development', label: '开发状态' },
    { key: 'test', label: '测试状态' },
    { key: 'acceptance', label: '验收状态' },
    { key: 'progress', label: '总进度' },
    { key: 'endDate', label: '截止时间' }
  ];

  if (currentView === 'edit') {
    return <RequirementEditor 
      requirement={editingRequirement}
      setRequirement={setEditingRequirement}
      onBack={() => setCurrentView('list')}
      onSave={handleSaveRequirement}
      fileInputRef={fileInputRef}
    />;
  }

  if (currentView === 'view' && selectedRequirement) {
    return <RequirementDetailView
      requirement={selectedRequirement}
      onBack={() => setCurrentView('list')}
      onEdit={() => handleEditRequirement(selectedRequirement)}
      requirements={requirements}
      setRequirements={setRequirements}
    />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">版本需求管理</h1>
          <p className="text-muted-foreground mt-1">按版本管理需求，跟踪各阶段子任务进度</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 开放状态筛选 */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={statusFilter === '开放中' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('开放中')}
              className="h-8"
            >
              开放中
            </Button>
            <Button
              variant={statusFilter === '已关闭' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('已关闭')}
              className="h-8"
            >
              已关闭
            </Button>
            <Button
              variant={statusFilter === '全部' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('全部')}
              className="h-8"
            >
              全部
            </Button>
          </div>
          <Button onClick={handleCreateRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            新建版本需求
          </Button>
        </div>
      </div>

      {/* 筛选和搜索栏 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 搜索 */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索版本、标题、描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>

            {/* 筛选器 */}
            <div className="flex items-center gap-4">
              <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    设置筛选条件
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>筛选条件设置</DialogTitle>
                    <DialogDescription>
                      设置版本需求列表的筛选条件，只显示符合条件的需求
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">状态</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有状态</SelectItem>
                            <SelectItem value="规划中">规划中</SelectItem>
                            <SelectItem value="开发中">开发中</SelectItem>
                            <SelectItem value="测试中">测试中</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                            <SelectItem value="已发布">已发布</SelectItem>
                            <SelectItem value="已暂停">已暂停</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">优先级</label>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有优先级</SelectItem>
                            <SelectItem value="紧急">紧急</SelectItem>
                            <SelectItem value="高">高</SelectItem>
                            <SelectItem value="中">中</SelectItem>
                            <SelectItem value="低">低</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">项目</label>
                        <Select value={filterProject} onValueChange={setFilterProject}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有项目</SelectItem>
                            {mockProjects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                                  {project.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterProject('all');
                    }}>
                      重置
                    </Button>
                    <Button onClick={() => setShowFilterDialog(false)}>
                      确定
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 排序 */}
              <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    设置排序条件
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>排序条件设置</DialogTitle>
                    <DialogDescription>
                      设置版本需求列表的排序方式和排序方向
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">排序字段</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="version">版本号</SelectItem>
                          <SelectItem value="title">标题</SelectItem>
                          <SelectItem value="endDate">截止时间</SelectItem>
                          <SelectItem value="createdAt">创建时间</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">排序方向</label>
                      <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">降序 (从大到小)</SelectItem>
                          <SelectItem value="asc">升序 (从小到大)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSortDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={() => setShowSortDialog(false)}>
                      确定
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 隐藏列功能 */}
              <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <EyeOff className="h-4 w-4 mr-2" />
                    隐藏列
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>设置显示列</DialogTitle>
                    <DialogDescription>
                      选择要在版本需求列表中显示的列，隐藏的列不会显示在表格中
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-3">
                      {availableColumns.map(column => (
                        <div key={column.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.key}
                            checked={!hiddenColumns.includes(column.key)}
                            onCheckedChange={() => toggleColumnVisibility(column.key)}
                          />
                          <Label htmlFor={column.key} className="text-sm font-normal">
                            {column.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setHiddenColumns([])}>
                      显示全部
                    </Button>
                    <Button onClick={() => setShowColumnDialog(false)}>
                      确定
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Separator orientation="vertical" className="h-6" />

              {/* 导出 */}
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 版本需求列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1400px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="min-w-[200px]">版本需求</TableHead>
                  {!hiddenColumns.includes('version') && (
                    <TableHead className="w-24">版本号</TableHead>
                  )}
                  {!hiddenColumns.includes('scheduledVersion') && (
                    <TableHead className="w-24">预排期版本</TableHead>
                  )}
                  {!hiddenColumns.includes('project') && (
                    <TableHead className="w-24">项目</TableHead>
                  )}
                  {!hiddenColumns.includes('priority') && (
                    <TableHead className="w-20">优先级</TableHead>
                  )}
                  {!hiddenColumns.includes('productManager') && (
                    <TableHead className="w-24">产品经理</TableHead>
                  )}
                  {!hiddenColumns.includes('scheduleReview') && (
                    <TableHead className="w-28">排期评审</TableHead>
                  )}
                  {!hiddenColumns.includes('prdReview') && (
                    <TableHead className="w-24">PRD评审</TableHead>
                  )}
                  {!hiddenColumns.includes('prototypeReview') && (
                    <TableHead className="w-28">原型图评审</TableHead>
                  )}
                  {!hiddenColumns.includes('designReview') && (
                    <TableHead className="w-28">设计图评审</TableHead>
                  )}
                  {!hiddenColumns.includes('development') && (
                    <TableHead className="w-24">开发状态</TableHead>
                  )}
                  {!hiddenColumns.includes('test') && (
                    <TableHead className="w-24">测试状态</TableHead>
                  )}
                  {!hiddenColumns.includes('acceptance') && (
                    <TableHead className="w-24">验收状态</TableHead>
                  )}
                  {!hiddenColumns.includes('progress') && (
                    <TableHead className="w-24">总进度</TableHead>
                  )}
                  {!hiddenColumns.includes('endDate') && (
                    <TableHead className="w-24">截止时间</TableHead>
                  )}
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((requirement, index) => {
                  // 检查是否是新版本组的开始
                  const isNewVersionGroup = index === 0 || requirement.version !== sortedRequirements[index - 1].version;
                  
                  return (
                    <React.Fragment key={requirement.id}>
                    {/* 版本分组头部 */}
                    {isNewVersionGroup && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={100} className="py-2 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-purple-600" />
                              <span className="font-semibold text-purple-600">{requirement.version}</span>
                            </div>
                            <div className="h-px bg-border flex-1"></div>
                            <span className="text-xs text-muted-foreground">
                              {sortedRequirements.filter(r => r.version === requirement.version).length} 个需求
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="hover:bg-muted/30">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(requirement.id)}
                        >
                          {expandedRows.includes(requirement.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-purple-500" />
                              <p className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewRequirement(requirement)}>
                                {requirement.title}
                              </p>
                            </div>
                            {requirement.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
                                {requirement.description}
                              </p>
                            )}
                            {requirement.tags && requirement.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {requirement.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {requirement.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{requirement.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {!hiddenColumns.includes('version') && (
                        <TableCell>
                          {editingVersion === requirement.id ? (
                            <div className="flex items-center gap-1">
                              <Select 
                                value={requirement.version || 'EMPTY'} 
                                onValueChange={(value) => updateVersion(requirement.id, value === 'EMPTY' ? '' : value)}
                                onOpenChange={(open) => !open && setEditingVersion(null)}
                              >
                                <SelectTrigger className="w-20 h-7">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EMPTY">清空</SelectItem>
                                  {pendingVersionOptions.filter(option => option).map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                  <Separator />
                                  {versionOptions.map(version => (
                                    <SelectItem 
                                      key={version} 
                                      value={version}
                                      disabled={!isScheduleReviewPassed(requirement)}
                                    >
                                      {version}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingVersion(null)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-muted"
                              onClick={() => setEditingVersion(requirement.id)}
                            >
                              {getDisplayVersion(requirement)}
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('scheduledVersion') && (
                        <TableCell>
                          {editingScheduledVersion === requirement.id ? (
                            <div className="flex items-center gap-1">
                              <Select 
                                value={requirement.scheduledVersion || 'EMPTY'} 
                                onValueChange={(value) => updateScheduledVersion(requirement.id, value === 'EMPTY' ? '' : value)}
                                onOpenChange={(open) => !open && setEditingScheduledVersion(null)}
                              >
                                <SelectTrigger className="w-20 h-7">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EMPTY">清空</SelectItem>
                                  {versionOptions.map(version => (
                                    <SelectItem key={version} value={version}>
                                      {version}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingScheduledVersion(null)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            requirement.scheduledVersion ? (
                              <Badge 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setEditingScheduledVersion(requirement.id)}
                              >
                                {requirement.scheduledVersion}
                              </Badge>
                            ) : (
                              <span 
                                className="text-muted-foreground text-xs cursor-pointer hover:text-foreground"
                                onClick={() => setEditingScheduledVersion(requirement.id)}
                              >
                                未设置
                              </span>
                            )
                          )}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('project') && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${requirement.project.color}`}></div>
                            <span className="text-xs">{requirement.project.name}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('priority') && (
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${priorityConfig[requirement.priority].color} ${priorityConfig[requirement.priority].bg} ${priorityConfig[requirement.priority].border} text-xs`}
                          >
                            {priorityConfig[requirement.priority].label}
                          </Badge>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('productManager') && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={requirement.productManager.avatar} />
                              <AvatarFallback className="text-xs">
                                {requirement.productManager.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{requirement.productManager.name}</span>
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('scheduleReview') && (
                        <TableCell>
                          {renderScheduleReview(requirement.scheduleReviewLevel1, requirement.scheduleReviewLevel2)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('prdReview') && (
                        <TableCell>
                          {renderReviewStatus(requirement.prdReviewStatus)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('prototypeReview') && (
                        <TableCell>
                          {renderReviewStatus(requirement.prototypeReviewStatus)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('designReview') && (
                        <TableCell>
                          {renderReviewStatus(requirement.designReviewStatus)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('development') && (
                        <TableCell>
                          {renderReviewStatus(requirement.developmentStatus)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('test') && (
                        <TableCell>
                          {renderReviewStatus(requirement.testStatus)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('acceptance') && (
                        <TableCell>
                          {renderReviewStatus(requirement.acceptanceStatus)}
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('progress') && (
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>总进度</span>
                              <span>{getOverallProgress(requirement.subTasks)}%</span>
                            </div>
                            <Progress value={getOverallProgress(requirement.subTasks)} className="h-1" />
                          </div>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes('endDate') && (
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{requirement.endDate}</span>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewRequirement(requirement)}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditRequirement(requirement)}>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    
                    {/* 展开的子任务行 */}
                    {expandedRows.includes(requirement.id) && (
                      <TableRow>
                        <TableCell colSpan={100} className="p-0">
                          <div className="bg-muted/20 p-6 border-t">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">子任务列表</h4>
                              <div className="flex gap-2">
                                {(['PRD', '原型图', '设计图', '开发', '测试', '验收'] as const).map(type => (
                                  <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSubTask(requirement.id, type)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {subTaskTypeConfig[type].label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {requirement.subTasks.map((subTask) => (
                                <div key={subTask.id} className="flex items-center gap-4 p-3 bg-background rounded border">
                                  <div className="flex items-center gap-2 min-w-[120px]">
                                    {React.createElement(subTaskTypeConfig[subTask.type].icon, {
                                      className: `h-4 w-4 ${subTaskTypeConfig[subTask.type].color}`
                                    })}
                                    <Badge variant="outline" className="text-xs">
                                      {subTaskTypeConfig[subTask.type].label}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{subTask.name}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={subTask.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {subTask.assignee.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{subTask.assignee.name}</span>
                                  </div>
                                  
                                  <Badge 
                                    variant={subTaskStatusConfig[subTask.status].variant}
                                    className="min-w-[60px] justify-center"
                                  >
                                    {subTaskStatusConfig[subTask.status].label}
                                  </Badge>
                                  
                                  <div className="min-w-[100px]">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>进度</span>
                                      <span>{subTask.progress}%</span>
                                    </div>
                                    <Progress value={subTask.progress} className="h-1" />
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground min-w-[80px]">
                                    <div>预估: {subTask.estimatedHours}h</div>
                                    <div>实际: {subTask.actualHours}h</div>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSubTask(requirement.id, subTask.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              
                              {requirement.subTasks.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  <p>暂无子任务</p>
                                  <p className="text-xs mt-1">点击上方按钮添加子任务</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {sortedRequirements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无版本需求数据</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all'
                  ? '请尝试调整筛选条件' 
                  : '点击右上角"新建版本需求"按钮创建第一个版本需求'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>共 {sortedRequirements.length} 个版本需求</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              规划中: {requirements.filter(r => r.status === '规划中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              开发中: {requirements.filter(r => r.status === '开发中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              测试中: {requirements.filter(r => r.status === '测试中').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              已完成: {requirements.filter(r => r.status === '已完成').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 版本需求编辑器组件
function RequirementEditor({ 
  requirement, 
  setRequirement, 
  onBack, 
  onSave,
  fileInputRef 
}: {
  requirement: Partial<VersionRequirement>;
  setRequirement: (requirement: Partial<VersionRequirement>) => void;
  onBack: () => void;
  onSave: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [newTag, setNewTag] = useState('');
  
  const addTag = (tag: string) => {
    if (tag.trim() && !requirement.tags?.includes(tag.trim())) {
      setRequirement({
        ...requirement,
        tags: [...(requirement.tags || []), tag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setRequirement({
      ...requirement,
      tags: requirement.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <h1 className="text-2xl font-semibold">
            {requirement.id ? '编辑版本需求' : '新建版本需求'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>需求标题 *</Label>
              <Input
                value={requirement.title || ''}
                onChange={(e) => setRequirement({ ...requirement, title: e.target.value })}
                placeholder="请输入需求标题"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>版本号 *</Label>
              <Input
                value={requirement.version || ''}
                onChange={(e) => setRequirement({ ...requirement, version: e.target.value })}
                placeholder="例如: v1.0.0"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>预排期版本</Label>
              <Input
                value={requirement.scheduledVersion || ''}
                onChange={(e) => setRequirement({ ...requirement, scheduledVersion: e.target.value })}
                placeholder="例如: v1.1.0"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>所属项目 *</Label>
              <Select 
                value={requirement.project?.id || ''} 
                onValueChange={(value) => {
                  const project = mockProjects.find(p => p.id === value);
                  setRequirement({ ...requirement, project });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>需求描述</Label>
            <Textarea
              value={requirement.description || ''}
              onChange={(e) => setRequirement({ ...requirement, description: e.target.value })}
              placeholder="详细描述需求内容、目标和预期效果..."
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>负责人 *</Label>
              <Select 
                value={requirement.assignee?.id || ''} 
                onValueChange={(value) => {
                  const assignee = mockUsers.find(u => u.id === value);
                  setRequirement({ ...requirement, assignee });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>创建人</Label>
              <Select 
                value={requirement.creator?.id || ''} 
                onValueChange={(value) => {
                  const creator = mockUsers.find(u => u.id === value);
                  setRequirement({ ...requirement, creator });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择创建人" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>状态</Label>
              <Select 
                value={requirement.status || '规划中'} 
                onValueChange={(value: any) => setRequirement({ ...requirement, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="规划中">规划中</SelectItem>
                  <SelectItem value="开发中">开发中</SelectItem>
                  <SelectItem value="测试中">测试中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已发布">已发布</SelectItem>
                  <SelectItem value="已暂停">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>优先级</Label>
              <Select 
                value={requirement.priority || '中'} 
                onValueChange={(value: any) => setRequirement({ ...requirement, priority: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="低">低</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="紧急">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>开始日期</Label>
              <Input
                type="date"
                value={requirement.startDate || ''}
                onChange={(e) => setRequirement({ ...requirement, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>截止日期</Label>
              <Input
                type="date"
                value={requirement.endDate || ''}
                onChange={(e) => setRequirement({ ...requirement, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>标签</Label>
            <div className="mt-1 space-y-2">
              {requirement.tags && requirement.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {requirement.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="添加标签"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(newTag)}
                  disabled={!newTag.trim()}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  添加
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>需求状态</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOpen"
                checked={requirement.isOpen || false}
                onCheckedChange={(checked) => setRequirement({ ...requirement, isOpen: !!checked })}
              />
              <Label htmlFor="isOpen" className="text-sm font-normal">
                开放中（可接受新的子任务和修改）
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 版本需求详情视图组件
function RequirementDetailView({ 
  requirement, 
  onBack, 
  onEdit,
  requirements,
  setRequirements
}: {
  requirement: VersionRequirement;
  onBack: () => void;
  onEdit: () => void;
  requirements: VersionRequirement[];
  setRequirements: (requirements: VersionRequirement[]) => void;
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const getOverallProgress = (subTasks: SubTask[]) => {
    if (subTasks.length === 0) return 0;
    const totalProgress = subTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / subTasks.length);
  };

  const toggleRequirementStatus = () => {
    const updatedRequirements = requirements.map(req => 
      req.id === requirement.id 
        ? { ...req, isOpen: !req.isOpen, updatedAt: new Date().toISOString().split('T')[0] }
        : req
    );
    setRequirements(updatedRequirements);
    onBack();
  };

  // 更新排期评审状态
  const updateScheduleReviewStatus = (level: 'level1' | 'level2', status: ReviewStatus['status'], reviewer?: User) => {
    const field = level === 'level1' ? 'scheduleReviewLevel1' : 'scheduleReviewLevel2';
    const updatedRequirements = requirements.map(req => 
      req.id === requirement.id 
        ? { 
            ...req, 
            [field]: { 
              status, 
              reviewer,
              reviewDate: status === '已完成' ? new Date().toISOString().split('T')[0] : undefined 
            },
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : req
    );
    setRequirements(updatedRequirements);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="font-medium">{requirement.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{requirement.version}</Badge>
              <Badge 
                variant={statusConfig[requirement.status].variant}
                className={statusConfig[requirement.status].color}
              >
                {statusConfig[requirement.status].label}
              </Badge>
              <Badge variant={requirement.isOpen ? "default" : "secondary"}>
                {requirement.isOpen ? "开放中" : "已关闭"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={requirement.isOpen ? "outline" : "default"}
            onClick={toggleRequirementStatus}
          >
            {requirement.isOpen ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                关闭需求
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                重新开启
              </>
            )}
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="flex items-center gap-1 border-b mb-6">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              需求概览
            </Button>
            <Button
              variant={activeTab === 'schedule-review' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('schedule-review')}
            >
              排期评审
            </Button>
            <Button
              variant={activeTab === 'subtasks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('subtasks')}
            >
              子任务管理
            </Button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>需求描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{requirement.description || '暂无详细描述'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>进度概览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>总体进度</span>
                      <span className="font-medium">{getOverallProgress(requirement.subTasks)}%</span>
                    </div>
                    <Progress value={getOverallProgress(requirement.subTasks)} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">子任务总数</span>
                        <p className="font-medium">{requirement.subTasks.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">已完成</span>
                        <p className="font-medium">{requirement.subTasks.filter(task => task.status === '已完成').length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'schedule-review' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>排期评审管理</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    版本需求需要通过两级排期评审后才能确定具体版本号
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 一级评审 */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">一级排期评审</h4>
                      <div className="flex items-center gap-2">
                        {requirement.scheduleReviewLevel1.status === '已完成' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Badge 
                          variant={
                            requirement.scheduleReviewLevel1.status === '已完成' ? 'outline' :
                            requirement.scheduleReviewLevel1.status === '进行中' ? 'default' :
                            requirement.scheduleReviewLevel1.status === '有问题' ? 'destructive' : 'secondary'
                          }
                        >
                          {requirement.scheduleReviewLevel1.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">评审状态</Label>
                        <Select 
                          value={requirement.scheduleReviewLevel1.status} 
                          onValueChange={(status: ReviewStatus['status']) => 
                            updateScheduleReviewStatus('level1', status, requirement.scheduleReviewLevel1.reviewer)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="未开始">未开始</SelectItem>
                            <SelectItem value="进行中">进行中</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                            <SelectItem value="已暂停">已暂停</SelectItem>
                            <SelectItem value="有问题">有问题</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">评审人</Label>
                        <Select 
                          value={requirement.scheduleReviewLevel1.reviewer?.id || ''} 
                          onValueChange={(userId) => {
                            const reviewer = mockUsers.find(u => u.id === userId);
                            updateScheduleReviewStatus('level1', requirement.scheduleReviewLevel1.status, reviewer);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="选择评审人" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  {user.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {requirement.scheduleReviewLevel1.reviewDate && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">
                          评审时间：{requirement.scheduleReviewLevel1.reviewDate}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 二级评审 */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">二级排期评审</h4>
                      <div className="flex items-center gap-2">
                        {requirement.scheduleReviewLevel2.status === '已完成' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Badge 
                          variant={
                            requirement.scheduleReviewLevel2.status === '已完成' ? 'outline' :
                            requirement.scheduleReviewLevel2.status === '进行中' ? 'default' :
                            requirement.scheduleReviewLevel2.status === '有问题' ? 'destructive' : 'secondary'
                          }
                        >
                          {requirement.scheduleReviewLevel2.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">评审状态</Label>
                        <Select 
                          value={requirement.scheduleReviewLevel2.status} 
                          onValueChange={(status: ReviewStatus['status']) => 
                            updateScheduleReviewStatus('level2', status, requirement.scheduleReviewLevel2.reviewer)
                          }
                          disabled={requirement.scheduleReviewLevel1.status !== '已完成'}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="未开始">未开始</SelectItem>
                            <SelectItem value="进行中">进行中</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                            <SelectItem value="已暂停">已暂停</SelectItem>
                            <SelectItem value="有问题">有问题</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">评审人</Label>
                        <Select 
                          value={requirement.scheduleReviewLevel2.reviewer?.id || ''} 
                          onValueChange={(userId) => {
                            const reviewer = mockUsers.find(u => u.id === userId);
                            updateScheduleReviewStatus('level2', requirement.scheduleReviewLevel2.status, reviewer);
                          }}
                          disabled={requirement.scheduleReviewLevel1.status !== '已完成'}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="选择评审人" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  {user.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {requirement.scheduleReviewLevel1.status !== '已完成' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          需要先完成一级排期评审才能进行二级评审
                        </p>
                      </div>
                    )}

                    {requirement.scheduleReviewLevel2.reviewDate && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">
                          评审时间：{requirement.scheduleReviewLevel2.reviewDate}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 评审状态总结 */}
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3">评审状态总结</h4>
                    <div className="space-y-2">
                      {requirement.scheduleReviewLevel1.status === '已完成' && requirement.scheduleReviewLevel2.status === '已完成' ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">排期评审已全部通过，可设置具体版本号</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">排期评审未完成，暂时无法确定具体版本号</span>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        当前版本状态：
                        {requirement.scheduleReviewLevel1.status === '已完成' && requirement.scheduleReviewLevel2.status === '已完成' 
                          ? `已确定版本 ${requirement.version}`
                          : `预排期版本 ${requirement.scheduledVersion || '未设置'}`
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">子任务列表</h3>
                <span className="text-sm text-muted-foreground">
                  {requirement.subTasks.length} 个任务
                </span>
              </div>
              
              <div className="space-y-3">
                {requirement.subTasks.map((subTask) => (
                  <Card key={subTask.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {React.createElement(subTaskTypeConfig[subTask.type].icon, {
                              className: `h-4 w-4 ${subTaskTypeConfig[subTask.type].color}`
                            })}
                            <span className="font-medium">{subTask.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {subTaskTypeConfig[subTask.type].label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">负责人</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={subTask.assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {subTask.assignee.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{subTask.assignee.name}</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">工时</span>
                              <p className="mt-1">
                                实际 {subTask.actualHours}h / 预估 {subTask.estimatedHours}h
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">进度</span>
                              <div className="mt-1">
                                <span>{subTask.progress}%</span>
                                <Progress value={subTask.progress} className="h-1 mt-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Badge 
                          variant={subTaskStatusConfig[subTask.status].variant}
                          className="ml-4"
                        >
                          {subTaskStatusConfig[subTask.status].label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {requirement.subTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>暂无子任务</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">负责人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={requirement.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {requirement.assignee.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{requirement.assignee.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建人</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={requirement.creator.avatar} />
                    <AvatarFallback className="text-xs">
                      {requirement.creator.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{requirement.creator.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">所属项目</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${requirement.project.color}`}></div>
                  <span className="text-sm">{requirement.project.name}</span>
                </div>
              </div>

              {requirement.scheduledVersion && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">预排期版本</span>
                  <Badge variant="outline" className="text-xs">{requirement.scheduledVersion}</Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">开始日期</span>
                <span className="text-sm">{requirement.startDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">截止日期</span>
                <span className="text-sm">{requirement.endDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">创建时间</span>
                <span className="text-sm">{requirement.createdAt}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">更新时间</span>
                <span className="text-sm">{requirement.updatedAt}</span>
              </div>
            </CardContent>
          </Card>

          {requirement.tags && requirement.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 flex-wrap">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}