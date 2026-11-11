/**
 * The Bearer token kept in a COOKIE: the web client's default store (authToken.ts).
 *
 * The cookie is the CLIENT's store, not a credential the server reads: requests still carry
 * `Authorization: Bearer …` and the servers validate that header. It is written by script, so it
 * cannot be HttpOnly (only a server's Set-Cookie can) — an XSS can read it exactly as it could read
 * localStorage. What the cookie adds over localStorage: `SameSite=Strict`, `Secure` on https, a
 * `Path` scoped to the mount, and an expiry (`Max-Age`) that follows the token's, so a token that
 * expired is not left lying around.
 *
 * Attributes: `<name>=<token>; Path=<mount or />; SameSite=Strict[; Secure][; Max-Age=<s>]` — no
 * Domain (host-only). A browser refuses a cookie over ~4 KB, so a bigger token (name + value +
 * attributes over {@link TOKEN_COOKIE_MAX_BYTES}) is not written here: the caller falls back to
 * web storage. Same rules as the Redwood renderer (apps/redwood/poc/authStore.mjs).
 */

/** Name + value + attributes beyond this do not fit a cookie reliably (browsers cap ~4096). */
export const TOKEN_COOKIE_MAX_BYTES = 3800

/** Where cookies are read and written (the document's by default; swappable in tests). */
export interface CookieJar {
    read(): string
    write(cookie: string): void
    enabled(): boolean
    secure(): boolean
}

export const documentCookieJar: CookieJar = {
    read: () => {
        try {
            return typeof document !== 'undefined' ? document.cookie ?? '' : ''
        } catch {
            return ''
        }
    },
    write: (cookie) => {
        try {
            if (typeof document !== 'undefined') document.cookie = cookie
        } catch {
            // a sandboxed document: not written (the read-back says so)
        }
    },
    enabled: () => {
        try {
            if (typeof document === 'undefined') return false
            return typeof navigator === 'undefined' || navigator.cookieEnabled !== false
        } catch {
            return false
        }
    },
    secure: () => {
        try {
            return typeof location !== 'undefined' && location.protocol === 'https:'
        } catch {
            return false
        }
    },
}

const byteLength = (s: string) => new TextEncoder().encode(s).length

/** The cookie string that stores `value` (or deletes it, with `maxAgeSeconds: 0`). */
export const tokenCookieString = (name: string, value: string, options: {
    path: string, secure: boolean, maxAgeSeconds?: number,
}): string => {
    let cookie = `${name}=${encodeURIComponent(value)}; Path=${options.path}; SameSite=Strict`
    if (options.secure) cookie += '; Secure'
    if (options.maxAgeSeconds !== undefined) cookie += `; Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`
    return cookie
}

/** The FIRST cookie called `name` in a `document.cookie` string (the most specific path comes first). */
export const cookieValue = (cookies: string, name: string): string | null => {
    for (const part of cookies.split(';')) {
        const eq = part.indexOf('=')
        if (eq < 0) continue
        if (part.slice(0, eq).trim() !== name) continue
        const raw = part.slice(eq + 1).trim()
        try {
            return raw ? decodeURIComponent(raw) : null
        } catch {
            return raw || null
        }
    }
    return null
}

/** The `exp` of a JWT in ms, if the token is one (read only to size the cookie's life, never trusted). */
export const jwtExpiresAt = (token: string): number | undefined => {
    const parts = token.split('.')
    if (parts.length !== 3) return undefined
    try {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)))
        return typeof json?.exp === 'number' ? json.exp * 1000 : undefined
    } catch {
        return undefined
    }
}

/** Seconds the cookie lives: until the token expires, when known and still ahead; else a session cookie. */
export const cookieMaxAge = (token: string, expiresAt: number | undefined, now: number): number | undefined => {
    const at = expiresAt ?? jwtExpiresAt(token)
    if (at === undefined) return undefined
    const seconds = Math.floor((at - now) / 1000)
    return seconds > 0 ? seconds : undefined // a clock behind the IdP's: keep it for the session
}

/** The cookie Path for a mount: the base url's path when it is same-origin, else `/`. */
export const cookiePathOf = (baseUrl: string | undefined, href: string): string => {
    try {
        const page = new URL(href)
        const base = new URL(baseUrl || '/', page.href)
        if (base.origin !== page.origin) return '/'
        const path = base.pathname.replace(/\/+$/, '')
        return path || '/'
    } catch {
        return '/'
    }
}

/**
 * Writes the token cookie. False when it was NOT stored — cookies disabled, too big, or the write
 * did not read back — so the caller keeps the token somewhere else instead of losing it.
 */
export const writeTokenCookie = (name: string, token: string, options: {
    path: string, expiresAt?: number, now?: number,
}, jar: CookieJar = documentCookieJar): boolean => {
    if (!jar.enabled()) return false
    const cookie = tokenCookieString(name, token, {
        path: options.path, secure: jar.secure(),
        maxAgeSeconds: cookieMaxAge(token, options.expiresAt, options.now ?? Date.now()),
    })
    if (byteLength(cookie) > TOKEN_COOKIE_MAX_BYTES) return false
    jar.write(cookie)
    return cookieValue(jar.read(), name) === token
}

/** The paths a token cookie may have been written under: the given ones, `/` and the page's ancestors. */
export const cookiePathsToClear = (paths: string[], pathname: string): string[] => {
    const all = new Set<string>(['/', ...paths])
    const segments = pathname.split('/').filter(Boolean)
    let acc = ''
    for (const s of segments) {
        acc += '/' + s
        all.add(acc)
    }
    return [...all]
}

/** Deletes the token cookie under every path it may have been written with. */
export const clearTokenCookie = (name: string, paths: string[], jar: CookieJar = documentCookieJar) => {
    const secure = jar.secure()
    for (const path of paths) jar.write(tokenCookieString(name, '', { path, secure, maxAgeSeconds: 0 }))
}
