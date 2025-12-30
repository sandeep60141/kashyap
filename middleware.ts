import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    },
  )

  console.log("🔍 Middleware checking:", req.nextUrl.pathname)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("👤 Session status:", session ? "authenticated" : "not authenticated")

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/profile"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // If accessing protected route without session, redirect to home with auth modal
    if (isProtectedRoute && !session) {
      console.log("🚫 Protected route without session, redirecting to auth")
      const redirectUrl = new URL("/", req.url)
      redirectUrl.searchParams.set("auth", "signin")
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing profile with session, check if profile exists
    if (req.nextUrl.pathname === "/profile" && session) {
      try {
        console.log("🔍 Checking profile exists for user:", session.user.id)
        const { data: profile, error } = await supabase.from("profiles").select("id").eq("id", session.user.id).single()

        if (error && error.code === "PGRST116") {
          console.log("❌ No profile found, redirecting to onboarding")
          return NextResponse.redirect(new URL("/onboarding", req.url))
        }

        if (profile) {
          console.log("✅ Profile exists, allowing access to profile page")
        }
      } catch (error) {
        console.error("❌ Error checking profile:", error)
        // Allow access anyway, let the page handle it
      }
    }

    // If accessing onboarding but already has session, check if profile exists
    if (req.nextUrl.pathname === "/onboarding" && session) {
      try {
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.user.id).single()

        // If profile exists and user is trying to access onboarding directly, redirect to dashboard
        if (profile && !req.nextUrl.searchParams.get("force")) {
          console.log("✅ Profile exists, redirecting from onboarding to dashboard")
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      } catch (error) {
        // Profile doesn't exist, allow access to onboarding
        console.log("📝 No profile found, allowing onboarding access")
      }
    }

    console.log("✅ Middleware allowing request to:", req.nextUrl.pathname)
    return res
  } catch (error) {
    console.error("❌ Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/onboarding/:path*"],
}
