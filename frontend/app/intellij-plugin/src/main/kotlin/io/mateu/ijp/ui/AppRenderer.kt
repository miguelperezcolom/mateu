package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppSession
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JSeparator

/**
 * App shell in the plugin: the main "Mateu" tool window is a **navigator** — the recursive menu read
 * from `metadata.menu`. Each leaf opens its view through [AppSession.openViewHandler], which (in the
 * plugin) spawns an independent, dockable tool window per view (see `MateuViewManager`).
 */
fun renderApp(r: ComponentRenderer, component: JsonNode, metadata: JsonNode): JComponent {
    val session = r.ctx.session
    // Through the CONTEXT: the navigator's App title reaches the tool window (session fallback),
    // while a crud MEDIATOR's App title stays within its view (its tab title), not the navigator's.
    r.ctx.setWindowTitle(metadata.text("title", "Mateu App"))
    if (r.ctx.appShell) {
        // Publish the app menu/title for the IDE hosts (toolbar widget, Search Everywhere actions)
        // and nudge the action system so they pick it up.
        session.appMenu = metadata.path("menu")
        session.appTitle = metadata.text("title")
        session.onAppMenuChanged?.invoke()
        com.intellij.ide.ActivityTracker.getInstance().inc()
    }
    return JBScrollPane(buildSidebar(session, metadata.path("menu")))
}

private fun buildSidebar(session: AppSession, menu: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(8)
    addMenuItems(session, panel, menu, 0)
    return panel
}

private fun addMenuItems(session: AppSession, panel: javax.swing.JPanel, menu: JsonNode, depth: Int) {
    if (!menu.isArray) return
    for (item in menu) {
        if (item.bool("separator")) {
            panel.addStacked(JSeparator(), 4)
            continue
        }
        val label = item.text("label")
        val submenus = item.path("submenus")
        if (submenus.isArray && !submenus.isEmpty) {
            val header = JBLabel(if (depth == 0) label.uppercase() else label)
            header.font = header.font.deriveFont(Font.BOLD)
            header.border = JBUI.Borders.empty(6, depth * 12, 2, 0)
            panel.addStacked(header, 2)
            addMenuItems(session, panel, submenus, depth + 1)
        } else {
            val link = ActionLink(label) {
                session.openViewHandler?.invoke(
                    label,
                    item.text("route"),
                    item.text("consumedRoute"),
                    item.text("serverSideType"),
                    item.text("actionId"),
                )
            }
            link.border = JBUI.Borders.emptyLeft(depth * 12)
            panel.addStacked(link, 2)
        }
    }
}
