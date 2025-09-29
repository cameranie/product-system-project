import React from 'react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

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

interface PRDItem {
  id: string;
  title: string;
  version: string;
  project: Project;
  platform?: string;
  status: 'draft' | 'published' | 'reviewing' | 'archived';
  creator: User;
  updatedAt: string;
  createdAt: string;
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';
}

interface PRDListTableProps {
  prds: PRDItem[];
  hiddenColumns: string[];
  onViewPRD: (prd: PRDItem) => void;
  onProjectChange: (prdId: string, projectId: string) => void;
  onPlatformChange: (prdId: string, platform: string) => void;
  onReviewer1Change: (prdId: string, userId: string | null) => void;
  onReviewer2Change: (prdId: string, userId: string | null) => void;
  onReviewer1StatusChange: (prdId: string, status: 'pending' | 'approved' | 'rejected') => void;
  onReviewer2StatusChange: (prdId: string, status: 'pending' | 'approved' | 'rejected') => void;
  mockUsers: User[];
  mockProjects: Project[];
  platforms: string[];
}

const statusLabels = {
  draft: { label: '草稿', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-500' },
  reviewing: { label: '审核中', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-500' },
  published: { label: '已发布', variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
  archived: { label: '已归档', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-400' }
};

const reviewerStatusLabels = {
  pending: { label: '待评审', variant: 'secondary' as const, color: 'text-gray-500' },
  approved: { label: '已通过', variant: 'default' as const, color: 'text-green-500' },
  rejected: { label: '已拒绝', variant: 'destructive' as const, color: 'text-red-500' }
};

export function PRDListTable({
  prds = [],
  hiddenColumns = [],
  onViewPRD,
  onProjectChange,
  onPlatformChange,
  onReviewer1Change,
  onReviewer2Change,
  onReviewer1StatusChange,
  onReviewer2StatusChange,
  mockUsers = [],
  mockProjects = [],
  platforms = []
}: PRDListTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {!hiddenColumns.includes('title') && <TableHead>PRD标题</TableHead>}
            {!hiddenColumns.includes('version') && <TableHead>版本</TableHead>}
            {!hiddenColumns.includes('project') && <TableHead>所属项目</TableHead>}
            {!hiddenColumns.includes('platform') && <TableHead>应用端</TableHead>}
            {!hiddenColumns.includes('reviewStatus') && <TableHead>评审状态</TableHead>}
            {!hiddenColumns.includes('reviewer1') && <TableHead>一级评审</TableHead>}
            {!hiddenColumns.includes('reviewer2') && <TableHead>二级评审</TableHead>}
            {!hiddenColumns.includes('creator') && <TableHead>创建人</TableHead>}
            {!hiddenColumns.includes('updatedAt') && <TableHead>更新时间</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {prds.map((prd) => (
            <TableRow key={prd.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewPRD(prd)}>
              {!hiddenColumns.includes('title') && (
                <TableCell>
                  <div className="font-medium text-primary hover:underline">
                    {prd.title}
                  </div>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('version') && (
                <TableCell>
                  <Badge variant="outline">{prd.version}</Badge>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('project') && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        style={{ backgroundColor: prd.project.color + '20', color: prd.project.color }}
                      >
                        {prd.project.name}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {mockProjects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onClick={() => onProjectChange(prd.id, project.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}

              {!hiddenColumns.includes('platform') && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
                        {prd.platform || '未指定'}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {platforms.map((platform) => (
                        <DropdownMenuItem 
                          key={platform} 
                          onClick={() => onPlatformChange(prd.id, platform)}
                        >
                          {platform}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('reviewStatus') && (
                <TableCell>
                  <Badge variant={statusLabels[prd.status]?.variant || 'secondary'}>
                    {statusLabels[prd.status]?.label || prd.status}
                  </Badge>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('reviewer1') && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-1">
                    {/* 一级评审人员 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                          {prd.reviewer1 ? prd.reviewer1.name : '未指定'}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onReviewer1Change(prd.id, null)}>
                          未指定
                        </DropdownMenuItem>
                        {mockUsers.map((user) => (
                          <DropdownMenuItem
                            key={user.id}
                            onClick={() => onReviewer1Change(prd.id, user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {user.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              {user.name}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* 一级评审状态 */}
                    {prd.reviewer1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge 
                            variant={reviewerStatusLabels[prd.reviewer1Status || 'pending'].variant}
                            className="cursor-pointer hover:bg-accent text-xs"
                          >
                            {reviewerStatusLabels[prd.reviewer1Status || 'pending'].label}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => onReviewer1StatusChange(prd.id, 'pending')}
                          >
                            <Clock className="h-3 w-3 mr-2" />
                            待评审
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReviewer1StatusChange(prd.id, 'approved')}
                          >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            已通过
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReviewer1StatusChange(prd.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-2" />
                            已拒绝
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('reviewer2') && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-1">
                    {/* 二级评审人员 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                          {prd.reviewer2 ? prd.reviewer2.name : '未指定'}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onReviewer2Change(prd.id, null)}>
                          未指定
                        </DropdownMenuItem>
                        {mockUsers.map((user) => (
                          <DropdownMenuItem
                            key={user.id}
                            onClick={() => onReviewer2Change(prd.id, user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {user.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              {user.name}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* 二级评审状态 */}
                    {prd.reviewer2 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge 
                            variant={reviewerStatusLabels[prd.reviewer2Status || 'pending'].variant}
                            className="cursor-pointer hover:bg-accent text-xs"
                          >
                            {reviewerStatusLabels[prd.reviewer2Status || 'pending'].label}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => onReviewer2StatusChange(prd.id, 'pending')}
                          >
                            <Clock className="h-3 w-3 mr-2" />
                            待评审
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReviewer2StatusChange(prd.id, 'approved')}
                          >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            已通过
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReviewer2StatusChange(prd.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-2" />
                            已拒绝
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('creator') && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={prd.creator.avatar} />
                      <AvatarFallback className="text-xs">
                        {prd.creator.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    {prd.creator.name}
                  </div>
                </TableCell>
              )}
              
              {!hiddenColumns.includes('updatedAt') && (
                <TableCell className="text-muted-foreground text-sm">
                  {prd.updatedAt}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}