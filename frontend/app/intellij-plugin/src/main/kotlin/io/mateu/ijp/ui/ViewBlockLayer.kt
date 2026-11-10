package io.mateu.ijp.ui

import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.NoticeTexts
import io.mateu.ijp.state.ViewBlockOverlay
import java.awt.AWTEvent
import java.awt.Color
import java.awt.Component
import java.awt.FlowLayout
import java.awt.Font
import java.awt.Graphics
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.KeyboardFocusManager
import java.awt.event.InputEvent
import java.awt.event.MouseAdapter
import javax.swing.BoxLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JLayer
import javax.swing.JPanel
import javax.swing.JProgressBar
import javax.swing.LayoutFocusTraversalPolicy
import javax.swing.SwingUtilities
import javax.swing.plaf.LayerUI

/**
 * Wraps a Mateu view so a blocking task can cover it — only it: the IDE, its other tabs and the task
 * itself (in Background Tasks) keep working, there is no modal window. The state is
 * [io.mateu.ijp.state.ViewBlock]; this is the paint. [content] keeps re-rendering underneath.
 */
fun blockable(ctx: AppContext, content: JComponent): JComponent {
    val glass = ViewBlockGlass(ctx)
    val layer = JLayer(content, ViewBlockInput(glass))
    layer.glassPane = glass
    ctx.onViewBlockChanged = { glass.refresh() }
    glass.refresh()
    return layer
}

/** Stops the keyboard and the mouse reaching the view while it is covered. */
private class ViewBlockInput(private val glass: ViewBlockGlass) : LayerUI<JComponent>() {
    override fun installUI(c: JComponent) {
        super.installUI(c)
        (c as JLayer<*>).layerEventMask = AWTEvent.MOUSE_EVENT_MASK or AWTEvent.MOUSE_MOTION_EVENT_MASK or
            AWTEvent.MOUSE_WHEEL_EVENT_MASK or AWTEvent.KEY_EVENT_MASK
    }

    override fun uninstallUI(c: JComponent) {
        (c as JLayer<*>).layerEventMask = 0
        super.uninstallUI(c)
    }

    override fun eventDispatched(e: AWTEvent, l: JLayer<out JComponent>) {
        val source = e.source as? Component
        if (glass.isVisible && e is InputEvent && (source == null || !SwingUtilities.isDescendingFrom(source, glass))) {
            e.consume()
        } else {
            super.eventDispatched(e, l)
        }
    }
}

/** The layer's glass pane: a scrim over the view, with the task's card (title, progress, Cancel…). */
private class ViewBlockGlass(private val ctx: AppContext) : JPanel(GridBagLayout()) {
    private val title = JBLabel().apply { font = font.deriveFont(Font.BOLD) }
    private val detail = JBLabel()
    private val progress = JProgressBar(0, 1000)
    private val cancel = JButton()
    private val toBackground = JButton()

    private var shownTask: String? = null
    private var returnFocusTo: Component? = null
    private var overlay: ViewBlockOverlay? = null

    init {
        isOpaque = false
        isVisible = false
        // the scrim takes the mouse, the keyboard stays inside the card
        isFocusable = true
        isFocusCycleRoot = true
        focusTraversalPolicy = LayoutFocusTraversalPolicy()
        val swallow = object : MouseAdapter() {}
        addMouseListener(swallow)
        addMouseMotionListener(swallow)
        addMouseWheelListener(swallow)

        wordButtons()
        cancel.addActionListener {
            overlay?.let { o ->
                cancel.isEnabled = false // the overlay goes when the server answers
                ctx.cancelBlockingTask(o.taskId)
            }
        }
        toBackground.addActionListener { overlay?.let { ctx.moveBlockingTaskToBackground(it.taskId) } }

        val buttons = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(6), 0)).apply {
            isOpaque = false
            alignmentX = LEFT_ALIGNMENT
            add(toBackground)
            add(cancel)
        }
        val card = JPanel().apply {
            layout = BoxLayout(this, BoxLayout.Y_AXIS)
            background = UIUtil.getPanelBackground()
            border = JBUI.Borders.compound(JBUI.Borders.customLine(JBColor.border(), 1), JBUI.Borders.empty(12, 16))
            add(title.apply { alignmentX = LEFT_ALIGNMENT })
            add(javax.swing.Box.createVerticalStrut(JBUI.scale(8)))
            add(progress.apply { alignmentX = LEFT_ALIGNMENT })
            add(javax.swing.Box.createVerticalStrut(JBUI.scale(6)))
            add(detail.apply { alignmentX = LEFT_ALIGNMENT })
            add(javax.swing.Box.createVerticalStrut(JBUI.scale(10)))
            add(buttons)
        }
        add(card, GridBagConstraints().apply { fill = GridBagConstraints.NONE; weightx = 1.0; weighty = 1.0 })
    }

    override fun paintComponent(g: Graphics) {
        val base = UIUtil.getPanelBackground()
        g.color = Color(base.red, base.green, base.blue, SCRIM_ALPHA)
        g.fillRect(0, 0, width, height)
        super.paintComponent(g)
    }

    /** Named even while hidden; refreshed because the app can set its locale after the first paint. */
    private fun wordButtons() {
        val locale = MoneyValues.uiLocale()
        cancel.text = NoticeTexts.cancel(locale)
        toBackground.text = NoticeTexts.moveToBackground(locale)
    }

    fun refresh() {
        val locale = MoneyValues.uiLocale()
        val now = ctx.viewBlock.overlay(locale)
        overlay = now
        if (now == null) {
            hideOverlay()
            return
        }
        val firstShow = !isVisible
        title.text = now.title
        detail.text = now.detail.ifBlank { " " }
        progress.isIndeterminate = now.fraction == null
        now.fraction?.let { progress.value = (it * 1000).toInt() }
        if (now.taskId != shownTask) {
            shownTask = now.taskId
            cancel.isEnabled = true
        }
        wordButtons()
        cancel.isVisible = now.cancellable
        toBackground.isVisible = now.movable
        progress.accessibleName(now.title)
        if (firstShow) {
            isVisible = true
            takeFocus()
            announce(this, now.title)
        }
        revalidate()
        repaint()
    }

    private fun hideOverlay() {
        if (!isVisible) return
        val hadFocus = owns(KeyboardFocusManager.getCurrentKeyboardFocusManager().focusOwner)
        isVisible = false
        shownTask = null
        if (hadFocus) returnFocusTo?.takeIf { it.isShowing }?.requestFocusInWindow()
        returnFocusTo = null
    }

    /** Takes the focus only when the user is on this view: never out of another tab or tool window. */
    private fun takeFocus() {
        val owner = KeyboardFocusManager.getCurrentKeyboardFocusManager().focusOwner
        val layer = parent ?: return
        if (owner == null || !SwingUtilities.isDescendingFrom(owner, layer)) return
        returnFocusTo = owner
        val target = listOf(cancel, toBackground).firstOrNull { it.isVisible && it.isEnabled } ?: this
        target.requestFocusInWindow()
    }

    private fun owns(c: Component?) = c != null && SwingUtilities.isDescendingFrom(c, this)

    private companion object {
        const val SCRIM_ALPHA = 170
    }
}
