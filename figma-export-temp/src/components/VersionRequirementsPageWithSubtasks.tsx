import React, { useState, useRef } from 'react';
import { 
  Search, 
  Plus,
  GitBranch,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

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

interface Department {
  id: string;
  name: string;
}

interface Subtask {
  id: string;
  name: string;
  type: 'predefined' | 'custom';
  executor?: User;
  department?: Department;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  estimatedDuration?: number; // 小时
  actualStartDate?: string;
  actualEndDate?: string;
  actualDuration?: number; // 小时
  status: '未开始' | '进行中' | '已完成' | '已暂停';
  delayStatus: '准时' | '延期' | '提前' | '未知';
}

interface ReviewStatus {
  status: '未开始' | '进行中' | '已完成' | '已暂停' | '有问题';
  reviewer?: User;
  reviewDate?: string;
}

interface VersionRequirement {
  id: string;
  title: string;
  type: '功能需求' | '技术需求' | 'Bug' | '产品建议' | '安全需求';
  version: string;
  scheduledVersion?: string;
  status: '规划中' | '开发中' | '测试中' | '已完成' | '已发布' | '已暂停';
  priority: '低' | '中' | '高' | '紧急';
  assignee: User;
  creator: User;
  productManager: User;
  project: Project;
  platform?: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isOpen: boolean;
  scheduleReviewLevel1: ReviewStatus;
  scheduleReviewLevel2: ReviewStatus;
  subtasks: Subtask[];
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '前端开发' },
  { id: '2', name: '李四', avatar: '', role: '后端开发' },
  { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
  { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
  { id: '5', name: '孙七', avatar: '', role: '前端开发' },
  { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
  { id: '7', name: '测试工程师', avatar: '', role: '测试工程师' },
  { id: '8', name: '设计师', avatar: '', role: 'UI设计师' },
  { id: '9', name: '原型师', avatar: '', role: '原型设计' }
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' }
];

const mockDepartments: Department[] = [
  { id: '1', name: '产品部' },
  { id: '2', name: '设计部' },
  { id: '3', name: '前端开发部' },
  { id: '4', name: '后端开发部' },
  { id: '5', name: '测试部' },
  { id: '6', name: '运营部' }
];

const defaultSubtaskTypes = [
  '原型设计',
  '视觉设计',
  '前端开发',
  '后端开发',
  '测试',
  '产品验收',
  '需求提出者验收'
];

// 计算延期状态
const calculateDelayStatus = (subtask: Subtask): string => {
  if (!subtask.estimatedEndDate) return '未知';
  
  const estimatedEnd = new Date(subtask.estimatedEndDate);
  const now = new Date();
  
  if (subtask.status === '已完成' && subtask.actualEndDate) {
    const actualEnd = new Date(subtask.actualEndDate);
    if (actualEnd <= estimatedEnd) return '准时';
    return '延期';
  }
  
  if (subtask.status === '进行中') {
    if (now > estimatedEnd) return '延期';
    return '准时';
  }
  
  return '未知';
};

// 生成默认子任务
const generateDefaultSubtasks = (requirementId: string): Subtask[] => {
  return defaultSubtaskTypes.map((name, index) => ({
    id: `${requirementId}-subtask-${index + 1}`,
    name,
    type: 'predefined' as const,
    status: '未开始' as const,
    delayStatus: '未知' as const
  }));
};

const mockVersionRequirements: VersionRequirement[] = [
  // v2.0.0 版本需求（3个）
  {
    id: '1',
    title: 'K线图优化升级',
    type: '技术需求',
    version: 'v2.0.0',
    scheduledVersion: 'v2.0.0',
    status: '开发中',
    priority: '高',
    assignee: mockUsers[1],
    creator: mockUsers[4],
    productManager: mockUsers[5],
    project: mockProjects[0],
    platform: 'Web端',
    description: '优化K线图渲染性能，支持更多技术指标和自定义样式',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2023-12-15 16:40',
    updatedAt: '2024-01-20 09:25',
    tags: ['K线', '图表', '性能优化'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2023-12-20 11:30' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2023-12-22 15:45' },
    subtasks: [
      {
        id: '1-subtask-1',
        name: '原型设计',
        type: 'predefined',
        executor: mockUsers[8],
        department: mockDepartments[1],
        estimatedStartDate: '2024-01-01',
        estimatedEndDate: '2024-01-05',
        estimatedDuration: 32,
        actualStartDate: '2024-01-01',
        actualEndDate: '2024-01-04',
        actualDuration: 28,
        status: '已完成',
        delayStatus: '提前'
      },
      {
        id: '1-subtask-2',
        name: '视觉设计',
        type: 'predefined',
        executor: mockUsers[2],
        department: mockDepartments[1],
        estimatedStartDate: '2024-01-06',
        estimatedEndDate: '2024-01-12',
        estimatedDuration: 48,
        actualStartDate: '2024-01-05',
        actualEndDate: '2024-01-14',
        actualDuration: 52,
        status: '已完成',
        delayStatus: '延期'
      },
      {
        id: '1-subtask-3',
        name: '前端开发',
        type: 'predefined',
        executor: mockUsers[0],
        department: mockDepartments[2],
        estimatedStartDate: '2024-01-13',
        estimatedEndDate: '2024-02-15',
        estimatedDuration: 240,
        actualStartDate: '2024-01-15',
        status: '进行中',
        delayStatus: '准时'
      },
      {
        id: '1-subtask-4',
        name: '后端开发',
        type: 'predefined',
        executor: mockUsers[1],
        department: mockDepartments[3],
        estimatedStartDate: '2024-01-13',
        estimatedEndDate: '2024-02-20',
        estimatedDuration: 280,
        status: '未开始',
        delayStatus: '未知'
      },
      {
        id: '1-subtask-5',
        name: '测试',
        type: 'predefined',
        executor: mockUsers[6],
        department: mockDepartments[4],
        estimatedStartDate: '2024-02-21',
        estimatedEndDate: '2024-03-05',
        estimatedDuration: 96,
        status: '未开始',
        delayStatus: '未知'
      }
    ]
  },
  {
    id: '2',
    title: '行情数据推送优化',
    type: 'Bug',
    version: 'v2.0.0',
    scheduledVersion: 'v2.0.0',
    status: '测试中',
    priority: '紧急',
    assignee: mockUsers[2],
    creator: mockUsers[0],
    productManager: mockUsers[5],
    project: mockProjects[1],
    platform: '全平台',
    description: '修复行情数据推送延迟问题，提升数据实时性和准确性',
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    createdAt: '2024-01-28 13:15',
    updatedAt: '2024-02-10 16:20',
    tags: ['行情', '推送', '性能'],
    isOpen: true,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-29 10:00' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-30 14:30' },
    subtasks: generateDefaultSubtasks('2')
  },
  {
    id: '3',
    title: '交易下单流程优化',
    type: '功能需求',
    version: 'v2.0.0',
    scheduledVersion: 'v2.0.0',
    status: '已完成',
    priority: '高',
    assignee: mockUsers[0],
    creator: mockUsers[2],
    productManager: mockUsers[5],
    project: mockProjects[4],
    platform: '移动端',
    description: '简化交易下单流程，提升用户操作体验和交易效率',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    createdAt: '2024-01-10 10:30',
    updatedAt: '2024-02-25 14:20',
    tags: ['交易', '下单', '用户体验'],
    isOpen: false,
    scheduleReviewLevel1: { status: '已完成', reviewer: mockUsers[3], reviewDate: '2024-01-12 09:15' },
    scheduleReviewLevel2: { status: '已完成', reviewer: mockUsers[4], reviewDate: '2024-01-15 16:30' },
    subtasks: generateDefaultSubtasks('3')
  }
];

interface SubtaskRowProps {
  subtask: Subtask;
  onUpdate: (subtask: Subtask) => void;
  onDelete: (subtaskId: string) => void;
}

function SubtaskRow({ subtask, onUpdate, onDelete }: SubtaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubtask, setEditedSubtask] = useState<Subtask>(subtask);

  const handleSave = () => {
    // 重新计算延期状态
    const updatedSubtask = {
      ...editedSubtask,
      delayStatus: calculateDelayStatus(editedSubtask)
    };
    onUpdate(updatedSubtask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSubtask(subtask);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return 'text-green-600';
      case '进行中': return 'text-blue-600';
      case '已暂停': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getDelayStatusColor = (delayStatus: string) => {
    switch (delayStatus) {
      case '延期': return 'text-red-600';
      case '提前': return 'text-green-600';
      case '准时': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <TableRow className="bg-muted/10">
      <TableCell colSpan={8}>
        <div className="pl-8 py-2">
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
              {/* 左侧：任务基本信息 */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  subtask.status === '已完成' ? 'bg-green-500' :
                  subtask.status === '进行中' ? 'bg-blue-500' :
                  subtask.status === '已暂停' ? 'bg-orange-500' : 'bg-gray-300'
                }`}></div>
                
                {isEditing ? (
                  <Input
                    value={editedSubtask.name}
                    onChange={(e) => setEditedSubtask({ ...editedSubtask, name: e.target.value })}
                    className="w-36"
                  />
                ) : (
                  <span className="font-medium text-sm truncate">{subtask.name}</span>
                )}
                
                <Badge variant="outline" className={`${getDelayStatusColor(subtask.delayStatus)} text-xs flex-shrink-0`}>
                  {subtask.delayStatus}
                </Badge>
              </div>

              {/* 中间：字段信息 */}
              <div className="flex items-center gap-4 text-xs flex-shrink-0">
                {/* 执行人 */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-muted-foreground">执行人:</span>
                  {isEditing ? (
                    <Select 
                      value={editedSubtask.executor?.id || ''} 
                      onValueChange={(value) => {
                        const user = mockUsers.find(u => u.id === value);
                        setEditedSubtask({ ...editedSubtask, executor: user });
                      }}
                    >
                      <SelectTrigger className="h-6 w-20 text-xs">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-1">
                      {subtask.executor && (
                        <>
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={subtask.executor.avatar} />
                            <AvatarFallback className="text-xs">{subtask.executor.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-16">{subtask.executor.name}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 部门 */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-muted-foreground">部门:</span>
                  {isEditing ? (
                    <Select 
                      value={editedSubtask.department?.id || ''} 
                      onValueChange={(value) => {
                        const dept = mockDepartments.find(d => d.id === value);
                        setEditedSubtask({ ...editedSubtask, department: dept });
                      }}
                    >
                      <SelectTrigger className="h-6 w-20 text-xs">
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="truncate max-w-16">{subtask.department?.name || '-'}</span>
                  )}
                </div>

                {/* 状态 */}
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">状态:</span>
                  {isEditing ? (
                    <Select 
                      value={editedSubtask.status} 
                      onValueChange={(value: any) => setEditedSubtask({ ...editedSubtask, status: value })}
                    >
                      <SelectTrigger className="h-6 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="未开始">未开始</SelectItem>
                        <SelectItem value="进行中">进行中</SelectItem>
                        <SelectItem value="已完成">已完成</SelectItem>
                        <SelectItem value="已暂停">已暂停</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={`${getStatusColor(subtask.status)} text-xs`}>
                      {subtask.status}
                    </Badge>
                  )}
                </div>

                {/* 预估工时 */}
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">预估:</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedSubtask.estimatedDuration || ''}
                      onChange={(e) => setEditedSubtask({ 
                        ...editedSubtask, 
                        estimatedDuration: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="h-6 w-16 text-xs"
                      placeholder="小时"
                    />
                  ) : (
                    <span>{subtask.estimatedDuration || '-'}h</span>
                  )}
                </div>

                {/* 预估时间 */}
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">预估时间:</span>
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={editedSubtask.estimatedStartDate || ''}
                        onChange={(e) => setEditedSubtask({ ...editedSubtask, estimatedStartDate: e.target.value })}
                        className="h-6 w-24 text-xs"
                      />
                      <span className="text-muted-foreground">~</span>
                      <Input
                        type="date"
                        value={editedSubtask.estimatedEndDate || ''}
                        onChange={(e) => setEditedSubtask({ ...editedSubtask, estimatedEndDate: e.target.value })}
                        className="h-6 w-24 text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-xs">
                      {subtask.estimatedStartDate || '-'} ~ {subtask.estimatedEndDate || '-'}
                    </span>
                  )}
                </div>

                {/* 实际时间 */}
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">实际时间:</span>
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={editedSubtask.actualStartDate || ''}
                        onChange={(e) => setEditedSubtask({ ...editedSubtask, actualStartDate: e.target.value })}
                        className="h-6 w-24 text-xs"
                      />
                      <span className="text-muted-foreground">~</span>
                      <Input
                        type="date"
                        value={editedSubtask.actualEndDate || ''}
                        onChange={(e) => setEditedSubtask({ ...editedSubtask, actualEndDate: e.target.value })}
                        className="h-6 w-24 text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-xs">
                      {subtask.actualStartDate || '-'} ~ {subtask.actualEndDate || '-'}
                    </span>
                  )}
                </div>
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave} className="h-6 w-6 p-0">
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-6 w-6 p-0">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {subtask.type === 'custom' && (
                      <Button size="sm" variant="outline" onClick={() => onDelete(subtask.id)} className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface VersionRequirementsPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

export function VersionRequirementsPageWithSubtasks({ onNavigate }: VersionRequirementsPageProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [requirements, setRequirements] = useState<VersionRequirement[]>(mockVersionRequirements);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {};
    const uniqueVersions = [...new Set(mockVersionRequirements.map(r => r.version || '未分配版本'))];
    uniqueVersions.forEach(version => {
      initialExpanded[version] = true;
    });
    return initialExpanded;
  });
  const [expandedRequirements, setExpandedRequirements] = useState<Record<string, boolean>>({});

  // 版本选项
  const versionOptions = [
    'v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0', 'v1.4.0', 'v1.5.0', 'v1.6.0',
    'v2.0.0', 'v2.1.0', 'v2.2.0', 'v2.3.0', 'v2.4.0', 'v2.5.0',
    'v3.0.0', 'v3.1.0', 'v3.2.0', 'v3.3.0', 'v3.4.0', 'v3.5.0', 'v3.6.0', 'v3.7.0', 'v3.8.0',
    'v4.0.0', 'v4.1.0', 'v4.2.0', 'v4.3.0', 'v4.4.0', 'v4.5.0',
    'v5.0.0', 'v5.1.0', 'v5.2.0',
    'v6.0.0', 'v6.1.0'
  ];

  // 类型选项
  const typeOptions = ['功能需求', '技术需求', 'Bug', '产品建议', '安全需求'];

  // 优先级选项
  const priorityOptions = ['低', '中', '高', '紧急'];

  // 可选的应用端
  const platforms = [
    'Web端', '移动端', '全平台', 'PC端', '小程序'
  ];

  // 处理类型修改
  const handleTypeChange = (requirementId: string, type: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, type, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理优先级修改
  const handlePriorityChange = (requirementId: string, priority: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, priority, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理版本选择
  const handleVersionSelect = (requirementId: string, version: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, version: version === 'unassigned' ? '未分配版本' : version, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理产品负责人修改
  const handleProductManagerChange = (requirementId: string, userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      const updatedRequirements = requirements.map(r => 
        r.id === requirementId 
          ? { ...r, productManager: user, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : r
      );
      setRequirements(updatedRequirements);
    }
  };

  // 处理项目修改
  const handleProjectChange = (requirementId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      const updatedRequirements = requirements.map(r => 
        r.id === requirementId 
          ? { ...r, project, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : r
      );
      setRequirements(updatedRequirements);
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (requirementId: string, platform: string) => {
    const updatedRequirements = requirements.map(r => 
      r.id === requirementId 
        ? { ...r, platform, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
        : r
    );
    setRequirements(updatedRequirements);
  };

  // 处理需求详情点击
  const handleRequirementClick = (requirement: VersionRequirement) => {
    if (onNavigate) {
      onNavigate('requirement-detail', { 
        requirementId: requirement.id, 
        source: 'version-requirements' 
      });
    }
  };

  // 切换需求子任务展开状态
  const toggleRequirementExpanded = (requirementId: string) => {
    setExpandedRequirements(prev => ({
      ...prev,
      [requirementId]: !prev[requirementId]
    }));
  };

  // 处理子任务更新
  const handleSubtaskUpdate = (requirementId: string, updatedSubtask: Subtask) => {
    const updatedRequirements = requirements.map(r => {
      if (r.id === requirementId) {
        const updatedSubtasks = r.subtasks.map(s => 
          s.id === updatedSubtask.id ? updatedSubtask : s
        );
        return { ...r, subtasks: updatedSubtasks };
      }
      return r;
    });
    setRequirements(updatedRequirements);
  };

  // 添加新子任务
  const handleAddSubtask = (requirementId: string, subtaskName: string) => {
    const newSubtask: Subtask = {
      id: `${requirementId}-subtask-${Date.now()}`,
      name: subtaskName,
      type: 'custom',
      status: '未开始',
      delayStatus: '未知'
    };

    const updatedRequirements = requirements.map(r => {
      if (r.id === requirementId) {
        return { ...r, subtasks: [...r.subtasks, newSubtask] };
      }
      return r;
    });
    setRequirements(updatedRequirements);
  };

  // 删除子任务
  const handleDeleteSubtask = (requirementId: string, subtaskId: string) => {
    const updatedRequirements = requirements.map(r => {
      if (r.id === requirementId) {
        const updatedSubtasks = r.subtasks.filter(s => s.id !== subtaskId);
        return { ...r, subtasks: updatedSubtasks };
      }
      return r;
    });
    setRequirements(updatedRequirements);
  };

  // 筛选逻辑 - 只搜索标题
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesVersion = filterVersion === 'all' || req.version === filterVersion;
    const matchesProject = filterProject === 'all' || req.project.id === filterProject;
    
    return matchesSearch && matchesType && matchesPriority && matchesVersion && matchesProject;
  });

  // 按版本分组
  const groupedByVersion = filteredRequirements.reduce((groups, requirement) => {
    const version = requirement.version || '未分配版本';
    
    if (!groups[version]) {
      groups[version] = [];
    }
    groups[version].push(requirement);
    return groups;
  }, {} as Record<string, VersionRequirement[]>);

  // 版本排序 - 未分配版本在前，然后按版本号倒序
  const sortedVersions = Object.keys(groupedByVersion).sort((a, b) => {
    // 未分配版本组永远在最前面
    if (a === '未分配版本') return -1;
    if (b === '未分配版本') return 1;
    
    // 其他版本按版本号倒序排列
    const versionToNumber = (version: string) => {
      const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
      }
      return 0;
    };
    
    return versionToNumber(b) - versionToNumber(a);
  });

  const toggleVersionExpanded = (version: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  // 默认展开所有版本
  React.useEffect(() => {
    const initialExpanded = sortedVersions.reduce((acc, version) => {
      acc[version] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedVersions(initialExpanded);
  }, [sortedVersions.join(',')]);

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">版本需求管理</h1>
          <p className="text-muted-foreground mt-1">
            按版本分组管理需求，跟踪各阶段子任务进度和评审状态
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新建版本需求
        </Button>
      </div>

      {/* 筛选和操作栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* 搜索 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索版本需求..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 快速筛选 */}
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="功能需求">功能需求</SelectItem>
                    <SelectItem value="技术需求">技术需求</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="产品建议">产品建议</SelectItem>
                    <SelectItem value="安全需求">安全需求</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有优先级</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="紧急">紧急</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有项目</SelectItem>
                    {mockProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterVersion} onValueChange={setFilterVersion}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="版本" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有版本</SelectItem>
                    {versionOptions.map(version => (
                      <SelectItem key={version} value={version}>{version}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                共 {filteredRequirements.length} 个版本需求
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 版本需求列表 - 按版本分组 */}
      {sortedVersions.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无版本需求</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                还没有任何版本需求，请先创建版本需求。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              {/* 固定表头 */}
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="min-w-[200px]">标题</TableHead>
                  <TableHead className="w-24">类型</TableHead>
                  <TableHead className="w-20">优先级</TableHead>
                  <TableHead className="w-24">版本号</TableHead>
                  <TableHead className="w-24">创建人</TableHead>
                  <TableHead className="w-24">产品负责人</TableHead>
                  <TableHead className="w-24">项目</TableHead>
                  <TableHead className="w-24">应用端</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVersions.map((version) => {
                  const versionRequirements = groupedByVersion[version];
                  const isVersionExpanded = expandedVersions[version];
                  
                  return (
                    <React.Fragment key={version}>
                      {/* 版本分组头 */}
                      <TableRow 
                        className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-t-2 border-border"
                        onClick={() => toggleVersionExpanded(version)}
                      >
                        <TableCell colSpan={9} className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isVersionExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div className="flex items-center gap-3">
                                {version === '未分配版本' ? (
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <GitBranch className="h-4 w-4 text-primary" />
                                )}
                                <div>
                                  <span className="font-medium">{version}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {versionRequirements.length} 个需求
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* 版本需求列表 */}
                      {isVersionExpanded && versionRequirements.map((requirement) => {
                        const isRequirementExpanded = expandedRequirements[requirement.id];
                        
                        return (
                          <React.Fragment key={requirement.id}>
                            <TableRow className="hover:bg-muted/50">
                              {/* 子任务展开按钮 */}
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRequirementExpanded(requirement.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {isRequirementExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              </TableCell>

                              {/* 标题 - 可点击跳转 */}
                              <TableCell 
                                className="cursor-pointer"
                                onClick={() => handleRequirementClick(requirement)}
                              >
                                <div className="font-medium text-primary hover:underline">
                                  {requirement.title}
                                </div>
                                {requirement.subtasks.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {requirement.subtasks.filter(s => s.status === '已完成').length}/{requirement.subtasks.length} 子任务完成
                                  </div>
                                )}
                              </TableCell>

                              {/* 类型 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                      {requirement.type}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {typeOptions.map((type) => (
                                      <DropdownMenuItem 
                                        key={type} 
                                        onClick={() => handleTypeChange(requirement.id, type)}
                                      >
                                        {type}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 优先级 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant={
                                        requirement.priority === '紧急' ? 'destructive' :
                                        requirement.priority === '高' ? 'default' :
                                        requirement.priority === '中' ? 'secondary' : 'outline'
                                      }
                                      className="cursor-pointer hover:bg-muted text-xs"
                                    >
                                      {requirement.priority}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {priorityOptions.map((priority) => (
                                      <DropdownMenuItem 
                                        key={priority} 
                                        onClick={() => handlePriorityChange(requirement.id, priority)}
                                      >
                                        {priority}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 版本号 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant={requirement.version === '未分配版本' ? 'outline' : 'secondary'}
                                      className="cursor-pointer hover:bg-muted text-xs"
                                    >
                                      {requirement.version}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleVersionSelect(requirement.id, 'unassigned')}>
                                      未分配版本
                                    </DropdownMenuItem>
                                    {versionOptions.map((version) => (
                                      <DropdownMenuItem 
                                        key={version} 
                                        onClick={() => handleVersionSelect(requirement.id, version)}
                                      >
                                        {version}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 创建人 */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={requirement.creator.avatar} />
                                    <AvatarFallback>{requirement.creator.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{requirement.creator.name}</span>
                                </div>
                              </TableCell>

                              {/* 产品负责人 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={requirement.productManager.avatar} />
                                        <AvatarFallback>{requirement.productManager.name[0]}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">{requirement.productManager.name}</span>
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {mockUsers.map((user) => (
                                      <DropdownMenuItem 
                                        key={user.id} 
                                        onClick={() => handleProductManagerChange(requirement.id, user.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                          </Avatar>
                                          {user.name}
                                        </div>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 项目 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge 
                                      variant="secondary" 
                                      style={{ backgroundColor: requirement.project.color + '20', color: requirement.project.color }}
                                      className="cursor-pointer hover:bg-muted text-xs"
                                    >
                                      {requirement.project.name}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {mockProjects.map((project) => (
                                      <DropdownMenuItem 
                                        key={project.id} 
                                        onClick={() => handleProjectChange(requirement.id, project.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: project.color }}></div>
                                          {project.name}
                                        </div>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>

                              {/* 应用端 - 可编辑 */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                                      {requirement.platform || '未指定'}
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    {platforms.map((platform) => (
                                      <DropdownMenuItem 
                                        key={platform} 
                                        onClick={() => handlePlatformChange(requirement.id, platform)}
                                      >
                                        {platform}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>

                            {/* 子任务列表 */}
                            {isRequirementExpanded && (
                              <>
                                {requirement.subtasks.map((subtask) => (
                                  <SubtaskRow
                                    key={subtask.id}
                                    subtask={subtask}
                                    onUpdate={(updatedSubtask) => handleSubtaskUpdate(requirement.id, updatedSubtask)}
                                    onDelete={(subtaskId) => handleDeleteSubtask(requirement.id, subtaskId)}
                                  />
                                ))}
                                
                                {/* 添加子任务行 */}
                                <TableRow className="bg-muted/10">
                                  <TableCell colSpan={9}>
                                    <div className="pl-8 py-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" size="sm" className="text-xs">
                                            <Plus className="h-3 w-3 mr-1" />
                                            添加子任务
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>添加新子任务</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <Input 
                                              placeholder="请输入子任务名称" 
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  const input = e.target as HTMLInputElement;
                                                  if (input.value.trim()) {
                                                    handleAddSubtask(requirement.id, input.value.trim());
                                                    input.value = '';
                                                  }
                                                }
                                              }}
                                            />
                                            <div className="flex gap-2">
                                              {defaultSubtaskTypes.filter(type => 
                                                !requirement.subtasks.some(s => s.name === type)
                                              ).map((type) => (
                                                <Button
                                                  key={type}
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleAddSubtask(requirement.id, type)}
                                                >
                                                  {type}
                                                </Button>
                                              ))}
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}