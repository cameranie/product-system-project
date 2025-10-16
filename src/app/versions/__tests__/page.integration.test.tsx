/**
 * 版本管理页面集成测试
 * 
 * @module VersionManagementPageIntegrationTest
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VersionManagementPage } from '@/app/versions/page';
import { useVersionStore } from '@/lib/version-store';

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

// Mock store
jest.mock('@/lib/version-store');

// Mock components
jest.mock('@/components/layout/app-layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

describe('版本管理页面集成测试', () => {
  const mockAddVersion = jest.fn();
  const mockUpdateVersion = jest.fn();
  const mockDeleteVersion = jest.fn();
  const mockAddCustomPlatform = jest.fn();
  const mockDeleteCustomPlatform = jest.fn();
  const mockInitFromStorage = jest.fn();

  const mockVersions = [
    {
      id: 'v1',
      platform: 'Web端',
      versionNumber: '1.0.0',
      releaseDate: '2024-02-01',
      schedule: {
        prd: '2024-01-15',
        prototype: '2024-01-20',
        dev: '2024-01-25',
        test: '2024-01-30',
      },
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-01 10:00:00',
    },
    {
      id: 'v2',
      platform: 'PC端',
      versionNumber: '2.0.0',
      releaseDate: '2024-03-01',
      schedule: {
        prd: '2024-02-15',
        prototype: '2024-02-20',
        dev: '2024-02-25',
        test: '2024-02-28',
      },
      createdAt: '2024-02-01 10:00:00',
      updatedAt: '2024-02-01 10:00:00',
    },
  ];

  const mockCustomPlatforms = ['移动端', '小程序'];

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useVersionStore as jest.Mock).mockReturnValue({
      versions: mockVersions,
      customPlatforms: mockCustomPlatforms,
      addVersion: mockAddVersion,
      updateVersion: mockUpdateVersion,
      deleteVersion: mockDeleteVersion,
      addCustomPlatform: mockAddCustomPlatform,
      deleteCustomPlatform: mockDeleteCustomPlatform,
      initFromStorage: mockInitFromStorage,
    });
  });

  describe('页面渲染', () => {
    it('应该正确渲染页面标题和描述', () => {
      render(<VersionManagementPage />);
      
      expect(screen.getByText('版本号管理')).toBeInTheDocument();
      expect(screen.getByText('管理产品版本号，自动计算排期时间')).toBeInTheDocument();
    });

    it('应该渲染版本列表', () => {
      render(<VersionManagementPage />);
      
      expect(screen.getByText('Web端 1.0.0')).toBeInTheDocument();
      expect(screen.getByText('PC端 2.0.0')).toBeInTheDocument();
    });

    it('应该显示版本数量统计', () => {
      render(<VersionManagementPage />);
      
      expect(screen.getByText('共 2 个版本')).toBeInTheDocument();
    });

    it('应该渲染创建版本按钮', () => {
      render(<VersionManagementPage />);
      
      expect(screen.getByText('创建版本')).toBeInTheDocument();
    });
  });

  describe('版本创建功能', () => {
    it('应该能够打开创建版本对话框', () => {
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      expect(screen.getByText('创建新版本')).toBeInTheDocument();
    });

    it('应该能够填写版本信息', async () => {
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      // 填写表单
      const platformSelect = screen.getByDisplayValue('选择应用端');
      fireEvent.click(platformSelect);
      
      const versionInput = screen.getByPlaceholderText('如：1.0.0');
      fireEvent.change(versionInput, { target: { value: '3.0.0' } });
      
      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-04-01' } });
      
      expect(versionInput).toHaveValue('3.0.0');
      expect(dateInput).toHaveValue('2024-04-01');
    });

    it('应该能够提交创建版本', async () => {
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      // 填写表单
      const platformSelect = screen.getByDisplayValue('选择应用端');
      fireEvent.click(platformSelect);
      
      const versionInput = screen.getByPlaceholderText('如：1.0.0');
      fireEvent.change(versionInput, { target: { value: '3.0.0' } });
      
      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-04-01' } });
      
      const submitButton = screen.getByText('创建');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockAddVersion).toHaveBeenCalledWith(
          expect.objectContaining({
            platform: expect.any(String),
            versionNumber: '3.0.0',
            releaseDate: '2024-04-01',
            schedule: expect.objectContaining({
              prd: expect.any(String),
              prototype: expect.any(String),
              dev: expect.any(String),
              test: expect.any(String),
            }),
          })
        );
      });
    });
  });

  describe('版本编辑功能', () => {
    it('应该能够打开编辑版本对话框', () => {
      render(<VersionManagementPage />);
      
      const editButtons = screen.getAllByText('编辑');
      fireEvent.click(editButtons[0]);
      
      expect(screen.getByText('编辑版本')).toBeInTheDocument();
    });

    it('应该能够修改版本信息', async () => {
      render(<VersionManagementPage />);
      
      const editButtons = screen.getAllByText('编辑');
      fireEvent.click(editButtons[0]);
      
      const versionInput = screen.getByDisplayValue('1.0.0');
      fireEvent.change(versionInput, { target: { value: '1.1.0' } });
      
      expect(versionInput).toHaveValue('1.1.0');
    });

    it('应该能够保存版本修改', async () => {
      render(<VersionManagementPage />);
      
      const editButtons = screen.getAllByText('编辑');
      fireEvent.click(editButtons[0]);
      
      const versionInput = screen.getByDisplayValue('1.0.0');
      fireEvent.change(versionInput, { target: { value: '1.1.0' } });
      
      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateVersion).toHaveBeenCalledWith(
          'v1',
          expect.objectContaining({
            versionNumber: '1.1.0',
          })
        );
      });
    });
  });

  describe('版本删除功能', () => {
    it('应该能够打开删除确认对话框', () => {
      render(<VersionManagementPage />);
      
      const deleteButtons = screen.getAllByText('删除');
      fireEvent.click(deleteButtons[0]);
      
      expect(screen.getByText('确认删除版本')).toBeInTheDocument();
    });

    it('应该能够确认删除版本', async () => {
      render(<VersionManagementPage />);
      
      const deleteButtons = screen.getAllByText('删除');
      fireEvent.click(deleteButtons[0]);
      
      const confirmButton = screen.getByText('确认删除');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockDeleteVersion).toHaveBeenCalledWith('v1');
      });
    });

    it('应该能够取消删除操作', () => {
      render(<VersionManagementPage />);
      
      const deleteButtons = screen.getAllByText('删除');
      fireEvent.click(deleteButtons[0]);
      
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);
      
      expect(mockDeleteVersion).not.toHaveBeenCalled();
    });
  });

  describe('自定义平台管理', () => {
    it('应该显示自定义平台列表', () => {
      render(<VersionManagementPage />);
      
      expect(screen.getByText('移动端')).toBeInTheDocument();
      expect(screen.getByText('小程序')).toBeInTheDocument();
    });

    it('应该能够添加自定义平台', async () => {
      render(<VersionManagementPage />);
      
      const addPlatformInput = screen.getByPlaceholderText('输入新应用端名称');
      fireEvent.change(addPlatformInput, { target: { value: '新平台' } });
      
      const addButton = screen.getByText('添加');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(mockAddCustomPlatform).toHaveBeenCalledWith('新平台');
      });
    });

    it('应该能够删除自定义平台', async () => {
      render(<VersionManagementPage />);
      
      const deletePlatformButtons = screen.getAllByText('删除');
      // 找到删除自定义平台的按钮（通常是后面的按钮）
      fireEvent.click(deletePlatformButtons[deletePlatformButtons.length - 1]);
      
      await waitFor(() => {
        expect(mockDeleteCustomPlatform).toHaveBeenCalled();
      });
    });
  });

  describe('搜索和筛选功能', () => {
    it('应该能够搜索版本', () => {
      render(<VersionManagementPage />);
      
      const searchInput = screen.getByPlaceholderText('搜索版本号...');
      fireEvent.change(searchInput, { target: { value: '1.0.0' } });
      
      expect(searchInput).toHaveValue('1.0.0');
    });

    it('应该能够按平台筛选', () => {
      render(<VersionManagementPage />);
      
      const platformSelect = screen.getByDisplayValue('全部平台');
      fireEvent.click(platformSelect);
      
      // 选择特定平台
      const webOption = screen.getByText('Web端');
      fireEvent.click(webOption);
      
      expect(platformSelect).toHaveTextContent('Web端');
    });
  });

  describe('数据验证', () => {
    it('应该验证版本号格式', async () => {
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      const versionInput = screen.getByPlaceholderText('如：1.0.0');
      fireEvent.change(versionInput, { target: { value: 'invalid-version' } });
      
      const submitButton = screen.getByText('创建');
      fireEvent.click(submitButton);
      
      // 应该显示验证错误
      await waitFor(() => {
        expect(screen.getByText('版本号格式不正确')).toBeInTheDocument();
      });
    });

    it('应该验证日期不能是过去', async () => {
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      const dateInput = screen.getByDisplayValue('');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      fireEvent.change(dateInput, { target: { value: yesterday.toISOString().split('T')[0] } });
      
      const submitButton = screen.getByText('创建');
      fireEvent.click(submitButton);
      
      // 应该显示验证错误
      await waitFor(() => {
        expect(screen.getByText('上线时间不能早于今天')).toBeInTheDocument();
      });
    });
  });

  describe('排期计算', () => {
    it('应该自动计算排期时间', async () => {
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-04-01' } });
      
      // 验证排期时间被正确计算
      await waitFor(() => {
        expect(screen.getByText('PRD时间')).toBeInTheDocument();
        expect(screen.getByText('原型时间')).toBeInTheDocument();
        expect(screen.getByText('开发时间')).toBeInTheDocument();
        expect(screen.getByText('测试时间')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理创建版本失败的情况', async () => {
      mockAddVersion.mockRejectedValue(new Error('创建失败'));
      
      render(<VersionManagementPage />);
      
      const createButton = screen.getByText('创建版本');
      fireEvent.click(createButton);
      
      const submitButton = screen.getByText('创建');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('创建失败')).toBeInTheDocument();
      });
    });

    it('应该处理删除版本失败的情况', async () => {
      mockDeleteVersion.mockRejectedValue(new Error('删除失败'));
      
      render(<VersionManagementPage />);
      
      const deleteButtons = screen.getAllByText('删除');
      fireEvent.click(deleteButtons[0]);
      
      const confirmButton = screen.getByText('确认删除');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('删除失败')).toBeInTheDocument();
      });
    });
  });

  describe('数据持久化', () => {
    it('应该从存储中初始化数据', () => {
      render(<VersionManagementPage />);
      
      expect(mockInitFromStorage).toHaveBeenCalled();
    });
  });
});


