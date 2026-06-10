import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { healthRouter } from '../routes/health.js'

const app = express()
app.use('/api/health', healthRouter)

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('aura-backend')
  })
})
