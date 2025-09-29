import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  ArrowLeft,
  ExternalLink,
  Eye,
  Edit,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Label } from './ui/label';
import { PrototypeComments } from './PrototypeComments';
import { PrototypeHistory } from './PrototypeHistory';
import { PrototypeLinkedRequirements } from './PrototypeLinkedRequirementsSimplified';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}



interface Prototype {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Axure' | 'Sketch' | 'Adobe XD' | 'Principle' | 'Framer' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  prototypeUrl: string;
  embedUrl?: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isFavorite?: boolean;
  viewCount?: number;
  deviceType?: 'Web' | 'Mobile' | 'Tablet' | 'Desktop';
  requirementId?: string;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
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



const mockPrototypes: Prototype[] = [
  {
    id: '1',
    title: '用户中心交互原型 v2.0',
    description: '用户中心的完整交互流程设计，包含登录、注册、个人信息管理等功能模块的原型设计。支持用户信息编辑、头像上传、密码修改、账户安全设置等完整功能。',
    tool: 'Figma',
    status: '评审通过',
    priority: '高',
    prototypeUrl: 'https://www.figma.com/proto/abc123',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/abc123',
    creator: mockUsers[2],
    createdAt: '2024-12-10 14:30',
    updatedAt: '2024-12-16 09:15',
    tags: ['交互设计', '用户体验', '移动端'],
    isFavorite: true,
    viewCount: 25,
    deviceType: 'Web',
    requirementId: 'req-001',
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[3],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    reviewStatus: 'approved',
  },
  {
    id: '2',
    title: '支付流程原型设计',
    description: '支付系统的完整流程设计，确保支付安全性和用户体验',
    tool: 'Axure',
    status: '待评审',
    priority: '紧急',
    prototypeUrl: 'https://axure.com/proto/payment-flow',
    creator: mockUsers[7],
    createdAt: '2024-12-12 10:22',
    updatedAt: '2024-12-15 16:45',
    tags: ['支付', '安全', '流程设计'],
    isFavorite: false,
    viewCount: 12,
    deviceType: 'Mobile',
    requirementId: 'req-004',
    reviewer1: mockUsers[5],
    reviewer1Status: 'pending',
    reviewStatus: 'first_review',
  },
];

const deviceIcons = {
  'Web': Monitor,
  'Mobile': Smartphone,
  'Tablet': Tablet,
  'Desktop': Monitor
};

const deviceOptions = [
  { value: 'Web', label: 'Web端', icon: Monitor },
  { value: 'Mobile', label: '移动端', icon: Smartphone },
  { value: 'Tablet', label: '平板端', icon: Tablet },
  { value: 'Desktop', label: '桌面端', icon: Monitor }
];

interface PrototypeDetailPageProps {
  prototypeId?: string;
  requirementId?: string; // 新增：关联的需求ID
  returnTo?: string; // 新增：返回页面
  returnContext?: any; // 新增：返回时的上下文
  onNavigate?: (page: string, context?: any) => void;
}

export function PrototypeDetailPageUpdated({ 
  prototypeId, 
  requirementId,
  returnTo,
  returnContext,
  onNavigate 
}: PrototypeDetailPageProps) {
  // 根据ID查找原型，如果没有找到则使用第一个作为示例
  const prototype = mockPrototypes.find(p => p.id === prototypeId) || mockPrototypes[0];
  
  const handleBack = () => {
    if (onNavigate) {
      if (returnTo && returnContext) {
        // 返回到指定页面
        onNavigate(returnTo, returnContext);
      } else {
        // 默认返回原型管理页面
        onNavigate('prototype');
      }
    }
  };

  const handleEdit = () => {
    if (onNavigate) {
      onNavigate('prototype-edit', { prototypeId: prototype.id });
    }
  };

  const handleViewPrototype = () => {
    // 在新窗口打开原型
    window.open(prototype.prototypeUrl, '_blank');
  };

  const DeviceIcon = deviceIcons[prototype.deviceType || 'Web'];

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">{prototype.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {prototype.creator.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {prototype.viewCount || 0} 次查看
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    更新于 {prototype.updatedAt}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 原型预览 */}
            <Card>
              <CardHeader>
                <CardTitle>原型预览</CardTitle>
              </CardHeader>
              <CardContent>
                {prototype.embedUrl ? (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src={prototype.embedUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        无法嵌入预览，请点击查看原型链接
                      </p>
                      <Button onClick={handleViewPrototype}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        打开原型
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 原型讨论评论区 */}
            <PrototypeComments 
              prototypeId={prototype.id} 
              currentUser={{ id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg' }} 
            />

            {/* 创建修改记录 */}
            <PrototypeHistory prototypeId={prototype.id} />
          </div>

          {/* 右侧信息面板 */}
          <div className="space-y-6">
            {/* 评审信息 */}
            {(prototype.reviewer1 || prototype.reviewer2) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    评审管理
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    原型评审流程管理
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
                        
                        if (prototype.reviewer2) {
                          // 有二级评审：需要两级都通过才算通过
                          if (prototype.reviewer1Status === 'approved' && prototype.reviewer2Status === 'approved') {
                            overallStatus = 'approved';
                            icon = CheckCircle;
                            iconColor = 'text-green-500';
                          } else if (prototype.reviewer1Status === 'rejected' || prototype.reviewer2Status === 'rejected') {
                            overallStatus = 'rejected';
                            icon = XCircle;
                            iconColor = 'text-red-500';
                          }
                        } else if (prototype.reviewer1) {
                          // 只有一级评审：总状态等于一级状态
                          if (prototype.reviewer1Status === 'approved') {
                            overallStatus = 'approved';
                            icon = CheckCircle;
                            iconColor = 'text-green-500';
                          } else if (prototype.reviewer1Status === 'rejected') {
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
                               prototype.reviewer2 && prototype.reviewer1Status === 'approved' ? '二级评审中' :
                               prototype.reviewer1Status === 'pending' ? '一级评审中' : '待评审'}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <Separator />

                  {/* 一级评审 */}
                  {prototype.reviewer1 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">一级评审人</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prototype.reviewer1.avatar} />
                            <AvatarFallback>{prototype.reviewer1.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prototype.reviewer1.name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            {prototype.reviewer1Status === 'approved' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : prototype.reviewer1Status === 'rejected' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {prototype.reviewer1Status === 'approved' ? '已通过' : 
                               prototype.reviewer1Status === 'rejected' ? '不通过' : 
                               '待评审'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 二级评审 */}
                  {prototype.reviewer2 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">二级评审人</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prototype.reviewer2.avatar} />
                            <AvatarFallback>{prototype.reviewer2.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{prototype.reviewer2.name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            {prototype.reviewer2Status === 'approved' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : prototype.reviewer2Status === 'rejected' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {prototype.reviewer2Status === 'approved' ? '已通过' : 
                               prototype.reviewer2Status === 'rejected' ? '不通过' : 
                               '待评审'}
                            </span>
                          </div>
                        </div>
                        {prototype.reviewer1Status !== 'approved' && (
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <AlertCircle className="h-3 w-3" />
                            需等待一级评审通过
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 如果没有评审人 */}
                  {!prototype.reviewer1 && !prototype.reviewer2 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">暂未指定评审人</div>
                      <div className="text-xs">请联系管理员配置评审人员</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">应用端</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {deviceOptions.find(d => d.value === prototype.deviceType)?.label || 'Web端'}
                    </span>
                  </div>
                </div>



                <div>
                  <Label className="text-xs text-muted-foreground">优先级</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        prototype.priority === '紧急' ? 'destructive' :
                        prototype.priority === '高' ? 'default' :
                        prototype.priority === '中' ? 'secondary' : 'outline'
                      }
                    >
                      {prototype.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">设计工具</Label>
                  <div className="mt-1">
                    <span className="text-sm">{prototype.tool}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">创建人</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={prototype.creator.avatar} />
                      <AvatarFallback>{prototype.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{prototype.creator.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 关联需求 */}
            <PrototypeLinkedRequirements 
              linkedRequirement={prototype.requirementId}
              onLinkRequirement={(requirementId) => {
                console.log('关联需求:', requirementId);
                // 这里应该更新原型的关联需求
              }}
              onUnlinkRequirement={() => {
                console.log('取消关联需求:', prototype.requirementId);
                // 这里应该移除原型的关联需求
              }}
              onNavigateToRequirement={(requirementId) => {
                onNavigate?.('requirement-detail', {
                  requirementId: requirementId,
                  source: 'prototype-detail'
                });
              }}
              isEditable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}