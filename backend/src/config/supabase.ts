import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Fallback values keep the server bootable before the .env is filled in.
const url = env.supabaseUrl || 'http://localhost:54321'
const anonKey = env.supabaseAnonKey || 'missing-anon-key'
const serviceRoleKey = env.supabaseServiceRoleKey || 'missing-service-role-key'

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}

/** Client used for public operations and JWT validation. */
export const supabaseAnon = createClient(url, anonKey, clientOptions)

/** Client used for privileged operations (admin bootstrap, storage, CRUD). */
export const supabaseAdmin = createClient(url, serviceRoleKey, clientOptions)
