package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode

/**
 * What the panel does with a UI event the agent sent — decided here, applied by the panel (on the
 * EDT, as soon as the event arrives, mid-stream). Pure, so the catalogue is unit-tested.
 */
object ChatEvents {
    private val mapper = ObjectMapper()

    sealed interface Effect {
        /** Open a screen exactly like a click on a menu entry carrying these fields. */
        data class Navigate(val entry: JsonNode) : Effect

        /** Close the chat panel. */
        data object Close : Effect

        /** The shell renders a screen itself, through the reserved `__preview__` sync action. */
        data class RenderScreen(val yaml: String, val target: String, val title: String?) : Effect

        /** Hand it to the in-app event bus (`@SubscribeTo` / OnCustomEvent triggers). */
        data class Bus(val event: String, val detail: JsonNode) : Effect

        /** Nothing to do (a render-screen with neither yaml nor uidl, a navigation without a route). */
        data object Ignore : Effect
    }

    const val PREVIEW_ACTION = "__preview__"

    /**
     * [hasSubscriber]: whether a component on screen subscribes to [event] — then it gets it, like
     * any other event, and the shell does nothing more (that is how a component claims render-screen).
     */
    fun decide(event: String, detail: JsonNode, hasSubscriber: (String) -> Boolean, menu: JsonNode? = null): Effect = when (event) {
        "navigation-requested" -> navigation(detail, menu)
        "close-requested" -> Effect.Close
        "render-screen" -> if (hasSubscriber(event)) Effect.Bus(event, detail) else renderScreen(detail)
        else -> Effect.Bus(event, detail)
    }

    /**
     * A navigation-requested detail as a menu entry: all its fields (route, consumedRoute, actionId,
     * baseUrl, serverSideType, uriPrefix) travel, plus a label for the tab — the matching menu
     * entry's, else the route.
     */
    fun navigation(detail: JsonNode, menu: JsonNode? = null): Effect {
        if (!detail.isObject) return Effect.Ignore
        val route = detail.path("route").asText("")
        val actionId = detail.path("actionId").asText("")
        if (route.isBlank() && actionId.isBlank()) return Effect.Ignore
        val entry = (detail.deepCopy<JsonNode>() as ObjectNode)
        if (entry.path("label").asText("").isBlank()) {
            entry.put("label", labelOf(menu, route, entry.path("consumedRoute").asText("")) ?: route.ifBlank { actionId })
        }
        return Effect.Navigate(entry)
    }

    /** The label of the menu leaf serving [route] (and [consumedRoute] when it names one), if any. */
    fun labelOf(menu: JsonNode?, route: String, consumedRoute: String = ""): String? {
        if (menu == null || !menu.isArray || route.isBlank()) return null
        for (opt in menu) {
            val subs = opt.path("submenus")
            if (subs.isArray && !subs.isEmpty) {
                labelOf(subs, route, consumedRoute)?.let { return it }
                continue
            }
            val sameRoute = opt.path("route").asText("").trimEnd('/') == route.trimEnd('/')
            val sameConsumed = consumedRoute.isBlank() || opt.path("consumedRoute").asText("") == consumedRoute
            if (sameRoute && sameConsumed) return opt.path("label").asText("").ifBlank { null }
        }
        return null
    }

    /** render-screen → the YAML the `__preview__` action renders (a non-string uidl as JSON); target defaults to content. */
    fun renderScreen(detail: JsonNode): Effect {
        val yaml = detail.path("yaml")
        val uidl = detail.path("uidl")
        val source = when {
            yaml.isTextual -> yaml.asText()
            uidl.isTextual -> uidl.asText()
            uidl.isContainerNode -> mapper.writeValueAsString(uidl)
            else -> return Effect.Ignore
        }
        val target = when (val t = detail.path("target").asText("")) {
            "drawer", "dialog" -> t
            else -> "content"
        }
        return Effect.RenderScreen(source, target, detail.path("title").asText("").ifBlank { null })
    }

    /** The parameters of the `__preview__` sync action. An agent wrote the definition, so it is marked
     *  UNTRUSTED: the backend strips everything script-capable from it (conformance/untrusted). */
    fun previewParameters(yaml: String): Map<String, Any?> = mapOf("_yaml" to yaml, "_untrusted" to true)
}
