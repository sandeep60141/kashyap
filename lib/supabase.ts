import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// Server-side Supabase client
export function createServerClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Types
export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  subscription_tier: "free" | "premium"
  subscription_status: "active" | "canceled" | "past_due"
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_end_date?: string
  recipes_generated_this_month: number
  last_recipe_reset: string
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  features: string[]
  limits: {
    recipes_per_month: number
    meal_plan_days: number
    saved_recipes: number
    ask_chef_questions: number
  }
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
}

export interface UsageTracking {
  id: string
  user_id: string
  action_type: "recipe_generation" | "meal_plan" | "ask_chef"
  created_at: string
  metadata?: any
}
