package io.mateu.compose.state

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.snapshots.SnapshotStateMap
import io.mateu.compose.api.MateuApiClient
import io.mateu.compose.ui.JsonNode
import io.mateu.compose.ui.arr
import io.mateu.compose.ui.bool
import io.mateu.compose.ui.fields
import io.mateu.compose.ui.isObject
import io.mateu.compose.ui.isNull
import io.mateu.compose.ui.isMissingNode
import io.mateu.compose.ui.isTextual
import io.mateu.compose.ui.asText
import io.mateu.compose.ui.path
import io.mateu.compose.ui.text
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

/** One renderable unit assigned to a slot: a component subtree plus its state/data context. */
data class SlotContent(val component: JsonNode, val state: JsonNode, val data: JsonNode)

/** A user-facing message (toast / alert) carried by a UIIncrement. */
data class UiMessage(val text: String, val variant: String)

/**
 * Session-scoped state holder. Reactive replacement for the JavaFX `AppContext`:
 * instead of an imperative registry of panes mutated in place, each component id owns an
 * observable [SlotContent] list ([slotFor]); fragments update those lists and Compose recomposes.
 */
class AppState(
    val baseUrl: String,
    private val scope: CoroutineScope,
) {
    val api = MateuApiClient(baseUrl, generateSessionId())

    // Window title is observed by the top-level Window.
    val windowTitle = mutableStateOf("Mateu")

    // The very first App fragment lands here (rendered by Main, outside any slot).
    val root = mutableStateOf<SlotContent?>(null)

    // Transient message to surface in a Snackbar; Main observes and clears it.
    val message = mutableStateOf<UiMessage?>(null)

    // ── Navigation / action context (plain control data, mirrors the JavaFX renderer) ──
    val appState = HashMap<String, Any?>().apply {
        // @AppContext header selectors: restore the persisted values so they travel in the
        // appState of every request from the very first load
        putAll(loadPersistedAppContext(baseUrl))
    }
    var currentRoute = ""
    var currentConsumedRoute = ""
    var currentServerSideType = ""
    var currentComponentId = "ux_main"
    var currentComponentState = HashMap<String, Any?>()

    private val slots = HashMap<String, SnapshotStateList<SlotContent>>()
    private val dataHandlers = HashMap<String, (JsonNode) -> Unit>()
    // Data-only fragments can arrive (e.g. a Crud OnLoad "search") before the consuming component
    // has composed and registered its handler. Buffer them here and flush on registration.
    private val pendingData = HashMap<String, JsonNode>()

    // ── Client-side required-field validation ──────────────────────────────────────
    /** fieldId → error message; observed by fields to show their error state. */
    val fieldErrors: SnapshotStateMap<String, String> = mutableStateMapOf()
    private val requiredFields = LinkedHashMap<String, String>() // fieldId → label
    private val fieldInitialValues = HashMap<String, String>()   // fieldId → initial value

    fun registerRequiredField(fieldId: String, label: String, initialValue: String) {
        if (fieldId.isBlank()) return
        requiredFields[fieldId] = label
        fieldInitialValues[fieldId] = initialValue
    }

    private fun clearFormValidation() {
        requiredFields.clear()
        fieldInitialValues.clear()
        fieldErrors.clear()
    }

    /** Validates required fields against current edits (falling back to their initial value). */
    private fun validateRequired(): Boolean {
        var ok = true
        requiredFields.forEach { (id, _) ->
            val value = (currentComponentState[id]?.toString() ?: fieldInitialValues[id] ?: "")
            if (value.isBlank() || value == "null") {
                fieldErrors[id] = "Required"
                ok = false
            } else {
                fieldErrors.remove(id)
            }
        }
        return ok
    }

    fun slotFor(id: String): SnapshotStateList<SlotContent> =
        slots.getOrPut(id) { mutableStateListOf() }

    fun registerDataHandler(id: String, handler: (JsonNode) -> Unit) {
        if (id.isBlank()) return
        dataHandlers[id] = handler
        pendingData.remove(id)?.let { handler(it) }
        // A Crud's search results may target the wrapping SSC id (the search initiator) rather than
        // "crud". Since a screen has a single data consumer, the crud handler drains all buffered
        // data when it registers.
        if (id == "crud" && pendingData.isNotEmpty()) {
            val drained = pendingData.values.toList()
            pendingData.clear()
            drained.forEach { handler(it) }
        }
    }

    /**
     * Fixes an application-context value (@AppContext header selector): updates the appState sent
     * with every request, persists the selection per backend, and re-navigates the current route
     * so the screen rebuilds against the new context.
     */
    fun setAppContext(fieldName: String, value: String?) {
        if (value.isNullOrBlank()) appState.remove(fieldName) else appState[fieldName] = value
        persistAppContext(
            baseUrl,
            appState.mapNotNull { (k, v) -> v?.toString()?.let { k to it } }.toMap(),
        )
        if (currentRoute.isNotBlank() || currentServerSideType.isNotBlank()) {
            navigate(currentRoute, currentConsumedRoute, currentServerSideType, "")
        }
    }

    // ── Public actions ────────────────────────────────────────────────────────────
    fun initialLoad(route: String) {
        scope.launch {
            var lastError: Exception? = null
            // Retry with backoff — on a cold emulator/simulator (or a backend still starting) the
            // network may not be ready for the first request yet.
            repeat(5) { attempt ->
                try {
                    val increment = api.initialLoad(route, appState)
                    processInitialIncrement(increment)
                    return@launch
                } catch (e: Exception) {
                    lastError = e
                    delay(1000L * (attempt + 1))
                }
            }
            message.value = UiMessage("Failed to connect to $baseUrl\n\n${lastError?.message}", "error")
        }
    }

    fun navigate(route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) {
        clearFormValidation() // each view starts with a clean form; fields re-register on render
        // Drop stale data handlers so a new view's search result (which may arrive before the new
        // Crud has registered) is buffered and delivered to the NEW Crud, not a defunct one.
        dataHandlers.clear()
        pendingData.clear()
        scope.launch {
            try {
                val increment = if (!actionId.isNullOrBlank()) {
                    api.runAction(
                        route, consumedRoute ?: "", actionId, serverSideType,
                        currentComponentId, currentComponentState, appState, emptyMap(),
                    )
                } else {
                    api.navigate(route, consumedRoute, serverSideType, appState)
                }
                currentRoute = route ?: ""
                currentConsumedRoute = consumedRoute ?: ""
                currentServerSideType = serverSideType ?: ""
                currentComponentState = HashMap()
                applyIncrement(increment)
            } catch (e: Exception) {
                message.value = UiMessage("Navigation failed: ${e.message}", "error")
            }
        }
    }

    fun runAction(actionId: String, parameters: Map<String, Any?>?) {
        // CRUD navigation toolbar actions (view / edit / new / cancel-*) only resolve when dispatched
        // to the Crud serverSideType, which a detail/edit view (entity SSC) no longer carries. Map
        // them to fresh route navigations instead — the backend resolves by path. The Crud's base
        // route is the current consumedRoute (the mediator keeps it pinned to the crud root).
        // Client-side required-field validation: block save/create when a required field is empty.
        if ((actionId == "create" || actionId == "save") && !validateRequired()) return

        val crudBase = currentConsumedRoute.ifBlank { "/" }
        when (actionId) {
            "cancel-view", "cancel-new" -> { navigate(crudBase, "", null, ""); return }
            "new", "add-another" -> { navigate(joinRoute(crudBase, "new"), "", null, ""); return }
            "edit" -> {
                val target = if (currentRoute.endsWith("/edit")) currentRoute else joinRoute(currentRoute, "edit")
                navigate(target, "", null, ""); return
            }
            "cancel-edit" -> {
                navigate(currentRoute.removeSuffix("/edit").ifBlank { crudBase }, "", null, ""); return
            }
        }
        scope.launch {
            try {
                val increment = api.runAction(
                    currentRoute, currentConsumedRoute, actionId, currentServerSideType,
                    currentComponentId, currentComponentState, appState, parameters ?: emptyMap(),
                )
                currentComponentState = HashMap()
                applyIncrement(increment)
            } catch (e: Exception) {
                message.value = UiMessage("Action failed: ${e.message}", "error")
            }
        }
    }

    /** Background load of a ServerSide component that ships no inline children. */
    suspend fun loadServerSide(route: String, serverSideType: String, id: String): SlotContent? {
        val increment = api.runAction(
            route, currentConsumedRoute, "", serverSideType,
            id.ifBlank { "ux_main" }, emptyMap(), appState, emptyMap(),
        )
        val fragments = increment.arr("fragments")
        emitNonFragmentParts(increment)
        val frag = fragments.firstOrNull() ?: return null
        return SlotContent(frag.path("component"), frag.path("state"), frag.path("data"))
    }

    // ── Increment processing ──────────────────────────────────────────────────────
    private fun processInitialIncrement(increment: JsonNode) {
        val fragments = increment.arr("fragments")
        if (fragments.isEmpty()) return
        val appFragment = fragments.firstOrNull {
            it.path("component").path("metadata").text("type") == "App"
        } ?: fragments.first()
        root.value = SlotContent(
            appFragment.path("component"),
            appFragment.path("state"),
            appFragment.path("data"),
        )
        emitMessages(increment)
    }

    fun applyIncrement(increment: JsonNode) {
        var hadComponent = false
        increment.arr("fragments").forEach { if (applyFragment(it)) hadComponent = true }
        emitMessages(increment)
        increment.arr("commands").forEach { handleCommand(it, hadComponent) }
        mergeAppState(increment)
    }

    private fun emitNonFragmentParts(increment: JsonNode) {
        emitMessages(increment)
        increment.arr("commands").forEach { handleCommand(it, hadComponent = true) }
        mergeAppState(increment)
    }

    private fun mergeAppState(increment: JsonNode) {
        val newAppState = increment.path("appState")
        if (newAppState.isObject) {
            newAppState.fields().forEach { (k, v) -> appState[k] = v }
        }
    }

    private fun emitMessages(increment: JsonNode) {
        increment.arr("messages").forEach { msg ->
            val text = msg.text("text")
            if (text.isNotBlank()) message.value = UiMessage(text, msg.text("variant", "info"))
        }
    }

    /** Returns true if the fragment carried a component (i.e. replaced/added UI). */
    private fun applyFragment(fragment: JsonNode): Boolean {
        val targetId = fragment.text("targetComponentId")
        val action = fragment.text("action", "Replace")
        val component = fragment.path("component")
        val data = fragment.path("data")
        val state = fragment.path("state")

        if (component.isNull || component.isMissingNode) {
            // Data-only fragment — route to a registered data handler, or buffer until one registers.
            if (!data.isNull && !data.isMissingNode) {
                val key = targetId.ifBlank { "ux_main" }
                // Exact target first; else fall back to the screen's single Crud consumer; else buffer.
                val handler = dataHandlers[key] ?: dataHandlers["crud"]
                if (handler != null) handler(data) else pendingData[key] = data
            }
            return false
        }

        val slot = slotFor(targetId.ifBlank { "ux_main" })
        val content = SlotContent(component, state, data)
        if (action.equals("Add", ignoreCase = true)) {
            slot.add(content)
        } else {
            slot.clear()
            slot.add(content)
        }
        return true
    }

    private fun handleCommand(cmd: JsonNode, hadComponent: Boolean) {
        val type = cmd.text("type")
        val data = cmd.path("data")
        when (type) {
            "SetWindowTitle" -> {
                val title = if (data.isTextual) data.asText() else data.text("title")
                // Ignore the toString-of-State garbage some actions emit alongside PushStateToHistory.
                if (title.isNotBlank() && !title.startsWith("[State")) windowTitle.value = title
            }
            "NavigateTo" -> {
                val href = if (data.isTextual) data.asText() else data.text("href")
                if (href.isNotBlank()) navigate(href, "", null, "")
            }
            "PushStateToHistory" -> {
                // The web SPA reacts to the URL change by loading that route. On desktop we replicate
                // that ONLY when the action returned no component of its own (e.g. Crud "new"),
                // otherwise normal navigations (which also push state) would double-load.
                val href = if (data.isTextual) data.asText() else data.text("href")
                if (!hadComponent && href.isNotBlank() && href != currentRoute) {
                    // Fresh top-level resolution (empty consumedRoute, no sst) — the backend resolves
                    // the full path. Passing a stale consumedRoute makes sub-routes like /…/new 404.
                    navigate(href, "", null, "")
                }
            }
            // CloseModal / unknown → no-op on desktop for now
        }
    }
}

private fun joinRoute(base: String, segment: String): String =
    base.trimEnd('/') + "/" + segment

/** Multiplatform session id (no java.util.UUID dependency). */
private fun generateSessionId(): String {
    val hex = "0123456789abcdef"
    return buildString { repeat(32) { append(hex[Random.nextInt(16)]) } }
}
