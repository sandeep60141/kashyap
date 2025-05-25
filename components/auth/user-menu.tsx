"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Settings, Crown, LogOut, ChefHat, MessageSquare, CreditCard, Loader2 } from "lucide-react"
import { getCurrentUser, getUserProfile, signOut, type Profile } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      console.log("🔍 Loading user data for header menu...")
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        console.log("❌ No user found in header")
        setIsLoading(false)
        return
      }

      console.log("✅ User found in header:", currentUser.email)
      setUser(currentUser)

      const userProfile = await getUserProfile(currentUser.id)
      if (userProfile) {
        console.log("✅ Profile found in header:", userProfile)
        setProfile(userProfile)
      }

      const stats = await getUsageStats(currentUser.id)
      console.log("📊 Usage stats in header:", stats)
      setUsageStats(stats)
    } catch (error) {
      console.error("❌ Error loading user data in header:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      console.log("✅ Signed out successfully")
      // Force page refresh to clear all state
      window.location.href = "/"
    } catch (error) {
      console.error("❌ Sign out error:", error)
      setIsSigningOut(false)
    }
  }

  const handleProfileClick = () => {
    console.log("🔗 Navigating to profile page...")
    router.push("/profile")
  }

  const handleDashboardClick = () => {
    console.log("🔗 Navigating to dashboard...")
    router.push("/dashboard")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min((used / limit) * 100, 100)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  // Show login buttons if no user
  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth-test">
          <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
            Log in
          </Button>
        </Link>
        <Link href="/auth-test">
          <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
            Sign up
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
            <AvatarFallback className="bg-primary text-white text-sm">{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                <AvatarFallback className="bg-primary text-white">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{profile.email}</p>
                <Badge
                  variant={profile.subscription_tier === "premium" ? "default" : "secondary"}
                  className={`mt-1 text-xs ${
                    profile.subscription_tier === "premium" ? "bg-yellow-100 text-yellow-800" : ""
                  }`}
                >
                  {profile.subscription_tier === "premium" ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Usage Stats */}
        {usageStats && (
          <>
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">This Month's Usage</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      Recipes
                    </span>
                    <span>
                      {usageStats.is_premium ? "Unlimited" : `${usageStats.recipes_used}/${usageStats.recipes_limit}`}
                    </span>
                  </div>
                  {!usageStats.is_premium && (
                    <Progress
                      value={getUsagePercentage(usageStats.recipes_used, usageStats.recipes_limit)}
                      className="h-1"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Ask AI
                    </span>
                    <span>
                      {usageStats.is_premium ? "Unlimited" : `${usageStats.ask_chef_used}/${usageStats.ask_chef_limit}`}
                    </span>
                  </div>
                  {!usageStats.is_premium && (
                    <Progress
                      value={getUsagePercentage(usageStats.ask_chef_used, usageStats.ask_chef_limit)}
                      className="h-1"
                    />
                  )}
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Menu Items */}
        <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        {profile.subscription_tier === "free" && (
          <DropdownMenuItem onClick={() => router.push("/pricing")} className="cursor-pointer">
            <Crown className="mr-2 h-4 w-4" />
            <span>Upgrade to Premium</span>
          </DropdownMenuItem>
        )}

        {profile.subscription_tier === "premium" && (
          <DropdownMenuItem onClick={() => router.push("/billing")} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600" disabled={isSigningOut}>
          {isSigningOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
