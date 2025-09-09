'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi, visibilityApi } from '@/lib/api';
import Link from 'next/link';

import { 
  ArrowLeft, 
  Edit,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

const FIELD_KEYS = {
  contactWorkEmail: 'contact_work_email',
  contactPhone: 'contact_phone',
  department: 'department',
} as const;

type DetailUser = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  department?: { id: string; name: string } | null;
};

export default function PersonnelDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<DetailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);

  // 加载用户数据 + 可见字段
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const [userRes, keysRes] = await Promise.all([
          userApi.getUser(userId),
          visibilityApi.visibleFieldKeys({ resource: 'user', targetUserId: userId }),
        ]);
        setUser(userRes.user);
        setVisibleKeys(keysRes.visibleFieldKeys);
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
            <Button 
              size="sm"
              variant="secondary"
              asChild
            >
              <Link href={`/admin/permissions/preview?targetUserId=${user.id}`}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                权限预览
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
                  </div>

                  <div className="space-y-4">
                    {visibleKeys.includes(FIELD_KEYS.contactWorkEmail) && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email ?? ''}</span>
                      </div>
                    )}
                    {visibleKeys.includes(FIELD_KEYS.contactPhone) && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone ?? ''}</span>
                      </div>
                    )}
                    {visibleKeys.includes(FIELD_KEYS.department) && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{user.department?.name ?? ''}</span>
                      </div>
                    )}
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
