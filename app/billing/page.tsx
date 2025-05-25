"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, CreditCard, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { getUserProfile } from "@/lib/auth"
import { createPortalSession } from "@/lib/stripe"
import { getUserUsageStats } from "@/lib/subscription"
import Link from "next/link"
import type { Profile } from "@/lib/supabase"

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const [userProfile, stats] = await Promise.all([getUserProfile(), getUserUsageStats()])

      setProfile(userProfile)
      setUsageStats(stats)
    } catch (error) {
      console.error("Error loading billing data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsPortalLoading(true)
    try {
      await createPortalSession()
    } catch (error) {
      console.error("Error opening billing portal:", error)
    } finally {
      setIsPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
              <p className="text-muted-foreground mb-4">You need to be signed in to view your billing information.</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPremium = profile.subscription_tier === "premium"
  const subscriptionEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPremium ? <Crown className="h-5 w-5 text-yellow-500" /> : <CreditCard className="h-5 w-5" />}
            Current Plan
          </CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{isPremium ? "Premium" : "Free"}</h3>
              <p className="text-muted-foreground">
                {isPremium ? "Your Digital Personal Chef" : "Perfect for casual home cooks"}
              </p>
            </div>
            <Badge variant={isPremium ? "default" : "secondary"} className="text-sm">
              {isPremium ? "Premium" : "Free"}
            </Badge>
          </div>

          {isPremium && subscriptionEndDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {profile.subscription_status === "active"
                  ? `Renews on ${subscriptionEndDate.toLocaleDateString()}`
                  : `Expires on ${subscriptionEndDate.toLocaleDateString()}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {profile.subscription_status === "active" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm capitalize">{profile.subscription_status}</span>
          </div>

          {isPremium && profile.stripe_customer_id && (
            <Button onClick={handleManageBilling} disabled={isPortalLoading} className="w-full sm:w-auto">
              {isPortalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Manage Billing
            </Button>
          )}

          {!isPremium && (
            <Link href="/pricing">
              <Button className="w-full sm:w-auto">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your monthly usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recipes Generated</span>
                <span className="text-sm text-muted-foreground">
                  {profile.recipes_generated_this_month} / {isPremium ? "∞" : "10"}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: isPremium ? "100%" : `${Math.min((profile.recipes_generated_this_month / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meal Plans</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats?.meal_plans || 0} / {isPremium ? "∞" : "3"}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: isPremium ? "100%" : `${Math.min(((usageStats?.meal_plans || 0) / 3) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Questions</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats?.ask_chef_questions || 0} / {isPremium ? "∞" : "5"}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: isPremium ? "100%" : `${Math.min(((usageStats?.ask_chef_questions || 0) / 5) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>What's included in your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {isPremium ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited AI recipe generations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Advanced meal plans (up to 30 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited cookbook & shopping lists</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">All cooking modes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Export recipes to PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">No advertisements</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">10 AI recipe generations per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic meal plans (up to 3 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Save 5 recipes in cookbook</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Access to PantryChef mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Community support</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
