/**
 * Sentry 客户端配置
 * 
 * 用于浏览器端的错误监控和性能追踪
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

    // 错误采样率（1.0 = 100%）
    sampleRate: ENVIRONMENT === 'production' ? 1.0 : 0.5,

    // 性能监控采样率
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0.05,

    // 会话回放采样率
    replaysSessionSampleRate: 0.1, // 10% 的正常会话
    replaysOnErrorSampleRate: 1.0, // 100% 的错误会话

    // 追踪传播目标
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/[^/]*\.yourdomain\.com/,
    ],

    // 集成配置
    integrations: [
      // 浏览器追踪 - Sentry v8 使用函数式集成
      Sentry.browserTracingIntegration(),

      // 会话回放（用于重现用户操作）
      Sentry.replayIntegration({
        // 隐藏所有文本内容（保护隐私）
        maskAllText: true,
        // 阻止所有媒体（图片、视频等）
        blockAllMedia: true,
      }),
    ],

    // 忽略特定错误
    ignoreErrors: [
      // 浏览器插件引起的错误
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      
      // 网络错误
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      
      // 取消的请求
      'AbortError',
      'The user aborted a request',
      'Request aborted',
      
      // ResizeObserver 错误（通常无害）
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    // 忽略的 URL
    denyUrls: [
      // Chrome 扩展
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox 扩展
      /^moz-extension:\/\//i,
      // Safari 扩展
      /^safari-extension:\/\//i,
    ],

    // 在发送前处理事件
    beforeSend(event, hint) {
      // 移除敏感信息
      if (event.request) {
        // 移除查询参数中的敏感信息
        if (event.request.url) {
          try {
            const url = new URL(event.request.url);
            url.searchParams.delete('token');
            url.searchParams.delete('password');
            url.searchParams.delete('api_key');
            url.searchParams.delete('secret');
            event.request.url = url.toString();
          } catch (e) {
            // URL 解析失败，使用原始 URL
          }
        }

        // 移除请求头中的敏感信息
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
          delete event.request.headers['X-API-Key'];
        }

        // 移除请求体中的敏感信息
        if (event.request.data) {
          try {
            const data = JSON.parse(JSON.stringify(event.request.data));
            if (typeof data === 'object') {
              delete data.password;
              delete data.token;
              delete data.api_key;
              delete data.secret;
              event.request.data = data;
            }
          } catch (e) {
            // 解析失败，保持原样
          }
        }
      }

      // 如果是开发环境，打印到控制台而不发送
      if (IS_DEVELOPMENT) {
        console.log('Sentry Event (not sent in dev):', event);
        return null; // 不发送到 Sentry
      }

      return event;
    },

    // 在面包屑发送前处理
    beforeBreadcrumb(breadcrumb, hint) {
      // 过滤掉过于频繁的面包屑
      if (breadcrumb.category === 'console') {
        return null;
      }

      return breadcrumb;
    },
  });

  // 设置用户上下文（如果已登录）
  // 这通常在用户登录后调用
  // Sentry.setUser({
  //   id: 'user-id',
  //   email: 'user@example.com',
  //   username: 'username',
  // });
}

