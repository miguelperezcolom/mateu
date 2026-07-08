package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.ui.ComponentRenderer
import java.awt.BorderLayout
import javax.swing.BoxLayout
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JOptionPane
import javax.swing.JPanel
import javax.swing.SwingUtilities

/** A toolbar button published to a native host toolbar (editor header / tool window title). */
data class ToolbarSpec(
    val actionId: String,
    val label: String,
    val disabled: Boolean,
    val primary: Boolean,
)

/**
 * Per-view session/navigation state and the UIIncrement applier — the Swing port of the JavaFX
 * `AppContext`. Keeps the imperative model intact: a [registry] of slot panels mutated in place, a
 * [dataHandlers] map for data-only fragments, `currentRoute`/`componentState`/… nav context, and
 * `applyIncrement` → fragments/messages/commands/appState. Only the widget layer and threading
 * change (Swing components + [SwingUtilities.invokeLater] + [AppSession.executor]).
 */
class AppContext(val session: AppSession) {

    val apiClient get() = session.apiClient
    val appState get() = session.appState
    val mapper get() = session.mapper

    /** The default slot this context renders into (the app shell's `ux_main` content area). */
    var contentPane: JComponent? = null

    var currentRoute: String = ""
    var currentConsumedRoute: String = ""
    var currentServerSideType: String = ""

    /**
     * The CRUD mediator's internal route currently rendered in this context (e.g. "list",
     * "0001/view"), seeded from the `_route` a content fragment carries. A state-only fragment whose
     * `_route` matches it is a stay-in-place response (e.g. a row action's "/list" + re-search) —
     * the web mediator only remounts on a route CHANGE, so neither do we.
     */
    private var currentInnerRoute: String = ""
    var currentComponentId: String = "ux_main"
    var currentComponentState: MutableMap<String, Any?> = HashMap()

    /** Fired once, with `isCrud`, when this view's first real content is rendered (host placement hook). */
    var onFirstContent: ((Boolean) -> Unit)? = null
    private var firstContentFired = false

    /**
     * When set (on a CRUD listing context), a row-detail / new / edit navigation opens in a NEW
     * editor tab through this opener instead of re-rendering this context's slot in place — so the
     * listing stays put in the bottom tool window. Args: (label, route, consumedRoute, serverSideType).
     */
    var detailOpener: ((String, String, String, String) -> Unit)? = null

    /** When true, load/action failures are logged instead of shown in a dialog (used by embedded islands). */
    var silentErrors = false

    /**
     * True when the host renders this view's toolbar natively (an ActionToolbar in the editor-tab
     * header, or the bottom tool window's title actions) — the desktop-idiomatic spot for view
     * actions. Page/Crud toolbar buttons then publish into [viewActions] via [publishToolbar]
     * instead of rendering as inline Swing buttons. Embedded islands keep it false (inline).
     */
    var nativeToolbarHost = false

    /** The current view's toolbar buttons, refreshed on every top-level render (host reads it live). */
    val viewActions: MutableList<ToolbarSpec> = ArrayList()

    /** Fired after [viewActions] changes so the host can nudge its toolbar to refresh. */
    var onViewActionsChanged: (() -> Unit)? = null

    /** Claim [buttons] for the native host toolbar; false → the renderer keeps them inline. */
    fun publishToolbar(buttons: List<JsonNode>): Boolean {
        if (!nativeToolbarHost) return false
        val specs = buttons.mapNotNull { b ->
            val actionId = b.text("actionId", b.text("id"))
            if (actionId.isBlank()) null else ToolbarSpec(
                actionId = actionId,
                label = b.text("label", actionId),
                disabled = b.bool("disabled"),
                primary = b.text("buttonStyle").equals("Primary", ignoreCase = true),
            )
        }
        // Idempotent: an in-place re-render of the same view (state-only update, validation error)
        // republishes the same buttons — replace, don't accumulate.
        viewActions.removeAll(specs)
        viewActions.addAll(specs)
        onViewActionsChanged?.invoke()
        return true
    }

    // Action ids the currently-loaded server-side component declares (for action bubbling).
    private var currentComponentActions: List<String> = emptyList()
    private var currentComponentValidations: JsonNode? = null
    private var currentActionValidationRequired: MutableMap<String, Boolean> = HashMap()
    private var currentActionBubble: MutableMap<String, Boolean> = HashMap()

    /** Inline field validation errors (fieldId → message), consumed by the form field renderer. */
    val currentFieldErrors: MutableMap<String, String> = HashMap()
    private var currentFormChildren: JsonNode? = null
    private var currentFormContainer: JComponent? = null

    // CRUD orchestrator/mediator owning the current area, for action bubbling.
    private var orchestratorServerSideType: String = ""
    private var orchestratorComponentRoute: String = ""

    private val registry: MutableMap<String, JComponent> = HashMap()
    private val dataHandlers: MutableMap<String, (JsonNode) -> Unit> = HashMap()

    // ── slot helpers ────────────────────────────────────────────────────────────────
    /**
     * A slot panel. A single child fills the slot (BorderLayout.CENTER) so tables/forms expand to
     * the viewport; multiple children stack vertically.
     */
    fun newSlot(): JPanel = JPanel(BorderLayout())

    private fun fill(target: JComponent, node: JComponent, add: Boolean) {
        if (add) {
            // Append: convert to a vertical stack, preserving what's already there.
            val existing = target.components.toList()
            target.removeAll()
            target.layout = BoxLayout(target, BoxLayout.Y_AXIS)
            for (c in existing) target.add(c)
            node.alignmentX = java.awt.Component.LEFT_ALIGNMENT
            target.add(node)
        } else {
            target.removeAll()
            target.layout = BorderLayout()
            target.add(node, BorderLayout.CENTER)
        }
        target.revalidate()
        target.repaint()
    }

    /** Render [children] into [container]: one child fills (BorderLayout), several stack vertically. */
    private fun putChildren(container: JComponent, renderer: ComponentRenderer, children: JsonNode, state: JsonNode, data: JsonNode) {
        container.removeAll()
        val list = if (children.isArray) children.toList() else emptyList()
        if (list.size == 1) {
            container.layout = BorderLayout()
            container.add(renderer.render(list[0], state, data), BorderLayout.CENTER)
        } else {
            container.layout = BoxLayout(container, BoxLayout.Y_AXIS)
            for (child in list) {
                val c = renderer.render(child, state, data)
                c.alignmentX = java.awt.Component.LEFT_ALIGNMENT
                container.add(c)
            }
        }
        container.revalidate()
        container.repaint()
    }

    fun registerComponent(id: String?, pane: JComponent) {
        if (!id.isNullOrBlank()) registry[id] = pane
    }

    fun registerDataHandler(id: String?, handler: (JsonNode) -> Unit) {
        if (!id.isNullOrBlank()) dataHandlers[id] = handler
    }

    // ── navigation / actions ─────────────────────────────────────────────────────────
    fun initialLoad(route: String?) {
        background(
            work = { apiClient.initialLoad(route, appState) },
            onOk = { increment ->
                currentRoute = route ?: ""
                applyIncrement(increment)
            },
            onErr = { showError("Load failed: ${it.message}") },
        )
    }

    fun navigate(route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) {
        val target = contentPane ?: return
        val loading = loadingLabel()
        fill(target, loading, add = false)
        background(
            work = {
                if (!actionId.isNullOrBlank()) {
                    apiClient.runAction(
                        route, consumedRoute ?: "", actionId, serverSideType,
                        currentComponentId, currentComponentState, appState, emptyMap(),
                    )
                } else {
                    apiClient.navigate(route, consumedRoute, serverSideType, appState)
                }
            },
            onOk = { increment ->
                currentRoute = route ?: ""
                currentConsumedRoute = consumedRoute ?: ""
                currentServerSideType = serverSideType ?: ""
                currentComponentState = HashMap()
                applyIncrement(increment)
                // If the response carried no component for the content slot (e.g. a backend error
                // with only a message), drop the spinner instead of leaving it stuck on "Loading…".
                clearStaleLoading(target, loading)
            },
            onErr = {
                clearStaleLoading(target, loading)
                showError("Navigation failed: ${it.message}")
            },
        )
    }

    /** Removes [loading] from [target] if it is still the only thing there (nothing replaced it). */
    private fun clearStaleLoading(target: JComponent, loading: JComponent) {
        if (target.componentCount == 1 && target.getComponent(0) === loading) {
            target.removeAll()
            target.revalidate()
            target.repaint()
        }
    }

    fun runAction(actionId: String, parameters: Map<String, Any?>?, silent: Boolean = false) {
        if (contentPane == null) return

        // Client-side validation: actions flagged validationRequired only fire if every validation
        // condition holds; otherwise surface inline field errors and re-render in place.
        if (currentActionValidationRequired[actionId] == true) {
            val fieldErrors = collectFieldErrors()
            currentFieldErrors.clear()
            if (fieldErrors.isNotEmpty()) {
                currentFieldErrors.putAll(fieldErrors)
                rerenderCurrentForm()
                return
            }
        }

        val serverSideType = resolveActionTarget(actionId)
        background(
            work = {
                apiClient.runAction(
                    currentRoute, currentConsumedRoute, actionId, serverSideType,
                    currentComponentId, currentComponentState, appState, parameters ?: emptyMap(),
                )
            },
            onOk = { increment ->
                currentComponentState = HashMap()
                applyIncrement(increment)
            },
            onErr = {
                if (silent) println("[Mateu] action '$actionId' failed: ${it.message}")
                else showError("Action failed: ${it.message}")
            },
        )
    }

    // ── action bubbling / validation (framework-neutral, ported verbatim) ─────────────
    fun captureComponentContext(sscNode: JsonNode, serverSideType: String) {
        val actions = ArrayList<String>()
        val validationFlags = HashMap<String, Boolean>()
        val bubbleFlags = HashMap<String, Boolean>()
        val actionNodes = sscNode.path("actions")
        if (actionNodes.isArray) {
            for (a in actionNodes) {
                val id = a.text("id")
                if (id.isNotBlank()) {
                    actions.add(id)
                    validationFlags[id] = a.bool("validationRequired")
                    bubbleFlags[id] = a.bool("bubble")
                }
            }
        }
        currentComponentActions = actions
        currentActionValidationRequired = validationFlags
        currentActionBubble = bubbleFlags
        currentComponentValidations = sscNode.path("validations")

        val initialData = sscNode.path("initialData")
        val componentRoute = initialData.text("componentRoute", initialData.text("_componentRoute"))
        if (componentRoute.isNotBlank() && serverSideType.isNotBlank()) {
            orchestratorServerSideType = serverSideType
            orchestratorComponentRoute = componentRoute
        }
    }

    private fun ownsAction(actionId: String?): Boolean {
        if (actionId == null) return false
        for (owned in currentComponentActions) {
            if (owned == actionId) return true
            if (owned.endsWith("*") && actionId.startsWith(owned.dropLast(1))) return true
        }
        return false
    }

    private fun resolveActionTarget(actionId: String): String {
        val bubble = !ownsAction(actionId) || (currentActionBubble[actionId] == true)
        if (bubble &&
            orchestratorServerSideType.isNotBlank() &&
            orchestratorServerSideType != currentServerSideType &&
            currentRoute.startsWith(orchestratorComponentRoute)
        ) {
            return orchestratorServerSideType
        }
        return currentServerSideType
    }

    private fun collectFieldErrors(): Map<String, String> {
        val errors = LinkedHashMap<String, String>()
        val validations = currentComponentValidations ?: return errors
        if (!validations.isArray) return errors
        for (v in validations) {
            val condition = v.text("condition")
            if (condition.isNotBlank() && !evalCondition(condition, currentComponentState)) {
                val fieldId = v.text("fieldId")
                val message = v.text("message", "Invalid value")
                errors.putIfAbsent(fieldId, message)
            }
        }
        return errors
    }

    private fun rerenderCurrentForm() {
        val container = currentFormContainer ?: return
        val children = currentFormChildren ?: return
        val liveState: JsonNode = mapper.valueToTree(currentComponentState)
        SwingUtilities.invokeLater {
            putChildren(container, ComponentRenderer(this), children, liveState, liveState)
        }
    }

    private fun evalCondition(condition: String, state: Map<String, Any?>): Boolean {
        val cond = condition.trim()
        val c = COMPARISON.matcher(cond)
        if (c.matches()) {
            val left = toDouble(state[c.group(1)])
            val right = c.group(3).toDouble()
            return when (c.group(2)) {
                ">=" -> left >= right
                "<=" -> left <= right
                ">" -> left > right
                "<" -> left < right
                "==" -> left == right
                "!=" -> left != right
                else -> true
            }
        }
        val t = TRUTHY.matcher(cond)
        if (t.matches()) return truthy(state[t.group(1)])
        return true
    }

    private fun truthy(v: Any?): Boolean = when (v) {
        null -> false
        is JsonNode -> when {
            v.isNull || v.isMissingNode -> false
            v.isTextual -> v.asText().isNotBlank()
            v.isNumber -> v.asDouble() != 0.0
            v.isBoolean -> v.asBoolean()
            else -> !v.isEmpty
        }
        is String -> v.isNotBlank()
        is Number -> v.toDouble() != 0.0
        is Boolean -> v
        else -> true
    }

    private fun toDouble(v: Any?): Double = try {
        when (v) {
            is JsonNode -> if (v.isNumber) v.asDouble() else if (v.isTextual) v.asText().toDouble() else 0.0
            is Number -> v.toDouble()
            is String -> v.toDouble()
            else -> 0.0
        }
    } catch (e: NumberFormatException) {
        0.0
    }

    // ── increment application ─────────────────────────────────────────────────────────
    fun applyIncrement(increment: JsonNode?) {
        if (increment == null) return

        val fragments = increment.path("fragments")
        if (fragments.isArray) for (fragment in fragments) applyFragment(fragment)

        val messages = increment.path("messages")
        if (messages.isArray) {
            for (msg in messages) {
                val text = msg.text("text")
                val variant = msg.text("variant", "info")
                if (text.isNotBlank()) SwingUtilities.invokeLater { showMessage(text, variant) }
            }
        }

        val commands = increment.path("commands")
        if (commands.isArray) for (cmd in commands) handleCommand(cmd)

        val newAppState = increment.path("appState")
        if (!newAppState.isNull && newAppState.isObject) {
            newAppState.fields().forEach { (k, v) -> appState[k] = v }
        }
    }

    private fun applyFragment(fragment: JsonNode) {
        val targetId = fragment.text("targetComponentId")
        val action = fragment.text("action", "Replace")
        val component = fragment.path("component")
        val state = fragment.path("state")
        val data = fragment.path("data")

        val target = if (targetId.isBlank()) contentPane else (registry[targetId] ?: contentPane)

        if (component.isNull || component.isMissingNode) {
            // Data-only fragment — push to a registered data handler (e.g. Crud search results).
            if (!data.isNull && !data.isMissingNode) {
                val key = targetId.ifBlank { "ux_main" }
                val handler = dataHandlers[key] ?: dataHandlers["crud"]
                if (handler != null) handler(data)
                return
            }
            // State-only navigation fragment from a CRUD orchestrator (view/new/save): follow up by
            // loading the resolved full route (desktop stand-in for the web's history navigation).
            if (state.isObject && state.has("_route") && state.has("_componentRoute")) {
                val stateComp = state.text("_componentRoute")
                // The mediator emits a route RELATIVE to its component route; when it doesn't repeat
                // that prefix (`_componentRoute` == ""), fall back to this context's consumed route
                // (e.g. "/products") — otherwise the route would be a bare "/0130" that resolves to
                // nothing (or back to the listing).
                val base = stateComp.ifBlank { currentConsumedRoute }
                val routeSuffix = state.text("_route")
                if (currentInnerRoute.isNotBlank() && routeSuffix.trim('/') == currentInnerRoute) {
                    // Same inner route as what's already rendered (e.g. a row action answering
                    // "/list" to a listing): stay put — a RunAction command (e.g. "search") in the
                    // same increment refreshes the data.
                    state.fields().forEach { (k, v) -> currentComponentState[k] = v }
                    return
                }
                val fullRoute = base + routeSuffix
                val sst = if (orchestratorServerSideType.isNotBlank() && orchestratorComponentRoute == stateComp) {
                    orchestratorServerSideType
                } else {
                    currentServerSideType
                }
                val opener = detailOpener
                val isDetail = routeSuffix.isNotBlank() && fullRoute != base
                if (opener != null && isDetail) {
                    // CRUD list → detail/new/edit: open in a central editor tab; the listing stays
                    // in the bottom tool window untouched (its inner route doesn't change).
                    val label = detailLabel(routeSuffix)
                    SwingUtilities.invokeLater { opener(label, fullRoute, base, sst) }
                } else {
                    currentInnerRoute = routeSuffix.trim('/')
                    SwingUtilities.invokeLater { navigate(fullRoute, base, sst, "") }
                }
                return
            }
            // State-only update with NO navigation route: an action mutated its model and the server
            // sent the fresh state (e.g. a @Toolbar method adding a grid row). The web merges it into
            // the component state and re-renders — do the same with the captured form children.
            if (state.isObject && state.fieldNames().hasNext()) {
                state.fields().forEach { (k, v) -> currentComponentState[k] = v }
                rerenderCurrentForm()
            }
            return
        }

        if (target == null) return
        // A content fragment carrying the mediator's `_route` tells us which inner route is being
        // rendered (e.g. "list" on the listing load) — the baseline for stay-in-place detection.
        if (target === contentPane && state.isObject && state.has("_route")) {
            currentInnerRoute = state.text("_route").trim('/')
        }
        // Fresh top-level content → the native host toolbar starts from scratch; the render below
        // republishes the new view's buttons through publishToolbar.
        if (target === contentPane && nativeToolbarHost) viewActions.clear()
        // Already on the EDT (applyIncrement is invoked from a background() onOk hop), so render
        // synchronously — this lets navigate() detect afterwards whether the slot was replaced.
        val renderer = ComponentRenderer(this)
        val rendered = renderer.render(component, state, data)
        fill(target, rendered, add = action.equals("Add", ignoreCase = true))

        // First time this view's real content (a Crud/Page/Form, not a bare mediator) lands in its
        // root slot, tell the host whether it's a Crud — so it can place the listing in the bottom
        // tool window and everything else (incl. row details) in the central editor.
        if (!firstContentFired && target === contentPane && containsType(component, REAL_CONTENT)) {
            firstContentFired = true
            onFirstContent?.invoke(containsType(component, CRUD_ONLY))
        }
    }

    private fun containsType(node: JsonNode, types: Set<String>): Boolean {
        if (node.isNull || node.isMissingNode) return false
        if (node.path("metadata").text("type") in types) return true
        val children = node.path("children")
        if (children.isArray) for (c in children) if (containsType(c, types)) return true
        val content = node.path("metadata").path("content")
        if (content.isObject && containsType(content, types)) return true
        return false
    }

    private fun handleCommand(cmd: JsonNode) {
        val type = cmd.text("type")
        val cmdData = cmd.path("data")
        when (type) {
            "SetWindowTitle" -> {
                val title = if (cmdData.isTextual) cmdData.asText() else cmdData.text("title")
                if (title.isNotBlank() && !title.startsWith("[")) session.setWindowTitle(title)
            }
            "NavigateTo" -> {
                val href = if (cmdData.isTextual) cmdData.asText() else cmdData.text("href")
                if (href.isNotBlank()) SwingUtilities.invokeLater { navigate(href, "", null, "") }
            }
            "RunAction" -> {
                // E.g. a row action's follow-up `search` that refreshes the listing in place.
                val actionId = cmdData.text("actionId")
                if (actionId.isNotBlank()) {
                    if (actionId == "search") {
                        currentComponentState.putIfAbsent("page", 0)
                        currentComponentState.putIfAbsent("size", 10)
                        currentComponentState.putIfAbsent("sort", emptyList<Any>())
                        currentComponentState.putIfAbsent("searchText", "")
                    }
                    SwingUtilities.invokeLater { runAction(actionId, null, silent = true) }
                }
            }
            // PushStateToHistory: no browser history on desktop. CloseModal: no-op for v1.
        }
    }

    // ── server-side component loading ──────────────────────────────────────────────────
    fun loadServerSideComponent(sscNode: JsonNode): JComponent {
        val container = newSlot()
        val id = sscNode.text("id")
        registerComponent(id, container)

        val route = sscNode.text("route")
        val serverSideType = sscNode.text("serverSideType")
        captureComponentContext(sscNode, serverSideType)

        val children = sscNode.path("children")
        if (children.isArray && !children.isEmpty) {
            val firstChild = children.get(0)
            val firstChildIsApp = firstChild.text("type") == "ClientSide" &&
                firstChild.path("metadata").text("type") == "App"

            if (firstChildIsApp) {
                val meta = firstChild.path("metadata")
                val homeRoute = meta.text("homeRoute")
                val homeConsumedRoute = meta.text("homeConsumedRoute")
                val homeSST = meta.text("homeServerSideType", meta.text("serverSideType"))
                val embedded = sscNode.path("initialData").has("_embeddedMediator") || route.contains("_embeddedMediator")
                if (embedded) {
                    // An `@Inline` embedded orchestrator island (e.g. the check-in cardex): render it in
                    // its OWN context/container so it doesn't hijack the parent view. Keep its load
                    // failures silent (they must not pop dialogs over the host form).
                    val island = AppContext(session)
                    island.contentPane = container
                    island.silentErrors = true
                    if (homeRoute.isNotBlank() || homeSST.isNotBlank()) {
                        island.navigate(homeRoute, homeConsumedRoute, homeSST, "")
                    }
                } else {
                    if (id.isNotBlank()) currentComponentId = id
                    if (serverSideType.isNotBlank()) currentServerSideType = serverSideType
                    if (homeRoute.isNotBlank() || homeSST.isNotBlank()) {
                        navigate(homeRoute, homeConsumedRoute, homeSST, "")
                    }
                }
            } else {
                if (id.isNotBlank()) currentComponentId = id
                if (serverSideType.isNotBlank()) currentServerSideType = serverSideType

                val initialData = sscNode.path("initialData")
                if (initialData.isObject) {
                    currentComponentState = HashMap()
                    initialData.fields().forEach { (k, v) -> currentComponentState[k] = v }
                }
                val state = sscNode.path("initialData")
                val triggers = sscNode.path("triggers")
                currentFormChildren = children
                currentFormContainer = container
                currentFieldErrors.clear()
                SwingUtilities.invokeLater {
                    putChildren(container, ComponentRenderer(this), children, state, state)
                    if (triggers.isArray) fireOnLoadTriggers(triggers)
                }
            }
            return container
        }

        container.add(loadingLabel())
        val prevRoute = currentRoute
        val prevConsumedRoute = currentConsumedRoute
        val prevSst = currentServerSideType
        val prevId = currentComponentId
        currentRoute = route
        currentServerSideType = serverSideType
        currentComponentId = id.ifBlank { currentComponentId }

        background(
            work = {
                apiClient.runAction(
                    route, currentConsumedRoute, "", serverSideType,
                    id.ifBlank { "ux_main" }, emptyMap(), appState, emptyMap(),
                )
            },
            onOk = { increment ->
                val fragments = increment.path("fragments")
                if (fragments.isArray && !fragments.isEmpty) {
                    val frag = fragments.get(0)
                    val renderer = ComponentRenderer(this)
                    val rendered = renderer.render(frag.path("component"), frag.path("state"), frag.path("data"))
                    fill(container, rendered, add = false)
                }
                val messages = increment.path("messages")
                if (messages.isArray) {
                    for (msg in messages) {
                        val text = msg.text("text")
                        if (text.isNotBlank()) showMessage(text, msg.text("variant", "info"))
                    }
                }
            },
            onErr = {
                currentRoute = prevRoute
                currentConsumedRoute = prevConsumedRoute
                currentServerSideType = prevSst
                currentComponentId = prevId
                fill(container, JLabel("Load failed: ${it.message}"), add = false)
            },
        )
        return container
    }

    /** Must run on the EDT (state already seeded). Fires OnLoad actions such as the Crud `search`. */
    private fun fireOnLoadTriggers(triggers: JsonNode) {
        for (trigger in triggers) {
            if (trigger.text("type").equals("OnLoad", ignoreCase = true)) {
                val actionId = trigger.text("actionId")
                if (actionId.isNotBlank()) {
                    if (actionId == "search") {
                        currentComponentState.putIfAbsent("page", 0)
                        currentComponentState.putIfAbsent("size", 10)
                        currentComponentState.putIfAbsent("sort", emptyList<Any>())
                        currentComponentState.putIfAbsent("searchText", "")
                    }
                    // OnLoad triggers are background hydration/search — a failure logs, never a dialog.
                    runAction(actionId, null, silent = true)
                }
            }
        }
    }

    // ── misc ─────────────────────────────────────────────────────────────────────────
    /** A short tab title for a CRUD detail route suffix, e.g. "/0130" → "0130", "/new" → "New". */
    private fun detailLabel(routeSuffix: String): String {
        val seg = routeSuffix.trim('/').substringAfterLast('/')
        return when {
            seg.isBlank() -> "Detail"
            seg.equals("new", ignoreCase = true) -> "New"
            else -> seg
        }
    }

    private fun loadingLabel(): JComponent = JLabel("Loading…")

    private fun background(work: () -> JsonNode, onOk: (JsonNode) -> Unit, onErr: (Throwable) -> Unit) {
        session.executor.submit {
            try {
                val result = work()
                SwingUtilities.invokeLater { runCatching { onOk(result) }.onFailure { showError("Render failed: ${it.message}") } }
            } catch (t: Throwable) {
                SwingUtilities.invokeLater { onErr(t) }
            }
        }
    }

    private fun showMessage(text: String, variant: String) {
        if (silentErrors) { println("[Mateu] $variant: $text"); return }
        val type = when (variant) {
            "error" -> JOptionPane.ERROR_MESSAGE
            "warning" -> JOptionPane.WARNING_MESSAGE
            else -> JOptionPane.INFORMATION_MESSAGE
        }
        JOptionPane.showMessageDialog(session.frame, text, "Mateu", type)
    }

    private fun showError(message: String?) {
        if (silentErrors) { println("[Mateu] error: $message"); return }
        JOptionPane.showMessageDialog(session.frame, message ?: "Error", "Error", JOptionPane.ERROR_MESSAGE)
    }

    companion object {
        private val REAL_CONTENT = setOf("Crud", "Page", "Form")
        private val CRUD_ONLY = setOf("Crud")
        private val COMPARISON: java.util.regex.Pattern =
            java.util.regex.Pattern.compile("state\\['([^']+)'\\]\\s*(>=|<=|==|!=|>|<)\\s*(-?\\d+(?:\\.\\d+)?)")
        private val TRUTHY: java.util.regex.Pattern =
            java.util.regex.Pattern.compile("state\\['([^']+)'\\]")
    }
}
