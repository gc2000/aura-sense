// Captures microphone audio and converts to PCM16 @ 16kHz mono base64 chunks

const SAMPLE_RATE = 16000

export type AudioChunkCallback = (base64Chunk: string) => void
export type AudioLevelCallback = (level: number) => void

export class MicrophoneCapture {
  private stream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null
  private onChunk: AudioChunkCallback
  private onLevel?: AudioLevelCallback

  constructor(onChunk: AudioChunkCallback, onLevel?: AudioLevelCallback) {
    this.onChunk = onChunk
    this.onLevel = onLevel
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })

    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
    const source = this.audioContext.createMediaStreamSource(this.stream)

    // ScriptProcessorNode requires power-of-2 buffer size; 2048 = ~128ms at 16kHz
    const bufferSize = 2048
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1)

    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0)
      const pcm16 = float32ToPCM16(input)
      const base64 = arrayBufferToBase64(pcm16.buffer)
      this.onChunk(base64)

      if (this.onLevel) {
        let sum = 0
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
        const rms = Math.sqrt(sum / input.length)
        this.onLevel(Math.min(1, rms * 12))
      }
    }

    source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)
  }

  stop(): void {
    this.processor?.disconnect()
    this.processor = null
    this.audioContext?.close()
    this.audioContext = null
    this.stream?.getTracks().forEach(t => t.stop())
    this.stream = null
  }

  isActive(): boolean {
    return this.stream !== null
  }
}

function float32ToPCM16(float32: Float32Array): Int16Array {
  const pcm = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]))
    pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }
  return pcm
}

function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
