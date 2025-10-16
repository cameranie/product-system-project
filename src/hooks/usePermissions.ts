import { useCallback, useMemo } from 'react';
import type { Permission, Role } from '@/types/permission';
import { ROLE_PERMISSIONS } from '@/types/permission';
import { mockUsers } from '@/lib/requirements-store';

/**
 * 权限管理 Hook
 * 
 * 提供权限检查功能，支持：
 * - 单个权限检查
 * - 多个权限检查（任一/全部）
 * - 基于角色的权限
 * - 需求创建者检查
 * 
 * @example
 * ```tsx
 * const { hasPermission, canEditRequirement } = usePermissions();
 * 
 * if (hasPermission('requirement:edit')) {
 *   // 显示编辑按钮
 * }
 * 
 * if (canEditRequirement(requirement)) {
 *   // 允许编辑
 * }
 * ```
 */
export function usePermissions() {
  // TODO: 从认证上下文获取真实用户
  // const { user } = useAuth();
  // 临时使用模拟用户
  const user = useMemo(() => ({
    ...mockUsers[0],
    role: 'admin' as Role,
    permissions: ROLE_PERMISSIONS.admin,
  }), []);

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
   * 
   * 规则：
   * 1. 拥有 requirement:edit 权限
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

  /**
   * 检查用户是否可以删除需求
   * 
   * 规则：
   * 1. 拥有 requirement:delete 权限
   * 2. 且需求状态为待评审或已关闭
   */
  const canDeleteRequirement = useCallback((requirement: {
    status: string;
  }): boolean => {
    if (!hasPermission('requirement:delete')) return false;
    
    // 只能删除待评审或已关闭的需求
    return ['待评审', '已关闭'].includes(requirement.status);
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRequirementCreator,
    canEditRequirement,
    canDeleteRequirement,
    user,
  };
}




