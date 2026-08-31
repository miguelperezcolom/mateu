package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.MateuApiClient
import io.mateu.ijp.api.text
import io.mateu.ijp.state.Expressions

/**
 * Client-side consumption of arbitrary (non-Mateu) REST endpoints for widget-level surfaces
 * (@RestOptions combo options, @RestListing table rows) — the plugin analogue of the web's
 * libs/mateu externalOptions.ts. url/headers/body are interpolated against the given context and
 * the endpoint is fetched directly (no Mateu server mediating); path navigation mirrors getByPath.
 */
object RestFetch {

    /**
     * Client-side secure auth for DIRECT (non-proxy) external REST fetches: a host registers a
     * provider that supplies auth headers (e.g. a bearer token from a secure store) at fetch time,
     * so the token stays on the client and never rides the Mateu wire — the client-direct
     * counterpart of the server-side `proxy` mode. Its headers are merged LAST (they win over a
     * declared header). Ignored on the proxy path (secrets injected server-side). Null = none.
     */
    @Volatile
    var externalAuthProvider: ((url: String, method: String) -> Map<String, String>)? = null

    /** Auth headers for a direct fetch — empty when no provider is set or it throws. */
    fun authHeaders(url: String, method: String): Map<String, String> =
        externalAuthProvider?.let {
            runCatching { it(url, method) }.getOrElse {
                println("[Mateu] external auth provider failed: ${it.message}"); emptyMap()
            }
        } ?: emptyMap()

    /** Navigate a dot path (`data.items`, `name.common`) into a JSON value; blank path is identity. */
    fun valueAtPath(node: JsonNode?, path: String?): JsonNode? {
        if (node == null) return null
        if (path.isNullOrBlank()) return node
        var cur: JsonNode? = node
        for (key in path.split('.')) cur = cur?.get(key) ?: return null
        return cur
    }

    /** Fetch a RestDataSource node (`url`/`method`/`headers`/`body`), interpolating each against ctx. */
    fun fetch(apiClient: MateuApiClient, source: JsonNode, ctx: Map<String, Any?>): JsonNode {
        val url = Expressions.interpolate(source.text("url"), ctx)
        val method = source.text("method").ifBlank { "GET" }.uppercase()
        val headers = LinkedHashMap<String, String>()
        source.path("headers").fields().forEach { (k, v) -> headers[k] = Expressions.interpolate(v.asText(""), ctx) }
        val body = source.get("body")?.asText("").orEmpty().let { if (it.isBlank()) null else Expressions.interpolate(it, ctx) }
        // A registered client-side auth provider supplies dynamic headers (merged last, so it wins).
        headers.putAll(authHeaders(url, method))
        return apiClient.fetchExternal(url, method, headers, body)
    }
}
