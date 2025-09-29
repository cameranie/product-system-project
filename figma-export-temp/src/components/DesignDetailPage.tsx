import React, { useState } from 'react';
import { 
  ArrowLeft,
  Edit,
  ExternalLink,
  Eye,
  Star,
  Share2,
  Download,
  MessageSquare,
  Clock,
  User,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

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

interface Design {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Sketch' | 'Adobe XD' | 'Photoshop' | 'Illustrator' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  designUrl: string;
  embedUrl?: string;
  creator: User;
  project?: Project;
  platform?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  designType?: 'UI设计' | '视觉设计' | '图标设计' | '插画设计';
  requirementId?: string;
  viewCount?: number;
  isFavorite?: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
}

interface DesignDetailPageProps {
  designId: string;
  onNavigate?: (page: string, context?: any) => void;
  returnTo?: string;
  returnContext?: any;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' },
];

const mockDesigns: Design[] = [
  {
    id: 'design-2',
    title: '支付功能集成 - UI设计稿',
    description: '基于需求"支付功能集成"的UI设计稿，包含支付宝、微信支付、银行卡支付等多种支付方式的界面设计',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    designUrl: 'https://www.figma.com/design/payment-integration-ui',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/design/payment-integration-ui',
    creator: mockUsers[2],
    project: mockProjects[4], // 交易项目
    platform: '全平台',
    createdAt: '2024-01-11 14:20',
    updatedAt: '2024-01-19 16:30',
    tags: ['支付', '界面设计', 'UI', '全平台'],
    isFavorite: true,
    viewCount: 28,
    designType: 'UI设计',
    requirementId: '2', // 关联支付功能集成需求
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
  }
];

const statusConfig = {
  '设计中': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  '待评审': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  '评审中': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  '评审通过': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200' },
  '需修改': { variant: 'secondary' as const, className: 'bg-red-100 text-red-800 border-red-200' },
  '已上线': { variant: 'secondary' as const, className: 'bg-purple-100 text-purple-800 border-purple-200' }
};

const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' }
};

const reviewerStatusLabels = {
  pending: { label: '待评审', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved: { label: '已通过', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: '已拒绝', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200' }
};

export function DesignDetailPage({ 
  designId, 
  onNavigate, 
  returnTo, 
  returnContext 
}: DesignDetailPageProps) {
  const [design, setDesign] = useState<Design | null>(
    mockDesigns.find(d => d.id === designId) || null
  );

  if (!design) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">设计稿未找到</h2>
          <p className="text-muted-foreground mb-4">指定的设计稿不存在或已被删除</p>
          <Button onClick={() => handleBack()}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (returnTo && returnContext && onNavigate) {
      onNavigate(returnTo, returnContext);
    } else if (returnTo && onNavigate) {
      onNavigate(returnTo);
    } else if (onNavigate) {
      onNavigate('design-management');
    }
  };

  const handleEdit = () => {
    if (onNavigate) {
      onNavigate('design-edit', { 
        designId: design.id, 
        returnTo: 'design-detail',
        returnContext: { designId, returnTo, returnContext }
      });
    }
  };

  const handleOpenDesign = () => {
    if (design.designUrl) {
      window.open(design.designUrl, '_blank');
    }
  };

  const handleToggleFavorite = () => {
    setDesign(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-medium">{design.title}</h1>
              <p className="text-muted-foreground mt-1">查看设计详情和相关信息</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
              <Star className={`h-4 w-4 mr-2 ${design.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
              {design.isFavorite ? '已收藏' : '收藏'}
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
            <Button onClick={handleOpenDesign}>
              <ExternalLink className="h-4 w-4 mr-2" />
              打开设计
            </Button>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 设计预览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  设计预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                {design.embedUrl ? (
                  <div className="w-full h-96 border rounded-lg overflow-hidden">
                    <iframe
                      src={design.embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 border rounded-lg flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">无预览可用</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleOpenDesign}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        打开原始设计
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 设计描述 */}
            {design.description && (
              <Card>
                <CardHeader>
                  <CardTitle>设计描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {design.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 评审信息 */}
            {(design.reviewer1 || design.reviewer2) && (
              <Card>
                <CardHeader>
                  <CardTitle>评审信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {design.reviewer1 && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={design.reviewer1.avatar} />
                          <AvatarFallback>{design.reviewer1.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{design.reviewer1.name}</div>
                          <div className="text-xs text-muted-foreground">一级评审</div>
                        </div>
                      </div>
                      {design.reviewer1Status && (
                        <Badge 
                          variant="secondary" 
                          className={reviewerStatusLabels[design.reviewer1Status].className}
                        >
                          {React.createElement(reviewerStatusLabels[design.reviewer1Status].icon, {
                            className: "h-3 w-3 mr-1"
                          })}
                          {reviewerStatusLabels[design.reviewer1Status].label}
                        </Badge>
                      )}
                    </div>
                  )}

                  {design.reviewer2 && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={design.reviewer2.avatar} />
                          <AvatarFallback>{design.reviewer2.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{design.reviewer2.name}</div>
                          <div className="text-xs text-muted-foreground">二级评审</div>
                        </div>
                      </div>
                      {design.reviewer2Status && (
                        <Badge 
                          variant="secondary" 
                          className={reviewerStatusLabels[design.reviewer2Status].className}
                        >
                          {React.createElement(reviewerStatusLabels[design.reviewer2Status].icon, {
                            className: "h-3 w-3 mr-1"
                          })}
                          {reviewerStatusLabels[design.reviewer2Status].label}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边信息 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">状态</div>
                    <Badge 
                      variant="secondary" 
                      className={statusConfig[design.status].className}
                    >
                      {design.status}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">优先级</div>
                    <Badge 
                      variant="secondary" 
                      className={priorityConfig[design.priority].className}
                    >
                      {design.priority}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">设计工具</div>
                    <div className="text-sm">{design.tool}</div>
                  </div>

                  {design.designType && (
                    <div>
                      <div className="text-sm text-muted-foreground">设计类型</div>
                      <div className="text-sm">{design.designType}</div>
                    </div>
                  )}

                  {design.platform && (
                    <div>
                      <div className="text-sm text-muted-foreground">应用端</div>
                      <div className="text-sm">{design.platform}</div>
                    </div>
                  )}

                  {design.project && (
                    <div>
                      <div className="text-sm text-muted-foreground">所属项目</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: design.project.color }}
                        />
                        <span className="text-sm">{design.project.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">创建人</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={design.creator.avatar} />
                        <AvatarFallback>{design.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{design.creator.name}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">创建时间</div>
                    <div className="text-sm">{design.createdAt}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">更新时间</div>
                    <div className="text-sm">{design.updatedAt}</div>
                  </div>

                  {typeof design.viewCount === 'number' && (
                    <div>
                      <div className="text-sm text-muted-foreground">查看次数</div>
                      <div className="text-sm">{design.viewCount}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 标签 */}
            {design.tags && design.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    标签
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {design.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 相关需求 */}
            {design.requirementId && (
              <Card>
                <CardHeader>
                  <CardTitle>相关需求</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('requirement-detail', { 
                          requirementId: design.requirementId,
                          source: 'design-detail'
                        });
                      }
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    查看关联需求
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}