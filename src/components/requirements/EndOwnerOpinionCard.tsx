'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/lib/requirements-store';
import { PRIORITY_CONFIG, NEED_TO_DO_CONFIG } from '@/config/requirements';

/**
 * 端负责人意见数据接口
 */
export interface EndOwnerOpinionData {
  needToDo?: '是' | '否';
  priority?: '低' | '中' | '高' | '紧急';
  opinion?: string;
  owner?: User;
}

interface EndOwnerOpinionCardProps {
  opinion: EndOwnerOpinionData;
  availableOwners: User[];
  currentUser?: User;
  editable?: boolean;
  onChange?: (opinion: EndOwnerOpinionData) => void;
}

/**
 * 端负责人意见卡片组件
 * 
 * 功能：
 * - 选择端负责人
 * - 设置是否要做（需权限）
 * - 设置优先级（需权限）
 * - 填写意见（需权限）
 * 
 * 权限规则：
 * - 所有人可以选择端负责人
 * - 只有端负责人本人可以修改是否要做、优先级和意见
 * 
 * @example
 * <EndOwnerOpinionCard
 *   opinion={mockOpinion}
 *   availableOwners={mockUsers}
 *   currentUser={mockUsers[0]}
 *   editable={true}
 * />
 */
export function EndOwnerOpinionCard({
  opinion,
  availableOwners,
  currentUser,
  editable = true,
  onChange
}: EndOwnerOpinionCardProps) {
  /**
   * 检查用户是否有权限修改端负责人意见
   * 只有端负责人本人才能修改
   */
  const canEditOpinion = editable && opinion.owner?.id === currentUser?.id;

  /**
   * 更新端负责人意见
   */
  const handleUpdate = (updates: Partial<EndOwnerOpinionData>) => {
    onChange?.({ ...opinion, ...updates });
  };

  /**
   * 处理是否要做的勾选（互斥）
   */
  const handleNeedToDoChange = (value: '是' | '否') => {
    if (opinion.needToDo === value) {
      // 如果点击已选中的选项，则取消选择
      handleUpdate({ needToDo: undefined });
    } else {
      handleUpdate({ needToDo: value });
    }
  };

  /**
   * 处理优先级的勾选（互斥）
   */
  const handlePriorityChange = (value: '低' | '中' | '高' | '紧急') => {
    if (opinion.priority === value) {
      // 如果点击已选中的选项，则取消选择
      handleUpdate({ priority: undefined });
    } else {
      handleUpdate({ priority: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">端负责人意见</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 端负责人选择 */}
        <div className="space-y-2">
          <Label className="text-sm">端负责人</Label>
          <Select
            value={opinion.owner?.id || ''}
            onValueChange={(value) => {
              const owner = availableOwners.find(u => u.id === value);
              if (owner) handleUpdate({ owner });
            }}
            disabled={!editable}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择端负责人" />
            </SelectTrigger>
            <SelectContent>
              {availableOwners.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 是否要做（仅端负责人可修改） */}
        {opinion.owner && (
          <div className="space-y-2">
            <Label className="text-sm">是否要做</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needToDo-yes"
                  checked={opinion.needToDo === '是'}
                  onCheckedChange={() => handleNeedToDoChange('是')}
                  disabled={!canEditOpinion}
                />
                <Label htmlFor="needToDo-yes" className="text-sm font-normal cursor-pointer">
                  是
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needToDo-no"
                  checked={opinion.needToDo === '否'}
                  onCheckedChange={() => handleNeedToDoChange('否')}
                  disabled={!canEditOpinion}
                />
                <Label htmlFor="needToDo-no" className="text-sm font-normal cursor-pointer">
                  否
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* 优先级（仅端负责人可修改） */}
        {opinion.owner && (
          <div className="space-y-2">
            <Label className="text-sm">优先级</Label>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${key}`}
                    checked={opinion.priority === key}
                    onCheckedChange={() => handlePriorityChange(key as '低' | '中' | '高' | '紧急')}
                    disabled={!canEditOpinion}
                  />
                  <Label 
                    htmlFor={`priority-${key}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {key}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 端负责人意见（仅端负责人可修改） */}
        {opinion.owner && (
          <div className="space-y-2">
            <Label className="text-sm">意见</Label>
            <Textarea
              placeholder="填写端负责人意见..."
              value={opinion.opinion || ''}
              onChange={(e) => handleUpdate({ opinion: e.target.value })}
              disabled={!canEditOpinion}
              className="min-h-[100px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 