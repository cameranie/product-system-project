"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Image,
  Type
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "开始编写...",
  className,
  minHeight = "200px",
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        executeCommand('insertImage', imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const toolbarButtons = [
    { 
      icon: Bold, 
      action: () => executeCommand('bold'), 
      tooltip: '粗体',
      command: 'bold'
    },
    { 
      icon: Italic, 
      action: () => executeCommand('italic'), 
      tooltip: '斜体',
      command: 'italic'
    },
    { 
      icon: Underline, 
      action: () => executeCommand('underline'), 
      tooltip: '下划线',
      command: 'underline'
    },
    { 
      icon: List, 
      action: () => executeCommand('insertUnorderedList'), 
      tooltip: '无序列表',
      command: 'insertUnorderedList'
    },
    { 
      icon: ListOrdered, 
      action: () => executeCommand('insertOrderedList'), 
      tooltip: '有序列表',
      command: 'insertOrderedList'
    },
    { 
      icon: Quote, 
      action: () => executeCommand('formatBlock', 'blockquote'), 
      tooltip: '引用',
      command: 'formatBlock'
    },
    { 
      icon: Type, 
      action: () => executeCommand('removeFormat'), 
      tooltip: '清除格式',
      command: 'removeFormat'
    },
  ]

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  return (
    <div className={cn("border border-input rounded-md", className)}>
      {/* 工具栏 */}
      <div className="border-b border-border p-2 flex items-center gap-1 flex-wrap bg-muted/30">
        <TooltipProvider>
          {toolbarButtons.map((button, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={button.action}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{button.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* 图片上传按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>插入图片</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
      
      {/* 编辑区域 */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 focus:outline-none min-h-[200px] prose prose-sm max-w-none"
        style={{ minHeight }}
        onInput={updateContent}
        onBlur={updateContent}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      {/* 提示文本 */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
        支持富文本格式 • 可直接上传图片 • 支持复制粘贴链接
      </div>
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }
        [contenteditable] blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 12px;
          margin: 8px 0;
          color: hsl(var(--muted-foreground));
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 20px;
          margin: 8px 0;
        }
        [contenteditable] li {
          margin: 4px 0;
        }
      `}</style>
    </div>
  )
}
