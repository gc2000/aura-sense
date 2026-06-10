import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import type { Request } from 'express'

export const authRouter = Router()

// Returns the authenticated user's id and email — used by the frontend to confirm token validity
authRouter.get('/me', requireAuth, (req: Request, res) => {
  const { userId, userEmail } = req as AuthenticatedRequest
  res.json({ userId, userEmail })
})
