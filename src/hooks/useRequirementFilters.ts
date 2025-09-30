import { useState, useMemo, useCallback } from 'react';
import { Requirement } from '@/lib/requirements-store';

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface UseRequirementFiltersProps {
  requirements: Requirement[];
}

export function useRequirementFilters({ requirements }: UseRequirementFiltersProps) {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('开放中');
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'updatedAt',
    direction: 'desc'
  });
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(['platforms', 'creator', 'createdAt', 'updatedAt']);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'id', 'title', 'type', 'platforms', 'endOwner', 'needToDo', 'priority', 'creator', 'createdAt', 'updatedAt'
  ]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

  // 统计数据
  const stats = useMemo(() => {
    const total = requirements.length;
    const open = requirements.filter(req => req.isOpen).length;
    const closed = total - open;
    return { total, open, closed };
  }, [requirements]);

  // 应用搜索筛选
  const applySearchFilter = useCallback((reqs: Requirement[], search: string) => {
    if (!search.trim()) return reqs;
    
    const searchLower = search.toLowerCase();
    return reqs.filter(req =>
      req.id.toLowerCase().includes(searchLower) ||
      req.title.toLowerCase().includes(searchLower) ||
      req.description.toLowerCase().includes(searchLower) ||
      req.creator?.name?.toLowerCase().includes(searchLower) ||
      req.type.toLowerCase().includes(searchLower) ||
      (req.platforms || []).some(p => p.toLowerCase().includes(searchLower)) ||
      (req.project?.name.toLowerCase().includes(searchLower)) ||
      (req.tags?.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }, []);

  // 应用状态筛选
  const applyStatusFilter = useCallback((reqs: Requirement[], status: string) => {
    switch (status) {
      case '开放中':
        return reqs.filter(req => req.isOpen);
      case '已关闭':
        return reqs.filter(req => !req.isOpen);
      case '全部':
      default:
        return reqs;
    }
  }, []);

  // 应用自定义筛选
  const applyCustomFilters = useCallback((reqs: Requirement[], filters: FilterCondition[]) => {
    if (filters.length === 0) return reqs;

    return reqs.filter(requirement => {
      return filters.every(filter => {
        if (!filter.column || !filter.operator) return true;

        let fieldValue: string;
        switch (filter.column) {
          case 'id':
            fieldValue = requirement.id;
            break;
          case 'title':
            fieldValue = requirement.title;
            break;
          case 'type':
            fieldValue = requirement.type;
            break;
          case 'priority':
            fieldValue = requirement.priority;
            break;
          case 'creator':
            fieldValue = requirement.creator?.name || '';
            break;
          case 'endOwner':
            fieldValue = requirement.endOwnerOpinion?.owner?.name || '';
            break;
          case 'platforms':
            fieldValue = (requirement.platforms || []).join(', ');
            break;
          default:
            return true;
        }

        const filterValue = filter.value.toLowerCase();
        const fieldValueLower = fieldValue.toLowerCase();

        switch (filter.operator) {
          case 'contains':
            return fieldValueLower.includes(filterValue);
          case 'equals':
            return fieldValueLower === filterValue;
          case 'not_equals':
            return fieldValueLower !== filterValue;
          case 'starts_with':
            return fieldValueLower.startsWith(filterValue);
          case 'ends_with':
            return fieldValueLower.endsWith(filterValue);
          case 'is_empty':
            return !fieldValue.trim();
          case 'is_not_empty':
            return !!fieldValue.trim();
          default:
            return true;
        }
      });
    });
  }, []);

  // 应用排序
  const applySorting = useCallback((reqs: Requirement[], config: SortConfig) => {
    if (!config.field) return reqs;

    return [...reqs].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (config.field) {
        case 'id':
          aValue = parseInt(a.id.replace('#', ''));
          bValue = parseInt(b.id.replace('#', ''));
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'priority':
          const priorityOrder = { '低': 1, '中': 2, '高': 3, '紧急': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'creator':
          aValue = a.creator?.name || '';
          bValue = b.creator?.name || '';
          break;
        case 'endOwner':
          aValue = a.endOwnerOpinion?.owner?.name || '';
          bValue = b.endOwnerOpinion?.owner?.name || '';
          break;
        case 'createdAt':
        case 'updatedAt':
          aValue = new Date(a[config.field]);
          bValue = new Date(b[config.field]);
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return config.direction === 'desc' ? -comparison : comparison;
    });
  }, []);

  // 计算筛选后的需求列表
  const filteredRequirements = useMemo(() => {
    let result = requirements;
    
    // 应用各种筛选
    result = applySearchFilter(result, searchTerm);
    result = applyStatusFilter(result, statusFilter);
    result = applyCustomFilters(result, customFilters);
    result = applySorting(result, sortConfig);
    
    return result;
  }, [requirements, searchTerm, statusFilter, customFilters, sortConfig, 
      applySearchFilter, applyStatusFilter, applyCustomFilters, applySorting]);

  // 筛选条件管理
  const addCustomFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: 'title',
      operator: 'contains',
      value: ''
    };
    setCustomFilters(prev => [...prev, newFilter]);
  }, []);

  const updateCustomFilter = useCallback((id: string, field: string, value: string) => {
    setCustomFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  }, []);

  const removeCustomFilter = useCallback((id: string) => {
    setCustomFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);

  const clearAllFilters = useCallback(() => {
    setCustomFilters([]);
  }, []);

  // 排序管理
  const handleColumnSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // 列显示管理
  const toggleColumnVisibility = useCallback((column: string) => {
    setHiddenColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  }, []);

  // 列排序管理
  const handleColumnReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  // 选择管理
  const handleRequirementSelect = useCallback((id: string, checked: boolean) => {
    setSelectedRequirements(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(reqId => reqId !== id)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedRequirements(checked ? filteredRequirements.map(req => req.id) : []);
  }, [filteredRequirements]);

  return {
    // 状态
    searchTerm,
    statusFilter,
    customFilters,
    sortConfig,
    hiddenColumns,
    columnOrder,
    selectedRequirements,
    stats,
    
    // 计算结果
    filteredRequirements,
    
    // 操作方法
    setSearchTerm,
    setStatusFilter,
    addCustomFilter,
    updateCustomFilter,
    removeCustomFilter,
    clearAllFilters,
    handleColumnSort,
    toggleColumnVisibility,
    handleColumnReorder,
    handleRequirementSelect,
    handleSelectAll
  };
} 