/**
 * 文件上传工具函数
 * 提供文件类型验证、大小限制、安全检查等功能
 */

// 文件上传相关的工具函数和验证

// 允许所有文件类型上传
export const ALLOWED_FILE_TYPES: string[] = [];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 10;

export interface FileValidationConfig {
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

export interface FileValidationResult {
  validFiles: File[];
  errors: string[];
}

const DEFAULT_CONFIG: Required<FileValidationConfig> = {
  allowedTypes: ALLOWED_FILE_TYPES,
  maxFileSize: MAX_FILE_SIZE,
  maxFiles: MAX_FILES
};

export function validateFiles(
  files: File[],
  existingFilesCount: number = 0,
  config: FileValidationConfig = {}
): FileValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const validFiles: File[] = [];
  const errors: string[] = [];

  if (existingFilesCount + files.length > finalConfig.maxFiles) {
    errors.push(`最多只能上传 ${finalConfig.maxFiles} 个文件`);
    return { validFiles: [], errors };
  }

  files.forEach(file => {
    // 如果 allowedTypes 为空数组，则允许所有类型
    if (finalConfig.allowedTypes.length > 0 && !finalConfig.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.name}`);
      return;
    }
    if (file.size > finalConfig.maxFileSize) {
      const maxSizeMB = Math.round(finalConfig.maxFileSize / (1024 * 1024));
      errors.push(`文件过大: ${file.name} (最大${maxSizeMB}MB)`);
      return;
    }
    if (file.name.includes('../') || file.name.includes('..\\') || file.name.includes('..')) {
      errors.push(`不安全的文件名: ${file.name}`);
      return;
    }
    if (file.name.length > 255) {
      errors.push(`文件名过长: ${file.name}`);
      return;
    }
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(file.name)) {
      errors.push(`文件名包含非法字符: ${file.name}`);
      return;
    }
    validFiles.push(file);
  });

  return { validFiles, errors };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 文件签名（Magic Number）映射
 * 用于验证文件真实类型，防止MIME类型欺骗
 */
const FILE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/zip': [0x50, 0x4B, 0x03, 0x04],
  'application/x-rar-compressed': [0x52, 0x61, 0x72, 0x21],
};

/**
 * 验证文件真实类型（通过文件头）
 * 
 * 防止MIME类型欺骗攻击，通过读取文件的前几个字节（Magic Number）
 * 来验证文件的真实类型是否与声明的MIME类型匹配
 * 
 * @param file - 待验证的文件
 * @returns 文件类型是否匹配
 * 
 * @example
 * ```typescript
 * const file = new File([...], 'image.jpg', { type: 'image/jpeg' });
 * const isValid = await validateFileSignature(file);
 * // true 如果文件确实是JPEG格式
 * // false 如果文件被伪装成JPEG但实际不是
 * ```
 */
export async function validateFileSignature(file: File): Promise<boolean> {
  try {
    // 读取文件的前4个字节
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // 获取该MIME类型的签名
    const signature = FILE_SIGNATURES[file.type];
    
    // 如果没有定义签名，跳过验证（信任MIME类型）
    if (!signature) {
      return true;
    }
    
    // 验证文件头是否匹配签名
    return signature.every((byte, index) => bytes[index] === byte);
  } catch (error) {
    console.error('文件签名验证失败:', error);
    // 验证失败时拒绝文件
    return false;
  }
}

/**
 * 增强的文件验证
 * 
 * 在原有验证基础上，增加文件签名验证
 * 
 * @param files - 待验证的文件列表
 * @param existingFilesCount - 已有文件数量
 * @param config - 验证配置
 * @returns 验证结果（包含有效文件和错误信息）
 */
export async function validateFilesEnhanced(
  files: File[],
  existingFilesCount: number = 0,
  config: FileValidationConfig = {}
): Promise<FileValidationResult> {
  // 先进行基础验证
  const basicValidation = validateFiles(files, existingFilesCount, config);
  
  // 如果基础验证失败，直接返回
  if (basicValidation.errors.length > 0) {
    return basicValidation;
  }
  
  // 对通过基础验证的文件进行签名验证
  const validFiles: File[] = [];
  const errors: string[] = [];
  
  for (const file of basicValidation.validFiles) {
    // 验证文件签名
    const isValidSignature = await validateFileSignature(file);
    
    if (!isValidSignature) {
      errors.push(`文件类型验证失败: ${file.name} (文件内容与声明类型不匹配)`);
    } else {
      validFiles.push(file);
    }
  }
  
  return { validFiles, errors };
}

// 内存管理相关函数
export class FileURLManager {
  private static urls = new Set<string>();

  static createObjectURL(file: File): string {
    const url = URL.createObjectURL(file);
    this.urls.add(url);
    return url;
  }

  static revokeObjectURL(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  static revokeAllURLs(): void {
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}

// 导出公共工具函数（从common-utils重新导出，保持向后兼容）
export { generateSecureId, generateRequirementId, formatDateTime } from './common-utils'; 