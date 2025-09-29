import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { 
  ArrowLeft,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  Users,
  History
} from 'lucide-react';
import { PRDComments } from './PRDComments';
import { PRDHistory } from './PRDHistory';
import { PRDLinkedRequirementsSimplified as PRDLinkedRequirements } from './PRDLinkedRequirementsSimplified';

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

interface RequirementRef {
  id: string;
  title: string;
  type: string;
}

interface Version {
  id: string;
  version: string;
  content: string;
  createdAt: string;
  creator: User;
  comment?: string;
}

interface PRDItem {
  id: string;
  title: string;
  version: string;
  project: Project;
  status: 'draft' | 'published' | 'reviewing' | 'archived';
  creator: User;
  updatedAt: string;
  createdAt: string;
  content?: string;
  linkedRequirements?: RequirementRef[];
  tags?: string[];
  reviewer1?: User;
  reviewer2?: User;
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  versions?: Version[];
  platform?: string;
}

interface PRDDetailPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' },
];

const mockRequirements: RequirementRef[] = [
  { id: '1', title: '用户注册流程优化', type: '功能需求' },
  { id: '2', title: '支付功能集成', type: '功能需求' },
  { id: '3', title: '数据导出功能', type: '产品建议' },
  { id: '4', title: 'K线图实时更新优化', type: '技术需求' },
  { id: '5', title: '行情推送服务升级', type: '技术需求' },
  { id: '6', title: '交易风控系统优化', type: '安全需求' },
];

// 根据需求ID映射到对应的PRD
const mockPRDs: Record<string, PRDItem> = {
  'prd-2': {
    id: 'prd-2',
    title: '支付功能集成PRD',
    version: 'v2.0',
    project: mockProjects[4],
    platform: '全平台',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-18 16:45',
    createdAt: '2024-01-10 11:20',
    content: `# 支付功能集成PRD v2.0

## 项目背景
为了完善平台的商业模式，需要集成多种支付方式，包括支付宝、微信支付、银行卡支付等，提供安全可靠的支付体验。

## 需求概述
- 支持多种主流支付方式
- 确保支付安全性和合规性
- 提供良好的用户支付体验
- 支持订单状态实时更新

## 功能描述

### 1. 支付方式
- 支付宝支付
- 微信支付
- 银行卡支付
- Apple Pay (iOS)
- Google Pay (Android)

### 2. 支付流程
1. 用户选择商品/服务
2. 确认订单信息
3. 选择支付方式
4. 调用第三方支付接口
5. 处理支付回调
6. 更新订单状态
7. 发送支付成功通知

### 3. 安全措施
- SSL加密传输
- 支付密码验证
- 风控检测
- 交易限额设置

## 技术方案
- 使用统一支付接口封装各种支付方式
- 实现异步回调处理机制
- 建立订单状态同步机制
- 配置支付风控规则

## UI设计要求
- 支付页面设计简洁明了
- 支持多终端适配（Web、移动端、PC端）
- 支付过程中提供明确的状态反馈
- 错误处理友好提示

## 验收标准
- 支付成功率达到99.5%以上
- 支付响应时间3秒以内
- 支持并发1000笔/分钟的支付请求
- 通过安全性测试

## 风险评估
- 第三方支付接口稳定性风险
- 支付安全性风险
- 合规性风险
- 技术实现复杂度风险`,
    linkedRequirements: [mockRequirements[1]],
    tags: ['支付', '功能', '安全'],
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
  'prd-4': {
    id: 'prd-4',
    title: 'K线图实时更新优化PRD',
    version: 'v2.3',
    project: mockProjects[0],
    platform: 'Web端',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-22 09:15',
    createdAt: '2024-01-18 14:20',
    content: `# K线图实时更新优化PRD v2.3

## 项目背景
当前K线图的实时数据更新存在延迟和性能问题，需要优化数据更新机制，提升图表渲染性能，支持更多技术指标的实时计算。

## 需求概述
- 优化K线图实时数据更新机制
- 提升图表渲染性能
- 支持更多技术指标实时计算
- 改善用户交互体验

## 功能描述

### 1. 实时数据更新
- WebSocket连接优化
- 数据推送频率控制
- 断线重连机制
- 数据缓存策略

### 2. 图表渲染优化
- Canvas渲染引擎升级
- 虚拟渲染技术应用
- 图表缩放和拖拽优化
- 内存使用优化

### 3. 技术指标
- MACD指标
- RSI指标
- KDJ指标
- 布林带
- 移动平均线

### 4. 用户交互
- 鼠标悬停显示详情
- 点击选择时间点
- 键盘快捷键支持
- 手势操作支持（移动端）

## 技术方案
- 使用高性能Canvas库
- 实现数据流管道架构
- 采用Web Worker处理计算密集任务
- 建立缓存机制减少重复计算

## UI设计要求
- 保持现有K线图设计风格
- 优化加载状态提示
- 改进错误处理界面
- 增加性能监控面板

## 验收标准
- 数据更新延迟小于100ms
- 图表渲染帧率保持60fps
- 内存使用不超过50MB
- 支持同时显示10个技术指标

## 风险评估
- 技术复杂度较高
- 浏览器兼容性风险
- 性能优化效果不确定
- 用户习惯改变风险`,
    linkedRequirements: [mockRequirements[3]],
    tags: ['K线', '实时数据', '性能优化'],
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  }
};

// 模拟历史版本数据
const mockVersions: Version[] = [
  {
    id: 'v3',
    version: 'v2.1',
    content: '# PRD v2.1\\n\\n## 项目背景\\n第二个版本，增加了更多功能...',
    createdAt: '2024-01-20 14:30',
    creator: { id: '1', name: '张三', role: '产品经理' },
    comment: '功能增强版本'
  },
  {
    id: 'v2',
    version: 'v2.0',
    content: '# PRD v2.0\\n\\n## 项目背景\\n基础功能实现...',
    createdAt: '2024-01-15 09:15',
    creator: { id: '1', name: '张三', role: '产品经理' },
    comment: '基础版本'
  }
];

const statusLabels = {
  draft: { label: '草稿', variant: 'secondary' as const, icon: Edit, color: 'text-gray-500' },
  reviewing: { label: '评审中', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-500' },
  published: { label: '已发布', variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
  archived: { label: '已归档', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-400' }
};

export function PRDDetailPageFromRequirement({ context, onNavigate }: PRDDetailPageProps) {
  const [prd, setPrd] = useState<PRDItem | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    if (context?.prdId) {
      const foundPRD = mockPRDs[context.prdId];
      if (foundPRD) {
        setPrd(foundPRD);
        setCurrentContent(foundPRD.content || '');
        setCurrentVersion(foundPRD.version);
      }
    }
  }, [context?.prdId]);

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      if (context.returnTo === 'requirement-detail' && context.returnContext) {
        // 返回到需求详情页面
        onNavigate('requirement-detail', context.returnContext);
      } else {
        // 其他返回情况
        onNavigate(context.returnTo, context.returnContext);
      }
    }
  };

  const handleEdit = () => {
    if (prd && onNavigate) {
      onNavigate('prd', {
        mode: 'edit',
        prd: prd,
        returnTo: 'requirement-detail',
        returnContext: context?.returnContext
      });
    }
  };

  if (!prd) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-shrink-0 bg-background border-b p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回需求详情
            </Button>
            <div>
              <h1 className="text-2xl font-medium">PRD未找到</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">PRD不存在</h3>
            <p className="text-muted-foreground">找不到指定的PRD文档</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = statusLabels[prd.status] || statusLabels.draft;
  const StatusIcon = statusConfig.icon;

  // 合并当前版本和历史版本
  const allVersions = [
    {
      id: 'current',
      version: prd.version,
      content: prd.content || '',
      createdAt: prd.updatedAt,
      creator: prd.creator,
      comment: '当前版本'
    },
    ...mockVersions.filter(v => v.version !== prd.version)
  ];

  const handleVersionSwitch = (version: Version) => {
    setCurrentContent(version.content);
    setCurrentVersion(version.version);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回需求详情
            </Button>
            <div>
              <h1 className="text-2xl font-medium">{prd.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{currentVersion}</Badge>
                {currentVersion !== prd.version && (
                  <Badge variant="secondary" className="text-xs">
                    历史版本
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* PRD内容 */}
            <Card>
              <CardHeader>
                <CardTitle>PRD内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {currentContent || '暂无内容'}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* PRD讨论评论区 */}
            <PRDComments 
              prdId={prd.id} 
              currentUser={{ id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg' }} 
            />

            {/* 创建修改记录 */}
            <PRDHistory prdId={prd.id} />
          </div>

          {/* 右侧栏 */}
          <div className="space-y-6">
            {/* 1. 评审信息（第一位） */}
            {(prd.reviewer1 || prd.reviewer2) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    评审管理
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    PRD评审流程管理
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 评审总状态 */}
                  <div>
                    <Label className="text-xs text-muted-foreground">当前评审状态</Label>
                    <div className="mt-1 flex items-center gap-2">
                      {(() => {
                        let overallStatus = 'pending';
                        let icon = Clock;
                        let iconColor = 'text-orange-500';
                        
                        if (prd.reviewer2) {
                          // 有二级评审：需要两级都通过才算通过
                          if (prd.reviewer1Status === 'approved' && prd.reviewer2Status === 'approved') {
                            overallStatus = 'approved';
                            icon = CheckCircle;
                            iconColor = 'text-green-500';
                          } else if (prd.reviewer1Status === 'rejected' || prd.reviewer2Status === 'rejected') {
                            overallStatus = 'rejected';
                            icon = XCircle;
                            iconColor = 'text-red-500';
                          }
                        } else if (prd.reviewer1) {
                          // 只有一级评审：总状态等于一级状态
                          if (prd.reviewer1Status === 'approved') {
                            overallStatus = 'approved';
                            icon = CheckCircle;
                            iconColor = 'text-green-500';
                          } else if (prd.reviewer1Status === 'rejected') {
                            overallStatus = 'rejected';
                            icon = XCircle;
                            iconColor = 'text-red-500';
                          }
                        }
                        
                        const StatusIcon = icon;
                        
                        return (
                          <>
                            <StatusIcon className={`h-4 w-4 ${iconColor}`} />
                            <Badge variant={
                              overallStatus === 'approved' ? 'default' : 
                              overallStatus === 'rejected' ? 'destructive' : 
                              'secondary'
                            }>
                              {overallStatus === 'approved' ? '评审通过' : 
                               overallStatus === 'rejected' ? '评审不通过' : 
                               prd.reviewer2 && prd.reviewer1Status === 'approved' ? '二级评审中' :
                               prd.reviewer1Status === 'pending' ? '一级评审中' : '待评审'}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <Separator />

                  {/* 一级评审 */}
                  {prd.reviewer1 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">一级评审人</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prd.reviewer1.avatar} />
                            <AvatarFallback>{prd.reviewer1.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prd.reviewer1.name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            {prd.reviewer1Status === 'approved' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : prd.reviewer1Status === 'rejected' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {prd.reviewer1Status === 'approved' ? '已通过' : 
                               prd.reviewer1Status === 'rejected' ? '不通过' : 
                               '待评审'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 二级评审 */}
                  {prd.reviewer2 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">二级评审人</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prd.reviewer2.avatar} />
                            <AvatarFallback>{prd.reviewer2.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prd.reviewer2.name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            {prd.reviewer2Status === 'approved' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : prd.reviewer2Status === 'rejected' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {prd.reviewer2Status === 'approved' ? '已通过' : 
                               prd.reviewer2Status === 'rejected' ? '不通过' : 
                               '待评审'}
                            </span>
                          </div>
                        </div>
                        {prd.reviewer1Status !== 'approved' && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <AlertCircle className="h-3 w-3" />
                            需等待一级评审通过
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 如果没有评审人 */}
                  {!prd.reviewer1 && !prd.reviewer2 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">暂未指定评审人</div>
                      <div className="text-xs">请联系管理员配置评审人员</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 2. 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">应用端</Label>
                  <div className="mt-1 text-sm">{prd.platform || '未指定'}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">版本号</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{prd.version}</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">状态</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">创建人</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={prd.creator.avatar} />
                      <AvatarFallback>{prd.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{prd.creator.name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">创建时间</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{prd.createdAt}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">更新时间</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{prd.updatedAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. 关联需求 */}
            <PRDLinkedRequirements 
              linkedRequirements={prd.linkedRequirements || []}
              onLinkRequirement={(requirementId) => {
                console.log('关联需求:', requirementId);
              }}
              onUnlinkRequirement={(requirementId) => {
                console.log('取消关联需求:', requirementId);
              }}
              onNavigateToRequirement={(requirementId) => {
                onNavigate?.('requirement-detail', {
                  requirementId: requirementId,
                  source: 'prd-detail'
                });
              }}
              isEditable={false}
            />

            {/* 4. 历史版本 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  历史版本
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allVersions.map((version) => {
                    const isCurrent = version.version === currentVersion;
                    return (
                      <div 
                        key={version.id}
                        className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                          isCurrent 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                        }`}
                        onClick={() => handleVersionSwitch(version)}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant={isCurrent ? "default" : "outline"}>
                            {version.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {version.createdAt}
                          </span>
                        </div>
                        {version.comment && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {version.comment}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}