/**
 * version-store 单元测试
 * 
 * 测试版本号管理功能
 * 目标覆盖率：≥90%
 */

import {
  calculateVersionSchedule,
  validateVersion,
  validatePlatformName,
  useVersionStore,
  Version,
} from '../version-store';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('version-store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // 重置 zustand store
    useVersionStore.setState({
      versions: [],
      customPlatforms: [],
    });
  });

  describe('calculateVersionSchedule', () => {
    it('应该正确计算版本时间节点', () => {
      // 假设上线日期为 2024-03-01 (周五)
      const releaseDate = '2024-03-01';
      const schedule = calculateVersionSchedule(releaseDate);

      expect(schedule).toHaveProperty('prdStartDate');
      expect(schedule).toHaveProperty('prdEndDate');
      expect(schedule).toHaveProperty('prototypeStartDate');
      expect(schedule).toHaveProperty('prototypeEndDate');
      expect(schedule).toHaveProperty('devStartDate');
      expect(schedule).toHaveProperty('devEndDate');
      expect(schedule).toHaveProperty('testStartDate');
      expect(schedule).toHaveProperty('testEndDate');

      // 验证日期格式
      expect(schedule.prdStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(schedule.testEndDate).toBe(releaseDate);
    });

    it('应该确保 PRD 在上线前4周开始', () => {
      const releaseDate = '2024-03-01';
      const schedule = calculateVersionSchedule(releaseDate);
      
      const release = new Date(releaseDate);
      const prdStart = new Date(schedule.prdStartDate);
      
      const diffWeeks = Math.floor((release.getTime() - prdStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      expect(diffWeeks).toBeGreaterThanOrEqual(3); // 至少3周
      expect(diffWeeks).toBeLessThanOrEqual(4); // 最多4周
    });

    it('应该确保时间节点按顺序排列', () => {
      const releaseDate = '2024-03-15';
      const schedule = calculateVersionSchedule(releaseDate);
      
      const dates = [
        new Date(schedule.prdStartDate),
        new Date(schedule.prdEndDate),
        new Date(schedule.prototypeStartDate),
        new Date(schedule.prototypeEndDate),
        new Date(schedule.devStartDate),
        new Date(schedule.devEndDate),
        new Date(schedule.testStartDate),
        new Date(schedule.testEndDate),
      ];
      
      // 验证日期递增
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i - 1].getTime());
      }
    });
  });

  describe('validateVersion', () => {
    const validVersion: Partial<Version> = {
      platform: 'iOS',
      versionNumber: '1.0.0',
      releaseDate: '2025-12-31', // 未来日期
    };

    it('应该接受有效的版本数据', () => {
      const result = validateVersion(validVersion);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('应该拒绝空应用端', () => {
      const result1 = validateVersion({ ...validVersion, platform: '' });
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('应用端');

      const result2 = validateVersion({ ...validVersion, platform: '   ' });
      expect(result2.valid).toBe(false);
    });

    it('应该拒绝空版本号', () => {
      const result1 = validateVersion({ ...validVersion, versionNumber: '' });
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('版本号');

      const result2 = validateVersion({ ...validVersion, versionNumber: '   ' });
      expect(result2.valid).toBe(false);
    });

    it('应该验证版本号格式', () => {
      // 有效格式
      const validFormats = ['1.0', '1.0.0', '10.5.2', '2.1.0'];
      validFormats.forEach(version => {
        const result = validateVersion({ ...validVersion, versionNumber: version });
        expect(result.valid).toBe(true);
      });

      // 无效格式
      const invalidFormats = ['1', 'v1.0.0', '1.0.0.0', 'abc', '1.x.0'];
      invalidFormats.forEach(version => {
        const result = validateVersion({ ...validVersion, versionNumber: version });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('格式');
      });
    });

    it('应该拒绝空上线时间', () => {
      const result = validateVersion({ ...validVersion, releaseDate: undefined });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('上线时间');
    });

    it('应该拒绝无效的日期格式', () => {
      const result = validateVersion({ ...validVersion, releaseDate: 'invalid-date' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('格式');
    });

    it('应该拒绝过去的日期', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      const result = validateVersion({ ...validVersion, releaseDate: pastDate });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('不能早于今天');
    });

    it('应该接受今天的日期', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = validateVersion({ ...validVersion, releaseDate: today });
      expect(result.valid).toBe(true);
    });

    it('应该接受未来的日期', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const futureDate = future.toISOString().split('T')[0];
      
      const result = validateVersion({ ...validVersion, releaseDate: futureDate });
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePlatformName', () => {
    it('应该接受有效的平台名称', () => {
      const validNames = ['iOS', 'Android', 'Web', 'PC端', '移动端', 'app_v2'];
      validNames.forEach(name => {
        const result = validatePlatformName(name);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(name.trim());
      });
    });

    it('应该拒绝空平台名称', () => {
      const result1 = validatePlatformName('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('不能为空');

      const result2 = validatePlatformName('   ');
      expect(result2.valid).toBe(false);
    });

    it('应该拒绝过长的平台名称', () => {
      const longName = 'a'.repeat(21);
      const result = validatePlatformName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('不能超过20个字符');
    });

    it('应该拒绝包含特殊字符的平台名称', () => {
      const invalidNames = ['iOS@', 'Android!', 'Web端#', 'PC-端', 'app v2'];
      invalidNames.forEach(name => {
        const result = validatePlatformName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('只能包含');
      });
    });

    it('应该修剪前后空格', () => {
      const result = validatePlatformName('  iOS  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('iOS');
    });
  });

  describe('useVersionStore', () => {
    it('应该有正确的初始状态', () => {
      const state = useVersionStore.getState();
      expect(state.versions).toEqual([]);
      expect(state.customPlatforms).toEqual([]);
    });

    it('应该能添加版本', () => {
      const version: Version = {
        id: '1',
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      useVersionStore.getState().addVersion(version);
      
      const state = useVersionStore.getState();
      expect(state.versions).toHaveLength(1);
      expect(state.versions[0]).toEqual(version);
    });

    it('应该能更新版本', () => {
      const version: Version = {
        id: '1',
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      useVersionStore.getState().addVersion(version);
      useVersionStore.getState().updateVersion('1', {
        versionNumber: '1.0.1',
      });
      
      const state = useVersionStore.getState();
      expect(state.versions[0].versionNumber).toBe('1.0.1');
      expect(state.versions[0].updatedAt).not.toBe('2024-01-01'); // 应该更新时间
    });

    it('应该能删除版本', () => {
      const version: Version = {
        id: '1',
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      useVersionStore.getState().addVersion(version);
      expect(useVersionStore.getState().versions).toHaveLength(1);
      
      useVersionStore.getState().deleteVersion('1');
      expect(useVersionStore.getState().versions).toHaveLength(0);
    });

    it('应该能添加自定义平台', () => {
      useVersionStore.getState().addCustomPlatform('自定义平台');
      
      const state = useVersionStore.getState();
      expect(state.customPlatforms).toContain('自定义平台');
    });

    it('应该防止添加重复的自定义平台', () => {
      useVersionStore.getState().addCustomPlatform('自定义平台');
      useVersionStore.getState().addCustomPlatform('自定义平台');
      
      const state = useVersionStore.getState();
      expect(state.customPlatforms.filter(p => p === '自定义平台')).toHaveLength(1);
    });

    it('应该能删除自定义平台', () => {
      useVersionStore.getState().addCustomPlatform('自定义平台');
      expect(useVersionStore.getState().customPlatforms).toContain('自定义平台');
      
      useVersionStore.getState().deleteCustomPlatform('自定义平台');
      expect(useVersionStore.getState().customPlatforms).not.toContain('自定义平台');
    });

    it('应该能获取版本号列表', () => {
      useVersionStore.getState().addVersion({
        id: '1',
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      useVersionStore.getState().addVersion({
        id: '2',
        platform: 'Android',
        versionNumber: '2.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      const versionNumbers = useVersionStore.getState().getVersionNumbers();
      
      expect(versionNumbers).toContain('暂无版本号');
      expect(versionNumbers).toContain('iOS 1.0.0');
      expect(versionNumbers).toContain('Android 2.0.0');
      expect(versionNumbers).toHaveLength(3); // 包括 "暂无版本号"
    });

    it('应该将版本号列表按倒序排列', () => {
      useVersionStore.getState().addVersion({
        id: '1',
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      useVersionStore.getState().addVersion({
        id: '2',
        platform: 'iOS',
        versionNumber: '2.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      });

      const versionNumbers = useVersionStore.getState().getVersionNumbers();
      
      const iosVersionIndex1 = versionNumbers.indexOf('iOS 1.0.0');
      const iosVersionIndex2 = versionNumbers.indexOf('iOS 2.0.0');
      
      expect(iosVersionIndex2).toBeLessThan(iosVersionIndex1); // 2.0.0 应该在 1.0.0 前面
    });

    it('应该能从 localStorage 初始化数据', () => {
      // 模拟 localStorage 中有数据
      const mockVersions: Version[] = [{
        id: '1',
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2025-12-31',
        schedule: calculateVersionSchedule('2025-12-31'),
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }];
      
      const mockPlatforms = ['自定义平台'];

      localStorageMock.setItem('version_management_versions', JSON.stringify(mockVersions));
      localStorageMock.setItem('version_management_custom_platforms', JSON.stringify(mockPlatforms));

      useVersionStore.getState().initFromStorage();
      
      const state = useVersionStore.getState();
      expect(state.versions).toHaveLength(1);
      expect(state.customPlatforms).toHaveLength(1);
    });

    it('应该处理 localStorage 中无数据的情况', () => {
      useVersionStore.getState().initFromStorage();
      
      const state = useVersionStore.getState();
      expect(state.versions).toEqual([]);
      expect(state.customPlatforms).toEqual([]);
    });

    it('应该处理 localStorage 中损坏的数据', () => {
      localStorageMock.setItem('version_management_versions', 'invalid json');
      
      // 应该不抛出错误
      expect(() => {
        useVersionStore.getState().initFromStorage();
      }).not.toThrow();
      
      const state = useVersionStore.getState();
      expect(state.versions).toEqual([]);
    });
  });

  describe('边界条件', () => {
    it('应该处理极端日期', () => {
      // 很远的未来
      const result1 = validateVersion({
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2099-12-31',
      });
      expect(result1.valid).toBe(true);

      // 闰年的2月29日
      const result2 = validateVersion({
        platform: 'iOS',
        versionNumber: '1.0.0',
        releaseDate: '2028-02-29',
      });
      expect(result2.valid).toBe(true);
    });

    it('应该处理不同的版本号格式', () => {
      const versions = ['0.1', '1.0', '10.0.0', '999.999.999'];
      versions.forEach(v => {
        const result = validateVersion({
          platform: 'iOS',
          versionNumber: v,
          releaseDate: '2025-12-31',
        });
        expect(result.valid).toBe(true);
      });
    });

    it('应该处理多字节字符的平台名称', () => {
      const result = validatePlatformName('移动端');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('移动端');
    });
  });
});


