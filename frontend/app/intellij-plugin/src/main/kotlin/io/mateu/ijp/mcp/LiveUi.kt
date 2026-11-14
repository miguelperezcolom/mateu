package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.ModalityState
import com.intellij.openapi.components.service
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.project.ProjectManager
import io.mateu.ijp.api.ServerActivity
import io.mateu.ijp.api.text
import io.mateu.ijp.plugin.MateuProjectService
import io.mateu.ijp.plugin.MateuVirtualFile
import io.mateu.ijp.plugin.loadMateuConfig
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.ui.RowOpen
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * The tools and resources of the desktop MCP server against the LIVE UI: the frontmost project's
 * session and its front Mateu view (the selected editor tab, else the view the user last navigated
 * in), or the overlay open in front of it. Everything runs the way the user's own gestures do — a
 * field through [AppContext.putState], an action through [AppContext.runAction] (its confirmation
 * shown to the user), a navigation through the menu — on the EDT, and each tool waits for the server
 * round trips it started to finish ([settle]) before answering. The server's access control applies
 * to all of it: every request goes out in the user's own session.
 */
class LiveUi(private val mapper: ObjectMapper = ObjectMapper()) : McpHost {

    // ── resources ────────────────────────────────────────────────────────────────────────────

    override val resources: List<McpResource> = listOf(
        McpResource(UIS_URI, "Available UIs", "The Mateu UIs this app offers and which one is open.", JSON),
        McpResource(SCREEN_URI, "Current screen", "What the user sees now (same as mateu_get_screen).", JSON),
        McpResource(MENU_URI, "Menu", "The open UI's menu (same as mateu_get_menu).", JSON),
    ) + AuthoringResources.RESOURCES.map { it.first }

    override fun readResource(uri: String): String? = when (uri) {
        UIS_URI -> write(listUis())
        SCREEN_URI -> write(screen())
        MENU_URI -> write(menu())
        else -> AuthoringResources.byUri(uri)
    }

    private fun write(node: JsonNode) = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node)

    // ── tools ────────────────────────────────────────────────────────────────────────────────

    override fun callTool(name: String, args: JsonNode): JsonNode {
        log(name, args)
        return when (name) {
            McpTools.LIST_UIS -> listUis()
            McpTools.OPEN_UI -> openUi(required(args, "id"))
            McpTools.GET_MENU -> menu()
            McpTools.NAVIGATE -> navigate(required(args, "route"))
            McpTools.GET_SCREEN -> screen()
            McpTools.SET_FIELDS -> setFields(args.path("values"))
            McpTools.RUN_ACTION -> runAction(required(args, "actionId"), args.path("parameters"), args.get("row"), args.text("listing"))
            McpTools.OPEN_ROW -> openRow(args.get("row") ?: throw McpToolError("row is required"), args.text("listing"))
            McpTools.SHOW_SCREEN -> showScreen(required(args, "yaml"), args.text("title").ifBlank { null }, args.text("target").ifBlank { "content" })
            McpTools.GET_GUIDE -> mapper.createObjectNode().put("guide", AuthoringResources.text(AuthoringResources.GUIDE))
            McpTools.LIST_COMPONENTS -> AuthoringResources.list(args.text("query"), mapper)
            McpTools.GET_COMPONENT_SCHEMA -> AuthoringResources.schemaOf(required(args, "type"), mapper)
            else -> throw McpToolError("Unknown tool: $name")
        }
    }

    private fun required(args: JsonNode, key: String): String =
        args.path(key).takeIf { it.isTextual && it.asText().isNotBlank() }?.asText() ?: throw McpToolError("$key is required")

    /** What is logged of a call: the tool and the ids it targets — never a value, never a token. */
    private fun log(name: String, args: JsonNode) {
        val targets = listOfNotNull(
            args.text("route").takeIf { it.isNotBlank() }?.let { "route=$it" },
            args.text("actionId").takeIf { it.isNotBlank() }?.let { "action=$it" },
            args.text("id").takeIf { it.isNotBlank() }?.let { "ui=$it" },
            args.path("values").takeIf { it.isObject }?.let { v -> "fields=" + v.fieldNames().asSequence().joinToString(",") },
            args.get("row")?.let { "row=${it.asText()}" },
            args.text("type").takeIf { it.isNotBlank() }?.let { "type=$it" },
        )
        LOG.info("MCP agent call: $name ${targets.joinToString(" ")}".trimEnd())
    }

    // ── where the user is ────────────────────────────────────────────────────────────────────

    private class Front(val project: Project, val service: MateuProjectService, val session: AppSession?, val view: AppContext?)

    /** The project in front (its frame focused last), else the first one with a Mateu UI open. */
    private fun front(): Front = onEdt {
        val focused = com.intellij.openapi.wm.IdeFocusManager.getGlobalInstance().lastFocusedFrame?.project
        val projects = ProjectManager.getInstance().openProjects.filter { !it.isDisposed }
        val project = focused?.takeIf { !it.isDisposed && it.service<MateuProjectService>().session != null }
            ?: projects.firstOrNull { it.service<MateuProjectService>().session != null }
            ?: focused ?: projects.firstOrNull()
            ?: throw McpToolError("The app has no window open.")
        val service = project.service<MateuProjectService>()
        val session = service.session
        val view = session?.let { s ->
            FileEditorManager.getInstance(project).selectedFiles.filterIsInstance<MateuVirtualFile>()
                .mapNotNull { it.ctx }.firstOrNull { !it.isDisposed && it.session === s }
                ?: s.activeView?.takeIf { !it.isDisposed }
        }
        Front(project, service, session, view)
    }

    private fun session(front: Front): AppSession =
        front.session ?: throw McpToolError("No UI is open." + if (loadMateuConfig(front.project).hub) " Open one with mateu_open_ui." else "")

    /** The context an edit or an action goes to: the overlay in front, else the front view. */
    private fun target(front: Front): AppContext {
        val session = session(front)
        return session.overlayViews.lastOrNull()?.context?.takeIf { !it.isDisposed }
            ?: front.view
            ?: throw McpToolError("No screen is open. Use mateu_get_menu and mateu_navigate.")
    }

    // ── the read side ────────────────────────────────────────────────────────────────────────

    private fun listUis(): ObjectNode = onEdt {
        val front = front()
        val config = loadMateuConfig(front.project)
        val out = mapper.createObjectNode()
        out.put("variant", if (config.hub) "hub" else "fixed")
        val list = out.putArray("uis")
        if (config.hub) {
            val openId = front.service.hubEntryId
            io.mateu.ijp.hub.HubStore.getInstance().list.entries.forEach { e ->
                list.addObject().apply {
                    put("id", e.id); put("name", e.name); put("baseUrl", e.baseUrl)
                    put("open", e.id == openId && front.session != null)
                }
            }
            openId?.let { out.put("open", it) }
        } else {
            list.addObject().apply {
                put("id", "app"); put("name", front.session?.appTitle?.ifBlank { null } ?: config.productName)
                put("baseUrl", front.session?.baseUrl ?: config.baseUrl)
                put("open", front.session != null)
            }
        }
        out
    }

    private fun menu(): ObjectNode = onEdt {
        val session = session(front())
        mapper.createObjectNode().apply {
            session.appTitle?.takeIf { it.isNotBlank() }?.let { put("app", it) }
            set<JsonNode>("menu", MenuSummary.build(session.appMenu, mapper))
        }
    }

    private fun screen(): ObjectNode = onEdt { summaryOf(front()) }

    private fun summaryOf(front: Front): ObjectNode {
        val session = session(front)
        val view = front.view
        val overlay = session.overlayViews.lastOrNull()?.takeIf { !it.context.isDisposed }
        val uiName = front.service.hubEntryId?.let { io.mateu.ijp.hub.HubStore.getInstance().list.get(it)?.name }
            ?: session.appTitle?.ifBlank { null } ?: loadMateuConfig(front.project).productName
        return ScreenSummary.build(
            ScreenSummary.Input(
                uiName = uiName,
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

    // ── the write side ───────────────────────────────────────────────────────────────────────

    private fun openUi(id: String): JsonNode {
        val front = front()
        if (!loadMateuConfig(front.project).hub) throw McpToolError("This app is bound to one UI: there is no list of UIs to open.")
        val entry = io.mateu.ijp.hub.HubStore.getInstance().list.get(id)
            ?: throw McpToolError("No UI with id \"$id\". See mateu_list_uis.")
        onEdt { front.service.openHubEntry(entry, null) }
        // the manifest is fetched, the session boots, the shell and its home load
        val deadline = System.currentTimeMillis() + OPEN_TIMEOUT_MS
        while (System.currentTimeMillis() < deadline && onEdt { front.service.session == null || front.service.hubEntryId != id }) Thread.sleep(200)
        val timedOut = !settle(maxOf(1000, deadline - System.currentTimeMillis()))
        return answer(timedOut)
    }

    private fun navigate(route: String): JsonNode {
        val front = front()
        val session = session(front)
        onEdt {
            val entry = MenuSummary.find(session.appMenu, route)
            if (entry != null) {
                session.openMenuEntry(entry)
            } else {
                val handler = session.openViewHandler
                if (handler != null) handler(route.trim('/'), route, session.appRootRoute, null, null)
                else (front.view ?: throw McpToolError("No screen to navigate in.")).navigate(route, "", null, "")
            }
        }
        return answer(!settle(ACTION_TIMEOUT_MS))
    }

    private fun setFields(values: JsonNode): JsonNode {
        if (!values.isObject || values.isEmpty) throw McpToolError("values must be an object: { fieldId: value }")
        val front = front()
        val ctx = onEdt { target(front) }
        val summary = screen()
        val side = if (summary.has("overlay")) summary.path("overlay") else if (summary.has("page")) summary.path("page") else summary
        val editable = HashSet<String>()
        side.path("fields").forEach { f -> if (!f.path("readOnly").asBoolean(false)) editable.add(f.text("id")) }
        side.path("listings").forEach { l ->
            if (l.has("searchText")) editable.add("searchText")
            l.path("filters").forEach { editable.add(it.text("id")) }
        }
        val unknown = values.fieldNames().asSequence().filter { it !in editable }.toList()
        if (unknown.isNotEmpty()) {
            throw McpToolError("Not an editable field on this screen: ${unknown.joinToString()}. Editable: ${editable.sorted().joinToString().ifBlank { "none" }}")
        }
        onEdt {
            values.properties().forEach { (id, v) -> ctx.putState(id, plain(v)) }
            // the widgets show what was typed in (putState re-renders only when a rule changed something)
            ctx.rerenderForm()
        }
        val timedOut = !settle(ACTION_TIMEOUT_MS)
        val after = screen()
        val afterSide = if (after.has("overlay")) after.path("overlay") else if (after.has("page")) after.path("page") else after
        return mapper.createObjectNode().apply {
            val changed = values.fieldNames().asSequence().toSet()
            putArray("fields").apply { afterSide.path("fields").filter { it.text("id") in changed }.forEach { add(it) } }
            afterSide.path("listings").forEach { l ->
                if ("searchText" in changed && l.has("searchText")) put("searchText", l.text("searchText"))
            }
            afterSide.get("errors")?.let { set<JsonNode>("errors", it) }
            if (timedOut) put("timedOut", true)
        }
    }

    private fun plain(v: JsonNode): Any? = when {
        v.isNull -> null
        v.isTextual -> v.asText()
        v.isBoolean -> v.asBoolean()
        v.isIntegralNumber -> v.asLong().let { if (it in Int.MIN_VALUE..Int.MAX_VALUE) it.toInt() else it }
        v.isNumber -> v.asDouble()
        else -> v
    }

    private fun runAction(actionId: String, parameters: JsonNode, row: JsonNode?, listing: String): JsonNode {
        val front = front()
        val session = session(front)
        val summary = screen()
        val offered = ScreenSummary.offeredActionIds(summary)
        if (actionId !in offered) {
            throw McpToolError("\"$actionId\" is not an action this screen offers. Offered: ${offered.joinToString().ifBlank { "none" }}")
        }
        if (actionId == ScreenSummary.OPEN_ROW_ACTION) return openRow(row ?: throw McpToolError("row is required to open a row"), listing)
        // the overlay's own actions run in it; the page's, on the page behind it
        val inOverlay = summary.has("overlay") && actionId in ScreenSummary.offeredIn(summary.path("overlay"))
        val ctx = onEdt {
            if (inOverlay) target(front) else front.view ?: target(front)
        }
        val params = HashMap<String, Any?>()
        if (parameters.isObject) params.putAll(mapper.convertValue(parameters, Map::class.java) as Map<String, Any?>)
        if (row != null) {
            val r = rowAt(ctx, row, listing)
            @Suppress("UNCHECKED_CAST")
            val rowMap = mapper.convertValue(r, Map::class.java) as Map<String, Any?>
            if (actionId.startsWith("action-on-row-")) params["_clickedRow"] = r else params.putAll(rowMap)
        }
        val appAction = appActionRoute(summary, actionId)
        val button = buttonRoute(summary, actionId)
        val done = CountDownLatch(1)
        var ran = true
        // LATER, not invokeAndWait: a confirmation the action opens is modal, and the user answers it
        later(done) {
            when {
                appAction != null -> {
                    if (appAction.isNotBlank()) session.openAppRoute(actionId, appAction) else session.runAppAction(actionId, "mcp")
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
                    ctx.runAction(actionId, params.ifEmpty { null }) { ok -> ran = ok; done.countDown() }
                }
            }
        }
        // a confirmation the action asks for waits for the user's answer
        val answered = done.await(CONFIRM_TIMEOUT_MS, TimeUnit.MILLISECONDS)
        val timedOut = !answered || !settle(ACTION_TIMEOUT_MS)
        return answer(timedOut).apply { put("ran", answered && ran) }
    }

    /** The route an app header action navigates to ("" = it runs on the server), null when it is none. */
    private fun appActionRoute(summary: JsonNode, id: String): String? {
        fun find(list: JsonNode): JsonNode? {
            for (a in list) { if (a.text("id") == id) return a; find(a.path("children"))?.let { return it } }
            return null
        }
        return find(summary.path("appActions"))?.text("navigatesTo")
    }

    private fun buttonRoute(summary: JsonNode, id: String): String? {
        val sides = listOf(summary.path("overlay"), if (summary.has("page")) summary.path("page") else summary)
        fun find(list: JsonNode): JsonNode? {
            for (a in list) { if (a.text("id") == id) return a; find(a.path("children"))?.let { return it } }
            return null
        }
        val all = sides.flatMap { side -> side.path("actions").toList() + side.path("listings").flatMap { it.path("actions").toList() } }
        return find(mapper.createArrayNode().addAll(all))?.text("navigatesTo")
    }

    private fun listingOf(ctx: AppContext, listing: String): Pair<String, JsonNode?> {
        val ids = ctx.listingPages.keys
        val id = when {
            listing.isNotBlank() -> listing.takeIf { it in ids } ?: throw McpToolError("No listing \"$listing\" on screen. Listings: ${ids.joinToString()}")
            ids.size == 1 -> ids.first()
            ids.isEmpty() -> throw McpToolError("This screen shows no listing rows.")
            else -> throw McpToolError("Several listings on screen: name one with `listing` (${ids.joinToString()}).")
        }
        return id to ctx.listingPages[id]
    }

    private fun rowAt(ctx: AppContext, row: JsonNode, listing: String): JsonNode {
        val (_, envelope) = listingOf(ctx, listing)
        val page = envelope?.let { e -> e.path("crud").path("page").takeIf { it.isObject } ?: e.path("page").takeIf { it.isObject } ?: e }
        val rows = page?.path("content")?.takeIf { it.isArray }?.toList().orEmpty()
        val index = row.asInt(-1)
        return rows.getOrNull(index) ?: throw McpToolError("No row $index: the listing shows ${rows.size} rows (0-based).")
    }

    private fun openRow(row: JsonNode, listing: String): JsonNode {
        val front = front()
        val ctx = onEdt { target(front) }
        val (id, _) = onEdt { listingOf(ctx, listing) }
        val r = onEdt { rowAt(ctx, row, listing) }
        val meta = findCrud(ctx.lastContent, id) ?: throw McpToolError("The listing \"$id\" is not on screen any more.")
        val columns = meta.path("columns").map { c -> (c.path("metadata").takeIf { it.isObject } ?: c) }
            .map { RowOpen.Column(it.text("dataType"), it.text("stereotype"), it.text("actionId"), it.path("editable").asBoolean(false)) }
        val open = RowOpen.openOf(meta.text("rowRoute"), columns) ?: throw McpToolError("The rows of this listing do not open a record.")
        val done = CountDownLatch(1)
        when (val target = RowOpen.targetOf(open, r)) {
            is RowOpen.Target.Route -> later(done) { ctx.openRoute(target.route); done.countDown() }
            is RowOpen.Target.Action -> later(done) {
                @Suppress("UNCHECKED_CAST")
                ctx.runAction(target.actionId, mapper.convertValue(r, Map::class.java) as Map<String, Any?>) { done.countDown() }
            }
            is RowOpen.Target.Url -> throw McpToolError("This row opens a web page in the browser, not a screen of the app.")
            null -> throw McpToolError("This row does not open.")
        }
        val answered = done.await(CONFIRM_TIMEOUT_MS, TimeUnit.MILLISECONDS)
        return answer(!answered || !settle(ACTION_TIMEOUT_MS))
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

    private fun showScreen(yaml: String, title: String?, target: String): JsonNode {
        if (target !in setOf("content", "drawer", "dialog")) throw McpToolError("target must be content, drawer or dialog")
        if (yaml.toByteArray().size > 512 * 1024) throw McpToolError("The definition is too large (512 KB at most).")
        val front = front()
        val session = session(front)
        val (route, consumed) = onEdt {
            (front.view?.currentRoute?.ifBlank { null } ?: session.homeRoute ?: session.appRootRoute) to (front.view?.currentConsumedRoute ?: "")
        }
        // validated by the UI's own server first (same request path, same identity): findings go back
        // to the agent instead of a broken screen on the user's
        val increment = try {
            session.apiClient.runAction(
                route, consumed, VALIDATE_ACTION, null, "mcp", emptyMap(), HashMap(session.appState), mapOf("_yaml" to yaml),
            )
        } catch (e: io.mateu.ijp.api.UnauthorizedException) {
            throw McpToolError("The UI's server asks to sign in again: the user needs to sign in first.")
        } catch (e: Exception) {
            throw McpToolError("This UI's server cannot validate or show agent-made screens (it predates them, or refused the request: ${e.message}).")
        }
        val report = increment.path("appData").path("_validation")
        if (!report.isObject) {
            throw McpToolError("This UI's server cannot validate or show agent-made screens (no validation answer: it predates them).")
        }
        if (!report.path("valid").asBoolean(false)) {
            return mapper.createObjectNode().apply { put("shown", false); set<JsonNode>("validation", report) }
        }
        var failure: String? = null
        val detail = mapper.createObjectNode().apply {
            put("yaml", yaml); put("target", target); title?.let { put("title", it) }
        }
        onEdt {
            io.mateu.ijp.ui.AgentEvents.apply(session, "render-screen", detail, onError = { failure = it })
        }
        val timedOut = !settle(ACTION_TIMEOUT_MS)
        failure?.let { throw McpToolError("The server could not show it: $it") }
        return mapper.createObjectNode().apply {
            put("shown", true)
            put("target", target)
            report.path("warnings").takeIf { it.isArray && !it.isEmpty }?.let { set<JsonNode>("warnings", it) }
            if (timedOut) put("timedOut", true)
        }
    }

    /** The screen after a change, plus `timedOut` when the server had not answered in time. */
    private fun answer(timedOut: Boolean): ObjectNode {
        val screen = runCatching { screen() }.getOrElse { e ->
            if (e is McpToolError) mapper.createObjectNode().put("note", e.message) else throw e
        }
        return mapper.createObjectNode().apply {
            if (timedOut) put("timedOut", true)
            set<JsonNode>("screen", screen)
        }
    }

    // ── threading ────────────────────────────────────────────────────────────────────────────

    /** Runs [block] on the EDT and answers its result (any modality: a dialog the user has open too). */
    private fun <T> onEdt(block: () -> T): T {
        val app = ApplicationManager.getApplication()
        if (app.isDispatchThread) return block()
        var result: Result<T>? = null
        app.invokeAndWait({ result = runCatching(block) }, ModalityState.any())
        return result!!.getOrThrow()
    }

    /** Runs [block] on the EDT soon, without waiting for it; a failure releases [done]. */
    private fun later(done: CountDownLatch, block: () -> Unit) {
        ApplicationManager.getApplication().invokeLater({
            try { block() } catch (e: Exception) { LOG.warn("MCP agent action failed", e); done.countDown() }
        }, ModalityState.any())
    }

    /**
     * Waits until no request is waiting for a server (Mateu's and the REST sources'), steadily for a
     * moment — a navigation is several loads in a row (shell → mediator → listing) — and the EDT has
     * painted the answers. False when [timeoutMs] passed first.
     */
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

    companion object {
        private val LOG = Logger.getInstance(LiveUi::class.java)
        const val UIS_URI = "mateu://desktop/uis"
        const val SCREEN_URI = "mateu://desktop/screen"
        const val MENU_URI = "mateu://desktop/menu"
        private const val JSON = "application/json"
        const val VALIDATE_ACTION = "__validate__"
        const val ACTION_TIMEOUT_MS = 20_000L
        const val OPEN_TIMEOUT_MS = 30_000L
        /** A confirmation dialog an action opens is the user's to answer: wait a while for it. */
        const val CONFIRM_TIMEOUT_MS = 120_000L
    }
}
