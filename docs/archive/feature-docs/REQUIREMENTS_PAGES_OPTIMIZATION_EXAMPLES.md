# 需求页面优化示例代码

> 展示具体的代码改进方案和最佳实践

## 📌 目录

1. [错误边界实现](#1-错误边界实现)
2. [权限控制实现](#2-权限控制实现)
3. [数据冲突处理](#3-数据冲突处理)
4. [表单重构优化](#4-表单重构优化)
5. [性能优化](#5-性能优化)
6. [安全加固](#6-安全加固)

---

## 1. 错误边界实现

### 创建通用错误边界组件

```typescript
// src/components/error-boundary/ErrorBoundary.tsx
'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo);

    // 记录到错误监控服务
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
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

  componentDidUpdate(prevProps: Props) {
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

// 默认错误回退组件
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();
  
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
              onClick={() => router.push('/')}
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

// 便捷 Hook
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
```

### 在页面中使用

```typescript
// src/app/requirements/[id]/page.tsx
'use client';

import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

// 自定义错误回退组件
function RequirementErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();
  
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">需求加载失败</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {error.message || '加载需求时发生错误，请稍后重试'}
        </p>
        <div className="flex gap-2">
          <Button onClick={resetError}>
            重新加载
          </Button>
          <Button variant="outline" onClick={() => router.push('/requirements')}>
            返回需求列表
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default function RequirementDetailPage({ params }: Props) {
  return (
    <ErrorBoundary 
      fallback={RequirementErrorFallback}
      resetKeys={[params.id]}
      onError={(error, errorInfo) => {
        // 上报错误
        console.error('Requirement detail page error:', error);
      }}
    >
      {/* 原有内容 */}
    </ErrorBoundary>
  );
}
```

---

## 2. 权限控制实现

### 权限系统基础架构

```typescript
// src/types/permission.ts
export type Permission = 
  | 'requirement:view'
  | 'requirement:create'
  | 'requirement:edit'
  | 'requirement:delete'
  | 'requirement:comment'
  | 'requirement:review'
  | 'requirement:export'
  | 'requirement:batch-edit';

export type Role = 'admin' | 'product-manager' | 'developer' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: Role;
  permissions: Permission[];
  department?: string;
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'requirement:view',
    'requirement:create',
    'requirement:edit',
    'requirement:delete',
    'requirement:comment',
    'requirement:review',
    'requirement:export',
    'requirement:batch-edit',
  ],
  'product-manager': [
    'requirement:view',
    'requirement:create',
    'requirement:edit',
    'requirement:comment',
    'requirement:review',
    'requirement:export',
  ],
  developer: [
    'requirement:view',
    'requirement:comment',
  ],
  viewer: [
    'requirement:view',
  ],
};
```

```typescript
// src/hooks/usePermissions.ts
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Permission, User } from '@/types/permission';
import { ROLE_PERMISSIONS } from '@/types/permission';

export function usePermissions() {
  const { user } = useAuth();

  /**
   * 检查用户是否拥有指定权限
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    // 超级管理员拥有所有权限
    if (user.role === 'admin') return true;
    
    // 检查角色权限
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    if (rolePermissions.includes(permission)) return true;
    
    // 检查用户特殊权限
    return user.permissions?.includes(permission) ?? false;
  }, [user]);

  /**
   * 检查用户是否拥有任一权限
   */
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  }, [hasPermission]);

  /**
   * 检查用户是否拥有所有权限
   */
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  }, [hasPermission]);

  /**
   * 检查用户是否为需求创建者
   */
  const isRequirementCreator = useCallback((creatorId: string): boolean => {
    return user?.id === creatorId;
  }, [user]);

  /**
   * 检查用户是否可以编辑需求
   * 规则：
   * 1. 拥有 edit 权限
   * 2. 或者是需求创建者（创建后24小时内）
   */
  const canEditRequirement = useCallback((requirement: {
    creator: { id: string };
    createdAt: string;
  }): boolean => {
    // 检查基础权限
    if (hasPermission('requirement:edit')) return true;
    
    // 检查是否为创建者且在24小时内
    if (isRequirementCreator(requirement.creator.id)) {
      const createdTime = new Date(requirement.createdAt).getTime();
      const now = Date.now();
      const hoursPassed = (now - createdTime) / (1000 * 60 * 60);
      return hoursPassed < 24;
    }
    
    return false;
  }, [hasPermission, isRequirementCreator]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRequirementCreator,
    canEditRequirement,
    user,
  };
}
```

### 权限保护组件

```typescript
// src/components/PermissionGuard.tsx
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/types/permission';
import { PermissionDenied } from './PermissionDenied';

interface PermissionGuardProps {
  children: ReactNode;
  /** 需要的权限（满足任一即可） */
  permissions?: Permission[];
  /** 需要的所有权限 */
  requireAll?: Permission[];
  /** 自定义无权限时的回退组件 */
  fallback?: ReactNode;
  /** 无权限时的行为 */
  behavior?: 'hide' | 'disable' | 'show-fallback';
}

export function PermissionGuard({
  children,
  permissions = [],
  requireAll = [],
  fallback,
  behavior = 'show-fallback',
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  // 检查权限
  const hasRequiredPermissions = 
    (permissions.length > 0 && hasAnyPermission(permissions)) ||
    (requireAll.length > 0 && hasAllPermissions(requireAll)) ||
    (permissions.length === 0 && requireAll.length === 0);

  // 无权限时的处理
  if (!hasRequiredPermissions) {
    switch (behavior) {
      case 'hide':
        return null;
      case 'disable':
        return (
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
        );
      case 'show-fallback':
      default:
        return <>{fallback || <PermissionDenied />}</>;
    }
  }

  return <>{children}</>;
}

// 使用示例
<PermissionGuard permissions={['requirement:edit']}>
  <Button onClick={handleEdit}>编辑</Button>
</PermissionGuard>

<PermissionGuard 
  permissions={['requirement:delete']}
  behavior="hide"
>
  <Button variant="destructive" onClick={handleDelete}>删除</Button>
</PermissionGuard>
```

### 在页面中使用权限控制

```typescript
// src/app/requirements/[id]/edit/page.tsx
export default function RequirementEditPage({ params }: Props) {
  const { hasPermission, canEditRequirement } = usePermissions();
  const requirement = useRequirementsStore(state => 
    state.requirements.find(req => req.id === decodeURIComponent(params.id))
  );

  // 权限检查
  useEffect(() => {
    if (!requirement) return;
    
    if (!canEditRequirement(requirement)) {
      toast.error('您没有权限编辑此需求');
      router.push(`/requirements/${params.id}`);
    }
  }, [requirement, canEditRequirement, router, params.id]);

  // 加载检查
  if (!requirement) {
    return <PageLoader />;
  }

  // 权限拒绝
  if (!canEditRequirement(requirement)) {
    return <PermissionDenied />;
  }

  return (
    <ErrorBoundary>
      <AppLayout>
        {/* 编辑表单 */}
      </AppLayout>
    </ErrorBoundary>
  );
}
```

---

## 3. 数据冲突处理

### 乐观更新与回滚

```typescript
// src/hooks/requirements/useOptimisticUpdate.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Requirement } from '@/lib/requirements-store';

interface OptimisticUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export function useOptimisticUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * 乐观更新：立即更新UI，如果失败则回滚
   */
  const optimisticUpdate = useCallback(async <T extends Requirement>(
    current: T,
    updates: Partial<T>,
    updateFn: (id: string, updates: Partial<T>) => Promise<T>,
    options: OptimisticUpdateOptions = {}
  ) => {
    const { onSuccess, onError, showToast = true } = options;
    
    // 保存原始数据用于回滚
    const original = { ...current };
    
    // 乐观更新（立即应用到UI）
    const optimistic = { ...current, ...updates };
    
    setIsUpdating(true);

    try {
      // 执行实际更新
      const updated = await updateFn(current.id, updates);
      
      setIsUpdating(false);
      
      if (showToast) {
        toast.success('更新成功');
      }
      
      onSuccess?.();
      
      return updated;
    } catch (error) {
      // 更新失败，回滚到原始数据
      setIsUpdating(false);
      
      // 回滚UI（通过重新设置store）
      await updateFn(current.id, original);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '更新失败';
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      onError?.(error as Error);
      
      throw error;
    }
  }, []);

  return {
    optimisticUpdate,
    isUpdating,
  };
}

// 使用示例
function RequirementDetailPage() {
  const { optimisticUpdate, isUpdating } = useOptimisticUpdate();
  const updateRequirement = useRequirementsStore(state => state.updateRequirement);
  
  const handleStatusToggle = async () => {
    if (!requirement) return;
    
    const newStatus = requirement.isOpen ? '已关闭' : '待评审';
    const newIsOpen = !requirement.isOpen;
    
    await optimisticUpdate(
      requirement,
      { isOpen: newIsOpen, status: newStatus },
      updateRequirement,
      {
        showToast: true,
        onSuccess: () => {
          console.log('状态切换成功');
        },
        onError: (error) => {
          console.error('状态切换失败:', error);
        },
      }
    );
  };
}
```

### 版本冲突检测

```typescript
// src/hooks/requirements/useVersionConflict.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Requirement } from '@/lib/requirements-store';

export function useVersionConflict(requirement?: Requirement) {
  const [serverVersion, setServerVersion] = useState(requirement?.updatedAt);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // 监听服务端数据变化
  useEffect(() => {
    if (!requirement) return;
    
    const currentServerVersion = requirement.updatedAt;
    
    // 检测版本冲突
    if (serverVersion && serverVersion !== currentServerVersion) {
      if (hasLocalChanges) {
        // 有本地修改，显示冲突提示
        setShowConflictDialog(true);
        toast.warning('需求已被他人更新', {
          description: '您的修改可能会覆盖他人的更新',
          duration: 10000,
        });
      } else {
        // 无本地修改，自动同步
        setServerVersion(currentServerVersion);
      }
    }
  }, [requirement?.updatedAt, serverVersion, hasLocalChanges]);

  /**
   * 标记有本地修改
   */
  const markAsChanged = useCallback(() => {
    setHasLocalChanges(true);
  }, []);

  /**
   * 重置本地修改状态
   */
  const resetChanges = useCallback(() => {
    setHasLocalChanges(false);
    setServerVersion(requirement?.updatedAt);
    setShowConflictDialog(false);
  }, [requirement?.updatedAt]);

  /**
   * 强制保存（忽略冲突）
   */
  const forceSave = useCallback(() => {
    setShowConflictDialog(false);
    setServerVersion(requirement?.updatedAt);
    // 返回 true 表示允许保存
    return true;
  }, [requirement?.updatedAt]);

  /**
   * 刷新数据（放弃本地修改）
   */
  const refreshData = useCallback(() => {
    resetChanges();
    window.location.reload();
  }, [resetChanges]);

  return {
    hasConflict: showConflictDialog,
    hasLocalChanges,
    serverVersion,
    markAsChanged,
    resetChanges,
    forceSave,
    refreshData,
  };
}

// 冲突提示对话框组件
function ConflictDialog({ 
  open, 
  onForceSave, 
  onRefresh, 
  onCancel 
}: {
  open: boolean;
  onForceSave: () => void;
  onRefresh: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            检测到数据冲突
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>此需求已被他人更新，您可以：</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>刷新页面查看最新数据（将丢失您的修改）</li>
              <li>强制保存您的修改（将覆盖他人的更新）</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            取消
          </AlertDialogCancel>
          <Button variant="outline" onClick={onRefresh}>
            刷新数据
          </Button>
          <AlertDialogAction onClick={onForceSave}>
            强制保存
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 在编辑页使用
export default function RequirementEditPage({ params }: Props) {
  const { 
    hasConflict, 
    hasLocalChanges,
    markAsChanged,
    forceSave,
    refreshData 
  } = useVersionConflict(requirement);

  const handleInputChange = (field: string, value: any) => {
    formState.handleInputChange(field, value);
    markAsChanged(); // 标记有本地修改
  };

  return (
    <>
      {/* 表单内容 */}
      
      {/* 冲突提示 */}
      <ConflictDialog
        open={hasConflict}
        onForceSave={async () => {
          if (forceSave()) {
            await handleSave();
          }
        }}
        onRefresh={refreshData}
        onCancel={() => setShowConflictDialog(false)}
      />
    </>
  );
}
```

---

## 4. 表单重构优化

### 提取可复用的表单组件

```typescript
// src/components/requirements/RequirementForm.tsx
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { REQUIREMENT_TYPES, PLATFORM_OPTIONS } from '@/config/requirements';
import type { RequirementFormData } from '@/hooks/requirements/useRequirementForm';
import type { Attachment } from '@/lib/requirements-store';

interface RequirementFormProps {
  formData: RequirementFormData;
  attachments: Attachment[];
  errors?: Record<string, string>;
  readOnly?: boolean;
  onInputChange: (field: keyof RequirementFormData, value: any) => void;
  onTypeChange: (type: string, checked: boolean) => void;
  onPlatformChange: (platform: string, checked: boolean) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

export const RequirementForm = memo(function RequirementForm({
  formData,
  attachments,
  errors = {},
  readOnly = false,
  onInputChange,
  onTypeChange,
  onPlatformChange,
  onAttachmentsChange,
}: RequirementFormProps) {
  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 标题 */}
          <FormField
            label="需求标题"
            required
            error={errors.title}
          >
            <Input
              id="title"
              placeholder="请输入需求标题"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              disabled={readOnly}
              className={errors.title ? 'border-destructive' : ''}
            />
          </FormField>

          {/* 需求类型 */}
          <FormField label="需求类型">
            <div className="flex flex-wrap gap-4">
              {REQUIREMENT_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={formData.type === type}
                    onCheckedChange={(checked) => onTypeChange(type, !!checked)}
                    disabled={readOnly}
                  />
                  <Label 
                    htmlFor={`type-${type}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </FormField>

          {/* 应用端 */}
          <FormField label="应用端">
            <div className="flex flex-wrap gap-4">
              {PLATFORM_OPTIONS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={formData.platforms.includes(platform)}
                    onCheckedChange={(checked) => onPlatformChange(platform, !!checked)}
                    disabled={readOnly}
                  />
                  <Label 
                    htmlFor={`platform-${platform}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* 需求描述 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            需求描述 <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            placeholder="请详细描述需求内容、目标和预期效果..."
            value={formData.description}
            onChange={(value) => onInputChange('description', value)}
            readOnly={readOnly}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
            showAttachments={true}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-2">
              {errors.description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

// 表单字段包装组件
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label} 
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
```

### 在新建页和编辑页中复用

```typescript
// src/app/requirements/new/page.tsx
export default function CreateRequirementPage() {
  const { 
    formData, 
    attachments, 
    errors,
    handleInputChange,
    handleTypeChange,
    handlePlatformChange,
    setAttachments,
    validate 
  } = useRequirementForm();

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="新建需求"
          actions={
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              提交需求
            </Button>
          }
        />

        <CollapsibleSidebar
          sidebarTitle="需求附加信息"
          sidebar={<SidebarContent formData={formData} />}
        >
          <RequirementForm
            formData={formData}
            attachments={attachments}
            errors={errors}
            onInputChange={handleInputChange}
            onTypeChange={handleTypeChange}
            onPlatformChange={handlePlatformChange}
            onAttachmentsChange={setAttachments}
          />
        </CollapsibleSidebar>
      </div>
    </AppLayout>
  );
}
```

---

## 5. 性能优化

### 防抖优化

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState, useRef } from 'react';

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return ((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;
}

// 使用示例
function RequirementEditPage() {
  const [formData, setFormData] = useState(initialData);
  
  // 防抖保存
  const debouncedSave = useDebouncedCallback(async () => {
    await handleSave();
  }, 1000);

  // 自动保存
  useEffect(() => {
    if (hasChanges) {
      debouncedSave();
    }
  }, [formData, debouncedSave]);
}
```

### 虚拟列表优化

```typescript
// src/components/requirements/VirtualCommentList.tsx
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Comment } from '@/lib/requirements-store';

interface VirtualCommentListProps {
  comments: Comment[];
  renderComment: (comment: Comment) => React.ReactNode;
}

export function VirtualCommentList({ 
  comments, 
  renderComment 
}: VirtualCommentListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // 预估评论高度
    overscan: 5, // 预渲染5个
  });

  return (
    <div 
      ref={parentRef} 
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const comment = comments[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderComment(comment)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### React.memo 优化

```typescript
// 优化前
export function CommentItem({ comment }: { comment: Comment }) {
  return <div>{/* ... */}</div>;
}

// 优化后
export const CommentItem = memo(
  function CommentItem({ comment }: { comment: Comment }) {
    return <div>{/* ... */}</div>;
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    return (
      prevProps.comment.id === nextProps.comment.id &&
      prevProps.comment.content === nextProps.comment.content &&
      prevProps.comment.updatedAt === nextProps.comment.updatedAt
    );
  }
);
```

---

## 6. 安全加固

### CSRF 防护

```typescript
// src/lib/csrf.ts
/**
 * 获取 CSRF Token
 */
export function getCsrfToken(): string {
  // 从 cookie 或 meta 标签获取
  const token = document.querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
    
  if (!token) {
    throw new Error('CSRF token not found');
  }
  
  return token;
}

/**
 * 带 CSRF 保护的 fetch
 */
export async function secureFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCsrfToken();
  
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', csrfToken);
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // 发送 cookies
  });
}

// 使用
await secureFetch('/api/requirements/123', {
  method: 'PATCH',
  body: JSON.stringify(updates),
});
```

### XSS 防护增强

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * 清理 HTML 内容，防止 XSS
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 
      'blockquote', 'code', 'pre',
      'a', 'img',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * 清理用户输入，防止 SQL 注入和 XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// 使用
<RichTextEditor
  value={sanitizeHTML(requirement.description)}
  onChange={(value) => {
    // 保存前再次清理
    handleInputChange('description', sanitizeHTML(value));
  }}
/>
```

### 敏感数据脱敏

```typescript
// src/lib/privacy.ts
/**
 * 邮箱脱敏
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  
  const visibleChars = Math.min(2, name.length);
  const masked = name.slice(0, visibleChars) + '***';
  return `${masked}@${domain}`;
}

/**
 * 手机号脱敏
 */
export function maskPhone(phone: string): string {
  if (phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 用户信息脱敏
 */
export function maskUserInfo(user: User): User {
  return {
    ...user,
    email: maskEmail(user.email),
    phone: user.phone ? maskPhone(user.phone) : undefined,
  };
}

// 使用
function UserDisplay({ user }: { user: User }) {
  const maskedUser = maskUserInfo(user);
  
  return (
    <div>
      <p>{maskedUser.name}</p>
      <p>{maskedUser.email}</p>
    </div>
  );
}
```

---

*以上示例代码展示了各种优化方案的具体实现，可根据实际需求选择性采用。*




