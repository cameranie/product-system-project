/**
 * 统一日志工具
 * 
 * 在开发环境输出日志，生产环境自动禁用
 * 
 * @module logger-util
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 统一日志接口
 */
export const logger = {
  /**
   * Debug 级别日志（仅开发环境）
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info 级别日志（仅开发环境）
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warn 级别日志
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error 级别日志（始终输出）
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    
    // 生产环境可以发送到监控服务
    if (!isDevelopment) {
      // TODO: 集成 Sentry 或其他错误监控服务
      // Sentry.captureException(args[0]);
    }
  },

  /**
   * 表格操作日志（仅开发环境）
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * 性能日志
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

/**
 * 用于替换原有的 console 调用
 */
export default logger;

