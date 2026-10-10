import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_TOKEN_KEY, authHeaders, authTokenStorage, configureAuthToken, getAuthToken,
    resetAuthTokenConfig, SESSION_ID_KEY, sessionId, setAuthToken } from './authToken'

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

let local: Storage
let session: Storage

beforeEach(() => {
    resetAuthTokenConfig()
    local = memoryStorage()
    session = memoryStorage()
    vi.stubGlobal('localStorage', local)
    vi.stubGlobal('sessionStorage', session)
})
afterEach(() => vi.unstubAllGlobals())

describe('the Bearer token', () => {
    it('defaults to localStorage, where bootstraps have always left it', () => {
        expect(authTokenStorage()).toBe('localStorage')
        local.setItem(AUTH_TOKEN_KEY, 'abc')
        expect(getAuthToken()).toBe('abc')
        expect(authHeaders()).toEqual({ Authorization: 'Bearer abc' })
    })

    it('can live in sessionStorage or only in memory', () => {
        configureAuthToken({ storage: 'sessionStorage' })
        setAuthToken('s1')
        expect(session.getItem(AUTH_TOKEN_KEY)).toBe('s1')
        expect(local.getItem(AUTH_TOKEN_KEY)).toBeNull()

        configureAuthToken({ storage: 'memory' })
        setAuthToken('m1')
        expect(getAuthToken()).toBe('m1')
        expect(local.getItem(AUTH_TOKEN_KEY)).toBeNull()
        setAuthToken(null)
        expect(getAuthToken()).toBeNull()
        expect(authHeaders()).toEqual({})
    })

    it('a provider wins over storage, and a failing provider is "no token"', () => {
        local.setItem(AUTH_TOKEN_KEY, 'stored')
        configureAuthToken({ provider: () => 'live' })
        expect(getAuthToken()).toBe('live')
        configureAuthToken({ provider: () => { throw new Error('x') } })
        expect(getAuthToken()).toBe('stored')
        configureAuthToken({ provider: null })
        expect(getAuthToken()).toBe('stored')
    })

    it('never throws when storage is blocked', () => {
        const boom = () => { throw new Error('SecurityError') }
        vi.stubGlobal('localStorage', { getItem: boom, setItem: boom, removeItem: boom })
        expect(getAuthToken()).toBeNull()
        expect(() => setAuthToken('x')).not.toThrow()
    })
})

describe('the session id', () => {
    it('is created once per tab and reused', () => {
        const a = sessionId()
        expect(a).toBeTruthy()
        expect(session.getItem(SESSION_ID_KEY)).toBe(a)
        expect(sessionId()).toBe(a)
    })

    it('is kept in memory when sessionStorage is blocked, and is not created on read-only calls', () => {
        expect(sessionId(false)).toBeNull()
        const boom = () => { throw new Error('SecurityError') }
        vi.stubGlobal('sessionStorage', { getItem: boom, setItem: boom, removeItem: boom })
        const a = sessionId()
        expect(a).toBeTruthy()
        expect(sessionId()).toBe(a)
    })
})
