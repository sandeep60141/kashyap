"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TooltipHelperProps {
  content: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

export default function TooltipHelper({ content, position = "top", className = "" }: TooltipHelperProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center text-primary/70 hover:text-primary focus:outline-none ${className}`}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={position} className="bg-primary text-white border-primary max-w-xs">
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
