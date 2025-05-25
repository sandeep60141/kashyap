"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { getUsageStats } from "@/lib/subscription"

export default function TestSupabasePage() {
  const [results, setResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Supabase Client Connection
      console.log("🔍 Testing Supabase client...")
      const supabase = getSupabaseClient()
      testResults.supabaseClient = supabase ? "✅ Connected" : "❌ Failed"

      // Test 2: Database Connection
      console.log("🔍 Testing database connection...")
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        testResults.databaseConnection = error ? `❌ Error: ${error.message}` : "✅ Connected"
      } catch (error: any) {
        testResults.databaseConnection = `❌ Exception: ${error.message}`
      }

      // Test 3: Auth Status
      console.log("🔍 Testing auth status...")
      try {
        const user = await getCurrentUser()
        testResults.authStatus = user ? `✅ Authenticated: ${user.email}` : "❌ Not authenticated"

        if (user) {
          // Test 4: Profile Fetch
          console.log("🔍 Testing profile fetch...")
          try {
            const profile = await getUserProfile(user.id)
            testResults.profileFetch = profile ? `✅ Profile found: ${profile.full_name}` : "❌ No profile"
          } catch (error: any) {
            testResults.profileFetch = `❌ Error: ${error.message}`
          }

          // Test 5: Usage Stats
          console.log("🔍 Testing usage stats...")
          try {
            const stats = await getUsageStats(user.id)
            testResults.usageStats = stats ? `✅ Stats loaded: ${JSON.stringify(stats)}` : "❌ No stats"
          } catch (error: any) {
            testResults.usageStats = `❌ Error: ${error.message}`
          }
        }
      } catch (error: any) {
        testResults.authStatus = `❌ Error: ${error.message}`
      }

      // Test 6: Environment Variables
      console.log("🔍 Testing environment variables...")
      testResults.envVars = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      }
    } catch (error: any) {
      testResults.generalError = `❌ General error: ${error.message}`
    }

    setResults(testResults)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
            <CardDescription>Test all Supabase connections and functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={runTests} disabled={isLoading} className="border-2 border-primary">
              {isLoading ? "Running Tests..." : "Run All Tests"}
            </Button>

            {Object.keys(results).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>

                <div className="grid gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border-2">
                    <h4 className="font-medium mb-2">Supabase Client</h4>
                    <p className="text-sm">{results.supabaseClient}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border-2">
                    <h4 className="font-medium mb-2">Database Connection</h4>
                    <p className="text-sm">{results.databaseConnection}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border-2">
                    <h4 className="font-medium mb-2">Authentication Status</h4>
                    <p className="text-sm">{results.authStatus}</p>
                  </div>

                  {results.profileFetch && (
                    <div className="p-4 bg-gray-50 rounded-lg border-2">
                      <h4 className="font-medium mb-2">Profile Fetch</h4>
                      <p className="text-sm">{results.profileFetch}</p>
                    </div>
                  )}

                  {results.usageStats && (
                    <div className="p-4 bg-gray-50 rounded-lg border-2">
                      <h4 className="font-medium mb-2">Usage Statistics</h4>
                      <p className="text-sm break-all">{results.usageStats}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg border-2">
                    <h4 className="font-medium mb-2">Environment Variables</h4>
                    <div className="text-sm space-y-1">
                      <p>Supabase URL: {results.envVars?.supabaseUrl}</p>
                      <p>Supabase Anon Key: {results.envVars?.supabaseAnonKey}</p>
                    </div>
                  </div>

                  {results.generalError && (
                    <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                      <h4 className="font-medium mb-2 text-red-800">General Error</h4>
                      <p className="text-sm text-red-700">{results.generalError}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
