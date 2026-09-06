// @vitest-environment jsdom
// announceCapabilityMismatch dispatches a DOM event, so this file opts into jsdom; the pure
// checkCapabilities logic would run under node too.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  PROVIDED_CAPABILITIES,
  checkCapabilities,
  announceCapabilityMismatch,
} from './capabilities'

describe('checkCapabilities', () => {
  it('is satisfied by an empty or missing requirement list', () => {
    expect(checkCapabilities(undefined).ok).toBe(true)
    expect(checkCapabilities([]).ok).toBe(true)
    expect(checkCapabilities(null).missing).toEqual([])
  })

  it('is satisfied when the build provides everything required', () => {
    const result = checkCapabilities(['command-center', 'sse'])
    expect(result.ok).toBe(true)
    expect(result.missing).toEqual([])
  })

  it('reports exactly the tokens the build does not provide, in order', () => {
    const result = checkCapabilities(['sse', 'future-thing', 'another-future'])
    expect(result.ok).toBe(false)
    expect(result.missing).toEqual(['future-thing', 'another-future'])
  })

  it('every derived token is in the provided set (the reference build provides all of them)', () => {
    for (const token of [
      'sse',
      'app-data',
      'rest-sources',
      'command-center',
      'global-search',
      'notifications',
      'context-selectors',
      'header-actions',
    ]) {
      expect(PROVIDED_CAPABILITIES.has(token)).toBe(true)
    }
  })

  it('honours an injected (older/synthetic) provided set', () => {
    const olderBuild = new Set(['sse'])
    const result = checkCapabilities(['sse', 'command-center'], olderBuild)
    expect(result.ok).toBe(false)
    expect(result.missing).toEqual(['command-center'])
  })
})

describe('announceCapabilityMismatch', () => {
  afterEach(() => vi.restoreAllMocks())

  it('is silent and emits nothing when everything is satisfied', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const target = new EventTarget()
    const listener = vi.fn()
    target.addEventListener('mateu-capability-mismatch', listener)

    const result = announceCapabilityMismatch(['sse', 'command-center'], target)

    expect(result.ok).toBe(true)
    expect(listener).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns and dispatches mateu-capability-mismatch with the missing tokens', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const target = new EventTarget()
    let detail: unknown
    target.addEventListener('mateu-capability-mismatch', (e) => {
      detail = (e as CustomEvent).detail
    })

    const result = announceCapabilityMismatch(['sse', 'future-thing'], target)

    expect(result.ok).toBe(false)
    expect(result.missing).toEqual(['future-thing'])
    expect(warn).toHaveBeenCalledOnce()
    expect(detail).toEqual({ missing: ['future-thing'], required: ['sse', 'future-thing'] })
  })
})
