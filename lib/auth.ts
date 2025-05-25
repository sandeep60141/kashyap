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
  ask_chef_used_this_month?: number // Make optional since it might not exist
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: "dummy-password-check-12345",
    })

    if (error) {
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Email not confirmed") ||
        error.message.includes("Invalid email or password")
      ) {
        return true
      }
      return false
    }

    if (data.user) {
      await supabase.auth.signOut()
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking user existence:", error)
    return false
  }
}

// Helper function to check which columns exist in the profiles table
async function getTableColumns(): Promise<string[]> {
  const supabase = getSupabaseClient()

  try {
    // Try to get the first row to see what columns exist
    const { data, error } = await supabase.from("profiles").select("*").limit(1).single()

    if (data) {
      return Object.keys(data)
    }

    // If no data exists, we'll use a basic set of columns
    return [
      "id",
      "email",
      "full_name",
      "subscription_tier",
      "subscription_status",
      "recipes_generated_this_month",
      "last_recipe_reset",
    ]
  } catch (error) {
    console.log("Could not determine table columns, using basic set")
    return [
      "id",
      "email",
      "full_name",
      "subscription_tier",
      "subscription_status",
      "recipes_generated_this_month",
      "last_recipe_reset",
    ]
  }
}

// Helper function to create user profile with only existing columns
async function createUserProfile(user: User, fullName?: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  try {
    console.log("🔍 Checking available columns in profiles table...")
    const availableColumns = await getTableColumns()
    console.log("📋 Available columns:", availableColumns)

    // Base profile data with only essential fields
    const baseProfileData: any = {
      id: user.id,
      email: user.email!,
      full_name: fullName || user.user_metadata?.full_name || user.email!.split("@")[0],
    }

    // Add optional fields only if columns exist
    if (availableColumns.includes("subscription_tier")) {
      baseProfileData.subscription_tier = "free"
    }

    if (availableColumns.includes("subscription_status")) {
      baseProfileData.subscription_status = "active"
    }

    if (availableColumns.includes("recipes_generated_this_month")) {
      baseProfileData.recipes_generated_this_month = 0
    }

    if (availableColumns.includes("ask_chef_used_this_month")) {
      baseProfileData.ask_chef_used_this_month = 0
    }

    if (availableColumns.includes("last_recipe_reset")) {
      baseProfileData.last_recipe_reset = new Date().toISOString().split("T")[0]
    }

    console.log("📊 Creating profile with data:", baseProfileData)

    const { data, error } = await supabase.from("profiles").insert(baseProfileData).select().single()

    if (error) {
      console.error("❌ Profile creation error:", error)
      throw error
    }

    console.log("✅ Profile created successfully:", data)
    return data
  } catch (error) {
    console.error("❌ Profile creation failed:", error)
    throw error
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = getSupabaseClient()

  console.log("🔄 Starting signup process for:", email)

  const userExists = await checkUserExists(email)
  if (userExists) {
    throw new Error("An account with this email already exists. Please sign in instead.")
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: undefined,
    },
  })

  console.log("📝 Signup response:", { data, error })

  if (error) {
    console.error("❌ Signup error:", error)
    if (error.message.includes("already registered")) {
      throw new Error("An account with this email already exists. Please sign in instead.")
    }
    throw error
  }

  if (data.user) {
    console.log("👤 User created, creating profile...")
    await createUserProfile(data.user, fullName)
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
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Invalid email or password. Please check your credentials and try again.")
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Please check your email and click the confirmation link before signing in.")
    }
    throw error
  }

  // Check if profile exists, create if missing
  if (data.user) {
    console.log("✅ Sign in successful, checking profile...")
    await ensureProfileExists(data.user)
  }

  return data
}

// Helper function to ensure profile exists
async function ensureProfileExists(user: User): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  try {
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (existingProfile) {
      console.log("✅ Profile already exists:", existingProfile)
      return existingProfile
    }

    if (fetchError && fetchError.code === "PGRST116") {
      // Profile doesn't exist, create it
      console.log("📝 Profile not found, creating new profile...")
      return await createUserProfile(user)
    }

    console.error("❌ Error checking profile:", fetchError)
    return null
  } catch (error) {
    console.error("❌ Ensure profile exists failed:", error)
    return null
  }
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
  clearLastPath()
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

      if (error.code === "PGRST116") {
        console.log("📝 Profile not found, attempting to create...")
        const user = await getCurrentUser()
        if (user) {
          return await ensureProfileExists(user)
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

// Force create profile for existing user
export async function forceCreateProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("No user found")
  }

  console.log("🔧 Force creating profile for user:", user.email)
  return await createUserProfile(user)
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile !== null
}

export function setLastPath(path: string) {
  if (typeof window !== "undefined") {
    const authPaths = ["/auth-test", "/onboarding", "/login", "/signup"]
    if (!authPaths.some((authPath) => path.startsWith(authPath))) {
      localStorage.setItem("lastPath", path)
      console.log("📍 Stored last path:", path)
    }
  }
}

export function getLastPath(): string {
  if (typeof window !== "undefined") {
    const lastPath = localStorage.getItem("lastPath") || "/dashboard"
    console.log("📍 Retrieved last path:", lastPath)
    return lastPath
  }
  return "/dashboard"
}

export function clearLastPath() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lastPath")
    console.log("📍 Cleared last path")
  }
}
