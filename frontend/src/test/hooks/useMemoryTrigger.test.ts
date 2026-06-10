import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMemoryTrigger, GENERAL_CATEGORY } from '@/hooks/useMemoryTrigger'
import type { TriggerConfig } from '@/services/triggerConfig'

const config: TriggerConfig = {
  enabled: true,
  addPhrases: ['remember that', 'please remember', "don't forget"],
}

describe('useMemoryTrigger', () => {
  let onAddMemory: ReturnType<typeof vi.fn>

  beforeEach(() => { onAddMemory = vi.fn() })

  it('detects trigger phrase and calls onAddMemory', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('Aura, remember that my glasses are on the shelf', 'user')
    expect(onAddMemory).toHaveBeenCalledOnce()
    const [category, key, value] = onAddMemory.mock.calls[0] as [string, string, string]
    expect(category).toBe(GENERAL_CATEGORY)
    expect(key).toBe('glasses are')
    expect(value).toBe('my glasses are on the shelf')
  })

  it('is case-insensitive for trigger phrase matching', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('Please Remember that the car key is in the drawer', 'user')
    expect(onAddMemory).toHaveBeenCalledOnce()
  })

  it('ignores assistant messages', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('remember that something', 'assistant')
    expect(onAddMemory).not.toHaveBeenCalled()
  })

  it('ignores system messages', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('remember that something', 'system')
    expect(onAddMemory).not.toHaveBeenCalled()
  })

  it('does nothing when triggers are disabled', () => {
    const disabledConfig = { ...config, enabled: false }
    const { result } = renderHook(() => useMemoryTrigger({ config: disabledConfig, onAddMemory }))
    result.current.processTranscript('remember that my keys are by the door', 'user')
    expect(onAddMemory).not.toHaveBeenCalled()
  })

  it('does nothing when no phrase matches', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('hello how are you today', 'user')
    expect(onAddMemory).not.toHaveBeenCalled()
  })

  it('does nothing when phrase matches but nothing follows it', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('remember that', 'user')
    expect(onAddMemory).not.toHaveBeenCalled()
  })

  it('does nothing on empty string', () => {
    const { result } = renderHook(() => useMemoryTrigger({ config, onAddMemory }))
    result.current.processTranscript('', 'user')
    expect(onAddMemory).not.toHaveBeenCalled()
  })

  it('only fires once even when multiple phrases match', () => {
    const multiConfig: TriggerConfig = {
      enabled: true,
      addPhrases: ['remember that', 'remember'],
    }
    const { result } = renderHook(() => useMemoryTrigger({ config: multiConfig, onAddMemory }))
    result.current.processTranscript('please remember that something important', 'user')
    expect(onAddMemory).toHaveBeenCalledOnce()
  })

  it('saves to GENERAL_CATEGORY constant', () => {
    expect(GENERAL_CATEGORY).toBe('General')
  })
})
