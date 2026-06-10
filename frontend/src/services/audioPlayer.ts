// Plays PCM16 @ 24kHz mono audio chunks received from Gemini Live API

const OUTPUT_SAMPLE_RATE = 24000

export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private nextStartTime = 0

  start(): void {
    this.audioContext = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE })
    // Resume immediately — must be called while user gesture is still active
    void this.audioContext.resume()
    this.nextStartTime = this.audioContext.currentTime
  }

  playChunk(base64Data: string): void {
    if (!this.audioContext) return

    console.log('AudioPlayer state:', this.audioContext.state, 'currentTime:', this.audioContext.currentTime)

    // Resume context if suspended (Chrome autoplay policy)
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume()
    }

    const pcm16 = base64ToInt16Array(base64Data)
    const float32 = pcm16ToFloat32(pcm16)

    const buffer = this.audioContext.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE)
    buffer.copyToChannel(float32 as Float32Array<ArrayBuffer>, 0)

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)

    // Schedule chunks sequentially — avoids gaps and overlap
    const startAt = Math.max(this.nextStartTime, this.audioContext.currentTime)
    source.start(startAt)
    this.nextStartTime = startAt + buffer.duration
  }

  stop(): void {
    this.audioContext?.close()
    this.audioContext = null
    this.nextStartTime = 0
  }

  isActive(): boolean {
    return this.audioContext !== null
  }
}

function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Int16Array(bytes.buffer)
}

function pcm16ToFloat32(pcm: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm.length)
  for (let i = 0; i < pcm.length; i++) {
    float32[i] = pcm[i] / (pcm[i] < 0 ? 0x8000 : 0x7fff)
  }
  return float32
}
