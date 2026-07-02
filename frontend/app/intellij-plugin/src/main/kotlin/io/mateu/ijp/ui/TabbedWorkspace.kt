package io.mateu.ijp.ui

import com.intellij.ui.components.JBTabbedPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import java.awt.FlowLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel

/**
 * A tabbed content workspace (the platform value-add over the lightweight single-slot renderer):
 * each menu selection opens a closeable tab, and every tab owns its **own** [AppContext] — its own
 * route / component / nav state — so views are independent, like the JavaFX renderer's tab pane.
 */
class TabbedWorkspace(private val session: AppSession) {

    val component: JBTabbedPane = JBTabbedPane()

    // key ("sst::route") → the tab's content panel, so re-selecting a menu entry focuses its tab.
    private val panelByKey = HashMap<String, JComponent>()

    fun openTab(label: String, route: String?, consumedRoute: String?, serverSideType: String?, actionId: String?) {
        val key = "${serverSideType.orEmpty()}::${route.orEmpty()}"
        panelByKey[key]?.let { existing ->
            component.selectedIndex = component.indexOfComponent(existing)
            return
        }

        // Each tab is an independent view: its own AppContext rendering into its own content slot.
        val ctx = AppContext(session)
        val content = ctx.newSlot()
        ctx.contentPane = content

        component.addTab(label.ifBlank { route ?: "View" }, content)
        val index = component.indexOfComponent(content)
        component.setTabComponentAt(index, closeableHeader(label.ifBlank { route ?: "View" }) {
            panelByKey.remove(key)
            val i = component.indexOfComponent(content)
            if (i >= 0) component.removeTabAt(i)
        })
        component.selectedIndex = index
        panelByKey[key] = content

        ctx.navigate(route, consumedRoute, serverSideType, actionId)
    }

    /** A tab-strip header: title + a small close button. */
    private fun closeableHeader(title: String, onClose: () -> Unit): JComponent {
        val panel = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0))
        panel.isOpaque = false
        panel.add(JLabel(title))
        panel.add(
            JButton("×").apply {
                isFocusable = false
                margin = JBUI.emptyInsets()
                border = JBUI.Borders.empty()
                isContentAreaFilled = false
                toolTipText = "Close"
                addActionListener { onClose() }
            },
        )
        return panel
    }
}
