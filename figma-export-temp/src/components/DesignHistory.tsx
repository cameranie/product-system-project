import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  History,
  Clock,
  FileText,
  Edit,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Upload,
  Download,
  Share,
  Star,
  Flag,
  Tag,
  User,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface HistoryRecord {
  id: string;
  type: 'create' | 'edit' | 'comment' | 'review' | 'share' | 'status_change' | 'attachment';
  title: string;
  description: string;
  user: User;
  timestamp: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    fileUrl?: string;
    fileName?: string;
    reviewStatus?: 'approved' | 'rejected' | 'pending';
    commentCount?: number;
  };
}

interface DesignHistoryProps {
  designId: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'create':
      return Plus;
    case 'edit':
      return Edit;
    case 'comment':
      return MessageSquare;
    case 'review':
      return CheckCircle;
    case 'share':
      return Share;
    case 'status_change':
      return Flag;
    case 'attachment':
      return Upload;
    default:
      return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'create':
      return 'text-green-500';
    case 'edit':
      return 'text-blue-500';
    case 'comment':
      return 'text-purple-500';
    case 'review':
      return 'text-orange-500';
    case 'share':
      return 'text-cyan-500';
    case 'status_change':
      return 'text-red-500';
    case 'attachment':
      return 'text-gray-500';
    default:
      return 'text-muted-foreground';
  }
};

const mockHistory: HistoryRecord[] = [
  {
    id: '1',
    type: 'create',
    title: '创建设计稿',
    description: '创建了"用户中心UI设计稿 v2.0"',
    user: { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
    timestamp: '2024-12-10 14:30'
  },
  {
    id: '2',
    type: 'edit',
    title: '修改设计稿',
    description: '更新了设计标题和描述信息',
    user: { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
    timestamp: '2024-12-11 09:15',
    metadata: {
      oldValue: '用户中心设计稿',
      newValue: '用户中心UI设计稿 v2.0'
    }
  },
  {
    id: '3',
    type: 'attachment',
    title: '上传附件',
    description: '上传了设计规范文档',
    user: { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
    timestamp: '2024-12-12 10:22',
    metadata: {
      fileName: '设计规范.pdf',
      fileUrl: '/files/design-spec.pdf'
    }
  },
  {
    id: '4',
    type: 'comment',
    title: '添加评论',
    description: '在设计稿中添加了评审意见',
    user: { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
    timestamp: '2024-12-13 15:45',
    metadata: {
      commentCount: 3
    }
  },
  {
    id: '5',
    type: 'review',
    title: '一级评审完成',
    description: '通过了一级评审',
    user: { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
    timestamp: '2024-12-14 11:30',
    metadata: {
      reviewStatus: 'approved'
    }
  },
  {
    id: '6',
    type: 'edit',
    title: '修改设计稿',
    description: '根据评审意见调整了页面布局',
    user: { id: '3', name: '王五', avatar: '', role: 'UI设计师' },
    timestamp: '2024-12-14 16:20'
  },
  {
    id: '7',
    type: 'review',
    title: '二级评审完成',
    description: '通过了二级评审',
    user: { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
    timestamp: '2024-12-15 14:15',
    metadata: {
      reviewStatus: 'approved'
    }
  },
  {
    id: '8',
    type: 'status_change',
    title: '状态更新',
    description: '设计稿状态更改为"评审通过"',
    user: { id: '4', name: '赵六', avatar: '', role: '技术负责人' },
    timestamp: '2024-12-15 14:16',
    metadata: {
      oldValue: '评审中',
      newValue: '评审通过'
    }
  },
  {
    id: '9',
    type: 'share',
    title: '分享设计稿',
    description: '将设计稿分享给开发团队',
    user: { id: '6', name: '产品经理', avatar: '', role: '产品经理' },
    timestamp: '2024-12-16 09:30'
  }
];

export function DesignHistory({ designId }: DesignHistoryProps) {
  const [history] = useState<HistoryRecord[]>(mockHistory);





  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          修改记录
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((record) => {
              const ActivityIcon = getActivityIcon(record.type);
              const iconColor = getActivityColor(record.type);
              
              return (
                <div key={record.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {/* 活动图标 */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${iconColor}`}>
                    <ActivityIcon className="h-3 w-3" />
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
                      <span className="text-muted-foreground ml-1">{record.description}</span>
                    </span>
                  </div>
                  
                  {/* 时间 */}
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {record.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}