import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  ArrowLeft,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Plus,
  Calendar,
  Tag,
  Users,
  History
} from 'lucide-react';
import { Label } from './ui/label';
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

interface PRDViewerProps {
  prd: PRDItem;
  onBack: () => void;
  onEdit: () => void;
  onNavigate?: (page: string, context?: any) => void;
}

const mockRequirements: RequirementRef[] = [
  { id: '1', title: '用户注册流程优化', type: '功能需求' },
  { id: '2', title: '支付功能集成', type: '功能需求' },
  { id: '3', title: '数据导出功能', type: '产品建议' },
  { id: '4', title: '移动端适配优化', type: '技术需求' },
  { id: '5', title: 'K线图实时更新优化', type: '功能需求' },
  { id: '6', title: '行情推送服务升级', type: '技术需求' },
  { id: '7', title: '聊天室表情包功能', type: '产品建议' },
  { id: '8', title: '交易风控系统优化', type: '安全需求' },
];

// 模拟历史版本数据
const mockVersions: Version[] = [
  {
    id: 'v3',
    version: 'v2.1',
    content: '# 用户中心PRD v2.1\\n\\n## 项目背景\\n用户中心是整个平台的核心模块，当前版本对用户注册流程进行了全面优化...',
    createdAt: '2024-01-20 14:30',
    creator: { id: '1', name: '张三', role: '产品经理' },
    comment: '优化用户注册流程，提升用户体验'
  },
  {
    id: 'v2',
    version: 'v2.0',
    content: '# 用户中心PRD v2.0\\n\\n## 项目背景\\n用户中心基础功能实现，包含用户注册、登录、信息管理等核心功能...',
    createdAt: '2024-01-15 09:15',
    creator: { id: '1', name: '张三', role: '产品经理' },
    comment: '用户中心基础版本'
  },
  {
    id: 'v1',
    version: 'v1.0',
    content: '# 用户中心PRD v1.0\\n\\n## 项目背景\\n初始版本，实现基本的用户管理功能...',
    createdAt: '2024-01-10 11:20',
    creator: { id: '2', name: '李四', role: '产品经理' },
    comment: '初始版本'
  }
];

const statusLabels = {
  draft: { label: '草稿', variant: 'secondary' as const, icon: Edit, color: 'text-gray-500' },
  reviewing: { label: '评审中', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-500' },
  published: { label: '已发布', variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
  archived: { label: '已归档', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-400' }
};

export function PRDViewerUpdated({ prd, onBack, onEdit, onNavigate }: PRDViewerProps) {
  const [currentContent, setCurrentContent] = useState(prd.content || '');
  const [currentVersion, setCurrentVersion] = useState(prd.version);
  
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
    <div className="p-6 space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1>{prd.title}</h1>
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
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          编辑
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主内容区 - PRD内容、评论区、创建修改记录 */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRD内容 */}
          <Card>
            <CardHeader>
              <CardTitle>PRD内容</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
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
              // 这里应该更新PRD的关联需求
            }}
            onUnlinkRequirement={(requirementId) => {
              console.log('取消关联需求:', requirementId);
              // 这里应该移除PRD的关联需求
            }}
            onNavigateToRequirement={(requirementId) => {
              onNavigate?.('requirement-detail', {
                requirementId: requirementId,
                source: 'prd-detail'
              });
            }}
            isEditable={true}
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
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}