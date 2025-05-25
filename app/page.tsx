"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth/auth-modal"
import { getCurrentUser, setLastPath } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RecipeOfDay } from "@/components/recipe-of-day"
import { RecipeSearch } from "@/components/recipe-search"
import { TrendingSearches } from "@/components/trending-searches"
import { SearchHistory } from "@/components/search-history"

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuthAndHandleRedirect()
  }, [searchParams])

  const checkAuthAndHandleRedirect = async () => {
    try {
      // Check if we have auth params
      const authParam = searchParams.get("auth")
      const redirectParam = searchParams.get("redirect")

      console.log("🔍 Auth params:", { authParam, redirectParam })

      if (redirectParam) {
        setLastPath(redirectParam)
      }

      // Check if user is already authenticated
      const user = await getCurrentUser()
      console.log("👤 Current user:", user?.email || "None")

      if (user && redirectParam) {
        console.log("✅ User authenticated, redirecting to:", redirectParam)
        // Clear URL params and redirect
        window.history.replaceState({}, "", "/")
        router.push(redirectParam)
        return
      }

      // Show auth modal if requested
      if (authParam === "signin" || authParam === "signup") {
        console.log("🔓 Opening auth modal:", authParam)
        setAuthTab(authParam as "signin" | "signup")
        setIsAuthModalOpen(true)
      }
    } catch (error) {
      console.error("❌ Error checking auth:", error)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
    // Clear URL params when modal closes
    window.history.replaceState({}, "", "/")
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <RecipeOfDay />
            <RecipeSearch />
            <TrendingSearches />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SearchHistory />
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} defaultTab={authTab} />
    </div>
  )
}
