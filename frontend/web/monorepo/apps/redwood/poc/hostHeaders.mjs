// The HOST's identity on every Mateu request — for the embedded mode (poc/embedded.mjs), where the
// renderer runs as a <mateu-ui> component inside somebody else's Visual Builder app and the
// identity belongs to THAT app, not to a bootstrap page of ours.
//
// The standalone app reads its token from localStorage (resilience.storedToken: the bootstrap page
// keeps it there). A host app has no such page: it hands its identity to the component as a
// static token, a static header object or a PROVIDER — a function (sync or async) called on every
// send, so a host whose token rotates (the VB security provider, an OAuth refresh) is asked again
// each time, and the retry after a 401 carries the new one.
//
// What the host supplies REPLACES the stored token: the component speaks for the host page, so
// while a provider is configured the stored token is never sent — a provider answering no
// Authorization (or failing) means "no session", not "use whatever is in storage". Nothing here is
// set in the standalone app, so its behaviour is unchanged (resilience reads the stored token).

let hostProvider = null
let hostCredentialsMode
// the last headers a provider answered: what the sync callers get (the chat stream and the client
// log build their own fetch and cannot await a provider on every keystroke)
let lastHostHeaders = {}

/**
 * The host's headers: an object ({Authorization: 'Bearer …', 'X-Tenant': …}), a function returning
 * one (or a Promise of one), or null to stop sending them.
 */
export function setHostHeaderProvider(provider) {
  hostProvider = provider == null ? null : provider
  lastHostHeaders = typeof provider === 'object' && provider ? cleanHeaders(provider) : {}
}

export function hasHostHeaderProvider() { return hostProvider != null }

/** fetch's `credentials` for the Mateu calls ('include' sends the host's cookies cross-origin). */
export function setHostCredentials(mode) {
  hostCredentialsMode = mode === 'include' || mode === 'same-origin' || mode === 'omit' ? mode : undefined
}

export function hostCredentials() { return hostCredentialsMode }

/** Only string-valued, non-empty headers: a provider answering {Authorization: undefined} (no
 *  token YET) must not send the literal "undefined". */
export function cleanHeaders(headers) {
  const out = {}
  if (!headers || typeof headers !== 'object') return out
  for (const name of Object.keys(headers)) {
    const value = headers[name]
    if (value == null || value === '') continue
    out[name] = String(value)
  }
  return out
}

/** The host's headers for a request to `url` ({} without a provider, or when it fails: a provider
 *  that throws must not take the request down with it — the backend will say 401, which is the
 *  honest answer). */
export async function hostHeadersFor(url) {
  if (hostProvider == null) return {}
  try {
    const value = typeof hostProvider === 'function' ? await hostProvider(url) : hostProvider
    lastHostHeaders = cleanHeaders(value)
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('mateu: the host header provider failed', e)
    lastHostHeaders = {}
  }
  return lastHostHeaders
}

/** The headers the provider answered last: for the callers that cannot await. */
export function lastHostHeadersOf() { return { ...lastHostHeaders } }

/** The host defines Authorization itself (case-insensitive): the stored token must not override it. */
export function hostAuthorizes(headers) {
  return !!headers && Object.keys(headers).some((h) => h.toLowerCase() === 'authorization')
}

// ── where OUR stored token may go (M-S5) ─────────────────────────────────────────────────────────
// The stored Bearer used to ride on every Mateu request whatever its origin: a federated remote got
// it, and so did any remote a remote named. It now goes to the page's own origin, the base the
// shell booted against, and the remotes THAT app names in its menu — never to the remotes a remote
// names. (A host's own provider — embedded mode — is asked with the url and decides for itself.)

const rootCredentialOrigins = new Set()
const declaredCredentialOrigins = new Set()

function credentialOriginOf(url) {
  try {
    const page = typeof location !== 'undefined' && location.href ? location.href : undefined
    const parsed = page ? new URL(String(url ?? ''), page) : new URL(String(url ?? ''))
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : null
  } catch (e) {
    return null
  }
}

function isRootCredentialOrigin(origin) {
  const page = typeof location !== 'undefined' && location.href ? credentialOriginOf(location.href) : null
  return origin === page || rootCredentialOrigins.has(origin)
}

/** The base the shell boots against: the page (or its configuration) chose it. */
export function trustShellBase(base) {
  const origin = credentialOriginOf(base || '/')
  if (origin) rootCredentialOrigins.add(origin)
}

/** The remotes the SHELL's app names (expandRemoteMenus): trusted like the app that names them. */
export function trustDeclaredRemoteBases(bases) {
  for (const base of bases || []) {
    const origin = credentialOriginOf(base)
    if (origin) declaredCredentialOrigins.add(origin)
  }
}

// what a url without a page resolves against (node, a worker): its origin means "relative"
const CREDENTIAL_PLACEHOLDER_BASE = 'http://relative.mateu.invalid/'

/**
 * True when `url` is on an origin the shell trusts — its own backend, a remote ITS app names. The
 * one rule for the stored token AND for what may render with the author's trust (callMateu, an
 * agent navigation's base url). The url is RESOLVED the way the browser resolves it before it is
 * judged: `\\host`, `/\host`, `\/host` and a tab inside `//` all name another origin, which a
 * "no scheme, not //" shortcut took for relative (R4).
 */
export function isTrustedOrigin(url) {
  const text = String(url ?? '')
  const page = typeof location !== 'undefined' && location.href ? location.href : undefined
  let parsed
  try {
    parsed = new URL(text, page || CREDENTIAL_PLACEHOLDER_BASE)
  } catch (e) {
    return false
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
  // no page to resolve against: a url that stayed on the placeholder was relative — the page's own
  if (!page && parsed.origin === new URL(CREDENTIAL_PLACEHOLDER_BASE).origin) return true
  return isRootCredentialOrigin(parsed.origin) || declaredCredentialOrigins.has(parsed.origin)
}

/** True when a request to `url` may carry the stored token. */
export function storedTokenMayGoTo(url) {
  return isTrustedOrigin(url)
}

/** Tests only. */
export function resetCredentialOrigins() {
  rootCredentialOrigins.clear()
  declaredCredentialOrigins.clear()
}
