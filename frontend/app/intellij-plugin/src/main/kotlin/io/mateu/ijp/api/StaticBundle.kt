package io.mateu.ijp.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.node.TextNode

/**
 * A UI whose screens ship as a STATIC BUNDLE (`mateu-bundle:bundle` → `<base>/manifest.json`): every
 * route LOAD is answered from it instead of POSTing `/mateu/v3/sync`, exactly as the web renderers do
 * — and the JSON is the same wire the server would have answered, so the desktop renders it as it is.
 * ACTIONS still go to the server ([MateuApiClient]): a hybrid site (bundle + its `/mateu/` paths behind a
 * backend) has one; a purely static host has none and says so.
 *
 * A Kotlin port of the PRE-RENDERED half of libs/mateu `infra/http/bundleResolver.ts` (+ RN's
 * `core/staticBundle.ts`): exported entries, `:param` templates, the shell-vs-content rule (#557),
 * the registry's parameter precedence, the route's query, `${i18n.…}`, and the manifest's REST source
 * catalogue handed to the app shell. NOT ported: specs mode (raw definitions expanded on the client —
 * that is the web expander); such a route answers nothing here, and the server is asked instead.
 * The bundle is DATA: parsed and read, never executed.
 */
class StaticBundle(manifest: JsonNode, private val locales: () -> List<String> = { listOf(java.util.Locale.getDefault().toLanguageTag()) }) {

    private class Template(val regex: Regex, val paramNames: List<String>, val increment: JsonNode, val content: JsonNode?)

    private val increments = LinkedHashMap<String, JsonNode>()
    private val contents = LinkedHashMap<String, JsonNode>()
    private val templates = ArrayList<Template>()
    private val routeEntries: List<JsonNode> = manifest.path("routes").path("routes").let { if (it.isArray) it.toList() else emptyList() }
    private val sources: JsonNode = manifest.path("sources").path("sources")
    private val actions: JsonNode = manifest.path("actions")
    private val mockSources: Boolean = manifest.path("mockSources").asBoolean(false)
    private val translations: Map<String, Map<String, String>> = parseTranslations(manifest.path("translations"))

    init {
        val entries = manifest.path("entries")
        if (entries.isArray) for (e in entries) {
            if (!e.path("ok").asBoolean(false) || !e.path("json").isTextual) continue
            runCatching {
                val inc = MAPPER.readTree(e.path("json").asText())
                val content = e.path("contentJson").takeIf { it.isTextual }?.let { MAPPER.readTree(it.asText()) }
                val pattern = e.path("routePattern").takeIf { it.isTextual && it.asText().isNotEmpty() }?.asText()
                if (pattern != null) {
                    val names = e.path("paramNames").let { n -> if (n.isArray) n.map { it.asText() } else emptyList() }
                    templates += Template(Regex(pattern), names, inc, content)
                } else {
                    val path = e.path("syncPath").asText()
                    increments[path] = inc
                    if (content != null) contents[path] = content
                }
            }
        }
    }

    /** True when the bundle answers anything at all (pre-rendered routes or templates). */
    fun isEmpty(): Boolean = increments.isEmpty() && templates.isEmpty()

    /** The bundle's answer to a route LOAD (`route` with its query, `consumedRoute` as sent), or null. */
    fun answer(route: String?, consumedRoute: String?): JsonNode? {
        val syncPath = toSyncPath(route)
        val raw = resolveLoadRaw(syncPath, consumedRoute) ?: return null
        val answer = localize(withQueryParams(syncPath, raw.deepCopy(), queryOf(route)))
        return withCatalogue(answer)
    }

    // ── the resolver (bundleResolver.ts, same names) ─────────────────────────────────────────────

    private fun resolveLoadRaw(syncPath: String, consumedRoute: String?): JsonNode? {
        // as on the web: only "_empty" (or nothing) is fresh — a menu leaf's content load sends ""
        val fresh = consumedRoute == null || consumedRoute == "_empty"
        fun own(): JsonNode? = bundledIncrement(syncPath) ?: bundledTemplate(syncPath, content = false)
        if (fresh) {
            val answer = own()
            if (answer != null && appShellOf(answer) != null) return aimedAt(answer, syncPath)
            // a route of the root mount, or one the bundle cannot answer: the fresh load is the shell
            if (syncPath != NO_ROUTE && (matchRouteEntry(syncPath) != null || answer == null)) {
                val root = bundledIncrement(NO_ROUTE)
                if (root != null && appShellOf(root) != null) return aimedAt(root, syncPath)
            }
            return answer
        }
        // a CONTENT load is never answered with a shell (#557: nested shells)
        val exported = contents[syncPath]?.let { applyRouteParams(syncPath, it) } ?: bundledTemplate(syncPath, content = true)
        if (exported != null) return exported
        val answer = own()
        return if (answer != null && appShellOf(answer) != null) null else answer
    }

    private fun bundledIncrement(syncPath: String): JsonNode? = increments[syncPath]?.let { applyRouteParams(syncPath, it) }

    private fun bundledTemplate(syncPath: String, content: Boolean): JsonNode? {
        for (t in templates) {
            val m = t.regex.find(syncPath) ?: continue
            val increment = (if (content) t.content else t.increment) ?: return null
            val params = LinkedHashMap<String, String>()
            t.paramNames.forEachIndexed { i, name -> m.groupValues.getOrNull(i + 1)?.let { params[name] = it } }
            val copy = increment.deepCopy<JsonNode>()
            for (f in fragments(copy)) {
                // the PLACEHOLDER captured at export time in initialData gives way to the real value
                (f.path("component").path("initialData") as? ObjectNode)?.let { putAll(it, params) }
                putAll(objectAt(f, "state"), params)
                putAll(objectAt(f, "data"), params)
            }
            return applyRouteParams(syncPath, copy)
        }
        return null
    }

    /** fixed > path > what the increment carries > state seeds > defaults; `appState:` under the increment's. */
    private fun applyRouteParams(syncPath: String, increment: JsonNode): JsonNode {
        val (entry, pathParams) = matchRouteEntry(syncPath) ?: return increment
        val defaults = withDefaults(fields(entry.path("defaultParams")), fields(entry.path("state")))
        val fixed = fields(entry.path("fixedParams"))
        val appSeed = fields(entry.path("appState"))
        if (defaults.isEmpty() && fixed.isEmpty() && pathParams.isEmpty() && appSeed.isEmpty()) return increment
        val out = increment.deepCopy<JsonNode>() as? ObjectNode ?: return increment
        if (appSeed.isNotEmpty()) {
            val merged = JsonNodeFactory.instance.objectNode()
            appSeed.forEach { (k, v) -> merged.set<JsonNode>(k, v) }
            (out.path("appState") as? ObjectNode)?.fields()?.forEach { (k, v) -> merged.set<JsonNode>(k, v) }
            out.set<JsonNode>("appState", merged)
        }
        for (f in fragments(out)) {
            for (key in listOf("state", "data")) {
                val target = objectAt(f, key)
                val carried = fields(target)
                target.removeAll()
                withDefaults(defaults, carried).forEach { (k, v) -> target.set<JsonNode>(k, v) }
                pathParams.forEach { (k, v) -> target.put(k, v) }
                fixed.forEach { (k, v) -> target.set<JsonNode>(k, v) }
            }
        }
        return out
    }

    /** query below fixed and path params; an app shell is left alone (its content load carries it). */
    private fun withQueryParams(syncPath: String, answer: JsonNode, query: Map<String, String>): JsonNode {
        if (query.isEmpty() || appShellOf(answer) != null) return answer
        val match = matchRouteEntry(syncPath)
        val fixed = match?.first?.path("fixedParams")
        val params = query.filterKeys { k -> fixed?.has(k) != true && match?.second?.containsKey(k) != true }
        if (params.isEmpty()) return answer
        for (f in fragments(answer)) {
            putAll(objectAt(f, "state"), params)
            putAll(objectAt(f, "data"), params)
        }
        return answer
    }

    /** Static routes before parameterised ones; among those, the most specific wins (RouteTable.match). */
    private fun matchRouteEntry(path: String): Pair<JsonNode, Map<String, String>>? {
        val target = segmentsOf(if (path == NO_ROUTE) "" else path)
        var best: Pair<JsonNode, Map<String, String>>? = null
        for (entry in routeEntries) {
            val params = pathParamsOf(segmentsOf(entry.path("route").asText("")), target) ?: continue
            if (best == null || paramCount(entry) < paramCount(best.first)) best = entry to params
        }
        return best
    }

    private fun paramCount(entry: JsonNode) = segmentsOf(entry.path("route").asText("")).count { it.startsWith(":") && it.length > 1 }

    private fun pathParamsOf(pattern: List<String>, target: List<String>): Map<String, String>? {
        if (pattern.size != target.size) return null
        val out = LinkedHashMap<String, String>()
        for (i in pattern.indices) {
            val seg = pattern[i]
            if (seg.startsWith(":") && seg.length > 1) out[seg.substring(1)] = target[i]
            else if (seg != target[i]) return null
        }
        return out
    }

    /** The shell aimed at `syncPath`: its content slot loads `homeRoute`, as the server answers a deep link. */
    private fun aimedAt(shell: JsonNode, syncPath: String): JsonNode {
        if (syncPath == NO_ROUTE) return shell
        val copy = shell.deepCopy<JsonNode>()
        (fragments(copy).firstOrNull()?.path("component")?.path("metadata") as? ObjectNode)?.put("homeRoute", "/$syncPath")
        return copy
    }

    /** The app shell carries the manifest's catalogue: re-pointing a deployment is an edit of `sources`. */
    private fun withCatalogue(increment: JsonNode): JsonNode {
        for (f in fragments(increment)) {
            val metadata = f.path("component").path("metadata") as? ObjectNode ?: continue
            if (metadata.path("type").asText() != "App") continue
            if (sources.isArray) metadata.set<JsonNode>("restSources", sources.deepCopy())
            if (mockSources) metadata.put("mockSources", true)
            if (actions.isArray) metadata.set<JsonNode>("actionCatalogue", actions.deepCopy())
        }
        return increment
    }

    // ── `${i18n.…}` (infra/i18n/translations.ts) ─────────────────────────────────────────────────

    private fun localize(value: JsonNode): JsonNode {
        if (translations.isEmpty() || !I18N.containsMatchIn(value.toString())) return value
        val own = appShellOf(increments[NO_ROUTE])?.path("locale")?.takeIf { it.isTextual }?.asText()
        val locale = pickLocale(translations, listOfNotNull(own) + locales())
        val fallback = pickLocale(translations, emptyList())
        val messages = locale?.let { translations[it] }
        val fallbackMessages = fallback?.takeIf { it != locale }?.let { translations[it] }
        return translateDeep(value, messages, fallbackMessages)
    }

    private fun translateDeep(v: JsonNode, messages: Map<String, String>?, fallback: Map<String, String>?): JsonNode = when {
        v.isTextual -> TextNode(I18N.replace(v.asText()) { m -> messages?.get(m.groupValues[1]) ?: fallback?.get(m.groupValues[1]) ?: m.groupValues[1] })
        v is ArrayNode -> JsonNodeFactory.instance.arrayNode().also { a -> v.forEach { a.add(translateDeep(it, messages, fallback)) } }
        v is ObjectNode -> JsonNodeFactory.instance.objectNode().also { o -> v.fields().forEach { (k, c) -> o.set<JsonNode>(k, translateDeep(c, messages, fallback)) } }
        else -> v
    }

    companion object {
        const val NO_ROUTE = "_no_route"
        /** Where `mateu-bundle:bundle` writes the manifest, relative to the UI's base URL. */
        const val MANIFEST = "manifest.json"
        /** A manifest larger than this is refused (a hostile address must not exhaust the app). */
        const val MAX_BYTES = 20_000_000
        private val MAPPER = ObjectMapper()
        private val I18N = Regex("\\$\\{\\s*i18n\\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\\s*\\}")

        /** A JSON document with a bundle's shape: an `entries` list (pre-rendered — what this port reads). */
        fun isBundleManifest(raw: JsonNode?): Boolean = raw != null && raw.isObject && raw.path("entries").isArray

        /** The manifest's path relative to the base URL: a plain relative `.json` path, nothing else
         *  (no scheme, host, `..` or query — a UI manifest must never point the app at another server). */
        fun bundlePath(path: String?): String? {
            if (path.isNullOrEmpty()) return MANIFEST
            val p = path.trim()
            if (p.length > 200 || !Regex("^[A-Za-z0-9._~-]+(/[A-Za-z0-9._~-]+)*\\.json$").matches(p)) return null
            if (p.split('/').any { it == ".." || it == "." }) return null
            return p
        }

        /** `/mateu/v3/sync/<seg>` for a route: leading slash and query dropped, root → `_no_route`. */
        fun toSyncPath(route: String?): String {
            val path = route?.substringBefore('?') ?: ""
            val r = path.removePrefix("/")
            return r.ifEmpty { NO_ROUTE }
        }

        /** A route's query parameters, the first value of each. */
        fun queryOf(route: String?): Map<String, String> {
            val q = route?.substringAfter('?', "")?.takeIf { it.isNotEmpty() } ?: return emptyMap()
            val out = LinkedHashMap<String, String>()
            for (pair in q.split('&')) {
                if (pair.isEmpty()) continue
                val k = java.net.URLDecoder.decode(pair.substringBefore('='), Charsets.UTF_8)
                val v = java.net.URLDecoder.decode(pair.substringAfter('=', ""), Charsets.UTF_8)
                out.putIfAbsent(k, v)
            }
            return out
        }

        /** exact → language → `en` → the first locale the catalogue has. */
        fun pickLocale(catalogue: Map<String, Map<String, String>>, preferred: List<String?>): String? {
            if (catalogue.isEmpty()) return null
            fun norm(l: String?) = (l ?: "").trim().replace('_', '-').lowercase()
            fun find(l: String) = catalogue.keys.firstOrNull { norm(it) == l }
            for (p in preferred) {
                val n = norm(p)
                if (n.isEmpty()) continue
                find(n)?.let { return it }
                find(n.substringBefore('-'))?.let { return it }
            }
            return find("en") ?: catalogue.keys.first()
        }

        private fun parseTranslations(node: JsonNode): Map<String, Map<String, String>> {
            if (!node.isObject) return emptyMap()
            val out = LinkedHashMap<String, Map<String, String>>()
            node.fields().forEach { (locale, msgs) ->
                if (msgs.isObject) out[locale] = msgs.fields().asSequence().filter { it.value.isTextual }.associate { it.key to it.value.asText() }
            }
            return out
        }

        private fun appShellOf(increment: JsonNode?): JsonNode? =
            increment?.path("fragments")?.path(0)?.path("component")?.path("metadata")?.takeIf { it.path("type").asText() == "App" }

        private fun fragments(increment: JsonNode): List<ObjectNode> =
            increment.path("fragments").let { f -> if (f.isArray) f.filterIsInstance<ObjectNode>() else emptyList() }

        private fun objectAt(parent: ObjectNode, key: String): ObjectNode =
            parent.get(key) as? ObjectNode ?: parent.putObject(key)

        private fun fields(node: JsonNode): LinkedHashMap<String, JsonNode> {
            val out = LinkedHashMap<String, JsonNode>()
            if (node.isObject) node.fields().forEach { (k, v) -> out[k] = v }
            return out
        }

        private fun putAll(target: ObjectNode, params: Map<String, String>) = params.forEach { (k, v) -> target.put(k, v) }

        /** `carried` with `defaults` filling every key it has no value for (a null is no value). */
        private fun withDefaults(defaults: Map<String, JsonNode>, carried: Map<String, JsonNode>): LinkedHashMap<String, JsonNode> {
            val out = LinkedHashMap<String, JsonNode>(defaults)
            out.putAll(carried)
            for ((k, v) in defaults) if (out[k] == null || out[k]!!.isNull) out[k] = v
            return out
        }

        private fun segmentsOf(route: String): List<String> = route.trim('/').let { if (it.isEmpty()) emptyList() else it.split('/') }
    }
}
