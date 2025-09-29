import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  FileText,
  Plus,
  XCircle,
  Calendar,
  User,
  Tag,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Requirement {
  id: string;
  title: string;
  description?: string;
  status: '设计中' | '待开发' | '开发中' | '待测试' | '测试中' | '待上线' | '已上线' | '已关闭';
  priority: '低' | '中' | '高' | '紧急';
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  creator: User;
  assignee?: User;
  plannedVersion?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  progress?: number;
}

interface RequirementRef {
  id: string;
  title: string;
  type: string;
}

interface PRDLinkedRequirementsProps {
  linkedRequirements?: RequirementRef[];
  onLinkRequirement?: (requirementId: string) => void;
  onUnlinkRequirement?: (requirementId: string) => void;
  onNavigateToRequirement?: (requirementId: string) => void;
  isEditable?: boolean;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
];

const mockRequirements: Requirement[] = [
  {
    id: 'req-001',
    title: '用户注册流程优化',
    description: '优化用户注册流程，提升用户体验，增加第三方登录支持',
    status: '开发中',
    priority: '高',
    type: '系统',
    creator: mockUsers[0],
    assignee: mockUsers[1],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-10 10:30',
    updatedAt: '2024-12-15 14:20',
    dueDate: '2024-12-25',
    progress: 75
  },
  {
    id: 'req-002',
    title: '支付功能集成',
    description: '集成第三方支付系统，支持多种支付方式',
    status: '待开发',
    priority: '紧急',
    type: '交易',
    creator: mockUsers[0],
    assignee: mockUsers[2],
    plannedVersion: 'v2.0.5',
    createdAt: '2024-12-08 14:20',
    updatedAt: '2024-12-16 10:15',
    dueDate: '2024-12-22',
    progress: 0
  },
  {
    id: 'req-003',
    title: 'K线图表性能优化',
    description: '优化K线图表渲染性能，支持更大数据量展示',
    status: '测试中',
    priority: '高',
    type: 'K线',
    creator: mockUsers[0],
    assignee: mockUsers[3],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-05 11:30',
    updatedAt: '2024-12-16 15:40',
    dueDate: '2024-12-28',
    progress: 85
  },
  {
    id: 'req-004',
    title: '行情推送服务升级',
    description: '升级行情推送服务，提升实时性和稳定性',
    status: '已上线',
    priority: '中',
    type: '行情',
    creator: mockUsers[1],
    assignee: mockUsers[4],
    plannedVersion: 'v2.0.0',
    createdAt: '2024-11-20 09:15',
    updatedAt: '2024-12-10 16:30',
    dueDate: '2024-12-15',
    progress: 100
  },
  {
    id: 'req-005',
    title: '聊天室表情包功能',
    description: '为聊天室添加表情包功能，丰富用户交互体验',
    status: '设计中',
    priority: '低',
    type: '聊天室',
    creator: mockUsers[2],
    assignee: mockUsers[0],
    plannedVersion: 'v2.2.0',
    createdAt: '2024-12-12 11:45',
    updatedAt: '2024-12-16 09:20',
    dueDate: '2025-01-10',
    progress: 25
  }
];

const requirementStatusConfig = {
  '设计中': { icon: Edit, color: 'text-blue-500', variant: 'secondary' as const },
  '待开发': { icon: Clock, color: 'text-gray-500', variant: 'secondary' as const },
  '开发中': { icon: Target, color: 'text-blue-500', variant: 'default' as const },
  '待测试': { icon: AlertCircle, color: 'text-yellow-500', variant: 'outline' as const },
  '测试中': { icon: Target, color: 'text-orange-500', variant: 'outline' as const },
  '待上线': { icon: Clock, color: 'text-purple-500', variant: 'outline' as const },
  '已上线': { icon: CheckCircle, color: 'text-green-500', variant: 'default' as const },
  '已关闭': { icon: XCircle, color: 'text-red-500', variant: 'destructive' as const }
};

const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' }
};

const typeColors = {
  'K线': '#3b82f6',
  '行情': '#10b981', 
  '聊天室': '#f59e0b',
  '系统': '#ef4444',
  '交易': '#8b5cf6'
};

export function PRDLinkedRequirements({ 
  linkedRequirements = [], 
  onLinkRequirement,
  onUnlinkRequirement,
  onNavigateToRequirement,
  isEditable = true
}: PRDLinkedRequirementsProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState('');

  const handleLinkRequirement = () => {
    if (selectedRequirement && onLinkRequirement) {
      onLinkRequirement(selectedRequirement);
      setIsLinkDialogOpen(false);
      setSelectedRequirement('');
    }
  };

  const handleUnlinkRequirement = (requirementId: string) => {
    if (onUnlinkRequirement) {
      onUnlinkRequirement(requirementId);
    }
  };

  const handleRequirementClick = (requirementId: string) => {
    if (onNavigateToRequirement) {
      onNavigateToRequirement(requirementId);
    }
  };

  // 获取已关联的需求ID列表
  const linkedRequirementIds = linkedRequirements.map(req => req.id);
  
  // 过滤掉已关联的需求
  const availableRequirements = mockRequirements.filter(req => 
    !linkedRequirementIds.includes(req.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            关联需求
          </CardTitle>
          {isEditable && (
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {linkedRequirements.length > 0 ? '添加需求' : '关联需求'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>选择关联需求</DialogTitle>
                  <DialogDescription>
                    选择一个需求与当前PRD建立关联关系
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden">
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {availableRequirements.map(requirement => {
                      const isSelected = selectedRequirement === requirement.id;
                      const statusConfig = requirementStatusConfig[requirement.status] || requirementStatusConfig['待开发'];
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div
                          key={requirement.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                          }`}
                          onClick={() => {
                            setSelectedRequirement(isSelected ? '' : requirement.id);
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge
                                  variant="secondary"
                                  style={{ 
                                    backgroundColor: typeColors[requirement.type] + '20', 
                                    color: typeColors[requirement.type] 
                                  }}
                                  className="text-xs px-2 py-1"
                                >
                                  {requirement.type}
                                </Badge>
                                <Badge variant={statusConfig.variant} className="text-xs px-2 py-1">
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {requirement.status}
                                </Badge>
                                {requirement.priority && (
                                  <Badge 
                                    variant={priorityConfig[requirement.priority].variant}
                                    className={`text-xs px-2 py-1 ${priorityConfig[requirement.priority].className}`}
                                  >
                                    {requirement.priority}
                                  </Badge>
                                )}
                              </div>
                              
                              <h4 className="font-medium text-base leading-tight mb-2">
                                {requirement.title}
                              </h4>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {requirement.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {requirement.assignee && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {requirement.assignee.name}
                                  </div>
                                )}
                                {requirement.plannedVersion && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {requirement.plannedVersion}
                                  </div>
                                )}
                                {requirement.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {requirement.dueDate}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsLinkDialogOpen(false);
                      setSelectedRequirement('');
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    onClick={handleLinkRequirement}
                    disabled={!selectedRequirement}
                  >
                    确认关联
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {linkedRequirements.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-2">暂无关联需求</h3>
            <p className="text-sm text-muted-foreground mb-4">
              为PRD关联一个需求文档，建立文档与需求的追溯关系
            </p>
            {isEditable && (
              <Button 
                variant="outline"
                onClick={() => setIsLinkDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                关联需求
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {linkedRequirements.map((requirement) => {
              // 找到完整的需求信息
              const fullRequirement = mockRequirements.find(req => req.id === requirement.id);
              
              return (
                <div 
                  key={requirement.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleRequirementClick(requirement.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          style={{ 
                            backgroundColor: typeColors[requirement.type as keyof typeof typeColors] + '20', 
                            color: typeColors[requirement.type as keyof typeof typeColors] 
                          }}
                          className="text-xs px-2 py-1"
                        >
                          {requirement.type}
                        </Badge>
                        {fullRequirement && (
                          <>
                            <Badge 
                              variant={requirementStatusConfig[fullRequirement.status].variant} 
                              className="text-xs px-2 py-1"
                            >
                              {fullRequirement.status}
                            </Badge>
                            {fullRequirement.priority && (
                              <Badge 
                                variant={priorityConfig[fullRequirement.priority].variant}
                                className={`text-xs px-2 py-1 ${priorityConfig[fullRequirement.priority].className}`}
                              >
                                {fullRequirement.priority}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-primary hover:underline group-hover:underline mb-1">
                        {requirement.title}
                      </h4>
                      
                      {fullRequirement?.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {fullRequirement.description}
                        </p>
                      )}
                      
                      {fullRequirement && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {fullRequirement.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {fullRequirement.assignee.name}
                            </div>
                          )}
                          {fullRequirement.plannedVersion && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {fullRequirement.plannedVersion}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {fullRequirement.updatedAt}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isEditable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlinkRequirement(requirement.id);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}