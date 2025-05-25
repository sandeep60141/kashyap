"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Crown, Zap, AlertTriangle } from "lucide-react"
import { getUserProfile, getUserUsageStats } from "@/lib/auth"
import { checkUsageLimit } from "@/lib/subscription"
import Link from "next/link"
import type { Profile } from "@/lib/supabase"

interface UsageBannerProps {
  actionType?: "recipe_generation" | "meal_plan" | "ask_chef"
  showUpgrade?: boolean
}

export function UsageBanner({ actionType = "recipe_generation", showUpgrade = true }: UsageBannerProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [canUse, setCanUse] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsageData()
  }, [actionType])

  const loadUsageData = async () => {
    try {
      const [userProfile, stats, usageAllowed] = await Promise.all([
        getUserProfile(),
        getUserUsageStats(),
        checkUsageLimit(actionType),
      ])

      setProfile(userProfile)
      setUsageStats(stats)
      setCanUse(usageAllowed)
    } catch (error) {
      console.error("Error loading usage data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !profile) {
    return null
  }

  // Don't show banner for premium users
  if (profile.subscription_tier === "premium") {
    return null
  }

  const limits = {
    recipe_generation: 10,
    meal_plan: 3,
    ask_chef: 5,
  }

  const getCurrentUsage = () => {
    switch (actionType) {
      case "recipe_generation":
        return profile.recipes_generated_this_month
      case "meal_plan":
        return usageStats?.meal_plans || 0
      case "ask_chef":
        return usageStats?.ask_chef_questions || 0
      default:
        return 0
    }
  }

  const currentUsage = getCurrentUsage()
  const limit = limits[actionType]
  const percentage = (currentUsage / limit) * 100
  const remaining = Math.max(0, limit - currentUsage)

  const getActionLabel = () => {
    switch (actionType) {
      case "recipe_generation":
        return "recipes"
      case "meal_plan":
        return "meal plans"
      case "ask_chef":
        return "AI questions"
      default:
        return "actions"
    }
  }

  const isNearLimit = percentage >= 80
  const isAtLimit = !canUse

  return (
    <div
      className={`rounded-lg border p-4 ${
        isAtLimit
          ? "border-red-200 bg-red-50"
          : isNearLimit
            ? "border-yellow-200 bg-yellow-50"
            : "border-blue-200 bg-blue-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isAtLimit ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Zap className="h-5 w-5 text-blue-500" />}
            <h3 className="font-semibold text-sm">{isAtLimit ? "Limit Reached" : "Usage This Month"}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{getActionLabel()} used</span>
              <span className="font-medium">
                {currentUsage} / {limit}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${
                isAtLimit ? "[&>div]:bg-red-500" : isNearLimit ? "[&>div]:bg-yellow-500" : "[&>div]:bg-blue-500"
              }`}
            />
            {!isAtLimit && (
              <p className="text-xs text-muted-foreground">
                {remaining} {getActionLabel()} remaining this month
              </p>
            )}
          </div>
        </div>

        {showUpgrade && (
          <div className="flex flex-col gap-2">
            <Link href="/pricing">
              <Button size="sm" className="whitespace-nowrap">
                <Crown className="mr-1 h-4 w-4" />
                Upgrade
              </Button>
            </Link>
            {isAtLimit && <p className="text-xs text-center text-muted-foreground">Get unlimited access</p>}
          </div>
        )}
      </div>
    </div>
  )
}
