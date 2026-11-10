package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Component
import java.awt.Container
import java.awt.Font
import java.awt.Rectangle
import java.awt.event.InputEvent
import java.awt.event.KeyEvent
import javax.swing.Box
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.KeyStroke

/**
 * What a PAGE says about itself beyond its content, on the desktop: its width (`pageWidth` fixed /
 * fullWidth / edgeToEdge), `@Compact` (the `--mateu-compact` style), the `@Toc` index with its
 * Ctrl+Alt+N jumps, labels beside their fields (`labelsAside`). All four were ignored.
 */
object PageLevel {
    /** The content cap and gutter of a page width: fixed = the page's own cap (else 1392px), full = 24px gutters, edge = none. */
    data class WidthPlan(val maxWidth: Int?, val gutter: Int)

    fun widthPlan(pageWidth: String, styleMaxWidth: Int?, fixedMax: Int = 1392): WidthPlan = when (pageWidth) {
        // full / edge pages are not held to the 900px form reading measure (the web lifts it too)
        "fullWidth" -> WidthPlan(null, 24)
        "edgeToEdge" -> WidthPlan(null, 0)
        "fixed" -> WidthPlan(styleMaxWidth ?: fixedMax, PageChrome.GUTTER)
        else -> WidthPlan(styleMaxWidth, PageChrome.GUTTER)
    }

    /**
     * A page's width: the declared one, else inferred from its page type the way the web infers it
     * (a collection or a dashboard is full width; a form, a process, a landing is fixed).
     */
    fun pageWidthOf(metadata: JsonNode): String = metadata.text("pageWidth").ifBlank {
        when (metadata.text("pageType")) {
            "collection", "dashboard" -> "fullWidth"
            else -> ""
        }
    }

    /** Whether a style string asks for compact mode (StyleConstants.COMPACT carries `--mateu-compact:1`). */
    fun isCompact(style: String?): Boolean = style.orEmpty().replace(" ", "").contains("--mateu-compact:1")

    /** Whether the index shows: `toc: true` / `false` decide; absent → more than 4 sections. */
    fun showsToc(toc: JsonNode, sections: Int): Boolean = when {
        toc.isBoolean -> toc.asBoolean() && sections > 0
        else -> sections > 4
    }

    /** A section card's title: its title text, else its first heading (a reflective @Section). */
    fun sectionTitle(node: JsonNode): String {
        val m = node.path("metadata")
        m.path("title").let { t ->
            if (t.isTextual && t.asText().isNotBlank()) return t.asText()
            if (t.isObject) t.path("metadata").text("text").takeIf { it.isNotBlank() }?.let { return it }
        }
        return firstHeading(node).orEmpty()
    }

    private fun firstHeading(n: JsonNode): String? {
        if (n.isObject) {
            val m = n.path("metadata")
            if (m.text("type") == "Text" && headingScale(m.text("container")) != null && m.text("text").isNotBlank()) return m.text("text")
            for (v in n.properties().map { it.value }) firstHeading(v)?.let { return it }
        } else if (n.isArray) for (v in n) firstHeading(v)?.let { return it }
        return null
    }

    /** Whether a rendered widget is a section card (the reflective sections carry `mateu-section`). */
    fun isSection(node: JsonNode?): Boolean =
        node != null && (node.text("cssClasses").split(' ').contains("mateu-section") || node.path("metadata").text("type") == "FormSection")

    /** The rendered section cards under [root], in order, with their titles (frameless ones excluded). */
    fun sections(root: Container): List<Pair<String, JComponent>> {
        val out = ArrayList<Pair<String, JComponent>>()
        fun walk(c: Component) {
            if (c is JComponent) {
                val node = c.getClientProperty(io.mateu.ijp.contract.DropTargeting.WIRE_KEY) as? JsonNode
                if (isSection(node)) {
                    sectionTitle(node!!).takeIf { it.isNotBlank() }?.let { out += it to c }
                    return
                }
            }
            if (c is Container) c.components.forEach(::walk)
        }
        walk(root)
        return out
    }

    /** Scrolls [target] to the top of the scrolling viewport it lives in. */
    fun jumpTo(target: JComponent) {
        val viewport = generateSequence(target.parent) { it.parent }.filterIsInstance<javax.swing.JViewport>().firstOrNull()
        if (viewport == null) { target.scrollRectToVisible(Rectangle(0, 0, target.width, target.height)); return }
        val view = viewport.view as? JComponent ?: return
        val p = javax.swing.SwingUtilities.convertPoint(target.parent, target.location, view)
        view.scrollRectToVisible(Rectangle(0, p.y, 1, viewport.extentSize.height))
        target.requestFocusInWindow()
    }

    /**
     * The index of [sections]: one link per section numbered for its Ctrl+Alt+N shortcut, bound on
     * [host] for the first nine. The current entry is bold.
     */
    fun tocPanel(host: JComponent, sections: List<Pair<String, JComponent>>): JComponent {
        val panel = verticalPanel(2)
        panel.border = JBUI.Borders.compound(
            JBUI.Borders.customLineLeft(com.intellij.ui.JBColor.border()), JBUI.Borders.empty(0, 12, 0, 0))
        panel.addStacked(JBLabel("On this page").apply { font = font.deriveFont(Font.BOLD); foreground = ToneColors.secondaryText() }, 6)
        val links = ArrayList<ActionLink>()
        fun select(i: Int) {
            links.forEachIndexed { j, l -> l.font = l.font.deriveFont(if (j == i) Font.BOLD else Font.PLAIN) }
            jumpTo(sections[i].second)
        }
        sections.forEachIndexed { i, (title, _) ->
            val shortcut = if (i < 9) "Ctrl+Alt+${i + 1}" else null
            val link = ActionLink(plain(title)) { select(i) }
            link.toolTipText = plainTip(shortcut)
            link.accessibleName(title).accessibleDescription(shortcut ?: "")
            links += link
            val row = JPanel(BorderLayout(JBUI.scale(6), 0)).apply { isOpaque = false }
            row.add(link, BorderLayout.CENTER)
            if (shortcut != null) row.add(JBLabel(plain("${i + 1}")).apply { foreground = ToneColors.secondaryText(); font = JBUI.Fonts.smallFont() }, BorderLayout.EAST)
            panel.addStacked(row, 2)
            if (i < 9) {
                host.registerKeyboardAction({ select(i) },
                    KeyStroke.getKeyStroke(KeyEvent.VK_1 + i, InputEvent.CTRL_DOWN_MASK or InputEvent.ALT_DOWN_MASK),
                    JComponent.WHEN_IN_FOCUSED_WINDOW)
                host.registerKeyboardAction({ select(i) },
                    KeyStroke.getKeyStroke(KeyEvent.VK_NUMPAD1 + i, InputEvent.CTRL_DOWN_MASK or InputEvent.ALT_DOWN_MASK),
                    JComponent.WHEN_IN_FOCUSED_WINDOW)
            }
        }
        panel.accessibleName("Sections index")
        // the index keeps its width; the page gives it a column of its own
        return JPanel(BorderLayout()).apply {
            isOpaque = false
            add(panel, BorderLayout.NORTH)
            preferredSize = java.awt.Dimension(JBUI.scale(220), 0)
        }
    }

    /**
     * Compact mode on a rendered page: tighter vertical gaps, smaller captions and denser tables —
     * what the web's `--mateu-compact` custom properties do to every Lumo component.
     */
    fun compact(root: Container) {
        fun walk(c: Component) {
            when (c) {
                is Box.Filler -> {
                    val h = c.preferredSize.height
                    if (h > 0 && c.preferredSize.width == 0) {
                        val d = java.awt.Dimension(0, maxOf(1, h / 3))
                        c.changeShape(d, d, java.awt.Dimension(c.maximumSize.width, d.height))
                    }
                }
                is JComponent -> {
                    if (c.getClientProperty(FIELD_CAPTION_MARK) == true) c.font = c.font.deriveFont(c.font.size2D * 0.85f)
                    if (c is javax.swing.JTable) c.rowHeight = JBUI.scale(22)
                }
            }
            // a form grid's row gaps (GridBag insets) tighten too
            (c as? Container)?.let { box ->
                val gb = box.layout as? java.awt.GridBagLayout ?: return@let
                for (child in box.components) {
                    val k = gb.getConstraints(child)
                    k.insets = java.awt.Insets(k.insets.top / 2, k.insets.left, k.insets.bottom / 3, k.insets.right)
                    gb.setConstraints(child, k)
                }
            }
            if (c is JComponent && c.parent?.layout is javax.swing.BoxLayout) {
                c.maximumSize = java.awt.Dimension(c.maximumSize.width, c.preferredSize.height.coerceAtLeast(1))
            }
            if (c is Container) c.components.forEach(::walk)
        }
        walk(root)
    }

    /**
     * `labelsAside`: each field's caption to the LEFT of its control in a 10rem column (the dense
     * back-office idiom), not above it. [field] is what renderFormField returned.
     */
    fun labelAside(field: JComponent): JComponent {
        val caption = field.components.firstOrNull { (it as? JComponent)?.getClientProperty(FIELD_CAPTION_MARK) == true } as? JComponent
            ?: return field
        val rest = field.components.filter { it !== caption }
        field.removeAll()
        field.layout = BorderLayout(JBUI.scale(8), 0)
        val labelCol = object : JPanel(BorderLayout()) {
            override fun getPreferredSize() = java.awt.Dimension(JBUI.scale(160), super.getPreferredSize().height)
            override fun getMinimumSize() = preferredSize
        }
        labelCol.isOpaque = false
        caption.border = JBUI.Borders.emptyTop(6)
        labelCol.add(caption, BorderLayout.NORTH)
        val body = verticalPanel(2)
        rest.forEachIndexed { i, c -> body.addStackedBetween(c as JComponent, 2, first = i == 0) }
        field.add(labelCol, BorderLayout.WEST)
        field.add(body, BorderLayout.CENTER)
        return field
    }
}

/** Client property marking a form field's caption label (so page-level passes can find it). */
const val FIELD_CAPTION_MARK = "mateu.fieldCaption"
