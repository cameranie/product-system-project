/**
 * 通用表单Hook
 * 
 * 提供表单的通用功能：验证、提交、重置等
 * 
 * @module useFormValidation
 */

import { useState, useCallback, useMemo } from 'react';
import { ValidationResult } from '@/lib/input-validation';

/**
 * 表单字段配置
 */
interface FormFieldConfig<T> {
  /** 字段名 */
  name: keyof T;
  /** 验证函数 */
  validator?: (value: any) => ValidationResult;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 转换函数 */
  transform?: (value: any) => any;
}

/**
 * 表单Hook的配置
 */
interface UseFormConfig<T> {
  /** 初始值 */
  initialValues?: Partial<T>;
  /** 字段配置 */
  fields?: FormFieldConfig<T>[];
  /** 提交函数 */
  onSubmit?: (values: T) => Promise<void> | void;
  /** 验证模式 */
  validateMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

/**
 * 表单字段状态
 */
interface FormFieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * 表单Hook的返回值
 */
interface UseFormReturn<T> {
  /** 表单值 */
  values: Partial<T>;
  /** 表单错误 */
  errors: Partial<Record<keyof T, string>>;
  /** 字段状态 */
  fieldStates: Partial<Record<keyof T, FormFieldState>>;
  /** 是否正在提交 */
  isSubmitting: boolean;
  /** 是否有效 */
  isValid: boolean;
  /** 是否已修改 */
  isDirty: boolean;
  /** 设置字段值 */
  setValue: (name: keyof T, value: any) => void;
  /** 设置多个字段值 */
  setValues: (values: Partial<T>) => void;
  /** 获取字段值 */
  getValue: (name: keyof T) => any;
  /** 设置字段错误 */
  setError: (name: keyof T, error: string) => void;
  /** 清除字段错误 */
  clearError: (name: keyof T) => void;
  /** 验证字段 */
  validateField: (name: keyof T) => boolean;
  /** 验证所有字段 */
  validateForm: () => boolean;
  /** 重置表单 */
  resetForm: () => void;
  /** 提交表单 */
  submitForm: () => Promise<void>;
  /** 处理字段变化 */
  handleChange: (name: keyof T) => (value: any) => void;
  /** 处理字段失焦 */
  handleBlur: (name: keyof T) => () => void;
}

/**
 * 通用表单Hook
 * 
 * @param config 配置选项
 * @returns 表单相关的状态和方法
 */
export function useForm<T extends Record<string, any>>({
  initialValues = {},
  fields = [],
  onSubmit,
  validateMode = 'onSubmit',
}: UseFormConfig<T>): UseFormReturn<T> {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [fieldStates, setFieldStates] = useState<Partial<Record<keyof T, FormFieldState>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化字段状态
  const initializeFieldStates = useCallback(() => {
    const states: Partial<Record<keyof T, FormFieldState>> = {};
    fields.forEach(field => {
      const value = values[field.name] ?? field.defaultValue;
      states[field.name] = {
        value,
        touched: false,
        dirty: false,
      };
    });
    setFieldStates(states);
  }, [fields, values]);

  // 计算表单状态
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && fields.every(field => {
      if (field.required) {
        const value = values[field.name];
        return value !== undefined && value !== null && value !== '';
      }
      return true;
    });
  }, [errors, fields, values]);

  const isDirty = useMemo(() => {
    return Object.values(fieldStates).some(state => state?.dirty || false);
  }, [fieldStates]);

  // 设置字段值
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 更新字段状态
    setFieldStates(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        dirty: true,
      },
    }));

    // 根据验证模式进行验证
    if (validateMode === 'onChange') {
      validateField(name);
    }
  }, [validateMode]);

  // 设置多个字段值
  const setValuesCallback = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    
    // 更新字段状态
    setFieldStates(prev => {
      const newStates = { ...prev };
      Object.keys(newValues).forEach(key => {
        const fieldName = key as keyof T;
        newStates[fieldName] = {
          ...newStates[fieldName],
          value: newValues[fieldName],
          dirty: true,
        };
      });
      return newStates;
    });
  }, []);

  // 获取字段值
  const getValue = useCallback((name: keyof T) => {
    return values[name];
  }, [values]);

  // 设置字段错误
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // 清除字段错误
  const clearError = useCallback((name: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // 验证单个字段
  const validateField = useCallback((name: keyof T): boolean => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;

    const value = values[name];
    
    // 必填验证
    if (field.required && (value === undefined || value === null || value === '')) {
      setError(name, `${String(name)}是必填项`);
      return false;
    }

    // 自定义验证
    if (field.validator && value !== undefined && value !== null && value !== '') {
      const result = field.validator(value);
      if (!result.valid) {
        setError(name, result.error || '验证失败');
        return false;
      }
    }

    // 清除错误
    clearError(name);
    return true;
  }, [fields, values, setError, clearError]);

  // 验证所有字段
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field.name)) {
        isValid = false;
      }
    });

    return isValid;
  }, [fields, validateField]);

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setFieldStates({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 提交表单
  const submitForm = useCallback(async () => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    
    try {
      // 验证表单
      if (!validateForm()) {
        return;
      }

      // 转换数据
      const transformedValues = { ...values };
      fields.forEach(field => {
        if (field.transform && values[field.name] !== undefined) {
          transformedValues[field.name] = field.transform(values[field.name]);
        }
      });

      await onSubmit(transformedValues as T);
    } catch (error) {
      console.error('表单提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm, values, fields]);

  // 处理字段变化
  const handleChange = useCallback((name: keyof T) => (value: any) => {
    setValue(name, value);
  }, [setValue]);

  // 处理字段失焦
  const handleBlur = useCallback((name: keyof T) => () => {
    setFieldStates(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
      },
    }));

    if (validateMode === 'onBlur') {
      validateField(name);
    }
  }, [validateMode, validateField]);

  return {
    values,
    errors,
    fieldStates,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues: setValuesCallback,
    getValue,
    setError,
    clearError,
    validateField,
    validateForm,
    resetForm,
    submitForm,
    handleChange,
    handleBlur,
  };
}

/**
 * 表单字段Hook
 * 
 * 用于单个表单字段的状态管理
 */
export function useFormField<T>(
  name: keyof T,
  form: UseFormReturn<T>
) {
  const value = form.getValue(name);
  const error = form.errors[name];
  const fieldState = form.fieldStates[name];

  return {
    value,
    error,
    touched: fieldState?.touched || false,
    dirty: fieldState?.dirty || false,
    onChange: form.handleChange(name),
    onBlur: form.handleBlur(name),
    setValue: (val: any) => form.setValue(name, val),
    setError: (err: string) => form.setError(name, err),
    clearError: () => form.clearError(name),
    validate: () => form.validateField(name),
  };
}


