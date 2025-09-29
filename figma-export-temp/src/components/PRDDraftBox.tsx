import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from "sonner@2.0.3";
import { 
  Archive,
  Search,
  Edit3,
  Trash2,
  Send,
  Clock,
  Plus,
  X,
  MoreHorizontal
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface DraftPRD {
  id: string;
  title: string;
  content?: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
  requirementId?: string;
  requirementTitle?: string;
  platform?: string;
  priority?: '低' | '中' | '高' | '紧急';
}

interface PRDDraftBoxProps {
  currentUser: User;
  onCreatePRDFromDraft?: (draft: DraftPRD) => void;
  onNavigate?: (page: string, context?: any) => void;
}

const mockUser: User = { id: '1', name: '张三', avatar: '', role: '产品经理' };

const mockDrafts: DraftPRD[] = [
  {
    id: 'draft-1',
    title: '用户权限管理功能PRD',
    content: '## 概述\n\n本PRD旨在设计一个完善的用户权限管理系统...',
    creator: mockUser,
    createdAt: '2024-12-15 10:30',
    updatedAt: '2024-12-16 14:20',
    requirementId: 'req-001',
    requirementTitle: '用户权限管理需求',
    platform: 'Web端',
    priority: '高'
  },
  {
    id: 'draft-2',
    title: '数据可视化大屏PRD',
    content: '## 背景\n\n为了更好地展示业务数据...',
    creator: mockUser,
    createdAt: '2024-12-14 16:45',
    updatedAt: '2024-12-15 09:15',
    platform: '全平台',
    priority: '中'
  },
  {
    id: 'draft-3',
    title: '移动端性能优化PRD',
    creator: mockUser,
    createdAt: '2024-12-13 11:20',
    updatedAt: '2024-12-13 11:20',
    platform: '移动端',
    priority: '高'
  }
];

export function PRDDraftBox({ currentUser, onCreatePRDFromDraft, onNavigate }: PRDDraftBoxProps) {
  const [drafts, setDrafts] = useState<DraftPRD[]>(mockDrafts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftPRD | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 筛选草稿
  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.requirementTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化时间显示
  const formatDateTime = (dateTimeStr: string): string => {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return dateTimeStr.split(' ')[0];
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case '低':
        return 'bg-green-100 text-green-800 border-green-200';
      case '中':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '高':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case '紧急':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 编辑草稿
  const handleEditDraft = (draft: DraftPRD) => {
    setSelectedDraft(draft);
    setIsPreviewMode(false);
    setIsDialogOpen(false);
    
    // 导航到PRD编辑页面，传递草稿数据
    onNavigate?.('prd-edit', {
      mode: 'edit-draft',
      draftId: draft.id,
      draft: draft,
      returnTo: 'prd'
    });
  };

  // 预览草稿
  const handlePreviewDraft = (draft: DraftPRD) => {
    setSelectedDraft(draft);
    setIsPreviewMode(true);
  };

  // 发布草稿
  const handlePublishDraft = (draft: DraftPRD) => {
    // 将草稿转为正式PRD
    onCreatePRDFromDraft?.(draft);
    
    // 从草稿箱中移除
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    setIsDialogOpen(false);
    
    toast.success(`草稿"${draft.title}"已发布为正式PRD`);
  };

  // 删除草稿
  const handleDeleteDraft = (draftId: string) => {
    if (window.confirm('确定要删除这个草稿吗？此操作无法撤销。')) {
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      toast.success('草稿已删除');
    }
  };

  // 创建新草稿
  const handleCreateNewDraft = () => {
    setIsDialogOpen(false);
    onNavigate?.('prd-create', {
      mode: 'create-draft',
      returnTo: 'prd'
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Archive className="h-4 w-4 mr-2" />
          草稿箱
          {drafts.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {drafts.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            PRD草稿箱 ({drafts.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 搜索和操作栏 */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索草稿..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreateNewDraft} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新建草稿
            </Button>
          </div>

          {/* 草稿列表 */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredDrafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-sm">
                  {drafts.length === 0 ? '暂无草稿' : '没有找到匹配的草稿'}
                </div>
                {drafts.length === 0 && (
                  <Button 
                    variant="link" 
                    onClick={handleCreateNewDraft}
                    className="mt-2"
                  >
                    创建第一个草稿
                  </Button>
                )}
              </div>
            ) : (
              filteredDrafts.map((draft) => (
                <Card key={draft.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* 标题行 */}
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">
                            {draft.title}
                          </h3>
                          {draft.priority && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityStyle(draft.priority)}`}
                            >
                              {draft.priority}
                            </Badge>
                          )}
                          {draft.platform && (
                            <Badge variant="secondary" className="text-xs">
                              {draft.platform}
                            </Badge>
                          )}
                        </div>

                        {/* 关联需求 */}
                        {draft.requirementTitle && (
                          <div className="text-xs text-muted-foreground">
                            关联需求: {draft.requirementTitle}
                          </div>
                        )}

                        {/* 时间信息 */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(draft.updatedAt)}更新
                          </div>
                          <div>
                            创建于 {draft.createdAt.split(' ')[0]}
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewDraft(draft)}
                          className="h-8 px-2"
                        >
                          预览
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDraft(draft)}
                          className="h-8 px-2"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePublishDraft(draft)}>
                              <Send className="h-3 w-3 mr-2" />
                              发布为正式PRD
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDraft(draft.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              删除草稿
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* 草稿预览对话框 */}
        {selectedDraft && isPreviewMode && (
          <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedDraft.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsPreviewMode(false);
                        handleEditDraft(selectedDraft);
                      }}
                    >
                      <Edit3 className="h-3 w-3 mr-2" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePublishDraft(selectedDraft)}
                    >
                      <Send className="h-3 w-3 mr-2" />
                      发布
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground border-b pb-3">
                  <span>创建时间: {selectedDraft.createdAt}</span>
                  <span>更新时间: {selectedDraft.updatedAt}</span>
                  {selectedDraft.requirementTitle && (
                    <span>关联需求: {selectedDraft.requirementTitle}</span>
                  )}
                </div>

                {/* 内容预览 */}
                <div className="max-h-96 overflow-y-auto">
                  {selectedDraft.content ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {selectedDraft.content}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-sm">草稿内容为空</div>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setIsPreviewMode(false);
                          handleEditDraft(selectedDraft);
                        }}
                        className="mt-2"
                      >
                        立即编辑
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}