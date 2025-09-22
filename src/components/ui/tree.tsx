"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface TreeNode {
  id: string
  name: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  subtitle?: string
  isExpanded?: boolean
  hasChildren?: boolean
  onToggle?: () => void
  children?: TreeNode[]
  onClick?: () => void
}

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  nodes: TreeNode[]
}

function Tree({ nodes, className, ...props }: TreeProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      {...props}
    >
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} level={0} />
      ))}
    </div>
  )
}

interface TreeItemProps {
  node: TreeNode
  level: number
}

function TreeItem({ node, level }: TreeItemProps) {
  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center py-2 px-3 hover:bg-accent/50 rounded-md cursor-pointer transition-all duration-200",
          node.onClick && "hover:bg-accent/70",
          level === 0 && "font-semibold",
          level > 0 && "ml-2"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (node.hasChildren && node.onToggle) {
            node.onToggle()
          } else if (node.onClick) {
            node.onClick()
          }
        }}
      >
        {node.hasChildren && (
          <div className="mr-2 flex-shrink-0">
            <ChevronDownIcon 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                !node.isExpanded && "-rotate-90"
              )}
            />
          </div>
        )}
        {!node.hasChildren && <div className="w-6 flex-shrink-0" />}
        
        {node.icon && (
          <div className="mr-3 flex-shrink-0">{node.icon}</div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "truncate transition-colors",
              level === 0 ? "text-base font-semibold text-foreground" : "text-sm font-medium text-foreground/90",
              node.onClick && "group-hover:text-primary"
            )}>
              {node.name}
            </span>
            {node.badge}
          </div>
          {node.subtitle && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">{node.subtitle}</div>
          )}
        </div>
      </div>
      
      {node.isExpanded && node.hasChildren && node.children && (
        <div className="ml-1 border-l border-border/40">
          {node.children.map(child => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export { Tree, type TreeNode }
