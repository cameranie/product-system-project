/**
 * 国际化支持
 * 
 * P3 功能：提供多语言支持
 * 
 * 功能特性：
 * - 多语言切换
 * - 动态语言加载
 * - 格式化支持
 * - 复数处理
 * - 嵌套翻译
 * - 类型安全
 * 
 * @module i18n
 */

import { logger } from './logger';

/**
 * 支持的语言
 */
export type SupportedLocale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';

/**
 * 语言配置
 */
export interface LocaleConfig {
  /** 语言代码 */
  code: SupportedLocale;
  /** 语言名称 */
  name: string;
  /** 本地化名称 */
  nativeName: string;
  /** 方向 */
  direction: 'ltr' | 'rtl';
  /** 日期格式 */
  dateFormat: string;
  /** 时间格式 */
  timeFormat: string;
  /** 数字格式 */
  numberFormat: Intl.NumberFormatOptions;
  /** 货币格式 */
  currencyFormat: Intl.NumberFormatOptions;
}

/**
 * 翻译键值对
 */
export type TranslationKey = string;
export type TranslationValue = string | Record<string, any>;

/**
 * 翻译数据
 */
export type TranslationData = Record<TranslationKey, TranslationValue>;

/**
 * 语言包
 */
export interface LanguagePack {
  locale: SupportedLocale;
  data: TranslationData;
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
  };
}

/**
 * 翻译参数
 */
export interface TranslationParams {
  [key: string]: string | number | boolean;
}

/**
 * 复数规则
 */
export interface PluralRule {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * 国际化管理器
 */
class I18nManager {
  private currentLocale: SupportedLocale = 'zh-CN';
  private translations: Map<SupportedLocale, TranslationData> = new Map();
  private fallbackLocale: SupportedLocale = 'en-US';
  private isInitialized: boolean = false;

  /**
   * 语言配置
   */
  private localeConfigs: Record<SupportedLocale, LocaleConfig> = {
    'zh-CN': {
      code: 'zh-CN',
      name: 'Chinese (Simplified)',
      nativeName: '简体中文',
      direction: 'ltr',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm:ss',
      numberFormat: { style: 'decimal' },
      currencyFormat: { style: 'currency', currency: 'CNY' },
    },
    'en-US': {
      code: 'en-US',
      name: 'English (US)',
      nativeName: 'English',
      direction: 'ltr',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'h:mm:ss A',
      numberFormat: { style: 'decimal' },
      currencyFormat: { style: 'currency', currency: 'USD' },
    },
    'ja-JP': {
      code: 'ja-JP',
      name: 'Japanese',
      nativeName: '日本語',
      direction: 'ltr',
      dateFormat: 'YYYY/MM/DD',
      timeFormat: 'HH:mm:ss',
      numberFormat: { style: 'decimal' },
      currencyFormat: { style: 'currency', currency: 'JPY' },
    },
    'ko-KR': {
      code: 'ko-KR',
      name: 'Korean',
      nativeName: '한국어',
      direction: 'ltr',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm:ss',
      numberFormat: { style: 'decimal' },
      currencyFormat: { style: 'currency', currency: 'KRW' },
    },
  };

  /**
   * 初始化国际化
   */
  public async initialize(locale?: SupportedLocale): Promise<void> {
    try {
      // 设置当前语言
      if (locale) {
        this.currentLocale = locale;
      } else {
        // 从浏览器设置或本地存储获取
        this.currentLocale = this.getPreferredLocale();
      }

      // 加载语言包
      await this.loadLanguagePack(this.currentLocale);

      this.isInitialized = true;
      logger.info('I18n initialized', {
        data: { locale: this.currentLocale },
      });
    } catch (error) {
      logger.error('Failed to initialize i18n', {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * 获取首选语言
   */
  private getPreferredLocale(): SupportedLocale {
    // 只在客户端执行
    if (typeof window === 'undefined') {
      return 'zh-CN';
    }
    
    // 从本地存储获取
    const stored = localStorage.getItem('preferred_locale');
    if (stored && this.isSupportedLocale(stored)) {
      return stored as SupportedLocale;
    }

    // 从浏览器语言设置获取
    const browserLocale = navigator.language;
    if (this.isSupportedLocale(browserLocale)) {
      return browserLocale as SupportedLocale;
    }

    // 检查语言前缀
    const languagePrefix = browserLocale.split('-')[0];
    const supportedPrefixes: Record<string, SupportedLocale> = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
    };

    if (supportedPrefixes[languagePrefix]) {
      return supportedPrefixes[languagePrefix];
    }

    // 默认返回中文
    return 'zh-CN';
  }

  /**
   * 检查是否为支持的语言
   */
  private isSupportedLocale(locale: string): locale is SupportedLocale {
    return ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'].includes(locale);
  }

  /**
   * 加载语言包
   */
  private async loadLanguagePack(locale: SupportedLocale): Promise<void> {
    try {
      // 如果已经加载过，直接返回
      if (this.translations.has(locale)) {
        return;
      }

      // 动态导入语言包
      const languagePack = await import(`@/locales/${locale}.json`);
      this.translations.set(locale, languagePack.default);

      logger.info('Language pack loaded', {
        data: { locale },
      });
    } catch (error) {
      logger.error('Failed to load language pack', {
        error: error as Error,
        data: { locale },
      });

      // 如果加载失败，尝试加载备用语言
      if (locale !== this.fallbackLocale) {
        await this.loadLanguagePack(this.fallbackLocale);
      }
    }
  }

  /**
   * 切换语言
   */
  public async setLocale(locale: SupportedLocale): Promise<void> {
    if (locale === this.currentLocale) return;

    try {
      // 加载新语言包
      await this.loadLanguagePack(locale);

      // 更新当前语言
      this.currentLocale = locale;

      // 只在客户端执行
      if (typeof window !== 'undefined') {
        // 保存到本地存储
        localStorage.setItem('preferred_locale', locale);

        // 更新 HTML 属性
        document.documentElement.lang = locale;
        document.documentElement.dir = this.localeConfigs[locale].direction;

        // 触发语言切换事件
        window.dispatchEvent(new CustomEvent('localeChanged', {
          detail: { locale },
        }));
      }

      logger.info('Locale changed', {
        data: { locale },
      });
    } catch (error) {
      logger.error('Failed to change locale', {
        error: error as Error,
        data: { locale },
      });
      throw error;
    }
  }

  /**
   * 获取当前语言
   */
  public getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * 获取语言配置
   */
  public getLocaleConfig(locale?: SupportedLocale): LocaleConfig {
    return this.localeConfigs[locale || this.currentLocale];
  }

  /**
   * 翻译文本
   */
  public t(key: TranslationKey, params?: TranslationParams): string {
    if (!this.isInitialized) {
      logger.warn('I18n not initialized, returning key');
      return key;
    }

    try {
      const translation = this.getTranslation(key);
      if (!translation) {
        logger.warn('Translation not found', {
          data: { key, locale: this.currentLocale },
        });
        return key;
      }

      // 处理参数替换
      if (params && typeof translation === 'string') {
        return this.interpolate(translation, params);
      }

      return translation as string;
    } catch (error) {
      logger.error('Translation error', {
        error: error as Error,
        data: { key, params },
      });
      return key;
    }
  }

  /**
   * 获取翻译
   */
  private getTranslation(key: TranslationKey): TranslationValue | null {
    const translations = this.translations.get(this.currentLocale);
    if (!translations) return null;

    // 支持嵌套键，如 'user.profile.name'
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * 参数插值
   */
  private interpolate(template: string, params: TranslationParams): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * 复数处理
   */
  public plural(key: TranslationKey, count: number, params?: TranslationParams): string {
    const translation = this.getTranslation(key);
    if (!translation || typeof translation !== 'object') {
      return this.t(key, { ...params, count });
    }

    const pluralRules = translation as PluralRule;
    let rule: string;

    // 根据语言和数量选择规则
    switch (this.currentLocale) {
      case 'zh-CN':
      case 'ja-JP':
      case 'ko-KR':
        // 中文、日文、韩文没有复数形式
        rule = pluralRules.other;
        break;
      case 'en-US':
        if (count === 0 && pluralRules.zero) {
          rule = pluralRules.zero;
        } else if (count === 1 && pluralRules.one) {
          rule = pluralRules.one;
        } else if (count === 2 && pluralRules.two) {
          rule = pluralRules.two;
        } else if (count > 2 && count < 5 && pluralRules.few) {
          rule = pluralRules.few;
        } else if (count >= 5 && pluralRules.many) {
          rule = pluralRules.many;
        } else {
          rule = pluralRules.other;
        }
        break;
      default:
        rule = pluralRules.other;
    }

    return this.interpolate(rule, { ...params, count });
  }

  /**
   * 格式化日期
   */
  public formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const config = this.getLocaleConfig();
    const locale = this.currentLocale;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
  }

  /**
   * 格式化时间
   */
  public formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const config = this.getLocaleConfig();
    const locale = this.currentLocale;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
  }

  /**
   * 格式化数字
   */
  public formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const config = this.getLocaleConfig();
    const locale = this.currentLocale;

    const defaultOptions: Intl.NumberFormatOptions = {
      ...config.numberFormat,
      ...options,
    };

    return new Intl.NumberFormat(locale, defaultOptions).format(number);
  }

  /**
   * 格式化货币
   */
  public formatCurrency(amount: number, currency?: string, options?: Intl.NumberFormatOptions): string {
    const config = this.getLocaleConfig();
    const locale = this.currentLocale;

    const defaultOptions: Intl.NumberFormatOptions = {
      ...config.currencyFormat,
      currency: currency || config.currencyFormat.currency,
      ...options,
    };

    return new Intl.NumberFormat(locale, defaultOptions).format(amount);
  }

  /**
   * 格式化相对时间
   */
  public formatRelativeTime(date: Date | string, unit?: Intl.RelativeTimeFormatUnit | 'auto'): string {
    const locale = this.currentLocale;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (!unit || unit === 'auto') {
      if (Math.abs(years) >= 1) return rtf.format(years, 'year');
      if (Math.abs(months) >= 1) return rtf.format(months, 'month');
      if (Math.abs(weeks) >= 1) return rtf.format(weeks, 'week');
      if (Math.abs(days) >= 1) return rtf.format(days, 'day');
      if (Math.abs(hours) >= 1) return rtf.format(hours, 'hour');
      if (Math.abs(minutes) >= 1) return rtf.format(minutes, 'minute');
      return rtf.format(seconds, 'second');
    }

    switch (unit) {
      case 'year': return rtf.format(years, 'year');
      case 'month': return rtf.format(months, 'month');
      case 'week': return rtf.format(weeks, 'week');
      case 'day': return rtf.format(days, 'day');
      case 'hour': return rtf.format(hours, 'hour');
      case 'minute': return rtf.format(minutes, 'minute');
      case 'second': return rtf.format(seconds, 'second');
      default: return rtf.format(seconds, 'second');
    }
  }

  /**
   * 获取支持的语言列表
   */
  public getSupportedLocales(): SupportedLocale[] {
    return Object.keys(this.localeConfigs) as SupportedLocale[];
  }

  /**
   * 检查是否已初始化
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * 全局国际化实例
 */
export const i18n = new I18nManager();

/**
 * 翻译 Hook
 * 注意：由于此文件是 .ts 扩展名，React Hook 已被注释。如需使用，请创建单独的 .tsx 文件。
 */
// export function useTranslation() {
//   const [locale, setLocale] = React.useState<SupportedLocale>(i18n.getCurrentLocale());
//
//   React.useEffect(() => {
//     const handleLocaleChange = (event: CustomEvent) => {
//       setLocale(event.detail.locale);
//     };
//
//     window.addEventListener('localeChanged', handleLocaleChange as EventListener);
//     return () => {
//       window.removeEventListener('localeChanged', handleLocaleChange as EventListener);
//     };
//   }, []);
//
//   const t = React.useCallback((key: TranslationKey, params?: TranslationParams) => {
//     return i18n.t(key, params);
//   }, [locale]);
//
//   const changeLocale = React.useCallback(async (newLocale: SupportedLocale) => {
//     await i18n.setLocale(newLocale);
//   }, []);
//
//   return {
//     t,
//     locale,
//     changeLocale,
//     formatDate: i18n.formatDate.bind(i18n),
//     formatTime: i18n.formatTime.bind(i18n),
//     formatNumber: i18n.formatNumber.bind(i18n),
//     formatCurrency: i18n.formatCurrency.bind(i18n),
//     formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
//     plural: i18n.plural.bind(i18n),
//   };
// }

/**
 * 翻译组件
 */
export interface TransProps {
  /** 翻译键 */
  i18nKey: TranslationKey;
  /** 翻译参数 */
  values?: TranslationParams;
  /** 默认文本 */
  defaults?: string;
  /** 组件类型 */
  component?: React.ComponentType<any>;
  /** 子组件 */
  children?: React.ReactNode;
}

// 注意：由于此文件是 .ts 扩展名，JSX 组件已被注释。如需使用，请创建单独的 .tsx 文件。
// export function Trans({ i18nKey, values, defaults, component: Component, children }: TransProps) {
//   const { t } = useTranslation();
//   const text = t(i18nKey, values) || defaults || i18nKey;
//
//   if (Component) {
//     return <Component>{text}</Component>;
//   }
//
//   if (children) {
//     return <>{children}</>;
//   }
//
//   return <>{text}</>;
// }

/**
 * 语言切换组件
 * 注意：由于此文件是 .ts 扩展名，JSX 组件已被注释。如需使用，请创建单独的 .tsx 文件。
 */
// export function LocaleSwitcher() {
//   const { locale, changeLocale } = useTranslation();
//   const supportedLocales = i18n.getSupportedLocales();
//
//   return (
//     <select
//       value={locale}
//       onChange={(e) => changeLocale(e.target.value as SupportedLocale)}
//       className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//     >
//       {supportedLocales.map((loc) => {
//         const config = i18n.getLocaleConfig(loc);
//         return (
//           <option key={loc} value={loc}>
//             {config.nativeName}
//           </option>
//         );
//       })}
//     </select>
//   );
// }

/**
 * 初始化国际化
 */
export async function initializeI18n(locale?: SupportedLocale) {
  await i18n.initialize(locale);
}












