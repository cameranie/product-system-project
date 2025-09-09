"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
  labelClassName?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  children,
  className,
  labelClassName,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className={cn("text-sm font-medium", labelClassName)}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

interface FormFieldGroupProps {
  children: React.ReactNode
  className?: string
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}


