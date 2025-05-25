"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Crown, ChefHat } from "lucide-react"
import { getCurrentUser, getUserProfile, signOut, type Profile } from "@/lib/auth"
import { AuthModal } from "./auth-modal"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin")

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const userProfile = await getUserProfile(currentUser.id)
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setProfile(null)
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAuthTab("signin")
              setShowAuthModal(true)
            }}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Log in
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAuthTab("signup")
              setShowAuthModal(true)
            }}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Sign up
          </Button>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authTab} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || "User"} />
            <AvatarFallback className="bg-primary text-white">
              {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          {profile?.subscription_tier === "premium" && (
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
              {profile?.subscription_tier === "premium" && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChefHat className="h-3 w-3" />
              <span>
                {profile?.subscription_tier === "premium"
                  ? "Unlimited recipes"
                  : `${profile?.recipes_generated_this_month || 0}/10 recipes this month`}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>

        {profile?.subscription_tier === "free" && (
          <DropdownMenuItem onClick={() => router.push("/pricing")}>
            <Crown className="mr-2 h-4 w-4" />
            <span>Upgrade to Premium</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
