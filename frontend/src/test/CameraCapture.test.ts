import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CameraCapture } from '@/services/camera'

const mockTrack = {
  stop: vi.fn(),
  getCapabilities: vi.fn().mockReturnValue({}),
  applyConstraints: vi.fn().mockResolvedValue(undefined),
}

const mockStream = {
  getTracks: vi.fn().mockReturnValue([mockTrack]),
  getVideoTracks: vi.fn().mockReturnValue([mockTrack]),
}

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn().mockReturnValue({
    drawImage: vi.fn(),
  }),
  toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,/9j/testdata'),
}

beforeEach(() => {
  vi.clearAllMocks()

  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
    },
    writable: true,
  })

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement
    if (tag === 'video') {
      return {
        srcObject: null,
        muted: false,
        playsInline: false,
        readyState: 4,
        play: vi.fn().mockResolvedValue(undefined),
      } as unknown as HTMLVideoElement
    }
    return document.createElement(tag)
  })
})

describe('CameraCapture', () => {
  it('isActive returns false before start', () => {
    const cam = new CameraCapture(vi.fn())
    expect(cam.isActive()).toBe(false)
  })

  it('isActive returns true after start', async () => {
    const cam = new CameraCapture(vi.fn())
    await cam.start()
    expect(cam.isActive()).toBe(true)
  })

  it('requests rear camera with environment facingMode', async () => {
    const cam = new CameraCapture(vi.fn())
    await cam.start()
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({ facingMode: 'environment' }),
      })
    )
  })

  it('isActive returns false after stop', async () => {
    const cam = new CameraCapture(vi.fn())
    await cam.start()
    cam.stop()
    expect(cam.isActive()).toBe(false)
  })

  it('stop releases all media tracks', async () => {
    const cam = new CameraCapture(vi.fn())
    await cam.start()
    cam.stop()
    expect(mockTrack.stop).toHaveBeenCalled()
  })

  it('attaches stream to provided videoRef', async () => {
    const videoEl = {
      srcObject: null,
      readyState: 4,
    }
    const videoRef = { current: videoEl as unknown as HTMLVideoElement }
    const cam = new CameraCapture(vi.fn())
    await cam.start(videoRef)
    expect(videoEl.srcObject).toBe(mockStream)
  })

  it('calls onFrame callback on interval tick', async () => {
    vi.useFakeTimers()
    const onFrame = vi.fn()
    const cam = new CameraCapture(onFrame)
    await cam.start()
    vi.advanceTimersByTime(1000)
    // onFrame should have been called once after 1s
    expect(onFrame).toHaveBeenCalledTimes(1)
    expect(onFrame).toHaveBeenCalledWith('/9j/testdata', 'image/jpeg')
    vi.useRealTimers()
  })
})
