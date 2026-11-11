// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AUTH_TOKEN_KEY, configureAuthToken, resetAuthTokenConfig, setAuthToken } from '@infra/http/authToken.ts'
import { AUTH_SESSION_KEY, AUTH_SESSION_SECRETS_KEY, hasBuiltInSession, readAuthSession, resetAuthSessionMemory,
    writeAuthSession } from './authSession'

const session = {
    providerId: 'acme', kind: 'oidc' as const, issuer: 'https://idp', clientId: 'ui',
    refreshToken: 'refresh-1', idToken: 'id-1', expiresAt: 123,
}

beforeEach(() => {
    resetAuthTokenConfig()
    resetAuthSessionMemory()
    localStorage.clear()
    sessionStorage.clear()
})
afterEach(() => {
    setAuthToken(null)
    writeAuthSession(null)
    resetAuthTokenConfig()
})

describe('the built-in sign-in session record', () => {
    it('never goes into a cookie: descriptor in localStorage, refresh/id tokens in sessionStorage', () => {
        setAuthToken('access-1')
        writeAuthSession(session)
        expect(document.cookie).not.toContain('refresh-1')
        expect(document.cookie).not.toContain(AUTH_SESSION_KEY)
        expect(localStorage.getItem(AUTH_SESSION_KEY)).not.toContain('refresh-1')
        expect(localStorage.getItem(AUTH_SESSION_KEY)).toContain('acme')
        expect(sessionStorage.getItem(AUTH_SESSION_SECRETS_KEY)).toContain('refresh-1')
        expect(readAuthSession()).toEqual(session)
        expect(hasBuiltInSession()).toBe(true)
    })

    it('another tab sharing the cookie knows the session but holds no refresh token', () => {
        setAuthToken('access-1')
        writeAuthSession(session)
        sessionStorage.clear() // a new tab: its own sessionStorage
        expect(readAuthSession()).toEqual({ providerId: 'acme', kind: 'oidc', issuer: 'https://idp', clientId: 'ui', expiresAt: 123 })
        expect(hasBuiltInSession()).toBe(true)
    })

    it('secrets of an earlier sign-in never merge into a newer descriptor', () => {
        writeAuthSession(session)
        const stale = sessionStorage.getItem(AUTH_SESSION_SECRETS_KEY)!
        writeAuthSession({ providerId: 'acme', kind: 'oidc', expiresAt: 456 }) // another tab, another user
        sessionStorage.setItem(AUTH_SESSION_SECRETS_KEY, stale)
        expect(readAuthSession()?.refreshToken).toBeUndefined()
    })

    it('with a configured storage both halves live there; memory keeps them in memory', () => {
        configureAuthToken({ storage: 'sessionStorage' })
        writeAuthSession(session)
        expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull()
        expect(readAuthSession()).toEqual(session)
        writeAuthSession(null)
        expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull()
        expect(sessionStorage.getItem(AUTH_SESSION_SECRETS_KEY)).toBeNull()

        configureAuthToken({ storage: 'memory' })
        writeAuthSession(session)
        expect(localStorage.length + sessionStorage.length).toBe(0)
        expect(readAuthSession()).toEqual(session)
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
    })
})
