'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/requirements-store';

interface UserAvatarProps {
  user: User | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

/**
 * 统一的人员头像组件
 * 
 * 规范：
 * - 头像显示用户姓氏（第一个字）
 * - 可选显示完整姓名
 * - 支持多种尺寸
 * 
 * 使用场景：
 * - 需求池列表
 * - 预排期列表
 * - 需求详情
 * - 评论区
 * 
 * @example
 * // 只显示头像
 * <UserAvatar user={user} size="sm" />
 * 
 * // 显示头像和姓名
 * <UserAvatar user={user} size="md" showName />
 */
export function UserAvatar({ 
  user, 
  size = 'sm', 
  showName = true,
  className = '' 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-lg'
  };

  const fallbackTextSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar className={sizeClasses[size]}>
          <AvatarFallback className={fallbackTextSizes[size]}>?</AvatarFallback>
        </Avatar>
        {showName && <span className={`${textSizeClasses[size]} text-muted-foreground`}>未知用户</span>}
      </div>
    );
  }

  // 获取用户姓氏（第一个字）
  const initial = user.name?.slice(0, 1) || '?';
  // 生成默认头像URL（如果没有提供头像）
  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.name}`;

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <Avatar className={`${sizeClasses[size]} flex-shrink-0`}>
        <AvatarImage src={avatarUrl} alt={user.name} />
        <AvatarFallback className={fallbackTextSizes[size]}>
          {initial}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span 
          className={`${textSizeClasses[size]} truncate min-w-0`}
          title={user.name}
        >
          {user.name}
        </span>
      )}
    </div>
  );
}

