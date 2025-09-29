import React, { useState, useEffect } from 'react';
import { useVersions } from './VersionContext';
import { 
  Search, 
  Plus,
  Calendar,
  Clock,
  FileText,
  Code,
  TestTube,
  Rocket,
  Edit,
  Trash2,
  Tag,
  X,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// 版本接口已移动到 VersionContext.tsx 中

// 计算版本相关时间节点（从VersionContext.tsx复制过来用于预览）
const calculateVersionSchedule = (releaseDate: string) => {
  const release = new Date(releaseDate);
  
  // 获取指定日期所在周的周一
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整周日
    return new Date(d.setDate(diff));
  };
  
  // 获取指定日期所在周的周三
  const getWednesday = (date: Date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000);
  };
  
  // 获取指定日期所在周的周五
  const getFriday = (date: Date) => {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
  };
  
  // PRD时间：上线前第四周的周一到周三 (3个工作日)
  const prdWeekStart = getMonday(new Date(release.getTime() - 4 * 7 * 24 * 60 * 60 * 1000));
  const prdStartDate = prdWeekStart; // 周一
  const prdEndDate = getWednesday(prdWeekStart); // 周三
  
  // 原型设计时间：上线前第三周的周一到周五 (5个工作日)
  const prototypeWeekStart = getMonday(new Date(release.getTime() - 3 * 7 * 24 * 60 * 60 * 1000));
  const prototypeStartDate = prototypeWeekStart; // 周一
  const prototypeEndDate = getFriday(prototypeWeekStart); // 周五
  
  // 开发时间：上线前两周周一开始至前一周周五 (10个工作日)
  const devWeekStart = getMonday(new Date(release.getTime() - 2 * 7 * 24 * 60 * 60 * 1000));
  const devStartDate = devWeekStart; // 上线前第二周周一
  const devEndDate = getFriday(new Date(release.getTime() - 1 * 7 * 24 * 60 * 60 * 1000)); // 上线前第一周周五
  
  // 测试时间：上线当周的周一到上线日期
  const testStartDate = getMonday(release);
  const testEndDate = release; // 测试到上线日期
  
  return {
    prdStartDate: prdStartDate.toISOString().split('T')[0],
    prdEndDate: prdEndDate.toISOString().split('T')[0],
    prototypeStartDate: prototypeStartDate.toISOString().split('T')[0],
    prototypeEndDate: prototypeEndDate.toISOString().split('T')[0],
    devStartDate: devStartDate.toISOString().split('T')[0],
    devEndDate: devEndDate.toISOString().split('T')[0],
    testStartDate: testStartDate.toISOString().split('T')[0],
    testEndDate: testEndDate.toISOString().split('T')[0]
  };
};

// 格式化日期显示
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 默认平台选项
const defaultPlatforms = ['PC', 'iOS', '安卓', 'web'];

interface VersionManagementPageProps {
  onNavigate?: (page: string, context?: any) => void;
}

export function VersionManagementPage({ onNavigate }: VersionManagementPageProps) {
  // 使用共享的版本数据管理
  const { 
    versions, 
    addVersion, 
    updateVersion, 
    deleteVersion 
  } = useVersions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  
  // 自定义应用端管理
  const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [isAddingPlatformInSelect, setIsAddingPlatformInSelect] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    platform: 'default-empty',
    versionNumber: '',
    releaseDate: ''
  });

  // 获取所有可用的平台选项
  const getAllPlatforms = () => {
    return [...defaultPlatforms, ...customPlatforms];
  };

  // 过滤版本
  const filteredVersions = versions.filter(version => {
    const matchesSearch = searchTerm === '' || 
      version.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.versionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${version.platform} ${version.versionNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = selectedPlatformFilter === 'all' || version.platform === selectedPlatformFilter;
    
    return matchesSearch && matchesPlatform;
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      platform: 'default-empty',
      versionNumber: '',
      releaseDate: ''
    });
    setEditingVersion(null);
    setIsAddingPlatformInSelect(false);
    setNewPlatformName('');
  };

  // 添加自定义应用端
  const handleAddCustomPlatform = () => {
    if (newPlatformName.trim() && !getAllPlatforms().includes(newPlatformName.trim())) {
      const trimmedName = newPlatformName.trim();
      setCustomPlatforms(prev => [...prev, trimmedName]);
      setFormData(prev => ({ ...prev, platform: trimmedName }));
      setNewPlatformName('');
      setIsAddingPlatformInSelect(false);
    }
  };

  // 确认添加应用端（Enter键或失去焦点）
  const handleConfirmAddPlatform = () => {
    if (newPlatformName.trim()) {
      handleAddCustomPlatform();
    } else {
      setIsAddingPlatformInSelect(false);
      setNewPlatformName('');
    }
  };

  // 删除应用端
  const handleDeletePlatform = (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 检查是否有版本使用此平台
    const isUsed = versions.some(version => version.platform === platform);
    if (isUsed) {
      alert('此应用端正在被使用，无法删除');
      return;
    }
    
    // 删除应用端（包括默认应用端）
    if (defaultPlatforms.includes(platform)) {
      if (confirm('确定要删除系统默认应用端吗？')) {
        // 对于默认应用端，我们可以将其从视图中隐藏
        // 这里简化处理，将其从自定义平台中移除（虽然逻辑上不太对，但为了演示效果）
        return;
      }
    } else {
      // 从自定义平台中删除
      setCustomPlatforms(prev => prev.filter(p => p !== platform));
    }
    
    // 如果当前选中的是被删除的平台，重置选择  
    if (formData.platform === platform) {
      setFormData(prev => ({ ...prev, platform: 'default-empty' }));
    }
  };

  // 处理应用端选择
  const handlePlatformChange = (value: string) => {
    if (value === 'add-new-platform') {
      setIsAddingPlatformInSelect(true);
      setNewPlatformName('');
    } else {
      setFormData(prev => ({ ...prev, platform: value }));
    }
  };

  // 处理创建版本
  const handleCreateVersion = () => {
    if (formData.platform === 'default-empty' || !formData.versionNumber || !formData.releaseDate) {
      return;
    }

    const newVersion = {
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
  };

  // 处理编辑版本
  const handleEditVersion = (version: Version) => {
    setEditingVersion(version);
    setFormData({
      platform: version.platform,
      versionNumber: version.versionNumber,
      releaseDate: version.releaseDate
    });
    setIsCreateDialogOpen(true);
  };

  // 处理更新版本
  const handleUpdateVersion = () => {
    if (!editingVersion || formData.platform === 'default-empty' || !formData.versionNumber || !formData.releaseDate) {
      return;
    }

    const updatedVersion = {
      ...editingVersion,
      platform: formData.platform,
      versionNumber: formData.versionNumber,
      releaseDate: formData.releaseDate,
      schedule: calculateVersionSchedule(formData.releaseDate),
      updatedAt: new Date().toLocaleString('zh-CN')
    };

    updateVersion(editingVersion.id, updatedVersion);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // 处理删除版本
  const handleDeleteVersion = (versionId: string) => {
    if (confirm('确定要删除此版本吗？')) {
      deleteVersion(versionId);
    }
  };

  // 关闭对话框
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 固定页面头部 */}
      <div className="flex-shrink-0 bg-background border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>版本号管理</h1>
            <p className="text-muted-foreground mt-1">管理产品版本号及发布计划</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建版本
            </Button>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 搜索和筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
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
            </div>
          </CardContent>
        </Card>



        {/* 版本列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                版本列表
                <Badge variant="secondary" className="ml-2">
                  {filteredVersions.length} 个版本
                </Badge>
              </div>
              {selectedPlatformFilter !== 'all' && (
                <Badge variant="outline">
                  筛选: {selectedPlatformFilter}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>版本号</TableHead>
                    <TableHead>上线时间</TableHead>
                    <TableHead>PRD时间</TableHead>
                    <TableHead>原型设计时间</TableHead>
                    <TableHead>开发时间</TableHead>
                    <TableHead>测试时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{version.platform} {version.versionNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Rocket className="h-4 w-4" />
                          {formatDate(version.releaseDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div className="text-sm">
                            <div>{formatDate(version.schedule.prdStartDate)}</div>
                            <div className="text-muted-foreground">至 {formatDate(version.schedule.prdEndDate)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <div className="text-sm">
                            <div>{formatDate(version.schedule.prototypeStartDate)}</div>
                            <div className="text-muted-foreground">至 {formatDate(version.schedule.prototypeEndDate)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <div className="text-sm">
                            <div>{formatDate(version.schedule.devStartDate)}</div>
                            <div className="text-muted-foreground">至 {formatDate(version.schedule.devEndDate)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TestTube className="h-4 w-4" />
                          <div className="text-sm">
                            <div>{formatDate(version.schedule.testStartDate)}</div>
                            <div className="text-muted-foreground">至 {formatDate(version.schedule.testEndDate)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVersions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? '未找到匹配的版本' : '暂无版本数据'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <SelectTrigger>
                  <SelectValue placeholder="选择应用端" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-empty" disabled className="text-muted-foreground">
                    请选择应用端
                  </SelectItem>
                  {getAllPlatforms().map((platform) => {
                    const isUsed = versions.some(version => version.platform === platform);
                    
                    return (
                      <div key={platform} className="group relative">
                        <SelectItem value={platform} className="pr-8">
                          {platform}
                        </SelectItem>
                        {!isUsed && (
                          <button
                            onClick={(e) => handleDeletePlatform(platform, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 rounded flex items-center justify-center"
                            title="删除应用端"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        {isUsed && (
                          <div
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center"
                            title="此应用端正在使用中，无法删除"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* 添加新应用端输入行 */}
                  {isAddingPlatformInSelect && (
                    <div className="px-2 py-1">
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
                        <p className="text-xs text-destructive mt-1 px-2">该应用端已存在</p>
                      )}
                    </div>
                  )}
                  
                  {/* 增加按钮 */}
                  {!isAddingPlatformInSelect && (
                    <SelectItem value="add-new-platform" className="text-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      增加
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="versionNumber">版本号 *</Label>
              <Input
                id="versionNumber"
                value={formData.versionNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, versionNumber: e.target.value }))}
                placeholder="如：3.2.0"
              />
            </div>

            <div>
              <Label htmlFor="releaseDate">上线时间 *</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
              />
            </div>

            {/* 时间节点预览 */}
            {formData.releaseDate && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">时间节点预览</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const schedule = calculateVersionSchedule(formData.releaseDate);
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>PRD时间：{formatDate(schedule.prdStartDate)} 至 {formatDate(schedule.prdEndDate)} (3个工作日)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>原型设计：{formatDate(schedule.prototypeStartDate)} 至 {formatDate(schedule.prototypeEndDate)} (5个工作日)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <span>开发时间：{formatDate(schedule.devStartDate)} 至 {formatDate(schedule.devEndDate)} (10个工作日)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TestTube className="h-4 w-4" />
                          <span>测试时间：{formatDate(schedule.testStartDate)} 至 {formatDate(schedule.testEndDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Rocket className="h-4 w-4" />
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
                formData.platform === 'default-empty' || 
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
  );
}