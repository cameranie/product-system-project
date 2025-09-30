/**
 * 文件上传工具函数
 * 提供文件类型验证、大小限制、安全检查等功能
 */

// 文件上传相关的工具函数和验证

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/bmp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
];

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
    if (!finalConfig.allowedTypes.includes(file.type)) {
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

// 生成安全的唯一ID
export function generateSecureId(): string {
  // 使用crypto.randomUUID如果可用，否则回退到时间戳+随机数
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 回退方案：使用更安全的随机数生成
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const extraRandom = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${extraRandom}`;
}

// 时间格式化工具函数
export function formatDateTime(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
} 