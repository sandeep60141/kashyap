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

  try {
    // Get user profile
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error || !profile) {
      console.error("Profile fetch error:", error)
      return false
    }

    const limits = SUBSCRIPTION_LIMITS[profile.subscription_tier || "free"]

    // Check if premium (unlimited)
    if (profile.subscription_tier === "premium") return true

    // Check monthly reset
    const today = new Date().toISOString().split("T")[0]
    const lastReset = new Date(profile.last_recipe_reset || today)
    const currentMonth = new Date().getMonth()
    const resetMonth = lastReset.getMonth()

    if (currentMonth !== resetMonth) {
      // Reset monthly usage - only update columns that exist
      const updateData: any = {}

      if (profile.hasOwnProperty("recipes_generated_this_month")) {
        updateData.recipes_generated_this_month = 0
      }

      if (profile.hasOwnProperty("ask_chef_used_this_month")) {
        updateData.ask_chef_used_this_month = 0
      }

      if (profile.hasOwnProperty("last_recipe_reset")) {
        updateData.last_recipe_reset = today
      }

      if (Object.keys(updateData).length > 0) {
        await supabase.from("profiles").update(updateData).eq("id", userId)
      }

      return true // Allow action after reset
    }

    // Check specific limits
    switch (actionType) {
      case "recipe_generation":
      case "meal_plan":
        return (profile.recipes_generated_this_month || 0) < limits.recipes_per_month
      case "ask_chef":
        return (profile.ask_chef_used_this_month || 0) < limits.ask_chef_questions
      default:
        return false
    }
  } catch (error) {
    console.error("Usage limit check error:", error)
    return false
  }
}

export async function trackUsage(
  userId: string,
  actionType: "recipe_generation" | "meal_plan" | "ask_chef",
  metadata?: any,
) {
  const supabase = getSupabaseClient()

  try {
    // Insert usage tracking if table exists
    try {
      await supabase.from("usage_tracking").insert({
        user_id: userId,
        action_type: actionType,
        metadata: metadata || {},
      })
    } catch (trackingError) {
      console.log("Usage tracking table not found, skipping...")
    }

    // Update profile counter - only if columns exist
    if (actionType === "recipe_generation" || actionType === "meal_plan") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("recipes_generated_this_month")
        .eq("id", userId)
        .single()

      if (profile && profile.hasOwnProperty("recipes_generated_this_month")) {
        await supabase
          .from("profiles")
          .update({
            recipes_generated_this_month: (profile.recipes_generated_this_month || 0) + 1,
          })
          .eq("id", userId)
      }
    } else if (actionType === "ask_chef") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("ask_chef_used_this_month")
        .eq("id", userId)
        .single()

      if (profile && profile.hasOwnProperty("ask_chef_used_this_month")) {
        await supabase
          .from("profiles")
          .update({
            ask_chef_used_this_month: (profile.ask_chef_used_this_month || 0) + 1,
          })
          .eq("id", userId)
      }
    }
  } catch (error) {
    console.error("Usage tracking error:", error)
  }
}

export async function getUsageStats(userId: string) {
  const supabase = getSupabaseClient()

  try {
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error || !profile) {
      console.error("Profile fetch error:", error)
      return null
    }

    const limits = SUBSCRIPTION_LIMITS[profile.subscription_tier || "free"]

    return {
      subscription_tier: profile.subscription_tier || "free",
      recipes_used: profile.recipes_generated_this_month || 0,
      recipes_limit: limits.recipes_per_month,
      ask_chef_used: profile.ask_chef_used_this_month || 0,
      ask_chef_limit: limits.ask_chef_questions,
      is_premium: profile.subscription_tier === "premium",
    }
  } catch (error) {
    console.error("Usage stats error:", error)
    return null
  }
}
