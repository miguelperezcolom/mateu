package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
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

    // ── REST source catalogue (resolution by `ref`) ─────────────────────────
    // The app ships a catalogue of named endpoints (AppDto.restSources); a surface may reference an
    // entry by `ref` instead of inlining the url + mapping paths. Plugin analogue of the web's
    // libs/mateu restSourceCatalogue.ts: register the catalogue when the App metadata arrives, then
    // resolve a `ref` to the entry's `source` (the surface's own declared fields still win).
    @Volatile
    private var catalogue: Map<String, JsonNode> = emptyMap()

    /** Store the app's REST source catalogue (`AppDto.restSources`, a list of `{name, source, …}`). */
    fun registerRestSources(sources: JsonNode?) {
        val map = LinkedHashMap<String, JsonNode>()
        if (sources != null && sources.isArray) {
            for (entry in sources) {
                val name = entry.path("name").asText("")
                if (name.isNotBlank()) map[name] = entry
            }
        }
        catalogue = map
    }

    /** The catalogue entry for a name, or null. */
    fun restSource(ref: String?): JsonNode? = if (ref.isNullOrBlank()) null else catalogue[ref]

    /**
     * If `source` names a catalogue entry by `ref`, merge the entry's `source` fields under the
     * surface's own (the surface wins where it declares a non-blank value). A source without a `ref`
     * — or a ref the catalogue does not know — is returned untouched. Reads `proxy` off the RESOLVED
     * source (a by-ref surface carries no proxy of its own), matching the web's resolveRestSource.
     */
    fun resolveRestSource(source: JsonNode): JsonNode {
        val ref = source.path("ref").asText("")
        if (ref.isBlank()) return source
        val from = restSource(ref)?.path("source")
        if (from == null || from.isMissingNode || !from.isObject) {
            println("[Mateu] no REST source named \"$ref\" in the app's catalogue")
            return source
        }
        val merged = from.deepCopy<ObjectNode>()
        if (source is ObjectNode) {
            for (key in listOf("url", "method", "body", "itemsPath", "valuePath", "labelPath")) {
                val v = source.get(key)
                if (v != null && !v.isNull && v.asText("").isNotBlank()) merged.set<JsonNode>(key, v)
            }
            val headers = source.get("headers")
            if (headers != null && headers.isObject && headers.size() > 0) merged.set<JsonNode>("headers", headers)
        }
        val proxy = source.path("proxy").asBoolean(false) || from.path("proxy").asBoolean(false)
        merged.put("proxy", proxy)
        return merged
    }

    /** Navigate a dot path (`data.items`, `name.common`) into a JSON value; blank path is identity. */
    fun valueAtPath(node: JsonNode?, path: String?): JsonNode? {
        if (node == null) return null
        if (path.isNullOrBlank()) return node
        var cur: JsonNode? = node
        for (key in path.split('.')) cur = cur?.get(key) ?: return null
        return cur
    }

    /** Fetch a RestDataSource node (`url`/`method`/`headers`/`body`), interpolating each against ctx.
     *  Resolves a catalogue `ref` first. */
    fun fetch(apiClient: MateuApiClient, declared: JsonNode, ctx: Map<String, Any?>): JsonNode {
        val source = resolveRestSource(declared)
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
