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
import {
  User,
  Crown,
  ChefHat,
  Calendar,
  MessageSquare,
  Loader2,
  Camera,
  CreditCard,
  Bell,
  Shield,
  Download,
  ArrowLeft,
  Home,
} from "lucide-react"
import { getCurrentUser, getUserProfile, updateProfile, type Profile } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function ProfilePageContent() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")

  // Form states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      console.log("🔍 Loading user data for profile content...")
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.log("❌ No user found in profile content")
        router.push("/")
        return
      }

      console.log("✅ User found in profile content:", currentUser.email)
      setUser(currentUser)

      const userProfile = await getUserProfile(currentUser.id)
      if (userProfile) {
        console.log("✅ Profile found in profile content:", userProfile)
        setProfile(userProfile)
        setFullName(userProfile.full_name)
        setEmail(userProfile.email)
      } else {
        console.log("❌ No profile found in profile content")
        setError("Profile not found. Please try refreshing the page.")
      }

      const stats = await getUsageStats(currentUser.id)
      console.log("📊 Usage stats in profile content:", stats)
      setUsageStats(stats)
    } catch (error) {
      console.error("❌ Error loading user data in profile content:", error)
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
      await loadUserData()
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
    if (limit === -1) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-[90%] max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">Account Settings</h1>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-[90%] max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">Account Settings</h1>
              <p className="text-gray-600">Unable to load profile</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't load your profile. Please try again.</p>
              <div className="space-x-4">
                <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Go Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[90%] max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, subscription, and preferences</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              ×
            </Button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
            <span>{success}</span>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
              ×
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-0">
                {/* User Info Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-white text-lg">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                      <p className="text-sm text-gray-600 truncate">{profile.email}</p>
                      <Badge
                        variant={profile.subscription_tier === "premium" ? "default" : "secondary"}
                        className={`mt-2 ${
                          profile.subscription_tier === "premium"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : ""
                        }`}
                      >
                        {profile.subscription_tier === "premium" ? (
                          <>
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </>
                        ) : (
                          "Free Plan"
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="p-2">
                  {[
                    { id: "profile", label: "Profile Information", icon: User },
                    { id: "subscription", label: "Subscription & Billing", icon: Crown },
                    { id: "usage", label: "Usage & Limits", icon: ChefHat },
                    { id: "security", label: "Security", icon: Shield },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "data", label: "Data & Privacy", icon: Download },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id ? "bg-primary text-white shadow-md" : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-white text-xl">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Profile Picture</h3>
                      <Button variant="outline" size="sm" className="mb-2">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSaving} className="px-8">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Subscription & Billing
                  </CardTitle>
                  <CardDescription>Manage your subscription plan and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-lg">Current Plan</h3>
                      <p className="text-gray-600">
                        {profile.subscription_tier === "premium"
                          ? "Premium Plan - $9.99/month"
                          : "Free Plan - $0/month"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {profile.subscription_tier === "premium"
                          ? "Unlimited access to all features"
                          : "Limited access with monthly quotas"}
                      </p>
                    </div>
                    <Badge
                      variant={profile.subscription_tier === "premium" ? "default" : "secondary"}
                      className={`text-lg px-4 py-2 ${
                        profile.subscription_tier === "premium" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""
                      }`}
                    >
                      {profile.subscription_tier === "premium" ? (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Premium
                        </>
                      ) : (
                        "Free"
                      )}
                    </Badge>
                  </div>

                  {profile.subscription_tier === "free" ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-3 text-lg">Upgrade to Premium</h4>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <ChefHat className="h-4 w-4" />
                            <span>Unlimited recipe generations</span>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-700">
                            <Calendar className="h-4 w-4" />
                            <span>30-day meal plans</span>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-700">
                            <MessageSquare className="h-4 w-4" />
                            <span>Unlimited Ask Food AI</span>
                          </div>
                        </div>
                        <Button onClick={handleUpgrade} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade Now - $9.99/month
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-12">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage Billing
                        </Button>
                        <Button variant="outline" className="h-12">
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoices
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Usage Tab */}
            {activeTab === "usage" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    Usage & Limits
                  </CardTitle>
                  <CardDescription>Track your monthly usage and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {usageStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ChefHat className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Recipe Generation</h3>
                            <p className="text-sm text-gray-600">Monthly usage</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Used this month</span>
                            <span className="font-medium">
                              {usageStats.is_premium
                                ? "Unlimited"
                                : `${usageStats.recipes_used}/${usageStats.recipes_limit}`}
                            </span>
                          </div>
                          {!usageStats.is_premium && (
                            <Progress
                              value={getUsagePercentage(usageStats.recipes_used, usageStats.recipes_limit)}
                              className="h-3"
                            />
                          )}
                        </div>
                      </div>

                      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Ask Food AI</h3>
                            <p className="text-sm text-gray-600">Monthly usage</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Used this month</span>
                            <span className="font-medium">
                              {usageStats.is_premium
                                ? "Unlimited"
                                : `${usageStats.ask_chef_used || 0}/${usageStats.ask_chef_limit || 5}`}
                            </span>
                          </div>
                          {!usageStats.is_premium && (
                            <Progress
                              value={getUsagePercentage(usageStats.ask_chef_used || 0, usageStats.ask_chef_limit || 5)}
                              className="h-3"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!usageStats?.is_premium && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-600">Usage resets on the 1st of each month</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Other tabs can be added here */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
                    <p className="text-gray-600">Password change and security features coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Manage your email and notification settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
                    <p className="text-gray-600">Notification preferences coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "data" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>Export your data and manage privacy settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                    <p className="text-gray-600">Data export and privacy controls coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
