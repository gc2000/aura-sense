import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VoiceAnnouncer } from '@/services/voiceAnnouncer'

const mockSpeak = vi.fn()
const mockCancel = vi.fn()

vi.stubGlobal('window', {
  speechSynthesis: { speak: mockSpeak, cancel: mockCancel },
})

vi.stubGlobal('SpeechSynthesisUtterance', vi.fn((text: string) => ({ text })))

describe('VoiceAnnouncer', () => {
  let announcer: VoiceAnnouncer

  beforeEach(() => {
    vi.clearAllMocks()
    announcer = new VoiceAnnouncer()
    announcer.init()
  })

  it('does not announce connected (Aura greets via Gemini voice)', () => {
    announcer.announce('connected')
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('does not announce disconnected (silent)', () => {
    announcer.announce('disconnected')
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('does not announce listening (too frequent)', () => {
    announcer.announce('listening')
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('does not announce processing', () => {
    announcer.announce('processing')
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('announces error status', () => {
    announcer.announce('error')
    expect(mockSpeak).toHaveBeenCalled()
  })

  it('announces reconnecting status', () => {
    announcer.announce('reconnecting')
    expect(mockSpeak).toHaveBeenCalled()
  })

  it('announceText speaks arbitrary text', () => {
    announcer.announceText('Hello world')
    expect(mockSpeak).toHaveBeenCalled()
  })

  it('setEnabled(false) stops speech and suppresses future announcements', () => {
    announcer.setEnabled(false)
    announcer.announce('reconnecting')
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('setEnabled(true) re-enables announcements', () => {
    announcer.setEnabled(false)
    announcer.setEnabled(true)
    announcer.announce('reconnecting')
    expect(mockSpeak).toHaveBeenCalled()
  })

  it('does not re-announce the same status twice', () => {
    announcer.announce('error')
    announcer.announce('error')
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  it('re-announces error after reconnecting resets state', () => {
    announcer.announce('error')
    announcer.announce('reconnecting')
    announcer.announce('error')
    expect(mockSpeak).toHaveBeenCalledTimes(3)
  })

  it('dispose cancels speech', () => {
    announcer.dispose()
    expect(mockCancel).toHaveBeenCalled()
  })
})
