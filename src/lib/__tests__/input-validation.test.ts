/**
 * input-validation 单元测试
 * 
 * P0 测试覆盖：输入验证和安全检查
 * 目标覆盖率：≥90%
 */

import {
  validateSearchTerm,
  validatePriority,
  validateNeedToDo,
  validateReviewOpinion,
  validateIsOperational,
  validateRequirementIds,
  validateFilter,
  INPUT_LIMITS,
  ALLOWED_PRIORITIES,
  ALLOWED_NEED_TO_DO,
  ALLOWED_IS_OPERATIONAL,
} from '../input-validation';

describe('input-validation', () => {
  describe('validateSearchTerm', () => {
    it('应该接受有效的搜索词', () => {
      const validTerms = [
        '用户登录',
        '订单管理',
        'user profile',
        '123',
        'ABC-123',
      ];

      validTerms.forEach(term => {
        const result = validateSearchTerm(term);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(term);
      });
    });

    it('应该拒绝过长的搜索词', () => {
      const longTerm = 'a'.repeat(INPUT_LIMITS.SEARCH + 1);
      const result = validateSearchTerm(longTerm);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('长度不能超过');
    });

    it('应该检测 SQL 注入尝试', () => {
      const sqlInjections = [
        'SELECT * FROM users',
        "'; DROP TABLE users; --",
        'UNION SELECT',
        'INSERT INTO',
        'DELETE FROM',
      ];

      sqlInjections.forEach(term => {
        const result = validateSearchTerm(term);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('非法字符');
      });
    });

    it('应该拒绝非字符串输入', () => {
      const result = validateSearchTerm(123 as any);
      expect(result.valid).toBe(false);
    });

    it('应该处理空字符串', () => {
      const result = validateSearchTerm('');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('');
    });

    it('应该修剪前后空格', () => {
      const result = validateSearchTerm('  测试  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('测试');
    });
  });

  describe('validatePriority', () => {
    it('应该接受有效的优先级', () => {
      const validPriorities = ['低', '中', '高', '紧急'];
      
      validPriorities.forEach(priority => {
        const result = validatePriority(priority);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(priority);
      });
    });

    it('应该接受空字符串（取消选择）', () => {
      const result = validatePriority('');
      expect(result.valid).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('应该接受 undefined (通过空字符串)', () => {
      // 注意：实际API不接受 undefined，需要传空字符串
      const result = validatePriority('');
      expect(result.valid).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('应该拒绝无效的优先级', () => {
      const invalidPriorities = ['超高', '最低', 'high', 'LOW'];
      
      invalidPriorities.forEach(priority => {
        const result = validatePriority(priority);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('非法的优先级');
      });
    });
  });

  describe('validateNeedToDo', () => {
    it('应该接受有效的选项', () => {
      const validOptions = ['是', '否'];
      
      validOptions.forEach(option => {
        const result = validateNeedToDo(option);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(option);
      });
    });

    it('应该接受空字符串（取消选择）', () => {
      const result = validateNeedToDo('');
      expect(result.valid).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('应该接受 undefined (通过空字符串)', () => {
      // 注意：实际API不接受 undefined，需要传空字符串
      const result = validateNeedToDo('');
      expect(result.valid).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('应该拒绝无效的选项', () => {
      const invalidOptions = ['yes', 'no', 'true', 'false', '未知'];
      
      invalidOptions.forEach(option => {
        const result = validateNeedToDo(option);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('非法的');
      });
    });
  });

  describe('validateReviewOpinion', () => {
    it('应该接受有效的评审意见', () => {
      const validOpinions = [
        '同意该需求',
        '需要补充技术方案',
        '建议优化用户体验',
        'Approved with minor changes',
      ];

      validOpinions.forEach(opinion => {
        const result = validateReviewOpinion(opinion);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(opinion);
      });
    });

    it('应该拒绝过长的评审意见', () => {
      const longOpinion = 'a'.repeat(INPUT_LIMITS.REVIEW_OPINION + 1);
      const result = validateReviewOpinion(longOpinion);
      
      expect(result.valid).toBe(false);
      if (result.error) {
        expect(result.error).toContain('长度不能超过');
      }
    });

    it('应该清理 XSS 攻击代码', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<iframe src="evil.com"></iframe>',
        '<img src=x onerror=alert(1)>',
      ];

      xssAttempts.forEach(opinion => {
        const result = validateReviewOpinion(opinion);
        expect(result.valid).toBe(true);
        // 脚本标签应该被移除
        expect(result.value).not.toContain('<script');
        expect(result.value).not.toContain('<iframe');
      });
    });

    it('应该拒绝非字符串输入', () => {
      const result = validateReviewOpinion(null as any);
      expect(result.valid).toBe(false);
    });

    it('应该修剪前后空格', () => {
      const result = validateReviewOpinion('  意见内容  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('意见内容');
    });

    it('应该接受空字符串', () => {
      const result = validateReviewOpinion('');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('');
    });
  });

  describe('validateIsOperational', () => {
    it('应该接受有效的运营状态', () => {
      const validStatuses = ['yes', 'no'];
      
      validStatuses.forEach(status => {
        const result = validateIsOperational(status);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(status);
      });
    });

    it('应该接受有效的值', () => {
      const result1 = validateIsOperational('yes');
      expect(result1.valid).toBe(true);
      expect(result1.value).toBe('yes');

      const result2 = validateIsOperational('no');
      expect(result2.valid).toBe(true);
      expect(result2.value).toBe('no');
    });

    it('应该拒绝无效的状态', () => {
      const invalidStatuses = ['是', '否', 'true', 'false', '1', '0', '', 'unset'];
      
      invalidStatuses.forEach(status => {
        const result = validateIsOperational(status);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('非法的');
      });
    });
  });

  describe('validateRequirementIds', () => {
    it('应该接受有效的 ID 数组', () => {
      const validIds = ['#1', '#2', '#3', '#123'];
      const result = validateRequirementIds(validIds);
      
      expect(result.valid).toBe(true);
      expect(result.value).toEqual(validIds);
    });

    it('应该拒绝空数组', () => {
      const result = validateRequirementIds([]);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('至少选择一个');
    });

    it('应该拒绝非数组输入', () => {
      const result = validateRequirementIds('#1' as any);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('必须是数组');
    });

    it('应该拒绝超过最大数量的 ID', () => {
      const tooManyIds = Array.from({ length: 101 }, (_, i) => `#${i + 1}`);
      const result = validateRequirementIds(tooManyIds, 100);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('最多支持');
    });

    it('应该拒绝包含无效 ID 的数组', () => {
      const invalidIds = ['#1', '', '#3', null as any];
      const result = validateRequirementIds(invalidIds);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('存在无效');
    });

    it('应该拒绝包含非字符串项的数组', () => {
      const mixedArray = ['#1', 123, '#3'] as any;
      const result = validateRequirementIds(mixedArray);
      
      expect(result.valid).toBe(false);
    });

    it('应该接受自定义最大数量', () => {
      const ids = ['#1', '#2', '#3'];
      
      // 限制为 2 个
      const result1 = validateRequirementIds(ids, 2);
      expect(result1.valid).toBe(false);
      
      // 限制为 5 个
      const result2 = validateRequirementIds(ids, 5);
      expect(result2.valid).toBe(true);
    });
  });

  describe('validateFilter', () => {
    it('应该验证有效的筛选条件', () => {
      const allowedColumns = ['title', 'type', 'priority'];
      const result = validateFilter('title', 'contains', '用户', allowedColumns);
      
      expect(result.valid).toBe(true);
      expect(result.value).toEqual({
        column: 'title',
        operator: 'contains',
        value: '用户'
      });
    });

    it('应该拒绝非法的列名', () => {
      const allowedColumns = ['title', 'type'];
      const result = validateFilter('invalidColumn', 'contains', '用户', allowedColumns);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('非法的筛选列');
    });

    it('应该拒绝非法的操作符', () => {
      const allowedColumns = ['title'];
      const result = validateFilter('title', 'invalid_operator', '用户', allowedColumns);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('非法的筛选操作符');
    });

    it('应该拒绝过长的筛选值', () => {
      const allowedColumns = ['title'];
      const longValue = 'a'.repeat(INPUT_LIMITS.FILTER_VALUE + 1);
      const result = validateFilter('title', 'contains', longValue, allowedColumns);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('长度不能超过');
    });
  });

  describe('边界条件和异常处理', () => {
    it('应该处理 Unicode 字符', () => {
      const unicodeTerms = [
        '用户👤登录🔐',
        '订单📦管理',
        '测试🧪数据',
      ];

      unicodeTerms.forEach(term => {
        const result = validateSearchTerm(term);
        expect(result.valid).toBe(true);
      });
    });

    it('应该处理特殊字符', () => {
      const specialChars = [
        'test@example.com',
        'user#123',
        'price: $100',
        '50% discount',
        'A & B',
      ];

      specialChars.forEach(term => {
        const result = validateSearchTerm(term);
        // 不包含 SQL 关键字的特殊字符应该被接受
        if (!term.includes('SELECT') && !term.includes('INSERT')) {
          expect(result.valid).toBe(true);
        }
      });
    });

    it('应该处理极端长度', () => {
      // 刚好达到限制
      const maxLength = 'a'.repeat(INPUT_LIMITS.SEARCH);
      const result1 = validateSearchTerm(maxLength);
      expect(result1.valid).toBe(true);

      // 超过限制 1 个字符
      const overLimit = 'a'.repeat(INPUT_LIMITS.SEARCH + 1);
      const result2 = validateSearchTerm(overLimit);
      expect(result2.valid).toBe(false);
    });

    it('应该处理只包含空格的字符串', () => {
      const result = validateSearchTerm('   ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(''); // 应该被修剪为空字符串
    });

    it('应该处理多行文本', () => {
      const multilineText = `第一行
      第二行
      第三行`;
      
      const result = validateReviewOpinion(multilineText);
      expect(result.valid).toBe(true);
      expect(result.value).toContain('第一行');
    });
  });

  describe('INPUT_LIMITS 常量', () => {
    it('应该定义所有必需的限制', () => {
      expect(INPUT_LIMITS.SEARCH).toBeDefined();
      expect(INPUT_LIMITS.REVIEW_OPINION).toBeDefined();
      expect(INPUT_LIMITS.TITLE).toBeDefined();
      expect(INPUT_LIMITS.DESCRIPTION).toBeDefined();

      // 限制应该是合理的正数
      expect(INPUT_LIMITS.SEARCH).toBeGreaterThan(0);
      expect(INPUT_LIMITS.REVIEW_OPINION).toBeGreaterThan(0);
      expect(INPUT_LIMITS.TITLE).toBeGreaterThan(0);
      expect(INPUT_LIMITS.DESCRIPTION).toBeGreaterThan(0);
    });
  });
});

