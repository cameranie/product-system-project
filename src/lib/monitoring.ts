/**
 * 监控和错误追踪集成
 * 
 * P0 功能：集成 Sentry 进行错误监控和性能追踪
 * 
 * 功能特性：
 * - 错误自动捕获和上报
 * - 性能监控（页面加载、API 调用）
 * - 用户行为追踪
 * - 自定义事件追踪
 * - 环境区分（dev/test/prod）
 * 
 * @example
 * ```ts
 * import { initMonitoring, trackEvent } from '@/lib/monitoring';
 * 
 * // 初始化（在应用启动时调用）
 * initMonitoring();
 * 
 * // 追踪自定义事件
 * trackEvent('button_click', { buttonName: 'submit' });
 * ```
 */

// 注意：实际项目中需要安装 @sentry/nextjs
// npm install --save @sentry/nextjs

/**
 * 监控配置接口
 */
interface MonitoringConfig {
  /** Sentry DSN */
  dsn?: string;
  /** 环境名称 */
  environment: string;
  /** 采样率（0-1，0表示不采样，1表示全部采样） */
  sampleRate: number;
  /** 性能监控采样率 */
  tracesSampleRate: number;
  /** 是否启用 */
  enabled: boolean;
  /** 发布版本 */
  release?: string;
}

/**
 * 获取监控配置
 */
function getMonitoringConfig(): MonitoringConfig {
  const environment = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  const isDevelopment = environment === 'development';

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment,
    // 生产环境：100% 错误采样，10% 性能采样
    // 测试环境：50% 错误采样，5% 性能采样
    // 开发环境：禁用
    sampleRate: isDevelopment ? 0 : environment === 'production' ? 1.0 : 0.5,
    tracesSampleRate: isDevelopment ? 0 : environment === 'production' ? 0.1 : 0.05,
    enabled: !isDevelopment && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
  };
}

/**
 * 初始化监控系统
 * 
 * 应在应用启动时调用一次
 */
export function initMonitoring(): void {
  const config = getMonitoringConfig();

  if (!config.enabled) {
    console.log('Monitoring disabled in development environment');
    return;
  }

  if (!config.dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  try {
    // 动态导入 Sentry（避免在开发环境加载）
    if (typeof window !== 'undefined') {
      // 客户端初始化
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.init({
          dsn: config.dsn,
          environment: config.environment,
          sampleRate: config.sampleRate,
          tracesSampleRate: config.tracesSampleRate,
          release: config.release,

          // 集成配置
          integrations: [
            // 注意：BrowserTracing 在 Sentry v8+ 中已废弃
            // new Sentry.BrowserTracing({
            //   routingInstrumentation: Sentry.nextRouterInstrumentation,
            // }),
            // new Sentry.Replay({
            //   // Session Replay（会话回放）
            //   maskAllText: true, // 隐藏所有文本（保护隐私）
            //   blockAllMedia: true, // 阻止所有媒体
            // }),
          ],

          // 忽略特定错误
          ignoreErrors: [
            // 浏览器插件错误
            'top.GLOBALS',
            'originalCreateNotification',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            // 网络错误
            'NetworkError',
            'Network request failed',
            // 取消的请求
            'AbortError',
            'The user aborted a request',
          ],

          // 过滤 URL
          denyUrls: [
            // Chrome 扩展
            /extensions\//i,
            /^chrome:\/\//i,
            /^chrome-extension:\/\//i,
          ],

          // 在发送前修改事件
          beforeSend(event, hint) {
            // 移除敏感信息
            if (event.request) {
              // 移除查询参数中的敏感信息
              if (event.request.url) {
                const url = new URL(event.request.url);
                url.searchParams.delete('token');
                url.searchParams.delete('password');
                event.request.url = url.toString();
              }

              // 移除请求头中的敏感信息
              if (event.request.headers) {
                delete event.request.headers['Authorization'];
                delete event.request.headers['Cookie'];
              }
            }

            return event;
          },
        });

        console.log('Sentry monitoring initialized');
      });
    }
  } catch (error) {
    console.error('Failed to initialize monitoring:', error);
  }
}

/**
 * 设置用户上下文
 * 
 * 将用户信息关联到错误报告
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * 清除用户上下文
 * 
 * 用户登出时调用
 */
export function clearUserContext(): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser(null);
  }
}

/**
 * 设置自定义标签
 * 
 * 用于分类和筛选错误
 */
export function setTag(key: string, value: string): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setTag(key, value);
  }
}

/**
 * 设置自定义上下文
 * 
 * 添加额外的调试信息
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setContext(name, context);
  }
}

/**
 * 手动捕获异常
 * 
 * 用于捕获 try-catch 中的错误
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    // Fallback: 记录到控制台
    console.error('Captured exception:', error, context);
  }
}

/**
 * 手动捕获消息
 * 
 * 用于记录非错误的重要信息
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, {
      level,
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    // Fallback: 记录到控制台
    console.log(`[${level}] ${message}`, context);
  }
}

/**
 * 追踪自定义事件
 * 
 * 用于业务指标追踪
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  // Sentry 中使用 breadcrumb 记录事件
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      type: 'user',
      category: 'event',
      message: eventName,
      data: properties,
      level: 'info',
    });
  }

  // 也可以集成其他分析工具（如 Google Analytics）
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
}

/**
 * 追踪业务指标
 * 
 * 用于监控关键业务数据
 */
export function trackBusinessMetric(
  metric: string,
  value: number,
  tags?: Record<string, string>
): void {
  const config = getMonitoringConfig();
  
  if (!config.enabled) return;

  // 发送到监控后端
  if (typeof window !== 'undefined' && config.dsn) {
    fetch(config.dsn.replace('/api/', '/api/metrics/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric,
        value,
        tags,
        timestamp: Date.now(),
        environment: config.environment,
      }),
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to send metric:', error);
    });
  }
}

/**
 * 性能监控：开始一个事务
 * 
 * 用于追踪自定义操作的性能
 */
export function startTransaction(name: string, operation: string): any {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    return (window as any).Sentry.startTransaction({
      name,
      op: operation,
    });
  }
  return null;
}

/**
 * React Hook：自动追踪组件渲染性能
 */
export function usePerformanceMonitoring(componentName: string) {
  if (typeof window === 'undefined') return;

  const config = getMonitoringConfig();
  if (!config.enabled) return;

  React.useEffect(() => {
    const transaction = startTransaction(componentName, 'react.mount');
    
    return () => {
      if (transaction) {
        transaction.finish();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// 注意：实际使用时需要安装 react
const React = typeof window !== 'undefined' ? require('react') : { useEffect: () => {} };

/**
 * 添加面包屑（用于错误上下文追踪）
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * 监控 API 调用
 */
export function monitorApiCall(
  method: string,
  url: string,
  status: number,
  duration: number
): void {
  // 添加面包屑
  addBreadcrumb(`API ${method} ${url}`, 'http', {
    method,
    url,
    status,
    duration,
  });

  // 追踪指标
  trackBusinessMetric('api.call.duration', duration, {
    method,
    status: status.toString(),
    endpoint: new URL(url).pathname,
  });

  // 如果是错误状态，记录消息
  if (status >= 400) {
    captureMessage(`API Error: ${method} ${url} - ${status}`, 'error', {
      method,
      url,
      status,
      duration,
    });
  }
}

/**
 * 导出配置（用于测试）
 */
export { getMonitoringConfig };

