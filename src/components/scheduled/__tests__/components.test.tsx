/**
 * 预排期组件单元测试
 * 
 * @module ScheduledComponentsUnitTest
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScheduledPageHeader } from '@/components/scheduled/ScheduledPageHeader';
import { ScheduledBatchActionsBar } from '@/components/scheduled/ScheduledBatchActionsBar';
import { ScheduledVersionGroup } from '@/components/scheduled/ScheduledVersionGroup';
import { ReviewDialog } from '@/components/scheduled/ReviewDialog';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('ScheduledPageHeader 组件测试', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: jest.fn(),
    customFilters: [],
    onAddCustomFilter: jest.fn(),
    onUpdateCustomFilter: jest.fn(),
    onRemoveCustomFilter: jest.fn(),
    onClearAllFilters: jest.fn(),
    hiddenColumns: [],
    columnOrder: [],
    onToggleColumn: jest.fn(),
    onColumnReorder: jest.fn(),
    onResetColumns: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染搜索框', () => {
    render(<ScheduledPageHeader {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('搜索需求标题、ID、创建人...')).toBeInTheDocument();
  });

  it('应该能够输入搜索词', () => {
    render(<ScheduledPageHeader {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('搜索需求标题、ID、创建人...');
    fireEvent.change(searchInput, { target: { value: '测试搜索' } });
    
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('测试搜索');
  });

  it('应该显示筛选设置按钮', () => {
    render(<ScheduledPageHeader {...defaultProps} />);
    
    expect(screen.getByText('筛选设置')).toBeInTheDocument();
  });

  it('应该显示列隐藏按钮', () => {
    render(<ScheduledPageHeader {...defaultProps} />);
    
    expect(screen.getByText('列隐藏')).toBeInTheDocument();
  });

  it('应该在有筛选条件时高亮筛选按钮', () => {
    const propsWithFilters = {
      ...defaultProps,
      customFilters: [
        { id: '1', column: 'title', operator: 'contains', value: '测试' }
      ],
    };
    
    render(<ScheduledPageHeader {...propsWithFilters} />);
    
    expect(screen.getByText('1 筛选设置')).toBeInTheDocument();
  });

  it('应该在有隐藏列时高亮列隐藏按钮', () => {
    const propsWithHiddenColumns = {
      ...defaultProps,
      hiddenColumns: ['creator', 'createdAt'],
    };
    
    render(<ScheduledPageHeader {...propsWithHiddenColumns} />);
    
    expect(screen.getByText('2 列隐藏')).toBeInTheDocument();
  });
});

describe('ScheduledBatchActionsBar 组件测试', () => {
  const defaultProps = {
    selectedCount: 0,
    versions: ['v1.0.0', 'v2.0.0'],
    onClearSelection: jest.fn(),
    onBatchAssignVersion: jest.fn(),
    onBatchReview: jest.fn(),
    onBatchIsOperational: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('在没有选择需求时不应该渲染', () => {
    render(<ScheduledBatchActionsBar {...defaultProps} />);
    
    expect(screen.queryByText('已选择')).not.toBeInTheDocument();
  });

  it('应该在有选择需求时显示批量操作栏', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedCount: 3,
    };
    
    render(<ScheduledBatchActionsBar {...propsWithSelection} />);
    
    expect(screen.getByText('已选择 3 个需求')).toBeInTheDocument();
    expect(screen.getByText('批量分配版本')).toBeInTheDocument();
    expect(screen.getByText('批量评审')).toBeInTheDocument();
    expect(screen.getByText('批量是否运营')).toBeInTheDocument();
  });

  it('应该能够取消选择', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedCount: 3,
    };
    
    render(<ScheduledBatchActionsBar {...propsWithSelection} />);
    
    const clearButton = screen.getByText('取消选择');
    fireEvent.click(clearButton);
    
    expect(defaultProps.onClearSelection).toHaveBeenCalled();
  });

  it('应该能够批量分配版本', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedCount: 3,
    };
    
    render(<ScheduledBatchActionsBar {...propsWithSelection} />);
    
    const assignButton = screen.getByText('批量分配版本');
    fireEvent.click(assignButton);
    
    const versionOption = screen.getByText('v1.0.0');
    fireEvent.click(versionOption);
    
    expect(defaultProps.onBatchAssignVersion).toHaveBeenCalledWith('v1.0.0');
  });

  it('应该能够批量评审', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedCount: 3,
    };
    
    render(<ScheduledBatchActionsBar {...propsWithSelection} />);
    
    const reviewButton = screen.getByText('批量评审');
    fireEvent.click(reviewButton);
    
    const approveOption = screen.getByText('一级评审通过');
    fireEvent.click(approveOption);
    
    expect(defaultProps.onBatchReview).toHaveBeenCalledWith(1, 'approved');
  });

  it('应该能够批量设置是否运营', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedCount: 3,
    };
    
    render(<ScheduledBatchActionsBar {...propsWithSelection} />);
    
    const operationalButton = screen.getByText('批量是否运营');
    fireEvent.click(operationalButton);
    
    const yesOption = screen.getByText('设置为 是');
    fireEvent.click(yesOption);
    
    expect(defaultProps.onBatchIsOperational).toHaveBeenCalledWith('yes');
  });
});

describe('ScheduledVersionGroup 组件测试', () => {
  const mockRequirements = [
    {
      id: 'req-1',
      title: '测试需求1',
      type: '新功能',
      priority: '高',
      plannedVersion: 'v1.0.0',
      scheduledReview: {
        reviewLevels: [
          { level: 1, status: 'pending', opinion: '', reviewedAt: '' },
          { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
        ],
      },
      isOperational: 'yes',
    },
    {
      id: 'req-2',
      title: '测试需求2',
      type: '优化',
      priority: '中',
      plannedVersion: 'v1.0.0',
      scheduledReview: {
        reviewLevels: [
          { level: 1, status: 'approved', opinion: '通过', reviewedAt: '2024-01-01' },
          { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
        ],
      },
      isOperational: 'no',
    },
  ];

  const defaultProps = {
    version: 'v1.0.0',
    requirements: mockRequirements,
    versionOptions: ['v1.0.0', 'v2.0.0'],
    isExpanded: true,
    onToggleExpanded: jest.fn(),
    onUpdateRequirement: jest.fn(),
    onOpenReviewDialog: jest.fn(),
    onSelectRequirement: jest.fn(),
    onSelectAll: jest.fn(),
    selectedRequirements: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染版本标题和需求数量', () => {
    render(<ScheduledVersionGroup {...defaultProps} />);
    
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('2 个需求')).toBeInTheDocument();
  });

  it('应该能够切换展开/收起状态', () => {
    render(<ScheduledVersionGroup {...defaultProps} />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(defaultProps.onToggleExpanded).toHaveBeenCalled();
  });

  it('应该显示需求表格', () => {
    render(<ScheduledVersionGroup {...defaultProps} />);
    
    expect(screen.getByText('测试需求1')).toBeInTheDocument();
    expect(screen.getByText('测试需求2')).toBeInTheDocument();
  });

  it('应该能够选择需求', () => {
    render(<ScheduledVersionGroup {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // 第一个需求的选择框
    
    expect(defaultProps.onSelectRequirement).toHaveBeenCalledWith('req-1', true);
  });

  it('应该能够全选/取消全选', () => {
    render(<ScheduledVersionGroup {...defaultProps} />);
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    expect(defaultProps.onSelectAll).toHaveBeenCalledWith(true);
  });

  it('应该显示已选择的需求数量', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedRequirements: ['req-1'],
    };
    
    render(<ScheduledVersionGroup {...propsWithSelection} />);
    
    expect(screen.getByText('已选择 1')).toBeInTheDocument();
  });
});

describe('ReviewDialog 组件测试', () => {
  const mockRequirement = {
    id: 'req-1',
    title: '测试需求',
    type: '新功能',
    priority: '高',
    plannedVersion: 'v1.0.0',
    scheduledReview: {
      reviewLevels: [
        { level: 1, status: 'pending', opinion: '', reviewedAt: '' },
        { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
      ],
    },
    isOperational: 'yes',
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    requirement: mockRequirement,
    level: 1,
    onSaveReview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染对话框标题', () => {
    render(<ReviewDialog {...defaultProps} />);
    
    expect(screen.getByText('一级评审意见 - 测试需求')).toBeInTheDocument();
  });

  it('应该能够输入评审意见', () => {
    render(<ReviewDialog {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('请输入一级评审意见...');
    fireEvent.change(textarea, { target: { value: '测试评审意见' } });
    
    expect(textarea).toHaveValue('测试评审意见');
  });

  it('应该显示字符计数', () => {
    render(<ReviewDialog {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('请输入一级评审意见...');
    fireEvent.change(textarea, { target: { value: '测试' } });
    
    expect(screen.getByText('2/1000')).toBeInTheDocument();
  });

  it('应该能够保存评审意见', async () => {
    render(<ReviewDialog {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('请输入一级评审意见...');
    fireEvent.change(textarea, { target: { value: '测试评审意见' } });
    
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onSaveReview).toHaveBeenCalledWith('req-1', 1, '测试评审意见');
    });
  });

  it('应该能够取消对话框', () => {
    render(<ReviewDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('应该验证评审意见长度', async () => {
    render(<ReviewDialog {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('请输入一级评审意见...');
    fireEvent.change(textarea, { target: { value: 'a'.repeat(1001) } });
    
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    // 应该显示验证错误
    await waitFor(() => {
      expect(screen.getByText('评审意见不能超过1000个字符')).toBeInTheDocument();
    });
  });

  it('应该加载现有的评审意见', () => {
    const requirementWithOpinion = {
      ...mockRequirement,
      scheduledReview: {
        reviewLevels: [
          { level: 1, status: 'approved', opinion: '现有意见', reviewedAt: '2024-01-01' },
          { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
        ],
      },
    };

    const propsWithOpinion = {
      ...defaultProps,
      requirement: requirementWithOpinion,
    };

    render(<ReviewDialog {...propsWithOpinion} />);
    
    const textarea = screen.getByPlaceholderText('请输入一级评审意见...');
    expect(textarea).toHaveValue('现有意见');
  });
});






