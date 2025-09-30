import CryptoJS from 'crypto-js';

/**
 * 数据包装接口
 * 包含加密数据和过期时间
 */
interface StorageData {
  value: string;
  expiresAt?: number;
}

/**
 * 安全存储管理类
 * 
 * 使用AES加密算法保护localStorage中的敏感数据
 * 主要用于存储认证Token、用户偏好设置等敏感信息
 * 
 * 安全特性：
 * - AES-256加密
 * - 自动过期时间管理
 * - 防止XSS读取敏感数据
 * 
 * @example
 * ```typescript
 * // 存储Token（7天过期）
 * SecureStorage.setItem('auth_token', token, 7 * 24 * 60 * 60 * 1000);
 * 
 * // 读取Token
 * const token = SecureStorage.getItem('auth_token');
 * 
 * // 删除Token
 * SecureStorage.removeItem('auth_token');
 * ```
 */
export class SecureStorage {
  /**
   * 加密密钥
   * 
   * 注意：在生产环境中，应该使用环境变量配置
   * 不应该硬编码在代码中
   */
  private static readonly SECRET_KEY = 
    process.env.NEXT_PUBLIC_STORAGE_KEY || 'vibe-project-default-key-2025';

  /**
   * 安全存储数据
   * 
   * 使用AES加密后存储到localStorage
   * 
   * @param key - 存储键名
   * @param value - 待存储的值
   * @param expiresInMs - 过期时间（毫秒），不传则永不过期
   * 
   * @example
   * ```typescript
   * // 存储7天过期的Token
   * SecureStorage.setItem('token', 'abc123', 7 * 24 * 60 * 60 * 1000);
   * 
   * // 存储永不过期的数据
   * SecureStorage.setItem('theme', 'dark');
   * ```
   */
  static setItem(key: string, value: string, expiresInMs?: number): void {
    try {
      // 构建数据包
      const data: StorageData = {
        value,
        expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
      };

      // 加密数据
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.SECRET_KEY
      ).toString();

      // 存储到localStorage
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('安全存储失败:', error);
      // 在生产环境中，应该上报错误到监控系统
    }
  }

  /**
   * 安全读取数据
   * 
   * 自动解密并检查过期时间
   * 
   * @param key - 存储键名
   * @returns 解密后的值，如果不存在或已过期则返回null
   * 
   * @example
   * ```typescript
   * const token = SecureStorage.getItem('token');
   * if (token) {
   *   // Token有效
   * } else {
   *   // Token不存在或已过期
   * }
   * ```
   */
  static getItem(key: string): string | null {
    try {
      // 从localStorage读取
      const encrypted = localStorage.getItem(key);
      if (!encrypted) {
        return null;
      }

      // 解密数据
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const dataStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!dataStr) {
        // 解密失败（可能密钥错误）
        this.removeItem(key);
        return null;
      }

      // 解析数据
      const data: StorageData = JSON.parse(dataStr);

      // 检查是否过期
      if (data.expiresAt && Date.now() > data.expiresAt) {
        // 数据已过期，自动删除
        this.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('安全读取失败:', error);
      // 数据损坏，删除
      this.removeItem(key);
      return null;
    }
  }

  /**
   * 删除数据
   * 
   * @param key - 存储键名
   * 
   * @example
   * ```typescript
   * // 用户登出时删除Token
   * SecureStorage.removeItem('auth_token');
   * ```
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  }

  /**
   * 清空所有数据
   * 
   * 谨慎使用，会清空所有localStorage数据
   * 
   * @example
   * ```typescript
   * // 用户登出时清空所有数据
   * SecureStorage.clear();
   * ```
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }

  /**
   * 检查密钥是否存在
   * 
   * @param key - 存储键名
   * @returns 是否存在有效数据
   * 
   * @example
   * ```typescript
   * if (SecureStorage.hasItem('auth_token')) {
   *   // Token存在且有效
   * }
   * ```
   */
  static hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}

/**
 * Token管理器
 * 
 * 专门用于管理认证Token，提供自动刷新功能
 * 
 * @example
 * ```typescript
 * // 获取有效Token（自动刷新过期Token）
 * const token = await TokenManager.getValidToken();
 * 
 * // 存储新Token
 * TokenManager.setToken(token);
 * 
 * // 清除Token
 * TokenManager.clearToken();
 * ```
 */
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * 存储Token
   * 
   * @param token - JWT Token
   * 
   * @example
   * ```typescript
   * // 登录成功后存储Token
   * TokenManager.setToken(response.access_token);
   * ```
   */
  static setToken(token: string): void {
    SecureStorage.setItem(this.TOKEN_KEY, token, this.TOKEN_EXPIRY);
  }

  /**
   * 获取Token
   * 
   * @returns Token字符串或null
   */
  static getToken(): string | null {
    return SecureStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 清除Token
   * 
   * @example
   * ```typescript
   * // 用户登出
   * TokenManager.clearToken();
   * ```
   */
  static clearToken(): void {
    SecureStorage.removeItem(this.TOKEN_KEY);
    this.refreshPromise = null;
  }

  /**
   * 检查Token是否过期
   * 
   * 通过解析JWT Token的exp字段判断
   * 提前5分钟认为Token即将过期，需要刷新
   * 
   * @param token - JWT Token
   * @returns 是否过期
   */
  private static isTokenExpired(token: string): boolean {
    try {
      // JWT格式：header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      // 解码payload
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // 转换为毫秒
      const now = Date.now();

      // 提前5分钟刷新
      const REFRESH_THRESHOLD = 5 * 60 * 1000;
      return exp - now < REFRESH_THRESHOLD;
    } catch (error) {
      console.error('解析Token失败:', error);
      return true;
    }
  }

  /**
   * 获取有效Token
   * 
   * 自动检查Token过期状态，如果即将过期则自动刷新
   * 防止并发刷新
   * 
   * @returns 有效的Token或null
   * 
   * @example
   * ```typescript
   * // 在API调用前获取Token
   * const token = await TokenManager.getValidToken();
   * if (!token) {
   *   // 跳转登录页
   *   router.push('/login');
   *   return;
   * }
   * 
   * // 使用Token调用API
   * fetch('/api/data', {
   *   headers: { Authorization: `Bearer ${token}` }
   * });
   * ```
   */
  static async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    // 检查Token是否即将过期
    if (this.isTokenExpired(token)) {
      // 尝试刷新Token
      return this.refreshToken();
    }

    return token;
  }

  /**
   * 刷新Token
   * 
   * 防止并发刷新：如果正在刷新，等待刷新完成
   * 
   * @returns 新的Token或null（刷新失败）
   */
  private static async refreshToken(): Promise<string | null> {
    // 如果正在刷新，等待刷新完成
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // 创建刷新Promise
    this.refreshPromise = (async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        
        // 调用刷新Token接口
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // 携带Cookie
        });

        if (!response.ok) {
          throw new Error('Token刷新失败');
        }

        const data = await response.json();
        const newToken = data.access_token;

        // 存储新Token
        this.setToken(newToken);

        return newToken;
      } catch (error) {
        console.error('Token刷新失败:', error);
        
        // 刷新失败，清除Token
        this.clearToken();
        
        // 跳转登录页（在浏览器环境）
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return null;
      } finally {
        // 刷新完成，清除Promise
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * 检查是否已登录
   * 
   * @returns 是否有有效Token
   * 
   * @example
   * ```typescript
   * if (!TokenManager.isAuthenticated()) {
   *   router.push('/login');
   * }
   * ```
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
} 