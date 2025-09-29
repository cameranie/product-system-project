import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, FileText, Edit, Eye } from 'lucide-react';

interface PRDNavigationDemoProps {
  onNavigate?: (page: string) => void;
}

export function PRDNavigationDemo({ onNavigate }: PRDNavigationDemoProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const mockPRD = {
    id: 'prd-001',
    title: '用户中心功能优化PRD',
    version: 'v2.1',
    status: 'published' as const,
    creator: { id: '1', name: '张三', role: '产品经理' },
    updatedAt: '2024-12-20 14:30',
    content: '# 用户中心功能优化PRD v2.1\n\n## 项目背景\n优化用户中心各项功能，提升用户体验...'
  };

  const steps = [
    { id: 1, title: 'PRD列表页', description: '用户浏览PRD列表' },
    { id: 2, title: 'PRD详情页', description: '用户查看PRD详细内容' },
    { id: 3, title: 'PRD编辑页', description: '用户点击编辑按钮进入编辑模式' },
    { id: 4, title: '返回详情页', description: '用户保存或取消后返回详情页' }
  ];

  const simulateNavigation = (targetStep: number) => {
    setCurrentStep(targetStep);
  };

  const handleTestPRDDetailFlow = () => {
    // 模拟完整的导航流程
    onNavigate?.('prd-detail', {
      prd: mockPRD,
      prdId: mockPRD.id,
      mode: 'view'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('requirement-pool')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold">PRD导航流程演示</h1>
              <p className="text-sm text-muted-foreground">演示PRD详情页→编辑页→返回详情页的导航修复</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="grid gap-8">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">问题描述与解决方案</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-sm space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800"><strong>🐛 原问题</strong>：从PRD详情页点击编辑进入编辑页后，点击返回没有正确回到PRD详情页</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800"><strong>✅ 解决方案</strong>：</p>
                  <ul className="list-disc list-inside mt-2 text-green-700 space-y-1">
                    <li>在App.tsx中添加了prd-edit路由，正确处理返回信息</li>
                    <li>修改PRDPageFixed.tsx中的handleEditPRD函数，使用onNavigate跳转</li>
                    <li>确保编辑页面保存returnTo='prd-detail'和相关上下文</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">导航流程步骤</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep > step.id 
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => simulateNavigation(step.id)}
                      disabled={step.id > currentStep + 1}
                    >
                      {step.id <= currentStep ? '重新演示' : '跳转到此步'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">实际测试</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">测试PRD：{mockPRD.title}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>版本：{mockPRD.version}</p>
                    <p>创建者：{mockPRD.creator.name}</p>
                    <p>更新时间：{mockPRD.updatedAt}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleTestPRDDetailFlow}>
                    <Eye className="w-4 h-4 mr-2" />
                    测试完整流程：查看PRD详情
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => onNavigate?.('prd-edit', {
                      prd: mockPRD,
                      prdId: mockPRD.id,
                      mode: 'edit'
                    })}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    直接测试编辑页
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => onNavigate?.('prd', { source: 'navigation-demo' })}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    查看PRD管理页
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">关键代码修改</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">1. App.tsx - 添加prd-edit路由处理</h5>
                  <div className="text-xs bg-muted p-3 rounded font-mono">
                    {`case 'prd-edit':
  return <PRDPage 
    context={{
      ...navigationContext,
      mode: 'edit',
      returnTo: 'prd-detail',
      returnContext: {
        prdId: navigationContext?.prdId,
        prd: navigationContext?.prd,
        mode: 'view'
      }
    }} 
    onNavigate={handleNavigate} 
  />;`}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2">2. PRDPageFixed.tsx - 修改handleEditPRD函数</h5>
                  <div className="text-xs bg-muted p-3 rounded font-mono">
                    {`const handleEditPRD = (prd: PRDItem) => {
  if (currentView === 'view' && onNavigate) {
    onNavigate('prd-edit', {
      prd: prd,
      prdId: prd.id,
      mode: 'edit'
    });
  } else {
    // 向后兼容的内部状态切换
    setEditingPRD(prd);
    setSelectedPRD(prd);
    setCurrentView('edit');
  }
};`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}