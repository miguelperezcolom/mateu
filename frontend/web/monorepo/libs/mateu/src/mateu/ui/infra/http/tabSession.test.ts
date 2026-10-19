// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
    AGENT_SECRET_KEY, claimTabSession, resetTabSession, startTabSessionClaim, TAB_SESSION_CHANNEL, tabSessionReady,
} from './tabSession'
import { SESSION_ID_KEY, sessionId, resetAuthTokenConfig } from './authToken'
import { channelSecret, resetAgentChannel } from '@infra/ui/agentChannel'
import { AxiosMateuApiClient } from './AxiosMateuApiClient'

/**
 * A duplicated tab copies sessionStorage — the UI session id and the push channel's secret with it.
 * The tabs of a simulated browser share one BroadcastChannel bus; each has its own storage, and a
 * duplicate starts with a COPY of its original's.
 */

type Storage = { m: Map<string, string>, get(k: string): string | null, set(k: string, v: string): boolean, remove(k: string): void }

const storageOf = (entries: Record<string, string> = {}): Storage => {
    const m = new Map(Object.entries(entries))
    return { m, get: (k) => m.get(k) ?? null, set: (k, v) => { m.set(k, v); return true }, remove: (k) => { m.delete(k) } }
}

/** A BroadcastChannel bus: what one instance posts reaches every OTHER open instance of the name, async. */
const busOf = () => {
    const open = new Set<FakeChannel>()
    class FakeChannel {
        onmessage: ((e: { data: unknown }) => void) | null = null
        constructor(readonly name: string) { open.add(this) }
        postMessage(data: unknown) {
            for (const other of open) {
                if (other !== this && other.name === this.name) setTimeout(() => other.onmessage?.({ data: structuredClone(data) }), 0)
            }
        }
        close() { open.delete(this) }
    }
    return { Channel: FakeChannel as unknown as new (name: string) => BroadcastChannel, open }
}

afterEach(() => {
    resetTabSession()
    resetAgentChannel()
    resetAuthTokenConfig()
    sessionStorage.clear()
})

describe('a duplicated tab', () => {
    it('takes a fresh session id and secret; its original keeps its own', async () => {
        const { Channel, open } = busOf()
        const original = storageOf({ [SESSION_ID_KEY]: 'id-1', [AGENT_SECRET_KEY]: 'secret-1' })
        expect(await claimTabSession({ storage: original, Channel, waitMs: 20, navigationType: 'navigate' })).toBe(false)
        expect(original.get(SESSION_ID_KEY)).toBe('id-1')

        const duplicate = storageOf(Object.fromEntries(original.m))
        expect(await claimTabSession({ storage: duplicate, Channel, waitMs: 20, navigationType: 'back_forward' })).toBe(true)
        expect(duplicate.get(SESSION_ID_KEY)).toBeTruthy()
        expect(duplicate.get(SESSION_ID_KEY)).not.toBe('id-1')
        // the secret goes with it: created fresh on its next use
        expect(duplicate.get(AGENT_SECRET_KEY)).toBeNull()
        expect(original.get(SESSION_ID_KEY)).toBe('id-1')
        expect(original.get(AGENT_SECRET_KEY)).toBe('secret-1')
        expect([...open].every((c) => c.name === TAB_SESSION_CHANNEL)).toBe(true)

        // a third copy of the ORIGINAL is a duplicate too — and the rotated duplicate is not asked about id-1
        const third = storageOf(Object.fromEntries(original.m))
        expect(await claimTabSession({ storage: third, Channel, waitMs: 20 })).toBe(true)
        // the rotated one answers for its NEW id: a copy of it is a duplicate of it
        const copyOfDuplicate = storageOf(Object.fromEntries(duplicate.m))
        expect(await claimTabSession({ storage: copyOfDuplicate, Channel, waitMs: 20 })).toBe(true)
    })

    it('a reload keeps its id: the page that held it is gone', async () => {
        const storage = storageOf({ [SESSION_ID_KEY]: 'id-1', [AGENT_SECRET_KEY]: 'secret-1' })
        // a new page in the same tab: nobody else on the bus
        expect(await claimTabSession({ storage, Channel: busOf().Channel, waitMs: 20 })).toBe(false)
        expect(storage.get(SESSION_ID_KEY)).toBe('id-1')
        expect(storage.get(AGENT_SECRET_KEY)).toBe('secret-1')
    })

    it('a reload asks nothing at all (the navigation type says nobody can hold the id)', async () => {
        const { Channel } = busOf()
        const original = storageOf({ [SESSION_ID_KEY]: 'id-1' })
        await claimTabSession({ storage: original, Channel, waitMs: 20 })
        // even with a tab answering for the id, a reload keeps it — and resolves at once
        const reloaded = storageOf(Object.fromEntries(original.m))
        expect(await claimTabSession({ storage: reloaded, Channel, waitMs: 10_000, navigationType: 'reload' })).toBe(false)
        expect(reloaded.get(SESSION_ID_KEY)).toBe('id-1')
    })

    it('a tab with no id yet asks nothing and creates nothing', async () => {
        const storage = storageOf()
        expect(await claimTabSession({ storage, Channel: busOf().Channel, waitMs: 10_000 })).toBe(false)
        expect(storage.m.size).toBe(0)
    })

    it('with no BroadcastChannel (or one that cannot open) nothing changes', async () => {
        const storage = storageOf({ [SESSION_ID_KEY]: 'id-1', [AGENT_SECRET_KEY]: 'secret-1' })
        expect(await claimTabSession({ storage, Channel: null })).toBe(false)
        expect(await claimTabSession({ storage, Channel: function () { throw new Error('blocked') } as unknown as new (n: string) => BroadcastChannel })).toBe(false)
        const silent = class { onmessage = null; postMessage() { throw new Error('closed') } close() {} }
        expect(await claimTabSession({ storage, Channel: silent as unknown as new (n: string) => BroadcastChannel })).toBe(false)
        expect(storage.get(SESSION_ID_KEY)).toBe('id-1')
        expect(storage.get(AGENT_SECRET_KEY)).toBe('secret-1')
    })

    it('ignores messages about other ids and malformed ones', async () => {
        const { Channel } = busOf()
        const original = storageOf({ [SESSION_ID_KEY]: 'id-1' })
        await claimTabSession({ storage: original, Channel, waitMs: 5 })
        const other = new Channel(TAB_SESSION_CHANNEL)
        const heard: unknown[] = []
        other.onmessage = (e) => heard.push(e.data)
        other.postMessage({ type: 'who', id: 'someone-else' })
        other.postMessage(null)
        other.postMessage({ type: 'who', id: 'id-1' })
        await new Promise((r) => setTimeout(r, 10))
        expect(heard).toEqual([{ type: 'mine', id: 'id-1' }])
    })
})

describe('the real session id and secret', () => {
    it('a duplicate reads a NEW sessionId() and channelSecret() after the claim', async () => {
        const { Channel } = busOf()
        // the original tab, in its own storage
        const original = storageOf({ [SESSION_ID_KEY]: 'id-1', [AGENT_SECRET_KEY]: 'secret-1' })
        await claimTabSession({ storage: original, Channel, waitMs: 5 })
        // this page is the duplicate: the real sessionStorage holds a copy
        sessionStorage.setItem(SESSION_ID_KEY, 'id-1')
        sessionStorage.setItem(AGENT_SECRET_KEY, 'secret-1')
        const ready = startTabSessionClaim({ Channel, waitMs: 20, navigationType: 'back_forward' })
        expect(startTabSessionClaim()).toBe(ready)
        expect(tabSessionReady()).toBe(ready)
        await ready
        expect(tabSessionReady()).toBeNull()
        expect(sessionId()).not.toBe('id-1')
        const secret = channelSecret()
        expect(secret).not.toBe('secret-1')
        expect(channelSecret()).toBe(secret)
    })

    it('no claim started: nothing to wait for', () => {
        expect(tabSessionReady()).toBeNull()
    })

    it('an ordinary request is NOT held back by the claim (requests keep their order)', async () => {
        const { Channel } = busOf()
        await claimTabSession({ storage: storageOf({ [SESSION_ID_KEY]: 'id-1' }), Channel, waitMs: 5 })
        sessionStorage.setItem(SESSION_ID_KEY, 'id-1')
        // a claim that takes far longer than the request: if the request waited, it would not be sent
        const ready = startTabSessionClaim({ Channel, waitMs: 60_000, navigationType: 'navigate' })
        const client = new AxiosMateuApiClient()
        const sent: string[] = []
        client.axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
            sent.push(String(config.headers['X-Session-Id']))
            return { data: { fragments: [], commands: [], messages: [] }, status: 200, statusText: '200',
                headers: { 'content-type': 'application/json' }, config, request: {} } as AxiosResponse
        }
        const initiator = document.createElement('div')
        document.body.appendChild(initiator)
        await client.runAction('/base', '/orders', '_empty', 'save', 'cmp-1', undefined, 'X', {}, {}, initiator, true, {})
        expect(sent).toEqual(['id-1'])
        expect(tabSessionReady()).toBe(ready) // still pending: the request did not wait for it
        initiator.remove()
    })
})
