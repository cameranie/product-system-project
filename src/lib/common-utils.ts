/**
 * 通用工具函数
 * 
 * 提供常用的工具函数，避免重复代码
 * 
 * @module CommonUtils
 */

import { useCallback, useMemo } from 'react';

/**
 * 防抖Hook
 * 
 * @param callback 回调函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖数组
 * @returns 防抖后的回调函数
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      const timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      return () => clearTimeout(timeoutId);
    }) as T,
    [callback, delay, ...deps]
  );

  return debouncedCallback;
}

/**
 * 节流Hook
 * 
 * @param callback 回调函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖数组
 * @returns 节流后的回调函数
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      let lastCallTime = 0;
      const now = Date.now();
      
      if (now - lastCallTime >= delay) {
        lastCallTime = now;
        callback(...args);
      }
    }) as T,
    [callback, delay, ...deps]
  );

  return throttledCallback;
}

/**
 * 深度比较Hook
 * 
 * @param value 要比较的值
 * @returns 是否相等
 */
export function useDeepCompareMemoize<T>(value: T): T {
  const ref = useMemo(() => value, [JSON.stringify(value)]);
  return ref;
}

/**
 * 数组操作工具函数
 */
export const arrayUtils = {
  /**
   * 移动数组元素
   * 
   * @param array 数组
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   * @returns 新数组
   */
  move<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const newArray = [...array];
    const [removed] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, removed);
    return newArray;
  },

  /**
   * 交换数组元素
   * 
   * @param array 数组
   * @param index1 索引1
   * @param index2 索引2
   * @returns 新数组
   */
  swap<T>(array: T[], index1: number, index2: number): T[] {
    const newArray = [...array];
    [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
    return newArray;
  },

  /**
   * 去重
   * 
   * @param array 数组
   * @param keyFn 获取唯一键的函数
   * @returns 去重后的数组
   */
  unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
    if (!keyFn) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  /**
   * 分组
   * 
   * @param array 数组
   * @param keyFn 分组键函数
   * @returns 分组后的对象
   */
  groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * 排序
   * 
   * @param array 数组
   * @param keyFn 排序键函数
   * @param direction 排序方向
   * @returns 排序后的数组
   */
  sortBy<T>(array: T[], keyFn: (item: T) => any, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = keyFn(a);
      const bVal = keyFn(b);
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },
};

/**
 * 对象操作工具函数
 */
export const objectUtils = {
  /**
   * 深度合并对象
   * 
   * @param target 目标对象
   * @param source 源对象
   * @returns 合并后的对象
   */
  deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key] as any) as any;
        } else {
          result[key] = source[key] as any;
        }
      }
    }
    
    return result;
  },

  /**
   * 深度克隆对象
   * 
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as T;
    }
    
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    
    return obj;
  },

  /**
   * 获取嵌套属性值
   * 
   * @param obj 对象
   * @param path 属性路径
   * @param defaultValue 默认值
   * @returns 属性值
   */
  get<T>(obj: any, path: string, defaultValue?: T): T | undefined {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  },

  /**
   * 设置嵌套属性值
   * 
   * @param obj 对象
   * @param path 属性路径
   * @param value 值
   * @returns 新对象
   */
  set<T>(obj: any, path: string, value: T): any {
    const keys = path.split('.');
    const result = this.deepClone(obj);
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  },
};

/**
 * 字符串操作工具函数
 */
export const stringUtils = {
  /**
   * 首字母大写
   * 
   * @param str 字符串
   * @returns 首字母大写的字符串
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 驼峰命名转换
   * 
   * @param str 字符串
   * @returns 驼峰命名字符串
   */
  camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  /**
   * 短横线命名转换
   * 
   * @param str 字符串
   * @returns 短横线命名字符串
   */
  kebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  },

  /**
   * 截断字符串
   * 
   * @param str 字符串
   * @param length 最大长度
   * @param suffix 后缀
   * @returns 截断后的字符串
   */
  truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) {
      return str;
    }
    return str.slice(0, length) + suffix;
  },

  /**
   * 高亮搜索词
   * 
   * @param text 文本
   * @param searchTerm 搜索词
   * @param className CSS类名
   * @returns 高亮后的HTML字符串
   */
  highlight(text: string, searchTerm: string, className: string = 'highlight'): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  },
};

/**
 * 数字操作工具函数
 */
export const numberUtils = {
  /**
   * 格式化数字
   * 
   * @param num 数字
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  format(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat('zh-CN', options).format(num);
  },

  /**
   * 格式化货币
   * 
   * @param num 数字
   * @param currency 货币代码
   * @returns 格式化后的货币字符串
   */
  formatCurrency(num: number, currency: string = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
    }).format(num);
  },

  /**
   * 格式化百分比
   * 
   * @param num 数字
   * @param decimals 小数位数
   * @returns 格式化后的百分比字符串
   */
  formatPercent(num: number, decimals: number = 2): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num / 100);
  },

  /**
   * 随机数
   * 
   * @param min 最小值
   * @param max 最大值
   * @returns 随机数
   */
  random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 限制数字范围
   * 
   * @param num 数字
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的数字
   */
  clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  },
};

/**
 * 日期操作工具函数
 */
export const dateUtils = {
  /**
   * 格式化日期
   * 
   * @param date 日期
   * @param format 格式
   * @returns 格式化后的日期字符串
   */
  format(date: Date | string, format: string = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    
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
   * 相对时间
   * 
   * @param date 日期
   * @returns 相对时间字符串
   */
  fromNow(date: Date | string): string {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  /**
   * 是否为今天
   * 
   * @param date 日期
   * @returns 是否为今天
   */
  isToday(date: Date | string): boolean {
    const today = new Date();
    const target = new Date(date);
    
    return today.getFullYear() === target.getFullYear() &&
           today.getMonth() === target.getMonth() &&
           today.getDate() === target.getDate();
  },

  /**
   * 添加天数
   * 
   * @param date 日期
   * @param days 天数
   * @returns 新日期
   */
  addDays(date: Date | string, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * 计算日期差
   * 
   * @param date1 日期1
   * @param date2 日期2
   * @returns 天数差
   */
  diffInDays(date1: Date | string, date2: Date | string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
};

/**
 * 生成安全的唯一ID
 * 使用时间戳和随机数组合，确保ID的唯一性
 * 
 * @returns 唯一ID字符串
 */
export function generateSecureId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}`;
}

/**
 * 生成需求ID
 * 格式: REQ-{年月日}-{随机数}
 * 
 * @returns 需求ID字符串
 */
export function generateRequirementId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-${year}${month}${day}-${random}`;
}

/**
 * 格式化日期时间为标准格式
 * 格式: YYYY-MM-DD HH:mm:ss
 * 
 * @param date 日期对象，默认为当前时间
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}