/**
 * Sentry Edge 运行时配置
 * 
 * 用于 Next.js Edge 运行时（Middleware、Edge API Routes）的错误监控
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

    // 错误采样率
    sampleRate: 1.0,

    // 性能监控采样率（Edge 运行时资源受限，可以降低）
    tracesSampleRate: 0.05,

    // 在发送前处理事件
    beforeSend(event) {
      // 移除敏感信息
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // 如果是开发环境，不发送
      if (IS_DEVELOPMENT) {
        console.log('Sentry Edge Event (not sent in dev):', event);
        return null;
      }

      return event;
    },
  });
}

