import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Client for client-side operations (RLS enforced)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Server-side client (bypasses RLS) - only available on server
export const supabaseAdmin = null 