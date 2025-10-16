import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * 乐观更新配置选项
 */
interface OptimisticUpdateOptions<T> {
  /** 成功回调 */
  onSuccess?: (data: T) => void;
  /** 失败回调 */
  onError?: (error: Error) => void;
  /** 是否显示Toast提示 */
  showToast?: boolean;
  /** 成功提示文本 */
  successMessage?: string;
  /** 失败提示文本 */
  errorMessage?: string;
}

/**
 * 乐观更新 Hook
 * 
 * 实现乐观更新模式：先更新UI，如果API失败则自动回滚
 * 
 * 功能：
 * - 立即更新UI（乐观更新）
 * - API失败时自动回滚
 * - 加载状态管理
 * - 错误处理
 * 
 * @example
 * ```tsx
 * const { optimisticUpdate, isUpdating } = useOptimisticUpdate();
 * 
 * const handleToggleStatus = async () => {
 *   await optimisticUpdate(
 *     requirement,
 *     { isOpen: !requirement.isOpen },
 *     (id, updates) => updateRequirement(id, updates),
 *     {
 *       successMessage: '状态切换成功',
 *       errorMessage: '状态切换失败',
 *     }
 *   );
 * };
 * ```
 */
export function useOptimisticUpdate<T extends { id: string }>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // 使用ref存储回滚数据，避免闭包问题
  const rollbackDataRef = useRef<Map<string, T>>(new Map());

  /**
   * 执行乐观更新
   * 
   * @param current - 当前数据
   * @param updates - 更新内容
   * @param updateFn - 更新函数（调用API）
   * @param options - 配置选项
   * @returns 更新后的数据
   */
  const optimisticUpdate = useCallback(async <K extends Partial<T>>(
    current: T,
    updates: K,
    updateFn: (id: string, updates: K) => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      showToast = true,
      successMessage = '更新成功',
      errorMessage = '更新失败，已回滚',
    } = options;

    // 保存原始数据用于回滚
    const originalData = { ...current };
    rollbackDataRef.current.set(current.id, originalData);

    setIsUpdating(true);
    setLastError(null);

    try {
      // 执行实际的API更新
      const updatedData = await updateFn(current.id, updates);
      
      setIsUpdating(false);
      
      if (showToast) {
        toast.success(successMessage);
      }
      
      // 清除回滚数据
      rollbackDataRef.current.delete(current.id);
      
      onSuccess?.(updatedData);
      
      return updatedData;
    } catch (error) {
      // 更新失败，执行回滚
      setIsUpdating(false);
      
      const err = error instanceof Error ? error : new Error('Unknown error');
      setLastError(err);
      
      // 获取回滚数据
      const rollbackData = rollbackDataRef.current.get(current.id);
      
      if (rollbackData) {
        // 回滚到原始数据
        await updateFn(current.id, rollbackData as K).catch(() => {
          // 回滚也失败了，记录错误但不再抛出
          console.error('Rollback failed for:', current.id);
        });
        
        rollbackDataRef.current.delete(current.id);
      }
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      onError?.(err);
      
      return null;
    }
  }, []);

  /**
   * 批量乐观更新
   * 
   * @param items - 要更新的项目列表
   * @param updatesFn - 为每个项目生成更新内容的函数
   * @param updateFn - 更新函数
   * @param options - 配置选项
   * @returns 成功更新的项目数量
   */
  const batchOptimisticUpdate = useCallback(async <K extends Partial<T>>(
    items: T[],
    updatesFn: (item: T) => K,
    updateFn: (id: string, updates: K) => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ): Promise<number> => {
    setIsUpdating(true);
    
    let successCount = 0;
    const promises = items.map(async (item) => {
      const updates = updatesFn(item);
      const result = await optimisticUpdate(item, updates, updateFn, {
        ...options,
        showToast: false, // 批量操作不显示单个Toast
      });
      
      if (result) {
        successCount++;
      }
    });

    await Promise.allSettled(promises);
    
    setIsUpdating(false);
    
    // 显示批量操作结果
    if (options.showToast !== false) {
      if (successCount === items.length) {
        toast.success(`成功更新 ${successCount} 项`);
      } else if (successCount > 0) {
        toast.warning(`更新了 ${successCount}/${items.length} 项，部分失败`);
      } else {
        toast.error('批量更新失败');
      }
    }
    
    return successCount;
  }, [optimisticUpdate]);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  /**
   * 清除所有回滚数据
   */
  const clearRollbackData = useCallback(() => {
    rollbackDataRef.current.clear();
  }, []);

  return {
    /** 是否正在更新 */
    isUpdating,
    /** 最后一次错误 */
    lastError,
    /** 执行乐观更新 */
    optimisticUpdate,
    /** 批量乐观更新 */
    batchOptimisticUpdate,
    /** 清除错误 */
    clearError,
    /** 清除回滚数据 */
    clearRollbackData,
  };
}




