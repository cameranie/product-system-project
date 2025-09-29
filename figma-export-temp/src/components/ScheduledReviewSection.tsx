import React, { useState } from 'react';
import { Plus, X, UserCheck, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface ReviewLevel {
  id: string;
  level: number;
  levelName: string;
  reviewer?: User;
  status: 'pending' | 'approved' | 'rejected';
  opinion?: string;
  reviewedAt?: string;
}

export interface ScheduledReviewData {
  reviewLevels: ReviewLevel[];
}

interface ScheduledReviewSectionProps {
  data?: ScheduledReviewData;
  onChange?: (data: ScheduledReviewData) => void;
  isEditable?: boolean;
  showTitle?: boolean;
}

// 模拟评审人员数据
const mockReviewers: User[] = [
  { id: '1', name: '林嘉娜', avatar: '', email: 'linjiana@example.com' },
  { id: '2', name: '叶裴锋', avatar: '', email: 'yepengfeng@example.com' },
  { id: '3', name: '谢焰明', avatar: '', email: 'xieyanming@example.com' },
  { id: '4', name: '卢兆锋', avatar: '', email: 'luzhaofeng@example.com' },
  { id: '5', name: '陆柏良', avatar: '', email: 'lubailiang@example.com' },
  { id: '6', name: '杜韦志', avatar: '', email: 'duweizhi@example.com' },
  { id: '7', name: '温明震', avatar: '', email: 'wenmingzhen@example.com' },
];

// 评审状态配置
const reviewStatusConfig = {
  pending: { 
    label: '待评审', 
    icon: Clock, 
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80' 
  },
  approved: { 
    label: '已通过', 
    icon: CheckCircle, 
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80' 
  },
  rejected: { 
    label: '已拒绝', 
    icon: XCircle, 
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80' 
  }
};

export function ScheduledReviewSection({ 
  data, 
  onChange, 
  isEditable = false, 
  showTitle = true 
}: ScheduledReviewSectionProps) {
  const [reviewData, setReviewData] = useState<ScheduledReviewData>(
    data || {
      reviewLevels: [
        {
          id: '1',
          level: 1,
          levelName: '一级评审',
          status: 'pending'
        },
        {
          id: '2',
          level: 2,
          levelName: '二级评审',
          status: 'pending'
        }
      ]
    }
  );

  const handleDataChange = (newData: ScheduledReviewData) => {
    setReviewData(newData);
    onChange?.(newData);
  };

  const addReviewLevel = () => {
    const maxLevel = Math.max(...reviewData.reviewLevels.map(r => r.level), 0);
    const newLevel: ReviewLevel = {
      id: Date.now().toString(),
      level: maxLevel + 1,
      levelName: `${maxLevel + 1}级评审`,
      status: 'pending'
    };

    handleDataChange({
      ...reviewData,
      reviewLevels: [...reviewData.reviewLevels, newLevel]
    });
  };

  const removeReviewLevel = (levelId: string) => {
    if (reviewData.reviewLevels.length <= 1) return; // 至少保留一级

    handleDataChange({
      ...reviewData,
      reviewLevels: reviewData.reviewLevels.filter(r => r.id !== levelId)
    });
  };

  const updateReviewLevel = (levelId: string, updates: Partial<ReviewLevel>) => {
    handleDataChange({
      ...reviewData,
      reviewLevels: reviewData.reviewLevels.map(r =>
        r.id === levelId ? { ...r, ...updates } : r
      )
    });
  };

  const handleReviewerChange = (levelId: string, reviewerId: string) => {
    const reviewer = mockReviewers.find(r => r.id === reviewerId);
    updateReviewLevel(levelId, { reviewer });
  };

  const handleStatusChange = (levelId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updates: Partial<ReviewLevel> = { status };
    if (status !== 'pending') {
      updates.reviewedAt = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
    } else {
      updates.reviewedAt = undefined;
    }
    updateReviewLevel(levelId, updates);
  };

  const handleOpinionChange = (levelId: string, opinion: string) => {
    updateReviewLevel(levelId, { opinion });
  };

  const handleLevelNameChange = (levelId: string, levelName: string) => {
    updateReviewLevel(levelId, { levelName });
  };

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            预排期评审
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            需求预排期阶段的评审流程管理
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {reviewData.reviewLevels.map((level, index) => {
          const StatusIcon = reviewStatusConfig[level.status].icon;
          
          return (
            <div key={level.id} className="border rounded-lg p-4 space-y-4">
              {/* 评审级别标题 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEditable ? (
                    <input
                      type="text"
                      value={level.levelName}
                      onChange={(e) => handleLevelNameChange(level.id, e.target.value)}
                      className="text-sm font-medium bg-transparent border-none outline-none focus:bg-muted/30 rounded px-1"
                    />
                  ) : (
                    <Label className="text-sm font-medium">{level.levelName}</Label>
                  )}
                  <Badge className={reviewStatusConfig[level.status].className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {reviewStatusConfig[level.status].label}
                  </Badge>
                </div>
                {isEditable && reviewData.reviewLevels.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReviewLevel(level.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* 评审人员选择 */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">评审人员</Label>
                {isEditable ? (
                  <Select
                    value={level.reviewer?.id || ''}
                    onValueChange={(value) => handleReviewerChange(level.id, value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="选择评审人员" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockReviewers.map(reviewer => (
                        <SelectItem key={reviewer.id} value={reviewer.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {reviewer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{reviewer.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    {level.reviewer ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {level.reviewer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{level.reviewer.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">未分配</span>
                    )}
                  </div>
                )}
              </div>

              {/* 评审状态 */}
              {isEditable && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">评审状态</Label>
                  <Select
                    value={level.status}
                    onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                      handleStatusChange(level.id, value)
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待评审</SelectItem>
                      <SelectItem value="approved">已通过</SelectItem>
                      <SelectItem value="rejected">已拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 评审时间 */}
              {level.reviewedAt && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">评审时间</Label>
                  <div className="text-sm">{level.reviewedAt}</div>
                </div>
              )}

              {/* 评审意见 */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">评审意见</Label>
                {isEditable ? (
                  <Textarea
                    value={level.opinion || ''}
                    onChange={(e) => handleOpinionChange(level.id, e.target.value)}
                    placeholder="请输入评审意见（可不填）..."
                    className="min-h-[80px] text-sm"
                  />
                ) : (
                  <div className="min-h-[60px] p-3 bg-muted/30 rounded-lg">
                    {level.opinion ? (
                      <p className="text-sm">{level.opinion}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">暂无评审意见</p>
                    )}
                  </div>
                )}
              </div>

              {index < reviewData.reviewLevels.length - 1 && (
                <Separator className="!mt-4" />
              )}
            </div>
          );
        })}

        {/* 添加评审级别按钮 */}
        {isEditable && (
          <Button
            variant="outline"
            size="sm"
            onClick={addReviewLevel}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加评审级别
          </Button>
        )}
      </CardContent>
    </Card>
  );
}