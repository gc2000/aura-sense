import { GoogleGenAI, Modality, StartSensitivity, EndSensitivity, type Session } from '@google/genai'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import type { SessionConfig, ServerMessage } from '../types/websocket.js'

const tracer = trace.getTracer('aura-gemini')

export type GeminiMessageHandler = (msg: ServerMessage) => void

const GEMINI_LIVE_MODEL = 'gemini-3.1-flash-live-preview'

// Maps our voice style labels to Gemini voice names
const VOICE_NAME_MAP: Record<string, string> = {
  Zephyr: 'Zephyr',
  Kore: 'Kore',
  Puck: 'Puck',
  Charon: 'Charon',
  Fenrir: 'Fenrir',
}

export class GeminiLiveSession {
  private session: Session | null = null
  private onMessage: GeminiMessageHandler
  private closed = false

  constructor(onMessage: GeminiMessageHandler) {
    this.onMessage = onMessage
  }

  async connect(config: SessionConfig): Promise<void> {
    const span = tracer.startSpan('aura.gemini.connect')
    span.setAttribute('gemini.model', GEMINI_LIVE_MODEL)
    span.setAttribute('gemini.voice', VOICE_NAME_MAP[config.voiceModel] ?? 'Zephyr')
    span.setAttribute('gemini.internet_search', config.internetSearchEnabled)
    span.setAttribute('gemini.sub_agents_count', config.subAgents?.length ?? 0)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'GEMINI_API_KEY not set' })
      span.end()
      throw new Error('GEMINI_API_KEY is not set')
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } })

    const systemInstruction = buildSystemInstruction(config)
    const voiceName = VOICE_NAME_MAP[config.voiceModel] ?? 'Zephyr'

    // Enable Google Search grounding if any agent in the session has it on
    const searchEnabled =
      config.internetSearchEnabled ||
      (config.subAgents?.some(a => a.internetSearchEnabled) ?? false)

    span.setAttribute('gemini.search_grounding', searchEnabled)

    try {
    this.session = await ai.live.connect({
      model: GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: {
          automaticActivityDetection: {
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
          },
        },
        ...(searchEnabled && { tools: [{ googleSearch: {} }] }),
      },
      callbacks: {
        onopen: () => {
          console.info('Gemini Live: session opened')
          this.send({ type: 'connected' })
          this.send({ type: 'status', status: 'connected' })
        },
        onmessage: (message) => {
          console.info('Gemini Live: message received', JSON.stringify(message).slice(0, 200))
          this.handleGeminiMessage(message)
        },
        onerror: (err) => {
          console.error('Gemini Live error:', err)
          this.send({ type: 'error', message: 'Gemini connection error' })
          this.send({ type: 'status', status: 'error' })
        },
        onclose: (event) => {
          console.info('Gemini Live: session closed', JSON.stringify(event))
          if (!this.closed) {
            this.send({ type: 'disconnected' })
            this.send({ type: 'status', status: 'disconnected' })
          }
        },
      },
    })
      span.setStatus({ code: SpanStatusCode.OK })
    } catch (err) {
      span.recordException(err as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw err
    } finally {
      span.end()
    }
  }

  sendAudio(base64Data: string): void {
    this.session?.sendRealtimeInput({
      audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' },
    })
    this.send({ type: 'status', status: 'listening' })
  }

  sendText(content: string, silent = false): void {
    this.session?.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: content }] }],
      turnComplete: true,
    })
    if (!silent) {
      this.send({ type: 'transcript', content, role: 'user' })
    }
    this.send({ type: 'status', status: 'processing' })
  }

  sendVideoFrame(base64Data: string, mimeType: string): void {
    this.session?.sendRealtimeInput({
      video: { data: base64Data, mimeType },
    })
  }

  disconnect(): void {
    this.closed = true
    this.session?.close()
    this.session = null
  }

  private send(msg: ServerMessage): void {
    try {
      this.onMessage(msg)
    } catch {
      // handler may have been removed — ignore
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleGeminiMessage(message: any): void {
    // Audio response
    if (message.data) {
      this.send({ type: 'audio', data: message.data })
      this.send({ type: 'status', status: 'responding' })
    }

    // Text / transcript parts
    const parts = message.serverContent?.modelTurn?.parts ?? []
    for (const part of parts) {
      if (part.text?.trim()) {
        this.send({ type: 'transcript', content: part.text.trim(), role: 'assistant' })
      }
    }

    // Turn completion
    if (message.serverContent?.turnComplete) {
      this.send({ type: 'status', status: 'connected' })
    }

    // Input transcript (user speech → text)
    const inputTranscript = message.serverContent?.inputTranscription
    if (inputTranscript?.text?.trim()) {
      this.send({ type: 'transcript', content: inputTranscript.text.trim(), role: 'user' })
    }

    // Output transcript — stream each chunk immediately
    const outputTranscript = message.serverContent?.outputTranscription
    if (outputTranscript?.text) {
      this.send({ type: 'transcript_delta', content: outputTranscript.text })
    }
  }
}

function buildSystemInstruction(config: SessionConfig): string {
  let instruction = config.systemInstruction

  if (config.linkedMemorySummary) {
    instruction += `\n\nPersonal Memory Context:\n${config.linkedMemorySummary}`
  }

  // Inject sub-agent personas so Gemini can soft-route by adopting their behaviour
  if (config.subAgents && config.subAgents.length > 0) {
    instruction += `\n\n## Specialist Modes\nYou have access to the following specialist modes. When the user's intent matches a specialist, seamlessly adopt that specialist's behaviour, tone, and focus — then return to your default role when the task is done. Do NOT announce the switch; just change your behaviour.\n`
    for (const agent of config.subAgents) {
      instruction += `\n### ${agent.name}\nRole: ${agent.description}\nBehaviour: ${agent.systemInstruction}`
      if (agent.linkedMemorySummary) {
        instruction += `\nRelevant Memory:\n${agent.linkedMemorySummary}`
      }
    }
  }

  // Safety rule always appended last
  instruction += `\n\nSafety Rule: Never present stored memory as real-time fact. Always say "your saved location is..." not "it is at...". For high-risk scenarios (steps, vehicles, road crossings), always instruct the user to stop and use their white cane.`

  return instruction
}
