package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import io.mateu.ijp.ui.ActionPanels

/**
 * The app-level E2 patterns, pure (no Swing) so they are unit-testable — the same rules as the
 * web's `appShortcuts.ts`, `liveUpdates.ts` and `idleSession.ts`.
 */
object AppShortcuts {

    /** An app-wide shortcut (`AppDto.shortcuts`): a key and/or a quick-launch code; a route or an app action. */
    data class Shortcut(
        val key: String?,
        val label: String,
        val route: String?,
        val actionId: String?,
        val code: String?,
    )

    fun of(app: JsonNode?): List<Shortcut> = app?.arr("shortcuts").orEmpty().map {
        Shortcut(
            key = it.text("key").ifBlank { null }?.lowercase(),
            label = it.text("label").ifBlank { it.text("route").ifBlank { it.text("actionId") } },
            route = it.text("route").ifBlank { null },
            actionId = it.text("actionId").ifBlank { null },
            code = it.text("code").ifBlank { null },
        )
    }.filter { (it.key != null || it.code != null) && (it.route != null || it.actionId != null) }

    /** Mateu's "f9" / "alt+m" → a Swing KeyStroke spec ("F9", "alt M"), as the action panel does. */
    fun keyStrokeSpec(key: String?): String? = ActionPanels.keyStrokeSpec(key)

    /**
     * The app shortcuts to bind on a view: those whose keystroke the SCREEN does not use. A screen's
     * own `@Action(shortcut)` wins over an app shortcut on the same key, like on the web — the IDE
     * dispatches a keystroke bound twice on one component in no guaranteed order (or asks the user),
     * so the conflict is settled here, by not binding the app's.
     */
    fun bindable(shortcuts: List<Shortcut>, screenShortcuts: Collection<String>): List<Shortcut> {
        val taken = screenShortcuts.mapNotNull { keyStrokeSpec(it)?.lowercase() }.toSet()
        return shortcuts.filter { s ->
            val spec = keyStrokeSpec(s.key)?.lowercase() ?: return@filter false
            spec !in taken
        }
    }

    /** QUICK LAUNCH: the shortcut whose code is exactly what was typed (trimmed, case-insensitive). */
    fun quickLaunch(shortcuts: List<Shortcut>, query: String): Shortcut? {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return null
        return shortcuts.firstOrNull { it.code?.trim()?.lowercase() == q }
    }

    /** "f9" → "F9", "ctrl+alt+r" → "Ctrl+Alt+R". */
    fun keyLabel(key: String?): String =
        key.orEmpty().split('+').filter { it.isNotBlank() }.joinToString("+") {
            if (it.length <= 1) it.uppercase() else it.replaceFirstChar { c -> c.uppercase() }
        }
}

/** Live header values (`AppDto.headerValues`, the `UpdateHeaderValue` command, the event stream). */
object HeaderValues {

    data class Value(val id: String, val label: String?, val value: String)

    fun of(app: JsonNode?): List<Value> = app?.arr("headerValues").orEmpty()
        .filter { it.text("id").isNotBlank() }
        .map { Value(it.text("id"), it.text("label").ifBlank { null }, it.text("value")) }

    /** The header-value changes an increment (an action's answer, a stream event) carries. */
    fun changesOf(increment: JsonNode?): List<Pair<String, String>> =
        increment?.arr("commands").orEmpty()
            .filter { it.text("type") == "UpdateHeaderValue" && it.path("data").text("id").isNotBlank() }
            .map { it.path("data").text("id") to it.path("data").text("value") }

    /** "Business date: 12 Oct" (or the value alone). */
    fun display(v: Value): String = if (v.label.isNullOrBlank()) v.value else "${v.label}: ${v.value}"

    /** Wait before reconnecting the event stream after [failures] consecutive errors (0 = a clean end). */
    fun reconnectDelayMillis(failures: Int): Long =
        if (failures <= 0) 1_000L else minOf(60_000L, 2_000L * (1L shl (failures - 1).coerceAtMost(10)))
}

/** The idle-session warning's clock (`AppDto.idleSession`). */
object IdleClock {

    data class Config(val timeoutSeconds: Int, val warningSeconds: Int, val signOutUrl: String?, val keepAliveActionId: String?)

    enum class Phase { ACTIVE, WARNING, EXPIRED }

    fun of(app: JsonNode?): Config? {
        val idle = app?.path("idleSession") ?: return null
        if (!idle.isObject) return null
        val timeout = idle.path("timeoutSeconds").asInt(0)
        if (timeout <= 0) return null
        return Config(timeout, idle.path("warningSeconds").asInt(60), idle.text("signOutUrl").ifBlank { null },
            idle.text("keepAliveActionId").ifBlank { null })
    }

    /** Where the session stands [now], given the last activity: active, warning (seconds left) or expired. */
    fun phase(now: Long, lastActivity: Long, config: Config): Pair<Phase, Int> {
        val timeoutMs = maxOf(1, config.timeoutSeconds) * 1000L
        val warningMs = minOf(timeoutMs, maxOf(1, config.warningSeconds) * 1000L)
        val elapsed = maxOf(0L, now - lastActivity)
        val left = maxOf(0L, (timeoutMs - elapsed + 999) / 1000).toInt()
        return when {
            elapsed >= timeoutMs -> Phase.EXPIRED to 0
            elapsed >= timeoutMs - warningMs -> Phase.WARNING to left
            else -> Phase.ACTIVE to left
        }
    }
}
