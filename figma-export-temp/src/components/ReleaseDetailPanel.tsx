import { useState } from 'react';
import { 
  X, 
  CheckCircle,
  Circle,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface ReleaseDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const includedFeatures = [
  { name: '用户登录优化', ref: '需求#801' },
  { name: '支付流程改进', ref: '需求#802' },
  { name: '界面美化更新', ref: '需求#803' },
  { name: '性能优化', ref: '任务#101' },
  { name: 'Bug修复', ref: 'Bug#201, #202, #203' }
];

const releaseChecks = [
  { name: '所有任务已完成', completed: true },
  { name: '所有Bug已解决', completed: true },
  { name: '测试用例通过', completed: true },
  { name: '性能测试完成', completed: false },
  { name: '安全扫描完成', completed: false }
];

export function ReleaseDetailPanel({ isOpen, onClose }: ReleaseDetailPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-[60px] bottom-0 w-[400px] bg-background border-l border-border shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-medium">发布详情 - v2.2.0</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📋 基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm">版本号：</span>
                  <span className="ml-2">v2.2.0</span>
                </div>
                <div>
                  <span className="text-sm">发布日期：</span>
                  <span className="ml-2">2024-01-25</span>
                </div>
                <div>
                  <span className="text-sm">状态：</span>
                  <span className="ml-2">待发布</span>
                </div>
                <div>
                  <span className="text-sm">负责人：</span>
                  <span className="ml-2">王五</span>
                </div>
              </CardContent>
            </Card>

            {/* 包含功能 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">✅</span>
                <h3 className="font-medium">包含功能 (5)</h3>
              </div>
              <div className="space-y-2">
                {includedFeatures.map((feature, index) => (
                  <div key={index} className="text-sm">
                    <span>• {feature.name}</span>
                    <span className="text-muted-foreground ml-2">({feature.ref})</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 发布检查 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🔍</span>
                <h3 className="font-medium">发布检查</h3>
              </div>
              <div className="space-y-2">
                {releaseChecks.map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {check.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-sm">{check.name}</span>
                    {check.completed && <span className="text-green-600 text-sm">✓</span>}
                    {!check.completed && <span className="text-orange-600 text-sm">○</span>}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 发布说明 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Edit className="h-4 w-4" />
                <h3 className="font-medium">发布说明</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 min-h-[80px] border">
                <span className="text-muted-foreground text-sm">【富文本编辑器 - 发布日志内容】</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* 底部操作按钮 */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1">【保存】</Button>
            <Button variant="outline" className="flex-1">【发布上线】</Button>
            <Button variant="outline" className="flex-1">【取消】</Button>
          </div>
        </div>
      </div>
    </div>
  );
}