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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
          {number}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
