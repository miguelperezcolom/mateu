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
 * App shell — port of the JavaFX `AppRenderer`. Lays out a left menu sidebar + a `ux_main` content
 * slot (an [OnePixelSplitter]); reads the menu recursively from `metadata.menu`, sets the window
 * title, and navigates to the home route to fill the content slot.
 */
fun renderApp(r: ComponentRenderer, component: JsonNode, metadata: JsonNode): JComponent {
    val ctx = r.ctx
    ctx.session.setWindowTitle(metadata.text("title", "Mateu App"))

    // The content slot for all in-app navigation.
    val content = ctx.newSlot()
    ctx.contentPane = content
    ctx.registerComponent("ux_main", content)

    val variant = metadata.text("variant", "NAVIGATION_LAYOUT")
    // The content area is NOT wrapped in a scroll pane: a JScrollPane sizes its view to the view's
    // preferred height, which collapses tables/forms. Content fills the split; scrollable widgets
    // (the Crud table) carry their own scroll pane.
    val root: JComponent = if (variant == "TABS" || variant == "MEDIATOR") {
        content
    } else {
        Splitter(false, 0.22f).apply {
            firstComponent = JBScrollPane(buildSidebar(ctx, metadata.path("menu")))
            secondComponent = content
        }
    }

    val homeRoute = metadata.text("homeRoute")
    val homeConsumed = metadata.text("homeConsumedRoute")
    val homeSST = metadata.text("homeServerSideType", metadata.text("serverSideType"))
    if (homeRoute.isNotBlank() || homeSST.isNotBlank()) {
        SwingUtilities.invokeLater { ctx.navigate(homeRoute, homeConsumed, homeSST, "") }
    }
    return root
}

private fun buildSidebar(ctx: AppContext, menu: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(8)
    addMenuItems(ctx, panel, menu, 0)
    return panel
}

private fun addMenuItems(ctx: AppContext, panel: javax.swing.JPanel, menu: JsonNode, depth: Int) {
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
            addMenuItems(ctx, panel, submenus, depth + 1)
        } else {
            val link = ActionLink(label) {
                ctx.navigate(
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
