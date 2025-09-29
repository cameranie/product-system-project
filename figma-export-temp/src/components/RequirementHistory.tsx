import React from 'react';
import { 
  History, 
  Plus, 
  Edit, 
  Users, 
  Tag, 
  Flag, 
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface HistoryRecord {
  id: string;
  type: 'created' | 'updated' | 'status_changed' | 'priority_changed' | 'assignee_changed' | 'reviewer_changed' | 'tag_added' | 'tag_removed' | 'attachment_added';
  action: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  timestamp: string;
}

interface RequirementHistoryProps {
  requirementId: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '/avatars/lisi.jpg', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '/avatars/wangwu.jpg', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '/avatars/zhaoliu.jpg', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '/avatars/sunqi.jpg', email: 'sunqi@example.com' }
];

const mockHistory: HistoryRecord[] = [
  {
    id: '1',
    type: 'created',
    action: '创建了需求',
    user: mockUsers[0],
    timestamp: '2024-01-15 09:15'
  },
  {
    id: '2',
    type: 'updated',
    action: '更新了需求描述',
    details: '添加了详细的功能说明和预期效果',
    user: mockUsers[0],
    timestamp: '2024-01-15 10:30'
  },
  {
    id: '3',
    type: 'reviewer_changed',
    action: '设置了一级评审人',
    newValue: '王五',
    user: mockUsers[1],
    timestamp: '2024-01-16 14:20'
  },
  {
    id: '4',
    type: 'reviewer_changed',
    action: '设置了二级评审人',
    newValue: '赵六',
    user: mockUsers[1],
    timestamp: '2024-01-16 14:22'
  },
  {
    id: '5',
    type: 'priority_changed',
    action: '修改了优先级',
    oldValue: '中',
    newValue: '高',
    user: mockUsers[1],
    timestamp: '2024-01-17 11:45'
  },
  {
    id: '6',
    type: 'tag_added',
    action: '添加了标签',
    newValue: '用户体验',
    user: mockUsers[0],
    timestamp: '2024-01-18 09:30'
  },
  {
    id: '7',
    type: 'tag_added',
    action: '添加了标签',
    newValue: 'UI优化',
    user: mockUsers[0],
    timestamp: '2024-01-18 09:31'
  },
  {
    id: '8',
    type: 'status_changed',
    action: '一级评审状态变更',
    oldValue: '待评审',
    newValue: '已通过',
    user: mockUsers[2],
    timestamp: '2024-01-19 16:15'
  },
  {
    id: '9',
    type: 'attachment_added',
    action: '上传了附件',
    newValue: '需求原型图.pdf',
    user: mockUsers[0],
    timestamp: '2024-01-20 10:45'
  },
  {
    id: '10',
    type: 'updated',
    action: '更新了需求标题',
    oldValue: '用户注册优化',
    newValue: '用户注册流程优化',
    user: mockUsers[0],
    timestamp: '2024-01-20 14:30'
  }
];

function getActionIcon(type: string) {
  switch (type) {
    case 'created':
      return <Plus className="h-4 w-4 text-green-500" />;
    case 'updated':
      return <Edit className="h-4 w-4 text-blue-500" />;
    case 'status_changed':
      return <CheckCircle className="h-4 w-4 text-orange-500" />;
    case 'priority_changed':
      return <Flag className="h-4 w-4 text-red-500" />;
    case 'assignee_changed':
    case 'reviewer_changed':
      return <Users className="h-4 w-4 text-purple-500" />;
    case 'tag_added':
    case 'tag_removed':
      return <Tag className="h-4 w-4 text-cyan-500" />;
    case 'attachment_added':
      return <FileText className="h-4 w-4 text-indigo-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

function formatDateTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return dateTimeStr;
  }
}

export function RequirementHistory({ requirementId }: RequirementHistoryProps) {
  // 按时间倒序排列
  const sortedHistory = [...mockHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          创建/修改记录
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="space-y-4">
            {sortedHistory.map((record, index) => (
              <div key={record.id} className="flex items-start gap-3 pb-4 last:pb-0">
                {/* 时间线左侧图标 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getActionIcon(record.type)}
                  </div>
                  {index < sortedHistory.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>

                {/* 记录内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={record.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {record.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{record.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(record.timestamp)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">{record.action}</span>
                    
                    {/* 显示变更的值 */}
                    {record.oldValue && record.newValue && (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {record.oldValue}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-xs">
                          {record.newValue}
                        </Badge>
                      </div>
                    )}
                    
                    {/* 只有新值的情况 */}
                    {!record.oldValue && record.newValue && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {record.newValue}
                        </Badge>
                      </div>
                    )}

                    {/* 详细说明 */}
                    {record.details && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {record.details}
                      </div>
                    )}
                  </div>
                </div>

                {/* 精确时间 */}
                <div className="text-xs text-muted-foreground">
                  {record.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">暂无历史记录</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}