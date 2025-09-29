import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function TopNavigationBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-background border-b border-border z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo和品牌标识区域 */}
        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TM</span>
          </div>
          <h1 className="font-semibold">任务管理系统</h1>
        </div>

        {/* 右侧功能区域 */}
        <div className="flex items-center space-x-2">
          {/* 快速创建 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                新建任务
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                新建项目
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                新建团队
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}