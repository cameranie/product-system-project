import React from 'react';
import { useVersions } from './VersionContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

export function VersionIntegrationDemo() {
  const { getAllVersionNumbers, versions } = useVersions();
  const availableVersions = getAllVersionNumbers();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔗 版本号管理系统集成演示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">📋 当前可用版本号</h4>
            <div className="flex flex-wrap gap-2">
              {availableVersions.map((version) => (
                <Badge key={version} variant="outline">
                  {version}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              共 {availableVersions.length} 个版本号，来自版本号管理页面
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">🎯 版本号选择组件示例</h4>
            <div className="max-w-xs">
              <Label htmlFor="version-select">预排期版本</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择版本号..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">暂未分配</SelectItem>
                  {availableVersions.map((version) => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              此下拉框会自动同步版本号管理页面的最新版本
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">📊 版本详情统计</h4>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{versions.length}</div>
                  <p className="text-sm text-muted-foreground">总版本数</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{availableVersions.length}</div>
                  <p className="text-sm text-muted-foreground">唯一版本号</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">✅ 已集成的页面</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">需求池页面 - 版本号选择</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">版本号管理页面 - 数据源</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">预排期需求页面 - 待集成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">版本需求管理页面 - 待集成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">PRD管理页面 - 待集成</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 集成说明</h5>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 版本号管理页面是版本号的唯一数据源</li>
              <li>• 所有其他页面的版本号选择都从此获取</li>
              <li>• 新增版本号后，其他页面立即可用</li>
              <li>• 删除版本号会自动检查是否被使用</li>
              <li>• 统一的版本号格式和排序规则</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}