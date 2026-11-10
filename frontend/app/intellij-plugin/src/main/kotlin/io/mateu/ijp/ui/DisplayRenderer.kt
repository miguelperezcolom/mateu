package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import java.awt.Graphics
import java.awt.Graphics2D
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingConstants

/** Display components: page blocks (HeroSection, EmptyState, Skeleton, FoldoutLayout, Gantt, Image) on Swing. */

/** Display components (HeroSection, EmptyState, Skeleton, FoldoutLayout, Gantt) on Swing. */

fun renderHeroSection(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    // `height` (14rem) is the band's height; `image` its background, covered by a dark veil so the
    // white title stays readable (the web's hero) — both were ignored
    val minHeight = cssLengthPx(metadata.text("height"))?.let { JBUI.scale(it) } ?: 0
    val panel = HeroPanel(minHeight)
    panel.layout = javax.swing.BoxLayout(panel, javax.swing.BoxLayout.Y_AXIS)
    panel.border = JBUI.Borders.empty(28, 16)
    metadata.text("image").takeIf { it.isNotBlank() }?.let { src -> panel.loadBackground(heroImageUrl(r.ctx.session.baseUrl, src)) }
    val centered = !metadata.has("centered") || metadata.path("centered").isNull || metadata.path("centered").asBoolean(true)
    val textAlign = if (centered) SwingConstants.CENTER else SwingConstants.LEADING
    // `tone` (ocean, pine, …): a dark tinted band with light ink; absent/unknown → the default look.
    val tone = PageSlots.heroToneColor(metadata.text("tone"))
    panel.background = tone ?: Color(0x2B, 0x3A, 0x55)
    panel.isOpaque = true
    // `overline`: a short quiet line above the title (the Redwood welcome page's overline).
    val overline = metadata.text("overline")
    if (overline.isNotBlank()) {
        val o = JBLabel(plain(overline), textAlign)
        o.foreground = if (tone != null) PageSlots.HERO_SUBTITLE_INK else Color(0xD9, 0xE2, 0xF2)
        o.font = o.font.deriveFont(Font.PLAIN, o.font.size2D * 0.9f)
        panel.addStacked(o, 2)
    }
    val title = JBLabel(plain(metadata.text("title")), textAlign)
    title.font = title.font.deriveFont(Font.BOLD, PageChrome.fontSize(24f))
    title.foreground = Color.WHITE
    panel.addStacked(title, 6)
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(plain(subtitle), textAlign)
        l.foreground = if (tone != null) PageSlots.HERO_SUBTITLE_INK else Color(0xD9, 0xE2, 0xF2)
        panel.addStacked(l, 10)
    }
    // The hero's call-to-action buttons sit side by side in one centred row (they were stretched
    // into full-width bars, one per line); any other child keeps its own line.
    // (Built first, stacked after: addStacked freezes a child's height when it is added.)
    val blocks = ArrayList<JComponent>()
    var ctas: JPanel? = null
    for (child in component.path("children")) {
        if (child.path("metadata").text("type") == "Button") {
            val row = ctas ?: JPanel(FlowLayout(if (centered) FlowLayout.CENTER else FlowLayout.LEFT, JBUI.scale(8), 0)).also {
                it.isOpaque = false
                blocks.add(it)
                ctas = it
            }
            row.add(r.render(child, state, data))
        } else {
            ctas = null
            blocks.add(r.render(child, state, data))
        }
    }
    for (block in blocks) panel.addStacked(block, 6)
    return panel
}

/** A hero's image url: a root-relative path resolves against the app's own origin. */
internal fun heroImageUrl(baseUrl: String, src: String): String = when {
    src.startsWith("data:") || Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(src) -> src
    src.startsWith("/") -> runCatching { java.net.URI(baseUrl).resolve(src).toString() }.getOrDefault(src)
    else -> src
}

/** The hero band: at least [minHeight] tall, painting an optional background image (cover + veil). */
internal class HeroPanel(private val minHeight: Int) : JPanel() {
    @Volatile var image: java.awt.image.BufferedImage? = null
        private set

    override fun getPreferredSize(): java.awt.Dimension = super.getPreferredSize().let { java.awt.Dimension(it.width, maxOf(it.height, minHeight)) }

    fun loadBackground(url: String) {
        Thread {
            val svg = SvgImages.isSvg(url)
            val img = runCatching {
                val bytes = if (url.startsWith("data:")) (if (svg) SvgImages.dataUriBytes(url) else java.util.Base64.getDecoder().decode(url.substringAfter("base64,")))
                else java.net.URI(url).toURL().openStream().use { it.readBytes() }
                bytes?.let { decodeImage(it, svg) }
            }.getOrNull() ?: return@Thread
            javax.swing.SwingUtilities.invokeLater { image = img; repaint() }
        }.apply { isDaemon = true; name = "mateu-hero-image" }.start()
    }

    override fun paintComponent(g: java.awt.Graphics) {
        super.paintComponent(g)
        val img = image ?: return
        val g2 = g.create() as java.awt.Graphics2D
        g2.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR)
        // object-fit: cover
        val s = maxOf(width.toDouble() / img.width, height.toDouble() / img.height)
        val w = (img.width * s).toInt()
        val h = (img.height * s).toInt()
        g2.drawImage(img, (width - w) / 2, (height - h) / 2, w, h, null)
        g2.color = Color(0, 0, 0, 110)
        g2.fillRect(0, 0, width, height)
        g2.dispose()
    }
}

fun renderEmptyState(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(4)
    panel.border = JBUI.Borders.empty(28)
    // An emoji glyph shows; a web icon token ("vaadin:list-select") is not a glyph — it printed as
    // raw text above the title.
    val icon = metadata.text("icon").takeUnless { it.contains(':') }.orEmpty()
    if (icon.isNotBlank()) panel.addStacked(JBLabel(plain(icon), SwingConstants.CENTER).apply { font = font.deriveFont(PageChrome.fontSize(28f)) }, 4)
    val title = metadata.text("title")
    if (title.isNotBlank()) panel.addStacked(JBLabel(plain(title), SwingConstants.CENTER).apply { font = font.deriveFont(Font.BOLD, PageChrome.fontSize(15f)) }, 2)
    val description = metadata.text("description")
    if (description.isNotBlank()) {
        panel.addStacked(JBLabel(plain(description), SwingConstants.CENTER).apply {
            foreground = ToneColors.secondaryText()
        }, 6)
    }
    val actionId = metadata.text("actionId")
    if (actionId.isNotBlank()) {
        val row = JPanel(FlowLayout(FlowLayout.CENTER, 0, 0))
        row.isOpaque = false
        row.add(JButton(plain(metadata.text("actionLabel", actionId))).apply {
            addActionListener { r.ctx.runAction(actionId, null) }
        })
        panel.addStacked(row, 0)
    }
    return panel
}

fun renderSkeleton(metadata: JsonNode): JComponent {
    val count = metadata.path("count").asInt(1).coerceIn(1, 10)
    val variant = metadata.text("variant", "text")
    val panel = verticalPanel(6)
    repeat(count) {
        val block = JPanel()
        // a tint of the theme (a fixed #E4E6E9 glared as white bars in a dark IDE), scaled for HiDPI
        block.background = SurfaceColors.placeholder
        block.isOpaque = true
        block.preferredSize = when (variant) {
            "card" -> JBUI.size(320, 96)
            "grid" -> JBUI.size(420, 32)
            "form" -> JBUI.size(320, 40)
            else -> JBUI.size(280, 16)
        }
        block.maximumSize = block.preferredSize
        panel.addStacked(block, 4)
    }
    return panel
}

/** Foldout: overview stays visible on the left; panels unfold as vertical accordion strips. */
fun renderFoldout(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    // The VB/Redwood foldout anatomy: a HORIZONTAL row of always-expanded columns — the
    // overview first, then one column per panel, each with its own heading ("Operaciones ·
    // 2 de 7") and widths proportional to the wire's FoldoutPanel.width (rem units; the
    // overview weighs the renderer default, 22).
    val children = component.path("children").toList()
    val panelsInfo = metadata.arr("panels")

    fun column(title: String, subtitle: String, content: JComponent, summary: JComponent? = null): JComponent {
        val col = JPanel(BorderLayout(0, JBUI.scale(8)))
        col.isOpaque = false
        col.border = JBUI.Borders.empty(0, 0, 0, JBUI.scale(16))
        if (title.isNotBlank() || subtitle.isNotBlank() || summary != null) {
            val heading = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0)).apply { isOpaque = false }
            if (title.isNotBlank()) {
                heading.add(JBLabel(plain(title)).apply { font = font.deriveFont(Font.BOLD, font.size2D + 3f) })
            }
            if (subtitle.isNotBlank()) {
                heading.add(JBLabel(plain("· $subtitle")).apply { foreground = uxMuted() })
            }
            if (summary == null) {
                col.add(heading, BorderLayout.NORTH)
            } else {
                // The panel's `summary` slot — what a FOLDED panel shows. These columns never fold,
                // so it reads as a compact digest line under the heading.
                val top = verticalPanel(2)
                top.addStacked(heading, 2)
                top.addStacked(summary, 0)
                col.add(top, BorderLayout.NORTH)
            }
        }
        // NO inner scroll pane: nested JScrollPanes collapse to 0 in the stacked form (see the
        // renderProbe gotcha) — the page's own scroller handles overflow.
        col.add(content, BorderLayout.CENTER)
        return col
    }

    // Each column keeps its declared width (FoldoutPanel.width; the overview the renderer default,
    // 22rem) and the row scrolls sideways when they do not fit — the web's anatomy. It used to be a
    // weighted grid squeezed into the window: nine panels at 1200px became ~110px slivers with their
    // headings cut ("Not…") and every line wrapped word by word.
    fun widthPx(spec: String): Int = JBUI.scale(((FoldoutFit.widthPx(spec, 0.0) ?: 352.0)).toInt().coerceAtLeast(160))

    val row = JPanel()
    row.layout = javax.swing.BoxLayout(row, javax.swing.BoxLayout.X_AXIS)
    row.isOpaque = false
    fun add(columnWidth: Int, col: JComponent) {
        val fixed = object : JPanel(BorderLayout()) {
            override fun getPreferredSize() = Dimension(columnWidth, super.getPreferredSize().height)
            override fun getMinimumSize() = preferredSize
            override fun getMaximumSize() = Dimension(columnWidth, Int.MAX_VALUE)
        }
        fixed.isOpaque = false
        fixed.alignmentY = java.awt.Component.TOP_ALIGNMENT
        // panels after the first are divided by the theme's separator line, like the web's panels
        if (row.componentCount > 0) fixed.border = JBUI.Borders.compound(
            JBUI.Borders.customLineLeft(com.intellij.ui.JBColor.border()), JBUI.Borders.emptyLeft(16))
        fixed.add(col, BorderLayout.CENTER)
        row.add(fixed)
    }

    val overview = children.firstOrNull { it.text("slot") == "overview" }
        ?: children.firstOrNull { !it.text("slot").startsWith("summary-") && !it.text("slot").startsWith("panel-") }
    if (overview != null) {
        add(widthPx("22rem"), column(metadata.text("headerTitle"), "", r.render(overview, state, data)))
    }
    for ((i, info) in panelsInfo.withIndex()) {
        val content = children.firstOrNull { it.text("slot") == "panel-$i" } ?: continue
        val summary = PageSlots.foldoutSummary(children, i)?.let { node ->
            r.render(node, state, data).apply { foreground = uxMuted() }
        }
        add(widthPx(info.text("width", "22rem")),
            column(info.text("title", "Panel ${i + 1}"), info.text("subtitle"), r.render(content, state, data), summary))
    }
    val scroll = ContentHeightScrollPane(row)
    scroll.border = JBUI.Borders.empty()
    scroll.isOpaque = false
    scroll.viewport.isOpaque = false
    scroll.verticalScrollBarPolicy = javax.swing.ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER
    scroll.accessibleContext.accessibleName = metadata.text("headerTitle").ifBlank { "Record" }
    return scroll
}

/** Gantt: labels column + proportional bars over the tasks' date range, with a today marker. */
fun renderGantt(metadata: JsonNode, ctx: io.mateu.ijp.state.AppContext? = null): JComponent {
    val tasks = metadata.arr("tasks")
    if (tasks.isEmpty()) return JPanel().apply { isOpaque = false }
    val starts = tasks.mapNotNull { runCatching { LocalDate.parse(it.text("start")) }.getOrNull() }
    val ends = tasks.mapNotNull { runCatching { LocalDate.parse(it.text("end")) }.getOrNull() }
    val min = starts.minOrNull() ?: return JPanel()
    val max = ends.maxOrNull() ?: return JPanel()
    val span = ChronoUnit.DAYS.between(min, max).coerceAtLeast(1)

    val panel = object : JPanel() {
        override fun paintComponent(g: Graphics) {
            super.paintComponent(g)
            val g2 = g as Graphics2D
            val labelWidth = 130
            val rowHeight = 26
            val laneWidth = (width - labelWidth - 12).coerceAtLeast(60)
            g2.color = JBUI.CurrentTheme.Label.foreground()
            for ((i, task) in tasks.withIndex()) {
                val y = i * rowHeight
                g2.color = JBUI.CurrentTheme.Label.foreground()
                g2.drawString(task.text("title"), 4, y + 17)
                val s = runCatching { LocalDate.parse(task.text("start")) }.getOrNull() ?: continue
                val e = runCatching { LocalDate.parse(task.text("end")) }.getOrNull() ?: continue
                val x = labelWidth + (ChronoUnit.DAYS.between(min, s).toDouble() / span * laneWidth).toInt()
                val w = (ChronoUnit.DAYS.between(s, e).coerceAtLeast(1).toDouble() / span * laneWidth).toInt().coerceAtLeast(4)
                val color = runCatching { Color.decode(task.text("color")) }.getOrElse { Color(0x00, 0x70, 0xF3) }
                g2.color = Color(color.red, color.green, color.blue, 90)
                g2.fillRoundRect(x, y + 4, w, rowHeight - 10, 6, 6)
                g2.color = color
                val progress = task.path("progress").asInt(0).coerceIn(0, 100)
                g2.fillRoundRect(x, y + 4, (w * progress / 100.0).toInt(), rowHeight - 10, 6, 6)
            }
            // today marker
            val today = LocalDate.now()
            if (!today.isBefore(min) && !today.isAfter(max)) {
                val x = labelWidth + (ChronoUnit.DAYS.between(min, today).toDouble() / span * (width - labelWidth - 12)).toInt()
                g2.color = Color(0xD9, 0x30, 0x25)
                g2.drawLine(x, 0, x, tasks.size * rowHeight)
            }
        }
    }
    panel.isOpaque = false
    panel.preferredSize = Dimension(480, tasks.size * 26 + 8)
    // The rows are the minimum too: a JPanel's minimum is its (empty) layout's, i.e. nothing, so a
    // long page squeezed the whole chart to a 10px strip (see ContentHeightScrollPane). The width
    // may still shrink — the lanes scale to it (labelWidth + the 60px lane floor).
    panel.minimumSize = Dimension(130 + 60, tasks.size * 26 + 8)
    // A GanttPage selects a task (its drawer): a click on a row — or Up/Down + Enter — runs
    // onTaskSelectionActionId with the task id. It used to be paint-only here.
    val selectAction = metadata.text("onTaskSelectionActionId")
    if (ctx != null && selectAction.isNotBlank()) {
        var focused = 0
        val select = { i: Int ->
            tasks.getOrNull(i)?.text("id")?.takeIf { it.isNotBlank() }?.let {
                ctx.runAction(selectAction, mapOf("_clickedTaskId" to it))
            }
        }
        panel.cursor = java.awt.Cursor.getPredefinedCursor(java.awt.Cursor.HAND_CURSOR)
        panel.isFocusable = true
        panel.toolTipText = plainTip(tasks.getOrNull(0)?.text("title"))
        panel.accessibleContext.accessibleName = "Gantt — " + tasks.joinToString(", ") { it.text("title") }
        panel.addMouseListener(object : java.awt.event.MouseAdapter() {
            override fun mouseClicked(e: java.awt.event.MouseEvent) {
                panel.requestFocusInWindow()
                focused = (e.y / 26).coerceIn(0, tasks.size - 1)
                select(focused)
            }
        })
        panel.addKeyListener(object : java.awt.event.KeyAdapter() {
            override fun keyPressed(e: java.awt.event.KeyEvent) {
                when (e.keyCode) {
                    java.awt.event.KeyEvent.VK_DOWN -> focused = (focused + 1).coerceAtMost(tasks.size - 1)
                    java.awt.event.KeyEvent.VK_UP -> focused = (focused - 1).coerceAtLeast(0)
                    java.awt.event.KeyEvent.VK_ENTER, java.awt.event.KeyEvent.VK_SPACE -> { e.consume(); select(focused) }
                    else -> return
                }
                panel.toolTipText = plainTip(tasks.getOrNull(focused)?.text("title"))
                panel.accessibleContext.accessibleDescription = tasks.getOrNull(focused)?.text("title")
            }
        })
    }
    return panel
}

/** A standalone Image component (metadata.src — data URI or URL). */
fun renderStandaloneImage(metadata: JsonNode, style: String = ""): JComponent {
    val src = metadata.text("src")
    val svg = SvgImages.isSvg(src)
    // the image's CSS width / max-width (`max-width: 24rem`) caps it, as on the web; else 360px
    val capPx = JBUI.scale(cssPx(style, "width") ?: cssPx(style, "max-width") ?: 360)
    // the declared text alternative (Image.alt) is the accessible name a screen reader reads
    val alt = metadata.text("alt").trim()
    if (src.isBlank()) return JPanel().apply { isOpaque = false }
    fun iconOf(img: java.awt.image.BufferedImage): javax.swing.Icon {
        val scale = minOf(1.0, capPx.toDouble() / img.width)
        return javax.swing.ImageIcon(img.getScaledInstance(
            (img.width * scale).toInt().coerceAtLeast(1), (img.height * scale).toInt().coerceAtLeast(1), java.awt.Image.SCALE_SMOOTH))
    }
    // An image Swing cannot decode (a broken url, an unreachable host): a named placeholder. It used to be the
    // src itself — a data URI dumped as a wall of base64 across the page.
    val shown = if (src.startsWith("data:")) src.substringBefore(";").substringBefore(",").removePrefix("data:") else src
    val label = JBLabel(plain("🖼 ${alt.ifEmpty { shown }}"))
    label.foreground = ToneColors.secondaryText()
    label.toolTipText = plainTip(alt.ifEmpty { shown })
    label.accessibleContext.accessibleName = alt.ifEmpty { "Image" }
    fun show(img: java.awt.image.BufferedImage) {
        label.text = null
        label.foreground = null
        label.icon = iconOf(img)
        label.revalidate()
        label.repaint()
    }
    if (src.startsWith("data:")) {
        // an SVG data URI may be percent-encoded instead of base64
        (if (svg) SvgImages.dataUriBytes(src) else runCatching { java.util.Base64.getDecoder().decode(src.substringAfter("base64,", "")) }.getOrNull())
            ?.let { decodeImage(it, svg) }?.let(::show)
    } else if (isRemoteImage(src)) {
        // Off the EDT: the url used to be fetched WHILE rendering, so a slow image host froze the
        // whole IDE until it answered (or timed out). Meanwhile a short status, not the raw url.
        label.text = plain(if (alt.isNotEmpty()) "🖼 $alt" else "Loading image…")
        Thread {
            // SVGs (ImageIO reads none) through the platform's SVG renderer
            val img = runCatching { java.net.URI.create(src.trim()).toURL().openStream().use { it.readBytes() } }.getOrNull()
                ?.let { decodeImage(it, svg) }
            javax.swing.SwingUtilities.invokeLater {
                if (img != null) show(img) else if (alt.isEmpty()) label.text = "Image unavailable"
            }
        }.apply { isDaemon = true; name = "mateu-image" }.start()
    }
    return label
}
