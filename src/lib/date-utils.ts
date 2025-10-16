/**
 * 日期格式化工具库
 * 
 * P3 代码质量优化：统一日期格式化逻辑
 * 
 * 提供一致的日期格式化函数，避免直接使用 new Date().toISOString()
 * 
 * @module date-utils
 */

/**
 * 日期格式类型
 */
export type DateFormat = 
  | 'datetime' // YYYY-MM-DD HH:mm:ss
  | 'date' // YYYY-MM-DD
  | 'time' // HH:mm:ss
  | 'iso' // ISO 8601 格式
  | 'relative'; // 相对时间（如 "3分钟前"）

/**
 * 格式化选项
 */
export interface FormatOptions {
  /** 格式类型 */
  format?: DateFormat;
  /** 是否使用本地时区（默认 true） */
  useLocalTimezone?: boolean;
  /** 自定义格式字符串（覆盖 format 参数） */
  customFormat?: string;
}

/**
 * 补零函数
 */
function padZero(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
}

/**
 * 格式化日期时间
 * 
 * P3: 统一日期格式化，替代项目中的 new Date().toISOString() 调用
 * 
 * @param date - 日期对象、时间戳或日期字符串
 * @param options - 格式化选项
 * @returns 格式化后的日期字符串
 * 
 * @example
 * ```ts
 * formatDateTime(new Date()); // "2024-01-15 14:30:25"
 * formatDateTime(new Date(), { format: 'date' }); // "2024-01-15"
 * formatDateTime(new Date(), { format: 'iso' }); // "2024-01-15T14:30:25.000Z"
 * ```
 */
export function formatDateTime(
  date: Date | string | number = new Date(),
  options: FormatOptions = {}
): string {
  const {
    format = 'datetime',
    useLocalTimezone = true,
  } = options;

  // 转换为 Date 对象
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = new Date();
  }

  // 验证日期有效性
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '-';
  }

  // 根据格式类型返回不同格式
  switch (format) {
    case 'iso':
      return dateObj.toISOString();

    case 'date':
      if (useLocalTimezone) {
        const year = dateObj.getFullYear();
        const month = padZero(dateObj.getMonth() + 1);
        const day = padZero(dateObj.getDate());
        return `${year}-${month}-${day}`;
      } else {
        return dateObj.toISOString().split('T')[0];
      }

    case 'time':
      if (useLocalTimezone) {
        const hour = padZero(dateObj.getHours());
        const minute = padZero(dateObj.getMinutes());
        const second = padZero(dateObj.getSeconds());
        return `${hour}:${minute}:${second}`;
      } else {
        return dateObj.toISOString().split('T')[1].split('.')[0];
      }

    case 'datetime':
      if (useLocalTimezone) {
        const year = dateObj.getFullYear();
        const month = padZero(dateObj.getMonth() + 1);
        const day = padZero(dateObj.getDate());
        const hour = padZero(dateObj.getHours());
        const minute = padZero(dateObj.getMinutes());
        const second = padZero(dateObj.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      } else {
        return dateObj.toISOString().replace('T', ' ').split('.')[0];
      }

    case 'relative':
      return formatRelativeTime(dateObj);

    default:
      return formatDateTime(dateObj, { format: 'datetime', useLocalTimezone });
  }
}

/**
 * 格式化相对时间
 * 
 * @param date - 日期对象
 * @returns 相对时间字符串（如 "3分钟前"、"2小时前"）
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = Date.now();
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const diff = now - dateObj.getTime();

  // 验证日期有效性
  if (isNaN(diff)) {
    return '-';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
}

/**
 * 获取当前日期时间字符串（本地时区）
 * 
 * @returns 格式化的当前日期时间
 */
export function now(): string {
  return formatDateTime(new Date(), { format: 'datetime' });
}

/**
 * 获取当前日期字符串（本地时区）
 * 
 * @returns 格式化的当前日期
 */
export function today(): string {
  return formatDateTime(new Date(), { format: 'date' });
}

/**
 * 获取当前时间字符串（本地时区）
 * 
 * @returns 格式化的当前时间
 */
export function currentTime(): string {
  return formatDateTime(new Date(), { format: 'time' });
}

/**
 * 获取 ISO 格式的当前日期时间
 * 
 * @returns ISO 格式字符串
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * 解析日期字符串
 * 
 * @param dateStr - 日期字符串
 * @returns Date 对象，如果解析失败返回 null
 */
export function parseDate(dateStr: string): Date | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.error('Failed to parse date:', dateStr, error);
    return null;
  }
}

/**
 * 判断是否为有效日期
 * 
 * @param date - 日期对象或字符串
 * @returns 是否有效
 */
export function isValidDate(date: Date | string): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  const parsed = parseDate(date);
  return parsed !== null;
}

/**
 * 比较两个日期
 * 
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns -1 (date1 < date2), 0 (date1 === date2), 1 (date1 > date2)
 */
export function compareDates(
  date1: Date | string,
  date2: Date | string
): -1 | 0 | 1 {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  if (d1.getTime() < d2.getTime()) return -1;
  if (d1.getTime() > d2.getTime()) return 1;
  return 0;
}

/**
 * 计算两个日期之间的天数差
 * 
 * @param date1 - 开始日期
 * @param date2 - 结束日期
 * @returns 天数差（正数表示 date2 晚于 date1）
 */
export function daysBetween(
  date1: Date | string,
  date2: Date | string
): number {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 判断日期是否在指定天数之前
 * 
 * @param date - 要检查的日期
 * @param days - 天数
 * @returns 是否在指定天数之前
 */
export function isOlderThan(date: Date | string, days: number): boolean {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffDays = daysBetween(d, now);
  return diffDays > days;
}

/**
 * 判断日期是否为今天
 * 
 * @param date - 要检查的日期
 * @returns 是否为今天
 */
export function isToday(date: Date | string): boolean {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * 获取友好的日期显示
 * 
 * 根据日期距离现在的时间，返回不同的显示格式：
 * - 今天：显示相对时间（如 "3分钟前"）
 * - 7天内：显示"X天前"
 * - 其他：显示完整日期
 * 
 * @param date - 日期
 * @returns 友好的日期字符串
 */
export function friendlyDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isToday(d)) {
    return formatRelativeTime(d);
  }
  
  const days = daysBetween(d, new Date());
  if (days <= 7) {
    return `${days}天前`;
  }
  
  return formatDateTime(d, { format: 'date' });
}

