import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  console.log("🔄 Auth callback:", { code: !!code, type })

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.user) {
        console.log("✅ Email verified for user:", data.user.email)

        // Create profile if it doesn't exist
        const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

        if (!existingProfile) {
          console.log("📝 Creating profile after email verification...")
          const profileData = {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
            subscription_tier: "free" as const,
            subscription_status: "active" as const,
            recipes_generated_this_month: 0,
            last_recipe_reset: new Date().toISOString().split("T")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: profileError } = await supabase.from("profiles").insert(profileData)

          if (profileError) {
            console.error("❌ Profile creation error:", profileError)
          } else {
            console.log("✅ Profile created successfully")
          }
        }

        // Redirect based on type
        if (type === "recovery") {
          return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }
      }
    } catch (error) {
      console.error("❌ Auth callback exception:", error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
