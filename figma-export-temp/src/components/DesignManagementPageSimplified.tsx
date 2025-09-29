import React, { useState, useEffect } from 'react';
import { DesignCreateForm } from './DesignCreateForm';
import { DesignManagementPage as OriginalDesignManagementPage } from './DesignManagementPage';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface Design {
  id: string;
  title: string;
  description?: string;
  tool: 'Figma' | 'Sketch' | 'Adobe XD' | 'Photoshop' | 'Illustrator' | 'Other';
  status: '设计中' | '待评审' | '评审中' | '评审通过' | '需修改' | '已上线';
  priority: '低' | '中' | '高' | '紧急';
  designUrl: string;
  creator: User;
  project?: Project;
  platform?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  designType?: 'UI设计' | '视觉设计' | '图标设计' | '插画设计';
  requirementId?: string;
  viewCount?: number;
  isFavorite?: boolean;
}

export function DesignManagementPage({ context, onNavigate }: { 
  context?: any; 
  onNavigate?: (page: string, context?: any) => void; 
}) {
  // 如果是创建模式，直接显示创建表单
  if (context?.mode === 'create') {
    const handleSave = (designData: Partial<Design>) => {
      console.log('保存设计稿:', designData);
      
      // 返回到指定页面
      if (context?.returnTo && context?.returnContext && onNavigate) {
        onNavigate(context.returnTo, context.returnContext);
      }
    };

    const handleCancel = () => {
      // 返回到指定页面
      if (context?.returnTo && context?.returnContext && onNavigate) {
        onNavigate(context.returnTo, context.returnContext);
      }
    };

    return (
      <div className="h-screen flex flex-col">
        {/* 页面头部 */}
        <div className="flex-shrink-0 bg-background border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium">新建设计</h1>
              <p className="text-muted-foreground mt-1">创建新的UI设计稿</p>
            </div>
          </div>
        </div>

        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <DesignCreateForm 
            requirementId={context?.requirementId}
            requirementTitle={context?.requirementTitle}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // 其他情况，显示原来的设计管理页面
  return <OriginalDesignManagementPage context={context} onNavigate={onNavigate} />;
}