// Where the Bearer token and the sign-in session live (authStore.mjs): the cookie by default, its
// attributes, the fallbacks, the read order and clearing everywhere — the same cases as libs/mateu
// authToken.cookie.test.ts. Run: node test-auth-store.mjs (npm test runs it).
import assert from 'node:assert/strict'
import {
  configureTokenStore, cookieValueOf, jwtExpiresAtOf, readStoredSession, readStoredToken, resetTokenStore,
  setTokenCookiePath, storedTokenLocation, TOKEN_COOKIE_MAX_BYTES, tokenCookieMaxAgeOf, tokenCookiePath,
  tokenCookiePathsToClearOf, tokenCookieStringOf, tokenStorage, writeStoredSession, writeStoredToken,
} from './authStore.mjs'
import { authHeadersOf } from './resilience.mjs'

class MemoryStorage {
  constructor() { this.map = new Map() }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null }
  setItem(k, v) { this.map.set(k, String(v)) }
  removeItem(k) { this.map.delete(k) }
  clear() { this.map.clear() }
  get length() { return this.map.size }
}
globalThis.localStorage = new MemoryStorage()
globalThis.sessionStorage = new MemoryStorage()

const KEY = '__mateu_auth_token'

/** A jar that honours Path and Max-Age=0 like a browser on one page. */
const fakeJar = ({ enabled = true, secure = false, readsBack = true } = {}) => {
  const cookies = new Map()
  const written = []
  return {
    cookies, written,
    read: () => [...cookies.entries()].sort((a, b) => b[0].length - a[0].length).map(([, v]) => KEY + '=' + v).join('; '),
    write: (cookie) => {
      written.push(cookie)
      if (!readsBack) return
      const [pair, ...attrs] = cookie.split('; ')
      const value = pair.slice(pair.indexOf('=') + 1)
      const path = attrs.find((a) => a.startsWith('Path=')).slice(5)
      if (attrs.includes('Max-Age=0')) cookies.delete(path)
      else cookies.set(path, value)
    },
    enabled: () => enabled,
    secure: () => secure,
  }
}

let passed = 0
const test = (name, fn) => {
  resetTokenStore()
  localStorage.clear()
  sessionStorage.clear()
  try {
    fn()
    passed++
  } catch (e) {
    console.error('FAIL ' + name)
    throw e
  }
}
const jwt = (claims) => 'h.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.s'

test('the cookie is the default store, and requests still carry the Authorization header', () => {
  const jar = fakeJar()
  configureTokenStore({ jar })
  assert.equal(tokenStorage(), 'cookie')
  writeStoredToken('abc')
  assert.equal(cookieValueOf(jar.read(), KEY), 'abc')
  assert.equal(localStorage.getItem(KEY), null)
  assert.equal(sessionStorage.getItem(KEY), null)
  assert.equal(storedTokenLocation(), 'cookie')
  assert.deepEqual(authHeadersOf(), { Authorization: 'Bearer abc' })
})

test('Path = the mount, SameSite=Strict, Secure only on https, no Domain, Max-Age from the expiry', () => {
  const jar = fakeJar({ secure: true })
  configureTokenStore({ jar })
  setTokenCookiePath('/console/')
  assert.equal(tokenCookiePath(), '/console')
  writeStoredToken('t', { expiresAt: Date.now() + 300000 })
  assert.match(jar.written[0], /^__mateu_auth_token=t; Path=\/console; SameSite=Strict; Secure; Max-Age=(29\d|300)$/)
  assert.ok(!jar.written[0].includes('Domain'))
  const plain = fakeJar()
  configureTokenStore({ jar: plain })
  setTokenCookiePath('')
  writeStoredToken('u')
  assert.equal(plain.written[0], '__mateu_auth_token=u; Path=/; SameSite=Strict')
})

test('the cookie lives as long as the token (JWT exp when no expiry is given), else for the session', () => {
  const now = 1e12
  assert.equal(jwtExpiresAtOf(jwt({ exp: now / 1000 + 60 })), now + 60000)
  assert.equal(tokenCookieMaxAgeOf(jwt({ exp: now / 1000 + 60 }), undefined, now), 60)
  assert.equal(tokenCookieMaxAgeOf(jwt({ exp: now / 1000 - 60 }), undefined, now), undefined)
  assert.equal(tokenCookieMaxAgeOf('opaque', undefined, now), undefined)
  assert.equal(tokenCookieMaxAgeOf('opaque', now + 10000, now), 10)
})

test('too big for a cookie, cookies disabled, or a write that does not read back → sessionStorage', () => {
  configureTokenStore({ jar: fakeJar() })
  const big = 'x'.repeat(TOKEN_COOKIE_MAX_BYTES)
  writeStoredToken(big)
  assert.equal(sessionStorage.getItem(KEY), big)
  assert.equal(readStoredToken(), big)
  configureTokenStore({ jar: fakeJar({ enabled: false }) })
  writeStoredToken('a')
  assert.equal(sessionStorage.getItem(KEY), 'a')
  configureTokenStore({ jar: fakeJar({ readsBack: false }) })
  writeStoredToken('b')
  assert.equal(sessionStorage.getItem(KEY), 'b')
  assert.equal(readStoredToken(), 'b')
})

test('read order: cookie → the declared storage → sessionStorage → localStorage', () => {
  const jar = fakeJar()
  configureTokenStore({ jar })
  localStorage.setItem(KEY, 'local')
  assert.equal(readStoredToken(), 'local')
  sessionStorage.setItem(KEY, 'session')
  assert.equal(readStoredToken(), 'session')
  configureTokenStore({ storage: 'localStorage' })
  assert.equal(readStoredToken(), 'local')
  jar.cookies.set('/', 'cookie')
  assert.equal(readStoredToken(), 'cookie')
})

test('writing removes every other copy; clearing removes it from all places and paths', () => {
  const jar = fakeJar()
  configureTokenStore({ jar })
  setTokenCookiePath('/console')
  localStorage.setItem(KEY, 'old')
  sessionStorage.setItem(KEY, 'old')
  writeStoredToken('new')
  assert.equal(localStorage.getItem(KEY), null)
  assert.equal(sessionStorage.getItem(KEY), null)
  jar.cookies.set('/', 'left-by-a-bootstrap')
  configureTokenStore({ storage: 'localStorage' })
  writeStoredToken('in-local')
  assert.equal(jar.cookies.size, 0)
  assert.equal(readStoredToken(), 'in-local')
  sessionStorage.setItem(KEY, 'stray')
  writeStoredToken(null)
  assert.equal(readStoredToken(), null)
  assert.equal(localStorage.length + sessionStorage.length, 0)
  assert.deepEqual(tokenCookiePathsToClearOf(['/console'], '/console/orders'), ['/', '/console', '/console/orders'])
})

test('memory keeps the token out of every store; the encoding round-trips', () => {
  const jar = fakeJar()
  configureTokenStore({ jar, storage: 'memory' })
  writeStoredToken('m')
  assert.equal(jar.cookies.size + localStorage.length + sessionStorage.length, 0)
  assert.equal(readStoredToken(), 'm')
  assert.equal(tokenCookieStringOf('n', 'a;b c', { path: '/', secure: false }), 'n=a%3Bb%20c; Path=/; SameSite=Strict')
  assert.equal(cookieValueOf('n=a%3Bb%20c', 'n'), 'a;b c')
})

test('the session record never goes into a cookie: descriptor in localStorage, secrets in sessionStorage', () => {
  const jar = fakeJar()
  configureTokenStore({ jar })
  const session = { providerId: 'acme', kind: 'oidc', issuer: 'https://idp', clientId: 'ui', refreshToken: 'r1', idToken: 'i1', expiresAt: 5 }
  writeStoredSession(session)
  assert.ok(!jar.read().includes('r1'))
  assert.ok(!localStorage.getItem('__mateu_auth_session').includes('r1'))
  assert.ok(sessionStorage.getItem('__mateu_auth_session_secrets').includes('r1'))
  assert.deepEqual(readStoredSession(), session)
  // another tab (its own sessionStorage) knows the session, without the refresh token
  const secrets = sessionStorage.getItem('__mateu_auth_session_secrets')
  sessionStorage.clear()
  assert.deepEqual(readStoredSession(), { providerId: 'acme', kind: 'oidc', issuer: 'https://idp', clientId: 'ui', expiresAt: 5 })
  // an earlier sign-in's secrets never merge into a newer descriptor
  writeStoredSession({ providerId: 'acme', kind: 'oidc' })
  sessionStorage.setItem('__mateu_auth_session_secrets', secrets)
  assert.equal(readStoredSession().refreshToken, undefined)
  writeStoredSession(null)
  assert.equal(readStoredSession(), null)
  assert.equal(localStorage.length + sessionStorage.length, 0)
})

test('a declared web storage keeps both halves there; memory in memory', () => {
  configureTokenStore({ jar: fakeJar(), storage: 'sessionStorage' })
  writeStoredSession({ providerId: 'p', kind: 'oidc', refreshToken: 'r' })
  assert.equal(localStorage.length, 0)
  assert.equal(readStoredSession().refreshToken, 'r')
  writeStoredSession(null)
  configureTokenStore({ storage: 'memory' })
  writeStoredSession({ providerId: 'p', kind: 'oidc', refreshToken: 'r' })
  assert.equal(localStorage.length + sessionStorage.length, 0)
  assert.equal(readStoredSession().refreshToken, 'r')
})

console.log(`test-auth-store: ${passed} OK`)
