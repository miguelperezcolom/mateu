package io.mateu.ijp.ui

import javax.swing.JComponent
import javax.swing.JLabel

/**
 * Accessibility helpers for the Swing renderer.
 *
 * On the desktop the screen reader (NVDA, JAWS, VoiceOver) reads Swing's `AccessibleContext`, and
 * Swing populates almost none of it on its own. Two things matter most here, and neither happens
 * by accident:
 *
 *  - **A text field has no idea the label above it belongs to it.** The renderer builds a
 *    `JBLabel` caption and then, separately, an input; visually they read as a pair, but the
 *    accessibility tree has no relationship between them, so the field is announced as an unnamed
 *    edit box. `JLabel.setLabelFor` is what creates that relationship — it is the Swing analogue
 *    of `<label for>`, and it also gives the label's mnemonic to the field.
 *  - **An icon-only button announces its glyph**, or nothing at all.
 *
 * The helpers return the receiver so they chain onto an `apply {}`-style construction without
 * restructuring the call site.
 */

/** Sets the name a screen reader announces for this component. Blank names are ignored. */
fun <T : JComponent> T.accessibleName(name: String?): T {
    if (!name.isNullOrBlank()) accessibleContext.accessibleName = name
    return this
}

/** Sets the supplementary description (help text, validation state) read after the name. */
fun <T : JComponent> T.accessibleDescription(description: String?): T {
    if (!description.isNullOrBlank()) accessibleContext.accessibleDescription = description
    return this
}

/**
 * Declares that this label names `component`, the Swing equivalent of `<label for>`.
 *
 * Also copies the text across as the component's accessible name: `setLabelFor` alone is honoured
 * inconsistently across screen readers, and an explicit name costs nothing and always works.
 */
fun JLabel.labelling(component: JComponent): JLabel {
    labelFor = component
    if (text.isNotBlank()) {
        // The visual caption may carry a required marker; the announced name should not repeat it
        // as punctuation, since the required state is conveyed separately.
        val name = text.removeSuffix(" *").trim()
        component.accessibleName(name)
        // Several field kinds are COMPOSITES — a date field is a text box plus a button, a
        // stepper is a spinner wrapping a formatted field. The screen reader follows the focus,
        // which lands on the inner control, so a name on the wrapper alone is never read. Name
        // the thing that actually takes focus as well.
        component.focusTarget()?.accessibleName(name)
        // A spinner's arrow buttons are buttons with no text: give them what they do.
        if (component is javax.swing.JSpinner) {
            // BasicSpinnerUI adds next, then previous; some UIs also name them.
            component.components.filterIsInstance<javax.swing.AbstractButton>().forEachIndexed { i, b ->
                val increase = b.name == "Spinner.nextButton" || (b.name != "Spinner.previousButton" && i == 0)
                b.accessibleName(if (increase) "Increase $name" else "Decrease $name")
            }
        }
    }
    return this
}

/**
 * The control inside a composite that the user actually types into. A spinner's arrow buttons and
 * a scroll pane's scroll bars can come first in the child order (and some look-and-feels make them
 * focusable), so "first focusable descendant" named an arrow button and left the editor unnamed —
 * found by rendering the conformance corpus (ConformanceCorpusRenderTest).
 */
private fun JComponent.focusTarget(): JComponent? = when (this) {
    is javax.swing.JSpinner -> (editor as? javax.swing.JSpinner.DefaultEditor)?.textField ?: firstFocusableDescendant()
    is javax.swing.JScrollPane -> (viewport?.view as? JComponent) ?: firstFocusableDescendant()
    else -> firstFocusableDescendant()
}

/**
 * Makes a clickable panel/label (a card, a list row, a tile) operable like a button: it takes
 * keyboard focus, Enter or Space activate it, a click does too, and it gets an accessible name —
 * [name], or the text of the labels it shows. Mouse-only click targets were how several display
 * components (kanban cards, metric tiles, status-list rows, task-queue cards, checklists…) were
 * built, which left their actions out of reach of anyone not using a mouse.
 */
fun <T : JComponent> T.activatable(name: String? = null, onActivate: () -> Unit): T {
    cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
    isFocusable = true
    addMouseListener(object : java.awt.event.MouseAdapter() {
        override fun mouseClicked(e: java.awt.event.MouseEvent) {
            requestFocusInWindow()
            onActivate()
        }
    })
    addKeyListener(object : java.awt.event.KeyAdapter() {
        override fun keyPressed(e: java.awt.event.KeyEvent) {
            if (e.keyCode == java.awt.event.KeyEvent.VK_ENTER || e.keyCode == java.awt.event.KeyEvent.VK_SPACE) {
                e.consume()
                onActivate()
            }
        }
    })
    accessibleName(name ?: visibleText())
    return this
}

/** The text of the labels inside a component (HTML stripped), as a screen reader would want it. */
internal fun JComponent.visibleText(): String {
    val parts = ArrayList<String>()
    fun walk(c: java.awt.Component) {
        if (c is JLabel) c.text?.replace(Regex("<[^>]*>"), "")?.trim()?.takeIf { it.isNotEmpty() }?.let { parts.add(it) }
        if (c is java.awt.Container) c.components.forEach { walk(it) }
    }
    walk(this)
    return parts.joinToString(", ")
}

/** The first descendant that can take keyboard focus — what a screen reader will actually read. */
private fun JComponent.firstFocusableDescendant(): JComponent? {
    for (child in components) {
        if (child is JComponent) {
            if (child.isFocusable && child !is JLabel) return child
            child.firstFocusableDescendant()?.let { return it }
        }
    }
    return null
}

/**
 * Speaks `message` immediately, for things a sighted user learns from a colour or a toast — a
 * refused save, a completed background action.
 *
 * The platform announcer arrived in 2022.3 and is only wired up on some OS/screen-reader
 * combinations, so the call is reflective and failure is silent: an announcement that cannot be
 * made must never take the feature down with it.
 *
 * `assertive` interrupts whatever the screen reader is saying (an error); polite (`false`) queues
 * behind it — the two live regions of the web renderers. Existing callers keep the interrupting
 * default.
 */
fun announce(component: JComponent, message: String, assertive: Boolean = true) {
    if (message.isBlank()) return
    try {
        val clazz = Class.forName("com.intellij.util.ui.accessibility.AccessibleAnnouncerUtil")
        val method = clazz.getMethod(
            "announce",
            JComponent::class.java,
            String::class.java,
            Boolean::class.javaPrimitiveType,
        )
        method.invoke(null, component, message, assertive)
    } catch (_: Throwable) {
        // No announcer on this platform build — the message still reaches the user through the
        // notification/toast path that called us.
    }
}
