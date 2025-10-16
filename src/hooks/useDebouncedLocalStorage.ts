/**
 * 防抖的 localStorage Hook
 * 
 * P2 性能优化：避免频繁写入 localStorage
 * 
 * 使用防抖策略，在用户停止操作一段时间后再保存数据，
 * 减少不必要的写入操作，提升性能
 * 
 * @module useDebouncedLocalStorage
 */

import { useEffect, useRef, useCallback } from 'react';
import { safeSetItem } from '@/lib/storage-utils';

/**
 * 防抖配置
 */
interface DebounceOptions {
  /** 延迟时间（毫秒），默认 500ms */
  delay?: number;
  /** 是否在组件卸载时立即保存，默认 true */
  saveOnUnmount?: boolean;
}

/**
 * 防抖的 localStorage 保存 Hook
 * 
 * P2 性能优化：
 * - ✅ 使用防抖减少 localStorage 写入频率
 * - ✅ 组件卸载时自动保存
 * - ✅ 支持自定义延迟时间
 * 
 * @param key - localStorage 键名
 * @param value - 要保存的值
 * @param options - 防抖配置
 * 
 * @example
 * ```tsx
 * // 在组件中使用
 * const [filters, setFilters] = useState([]);
 * useDebouncedLocalStorage('custom-filters', filters, { delay: 1000 });
 * ```
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  value: T,
  options: DebounceOptions = {}
): void {
  const { delay = 500, saveOnUnmount = true } = options;

  // 使用 ref 存储最新的值和定时器 ID
  const valueRef = useRef<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 更新 ref 中的值
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // 立即保存函数
  const saveNow = useCallback(() => {
    const success = safeSetItem(key, valueRef.current);
    if (!success) {
      console.warn(`Failed to save to localStorage: ${key}`);
    }
  }, [key]);

  // 防抖保存函数
  const debouncedSave = useCallback(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      saveNow();
      timerRef.current = null;
    }, delay);
  }, [delay, saveNow]);

  // 当 value 变化时，触发防抖保存
  useEffect(() => {
    debouncedSave();

    // 清理函数：清除定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, debouncedSave]);

  // 组件卸载时立即保存（如果配置了 saveOnUnmount）
  useEffect(() => {
    return () => {
      if (saveOnUnmount) {
        // 清除定时器
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        // 立即保存
        const success = safeSetItem(key, valueRef.current);
        if (!success) {
          console.warn(`Failed to save on unmount: ${key}`);
        }
      }
    };
  }, [key, saveOnUnmount]);
}

/**
 * 批量防抖的 localStorage 保存 Hook
 * 
 * 用于同时保存多个相关的状态，避免多次写入
 * 
 * @param items - 要保存的项数组 { key, value }
 * @param options - 防抖配置
 * 
 * @example
 * ```tsx
 * useDebouncedLocalStorageBatch([
 *   { key: 'filters', value: filters },
 *   { key: 'hidden-columns', value: hiddenColumns },
 *   { key: 'column-order', value: columnOrder },
 * ], { delay: 1000 });
 * ```
 */
export function useDebouncedLocalStorageBatch<T = any>(
  items: Array<{ key: string; value: T }>,
  options: DebounceOptions = {}
): void {
  const { delay = 500, saveOnUnmount = true } = options;

  // 使用 ref 存储最新的值和定时器 ID
  const itemsRef = useRef(items);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 更新 ref 中的值
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 立即保存函数
  const saveNow = useCallback(() => {
    itemsRef.current.forEach(({ key, value }) => {
      const success = safeSetItem(key, value);
      if (!success) {
        console.warn(`Failed to save to localStorage: ${key}`);
      }
    });
  }, []);

  // 防抖保存函数
  const debouncedSave = useCallback(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      saveNow();
      timerRef.current = null;
    }, delay);
  }, [delay, saveNow]);

  // 当 items 变化时，触发防抖保存
  useEffect(() => {
    debouncedSave();

    // 清理函数：清除定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [items, debouncedSave]);

  // 组件卸载时立即保存（如果配置了 saveOnUnmount）
  useEffect(() => {
    return () => {
      if (saveOnUnmount) {
        // 清除定时器
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        // 立即保存
        itemsRef.current.forEach(({ key, value }) => {
          const success = safeSetItem(key, value);
          if (!success) {
            console.warn(`Failed to save on unmount: ${key}`);
          }
        });
      }
    };
  }, [saveOnUnmount]);
}

