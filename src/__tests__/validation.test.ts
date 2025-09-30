// 验证功能测试用例
import { 
  validateRequirementTitle,
  validateRequirementDescription,
  validateRequirementType,
  validatePriority,
  validateNeedToDo,
  validatePlatforms,
  validateTags,
  validateFileName,
  validateComment,
  validateEmail,
  validateRequirement
} from '@/lib/validation';

describe('验证功能测试', () => {
  
  describe('需求标题验证', () => {
    test('应该接受有效的标题', () => {
      const result = validateRequirementTitle('有效的需求标题');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('应该拒绝空标题', () => {
      const result = validateRequirementTitle('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不能为空');
    });

    test('应该拒绝过长的标题', () => {
      const longTitle = 'a'.repeat(201);
      const result = validateRequirementTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('长度不能超过');
    });

    test('应该处理只有空格的标题', () => {
      const result = validateRequirementTitle('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('需求描述验证', () => {
    test('应该接受有效的描述', () => {
      const result = validateRequirementDescription('这是一个有效的需求描述');
      expect(result.isValid).toBe(true);
    });

    test('应该拒绝空描述', () => {
      const result = validateRequirementDescription('');
      expect(result.isValid).toBe(false);
    });

    test('应该拒绝过长的描述', () => {
      const longDescription = 'a'.repeat(5001);
      const result = validateRequirementDescription(longDescription);
      expect(result.isValid).toBe(false);
    });
  });

  describe('需求类型验证', () => {
    test('应该接受有效的需求类型', () => {
      const validTypes = ['新功能', '优化', 'BUG', '用户反馈', '商务需求'];
      
      validTypes.forEach(type => {
        const result = validateRequirementType(type);
        expect(result.isValid).toBe(true);
      });
    });

    test('应该拒绝无效的需求类型', () => {
      const result = validateRequirementType('无效类型');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('必须是以下值之一');
    });
  });

  describe('优先级验证', () => {
    test('应该接受有效的优先级', () => {
      const validPriorities = ['低', '中', '高', '紧急'];
      
      validPriorities.forEach(priority => {
        const result = validatePriority(priority);
        expect(result.isValid).toBe(true);
      });
    });

    test('应该拒绝无效的优先级', () => {
      const result = validatePriority('超高');
      expect(result.isValid).toBe(false);
    });
  });

  describe('是否要做验证', () => {
    test('应该接受有效的值', () => {
      const validValues = ['是', '否'];
      
      validValues.forEach(value => {
        const result = validateNeedToDo(value);
        expect(result.isValid).toBe(true);
      });
    });

    test('应该拒绝无效的值', () => {
      const result = validateNeedToDo('也许');
      expect(result.isValid).toBe(false);
    });
  });

  describe('应用端验证', () => {
    test('应该接受有效的应用端', () => {
      const result = validatePlatforms(['Web端', 'iOS']);
      expect(result.isValid).toBe(true);
    });

    test('应该拒绝空的应用端数组', () => {
      const result = validatePlatforms([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('至少需要选择一个');
    });

    test('应该拒绝无效的应用端', () => {
      const result = validatePlatforms(['Web端', '无效端']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不支持的应用端');
    });
  });

  describe('标签验证', () => {
    test('应该接受有效的标签', () => {
      const result = validateTags(['标签1', '标签2']);
      expect(result.isValid).toBe(true);
    });

    test('应该拒绝过多的标签', () => {
      const manyTags = Array.from({ length: 11 }, (_, i) => `标签${i + 1}`);
      const result = validateTags(manyTags);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('标签数量不能超过');
    });

    test('应该拒绝过长的标签', () => {
      const longTag = 'a'.repeat(51);
      const result = validateTags([longTag]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('长度不能超过');
    });
  });

  describe('文件名验证', () => {
    test('应该接受有效的文件名', () => {
      const result = validateFileName('document.pdf');
      expect(result.isValid).toBe(true);
    });

    test('应该拒绝包含不安全字符的文件名', () => {
      const result = validateFileName('file<script>.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不安全的字符');
    });

    test('应该拒绝路径遍历攻击', () => {
      const result = validateFileName('../../../etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('路径遍历字符');
    });

    test('应该拒绝过长的文件名', () => {
      const longFileName = 'a'.repeat(256) + '.txt';
      const result = validateFileName(longFileName);
      expect(result.isValid).toBe(false);
    });
  });

  describe('评论验证', () => {
    test('应该接受有效的评论', () => {
      const result = validateComment('这是一个有效的评论');
      expect(result.isValid).toBe(true);
    });

    test('应该拒绝空评论', () => {
      const result = validateComment('');
      expect(result.isValid).toBe(false);
    });

    test('应该拒绝过长的评论', () => {
      const longComment = 'a'.repeat(1001);
      const result = validateComment(longComment);
      expect(result.isValid).toBe(false);
    });
  });

  describe('邮箱验证', () => {
    test('应该接受有效的邮箱', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    test('应该拒绝无效的邮箱', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('综合需求验证', () => {
    test('应该接受有效的需求数据', () => {
      const validRequirement = {
        title: '有效的需求标题',
        description: '这是一个有效的需求描述',
        type: '新功能',
        platforms: ['Web端', 'iOS'],
        tags: ['标签1', '标签2'],
        priority: '高',
        needToDo: '是'
      };

      const result = validateRequirement(validRequirement);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('应该收集所有验证错误', () => {
      const invalidRequirement = {
        title: '', // 空标题
        description: '', // 空描述
        type: '无效类型', // 无效类型
        platforms: [], // 空应用端
        tags: Array.from({ length: 11 }, (_, i) => `标签${i + 1}`), // 过多标签
        priority: '超高', // 无效优先级
        needToDo: '也许' // 无效值
      };

      const result = validateRequirement(invalidRequirement);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // 检查是否包含各种错误
      const errorString = result.errors.join(' ');
      expect(errorString).toContain('标题');
      expect(errorString).toContain('描述');
      expect(errorString).toContain('类型');
      expect(errorString).toContain('应用端');
    });

    test('应该处理可选字段', () => {
      const minimalRequirement = {
        title: '最小需求',
        description: '最小需求描述',
        type: '新功能',
        platforms: ['Web端']
      };

      const result = validateRequirement(minimalRequirement);
      expect(result.isValid).toBe(true);
    });
  });

  describe('边界情况测试', () => {
    test('应该处理null和undefined值', () => {
      expect(validateRequirementTitle(null as any).isValid).toBe(false);
      expect(validateRequirementTitle(undefined as any).isValid).toBe(false);
    });

    test('应该处理数字类型输入', () => {
      expect(validateRequirementTitle(123 as any).isValid).toBe(false);
    });

    test('应该处理空白字符', () => {
      const result = validateRequirementTitle('   有效标题   ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('性能测试', () => {
    test('验证大量数据时应该保持性能', () => {
      const startTime = Date.now();
      
      // 验证1000个需求
      for (let i = 0; i < 1000; i++) {
        validateRequirement({
          title: `需求标题 ${i}`,
          description: `需求描述 ${i}`,
          type: '新功能',
          platforms: ['Web端']
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 验证应该在合理时间内完成（比如1秒）
      expect(duration).toBeLessThan(1000);
    });
  });
}); 