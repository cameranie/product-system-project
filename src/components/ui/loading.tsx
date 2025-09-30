// 通用加载和进度组件
import React from 'react';
import { cn } from '@/lib/utils';

// 基础加载动画组件
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  );
}

// 页面级加载组件
export interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ message = '加载中...', className }: PageLoadingProps) {
  return (
    <div className={cn('flex items-center justify-center h-64', className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// 内联加载组件
export interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoading({ 
  message = '加载中...', 
  size = 'sm', 
  className 
}: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

// 按钮加载状态
export interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function ButtonLoading({ 
  loading, 
  children, 
  loadingText = '处理中...', 
  className 
}: ButtonLoadingProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      {loading && <LoadingSpinner size="sm" />}
      <span>{loading ? loadingText : children}</span>
    </span>
  );
}

// 文件上传进度条
export interface UploadProgressProps {
  progress: number;
  fileName?: string;
  className?: string;
}

export function UploadProgress({ progress, fileName, className }: UploadProgressProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {fileName && (
        <div className="flex items-center justify-between text-sm">
          <span className="truncate">{fileName}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// 骨架屏加载组件
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div 
      className={cn('animate-pulse bg-muted rounded', className)}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  );
}

// 表格骨架屏
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* 表头 */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// 列表骨架屏
export interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({ items = 3, showAvatar = false, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 延迟加载包装器
export interface DelayedLoadingProps {
  delay?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function DelayedLoading({ 
  delay = 200, 
  fallback = <LoadingSpinner />, 
  children 
}: DelayedLoadingProps) {
  const [showFallback, setShowFallback] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showFallback ? <>{fallback}</> : <>{children}</>;
} 