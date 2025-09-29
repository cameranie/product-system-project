import React from 'react';
import { 
  History, 
  Plus, 
  Edit, 
  Users, 
  Tag, 
  Flag, 
  FileText,
  CheckCircle,
  Clock
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
      return <Plus className="h-3 w-3 text-green-500" />;
    case 'updated':
      return <Edit className="h-3 w-3 text-blue-500" />;
    case 'status_changed':
      return <CheckCircle className="h-3 w-3 text-orange-500" />;
    case 'priority_changed':
      return <Flag className="h-3 w-3 text-red-500" />;
    case 'assignee_changed':
    case 'reviewer_changed':
      return <Users className="h-3 w-3 text-purple-500" />;
    case 'tag_added':
    case 'tag_removed':
      return <Tag className="h-3 w-3 text-cyan-500" />;
    case 'attachment_added':
      return <FileText className="h-3 w-3 text-indigo-500" />;
    default:
      return <Clock className="h-3 w-3 text-gray-500" />;
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

export function RequirementHistoryCompact({ requirementId }: RequirementHistoryProps) {
  // 按时间倒序排列
  const sortedHistory = [...mockHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          修改记录
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="space-y-2">
            {sortedHistory.map((record) => (
              <div key={record.id} className="flex items-center gap-3 text-sm py-1">
                {/* 图标 */}
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                  {getActionIcon(record.type)}
                </div>

                {/* 用户头像 */}
                <Avatar className="h-5 w-5">
                  <AvatarImage src={record.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {record.user.name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* 用户名 */}
                <span className="font-medium text-sm min-w-0 flex-shrink-0">{record.user.name}</span>

                {/* 操作描述 */}
                <span className="text-muted-foreground flex-1 min-w-0">{record.action}</span>

                {/* 值变更 */}
                {record.oldValue && record.newValue && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      {record.oldValue}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      {record.newValue}
                    </Badge>
                  </div>
                )}
                
                {/* 只有新值的情况 */}
                {!record.oldValue && record.newValue && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-5 flex-shrink-0">
                    {record.newValue}
                  </Badge>
                )}

                {/* 时间 */}
                <div className="text-xs text-muted-foreground flex-shrink-0 min-w-[60px] text-right">
                  {formatDateTime(record.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <div className="text-sm">暂无历史记录</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}