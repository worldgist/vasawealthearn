import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access to auth pages only
  if (!supabaseUrl || !supabaseAnonKey) {
    const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"]
    const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
    
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Auth routes (login, signup, verify-email)
  const authRoutes = ["/login", "/signup", "/verify-email"]
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  // Admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

  if (isProtectedRoute && !user) {
    // Redirect to login if not authenticated
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Allow access to auth routes even if user is authenticated
  // Users can still access login/signup pages even when logged in
  // (They might want to switch accounts or create a new account)

  // Handle email verification callback (for link-based verification - legacy)
  if (request.nextUrl.searchParams.has("token_hash") && request.nextUrl.searchParams.has("type")) {
    const tokenHash = request.nextUrl.searchParams.get("token_hash")
    const type = request.nextUrl.searchParams.get("type")

    if (type === "email" && tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      })

      if (!error) {
        // Email verified successfully, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  // Note: OTP verification (6-digit code) is handled on the verify-email page
  // Users enter the code manually, so no automatic redirect is needed here

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

