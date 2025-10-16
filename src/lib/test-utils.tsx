/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 测试工具库
 * 
 * P3 功能：提供统一的测试工具和模拟
 * 
 * 功能特性：
 * - React 组件测试工具
 * - API 模拟工具
 * - 数据生成工具
 * - 断言工具
 * - 测试环境设置
 * 
 * @module test-utils
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundaryProvider } from '@/components/error-boundary';
import { logger } from './logger';

/**
 * 测试提供者组件
 */
interface TestProvidersProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
}

export function TestProviders({ children, theme = 'light' }: TestProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
      <ErrorBoundaryProvider>
        {children}
      </ErrorBoundaryProvider>
    </ThemeProvider>
  );
}

/**
 * 自定义渲染函数
 */
export function customRender(
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & { theme?: 'light' | 'dark' | 'system' } = {}
) {
  const { theme, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    return <TestProviders theme={theme}>{children}</TestProviders>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * 模拟数据生成器
 */
export const mockData = {
  /**
   * 生成用户数据
   */
  user: (overrides: Partial<any> = {}) => ({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * 生成需求数据
   */
  requirement: (overrides: Partial<any> = {}) => ({
    id: 'REQ-001',
    title: 'Test Requirement',
    description: 'Test requirement description',
    priority: 'medium',
    status: 'draft',
    assignee: 'testuser',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * 生成API响应数据
   */
  apiResponse: <T,>(data: T, overrides: Partial<Record<string, unknown>> = {}) => ({
    success: true,
    data,
    message: 'Success',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * 生成错误响应
   */
  apiError: (message: string = 'Test error', code: string = 'TEST_ERROR') => ({
    success: false,
    error: {
      code,
      message,
      details: {},
    },
    timestamp: new Date().toISOString(),
  }),

  /**
   * 生成分页数据
   */
  paginatedData: <T,>(items: T[], page: number = 1, size: number = 10) => ({
    items,
    pagination: {
      page,
      size,
      total: items.length,
      totalPages: Math.ceil(items.length / size),
      hasNext: page < Math.ceil(items.length / size),
      hasPrev: page > 1,
    },
  }),
};

/**
 * API 模拟工具
 */
export const apiMocks = {
  /**
   * 模拟成功响应
   */
  success: <T,>(data: T, delay: number = 0) => {
    return new Promise<{ data: T }>((resolve) => {
      setTimeout(() => {
        resolve({ data });
      }, delay);
    });
  },

  /**
   * 模拟错误响应
   */
  error: (message: string = 'Test error', status: number = 500, delay: number = 0) => {
    return new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(message));
      }, delay);
    });
  },

  /**
   * 模拟网络错误
   */
  networkError: (delay: number = 0) => {
    return new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Network error'));
      }, delay);
    });
  },

  /**
   * 模拟超时
   */
  timeout: (delay: number = 5000) => {
    return new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, delay);
    });
  },
};

/**
 * 测试断言工具
 */
export const testAssertions = {
  /**
   * 检查组件是否渲染
   */
  expectToRender: (component: React.ReactElement) => {
    const { container } = render(component);
    expect(container.firstChild).toBeTruthy();
  },

  /**
   * 检查组件是否包含文本
   */
  expectToHaveText: (component: React.ReactElement, text: string) => {
    const { getByText } = render(component);
    expect(getByText(text)).toBeTruthy();
  },

  /**
   * 检查组件是否包含类名
   */
  expectToHaveClass: (component: React.ReactElement, className: string) => {
    const { container } = render(component);
    expect((container.firstChild as HTMLElement)?.className).toContain(className);
  },

  /**
   * 检查异步操作
   */
  expectAsyncToResolve: async <T,>(promise: Promise<T>): Promise<T> => {
    await expect(promise).resolves.toBeDefined();
    return promise;
  },

  /**
   * 检查异步操作失败
   */
  expectAsyncToReject: async (promise: Promise<any>) => {
    return expect(promise).rejects.toThrow();
  },
};

/**
 * 测试环境设置
 */
export const testSetup = {
  /**
   * 设置测试环境变量
   */
  setEnv: (env: Record<string, string>) => {
    Object.keys(env).forEach(key => {
      process.env[key] = env[key];
    });
  },

  /**
   * 清理测试环境
   */
  cleanup: () => {
    // 清理 DOM
    document.body.innerHTML = '';
    
    // 清理 localStorage
    localStorage.clear();
    
    // 清理 sessionStorage
    sessionStorage.clear();
    
    // 重置环境变量（process.env 属性是只读的，无法删除）
    // delete process.env.NODE_ENV;
  },

  /**
   * 模拟浏览器 API
   */
  mockBrowserAPIs: () => {
    // 模拟 window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // 模拟 IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // 模拟 ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  },
};

/**
 * 测试数据生成器
 */
export const dataGenerators = {
  /**
   * 生成随机字符串
   */
  randomString: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 生成随机数字
   */
  randomNumber: (min: number = 0, max: number = 100): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 生成随机日期
   */
  randomDate: (start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  /**
   * 生成随机邮箱
   */
  randomEmail: (): string => {
    const domains = ['example.com', 'test.com', 'demo.org'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${dataGenerators.randomString(8)}@${domain}`;
  },

  /**
   * 生成随机手机号
   */
  randomPhone: (): string => {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  },

  /**
   * 生成随机数组
   */
  randomArray: <T>(generator: () => T, length: number = 5): T[] => {
    return Array.from({ length }, generator);
  },

  /**
   * 生成随机对象
   */
  randomObject: (keys: string[] = ['id', 'name', 'value']): Record<string, any> => {
    const obj: Record<string, any> = {};
    keys.forEach(key => {
      obj[key] = dataGenerators.randomString();
    });
    return obj;
  },
};

/**
 * 测试 Hook 工具
 */
export const testHooks = {
  /**
   * 测试异步 Hook
   */
  testAsyncHook: async <T>(
    hook: () => T,
    timeout: number = 5000
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Hook test timeout'));
      }, timeout);

      try {
        const result = hook();
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  },

  /**
   * 测试 Hook 状态变化
   */
  testHookStateChange: <T>(
    hook: () => T,
    expectedStates: T[]
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      let currentIndex = 0;
      
      const checkState = () => {
        try {
          const currentState = hook();
          if (currentState === expectedStates[currentIndex]) {
            currentIndex++;
            if (currentIndex >= expectedStates.length) {
              resolve();
            } else {
              setTimeout(checkState, 100);
            }
          } else {
            reject(new Error(`Expected state ${expectedStates[currentIndex]}, got ${currentState}`));
          }
        } catch (error) {
          reject(error);
        }
      };

      checkState();
    });
  },
};

/**
 * 测试性能工具
 */
export const performanceTest = {
  /**
   * 测量函数执行时间
   */
  measureTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * 检查性能是否在阈值内
   */
  expectPerformance: (duration: number, threshold: number = 1000): void => {
    expect(duration).toBeLessThan(threshold);
  },

  /**
   * 内存使用检查
   */
  checkMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  },
};

/**
 * 测试日志工具
 */
export const testLogger = {
  /**
   * 模拟日志记录
   */
  mockLogger: () => {
    const mockLog = jest.fn();
    const mockError = jest.fn();
    const mockWarn = jest.fn();
    const mockInfo = jest.fn();

    jest.spyOn(logger, 'debug').mockImplementation(mockLog);
    jest.spyOn(logger, 'info').mockImplementation(mockInfo);
    jest.spyOn(logger, 'warn').mockImplementation(mockWarn);
    jest.spyOn(logger, 'error').mockImplementation(mockError);

    return {
      mockLog,
      mockError,
      mockWarn,
      mockInfo,
      restore: () => {
        jest.restoreAllMocks();
      },
    };
  },

  /**
   * 检查日志调用
   */
  expectLogCalled: (mockFn: jest.Mock, expectedMessage: string): void => {
    expect(mockFn).toHaveBeenCalledWith(
      expect.stringContaining(expectedMessage),
      expect.any(Object)
    );
  },
};

/**
 * 测试清理工具
 */
export const testCleanup = {
  /**
   * 清理所有模拟
   */
  cleanupMocks: () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  },

  /**
   * 清理 DOM
   */
  cleanupDOM: () => {
    document.body.innerHTML = '';
  },

  /**
   * 清理存储
   */
  cleanupStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
  },

  /**
   * 清理定时器
   */
  cleanupTimers: () => {
    jest.clearAllTimers();
    jest.useRealTimers();
  },

  /**
   * 全面清理
   */
  fullCleanup: () => {
    testCleanup.cleanupMocks();
    testCleanup.cleanupDOM();
    testCleanup.cleanupStorage();
    testCleanup.cleanupTimers();
  },
};

// 重新导出测试库
export * from '@testing-library/react';
export { customRender as render };









