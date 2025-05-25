"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, User, Database, Shield } from "lucide-react"
import { getCurrentUser, getUserProfile, signOut } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"
import { AuthModal } from "@/components/auth/auth-modal"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AuthTestPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      // Test 1: Check if user is authenticated
      const currentUser = await getCurrentUser()
      results.userAuth = {
        status: currentUser ? "success" : "no_user",
        data: currentUser,
      }
      setUser(currentUser)

      if (currentUser) {
        // Test 2: Check if profile exists
        try {
          const userProfile = await getUserProfile(currentUser.id)
          results.profileExists = {
            status: userProfile ? "success" : "no_profile",
            data: userProfile,
          }
          setProfile(userProfile)

          // Test 3: Check usage stats
          if (userProfile) {
            try {
              const stats = await getUsageStats(currentUser.id)
              results.usageStats = {
                status: stats ? "success" : "no_stats",
                data: stats,
              }
              setUsageStats(stats)
            } catch (error) {
              results.usageStats = {
                status: "error",
                error: error,
              }
            }
          }
        } catch (error) {
          results.profileExists = {
            status: "error",
            error: error,
          }
        }
      }
    } catch (error) {
      results.userAuth = {
        status: "error",
        error: error,
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setProfile(null)
      setUsageStats(null)
      await checkAuthStatus()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const TestResult = ({ title, result, icon: Icon }: any) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "success":
          return "text-green-600"
        case "error":
          return "text-red-600"
        case "no_user":
        case "no_profile":
        case "no_stats":
          return "text-yellow-600"
        default:
          return "text-gray-600"
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case "error":
          return <XCircle className="h-5 w-5 text-red-600" />
        default:
          return <XCircle className="h-5 w-5 text-yellow-600" />
      }
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
            {result && getStatusIcon(result.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-2">
              <Badge variant={result.status === "success" ? "default" : "destructive"} className="mb-2">
                {result.status.toUpperCase()}
              </Badge>
              {result.data && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
              {result.error && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-800 text-sm">{result.error.message || String(result.error)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[90%] max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">🧪 Authentication System Test</h1>
          <p className="text-gray-600">Testing Supabase authentication, profiles, and database connectivity</p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button onClick={checkAuthStatus} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "🔄 Run Tests"
            )}
          </Button>

          {!user ? (
            <Button onClick={() => setShowAuthModal(true)} variant="outline">
              🔐 Sign In / Sign Up
            </Button>
          ) : (
            <Button onClick={handleSignOut} variant="outline">
              🚪 Sign Out
            </Button>
          )}
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TestResult title="User Authentication" result={testResults.userAuth} icon={Shield} />
          <TestResult title="Profile Data" result={testResults.profileExists} icon={User} />
          <TestResult title="Usage Statistics" result={testResults.usageStats} icon={Database} />
        </div>

        {/* Current Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Current Status Summary</CardTitle>
            <CardDescription>Overview of your authentication and profile status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🔐 Authentication Status</h3>
                <div className="space-y-2">
                  <p>
                    <strong>Logged In:</strong>{" "}
                    <Badge variant={user ? "default" : "destructive"}>{user ? "Yes" : "No"}</Badge>
                  </p>
                  {user && (
                    <>
                      <p>
                        <strong>User ID:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{user.id}</code>
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Email Verified:</strong>{" "}
                        <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                          {user.email_confirmed_at ? "Yes" : "No"}
                        </Badge>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">👤 Profile Information</h3>
                <div className="space-y-2">
                  {profile ? (
                    <>
                      <p>
                        <strong>Name:</strong> {profile.full_name}
                      </p>
                      <p>
                        <strong>Subscription:</strong>{" "}
                        <Badge variant={profile.subscription_tier === "premium" ? "default" : "secondary"}>
                          {profile.subscription_tier}
                        </Badge>
                      </p>
                      <p>
                        <strong>Recipes Used:</strong> {profile.recipes_generated_this_month}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <Badge variant={profile.subscription_status === "active" ? "default" : "destructive"}>
                          {profile.subscription_status}
                        </Badge>
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No profile data available</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        {usageStats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>📈 Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Recipe Generation</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {usageStats.is_premium ? "∞" : `${usageStats.recipes_used}/${usageStats.recipes_limit}`}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Ask Food AI</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {usageStats.is_premium ? "∞" : `${usageStats.ask_chef_used}/${usageStats.ask_chef_limit}`}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Plan Type</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {usageStats.subscription_tier === "premium" ? "Premium" : "Free"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">✅ What to Test:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>Click "Sign In / Sign Up" to test authentication modal</li>
                  <li>Create a new account and verify profile creation</li>
                  <li>Sign in with existing credentials</li>
                  <li>Check if profile data is properly stored and retrieved</li>
                  <li>Verify usage statistics are tracking correctly</li>
                  <li>Test sign out functionality</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">🔍 Expected Results:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>All test cards should show "SUCCESS" status</li>
                  <li>New users should automatically get "free" subscription tier</li>
                  <li>Profile data should be created and retrievable</li>
                  <li>Usage stats should show proper limits and current usage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
