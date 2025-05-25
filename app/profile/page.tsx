"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Crown,
  ChefHat,
  MessageSquare,
  ArrowLeft,
  Save,
  Loader2,
  CreditCard,
  Bell,
  Shield,
  Database,
} from "lucide-react"
import { getCurrentUser, getUserProfile, updateProfile, type Profile } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      console.log("🔍 Loading user data for profile page...")
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        console.log("❌ No user found, redirecting to auth")
        router.push("/?auth=signin&redirect=/profile")
        return
      }

      console.log("✅ User found:", currentUser.email)
      setUser(currentUser)

      const userProfile = await getUserProfile(currentUser.id)
      if (userProfile) {
        console.log("✅ Profile found:", userProfile)
        setProfile(userProfile)
        setFormData({
          full_name: userProfile.full_name,
          email: userProfile.email,
        })
      } else {
        console.log("❌ No profile found")
        setMessage({ type: "error", text: "Profile not found. Please contact support." })
      }

      const stats = await getUsageStats(currentUser.id)
      console.log("📊 Usage stats:", stats)
      setUsageStats(stats)
    } catch (error) {
      console.error("❌ Error loading user data:", error)
      setMessage({ type: "error", text: "Failed to load profile data." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setIsSaving(true)
    setMessage(null)

    try {
      await updateProfile(user.id, {
        full_name: formData.full_name,
        email: formData.email,
      })

      setMessage({ type: "success", text: "Profile updated successfully!" })

      // Reload profile data
      const updatedProfile = await getUserProfile(user.id)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
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

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile data.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "subscription", label: "Subscription & Billing", icon: Crown },
    { id: "usage", label: "Usage & Limits", icon: ChefHat },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data & Privacy", icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[85%] max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/")} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                    <AvatarFallback className="bg-primary text-white">{getInitials(profile.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{profile.full_name}</h3>
                    <p className="text-sm text-gray-600">{profile.email}</p>
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
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-white text-lg">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-600 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "subscription" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Subscription & Billing
                  </CardTitle>
                  <CardDescription>Manage your subscription plan and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Current Plan</h3>
                      <p className="text-sm text-gray-600">
                        You are currently on the{" "}
                        <span className="font-medium capitalize">{profile.subscription_tier}</span> plan
                      </p>
                    </div>
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
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Upgrade to Premium</h4>
                      <p className="text-sm text-blue-800 mb-4">
                        Get unlimited recipe generations, advanced meal planning, and priority support.
                      </p>
                      <Button onClick={() => router.push("/pricing")} className="bg-blue-600 hover:bg-blue-700">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  )}

                  {profile.subscription_tier === "premium" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2">Premium Features</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Unlimited recipe generations</li>
                          <li>• Advanced meal planning (up to 30 days)</li>
                          <li>• Unlimited Ask Food AI questions</li>
                          <li>• Priority customer support</li>
                          <li>• Early access to new features</li>
                        </ul>
                      </div>
                      <Button variant="outline" onClick={() => router.push("/billing")}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "usage" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Usage & Limits
                  </CardTitle>
                  <CardDescription>Track your monthly usage and remaining quotas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {usageStats ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 font-medium">
                              <ChefHat className="h-4 w-4" />
                              Recipe Generations
                            </span>
                            <span className="text-sm text-gray-600">
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

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 font-medium">
                              <MessageSquare className="h-4 w-4" />
                              Ask Food AI Questions
                            </span>
                            <span className="text-sm text-gray-600">
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

                      <Separator />

                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Usage Period:</strong> Monthly (resets on the 1st of each month)
                        </p>
                        <p>
                          <strong>Last Reset:</strong> {new Date(profile.last_recipe_reset).toLocaleDateString()}
                        </p>
                      </div>

                      {!usageStats.is_premium && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Need More?</h4>
                          <p className="text-sm text-blue-800 mb-3">
                            Upgrade to Premium for unlimited usage and advanced features.
                          </p>
                          <Button
                            onClick={() => router.push("/pricing")}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Loading usage statistics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(activeTab === "security" || activeTab === "notifications" || activeTab === "data") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {activeTab === "security" && <Shield className="h-5 w-5" />}
                    {activeTab === "notifications" && <Bell className="h-5 w-5" />}
                    {activeTab === "data" && <Database className="h-5 w-5" />}
                    {activeTab === "security" && "Security Settings"}
                    {activeTab === "notifications" && "Notification Preferences"}
                    {activeTab === "data" && "Data & Privacy"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "security" && "Manage your account security and password"}
                    {activeTab === "notifications" && "Control how you receive notifications"}
                    {activeTab === "data" && "Manage your data and privacy settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600">This section is coming soon!</p>
                    <p className="text-sm text-gray-500 mt-2">
                      We're working on adding more features to enhance your experience.
                    </p>
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
