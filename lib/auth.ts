import { getSupabaseClient } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  subscription_tier: "free" | "premium"
  subscription_status: "active" | "canceled" | "past_due"
  recipes_generated_this_month: number
  last_recipe_reset: string
  created_at: string
  updated_at: string
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error

  // Create profile with free plan
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      subscription_tier: "free",
      subscription_status: "active",
      recipes_generated_this_month: 0,
      last_recipe_reset: new Date().toISOString().split("T")[0],
    })

    if (profileError) throw profileError
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}
