import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuraWebSocketClient } from '@/services/websocketClient'
import type { ServerMessage } from '@/types/websocket'

// Minimal WebSocket mock
class MockWebSocket {
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  readyState = MockWebSocket.OPEN
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  sent: string[] = []
  send(data: string) { this.sent.push(data) }
  close() { this.readyState = MockWebSocket.CLOSED; this.onclose?.() }
}

let mockWs: MockWebSocket
const MockWebSocketConstructor = vi.fn((_url: string) => {
  mockWs = new MockWebSocket()
  return mockWs
}) as unknown as typeof WebSocket & { OPEN: number; CLOSING: number; CLOSED: number }
MockWebSocketConstructor.OPEN = 1
MockWebSocketConstructor.CLOSING = 2
MockWebSocketConstructor.CLOSED = 3
vi.stubGlobal('WebSocket', MockWebSocketConstructor)

describe('AuraWebSocketClient', () => {
  let client: AuraWebSocketClient
  let received: ServerMessage[]

  beforeEach(() => {
    received = []
    client = new AuraWebSocketClient(msg => received.push(msg))
  })

  it('connects and calls onOpen', () => {
    const onOpen = vi.fn()
    client.connect('token123', { onOpen })
    mockWs.onopen?.()
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('parses incoming server messages', () => {
    client.connect('token123')
    const msg: ServerMessage = { type: 'connected' }
    mockWs.onmessage?.({ data: JSON.stringify(msg) })
    expect(received).toHaveLength(1)
    expect(received[0].type).toBe('connected')
  })

  it('sends serialised ClientMessage when open', () => {
    client.connect('token123')
    client.send({ type: 'text', content: 'hello' })
    expect(mockWs.sent).toHaveLength(1)
    expect(JSON.parse(mockWs.sent[0])).toMatchObject({ type: 'text', content: 'hello' })
  })

  it('does not send when socket is not open', () => {
    client.connect('token123')
    mockWs.readyState = MockWebSocket.CLOSED
    client.send({ type: 'text', content: 'hello' })
    expect(mockWs.sent).toHaveLength(0)
  })

  it('reports error message on onerror', () => {
    client.connect('token123')
    mockWs.onerror?.()
    expect(received.some(m => m.type === 'error')).toBe(true)
  })

  it('calls onClose when socket closes', () => {
    const onClose = vi.fn()
    client.connect('token123', { onClose })
    mockWs.onclose?.()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('isOpen returns true when socket is open', () => {
    client.connect('token123')
    expect(client.isOpen()).toBe(true)
  })

  it('ignores malformed JSON without throwing', () => {
    client.connect('token123')
    expect(() => mockWs.onmessage?.({ data: '{bad json' })).not.toThrow()
  })

  it('disconnect closes the socket', () => {
    client.connect('token123')
    client.disconnect()
    expect(client.isOpen()).toBe(false)
  })
})
