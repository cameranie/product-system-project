import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { PRDViewerUpdated } from './PRDViewerUpdated';
import { PRDEditorUpdated } from './PRDEditorUpdated';
import { PRDListTable } from './PRDPageList';
import { Plus } from 'lucide-react';

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

interface RequirementRef {
  id: string;
  title: string;
  type: string;
}

interface TaskRef {
  id: string;
  title: string;
  status: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface PRDItem {
  id: string;
  title: string;
  version: string;
  project: Project;
  status: 'draft' | 'published' | 'reviewing' | 'archived';
  creator: User;
  updatedAt: string;
  createdAt: string;
  content?: string;
  linkedRequirements?: RequirementRef[];
  attachments?: Attachment[];
  tags?: string[];
  reviewer1?: User;
  reviewer2?: User;
  isDraft?: boolean;
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  platform?: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '', role: '产品经理' },
  { id: '2', name: '李四', avatar: '', role: '产品经理' },
  { id: '3', name: '王五', avatar: '', role: '技术负责人' },
  { id: '4', name: '赵六', avatar: '', role: 'UI设计师' },
  { id: '5', name: '孙七', avatar: '', role: '开发工程师' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'K线', color: '#3b82f6' },
  { id: '2', name: '行情', color: '#10b981' },
  { id: '3', name: '聊天室', color: '#f59e0b' },
  { id: '4', name: '系统', color: '#ef4444' },
  { id: '5', name: '交易', color: '#8b5cf6' },
];

const platforms = [
  'Web端', '移动端', '全平台', 'PC端', '小程序'
];

const mockRequirements: RequirementRef[] = [
  { id: '1', title: '用户注册流程优化', type: '功能需求' },
  { id: '2', title: '支付功能集成', type: '功能需求' },
  { id: '3', title: '数据导出功能', type: '产品建议' },
  { id: '4', title: '移动端适配优化', type: '技术需求' },
];

const mockTasks: TaskRef[] = [
  { id: '1', title: '登录页面重构', status: '进行中' },
  { id: '2', title: '支付接口开发', status: '待开始' },
  { id: '3', title: 'UI设计稿', status: '已完成' },
];

// 格式化时间为 YYYY-MM-DD HH:mm
const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const mockPRDs: PRDItem[] = [
  {
    id: '1',
    title: '用户注册流程优化PRD',
    version: 'v2.1',
    project: mockProjects[0],
    platform: 'Web端',
    status: 'published',
    creator: mockUsers[0],
    updatedAt: '2024-01-20 14:30',
    createdAt: '2024-01-15 09:15',
    content: '# 用户中心PRD v2.1\n\n## 项目背景\n用户中心是整个平台的核心模块...',
    linkedRequirements: [mockRequirements[0]],
    tags: ['用户体验', 'UI优化'],
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[3],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
  {
    id: '2',
    title: '支付功能集成PRD',
    version: 'v2.0',
    project: mockProjects[4],
    platform: '全平台',
    status: 'published',
    creator: mockUsers[1],
    updatedAt: '2024-01-18 16:45',
    createdAt: '2024-01-10 11:20',
    content: '# 支付系统PRD v1.0\n\n## 项目背景\n支付系统需要支持多种支付方式...',
    linkedRequirements: [mockRequirements[1]],
    tags: ['支付', '功能'],
    reviewer1: mockUsers[2],
    reviewer2: mockUsers[4],
    reviewStatus: 'approved',
    reviewer1Status: 'approved',
    reviewer2Status: 'approved'
  },
];

// 计算总评审状态的函数
const getOverallReviewStatus = (prd: PRDItem) => {
  const hasReviewer1 = !!prd.reviewer1;
  const hasReviewer2 = !!prd.reviewer2;
  
  if (!hasReviewer1 && !hasReviewer2) {
    return { status: 'none', label: '-', variant: 'outline' as const, color: 'text-gray-400' };
  }
  
  const reviewer1Status = prd.reviewer1Status || 'pending';
  const reviewer2Status = prd.reviewer2Status || 'pending';
  
  if ((hasReviewer1 && reviewer1Status === 'rejected') || (hasReviewer2 && reviewer2Status === 'rejected')) {
    return { status: 'rejected', label: '评审不通过', variant: 'destructive' as const, color: 'text-red-500' };
  }
  
  if (hasReviewer1 && !hasReviewer2) {
    if (reviewer1Status === 'approved') {
      return { status: 'approved', label: '评审通过', variant: 'default' as const, color: 'text-green-500' };
    } else if (reviewer1Status === 'pending') {
      return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
    } else {
      return { status: 'reviewing', label: '评审中', variant: 'outline' as const, color: 'text-blue-500' };
    }
  }
  
  if (hasReviewer1 && hasReviewer2) {
    if (reviewer1Status === 'approved' && reviewer2Status === 'approved') {
      return { status: 'approved', label: '评审通过', variant: 'default' as const, color: 'text-green-500' };
    } else if (reviewer1Status === 'pending' && reviewer2Status === 'pending') {
      return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
    } else {
      return { status: 'reviewing', label: '评审中', variant: 'outline' as const, color: 'text-blue-500' };
    }
  }
  
  return { status: 'pending', label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' };
};

interface PRDPageProps {
  context?: any;
  onNavigate?: (page: string, context?: any) => void;
}

export function PRDPage({ context, onNavigate }: PRDPageProps = {}) {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view'>('list');
  const [selectedPRD, setSelectedPRD] = useState<PRDItem | null>(null);
  const [prds, setPrds] = useState<PRDItem[]>(mockPRDs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  
  const [editingPRD, setEditingPRD] = useState<Partial<PRDItem>>({
    title: '',
    content: '',
    project: mockProjects[0],
    status: 'draft',
    linkedRequirements: [],
    attachments: [],
    tags: [],
    isDraft: true,
    reviewStatus: 'pending',
    reviewer1Status: 'pending',
    reviewer2Status: 'pending'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导航上下文
  useEffect(() => {
    if (context) {
      if (context.mode === 'create') {
        setCurrentView('edit');
        // 根据需求ID从需求数据中获取需求信息
        const getRequirementInfo = (requirementId: string) => {
          // 模拟需求数据映射
          const requirementTitles: Record<string, string> = {
            '1': '用户注册流程优化',
            '2': '支付功能集成', 
            '3': '数据导出功能',
            '4': 'K线图实时更新优化',
            '5': '行情推送服务升级',
            '6': '交易风控系统优化'
          };
          return {
            title: requirementTitles[requirementId] || '未知需求',
            type: '功能需求'
          };
        };

        const requirementInfo = context.requirementId ? getRequirementInfo(context.requirementId) : null;
        
        setEditingPRD({
          title: requirementInfo ? `${requirementInfo.title}PRD` : '',
          content: '',
          project: mockProjects[0],
          status: 'draft',
          linkedRequirements: context.requirementId ? [{
            id: context.requirementId,
            title: requirementInfo?.title || '',
            type: requirementInfo?.type || '功能需求'
          }] : [],
          attachments: [],
          tags: [],
          isDraft: true,
          reviewStatus: 'pending',
          reviewer1Status: 'pending',
          reviewer2Status: 'pending'
        });
      } else if (context.mode === 'edit' && context.prd) {
        setCurrentView('edit');
        setEditingPRD(context.prd);
        setSelectedPRD(context.prd);
      } else if (context.mode === 'edit-draft' && context.draft) {
        // 编辑草稿模式
        setCurrentView('edit');
        // 将草稿数据转换为PRD格式
        const draftAsPRD = {
          id: context.draft.id,
          title: context.draft.title,
          content: context.draft.content || '',
          project: mockProjects[0], // 默认项目
          platform: context.draft.platform,
          priority: context.draft.priority,
          status: 'draft' as const,
          creator: context.draft.creator,
          updatedAt: context.draft.updatedAt,
          createdAt: context.draft.createdAt,
          linkedRequirements: context.draft.requirementId ? [{
            id: context.draft.requirementId,
            title: context.draft.requirementTitle || '',
            type: '功能需求'
          }] : [],
          attachments: [],
          tags: [],
          isDraft: true,
          reviewStatus: 'pending' as const,
          reviewer1Status: 'pending' as const,
          reviewer2Status: 'pending' as const
        };
        setEditingPRD(draftAsPRD);
      } else if (context.mode === 'view') {
        // 根据prdId查找PRD，如果没有提供prd对象的话
        if (context.prd) {
          setSelectedPRD(context.prd);
          setCurrentView('view');
        } else if (context.prdId) {
          const foundPRD = prds.find(p => p.id === context.prdId);
          if (foundPRD) {
            setSelectedPRD(foundPRD);
            setCurrentView('view');
          } else {
            // 如果找不到PRD，可能需要从服务器获取或显示错误
            console.warn('PRD not found:', context.prdId);
            setCurrentView('list');
          }
        }
      }
    }
  }, [context, prds]);

  // 筛选和排序逻辑
  const filteredPRDs = prds.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prd.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || prd.project.id === filterProject;
    return matchesSearch && matchesProject;
  });

  const sortedPRDs = [...filteredPRDs].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'version':
        aValue = a.version;
        bValue = b.version;
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleCreatePRD = () => {
    setEditingPRD({
      title: '',
      content: '',
      project: mockProjects[0],
      status: 'draft',
      linkedRequirements: [],
      attachments: [],
      tags: [],
      isDraft: true,
      reviewStatus: 'pending',
      reviewer1Status: 'pending',
      reviewer2Status: 'pending'
    });
    setCurrentView('edit');
  };

  const handleEditPRD = (prd: PRDItem) => {
    // 如果当前在查看模式且有onNavigate，跳转到编辑页面
    if (currentView === 'view' && onNavigate) {
      onNavigate('prd-edit', {
        prd: prd,
        prdId: prd.id,
        mode: 'edit'
      });
    } else {
      // 否则使用内部状态切换（向后兼容）
      setEditingPRD(prd);
      setSelectedPRD(prd);
      setCurrentView('edit');
    }
  };

  const handleViewPRD = (prd: PRDItem) => {
    setSelectedPRD(prd);
    setCurrentView('view');
  };

  const handleSaveDraft = () => {
    // 如果是编辑草稿模式，需要特殊处理
    if (context?.mode === 'edit-draft') {
      // 构造草稿数据，保持与DraftPRD类型一致
      const draftData = {
        id: editingPRD.id,
        title: editingPRD.title || '',
        content: editingPRD.content || '',
        platform: editingPRD.platform,
        priority: editingPRD.priority,
        creator: editingPRD.creator || mockUsers[0],
        updatedAt: formatDateTime(new Date()),
        createdAt: editingPRD.createdAt || formatDateTime(new Date()),
        requirementId: editingPRD.linkedRequirements?.[0]?.id,
        requirementTitle: editingPRD.linkedRequirements?.[0]?.title
      };
      
      // 返回PRD管理页面，并传递更新的草稿数据
      if (context?.returnTo && onNavigate) {
        onNavigate(context.returnTo, { 
          updatedDraft: draftData,
          source: 'draft-edit'
        });
      } else {
        onNavigate?.('prd', { 
          updatedDraft: draftData,
          source: 'draft-edit'
        });
      }
      return;
    }

    // 普通草稿保存逻辑
    const newPRD: PRDItem = {
      ...editingPRD as PRDItem,
      id: editingPRD.id || `draft-${Date.now()}`,
      version: 'v1.0',
      creator: mockUsers[0],
      createdAt: editingPRD.createdAt || formatDateTime(new Date()),
      updatedAt: formatDateTime(new Date()),
      isDraft: true,
      reviewStatus: 'pending'
    };
    
    if (editingPRD.id) {
      setPrds(prds.map(p => p.id === editingPRD.id ? newPRD : p));
    } else {
      setPrds([newPRD, ...prds]);
    }
    
    if (context?.returnTo && onNavigate) {
      onNavigate(context.returnTo, context.returnContext);
    } else {
      setCurrentView('list');
    }
  };

  const handleSubmitPRD = () => {
    if (!editingPRD.reviewer1) {
      alert('请设置一级审核人员');
      return;
    }

    const submittedPRD: PRDItem = {
      ...editingPRD as PRDItem,
      id: editingPRD.id || `prd-${Date.now()}`,
      version: editingPRD.version || 'v1.0',
      creator: mockUsers[0],
      createdAt: editingPRD.createdAt || formatDateTime(new Date()),
      updatedAt: formatDateTime(new Date()),
      status: 'reviewing',
      isDraft: false,
      reviewStatus: 'first_review',
      reviewer1Status: 'pending',
      reviewer2Status: 'pending'
    };

    if (editingPRD.id) {
      setPrds(prds.map(p => p.id === editingPRD.id ? submittedPRD : p));
    } else {
      setPrds([submittedPRD, ...prds]);
    }
    
    if (context?.source === 'prd-management' && onNavigate) {
      onNavigate('prd', { source: 'prd-management' });
    } else {
      setCurrentView('list');
    }
  };

  const handleCancel = () => {
    if (context?.returnTo && onNavigate) {
      if (context.returnTo === 'requirement-detail' && context.returnContext) {
        // 返回到需求详情页面，传递完整的上下文
        onNavigate('requirement-detail', context.returnContext);
      } else {
        // 其他返回情况
        onNavigate(context.returnTo, context.returnContext);
      }
    } else if (context?.source === 'prd-management' && onNavigate) {
      onNavigate('prd', { source: 'prd-management' });
    } else {
      setCurrentView('list');
    }
  };

  const handleBack = () => {
    if (context?.returnTo && onNavigate) {
      if (context.returnTo === 'requirement-detail' && context.returnContext) {
        // 返回到需求详情页面，传递完整的上下文
        onNavigate('requirement-detail', context.returnContext);
      } else {
        // 其他返回情况
        onNavigate(context.returnTo, context.returnContext);
      }
    } else if (context?.source === 'prd-management' && onNavigate) {
      onNavigate('prd', { source: 'prd-management' });
    } else {
      setCurrentView('list');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setEditingPRD(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const removeAttachment = (id: string) => {
    setEditingPRD(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== id) || []
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !editingPRD.tags?.includes(tag)) {
      setEditingPRD(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEditingPRD(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  // 处理项目修改
  const handleProjectChange = (prdId: string, projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      setPrds(prds.map(p => 
        p.id === prdId 
          ? { ...p, project, updatedAt: formatDateTime(new Date()) }
          : p
      ));
    }
  };

  // 处理应用端修改
  const handlePlatformChange = (prdId: string, platform: string) => {
    setPrds(prds.map(p => 
      p.id === prdId 
        ? { ...p, platform, updatedAt: formatDateTime(new Date()) }
        : p
    ));
  };

  // 处理评审人员修改
  const handleReviewer1Change = (prdId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    setPrds(prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer1: user || undefined,
            reviewer1Status: user ? 'pending' as const : undefined,
            updatedAt: formatDateTime(new Date())
          }
        : p
    ));
  };

  const handleReviewer2Change = (prdId: string, userId: string | null) => {
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    setPrds(prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer2: user || undefined,
            reviewer2Status: user ? 'pending' as const : undefined,
            updatedAt: formatDateTime(new Date())
          }
        : p
    ));
  };

  // 处理评审状态修改
  const handleReviewer1StatusChange = (prdId: string, status: 'pending' | 'approved' | 'rejected') => {
    setPrds(prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer1Status: status,
            updatedAt: formatDateTime(new Date())
          }
        : p
    ));
  };

  const handleReviewer2StatusChange = (prdId: string, status: 'pending' | 'approved' | 'rejected') => {
    setPrds(prds.map(p => 
      p.id === prdId 
        ? { 
            ...p, 
            reviewer2Status: status,
            updatedAt: formatDateTime(new Date())
          }
        : p
    ));
  };

  // 处理审核
  const handleFirstReviewApprove = (prdId: string) => {
    setPrds(prds.map(p => {
      if (p.id === prdId) {
        const updatedPRD = {
          ...p,
          reviewer1Status: 'approved' as const,
          reviewStatus: p.reviewer2 ? 'second_review' as const : 'approved' as const,
          status: p.reviewer2 ? 'reviewing' as const : 'published' as const,
          updatedAt: formatDateTime(new Date())
        };
        return updatedPRD;
      }
      return p;
    }));
  };

  const handleSecondReviewApprove = (prdId: string) => {
    setPrds(prds.map(p => {
      if (p.id === prdId) {
        const updatedPRD = {
          ...p,
          reviewer2Status: 'approved' as const,
          reviewStatus: 'approved' as const,
          status: 'published' as const,
          updatedAt: formatDateTime(new Date())
        };
        return updatedPRD;
      }
      return p;
    }));
  };

  const handleReviewReject = (prdId: string, level: 'first' | 'second') => {
    setPrds(prds.map(p => {
      if (p.id === prdId) {
        const updatedPRD = {
          ...p,
          ...(level === 'first' 
            ? { reviewer1Status: 'rejected' as const }
            : { reviewer2Status: 'rejected' as const }
          ),
          reviewStatus: 'rejected' as const,
          status: 'draft' as const,
          updatedAt: formatDateTime(new Date())
        };
        return updatedPRD;
      }
      return p;
    }));
  };

  const availableColumns = [
    { key: 'title', label: 'PRD标题', required: true },
    { key: 'version', label: '版本' },
    { key: 'project', label: '所属项目' },
    { key: 'platform', label: '应用端' },
    { key: 'reviewStatus', label: '评审状态' },
    { key: 'reviewer1', label: '一级评审' },
    { key: 'reviewer2', label: '二级评审' },
    { key: 'creator', label: '创建人' },
    { key: 'updatedAt', label: '更新时间' }
  ];

  if (currentView === 'edit') {
    return <PRDEditorUpdated 
      prd={editingPRD}
      setPrd={setEditingPRD}
      onBack={handleBack}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmitPRD}
      onCancel={handleCancel}
      projects={mockProjects}
      users={mockUsers}
      requirements={mockRequirements}
      tasks={mockTasks}
      onProjectChange={(projectId) => {
        const project = mockProjects.find(p => p.id === projectId);
        if (project) {
          setEditingPRD(prev => ({ ...prev, project }));
        }
      }}
      onPlatformChange={(platform) => {
        setEditingPRD(prev => ({ ...prev, platform }));
      }}
      onReviewer1Change={(userId) => {
        const user = userId ? mockUsers.find(u => u.id === userId) : null;
        setEditingPRD(prev => ({ 
          ...prev, 
          reviewer1: user || undefined,
          reviewer1Status: user ? 'pending' as const : undefined
        }));
      }}
      onReviewer2Change={(userId) => {
        const user = userId ? mockUsers.find(u => u.id === userId) : null;
        setEditingPRD(prev => ({ 
          ...prev, 
          reviewer2: user || undefined,
          reviewer2Status: user ? 'pending' as const : undefined
        }));
      }}
      onFileUpload={handleFileUpload}
      onRemoveAttachment={removeAttachment}
      onAddTag={addTag}
      onRemoveTag={removeTag}
      fileInputRef={fileInputRef}
      onNavigateToRequirement={(requirementId) => {
        onNavigate?.('requirement-detail', {
          requirementId: requirementId,
          source: 'prd-edit'
        });
      }}
    />;
  }

  if (currentView === 'view' && selectedPRD) {
    return <PRDViewerUpdated 
      prd={selectedPRD}
      onEdit={() => handleEditPRD(selectedPRD)}
      onBack={handleBack}
      onFirstReviewApprove={() => handleFirstReviewApprove(selectedPRD.id)}
      onSecondReviewApprove={() => handleSecondReviewApprove(selectedPRD.id)} 
      onReviewReject={(level) => handleReviewReject(selectedPRD.id, level)}
      projects={mockProjects}
      users={mockUsers}
      requirements={mockRequirements}
      tasks={mockTasks}
      onProjectChange={(projectId) => handleProjectChange(selectedPRD.id, projectId)}
      onPlatformChange={(platform) => handlePlatformChange(selectedPRD.id, platform)}
      onReviewer1Change={(userId) => handleReviewer1Change(selectedPRD.id, userId)}
      onReviewer2Change={(userId) => handleReviewer2Change(selectedPRD.id, userId)}
      onReviewer1StatusChange={(status) => handleReviewer1StatusChange(selectedPRD.id, status)}
      onReviewer2StatusChange={(status) => handleReviewer2StatusChange(selectedPRD.id, status)}
      onNavigate={onNavigate}
    />;
  }

  // 默认返回列表视图
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">PRD页面</h1>
          <p className="text-muted-foreground mt-1">产品需求文档管理</p>
        </div>
        <Button onClick={handleCreatePRD}>
          <Plus className="h-4 w-4 mr-2" />
          新建PRD
        </Button>
      </div>
      
      <PRDListTable
        prds={sortedPRDs}
        onSort={handleSortChange} 
        sortBy={sortBy}
        sortOrder={sortOrder}
        hiddenColumns={hiddenColumns}
        availableColumns={availableColumns}
        onToggleColumn={(column) => {
          if (hiddenColumns.includes(column)) {
            setHiddenColumns(hiddenColumns.filter(c => c !== column));
          } else {
            setHiddenColumns([...hiddenColumns, column]);
          }
        }}
        onViewPRD={handleViewPRD}
        onEditPRD={handleEditPRD}
        onProjectChange={handleProjectChange}
        onPlatformChange={handlePlatformChange}
        onReviewer1Change={handleReviewer1Change}
        onReviewer2Change={handleReviewer2Change}
        onReviewer1StatusChange={handleReviewer1StatusChange}
        onReviewer2StatusChange={handleReviewer2StatusChange}
        projects={mockProjects}
        users={mockUsers}
        getOverallReviewStatus={getOverallReviewStatus}
      />
    </div>
  );
}