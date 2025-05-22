"use client"

import type React from "react"

interface FormStepProps {
  number: number
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function FormStep({ number, title, subtitle, children }: FormStepProps) {
  return (
    <div className="bg-card rounded-lg border border-primary/20 shadow-sm p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white flex items-center justify-center font-medium shadow-lg">
          {number}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="ml-14">{children}</div>
    </div>
  )
}
