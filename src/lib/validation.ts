// 输入验证工具
import { VALIDATION_CONFIG, REGEX_PATTERNS, STATUS_CONFIG } from '@/config/constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// 基础验证函数
export function validateRequired(value: unknown, fieldName: string): FieldValidationResult {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: `${fieldName}不能为空`
    };
  }
  return { isValid: true };
}

export function validateLength(
  value: string, 
  fieldName: string, 
  min?: number, 
  max?: number
): FieldValidationResult {
  if (min !== undefined && value.length < min) {
    return {
      isValid: false,
      error: `${fieldName}长度不能少于${min}个字符`
    };
  }
  
  if (max !== undefined && value.length > max) {
    return {
      isValid: false,
      error: `${fieldName}长度不能超过${max}个字符`
    };
  }
  
  return { isValid: true };
}

export function validatePattern(
  value: string, 
  pattern: RegExp, 
  fieldName: string, 
  errorMessage?: string
): FieldValidationResult {
  if (!pattern.test(value)) {
    return {
      isValid: false,
      error: errorMessage || `${fieldName}格式不正确`
    };
  }
  return { isValid: true };
}

export function validateEnum<T extends string>(
  value: string, 
  allowedValues: readonly T[], 
  fieldName: string
): FieldValidationResult {
  if (!allowedValues.includes(value as T)) {
    return {
      isValid: false,
      error: `${fieldName}必须是以下值之一：${allowedValues.join(', ')}`
    };
  }
  return { isValid: true };
}

// 需求相关验证
export function validateRequirementTitle(title: string): FieldValidationResult {
  const requiredResult = validateRequired(title, '需求标题');
  if (!requiredResult.isValid) return requiredResult;
  
  return validateLength(
    title.trim(), 
    '需求标题', 
    VALIDATION_CONFIG.MIN_TITLE_LENGTH, 
    VALIDATION_CONFIG.MAX_TITLE_LENGTH
  );
}

export function validateRequirementDescription(description: string): FieldValidationResult {
  const requiredResult = validateRequired(description, '需求描述');
  if (!requiredResult.isValid) return requiredResult;
  
  return validateLength(
    description.trim(), 
    '需求描述', 
    VALIDATION_CONFIG.MIN_DESCRIPTION_LENGTH, 
    VALIDATION_CONFIG.MAX_DESCRIPTION_LENGTH
  );
}

export function validateRequirementType(type: string): FieldValidationResult {
  const allowedTypes = ['新功能', '优化', 'BUG', '用户反馈', '商务需求'] as const;
  return validateEnum(type, allowedTypes, '需求类型');
}

export function validatePriority(priority: string): FieldValidationResult {
  const allowedPriorities = Object.values(STATUS_CONFIG.PRIORITY_LEVELS);
  return validateEnum(priority, allowedPriorities, '优先级');
}

export function validateNeedToDo(needToDo: string): FieldValidationResult {
  const allowedValues = Object.values(STATUS_CONFIG.NEED_TO_DO);
  return validateEnum(needToDo, allowedValues, '是否要做');
}

export function validatePlatforms(platforms: string[]): FieldValidationResult {
  if (!platforms || platforms.length === 0) {
    return {
      isValid: false,
      error: '至少需要选择一个应用端'
    };
  }
  
  const allowedPlatforms = ['Web端', 'PC端', '移动端', 'iOS', 'Android'];
  for (const platform of platforms) {
    if (!allowedPlatforms.includes(platform)) {
      return {
        isValid: false,
        error: `不支持的应用端：${platform}`
      };
    }
  }
  
  return { isValid: true };
}

export function validateTags(tags: string[]): FieldValidationResult {
  if (tags.length > VALIDATION_CONFIG.MAX_TAGS_COUNT) {
    return {
      isValid: false,
      error: `标签数量不能超过${VALIDATION_CONFIG.MAX_TAGS_COUNT}个`
    };
  }
  
  for (const tag of tags) {
    if (tag.length > VALIDATION_CONFIG.MAX_TAG_LENGTH) {
      return {
        isValid: false,
        error: `标签"${tag}"长度不能超过${VALIDATION_CONFIG.MAX_TAG_LENGTH}个字符`
      };
    }
  }
  
  return { isValid: true };
}

// 文件验证
export function validateFileName(fileName: string): FieldValidationResult {
  if (fileName.length > VALIDATION_CONFIG.MAX_FILENAME_LENGTH) {
    return {
      isValid: false,
      error: `文件名长度不能超过${VALIDATION_CONFIG.MAX_FILENAME_LENGTH}个字符`
    };
  }
  
  if (REGEX_PATTERNS.UNSAFE_FILENAME.test(fileName)) {
    return {
      isValid: false,
      error: '文件名包含不安全的字符'
    };
  }
  
  if (REGEX_PATTERNS.PATH_TRAVERSAL.test(fileName)) {
    return {
      isValid: false,
      error: '文件名不能包含路径遍历字符'
    };
  }
  
  return { isValid: true };
}

// 评论验证
export function validateComment(content: string): FieldValidationResult {
  const requiredResult = validateRequired(content, '评论内容');
  if (!requiredResult.isValid) return requiredResult;
  
  return validateLength(content.trim(), '评论内容', 1, 1000);
}

// 用户信息验证
export function validateEmail(email: string): FieldValidationResult {
  const requiredResult = validateRequired(email, '邮箱');
  if (!requiredResult.isValid) return requiredResult;
  
  return validatePattern(email, REGEX_PATTERNS.EMAIL, '邮箱', '请输入有效的邮箱地址');
}

// 综合验证函数
export function validateRequirement(data: {
  title: string;
  description: string;
  type: string;
  platforms: string[];
  tags?: string[];
  priority?: string;
  needToDo?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // 验证标题
  const titleResult = validateRequirementTitle(data.title);
  if (!titleResult.isValid && titleResult.error) {
    errors.push(titleResult.error);
  }
  
  // 验证描述
  const descriptionResult = validateRequirementDescription(data.description);
  if (!descriptionResult.isValid && descriptionResult.error) {
    errors.push(descriptionResult.error);
  }
  
  // 验证类型
  const typeResult = validateRequirementType(data.type);
  if (!typeResult.isValid && typeResult.error) {
    errors.push(typeResult.error);
  }
  
  // 验证应用端
  const platformsResult = validatePlatforms(data.platforms);
  if (!platformsResult.isValid && platformsResult.error) {
    errors.push(platformsResult.error);
  }
  
  // 验证标签（可选）
  if (data.tags) {
    const tagsResult = validateTags(data.tags);
    if (!tagsResult.isValid && tagsResult.error) {
      errors.push(tagsResult.error);
    }
  }
  
  // 验证优先级（可选）
  if (data.priority) {
    const priorityResult = validatePriority(data.priority);
    if (!priorityResult.isValid && priorityResult.error) {
      errors.push(priorityResult.error);
    }
  }
  
  // 验证是否要做（可选）
  if (data.needToDo) {
    const needToDoResult = validateNeedToDo(data.needToDo);
    if (!needToDoResult.isValid && needToDoResult.error) {
      errors.push(needToDoResult.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 实时验证Hook辅助函数
export function createFieldValidator<T>(
  validator: (value: T) => FieldValidationResult
) {
  return (value: T) => {
    const result = validator(value);
    return {
      isValid: result.isValid,
      error: result.error || null
    };
  };
}

// 常用验证器
export const validators = {
  title: createFieldValidator(validateRequirementTitle),
  description: createFieldValidator(validateRequirementDescription),
  type: createFieldValidator(validateRequirementType),
  priority: createFieldValidator(validatePriority),
  needToDo: createFieldValidator(validateNeedToDo),
  platforms: createFieldValidator(validatePlatforms),
  tags: createFieldValidator(validateTags),
  comment: createFieldValidator(validateComment),
  email: createFieldValidator(validateEmail),
  fileName: createFieldValidator(validateFileName)
}; 