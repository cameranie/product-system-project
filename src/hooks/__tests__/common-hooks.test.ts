/**
 * 通用Hook测试
 * 
 * @module CommonHooksTest
 */

import { renderHook, act } from '@testing-library/react';
import { useTableSelection, useTableSort, useTablePagination } from '../useTableSelection';
import { useForm } from '../useFormValidation';
import { useDataOperations } from '../useDataOperations';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useTableSelection Hook测试', () => {
  const mockItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  it('应该正确初始化选择状态', () => {
    const { result } = renderHook(() => useTableSelection({
      items: mockItems,
      getItemId: (item) => item.id,
    }));

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isIndeterminate).toBe(false);
  });

  it('应该能够选择单个项目', () => {
    const { result } = renderHook(() => useTableSelection({
      items: mockItems,
      getItemId: (item) => item.id,
    }));

    act(() => {
      result.current.selectItem('1');
    });

    expect(result.current.selectedIds).toEqual(['1']);
    expect(result.current.selectedItems).toEqual([mockItems[0]]);
    expect(result.current.isSelected('1')).toBe(true);
  });

  it('应该能够全选', () => {
    const { result } = renderHook(() => useTableSelection({
      items: mockItems,
      getItemId: (item) => item.id,
    }));

    act(() => {
      result.current.selectAll(true);
    });

    expect(result.current.selectedIds).toEqual(['1', '2', '3']);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.isIndeterminate).toBe(false);
  });

  it('应该能够取消选择', () => {
    const { result } = renderHook(() => useTableSelection({
      items: mockItems,
      getItemId: (item) => item.id,
    }));

    act(() => {
      result.current.selectAll(true);
      result.current.selectItem('1', false);
    });

    expect(result.current.selectedIds).toEqual(['2', '3']);
    expect(result.current.isIndeterminate).toBe(true);
  });

  it('应该遵守最大选择数量限制', () => {
    const { result } = renderHook(() => useTableSelection({
      items: mockItems,
      getItemId: (item) => item.id,
      maxSelection: 2,
    }));

    act(() => {
      result.current.selectItem('1');
      result.current.selectItem('2');
      result.current.selectItem('3'); // 应该被忽略
    });

    expect(result.current.selectedIds).toEqual(['1', '2']);
  });
});

describe('useTableSort Hook测试', () => {
  const mockItems = [
    { id: '1', name: 'Charlie', age: 25 },
    { id: '2', name: 'Alice', age: 30 },
    { id: '3', name: 'Bob', age: 20 },
  ];

  it('应该正确初始化排序状态', () => {
    const { result } = renderHook(() => useTableSort({
      items: mockItems,
      defaultSortField: 'name',
      defaultSortDirection: 'asc',
    }));

    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('应该能够按名称排序', () => {
    const { result } = renderHook(() => useTableSort({
      items: mockItems,
    }));

    act(() => {
      result.current.setSort('name', 'asc');
    });

    expect(result.current.sortedItems[0].name).toBe('Alice');
    expect(result.current.sortedItems[1].name).toBe('Bob');
    expect(result.current.sortedItems[2].name).toBe('Charlie');
  });

  it('应该能够切换排序方向', () => {
    const { result } = renderHook(() => useTableSort({
      items: mockItems,
      defaultSortField: 'name',
      defaultSortDirection: 'asc',
    }));

    act(() => {
      result.current.toggleSort('name');
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedItems[0].name).toBe('Charlie');
  });

  it('应该能够按数字排序', () => {
    const { result } = renderHook(() => useTableSort({
      items: mockItems,
    }));

    act(() => {
      result.current.setSort('age', 'asc');
    });

    expect(result.current.sortedItems[0].age).toBe(20);
    expect(result.current.sortedItems[1].age).toBe(25);
    expect(result.current.sortedItems[2].age).toBe(30);
  });
});

describe('useTablePagination Hook测试', () => {
  const mockItems = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('应该正确初始化分页状态', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, { pageSize: 10 }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedItems).toHaveLength(10);
  });

  it('应该能够翻页', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, { pageSize: 10 }));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(11);
  });

  it('应该能够设置每页数量', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, { pageSize: 10 }));

    act(() => {
      result.current.setPageSize(5);
    });

    expect(result.current.pageSize).toBe(5);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(5);
  });

  it('应该能够跳转到指定页', () => {
    const { result } = renderHook(() => useTablePagination(mockItems, { pageSize: 10 }));

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedItems[0].id).toBe(21);
  });
});

describe('useForm Hook测试', () => {
  const mockValidator = (value: any) => ({
    valid: value && value.length >= 3,
    error: value && value.length >= 3 ? undefined : '至少3个字符',
  });

  it('应该正确初始化表单状态', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { name: 'Test', email: 'test@example.com' },
      fields: [
        { name: 'name', validator: mockValidator, required: true },
        { name: 'email', required: true },
      ],
    }));

    expect(result.current.values.name).toBe('Test');
    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
  });

  it('应该能够设置字段值', () => {
    const { result } = renderHook(() => useForm({
      fields: [
        { name: 'name', validator: mockValidator, required: true },
      ],
    }));

    act(() => {
      result.current.setValue('name', 'New Name');
    });

    expect(result.current.values.name).toBe('New Name');
    expect(result.current.isDirty).toBe(true);
  });

  it('应该能够验证字段', () => {
    const { result } = renderHook(() => useForm({
      fields: [
        { name: 'name', validator: mockValidator, required: true },
      ],
    }));

    act(() => {
      result.current.setValue('name', 'ab'); // 少于3个字符
    });

    expect(result.current.errors.name).toBe('至少3个字符');
    expect(result.current.isValid).toBe(false);
  });

  it('应该能够重置表单', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { name: 'Test' },
      fields: [
        { name: 'name', validator: mockValidator, required: true },
      ],
    }));

    act(() => {
      result.current.setValue('name', 'Changed');
      result.current.resetForm();
    });

    expect(result.current.values.name).toBe('Test');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });
});

describe('useDataOperations Hook测试', () => {
  const mockCreateItem = jest.fn();
  const mockUpdateItem = jest.fn();
  const mockDeleteItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确初始化数据状态', () => {
    const { result } = renderHook(() => useDataOperations({
      initialData: [{ id: '1', name: 'Item 1' }],
    }));

    expect(result.current.data).toEqual([{ id: '1', name: 'Item 1' }]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('应该能够创建项目', async () => {
    mockCreateItem.mockResolvedValue({ id: '2', name: 'New Item' });

    const { result } = renderHook(() => useDataOperations({
      initialData: [{ id: '1', name: 'Item 1' }],
      createItem: mockCreateItem,
    }));

    await act(async () => {
      await result.current.create({ name: 'New Item' });
    });

    expect(mockCreateItem).toHaveBeenCalledWith({ name: 'New Item' });
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[1]).toEqual({ id: '2', name: 'New Item' });
  });

  it('应该能够更新项目', async () => {
    mockUpdateItem.mockResolvedValue({ id: '1', name: 'Updated Item' });

    const { result } = renderHook(() => useDataOperations({
      initialData: [{ id: '1', name: 'Item 1' }],
      updateItem: mockUpdateItem,
    }));

    await act(async () => {
      await result.current.update('1', { name: 'Updated Item' });
    });

    expect(mockUpdateItem).toHaveBeenCalledWith('1', { name: 'Updated Item' });
    expect(result.current.data[0].name).toBe('Updated Item');
  });

  it('应该能够删除项目', async () => {
    mockDeleteItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDataOperations({
      initialData: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }],
      deleteItem: mockDeleteItem,
    }));

    await act(async () => {
      await result.current.remove('1');
    });

    expect(mockDeleteItem).toHaveBeenCalledWith('1');
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('2');
  });

  it('应该能够根据ID获取项目', () => {
    const { result } = renderHook(() => useDataOperations({
      initialData: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }],
    }));

    const item = result.current.getById('2');
    expect(item).toEqual({ id: '2', name: 'Item 2' });
  });

  it('应该能够过滤项目', () => {
    const { result } = renderHook(() => useDataOperations({
      initialData: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ],
    }));

    const filtered = result.current.filter(item => item.id !== '2');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe('1');
    expect(filtered[1].id).toBe('3');
  });
});


