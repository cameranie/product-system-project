import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  FileText,
  Plus,
  XCircle
} from 'lucide-react';

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

// 模拟可关联的需求数据 - 只包含标题
const mockAvailableRequirements = [
  { id: 'req-001', title: '用户注册流程优化', type: '功能需求' },
  { id: 'req-002', title: '支付功能集成', type: '功能需求' },
  { id: 'req-003', title: 'K线图表性能优化', type: '技术需求' },
  { id: 'req-004', title: '行情推送服务升级', type: '功能需求' },
  { id: 'req-005', title: '聊天室表情包功能', type: '产品建议' },
  { id: 'req-006', title: '数据导出功能', type: '功能需求' },
  { id: 'req-007', title: '移动端适配优化', type: '技术需求' },
  { id: 'req-008', title: '系统监控面板', type: '功能需求' },
  { id: 'req-009', title: '用户权限管理', type: '功能需求' },
  { id: 'req-010', title: '数据可视化大屏', type: '功能需求' }
];

export function PRDLinkedRequirementsSimplified({ 
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
      const requirement = mockAvailableRequirements.find(req => req.id === selectedRequirement);
      if (requirement) {
        onLinkRequirement(selectedRequirement);
        setIsLinkDialogOpen(false);
        setSelectedRequirement('');
      }
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
  const availableRequirements = mockAvailableRequirements.filter(req => 
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
                  添加关联需求
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>选择关联需求</DialogTitle>
                  <DialogDescription>
                    选择一个需求与当前PRD建立关联关系
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Select value={selectedRequirement} onValueChange={setSelectedRequirement}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择需求" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRequirements.map(requirement => (
                        <SelectItem key={requirement.id} value={requirement.id}>
                          {requirement.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
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
            {linkedRequirements.map((requirement) => (
              <div 
                key={requirement.id} 
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => handleRequirementClick(requirement.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-primary hover:underline group-hover:underline">
                      {requirement.title}
                    </h4>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}