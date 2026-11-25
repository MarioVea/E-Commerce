import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/http'
import type { AppRole } from '../types/express'

export function requireRole(role: AppRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'))
      return
    }

    if (req.role !== role) {
      next(new ApiError(403, 'Insufficient permissions'))
      return
    }

    next()
  }
}
