import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Disable email confirmation for signup
      flowType: "implicit",
    },
  })
}

export const supabase = getSupabaseClient()

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          subscription_tier: "free" | "premium"
          subscription_status: "active" | "canceled" | "past_due"
          recipes_generated_this_month: number
          ask_chef_used_this_month: number
          last_recipe_reset: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          subscription_tier?: "free" | "premium"
          subscription_status?: "active" | "canceled" | "past_due"
          recipes_generated_this_month?: number
          ask_chef_used_this_month?: number
          last_recipe_reset?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          email?: string
          full_name?: string
          avatar_url?: string | null
          subscription_tier?: "free" | "premium"
          subscription_status?: "active" | "canceled" | "past_due"
          recipes_generated_this_month?: number
          ask_chef_used_this_month?: number
          last_recipe_reset?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          action_type: "recipe_generation" | "meal_plan" | "ask_chef"
          metadata: any
          created_at: string
        }
        Insert: {
          user_id: string
          action_type: "recipe_generation" | "meal_plan" | "ask_chef"
          metadata?: any
        }
        Update: {
          metadata?: any
        }
      }
    }
  }
}
