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
    val parameters: Map<String, Any?> = emptyMap(),
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

    /** True only on the navigator's context (the app shell) — its App feeds the IDE menu bar/title;
     *  mediator Apps rendered inside views must not. */
    var appShell = false

    // ── unsaved-changes tracking (@ConfirmOnNavigationIfDirty) ────────────────────────
    /** Whether the currently-loaded component asked for the dirty guard (wire flag). */
    var trackDirty = false
        private set

    /** True when the user changed a tracked form and hasn't saved (drives the tab's modified dot). */
    var dirty = false
        private set

    /** Fired on dirty transitions so the host can refresh its modified marker. */
    var onDirtyChanged: ((Boolean) -> Unit)? = null

    fun setDirtyState(value: Boolean) {
        if (dirty == value) return
        dirty = value
        onDirtyChanged?.invoke(value)
    }

    /** Field editors funnel user edits here: writes the state AND flips the dirty flag when tracked. */
    fun putState(fieldId: String, value: Any?) {
        currentComponentState[fieldId] = value
        markUserEdit()
        // Rules react to edits (conditional visibility/disabling); re-render only on real changes.
        if (applyRules()) rerenderCurrentForm()
        // @AutoSave: fire the configured action once the user has been idle for the debounce window.
        autoSaveActionId?.let { actionId ->
            autoSaveTimer?.stop()
            autoSaveTimer = javax.swing.Timer(autoSaveDebounceMillis) {
                runAction(actionId, null, silent = true)
            }.apply { isRepeats = false; start() }
        }
    }

    private var autoSaveDebounceMillis = 800

    /**
     * Evaluates the component's rules against the live state (same semantics as the web's
     * applyRules, minus the DOM-bound actions). Returns true when state values or field
     * attributes changed and the form should re-render.
     */
    fun applyRules(): Boolean {
        val rules = currentRules ?: return false
        val ctx = mapOf<String, Any?>(
            "state" to currentComponentState,
            "data" to null,
            "appState" to appState,
            "appData" to emptyMap<String, Any?>(),
        )
        var changed = false
        for (rule in rules) {
            val filter = rule.text("filter")
            val matches = if (filter.isBlank()) true else try {
                Expressions.truthy(Expressions.evaluate(filter, ctx))
            } catch (e: Exception) {
                false
            }
            if (!matches) continue
            fun value(): Any? {
                val expression = rule.text("expression")
                if (expression.isNotBlank()) {
                    try {
                        return Expressions.evaluate(expression, ctx)
                    } catch (e: Exception) { /* fall through to the literal */ }
                }
                val v = rule.path("value")
                return when {
                    v.isMissingNode || v.isNull -> null
                    v.isNumber -> v.asDouble()
                    v.isBoolean -> v.asBoolean()
                    v.isTextual -> v.asText()
                    else -> v
                }
            }
            when (rule.text("action")) {
                "SetStateValue", "SetDataValue" -> {
                    for (fieldName in rule.text("fieldName").split(',')) {
                        val attr = rule.text("fieldAttribute")
                        val key = if (attr.isBlank() || attr == "none") fieldName else "$fieldName.$attr"
                        val v = value()
                        if (currentComponentState[key] != v) {
                            currentComponentState[key] = v
                            changed = true
                        }
                    }
                }
                "SetAttributeValue" -> {
                    for (fieldName in rule.text("fieldName").split(',')) {
                        val attr = rule.text("fieldAttribute")
                        if (attr.isBlank() || attr == "none") continue
                        val attrs = fieldAttributes.getOrPut(fieldName) { HashMap() }
                        val v = value()
                        if (attrs[attr] != v) {
                            attrs[attr] = v
                            changed = true
                        }
                    }
                }
                "RunAction" -> {
                    val actionId = rule.text("actionId")
                    if (actionId.isNotBlank()) runAction(actionId, null, silent = true)
                }
                // RunJS / SetCssClass / SetStyle are DOM-bound — not applicable on Swing.
            }
            if (rule.text("result") == "Stop") break
        }
        return changed
    }

    /** A user edit that mutates state in place (e.g. editable-grid rows) — just flips the flag. */
    fun markUserEdit() {
        if (trackDirty) setDirtyState(true)
    }

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

    /**
     * Where THIS view's `SetWindowTitle` goes (its editor-tab / tool-window-tab title). Unset →
     * falls back to the session-wide consumer (the navigator's tool window). Hosts that mount after
     * the first load read [lastWindowTitle] on attach.
     */
    var titleConsumer: ((String) -> Unit)? = null

    /** Latest `SetWindowTitle` seen by this context (views usually receive it on first load). */
    var lastWindowTitle: String? = null
        private set

    fun setWindowTitle(title: String) {
        lastWindowTitle = title
        val consumer = titleConsumer
        if (consumer != null) SwingUtilities.invokeLater { consumer(title) }
        else session.setWindowTitle(title)
    }

    /** Claim [buttons] for the native host toolbar; false → the renderer keeps them inline. */
    fun publishToolbar(buttons: List<JsonNode>): Boolean {
        if (!nativeToolbarHost) return false
        val specs = buttons.mapNotNull { b ->
            val actionId = b.text("actionId", b.text("id"))
            // "Back to list" (cancel-view) is pointless in the IDE: the listing stays visible in
            // its own tool window while the detail lives in an editor tab.
            if (actionId.isBlank() || actionId == "cancel-view") null else ToolbarSpec(
                actionId = actionId,
                label = b.text("label", actionId),
                disabled = b.bool("disabled"),
                primary = b.text("buttonStyle").equals("Primary", ignoreCase = true),
                parameters = jsonToParams(b.path("parameters")),
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
    private var currentActionRowsSelectedRequired: MutableMap<String, Boolean> = HashMap()

    /** A wire `parameters` object node → a plain map (empty when absent / not an object). */
    @Suppress("UNCHECKED_CAST")
    fun jsonToParams(node: JsonNode?): Map<String, Any?> =
        if (node != null && node.isObject) mapper.convertValue(node, Map::class.java) as Map<String, Any?>
        else emptyMap()

    /** Inline field validation errors (fieldId → message), consumed by the form field renderer. */
    val currentFieldErrors: MutableMap<String, String> = HashMap()

    /** Client-side rules of the current component (RuleMapper wire shape). */
    private var currentRules: JsonNode? = null

    /** Rule-driven field attribute overrides (SetAttributeValue): fieldId → {hidden, disabled, …}. */
    val fieldAttributes: MutableMap<String, MutableMap<String, Any?>> = HashMap()

    /** Action-returned banners (UIIncrementDto.banners) — cleared when a new component loads. */
    val actionBanners: MutableList<JsonNode> = ArrayList()

    /** @Emits name stamped as __source on dispatched events. */
    private var emitsName = ""

    /** @AutoSave: debounced action fired after edits. */
    private var autoSaveActionId: String? = null
    private var autoSaveTimer: javax.swing.Timer? = null
    private var currentFormChildren: JsonNode? = null
    private var currentFormContainer: JComponent? = null

    // CRUD orchestrator/mediator owning the current area, for action bubbling.
    private var orchestratorServerSideType: String = ""
    private var orchestratorComponentRoute: String = ""

    // The serverSideType this view was NAVIGATED with (for a crud detail: the orchestrator, e.g.
    // Products) — the inner fragment then loads its own sst (e.g. Product), but actions the inner
    // view doesn't own (edit/new/cancel-view/save…) must bubble back to the navigation target,
    // like the web's DOM bubbling up to the mediator's component.
    private var navigationServerSideType: String = ""

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

    /** Field-scoped data (lookup `search-<field>` results arrive as `{ <fieldId>: page }`). */
    private val fieldDataHandlers: MutableMap<String, (JsonNode) -> Unit> = HashMap()

    fun registerFieldDataHandler(fieldId: String, handler: (JsonNode) -> Unit) {
        if (fieldId.isNotBlank()) fieldDataHandlers[fieldId] = handler
    }

    fun unregisterFieldDataHandler(fieldId: String) {
        fieldDataHandlers.remove(fieldId)
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
                navigationServerSideType = serverSideType ?: ""
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

        // Dirty guard on discarding actions (Cancel on an edit form): confirm before throwing away
        // unsaved changes on a tracked form.
        if (trackDirty && dirty && actionId in DISCARD_ACTIONS) {
            val choice = JOptionPane.showOptionDialog(
                contentPane,
                "There are unsaved changes. Discard them?",
                "Unsaved Changes",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.WARNING_MESSAGE,
                null,
                arrayOf("Discard changes", "Keep editing"),
                "Keep editing",
            )
            if (choice != JOptionPane.YES_OPTION) return
            setDirtyState(false)
        }

        // Bulk actions (ActionDto.rowsSelectedRequired): guarded client-side — with no rows
        // selected show a notice (balloon) instead of dispatching, exactly like the web.
        if (currentActionRowsSelectedRequired[actionId] == true) {
            val selected = currentComponentState["crud_selected_items"]
            val empty = when (selected) {
                is Collection<*> -> selected.isEmpty()
                is JsonNode -> !selected.isArray || selected.isEmpty
                else -> true
            }
            if (empty) {
                showMessage("You first need to select some rows", "warning")
                return
            }
        }

        // Client-side validation: actions flagged validationRequired only fire if every validation
        // condition holds; otherwise surface inline field errors and re-render in place. Unowned
        // SUBMIT actions bubble to the crud mediator, whose flags we never see (the plugin loads
        // the inner view directly) — the mediator's validating set is stable framework knowledge
        // (CrudActionsBuilder: create / create-and-stay / save), so they validate here too.
        val requiresValidation = currentActionValidationRequired[actionId] == true ||
            (!ownsAction(actionId) && actionId in BUBBLED_SUBMIT_ACTIONS)
        if (requiresValidation) {
            val fieldErrors = collectFieldErrors()
            currentFieldErrors.clear()
            if (fieldErrors.isNotEmpty()) {
                currentFieldErrors.putAll(fieldErrors)
                rerenderCurrentForm()
                showMessage(fieldErrors.entries.joinToString("; ") { "${it.key}: ${it.value}" }, "warning", "Revisa los campos")
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
        val rowsSelectedFlags = HashMap<String, Boolean>()
        val actionNodes = sscNode.path("actions")
        if (actionNodes.isArray) {
            for (a in actionNodes) {
                val id = a.text("id")
                if (id.isNotBlank()) {
                    actions.add(id)
                    validationFlags[id] = a.bool("validationRequired")
                    bubbleFlags[id] = a.bool("bubble")
                    rowsSelectedFlags[id] = a.bool("rowsSelectedRequired")
                }
            }
        }
        currentComponentActions = actions
        currentActionValidationRequired = validationFlags
        currentActionBubble = bubbleFlags
        currentActionRowsSelectedRequired = rowsSelectedFlags
        currentComponentValidations = sscNode.path("validations")
        currentRules = sscNode.path("rules").takeIf { it.isArray && it.size() > 0 }
        fieldAttributes.clear()
        actionBanners.clear() // action banners don't survive a component (re)load
        emitsName = sscNode.text("emitsName", sscNode.text("serverSideType"))
        registerShortcutActions(actionNodes)
        // A freshly-(re)loaded component starts clean; the wire flag says whether to track edits
        // (mirrors the web dirtyGuard reset tied to the lifecycle that rebuilds formerState).
        trackDirty = sscNode.bool("confirmOnNavigationIfDirty")
        setDirtyState(false)

        val initialData = sscNode.path("initialData")
        val componentRoute = initialData.text("componentRoute", initialData.text("_componentRoute"))
        if (componentRoute.isNotBlank() && serverSideType.isNotBlank()) {
            orchestratorServerSideType = serverSideType
            orchestratorComponentRoute = componentRoute
        }
    }

    // Actions with a Mateu shortcut (`@Action(shortcut="ctrl+alt+d")`), registered as REAL IDE
    // shortcuts scoped to this view's root component — they show in tooltips, respect focus, and
    // never fight the editor's keymap outside the view. Re-registered on every component (re)load.
    private val shortcutActions = ArrayList<com.intellij.openapi.actionSystem.AnAction>()

    private fun registerShortcutActions(actionNodes: JsonNode) {
        val root = contentPane ?: return
        for (a in shortcutActions) a.unregisterCustomShortcutSet(root)
        shortcutActions.clear()
        if (!actionNodes.isArray) return
        for (a in actionNodes) {
            val id = a.text("id")
            val keyStroke = toKeyStroke(a.text("shortcut")) ?: continue
            if (id.isBlank()) continue
            val action = object : com.intellij.openapi.actionSystem.AnAction() {
                override fun actionPerformed(e: com.intellij.openapi.actionSystem.AnActionEvent) {
                    runAction(id, null)
                }
            }
            action.registerCustomShortcutSet(
                com.intellij.openapi.actionSystem.CustomShortcutSet(keyStroke), root,
            )
            shortcutActions.add(action)
        }
    }

    /** Mateu's "ctrl+alt+d" → a Swing [javax.swing.KeyStroke] ("ctrl alt D"); null when unparseable. */
    private fun toKeyStroke(shortcut: String): javax.swing.KeyStroke? {
        if (shortcut.isBlank()) return null
        val parts = shortcut.lowercase().split('+').map { it.trim() }.filter { it.isNotEmpty() }
        if (parts.isEmpty()) return null
        val mods = parts.dropLast(1).map {
            when (it) {
                "ctrl", "control" -> "ctrl"
                "alt" -> "alt"
                "shift" -> "shift"
                "meta", "cmd" -> "meta"
                else -> return null
            }
        }
        val key = when (val k = parts.last()) {
            "enter" -> "ENTER"
            "esc", "escape" -> "ESCAPE"
            "space" -> "SPACE"
            "del", "delete" -> "DELETE"
            "tab" -> "TAB"
            else -> k.uppercase()
        }
        return javax.swing.KeyStroke.getKeyStroke((mods + key).joinToString(" "))
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
        // Unowned action on an inner view (e.g. "edit" on a crud detail whose ServerSide is the
        // entity view): bubble to the sst the view was navigated with (the crud orchestrator).
        if (bubble && navigationServerSideType.isNotBlank() && navigationServerSideType != currentServerSideType) {
            return navigationServerSideType
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

    /** Public re-render hook for widgets that swap their own subtree (signature accept, etc.). */
    fun rerenderForm() = rerenderCurrentForm()

    private fun rerenderCurrentForm() {
        val container = currentFormContainer ?: return
        val children = currentFormChildren ?: return
        val liveState: JsonNode = mapper.valueToTree(currentComponentState)
        SwingUtilities.invokeLater {
            putChildren(container, ComponentRenderer(this), children, liveState, liveState)
        }
    }

    private fun evalCondition(condition: String, state: Map<String, Any?>): Boolean {
        try {
            return Expressions.truthy(Expressions.evaluate(condition, mapOf("state" to state, "appState" to appState)))
        } catch (e: Exception) {
            // legacy regex matcher as the safety net for syntax the parser doesn't cover
        }
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
                val title = msg.text("title")
                // Undoable toast (MessageDto.undoActionId): an Undo action link on the balloon
                // dispatching the reverse action (with undoParameters) on THIS context — the
                // initiator component whose action produced the message.
                val undoActionId = msg.text("undoActionId")
                val undo: Pair<String, () -> Unit>? = if (undoActionId.isNotBlank()) {
                    val undoParams = jsonToParams(msg.path("undoParameters"))
                    msg.text("undoLabel").ifBlank { "Undo" } to { runAction(undoActionId, undoParams) }
                } else {
                    null
                }
                if (text.isNotBlank()) SwingUtilities.invokeLater { showMessage(text, variant, title, undo) }
            }
        }

        val commands = increment.path("commands")
        if (commands.isArray) for (cmd in commands) handleCommand(cmd)

        // Action-returned banners (PageBanner/PageBanners): bare returns replace, .append accumulates.
        val banners = increment.path("banners")
        if (banners.isArray && banners.size() > 0) {
            if (!increment.bool("appendBanners")) actionBanners.clear()
            for (b in banners) actionBanners.add(b)
            rerenderCurrentForm()
        }

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

        // Overlay fragments (action Add + Drawer/Dialog component) stack over the page instead of
        // replacing it — shown as a side panel anchored to the IDE window.
        val overlayType = component.path("metadata").text("type")
        if (action.equals("Add", ignoreCase = true) && (overlayType == "Drawer" || overlayType == "Dialog")) {
            SwingUtilities.invokeLater { openOverlay(component, state, data) }
            return
        }

        val target = if (targetId.isBlank()) contentPane else (registry[targetId] ?: contentPane)

        if (component.isNull || component.isMissingNode) {
            // Data-only fragment — push to a registered data handler (e.g. Crud search results).
            if (!data.isNull && !data.isMissingNode) {
                // Field-scoped first: lookup responses are keyed by fieldId and must not hit the
                // crud fallback.
                if (data.isObject) {
                    var consumed = false
                    data.fieldNames().forEach { key ->
                        fieldDataHandlers[key]?.let { it(data.path(key)); consumed = true }
                    }
                    if (consumed) return
                }
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
                    // The navigation target (the crud orchestrator on detail views) resolves crud
                    // sub-routes like /0001/edit; the inner view's own sst does not.
                    navigationServerSideType.ifBlank { currentServerSideType }
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
        // republishes the new view's buttons through publishToolbar. A Replace of the current
        // form's slot (e.g. a server-driven view swap targeting the inner component) counts too.
        if (nativeToolbarHost && (target === contentPane || target === currentFormContainer)) {
            viewActions.clear()
        }
        // Already on the EDT (applyIncrement is invoked from a background() onOk hop), so render
        // synchronously — this lets navigate() detect afterwards whether the slot was replaced.
        val renderer = ComponentRenderer(this)
        val rendered = renderer.render(component, state, data)
        fill(target, rendered, add = action.equals("Add", ignoreCase = true))

        // First time this view's real content lands in its root slot — anything that isn't a bare
        // mediator shell (whose inner navigation is still coming) counts, so composed views like
        // wizards (no Page/Form/Crud in their tree) get placed too — tell the host whether it's a
        // Crud, so listings go to the bottom tool window and the rest to the central editor.
        if (!firstContentFired && target === contentPane && !isMediatorShell(component)) {
            firstContentFired = true
            onFirstContent?.invoke(containsType(component, CRUD_ONLY))
        }
    }

    /** A bare mediator/app shell: an App, or a ServerSide whose only child is an App. */
    private fun isMediatorShell(component: JsonNode): Boolean {
        if (component.path("metadata").text("type") == "App") return true
        if (component.text("type") == "ServerSide") {
            val children = component.path("children")
            return children.isArray && children.size() == 1 &&
                children.get(0).path("metadata").text("type") == "App"
        }
        return false
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

    /**
     * A Drawer/Dialog overlay: its content renders in a CHILD context (its own component state and
     * actions — like an embedded island), shown in a modeless [javax.swing.JDialog] anchored to the
     * side of the IDE window (the desktop stand-in for the web's slide-in panel). Esc or the window
     * close button dismiss without saving; the server closes it with `UICommand.closeModal(...)`.
     */
    private fun openOverlay(component: JsonNode, state: JsonNode, data: JsonNode) {
        val meta = component.path("metadata")
        val child = AppContext(session)
        child.titleConsumer = {}
        val panel = child.newSlot()
        child.contentPane = panel
        val renderer = ComponentRenderer(child)
        // Header/content/footer nest inside the Drawer's METADATA record (like Card), not children.
        panel.layout = java.awt.BorderLayout()
        meta.path("header").takeIf { it.isObject }?.let { panel.add(renderer.render(it, state, data), java.awt.BorderLayout.NORTH) }
        meta.path("content").takeIf { it.isObject }?.let { panel.add(renderer.render(it, state, data), java.awt.BorderLayout.CENTER) }
        meta.path("footer").takeIf { it.isObject }?.let { panel.add(renderer.render(it, state, data), java.awt.BorderLayout.SOUTH) }
        val children = component.path("children")
        if (children.isArray) for (c in children) panel.add(renderer.render(c, state, data), java.awt.BorderLayout.CENTER)

        val owner = contentPane?.let { javax.swing.SwingUtilities.getWindowAncestor(it) }
        val dialog = javax.swing.JDialog(owner, meta.text("headerTitle"), java.awt.Dialog.ModalityType.MODELESS)
        dialog.contentPane.add(javax.swing.JScrollPane(panel).apply { border = null })
        val width = remToPx(meta.text("width"), 448)
        if (owner != null) {
            val h = (owner.height - 80).coerceAtLeast(300)
            dialog.setSize(width, h)
            val x = if (meta.text("position") == "start") owner.x + 10 else owner.x + owner.width - width - 10
            dialog.setLocation(x, owner.y + 60)
        } else {
            dialog.setSize(width, 600)
        }
        val close: () -> Unit = { dialog.dispose() }
        session.pushOverlay(close)
        dialog.addWindowListener(object : java.awt.event.WindowAdapter() {
            override fun windowClosed(e: java.awt.event.WindowEvent) {
                session.removeOverlay(close)
            }
        })
        dialog.rootPane.registerKeyboardAction(
            { dialog.dispose() },
            javax.swing.KeyStroke.getKeyStroke("ESCAPE"),
            JComponent.WHEN_IN_FOCUSED_WINDOW,
        )
        dialog.isVisible = true
    }

    private fun remToPx(size: String, def: Int): Int {
        val rem = size.removeSuffix("rem").trim().toDoubleOrNull() ?: return def
        return (rem * 16).toInt()
    }

    private fun handleCommand(cmd: JsonNode) {
        val type = cmd.text("type")
        val cmdData = cmd.path("data")
        when (type) {
            "SetWindowTitle" -> {
                val title = if (cmdData.isTextual) cmdData.asText() else cmdData.text("title")
                if (title.isNotBlank() && !title.startsWith("[")) setWindowTitle(title)
            }
            "NavigateTo" -> {
                val href = if (cmdData.isTextual) cmdData.asText() else cmdData.text("href")
                if (href.isNotBlank()) {
                    val opener = detailOpener
                    SwingUtilities.invokeLater {
                        when {
                            // A hosted listing (bottom tool window): navigation targets open as a
                            // detail — a central editor tab — never inside the listing panel.
                            opener != null -> opener(href.trim('/'), href, "", "")
                            // Any other hosted view: open through the host (auto-placement), so the
                            // page gets its own tab instead of hijacking this one.
                            nativeToolbarHost && session.openViewHandler != null ->
                                session.openViewHandler?.invoke(href.trim('/'), href, "", null, null)
                            else -> navigate(href, "", null, "")
                        }
                    }
                }
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
            "MarkAsDirty" -> setDirtyState(true)
            "MarkAsClean" -> setDirtyState(false)
            "DispatchEvent" -> dispatchNamedEvent(cmdData)
            "CloseModal" -> {
                // closeModal([eventName[, payload]]): close the topmost overlay, then emit the
                // named event so the host page can react (e.g. reload) — same contract as the web.
                SwingUtilities.invokeLater { session.closeTopOverlay() }
                dispatchNamedEvent(cmdData)
            }
            // PushStateToHistory: no browser history on desktop.
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
                    // An island's SetWindowTitle must not leak to the navigator tool window.
                    island.titleConsumer = {}
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
                applyRules() // initial pass (needs the hydrated state): conditional visibility etc.
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
                        if (text.isNotBlank()) showMessage(text, msg.text("variant", "info"), msg.text("title"))
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
        registerCustomEventTriggers(triggers)
    }

    /** `@SubscribeTo` / OnCustomEvent triggers → the session event bus: when the named event fires
     *  (a `DispatchEvent`/`closeModal(eventName)` from any view), run the trigger's action with the
     *  payload as parameters. Re-registered per component load (old subscriptions dropped). */
    private fun registerCustomEventTriggers(triggers: JsonNode) {
        session.unsubscribeAll(this)
        autoSaveActionId = null
        if (!triggers.isArray) return
        for (trigger in triggers) {
            if (trigger.text("type").equals("AutoSave", ignoreCase = true)) {
                autoSaveActionId = trigger.text("actionId").ifBlank { "save" }
                autoSaveDebounceMillis = trigger.path("debounceMillis").asInt(800).coerceAtLeast(100)
                continue
            }
            if (!trigger.text("type").equals("OnCustomEvent", ignoreCase = true)) continue
            val eventName = trigger.text("eventName")
            val actionId = trigger.text("actionId")
            if (eventName.isBlank() || actionId.isBlank()) continue
            // COMPONENT scope: only react to events stamped with the expected emitter (__source).
            val scope = trigger.text("source").uppercase()
            val from = trigger.text("from")
            session.subscribe(this, eventName) { payload ->
                if (scope == "COMPONENT" && from.isNotBlank() && payload?.path("__source")?.asText("") != from) return@subscribe
                val params: Map<String, Any?> = if (payload != null && payload.isObject) {
                    @Suppress("UNCHECKED_CAST")
                    mapper.convertValue(payload, Map::class.java) as Map<String, Any?>
                } else {
                    emptyMap()
                }
                SwingUtilities.invokeLater { runAction(actionId, params, silent = true) }
            }
        }
    }

    /** DispatchEvent / CloseModal(eventName) payload → the session bus (no-op without eventName). */
    private fun dispatchNamedEvent(cmdData: JsonNode) {
        val eventName = cmdData.text("eventName")
        if (eventName.isBlank()) return
        var payload = cmdData.path("payload").let { if (it.isMissingNode || it.isNull) cmdData.path("detail") else it }
        // Only object payloads get the __source stamp, so legacy events keep their shape.
        if (payload.isObject && emitsName.isNotBlank()) {
            payload = (payload.deepCopy() as com.fasterxml.jackson.databind.node.ObjectNode).put("__source", emitsName)
        }
        session.dispatchEvent(eventName, if (payload.isMissingNode || payload.isNull) null else payload)
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

    private fun showMessage(text: String, variant: String, title: String = "", undo: Pair<String, () -> Unit>? = null) {
        if (silentErrors) { println("[Mateu] $variant: $text"); return }
        // The IDE way: non-blocking balloons through the host's Notifications channel.
        session.notifier?.let { it(title.ifBlank { null }, text, variant, undo); return }
        val type = when (variant) {
            "error" -> JOptionPane.ERROR_MESSAGE
            "warning" -> JOptionPane.WARNING_MESSAGE
            else -> JOptionPane.INFORMATION_MESSAGE
        }
        if (undo != null) {
            // Dialog fallback (standalone probes): offer the undo as a second option.
            val choice = JOptionPane.showOptionDialog(
                session.frame, text, "Mateu", JOptionPane.YES_NO_OPTION, type, null,
                arrayOf("OK", undo.first), "OK",
            )
            if (choice == JOptionPane.NO_OPTION) undo.second()
            return
        }
        JOptionPane.showMessageDialog(session.frame, text, "Mateu", type)
    }

    private fun showError(message: String?) {
        if (silentErrors) { println("[Mateu] error: $message"); return }
        session.notifier?.let { it(null, message ?: "Error", "error", null); return }
        JOptionPane.showMessageDialog(session.frame, message ?: "Error", "Error", JOptionPane.ERROR_MESSAGE)
    }

    companion object {
        private val CRUD_ONLY = setOf("Crud")

        /** Actions that abandon a tracked form's edits — guarded by the dirty confirm. */
        private val DISCARD_ACTIONS = setOf("cancel-edit", "cancel-view", "cancel")

        /** Crud-mediator submits (validationRequired there — see CrudActionsBuilder). */
        private val BUBBLED_SUBMIT_ACTIONS = setOf("create", "create-and-stay", "save", "update")
        private val COMPARISON: java.util.regex.Pattern =
            java.util.regex.Pattern.compile("state\\['([^']+)'\\]\\s*(>=|<=|==|!=|>|<)\\s*(-?\\d+(?:\\.\\d+)?)")
        private val TRUTHY: java.util.regex.Pattern =
            java.util.regex.Pattern.compile("state\\['([^']+)'\\]")
    }
}
