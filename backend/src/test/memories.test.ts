import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock Firebase Admin
vi.mock('../services/firebaseAdmin.js', () => ({
  adminAuth: { verifyIdToken: vi.fn() },
  adminDb: {
    collection: vi.fn(),
  },
}))

const { adminAuth, adminDb } = await import('../services/firebaseAdmin.js')
const { memoriesRouter } = await import('../routes/memories.js')

const app = express()
app.use(express.json())
app.use('/api/memories', memoriesRouter)

const VALID_TOKEN = 'Bearer valid-token'
const USER_ID = 'user-test-123'

const SAMPLE_MEMORY = {
  id: 'mem-1',
  userId: USER_ID,
  name: 'Kitchen',
  description: '',
  memoryType: 'ItemLocation',
  key: 'keys',
  value: 'on the hook',
  assignedAgentIds: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  lastUsedAt: null,
}

function mockDocRef(data: Record<string, unknown> | null) {
  const doc = {
    exists: data !== null,
    id: data?.id ?? 'mem-1',
    data: () => data,
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue({
      exists: data !== null,
      id: data?.id ?? 'mem-1',
      data: () => data,
    }),
  }
  return doc
}

describe('Memory API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({ uid: USER_ID, email: 'test@aura.app' } as never)
  })

  describe('GET /api/memories', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/memories')
      expect(res.status).toBe(401)
    })

    it('returns list of memories for authenticated user', async () => {
      // doc.data() should NOT include 'id' — the route builds { id: doc.id, ...doc.data() }
      const { id: _omit, ...sampleData } = SAMPLE_MEMORY
      const snapshot = {
        docs: [{ id: 'mem-1', data: () => sampleData }],
      }
      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue(snapshot),
      } as never)

      const res = await request(app).get('/api/memories').set('Authorization', VALID_TOKEN)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0].id).toBe('mem-1')
    })
  })

  describe('POST /api/memories', () => {
    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/memories')
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'Kitchen' }) // missing memoryType, key, value
      expect(res.status).toBe(400)
    })

    it('creates a new memory and returns 201', async () => {
      vi.mocked(adminDb.collection).mockReturnValue({
        add: vi.fn().mockResolvedValue({ id: 'mem-new' }),
      } as never)

      const res = await request(app)
        .post('/api/memories')
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'Kitchen', memoryType: 'ItemLocation', key: 'keys', value: 'on the hook' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBe('mem-new')
      expect(res.body.userId).toBe(USER_ID)
      expect(res.body.key).toBe('keys')
    })
  })

  describe('PUT /api/memories/:id', () => {
    it('returns 404 when memory not found', async () => {
      vi.mocked(adminDb.collection).mockReturnValue({
        doc: vi.fn().mockReturnValue(mockDocRef(null)),
      } as never)

      const res = await request(app)
        .put('/api/memories/nonexistent')
        .set('Authorization', VALID_TOKEN)
        .send({ value: 'new value' })
      expect(res.status).toBe(404)
    })

    it('returns 404 when memory belongs to another user', async () => {
      vi.mocked(adminDb.collection).mockReturnValue({
        doc: vi.fn().mockReturnValue(mockDocRef({ ...SAMPLE_MEMORY, userId: 'other-user' })),
      } as never)

      const res = await request(app)
        .put('/api/memories/mem-1')
        .set('Authorization', VALID_TOKEN)
        .send({ value: 'new value' })
      expect(res.status).toBe(404)
    })

    it('updates memory fields and returns updated document', async () => {
      const updatedData = { ...SAMPLE_MEMORY, value: 'in the drawer', updatedAt: expect.any(String) }
      const docRef = {
        exists: true,
        id: 'mem-1',
        data: () => ({ ...SAMPLE_MEMORY }),
        update: vi.fn().mockResolvedValue(undefined),
        get: vi.fn()
          .mockResolvedValueOnce({ exists: true, data: () => SAMPLE_MEMORY })
          .mockResolvedValueOnce({ exists: true, id: 'mem-1', data: () => updatedData }),
      }
      vi.mocked(adminDb.collection).mockReturnValue({
        doc: vi.fn().mockReturnValue(docRef),
      } as never)

      const res = await request(app)
        .put('/api/memories/mem-1')
        .set('Authorization', VALID_TOKEN)
        .send({ value: 'in the drawer' })

      expect(res.status).toBe(200)
      expect(docRef.update).toHaveBeenCalledWith(expect.objectContaining({ value: 'in the drawer' }))
    })
  })

  describe('DELETE /api/memories/:id', () => {
    it('returns 404 when memory not found', async () => {
      vi.mocked(adminDb.collection).mockReturnValue({
        doc: vi.fn().mockReturnValue(mockDocRef(null)),
      } as never)

      const res = await request(app)
        .delete('/api/memories/nonexistent')
        .set('Authorization', VALID_TOKEN)
      expect(res.status).toBe(404)
    })

    it('deletes memory and returns 204', async () => {
      const docRef = mockDocRef({ ...SAMPLE_MEMORY })
      vi.mocked(adminDb.collection).mockReturnValue({
        doc: vi.fn().mockReturnValue(docRef),
      } as never)

      const res = await request(app)
        .delete('/api/memories/mem-1')
        .set('Authorization', VALID_TOKEN)

      expect(res.status).toBe(204)
      expect(docRef.delete).toHaveBeenCalled()
    })
  })
})
