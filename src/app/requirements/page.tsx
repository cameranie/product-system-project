'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableHeader as TableHeaderRaw,
  TableBody as TableBodyRaw,
  TableRow as TableRowRaw,
  TableCell as TableCellRaw,
  TableHead as TableHeadRaw,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  Eye, 
  Calendar,
  CheckSquare,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 模拟需求数据 - 基于产品管理系统文档
import type { 
  Requirement, 
  RequirementStatus, 
  RequirementType, 
  ApplicationPlatform,
  Priority,
  User 
} from '@/types/issue';

// 需求类型配置
const requirementTypeConfig = {
  NEW_FEATURE: { label: '新功能', color: 'bg-blue-100 text-blue-800' },
  BUG: { label: 'Bug修复', color: 'bg-red-100 text-red-800' },
  ENHANCEMENT: { label: '功能增强', color: 'bg-green-100 text-green-800' },
  OPTIMIZATION: { label: '优化改进', color: 'bg-purple-100 text-purple-800' },
};

// 应用端配置
const platformConfig = {
  WEB: { label: 'Web端' },
  MOBILE: { label: '移动端' },
  DESKTOP: { label: '桌面端' },
  API: { label: 'API接口' },
  ALL: { label: '全端' },
};

// 优先级配置
const priorityConfig = {
  LOW: { label: '低', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: '高', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: '紧急', color: 'bg-red-100 text-red-800' },
};

// 需求状态配置
const statusConfig = {
  PENDING: { label: '待审核', color: 'bg-gray-100 text-gray-800' },
  APPROVED: { label: '审核通过', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: '审核不通过', color: 'bg-red-100 text-red-800' },
  SCHEDULED: { label: '已排期', color: 'bg-blue-100 text-blue-800' },
  IN_DEVELOPMENT: { label: '开发中', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
};

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'unscheduled' | 'scheduled'>('unscheduled');
  const [filterStatus, setFilterStatus] = useState<RequirementStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<RequirementType | 'all'>('all');

  // 模拟数据加载
  useEffect(() => {
    const loadRequirements = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟需求数据
        const mockRequirements: Requirement[] = [
          {
            id: 'req-001',
            title: '用户头像上传功能优化',
            description: '当前用户头像上传速度较慢，需要优化压缩算法和上传流程，提升用户体验',
            type: 'ENHANCEMENT' as RequirementType,
            platform: 'WEB' as ApplicationPlatform,
            priority: 'HIGH' as Priority,
            status: 'PENDING' as RequirementStatus,
            submitter: {
              id: 'user-1',
              name: '张三',
              email: 'zhangsan@company.com',
              username: 'zhangsan'
            } as User,
            businessValue: '提升用户满意度，减少用户流失',
            userImpact: '影响所有需要上传头像的用户',
            technicalRisk: '中等，需要处理兼容性问题',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 'req-002',
            title: '移动端消息推送功能',
            description: '为移动端用户提供实时消息推送功能，包括系统通知、任务提醒等',
            type: 'NEW_FEATURE' as RequirementType,
            platform: 'MOBILE' as ApplicationPlatform,
            priority: 'MEDIUM' as Priority,
            status: 'APPROVED' as RequirementStatus,
            submitter: {
              id: 'user-2',
              name: '李四',
              email: 'lisi@company.com',
              username: 'lisi'
            } as User,
            reviewer: {
              id: 'user-3',
              name: '王五',
              email: 'wangwu@company.com',
              username: 'wangwu'
            } as User,
            expectedVersion: 'v2.1.0',
            businessValue: '提高用户活跃度和留存率',
            userImpact: '影响所有移动端用户',
            technicalRisk: '低，使用成熟的推送服务',
            createdAt: '2024-01-12T14:20:00Z',
            updatedAt: '2024-01-14T09:15:00Z',
            reviewedAt: '2024-01-14T09:15:00Z',
          },
          {
            id: 'req-003',
            title: '数据导出功能异常修复',
            description: '用户反馈Excel导出功能在大数据量时会超时，需要修复并优化导出机制',
            type: 'BUG' as RequirementType,
            platform: 'WEB' as ApplicationPlatform,
            priority: 'URGENT' as Priority,
            status: 'SCHEDULED' as RequirementStatus,
            submitter: {
              id: 'user-4',
              name: '赵六',
              email: 'zhaoliu@company.com',
              username: 'zhaoliu'
            } as User,
            assignee: {
              id: 'user-5',
              name: '孙七',
              email: 'sunqi@company.com',
              username: 'sunqi'
            } as User,
            expectedVersion: 'v2.0.1',
            businessValue: '修复关键功能，避免用户投诉',
            userImpact: '影响需要导出大量数据的企业用户',
            technicalRisk: '中等，需要重构导出逻辑',
            createdAt: '2024-01-10T16:45:00Z',
            updatedAt: '2024-01-13T11:30:00Z',
            scheduledAt: '2024-01-13T11:30:00Z',
          },
          {
            id: 'req-004',
            title: '搜索性能优化',
            description: '全局搜索功能响应速度慢，需要优化搜索算法和建立索引',
            type: 'OPTIMIZATION' as RequirementType,
            platform: 'ALL' as ApplicationPlatform,
            priority: 'MEDIUM' as Priority,
            status: 'PENDING' as RequirementStatus,
            submitter: {
              id: 'user-6',
              name: '周八',
              email: 'zhouba@company.com',
              username: 'zhouba'
            } as User,
            businessValue: '提升整体产品体验',
            userImpact: '影响所有使用搜索功能的用户',
            technicalRisk: '高，需要重构搜索架构',
            createdAt: '2024-01-08T13:20:00Z',
            updatedAt: '2024-01-08T13:20:00Z',
          },
          {
            id: 'req-005',
            title: '用户权限管理增强',
            description: '现有权限管理功能较为简单，需要支持更细粒度的权限控制和角色管理',
            type: 'NEW_FEATURE' as RequirementType,
            platform: 'WEB' as ApplicationPlatform,
            priority: 'LOW' as Priority,
            status: 'REJECTED' as RequirementStatus,
            submitter: {
              id: 'user-7',
              name: '吴九',
              email: 'wujiu@company.com',
              username: 'wujiu'
            } as User,
            reviewer: {
              id: 'user-3',
              name: '王五',
              email: 'wangwu@company.com',
              username: 'wangwu'
            } as User,
            businessValue: '满足企业级客户需求',
            userImpact: '主要影响管理员用户',
            technicalRisk: '高，涉及核心安全模块',
            createdAt: '2024-01-05T10:10:00Z',
            updatedAt: '2024-01-07T15:45:00Z',
            reviewedAt: '2024-01-07T15:45:00Z',
          }
        ];
        
        setRequirements(mockRequirements);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load requirements:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, []);

  // 过滤需求
  const getFilteredRequirements = () => {
    let filtered = requirements;

    // 根据视图模式过滤
    if (viewMode === 'unscheduled') {
      filtered = filtered.filter(req => 
        req.status === 'PENDING' || req.status === 'APPROVED' || req.status === 'REJECTED'
      );
    } else {
      filtered = filtered.filter(req => 
        req.status === 'SCHEDULED' || req.status === 'IN_DEVELOPMENT' || req.status === 'COMPLETED'
      );
    }

    // 状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // 类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(req => req.type === filterType);
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredRequirements = getFilteredRequirements();

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(filteredRequirements.map(req => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  // 单个选择
  const handleSelectRequirement = (requirementId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements(prev => [...prev, requirementId]);
    } else {
      setSelectedRequirements(prev => prev.filter(id => id !== requirementId));
    }
  };

  // 批量排期操作
  const handleBatchSchedule = () => {
    if (selectedRequirements.length === 0) {
      alert('请先选择需要排期的需求');
      return;
    }
    
    // 这里应该调用API进行批量排期操作
    const selectedReqs = requirements.filter(req => selectedRequirements.includes(req.id));
    console.log('批量排期需求:', selectedReqs);
    
    // 模拟操作成功
    setRequirements(prev => 
      prev.map(req => 
        selectedRequirements.includes(req.id) 
          ? { ...req, status: 'SCHEDULED' as RequirementStatus, scheduledAt: new Date().toISOString() }
          : req
      )
    );
    setSelectedRequirements([]);
    alert(`成功将 ${selectedRequirements.length} 个需求加入排期`);
  };

  // 统计数据
  const stats = {
    total: requirements.length,
    pending: requirements.filter(req => req.status === 'PENDING').length,
    approved: requirements.filter(req => req.status === 'APPROVED').length,
    scheduled: requirements.filter(req => req.status === 'SCHEDULED').length,
    rejected: requirements.filter(req => req.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载需求池数据中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">加载失败: {error}</p>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">总需求数</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">待审核</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">审核通过</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-muted-foreground">已排期</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">审核不通过</div>
          </div>
        </div>

        {/* 顶部操作栏 */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索需求..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 筛选器 */}
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RequirementStatus | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="PENDING">待审核</SelectItem>
              <SelectItem value="APPROVED">审核通过</SelectItem>
              <SelectItem value="REJECTED">审核不通过</SelectItem>
              <SelectItem value="SCHEDULED">已排期</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={(value) => setFilterType(value as RequirementType | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="NEW_FEATURE">新功能</SelectItem>
              <SelectItem value="BUG">Bug修复</SelectItem>
              <SelectItem value="ENHANCEMENT">功能增强</SelectItem>
              <SelectItem value="OPTIMIZATION">优化改进</SelectItem>
            </SelectContent>
          </Select>

          {/* 视图切换开关 */}
          <div className="flex bg-background border border-border rounded-md p-1">
            <button
              onClick={() => setViewMode('unscheduled')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                viewMode === 'unscheduled' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              未排期
            </button>
            <button
              onClick={() => setViewMode('scheduled')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                viewMode === 'scheduled' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              已排期
            </button>
          </div>

          {/* 批量操作 */}
          {viewMode === 'unscheduled' && selectedRequirements.length > 0 && (
            <Button onClick={handleBatchSchedule} variant="default">
              <Calendar className="h-4 w-4 mr-2" />
              批量排期 ({selectedRequirements.length})
            </Button>
          )}

          {/* 创建需求按钮 */}
          <Button asChild>
            <a href="/requirements/new">
              <Plus className="h-4 w-4 mr-2" />
              提交需求
            </a>
          </Button>
        </div>

        {/* 需求表格 */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeaderRaw>
              <TableRowRaw>
                {viewMode === 'unscheduled' && (
                  <TableHeadRaw className="w-12">
                    <Checkbox
                      checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHeadRaw>
                )}
                <TableHeadRaw>ID</TableHeadRaw>
                <TableHeadRaw>需求名称</TableHeadRaw>
                <TableHeadRaw>类型</TableHeadRaw>
                <TableHeadRaw>应用端</TableHeadRaw>
                <TableHeadRaw>优先级</TableHeadRaw>
                <TableHeadRaw>状态</TableHeadRaw>
                <TableHeadRaw>提出者</TableHeadRaw>
                {viewMode === 'scheduled' && <TableHeadRaw>负责人</TableHeadRaw>}
                <TableHeadRaw>创建时间</TableHeadRaw>
                <TableHeadRaw>操作</TableHeadRaw>
              </TableRowRaw>
            </TableHeaderRaw>
            <TableBodyRaw>
              {filteredRequirements.length > 0 ? (
                filteredRequirements.map((requirement) => (
                  <TableRowRaw key={requirement.id}>
                    {viewMode === 'unscheduled' && (
                      <TableCellRaw>
                        <Checkbox
                          checked={selectedRequirements.includes(requirement.id)}
                          onCheckedChange={(checked) => handleSelectRequirement(requirement.id, checked as boolean)}
                        />
                      </TableCellRaw>
                    )}
                    <TableCellRaw className="font-mono text-sm">{requirement.id}</TableCellRaw>
                    <TableCellRaw>
                      <div className="max-w-md">
                        <div className="font-medium">{requirement.title}</div>
                        <div className="text-sm text-muted-foreground truncate mt-1">
                          {requirement.description}
                        </div>
                      </div>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline" className={requirementTypeConfig[requirement.type]?.color}>
                        {requirementTypeConfig[requirement.type]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline">
                        {platformConfig[requirement.platform]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline" className={priorityConfig[requirement.priority]?.color}>
                        {priorityConfig[requirement.priority]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline" className={statusConfig[requirement.status].color}>
                        {statusConfig[requirement.status].label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.submitter.username}`} />
                          <AvatarFallback>{requirement.submitter.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{requirement.submitter.name}</span>
                      </div>
                    </TableCellRaw>
                    {viewMode === 'scheduled' && (
                      <TableCellRaw>
                        {requirement.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${requirement.assignee.username}`} />
                              <AvatarFallback>{requirement.assignee.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{requirement.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">未分配</span>
                        )}
                      </TableCellRaw>
                    )}
                    <TableCellRaw className="text-sm">
                      {new Date(requirement.createdAt).toLocaleDateString('zh-CN')}
                    </TableCellRaw>
                    <TableCellRaw>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <a href={`/requirements/${requirement.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </a>
                          </DropdownMenuItem>
                          {viewMode === 'unscheduled' && requirement.status === 'APPROVED' && (
                            <DropdownMenuItem onClick={() => handleBatchSchedule()}>
                              <Calendar className="h-4 w-4 mr-2" />
                              加入排期
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCellRaw>
                  </TableRowRaw>
                ))
              ) : (
                <TableRowRaw>
                  <TableCellRaw 
                    colSpan={viewMode === 'unscheduled' ? 10 : 9} 
                    className="h-24 text-center"
                  >
                    {viewMode === 'unscheduled' ? '暂无未排期需求' : '暂无已排期需求'}
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
