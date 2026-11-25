import 'dotenv/config'

function optional(name: string): string {
  return process.env[name] ?? ''
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: optional('SUPABASE_URL'),
  supabaseAnonKey: optional('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseProjectId: optional('SUPABASE_PROJECT_ID'),
  adminBootstrapSecret: optional('ADMIN_BOOTSTRAP_SECRET'),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no está configurado. Completa SUPABASE_URL y SUPABASE_ANON_KEY en backend/.env',
    )
  }
}
