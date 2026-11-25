import { NextFunction, Request, Response } from 'express'
import { supabaseAnon } from '../config/supabase'
import { ApiError } from '../utils/http'
import type { AppRole } from '../types/express'

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing bearer token')
    }

    const token = header.slice('Bearer '.length)
    const { data, error } = await supabaseAnon.auth.getUser(token)

    if (error || !data.user) {
      throw new ApiError(401, 'Invalid or expired token')
    }

    req.user = data.user
    req.role = resolveRole(data.user.app_metadata?.role)
    next()
  } catch (err) {
    next(err)
  }
}

export function resolveRole(rawRole: unknown): AppRole {
  return rawRole === 'admin' ? 'admin' : 'customer'
}
