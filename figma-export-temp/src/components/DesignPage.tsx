import { useState } from 'react';
import { Button } from './ui/button';
import { 
  Upload, 
  ExternalLink, 
  FileText, 
  Send, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  FileImage,
  FileType
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DesignAsset {
  id: string;
  name: string;
  type: 'design' | 'resource';
  preview?: string;
  size?: string;
  updatedAt: string;
}

const mockDesigns: DesignAsset[] = [
  {
    id: '1',
    name: '登录页面',
    type: 'design',
    preview: '/api/placeholder/200/150',
    updatedAt: '2024-01-16'
  },
  {
    id: '2',
    name: '首页设计',
    type: 'design',
    preview: '/api/placeholder/200/150',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: '个人中心',
    type: 'design',
    preview: '/api/placeholder/200/150',
    updatedAt: '2024-01-14'
  },
  {
    id: '4',
    name: '设置页面',
    type: 'design',
    preview: '/api/placeholder/200/150',
    updatedAt: '2024-01-13'
  }
];

const mockResources: DesignAsset[] = [
  {
    id: '5',
    name: '设计规范.pdf',
    type: 'resource',
    size: '2.3MB',
    updatedAt: '2024-01-16'
  },
  {
    id: '6',
    name: '切图资源包.zip',
    type: 'resource',
    size: '12.8MB',
    updatedAt: '2024-01-15'
  },
  {
    id: '7',
    name: '字体文件.ttf',
    type: 'resource',
    size: '1.2MB',
    updatedAt: '2024-01-14'
  }
];

export function DesignPage() {
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'reviewing' | 'approved' | 'rejected'>('pending');

  const getStatusConfig = (status: typeof reviewStatus) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
      case 'reviewing':
        return { icon: AlertTriangle, label: '评审中', variant: 'outline' as const, color: 'text-yellow-600' };
      case 'approved':
        return { icon: CheckCircle, label: '评审通过', variant: 'default' as const, color: 'text-green-600' };
      case 'rejected':
        return { icon: XCircle, label: '评审不通过', variant: 'destructive' as const, color: 'text-red-600' };
    }
  };

  const statusConfig = getStatusConfig(reviewStatus);

  return (
    <div className="p-6 space-y-6">
      {/* 标签页导航 */}
      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prd">PRD详情</TabsTrigger>
          <TabsTrigger value="prototype">原型</TabsTrigger>
          <TabsTrigger value="design">设计稿</TabsTrigger>
          <TabsTrigger value="tasks">任务</TabsTrigger>
          <TabsTrigger value="discussion">讨论</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="mt-6 space-y-6">
          {/* 操作栏 */}
          <div className="flex items-center gap-3">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              上传设计稿
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              关联Figma
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              设计规范
            </Button>
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              提交审核
            </Button>
          </div>

          {/* 设计预览区域 */}
          <Card>
            <CardHeader>
              <CardTitle>设计预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockDesigns.map((design) => (
                  <div key={design.id} className="group relative">
                    <div className="aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={design.preview || ''}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium">{design.name}</p>
                      <p className="text-xs text-muted-foreground">[缩略图]</p>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-2" />
                        预览
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 设计资源 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                设计资源
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileType className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.size} • 更新于 {resource.updatedAt}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 审核状态 */}
          <Card>
            <CardHeader>
              <CardTitle>审核状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <statusConfig.icon className={`h-5 w-5 ${statusConfig.color}`} />
                  <div>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reviewStatus === 'pending' && '等待提交评审'}
                      {reviewStatus === 'reviewing' && '设计师正在评审中...'}
                      {reviewStatus === 'approved' && '设计已通过评审，可以进入开发阶段'}
                      {reviewStatus === 'rejected' && '设计需要修改，请查看评审意见'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {reviewStatus !== 'pending' && (
                    <Button variant="outline" size="sm">
                      查看评审详情
                    </Button>
                  )}
                  {(reviewStatus === 'pending' || reviewStatus === 'rejected') && (
                    <Button size="sm" onClick={() => setReviewStatus('reviewing')}>
                      进行评审
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prd">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">PRD详情内容...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prototype">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">原型设计内容...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">相关任务内容...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">讨论区内容...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}