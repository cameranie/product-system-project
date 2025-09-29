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
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { RequirementComments } from './RequirementComments';
import { RequirementHistory } from './RequirementHistory';

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
    creator: mockUsers[1],
    project: mockProjects[0],
    description: '优化用户注册流程，减少用户流失率，提高转化率。包括简化注册步骤、增加第三方登录选项等。需要考虑以下几个方面：\n\n1. 简化注册表单，减少必填字段\n2. 增加微信、QQ等第三方登录方式\n3. 优化验证码验证流程\n4. 添加注册进度指示器\n5. 优化移动端注册体验\n\n预期效果：\n- 注册转化率提升30%\n- 用户注册时间缩短50%\n- 减少用户流失',
    tags: ['用户体验', 'UI优化', '移动端'],
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-20 16:45',
    platform: 'Web端',
    plannedVersion: 'v2.1.0',
    isOpen: true,
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    reviewStatus: 'first_review',
    assignee: mockUsers[0]
  },
  {
    id: '2',
    title: '支付功能集成',
    type: '功能需求',
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
    reviewer2: mockUsers[4],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[1]
  },
  {
    id: '3',
    title: '数据导出功能',
    type: '产品建议',
    status: '设计中',
    priority: '中',
    creator: mockUsers[3],
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
    type: '功能需求',
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
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
    assignee: mockUsers[4]
  },
  {
    id: '5',
    title: '行情推送服务升级',
    type: '技术需求',
    status: '评审通过',
    priority: '紧急',
    creator: mockUsers[2],
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
    type: '安全需求',
    status: '待评审',
    priority: '紧急',
    creator: mockUsers[4],
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
    assignee: mockUsers[3]
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

export function RequirementDetailPage({ 
  requirementId, 
  onNavigate, 
  onBack, 
  source = 'requirements' 
}: RequirementDetailPageProps) {
  const [requirement, setRequirement] = useState<Requirement>(getMockRequirement(requirementId, source));
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequirement, setEditedRequirement] = useState<Requirement>(requirement);
  
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

  // 处理需求评审状态变更
  const handleReviewer1StatusChange = (status: 'pending' | 'approved' | 'rejected') => {
    setRequirement(prev => {
      const updated = {
        ...prev,
        reviewer1Status: status,
        updatedAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-')
      };

      // 更新总体评审状态
      if (status === 'rejected') {
        updated.reviewStatus = 'rejected';
        updated.status = '评审不通过';
      } else if (status === 'approved') {
        if (!prev.reviewer2) {
          updated.reviewStatus = 'approved';
          updated.status = '评审通过';
        } else if (prev.reviewer2Status === 'approved') {
          updated.reviewStatus = 'approved';
          updated.status = '评审通过';
        } else {
          updated.reviewStatus = 'second_review';
          updated.status = '评审中';
        }
      } else {
        updated.reviewStatus = 'first_review';
        updated.status = '评审中';
      }

      return updated;
    });
  };

  const handleReviewer2StatusChange = (status: 'pending' | 'approved' | 'rejected') => {
    setRequirement(prev => {
      const updated = {
        ...prev,
        reviewer2Status: status,
        updatedAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-')
      };

      // 更新总体评审状态
      if (status === 'rejected') {
        updated.reviewStatus = 'rejected';
        updated.status = '评审不通过';
      } else if (status === 'approved' && prev.reviewer1Status === 'approved') {
        updated.reviewStatus = 'approved';
        updated.status = '评审通过';
      } else {
        updated.reviewStatus = 'second_review';
        updated.status = '评审中';
      }

      return updated;
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate(source || 'scheduled-requirements');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
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
      // 检查是否已有PRD（这里用模拟逻辑）
      const hasPRD = Math.random() > 0.5; // 模拟数据
      if (hasPRD) {
        onNavigate('prd', { mode: 'view', requirementId: requirement.id, returnTo: source });
      } else {
        onNavigate('prd', { mode: 'create', requirementId: requirement.id, returnTo: source });
      }
    }
  };

  const handleNavigateToBugs = () => {
    if (onNavigate) {
      onNavigate('bugs', { 
        filterRequirementId: requirement.id,
        requirementTitle: requirement.title,
        returnTo: source
      });
    }
  };

  const handleNavigateToPrototype = () => {
    if (onNavigate) {
      // 检查是否已有关联的原型设计
      const hasPrototype = requirement.prototypeId;
      if (hasPrototype) {
        onNavigate('prototype', { mode: 'view', prototypeId: requirement.prototypeId, returnTo: source });
      } else {
        onNavigate('prototype', { mode: 'create', requirementId: requirement.id, returnTo: source });
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

          {/* 评论区 */}
          <RequirementComments 
            requirementId={requirement.id} 
            currentUser={mockUsers[0]} 
          />

          {/* 创建修改记录 */}
          <RequirementHistory requirementId={requirement.id} />

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
        </div>

        {/* 侧边信息 */}
        <div className="space-y-6">
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
                <Label className="text-xs text-muted-foreground">优先级</Label>
                <div className="mt-1">
                  <Badge 
                    variant={
                      requirement.priority === '紧急' ? 'destructive' :
                      requirement.priority === '高' ? 'default' :
                      requirement.priority === '中' ? 'secondary' : 'outline'
                    }
                  >
                    {requirement.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">所属项目</Label>
                <div className="mt-1">
                  <Badge variant="outline" style={{ borderColor: requirement.project.color }}>
                    {requirement.project.name}
                  </Badge>
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
                <Label className="text-xs text-muted-foreground">创建时间</Label>
                <div className="mt-1 text-sm">{requirement.createdAt}</div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">更新时间</Label>
                <div className="mt-1 text-sm">{requirement.updatedAt}</div>
              </div>
            </CardContent>
          </Card>

          {requirement.tags && requirement.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {requirement.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 需求池评审管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                评审管理
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                需求池评审流程管理
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 评审总状态 */}
              <div>
                <Label className="text-xs text-muted-foreground">当前评审状态</Label>
                <div className="mt-1 flex items-center gap-2">
                  {requirement.reviewStatus === 'approved' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : requirement.reviewStatus === 'rejected' ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                  <Badge 
                    variant={
                      requirement.reviewStatus === 'approved' ? 'default' : 
                      requirement.reviewStatus === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {requirement.reviewStatus === 'approved' ? '评审通过' : 
                     requirement.reviewStatus === 'rejected' ? '评审不通过' : 
                     requirement.reviewStatus === 'second_review' ? '二级评审中' :
                     requirement.reviewStatus === 'first_review' ? '一级评审中' :
                     '待评审'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* 一级评审 */}
              {requirement.reviewer1 && (
                <div>
                  <Label className="text-xs text-muted-foreground">一级评审人</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={requirement.reviewer1.avatar} />
                        <AvatarFallback>{requirement.reviewer1.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{requirement.reviewer1.name}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {requirement.reviewer1Status === 'approved' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : requirement.reviewer1Status === 'rejected' ? (
                          <XCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-orange-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {requirement.reviewer1Status === 'approved' ? '已通过' : 
                           requirement.reviewer1Status === 'rejected' ? '不通过' : 
                           '待评审'}
                        </span>
                      </div>
                    </div>
                    <Select 
                      value={requirement.reviewer1Status || 'pending'} 
                      onValueChange={(value: 'pending' | 'approved' | 'rejected') => handleReviewer1StatusChange(value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-orange-500" />
                            待评审
                          </div>
                        </SelectItem>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            评审通过
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-red-500" />
                            评审不通过
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* 二级评审 */}
              {requirement.reviewer2 && (
                <div>
                  <Label className="text-xs text-muted-foreground">二级评审人</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={requirement.reviewer2.avatar} />
                        <AvatarFallback>{requirement.reviewer2.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{requirement.reviewer2.name}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {requirement.reviewer2Status === 'approved' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : requirement.reviewer2Status === 'rejected' ? (
                          <XCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-orange-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {requirement.reviewer2Status === 'approved' ? '已通过' : 
                           requirement.reviewer2Status === 'rejected' ? '不通过' : 
                           '待评审'}
                        </span>
                      </div>
                    </div>
                    <Select 
                      value={requirement.reviewer2Status || 'pending'} 
                      onValueChange={(value: 'pending' | 'approved' | 'rejected') => handleReviewer2StatusChange(value)}
                      disabled={requirement.reviewer1Status !== 'approved'}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-orange-500" />
                            待评审
                          </div>
                        </SelectItem>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            评审通过
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-red-500" />
                            评审不通过
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {requirement.reviewer1Status !== 'approved' && (
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <AlertCircle className="h-3 w-3" />
                        需等待一级评审通过
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 如果没有评审人 */}
              {!requirement.reviewer1 && !requirement.reviewer2 && (
                <div className="text-center py-4 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">暂未指定评审人</div>
                  <div className="text-xs">请联系管理员配置评审人员</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 预排期评审管理 - 只在预排期需求中显示 */}
          {requirement.plannedVersion && source === 'scheduled-requirements' && (
            <Card>


            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPRD}
              >
                <FileText className="h-4 w-4 mr-2" />
                {Math.random() > 0.5 ? '查看PRD文档' : '创建PRD文档'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToPrototype}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {requirement.prototypeId ? '查看原型设计' : '创建原型设计'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNavigateToBugs}
              >
                <Bug className="h-4 w-4 mr-2" />
                查看相关Bug
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}