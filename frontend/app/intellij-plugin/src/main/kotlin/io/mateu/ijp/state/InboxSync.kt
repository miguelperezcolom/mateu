package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import java.util.concurrent.CopyOnWriteArrayList
import javax.swing.SwingUtilities

/**
 * Where inbox entries are shown — the plugin posts them to the IDE's Notifications tool window
 * ([live] = pushed now: also a balloon) and withdraws the ones read, resolved or gone.
 */
interface InboxPresenter {
    fun present(diff: InboxDiff, live: Boolean, inbox: InboxSync)
}

/**
 * The notification inbox of an app (`NotificationsSupplier`): fetched with `_notifications-list`,
 * kept by an [InboxModel], changed live by `NotificationsChanged` (the `_live-updates` stream), and
 * acted on with the app-level `_notifications-read|-act|-dismiss|-open` actions — dispatched on the
 * APP (its root route and class), the same rail as the web bell.
 */
class InboxSync(private val session: AppSession) {
    val model = InboxModel()

    @Volatile var presenter: InboxPresenter? = null

    /** The shell context: an entry's action or detail answers through it (messages, drawers). */
    @Volatile var answerContext: AppContext? = null

    @Volatile var enabled = false
        private set

    private val listeners = CopyOnWriteArrayList<() -> Unit>()

    /** Told (EDT) whenever the list changes — the unread badge. */
    fun onChange(listener: () -> Unit) {
        listeners.add(listener)
    }

    /** Where the app-level actions go: the app's root route and class (default: the session's). */
    @Volatile private var route: String? = null
    @Volatile private var serverSideType: String? = null

    /** The app has an inbox: fetch it (once; later fetches come from changes). */
    fun start(context: AppContext, rootRoute: String? = null, appServerSideType: String? = null) {
        answerContext = context
        rootRoute?.takeIf { it.isNotBlank() }?.let { route = it }
        appServerSideType?.takeIf { it.isNotBlank() }?.let { serverSideType = it }
        if (enabled) return
        enabled = true
        refetch()
    }

    fun refetch() = call(InboxItems.LIST, emptyMap(), applyAnswer = false)

    fun markRead(ids: List<String>) = call(InboxItems.READ, mapOf("ids" to ids), applyAnswer = false)

    fun markAllRead() = call(InboxItems.READ, mapOf("ids" to "all"), applyAnswer = false)

    fun dismiss(ids: List<String>) = call(InboxItems.DISMISS, mapOf("ids" to ids), applyAnswer = false)

    /** Runs one of an entry's actions server-side (the supplier usually resolves it). */
    fun act(item: InboxItem, action: NoticeAction) {
        val route = action.route
        if (action.actionId == null && route != null) {
            openRoute(item, route)
            return
        }
        call(InboxItems.ACT, mapOf("id" to item.id, "actionId" to action.actionId), applyAnswer = true)
    }

    /** Opens an entry: its detail from the server, else its route; it is read from then on. */
    fun open(item: InboxItem) {
        when {
            item.hasDetail -> {
                call(InboxItems.OPEN, mapOf("id" to item.id), applyAnswer = true)
                if (item.unread) markRead(listOf(item.id))
            }
            item.route != null -> openRoute(item, item.route)
            item.unread -> markRead(listOf(item.id))
        }
    }

    private fun openRoute(item: InboxItem, route: String) {
        if (item.unread) markRead(listOf(item.id))
        session.openViewHandler?.invoke(item.title.ifBlank { route }, route, "", null, null)
    }

    /** Live changes (EDT): applied to the model; a "fetch it again" fetches it again. */
    fun applyChanges(changes: List<InboxChange>) {
        if (changes.isEmpty()) return
        for (change in changes) {
            if (change == InboxChange.Refetch) refetch() else publish(model.apply(change), live = true)
        }
    }

    private fun publish(diff: InboxDiff, live: Boolean) {
        if (!diff.isEmpty) presenter?.present(diff, live, this)
        // a new entry pushed while the IDE is not in front: the OS too (@App(osNotifications))
        if (live) diff.shown.forEach { session.osNotice(OsNotices.Event.InboxEntry(it, live = true)) }
        listeners.forEach { it() }
    }

    private fun call(actionId: String, parameters: Map<String, Any?>, applyAnswer: Boolean) {
        session.executor.submit {
            val increment = runCatching {
                session.apiClient.runAction(
                    route ?: session.appRootRoute, "", actionId, serverSideType ?: session.appServerSideType,
                    "notification-bell", emptyMap(), session.appState, parameters,
                )
            }.onFailure { println("[Mateu] $actionId failed: ${it.message}") }.getOrNull() ?: return@submit
            SwingUtilities.invokeLater {
                InboxItems.listOf(increment)?.let { publish(model.replaceServerList(it), live = false) }
                if (applyAnswer) answerContext?.applyIncrement(withoutInboxList(increment))
            }
        }
    }

    companion object {
        /** The answer without the fragments that only carry the inbox list (the model already took it). */
        fun withoutInboxList(increment: JsonNode): JsonNode {
            if (!increment.isObject) return increment
            val copy = increment.deepCopy<ObjectNode>()
            val fragments = copy.path("fragments")
            if (fragments is com.fasterxml.jackson.databind.node.ArrayNode) {
                val kept = fragments.filterNot { it.path("data").has("_notifications") && it.path("component").isMissingOrNull() }
                fragments.removeAll()
                kept.forEach { fragments.add(it) }
            }
            return copy
        }

        private fun JsonNode.isMissingOrNull() = isMissingNode || isNull
    }
}
