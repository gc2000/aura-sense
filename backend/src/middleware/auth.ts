import type { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../services/firebaseAdmin.js'

export interface AuthenticatedRequest extends Request {
  userId: string
  userEmail: string
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    ;(req as AuthenticatedRequest).userId = decoded.uid
    ;(req as AuthenticatedRequest).userEmail = decoded.email ?? ''
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
