/**
 * 安全工具函数
 * 
 * 提供CSRF保护、XSS防护等安全功能
 */

/**
 * 获取 CSRF Token
 * 
 * 从meta标签或cookie中获取CSRF令牌
 * 
 * @returns CSRF Token
 * @throws 如果找不到CSRF Token
 * 
 * @example
 * ```html
 * <meta name="csrf-token" content="your-csrf-token">
 * ```
 * 
 * ```ts
 * const token = getCsrfToken();
 * ```
 */
export function getCsrfToken(): string {
  // 从meta标签获取
  if (typeof document !== 'undefined') {
    const token = document.querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
      
    if (token) return token;
  }
  
  // 从cookie获取
  if (typeof document !== 'undefined') {
    const token = getCookie('csrf-token');
    if (token) return token;
  }
  
  throw new Error('CSRF token not found');
}

/**
 * 从cookie中获取值
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

/**
 * 带CSRF保护的fetch请求
 * 
 * 自动添加CSRF Token到请求头
 * 
 * @param url - 请求URL
 * @param options - fetch选项
 * @returns Response
 * 
 * @example
 * ```ts
 * const response = await secureFetch('/api/requirements', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export async function secureFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    const csrfToken = getCsrfToken();
    
    const headers = new Headers(options.headers);
    headers.set('X-CSRF-Token', csrfToken);
    headers.set('Content-Type', 'application/json');
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin', // 发送cookies
    });
  } catch (error) {
    console.error('Secure fetch failed:', error);
    // 如果获取CSRF Token失败，仍然发送请求（开发环境）
    if (process.env.NODE_ENV === 'development') {
      return fetch(url, options);
    }
    throw error;
  }
}

/**
 * 清理HTML，防止XSS攻击
 * 
 * 移除危险的HTML标签和属性
 * 
 * @param html - 原始HTML
 * @returns 清理后的HTML
 * 
 * @example
 * ```ts
 * const safe = sanitizeHtml('<script>alert("xss")</script>Hello');
 * // 'Hello'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // 移除script标签
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除iframe标签
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // 移除on*事件处理器
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除javascript:伪协议
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  return cleaned;
}

/**
 * 转义HTML特殊字符
 * 
 * @param str - 原始字符串
 * @returns 转义后的字符串
 * 
 * @example
 * ```ts
 * escapeHtml('<script>alert("xss")</script>');
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
}

/**
 * 验证URL是否安全
 * 
 * 检查URL协议，防止javascript:等危险协议
 * 
 * @param url - URL字符串
 * @returns 是否为安全URL
 * 
 * @example
 * ```ts
 * isSafeUrl('https://example.com')       // true
 * isSafeUrl('javascript:alert("xss")')   // false
 * ```
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // 危险协议列表
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];
  
  // 检查是否包含危险协议
  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return false;
    }
  }
  
  // 允许相对路径
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('#')) {
    return true;
  }
  
  // 验证绝对URL
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * 生成随机字符串（用于nonce等）
 * 
 * @param length - 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}




