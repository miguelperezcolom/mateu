package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import io.mateu.ijp.api.ServerActivity
import io.mateu.ijp.api.text
import io.mateu.ijp.mcp.ScreenSummary
import io.mateu.ijp.ui.ChromeLanguage
import io.mateu.ijp.ui.RowOpen
import java.util.Locale
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import javax.swing.SwingUtilities

/**
 * Live UI push: an agent READS and OPERATES the screen this app window shows
 * (`conformance/mcp/README.md`, "Reading and operating the screen the user has open"). The server
 * sends a `query` message — `describe-screen`, `set-fields`, `run-action` — over the channel, and the
 * window answers with the app-level `_agent-screen` action: the summary of what it draws (the desktop
 * app's [ScreenSummary], built from the session's OWN rendered wire state), or a refusal
 * `{code, id?}`.
 *
 * The decisions (which ids may be edited / pressed, the refusal codes, the notice's timing and words)
 * are pure and unit-tested; [Runner] applies them to the live views: an edit goes through
 * [AppContext.putState] exactly like a field editor's, an action through the same paths a click
 * takes (its confirmation is shown to the user, who answers it).
 */
object AgentScreenQueries {

    const val DESCRIBE = "describe-screen"
    const val SET_FIELDS = "set-fields"
    const val RUN_ACTION = "run-action"

    /** How long the window waits for the screen to settle after an edit or an action. */
    const val SETTLE_MS = 6_000L

    /** How long the "an agent is operating" notice stays after the last query. */
    const val OPERATING_MS = 120_000L

    /** A refusal: the code the server turns into the tool's error text, and the id it names. */
    data class Refusal(val code: String, val id: String? = null)

    /** The part of the summary edits and presses go to: the overlay when one is open, else the page. */
    fun focusOf(summary: JsonNode): JsonNode = when {
        summary.has("overlay") -> summary.path("overlay")
        summary.has("page") -> summary.path("page")
        else -> summary
    }

    /** The ids `set-fields` may write: the focus' editable fields, its listings' search text and filters. */
    fun editableIds(summary: JsonNode): Set<String> {
        val side = focusOf(summary)
        val ids = LinkedHashSet<String>()
        side.path("fields").forEach { f -> if (!f.path("readOnly").asBoolean(false)) f.text("id").takeIf { it.isNotBlank() }?.let(ids::add) }
        side.path("listings").forEach { l ->
            if (l.has("searchText")) ids.add("searchText")
            l.path("filters").forEach { f -> f.text("id").takeIf { it.isNotBlank() }?.let(ids::add) }
        }
        return ids
    }

    /** Null when every id of [values] may be written; else the refusal naming the FIRST one that may not. */
    fun fieldsRefusal(summary: JsonNode, values: JsonNode): Refusal? {
        if (!values.isObject) return Refusal("failed")
        val editable = editableIds(summary)
        val first = values.fieldNames().asSequence().firstOrNull { it !in editable } ?: return null
        return Refusal("unknownField", first)
    }

    /**
     * Null when [actionId] may be pressed (with [row] of [listing]); else `unknownAction` (not offered),
     * `disabledAction` (shown disabled) or `unknownRow` (no such row on the listing's current page).
     */
    fun actionRefusal(summary: JsonNode, actionId: String, row: Int?, listing: String?): Refusal? {
        if (actionId.isBlank() || actionId !in ScreenSummary.offeredActionIds(summary)) return Refusal("unknownAction", actionId)
        val shown = actionNodes(summary).filter { it.text("id") == actionId }
        if (shown.isNotEmpty() && shown.none { it.path("enabled").asBoolean(true) }) return Refusal("disabledAction", actionId)
        if (row != null) {
            val rows = listingOf(summary, listing)?.path("rows")?.size() ?: 0
            if (row < 0 || row >= rows) return Refusal("unknownRow", row.toString())
        }
        return null
    }

    /** The listing of the summary named [listing] (the overlay's first, then the page's), else the first one. */
    fun listingOf(summary: JsonNode, listing: String?): JsonNode? {
        val all = listOf(summary.path("overlay"), if (summary.has("page")) summary.path("page") else summary)
            .flatMap { it.path("listings").toList() }
        return if (listing.isNullOrBlank()) all.firstOrNull() else all.firstOrNull { it.text("id") == listing }
    }

    private fun actionNodes(summary: JsonNode): List<JsonNode> {
        val out = ArrayList<JsonNode>()
        fun walk(list: JsonNode) { list.forEach { a -> out.add(a); walk(a.path("children")) } }
        for (side in listOf(summary.path("overlay"), if (summary.has("page")) summary.path("page") else summary)) {
            walk(side.path("actions"))
            side.path("listings").forEach { walk(it.path("actions")); walk(it.path("rowActions")) }
        }
        walk(summary.path("appActions"))
        return out
    }

    /** The `_agent-screen` parameters: the credentials, the request, and the screen or the refusal. */
    fun answerParameters(sessionId: String, secret: String, requestId: String, screen: Any?, refusal: Refusal?): Map<String, Any?> =
        AgentPush.credentials(sessionId, secret) + linkedMapOf<String, Any?>("requestId" to requestId).apply {
            if (refusal != null) {
                put("error", linkedMapOf<String, Any?>("code" to refusal.code).apply { refusal.id?.let { put("id", it) } })
            } else {
                put("screen", screen)
            }
        }

    // ── the notice ───────────────────────────────────────────────────────────────────────────

    /** The notice's words, in the plugin's six chrome languages. */
    data class Texts(val operating: String, val stop: String, val stopped: String)

    val TEXTS: Map<String, Texts> = mapOf(
        "en" to Texts("An AI agent is operating this screen", "Stop", "The AI agent can no longer operate this screen."),
        "es" to Texts("Un agente de IA está manejando esta pantalla", "Detener", "El agente de IA ya no puede manejar esta pantalla."),
        "fr" to Texts("Un agent d'IA pilote cet écran", "Arrêter", "L'agent d'IA ne peut plus piloter cet écran."),
        "de" to Texts("Ein KI-Agent bedient diesen Bildschirm", "Stoppen", "Der KI-Agent kann diesen Bildschirm nicht mehr bedienen."),
        "pt" to Texts("Um agente de IA está operando esta tela", "Parar", "O agente de IA já não pode operar esta tela."),
        "it" to Texts("Un agente di IA sta usando questa schermata", "Interrompi", "L'agente di IA non può più usare questa schermata."),
    )

    fun textsFor(locale: Locale?): Texts = ChromeLanguage.pick(locale, TEXTS)

    /**
     * Whether an agent is operating the window: from its first query until [OPERATING_MS] after the
     * last one, or until the user stopped it. Pure (the clock is passed in).
     */
    class Operation {
        var lastQueryAt: Long = -1
            private set

        /** A query arrived [now]; true when the notice must (re)appear. */
        fun touch(now: Long): Boolean {
            val wasActive = active(now)
            lastQueryAt = now
            return !wasActive
        }

        fun active(now: Long): Boolean = lastQueryAt >= 0 && now - lastQueryAt < OPERATING_MS

        fun stop() { lastQueryAt = -1 }
    }

    // ── the live side ────────────────────────────────────────────────────────────────────────

    /**
     * Answers the queries of one session, one at a time on a background thread: the summary is built
     * on the EDT, edits and presses are posted to it, and the wait for the screen to settle happens
     * here, never on the EDT.
     */
    class Runner(private val session: AppSession, private val mapper: ObjectMapper = ObjectMapper()) {

        private val worker = java.util.concurrent.Executors.newSingleThreadExecutor { r ->
            Thread(r, "mateu-agent-screen").apply { isDaemon = true }
        }

        fun submit(query: AgentPush.Effect.Query) {
            worker.submit {
                val (screen, refusal) = runCatching { handle(query) }.getOrElse { null to Refusal("failed") }
                val parameters = answerParameters(session.sessionId, session.agentSecret, query.requestId, screen, refusal)
                runCatching {
                    session.apiClient.runAction(
                        session.appRootRoute, "", AgentPush.SCREEN_ACTION, session.appServerSideType, "mateu-agent-screen",
                        emptyMap(), HashMap(session.appState), parameters,
                    )
                }
            }
        }

        fun dispose() { worker.shutdownNow() }

        private fun handle(query: AgentPush.Effect.Query): Pair<Any?, Refusal?> = when (query.event) {
            DESCRIBE -> screenMap() to null
            SET_FIELDS -> setFields(query.detail.path("values"))
            RUN_ACTION -> runAction(query.detail)
            else -> null to Refusal("unsupported")
        }

        private fun screenMap(): Any? = mapper.convertValue(summary(), Map::class.java)

        /** What the window shows, as the desktop app's `mateu_get_screen` describes it. EDT inside. */
        fun summary(): ObjectNode = onEdt {
            val view = session.activeView?.takeIf { !it.isDisposed }
            val overlay = session.overlayViews.lastOrNull()?.takeIf { !it.context.isDisposed }
            ScreenSummary.build(
                ScreenSummary.Input(
                    uiName = session.appTitle?.ifBlank { null },
                    baseUrl = session.baseUrl,
                    route = view?.currentRoute.orEmpty(),
                    windowTitle = view?.lastWindowTitle,
                    view = view?.let(::viewOf),
                    overlay = overlay?.let { it.component to viewOf(it.context) },
                    app = session.appMetadata,
                    appState = HashMap(session.appState),
                    messages = session.recentMessages.toList(),
                ),
                mapper,
            )
        }

        private fun viewOf(ctx: AppContext) = ScreenSummary.View(
            content = ctx.lastContent,
            state = HashMap(ctx.currentComponentState),
            fieldErrors = HashMap(ctx.currentFieldErrors),
            fieldAttributes = ctx.fieldAttributes.mapValues { HashMap(it.value) },
            listings = HashMap(ctx.listingPages),
        )

        /** The view an edit or a press of the overlay goes to (the overlay in front), else the page. */
        private fun target(inOverlay: Boolean): AppContext? = onEdt {
            val overlay = session.overlayViews.lastOrNull()?.context?.takeIf { !it.isDisposed }
            val page = session.activeView?.takeIf { !it.isDisposed }
            if (inOverlay) overlay ?: page else page ?: overlay
        }

        private fun setFields(values: JsonNode): Pair<Any?, Refusal?> {
            val before = summary()
            fieldsRefusal(before, values)?.let { return null to it }
            val ctx = target(before.has("overlay")) ?: return null to Refusal("unknownField", values.fieldNames().asSequence().firstOrNull())
            onEdt {
                values.properties().forEach { (id, v) -> ctx.putState(id, plain(v)) }
                // the widgets show what was typed in (putState re-renders only when a rule changed something)
                ctx.rerenderForm()
            }
            settle(SETTLE_MS)
            return screenMap() to null
        }

        private fun runAction(detail: JsonNode): Pair<Any?, Refusal?> {
            val actionId = detail.text("actionId")
            val row = detail.path("row").takeIf { it.isIntegralNumber }?.asInt()
            val listing = detail.text("listing").ifBlank { null }
            val summary = summary()
            actionRefusal(summary, actionId, row, listing)?.let { return null to it }
            val inOverlay = summary.has("overlay") && actionId in ScreenSummary.offeredIn(summary.path("overlay"))
            val ctx = target(inOverlay) ?: return null to Refusal("unknownAction", actionId)
            val params = HashMap<String, Any?>()
            val parameters = detail.path("parameters")
            @Suppress("UNCHECKED_CAST")
            if (parameters.isObject) params.putAll(mapper.convertValue(parameters, Map::class.java) as Map<String, Any?>)
            val rowNode = if (row != null) onEdt { rowAt(ctx, row, listing) } else null
            if (row != null && rowNode == null) return null to Refusal("unknownRow", row.toString())
            val started = System.currentTimeMillis()
            val done = CountDownLatch(1)
            if (actionId == ScreenSummary.OPEN_ROW_ACTION) {
                val opened = openRow(ctx, rowNode ?: return null to Refusal("unknownRow", "0"), listing, done)
                if (!opened) return null to Refusal("unknownAction", actionId)
            } else {
                if (rowNode != null) {
                    @Suppress("UNCHECKED_CAST")
                    val rowMap = mapper.convertValue(rowNode, Map::class.java) as Map<String, Any?>
                    if (actionId.startsWith("action-on-row-")) params["_clickedRow"] = rowNode else params.putAll(rowMap)
                }
                val appAction = routeOf(summary.path("appActions"), actionId)
                val button = buttonRoute(summary, actionId)
                // LATER, not invokeAndWait: a confirmation the action opens is modal, and the user answers it
                later(done) {
                    when {
                        appAction != null -> {
                            if (appAction.isNotBlank()) session.openAppRoute(actionId, appAction) else session.runAppAction(actionId, "mateu-agent")
                            done.countDown()
                        }
                        !button.isNullOrBlank() -> { ctx.pressButton(actionId, button, params); done.countDown() }
                        else -> {
                            if (actionId == "search") {
                                // what the listing's search box does before it searches: back to the first page
                                ctx.currentComponentState["page"] = 0
                                ctx.currentComponentState.putIfAbsent("size", 10)
                                ctx.currentComponentState.putIfAbsent("sort", emptyList<Any>())
                                ctx.currentComponentState.putIfAbsent("searchText", "")
                            }
                            ctx.runAction(actionId, params.ifEmpty { null }) { done.countDown() }
                        }
                    }
                }
            }
            // a confirmation the user has not answered yet: answer the screen as it is (the dialog stays theirs)
            done.await(SETTLE_MS, TimeUnit.MILLISECONDS)
            settle((SETTLE_MS - (System.currentTimeMillis() - started)).coerceAtLeast(300))
            return screenMap() to null
        }

        private fun openRow(ctx: AppContext, row: JsonNode, listing: String?, done: CountDownLatch): Boolean {
            val id = onEdt { listingIdOf(ctx, listing) } ?: return false
            val meta = onEdt { findCrud(ctx.lastContent, id) } ?: return false
            val columns = meta.path("columns").map { c -> (c.path("metadata").takeIf { it.isObject } ?: c) }
                .map { RowOpen.Column(it.text("dataType"), it.text("stereotype"), it.text("actionId"), it.path("editable").asBoolean(false)) }
            val open = RowOpen.openOf(meta.text("rowRoute"), columns) ?: return false
            when (val target = RowOpen.targetOf(open, row)) {
                is RowOpen.Target.Route -> later(done) { ctx.openRoute(target.route); done.countDown() }
                is RowOpen.Target.Action -> later(done) {
                    @Suppress("UNCHECKED_CAST")
                    ctx.runAction(target.actionId, mapper.convertValue(row, Map::class.java) as Map<String, Any?>) { done.countDown() }
                }
                else -> return false
            }
            return true
        }

        private fun listingIdOf(ctx: AppContext, listing: String?): String? {
            val ids = ctx.listingPages.keys
            return when {
                !listing.isNullOrBlank() -> listing.takeIf { it in ids }
                else -> ids.firstOrNull()
            }
        }

        private fun rowAt(ctx: AppContext, row: Int, listing: String?): JsonNode? {
            val id = listingIdOf(ctx, listing) ?: return null
            val envelope = ctx.listingPages[id] ?: return null
            val page = envelope.path("crud").path("page").takeIf { it.isObject } ?: envelope.path("page").takeIf { it.isObject } ?: envelope
            return page.path("content").takeIf { it.isArray }?.get(row)
        }

        private fun findCrud(tree: JsonNode?, id: String): JsonNode? {
            if (tree == null) return null
            var found: JsonNode? = null
            fun walk(n: JsonNode) {
                if (found != null) return
                if (n.isObject) {
                    val meta = n.path("metadata")
                    if (meta.text("type") == "Crud" && (n.text("id").ifBlank { "crud" } == id || id == "crud")) { found = meta; return }
                    n.forEach(::walk)
                } else if (n.isArray) n.forEach(::walk)
            }
            walk(tree)
            return found
        }

        private fun routeOf(list: JsonNode, id: String): String? {
            for (a in list) {
                if (a.text("id") == id) return a.text("navigatesTo")
                routeOf(a.path("children"), id)?.let { return it }
            }
            return null
        }

        private fun buttonRoute(summary: JsonNode, id: String): String? {
            val sides = listOf(summary.path("overlay"), if (summary.has("page")) summary.path("page") else summary)
            for (side in sides) {
                routeOf(side.path("actions"), id)?.let { return it }
                side.path("listings").forEach { l -> routeOf(l.path("actions"), id)?.let { return it } }
            }
            return null
        }

        private fun plain(v: JsonNode): Any? = when {
            v.isNull -> null
            v.isTextual -> v.asText()
            v.isBoolean -> v.asBoolean()
            v.isIntegralNumber -> v.asLong().let { if (it in Int.MIN_VALUE..Int.MAX_VALUE) it.toInt() else it }
            v.isNumber -> v.asDouble()
            else -> mapper.convertValue(v, Any::class.java)
        }

        // ── threading ────────────────────────────────────────────────────────────────────────

        private fun <T> onEdt(block: () -> T): T {
            if (SwingUtilities.isEventDispatchThread()) return block()
            var result: Result<T>? = null
            val app = com.intellij.openapi.application.ApplicationManager.getApplication()
            if (app != null) {
                app.invokeAndWait({ result = runCatching(block) }, com.intellij.openapi.application.ModalityState.any())
            } else {
                SwingUtilities.invokeAndWait { result = runCatching(block) }
            }
            return result!!.getOrThrow()
        }

        private fun later(done: CountDownLatch, block: () -> Unit) {
            val run = Runnable { try { block() } catch (_: Exception) { done.countDown() } }
            val app = com.intellij.openapi.application.ApplicationManager.getApplication()
            if (app != null) app.invokeLater(run, com.intellij.openapi.application.ModalityState.any()) else SwingUtilities.invokeLater(run)
        }

        /** Waits until no request waits for a server, steadily for a moment, and the EDT painted the answers. */
        private fun settle(timeoutMs: Long): Boolean {
            val deadline = System.currentTimeMillis() + timeoutMs
            Thread.sleep(150)
            var quiet = 0
            while (System.currentTimeMillis() < deadline) {
                if (ServerActivity.busy) quiet = 0 else quiet++
                if (quiet >= 3) {
                    onEdt { }
                    if (!ServerActivity.busy) return true
                    quiet = 0
                }
                Thread.sleep(100)
            }
            return false
        }
    }
}
