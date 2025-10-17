import { toast } from 'sonner';

/**
 * 批量操作配置
 */
export interface BatchOperationConfig {
  /** 操作名称，用于显示 */
  operationName: string;
  /** 是否显示进度 Toast */
  showProgress?: boolean;
  /** 是否显示成功 Toast */
  showSuccessToast?: boolean;
  /** 是否显示错误 Toast */
  showErrorToast?: boolean;
  /** 批量大小（每批处理多少个） */
  batchSize?: number;
  /** 批次间延迟（毫秒） */
  batchDelay?: number;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult<T = any> {
  /** 成功的项 */
  succeeded: T[];
  /** 失败的项 */
  failed: Array<{ item: T; error: Error }>;
  /** 总数 */
  total: number;
  /** 成功数 */
  successCount: number;
  /** 失败数 */
  failCount: number;
}

/**
 * 带进度反馈的批量操作执行器
 * 
 * 功能：
 * - 分批执行操作，避免阻塞UI
 * - 实时显示进度
 * - 错误处理和回滚
 * - 成功/失败统计
 * 
 * 性能优化：
 * - 分批处理，每批之间有延迟，避免UI冻结
 * - 使用 Promise.allSettled 并行处理同一批次
 * 
 * @example
 * const result = await executeBatchOperationWithProgress(
 *   selectedIds,
 *   async (id) => {
 *     await updateRequirement(id, { status: 'closed' });
 *     return id;
 *   },
 *   {
 *     operationName: '批量关闭需求',
 *     showProgress: true,
 *     batchSize: 10
 *   }
 * );
 */
export async function executeBatchOperationWithProgress<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  config: BatchOperationConfig
): Promise<BatchOperationResult<T>> {
  const {
    operationName,
    showProgress = true,
    showSuccessToast = true,
    showErrorToast = true,
    batchSize = 10,
    batchDelay = 100,
  } = config;

  const total = items.length;
  const succeeded: T[] = [];
  const failed: Array<{ item: T; error: Error }> = [];

  if (total === 0) {
    if (showErrorToast) {
      toast.error('没有选择任何项');
    }
    return {
      succeeded,
      failed,
      total: 0,
      successCount: 0,
      failCount: 0,
    };
  }

  // 显示开始 Toast
  let progressToastId: string | number | undefined;
  if (showProgress) {
    progressToastId = toast.loading(`${operationName}中... 0/${total}`);
  }

  try {
    // 分批处理
    for (let i = 0; i < total; i += batchSize) {
      const batch = items.slice(i, Math.min(i + batchSize, total));
      
      // 并行处理当前批次
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            await operation(item);
            return { status: 'fulfilled' as const, item };
          } catch (error) {
            return { 
              status: 'rejected' as const, 
              item, 
              error: error instanceof Error ? error : new Error(String(error)) 
            };
          }
        })
      );

      // 统计结果
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { item } = result.value as any;
          succeeded.push(item);
        } else {
          const { item, error } = (result.reason || {}) as any;
          failed.push({ item, error });
        }
      });

      // 更新进度
      if (showProgress && progressToastId) {
        const processed = Math.min(i + batchSize, total);
        toast.loading(`${operationName}中... ${processed}/${total}`, {
          id: progressToastId,
        });
      }

      // 批次间延迟，避免阻塞UI
      if (i + batchSize < total) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    // 关闭进度 Toast
    if (progressToastId) {
      toast.dismiss(progressToastId);
    }

    // 显示结果
    const successCount = succeeded.length;
    const failCount = failed.length;

    if (successCount > 0 && showSuccessToast) {
      if (failCount === 0) {
        toast.success(`${operationName}成功！共处理 ${successCount} 项`);
      } else {
        toast.warning(
          `${operationName}完成！成功 ${successCount} 项，失败 ${failCount} 项`
        );
      }
    }

    if (failCount > 0 && showErrorToast) {
      // 显示第一个错误的详细信息
      const firstError = failed[0];
      toast.error(
        `${operationName}部分失败：${firstError.error.message}`,
        {
          description: failCount > 1 ? `还有 ${failCount - 1} 项失败` : undefined,
        }
      );
    }

    return {
      succeeded,
      failed,
      total,
      successCount,
      failCount,
    };
  } catch (error) {
    // 意外错误
    if (progressToastId) {
      toast.dismiss(progressToastId);
    }
    
    if (showErrorToast) {
      toast.error(
        `${operationName}失败`,
        {
          description: error instanceof Error ? error.message : String(error),
        }
      );
    }

    throw error;
  }
}

/**
 * 同步批量操作（兼容旧API）
 * 
 * 对于不需要异步的操作，使用这个简化版本
 */
export function executeSyncBatchOperationWithProgress<T>(
  items: T[],
  operation: (item: T) => void,
  config: BatchOperationConfig
): BatchOperationResult<T> {
  const {
    operationName,
    showSuccessToast = true,
    showErrorToast = true,
  } = config;

  const total = items.length;
  const succeeded: T[] = [];
  const failed: Array<{ item: T; error: Error }> = [];

  if (total === 0) {
    if (showErrorToast) {
      toast.error('没有选择任何项');
    }
    return {
      succeeded,
      failed,
      total: 0,
      successCount: 0,
      failCount: 0,
    };
  }

  // 显示加载提示
  const toastId = toast.loading(`${operationName}中...`);

  try {
    items.forEach((item) => {
      try {
        operation(item);
        succeeded.push(item);
      } catch (error) {
        failed.push({
          item,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });

    // 关闭加载提示
    toast.dismiss(toastId);

    // 显示结果
    const successCount = succeeded.length;
    const failCount = failed.length;

    if (successCount > 0 && showSuccessToast) {
      if (failCount === 0) {
        toast.success(`${operationName}成功！共处理 ${successCount} 项`);
      } else {
        toast.warning(
          `${operationName}完成！成功 ${successCount} 项，失败 ${failCount} 项`
        );
      }
    }

    if (failCount > 0 && showErrorToast) {
      const firstError = failed[0];
      toast.error(
        `${operationName}部分失败：${firstError.error.message}`,
        {
          description: failCount > 1 ? `还有 ${failCount - 1} 项失败` : undefined,
        }
      );
    }

    return {
      succeeded,
      failed,
      total,
      successCount,
      failCount,
    };
  } catch (error) {
    toast.dismiss(toastId);
    
    if (showErrorToast) {
      toast.error(
        `${operationName}失败`,
        {
          description: error instanceof Error ? error.message : String(error),
        }
      );
    }

    throw error;
  }
}





