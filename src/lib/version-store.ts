/**
 * 版本号统一管理
 * 
 * 用于版本号管理页面和预排期页面的数据同步
 * 版本号数据存储在 localStorage 中
 */

import { create } from 'zustand';
import { ValidationResult } from './input-validation';

export interface VersionSchedule {
  prdStartDate: string;
  prdEndDate: string;
  prototypeStartDate: string;
  prototypeEndDate: string;
  devStartDate: string;
  devEndDate: string;
  testStartDate: string;
  testEndDate: string;
}

export interface Version {
  id: string;
  platform: string;
  versionNumber: string;
  releaseDate: string;
  schedule: VersionSchedule;
  createdAt: string;
  updatedAt: string;
}

interface VersionStore {
  versions: Version[];
  customPlatforms: string[];
  
  // 版本操作
  addVersion: (version: Version) => void;
  updateVersion: (id: string, updates: Partial<Version>) => void;
  deleteVersion: (id: string) => void;
  
  // 平台操作
  addCustomPlatform: (platform: string) => void;
  deleteCustomPlatform: (platform: string) => void;
  
  // 获取版本号列表（用于下拉选择）
  getVersionNumbers: () => string[];
  
  // 初始化
  initFromStorage: () => void;
}

/**
 * 计算版本相关时间节点
 */
export function calculateVersionSchedule(releaseDate: string): VersionSchedule {
  const release = new Date(releaseDate);
  
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  const getWednesday = (date: Date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000);
  };
  
  const getFriday = (date: Date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
  };
  
  // PRD时间：上线前第四周的周一到周三 (3个工作日)
  const prdWeekStart = getMonday(new Date(release.getTime() - 4 * 7 * 24 * 60 * 60 * 1000));
  const prdStartDate = prdWeekStart;
  const prdEndDate = getWednesday(prdWeekStart);
  
  // 原型设计时间：上线前第三周的周一到周五 (5个工作日)
  const prototypeWeekStart = getMonday(new Date(release.getTime() - 3 * 7 * 24 * 60 * 60 * 1000));
  const prototypeStartDate = prototypeWeekStart;
  const prototypeEndDate = getFriday(prototypeWeekStart);
  
  // 开发时间：上线前两周周一开始至前一周周五 (10个工作日)
  const devWeekStart = getMonday(new Date(release.getTime() - 2 * 7 * 24 * 60 * 60 * 1000));
  const devStartDate = devWeekStart;
  const devEndDate = getFriday(new Date(release.getTime() - 1 * 7 * 24 * 60 * 60 * 1000));
  
  // 测试时间：上线当周的周一到上线日期
  const testStartDate = getMonday(release);
  const testEndDate = release;
  
  return {
    prdStartDate: prdStartDate.toISOString().split('T')[0],
    prdEndDate: prdEndDate.toISOString().split('T')[0],
    prototypeStartDate: prototypeStartDate.toISOString().split('T')[0],
    prototypeEndDate: prototypeEndDate.toISOString().split('T')[0],
    devStartDate: devStartDate.toISOString().split('T')[0],
    devEndDate: devEndDate.toISOString().split('T')[0],
    testStartDate: testStartDate.toISOString().split('T')[0],
    testEndDate: testEndDate.toISOString().split('T')[0]
  };
}

/**
 * 版本号存储
 */
export const useVersionStore = create<VersionStore>((set, get) => ({
  versions: [],
  customPlatforms: [],
  
  addVersion: (version) => {
    set((state) => {
      const newVersions = [version, ...state.versions];
      localStorage.setItem('version_management_versions', JSON.stringify(newVersions));
      return { versions: newVersions };
    });
  },
  
  updateVersion: (id, updates) => {
    set((state) => {
      const newVersions = state.versions.map((v) =>
        v.id === id ? { 
          ...v, 
          ...updates, 
          updatedAt: new Date().toLocaleString('zh-CN'),
          // 如果更新了上线日期，重新计算时间节点
          schedule: updates.releaseDate ? calculateVersionSchedule(updates.releaseDate) : v.schedule
        } : v
      );
      localStorage.setItem('version_management_versions', JSON.stringify(newVersions));
      return { versions: newVersions };
    });
  },
  
  deleteVersion: (id) => {
    set((state) => {
      const newVersions = state.versions.filter((v) => v.id !== id);
      localStorage.setItem('version_management_versions', JSON.stringify(newVersions));
      return { versions: newVersions };
    });
  },
  
  addCustomPlatform: (platform) => {
    set((state) => {
      if (state.customPlatforms.includes(platform)) return state;
      const newPlatforms = [...state.customPlatforms, platform];
      localStorage.setItem('version_management_custom_platforms', JSON.stringify(newPlatforms));
      return { customPlatforms: newPlatforms };
    });
  },
  
  deleteCustomPlatform: (platform) => {
    set((state) => {
      const newPlatforms = state.customPlatforms.filter((p) => p !== platform);
      localStorage.setItem('version_management_custom_platforms', JSON.stringify(newPlatforms));
      return { customPlatforms: newPlatforms };
    });
  },
  
  getVersionNumbers: () => {
    const state = get();
    const versionNumbers = state.versions
      .map((v) => `${v.platform} ${v.versionNumber}`)
      .sort()
      .reverse();
    return ['暂无版本号', ...versionNumbers];
  },
  
  initFromStorage: () => {
    try {
      const savedVersions = localStorage.getItem('version_management_versions');
      const savedPlatforms = localStorage.getItem('version_management_custom_platforms');
      
      set({
        versions: savedVersions ? JSON.parse(savedVersions) : [],
        customPlatforms: savedPlatforms ? JSON.parse(savedPlatforms) : [],
      });
    } catch (error) {
      console.error('Failed to load version data from storage:', error);
    }
  },
}));

/**
 * 验证版本数据
 * 
 * @param version - 版本数据
 * @returns 验证结果
 */
export function validateVersion(version: Partial<Version>): ValidationResult {
  // 1. 验证应用端
  if (!version.platform || version.platform.trim() === '') {
    return {
      valid: false,
      error: '应用端不能为空'
    };
  }
  
  // 2. 验证版本号
  if (!version.versionNumber || version.versionNumber.trim() === '') {
    return {
      valid: false,
      error: '版本号不能为空'
    };
  }
  
  // 验证版本号格式 (如: 1.0.0, 2.1.3)
  const versionNumberPattern = /^\d+\.\d+(\.\d+)?$/;
  if (!versionNumberPattern.test(version.versionNumber.trim())) {
    return {
      valid: false,
      error: '版本号格式不正确，请使用 x.y.z 格式（如：1.0.0）'
    };
  }
  
  // 3. 验证上线时间
  if (!version.releaseDate) {
    return {
      valid: false,
      error: '上线时间不能为空'
    };
  }
  
  // 验证日期格式
  const releaseDate = new Date(version.releaseDate);
  if (isNaN(releaseDate.getTime())) {
    return {
      valid: false,
      error: '上线时间格式不正确'
    };
  }
  
  // 验证日期不能是过去
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (releaseDate < today) {
    return {
      valid: false,
      error: '上线时间不能早于今天'
    };
  }
  
  return {
    valid: true,
    value: version
  };
}

/**
 * 验证平台名称
 * 
 * @param platform - 平台名称
 * @returns 验证结果
 */
export function validatePlatformName(platform: string): ValidationResult {
  if (!platform || platform.trim() === '') {
    return {
      valid: false,
      error: '平台名称不能为空'
    };
  }
  
  if (platform.length > 20) {
    return {
      valid: false,
      error: '平台名称不能超过20个字符'
    };
  }
  
  // 只允许中文、英文、数字、下划线
  const platformPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
  if (!platformPattern.test(platform)) {
    return {
      valid: false,
      error: '平台名称只能包含中文、英文、数字和下划线'
    };
  }
  
  return {
    valid: true,
    value: platform.trim()
  };
}

