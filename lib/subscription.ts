import { getSupabaseClient } from "./supabase"
import { getCurrentUser, getUserProfile } from "./auth"
import type { SubscriptionPlan } from "./supabase"

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_monthly", { ascending: true })

  if (error) throw error
  return data || []
}

export async function checkUsageLimit(actionType: "recipe_generation" | "meal_plan" | "ask_chef"): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) return false

  // Premium users have unlimited access
  if (profile.subscription_tier === "premium") return true

  // Check monthly reset
  const today = new Date().toISOString().split("T")[0]
  if (profile.last_recipe_reset !== today) {
    // Reset monthly usage if it's a new month
    const lastReset = new Date(profile.last_recipe_reset)
    const now = new Date()

    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      await resetMonthlyUsage()
      return true
    }
  }

  // Check limits based on action type
  const limits = {
    recipe_generation: 10,
    meal_plan: 3,
    ask_chef: 5,
  }

  if (actionType === "recipe_generation") {
    return profile.recipes_generated_this_month < limits.recipe_generation
  }

  // For other actions, check usage_tracking table
  const supabase = getSupabaseClient()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data, error } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", profile.id)
    .eq("action_type", actionType)
    .gte("created_at", startOfMonth)

  if (error) {
    console.error("Error checking usage:", error)
    return false
  }

  return (data?.length || 0) < limits[actionType]
}

export async function trackUsage(actionType: "recipe_generation" | "meal_plan" | "ask_chef", metadata?: any) {
  const user = await getCurrentUser()
  if (!user) return

  const supabase = getSupabaseClient()

  // Track in usage_tracking table
  const { error: trackingError } = await supabase.from("usage_tracking").insert({
    user_id: user.id,
    action_type: actionType,
    metadata,
  })

  if (trackingError) {
    console.error("Error tracking usage:", trackingError)
  }

  // Update recipe count in profile if it's a recipe generation
  if (actionType === "recipe_generation") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        recipes_generated_this_month: supabase.rpc("increment_recipes"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
    }
  }
}

export async function resetMonthlyUsage() {
  const user = await getCurrentUser()
  if (!user) return

  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  const { error } = await supabase
    .from("profiles")
    .update({
      recipes_generated_this_month: 0,
      last_recipe_reset: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error resetting monthly usage:", error)
  }
}

export async function getUserUsageStats() {
  const profile = await getUserProfile()
  if (!profile) return null

  const supabase = getSupabaseClient()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data: usageData, error } = await supabase
    .from("usage_tracking")
    .select("action_type")
    .eq("user_id", profile.id)
    .gte("created_at", startOfMonth)

  if (error) {
    console.error("Error fetching usage stats:", error)
    return null
  }

  const stats = {
    recipes_generated: profile.recipes_generated_this_month,
    meal_plans: usageData?.filter((u) => u.action_type === "meal_plan").length || 0,
    ask_chef_questions: usageData?.filter((u) => u.action_type === "ask_chef").length || 0,
  }

  return stats
}
