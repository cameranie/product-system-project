'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PasswordInput } from '@/components/ui/password-input';
import { AppLayout } from '@/components/layout/app-layout';
import { userApi, authApi, accountApi } from '@/lib/api';
import { User } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<{id: string; name: string; email: string; username: string; avatar?: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.me);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const updateAvatar = async () => {
    if (!user || !avatarPreview) return;
    setLoading(true);
    try {
      await accountApi.updateMyProfile({ avatar: avatarPreview });
      setMessage('头像更新成功');
      await loadUser();
      // 清除预览
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      setMessage('头像更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setMessage('请填写完整的密码信息');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('新密码确认不匹配');
      return;
    }
    
    // 强密码验证（必须6位以上，包含大小写和特殊字符）
    const checks = {
      length: passwordForm.newPassword.length >= 6,
      lowercase: /[a-z]/.test(passwordForm.newPassword),
      uppercase: /[A-Z]/.test(passwordForm.newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
    };
    
    if (!(checks.length && checks.lowercase && checks.uppercase && checks.special)) {
      setMessage('密码需至少6位，且包含大小写字母和特殊字符');
      return;
    }

    setLoading(true);
    try {
      await userApi.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMessage('密码更新成功');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage('密码更新失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型和大小
      if (!file.type.startsWith('image/')) {
        setMessage('请选择图片文件');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setMessage('图片文件不能超过5MB');
        return;
      }
      
      setAvatarFile(file);
      setMessage('');
      
      // 生成预览
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatarPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div>加载中...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarPreview || user.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username}`} />
                <AvatarFallback className="text-xl">{user.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  {avatarPreview && (
                    <div className="text-xs text-blue-600 mt-1">
                      头像预览 - 点击&quot;确认&quot;保存
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {!avatarPreview ? (
                    <Button variant="outline" onClick={() => document.getElementById('avatar')?.click()}>
                      更新头像
                    </Button>
                  ) : (
                    <>
                      <Button onClick={updateAvatar} disabled={loading}>
                        {loading ? '更新中...' : '确认'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          const fileInput = document.getElementById('avatar') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                      >
                        取消
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 隐藏的文件输入 */}
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />

        {/* 密码设置 */}
        <Card>
          <CardHeader>
            <CardTitle>密码设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <PasswordInput
                id="currentPassword"
                placeholder="请输入当前密码"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <PasswordInput
                id="newPassword"
                placeholder="请输入新密码"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                showStrength={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="请再次输入新密码"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <Button onClick={updatePassword} disabled={loading}>
              {loading ? '更新中...' : '更新密码'}
            </Button>
          </CardContent>
        </Card>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
