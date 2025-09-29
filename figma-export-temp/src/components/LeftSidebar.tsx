import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Archive, 
  FolderOpen, 
  Users, 
  Star, 
  Settings, 
  FileText,
  ChevronDown,
  ChevronRight,
  Target,
  FileBarChart,
  Palette,
  Bug,
  BarChart3,
  UserCheck,
  Cog,
  Tag,
  Plus,
  GripVertical,
  PieChart,
  CheckSquare,
  Shield,
  Search,
  Bell,
  User,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  ListTodo,
  Monitor,
  Brush,
  Code,
  TestTube
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useState, useRef, useEffect } from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

function SidebarItem({ icon, label, count, isActive, onClick, variant = 'default' }: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-3 px-3 py-2 h-auto ${
        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      } ${variant === 'danger' ? 'text-destructive hover:text-destructive' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <Badge 
          variant={variant === 'danger' ? 'destructive' : 'secondary'} 
          className="ml-auto text-xs"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}

interface LeftSidebarProps {
  onNavigate?: (page: string) => void;
  onWidthChange?: (width: number) => void;
}

export function LeftSidebar({ onNavigate, onWidthChange }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'management'
  const [workflowOpen, setWorkflowOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [versionRequirementsOpen, setVersionRequirementsOpen] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [archiveOpen, setArchiveOpen] = useState(true);

  const [activeItem, setActiveItem] = useState('requirement-pool');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);



  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleTabChange = (tab: 'tasks' | 'management') => {
    setActiveTab(tab);
    // 切换到管理时，确保管理功能默认展开
    if (tab === 'management') {
      setManagementOpen(true);
    }
    // 切换到任务时，确保工作流程默认展开
    if (tab === 'tasks') {
      setWorkflowOpen(true);
    }
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    onNavigate?.(item);
  };



  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.min(Math.max(e.clientX, 200), 400);
      setSidebarWidth(newWidth);
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const renderTasksContent = () => (
    <div className="space-y-4">
      {/* 全局搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="全局搜索..."
          className="pl-10 bg-input-background border-none focus:ring-2 focus:ring-ring"
        />
      </div>
      
      <div className="space-y-2">
        {/* 我的 */}
        <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium">
            {projectsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <User className="h-4 w-4" />
            <span className="flex-1 text-left">我的</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-6 space-y-1">
          <SidebarItem
            icon={<ListTodo className="h-4 w-4 text-green-500" />}
            label="TO DO List"
            count={9}
            isActive={activeItem === 'my-todo'}
            onClick={() => handleItemClick('my-todo')}
          />
          <SidebarItem
            icon={<UserCheck className="h-4 w-4 text-blue-500" />}
            label="我负责的"
            count={5}
            isActive={activeItem === 'my-assigned'}
            onClick={() => handleItemClick('my-assigned')}
          />
          <SidebarItem
            icon={<BarChart3 className="h-4 w-4 text-purple-500" />}
            label="我的看板"
            count={12}
            isActive={activeItem === 'my-kanban'}
            onClick={() => handleItemClick('my-kanban')}
          />

        </CollapsibleContent>
      </Collapsible>

        {/* 评审 */}
        <Collapsible open={workflowOpen} onOpenChange={setWorkflowOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium">
              {workflowOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Shield className="h-4 w-4" />
              <span className="flex-1 text-left">评审</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 space-y-1">
            <SidebarItem
              icon={<Target className="h-4 w-4 text-red-500" />}
              label="需求池"
              count={24}
              isActive={activeItem === 'requirement-pool'}
              onClick={() => handleItemClick('requirement-pool')}
            />
            <SidebarItem
              icon={<Clock className="h-4 w-4 text-indigo-500" />}
              label="预排期需求管理"
              count={6}
              isActive={activeItem === 'scheduled-requirements'}
              onClick={() => handleItemClick('scheduled-requirements')}
            />
            <SidebarItem
              icon={<FileBarChart className="h-4 w-4 text-blue-500" />}
              label="PRD管理"
              count={8}
              isActive={activeItem === 'prd'}
              onClick={() => handleItemClick('prd')}
            />
            <SidebarItem
              icon={<Monitor className="h-4 w-4 text-teal-500" />}
              label="原型图管理"
              count={8}
              isActive={activeItem === 'prototype-management'}
              onClick={() => handleItemClick('prototype-management')}
            />
            <SidebarItem
              icon={<Brush className="h-4 w-4 text-pink-500" />}
              label="设计图管理"
              count={4}
              isActive={activeItem === 'design-management'}  
              onClick={() => handleItemClick('design-management')}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* 版本需求 */}
        <Collapsible open={versionRequirementsOpen} onOpenChange={setVersionRequirementsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium">
              {versionRequirementsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Calendar className="h-4 w-4" />
              <span className="flex-1 text-left">版本需求</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 space-y-1">
            <SidebarItem
              icon={<Calendar className="h-4 w-4 text-blue-600" />}
              label="版本需求管理"
              count={6}
              isActive={activeItem === 'version-requirements'}
              onClick={() => handleItemClick('version-requirements')}
            />
            <SidebarItem
              icon={<Bug className="h-4 w-4 text-red-600" />}
              label="Bug追踪"
              count={7}
              variant="danger"
              isActive={activeItem === 'bugs'}
              onClick={() => handleItemClick('bugs')}
            />
            <SidebarItem
              icon={<Tag className="h-4 w-4 text-purple-500" />}
              label="版本号管理"
              isActive={activeItem === 'version-management'}
              onClick={() => handleItemClick('version-management')}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* 数据面板 */}
        <Collapsible open={dashboardOpen} onOpenChange={setDashboardOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium">
              {dashboardOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <PieChart className="h-4 w-4" />
              <span className="flex-1 text-left">数据面板</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 space-y-1">
            <SidebarItem
              icon={<Target className="h-4 w-4 text-blue-500" />}
              label="产品部门数据"
              isActive={activeItem === 'product-dashboard'}
              onClick={() => handleItemClick('product-dashboard')}
            />
            <SidebarItem
              icon={<Code className="h-4 w-4 text-green-500" />}
              label="开发部门数据"
              isActive={activeItem === 'development-dashboard'}
              onClick={() => handleItemClick('development-dashboard')}
            />
            <SidebarItem
              icon={<TestTube className="h-4 w-4 text-orange-500" />}
              label="测试部门数据"
              isActive={activeItem === 'testing-dashboard'}
              onClick={() => handleItemClick('testing-dashboard')}
            />
            <SidebarItem
              icon={<Palette className="h-4 w-4 text-pink-500" />}
              label="设计部门数据"
              isActive={activeItem === 'design-dashboard'}
              onClick={() => handleItemClick('design-dashboard')}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* 留档 */}
        <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium">
              {archiveOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Archive className="h-4 w-4" />
              <span className="flex-1 text-left">留档</span>
              <span className="text-xs text-muted-foreground">23</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 space-y-1">
            <SidebarItem
              icon={<Calendar className="h-4 w-4 text-blue-600" />}
              label="版本需求"
              count={23}
              isActive={activeItem === 'archive-version-requirements'}
              onClick={() => handleItemClick('archive-version-requirements')}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );

  const renderManagementContent = () => (
    <div className="space-y-4">
      {/* 全局搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="全局搜索..."
          className="pl-10 bg-input-background border-none focus:ring-2 focus:ring-ring"
        />
      </div>
      
      <div className="space-y-2">
        {/* 管理功能 */}
        <Collapsible open={managementOpen} onOpenChange={setManagementOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium">
            {managementOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Cog className="h-4 w-4" />
            <span className="flex-1 text-left">管理功能</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-6 space-y-1">
          <SidebarItem
            icon={<UserCheck className="h-4 w-4 text-blue-500" />}
            label="团队管理"
            isActive={activeItem === 'team-management'}
            onClick={() => handleItemClick('team-management')}
          />
          <SidebarItem
            icon={<Tag className="h-4 w-4 text-green-500" />}
            label="标签管理"
            isActive={activeItem === 'tag-management'}
            onClick={() => handleItemClick('tag-management')}
          />
          <SidebarItem
            icon={<Settings className="h-4 w-4 text-gray-500" />}
            label="系统设置"
            isActive={activeItem === 'settings'}
            onClick={() => handleItemClick('settings')}
          />
        </CollapsibleContent>
      </Collapsible>
      </div>
    </div>
  );



  return (
    <aside 
      ref={sidebarRef}
      className="fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border overflow-hidden transition-shadow duration-200 flex"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* 一级导航栏 - 只显示图标 */}
      <div className="w-12 bg-sidebar-accent border-r border-sidebar-border flex flex-col justify-between items-center py-4 shrink-0">
        {/* 上方：主导航 */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`w-8 h-8 p-0 ${
              activeTab === 'tasks' 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                : 'hover:bg-sidebar-accent-foreground/10'
            }`}
            onClick={() => handleTabChange('tasks')}
            title="任务"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"  
            className={`w-8 h-8 p-0 ${
              activeTab === 'management' 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                : 'hover:bg-sidebar-accent-foreground/10'
            }`}
            onClick={() => handleTabChange('management')}
            title="管理"
          >
            <Shield className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 下方：功能按钮 */}
        <div className="flex flex-col items-center gap-2">
          {/* 主题切换 */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="w-8 h-8 p-0 hover:bg-sidebar-accent-foreground/10"
            title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* 通知中心 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 hover:bg-sidebar-accent-foreground/10 relative"
                title="通知"
              >
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center p-0"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" side="right">
              <div className="p-3 border-b">
                <h3 className="font-medium">通知中心</h3>
              </div>
              <div className="p-2">
                <div className="py-2 px-2 hover:bg-accent rounded text-sm">
                  <p className="font-medium">新任务分配</p>
                  <p className="text-muted-foreground text-xs">张三为您分配了新任务</p>
                </div>
                <div className="py-2 px-2 hover:bg-accent rounded text-sm">
                  <p className="font-medium">截止日期提醒</p>
                  <p className="text-muted-foreground text-xs">有3个任务即将到期</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 hover:bg-sidebar-accent-foreground/10"
                title="用户菜单"
              >
                <div className="w-6 h-6 bg-sidebar-primary rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-sidebar-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right">
              <div className="px-2 py-1.5 text-sm font-medium">王小明</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                个人设置
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                帮助文档
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 二级导航内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === 'tasks' ? renderTasksContent() : renderManagementContent()}
        </div>
      </div>
      
      {/* 拖拽调整宽度的手柄 */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors duration-200 group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-primary/80 rounded-full p-1 shadow-lg">
            <GripVertical className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      </div>
    </aside>
  );
}