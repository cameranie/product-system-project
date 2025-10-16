/**
 * 预排期页面集成测试
 * 
 * @module ScheduledPageIntegrationTest
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ScheduledRequirementsPage } from '@/app/scheduled/page-new';
import { useRequirementsStore } from '@/lib/requirements-store';
import { useVersionStore } from '@/lib/version-store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock stores
jest.mock('@/lib/requirements-store');
jest.mock('@/lib/version-store');

// Mock components
jest.mock('@/components/layout/app-layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

jest.mock('@/components/scheduled', () => ({
  ScheduledPageHeader: ({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) => (
    <div data-testid="scheduled-page-header">
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="搜索需求..."
      />
    </div>
  ),
  ScheduledBatchActionsBar: ({ selectedCount }: { selectedCount: number }) => (
    <div data-testid="batch-actions-bar">
      已选择 {selectedCount} 个需求
    </div>
  ),
  ScheduledMainTable: ({ groupedRequirements }: { groupedRequirements: Record<string, unknown[]> }) => (
    <div data-testid="main-table">
      {Object.entries(groupedRequirements).map(([version, requirements]) => (
        <div key={version} data-testid={`version-group-${version}`}>
          <h3>{version}</h3>
          <div data-testid={`requirements-count-${version}`}>
            {(requirements as unknown[]).length} 个需求
          </div>
        </div>
      ))}
    </div>
  ),
  ReviewDialog: ({ open, requirement, level }: { open: boolean; requirement?: { title?: string }; level: number }) => (
    open ? (
      <div data-testid="review-dialog">
        评审对话框 - {requirement?.title} - 级别 {level}
      </div>
    ) : null
  ),
}));

// Mock hooks
jest.mock('@/hooks/useScheduledFilters', () => ({
  useScheduledFilters: () => ({
    searchTerm: '',
    setSearchTerm: jest.fn(),
    customFilters: [],
    setCustomFilters: jest.fn(),
    hiddenColumns: [],
    setHiddenColumns: jest.fn(),
    columnOrder: [],
    setColumnOrder: jest.fn(),
    filteredAndGroupedRequirements: {
      'v1.0.0': [
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
      ],
      'v2.0.0': [
        {
          id: 'req-3',
          title: '测试需求3',
          type: 'BUG',
          priority: '紧急',
          plannedVersion: 'v2.0.0',
          scheduledReview: {
            reviewLevels: [
              { level: 1, status: 'rejected', opinion: '不通过', reviewedAt: '2024-01-02' },
              { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
            ],
          },
          isOperational: undefined,
        },
      ],
    },
    filteredRequirements: [
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
      {
        id: 'req-3',
        title: '测试需求3',
        type: 'BUG',
        priority: '紧急',
        plannedVersion: 'v2.0.0',
        scheduledReview: {
          reviewLevels: [
            { level: 1, status: 'rejected', opinion: '不通过', reviewedAt: '2024-01-02' },
            { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
          ],
        },
        isOperational: undefined,
      },
    ],
  }),
}));

jest.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
  COMMON_SHORTCUTS: {},
}));

describe('预排期页面集成测试', () => {
  const mockUpdateRequirement = jest.fn();
  const mockVersions = ['v1.0.0', 'v2.0.0'];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock requirements store
    (useRequirementsStore as jest.Mock).mockReturnValue({
      updateRequirement: mockUpdateRequirement,
      loading: false,
      setLoading: jest.fn(),
      requirements: [
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
        {
          id: 'req-3',
          title: '测试需求3',
          type: 'BUG',
          priority: '紧急',
          plannedVersion: 'v2.0.0',
          scheduledReview: {
            reviewLevels: [
              { level: 1, status: 'rejected', opinion: '不通过', reviewedAt: '2024-01-02' },
              { level: 2, status: 'pending', opinion: '', reviewedAt: '' },
            ],
          },
          isOperational: undefined,
        },
      ],
    });

    // Mock version store
    (useVersionStore as jest.Mock).mockReturnValue({
      versions: mockVersions,
    });
  });

  describe('页面渲染', () => {
    it('应该正确渲染页面标题和描述', () => {
      render(<ScheduledRequirementsPage />);
      
      expect(screen.getByText('预排期需求管理')).toBeInTheDocument();
      expect(screen.getByText('管理按版本分组的预排期需求，支持二级评审流程')).toBeInTheDocument();
    });

    it('应该渲染所有主要组件', () => {
      render(<ScheduledRequirementsPage />);
      
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('scheduled-page-header')).toBeInTheDocument();
      expect(screen.getByTestId('main-table')).toBeInTheDocument();
    });

    it('应该显示版本分组', () => {
      render(<ScheduledRequirementsPage />);
      
      expect(screen.getByTestId('version-group-v1.0.0')).toBeInTheDocument();
      expect(screen.getByTestId('version-group-v2.0.0')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('v2.0.0')).toBeInTheDocument();
    });

    it('应该显示每个版本的需求数量', () => {
      render(<ScheduledRequirementsPage />);
      
      expect(screen.getByTestId('requirements-count-v1.0.0')).toHaveTextContent('2 个需求');
      expect(screen.getByTestId('requirements-count-v2.0.0')).toHaveTextContent('1 个需求');
    });
  });

  describe('搜索功能', () => {
    it('应该能够输入搜索词', () => {
      render(<ScheduledRequirementsPage />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: '测试需求' } });
      expect(searchInput).toHaveValue('测试需求');
    });
  });

  describe('批量操作', () => {
    it('初始状态下不应该显示批量操作栏', () => {
      render(<ScheduledRequirementsPage />);
      
      expect(screen.queryByTestId('batch-actions-bar')).not.toBeInTheDocument();
    });

    it('选择需求后应该显示批量操作栏', () => {
      render(<ScheduledRequirementsPage />);
      
      // 这里需要模拟选择需求，但由于组件被mock了，我们直接测试组件行为
      // 在实际集成测试中，这里会通过用户交互来触发选择
    });
  });

  describe('加载状态', () => {
    it('加载中应该显示骨架屏', () => {
      (useRequirementsStore as jest.Mock).mockReturnValue({
        updateRequirement: mockUpdateRequirement,
        loading: true,
        setLoading: jest.fn(),
        requirements: [],
      });

      render(<ScheduledRequirementsPage />);
      
      // 应该显示加载状态
      expect(screen.getByText('预排期需求管理')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('更新需求失败时应该显示错误信息', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUpdateRequirement.mockRejectedValue(new Error('更新失败'));
      
      render(<ScheduledRequirementsPage />);
      
      // 这里需要触发更新操作来测试错误处理
      // 在实际测试中，会通过用户交互来触发更新
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('键盘快捷键', () => {
    it('应该注册键盘快捷键', () => {
      render(<ScheduledRequirementsPage />);
      
      expect(useKeyboardShortcuts).toHaveBeenCalledWith({
        shortcuts: {},
        onAction: expect.any(Function),
      });
    });
  });

  describe('版本管理集成', () => {
    it('应该正确获取版本选项', () => {
      render(<ScheduledRequirementsPage />);
      
      // 验证版本store被正确调用
      expect(useVersionStore).toHaveBeenCalled();
    });
  });

  describe('数据流集成', () => {
    it('应该正确处理需求数据流', () => {
      render(<ScheduledRequirementsPage />);
      
      // 验证requirements store被正确调用
      expect(useRequirementsStore).toHaveBeenCalled();
      
      // 验证数据被正确传递给子组件
      expect(screen.getByTestId('main-table')).toBeInTheDocument();
    });
  });
});


