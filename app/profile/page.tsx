"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { User, Crown, ChefHat, Calendar, MessageSquare, Loader2, Camera, CreditCard, Zap } from "lucide-react"
import { getCurrentUser, getUserProfile, updateProfile, type Profile } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)

      const userProfile = await getUserProfile(currentUser.id)
      if (userProfile) {
        setProfile(userProfile)
        setFullName(userProfile.full_name)
        setEmail(userProfile.email)
      }

      const stats = await getUsageStats(currentUser.id)
      setUsageStats(stats)
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateProfile(user.id, {
        full_name: fullName,
        email: email,
      })

      setSuccess("Profile updated successfully!")
      await loadUserData() // Reload data
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
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

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[85%] max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account and subscription</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">{success}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>Update your personal information and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="mb-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {profile.subscription_tier === "premium" ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Zap className="h-5 w-5 text-primary" />
                  )}
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{profile.subscription_tier === "premium" ? "Premium" : "Free"}</span>
                  <Badge
                    variant={profile.subscription_tier === "premium" ? "default" : "secondary"}
                    className={profile.subscription_tier === "premium" ? "bg-yellow-100 text-yellow-800" : ""}
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

                {profile.subscription_tier === "free" && (
                  <Button onClick={handleUpgrade} className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}

                {profile.subscription_tier === "premium" && (
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageStats && (
                  <>
                    {/* Recipe Generation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          Recipe Generation
                        </span>
                        <span className="font-medium">
                          {usageStats.is_premium
                            ? "Unlimited"
                            : `${usageStats.recipes_used}/${usageStats.recipes_limit}`}
                        </span>
                      </div>
                      {!usageStats.is_premium && (
                        <Progress
                          value={getUsagePercentage(usageStats.recipes_used, usageStats.recipes_limit)}
                          className="h-2"
                        />
                      )}
                    </div>

                    <Separator />

                    {/* Ask Chef */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Ask Food AI
                        </span>
                        <span className="font-medium">
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

                    {!usageStats.is_premium && (
                      <>
                        <Separator />
                        <div className="text-xs text-gray-500 text-center">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Usage resets monthly
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
