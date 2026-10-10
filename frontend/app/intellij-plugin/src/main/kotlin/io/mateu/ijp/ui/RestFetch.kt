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
        // the entry's sample (or the one its own source carries) unless the surface declares one
        val ownSample = source.get("sample")
        val sample = if (ownSample != null && !ownSample.isNull) ownSample
            else restSource(ref)?.get("sample")?.takeIf { !it.isNull } ?: from.get("sample")?.takeIf { !it.isNull }
        if (sample != null) merged.set<JsonNode>("sample", sample) else merged.remove("sample")
        return merged
    }

    // ── Sample mode ─────────────────────────────────────────────────────────
    // A source may carry SAMPLE data (`sample:` / `sampleFile:` in sources.yaml, or `sample:` inline):
    // the response the endpoint would return. It answers INSTEAD of calling the endpoint only in
    // sample mode — the same rule as libs/mateu restSourceCatalogue.ts and the server's SampleSources.
    // The plugin loads no bundles and its visual editor runs the web bundle, so the ONLY switch here
    // is the app metadata (`AppDto.mockSources: true`, sent when the server opted in with
    // mateu.sources.mock=true). Only ever switched ON by the app; never silently in production.
    @Volatile
    var sampleMode: Boolean = false
        private set

    /** Turns sample mode on (or off — only tests do that). */
    fun setSampleMode(on: Boolean) {
        sampleMode = on
    }

    /** The sample a source answers with in sample mode (resolving its `ref`); null when it is not
     *  answered from a sample (sample mode off, or the source carries none). */
    fun sampleOf(source: JsonNode?): JsonNode? {
        if (!sampleMode || source == null || source.isMissingNode || source.isNull) return null
        return resolveRestSource(source).get("sample")?.takeIf { !it.isNull && !it.isMissingNode }
    }

    /** True when this source is answered from its sample — neither fetched nor proxied, and a
     *  listing over it searches, filters, sorts and pages in memory. */
    fun isSampled(source: JsonNode?): Boolean = sampleOf(source) != null

    /** Whether the fetch goes through the Mateu server: the RESOLVED `proxy`, unless sample mode
     *  answers it on the client. */
    fun viaProxy(source: JsonNode?): Boolean =
        source != null && !source.isMissingNode && resolveRestSource(source).path("proxy").asBoolean(false) &&
            !isSampled(source)

    /** The sample-mode answer for a call: a READ gets a deep copy of the sample, a WRITE succeeds
     *  with JSON null (nothing persisted, nothing to merge). Kotlin null = not sampled, do the call. */
    fun sampledResponse(source: JsonNode?, method: String? = null): JsonNode? {
        val sample = sampleOf(source) ?: return null
        val m = method.orEmpty().ifBlank { resolveRestSource(source!!).text("method") }.ifBlank { "GET" }.uppercase()
        if (m != "GET" && m != "HEAD") return com.fasterxml.jackson.databind.node.NullNode.instance
        return sample.deepCopy()
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
        // SAMPLE mode: a sampled source is not fetched — a read gets a copy of the sample, a write null.
        sampledResponse(declared)?.let { return it }
        val source = resolveRestSource(declared)
        val url = Expressions.interpolateUrl(source.text("url"), ctx)
        val method = source.text("method").ifBlank { "GET" }.uppercase()
        val headers = LinkedHashMap<String, String>()
        source.path("headers").properties().forEach { (k, v) -> headers[k] = Expressions.interpolate(v.asText(""), ctx) }
        val body = source.get("body")?.asText("").orEmpty().let { if (it.isBlank()) null else Expressions.interpolate(it, ctx) }
        // A registered client-side auth provider supplies dynamic headers (merged last, so it wins).
        headers.putAll(authHeaders(url, method))
        return apiClient.fetchExternal(url, method, headers, body)
    }
}
