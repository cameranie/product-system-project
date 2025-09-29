import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  Layout, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  GitBranch,
  Table,
  Search,
  Plus
} from 'lucide-react';

const features = [
  {
    title: '固定页面头部布局',
    description: '参照预排期需求管理页面，采用固定头部 + 可滚动内容区域的布局结构',
    icon: <Layout className="h-5 w-5" />,
    status: '已完成',
    details: [
      '固定的页面标题和描述',
      '右上角的新建需求按钮',
      '与预排期页面保持一致的视觉风格'
    ]
  },
  {
    title: '筛选和操作栏',
    description: '在Card容器中整合搜索框、高级筛选、排序、隐藏列等功能',
    icon: <Filter className="h-5 w-5" />,
    status: '已完成',
    details: [
      '搜索框支持标题、描述、标签搜索',
      '高级筛选支持多条件组合',
      '排序功能支持多字段排序',
      '隐藏列功能可自定义显示列'
    ]
  },
  {
    title: '批量操作功能',
    description: '支持多选需求进行批量导出、归档、删除等操作',
    icon: <CheckCircle className="h-5 w-5" />,
    status: '已完成',
    details: [
      '多选checkbox支持',
      '批量操作按钮动态显示',
      '导出、归档、删除等批量功能',
      '操作确认和成功提示'
    ]
  },
  {
    title: '版本分组展示',
    description: '按版本号分组展示，支持版本折叠/展开',
    icon: <GitBranch className="h-5 w-5" />,
    status: '已完成',
    details: [
      '版本号自动排序（新版本在前）',
      '版本统计信息显示',
      '状态分布可视化',
      '可折叠的版本组'
    ]
  },
  {
    title: '表格排序功能',
    description: '表头点击排序，支持多字段排序和排序状态指示',
    icon: <ArrowUpDown className="h-5 w-5" />,
    status: '已完成',
    details: [
      '点击表头进行排序',
      '排序方向图标指示',
      '支持清除排序',
      '多字段排序支持'
    ]
  },
  {
    title: '子任务展开视图',
    description: '保留原有的子任务展开功能，支持内联编辑',
    icon: <Table className="h-5 w-5" />,
    status: '已完成',
    details: [
      '需求行点击展开子任务',
      '子任务状态和延期情况显示',
      '执行人和时间信息',
      '子任务状态可编辑'
    ]
  }
];

const layoutComparison = [
  {
    aspect: '页面结构',
    before: '单一滚动区域，功能分散',
    after: '固定头部 + 筛选栏 + 可滚动内容区',
    improvement: '更好的视觉层次和功能组织'
  },
  {
    aspect: '筛选功能',
    before: '基础下拉选择筛选',
    after: '高级筛选 + 搜索 + 排序 + 隐藏列',
    improvement: '功能更强大，操作更便捷'
  },
  {
    aspect: '批量操作',
    before: '无批量操作功能',
    after: '完整的批量选择和操作体系',
    improvement: '提升批量管理效率'
  },
  {
    aspect: '版本管理',
    before: '简单的版本分组显示',
    after: '可折叠版本组 + 统计信息',
    improvement: '更清晰的版本组织结构'
  },
  {
    aspect: '排序功能',
    before: '有排序但缺少交互指示',
    after: '表头点击排序 + 视觉指示',
    improvement: '排序操作更直观'
  }
];

export function VersionRequirementsLayoutDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面头部 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            版本需求管理页面布局更新
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            参照预排期需求管理页面的布局和样式，对版本需求管理页面进行了全面的UI升级，
            提升了用户体验和功能完整性。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              ✅ 布局统一
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              ✅ 功能增强
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              ✅ 体验优化
            </Badge>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 bg-green-100 text-green-800 border-green-200"
                    >
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 布局对比 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              布局改进对比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">改进方面</th>
                    <th className="text-left py-3 px-4 font-medium">更新前</th>
                    <th className="text-left py-3 px-4 font-medium">更新后</th>
                    <th className="text-left py-3 px-4 font-medium">改进效果</th>
                  </tr>
                </thead>
                <tbody>
                  {layoutComparison.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {item.aspect}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.before}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.after}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-sm">
                          {item.improvement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 技术实现要点 */}
        <Card>
          <CardHeader>
            <CardTitle>技术实现要点</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-900">布局结构优化</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 采用 flex flex-col 实现固定头部布局</li>
                  <li>• 筛选栏使用 Card 组件统一风格</li>
                  <li>• 内容区域支持垂直滚动</li>
                  <li>• 响应式设计适配不同屏幕</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-gray-900">功能模块整合</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 搜索、筛选、排序功能一体化</li>
                  <li>• 批量操作状态动态管理</li>
                  <li>• 版本分组的可折叠交互</li>
                  <li>• 表格排序的视觉反馈</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-gray-900">交互体验提升</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• hover 状态和过渡动画</li>
                  <li>• 操作反馈和提示信息</li>
                  <li>• 键盘操作支持</li>
                  <li>• 空状态和错误处理</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-gray-900">性能优化</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• useMemo 优化排序和分组</li>
                  <li>• useCallback 减少重渲染</li>
                  <li>• 虚拟滚动支持大数据量</li>
                  <li>• 懒加载和渐进增强</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用指南 */}
        <Card>
          <CardHeader>
            <CardTitle>使用指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">访问路径</h4>
                <p className="text-blue-700 text-sm">
                  左侧导航栏 → 版本需求管理，即可体验更新后的页面布局和功能
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">新增功能</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• 高级筛选支持多条件组合</li>
                    <li>• 批量操作提升管理效率</li>
                    <li>• 表头点击排序更直观</li>
                    <li>• 隐藏列自定义显示</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">保留功能</h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• 版本分组展示结构</li>
                    <li>• 子任务展开详情</li>
                    <li>• 内联编辑功能</li>
                    <li>• 状态和优先级管理</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 总结 */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">更新完成</h3>
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto">
                版本需求管理页面已成功参照预排期需求管理页面的布局和样式进行了全面更新，
                实现了布局统一化、功能完整化、交互优化化的目标。
                新的页面结构更清晰，功能更强大，用户体验更流畅。
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                  与预排期页面布局保持一致
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                  功能完整性大幅提升
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}