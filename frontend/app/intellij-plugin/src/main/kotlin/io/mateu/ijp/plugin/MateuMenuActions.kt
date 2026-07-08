package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.util.IconLoader
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession

/**
 * Registers every leaf of the app menu as a REAL action in the [ActionManager], so the app's views
 * are reachable like any IDE action: Search Everywhere (double Shift), Find Action (Ctrl+Shift+A),
 * and they can even be given keymap shortcuts by the user. Re-synced whenever the navigator
 * (re)publishes the app menu; previous registrations are dropped first.
 */
object MateuMenuActions {

    private val registered = ArrayList<String>()
    private val icon by lazy { IconLoader.getIcon("/icons/mateu.svg", MateuMenuActions::class.java) }

    fun sync(session: AppSession) {
        val am = ActionManager.getInstance()
        for (id in registered) runCatching { am.unregisterAction(id) }
        registered.clear()
        val menu = session.appMenu ?: return
        val appTitle = session.appTitle?.takeIf { it.isNotBlank() } ?: "Mateu"
        var seq = 0
        fun walk(items: JsonNode, path: String) {
            if (!items.isArray) return
            for (item in items) {
                if (item.bool("separator")) continue
                val label = item.text("label")
                if (label.isBlank()) continue
                val submenus = item.path("submenus")
                if (submenus.isArray && !submenus.isEmpty) {
                    walk(submenus, if (path.isEmpty()) label else "$path / $label")
                } else {
                    val description = if (path.isEmpty()) "$appTitle — $label" else "$appTitle — $path / $label"
                    val action = MenuEntryAction(session, label, item, description, icon)
                    val id = "io.mateu.app.menu.${seq++}"
                    am.registerAction(id, action)
                    registered.add(id)
                }
            }
        }
        walk(menu, "")
    }
}
