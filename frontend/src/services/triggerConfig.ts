export interface TriggerConfig {
  enabled: boolean
  addPhrases: string[]
}

export const DEFAULT_TRIGGER_CONFIG: TriggerConfig = {
  enabled: true,
  addPhrases: [
    'remember that',
    'please remember',
    "don't forget",
    'dont forget',
    'note that',
    'keep in mind that',
    'save that',
  ],
}

// Extract a short key and the full content from a natural language phrase.
// e.g. "my glasses are on the nightstand" → { key: "glasses", value: "my glasses are on the nightstand" }
export function extractMemoryKeyValue(content: string): { key: string; value: string } {
  const cleaned = content.trim().replace(/[.!?]+$/, '')
  const SKIP = new Set(['my', 'the', 'a', 'an', 'i', 'that', 'this', 'its', "it's"])

  // Take first 1-2 meaningful words as the key
  const words = cleaned
    .split(/\s+/)
    .filter(w => !SKIP.has(w.toLowerCase()))
    .slice(0, 2)

  const key = words.join(' ') || `note-${Date.now()}`
  return { key: key.toLowerCase(), value: cleaned }
}
