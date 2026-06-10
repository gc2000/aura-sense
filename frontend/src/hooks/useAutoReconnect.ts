import { useRef, useCallback } from 'react'

const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30000
const MAX_ATTEMPTS = 8

interface UseAutoReconnectOptions {
  onReconnect: () => void
  onGiveUp?: () => void
}

export function useAutoReconnect({ onReconnect, onGiveUp }: UseAutoReconnectOptions) {
  const attemptRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  const cancel = useCallback(() => {
    activeRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    attemptRef.current = 0
    cancel()
  }, [cancel])

  const scheduleReconnect = useCallback(() => {
    if (!activeRef.current) return
    if (attemptRef.current >= MAX_ATTEMPTS) {
      activeRef.current = false
      onGiveUp?.()
      return
    }

    const delay = Math.min(BASE_DELAY_MS * 2 ** attemptRef.current, MAX_DELAY_MS)
    attemptRef.current += 1

    timerRef.current = setTimeout(() => {
      if (activeRef.current) {
        onReconnect()
      }
    }, delay)
  }, [onReconnect, onGiveUp])

  const start = useCallback(() => {
    activeRef.current = true
    scheduleReconnect()
  }, [scheduleReconnect])

  return { start, cancel, reset, attempt: attemptRef }
}
