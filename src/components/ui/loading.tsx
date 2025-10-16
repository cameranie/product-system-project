/**
 * 统一加载组件
 * 
 * P2 功能：提供统一的加载状态显示
 * 
 * 功能特性：
 * - 多种加载样式
 * - 加载状态管理
 * - 骨架屏效果
 * - 加载进度显示
 * - 自定义加载文案
 * 
 * @module Loading
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 加载类型枚举
 */
export enum LoadingType {
  /** 旋转加载 */
  SPINNER = 'spinner',
  /** 脉冲加载 */
  PULSE = 'pulse',
  /** 波浪加载 */
  WAVE = 'wave',
  /** 点状加载 */
  DOTS = 'dots',
  /** 骨架屏 */
  SKELETON = 'skeleton',
  /** 进度条 */
  PROGRESS = 'progress',
}

/**
 * 加载尺寸枚举
 */
export enum LoadingSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * 加载组件属性
 */
export interface LoadingProps {
  /** 加载类型 */
  type?: LoadingType;
  /** 加载尺寸 */
  size?: LoadingSize;
  /** 是否显示 */
  visible?: boolean;
  /** 加载文案 */
  text?: string;
  /** 进度值 (0-100) */
  progress?: number;
  /** 自定义样式 */
  className?: string;
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 加载颜色 */
  color?: string;
  /** 是否显示遮罩 */
  overlay?: boolean;
}

/**
 * 基础加载组件
 */
export function Loading({
  type = LoadingType.SPINNER,
  size = LoadingSize.MEDIUM,
  visible = true,
  text,
  progress,
  className,
  fullscreen = false,
  backgroundColor = 'rgba(255, 255, 255, 0.8)',
  color = '#3b82f6',
  overlay = false,
}: LoadingProps) {
  if (!visible) return null;

  const sizeClasses = {
    [LoadingSize.SMALL]: 'w-4 h-4',
    [LoadingSize.MEDIUM]: 'w-8 h-8',
    [LoadingSize.LARGE]: 'w-12 h-12',
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullscreen && 'fixed inset-0 z-50',
      overlay && 'bg-white/80 backdrop-blur-sm',
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        {/* 加载动画 */}
        <div className={cn('flex items-center justify-center', sizeClasses[size])}>
          {renderLoadingAnimation(type, color, progress)}
        </div>
        
        {/* 加载文案 */}
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">
            {text}
          </p>
        )}
        
        {/* 进度显示 */}
        {progress !== undefined && (
          <div className="w-32">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>加载中</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        {content}
      </div>
    );
  }

  return content;
}

/**
 * 渲染加载动画
 */
function renderLoadingAnimation(
  type: LoadingType,
  color: string,
  progress?: number
): React.ReactNode {
  const spinnerStyle = {
    borderColor: `${color} transparent transparent transparent`,
  };

  switch (type) {
    case LoadingType.SPINNER:
      return (
        <div
          className="animate-spin rounded-full border-2 border-solid"
          style={spinnerStyle}
        />
      );

    case LoadingType.PULSE:
      return (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                width: '8px',
                height: '8px',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      );

    case LoadingType.WAVE:
      return (
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-full animate-bounce"
              style={{
                backgroundColor: color,
                width: '4px',
                height: '20px',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      );

    case LoadingType.DOTS:
      return (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full animate-ping"
              style={{
                backgroundColor: color,
                width: '6px',
                height: '6px',
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      );

    case LoadingType.SKELETON:
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      );

    case LoadingType.PROGRESS:
      return (
        <div className="w-16 h-16 relative">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="animate-spin"
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${(progress || 0) * 0.94}, 94`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      );

    default:
      return null;
  }
}

/**
 * 页面加载组件
 */
export function PageLoading({
  text = '页面加载中...',
  progress,
}: {
  text?: string;
  progress?: number;
}) {
  return (
    <Loading
      type={LoadingType.SPINNER}
      size={LoadingSize.LARGE}
      text={text}
      progress={progress}
      fullscreen
      overlay
    />
  );
}

/**
 * 按钮加载组件
 */
export function ButtonLoading({
  size = LoadingSize.SMALL,
  color = 'currentColor',
}: {
  size?: LoadingSize;
  color?: string;
}) {
  return (
    <Loading
      type={LoadingType.SPINNER}
      size={size}
      color={color}
      className="inline-flex"
    />
  );
}

/**
 * 内联加载组件
 */
export function InlineLoading({
  text,
  size = LoadingSize.SMALL,
}: {
  text?: string;
  size?: LoadingSize;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Loading type={LoadingType.DOTS} size={size} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

/**
 * 骨架屏组件
 */
export function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * 表格骨架屏
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

/**
 * 加载状态 Hook
 */
export function useLoading(initialState = false) {
  const [loading, setLoading] = React.useState(initialState);
  const [progress, setProgress] = React.useState(0);

  const startLoading = React.useCallback((text?: string) => {
    setLoading(true);
    setProgress(0);
  }, []);

  const stopLoading = React.useCallback(() => {
    setLoading(false);
    setProgress(100);
  }, []);

  const updateProgress = React.useCallback((value: number) => {
    setProgress(Math.max(0, Math.min(100, value)));
  }, []);

  return {
    loading,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
}

/**
 * 异步加载组件
 */
export function AsyncLoading<T>({
  promise,
  children,
  fallback,
  errorFallback,
}: {
  promise: Promise<T>;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: (error: Error) => React.ReactNode;
}) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    promise
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [promise]);

  if (loading) {
    return fallback || <Loading text="加载中..." />;
  }

  if (error) {
    return errorFallback ? errorFallback(error) : <div>加载失败</div>;
  }

  if (data) {
    return <>{children(data)}</>;
  }

  return null;
}

/**
 * 延迟加载组件
 */
export function LazyLoading({
  delay = 200,
  children,
  fallback,
}: {
  delay?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) {
    return fallback || <Loading text="准备中..." />;
  }

  return <>{children}</>;
}