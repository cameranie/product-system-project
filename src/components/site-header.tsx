"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronRight, Home } from "lucide-react"

// 面包屑配置
interface BreadcrumbItem {
  title: string
  href?: string
}

// 根据路径生成面包屑
function generateBreadcrumbs(pathname: string, searchParams: URLSearchParams | null): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "首页", href: "/kanban" }
  ]

  // 获取来源参数
  const fromParam = searchParams?.get('from')

  // 预排期独立页面
  if (segments[0] === 'scheduled') {
    breadcrumbs.push({ title: "预排期" })
  }
  // 需求相关路径特殊处理
  else if (segments[0] === 'requirements') {
    // 如果是需求池首页，不带href（显示为黑色）
    if (segments.length === 1) {
      breadcrumbs.push({ title: "需求池" })
    }
    // 如果有子路径
    else {
      // 如果from参数是scheduled，说明是从预排期来的
      if (fromParam === 'scheduled') {
        breadcrumbs.push({ title: "预排期", href: "/scheduled" })
      } else {
        breadcrumbs.push({ title: "需求池", href: "/requirements" })
      }
      
      if (segments[1] === 'new') {
        breadcrumbs.push({ title: "新建需求" })
      } else if (segments[1] === 'demo') {
        breadcrumbs.push({ title: "功能演示" })
      } else if (segments[1] && segments[2] === 'edit') {
        // 编辑页：需要保持来源参数
        const detailHref = `/requirements/${segments[1]}${fromParam ? `?from=${fromParam}` : ''}`
        breadcrumbs.push({ title: "需求详情", href: detailHref })
        breadcrumbs.push({ title: "编辑需求" })
      } else if (segments[1]) {
        // 需求详情页
        breadcrumbs.push({ title: `需求 ${decodeURIComponent(segments[1])}` })
      }
    }
  }

  // 人员管理相关路径
  else if (segments[0] === 'personnel') {
    breadcrumbs.push({ title: "人员管理", href: "/personnel" })
    
    if (segments[1] === 'new') {
      breadcrumbs.push({ title: "新建人员" })
    } else if (segments[1] && segments[2] === 'edit') {
      breadcrumbs.push({ title: "人员详情", href: `/personnel/${segments[1]}` })
      breadcrumbs.push({ title: "编辑人员" })
    } else if (segments[1]) {
      breadcrumbs.push({ title: "人员详情" })
    }
  }
  
  // 权限管理相关路径
  else if (segments[0] === 'admin' && segments[1] === 'permissions') {
    breadcrumbs.push({ title: "权限管理", href: "/admin/permissions" })
    
    if (segments[2] === 'preview') {
      breadcrumbs.push({ title: "权限预览" })
    } else if (segments[2] === 'grants') {
      breadcrumbs.push({ title: "临时授权" })
    } else if (segments[2] === 'fields') {
      breadcrumbs.push({ title: "字段管理" })
    } else if (segments[2] === 'visibility') {
      breadcrumbs.push({ title: "可见性管理" })
    }
  }
  
  // 版本号管理路径
  else if (segments[0] === 'versions') {
    breadcrumbs.push({ title: "版本号管理" })
  }
  
  // 其他路径的默认处理
  else {
    const pageMap: Record<string, string> = {
      "kanban": "任务看板",
      "issues": "Issues"
    }
    
    segments.forEach((segment, index) => {
      // 解码URL段，特别是处理需求ID
      const decodedSegment = decodeURIComponent(segment)
      const title = pageMap[segment] || decodedSegment
      const href = index === segments.length - 1 ? undefined : '/' + segments.slice(0, index + 1).join('/')
      breadcrumbs.push({ title, href })
    })
  }

  return breadcrumbs
}

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b py-4 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {/* 面包屑导航 */}
        <Suspense fallback={<div className="text-sm text-muted-foreground">加载中...</div>}>
          <BreadcrumbNav />
        </Suspense>
        
        <div className="ml-auto flex items-center gap-2">
          {/* 这里可以添加其他头部操作按钮 */}
        </div>
      </div>
    </header>
  )
}

function BreadcrumbNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const breadcrumbs = generateBreadcrumbs(pathname, searchParams)

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          )}
          {crumb.href ? (
            <Link 
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {index === 0 ? (
                <Home className="h-4 w-4" />
              ) : (
                crumb.title
              )}
            </Link>
          ) : (
            <span className="font-medium text-foreground">
              {crumb.title}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
