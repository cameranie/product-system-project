"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fromSource = searchParams?.get('from')
  
  // 判断菜单项是否激活
  const isItemActive = (itemUrl: string, hasSubItems: boolean = false, allItems: typeof items = []) => {
    // 如果有子项，只要路径以该 URL 开头就算激活
    if (hasSubItems) {
      return pathname.startsWith(itemUrl)
    }
    
    // 特殊处理：如果是从预排期来的需求详情页，激活预排期而不是需求池
    if (fromSource === 'scheduled' && pathname.startsWith('/requirements/') && itemUrl === '/requirements/scheduled') {
      return true
    }
    if (fromSource === 'scheduled' && pathname.startsWith('/requirements/') && itemUrl === '/requirements') {
      return false
    }
    
    // 检查是否有其他更具体的路径匹配（避免 /requirements 和 /requirements/scheduled 同时激活）
    const moreSpecificMatch = allItems.some(item => {
      if (item.url === itemUrl) return false // 跳过自己
      return item.url.startsWith(itemUrl) && pathname.startsWith(item.url)
    })
    
    if (moreSpecificMatch) {
      return false // 如果有更具体的匹配，当前项不激活
    }
    
    // 精确匹配或者匹配子路径
    return pathname === itemUrl || pathname.startsWith(itemUrl + '/')
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0
            const isActive = isItemActive(item.url, hasSubItems, items)
            
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={hasSubItems}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      isActive={isActive}
                      className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {hasSubItems && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {hasSubItems && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items!.map((subItem) => {
                          const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + '/')
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild 
                                isActive={isSubActive}
                                className="data-[active=true]:bg-accent/80 data-[active=true]:text-accent-foreground"
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                  {!hasSubItems && (
                    <Link href={item.url} className="absolute inset-0 z-10" />
                  )}
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
