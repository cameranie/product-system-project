import React, { useState, useRef, useEffect } from 'react';
import { useVersions } from './VersionContext';
import { 
  Search, 
  Filter, 
  BarChart3, 
  FolderOpen, 
  Upload, 
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Flame,
  Zap,
  Bug,
  Lightbulb,
  Settings,
  Users,
  Calendar,
  User,
  FileText,
  ArrowRight,
  ArrowLeft,
  Tag,
  Paperclip,
  Link,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Edit,
  X,
  EyeOff,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Requirement {
  id: string;
  title: string;
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  platform?: string;
  plannedVersion?: string;
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  prototypeId?: string;
  assignee?: User;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '/avatars/lisi.jpg', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '/avatars/wangwu.jpg', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '/avatars/zhaoliu.jpg', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '/avatars/sunqi.jpg', email: 'sunqi@example.com' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 版本列表现在从 VersionContext 获取

// 可选的需求类型
const requirementTypes = [
  '新功能', '优化', 'BUG', '用户反馈', '商务需求'
];

// 可选的优先级
const priorities = [
  '低', '中', '高', '紧急'
];

// 可选的项目
const projects = mockProjects;

// 可选的应用端
const platforms = [
  'Web端', '移动端', '全平台', 'PC端', '小程序'
];

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: '标题' },
  { value: 'type', label: '类型' },
  { value: 'priority', label: '优先级' },
  { value: 'creator', label: '创建人' },
  { value: 'platform', label: '应用端' },
  { value: 'reviewStatus', label: '评审状态' },
  { value: 'plannedVersion', label: '预排期版本' },
  { value: 'createdAt', label: '创建时间' }
];

// 筛选操作符
const filterOperators = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
  { value: 'is_duplicate', label: '重复' }
];

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

// 模拟需求数据
const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: '用户注册流程优化',
    type: '新功能',
    status: '待评审',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。',
    tags: ['用户体验', 'UI优化', '移动端'],
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-20 16:45',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0]
  },
  {
    id: '2',
    title: '支付功能集成',
    type: '新功能',
    status: '开发中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[2],
    description: '集成多种支付方式，包括支付宝、微信支付、银行卡支付等，提供安全可靠的支付体验。',
    tags: ['支付', '功能'],
    createdAt: '2024-01-10 09:15',
    updatedAt: '2024-01-18 11:20',
    platform: '全平台',
    plannedVersion: 'v2.0.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  {
    id: '3',
    title: '数据导出功能',
    type: '用户反馈',
    status: '设计中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[3],
    description: '支持用户导出各种格式的数据报表，包括Excel、PDF、CSV等格式。',
    tags: ['导出', '数据分析'],
    createdAt: '2024-01-12 13:25',
    updatedAt: '2024-01-16 15:10',
    platform: 'Web端',
    plannedVersion: 'v2.2.0',
    isOpen: false,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[2]
  },
  {
    id: '4',
    title: 'K线图实时更新优化',
    type: '优化',
    status: '已完成',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。',
    tags: ['K线', '实时数据', '性能优化'],
    createdAt: '2024-01-20 10:00',
    updatedAt: '2024-01-25 17:30',
    platform: 'Web端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[1],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4]
  },
  {
    id: '5',
    title: '行情推送服务升级',
    type: '优化',
    status: '评审通过',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[1],
    description: '升级行情推送服务架构，支持更高并发量的实时行情数据推送，降低延迟。',
    tags: ['行情', 'WebSocket', '高并发'],
    createdAt: '2024-01-22 08:45',
    updatedAt: '2024-01-26 12:15',
    platform: '全平台',
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[0]
  },
  {
    id: '6',
    title: '交易风控系统优化',
    type: 'BUG',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[4],
    description: '完善交易风控系统，增加异常交易检测算法，提升系统安全性和风险防控能力。',
    tags: ['风控', '安全', '算法'],
    createdAt: '2024-01-18 16:20',
    updatedAt: '2024-01-24 14:55',
    platform: '全平台',
    plannedVersion: 'v2.5.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[0],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[1]
  },
  {
    id: '8',
    title: '用户权限管理优化',
    type: '优化',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '优化用户权限管理系统，支持更细粒度的权限控制，提升系统安全性和管理效率。',
    tags: ['权限', '安全', '管理'],
    createdAt: '2024-01-25 10:15',
    updatedAt: '2024-01-28 09:30',
    platform: 'Web端',
    plannedVersion: '3.2.1',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  {
    id: '9',
    title: '数据备份恢复功能',
    type: '新功能',
    status: '评审中',
    priority: '高',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '增加自动数据备份和恢复功能，确保重要数据的安全性，支持定时备份和手动备份。',
    tags: ['备份', '恢复', '数据安全'],
    createdAt: '2024-01-20 14:45',
    updatedAt: '2024-01-26 16:20',
    platform: '全平台',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[0]
  },
  {
    id: '10',
    title: '实时通知系统',
    type: '用户反馈',
    status: '已关闭',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[2],
    description: '实现实时通知推送功能，支持邮件、短信、应用内通知等多种方式，提升用户体验。',
    tags: ['通知', '推送', '用户体验'],
    createdAt: '2024-01-12 11:00',
    updatedAt: '2024-01-15 13:25',
    platform: '全平台',
    isOpen: false,
    reviewer1: mockUsers[1],
    reviewer1Status: 'rejected',
    reviewStatus: 'rejected',
    assignee: mockUsers[3]
  },
  {
    id: '11',
    title: 'API性能监控',
    type: 'BUG',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[1],
    description: 'API响应时间异常，需要增加性能监控和告警机制，及时发现和解决性能问题。',
    tags: ['性能', '监控', 'API'],
    createdAt: '2024-01-28 15:40',
    updatedAt: '2024-01-29 08:15',
    platform: '全平台',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[3],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[2]
  },
  {
    id: '12',
    title: '数据统计图表优化',
    type: '商务需求',
    status: '评审通过',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '优化现有数据统计图表的展示效果和交互体验。',
    tags: ['图表', '数据', '优化'],
    createdAt: '2024-01-22 11:20',
    updatedAt: '2024-01-30 14:15',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[3]
  },
  {
    id: '13',
    title: 'K线图手势操作优化',
    type: '优化',
    status: '待评审',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化移动端K线图的手势操作体验，支持双指缩放、滑动查看历史数据等操作。',
    tags: ['K线', '手势', '移动端', 'UX'],
    createdAt: '2024-02-01 09:30',
    updatedAt: '2024-02-02 11:45',
    platform: '移动端',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[4]
  },
  {
    id: '14',
    title: '行情推送延迟问题修复',
    type: 'BUG',
    status: '评审中',
    priority: '紧急',
    creator: mockUsers[2],
    project: mockProjects[1],
    description: '修复行情数据推送延迟严重的问题，优化WebSocket连接机制，确保实时性。',
    tags: ['行情', 'WebSocket', '实时数据', '性能'],
    createdAt: '2024-02-03 16:20',
    updatedAt: '2024-02-04 14:30',
    platform: '全平台',
    plannedVersion: 'v2.2.0',
    isOpen: true,
    reviewer1: mockUsers[3],
    reviewer2: mockUsers[0],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[1]
  },
  {
    id: '15',
    title: '聊天室表情包功能',
    type: '新功能',
    status: '设计中',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[2],
    description: '在聊天室中增加表情包功能，支持自定义表情包上传和使用，提升用户互动体验。',
    tags: ['聊天室', '表情包', '用户体验', '社交'],
    createdAt: '2024-01-30 13:45',
    updatedAt: '2024-02-01 10:20',
    platform: '全平台',
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[0]
  },
  {
    id: '16',
    title: '系统日志存储优化',
    type: '优化',
    status: '开发中',
    priority: '中',
    creator: mockUsers[1],
    project: mockProjects[3],
    description: '优化系统日志存储机制，实现日志自动轮转和压缩，减少磁盘空间占用。',
    tags: ['日志', '存储', '运维', '性能'],
    createdAt: '2024-01-26 08:15',
    updatedAt: '2024-02-02 15:40',
    platform: 'PC端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[2]
  },
  {
    id: '17',
    title: '交易风控规则配置',
    type: '商务需求',
    status: '待评审',
    priority: '高',
    creator: mockUsers[3],
    project: mockProjects[4],
    description: '需要新增交易风控规则的动态配置功能，支持业务人员自主配置风控参数。',
    tags: ['交易', '风控', '配置', '业务'],
    createdAt: '2024-02-02 14:20',
    updatedAt: '2024-02-03 09:15',
    platform: 'Web端',
    isOpen: true,
    reviewer1: mockUsers[0],
    reviewer1Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[4]
  },
  {
    id: '18',
    title: '移动端崩溃问题修复',
    type: 'BUG',
    status: '已完成',
    priority: '紧急',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '修复移动端在特定机型上的崩溃问题，主要涉及内存管理和兼容性优化。',
    tags: ['移动端', '崩溃', '兼容性', '稳定性'],
    createdAt: '2024-01-18 10:30',
    updatedAt: '2024-01-25 16:45',
    platform: '移动端',
    isOpen: false,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[1],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[3]
  },
  {
    id: '19',
    title: '多语言国际化支持',
    type: '新功能',
    status: '评审中',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[3],
    description: '增加多语言国际化支持，首期支持英文、繁体中文，为海外市场拓展做准备。',
    tags: ['国际化', '多语言', '本地化'],
    createdAt: '2024-01-29 11:40',
    updatedAt: '2024-02-01 14:20',
    platform: '全平台',
    plannedVersion: 'v2.5.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[4],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0]
  },
  {
    id: '20',
    title: '客户反馈收集优化',
    type: '用户反馈',
    status: '评审通过',
    priority: '低',
    creator: mockUsers[4],
    project: mockProjects[2],
    description: '优化客户反馈收集流程，增加反馈分类和优先级标记，提升问题处理效率。',
    tags: ['反馈', '客服', '流程优化'],
    createdAt: '2024-01-24 16:10',
    updatedAt: '2024-01-31 10:35',
    platform: 'Web端',
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: mockUsers[3],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },

  {
    id: '22',
    title: '交易订单撤销功能',
    type: '商务需求',
    status: '设计中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[4],
    description: '增加交易订单撤销功能，支持部分撤销和全部撤销，需要考虑风控和合规要求。',
    tags: ['交易', '订单', '撤销', '风控'],
    createdAt: '2024-02-01 14:15',
    updatedAt: '2024-02-03 11:30',
    platform: '全平台',
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: mockUsers[4],
    reviewer2: mockUsers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    reviewStatus: 'second_review',
    assignee: mockUsers[3]
  },
  {
    id: '23',
    title: '用户登录安全增强',
    type: '新功能',
    status: '已关闭',
    priority: '高',
    creator: mockUsers[3],
    project: mockProjects[3],
    description: '增强用户登录安全性，增加二次验证、设备绑定等安全措施。',
    tags: ['安全', '登录', '二次验证', '设备绑定'],
    createdAt: '2024-01-15 12:20',
    updatedAt: '2024-01-20 17:45',
    platform: '全平台',
    isOpen: false,
    reviewer1: mockUsers[1],
    reviewer1Status: 'rejected',
    reviewStatus: 'rejected',
    assignee: mockUsers[2]
  },
  {
    id: '7',
    title: '移动端消息推送功能',
    type: '新功能',
    status: '设计中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[3],
    description: '为移动端用户提供消息推送功能，包括交易提醒、行情变动通知、系统公告等。需要考虑以下几个方面：\n\n1. 支持个性化推送设置\n2. 推送消息分类管理\n3. 消息历史记录查看\n4. 推送时间段设置\n5. 重要消息优先级处理\n\n预期目标：\n- 提升用户活跃度\n- 及时传达重要信息\n- 增强用户粘性',
    tags: ['移动端', '推送', '消息'],
    createdAt: '2024-01-28 10:30',
    updatedAt: '2024-01-30 14:20',
    platform: '移动端',
    plannedVersion: 'v2.6.0',
    isOpen: true,
    reviewer1: mockUsers[1],
    reviewer2: mockUsers[3],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'pending',
    assignee: mockUsers[2]
  }
];

interface RequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
  context?: any;
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

export function RequirementsPageWithInlineEdit({ onNavigate, context }: RequirementsPageProps = {}) {
  // 获取版本号数据
  const { getAllVersionNumbers } = useVersions();
  const availableVersions = getAllVersionNumbers();
  
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterOpenStatus, setFilterOpenStatus] = useState('open');
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);

  // 处理类型修改
  const handleTypeChange = (requirementId: string, type: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, type, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理优先级修改
  const handlePriorityChange = (requirementId: string, priority: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, priority, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理预排期版本修改
  const handleVersionChange = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, plannedVersion: version === 'unassigned' ? undefined : version, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理应用端修改
  const handlePlatformChange = (requirementId: string, platform: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, platform, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 添加自定义筛选条件
  const addCustomFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: 'title',
      operator: 'contains',
      value: ''
    };
    setCustomFilters([...customFilters, newFilter]);
  };

  // 删除自定义筛选条件
  const removeCustomFilter = (filterId: string) => {
    setCustomFilters(customFilters.filter(f => f.id !== filterId));
  };

  // 更新自定义筛选条件
  const updateCustomFilter = (filterId: string, field: string, value: string) => {
    setCustomFilters(customFilters.map(f => 
      f.id === filterId ? { ...f, [field]: value } : f
    ));
  };

  // 清除所有筛选条件
  const clearAllFilters = () => {
    setFilterType('all');
    setFilterPriority('all');
    setCustomFilters([]);
  };

  // 应用自定义筛选逻辑
  const applyCustomFilters = (requirement: Requirement, filters: FilterCondition[]) => {
    return filters.every(filter => {
      if (!filter.column || !filter.operator) return true;
      
      let fieldValue = '';
      switch (filter.column) {
        case 'title':
          fieldValue = requirement.title;
          break;
        case 'type':
          fieldValue = requirement.type;
          break;
        case 'priority':
          fieldValue = requirement.priority;
          break;
        case 'creator':
          fieldValue = requirement.creator.name;
          break;
        case 'platform':
          fieldValue = requirement.platform || '';
          break;
        case 'reviewStatus':
          fieldValue = requirement.reviewStatus === 'approved' ? '评审通过' :
                     requirement.reviewStatus === 'rejected' ? '评审拒绝' :
                     requirement.reviewStatus === 'second_review' ? '二级评审中' :
                     requirement.reviewStatus === 'first_review' ? '一级评审中' :
                     '待评审';
          break;
        case 'plannedVersion':
          fieldValue = requirement.plannedVersion || '';
          break;
        case 'createdAt':
          fieldValue = requirement.createdAt;
          break;
        default:
          return true;
      }

      const filterValue = filter.value.toLowerCase();
      const fieldValueLower = fieldValue.toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return fieldValueLower === filterValue;
        case 'not_equals':
          return fieldValueLower !== filterValue;
        case 'contains':
          return fieldValueLower.includes(filterValue);
        case 'not_contains':
          return !fieldValueLower.includes(filterValue);
        case 'is_empty':
          return fieldValue === '';
        case 'is_not_empty':
          return fieldValue !== '';
        case 'is_duplicate':
          // 检查是否有其他记录的该字段值相同
          return requirements.some(r => 
            r.id !== requirement.id && 
            (r as any)[filter.column]?.toString().toLowerCase() === fieldValueLower
          );
        default:
          return true;
      }
    });
  };

  const handleCreateRequirement = () => {
    if (onNavigate) {
      onNavigate('requirement-edit', { 
        requirement: null, 
        isEdit: false,
        source: 'requirements'
      });
    }
  };

  const handleViewRequirement = (requirement: Requirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', { requirementId: requirement.id, source: 'requirements' });
    }
  };

  // 计算各状态数量
  const openCount = requirements.filter(req => req.isOpen).length;
  const closedCount = requirements.filter(req => !req.isOpen).length;
  const totalCount = requirements.length;

  // 筛选逻辑
  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = !searchTerm || 
      requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || requirement.type === filterType;
    const matchesPriority = filterPriority === 'all' || requirement.priority === filterPriority;
    const matchesOpenStatus = filterOpenStatus === 'all' || 
      (filterOpenStatus === 'open' && requirement.isOpen) ||
      (filterOpenStatus === 'closed' && !requirement.isOpen);
    
    const matchesCustomFilters = applyCustomFilters(requirement, customFilters);

    return matchesSearch && matchesType && matchesPriority && matchesOpenStatus && matchesCustomFilters;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">需求池</h1>
            <p className="text-muted-foreground mt-1">
              管理和追踪未排期的产品需求，包括功能需求、Bug修复、产品建议等
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleCreateRequirement}>
              <Plus className="h-4 w-4 mr-2" />
              新建需求
            </Button>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 筛选和操作栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* 搜索 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索需求..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* 新功能按钮组 */}
                <div className="flex items-center gap-2">
                  {/* 隐藏列 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <EyeOff className="h-4 w-4 mr-2" />
                        隐藏列
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        标题
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        类型
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        优先级
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        创建人
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        应用端
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        一级评审
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        二级评审
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        评审状态
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Checkbox className="mr-2" defaultChecked />
                        预排期版本
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 筛选设置 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-4 w-4 mr-2" />
                        筛选设置
                        {(customFilters.length > 0 || filterType !== 'all' || filterPriority !== 'all') && (
                          <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                            {customFilters.length + (filterType !== 'all' ? 1 : 0) + (filterPriority !== 'all' ? 1 : 0)}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80">
                      {/* 快速筛选 */}
                      <div className="p-3 border-b">
                        <h4 className="font-medium mb-2">快速筛选</h4>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">类型</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                              <SelectTrigger className="w-full h-7">
                                <SelectValue placeholder="选择类型" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">所有类型</SelectItem>
                                {requirementTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">优先级</Label>
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                              <SelectTrigger className="w-full h-7">
                                <SelectValue placeholder="选择优先级" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">所有优先级</SelectItem>
                                {priorities.map(priority => (
                                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* 自定义筛选 */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">自定义筛选</h4>
                          <Button variant="ghost" size="sm" onClick={addCustomFilter} className="h-6 px-2">
                            <Plus className="h-3 w-3 mr-1" />
                            添加
                          </Button>
                        </div>
                        
                        {customFilters.length === 0 ? (
                          <p className="text-xs text-muted-foreground">暂无自定义筛选条件</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {customFilters.map((filter) => (
                              <div key={filter.id} className="border rounded p-2 space-y-2 bg-muted/30">
                                <div className="flex items-center gap-2">
                                  <Select 
                                    value={filter.column} 
                                    onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                                  >
                                    <SelectTrigger className="h-6 text-xs flex-1">
                                      <SelectValue placeholder="选择列" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filterableColumns.map(col => (
                                        <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeCustomFilter(filter.id)}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <Select 
                                  value={filter.operator} 
                                  onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                                >
                                  <SelectTrigger className="h-6 text-xs">
                                    <SelectValue placeholder="选择条件" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filterOperators.map(op => (
                                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {!['is_empty', 'is_not_empty', 'is_duplicate'].includes(filter.operator) && (
                                  <Input
                                    placeholder="输入筛选值"
                                    value={filter.value}
                                    onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                                    className="h-6 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenuSeparator />
                      <div className="p-3">
                        <Button variant="ghost" size="sm" className="w-full h-7" onClick={clearAllFilters}>
                          <X className="h-3 w-3 mr-2" />
                          清除所有筛选
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>



                  {/* 排序 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        排序
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        标题 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        标题 ↓
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        优先级 ↑
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        优先级 ↓
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Clock className="h-4 w-4 mr-2" />
                        创建时间（最新）
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock className="h-4 w-4 mr-2" />
                        创建时间（最早）
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 开放状态筛选按钮组 */}
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={filterOpenStatus === 'open' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterOpenStatus('open')}
                    className="h-8 rounded-r-none border-r"
                  >
                    开放中（{openCount}）
                  </Button>
                  <Button
                    variant={filterOpenStatus === 'closed' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterOpenStatus('closed')}
                    className="h-8 rounded-none border-r"
                  >
                    已关闭（{closedCount}）
                  </Button>
                  <Button
                    variant={filterOpenStatus === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterOpenStatus('all')}
                    className="h-8 rounded-l-none"
                  >
                    全部（{totalCount}）
                  </Button>
                </div>
                

              </div>
            </div>
          </CardContent>
        </Card>

        {/* 需求列表 */}
        <Card>
          <CardContent className="p-0">
            {filteredRequirements.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无需求</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  还没有创建任何需求。点击"新建需求"按钮开始创建您的第一个需求。
                </p>
                <Button onClick={handleCreateRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建需求
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>创建人</TableHead>
                    <TableHead>应用端</TableHead>
                    <TableHead>一级评审</TableHead>
                    <TableHead>二级评审</TableHead>
                    <TableHead>评审状态</TableHead>
                    <TableHead>预排期版本</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((requirement) => (
                    <TableRow key={requirement.id} className="hover:bg-muted/50">
                      {/* 标题 */}
                      <TableCell onClick={() => handleViewRequirement(requirement)} className="cursor-pointer">
                        <div className="font-medium text-primary hover:underline">{requirement.title}</div>
                      </TableCell>

                      {/* 类型 - 可编辑 */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                              {requirement.type}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {requirementTypes.map((type) => (
                              <DropdownMenuItem 
                                key={type} 
                                onClick={() => handleTypeChange(requirement.id, type)}
                              >
                                {type}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* 优先级 - 可编辑 */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge 
                              variant={priorityConfig[requirement.priority].variant}
                              className={`cursor-pointer text-xs ${priorityConfig[requirement.priority].className}`}
                            >
                              {requirement.priority}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {Object.keys(priorityConfig).map((priority) => (
                              <DropdownMenuItem 
                                key={priority} 
                                onClick={() => handlePriorityChange(requirement.id, priority)}
                              >
                                {priority}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* 创建人 */}
                      <TableCell onClick={() => handleViewRequirement(requirement)} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={requirement.creator.avatar} />
                            <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{requirement.creator.name}</span>
                        </div>
                      </TableCell>

                      {/* 应用端 - 可编辑 */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                              {requirement.platform}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {platforms.map((platform) => (
                              <DropdownMenuItem 
                                key={platform} 
                                onClick={() => handlePlatformChange(requirement.id, platform)}
                              >
                                {platform}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* 一级评审 */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* 一级评审人员 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {requirement.reviewer1 ? requirement.reviewer1.name : '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => console.log('设置一级评审人员为未指定')}>
                                未指定
                              </DropdownMenuItem>
                              {mockUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => console.log('设置一级评审人员:', user.name)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {user.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* 一级评审状态 */}
                          {requirement.reviewer1 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="secondary"
                                  className={`cursor-pointer text-xs ${
                                    requirement.reviewer1Status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' :
                                    requirement.reviewer1Status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80'
                                  }`}
                                >
                                  {requirement.reviewer1Status === 'approved' ? '已通过' :
                                   requirement.reviewer1Status === 'rejected' ? '已拒绝' : '待评审'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => console.log('设置一级评审状态为待评审')}>
                                  <Clock className="h-3 w-3 mr-2" />
                                  待评审
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置一级评审状态为已通过')}>
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  已通过
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置一级评审状态为已拒绝')}>
                                  <XCircle className="h-3 w-3 mr-2" />
                                  已拒绝
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>

                      {/* 二级评审 */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* 二级评审人员 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {requirement.reviewer2 ? requirement.reviewer2.name : '未指定'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => console.log('设置二级评审人员为未指定')}>
                                未指定
                              </DropdownMenuItem>
                              {mockUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => console.log('设置二级评审人员:', user.name)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {user.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* 二级评审状态 */}
                          {requirement.reviewer2 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="secondary"
                                  className={`cursor-pointer text-xs ${
                                    requirement.reviewer2Status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' :
                                    requirement.reviewer2Status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80'
                                  }`}
                                >
                                  {requirement.reviewer2Status === 'approved' ? '已通过' :
                                   requirement.reviewer2Status === 'rejected' ? '已拒绝' : '待评审'}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => console.log('设置二级评审状态为待评审')}>
                                  <Clock className="h-3 w-3 mr-2" />
                                  待评审
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置二级评审状态为已通过')}>
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  已通过
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('设置二级评审状态为已拒绝')}>
                                  <XCircle className="h-3 w-3 mr-2" />
                                  已拒绝
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>

                      {/* 评审状态 */}
                      <TableCell onClick={() => handleViewRequirement(requirement)} className="cursor-pointer">
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {requirement.reviewStatus === 'approved' ? '评审通过' :
                           requirement.reviewStatus === 'rejected' ? '评审拒绝' :
                           requirement.reviewStatus === 'second_review' ? '二级评审中' :
                           requirement.reviewStatus === 'first_review' ? '一级评审中' :
                           '待评审'}
                        </Badge>
                      </TableCell>

                      {/* 预排期版本 - 仅评审通过后可编辑 - 最后一列 */}
                      <TableCell>
                        {requirement.reviewStatus === 'approved' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                                {requirement.plannedVersion || '未分配'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handleVersionChange(requirement.id, 'unassigned')}>
                                未分配
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {availableVersions.map((version) => (
                                <DropdownMenuItem 
                                  key={version} 
                                  onClick={() => handleVersionChange(requirement.id, version)}
                                >
                                  {version}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground cursor-not-allowed opacity-50">
                            待评审通过
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}