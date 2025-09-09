"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

// 页面标题映射
const PAGE_TITLES: Record<string, string> = {
  "/": "项目概览",
  "/requirements": "需求池",
  "/requirements/new": "提交需求",
  "/kanban": "任务看板", 
  "/issues": "Issues",
  "/issues/new": "创建Issue"
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] || "AiCoin 产品管理系统"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b py-4 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* 这里可以添加其他头部操作按钮 */}
        </div>
      </div>
    </header>
  )
}
