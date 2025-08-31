'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { issueApi, projectApi, userApi } from '@/lib/api';

export default function TestApiPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (name: string, result: any, error?: any) => {
    setResults(prev => [...prev, { 
      name, 
      result: error ? null : result, 
      error: error?.message || error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testGraphQLConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'query { __schema { types { name } } }'
        })
      });
      const data = await response.json();
      addResult('GraphQL连接测试', { 
        status: response.status, 
        typesCount: data.data?.types?.length || 0 
      });
    } catch (error) {
      addResult('GraphQL连接测试', null, error);
    }
  };

  const testGetProjects = async () => {
    try {
      const result = await projectApi.getProjects();
      addResult('获取项目列表', result);
    } catch (error) {
      addResult('获取项目列表', null, error);
    }
  };

  const testGetUsers = async () => {
    try {
      const result = await userApi.getUsers();
      addResult('获取用户列表', result);
    } catch (error) {
      addResult('获取用户列表', null, error);
    }
  };

  const testGetIssues = async () => {
    try {
      const result = await issueApi.getIssues();
      addResult('获取Issues列表', result);
    } catch (error) {
      addResult('获取Issues列表', null, error);
    }
  };

  const testCreateIssue = async () => {
    try {
      // 首先获取一个项目ID
      const projectsResult = await projectApi.getProjects();
      const projects = projectsResult.projects?.projects || [];
      
      if (projects.length === 0) {
        addResult('创建Issue测试', null, '没有可用的项目');
        return;
      }

      const result = await issueApi.createIssue({
        title: '测试Issue - ' + new Date().toLocaleString(),
        description: '这是一个API测试创建的Issue',
        priority: 'MEDIUM',
        inputSource: 'INTERNAL',
        issueType: 'FEATURE',
        projectId: projects[0].id,
        businessValue: '测试API功能',
        userImpact: '验证前后端集成',
      });
      addResult('创建Issue测试', result);
    } catch (error) {
      addResult('创建Issue测试', null, error);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    await testGraphQLConnection();
    await testGetProjects();
    await testGetUsers();
    await testGetIssues();
    await testCreateIssue();
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">API 测试页面</h1>
        <p className="text-muted-foreground">
          测试前后端API连接和基础功能
        </p>
      </div>

      <div className="mb-6 space-x-4">
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? '测试中...' : '运行所有测试'}
        </Button>
        <Button onClick={testGraphQLConnection} variant="outline">
          测试连接
        </Button>
        <Button onClick={testGetProjects} variant="outline">
          测试项目API
        </Button>
        <Button onClick={testGetUsers} variant="outline">
          测试用户API
        </Button>
        <Button onClick={testGetIssues} variant="outline">
          测试Issues API
        </Button>
        <Button onClick={testCreateIssue} variant="outline">
          测试创建Issue
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{result.name}</span>
                <span className="text-sm text-muted-foreground">
                  {result.timestamp}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="text-red-600">
                  <strong>错误:</strong> {result.error}
                </div>
              ) : (
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              点击上方按钮开始测试API连接
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
