package io.mateu.ijp.api

import java.net.URI

/**
 * WHERE the plugin may send the user's credentials — the Bearer token and the `X-Session-Id`. The
 * Kotlin twin of the web client's `credentialScope.ts` (libs/mateu `infra/http/credentialScope.ts`):
 * a url that comes in a server ANSWER (a MicroFrontend island's `baseUrl`, a chat's `sseUrl`) must
 * not receive them just because a backend named it.
 *
 * Two kinds of trusted origins:
 *  - ROOT: the backend the project is configured with, and whatever the host trusts explicitly
 *    ([trustRoot]).
 *  - DECLARED: a remote an app answered from a ROOT origin names (its islands) — the app's author
 *    chose it, as the server-side `mateu.remote.allowed-hosts` does for its own leg.
 *
 * A declared remote cannot extend the trust: the remotes IT names get no credentials. A relative url
 * belongs to the root backend (the IDE has no document origin).
 */
class CredentialScope(rootBaseUrl: String) {
    private val rootBase = rootBaseUrl.trim()
    private val roots = java.util.concurrent.ConcurrentHashMap.newKeySet<String>()
    private val declared = java.util.concurrent.ConcurrentHashMap.newKeySet<String>()

    init {
        trustRoot(rootBase)
    }

    /** An origin the host trusts with the user's credentials, beyond the configured backend. */
    fun trustRoot(url: String) {
        originOf(url, rootBase)?.let { roots.add(it) }
    }

    /** True when [url] goes to a ROOT origin. */
    fun isRoot(url: String?): Boolean = originOf(url, rootBase)?.let { it in roots } ?: false

    /** Remotes an app answered from [declarerBaseUrl] names. Trusted only when the declarer is ROOT. */
    fun declare(declarerBaseUrl: String, remoteBaseUrls: List<String?>) {
        if (!isRoot(declarerBaseUrl)) return
        remoteBaseUrls.forEach { url -> originOf(url, rootBase)?.let { declared.add(it) } }
    }

    /** True when a request to [url] may carry the user's credentials. */
    fun mayCarryCredentials(url: String?): Boolean {
        val origin = originOf(url, rootBase) ?: return false
        return origin in roots || origin in declared
    }

    companion object {
        private const val SAME_ORIGIN = "same-origin"
        private val SCHEME = Regex("^[a-zA-Z][a-zA-Z0-9+.-]*:")

        private fun isRelative(url: String) = !SCHEME.containsMatchIn(url) && !url.startsWith("//")

        /** The origin [url] goes to (`scheme://host[:port]`), or null when it is not http(s). A relative
         *  url resolves against [base]. */
        fun originOf(url: String?, base: String? = null): String? {
            val u = url?.trim() ?: return null
            if (isRelative(u)) {
                if (base == null || isRelative(base.trim())) return SAME_ORIGIN
                return originOf(base)
            }
            return runCatching {
                val uri = URI(if (u.startsWith("//")) "https:$u" else u)
                val scheme = uri.scheme?.lowercase()
                val host = uri.host?.lowercase()
                if ((scheme != "http" && scheme != "https") || host.isNullOrBlank()) return null
                val port = when (uri.port) {
                    -1, if (scheme == "http") 80 else 443 -> ""
                    else -> ":${uri.port}"
                }
                "$scheme://$host$port"
            }.getOrNull()
        }
    }
}
