// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AUTH_TOKEN_KEY, authHeaders, authTokenLocation, configureAuthToken, getAuthToken, resetAuthTokenConfig,
    setAuthToken, setTokenCookieJar, tabsShareIdentity, tokenCookiePath, useMountForTokenCookie } from './authToken'
import { cookieMaxAge, cookiePathOf, cookiePathsToClear, cookieValue, CookieJar, jwtExpiresAt,
    TOKEN_COOKIE_MAX_BYTES, tokenCookieString } from './tokenCookie'

/** A cookie jar that records what was written and honours Path + Max-Age=0 like a browser (one page path). */
const fakeJar = (opts: { enabled?: boolean, secure?: boolean, readsBack?: boolean } = {}) => {
    const cookies = new Map<string, string>() // path -> value
    const written: string[] = []
    const jar: CookieJar & { written: string[], cookies: Map<string, string> } = {
        written, cookies,
        read: () => [...cookies.entries()].sort((a, b) => b[0].length - a[0].length)
            .map(([, v]) => `${AUTH_TOKEN_KEY}=${v}`).join('; '),
        write: (cookie) => {
            written.push(cookie)
            if (opts.readsBack === false) return
            const [pair, ...attrs] = cookie.split('; ')
            const value = pair.slice(pair.indexOf('=') + 1)
            const path = attrs.find((a) => a.startsWith('Path='))!.slice(5)
            if (attrs.includes('Max-Age=0')) cookies.delete(path)
            else cookies.set(path, value)
        },
        enabled: () => opts.enabled !== false,
        secure: () => !!opts.secure,
    }
    return jar
}

const jwt = (claims: object) => 'h.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.s'

beforeEach(() => {
    resetAuthTokenConfig()
    localStorage.clear()
    sessionStorage.clear()
})
afterEach(() => {
    setAuthToken(null)
    resetAuthTokenConfig()
})

describe('the Bearer token in a cookie (the default)', () => {
    it('is written as a cookie and read back, and requests still carry the Authorization header', () => {
        setAuthToken('abc')
        expect(cookieValue(document.cookie, AUTH_TOKEN_KEY)).toBe('abc')
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
        expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
        expect(authTokenLocation()).toBe('cookie')
        expect(authHeaders()).toEqual({ Authorization: 'Bearer abc' })
        expect(tabsShareIdentity()).toBe(true)
    })

    it('has Path, SameSite=Strict, Secure only on https, no Domain, and Max-Age from the expiry', () => {
        const jar = fakeJar({ secure: true })
        setTokenCookieJar(jar)
        configureAuthToken({ cookiePath: '/admin' })
        setAuthToken('t', { expiresAt: Date.now() + 300_000 })
        const cookie = jar.written[0]
        expect(cookie).toMatch(/^__mateu_auth_token=t; Path=\/admin; SameSite=Strict; Secure; Max-Age=(29\d|300)$/)
        expect(cookie).not.toContain('Domain')

        const plain = fakeJar({ secure: false })
        setTokenCookieJar(plain)
        setAuthToken('u')
        expect(plain.written.find((c) => c.startsWith('__mateu_auth_token=u'))).toBe('__mateu_auth_token=u; Path=/admin; SameSite=Strict')
    })

    it('takes its life from the JWT exp when no expiry is given; a past exp makes a session cookie', () => {
        const now = 1_000_000_000_000
        expect(jwtExpiresAt(jwt({ exp: now / 1000 + 60 }))).toBe(now + 60_000)
        expect(cookieMaxAge(jwt({ exp: now / 1000 + 60 }), undefined, now)).toBe(60)
        expect(cookieMaxAge(jwt({ exp: now / 1000 - 60 }), undefined, now)).toBeUndefined()
        expect(cookieMaxAge('opaque-token', undefined, now)).toBeUndefined()
        expect(cookieMaxAge('opaque-token', now + 10_000, now)).toBe(10)
    })

    it('a token too big for a cookie goes to sessionStorage', () => {
        const big = 'x'.repeat(TOKEN_COOKIE_MAX_BYTES)
        setAuthToken(big)
        expect(cookieValue(document.cookie, AUTH_TOKEN_KEY)).toBeNull()
        expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe(big)
        expect(getAuthToken()).toBe(big)
        expect(tabsShareIdentity()).toBe(false)
    })

    it('disabled cookies, or a write that does not read back, fall back to sessionStorage', () => {
        setTokenCookieJar(fakeJar({ enabled: false }))
        setAuthToken('a')
        expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('a')
        expect(getAuthToken()).toBe('a')

        setTokenCookieJar(fakeJar({ readsBack: false }))
        setAuthToken('b')
        expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('b')
        expect(getAuthToken()).toBe('b')
    })

    it('reads the cookie first, then the configured storage, then sessionStorage, then localStorage', () => {
        localStorage.setItem(AUTH_TOKEN_KEY, 'local')
        expect(getAuthToken()).toBe('local')
        sessionStorage.setItem(AUTH_TOKEN_KEY, 'session')
        expect(getAuthToken()).toBe('session')
        configureAuthToken({ storage: 'localStorage' })
        expect(getAuthToken()).toBe('local') // the configured storage before the fallback lookup
        document.cookie = `${AUTH_TOKEN_KEY}=cookie; Path=/`
        expect(getAuthToken()).toBe('cookie')
    })

    it('writing a token removes every other copy; clearing removes it from all places', () => {
        localStorage.setItem(AUTH_TOKEN_KEY, 'old-local')
        sessionStorage.setItem(AUTH_TOKEN_KEY, 'old-session')
        setAuthToken('new')
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
        expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
        expect(getAuthToken()).toBe('new')

        // a configured web storage drops the cookie copy, so it cannot shadow the new token
        configureAuthToken({ storage: 'localStorage' })
        setAuthToken('in-local')
        expect(cookieValue(document.cookie, AUTH_TOKEN_KEY)).toBeNull()
        expect(getAuthToken()).toBe('in-local')

        document.cookie = `${AUTH_TOKEN_KEY}=stray; Path=/`
        sessionStorage.setItem(AUTH_TOKEN_KEY, 'stray')
        setAuthToken(null)
        expect(cookieValue(document.cookie, AUTH_TOKEN_KEY)).toBeNull()
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
        expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
        expect(getAuthToken()).toBeNull()
    })

    it('clearing deletes the cookie under every path it may have been written with', () => {
        const jar = fakeJar()
        setTokenCookieJar(jar)
        configureAuthToken({ cookiePath: '/admin' })
        setAuthToken('t')
        jar.cookies.set('/', 'bootstrap-left-one')
        setAuthToken(null)
        expect(jar.cookies.size).toBe(0)
        expect(cookiePathsToClear(['/admin'], '/admin/orders/3')).toEqual(['/', '/admin', '/admin/orders', '/admin/orders/3'])
    })

    it('memory keeps it out of every store', () => {
        configureAuthToken({ storage: 'memory' })
        setAuthToken('m')
        expect(cookieValue(document.cookie, AUTH_TOKEN_KEY)).toBeNull()
        expect(getAuthToken()).toBe('m')
        expect(tabsShareIdentity()).toBe(false)
    })

    it('the meta declaration still picks the storage', () => {
        const meta = document.createElement('meta')
        meta.name = 'mateu-auth-token-storage'
        meta.content = 'sessionStorage'
        document.head.appendChild(meta)
        try {
            setAuthToken('s')
            expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('s')
            expect(cookieValue(document.cookie, AUTH_TOKEN_KEY)).toBeNull()
        } finally {
            meta.remove()
        }
    })
})

describe('the cookie path', () => {
    it('is the mount of the first mateu-ui, unless configured', () => {
        expect(tokenCookiePath()).toBe('/')
        useMountForTokenCookie('/admin/')
        useMountForTokenCookie('/other')
        expect(tokenCookiePath()).toBe('/admin')
        configureAuthToken({ cookiePath: '/x' })
        expect(tokenCookiePath()).toBe('/x')
    })

    it('is the base url path when same-origin, else /', () => {
        expect(cookiePathOf('', 'https://a.example/orders')).toBe('/')
        expect(cookiePathOf('/admin', 'https://a.example/admin/orders')).toBe('/admin')
        expect(cookiePathOf('https://a.example/admin/', 'https://a.example/admin')).toBe('/admin')
        expect(cookiePathOf('https://b.example/admin', 'https://a.example/admin')).toBe('/')
    })

    it('encodes what a cookie value cannot hold', () => {
        expect(tokenCookieString('n', 'a;b c', { path: '/', secure: false })).toBe('n=a%3Bb%20c; Path=/; SameSite=Strict')
        expect(cookieValue('n=a%3Bb%20c', 'n')).toBe('a;b c')
    })
})
