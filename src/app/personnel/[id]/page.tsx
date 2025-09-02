'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi } from '@/lib/api';
import type { User } from '@/types/issue';
import Link from 'next/link';

import { 
  ArrowLeft, 
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  User as UserIcon
} from 'lucide-react';

// 重用人员页面的配置
const userStatusConfig = {
  ACTIVE: { label: '在职', color: 'bg-green-100 text-green-800' },
  INACTIVE: { label: '离职', color: 'bg-gray-100 text-gray-800' },
  ON_LEAVE: { label: '请假', color: 'bg-yellow-100 text-yellow-800' },
  PROBATION: { label: '试用期', color: 'bg-blue-100 text-blue-800' },
};

const userTypeConfig = {
  FULL_TIME: { label: '全职' },
  PART_TIME: { label: '兼职' },
  INTERN: { label: '实习生' },
  CONTRACTOR: { label: '外包' },
};

const genderConfig = {
  MALE: { label: '男' },
  FEMALE: { label: '女' },
  OTHER: { label: '其他' },
};

interface ExtendedUser extends User {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'PROBATION';
  userType: 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACTOR';
  department: {
    id: string;
    name: string;
  };
  manager: {
    id: string;
    name: string;
  } | null;
  position: string;
  joinDate: string;
  birthday: string;
  address: string;
}

export default function PersonnelDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载用户数据
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await userApi.getUsers();
        const foundUser = response.users.users.find(u => u.id === userId);
        
        if (!foundUser) {
          setError('用户不存在');
          return;
        }
        
        // 模拟扩展数据
        const extendedUser: ExtendedUser = {
          ...foundUser,
          gender: 'MALE',
          phone: '13800138000',
          status: 'ACTIVE',
          userType: 'FULL_TIME',
          department: {
            id: 'dept_1',
            name: '技术部'
          },
          manager: {
            id: 'manager_1',
            name: '张经理'
          },
          position: '高级工程师',
          joinDate: '2023-01-15',
          birthday: '1990-06-15',
          address: '北京市朝阳区xxx街道xxx号'
        };
        
        setUser(extendedUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">加载中...</div>
            <div className="text-sm text-muted-foreground mt-2">正在加载人员详情</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600">加载失败</div>
            <div className="text-sm text-muted-foreground mt-2">{error || '用户不存在'}</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">人员详情</h1>
            </div>
          </div>
          
          {/* 编辑按钮 */}
          <div className="flex items-center gap-3">
            <Button 
              size="sm"
              asChild
            >
              <Link href={`/personnel/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Link>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：基本信息卡片 */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username}`} />
                      <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                    <p className="text-muted-foreground mb-4">{user.position}</p>
                    
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge className={userStatusConfig[user.status]?.color}>
                        {userStatusConfig[user.status]?.label}
                      </Badge>
                      <Badge variant="outline">
                        {userTypeConfig[user.userType]?.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{user.department.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{user.manager?.name || '无直属主管'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：详细信息 */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">详细信息</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">员工ID</label>
                      <p className="mt-1 font-mono text-sm">{user.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">性别</label>
                      <p className="mt-1">{genderConfig[user.gender]?.label}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">入职日期</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(user.joinDate).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">生日</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(user.birthday).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">联系地址</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{user.address}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">账号状态</label>
                      <p className="mt-1">{user.isActive ? '激活' : '未激活'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                      <p className="mt-1">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 工作统计 */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">工作统计</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-muted-foreground mt-1">负责的任务</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-sm text-muted-foreground mt-1">已完成任务</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">4</div>
                      <div className="text-sm text-muted-foreground mt-1">进行中任务</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
