'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Paperclip, FileText, Image as ImageIcon, File } from 'lucide-react';
import { toast } from 'sonner';
import type { Attachment } from '@/lib/requirements-store';

interface AttachmentsSectionProps {
  attachments: Attachment[];
  onUpload?: (files: File[]) => void;
  onRemove?: (attachmentId: string) => void;
  editable?: boolean;
  maxSize?: number; // MB
  allowedTypes?: string[];
  title?: string;
  showTitle?: boolean;
}

/**
 * 附件上传组件
 * 
 * 功能：
 * - 文件上传
 * - 文件列表展示
 * - 文件删除
 * - 文件类型和大小验证
 * 
 * @example
 * <AttachmentsSection
 *   attachments={mockAttachments}
 *   onUpload={handleUpload}
 *   onRemove={handleRemove}
 *   editable={true}
 * />
 */
export function AttachmentsSection({
  attachments = [],
  onUpload,
  onRemove,
  editable = true,
  maxSize = 10, // 默认10MB
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  title = '附件',
  showTitle = true
}: AttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 获取文件图标
   */
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (type.includes('sheet') || type.includes('excel')) {
      return <FileText className="h-4 w-4 text-green-500" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // 验证文件大小
    const invalidFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(`文件 ${invalidFiles[0].name} 超过最大限制 ${maxSize}MB`);
      return;
    }

    try {
      // 调用上传回调
      onUpload?.(files);
      
      // 清空input值，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败，请重试');
    }
  };

  /**
   * 处理文件删除
   */
  const handleRemove = (attachmentId: string) => {
    onRemove?.(attachmentId);
    toast.success('附件已删除');
  };

  const content = (
    <>
      {/* 附件列表 */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                    className="h-8"
                  >
                    查看
                  </Button>
                )}
                {editable && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(file.id)}
                    className="h-8 w-8 p-0 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮 */}
      {editable && (
        <div className={attachments.length > 0 ? 'mt-4' : ''}>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            上传附件
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            支持上传最大 {maxSize}MB 的文件
          </p>
        </div>
      )}

      {/* 空状态 */}
      {attachments.length === 0 && !editable && (
        <div className="text-center py-8 text-muted-foreground">
          <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无附件</p>
        </div>
      )}
    </>
  );

  if (!showTitle) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
} 