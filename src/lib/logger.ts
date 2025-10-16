/**
 * 日志管理系统
 * 
 * P2 功能：提供统一的日志记录和管理
 * 
 * 功能特性：
 * - 多级别日志（debug, info, warn, error）
 * - 结构化日志输出
 * - 错误追踪和堆栈信息
 * - 性能监控日志
 * - 用户行为日志
 * 
 * @module logger
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日志上下文接口
 */
export interface LogContext {
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId?: string;
  /** 请求ID */
  requestId?: string;
  /** 组件名称 */
  component?: string;
  /** 操作名称 */
  action?: string;
  /** 额外数据 */
  data?: Record<string, any>;
  /** 错误对象 */
  error?: Error;
  /** 性能指标 */
  performance?: {
    duration: number;
    memory?: number;
    timestamp: number;
  };
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel;
  /** 消息 */
  message: string;
  /** 上下文 */
  context: LogContext;
  /** 时间戳 */
  timestamp: string;
  /** 唯一ID */
  id: string;
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  /** 最小日志级别 */
  minLevel: LogLevel;
  /** 是否启用控制台输出 */
  enableConsole: boolean;
  /** 是否启用远程日志 */
  enableRemote: boolean;
  /** 远程日志端点 */
  remoteEndpoint?: string;
  /** 是否启用性能监控 */
  enablePerformance: boolean;
  /** 是否启用用户行为追踪 */
  enableUserTracking: boolean;
  /** 日志缓冲区大小 */
  bufferSize: number;
  /** 日志刷新间隔（毫秒） */
  flushInterval: number;
}

/**
 * 日志管理器类
 */
class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      enablePerformance: true,
      enableUserTracking: true,
      bufferSize: 100,
      flushInterval: 5000,
      ...config,
    };

    // 启动日志刷新定时器
    this.startFlushTimer();
  }

  /**
   * 调试日志
   */
  public debug(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 信息日志
   */
  public info(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 警告日志
   */
  public warn(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * 错误日志
   */
  public error(message: string, context: Partial<LogContext> = {}): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * 性能日志
   */
  public performance(
    message: string,
    duration: number,
    context: Partial<LogContext> = {}
  ): void {
    if (!this.config.enablePerformance) return;

    this.log(LogLevel.INFO, message, {
      ...context,
      performance: {
        duration,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * 用户行为日志
   */
  public userAction(
    action: string,
    context: Partial<LogContext> = {}
  ): void {
    if (!this.config.enableUserTracking) return;

    this.log(LogLevel.INFO, `User action: ${action}`, {
      ...context,
      action,
    });
  }

  /**
   * API 请求日志
   */
  public apiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context: Partial<LogContext> = {}
  ): void {
    this.log(LogLevel.INFO, `API ${method} ${url}`, {
      ...context,
      data: {
        method,
        url,
        statusCode,
        duration,
      },
    });
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, context: Partial<LogContext>): void {
    // 检查日志级别
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      level,
      message,
      context: {
        timestamp: new Date().toISOString(),
        ...context,
      } as LogContext,
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    };

    // 控制台输出
    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // 添加到缓冲区
    this.buffer.push(logEntry);

    // 检查缓冲区大小
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * 控制台输出
   */
  private outputToConsole(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    const contextStr = this.formatContext(context);
    const fullMessage = `${prefix} ${message}${contextStr}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, context);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, context);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, context);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, context);
        if (context.error) {
          console.error('Error stack:', context.error.stack);
        }
        break;
    }
  }

  /**
   * 格式化上下文信息
   */
  private formatContext(context: LogContext): string {
    const parts: string[] = [];
    
    if (context.userId) parts.push(`user:${context.userId}`);
    if (context.component) parts.push(`component:${context.component}`);
    if (context.action) parts.push(`action:${context.action}`);
    if (context.performance) {
      parts.push(`duration:${context.performance.duration}ms`);
    }

    return parts.length > 0 ? ` [${parts.join(', ')}]` : '';
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 刷新日志缓冲区
   */
  public async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    // 发送到远程端点
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await this.sendToRemote(logs);
      } catch (error) {
        console.error('Failed to send logs to remote endpoint:', error);
        // 重新添加到缓冲区
        this.buffer.unshift(...logs);
      }
    }
  }

  /**
   * 发送日志到远程端点
   */
  private async sendToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    const response = await fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs,
        timestamp: new Date().toISOString(),
        source: 'frontend',
      }),
    });

    if (!response.ok) {
      throw new Error(`Remote logging failed: ${response.status}`);
    }
  }

  /**
   * 启动刷新定时器
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 停止刷新定时器
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    this.flush();
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * 获取缓冲区大小
   */
  public getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * 清空缓冲区
   */
  public clearBuffer(): void {
    this.buffer = [];
  }
}

/**
 * 全局日志实例
 */
export const logger = new Logger({
  minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
  enablePerformance: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  enableUserTracking: true,
});

/**
 * 性能监控装饰器
 */
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize;

    try {
      const result = await method.apply(this, args);
      const duration = performance.now() - start;
      const endMemory = (performance as any).memory?.usedJSHeapSize;

      logger.performance(`${target.constructor.name}.${propertyName}`, duration, {
        data: {
          args: args.length,
          memoryDelta: endMemory ? endMemory - startMemory : undefined,
        },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;
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
 * React Hook: 使用日志
 */
export function useLogger(component: string) {
  return {
    debug: (message: string, context: Partial<LogContext> = {}) =>
      logger.debug(message, { ...context, component }),
    info: (message: string, context: Partial<LogContext> = {}) =>
      logger.info(message, { ...context, component }),
    warn: (message: string, context: Partial<LogContext> = {}) =>
      logger.warn(message, { ...context, component }),
    error: (message: string, context: Partial<LogContext> = {}) =>
      logger.error(message, { ...context, component }),
    userAction: (action: string, context: Partial<LogContext> = {}) =>
      logger.userAction(action, { ...context, component }),
  };
}

/**
 * 错误边界日志
 */
export function logErrorBoundary(error: Error, errorInfo: any, component: string): void {
  logger.error('React Error Boundary caught error', {
    error,
    data: {
      component,
      errorInfo,
      stack: error.stack,
    },
  });
}

/**
 * 页面性能日志
 */
export function logPagePerformance(pageName: string, metrics: {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}): void {
  logger.performance(`Page load: ${pageName}`, metrics.loadTime, {
    data: {
      renderTime: metrics.renderTime,
      memoryUsage: metrics.memoryUsage,
    },
  });
}

/**
 * API 调用日志
 */
export function logApiCall(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context: Partial<LogContext> = {}
): void {
  logger.apiRequest(method, url, statusCode, duration, context);
}

/**
 * 用户交互日志
 */
export function logUserInteraction(
  action: string,
  element: string,
  context: Partial<LogContext> = {}
): void {
  logger.userAction(`User ${action} on ${element}`, {
    ...context,
    data: { element, action },
  });
}