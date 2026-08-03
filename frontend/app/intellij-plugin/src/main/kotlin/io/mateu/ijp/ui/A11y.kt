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
        component.firstFocusableDescendant()?.accessibleName(name)
    }
    return this
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
 */
fun announce(component: JComponent, message: String) {
    if (message.isBlank()) return
    try {
        val clazz = Class.forName("com.intellij.util.ui.accessibility.AccessibleAnnouncerUtil")
        val method = clazz.getMethod(
            "announce",
            JComponent::class.java,
            String::class.java,
            Boolean::class.javaPrimitiveType,
        )
        method.invoke(null, component, message, true)
    } catch (_: Throwable) {
        // No announcer on this platform build — the message still reaches the user through the
        // notification/toast path that called us.
    }
}
