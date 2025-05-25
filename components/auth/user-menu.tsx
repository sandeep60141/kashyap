"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Crown, Zap, BarChart3 } from "lucide-react"
import { getCurrentUser, getUserProfile, signOut } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"
import { AuthModal } from "./auth-modal"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const [userProfile, stats] = await Promise.all([getUserProfile(currentUser.id), getUsageStats(currentUser.id)])
        setProfile(userProfile)
        setUsageStats(stats)
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setProfile(null)
      setUsageStats(null)
      window.location.reload()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
            Log in
          </Button>
          <Button size="sm" onClick={() => setShowAuthModal(true)}>
            Sign up
          </Button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.full_name ? getInitials(profile.full_name) : "U"}
              </AvatarFallback>
            </Avatar>
            {profile?.subscription_tier === "premium" && (
              <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                <Badge variant={profile?.subscription_tier === "premium" ? "default" : "secondary"}>
                  {profile?.subscription_tier === "premium" ? (
                    <>
                      <Crown className="mr-1 h-3 w-3" />
                      Premium
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
              </div>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Usage Stats */}
          {usageStats && (
            <>
              <div className="px-2 py-2">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Recipe Generation
                      </span>
                      <span>
                        {usageStats.is_premium ? "Unlimited" : `${usageStats.recipes_used}/${usageStats.recipes_limit}`}
                      </span>
                    </div>
                    {!usageStats.is_premium && (
                      <Progress
                        value={getUsagePercentage(usageStats.recipes_used, usageStats.recipes_limit)}
                        className="h-2"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Ask Food AI
                      </span>
                      <span>
                        {usageStats.is_premium
                          ? "Unlimited"
                          : `${usageStats.ask_chef_used}/${usageStats.ask_chef_limit}`}
                      </span>
                    </div>
                    {!usageStats.is_premium && (
                      <Progress
                        value={getUsagePercentage(usageStats.ask_chef_used, usageStats.ask_chef_limit)}
                        className="h-2"
                      />
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/pricing" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          {profile?.subscription_tier === "free" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="flex items-center text-primary">
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Upgrade to Premium</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
