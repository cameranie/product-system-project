'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { UI_SIZES } from '@/config/requirements';
import { useScheduledReview, type ScheduledReviewLevel } from '@/hooks/requirements/useScheduledReview';
import type { User } from '@/lib/requirements-store';

interface ScheduledReviewCardProps {
  initialLevels?: ScheduledReviewLevel[];
  availableReviewers: User[];
  currentUser?: User;
  editable?: boolean;
  onChange?: (levels: ScheduledReviewLevel[]) => void;
}

/**
 * 预排期评审卡片组件
 * 
 * 功能：
 * - 显示评审级别列表
 * - 添加/删除评审级别
 * - 选择评审人
 * - 填写评审意见
 * - 勾选评审状态（需权限）
 * 
 * @example
 * <ScheduledReviewCard
 *   initialLevels={mockLevels}
 *   availableReviewers={mockUsers}
 *   currentUser={mockUsers[0]}
 *   editable={true}
 * />
 */
export function ScheduledReviewCard({
  initialLevels = [],
  availableReviewers,
  currentUser,
  editable = true,
  onChange
}: ScheduledReviewCardProps) {
  const {
    reviewLevels,
    addReviewLevel,
    removeReviewLevel,
    updateReviewer,
    updateReviewStatus,
    updateReviewOpinion
  } = useScheduledReview({
    initialLevels,
    onChange
  });

  /**
   * 检查用户是否有权限修改评审状态和意见
   * 只有评审人本人才能修改
   */
  const canEditReview = (level: ScheduledReviewLevel) => {
    return editable && level.reviewer?.id === currentUser?.id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">预排期评审管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviewLevels.map((level, index) => (
          <div key={level.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{level.levelName}</Label>
              {editable && reviewLevels.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReviewLevel(level.id)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className={UI_SIZES.ICON.MEDIUM} />
                </Button>
              )}
            </div>

            {/* 评审人选择 */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">评审人</Label>
              <Select
                value={level.reviewer?.id || ''}
                onValueChange={(value) => {
                  const reviewer = availableReviewers.find(u => u.id === value);
                  if (reviewer) updateReviewer(level.id, reviewer);
                }}
                disabled={!editable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择评审人" />
                </SelectTrigger>
                <SelectContent>
                  {availableReviewers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 评审状态（仅评审人可修改） */}
            {level.reviewer && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">评审状态</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${level.id}-approved`}
                      checked={level.status === 'approved'}
                      onCheckedChange={(checked) => {
                        if (checked) updateReviewStatus(level.id, 'approved');
                      }}
                      disabled={!canEditReview(level)}
                    />
                    <Label 
                      htmlFor={`${level.id}-approved`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      通过
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${level.id}-rejected`}
                      checked={level.status === 'rejected'}
                      onCheckedChange={(checked) => {
                        if (checked) updateReviewStatus(level.id, 'rejected');
                      }}
                      disabled={!canEditReview(level)}
                    />
                    <Label 
                      htmlFor={`${level.id}-rejected`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      不通过
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* 评审意见（仅评审人可修改） */}
            {level.reviewer && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">评审意见</Label>
                <Textarea
                  placeholder="填写评审意见..."
                  value={level.opinion || ''}
                  onChange={(e) => updateReviewOpinion(level.id, e.target.value)}
                  disabled={!canEditReview(level)}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>
        ))}

        {/* 添加评审级别按钮 */}
        {editable && (
          <Button
            variant="outline"
            size="sm"
            onClick={addReviewLevel}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加评审级别
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 