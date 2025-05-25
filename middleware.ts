import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If accessing protected route without session, redirect to home with auth modal
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/", req.url)
    redirectUrl.searchParams.set("auth", "signin")
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing onboarding but already has session, check if profile exists
  if (req.nextUrl.pathname === "/onboarding" && session) {
    try {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.user.id).single()

      // If profile exists and user is trying to access onboarding directly, redirect to dashboard
      if (profile && !req.nextUrl.searchParams.get("force")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    } catch (error) {
      // Profile doesn't exist, allow access to onboarding
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/onboarding/:path*"],
}
