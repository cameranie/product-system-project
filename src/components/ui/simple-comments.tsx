'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, User } from 'lucide-react';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  createdAt: string;
}

interface SimpleCommentsProps {
  comments?: Comment[];
  onAddComment?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleComments({ 
  comments = [], 
  onAddComment,
  placeholder = "添加评论...",
  className = ""
}: SimpleCommentsProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className={`border border-border shadow-none ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-normal">
          <MessageSquare className="h-4 w-4" />
          评论 {comments.length > 0 && `(${comments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 现有评论 */}
        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  {comment.author.avatar ? (
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    {comment.author.role && (
                      <span className="text-xs text-muted-foreground">
                        {comment.author.role}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加评论 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">添加评论</label>
          <div className="space-y-3">
            <Textarea
              placeholder={placeholder}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                按 Ctrl+Enter 快速发送
              </p>
              <Button 
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                size="sm"
              >
                <Send className="h-3 w-3 mr-1" />
                发送
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
