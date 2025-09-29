import React from 'react';
import { 
  History, 
  Plus, 
  Edit, 
  Users, 
  Tag, 
  Flag, 
  Monitor,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Upload,
  GitBranch,
  Send,
  Smartphone,
  Tablet,
  FileText,
  Eye,
  Link,
  Palette
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
  type: 'created' | 'updated' | 'status_changed' | 'priority_changed' | 'tool_changed' | 'reviewer_changed' | 'tag_added' | 'tag_removed' | 'device_changed' | 'url_updated' | 'submitted' | 'published' | 'review_approved' | 'review_rejected' | 'requirement_linked' | 'requirement_unlinked';
  action: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  timestamp: string;
}

interface PrototypeHistoryProps {
  prototypeId: string;
}

const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: '/avatars/zhangsan.jpg', email: 'zhangsan@example.com' },
  { id: '2', name: '李四', avatar: '/avatars/lisi.jpg', email: 'lisi@example.com' },
  { id: '3', name: '王五', avatar: '/avatars/wangwu.jpg', email: 'wangwu@example.com' },
  { id: '4', name: '赵六', avatar: '/avatars/zhaoliu.jpg', email: 'zhaoliu@example.com' },
  { id: '5', name: '孙七', avatar: '/avatars/sunqi.jpg', email: 'sunqi@example.com' },
  { id: '6', name: '产品经理', avatar: '/avatars/pm.jpg', email: 'pm@example.com' }
];

const mockHistory: HistoryRecord[] = [
  {
    id: '1',
    type: 'created',
    action: '创建了原型',
    user: mockUsers[0],
    timestamp: '2024-12-10 14:30'
  },
  {
    id: '2',
    type: 'updated',
    action: '更新了原型描述',
    details: '添加了详细的交互说明和用户流程描述',
    user: mockUsers[0],
    timestamp: '2024-12-10 15:15'
  },
  {
    id: '3',
    type: 'tool_changed',
    action: '更新了设计工具',
    oldValue: 'Sketch',
    newValue: 'Figma',
    user: mockUsers[2],
    timestamp: '2024-12-11 09:30'
  },
  {
    id: '4',
    type: 'device_changed',
    action: '更新了应用端',
    oldValue: 'Mobile',
    newValue: 'Web',
    user: mockUsers[2],
    timestamp: '2024-12-11 10:15'
  },

  {
    id: '6',
    type: 'priority_changed',
    action: '调整了优先级',
    oldValue: '中',
    newValue: '高',
    user: mockUsers[1],
    timestamp: '2024-12-12 14:45'
  },
  {
    id: '7',
    type: 'reviewer_changed',
    action: '设置了一级评审人',
    newValue: '产品经理',
    user: mockUsers[1],
    timestamp: '2024-12-13 09:10'
  },
  {
    id: '8',
    type: 'reviewer_changed',
    action: '设置了二级评审人',
    newValue: '技术负责人',
    user: mockUsers[1],
    timestamp: '2024-12-13 09:12'
  },
  {
    id: '9',
    type: 'tag_added',
    action: '添加了标签',
    newValue: '交互设计',
    user: mockUsers[2],
    timestamp: '2024-12-13 16:30'
  },
  {
    id: '10',
    type: 'tag_added',
    action: '添加了标签',
    newValue: '用户体验',
    user: mockUsers[2],
    timestamp: '2024-12-13 16:31'
  },
  {
    id: '11',
    type: 'tag_added',
    action: '添加了标签',
    newValue: '移动端',
    user: mockUsers[2],
    timestamp: '2024-12-13 16:32'
  },
  {
    id: '12',
    type: 'requirement_linked',
    action: '关联了需求',
    newValue: '用户中心交互原型 v2.0',
    user: mockUsers[0],
    timestamp: '2024-12-14 10:45'
  },
  {
    id: '13',
    type: 'url_updated',
    action: '更新了原型链接',
    details: '更新到最新版本的Figma原型文件',
    user: mockUsers[2],
    timestamp: '2024-12-15 14:20'
  },
  {
    id: '14',
    type: 'submitted',
    action: '提交了原型进行评审',
    details: '已通知一级评审人产品经理',
    user: mockUsers[2],
    timestamp: '2024-12-15 16:30'
  },
  {
    id: '15',
    type: 'review_approved',
    action: '一级评审通过',
    details: '交互流程清晰，用户体验良好',
    user: mockUsers[5],
    timestamp: '2024-12-16 10:15'
  },
  {
    id: '16',
    type: 'review_approved',
    action: '二级评审通过',
    details: '技术实现可行，可以开始开发',
    user: mockUsers[3],
    timestamp: '2024-12-16 14:45'
  },
  {
    id: '17',
    type: 'status_changed',
    action: '状态变更',
    oldValue: '评审中',
    newValue: '评审通过',
    user: mockUsers[0],
    timestamp: '2024-12-16 15:00'
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
    case 'tool_changed':
      return <Palette className="h-4 w-4 text-purple-500" />;
    case 'reviewer_changed':
      return <Users className="h-4 w-4 text-purple-500" />;
    case 'tag_added':
    case 'tag_removed':
      return <Tag className="h-4 w-4 text-cyan-500" />;
    case 'device_changed':
      return <Monitor className="h-4 w-4 text-indigo-500" />;
    case 'url_updated':
      return <Link className="h-4 w-4 text-pink-500" />;
    case 'submitted':
      return <Send className="h-4 w-4 text-yellow-500" />;
    case 'published':
      return <Eye className="h-4 w-4 text-emerald-500" />;
    case 'review_approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'review_rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;

    case 'requirement_linked':
    case 'requirement_unlinked':
      return <FileText className="h-4 w-4 text-teal-500" />;
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

export function PrototypeHistory({ prototypeId }: PrototypeHistoryProps) {
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
          <div className="space-y-2">
            {sortedHistory.map((record) => (
              <div key={record.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-b-0">
                {/* 图标 */}
                <div className="flex-shrink-0">
                  {getActionIcon(record.type)}
                </div>

                {/* 用户头像 */}
                <Avatar className="h-5 w-5 flex-shrink-0">
                  <AvatarImage src={record.user?.avatar} />
                  <AvatarFallback className="text-xs">
                    {record.user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* 内容 */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm font-medium">{record.user?.name || '未知用户'}</span>
                  <span className="text-sm text-muted-foreground">{record.action}</span>
                  
                  {/* 显示变更的值 */}
                  {record.oldValue && record.newValue && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {record.oldValue}
                      </Badge>
                      <span className="text-xs text-muted-foreground">→</span>
                      <Badge variant="outline" className="text-xs">
                        {record.newValue}
                      </Badge>
                    </>
                  )}
                  
                  {/* 只有新值的情况 */}
                  {!record.oldValue && record.newValue && (
                    <Badge variant="outline" className="text-xs">
                      {record.newValue}
                    </Badge>
                  )}

                  {/* 详细说明 */}
                  {record.details && (
                    <span className="text-xs text-muted-foreground">
                      - {record.details}
                    </span>
                  )}
                </div>

                {/* 时间 */}
                <div className="text-xs text-muted-foreground flex-shrink-0">
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