/**
 * Sentry 服务端配置
 * 
 * 用于 Next.js 服务端的错误监控
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = ENVIRONMENT === 'development';

// 只在启用时初始化 Sentry
if (SENTRY_DSN && !IS_DEVELOPMENT) {
  Sentry.init({
    // DSN（数据源名称）
    dsn: SENTRY_DSN,

    // 环境
    environment: ENVIRONMENT,

    // 发布版本
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

    // 错误采样率（服务端通常设置为 100%）
    sampleRate: 1.0,

    // 性能监控采样率（服务端可以设置更高）
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 0.1,

    // 忽略特定错误
    ignoreErrors: [
      // Next.js 相关
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      
      // 常见的无害错误
      'AbortError',
      'Connection reset by peer',
    ],

    // 在发送前处理事件
    beforeSend(event, hint) {
      // 移除敏感信息
      if (event.request) {
        // 移除请求头中的敏感信息
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }

        // 移除环境变量中的敏感信息
        if (event.contexts?.runtime?.name === 'node') {
          // 不发送环境变量
          delete event.contexts.runtime;
        }
      }

      // 如果是开发环境，打印到控制台而不发送
      if (IS_DEVELOPMENT) {
        console.log('Sentry Server Event (not sent in dev):', event);
        return null;
      }

      return event;
    },
  });
}

