import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Optional Supabase client for direct queries (e.g. Storage public URLs).
 * Authentication goes through the backend API, so this is not required.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null
