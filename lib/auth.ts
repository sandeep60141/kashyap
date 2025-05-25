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
  ask_chef_used_this_month: number
  last_recipe_reset: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}

// Check if user already exists
export async function checkUserExists(email: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    // Check if user exists in auth.users table by attempting to sign in with a dummy password
    // This is a workaround since Supabase doesn't provide a direct way to check user existence
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: "dummy-password-check-12345",
    })

    // If we get an "Invalid login credentials" error, user exists but password is wrong
    // If we get "User not found" or similar, user doesn't exist
    if (error) {
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Email not confirmed") ||
        error.message.includes("Invalid email or password")
      ) {
        return true // User exists
      }
      return false // User doesn't exist
    }

    // If somehow login succeeds, user definitely exists
    if (data.user) {
      // Sign out immediately since this was just a check
      await supabase.auth.signOut()
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking user existence:", error)
    return false
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = getSupabaseClient()

  console.log("🔄 Starting signup process for:", email)

  // First check if user already exists
  const userExists = await checkUserExists(email)
  if (userExists) {
    throw new Error("An account with this email already exists. Please sign in instead.")
  }

  // Sign up the user with email confirmation disabled
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // This should allow immediate signup without email confirmation
      emailRedirectTo: undefined,
    },
  })

  console.log("📝 Signup response:", { data, error })

  if (error) {
    console.error("❌ Signup error:", error)

    // Handle specific error cases
    if (error.message.includes("already registered")) {
      throw new Error("An account with this email already exists. Please sign in instead.")
    }

    throw error
  }

  // If user is created, create profile immediately
  if (data.user) {
    console.log("👤 User created, creating profile...")

    try {
      const profileData = {
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        subscription_tier: "free" as const,
        subscription_status: "active" as const,
        recipes_generated_this_month: 0,
        ask_chef_used_this_month: 0,
        last_recipe_reset: new Date().toISOString().split("T")[0],
      }

      console.log("📊 Creating profile with data:", profileData)

      const { data: profileResult, error: profileError } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        console.error("❌ Profile creation error:", profileError)
        // Don't throw here as the user is already created
      } else {
        console.log("✅ Profile created successfully:", profileResult)
      }
    } catch (profileError) {
      console.error("❌ Profile creation failed:", profileError)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient()

  console.log("🔄 Starting signin process for:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("📝 Signin response:", { data, error })

  if (error) {
    console.error("❌ Signin error:", error)

    // Provide user-friendly error messages
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Invalid email or password. Please check your credentials and try again.")
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Please check your email and click the confirmation link before signing in.")
    }

    throw error
  }

  return data
}

export async function signOut() {
  const supabase = getSupabaseClient()
  console.log("🚪 Signing out...")

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("❌ Signout error:", error)
    throw error
  }

  console.log("✅ Signed out successfully")
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("❌ Get user error:", error)
      return null
    }

    console.log("👤 Current user:", user?.email || "No user")
    return user
  } catch (error) {
    console.error("❌ Get user failed:", error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  try {
    console.log("🔍 Fetching profile for user:", userId)

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("❌ Get profile error:", error)

      // If profile doesn't exist, try to create it
      if (error.code === "PGRST116") {
        console.log("📝 Profile not found, attempting to create...")
        const user = await getCurrentUser()
        if (user) {
          return await createMissingProfile(user)
        }
      }
      return null
    }

    console.log("✅ Profile found:", data)
    return data
  } catch (error) {
    console.error("❌ Profile fetch failed:", error)
    return null
  }
}

// Helper function to create missing profile
async function createMissingProfile(user: User): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  try {
    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email!.split("@")[0],
      subscription_tier: "free" as const,
      subscription_status: "active" as const,
      recipes_generated_this_month: 0,
      ask_chef_used_this_month: 0,
      last_recipe_reset: new Date().toISOString().split("T")[0],
    }

    const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

    if (error) {
      console.error("❌ Failed to create missing profile:", error)
      return null
    }

    console.log("✅ Missing profile created:", data)
    return data
  } catch (error) {
    console.error("❌ Create missing profile failed:", error)
    return null
  }
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

// Check if user has completed onboarding
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile !== null
}

// Store last visited path for redirect after login
export function setLastPath(path: string) {
  if (typeof window !== "undefined") {
    // Don't store auth-related paths
    const authPaths = ["/auth-test", "/onboarding", "/login", "/signup"]
    if (!authPaths.some((authPath) => path.startsWith(authPath))) {
      localStorage.setItem("lastPath", path)
    }
  }
}

export function getLastPath(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lastPath") || "/dashboard"
  }
  return "/dashboard"
}

export function clearLastPath() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lastPath")
  }
}
