'use client'

import Image from "next/image"
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal"
import { SimpleEmailPasswordLogin } from "@/components/ui/simple-email-password-login"

interface HomepageProps {
  onLogin?: (email: string, password: string) => void
}

export function Homepage({ onLogin }: HomepageProps) {
  const handleLogin = (email: string, password: string) => {
    if (onLogin) {
      onLogin(email, password)
    } else {
      // Default behavior - redirect to dashboard
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 左侧 - 动画文本区域 (在小屏幕上隐藏) */}
      <div className="hidden lg:flex lg:w-1/2 lg:min-h-screen flex-col items-center justify-center font-bold p-6 sm:p-10 md:p-16 lg:p-24 text-black tracking-wide uppercase">
        <div className="text-center space-y-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.025}
            staggerFrom="first"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 21,
            }}
          >
            {`HI 👋, FRIEND!`}
          </VerticalCutReveal>
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.025}
            staggerFrom="last"
            reverse={true}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 21,
              delay: 0.5,
            }}
          >
            {`🌤️ IT IS NICE ⇗ TO`}
          </VerticalCutReveal>
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.025}
            staggerFrom="center"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 21,
              delay: 1.1,
            }}
          >
            {`MEET 😊 YOU.`}
          </VerticalCutReveal>
        </div>
      </div>
      
      {/* 右侧 - 登录表单区域 */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/Brand Logo.png" 
              alt="AiCoin Logo" 
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          
          <SimpleEmailPasswordLogin onLogin={handleLogin} />
        </div>
      </div>
    </div>
  )
}
