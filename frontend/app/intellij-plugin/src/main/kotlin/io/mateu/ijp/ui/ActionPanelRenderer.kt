package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.Cursor
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JDialog
import javax.swing.JPanel
import javax.swing.KeyStroke
import javax.swing.SwingUtilities

/**
 * «I want to…» action panel (wire `ActionPanel`): a trigger button opening a MODAL dialog with one
 * column per category. Ordering / cut / labels live in [ActionPanels]; this only paints and keeps
 * the client-side state (expanded categories, hide-unpopulated).
 *
 * A plain [JDialog] rather than `JBPopupFactory`: the latter is a platform service and needs a booted
 * Application, which the standalone run / render probe deliberately do without (see DatePicker).
 *
 * Choosing an action closes the dialog and dispatches it exactly like [renderButton] does
 * (`ctx.runAction(actionId, parameters)`).
 *
 * The wire `shortcut` (e.g. "ctrl+i") opens the panel: registered on the trigger with
 * WHEN_IN_FOCUSED_WINDOW, so it is live only while the panel is showing in a focused window. Inside
 * the IDE the keymap is dispatched first, so an IDE action bound to the same keys wins.
 */
fun renderActionPanel(ctx: AppContext, metadata: JsonNode): JComponent {
    val label = ActionPanels.labelOf(metadata)
    val shortcut = metadata.text("shortcut")
    val keyStroke = ActionPanels.keyStrokeSpec(shortcut)?.let { KeyStroke.getKeyStroke(it) }

    val trigger = JButton(label)
    trigger.accessibleName(label)
    if (keyStroke != null) {
        trigger.toolTipText = "$label ($shortcut)"
        trigger.accessibleDescription("Shortcut: $shortcut")
    }
    trigger.addActionListener { openActionPanelDialog(ctx, metadata, trigger, label) }
    if (keyStroke != null) {
        trigger.registerKeyboardAction(
            { if (trigger.isShowing) openActionPanelDialog(ctx, metadata, trigger, label) },
            keyStroke,
            JComponent.WHEN_IN_FOCUSED_WINDOW,
        )
    }

    val wrapper = JPanel(FlowLayout(FlowLayout.LEFT, 0, 0))
    wrapper.isOpaque = false
    wrapper.add(trigger)
    return wrapper
}

private fun openActionPanelDialog(ctx: AppContext, metadata: JsonNode, anchor: JComponent, label: String) {
    val owner = SwingUtilities.getWindowAncestor(anchor)
    val dialog = JDialog(owner, label, java.awt.Dialog.ModalityType.APPLICATION_MODAL)
    dialog.accessibleContext.accessibleName = label
    dialog.defaultCloseOperation = JDialog.DISPOSE_ON_CLOSE

    val expanded = HashSet<Int>()
    var hideUnpopulated = false

    val columns = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(24), 0))
    columns.border = JBUI.Borders.empty(12)

    fun choose(action: ActionPanels.Action) {
        if (action.disabled || action.actionId.isBlank()) return
        dialog.dispose()
        val parameters = ctx.jsonToParams(action.parameters)
        ctx.runAction(action.actionId, parameters.ifEmpty { null })
    }

    fun linkButton(text: String, bold: Boolean, enabled: Boolean, onClick: () -> Unit): JButton =
        JButton(text).apply {
            isBorderPainted = false
            isContentAreaFilled = false
            isFocusPainted = true
            horizontalAlignment = javax.swing.SwingConstants.LEFT
            border = JBUI.Borders.empty(3, 0)
            if (bold) font = font.deriveFont(Font.BOLD)
            isEnabled = enabled
            if (enabled) cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
            accessibleName(text)
            addActionListener { onClick() }
        }

    fun rebuild() {
        columns.removeAll()
        val categories = ActionPanels.view(metadata, expanded, hideUnpopulated)
        if (categories.isEmpty()) {
            columns.add(JBLabel("No actions").apply { foreground = JBUI.CurrentTheme.Label.disabledForeground() })
        }
        for (category in categories) {
            val column = verticalPanel(0)
            if (category.title.isNotBlank()) {
                column.addStacked(
                    JBLabel(category.title).apply {
                        font = font.deriveFont(Font.BOLD)
                        foreground = JBUI.CurrentTheme.Label.disabledForeground()
                        border = JBUI.Borders.emptyBottom(4)
                    },
                    0,
                )
            }
            for (action in category.actions) {
                column.addStacked(linkButton(action.label, action.populated, !action.disabled) { choose(action) }, 0)
            }
            category.moreLabel?.let { more ->
                column.addStacked(
                    linkButton(more, bold = false, enabled = true) {
                        expanded.add(category.index)
                        rebuild()
                    },
                    0,
                )
            }
            columns.add(column)
        }
        columns.revalidate()
        columns.repaint()
        dialog.pack()
    }

    val content = JPanel(BorderLayout())
    if (ActionPanels.hasHideToggle(metadata)) {
        val toggle = JBCheckBox("Hide unpopulated")
        toggle.accessibleName("Hide unpopulated")
        toggle.addActionListener {
            hideUnpopulated = toggle.isSelected
            rebuild()
        }
        val top = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(8), JBUI.scale(4)))
        top.add(toggle)
        content.add(top, BorderLayout.NORTH)
    }
    val scroll = JBScrollPane(columns)
    scroll.border = null
    content.add(scroll, BorderLayout.CENTER)
    dialog.contentPane.add(content)
    dialog.rootPane.registerKeyboardAction(
        { dialog.dispose() },
        KeyStroke.getKeyStroke("ESCAPE"),
        JComponent.WHEN_IN_FOCUSED_WINDOW,
    )

    rebuild()
    dialog.setLocationRelativeTo(anchor)
    dialog.isVisible = true
}
