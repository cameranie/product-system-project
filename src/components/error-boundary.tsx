/**
 * 全局错误边界组件
 * 
 * P2 功能：捕获和处理 React 应用中的错误
 * 
 * 功能特性：
 * - 错误捕获和显示
 * - 错误日志记录
 * - 错误恢复机制
 * - 用户友好的错误界面
 * - 开发模式详细错误信息
 * 
 * @module ErrorBoundary
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger, logErrorBoundary } from '@/lib/logger';

/**
 * 错误边界状态接口
 */
interface ErrorBoundaryState {
  /** 是否有错误 */
  hasError: boolean;
  /** 错误信息 */
  error?: Error;
  /** 错误详情 */
  errorInfo?: ErrorInfo;
  /** 错误ID */
  errorId?: string;
  /** 重试次数 */
  retryCount: number;
}

/**
 * 错误边界属性接口
 */
interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 错误回退组件 */
  fallback?: ReactNode;
  /** 错误处理回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 是否显示错误详情（开发模式） */
  showErrorDetails?: boolean;
  /** 自定义错误消息 */
  customErrorMessage?: string;
}

/**
 * 错误边界组件
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  /**
   * 静态方法：捕获错误
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * 组件捕获错误时的处理
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props;
    const { errorId } = this.state;

    // 记录错误日志
    logErrorBoundary(error, errorInfo, 'ErrorBoundary');

    // 更新状态
    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in error handler', {
          error: handlerError as Error,
          data: { originalError: error.message },
        });
      }
    }

    // 发送错误报告到监控服务
    this.reportError(error, errorInfo, errorId);
  }

  /**
   * 重试机制
   */
  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      logger.info('Retrying after error', {
        data: { retryCount: retryCount + 1, maxRetries },
      });

      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      logger.warn('Maximum retry attempts reached', {
        data: { retryCount, maxRetries },
      });
    }
  };

  /**
   * 重置错误状态
   */
  private handleReset = (): void => {
    logger.info('Resetting error boundary');
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: 0,
    });
  };

  /**
   * 报告错误到监控服务
   */
  private reportError(error: Error, errorInfo: ErrorInfo, errorId?: string): void {
    try {
      // 发送到错误监控服务（如 Sentry）
      if (typeof window !== 'undefined' && (window as Window & { Sentry?: { captureException: (error: Error, options?: unknown) => void } }).Sentry) {
        (window as Window & { Sentry: { captureException: (error: Error, options?: unknown) => void } }).Sentry.captureException(error, {
          tags: {
            errorBoundary: true,
            errorId,
          },
          extra: {
            errorInfo,
            retryCount: this.state.retryCount,
          },
        });
      }

      // 发送到自定义错误端点
      this.sendErrorReport(error, errorInfo, errorId);
    } catch (reportError) {
      logger.error('Failed to report error', {
        error: reportError as Error,
        data: { originalError: error.message },
      });
    }
  }

  /**
   * 发送错误报告
   */
  private async sendErrorReport(
    error: Error,
    errorInfo: ErrorInfo,
    errorId?: string
  ): Promise<void> {
    try {
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
      };

      // 发送到错误报告端点
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    } catch (fetchError) {
      logger.error('Failed to send error report', {
        error: fetchError as Error,
      });
    }
  }

  /**
   * 渲染错误界面
   */
  private renderErrorFallback(): ReactNode {
    const { fallback, customErrorMessage, showErrorDetails = false } = this.props;
    const { error, errorInfo, errorId, retryCount } = this.state;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 使用自定义错误回退组件
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          {/* 错误图标 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* 错误标题 */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              出现了一些问题
            </h1>
            <p className="text-gray-600">
              {customErrorMessage || '抱歉，应用程序遇到了一个错误。'}
            </p>
          </div>

          {/* 错误ID */}
          {errorId && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600">
                错误ID: <code className="font-mono">{errorId}</code>
              </p>
            </div>
          )}

          {/* 开发模式错误详情 */}
          {isDevelopment && showErrorDetails && error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-2">错误详情</h3>
              <div className="text-xs text-red-700 font-mono">
                <p><strong>错误:</strong> {error.message}</p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">堆栈信息</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                  </details>
                )}
                {errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">组件堆栈</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={this.handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              重试 ({retryCount}/3)
            </button>
            
            <button
              onClick={this.handleReset}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              重置
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              刷新页面
            </button>
          </div>

          {/* 帮助信息 */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              如果问题持续存在，请联系技术支持
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 渲染组件
   */
  render(): ReactNode {
    const { children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return this.renderErrorFallback();
    }

    return children;
  }

  /**
   * 组件卸载时清理
   */
  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
}

/**
 * 高阶组件：错误边界包装器
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook: 错误边界状态
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    logger.error('Error captured by useErrorBoundary', {
      error,
      data: { hook: 'useErrorBoundary' },
    });
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

/**
 * 错误边界提供者组件
 */
export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Global error boundary caught error', {
          error,
          data: { errorInfo },
        });
      }}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * 错误报告组件
 */
export function ErrorReport({ errorId }: { errorId: string }) {
  const [isReported, setIsReported] = React.useState(false);
  const [isReporting, setIsReporting] = React.useState(false);

  const handleReport = async () => {
    setIsReporting(true);
    try {
      // 发送错误报告
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errorId }),
      });
      setIsReported(true);
    } catch (error) {
      logger.error('Failed to report error', {
        error: error as Error,
        data: { errorId },
      });
    } finally {
      setIsReporting(false);
    }
  };

  if (isReported) {
    return (
      <div className="text-green-600 text-sm">
        ✅ 错误报告已发送
      </div>
    );
  }

  return (
    <button
      onClick={handleReport}
      disabled={isReporting}
      className="text-blue-600 text-sm hover:underline disabled:opacity-50"
    >
      {isReporting ? '发送中...' : '发送错误报告'}
    </button>
  );
}
