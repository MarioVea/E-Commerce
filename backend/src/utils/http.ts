import { NextFunction, Request, RequestHandler, Response } from 'express'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export function asyncHandler(handler: AsyncRoute): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
