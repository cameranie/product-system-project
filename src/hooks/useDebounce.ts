import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

/**
 * 防抖值 Hook
 * 
 * 延迟更新值，在指定时间内如果值持续变化，只保留最后一次
 * 
 * 使用场景：
 * - 搜索输入框
 * - 自动保存
 * - API请求防抖
 * 
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的值
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // 只有当用户停止输入500ms后才执行搜索
 *   if (debouncedSearch) {
 *     performSearch(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：如果value在delay时间内再次变化，清除上一个定时器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook
 * 
 * 创建一个防抖的回调函数，在指定时间内多次调用只执行最后一次
 * 
 * @param callback - 要防抖的回调函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的回调函数
 * 
 * @example
 * ```tsx
 * const handleSave = useDebouncedCallback(async () => {
 *   await saveData();
 * }, 1000);
 * 
 * // 用户频繁点击保存，但只会在最后一次点击1秒后执行
 * <Button onClick={handleSave}>保存</Button>
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // 更新回调引用（避免闭包问题）
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 创建防抖函数（使用useMemo确保引用稳定）
  const debouncedCallback = useMemo(
    () =>
      ((...args: Parameters<T>) => {
        // 清除之前的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 设置新的定时器
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delay);
      }) as T,
    [delay]
  );

  return debouncedCallback;
}

/**
 * 节流值 Hook
 * 
 * 限制值的更新频率，在指定时间内最多更新一次
 * 
 * 使用场景：
 * - 滚动事件
 * - 窗口resize事件
 * - 频繁更新的数据
 * 
 * @param value - 需要节流的值
 * @param interval - 更新间隔（毫秒）
 * @returns 节流后的值
 * 
 * @example
 * ```tsx
 * const [scrollPosition, setScrollPosition] = useState(0);
 * const throttledPosition = useThrottle(scrollPosition, 200);
 * 
 * // 滚动时每200ms最多更新一次
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    if (timeSinceLastUpdate >= interval) {
      // 距离上次更新已经超过间隔时间，立即更新
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    } else {
      // 还在间隔时间内，设置定时器在间隔结束时更新
      const timer = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * 节流回调 Hook
 * 
 * 创建一个节流的回调函数，在指定时间内最多执行一次
 * 
 * @param callback - 要节流的回调函数
 * @param interval - 执行间隔（毫秒）
 * @returns 节流后的回调函数
 * 
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scrolling...');
 * }, 200);
 * 
 * // 滚动时每200ms最多触发一次
 * <div onScroll={handleScroll}>...</div>
 * ```
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 500
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useMemo(
    () =>
      ((...args: Parameters<T>) => {
        const now = Date.now();
        const timeSinceLastRun = now - lastRunRef.current;

        if (timeSinceLastRun >= interval) {
          // 可以立即执行
          lastRunRef.current = now;
          callbackRef.current(...args);
        } else {
          // 在节流期内，设置定时器在间隔结束后执行
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            lastRunRef.current = Date.now();
            callbackRef.current(...args);
          }, interval - timeSinceLastRun);
        }
      }) as T,
    [interval]
  );

  return throttledCallback;
}




