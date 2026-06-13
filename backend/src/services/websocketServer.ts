import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage, Server } from 'http'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { GeminiLiveSession } from './geminiLive.js'
import { adminAuth } from './firebaseAdmin.js'
import type { ClientMessage, ServerMessage } from '../types/websocket.js'

const tracer = trace.getTracer('aura-websocket')

export function setupWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const sessionSpan = tracer.startSpan('aura.websocket.session')
    let gemini: GeminiLiveSession | null = null
    let userId: string | null = null
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null
    let userDisconnecting = false

    function startHeartbeat() {
      stopHeartbeat()
      heartbeatInterval = setInterval(() => {
        sendToClient(ws, { type: 'heartbeat' })
      }, 30_000)
    }

    function stopHeartbeat() {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
        heartbeatInterval = null
      }
    }

    // ── Authenticate via query token ──────────────────────────────────────────
    const url = new URL(req.url ?? '', `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
      sendToClient(ws, { type: 'error', message: 'Missing auth token' })
      ws.close(1008, 'Unauthorized')
      return
    }

    adminAuth
      .verifyIdToken(token)
      .then(decoded => {
        userId = decoded.uid
        sessionSpan.setAttribute('user.id', userId)
      })
      .catch((err: unknown) => {
        console.error('[WS auth] verifyIdToken failed:', err)
        sessionSpan.recordException(err as Error)
        sessionSpan.setStatus({ code: SpanStatusCode.ERROR, message: 'Auth failed' })
        sessionSpan.end()
        sendToClient(ws, { type: 'error', message: 'Invalid auth token' })
        ws.close(1008, 'Unauthorized')
      })

    // ── Message handling ──────────────────────────────────────────────────────
    ws.on('message', async (raw) => {
      if (!userId) return // not yet authenticated

      let msg: ClientMessage
      try {
        msg = JSON.parse(raw.toString()) as ClientMessage
      } catch {
        sendToClient(ws, { type: 'error', message: 'Invalid message format' })
        return
      }

      switch (msg.type) {
        case 'connect': {
          if (gemini) gemini.disconnect()

          sessionSpan.addEvent('gemini_connect_requested', {
            'gemini.internet_search': msg.config.internetSearchEnabled,
            'gemini.sub_agents_count': msg.config.subAgents?.length ?? 0,
          })

          gemini = new GeminiLiveSession(serverMsg => {
            sendToClient(ws, serverMsg)
            // When Gemini closes unexpectedly (not by user), close the WS so the
            // frontend auto-reconnect mechanism kicks in and restores the session.
            if (serverMsg.type === 'disconnected' && !userDisconnecting) {
              stopHeartbeat()
              ws.close(1011, 'Gemini session closed unexpectedly')
            }
          })
          sendToClient(ws, { type: 'status', status: 'connecting' })

          try {
            await gemini.connect(msg.config)
            sessionSpan.addEvent('gemini_connect_success')
            startHeartbeat()
          } catch (err) {
            console.error('Gemini connect error:', err)
            sessionSpan.recordException(err as Error)
            sessionSpan.addEvent('gemini_connect_failed')
            sendToClient(ws, { type: 'error', message: 'Failed to connect to Gemini' })
            sendToClient(ws, { type: 'status', status: 'error' })
            gemini = null
          }
          break
        }

        case 'audio': {
          gemini?.sendAudio(msg.data)
          break
        }

        case 'video_frame': {
          gemini?.sendVideoFrame(msg.data, msg.mimeType)
          break
        }

        case 'text': {
          // Internal greeting trigger — silent, not shown in conversation
          if (msg.content === '__greet__') {
            gemini?.sendText('Please greet the user now based on your role and personality.', true)
          } else {
            gemini?.sendText(msg.content)
          }
          break
        }

        case 'disconnect': {
          userDisconnecting = true
          stopHeartbeat()
          gemini?.disconnect()
          gemini = null
          sendToClient(ws, { type: 'disconnected' })
          sendToClient(ws, { type: 'status', status: 'disconnected' })
          userDisconnecting = false
          break
        }
      }
    })

    // ── Cleanup ───────────────────────────────────────────────────────────────
    ws.on('close', () => {
      sessionSpan.addEvent('session_closed')
      sessionSpan.end()
      stopHeartbeat()
      gemini?.disconnect()
      gemini = null
    })

    ws.on('error', (err) => {
      console.error('WebSocket error:', err)
      sessionSpan.recordException(err)
      sessionSpan.setStatus({ code: SpanStatusCode.ERROR })
      sessionSpan.end()
      stopHeartbeat()
      gemini?.disconnect()
      gemini = null
    })
  })

  return wss
}

function sendToClient(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}
