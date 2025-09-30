'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  MousePointer, 
  Palette, 
  Bug,
  Link as LinkIcon,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * 快捷操作数据接口
 */
export interface QuickActionsData {
  prototypeId?: string;
  prdId?: string;
  uiDesignId?: string;
  bugTrackingId?: string;
}

interface QuickActionsCardProps {
  requirementId: string;
  requirementTitle: string;
  actions: QuickActionsData;
  editable?: boolean;
  onChange?: (actions: QuickActionsData) => void;
}

/**
 * 快捷操作卡片组件
 * 
 * 功能：
 * - 快速跳转到相关文档（原型、PRD、UI设计、Bug追踪）
 * - 输入和保存相关文档ID
 * - 一键跳转到对应页面
 * 
 * @example
 * <QuickActionsCard
 *   requirementId="#1"
 *   requirementTitle="需求标题"
 *   actions={mockActions}
 *   editable={true}
 * />
 */
export function QuickActionsCard({
  requirementId,
  requirementTitle,
  actions,
  editable = true,
  onChange
}: QuickActionsCardProps) {
  /**
   * 更新快捷操作
   */
  const handleUpdate = (field: keyof QuickActionsData, value: string) => {
    onChange?.({ ...actions, [field]: value });
  };

  /**
   * 跳转到相关文档
   */
  const handleNavigate = (type: string, id?: string) => {
    if (!id) {
      toast.error(`请先设置${type}ID`);
      return;
    }

    // 这里可以根据实际情况配置跳转路径
    const routes: Record<string, string> = {
      '原型': `/prototype/${id}`,
      'PRD': `/prd/${id}`,
      'UI设计': `/design/${id}`,
      'Bug追踪': `/bugs/${id}`
    };

    const url = routes[type];
    if (url) {
      window.open(url, '_blank');
      toast.success(`已打开${type}页面`);
    }
  };

  /**
   * 快捷操作项配置
   */
  const actionItems = [
    {
      id: 'prototypeId',
      label: '原型',
      icon: MousePointer,
      placeholder: '输入原型ID',
      value: actions.prototypeId,
      color: 'text-purple-500'
    },
    {
      id: 'prdId',
      label: 'PRD',
      icon: FileText,
      placeholder: '输入PRD ID',
      value: actions.prdId,
      color: 'text-blue-500'
    },
    {
      id: 'uiDesignId',
      label: 'UI设计',
      icon: Palette,
      placeholder: '输入UI设计ID',
      value: actions.uiDesignId,
      color: 'text-pink-500'
    },
    {
      id: 'bugTrackingId',
      label: 'Bug追踪',
      icon: Bug,
      placeholder: '输入Bug追踪ID',
      value: actions.bugTrackingId,
      color: 'text-red-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">快捷操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Icon className={`h-4 w-4 ${item.color}`} />
                {item.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={item.placeholder}
                  value={item.value || ''}
                  onChange={(e) => handleUpdate(item.id as keyof QuickActionsData, e.target.value)}
                  disabled={!editable}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate(item.label, item.value)}
                  disabled={!item.value}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* 分隔线 */}
        <div className="border-t pt-4 mt-4">
          <Label className="text-sm text-muted-foreground mb-2 block">相关链接</Label>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                // 复制需求信息到剪贴板
                const text = `需求ID: ${requirementId}\n需求标题: ${requirementTitle}`;
                navigator.clipboard.writeText(text);
                toast.success('需求信息已复制到剪贴板');
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              复制需求信息
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 