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
  User,
  Upload,
  GitBranch,
  Send
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

interface HistoryRecord {
  id: string;
  type: 'created' | 'updated' | 'status_changed' | 'priority_changed' | 'assignee_changed' | 'reviewer_changed' | 'tag_added' | 'tag_removed' | 'attachment_added' | 'version_updated' | 'submitted' | 'published' | 'review_approved' | 'review_rejected';
  action: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  timestamp: string;
}

interface PRDHistoryProps {
  prdId: string;
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
    action: '创建了PRD',
    user: mockUsers[0],
    timestamp: '2024-01-15 09:15'
  },
  {
    id: '2',
    type: 'updated',
    action: '更新了PRD内容',
    details: '添加了详细的功能说明和技术实现方案',
    user: mockUsers[0],
    timestamp: '2024-01-15 10:30'
  },
  {
    id: '3',
    type: 'version_updated',
    action: '更新版本号',
    oldValue: 'v1.0',
    newValue: 'v2.1',
    user: mockUsers[0],
    timestamp: '2024-01-16 11:15'
  },
  {
    id: '4',
    type: 'reviewer_changed',
    action: '设置了一级评审人',
    newValue: '王五',
    user: mockUsers[1],
    timestamp: '2024-01-16 14:20'
  },
  {
    id: '5',
    type: 'reviewer_changed',
    action: '设置了二级评审人',
    newValue: '赵六',
    user: mockUsers[1],
    timestamp: '2024-01-16 14:22'
  },
  {
    id: '6',
    type: 'tag_added',
    action: '添加了标签',
    newValue: '用户体验',
    user: mockUsers[0],
    timestamp: '2024-01-17 09:30'
  },
  {
    id: '7',
    type: 'tag_added',
    action: '添加了标签',
    newValue: 'UI优化',
    user: mockUsers[0],
    timestamp: '2024-01-17 09:31'
  },
  {
    id: '8',
    type: 'attachment_added',
    action: '上传了附件',
    newValue: '用户流程图.png',
    user: mockUsers[0],
    timestamp: '2024-01-18 14:45'
  },
  {
    id: '9',
    type: 'submitted',
    action: '提交了PRD进行评审',
    details: '已通知一级评审人王五',
    user: mockUsers[0],
    timestamp: '2024-01-19 10:15'
  },
  {
    id: '10',
    type: 'review_approved',
    action: '一级评审通过',
    details: '功能逻辑清晰，技术方案可行',
    user: mockUsers[2],
    timestamp: '2024-01-19 16:30'
  },
  {
    id: '11',
    type: 'review_approved',
    action: '二级评审通过',
    details: 'UI设计符合规范，可以开始开发',
    user: mockUsers[3],
    timestamp: '2024-01-20 11:45'
  },
  {
    id: '12',
    type: 'published',
    action: '发布了PRD',
    details: '评审流程完成，正式发布',
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
      return <Upload className="h-4 w-4 text-indigo-500" />;
    case 'version_updated':
      return <GitBranch className="h-4 w-4 text-pink-500" />;
    case 'submitted':
      return <Send className="h-4 w-4 text-yellow-500" />;
    case 'published':
      return <FileText className="h-4 w-4 text-emerald-500" />;
    case 'review_approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'review_rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
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

export function PRDHistory({ prdId }: PRDHistoryProps) {
  // 按时间倒序排列
  const sortedHistory = [...mockHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          修改记录
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="space-y-2">
            {sortedHistory.map((record) => (
              <div key={record.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                {/* 活动图标 */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                  {getActionIcon(record.type)}
                </div>
                
                {/* 操作者头像 */}
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={record.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {record.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* 活动内容 */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm">
                    <span className="font-medium">{record.user.name}</span>
                    <span className="text-muted-foreground ml-1">{record.action}</span>
                    {record.oldValue && record.newValue && (
                      <span className="ml-1">
                        <Badge variant="outline" className="text-xs mx-1">
                          {record.oldValue}
                        </Badge>
                        →
                        <Badge variant="outline" className="text-xs mx-1">
                          {record.newValue}
                        </Badge>
                      </span>
                    )}
                    {!record.oldValue && record.newValue && (
                      <Badge variant="outline" className="text-xs ml-1">
                        {record.newValue}
                      </Badge>
                    )}
                  </span>
                </div>
                
                {/* 时间 */}
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {record.timestamp}
                </span>
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