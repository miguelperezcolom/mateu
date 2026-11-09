package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/** One entry of the notification inbox (`AppNotification` / `AppNotificationDto`). */
data class InboxItem(
    val id: String,
    val title: String,
    val text: String,
    val route: String?,
    val unread: Boolean,
    val whenText: String?,
    val category: String?,
    val variant: String?,
    val resolved: Boolean,
    val actions: List<NoticeAction>,
    val hasDetail: Boolean,
) {
    /** Still asking for attention: unread and not resolved (what the platform shows a notice for). */
    val pending: Boolean get() = unread && !resolved

    companion object {
        fun of(node: JsonNode): InboxItem? {
            if (!node.isObject) return null
            val id = node.text("id").ifBlank { return null }
            return InboxItem(
                id = id,
                title = node.text("title"),
                text = node.text("text"),
                route = node.text("route").ifBlank { null },
                unread = node.bool("unread"),
                whenText = node.text("when").ifBlank { null },
                category = node.text("category").ifBlank { null },
                variant = node.text("variant").ifBlank { null },
                resolved = node.bool("resolved"),
                actions = NoticeAction.listOf(node.path("actions")),
                hasDetail = node.bool("hasDetail"),
            )
        }
    }
}

/** What the inbox panel shows (the web bell's filters, same meaning). */
enum class InboxFilter { ALL, UNREAD, RESOLVED }

/** The entries of one category; [category] is null for the uncategorised ones. */
data class InboxGroup(val category: String?, val items: List<InboxItem>)

/** The inbox panel's rules, pure — the semantics of libs/mateu `inboxStore.ts`. */
object InboxView {
    fun matches(item: InboxItem, filter: InboxFilter): Boolean = when (filter) {
        InboxFilter.ALL -> true
        InboxFilter.RESOLVED -> item.resolved
        InboxFilter.UNREAD -> item.pending
    }

    fun filtered(items: List<InboxItem>, filter: InboxFilter): List<InboxItem> = items.filter { matches(it, filter) }

    /** Grouped by category in order of first appearance, the uncategorised entries first. */
    fun grouped(items: List<InboxItem>): List<InboxGroup> {
        val groups = LinkedHashMap<String?, MutableList<InboxItem>>()
        for (item in items) groups.getOrPut(item.category?.trim()?.ifBlank { null }) { ArrayList() }.add(item)
        val none = groups.remove(null)?.let { listOf(InboxGroup(null, it)) }.orEmpty()
        return none + groups.map { (category, entries) -> InboxGroup(category, entries) }
    }
}

/** A live change of the inbox (`NotificationsChangedDto`). */
sealed class InboxChange {
    data class Upsert(val item: InboxItem) : InboxChange()
    data class Remove(val id: String) : InboxChange()
    object Refetch : InboxChange()
}

/** What changed in the model: the host shows, replaces or withdraws the platform notices. */
data class InboxDiff(val shown: List<InboxItem>, val withdrawn: List<String>) {
    val isEmpty: Boolean get() = shown.isEmpty() && withdrawn.isEmpty()
}

object InboxItems {
    const val CHANGED_COMMAND = "NotificationsChanged"

    /** The reserved app-level actions of the inbox. */
    const val LIST = "_notifications-list"
    const val READ = "_notifications-read"
    const val ACT = "_notifications-act"
    const val DISMISS = "_notifications-dismiss"
    const val OPEN = "_notifications-open"

    /** The inbox list an answer carries (`data._notifications` of a fragment, or the app data). */
    fun listOf(increment: JsonNode?): List<InboxItem>? {
        if (increment == null) return null
        val fragments = increment.path("fragments")
        if (fragments.isArray) {
            for (f in fragments) {
                val list = f.path("data").path("_notifications")
                if (list.isArray) return list.mapNotNull { InboxItem.of(it) }
            }
        }
        val app = increment.path("appData").path("_notifications")
        return if (app.isArray) app.mapNotNull { InboxItem.of(it) } else null
    }

    /** The `NotificationsChanged` commands an increment carries, in order. */
    fun changesOf(increment: JsonNode?): List<InboxChange> {
        val commands = increment?.path("commands") ?: return emptyList()
        if (!commands.isArray) return emptyList()
        return commands.filter { it.text("type") == CHANGED_COMMAND }.map { c ->
            val data = c.path("data")
            val item = data.path("notification").takeIf { it.isObject }?.let { InboxItem.of(it) }
            val removed = data.text("removedId").ifBlank { null }
            when {
                item != null -> InboxChange.Upsert(item)
                removed != null -> InboxChange.Remove(removed)
                else -> InboxChange.Refetch
            }
        }
    }
}

/**
 * The inbox as the plugin knows it: the server's list (the source of truth) plus entries pushed
 * live that the list has not caught up with yet. Each update answers what the platform must show
 * again (new or changed entries) and withdraw (removed, read or resolved ones).
 */
class InboxModel {
    private val items = LinkedHashMap<String, InboxItem>()
    private val pushedOnly = HashSet<String>()

    @Synchronized fun items(): List<InboxItem> = items.values.toList()

    /** In the order the panel lists them: entries pushed live, newest first, then the server's list. */
    @Synchronized
    fun listed(): List<InboxItem> {
        val pushed = items.values.filter { it.id in pushedOnly }.reversed()
        return pushed + items.values.filterNot { it.id in pushedOnly }
    }

    @Synchronized fun get(id: String): InboxItem? = items[id]

    @Synchronized fun unreadCount(): Int = items.values.count { it.pending }

    /** The server's list replaces the model, keeping live entries it does not know yet. */
    @Synchronized
    fun replaceServerList(list: List<InboxItem>): InboxDiff {
        val incoming = LinkedHashMap<String, InboxItem>()
        list.forEach { incoming[it.id] = it }
        pushedOnly.removeAll(incoming.keys)
        val shown = ArrayList<InboxItem>()
        val withdrawn = ArrayList<String>()
        for ((id, old) in items) {
            if (id in pushedOnly) continue
            val now = incoming[id]
            if (now == null) withdrawn.add(id) else if (now != old) diffOne(old, now, shown, withdrawn)
        }
        for ((id, now) in incoming) if (id !in items && now.pending) shown.add(now)
        val kept = items.filterKeys { it in pushedOnly }
        items.clear()
        items.putAll(incoming)
        items.putAll(kept)
        return InboxDiff(shown, withdrawn)
    }

    @Synchronized
    fun apply(change: InboxChange): InboxDiff = when (change) {
        is InboxChange.Upsert -> {
            val old = items[change.item.id]
            items[change.item.id] = change.item
            if (old == null) pushedOnly.add(change.item.id)
            val shown = ArrayList<InboxItem>()
            val withdrawn = ArrayList<String>()
            if (old == null) {
                if (change.item.pending) shown.add(change.item)
            } else {
                diffOne(old, change.item, shown, withdrawn)
            }
            InboxDiff(shown, withdrawn)
        }
        is InboxChange.Remove -> {
            pushedOnly.remove(change.id)
            if (items.remove(change.id) != null) InboxDiff(emptyList(), listOf(change.id))
            else InboxDiff(emptyList(), emptyList())
        }
        InboxChange.Refetch -> InboxDiff(emptyList(), emptyList())
    }

    private fun diffOne(old: InboxItem, now: InboxItem, shown: MutableList<InboxItem>, withdrawn: MutableList<String>) {
        if (old == now) return
        if (now.pending) shown.add(now) else withdrawn.add(now.id)
    }
}
