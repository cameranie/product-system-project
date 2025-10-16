/**
 * Web Vitals 性能监控
 * 
 * 收集和上报关键性能指标：
 * - CLS (Cumulative Layout Shift) - 累积布局偏移
 * - FID (First Input Delay) - 首次输入延迟
 * - FCP (First Contentful Paint) - 首次内容绘制
 * - LCP (Largest Contentful Paint) - 最大内容绘制
 * - TTFB (Time to First Byte) - 首字节时间
 * - INP (Interaction to Next Paint) - 交互到下次绘制
 * 
 * 使用方式：
 * 在app/layout.tsx或_app.tsx中调用reportWebVitals
 */

import type { Metric } from 'web-vitals';

/**
 * 性能指标等级
 */
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

/**
 * 性能阈值配置
 * 基于Web Vitals推荐值
 */
const THRESHOLDS = {
  // LCP (Largest Contentful Paint)
  LCP: {
    good: 2500,      // ≤ 2.5s 为良好
    poor: 4000,      // > 4s 为差
  },
  // FID (First Input Delay)
  FID: {
    good: 100,       // ≤ 100ms 为良好
    poor: 300,       // > 300ms 为差
  },
  // CLS (Cumulative Layout Shift)
  CLS: {
    good: 0.1,       // ≤ 0.1 为良好
    poor: 0.25,      // > 0.25 为差
  },
  // FCP (First Contentful Paint)
  FCP: {
    good: 1800,      // ≤ 1.8s 为良好
    poor: 3000,      // > 3s 为差
  },
  // TTFB (Time to First Byte)
  TTFB: {
    good: 800,       // ≤ 800ms 为良好
    poor: 1800,      // > 1.8s 为差
  },
  // INP (Interaction to Next Paint)
  INP: {
    good: 200,       // ≤ 200ms 为良好
    poor: 500,       // > 500ms 为差
  },
} as const;

/**
 * 获取性能指标等级
 */
function getRating(metric: Metric): PerformanceRating {
  const { name, value } = metric;
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * 格式化指标值为可读字符串
 */
function formatValue(metric: Metric): string {
  const { name, value } = metric;
  
  // CLS 是无单位的分数
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  
  // 其他指标以毫秒为单位
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }
  
  return `${(value / 1000).toFixed(2)}s`;
}

/**
 * 上报性能指标到分析服务
 * 
 * 为什么需要性能监控？
 * - 及早发现性能问题
 * - 跟踪性能变化趋势
 * - 优化用户体验
 * - 识别慢速设备/网络环境
 */
function sendToAnalytics(metric: Metric) {
  const rating = getRating(metric);
  const formattedValue = formatValue(metric);
  
  // 发送到分析服务（Google Analytics、Sentry等）
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: rating,
      metric_value: formattedValue,
      non_interaction: true,
    });
  }
  
  // 发送到Sentry（如果已配置）
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setMeasurement(metric.name, metric.value, 'millisecond');
  }
  
  // 自定义分析服务
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Web Vitals', {
      name: metric.name,
      value: metric.value,
      rating,
      formattedValue,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  }
}

/**
 * 本地开发环境日志
 */
function logToConsole(metric: Metric) {
  if (process.env.NODE_ENV !== 'development') return;
  
  const rating = getRating(metric);
  const formattedValue = formatValue(metric);
  
  // 根据性能等级使用不同的日志级别
  const logMethod = {
    good: 'log',
    'needs-improvement': 'warn',
    poor: 'error',
  }[rating] as 'log' | 'warn' | 'error';
  
  console[logMethod](
    `[Web Vitals] ${metric.name}:`,
    formattedValue,
    `(${rating})`,
    metric
  );
}

/**
 * 性能指标上报函数
 * 
 * @param metric - Web Vitals指标
 * 
 * @example
 * ```typescript
 * // 在app/layout.tsx或_app.tsx中使用
 * import { reportWebVitals } from '@/lib/web-vitals';
 * 
 * export function reportWebVitals(metric: Metric) {
 *   reportWebVitals(metric);
 * }
 * ```
 */
export function reportWebVitals(metric: Metric) {
  // 开发环境打印到控制台
  logToConsole(metric);
  
  // 生产环境上报到分析服务
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(metric);
  }
}

/**
 * 手动测量性能指标
 * 
 * 用于测量自定义操作的性能
 * 
 * @example
 * ```typescript
 * const measure = startMeasure('data-load');
 * await loadData();
 * const duration = measure.end();
 * console.log(`数据加载耗时: ${duration}ms`);
 * ```
 */
export function startMeasure(name: string) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 记录到Performance API
      if (typeof performance !== 'undefined' && performance.measure) {
        try {
          performance.mark(`${name}-start`);
          performance.mark(`${name}-end`);
          performance.measure(name, `${name}-start`, `${name}-end`);
        } catch (e) {
          // 忽略测量错误
        }
      }
      
      // 开发环境打印
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    },
  };
}

/**
 * 获取页面加载性能指标
 * 
 * @returns 页面加载性能数据
 */
export function getPageLoadMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }
  
  const perfData = window.performance.timing;
  const navigation = window.performance.navigation;
  
  return {
    // DNS查询耗时
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    // TCP连接耗时
    tcp: perfData.connectEnd - perfData.connectStart,
    // 请求耗时
    request: perfData.responseEnd - perfData.requestStart,
    // 响应耗时
    response: perfData.responseEnd - perfData.responseStart,
    // DOM解析耗时
    domParse: perfData.domInteractive - perfData.domLoading,
    // 资源加载耗时
    resourceLoad: perfData.loadEventStart - perfData.domContentLoadedEventEnd,
    // 总耗时
    total: perfData.loadEventEnd - perfData.navigationStart,
    // 导航类型
    navigationType: ['navigate', 'reload', 'back_forward', 'prerender'][navigation.type] || 'navigate',
  };
}

/**
 * 导出类型供外部使用
 */
export type { Metric };




