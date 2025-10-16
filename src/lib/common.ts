/**
 * 公共工具函数库
 * 
 * P3 功能：提取和统一公共工具函数
 * 
 * 功能特性：
 * - 数据处理工具
 * - 格式化工具
 * - 验证工具
 * - 转换工具
 * - 计算工具
 * 
 * @module common
 */

import { logger } from './logger';

/**
 * 数据类型检查工具
 */
export const typeUtils = {
  /**
   * 检查是否为字符串
   */
  isString: (value: any): value is string => typeof value === 'string',

  /**
   * 检查是否为数字
   */
  isNumber: (value: any): value is number => typeof value === 'number' && !isNaN(value),

  /**
   * 检查是否为布尔值
   */
  isBoolean: (value: any): value is boolean => typeof value === 'boolean',

  /**
   * 检查是否为数组
   */
  isArray: (value: any): value is any[] => Array.isArray(value),

  /**
   * 检查是否为对象
   */
  isObject: (value: any): value is Record<string, any> => 
    typeof value === 'object' && value !== null && !Array.isArray(value),

  /**
   * 检查是否为函数
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  isFunction: (value: any): value is Function => typeof value === 'function',

  /**
   * 检查是否为空值
   */
  isEmpty: (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * 检查是否为有效值
   */
  isValid: (value: any): boolean => !typeUtils.isEmpty(value),
};

/**
 * 字符串处理工具
 */
export const stringUtils = {
  /**
   * 首字母大写
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * 驼峰命名转换
   */
  camelCase: (str: string): string => {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  /**
   * 短横线命名转换
   */
  kebabCase: (str: string): string => {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  },

  /**
   * 下划线命名转换
   */
  snakeCase: (str: string): string => {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  },

  /**
   * 截断字符串
   */
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
  },

  /**
   * 移除HTML标签
   */
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, '');
  },

  /**
   * 转义HTML字符
   */
  escapeHtml: (str: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, (char) => map[char]);
  },

  /**
   * 生成随机字符串
   */
  randomString: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 生成UUID
   */
  generateUUID: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
};

/**
 * 数字处理工具
 */
export const numberUtils = {
  /**
   * 格式化数字（添加千分位分隔符）
   */
  formatNumber: (num: number, decimals: number = 0): string => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  /**
   * 格式化货币
   */
  formatCurrency: (amount: number, currency: string = 'CNY'): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * 格式化百分比
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * 四舍五入
   */
  round: (num: number, decimals: number = 0): number => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * 向上取整
   */
  ceil: (num: number, decimals: number = 0): number => {
    return Math.ceil(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * 向下取整
   */
  floor: (num: number, decimals: number = 0): number => {
    return Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * 限制数值范围
   */
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
  },

  /**
   * 生成随机数
   */
  random: (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  },

  /**
   * 生成随机整数
   */
  randomInt: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

/**
 * 日期处理工具
 */
export const dateUtils = {
  /**
   * 格式化日期
   */
  format: (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 相对时间格式化
   */
  formatRelative: (date: Date | string): string => {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    if (weeks < 4) return `${weeks}周前`;
    if (months < 12) return `${months}个月前`;
    return `${years}年前`;
  },

  /**
   * 获取日期范围
   */
  getDateRange: (type: 'today' | 'week' | 'month' | 'year' | 'quarter') => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (type) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(quarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  },

  /**
   * 检查是否为同一天
   */
  isSameDay: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  /**
   * 添加天数
   */
  addDays: (date: Date | string, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * 添加月份
   */
  addMonths: (date: Date | string, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  /**
   * 添加年份
   */
  addYears: (date: Date | string, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },
};

/**
 * 数组处理工具
 */
export const arrayUtils = {
  /**
   * 数组去重
   */
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  /**
   * 根据属性去重
   */
  uniqueBy: <T>(arr: T[], key: keyof T): T[] => {
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  /**
   * 数组分组
   */
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * 数组排序
   */
  sortBy: <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * 数组分页
   */
  paginate: <T>(arr: T[], page: number, size: number): T[] => {
    const start = (page - 1) * size;
    const end = start + size;
    return arr.slice(start, end);
  },

  /**
   * 数组分块
   */
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * 数组扁平化
   */
  flatten: <T>(arr: (T | T[])[]): T[] => {
    return arr.reduce<T[]>((flat, item) => {
      return flat.concat(Array.isArray(item) ? arrayUtils.flatten(item) : [item]);
    }, []);
  },

  /**
   * 数组交集
   */
  intersection: <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter(item => arr2.includes(item));
  },

  /**
   * 数组差集
   */
  difference: <T>(arr1: T[], arr2: T[]): T[] => {
    return arr1.filter(item => !arr2.includes(item));
  },

  /**
   * 数组并集
   */
  union: <T>(arr1: T[], arr2: T[]): T[] => {
    return arrayUtils.unique([...arr1, ...arr2]);
  },
};

/**
 * 对象处理工具
 */
export const objectUtils = {
  /**
   * 深度克隆
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const cloned = {} as any;
      Object.keys(obj).forEach(key => {
        cloned[key] = objectUtils.deepClone((obj as any)[key]);
      });
      return cloned;
    }
    return obj;
  },

  /**
   * 深度合并
   */
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target } as any;
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = objectUtils.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  },

  /**
   * 获取嵌套属性值
   */
  get: <T>(obj: any, path: string, defaultValue?: T): T | undefined => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;
      result = result[key];
    }
    return result !== undefined ? result : defaultValue;
  },

  /**
   * 设置嵌套属性值
   */
  set: (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  },

  /**
   * 检查对象是否为空
   */
  isEmpty: (obj: any): boolean => {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },

  /**
   * 对象键值对交换
   */
  invert: (obj: Record<string, any>): Record<string, string> => {
    const result: Record<string, string> = {};
    Object.keys(obj).forEach(key => {
      result[obj[key]] = key;
    });
    return result;
  },

  /**
   * 对象过滤
   */
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * 对象排除
   */
  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },
};

/**
 * 文件处理工具
 */
export const fileUtils = {
  /**
   * 格式化文件大小
   */
  formatSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * 获取文件扩展名
   */
  getExtension: (filename: string): string => {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
  },

  /**
   * 获取文件名（不含扩展名）
   */
  getBasename: (filename: string): string => {
    return filename.slice(0, filename.lastIndexOf('.'));
  },

  /**
   * 检查文件类型
   */
  isImage: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(fileUtils.getExtension(filename));
  },

  /**
   * 检查是否为视频文件
   */
  isVideo: (filename: string): boolean => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    return videoExtensions.includes(fileUtils.getExtension(filename));
  },

  /**
   * 检查是否为音频文件
   */
  isAudio: (filename: string): boolean => {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
    return audioExtensions.includes(fileUtils.getExtension(filename));
  },

  /**
   * 检查是否为文档文件
   */
  isDocument: (filename: string): boolean => {
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    return documentExtensions.includes(fileUtils.getExtension(filename));
  },
};

/**
 * URL处理工具
 */
export const urlUtils = {
  /**
   * 构建查询字符串
   */
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, String(params[key]));
      }
    });
    return searchParams.toString();
  },

  /**
   * 解析查询字符串
   */
  parseQueryString: (queryString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  /**
   * 检查是否为有效URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 获取URL参数
   */
  getUrlParam: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * 设置URL参数
   */
  setUrlParam: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url.toString());
  },
};

/**
 * 颜色处理工具
 */
export const colorUtils = {
  /**
   * 十六进制转RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },

  /**
   * RGB转十六进制
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },

  /**
   * 生成随机颜色
   */
  randomColor: (): string => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  },

  /**
   * 颜色亮度计算
   */
  getLuminance: (hex: string): number => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return 0;
    const { r, g, b } = rgb;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  },

  /**
   * 判断颜色是否为深色
   */
  isDark: (hex: string): boolean => {
    return colorUtils.getLuminance(hex) < 0.5;
  },
};

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Attempt ${attempt} failed`, {
        error: lastError,
        data: { attempt, maxAttempts },
      });
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
}

/**
 * 超时函数
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeout);
    }),
  ]);
}

/**
 * 批量处理函数
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delay: number = 0
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    if (delay > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}









