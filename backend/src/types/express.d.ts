import type { User } from '@supabase/supabase-js'

export type AppRole = 'customer' | 'admin'

declare global {
  namespace Express {
    interface Request {
      user?: User
      role?: AppRole
    }
  }
}

export {}
