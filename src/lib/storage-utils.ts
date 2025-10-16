/**
 * 安全的 localStorage 工具库
 * 
 * 提供带验证和错误处理的 localStorage 操作，防止：
 * - localStorage 不可用导致的崩溃
 * - JSON 解析错误
 * - 数据注入攻击
 * - 数据损坏
 * 
 * @module storage-utils
 */

/**
 * 检查 localStorage 是否可用
 * 
 * 原因：
 * - 隐私模式下 localStorage 可能被禁用
 * - Safari 隐私浏览模式会抛出异常
 * - 配额已满时会失败
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}

/**
 * 数据验证器接口
 */
export interface DataValidator<T> {
  /**
   * 验证数据是否符合预期格式
   * @param data - 待验证的数据
   * @returns 验证通过返回 true，否则返回 false
   */
  validate: (data: unknown) => data is T;
  
  /**
   * 数据结构描述（用于错误日志）
   */
  description?: string;
}

/**
 * 安全地从 localStorage 读取数据
 * 
 * P0 安全问题修复：
 * 1. ✅ 添加 localStorage 可用性检查
 * 2. ✅ 添加 JSON.parse 异常捕获
 * 3. ✅ 添加数据验证，防止注入攻击
 * 4. ✅ 返回默认值而非抛出异常
 * 
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @param validator - 可选的数据验证器
 * @returns 解析后的数据或默认值
 * 
 * @example
 * ```ts
 * const filters = safeGetItem('custom-filters', [], {
 *   validate: (data): data is FilterCondition[] => 
 *     Array.isArray(data) && data.every(isValidFilter)
 * });
 * ```
 */
export function safeGetItem<T>(
  key: string,
  defaultValue: T,
  validator?: DataValidator<T>
): T {
  // 1. 检查 localStorage 可用性
  if (!isLocalStorageAvailable()) {
    console.warn(`localStorage not available, using default value for key: ${key}`);
    return defaultValue;
  }

  try {
    // 2. 读取数据
    const item = localStorage.getItem(key);
    
    // 3. 空值检查
    if (item === null) {
      return defaultValue;
    }

    // 4. JSON 解析（带异常捕获）
    const parsed = JSON.parse(item);

    // 5. 数据验证（可选）
    if (validator) {
      if (!validator.validate(parsed)) {
        console.warn(
          `Data validation failed for key: ${key}`,
          validator.description ? `Expected: ${validator.description}` : '',
          'Actual:', parsed
        );
        return defaultValue;
      }
    }

    return parsed as T;
  } catch (error) {
    // 6. 错误处理
    console.error(`Failed to get item from localStorage (key: ${key}):`, error);
    
    // P0: 清除损坏的数据
    try {
      localStorage.removeItem(key);
    } catch {
      // 忽略清除失败
    }
    
    return defaultValue;
  }
}

/**
 * 安全地写入数据到 localStorage
 * 
 * P0 安全问题修复：
 * 1. ✅ 添加 localStorage 可用性检查
 * 2. ✅ 添加 JSON.stringify 异常捕获
 * 3. ✅ 添加配额超限处理
 * 4. ✅ 添加写入验证
 * 
 * @param key - 存储键名
 * @param value - 要存储的值
 * @returns 是否写入成功
 * 
 * @example
 * ```ts
 * const success = safeSetItem('custom-filters', filters);
 * if (!success) {
 *   toast.error('保存失败，可能是存储空间已满');
 * }
 * ```
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  // 1. 检查 localStorage 可用性
  if (!isLocalStorageAvailable()) {
    console.warn(`localStorage not available, cannot save key: ${key}`);
    return false;
  }

  try {
    // 2. JSON 序列化
    const serialized = JSON.stringify(value);

    // 3. 写入数据
    localStorage.setItem(key, serialized);

    // 4. 写入验证（读取后对比）
    const written = localStorage.getItem(key);
    if (written !== serialized) {
      console.error(`Write verification failed for key: ${key}`);
      return false;
    }

    return true;
  } catch (error: any) {
    // 5. 错误处理
    if (error?.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded!', error);
      // P0: 可以在这里触发清理策略或通知用户
    } else {
      console.error(`Failed to set item in localStorage (key: ${key}):`, error);
    }
    
    return false;
  }
}

/**
 * 安全地删除 localStorage 数据
 * 
 * @param key - 存储键名
 * @returns 是否删除成功
 */
export function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove item from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * 清除所有带指定前缀的 localStorage 数据
 * 
 * 用于清理旧版本或损坏的数据
 * 
 * @param prefix - 键名前缀
 * @returns 删除的键数量
 */
export function clearByPrefix(prefix: string): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  try {
    const keys: string[] = [];
    
    // 收集所有匹配的键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    // 删除所有匹配的键
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // 忽略单个删除失败
      }
    });

    return keys.length;
  } catch (error) {
    console.error(`Failed to clear items with prefix: ${prefix}`, error);
    return 0;
  }
}

// ==================== 常用验证器 ====================

/**
 * 数组验证器
 */
export function arrayValidator<T>(
  itemValidator?: (item: unknown) => item is T
): DataValidator<T[]> {
  return {
    validate: (data): data is T[] => {
      if (!Array.isArray(data)) {
        return false;
      }
      
      if (itemValidator) {
        return data.every(item => itemValidator(item));
      }
      
      return true;
    },
    description: 'array'
  };
}

/**
 * 对象验证器
 */
export function objectValidator<T extends Record<string, any>>(
  requiredKeys: (keyof T)[]
): DataValidator<T> {
  return {
    validate: (data): data is T => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return false;
      }
      
      return requiredKeys.every(key => key in data);
    },
    description: `object with keys: ${requiredKeys.join(', ')}`
  };
}

/**
 * 字符串验证器
 */
export function stringValidator(
  maxLength?: number
): DataValidator<string> {
  return {
    validate: (data): data is string => {
      if (typeof data !== 'string') {
        return false;
      }
      
      if (maxLength && data.length > maxLength) {
        return false;
      }
      
      return true;
    },
    description: maxLength ? `string (max ${maxLength} chars)` : 'string'
  };
}

/**
 * 枚举验证器
 */
export function enumValidator<T extends string>(
  allowedValues: T[]
): DataValidator<T> {
  return {
    validate: (data): data is T => {
      return typeof data === 'string' && allowedValues.includes(data as T);
    },
    description: `enum: ${allowedValues.join(' | ')}`
  };
}

