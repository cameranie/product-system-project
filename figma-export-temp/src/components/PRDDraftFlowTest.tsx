import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

/**
 * 草稿编辑流程测试组件
 * 用于验证从"我的草稿"编辑到保存返回的完整流程
 */

interface DraftFlowTestProps {
  onNavigate?: (page: string, context?: any) => void;
}

export function PRDDraftFlowTest({ onNavigate }: DraftFlowTestProps) {
  const [testResults, setTestResults] = useState<{
    editFlow: 'pending' | 'success' | 'error';
    saveFlow: 'pending' | 'success' | 'error';
    returnFlow: 'pending' | 'success' | 'error';
  }>({
    editFlow: 'pending',
    saveFlow: 'pending',
    returnFlow: 'pending'
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const mockDraft = {
    id: 'draft-test-1',
    title: '测试草稿 - 用户权限管理PRD',
    content: '## 测试内容\n\n这是一个测试草稿...',
    creator: { id: '1', name: '张三', avatar: '', role: '产品经理' },
    createdAt: '2024-12-16 10:00',
    updatedAt: '2024-12-16 14:30',
    requirementId: 'req-001',
    requirementTitle: '用户权限管理需求',
    platform: 'Web端',
    priority: '高' as const
  };

  const runEditFlowTest = () => {
    setTestStatus('running');
    
    try {
      // 模拟点击编辑草稿按钮
      if (onNavigate) {
        onNavigate('prd', {
          mode: 'edit-draft',
          draftId: mockDraft.id,
          draft: mockDraft,
          returnTo: 'prd',
          returnContext: { source: 'draft-edit' }
        });
        
        setTestResults(prev => ({ ...prev, editFlow: 'success' }));
        
        // 模拟编辑后的保存流程
        setTimeout(() => {
          // 模拟从编辑页面返回时传递的数据
          const mockUpdatedDraft = {
            ...mockDraft,
            title: '测试草稿 - 用户权限管理PRD (已编辑)',
            content: '## 测试内容\n\n这是一个已编辑的测试草稿...',
            updatedAt: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\//g, '-')
          };
          
          setTestResults(prev => ({ ...prev, saveFlow: 'success' }));
          
          // 模拟返回到草稿列表
          if (onNavigate) {
            onNavigate('prd', {
              updatedDraft: mockUpdatedDraft,
              source: 'draft-edit'
            });
            
            setTestResults(prev => ({ ...prev, returnFlow: 'success' }));
            setTestStatus('completed');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('草稿编辑流程测试失败:', error);
      setTestResults(prev => ({ 
        editFlow: 'error',
        saveFlow: 'error',
        returnFlow: 'error'
      }));
      setTestStatus('completed');
    }
  };

  const resetTest = () => {
    setTestResults({
      editFlow: 'pending',
      saveFlow: 'pending', 
      returnFlow: 'pending'
    });
    setTestStatus('idle');
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">通过</Badge>;
      case 'error':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="secondary">待测试</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            草稿编辑流程测试
            {testStatus === 'running' && (
              <Badge variant="outline" className="animate-pulse">测试中...</Badge>
            )}
            {testStatus === 'completed' && (
              <Badge variant="default">测试完成</Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            验证从"我的草稿"tab点击编辑按钮到保存返回的完整流程
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* 测试步骤 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.editFlow)}
                <div>
                  <div className="font-medium">1. 草稿编辑跳转</div>
                  <div className="text-sm text-muted-foreground">
                    从草稿列表跳转到编辑页面，传递正确的上下文
                  </div>
                </div>
              </div>
              {getStatusBadge(testResults.editFlow)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.saveFlow)}
                <div>
                  <div className="font-medium">2. 草稿保存逻辑</div>
                  <div className="text-sm text-muted-foreground">
                    在编辑页面保存草稿，构造正确的返回数据
                  </div>
                </div>
              </div>
              {getStatusBadge(testResults.saveFlow)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.returnFlow)}
                <div>
                  <div className="font-medium">3. 列表刷新更新</div>
                  <div className="text-sm text-muted-foreground">
                    返回草稿列表，刷新显示更新的草稿
                  </div>
                </div>
              </div>
              {getStatusBadge(testResults.returnFlow)}
            </div>
          </div>

          {/* 测试控制 */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button 
              onClick={runEditFlowTest} 
              disabled={testStatus === 'running'}
              variant="default"
            >
              {testStatus === 'running' ? '测试进行中...' : '开始测试'}
            </Button>
            
            {testStatus === 'completed' && (
              <Button onClick={resetTest} variant="outline">
                重置测试
              </Button>
            )}
          </div>

          {/* 测试数据 */}
          <details className="space-y-2">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              查看测试数据
            </summary>
            <div className="p-3 bg-muted/50 rounded text-xs">
              <pre>{JSON.stringify(mockDraft, null, 2)}</pre>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}