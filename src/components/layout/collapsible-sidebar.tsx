'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSidebarProps {
  /** 左侧主内容 */
  children: React.ReactNode;
  /** 右侧侧边栏内容 */
  sidebar: React.ReactNode;
  /** 默认是否展开，默认为 true */
  defaultExpanded?: boolean;
  /** 侧边栏标题（用于无障碍访问） */
  sidebarTitle?: string;
}

/**
 * 可收起的侧边栏布局组件
 * 
 * 提供左右两栏布局，右侧栏可以收起/展开
 * - 展开时：左侧 2/3 宽度，右侧 1/3 宽度
 * - 收起时：左侧占满全宽，右侧隐藏
 * - 提供浮动按钮切换状态
 */
export function CollapsibleSidebar({
  children,
  sidebar,
  defaultExpanded = true,
  sidebarTitle = '侧边栏'
}: CollapsibleSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="relative">
      <div className={cn(
        "grid gap-6 transition-all duration-300",
        isExpanded ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {/* 左侧主内容 */}
        <div className={cn(
          "space-y-6 transition-all duration-300",
          isExpanded ? "lg:col-span-2" : "col-span-1"
        )}>
          {children}
        </div>

        {/* 右侧侧边栏 */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isExpanded ? "opacity-100 max-h-full" : "opacity-0 max-h-0 lg:hidden"
          )}
          aria-label={sidebarTitle}
          aria-hidden={!isExpanded}
        >
          <div className="space-y-6">
            {sidebar}
          </div>
        </div>
      </div>

      {/* 收起/展开按钮 - 浮动在右侧 */}
      <div className={cn(
        "fixed z-10 transition-all duration-300",
        "top-1/2 -translate-y-1/2",
        isExpanded ? "right-4" : "right-4"
      )}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-10 w-10 rounded-full shadow-lg",
            "bg-background border-2 hover:bg-accent",
            "hidden lg:flex items-center justify-center"
          )}
          title={isExpanded ? "收起侧边栏" : "展开侧边栏"}
          aria-label={isExpanded ? "收起侧边栏" : "展开侧边栏"}
        >
          {isExpanded ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

