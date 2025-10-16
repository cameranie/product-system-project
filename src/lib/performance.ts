/**
 * 性能监控系统
 * 
 * P2 功能：提供应用性能监控和优化
 * 
 * 功能特性：
 * - 页面加载性能监控
 * - 组件渲染性能监控
 * - API 调用性能监控
 * - 用户交互性能监控
 * - 内存使用监控
 * - 性能报告生成
 * 
 * @module performance
 */

import React from 'react';
import { logger, logPerformance, logPagePerformance } from './logger';

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 页面加载时间 */
  loadTime: number;
  /** 首次内容绘制时间 */
  fcp: number;
  /** 最大内容绘制时间 */
  lcp: number;
  /** 首次输入延迟 */
  fid: number;
  /** 累积布局偏移 */
  cls: number;
  /** 交互到下次绘制时间 */
  ttfb: number;
  /** 内存使用量 */
  memoryUsage?: number;
  /** 网络请求数量 */
  networkRequests: number;
  /** 资源大小 */
  resourceSize: number;
}

/**
 * 组件性能指标
 */
export interface ComponentMetrics {
  /** 组件名称 */
  componentName: string;
  /** 渲染时间 */
  renderTime: number;
  /** 重渲染次数 */
  reRenderCount: number;
  /** 内存使用量 */
  memoryUsage?: number;
  /** 子组件数量 */
  childCount: number;
  /** 属性数量 */
  propCount: number;
}

/**
 * API 性能指标
 */
export interface ApiMetrics {
  /** API 端点 */
  endpoint: string;
  /** 请求方法 */
  method: string;
  /** 响应时间 */
  responseTime: number;
  /** 状态码 */
  statusCode: number;
  /** 请求大小 */
  requestSize: number;
  /** 响应大小 */
  responseSize: number;
  /** 是否成功 */
  success: boolean;
}

/**
 * 用户交互性能指标
 */
export interface InteractionMetrics {
  /** 交互类型 */
  type: 'click' | 'scroll' | 'input' | 'navigation';
  /** 目标元素 */
  target: string;
  /** 响应时间 */
  responseTime: number;
  /** 时间戳 */
  timestamp: number;
  /** 用户代理 */
  userAgent: string;
  /** 页面URL */
  url: string;
}

/**
 * 性能监控器类
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private componentMetrics: Map<string, ComponentMetrics[]> = new Map();
  private apiMetrics: ApiMetrics[] = [];
  private interactionMetrics: InteractionMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializePerformanceObserver();
    this.startMemoryMonitoring();
  }

  /**
   * 初始化性能观察器
   */
  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // 观察页面加载性能
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // 观察资源加载性能
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry as PerformanceResourceTiming);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // 观察长任务
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordLongTask(entry as PerformanceEntry);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // 观察布局偏移
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordLayoutShift(entry as PerformanceEntry);
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);

    } catch (error) {
      logger.error('Failed to initialize performance observer', {
        error: error as Error,
      });
    }
  }

  /**
   * 记录导航性能指标
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      fcp: this.getFCP(),
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      ttfb: entry.responseStart - entry.requestStart,
      memoryUsage: this.getMemoryUsage(),
      networkRequests: this.getNetworkRequestCount(),
      resourceSize: this.getResourceSize(),
    };

    this.metrics.push(metrics);
    logPagePerformance('Page Load', {
      loadTime: metrics.loadTime,
      renderTime: metrics.fcp || 0, // 使用 FCP 作为 renderTime
      memoryUsage: metrics.memoryUsage,
    });
  }

  /**
   * 记录资源性能指标
   */
  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    // 记录资源加载时间
    const loadTime = entry.responseEnd - entry.requestStart;
    
    if (loadTime > 1000) { // 超过1秒的资源
      logger.warn('Slow resource loading', {
        data: {
          name: entry.name,
          duration: loadTime,
          size: entry.transferSize,
        },
      });
    }
  }

  /**
   * 记录长任务
   */
  private recordLongTask(entry: PerformanceEntry): void {
    logger.warn('Long task detected', {
      data: {
        duration: entry.duration,
        startTime: entry.startTime,
      },
    });
  }

  /**
   * 记录布局偏移
   */
  private recordLayoutShift(entry: PerformanceEntry): void {
    const layoutShift = (entry as any).value;
    if (layoutShift > 0.1) { // 显著布局偏移
      logger.warn('Layout shift detected', {
        data: {
          value: layoutShift,
          startTime: entry.startTime,
        },
      });
    }
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * 获取最大内容绘制时间
   */
  private getLCP(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
  }

  /**
   * 获取首次输入延迟
   */
  private getFID(): number {
    const fidEntries = performance.getEntriesByType('first-input');
    return fidEntries.length > 0 ? (fidEntries[0] as any).processingStart - fidEntries[0].startTime : 0;
  }

  /**
   * 获取累积布局偏移
   */
  private getCLS(): number {
    let cls = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    layoutShiftEntries.forEach((entry) => {
      if (!(entry as any).hadRecentInput) {
        cls += (entry as any).value;
      }
    });
    return cls;
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * 获取网络请求数量
   */
  private getNetworkRequestCount(): number {
    return performance.getEntriesByType('resource').length;
  }

  /**
   * 获取资源总大小
   */
  private getResourceSize(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.reduce((total, resource) => total + resource.transferSize, 0);
  }

  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage && memoryUsage > 50 * 1024 * 1024) { // 超过50MB
        logger.warn('High memory usage detected', {
          data: { memoryUsage },
        });
      }
    }, 30000); // 每30秒检查一次
  }

  /**
   * 记录组件性能
   */
  public recordComponentMetrics(
    componentName: string,
    renderTime: number,
    props: Record<string, any>
  ): void {
    const metrics: ComponentMetrics = {
      componentName,
      renderTime,
      reRenderCount: 1,
      memoryUsage: this.getMemoryUsage(),
      childCount: Object.keys(props).filter(key => Array.isArray(props[key])).length,
      propCount: Object.keys(props).length,
    };

    const existingMetrics = this.componentMetrics.get(componentName) || [];
    existingMetrics.push(metrics);
    this.componentMetrics.set(componentName, existingMetrics);

    // 记录慢组件
    if (renderTime > 16) { // 超过一帧的时间
      logger.warn('Slow component render', {
        data: {
          componentName,
          renderTime,
          propCount: metrics.propCount,
        },
      });
    }
  }

  /**
   * 记录 API 性能
   */
  public recordApiMetrics(metrics: ApiMetrics): void {
    this.apiMetrics.push(metrics);
    
    // 记录慢 API
    if (metrics.responseTime > 3000) { // 超过3秒
      logger.warn('Slow API response', {
        data: {
          endpoint: metrics.endpoint,
          responseTime: metrics.responseTime,
          statusCode: metrics.statusCode,
        },
      });
    }
  }

  /**
   * 记录用户交互性能
   */
  public recordInteractionMetrics(metrics: InteractionMetrics): void {
    this.interactionMetrics.push(metrics);
    
    // 记录慢交互
    if (metrics.responseTime > 100) { // 超过100ms
      logger.warn('Slow user interaction', {
        data: {
          type: metrics.type,
          target: metrics.target,
          responseTime: metrics.responseTime,
        },
      });
    }
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): {
    pageMetrics: PerformanceMetrics[];
    componentMetrics: Record<string, ComponentMetrics[]>;
    apiMetrics: ApiMetrics[];
    interactionMetrics: InteractionMetrics[];
    summary: {
      averageLoadTime: number;
      averageApiResponseTime: number;
      averageInteractionTime: number;
      totalMemoryUsage: number;
      slowComponents: string[];
      slowApis: string[];
    };
  } {
    const averageLoadTime = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length
      : 0;

    const averageApiResponseTime = this.apiMetrics.length > 0
      ? this.apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / this.apiMetrics.length
      : 0;

    const averageInteractionTime = this.interactionMetrics.length > 0
      ? this.interactionMetrics.reduce((sum, m) => sum + m.responseTime, 0) / this.interactionMetrics.length
      : 0;

    const totalMemoryUsage = this.metrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0);

    const slowComponents = Array.from(this.componentMetrics.entries())
      .filter(([_, metrics]) => metrics.some(m => m.renderTime > 16))
      .map(([name, _]) => name);

    const slowApis = this.apiMetrics
      .filter(m => m.responseTime > 3000)
      .map(m => m.endpoint);

    return {
      pageMetrics: this.metrics,
      componentMetrics: Object.fromEntries(this.componentMetrics),
      apiMetrics: this.apiMetrics,
      interactionMetrics: this.interactionMetrics,
      summary: {
        averageLoadTime,
        averageApiResponseTime,
        averageInteractionTime,
        totalMemoryUsage,
        slowComponents,
        slowApis,
      },
    };
  }

  /**
   * 清理性能数据
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
    this.apiMetrics = [];
    this.interactionMetrics = [];
  }

  /**
   * 启用/禁用性能监控
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 销毁性能监控器
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * 全局性能监控器实例
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能监控 Hook
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = React.useRef<number>(0);
  const renderCount = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - startTime.current;
      performanceMonitor.recordComponentMetrics(componentName, renderTime, {});
    };
  });

  return {
    recordRender: (props: Record<string, any>) => {
      const renderTime = performance.now() - startTime.current;
      performanceMonitor.recordComponentMetrics(componentName, renderTime, props);
    },
  };
}

/**
 * API 性能监控 Hook
 */
export function useApiPerformance() {
  const recordApiCall = React.useCallback((
    endpoint: string,
    method: string,
    startTime: number,
    statusCode: number,
    requestSize: number,
    responseSize: number
  ) => {
    const responseTime = performance.now() - startTime;
    performanceMonitor.recordApiMetrics({
      endpoint,
      method,
      responseTime,
      statusCode,
      requestSize,
      responseSize,
      success: statusCode >= 200 && statusCode < 300,
    });
  }, []);

  return { recordApiCall };
}

/**
 * 用户交互性能监控 Hook
 */
export function useInteractionPerformance() {
  const recordInteraction = React.useCallback((
    type: InteractionMetrics['type'],
    target: string,
    startTime: number
  ) => {
    const responseTime = performance.now() - startTime;
    performanceMonitor.recordInteractionMetrics({
      type,
      target,
      responseTime,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, []);

  return { recordInteraction };
}

/**
 * 性能优化建议
 */
export function getPerformanceRecommendations(report: ReturnType<typeof performanceMonitor.getPerformanceReport>): string[] {
  const recommendations: string[] = [];
  const { summary } = report;

  // 页面加载性能建议
  if (summary.averageLoadTime > 3000) {
    recommendations.push('页面加载时间过长，建议优化资源加载和代码分割');
  }

  // API 性能建议
  if (summary.averageApiResponseTime > 2000) {
    recommendations.push('API 响应时间过长，建议优化后端接口或添加缓存');
  }

  // 用户交互性能建议
  if (summary.averageInteractionTime > 100) {
    recommendations.push('用户交互响应时间过长，建议优化事件处理逻辑');
  }

  // 内存使用建议
  if (summary.totalMemoryUsage > 100 * 1024 * 1024) {
    recommendations.push('内存使用量过高，建议检查内存泄漏和优化数据结构');
  }

  // 慢组件建议
  if (summary.slowComponents.length > 0) {
    recommendations.push(`以下组件渲染较慢，建议优化: ${summary.slowComponents.join(', ')}`);
  }

  // 慢 API 建议
  if (summary.slowApis.length > 0) {
    recommendations.push(`以下 API 响应较慢，建议优化: ${summary.slowApis.join(', ')}`);
  }

  return recommendations;
}

/**
 * 性能监控装饰器
 */
export function monitorPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize;

    try {
      const result = await method.apply(this, args);
      const duration = performance.now() - startTime;
      const endMemory = (performance as any).memory?.usedJSHeapSize;

      logger.debug(`Performance: ${target.constructor.name}.${propertyName} (${duration.toFixed(2)}ms)`, {
        data: {
          args: args.length,
          memoryDelta: endMemory ? endMemory - startMemory : undefined,
        },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`${target.constructor.name}.${propertyName} failed`, {
        error: error as Error,
        performance: {
          duration,
          timestamp: Date.now(),
        },
      });
      throw error;
    }
  };

  return descriptor;
}

/**
 * 性能监控组件
 */
export function PerformanceMonitorComponent({ children }: { children: React.ReactNode }) {
  // 在客户端环境中初始化性能监控
  if (typeof window !== 'undefined') {
    React.useEffect(() => {
      // 页面加载完成后记录性能指标
      const handleLoad = () => {
        const loadTime = performance.now();
        const memoryUsage = (performance as any).memory?.usedJSHeapSize;
        
        logPagePerformance('App Load', {
          loadTime,
          renderTime: 0,
          memoryUsage,
        });
      };

      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }, []);
  }

  return React.createElement(React.Fragment, null, children);
}
