import React, { useState } from 'react';
import { 
  ArrowLeft,
  Edit,
  FileText,
  BarChart3,
  Bug,
  Link,
  Paperclip,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  Plus,
  BookOpen,
  MousePointer,
  Palette
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { RequirementCommentsCompact } from './RequirementCommentsCompact';
import { RequirementHistoryCompact } from './RequirementHistoryCompact';
import { ScheduledReviewSection, ScheduledReviewData } from './ScheduledReviewSection';

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

// 端负责人意见接口
interface EndOwnerOpinion {
  needToDo?: boolean; // 是否要做
  priority?: '高' | '中' | '低'; // 优先级
  opinion?: string; // 意见
}

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
  platforms?: string[];
  plannedVersion?: string;
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer3?: User;
  reviewer4?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewer3Status?: 'pending' | 'approved' | 'rejected';
  reviewer4Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'third_review' | 'fourth_review' | 'approved' | 'rejected';
  assignee?: User;
  prototypeId?: string;
  designId?: string; // 新增：UI设计稿ID
  prdId?: string;
  endOwnerOpinion?: EndOwnerOpinion; // 新增：端负责人意见
  scheduledReview?: ScheduledReviewData; // 新增：预排期评审数据
  attachments?: Attachment[];
}

interface RequirementDetailPageProps {
  requirementId: string;
  onNavigate?: (page: string, context?: any) => void;
  onBack?: () => void;
  source?: 'requirements' | 'scheduled-requirements';
}

// 一级评审人员
const firstLevelReviewers: User[] = [
  { id: '1', name: '林嘉娜', avatar: '/avatars/linjianna.jpg', email: 'linjianna@example.com' },
  { id: '2', name: '叶裴锋', avatar: '/avatars/yepeifeng.jpg', email: 'yepeifeng@example.com' }
];

// 二级评审人员
const secondLevelReviewers: User[] = [
  { id: '3', name: '谢焰明', avatar: '/avatars/xieyanming.jpg', email: 'xieyanming@example.com' },
  { id: '4', name: '卢兆锋', avatar: '/avatars/luzhaofeng.jpg', email: 'luzhaofeng@example.com' },
  { id: '5', name: '陆柏良', avatar: '/avatars/lubailiang.jpg', email: 'lubailiang@example.com' },
  { id: '6', name: '杜韦志', avatar: '/avatars/duweizhi.jpg', email: 'duweizhi@example.com' },
  { id: '7', name: '温明震', avatar: '/avatars/wenmingzhen.jpg', email: 'wenmingzhen@example.com' }
];

// 所有评审人员（用于三级四级评审选择）
const allReviewers: User[] = [...firstLevelReviewers, ...secondLevelReviewers];

// 更新mockUsers以使用新的评审人员  
const mockUsers: User[] = [...allReviewers];

// 张三用户
const zhangSan: User = { id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg', email: 'zhangsan@example.com' };

// Bug统计数据类型
interface BugStatistics {
  total: number;
  byPriorityAndStatus: {
    high: { open: number; closed: number; };
    medium: { open: number; closed: number; };
    low: { open: number; closed: number; };
  };
  byStatus: {
    open: number;
    closed: number;
  };
}

// 根据需求ID获取Bug统计数据（模拟数据）
const getBugStatistics = (requirementId: string): BugStatistics => {
  const mockStats: Record<string, BugStatistics> = {
    '1': {
      total: 8,
      byPriorityAndStatus: { 
        high: { open: 2, closed: 3 }, 
        medium: { open: 2, closed: 1 }, 
        low: { open: 0, closed: 0 } 
      },
      byStatus: { open: 4, closed: 4 }
    },
    '2': {
      total: 12,
      byPriorityAndStatus: { 
        high: { open: 3, closed: 2 }, 
        medium: { open: 3, closed: 2 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 7, closed: 5 }
    },
    '3': {
      total: 5,
      byPriorityAndStatus: { 
        high: { open: 1, closed: 0 }, 
        medium: { open: 1, closed: 1 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 3, closed: 2 }
    },
    '4': {
      total: 15,
      byPriorityAndStatus: { 
        high: { open: 4, closed: 2 }, 
        medium: { open: 4, closed: 3 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 9, closed: 6 }
    },
    '5': {
      total: 6,
      byPriorityAndStatus: { 
        high: { open: 2, closed: 1 }, 
        medium: { open: 1, closed: 1 }, 
        low: { open: 1, closed: 0 } 
      },
      byStatus: { open: 4, closed: 2 }
    },
    '6': {
      total: 10,
      byPriorityAndStatus: { 
        high: { open: 2, closed: 1 }, 
        medium: { open: 3, closed: 2 }, 
        low: { open: 1, closed: 1 } 
      },
      byStatus: { open: 6, closed: 4 }
    }
  };
  
  return mockStats[requirementId] || {
    total: 0,
    byPriorityAndStatus: { 
      high: { open: 0, closed: 0 }, 
      medium: { open: 0, closed: 0 }, 
      low: { open: 0, closed: 0 } 
    },
    byStatus: { open: 0, closed: 0 }
  };
};

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 所有需求的mock数据
const allMockRequirements: Requirement[] = [
  {
    id: '1',
    title: '用户注册流程优化',
    type: '新功能',
    status: '待评审',
    priority: '高',
    creator: zhangSan,
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。需要考虑以下几个方面：\\n\\n1. 简化注册表单，减少必填字段\\n2. 增加微信、QQ等第三方登录方式\\n3. 优化验证码验证流程\\n4. 添加注册进度指示器\\n5. 优化移动端注册体验\\n\\n预期效果：\\n- 注册转化率提升30%\\n- 用户注册时间缩短50%\\n- 减少用户流失',
    tags: ['用户体验', 'UI优化', '移动端'],
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-20 16:45',
    platforms: ['Web端'],
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: secondLevelReviewers[0],
    reviewer2: secondLevelReviewers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: firstLevelReviewers[0],
    endOwnerOpinion: {
      needToDo: true,
      priority: '高',
      opinion: '这个需求很有价值，建议优先处理。注册流程确实需要优化，特别是移动端体验。建议分阶段实施，先完成核心功能再完善细节。'
    },
    scheduledReview: {
      reviewLevels: [
        {
          id: '1',
          level: 1,
          levelName: '一级评审',
          reviewer: firstLevelReviewers[0],
          status: 'approved',
          opinion: '需求合理，技术实现可行，建议进入二级评审。',
          reviewedAt: '2024-01-16 10:30'
        },
        {
          id: '2',
          level: 2,
          levelName: '二级评审',
          reviewer: secondLevelReviewers[0],
          status: 'pending',
          opinion: '',
          reviewedAt: undefined
        }
      ]
    }
    // 没有PRD ID，表示还未创建PRD
  },
  {
    id: '2',
    title: '支付功能集成',
    type: '新功能',
    status: '开发中',
    priority: '高',
    creator: zhangSan,
    project: mockProjects[2],
    description: '集成多种支付方式，包括支付宝、微信支付、银行卡支付等，提供安全可靠的支付体验。',
    tags: ['支付', '功能'],
    createdAt: '2024-01-10 09:15',
    updatedAt: '2024-01-18 11:20',
    platforms: ['全平台'],
    plannedVersion: 'v2.0.0',
    isOpen: true,
    reviewer1: secondLevelReviewers[0],
    reviewer2: secondLevelReviewers[2],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: firstLevelReviewers[1],
    prototypeId: 'prototype-2', // 已有交互原型
    designId: 'design-2', // 已有UI设计稿
    prdId: 'prd-2' // 已有PRD
  },
  {
    id: '3',
    title: '数据导出功能',
    type: '用户反馈',
    status: '设计中',
    priority: '中',
    creator: zhangSan,
    project: mockProjects[3],
    description: '支持用户���出各种格式的数据报表，包括Excel、PDF、CSV等格式。',
    tags: ['导出', '数据分析'],
    createdAt: '2024-01-12 13:25',
    updatedAt: '2024-01-16 15:10',
    platforms: ['Web端'],
    plannedVersion: 'v2.2.0',
    isOpen: false,
    reviewer1: firstLevelReviewers[0],
    reviewer2: firstLevelReviewers[1],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: secondLevelReviewers[0]
    // 没有PRD ID，表示还未创建PRD
  },
  {
    id: '4',
    title: 'K线图实时更新优化',
    type: '优化',
    status: '已完成',
    priority: '高',
    creator: zhangSan,
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。',
    tags: ['K线', '实时数据', '性能优��'],
    createdAt: '2024-01-20 10:00',
    updatedAt: '2024-01-25 17:30',
    platforms: ['Web端'],
    plannedVersion: 'v2.3.0',
    isOpen: true,
    reviewer1: firstLevelReviewers[1],
    reviewer2: secondLevelReviewers[1],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: secondLevelReviewers[4],
    prototypeId: 'prototype-4', // 已有交互原型
    prdId: 'prd-4' // 已有PRD
  },
  {
    id: '5',
    title: '行情推送服务升级',
    type: '优化',
    status: '评审通过',
    priority: '紧急',
    creator: zhangSan,
    project: mockProjects[1],
    description: '升级行情推送服务架构，支持更高并发量的实时行情数据推送，降低延迟。',
    tags: ['行情', 'WebSocket', '高并发'],
    createdAt: '2024-01-22 08:45',
    updatedAt: '2024-01-26 12:15',
    platforms: ['全平台'],
    plannedVersion: 'v2.4.0',
    isOpen: true,
    reviewer1: secondLevelReviewers[4],
    reviewer1Status: 'approved',
    reviewStatus: 'approved',
    assignee: firstLevelReviewers[0]
  },
  {
    id: '6',
    title: '交易风控系统优化',
    type: 'BUG',
    status: '待评审',
    priority: '紧急',
    creator: zhangSan,
    project: mockProjects[4],
    description: '完善交易风控系统，增加异常交易检测算法，提升系统安全性和风险防控能力。',
    tags: ['风控', '安全', '算法'],
    createdAt: '2024-01-18 16:20',
    updatedAt: '2024-01-24 14:55',
    platforms: ['全平台'],
    plannedVersion: 'v2.5.0',
    isOpen: true,
    reviewer1: secondLevelReviewers[0],
    reviewer2: firstLevelReviewers[0],
    reviewer3: secondLevelReviewers[2],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewer3Status: 'pending',
    reviewStatus: 'pending',
    assignee: secondLevelReviewers[1]
  },
  {
    id: '7',
    title: '移动端消息推送功能',
    type: '新功能',
    status: '设计中',
    priority: '中',
    creator: zhangSan,
    project: mockProjects[3],
    description: '为移动端用户提供消息推送功能，包括交易提醒、行情变动通知、系统公告等。需要考虑以下几个方面：\n\n1. 支持个性化推送设置\n2. 推送消息分类管理\n3. 消息历史记录查看\n4. 推送时间段设置\n5. 重要消息优先级处理\n\n预期目标：\n- 提升用户活跃度\n- 及时传达重要信息\n- 增强用户粘性',
    tags: ['移动端', '推送', '消息'],
    createdAt: '2024-01-28 10:30',
    updatedAt: '2024-01-30 14:20',
    platforms: ['移动端'],
    plannedVersion: 'v2.6.0',
    isOpen: true,
    reviewer1: firstLevelReviewers[1],
    reviewer2: secondLevelReviewers[3],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'pending',
    assignee: secondLevelReviewers[2]
    // 注意：这个需求没有PRD ID，也没有在getBugStatistics中定义，所以bugStats.total会是0
  }
];

// 根据ID和来源获取需求数据
const getMockRequirement = (id: string, source?: string): Requirement => {
  const foundRequirement = allMockRequirements.find(req => req.id === id);
  if (!foundRequirement) {
    // 如果找不到，返回默认数据
    return allMockRequirements[0];
  }
  return foundRequirement;
};

export function RequirementDetailPageWithPRD({ 
  requirementId, 
  onNavigate, 
  onBack, 
  source = 'requirements' 
}: RequirementDetailPageProps) {
  const [requirement, setRequirement] = useState<Requirement>(getMockRequirement(requirementId, source));
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequirement, setEditedRequirement] = useState<Requirement>(requirement);
  
  // 获取Bug统计数据
  const bugStats = getBugStatistics(requirement.id);
  
  // 预排期评审状态（独立于需求池评审状态）- 模拟不同需求的不同状态
  const getInitialScheduledStatus = (reqId: string, reviewerType: 'reviewer1' | 'reviewer2') => {
    const statusMap: Record<string, Record<string, 'pending' | 'approved' | 'rejected'>> = {
      '1': { reviewer1: 'approved', reviewer2: 'pending' },
      '2': { reviewer1: 'approved', reviewer2: 'approved' },
      '3': { reviewer1: 'rejected', reviewer2: 'pending' },
      '4': { reviewer1: 'approved', reviewer2: 'approved' },
      '5': { reviewer1: 'approved', reviewer2: 'pending' },
      '6': { reviewer1: 'pending', reviewer2: 'pending' }
    };
    return statusMap[reqId]?.[reviewerType] || 'pending';
  };

  const [scheduledReviewer1Status, setScheduledReviewer1Status] = useState<'pending' | 'approved' | 'rejected'>(
    getInitialScheduledStatus(requirementId, 'reviewer1')
  );
  const [scheduledReviewer2Status, setScheduledReviewer2Status] = useState<'pending' | 'approved' | 'rejected'>(
    getInitialScheduledStatus(requirementId, 'reviewer2')
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate(source || 'scheduled-requirements');
    }
  };

  const handleToggleStatus = () => {
    // 模拟切换开放状态
    setRequirement({
      ...requirement,
      isOpen: !requirement.isOpen
    });
  };

  const handleNavigateToPRD = () => {
    if (onNavigate) {
      // 检查是否已有PRD
      const hasPRD = !!requirement.prdId;
      if (hasPRD) {
        onNavigate('prd', { 
          mode: 'view', 
          prdId: requirement.prdId,
          requirementId: requirement.id, 
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      } else {
        onNavigate('prd', { 
          mode: 'create', 
          requirementId: requirement.id, 
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      }
    }
  };

  const handleNavigateToBugs = () => {
    if (onNavigate) {
      if (bugStats.total > 0) {
        // 已有问题，跳转到问题列表页面
        onNavigate('bugs', { 
          filterRequirementId: requirement.id,
          requirementTitle: requirement.title,
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      } else {
        // 还没有问题，跳转到问题创建页面并自动关联需求
        onNavigate('bug-create', {
          mode: 'create',
          relatedRequirementId: requirement.id,
          relatedRequirementTitle: requirement.title,
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      }
    }
  };

  const handleNavigateToPrototype = () => {
    if (onNavigate) {
      // 检查是否已有关联的交互原型
      const hasPrototype = requirement.prototypeId;
      if (hasPrototype) {
        // 已有原型，跳转到原型详情页
        onNavigate('prototype', { 
          mode: 'view', 
          prototypeId: requirement.prototypeId,
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      } else {
        // 没有原型，跳转到创建原型页面并自动关联需求
        onNavigate('prototype', { 
          mode: 'create', 
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      }
    }
  };

  const handleNavigateToDesign = () => {
    if (onNavigate) {
      // 检查是否已有关联的UI设计稿
      const hasDesign = requirement.designId;
      if (hasDesign) {
        // 已有设计稿，跳转到设计详情页
        onNavigate('design-detail', { 
          designId: requirement.designId,
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      } else {
        // 没有设计稿，跳转到创建设计页面并自动关联需求
        onNavigate('design-management', { 
          mode: 'create', 
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          returnTo: 'requirement-detail',
          returnContext: {
            requirementId: requirement.id,
            source: source
          }
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div className="flex items-center gap-2">
            <Badge 
              variant={requirement.isOpen ? 'default' : 'secondary'}
              className="text-xs"
            >
              {requirement.isOpen ? '开放中' : '已关闭'}
            </Badge>
            <h1 className="text-2xl font-semibold">{requirement.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            className="text-xs"
          >
            {requirement.isOpen ? '关闭需求' : '重新开放'}
          </Button>
          <Button variant="outline" onClick={() => onNavigate && onNavigate('requirement-edit', { requirement: requirement, isEdit: true, source: source })}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>需求描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {requirement.description}
              </p>
            </CardContent>
          </Card>

          {requirement.attachments && requirement.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>附件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requirement.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 评论区 - 压缩版本 */}
          <RequirementCommentsCompact 
            requirementId={requirement.id} 
            currentUser={mockUsers[0]} 
          />

          {/* 修改记录 - 压缩版本 */}
          <RequirementHistoryCompact requirementId={requirement.id} />
        </div>

        {/* 侧边信息 - 参照需求��辑页的设计 */}
        <div className="space-y-6">
          {/* 基本信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">需求类型</Label>
                <div className="mt-1">
                  <Badge variant="outline">{requirement.type}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">应用端</Label>
                <div className="mt-1">
                  {requirement.platforms && requirement.platforms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {requirement.platforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">未设置</div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">创建者</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={requirement.creator.avatar} />
                    <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{requirement.creator.name}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">创建时间</Label>
                <div className="mt-1 text-sm">{requirement.createdAt}</div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">更新时间</Label>
                <div className="mt-1 text-sm">{requirement.updatedAt}</div>
              </div>
            </CardContent>
          </Card>

          {/* 端负责人意见卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                端负责人意见
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                端负责人对需求的评估和建议
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirement.endOwnerOpinion ? (
                <>
                  {/* 是否要做 */}
                  <div>
                    <Label className="text-xs text-muted-foreground">是否要做</Label>
                    <div className="mt-1">
                      {requirement.endOwnerOpinion.needToDo !== undefined ? (
                        <Badge 
                          variant={requirement.endOwnerOpinion.needToDo ? 'default' : 'destructive'}
                        >
                          {requirement.endOwnerOpinion.needToDo ? '是' : '否'}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">未设置</span>
                      )}
                    </div>
                  </div>

                  {/* 优先级 */}
                  <div>
                    <Label className="text-xs text-muted-foreground">建议优先级</Label>
                    <div className="mt-1">
                      {requirement.endOwnerOpinion.priority ? (
                        <Badge 
                          variant={
                            requirement.endOwnerOpinion.priority === '高' ? 'destructive' :
                            requirement.endOwnerOpinion.priority === '中' ? 'default' :
                            'secondary'
                          }
                        >
                          {requirement.endOwnerOpinion.priority}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">未设置</span>
                      )}
                    </div>
                  </div>

                  {/* 意见 */}
                  {requirement.endOwnerOpinion.opinion && (
                    <div>
                      <Label className="text-xs text-muted-foreground">意见</Label>
                      <div className="mt-1 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm">{requirement.endOwnerOpinion.opinion}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  端负责人尚未提供意见
                </div>
              )}
            </CardContent>
          </Card>

          {/* 预排期评审 */}
          <ScheduledReviewSection
            data={requirement.scheduledReview}
            isEditable={false}
            showTitle={true}
          />

          {/* 快捷操作卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                快捷操作
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                快速访问相关文档和功能
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* PRD快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">产品需求文档</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToPRD}
                  >
                    {requirement.prdId ? '打开PRD文档' : '创建PRD'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {requirement.prdId ? 
                    `查看和编辑产品需求文档 (ID: ${requirement.prdId})` : 
                    '为该需求创建详细的产品需求文档'
                  }
                </div>
              </div>

              {/* 交互原型快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">交互原型</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToPrototype}
                  >
                    {requirement.prototypeId ? '查看原型' : '创建原型'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {requirement.prototypeId ? '查看交互原型设计和逻辑流程' : '创建可点击的交互原型'}
                </div>
              </div>

              {/* UI设计稿快捷操作 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">UI设计稿</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToDesign}
                  >
                    {requirement.designId ? '查看设计稿' : '创建设计稿'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {requirement.designId ? '查看高保真UI设计稿和视觉规范' : '创建精美的UI设计稿'}
                </div>
              </div>

              {/* Bug追踪快捷操作 - 整合了Bug信息 */}
              <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">问题追踪</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToBugs}
                  >
                    {bugStats.total > 0 ? '查看问题' : '提交问题'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {bugStats.total > 0 ? `该需求相关的 ${bugStats.total} 个问题` : '为该需求提交问题反馈'}
                </div>
                
                {/* Bug统计信息 - 只在有Bug时显示 */}
                {bugStats.total > 0 && (
                  <div className="mt-3 space-y-2">
                    <Separator />
                    
                    {/* 优先级统计 */}
                    <div className="space-y-2">
                      {/* 高优先级 */}
                      {(bugStats.byPriorityAndStatus.high.open + bugStats.byPriorityAndStatus.high.closed) > 0 && (
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive" className="text-xs">高</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>开发中: {bugStats.byPriorityAndStatus.high.open}</span>
                            <span>已关闭: {bugStats.byPriorityAndStatus.high.closed}</span>
                            <span>全部: {bugStats.byPriorityAndStatus.high.open + bugStats.byPriorityAndStatus.high.closed}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* 中优先级 */}
                      {(bugStats.byPriorityAndStatus.medium.open + bugStats.byPriorityAndStatus.medium.closed) > 0 && (
                        <div className="flex items-center justify-between">
                          <Badge variant="default" className="text-xs bg-orange-500 hover:bg-orange-600">中</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>开发中: {bugStats.byPriorityAndStatus.medium.open}</span>
                            <span>已关闭: {bugStats.byPriorityAndStatus.medium.closed}</span>
                            <span>全部: {bugStats.byPriorityAndStatus.medium.open + bugStats.byPriorityAndStatus.medium.closed}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* 低优先级 */}
                      {(bugStats.byPriorityAndStatus.low.open + bugStats.byPriorityAndStatus.low.closed) > 0 && (
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">低</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>开发中: {bugStats.byPriorityAndStatus.low.open}</span>
                            <span>已关闭: {bugStats.byPriorityAndStatus.low.closed}</span>
                            <span>全部: {bugStats.byPriorityAndStatus.low.open + bugStats.byPriorityAndStatus.low.closed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* 总体统计 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">总计</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>开发中: {bugStats.byStatus.open}</span>
                        <span>已关闭: {bugStats.byStatus.closed}</span>
                        <span>全部: {bugStats.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>





          {/* 快捷操作卡片 */}



        </div>
      </div>
    </div>
  );
}