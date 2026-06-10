import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock Firebase Admin before importing the middleware
vi.mock('../services/firebaseAdmin.js', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
}))

const { requireAuth } = await import('../middleware/auth.js')
const { adminAuth } = await import('../services/firebaseAdmin.js')

const app = express()
app.use(express.json())
app.get('/protected', requireAuth, (req, res) => {
  const { userId, userEmail } = req as typeof req & { userId: string; userEmail: string }
  res.json({ userId, userEmail })
})

describe('requireAuth middleware', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/protected')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/missing/i)
  })

  it('returns 401 when token is invalid', async () => {
    vi.mocked(adminAuth.verifyIdToken).mockRejectedValueOnce(new Error('Invalid token'))
    const res = await request(app).get('/protected').set('Authorization', 'Bearer bad-token')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/invalid/i)
  })

  it('attaches userId and userEmail when token is valid', async () => {
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValueOnce({
      uid: 'user-abc',
      email: 'user@aura.app',
    } as never)

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.userId).toBe('user-abc')
    expect(res.body.userEmail).toBe('user@aura.app')
  })
})
