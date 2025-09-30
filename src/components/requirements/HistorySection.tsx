'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { User } from '@/lib/requirements-store';

/**
 * 修改记录接口
 */
export interface HistoryRecord {
  id: string;
  user: User;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

interface HistorySectionProps {
  records: HistoryRecord[];
  title?: string;
  showTitle?: boolean;
  compact?: boolean;
}

/**
 * 修改记录组件
 * 
 * 功能：
 * - 显示修改记录列表
 * - 显示修改的字段、旧值和新值
 * - 显示操作人和时间
 * - 支持紧凑模式
 * 
 * @example
 * <HistorySection
 *   records={mockRecords}
 *   compact={true}
 * />
 */
export function HistorySection({
  records = [],
  title = '修改记录',
  showTitle = true,
  compact = true
}: HistorySectionProps) {
  /**
   * 格式化修改描述
   */
  const formatChangeDescription = (record: HistoryRecord): string => {
    if (record.field && record.oldValue && record.newValue) {
      return `将 ${record.field} 从 "${record.oldValue}" 修改为 "${record.newValue}"`;
    }
    return record.action;
  };

  /**
   * 获取操作类型的颜色
   */
  const getActionColor = (action: string): string => {
    if (action.includes('创建') || action.includes('新建')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (action.includes('删除') || action.includes('移除')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    if (action.includes('修改') || action.includes('更新')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const content = (
    <>
      {records.length > 0 ? (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          {records.map((record) => (
            <div
              key={record.id}
              className={compact 
                ? 'flex items-start gap-2 text-sm py-1 border-b last:border-0' 
                : 'flex gap-3 p-3 border rounded-lg'
              }
            >
              {!compact && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={record.user.avatar} />
                  <AvatarFallback>{record.user.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {record.user.name}
                  </span>
                  {!compact && record.action && (
                    <Badge variant="secondary" className={`text-xs ${getActionColor(record.action)}`}>
                      {record.action.split(' ')[0]}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {record.timestamp}
                  </span>
                </div>
                <p className={`text-muted-foreground ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
                  {formatChangeDescription(record)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无修改记录</p>
        </div>
      )}
    </>
  );

  if (!showTitle) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
} 