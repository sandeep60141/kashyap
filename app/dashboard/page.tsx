"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChefHat,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Loader2,
  Crown,
  Settings,
  User,
} from "lucide-react"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking auth for dashboard...")
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.log("❌ No user found, redirecting to home")
        router.push("/")
        return
      }

      console.log("✅ User found:", currentUser.email)
      setUser(currentUser)

      const userProfile = await getUserProfile(currentUser.id)
      if (!userProfile) {
        console.log("❌ No profile found, redirecting to onboarding")
        router.push("/onboarding")
        return
      }

      console.log("✅ Profile found:", userProfile)
      setProfile(userProfile)

      const stats = await getUsageStats(currentUser.id)
      console.log("📊 Usage stats:", stats)
      setUsageStats(stats)
    } catch (error) {
      console.error("❌ Error checking auth:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Generate Recipe",
      description: "Create a new recipe with AI",
      icon: ChefHat,
      href: "/",
      color: "bg-blue-500",
    },
    {
      title: "Plan Meals",
      description: "Create meal plans for the week",
      icon: Calendar,
      href: "/mealPlanChef",
      color: "bg-green-500",
    },
    {
      title: "Ask Food AI",
      description: "Get cooking help and tips",
      icon: MessageSquare,
      href: "/",
      color: "bg-purple-500",
    },
  ]

  const recentActivity = [
    { action: "Generated Italian Pasta Recipe", time: "2 hours ago" },
    { action: "Created 3-day meal plan", time: "1 day ago" },
    { action: "Asked about substitutions", time: "2 days ago" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[90%] max-w-7xl mx-auto py-8 px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
                <AvatarFallback className="bg-primary text-white text-lg">
                  {profile?.full_name ? getInitials(profile.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "Chef"}! 👋
                </h1>
                <p className="text-gray-600 mt-1">Ready to create some amazing recipes today?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              {profile?.subscription_tier === "premium" && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-blue-600" />
                Recipe Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used this month</span>
                  <span className="font-medium">
                    {usageStats?.is_premium
                      ? "∞"
                      : `${usageStats?.recipes_used || 0}/${usageStats?.recipes_limit || 10}`}
                  </span>
                </div>
                {!usageStats?.is_premium && (
                  <Progress
                    value={((usageStats?.recipes_used || 0) / (usageStats?.recipes_limit || 10)) * 100}
                    className="h-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Ask Food AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used this month</span>
                  <span className="font-medium">
                    {usageStats?.is_premium
                      ? "∞"
                      : `${usageStats?.ask_chef_used || 0}/${usageStats?.ask_chef_limit || 5}`}
                  </span>
                </div>
                {!usageStats?.is_premium && (
                  <Progress
                    value={((usageStats?.ask_chef_used || 0) / (usageStats?.ask_chef_limit || 5)) * 100}
                    className="h-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {(usageStats?.recipes_used || 0) + (usageStats?.ask_chef_used || 0)}
                </p>
                <p className="text-sm text-gray-600">Total AI interactions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest Food AI interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Overview
              </CardTitle>
              <CardDescription>Quick access to your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
                  <AvatarFallback className="bg-primary text-white">
                    {profile?.full_name ? getInitials(profile.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
                <Badge
                  variant={profile?.subscription_tier === "premium" ? "default" : "secondary"}
                  className={profile?.subscription_tier === "premium" ? "bg-yellow-100 text-yellow-800" : ""}
                >
                  {profile?.subscription_tier === "premium" ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
              </div>

              <div className="space-y-2">
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
                {profile?.subscription_tier === "free" && (
                  <Link href="/pricing">
                    <Button className="w-full justify-start bg-yellow-600 hover:bg-yellow-700">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
