'use client';

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Image as ImageIcon,
  Quote,
  Table as TableIcon,
  Video as VideoIcon,
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { Paperclip, X, FileText, Image as ImageFileIcon, File } from 'lucide-react';
import type { Attachment } from '@/lib/requirements-store';

// TypeScript 类型扩展
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

// 自定义视频扩展
const Video = Node.create({
  name: 'video',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: true }), ['source', mergeAttributes({ src: HTMLAttributes.src })]];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          }) as boolean;
        },
    } as any;
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  compact?: boolean; // 紧凑模式，用于评论等场景
  // 附件相关
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  showAttachments?: boolean; // 是否显示附件区域
}

/**
 * 富文本编辑器组件
 * 基于 Tiptap 实现，提供丰富的文本格式化功能
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  className = '',
  readOnly = false,
  compact = false,
  attachments = [],
  onAttachmentsChange,
  showAttachments = false,
}: RichTextEditorProps) {
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // 禁用代码块
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer hover:opacity-80',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg cursor-pointer',
          style: 'max-width: 100%; height: auto; min-width: 300px;',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'table-auto border-collapse w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-200 dark:border-gray-600 px-3 py-2 bg-muted font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-200 dark:border-gray-600 px-3 py-2',
        },
      }),
      Video,
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
      // 处理粘贴
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        // 处理粘贴的图片
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            event.preventDefault();
            const file = items[i].getAsFile();
            if (file) {
              handleImageUpload(file);
            }
            return true;
          }
        }
        return false;
      },
      // 处理拖放
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        event.preventDefault();
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file);
          } else if (file.type.startsWith('video/')) {
            handleVideoUpload(file);
          }
        }
        return true;
      },
    },
  });

  // 当外部 value 变化时同步更新编辑器内容
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // 处理图片上传
  const handleImageUpload = useCallback((file: File) => {
    if (!editor) return;

    // 验证文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('只能上传图片文件');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  // 处理从文件选择器选择图片
  const handleImageSelect = useCallback(() => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  // 处理视频上传
  const handleVideoUpload = useCallback((file: File) => {
    if (!editor) return;

    // 验证文件大小（限制为 50MB）
    if (file.size > 50 * 1024 * 1024) {
      toast.error('视频大小不能超过 50MB');
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      toast.error('只能上传视频文件');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (url) {
        editor.chain().focus().setVideo({ src: url }).run();
        toast.success('视频已插入');
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  // 处理从文件选择器选择视频
  const handleVideoSelect = useCallback(() => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleVideoUpload(file);
      }
    };
    input.click();
  }, [editor, handleVideoUpload]);

  // 处理插入链接
  const handleSetLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('输入链接地址:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // 打开表格插入对话框
  const handleOpenTableDialog = useCallback(() => {
    setShowTableDialog(true);
  }, []);

  // 处理插入表格
  const handleInsertTable = useCallback(() => {
    if (!editor) return;
    
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    
    if (rows < 1 || rows > 20) {
      toast.error('行数必须在 1-20 之间');
      return;
    }
    
    if (cols < 1 || cols > 10) {
      toast.error('列数必须在 1-10 之间');
      return;
    }
    
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableDialog(false);
    toast.success(`已插入 ${rows}×${cols} 表格`);
  }, [editor, tableRows, tableCols]);

  // 处理附件上传
  const handleAttachmentUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onAttachmentsChange) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    // 验证文件大小
    const invalidFiles = files.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error(`文件大小不能超过 100MB，请重新选择`);
      return;
    }
    
    try {
      const { FileURLManager, generateSecureId } = await import('@/lib/file-upload-utils');
      
      const newAttachments: Attachment[] = files.map(file => ({
        id: generateSecureId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: FileURLManager.createObjectURL(file)
      }));
      
      onAttachmentsChange([...attachments, ...newAttachments]);
      toast.success(`已添加 ${files.length} 个附件`);
      
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('附件上传失败:', error);
      toast.error('附件上传失败，请重试');
    }
  }, [attachments, onAttachmentsChange]);

  // 移除附件
  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    if (!onAttachmentsChange) return;
    const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
    onAttachmentsChange(updatedAttachments);
    toast.success('附件已移除');
  }, [attachments, onAttachmentsChange]);

  // 获取文件图标
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageFileIcon className="h-4 w-4 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  if (!editor) {
    return null;
  }

  const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-primary/15 text-primary hover:bg-primary/20'
      )}
      title={title}
    >
      {children}
    </Button>
  );

  const Divider = () => <div className="w-px h-8 bg-border mx-1" />;

  return (
    <div className={cn('rich-text-editor', !readOnly && 'border rounded-md', className)}>
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
          {/* 撤销/重做 */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销 (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>

          <Divider />

          {/* 标题 */}
          {!compact && (
            <>
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="标题 1"
              >
                <Heading1 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="标题 2"
              >
                <Heading2 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="标题 3"
              >
                <Heading3 className="h-4 w-4" />
              </MenuButton>
              <Divider />
            </>
          )}

          {/* 文本样式 */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="粗体 (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体 (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="删除线"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>

          <Divider />

          {/* 列表 */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="无序列表"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="有序列表"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>

          <Divider />

          {/* 对齐 */}
          {!compact && (
            <>
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="左对齐"
              >
                <AlignLeft className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="居中对齐"
              >
                <AlignCenter className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="右对齐"
              >
                <AlignRight className="h-4 w-4" />
              </MenuButton>
              <Divider />
            </>
          )}

          {/* 链接、图片、引用、代码块 */}
          <MenuButton
            onClick={handleSetLink}
            isActive={editor.isActive('link')}
            title="插入链接"
          >
            <Link2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={handleImageSelect}
            title="插入图片（支持粘贴和拖拽）"
          >
            <ImageIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={handleVideoSelect}
            title="插入视频（支持拖拽）"
          >
            <VideoIcon className="h-4 w-4" />
          </MenuButton>
          {!compact && (
            <>
              <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="引用"
              >
                <Quote className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={handleOpenTableDialog}
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </MenuButton>
            </>
          )}
        </div>
      )}

      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none focus:outline-none overflow-x-auto',
          !readOnly && !compact && 'p-4 min-h-[200px]',
          !readOnly && compact && 'p-3 min-h-[100px]',
          readOnly && 'p-0 min-h-0'
        )}
      />

      {/* 附件区域 */}
      {showAttachments && attachments.length > 0 && (
        <div className={cn(
          'border-t bg-muted/30 p-3',
          readOnly && 'border-t-0 p-0 pt-2'
        )}>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 bg-background rounded-md border',
                  'hover:bg-accent transition-colors'
                )}
              >
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    className="text-sm font-medium text-primary hover:underline truncate block"
                    title={attachment.name}
                  >
                    {attachment.name}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {(attachment.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {!readOnly && onAttachmentsChange && (
                  <button
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="移除附件"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 附件上传按钮（底部） */}
      {showAttachments && !readOnly && onAttachmentsChange && (
        <div className="border-t p-2 bg-muted/10">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleAttachmentUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            添加附件
          </Button>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: hsl(var(--muted-foreground));
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror p {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          opacity: 0.8;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror s {
          text-decoration: line-through;
        }

        .ProseMirror code {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        /* 引用样式 */
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          background-color: #f0f9ff;
          padding: 1rem 1rem 1rem 1.5rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: #1e40af;
          position: relative;
        }
        
        .ProseMirror blockquote::before {
          content: '"';
          font-size: 3rem;
          line-height: 1;
          position: absolute;
          left: 0.5rem;
          top: 0.5rem;
          color: #93c5fd;
          font-family: Georgia, serif;
        }
        
        .dark .ProseMirror blockquote {
          background-color: #1e3a5f;
          border-left-color: #60a5fa;
          color: #bfdbfe;
        }
        
        .dark .ProseMirror blockquote::before {
          color: #3b82f6;
        }


        /* 表格容器 */
        .ProseMirror .tableWrapper {
          overflow-x: auto;
          max-width: 100%;
          margin: 1rem 0;
        }

        /* 表格样式 */
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: auto;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .ProseMirror table td,
        .ProseMirror table th {
          min-width: 50px;
          max-width: 300px;
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .ProseMirror table th {
          font-weight: 600;
          text-align: left;
          background-color: hsl(var(--muted));
        }
        
        .dark .ProseMirror table {
          border-color: #475569;
        }
        
        .dark .ProseMirror table td,
        .dark .ProseMirror table th {
          border-color: #475569;
        }

        .ProseMirror table .selectedCell {
          background: hsl(var(--accent));
        }

        .ProseMirror table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: hsl(var(--primary));
          pointer-events: none;
        }

        /* 图片样式 */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          min-width: 300px;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .ProseMirror img:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }

        /* 视频样式 */
        .ProseMirror video {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
          background-color: #000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .ProseMirror video:focus {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }

        /* 只读模式样式 */
        .rich-text-editor .ProseMirror[contenteditable="false"] {
          cursor: default;
        }
        
        .rich-text-editor .ProseMirror[contenteditable="false"] p:first-child {
          margin-top: 0;
        }
        
        .rich-text-editor .ProseMirror[contenteditable="false"] p:last-child {
          margin-bottom: 0;
        }

        /* 深色模式支持 */
        .dark .ProseMirror {
          color: hsl(var(--foreground));
        }

        .dark .ProseMirror code {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .dark .ProseMirror pre {
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
        }
      `}</style>

      {/* 表格插入对话框 */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>插入表格</DialogTitle>
            <DialogDescription>
              设置表格的行数和列数（表格会自动包含表头行）
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-rows" className="text-right">
                行数
              </Label>
              <Input
                id="table-rows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(e.target.value)}
                className="col-span-3"
                placeholder="3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-cols" className="text-right">
                列数
              </Label>
              <Input
                id="table-cols"
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(e.target.value)}
                className="col-span-3"
                placeholder="3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTableDialog(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={handleInsertTable}>
              插入表格
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * 从富文本内容中提取纯文本
 * 用于验证和预览
 */
export function getPlainTextFromHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}
