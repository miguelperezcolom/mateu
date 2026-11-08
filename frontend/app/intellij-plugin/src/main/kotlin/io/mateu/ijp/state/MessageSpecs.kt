package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.text

/** How long a message stays (`MessagePersistenceDto`). */
enum class Persistence { TOAST, STICKY, INBOX }

/**
 * A backend message (`MessageDto`) as semantics: severity, persistence, actions and the
 * deduplication key. `position` is a web hint and is not read.
 */
data class MessageSpec(
    val title: String,
    val text: String,
    val variant: String,
    val persistence: Persistence,
    val actions: List<NoticeAction>,
    val key: String?,
)

object MessageSpecs {
    private val mapper = ObjectMapper()

    /**
     * Reads one message. The persistence is the declared one; a server that does not send it means
     * sticky for an error or a 0 duration, else a toast. The actions are the declared ones; a
     * message with none but the legacy `undoActionId` gets that undo as its action.
     */
    @Suppress("UNCHECKED_CAST")
    fun of(msg: JsonNode): MessageSpec {
        val variant = msg.text("variant", "info").ifBlank { "info" }
        val persistence = when (msg.text("persistence")) {
            "toast" -> Persistence.TOAST
            "sticky" -> Persistence.STICKY
            "inbox" -> Persistence.INBOX
            else -> {
                val duration = msg.path("duration")
                if (variant == "error" || (duration.isNumber && duration.asInt() <= 0)) Persistence.STICKY
                else Persistence.TOAST
            }
        }
        var actions = NoticeAction.listOf(msg.path("actions"))
        val undo = msg.text("undoActionId")
        if (actions.isEmpty() && undo.isNotBlank()) {
            val params = msg.path("undoParameters").takeIf { it.isObject }
                ?.let { mapper.convertValue(it, Map::class.java) as Map<String, Any?> } ?: emptyMap()
            actions = listOf(NoticeAction(msg.text("undoLabel").ifBlank { null }, undo, params, null, "undo"))
        }
        return MessageSpec(
            title = msg.text("title"),
            text = msg.text("text"),
            variant = variant,
            persistence = persistence,
            actions = actions,
            key = msg.text("key").ifBlank { null },
        )
    }

    fun messagesOf(increment: JsonNode?): List<MessageSpec> {
        val messages = increment?.path("messages") ?: return emptyList()
        return if (messages.isArray) messages.map { of(it) } else emptyList()
    }
}

/**
 * Remembers the notice shown under each deduplication key, so a new one with the same key replaces
 * it (the host expires the previous notification). Bounded: the oldest keys go first.
 */
class KeyedNotices<T>(private val max: Int = 200) {
    private val byKey = LinkedHashMap<String, T>()

    /** Records [notice] under [key] (when it has one) and returns the one it replaces, if any. */
    @Synchronized
    fun put(key: String?, notice: T): T? {
        if (key.isNullOrBlank()) return null
        val previous = byKey.remove(key)
        byKey[key] = notice
        while (byKey.size > max) byKey.remove(byKey.keys.first())
        return previous
    }

    @Synchronized fun remove(key: String?): T? = key?.let { byKey.remove(it) }
}
