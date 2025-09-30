/**
 * CSRF (Cross-Site Request Forgery) 防护
 * 
 * 防止跨站请求伪造攻击，确保请求来自合法用户
 * 
 * 工作原理：
 * 1. 页面加载时从服务器获取CSRF Token
 * 2. 每次API请求都携带Token
 * 3. 服务器验证Token有效性
 * 
 * @example
 * ```typescript
 * // 获取Token
 * const token = await CSRFProtection.getToken();
 * 
 * // 在请求头中使用
 * fetch('/api/data', {
 *   headers: {
 *     'X-CSRF-Token': token
 *   }
 * });
 * 
 * // 清除Token（登出时）
 * CSRFProtection.clearToken();
 * ```
 */
export class CSRFProtection {
  /**
   * Token缓存
   * 避免每次请求都获取新Token
   */
  private static token: string | null = null;

  /**
   * 获取中的Promise
   * 防止并发获取Token
   */
  private static fetchPromise: Promise<string> | null = null;

  /**
   * Token有效期（毫秒）
   * 默认30分钟
   */
  private static readonly TOKEN_VALIDITY = 30 * 60 * 1000;

  /**
   * Token过期时间
   */
  private static expiresAt: number | null = null;

  /**
   * 获取CSRF Token
   * 
   * 首次调用时从服务器获取，后续使用缓存
   * 自动处理Token过期和刷新
   * 
   * @returns CSRF Token字符串
   * 
   * @example
   * ```typescript
   * const token = await CSRFProtection.getToken();
   * console.log(token); // "abc123xyz..."
   * ```
   */
  static async getToken(): Promise<string> {
    // 检查是否有有效的缓存Token
    if (this.token && this.expiresAt && Date.now() < this.expiresAt) {
      return this.token;
    }

    // 如果正在获取Token，等待完成
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // 从服务器获取新Token
    this.fetchPromise = this.fetchTokenFromServer();
    
    try {
      const token = await this.fetchPromise;
      return token;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * 从服务器获取CSRF Token
   * 
   * @returns CSRF Token字符串
   * @throws 如果获取失败
   */
  private static async fetchTokenFromServer(): Promise<string> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        method: 'GET',
        credentials: 'include', // 重要：携带cookie
      });

      if (!response.ok) {
        throw new Error(`获取CSRF Token失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 缓存Token
      this.token = data.csrfToken;
      this.expiresAt = Date.now() + this.TOKEN_VALIDITY;

      return this.token!;
    } catch (error) {
      console.error('获取CSRF Token失败:', error);
      // 如果获取失败，使用客户端生成的临时Token
      // 注意：这不是最安全的方案，应该由服务器生成
      this.token = this.generateClientToken();
      this.expiresAt = Date.now() + this.TOKEN_VALIDITY;
      return this.token;
    }
  }

  /**
   * 生成客户端临时Token
   * 
   * 仅在服务器无法提供Token时使用
   * 注意：这不是最安全的方案
   * 
   * @returns 临时Token字符串
   */
  private static generateClientToken(): string {
    // 使用crypto.randomUUID如果可用
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // 回退方案：使用随机数
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清除Token
   * 
   * 用户登出或Token失效时调用
   * 
   * @example
   * ```typescript
   * // 用户登出
   * CSRFProtection.clearToken();
   * ```
   */
  static clearToken(): void {
    this.token = null;
    this.expiresAt = null;
    this.fetchPromise = null;
  }

  /**
   * 刷新Token
   * 
   * 强制从服务器获取新Token
   * 
   * @returns 新的CSRF Token
   * 
   * @example
   * ```typescript
   * // 在关键操作前刷新Token
   * const freshToken = await CSRFProtection.refreshToken();
   * ```
   */
  static async refreshToken(): Promise<string> {
    this.clearToken();
    return this.getToken();
  }

  /**
   * 验证Token格式
   * 
   * 简单检查Token是否为有效格式
   * 
   * @param token - 待验证的Token
   * @returns 是否为有效格式
   */
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Token应该至少有8个字符
    if (token.length < 8) {
      return false;
    }

    // Token不应包含特殊字符（仅允许字母、数字、-、_）
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    return validPattern.test(token);
  }
} 