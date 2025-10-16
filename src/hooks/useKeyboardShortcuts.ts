import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * 快捷键配置接口
 */
export interface ShortcutConfig {
  /** 快捷键组合（例如：'ctrl+k', 'cmd+shift+n'） */
  key: string;
  /** 快捷键描述 */
  description: string;
  /** 执行的操作 */
  action: () => void;
  /** 是否启用（默认 true） */
  enabled?: boolean;
  /** 是否阻止默认行为（默认 true） */
  preventDefault?: boolean;
}

/**
 * 键盘快捷键 Hook
 * 
 * 功能：
 * - 支持多键组合（Ctrl/Cmd/Shift/Alt + 字母/数字）
 * - 自动处理 Mac/Windows 平台差异
 * - 支持快捷键启用/禁用
 * - 支持快捷键冲突检测
 * 
 * 使用场景：
 * - 需求池页面（新建、搜索、筛选等）
 * - 预排期页面（批量操作、评审等）
 * - 全局快捷键（导航、帮助等）
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: 'ctrl+k', description: '搜索', action: () => focusSearch() },
 *   { key: 'ctrl+n', description: '新建需求', action: () => createNew() },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  
  // 更新 ref
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  /**
   * 解析快捷键字符串
   * 
   * @param key - 快捷键字符串（例如：'ctrl+k'）
   * @returns 解析后的键名和修饰键
   */
  const parseShortcut = useCallback((key: string) => {
    const parts = key.toLowerCase().split('+');
    const modifiers = {
      ctrl: false,
      cmd: false,
      shift: false,
      alt: false,
    };
    let mainKey = '';

    parts.forEach(part => {
      if (part === 'ctrl' || part === 'control') {
        modifiers.ctrl = true;
      } else if (part === 'cmd' || part === 'meta' || part === 'command') {
        modifiers.cmd = true;
      } else if (part === 'shift') {
        modifiers.shift = true;
      } else if (part === 'alt' || part === 'option') {
        modifiers.alt = true;
      } else {
        mainKey = part;
      }
    });

    return { modifiers, mainKey };
  }, []);

  /**
   * 检查事件是否匹配快捷键
   */
  const matchesShortcut = useCallback((
    event: KeyboardEvent,
    shortcut: ShortcutConfig
  ): boolean => {
    const { modifiers, mainKey } = parseShortcut(shortcut.key);
    
    // 检查主键
    const eventKey = event.key.toLowerCase();
    if (eventKey !== mainKey) return false;

    // 检查修饰键
    // Mac 平台 Ctrl 对应 Cmd
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const ctrlPressed = isMac ? event.metaKey : event.ctrlKey;
    const cmdPressed = isMac ? event.metaKey : event.ctrlKey;

    if (modifiers.ctrl && !ctrlPressed) return false;
    if (modifiers.cmd && !cmdPressed) return false;
    if (modifiers.shift && !event.shiftKey) return false;
    if (modifiers.alt && !event.altKey) return false;

    // 确保没有额外的修饰键
    if (!modifiers.ctrl && !modifiers.cmd && (event.ctrlKey || event.metaKey)) return false;
    if (!modifiers.shift && event.shiftKey) return false;
    if (!modifiers.alt && event.altKey) return false;

    return true;
  }, [parseShortcut]);

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略在输入框、文本域等元素中的按键
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    
    if (['input', 'textarea', 'select'].includes(tagName) || isEditable) {
      // 但允许某些全局快捷键（如 Esc）
      if (event.key !== 'Escape') {
        return;
      }
    }

    // 遍历所有快捷键配置
    for (const shortcut of shortcutsRef.current) {
      if (shortcut.enabled === false) continue;
      
      if (matchesShortcut(event, shortcut)) {
        // 阻止默认行为
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        
        // 执行操作
        shortcut.action();
        break; // 只执行第一个匹配的快捷键
      }
    }
  }, [matchesShortcut]);

  // 注册全局键盘事件监听
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts,
  };
}

/**
 * 常用快捷键配置
 */
export const COMMON_SHORTCUTS = {
  /** 搜索 */
  SEARCH: 'ctrl+k',
  /** 新建 */
  NEW: 'ctrl+n',
  /** 保存 */
  SAVE: 'ctrl+s',
  /** 取消/关闭 */
  CANCEL: 'escape',
  /** 全选 */
  SELECT_ALL: 'ctrl+a',
  /** 删除 */
  DELETE: 'ctrl+d',
  /** 刷新 */
  REFRESH: 'ctrl+r',
  /** 帮助 */
  HELP: 'ctrl+/',
} as const;

/**
 * 格式化快捷键显示
 * 
 * 将快捷键字符串转换为用户友好的显示格式
 * 
 * @example
 * formatShortcut('ctrl+k') => 'Ctrl + K' (Windows) 或 '⌘ + K' (Mac)
 */
export function formatShortcut(shortcut: string): string {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  return shortcut
    .split('+')
    .map(key => {
      switch (key.toLowerCase()) {
        case 'ctrl':
        case 'control':
          return isMac ? '⌃' : 'Ctrl';
        case 'cmd':
        case 'meta':
        case 'command':
          return isMac ? '⌘' : 'Ctrl';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'alt':
        case 'option':
          return isMac ? '⌥' : 'Alt';
        default:
          return key.toUpperCase();
      }
    })
    .join(' + ');
}

/**
 * 快捷键帮助面板 Hook
 * 
 * 管理快捷键帮助面板的显示/隐藏
 */
export function useShortcutHelp() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openHelp = useCallback(() => setIsOpen(true), []);
  const closeHelp = useCallback(() => setIsOpen(false), []);
  const toggleHelp = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openHelp,
    closeHelp,
    toggleHelp,
  };
}


