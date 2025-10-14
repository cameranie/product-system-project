"use client"

import * as React from "react"
import { Suspense } from "react"
import {
  Kanban,
  MessageSquare,
  Users,
  Settings,
  HelpCircle,
  Search,
  Inbox,
  Shield,
  BookOpen,
  Calendar,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "未登录",
    email: "",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "需求池",
      url: "/requirements",
      icon: Inbox,
    },
    {
      title: "预排期",
      url: "/requirements/scheduled",
      icon: Calendar,
    },
    {
      title: "任务看板",
      url: "/kanban",
      icon: Kanban,
    },
    {
      title: "Issues",
      url: "/issues",
      icon: MessageSquare,
    },
    {
      title: "通讯录",
      url: "/directory",
      icon: BookOpen,
    },
    {
      title: "人员管理",
      url: "/personnel",
      icon: Users,
    },
    {
      title: "权限管理",
      url: "/admin/permissions",
      icon: Shield,
      items: [
        {
          title: "临时授权",
          url: "/admin/permissions/grants",
        },
        {
          title: "字段管理",
          url: "/admin/permissions/fields",
        },
        {
          title: "可见性管理",
          url: "/admin/permissions/visibility",
        },
      ],
    },
  ],
  navSecondary: [
    // 隐藏设置、帮助、搜索等项目
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [profile, setProfile] = React.useState(data.user)
  React.useEffect(() => {
    ;(async () => {
      try {
        const mod = await import("@/lib/api")
        const res = await mod.authApi.me()
        const me = res.me
        if (me) {
          setProfile({ name: me.name ?? '用户', email: me.email ?? '', avatar: me.avatar ?? '/avatars/admin.jpg' })
        }
      } catch (_) {
        // 未登录保持默认
      }
    })()
  }, [])
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image 
                  src="/Logo.svg" 
                  alt="AiCoin Logo" 
                  width={24} 
                  height={24}
                  className="!size-6"
                />
                <span className="text-base font-semibold">AiCoin OS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* 简单前端门禁：如果本地未设置管理员开关，则隐藏权限管理入口。
            后端仍会在访问接口时做 403 拒绝。*/}
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">加载中...</div>}>
          <NavMain items={process.env.NEXT_PUBLIC_SHOW_ADMIN === '1' ? data.navMain : data.navMain.filter(i => i.title !== '权限管理')} />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profile} />
      </SidebarFooter>
    </Sidebar>
  )
}
