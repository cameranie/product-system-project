/**
 * 数据验证库
 * 
 * P2 功能：提供统一的数据验证和清理
 * 
 * 功能特性：
 * - 类型验证
 * - 格式验证
 * - 业务规则验证
 * - 错误信息国际化
 * - 自定义验证器
 * - 异步验证
 * 
 * @module validation
 */

import { logger } from './logger';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: ValidationError[];
  /** 清理后的数据 */
  data?: any;
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  /** 字段路径 */
  field: string;
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误值 */
  value?: any;
  /** 错误详情 */
  details?: Record<string, any>;
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string;
  /** 验证函数 */
  validate: (value: any, context?: any) => boolean | Promise<boolean>;
  /** 错误消息 */
  message: string;
  /** 是否必需 */
  required?: boolean;
  /** 自定义错误代码 */
  code?: string;
}

/**
 * 字段验证配置
 */
export interface FieldValidation {
  /** 字段名称 */
  field: string;
  /** 验证规则 */
  rules: ValidationRule[];
  /** 是否必需 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 转换函数 */
  transform?: (value: any) => any;
}

/**
 * 验证器类
 */
export class Validator {
  private rules: Map<string, ValidationRule> = new Map();
  private fieldConfigs: Map<string, FieldValidation> = new Map();

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * 注册验证规则
   */
  public registerRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 注册字段验证配置
   */
  public registerField(config: FieldValidation): void {
    this.fieldConfigs.set(config.field, config);
  }

  /**
   * 验证单个值
   */
  public async validateValue(
    value: any,
    rules: string[],
    context?: any
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const ruleName of rules) {
      const rule = this.rules.get(ruleName);
      if (!rule) {
        errors.push({
          field: '',
          code: 'UNKNOWN_RULE',
          message: `Unknown validation rule: ${ruleName}`,
        });
        continue;
      }

      try {
        const isValid = await rule.validate(value, context);
        if (!isValid) {
          errors.push({
            field: '',
            code: rule.code || ruleName,
            message: rule.message,
            value,
          });
        }
      } catch (error) {
        logger.error('Validation rule error', {
          error: error as Error,
          data: { ruleName, value },
        });
        errors.push({
          field: '',
          code: 'VALIDATION_ERROR',
          message: `Validation rule error: ${(error as Error).message}`,
          value,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证对象
   */
  public async validateObject(
    data: Record<string, any>,
    schema: Record<string, string[]>
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const cleanedData: Record<string, any> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const fieldConfig = this.fieldConfigs.get(field);

      // 检查是否必需
      if (fieldConfig?.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          code: 'REQUIRED',
          message: `${field} is required`,
          value,
        });
        continue;
      }

      // 如果值为空且不是必需的，跳过验证
      if (value === undefined || value === null || value === '') {
        cleanedData[field] = fieldConfig?.defaultValue;
        continue;
      }

      // 应用转换函数
      let transformedValue = value;
      if (fieldConfig?.transform) {
        try {
          transformedValue = fieldConfig.transform(value);
        } catch (error) {
          errors.push({
            field,
            code: 'TRANSFORM_ERROR',
            message: `Failed to transform ${field}: ${(error as Error).message}`,
            value,
          });
          continue;
        }
      }

      // 验证值
      const result = await this.validateValue(transformedValue, rules, data);
      if (!result.valid) {
        errors.push(...result.errors.map(error => ({
          ...error,
          field: `${field}.${error.field}`.replace(/^\./, ''),
        })));
      } else {
        cleanedData[field] = transformedValue;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data: cleanedData,
    };
  }

  /**
   * 注册默认验证规则
   */
  private registerDefaultRules(): void {
    // 基础类型验证
    this.registerRule({
      name: 'string',
      validate: (value) => typeof value === 'string',
      message: 'Must be a string',
      code: 'INVALID_TYPE',
    });

    this.registerRule({
      name: 'number',
      validate: (value) => typeof value === 'number' && !isNaN(value),
      message: 'Must be a valid number',
      code: 'INVALID_TYPE',
    });

    this.registerRule({
      name: 'boolean',
      validate: (value) => typeof value === 'boolean',
      message: 'Must be a boolean',
      code: 'INVALID_TYPE',
    });

    this.registerRule({
      name: 'array',
      validate: (value) => Array.isArray(value),
      message: 'Must be an array',
      code: 'INVALID_TYPE',
    });

    this.registerRule({
      name: 'object',
      validate: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
      message: 'Must be an object',
      code: 'INVALID_TYPE',
    });

    // 字符串验证
    this.registerRule({
      name: 'email',
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Must be a valid email address',
      code: 'INVALID_EMAIL',
    });

    this.registerRule({
      name: 'url',
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Must be a valid URL',
      code: 'INVALID_URL',
    });

    this.registerRule({
      name: 'phone',
      validate: (value) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Must be a valid phone number',
      code: 'INVALID_PHONE',
    });

    // 长度验证
    this.registerRule({
      name: 'minLength',
      validate: (value, context) => {
        const minLength = context?.minLength || 0;
        return value.length >= minLength;
      },
      message: (value, context) => `Must be at least ${context?.minLength || 0} characters`,
      code: 'TOO_SHORT',
    });

    this.registerRule({
      name: 'maxLength',
      validate: (value, context) => {
        const maxLength = context?.maxLength || Infinity;
        return value.length <= maxLength;
      },
      message: (value, context) => `Must be no more than ${context?.maxLength || 'unlimited'} characters`,
      code: 'TOO_LONG',
    });

    // 数值验证
    this.registerRule({
      name: 'min',
      validate: (value, context) => {
        const min = context?.min || -Infinity;
        return value >= min;
      },
      message: (value, context) => `Must be at least ${context?.min || 'unlimited'}`,
      code: 'TOO_SMALL',
    });

    this.registerRule({
      name: 'max',
      validate: (value, context) => {
        const max = context?.max || Infinity;
        return value <= max;
      },
      message: (value, context) => `Must be no more than ${context?.max || 'unlimited'}`,
      code: 'TOO_LARGE',
    });

    // 格式验证
    this.registerRule({
      name: 'pattern',
      validate: (value, context) => {
        const pattern = context?.pattern;
        if (!pattern) return true;
        const regex = new RegExp(pattern);
        return regex.test(value);
      },
      message: (value, context) => `Must match pattern: ${context?.pattern || 'unknown'}`,
      code: 'PATTERN_MISMATCH',
    });

    // 枚举验证
    this.registerRule({
      name: 'enum',
      validate: (value, context) => {
        const enumValues = context?.enum;
        if (!enumValues) return true;
        return enumValues.includes(value);
      },
      message: (value, context) => `Must be one of: ${context?.enum?.join(', ') || 'unknown'}`,
      code: 'INVALID_ENUM',
    });

    // 日期验证
    this.registerRule({
      name: 'date',
      validate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      message: 'Must be a valid date',
      code: 'INVALID_DATE',
    });

    this.registerRule({
      name: 'futureDate',
      validate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date > new Date();
      },
      message: 'Must be a future date',
      code: 'INVALID_FUTURE_DATE',
    });

    this.registerRule({
      name: 'pastDate',
      validate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date < new Date();
      },
      message: 'Must be a past date',
      code: 'INVALID_PAST_DATE',
    });

    // 文件验证
    this.registerRule({
      name: 'fileSize',
      validate: (value, context) => {
        const maxSize = context?.maxSize || Infinity;
        return value.size <= maxSize;
      },
      message: (value, context) => `File size must be no more than ${context?.maxSize || 'unlimited'} bytes`,
      code: 'FILE_TOO_LARGE',
    });

    this.registerRule({
      name: 'fileType',
      validate: (value, context) => {
        const allowedTypes = context?.allowedTypes || [];
        if (allowedTypes.length === 0) return true;
        return allowedTypes.includes(value.type);
      },
      message: (value, context) => `File type must be one of: ${context?.allowedTypes?.join(', ') || 'unknown'}`,
      code: 'INVALID_FILE_TYPE',
    });

    // 业务规则验证
    this.registerRule({
      name: 'unique',
      validate: async (value, context) => {
        const checkUnique = context?.checkUnique;
        if (!checkUnique) return true;
        return await checkUnique(value);
      },
      message: 'Value must be unique',
      code: 'NOT_UNIQUE',
    });

    this.registerRule({
      name: 'exists',
      validate: async (value, context) => {
        const checkExists = context?.checkExists;
        if (!checkExists) return true;
        return await checkExists(value);
      },
      message: 'Value must exist',
      code: 'NOT_EXISTS',
    });
  }
}

/**
 * 全局验证器实例
 */
export const validator = new Validator();

/**
 * 常用验证模式
 */
export const ValidationPatterns = {
  // 用户相关
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  CHINESE_NAME: /^[\u4e00-\u9fa5]{2,10}$/,
  
  // 业务相关
  REQUIREMENT_ID: /^REQ-\d{6}$/,
  VERSION: /^\d+\.\d+\.\d+$/,
  PHONE: /^1[3-9]\d{9}$/,
  
  // 系统相关
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
};

/**
 * 常用验证配置
 */
export const ValidationSchemas = {
  // 用户注册
  USER_REGISTRATION: {
    username: ['string', 'minLength', 'pattern'],
    email: ['string', 'email'],
    password: ['string', 'minLength', 'pattern'],
    confirmPassword: ['string', 'minLength'],
  },

  // 需求创建
  REQUIREMENT_CREATE: {
    title: ['string', 'minLength', 'maxLength'],
    description: ['string', 'minLength'],
    priority: ['enum'],
    status: ['enum'],
    assignee: ['string'],
    dueDate: ['date', 'futureDate'],
  },

  // 搜索参数
  SEARCH_PARAMS: {
    query: ['string', 'maxLength'],
    page: ['number', 'min'],
    limit: ['number', 'min', 'max'],
    sortBy: ['string', 'enum'],
    sortOrder: ['enum'],
  },
};

/**
 * 验证 Hook
 */
export function useValidation<T>(
  schema: Record<string, string[]>,
  initialData?: Partial<T>
) {
  const [data, setData] = React.useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = React.useState(false);

  const validate = React.useCallback(async (validationData?: Partial<T>) => {
    setIsValidating(true);
    try {
      const result = await validator.validateObject(
        validationData || data,
        schema
      );
      setErrors(result.errors);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [data, schema]);

  const validateField = React.useCallback(async (field: string, value: any) => {
    const fieldRules = schema[field];
    if (!fieldRules) return { valid: true, errors: [] };

    const result = await validator.validateValue(value, fieldRules, data);
    setErrors(prev => [
      ...prev.filter(error => error.field !== field),
      ...result.errors.map(error => ({ ...error, field })),
    ]);
    return result;
  }, [data, schema]);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = React.useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  return {
    data,
    setData,
    errors,
    isValidating,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  };
}

/**
 * 表单验证 Hook
 */
export function useFormValidation<T>(
  schema: Record<string, string[]>,
  onSubmit?: (data: T) => void | Promise<void>
) {
  const validation = useValidation<T>(schema);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await validation.validate();
    if (result.valid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(result.data as T);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validation, onSubmit]);

  return {
    ...validation,
    isSubmitting,
    handleSubmit,
  };
}

/**
 * 输入清理函数
 */
export const sanitizers = {
  // 清理 HTML 标签
  stripHtml: (value: string): string => {
    return value.replace(/<[^>]*>/g, '');
  },

  // 清理特殊字符
  stripSpecialChars: (value: string): string => {
    return value.replace(/[<>\"'&]/g, '');
  },

  // 清理多余空格
  trimWhitespace: (value: string): string => {
    return value.replace(/\s+/g, ' ').trim();
  },

  // 转换为小写
  toLowerCase: (value: string): string => {
    return value.toLowerCase();
  },

  // 转换为大写
  toUpperCase: (value: string): string => {
    return value.toUpperCase();
  },

  // 数字转换
  toNumber: (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  },

  // 布尔转换
  toBoolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  },
};

/**
 * 验证工具函数
 */
export const validationUtils = {
  // 检查是否为有效 JSON
  isValidJson: (value: string): boolean => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  // 检查是否为有效 URL
  isValidUrl: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // 检查是否为有效邮箱
  isValidEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // 检查是否为有效手机号
  isValidPhone: (value: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
  },

  // 检查密码强度
  getPasswordStrength: (password: string): {
    score: number;
    level: 'weak' | 'medium' | 'strong';
    feedback: string[];
  } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('至少8个字符');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('包含小写字母');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('包含大写字母');

    if (/\d/.test(password)) score += 1;
    else feedback.push('包含数字');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('包含特殊字符');

    let level: 'weak' | 'medium' | 'strong';
    if (score < 3) level = 'weak';
    else if (score < 5) level = 'medium';
    else level = 'strong';

    return { score, level, feedback };
  },
};