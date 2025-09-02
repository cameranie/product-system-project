"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Image,
  Code
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "开始编写...",
  className,
  minHeight = "200px",
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [showToolbar, setShowToolbar] = React.useState(false)

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: '粗体' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: '斜体' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), tooltip: '下划线' },
    { icon: Link, action: () => insertText('[', '](url)'), tooltip: '链接' },
    { icon: List, action: () => insertText('- '), tooltip: '无序列表' },
    { icon: ListOrdered, action: () => insertText('1. '), tooltip: '有序列表' },
    { icon: Quote, action: () => insertText('> '), tooltip: '引用' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: '代码' },
    { icon: Image, action: () => insertText('![', '](image-url)'), tooltip: '图片' },
  ]

  return (
    <div className={cn("border border-input rounded-md", className)}>
      {/* 浮动工具栏 */}
      {showToolbar && (
        <div className="border-b border-border p-2 flex items-center gap-1 flex-wrap">
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
          </TooltipProvider>
        </div>
      )}
      
      {/* 文本区域 */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{ minHeight }}
        onFocus={() => setShowToolbar(true)}
        onBlur={(e) => {
          // 只有当焦点不在工具栏按钮上时才隐藏工具栏
          const relatedTarget = e.relatedTarget as HTMLElement
          if (!relatedTarget || !relatedTarget.closest('[data-toolbar]')) {
            setTimeout(() => setShowToolbar(false), 150)
          }
        }}
      />
      
      {/* 提示文本 */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
        支持 Markdown 格式 • 点击输入框显示格式工具栏 • 可插入图片和链接
      </div>
    </div>
  )
}

