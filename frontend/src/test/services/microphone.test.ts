import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MicrophoneCapture } from '@/services/microphone'

// Mock browser APIs
const mockStop = vi.fn()
const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: mockStop }],
})

const mockConnect = vi.fn()
const mockDisconnect = vi.fn()
const mockCreateMediaStreamSource = vi.fn().mockReturnValue({ connect: mockConnect })
const mockCreateScriptProcessor = vi.fn().mockReturnValue({
  connect: vi.fn(),
  disconnect: mockDisconnect,
  onaudioprocess: null,
})
const mockClose = vi.fn()

vi.stubGlobal('navigator', {
  mediaDevices: { getUserMedia: mockGetUserMedia },
})
vi.stubGlobal('AudioContext', vi.fn(() => ({
  currentTime: 0,
  sampleRate: 16000,
  createMediaStreamSource: mockCreateMediaStreamSource,
  createScriptProcessor: mockCreateScriptProcessor,
  destination: {},
  close: mockClose,
})))

describe('MicrophoneCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserMedia.mockResolvedValue({ getTracks: () => [{ stop: mockStop }] })
  })

  it('starts and calls getUserMedia with correct constraints', async () => {
    const mic = new MicrophoneCapture(vi.fn())
    await mic.start()
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: expect.objectContaining({ sampleRate: 16000, channelCount: 1 }),
    })
  })

  it('isActive returns true after start', async () => {
    const mic = new MicrophoneCapture(vi.fn())
    await mic.start()
    expect(mic.isActive()).toBe(true)
  })

  it('isActive returns false before start', () => {
    const mic = new MicrophoneCapture(vi.fn())
    expect(mic.isActive()).toBe(false)
  })

  it('stop disconnects processor and closes audio context', async () => {
    const mic = new MicrophoneCapture(vi.fn())
    await mic.start()
    mic.stop()
    expect(mockDisconnect).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalled()
    expect(mockStop).toHaveBeenCalled()
    expect(mic.isActive()).toBe(false)
  })
})
