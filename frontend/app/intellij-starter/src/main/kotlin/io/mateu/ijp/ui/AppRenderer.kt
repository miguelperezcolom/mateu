package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.Splitter
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JSeparator
import javax.swing.SwingUtilities

/**
 * App shell on the full platform: a left menu sidebar + a **tabbed** content [TabbedWorkspace]
 * (each menu entry opens its own closeable tab with an independent [AppContext]). Reads the menu
 * recursively from `metadata.menu`, sets the window title and opens the home route as the first tab.
 */
fun renderApp(r: ComponentRenderer, component: JsonNode, metadata: JsonNode): JComponent {
    val ctx = r.ctx
    ctx.session.setWindowTitle(metadata.text("title", "Mateu App"))

    val workspace = TabbedWorkspace(ctx.session)
    ctx.session.openTabHandler = workspace::openTab

    val root: JComponent = Splitter(false, 0.22f).apply {
        firstComponent = JBScrollPane(buildSidebar(workspace, metadata.path("menu")))
        secondComponent = workspace.component
    }

    val homeRoute = metadata.text("homeRoute")
    val homeConsumed = metadata.text("homeConsumedRoute")
    val homeSST = metadata.text("homeServerSideType", metadata.text("serverSideType"))
    if (homeRoute.isNotBlank() || homeSST.isNotBlank()) {
        SwingUtilities.invokeLater {
            workspace.openTab(metadata.text("title", "Home"), homeRoute, homeConsumed, homeSST, "")
        }
    }
    return root
}

private fun buildSidebar(workspace: TabbedWorkspace, menu: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(8)
    addMenuItems(workspace, panel, menu, 0)
    return panel
}

private fun addMenuItems(workspace: TabbedWorkspace, panel: javax.swing.JPanel, menu: JsonNode, depth: Int) {
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
            addMenuItems(workspace, panel, submenus, depth + 1)
        } else {
            val link = ActionLink(label) {
                workspace.openTab(
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
