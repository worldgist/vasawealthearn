/**
 * Test Supabase connection
 * This can be used to verify Supabase is properly configured
 */

import { createClient } from "./client"

export async function testSupabaseConnection(): Promise<{
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const supabase = createClient()
    
    // Test connection by getting the current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to connect to Supabase",
      }
    }

    return {
      success: true,
      message: "Supabase connection successful",
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unknown error",
      message: "Failed to initialize Supabase client",
    }
  }
}



