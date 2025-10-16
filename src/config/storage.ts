/**
 * Storage 配置
 * 
 * 从统一配置中导出，供各个模块使用
 * 
 * @module storage-config
 */

import { CONFIG_VERSIONS as VERSIONS, STORAGE_KEYS as KEYS } from './app';

/**
 * 配置版本
 */
export const CONFIG_VERSIONS = VERSIONS;

/**
 * Storage 键名
 */
export const STORAGE_KEYS = KEYS;

/**
 * 默认导出
 */
export default {
  CONFIG_VERSIONS,
  STORAGE_KEYS,
};
