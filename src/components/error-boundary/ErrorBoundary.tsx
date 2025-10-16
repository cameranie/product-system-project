'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 错误回退组件的Props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** 自定义错误回退组件 */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** 错误发生时的回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** 重置键，当这些值变化时重置错误状态 */
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 错误边界组件
 * 
 * 捕获子组件树中的JavaScript错误，记录错误并显示回退UI
 * 
 * @example
 * ```tsx
 * <ErrorBoundary 
 *   fallback={CustomErrorFallback}
 *   resetKeys={[params.id]}
 *   onError={(error) => console.error(error)}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo);

    // 记录到错误监控服务（如果有配置Sentry）
    if (typeof window !== 'undefined' && (window as Window & { Sentry?: { captureException: (error: Error, options?: unknown) => void } }).Sentry) {
      (window as Window & { Sentry: { captureException: (error: Error, options?: unknown) => void } }).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    // 开发环境打印详细信息
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // 当 resetKeys 变化时，重置错误状态
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.setState({ hasError: false, error: undefined });
      }
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 默认错误回退组件
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>页面加载出错</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">错误信息：</p>
            <p className="p-3 bg-muted rounded-md font-mono text-xs break-all">
              {error.message}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={resetError}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 便捷Hook：用于在函数组件中抛出错误到最近的错误边界
 * 
 * @example
 * ```tsx
 * const throwError = useErrorHandler();
 * 
 * try {
 *   // 某些操作
 * } catch (error) {
 *   throwError(error);
 * }
 * ```
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}




