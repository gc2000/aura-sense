import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { GeminiLiveSession } from '../services/geminiLive.js'
import type { ServerMessage } from '../types/websocket.js'

// Mock the GoogleGenAI SDK
vi.mock('@google/genai', () => {
  const mockSession = {
    sendRealtimeInput: vi.fn(),
    sendClientContent: vi.fn(),
    close: vi.fn(),
  }
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      live: {
        connect: vi.fn().mockResolvedValue(mockSession),
      },
    })),
    Modality: { AUDIO: 'AUDIO' },
    StartSensitivity: { START_SENSITIVITY_HIGH: 'START_SENSITIVITY_HIGH' },
    EndSensitivity: { END_SENSITIVITY_LOW: 'END_SENSITIVITY_LOW' },
  }
})

const SESSION_CONFIG = {
  systemInstruction: 'You are Aura, a helpful assistant.',
  voiceModel: 'Zephyr',
  voiceStyle: 'brief_direct',
  internetSearchEnabled: false,
}

async function createConnectedSession(handler: (msg: ServerMessage) => void) {
  process.env.GEMINI_API_KEY = 'test-key'
  const session = new GeminiLiveSession(handler)
  await session.connect(SESSION_CONFIG)
  return session
}

describe('GeminiLiveSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY
    const session = new GeminiLiveSession(vi.fn())
    await expect(session.connect(SESSION_CONFIG)).rejects.toThrow('GEMINI_API_KEY is not set')
  })

  it('connects and calls onMessage with connected + status', async () => {
    const handler = vi.fn()
    const { GoogleGenAI } = await import('@google/genai')
    const mockConnect = vi.fn(({ callbacks }) => {
      callbacks.onopen()
      return Promise.resolve({ sendRealtimeInput: vi.fn(), sendClientContent: vi.fn(), close: vi.fn() })
    })
    ;(GoogleGenAI as unknown as Mock).mockImplementationOnce(() => ({
      live: { connect: mockConnect },
    }))

    await createConnectedSession(handler)

    expect(handler).toHaveBeenCalledWith({ type: 'connected' })
    expect(handler).toHaveBeenCalledWith({ type: 'status', status: 'connected' })
  })

  it('sendAudio sends realtime input and emits listening status', async () => {
    const handler = vi.fn()
    const { GoogleGenAI } = await import('@google/genai')
    const mockSendRealtime = vi.fn()
    ;(GoogleGenAI as unknown as Mock).mockImplementationOnce(() => ({
      live: {
        connect: vi.fn().mockResolvedValue({
          sendRealtimeInput: mockSendRealtime,
          sendClientContent: vi.fn(),
          close: vi.fn(),
        }),
      },
    }))

    const session = await createConnectedSession(handler)
    handler.mockClear()
    session.sendAudio('base64audiodata')

    expect(mockSendRealtime).toHaveBeenCalledWith({
      audio: { data: 'base64audiodata', mimeType: 'audio/pcm;rate=16000' },
    })
    expect(handler).toHaveBeenCalledWith({ type: 'status', status: 'listening' })
  })

  it('sendText sends client content and emits user transcript + processing status', async () => {
    const handler = vi.fn()
    const { GoogleGenAI } = await import('@google/genai')
    const mockSendContent = vi.fn()
    ;(GoogleGenAI as unknown as Mock).mockImplementationOnce(() => ({
      live: {
        connect: vi.fn().mockResolvedValue({
          sendRealtimeInput: vi.fn(),
          sendClientContent: mockSendContent,
          close: vi.fn(),
        }),
      },
    }))

    const session = await createConnectedSession(handler)
    handler.mockClear()
    session.sendText('Hello Aura')

    expect(mockSendContent).toHaveBeenCalledWith({
      turns: [{ role: 'user', parts: [{ text: 'Hello Aura' }] }],
      turnComplete: true,
    })
    expect(handler).toHaveBeenCalledWith({ type: 'transcript', content: 'Hello Aura', role: 'user' })
    expect(handler).toHaveBeenCalledWith({ type: 'status', status: 'processing' })
  })

  it('sendVideoFrame sends video realtime input', async () => {
    const handler = vi.fn()
    const { GoogleGenAI } = await import('@google/genai')
    const mockSendRealtime = vi.fn()
    ;(GoogleGenAI as unknown as Mock).mockImplementationOnce(() => ({
      live: {
        connect: vi.fn().mockResolvedValue({
          sendRealtimeInput: mockSendRealtime,
          sendClientContent: vi.fn(),
          close: vi.fn(),
        }),
      },
    }))

    const session = await createConnectedSession(handler)
    session.sendVideoFrame('framedata', 'image/jpeg')

    expect(mockSendRealtime).toHaveBeenCalledWith({
      video: { data: 'framedata', mimeType: 'image/jpeg' },
    })
  })

  it('disconnect closes session and stops emitting', async () => {
    const handler = vi.fn()
    const { GoogleGenAI } = await import('@google/genai')
    const mockClose = vi.fn()
    ;(GoogleGenAI as unknown as Mock).mockImplementationOnce(() => ({
      live: {
        connect: vi.fn(({ callbacks }) => {
          callbacks.onopen()
          return Promise.resolve({ sendRealtimeInput: vi.fn(), sendClientContent: vi.fn(), close: mockClose })
        }),
      },
    }))

    const session = await createConnectedSession(handler)
    handler.mockClear()
    session.disconnect()

    expect(mockClose).toHaveBeenCalled()
    // onclose fires but closed=true so no disconnected message
    expect(handler).not.toHaveBeenCalledWith({ type: 'disconnected' })
  })

  it('buildSystemInstruction appends memory context when provided', async () => {
    const handler = vi.fn()
    const { GoogleGenAI } = await import('@google/genai')
    let capturedConfig: unknown
    ;(GoogleGenAI as unknown as Mock).mockImplementationOnce(() => ({
      live: {
        connect: vi.fn((opts) => {
          capturedConfig = opts.config
          return Promise.resolve({ sendRealtimeInput: vi.fn(), sendClientContent: vi.fn(), close: vi.fn() })
        }),
      },
    }))

    process.env.GEMINI_API_KEY = 'test-key'
    const session = new GeminiLiveSession(handler)
    await session.connect({
      ...SESSION_CONFIG,
      linkedMemorySummary: '[Kitchen] keys: on the hook',
    })

    const cfg = capturedConfig as { systemInstruction: { parts: { text: string }[] } }
    const instruction = cfg.systemInstruction.parts[0].text
    expect(instruction).toContain('[Kitchen] keys: on the hook')
    expect(instruction).toContain('Safety Rule:')
  })
})
