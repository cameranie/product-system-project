'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRequirementsStore, Requirement, mockUsers } from '@/lib/requirements-store';
import { 
  safeGetItem, 
  safeSetItem, 
  arrayValidator, 
  objectValidator 
} from '@/lib/storage-utils';
import { 
  validateSearchTerm, 
  validateRequirementIds,
  validateReviewOpinion,
  validateIsOperational,
  validatePriority as validatePriorityInput
} from '@/lib/input-validation';
import { executeSyncBatchOperation } from '@/lib/batch-operations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/common/UserAvatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  EyeOff,
  Trash2,
  GripVertical,
} from 'lucide-react';
import {
  getRequirementTypeConfig,
  getPriorityConfig,
  PRIORITY_CONFIG,
  UI_SIZES,
} from '@/config/requirements';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * 可排序的列项组件（用于列隐藏控制）
 */
interface SortableColumnItemProps {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (columnId: string) => void;
}

function SortableColumnItem({ id, label, isVisible, onToggle }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DropdownMenuItem
      ref={setNodeRef}
      style={style}
      onSelect={(e) => e.preventDefault()}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={isVisible}
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span className="flex-1">{label}</span>
    </DropdownMenuItem>
  );
}

/**
 * 预排期需求管理页面
 * 
 * 功能：
 * - 按版本分组展示需求
 * - 二级评审流程展示
 * - 筛选和搜索
 * - 批量操作
 * - 延期标签显示
 * - 高级筛选设置
 * - 列显示/隐藏控制
 */

// 预排期页面可筛选的列
const SCHEDULED_FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'title', label: '标题' },
  { value: 'type', label: '需求类型' },
  { value: 'priority', label: '优先级' },
  { value: 'version', label: '版本号' },
  { value: 'overallReviewStatus', label: '总评审状态' },
  { value: 'level1Reviewer', label: '一级评审人' },
  { value: 'level1Status', label: '一级评审状态' },
  { value: 'level1Opinion', label: '一级评审意见' },
  { value: 'level2Reviewer', label: '二级评审人' },
  { value: 'level2Status', label: '二级评审状态' },
  { value: 'level2Opinion', label: '二级评审意见' },
  { value: 'isOperational', label: '是否运营' },
  { value: 'platforms', label: '应用端' },
  { value: 'creator', label: '创建人' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' },
];

// 默认显示的列
const DEFAULT_VISIBLE_COLUMNS = ['id', 'title', 'type', 'priority', 'version', 'overallReviewStatus', 'level1Reviewer', 'level1Status', 'level1Opinion', 'level2Reviewer', 'level2Status', 'level2Opinion', 'isOperational'];

// 默认列顺序
const DEFAULT_COLUMN_ORDER = ['id', 'title', 'type', 'platforms', 'priority', 'version', 'overallReviewStatus', 'level1Reviewer', 'level1Status', 'level1Opinion', 'level2Reviewer', 'level2Status', 'level2Opinion', 'isOperational', 'creator', 'createdAt', 'updatedAt'];

// 列固定宽度配置（用于固定表头布局）
const COLUMN_WIDTHS: Record<string, string> = {
  id: 'w-24',
  title: 'w-64',
  type: 'w-28',
  platforms: 'w-36',
  priority: 'w-24',
  version: 'w-32',
  overallReviewStatus: 'w-36',
  level1Reviewer: 'w-32',
  level1Status: 'w-28',
  level1Opinion: 'w-32',
  level2Reviewer: 'w-32',
  level2Status: 'w-28',
  level2Opinion: 'w-32',
  isOperational: 'w-24',
  creator: 'w-32',
  createdAt: 'w-36',
  updatedAt: 'w-36',
};

// 列配置版本号（用于检测配置更新）
const COLUMN_CONFIG_VERSION = '5.0';

/**
 * 筛选条件验证器
 */
interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

const filterConditionValidator = objectValidator<FilterCondition>(['id', 'column', 'operator', 'value']);

// 筛选操作符
const FILTER_OPERATORS = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' }
];

// 评审状态选项（一级、二级评审使用）
const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: '待评审', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  { value: 'approved', label: '通过', className: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'rejected', label: '不通过', className: 'bg-red-50 text-red-700 border-red-200' },
];

// 总评审状态选项（根据一级、二级状态计算）
const OVERALL_REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: '待一级评审', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  { value: 'level1_approved', label: '待二级评审', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'level1_rejected', label: '一级评审不通过', className: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'level2_rejected', label: '二级评审不通过', className: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'approved', label: '二级评审通过', className: 'bg-green-50 text-green-700 border-green-200' },
];

// 版本选项（从需求数据中动态获取）
const VERSION_OPTIONS = ['暂无版本号', 'v1.0.0', 'v1.1.0', 'v1.2.0', 'v1.3.0', 'v2.0.0', 'v2.1.0'];

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

export default function ScheduledRequirementsPage() {
  const router = useRouter();
  const { updateRequirement, loading, setLoading } = useRequirementsStore();
  const allRequirements = useRequirementsStore(state => state.requirements);

  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({ field: 'updatedAt', direction: 'desc' });

  // P0: 高级筛选状态（从localStorage安全加载，带版本检测和数据验证）
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>(() => {
    const savedVersion = safeGetItem('scheduled-config-version', '');
    if (savedVersion !== COLUMN_CONFIG_VERSION) {
      return [];
    }
    return safeGetItem(
      'scheduled-custom-filters',
      [],
      arrayValidator(filterConditionValidator.validate)
    );
  });
  
  // P0: 列管理状态（从localStorage安全加载，带版本检测和数据验证）
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => {
    const savedVersion = safeGetItem('scheduled-config-version', '');
    if (savedVersion !== COLUMN_CONFIG_VERSION) {
      // 版本不匹配，使用默认配置并更新版本号
      safeSetItem('scheduled-config-version', COLUMN_CONFIG_VERSION);
      return DEFAULT_COLUMN_ORDER.filter(col => !DEFAULT_VISIBLE_COLUMNS.includes(col));
    }
    return safeGetItem(
      'scheduled-hidden-columns',
      DEFAULT_COLUMN_ORDER.filter(col => !DEFAULT_VISIBLE_COLUMNS.includes(col)),
      arrayValidator((item): item is string => typeof item === 'string')
    );
  });
  
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const savedVersion = safeGetItem('scheduled-config-version', '');
    if (savedVersion !== COLUMN_CONFIG_VERSION) {
      return DEFAULT_COLUMN_ORDER;
    }
    return safeGetItem(
      'scheduled-column-order',
      DEFAULT_COLUMN_ORDER,
      arrayValidator((item): item is string => typeof item === 'string')
    );
  });

  // UI状态
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  
  // 批量操作状态
  const [batchAssignVersion, setBatchAssignVersion] = useState<string>('');
  const [showBatchActions, setShowBatchActions] = useState(false);

  // 评审对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentReviewRequirement, setCurrentReviewRequirement] = useState<Requirement | null>(null);
  const [reviewLevel, setReviewLevel] = useState<number>(1);
  const [reviewOpinion, setReviewOpinion] = useState('');

  // 加载状态
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // P0: 安全保存筛选条件到localStorage
  useEffect(() => {
    safeSetItem('scheduled-custom-filters', customFilters);
  }, [customFilters]);

  // P0: 安全保存列设置到localStorage
  useEffect(() => {
    safeSetItem('scheduled-hidden-columns', hiddenColumns);
  }, [hiddenColumns]);

  useEffect(() => {
    safeSetItem('scheduled-column-order', columnOrder);
  }, [columnOrder]);

  /**
   * 获取预排期需求（needToDo为'是'的需求）
   */
  const scheduledRequirements = useMemo(() => {
    return allRequirements.filter(req => req.needToDo === '是');
  }, [allRequirements]);

  /**
   * 应用筛选和搜索
   */
  const filteredRequirements = useMemo(() => {
    let filtered = [...scheduledRequirements];

    // 搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(term) ||
        req.id.toLowerCase().includes(term) ||
        req.creator.name.toLowerCase().includes(term)
      );
    }

    // 版本筛选
    if (selectedVersion !== 'all') {
      filtered = filtered.filter(req => req.plannedVersion === selectedVersion);
    }

    // 状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    // 自定义筛选
    customFilters.forEach(filter => {
      if (!filter.column || !filter.operator) return;
      
      filtered = filtered.filter(req => {
        const value = String((req as any)[filter.column] || '').toLowerCase();
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.operator) {
          case 'contains':
            return value.includes(filterValue);
          case 'equals':
            return value === filterValue;
          case 'not_equals':
            return value !== filterValue;
          case 'is_empty':
            return !value;
          case 'is_not_empty':
            return !!value;
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [scheduledRequirements, searchTerm, selectedVersion, selectedStatus, customFilters]);

  /**
   * 按版本分组
   */
  const groupedRequirements = useMemo(() => {
    const groups: Record<string, Requirement[]> = {};
    
    filteredRequirements.forEach(req => {
      const version = req.plannedVersion || '未分配版本';
      if (!groups[version]) {
        groups[version] = [];
      }
      groups[version].push(req);
    });

    // 对每个版本内的需求排序
    Object.keys(groups).forEach(version => {
      groups[version].sort((a, b) => {
        const { field, direction } = sortConfig;
        let aValue: any = a[field as keyof Requirement];
        let bValue: any = b[field as keyof Requirement];

        // 处理不同类型的字段
        if (field === 'priority') {
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority || '低'];
          bValue = priorityOrder[b.priority || '低'];
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    });

    return groups;
  }, [filteredRequirements, sortConfig]);

  /**
   * 获取所有版本列表
   */
  const versions = useMemo(() => {
    const versionSet = new Set<string>();
    scheduledRequirements.forEach(req => {
      if (req.plannedVersion) {
        versionSet.add(req.plannedVersion);
      }
    });
    return Array.from(versionSet).sort().reverse();
  }, [scheduledRequirements]);

  /**
   * 初始化展开所有版本
   */
  useEffect(() => {
    setExpandedVersions(new Set(Object.keys(groupedRequirements)));
  }, [groupedRequirements]);

  /**
   * 切换版本展开/折叠
   */
  const toggleVersion = useCallback((version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  }, []);

  /**
   * 排序处理
   */
  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  /**
   * 渲染排序图标
   */
  const renderSortIcon = useCallback((field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className={UI_SIZES.ICON.SMALL} />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className={UI_SIZES.ICON.SMALL} />
    ) : (
      <ArrowDown className={UI_SIZES.ICON.SMALL} />
    );
  }, [sortConfig]);

  /**
   * 计算总评审状态
   * 返回详细的状态：
   * - pending: 待一级评审
   * - level1_approved: 待二级评审
   * - level1_rejected: 一级评审不通过
   * - level2_rejected: 二级评审不通过
   * - approved: 二级评审通过
   */
  const getOverallReviewStatus = useCallback((requirement: Requirement) => {
    if (!requirement.scheduledReview || !requirement.scheduledReview.reviewLevels) {
      return 'pending';
    }
    
    const level1 = requirement.scheduledReview.reviewLevels.find(r => r.level === 1);
    const level2 = requirement.scheduledReview.reviewLevels.find(r => r.level === 2);
    
    // 一级评审不通过
    if (level1?.status === 'rejected') {
      return 'level1_rejected';
    }
    
    // 一级评审通过，但二级评审不通过
    if (level1?.status === 'approved' && level2?.status === 'rejected') {
      return 'level2_rejected';
    }
    
    // 两级都通过
    if (level1?.status === 'approved' && level2?.status === 'approved') {
      return 'approved';
    }
    
    // 一级评审通过，二级待评审
    if (level1?.status === 'approved' && (!level2 || level2?.status === 'pending')) {
      return 'level1_approved';
    }
    
    // 默认：待一级评审
    return 'pending';
  }, []);

  /**
   * 获取评审级别信息
   */
  const getReviewLevelInfo = useCallback((requirement: Requirement, level: number) => {
    if (!requirement.scheduledReview || !requirement.scheduledReview.reviewLevels) {
      return null;
    }
    return requirement.scheduledReview.reviewLevels.find(r => r.level === level);
  }, []);

  /**
   * 渲染评审状态（带Tooltip显示评审意见）
   */
  const renderReviewStatus = useCallback((requirement: Requirement) => {
    const { scheduledReview } = requirement;
    if (!scheduledReview || !scheduledReview.reviewLevels) {
      return <Badge variant="secondary">未评审</Badge>;
    }

    const level1 = scheduledReview.reviewLevels.find(r => r.level === 1);
    const level2 = scheduledReview.reviewLevels.find(r => r.level === 2);

    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {level1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  {level1.status === 'approved' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {level1.status === 'rejected' && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  {level1.status === 'pending' && (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-xs">一级</span>
                </div>
              </TooltipTrigger>
              {level1.opinion && (
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold mb-1">一级评审意见：</p>
                    <p className="text-sm">{level1.opinion}</p>
                    {level1.reviewer && (
                      <p className="text-xs text-muted-foreground mt-1">
                        评审人：{level1.reviewer.name}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )}
          {level2 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  {level2.status === 'approved' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {level2.status === 'rejected' && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  {level2.status === 'pending' && (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-xs">二级</span>
                </div>
              </TooltipTrigger>
              {level2.opinion && (
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold mb-1">二级评审意见：</p>
                    <p className="text-sm">{level2.opinion}</p>
                    {level2.reviewer && (
                      <p className="text-xs text-muted-foreground mt-1">
                        评审人：{level2.reviewer.name}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }, []);

  /**
   * 渲染评审人
   */
  const renderReviewers = useCallback((requirement: Requirement) => {
    const { scheduledReview } = requirement;
    if (!scheduledReview || !scheduledReview.reviewLevels) {
      return <span className="text-sm text-muted-foreground">-</span>;
    }

    const reviewers = scheduledReview.reviewLevels
      .filter(r => r.reviewer)
      .map(r => r.reviewer!);

    if (reviewers.length === 0) {
      return <span className="text-sm text-muted-foreground">未分配</span>;
    }

    return (
      <div className="flex -space-x-2">
        {reviewers.map((reviewer, index) => (
          <Avatar key={index} className={UI_SIZES.AVATAR.SMALL}>
            <AvatarImage src={reviewer.avatar} />
            <AvatarFallback>{reviewer.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  }, []);

  /**
   * 打开评审对话框
   */
  const handleOpenReviewDialog = useCallback((requirement: Requirement, level: number) => {
    setCurrentReviewRequirement(requirement);
    setReviewLevel(level);
    
    // 如果已有评审意见，预填到输入框
    const existingReview = requirement.scheduledReview?.reviewLevels?.find(r => r.level === level);
    setReviewOpinion(existingReview?.opinion || '');
    
    setReviewDialogOpen(true);
  }, []);

  /**
   * 提交评审
   */
  const handleSubmitReview = useCallback((status: 'approved' | 'rejected') => {
    if (!currentReviewRequirement || !currentReviewRequirement.scheduledReview) return;

    const updatedReviewLevels = currentReviewRequirement.scheduledReview.reviewLevels.map(level => {
      if (level.level === reviewLevel) {
        return {
          ...level,
          status,
          opinion: reviewOpinion,
          reviewer: mockUsers[0], // 模拟当前用户
          reviewedAt: new Date().toISOString(),
        };
      }
      return level;
    });

    // 保留 scheduledReview 的所有属性，只更新 reviewLevels
    updateRequirement(currentReviewRequirement.id, {
      scheduledReview: {
        ...currentReviewRequirement.scheduledReview,
        reviewLevels: updatedReviewLevels,
      },
    }).then(() => {
      toast.success(`${reviewLevel === 1 ? '一' : '二'}级评审${status === 'approved' ? '通过' : '不通过'}成功`);
      setReviewDialogOpen(false);
      setReviewOpinion('');
    }).catch((error) => {
      toast.error('评审提交失败');
      console.error(error);
    });
  }, [currentReviewRequirement, reviewLevel, reviewOpinion, updateRequirement]);

  /**
   * 处理复选框选择
   */
  const handleSelectRequirement = useCallback((requirementId: string, checked: boolean) => {
    setSelectedRequirements(prev => {
      if (checked) {
        return [...prev, requirementId];
      } else {
        return prev.filter(id => id !== requirementId);
      }
    });
  }, []);

  /**
   * 处理全选
   */
  const handleSelectAll = useCallback((version: string, checked: boolean) => {
    const versionRequirements = groupedRequirements[version] || [];
    const versionRequirementIds = versionRequirements.map(r => r.id);
    
    setSelectedRequirements(prev => {
      if (checked) {
        // 添加当前版本的所有需求
        const newIds = versionRequirementIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      } else {
        // 移除当前版本的所有需求
        return prev.filter(id => !versionRequirementIds.includes(id));
      }
    });
  }, [groupedRequirements]);

  /**
   * 批量分配版本
   */
  const handleBatchAssignVersion = useCallback(() => {
    if (selectedRequirements.length === 0) {
      toast.error('请先选择需求');
      return;
    }
    if (!batchAssignVersion) {
      toast.error('请选择版本');
      return;
    }

    selectedRequirements.forEach(id => {
      updateRequirement(id, { plannedVersion: batchAssignVersion });
    });

    toast.success(`已将 ${selectedRequirements.length} 个需求分配到 ${batchAssignVersion}`);
    setSelectedRequirements([]);
    setBatchAssignVersion('');
  }, [selectedRequirements, batchAssignVersion, updateRequirement]);

  /**
   * 批量评审
   */
  const handleBatchReview = useCallback((level: number, status: 'approved' | 'rejected') => {
    if (selectedRequirements.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    selectedRequirements.forEach(id => {
      const requirement = allRequirements.find(r => r.id === id);
      if (!requirement || !requirement.scheduledReview) return;

      const updatedReviewLevels = requirement.scheduledReview.reviewLevels.map(l => {
        if (l.level === level) {
          return {
            ...l,
            status,
            reviewedAt: new Date().toISOString(),
          };
        }
        return l;
      });

      // 保留 scheduledReview 的所有属性，只更新 reviewLevels
      updateRequirement(id, {
        scheduledReview: {
          ...requirement.scheduledReview,
          reviewLevels: updatedReviewLevels,
        },
      });
    });

    toast.success(`已${status === 'approved' ? '通过' : '不通过'} ${selectedRequirements.length} 个需求的${level === 1 ? '一' : '二'}级评审`);
    setSelectedRequirements([]);
  }, [selectedRequirements, allRequirements, updateRequirement]);

  /**
   * 批量设置是否运营
   */
  const handleBatchIsOperational = useCallback((value: 'yes' | 'no') => {
    if (selectedRequirements.length === 0) {
      toast.error('请先选择需求');
      return;
    }

    selectedRequirements.forEach(id => {
      updateRequirement(id, {
        isOperational: value,
      });
    });

    const labelMap = {
      'yes': '是',
      'no': '否'
    };
    toast.success(`已将 ${selectedRequirements.length} 个需求的是否运营设置为 ${labelMap[value]}`);
    setSelectedRequirements([]);
  }, [selectedRequirements, updateRequirement]);

  // 显示批量操作面板
  useEffect(() => {
    setShowBatchActions(selectedRequirements.length > 0);
  }, [selectedRequirements]);

  /**
   * 高级筛选管理
   */
  const handleAddCustomFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      column: '',
      operator: 'contains',
      value: '',
    };
    setCustomFilters(prev => [...prev, newFilter]);
  }, []);

  const handleUpdateCustomFilter = useCallback((id: string, field: string, value: string) => {
    setCustomFilters(prev =>
      prev.map(filter =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  }, []);

  const handleRemoveCustomFilter = useCallback((id: string) => {
    setCustomFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setCustomFilters([]);
    setSearchTerm('');
    setSelectedVersion('all');
    setSelectedStatus('all');
    toast.success('已清空所有筛选条件');
  }, []);

  /**
   * 列管理
   */
  const handleToggleColumn = useCallback((column: string) => {
    setHiddenColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(c => c !== column);
      } else {
        return [...prev, column];
      }
    });
  }, []);

  const handleColumnReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  /**
   * 判断列是否可见
   */
  const isColumnVisible = useCallback((column: string) => {
    return !hiddenColumns.includes(column);
  }, [hiddenColumns]);

  /**
   * 拖拽传感器配置
   */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * 处理列拖拽结束
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((prevOrder) => {
        const oldIndex = prevOrder.indexOf(active.id as string);
        const newIndex = prevOrder.indexOf(over.id as string);
        return arrayMove(prevOrder, oldIndex, newIndex);
      });
    }
  }, []);

  /**
   * 获取有序的列配置
   */
  const orderedColumns = useMemo(() => {
    return columnOrder
      .map(id => SCHEDULED_FILTERABLE_COLUMNS.find(col => col.value === id))
      .filter(Boolean) as typeof SCHEDULED_FILTERABLE_COLUMNS;
  }, [columnOrder]);

  /**
   * 根据列ID渲染表头（带固定宽度）- 使用原生th标签
   */
  const renderTableHeader = useCallback((columnId: string) => {
    if (!isColumnVisible(columnId)) return null;
    const widthClass = COLUMN_WIDTHS[columnId] || 'w-32';
    const baseClass = `${widthClass} h-10 px-2 text-left align-middle font-medium text-sm text-muted-foreground flex-shrink-0`;

    switch (columnId) {
      case 'id':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('id')}
              className="hover:bg-transparent"
            >
              ID
              {renderSortIcon('id')}
            </Button>
          </th>
        );
      case 'title':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('title')}
              className="hover:bg-transparent"
            >
              标题
              {renderSortIcon('title')}
            </Button>
          </th>
        );
      case 'type':
        return <th key={columnId} className={baseClass}>类型</th>;
      case 'priority':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('priority')}
              className="hover:bg-transparent"
            >
              优先级
              {renderSortIcon('priority')}
            </Button>
          </th>
        );
      case 'version':
        return <th key={columnId} className={baseClass}>版本号</th>;
      case 'overallReviewStatus':
        return <th key={columnId} className={baseClass}>总评审状态</th>;
      case 'level1Reviewer':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('level1Reviewer')}
              className="hover:bg-transparent"
            >
              一级评审人
              {renderSortIcon('level1Reviewer')}
            </Button>
          </th>
        );
      case 'level1Status':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('level1Status')}
              className="hover:bg-transparent"
            >
              一级评审状态
              {renderSortIcon('level1Status')}
            </Button>
          </th>
        );
      case 'level1Opinion':
        return <th key={columnId} className={baseClass}>一级评审意见</th>;
      case 'level2Reviewer':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('level2Reviewer')}
              className="hover:bg-transparent"
            >
              二级评审人
              {renderSortIcon('level2Reviewer')}
            </Button>
          </th>
        );
      case 'level2Status':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('level2Status')}
              className="hover:bg-transparent"
            >
              二级评审状态
              {renderSortIcon('level2Status')}
            </Button>
          </th>
        );
      case 'level2Opinion':
        return <th key={columnId} className={baseClass}>二级评审意见</th>;
      case 'isOperational':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('isOperational')}
              className="hover:bg-transparent"
            >
              是否运营
              {renderSortIcon('isOperational')}
            </Button>
          </th>
        );
      case 'platforms':
        return <th key={columnId} className={baseClass}>应用端</th>;
      case 'creator':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('creator')}
              className="hover:bg-transparent"
            >
              创建人
              {renderSortIcon('creator')}
            </Button>
          </th>
        );
      case 'createdAt':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('createdAt')}
              className="hover:bg-transparent"
            >
              创建时间
              {renderSortIcon('createdAt')}
            </Button>
          </th>
        );
      case 'updatedAt':
        return (
          <th key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('updatedAt')}
              className="hover:bg-transparent"
            >
              更新时间
              {renderSortIcon('updatedAt')}
            </Button>
          </th>
        );
      default:
        return null;
    }
  }, [isColumnVisible, handleSort, renderSortIcon]);

  /**
   * 根据列ID渲染表格单元格（带固定宽度）- 使用原生td标签
   */
  const renderTableCell = useCallback((columnId: string, requirement: Requirement) => {
    if (!isColumnVisible(columnId)) return null;
    const widthClass = COLUMN_WIDTHS[columnId] || 'w-32';
    const baseClass = `${widthClass} p-2 align-middle flex-shrink-0`;

    switch (columnId) {
      case 'id':
        return (
          <td key={columnId} className={`${baseClass} font-mono text-sm`}>
            {requirement.id}
          </td>
        );
      case 'title':
        return (
          <td key={columnId} className={baseClass}>
            <div className="space-y-1">
              <Link
                href={`/requirements/${encodeURIComponent(requirement.id)}?from=scheduled`}
                className="hover:underline font-medium block truncate"
                title={requirement.title}
              >
                {requirement.title}
              </Link>
              <div className="flex items-center gap-2">
                {requirement.delayTag && (
                  <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border-red-200">
                    <Clock className="h-3 w-3 mr-1" />
                    {requirement.delayTag}
                  </span>
                )}
              </div>
            </div>
          </td>
        );
      case 'type':
        return (
          <td key={columnId} className={baseClass}>
            <span className="text-sm truncate block" title={getRequirementTypeConfig(requirement.type)?.label || requirement.type}>
              {getRequirementTypeConfig(requirement.type)?.label || requirement.type}
            </span>
          </td>
        );
      case 'priority':
        const currentPriority = requirement.priority;
        const priorityConfig = currentPriority ? getPriorityConfig(currentPriority) : null;
        // 按优先级从高到低排序：紧急 > 高 > 中 > 低
        const priorityOrder = ['紧急', '高', '中', '低'];
        return (
          <td key={columnId} className={baseClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-6 px-2 py-1 text-xs rounded-md ${priorityConfig?.className || 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center`}
                >
                  {priorityConfig?.label || '-'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-20">
                {priorityOrder.map(key => {
                  const config = PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG];
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => {
                        // 如果点击的是当前选中项，则取消选择（设为空）
                        if (currentPriority === key) {
                          updateRequirement(requirement.id, { priority: undefined });
                          toast.success('已取消优先级');
                        } else {
                          updateRequirement(requirement.id, { priority: key as any });
                          toast.success('优先级已更新');
                        }
                      }}
                      className={`cursor-pointer ${currentPriority === key ? 'bg-accent' : ''}`}
                    >
                      <span className={`px-2 py-1 rounded text-sm ${config.className} inline-block`}>
                        {config.label}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        );
      
      // 版本号 - 可下拉选择
      case 'version':
        const currentVersion = requirement.plannedVersion || '暂无版本号';
        return (
          <td key={columnId} className={baseClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs font-normal hover:bg-accent hover:text-accent-foreground"
                >
                  {currentVersion}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32">
                {VERSION_OPTIONS.map(version => (
                  <DropdownMenuItem
                    key={version}
                    onClick={() => {
                      updateRequirement(requirement.id, { plannedVersion: version === '暂无版本号' ? undefined : version });
                      toast.success('版本号已更新');
                    }}
                    className={currentVersion === version ? 'bg-accent' : ''}
                  >
                    {version}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        );
      
      // 总评审状态 - 自动计算
      case 'overallReviewStatus':
        const overallStatus = getOverallReviewStatus(requirement);
        const statusConfig = OVERALL_REVIEW_STATUS_OPTIONS.find(s => s.value === overallStatus);
        return (
          <td key={columnId} className={baseClass}>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusConfig?.className || ''} truncate`} title={statusConfig?.label}>
              {statusConfig?.label || '待一级评审'}
            </span>
          </td>
        );
      
      // 一级评审人
      case 'level1Reviewer':
        const level1Info = getReviewLevelInfo(requirement, 1);
        return (
          <td key={columnId} className={baseClass}>
            {level1Info?.reviewer ? (
              <UserAvatar user={level1Info.reviewer} size="sm" showName />
            ) : (
              <span className="text-sm text-muted-foreground">未分配</span>
            )}
          </td>
        );
      
      // 一级评审状态 - 可下拉选择
      case 'level1Status':
        const level1 = getReviewLevelInfo(requirement, 1);
        const level1StatusConfig = REVIEW_STATUS_OPTIONS.find(s => s.value === (level1?.status || 'pending'));
        return (
          <td key={columnId} className={baseClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 text-xs font-normal ${level1StatusConfig?.className || ''}`}
                >
                  {level1StatusConfig?.label || '待评审'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-28">
                {REVIEW_STATUS_OPTIONS.map(status => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => {
                      if (!requirement.scheduledReview) return;
                      const updatedLevels = requirement.scheduledReview.reviewLevels.map(l =>
                        l.level === 1 ? { ...l, status: status.value as any, reviewedAt: new Date().toISOString() } : l
                      );
                      updateRequirement(requirement.id, {
                        scheduledReview: { ...requirement.scheduledReview, reviewLevels: updatedLevels }
                      });
                      toast.success('一级评审状态已更新');
                    }}
                    className={level1?.status === status.value ? 'bg-accent' : ''}
                  >
                    <span className={`${status.className}`}>{status.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        );
      
      // 一级评审意见 - 可点击填写
      case 'level1Opinion':
        const level1OpinionInfo = getReviewLevelInfo(requirement, 1);
        return (
          <td key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleOpenReviewDialog(requirement, 1)}
              title={level1OpinionInfo?.opinion || '点击填写一级评审意见'}
            >
              {level1OpinionInfo?.opinion ? (
                <span className="text-sm truncate max-w-[100px]">
                  {level1OpinionInfo.opinion}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">填写意见</span>
              )}
            </Button>
          </td>
        );
      
      // 二级评审人
      case 'level2Reviewer':
        const level2Info = getReviewLevelInfo(requirement, 2);
        return (
          <td key={columnId} className={baseClass}>
            {level2Info?.reviewer ? (
              <UserAvatar user={level2Info.reviewer} size="sm" showName />
            ) : (
              <span className="text-sm text-muted-foreground">未分配</span>
            )}
          </td>
        );
      
      // 二级评审状态 - 可下拉选择
      case 'level2Status':
        const level2 = getReviewLevelInfo(requirement, 2);
        const level2StatusConfig = REVIEW_STATUS_OPTIONS.find(s => s.value === (level2?.status || 'pending'));
        return (
          <td key={columnId} className={baseClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 text-xs font-normal ${level2StatusConfig?.className || ''}`}
                >
                  {level2StatusConfig?.label || '待评审'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-28">
                {REVIEW_STATUS_OPTIONS.map(status => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => {
                      if (!requirement.scheduledReview) return;
                      const updatedLevels = requirement.scheduledReview.reviewLevels.map(l =>
                        l.level === 2 ? { ...l, status: status.value as any, reviewedAt: new Date().toISOString() } : l
                      );
                      updateRequirement(requirement.id, {
                        scheduledReview: { ...requirement.scheduledReview, reviewLevels: updatedLevels }
                      });
                      toast.success('二级评审状态已更新');
                    }}
                    className={level2?.status === status.value ? 'bg-accent' : ''}
                  >
                    <span className={`${status.className}`}>{status.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        );
      
      // 二级评审意见 - 可点击填写
      case 'level2Opinion':
        const level2OpinionInfo = getReviewLevelInfo(requirement, 2);
        return (
          <td key={columnId} className={baseClass}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleOpenReviewDialog(requirement, 2)}
              title={level2OpinionInfo?.opinion || '点击填写二级评审意见'}
            >
              {level2OpinionInfo?.opinion ? (
                <span className="text-sm truncate max-w-[100px]">
                  {level2OpinionInfo.opinion}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">填写意见</span>
              )}
            </Button>
          </td>
        );
      
      // 是否运营 - 可下拉选择
      case 'isOperational':
        const operationalOptions = [
          { value: 'unset', label: '未填写', className: 'text-muted-foreground' },
          { value: 'yes', label: '是', className: 'text-purple-700' },
          { value: 'no', label: '否', className: 'text-gray-700' }
        ];
        const currentOperational = requirement.isOperational || 'unset';
        const operationalConfig = operationalOptions.find(o => o.value === currentOperational);
        return (
          <td key={columnId} className={baseClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 text-xs font-normal ${operationalConfig?.className || ''}`}
                >
                  {operationalConfig?.label || '未填写'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-24">
                {operationalOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      updateRequirement(requirement.id, { 
                        isOperational: option.value === 'unset' ? undefined : option.value as 'yes' | 'no' 
                      });
                      toast.success('是否运营已更新');
                    }}
                    className={currentOperational === option.value ? 'bg-accent' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        );
      
      case 'platforms':
        return (
          <td key={columnId} className={baseClass}>
            <span className="text-sm truncate block" title={requirement.platforms.join(', ')}>
              {requirement.platforms.join(', ')}
            </span>
          </td>
        );
      
      case 'creator':
        return (
          <td key={columnId} className={baseClass}>
            <UserAvatar user={requirement.creator} size="sm" showName />
          </td>
        );
      case 'createdAt':
        return (
          <td key={columnId} className={`${baseClass} text-sm`}>
            {requirement.createdAt}
          </td>
        );
      case 'updatedAt':
        return (
          <td key={columnId} className={`${baseClass} text-sm`}>
            {requirement.updatedAt}
          </td>
        );
      default:
        return null;
    }
  }, [isColumnVisible, getOverallReviewStatus, getReviewLevelInfo, handleOpenReviewDialog, updateRequirement]);

  /**
   * 获取有效的筛选条件（用于显示）
   */
  const validCustomFilters = useMemo(() => {
    return customFilters.filter(f => f.column && f.operator && f.value.trim() !== '');
  }, [customFilters]);

  /**
   * 统计信息
   */
  const stats = useMemo(() => {
    return {
      total: scheduledRequirements.length,
      pending: scheduledRequirements.filter(r => 
        r.scheduledReview?.reviewLevels?.some(l => l.status === 'pending')
      ).length,
      approved: scheduledRequirements.filter(r =>
        r.scheduledReview?.reviewLevels?.every(l => l.status === 'approved')
      ).length,
      rejected: scheduledRequirements.filter(r =>
        r.scheduledReview?.reviewLevels?.some(l => l.status === 'rejected')
      ).length,
    };
  }, [scheduledRequirements]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 固定区域：搜索栏和批量操作 */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* 筛选栏 */}
          <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索需求标题、ID、创建人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 筛选设置 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                className={validCustomFilters.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
              >
                <Settings className="h-4 w-4 mr-2" />
                {validCustomFilters.length > 0 ? `${validCustomFilters.length} 筛选设置` : '筛选设置'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[600px]" sideOffset={4}>
              {customFilters.map((filter) => (
                <div key={filter.id} className="p-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={filter.column}
                      onValueChange={(value) => handleUpdateCustomFilter(filter.id, 'column', value)}
                    >
                      <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.MEDIUM}`}>
                        <SelectValue placeholder="选择列" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULED_FILTERABLE_COLUMNS.map((col) => (
                          <SelectItem key={col.value} value={col.value}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => handleUpdateCustomFilter(filter.id, 'operator', value)}
                    >
                      <SelectTrigger className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} ${UI_SIZES.INPUT.SMALL}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="筛选值"
                      value={filter.value}
                      onChange={(e) => handleUpdateCustomFilter(filter.id, 'value', e.target.value)}
                      className={`${UI_SIZES.BUTTON.INPUT_HEIGHT} flex-1`}
                      disabled={filter.operator === 'is_empty' || filter.operator === 'is_not_empty'}
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomFilter(filter.id)}
                      className={UI_SIZES.BUTTON.ICON_MEDIUM}
                    >
                      <Trash2 className={UI_SIZES.ICON.SMALL} />
                    </Button>
                  </div>
                </div>
              ))}
              
              <DropdownMenuSeparator />
              <div className="p-2 flex gap-2">
                <Button onClick={handleAddCustomFilter} variant="outline" size="sm" className="flex-1">
                  <Plus className="h-3 w-3 mr-1" />
                  添加条件
                </Button>
                {validCustomFilters.length > 0 && (
                  <Button onClick={handleClearAllFilters} variant="outline" size="sm" className="flex-1">
                    <Trash2 className="h-3 w-3 mr-1" />
                    清空所有
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 列隐藏控制 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                className={hiddenColumns.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                {hiddenColumns.length > 0 ? `${hiddenColumns.length} 列隐藏` : '列隐藏'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64"
              onPointerLeave={(e) => {
                const target = e.target as HTMLElement;
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (relatedTarget && target.contains(relatedTarget)) {
                  e.preventDefault();
                }
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columnOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedColumns.map((col) => (
                    <SortableColumnItem
                      key={col.value}
                      id={col.value}
                      label={col.label}
                      isVisible={!hiddenColumns.includes(col.value)}
                      onToggle={handleToggleColumn}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button 
                  onClick={() => {
                    setHiddenColumns(DEFAULT_COLUMN_ORDER.filter(col => !DEFAULT_VISIBLE_COLUMNS.includes(col)));
                    setColumnOrder(DEFAULT_COLUMN_ORDER);
                    toast.success('已恢复默认列设置');
                  }} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  恢复默认
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          {/* 批量操作栏 */}
          {showBatchActions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    已选择 <span className="text-blue-600">{selectedRequirements.length}</span> 个需求
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRequirements([])}
                  >
                    <X className="h-3 w-3 mr-1" />
                    取消选择
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        批量分配版本
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {versions.map(version => (
                        <DropdownMenuItem
                          key={version}
                          onClick={() => {
                            setBatchAssignVersion(version);
                            handleBatchAssignVersion();
                          }}
                        >
                          {version}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        批量评审
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBatchReview(1, 'approved')}>
                        一级评审通过
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchReview(1, 'rejected')}>
                        一级评审不通过
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchReview(2, 'approved')}>
                        二级评审通过
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchReview(2, 'rejected')}>
                        二级评审不通过
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        批量是否运营
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBatchIsOperational('yes')}>
                        设置为 是
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchIsOperational('no')}>
                        设置为 否
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 pt-4">
        {/* 需求列表 - 固定表头布局 */}
        <div className="space-y-4">
          {Object.keys(groupedRequirements).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>没有找到预排期需求</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              {/* 表格 */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="w-12 h-10 px-2 text-left align-middle font-medium text-sm text-muted-foreground flex-shrink-0">
                        <Checkbox
                          checked={
                            filteredRequirements.length > 0 &&
                            filteredRequirements.every(r => selectedRequirements.includes(r.id))
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRequirements(filteredRequirements.map(r => r.id));
                            } else {
                              setSelectedRequirements([]);
                            }
                          }}
                        />
                      </th>
                      {columnOrder.map(columnId => renderTableHeader(columnId))}
                    </tr>
                  </thead>
                </table>
              </div>
              
              {/* 版本分组列表 */}
              <div className="space-y-0">
                {Object.entries(groupedRequirements).map(([version, requirements]) => {
                  // 计算该版本的选择状态
                  const versionRequirementIds = requirements.map(r => r.id);
                  const selectedInVersion = versionRequirementIds.filter(id => selectedRequirements.includes(id));
                  const isAllVersionSelected = selectedInVersion.length === versionRequirementIds.length && versionRequirementIds.length > 0;
                  const isSomeVersionSelected = selectedInVersion.length > 0 && selectedInVersion.length < versionRequirementIds.length;

                  return (
                  <Collapsible
                    key={version}
                    open={expandedVersions.has(version)}
                    onOpenChange={() => toggleVersion(version)}
                  >
                    {/* 版本号标题 */}
                    <div className="w-full border-b-2 border-t-2 bg-muted/30">
                      <div className="flex items-center py-2 hover:bg-accent/50 transition-colors">
                        {/* 版本级复选框 - 与下方需求列表的复选框对齐 */}
                        <div 
                          className="w-12 flex items-center justify-center flex-shrink-0" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isAllVersionSelected}
                            ref={(el) => {
                              if (el) {
                                (el as any).indeterminate = isSomeVersionSelected;
                              }
                            }}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // 选择该版本下的所有需求
                                setSelectedRequirements(prev => {
                                  const newSelected = new Set(prev);
                                  versionRequirementIds.forEach(id => newSelected.add(id));
                                  return Array.from(newSelected);
                                });
                              } else {
                                // 取消选择该版本下的所有需求
                                setSelectedRequirements(prev => 
                                  prev.filter(id => !versionRequirementIds.includes(id))
                                );
                              }
                            }}
                          />
                        </div>
                        
                        {/* 展开/收起按钮和版本信息 */}
                        <CollapsibleTrigger className="flex-1 flex items-center justify-between pr-4">
                          <div className="flex items-center gap-2.5">
                            {expandedVersions.has(version) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <h3 className="text-sm font-semibold">{version}</h3>
                            <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                              {requirements.length} 个需求
                            </span>
                          </div>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  
                  {/* 版本下的需求列表 - 不显示表头 */}
                  <CollapsibleContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse table-fixed">
                        <tbody>
                          {requirements.map(requirement => (
                            <tr key={requirement.id} className="border-b hover:bg-accent/50">
                              <td className="w-12 p-2 align-middle flex-shrink-0">
                                <Checkbox
                                  checked={selectedRequirements.includes(requirement.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectRequirement(requirement.id, !!checked)
                                  }
                                />
                              </td>
                              {columnOrder.map(columnId => renderTableCell(columnId, requirement))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 评审对话框 */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewLevel === 1 ? '一' : '二'}级评审 - {currentReviewRequirement?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>评审意见</Label>
                <Textarea
                  placeholder="请输入评审意见..."
                  value={reviewOpinion}
                  onChange={(e) => setReviewOpinion(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleSubmitReview('rejected')}
              >
                不通过
              </Button>
              <Button onClick={() => handleSubmitReview('approved')}>
                通过
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

