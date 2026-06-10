import type { ClientMessage, ServerMessage, ConnectionStatusWire } from '@/types/websocket'

export type ServerMessageHandler = (msg: ServerMessage) => void

const WS_URL = import.meta.env.VITE_API_URL?.replace(/^http/, 'ws') ?? 'ws://localhost:3001'

export class AuraWebSocketClient {
  private ws: WebSocket | null = null
  private onMessage: ServerMessageHandler
  private onClose: (() => void) | null = null
  private onOpen: (() => void) | null = null

  constructor(onMessage: ServerMessageHandler) {
    this.onMessage = onMessage
  }

  connect(token: string, handlers?: { onOpen?: () => void; onClose?: () => void }): void {
    this.onOpen = handlers?.onOpen ?? null
    this.onClose = handlers?.onClose ?? null

    const url = `${WS_URL}/ws?token=${encodeURIComponent(token)}`
    this.ws = new WebSocket(url)

    this.ws.onopen = () => this.onOpen?.()

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage
        this.onMessage(msg)
      } catch {
        console.error('Failed to parse server message')
      }
    }

    this.ws.onclose = () => this.onClose?.()

    this.ws.onerror = () => {
      this.onMessage({ type: 'error', message: 'WebSocket connection error' })
    }
  }

  send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
  }
}

// Re-export types for consumers
export type { ClientMessage, ServerMessage, ConnectionStatusWire }
