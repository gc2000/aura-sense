import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoReconnect } from '@/hooks/useAutoReconnect'

describe('useAutoReconnect', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls onReconnect after initial delay (1000ms)', () => {
    const onReconnect = vi.fn()
    const { result } = renderHook(() => useAutoReconnect({ onReconnect }))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(onReconnect).toHaveBeenCalledTimes(1)
  })

  it('doubles delay on subsequent calls (exponential backoff)', () => {
    const onReconnect = vi.fn()
    const { result } = renderHook(() => useAutoReconnect({ onReconnect }))
    act(() => { result.current.start() })
    // 1st attempt: 1000ms
    act(() => { vi.advanceTimersByTime(1000) })
    // simulate "reconnect failed" → schedule next
    act(() => { result.current.start() })
    // 2nd attempt: 2000ms
    act(() => { vi.advanceTimersByTime(2000) })
    expect(onReconnect).toHaveBeenCalledTimes(2)
  })

  it('cancel prevents pending reconnect', () => {
    const onReconnect = vi.fn()
    const { result } = renderHook(() => useAutoReconnect({ onReconnect }))
    act(() => { result.current.start() })
    act(() => { result.current.cancel() })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onReconnect).not.toHaveBeenCalled()
  })

  it('reset clears attempt count and stops timer', () => {
    const onReconnect = vi.fn()
    const { result } = renderHook(() => useAutoReconnect({ onReconnect }))
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    act(() => { result.current.reset() })
    // After reset attempt count is 0 — next start would delay 1000ms again
    expect(result.current.attempt.current).toBe(0)
  })

  it('calls onGiveUp after MAX_ATTEMPTS exceeded', () => {
    const onReconnect = vi.fn()
    const onGiveUp = vi.fn()
    const { result } = renderHook(() => useAutoReconnect({ onReconnect, onGiveUp }))

    // Attempts 0-7 succeed; the 9th call to scheduleReconnect (attempt=8) triggers onGiveUp.
    // We simulate: start() → timer fires → start() → ... nine times total
    for (let i = 0; i < 9; i++) {
      act(() => {
        result.current.start()
        vi.advanceTimersByTime(60000) // fast-forward past any delay
      })
    }

    expect(onGiveUp).toHaveBeenCalled()
  })
})
