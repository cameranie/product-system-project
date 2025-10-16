/**
 * 权限管理系统
 * 
 * P3 增强功能：添加权限校验框架
 * 
 * 提供统一的权限定义、检查和管理功能
 * 
 * @module permissions
 */

/**
 * 权限动作枚举
 */
export enum PermissionAction {
  // 需求管理权限
  VIEW_REQUIREMENT = 'requirement.view',
  CREATE_REQUIREMENT = 'requirement.create',
  EDIT_REQUIREMENT = 'requirement.edit',
  DELETE_REQUIREMENT = 'requirement.delete',
  
  // 评审权限
  REVIEW_LEVEL1 = 'review.level1',
  REVIEW_LEVEL2 = 'review.level2',
  VIEW_REVIEW = 'review.view',
  
  // 批量操作权限
  BATCH_UPDATE = 'batch.update',
  BATCH_DELETE = 'batch.delete',
  
  // 预排期权限
  SCHEDULED_VIEW = 'scheduled.view',
  SCHEDULED_ASSIGN_VERSION = 'scheduled.assign_version',
  SCHEDULED_SET_OPERATIONAL = 'scheduled.set_operational',
  
  // 字段编辑权限
  EDIT_PRIORITY = 'field.edit_priority',
  EDIT_STATUS = 'field.edit_status',
  EDIT_OWNER = 'field.edit_owner',
  
  // 管理员权限
  ADMIN_SETTINGS = 'admin.settings',
  ADMIN_PERMISSIONS = 'admin.permissions',
  ADMIN_FIELDS = 'admin.fields',
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin', // 管理员
  PRODUCT_MANAGER = 'product_manager', // 产品经理
  DEVELOPER = 'developer', // 开发人员
  DESIGNER = 'designer', // 设计师
  REVIEWER_LEVEL1 = 'reviewer_level1', // 一级评审人
  REVIEWER_LEVEL2 = 'reviewer_level2', // 二级评审人
  VIEWER = 'viewer', // 只读用户
}

/**
 * 权限配置类型
 */
type PermissionConfig = {
  [key in UserRole]: PermissionAction[];
};

/**
 * 角色权限配置
 * 
 * 定义每个角色拥有的权限列表
 */
const ROLE_PERMISSIONS: PermissionConfig = {
  // 管理员拥有所有权限
  [UserRole.ADMIN]: Object.values(PermissionAction),

  // 产品经理权限
  [UserRole.PRODUCT_MANAGER]: [
    PermissionAction.VIEW_REQUIREMENT,
    PermissionAction.CREATE_REQUIREMENT,
    PermissionAction.EDIT_REQUIREMENT,
    PermissionAction.REVIEW_LEVEL1,
    PermissionAction.REVIEW_LEVEL2,
    PermissionAction.VIEW_REVIEW,
    PermissionAction.BATCH_UPDATE,
    PermissionAction.SCHEDULED_VIEW,
    PermissionAction.SCHEDULED_ASSIGN_VERSION,
    PermissionAction.SCHEDULED_SET_OPERATIONAL,
    PermissionAction.EDIT_PRIORITY,
    PermissionAction.EDIT_STATUS,
    PermissionAction.EDIT_OWNER,
  ],

  // 开发人员权限
  [UserRole.DEVELOPER]: [
    PermissionAction.VIEW_REQUIREMENT,
    PermissionAction.CREATE_REQUIREMENT,
    PermissionAction.VIEW_REVIEW,
    PermissionAction.SCHEDULED_VIEW,
  ],

  // 设计师权限
  [UserRole.DESIGNER]: [
    PermissionAction.VIEW_REQUIREMENT,
    PermissionAction.CREATE_REQUIREMENT,
    PermissionAction.VIEW_REVIEW,
    PermissionAction.SCHEDULED_VIEW,
  ],

  // 一级评审人权限
  [UserRole.REVIEWER_LEVEL1]: [
    PermissionAction.VIEW_REQUIREMENT,
    PermissionAction.REVIEW_LEVEL1,
    PermissionAction.VIEW_REVIEW,
    PermissionAction.SCHEDULED_VIEW,
  ],

  // 二级评审人权限
  [UserRole.REVIEWER_LEVEL2]: [
    PermissionAction.VIEW_REQUIREMENT,
    PermissionAction.REVIEW_LEVEL2,
    PermissionAction.VIEW_REVIEW,
    PermissionAction.SCHEDULED_VIEW,
  ],

  // 只读用户权限
  [UserRole.VIEWER]: [
    PermissionAction.VIEW_REQUIREMENT,
    PermissionAction.VIEW_REVIEW,
    PermissionAction.SCHEDULED_VIEW,
  ],
};

/**
 * 用户权限接口
 */
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  roles: UserRole[];
  customPermissions?: PermissionAction[]; // 自定义权限（覆盖角色权限）
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * 权限管理类
 */
export class PermissionManager {
  private user: User | null = null;

  /**
   * 设置当前用户
   */
  setUser(user: User | null): void {
    this.user = user;
  }

  /**
   * 获取当前用户
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * 获取用户的所有权限
   */
  getUserPermissions(user: User = this.user!): PermissionAction[] {
    if (!user) {
      return [];
    }

    // 如果有自定义权限，使用自定义权限
    if (user.customPermissions && user.customPermissions.length > 0) {
      return user.customPermissions;
    }

    // 合并所有角色的权限
    const permissions = new Set<PermissionAction>();
    user.roles.forEach((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach((permission) => permissions.add(permission));
    });

    return Array.from(permissions);
  }

  /**
   * 检查用户是否拥有指定权限
   */
  hasPermission(permission: PermissionAction, user: User = this.user!): boolean {
    if (!user) {
      return false;
    }

    // 管理员拥有所有权限
    if (user.roles.includes(UserRole.ADMIN)) {
      return true;
    }

    const userPermissions = this.getUserPermissions(user);
    return userPermissions.includes(permission);
  }

  /**
   * 检查用户是否拥有所有指定权限
   */
  hasAllPermissions(
    permissions: PermissionAction[],
    user: User = this.user!
  ): boolean {
    return permissions.every((permission) => this.hasPermission(permission, user));
  }

  /**
   * 检查用户是否拥有任一指定权限
   */
  hasAnyPermission(
    permissions: PermissionAction[],
    user: User = this.user!
  ): boolean {
    return permissions.some((permission) => this.hasPermission(permission, user));
  }

  /**
   * 检查用户是否拥有指定角色
   */
  hasRole(role: UserRole, user: User = this.user!): boolean {
    if (!user) {
      return false;
    }
    return user.roles.includes(role);
  }

  /**
   * 检查用户是否为管理员
   */
  isAdmin(user: User = this.user!): boolean {
    return this.hasRole(UserRole.ADMIN, user);
  }

  /**
   * 带原因的权限检查
   */
  checkPermission(
    permission: PermissionAction,
    user: User = this.user!
  ): PermissionCheckResult {
    if (!user) {
      return {
        allowed: false,
        reason: '用户未登录',
      };
    }

    if (this.hasPermission(permission, user)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: '您没有权限执行此操作',
    };
  }

  /**
   * 断言用户拥有指定权限，否则抛出错误
   */
  assertPermission(
    permission: PermissionAction,
    user: User = this.user!
  ): void {
    const result = this.checkPermission(permission, user);
    if (!result.allowed) {
      throw new PermissionError(result.reason || '权限不足');
    }
  }
}

/**
 * 权限错误类
 */
export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * 全局权限管理器实例
 */
export const permissionManager = new PermissionManager();

/**
 * 便捷函数：检查权限
 */
export function hasPermission(permission: PermissionAction, user?: User): boolean {
  return permissionManager.hasPermission(permission, user);
}

/**
 * 便捷函数：检查所有权限
 */
export function hasAllPermissions(
  permissions: PermissionAction[],
  user?: User
): boolean {
  return permissionManager.hasAllPermissions(permissions, user);
}

/**
 * 便捷函数：检查任一权限
 */
export function hasAnyPermission(
  permissions: PermissionAction[],
  user?: User
): boolean {
  return permissionManager.hasAnyPermission(permissions, user);
}

/**
 * 便捷函数：检查角色
 */
export function hasRole(role: UserRole, user?: User): boolean {
  return permissionManager.hasRole(role, user);
}

/**
 * 便捷函数：检查是否为管理员
 */
export function isAdmin(user?: User): boolean {
  return permissionManager.isAdmin(user);
}

/**
 * 便捷函数：断言权限
 */
export function assertPermission(permission: PermissionAction, user?: User): void {
  permissionManager.assertPermission(permission, user);
}

/**
 * 获取权限的描述文本
 */
export function getPermissionLabel(permission: PermissionAction): string {
  const labels: Record<PermissionAction, string> = {
    [PermissionAction.VIEW_REQUIREMENT]: '查看需求',
    [PermissionAction.CREATE_REQUIREMENT]: '创建需求',
    [PermissionAction.EDIT_REQUIREMENT]: '编辑需求',
    [PermissionAction.DELETE_REQUIREMENT]: '删除需求',
    [PermissionAction.REVIEW_LEVEL1]: '一级评审',
    [PermissionAction.REVIEW_LEVEL2]: '二级评审',
    [PermissionAction.VIEW_REVIEW]: '查看评审',
    [PermissionAction.BATCH_UPDATE]: '批量更新',
    [PermissionAction.BATCH_DELETE]: '批量删除',
    [PermissionAction.SCHEDULED_VIEW]: '查看预排期',
    [PermissionAction.SCHEDULED_ASSIGN_VERSION]: '分配版本',
    [PermissionAction.SCHEDULED_SET_OPERATIONAL]: '设置运营状态',
    [PermissionAction.EDIT_PRIORITY]: '编辑优先级',
    [PermissionAction.EDIT_STATUS]: '编辑状态',
    [PermissionAction.EDIT_OWNER]: '编辑负责人',
    [PermissionAction.ADMIN_SETTINGS]: '系统设置',
    [PermissionAction.ADMIN_PERMISSIONS]: '权限管理',
    [PermissionAction.ADMIN_FIELDS]: '字段管理',
  };

  return labels[permission] || permission;
}

/**
 * 获取角色的描述文本
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: '管理员',
    [UserRole.PRODUCT_MANAGER]: '产品经理',
    [UserRole.DEVELOPER]: '开发人员',
    [UserRole.DESIGNER]: '设计师',
    [UserRole.REVIEWER_LEVEL1]: '一级评审人',
    [UserRole.REVIEWER_LEVEL2]: '二级评审人',
    [UserRole.VIEWER]: '只读用户',
  };

  return labels[role] || role;
}

