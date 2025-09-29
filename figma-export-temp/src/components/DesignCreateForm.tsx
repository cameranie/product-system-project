import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DesignLinkedRequirements } from './DesignLinkedRequirementsSimplified';
import { ArrowLeft, Save, X } from 'lucide-react';

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
}

interface DesignCreateFormProps {
  requirementId?: string;
  requirementTitle?: string;
  onSave: (design: Partial<Design>) => void;
  onCancel: () => void;
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

const platforms = ['Web端', '移动端', '全平台', 'PC端', '小程序'];
const toolOptions = ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Other'];
const statusOptions = ['设计中', '待评审', '评审中', '评审通过', '需修改', '已上线'];
const priorityOptions = ['低', '中', '高', '紧急'];
const designTypeOptions = ['UI设计', '视觉设计', '图标设计', '插画设计'];

export function DesignCreateForm({ 
  requirementId, 
  requirementTitle, 
  onSave, 
  onCancel 
}: DesignCreateFormProps) {
  const [formData, setFormData] = useState<Partial<Design>>({
    title: requirementTitle ? `${requirementTitle} - UI设计稿` : '',
    description: requirementTitle ? `基于需求"${requirementTitle}"的UI设计稿` : '',
    tool: 'Figma',
    status: '设计中',
    priority: '中',
    designUrl: '',
    creator: mockUsers[2], // 默认设计师
    project: mockProjects[0],
    platform: 'Web端',
    tags: [],
    designType: 'UI设计',
    requirementId: requirementId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.designUrl) {
      alert('请填写设计名称和设计链接');
      return;
    }

    onSave(formData);
  };

  const handleChange = (field: keyof Design, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">设计名称 *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="请输入设计名称"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">设计描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="请输入设计描述"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="designUrl">设计链接 *</Label>
                  <Input
                    id="designUrl"
                    value={formData.designUrl || ''}
                    onChange={(e) => handleChange('designUrl', e.target.value)}
                    placeholder="https://www.figma.com/design/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tool">设计工具</Label>
                  <Select 
                    value={formData.tool} 
                    onValueChange={(value) => handleChange('tool', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toolOptions.map(tool => (
                        <SelectItem key={tool} value={tool}>
                          {tool}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="designType">设计类型</Label>
                  <Select 
                    value={formData.designType} 
                    onValueChange={(value) => handleChange('designType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {designTypeOptions.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform">应用端</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => handleChange('platform', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project">所属项目</Label>
                  <Select 
                    value={formData.project?.id} 
                    onValueChange={(value) => {
                      const project = mockProjects.find(p => p.id === value);
                      handleChange('project', project);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">优先级</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">状态</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              保存设计
            </Button>
          </div>
        </form>
      </div>

      {/* 右侧信息面板 */}
      <div className="space-y-6">
        {/* 关联需求 */}
        <DesignLinkedRequirements 
          linkedRequirement={formData.requirementId}
          onLinkRequirement={(requirementId) => {
            handleChange('requirementId', requirementId);
          }}
          onUnlinkRequirement={() => {
            handleChange('requirementId', undefined);
          }}
          onNavigateToRequirement={(requirementId) => {
            // 这里可以添加导航到需求详情的逻辑
            console.log('Navigate to requirement:', requirementId);
          }}
          isEditable={true}
        />
      </div>
    </div>
  );
}