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
// What the host supplies WINS over the stored token: the component speaks for the host page.
// Nothing here is set in the standalone app, so its behaviour is unchanged (resilience falls back to
// the stored token exactly as before).

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
