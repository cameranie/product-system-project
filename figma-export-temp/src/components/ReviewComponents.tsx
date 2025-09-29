import React from 'react';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface ReviewItem {
  reviewer1?: User;
  reviewer2?: User;
  reviewer1Status?: 'pending' | 'approved' | 'rejected';
  reviewer2Status?: 'pending' | 'approved' | 'rejected';
}

// 根据一级和二级评审状态计算总评审状态
export const getReviewStatus = (item: ReviewItem): string => {
  const { reviewer1Status, reviewer2Status, reviewer1, reviewer2 } = item;
  
  // 如果一级评审未通过，直接返回评审不通过
  if (reviewer1Status === 'rejected') {
    return '评审不通过';
  }
  
  // 如果只有一级评审人员
  if (reviewer1 && !reviewer2) {
    if (reviewer1Status === 'approved') return '评审通过';
    if (reviewer1Status === 'pending') return '一级评审中';
    return '待评审';
  }
  
  // 如果有两级评审人员
  if (reviewer1 && reviewer2) {
    if (reviewer1Status === 'approved' && reviewer2Status === 'approved') {
      return '评审通过';
    }
    if (reviewer1Status === 'approved' && reviewer2Status === 'pending') {
      return '二级评审中';
    }
    if (reviewer1Status === 'pending') {
      return '一级评审中';
    }
    if (reviewer2Status === 'rejected') {
      return '评审不通过';
    }
  }
  
  return '待评审';
};

// 获取总评审状态的样式
export const getReviewStatusStyle = (status: string) => {
  switch (status) {
    case '评审通过':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80';
    case '评审不通过':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80';
    case '一级评审中':
    case '二级评审中':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80';
  }
};

// 总评审状态组件
interface ReviewStatusBadgeProps {
  item: ReviewItem;
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({ item }) => {
  const status = getReviewStatus(item);
  return (
    <Badge className={getReviewStatusStyle(status)}>
      {status}
    </Badge>
  );
};

// 一级评审组件
interface Reviewer1ComponentProps {
  item: ReviewItem;
  onStatusChange: (status: 'pending' | 'approved' | 'rejected') => void;
}

export const Reviewer1Component: React.FC<Reviewer1ComponentProps> = ({ item, onStatusChange }) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {item.reviewer1 ? (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            {item.reviewer1.name}
          </div>
          <Select
            value={item.reviewer1Status || 'pending'}
            onValueChange={onStatusChange}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待评审</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">未分配</span>
      )}
    </div>
  );
};

// 二级评审组件
interface Reviewer2ComponentProps {
  item: ReviewItem;
  onStatusChange: (status: 'pending' | 'approved' | 'rejected') => void;
}

export const Reviewer2Component: React.FC<Reviewer2ComponentProps> = ({ item, onStatusChange }) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {item.reviewer2 ? (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            {item.reviewer2.name}
          </div>
          <Select
            value={item.reviewer2Status || 'pending'}
            onValueChange={onStatusChange}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待评审</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">未分配</span>
      )}
    </div>
  );
};