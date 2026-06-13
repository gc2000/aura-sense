import { useState, useRef, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'
import type { AgentConfig, ConnectionStatus, ConversationMessage, PersonalMemory } from '@/types'
import type { SessionConfig, SubAgentConfig } from '@/types/websocket'
import { AuraWebSocketClient } from '@/services/websocketClient'
import { MicrophoneCapture } from '@/services/microphone'
import { AudioPlayer } from '@/services/audioPlayer'
import { VoiceAnnouncer } from '@/services/voiceAnnouncer'
import { CameraCapture } from '@/services/camera'
import { useAutoReconnect } from './useAutoReconnect'
import { getIdToken } from '@/services/auth'

function buildMemorySummary(agent: AgentConfig, memories: PersonalMemory[]): string | undefined {
  const linked = memories.filter(m =>
    agent.linkedMemoryCategoryIds.includes(m.name) &&
    !(m.key === 'note' && (m.value === 'Add items below' || m.value === 'Auto-created by voice trigger')),
  )
  return linked.length ? linked.map(m => `[${m.name}] ${m.key}: ${m.value}`).join('\n') : undefined
}

function buildSessionConfig(
  auraConfig: AgentConfig,
  subAgents: AgentConfig[],
  memories: PersonalMemory[],
): SessionConfig {
  const subAgentConfigs: SubAgentConfig[] = subAgents.map(agent => ({
    name: agent.name,
    description: agent.description,
    systemInstruction: agent.systemInstruction,
    linkedMemorySummary: buildMemorySummary(agent, memories),
    internetSearchEnabled: agent.internetSearchEnabled,
  }))

  return {
    systemInstruction: auraConfig.systemInstruction,
    voiceModel: auraConfig.voiceModel,
    voiceStyle: auraConfig.voiceStyle,
    internetSearchEnabled: auraConfig.internetSearchEnabled,
    linkedMemorySummary: buildMemorySummary(auraConfig, memories),
    subAgents: subAgentConfigs.length ? subAgentConfigs : undefined,
  }
}

function makeMessage(
  role: ConversationMessage['role'],
  content: string,
): ConversationMessage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    conversationId: 'live',
    role,
    content,
    language: 'en',
    modality: 'voice',
    relatedMemoryIds: [],
    timestamp: new Date().toISOString(),
  }
}

interface UseAuraSessionOptions {
  auraConfig: AgentConfig
  subAgents: AgentConfig[]
  memories: PersonalMemory[]
  videoRef?: RefObject<HTMLVideoElement>
  onStatusChange?: (status: ConnectionStatus) => void
}

export interface AuraSessionActions {
  connect: () => Promise<void>
  disconnect: () => void
  sendText: (text: string) => void
  sendVideoFrame: (base64: string, mimeType: string) => void
}

export function useAuraSession({
  auraConfig,
  subAgents,
  memories,
  videoRef,
  onStatusChange,
}: UseAuraSessionOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [messages, setMessages] = useState<ConversationMessage[]>([])

  const wsRef = useRef<AuraWebSocketClient | null>(null)
  const micRef = useRef<MicrophoneCapture | null>(null)
  const playerRef = useRef<AudioPlayer | null>(null)
  const audioLevelRef = useRef<number>(0)
  const cameraRef = useRef<CameraCapture | null>(null)
  const announcerRef = useRef<VoiceAnnouncer>(new VoiceAnnouncer())
  const mountedRef = useRef(true)
  const intentionalDisconnectRef = useRef(false)
  // Last config sent — used to reconnect Gemini without tearing down the WebSocket
  const lastConfigRef = useRef<import('@/types/websocket').SessionConfig | null>(null)

  const updateStatus = useCallback((s: ConnectionStatus) => {
    if (!mountedRef.current) return
    setStatus(s)
    announcerRef.current.announce(s)
    onStatusChange?.(s)
  }, [onStatusChange])

  const addMessage = useCallback((msg: ConversationMessage) => {
    if (!mountedRef.current) return
    setMessages(prev => [...prev, msg])
  }, [])

  // ── Auto-reconnect ────────────────────────────────────────────────────────
  const { start: startReconnect, cancel: cancelReconnect, reset: resetReconnect } = useAutoReconnect({
    onReconnect: () => {
      updateStatus('reconnecting')
      void doConnect()
    },
    onGiveUp: () => {
      updateStatus('error')
      addMessage(makeMessage('system', 'Connection failed after multiple retries.'))
    },
  })

  // ── Heartbeat monitoring ──────────────────────────────────────────────────
  const lastHeartbeatRef = useRef<number>(0)
  const heartbeatCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startHeartbeatMonitor = useCallback(() => {
    lastHeartbeatRef.current = Date.now()
    if (heartbeatCheckRef.current) clearInterval(heartbeatCheckRef.current)
    heartbeatCheckRef.current = setInterval(() => {
      if (!mountedRef.current) return
      const elapsed = Date.now() - lastHeartbeatRef.current
      if (elapsed > 75_000) {
        // Clear own interval before triggering reconnect to prevent re-entry
        clearInterval(heartbeatCheckRef.current!)
        heartbeatCheckRef.current = null
        addMessage(makeMessage('system', 'Connection lost. Reconnecting…'))
        wsRef.current?.disconnect()
        // onClose won't call startReconnect when stale status === 'disconnected',
        // so we trigger it explicitly here.
        startReconnect()
      }
    }, 15_000)
  }, [addMessage, startReconnect])

  const stopHeartbeatMonitor = useCallback(() => {
    if (heartbeatCheckRef.current) {
      clearInterval(heartbeatCheckRef.current)
      heartbeatCheckRef.current = null
    }
  }, [])

  // ── Core connect logic ────────────────────────────────────────────────────
  const doConnect = useCallback(async () => {
    let token: string | null
    try {
      token = await getIdToken()
    } catch {
      token = null
    }
    if (!token) {
      updateStatus('error')
      addMessage(makeMessage('system', 'Authentication failed. Please sign in again.'))
      return
    }

    // Tear down previous WS if any
    wsRef.current?.disconnect()

    const config = buildSessionConfig(auraConfig, subAgents, memories)
    lastConfigRef.current = config

    const ws = new AuraWebSocketClient((msg) => {
      if (!mountedRef.current) return

      console.log('WS msg received:', msg.type, msg.type === 'status' ? (msg as {type:'status';status:string}).status : '')

      switch (msg.type) {
        case 'connected':
          updateStatus('connected')
          resetReconnect()
          startHeartbeatMonitor()
          // Start mic + player
          if (!micRef.current?.isActive()) {
            const mic = new MicrophoneCapture(
              (chunk) => ws.send({ type: 'audio', data: chunk }),
              (level) => { audioLevelRef.current = level },
            )
            mic.start().catch((err: unknown) => {
              console.error('Microphone start error:', err)
              addMessage(makeMessage('system', 'Microphone access denied. You can still type.'))
            })
            micRef.current = mic
          }
          if (!playerRef.current?.isActive()) {
            playerRef.current = new AudioPlayer()
            playerRef.current.start()
          }
          // Start camera at 1 FPS
          if (!cameraRef.current?.isActive()) {
            const cam = new CameraCapture((frame, mimeType) => ws.send({ type: 'video_frame', data: frame, mimeType }))
            cam.start(videoRef).catch((err: unknown) => {
              console.warn('Camera not available:', err)
            })
            cameraRef.current = cam
          }
          // Trigger Aura to greet the user in her own voice
          ws.send({ type: 'text', content: '__greet__' })
          break

        case 'disconnected':
          updateStatus('disconnected')
          // Gemini closed unexpectedly — reconnect just the Gemini session without
          // tearing down the WebSocket (avoids the slow auto-reconnect backoff delay).
          if (!intentionalDisconnectRef.current && lastConfigRef.current && wsRef.current?.isOpen()) {
            setTimeout(() => {
              if (mountedRef.current && wsRef.current?.isOpen() && lastConfigRef.current) {
                ws.send({ type: 'connect', config: lastConfigRef.current })
              }
            }, 1500)
          }
          break

        case 'audio':
          playerRef.current?.playChunk(msg.data)
          break

        case 'heartbeat':
          lastHeartbeatRef.current = Date.now()
          break

        case 'transcript':
          addMessage(makeMessage(
            msg.role === 'user' ? 'user' : 'assistant',
            msg.content,
          ))
          break

        case 'transcript_delta':
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: last.content + msg.content }]
            }
            return [...prev, makeMessage('assistant', msg.content)]
          })
          break

        case 'status':
          updateStatus(msg.status as ConnectionStatus)
          break

        case 'error':
          addMessage(makeMessage('system', `Error: ${msg.message}`))
          updateStatus('error')
          break
      }
    })

    wsRef.current = ws

    ws.connect(token, {
      onOpen: () => ws.send({ type: 'connect', config }),
      onClose: () => {
        // Use ref instead of captured status to avoid stale-closure bug
        if (mountedRef.current && !intentionalDisconnectRef.current) {
          startReconnect()
        }
      },
    })

    updateStatus('connecting')
  }, [auraConfig, memories, updateStatus, addMessage, resetReconnect, startReconnect, startHeartbeatMonitor])

  // ── Public API ────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    intentionalDisconnectRef.current = false
    resetReconnect()
    // Pre-start AudioPlayer here while still in user gesture context so
    // AudioContext.resume() is permitted by the browser autoplay policy
    if (!playerRef.current?.isActive()) {
      playerRef.current = new AudioPlayer()
      playerRef.current.start()
    }
    await doConnect()
  }, [resetReconnect, doConnect])

  const disconnect = useCallback(() => {
    intentionalDisconnectRef.current = true
    cancelReconnect()
    stopHeartbeatMonitor()
    wsRef.current?.send({ type: 'disconnect' })
    wsRef.current?.disconnect()
    wsRef.current = null
    micRef.current?.stop()
    micRef.current = null
    playerRef.current?.stop()
    playerRef.current = null
    cameraRef.current?.stop()
    cameraRef.current = null
    updateStatus('disconnected')
  }, [cancelReconnect, stopHeartbeatMonitor, updateStatus])

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.isOpen()) {
      wsRef.current.send({ type: 'text', content: text })
    }
  }, [])

  const sendVideoFrame = useCallback((base64: string, mimeType: string) => {
    if (wsRef.current?.isOpen()) {
      wsRef.current.send({ type: 'video_frame', data: base64, mimeType })
    }
  }, [])

  const resumeAudio = useCallback(() => {
    playerRef.current?.resume()
  }, [])


  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    announcerRef.current.init()
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelReconnect()
      stopHeartbeatMonitor()
      wsRef.current?.disconnect()
      micRef.current?.stop()
      playerRef.current?.stop()
      cameraRef.current?.stop()
      announcerRef.current.dispose()
    }
  }, [cancelReconnect, stopHeartbeatMonitor])

  return {
    status,
    messages,
    connect,
    disconnect,
    sendText,
    sendVideoFrame,
    resumeAudio,
    audioLevelRef,
    clearMessages: () => setMessages([]),
  }
}
