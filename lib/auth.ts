import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    return null
  }

  return profile
}

/**
 * Check if user is authenticated and redirect if not
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    redirect("/verify-email")
  }

  return user
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  redirect("/login")
}



