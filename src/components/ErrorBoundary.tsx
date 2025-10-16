/**
 * 全局错误边界组件
 * 
 * P0 功能：捕获 React 组件树中的错误
 * 
 * 功能特性：
 * - 捕获组件渲染错误
 * - 显示用户友好的错误界面
 * - 记录错误到日志系统
 * - 发送错误到监控服务（Sentry）
 * - 支持错误恢复（重新渲染）
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

'use client';

import React from 'react';
import { logger } from '@/lib/logger';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props 接口
 */
interface ErrorBoundaryProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 自定义错误界面 */
  fallback?: React.ReactNode;
  /** 错误发生时的回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** 是否显示错误详情（仅开发环境） */
  showDetails?: boolean;
}

/**
 * State 接口
 */
interface ErrorBoundaryState {
  /** 是否发生错误 */
  hasError: boolean;
  /** 错误对象 */
  error?: Error;
  /** 错误信息 */
  errorInfo?: React.ErrorInfo;
  /** 错误ID（用于追踪） */
  errorId?: string;
}

/**
 * 全局错误边界类组件
 * 
 * 注意：错误边界必须是类组件，因为 React 目前不支持函数组件的错误边界
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  /**
   * 静态方法：从错误中派生状态
   * 
   * 当子组件抛出错误时，React 会调用此方法
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新状态以触发降级 UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
  }

  /**
   * 错误捕获后的回调
   * 
   * 用于记录错误日志、发送到监控服务等
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 1. 记录到日志系统
    logger.error(`React Error Boundary caught an error: ${error.message} (ID: ${this.state.errorId})`, {
      error,
      action: 'component-error',
    });

    // 2. 发送到 Sentry（如果已集成）
    if (typeof window !== 'undefined' && (window as Window & { Sentry?: { captureException: (error: Error, options?: unknown) => void } }).Sentry) {
      (window as unknown as Window & { Sentry: { captureException: (error: Error, options?: unknown) => void } }).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
          errorId: this.state.errorId,
        },
      });
    }

    // 3. 调用自定义错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 4. 更新状态以包含错误信息
    this.setState({
      errorInfo,
    });
  }

  /**
   * 重置错误状态（用于重新尝试渲染）
   */
  private resetError = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  /**
   * 刷新页面
   */
  private reloadPage = (): void => {
    window.location.reload();
  };

  /**
   * 返回首页
   */
  private goHome = (): void => {
    window.location.href = '/';
  };

  /**
   * 渲染错误界面
   */
  private renderErrorUI(): React.ReactNode {
    const { error, errorInfo, errorId } = this.state;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const showDetails = this.props.showDetails ?? isDevelopment;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-2xl w-full">
          {/* 错误卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* 错误图标 */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            {/* 错误标题 */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              页面出错了
            </h1>

            {/* 错误描述 */}
            <p className="text-center text-gray-600 mb-8">
              很抱歉，页面遇到了一个意外错误。我们已经记录了此问题，并会尽快修复。
            </p>

            {/* 错误ID（用于用户反馈） */}
            {errorId && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 text-center">
                  错误ID: <span className="font-mono text-gray-900">{errorId}</span>
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  如需技术支持，请提供此错误ID
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                onClick={this.resetError}
                className="flex-1 flex items-center justify-center gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                重新尝试
              </Button>
              <Button
                onClick={this.reloadPage}
                className="flex-1 flex items-center justify-center gap-2"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                刷新页面
              </Button>
              <Button
                onClick={this.goHome}
                className="flex-1 flex items-center justify-center gap-2"
                variant="outline"
              >
                <Home className="h-4 w-4" />
                返回首页
              </Button>
            </div>

            {/* 错误详情（仅开发环境或明确启用时显示） */}
            {showDetails && error && (
              <details className="mt-6 border-t pt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  查看错误详情（开发模式）
                </summary>
                <div className="mt-4 space-y-4">
                  {/* 错误消息 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">错误消息：</h3>
                    <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800 overflow-x-auto">
                      {error.toString()}
                    </pre>
                  </div>

                  {/* 错误堆栈 */}
                  {error.stack && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">堆栈跟踪：</h3>
                      <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 overflow-x-auto max-h-60">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* 组件堆栈 */}
                  {errorInfo?.componentStack && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        组件堆栈：
                      </h3>
                      <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 overflow-x-auto max-h-60">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>

          {/* 帮助链接 */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              需要帮助？{' '}
              <a
                href="/help"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                联系技术支持
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 渲染方法
   */
  render(): React.ReactNode {
    if (this.state.hasError) {
      // 错误状态：显示降级 UI
      return this.props.fallback || this.renderErrorUI();
    }

    // 正常状态：渲染子组件
    return this.props.children;
  }
}

/**
 * 便捷 Hook：在函数组件中使用错误边界
 * 
 * 注意：这不是真正的错误边界，而是手动错误处理
 * 用于捕获异步操作中的错误
 * 
 * @example
 * ```tsx
 * const { catchError } = useErrorHandler();
 * 
 * const handleSubmit = catchError(async () => {
 *   await submitForm();
 * });
 * ```
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: Record<string, unknown>) => {
    logger.error(`Uncaught error in component: ${error.message}`, {
      error,
      ...context,
      action: 'manual-error-handling',
    });

    // 可以在这里触发全局错误提示
    if (typeof window !== 'undefined') {
      // 使用 toast 或其他通知组件
      console.error('Error:', error);
    }
  }, []);

  const catchError = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return (async (...args: Parameters<T>) => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error as Error);
          throw error; // 重新抛出，让调用者处理
        }
      }) as T;
    },
    [handleError]
  );

  return {
    handleError,
    catchError,
  };
}

