import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time or if env vars aren't set, return a mock client
  // This prevents crashes but operations will fail gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables. Using placeholder client. Some features may not work.")
    // Return a client with placeholder values - operations will fail but won't crash
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
