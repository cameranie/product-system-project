'use client';
 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/kanban';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppLayout } from '@/components/layout/app-layout';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import type { DragEndEvent } from '@dnd-kit/core';
import { addMonths, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { useState } from 'react';
import type { FC } from 'react';
import { Search, ChevronDown, ChevronUp, Bug, Code, Lightbulb, Filter } from 'lucide-react';
import { TagSelector } from '@/components/ui/tag-selector';

const today = new Date();

const exampleStatuses = [
  { id: "1", name: "待办", color: "#6B7280" },
  { id: "2", name: "进行中", color: "#F59E0B" },
  { id: "3", name: "审核中", color: "#8B5CF6" },
  { id: "4", name: "完成", color: "#10B981" },
]

// 扩展任务类型
type TaskType = 'issue' | 'feature' | 'bug' | 'improvement';

interface ExtendedFeature {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  startAt: Date;
  endAt: Date;
  status: typeof exampleStatuses[number];
  group: { id: string; name: string };
  product: { id: string; name: string };
  owner: {
    id: string;
    image: string;
    name: string;
  };
  initiative: { id: string; name: string };
  release: { id: string; name: string };
  version: { id: string; name: string };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  inputSource?: 'kol' | 'user_feedback' | 'internal' | 'data_analysis' | 'strategy';
}

const exampleFeatures: ExtendedFeature[] = [
  {
    id: "1",
    name: "用户认证系统",
    type: "feature",
    startAt: startOfMonth(subMonths(today, 2)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[3], // 完成
    group: { id: "1", name: "核心功能" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "1",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
      name: "张小明",
    },
    initiative: { id: "1", name: "用户体系" },
    release: { id: "1", name: "v1.0" },
    version: { id: "1", name: "v1.0.0" },
    priority: "high",
  },
  {
    id: "2",
    name: "项目看板功能",
    type: "feature",
    startAt: startOfMonth(subMonths(today, 1)),
    endAt: subDays(endOfMonth(today), 3),
    status: exampleStatuses[1],
    group: { id: "2", name: "项目管理" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "2",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2",
      name: "李小红",
    },
    initiative: { id: "2", name: "核心看板" },
    release: { id: "1", name: "v1.0" },
    version: { id: "2", name: "v1.1.0" },
    priority: "medium",
  },
  {
    id: "issue-1",
    name: "用户反馈：需要添加暗色主题",
    description: "多个用户在社区反馈希望能够支持暗色主题，提升夜间使用体验。",
    type: "issue",
    startAt: new Date(),
    endAt: addMonths(new Date(), 1),
    status: exampleStatuses[0],
    group: { id: "ux", name: "用户体验" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "ux1",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=ux1",
      name: "设计师小王",
    },
    initiative: { id: "ui", name: "界面优化" },
    release: { id: "2", name: "v1.1" },
    version: { id: "2", name: "v1.1.0" },
    priority: "medium",
    inputSource: "user_feedback",
  },
  {
    id: "issue-2", 
    name: "KOL建议：优化移动端性能",
    description: "某知名KOL反馈移动端加载速度较慢，影响用户体验。",
    type: "issue",
    startAt: new Date(),
    endAt: addMonths(new Date(), 1),
    status: exampleStatuses[1],
    group: { id: "performance", name: "性能优化" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "dev1",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=dev1", 
      name: "前端工程师小李",
    },
    initiative: { id: "perf", name: "性能提升" },
    release: { id: "2", name: "v1.1" },
    version: { id: "3", name: "v2.0.0" },
    priority: "high",
    inputSource: "kol",
  },
  {
    id: "3",
    name: "任务拖拽排序",
    type: "feature",
    startAt: startOfMonth(subMonths(today, 1)),
    endAt: subDays(endOfMonth(today), 1),
    status: exampleStatuses[1],
    group: { id: "2", name: "项目管理" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "3",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3",
      name: "王小华",
    },
    initiative: { id: "2", name: "核心看板" },
    release: { id: "1", name: "v1.0" },
    version: { id: "1", name: "v1.0.0" },
    priority: "medium",
  },
  {
    id: "4",
    name: "团队协作功能",
    type: "feature",
    startAt: startOfMonth(today),
    endAt: endOfMonth(addMonths(today, 1)),
    status: exampleStatuses[0],
    group: { id: "3", name: "协作工具" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "4",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4",
      name: "赵小强",
    },
    initiative: { id: "3", name: "团队协作" },
    release: { id: "2", name: "v1.1" },
    version: { id: "4", name: "v2.1.0" },
    priority: "medium",
  },
  {
    id: "5",
    name: "实时消息通知",
    type: "feature",
    startAt: startOfMonth(today),
    endAt: endOfMonth(addMonths(today, 1)),
    status: exampleStatuses[0],
    group: { id: "3", name: "协作工具" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "5",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5",
      name: "刘小美",
    },
    initiative: { id: "3", name: "团队协作" },
    release: { id: "2", name: "v1.1" },
    version: { id: "2", name: "v1.1.0" },
    priority: "high",
  },
  {
    id: "6",
    name: "文件上传管理",
    type: "feature",
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: endOfMonth(addMonths(today, 2)),
    status: exampleStatuses[0],
    group: { id: "4", name: "文件系统" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "6",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=6",
      name: "陈小亮",
    },
    initiative: { id: "4", name: "文件管理" },
    release: { id: "2", name: "v1.1" },
    version: { id: "3", name: "v2.0.0" },
    priority: "medium",
  },
  {
    id: "7",
    name: "甘特图视图",
    type: "feature",
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: endOfMonth(addMonths(today, 2)),
    status: exampleStatuses[0],
    group: { id: "2", name: "项目管理" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "7",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=7",
      name: "杨小伟",
    },
    initiative: { id: "2", name: "核心看板" },
    release: { id: "2", name: "v1.1" },
    version: { id: "3", name: "v2.0.0" },
    priority: "medium",
  },
  {
    id: "8",
    name: "数据统计报表",
    type: "feature",
    startAt: startOfMonth(addMonths(today, 2)),
    endAt: endOfMonth(addMonths(today, 3)),
    status: exampleStatuses[0],
    group: { id: "5", name: "数据分析" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "8",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=8",
      name: "周小敏",
    },
    initiative: { id: "5", name: "数据洞察" },
    release: { id: "3", name: "v1.2" },
    version: { id: "4", name: "v2.1.0" },
    priority: "low",
  },
  {
    id: "9",
    name: "移动端适配",
    type: "improvement",
    startAt: startOfMonth(addMonths(today, 2)),
    endAt: endOfMonth(addMonths(today, 4)),
    status: exampleStatuses[0],
    group: { id: "6", name: "用户体验" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "9",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=9",
      name: "吴小军",
    },
    initiative: { id: "6", name: "多端支持" },
    release: { id: "3", name: "v1.2" },
    version: { id: "3", name: "v2.0.0" },
    priority: "medium",
  },
  {
    id: "10",
    name: "权限管理系统",
    type: "feature",
    startAt: startOfMonth(addMonths(today, 3)),
    endAt: endOfMonth(addMonths(today, 4)),
    status: exampleStatuses[0],
    group: { id: "1", name: "核心功能" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "10",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=10",
      name: "徐小丽",
    },
    initiative: { id: "1", name: "用户体系" },
    release: { id: "3", name: "v1.2" },
    version: { id: "4", name: "v2.1.0" },
    priority: "high",
  },
  {
    id: "11",
    name: "API接口文档",
    type: "improvement",
    startAt: startOfMonth(addMonths(today, 4)),
    endAt: endOfMonth(addMonths(today, 5)),
    status: exampleStatuses[0],
    group: { id: "7", name: "开发工具" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "11",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=11",
      name: "孙小勇",
    },
    initiative: { id: "7", name: "开发支持" },
    release: { id: "4", name: "v1.3" },
    version: { id: "2", name: "v1.1.0" },
    priority: "low",
  },
  {
    id: "12",
    name: "自动化测试",
    type: "improvement",
    startAt: startOfMonth(addMonths(today, 4)),
    endAt: endOfMonth(addMonths(today, 6)),
    status: exampleStatuses[0],
    group: { id: "7", name: "开发工具" },
    product: { id: "1", name: "项目管理系统" },
    owner: {
      id: "12",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=12",
      name: "马小花",
    },
    initiative: { id: "7", name: "开发支持" },
    release: { id: "4", name: "v1.3" },
    version: { id: "1", name: "v1.0.0" },
    priority: "medium",
  },
];

// 任务类型配置
const taskTypeConfig = {
  issue: { icon: Bug, label: '产品建议', color: 'bg-orange-100 text-orange-800' },
  feature: { icon: Code, label: '功能开发', color: 'bg-blue-100 text-blue-800' },
  bug: { icon: Bug, label: '缺陷修复', color: 'bg-red-100 text-red-800' },
  improvement: { icon: Lightbulb, label: '改进优化', color: 'bg-green-100 text-green-800' },
};

// 输入源标签


// 优先级标签
const priorityLabels = {
  low: '低',
  medium: '中', 
  high: '高',
  urgent: '紧急'
};

// 版本数据
const versions = [
  { id: '1', name: 'v1.0.0', description: '初始版本' },
  { id: '2', name: 'v1.1.0', description: '功能增强' },
  { id: '3', name: 'v2.0.0', description: '重大更新' },
  { id: '4', name: 'v2.1.0', description: '性能优化' },
];

// 团队成员数据
const teamMembers = [
  {
    id: 1,
    name: "张小明",
    designation: "前端开发",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
  },
  {
    id: 2,
    name: "李小红",
    designation: "后端开发", 
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2",
  },
  {
    id: 3,
    name: "王小强",
    designation: "UI设计师",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3",
  },
  {
    id: 4,
    name: "赵小亮",
    designation: "产品经理",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4",
  },
];

const KanbanPage: FC = () => {
  const [features, setFeatures] = useState(exampleFeatures);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMembers, setExpandedMembers] = useState<Record<number, boolean>>({
    1: true, // 默认展开所有成员
    2: true,
    3: true,
    4: true,
  });
  const [viewMode, setViewMode] = useState<'team' | 'personal'>('team');
  const [selectedVersions, setSelectedVersions] = useState<typeof versions>([]);
  
  // 新任务表单状态
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    type: 'issue' as TaskType,
    priority: 'medium' as ExtendedFeature['priority'],
    inputSource: 'user_feedback' as ExtendedFeature['inputSource'],
  });
 
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
 
    if (!over) {
      return;
    }
 
    const status = exampleStatuses.find((status) => status.name === over.id);
 
    if (!status) {
      return;
    }
 
    setFeatures(
      features.map((feature) => {
        if (feature.id === active.id) {
          return { ...feature, status };
        }
 
        return feature;
      })
    );
  };

  const toggleMemberExpanded = (memberId: number) => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const getTasksByMember = (memberId: number) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return [];
    
    return getFilteredFeatures().filter(feature => feature.owner.name === member.name);
  };

  // 筛选功能
  const getFilteredFeatures = () => {
    let filtered = features;

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(feature =>
        feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 版本筛选
    if (selectedVersions.length > 0) {
      const selectedVersionIds = selectedVersions.map(v => v.id);
      filtered = filtered.filter(feature =>
        selectedVersionIds.includes(feature.version.id)
      );
    }

    return filtered;
  };



  // 创建新任务
  const handleCreateTask = () => {
    const task: ExtendedFeature = {
      id: `${newTask.type}-${Date.now()}`,
      name: newTask.name,
      description: newTask.description,
      type: newTask.type,
      startAt: new Date(),
      endAt: addMonths(new Date(), 1),
      status: exampleStatuses[0], // 默认为"待办"
      group: { id: "user-created", name: "用户创建" },
      product: { id: "1", name: "项目管理系统" },
      owner: {
        id: "current-user",
        image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=current",
        name: "当前用户", // 后续从认证系统获取
      },
      initiative: { id: "user-initiative", name: "用户需求" },
      release: { id: "2", name: "v1.1" },
      version: { id: "2", name: "v1.1.0" },
      priority: newTask.priority,
      inputSource: newTask.inputSource,
    };
    
    setFeatures([...features, task]);
    setNewTask({
      name: '',
      description: '',
      type: 'issue',
      priority: 'medium',
      inputSource: 'user_feedback',
    });
    setIsCreateDialogOpen(false);
  };
 

 
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-xl font-semibold">任务看板</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理团队任务，协作推进项目进度
          </p>
        </div>

        {/* 顶部操作栏 */}
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索任务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 团队成员头像 */}
          <AnimatedTooltip items={teamMembers} />



          {/* 右侧空间填充 */}
          <div className="flex-1"></div>

          {/* 版本筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TagSelector
              availableTags={versions}
              selectedTags={selectedVersions}
              onChange={setSelectedVersions}
              getValue={(version) => version.id}
              getLabel={(version) => version.name}
              createTag={(inputValue: string) => ({ id: `v_${Date.now()}`, name: inputValue, description: '' })}
              className="w-48"
            />
          </div>

          {/* 视图切换开关 - 移到最右侧 */}
          <div className="flex bg-background border border-border rounded-md p-1">
            <button
              onClick={() => setViewMode('team')}
              className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
                viewMode === 'team' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              团队视图
            </button>
            <button
              onClick={() => setViewMode('personal')}
              className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
                viewMode === 'personal' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              个人视图
            </button>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px] z-50">
            <DialogHeader>
              <DialogTitle>创建新任务</DialogTitle>
              <DialogDescription>
                创建产品建议、功能需求或其他工作项
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">任务标题</label>
                <Input
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  placeholder="简洁描述这个任务"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">详细描述</label>
                <Textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="详细描述背景、需求和期望结果"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">任务类型</label>
                  <Select 
                    value={newTask.type} 
                    onValueChange={(value: TaskType) => setNewTask({...newTask, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="issue">产品建议</SelectItem>
                      <SelectItem value="feature">功能开发</SelectItem>
                      <SelectItem value="bug">缺陷修复</SelectItem>
                      <SelectItem value="improvement">改进优化</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">优先级</label>
                  <Select 
                    value={newTask.priority!} 
                    onValueChange={(value) => setNewTask({...newTask, priority: value as ExtendedFeature['priority']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="urgent">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newTask.type === 'issue' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">反馈来源</label>
                  <Select 
                    value={newTask.inputSource!} 
                    onValueChange={(value) => setNewTask({...newTask, inputSource: value as ExtendedFeature['inputSource']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="kol">KOL反馈</SelectItem>
                      <SelectItem value="user_feedback">用户反馈</SelectItem>
                      <SelectItem value="internal">内部反馈</SelectItem>
                      <SelectItem value="data_analysis">数据分析</SelectItem>
                      <SelectItem value="strategy">战略需求</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateTask}
                disabled={!newTask.name}
              >
                创建任务
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* 根据视图模式显示不同内容 */}
        {viewMode === 'team' ? (
          /* 团队视图 - 多人看板 */
          <div className="space-y-8">
            {teamMembers.map((member) => {
              const memberTasks = getTasksByMember(member.id);
              return (
                <div key={member.id} className="space-y-4">
                  {/* 成员按钮 */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMemberExpanded(member.id)}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground">({member.designation})</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {memberTasks.length}
                      </span>
                      {expandedMembers[member.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
      
                  {/* 看板区域 */}
                  {expandedMembers[member.id] && (
                    <KanbanProvider onDragEnd={handleDragEnd}>
                      {exampleStatuses.map((status) => (
                        <KanbanBoard key={status.name} id={status.name}>
                          <KanbanHeader name={status.name} color={status.color} />
                          <KanbanCards>
                          {memberTasks
                            .filter((feature) => feature.status.name === status.name)
                            .map((feature, index) => (
                              <KanbanCard
                                key={feature.id}
                                id={feature.id}
                                name={feature.name}
                                parent={status.name}
                                index={index}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex flex-col gap-2 flex-1">
                                    <h3 className="font-medium text-sm">{feature.name}</h3>
                                    {feature.description && (
                                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge className={taskTypeConfig[feature.type]?.color || 'bg-gray-100 text-gray-800'}>
                                        {taskTypeConfig[feature.type]?.label || '未分类'}
                                      </Badge>
                                      {feature.priority && (
                                        <Badge variant="outline" className="text-xs">
                                          {priorityLabels[feature.priority]}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={feature.owner.image} />
                                    <AvatarFallback>{feature.owner.name[0]}</AvatarFallback>
                                  </Avatar>
                                </div>
                              </KanbanCard>
                            ))}
                        </KanbanCards>
                      </KanbanBoard>
                      ))}
                    </KanbanProvider>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* 个人视图 - 原有的统一看板 */
          <KanbanProvider onDragEnd={handleDragEnd}>
            {exampleStatuses.map((status) => (
              <KanbanBoard key={status.name} id={status.name}>
                <KanbanHeader name={status.name} color={status.color} />
                <KanbanCards>
                  {getFilteredFeatures()
                    .filter((feature) => feature.status.name === status.name)
                    .map((feature, index) => (
                      <KanbanCard
                        key={feature.id}
                        id={feature.id}
                        name={feature.name}
                        parent={status.name}
                        index={index}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex flex-col gap-2 flex-1">
                            <p className="m-0 font-medium text-sm">
                              {feature.name}
                            </p>
                            {feature.description && (
                              <p className="m-0 text-xs text-muted-foreground line-clamp-2">
                                {feature.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={taskTypeConfig[feature.type]?.color || 'bg-gray-100 text-gray-800'}>
                                {taskTypeConfig[feature.type]?.label || '未分类'}
                              </Badge>
                              {feature.priority && (
                                <Badge variant="outline" className="text-xs">
                                  {priorityLabels[feature.priority]}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {feature.owner && (
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarImage src={feature.owner.image} />
                              <AvatarFallback className="text-xs">
                                {feature.owner.name?.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </KanbanCard>
                    ))}
                </KanbanCards>
              </KanbanBoard>
            ))}
          </KanbanProvider>
        )}
      </div>
    </AppLayout>
  );
};

export default KanbanPage;
