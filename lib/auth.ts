import { getSupabaseClient } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  subscription_tier: "free" | "premium"
  subscription_status: "active" | "canceled" | "past_due"
  subscription_end_date?: string
  recipes_generated_this_month: number
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

// Helper function to create user profile with exact schema
async function createUserProfile(user: User, fullName?: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()

  try {
    // Profile data matching your exact schema
    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: fullName || user.user_metadata?.full_name || user.email!.split("@")[0],
      subscription_tier: "free" as const,
      subscription_status: "active" as const,
      recipes_generated_this_month: 0,
      last_recipe_reset: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("📊 Creating profile with data:", profileData)

    const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

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
      emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  if (data.user && !data.session) {
    console.log("📧 User created, email verification required")
    // Don't create profile yet - wait for email verification
    return data
  }

  if (data.user && data.session) {
    console.log("👤 User created and confirmed, creating profile...")
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
      throw new Error("Please check your email and click the verification link before signing in.")
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
        console.log("📝 Profile not found")
        return null
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
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  })

  if (error) throw error
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
