import { getSupabaseClient } from "./supabase"

export interface SubscriptionLimits {
  recipes_per_month: number
  meal_plan_days: number
  saved_recipes: number
  ask_chef_questions: number
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    recipes_per_month: 10,
    meal_plan_days: 3,
    saved_recipes: 5,
    ask_chef_questions: 5,
  },
  premium: {
    recipes_per_month: -1, // unlimited
    meal_plan_days: 30,
    saved_recipes: -1, // unlimited
    ask_chef_questions: -1, // unlimited
  },
}

export async function checkUsageLimit(
  userId: string,
  actionType: "recipe_generation" | "meal_plan" | "ask_chef",
): Promise<boolean> {
  const supabase = getSupabaseClient()

  // Get user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error || !profile) return false

  const limits = SUBSCRIPTION_LIMITS[profile.subscription_tier]

  // Check if premium (unlimited)
  if (profile.subscription_tier === "premium") return true

  // Check monthly reset
  const today = new Date().toISOString().split("T")[0]
  const lastReset = new Date(profile.last_recipe_reset)
  const currentMonth = new Date().getMonth()
  const resetMonth = lastReset.getMonth()

  if (currentMonth !== resetMonth) {
    // Reset monthly usage
    await supabase
      .from("profiles")
      .update({
        recipes_generated_this_month: 0,
        last_recipe_reset: today,
      })
      .eq("id", userId)

    return true // Allow action after reset
  }

  // Check specific limits
  switch (actionType) {
    case "recipe_generation":
    case "meal_plan":
      return profile.recipes_generated_this_month < limits.recipes_per_month
    case "ask_chef":
      // Count ask_chef usage this month
      const { count } = await supabase
        .from("usage_tracking")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("action_type", "ask_chef")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      return (count || 0) < limits.ask_chef_questions
    default:
      return false
  }
}

export async function trackUsage(
  userId: string,
  actionType: "recipe_generation" | "meal_plan" | "ask_chef",
  metadata?: any,
) {
  const supabase = getSupabaseClient()

  // Insert usage tracking
  await supabase.from("usage_tracking").insert({
    user_id: userId,
    action_type: actionType,
    metadata: metadata || {},
  })

  // Update profile counter for recipes
  if (actionType === "recipe_generation" || actionType === "meal_plan") {
    await supabase
      .from("profiles")
      .update({
        recipes_generated_this_month: supabase.rpc("increment_recipes_count"),
      })
      .eq("id", userId)
  }
}

export async function getUsageStats(userId: string) {
  const supabase = getSupabaseClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (!profile) return null

  const limits = SUBSCRIPTION_LIMITS[profile.subscription_tier]

  // Get current month usage for ask_chef
  const { count: askChefCount } = await supabase
    .from("usage_tracking")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("action_type", "ask_chef")
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  return {
    subscription_tier: profile.subscription_tier,
    recipes_used: profile.recipes_generated_this_month,
    recipes_limit: limits.recipes_per_month,
    ask_chef_used: askChefCount || 0,
    ask_chef_limit: limits.ask_chef_questions,
    is_premium: profile.subscription_tier === "premium",
  }
}
