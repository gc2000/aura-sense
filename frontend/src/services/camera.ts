// Captures video frames from the device camera at 1 FPS and encodes as JPEG base64

export type VideoFrameCallback = (base64: string, mimeType: string) => void

const FRAME_INTERVAL_MS = 1000 // 1 FPS
const JPEG_QUALITY = 0.7
const FRAME_WIDTH = 640
const FRAME_HEIGHT = 480

export class CameraCapture {
  private stream: MediaStream | null = null
  private videoEl: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private onFrame: VideoFrameCallback

  constructor(onFrame: VideoFrameCallback) {
    this.onFrame = onFrame
  }

  async start(videoRef?: React.RefObject<HTMLVideoElement>): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // rear camera on mobile
        width: { ideal: FRAME_WIDTH },
        height: { ideal: FRAME_HEIGHT },
      },
    })

    // Try to set minimum zoom for widest field of view (device-dependent)
    const track = this.stream.getVideoTracks()[0]
    if (track) {
      const caps = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number } }
      if (caps.zoom) {
        await track.applyConstraints({ advanced: [{ zoom: caps.zoom.min } as MediaTrackConstraintSet] }).catch(() => {})
      }
    }

    // Attach stream to provided video element for preview
    if (videoRef?.current) {
      videoRef.current.srcObject = this.stream
      this.videoEl = videoRef.current
    } else {
      // Hidden video element just for frame capture
      this.videoEl = document.createElement('video')
      this.videoEl.srcObject = this.stream
      this.videoEl.muted = true
      this.videoEl.playsInline = true
      await this.videoEl.play()
    }

    this.canvas = document.createElement('canvas')
    this.canvas.width = FRAME_WIDTH
    this.canvas.height = FRAME_HEIGHT

    this.intervalId = setInterval(() => this.captureFrame(), FRAME_INTERVAL_MS)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.stream?.getTracks().forEach(t => t.stop())
    this.stream = null
    this.canvas = null
    this.videoEl = null
  }

  isActive(): boolean {
    return this.stream !== null
  }

  private captureFrame(): void {
    if (!this.videoEl || !this.canvas) return
    if (this.videoEl.readyState < 2 /* HAVE_CURRENT_DATA */) return

    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(this.videoEl, 0, 0, FRAME_WIDTH, FRAME_HEIGHT)
    const base64 = this.canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    // Strip the data URL prefix — Gemini expects raw base64
    const raw = base64.replace(/^data:image\/jpeg;base64,/, '')
    this.onFrame(raw, 'image/jpeg')
  }
}
