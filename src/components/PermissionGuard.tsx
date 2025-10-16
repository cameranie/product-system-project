import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/types/permission';

interface PermissionGuardProps {
  children: ReactNode;
  /** 需要的权限（满足任一即可） */
  permissions?: Permission[];
  /** 需要的所有权限（必须全部满足） */
  requireAll?: Permission[];
  /** 自定义无权限时的回退组件 */
  fallback?: ReactNode;
  /** 无权限时的行为 */
  behavior?: 'hide' | 'disable' | 'show-fallback';
}

/**
 * 权限保护组件
 * 
 * 根据用户权限控制子组件的显示/禁用状态
 * 
 * @example
 * ```tsx
 * // 隐藏无权限的按钮
 * <PermissionGuard permissions={['requirement:edit']} behavior="hide">
 *   <Button>编辑</Button>
 * </PermissionGuard>
 * 
 * // 禁用无权限的按钮
 * <PermissionGuard permissions={['requirement:delete']} behavior="disable">
 *   <Button>删除</Button>
 * </PermissionGuard>
 * 
 * // 显示自定义回退组件
 * <PermissionGuard 
 *   permissions={['requirement:edit']}
 *   fallback={<div>您没有编辑权限</div>}
 * >
 *   <EditForm />
 * </PermissionGuard>
 * ```
 */
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
          <div className="opacity-50 pointer-events-none cursor-not-allowed">
            {children}
          </div>
        );
      
      case 'show-fallback':
      default:
        return <>{fallback || null}</>;
    }
  }

  return <>{children}</>;
}




