import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Calendar } from './ui/calendar';
import { toast } from "sonner@2.0.3";
import { 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  X,
  EyeOff,
  Target,
  CheckSquare,
  Clock,
  CheckCircle,
  List,
  Trello,
  Calendar as CalendarIcon,
  BarChart3,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Archive,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface Requirement {
  id: string;
  title: string;
  type: 'K线' | '行情' | '聊天室' | '系统' | '交易';
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成';
  priority: '低' | '中' | '高' | '紧急';
  creator: User;
  project: Project;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  assignee?: User;
  platform: string[];
  isOpen: boolean;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  scheduledVersion?: string;
  progress?: number;
}

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

type ViewMode = 'list' | 'kanban' | 'gantt' | 'calendar';

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
  { id: '6', name: '王小明', avatar: '', role: '一级评审员' },
  { id: '7', name: '李晓红', avatar: '', role: '一级评审员' },
  { id: '8', name: '陈大华', avatar: '', role: '二级评审员' },
  { id: '9', name: '刘建国', avatar: '', role: '二级评审员' },
  { id: '10', name: '张志强', avatar: '', role: '二级评审员' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

// 项目数据类型选项
const requirementTypes = [
  'K线', '行情', '聊天室', '系统', '交易'
];

// 应用端选项
const platforms = [
  'PC端', '移动端', 'web端'
];

// 优先级配置
const priorityConfig = {
  '低': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
  '中': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
  '高': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100/80 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
  '紧急': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' }
};

// 状态配置
const statusConfig = {
  '待评审': { className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' },
  '评审中': { className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
  '评审通过': { className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
  '评审不通过': { className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
  '已关闭': { className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' },
  '开发中': { className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
  '已完成': { className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' }
};

// 评审状态配置
const reviewerStatusLabels = {
  pending: { label: '待评审' },
  approved: { label: '已通过' },
  rejected: { label: '已拒绝' }
};

const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: 'K线图实时更新优化',
    type: 'K线',
    status: '开发中',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '优化K线图的实时数据更新机制，提升图表渲染性能',
    tags: ['K线', '实时数据', '性能优化'],
    createdAt: '2024-01-15 14:30',
    updatedAt: '2024-01-20 10:15',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    assignee: mockUsers[2],
    platform: ['web端'],
    isOpen: true,
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[8],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    scheduledVersion: 'v2.3.0',
    progress: 65
  },
  {
    id: '2',
    title: '行情推送服务升级',
    type: '行情',
    status: '评审通过',
    priority: '紧急',
    creator: mockUsers[1],
    project: mockProjects[1],
    description: '升级行情推送服务架构，支持更高并发量',
    tags: ['行情', 'WebSocket', '高并发'],
    createdAt: '2024-01-18 09:20',
    updatedAt: '2024-01-22 16:45',
    startDate: '2024-01-25',
    endDate: '2024-02-20',
    assignee: mockUsers[3],
    platform: ['全平台'],
    isOpen: true,
    reviewer1: mockUsers[6],
    reviewer1Status: 'approved',
    scheduledVersion: 'v2.4.0',
    progress: 0
  },
  {
    id: '3',
    title: '聊天室消息加密功能',
    type: '聊天室',
    status: '待评审',
    priority: '高',
    creator: mockUsers[0],
    project: mockProjects[2],
    description: '为聊天室添加端到端加密功能，保障用户隐私',
    tags: ['聊天室', '加密', '安全'],
    createdAt: '2024-01-20 11:30',
    updatedAt: '2024-01-20 11:30',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    platform: ['移动端', 'web端'],
    isOpen: true,
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[8],
    reviewer1Status: 'pending',
    reviewer2Status: 'pending',
    progress: 0
  },
  {
    id: '4',
    title: '系统权限管理优化',
    type: '系统',
    status: '设计中',
    priority: '中',
    creator: mockUsers[2],
    project: mockProjects[3],
    description: '优化系统权限管理机制，支持更细粒度的权限控制',
    tags: ['权限', '系统', '管理'],
    createdAt: '2024-01-22 15:45',
    updatedAt: '2024-01-25 09:20',
    startDate: '2024-02-05',
    endDate: '2024-03-05',
    assignee: mockUsers[4],
    platform: ['全平台'],
    isOpen: true,
    reviewer1: mockUsers[7],
    reviewer1Status: 'approved',
    scheduledVersion: 'v2.5.0',
    progress: 20
  },
  {
    id: '5',
    title: '交易风控系统升级',
    type: '交易',
    status: '已完成',
    priority: '紧急',
    creator: mockUsers[1],
    project: mockProjects[4],
    description: '升级交易风控系统，增强风险识别能力',
    tags: ['交易', '风控', '安全'],
    createdAt: '2024-01-10 08:15',
    updatedAt: '2024-01-30 17:30',
    startDate: '2024-01-10',
    endDate: '2024-01-30',
    assignee: mockUsers[3],
    platform: ['全平台'],
    isOpen: true,
    reviewer1: mockUsers[6],
    reviewer2: mockUsers[9],
    reviewer1Status: 'approved',
    reviewer2Status: 'approved',
    scheduledVersion: 'v2.2.0',
    progress: 100
  },
  {
    id: '6',
    title: 'K线技术指标扩展',
    type: 'K线',
    status: '评审中',
    priority: '中',
    creator: mockUsers[0],
    project: mockProjects[0],
    description: '扩展K线图技术指标，支持更多专业分析工具',
    tags: ['K线', '技术指标', '分析'],
    createdAt: '2024-01-25 10:00',
    updatedAt: '2024-01-28 14:20',
    startDate: '2024-02-10',
    endDate: '2024-03-15',
    platform: ['web端', 'PC端'],
    isOpen: true,
    reviewer1: mockUsers[5],
    reviewer2: mockUsers[8],
    reviewer1Status: 'approved',
    reviewer2Status: 'pending',
    progress: 0
  }
];

// 可筛选的列
const filterableColumns = [
  { value: 'title', label: '需求标题' },
  { value: 'type', label: '项目类型' },
  { value: 'status', label: '状态' },
  { value: 'priority', label: '优先级' },
  { value: 'platform', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'assignee', label: '负责人' },
  { value: 'reviewStatus', label: '总评审状态' },
  { value: 'scheduledVersion', label: '预排期版本号' },
  { value: 'createdAt', label: '创建时间' }
];

// 筛选操作符
const filterOperators = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
];

// 版本号选项
const versionOptions = [
  'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0', 'v3.0.0'
];

interface RequirementManagementPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function RequirementManagementPage({ context, onNavigate }: RequirementManagementPageProps = {}) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [ganttStartDate, setGanttStartDate] = useState<Date>(new Date(2024, 0, 1));

  // 监听选择状态变化
  useEffect(() => {
    setShowBatchActions(selectedRequirements.length > 0);
  }, [selectedRequirements]);

  // 获取评审状态
  const getReviewStatus = (requirement: Requirement) => {
    if (!requirement.reviewer1 && !requirement.reviewer2) {
      return '无需评审';
    }
    
    if (requirement.reviewer1 && !requirement.reviewer2) {
      if (requirement.reviewer1Status === 'approved') return '评审通过';
      if (requirement.reviewer1Status === 'rejected') return '评审不通过';
      return '待评审';
    }
    
    if (requirement.reviewer1 && requirement.reviewer2) {
      if (requirement.reviewer1Status === 'approved' && requirement.reviewer2Status === 'approved') {
        return '评审通过';
      }
      if (requirement.reviewer1Status === 'rejected' || requirement.reviewer2Status === 'rejected') {
        return '评审不通过';
      }
      if (requirement.reviewer1Status === 'approved' && requirement.reviewer2Status === 'pending') {
        return '二级评审中';
      }
      return '一级评审中';
    }
    
    return '待评审';
  };

  // 筛选和排序逻辑
  const filteredAndSortedRequirements = React.useMemo(() => {
    let filtered = requirements.filter(req => {
      // 搜索筛选
      if (searchTerm && !req.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 自定义筛选
      for (const filter of customFilters) {
        if (!filter.value) continue;
        
        let fieldValue = '';
        switch (filter.column) {
          case 'title':
            fieldValue = req.title;
            break;
          case 'type':
            fieldValue = req.type;
            break;
          case 'status':
            fieldValue = req.status;
            break;
          case 'priority':
            fieldValue = req.priority;
            break;
          case 'platform':
            fieldValue = req.platform.join(', ');
            break;
          case 'creator':
            fieldValue = req.creator.name;
            break;
          case 'assignee':
            fieldValue = req.assignee?.name || '';
            break;
          case 'reviewStatus':
            fieldValue = getReviewStatus(req);
            break;
          case 'scheduledVersion':
            fieldValue = req.scheduledVersion || '';
            break;
          case 'createdAt':
            fieldValue = req.createdAt;
            break;
        }
        
        switch (filter.operator) {
          case 'equals':
            if (fieldValue !== filter.value) return false;
            break;
          case 'not_equals':
            if (fieldValue === filter.value) return false;
            break;
          case 'contains':
            if (!fieldValue.toLowerCase().includes(filter.value.toLowerCase())) return false;
            break;
          case 'not_contains':
            if (fieldValue.toLowerCase().includes(filter.value.toLowerCase())) return false;
            break;
          case 'is_empty':
            if (fieldValue) return false;
            break;
          case 'is_not_empty':
            if (!fieldValue) return false;
            break;
        }
      }
      
      return true;
    });
    
    // 排序
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = '';
        let bValue = '';
        
        switch (sortConfig.column) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'priority':
            const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
            return sortConfig.direction === 'asc' 
              ? priorityOrder[a.priority] - priorityOrder[b.priority]
              : priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'creator':
            aValue = a.creator.name;
            bValue = b.creator.name;
            break;
          case 'createdAt':
            return sortConfig.direction === 'asc'
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }
    
    return filtered;
  }, [requirements, searchTerm, customFilters, sortConfig]);

  // 处理排序
  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        return prev.direction === 'asc' 
          ? { column, direction: 'desc' }
          : null;
      }
      return { column, direction: 'asc' };
    });
  };

  // 添加自定义筛选条件
  const addCustomFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: 'title',
      operator: 'contains',
      value: ''
    };
    setCustomFilters([...customFilters, newFilter]);
  };

  // 删除自定义筛选条件
  const removeCustomFilter = (filterId: string) => {
    setCustomFilters(customFilters.filter(f => f.id !== filterId));
  };

  // 更新自定义筛选条件
  const updateCustomFilter = (filterId: string, field: string, value: string) => {
    setCustomFilters(customFilters.map(f => 
      f.id === filterId ? { ...f, [field]: value } : f
    ));
  };

  // 清除所有筛选条件
  const clearAllFilters = () => {
    setCustomFilters([]);
    setSearchTerm('');
  };

  // 批量操作
  const handleBatchOperation = (operation: string, value?: string) => {
    const selectedReqs = requirements.filter(r => selectedRequirements.includes(r.id));
    
    switch (operation) {
      case 'approve-first-level':
        const eligibleForFirst = selectedReqs.filter(r => 
          r.reviewer1 && r.reviewer1Status !== 'approved'
        );
        if (eligibleForFirst.length === 0) {
          toast.error('所选需求中没有可以通过一级评审的需求');
          return;
        }
        setRequirements(prev => prev.map(r => 
          selectedRequirements.includes(r.id) && r.reviewer1 && r.reviewer1Status !== 'approved'
            ? { ...r, reviewer1Status: 'approved' as const }
            : r
        ));
        toast.success(`已批量通过 ${eligibleForFirst.length} 个需求的一级评审`);
        break;
        
      case 'approve-second-level':
        const eligibleForSecond = selectedReqs.filter(r => 
          r.reviewer2 && r.reviewer1Status === 'approved' && r.reviewer2Status !== 'approved'
        );
        if (eligibleForSecond.length === 0) {
          toast.error('所选需求中没有可以通过二级评审的需求');
          return;
        }
        setRequirements(prev => prev.map(r => 
          selectedRequirements.includes(r.id) && 
          r.reviewer2 && 
          r.reviewer1Status === 'approved' && 
          r.reviewer2Status !== 'approved'
            ? { ...r, reviewer2Status: 'approved' as const }
            : r
        ));
        toast.success(`已批量通过 ${eligibleForSecond.length} 个需求的二级评审`);
        break;
        
      case 'assign-version':
        if (!value) return;
        const eligibleForVersion = selectedReqs.filter(r => getReviewStatus(r) === '评审通过');
        if (eligibleForVersion.length === 0) {
          toast.error('所选需求中没有可以分配版本的需求（需要评审通过）');
          return;
        }
        setRequirements(prev => prev.map(r => 
          selectedRequirements.includes(r.id) && getReviewStatus(r) === '评审通过'
            ? { ...r, scheduledVersion: value }
            : r
        ));
        toast.success(`已为 ${eligibleForVersion.length} 个需求分配版本 ${value}`);
        break;
        
      case 'delete':
        setRequirements(prev => prev.filter(r => !selectedRequirements.includes(r.id)));
        toast.success(`已删除 ${selectedReqs.length} 个需求`);
        break;
    }
    
    setSelectedRequirements([]);
  };

  // 切换视图模式
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedRequirements([]);
  };

  // 按状态分组需求（看板视图用）
  const groupedByStatus = React.useMemo(() => {
    const groups: { [key: string]: Requirement[] } = {
      '待评审': [],
      '评审中': [],
      '评审通过': [],
      '开发中': [],
      '已完成': []
    };
    
    filteredAndSortedRequirements.forEach(req => {
      const status = req.status === '评审不通过' ? '待评审' : req.status;
      if (groups[status]) {
        groups[status].push(req);
      }
    });
    
    return groups;
  }, [filteredAndSortedRequirements]);

  // 获取日历日期的需求
  const getRequirementsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredAndSortedRequirements.filter(req => {
      const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
      const startDate = req.startDate;
      const endDate = req.endDate;
      
      return createdDate === dateStr || 
             startDate === dateStr || 
             (startDate && endDate && dateStr >= startDate && dateStr <= endDate);
    });
  };

  // 渲染列表视图
  const renderListView = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="table-header-unified">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRequirements.length === filteredAndSortedRequirements.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRequirements(filteredAndSortedRequirements.map(r => r.id));
                    } else {
                      setSelectedRequirements([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('title')}
              >
                需求标题
                {sortConfig?.column === 'title' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead>项目类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('priority')}
              >
                优先级
                {sortConfig?.column === 'priority' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>进度</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequirements.map((requirement) => (
              <TableRow key={requirement.id} className="table-content-unified">
                <TableCell>
                  <Checkbox
                    checked={selectedRequirements.includes(requirement.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRequirements([...selectedRequirements, requirement.id]);
                      } else {
                        setSelectedRequirements(selectedRequirements.filter(id => id !== requirement.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{requirement.title}</div>
                    <div className="text-xs text-muted-foreground">{requirement.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: requirement.project.color + '20', color: requirement.project.color }}
                  >
                    {requirement.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusConfig[requirement.status]?.className}>
                    {requirement.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityConfig[requirement.priority].variant} className={priorityConfig[requirement.priority].className}>
                    {requirement.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {requirement.assignee ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {requirement.assignee.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{requirement.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">未分配</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={requirement.progress || 0} className="w-16" />
                    <span className="text-xs text-muted-foreground">{requirement.progress || 0}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {requirement.createdAt}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onNavigate?.('requirement-detail', { requirementId: requirement.id })}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        复制需求
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // 处理拖拽移动需求状态
  const handleDragEnd = (requirementId: string, newStatus: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === requirementId ? { ...req, status: newStatus as any } : req
    ));
    toast.success('需求状态已更新');
  };

  // 渲染看板视图
  const renderKanbanView = () => (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {Object.entries(groupedByStatus).map(([status, reqs]) => (
        <div key={status} className="flex-shrink-0 w-80">
          <div className="bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{status}</h3>
                <Badge variant="secondary" className="badge-unified">
                  {reqs.length}
                </Badge>
              </div>
            </div>
            <div 
              className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const requirementId = e.dataTransfer.getData('text/plain');
                if (requirementId) {
                  handleDragEnd(requirementId, status);
                }
              }}
            >
              {reqs.map((req) => (
                <Card 
                  key={req.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', req.id);
                    e.currentTarget.classList.add('opacity-50');
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.classList.remove('opacity-50');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                          {req.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => onNavigate?.('requirement-detail', { requirementId: req.id })}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-3 w-3" />
                              复制需求
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-3 w-3" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <Badge 
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: req.project.color + '20', color: req.project.color }}
                        >
                          {req.type}
                        </Badge>
                        <Badge variant={priorityConfig[req.priority].variant} className={`text-xs ${priorityConfig[req.priority].className}`}>
                          {req.priority}
                        </Badge>
                        {req.scheduledVersion && (
                          <Badge variant="outline" className="text-xs">
                            {req.scheduledVersion}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {req.description}
                      </p>
                      
                      {req.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">进度</span>
                            <span className="text-muted-foreground">{req.progress}%</span>
                          </div>
                          <Progress value={req.progress} className="h-1.5" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {req.assignee ? (
                          <div className="flex items-center space-x-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {req.assignee.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{req.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">未分配</span>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {req.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-secondary/50 text-secondary-foreground px-1 rounded">
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {req.createdAt.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {reqs.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p>暂无{status}的需求</p>
                  <p className="text-xs mt-1">拖拽需求卡片到此处</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染甘特图视图
  const renderGanttView = () => {
    const daysInView = 30;
    const days = Array.from({ length: daysInView }, (_, i) => {
      const date = new Date(ganttStartDate);
      date.setDate(date.getDate() + i);
      return date;
    });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayOffset = Math.floor((today.getTime() - ganttStartDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(ganttStartDate);
                newDate.setDate(newDate.getDate() - 14);
                setGanttStartDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              上两周
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGanttStartDate(new Date())}
            >
              今天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(ganttStartDate);
                newDate.setDate(newDate.getDate() + 14);
                setGanttStartDate(newDate);
              }}
            >
              下两周
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {ganttStartDate.toLocaleDateString('zh-CN')} - {days[days.length - 1].toLocaleDateString('zh-CN')}
          </div>
        </div>
        
        <div className="border rounded-lg overflow-x-auto shadow-sm">
          <div className="min-w-[1000px]">
            {/* 月份头部 */}
            <div className="flex border-b bg-muted/30">
              <div className="w-72 p-3 border-r font-medium text-sm">需求信息</div>
              <div className="flex-1">
                <div className="flex">
                  {days.map((day, index) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = day.toISOString().split('T')[0] === todayStr;
                    return (
                      <div 
                        key={index} 
                        className={`w-10 p-2 border-r text-center text-xs ${
                          isWeekend ? 'bg-muted/50 text-muted-foreground' : ''
                        } ${isToday ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      >
                        <div className="font-medium">{day.getDate()}</div>
                        <div className="text-xs text-muted-foreground">
                          {['日', '一', '二', '三', '四', '五', '六'][day.getDay()]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* 今日标识线 */}
            {todayOffset >= 0 && todayOffset < daysInView && (
              <div 
                className="absolute z-10 w-0.5 bg-primary opacity-60"
                style={{
                  left: `${72 * 4 + todayOffset * 40 + 20}px`,
                  height: '100%',
                  top: '60px'
                }}
              />
            )}
            
            {/* 甘特图条目 */}
            {filteredAndSortedRequirements
              .filter(req => req.startDate && req.endDate)
              .map((req, reqIndex) => {
                const startDate = new Date(req.startDate!);
                const endDate = new Date(req.endDate!);
                const startOffset = Math.max(0, Math.floor((startDate.getTime() - ganttStartDate.getTime()) / (1000 * 60 * 60 * 24)));
                const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const visibleDuration = Math.min(duration, daysInView - startOffset);
                
                // 根据项目类型选择颜色
                const barColor = req.project.color || '#3b82f6';
                
                return (
                  <div key={req.id} className="flex border-b hover:bg-muted/20 transition-colors group relative">
                    <div className="w-72 p-3 border-r">
                      <div className="space-y-2">
                        <div className="font-medium text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                             onClick={() => onNavigate?.('requirement-detail', { requirementId: req.id })}>
                          {req.title}
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: req.project.color + '20', color: req.project.color }}
                          >
                            {req.type}
                          </Badge>
                          <Badge variant={priorityConfig[req.priority].variant} className={`text-xs ${priorityConfig[req.priority].className}`}>
                            {req.priority}
                          </Badge>
                          {req.assignee && (
                            <div className="flex items-center space-x-1">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs">
                                  {req.assignee.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{req.assignee.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {req.startDate} - {req.endDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <div className="flex h-16">
                        {startOffset < daysInView && visibleDuration > 0 && (
                          <div
                            className="absolute top-3 h-10 rounded-md flex items-center px-2 shadow-sm cursor-pointer hover:shadow-md transition-all group-hover:scale-105"
                            style={{
                              left: `${startOffset * 40 + 2}px`,
                              width: `${visibleDuration * 40 - 4}px`,
                              backgroundColor: barColor,
                              minWidth: '40px'
                            }}
                            title={`${req.title} - ${req.progress || 0}%`}
                          >
                            {/* 进度条 */}
                            <div 
                              className="absolute left-0 top-0 h-full bg-white/20 rounded-md transition-all"
                              style={{ width: `${req.progress || 0}%` }}
                            />
                            
                            {/* 文本信息 */}
                            {visibleDuration > 2 && (
                              <div className="relative z-10 text-white text-xs font-medium">
                                {req.progress || 0}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 背景网格 */}
                        {days.map((day, index) => {
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                          const isToday = day.toISOString().split('T')[0] === todayStr;
                          return (
                            <div 
                              key={index} 
                              className={`w-10 h-16 border-r ${
                                isWeekend ? 'bg-muted/30' : ''
                              } ${isToday ? 'bg-primary/5' : ''}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            
            {/* 空状态提示 */}
            {filteredAndSortedRequirements.filter(req => req.startDate && req.endDate).length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">暂无时间计划的需求</h3>
                <p className="text-muted-foreground text-sm">请先为需求设置开始和结束时间</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 图例 */}
        <div className="flex items-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>项目进度</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary/20 rounded"></div>
            <span>已完成部分</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-0.5 h-3 bg-primary"></div>
            <span>今日线</span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染日历视图
  const renderCalendarView = () => {
    const currentMonth = calendarDate.getMonth();
    const currentYear = calendarDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 添加上个月的天数
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
      days.push({ date, isCurrentMonth: false });
    }
    
    // 添加当前月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // 添加下个月的天数以填满6周
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">
              {calendarDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </h2>
            <p className="text-sm text-muted-foreground">
              查看需求的时间安排和重要节点
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(calendarDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCalendarDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              上月
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarDate(new Date())}
            >
              今天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(calendarDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCalendarDate(newDate);
              }}
            >
              下月
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(groupedByStatus).map(([status, reqs]) => (
            <Card key={status} className="p-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusConfig[status as keyof typeof statusConfig]?.className.includes('bg-') ? 
                    statusConfig[status as keyof typeof statusConfig]?.className.split(' ')[0].replace('bg-', '') : '#666' }}
                />
                <div>
                  <p className="text-sm font-medium">{status}</p>
                  <p className="text-2xl font-bold">{reqs.length}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-7 gap-0">
            {/* 星期头部 */}
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div key={day} className={`p-4 text-center font-medium bg-muted/50 text-sm border-r border-b ${
                index === 0 || index === 6 ? 'text-red-500' : ''
              }`}>
                {day}
              </div>
            ))}
            
            {/* 日期格子 */}
            {days.map((dayInfo, index) => {
              const requirements = getRequirementsForDate(dayInfo.date);
              const dateStr = dayInfo.date.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const isWeekend = dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6;
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-3 border-r border-b transition-colors hover:bg-muted/30 ${
                    !dayInfo.isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : 'bg-background'
                  } ${isToday ? 'bg-primary/5 border-primary/20' : ''} ${
                    isWeekend && dayInfo.isCurrentMonth ? 'bg-muted/10' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 flex items-center justify-between ${
                    isToday ? 'text-primary' : ''
                  }`}>
                    <span className={isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}>
                      {dayInfo.date.getDate()}
                    </span>
                    {requirements.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {requirements.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {requirements.slice(0, 2).map((req) => (
                      <div
                        key={req.id}
                        className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-all hover:scale-105 shadow-sm"
                        style={{ backgroundColor: req.project.color + '20', color: req.project.color, borderLeft: `3px solid ${req.project.color}` }}
                        onClick={() => onNavigate?.('requirement-detail', { requirementId: req.id })}
                        title={req.title}
                      >
                        <div className="font-medium leading-tight">
                          {req.title.length > 12 ? req.title.slice(0, 12) + '...' : req.title}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge 
                            variant={priorityConfig[req.priority].variant} 
                            className={`text-xs scale-75 origin-left ${priorityConfig[req.priority].className}`}
                          >
                            {req.priority}
                          </Badge>
                          {req.assignee && (
                            <Avatar className="w-3 h-3">
                              <AvatarFallback className="text-xs">
                                {req.assignee.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {requirements.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center py-1 hover:text-foreground cursor-pointer transition-colors">
                        +{requirements.length - 2} 更多
                      </div>
                    )}
                    
                    {requirements.length === 0 && dayInfo.isCurrentMonth && (
                      <div className="text-center py-2 opacity-0 hover:opacity-30 transition-opacity">
                        <Plus className="w-4 h-4 mx-auto text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary/10 border-2 border-primary rounded"></div>
            <span>今天</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-muted rounded"></div>
            <span>周末</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-blue-500 rounded"></div>
            <span>需求条目</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 头部工具栏 */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">需求管理</h1>
              <Badge variant="secondary" className="badge-unified">
                {filteredAndSortedRequirements.length} 个需求
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => onNavigate?.('requirement-edit', { 
                  isEdit: false, 
                  source: 'requirement-pool' 
                })}
              >
                <Plus className="w-4 h-4 mr-2" />
                创建需求
              </Button>
            </div>
          </div>

          {/* 视图切换和搜索 */}
          <div className="flex items-center justify-between">
            <Tabs value={viewMode} onValueChange={(value) => handleViewModeChange(value as ViewMode)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="list" className="flex items-center space-x-2">
                  <List className="w-4 h-4" />
                  <span>列表</span>
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center space-x-2">
                  <Trello className="w-4 h-4" />
                  <span>看板</span>
                </TabsTrigger>
                <TabsTrigger value="gantt" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>甘特图</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>日历</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="搜索需求..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                    {customFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2 badge-unified">
                        {customFilters.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>智能筛选</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {customFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Select
                          value={filter.column}
                          onValueChange={(value) => updateCustomFilter(filter.id, 'column', value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filterableColumns.map((col) => (
                              <SelectItem key={col.value} value={col.value}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateCustomFilter(filter.id, 'operator', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filterOperators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          placeholder="筛选值"
                          value={filter.value}
                          onChange={(e) => updateCustomFilter(filter.id, 'value', e.target.value)}
                          className="flex-1"
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomFilter(filter.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={addCustomFilter}>
                        <Plus className="w-4 h-4 mr-2" />
                        添加筛选条件
                      </Button>
                      
                      {customFilters.length > 0 && (
                        <Button variant="ghost" onClick={clearAllFilters}>
                          清除所有筛选
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 批量操作工具栏 */}
          {showBatchActions && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  已选择 {selectedRequirements.length} 个需求
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequirements([])}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchOperation('approve-first-level')}
                >
                  批量通过一级评审
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchOperation('approve-second-level')}
                >
                  批量通过二级评审
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      分配版本
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {versionOptions.map((version) => (
                      <DropdownMenuItem
                        key={version}
                        onClick={() => handleBatchOperation('assign-version', version)}
                      >
                        {version}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBatchOperation('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 p-6 overflow-auto">
        {viewMode === 'list' && renderListView()}
        {viewMode === 'kanban' && renderKanbanView()}
        {viewMode === 'gantt' && renderGanttView()}
        {viewMode === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
}