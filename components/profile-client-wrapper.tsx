"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface ProfileClientWrapperProps {
  children: React.ReactNode
}

export function ProfileClientWrapper({ children }: ProfileClientWrapperProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication for profile page...")
      const user = await getCurrentUser()

      if (!user) {
        console.log("❌ No user found, redirecting to home")
        router.push("/")
        return
      }

      console.log("✅ User authenticated for profile page:", user.email)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
