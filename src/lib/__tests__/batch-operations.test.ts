/**
 * batch-operations 单元测试
 * 
 * P0 测试覆盖：批量操作工具
 * 目标覆盖率：≥85%
 */

import { executeSyncBatchOperation } from '../batch-operations';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('batch-operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeSyncBatchOperation', () => {
    it('应该成功执行所有操作', () => {
      const itemIds = ['item1', 'item2', 'item3'];
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        operationName: '测试操作',
      });

      expect(operationFn).toHaveBeenCalledTimes(3);
      expect(operationFn).toHaveBeenCalledWith('item1');
      expect(operationFn).toHaveBeenCalledWith('item2');
      expect(operationFn).toHaveBeenCalledWith('item3');

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.failures).toEqual([]);

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('测试操作成功')
      );
    });

    it('应该处理部分失败的情况', () => {
      const itemIds = ['item1', 'item2', 'item3', 'item4'];
      const operationFn = jest.fn((id) => {
        if (id === 'item2' || id === 'item4') {
          throw new Error(`Failed for ${id}`);
        }
      });

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        operationName: '批量更新',
        showErrorToast: true,
      });

      expect(result.successCount).toEqual(['item1', 'item3']);
      expect(result.failureCount).toEqual(['item2', 'item4']);

      expect(toast.success).toHaveBeenCalledWith(
        '批量更新成功',
        expect.objectContaining({
          description: '成功处理 2 项。',
        })
      );

      expect(toast.error).toHaveBeenCalledWith(
        '批量更新部分失败',
        expect.objectContaining({
          description: '未能处理 2 项。请检查控制台获取详情。',
        })
      );
    });

    it('应该处理全部失败的情况', () => {
      const itemIds = ['item1', 'item2'];
      const operationFn = jest.fn(() => {
        throw new Error('Operation failed');
      });

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        operationName: '批量删除',
        showErrorToast: true,
      });

      expect(result.successCount).toEqual([]);
      expect(result.failureCount).toEqual(itemIds);

      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        '批量删除失败',
        expect.objectContaining({
          description: '所有操作均未能成功。请检查控制台获取详情。',
        })
      );
    });

    it('应该处理空数组', () => {
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation([], operationFn, {
        showErrorToast: true,
      });

      expect(operationFn).not.toHaveBeenCalled();
      expect(result.successCount).toEqual([]);
      expect(result.failureCount).toEqual([]);

      expect(toast.error).toHaveBeenCalledWith(
        '批量操作失败',
        expect.objectContaining({
          description: '没有选择任何项。',
        })
      );
    });

    it('应该遵守最大项数限制', () => {
      const itemIds = Array.from({ length: 150 }, (_, i) => `item${i}`);
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        maxItems: 100,
        showErrorToast: true,
      });

      expect(operationFn).not.toHaveBeenCalled();
      expect(result.successCount).toEqual([]);
      expect(result.failureCount).toEqual([]);

      expect(toast.error).toHaveBeenCalledWith(
        '批量操作失败',
        expect.objectContaining({
          description: '最多只能选择 100 项进行批量操作。',
        })
      );
    });

    it('应该支持自定义操作名称', () => {
      const itemIds = ['item1'];
      const operationFn = jest.fn();

      executeSyncBatchOperation(itemIds, operationFn, {
        operationName: '自定义操作名',
      });

      expect(toast.success).toHaveBeenCalledWith(
        '自定义操作名成功',
        expect.any(Object)
      );
    });

    it('应该支持禁用成功提示', () => {
      const itemIds = ['item1', 'item2'];
      const operationFn = jest.fn();

      executeSyncBatchOperation(itemIds, operationFn, {
        showSuccessToast: false,
      });

      expect(toast.success).not.toHaveBeenCalled();
    });

    it('应该支持禁用错误提示', () => {
      const itemIds = ['item1'];
      const operationFn = jest.fn(() => {
        throw new Error('Failed');
      });

      executeSyncBatchOperation(itemIds, operationFn, {
        showErrorToast: false,
      });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('应该使用默认选项', () => {
      const itemIds = ['item1'];
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation(itemIds, operationFn);

      expect(result.successCount).toEqual(['item1']);
      expect(toast.success).toHaveBeenCalled(); // 默认显示成功提示
    });

    it('应该记录控制台错误', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const itemIds = ['item1'];
      const error = new Error('Test error');
      const operationFn = jest.fn(() => {
        throw error;
      });

      executeSyncBatchOperation(itemIds, operationFn, {
        showErrorToast: false,
      });

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error executing operation for item'),
        error
      );

      consoleError.mockRestore();
    });

    it('应该支持泛型类型', () => {
      // 测试类型安全
      const itemIds: string[] = ['#1', '#2', '#3'];
      const operationFn = jest.fn((id: string) => {
        expect(typeof id).toBe('string');
      });

      const result = executeSyncBatchOperation<string>(itemIds, operationFn);

      expect(result.successCount).toHaveLength(3);
      result.successCount.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });

    it('应该处理异步操作函数（虽然是同步执行）', () => {
      const itemIds = ['item1', 'item2'];
      let callCount = 0;
      
      const operationFn = jest.fn((id: string) => {
        callCount++;
        // 模拟一些同步操作
        const result = id.toUpperCase();
        return result;
      });

      const result = executeSyncBatchOperation(itemIds, operationFn);

      expect(callCount).toBe(2);
      expect(result.successCount).toEqual(itemIds);
    });
  });

  describe('边界条件', () => {
    it('应该处理特殊字符的 ID', () => {
      const itemIds = ['#1', 'item-2', 'item_3', 'item.4'];
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation(itemIds, operationFn);

      expect(result.successCount).toEqual(itemIds);
    });

    it('应该处理数字类型的 ID', () => {
      const itemIds = [1, 2, 3];
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation<number>(itemIds, operationFn);

      expect(result.successCount).toEqual(itemIds);
    });

    it('应该处理对象类型的 ID', () => {
      type Item = { id: string; name: string };
      const itemIds: Item[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const operationFn = jest.fn();

      const result = executeSyncBatchOperation<Item>(itemIds, operationFn);

      expect(result.successCount).toHaveLength(2);
    });

    it('应该处理大量项目（性能测试）', () => {
      const itemIds = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const operationFn = jest.fn();

      const startTime = Date.now();
      const result = executeSyncBatchOperation(itemIds, operationFn, {
        showSuccessToast: false,
      });
      const endTime = Date.now();

      expect(result.successCount).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该按顺序执行操作', () => {
      const itemIds = ['item1', 'item2', 'item3'];
      const executionOrder: string[] = [];
      const operationFn = jest.fn((id: string) => {
        executionOrder.push(id);
      });

      executeSyncBatchOperation(itemIds, operationFn);

      expect(executionOrder).toEqual(itemIds);
    });
  });

  describe('错误类型处理', () => {
    it('应该处理 Error 对象', () => {
      const itemIds = ['item1'];
      const error = new Error('Custom error');
      const operationFn = jest.fn(() => {
        throw error;
      });

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        showErrorToast: false,
      });

      expect(result.failureCount).toEqual(['item1']);
    });

    it('应该处理字符串异常', () => {
      const itemIds = ['item1'];
      const operationFn = jest.fn(() => {
        throw 'String error';
      });

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        showErrorToast: false,
      });

      expect(result.failureCount).toEqual(['item1']);
    });

    it('应该处理 null/undefined 异常', () => {
      const itemIds = ['item1'];
      const operationFn = jest.fn(() => {
        throw null;
      });

      const result = executeSyncBatchOperation(itemIds, operationFn, {
        showErrorToast: false,
      });

      expect(result.failureCount).toEqual(['item1']);
    });
  });
});

