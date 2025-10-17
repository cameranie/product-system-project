'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatShortcut, ShortcutConfig } from '@/hooks/useKeyboardShortcuts';
import { Keyboard } from 'lucide-react';

interface ShortcutHelpProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 快捷键列表 */
  shortcuts: ShortcutConfig[];
}

/**
 * 快捷键帮助对话框
 * 
 * 显示所有可用的键盘快捷键
 * 
 * @example
 * <ShortcutHelp
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   shortcuts={myShortcuts}
 * />
 */
export function ShortcutHelp({ open, onOpenChange, shortcuts }: ShortcutHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            键盘快捷键
          </DialogTitle>
          <DialogDescription>
            使用键盘快捷键提升操作效率
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* 快捷键列表 */}
          <div className="grid gap-2">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatShortcut(shortcut.key)}
                </Badge>
              </div>
            ))}
          </div>

          {/* 提示 */}
          <div className="mt-6 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              💡 提示：在输入框中快捷键不会生效（除了 Esc 键）
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 快捷键提示徽章
 * 
 * 显示在按钮旁边的快捷键提示
 * 
 * @example
 * <Button>
 *   新建需求
 *   <ShortcutBadge shortcut="ctrl+n" />
 * </Button>
 */
export function ShortcutBadge({ shortcut }: { shortcut: string }) {
  return (
    <Badge 
      variant="outline" 
      className="ml-auto font-mono text-xs opacity-60"
    >
      {formatShortcut(shortcut)}
    </Badge>
  );
}





