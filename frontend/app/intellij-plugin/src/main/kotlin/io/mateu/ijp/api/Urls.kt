package io.mateu.ijp.api

/**
 * URLs the wire carries as the browser would read them. On the web a root-relative url
 * (`/explorer-api/items`, a MicroFrontend's `baseUrl: /fed`, an image `/assets/x.svg`) is resolved
 * against the PAGE — the origin of the app's backend. The desktop has no page: handed to
 * `URI.create` as it came, such a url had no scheme and every request failed ("URI with undefined
 * scheme"), silently, leaving a listing with 0 rows and an island empty.
 */
object Urls {

    /** Whether [url] already names its scheme (`https:`, `http:`, `data:`, `mailto:`…). */
    fun isAbsolute(url: String): Boolean = Regex("^[A-Za-z][A-Za-z0-9+.-]*:").containsMatchIn(url.trim())

    /**
     * [url] resolved against [base] (the app's backend url): absolute urls are kept, `//host/x`
     * takes the base's scheme, `/x` its origin, and a bare relative `x` is read under the base.
     * A blank [url] stays blank; a base that is not a url leaves [url] as it was.
     */
    fun resolve(base: String?, url: String): String {
        val u = url.trim()
        if (u.isEmpty() || isAbsolute(u)) return u
        val b = base?.trim().orEmpty()
        if (!isAbsolute(b)) return u
        return runCatching { java.net.URI.create(b.trimEnd('/') + "/").resolve(u).toString() }.getOrDefault(u)
    }

    /** The scheme + host (+ port) of [url], or null when it is not an absolute url. */
    fun origin(url: String): String? = runCatching {
        val uri = java.net.URI.create(url.trim())
        if (uri.scheme == null || uri.host == null) null
        else "${uri.scheme}://${uri.host}${if (uri.port >= 0) ":${uri.port}" else ""}"
    }.getOrNull()
}
