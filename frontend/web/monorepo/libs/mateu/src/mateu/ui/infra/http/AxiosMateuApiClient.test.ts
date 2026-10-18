// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosMateuApiClient } from './AxiosMateuApiClient'
import { setAuthToken } from './authToken'
import { configureCredentialOrigins, resetCredentialScope, trustDeclaredRemotes } from './credentialScope'
import { onSessionExpired } from './sessionGuard'
import { loopGuard } from '@infra/ui/loopGuard'
import { StaleResponse } from '@infra/ui/staleViewGuard'

/**
 * What the API client sends to /mateu/v3/sync and how it reports the outcome to the component that
 * asked: the payload (with the @AppContext selection merged into every appState), auth headers,
 * the busy/succeeded/failed events, retries of reads only, 401 re-auth, stale answers and loops.
 * The network is replaced at axios' adapter, so the interceptors run for real.
 */
type Sent = { url?: string, data: any, headers: Record<string, unknown>, timeout?: number }

const answering = (client: AxiosMateuApiClient, answers: Array<number | ((config: InternalAxiosRequestConfig) => unknown)>) => {
    const sent: Sent[] = []
    let n = 0
    client.axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        sent.push({ url: config.url, data: JSON.parse(String(config.data)), headers: { ...config.headers }, timeout: config.timeout })
        const answer = answers[Math.min(n++, answers.length - 1)]
        const status = typeof answer === 'number' ? answer : 200
        const data = typeof answer === 'function' ? answer(config) : { fragments: [], commands: [], messages: [] }
        const response = { data, status, statusText: String(status), headers: { 'content-type': 'application/json' }, config, request: {} } as AxiosResponse
        if (status >= 400) {
            throw Object.assign(new Error('Request failed with status code ' + status), { isAxiosError: true, response, config, code: 'ERR_BAD_RESPONSE' })
        }
        return response
    }
    return sent
}

const initiatorEvents = () => {
    const initiator = document.createElement('div')
    document.body.appendChild(initiator)
    const events: { type: string, detail: any }[] = []
    for (const type of ['backend-called-event', 'backend-succeeded-event', 'backend-failed-event', 'backend-cancelled-event']) {
        initiator.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
    }
    return { initiator, events, types: () => events.map(e => e.type) }
}

const run = (client: AxiosMateuApiClient, initiator: HTMLElement, over: { actionId?: string, appState?: Record<string, unknown>, background?: boolean, options?: Record<string, unknown>, route?: string } = {}) =>
    client.runAction('/base', over.route ?? '/orders', '_empty', over.actionId ?? 'save', 'cmp-1',
        over.appState, 'com.example.Orders', { name: 'Ana' }, { p: 1 }, initiator, over.background ?? false, over.options ?? {})

beforeEach(() => loopGuard.reset())
afterEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
    setAuthToken(null)
    onSessionExpired(undefined)
    resetCredentialScope()
})

describe('the request', () => {
    it('posts the action to the sync endpoint of the route, with the app context merged under the explicit app state', async () => {
        localStorage.setItem('mateu-app-context', JSON.stringify({ hotel: 'H1', year: 2024 }))
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        const { initiator } = initiatorEvents()
        await run(client, initiator, { appState: { year: 2025 } })
        expect(sent[0].url).toBe('/base/mateu/v3/sync/orders')
        expect(sent[0].data).toMatchObject({
            serverSideType: 'com.example.Orders', appState: { hotel: 'H1', year: 2025 },
            componentState: { name: 'Ana' }, parameters: { p: 1 }, initiatorComponentId: 'cmp-1',
            consumedRoute: '_empty', route: '/orders', actionId: 'save',
        })
    })

    it('an empty route goes to _no_route', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        await run(client, initiatorEvents().initiator, { route: '' })
        expect(sent[0].url).toBe('/base/mateu/v3/sync/_no_route')
        expect(sent[0].data.route).toBe('')
    })

    it('carries the bearer token and the session id, and the action\'s own timeout', async () => {
        setAuthToken('tok-1')
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        await run(client, initiatorEvents().initiator, { options: { timeoutMillis: 1234 } })
        expect(sent[0].headers.Authorization).toBe('Bearer tok-1')
        expect(sent[0].headers['X-Session-Id']).toBeTruthy()
        expect(sent[0].timeout).toBe(1234)
    })

    it('M-S5: the credentials and the app context never go to an origin not trusted with them', async () => {
        setAuthToken('tok-1')
        localStorage.setItem('mateu-app-context', JSON.stringify({ hotel: 'H1' }))
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        const remote = (base: string) => client.runAction(base, '/x', '_empty', '', 'c', undefined, undefined,
            {}, {}, initiatorEvents().initiator, true, {})
        await remote('https://attacker.example')
        expect(sent[0].headers.Authorization).toBeUndefined()
        expect(sent[0].headers['X-Session-Id']).toBeUndefined()
        expect(sent[0].data.appState).toEqual({})
        // a remote the page's own app names is trusted; one a REMOTE names is not
        trustDeclaredRemotes('', ['https://forms.example'])
        trustDeclaredRemotes('https://forms.example', ['https://attacker.example'])
        await remote('https://forms.example')
        await remote('https://attacker.example')
        expect(sent[1].headers.Authorization).toBe('Bearer tok-1')
        expect(sent[1].data.appState).toEqual({ hotel: 'H1' })
        expect(sent[2].headers.Authorization).toBeUndefined()
        // what the host configures is trusted
        configureCredentialOrigins(['https://api.example'])
        await remote('https://api.example')
        expect(sent[3].headers.Authorization).toBe('Bearer tok-1')
    })

    it('M-S5: a lost-session redirect is followed only for a trusted backend, and only to http(s)', async () => {
        const assign = vi.fn()
        const original = window.location
        Object.defineProperty(window, 'location', { configurable: true, value: { ...original, href: original.href, assign } })
        try {
            const client = new AxiosMateuApiClient()
            client.axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({
                data: '<html>login</html>', status: 200, statusText: 'OK', config,
                headers: { 'content-type': 'text/html' },
                request: { responseURL: String(config.url).startsWith('https://attacker') ? 'https://phish.example/login' : 'javascript:alert(1)' },
            }) as AxiosResponse
            const call = (base: string) => client.runAction(base, '/x', '_empty', '', 'c', undefined, undefined,
                {}, {}, initiatorEvents().initiator, true, { quiet: true }).catch(() => undefined)
            await call('https://attacker.example')
            await call('/base')
            expect(assign).not.toHaveBeenCalled()
        } finally {
            Object.defineProperty(window, 'location', { configurable: true, value: original })
        }
    })

    it('without a timeout of its own the default ceiling applies', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        await run(client, initiatorEvents().initiator)
        expect(sent[0].timeout).toBe(60000)
    })
})

describe('reporting the outcome to the initiator', () => {
    it('busy, then succeeded, with the server\'s answer returned', async () => {
        const client = new AxiosMateuApiClient()
        answering(client, [() => ({ fragments: [{ targetComponentId: 'x' }] })])
        const { initiator, types, events } = initiatorEvents()
        const answer = await run(client, initiator)
        expect(answer.fragments).toEqual([{ targetComponentId: 'x' }])
        expect(types()).toEqual(['backend-called-event', 'backend-succeeded-event'])
        expect(events[1].detail.actionId).toBe('save')
    })

    it('a background action does not raise the busy indicator', async () => {
        const client = new AxiosMateuApiClient()
        answering(client, [200])
        const { initiator, types } = initiatorEvents()
        await run(client, initiator, { background: true })
        expect(types()).toEqual(['backend-succeeded-event'])
    })

    it('a failed write is sent exactly once and reported once, classified, with the retry the caller gave', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [500])
        const { initiator, events, types } = initiatorEvents()
        const retry = () => {}
        const error = await run(client, initiator, { options: { retry } }).catch(e => e)
        expect(sent).toHaveLength(1)
        expect(types()).toEqual(['backend-called-event', 'backend-failed-event'])
        expect(events[1].detail.failure.kind).toBe('server')
        expect(events[1].detail.retry).toBe(retry)
        expect(error.__mateuReported).toBe(true)
    })

    it('a read that hits a 503 is repeated and the recovery is what the caller sees', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [503, () => ({ fragments: [{ targetComponentId: 'ok' }] })])
        const { initiator, types } = initiatorEvents()
        const answer = await run(client, initiator, { actionId: 'search' })
        expect(sent).toHaveLength(2)
        expect(answer.fragments![0].targetComponentId).toBe('ok')
        expect(types()).toEqual(['backend-called-event', 'backend-succeeded-event'])
    })

    it('a quiet action reports nothing when it fails', async () => {
        const client = new AxiosMateuApiClient()
        answering(client, [500])
        const { initiator, types } = initiatorEvents()
        await run(client, initiator, { background: true, options: { quiet: true } }).catch(() => undefined)
        expect(types()).toEqual([])
    })

    it('an aborted request is a cancellation, not an error', async () => {
        const client = new AxiosMateuApiClient()
        client.axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
            throw Object.assign(new Error('canceled'), { code: 'ERR_CANCELED', name: 'CanceledError', config })
        }
        const { initiator, types } = initiatorEvents()
        await run(client, initiator).catch(() => undefined)
        expect(types()).toEqual(['backend-called-event', 'backend-cancelled-event'])
    })

    it('an answer for a view that is no longer on screen is dropped as stale', async () => {
        const client = new AxiosMateuApiClient()
        answering(client, [200])
        const { initiator, types } = initiatorEvents()
        const error = await run(client, initiator, { options: { isStale: () => true } }).catch(e => e)
        expect(error).toBeInstanceOf(StaleResponse)
        expect(types()).toEqual(['backend-called-event', 'backend-cancelled-event'])
    })
})

describe('an expired session', () => {
    it('a 401 is handed to the re-auth handler, and its retry re-sends the request', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [401, 200])
        onSessionExpired((ctx) => ctx.retry())
        const { initiator, types } = initiatorEvents()
        await run(client, initiator)
        expect(sent).toHaveLength(2)
        expect(types()).toEqual(['backend-called-event', 'backend-succeeded-event'])
    })

    it('the retry carries the CURRENT token: a refreshed one, or none at all — never the stale one', async () => {
        setAuthToken('expired-token')
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [401, 200, 401, 200])
        onSessionExpired((ctx) => { setAuthToken('fresh-token'); ctx.retry() })
        await run(client, initiatorEvents().initiator)
        expect(sent[0].headers.Authorization).toBe('Bearer expired-token')
        expect(sent[1].headers.Authorization).toBe('Bearer fresh-token')
        // re-auth that ends with NO session (the user signed out): the retry goes anonymous
        onSessionExpired((ctx) => { setAuthToken(null); ctx.retry() })
        await run(client, initiatorEvents().initiator)
        expect(sent[2].headers.Authorization).toBe('Bearer fresh-token')
        expect(sent[3].headers.Authorization).toBeUndefined()
    })

    it('giving up fails the action', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [401])
        onSessionExpired((ctx) => ctx.giveUp())
        const { initiator, types } = initiatorEvents()
        await run(client, initiator).catch(() => undefined)
        expect(sent).toHaveLength(1)
        expect(types()).toContain('backend-failed-event')
    })
})

describe('a repeating request', () => {
    it('is stopped: no request goes out, and the user is told once', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        const { initiator } = initiatorEvents()
        loopGuard.configure({ threshold: 3 })
        try {
            await run(client, initiator)
            await run(client, initiator)
            const blocked = await run(client, initiator)
            const again = await run(client, initiator)
            expect(sent).toHaveLength(2)
            expect(blocked.messages).toHaveLength(1)
            expect(blocked.messages![0].variant).toBe('error')
            expect(again.messages).toHaveLength(0)
        } finally {
            loopGuard.configure({ threshold: 12 })
        }
    })
})

describe('a static bundle base url', () => {
    it('has no server: an action fails without any request', async () => {
        const client = new AxiosMateuApiClient()
        const sent = answering(client, [200])
        const { initiator, types } = initiatorEvents()
        const error = await client.runAction('/remote/manifest.json', 'orders', '', 'save', 'c', {}, undefined, {}, {}, initiator, false).catch(e => e)
        expect(sent).toHaveLength(0)
        expect(String(error.message)).toContain('has no server to run "save"')
        expect(types()).toContain('backend-failed-event')
    })
})
