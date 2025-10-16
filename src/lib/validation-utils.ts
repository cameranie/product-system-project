/**
 * 通用验证工具函数
 * 
 * 提供各种数据验证功能，包括：
 * - URL参数验证
 * - ID格式验证
 * - 输入清理
 */

/**
 * 验证需求ID格式
 * 
 * @param id - 需求ID
 * @returns 是否为有效的需求ID格式
 * 
 * @example
 * ```ts
 * isValidRequirementId('#123')  // true
 * isValidRequirementId('#abc')  // false
 * isValidRequirementId('123')   // false
 * ```
 */
export function isValidRequirementId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // 需求ID格式：#数字
  return /^#\d+$/.test(id);
}

/**
 * 验证并清理需求ID
 * 
 * @param id - 原始ID（可能经过URL编码）
 * @returns 清理后的ID，如果无效则返回null
 * 
 * @example
 * ```ts
 * validateRequirementId('%23123')  // '#123'
 * validateRequirementId('#123')    // '#123'
 * validateRequirementId('invalid') // null
 * ```
 */
export function validateRequirementId(id: string): string | null {
  if (!id) return null;
  
  try {
    // 解码URL编码的ID
    const decoded = decodeURIComponent(id);
    
    // 验证格式
    if (!isValidRequirementId(decoded)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // URL解码失败
    console.error('Invalid requirement ID:', id, error);
    return null;
  }
}

/**
 * 验证URL参数
 * 
 * @param value - URL参数值
 * @param options - 验证选项
 * @returns 验证结果
 */
export interface ValidateUrlParamOptions {
  /** 是否必需 */
  required?: boolean;
  /** 最大长度 */
  maxLength?: number;
  /** 允许的值列表（白名单） */
  allowedValues?: string[];
  /** 自定义验证函数 */
  validator?: (value: string) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  value?: string;
  error?: string;
}

export function validateUrlParam(
  value: string | null | undefined,
  options: ValidateUrlParamOptions = {}
): ValidationResult {
  const {
    required = false,
    maxLength = 100,
    allowedValues,
    validator,
  } = options;

  // 检查必需参数
  if (!value || value.trim() === '') {
    if (required) {
      return { valid: false, error: '参数不能为空' };
    }
    return { valid: true, value: '' };
  }

  // 检查长度
  if (value.length > maxLength) {
    return { 
      valid: false, 
      error: `参数长度不能超过${maxLength}个字符` 
    };
  }

  // 检查白名单
  if (allowedValues && !allowedValues.includes(value)) {
    return { 
      valid: false, 
      error: `参数值不在允许的范围内` 
    };
  }

  // 自定义验证
  if (validator && !validator(value)) {
    return { 
      valid: false, 
      error: `参数验证失败` 
    };
  }

  // 检查危险字符
  const dangerousPattern = /<script|<iframe|javascript:|onerror=|onload=/i;
  if (dangerousPattern.test(value)) {
    return { 
      valid: false, 
      error: `参数包含非法字符` 
    };
  }

  return { valid: true, value: value.trim() };
}

/**
 * 清理和验证来源参数（from参数）
 * 
 * @param from - 来源参数
 * @returns 验证后的来源，如果无效则返回null
 */
export function validateFromParam(from: string | null): string | null {
  const result = validateUrlParam(from, {
    required: false,
    maxLength: 50,
    allowedValues: ['list', 'detail', 'kanban', 'scheduled'],
  });

  return result.valid ? result.value : null;
}




