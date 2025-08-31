"use client"

import { 
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from "@/components/blocks/sidebar"

import { 
  User,
  ChevronsUpDown,
  Calendar,
  Home,
  Settings,
  Kanban,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Clock,
  FolderOpen,
} from "lucide-react"

// Menu items
const items = [
  {
    title: "项目概览",
    url: "/",
    icon: Home,
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
    title: "甘特图",
    url: "/gantt",
    icon: Calendar,
  },
  {
    title: "项目文件",
    url: "/files",
    icon: FolderOpen,
  },
  {
    title: "团队成员",
    url: "/team",
    icon: Users,
  },
  {
    title: "消息讨论",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "工时记录",
    url: "/time-tracking",
    icon: Clock,
  },
  {
    title: "数据统计",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "项目报告",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "系统设置",
    url: "/settings",
    icon: Settings,
  },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>项目管理系统</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup>
            <SidebarMenuButton className="w-full justify-between gap-3 h-12">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 rounded-md" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">管理员</span>
                  <span className="text-xs text-muted-foreground">admin@company.com</span>
                </div>
              </div>
              <ChevronsUpDown className="h-5 w-5 rounded-md" />
            </SidebarMenuButton>
          </SidebarGroup>
        </SidebarFooter>

        {/* 侧边栏收折 Rail（靠边可点击区域） */}
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}