/**
 * 环境配置
 * 
 * 统一管理所有环境变量,避免直接使用 process.env
 * 提供类型安全和默认值
 * 
 * @module config/env
 */

/**
 * 环境类型
 */
export type Environment = 'development' | 'test' | 'production';

/**
 * 获取当前环境
 */
export function getEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'test') return 'test';
  return 'development';
}

/**
 * 环境配置对象
 */
export const env = {
  /** 当前环境 */
  environment: getEnvironment(),
  
  /** 是否为开发环境 */
  isDevelopment: getEnvironment() === 'development',
  
  /** 是否为生产环境 */
  isProduction: getEnvironment() === 'production',
  
  /** 是否为测试环境 */
  isTest: getEnvironment() === 'test',
  
  /** API 基础 URL */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  /** API 请求超时 (ms) */
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  
  /** 是否启用调试日志 */
  enableDebugLogs: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true',
  
  /** 是否启用虚拟滚动 */
  enableVirtualization: process.env.NEXT_PUBLIC_ENABLE_VIRTUALIZATION !== 'false', // 默认启用
  
  /** 是否启用实时同步 */
  enableRealTimeSync: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_SYNC === 'true',
  
  /** 批量操作最大数量 */
  batchOperationMax: Number(process.env.NEXT_PUBLIC_BATCH_OPERATION_MAX) || 100,
  
  /** 虚拟滚动阈值 */
  virtualizationThreshold: Number(process.env.NEXT_PUBLIC_VIRTUALIZATION_THRESHOLD) || 100,
  
  /** Sentry DSN */
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  /** Sentry 环境 */
  sentryEnvironment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || getEnvironment(),
  
  /** 是否启用 Sentry */
  enableSentry: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
} as const;

/**
 * 验证必需的环境变量
 * 在应用启动时调用
 */
export function validateEnv(): void {
  const errors: string[] = [];
  
  // 生产环境必需的环境变量
  if (env.isProduction) {
    if (!env.apiUrl || env.apiUrl === 'http://localhost:3000/api') {
      errors.push('生产环境必须配置 NEXT_PUBLIC_API_URL');
    }
    
    if (env.enableDebugLogs) {
      errors.push('生产环境不应启用 NEXT_PUBLIC_ENABLE_DEBUG_LOGS');
    }
  }
  
  if (errors.length > 0) {
    console.error('环境变量验证失败:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (env.isProduction) {
      throw new Error('环境变量验证失败,应用无法启动');
    }
  }
}

/**
 * 打印环境配置 (开发/测试环境)
 */
export function printEnvConfig(): void {
  if (env.isProduction) return;
  
  console.log('\n========== 环境配置 ==========');
  console.log(`环境: ${env.environment}`);
  console.log(`API URL: ${env.apiUrl}`);
  console.log(`API 超时: ${env.apiTimeout}ms`);
  console.log(`调试日志: ${env.enableDebugLogs ? '启用' : '禁用'}`);
  console.log(`虚拟滚动: ${env.enableVirtualization ? '启用' : '禁用'}`);
  console.log(`实时同步: ${env.enableRealTimeSync ? '启用' : '禁用'}`);
  console.log(`批量操作限制: ${env.batchOperationMax}`);
  console.log(`Sentry: ${env.enableSentry ? '启用' : '禁用'}`);
  console.log('==============================\n');
}


