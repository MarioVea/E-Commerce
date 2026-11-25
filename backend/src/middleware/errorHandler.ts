import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/http'

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' })
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.flatten() })
    return
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  console.error('[error]', err)
  res.status(500).json({ error: 'Internal server error' })
}
