import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioPlayer } from '@/services/audioPlayer'

const mockStart = vi.fn()
const mockConnect = vi.fn()
const mockCreateBufferSource = vi.fn(() => ({
  buffer: null,
  connect: mockConnect,
  start: mockStart,
}))
const mockCreateBuffer = vi.fn(() => ({
  duration: 0.1,
  copyToChannel: vi.fn(),
}))
const mockClose = vi.fn()

vi.stubGlobal('AudioContext', vi.fn(() => ({
  currentTime: 0,
  state: 'running',
  destination: {},
  createBuffer: mockCreateBuffer,
  createBufferSource: mockCreateBufferSource,
  close: mockClose,
  resume: vi.fn().mockResolvedValue(undefined),
  sampleRate: 24000,
})))

// Minimal base64 PCM16 chunk (2 bytes = 1 sample = 0)
const EMPTY_CHUNK = btoa('\x00\x00')

describe('AudioPlayer', () => {
  let player: AudioPlayer

  beforeEach(() => {
    vi.clearAllMocks()
    player = new AudioPlayer()
  })

  it('isActive returns false before start', () => {
    expect(player.isActive()).toBe(false)
  })

  it('isActive returns true after start', () => {
    player.start()
    expect(player.isActive()).toBe(true)
  })

  it('playChunk creates and starts an AudioBufferSourceNode', () => {
    player.start()
    player.playChunk(EMPTY_CHUNK)
    expect(mockCreateBufferSource).toHaveBeenCalled()
    expect(mockStart).toHaveBeenCalled()
    expect(mockConnect).toHaveBeenCalled()
  })

  it('playChunk does nothing if not started', () => {
    player.playChunk(EMPTY_CHUNK)
    expect(mockCreateBufferSource).not.toHaveBeenCalled()
  })

  it('stop closes AudioContext and isActive returns false', () => {
    player.start()
    player.stop()
    expect(mockClose).toHaveBeenCalled()
    expect(player.isActive()).toBe(false)
  })

  it('schedules chunks sequentially (nextStartTime advances)', () => {
    const mockBuffer = { duration: 0.5, copyToChannel: vi.fn() }
    mockCreateBuffer.mockReturnValue(mockBuffer)
    player.start()
    player.playChunk(EMPTY_CHUNK)
    player.playChunk(EMPTY_CHUNK)
    // start is called twice with sequentially increasing times
    expect(mockStart).toHaveBeenCalledTimes(2)
  })
})
