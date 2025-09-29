import { useState } from 'react';
import { 
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ReleaseDetailPanel } from './ReleaseDetailPanel';

interface Release {
  id: string;
  version: string;
  releaseDate: string;
  status: 'released' | 'pending' | 'in-progress';
  features: string;
  assignee: string;
}

const mockReleases: Release[] = [
  {
    id: '1',
    version: 'v2.1.0',
    releaseDate: '2024-01-20',
    status: 'released',
    features: 'K线',
    assignee: '张三'
  },
  {
    id: '2', 
    version: 'v2.0.5',
    releaseDate: '2024-01-15',
    status: 'released',
    features: '行情',
    assignee: '李四'
  },
  {
    id: '3',
    version: 'v2.2.0', 
    releaseDate: '2024-01-25',
    status: 'pending',
    features: '聊天室',
    assignee: '王五'
  }
];

export function ReleasePage() {
  const [showReleaseDetail, setShowReleaseDetail] = useState(false);

  const getStatusLabel = (status: Release['status']) => {
    switch (status) {
      case 'released': return '已发布';
      case 'pending': return '待发布';
      case 'in-progress': return '发布中';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 版本布局 */}
      <div className="space-y-4">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <h1>发布管理</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建发布
          </Button>
        </div>

        {/* 发布列表 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium">版本号</th>
                    <th className="text-left p-4 font-medium">发布日期</th>
                    <th className="text-left p-4 font-medium">状态</th>
                    <th className="text-left p-4 font-medium">包含功能</th>
                    <th className="text-left p-4 font-medium">负责人</th>
                    <th className="text-left p-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReleases.map((release) => (
                    <tr key={release.id} className="border-b border-border hover:bg-accent/50">
                      <td className="p-4">{release.version}</td>
                      <td className="p-4">{release.releaseDate}</td>
                      <td className="p-4">{getStatusLabel(release.status)}</td>
                      <td className="p-4">{release.features}</td>
                      <td className="p-4">{release.assignee}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {release.status === 'pending' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowReleaseDetail(true)}
                            >
                              编辑
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowReleaseDetail(true)}
                            >
                              查看
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 发布详情面板 */}
      <ReleaseDetailPanel 
        isOpen={showReleaseDetail} 
        onClose={() => setShowReleaseDetail(false)} 
      />
    </div>
  );
}