import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  FileText,
  Plus,
  XCircle
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

interface PrototypeLinkedRequirementsProps {
  linkedRequirement?: string; // 原型只支持关联单个需求
  onLinkRequirement?: (requirementId: string) => void;
  onUnlinkRequirement?: () => void;
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
    title: '用户中心交互原型 v2.0',
    description: '基于用户中心交互原型设计，实现用户注册登录流程，提升用户体验，增加第三方登录支持',
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
    title: '商品详情页交互优化',
    description: '优化商品详情页的用户交互体验，提升购买转化率',
    status: '待开发',
    priority: '中',
    type: '系统',
    creator: mockUsers[0],
    assignee: mockUsers[2],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-12 09:15',
    updatedAt: '2024-12-16 11:30',
    dueDate: '2024-12-30',
    progress: 0
  },
  {
    id: 'req-003',
    title: '订单管理功能升级',
    description: '完善订单管理功能，支持批量操作和状态筛选',
    status: '待开发',
    priority: '中',
    type: '系统',
    creator: mockUsers[0],
    plannedVersion: 'v2.2.0',
    createdAt: '2024-12-14 16:45',
    updatedAt: '2024-12-16 09:20',
    dueDate: '2025-01-10',
    progress: 0
  },
  {
    id: 'req-004',
    title: '支付流程原型设计',
    description: '基于支付流程原型设计，升级支付安全机制，增加风险检测和防护措施',
    status: '待开发',
    priority: '紧急',
    type: '交易',
    creator: mockUsers[0],
    assignee: mockUsers[3],
    plannedVersion: 'v2.0.5',
    createdAt: '2024-12-08 14:20',
    updatedAt: '2024-12-16 10:15',
    dueDate: '2024-12-22',
    progress: 45
  },
  {
    id: 'req-005',
    title: 'K线图表性能优化',
    description: '优化K线图表渲染性能，支持更大数据量展示',
    status: '测试中',
    priority: '高',
    type: 'K线',
    creator: mockUsers[1],
    assignee: mockUsers[4],
    plannedVersion: 'v2.1.0',
    createdAt: '2024-12-05 11:30',
    updatedAt: '2024-12-16 15:40',
    dueDate: '2024-12-28',
    progress: 85
  }
];

export function PrototypeLinkedRequirements({ 
  linkedRequirement, 
  onLinkRequirement,
  onUnlinkRequirement,
  onNavigateToRequirement,
  isEditable = true
}: PrototypeLinkedRequirementsProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState('');

  const handleLinkRequirement = () => {
    if (selectedRequirement && onLinkRequirement) {
      onLinkRequirement(selectedRequirement);
      setIsLinkDialogOpen(false);
      setSelectedRequirement('');
    }
  };

  const handleUnlinkRequirement = () => {
    if (onUnlinkRequirement) {
      onUnlinkRequirement();
    }
  };

  const handleRequirementClick = (requirementId: string) => {
    if (onNavigateToRequirement) {
      onNavigateToRequirement(requirementId);
    }
  };

  // 过滤掉已关联的需求
  const availableRequirements = mockRequirements.filter(req => 
    req.id !== linkedRequirement
  );

  // 查找关联的需求详情
  const linkedRequirementDetail = linkedRequirement 
    ? mockRequirements.find(req => req.id === linkedRequirement)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            关联需求
          </CardTitle>
          {isEditable && !linkedRequirementDetail && (
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  关联需求
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>选择关联需求</DialogTitle>
                  <DialogDescription>
                    选择一个需求与当前原型建立关联关系
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden">
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                    {availableRequirements.map(requirement => {
                      const isSelected = selectedRequirement === requirement.id;
                      
                      return (
                        <div
                          key={requirement.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                          }`}
                          onClick={() => {
                            setSelectedRequirement(isSelected ? '' : requirement.id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-sm leading-tight">
                                {requirement.title}
                              </h4>
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
        {!linkedRequirementDetail ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-2">暂无关联需求</h3>
            <p className="text-sm text-muted-foreground mb-4">
              为原型关联一个需求文档，建立文档与需求的追溯关系
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
            <div 
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => handleRequirementClick(linkedRequirementDetail.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-primary hover:underline group-hover:underline">
                    {linkedRequirementDetail.title}
                  </h4>
                </div>
                
                {isEditable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlinkRequirement();
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {isEditable && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLinkDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  更换关联需求
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}