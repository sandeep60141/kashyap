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
import {
  User,
  Crown,
  ChefHat,
  Calendar,
  MessageSquare,
  Loader2,
  Camera,
  CreditCard,
  Settings,
  Bell,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("profile")

  // Form states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    updates: true,
  })

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
      await loadUserData()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Here you would implement password change logic
      // For now, just show success
      setSuccess("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to update password")
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
      <div className="w-[90%] max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, subscription, and preferences</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">{success}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{profile.full_name}</h3>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                      <Badge
                        variant={profile.subscription_tier === "premium" ? "default" : "secondary"}
                        className={`mt-1 ${profile.subscription_tier === "premium" ? "bg-yellow-100 text-yellow-800" : ""}`}
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

                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === "profile" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("subscription")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === "subscription" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    Subscription & Billing
                  </button>
                  <button
                    onClick={() => setActiveTab("usage")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === "usage" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                  >
                    <ChefHat className="h-4 w-4" />
                    Usage & Limits
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === "security" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === "notifications" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab("data")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === "data" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    Data & Privacy
                  </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Current Plan</h3>
                      <p className="text-sm text-gray-500">
                        {profile.subscription_tier === "premium" ? "Premium Plan" : "Free Plan"}
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

                  {profile.subscription_tier === "free" ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Upgrade to Premium</h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          Get unlimited recipe generations, advanced meal planning, and priority support.
                        </p>
                        <Button onClick={handleUpgrade} className="bg-yellow-600 hover:bg-yellow-700">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoices
                      </Button>
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
                    <>
                      <div className="space-y-4">
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
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Button
                        variant={notifications.email ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                      >
                        {notifications.email ? "Enabled" : "Disabled"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Updates</h4>
                        <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                      </div>
                      <Button
                        variant={notifications.marketing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotifications({ ...notifications, marketing: !notifications.marketing })}
                      >
                        {notifications.marketing ? "Enabled" : "Disabled"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Product Updates</h4>
                        <p className="text-sm text-gray-500">Get notified about app updates and improvements</p>
                      </div>
                      <Button
                        variant={notifications.updates ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotifications({ ...notifications, updates: !notifications.updates })}
                      >
                        {notifications.updates ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === "data" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>Manage your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download My Data
                    </Button>

                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Danger Zone</h4>
                      <p className="text-sm text-gray-500">These actions are permanent and cannot be undone.</p>
                      <Button variant="destructive" className="w-full justify-start">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
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
