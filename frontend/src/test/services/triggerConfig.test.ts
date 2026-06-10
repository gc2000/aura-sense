import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadTriggerConfig,
  saveTriggerConfig,
  extractMemoryKeyValue,
  DEFAULT_TRIGGER_CONFIG,
} from '@/services/triggerConfig'

describe('loadTriggerConfig', () => {
  beforeEach(() => localStorage.clear())

  it('returns default config when storage is empty', () => {
    const result = loadTriggerConfig()
    expect(result.enabled).toBe(true)
    expect(result.addPhrases).toEqual(DEFAULT_TRIGGER_CONFIG.addPhrases)
  })

  it('returns saved config from storage', () => {
    localStorage.setItem('aura_trigger_config', JSON.stringify({ enabled: false, addPhrases: ['save this'] }))
    const result = loadTriggerConfig()
    expect(result.enabled).toBe(false)
    expect(result.addPhrases).toEqual(['save this'])
  })

  it('falls back to defaults on invalid JSON', () => {
    localStorage.setItem('aura_trigger_config', '{bad json}}}')
    const result = loadTriggerConfig()
    expect(result.enabled).toBe(DEFAULT_TRIGGER_CONFIG.enabled)
  })

  it('merges partial config with defaults', () => {
    localStorage.setItem('aura_trigger_config', JSON.stringify({ enabled: false }))
    const result = loadTriggerConfig()
    expect(result.enabled).toBe(false)
    expect(result.addPhrases).toEqual(DEFAULT_TRIGGER_CONFIG.addPhrases)
  })
})

describe('saveTriggerConfig', () => {
  beforeEach(() => localStorage.clear())

  it('persists config to localStorage', () => {
    saveTriggerConfig({ enabled: false, addPhrases: ['my phrase'] })
    const raw = localStorage.getItem('aura_trigger_config')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.enabled).toBe(false)
    expect(parsed.addPhrases).toEqual(['my phrase'])
  })

  it('round-trips without data loss', () => {
    const config = { enabled: true, addPhrases: ['remember that', 'please remember'] }
    saveTriggerConfig(config)
    expect(loadTriggerConfig()).toEqual(config)
  })

  it('ignores storage errors silently', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveTriggerConfig(DEFAULT_TRIGGER_CONFIG)).not.toThrow()
  })
})

describe('extractMemoryKeyValue', () => {
  it('strips stop words and uses first 2 meaningful words as key', () => {
    const { key, value } = extractMemoryKeyValue('my glasses are on the nightstand')
    expect(key).toBe('glasses are')
    expect(value).toBe('my glasses are on the nightstand')
  })

  it('strips trailing punctuation from value', () => {
    const { value } = extractMemoryKeyValue('the keys are on the table.')
    expect(value).toBe('the keys are on the table')
  })

  it('uses single meaningful word when only one available', () => {
    const { key } = extractMemoryKeyValue('glasses')
    expect(key).toBe('glasses')
  })

  it('produces fallback key when all words are stop words', () => {
    const { key } = extractMemoryKeyValue('the a an')
    expect(key).toMatch(/^note-\d+$/)
  })

  it('lowercases the key', () => {
    const { key } = extractMemoryKeyValue('Blue Car is parked outside')
    expect(key).toBe('blue car')
  })

  it('preserves original casing in value', () => {
    const { value } = extractMemoryKeyValue('Alice is coming at 5pm')
    expect(value).toBe('Alice is coming at 5pm')
  })
})
