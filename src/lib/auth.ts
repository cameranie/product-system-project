/**
 * 认证和权限管理
 * 
 * P1 功能：提供统一的认证和权限检查
 * 
 * 功能特性：
 * - 用户认证状态管理
 * - 权限检查
 * - 角色管理
 * - 会话管理
 * 
 * @module auth
 */

import { logger } from './logger';

/**
 * 用户角色枚举
 */
export enum UserRole {
  /** 超级管理员 */
  SUPER_ADMIN = 'super_admin',
  /** 管理员 */
  ADMIN = 'admin',
  /** 产品经理 */
  PRODUCT_MANAGER = 'product_manager',
  /** 开发人员 */
  DEVELOPER = 'developer',
  /** 测试人员 */
  TESTER = 'tester',
  /** 普通用户 */
  USER = 'user',
  /** 访客 */
  GUEST = 'guest',
}

/**
 * 权限枚举
 */
export enum Permission {
  // 需求管理权限
  REQUIREMENTS_VIEW = 'requirements:view',
  REQUIREMENTS_CREATE = 'requirements:create',
  REQUIREMENTS_EDIT = 'requirements:edit',
  REQUIREMENTS_DELETE = 'requirements:delete',
  REQUIREMENTS_REVIEW = 'requirements:review',
  REQUIREMENTS_BATCH_OPERATE = 'requirements:batch_operate',

  // 预排期管理权限
  SCHEDULED_REQUIREMENTS_VIEW = 'scheduled_requirements:view',
  SCHEDULED_REQUIREMENTS_EDIT = 'scheduled_requirements:edit',
  SCHEDULED_REQUIREMENTS_REVIEW = 'scheduled_requirements:review',

  // 用户管理权限
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',

  // 系统管理权限
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_MONITORING = 'system:monitoring',

  // 管理员权限
  ADMIN_FULL_ACCESS = 'admin:full_access',
}

/**
 * 用户信息接口
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 显示名称 */
  displayName: string;
  /** 头像URL */
  avatar?: string;
  /** 角色 */
  role: UserRole;
  /** 权限列表 */
  permissions: Permission[];
  /** 是否激活 */
  isActive: boolean;
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 认证状态接口
 */
export interface AuthState {
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 当前用户 */
  user?: User;
  /** 访问令牌 */
  accessToken?: string;
  /** 刷新令牌 */
  refreshToken?: string;
  /** 令牌过期时间 */
  tokenExpiresAt?: number;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 缺少的权限 */
  missingPermissions: Permission[];
  /** 错误信息 */
  error?: string;
}

/**
 * 角色权限映射
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.ADMIN_FULL_ACCESS,
    Permission.REQUIREMENTS_VIEW,
    Permission.REQUIREMENTS_CREATE,
    Permission.REQUIREMENTS_EDIT,
    Permission.REQUIREMENTS_DELETE,
    Permission.REQUIREMENTS_REVIEW,
    Permission.REQUIREMENTS_BATCH_OPERATE,
    Permission.SCHEDULED_REQUIREMENTS_VIEW,
    Permission.SCHEDULED_REQUIREMENTS_EDIT,
    Permission.SCHEDULED_REQUIREMENTS_REVIEW,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_LOGS,
    Permission.SYSTEM_MONITORING,
  ],
  [UserRole.ADMIN]: [
    Permission.REQUIREMENTS_VIEW,
    Permission.REQUIREMENTS_CREATE,
    Permission.REQUIREMENTS_EDIT,
    Permission.REQUIREMENTS_DELETE,
    Permission.REQUIREMENTS_REVIEW,
    Permission.REQUIREMENTS_BATCH_OPERATE,
    Permission.SCHEDULED_REQUIREMENTS_VIEW,
    Permission.SCHEDULED_REQUIREMENTS_EDIT,
    Permission.SCHEDULED_REQUIREMENTS_REVIEW,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_LOGS,
  ],
  [UserRole.PRODUCT_MANAGER]: [
    Permission.REQUIREMENTS_VIEW,
    Permission.REQUIREMENTS_CREATE,
    Permission.REQUIREMENTS_EDIT,
    Permission.REQUIREMENTS_REVIEW,
    Permission.REQUIREMENTS_BATCH_OPERATE,
    Permission.SCHEDULED_REQUIREMENTS_VIEW,
    Permission.SCHEDULED_REQUIREMENTS_EDIT,
    Permission.SCHEDULED_REQUIREMENTS_REVIEW,
  ],
  [UserRole.DEVELOPER]: [
    Permission.REQUIREMENTS_VIEW,
    Permission.REQUIREMENTS_CREATE,
    Permission.REQUIREMENTS_EDIT,
    Permission.SCHEDULED_REQUIREMENTS_VIEW,
  ],
  [UserRole.TESTER]: [
    Permission.REQUIREMENTS_VIEW,
    Permission.REQUIREMENTS_EDIT,
    Permission.SCHEDULED_REQUIREMENTS_VIEW,
  ],
  [UserRole.USER]: [
    Permission.REQUIREMENTS_VIEW,
  ],
  [UserRole.GUEST]: [],
};

/**
 * 认证管理器类
 */
class AuthManager {
  private authState: AuthState = {
    isAuthenticated: false,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  /**
   * 初始化认证状态
   */
  public async initialize(): Promise<void> {
    try {
      // 从 localStorage 恢复认证状态
      const savedState = this.getStoredAuthState();
      if (savedState && this.isTokenValid(savedState.tokenExpiresAt)) {
        this.authState = savedState;
        logger.info('认证状态已恢复', {
          userId: savedState.user?.id,
          role: savedState.user?.role,
        });
      } else {
        // 清除过期的认证状态
        this.clearAuthState();
      }
    } catch (error) {
      logger.error('认证初始化失败', error as Error);
      this.clearAuthState();
    }
  }

  /**
   * 用户登录
   */
  public async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('用户登录尝试', { username: credentials.username });

      // 模拟登录 API 调用
      const response = await this.mockLoginAPI(credentials);
      
      if (response.success && response.user) {
        this.authState = {
          isAuthenticated: true,
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tokenExpiresAt: response.tokenExpiresAt,
        };

        // 保存到 localStorage
        this.saveAuthState();

        // 通知监听器
        this.notifyListeners();

        logger.info('用户登录成功', {
          userId: response.user.id,
          role: response.user.role,
        });

        return { success: true };
      } else {
        logger.warn('用户登录失败', { username: credentials.username });
        return { success: false, error: response.error || '登录失败' };
      }
    } catch (error) {
      logger.error('登录过程出错', error as Error);
      return { success: false, error: '登录过程出错' };
    }
  }

  /**
   * 用户登出
   */
  public async logout(): Promise<void> {
    try {
      const userId = this.authState.user?.id;
      
      // 清除认证状态
      this.clearAuthState();

      // 通知监听器
      this.notifyListeners();

      logger.info('用户登出', { userId });
    } catch (error) {
      logger.error('登出过程出错', error as Error);
    }
  }

  /**
   * 检查用户是否有指定权限
   */
  public hasPermission(permission: Permission): boolean {
    if (!this.authState.isAuthenticated || !this.authState.user) {
      return false;
    }

    // 超级管理员拥有所有权限
    if (this.authState.user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    return this.authState.user.permissions.includes(permission);
  }

  /**
   * 检查用户是否有多个权限（需要全部拥有）
   */
  public hasAllPermissions(permissions: Permission[]): PermissionCheckResult {
    const missingPermissions: Permission[] = [];

    for (const permission of permissions) {
      if (!this.hasPermission(permission)) {
        missingPermissions.push(permission);
      }
    }

    return {
      hasPermission: missingPermissions.length === 0,
      missingPermissions,
      error: missingPermissions.length > 0 
        ? `缺少权限: ${missingPermissions.join(', ')}` 
        : undefined,
    };
  }

  /**
   * 检查用户是否有多个权限（拥有任意一个即可）
   */
  public hasAnyPermission(permissions: Permission[]): PermissionCheckResult {
    for (const permission of permissions) {
      if (this.hasPermission(permission)) {
        return {
          hasPermission: true,
          missingPermissions: [],
        };
      }
    }

    return {
      hasPermission: false,
      missingPermissions: permissions,
      error: `缺少权限: ${permissions.join(' 或 ')}`,
    };
  }

  /**
   * 检查用户角色
   */
  public hasRole(role: UserRole): boolean {
    return this.authState.user?.role === role;
  }

  /**
   * 检查用户是否有指定角色之一
   */
  public hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.authState.user?.role || UserRole.GUEST);
  }

  /**
   * 获取当前认证状态
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * 获取当前用户
   */
  public getCurrentUser(): User | undefined {
    return this.authState.user;
  }

  /**
   * 添加认证状态监听器
   */
  public addAuthListener(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    
    // 返回取消监听的函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 刷新访问令牌
   */
  public async refreshToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      return false;
    }

    try {
      // 模拟刷新令牌 API
      const response = await this.mockRefreshTokenAPI(this.authState.refreshToken);
      
      if (response.success) {
        this.authState.accessToken = response.accessToken;
        this.authState.tokenExpiresAt = response.tokenExpiresAt;
        this.saveAuthState();
        return true;
      }
    } catch (error) {
      logger.error('令牌刷新失败', error as Error);
    }

    return false;
  }

  /**
   * 模拟登录 API
   */
  private async mockLoginAPI(credentials: {
    username: string;
    password: string;
  }): Promise<{
    success: boolean;
    user?: User;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: number;
    error?: string;
  }> {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟用户数据
    const mockUsers: Record<string, { password: string; user: User }> = {
      'admin': {
        password: 'admin123',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          displayName: '管理员',
          role: UserRole.ADMIN,
          permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      'pm': {
        password: 'pm123',
        user: {
          id: '2',
          username: 'pm',
          email: 'pm@example.com',
          displayName: '产品经理',
          role: UserRole.PRODUCT_MANAGER,
          permissions: ROLE_PERMISSIONS[UserRole.PRODUCT_MANAGER],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      'dev': {
        password: 'dev123',
        user: {
          id: '3',
          username: 'dev',
          email: 'dev@example.com',
          displayName: '开发人员',
          role: UserRole.DEVELOPER,
          permissions: ROLE_PERMISSIONS[UserRole.DEVELOPER],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };

    const userData = mockUsers[credentials.username];
    if (!userData || userData.password !== credentials.password) {
      return { success: false, error: '用户名或密码错误' };
    }

    if (!userData.user.isActive) {
      return { success: false, error: '账户已被禁用' };
    }

    return {
      success: true,
      user: userData.user,
      accessToken: `access_token_${Date.now()}`,
      refreshToken: `refresh_token_${Date.now()}`,
      tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时后过期
    };
  }

  /**
   * 模拟刷新令牌 API
   */
  private async mockRefreshTokenAPI(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    tokenExpiresAt?: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (refreshToken.startsWith('refresh_token_')) {
      return {
        success: true,
        accessToken: `access_token_${Date.now()}`,
        tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
    }

    return { success: false };
  }

  /**
   * 检查令牌是否有效
   */
  private isTokenValid(expiresAt?: number): boolean {
    if (!expiresAt) return false;
    return Date.now() < expiresAt;
  }

  /**
   * 获取存储的认证状态
   */
  private getStoredAuthState(): AuthState | null {
    try {
      const stored = localStorage.getItem('auth_state');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * 保存认证状态到 localStorage
   */
  private saveAuthState(): void {
    try {
      localStorage.setItem('auth_state', JSON.stringify(this.authState));
    } catch (error) {
      logger.error('保存认证状态失败', error as Error);
    }
  }

  /**
   * 清除认证状态
   */
  private clearAuthState(): void {
    this.authState = {
      isAuthenticated: false,
    };
    
    try {
      localStorage.removeItem('auth_state');
    } catch (error) {
      logger.error('清除认证状态失败', error as Error);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.authState);
      } catch (error) {
        logger.error('认证状态监听器出错', error as Error);
      }
    });
  }
}

/**
 * 全局认证管理器实例
 */
export const authManager = new AuthManager();

/**
 * 权限检查 Hook
 */
export function usePermission(permission: Permission): boolean {
  return authManager.hasPermission(permission);
}

/**
 * 角色检查 Hook
 */
export function useRole(role: UserRole): boolean {
  return authManager.hasRole(role);
}

/**
 * 认证状态 Hook
 */
export function useAuth(): AuthState {
  return authManager.getAuthState();
}

/**
 * 权限检查组件
 */
export interface PermissionGuardProps {
  permission: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = true,
  fallback = null,
  children,
}: PermissionGuardProps): React.ReactElement {
  const allPermissions = [permission, ...permissions];
  const hasPermission = requireAll 
    ? authManager.hasAllPermissions(allPermissions).hasPermission
    : authManager.hasAnyPermission(allPermissions).hasPermission;

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * 角色检查组件
 */
export interface RoleGuardProps {
  role: UserRole;
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  role,
  roles = [],
  requireAll = true,
  fallback = null,
  children,
}: RoleGuardProps): React.ReactElement {
  const allRoles = [role, ...roles];
  const hasRole = requireAll 
    ? allRoles.every(r => authManager.hasRole(r))
    : allRoles.some(r => authManager.hasRole(r));

  return hasRole ? <>{children}</> : <>{fallback}</>;
}


