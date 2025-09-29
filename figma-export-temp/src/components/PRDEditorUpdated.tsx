import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  ArrowLeft,
  Save,
  Send
} from 'lucide-react';
import { PRDComments } from './PRDComments';
import { PRDHistory } from './PRDHistory';
import { PRDLinkedRequirementsSimplified } from './PRDLinkedRequirementsSimplified';

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
}

interface PRDEditorProps {
  prd: Partial<PRDItem>;
  setPrd: (prd: Partial<PRDItem>) => void;
  onBack: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment?: (id: string) => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onNavigateToRequirement?: (requirementId: string) => void;
  projects?: Project[];
  users?: User[];
  requirements?: RequirementRef[];
  tasks?: any[];
  onProjectChange?: (projectId: string) => void;
  onPlatformChange?: (platform: string) => void;
  onReviewer1Change?: (userId: string | null) => void;
  onReviewer2Change?: (userId: string | null) => void;
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

export function PRDEditorUpdated({ 
  prd, 
  setPrd, 
  onBack, 
  onCancel, 
  onSaveDraft, 
  onSubmit,
  onNavigateToRequirement,
  projects = mockProjects,
  users = mockUsers,
  onProjectChange,
  onPlatformChange,
  onReviewer1Change,
  onReviewer2Change
}: PRDEditorProps) {
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
            <h1 className="text-2xl font-semibold">
              {prd.id ? '编辑PRD' : '新建PRD'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            保存草稿
          </Button>
          <Button onClick={onSubmit}>
            <Send className="h-4 w-4 mr-2" />
            提交
          </Button>
        </div>
      </div>

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
                <Label htmlFor="title">PRD标题</Label>
                <Input
                  id="title"
                  value={prd.title || ''}
                  onChange={(e) => setPrd({ ...prd, title: e.target.value })}
                  placeholder="输入PRD标题"
                />
              </div>
              
              <div>
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  value={prd.content || ''}
                  onChange={(e) => setPrd({ ...prd, content: e.target.value })}
                  placeholder="输入PRD内容"
                  className="min-h-[400px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* PRD讨论评论区 - 只在编辑已存在PRD时显示 */}
          {prd.id && (
            <PRDComments 
              prdId={prd.id} 
              currentUser={{ id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg' }} 
            />
          )}

          {/* 创建修改记录 - 只在编辑已存在PRD时显示 */}
          {prd.id && (
            <PRDHistory prdId={prd.id} />
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
                  value={prd.platform || undefined}
                  onValueChange={(value) => {
                    setPrd({ ...prd, platform: value });
                    onPlatformChange?.(value);
                  }}
                >
                  <SelectTrigger>
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
                  value={prd.version || ''}
                  onChange={(e) => setPrd({ ...prd, version: e.target.value })}
                  placeholder="如: v1.0"
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
                <Label htmlFor="reviewer1">一级评审人员</Label>
                <Select 
                  value={prd.reviewer1?.id || undefined} 
                  onValueChange={(value) => {
                    const reviewer = users.find(u => u.id === value);
                    setPrd({ ...prd, reviewer1: reviewer });
                    onReviewer1Change?.(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择一级评审人员" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {prd.reviewer1 && (
                  <div>
                    <Label htmlFor="reviewer1Status">一级评审状态</Label>
                    <Select 
                      value={prd.reviewer1Status || 'pending'} 
                      onValueChange={(value) => {
                        setPrd({ ...prd, reviewer1Status: value as 'pending' | 'approved' | 'rejected' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择评审状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待评审</SelectItem>
                        <SelectItem value="approved">已通过</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="reviewer2">二级评审人员（可选）</Label>
                <Select 
                  value={prd.reviewer2?.id || 'none'} 
                  onValueChange={(value) => {
                    const reviewer = value !== 'none' ? users.find(u => u.id === value) : undefined;
                    setPrd({ ...prd, reviewer2: reviewer });
                    onReviewer2Change?.(value !== 'none' ? value : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择二级评审人员" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {prd.reviewer2 && (
                  <div>
                    <Label htmlFor="reviewer2Status">二级评审状态</Label>
                    <Select 
                      value={prd.reviewer2Status || 'pending'} 
                      onValueChange={(value) => {
                        setPrd({ ...prd, reviewer2Status: value as 'pending' | 'approved' | 'rejected' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择评审状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待评审</SelectItem>
                        <SelectItem value="approved">已通过</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 关联需求 */}
          <PRDLinkedRequirementsSimplified 
            linkedRequirements={prd.linkedRequirements || []}
            onLinkRequirement={(requirementId) => {
              // 根据requirementId找到需求信息（模拟从需求库获取）
              const requirementTitles: Record<string, string> = {
                'req-001': '用户注册流程优化',
                'req-002': '支付功能集成',
                'req-003': 'K线图表性能优化',
                'req-004': '行情推送服务升级',
                'req-005': '聊天室表情包功能',
                'req-006': '数据导出功能',
                'req-007': '移动端适配优化',
                'req-008': '系统监控面板',
                'req-009': '用户权限管理',
                'req-010': '数据可视化大屏'
              };
              
              const requirement = { 
                id: requirementId, 
                title: requirementTitles[requirementId] || '未知需求', 
                type: '功能需求' 
              };
              
              setPrd({ 
                ...prd, 
                linkedRequirements: [...(prd.linkedRequirements || []), requirement] 
              });
            }}
            onUnlinkRequirement={(requirementId) => {
              setPrd({ 
                ...prd, 
                linkedRequirements: prd.linkedRequirements?.filter(req => req.id !== requirementId) || [] 
              });
            }}
            onNavigateToRequirement={onNavigateToRequirement}
            isEditable={true}
          />
        </div>
      </div>
    </div>
  );
}