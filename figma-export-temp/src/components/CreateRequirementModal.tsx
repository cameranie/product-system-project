import { useState } from 'react';
import { X, Upload, Tag, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';


interface CreateRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requirement: any) => void;
}

const mockUsers = [
  { id: '1', name: '张三', avatar: '' },
  { id: '2', name: '李四', avatar: '' },
  { id: '3', name: '王五', avatar: '' },
  { id: '4', name: '赵六', avatar: '' },
];

const mockProjects = [
  { id: '1', name: 'K线' },
  { id: '2', name: '行情' },
  { id: '3', name: '聊天室' },
  { id: '4', name: '系统' },
  { id: '5', name: '交易' },
];

const mockVersions = [
  { id: '1', name: 'v1.0.0', status: '规划中' },
  { id: '2', name: 'v1.1.0', status: '开发中' },
  { id: '3', name: 'v1.2.0', status: '规划中' },
  { id: '4', name: 'v2.0.0', status: '规划中' },
];

const predefinedTags = ['UI优化', '性能', '安全', '用户体验', '移动端', '数据分析'];

export function CreateRequirementModal({ isOpen, onClose, onSubmit }: CreateRequirementModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    priority: '',
    description: '',
    project: '',
    plannedVersion: '',
    tags: [] as string[],
    attachments: [] as File[]
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // 计算默认大小：主内容区域的2/3宽度
  const defaultWidth = Math.floor((window.innerWidth - 280) * 2 / 3); // 减去左侧栏280px的2/3
  const defaultHeight = Math.floor((window.innerHeight - 60) * 0.8); // 减去顶部栏60px的80%
  const [modalSize, setModalSize] = useState({ 
    width: Math.max(600, defaultWidth), 
    height: Math.max(500, defaultHeight) 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 数据校验
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '需求标题不能为空';
    }
    if (!formData.type) {
      newErrors.type = '请选择需求类型';
    }
    if (!formData.priority) {
      newErrors.priority = '请选择优先级';
    }


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 提交数据
    const requirement = {
      ...formData,
      id: Date.now().toString(),
      status: '待处理',
      creator: '当前用户',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    onSubmit(requirement);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: '',
      priority: '',
      description: '',
      project: '',
      plannedVersion: '',
      tags: [],
      attachments: []
    });
    setErrors({});
    setNewTag('');
    // 重置弹窗大小和位置
    const defaultWidth = Math.floor((window.innerWidth - 280) * 2 / 3);
    const defaultHeight = Math.floor((window.innerHeight - 60) * 0.8);
    setModalSize({ 
      width: Math.max(600, defaultWidth), 
      height: Math.max(500, defaultHeight) 
    });
    onClose();
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div 
        data-modal="create-requirement"
        className="fixed bg-background border rounded-lg shadow-2xl"
        style={{
          width: `${modalSize.width}px`,
          height: `${modalSize.height}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '600px',
          minHeight: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <div className="h-full flex flex-col">
          {/* 标题栏 - 可拖拽 */}
          <div className="flex items-center justify-between p-6 border-b border-border cursor-move select-none"
               onMouseDown={(e) => {
                 const startX = e.clientX;
                 const startY = e.clientY;
                 const rect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                 if (!rect) return;
                 
                 const startLeft = rect.left;
                 const startTop = rect.top;
                 
                 const handleMouseMove = (e: MouseEvent) => {
                   const deltaX = e.clientX - startX;
                   const deltaY = e.clientY - startY;
                   const modal = document.querySelector('[data-modal="create-requirement"]');
                   if (modal instanceof HTMLElement) {
                     modal.style.left = `${startLeft + deltaX}px`;
                     modal.style.top = `${startTop + deltaY}px`;
                     modal.style.transform = 'none';
                   }
                 };
                 
                 const handleMouseUp = () => {
                   document.removeEventListener('mousemove', handleMouseMove);
                   document.removeEventListener('mouseup', handleMouseUp);
                 };
                 
                 document.addEventListener('mousemove', handleMouseMove);
                 document.addEventListener('mouseup', handleMouseUp);
               }}
          >
            <div>
              <h2 className="text-xl font-semibold">新建需求</h2>
              <p className="text-sm text-muted-foreground mt-1">
                填写需求的基本信息，创建后将通知相关处理人员
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-hidden">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* 需求标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">需求标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入需求标题"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                {/* 第一行：类型、优先级 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>需求类型 *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="选择需求类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="功能需求">功能需求</SelectItem>
                        <SelectItem value="产品建议">产品建议</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="技术需求">技术需求</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>优先级 *</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                        <SelectValue placeholder="选择优先级" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="低">低</SelectItem>
                        <SelectItem value="中">中</SelectItem>
                        <SelectItem value="高">高</SelectItem>
                        <SelectItem value="紧急">紧急</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
                  </div>
                </div>

                {/* 第二行：所属项目 */}
                <div className="space-y-2">
                  <Label>所属项目</Label>
                  <Select value={formData.project} onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择项目" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 第三行：预排期版本 */}
                <div className="space-y-2">
                  <Label>预排期版本</Label>
                  <Select value={formData.plannedVersion} onValueChange={(value) => setFormData(prev => ({ ...prev, plannedVersion: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择预排期版本" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVersions.map(version => (
                        <SelectItem key={version.id} value={version.name}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              version.status === '规划中' ? 'bg-gray-400' :
                              version.status === '开发中' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}></div>
                            {version.name} 
                            <span className="text-xs text-muted-foreground">({version.status})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">选择该需求计划加入的版本</p>
                </div>

                {/* 需求描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">需求描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述需求内容，包括背景、目标、功能要求、验收标准等..."
                    rows={8}
                    className="min-h-[200px] resize-y"
                  />
                </div>

                {/* 标签 */}
                <div className="space-y-2">
                  <Label>标签</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {predefinedTags.map(tag => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(tag)}
                          disabled={formData.tags.includes(tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="自定义标签"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                      />
                      <Button type="button" onClick={() => addTag(newTag)}>添加</Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {formData.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 附件上传 */}
                <div className="space-y-2">
                  <Label>附件</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          点击上传文件或拖拽文件到此处
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          支持图片、文档、压缩包等格式
                        </p>
                      </div>
                    </label>
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                            <span className="text-sm">{file.name}</span>
                            <X 
                              className="h-4 w-4 cursor-pointer hover:text-destructive" 
                              onClick={() => removeAttachment(index)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 提交按钮 - 固定在底部 */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button type="submit">
                  提交
                </Button>
              </div>
            </form>
          </div>

          {/* 调整大小手柄 */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-muted hover:bg-muted-foreground/20 rounded-tl-md"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = modalSize.width;
              const startHeight = modalSize.height;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const newWidth = Math.max(600, Math.min(window.innerWidth * 0.9, startWidth + deltaX));
                const newHeight = Math.max(500, Math.min(window.innerHeight * 0.9, startHeight + deltaY));
                
                setModalSize({ width: newWidth, height: newHeight });
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-muted-foreground/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}