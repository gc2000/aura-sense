// Uses Web Speech API to announce connection status changes to screen reader users

import type { ConnectionStatus } from '@/types'

const STATUS_MESSAGES: Record<ConnectionStatus, string | null> = {
  disconnected: null, // Aura's own voice handles goodbye
  connecting: null,
  connected: null,    // Aura greets the user herself on connect
  listening: null,
  processing: null,
  responding: null,
  reconnecting: 'Reconnecting…',
  error: 'Connection error. Please try again.',
}

export class VoiceAnnouncer {
  private synth: SpeechSynthesis | null = null
  private enabled = true
  private lastAnnouncedStatus: ConnectionStatus | null = null

  init(): void {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis
    }
  }

  announce(status: ConnectionStatus): void {
    if (!this.enabled || !this.synth) return
    const text = STATUS_MESSAGES[status]
    if (!text) return
    // Skip if already announced this status (e.g. 'connected' fires again on every turnComplete)
    if (status === this.lastAnnouncedStatus) return
    this.lastAnnouncedStatus = status

    this.synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1.0
    utterance.volume = 0.9
    this.synth.speak(utterance)
  }

  announceText(text: string): void {
    if (!this.enabled || !this.synth) return
    this.synth.cancel()
    this.synth.speak(new SpeechSynthesisUtterance(text))
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) this.synth?.cancel()
  }

  dispose(): void {
    this.synth?.cancel()
    this.synth = null
  }
}
