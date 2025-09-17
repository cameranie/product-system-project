'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SimpleEmailPasswordLoginProps {
  className?: string
  onLogin?: (email: string, password: string) => void
}

export function SimpleEmailPasswordLogin({ 
  className,
  onLogin 
}: SimpleEmailPasswordLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (onLogin) {
        await onLogin(email, password)
      } else {
        // Default behavior - just log the credentials
        console.log("Login attempt:", { email, password })
      }
    } catch (error) {
      console.error("Login error:", error)
      // 错误处理已在父组件中处理，这里只需要重新抛出
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <div className="space-y-2 text-left">
        <h1 className="text-2xl font-meidum">登录</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-left">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入您的邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-left">密码</Label>
          <Input
            id="password"
            type="password"
            placeholder="请输入您的密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="text-left"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-black hover:bg-gray-800 text-white" 
          disabled={isLoading || !email || !password}
        >
          {isLoading ? "登录中..." : "登录"}
        </Button>
        
        <div className="text-left">
          <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground">
            忘记密码？<span className="font-medium text-foreground">重置密码</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
