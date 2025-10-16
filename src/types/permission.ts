/**
 * 权限类型定义
 */
export type Permission = 
  | 'requirement:view'
  | 'requirement:create'
  | 'requirement:edit'
  | 'requirement:delete'
  | 'requirement:comment'
  | 'requirement:review'
  | 'requirement:export'
  | 'requirement:batch-edit';

/**
 * 用户角色类型
 */
export type Role = 'admin' | 'product-manager' | 'developer' | 'viewer';

/**
 * 角色权限映射
 * 
 * 定义每个角色默认拥有的权限
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // 管理员：拥有所有权限
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
  
  // 产品经理：可以创建、编辑、评审需求
  'product-manager': [
    'requirement:view',
    'requirement:create',
    'requirement:edit',
    'requirement:comment',
    'requirement:review',
    'requirement:export',
  ],
  
  // 开发者：可以查看和评论
  developer: [
    'requirement:view',
    'requirement:comment',
  ],
  
  // 访客：仅查看
  viewer: [
    'requirement:view',
  ],
};

/**
 * 检查权限是否足够执行某个操作
 * 
 * @param userPermissions - 用户拥有的权限列表
 * @param requiredPermission - 需要的权限
 * @returns 是否有权限
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * 检查是否拥有任一权限
 * 
 * @param userPermissions - 用户拥有的权限列表
 * @param requiredPermissions - 需要的权限列表（满足任一即可）
 * @returns 是否有权限
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
}

/**
 * 检查是否拥有所有权限
 * 
 * @param userPermissions - 用户拥有的权限列表
 * @param requiredPermissions - 需要的权限列表（必须全部满足）
 * @returns 是否有权限
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
}




