// 统一错误处理工具

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly details: any;

  constructor(message: string, code = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

// 网络错误处理
export function handleNetworkError(error: any): ErrorInfo {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: '网络连接失败，请检查网络设置',
      code: 'NETWORK_ERROR',
      details: error
    };
  }
  
  if (error.name === 'AbortError') {
    return {
      message: '请求超时，请重试',
      code: 'TIMEOUT_ERROR',
      details: error
    };
  }
  
  return {
    message: '网络请求失败',
    code: 'REQUEST_ERROR',
    details: error
  };
}

// 文件操作错误处理
export function handleFileError(error: any): ErrorInfo {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return {
        message: '文件访问被拒绝，请检查权限设置',
        code: 'FILE_ACCESS_DENIED',
        details: error
      };
    }
    
    if (error.name === 'NotFoundError') {
      return {
        message: '文件不存在或已被删除',
        code: 'FILE_NOT_FOUND',
        details: error
      };
    }
  }
  
  return {
    message: '文件操作失败',
    code: 'FILE_ERROR',
    details: error
  };
}

// 数据验证错误处理
export function handleValidationError(field: string, value: unknown, expectedType?: string): ErrorInfo {
  return {
    message: `${field}字段验证失败${expectedType ? `，期望类型：${expectedType}` : ''}`,
    code: 'VALIDATION_ERROR',
    details: { field, value, expectedType }
  };
}

// 通用错误处理函数
export function handleError(error: unknown, context?: string): ErrorInfo {
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof TypeError) {
    return handleNetworkError(error);
  }
  
  if (error instanceof DOMException) {
    return handleFileError(error);
  }
  
  if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
    const status = (error.response as { status: number }).status;
    switch (status) {
      case 400:
        return {
          message: '请求参数错误',
          code: 'BAD_REQUEST',
          details: error
        };
      case 401:
        return {
          message: '未授权访问，请重新登录',
          code: 'UNAUTHORIZED',
          details: error
        };
      case 403:
        return {
          message: '权限不足',
          code: 'FORBIDDEN',
          details: error
        };
      case 404:
        return {
          message: '请求的资源不存在',
          code: 'NOT_FOUND',
          details: error
        };
      case 500:
        return {
          message: '服务器内部错误',
          code: 'INTERNAL_ERROR',
          details: error
        };
      default:
        return {
          message: `服务器错误 (${status})`,
          code: 'SERVER_ERROR',
          details: error
        };
    }
  }
  
  return {
    message: (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') ? error.message : '未知错误',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

// 异步操作包装器，提供统一的错误处理
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: ErrorInfo }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    return { error: handleError(error, context) };
  }
}

// 重试机制
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw error;
      }
      
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
} 