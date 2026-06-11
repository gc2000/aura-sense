import 'dotenv/config'
import './tracing.js'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { healthRouter } from './routes/health.js'
import { authRouter } from './routes/auth.js'
import { memoriesRouter } from './routes/memories.js'
import { setupWebSocketServer } from './services/websocketServer.js'

const app = express()
const PORT = process.env.PORT ?? 3001
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/memories', memoriesRouter)

// ─── 404 handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────

const httpServer = createServer(app)

setupWebSocketServer(httpServer)

httpServer.listen(PORT, () => {
  console.info(`Aura backend running on http://localhost:${PORT}`)
  console.info(`WebSocket server ready at ws://localhost:${PORT}/ws`)
})

export { app, httpServer }
