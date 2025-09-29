/**
 * 文件上传工具函数
 * 提供文件类型验证、大小限制、安全检查等功能
 */

export interface FileValidationConfig {
  allowedTypes?: string[];
  maxFileSize?: number; // bytes
  maxFiles?: number;
}

export interface FileValidationResult {
  validFiles: File[];
  errors: string[];
}

// 默认配置
const DEFAULT_CONFIG: Required<FileValidationConfig> = {
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
};

/**
 * 验证文件安全性和合规性
 * @param files 要验证的文件数组
 * @param existingFilesCount 已存在的文件数量
 * @param config 验证配置
 * @returns 验证结果
 */
export function validateFiles(
  files: File[],
  existingFilesCount: number = 0,
  config: FileValidationConfig = {}
): FileValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const validFiles: File[] = [];
  const errors: string[] = [];

  // 检查文件数量限制
  if (existingFilesCount + files.length > finalConfig.maxFiles) {
    errors.push(`最多只能上传 ${finalConfig.maxFiles} 个文件`);
    return { validFiles: [], errors };
  }

  files.forEach(file => {
    // 文件类型验证
    if (!finalConfig.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.name}`);
      return;
    }

    // 文件大小验证
    if (file.size > finalConfig.maxFileSize) {
      const maxSizeMB = Math.round(finalConfig.maxFileSize / (1024 * 1024));
      errors.push(`文件过大: ${file.name} (最大${maxSizeMB}MB)`);
      return;
    }

    // 文件名安全验证（防止路径遍历攻击）
    if (file.name.includes('../') || file.name.includes('..\\') || file.name.includes('..')) {
      errors.push(`不安全的文件名: ${file.name}`);
      return;
    }

    // 文件名长度验证
    if (file.name.length > 255) {
      errors.push(`文件名过长: ${file.name}`);
      return;
    }

    // 检查文件名是否包含特殊字符
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(file.name)) {
      errors.push(`文件名包含非法字符: ${file.name}`);
      return;
    }

    validFiles.push(file);
  });

  return { validFiles, errors };
}

/**
 * 格式化文件大小显示
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名（小写）
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * 检查是否为图片文件
 * @param file 文件对象
 * @returns 是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
} 