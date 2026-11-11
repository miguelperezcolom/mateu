/**
 * The sign-in providers a UI declares (`mateu.auth.providers…`, a `SignInProvidersSupplier`,
 * `@MobileApp(oidcIssuer…)`), as the served page states them:
 * `<meta name="mateu-auth" content="{…the auth block, filtered to platform web…}">`.
 *
 * Pure: it reads and normalises the declaration and decides what the client shows at boot. The
 * flows themselves (PKCE, the code exchange, refresh, sign-out) live in signInFlow.ts, a lazy
 * chunk loaded only when a page declares providers. The same rules are in Redwood's
 * poc/signIn.mjs, both held to conformance/client/sign-in-flow.json.
 */

export type SignInProviderType = 'oidc' | 'redirect'
export type SignInPlatform = 'web' | 'mobile' | 'desktop'

/** Brand tokens a provider may name; renderers draw a neutral glyph for them, never artwork. */
export const SIGN_IN_ICONS = [
    'google', 'microsoft', 'apple', 'github', 'facebook', 'x', 'linkedin', 'gitlab', 'okta', 'auth0', 'keycloak', 'key',
] as const
export type SignInIcon = typeof SIGN_IN_ICONS[number]

export interface SignInProvider {
    id: string
    type: SignInProviderType
    label: string
    icon: SignInIcon
    issuer?: string
    clientId?: string
    scopes: string[]
    audience?: string
    url?: string
    platforms: SignInPlatform[]
    /** Redirect providers: add `continue=<current url>` to `url` (default true). */
    continueParam: boolean
}

export interface SignInConfig {
    loginOnStart: boolean
    providers: SignInProvider[]
    logoutUrl?: string
}

const PLATFORMS: SignInPlatform[] = ['web', 'mobile', 'desktop']
const DEFAULT_SCOPES = ['openid', 'profile']

const text = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined

const list = (v: unknown): string[] | undefined =>
    Array.isArray(v) ? v.map(text).filter((s): s is string => !!s)
        : typeof v === 'string' ? v.split(/[\s,]+/).filter(Boolean) : undefined

/** One provider as declared, or null when it cannot be used (unknown type, no issuer/client/url). */
export const normaliseProvider = (raw: unknown): SignInProvider | null => {
    if (!raw || typeof raw !== 'object') return null
    const p = raw as Record<string, unknown>
    const id = text(p.id)
    const type = text(p.type)?.toLowerCase()
    if (!id || (type !== 'oidc' && type !== 'redirect')) return null
    const issuer = text(p.issuer)
    const clientId = text(p.clientId)
    const url = text(p.url)
    if (type === 'oidc' && (!issuer || !clientId)) return null
    if (type === 'redirect' && !url) return null
    const icon = (text(p.icon)?.toLowerCase() ?? 'key') as SignInIcon
    const declaredPlatforms = list(p.platforms)?.map((s) => s.toLowerCase())
        .filter((s): s is SignInPlatform => (PLATFORMS as string[]).includes(s))
    return {
        id,
        type,
        label: text(p.label) ?? id,
        icon: (SIGN_IN_ICONS as readonly string[]).includes(icon) ? icon : 'key',
        ...(type === 'oidc' ? { issuer: issuer!.replace(/\/+$/, ''), clientId } : { url }),
        scopes: type === 'oidc' ? (list(p.scopes)?.length ? list(p.scopes)! : DEFAULT_SCOPES) : [],
        ...(text(p.audience) ? { audience: text(p.audience) } : {}),
        platforms: declaredPlatforms?.length ? declaredPlatforms : (type === 'oidc' ? [...PLATFORMS] : ['web']),
        continueParam: p.continueParam !== false,
    }
}

/**
 * The auth block, normalised, with only the providers usable on `platform` (in declared order, a
 * repeated id keeps its first declaration). Null when there is nothing to sign in with. A block
 * that predates `providers` (only `type: oidc` + `issuer` + `clientId`) is provider `default`.
 */
export const parseSignInConfig = (raw: unknown, platform: SignInPlatform = 'web'): SignInConfig | null => {
    if (!raw || typeof raw !== 'object') return null
    const auth = raw as Record<string, unknown>
    const declared = Array.isArray(auth.providers) ? auth.providers
        : auth.type === 'oidc' ? [{ id: 'default', type: 'oidc', label: undefined, issuer: auth.issuer, clientId: auth.clientId, scopes: auth.scopes, audience: auth.audience }]
            : []
    const seen = new Set<string>()
    const providers = declared.map(normaliseProvider)
        .filter((p): p is SignInProvider => !!p && p.platforms.includes(platform))
        .filter((p) => !seen.has(p.id) && !!seen.add(p.id))
    if (providers.length === 0) return null
    const logoutUrl = text(auth.logoutUrl)
    return {
        loginOnStart: auth.loginOnStart !== false,
        providers,
        ...(logoutUrl ? { logoutUrl } : {}),
    }
}

export const SIGN_IN_META = 'mateu-auth'

/** The page's `<meta name="mateu-auth">`, parsed; null when absent or unreadable. Never throws. */
export const readSignInConfig = (doc: Document | undefined = typeof document !== 'undefined' ? document : undefined): SignInConfig | null => {
    try {
        const content = doc?.querySelector(`meta[name="${SIGN_IN_META}"]`)?.getAttribute('content')
        return content ? parseSignInConfig(JSON.parse(content)) : null
    } catch {
        return null
    }
}

export type SignInPlan =
    | { show: 'nothing' }
    | { show: 'provider', provider: SignInProvider }
    | { show: 'chooser', providers: SignInProvider[] }

/**
 * What the client shows when the user must sign in (`required`: at boot with `loginOnStart` and no
 * session, or after a 401 nobody else handled): one provider → straight to it; several → the
 * chooser. `failed` (the last attempt came back with an error) always shows the chooser, even for
 * one provider, so a broken IdP is a message and not a redirect loop.
 */
export const signInPlan = (config: SignInConfig | null, required: boolean, failed = false): SignInPlan => {
    if (!config || !required) return { show: 'nothing' }
    if (config.providers.length === 1 && !failed) return { show: 'provider', provider: config.providers[0] }
    return { show: 'chooser', providers: config.providers }
}

/** Whether boot must sign in first: `loginOnStart` and no session. */
export const signInRequiredAtBoot = (config: SignInConfig | null, hasSession: boolean): boolean =>
    !!config && config.loginOnStart && !hasSession

/** The neutral glyph's text for a provider: its brand's initial, or nothing for the generic key. */
export const signInGlyph = (provider: Pick<SignInProvider, 'icon' | 'label'>): string => {
    if (provider.icon === 'key') return ''
    if (provider.icon === 'x') return 'X'
    return (provider.icon[0] ?? provider.label[0] ?? '').toUpperCase()
}

/**
 * Where a REDIRECT provider sends the browser: its `url` (resolved against the page) plus
 * `continue=<the current URL>` unless the provider opts out. Only http(s) URLs are followed;
 * undefined for anything else.
 */
export const redirectProviderUrl = (provider: Pick<SignInProvider, 'url' | 'continueParam'>, currentHref: string): string | undefined => {
    if (!provider.url) return undefined
    try {
        const url = new URL(provider.url, currentHref)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
        if (provider.continueParam) url.searchParams.set('continue', currentHref)
        return url.href
    } catch {
        return undefined
    }
}

/**
 * The OIDC redirect URI of this UI: the mount's root on the page's origin (`<origin><baseUrl>/`;
 * `<origin>/` for a root mount or a backend on another origin). One fixed address per mount, so
 * it can be registered with the IdP; the route the user was on travels in the pending sign-in and
 * is restored after the callback.
 */
export const oidcRedirectUri = (baseUrl: string | undefined, currentHref: string): string => {
    const page = new URL(currentHref)
    try {
        const base = new URL(baseUrl || '/', page.href)
        if (base.origin === page.origin) {
            return base.origin + (base.pathname.endsWith('/') ? base.pathname : base.pathname + '/')
        }
    } catch {
        // an unparseable base url: the origin's root
    }
    return page.origin + '/'
}
