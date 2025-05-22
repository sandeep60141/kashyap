"use client"

import type React from "react"

import { useEffect, useState } from "react"

// Hook to detect mobile devices
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Component to optimize layout for mobile
interface MobileOptimizedContainerProps {
  children: React.ReactNode
  className?: string
}

export function MobileOptimizedContainer({ children, className = "" }: MobileOptimizedContainerProps) {
  const isMobile = useMobileDetection()

  return <div className={`${isMobile ? "px-2 py-4" : "px-6 py-8"} ${className}`}>{children}</div>
}

// Component for responsive grid layouts
interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    sm?: number
    md?: number
    lg?: number
  }
  gap?: string
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = "gap-4",
  className = "",
}: ResponsiveGridProps) {
  return (
    <div
      className={`grid grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} ${gap} ${className}`}
    >
      {children}
    </div>
  )
}
