/**
 * 主题管理系统
 * 
 * P3 功能：提供主题切换和自定义功能
 * 
 * 功能特性：
 * - 多主题支持
 * - 动态主题切换
 * - 自定义主题
 * - 主题持久化
 * - 系统主题跟随
 * - 主题变量管理
 * 
 * @module theme
 */

import React from 'react';
import { logger } from './logger';

/**
 * 主题类型
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主题模式 */
  mode: ThemeMode;
  /** 主题变量 */
  variables: Record<string, string>;
  /** 主题元数据 */
  metadata: {
    author: string;
    version: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 主色调 */
  primary: string;
  /** 辅助色 */
  secondary: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
  /** 背景色 */
  background: string;
  /** 表面色 */
  surface: string;
  /** 文本色 */
  text: string;
  /** 边框色 */
  border: string;
}

/**
 * 间距配置
 */
export interface SpacingConfig {
  /** 基础间距单位 */
  unit: number;
  /** 间距值 */
  values: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

/**
 * 字体配置
 */
export interface TypographyConfig {
  /** 字体族 */
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  /** 字体大小 */
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  /** 字体粗细 */
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  /** 行高 */
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * 阴影配置
 */
export interface ShadowConfig {
  /** 阴影值 */
  values: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * 圆角配置
 */
export interface BorderRadiusConfig {
  /** 圆角值 */
  values: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 动画持续时间 */
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  /** 动画缓动函数 */
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * 主题管理器
 */
class ThemeManager {
  private currentTheme: string = 'default';
  private currentMode: ThemeMode = 'system';
  private themes: Map<string, ThemeConfig> = new Map();
  private isInitialized: boolean = false;

  /**
   * 默认主题配置
   */
  private defaultThemes: Record<string, ThemeConfig> = {
    default: {
      name: 'Default',
      mode: 'light',
      variables: {
        '--color-primary': '#3b82f6',
        '--color-secondary': '#6b7280',
        '--color-success': '#10b981',
        '--color-warning': '#f59e0b',
        '--color-error': '#ef4444',
        '--color-info': '#06b6d4',
        '--color-background': '#ffffff',
        '--color-surface': '#f9fafb',
        '--color-text': '#111827',
        '--color-text-secondary': '#6b7280',
        '--color-border': '#e5e7eb',
        '--spacing-unit': '8px',
        '--border-radius': '6px',
        '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '--font-family': 'Inter, system-ui, sans-serif',
        '--font-size': '14px',
        '--line-height': '1.5',
      },
      metadata: {
        author: 'AiCoin OS',
        version: '1.0.0',
        description: 'Default light theme',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    dark: {
      name: 'Dark',
      mode: 'dark',
      variables: {
        '--color-primary': '#60a5fa',
        '--color-secondary': '#9ca3af',
        '--color-success': '#34d399',
        '--color-warning': '#fbbf24',
        '--color-error': '#f87171',
        '--color-info': '#22d3ee',
        '--color-background': '#111827',
        '--color-surface': '#1f2937',
        '--color-text': '#f9fafb',
        '--color-text-secondary': '#d1d5db',
        '--color-border': '#374151',
        '--spacing-unit': '8px',
        '--border-radius': '6px',
        '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        '--font-family': 'Inter, system-ui, sans-serif',
        '--font-size': '14px',
        '--line-height': '1.5',
      },
      metadata: {
        author: 'AiCoin OS',
        version: '1.0.0',
        description: 'Dark theme',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    highContrast: {
      name: 'High Contrast',
      mode: 'light',
      variables: {
        '--color-primary': '#0000ff',
        '--color-secondary': '#666666',
        '--color-success': '#008000',
        '--color-warning': '#ff8c00',
        '--color-error': '#ff0000',
        '--color-info': '#0080ff',
        '--color-background': '#ffffff',
        '--color-surface': '#ffffff',
        '--color-text': '#000000',
        '--color-text-secondary': '#333333',
        '--color-border': '#000000',
        '--spacing-unit': '8px',
        '--border-radius': '0px',
        '--shadow': 'none',
        '--font-family': 'Arial, sans-serif',
        '--font-size': '16px',
        '--line-height': '1.4',
      },
      metadata: {
        author: 'AiCoin OS',
        version: '1.0.0',
        description: 'High contrast theme for accessibility',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  };

  /**
   * 初始化主题管理器
   */
  public async initialize(): Promise<void> {
    try {
      // 注册默认主题
      Object.entries(this.defaultThemes).forEach(([name, config]) => {
        this.themes.set(name, config);
      });

      // 从本地存储加载用户主题
      await this.loadUserThemes();

      // 获取当前主题设置
      this.currentTheme = this.getStoredTheme();
      this.currentMode = this.getStoredMode();

      // 应用主题
      await this.applyTheme(this.currentTheme, this.currentMode);

      this.isInitialized = true;
      logger.info('Theme manager initialized', {
        data: { theme: this.currentTheme, mode: this.currentMode },
      });
    } catch (error) {
      logger.error('Failed to initialize theme manager', {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * 加载用户自定义主题
   */
  private async loadUserThemes(): Promise<void> {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      const storedThemes = localStorage.getItem('user_themes');
      if (storedThemes) {
        const themes = JSON.parse(storedThemes);
        Object.entries(themes).forEach(([name, config]) => {
          this.themes.set(name, config as ThemeConfig);
        });
      }
    } catch (error) {
      logger.error('Failed to load user themes', {
        error: error as Error,
      });
    }
  }

  /**
   * 保存用户主题
   */
  private async saveUserThemes(): Promise<void> {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      const userThemes: Record<string, ThemeConfig> = {};
      this.themes.forEach((config, name) => {
        if (!this.defaultThemes[name]) {
          userThemes[name] = config;
        }
      });
      localStorage.setItem('user_themes', JSON.stringify(userThemes));
    } catch (error) {
      logger.error('Failed to save user themes', {
        error: error as Error,
      });
    }
  }

  /**
   * 获取存储的主题
   */
  private getStoredTheme(): string {
    if (typeof window === 'undefined') return 'default';
    return localStorage.getItem('current_theme') || 'default';
  }

  /**
   * 获取存储的模式
   */
  private getStoredMode(): ThemeMode {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme_mode') as ThemeMode) || 'system';
  }

  /**
   * 应用主题
   */
  private async applyTheme(themeName: string, mode: ThemeMode): Promise<void> {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    const theme = this.themes.get(themeName);
    if (!theme) {
      logger.warn('Theme not found', { data: { themeName } });
      return;
    }

    // 确定实际模式
    const actualMode: 'light' | 'dark' = mode === 'system' ? this.getSystemTheme() : mode;

    // 应用主题变量
    this.applyThemeVariables(theme, actualMode);

    // 更新 HTML 属性
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.setAttribute('data-theme-mode', actualMode);

    // 保存设置
    localStorage.setItem('current_theme', themeName);
    localStorage.setItem('theme_mode', mode);

    logger.info('Theme applied', {
      data: { theme: themeName, mode: actualMode },
    });
  }

  /**
   * 获取系统主题
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * 应用主题变量
   */
  private applyThemeVariables(theme: ThemeConfig, mode: 'light' | 'dark'): void {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // 应用基础变量
    Object.entries(theme.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 根据模式调整变量
    if (mode === 'dark') {
      // 应用暗色模式调整
      this.applyDarkModeAdjustments(root);
    }
  }

  /**
   * 应用暗色模式调整
   */
  private applyDarkModeAdjustments(root: HTMLElement): void {
    // 可以在这里添加暗色模式的特殊调整
    // 例如调整某些颜色的透明度或亮度
  }

  /**
   * 设置主题
   */
  public async setTheme(themeName: string): Promise<void> {
    if (!this.themes.has(themeName)) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    this.currentTheme = themeName;
    await this.applyTheme(themeName, this.currentMode);

    // 触发主题切换事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: themeName, mode: this.currentMode },
      }));
    }
  }

  /**
   * 设置主题模式
   */
  public async setMode(mode: ThemeMode): Promise<void> {
    this.currentMode = mode;
    await this.applyTheme(this.currentTheme, mode);

    // 触发模式切换事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeModeChanged', {
        detail: { theme: this.currentTheme, mode },
      }));
    }
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * 获取当前模式
   */
  public getCurrentMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * 获取主题配置
   */
  public getTheme(themeName: string): ThemeConfig | undefined {
    return this.themes.get(themeName);
  }

  /**
   * 获取所有主题
   */
  public getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  /**
   * 创建自定义主题
   */
  public async createTheme(
    name: string,
    baseTheme: string,
    customVariables: Record<string, string>
  ): Promise<void> {
    const baseConfig = this.themes.get(baseTheme);
    if (!baseConfig) {
      throw new Error(`Base theme '${baseTheme}' not found`);
    }

    const newTheme: ThemeConfig = {
      ...baseConfig,
      name,
      variables: {
        ...baseConfig.variables,
        ...customVariables,
      },
      metadata: {
        ...baseConfig.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    this.themes.set(name, newTheme);
    await this.saveUserThemes();

    logger.info('Custom theme created', {
      data: { name, baseTheme },
    });
  }

  /**
   * 更新主题
   */
  public async updateTheme(
    name: string,
    updates: Partial<ThemeConfig>
  ): Promise<void> {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme '${name}' not found`);
    }

    const updatedTheme: ThemeConfig = {
      ...theme,
      ...updates,
      metadata: {
        ...theme.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    this.themes.set(name, updatedTheme);
    await this.saveUserThemes();

    // 如果更新的是当前主题，重新应用
    if (name === this.currentTheme) {
      await this.applyTheme(name, this.currentMode);
    }

    logger.info('Theme updated', { data: { name } });
  }

  /**
   * 删除主题
   */
  public async deleteTheme(name: string): Promise<void> {
    if (this.defaultThemes[name]) {
      throw new Error(`Cannot delete default theme '${name}'`);
    }

    if (name === this.currentTheme) {
      throw new Error('Cannot delete current theme');
    }

    this.themes.delete(name);
    await this.saveUserThemes();

    logger.info('Theme deleted', { data: { name } });
  }

  /**
   * 导出主题
   */
  public exportTheme(name: string): string {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme '${name}' not found`);
    }

    return JSON.stringify(theme, null, 2);
  }

  /**
   * 导入主题
   */
  public async importTheme(themeJson: string): Promise<void> {
    try {
      const theme: ThemeConfig = JSON.parse(themeJson);
      
      // 验证主题格式
      if (!theme.name || !theme.variables) {
        throw new Error('Invalid theme format');
      }

      this.themes.set(theme.name, theme);
      await this.saveUserThemes();

      logger.info('Theme imported', { data: { name: theme.name } });
    } catch (error) {
      logger.error('Failed to import theme', {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * 重置主题
   */
  public async resetTheme(name: string): Promise<void> {
    if (!this.defaultThemes[name]) {
      throw new Error(`Cannot reset custom theme '${name}'`);
    }

    const defaultTheme = this.defaultThemes[name];
    this.themes.set(name, { ...defaultTheme });
    await this.saveUserThemes();

    // 如果重置的是当前主题，重新应用
    if (name === this.currentTheme) {
      await this.applyTheme(name, this.currentMode);
    }

    logger.info('Theme reset', { data: { name } });
  }

  /**
   * 获取主题变量值
   */
  public getThemeVariable(variable: string): string | null {
    if (typeof window === 'undefined') return null;
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(variable).trim();
  }

  /**
   * 设置主题变量
   */
  public setThemeVariable(variable: string, value: string): void {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty(variable, value);
  }

  /**
   * 检查是否已初始化
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * 全局主题管理器实例
 */
export const themeManager = new ThemeManager();

/**
 * 主题 Hook
 */
export function useTheme() {
  const [theme, setTheme] = React.useState<string>(themeManager.getCurrentTheme());
  const [mode, setMode] = React.useState<ThemeMode>(themeManager.getCurrentMode());

  React.useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail.theme);
    };

    const handleModeChange = (event: CustomEvent) => {
      setMode(event.detail.mode);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    window.addEventListener('themeModeChanged', handleModeChange as EventListener);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
      window.removeEventListener('themeModeChanged', handleModeChange as EventListener);
    };
  }, []);

  const changeTheme = React.useCallback(async (themeName: string) => {
    await themeManager.setTheme(themeName);
  }, []);

  const changeMode = React.useCallback(async (newMode: ThemeMode) => {
    await themeManager.setMode(newMode);
  }, []);

  const getThemeVariable = React.useCallback((variable: string) => {
    return themeManager.getThemeVariable(variable);
  }, []);

  const setThemeVariable = React.useCallback((variable: string, value: string) => {
    themeManager.setThemeVariable(variable, value);
  }, []);

  return {
    theme,
    mode,
    changeTheme,
    changeMode,
    getThemeVariable,
    setThemeVariable,
    getAllThemes: themeManager.getAllThemes.bind(themeManager),
    createTheme: themeManager.createTheme.bind(themeManager),
    updateTheme: themeManager.updateTheme.bind(themeManager),
    deleteTheme: themeManager.deleteTheme.bind(themeManager),
    exportTheme: themeManager.exportTheme.bind(themeManager),
    importTheme: themeManager.importTheme.bind(themeManager),
  };
}

/**
 * 主题切换组件
 * 注意：由于此文件是 .ts 扩展名，JSX 组件已被注释。如需使用，请创建单独的 .tsx 文件。
 */
// export function ThemeSwitcher() {
//   const { theme, changeTheme, getAllThemes } = useTheme();
//   const themes = getAllThemes();
//
//   return (
//     <select
//       value={theme}
//       onChange={(e) => changeTheme(e.target.value)}
//       className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//     >
//       {themes.map((t) => (
//         <option key={t.name} value={t.name}>
//           {t.name}
//         </option>
//       ))}
//     </select>
//   );
// }

/**
 * 模式切换组件
 * 注意：由于此文件是 .ts 扩展名，JSX 组件已被注释。如需使用，请创建单独的 .tsx 文件。
 */
// export function ModeSwitcher() {
//   const { mode, changeMode } = useTheme();
//
//   return (
//     <div className="flex items-center space-x-2">
//       <button
//         onClick={() => changeMode('light')}
//         className={`px-3 py-2 rounded-md ${
//           mode === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
//         }`}
//       >
//         浅色
//       </button>
//       <button
//         onClick={() => changeMode('dark')}
//         className={`px-3 py-2 rounded-md ${
//           mode === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
//         }`}
//       >
//         深色
//       </button>
//       <button
//         onClick={() => changeMode('system')}
//         className={`px-3 py-2 rounded-md ${
//           mode === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
//         }`}
//       >
//         跟随系统
//       </button>
//     </div>
//   );
// }

/**
 * 初始化主题
 */
export async function initializeTheme() {
  await themeManager.initialize();
}












