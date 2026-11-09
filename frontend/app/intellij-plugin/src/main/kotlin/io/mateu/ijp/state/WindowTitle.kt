package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode

/**
 * The view's title once a YAML record page's data is in — the plugin's twin of libs/mateu
 * `infra/ui/windowTitle.ts` and React Native `core/windowTitle.ts`.
 *
 * The server names the view (SetWindowTitle) while it builds the screen. A record page defined in
 * YAML (`title: ${state.name}`, its record loaded by the route's `data:` source) is named before its
 * record exists, so the server falls back to the route ("28") while the page header shows
 * "Voyager 1". The title follows the routed page's own title template once it resolves.
 */
object WindowTitle {

    private val PAGE_TYPES = setOf("Form", "Page")

    /** A plain `${state.name}` reference of a title template. */
    private val STATE_REF = Regex("""\$\{\s*state\.([A-Za-z_]\w*)\s*}""")

    /** The routed page's title template: the first Form/Page title that is a template, depth-first. */
    fun template(component: JsonNode?, depth: Int = 0): String? {
        if (component == null || !component.isObject || depth > 4) return null
        val md = component.path("metadata")
        val title = md.path("title")
        if (md.path("type").asText() in PAGE_TYPES && title.isTextual && title.asText().contains("\${")) return title.asText()
        for (child in component.path("children")) template(child, depth + 1)?.let { return it }
        return null
    }

    /** The page's title resolved against its state, or null while anything is unresolved. */
    fun resolved(component: JsonNode?, state: Map<String, Any?>): String? {
        val template = template(component) ?: return null
        // a state value the page does not have yet (a route parameter the client has not seeded) is
        // unresolved, not empty: "Mission ${state.missionId}" must not become the title "Mission"
        if (STATE_REF.findAll(template).any { state[it.groupValues[1]] == null }) return null
        val title = runCatching { Expressions.interpolate(template, mapOf("state" to state)).trim() }.getOrNull() ?: return null
        return title.takeIf { it.isNotEmpty() && !it.contains("\${") }
    }
}
