package io.mateu.ijp.state

/**
 * OS-level notifications (`@App(osNotifications = true)` → `AppDto.osNotifications`,
 * design/progress-and-notifications.md "OS-level notifications"): two events are worth leaving the
 * IDE for — a NEW unread inbox entry (pushed live, or an `inbox` message) and a task that finished
 * (done / failed) while it ran in the background — and only while the IDE is not in front.
 *
 * The platform does NOT turn Mateu's balloons into system notifications by itself (2025.2+: balloons
 * stay in the IDE frame); the plugin posts these two through `com.intellij.ui.SystemNotifications`,
 * which also honours the user's own switch (Settings › Appearance & Behavior › Notifications › "Use
 * system notifications") and the application's focus. The text is PLAIN: whatever markup the value
 * carries is stripped, never rendered.
 */
object OsNotices {

    sealed interface Event {
        /** An inbox entry: [live] = pushed now (a list fetch never pops the OS). */
        data class InboxEntry(val item: InboxItem, val live: Boolean) : Event

        /** An `inbox` message in an answer. */
        data class InboxMessage(val spec: MessageSpec) : Event

        /** A task reached a terminal state. */
        data class TaskFinished(val task: ProgressTask) : Event
    }

    data class Notice(val title: String, val text: String)

    /** Pure: whether [event] becomes an OS notification ([ideActive] = an IDE window has the focus). */
    fun shouldNotify(osNotifications: Boolean, ideActive: Boolean, event: Event): Boolean {
        if (!osNotifications || ideActive) return false
        return when (event) {
            is Event.InboxEntry -> event.live && event.item.pending
            is Event.InboxMessage -> event.spec.persistence == Persistence.INBOX && event.spec.text.isNotBlank()
            // a task the user could not move away from its view was being watched there; a cancel
            // was the user's own doing
            is Event.TaskFinished -> event.task.presentation != TaskPresentation.BLOCKS_VIEW &&
                (event.task.state == TaskState.DONE || event.task.state == TaskState.FAILED)
        }
    }

    /** What the OS shows for [event]: plain title and text. */
    fun noticeOf(event: Event): Notice = when (event) {
        is Event.InboxEntry -> Notice(
            plainText(listOfNotNull(event.item.category, event.item.title.ifBlank { null }).joinToString(" · ")).ifBlank { "Mateu" },
            plainText(event.item.text),
        )
        is Event.InboxMessage -> Notice(plainText(event.spec.title).ifBlank { "Mateu" }, plainText(event.spec.text))
        is Event.TaskFinished -> Notice(
            plainText(event.task.title).ifBlank { "Mateu" },
            plainText(ProgressTasks.resultText(event.task, io.mateu.ijp.ui.MoneyValues.uiLocale())),
        )
    }

    /**
     * What makes two events the same notice: an inbox message and the stored entry it becomes
     * (the server stamps the entry id as the message's key) are one, so are two updates of a task.
     */
    fun keyOf(event: Event): String? = when (event) {
        is Event.InboxEntry -> "inbox:" + event.item.id
        is Event.InboxMessage -> event.spec.key?.let { "inbox:$it" }
        is Event.TaskFinished -> "task:" + event.task.taskId
    }

    /** Remembers the notices already posted (a bounded set): each key pops the OS once. */
    class Posted(private val max: Int = 200) {
        private val keys = LinkedHashSet<String>()

        /** true the first time [key] is seen (a null key is always new). */
        @Synchronized
        fun first(key: String?): Boolean {
            if (key == null) return true
            if (!keys.add(key)) return false
            while (keys.size > max) keys.remove(keys.first())
            return true
        }
    }

    private val tags = Regex("<[^>]*>")
    private val spaces = Regex("\\s+")

    /** Markup removed (tags dropped, the usual entities decoded), whitespace collapsed. */
    fun plainText(value: String?): String {
        val noTags = tags.replace(value.orEmpty(), " ")
        val decoded = noTags
            .replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"")
            .replace("&#39;", "'").replace("&#x27;", "'").replace("&nbsp;", " ").replace("&amp;", "&")
        return spaces.replace(decoded, " ").trim()
    }
}
