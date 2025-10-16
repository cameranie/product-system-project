'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { toast } from 'sonner';
import { 
  Search, 
  Plus,
  FileText,
  Code,
  TestTube,
  Rocket,
  Edit,
  Trash2,
  X,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  StickyTable, 
  StickyTableHeader, 
  StickyTableBody, 
  StickyTableRow, 
  StickyTableHead,
  StickyTableCell 
} from '@/components/ui/sticky-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVersionStore, calculateVersionSchedule, Version } from '@/lib/version-store';


/**
 * 格式化日期显示
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 默认平台选项
 */
const DEFAULT_PLATFORMS = ['PC', 'iOS', '安卓', 'web'];

/**
 * 版本管理页面
 * 
 * 功能特性：
 * - 版本号管理（支持多平台）
 * - 自动计算时间节点（PRD、原型、开发、测试）
 * - 应用端自定义管理
 * - 搜索和筛选
 * - 创建、编辑、删除版本
 */
export default function VersionManagementPage() {
  // 使用统一的版本号存储
  const { 
    versions, 
    customPlatforms, 
    addVersion, 
    updateVersion, 
    deleteVersion,
    addCustomPlatform,
    deleteCustomPlatform,
    initFromStorage 
  } = useVersionStore();
  
  // 本地UI状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [isAddingPlatformInSelect, setIsAddingPlatformInSelect] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    platform: '',
    versionNumber: '',
    releaseDate: ''
  });

  /**
   * 从 localStorage 初始化数据
   */
  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  /**
   * 获取所有可用的平台选项
   */
  const getAllPlatforms = useCallback(() => {
    return [...DEFAULT_PLATFORMS, ...customPlatforms];
  }, [customPlatforms]);

  /**
   * 过滤版本
   */
  const filteredVersions = useMemo(() => {
    return versions.filter(version => {
      const matchesSearch = searchTerm === '' || 
        version.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.versionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${version.platform} ${version.versionNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlatform = selectedPlatformFilter === 'all' || version.platform === selectedPlatformFilter;
      
      return matchesSearch && matchesPlatform;
    });
  }, [versions, searchTerm, selectedPlatformFilter]);

  /**
   * 重置表单
   */
  const resetForm = useCallback(() => {
    setFormData({
      platform: '',
      versionNumber: '',
      releaseDate: ''
    });
    setEditingVersion(null);
    setIsAddingPlatformInSelect(false);
    setNewPlatformName('');
  }, []);

  /**
   * 添加自定义应用端
   */
  const handleAddCustomPlatform = useCallback(() => {
    if (newPlatformName.trim() && !getAllPlatforms().includes(newPlatformName.trim())) {
      const trimmedName = newPlatformName.trim();
      addCustomPlatform(trimmedName);
      setFormData(prev => ({ ...prev, platform: trimmedName }));
      setNewPlatformName('');
      setIsAddingPlatformInSelect(false);
      toast.success(`已添加应用端：${trimmedName}`);
    }
  }, [newPlatformName, getAllPlatforms, addCustomPlatform]);

  /**
   * 确认添加应用端（Enter键或失去焦点）
   */
  const handleConfirmAddPlatform = useCallback(() => {
    if (newPlatformName.trim()) {
      handleAddCustomPlatform();
    } else {
      setIsAddingPlatformInSelect(false);
      setNewPlatformName('');
    }
  }, [newPlatformName, handleAddCustomPlatform]);

  /**
   * 删除应用端
   */
  const handleDeletePlatform = useCallback((platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 检查是否有版本使用此平台
    const isUsed = versions.some(version => version.platform === platform);
    if (isUsed) {
      toast.error('此应用端正在被使用，无法删除');
      return;
    }
    
    // 删除应用端
    if (DEFAULT_PLATFORMS.includes(platform)) {
      toast.error('不能删除系统默认应用端');
      return;
    }
    
    deleteCustomPlatform(platform);
    toast.success(`已删除应用端：${platform}`);
    
    // 如果当前选中的是被删除的平台，重置选择  
    if (formData.platform === platform) {
      setFormData(prev => ({ ...prev, platform: '' }));
    }
  }, [versions, formData.platform, deleteCustomPlatform]);

  /**
   * 处理应用端选择
   */
  const handlePlatformChange = useCallback((value: string) => {
    if (value === 'add-new-platform') {
      setIsAddingPlatformInSelect(true);
      setNewPlatformName('');
    } else {
      setFormData(prev => ({ ...prev, platform: value }));
    }
  }, []);

  /**
   * 处理创建版本
   */
  const handleCreateVersion = useCallback(() => {
    if (!formData.platform || !formData.versionNumber || !formData.releaseDate) {
      toast.error('请填写所有必填项');
      return;
    }

    const newVersion: Version = {
      id: Date.now().toString(),
      platform: formData.platform,
      versionNumber: formData.versionNumber,
      releaseDate: formData.releaseDate,
      schedule: calculateVersionSchedule(formData.releaseDate),
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN')
    };

    addVersion(newVersion);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('版本创建成功');
  }, [formData, resetForm, addVersion]);

  /**
   * 处理编辑版本
   */
  const handleEditVersion = useCallback((version: Version) => {
    setEditingVersion(version);
    setFormData({
      platform: version.platform,
      versionNumber: version.versionNumber,
      releaseDate: version.releaseDate
    });
    setIsCreateDialogOpen(true);
  }, []);

  /**
   * 处理更新版本
   */
  const handleUpdateVersion = useCallback(() => {
    if (!editingVersion || !formData.platform || !formData.versionNumber || !formData.releaseDate) {
      toast.error('请填写所有必填项');
      return;
    }

    updateVersion(editingVersion.id, {
      platform: formData.platform,
      versionNumber: formData.versionNumber,
      releaseDate: formData.releaseDate,
    });
    
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('版本更新成功');
  }, [editingVersion, formData, resetForm, updateVersion]);

  /**
   * 处理删除版本
   */
  const handleDeleteVersion = useCallback((versionId: string) => {
    if (confirm('确定要删除此版本吗？')) {
      deleteVersion(versionId);
      toast.success('版本已删除');
    }
  }, [deleteVersion]);

  /**
   * 关闭对话框
   */
  const handleDialogClose = useCallback(() => {
    setIsCreateDialogOpen(false);
    resetForm();
  }, [resetForm]);

  return (
    <AppLayout>
      {/* 固定区域：搜索栏 */}
      <div className="sticky top-0 z-20 bg-background">
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* 搜索和筛选栏 */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索版本号或应用端..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-48">
              <Select value={selectedPlatformFilter} onValueChange={setSelectedPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="筛选应用端" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部应用端</SelectItem>
                  {getAllPlatforms().map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || selectedPlatformFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPlatformFilter('all');
                }}
                className="px-3"
              >
                清除筛选
              </Button>
            )}
            <Button onClick={() => setIsCreateDialogOpen(true)} className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              创建版本
            </Button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 pt-4 pb-4">
        {/* 版本列表 */}
        <StickyTable minWidth={1400} maxHeight="calc(100vh - 200px)">
            <StickyTableHeader>
              <StickyTableRow>
                <StickyTableHead 
                  sticky 
                  stickyLeft={0}
                  showShadow
                  className="w-[200px] min-w-[200px] max-w-[200px] px-3 border-r"
                >
                  版本号
                </StickyTableHead>
                <StickyTableHead className="w-[150px] min-w-[150px] max-w-[150px] px-3 border-r">
                  上线时间
                </StickyTableHead>
                <StickyTableHead className="w-[200px] min-w-[200px] max-w-[200px] px-3 border-r">
                  PRD时间
                </StickyTableHead>
                <StickyTableHead className="w-[200px] min-w-[200px] max-w-[200px] px-3 border-r">
                  原型设计时间
                </StickyTableHead>
                <StickyTableHead className="w-[200px] min-w-[200px] max-w-[200px] px-3 border-r">
                  开发时间
                </StickyTableHead>
                <StickyTableHead className="w-[200px] min-w-[200px] max-w-[200px] px-3 border-r">
                  测试时间
                </StickyTableHead>
                <StickyTableHead className="w-[120px] min-w-[120px] max-w-[120px] px-3 border-r">
                  操作
                </StickyTableHead>
              </StickyTableRow>
            </StickyTableHeader>
            <StickyTableBody>
              {filteredVersions.map((version) => (
                <StickyTableRow key={version.id}>
                  <StickyTableCell 
                    sticky 
                    stickyLeft={0} 
                    showShadow
                    className="w-[200px] min-w-[200px] max-w-[200px] px-3 py-3 border-r"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{version.platform} {version.versionNumber}</span>
                    </div>
                  </StickyTableCell>
                  <StickyTableCell className="w-[150px] min-w-[150px] max-w-[150px] px-3 py-3 border-r">
                    <div className="flex items-center gap-2 text-xs">
                      <Rocket className="h-4 w-4 text-purple-500" />
                      {formatDate(version.releaseDate)}
                    </div>
                  </StickyTableCell>
                  <StickyTableCell className="w-[200px] min-w-[200px] max-w-[200px] px-3 py-3 border-r">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="text-xs">
                        <div>{formatDate(version.schedule.prdStartDate)}</div>
                        <div className="text-muted-foreground">至 {formatDate(version.schedule.prdEndDate)}</div>
                      </div>
                    </div>
                  </StickyTableCell>
                  <StickyTableCell className="w-[200px] min-w-[200px] max-w-[200px] px-3 py-3 border-r">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-orange-500" />
                      <div className="text-xs">
                        <div>{formatDate(version.schedule.prototypeStartDate)}</div>
                        <div className="text-muted-foreground">至 {formatDate(version.schedule.prototypeEndDate)}</div>
                      </div>
                    </div>
                  </StickyTableCell>
                  <StickyTableCell className="w-[200px] min-w-[200px] max-w-[200px] px-3 py-3 border-r">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-green-500" />
                      <div className="text-xs">
                        <div>{formatDate(version.schedule.devStartDate)}</div>
                        <div className="text-muted-foreground">至 {formatDate(version.schedule.devEndDate)}</div>
                      </div>
                    </div>
                  </StickyTableCell>
                  <StickyTableCell className="w-[200px] min-w-[200px] max-w-[200px] px-3 py-3 border-r">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-yellow-500" />
                      <div className="text-xs">
                        <div>{formatDate(version.schedule.testStartDate)}</div>
                        <div className="text-muted-foreground">至 {formatDate(version.schedule.testEndDate)}</div>
                      </div>
                    </div>
                  </StickyTableCell>
                  <StickyTableCell className="w-[120px] min-w-[120px] max-w-[120px] px-3 py-3 border-r">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVersion(version)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVersion(version.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              ))}
              {filteredVersions.length === 0 && (
                <StickyTableRow>
                  <StickyTableCell colSpan={7} className="text-center py-8">
                    <div className="text-xs text-muted-foreground">
                      {searchTerm ? '未找到匹配的版本' : '暂无版本数据'}
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              )}
            </StickyTableBody>
          </StickyTable>
        
        {/* 创建/编辑版本对话框 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingVersion ? '编辑版本' : '创建版本'}
              </DialogTitle>
              <DialogDescription>
                {editingVersion ? '修改版本信息，系统将自动重新计算时间节点。' : '创建新版本，系统将根据上线时间自动计算各个时间节点。'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">应用端 *</Label>
                <Select 
                  value={isAddingPlatformInSelect ? 'add-new-platform' : formData.platform} 
                  onValueChange={handlePlatformChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择应用端" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllPlatforms().map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                    
                    {/* 添加新应用端选项 */}
                    {!isAddingPlatformInSelect && (
                      <SelectItem value="add-new-platform" className="text-primary">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          增加
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                  
                  {/* 添加新应用端输入框（在Select外部） */}
                  {isAddingPlatformInSelect && (
                    <div className="mt-2 px-1">
                      <Input
                        value={newPlatformName}
                        onChange={(e) => setNewPlatformName(e.target.value)}
                        placeholder="输入应用端名称"
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleConfirmAddPlatform();
                          }
                          if (e.key === 'Escape') {
                            setIsAddingPlatformInSelect(false);
                            setNewPlatformName('');
                          }
                        }}
                        onBlur={handleConfirmAddPlatform}
                      />
                      {newPlatformName.trim() && getAllPlatforms().includes(newPlatformName.trim()) && (
                        <p className="text-xs text-destructive mt-1">该应用端已存在</p>
                      )}
                    </div>
                  )}
                </Select>
              </div>

              <div>
                <Label htmlFor="versionNumber">版本号 *</Label>
                <Input
                  id="versionNumber"
                  value={formData.versionNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, versionNumber: e.target.value }))}
                  placeholder="如：3.2.0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="releaseDate">上线时间 *</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* 时间节点预览 */}
              {formData.releaseDate && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">时间节点预览</h4>
                  <div className="space-y-2 text-xs">
                    {(() => {
                      const schedule = calculateVersionSchedule(formData.releaseDate);
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>PRD时间：{formatDate(schedule.prdStartDate)} 至 {formatDate(schedule.prdEndDate)} (3个工作日)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-orange-500" />
                            <span>原型设计：{formatDate(schedule.prototypeStartDate)} 至 {formatDate(schedule.prototypeEndDate)} (5个工作日)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-green-500" />
                            <span>开发时间：{formatDate(schedule.devStartDate)} 至 {formatDate(schedule.devEndDate)} (10个工作日)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-yellow-500" />
                            <span>测试时间：{formatDate(schedule.testStartDate)} 至 {formatDate(schedule.testEndDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-purple-500" />
                            <span>上线时间：{formatDate(formData.releaseDate)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                取消
              </Button>
              <Button 
                onClick={editingVersion ? handleUpdateVersion : handleCreateVersion}
                disabled={
                  !formData.platform || 
                  !formData.versionNumber || 
                  !formData.releaseDate ||
                  isAddingPlatformInSelect
                }
              >
                {editingVersion ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

