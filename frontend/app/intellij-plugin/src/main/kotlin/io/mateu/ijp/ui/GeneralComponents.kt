package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.Splitter
import com.intellij.ui.IdeBorderFactory
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.Expressions
import java.awt.BorderLayout
import java.awt.CardLayout
import java.awt.Color
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import java.awt.GridLayout
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.BorderFactory
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JMenu
import javax.swing.JMenuItem
import javax.swing.JPanel
import javax.swing.JPopupMenu
import javax.swing.SwingConstants
import javax.swing.SwingUtilities
import javax.swing.table.DefaultTableModel

/*
 * The wire types that used to fall through to "Unsupported component" — layouts (master-detail,
 * carousel, board, content, responsive grid), navigation (breadcrumbs, menu bar, context menu,
 * directory), display (grid, virtual list, avatar(s), icon, details, tooltip, notification, result,
 * not-found, cookie consent, element), conversation (chat, message list/input), editors shown
 * read-only (BPMN, workflow, form editor), overlays met inline (dialog, drawer, confirm dialog) and
 * the micro-frontend island. Every interactive control gets an accessible name (a bare JComponent
 * has a NULL AccessibleContext — only concrete Swing classes are named here).
 */

private fun JsonNode.items(): List<JsonNode> = if (isArray) toList() else emptyList()

private fun kids(component: JsonNode): List<JsonNode> = component.path("children").items()

private fun renderAll(r: ComponentRenderer, nodes: List<JsonNode>, state: JsonNode, data: JsonNode): JPanel =
    verticalPanel().also { p -> nodes.forEach { p.addStacked(r.render(it, state, data), JBGap) } }

private fun muted(text: String, smaller: Boolean = true) = JBLabel(text).apply {
    foreground = UIUtil.getContextHelpForeground()
    if (smaller) font = font.deriveFont(font.size2D * 0.9f)
}

/** Run a menu option like the navigator does: its action, else its route. */
private fun openMenuOption(ctx: AppContext, item: JsonNode) {
    val actionId = item.text("actionId")
    val route = item.text("route").ifBlank { item.text("path") }
    when {
        actionId.isNotBlank() && route.isBlank() -> ctx.runAction(actionId, null)
        ctx.session.openViewHandler != null && route.isNotBlank() ->
            ctx.session.openViewHandler?.invoke(item.text("label"), route, item.text("consumedRoute"), item.text("serverSideType"), actionId.ifBlank { null })
        route.isNotBlank() -> ctx.navigate(route, item.text("consumedRoute"), item.text("serverSideType").ifBlank { null }, actionId)
    }
}

// ── layouts ────────────────────────────────────────────────────────────────────────────────

/** MasterDetailLayout: children[0] = master, children[1] = detail (optional) → a splitter. */
fun renderMasterDetail(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val children = kids(component)
    if (children.size < 2) return renderAll(r, children, state, data)
    return Splitter(false, 0.4f).apply {
        firstComponent = r.render(children[0], state, data)
        secondComponent = r.render(children[1], state, data)
    }
}

/** CarouselLayout: one slide at a time (children), ‹ › buttons, "n / total", dots as a label. */
fun renderCarousel(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val slides = kids(component)
    val cards = CardLayout()
    val deck = JPanel(cards).apply { isOpaque = false }
    slides.forEachIndexed { i, s -> deck.add(r.render(s, state, data), "s$i") }
    if (slides.size <= 1) return deck
    var current = metadata.path("selected").asInt(0).coerceIn(0, slides.size - 1)
    val loop = metadata.bool("loop", true)
    val counter = JBLabel()
    val prev = JButton("‹").accessibleName("Previous slide")
    val next = JButton("›").accessibleName("Next slide")
    fun show(i: Int) {
        current = i
        cards.show(deck, "s$i")
        counter.text = "${i + 1} / ${slides.size}"
        prev.isEnabled = loop || i > 0
        next.isEnabled = loop || i < slides.size - 1
    }
    prev.addActionListener { show(if (current == 0) slides.size - 1 else current - 1) }
    next.addActionListener { show((current + 1) % slides.size) }
    val nav = JPanel(FlowLayout(FlowLayout.CENTER, JBUI.scale(8), 0)).apply {
        isOpaque = false
        add(prev); add(counter); add(next)
    }
    show(current)
    return JPanel(BorderLayout()).apply {
        isOpaque = false
        add(deck, BorderLayout.CENTER)
        add(nav, if (metadata.bool("alt")) BorderLayout.NORTH else BorderLayout.SOUTH)
        accessibleName("Carousel")
    }
}

/** BoardLayout → rows stacked; BoardLayoutRow → equal columns; BoardLayoutItem → its content. */
fun renderBoard(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent =
    when (metadata.text("type")) {
        "BoardLayoutRow" -> {
            val items = kids(component).ifEmpty { metadata.path("content").items() }
            JPanel(GridLayout(1, items.size.coerceAtLeast(1), JBUI.scale(JBGap), 0)).apply {
                isOpaque = false
                items.forEach { add(r.render(it, state, data)) }
            }
        }
        "BoardLayoutItem" -> renderAll(r, kids(component).ifEmpty { metadata.path("content").items() }, state, data)
        else -> renderAll(r, kids(component).ifEmpty { metadata.path("rows").items() }, state, data)
    }

/** ContentLayout: slotted `main-*` centre, `aside-*` start/end column, `footer-*` below. */
fun renderContentLayout(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    fun region(prefix: String) = kids(component).filter { it.text("slot").startsWith(prefix) }
    val main = region("main-")
    val aside = region("aside-")
    val footer = region("footer-")
    val unslotted = kids(component).filter { it.text("slot").isBlank() }
    val panel = JPanel(BorderLayout(JBUI.scale(JBGap), JBUI.scale(JBGap))).apply { isOpaque = false }
    panel.add(renderAll(r, main + unslotted, state, data), BorderLayout.CENTER)
    if (aside.isNotEmpty()) {
        val side = renderAll(r, aside, state, data)
        side.preferredSize = Dimension(remPx(metadata.text("asideWidth"), 288), side.preferredSize.height)
        panel.add(side, if (metadata.text("asidePosition") == "start") BorderLayout.WEST else BorderLayout.EAST)
    }
    if (footer.isNotEmpty()) panel.add(renderAll(r, footer, state, data), BorderLayout.SOUTH)
    return panel
}

/** ResponsiveGrid: children on a grid with as many columns as `gridTemplateColumns` declares. */
fun renderResponsiveGrid(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val children = kids(component)
    val cols = gridColumnCount(metadata.text("gridTemplateColumns")).coerceIn(1, children.size.coerceAtLeast(1))
    // Spans honoured and rows sized to their own content (IJ-06): a GridLayout made every cell the
    // size of the biggest one.
    return renderSpanGrid(r, children.toList(), cols, state, data)
}

/** Columns in a CSS grid-template-columns value: `repeat(3, 1fr)` → 3, `2fr 1fr` → 2, blank → 2. */
internal fun gridColumnCount(template: String): Int {
    val t = template.trim()
    if (t.isBlank()) return 2
    Regex("repeat\\(\\s*(\\d+)").find(t)?.let { return it.groupValues[1].toInt() }
    if (t.startsWith("repeat(")) return 3 // auto-fit/auto-fill: a sensible desktop default
    var depth = 0
    var count = 0
    var inToken = false
    for (c in t) {
        when {
            c == '(' -> { depth++; if (!inToken) { inToken = true; count++ } }
            c == ')' -> depth--
            c.isWhitespace() && depth == 0 -> inToken = false
            !inToken -> { inToken = true; count++ }
        }
    }
    return count.coerceAtLeast(1)
}

/** FormItem: its children (label + control) side by side. */
fun renderFormItem(r: ComponentRenderer, component: JsonNode, state: JsonNode, data: JsonNode): JComponent =
    JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0)).apply {
        isOpaque = false
        kids(component).forEach { add(r.render(it, state, data)) }
    }

/** A Tab / AccordionPanel met outside its container: a titled group of its children. */
fun renderTitledChildren(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent =
    renderAll(r, kids(component), state, data).apply {
        border = IdeBorderFactory.createTitledBorder(metadata.text("label"), false)
    }

// ── navigation ─────────────────────────────────────────────────────────────────────────────

/** Breadcrumbs: linked trail, then the current item in bold. A single Breadcrumb is a link. */
fun renderBreadcrumbs(ctx: AppContext, metadata: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0)).apply { isOpaque = false }
    val crumbs = if (metadata.text("type") == "Breadcrumb") listOf(metadata) else metadata.path("breadcrumbs").items()
    crumbs.forEachIndexed { i, b ->
        if (i > 0) row.add(muted("›", smaller = false))
        val link = b.text("link")
        row.add(if (link.isNotBlank()) ActionLink(b.text("text")) { ctx.navigate(link, "", null, "") } else JBLabel(b.text("text")))
    }
    val current = metadata.text("currentItemText")
    if (current.isNotBlank()) {
        if (crumbs.isNotEmpty()) row.add(muted("›", smaller = false))
        row.add(JBLabel(current).apply { font = font.deriveFont(Font.BOLD) })
    }
    return row.accessibleName("Breadcrumbs")
}

private fun menuItemsOf(ctx: AppContext, options: List<JsonNode>, add: (JComponent) -> Unit) {
    for (o in options) {
        if (o.bool("separator")) {
            add(JPopupMenu.Separator())
            continue
        }
        val subs = o.path("submenus").items()
        if (subs.isNotEmpty()) {
            val menu = JMenu(o.text("label"))
            menuItemsOf(ctx, subs) { menu.add(it) }
            add(menu)
        } else {
            add(JMenuItem(o.text("label")).apply {
                isEnabled = !o.bool("disabled")
                addActionListener { openMenuOption(ctx, o) }
            })
        }
    }
}

/**
 * MenuBar: a row of buttons — a group opens its entries in a popup (submenus nest), a leaf runs its
 * action / opens its route. Buttons rather than a nested JMenuBar: a menu bar inside a tool window
 * or editor tab is not an IDE idiom, and it fights the frame's own main menu for mnemonics.
 */
fun renderMenuBar(ctx: AppContext, metadata: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0)).apply { isOpaque = false }
    for (o in metadata.path("options").items()) {
        if (o.bool("separator")) continue
        val subs = o.path("submenus").items()
        val button = JButton(if (subs.isEmpty()) o.text("label") else o.text("label") + " ▾")
        button.isEnabled = !o.bool("disabled")
        button.accessibleName(o.text("label"))
        if (subs.isEmpty()) {
            button.addActionListener { openMenuOption(ctx, o) }
        } else {
            val popup = JPopupMenu()
            menuItemsOf(ctx, subs) { popup.add(it) }
            button.addActionListener { popup.show(button, 0, button.height) }
        }
        row.add(button)
    }
    return row.accessibleName("Menu bar")
}

/** ContextMenu: the wrapped component with a popup (right click, or left click when asked). */
fun renderContextMenu(r: ComponentRenderer, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val wrapped = r.render(metadata.path("wrapped"), state, data)
    val popup = JPopupMenu()
    menuItemsOf(r.ctx, metadata.path("menu").items()) { popup.add(it) }
    wrapped.componentPopupMenu = popup
    if (metadata.bool("activateOnLeftClick")) {
        wrapped.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                if (SwingUtilities.isLeftMouseButton(e)) popup.show(e.component, e.x, e.y)
            }
        })
    }
    wrapped.toolTipText = wrapped.toolTipText ?: "Right-click for options"
    return wrapped
}

/** Directory: a sitemap of the menu — group headers and their leaves as links. */
fun renderDirectory(ctx: AppContext, metadata: JsonNode): JComponent {
    val panel = verticalPanel(4)
    fun addAll(items: List<JsonNode>, depth: Int) {
        for (o in items) {
            if (o.bool("separator")) continue
            val subs = o.path("submenus").items()
            if (subs.isNotEmpty()) {
                panel.addStacked(JBLabel(o.text("label")).apply {
                    font = font.deriveFont(Font.BOLD)
                    border = JBUI.Borders.emptyLeft(depth * 12)
                }, 6)
                addAll(subs, depth + 1)
            } else {
                panel.addStacked(ActionLink(o.text("label")) { openMenuOption(ctx, o) }.apply {
                    border = JBUI.Borders.emptyLeft(depth * 12)
                }, 2)
                o.text("description").takeIf { it.isNotBlank() }?.let {
                    panel.addStacked(muted(it).apply { border = JBUI.Borders.emptyLeft(depth * 12) }, 0)
                }
            }
        }
    }
    addAll(metadata.path("menu").items(), 0)
    return panel.accessibleName("Directory")
}

// ── display ────────────────────────────────────────────────────────────────────────────────

/** Rows of a Grid / VirtualList: the data fragment for its id, its own page, or its state value. */
private fun pageRows(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): List<JsonNode> {
    val id = component.text("id")
    val fromData = if (id.isNotBlank()) data.path(id).path("page").path("content") else null
    if (fromData != null && fromData.isArray) return fromData.toList()
    val own = metadata.path("page").path("content")
    if (own.isArray && !own.isEmpty) return own.toList()
    val fromState = if (id.isNotBlank()) state.path(id) else null
    return if (fromState != null && fromState.isArray) fromState.toList() else emptyList()
}

private fun cellText(v: JsonNode): String = when {
    v.isMissingNode || v.isNull -> ""
    v.isValueNode -> v.asText()
    v.has("label") -> v.text("label")
    v.has("text") -> v.text("text")
    else -> v.toString()
}

/** Grid (the simple, non-CRUD table): GridColumn children of `content` × page rows, read-only. */
fun renderGrid(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val columns = metadata.path("content").items().map { it.path("metadata").takeIf { m -> m.isObject } ?: it }
        .filter { it.text("type", "GridColumn") == "GridColumn" }
    val rows = pageRows(component, metadata, state, data)
    val ids = columns.map { it.text("id") }.ifEmpty { rows.firstOrNull()?.fieldNames()?.asSequence()?.toList() ?: emptyList() }
    val labels = if (columns.isNotEmpty()) columns.map { it.text("label", it.text("id")) } else ids
    val model = object : DefaultTableModel(labels.toTypedArray(), 0) {
        override fun isCellEditable(row: Int, column: Int) = false
    }
    rows.forEach { row -> model.addRow(ids.map { cellText(row.path(it)) }.toTypedArray()) }
    val table = JBTable(model).apply {
        setShowGrid(metadata.bool("columnBorders"))
        emptyText.text = "No data."
        accessibleName(component.text("id").ifBlank { "Grid" })
    }
    val visible = rows.size.coerceIn(3, 15)
    return JBScrollPane(table).fixedHeight(JBUI.scale(28) * (visible + 1))
}

/** VirtualList: the rows as a list, one line each (the row's text/label, else its first values). */
fun renderVirtualList(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val rows = pageRows(component, metadata, state, data).map { row ->
        when {
            row.isValueNode -> row.asText()
            row.has("text") || row.has("label") -> cellText(row)
            else -> row.properties().asSequence().take(3).map { cellText(it.value) }.filter { it.isNotBlank() }.joinToString(" · ")
        }
    }
    val list = JBList(rows).apply { emptyText.text = "No items."; accessibleName("List") }
    return JBScrollPane(list).fixedHeight(JBUI.scale(24) * rows.size.coerceIn(3, 15))
}

/** Avatar: a round badge with initials (from `abbreviation`, else the name); the name as tooltip. */
fun renderAvatar(metadata: JsonNode): JComponent {
    val name = metadata.text("name")
    val initials = metadata.text("abbreviation").ifBlank {
        name.split(Regex("\\s+")).filter { it.isNotBlank() }.take(2).joinToString("") { it.take(1).uppercase() }
    }.ifBlank { "?" }
    return AvatarLabel(initials, avatarColor(name.ifBlank { initials })).apply {
        toolTipText = name.ifBlank { null }
        accessibleName(name.ifBlank { initials })
    }
}

/** AvatarGroup: the first `maxItemsVisible` avatars, then "+N". */
fun renderAvatarGroup(metadata: JsonNode): JComponent {
    val avatars = metadata.path("avatars").items()
    val max = metadata.path("maxItemsVisible").asInt(0).let { if (it <= 0) avatars.size else it }
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(2), 0)).apply { isOpaque = false }
    avatars.take(max).forEach { row.add(renderAvatar(it)) }
    if (avatars.size > max) row.add(muted("+${avatars.size - max}", smaller = false))
    return row.accessibleName(avatars.joinToString(", ") { it.text("name") }.ifBlank { "Avatars" })
}

private class AvatarLabel(text: String, private val fill: Color) : JBLabel(text, SwingConstants.CENTER) {
    init {
        foreground = Color.WHITE
        font = font.deriveFont(Font.BOLD, font.size2D * 0.85f)
        val d = JBUI.scale(28)
        preferredSize = Dimension(d, d)
        minimumSize = preferredSize
    }

    override fun paintComponent(g: java.awt.Graphics) {
        val g2 = g.create() as java.awt.Graphics2D
        g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON)
        g2.color = fill
        val s = minOf(width, height)
        g2.fillOval((width - s) / 2, (height - s) / 2, s, s)
        g2.dispose()
        super.paintComponent(g)
    }
}

private fun avatarColor(seed: String): Color {
    val palette = listOf(0x1E88E5, 0x43A047, 0x8E24AA, 0xF4511E, 0x00897B, 0x6D4C41, 0x3949AB, 0xC0CA33)
    return Color(palette[Math.floorMod(seed.hashCode(), palette.size)])
}

/** Icon: the platform icon for known names, else the name in muted text. */
fun renderIcon(metadata: JsonNode): JComponent {
    val name = metadata.text("icon")
    val icon = uxActionIcon(name.substringAfter(':'))
    return (if (icon != null) JBLabel(icon) else muted(name.substringAfter(':'), smaller = false)).accessibleName(name)
}

/** Details: a disclosure — the summary toggles the content. */
fun renderDetails(r: ComponentRenderer, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val content = r.render(metadata.path("content"), state, data)
    val summary = r.render(metadata.path("summary"), state, data)
    val toggle = JButton().apply {
        isBorderPainted = false
        isContentAreaFilled = false
        border = JBUI.Borders.empty()
    }
    fun sync() {
        toggle.text = if (content.isVisible) "▾" else "▸"
        toggle.accessibleName(if (content.isVisible) "Collapse" else "Expand")
    }
    content.isVisible = metadata.bool("opened")
    toggle.addActionListener {
        content.isVisible = !content.isVisible
        sync()
        content.parent?.revalidate()
    }
    sync()
    val header = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0)).apply { isOpaque = false; add(toggle); add(summary) }
    return verticalPanel(4).apply {
        addStacked(header, 0)
        addStacked(content.apply { border = JBUI.Borders.emptyLeft(20) }, 4)
    }
}

/** Tooltip: the wrapped component with the tooltip text. */
fun renderTooltip(r: ComponentRenderer, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent =
    r.render(metadata.path("wrapped"), state, data).apply {
        toolTipText = metadata.text("text")
        accessibleDescription(metadata.text("text"))
    }

/** Notification met inline: a tinted strip with the title and text. */
fun renderNotification(metadata: JsonNode): JComponent = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(8), JBUI.scale(6))).apply {
    background = JBUI.CurrentTheme.NotificationInfo.backgroundColor()
    border = BorderFactory.createLineBorder(JBUI.CurrentTheme.NotificationInfo.borderColor())
    metadata.text("title").takeIf { it.isNotBlank() }?.let { add(JBLabel(it).apply { font = font.deriveFont(Font.BOLD) }) }
    metadata.text("text").takeIf { it.isNotBlank() }?.let { add(JBLabel(it)) }
    accessibleName(listOf(metadata.text("title"), metadata.text("text")).filter { it.isNotBlank() }.joinToString(": "))
}

/** Result: an outcome page — icon by type, title, message, interesting links, and "now go to". */
fun renderResult(ctx: AppContext, metadata: JsonNode): JComponent {
    val type = metadata.text("resultType", "Info")
    val icon = when (type) {
        "Success" -> "✓"
        "Warning" -> "!"
        "Error" -> "✕"
        "Ignored" -> "–"
        else -> "ℹ"
    }
    val color = when (type) {
        "Success" -> JBUI.CurrentTheme.Banner.SUCCESS_BORDER_COLOR
        "Warning" -> JBUI.CurrentTheme.Banner.WARNING_BORDER_COLOR
        "Error" -> JBUI.CurrentTheme.Banner.ERROR_BORDER_COLOR
        else -> JBUI.CurrentTheme.Banner.INFO_BORDER_COLOR
    }
    val panel = verticalPanel()
    panel.addStacked(JBLabel(icon).apply { foreground = color; font = font.deriveFont(Font.BOLD, font.size2D * 2.5f) }, 0)
    panel.addStacked(JBLabel(metadata.text("title", type)).apply { font = font.deriveFont(Font.BOLD, font.size2D * 1.4f) }, JBGap)
    metadata.text("message").takeIf { it.isNotBlank() }?.let { panel.addStacked(JBLabel("<html>$it</html>"), JBGap) }
    fun destination(d: JsonNode): JComponent {
        val label = d.text("description", d.text("value"))
        val value = d.text("value")
        return ActionLink(label) {
            when (d.text("type")) {
                "ActionId", "Action", "action" -> ctx.runAction(value.ifBlank { d.text("id") }, null)
                else -> if (value.startsWith("/")) ctx.navigate(value, "", null, "") else com.intellij.ide.BrowserUtil.browse(value)
            }
        }
    }
    metadata.path("interestingLinks").items().forEach { panel.addStacked(destination(it), 4) }
    metadata.path("nowTo").takeIf { it.isObject }?.let { panel.addStacked(destination(it), JBGap) }
    return panel.accessibleName("${metadata.text("title", type)} ($type)")
}

/** NotFound: title, message and a way back. */
fun renderNotFound(ctx: AppContext, metadata: JsonNode): JComponent {
    val panel = verticalPanel()
    panel.addStacked(JBLabel(metadata.text("title", "Not found")).apply { font = font.deriveFont(Font.BOLD, font.size2D * 1.4f) }, 0)
    panel.addStacked(muted(metadata.text("message", "The page you are looking for does not exist."), smaller = false), JBGap)
    val back = metadata.text("backRoute")
    if (back.isNotBlank()) panel.addStacked(ActionLink(metadata.text("backLabel", "Go back")) { ctx.navigate(back, "", null, "") }, JBGap)
    return panel
}

/** Cookies do not exist in the IDE; the consent strip still shows its message and is dismissible. */
private val dismissedConsents = java.util.Collections.synchronizedSet(HashSet<String>())

fun renderCookieConsent(metadata: JsonNode): JComponent {
    val key = metadata.text("cookieName", "cookieconsent_status")
    if (key in dismissedConsents) return JPanel().apply { isOpaque = false; isVisible = false }
    val strip = JPanel(BorderLayout(JBUI.scale(8), 0)).apply {
        border = JBUI.Borders.empty(6, 10)
        background = JBUI.CurrentTheme.NotificationInfo.backgroundColor()
    }
    val text = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false }
    text.add(JBLabel(metadata.text("message", "This app uses cookies.")))
    metadata.text("learnMoreLink").takeIf { it.isNotBlank() }?.let { link ->
        text.add(ActionLink(metadata.text("learnMore", "Learn more")) { com.intellij.ide.BrowserUtil.browse(link) })
    }
    strip.add(text, BorderLayout.CENTER)
    strip.add(JButton(metadata.text("dismiss", "Got it")).apply {
        addActionListener {
            dismissedConsents += key
            strip.isVisible = false
            strip.parent?.revalidate()
        }
    }, BorderLayout.EAST)
    return strip.accessibleName("Cookie consent")
}

/** Element: an arbitrary HTML element — rendered as HTML text; a `click` handler runs its action. */
fun renderElement(ctx: AppContext, metadata: JsonNode): JComponent {
    val name = metadata.text("name", "div")
    val content = metadata.text("content")
    val html = if (metadata.bool("html")) content else com.intellij.openapi.util.text.StringUtil.escapeXmlEntities(content)
    val label = JBLabel(if (name in setOf("h1", "h2", "h3", "h4", "b", "strong", "em", "i", "small", "code", "pre")) {
        "<html><$name>$html</$name></html>"
    } else {
        "<html>$html</html>"
    })
    metadata.path("on").path("click").takeIf { it.isTextual && it.asText().isNotBlank() }?.let { action ->
        label.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
        label.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) = ctx.runAction(action.asText(), null)
        })
    }
    return label
}

// ── editors shown read-only ─────────────────────────────────────────────────────────────────

/** BPMN: the process as an ordered list of its named flow nodes (start → tasks → end). */
fun renderBpmn(metadata: JsonNode): JComponent {
    val nodes = bpmnFlowNodes(metadata.text("xml"))
    val panel = verticalPanel(4)
    panel.addStacked(JBLabel("Process").apply { font = font.deriveFont(Font.BOLD) }, 0)
    if (nodes.isEmpty()) panel.addStacked(muted("Empty or unreadable BPMN diagram."), 4)
    nodes.forEachIndexed { i, (kind, label) ->
        val glyph = when {
            kind.endsWith("startEvent") -> "○"
            kind.endsWith("endEvent") -> "◉"
            kind.contains("Gateway") -> "◇"
            else -> "▭"
        }
        panel.addStacked(JBLabel("${if (i > 0) "↓ " else ""}$glyph $label"), 2)
    }
    return panel.accessibleName("BPMN process: " + nodes.joinToString(", ") { it.second })
}

/** (element kind, label) of the flow nodes in a BPMN XML, in sequence-flow order when it can tell. */
internal fun bpmnFlowNodes(xml: String): List<Pair<String, String>> {
    if (xml.isBlank()) return emptyList()
    val doc = runCatching {
        val f = javax.xml.parsers.DocumentBuilderFactory.newInstance()
        f.isNamespaceAware = true
        f.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)
        f.newDocumentBuilder().parse(org.xml.sax.InputSource(java.io.StringReader(xml)))
    }.getOrNull() ?: return emptyList()
    val kinds = setOf("startEvent", "endEvent", "task", "userTask", "serviceTask", "scriptTask", "manualTask",
        "businessRuleTask", "sendTask", "receiveTask", "subProcess", "callActivity", "exclusiveGateway",
        "parallelGateway", "inclusiveGateway", "eventBasedGateway", "intermediateCatchEvent", "intermediateThrowEvent")
    val all = doc.getElementsByTagNameNS("*", "*")
    val byId = LinkedHashMap<String, Pair<String, String>>()
    val flows = ArrayList<Pair<String, String>>()
    for (i in 0 until all.length) {
        val e = all.item(i) as org.w3c.dom.Element
        val local = e.localName ?: e.tagName.substringAfter(':')
        if (local in kinds) byId[e.getAttribute("id")] = local to e.getAttribute("name").ifBlank { local }
        if (local == "sequenceFlow") flows += e.getAttribute("sourceRef") to e.getAttribute("targetRef")
    }
    val start = byId.entries.firstOrNull { it.value.first == "startEvent" }?.key ?: return byId.values.toList()
    val ordered = LinkedHashMap<String, Pair<String, String>>()
    val queue = ArrayDeque(listOf(start))
    while (queue.isNotEmpty()) {
        val id = queue.removeFirst()
        if (id in ordered) continue
        byId[id]?.let { ordered[id] = it }
        flows.filter { it.first == id }.forEach { queue.addLast(it.second) }
    }
    byId.forEach { (id, v) -> if (id !in ordered) ordered[id] = v }
    return ordered.values.toList()
}

/** Workflow / FormEditor: their serialized value, read-only and monospaced. */
fun renderSourceView(title: String, value: String): JComponent {
    val area = com.intellij.ui.components.JBTextArea(value.ifBlank { "(empty)" }).apply {
        isEditable = false
        font = Font(Font.MONOSPACED, Font.PLAIN, font.size)
        rows = value.lines().size.coerceIn(3, 20)
        accessibleName(title)
    }
    return JBScrollPane(area).apply { border = IdeBorderFactory.createTitledBorder(title, false) }
        .let { it.fixedHeight(it.preferredSize.height) }
}

// ── conversation ───────────────────────────────────────────────────────────────────────────

/** MessageList: author (avatar initials), time and text per message. */
fun renderMessageList(metadata: JsonNode): JComponent {
    val panel = verticalPanel(6)
    for (m in metadata.path("items").items()) {
        val user = m.text("userName")
        val row = JPanel(BorderLayout(JBUI.scale(8), 0)).apply { isOpaque = false }
        row.add(renderAvatar(m.deepCopy<com.fasterxml.jackson.databind.node.ObjectNode>().apply {
            put("name", user)
            put("abbreviation", m.text("userAbbr"))
        }), BorderLayout.WEST)
        val body = verticalPanel(2)
        body.addStacked(JBLabel("<html><b>${com.intellij.openapi.util.text.StringUtil.escapeXmlEntities(user)}</b> " +
            "<span style='color:gray'>${com.intellij.openapi.util.text.StringUtil.escapeXmlEntities(m.text("time"))}</span></html>"), 0)
        body.addStacked(JBLabel("<html>${com.intellij.openapi.util.text.StringUtil.escapeXmlEntities(m.text("text"))}</html>"), 0)
        row.add(body, BorderLayout.CENTER)
        panel.addStacked(row.accessibleName("$user: ${m.text("text")}"), 6)
    }
    return panel.accessibleName("Messages")
}

/** MessageInput: a text field + Send; Enter or Send runs `actionId` with `{message}`. */
fun renderMessageInput(ctx: AppContext, metadata: JsonNode): JComponent {
    val field = JBTextField().accessibleName("Message")
    val send = JButton("Send")
    fun submit() {
        val text = field.text.trim()
        val actionId = metadata.text("actionId")
        if (text.isBlank() || actionId.isBlank()) return
        ctx.runAction(actionId, mapOf("message" to text))
        field.text = ""
    }
    field.addActionListener { submit() }
    send.addActionListener { submit() }
    return JPanel(BorderLayout(JBUI.scale(6), 0)).apply {
        isOpaque = false
        add(field, BorderLayout.CENTER)
        add(send, BorderLayout.EAST)
    }
}

/** Chat: the assistant conversation inline (same mateu-chat SSE contract as the app's assistant). */
fun renderChat(ctx: AppContext, metadata: JsonNode): JComponent {
    val url = metadata.text("sseUrl")
    if (url.isBlank()) return muted("Chat: no endpoint configured.")
    return buildChatPanel(url, ctx.session.apiClient.tokenProvider).fixedHeight(JBUI.scale(360))
}

// ── overlays met inline, and islands ────────────────────────────────────────────────────────

/** Dialog / Drawer inside a tree (not an Add fragment): opened as the usual overlay, once. */
fun renderInlineOverlay(ctx: AppContext, component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    SwingUtilities.invokeLater { ctx.openOverlayOnce(component, state, data) }
    return JPanel().apply { isOpaque = false; isVisible = false }
}

/** ConfirmDialog: when `openedCondition` holds, a modal with confirm / reject / cancel → their actions. */
fun renderConfirmDialog(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val condition = metadata.text("openedCondition")
    val opened = condition.isNotBlank() && runCatching {
        val m = r.ctx.session.mapper
        @Suppress("UNCHECKED_CAST")
        Expressions.truthy(Expressions.evaluate(condition, mapOf(
            "state" to m.convertValue(state, Map::class.java) as Map<String, Any?>?,
            "data" to m.convertValue(data, Map::class.java) as Map<String, Any?>?,
            "appState" to r.ctx.session.appState,
        )))
    }.getOrDefault(false)
    if (!opened) return JPanel().apply { isOpaque = false; isVisible = false }
    val body = renderAll(r, kids(component), state, data)
    SwingUtilities.invokeLater {
        val options = buildList {
            add(metadata.text("confirmText", "OK") to metadata.text("confirmActionId"))
            if (metadata.bool("canReject")) add(metadata.text("rejectText", "No") to metadata.text("rejectActionId"))
            if (metadata.bool("canCancel")) add("Cancel" to metadata.text("cancelActionId"))
        }
        val choice = javax.swing.JOptionPane.showOptionDialog(
            r.ctx.contentPane, body, metadata.text("header", "Confirm"),
            javax.swing.JOptionPane.DEFAULT_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, null,
            options.map { it.first }.toTypedArray(), options.first().first,
        )
        options.getOrNull(choice)?.second?.takeIf { it.isNotBlank() }?.let { r.ctx.runAction(it, null) }
    }
    return JPanel().apply { isOpaque = false; isVisible = false }
}

/**
 * MicroFrontend: another Mateu UI embedded as an island with its own context. Same backend → the
 * same session (and credentials); another origin → its own session WITHOUT this project's token.
 */
fun renderMicroFrontend(ctx: AppContext, metadata: JsonNode): JComponent {
    val base = metadata.text("baseUrl").trimEnd('/')
    val sameBackend = base.isBlank() || base == ctx.session.baseUrl.trimEnd('/')
    val session = if (sameBackend) ctx.session else {
        @Suppress("UNCHECKED_CAST")
        val appState = ctx.session.mapper.convertValue(metadata.path("appState"), Map::class.java) as Map<String, Any?>? ?: emptyMap()
        AppSession(base, appState)
    }
    val island = AppContext(session)
    island.titleConsumer = {}
    island.silentErrors = true
    val slot = island.newSlot()
    island.contentPane = slot
    island.navigate(
        metadata.text("route").ifBlank { "/" },
        metadata.text("consumedRoute"),
        metadata.text("serverSideType").ifBlank { null },
        metadata.text("actionId"),
    )
    return slot.accessibleName("Embedded app")
}

/** A scrollable block keeps its height inside a vertical stack (BoxLayout would squeeze it to its
 *  tiny minimum when the page is taller than the viewport). */
private fun <T : JComponent> T.fixedHeight(height: Int): T = apply {
    preferredSize = Dimension(preferredSize.width, height)
    minimumSize = Dimension(minimumSize.width, height)
}

private fun remPx(size: String, def: Int): Int {
    val s = size.trim()
    return when {
        s.endsWith("rem") -> ((s.removeSuffix("rem").toDoubleOrNull() ?: return JBUI.scale(def)) * 16).toInt().let(JBUI::scale)
        s.endsWith("px") -> JBUI.scale(s.removeSuffix("px").toDoubleOrNull()?.toInt() ?: def)
        else -> JBUI.scale(def)
    }
}
