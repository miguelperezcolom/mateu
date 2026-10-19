import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    AGENT_SECRET_KEY, agentPushesOf, channelSecret, HEALTHY_STREAM_MS, incrementOf, nextAttempt, pairingOf,
    resetAgentChannel, statusOf,
} from './agentChannel'

/** The pure half of the live UI push channel: reading the stream, the reconnection, the secret. */

const memoryStorage = (): Storage => {
    const m = new Map<string, string>()
    return {
        get length() { return m.size },
        clear: () => m.clear(),
        getItem: (k) => m.get(k) ?? null,
        setItem: (k, v) => { m.set(k, String(v)) },
        removeItem: (k) => { m.delete(k) },
        key: (i) => [...m.keys()][i] ?? null,
    }
}

afterEach(() => { resetAgentChannel(); vi.unstubAllGlobals() })

describe('agent channel messages', () => {
    it('reads the AgentPush commands of an increment, in order, and nothing else', () => {
        expect(agentPushesOf({
            commands: [
                { type: 'AgentPush', data: { kind: 'status', event: 'mateu-agent-status', detail: { paired: true, agents: ['ana'] } } },
                { type: 'UpdateHeaderValue', data: { id: 'x', value: 'y' } },
                { type: 'AgentPush', data: { kind: 'render', event: 'render-screen', detail: { yaml: 'type: Text', target: 'drawer' } } },
                { type: 'AgentPush', data: { kind: 'event', event: 'highlight-row' } },
                { type: 'AgentPush', data: { kind: 'bogus', event: 'x' } },
                { type: 'AgentPush', data: { kind: 'event', event: '' } },
                null,
            ],
        })).toEqual([
            { kind: 'status', event: 'mateu-agent-status', detail: { paired: true, agents: ['ana'] } },
            { kind: 'render', event: 'render-screen', detail: { yaml: 'type: Text', target: 'drawer' } },
            { kind: 'event', event: 'highlight-row', detail: {} },
        ])
        expect(agentPushesOf({})).toEqual([])
        expect(agentPushesOf(null)).toEqual([])
        expect(agentPushesOf({ commands: 'nope' })).toEqual([])
    })

    it('reads an SSE payload as an increment; a heartbeat or a broken chunk is nothing', () => {
        expect(incrementOf('{"commands":[]}')).toEqual({ commands: [] })
        expect(incrementOf('  ')).toBeNull()
        expect(incrementOf('{broken')).toBeNull()
    })

    it('reads a status defensively', () => {
        expect(statusOf({ paired: true, agents: ['ana', 3, 'an agent'] })).toEqual({ paired: true, agents: ['ana', 'an agent'] })
        expect(statusOf({ paired: 'yes' })).toEqual({ paired: false, agents: [] })
        expect(statusOf(undefined)).toEqual({ paired: false, agents: [] })
    })

    it('reads the pairing code of an _agent-pair answer', () => {
        expect(pairingOf({ fragments: [{ data: {} }, { data: { _agentPairing: { code: 'K7QX-M2PA', expiresInSeconds: 300 } } }] }))
            .toEqual({ code: 'K7QX-M2PA', expiresInSeconds: 300 })
        expect(pairingOf({ fragments: [{ data: { _agentPairing: { code: 'AAAA-BBBB' } } }] }))
            .toEqual({ code: 'AAAA-BBBB', expiresInSeconds: 300 })
        expect(pairingOf({ fragments: [{ data: { _agentPairing: null } }] })).toBeNull()
        expect(pairingOf(undefined)).toBeNull()
    })
})

describe('agent channel reconnection', () => {
    it('reconnects at once after the server\'s periodic end', () => {
        expect(nextAttempt(0, true, 300_000)).toEqual({ delay: 0, failures: 0 })
        expect(nextAttempt(4, true, HEALTHY_STREAM_MS)).toEqual({ delay: 0, failures: 0 })
    })

    it('backs off on errors, and on a stream that ended right after opening (a refused channel)', () => {
        expect(nextAttempt(0, false, 10)).toEqual({ delay: 2_000, failures: 1 })
        expect(nextAttempt(1, false, 10)).toEqual({ delay: 4_000, failures: 2 })
        expect(nextAttempt(0, true, 50)).toEqual({ delay: 2_000, failures: 1 })
        expect(nextAttempt(30, false, 10).delay).toBe(60_000)
    })
})

describe('agent channel secret', () => {
    it('is random, kept for the tab, and survives in memory when storage is blocked', () => {
        const storage = memoryStorage()
        vi.stubGlobal('sessionStorage', storage)
        const secret = channelSecret()
        expect(secret).toMatch(/^[0-9a-f]{64}$/)
        expect(storage.getItem(AGENT_SECRET_KEY)).toBe(secret)
        expect(channelSecret()).toBe(secret)

        resetAgentChannel()
        vi.stubGlobal('sessionStorage', { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } })
        const inMemory = channelSecret()
        expect(inMemory).not.toBe(secret)
        expect(channelSecret()).toBe(inMemory)
    })
})
