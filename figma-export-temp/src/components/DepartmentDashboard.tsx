import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Code,
  Calendar,
  User,
  FileText,
  BarChart3,
  Activity,
  Timer,
  GitBranch,
  Zap,
  Bug,
  Shield,
  Palette,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DepartmentDashboardProps {
  onNavigate?: (page: string, context?: any) => void;
  department?: 'product' | 'development' | 'testing' | 'design';
}

// 模拟数据
const productManagersData = [
  {
    id: 'pm1',
    name: '张产品',
    avatar: '',
    totalRequirements: 25,
    pendingReview: 5,
    inProgress: 12,
    completed: 8,
    urgentTasks: 3,
    thisWeekCompleted: 4,
    efficiency: 85,
    departments: ['K线', '行情', '交易']
  },
  {
    id: 'pm2',
    name: '李经理',
    avatar: '',
    totalRequirements: 18,
    pendingReview: 2,
    inProgress: 8,
    completed: 8,
    urgentTasks: 1,
    thisWeekCompleted: 3,
    efficiency: 92,
    departments: ['聊天室', '系统']
  },
  {
    id: 'pm3',
    name: '王主管',
    avatar: '',
    totalRequirements: 32,
    pendingReview: 8,
    inProgress: 15,
    completed: 9,
    urgentTasks: 4,
    thisWeekCompleted: 2,
    efficiency: 78,
    departments: ['K线', '系统', '交易']
  }
];

const developersData = [
  {
    id: 'dev1',
    name: '陈开发',
    avatar: '',
    totalTasks: 15,
    completedTasks: 8,
    inProgressTasks: 5,
    overdueTask: 2,
    codeLines: 2840,
    commitCount: 45,
    avgTaskTime: 2.5,
    efficiency: 88,
    technologies: ['React', 'Node.js', 'TypeScript']
  },
  {
    id: 'dev2',
    name: '刘程序',
    avatar: '',
    totalTasks: 12,
    completedTasks: 10,
    inProgressTasks: 2,
    overdueTask: 0,
    codeLines: 3250,
    commitCount: 52,
    avgTaskTime: 1.8,
    efficiency: 95,
    technologies: ['Vue.js', 'Python', 'MySQL']
  },
  {
    id: 'dev3',
    name: '周技术',
    avatar: '',
    totalTasks: 20,
    completedTasks: 12,
    inProgressTasks: 6,
    overdueTask: 2,
    codeLines: 4120,
    commitCount: 68,
    avgTaskTime: 3.2,
    efficiency: 82,
    technologies: ['Java', 'Spring', 'Redis']
  }
];

const testersData = [
  {
    id: 'test1',
    name: '赵测试',
    avatar: '',
    totalTestCases: 156,
    completedTests: 128,
    inProgressTests: 18,
    blockedTests: 10,
    bugsFound: 23,
    bugsSolved: 18,
    testCoverage: 92,
    efficiency: 89,
    specialties: ['功能测试', '自动化测试', '性能测试']
  },
  {
    id: 'test2',
    name: '钱质量',
    avatar: '',
    totalTestCases: 98,
    completedTests: 89,
    inProgressTests: 6,
    blockedTests: 3,
    bugsFound: 15,
    bugsSolved: 12,
    testCoverage: 88,
    efficiency: 94,
    specialties: ['API测试', '安全测试', '兼容性测试']
  },
  {
    id: 'test3',
    name: '孙验证',
    avatar: '',
    totalTestCases: 203,
    completedTests: 175,
    inProgressTests: 20,
    blockedTests: 8,
    bugsFound: 31,
    bugsSolved: 25,
    testCoverage: 85,
    efficiency: 87,
    specialties: ['UI测试', '接口测试', '回归测试']
  }
];

const designersData = [
  {
    id: 'design1',
    name: '吴设计',
    avatar: '',
    totalProjects: 12,
    completedDesigns: 8,
    inProgressDesigns: 3,
    pendingReview: 1,
    designAssets: 245,
    prototypes: 15,
    avgDesignTime: 3.2,
    efficiency: 91,
    skills: ['UI设计', 'UX设计', '交互设计']
  },
  {
    id: 'design2',
    name: '郑美工',
    avatar: '',
    totalProjects: 18,
    completedDesigns: 14,
    inProgressDesigns: 3,
    pendingReview: 1,
    designAssets: 380,
    prototypes: 22,
    avgDesignTime: 2.8,
    efficiency: 88,
    skills: ['视觉设计', '图标设计', '插画设计']
  },
  {
    id: 'design3',
    name: '王创意',
    avatar: '',
    totalProjects: 15,
    completedDesigns: 11,
    inProgressDesigns: 3,
    pendingReview: 1,
    designAssets: 298,
    prototypes: 18,
    avgDesignTime: 4.1,
    efficiency: 85,
    skills: ['品牌设计', '动效设计', '用户研究']
  }
];

const statusColors = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  pendingReview: '#f59e0b',
  overdue: '#ef4444'
};

const departmentStatusData = [
  { name: '待评审', value: 15, color: statusColors.pendingReview },
  { name: '进行中', value: 35, color: statusColors.inProgress },
  { name: '已完成', value: 25, color: statusColors.completed },
  { name: '已逾期', value: 4, color: statusColors.overdue }
];

const weeklyTrendData = [
  { week: '第1周', completed: 12, created: 15 },
  { week: '第2周', completed: 18, created: 12 },
  { week: '第3周', completed: 15, created: 20 },
  { week: '第4周', completed: 22, created: 18 }
];

const ProductDepartmentView: React.FC<{ onNavigate?: (page: string, context?: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 部门总览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总需求数</p>
                <p className="text-2xl font-bold">75</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本周完成</p>
                <p className="text-2xl font-bold">9</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">紧急任务</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">完成率</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 状态分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              需求状态分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 周趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              周度完成趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="已完成" />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="新建" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 产品经理详细数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            产品经理工作详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productManagersData.map((pm) => (
              <Card key={pm.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={pm.avatar} />
                      <AvatarFallback>{pm.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{pm.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {pm.departments.map((dept) => (
                          <Badge key={dept} variant="secondary" className="text-xs">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">效率分数</div>
                    <div className="text-lg font-bold text-green-600">{pm.efficiency}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{pm.totalRequirements}</div>
                    <div className="text-xs text-muted-foreground">总需求</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{pm.pendingReview}</div>
                    <div className="text-xs text-muted-foreground">待评审</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{pm.inProgress}</div>
                    <div className="text-xs text-muted-foreground">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{pm.completed}</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">紧急: {pm.urgentTasks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">本周: {pm.thisWeekCompleted}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate?.('my-assigned', { assignee: pm.name })}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TestDepartmentView: React.FC<{ onNavigate?: (page: string, context?: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 测试部门总览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总测试用例</p>
                <p className="text-2xl font-bold">457</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">通过率</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">发现Bug数</p>
                <p className="text-2xl font-bold">69</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">测试覆盖率</p>
                <p className="text-2xl font-bold">88%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 测试工程师详细数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            测试工程师工作详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testersData.map((tester) => (
              <Card key={tester.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={tester.avatar} />
                      <AvatarFallback>{tester.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{tester.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {tester.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">效率分数</div>
                    <div className="text-lg font-bold text-green-600">{tester.efficiency}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{tester.totalTestCases}</div>
                    <div className="text-xs text-muted-foreground">总用例</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{tester.completedTests}</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{tester.inProgressTests}</div>
                    <div className="text-xs text-muted-foreground">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{tester.blockedTests}</div>
                    <div className="text-xs text-muted-foreground">阻塞</div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">测试覆盖率</span>
                    <span className="text-sm font-medium">{tester.testCoverage}%</span>
                  </div>
                  <Progress value={tester.testCoverage} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Bug className="h-4 w-4 text-red-500" />
                      <span className="text-sm">发现: {tester.bugsFound}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">解决: {tester.bugsSolved}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">覆盖: {tester.testCoverage}%</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate?.('my-assigned', { assignee: tester.name })}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DesignDepartmentView: React.FC<{ onNavigate?: (page: string, context?: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 设计部门总览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Palette className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总项目数</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">设计资产</p>
                <p className="text-2xl font-bold">923</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">原型数量</p>
                <p className="text-2xl font-bold">55</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Timer className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均耗时</p>
                <p className="text-2xl font-bold">3.4天</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 设计师详细数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            设计师工作详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {designersData.map((designer) => (
              <Card key={designer.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={designer.avatar} />
                      <AvatarFallback>{designer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{designer.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {designer.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">效率分数</div>
                    <div className="text-lg font-bold text-green-600">{designer.efficiency}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{designer.totalProjects}</div>
                    <div className="text-xs text-muted-foreground">总项目</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{designer.completedDesigns}</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{designer.inProgressDesigns}</div>
                    <div className="text-xs text-muted-foreground">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{designer.pendingReview}</div>
                    <div className="text-xs text-muted-foreground">待评审</div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">项目完成率</span>
                    <span className="text-sm font-medium">{Math.round((designer.completedDesigns / designer.totalProjects) * 100)}%</span>
                  </div>
                  <Progress value={(designer.completedDesigns / designer.totalProjects) * 100} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Palette className="h-4 w-4 text-pink-500" />
                      <span className="text-sm">资产: {designer.designAssets}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">原型: {designer.prototypes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{designer.avgDesignTime} 天/项目</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate?.('my-assigned', { assignee: designer.name })}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DevelopmentDepartmentView: React.FC<{ onNavigate?: (page: string, context?: any) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 开发部门总览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总任务数</p>
                <p className="text-2xl font-bold">47</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GitBranch className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总代码行数</p>
                <p className="text-2xl font-bold">10.2K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均耗时</p>
                <p className="text-2xl font-bold">2.5天</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">团队效率</p>
                <p className="text-2xl font-bold">88%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 开发人员详细数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            开发人员工作详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {developersData.map((dev) => (
              <Card key={dev.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={dev.avatar} />
                      <AvatarFallback>{dev.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{dev.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {dev.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">效率分数</div>
                    <div className="text-lg font-bold text-green-600">{dev.efficiency}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{dev.totalTasks}</div>
                    <div className="text-xs text-muted-foreground">总任务</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{dev.completedTasks}</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{dev.inProgressTasks}</div>
                    <div className="text-xs text-muted-foreground">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{dev.overdueTask}</div>
                    <div className="text-xs text-muted-foreground">逾期</div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">任务完成率</span>
                    <span className="text-sm font-medium">{Math.round((dev.completedTasks / dev.totalTasks) * 100)}%</span>
                  </div>
                  <Progress value={(dev.completedTasks / dev.totalTasks) * 100} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{dev.codeLines} 行</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{dev.commitCount} 提交</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{dev.avgTaskTime} 天/任务</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate?.('my-assigned', { assignee: dev.name })}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function DepartmentDashboard({ onNavigate, department = 'product' }: DepartmentDashboardProps) {
  const departmentTitles = {
    product: '产品部门数据面板',
    development: '开发部门数据面板', 
    testing: '测试部门数据面板',
    design: '设计部门数据面板'
  };

  const departmentDescriptions = {
    product: '查看产品部门成员的工作数据和统计分析',
    development: '查看开发部门成员的工作数据和统计分析',
    testing: '查看测试部门成员的工作数据和统计分析', 
    design: '查看设计部门成员的工作数据和统计分析'
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{departmentTitles[department]}</h1>
          <p className="text-muted-foreground mt-1">
            {departmentDescriptions[department]}
          </p>
        </div>
      </div>

      {/* 部门视图 */}
      <div className="mt-6">
        {department === 'product' && <ProductDepartmentView onNavigate={onNavigate} />}
        {department === 'development' && <DevelopmentDepartmentView onNavigate={onNavigate} />}
        {department === 'testing' && <TestDepartmentView onNavigate={onNavigate} />}
        {department === 'design' && <DesignDepartmentView onNavigate={onNavigate} />}
      </div>
    </div>
  );
}