// Where the Redwood renderer keeps the Bearer token and the built-in sign-in's session record — the
// same policy as the web renderers (libs/mateu infra/http/authToken.ts + tokenCookie.ts and
// infra/auth/authSession.ts), ported because this renderer shares no code with them.
//
//  - The token: a COOKIE `__mateu_auth_token` by default (`Path` = the mount, `SameSite=Strict`,
//    `Secure` on https, no Domain, `Max-Age` = the token's life when known, else a session cookie).
//    It is the client's STORE, not the credential the server reads: requests keep carrying
//    `Authorization: Bearer` (resilience.mjs). A script-written cookie cannot be HttpOnly, so an XSS
//    reads it as it would read localStorage.
//    `<meta name="mateu-auth-token-storage" content="localStorage|sessionStorage|memory|cookie">`
//    picks another store. Writing never loses it: cookies disabled, a write that does not read
//    back, or a token too big for a cookie → sessionStorage, else memory. Reading: cookie →
//    the declared storage → sessionStorage → localStorage → memory. Writing or clearing removes
//    every other copy.
//  - The session record (`__mateu_auth_session`): NEVER in the cookie (it would travel with every
//    request and the refresh + id tokens overflow 4 KB). Split: the descriptor (no secrets) in
//    localStorage, the refresh/id tokens (`__mateu_auth_session_secrets`) in sessionStorage, both
//    tagged with one random key so an earlier sign-in's secrets never merge into a newer
//    descriptor; with a declared web storage both halves go there, with `memory` in memory.

const TOKEN_KEY = '__mateu_auth_token'
const SESSION_KEY = '__mateu_auth_session'
const SESSION_SECRETS_KEY = '__mateu_auth_session_secrets'
/** Name + value + attributes beyond this do not fit a cookie reliably (browsers cap ~4096). */
export const TOKEN_COOKIE_MAX_BYTES = 3800
const TOKEN_STORAGES = ['cookie', 'localStorage', 'sessionStorage', 'memory']

const documentJar = {
  read: () => { try { return typeof document !== 'undefined' && typeof document.cookie === 'string' ? document.cookie : '' } catch (e) { return '' } },
  write: (cookie) => { try { if (typeof document !== 'undefined') document.cookie = cookie } catch (e) { /* sandboxed: the read-back says so */ } },
  enabled: () => {
    try {
      if (typeof document === 'undefined' || typeof document.cookie !== 'string') return false
      return typeof navigator === 'undefined' || navigator.cookieEnabled !== false
    } catch (e) { return false }
  },
  secure: () => { try { return typeof location !== 'undefined' && location.protocol === 'https:' } catch (e) { return false } },
}

let tokenJar = documentJar
let tokenCookiePathValue = null
let declaredTokenStorage = null
let memoryStoredToken = null
let memoryDescriptor = null
let memorySecrets = null
const tokenWrittenPaths = new Set()

const tokenWebStore = (name) => { try { return globalThis[name] || null } catch (e) { return null } }
const tokenStoreGet = (name, key) => { try { const s = tokenWebStore(name); return s ? s.getItem(key) : null } catch (e) { return null } }
const tokenStoreSet = (name, key, value) => { try { const s = tokenWebStore(name); if (!s) return false; s.setItem(key, value); return true } catch (e) { return false } }
const tokenStoreRemove = (name, key) => { try { const s = tokenWebStore(name); if (s) s.removeItem(key) } catch (e) { /* nothing to do */ } }

/** The store in effect: declared (configureTokenStore / the meta), else the cookie. */
export function tokenStorage() {
  if (declaredTokenStorage) return declaredTokenStorage
  try {
    const meta = typeof document !== 'undefined' && typeof document.querySelector === 'function'
      ? document.querySelector('meta[name="mateu-auth-token-storage"]') : null
    const content = meta ? meta.getAttribute('content') : null
    if (TOKEN_STORAGES.includes(content)) return content
  } catch (e) { /* no document: the default */ }
  return 'cookie'
}

/** Test hook / explicit setting: `{ storage, cookiePath, jar }` (null jar = the document's). */
export function configureTokenStore(options = {}) {
  if (options.storage !== undefined) declaredTokenStorage = TOKEN_STORAGES.includes(options.storage) ? options.storage : null
  if (options.cookiePath !== undefined) tokenCookiePathValue = options.cookiePath || null
  if (options.jar !== undefined) tokenJar = options.jar || documentJar
}

/** loadMateuShell calls it with the mount (initMount): '' / null = the root. */
export function setTokenCookiePath(mount) {
  const path = typeof mount === 'string' ? mount.replace(/\/+$/, '') : ''
  tokenCookiePathValue = path && path.startsWith('/') ? path : '/'
}

export function tokenCookiePath() { return tokenCookiePathValue || '/' }

export function tokenCookieStringOf(name, value, { path, secure, maxAgeSeconds }) {
  let cookie = name + '=' + encodeURIComponent(value) + '; Path=' + path + '; SameSite=Strict'
  if (secure) cookie += '; Secure'
  if (maxAgeSeconds !== undefined) cookie += '; Max-Age=' + Math.max(0, Math.floor(maxAgeSeconds))
  return cookie
}

/** The FIRST cookie called `name` (the most specific path comes first). */
export function cookieValueOf(cookies, name) {
  for (const part of String(cookies || '').split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0 || part.slice(0, eq).trim() !== name) continue
    const raw = part.slice(eq + 1).trim()
    try { return raw ? decodeURIComponent(raw) : null } catch (e) { return raw || null }
  }
  return null
}

/** The `exp` of a JWT in ms, if the token is one (only to size the cookie's life, never trusted). */
export function jwtExpiresAtOf(token) {
  const parts = String(token).split('.')
  if (parts.length !== 3) return undefined
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)))
    return claims && typeof claims.exp === 'number' ? claims.exp * 1000 : undefined
  } catch (e) { return undefined }
}

/** Seconds the cookie lives: until the token expires when known and ahead, else undefined (session). */
export function tokenCookieMaxAgeOf(token, expiresAt, now) {
  const at = expiresAt != null ? expiresAt : jwtExpiresAtOf(token)
  if (at === undefined) return undefined
  const seconds = Math.floor((at - now) / 1000)
  return seconds > 0 ? seconds : undefined
}

/** Every path a token cookie may have been written under: the given ones, `/`, the page's ancestors. */
export function tokenCookiePathsToClearOf(paths, pathname) {
  const all = new Set(['/', ...paths])
  let acc = ''
  for (const s of String(pathname || '/').split('/').filter(Boolean)) { acc += '/' + s; all.add(acc) }
  return [...all]
}

const byteLengthOf = (s) => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(s).length : s.length)

function writeTokenCookie(token, expiresAt) {
  if (!tokenJar.enabled()) return false
  const path = tokenCookiePath()
  const cookie = tokenCookieStringOf(TOKEN_KEY, token, { path, secure: tokenJar.secure(), maxAgeSeconds: tokenCookieMaxAgeOf(token, expiresAt, Date.now()) })
  if (byteLengthOf(cookie) > TOKEN_COOKIE_MAX_BYTES) return false
  tokenJar.write(cookie)
  const ok = cookieValueOf(tokenJar.read(), TOKEN_KEY) === token
  if (ok) tokenWrittenPaths.add(path)
  return ok
}

function locateToken() {
  if (tokenStorage() === 'memory') return memoryStoredToken ? { at: 'memory', token: memoryStoredToken } : null
  const cookie = cookieValueOf(tokenJar.read(), TOKEN_KEY)
  if (cookie) return { at: 'cookie', token: cookie }
  const order = tokenStorage() === 'localStorage' ? ['localStorage', 'sessionStorage'] : ['sessionStorage', 'localStorage']
  for (const at of order) {
    const token = tokenStoreGet(at, TOKEN_KEY)
    if (token) return { at, token }
  }
  return memoryStoredToken ? { at: 'memory', token: memoryStoredToken } : null
}

/** The token (cookie first, see the header), or null. Never throws. */
export function readStoredToken() {
  try { const found = locateToken(); return found ? found.token : null } catch (e) { return null }
}

/** Where the token is now ('cookie', a storage, 'memory') or null — tests and diagnostics. */
export function storedTokenLocation() {
  try { const found = locateToken(); return found ? found.at : null } catch (e) { return null }
}

function clearTokenEverywhere(except) {
  if (except !== 'cookie') {
    let pathname = '/'
    try { if (typeof location !== 'undefined' && location.pathname) pathname = location.pathname } catch (e) { /* the root only */ }
    try {
      const secure = tokenJar.secure()
      for (const path of tokenCookiePathsToClearOf([tokenCookiePath(), ...tokenWrittenPaths], pathname)) {
        tokenJar.write(tokenCookieStringOf(TOKEN_KEY, '', { path, secure, maxAgeSeconds: 0 }))
      }
    } catch (e) { /* no cookies here */ }
    tokenWrittenPaths.clear()
  }
  if (except !== 'localStorage') tokenStoreRemove('localStorage', TOKEN_KEY)
  if (except !== 'sessionStorage') tokenStoreRemove('sessionStorage', TOKEN_KEY)
  if (except !== 'memory') memoryStoredToken = null
}

/** Stores the token (null clears it everywhere); `expiresAt` (ms) sizes the cookie's life. */
export function writeStoredToken(token, { expiresAt } = {}) {
  if (!token) { clearTokenEverywhere(); return }
  const storage = tokenStorage()
  const chain = storage === 'memory' ? ['memory'] : storage === 'cookie' ? ['cookie', 'sessionStorage', 'memory'] : [storage, 'memory']
  for (const at of chain) {
    let ok
    try {
      ok = at === 'cookie' ? writeTokenCookie(token, expiresAt)
        : at === 'memory' ? ((memoryStoredToken = token), true)
          : tokenStoreSet(at, TOKEN_KEY, token)
    } catch (e) { ok = false }
    if (ok) { clearTokenEverywhere(at); return }
  }
}

const sessionStoresOf = () => {
  switch (tokenStorage()) {
    case 'memory': return { descriptor: null, secrets: null }
    case 'sessionStorage': return { descriptor: 'sessionStorage', secrets: 'sessionStorage' }
    case 'localStorage': return { descriptor: 'localStorage', secrets: 'localStorage' }
    default: return { descriptor: 'localStorage', secrets: 'sessionStorage' }
  }
}
const tokenStoreJson = (raw) => { try { const v = JSON.parse(raw || 'null'); return v && typeof v === 'object' ? v : null } catch (e) { return null } }

/** The built-in sign-in's session (descriptor + this tab's secrets when they match), or null. */
export function readStoredSession() {
  const s = sessionStoresOf()
  const descriptor = s.descriptor ? tokenStoreJson(tokenStoreGet(s.descriptor, SESSION_KEY)) : memoryDescriptor
  if (!descriptor) return null
  const secrets = s.secrets ? tokenStoreJson(tokenStoreGet(s.secrets, SESSION_SECRETS_KEY)) : memorySecrets
  const { key, ...session } = descriptor
  const mine = secrets && secrets.key === key
  if (mine && secrets.refreshToken) session.refreshToken = secrets.refreshToken
  if (mine && secrets.idToken) session.idToken = secrets.idToken
  return session
}

const tokenSessionKey = () => {
  try { return globalThis.crypto.randomUUID() } catch (e) { return String(Math.random()).slice(2) + Date.now() }
}

/** Stores the session record split in two (see the header); null removes it from everywhere. */
export function writeStoredSession(session) {
  if (!session) {
    for (const name of ['localStorage', 'sessionStorage']) { tokenStoreRemove(name, SESSION_KEY); tokenStoreRemove(name, SESSION_SECRETS_KEY) }
    memoryDescriptor = null
    memorySecrets = null
    return
  }
  const { refreshToken, idToken, ...rest } = session
  const key = tokenSessionKey()
  const descriptor = { ...rest, key }
  const secrets = refreshToken || idToken ? { key, refreshToken, idToken } : null
  const s = sessionStoresOf()
  if (s.descriptor) tokenStoreSet(s.descriptor, SESSION_KEY, JSON.stringify(descriptor))
  else memoryDescriptor = descriptor
  if (s.secrets) {
    if (secrets) tokenStoreSet(s.secrets, SESSION_SECRETS_KEY, JSON.stringify(secrets))
    else tokenStoreRemove(s.secrets, SESSION_SECRETS_KEY)
  } else memorySecrets = secrets
}

/** For tests: back to the defaults. */
export function resetTokenStore() {
  tokenJar = documentJar
  tokenCookiePathValue = null
  declaredTokenStorage = null
  memoryStoredToken = null
  memoryDescriptor = null
  memorySecrets = null
  tokenWrittenPaths.clear()
}
