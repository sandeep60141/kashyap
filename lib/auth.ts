import { getSupabaseClient } from "./supabase"
import type { Profile } from "./supabase"

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

  // Create profile manually since we can't use triggers
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

    if (profileError) {
      console.error("Profile creation error:", profileError)
    }
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

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = getSupabaseClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(updates: Partial<Profile>) {
  const supabase = getSupabaseClient()
  const user = await getCurrentUser()

  if (!user) throw new Error("No user found")

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id)
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

export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}
