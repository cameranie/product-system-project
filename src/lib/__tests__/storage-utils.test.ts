/**
 * storage-utils 单元测试
 * 
 * P0 测试覆盖：localStorage 安全操作工具
 * 目标覆盖率：≥90%
 */

import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeClear,
  clearByPrefix,
  arrayValidator,
  objectValidator,
  stringValidator,
  enumValidator,
} from '../storage-utils';

describe('storage-utils', () => {
  beforeEach(() => {
    // 清空 localStorage mock
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('safeGetItem', () => {
    it('应该在键不存在时返回默认值', () => {
      const result = safeGetItem('nonexistent-key', 'default-value');
      expect(result).toBe('default-value');
    });

    it('应该成功解析有效的 JSON 数据', () => {
      const testData = { foo: 'bar', count: 123 };
      localStorage.setItem('test-key', JSON.stringify(testData));
      
      const result = safeGetItem('test-key', {});
      expect(result).toEqual(testData);
    });

    it('应该在 JSON 解析失败时返回默认值', () => {
      localStorage.setItem('invalid-json', 'this is not json');
      
      const result = safeGetItem('invalid-json', 'default');
      expect(result).toBe('default');
    });

    it('应该在验证失败时返回默认值', () => {
      localStorage.setItem('test-array', JSON.stringify(['valid', 'array']));
      
      // 使用对象验证器，期望失败
      const validator = objectValidator(['key1', 'key2']);
      const result = safeGetItem('test-array', {}, validator);
      
      expect(result).toEqual({});
    });

    it('应该在验证通过时返回解析后的数据', () => {
      const testData = ['item1', 'item2', 'item3'];
      localStorage.setItem('test-array', JSON.stringify(testData));
      
      const validator = arrayValidator((item): item is string => typeof item === 'string');
      const result = safeGetItem('test-array', [], validator);
      
      expect(result).toEqual(testData);
    });

    it('应该处理空值', () => {
      localStorage.setItem('null-value', 'null');
      
      const result = safeGetItem('null-value', 'default');
      expect(result).toBe('default');
    });
  });

  describe('safeSetItem', () => {
    it('应该成功保存简单数据', () => {
      const success = safeSetItem('test-key', 'test-value');
      
      expect(success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('test-value')
      );
    });

    it('应该成功保存对象数据', () => {
      const testData = { name: 'John', age: 30 };
      const success = safeSetItem('user-data', testData);
      
      expect(success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user-data',
        JSON.stringify(testData)
      );
    });

    it('应该成功保存数组数据', () => {
      const testArray = [1, 2, 3, 4, 5];
      const success = safeSetItem('numbers', testArray);
      
      expect(success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'numbers',
        JSON.stringify(testArray)
      );
    });

    it('应该在序列化失败时返回 false', () => {
      // 创建一个循环引用的对象
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const success = safeSetItem('circular', circularObj);
      
      expect(success).toBe(false);
    });
  });

  describe('safeRemoveItem', () => {
    it('应该成功删除存在的键', () => {
      localStorage.setItem('test-key', 'test-value');
      
      safeRemoveItem('test-key');
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('应该安全地处理不存在的键', () => {
      expect(() => {
        safeRemoveItem('nonexistent-key');
      }).not.toThrow();
    });
  });

  describe('safeClear', () => {
    it('应该清空所有 localStorage 数据', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      safeClear();
      
      expect(localStorage.clear).toHaveBeenCalled();
    });
  });

  describe('clearByPrefix', () => {
    it('应该只删除匹配前缀的键', () => {
      // Mock localStorage.getItem 返回 keys
      const mockKeys = ['app-config', 'app-user', 'other-data', 'app-settings'];
      
      // 重新实现 localStorage mock 以支持 key() 方法
      Object.defineProperty(localStorage, 'length', {
        get: jest.fn(() => mockKeys.length),
      });
      Object.defineProperty(localStorage, 'key', {
        value: jest.fn((index) => mockKeys[index]),
      });
      
      clearByPrefix('app-');
      
      // 应该删除 3 个 'app-' 开头的键
      expect(localStorage.removeItem).toHaveBeenCalledTimes(3);
      expect(localStorage.removeItem).toHaveBeenCalledWith('app-config');
      expect(localStorage.removeItem).toHaveBeenCalledWith('app-user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('app-settings');
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other-data');
    });
  });

  describe('验证器 (Validators)', () => {
    describe('arrayValidator', () => {
      it('应该验证有效的数组', () => {
        const validator = arrayValidator((item): item is string => typeof item === 'string');
        
        expect(validator.validate(['a', 'b', 'c'])).toBe(true);
      });

      it('应该拒绝包含无效项的数组', () => {
        const validator = arrayValidator((item): item is string => typeof item === 'string');
        
        expect(validator.validate(['a', 123, 'c'])).toBe(false);
      });

      it('应该拒绝非数组值', () => {
        const validator = arrayValidator((item): item is string => typeof item === 'string');
        
        expect(validator.validate('not an array')).toBe(false);
        expect(validator.validate(null)).toBe(false);
        expect(validator.validate({})).toBe(false);
      });
    });

    describe('objectValidator', () => {
      it('应该验证包含所有必需键的对象', () => {
        const validator = objectValidator<{ name: string; age: number }>(['name', 'age']);
        
        expect(validator.validate({ name: 'John', age: 30 })).toBe(true);
      });

      it('应该拒绝缺少键的对象', () => {
        const validator = objectValidator<{ name: string; age: number }>(['name', 'age']);
        
        expect(validator.validate({ name: 'John' })).toBe(false);
      });

      it('应该拒绝非对象值', () => {
        const validator = objectValidator(['key']);
        
        expect(validator.validate('string')).toBe(false);
        expect(validator.validate(null)).toBe(false);
        expect(validator.validate([])).toBe(false);
      });

      it('应该接受包含额外键的对象', () => {
        const validator = objectValidator<{ name: string }>(['name']);
        
        expect(validator.validate({ name: 'John', extra: 'field' })).toBe(true);
      });
    });

    describe('stringValidator', () => {
      it('应该验证字符串值', () => {
        const validator = stringValidator();
        
        expect(validator.validate('hello')).toBe(true);
        expect(validator.validate('')).toBe(true);
      });

      it('应该拒绝非字符串值', () => {
        const validator = stringValidator();
        
        expect(validator.validate(123)).toBe(false);
        expect(validator.validate(null)).toBe(false);
        expect(validator.validate(undefined)).toBe(false);
        expect(validator.validate({})).toBe(false);
      });
    });

    describe('enumValidator', () => {
      it('应该验证枚举中的值', () => {
        const validator = enumValidator(['red', 'green', 'blue']);
        
        expect(validator.validate('red')).toBe(true);
        expect(validator.validate('green')).toBe(true);
        expect(validator.validate('blue')).toBe(true);
      });

      it('应该拒绝不在枚举中的值', () => {
        const validator = enumValidator(['red', 'green', 'blue']);
        
        expect(validator.validate('yellow')).toBe(false);
        expect(validator.validate('RED')).toBe(false);
        expect(validator.validate('')).toBe(false);
      });
    });
  });

  describe('边界条件和异常处理', () => {
    it('应该处理 localStorage 不可用的情况', () => {
      // 模拟 localStorage 不可用
      const originalLocalStorage = global.localStorage;
      delete (global as any).localStorage;
      
      const result = safeGetItem('any-key', 'default');
      expect(result).toBe('default');
      
      // 恢复 localStorage
      global.localStorage = originalLocalStorage;
    });

    it('应该处理超大数据（quota exceeded）', () => {
      // Mock setItem 抛出 QuotaExceededError
      const mockSetItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError');
      });
      localStorage.setItem = mockSetItem;
      
      const largeData = 'x'.repeat(10000000); // 10MB 字符串
      const success = safeSetItem('large-data', largeData);
      
      expect(success).toBe(false);
    });

    it('应该处理特殊字符的键名', () => {
      const specialKeys = [
        'key-with-dash',
        'key.with.dots',
        'key_with_underscore',
        'key:with:colons',
        'key/with/slashes',
      ];
      
      specialKeys.forEach(key => {
        expect(() => {
          safeSetItem(key, 'value');
          safeGetItem(key, 'default');
          safeRemoveItem(key);
        }).not.toThrow();
      });
    });
  });
});

