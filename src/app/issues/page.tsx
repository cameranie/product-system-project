'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Table,
  TableHeader as TableHeaderRaw,
  TableBody as TableBodyRaw,
  TableRow as TableRowRaw,
  TableCell as TableCellRaw,
  TableHead as TableHeadRaw,
} from '@/components/ui/table';


import { Search, Plus, Eye } from 'lucide-react';

// 任务类型
const taskTypeConfig = {
  issue: { icon: '🐛', label: '产品建议', color: 'bg-orange-100 text-orange-800' },
  feature: { icon: '💻', label: '功能开发', color: 'bg-blue-100 text-blue-800' },
  bug: { icon: '🐞', label: '缺陷修复', color: 'bg-red-100 text-red-800' },
  improvement: { icon: '💡', label: '改进优化', color: 'bg-green-100 text-green-800' },
};

// 优先级标签
const priorityLabels = {
  low: '低',
  medium: '中', 
  high: '高',
  urgent: '紧急'
};

// 反馈来源标签
const inputSourceLabels = {
  kol: 'KOL反馈',
  user_feedback: '用户反馈',
  internal: '内部需求',
  data_analysis: '数据分析',
  strategy: '战略需求'
};

// Issue数据类型
interface Issue {
  id: string;
  title: string;
  description?: string;
  type: 'issue' | 'feature' | 'bug' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  assignee: string;
  inputSource?: 'kol' | 'user_feedback' | 'internal' | 'data_analysis' | 'strategy';
  createdAt: string;
}

// 模拟Issues数据
const mockIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: '用户反馈：需要添加深色主题',
    description: '多个用户在社区反馈希望能支持暗色主题，提升夜间使用体验。',
    type: 'issue',
    priority: 'medium',
    status: '待处理',
    assignee: '张小明',
    inputSource: 'user_feedback',
    createdAt: '2024-01-15',
  },
  {
    id: 'ISS-002',
    title: 'KOL建议：优化移动端性能',
    description: '某知名KOL反馈移动端加载较慢，影响用户体验。',
    type: 'issue',
    priority: 'high',
    status: '进行中',
    assignee: '李小红',
    inputSource: 'kol',
    createdAt: '2024-01-14',
  },
  {
    id: 'BUG-001',
    title: '登录页面在Safari浏览器显示异常',
    description: '用户反馈在Safari浏览器中登录页面布局错乱。',
    type: 'bug',
    priority: 'high',
    status: '待处理',
    assignee: '王小强',
    inputSource: 'user_feedback',
    createdAt: '2024-01-13',
  },
  {
    id: 'FEA-001',
    title: '新增数据导出功能',
    description: '用户希望能够将项目数据导出为Excel格式。',
    type: 'feature',
    priority: 'medium',
    status: '已完成',
    assignee: '赵小亮',
    inputSource: 'user_feedback',
    createdAt: '2024-01-12',
  },
];

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [searchTerm, setSearchTerm] = useState('');

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    type: 'issue' as Issue['type'],
    priority: 'medium' as Issue['priority'],
    inputSource: 'user_feedback' as Issue['inputSource'],
  });



  // 创建Issue
  const handleCreateIssue = () => {
    const issue: Issue = {
      id: `${newIssue.type.toUpperCase()}-${String(Date.now()).slice(-3)}`,
      title: newIssue.title,
      description: newIssue.description,
      type: newIssue.type,
      priority: newIssue.priority,
      status: '待处理',
      assignee: '未分配',
      inputSource: newIssue.inputSource,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setIssues(prev => [issue, ...prev]);
    setNewIssue({
      title: '',
      description: '',
      type: 'issue',
      priority: 'medium',
      inputSource: 'user_feedback',
    });

  };

  // 过滤Issues
  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题已移至顶部导航栏 */}

        {/* 顶部操作栏 */}
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索Issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 创建Issue按钮 */}
          <Button className="h-10" asChild>
            <a href="/issues/new">
              <Plus className="h-4 w-4 mr-2" />
              创建Issue
            </a>
          </Button>
        </div>


        {/* Issues表格 */}
        <div className="rounded-md border">
          <Table>
            <TableHeaderRaw>
              <TableRowRaw>
                <TableHeadRaw>ID</TableHeadRaw>
                <TableHeadRaw>类型</TableHeadRaw>
                <TableHeadRaw>标题</TableHeadRaw>
                <TableHeadRaw>优先级</TableHeadRaw>
                <TableHeadRaw>状态</TableHeadRaw>
                <TableHeadRaw>负责人</TableHeadRaw>
                <TableHeadRaw>创建时间</TableHeadRaw>
                <TableHeadRaw>操作</TableHeadRaw>
              </TableRowRaw>
            </TableHeaderRaw>
            <TableBodyRaw>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <TableRowRaw key={issue.id}>
                    <TableCellRaw className="font-mono text-sm">{issue.id}</TableCellRaw>
                    <TableCellRaw>
                      <Badge className={taskTypeConfig[issue.type]?.color}>
                        {taskTypeConfig[issue.type]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <div className="max-w-md">
                        <div className="font-medium">{issue.title}</div>
                        {issue.description && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {issue.description}
                          </div>
                        )}
                      </div>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge 
                        variant="outline" 
                        className={
                          issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {priorityLabels[issue.priority]}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline">{issue.status}</Badge>
                    </TableCellRaw>
                    <TableCellRaw>{issue.assignee}</TableCellRaw>
                    <TableCellRaw className="text-sm">{issue.createdAt}</TableCellRaw>
                    <TableCellRaw>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <a href={`/issues/${issue.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          详情
                        </a>
                      </Button>
                    </TableCellRaw>
                  </TableRowRaw>
                ))
              ) : (
                <TableRowRaw>
                  <TableCellRaw colSpan={8} className="h-24 text-center">
                    暂无Issues数据
                  </TableCellRaw>
                </TableRowRaw>
              )}
            </TableBodyRaw>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
