import React, { createContext, useContext, useState, useEffect } from 'react';

// 版本接口定义
interface VersionSchedule {
  prdStartDate: string;
  prdEndDate: string;
  prototypeStartDate: string;
  prototypeEndDate: string;
  devStartDate: string;
  devEndDate: string;
  testStartDate: string;
  testEndDate: string;
}

interface Version {
  id: string;
  platform: string;
  versionNumber: string;
  releaseDate: string;
  schedule: VersionSchedule;
  createdAt: string;
  updatedAt: string;
}

// 版本上下文接口
interface VersionContextValue {
  versions: Version[];
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
  getAllVersionNumbers: () => string[];
  getVersionsByPlatform: (platform: string) => Version[];
  addVersion: (version: Version) => void;
  updateVersion: (versionId: string, updatedVersion: Version) => void;
  deleteVersion: (versionId: string) => void;
}

// 创建上下文
const VersionContext = createContext<VersionContextValue | undefined>(undefined);

// Hook 用于获取版本上下文
export const useVersions = () => {
  const context = useContext(VersionContext);
  if (context === undefined) {
    throw new Error('useVersions must be used within a VersionProvider');
  }
  return context;
};

// 计算版本相关时间节点
const calculateVersionSchedule = (releaseDate: string): VersionSchedule => {
  const release = new Date(releaseDate);
  
  // 获取指定日期所在周的周一
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整周日
    return new Date(d.setDate(diff));
  };
  
  // 获取指定日期所在周的周三
  const getWednesday = (date: Date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000);
  };
  
  // 获取指定日期所在周的周五
  const getFriday = (date: Date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
  };
  
  // PRD时间：上线前第四周的周一到周三 (3个工作日)
  const prdWeekStart = getMonday(new Date(release.getTime() - 4 * 7 * 24 * 60 * 60 * 1000));
  const prdStartDate = prdWeekStart; // 周一
  const prdEndDate = getWednesday(prdWeekStart); // 周三
  
  // 原型设计时间：上线前第三周的周一到周五 (5个工作日)
  const prototypeWeekStart = getMonday(new Date(release.getTime() - 3 * 7 * 24 * 60 * 60 * 1000));
  const prototypeStartDate = prototypeWeekStart; // 周一
  const prototypeEndDate = getFriday(prototypeWeekStart); // 周五
  
  // 开发时间：上线前两周周一开始至前一周周五 (10个工作日)
  const devWeekStart = getMonday(new Date(release.getTime() - 2 * 7 * 24 * 60 * 60 * 1000));
  const devStartDate = devWeekStart; // 上线前第二周周一
  const devEndDate = getFriday(new Date(release.getTime() - 1 * 7 * 24 * 60 * 60 * 1000)); // 上线前第一周周五
  
  // 测试时间：上线当周的周一到上线日期
  const testStartDate = getMonday(release);
  const testEndDate = release; // 测试到上线日期
  
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
};

// 初始版本数据（从版本号管理页面迁移过来）
const initialVersions: Version[] = [
  {
    id: '1',
    platform: 'PC',
    versionNumber: '3.3.0',
    releaseDate: '2025-09-25',
    schedule: calculateVersionSchedule('2025-09-25'),
    createdAt: '2024-09-15 14:30',
    updatedAt: '2024-09-20 16:45'
  },
  {
    id: '2',
    platform: 'iOS',
    versionNumber: '3.3.0',
    releaseDate: '2025-01-20',
    schedule: calculateVersionSchedule('2025-01-20'),
    createdAt: '2024-09-18 10:20',
    updatedAt: '2024-09-22 09:15'
  },
  {
    id: '3',
    platform: '安卓',
    versionNumber: '3.3.0',
    releaseDate: '2025-01-22',
    schedule: calculateVersionSchedule('2025-01-22'),
    createdAt: '2024-09-20 11:20',
    updatedAt: '2024-09-25 10:15'
  },
  {
    id: '4',
    platform: 'web',
    versionNumber: '3.3.0',
    releaseDate: '2025-01-10',
    schedule: calculateVersionSchedule('2025-01-10'),
    createdAt: '2024-09-12 09:30',
    updatedAt: '2024-09-18 15:20'
  },
  {
    id: '5',
    platform: 'PC',
    versionNumber: '3.2.1',
    releaseDate: '2024-12-20',
    schedule: calculateVersionSchedule('2024-12-20'),
    createdAt: '2024-08-25 14:15',
    updatedAt: '2024-09-10 11:30'
  },
  {
    id: '6',
    platform: 'iOS',
    versionNumber: '3.2.1',
    releaseDate: '2024-12-25',
    schedule: calculateVersionSchedule('2024-12-25'),
    createdAt: '2024-08-28 16:45',
    updatedAt: '2024-09-12 14:20'
  },
  {
    id: '7',
    platform: '安卓',
    versionNumber: '3.2.1',
    releaseDate: '2024-12-27',
    schedule: calculateVersionSchedule('2024-12-27'),
    createdAt: '2024-08-30 10:10',
    updatedAt: '2024-09-15 09:45'
  },
  {
    id: '8',
    platform: 'web',
    versionNumber: '3.2.1',
    releaseDate: '2024-12-18',
    schedule: calculateVersionSchedule('2024-12-18'),
    createdAt: '2024-08-22 13:25',
    updatedAt: '2024-09-08 16:30'
  },
  {
    id: '9',
    platform: 'PC',
    versionNumber: '3.2.0',
    releaseDate: '2024-11-15',
    schedule: calculateVersionSchedule('2024-11-15'),
    createdAt: '2024-07-20 11:40',
    updatedAt: '2024-08-05 14:50'
  },
  {
    id: '10',
    platform: 'iOS',
    versionNumber: '3.2.0',
    releaseDate: '2024-11-18',
    schedule: calculateVersionSchedule('2024-11-18'),
    createdAt: '2024-07-22 15:20',
    updatedAt: '2024-08-08 10:15'
  },
  {
    id: '11',
    platform: '安卓',
    versionNumber: '3.2.0',
    releaseDate: '2024-11-20',
    schedule: calculateVersionSchedule('2024-11-20'),
    createdAt: '2024-07-25 09:30',
    updatedAt: '2024-08-10 13:25'
  },
  {
    id: '12',
    platform: 'web',
    versionNumber: '3.2.0',
    releaseDate: '2024-11-12',
    schedule: calculateVersionSchedule('2024-11-12'),
    createdAt: '2024-07-18 14:55',
    updatedAt: '2024-08-02 11:40'
  },
  {
    id: '13',
    platform: 'PC',
    versionNumber: '3.1.2',
    releaseDate: '2024-10-25',
    schedule: calculateVersionSchedule('2024-10-25'),
    createdAt: '2024-06-30 16:20',
    updatedAt: '2024-07-15 09:30'
  },
  {
    id: '14',
    platform: 'iOS',
    versionNumber: '3.1.2',
    releaseDate: '2024-10-28',
    schedule: calculateVersionSchedule('2024-10-28'),
    createdAt: '2024-07-02 12:10',
    updatedAt: '2024-07-18 15:45'
  },
  {
    id: '15',
    platform: '安卓',
    versionNumber: '3.4.0',
    releaseDate: '2025-02-28',
    schedule: calculateVersionSchedule('2025-02-28'),
    createdAt: '2024-10-05 10:30',
    updatedAt: '2024-10-20 14:15'
  }
];

// 版本提供者组件
interface VersionProviderProps {
  children: React.ReactNode;
}

export const VersionProvider: React.FC<VersionProviderProps> = ({ children }) => {
  const [versions, setVersions] = useState<Version[]>(initialVersions);

  // 获取所有版本号（去重）
  const getAllVersionNumbers = (): string[] => {
    const versionNumbers = versions.map(v => v.versionNumber);
    return Array.from(new Set(versionNumbers)).sort((a, b) => {
      // 按版本号排序，新版本在前
      const parseVersion = (version: string) => {
        const parts = version.replace('v', '').split('.').map(Number);
        return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
      };
      return parseVersion(b) - parseVersion(a);
    });
  };

  // 根据平台获取版本
  const getVersionsByPlatform = (platform: string): Version[] => {
    return versions.filter(v => v.platform === platform);
  };

  // 添加版本
  const addVersion = (version: Version) => {
    setVersions(prev => [version, ...prev]);
  };

  // 更新版本
  const updateVersion = (versionId: string, updatedVersion: Version) => {
    setVersions(prev => prev.map(v => v.id === versionId ? updatedVersion : v));
  };

  // 删除版本
  const deleteVersion = (versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
  };

  const contextValue: VersionContextValue = {
    versions,
    setVersions,
    getAllVersionNumbers,
    getVersionsByPlatform,
    addVersion,
    updateVersion,
    deleteVersion
  };

  return (
    <VersionContext.Provider value={contextValue}>
      {children}
    </VersionContext.Provider>
  );
};

// 导出版本类型
export type { Version, VersionSchedule };