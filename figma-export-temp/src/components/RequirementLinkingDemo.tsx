import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PrototypeLinkedRequirements } from './PrototypeLinkedRequirementsSimplified';
import { DesignLinkedRequirements } from './DesignLinkedRequirementsSimplified';
import { PRDLinkedRequirementsSimplified } from './PRDLinkedRequirementsSimplified';
import { ArrowLeft, FileText, Monitor, Brush } from 'lucide-react';

interface RequirementLinkingDemoProps {
  onNavigate?: (page: string) => void;
}

export function RequirementLinkingDemo({ onNavigate }: RequirementLinkingDemoProps) {
  const [prototypeRequirement, setPrototypeRequirement] = useState<string | undefined>(undefined);
  const [designRequirement, setDesignRequirement] = useState<string | undefined>(undefined);
  const [prdRequirements, setPrdRequirements] = useState<Array<{id: string, title: string, type: string}>>([]);

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
              <h1 className="text-xl font-semibold">关联需求功能演示</h1>
              <p className="text-sm text-muted-foreground">演示原型图、设计图、PRD的关联需求简化显示</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="grid gap-8">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">功能说明</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>✨ <strong>关联需求显示简化</strong>：现在只显示需求标题，去除了复杂的描述、状态、优先级等信息</p>
                <p>✨ <strong>选择需求简化</strong>：在添加关联需求时，下拉选择列表也只显示需求标题，界面更加简洁</p>
                <p>✨ <strong>适用范围</strong>：原型图编辑页、详情页、新建页 + 设计图编辑页、详情页、新建页 + PRD相关页面</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="prototype" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prototype" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                原型图关联需求
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Brush className="w-4 h-4" />
                设计图关联需求
              </TabsTrigger>
              <TabsTrigger value="prd" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PRD关联需求
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prototype" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">原型图信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">原型名称</label>
                        <p className="text-sm text-muted-foreground mt-1">用户中心交互原型 v2.0</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">创建时间</label>
                        <p className="text-sm text-muted-foreground mt-1">2024-12-20 10:30</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">状态</label>
                        <p className="text-sm text-muted-foreground mt-1">设计中</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <PrototypeLinkedRequirements
                  linkedRequirement={prototypeRequirement}
                  onLinkRequirement={(requirementId) => {
                    setPrototypeRequirement(requirementId);
                  }}
                  onUnlinkRequirement={() => {
                    setPrototypeRequirement(undefined);
                  }}
                  onNavigateToRequirement={(requirementId) => {
                    console.log('跳转到需求详情:', requirementId);
                  }}
                  isEditable={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">设计图信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">设计名称</label>
                        <p className="text-sm text-muted-foreground mt-1">用户中心界面设计稿</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">设计师</label>
                        <p className="text-sm text-muted-foreground mt-1">王小明</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">版本</label>
                        <p className="text-sm text-muted-foreground mt-1">v1.2</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <DesignLinkedRequirements
                  linkedRequirement={designRequirement}
                  onLinkRequirement={(requirementId) => {
                    setDesignRequirement(requirementId);
                  }}
                  onUnlinkRequirement={() => {
                    setDesignRequirement(undefined);
                  }}
                  onNavigateToRequirement={(requirementId) => {
                    console.log('跳转到需求详情:', requirementId);
                  }}
                  isEditable={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="prd" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">PRD信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">PRD标题</label>
                        <p className="text-sm text-muted-foreground mt-1">用户中心功能需求文档</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">版本</label>
                        <p className="text-sm text-muted-foreground mt-1">v2.1</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">状态</label>
                        <p className="text-sm text-muted-foreground mt-1">评审中</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <PRDLinkedRequirementsSimplified
                  linkedRequirements={prdRequirements}
                  onLinkRequirement={(requirementId) => {
                    // 模拟根据ID获取需求信息
                    const mockRequirement = {
                      id: requirementId,
                      title: `需求 ${requirementId}`,
                      type: '功能需求'
                    };
                    setPrdRequirements(prev => [...prev, mockRequirement]);
                  }}
                  onUnlinkRequirement={(requirementId) => {
                    setPrdRequirements(prev => prev.filter(req => req.id !== requirementId));
                  }}
                  onNavigateToRequirement={(requirementId) => {
                    console.log('跳转到需求详情:', requirementId);
                  }}
                  isEditable={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}