/**
 * 性能优化工具库
 * 
 * 提供性能监控、优化和调试工具
 * 
 * @module performance-utils
 */

import { FEATURE_FLAGS } from '@/config/app';
import logger from './logger-util';

/**
 * 性能测量标记
 */
interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * 性能测量管理器
 */
class PerformanceManager {
  private marks: Map<string, PerformanceMark> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING;
  }

  /**
   * 开始性能测量
   */
  start(name: string): void {
    if (!this.enabled) return;

    this.marks.set(name, {
      name,
      startTime: performance.now(),
    });

    logger.debug(`[Performance] Started: ${name}`);
  }

  /**
   * 结束性能测量
   */
  end(name: string): number | undefined {
    if (!this.enabled) return;

    const mark = this.marks.get(name);
    if (!mark) {
      logger.warn(`[Performance] No start mark found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;

    mark.endTime = endTime;
    mark.duration = duration;

    logger.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

    return duration;
  }

  /**
   * 获取测量结果
   */
  getMark(name: string): PerformanceMark | undefined {
    return this.marks.get(name);
  }

  /**
   * 清除所有测量
   */
  clear(): void {
    this.marks.clear();
  }

  /**
   * 获取所有测量结果
   */
  getAll(): PerformanceMark[] {
    return Array.from(this.marks.values());
  }
}

/**
 * 全局性能管理器实例
 */
export const performanceManager = new PerformanceManager();

/**
 * 性能测量装饰器
 * 
 * @example
 * ```ts
 * @measurePerformance('myFunction')
 * function myFunction() {
 *   // ...
 * }
 * ```
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceManager.start(measureName);
      const result = originalMethod.apply(this, args);
      performanceManager.end(measureName);
      return result;
    };

    return descriptor;
  };
}

/**
 * 异步性能测量装饰器
 */
export function measureAsyncPerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceManager.start(measureName);
      const result = await originalMethod.apply(this, args);
      performanceManager.end(measureName);
      return result;
    };

    return descriptor;
  };
}

/**
 * 防抖函数
 * 
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 * 
 * @param func - 要节流的函数
 * @param wait - 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();

    if (!previous) previous = now;

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}

/**
 * 批量执行函数
 * 
 * 将多个异步操作合并为一次执行，提高性能
 * 
 * @param func - 要执行的函数
 * @param wait - 等待时间（毫秒）
 * @returns 批量执行函数
 */
export function batchExecute<T, R>(
  func: (items: T[]) => Promise<R>,
  wait: number = 100
): (item: T) => Promise<R> {
  let pending: T[] = [];
  let timeout: NodeJS.Timeout | null = null;
  let resolvers: Array<(value: R) => void> = [];

  return function (item: T): Promise<R> {
    return new Promise((resolve) => {
      pending.push(item);
      resolvers.push(resolve);

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        const items = [...pending];
        const currentResolvers = [...resolvers];
        
        pending = [];
        resolvers = [];
        timeout = null;

        try {
          const result = await func(items);
          currentResolvers.forEach(r => r(result));
        } catch (error) {
          logger.error('Batch execute error:', error);
        }
      }, wait);
    });
  };
}

/**
 * 内存化函数
 * 
 * 缓存函数结果，避免重复计算
 * 
 * @param func - 要缓存的函数
 * @param maxSize - 缓存最大数量
 * @returns 内存化后的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  maxSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  const keys: string[] = [];

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(this, args);
    
    cache.set(key, result);
    keys.push(key);

    // 清理超出大小的缓存
    if (keys.length > maxSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }

    return result;
  } as T;
}

/**
 * 异步内存化函数
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  maxSize: number = 100
): T {
  const cache = new Map<string, Promise<Awaited<ReturnType<T>>>>();
  const keys: string[] = [];

  return function (this: any, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = func.apply(this, args);
    
    cache.set(key, promise);
    keys.push(key);

    // 清理超出大小的缓存
    if (keys.length > maxSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }

    return promise;
  } as T;
}

/**
 * 延迟执行
 * 
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 请求动画帧Promise版本
 */
export function rafAsync(): Promise<number> {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * 空闲回调Promise版本
 */
export function idleAsync(): Promise<IdleDeadline> {
  return new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(resolve);
    } else {
      setTimeout(() => resolve({} as IdleDeadline), 0);
    }
  });
}

/**
 * 性能监控HOC
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Component';

  return function PerformanceMonitoredComponent(props: P) {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING) {
        logger.debug(`[Performance] ${name} render: ${duration.toFixed(2)}ms`);
      }
    });

    return React.createElement(Component, props);
  };
}

/**
 * 性能优化配置
 */
export const PERFORMANCE_CONFIG = {
  /** 是否启用性能监控 */
  ENABLED: FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING,
  /** 慢渲染阈值（毫秒） */
  SLOW_RENDER_THRESHOLD: 16.67, // 60 FPS
  /** 缓存大小 */
  CACHE_SIZE: 100,
  /** 批处理延迟（毫秒） */
  BATCH_DELAY: 100,
} as const;

/**
 * 导出所有工具
 */
export default {
  performanceManager,
  measurePerformance,
  measureAsyncPerformance,
  debounce,
  throttle,
  batchExecute,
  memoize,
  memoizeAsync,
  delay,
  rafAsync,
  idleAsync,
  withPerformanceMonitoring,
  PERFORMANCE_CONFIG,
};

