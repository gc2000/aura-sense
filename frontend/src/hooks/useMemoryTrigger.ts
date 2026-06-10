import { useCallback } from 'react'
import type { TriggerConfig } from '@/services/triggerConfig'
import { extractMemoryKeyValue } from '@/services/triggerConfig'

export const GENERAL_CATEGORY = 'General'

interface UseMemoryTriggerOptions {
  config: TriggerConfig
  onAddMemory: (categoryName: string, key: string, value: string) => void
}

export function useMemoryTrigger({ config, onAddMemory }: UseMemoryTriggerOptions) {
  const processTranscript = useCallback(
    (text: string, role: 'user' | 'assistant' | 'system') => {
      if (role !== 'user' || !config.enabled || !text.trim()) return

      const lower = text.toLowerCase()

      for (const phrase of config.addPhrases) {
        const idx = lower.indexOf(phrase.toLowerCase())
        if (idx === -1) continue

        const afterPhrase = text.slice(idx + phrase.length).trim()
        if (!afterPhrase) continue

        const { key, value } = extractMemoryKeyValue(afterPhrase)
        onAddMemory(GENERAL_CATEGORY, key, value)
        return // only handle the first matching phrase per transcript
      }
    },
    [config, onAddMemory],
  )

  return { processTranscript }
}
