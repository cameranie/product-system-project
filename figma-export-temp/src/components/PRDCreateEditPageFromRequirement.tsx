import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  ArrowLeft,
  Save,
  Send,
  X
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

interface PRDItem {
  id?: string;
  title: string;
  version?: string;
  project: Project;
  status: 'draft' | 'published' | 'reviewing' | 'archived';
  content?: string;
  linkedRequirements?: RequirementRef[];
  tags?: string[];
  reviewer1?: User;
  reviewer2?: User;
  isDraft?: boolean;
  platform?: string;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
}

interface PRDCreateEditPageProps {
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

// 格式化时间为 YYYY-MM-DD HH:mm
const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export function PRDCreateEditPageFromRequirement({ context, onNavigate }: PRDCreateEditPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 初始化PRD数据
  const initializePRD = () => {
    if (context?.mode === 'create' && context?.requirementId) {
      // 根据需求ID从需求数据中获取需求信息
      const getRequirementInfo = (requirementId: string) => {
        const requirementTitles: Record<string, string> = {
          '1': '用户注册流程优化',
          '2': '支付功能集成', 
          '3': '数据导出功能',
          '4': 'K线图实时更新优化',
          '5': '行情推送服务升级',
          '6': '交易风控系统优化'
        };
        return {
          title: requirementTitles[requirementId] || '未知需求',
          type: '功能需求'
        };
      };

      const requirementInfo = getRequirementInfo(context.requirementId);
      
      return {
        title: `${requirementInfo.title}PRD`,
        content: `# ${requirementInfo.title}PRD\n\n## 项目背景\n\n## 需求概述\n\n## 功能描述\n\n## 技术方案\n\n## UI设计要求\n\n## 验收标准\n\n## 风险评估`,
        project: mockProjects[0],
        status: 'draft' as const,
        linkedRequirements: [{
          id: context.requirementId,
          title: requirementInfo.title,
          type: requirementInfo.type
        }],
        attachments: [],
        tags: [],
        isDraft: true,
        reviewStatus: 'pending',
        reviewer1Status: 'pending' as const,
        reviewer2Status: 'pending' as const,
        platform: 'Web端',
        version: 'v1.0'
      };
    } else if (context?.mode === 'edit' && context?.prd) {
      return context.prd;
    }
    
    return {
      title: '',
      content: '',
      project: mockProjects[0],
      status: 'draft' as const,
      linkedRequirements: [],
      attachments: [],
      tags: [],
      isDraft: true,
      platform: 'Web端',
      version: 'v1.0'
    };
  };

  const [prdData, setPrdData] = useState<Partial<PRDItem>>(initializePRD);

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

  const handleCancel = () => {
    handleBack();
  };

  const handleSaveDraft = () => {
    // 模拟保存草稿
    console.log('保存PRD草稿:', prdData);
    
    // 返回需求详情页面
    handleBack();
  };

  const handleSubmit = () => {
    if (!prdData.title?.trim()) {
      alert('请输入PRD标题');
      return;
    }

    if (!prdData.content?.trim()) {
      alert('请输入PRD内容');
      return;
    }

    if (!prdData.reviewer1) {
      alert('请设置一级评审人员');
      return;
    }

    // 模拟提交PRD
    console.log('提交PRD:', prdData);
    
    // 返回需求详情页面
    handleBack();
  };

  const isEditMode = context?.mode === 'edit';
  const isCreateMode = context?.mode === 'create';

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
              <h1 className="text-2xl font-medium">
                {isEditMode ? '编辑PRD' : '创建PRD'}
              </h1>
              {context?.requirementId && (
                <p className="text-muted-foreground mt-1">
                  关联需求ID: {context.requirementId}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              保存草稿
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              提交评审
            </Button>
          </div>
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">PRD标题 *</Label>
                  <Input
                    id="title"
                    value={prdData.title || ''}
                    onChange={(e) => setPrdData({ ...prdData, title: e.target.value })}
                    placeholder="输入PRD标题"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">PRD内容 *</Label>
                  <Textarea
                    id="content"
                    value={prdData.content || ''}
                    onChange={(e) => setPrdData({ ...prdData, content: e.target.value })}
                    placeholder="输入PRD详细内容，支持Markdown格式"
                    className="min-h-[500px] mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* PRD讨论评论区 - 只在编辑已存在PRD时显示 */}
            {isEditMode && prdData.id && (
              <PRDComments 
                prdId={prdData.id} 
                currentUser={{ id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg' }} 
              />
            )}

            {/* 创建修改记录 - 只在编辑已存在PRD时显示 */}
            {isEditMode && prdData.id && (
              <PRDHistory prdId={prdData.id} />
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 基本设置 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform">应用端</Label>
                  <Select 
                    value={prdData.platform || undefined}
                    onValueChange={(value) => setPrdData({ ...prdData, platform: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择应用端" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web端">Web端</SelectItem>
                      <SelectItem value="移动端">移动端</SelectItem>
                      <SelectItem value="全平台">全平台</SelectItem>
                      <SelectItem value="PC端">PC端</SelectItem>
                      <SelectItem value="小程序">小程序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="version">版本号</Label>
                  <Input
                    id="version"
                    value={prdData.version || ''}
                    onChange={(e) => setPrdData({ ...prdData, version: e.target.value })}
                    placeholder="如: v1.0"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 评审设置 */}
            <Card>
              <CardHeader>
                <CardTitle>评审设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="reviewer1">一级评审人员 *</Label>
                  <Select 
                    value={prdData.reviewer1?.id || undefined} 
                    onValueChange={(value) => {
                      const reviewer = mockUsers.find(u => u.id === value);
                      setPrdData({ 
                        ...prdData, 
                        reviewer1: reviewer,
                        reviewer1Status: reviewer ? 'pending' : undefined
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择一级评审人员" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">({user.role})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="reviewer2">二级评审人员（可选）</Label>
                  <Select 
                    value={prdData.reviewer2?.id || 'none'} 
                    onValueChange={(value) => {
                      const reviewer = value !== 'none' ? mockUsers.find(u => u.id === value) : undefined;
                      setPrdData({ 
                        ...prdData, 
                        reviewer2: reviewer,
                        reviewer2Status: reviewer ? 'pending' : undefined
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择二级评审人员" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">({user.role})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 关联需求 */}
            <PRDLinkedRequirements 
              linkedRequirements={prdData.linkedRequirements || []}
              onLinkRequirement={(requirementId) => {
                // 这里应该根据requirementId找到完整的需求信息
                const requirement = { id: requirementId, title: `需求${requirementId}`, type: '功能需求' };
                setPrdData({ 
                  ...prdData, 
                  linkedRequirements: [...(prdData.linkedRequirements || []), requirement] 
                });
              }}
              onUnlinkRequirement={(requirementId) => {
                setPrdData({ 
                  ...prdData, 
                  linkedRequirements: prdData.linkedRequirements?.filter(req => req.id !== requirementId) || [] 
                });
              }}
              onNavigateToRequirement={(requirementId) => {
                onNavigate?.('requirement-detail', {
                  requirementId: requirementId,
                  source: 'prd-edit'
                });
              }}
              isEditable={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}